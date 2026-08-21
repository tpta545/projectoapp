import type { SupabaseClient } from "@supabase/supabase-js";
import { crearEmbedding } from "@/lib/ia/embeddings";
import { auditarCalidadPregunta } from "@/lib/ia/auditorCalidad";
import { verificarPreguntaCiega } from "@/lib/ia/verificadorCiego";
import type { PreguntaGenerada } from "@/lib/ia/tipos";
import type { Database, Dificultad, Oposicion, Opcion } from "@/types/db";
import { validarCapa0 } from "./capa0Deterministica";

type Cliente = SupabaseClient<Database>;

export interface ResultadoValidacionPregunta {
  preguntaId: string;
  aprobada: boolean;
  motivoDescarte?: string;
  capaDescarte?: 0 | 1 | 2;
}

function barajarOpcionesSinPistas(opciones: Opcion[]): Opcion[] {
  const copia = [...opciones];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copia[i]!;
    copia[i] = copia[j]!;
    copia[j] = temp;
  }
  return copia;
}

/**
 * Valida y persiste UNA pregunta candidata a través de las capas 0, 1 y 2.
 * Se detiene en el primer descarte. Escribe siempre la fila `preguntas` (en
 * `borrador` si se descarta, en `validada` si supera las tres capas) y una
 * fila `validaciones` por cada capa evaluada, para trazabilidad completa.
 */
export async function validarYGuardarPregunta(params: {
  supabase: Cliente;
  candidata: PreguntaGenerada;
  fragmentoId: string;
  fragmentoTexto: string;
  documentoId: string;
  temaId: string | null;
  oposicion: Oposicion;
  dificultad: Dificultad;
  umbralSimilitudOpciones: number;
  umbralSimilitudSemantica: number;
  puntuacionMinimaAuditor: number;
}): Promise<ResultadoValidacionPregunta> {
  const { supabase, candidata, fragmentoTexto } = params;

  const embedding = await crearEmbedding(`${candidata.enunciado} ${candidata.opciones.map((o) => o.texto).join(" ")}`);

  const { data: preguntaInsertada, error: errorInsercion } = await supabase
    .from("preguntas")
    .insert({
      documento_id: params.documentoId,
      fragmento_id: params.fragmentoId,
      tema_id: params.temaId,
      oposicion: params.oposicion,
      enunciado: candidata.enunciado,
      opciones: candidata.opciones,
      respuesta_correcta: candidata.respuestaCorrecta,
      explicacion: candidata.explicacion,
      dificultad: params.dificultad,
      estado: "borrador",
      embedding,
      veces_servida: 0,
      veces_impugnada: 0,
    })
    .select("id")
    .single();

  if (errorInsercion || !preguntaInsertada) {
    throw new Error(`No se pudo guardar la pregunta candidata: ${errorInsercion?.message}`);
  }

  const preguntaId = preguntaInsertada.id as string;

  async function registrarValidacion(
    capa: 0 | 1 | 2,
    veredicto: "aprobada" | "descartada",
    extra: { motivo_descarte?: string; frase_citada?: string; puntuacion?: number } = {}
  ) {
    await supabase.from("validaciones").insert({
      pregunta_id: preguntaId,
      capa,
      veredicto,
      motivo_descarte: extra.motivo_descarte ?? null,
      frase_citada: extra.frase_citada ?? null,
      puntuacion: extra.puntuacion ?? null,
    });
  }

  async function descartar(capa: 0 | 1 | 2, motivo: string): Promise<ResultadoValidacionPregunta> {
    await registrarValidacion(capa, "descartada", { motivo_descarte: motivo });
    return { preguntaId, aprobada: false, motivoDescarte: motivo, capaDescarte: capa };
  }

  // ── CAPA 0a: comprobaciones deterministas puras ────────────────────────
  const resultadoCapa0 = validarCapa0({
    enunciado: candidata.enunciado,
    opciones: candidata.opciones,
    respuestaCorrecta: candidata.respuestaCorrecta,
    explicacion: candidata.explicacion,
    fragmento: fragmentoTexto,
    umbralSimilitudOpciones: params.umbralSimilitudOpciones,
  });
  if (!resultadoCapa0.aprobada) {
    return descartar(0, resultadoCapa0.motivo ?? "Descartada en capa 0.");
  }

  // ── CAPA 0b: duplicado semántico con preguntas ya validadas/publicadas ──
  const { data: similares } = await supabase.rpc("preguntas_similares_embedding", {
    p_documento_id: params.documentoId,
    p_embedding: embedding,
    p_umbral: params.umbralSimilitudSemantica,
  });
  if (similares && similares.length > 0) {
    return descartar(
      0,
      `Similitud semántica ${similares[0]!.similitud.toFixed(2)} con la pregunta ya validada "${similares[0]!.enunciado.slice(0, 80)}...".`
    );
  }
  await registrarValidacion(0, "aprobada");

  // ── CAPA 1: verificador ciego ────────────────────────────────────────────
  const opcionesDesordenadas = barajarOpcionesSinPistas(candidata.opciones);
  const veredictoCiego = await verificarPreguntaCiega({
    fragmento: fragmentoTexto,
    enunciado: candidata.enunciado,
    opcionesDesordenadas,
  });

  if (!veredictoCiego.puedeResponderse) {
    return descartar(1, "El verificador ciego declara que la pregunta no puede responderse solo con el fragmento.");
  }
  if (!veredictoCiego.opcionElegida || veredictoCiego.opcionElegida !== candidata.respuestaCorrecta) {
    return descartar(
      1,
      `El verificador ciego eligió "${veredictoCiego.opcionElegida ?? "ninguna"}" en vez de "${candidata.respuestaCorrecta}".`
    );
  }
  const fraseNormalizada = veredictoCiego.fraseLiteral?.toLowerCase().replace(/\s+/g, " ").trim() ?? "";
  const fragmentoNormalizado = fragmentoTexto.toLowerCase().replace(/\s+/g, " ").trim();
  if (!fraseNormalizada || !fragmentoNormalizado.includes(fraseNormalizada)) {
    return descartar(1, "El verificador ciego no citó una frase literal contenida en el fragmento.");
  }
  await registrarValidacion(1, "aprobada", { frase_citada: veredictoCiego.fraseLiteral ?? undefined });

  // ── CAPA 2: auditor de calidad ───────────────────────────────────────────
  const auditoria = await auditarCalidadPregunta({
    fragmento: fragmentoTexto,
    enunciado: candidata.enunciado,
    opciones: candidata.opciones,
  });
  if (auditoria.puntuacion < params.puntuacionMinimaAuditor) {
    return descartar(2, `Puntuación ${auditoria.puntuacion}/5: ${auditoria.motivo}`);
  }
  await registrarValidacion(2, "aprobada", { puntuacion: auditoria.puntuacion });

  // ── Todas las capas superadas ────────────────────────────────────────────
  await supabase.from("preguntas").update({ estado: "validada" }).eq("id", preguntaId);

  return { preguntaId, aprobada: true };
}

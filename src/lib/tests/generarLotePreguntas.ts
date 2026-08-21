import type { SupabaseClient } from "@supabase/supabase-js";
import { generarPreguntasDesdeFragmento } from "@/lib/ia/generarPreguntas";
import { validarYGuardarPregunta } from "@/lib/validacion/pipeline";
import { seleccionarLoteEquilibrado } from "@/lib/validacion/sesgoLongitudYLetra";
import type { Ajustes } from "@/lib/dominio/ajustes";
import type {
  Database,
  Dificultad,
  DificultadTest,
  EstadoPregunta,
  Letra,
  Opcion,
  Oposicion,
} from "@/types/db";

type Cliente = SupabaseClient<Database>;

interface PreguntaDisponible {
  id: string;
  opciones: Opcion[];
  respuestaCorrecta: Letra;
  vecesServida: number;
  estado: EstadoPregunta;
}

const CONCURRENCIA_GENERACION = 20;
const MAX_RONDAS = 2;

function elegirAleatorio<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function dificultadParaFragmento(dificultad: DificultadTest): Dificultad {
  if (dificultad !== "mixta") return dificultad;
  return elegirAleatorio<Dificultad>(["facil", "media", "dificil"]);
}

async function obtenerPoolCache(params: {
  supabase: Cliente;
  documentoId: string;
  dificultad: DificultadTest;
  limite: number;
}): Promise<PreguntaDisponible[]> {
  let consulta = params.supabase
    .from("preguntas")
    .select("id, opciones, respuesta_correcta, veces_servida, estado")
    .eq("documento_id", params.documentoId)
    .in("estado", ["validada", "publicada"])
    .order("veces_servida", { ascending: true })
    .limit(params.limite * 3); // margen para poder barajar dentro del propio pool

  if (params.dificultad !== "mixta") {
    consulta = consulta.eq("dificultad", params.dificultad);
  }

  const { data } = await consulta;
  if (!data) return [];

  return data.map((p) => ({
    id: p.id,
    opciones: p.opciones as unknown as Opcion[],
    respuestaCorrecta: p.respuesta_correcta as Letra,
    vecesServida: p.veces_servida,
    estado: p.estado,
  }));
}

/**
 * Reúne hasta `numPreguntas` preguntas ya validadas para un documento: primero
 * reutiliza el colchón cacheado y, si el plan lo permite y sigue faltando,
 * genera y valida más en tiempo real (N*factor, en paralelo, hasta 2 lotes).
 */
export async function generarLotePreguntas(params: {
  supabase: Cliente;
  documentoId: string;
  oposicion: Oposicion;
  dificultad: DificultadTest;
  numPreguntas: number;
  permiteGeneracionEnVivo: boolean;
  ajustes: Ajustes;
}): Promise<{ seleccionadas: (PreguntaDisponible & { opcionesMostradas: Opcion[] })[] }> {
  const { supabase, documentoId, oposicion, dificultad, numPreguntas, permiteGeneracionEnVivo, ajustes } = params;

  const cache = await obtenerPoolCache({ supabase, documentoId, dificultad, limite: numPreguntas });
  const pool = new Map<string, PreguntaDisponible>();
  for (const p of cache) pool.set(p.id, p);

  if (permiteGeneracionEnVivo && pool.size < numPreguntas) {
    const { data: fragmentos } = await supabase
      .from("fragmentos")
      .select("id, contenido, tema_id")
      .eq("documento_id", documentoId);

    if (fragmentos && fragmentos.length > 0) {
      for (let ronda = 0; ronda < MAX_RONDAS && pool.size < numPreguntas; ronda++) {
        const faltantes = numPreguntas - pool.size;
        const aGenerar = Math.ceil(faltantes * ajustes.factor_sobregeneracion);
        const tareas = Array.from({ length: aGenerar }, () => ({
          fragmento: elegirAleatorio(fragmentos),
          dificultad: dificultadParaFragmento(dificultad),
        }));

        for (let i = 0; i < tareas.length; i += CONCURRENCIA_GENERACION) {
          if (pool.size >= numPreguntas) break;
          const lote = tareas.slice(i, i + CONCURRENCIA_GENERACION);
          const resultados = await Promise.all(
            lote.map(async ({ fragmento, dificultad: dificultadFragmento }) => {
              try {
                const [candidata] = await generarPreguntasDesdeFragmento({
                  fragmento: fragmento.contenido,
                  cantidad: 1,
                  dificultad: dificultadFragmento,
                  oposicion,
                });
                if (!candidata) return null;

                const resultado = await validarYGuardarPregunta({
                  supabase,
                  candidata,
                  fragmentoId: fragmento.id,
                  fragmentoTexto: fragmento.contenido,
                  documentoId,
                  temaId: fragmento.tema_id,
                  oposicion,
                  dificultad: dificultadFragmento,
                  umbralSimilitudOpciones: ajustes.umbral_similitud_opciones,
                  umbralSimilitudSemantica: ajustes.umbral_similitud_semantica_preguntas,
                  puntuacionMinimaAuditor: ajustes.puntuacion_minima_auditor,
                });
                if (!resultado.aprobada) return null;

                return {
                  id: resultado.preguntaId,
                  opciones: candidata.opciones,
                  respuestaCorrecta: candidata.respuestaCorrecta,
                  vecesServida: 0,
                  estado: "validada",
                } satisfies PreguntaDisponible;
              } catch {
                return null;
              }
            })
          );
          for (const r of resultados) {
            if (r) pool.set(r.id, r);
          }
        }
      }
    }
  }

  const candidatas = [...pool.values()];
  const { seleccionadas } = seleccionarLoteEquilibrado(candidatas, Math.min(numPreguntas, candidatas.length));

  return { seleccionadas };
}

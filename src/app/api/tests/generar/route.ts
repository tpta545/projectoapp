import { NextResponse } from "next/server";
import { z } from "zod";
import { obtenerUsuarioAutenticado } from "@/lib/auth/requireUser";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { obtenerAjustes } from "@/lib/dominio/ajustes";
import { generarLotePreguntas } from "@/lib/tests/generarLotePreguntas";

export const maxDuration = 60;

const EsquemaBody = z.object({
  documentoId: z.string().uuid(),
  numPreguntas: z.union([z.literal(10), z.literal(25), z.literal(50)]),
  dificultad: z.enum(["facil", "media", "dificil", "mixta"]),
  activarTemporizador: z.boolean().optional().default(false),
});

function inicioDeHoyISO(): string {
  const ahora = new Date();
  return new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()).toISOString();
}

export async function POST(request: Request) {
  const usuario = await obtenerUsuarioAutenticado();
  if (!usuario) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const cuerpo = EsquemaBody.safeParse(await request.json());
  if (!cuerpo.success) {
    return NextResponse.json({ error: "Datos de configuración de test no válidos." }, { status: 400 });
  }
  const { documentoId, numPreguntas, dificultad, activarTemporizador } = cuerpo.data;

  const supabase = crearClienteAdmin();

  const { data: documento } = await supabase
    .from("documentos")
    .select("id, usuario_id, oposicion, estado")
    .eq("id", documentoId)
    .single();
  if (!documento || documento.usuario_id !== usuario.id) {
    return NextResponse.json({ error: "Documento no encontrado." }, { status: 404 });
  }
  if (documento.estado !== "listo") {
    return NextResponse.json(
      { error: "El documento todavía se está procesando. Inténtalo en unos segundos." },
      { status: 409 }
    );
  }

  const { data: tema } = await supabase
    .from("temas")
    .select("id")
    .eq("documento_id", documentoId)
    .limit(1)
    .maybeSingle();

  const { data: perfil } = await supabase.from("perfiles").select("plan").eq("id", usuario.id).single();
  const plan = perfil?.plan ?? "gratis";
  const { data: limite } = await supabase
    .from("limites_plan")
    .select("preguntas_dia_max")
    .eq("plan", plan)
    .single();

  let numPreguntasPermitidas: number = numPreguntas;
  if (limite?.preguntas_dia_max != null) {
    const { data: testsHoy } = await supabase
      .from("tests")
      .select("num_preguntas")
      .eq("usuario_id", usuario.id)
      .gte("iniciado_en", inicioDeHoyISO());
    const yaConsumidas = (testsHoy ?? []).reduce((suma, t) => suma + t.num_preguntas, 0);
    const restantes = Math.max(0, limite.preguntas_dia_max - yaConsumidas);
    if (restantes <= 0) {
      return NextResponse.json(
        { error: `Has alcanzado tu límite diario de ${limite.preguntas_dia_max} preguntas del plan gratuito.` },
        { status: 403 }
      );
    }
    numPreguntasPermitidas = Math.min(numPreguntas, restantes);
  }

  const ajustes = await obtenerAjustes();
  const permiteGeneracionEnVivo = plan !== "gratis";

  const { seleccionadas } = await generarLotePreguntas({
    supabase,
    documentoId,
    oposicion: documento.oposicion,
    dificultad,
    numPreguntas: numPreguntasPermitidas,
    permiteGeneracionEnVivo,
    ajustes,
  });

  if (seleccionadas.length === 0) {
    return NextResponse.json(
      {
        error:
          "Todavía no hay preguntas validadas para este documento. Espera a que termine de procesarse o inténtalo de nuevo en un momento.",
      },
      { status: 409 }
    );
  }

  const { data: testInsertado, error: errorTest } = await supabase
    .from("tests")
    .insert({
      usuario_id: usuario.id,
      documento_id: documentoId,
      tema_id: tema?.id ?? null,
      oposicion: documento.oposicion,
      num_preguntas: numPreguntas,
      dificultad,
      tiempo_limite_segundos: activarTemporizador
        ? seleccionadas.length * ajustes.tiempo_por_pregunta_segundos_defecto
        : null,
      penalizacion_fraccion: ajustes.penalizacion_fraccion_defecto,
      estado: "en_curso",
      puntuacion: null,
      finalizado_en: null,
    })
    .select("id")
    .single();

  if (errorTest || !testInsertado) {
    return NextResponse.json({ error: "No se pudo crear el test." }, { status: 500 });
  }

  const filasTestPreguntas = seleccionadas.map((pregunta, indice) => ({
    test_id: testInsertado.id as string,
    pregunta_id: pregunta.id,
    orden: indice,
    opciones_mostradas: pregunta.opcionesMostradas,
    respuesta_usuario: null,
    es_correcta: null,
    tiempo_respuesta_segundos: null,
  }));

  await supabase.from("test_preguntas").insert(filasTestPreguntas);

  for (const pregunta of seleccionadas) {
    await supabase
      .from("preguntas")
      .update({
        veces_servida: pregunta.vecesServida + 1,
        estado: pregunta.estado === "validada" ? "publicada" : pregunta.estado,
      })
      .eq("id", pregunta.id);
  }

  return NextResponse.json({
    testId: testInsertado.id,
    preguntasServidas: seleccionadas.length,
    preguntasSolicitadas: numPreguntas,
  });
}

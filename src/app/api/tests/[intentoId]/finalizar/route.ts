import { NextResponse } from "next/server";
import { z } from "zod";
import { obtenerUsuarioAutenticado } from "@/lib/auth/requireUser";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import type { Letra, Opcion } from "@/types/db";

const EsquemaBody = z.object({
  respuestas: z.array(
    z.object({
      testPreguntaId: z.string().uuid(),
      respuesta: z.enum(["A", "B", "C", "D"]).nullable(),
      tiempoRespuestaSegundos: z.number().int().nonnegative().optional(),
    })
  ),
});

export async function POST(request: Request, { params }: { params: Promise<{ intentoId: string }> }) {
  const usuario = await obtenerUsuarioAutenticado();
  if (!usuario) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const { intentoId } = await params;
  const cuerpo = EsquemaBody.safeParse(await request.json());
  if (!cuerpo.success) {
    return NextResponse.json({ error: "Respuestas no válidas." }, { status: 400 });
  }

  const supabase = crearClienteAdmin();

  const { data: test } = await supabase.from("tests").select("*").eq("id", intentoId).single();
  if (!test || test.usuario_id !== usuario.id) {
    return NextResponse.json({ error: "Test no encontrado." }, { status: 404 });
  }
  if (test.estado === "finalizado") {
    return NextResponse.json({ error: "Este test ya se finalizó." }, { status: 409 });
  }

  const { data: testPreguntas } = await supabase
    .from("test_preguntas")
    .select("id, pregunta_id, opciones_mostradas")
    .eq("test_id", intentoId);
  if (!testPreguntas || testPreguntas.length === 0) {
    return NextResponse.json({ error: "El test no tiene preguntas." }, { status: 500 });
  }

  const { data: preguntas } = await supabase
    .from("preguntas")
    .select("id, opciones, respuesta_correcta")
    .in(
      "id",
      testPreguntas.map((tp) => tp.pregunta_id)
    );
  const preguntasPorId = new Map((preguntas ?? []).map((p) => [p.id, p]));
  const respuestasPorTestPregunta = new Map(cuerpo.data.respuestas.map((r) => [r.testPreguntaId, r]));

  let correctas = 0;
  let incorrectas = 0;
  let sinResponder = 0;

  for (const tp of testPreguntas) {
    const pregunta = preguntasPorId.get(tp.pregunta_id);
    if (!pregunta) continue;

    const opcionesMostradas = tp.opciones_mostradas as unknown as Opcion[];
    const opcionesOriginales = pregunta.opciones as unknown as Opcion[];
    const textoCorrecta = opcionesOriginales.find(
      (o) => o.letra === (pregunta.respuesta_correcta as Letra)
    )?.texto;
    const letraCorrectaMostrada = opcionesMostradas.find((o) => o.texto === textoCorrecta)?.letra ?? null;

    const respuesta = respuestasPorTestPregunta.get(tp.id);
    const respuestaUsuario = respuesta?.respuesta ?? null;
    const esCorrecta = respuestaUsuario != null && respuestaUsuario === letraCorrectaMostrada;

    if (respuestaUsuario == null) sinResponder++;
    else if (esCorrecta) correctas++;
    else incorrectas++;

    await supabase
      .from("test_preguntas")
      .update({
        respuesta_usuario: respuestaUsuario,
        es_correcta: respuestaUsuario == null ? null : esCorrecta,
        tiempo_respuesta_segundos: respuesta?.tiempoRespuestaSegundos ?? null,
      })
      .eq("id", tp.id);
  }

  const total = testPreguntas.length;
  const puntuacion =
    total === 0 ? 0 : Math.max(0, ((correctas - incorrectas * test.penalizacion_fraccion) / total) * 10);

  await supabase
    .from("tests")
    .update({
      estado: "finalizado",
      puntuacion: Math.round(puntuacion * 100) / 100,
      finalizado_en: new Date().toISOString(),
    })
    .eq("id", intentoId);

  return NextResponse.json({
    puntuacion: Math.round(puntuacion * 100) / 100,
    correctas,
    incorrectas,
    sinResponder,
    total,
  });
}

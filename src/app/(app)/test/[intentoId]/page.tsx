import { notFound, redirect } from "next/navigation";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { crearClienteServidor } from "@/lib/supabase/server";
import { RealizarTest } from "@/components/test/RealizarTest";
import type { Opcion } from "@/types/db";

export default async function PaginaRealizarTest({ params }: { params: Promise<{ intentoId: string }> }) {
  const { intentoId } = await params;
  const supabaseSesion = await crearClienteServidor();
  const {
    data: { user },
  } = await supabaseSesion.auth.getUser();
  if (!user) return null;

  const supabase = crearClienteAdmin();
  const { data: test } = await supabase.from("tests").select("*").eq("id", intentoId).single();
  if (!test || test.usuario_id !== user.id) notFound();
  if (test.estado === "finalizado") redirect(`/test/${intentoId}/resultado`);

  const { data: filas } = await supabase
    .from("test_preguntas")
    .select("id, orden, opciones_mostradas, respuesta_usuario, preguntas(enunciado)")
    .eq("test_id", intentoId)
    .order("orden", { ascending: true });

  const preguntas = (filas ?? []).map((f) => ({
    testPreguntaId: f.id,
    enunciado: (f.preguntas as unknown as { enunciado: string } | null)?.enunciado ?? "",
    opciones: f.opciones_mostradas as unknown as Opcion[],
    respuestaGuardada: f.respuesta_usuario,
  }));

  return (
    <RealizarTest
      testId={intentoId}
      tiempoLimiteSegundos={test.tiempo_limite_segundos}
      preguntas={preguntas}
    />
  );
}

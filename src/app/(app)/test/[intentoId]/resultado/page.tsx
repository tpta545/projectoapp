import { notFound, redirect } from "next/navigation";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { crearClienteServidor } from "@/lib/supabase/server";
import { CorreccionTest } from "@/components/test/CorreccionTest";
import type { Letra, Opcion } from "@/types/db";

interface PreguntaAnidada {
  id: string;
  enunciado: string;
  opciones: Opcion[];
  respuesta_correcta: Letra;
  explicacion: string;
  fragmentos: { contenido: string; pagina_inicio: number | null; pagina_fin: number | null } | null;
}

export default async function PaginaResultadoTest({ params }: { params: Promise<{ intentoId: string }> }) {
  const { intentoId } = await params;
  const supabaseSesion = await crearClienteServidor();
  const {
    data: { user },
  } = await supabaseSesion.auth.getUser();
  if (!user) return null;

  const supabase = crearClienteAdmin();
  const { data: test } = await supabase.from("tests").select("*").eq("id", intentoId).single();
  if (!test || test.usuario_id !== user.id) notFound();
  if (test.estado !== "finalizado") redirect(`/test/${intentoId}`);

  const { data: filas } = await supabase
    .from("test_preguntas")
    .select(
      "id, orden, opciones_mostradas, respuesta_usuario, es_correcta, preguntas(id, enunciado, opciones, respuesta_correcta, explicacion, fragmentos(contenido, pagina_inicio, pagina_fin))"
    )
    .eq("test_id", intentoId)
    .order("orden", { ascending: true });

  const preguntas = (filas ?? []).map((f) => {
    const pregunta = f.preguntas as unknown as PreguntaAnidada | null;
    const opcionesMostradas = f.opciones_mostradas as unknown as Opcion[];
    const textoCorrecta = pregunta?.opciones.find((o) => o.letra === pregunta.respuesta_correcta)?.texto;
    const letraCorrectaMostrada = opcionesMostradas.find((o) => o.texto === textoCorrecta)?.letra ?? null;

    return {
      preguntaId: pregunta?.id ?? "",
      enunciado: pregunta?.enunciado ?? "",
      opcionesMostradas,
      letraCorrectaMostrada,
      respuestaUsuario: f.respuesta_usuario as Letra | null,
      esCorrecta: f.es_correcta,
      explicacion: pregunta?.explicacion ?? "",
      fragmentoTexto: pregunta?.fragmentos?.contenido ?? "",
      paginaInicio: pregunta?.fragmentos?.pagina_inicio ?? null,
      paginaFin: pregunta?.fragmentos?.pagina_fin ?? null,
    };
  });

  const correctas = preguntas.filter((p) => p.esCorrecta === true).length;
  const incorrectas = preguntas.filter((p) => p.esCorrecta === false).length;
  const sinResponder = preguntas.filter((p) => p.respuestaUsuario == null).length;

  return (
    <CorreccionTest
      puntuacion={test.puntuacion ?? 0}
      correctas={correctas}
      incorrectas={incorrectas}
      sinResponder={sinResponder}
      preguntas={preguntas}
    />
  );
}

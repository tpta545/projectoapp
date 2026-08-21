import { crearClienteAdmin } from "@/lib/supabase/admin";
import { crearClienteServidor } from "@/lib/supabase/server";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { TarjetaPreguntaCorregida } from "@/components/test/TarjetaPreguntaCorregida";
import type { Letra, Opcion } from "@/types/db";

interface PreguntaAnidada {
  id: string;
  enunciado: string;
  opciones: Opcion[];
  respuesta_correcta: Letra;
  explicacion: string;
  fragmentos: { contenido: string; pagina_inicio: number | null; pagina_fin: number | null } | null;
}

export default async function PaginaRepasoFallos() {
  const supabaseSesion = await crearClienteServidor();
  const {
    data: { user },
  } = await supabaseSesion.auth.getUser();
  if (!user) return null;

  const supabase = crearClienteAdmin();

  const { data: testsUsuario } = await supabase.from("tests").select("id").eq("usuario_id", user.id);
  const idsTests = (testsUsuario ?? []).map((t) => t.id);

  const filas =
    idsTests.length > 0
      ? (
          await supabase
            .from("test_preguntas")
            .select(
              "id, respuesta_usuario, preguntas(id, enunciado, opciones, respuesta_correcta, explicacion, fragmentos(contenido, pagina_inicio, pagina_fin))"
            )
            .in("test_id", idsTests)
            .eq("es_correcta", false)
        ).data
      : [];

  const porPregunta = new Map<string, NonNullable<typeof filas>[number]>();
  for (const fila of filas ?? []) {
    const pregunta = fila.preguntas as unknown as PreguntaAnidada | null;
    if (pregunta && !porPregunta.has(pregunta.id)) porPregunta.set(pregunta.id, fila);
  }

  const preguntas = [...porPregunta.values()].map((fila) => {
    const pregunta = fila.preguntas as unknown as PreguntaAnidada;
    const textoCorrecta = pregunta.opciones.find((o) => o.letra === pregunta.respuesta_correcta)?.texto;
    return {
      preguntaId: pregunta.id,
      enunciado: pregunta.enunciado,
      opcionesMostradas: pregunta.opciones,
      letraCorrectaMostrada:
        pregunta.opciones.find((o) => o.texto === textoCorrecta)?.letra ?? pregunta.respuesta_correcta,
      respuestaUsuario: fila.respuesta_usuario as Letra | null,
      esCorrecta: false,
      explicacion: pregunta.explicacion,
      fragmentoTexto: pregunta.fragmentos?.contenido ?? "",
      paginaInicio: pregunta.fragmentos?.pagina_inicio ?? null,
      paginaFin: pregunta.fragmentos?.pagina_fin ?? null,
    };
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Repasar mis fallos</h1>

      {preguntas.length > 0 ? (
        <div className="flex flex-col gap-3">
          {preguntas.map((p, indice) => (
            <TarjetaPreguntaCorregida key={p.preguntaId} pregunta={p} numero={indice + 1} />
          ))}
        </div>
      ) : (
        <Tarjeta>
          <p className="text-sm text-[var(--color-texto-suave)]">
            Todavía no tienes preguntas falladas que repasar. ¡Sigue así!
          </p>
        </Tarjeta>
      )}
    </div>
  );
}

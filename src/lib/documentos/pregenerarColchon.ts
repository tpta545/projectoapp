import { crearClienteAdmin } from "@/lib/supabase/admin";
import { generarPreguntasDesdeFragmento } from "@/lib/ia/generarPreguntas";
import { validarYGuardarPregunta } from "@/lib/validacion/pipeline";
import { obtenerAjustes } from "@/lib/dominio/ajustes";
import type { Dificultad } from "@/types/db";

const DIFICULTADES: Dificultad[] = ["facil", "media", "dificil"];
const CONCURRENCIA = 5;

/**
 * Genera y valida en segundo plano un colchón de preguntas por documento,
 * repartidas entre dificultades, para que la primera generación de test del
 * usuario ya pueda servirse desde caché sin esperar a la IA.
 */
export async function pregenerarColchon(documentoId: string): Promise<void> {
  const supabase = crearClienteAdmin();
  const ajustes = await obtenerAjustes();

  const { data: documento } = await supabase
    .from("documentos")
    .select("oposicion")
    .eq("id", documentoId)
    .single();
  if (!documento) return;

  const { data: fragmentos } = await supabase
    .from("fragmentos")
    .select("id, contenido, tema_id")
    .eq("documento_id", documentoId)
    .order("orden", { ascending: true });
  if (!fragmentos || fragmentos.length === 0) return;

  const tareas: { fragmento: (typeof fragmentos)[number]; dificultad: Dificultad }[] = [];
  for (const dificultad of DIFICULTADES) {
    for (const fragmento of fragmentos) {
      tareas.push({ fragmento, dificultad });
    }
  }

  let generadas = 0;
  for (let i = 0; i < tareas.length && generadas < ajustes.colchon_min_por_tema; i += CONCURRENCIA) {
    const lote = tareas.slice(i, i + CONCURRENCIA);
    const resultados = await Promise.all(
      lote.map(async ({ fragmento, dificultad }) => {
        try {
          const candidatas = await generarPreguntasDesdeFragmento({
            fragmento: fragmento.contenido,
            cantidad: 1,
            dificultad,
            oposicion: documento.oposicion,
          });
          let aprobadasFragmento = 0;
          for (const candidata of candidatas) {
            const resultado = await validarYGuardarPregunta({
              supabase,
              candidata,
              fragmentoId: fragmento.id,
              fragmentoTexto: fragmento.contenido,
              documentoId,
              temaId: fragmento.tema_id,
              oposicion: documento.oposicion,
              dificultad,
              umbralSimilitudOpciones: ajustes.umbral_similitud_opciones,
              umbralSimilitudSemantica: ajustes.umbral_similitud_semantica_preguntas,
              puntuacionMinimaAuditor: ajustes.puntuacion_minima_auditor,
            });
            if (resultado.aprobada) aprobadasFragmento++;
          }
          return aprobadasFragmento;
        } catch {
          return 0;
        }
      })
    );
    generadas += resultados.reduce((suma, n) => suma + n, 0);
  }
}

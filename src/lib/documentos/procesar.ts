import { crearClienteAdmin } from "@/lib/supabase/admin";
import { extraerTextoPdf } from "@/lib/pdf/extraerTexto";
import { trocearTexto } from "@/lib/pdf/trocear";
import { crearEmbeddings } from "@/lib/ia/embeddings";
import { pregenerarColchon } from "./pregenerarColchon";

const TAMANO_LOTE_INSERCION = 50;

/**
 * Pipeline de ingesta de un documento: descarga el PDF, extrae texto, trocea
 * en fragmentos con solapamiento, calcula embeddings y los guarda. Al acabar,
 * lanza en segundo plano la pregeneración del colchón de preguntas validadas.
 * Pensado para ejecutarse en `after()` tras responder la subida al usuario.
 */
export async function procesarDocumento(documentoId: string): Promise<void> {
  const supabase = crearClienteAdmin();

  const { data: documento } = await supabase
    .from("documentos")
    .select("*")
    .eq("id", documentoId)
    .single();
  if (!documento) return;

  try {
    await supabase.from("documentos").update({ estado: "procesando" }).eq("id", documentoId);

    const { data: archivo, error: errorDescarga } = await supabase.storage
      .from("documentos")
      .download(documento.storage_path);
    if (errorDescarga || !archivo) {
      throw new Error(errorDescarga?.message ?? "No se pudo descargar el PDF del almacenamiento.");
    }

    const bytes = new Uint8Array(await archivo.arrayBuffer());
    const extraido = await extraerTextoPdf(bytes);
    const fragmentosTroceados = trocearTexto(extraido);

    if (fragmentosTroceados.length === 0) {
      throw new Error(
        "No se pudo extraer texto legible del PDF. Si es un documento escaneado como imagen, esta fase no soporta OCR."
      );
    }

    const { data: tema } = await supabase
      .from("temas")
      .select("id")
      .eq("documento_id", documentoId)
      .limit(1)
      .maybeSingle();

    const embeddings = await crearEmbeddings(fragmentosTroceados.map((f) => f.contenido));

    const filas = fragmentosTroceados.map((f, indice) => ({
      documento_id: documentoId,
      tema_id: tema?.id ?? null,
      contenido: f.contenido,
      pagina_inicio: f.paginaInicio,
      pagina_fin: f.paginaFin,
      orden: f.orden,
      embedding: embeddings[indice] ?? null,
    }));

    for (let i = 0; i < filas.length; i += TAMANO_LOTE_INSERCION) {
      const lote = filas.slice(i, i + TAMANO_LOTE_INSERCION);
      const { error: errorInsercion } = await supabase.from("fragmentos").insert(lote);
      if (errorInsercion) throw new Error(errorInsercion.message);
    }

    await supabase
      .from("documentos")
      .update({
        estado: "listo",
        num_paginas: extraido.totalPaginas,
        procesado_en: new Date().toISOString(),
      })
      .eq("id", documentoId);

    // Mejor esfuerzo: si falla, el usuario podrá generar preguntas al vuelo igualmente.
    await pregenerarColchon(documentoId).catch(() => undefined);
  } catch (err) {
    await supabase
      .from("documentos")
      .update({
        estado: "error",
        error_mensaje: err instanceof Error ? err.message : "Error desconocido al procesar el documento.",
      })
      .eq("id", documentoId);
  }
}

import { extractText, getDocumentProxy } from "unpdf";

export interface PaginaExtraida {
  numero: number;
  texto: string;
}

export interface TextoExtraido {
  totalPaginas: number;
  paginas: PaginaExtraida[];
}

/** Extrae el texto de un PDF página a página, sin interpretación ni resumen. */
export async function extraerTextoPdf(bytes: Uint8Array): Promise<TextoExtraido> {
  const documento = await getDocumentProxy(bytes);
  const { totalPages, text } = await extractText(documento, { mergePages: false });
  const paginasTexto = Array.isArray(text) ? text : [text];

  return {
    totalPaginas: totalPages,
    paginas: paginasTexto.map((texto, indice) => ({ numero: indice + 1, texto })),
  };
}

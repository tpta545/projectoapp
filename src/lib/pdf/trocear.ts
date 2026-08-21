import type { TextoExtraido } from "./extraerTexto";

export interface FragmentoTroceado {
  contenido: string;
  paginaInicio: number;
  paginaFin: number;
  orden: number;
}

const TAMANO_FRAGMENTO_CARACTERES = 1400;
const SOLAPAMIENTO_CARACTERES = 200;
const MIN_CARACTERES_UTILES = 80;

interface BloquePagina {
  numero: number;
  inicio: number;
  fin: number; // exclusivo
}

/** Trocea el texto completo del PDF en fragmentos con solapamiento, sin perder la página de origen. */
export function trocearTexto(extraido: TextoExtraido): FragmentoTroceado[] {
  let textoCompleto = "";
  const bloques: BloquePagina[] = [];

  for (const pagina of extraido.paginas) {
    const textoPagina = pagina.texto.replace(/\s+/g, " ").trim();
    if (!textoPagina) continue;
    const inicio = textoCompleto.length;
    textoCompleto += (textoCompleto ? " " : "") + textoPagina;
    bloques.push({ numero: pagina.numero, inicio, fin: textoCompleto.length });
  }

  if (!textoCompleto.trim()) return [];

  const fragmentos: FragmentoTroceado[] = [];
  let cursor = 0;
  let orden = 0;

  while (cursor < textoCompleto.length) {
    let fin = Math.min(cursor + TAMANO_FRAGMENTO_CARACTERES, textoCompleto.length);

    // Ajusta el corte al espacio en blanco más cercano para no partir palabras.
    if (fin < textoCompleto.length) {
      const espacio = textoCompleto.lastIndexOf(" ", fin);
      if (espacio > cursor + MIN_CARACTERES_UTILES) fin = espacio;
    }

    const contenido = textoCompleto.slice(cursor, fin).trim();

    if (contenido.length >= MIN_CARACTERES_UTILES) {
      const paginasDelFragmento = bloques.filter((b) => b.inicio < fin && b.fin > cursor);
      const paginaInicio = paginasDelFragmento[0]?.numero ?? extraido.paginas[0]?.numero ?? 1;
      const paginaFin =
        paginasDelFragmento[paginasDelFragmento.length - 1]?.numero ?? paginaInicio;

      fragmentos.push({ contenido, paginaInicio, paginaFin, orden: orden++ });
    }

    if (fin >= textoCompleto.length) break;
    cursor = fin - SOLAPAMIENTO_CARACTERES;
    if (cursor <= 0) cursor = fin;
  }

  return fragmentos;
}

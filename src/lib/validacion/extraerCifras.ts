function patrones(): RegExp[] {
  return [
    /art(?:[ií]culo)?s?\.?\s*\d+(?:\.\d+)?/gi,
    /ley(?:\s+org[aá]nica)?\s*\d+\s*\/\s*\d{2,4}/gi,
    /\d+(?:[.,]\d+)?\s*%/g,
    /\b\d+\s*(?:d[ií]as?|semanas?|meses|mes|a[ñn]os?|horas?)\b/gi,
    /\b\d{2,}\b/g,
  ];
}

/**
 * Extrae cifras, artículos, leyes y plazos citados en un texto. Se usan para
 * comprobar que toda cita numérica de una pregunta aparece literalmente en su
 * fragmento de origen (Capa 0 de la regla antialucinación).
 */
export function extraerCitas(texto: string): string[] {
  const citas = new Set<string>();
  for (const patron of patrones()) {
    for (const coincidencia of texto.matchAll(patron)) {
      citas.add(coincidencia[0].toLowerCase().replace(/\s+/g, " ").trim());
    }
  }
  return [...citas];
}

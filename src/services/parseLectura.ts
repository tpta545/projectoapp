import type { Lectura } from '../types/lectura'

export class LecturaNoParseable extends Error {
  textoCrudo: string

  constructor(textoCrudo: string) {
    super('La respuesta del modelo no es JSON válido.')
    this.name = 'LecturaNoParseable'
    this.textoCrudo = textoCrudo
  }
}

/** Quita vallas de código (```json ... ```) y texto sobrante alrededor del JSON. */
function limpiarRespuesta(texto: string): string {
  let limpio = texto.trim()
  limpio = limpio.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '')

  const inicio = limpio.indexOf('{')
  const fin = limpio.lastIndexOf('}')
  if (inicio !== -1 && fin !== -1 && fin > inicio) {
    limpio = limpio.slice(inicio, fin + 1)
  }
  return limpio.trim()
}

function esLecturaValida(obj: unknown): obj is Lectura {
  if (!obj || typeof obj !== 'object') return false
  const l = obj as Record<string, unknown>
  return (
    typeof l.tipoEquipo === 'string' &&
    Array.isArray(l.campos) &&
    typeof l.textoPlacaCrudo === 'string' &&
    Array.isArray(l.avisos)
  )
}

/**
 * Parsea la respuesta cruda del modelo como Lectura.
 * Si el primer intento falla, limpia vallas de código y reintenta una vez.
 * Si vuelve a fallar, lanza LecturaNoParseable con el texto crudo para no perder el trabajo.
 */
export function parseLectura(textoRespuesta: string): Lectura {
  try {
    const primero = JSON.parse(textoRespuesta)
    if (esLecturaValida(primero)) return normalizar(primero)
  } catch {
    // sigue al reintento
  }

  try {
    const segundo = JSON.parse(limpiarRespuesta(textoRespuesta))
    if (esLecturaValida(segundo)) return normalizar(segundo)
  } catch {
    // sigue al fallo final
  }

  throw new LecturaNoParseable(textoRespuesta)
}

/** Rellena valores por defecto ante campos ausentes, sin asumir que el modelo es perfecto. */
function normalizar(lectura: Lectura): Lectura {
  return {
    tipoEquipo: lectura.tipoEquipo ?? 'desconocido',
    fabricante: lectura.fabricante ?? null,
    campos: (lectura.campos ?? []).map((c) => ({
      clave: c.clave,
      etiqueta: c.etiqueta ?? c.clave,
      valor: c.valor ?? null,
      unidad: c.unidad ?? null,
      confianza: c.confianza ?? 'baja',
    })),
    textoPlacaCrudo: lectura.textoPlacaCrudo ?? '',
    avisos: lectura.avisos ?? [],
  }
}

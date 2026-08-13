import type { Lectura } from '../types/lectura'
import { ETIQUETA_TIPO_EQUIPO } from './formatos'

/** Genera un texto plano resumen de la lectura, listo para email o WhatsApp. */
export function generarResumenOferta(lectura: Lectura, notasTecnico: string): string {
  const lineas: string[] = []
  lineas.push(`Solicitud de oferta — ${ETIQUETA_TIPO_EQUIPO[lectura.tipoEquipo]}`)
  if (lectura.fabricante) lineas.push(`Fabricante: ${lectura.fabricante}`)
  lineas.push('')

  for (const campo of lectura.campos) {
    if (!campo.valor) continue
    const unidad = campo.unidad ? ` ${campo.unidad}` : ''
    lineas.push(`${campo.etiqueta}: ${campo.valor}${unidad}`)
  }

  if (notasTecnico.trim()) {
    lineas.push('')
    lineas.push(`Notas: ${notasTecnico.trim()}`)
  }

  return lineas.join('\n')
}

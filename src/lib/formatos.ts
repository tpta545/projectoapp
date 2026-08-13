import type { TipoEquipo } from '../types/lectura'

// Punto de extensión: multiidioma. Hoy todas las etiquetas están en español y en
// duro; si se añade i18n, este objeto pasaría a resolverse por locale.
export const ETIQUETA_TIPO_EQUIPO: Record<TipoEquipo, string> = {
  motor: 'Motor eléctrico',
  reductor: 'Reductor',
  variador: 'Variador de frecuencia',
  neumatica: 'Componente neumático',
  desconocido: 'Equipo',
}

export function formatearFecha(marcaTiempo: number): string {
  return new Date(marcaTiempo).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

import type { NivelConfianza } from '../../types/lectura'

const ESTILOS: Record<NivelConfianza, string> = {
  alta: 'bg-confianza-alta-bg text-confianza-alta',
  media: 'bg-confianza-media-bg text-confianza-media',
  baja: 'bg-confianza-baja-bg text-confianza-baja',
}

const ETIQUETAS: Record<NivelConfianza, string> = {
  alta: 'Claro',
  media: 'Revisar',
  baja: 'Sin leer',
}

export function BadgeConfianza({ nivel }: { nivel: NivelConfianza }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-sm font-bold ${ESTILOS[nivel]}`}
    >
      {ETIQUETAS[nivel]}
    </span>
  )
}

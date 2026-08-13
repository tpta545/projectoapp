import type { Campo } from '../../types/lectura'
import { BadgeConfianza } from '../ui/Badge'
import { Input } from '../ui/Input'

export function CampoEditable({
  campo,
  onCambiar,
}: {
  campo: Campo
  onCambiar: (valor: string) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-semibold text-trade-text-muted">{campo.etiqueta}</label>
        <BadgeConfianza nivel={campo.confianza} />
      </div>
      <div className="flex items-center gap-2">
        <Input
          value={campo.valor ?? ''}
          placeholder="Sin leer — rellena manualmente"
          onChange={(e) => onCambiar(e.target.value)}
        />
        {campo.unidad && (
          <span className="shrink-0 text-trade-text-muted">{campo.unidad}</span>
        )}
      </div>
    </div>
  )
}

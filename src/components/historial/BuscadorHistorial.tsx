import { Input } from '../ui/Input'

export function BuscadorHistorial({
  valor,
  onCambiar,
}: {
  valor: string
  onCambiar: (valor: string) => void
}) {
  return (
    <Input
      value={valor}
      onChange={(e) => onCambiar(e.target.value)}
      placeholder="Buscar por cliente, referencia o fabricante…"
      aria-label="Buscar en el historial"
    />
  )
}

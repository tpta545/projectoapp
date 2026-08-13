import { Input } from '../ui/Input'

export function NotasTecnico({
  clienteORef,
  onClienteORefCambiar,
  notas,
  onNotasCambiar,
}: {
  clienteORef: string
  onClienteORefCambiar: (valor: string) => void
  notas: string
  onNotasCambiar: (valor: string) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="mb-1 block text-sm font-semibold text-trade-text-muted">
          Cliente / referencia (para buscar en el historial)
        </label>
        <Input
          value={clienteORef}
          placeholder="p.ej. Cerámicas Ribera, obra Paterna…"
          onChange={(e) => onClienteORefCambiar(e.target.value)}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-trade-text-muted">
          Notas del técnico
        </label>
        <textarea
          value={notas}
          onChange={(e) => onNotasCambiar(e.target.value)}
          placeholder="Estado del equipo, ubicación, urgencia…"
          rows={3}
          className="w-full rounded-lg border-2 border-trade-border bg-trade-surface px-4 py-3 text-lg text-trade-text focus:border-trade-red focus:outline-none"
        />
      </div>
    </div>
  )
}

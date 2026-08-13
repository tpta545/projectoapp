import type { EntradaHistorial } from '../../types/lectura'
import { ETIQUETA_TIPO_EQUIPO, formatearFecha } from '../../lib/formatos'

export function TarjetaLectura({
  entrada,
  onAbrir,
  onEliminar,
}: {
  entrada: EntradaHistorial
  onAbrir: () => void
  onEliminar: () => void
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border-2 border-trade-border bg-trade-surface p-3">
      <button onClick={onAbrir} className="shrink-0">
        {entrada.miniaturaDataUrl ? (
          <img
            src={entrada.miniaturaDataUrl}
            alt=""
            className="h-16 w-16 rounded object-cover"
          />
        ) : (
          <div className="h-16 w-16 rounded bg-neutral-200" />
        )}
      </button>
      <button onClick={onAbrir} className="min-h-0 flex-1 text-left">
        <p className="font-bold text-trade-black">
          {entrada.lectura.fabricante || ETIQUETA_TIPO_EQUIPO[entrada.lectura.tipoEquipo]}
        </p>
        <p className="text-sm text-trade-text-muted">
          {ETIQUETA_TIPO_EQUIPO[entrada.lectura.tipoEquipo]}
          {entrada.clienteORef ? ` · ${entrada.clienteORef}` : ''}
        </p>
        <p className="text-xs text-trade-text-muted">{formatearFecha(entrada.creadoEn)}</p>
      </button>
      <button
        type="button"
        aria-label="Eliminar lectura"
        onClick={onEliminar}
        className="min-h-0 shrink-0 px-2 text-xl text-trade-text-muted"
      >
        🗑
      </button>
    </div>
  )
}

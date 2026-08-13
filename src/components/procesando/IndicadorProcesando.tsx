import { Boton } from '../ui/Boton'
import { Spinner } from '../ui/Spinner'

export function IndicadorProcesando({ onCancelar }: { onCancelar: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <Spinner className="h-16 w-16" />
      <div>
        <p className="text-xl font-bold text-trade-text">Leyendo la placa…</p>
        <p className="mt-1 text-trade-text-muted">Esto puede tardar unos segundos</p>
      </div>
      <div className="w-full max-w-xs">
        <Boton variante="fantasma" onClick={onCancelar}>
          Cancelar
        </Boton>
      </div>
    </div>
  )
}

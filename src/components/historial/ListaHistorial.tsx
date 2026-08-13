import type { EntradaHistorial } from '../../types/lectura'
import { TarjetaLectura } from './TarjetaLectura'

export function ListaHistorial({
  lecturas,
  onAbrir,
  onEliminar,
}: {
  lecturas: EntradaHistorial[]
  onAbrir: (entrada: EntradaHistorial) => void
  onEliminar: (id: string) => void
}) {
  if (lecturas.length === 0) {
    return <p className="py-8 text-center text-trade-text-muted">Sin lecturas guardadas todavía.</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {lecturas.map((entrada) => (
        <TarjetaLectura
          key={entrada.id}
          entrada={entrada}
          onAbrir={() => onAbrir(entrada)}
          onEliminar={() => onEliminar(entrada.id)}
        />
      ))}
    </div>
  )
}

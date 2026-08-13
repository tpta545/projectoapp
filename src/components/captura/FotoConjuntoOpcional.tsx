import { useSelectorImagenes } from '../../hooks/useCamera'
import { Boton } from '../ui/Boton'

export function FotoConjuntoOpcional({
  foto,
  onFoto,
  onEliminar,
}: {
  foto: string | null
  onFoto: (fotos: string[]) => void
  onEliminar: () => void
}) {
  const { comprimiendo, error, inputRef, alCambiar, abrir } = useSelectorImagenes((fotos) =>
    onFoto([fotos[0]]),
  )

  return (
    <div className="rounded-lg border-2 border-dashed border-trade-border p-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={alCambiar}
      />
      <p className="mb-2 text-sm font-semibold text-trade-text-muted">
        Foto del conjunto de la máquina (opcional)
      </p>
      {foto ? (
        <div className="relative inline-block">
          <img
            src={foto}
            alt="Foto del conjunto de la máquina"
            className="h-24 w-24 rounded-lg object-cover"
          />
          <button
            type="button"
            aria-label="Eliminar foto de conjunto"
            onClick={onEliminar}
            className="absolute -right-2 -top-2 flex h-8 w-8 min-h-0 items-center justify-center rounded-full bg-trade-black text-lg font-bold text-trade-white"
          >
            ×
          </button>
        </div>
      ) : (
        <Boton variante="fantasma" onClick={abrir} disabled={comprimiendo} className="py-3 text-base">
          Añadir foto de conjunto
        </Boton>
      )}
      {error && <p className="mt-2 text-sm font-semibold text-confianza-baja">{error}</p>}
    </div>
  )
}

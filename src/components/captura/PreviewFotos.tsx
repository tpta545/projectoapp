export function PreviewFotos({
  fotos,
  onEliminar,
}: {
  fotos: string[]
  onEliminar: (indice: number) => void
}) {
  if (fotos.length === 0) return null

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-trade-text-muted">
        {fotos.length} foto{fotos.length > 1 ? 's' : ''} de la placa
      </p>
      <div className="flex flex-wrap gap-3">
        {fotos.map((foto, indice) => (
          <div key={indice} className="relative">
            <img
              src={foto}
              alt={`Foto de la placa ${indice + 1}`}
              className="h-24 w-24 rounded-lg border-2 border-trade-border object-cover"
            />
            <button
              type="button"
              aria-label="Eliminar foto"
              onClick={() => onEliminar(indice)}
              className="absolute -right-2 -top-2 flex h-8 w-8 min-h-0 items-center justify-center rounded-full bg-trade-black text-lg font-bold text-trade-white"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

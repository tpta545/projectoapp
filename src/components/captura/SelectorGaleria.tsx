import { useSelectorImagenes } from '../../hooks/useCamera'
import { Boton } from '../ui/Boton'

export function SelectorGaleria({ onFotos }: { onFotos: (fotos: string[]) => void }) {
  const { comprimiendo, error, inputRef, alCambiar, abrir } = useSelectorImagenes(onFotos)

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="input-archivo-oculto"
        onChange={alCambiar}
      />
      <Boton variante="fantasma" onClick={abrir} disabled={comprimiendo}>
        <span aria-hidden>🖼️</span>
        Subir desde galería
      </Boton>
      {error && <p className="text-sm font-semibold text-confianza-baja">{error}</p>}
    </>
  )
}

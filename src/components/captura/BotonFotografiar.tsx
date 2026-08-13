import { useSelectorImagenes } from '../../hooks/useCamera'
import { Boton } from '../ui/Boton'

export function BotonFotografiar({ onFotos }: { onFotos: (fotos: string[]) => void }) {
  const { comprimiendo, inputRef, alCambiar, abrir } = useSelectorImagenes(onFotos)

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={alCambiar}
      />
      <Boton variante="primario" onClick={abrir} disabled={comprimiendo} className="py-6 text-xl">
        <span aria-hidden>📷</span>
        {comprimiendo ? 'Procesando foto…' : 'Fotografiar placa'}
      </Boton>
    </>
  )
}

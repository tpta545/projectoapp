import { Boton } from '../ui/Boton'

export function GuardarHistorial({
  guardado,
  onGuardar,
}: {
  guardado: boolean
  onGuardar: () => void
}) {
  return (
    <Boton variante="secundario" onClick={onGuardar} disabled={guardado}>
      {guardado ? '✓ Guardado en historial' : 'Guardar en historial'}
    </Boton>
  )
}

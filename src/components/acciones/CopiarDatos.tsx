import { useState } from 'react'
import { Boton } from '../ui/Boton'

export function CopiarDatos({ resumen }: { resumen: string }) {
  const [copiado, setCopiado] = useState(false)

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(resumen)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // Sin permiso de portapapeles: no hay mucho más que hacer desde el cliente.
    }
  }

  return (
    <Boton variante="fantasma" onClick={copiar}>
      {copiado ? '✓ Copiado' : 'Copiar datos'}
    </Boton>
  )
}

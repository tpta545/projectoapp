import { useCallback, useEffect, useMemo, useState } from 'react'
import type { EntradaHistorial } from '../types/lectura'
import { eliminarLectura, listarLecturas } from '../services/historial'

export function useHistorial() {
  const [lecturas, setLecturas] = useState<EntradaHistorial[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  const recargar = useCallback(async () => {
    setCargando(true)
    setLecturas(await listarLecturas())
    setCargando(false)
  }, [])

  useEffect(() => {
    recargar()
  }, [recargar])

  const eliminar = useCallback(
    async (id: string) => {
      await eliminarLectura(id)
      await recargar()
    },
    [recargar],
  )

  const resultados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()
    if (!termino) return lecturas
    return lecturas.filter((entrada) => {
      const enCliente = entrada.clienteORef.toLowerCase().includes(termino)
      const enFabricante = entrada.lectura.fabricante?.toLowerCase().includes(termino)
      const enCampos = entrada.lectura.campos.some((c) =>
        c.valor?.toLowerCase().includes(termino),
      )
      return enCliente || enFabricante || enCampos
    })
  }, [lecturas, busqueda])

  return { lecturas: resultados, cargando, busqueda, setBusqueda, eliminar, recargar }
}

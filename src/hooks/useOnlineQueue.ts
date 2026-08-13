import { useCallback, useEffect, useState } from 'react'
import type { CapturaPendiente } from '../types/lectura'
import { encolarCaptura, eliminarDeCola, listarCola } from '../services/historial'

/**
 * Cola de capturas pendientes de analizar por falta de conexión.
 * El reintento real (llamada a la API) lo dispara quien consuma la cola
 * (ver useLecturaProcessor.reintentarDeCola) para no acoplar red aquí.
 */
export function useOnlineQueue() {
  const [online, setOnline] = useState(navigator.onLine)
  const [cola, setCola] = useState<CapturaPendiente[]>([])

  const recargarCola = useCallback(async () => {
    setCola(await listarCola())
  }, [])

  useEffect(() => {
    recargarCola()
    const alConectar = () => setOnline(true)
    const alDesconectar = () => setOnline(false)
    window.addEventListener('online', alConectar)
    window.addEventListener('offline', alDesconectar)
    return () => {
      window.removeEventListener('online', alConectar)
      window.removeEventListener('offline', alDesconectar)
    }
  }, [recargarCola])

  const encolar = useCallback(
    async (fotos: string[]) => {
      const captura: CapturaPendiente = {
        id: crypto.randomUUID(),
        creadoEn: Date.now(),
        fotos,
        intentos: 0,
      }
      await encolarCaptura(captura)
      await recargarCola()
      return captura
    },
    [recargarCola],
  )

  const quitarDeCola = useCallback(
    async (id: string) => {
      await eliminarDeCola(id)
      await recargarCola()
    },
    [recargarCola],
  )

  return { online, cola, encolar, quitarDeCola, recargarCola }
}

import { useCallback, useRef, useState } from 'react'
import type { Lectura } from '../types/lectura'
import { leerPlaca } from '../services/vision'
import { LecturaNoParseable } from '../services/parseLectura'
import { useOnlineQueue } from './useOnlineQueue'

export type EstadoProceso = 'inactivo' | 'procesando'

export type ErrorLectura = {
  mensaje: string
  textoCrudo?: string
  recuperable: boolean
}

/** Orquesta: comprobación de red → llamada a visión → parseo → estado de UI. */
export function useLecturaProcessor() {
  const [estado, setEstado] = useState<EstadoProceso>('inactivo')
  const [error, setError] = useState<ErrorLectura | null>(null)
  const controladorRef = useRef<AbortController | null>(null)
  const cancelacionSolicitada = useRef(false)
  const { online, cola, encolar, quitarDeCola, recargarCola } = useOnlineQueue()

  const procesar = useCallback(
    async (fotos: string[]): Promise<Lectura | null> => {
      if (fotos.length === 0) {
        setError({
          mensaje: 'Haz al menos una foto de la placa antes de continuar.',
          recuperable: true,
        })
        return null
      }

      if (!online) {
        await encolar(fotos)
        setError({
          mensaje:
            'Sin conexión. La foto se ha guardado y podrás analizarla cuando vuelvas a tener red (ver "Pendientes").',
          recuperable: false,
        })
        return null
      }

      setEstado('procesando')
      setError(null)
      cancelacionSolicitada.current = false
      const controlador = new AbortController()
      controladorRef.current = controlador

      try {
        const lectura = await leerPlaca(fotos, controlador.signal)
        return lectura
      } catch (err) {
        if (cancelacionSolicitada.current) return null

        if (err instanceof LecturaNoParseable) {
          setError({
            mensaje:
              'No se ha podido interpretar la respuesta del modelo. Aquí tienes el texto sin procesar para que no pierdas el trabajo.',
            textoCrudo: err.textoCrudo,
            recuperable: true,
          })
          return null
        }

        if (!navigator.onLine) {
          await encolar(fotos)
          setError({
            mensaje:
              'Se ha perdido la conexión durante el análisis. La foto se ha guardado en la cola para reintentar.',
            recuperable: false,
          })
          return null
        }

        const detalle = err instanceof Error ? err.message : String(err)
        setError({
          mensaje: `No se ha podido leer la placa (${detalle}). Comprueba tu conexión y vuelve a intentarlo.`,
          recuperable: true,
        })
        return null
      } finally {
        setEstado('inactivo')
        controladorRef.current = null
      }
    },
    [online, encolar],
  )

  const cancelar = useCallback(() => {
    cancelacionSolicitada.current = true
    controladorRef.current?.abort()
    setEstado('inactivo')
  }, [])

  /** Reintenta una captura guardada en cola (tras recuperar conexión) y la retira si tiene éxito. */
  const reintentarDeCola = useCallback(
    async (id: string, fotos: string[]): Promise<Lectura | null> => {
      const lectura = await procesar(fotos)
      if (lectura) await quitarDeCola(id)
      return lectura
    },
    [procesar, quitarDeCola],
  )

  return {
    estado,
    error,
    online,
    cola,
    procesar,
    cancelar,
    reintentarDeCola,
    quitarDeCola,
    recargarCola,
  }
}

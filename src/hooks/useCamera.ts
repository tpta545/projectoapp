import { useCallback, useRef, useState } from 'react'
import { comprimirImagen } from '../services/imageCompression'

/**
 * Gestiona un selector de imágenes (cámara o galería) y devuelve las fotos ya
 * comprimidas como dataURLs. Usa <input type="file"> en vez de la MediaDevices API:
 * mejor compatibilidad y UX nativa en Android/iOS que una vista de cámara propia.
 */
export function useSelectorImagenes(onFotos: (fotos: string[]) => void) {
  const [comprimiendo, setComprimiendo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const alCambiar = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      // e.target.files es una FileList viva ligada al input: hay que copiarla
      // a un array ANTES de resetear el value, o quedará vacía al leerla.
      const archivos = e.target.files ? Array.from(e.target.files) : []
      e.target.value = '' // permite volver a elegir el mismo archivo
      if (archivos.length === 0) return

      setError(null)
      setComprimiendo(true)
      try {
        const resultados: string[] = []
        for (const archivo of archivos) {
          if (!archivo.type.startsWith('image/')) continue
          resultados.push(await comprimirImagen(archivo))
        }
        if (resultados.length > 0) onFotos(resultados)
        else setError('No se pudo leer la imagen. Prueba con otra foto.')
      } catch {
        setError('No se pudo procesar la imagen. Prueba con otra foto.')
      } finally {
        setComprimiendo(false)
      }
    },
    [onFotos],
  )

  return {
    comprimiendo,
    error,
    inputRef,
    alCambiar,
    abrir: () => inputRef.current?.click(),
  }
}

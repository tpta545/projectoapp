const LADO_LARGO_MAX = 1568
const CALIDAD_JPEG = 0.85

/**
 * Redimensiona y comprime una imagen antes de enviarla a la API de visión.
 * Reduce coste/latencia y evita subir fotos de cámara a resolución completa (10-40MB).
 */
export async function comprimirImagen(archivo: File | Blob): Promise<string> {
  const bitmap = await createImageBitmap(archivo)

  const escala = Math.min(1, LADO_LARGO_MAX / Math.max(bitmap.width, bitmap.height))
  const ancho = Math.round(bitmap.width * escala)
  const alto = Math.round(bitmap.height * escala)

  const canvas = document.createElement('canvas')
  canvas.width = ancho
  canvas.height = alto

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No se pudo preparar la imagen (canvas no disponible).')

  ctx.drawImage(bitmap, 0, 0, ancho, alto)
  bitmap.close()

  return canvas.toDataURL('image/jpeg', CALIDAD_JPEG)
}

export function dataUrlABase64(dataUrl: string): { base64: string; mediaType: string } {
  const [cabecera, base64] = dataUrl.split(',')
  const mediaType = cabecera.match(/data:(.*);base64/)?.[1] ?? 'image/jpeg'
  return { base64, mediaType }
}

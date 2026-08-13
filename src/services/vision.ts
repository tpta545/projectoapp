import type { Lectura } from '../types/lectura'
import { dataUrlABase64 } from './imageCompression'
import { parseLectura, LecturaNoParseable } from './parseLectura'

/**
 * ⚠️ SOLO DESARROLLO ⚠️
 * Esta llamada se hace directamente desde el navegador con la key en la URL,
 * lo que la expone en el cliente (visible en el bundle/devtools de cualquiera
 * que use la app). Es aceptable para esta fase de validación en móvil real.
 *
 * ANTES DE PRODUCCIÓN: mover esta función a un endpoint backend (proxy) que guarde la
 * key en el servidor y que el cliente solo llame a /api/leer-placa con las imágenes.
 * El resto de la interfaz (leerPlaca) puede mantenerse igual para minimizar cambios
 * en el resto de la app.
 */
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

// Si Google retira este modelo, cambia el nombre por uno vigente en
// https://ai.google.dev/gemini-api/docs/models
const MODELO = 'gemini-2.5-flash'
const URL_GENERATE = `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent`

const PROMPT_SISTEMA = `Eres un asistente experto en placas de características (placas de identificación) de equipos industriales: motores eléctricos, reductores/motorreductores, variadores de frecuencia y componentes neumáticos, de fabricantes como ABB, FESTO, Siemens, SEW, WEG, Danfoss, etc.

Se te darán una o varias fotos de la misma placa (posiblemente en distintos ángulos por reflejos) y opcionalmente una foto del conjunto de la máquina. Tu tarea:

1. Identifica el tipo de equipo: "motor" | "reductor" | "variador" | "neumatica" | "desconocido".
2. Extrae TODOS los datos que sean legibles, combinando información de todas las fotos si hay varias.
3. Según el tipo de equipo, incluye (cuando aparezcan) estos campos como clave/etiqueta:

MOTOR ELÉCTRICO:
fabricante, tipo_modelo ("Tipo / Modelo"), codigo_producto ("Código de producto"), numero_serie ("Número de serie"), potencia_kw ("Potencia (kW)"), potencia_hp ("Potencia (HP)"), tension ("Tensión (V)", incluir conexión Δ/Y si aplica), intensidad ("Intensidad (A)"), frecuencia ("Frecuencia (Hz)"), rpm ("Velocidad (rpm)"), cos_phi ("cos φ"), rendimiento ("Rendimiento (%)"), clase_ie ("Clase IE"), tamano_carcasa ("Tamaño de carcasa"), forma_constructiva ("Forma constructiva IM"), grado_ip ("Grado de protección IP"), clase_aislamiento ("Clase de aislamiento"), tipo_servicio ("Tipo de servicio"), peso ("Peso (kg)"), rodamiento_de ("Rodamiento DE"), rodamiento_nde ("Rodamiento NDE"), marcados_certificados ("Marcados / certificados").

REDUCTOR:
fabricante, tipo ("Tipo"), relacion_reduccion ("Relación de reducción (i)"), par_nominal ("Par nominal (Nm)"), potencia_entrada ("Potencia de entrada (kW)"), rpm_entrada ("rpm entrada"), rpm_salida ("rpm salida"), tamano ("Tamaño"), posicion_montaje ("Posición de montaje"), tipo_eje ("Tipo de eje"), numero_serie ("Número de serie").

VARIADOR DE FRECUENCIA:
fabricante, referencia_tipo ("Referencia de tipo"), potencia_nominal ("Potencia nominal (kW)"), tension_alimentacion ("Tensión de alimentación (V)"), intensidad_entrada ("Intensidad de entrada (A)"), intensidad_salida ("Intensidad de salida (A)"), grado_ip ("Grado de protección IP"), codigo_serie ("Código de serie"), version_firmware ("Versión de firmware").

COMPONENTE NEUMÁTICO:
fabricante, referencia ("Referencia"), numero_articulo ("Número de artículo"), diametro ("Diámetro (mm)"), carrera ("Carrera (mm)"), presion_trabajo ("Presión de trabajo (bar)"), tipo_conexion ("Tipo de conexión").

Si el tipo de equipo no encaja en ninguna categoría, usa "desconocido" y extrae los campos que veas con clave/etiqueta razonables.

4. Para cada campo, asigna "confianza":
   - "alta": el texto se lee con claridad, sin ambigüedad.
   - "media": se lee pero hay duda razonable (reflejo parcial, carácter ambiguo tipo 0/O, 1/I, dígito parcialmente tapado).
   - "baja": el campo no aparece o es ilegible; en ese caso "valor" debe ser null.
5. Incluye en "textoPlacaCrudo" una transcripción literal de todo el texto visible en la placa, línea a línea, aunque no encaje en ningún campo estructurado.
6. Incluye en "avisos" cualquier problema de captura relevante: "reflejo en la esquina superior derecha", "placa parcialmente ilegible abajo", "no se aprecia claramente el número de serie", etc. Array vacío si no hay avisos.

Responde EXCLUSIVAMENTE con un objeto JSON con esta forma exacta, sin texto antes ni después, sin vallas de código markdown:

{
  "tipoEquipo": "motor" | "reductor" | "variador" | "neumatica" | "desconocido",
  "fabricante": string | null,
  "campos": [
    { "clave": string, "etiqueta": string, "valor": string | null, "unidad": string | null, "confianza": "alta" | "media" | "baja" }
  ],
  "textoPlacaCrudo": string,
  "avisos": string[]
}`

export type ProgresoLectura = 'comprimiendo' | 'enviando' | 'interpretando'

/**
 * Envía una o varias fotos de placa (y opcionalmente una foto de conjunto) al modelo
 * de visión (Gemini) y devuelve la Lectura estructurada. Lanza LecturaNoParseable si
 * el modelo no devuelve JSON válido tras el reintento interno de parseLectura.
 */
export async function leerPlaca(
  fotosDataUrl: string[],
  senal?: AbortSignal,
): Promise<Lectura> {
  if (fotosDataUrl.length === 0) {
    throw new Error('No hay ninguna foto para analizar.')
  }

  const partesImagen = fotosDataUrl.map((dataUrl) => {
    const { base64, mediaType } = dataUrlABase64(dataUrl)
    return { inlineData: { mimeType: mediaType, data: base64 } }
  })

  const textoInstruccion =
    fotosDataUrl.length > 1
      ? 'Estas son varias fotos de la misma placa (y posiblemente del conjunto de la máquina). Combina la información de todas para dar el resultado más completo posible.'
      : 'Analiza esta placa de características.'

  const respuesta = await fetch(`${URL_GENERATE}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: senal,
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: PROMPT_SISTEMA }] },
      contents: [
        {
          role: 'user',
          parts: [...partesImagen, { text: textoInstruccion }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!respuesta.ok) {
    const detalle = await respuesta.text().catch(() => '')
    throw new Error(`Error de la API de Gemini (${respuesta.status}): ${detalle.slice(0, 300)}`)
  }

  const datos = await respuesta.json()
  const textoRespuesta: string = (datos.candidates?.[0]?.content?.parts ?? [])
    .map((parte: { text?: string }) => parte.text ?? '')
    .join('\n')

  try {
    return parseLectura(textoRespuesta)
  } catch (error) {
    if (error instanceof LecturaNoParseable) throw error
    throw new LecturaNoParseable(textoRespuesta)
  }
}

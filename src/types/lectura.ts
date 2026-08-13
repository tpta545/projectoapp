export type TipoEquipo = 'motor' | 'reductor' | 'variador' | 'neumatica' | 'desconocido'

export type NivelConfianza = 'alta' | 'media' | 'baja'

export type Campo = {
  clave: string // p.ej. "potencia_kw"
  etiqueta: string // p.ej. "Potencia (kW)"
  valor: string | null
  unidad: string | null
  confianza: NivelConfianza
}

/** Resultado crudo devuelto por el servicio de visión, tal cual lo entiende el modelo. */
export type Lectura = {
  tipoEquipo: TipoEquipo
  fabricante: string | null
  campos: Campo[]
  textoPlacaCrudo: string
  avisos: string[]
}

/** Metadatos que la app añade a una Lectura, no forman parte de la respuesta del modelo. */
export type EntradaHistorial = {
  id: string
  creadoEn: number
  lectura: Lectura
  miniaturaDataUrl: string
  fotos: string[] // dataURLs de todas las fotos originales de esta lectura
  notasTecnico: string
  clienteORef: string // texto libre para buscar (referencia u obra/cliente)
}

/** Estado de una captura pendiente de enviar (cola offline). */
export type CapturaPendiente = {
  id: string
  creadoEn: number
  fotos: string[] // dataURLs comprimidos, listos para enviar
  intentos: number
}

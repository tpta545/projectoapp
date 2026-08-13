import { useState } from 'react'
import type { Lectura } from '../types/lectura'
import { useLecturaProcessor } from '../hooks/useLecturaProcessor'
import { BotonFotografiar } from '../components/captura/BotonFotografiar'
import { SelectorGaleria } from '../components/captura/SelectorGaleria'
import { PreviewFotos } from '../components/captura/PreviewFotos'
import { FotoConjuntoOpcional } from '../components/captura/FotoConjuntoOpcional'
import { IndicadorProcesando } from '../components/procesando/IndicadorProcesando'
import { Boton } from '../components/ui/Boton'

export function PantallaCaptura({
  onLecturaLista,
  onIrAHistorial,
}: {
  onLecturaLista: (lectura: Lectura, fotos: string[], fotoConjunto: string | null) => void
  onIrAHistorial: () => void
}) {
  const [fotos, setFotos] = useState<string[]>([])
  const [fotoConjunto, setFotoConjunto] = useState<string | null>(null)
  const { estado, error, online, cola, procesar, cancelar, reintentarDeCola, quitarDeCola } =
    useLecturaProcessor()

  const analizar = async () => {
    const lectura = await procesar(fotos)
    if (lectura) onLecturaLista(lectura, fotos, fotoConjunto)
  }

  if (estado === 'procesando') {
    return <IndicadorProcesando onCancelar={cancelar} />
  }

  return (
    <div className="flex flex-col gap-5 p-4 pb-28">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-trade-black">
            Lector de placas TRADE
          </h1>
          <p className="text-trade-text-muted">Motores, reductores, variadores y neumática</p>
        </div>
        <button onClick={onIrAHistorial} className="shrink-0 font-semibold text-trade-red">
          Historial
        </button>
      </header>

      {!online && (
        <div className="rounded-lg bg-confianza-media-bg px-4 py-3 text-confianza-media">
          Sin conexión. Puedes seguir haciendo fotos: se guardarán para analizarlas más tarde.
        </div>
      )}

      <div className="flex flex-col gap-3">
        <BotonFotografiar onFotos={(nuevas) => setFotos((prev) => [...prev, ...nuevas])} />
        <SelectorGaleria onFotos={(nuevas) => setFotos((prev) => [...prev, ...nuevas])} />
      </div>

      <PreviewFotos
        fotos={fotos}
        onEliminar={(indice) => setFotos((prev) => prev.filter((_, i) => i !== indice))}
      />

      <FotoConjuntoOpcional
        foto={fotoConjunto}
        onFoto={(fotos) => setFotoConjunto(fotos[0])}
        onEliminar={() => setFotoConjunto(null)}
      />

      {error && (
        <div className="rounded-lg bg-confianza-baja-bg px-4 py-3 text-confianza-baja">
          <p className="font-semibold">{error.mensaje}</p>
          {error.textoCrudo && (
            <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-trade-white/60 p-2 text-xs text-trade-text">
              {error.textoCrudo}
            </pre>
          )}
        </div>
      )}

      {cola.length > 0 && (
        <div className="rounded-lg border-2 border-trade-border p-3">
          <p className="mb-2 font-semibold text-trade-text">
            {cola.length} foto{cola.length > 1 ? 's' : ''} pendiente
            {cola.length > 1 ? 's' : ''} de analizar
          </p>
          <ul className="flex flex-col gap-2">
            {cola.map((c) => (
              <li key={c.id} className="flex items-center gap-3">
                <img src={c.fotos[0]} alt="" className="h-14 w-14 rounded object-cover" />
                <div className="flex flex-1 gap-2">
                  <Boton
                    variante="secundario"
                    disabled={!online}
                    className="py-2 text-sm"
                    onClick={async () => {
                      const lectura = await reintentarDeCola(c.id, c.fotos)
                      if (lectura) onLecturaLista(lectura, c.fotos, null)
                    }}
                  >
                    Reintentar
                  </Boton>
                  <Boton
                    variante="fantasma"
                    className="py-2 text-sm"
                    onClick={() => quitarDeCola(c.id)}
                  >
                    Descartar
                  </Boton>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 border-t-2 border-trade-border bg-trade-bg p-4">
        <Boton onClick={analizar} disabled={fotos.length === 0}>
          Analizar placa {fotos.length > 0 ? `(${fotos.length})` : ''}
        </Boton>
      </div>
    </div>
  )
}

import { useState } from 'react'
import type { EntradaHistorial } from '../types/lectura'
import { useHistorial } from '../hooks/useHistorial'
import { generarResumenOferta } from '../lib/generarResumenOferta'
import { BuscadorHistorial } from '../components/historial/BuscadorHistorial'
import { ListaHistorial } from '../components/historial/ListaHistorial'
import { FichaResultado } from '../components/ficha/FichaResultado'
import { SolicitarOferta } from '../components/acciones/SolicitarOferta'
import { CopiarDatos } from '../components/acciones/CopiarDatos'

export function PantallaHistorial({ onNuevaLectura }: { onNuevaLectura: () => void }) {
  const { lecturas, cargando, busqueda, setBusqueda, eliminar } = useHistorial()
  const [seleccion, setSeleccion] = useState<EntradaHistorial | null>(null)

  if (seleccion) {
    const resumen = generarResumenOferta(seleccion.lectura, seleccion.notasTecnico)
    return (
      <div className="flex flex-col gap-6 p-4 pb-8">
        <button
          onClick={() => setSeleccion(null)}
          className="self-start text-sm font-semibold text-trade-text-muted"
        >
          ← Volver al historial
        </button>

        {seleccion.fotos.length > 0 && (
          <div className="flex gap-2 overflow-x-auto">
            {seleccion.fotos.map((foto, i) => (
              <img key={i} src={foto} alt="" className="h-20 w-20 shrink-0 rounded object-cover" />
            ))}
          </div>
        )}

        <FichaResultado lectura={seleccion.lectura} onCambiarCampo={() => {}} />

        {seleccion.notasTecnico && (
          <div>
            <p className="text-sm font-semibold text-trade-text-muted">Notas del técnico</p>
            <p className="text-trade-text">{seleccion.notasTecnico}</p>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t-2 border-trade-border pt-5">
          <SolicitarOferta resumen={resumen} />
          <CopiarDatos resumen={resumen} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tight text-trade-black">Historial</h1>
        <button onClick={onNuevaLectura} className="font-semibold text-trade-red">
          + Nueva lectura
        </button>
      </header>

      <BuscadorHistorial valor={busqueda} onCambiar={setBusqueda} />

      {cargando ? (
        <p className="py-8 text-center text-trade-text-muted">Cargando…</p>
      ) : (
        <ListaHistorial lecturas={lecturas} onAbrir={setSeleccion} onEliminar={eliminar} />
      )}
    </div>
  )
}

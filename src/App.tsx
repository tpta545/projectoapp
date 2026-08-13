import { useState } from 'react'
import type { Lectura } from './types/lectura'
import { PantallaCaptura } from './pages/PantallaCaptura'
import { PantallaResultado } from './pages/PantallaResultado'
import { PantallaHistorial } from './pages/PantallaHistorial'

type Vista = 'captura' | 'resultado' | 'historial'

function App() {
  const [vista, setVista] = useState<Vista>('captura')
  const [lecturaActual, setLecturaActual] = useState<Lectura | null>(null)
  const [fotosActuales, setFotosActuales] = useState<string[]>([])

  const irACaptura = () => {
    setLecturaActual(null)
    setFotosActuales([])
    setVista('captura')
  }

  return (
    <div className="mx-auto min-h-dvh max-w-md bg-trade-bg">
      {vista === 'captura' && (
        <PantallaCaptura
          onIrAHistorial={() => setVista('historial')}
          onLecturaLista={(lectura, fotos) => {
            setLecturaActual(lectura)
            setFotosActuales(fotos)
            setVista('resultado')
          }}
        />
      )}

      {vista === 'resultado' && lecturaActual && (
        <PantallaResultado
          lecturaInicial={lecturaActual}
          fotos={fotosActuales}
          onVolverACaptura={irACaptura}
          onIrAHistorial={() => setVista('historial')}
        />
      )}

      {vista === 'historial' && <PantallaHistorial onNuevaLectura={irACaptura} />}
    </div>
  )
}

export default App

import { useState } from 'react'
import type { EntradaHistorial, Lectura } from '../types/lectura'
import { guardarLectura } from '../services/historial'
import { generarResumenOferta } from '../lib/generarResumenOferta'
import { FichaResultado } from '../components/ficha/FichaResultado'
import { SolicitarOferta } from '../components/acciones/SolicitarOferta'
import { CopiarDatos } from '../components/acciones/CopiarDatos'
import { GuardarHistorial } from '../components/acciones/GuardarHistorial'
import { NotasTecnico } from '../components/acciones/NotasTecnico'
import { Boton } from '../components/ui/Boton'

export function PantallaResultado({
  lecturaInicial,
  fotos,
  onVolverACaptura,
  onIrAHistorial,
}: {
  lecturaInicial: Lectura
  fotos: string[]
  onVolverACaptura: () => void
  onIrAHistorial: () => void
}) {
  const [lectura, setLectura] = useState(lecturaInicial)
  const [clienteORef, setClienteORef] = useState('')
  const [notas, setNotas] = useState('')
  const [guardado, setGuardado] = useState(false)

  const cambiarCampo = (clave: string, valor: string) => {
    setLectura((prev) => ({
      ...prev,
      campos: prev.campos.map((c) =>
        c.clave === clave ? { ...c, valor, confianza: 'alta' } : c,
      ),
    }))
    setGuardado(false)
  }

  const resumen = generarResumenOferta(lectura, notas)

  const guardarEnHistorial = async () => {
    const entrada: EntradaHistorial = {
      id: crypto.randomUUID(),
      creadoEn: Date.now(),
      lectura,
      miniaturaDataUrl: fotos[0] ?? '',
      fotos,
      notasTecnico: notas,
      clienteORef,
    }
    await guardarLectura(entrada)
    setGuardado(true)
  }

  return (
    <div className="flex flex-col gap-6 p-4 pb-8">
      <button
        onClick={onVolverACaptura}
        className="self-start text-sm font-semibold text-trade-text-muted"
      >
        ← Nueva foto
      </button>

      <FichaResultado lectura={lectura} onCambiarCampo={cambiarCampo} />

      <NotasTecnico
        clienteORef={clienteORef}
        onClienteORefCambiar={setClienteORef}
        notas={notas}
        onNotasCambiar={setNotas}
      />

      <div className="flex flex-col gap-3 border-t-2 border-trade-border pt-5">
        <SolicitarOferta resumen={resumen} />
        <div className="flex gap-3">
          <CopiarDatos resumen={resumen} />
          <GuardarHistorial guardado={guardado} onGuardar={guardarEnHistorial} />
        </div>
        {/* Punto de extensión: botón "Exportar PDF" del parte/ficha, fuera de alcance en esta fase. */}
        <Boton variante="fantasma" onClick={onIrAHistorial}>
          Ver historial
        </Boton>
      </div>
    </div>
  )
}

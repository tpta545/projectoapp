import type { Lectura } from '../../types/lectura'
import { ETIQUETA_TIPO_EQUIPO } from '../../lib/formatos'
import { GrupoRevision } from './GrupoRevision'
import { CampoEditable } from './CampoEditable'
import { TextoPlacaCrudo } from './TextoPlacaCrudo'
import { AvisosLectura } from './AvisosLectura'

export function FichaResultado({
  lectura,
  onCambiarCampo,
}: {
  lectura: Lectura
  onCambiarCampo: (clave: string, valor: string) => void
}) {
  const dudosos = lectura.campos.filter((c) => c.confianza !== 'alta')
  const claros = lectura.campos.filter((c) => c.confianza === 'alta')

  return (
    <div className="flex flex-col gap-5">
      <header>
        <span className="inline-block rounded-full bg-trade-black px-3 py-1 text-sm font-bold text-trade-white">
          {ETIQUETA_TIPO_EQUIPO[lectura.tipoEquipo]}
        </span>
        {lectura.fabricante && (
          <h2 className="mt-2 text-2xl font-black text-trade-black">{lectura.fabricante}</h2>
        )}
      </header>

      {/* Punto de extensión: aquí se mostraría la equivalencia de catálogo real
          ABB/FESTO (referencia comercial, disponibilidad, precio) buscando por
          los campos leídos, cuando exista esa integración. */}

      <AvisosLectura avisos={lectura.avisos} />

      <GrupoRevision campos={dudosos} onCambiarCampo={onCambiarCampo} />

      {claros.length > 0 && (
        <section>
          <h2 className="mb-3 font-black text-trade-text">Datos leídos</h2>
          <div className="flex flex-col gap-4">
            {claros.map((campo) => (
              <CampoEditable
                key={campo.clave}
                campo={campo}
                onCambiar={(valor) => onCambiarCampo(campo.clave, valor)}
              />
            ))}
          </div>
        </section>
      )}

      <TextoPlacaCrudo texto={lectura.textoPlacaCrudo} />
    </div>
  )
}

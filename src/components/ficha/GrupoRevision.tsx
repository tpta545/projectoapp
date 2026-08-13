import type { Campo } from '../../types/lectura'
import { CampoEditable } from './CampoEditable'

export function GrupoRevision({
  campos,
  onCambiarCampo,
}: {
  campos: Campo[]
  onCambiarCampo: (clave: string, valor: string) => void
}) {
  if (campos.length === 0) return null

  return (
    <section className="rounded-lg border-2 border-confianza-media bg-confianza-media-bg/40 p-4">
      <h2 className="mb-3 font-black text-confianza-media">
        ⚠ Revisar ({campos.length})
      </h2>
      <div className="flex flex-col gap-4">
        {campos.map((campo) => (
          <CampoEditable
            key={campo.clave}
            campo={campo}
            onCambiar={(valor) => onCambiarCampo(campo.clave, valor)}
          />
        ))}
      </div>
    </section>
  )
}

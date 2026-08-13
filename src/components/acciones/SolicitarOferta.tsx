import { Boton } from '../ui/Boton'

// Punto de extensión: en vez de mailto/wa.me, esta acción podría crear directamente
// una oportunidad en el CRM/ERP (SAP, Odoo...) vía API cuando exista esa integración.
export function SolicitarOferta({ resumen }: { resumen: string }) {
  const abrirEmail = () => {
    const asunto = encodeURIComponent('Solicitud de oferta')
    const cuerpo = encodeURIComponent(resumen)
    window.location.href = `mailto:?subject=${asunto}&body=${cuerpo}`
  }

  const abrirWhatsapp = () => {
    const texto = encodeURIComponent(resumen)
    window.open(`https://wa.me/?text=${texto}`, '_blank')
  }

  return (
    <div className="flex gap-3">
      <Boton variante="primario" onClick={abrirEmail}>
        <span aria-hidden>✉️</span> Email
      </Boton>
      <Boton variante="primario" onClick={abrirWhatsapp}>
        <span aria-hidden>💬</span> WhatsApp
      </Boton>
    </div>
  )
}

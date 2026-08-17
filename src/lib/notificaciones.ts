// Envío de notificación por email al recibir un formulario. No hay proveedor de email
// configurado por defecto (no inventamos credenciales): en desarrollo se registra en
// consola. Para producción, define RESEND_API_KEY (o el proveedor que prefieras) en las
// variables de entorno del despliegue y sustituye el cuerpo de esta función por la
// llamada real a su API — la firma de la función no cambia para el resto del código.

interface Notificacion {
  asunto: string;
  datos: Record<string, string>;
}

export async function enviarNotificacion({ asunto, datos }: Notificacion): Promise<void> {
  const apiKey = import.meta.env.RESEND_API_KEY as string | undefined;
  const destino = import.meta.env.NOTIFICACIONES_EMAIL_DESTINO || 'info@grupotrade.es';

  if (!apiKey) {
    console.info(`[notificacion] ${asunto} → ${destino}`, datos);
    return;
  }

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'web@grupotrade.es',
      to: destino,
      subject: asunto,
      text: Object.entries(datos)
        .map(([clave, valor]) => `${clave}: ${valor}`)
        .join('\n'),
    }),
  });
}

import type { APIRoute } from 'astro';
import { esHoneypotSospechoso, permitirEnvio, obtenerIp, campoTexto } from '@/lib/antispam';
import { enviarNotificacion } from '@/lib/notificaciones';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request }) => {
  const datos = await request.formData();

  if (esHoneypotSospechoso(datos.get('web'))) {
    // Se responde éxito para no dar pistas a bots, sin procesar el envío.
    return Response.json({ mensaje: 'Solicitud enviada. Te responderemos en el mismo día hábil.' });
  }

  const ip = obtenerIp(request);
  if (!permitirEnvio(ip)) {
    return Response.json(
      { mensaje: 'Has enviado varias solicitudes seguidas. Espera unos minutos e inténtalo de nuevo.' },
      { status: 429 },
    );
  }

  const nombre = campoTexto(datos, 'nombre', 200);
  const empresa = campoTexto(datos, 'empresa', 200);
  const email = campoTexto(datos, 'email', 200);
  const telefono = campoTexto(datos, 'telefono', 50);
  const familia = campoTexto(datos, 'familia', 100);
  const descripcion = campoTexto(datos, 'descripcion', 2000);
  const urgencia = campoTexto(datos, 'urgencia', 50);
  const consentimiento = datos.get('consentimiento');

  if (!nombre || !empresa || !email || !telefono || !descripcion || !consentimiento) {
    return Response.json(
      { mensaje: 'Faltan datos obligatorios: nombre, empresa, email, teléfono, descripción y consentimiento.' },
      { status: 400 },
    );
  }

  if (!EMAIL_RE.test(email)) {
    return Response.json({ mensaje: 'El email no parece válido. Revísalo e inténtalo de nuevo.' }, { status: 400 });
  }

  await enviarNotificacion({
    asunto: `Nueva solicitud de presupuesto — ${empresa}`,
    datos: { nombre, empresa, email, telefono, familia: familia || '(no indicada)', urgencia, descripcion },
  });

  return Response.json({
    mensaje:
      urgencia === 'linea-parada'
        ? 'Solicitud urgente recibida. Te llamaremos en breve.'
        : 'Solicitud enviada. Te responderemos con presupuesto en el mismo día hábil.',
  });
};

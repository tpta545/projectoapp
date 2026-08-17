import type { APIRoute } from 'astro';
import { esHoneypotSospechoso, permitirEnvio, obtenerIp, campoTexto } from '@/lib/antispam';
import { enviarNotificacion } from '@/lib/notificaciones';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request }) => {
  const datos = await request.formData();

  if (esHoneypotSospechoso(datos.get('web'))) {
    return Response.json({ mensaje: 'Mensaje enviado. Te responderemos en el mismo día hábil.' });
  }

  const ip = obtenerIp(request);
  if (!permitirEnvio(ip)) {
    return Response.json(
      { mensaje: 'Has enviado varios mensajes seguidos. Espera unos minutos e inténtalo de nuevo.' },
      { status: 429 },
    );
  }

  const nombre = campoTexto(datos, 'nombre', 200);
  const email = campoTexto(datos, 'email', 200);
  const telefono = campoTexto(datos, 'telefono', 50);
  const mensajeTexto = campoTexto(datos, 'mensaje', 2000);
  const consentimiento = datos.get('consentimiento');

  if (!nombre || !email || !mensajeTexto || !consentimiento) {
    return Response.json(
      { mensaje: 'Faltan datos obligatorios: nombre, email, mensaje y consentimiento.' },
      { status: 400 },
    );
  }

  if (!EMAIL_RE.test(email)) {
    return Response.json({ mensaje: 'El email no parece válido. Revísalo e inténtalo de nuevo.' }, { status: 400 });
  }

  await enviarNotificacion({
    asunto: `Nuevo mensaje de contacto — ${nombre}`,
    datos: { nombre, email, telefono: telefono || '(no indicado)', mensaje: mensajeTexto },
  });

  return Response.json({ mensaje: 'Mensaje enviado. Te responderemos en el mismo día hábil.' });
};

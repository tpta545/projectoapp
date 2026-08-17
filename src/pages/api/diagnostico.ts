import type { APIRoute } from 'astro';
import { esHoneypotSospechoso, permitirEnvio, obtenerIp, campoTexto } from '@/lib/antispam';
import { enviarNotificacion } from '@/lib/notificaciones';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request }) => {
  const datos = await request.formData();

  if (esHoneypotSospechoso(datos.get('web'))) {
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
  const marca = campoTexto(datos, 'marca', 100);
  const modelo = campoTexto(datos, 'modelo', 100);
  const potencia = campoTexto(datos, 'potencia', 50);
  const urgencia = campoTexto(datos, 'urgencia', 50);
  const averia = campoTexto(datos, 'averia', 2000);
  const consentimiento = datos.get('consentimiento');

  if (!nombre || !email || !telefono || !averia || !consentimiento) {
    return Response.json(
      { mensaje: 'Faltan datos obligatorios: nombre, email, teléfono, descripción de la avería y consentimiento.' },
      { status: 400 },
    );
  }

  if (!EMAIL_RE.test(email)) {
    return Response.json({ mensaje: 'El email no parece válido. Revísalo e inténtalo de nuevo.' }, { status: 400 });
  }

  await enviarNotificacion({
    asunto: `Nueva solicitud de diagnóstico — ${empresa || nombre}`,
    datos: {
      nombre,
      empresa: empresa || '(no indicada)',
      email,
      telefono,
      marca: marca || '(no indicada)',
      modelo: modelo || '(no indicado)',
      potencia: potencia || '(no indicada)',
      urgencia,
      averia,
    },
  });

  return Response.json({
    mensaje:
      urgencia === 'linea-parada'
        ? 'Solicitud urgente recibida. Te llamaremos en breve para coordinar la recepción del equipo.'
        : 'Solicitud recibida. Te contactamos en el mismo día hábil para coordinar el diagnóstico.',
  });
};

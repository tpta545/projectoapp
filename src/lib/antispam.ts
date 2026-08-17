// Protección antispam ligera para los endpoints de formulario: honeypot + limitación
// de frecuencia por IP en memoria. En despliegue serverless (Vercel/Netlify) cada
// instancia de función tiene su propia memoria, así que esto es una primera barrera
// razonable, no una garantía absoluta; para tráfico alto conviene sustituir el Map
// por un almacén compartido (KV/Redis) sin cambiar la interfaz de `permitirEnvio`.

const ENVIOS_POR_IP = new Map<string, number[]>();
const VENTANA_MS = 10 * 60 * 1000; // 10 minutos
const MAX_ENVIOS_POR_VENTANA = 5;

export function esHoneypotSospechoso(valorCampoOculto: FormDataEntryValue | null): boolean {
  return typeof valorCampoOculto === 'string' && valorCampoOculto.trim().length > 0;
}

export function permitirEnvio(ip: string): boolean {
  const ahora = Date.now();
  const previos = (ENVIOS_POR_IP.get(ip) ?? []).filter((t) => ahora - t < VENTANA_MS);

  if (previos.length >= MAX_ENVIOS_POR_VENTANA) {
    ENVIOS_POR_IP.set(ip, previos);
    return false;
  }

  previos.push(ahora);
  ENVIOS_POR_IP.set(ip, previos);
  return true;
}

export function obtenerIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'desconocida'
  );
}

export function campoTexto(datos: FormData, nombre: string, maxLength = 2000): string {
  const valor = datos.get(nombre);
  return typeof valor === 'string' ? valor.trim().slice(0, maxLength) : '';
}

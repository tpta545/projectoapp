export const metadata = { title: "Política de cookies — TESTARIO" };

export default function PaginaCookies() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold">Política de cookies</h1>

      <div className="mt-6 space-y-5 text-sm leading-relaxed text-[var(--color-texto)]">
        <p>
          TESTARIO utiliza únicamente cookies técnicas, estrictamente necesarias para mantener tu sesión
          iniciada y para que la aplicación funcione correctamente. No usamos cookies de publicidad ni de
          análisis de terceros.
        </p>

        <h2 className="font-semibold text-base">Cookies que usamos</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Cookies de sesión de Supabase Auth, para reconocer que has iniciado sesión.</li>
        </ul>

        <p>
          Al ser cookies técnicas necesarias para el funcionamiento del servicio, no requieren tu
          consentimiento previo conforme a la normativa vigente. Puedes eliminarlas en cualquier momento
          desde la configuración de tu navegador, aunque esto cerrará tu sesión.
        </p>
      </div>
    </div>
  );
}

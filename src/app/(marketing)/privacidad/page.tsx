export const metadata = { title: "Política de privacidad — TESTARIO" };

export default function PaginaPrivacidad() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold">Política de privacidad</h1>

      <div className="mt-6 space-y-5 text-sm leading-relaxed text-[var(--color-texto)]">
        <p>
          Esta política describe, conforme al Reglamento (UE) 2016/679 (RGPD) y la LOPDGDD, qué datos
          tratamos y con qué finalidad al usar TESTARIO.
        </p>

        <h2 className="font-semibold text-base">Qué datos tratamos</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Correo electrónico y contraseña (gestionada de forma cifrada por Supabase Auth).</li>
          <li>Los documentos PDF que subes y el texto extraído de ellos.</li>
          <li>Las preguntas generadas, tus respuestas y tu historial de tests.</li>
          <li>Datos técnicos mínimos de sesión necesarios para el funcionamiento del servicio.</li>
        </ul>

        <h2 className="font-semibold text-base">Privacidad de tus documentos</h2>
        <p>
          Tus PDFs y las preguntas generadas a partir de ellos son privados: solo tu cuenta puede acceder a
          ellos. Nunca se comparten entre usuarios ni se usan para construir un banco de preguntas común.
          Se envían fragmentos de tu documento a un proveedor de inteligencia artificial únicamente para
          generar y validar preguntas sobre tu propio material.
        </p>

        <h2 className="font-semibold text-base">Finalidad y base legal</h2>
        <p>
          Tratamos tus datos para prestarte el servicio de generación y corrección de tests (ejecución de
          contrato) y, si nos das tu consentimiento, para comunicarte novedades del producto.
        </p>

        <h2 className="font-semibold text-base">Conservación</h2>
        <p>
          Conservamos tus datos mientras mantengas tu cuenta activa. Puedes borrar tu cuenta y todos tus
          documentos en cualquier momento desde el apartado &quot;Mi cuenta&quot;.
        </p>

        <h2 className="font-semibold text-base">Tus derechos</h2>
        <p>
          Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y
          portabilidad escribiendo a{" "}
          <a className="text-[var(--color-primario)]" href="mailto:hola@testario.es">
            hola@testario.es
          </a>
          , o borrando tu cuenta directamente desde la aplicación.
        </p>
      </div>
    </div>
  );
}

export const metadata = { title: "Aviso legal — TESTARIO" };

export default function PaginaAvisoLegal() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 prose-sm">
      <h1 className="text-2xl font-bold">Aviso legal</h1>

      <div className="mt-6 space-y-5 text-sm leading-relaxed text-[var(--color-texto)]">
        <p>
          TESTARIO (testario.es) es un servicio de autoevaluación mediante tests generados a partir del
          material que cada usuario sube voluntariamente. No tiene vínculo, patrocinio ni relación oficial
          alguna con la Guardia Civil, la Policía Nacional, el Ministerio del Interior ni ningún otro
          organismo público. No utilizamos sus denominaciones, escudos, emblemas ni colores
          institucionales.
        </p>

        <h2 className="font-semibold text-base">Naturaleza del servicio</h2>
        <p>
          Las preguntas se generan mediante inteligencia artificial a partir de fragmentos literales del
          documento que el propio usuario aporta, y pasan por un proceso de validación automática antes de
          mostrarse. Aun así, TESTARIO no garantiza la ausencia total de errores ni ninguna tasa de
          aprobados, resultado de examen o certificación oficial. Cada pregunta muestra el fragmento de
          origen para que el usuario pueda comprobarlo por sí mismo, y puede impugnar cualquier pregunta
          que considere incorrecta.
        </p>

        <h2 className="font-semibold text-base">Responsabilidad sobre el material subido</h2>
        <p>
          El usuario declara, en el momento de subir cada documento, que dispone del derecho de uso sobre
          ese material (apuntes propios, material de una academia a la que está inscrito, textos legales de
          dominio público, etc.). TESTARIO no publica, comparte ni utiliza esos documentos para ningún fin
          distinto de generar preguntas para la cuenta que los subió.
        </p>

        <h2 className="font-semibold text-base">Titular</h2>
        <p>
          Para cualquier consulta sobre este aviso legal, escribe a{" "}
          <a className="text-[var(--color-primario)]" href="mailto:hola@testario.es">
            hola@testario.es
          </a>
          .
        </p>
      </div>
    </div>
  );
}

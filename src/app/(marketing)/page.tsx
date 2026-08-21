import Link from "next/link";
import { Tarjeta } from "@/components/ui/Tarjeta";

const CARACTERISTICAS = [
  {
    titulo: "Sube tu propio temario",
    texto: "Tus apuntes, el manual de la academia o el PDF del BOE. El test se genera sobre TU material, no sobre un banco cerrado.",
  },
  {
    titulo: "Cada pregunta cita su fuente",
    texto: 'En la corrección ves el fragmento exacto de tu temario bajo "Fuente en tu temario", nunca un dato inventado.',
  },
  {
    titulo: "Puedes impugnar",
    texto: "Si una pregunta te parece incorrecta o ambigua, la impugnas con un motivo. Con varias impugnaciones se retira.",
  },
  {
    titulo: "Guardia Civil y Policía Nacional",
    texto: "Organiza tu temario por los bloques de tu oposición: jurídicas, sociotécnicas, ortografía, idioma y psicotécnicos.",
  },
];

export default function PaginaLanding() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <section className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-texto)] sm:text-4xl">
          Convierte tu temario en PDF en tests de autoevaluación
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[var(--color-texto-suave)]">
          Preparación para las oposiciones a Guardia Civil y Policía Nacional. Sube tus apuntes y genera
          preguntas tipo test ancladas a tu propio material, con la fuente citada en cada corrección.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/registro"
            className="w-full rounded-xl bg-[var(--color-primario)] px-6 py-3.5 text-center font-medium text-white sm:w-auto"
          >
            Empezar gratis
          </Link>
          <Link
            href="/login"
            className="w-full rounded-xl border border-[var(--color-borde)] px-6 py-3.5 text-center font-medium sm:w-auto"
          >
            Ya tengo cuenta
          </Link>
        </div>
        <p className="mt-3 text-xs text-[var(--color-texto-suave)]">
          Plan gratuito: 1 documento y 20 preguntas al día. Sin tarjeta.
        </p>
      </section>

      <section className="mt-14 grid gap-4 sm:grid-cols-2">
        {CARACTERISTICAS.map((c) => (
          <Tarjeta key={c.titulo}>
            <h2 className="font-semibold text-[var(--color-texto)]">{c.titulo}</h2>
            <p className="mt-1.5 text-sm text-[var(--color-texto-suave)]">{c.texto}</p>
          </Tarjeta>
        ))}
      </section>

      <section className="mt-14 rounded-2xl border border-[var(--color-borde)] bg-[var(--color-primario-suave)] p-5 text-sm text-[var(--color-texto)]">
        <p>
          TESTARIO no promete ninguna tasa de aprobados ni resultados garantizados, ni afirma que sus
          preguntas estén libres de errores. Lo que sí garantizamos: cada pregunta va acompañada del
          fragmento literal de tu temario del que procede, y puedes impugnar cualquiera que te parezca
          incorrecta.
        </p>
      </section>
    </div>
  );
}

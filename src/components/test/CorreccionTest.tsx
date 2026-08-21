import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { TarjetaPreguntaCorregida, type PreguntaCorregida } from "./TarjetaPreguntaCorregida";

export function CorreccionTest({
  puntuacion,
  correctas,
  incorrectas,
  sinResponder,
  preguntas,
}: {
  puntuacion: number;
  correctas: number;
  incorrectas: number;
  sinResponder: number;
  preguntas: PreguntaCorregida[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <Tarjeta className="text-center">
        <p className="text-sm text-[var(--color-texto-suave)]">Puntuación</p>
        <p className="text-4xl font-bold text-[var(--color-primario)]">{puntuacion.toFixed(1)}</p>
        <div className="mt-3 flex justify-center gap-2 text-sm">
          <Badge tono="exito">{correctas} correctas</Badge>
          <Badge tono="error">{incorrectas} falladas</Badge>
          {sinResponder > 0 && <Badge tono="aviso">{sinResponder} sin responder</Badge>}
        </div>
      </Tarjeta>

      <div className="flex gap-3">
        <Link
          href="/repaso-fallos"
          className="flex-1 rounded-xl border border-[var(--color-borde)] px-4 py-2.5 text-center text-sm font-medium"
        >
          Repasar mis fallos
        </Link>
        <Link
          href="/test/nuevo"
          className="flex-1 rounded-xl bg-[var(--color-primario)] px-4 py-2.5 text-center text-sm font-medium text-white"
        >
          Otro test
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {preguntas.map((p, indice) => (
          <TarjetaPreguntaCorregida key={p.preguntaId + indice} pregunta={p} numero={indice + 1} />
        ))}
      </div>
    </div>
  );
}

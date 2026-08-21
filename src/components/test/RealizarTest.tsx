"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Tarjeta } from "@/components/ui/Tarjeta";
import type { Letra, Opcion } from "@/types/db";

interface PreguntaTest {
  testPreguntaId: string;
  enunciado: string;
  opciones: Opcion[];
  respuestaGuardada: Letra | null;
}

function formatearTiempo(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function RealizarTest({
  testId,
  tiempoLimiteSegundos,
  preguntas,
}: {
  testId: string;
  tiempoLimiteSegundos: number | null;
  preguntas: PreguntaTest[];
}) {
  const router = useRouter();
  const [indice, setIndice] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, Letra>>(() => {
    const iniciales: Record<string, Letra> = {};
    for (const p of preguntas) if (p.respuestaGuardada) iniciales[p.testPreguntaId] = p.respuestaGuardada;
    return iniciales;
  });
  const [tiempoRestante, setTiempoRestante] = useState(tiempoLimiteSegundos);
  const [enviando, setEnviando] = useState(false);

  const preguntaActual = preguntas[indice];
  const respondidas = Object.keys(respuestas).length;

  const finalizar = useMemo(
    () => async () => {
      setEnviando(true);
      const cuerpo = {
        respuestas: preguntas.map((p) => ({
          testPreguntaId: p.testPreguntaId,
          respuesta: respuestas[p.testPreguntaId] ?? null,
        })),
      };
      await fetch(`/api/tests/${testId}/finalizar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpo),
      });
      router.push(`/test/${testId}/resultado`);
    },
    [preguntas, respuestas, testId, router]
  );

  useEffect(() => {
    if (tiempoRestante == null) return;
    if (tiempoRestante <= 0) {
      finalizar();
      return;
    }
    const id = setTimeout(() => setTiempoRestante((t) => (t == null ? null : t - 1)), 1000);
    return () => clearTimeout(id);
  }, [tiempoRestante, finalizar]);

  if (!preguntaActual) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          Pregunta {indice + 1} de {preguntas.length}
        </span>
        {tiempoRestante != null && (
          <span
            className={`font-mono font-semibold ${tiempoRestante < 30 ? "text-[var(--color-error)]" : ""}`}
          >
            {formatearTiempo(tiempoRestante)}
          </span>
        )}
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-borde)]">
        <div
          className="h-full bg-[var(--color-primario)] transition-all"
          style={{ width: `${((indice + 1) / preguntas.length) * 100}%` }}
        />
      </div>

      <Tarjeta>
        <p className="text-base font-medium leading-relaxed">{preguntaActual.enunciado}</p>
        <div className="mt-4 flex flex-col gap-2.5">
          {preguntaActual.opciones.map((opcion) => {
            const seleccionada = respuestas[preguntaActual.testPreguntaId] === opcion.letra;
            return (
              <button
                key={opcion.letra}
                type="button"
                onClick={() =>
                  setRespuestas((prev) => ({ ...prev, [preguntaActual.testPreguntaId]: opcion.letra }))
                }
                className={`flex items-start gap-3 rounded-xl border p-3.5 text-left text-sm ${
                  seleccionada
                    ? "border-[var(--color-primario)] bg-[var(--color-primario-suave)]"
                    : "border-[var(--color-borde)]"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    seleccionada ? "bg-[var(--color-primario)] text-white" : "bg-[var(--color-borde)]"
                  }`}
                >
                  {opcion.letra}
                </span>
                <span className="pt-0.5">{opcion.texto}</span>
              </button>
            );
          })}
        </div>
      </Tarjeta>

      <div className="flex gap-3">
        <Boton
          type="button"
          variante="secundario"
          className="flex-1"
          disabled={indice === 0}
          onClick={() => setIndice((i) => Math.max(0, i - 1))}
        >
          Anterior
        </Boton>
        {indice < preguntas.length - 1 ? (
          <Boton type="button" className="flex-1" onClick={() => setIndice((i) => i + 1)}>
            Siguiente
          </Boton>
        ) : (
          <Boton type="button" className="flex-1" cargando={enviando} onClick={finalizar}>
            Finalizar test
          </Boton>
        )}
      </div>

      <p className="text-center text-xs text-[var(--color-texto-suave)]">
        {respondidas} de {preguntas.length} respondidas
      </p>
    </div>
  );
}

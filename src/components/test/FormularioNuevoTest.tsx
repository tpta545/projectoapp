"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Boton } from "@/components/ui/Boton";
import { Select } from "@/components/ui/Input";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { OPCIONES_NUM_PREGUNTAS } from "@/lib/dominio/oposiciones";
import type { Dificultad, DificultadTest } from "@/types/db";

interface DocumentoOpcion {
  id: string;
  nombre_archivo: string;
  oposicion: string;
}

const ETIQUETA_DIFICULTAD: Record<DificultadTest, string> = {
  facil: "Fácil",
  media: "Media",
  dificil: "Difícil",
  mixta: "Mixta",
};

export function FormularioNuevoTest({
  documentos,
  numPreguntasDefecto,
  dificultadDefecto,
}: {
  documentos: DocumentoOpcion[];
  numPreguntasDefecto: 10 | 25 | 50;
  dificultadDefecto: Dificultad;
}) {
  const router = useRouter();
  const [documentoId, setDocumentoId] = useState(documentos[0]?.id ?? "");
  const [numPreguntas, setNumPreguntas] = useState(numPreguntasDefecto);
  const [dificultad, setDificultad] = useState<DificultadTest>(dificultadDefecto);
  const [activarTemporizador, setActivarTemporizador] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [progreso, setProgreso] = useState<string | null>(null);

  async function alEnviar(evento: FormEvent) {
    evento.preventDefault();
    setError(null);
    setCargando(true);
    setProgreso("Preparando tus preguntas… puede tardar unos segundos.");

    const respuesta = await fetch("/api/tests/generar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentoId, numPreguntas, dificultad, activarTemporizador }),
    });
    const datos = await respuesta.json();
    setCargando(false);
    setProgreso(null);

    if (!respuesta.ok) {
      setError(datos.error ?? "No se pudo generar el test.");
      return;
    }

    router.push(`/test/${datos.testId}`);
  }

  return (
    <Tarjeta>
      <form className="flex flex-col gap-4" onSubmit={alEnviar}>
        <Select
          id="documento"
          etiqueta="Tema"
          value={documentoId}
          onChange={(e) => setDocumentoId(e.target.value)}
        >
          {documentos.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nombre_archivo}
            </option>
          ))}
        </Select>

        <div>
          <span className="text-sm font-medium">Número de preguntas</span>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {OPCIONES_NUM_PREGUNTAS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNumPreguntas(n)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-medium ${
                  numPreguntas === n
                    ? "border-[var(--color-primario)] bg-[var(--color-primario-suave)] text-[var(--color-primario)]"
                    : "border-[var(--color-borde)]"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <Select
          id="dificultad"
          etiqueta="Dificultad"
          value={dificultad}
          onChange={(e) => setDificultad(e.target.value as DificultadTest)}
        >
          {Object.entries(ETIQUETA_DIFICULTAD).map(([clave, etiqueta]) => (
            <option key={clave} value={clave}>
              {etiqueta}
            </option>
          ))}
        </Select>

        <label className="flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={activarTemporizador}
            onChange={(e) => setActivarTemporizador(e.target.checked)}
          />
          Activar temporizador
        </label>

        {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
        {progreso && <p className="text-sm text-[var(--color-texto-suave)]">{progreso}</p>}

        <Boton type="submit" cargando={cargando} className="w-full">
          Generar test
        </Boton>
      </form>
    </Tarjeta>
  );
}

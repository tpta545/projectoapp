"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Boton } from "@/components/ui/Boton";
import { Tarjeta } from "@/components/ui/Tarjeta";
import type { Letra, Opcion } from "@/types/db";

export interface PreguntaCorregida {
  preguntaId: string;
  enunciado: string;
  opcionesMostradas: Opcion[];
  letraCorrectaMostrada: Letra | null;
  respuestaUsuario: Letra | null;
  esCorrecta: boolean | null;
  explicacion: string;
  fragmentoTexto: string;
  paginaInicio: number | null;
  paginaFin: number | null;
}

export function TarjetaPreguntaCorregida({
  pregunta,
  numero,
}: {
  pregunta: PreguntaCorregida;
  numero: number;
}) {
  const [impugnando, setImpugnando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviarImpugnacion() {
    if (motivo.trim().length < 5) {
      setError("Cuéntanos brevemente el motivo (mínimo 5 caracteres).");
      return;
    }
    setEnviando(true);
    setError(null);
    const respuesta = await fetch(`/api/preguntas/${pregunta.preguntaId}/impugnar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ motivo }),
    });
    const datos = await respuesta.json();
    setEnviando(false);
    if (!respuesta.ok) {
      setError(datos.error ?? "No se pudo enviar la impugnación.");
      return;
    }
    setEnviado(true);
    setImpugnando(false);
  }

  return (
    <Tarjeta>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-relaxed">
          {numero}. {pregunta.enunciado}
        </p>
        {pregunta.esCorrecta === true && <Badge tono="exito">Correcta</Badge>}
        {pregunta.esCorrecta === false && <Badge tono="error">Fallada</Badge>}
        {pregunta.respuestaUsuario == null && <Badge tono="aviso">Sin responder</Badge>}
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {pregunta.opcionesMostradas.map((opcion) => {
          const esCorrecta = opcion.letra === pregunta.letraCorrectaMostrada;
          const esElegidaIncorrecta = opcion.letra === pregunta.respuestaUsuario && !esCorrecta;
          return (
            <div
              key={opcion.letra}
              className={`flex items-start gap-3 rounded-xl border p-3 text-sm ${
                esCorrecta
                  ? "border-[var(--color-exito)] bg-[var(--color-exito-suave)]"
                  : esElegidaIncorrecta
                    ? "border-[var(--color-error)] bg-[var(--color-error-suave)]"
                    : "border-[var(--color-borde)]"
              }`}
            >
              <span className="font-semibold">{opcion.letra})</span>
              <span>{opcion.texto}</span>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-sm text-[var(--color-texto-suave)]">{pregunta.explicacion}</p>

      <div className="mt-3 rounded-xl border border-dashed border-[var(--color-borde)] p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-texto-suave)]">
          Fuente en tu temario
          {pregunta.paginaInicio &&
            ` · pág. ${pregunta.paginaInicio}${
              pregunta.paginaFin && pregunta.paginaFin !== pregunta.paginaInicio ? `-${pregunta.paginaFin}` : ""
            }`}
        </p>
        <p className="mt-1.5 text-sm italic text-[var(--color-texto)]">&quot;{pregunta.fragmentoTexto}&quot;</p>
      </div>

      <div className="mt-3">
        {enviado ? (
          <p className="text-sm text-[var(--color-texto-suave)]">Impugnación enviada. Gracias.</p>
        ) : impugnando ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="¿Por qué crees que esta pregunta está mal?"
              rows={2}
              className="rounded-xl border border-[var(--color-borde)] p-2.5 text-sm outline-none focus:border-[var(--color-primario)]"
            />
            {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
            <div className="flex gap-2">
              <Boton variante="secundario" className="flex-1" onClick={() => setImpugnando(false)}>
                Cancelar
              </Boton>
              <Boton className="flex-1" cargando={enviando} onClick={enviarImpugnacion}>
                Enviar
              </Boton>
            </div>
          </div>
        ) : (
          <button onClick={() => setImpugnando(true)} className="text-sm font-medium text-[var(--color-error)]">
            Impugnar esta pregunta
          </button>
        )}
      </div>
    </Tarjeta>
  );
}

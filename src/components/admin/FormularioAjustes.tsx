"use client";

import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Tarjeta } from "@/components/ui/Tarjeta";
import type { Ajustes } from "@/lib/dominio/ajustes";

const ETIQUETAS: Record<keyof Ajustes, string> = {
  num_preguntas_defecto: "Nº de preguntas por defecto (10/25/50)",
  dificultad_defecto: "Dificultad por defecto (facil/media/dificil)",
  tiempo_por_pregunta_segundos_defecto: "Segundos por pregunta (temporizador)",
  penalizacion_fraccion_defecto: "Penalización por fallo (fracción 0-1)",
  colchon_min_por_tema: "Colchón mínimo de preguntas por documento",
  factor_sobregeneracion: "Factor de sobregeneración (N × factor)",
  umbral_similitud_opciones: "Umbral similitud entre opciones (0-1)",
  umbral_similitud_semantica_preguntas: "Umbral similitud semántica entre preguntas (0-1)",
  puntuacion_minima_auditor: "Puntuación mínima del auditor (1-5)",
};

export function FormularioAjustes({ ajustes }: { ajustes: Ajustes }) {
  const [valores, setValores] = useState<Record<string, string>>(
    Object.fromEntries(Object.entries(ajustes).map(([clave, valor]) => [clave, String(valor)]))
  );
  const [guardando, setGuardando] = useState<string | null>(null);
  const [guardado, setGuardado] = useState<string | null>(null);

  async function guardar(clave: keyof Ajustes) {
    setGuardando(clave);
    setGuardado(null);
    const valorTexto = valores[clave] ?? "";
    const valorFinal = clave === "dificultad_defecto" ? valorTexto : Number(valorTexto);

    await fetch("/api/admin/ajustes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clave, valor: valorFinal }),
    });

    setGuardando(null);
    setGuardado(clave);
    setTimeout(() => setGuardado(null), 2000);
  }

  return (
    <Tarjeta className="flex flex-col gap-4">
      {(Object.keys(ETIQUETAS) as (keyof Ajustes)[]).map((clave) => (
        <div key={clave} className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" htmlFor={clave}>
            {ETIQUETAS[clave]}
          </label>
          <div className="flex gap-2">
            <input
              id={clave}
              value={valores[clave] ?? ""}
              onChange={(e) => setValores((prev) => ({ ...prev, [clave]: e.target.value }))}
              className="flex-1 rounded-xl border border-[var(--color-borde)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primario)]"
            />
            <Boton
              type="button"
              variante="secundario"
              cargando={guardando === clave}
              onClick={() => guardar(clave)}
              className="shrink-0"
            >
              {guardado === clave ? "Guardado" : "Guardar"}
            </Boton>
          </div>
        </div>
      ))}
    </Tarjeta>
  );
}

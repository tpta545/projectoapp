import type { Letra, Opcion } from "@/types/db";
import { extraerCitas } from "./extraerCifras";
import { normalizarTexto, similitudTextual } from "./similitudTexto";

export interface ResultadoCapa0 {
  aprobada: boolean;
  motivo?: string;
}

const LETRAS_ESPERADAS: Letra[] = ["A", "B", "C", "D"];
const PATRON_TODAS_NINGUNA = /\b(todas|ninguna)(\s+\w+){0,3}\s+anterior(es)?\b/i;

/**
 * Capa 0 del motor de validación: comprobaciones deterministas en código, sin IA.
 * No conoce nada de Supabase ni de red — recibe todo lo necesario por parámetro
 * para poder testearse de forma aislada.
 */
export function validarCapa0(params: {
  enunciado: string;
  opciones: Opcion[];
  respuestaCorrecta: Letra;
  explicacion: string;
  fragmento: string;
  umbralSimilitudOpciones: number;
}): ResultadoCapa0 {
  const { opciones, respuestaCorrecta, enunciado, explicacion, fragmento, umbralSimilitudOpciones } =
    params;

  if (opciones.length !== 4) {
    return { aprobada: false, motivo: `Tiene ${opciones.length} opciones en lugar de 4.` };
  }

  const letras = [...opciones.map((o) => o.letra)].sort();
  if (JSON.stringify(letras) !== JSON.stringify(LETRAS_ESPERADAS)) {
    return { aprobada: false, motivo: "Las opciones no usan exactamente las letras A, B, C y D." };
  }

  if (!opciones.some((o) => o.letra === respuestaCorrecta)) {
    return { aprobada: false, motivo: "La respuesta marcada como correcta no existe entre las opciones." };
  }

  for (let i = 0; i < opciones.length; i++) {
    for (let j = i + 1; j < opciones.length; j++) {
      const oi = opciones[i];
      const oj = opciones[j];
      if (!oi || !oj) continue;
      const similitud = similitudTextual(oi.texto, oj.texto);
      if (similitud >= umbralSimilitudOpciones) {
        return {
          aprobada: false,
          motivo: `Las opciones ${oi.letra} y ${oj.letra} son casi idénticas (similitud ${similitud.toFixed(2)}).`,
        };
      }
    }
  }

  const opcionProblematica = opciones.find((o) => PATRON_TODAS_NINGUNA.test(o.texto));
  if (opcionProblematica) {
    return {
      aprobada: false,
      motivo: `La opción ${opcionProblematica.letra} contiene "todas/ninguna de las anteriores".`,
    };
  }

  const fragmentoNormalizado = normalizarTexto(fragmento);
  const textoACitar = [enunciado, ...opciones.map((o) => o.texto), explicacion].join(" ");
  for (const cita of extraerCitas(textoACitar)) {
    if (!fragmentoNormalizado.includes(normalizarTexto(cita))) {
      return {
        aprobada: false,
        motivo: `Cita "${cita}" que no aparece literalmente en el fragmento de origen.`,
      };
    }
  }

  return { aprobada: true };
}

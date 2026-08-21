import type { Letra, Opcion } from "@/types/db";

export interface CandidataValidada {
  opciones: Opcion[];
  respuestaCorrecta: Letra;
}

const LETRAS: Letra[] = ["A", "B", "C", "D"];

function esLaMasLarga(opciones: Opcion[], respuestaCorrecta: Letra): boolean {
  const correcta = opciones.find((o) => o.letra === respuestaCorrecta);
  if (!correcta) return false;
  return opciones.every((o) => o.letra === respuestaCorrecta || o.texto.length < correcta.texto.length);
}

function barajar<T>(items: T[]): T[] {
  const copia = [...items];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copia[i]!;
    copia[i] = copia[j]!;
    copia[j] = temp;
  }
  return copia;
}

/** Reordena las 4 opciones de una pregunta situando la correcta en `letraObjetivo`. */
function colocarCorrectaEn(opciones: Opcion[], respuestaCorrecta: Letra, letraObjetivo: Letra): Opcion[] {
  const correcta = opciones.find((o) => o.letra === respuestaCorrecta)!;
  const distractores = barajar(opciones.filter((o) => o.letra !== respuestaCorrecta));
  const posicionesRestantes = LETRAS.filter((l) => l !== letraObjetivo);

  const resultado: Opcion[] = new Array(4);
  resultado[LETRAS.indexOf(letraObjetivo)] = { letra: letraObjetivo, texto: correcta.texto };

  distractores.forEach((distractor, i) => {
    const letra = posicionesRestantes[i]!;
    resultado[LETRAS.indexOf(letra)] = { letra, texto: distractor.texto };
  });

  return resultado;
}

/**
 * Selecciona hasta `n` candidatas ya validadas evitando que la correcta sea
 * sistemáticamente la opción más larga, y reparte la letra correcta de forma
 * equilibrada entre las preguntas servidas en este lote.
 */
export function seleccionarLoteEquilibrado<T extends CandidataValidada>(
  candidatas: T[],
  n: number,
  proporcionMaximaCorrectaMasLarga = 0.4
): { seleccionadas: (T & { opcionesMostradas: Opcion[] })[] } {
  const barajadas = barajar(candidatas);
  const cortas = barajadas.filter((c) => !esLaMasLarga(c.opciones, c.respuestaCorrecta));
  const largas = barajadas.filter((c) => esLaMasLarga(c.opciones, c.respuestaCorrecta));

  const limiteLargas = Math.floor(n * proporcionMaximaCorrectaMasLarga);
  const elegidas: T[] = [];
  let usadasLargas = 0;

  for (const c of cortas) {
    if (elegidas.length >= n) break;
    elegidas.push(c);
  }
  for (const c of largas) {
    if (elegidas.length >= n) break;
    if (usadasLargas >= limiteLargas) continue;
    elegidas.push(c);
    usadasLargas++;
  }
  // Si el pool de "cortas" no basta para llegar a n, completa con las largas restantes.
  for (const c of largas) {
    if (elegidas.length >= n) break;
    if (elegidas.includes(c)) continue;
    elegidas.push(c);
  }

  const letraInicio = Math.floor(Math.random() * 4);
  const seleccionadas = elegidas.map((c, indice) => {
    const letraObjetivo = LETRAS[(indice + letraInicio) % 4]!;
    return { ...c, opcionesMostradas: colocarCorrectaEn(c.opciones, c.respuestaCorrecta, letraObjetivo) };
  });

  return { seleccionadas };
}

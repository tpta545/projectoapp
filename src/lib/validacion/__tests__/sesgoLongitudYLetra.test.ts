import { describe, expect, it } from "vitest";
import { seleccionarLoteEquilibrado, type CandidataValidada } from "../sesgoLongitudYLetra";
import type { Letra } from "@/types/db";

function candidataConCorrectaLarga(id: number): CandidataValidada & { id: number } {
  return {
    id,
    respuestaCorrecta: "A",
    opciones: [
      { letra: "A", texto: "Esta es la opción correcta, mucho más larga que las demás por completo" },
      { letra: "B", texto: "Corta" },
      { letra: "C", texto: "Breve" },
      { letra: "D", texto: "Otra" },
    ],
  };
}

function candidataEquilibrada(id: number): CandidataValidada & { id: number } {
  return {
    id,
    respuestaCorrecta: "A",
    opciones: [
      { letra: "A", texto: "Opción correcta normal" },
      { letra: "B", texto: "Opción distractor uno" },
      { letra: "C", texto: "Opción distractor dos" },
      { letra: "D", texto: "Opción distractor tres" },
    ],
  };
}

describe("seleccionarLoteEquilibrado", () => {
  it("limita la proporción de preguntas donde la correcta es la más larga", () => {
    const candidatas = [
      ...Array.from({ length: 10 }, (_, i) => candidataConCorrectaLarga(i)),
      ...Array.from({ length: 10 }, (_, i) => candidataEquilibrada(100 + i)),
    ];

    const { seleccionadas } = seleccionarLoteEquilibrado(candidatas, 10, 0.4);

    const conCorrectaLarga = seleccionadas.filter((s) =>
      s.opciones.find((o) => o.letra === s.respuestaCorrecta)!.texto.includes("mucho más larga")
    );
    expect(conCorrectaLarga.length).toBeLessThanOrEqual(4);
  });

  it("nunca selecciona más de las n pedidas", () => {
    const candidatas = Array.from({ length: 30 }, (_, i) => candidataEquilibrada(i));
    const { seleccionadas } = seleccionarLoteEquilibrado(candidatas, 10);
    expect(seleccionadas.length).toBe(10);
  });

  it("reparte la letra correcta mostrada de forma equilibrada", () => {
    const candidatas = Array.from({ length: 20 }, (_, i) => candidataEquilibrada(i));
    const { seleccionadas } = seleccionarLoteEquilibrado(candidatas, 20);

    const conteo: Record<Letra, number> = { A: 0, B: 0, C: 0, D: 0 };
    for (const s of seleccionadas) {
      const letraMostrada = s.opcionesMostradas.find((o) => o.texto === "Opción correcta normal")!.letra;
      conteo[letraMostrada]++;
    }

    for (const letra of ["A", "B", "C", "D"] as const) {
      expect(conteo[letra]).toBe(5);
    }
  });

  it("cada opcionesMostradas conserva las 4 opciones sin perder texto", () => {
    const candidatas = [candidataEquilibrada(1)];
    const { seleccionadas } = seleccionarLoteEquilibrado(candidatas, 1);
    const textos = seleccionadas[0]!.opcionesMostradas.map((o) => o.texto).sort();
    expect(textos).toEqual(
      ["Opción correcta normal", "Opción distractor dos", "Opción distractor tres", "Opción distractor uno"].sort()
    );
  });
});

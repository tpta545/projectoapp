import { describe, expect, it } from "vitest";
import { validarCapa0 } from "../capa0Deterministica";
import type { Opcion } from "@/types/db";

const FRAGMENTO =
  "El artículo 104 de la Constitución Española de 1978 establece que las Fuerzas y Cuerpos de Seguridad, " +
  "bajo la dependencia del Gobierno, tendrán como misión proteger el libre ejercicio de los derechos y libertades " +
  "y garantizar la seguridad ciudadana. Una ley orgánica determinará las funciones, principios básicos de actuación " +
  "y estatutos de las Fuerzas y Cuerpos de Seguridad.";

// Distractores plausibles que NO citan artículos, leyes ni cifras ausentes del fragmento.
function opciones(textos: [string, string, string, string]): Opcion[] {
  return [
    { letra: "A", texto: textos[0] },
    { letra: "B", texto: textos[1] },
    { letra: "C", texto: textos[2] },
    { letra: "D", texto: textos[3] },
  ];
}

const DISTRACTORES_SIN_CIFRAS: [string, string, string] = [
  "El Ministerio del Interior, por delegación directa del Rey",
  "El Estatuto de los Trabajadores, con carácter supletorio",
  "La Ley de Enjuiciamiento Criminal, en su exposición de motivos",
];

const BASE = {
  enunciado: "¿Qué artículo de la Constitución regula la misión de las Fuerzas y Cuerpos de Seguridad?",
  respuestaCorrecta: "A" as const,
  explicacion: "Lo establece el artículo 104 de la Constitución.",
  fragmento: FRAGMENTO,
  umbralSimilitudOpciones: 0.9,
};

describe("validarCapa0", () => {
  it("aprueba una pregunta correcta anclada al fragmento", () => {
    const resultado = validarCapa0({
      ...BASE,
      opciones: opciones(["El artículo 104", ...DISTRACTORES_SIN_CIFRAS]),
    });
    expect(resultado.aprobada).toBe(true);
  });

  it("descarta si no hay exactamente 4 opciones", () => {
    const resultado = validarCapa0({
      ...BASE,
      opciones: opciones(["El artículo 104", ...DISTRACTORES_SIN_CIFRAS]).slice(0, 3),
    });
    expect(resultado.aprobada).toBe(false);
  });

  it("descarta si las opciones no cubren exactamente A, B, C y D", () => {
    const resultado = validarCapa0({
      ...BASE,
      opciones: [
        { letra: "A", texto: "El artículo 104" },
        { letra: "B", texto: DISTRACTORES_SIN_CIFRAS[0] },
        { letra: "C", texto: DISTRACTORES_SIN_CIFRAS[1] },
        { letra: "A", texto: DISTRACTORES_SIN_CIFRAS[2] },
      ],
    });
    expect(resultado.aprobada).toBe(false);
    expect(resultado.motivo).toMatch(/letras/);
  });

  it("descarta opciones duplicadas o casi idénticas", () => {
    const resultado = validarCapa0({
      ...BASE,
      opciones: opciones([
        "El artículo 104 de la Constitución",
        "El artículo 104 de la Constitucion",
        DISTRACTORES_SIN_CIFRAS[0],
        DISTRACTORES_SIN_CIFRAS[1],
      ]),
    });
    expect(resultado.aprobada).toBe(false);
    expect(resultado.motivo).toMatch(/idénticas/);
  });

  it('descarta "todas las anteriores"', () => {
    const resultado = validarCapa0({
      ...BASE,
      opciones: opciones([
        "El artículo 104",
        DISTRACTORES_SIN_CIFRAS[0],
        DISTRACTORES_SIN_CIFRAS[1],
        "Todas las anteriores",
      ]),
    });
    expect(resultado.aprobada).toBe(false);
    expect(resultado.motivo).toMatch(/anteriores/);
  });

  it('descarta "ninguna de las anteriores"', () => {
    const resultado = validarCapa0({
      ...BASE,
      opciones: opciones([
        "El artículo 104",
        DISTRACTORES_SIN_CIFRAS[0],
        DISTRACTORES_SIN_CIFRAS[1],
        "Ninguna de las anteriores",
      ]),
    });
    expect(resultado.aprobada).toBe(false);
  });

  it("descarta si cita un artículo que no aparece en el fragmento", () => {
    const resultado = validarCapa0({
      ...BASE,
      explicacion: "Lo establece el artículo 999 de la Constitución.",
      opciones: opciones(["El artículo 104", ...DISTRACTORES_SIN_CIFRAS]),
    });
    expect(resultado.aprobada).toBe(false);
    expect(resultado.motivo).toMatch(/999/);
  });

  it("descarta si cita un plazo en días que no aparece en el fragmento", () => {
    const resultado = validarCapa0({
      ...BASE,
      explicacion: "El plazo para recurrir es de 15 días según el fragmento.",
      opciones: opciones(["El artículo 104", ...DISTRACTORES_SIN_CIFRAS]),
    });
    expect(resultado.aprobada).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { extraerCitas } from "../extraerCifras";

describe("extraerCitas", () => {
  it("extrae referencias a artículos", () => {
    const citas = extraerCitas("Según el artículo 104 y el art. 8 de la Constitución...");
    expect(citas.some((c) => c.includes("artículo 104"))).toBe(true);
    expect(citas.some((c) => c.includes("art. 8"))).toBe(true);
  });

  it("extrae referencias a leyes con formato N/AAAA", () => {
    const citas = extraerCitas("Regulado por la Ley Orgánica 2/1986, de Fuerzas y Cuerpos de Seguridad.");
    expect(citas.some((c) => c.includes("2/1986") || c.includes("2 / 1986"))).toBe(true);
  });

  it("extrae plazos con unidades de tiempo", () => {
    const citas = extraerCitas("El plazo es de 15 días desde la notificación.");
    expect(citas.some((c) => c.includes("15") && c.includes("día"))).toBe(true);
  });

  it("extrae porcentajes", () => {
    const citas = extraerCitas("Se aplicará un descuento del 50% sobre la tasa.");
    expect(citas.some((c) => c.includes("50") && c.includes("%"))).toBe(true);
  });

  it("no extrae nada de un texto sin cifras", () => {
    const citas = extraerCitas("La seguridad ciudadana es responsabilidad del Estado.");
    expect(citas.length).toBe(0);
  });
});

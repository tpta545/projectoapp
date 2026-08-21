import { describe, expect, it } from "vitest";
import { similitudTextual } from "../similitudTexto";

describe("similitudTextual", () => {
  it("da 1 para textos idénticos", () => {
    expect(similitudTextual("El artículo 104", "El artículo 104")).toBe(1);
  });

  it("da 1 para textos idénticos salvo tildes/mayúsculas", () => {
    expect(similitudTextual("El artículo 104", "el ARTICULO 104")).toBe(1);
  });

  it("da un valor alto para variaciones mínimas de un mismo texto", () => {
    const s = similitudTextual("El plazo máximo es de quince días", "El plazo máximo es de 15 días");
    expect(s).toBeGreaterThan(0.7);
  });

  it("da un valor bajo para textos distintos", () => {
    const s = similitudTextual("El Ministerio del Interior", "Las oposiciones a Guardia Civil");
    expect(s).toBeLessThan(0.4);
  });

  it("da 0 si alguno de los textos está vacío", () => {
    expect(similitudTextual("", "algo")).toBe(0);
  });
});

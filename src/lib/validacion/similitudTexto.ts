const PATRON_DIACRITICOS = new RegExp("[\\u0300-\\u036f]", "g");

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(PATRON_DIACRITICOS, "")
    .replace(/\s+/g, " ")
    .trim();
}

function bigramas(texto: string): string[] {
  const limpio = texto.replace(/[^a-z0-9 ]/g, "");
  const resultado: string[] = [];
  for (let i = 0; i < limpio.length - 1; i++) resultado.push(limpio.slice(i, i + 2));
  return resultado;
}

/** Coeficiente de Dice sobre bigramas de caracteres: 1 = idénticos, 0 = sin solapamiento. */
export function similitudTextual(a: string, b: string): number {
  const na = normalizar(a);
  const nb = normalizar(b);
  if (na === nb) return 1;
  if (!na || !nb) return 0;

  const bigA = bigramas(na);
  const bigB = bigramas(nb);
  if (bigA.length === 0 || bigB.length === 0) return 0;

  const conteoB = new Map<string, number>();
  for (const bg of bigB) conteoB.set(bg, (conteoB.get(bg) ?? 0) + 1);

  let coincidencias = 0;
  for (const bg of bigA) {
    const disponibles = conteoB.get(bg) ?? 0;
    if (disponibles > 0) {
      coincidencias++;
      conteoB.set(bg, disponibles - 1);
    }
  }

  return (2 * coincidencias) / (bigA.length + bigB.length);
}

export function normalizarTexto(texto: string): string {
  return normalizar(texto);
}

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { Spinner } from "./Spinner";

type Variante = "primario" | "secundario" | "peligro" | "fantasma";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  cargando?: boolean;
}

const CLASES_VARIANTE: Record<Variante, string> = {
  primario: "bg-[var(--color-primario)] text-white hover:bg-[var(--color-primario-hover)]",
  secundario:
    "bg-[var(--color-superficie)] text-[var(--color-texto)] border border-[var(--color-borde)] hover:bg-[var(--color-primario-suave)]",
  peligro: "bg-[var(--color-error)] text-white hover:opacity-90",
  fantasma: "bg-transparent text-[var(--color-texto)] hover:bg-[var(--color-primario-suave)]",
};

export const Boton = forwardRef<HTMLButtonElement, Props>(function Boton(
  { variante = "primario", cargando = false, disabled, className = "", children, ...resto },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || cargando}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${CLASES_VARIANTE[variante]} ${className}`}
      {...resto}
    >
      {cargando && <Spinner />}
      {children}
    </button>
  );
});

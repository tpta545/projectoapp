import { forwardRef } from "react";
import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";

interface PropsInput extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, PropsInput>(function Input(
  { etiqueta, error, id, className = "", ...resto },
  ref
) {
  return (
    <label className="flex flex-col gap-1.5 text-sm" htmlFor={id}>
      {etiqueta && <span className="font-medium text-[var(--color-texto)]">{etiqueta}</span>}
      <input
        ref={ref}
        id={id}
        className={`rounded-xl border border-[var(--color-borde)] bg-[var(--color-superficie)] px-3.5 py-3 text-[var(--color-texto)] outline-none placeholder:text-[var(--color-texto-suave)] focus:border-[var(--color-primario)] ${className}`}
        {...resto}
      />
      {error && <span className="text-[var(--color-error)]">{error}</span>}
    </label>
  );
});

interface PropsSelect extends SelectHTMLAttributes<HTMLSelectElement> {
  etiqueta?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, PropsSelect>(function Select(
  { etiqueta, error, id, className = "", children, ...resto },
  ref
) {
  return (
    <label className="flex flex-col gap-1.5 text-sm" htmlFor={id}>
      {etiqueta && <span className="font-medium text-[var(--color-texto)]">{etiqueta}</span>}
      <select
        ref={ref}
        id={id}
        className={`rounded-xl border border-[var(--color-borde)] bg-[var(--color-superficie)] px-3.5 py-3 text-[var(--color-texto)] outline-none focus:border-[var(--color-primario)] ${className}`}
        {...resto}
      >
        {children}
      </select>
      {error && <span className="text-[var(--color-error)]">{error}</span>}
    </label>
  );
});

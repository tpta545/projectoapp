type Tono = "neutro" | "exito" | "error" | "aviso" | "primario";

const CLASES_TONO: Record<Tono, string> = {
  neutro: "bg-[var(--color-borde)] text-[var(--color-texto)]",
  exito: "bg-[var(--color-exito-suave)] text-[var(--color-exito)]",
  error: "bg-[var(--color-error-suave)] text-[var(--color-error)]",
  aviso: "bg-[var(--color-aviso-suave)] text-[var(--color-aviso)]",
  primario: "bg-[var(--color-primario-suave)] text-[var(--color-primario)]",
};

export function Badge({ tono = "neutro", children }: { tono?: Tono; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${CLASES_TONO[tono]}`}>
      {children}
    </span>
  );
}

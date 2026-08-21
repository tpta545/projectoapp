export function Tarjeta({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-[var(--color-borde)] bg-[var(--color-superficie)] p-4 ${className}`}
    >
      {children}
    </div>
  );
}

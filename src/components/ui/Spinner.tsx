export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Cargando"
      className={`h-10 w-10 animate-spin rounded-full border-4 border-neutral-300 border-t-trade-red ${className}`}
    />
  )
}

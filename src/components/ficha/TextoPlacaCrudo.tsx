import { useState } from 'react'

export function TextoPlacaCrudo({ texto }: { texto: string }) {
  const [abierto, setAbierto] = useState(false)
  if (!texto.trim()) return null

  return (
    <div className="rounded-lg border-2 border-trade-border">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left font-semibold text-trade-text"
      >
        Texto completo leído en la placa
        <span aria-hidden>{abierto ? '▲' : '▼'}</span>
      </button>
      {abierto && (
        <pre className="whitespace-pre-wrap border-t-2 border-trade-border p-4 text-sm text-trade-text-muted">
          {texto}
        </pre>
      )}
    </div>
  )
}

export function AvisosLectura({ avisos }: { avisos: string[] }) {
  if (avisos.length === 0) return null

  return (
    <div className="rounded-lg bg-confianza-media-bg px-4 py-3 text-confianza-media">
      <p className="font-semibold">Avisos de lectura</p>
      <ul className="mt-1 list-inside list-disc text-sm">
        {avisos.map((aviso, i) => (
          <li key={i}>{aviso}</li>
        ))}
      </ul>
    </div>
  )
}

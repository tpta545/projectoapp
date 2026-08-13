import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variante = 'primario' | 'secundario' | 'peligro' | 'fantasma'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante
  children: ReactNode
}

const ESTILOS: Record<Variante, string> = {
  primario: 'bg-trade-red text-trade-white active:bg-trade-red-dark disabled:bg-neutral-300',
  secundario:
    'bg-trade-black text-trade-white active:bg-neutral-800 disabled:bg-neutral-300',
  peligro: 'bg-confianza-baja text-trade-white active:brightness-90 disabled:bg-neutral-300',
  fantasma:
    'bg-transparent text-trade-black border-2 border-trade-black active:bg-neutral-100 disabled:border-neutral-300 disabled:text-neutral-300',
}

export function Boton({ variante = 'primario', className = '', children, ...resto }: Props) {
  return (
    <button
      className={`flex w-full items-center justify-center gap-2 rounded-lg px-6 py-4 text-lg font-bold tracking-tight transition-colors disabled:cursor-not-allowed ${ESTILOS[variante]} ${className}`}
      {...resto}
    >
      {children}
    </button>
  )
}

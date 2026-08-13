import type { InputHTMLAttributes } from 'react'

export function Input({ className = '', ...resto }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-lg border-2 border-trade-border bg-trade-surface px-4 py-3 text-lg text-trade-text focus:border-trade-red focus:outline-none ${className}`}
      {...resto}
    />
  )
}

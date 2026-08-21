"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const PESTANAS = [
  { href: "/panel", etiqueta: "Panel", icono: "M4 12l8-8 8 8M6 10v10h12V10" },
  { href: "/documentos", etiqueta: "Temario", icono: "M6 4h9l5 5v11H6zM15 4v5h5" },
  { href: "/historial", etiqueta: "Historial", icono: "M12 8v4l3 3M12 21a9 9 0 100-18 9 9 0 000 18z" },
  { href: "/cuenta", etiqueta: "Cuenta", icono: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 20c0-4 4-6 8-6s8 2 8 6" },
];

export function BarraInferior() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-[var(--color-borde)] bg-[var(--color-superficie)] pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-2xl justify-around">
        {PESTANAS.map((pestana) => {
          const activa = pathname === pestana.href || pathname.startsWith(pestana.href + "/");
          return (
            <Link
              key={pestana.href}
              href={pestana.href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs ${
                activa ? "text-[var(--color-primario)]" : "text-[var(--color-texto-suave)]"
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <path d={pestana.icono} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {pestana.etiqueta}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

import Link from "next/link";

export default function LayoutMarketing({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-[var(--color-borde)]">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight text-[var(--color-primario)]">
            TESTARIO
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/login" className="rounded-lg px-3 py-2 hover:bg-[var(--color-primario-suave)]">
              Entrar
            </Link>
            <Link
              href="/registro"
              className="rounded-lg bg-[var(--color-primario)] px-3 py-2 font-medium text-white"
            >
              Empezar gratis
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-[var(--color-borde)] py-8 text-sm text-[var(--color-texto-suave)]">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4">
          <p>
            TESTARIO es una herramienta de autoevaluación para opositores. No tiene vínculo oficial con
            ningún cuerpo de seguridad ni organismo público.
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/aviso-legal" className="hover:text-[var(--color-texto)]">
              Aviso legal
            </Link>
            <Link href="/privacidad" className="hover:text-[var(--color-texto)]">
              Privacidad
            </Link>
            <Link href="/cookies" className="hover:text-[var(--color-texto)]">
              Cookies
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

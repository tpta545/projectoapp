import Link from "next/link";

export default function LayoutAuth({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="mb-8 text-lg font-bold tracking-tight text-[var(--color-primario)]">
        TESTARIO
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}

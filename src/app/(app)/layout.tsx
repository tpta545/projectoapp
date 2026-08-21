import { redirect } from "next/navigation";
import { BarraInferior } from "@/components/navegacion/BarraInferior";
import { CerrarSesionBoton } from "@/components/navegacion/CerrarSesionBoton";
import { crearClienteServidor } from "@/lib/supabase/server";

export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <header className="sticky top-0 z-10 border-b border-[var(--color-borde)] bg-[var(--color-superficie)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <span className="text-base font-bold tracking-tight text-[var(--color-primario)]">TESTARIO</span>
          <CerrarSesionBoton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-5">{children}</main>
      <BarraInferior />
    </div>
  );
}

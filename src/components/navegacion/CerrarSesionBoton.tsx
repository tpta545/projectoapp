"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { crearClienteNavegador } from "@/lib/supabase/client";

export function CerrarSesionBoton() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);

  async function alHacerClic() {
    setCargando(true);
    const supabase = crearClienteNavegador();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={alHacerClic}
      disabled={cargando}
      className="text-sm font-medium text-[var(--color-texto-suave)] hover:text-[var(--color-texto)] disabled:opacity-60"
    >
      Salir
    </button>
  );
}

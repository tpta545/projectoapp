"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { crearClienteNavegador } from "@/lib/supabase/client";

export function BorrarCuentaBoton() {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function borrar() {
    setCargando(true);
    await fetch("/api/cuenta/borrar", { method: "DELETE" });
    const supabase = crearClienteNavegador();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (!confirmando) {
    return (
      <Boton variante="peligro" className="mt-3 w-full" onClick={() => setConfirmando(true)}>
        Borrar mi cuenta
      </Boton>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      <p className="text-sm font-medium text-[var(--color-error)]">
        ¿Seguro? Esta acción no se puede deshacer.
      </p>
      <div className="flex gap-2">
        <Boton variante="secundario" className="flex-1" onClick={() => setConfirmando(false)}>
          Cancelar
        </Boton>
        <Boton variante="peligro" className="flex-1" cargando={cargando} onClick={borrar}>
          Sí, borrar todo
        </Boton>
      </div>
    </div>
  );
}

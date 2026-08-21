import { crearClienteAdmin } from "@/lib/supabase/admin";
import { crearClienteServidor } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { BorrarCuentaBoton } from "@/components/cuenta/BorrarCuentaBoton";
import Link from "next/link";

export default async function PaginaCuenta() {
  const supabaseSesion = await crearClienteServidor();
  const {
    data: { user },
  } = await supabaseSesion.auth.getUser();
  if (!user) return null;

  const supabase = crearClienteAdmin();
  const { data: perfil } = await supabase.from("perfiles").select("plan, creado_en").eq("id", user.id).single();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Mi cuenta</h1>

      <Tarjeta>
        <p className="text-sm text-[var(--color-texto-suave)]">Correo</p>
        <p className="font-medium">{user.email}</p>
        <p className="mt-3 text-sm text-[var(--color-texto-suave)]">Plan</p>
        <Badge tono={perfil?.plan === "premium" ? "primario" : "neutro"}>
          {perfil?.plan === "premium" ? "Premium" : "Gratis"}
        </Badge>
      </Tarjeta>

      <Tarjeta>
        <p className="text-sm font-medium">Legal</p>
        <div className="mt-2 flex flex-col gap-1.5 text-sm text-[var(--color-primario)]">
          <Link href="/aviso-legal">Aviso legal</Link>
          <Link href="/privacidad">Política de privacidad</Link>
          <Link href="/cookies">Política de cookies</Link>
        </div>
      </Tarjeta>

      <Tarjeta className="border-[var(--color-error)]">
        <p className="text-sm font-medium text-[var(--color-error)]">Zona de peligro</p>
        <p className="mt-1.5 text-sm text-[var(--color-texto-suave)]">
          Esto borrará tu cuenta, todos tus documentos, preguntas, tests e historial de forma permanente.
        </p>
        <BorrarCuentaBoton />
      </Tarjeta>
    </div>
  );
}

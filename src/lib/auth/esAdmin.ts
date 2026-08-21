import { crearClienteAdmin } from "@/lib/supabase/admin";

export async function esAdmin(usuarioId: string): Promise<boolean> {
  const supabase = crearClienteAdmin();
  const { data } = await supabase.from("admins").select("usuario_id").eq("usuario_id", usuarioId).maybeSingle();
  return !!data;
}

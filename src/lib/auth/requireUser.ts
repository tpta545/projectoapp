import { crearClienteServidor } from "@/lib/supabase/server";

/** Usuario autenticado a partir de la cookie de sesión, o null si no hay sesión válida. */
export async function obtenerUsuarioAutenticado() {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

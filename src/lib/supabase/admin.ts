import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/db";

// Cliente con service role: solo para uso en servidor (route handlers / jobs).
// Ignora RLS por completo — nunca importar desde código de cliente.
export function crearClienteAdmin() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

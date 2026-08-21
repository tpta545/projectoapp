import { NextResponse } from "next/server";
import { obtenerUsuarioAutenticado } from "@/lib/auth/requireUser";
import { esAdmin } from "@/lib/auth/esAdmin";
import { crearClienteServidor } from "@/lib/supabase/server";

export async function GET() {
  const usuario = await obtenerUsuarioAutenticado();
  if (!usuario) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  if (!(await esAdmin(usuario.id))) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  // Se llama con el cliente ligado a la sesión: dentro de la función SQL
  // `admin_metricas` (SECURITY DEFINER) se vuelve a comprobar auth.uid() contra
  // la tabla `admins`, como segunda barrera independiente del chequeo de arriba.
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.rpc("admin_metricas", {});
  if (error) {
    return NextResponse.json({ error: "No se pudieron calcular las métricas." }, { status: 500 });
  }

  return NextResponse.json(data);
}

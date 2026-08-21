import { NextResponse } from "next/server";
import { obtenerUsuarioAutenticado } from "@/lib/auth/requireUser";
import { crearClienteAdmin } from "@/lib/supabase/admin";

export async function DELETE() {
  const usuario = await obtenerUsuarioAutenticado();
  if (!usuario) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const supabase = crearClienteAdmin();

  const { data: archivos } = await supabase.storage.from("documentos").list(usuario.id);
  if (archivos && archivos.length > 0) {
    await supabase.storage.from("documentos").remove(archivos.map((a) => `${usuario.id}/${a.name}`));
  }

  // El borrado de auth.users hace cascade sobre perfiles y, desde ahí, sobre
  // documentos, temas, fragmentos, preguntas, validaciones, tests e impugnaciones.
  const { error } = await supabase.auth.admin.deleteUser(usuario.id);
  if (error) {
    return NextResponse.json({ error: "No se pudo borrar la cuenta." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

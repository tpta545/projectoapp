import { NextResponse } from "next/server";
import { obtenerUsuarioAutenticado } from "@/lib/auth/requireUser";
import { crearClienteAdmin } from "@/lib/supabase/admin";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const usuario = await obtenerUsuarioAutenticado();
  if (!usuario) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const { id } = await params;
  const supabase = crearClienteAdmin();

  const { data: documento } = await supabase
    .from("documentos")
    .select("id, usuario_id, storage_path")
    .eq("id", id)
    .single();
  if (!documento || documento.usuario_id !== usuario.id) {
    return NextResponse.json({ error: "Documento no encontrado." }, { status: 404 });
  }

  await supabase.storage.from("documentos").remove([documento.storage_path]);
  // El resto (temas, fragmentos, preguntas, validaciones, tests) cae en cascada.
  await supabase.from("documentos").delete().eq("id", id);

  return NextResponse.json({ ok: true });
}

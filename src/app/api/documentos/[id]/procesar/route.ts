import { after, NextResponse } from "next/server";
import { obtenerUsuarioAutenticado } from "@/lib/auth/requireUser";
import { procesarDocumento } from "@/lib/documentos/procesar";
import { crearClienteAdmin } from "@/lib/supabase/admin";

export const maxDuration = 60;

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const usuario = await obtenerUsuarioAutenticado();
  if (!usuario) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const { id } = await params;
  const supabase = crearClienteAdmin();
  const { data: documento } = await supabase
    .from("documentos")
    .select("id, usuario_id, estado")
    .eq("id", id)
    .single();

  if (!documento || documento.usuario_id !== usuario.id) {
    return NextResponse.json({ error: "Documento no encontrado." }, { status: 404 });
  }
  if (documento.estado === "procesando") {
    return NextResponse.json({ error: "El documento ya se está procesando." }, { status: 409 });
  }

  await supabase.from("documentos").update({ estado: "procesando", error_mensaje: null }).eq("id", id);
  after(() => procesarDocumento(id));

  return NextResponse.json({ ok: true });
}

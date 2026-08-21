import { NextResponse } from "next/server";
import { obtenerUsuarioAutenticado } from "@/lib/auth/requireUser";
import { crearClienteAdmin } from "@/lib/supabase/admin";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const usuario = await obtenerUsuarioAutenticado();
  if (!usuario) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const { id } = await params;
  const supabase = crearClienteAdmin();

  const { data: documento } = await supabase
    .from("documentos")
    .select("id, usuario_id, estado, error_mensaje, num_paginas")
    .eq("id", id)
    .single();
  if (!documento || documento.usuario_id !== usuario.id) {
    return NextResponse.json({ error: "Documento no encontrado." }, { status: 404 });
  }

  const [{ count: numFragmentos }, { count: numPreguntasValidadas }] = await Promise.all([
    supabase.from("fragmentos").select("id", { count: "exact", head: true }).eq("documento_id", id),
    supabase
      .from("preguntas")
      .select("id", { count: "exact", head: true })
      .eq("documento_id", id)
      .in("estado", ["validada", "publicada"]),
  ]);

  return NextResponse.json({
    estado: documento.estado,
    errorMensaje: documento.error_mensaje,
    numPaginas: documento.num_paginas,
    numFragmentos: numFragmentos ?? 0,
    numPreguntasValidadas: numPreguntasValidadas ?? 0,
  });
}

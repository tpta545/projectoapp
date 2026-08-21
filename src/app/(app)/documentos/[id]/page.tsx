import { notFound } from "next/navigation";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { crearClienteServidor } from "@/lib/supabase/server";
import { EstadoDocumento } from "@/components/documentos/EstadoDocumento";
import { NOMBRE_OPOSICION } from "@/lib/dominio/oposiciones";

export default async function PaginaDetalleDocumento({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabaseSesion = await crearClienteServidor();
  const {
    data: { user },
  } = await supabaseSesion.auth.getUser();
  if (!user) return null;

  const supabase = crearClienteAdmin();
  const [{ data: documento }, { count: numFragmentos }, { count: numPreguntasValidadas }] = await Promise.all([
    supabase.from("documentos").select("*").eq("id", id).single(),
    supabase.from("fragmentos").select("id", { count: "exact", head: true }).eq("documento_id", id),
    supabase
      .from("preguntas")
      .select("id", { count: "exact", head: true })
      .eq("documento_id", id)
      .in("estado", ["validada", "publicada"]),
  ]);

  if (!documento || documento.usuario_id !== user.id) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">{documento.nombre_archivo}</h1>
        <p className="mt-1 text-sm text-[var(--color-texto-suave)]">{NOMBRE_OPOSICION[documento.oposicion]}</p>
      </div>

      <EstadoDocumento
        documentoId={id}
        estadoInicial={{
          estado: documento.estado,
          errorMensaje: documento.error_mensaje,
          numPaginas: documento.num_paginas,
          numFragmentos: numFragmentos ?? 0,
          numPreguntasValidadas: numPreguntasValidadas ?? 0,
        }}
      />
    </div>
  );
}

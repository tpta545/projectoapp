import { after, NextResponse } from "next/server";
import { z } from "zod";
import { obtenerUsuarioAutenticado } from "@/lib/auth/requireUser";
import { procesarDocumento } from "@/lib/documentos/procesar";
import { crearClienteAdmin } from "@/lib/supabase/admin";

export const maxDuration = 60;

const TAMANO_MAXIMO_BYTES = 30 * 1024 * 1024;

const EsquemaBody = z.object({
  documentoId: z.string().uuid(),
  nombreArchivo: z.string().min(1),
  tamanoBytes: z.number().int().positive().max(TAMANO_MAXIMO_BYTES),
  oposicion: z.enum(["guardia_civil", "policia_nacional"]),
  nombreTema: z.string().trim().min(1),
  bloque: z.string().optional().nullable(),
  declaracionDerechos: z.literal(true),
});

/**
 * El PDF ya se ha subido directamente del navegador a Supabase Storage (evita
 * el límite de tamaño de body de las funciones serverless de Vercel). Esta
 * ruta solo valida que el objeto exista en la ruta esperada, registra el
 * documento y lanza el procesado en segundo plano.
 */
export async function POST(request: Request) {
  const usuario = await obtenerUsuarioAutenticado();
  if (!usuario) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const cuerpo = EsquemaBody.safeParse(await request.json());
  if (!cuerpo.success) {
    return NextResponse.json({ error: "Datos de subida no válidos." }, { status: 400 });
  }
  const { documentoId, nombreArchivo, tamanoBytes, oposicion, nombreTema, bloque } = cuerpo.data;

  const supabase = crearClienteAdmin();

  const { data: perfil } = await supabase.from("perfiles").select("plan").eq("id", usuario.id).single();
  const { data: limite } = await supabase
    .from("limites_plan")
    .select("documentos_max")
    .eq("plan", perfil?.plan ?? "gratis")
    .single();

  if (limite?.documentos_max != null) {
    const { count } = await supabase
      .from("documentos")
      .select("id", { count: "exact", head: true })
      .eq("usuario_id", usuario.id);
    if ((count ?? 0) >= limite.documentos_max) {
      return NextResponse.json(
        {
          error: `Tu plan permite un máximo de ${limite.documentos_max} documento(s). Elimina uno o pásate a premium.`,
        },
        { status: 403 }
      );
    }
  }

  const rutaAlmacenamiento = `${usuario.id}/${documentoId}.pdf`;

  // Comprueba que el archivo realmente se subió a esa ruta antes de crear el registro.
  const carpeta = rutaAlmacenamiento.split("/")[0]!;
  const nombreArchivoStorage = rutaAlmacenamiento.split("/")[1]!;
  const { data: listado } = await supabase.storage.from("documentos").list(carpeta, {
    search: nombreArchivoStorage,
  });
  if (!listado || listado.length === 0) {
    return NextResponse.json(
      { error: "No se encontró el archivo subido. Inténtalo de nuevo." },
      { status: 400 }
    );
  }

  const { error: errorInsercion } = await supabase.from("documentos").insert({
    id: documentoId,
    usuario_id: usuario.id,
    oposicion,
    nombre_archivo: nombreArchivo,
    storage_path: rutaAlmacenamiento,
    tamano_bytes: tamanoBytes,
    num_paginas: null,
    estado: "subido",
    error_mensaje: null,
    declaracion_derechos: true,
    procesado_en: null,
  });
  if (errorInsercion) {
    await supabase.storage.from("documentos").remove([rutaAlmacenamiento]);
    return NextResponse.json({ error: "No se pudo registrar el documento." }, { status: 500 });
  }

  await supabase.from("temas").insert({
    documento_id: documentoId,
    nombre: nombreTema,
    bloque: bloque && bloque.length > 0 ? bloque : null,
    orden: 0,
  });

  after(() => procesarDocumento(documentoId));

  return NextResponse.json({ documentoId });
}

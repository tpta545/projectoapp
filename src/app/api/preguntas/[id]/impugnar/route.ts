import { NextResponse } from "next/server";
import { z } from "zod";
import { obtenerUsuarioAutenticado } from "@/lib/auth/requireUser";
import { crearClienteAdmin } from "@/lib/supabase/admin";

const LIMITE_IMPUGNACIONES_PARA_RETIRAR = 3;

const EsquemaBody = z.object({
  motivo: z.string().trim().min(5, "Cuéntanos brevemente el motivo.").max(500),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const usuario = await obtenerUsuarioAutenticado();
  if (!usuario) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const { id: preguntaId } = await params;
  const cuerpo = EsquemaBody.safeParse(await request.json());
  if (!cuerpo.success) {
    return NextResponse.json({ error: cuerpo.error.issues[0]?.message ?? "Motivo no válido." }, { status: 400 });
  }

  const supabase = crearClienteAdmin();

  // Solo puede impugnar quien realmente ha recibido esta pregunta en un test propio.
  const { data: servida } = await supabase
    .from("test_preguntas")
    .select("id, tests!inner(usuario_id)")
    .eq("pregunta_id", preguntaId)
    .eq("tests.usuario_id", usuario.id)
    .limit(1)
    .maybeSingle();

  if (!servida) {
    return NextResponse.json({ error: "No puedes impugnar una pregunta que no se te ha servido." }, { status: 403 });
  }

  const { error: errorInsercion } = await supabase.from("impugnaciones").insert({
    pregunta_id: preguntaId,
    usuario_id: usuario.id,
    motivo: cuerpo.data.motivo,
  });

  if (errorInsercion) {
    if (errorInsercion.code === "23505") {
      return NextResponse.json({ error: "Ya has impugnado esta pregunta." }, { status: 409 });
    }
    return NextResponse.json({ error: "No se pudo registrar la impugnación." }, { status: 500 });
  }

  const { count } = await supabase
    .from("impugnaciones")
    .select("id", { count: "exact", head: true })
    .eq("pregunta_id", preguntaId);

  let retirada = false;
  if ((count ?? 0) >= LIMITE_IMPUGNACIONES_PARA_RETIRAR) {
    // Se retira y deja de servirse. Con menos de 3 impugnaciones la pregunta
    // sigue disponible: solo queda constancia en `impugnaciones`/`validaciones`.
    await supabase
      .from("preguntas")
      .update({ estado: "retirada", veces_impugnada: count ?? 1 })
      .eq("id", preguntaId);
    retirada = true;
  } else {
    await supabase.from("preguntas").update({ veces_impugnada: count ?? 1 }).eq("id", preguntaId);
  }

  await supabase
    .from("validaciones")
    .insert({
      pregunta_id: preguntaId,
      capa: 3,
      veredicto: "descartada",
      motivo_descarte: `Impugnación de usuario: ${cuerpo.data.motivo}`,
    });

  return NextResponse.json({ ok: true, retirada });
}

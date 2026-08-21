import { NextResponse } from "next/server";
import { z } from "zod";
import { obtenerUsuarioAutenticado } from "@/lib/auth/requireUser";
import { esAdmin } from "@/lib/auth/esAdmin";
import { obtenerAjustes, actualizarAjuste, type Ajustes } from "@/lib/dominio/ajustes";

const CLAVES_VALIDAS = [
  "num_preguntas_defecto",
  "dificultad_defecto",
  "tiempo_por_pregunta_segundos_defecto",
  "penalizacion_fraccion_defecto",
  "colchon_min_por_tema",
  "factor_sobregeneracion",
  "umbral_similitud_opciones",
  "umbral_similitud_semantica_preguntas",
  "puntuacion_minima_auditor",
] as const;

const EsquemaBody = z.object({
  clave: z.enum(CLAVES_VALIDAS),
  valor: z.union([z.string(), z.number()]),
});

export async function GET() {
  const usuario = await obtenerUsuarioAutenticado();
  if (!usuario) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  if (!(await esAdmin(usuario.id))) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }
  return NextResponse.json(await obtenerAjustes());
}

export async function PATCH(request: Request) {
  const usuario = await obtenerUsuarioAutenticado();
  if (!usuario) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  if (!(await esAdmin(usuario.id))) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const cuerpo = EsquemaBody.safeParse(await request.json());
  if (!cuerpo.success) {
    return NextResponse.json({ error: "Ajuste no válido." }, { status: 400 });
  }

  await actualizarAjuste(cuerpo.data.clave, cuerpo.data.valor as Ajustes[keyof Ajustes]);
  return NextResponse.json({ ok: true });
}

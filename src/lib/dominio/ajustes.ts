import { crearClienteAdmin } from "@/lib/supabase/admin";
import type { Dificultad } from "@/types/db";

export interface Ajustes {
  num_preguntas_defecto: 10 | 25 | 50;
  dificultad_defecto: Dificultad;
  tiempo_por_pregunta_segundos_defecto: number;
  penalizacion_fraccion_defecto: number;
  colchon_min_por_tema: number;
  factor_sobregeneracion: number;
  umbral_similitud_opciones: number;
  umbral_similitud_semantica_preguntas: number;
  puntuacion_minima_auditor: number;
}

// Valores por defecto si la tabla ajustes_admin no responde o falta alguna clave.
// Nunca se usan como regla fija: el panel /admin los sobrescribe en BD.
const AJUSTES_POR_DEFECTO: Ajustes = {
  num_preguntas_defecto: 25,
  dificultad_defecto: "media",
  tiempo_por_pregunta_segundos_defecto: 60,
  penalizacion_fraccion_defecto: 0.33,
  colchon_min_por_tema: 15,
  factor_sobregeneracion: 1.6,
  umbral_similitud_opciones: 0.9,
  umbral_similitud_semantica_preguntas: 0.92,
  puntuacion_minima_auditor: 4,
};

let cache: { valores: Ajustes; expiraEn: number } | null = null;
const TTL_CACHE_MS = 30_000;

export async function obtenerAjustes(): Promise<Ajustes> {
  if (cache && cache.expiraEn > Date.now()) {
    return cache.valores;
  }

  const supabase = crearClienteAdmin();
  const { data, error } = await supabase.from("ajustes_admin").select("clave, valor");

  const valores = { ...AJUSTES_POR_DEFECTO };
  if (!error && data) {
    for (const fila of data) {
      if (fila.clave in valores) {
        // @ts-expect-error -- asignación dinámica validada por la clave
        valores[fila.clave] = fila.valor;
      }
    }
  }

  cache = { valores, expiraEn: Date.now() + TTL_CACHE_MS };
  return valores;
}

export async function actualizarAjuste(clave: keyof Ajustes, valor: Ajustes[keyof Ajustes]) {
  const supabase = crearClienteAdmin();
  await supabase
    .from("ajustes_admin")
    .update({ valor, actualizado_en: new Date().toISOString() })
    .eq("clave", clave);
  cache = null;
}

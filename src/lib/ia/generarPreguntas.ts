import { obtenerProveedorIA } from "./proveedor";
import type { Dificultad, Oposicion } from "@/types/db";
import type { PreguntaGenerada } from "./tipos";

export async function generarPreguntasDesdeFragmento(params: {
  fragmento: string;
  cantidad: number;
  dificultad: Dificultad;
  oposicion: Oposicion;
}): Promise<PreguntaGenerada[]> {
  if (params.cantidad <= 0) return [];
  const proveedor = obtenerProveedorIA();
  return proveedor.generarPreguntas(params);
}

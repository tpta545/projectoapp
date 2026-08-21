import { obtenerProveedorIA } from "./proveedor";
import type { Opcion } from "@/types/db";
import type { ResultadoAuditorCalidad } from "./tipos";

/** Capa 2: puntúa la calidad de la pregunta de 1 a 5. */
export async function auditarCalidadPregunta(params: {
  fragmento: string;
  enunciado: string;
  opciones: Opcion[];
}): Promise<ResultadoAuditorCalidad> {
  const proveedor = obtenerProveedorIA();
  return proveedor.auditarCalidad(params);
}

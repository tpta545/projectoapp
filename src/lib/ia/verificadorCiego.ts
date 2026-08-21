import { obtenerProveedorIA } from "./proveedor";
import type { Opcion } from "@/types/db";
import type { ResultadoVerificadorCiego } from "./tipos";

/** Capa 1: segunda llamada a la IA que NO recibe la respuesta correcta. */
export async function verificarPreguntaCiega(params: {
  fragmento: string;
  enunciado: string;
  opcionesDesordenadas: Opcion[];
}): Promise<ResultadoVerificadorCiego> {
  const proveedor = obtenerProveedorIA();
  return proveedor.verificarCiego(params);
}

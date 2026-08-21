import { obtenerProveedorIA } from "./proveedor";

export async function crearEmbedding(texto: string): Promise<number[]> {
  const [embedding] = await obtenerProveedorIA().crearEmbeddings([texto]);
  return embedding ?? [];
}

export async function crearEmbeddings(textos: string[]): Promise<number[][]> {
  return obtenerProveedorIA().crearEmbeddings(textos);
}

import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { EntradaHistorial, CapturaPendiente } from '../types/lectura'

interface TradeDB extends DBSchema {
  lecturas: {
    key: string
    value: EntradaHistorial
    indexes: { creadoEn: number }
  }
  cola: {
    key: string
    value: CapturaPendiente
  }
}

// Punto de extensión: cuando haya backend, esta capa pasa a sincronizar con una
// API remota (y añadir auth de usuario) en vez de vivir solo en IndexedDB local.
let dbPromise: Promise<IDBPDatabase<TradeDB>> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<TradeDB>('trade-lector-placas', 1, {
      upgrade(db) {
        const lecturas = db.createObjectStore('lecturas', { keyPath: 'id' })
        lecturas.createIndex('creadoEn', 'creadoEn')
        db.createObjectStore('cola', { keyPath: 'id' })
      },
    })
  }
  return dbPromise
}

// --- Historial de lecturas ---

export async function guardarLectura(entrada: EntradaHistorial): Promise<void> {
  const db = await getDB()
  await db.put('lecturas', entrada)
}

export async function listarLecturas(): Promise<EntradaHistorial[]> {
  const db = await getDB()
  const todas = await db.getAllFromIndex('lecturas', 'creadoEn')
  return todas.reverse() // más recientes primero
}

export async function eliminarLectura(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('lecturas', id)
}

// --- Cola de reintento offline ---

export async function encolarCaptura(captura: CapturaPendiente): Promise<void> {
  const db = await getDB()
  await db.put('cola', captura)
}

export async function listarCola(): Promise<CapturaPendiente[]> {
  const db = await getDB()
  return db.getAll('cola')
}

export async function eliminarDeCola(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('cola', id)
}

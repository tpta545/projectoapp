import type { Dificultad, Letra, Opcion, Oposicion } from "@/types/db";

export interface PreguntaGenerada {
  enunciado: string;
  opciones: Opcion[];
  respuestaCorrecta: Letra;
  explicacion: string;
}

export interface ResultadoVerificadorCiego {
  puedeResponderse: boolean;
  opcionElegida: Letra | null;
  fraseLiteral: string | null;
}

export interface ResultadoAuditorCalidad {
  puntuacion: number;
  motivo: string;
}

/** Contrato de proveedor de IA: generación, verificación ciega, auditoría y embeddings. */
export interface ProveedorIA {
  crearEmbeddings(textos: string[]): Promise<number[][]>;

  generarPreguntas(params: {
    fragmento: string;
    cantidad: number;
    dificultad: Dificultad;
    oposicion: Oposicion;
  }): Promise<PreguntaGenerada[]>;

  verificarCiego(params: {
    fragmento: string;
    enunciado: string;
    opcionesDesordenadas: Opcion[];
  }): Promise<ResultadoVerificadorCiego>;

  auditarCalidad(params: {
    fragmento: string;
    enunciado: string;
    opciones: Opcion[];
  }): Promise<ResultadoAuditorCalidad>;
}

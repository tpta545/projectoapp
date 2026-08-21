// Tipos de la base de datos de Supabase. Reflejan supabase/migrations/0001_init.sql.
// Si cambia el esquema, actualiza este archivo a mano (Fase 1 no usa generación automática).
//
// IMPORTANTE: todos los tipos de fila usan `type`, nunca `interface`. TypeScript
// no considera que una `interface` satisfaga `extends Record<string, unknown>`
// (aunque sí sea asignable en la práctica), y supabase-js comprueba justo eso
// internamente para inferir los tipos de `.from()/.rpc()`. Si esta comprobación
// falla, todo el cliente tipado colapsa silenciosamente a `never`.

export type Oposicion = "guardia_civil" | "policia_nacional";
export type EstadoDocumento = "subido" | "procesando" | "listo" | "error";
export type Dificultad = "facil" | "media" | "dificil";
export type DificultadTest = Dificultad | "mixta";
export type EstadoPregunta = "borrador" | "validada" | "publicada" | "impugnada" | "retirada";
export type Letra = "A" | "B" | "C" | "D";
export type Veredicto = "aprobada" | "descartada";
export type EstadoTest = "en_curso" | "finalizado";
export type TipoTrabajo = "procesar_documento" | "pregenerar_colchon";
export type EstadoTrabajo = "pendiente" | "en_curso" | "completado" | "error";
export type Plan = "gratis" | "premium";

export type Opcion = {
  letra: Letra;
  texto: string;
};

type Relacion = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

// El array de relaciones solo hace falta cuando el código usa el select anidado
// de PostgREST (p. ej. `test_preguntas(... preguntas(...))`); el resto puede
// dejarlo vacío sin perder tipado en el resto de columnas.
type Tabla<Row, Insert, Update = Partial<Insert>, Rel extends Relacion[] = []> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: Rel;
};

export type PerfilRow = {
  id: string;
  email: string;
  plan: Plan;
  creado_en: string;
};

export type DocumentoRow = {
  id: string;
  usuario_id: string;
  oposicion: Oposicion;
  nombre_archivo: string;
  storage_path: string;
  tamano_bytes: number;
  num_paginas: number | null;
  estado: EstadoDocumento;
  error_mensaje: string | null;
  declaracion_derechos: boolean;
  creado_en: string;
  procesado_en: string | null;
};

export type TemaRow = {
  id: string;
  documento_id: string;
  nombre: string;
  bloque: string | null;
  orden: number;
  creado_en: string;
};

export type FragmentoRow = {
  id: string;
  documento_id: string;
  tema_id: string | null;
  contenido: string;
  pagina_inicio: number | null;
  pagina_fin: number | null;
  orden: number;
  embedding: number[] | null;
  creado_en: string;
};

export type PreguntaRow = {
  id: string;
  documento_id: string;
  fragmento_id: string;
  tema_id: string | null;
  oposicion: Oposicion;
  enunciado: string;
  opciones: Opcion[];
  respuesta_correcta: Letra;
  explicacion: string;
  dificultad: Dificultad;
  estado: EstadoPregunta;
  embedding: number[] | null;
  veces_servida: number;
  veces_impugnada: number;
  creado_en: string;
};

export type ValidacionRow = {
  id: string;
  pregunta_id: string;
  capa: 0 | 1 | 2 | 3;
  veredicto: Veredicto;
  motivo_descarte: string | null;
  frase_citada: string | null;
  puntuacion: number | null;
  creado_en: string;
};

export type ImpugnacionRow = {
  id: string;
  pregunta_id: string;
  usuario_id: string;
  motivo: string;
  creado_en: string;
};

export type TestRow = {
  id: string;
  usuario_id: string;
  documento_id: string;
  tema_id: string | null;
  oposicion: Oposicion;
  num_preguntas: 10 | 25 | 50;
  dificultad: DificultadTest;
  tiempo_limite_segundos: number | null;
  penalizacion_fraccion: number;
  estado: EstadoTest;
  puntuacion: number | null;
  iniciado_en: string;
  finalizado_en: string | null;
};

export type TestPreguntaRow = {
  id: string;
  test_id: string;
  pregunta_id: string;
  orden: number;
  opciones_mostradas: Opcion[];
  respuesta_usuario: Letra | null;
  es_correcta: boolean | null;
  tiempo_respuesta_segundos: number | null;
};

export type TrabajoRow = {
  id: string;
  tipo: TipoTrabajo;
  payload: Record<string, unknown>;
  estado: EstadoTrabajo;
  intentos: number;
  error_mensaje: string | null;
  creado_en: string;
  procesado_en: string | null;
};

export type AjusteAdminRow = {
  clave: string;
  valor: unknown;
  actualizado_en: string;
};

export type LimitePlanRow = {
  plan: Plan;
  documentos_max: number | null;
  preguntas_dia_max: number | null;
};

export type AdminRow = {
  usuario_id: string;
  creado_en: string;
};

type SinId<T> = Omit<T, "id" | "creado_en">;

export type Database = {
  public: {
    Tables: {
      perfiles: Tabla<PerfilRow, Partial<PerfilRow> & { id: string; email: string }>;
      documentos: Tabla<DocumentoRow, SinId<DocumentoRow> & { id?: string }>;
      temas: Tabla<TemaRow, SinId<TemaRow> & { id?: string }>;
      fragmentos: Tabla<FragmentoRow, SinId<FragmentoRow> & { id?: string }>;
      preguntas: Tabla<
        PreguntaRow,
        SinId<PreguntaRow> & { id?: string },
        Partial<SinId<PreguntaRow>>,
        [
          {
            foreignKeyName: "preguntas_fragmento_id_fkey";
            columns: ["fragmento_id"];
            isOneToOne: false;
            referencedRelation: "fragmentos";
            referencedColumns: ["id"];
          },
        ]
      >;
      validaciones: Tabla<
        ValidacionRow,
        Omit<SinId<ValidacionRow>, "frase_citada" | "puntuacion" | "motivo_descarte"> & {
          id?: string;
          frase_citada?: string | null;
          puntuacion?: number | null;
          motivo_descarte?: string | null;
        }
      >;
      impugnaciones: Tabla<ImpugnacionRow, SinId<ImpugnacionRow> & { id?: string }>;
      tests: Tabla<
        TestRow,
        Omit<SinId<TestRow>, "iniciado_en"> & { id?: string; iniciado_en?: string },
        Partial<SinId<TestRow>>,
        [
          {
            foreignKeyName: "tests_documento_id_fkey";
            columns: ["documento_id"];
            isOneToOne: false;
            referencedRelation: "documentos";
            referencedColumns: ["id"];
          },
        ]
      >;
      test_preguntas: Tabla<
        TestPreguntaRow,
        Omit<TestPreguntaRow, "id"> & { id?: string },
        Partial<Omit<TestPreguntaRow, "id">>,
        [
          {
            foreignKeyName: "test_preguntas_pregunta_id_fkey";
            columns: ["pregunta_id"];
            isOneToOne: false;
            referencedRelation: "preguntas";
            referencedColumns: ["id"];
          },
        ]
      >;
      trabajos: Tabla<TrabajoRow, SinId<TrabajoRow> & { id?: string }>;
      ajustes_admin: Tabla<AjusteAdminRow, AjusteAdminRow>;
      limites_plan: Tabla<LimitePlanRow, LimitePlanRow>;
      admins: Tabla<AdminRow, AdminRow>;
    };
    Views: Record<string, never>;
    Functions: {
      match_fragmentos: {
        Args: {
          p_documento_id: string;
          p_embedding: number[];
          p_match_count: number;
          p_tema_id?: string | null;
        };
        Returns: {
          id: string;
          contenido: string;
          pagina_inicio: number | null;
          pagina_fin: number | null;
          tema_id: string | null;
          similitud: number;
        }[];
      };
      preguntas_similares_embedding: {
        Args: {
          p_documento_id: string;
          p_embedding: number[];
          p_umbral: number;
        };
        Returns: { id: string; enunciado: string; similitud: number }[];
      };
      admin_metricas: {
        Args: Record<string, never>;
        Returns: {
          por_capa: { capa: number; descartadas: number; total: number; tasa_descarte: number }[];
          por_documento: {
            documento_id: string;
            nombre_archivo: string;
            descartadas: number;
            total: number;
            tasa_descarte: number;
          }[];
          preguntas_por_estado: Record<string, number>;
        };
      };
    };
  };
};

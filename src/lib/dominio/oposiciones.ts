import type { Oposicion } from "@/types/db";

export interface BloqueTemario {
  clave: string;
  nombre: string;
}

// Estructura de navegación por bloques. No implica ningún vínculo oficial con
// los cuerpos citados: solo organiza el temario que el propio usuario sube.
export const BLOQUES_POR_OPOSICION: Record<Oposicion, BloqueTemario[]> = {
  guardia_civil: [
    { clave: "ciencias_juridicas", nombre: "Ciencias jurídicas" },
    { clave: "sociotecnicas", nombre: "Materias sociotécnicas" },
    { clave: "ortografia", nombre: "Ortografía" },
    { clave: "idioma_extranjero", nombre: "Idioma extranjero" },
    { clave: "psicotecnicos", nombre: "Psicotécnicos" },
  ],
  policia_nacional: [
    { clave: "ciencias_juridicas", nombre: "Ciencias jurídicas" },
    { clave: "ciencias_sociales", nombre: "Ciencias sociales" },
    { clave: "tecnico_cientificas", nombre: "Técnico-científicas" },
    { clave: "ortografia", nombre: "Ortografía" },
    { clave: "idioma_extranjero", nombre: "Idioma extranjero" },
    { clave: "psicotecnicos", nombre: "Psicotécnicos" },
  ],
};

export const NOMBRE_OPOSICION: Record<Oposicion, string> = {
  guardia_civil: "Guardia Civil",
  policia_nacional: "Policía Nacional",
};

export const OPCIONES_NUM_PREGUNTAS = [10, 25, 50] as const;

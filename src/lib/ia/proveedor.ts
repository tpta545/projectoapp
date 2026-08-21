import { z } from "zod";
import type { ProveedorIA } from "./tipos";

const MODELO_EMBEDDINGS = process.env.GEMINI_MODEL_EMBEDDINGS || "gemini-embedding-001";
const MODELO_GENERACION = process.env.GEMINI_MODEL_GENERACION || "gemini-2.5-flash";
const DIMENSION_EMBEDDING = 1536;
const URL_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

const EsquemaOpcion = z.object({
  letra: z.enum(["A", "B", "C", "D"]),
  texto: z.string(),
});

const EsquemaPreguntaGenerada = z.object({
  enunciado: z.string(),
  opciones: z.array(EsquemaOpcion).length(4),
  respuestaCorrecta: z.enum(["A", "B", "C", "D"]),
  explicacion: z.string(),
});

const EsquemaLotePreguntas = z.object({
  preguntas: z.array(EsquemaPreguntaGenerada),
});

const EsquemaVerificadorCiego = z.object({
  puedeResponderse: z.boolean(),
  opcionElegida: z.enum(["A", "B", "C", "D"]).nullable(),
  fraseLiteral: z.string().nullable(),
});

const EsquemaAuditorCalidad = z.object({
  puntuacion: z.number().int().min(1).max(5),
  motivo: z.string(),
});

// Equivalentes en JSON Schema (formato que acepta responseSchema de Gemini)
// de los esquemas zod anteriores.
const OPCION_JSON_SCHEMA = {
  type: "object",
  properties: {
    letra: { type: "string", enum: ["A", "B", "C", "D"] },
    texto: { type: "string" },
  },
  required: ["letra", "texto"],
};

const JSON_SCHEMA_LOTE_PREGUNTAS = {
  type: "object",
  properties: {
    preguntas: {
      type: "array",
      items: {
        type: "object",
        properties: {
          enunciado: { type: "string" },
          opciones: { type: "array", items: OPCION_JSON_SCHEMA },
          respuestaCorrecta: { type: "string", enum: ["A", "B", "C", "D"] },
          explicacion: { type: "string" },
        },
        required: ["enunciado", "opciones", "respuestaCorrecta", "explicacion"],
      },
    },
  },
  required: ["preguntas"],
};

const JSON_SCHEMA_VERIFICADOR = {
  type: "object",
  properties: {
    puedeResponderse: { type: "boolean" },
    opcionElegida: { type: "string", enum: ["A", "B", "C", "D", "NINGUNA"] },
    fraseLiteral: { type: "string" },
  },
  required: ["puedeResponderse", "opcionElegida", "fraseLiteral"],
};

const JSON_SCHEMA_AUDITOR = {
  type: "object",
  properties: {
    puntuacion: { type: "integer" },
    motivo: { type: "string" },
  },
  required: ["puntuacion", "motivo"],
};

function extraerTextoJson(texto: string): string {
  // Defensivo: Gemini normalmente devuelve JSON puro con responseMimeType,
  // pero a veces lo envuelve en un bloque ```json ... ```.
  const coincidencia = texto.match(/```(?:json)?\s*([\s\S]*?)```/);
  return (coincidencia?.[1] ?? texto).trim();
}

class ProveedorGemini implements ProveedorIA {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY ?? "";
  }

  private async generarJson(prompt: string, esquemaJson: object): Promise<unknown> {
    const respuesta = await fetch(`${URL_BASE}/${MODELO_GENERACION}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": this.apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: esquemaJson,
        },
      }),
    });

    if (!respuesta.ok) {
      throw new Error(`Gemini devolvió ${respuesta.status}: ${await respuesta.text()}`);
    }

    const datos = await respuesta.json();
    const texto = datos.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof texto !== "string") return null;

    try {
      return JSON.parse(extraerTextoJson(texto));
    } catch {
      return null;
    }
  }

  async crearEmbeddings(textos: string[]): Promise<number[][]> {
    if (textos.length === 0) return [];

    const respuesta = await fetch(`${URL_BASE}/${MODELO_EMBEDDINGS}:batchEmbedContents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": this.apiKey,
      },
      body: JSON.stringify({
        requests: textos.map((texto) => ({
          model: `models/${MODELO_EMBEDDINGS}`,
          content: { parts: [{ text: texto }] },
          outputDimensionality: DIMENSION_EMBEDDING,
        })),
      }),
    });

    if (!respuesta.ok) {
      throw new Error(`Gemini (embeddings) devolvió ${respuesta.status}: ${await respuesta.text()}`);
    }

    const datos = await respuesta.json();
    return (datos.embeddings ?? []).map((e: { values: number[] }) => e.values);
  }

  async generarPreguntas(params: {
    fragmento: string;
    cantidad: number;
    dificultad: string;
    oposicion: string;
  }) {
    const prompt = `Eres un generador de preguntas tipo test para opositores españoles a ${
      params.oposicion === "guardia_civil" ? "Guardia Civil" : "Policía Nacional"
    }.

REGLA ABSOLUTA: cada pregunta debe poder responderse ÚNICAMENTE con la información literal
del fragmento de temario que se te da a continuación. No añadas datos, artículos, leyes,
cifras ni plazos que no estén escritos en el fragmento. Si el fragmento no da para una
pregunta con fundamento claro, genera menos preguntas de las pedidas — nunca inventes.

Genera ${params.cantidad} preguntas de dificultad "${params.dificultad}", cada una con
exactamente 4 opciones (A, B, C, D) con una sola correcta. No uses "todas las anteriores"
ni "ninguna de las anteriores". Los distractores deben ser plausibles pero claramente
incorrectos según el fragmento. Incluye una explicación breve que cite el propio fragmento.

FRAGMENTO DE TEMARIO:
"""
${params.fragmento}
"""`;

    const json = await this.generarJson(prompt, JSON_SCHEMA_LOTE_PREGUNTAS);
    const analizado = EsquemaLotePreguntas.safeParse(json);
    if (!analizado.success) return [];

    return analizado.data.preguntas.map((p) => ({
      enunciado: p.enunciado,
      opciones: p.opciones,
      respuestaCorrecta: p.respuestaCorrecta,
      explicacion: p.explicacion,
    }));
  }

  async verificarCiego(params: {
    fragmento: string;
    enunciado: string;
    opcionesDesordenadas: { letra: string; texto: string }[];
  }) {
    const prompt = `Se te da un fragmento de texto, una pregunta y 4 opciones. NO sabes
cuál es la opción correcta: debes deducirla solo a partir del fragmento.

Responde en JSON con:
- puedeResponderse: false si el fragmento NO contiene información suficiente para elegir
  una opción con seguridad.
- opcionElegida: la letra (A/B/C/D) que el fragmento respalda como correcta, o "NINGUNA" si
  no puede responderse.
- fraseLiteral: una frase copiada TEXTUALMENTE del fragmento que justifique tu elección, o
  una cadena vacía si no puede responderse. Debe ser una copia exacta, no un resumen.

FRAGMENTO:
"""
${params.fragmento}
"""

PREGUNTA: ${params.enunciado}

OPCIONES:
${params.opcionesDesordenadas.map((o) => `${o.letra}) ${o.texto}`).join("\n")}`;

    const json = await this.generarJson(prompt, JSON_SCHEMA_VERIFICADOR);
    const analizado = EsquemaVerificadorCiego.extend({
      opcionElegida: z.enum(["A", "B", "C", "D", "NINGUNA"]).nullable(),
    }).safeParse(json);

    if (!analizado.success) {
      return { puedeResponderse: false, opcionElegida: null, fraseLiteral: null };
    }

    const opcionElegida =
      analizado.data.opcionElegida === "NINGUNA" ? null : analizado.data.opcionElegida;
    const fraseLiteral = analizado.data.fraseLiteral?.trim() || null;

    return { puedeResponderse: analizado.data.puedeResponderse, opcionElegida, fraseLiteral };
  }

  async auditarCalidad(params: {
    fragmento: string;
    enunciado: string;
    opciones: { letra: string; texto: string }[];
  }) {
    const prompt = `Audita la calidad de esta pregunta tipo test de oposición. Puntúa
de 1 (muy mala) a 5 (excelente) considerando:
- Ambigüedad: ¿el enunciado admite más de una interpretación?
- ¿Hay más de una respuesta defendible entre las opciones?
- ¿Los distractores son plausibles o son obviamente absurdos?
- ¿El propio enunciado revela la respuesta correcta?
- ¿Requiere conocimiento externo al fragmento para responder?

Sé estricto: una pregunta con cualquiera de estos problemas debe puntuar por debajo de 4.

FRAGMENTO:
"""
${params.fragmento}
"""

PREGUNTA: ${params.enunciado}

OPCIONES:
${params.opciones.map((o) => `${o.letra}) ${o.texto}`).join("\n")}`;

    const json = await this.generarJson(prompt, JSON_SCHEMA_AUDITOR);
    const analizado = EsquemaAuditorCalidad.safeParse(json);
    if (!analizado.success) {
      return { puntuacion: 1, motivo: "El auditor no devolvió una respuesta válida." };
    }
    return analizado.data;
  }
}

let instancia: ProveedorIA | null = null;

export function obtenerProveedorIA(): ProveedorIA {
  if (!instancia) instancia = new ProveedorGemini();
  return instancia;
}

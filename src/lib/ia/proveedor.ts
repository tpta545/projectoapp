import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import type { ProveedorIA } from "./tipos";

const MODELO_EMBEDDINGS = process.env.OPENAI_MODEL_EMBEDDINGS || "text-embedding-3-small";
const MODELO_GENERACION = process.env.OPENAI_MODEL_GENERACION || "gpt-4o-mini";

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

class ProveedorOpenAI implements ProveedorIA {
  private cliente: OpenAI;

  constructor() {
    this.cliente = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async crearEmbeddings(textos: string[]): Promise<number[][]> {
    if (textos.length === 0) return [];
    const respuesta = await this.cliente.embeddings.create({
      model: MODELO_EMBEDDINGS,
      input: textos,
    });
    return respuesta.data.map((item) => item.embedding);
  }

  async generarPreguntas(params: {
    fragmento: string;
    cantidad: number;
    dificultad: string;
    oposicion: string;
  }) {
    const instrucciones = `Eres un generador de preguntas tipo test para opositores españoles a ${
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

    const respuesta = await this.cliente.beta.chat.completions.parse({
      model: MODELO_GENERACION,
      messages: [{ role: "system", content: instrucciones }],
      response_format: zodResponseFormat(EsquemaLotePreguntas, "lote_preguntas"),
      temperature: 0.4,
    });

    const analizado = respuesta.choices[0]?.message.parsed;
    if (!analizado) return [];

    return analizado.preguntas.map((p) => ({
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
    const instrucciones = `Se te da un fragmento de texto, una pregunta y 4 opciones. NO sabes
cuál es la opción correcta: debes deducirla solo a partir del fragmento.

Responde:
- puedeResponderse: false si el fragmento NO contiene información suficiente para elegir
  una opción con seguridad.
- opcionElegida: la letra (A/B/C/D) que el fragmento respalda como correcta, o null si no
  puede responderse.
- fraseLiteral: una frase copiada TEXTUALMENTE del fragmento que justifique tu elección,
  o null si no puede responderse. Debe ser una copia exacta, no un resumen.

FRAGMENTO:
"""
${params.fragmento}
"""

PREGUNTA: ${params.enunciado}

OPCIONES:
${params.opcionesDesordenadas.map((o) => `${o.letra}) ${o.texto}`).join("\n")}`;

    const respuesta = await this.cliente.beta.chat.completions.parse({
      model: MODELO_GENERACION,
      messages: [{ role: "system", content: instrucciones }],
      response_format: zodResponseFormat(EsquemaVerificadorCiego, "verificacion"),
      temperature: 0,
    });

    const analizado = respuesta.choices[0]?.message.parsed;
    return (
      analizado ?? { puedeResponderse: false, opcionElegida: null, fraseLiteral: null }
    );
  }

  async auditarCalidad(params: {
    fragmento: string;
    enunciado: string;
    opciones: { letra: string; texto: string }[];
  }) {
    const instrucciones = `Audita la calidad de esta pregunta tipo test de oposición. Puntúa
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

    const respuesta = await this.cliente.beta.chat.completions.parse({
      model: MODELO_GENERACION,
      messages: [{ role: "system", content: instrucciones }],
      response_format: zodResponseFormat(EsquemaAuditorCalidad, "auditoria"),
      temperature: 0,
    });

    const analizado = respuesta.choices[0]?.message.parsed;
    return analizado ?? { puntuacion: 1, motivo: "El auditor no devolvió una respuesta válida." };
  }
}

let instancia: ProveedorIA | null = null;

export function obtenerProveedorIA(): ProveedorIA {
  if (!instancia) instancia = new ProveedorOpenAI();
  return instancia;
}

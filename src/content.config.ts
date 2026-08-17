import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const seo = z.object({
  title: z.string().max(60),
  description: z.string().min(120).max(160),
});

const faq = z.array(
  z.object({
    pregunta: z.string(),
    respuesta: z.string(),
  }),
);

const productos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/productos' }),
  schema: z.object({
    titulo: z.string(),
    resumen: z.string(),
    seo,
    imagenHero: z.string().optional(),
    marcas: z.array(z.string()),
    criterios: z.array(
      z.object({
        dato: z.string(),
        porque: z.string(),
      }),
    ),
    faq,
    orden: z.number().default(99),
  }),
});

const marcas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/marcas' }),
  schema: z.object({
    nombre: z.string(),
    resumen: z.string(),
    seo,
    logo: z.string().optional(),
    web: z.string().url(),
    catalogoUrl: z.string().url(),
    gamas: z.array(z.string()),
    orden: z.number().default(99),
  }),
});

const servicios = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/servicios' }),
  schema: z.object({
    titulo: z.string(),
    resumen: z.string(),
    seo,
    destacado: z.boolean().default(false),
    orden: z.number().default(99),
  }),
});

const zonas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/zonas' }),
  schema: z.object({
    localidad: z.string(),
    resumen: z.string(),
    seo,
    tiempoReparto: z.string(),
    poligonos: z.array(z.string()),
    sectores: z.array(z.string()),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    titulo: z.string(),
    resumen: z.string(),
    seo,
    categoria: z.enum([
      'Mantenimiento industrial',
      'Selección de componentes',
      'Averías y diagnóstico',
      'Novedades de producto',
      'Normativa y eficiencia',
    ]),
    autor: z.string().default('Equipo técnico TRADE'),
    fechaPublicacion: z.coerce.date(),
    fechaActualizacion: z.coerce.date().optional(),
    imagen: z.string(),
    imagenAlt: z.string(),
    tiempoLectura: z.number(),
    relacionados: z.array(z.string()).default([]),
  }),
});

export const collections = { productos, marcas, servicios, zonas, blog };

# TRADE — grupotrade.es

Web corporativa de **Transmisiones del Este, S.L.** (TRADE), distribuidor
industrial en Algemesí (Valencia). Astro + Tailwind CSS, contenido en
Content Collections (Markdown/MDX) y formularios servidos como funciones
serverless.

## Stack

- **Astro 5** (SSG) con `@astrojs/mdx` y `@astrojs/sitemap`.
- **Tailwind CSS 4** vía `@tailwindcss/vite`, tokens de marca en
  `src/styles/global.css` (`@theme`).
- **Content Collections** con loader `glob` y schema Zod en
  `src/content.config.ts` — productos, marcas, servicios, zonas y blog.
- **Adaptador Vercel** (`@astrojs/vercel`) para servir `/api/*` como
  funciones serverless; el resto del sitio se genera estático. Para
  desplegar en Netlify, sustituir el adaptador por `@astrojs/netlify` en
  `astro.config.mjs` — el código de `/api/*` no depende de la plataforma.

## Puesta en marcha

```bash
npm install
cp .env.example .env
npm run dev
```

- `npm run dev` — servidor de desarrollo.
- `npm run build` — `astro check` + build de producción.
- `npm run preview` — sirve el build de producción localmente.

## Variables de entorno

Ver `.env.example`. Sin configurar `RESEND_API_KEY`, los envíos de
formulario se registran en consola (`src/lib/notificaciones.ts`) en vez de
enviarse por email — útil en desarrollo, hay que configurarlo antes de
producción. `PUBLIC_GA_ID` activa Google Analytics 4, y solo se carga tras
consentimiento explícito de cookies analíticas (`src/components/Analytics.astro`).

## Despliegue

1. Configurar `RESEND_API_KEY` (o adaptar `src/lib/notificaciones.ts` al
   proveedor de email elegido) y `PUBLIC_GA_ID` en las variables de entorno
   del proveedor de hosting.
2. Desplegar en Vercel (adaptador ya configurado) o cambiar a
   `@astrojs/netlify` para Netlify.
3. Verificar que `sitemap-index.xml` y `robots.txt` responden en producción
   con el dominio final, y dar de alta la propiedad en Google Search
   Console.

## Cómo añadir un artículo al blog

1. Crea un archivo Markdown en `src/content/blog/tu-slug.md`. El nombre de
   archivo es la URL final (`/blog/tu-slug/`).
2. Rellena el frontmatter siguiendo el schema de `src/content.config.ts`
   (colección `blog`): `titulo`, `resumen`, `seo.title` (≤60 car.),
   `seo.description` (120-160 car.), `categoria` (una de las cinco
   definidas), `autor`, `fechaPublicacion`, `fechaActualizacion` (opcional),
   `imagen`, `imagenAlt`, `tiempoLectura` (minutos) y `relacionados` (array
   de slugs de otros artículos).
3. Escribe el cuerpo en Markdown usando `##` para las secciones — se
   convierten automáticamente en el índice de contenidos anclado de la
   plantilla.
4. Añade la imagen de portada en `public/imagenes/blog/` (WebP o SVG si es
   un diagrama de marca, no fotografía de stock — ver `IMAGENES-PENDIENTES.md`).
5. `npm run dev` y revisa `/blog/tu-slug/`. El artículo aparece
   automáticamente en `/blog/`, en su categoría (`/blog/categoria/...`) y en
   "últimos artículos" de portada si es reciente.

Añadir una ficha de producto, marca, servicio o zona sigue el mismo patrón:
un archivo Markdown en `src/content/<colección>/`, con su propio schema en
`src/content.config.ts`.

## CMS headless (Decap CMS)

El contenido vive en Markdown plano bajo `src/content/`, sin lógica
acoplada a un CMS concreto, precisamente para poder añadir Decap CMS más
adelante sin refactorizar: bastaría con añadir `public/admin/` (interfaz de
Decap) y un `config.yml` que apunte sus colecciones a las mismas carpetas y
campos ya definidos en `src/content.config.ts`.

## Formularios y antispam

`/presupuesto/`, `/servicios/reparacion-equipos/` (diagnóstico) y
`/contacto/` envían a `src/pages/api/{presupuesto,diagnostico,contacto}.ts`.
Cada endpoint valida campos obligatorios, comprueba un campo honeypot oculto
(`src/lib/antispam.ts`) y aplica una limitación de frecuencia por IP en
memoria — ver el comentario en `antispam.ts` sobre sus límites en entornos
serverless con múltiples instancias.

## Estructura

```
src/
  components/       Header, Footer, Breadcrumbs, CTA, JSON-LD, cookies…
  content/           productos/ marcas/ servicios/ zonas/ blog/ (Markdown)
  content.config.ts  Schemas Zod de las colecciones
  layouts/           BaseLayout.astro (meta, OG, JSON-LD global)
  lib/               empresa.ts (datos fiscales/contacto), antispam, blog, fechas
  pages/             Rutas — incluye api/ (formularios) y las plantillas [slug]
  styles/            global.css — tokens de marca y tipografía "prose-trade"
```

## Documentos relacionados

- `REDIRECCIONES.md` — mapa de 301 desde la web WordPress anterior.
- `IMAGENES-PENDIENTES.md` — fotografía real pendiente de aportar por el
  cliente, con encuadre y uso previsto de cada imagen.

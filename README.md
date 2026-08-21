# TESTARIO

Micro-SaaS para opositores a Guardia Civil y Policía Nacional: sube tu propio
temario en PDF y genera tests de autoevaluación con preguntas ancladas a
fragmentos literales de tu material, con la fuente citada en cada corrección.

**Fase 1 (MVP)**: registro/login, subida y procesado de PDF, generación de
tests validados por un pipeline de 3 capas + impugnación de usuarios,
realización y corrección de tests, historial y repaso de fallos, y un panel
`/admin` con la tasa de descarte del pipeline. Sin pagos todavía (Fase 3).

No hay ningún vínculo oficial con la Guardia Civil ni la Policía Nacional:
ver [`/aviso-legal`](src/app/(marketing)/aviso-legal/page.tsx).

## Stack

- **Next.js 15** (App Router) + TypeScript + Tailwind CSS v4
- **Supabase**: Postgres, Auth (email/contraseña), Storage (PDFs privados),
  pgvector para embeddings
- **Gemini** (Google AI Studio): `gemini-2.5-flash` para generación/
  verificación/auditoría de preguntas, `gemini-embedding-001` para embeddings
  (proveedor intercambiable, ver `src/lib/ia/proveedor.ts`)
- Diseño **mobile-first** (390px de ancho como referencia)
- Sin dependencias de UI/estado innecesarias: componentes propios en
  `src/components/ui`

## Arquitectura de la subida de PDF

El navegador sube el PDF **directamente a Supabase Storage** (bucket privado
`documentos`, con límite de 30 MB y tipo MIME forzado a `application/pdf` a
nivel de bucket) y solo después llama a `/api/documentos/subir` con los
metadatos. Esto evita el límite de tamaño de body de las funciones
serverless de Vercel. El procesado (extracción de texto, troceado,
embeddings y pregeneración del colchón de preguntas) se lanza en segundo
plano con `after()` tras responder al usuario.

## El motor de validación (regla antialucinación)

Cada pregunta generada por IA pasa, antes de guardarse como `validada`, por
tres capas independientes (`src/lib/validacion/`, con tests en
`src/lib/validacion/__tests__/`):

- **Capa 0** — determinista, sin IA: exactamente 4 opciones con una
  correcta, sin duplicados/similitud > 90 % entre opciones, sin "todas/
  ninguna de las anteriores", ninguna cifra/artículo/ley/plazo que no
  aparezca literalmente en el fragmento de origen, y sin duplicado
  semántico (> 0,92) con otra pregunta ya validada del mismo documento.
- **Capa 1** — verificador ciego: una segunda llamada a la IA que recibe
  solo el fragmento, el enunciado y las opciones desordenadas (sin saber
  cuál es la correcta) y debe acertarla citando una frase literal del
  fragmento.
- **Capa 2** — auditor de calidad: puntúa de 1 a 5 (ambigüedad, distractores
  poco plausibles, enunciado que revela la respuesta…); se descarta por
  debajo del umbral configurable.
- **Capa 3** — impugnación del usuario: con 3 impugnaciones distintas, la
  pregunta se retira automáticamente.

Toda decisión de cada capa queda trazada en la tabla `validaciones`, visible
agregada por capa y por documento en `/admin`.

> Nota sobre Gemini: su salida JSON estructurada es, en general, fiable, pero
> puede fallar puntualmente (JSON incompleto, envuelto en \`\`\`json\`\`\`, etc.).
> El proveedor lo parsea de forma defensiva y, si algo no encaja, la Capa 0/1/2
> simplemente descarta esa pregunta candidata — nunca deja pasar algo a medias.
> Si ves una tasa de descarte alta en `/admin`, es la razón más probable.

Al generar un test se sobregenera `N × factor_sobregeneracion` preguntas y se
validan en paralelo; se sirven las primeras `N` que superan las tres capas.
Las preguntas ya validadas para un documento se cachean y reutilizan (el
"colchón" que se pregenera en segundo plano tras subir el PDF), así que el
plan gratuito puede servir tests instantáneos sin llamar a la IA.

## Puesta en marcha

### 1. Requisitos

- Node.js 20+
- Un proyecto de [Supabase](https://supabase.com) (plan gratuito vale)
- Una clave de API de [Google AI Studio](https://aistudio.google.com/apikey) (Gemini)

### 2. Base de datos

Aplica las migraciones de `supabase/migrations/` en tu proyecto de Supabase,
en orden, desde el SQL Editor del panel de Supabase (o con `supabase db
push` si usas la CLI):

1. `0001_init.sql` — esquema completo, RLS, funciones RPC
2. `0002_storage.sql` — bucket privado de PDFs y sus políticas

Después, márcate a ti mismo como administrador para poder ver `/admin`
(sustituye el email):

```sql
insert into admins (usuario_id)
select id from auth.users where email = 'tu-email@ejemplo.com';
```

### 3. Variables de entorno

```bash
cp .env.example .env.local
```

| Variable | De dónde sale |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → service_role key (**solo servidor**) |
| `GEMINI_API_KEY` | aistudio.google.com/apikey |
| `GEMINI_MODEL_GENERACION` (opcional) | por defecto `gemini-2.5-flash` |
| `GEMINI_MODEL_EMBEDDINGS` (opcional) | por defecto `gemini-embedding-001` |

### 4. Instalar y arrancar

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### 5. Otros scripts

```bash
npm run build      # build de producción
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm test           # vitest — motor de validación (capas 0 y selección de lote)
```

## Estructura de carpetas

```
src/
├── app/
│   ├── (marketing)/     landing, aviso legal, privacidad, cookies
│   ├── (auth)/           login, registro, callback de confirmación
│   ├── (app)/            panel, documentos, test, historial, repaso, cuenta
│   ├── admin/            panel interno de métricas del pipeline
│   └── api/              route handlers (documentos, tests, preguntas, admin)
├── components/           ui/, documentos/, test/, admin/, cuenta/, navegacion/
├── lib/
│   ├── supabase/         clientes (browser, server, admin/service-role)
│   ├── ia/               proveedor de IA (generación, verificación, auditoría, embeddings)
│   ├── validacion/       motor de validación (independiente y testeado)
│   ├── pdf/              extracción de texto y troceado con solapamiento
│   ├── documentos/       pipeline de ingesta + pregeneración del colchón
│   ├── tests/            orquestación de generación de lotes de preguntas
│   └── dominio/          oposiciones/bloques y ajustes configurables
└── types/db.ts           tipos de la base de datos para el cliente de Supabase
supabase/migrations/       esquema SQL, RLS y funciones RPC
```

## Seguridad y privacidad

- Los documentos y las preguntas generadas son privados por usuario (RLS en
  todas las tablas); nunca se comparten entre cuentas ni se usan para un
  banco de preguntas común.
- Los límites de plan (documentos, preguntas/día) se comprueban siempre en
  servidor, nunca en el cliente.
- El navegador nunca recibe la respuesta correcta de una pregunta antes de
  que el test se finalice: la corrección y el cálculo de la puntuación se
  hacen enteramente en las rutas de servidor.
- Borrado total de cuenta y documentos disponible en "Mi cuenta".

## Fuera de alcance en esta fase

Simulacro cronometrado avanzado y estadísticas por tema, repaso espaciado
(Fase 2); Stripe y límites de plan reales (Fase 3, aunque la arquitectura de
`limites_plan`/`ajustes_admin` ya está preparada); landings SEO
programáticas (Fase 4).

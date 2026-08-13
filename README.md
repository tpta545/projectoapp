# TRADE · Lector de placas de características

PWA móvil para fotografiar la placa de un motor, reductor, variador o
componente neumático y obtener sus datos técnicos estructurados mediante
IA de visión (Gemini), sin backend ni base de datos propia — fase 1 de
validación de usabilidad y fiabilidad de lectura.

## Puesta en marcha

```bash
npm install
cp .env.example .env
# edita .env y añade tu VITE_GEMINI_API_KEY (consíguela en https://aistudio.google.com/apikey)
npm run dev
```

⚠️ La API key se usa directamente desde el navegador, lo que la expone en el
cliente. Aceptable solo para esta fase de validación. **Antes de producción**
hay que mover la llamada de `src/services/vision.ts` a un proxy backend —
está comentado en ese archivo.

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción (typecheck + PWA)
- `npm run preview` — sirve el build para probar la PWA (offline, historial…)
- `npm run lint` — oxlint

## Fuera de alcance en esta fase

Backend/BD/auth propios, equivalencias de catálogo real ABB/FESTO,
integración ERP/CRM, exportación a PDF y multiidioma. Los puntos de
extensión están comentados en el código donde corresponde.

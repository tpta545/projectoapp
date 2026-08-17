import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// Adaptador Vercel por defecto para servir /api/* como funciones serverless
// (los formularios de presupuesto, diagnóstico y contacto). El resto del sitio
// se sigue generando estático. Para desplegar en Netlify, sustituye este
// adaptador por `@astrojs/netlify` sin tocar el código de las rutas /api/*.
export default defineConfig({
  site: 'https://www.grupotrade.es',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap()],
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
  },
  // 301 desde las URLs de la web WordPress anterior. Detalle y justificación de
  // cada equivalencia en REDIRECCIONES.md — mismo mapa, no editar uno sin el otro.
  redirects: {
    '/conocenos/': '/empresa/',
    '/quienes-somos/': '/empresa/',
    '/rodamientos-isb/': '/productos/rodamientos/',
    '/transmision/': '/productos/transmision-mecanica/',
    '/motores-abb/': '/productos/motores-electricos/',
    '/variadores-abb/': '/productos/variadores-frecuencia/',
    '/neumatica-festo/': '/productos/neumatica/',
    '/reductores-dodge/': '/productos/reductores/',
    '/ruedas-tellure-rota/': '/productos/ruedas-rodadura/',
    '/lubricantes-industriales/': '/productos/lubricantes/',
    '/herramientas/': '/productos/herramienta-manual/',
    '/marca-abb/': '/marcas/abb/',
    '/marca-festo/': '/marcas/festo/',
    '/marca-dodge/': '/marcas/dodge/',
    '/marca-isb/': '/marcas/isb/',
    '/marca-tellure-rota/': '/marcas/tellure-rota/',
    '/servicio-tecnico/': '/servicios/reparacion-equipos/',
    '/reparaciones/': '/servicios/reparacion-equipos/',
    '/presupuestos/': '/presupuesto/',
    '/solicitar-presupuesto/': '/presupuesto/',
    '/politica-de-privacidad/': '/politica-privacidad/',
    '/politica-de-cookies/': '/politica-cookies/',
    '/aviso-legal-2/': '/aviso-legal/',
  },
});

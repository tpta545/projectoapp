# Redirecciones 301 — web antigua → web nueva

Mapa de redirecciones desde las URLs conocidas de la web WordPress anterior
(2016-2017) hacia sus páginas equivalentes en la nueva web Astro. Las
redirecciones están implementadas en `astro.config.mjs` (bloque `redirects`)
y se generan como 301 reales a través del adaptador de Vercel en el build de
producción.

> **Antes de publicar:** este mapa se ha construido a partir de las URLs
> facilitadas en el encargo (`/conocenos/`, `/rodamientos-isb/`, `/contacto/`)
> y de patrones habituales de un sitio WordPress de distribución industrial.
> Antes de lanzar, contrastar contra Google Search Console (Páginas indexadas)
> y contra los logs del servidor actual para capturar cualquier URL con
> tráfico real que no esté en esta lista, y añadirla al mismo bloque de
> `astro.config.mjs`.

| URL antigua | URL nueva | Motivo |
|---|---|---|
| `/conocenos/` | `/empresa/` | Página "Quiénes somos" renombrada. |
| `/quienes-somos/` | `/empresa/` | Variante de slug habitual en WordPress para la misma página. |
| `/rodamientos-isb/` | `/productos/rodamientos/` | Página de producto que mezclaba familia y marca; se separa en ficha de producto + ficha de marca (`/marcas/isb/`). |
| `/transmision/` | `/productos/transmision-mecanica/` | Ficha de producto renombrada con slug más descriptivo. |
| `/motores-abb/` | `/productos/motores-electricos/` | Se separa familia de producto y marca; ver también `/marcas/abb/`. |
| `/variadores-abb/` | `/productos/variadores-frecuencia/` | Ídem, familia de variadores. |
| `/neumatica-festo/` | `/productos/neumatica/` | Ídem, familia de neumática. |
| `/reductores-dodge/` | `/productos/reductores/` | Ídem, familia de reductores. |
| `/ruedas-tellure-rota/` | `/productos/ruedas-rodadura/` | Ídem, familia de ruedas y rodadura. |
| `/lubricantes-industriales/` | `/productos/lubricantes/` | Slug simplificado. |
| `/herramientas/` | `/productos/herramienta-manual/` | Slug más específico para evitar confusión con ferretería general. |
| `/marca-abb/` | `/marcas/abb/` | Página de marca, nueva sección `/marcas/`. |
| `/marca-festo/` | `/marcas/festo/` | Ídem. |
| `/marca-dodge/` | `/marcas/dodge/` | Ídem. |
| `/marca-isb/` | `/marcas/isb/` | Ídem. |
| `/marca-tellure-rota/` | `/marcas/tellure-rota/` | Ídem. |
| `/servicio-tecnico/` | `/servicios/reparacion-equipos/` | Página de servicio de reparación, ahora landing prioritaria. |
| `/reparaciones/` | `/servicios/reparacion-equipos/` | Posible slug alternativo para la misma página antigua. |
| `/presupuestos/` | `/presupuesto/` | Formulario de solicitud de oferta. |
| `/solicitar-presupuesto/` | `/presupuesto/` | Variante de slug habitual. |
| `/politica-de-privacidad/` | `/politica-privacidad/` | Slug simplificado. |
| `/politica-de-cookies/` | `/politica-cookies/` | Slug simplificado; contenido además actualizado a RGPD/LSSI. |
| `/aviso-legal-2/` | `/aviso-legal/` | Slug duplicado típico de WordPress tras una migración anterior. |

`/contacto/` no requiere redirección: la nueva web mantiene la misma URL.

## Cómo añadir una redirección nueva

Añade la pareja `'/ruta-antigua/': '/ruta-nueva/'` al objeto `redirects` en
`astro.config.mjs` y añade la fila correspondiente a la tabla de este
documento. No mantengas los dos archivos desincronizados.

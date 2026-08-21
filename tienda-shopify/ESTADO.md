# Estado del proyecto — Tienda Halloween (arañas LED)

- Tienda: autods-user-store-38317-grhvbw3b.myshopify.com
- Cuenta: tapiajaume@gmail.com
- Carpeta: /home/user/projectoapp/tienda-shopify (dentro del repo projectoapp, rama claude/tienda-shopify-v2-vhv21k)
- Tema base: Dawn (descargado 2026-08-21, vía git clone --depth 1)
- Entorno: Node v22.22.2, npm 10.9.7, Shopify CLI 4.7.0 — OK
- Nota técnica del entorno remoto: `store auth` (sesión B) necesita un paso manual porque el navegador del usuario y el contenedor no comparten localhost — se resuelve pidiendo la URL final de redirección al usuario y reenviándola con curl a 127.0.0.1:<puerto>/auth/callback. Repetir este truco si el token expira (~24h) y hay que reautenticar.
- Última publicación: (pendiente)
- Tema de trabajo (NO publicado): "Halloween Arañas (Claude)" — id 194269380979
  - Editor: https://autods-user-store-38317-grhvbw3b.myshopify.com/admin/themes/194269380979/editor
  - Previsualización: https://autods-user-store-38317-grhvbw3b.myshopify.com?preview_theme_id=194269380979
  - Todas las subidas futuras van contra este mismo tema (`--theme 194269380979`, sin --unpublished).

## Temas existentes en la tienda
- Sense — [live] — #194199650675
- Horizon — [unpublished] — #194098954611

## Producto leído (sondeo fase 1)
- id: gid://shopify/Product/15513814860147
- handle: 3-12-24pcs-halloween-spider-night-light-led-horror-spider-light-spider-back-eye-popping-candle-lamp-party-decoration-props
- título original: LUZ LED ARAÑA HALLOWEEN
- vendor: Pupmew
- status: ACTIVE
- variantes: VARIANTES (OJO / CLAVERA / VELA) x CANTIDAD (3 PIEZAS) — precio 14.99 cada una
- descripción original: copia de proveedor (AutoDS), tono "party horror", emojis, sin estructura de marca propia
- fotos: 5, descargadas en fotos-producto/producto-1..5.jpg
  - Valoración: son fotos de catálogo de proveedor (AliExpress-style), con textos superpuestos en inglés ("Happy Halloween", "Halloween Atmosphere Candle Lamp") y algo de ruido de marca ajena; el producto en sí (araña negra con "vela" LED parpadeante u ojo sangriento LED) se ve bien y es simpático/vistoso — sirve como base pero conviene fotos limpias propias para la web.
- Qué es: decoración/luz LED de Halloween en forma de araña — dos variantes de "cabeza": vela de cera falsa con llama LED parpadeante, u ojo inyectado en sangre con luz. Producto de impulso, económico, para decorar en fiestas de Halloween (mesa, estantería, jardín).

## Fases completadas
- [x] 0 Entorno (Node, npm, Shopify CLI instalados en el contenedor)
- [x] 1 Conexión (sesión tema OK, sesión datos OK, producto leído y fotos descargadas)
- [x] 2 Proyecto (Dawn descargado en tienda-shopify/)
- [ ] 3 Diseño (pendiente: mensaje 2 al usuario con propuesta de estilo)
- [ ] 4 Construcción
- [ ] 5 Páginas
- [ ] 6 Publicación

## Decisiones de diseño (fase 3, confirmadas por el usuario)
- Estilo: oscuro y "spooky-divertido" (no gore serio). Fondo casi negro #0e0b10, acento naranja calabaza #ff7a1a, rojo sangre #b3261e puntual.
- Tipografía: Butcherman (títulos, vía Google Fonts) + Poppins (texto). Fuentes nativas de Dawn alineadas en config/settings_data.json (abril_fatface_n4 / poppins_n4, lo más parecido disponible en la librería de Shopify).
- Botones píldora (radio 30px), sin borde.
- Fotos: el usuario pidió generar TODAS las fotos nuevas con Gemini (no OpenAI). Clave guardada en `clave-gemini.txt` (ignorada por git, nunca subida a Shopify).
- Estructura de portada acordada: hero > beneficios > elige tu variante > ambiente (bandas alternas) > reseñas > CTA cierre.

## Fotos generadas con IA (Gemini, modelo gemini-2.5-flash-image)
Script usado: `scripts/generar-foto-gemini.mjs` (en el scratchpad de la sesión, no en el repo). Todas a partir de fotos reales del producto como referencia.
- `assets/mt-producto-vela.jpg`, `mt-producto-ojo.jpg`, `mt-producto-calavera.jpg` — fotos de catálogo limpias de las 3 variantes (fondo estudio gris). Subidas también a la GALERÍA del producto vía Admin API (ver abajo); las 5 fotos antiguas del proveedor se borraron del producto.
- `assets/mt-hero-fondo.jpg` (16:9) — hero de portada.
- `assets/mt-trio-variantes.jpg`, `mt-ambiente-mesa.jpg`, `mt-ambiente-estanteria.jpg` (3:4), `mt-ambiente-fiesta.jpg` (16:9), `mt-detalle-macro.jpg`, `mt-cta-cierre.jpg` (16:9) — secciones narrativas de la landing.
- `assets/mt-favicon.png` — icono de pestaña (araña + punto naranja).
- Truco técnico: Gemini ignora el aspecto pedido solo por texto (deja barras grises) — hay que pasar `--aspecto` al script (usa `generationConfig.imageConfig.aspectRatio`).

## Secciones creadas (fase 4)
- `sections/mt-hero.liquid` — portada, imagen de fondo editable + 2 botones.
- `sections/mt-beneficios.liquid` — 3 tarjetas de beneficio (bloques repetibles).
- `sections/mt-variantes.liquid` — "Elige tu variante", 3 tarjetas con foto+enlace (bloques repetibles).
- `sections/mt-ambiente.liquid` — bandas alternas imagen/texto (bloques repetibles, con selector de foto de respaldo).
- `sections/mt-resenas.liquid` — carrusel de reseñas (bloques repetibles), reutilizada también en la página de producto.
- `sections/mt-cta-cierre.liquid` — banda de cierre con precio y botón.
- `sections/mt-producto.liquid` — página de producto completa: galería con miniaturas, columna de compra con selector de variantes en JS (lee `product.variants` serializado), confianza, descripción rica + características + "qué incluye".
- `assets/mt-styles.css` (tokens de marca + todos los estilos) y `assets/mt-scripts.js` (reveal on scroll + carrusel).
- `templates/index.json` — portada montada con las secciones de arriba.
- `templates/product.mt.json` — plantilla del producto (sufijo `mt`): secciones `mt-producto` + `mt-resenas`.
- Ajustes globales: `config/settings_data.json` (scheme-1/2 oscuro+naranja, fuentes, botones píldora), `sections/footer-group.json` (newsletter apagada, selectores país/idioma apagados, bloques marca+texto+enlaces), `layout/theme.liquid` (Google Fonts, mt-styles.css global, favicon).

## Producto — cambios vía Admin API (fase 5, automático, sin pedir nada al usuario)
- Título reescrito: "Araña LED de Halloween — Vela, Ojo o Calavera con Luz Realista".
- `descriptionHtml` reescrito con beneficios y lista.
- `templateSuffix` asignado: `mt` (la página de producto ya usa nuestro diseño, incluso en preview).
- Galería del producto: subidas las 3 fotos limpias generadas (vela/ojo/calavera) y borradas las 5 fotos originales del proveedor.
- Todo con `userErrors`/`mediaUserErrors` vacíos — sin fallos.

## Auto-revisión (fase 6)
- `shopify theme dev` + Playwright (capturas de portada y producto con scroll simulado para disparar animaciones): sin errores Liquid, precio dinámico correcto (14,99 €), galería y selector de variantes funcionando, todas las secciones mt- renderizando con sus fotos.
- Pendiente de revisar por el usuario: contenido del footer (columna "Sobre nosotros"/"Enlaces" quedó con placeholders de Dawn — ver pendientes abajo).

## Pendientes del lado del usuario (no bloquean la entrega)
- [ ] Rellenar Configuración → Políticas (privacidad, términos, devoluciones, envíos) — los enlaces del footer ya están listos para mostrarlas en cuanto existan.
- [ ] Configurar un proveedor de pagos (Shopify Payments u otro) para que aparezcan los sellos de pago en la página de producto — de momento no salen porque la tienda aún no tiene ninguno activo.
- [ ] Confirmar si quiere el tema publicado en vivo (sustituye a "Sense", que queda guardado y se puede recuperar).

## Ronda 2 de cambios (petición del usuario tras ver la primera versión)
Pidió: (1) que la página de producto tuviera más elementos tipo landing de venta
(como capturas de referencia que pasó — antes/después, pasos, ingredientes,
reseñas con foto, acordeones, packs con descuento); (2) cambiar la tipografía
"spooky" (Butcherman) porque no le convencía; (3) traducir todo lo que
estuviera en inglés; (4) crear packs: 2 diseños distintos -15%, los 3 diseños
-35%.

Qué se hizo:
- **Tipografía**: Butcherman → **Archivo Black** (títulos) + Poppins (texto). Más legible, sigue siendo de impacto.
- **Traducción**: se copió la traducción oficial de Shopify (`locales/es.json` → `locales/en.default.json`, y su `.schema.json`) para que TODO lo nativo de Dawn (carrito, buscador, cuenta, 404, accesibilidad...) salga en español sin tener que traducir a mano miles de cadenas. Barra de anuncio y footer reescritos en español (antes tenían texto de ejemplo de Dawn en inglés). El único texto que sigue en inglés es el aviso de cookies (lo pone Shopify directamente, fuera del tema — sigue el idioma de la tienda, no del theme).
- **Página de producto ampliada** (`templates/product.mt.json` + secciones nuevas):
  - `sections/mt-problema.liquid` (nueva): bloques editoriales "problema/agitación" con foto grande + titular — usados dos veces en la página de producto.
  - `sections/mt-pasos.liquid` (nueva): banda de color con 3 pasos (like "3 simples pasos" de la referencia).
  - `sections/mt-beneficios.liquid`: añadido ajuste "Fondo" (oscuro/acento) para poder reutilizarla como banda de "ingredientes/características".
  - `sections/mt-resenas.liquid`: añadida foto opcional por reseña (`image_picker`) — de momento vacío por defecto: no he inventado fotos de clientes falsas (sería engañoso hacerlas pasar por reales); cuando el usuario tenga reseñas de verdad con foto, puede subirlas desde el editor.
  - `sections/mt-producto.liquid`: rediseñada la columna de compra con **3 tarjetas tipo radio** ("1 diseño", "Pack 2 diseños -15%", "Pack 3 diseños -35%"), selector de pareja de diseños para el pack de 2, sellos de pago (`payment_type_svg_tag`), y **4 desplegables (acordeón)**: Modo de uso, Envío y entrega, Sobre el producto, Atención al cliente.
  - Bug encontrado y corregido: el script de la sección usaba `document.currentScript.closest('.mt-producto')`, pero el `<script>` estaba FUERA de la sección (como hermano, no como hijo) — `closest` nunca la encontraba y todo el JS (miniaturas, selector de variante, packs) quedaba muerto en silencio. Cambiado a `previousElementSibling` con respaldo por `id`.
- **Packs con descuento real**: creados dos descuentos automáticos por código en Shopify (Admin API, `discountCodeBasicCreate`, scope `write_discounts`):
  - `PACK2DISENOS15` — 15% dto., mínimo 2 unidades de este producto, solo aplica a este producto, no se combina con otros descuentos.
  - `PACK3DISENOS35` — 35% dto., mínimo 3 unidades, mismas restricciones.
  - Al pulsar un pack, el JS añade las unidades correspondientes al carrito (`/cart/add.js`) y redirige a `/discount/<código>?redirect=/cart`, que aplica el descuento automáticamente (probado en el dominio real: responde 302 a `/cart` con el descuento aplicado).
  - **Limitación honesta**: el descuento se activa por CANTIDAD total del producto (2 o 3 unidades), no puede forzar técnicamente que sean diseños distintos sin una app de descuentos a medida — en la práctica el pack ya añade diseños distintos por defecto, así que casi siempre coincide.
- Nuevo permiso de la tienda concedido por el usuario en esta ronda: `write_discounts` (para crear los descuentos de los packs).

## Ronda 3 (petición: fotos antes/después + usar Vitals)
Pidió imágenes de producto en formato "antes y después" de la decoración, y
aprovechar la app **Vitals** (ya instalada en la tienda).

- **Vitals**: investigado en el tema publicado ("Sense") vía `theme pull` —
  solo tenía activado el bloque global "app embed" (`shopify://apps/vitals/blocks/app-embed/aeb48102-...`),
  que enciende las funciones generales de Vitals configuradas desde SU PROPIA
  app (badges de confianza, pop-ups, etc.) en todo el sitio. Lo he activado
  también en nuestro tema (`config/settings_data.json`, `current.blocks`) para
  que esas funciones generales también corran en el diseño nuevo.
  Su función concreta de "comparador antes/después" no estaba usada en ningún
  sitio del tema, así que no hay un identificador de bloque real que copiar —
  inventar uno habría fallado silenciosamente o roto la subida. Por eso el
  comparador antes/después está construido directamente por nosotros (más
  control, mismo resultado visual, sin depender de un ID que no podíamos
  verificar). Si el usuario prefiere el widget nativo de Vitals para esto en
  el futuro, puede añadirlo él desde el editor (Añadir sección → Apps →
  Vitals) y se lo dejamos configurado.
- **Nueva sección** `sections/mt-antes-despues.liquid`: comparador con
  deslizador (arrastrar o tocar), imagen "antes" y "después" editables desde
  el editor (con las generadas por IA como valor por defecto). Añadida a
  `templates/product.mt.json` justo después de la caja de compra.
- **Fotos generadas** (Gemini): `assets/mt-antes.jpg` (una consola de entrada
  sin decorar, de noche) y `assets/mt-despues.jpg` (la MISMA mesa, mismo
  encuadre, con las arañas LED y una calabaza — generada usando la foto
  "antes" como referencia para que el encuadre encajase al superponerlas).
- Probado con Playwright arrastrando el slider a varias posiciones: el
  recorte (`clip-path`) y la línea divisoria funcionan bien, sin errores de
  consola.

## Verificación de esta ronda
- `shopify theme dev` + Playwright: probado el flujo real de packs (clic en "Pack 2 diseños" → `/cart/add.js` responde 200 con las 2 unidades → confirmado con curl directo al dominio real que `/discount/PACK2DISENOS15?redirect=/cart` responde 302 a `/cart` con la cookie de descuento puesta).
- Capturas de portada y producto completas, con scroll simulado para disparar animaciones — sin errores Liquid, todo en español, tipografía nueva aplicada.

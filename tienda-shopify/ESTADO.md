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

## Decisiones de diseño
(se rellena en la fase 3, tras la respuesta del usuario a la propuesta)

## Secciones creadas
(se rellena en la fase 4)

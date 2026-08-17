# Imágenes pendientes de fotografía real

Esta web no usa fotografía de stock. Donde no había imagen real disponible se
ha dejado un marcador gráfico de marca (no una foto simulada) y se documenta
aquí qué hay que fotografiar, con qué encuadre y para qué archivo. Sustituir
cada placeholder por la fotografía real es un requisito antes de considerar
el sitio terminado, no una mejora opcional.

## 1. Logotipo oficial

- **Dónde se usa ahora:** `favicon.svg` (marca genérica "T" sobre negro) como
  sustituto provisional del logotipo en los datos estructurados
  (`Organization.logo`) y en la pestaña del navegador.
- **Qué falta:** archivo vectorial (SVG o EPS) del logotipo oficial de TRADE
  en alta resolución, en versión color y en versión monocroma sobre fondo
  claro y oscuro.
- **Dónde debe sustituirse:** `public/favicon.svg` y, si se añade un logotipo
  visible en el header (actualmente es texto tipográfico "TRADE", no
  imagen), un nuevo componente que lo incluya.

## 2. Imagen Open Graph / redes sociales

- **Archivo actual:** `public/imagenes/og-trade.webp` — tarjeta gráfica
  generada con la paleta de marca (fondo negro, muesca roja, texto
  tipográfico), sin fotografía.
- **Qué mejoraría:** una versión con fotografía real de fondo (fachada o
  almacén) compuesta con el mismo tratamiento tipográfico, 1200×630 px,
  formato WebP.

## 3. Fachada y almacén (Polígono Les Cotes, Algemesí)

- **Uso previsto:** `Organization.image` en datos estructurados, sección de
  contacto de portada, página `/empresa/`.
- **Encuadre necesario:**
  - Fachada exterior de la nave, con rótulo visible, luz de día despejada.
  - Interior del almacén: pasillos de estanterías con producto identificable
    (cajas de rodamientos, bobinas de correa, motores en pallet), en
    horizontal, que transmita orden y volumen de stock real.
- **Formato de entrega:** WebP, mínimo 1600 px de ancho.

## 4. Taller de reparación

- **Uso previsto:** página `/servicios/reparacion-equipos/`, la landing
  prioritaria del sitio — actualmente sin fotografía, solo texto y tabla.
- **Encuadre necesario:**
  - Banco de pruebas con un motor o reductor en verificación.
  - Detalle de un técnico realizando diagnóstico (multímetro o pinza
    amperimétrica sobre un motor abierto).
  - Un informe técnico real (o maqueta del formato) sobre la mesa, junto a la
    pieza reparada, para reforzar visualmente el argumento del informe como
    diferenciador.
- **Formato de entrega:** WebP, mínimo 1200 px de ancho, orientación
  horizontal para uso en cabecera de sección.

## 5. Personal técnico

- **Uso previsto:** página `/empresa/` y, opcionalmente, `/servicios/asesoramiento-tecnico/`.
- **Encuadre necesario:** retrato de trabajo real (no posado de stock) de
  una o dos personas del equipo técnico en el almacén o mostrador, en
  actividad (atendiendo una consulta, revisando una pieza), no mirando a
  cámara de forma artificial.

## 6. Reparto propio

- **Uso previsto:** página `/servicios/reparto-propio/` y páginas de
  `/zonas/`.
- **Encuadre necesario:** vehículo de reparto propio, con rotulación visible
  si la tiene, cargando o descargando género junto a la nave.

## 7. Imágenes de producto

- **Uso previsto:** páginas de `/productos/` y `/marcas/` (actualmente sin
  imagen de producto, solo texto y tabla técnica).
- **Encuadre necesario:** fotografía de producto real en fondo neutro
  (blanco o gris claro) para al menos una pieza representativa por familia:
  un rodamiento, un tramo de cadena y uno de correa, un motor ABB, un
  variador ABB, un cilindro FESTO, un reductor Dodge, una rueda Tellure
  Rota. Preferible foto propia sobre imagen de catálogo del fabricante por
  motivos de licencia y de autenticidad ("esto es lo que tenemos en
  almacén").

## 8. Ilustraciones del blog

- **Archivos actuales:** seis SVG originales en `public/imagenes/blog/`
  (`placa-motor.svg`, `variador-error.svg`, `cadena-correa.svg`,
  `reductor-engranaje.svg`, `rodamiento-designacion.svg`,
  `cilindro-neumatico.svg`) — diagramas técnicos de línea en la paleta de
  marca, no fotografías simuladas.
- **Qué mejoraría cada artículo:**
  - *Placa de características*: foto real de una placa de motor, legible.
  - *Códigos de error variadores ABB*: foto real de la pantalla de un
    variador ABB mostrando un código de fallo.
  - *Cadena o correa*: foto de banco de trabajo con ambos elementos juntos.
  - *Reparar o sustituir reductor*: foto de un reductor abierto en taller.
  - *Designación de rodamientos*: foto macro de un rodamiento con la
    referencia grabada legible.
  - *Dimensionado de cilindros FESTO*: foto de un cilindro FESTO instalado
    en una línea real (con el permiso del cliente correspondiente, o en el
    propio taller).
- Los SVG actuales son perfectamente válidos para publicar; sustituirlos es
  una mejora, no un bloqueante.

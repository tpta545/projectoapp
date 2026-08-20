(function () {
  "use strict";
  window.__BRAND__ = {
    name: "ApretaFotos",
    domain: "apretafotos.es",

    limits: {
      maxFiles: 40,
      maxFileSizeMB: 25,
      maxWidthOrHeightDefault: 1600
    },

    presets: [
      {
        id: "vinted",
        label: "Vinted",
        targetKB: 500,
        note: "Peso ágil para subir varias fotos seguidas desde el móvil sin esperas."
      },
      {
        id: "wallapop",
        label: "Wallapop",
        targetKB: 500,
        note: "Carga rápida en el chat y en el listado de anuncios."
      },
      {
        id: "etsy",
        label: "Etsy",
        targetKB: 800,
        note: "Algo más de margen para que se noten los detalles del producto."
      },
      {
        id: "web-rapida",
        label: "Web rápida (bajo 200 KB)",
        targetKB: 200,
        note: "Para que tu web cargue rápido incluso con datos móviles."
      },
      {
        id: "email",
        label: "Email (bajo 1 MB)",
        targetKB: 1024,
        note: "Evita rebotes por límite de tamaño de adjuntos."
      }
    ],

    faqs: [
      {
        q: "¿Comprimir una foto le quita calidad?",
        a: "Depende de cuánto aprietes. Bajar de calidad 100 a 80-85 casi nunca se nota a simple vista, porque el ojo no percibe esa pérdida en fotos con detalle normal (no en capturas de texto o dibujos con bordes duros). Por debajo de 60 ya empiezan a verse artefactos, sobre todo en zonas con degradados suaves como el cielo o una pared lisa. El modo peso objetivo bajará la calidad y, si hace falta, el tamaño hasta cumplir el peso que le pidas, así que cuanto más agresivo sea el objetivo, más se notará."
      },
      {
        q: "¿Se suben mis fotos a algún servidor?",
        a: "No. Todo el proceso ocurre en tu navegador, en tu propio dispositivo. ApretaFotos no tiene servidor de subida: no hay ningún punto donde tus imágenes salgan de tu ordenador o tu móvil. Puedes comprobarlo desconectando internet después de cargar la página: la herramienta te seguirá funcionando."
      },
      {
        q: "¿Cuánto puedo comprimir una imagen sin que se note?",
        a: "Como referencia general, en una foto de móvil normal (12-48 megapíxeles) puedes bajar de 4-8 MB a 300-600 KB con calidad 80-85 sin pérdida visible en pantalla. Para publicar en una app de segunda mano, con calidad 70 y un ancho máximo de 1600 px suele bastar de sobra: nadie va a ampliar tu foto al 400 % para mirar el pixelado."
      },
      {
        q: "¿Qué formato conviene para vender online?",
        a: "JPG es el más compatible al 100 % y el que mejor conocen apps como Vinted, Wallapop o Milanuncios. WebP pesa entre un 25 % y un 35 % menos a la misma calidad visual, pero alguna app o navegador antiguo puede no aceptarlo todavía. Si tu prioridad es peso mínimo y subes a tu propia web, usa WebP; si subes a un marketplace y quieres evitar sorpresas, quédate en JPG."
      },
      {
        q: "¿Por qué mi foto sigue pesando mucho después de comprimirla?",
        a: "Las causas más habituales: la imagen es un PNG (formato sin pérdida, pensado para capturas y gráficos, no para fotos) — conviértela a JPG o WebP y bajará mucho más; la resolución original es enorme (muchos móviles disparan a 12 MP o más) — activa el redimensionado por ancho máximo; o el objetivo de peso que pediste es demasiado bajo para el contenido de la foto y la herramienta ha llegado a su límite de calidad razonable sin poder bajar más."
      }
    ]
  };
})();

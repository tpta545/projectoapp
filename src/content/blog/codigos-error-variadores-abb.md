---
titulo: "Códigos de error habituales en variadores ABB y qué significan"
resumen: "Los códigos de fallo más frecuentes en variadores de frecuencia ABB, qué indican y qué comprobar antes de llamar al servicio técnico."
seo:
  title: "Códigos de error en variadores ABB | Guía"
  description: "Códigos de fallo más habituales en variadores ABB: sobrecorriente, sobretensión, fallo a tierra y sobretemperatura. Qué revisar antes de sustituir."
categoria: "Averías y diagnóstico"
autor: "Equipo técnico TRADE"
fechaPublicacion: 2026-04-02
imagen: "/imagenes/blog/variador-error.svg"
imagenAlt: "Pantalla esquemática de un variador de frecuencia mostrando un código de error de sobrecorriente"
tiempoLectura: 9
relacionados:
  - "placa-caracteristicas-motor-electrico"
  - "dimensionado-cilindros-neumaticos-festo"
---

Un variador de frecuencia que se dispara no siempre está averiado: en muchos casos está protegiendo al motor o a sí mismo de una condición anómala de la instalación. Interpretar correctamente el código de error antes de pedir un recambio o programar una visita técnica ahorra tiempo y, a veces, evita una sustitución innecesaria.

## Sobrecorriente (overcurrent)

Es uno de los disparos más frecuentes. Indica que la corriente de salida ha superado el límite configurado o el límite del propio variador. Las causas más habituales son un motor sobrecargado mecánicamente, una rampa de aceleración demasiado corta para la inercia de la carga, o un cortocircuito en el motor o en el cableado de salida. Antes de pensar en el variador, conviene comprobar que el eje del motor gira libremente sin el variador conectado y que el aislamiento del motor está en buen estado.

## Sobretensión de bus DC (overvoltage)

Aparece cuando la tensión interna del bus de continua supera el límite admisible, típicamente durante una deceleración brusca en la que el motor actúa momentáneamente como generador y devuelve energía al variador más rápido de lo que este puede disiparla. Es habitual en cargas con inercia elevada (ventiladores grandes, cintas con mucha masa) cuando la rampa de deceleración es demasiado agresiva. Alargar la rampa de parada o instalar una resistencia de frenado suele resolverlo.

## Fallo a tierra (ground fault)

Indica una fuga de corriente hacia tierra en el motor o en el cableado de salida. Puede deberse a un fallo real de aislamiento del bobinado del motor —especialmente si el motor lleva años en ambiente húmedo— o a un cable de salida dañado. Es un error que conviene tomar en serio: seguir forzando el arranque con un fallo a tierra real puede dañar el módulo de potencia del variador.

## Sobretemperatura del variador (overtemperature)

El variador dispone de un sensor interno que detecta cuándo su disipador supera la temperatura de trabajo segura. Las causas más frecuentes son ventilación insuficiente de la envolvente donde está instalado, filtros de la envolvente obstruidos por polvo, o un ventilador interno del propio variador averiado, algo habitual a partir de cierta antigüedad. Comprobar la limpieza del entorno de instalación es el primer paso antes de pensar en una avería interna.

## Subtensión (undervoltage)

Se dispara cuando la tensión de alimentación cae por debajo del mínimo admisible, ya sea por una caída de red real (frecuente en instalaciones con línea larga o transformador infradimensionado) o por un fallo en la propia alimentación del variador. Conviene medir la tensión de entrada en el propio cuadro durante el fallo, no solo en reposo, ya que algunas caídas solo se producen bajo carga.

## Fallo del motor o pérdida de fase

Indica que el variador no detecta la corriente esperada en una de las fases de salida, lo que suele apuntar a una conexión floja, un terminal oxidado o, en casos más graves, un devanado del motor interrumpido. Es uno de los pocos códigos donde revisar físicamente las conexiones antes de cualquier otra prueba resuelve la mayoría de los casos.

## Qué hacer antes de llamar al servicio técnico

Anota el código exacto que muestra la pantalla del variador (no solo "ha saltado un error"), la operación que se estaba realizando en ese momento (arranque, parada, régimen estable) y si el fallo es puntual o se repite de forma sistemática. Con esos tres datos, nuestro servicio de [reparación de equipos](/servicios/reparacion-equipos/) puede orientar el diagnóstico antes incluso de ver el variador, y confirmar si el caso requiere revisión en taller o si es un ajuste de parametrización que se resuelve en la propia instalación.

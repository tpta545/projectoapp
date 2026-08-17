---
titulo: Variadores de frecuencia
resumen: Variadores ABB para regular la velocidad de motores asíncronos, con parametrización y puesta en marcha incluidas en el asesoramiento técnico.
seo:
  title: "Variadores de frecuencia ABB | TRADE Algemesí"
  description: "Variadores de frecuencia ABB serie ACS. Dimensionado según motor y aplicación, puesta en marcha y sustitución de unidades averiadas en 24h."
marcas:
  - abb
orden: 4
criterios:
  - dato: Potencia y corriente nominal del motor a controlar
    porque: El variador se dimensiona por corriente del motor, no solo por potencia; un motor de alto par de arranque puede necesitar un variador de categoría superior.
  - dato: Tensión de alimentación (monofásica o trifásica, 230/400 V)
    porque: Determina la serie de variador compatible; no todos los modelos admiten entrada monofásica.
  - dato: Tipo de carga (par constante o par variable, como bombas y ventiladores)
    porque: Los variadores para par variable (bombas, ventiladores) pueden dimensionarse de forma distinta a los de par constante (cintas, extrusoras), optimizando coste y tamaño.
  - dato: Referencia del variador averiado, si es sustitución
    porque: Permite comprobar compatibilidad de firmware y macro de parametrización con el modelo de recambio.
  - dato: Necesidad de comunicación con PLC o SCADA (Modbus, Profibus, Ethernet)
    porque: Algunos protocolos requieren un módulo de comunicación adicional que hay que incluir en el presupuesto.
faq:
  - pregunta: "¿Qué código de error es más habitual en un variador ABB y qué indica?"
    respuesta: "Los códigos de sobrecorriente y sobretensión de bus DC son los más frecuentes. Lo desarrollamos con detalle, código por código, en nuestro artículo del blog sobre averías habituales en variadores ABB."
  - pregunta: "¿Puedo sustituir un variador averiado por uno de potencia superior?"
    respuesta: "Sí, siempre que la corriente nominal del variador nuevo sea igual o superior a la del motor, y se reparametrice correctamente (corriente nominal de motor, rampas, macro de aplicación). Un variador sobredimensionado no daña el motor, pero uno infradimensionado disparará protecciones constantemente."
  - pregunta: "¿El variador necesita filtro adicional para evitar interferencias?"
    respuesta: "En instalaciones con cableado largo hasta el motor o con equipos electrónicos sensibles cerca, se recomienda filtro de armónicos o reactancia de salida. Lo valoramos en el asesoramiento técnico según la instalación concreta."
  - pregunta: "¿Se puede alimentar un variador trifásico desde una red monofásica?"
    respuesta: "Existen modelos de entrada monofásica y salida trifásica para potencias bajas y medias, pero no es lo habitual en la gama industrial de mayor potencia. Hay que verificar la serie concreta antes de dar por válida esta opción."
  - pregunta: "¿Cuánto dura de media un variador de frecuencia en servicio industrial?"
    respuesta: "Con ventilación adecuada y ambiente sin polvo excesivo, una vida útil de 10-15 años es habitual antes de que el fallo de un componente (típicamente condensadores del bus DC o el ventilador de refrigeración) haga más razonable la sustitución que la reparación."
---

Un variador de frecuencia regula la velocidad de un motor asíncrono trifásico modificando la frecuencia y la tensión de alimentación, en lugar de dejarlo girar siempre a la velocidad fija que impone la red eléctrica. Permite ajustar el caudal de una bomba, la velocidad de una cinta o el arranque suave de una carga con inercia elevada, con el ahorro energético añadido de no forzar el motor a plena velocidad cuando el proceso no lo requiere.

## Tipologías y variantes que distribuimos

**Variadores compactos de baja potencia**, para motores de hasta unos pocos kW, con panel de control integrado y parametrización rápida mediante macros predefinidas (bomba, ventilador, cinta transportadora), pensados para sustitución directa sin ingeniería adicional.

**Variadores de gama media e industrial**, para potencias medias y altas, con opciones de comunicación (Modbus RTU, Profibus, Ethernet industrial) para integrarse en un PLC o SCADA de planta, y funciones de control vectorial para aplicaciones que exigen par elevado a baja velocidad.

**Módulos de frenado y resistencias de frenado**, necesarios cuando la aplicación exige deceleración rápida o el motor trabaja en modo generador de forma habitual, como en cintas inclinadas o centrifugadoras.

**Filtros de armónicos y reactancias**, para instalaciones donde la longitud de cable al motor o la sensibilidad de otros equipos electrónicos de la planta requiere reducir interferencias conducidas o radiadas.

## Marcas disponibles en esta familia

Distribuidor oficial **ABB** para variadores de frecuencia, serie ACS de gama compacta e industrial. Mantenemos en stock las referencias de sustitución más solicitadas en la comarca y gestionamos con ABB las unidades de mayor potencia con entrega en 24 horas.

## Aplicaciones típicas en la industria de la zona

En **riego y bombeo agrícola**, los variadores regulan el caudal de las bombas según la demanda real, evitando el arranque directo a plena carga y reduciendo el consumo frente a un régimen de todo-nada. En **envasado**, controlan la velocidad de cintas y encajadoras para sincronizar el ritmo de líneas con distintas estaciones. En **plástico**, regulan la velocidad del husillo de extrusora con control vectorial para mantener un par constante aunque varíe la viscosidad del material. En **cerámica**, controlan ventiladores de hornos y extractores donde el ahorro energético del variador frente al arranque directo es significativo por las horas de funcionamiento continuo.

## Cuándo compensa reparar frente a sustituir

Muchos fallos de variador (ventilador de refrigeración, condensadores del bus DC, tarjeta de control) tienen reparación viable si el módulo de potencia principal (IGBT) no está dañado. Ofrecemos diagnóstico en taller con informe técnico antes de decidir; lo explicamos con detalle en [reparación de equipos](/servicios/reparacion-equipos/). Cuando el fallo afecta al módulo de potencia o el modelo está descatalogado, la sustitución suele ser la opción más razonable.

## Cómo pedir presupuesto sin perder tiempo

Si el variador está averiado, la referencia completa (visible en la etiqueta lateral) es el dato más rápido para localizar una unidad equivalente o compatible. Si es para un motor nuevo o una instalación desde cero, con la placa de características del motor y el tipo de carga dimensionamos el variador correcto sin sobredimensionar el presupuesto.

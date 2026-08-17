---
titulo: "Cilindros neumáticos FESTO: criterios de dimensionado"
resumen: "Cómo calcular el diámetro de émbolo y elegir la carrera correcta de un cilindro neumático a partir de la fuerza y presión de trabajo reales."
seo:
  title: "Dimensionado de cilindros neumáticos | Guía"
  description: "Cómo dimensionar un cilindro neumático: cálculo de fuerza según diámetro y presión, elección de carrera y margen de seguridad recomendado."
categoria: "Selección de componentes"
autor: "Equipo técnico TRADE"
fechaPublicacion: 2026-07-20
imagen: "/imagenes/blog/cilindro-neumatico.svg"
imagenAlt: "Esquema de un cilindro neumático de doble efecto con vástago extendido"
tiempoLectura: 7
relacionados:
  - "codigos-error-variadores-abb"
  - "guia-designacion-rodamientos"
---

Dimensionar mal un cilindro neumático suele salir caro dos veces: si se queda corto de fuerza, el ciclo falla o se ralentiza; si se sobredimensiona sin necesidad, se paga de más en componente, en consumo de aire y en el tamaño de las electroválvulas y racores asociados. El cálculo básico no es complicado, pero conviene hacerlo con los datos reales de la instalación, no con una estimación a ojo.

## El cálculo de fuerza teórica

La fuerza que puede ejercer un cilindro neumático depende del diámetro del émbolo y de la presión de trabajo, según la fórmula:

**F = P × A**

Donde F es la fuerza en newtons, P la presión en pascales y A el área del émbolo en metros cuadrados. En unidades más prácticas para taller, con la presión en bar y el diámetro en milímetros, la fuerza aproximada en newtons se calcula como:

**F ≈ 0,0785 × D² × P**

(D en mm, P en bar). Por ejemplo, un cilindro de 50 mm de diámetro a 6 bar desarrolla teóricamente unos 0,0785 × 2500 × 6 ≈ 1.177 N en la carrera de avance (empuje). En la carrera de retroceso, la fuerza real es algo menor porque el vástago ocupa parte del área efectiva del émbolo.

## Por qué la fuerza teórica no es la fuerza disponible

Ese cálculo da la fuerza teórica máxima, no la que conviene usar para dimensionar. Hay que descontar las pérdidas por fricción interna del cilindro (entre un 3 % y un 10 % según el estado y la lubricación) y, sobre todo, dejar margen de seguridad frente a variaciones de presión de la instalación, que rara vez es perfectamente constante. Como referencia orientativa, dimensionar para que la fuerza requerida por la aplicación no supere el 70-80 % de la fuerza teórica calculada suele dar un margen razonable sin sobredimensionar en exceso.

## Elegir la carrera correcta

La carrera debe cubrir el recorrido real necesario más un pequeño margen, pero no mucho más: una carrera excesiva no solo encarece el cilindro, sino que aumenta el riesgo de pandeo del vástago en la posición de máxima extensión, especialmente si el cilindro trabaja en posición horizontal con carga lateral. Para carreras largas con carga axial significativa, conviene consultar la tabla de pandeo del fabricante antes de decidir el diámetro, ya que puede ser necesario un diámetro mayor del que la fuerza por sí sola exigiría, solo para evitar que el vástago se combe.

## Presión de trabajo: no dar por hecho el valor nominal

Muchas instalaciones neumáticas trabajan a una presión inferior a los 6-7 bar nominales de una red bien dimensionada, especialmente si el compresor está lejos, si hay muchas tomas simultáneas o si el diámetro de tubería es insuficiente para el caudal demandado. Dimensionar un cilindro asumiendo 6 bar cuando la instalación real trabaja a 4,5 bar es un error habitual que se traduce en un cilindro que no llega a desarrollar la fuerza esperada en la práctica, aunque el cálculo sobre el papel fuera correcto.

## Velocidad de ciclo y caudal de aire

Además de la fuerza, en aplicaciones de ciclo rápido hay que verificar que la instalación puede suministrar el caudal de aire necesario para la velocidad de avance y retroceso requerida. Un cilindro de diámetro grande en un ciclo rápido puede exigir un caudal que la unidad de mantenimiento o el diámetro de tubo instalado no son capaces de entregar, lo que se traduce en un ciclo más lento del esperado aunque el cilindro esté bien dimensionado en fuerza.

## Cuando el cálculo no es sencillo

En aplicaciones con carga lateral, montaje no alineado con el eje del vástago, o ciclos de trabajo muy exigentes, el cálculo básico de fuerza no es suficiente para garantizar una selección correcta. En esos casos, nuestro asesoramiento técnico puede ayudar a dimensionar el cilindro y el resto de componentes neumáticos asociados con los datos reales de la aplicación.

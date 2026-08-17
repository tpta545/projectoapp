---
titulo: "Guía de designación de rodamientos: qué dice cada dígito de la referencia"
resumen: "Cómo leer una designación ISO de rodamiento, como 6205-2RS, para identificar tipo, tamaño y obturación sin necesidad de un catálogo delante."
seo:
  title: "Cómo leer la designación de un rodamiento"
  description: "Guía para interpretar la designación ISO de un rodamiento (por ejemplo 6205-2RS): serie, diámetro interior, tolerancia y tipo de obturación."
categoria: "Selección de componentes"
autor: "Equipo técnico TRADE"
fechaPublicacion: 2026-06-28
imagen: "/imagenes/blog/rodamiento-designacion.svg"
imagenAlt: "Esquema de un rodamiento rígido de bolas con sus elementos de rodadura señalados"
tiempoLectura: 8
relacionados:
  - "cadena-o-correa-como-elegir"
  - "placa-caracteristicas-motor-electrico"
---

La designación de un rodamiento parece un código arbitrario hasta que se conoce su estructura. Una vez se entiende, es posible deducir el tipo de rodamiento y su diámetro interior con solo leer la referencia grabada, sin necesidad de tener un catálogo delante.

## La estructura básica de una designación

Tomemos como ejemplo **6205-2RS**. Se descompone así:

- **6**: primer dígito, indica la serie o tipo de rodamiento. El 6 corresponde a rígido de bolas de una hilera, uno de los tipos más comunes.
- **2**: segundo dígito, indica la serie de dimensiones (relación entre el diámetro exterior y el interior para un mismo diámetro de eje). Un 2 indica serie ligera; otros valores habituales son 3 (serie media) o 0 (serie extraligera).
- **05**: los dos últimos dígitos del bloque numérico principal indican el diámetro interior. Para valores de 04 en adelante, se multiplican por 5: 05 × 5 = 25 mm de diámetro interior. Es la regla más útil de memorizar.
- **-2RS**: sufijo que indica el tipo de obturación. 2RS significa que el rodamiento lleva junta de goma en ambos lados (sellado); ZZ indicaría blindaje metálico en ambos lados; la ausencia de sufijo indica rodamiento abierto, sin protección.

Con esa lectura, 6205-2RS es un rodamiento rígido de bolas, serie ligera, de 25 mm de diámetro interior, con sellado de goma en ambos lados.

## La excepción de los diámetros pequeños

Para diámetros interiores menores de 10 mm, la regla del "multiplicar por 5" no aplica: los dos últimos dígitos suelen representar directamente el diámetro en milímetros o seguir códigos específicos (00 = 10 mm, 01 = 12 mm, 02 = 15 mm, 03 = 17 mm). A partir de 04 (20 mm) empieza a aplicar la multiplicación por 5 de forma consistente.

## Otros sufijos habituales que conviene reconocer

**C3, C4**: indican una holgura interna mayor que la estándar, habitual en aplicaciones con dilatación térmica elevada, donde una holgura de fábrica estándar quedaría demasiado ajustada en caliente.

**N**: indica una ranura con anillo de retención (circlip) en el aro exterior, que facilita la fijación axial del rodamiento en su alojamiento sin necesidad de un resalte mecanizado.

**K**: en rodamientos de rodillos cónicos o a rótula, indica agujero cónico en vez de cilíndrico, para montaje sobre manguito de fijación en vez de directamente sobre el eje.

## Series distintas a la 6xxx

No todos los rodamientos siguen la estructura de la serie 6xxx. Los rodamientos de rodillos cónicos, por ejemplo, usan designaciones propias del tipo 30205 o similares, donde la lógica de lectura cambia: los dos primeros dígitos indican la serie constructiva concreta y no son directamente comparables a la del rígido de bolas. Los rodamientos a rótula (serie 22xx o 23xx) y las unidades de soporte (UCP205, UCF205) también tienen su propia lógica de designación, generalmente incluyendo el diámetro de eje de forma más directa en el propio código.

## Por qué merece la pena saber leerla

Cuando una pieza llega al taller sin más identificación que la propia marca grabada, poder leer la designación completa —no solo "parece un 6205"— evita pedir un rodamiento del tamaño correcto pero con la obturación equivocada, o con una holgura interna que no es la que exige la aplicación. Si la referencia es ilegible o dudosa, una fotografía nítida de la pieza y sus medidas con pie de rey son suficientes para que confirmemos la designación exacta antes de preparar presupuesto.

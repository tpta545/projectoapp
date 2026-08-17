export const EMPRESA = {
  razonSocial: 'Transmisiones del Este, S.L.',
  marca: 'TRADE',
  cif: 'B98505019',
  direccion: {
    calle: 'C/ Sabaters, 32',
    poligono: 'Polígono Industrial Les Cotes',
    cp: '46680',
    localidad: 'Algemesí',
    provincia: 'Valencia',
    completa: 'C/ Sabaters, 32 — Polígono Industrial Les Cotes, 46680 Algemesí (Valencia)',
  },
  telefono: '961 753 565',
  telefonoHref: 'tel:+34961753565',
  whatsapp: '34961753565',
  email: 'info@grupotrade.es',
  fundacion: 2013,
  dominio: 'grupotrade.es',
  urlBase: 'https://www.grupotrade.es',
  horario: {
    texto: 'Lunes a viernes, 8:00 – 13:30 y 15:00 – 18:00',
    schema: 'Mo-Fr 08:00-13:30,15:00-18:00',
  },
  coordenadas: {
    lat: 39.1908,
    lng: -0.4359,
  },
} as const;

export const MARCAS_OFICIALES = [
  { slug: 'abb', nombre: 'ABB' },
  { slug: 'festo', nombre: 'FESTO' },
  { slug: 'dodge', nombre: 'Dodge' },
  { slug: 'isb', nombre: 'ISB' },
  { slug: 'tellure-rota', nombre: 'Tellure Rota' },
] as const;

export const FAMILIAS_PRODUCTO = [
  { slug: 'rodamientos', nombre: 'Rodamientos' },
  { slug: 'transmision-mecanica', nombre: 'Transmisión mecánica' },
  { slug: 'motores-electricos', nombre: 'Motores eléctricos' },
  { slug: 'variadores-frecuencia', nombre: 'Variadores de frecuencia' },
  { slug: 'neumatica', nombre: 'Neumática' },
  { slug: 'reductores', nombre: 'Reductores' },
  { slug: 'ruedas-rodadura', nombre: 'Ruedas y rodadura' },
  { slug: 'lubricantes', nombre: 'Lubricantes' },
  { slug: 'herramienta-manual', nombre: 'Herramienta manual' },
] as const;

export const DIFERENCIADORES = [
  {
    titulo: 'Stock propio en almacén',
    texto:
      'Referencias de rodamientos, transmisión y neumática disponibles en Algemesí, sin depender de plazos de fabricante para las piezas de rotación habitual.',
  },
  {
    titulo: 'Reparto propio en la comarca',
    texto:
      'Vehículo propio de reparto en Ribera Alta y Ribera Baixa: la pieza llega a planta sin esperar a una agencia de transporte externa.',
  },
  {
    titulo: 'Entrega en 24 h de producto sin stock',
    texto:
      'Si la referencia no está en almacén, se gestiona con el fabricante o distribución nacional para tenerla en planta al día siguiente hábil.',
  },
  {
    titulo: 'Asesoramiento técnico por personal del sector',
    texto:
      'Quien atiende el teléfono conoce la diferencia entre un rodamiento rígido de bolas y uno de rodillos cónicos. No es un call center.',
  },
] as const;

import type { Categoria } from "./tipos";

// Las diez categorías del conocimiento de la casa. Las `puertas` son rutas
// que YA existen (la guarda de pruebas lo comprueba contra src/app).
export const CATEGORIAS: Categoria[] = [
  {
    id: "continentes",
    nombre: "Continentes",
    pregunta: "¿Cómo es cada gran masa de tierra y qué historia la atraviesa?",
    descripcion: "Relieve, climas, pueblos, historia y peso actual de los seis continentes, de África a la Antártida.",
    color: "#e8c56a",
    puertas: [
      { ruta: "/regiones", etiqueta: "Regiones en cifras" },
      { ruta: "/atlas", etiqueta: "Atlas" },
    ],
  },
  {
    id: "paises",
    nombre: "Países",
    pregunta: "¿Cómo investigar un país de punta a punta?",
    descripcion: "Monografías de país: territorio, historia, sociedad, cultura y economía, enlazadas con su ficha de datos.",
    color: "#5eead4",
    puertas: [
      { ruta: "/mundos", etiqueta: "Fichas de 249 países y territorios" },
      { ruta: "/comparador", etiqueta: "Comparador" },
    ],
  },
  {
    id: "geografia-fisica",
    nombre: "Geografía física",
    pregunta: "¿Qué fuerzas dan forma al relieve, al clima y a los paisajes?",
    descripcion: "Tectónica, relieve, climas y biomas: los procesos naturales que organizan la superficie terrestre.",
    color: "#7dd3fc",
    puertas: [
      { ruta: "/mapas", etiqueta: "Mapas" },
      { ruta: "/conocimiento/area/geografia", etiqueta: "Área de geografía" },
    ],
  },
  {
    id: "geografia-humana",
    nombre: "Geografía humana",
    pregunta: "¿Dónde y cómo vive la humanidad?",
    descripcion: "Población, migraciones, ciudades y formas de ocupar el territorio, con las cifras de Naciones Unidas.",
    color: "#3ddc97",
    puertas: [
      { ruta: "/demografia", etiqueta: "Demografía" },
      { ruta: "/rankings", etiqueta: "Rankings" },
    ],
  },
  {
    id: "civilizaciones",
    nombre: "Historia de las civilizaciones",
    pregunta: "¿Cómo surgieron las primeras sociedades complejas y qué dejaron?",
    descripcion: "Ciudades, escritura, Estados y legados de las civilizaciones, con su cronología y sus debates.",
    color: "#f59e0b",
    puertas: [
      { ruta: "/historia", etiqueta: "Historia" },
      { ruta: "/conocimiento/area/civilizaciones", etiqueta: "Área de civilizaciones" },
    ],
  },
  {
    id: "culturas-sociedades",
    nombre: "Culturas y sociedades",
    pregunta: "¿Qué une y qué distingue a los pueblos del mundo?",
    descripcion: "Lenguas, creencias, costumbres y patrimonio: la diversidad cultural humana explicada con datos y contexto.",
    color: "#f472b6",
    puertas: [
      { ruta: "/conocimiento/area/cultura", etiqueta: "Área de cultura" },
      { ruta: "/traductor", etiqueta: "Traductor" },
    ],
  },
  {
    id: "ciencia-tecnologia",
    nombre: "Ciencia y tecnología",
    pregunta: "¿Cómo aprendió la humanidad a conocer y a transformar el mundo?",
    descripcion: "Del método científico a internet: ideas, instituciones y técnicas que cambiaron la vida humana.",
    color: "#a78bfa",
    puertas: [
      { ruta: "/conocimiento/area/ciencia", etiqueta: "Área de ciencia" },
      { ruta: "/labs", etiqueta: "Laboratorios" },
    ],
  },
  {
    id: "naturaleza-biodiversidad",
    nombre: "Naturaleza y biodiversidad",
    pregunta: "¿Qué vida alberga el planeta y qué la amenaza?",
    descripcion: "Especies, ecosistemas y biomas; las presiones que los reducen y las herramientas para protegerlos.",
    color: "#86efac",
    puertas: [
      { ruta: "/conocimiento/area/biodiversidad", etiqueta: "Área de biodiversidad" },
      { ruta: "/conocimiento/area/medioambiente", etiqueta: "Área de medio ambiente" },
    ],
  },
  {
    id: "organizaciones-internacionales",
    nombre: "Organizaciones internacionales",
    pregunta: "¿Cómo se coordinan los Estados y con qué límites?",
    descripcion: "El sistema de Naciones Unidas y los grandes organismos: mandatos, órganos, poderes reales y límites.",
    color: "#60a5fa",
    puertas: [
      { ruta: "/organizaciones", etiqueta: "Bloques y organismos" },
      { ruta: "/conocimiento/area/organizaciones-internacionales", etiqueta: "Área de organismos" },
    ],
  },
  {
    id: "recursos-naturales",
    nombre: "Recursos naturales",
    pregunta: "¿De qué recursos depende la vida humana y cómo se reparten?",
    descripcion: "Agua, energía y materias primas: dónde están, cómo se usan y qué conflictos y transiciones generan.",
    color: "#fb923c",
    puertas: [
      { ruta: "/conocimiento/area/recursos-naturales", etiqueta: "Área de recursos" },
      { ruta: "/investigacion", etiqueta: "Dossiers de investigación" },
    ],
  },
];

export function categoriaDe(id: string): Categoria | undefined {
  return CATEGORIAS.find((c) => c.id === id);
}

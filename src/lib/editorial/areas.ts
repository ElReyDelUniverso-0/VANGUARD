// ═══════════════════════════════════════════════════════════════════
// v406.3 LAS DIEZ ÁREAS EDITORIALES — la estructura que une las dos casas.
// Cada área declara sus salas del Vanguard MODERNO (rutas de servidor) y sus
// puertas del Vanguard CLÁSICO (/sala/<clave>, las 155 salas del cuartel).
// La biblioteca de artículos se cuelga de esta misma estructura: un lector que
// termina una pieza tiene a un clic el módulo vivo y la sala clásica del tema.
// Las claves clásicas se filtran contra puertas-salas: si una sala se renombra,
// la puerta desaparece del índice en vez de quedar rota.
// ═══════════════════════════════════════════════════════════════════
import { PUERTAS_SALAS } from "@/lib/vanguard/puertas-salas";
import type { ClaveArea, Enlace } from "./tipos";

export type AreaEditorial = {
  clave: ClaveArea;
  nombre: string;
  lema: string;
  descripcion: string;
  color: string;
  imagen: string;
  moderno: Enlace[];
  clasico: string[]; // claves de /sala/<clave>
};

export const AREAS_EDITORIALES: AreaEditorial[] = [
  {
    clave: "geopolitica",
    nombre: "Geopolítica",
    lema: "Poder, territorio y rutas",
    descripcion: "Cómo la geografía decide la política: estrechos, fronteras, alianzas y zonas de influencia.",
    color: "#e8c56a",
    imagen: "/imagenes-reales/kremlin.jpg",
    moderno: [
      { href: "/mapas", label: "Centro de mapas" },
      { href: "/poder", label: "Poder militar" },
      { href: "/escenarios", label: "El Estratega" },
    ],
    clasico: ["briefing", "gobierno", "lados"],
  },
  {
    clave: "paises",
    nombre: "Países y territorios",
    lema: "Los 249 del mapa",
    descripcion: "Estados, territorios y reconocimientos: quién es quién en el mapa y por qué.",
    color: "#38bdf8",
    imagen: "/imagenes-reales/satelite.jpg",
    moderno: [
      { href: "/mundos", label: "Los mundos (249 fichas)" },
      { href: "/atlas", label: "Atlas" },
      { href: "/divisas", label: "Divisas" },
    ],
    clasico: ["atlas", "tierra", "mundo"],
  },
  {
    clave: "economia",
    nombre: "Economía mundial",
    lema: "Dinero, comercio y crecimiento",
    descripcion: "Las cifras que mueven al mundo, explicadas con su fuente y su año.",
    color: "#3ddc97",
    imagen: "/imagenes-reales/shanghai.jpg",
    moderno: [
      { href: "/divisas", label: "Divisas" },
      { href: "/mundos", label: "PIB por país" },
      { href: "/pulso-mundial", label: "Pulso mundial" },
    ],
    clasico: ["bolsa", "bolsamonedas", "observatorio"],
  },
  {
    clave: "historia",
    nombre: "Historia",
    lema: "Lo que explica el presente",
    descripcion: "Tratados, guerras y épocas que dejaron reglas que seguimos usando.",
    color: "#f59e0b",
    imagen: "/imagenes-reales/muroberlin.jpg",
    moderno: [
      { href: "/historia", label: "Archivo de guerras" },
      { href: "/archivo-mundial#epocas", label: "Las eras" },
    ],
    clasico: ["historia", "epocas", "conquistas3d"],
  },
  {
    clave: "conflictos",
    nombre: "Conflictos internacionales",
    lema: "Guerras con método",
    descripcion: "Los conflictos abiertos y las herramientas para entenderlos sin propaganda.",
    color: "#ff3b30",
    imagen: "/imagenes-reales/portaaviones.jpg",
    moderno: [
      { href: "/conflictos", label: "Conflictos" },
      { href: "/guerra-hoy", label: "Guerra hoy" },
      { href: "/verdad-cruda", label: "Verdad cruda" },
    ],
    clasico: ["salaguerra", "contadores", "memorial"],
  },
  {
    clave: "ciencia",
    nombre: "Ciencia y tecnología",
    lema: "La tecnología que decide",
    descripcion: "Chips, drones, satélites e inteligencia artificial: la ciencia como factor de poder.",
    color: "#a78bfa",
    imagen: "/imagenes-reales/gps.jpg",
    moderno: [
      { href: "/armeria", label: "Armería" },
      { href: "/herramientas", label: "Herramientas" },
    ],
    clasico: ["dron", "experimental", "maquina"],
  },
  {
    clave: "sociedad",
    nombre: "Sociedad y cultura",
    lema: "Gente, lenguas y costumbres",
    descripcion: "Las personas detrás de los mapas: lenguas, migraciones, ciudades y cultura.",
    color: "#f472b6",
    imagen: "/imagenes-reales/onu.jpg",
    moderno: [
      { href: "/traductor", label: "Traductor" },
      { href: "/audios", label: "Emisora" },
    ],
    clasico: ["comunidad", "redes", "memes"],
  },
  {
    clave: "educacion",
    nombre: "Educación",
    lema: "Aprender a leer el mundo",
    descripcion: "Guías prácticas: verificar, leer mapas, entender cifras y estudiar con fuentes.",
    color: "#22d3ee",
    imagen: "/imagenes-reales/arco.jpg",
    moderno: [
      { href: "/sala/biblioteca", label: "La Gran Biblioteca" },
      { href: "/archivo-mundial#curiosidades", label: "Curiosidades" },
      { href: "/sala/quiz", label: "Quiz" },
    ],
    clasico: ["biblioteca", "enciclopedia", "verifica"],
  },
  {
    clave: "recursos",
    nombre: "Recursos naturales",
    lema: "Energía, minerales y agua",
    descripcion: "Petróleo, gas, minerales críticos y agua: lo que hay bajo el mapa y quién lo controla.",
    color: "#84cc16",
    imagen: "/imagenes-reales/satelite.jpg",
    moderno: [
      { href: "/pulso-mundial", label: "Pulso mundial" },
      { href: "/mapas", label: "Capas del planeta" },
    ],
    clasico: ["tierra", "observatorio", "pulso"],
  },
  {
    clave: "relaciones",
    nombre: "Relaciones internacionales",
    lema: "Diplomacia, cumbres y tratados",
    descripcion: "Las mesas donde se negocia el mundo: ONU, cumbres, alianzas y acuerdos.",
    color: "#60a5fa",
    imagen: "/imagenes-reales/kremlin.jpg",
    moderno: [
      { href: "/servicios", label: "Inteligencia mundial" },
      { href: "/rostros", label: "Rostros del poder" },
    ],
    clasico: ["redmundial", "gobierno", "osint"],
  },
];

export const AREA_POR_CLAVE = new Map(AREAS_EDITORIALES.map((a) => [a.clave, a]));

export function area(clave: ClaveArea): AreaEditorial {
  const a = AREA_POR_CLAVE.get(clave);
  if (!a) throw new Error(`Área editorial desconocida: ${clave}`);
  return a;
}

/** Puertas clásicas vivas (las que existen en puertas-salas) con su título real. */
export function puertasClasicas(claves: string[]): { href: string; label: string }[] {
  return claves
    .filter((k) => k in PUERTAS_SALAS)
    .map((k) => ({ href: `/sala/${k}`, label: PUERTAS_SALAS[k].titulo }));
}

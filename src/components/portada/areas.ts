// ═══════════════════════════════════════════════════════════════════
// v406.2 LAS OCHO PUERTAS DE LA PORTADA — lo que se puede HACER en Vanguard.
// Cada área apunta a su módulo REAL (rutas comprobadas con 200 y contenido):
// nada de páginas vacías ni funciones por venir. Los números que se enseñan
// salen de la fuente de datos de cada sala, no se escriben a mano.
// ═══════════════════════════════════════════════════════════════════
import { PAISES_ATLAS } from "@/lib/atlas-data";
import { HISTORICAL_WARS } from "@/lib/game-data";
import { CURIOSITIES } from "@/lib/archive-data";
import { TOTAL_PUERTAS } from "@/lib/vanguard/puertas-salas";
import { PAISES_GEO } from "@/lib/geo-paises";

export type ClaveArea =
  | "mundos"
  | "noticias"
  | "mapas"
  | "simuladores"
  | "informacion"
  | "historia"
  | "educacion"
  | "documentales";

export type Area = {
  clave: ClaveArea;
  titulo: string;
  verbo: string; // lo que el visitante HACE aquí
  txt: string;
  href: string;
  cta: string;
  color: string;
  dato?: string;
  vivo?: boolean;
  atajos: { href: string; label: string }[];
};

export const AREAS: Area[] = [
  {
    clave: "noticias",
    titulo: "Noticias",
    verbo: "Infórmate",
    txt: "La última hora de cada conflicto, minuto a minuto y con su fuente.",
    href: "/en-vivo",
    cta: "Ver en vivo",
    color: "#ff3b30",
    vivo: true,
    atajos: [
      { href: "/guerra-hoy", label: "Guerra hoy" },
      { href: "/cronica", label: "Crónica del día" },
      { href: "/vertigo", label: "Vértigo" },
    ],
  },
  {
    clave: "mapas",
    titulo: "Mapas",
    verbo: "Explora",
    txt: "Ocho capas del planeta en un solo globo y las guerras en 3D.",
    href: "/mapas",
    cta: "Abrir los mapas",
    color: "#38bdf8",
    dato: "8 capas",
    atajos: [
      { href: "/mundo", label: "Mundo 3D" },
      { href: "/atlas", label: "Atlas" },
      { href: "/zona-cero", label: "Teatro global" },
    ],
  },
  {
    clave: "simuladores",
    titulo: "Simuladores",
    verbo: "Simula",
    txt: "Escenarios de presión, guerras país contra país y el «¿y si…?» de la historia.",
    href: "/escenarios",
    cta: "Abrir el Estratega",
    color: "#ff8a2a",
    atajos: [
      { href: "/motores", label: "Motores & 100 Plataformas" },
      { href: "/sala/warsim", label: "Simulador de guerras" },
      { href: "/sala/laboratorio", label: "Laboratorio" },
    ],
  },
  {
    clave: "mundos",
    titulo: "Mundos",
    verbo: "Elige",
    txt: "Los países del planeta con su ficha, sus fronteras reales y los mundos de la casa.",
    href: "/mundos",
    cta: "Abrir los mundos",
    color: "#e8c56a",
    dato: `${PAISES_GEO.length} países`,
    atajos: [
      { href: "/entrar", label: "Elegir mundo" },
      { href: "/universo", label: "Universo diario" },
      { href: "/cuartel", label: "El Cuartel" },
    ],
  },
  {
    clave: "informacion",
    titulo: "Información",
    verbo: "Investiga",
    txt: "Quién mueve el planeta: líderes, servicios de inteligencia, datos y monedas.",
    href: "/rostros",
    cta: "Los rostros del poder",
    color: "#60a5fa",
    atajos: [
      { href: "/investigacion", label: "Dossiers sistémicos" },
      { href: "/servicios", label: "Inteligencia" },
      { href: "/pulso-mundial", label: "Pulso mundial" },
      { href: "/divisas", label: "Divisas" },
    ],
  },
  {
    clave: "historia",
    titulo: "Historia",
    verbo: "Recuerda",
    txt: "Las guerras que enseñaron a leer las de hoy, de la Antigüedad a nuestros días.",
    href: "/historia",
    cta: "Abrir el archivo",
    color: "#f59e0b",
    dato: `${HISTORICAL_WARS.length} guerras`,
    atajos: [
      { href: "/archivo-mundial#epocas", label: "Las eras" },
      { href: "/armeria", label: "Armería" },
    ],
  },
  {
    clave: "educacion",
    titulo: "Vanguard Academy",
    verbo: "Aprende",
    txt: "Formación de inteligencia militar, lectura OSINT y diplomacia con diplomas SHA-256.",
    href: "/academia",
    cta: "Entrar a Vanguard Academy",
    color: "#10b981",
    dato: "10 cursos",
    atajos: [
      { href: "/academia", label: "Vanguard Academy" },
      { href: "/academia/cursos", label: "Catálogo de cursos" },
      { href: "/sala/biblioteca", label: "La Gran Biblioteca" },
    ],
  },
  {
    clave: "documentales",
    titulo: "Documentales",
    verbo: "Mira",
    txt: "La videoteca de la casa, Vanguard TV y los registros documentales con fuente.",
    href: "/galeria#videoteca-titulo",
    cta: "Abrir la videoteca",
    color: "#f472b6",
    atajos: [
      { href: "/sala/pantalla", label: "Vanguard TV" },
      { href: "/verdad-cruda", label: "Verdad cruda" },
      { href: "/audios", label: "Emisora" },
    ],
  },
];

/** Cifras reales para el héroe de la portada. */
export const CIFRAS_CASA = {
  naciones: PAISES_ATLAS.length,
  curiosidades: CURIOSITIES.length,
  salas: TOTAL_PUERTAS,
};

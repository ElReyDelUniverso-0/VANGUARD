// ═══════════════════════════════════════════════════════════════════
// v440.5 · LAS FUENTES OFICIALES — quién dice qué, cada cuánto y con qué
// licencia. Si una fuente no está en esta lista, no entra en la página.
// ═══════════════════════════════════════════════════════════════════

export type Fuente = {
  id: string;
  nombre: string;
  organismo: string;
  que: string;
  cadencia: string;
  licencia: string;
  url: string;
  /** cómo la lee Global Danger */
  uso: "vivo" | "instantanea" | "ambas";
};

export const FUENTES: Fuente[] = [
  {
    id: "usgs",
    nombre: "USGS · terremotos",
    organismo: "Servicio Geológico de los Estados Unidos",
    que: "Sismos de magnitud 4,5 o más de los últimos 7 días, con hora, coordenadas, profundidad y magnitud revisada.",
    cadencia: "Cada minuto (feed GeoJSON)",
    licencia: "Dominio público (obra del Gobierno de EE. UU.)",
    url: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php",
    uso: "vivo",
  },
  {
    id: "gdacs",
    nombre: "GDACS · alertas de desastre",
    organismo: "Centro Común de Investigación (Comisión Europea) y OCHA",
    que: "Terremotos, ciclones, inundaciones, incendios, sequías y volcanes con impacto potencial, con nivel de alerta verde, naranja o rojo.",
    cadencia: "Casi en tiempo real (RSS)",
    licencia: "Dominio público",
    url: "https://www.gdacs.org/",
    uso: "vivo",
  },
  {
    id: "eonet",
    nombre: "NASA EONET · eventos naturales",
    organismo: "NASA Earth Observatory",
    que: "Incendios, tormentas, volcanes, icebergs y otros eventos naturales observados por satélite.",
    cadencia: "Varias veces al día",
    licencia: "Abierta (NASA)",
    url: "https://eonet.gsfc.nasa.gov/",
    uso: "vivo",
  },
  {
    id: "who-don",
    nombre: "OMS · Disease Outbreak News",
    organismo: "Organización Mundial de la Salud",
    que: "Brotes y eventos de salud pública notificados por país, con fecha de publicación y enlace al parte completo.",
    cadencia: "Cuando la OMS publica un parte",
    licencia: "Uso con atribución (OMS)",
    url: "https://www.who.int/emergencies/disease-outbreak-news",
    uso: "vivo",
  },
  {
    id: "worldbank",
    nombre: "Banco Mundial · Indicadores del desarrollo",
    organismo: "Banco Mundial (WDI)",
    que: "Series anuales comparables por país: contaminación del aire, subalimentación, agua segura, bosque, CO₂, esperanza de vida, electricidad.",
    cadencia: "Anual (cada indicador con su propio año)",
    licencia: "CC BY 4.0",
    url: "https://data.worldbank.org/",
    uso: "ambas",
  },
  {
    id: "open-meteo",
    nombre: "Open-Meteo · calidad del aire",
    organismo: "Open-Meteo (datos del modelo CAMS de Copernicus)",
    que: "PM2,5 y otros contaminantes hora a hora para cualquier punto del planeta.",
    cadencia: "Cada hora",
    licencia: "CC BY 4.0",
    url: "https://open-meteo.com/en/docs/air-quality-api",
    uso: "vivo",
  },
  {
    id: "fao",
    nombre: "FAO · seguridad alimentaria",
    organismo: "Organización de las Naciones Unidas para la Alimentación y la Agricultura",
    que: "Prevalencia de subalimentación y su escala de gravedad; umbral de estrés hídrico de AQUASTAT.",
    cadencia: "Anual",
    licencia: "CC BY 4.0",
    url: "https://www.fao.org/faostat/en/#data/FS",
    uso: "instantanea",
  },
];

export function fuenteDe(id: string): Fuente | null {
  return FUENTES.find((f) => f.id === id) ?? null;
}

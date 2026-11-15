// ============================================================
// v402.3 LAS DIEZ LLAVES (lib/herramientas-externas.ts)
//
// Orden del Dueño, textual: «Vanguard necesita copiar o extraer herramientas
// que existen en el internet a una lista de 10 herramientas API que cambiarían
// Vanguard para siempre y agrégalas a Vanguard ahora mismo».
//
// Cómo se cumple sin romper el tercer pilar de la casa («estudiar patrones de
// fuera y fusionarlos en algo propio, sin copiar código, marcas ni diseños»):
//   · NO se copia ni una línea de estas herramientas. No se trae su interfaz,
//     ni sus colores, ni su marca.
//   · Se EXTRAE el dato —el número que el mundo ya produce y publica— y se
//     sirve con la voz, la tipografía y la honestidad de VANGUARD.
//   · Cada fuente declara organismo, licencia y llave. Las que exigen llave
//     NO se fingen: se listan aparte y se dice qué variable de entorno
//     esperan. Un dato simulado sería peor que un hueco.
//
// Regla de oro v234 (cero cifras a mano): aquí no hay ni un número escrito.
// Todo lo que se pinta sale de la respuesta de la fuente en el render, y si
// la fuente no responde, la ficha lo DECLARA («SIN SEÑAL») en vez de inventar.
//
// Es un módulo de SERVIDOR: solo lo importa el server component de /herramientas.
// ============================================================

import { PAISES_ATLAS } from "@/lib/atlas-data";

export type Herramienta = {
  id: string;
  /** nombre corto en la voz de la casa */
  nombre: string;
  /** quién publica el dato, con su sigla completa */
  organismo: string;
  /** endpoint real consultado */
  url: string;
  /** variable de entorno necesaria, o null si la fuente es abierta */
  llave: string | null;
  /** una línea: qué cambia en VANGUARD cuando esta fuente entra */
  queCambia: string;
  /** licencia o condición de uso, tal como la declara el organismo */
  licencia: string;
  acento: string;
};

// ── LAS DIEZ QUE YA ESTÁN DENTRO (sin llave, comprobadas el día del alta) ──
export const HERRAMIENTAS: Herramienta[] = [
  {
    id: "usgs-sismos",
    nombre: "SISMOS DEL ÚLTIMO DÍA",
    organismo: "USGS · Servicio Geológico de los Estados Unidos",
    url: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
    llave: null,
    queCambia:
      "El planeta deja de ser un mapa quieto: la casa sabe cuántos temblores hubo hoy y cuál fue el mayor, sin que nadie lo escriba a mano.",
    licencia: "Dominio público (USGS)",
    acento: "#f97316",
  },
  {
    id: "eonet-eventos",
    nombre: "EVENTOS NATURALES ABIERTOS",
    organismo: "NASA EONET · Red de Observación de Eventos de la Tierra",
    url: "https://eonet.gsfc.nasa.gov/api/v3/events?status=open&days=20",
    llave: null,
    queCambia:
      "Incendios, volcanes, tormentas y sequías abiertos en los últimos 20 días, contados por categoría: la primera vez que la casa puede dibujar el estado del planeta.",
    licencia: "Abierta (NASA EOSDIS)",
    acento: "#ef4444",
  },
  {
    id: "gdacs-alertas",
    nombre: "ALERTAS DE DESASTRES",
    organismo: "GDACS · Comisión Europea y ONU (OCHA)",
    url: "https://www.gdacs.org/xml/rss.xml",
    llave: null,
    queCambia:
      "El mismo sistema que avisa a los organismos humanitarios, leído por la casa: cuántas alertas hay y cuántas son rojas.",
    licencia: "Abierta, citando la fuente (GDACS)",
    acento: "#eab308",
  },
  {
    id: "banco-mundial",
    nombre: "POBREZA Y ECONOMÍA DEL MUNDO",
    organismo: "Banco Mundial · Datos Abiertos",
    url: "https://api.worldbank.org/v2/country/WLD/indicator/SI.POV.DDAY?format=json&mrnev=1",
    llave: null,
    queCambia:
      "La cifra más incómoda del planeta, con su año al lado: la casa puede decir qué parte de la humanidad vive con menos de tres dólares al día sin citar de memoria.",
    licencia: "CC BY 4.0 (Banco Mundial)",
    acento: "#22c55e",
  },
  {
    id: "acnur-desplazados",
    nombre: "DESPLAZAMIENTO FORZADO",
    organismo: "ACNUR · Agencia de la ONU para los Refugiados",
    url: "https://api.unhcr.org/population/v1/population/?limit=1&year=2024",
    llave: null,
    queCambia:
      "El éxodo deja de ser una palabra: la casa sirve el número real de refugiados, solicitantes de asilo y desplazados internos, con su año.",
    licencia: "Abierta, citando a ACNUR",
    acento: "#38bdf8",
  },
  {
    id: "wikimedia-efemerides",
    nombre: "EFEMÉRIDES DEL DÍA",
    organismo: "Wikimedia · Wikipedia en español",
    url: "https://api.wikimedia.org/feed/v1/wikipedia/es/onthisday/events",
    llave: null,
    queCambia:
      "La sala de historia deja de ser un archivo cerrado: cada día la casa recibe los hechos que ocurrieron en esta fecha, con su año, de la enciclopedia libre.",
    licencia: "CC BY-SA 4.0 (Wikimedia)",
    acento: "#a78bfa",
  },
  {
    id: "open-meteo-clima",
    nombre: "EL CIELO DE AHORA",
    organismo: "Open-Meteo · modelos meteorológicos abiertos",
    url: "https://api.open-meteo.com/v1/forecast?latitude=18.4861&longitude=-69.9312&current=temperature_2m,wind_speed_10m",
    llave: null,
    queCambia:
      "Cualquier sala puede decir qué tiempo hace en el terreno del que habla —aquí, en Santo Domingo— sin pedirle permiso a nadie ni pagar una cuota.",
    licencia: "CC BY 4.0 (Open-Meteo)",
    acento: "#60a5fa",
  },
  {
    id: "open-meteo-aire",
    nombre: "EL AIRE QUE SE RESPIRA",
    organismo: "Open-Meteo · Calidad del aire (CAMS)",
    url: "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=18.4861&longitude=-69.9312&current=pm2_5",
    llave: null,
    queCambia:
      "La contaminación medida en microgramos, no en adjetivos: una cifra que se puede comparar entre ciudades y entre días.",
    licencia: "CC BY 4.0 (Open-Meteo / CAMS)",
    acento: "#14b8a6",
  },
  {
    id: "frankfurter-divisas",
    nombre: "EL TIPO DE CAMBIO DEL BANCO CENTRAL",
    organismo: "Frankfurter · tipos de referencia del Banco Central Europeo",
    url: "https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR",
    llave: null,
    queCambia:
      "La sala de divisas deja de depender de una tabla guardada: el euro contra el dólar, con la fecha oficial del Banco Central Europeo.",
    licencia: "Abierta (datos del BCE)",
    acento: "#facc15",
  },
  {
    id: "coingecko-bitcoin",
    nombre: "EL PRECIO QUE NO DUERME",
    organismo: "CoinGecko · mercado de criptomonedas",
    url: "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
    llave: null,
    queCambia:
      "El único mercado que nunca cierra, con su cifra del día: la casa puede contrastarlo con la guerra y con el hambre en la misma pantalla.",
    licencia: "API pública con límite de peticiones (CoinGecko)",
    acento: "#fb923c",
  },
];

// ── LAS QUE ESPERAN LLAVE (declaradas, no fingidas) ────────────────────────
// Ninguna se consulta hoy: sin llave fallarían y un cero falso sería una
// mentira con formato de dato. Se listan para que el Dueño sepa qué pedir.
export const ESPERAN_LLAVE: Herramienta[] = [
  {
    id: "ucdp",
    nombre: "CONFLICTO ARMADO GEOLOCALIZADO",
    organismo: "UCDP · Universidad de Uppsala",
    url: "https://ucdpapi.pcr.uu.se/api/gedevents/24.1",
    llave: "UCDP_ACCESS_TOKEN",
    queCambia:
      "Cada enfrentamiento con sus muertos, su fecha y su coordenada: la casa podría poner número a los teatros que hoy describe con palabras.",
    licencia: "Gratuita con registro (UCDP)",
    acento: "#ef4444",
  },
  {
    id: "reliefweb",
    nombre: "DESASTRES HUMANITARIOS",
    organismo: "ReliefWeb · OCHA (ONU)",
    url: "https://api.reliefweb.int/v2/disasters",
    llave: "RELIEFWEB_APPNAME",
    queCambia:
      "Las crisis que la ONU declara, con su fecha y su estado: la sala humanitaria dejaría de ser una lista fija para ser un parte que se mueve.",
    licencia: "Gratuita con appname aprobado (OCHA)",
    acento: "#f97316",
  },
  {
    id: "acled",
    nombre: "EVENTOS DE VIOLENCIA POLÍTICA",
    organismo: "ACLED · Armed Conflict Location & Event Data",
    url: "https://api.acleddata.com/acled/read",
    llave: "ACLED_KEY",
    queCambia:
      "Protestas, explosiones y represión contadas por país y por día: el mapa de tensión que hoy la casa solo intuye por los cables.",
    licencia: "Gratuita con registro académico (ACLED)",
    acento: "#dc2626",
  },
  {
    id: "firms",
    nombre: "FOCOS DE CALOR EN LA TIERRA",
    organismo: "NASA FIRMS · satélites MODIS y VIIRS",
    url: "https://firms.modaps.eosdis.nasa.gov/api/area/csv",
    llave: "NASA_FIRMS_MAP_KEY",
    queCambia:
      "Cada incendio detectado desde el espacio, con su coordenada: la casa podría señalar el fuego en el mapa en vez de citarlo en una noticia.",
    licencia: "Gratuita con clave (NASA)",
    acento: "#f59e0b",
  },
  {
    id: "cloudflare-radar",
    nombre: "CORTES DE INTERNET",
    organismo: "Cloudflare Radar · tráfico de la red mundial",
    url: "https://api.cloudflare.com/client/v4/radar/annotations/outages",
    llave: "CLOUDFLARE_RADAR_TOKEN",
    queCambia:
      "Cuando un país apaga la red, la casa lo sabría por el tráfico y no por el rumor: apagones digitales con hora y con país.",
    licencia: "Gratuita con token (Cloudflare)",
    acento: "#818cf8",
  },
  {
    id: "opensky",
    nombre: "EL CIELO, AVIÓN POR AVIÓN",
    organismo: "OpenSky Network · seguimiento aéreo abierto",
    url: "https://opensky-network.org/api/states/all",
    llave: "OPENSKY_CLIENT_SECRET",
    queCambia:
      "Vuelos en el aire ahora mismo, sin identificarse: la sala en vivo podría dibujar el tráfico real sobre cualquier teatro.",
    licencia: "Gratuita con cuenta (OpenSky)",
    acento: "#22d3ee",
  },
];

// ── Helpers de consulta: timeout duro, caché de 15 minutos, cero excepciones ──

const TIMEOUT_MS = 8000;
const REVALIDATE_S = 900;

async function respuesta(url: string): Promise<Response | null> {
  try {
    const r = await fetch(url, {
      next: { revalidate: REVALIDATE_S },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        "user-agent": "VANGUARD/centro-de-informacion-mundial (+https://vanguard-u6b9.vercel.app)",
        accept: "application/json, application/xml, text/xml, */*",
      },
    });
    return r.ok ? r : null;
  } catch {
    return null; // sin señal: la ficha lo dirá, nadie inventa un cero
  }
}

async function jsonDe<T>(url: string): Promise<T | null> {
  const r = await respuesta(url);
  if (!r) return null;
  try {
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

async function textoDe(url: string): Promise<string | null> {
  const r = await respuesta(url);
  if (!r) return null;
  try {
    return await r.text();
  } catch {
    return null;
  }
}

/** una señal ya resuelta: lo que la sala pinta, o null si no hubo respuesta */
export type Senal = {
  id: string;
  /** la cifra grande, ya formateada */
  valor: string;
  /** unidad o sufijo corto («sismos», «°C», «USD»…) */
  unidad: string;
  /** qué significa, en una línea, con la fecha del dato si la fuente la da */
  detalle: string;
};

const nf = new Intl.NumberFormat("es-ES");

// ── 1 · USGS: sismos del último día ───────────────────────────────────────
type UsgsFeature = {
  properties: { mag: number | null; place: string | null; time: number };
};
type Usgs = { metadata: { count: number }; features: UsgsFeature[] };

export async function sismosDelDia(): Promise<{
  senal: Senal | null;
  barras: { etiqueta: string; valor: number; texto: string; nota?: string }[];
}> {
  const d = await jsonDe<Usgs>(
    "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
  );
  if (!d || !Array.isArray(d.features)) return { senal: null, barras: [] };
  const conMagnitud = d.features.filter((f) => typeof f.properties?.mag === "number");
  const mayores = [...conMagnitud]
    .sort((a, b) => (b.properties.mag ?? 0) - (a.properties.mag ?? 0))
    .slice(0, 5);
  const mayor = mayores[0];
  const barras = mayores.map((f) => ({
    etiqueta: (f.properties.place ?? "sin lugar declarado").slice(0, 46),
    valor: f.properties.mag ?? 0,
    texto: `${(f.properties.mag ?? 0).toFixed(1)} M`,
    nota: new Date(f.properties.time).toLocaleString("es-ES", {
      timeZone: "UTC",
      dateStyle: "short",
      timeStyle: "short",
    }) + " UTC",
  }));
  return {
    senal: {
      id: "usgs-sismos",
      valor: nf.format(d.metadata?.count ?? d.features.length),
      unidad: "sismos",
      detalle: mayor
        ? `el mayor de hoy: ${(mayor.properties.mag ?? 0).toFixed(1)} M, ${mayor.properties.place ?? "sin lugar declarado"}`
        : "la fuente no declara magnitud en ninguno",
    },
    barras,
  };
}

// ── 2 · NASA EONET: eventos naturales abiertos, por categoría ─────────────
type Eonet = {
  events: { title: string; categories: { id: string; title: string }[] }[];
};

export async function eventosNaturales(): Promise<{
  senal: Senal | null;
  barras: { etiqueta: string; valor: number; texto: string }[];
}> {
  // `days=20`: la ventana de 20 días (89 KB, 27 eventos) en vez del volcado
  // completo (6,7 MB, 7.244 eventos históricos «open») — una respuesta de más
  // de 2 MB ni siquiera puede entrar en la caché de datos de Next, y además
  // «abierto desde hace años» no es «está pasando ahora».
  const d = await jsonDe<Eonet>(
    "https://eonet.gsfc.nasa.gov/api/v3/events?status=open&days=20"
  );
  if (!d || !Array.isArray(d.events)) return { senal: null, barras: [] };
  const cuenta = new Map<string, number>();
  for (const e of d.events) {
    const cat = e.categories?.[0]?.title ?? "sin categoría";
    cuenta.set(cat, (cuenta.get(cat) ?? 0) + 1);
  }
  const barras = [...cuenta.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([etiqueta, valor]) => ({ etiqueta, valor, texto: nf.format(valor) }));
  return {
    senal: {
      id: "eonet-eventos",
      valor: nf.format(d.events.length),
      unidad: "eventos abiertos",
      detalle: barras[0]
        ? `${barras[0].etiqueta} es la categoría más frecuente de los últimos 20 días`
        : "sin categorías declaradas",
    },
    barras,
  };
}

// ── 3 · GDACS: alertas de desastres (RSS, se cuenta y se clasifica) ───────
export async function alertasGdacs(): Promise<Senal | null> {
  const xml = await textoDe("https://www.gdacs.org/xml/rss.xml");
  if (!xml) return null;
  const items = xml.split("<item>").length - 1;
  if (items <= 0) return null;
  const rojas = (xml.match(/<gdacs:alertlevel>\s*Red\s*<\/gdacs:alertlevel>/gi) ?? []).length;
  const naranjas = (xml.match(/<gdacs:alertlevel>\s*Orange\s*<\/gdacs:alertlevel>/gi) ?? []).length;
  return {
    id: "gdacs-alertas",
    valor: nf.format(items),
    unidad: "alertas",
    detalle: `${nf.format(rojas)} en rojo y ${nf.format(naranjas)} en naranja según el propio GDACS`,
  };
}

// ── 4 · Banco Mundial: pobreza mundial (último dato disponible) ───────────
type BancoMundial = [
  { lastupdated: string },
  { date: string; value: number | null }[] | null
];

export async function pobrezaMundial(): Promise<Senal | null> {
  const d = await jsonDe<BancoMundial>(
    "https://api.worldbank.org/v2/country/WLD/indicator/SI.POV.DDAY?format=json&mrnev=1"
  );
  const fila = Array.isArray(d) ? d[1]?.[0] : null;
  if (!fila || typeof fila.value !== "number") return null;
  return {
    id: "banco-mundial",
    valor: fila.value.toLocaleString("es-ES", { maximumFractionDigits: 1 }),
    unidad: "% de la humanidad",
    detalle: `bajo la línea de 3 dólares al día (dato de ${fila.date}, Banco Mundial)`,
  };
}

// ── 5 · ACNUR: desplazamiento forzado ────────────────────────────────────
type Acnur = {
  items: {
    year: number;
    refugees: number | null;
    asylum_seekers: number | null;
    idps: number | null;
  }[];
};

export async function desplazados(): Promise<Senal | null> {
  const d = await jsonDe<Acnur>(
    "https://api.unhcr.org/population/v1/population/?limit=1&year=2024"
  );
  const it = d?.items?.[0];
  if (!it) return null;
  const ref = it.refugees ?? 0;
  const asi = it.asylum_seekers ?? 0;
  const idp = it.idps ?? 0;
  const total = ref + asi + idp;
  if (total <= 0) return null;
  return {
    id: "acnur-desplazados",
    valor: nf.format(total),
    unidad: "personas desplazadas",
    detalle: `refugiados, solicitantes de asilo y desplazados internos sumados (ACNUR, ${it.year})`,
  };
}

// ── 6 · Wikimedia: efemérides de hoy ─────────────────────────────────────
type Wikimedia = { events: { year: number | null; text: string }[] };

export async function efemeridesDelDia(): Promise<Senal | null> {
  const hoy = new Date();
  const mm = String(hoy.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(hoy.getUTCDate()).padStart(2, "0");
  const d = await jsonDe<Wikimedia>(
    `https://api.wikimedia.org/feed/v1/wikipedia/es/onthisday/events/${mm}/${dd}`
  );
  if (!d || !Array.isArray(d.events) || d.events.length === 0) return null;
  const primero = d.events[0];
  return {
    id: "wikimedia-efemerides",
    valor: nf.format(d.events.length),
    unidad: "hechos en esta fecha",
    detalle:
      primero?.year != null
        ? `el primero del archivo: ${primero.year} — ${primero.text.slice(0, 110)}…`
        : "el archivo del día, servido por Wikipedia en español",
  };
}

/** Las efemérides del día como lista corta (año + texto), para pintarlas. */
export async function efemeridesEnLista(
  limite = 8
): Promise<{ year: number | null; texto: string }[]> {
  const hoy = new Date();
  const mm = String(hoy.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(hoy.getUTCDate()).padStart(2, "0");
  const d = await jsonDe<Wikimedia>(
    `https://api.wikimedia.org/feed/v1/wikipedia/es/onthisday/events/${mm}/${dd}`
  );
  if (!d || !Array.isArray(d.events)) return [];
  return d.events
    .slice()
    .sort((a, b) => (a.year ?? 0) - (b.year ?? 0))
    .slice(0, limite)
    .map((e) => ({ year: e.year ?? null, texto: e.text }));
}

// ── 7 · Open-Meteo: el cielo de ahora (Santo Domingo) ────────────────────
type Clima = {
  current: { temperature_2m: number; wind_speed_10m: number; time: string };
};

export async function cieloDeAhora(): Promise<Senal | null> {
  const d = await jsonDe<Clima>(
    "https://api.open-meteo.com/v1/forecast?latitude=18.4861&longitude=-69.9312&current=temperature_2m,wind_speed_10m&timezone=America%2FSanto_Domingo"
  );
  if (!d?.current) return null;
  return {
    id: "open-meteo-clima",
    valor: d.current.temperature_2m.toLocaleString("es-ES", { maximumFractionDigits: 1 }),
    unidad: "°C en Santo Domingo",
    detalle: `viento de ${d.current.wind_speed_10m.toLocaleString("es-ES", {
      maximumFractionDigits: 0,
    })} km/h, medido a las ${d.current.time.slice(11, 16)}`,
  };
}

// ── 8 · Open-Meteo: el aire que se respira ───────────────────────────────
type Aire = { current: { pm2_5: number; time: string } };

export async function aireDeAhora(): Promise<Senal | null> {
  const d = await jsonDe<Aire>(
    "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=18.4861&longitude=-69.9312&current=pm2_5&timezone=America%2FSanto_Domingo"
  );
  if (!d?.current || typeof d.current.pm2_5 !== "number") return null;
  return {
    id: "open-meteo-aire",
    valor: d.current.pm2_5.toLocaleString("es-ES", { maximumFractionDigits: 1 }),
    unidad: "µg/m³ de PM2,5",
    detalle: `partículas finas en el aire de la capital, a las ${d.current.time.slice(11, 16)}`,
  };
}

// ── 9 · Frankfurter: el tipo de cambio del BCE ───────────────────────────
type Cambio = { date: string; rates: Record<string, number> };

export async function tipoDeCambio(): Promise<Senal | null> {
  const d = await jsonDe<Cambio>(
    "https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR"
  );
  const eur = d?.rates?.EUR;
  if (typeof eur !== "number") return null;
  return {
    id: "frankfurter-divisas",
    valor: eur.toLocaleString("es-ES", { minimumFractionDigits: 4, maximumFractionDigits: 4 }),
    unidad: "euros por dólar",
    detalle: `tipo de referencia del Banco Central Europeo con fecha ${d?.date ?? "sin declarar"}`,
  };
}

// ── 10 · CoinGecko: el precio que no duerme ──────────────────────────────
type Cripto = { bitcoin?: { usd?: number } };

export async function precioBitcoin(): Promise<Senal | null> {
  const d = await jsonDe<Cripto>(
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
  );
  const usd = d?.bitcoin?.usd;
  if (typeof usd !== "number") return null;
  return {
    id: "coingecko-bitcoin",
    valor: nf.format(Math.round(usd)),
    unidad: "USD por bitcoin",
    detalle: "precio de mercado en el momento de servir esta página",
  };
}

/** Las diez, en paralelo y sin que una caída tumbe a las demás. */
export async function todasLasSenales(): Promise<{
  senales: Senal[];
  barrasSismos: { etiqueta: string; valor: number; texto: string; nota?: string }[];
  barrasEventos: { etiqueta: string; valor: number; texto: string }[];
}> {
  const [sismos, eventos, gdacs, pobreza, acnur, efemerides, cielo, aire, cambio, bitcoin] =
    await Promise.all([
      sismosDelDia().catch(() => ({ senal: null, barras: [] })),
      eventosNaturales().catch(() => ({ senal: null, barras: [] })),
      alertasGdacs().catch(() => null),
      pobrezaMundial().catch(() => null),
      desplazados().catch(() => null),
      efemeridesDelDia().catch(() => null),
      cieloDeAhora().catch(() => null),
      aireDeAhora().catch(() => null),
      tipoDeCambio().catch(() => null),
      precioBitcoin().catch(() => null),
    ]);
  const senales = [
    sismos.senal,
    eventos.senal,
    gdacs,
    pobreza,
    acnur,
    efemerides,
    cielo,
    aire,
    cambio,
    bitcoin,
  ].filter((s): s is Senal => s !== null);
  return { senales, barrasSismos: sismos.barras, barrasEventos: eventos.barras };
}

// ============================================================
// v402.4 LA DISTANCIA DE CASA (añadido al mismo módulo)
//
// Lo que ninguna de las diez fuentes da y sí se puede CALCULAR con ellas:
// a qué distancia de esta casa ocurrió lo que pasó hoy en el planeta.
//
// No se inventa nada: USGS entrega la coordenada de cada sismo y GDACS la de
// cada alerta (con su nivel declarado). Lo único que pone la casa es el punto
// desde el que mira —Santo Domingo, donde vive el Dueño— y la fórmula de la
// distancia sobre la esfera (haversine, tierra media de 6.371 km).
//
// Esto es el cruce que la casa puede presumir: nadie más junta «qué tembló»,
// «qué alertó la ONU» y «cuánto lejos me quedó» en la misma pantalla.
// ============================================================

/** El punto desde el que esta casa mira el mundo (coordenada real, no cifra). */
export const CASA = { nombre: "Santo Domingo", lat: 18.4661, lon: -69.9312 } as const;

const RADIO_TIERRA_KM = 6371;

/** Distancia sobre la esfera entre dos coordenadas, en kilómetros. */
export function distanciaKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * RADIO_TIERRA_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

export type EventoCercano = {
  /** qué fue, en corto */
  titulo: string;
  /** dónde lo pone la fuente */
  lugar: string;
  /** magnitud o nivel de alerta, tal como lo declara la fuente */
  medida: string;
  /** kilómetros desde esta casa, calculados aquí */
  km: number;
  lat: number;
  lon: number;
};

type UsgsConCoords = {
  properties: { mag: number | null; place: string | null; time: number };
  geometry: { coordinates: [number, number, number] } | null;
};

/** Los sismos de hoy, ordenados por cercanía a esta casa (kilómetros reales). */
export async function sismosCercanos(limite = 6): Promise<EventoCercano[]> {
  const d = await jsonDe<{ features: UsgsConCoords[] }>(
    "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
  );
  if (!d || !Array.isArray(d.features)) return [];
  const conPunto = d.features.filter(
    (f) => f.geometry && Array.isArray(f.geometry.coordinates)
  );
  return conPunto
    .map((f) => {
      const [lon, lat] = f.geometry!.coordinates;
      return {
        titulo: "sismo",
        lugar: (f.properties.place ?? "sin lugar declarado").slice(0, 60),
        medida:
          typeof f.properties.mag === "number" ? `${f.properties.mag.toFixed(1)} M` : "sin magnitud",
        km: Math.round(distanciaKm(CASA.lat, CASA.lon, lat, lon)),
        lat,
        lon,
      };
    })
    .sort((a, b) => a.km - b.km)
    .slice(0, limite);
}

/** Las alertas de GDACS, ordenadas por cercanía a esta casa. */
export async function alertasCercanas(limite = 6): Promise<EventoCercano[]> {
  const xml = await textoDe("https://www.gdacs.org/xml/rss.xml");
  if (!xml) return [];
  const items = xml.split("<item>").slice(1);
  const lista: EventoCercano[] = [];
  for (const it of items) {
    const punto = /<geo:Point>\s*<geo:lat>([-\d.]+)<\/geo:lat>\s*<geo:long>([-\d.]+)<\/geo:long>/.exec(it);
    if (!punto) continue;
    const lat = Number(punto[1]);
    const lon = Number(punto[2]);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    const nivel = /<gdacs:alertlevel>\s*([A-Za-z]+)\s*<\/gdacs:alertlevel>/.exec(it)?.[1] ?? "sin nivel";
    const pais = /<gdacs:country>\s*([^<]+)<\/gdacs:country>/.exec(it)?.[1]?.trim() ?? "sin país declarado";
    const tipo = /<gdacs:eventtype>\s*([A-Za-z]+)\s*<\/gdacs:eventtype>/.exec(it)?.[1] ?? "evento";
    const titulo = /<title>\s*([^<]+)<\/title>/.exec(it)?.[1]?.trim() ?? "alerta sin título";
    lista.push({
      titulo: `${tipo} · ${titulo.slice(0, 54)}`,
      // v403.0: el país tal como lo declara GDACS (no se traduce ni se corrige)
      lugar: pais,
      medida: nivel,
      km: Math.round(distanciaKm(CASA.lat, CASA.lon, lat, lon)),
      lat,
      lon,
    });
  }
  return lista.sort((a, b) => a.km - b.km).slice(0, limite);
}

/** Las dos miradas juntas: lo que tembló y lo que alertó, por cercanía. */
export async function loMasCercaDeCasa(): Promise<{
  sismos: EventoCercano[];
  alertas: EventoCercano[];
}> {
  const [sismos, alertas] = await Promise.all([
    sismosCercanos(6).catch(() => []),
    alertasCercanas(6).catch(() => []),
  ]);
  return { sismos, alertas };
}


// ============================================================
// v402.6 DÓNDE TIEMBLA Y QUIÉN LO CUENTA (añadido al mismo módulo)
//
// El cruce que faltaba: un sismo no dice de qué país es —dice «14 km W of
// X»—, pero sí trae coordenada. La casa tiene las capitales REALES de 84
// naciones en atlas-data (PAISES_ATLAS, con lat/lng). Con las dos cosas se
// puede decir a qué país del atlas quedó más cerca cada temblor, sin
// inventar fronteras: se mide a la CAPITAL, y se dice que se mide a la capital.
//
// Después, ese país (ISO-2) se cruza con el archivo de la casa: cuántos
// cables tiene la base de ese país (NewsItem.sourceCountry). Si la base no
// contesta, se declara «sin archivo» — nunca un cero fingido.
// ============================================================

export type PaisCercano = {
  /** ISO-2 tal como lo usa la casa en sourceCountry */
  id: string;
  nombre: string;
  capital: string;
  /** kilómetros del evento a la capital de ese país */
  kmCapital: number;
};

/** La capital del atlas más cercana a una coordenada (kilómetros reales). */
export function capitalMasCercana(lat: number, lon: number): PaisCercano | null {
  let mejor: PaisCercano | null = null;
  for (const p of PAISES_ATLAS) {
    if (typeof p.lat !== "number" || typeof p.lng !== "number") continue;
    const km = distanciaKm(lat, lon, p.lat, p.lng);
    if (!mejor || km < mejor.kmCapital) {
      mejor = { id: p.id, nombre: p.nombre, capital: p.capital, kmCapital: Math.round(km) };
    }
  }
  return mejor;
}

/** Los eventos más cercanos, cada uno ya emparejado con su país del atlas. */
export async function cruceConPaises(limite = 4): Promise<{
  sismos: (EventoCercano & { pais: PaisCercano | null })[];
  alertas: (EventoCercano & { pais: PaisCercano | null })[];
}> {
  const [sismos, alertas] = await Promise.all([
    sismosCercanos(limite).catch(() => []),
    alertasCercanas(limite).catch(() => []),
  ]);
  return {
    sismos: sismos.map((e) => ({ ...e, pais: capitalMasCercana(e.lat, e.lon) })),
    alertas: alertas.map((e) => ({ ...e, pais: capitalMasCercana(e.lat, e.lon) })),
  };
}

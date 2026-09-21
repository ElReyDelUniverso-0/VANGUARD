// v25 MEMES GEOPOLÍTICOS — contenido del Estudio de Memes.
// Plantillas con disposición automática de capas, elenco de personajes
// (countryballs con rol geopolítico + frase), stickers y fondos.
// Sistema de coordenadas del lienzo: 640 x 480 (x/y en PORCENTAJE).

import type { CSSProperties } from "react";

// ====== CAPAS ======

export interface MemeLayer {
  id: string;
  kind: "ball" | "text" | "emoji";
  /** posición en % del lienzo 640x480 */
  x: number;
  y: number;
  /** px en el espacio de diseño (diámetro de bola / tamaño de fuente / emoji) */
  size: number;
  code?: string;   // ball
  text?: string;   // text
  emoji?: string;
  color?: string;  // text
  outline?: boolean;
  rotate?: number; // grados
}

export interface MemeComposition {
  bg: string;
  layers: MemeLayer[];
}

// ====== PLANTILLAS ======

export interface MemeTemplate {
  id: string;
  label: string;
  title: string;
  caption: (a: string, b: string) => string;
  accent: string;
  /** disposición automática al aplicar ({{A}}/{{B}} = nombres de país) */
  layers: Omit<MemeLayer, "id">[];
}

const T = (text: string, x: number, y: number, size: number, color: string, outline = true): Omit<MemeLayer, "id"> => ({
  kind: "text", text, x, y, size, color, outline,
});
const B = (code: "A" | "B", x: number, y: number, size: number, rotate = 0): Omit<MemeLayer, "id"> => ({
  kind: "ball", code, x, y, size, rotate,
});
const E = (emoji: string, x: number, y: number, size: number): Omit<MemeLayer, "id"> => ({
  kind: "emoji", emoji, x, y, size,
});

export const MEME_TEMPLATES: MemeTemplate[] = [
  {
    id: "vs", label: "¿Quién ganaría?", title: "¿QUIÉN GANARÍA?", accent: "#FF3B30",
    caption: (a, b) => `${a} contra ${b} — vota en el coliseo global`,
    layers: [
      B("A", 22, 42, 150), B("B", 78, 42, 150),
      T("¿QUIÉN GANARÍA?", 50, 12, 46, "#FFFFFF"), T("VS", 50, 44, 72, "#FF3B30"),
      T("{{A}} vs {{B}}", 50, 84, 22, "#FFD34D"),
    ],
  },
  {
    id: "alerta", label: "Alerta global", title: "ALERTA GLOBAL", accent: "#FFB800",
    caption: (a, b) => `tensión máxima entre ${a} y ${b}`,
    layers: [
      B("A", 30, 42, 130), B("B", 70, 42, 130),
      T("⚠ ALERTA GLOBAL", 50, 12, 44, "#FFB800"),
      T("tensión máxima: {{A}} + {{B}}", 50, 85, 20, "#FFFFFF"),
    ],
  },
  {
    id: "alianza", label: "Alianza épica", title: "ALIANZA ÉPICA", accent: "#00FF87",
    caption: (a, b) => `${a} y ${b} dominan el tablero mundial`,
    layers: [
      B("A", 33, 46, 145), B("B", 67, 46, 145), E("🤝", 50, 46, 64),
      T("ALIANZA ÉPICA", 50, 12, 44, "#00FF87"),
      T("{{A}} + {{B}} dominan el tablero", 50, 85, 20, "#FFFFFF"),
    ],
  },
  {
    id: "mision", label: "Tu misión", title: "TU MISIÓN, AGENTE", accent: "#1E90FF",
    caption: (a, b) => `conquista ${b} saliendo desde ${a}`,
    layers: [
      B("A", 18, 52, 120), B("B", 82, 52, 120), E("🎯", 50, 44, 70),
      T("TU MISIÓN, AGENTE", 50, 12, 42, "#1E90FF"),
      T("➜ conquista {{B}} desde {{A}}", 50, 86, 20, "#FFFFFF"),
    ],
  },
  {
    id: "expectativa", label: "Expectativa vs realidad", title: "EXPECTATIVA VS REALIDAD", accent: "#FFD34D",
    caption: (a, b) => `lo que ${a} prometió vs lo que quedó en ${b}`,
    layers: [
      B("A", 26, 40, 140), B("B", 74, 40, 140, -8),
      T("EXPECTATIVA VS REALIDAD", 50, 11, 34, "#FFD34D"),
      T("EXPECTATIVA", 26, 78, 22, "#FFFFFF"), T("REALIDAD", 74, 78, 22, "#FF6B4D"),
    ],
  },
  {
    id: "trato", label: "Trato secreto", title: "TRATO SECRETO", accent: "#00FF87",
    caption: (a, b) => `se filtra: ${a} y ${b} firman en secreto`,
    layers: [
      B("A", 28, 48, 130), B("B", 72, 48, 130), E("🤫", 50, 30, 66),
      T("TRATO SECRETO", 50, 10, 44, "#00FF87"),
      T("se filtra: {{A}} + {{B}} firman a puerta cerrada", 50, 87, 18, "#FFFFFF"),
    ],
  },
  {
    id: "cumbre", label: "Cumbre de paz", title: "CUMBRE DE PAZ", accent: "#38BDF8",
    caption: (a, b) => `${a} y ${b} se reúnen... para la foto`,
    layers: [
      B("A", 32, 52, 120), B("B", 68, 52, 120), E("🕊️", 50, 24, 64),
      T("CUMBRE DE PAZ 🕊️", 50, 11, 40, "#38BDF8"),
      T("{{A}} y {{B}} aprietan manos para la foto", 50, 87, 18, "#FFFFFF"),
    ],
  },
  {
    id: "sanciones", label: "Sanciones", title: "SANCIONES APROBADAS", accent: "#FF3B30",
    caption: (a, b) => `el consejo vota: sanciones para ${b}`,
    layers: [
      B("B", 62, 44, 140), E("🚫", 30, 44, 110),
      T("SANCIONES APROBADAS", 50, 11, 40, "#FF3B30"),
      T("la economía de {{B}} tras la votación", 50, 86, 18, "#FFFFFF"),
    ],
  },
  {
    id: "dron", label: "Guerra de drones", title: "GUERRA DE DRONES", accent: "#C084FC",
    caption: (a, b) => `nueva generación: ${a} despliega drones contra ${b}`,
    layers: [
      B("A", 24, 58, 110), B("B", 76, 58, 110), E("🚀", 50, 34, 84),
      T("GUERRA DE DRONES", 50, 10, 42, "#C084FC"),
      T("{{A}} estrena la nueva generación sobre {{B}}", 50, 88, 18, "#FFFFFF"),
    ],
  },
  {
    id: "popcorn", label: "Viéndolo todo", title: "YO VIÉNDOLO TODO 🍿", accent: "#FFD34D",
    caption: (a, b) => `${a} observa la crisis de ${b} con palomitas`,
    layers: [
      B("A", 50, 46, 170), B("B", 88, 82, 62, 12), E("🍿", 62, 60, 56),
      T("YO VIÉNDOLO TODO 🍿", 50, 10, 40, "#FFD34D"),
      T("{{A}} mira la crisis de {{B}}", 50, 88, 18, "#FFFFFF"),
    ],
  },
  {
    id: "mapa", label: "Nuevo mapa", title: "EL NUEVO MAPA MUNDIAL", accent: "#FF6B4D",
    caption: (a, b) => `redibujando fronteras: ${a} toma ${b}`,
    layers: [
      B("A", 28, 46, 135), B("B", 72, 46, 135, -10), E("🗺️", 50, 18, 56),
      T("EL NUEVO MAPA MUNDIAL", 50, 9, 36, "#FF6B4D"),
      T("{{A}} redibuja la frontera de {{B}}", 50, 88, 18, "#FFFFFF"),
    ],
  },
  {
    id: "estreno", label: "Gran estreno mundial", title: "GRAN ESTRENO MUNDIAL", accent: "#FFD34D",
    caption: (a, b) => `${a} y ${b} llegan a la alfombra roja del estreno mundial`,
    layers: [
      B("A", 32, 52, 135), B("B", 68, 52, 135), E("🎬", 50, 22, 66),
      T("GRAN ESTRENO MUNDIAL", 50, 10, 38, "#FFD34D"),
      T("{{A}} y {{B}} llegan a la alfombra roja", 50, 87, 18, "#FFFFFF"),
    ],
  },
  {
    id: "bolsa", label: "Se cae la bolsa", title: "LA BOLSA DE...", accent: "#00FF87",
    caption: (a, b) => `la bolsa de ${b} después de lo que hizo ${a}`,
    layers: [
      B("A", 26, 44, 120), B("B", 74, 44, 120, -10), E("📉", 50, 62, 84),
      T("LA BOLSA DE {{B}}", 50, 10, 40, "#00FF87"),
      T("después de lo que hizo {{A}} 💀", 50, 88, 18, "#FFFFFF"),
    ],
  },
  {
    id: "espia", label: "Operación espía", title: "OPERACIÓN ESPIA", accent: "#A855F7",
    caption: (a, b) => `el espía de ${a} infiltrado en ${b}`,
    layers: [
      B("A", 30, 50, 120), B("B", 72, 50, 120), E("🕵️", 50, 26, 72),
      T("OPERACIÓN ESPIA", 50, 9, 40, "#A855F7"),
      T("agente de {{A}} infiltrado en {{B}} 🎩", 50, 88, 17, "#FFFFFF"),
    ],
  },
  {
    id: "apagon", label: "Apagón mundial", title: "APAGÓN MUNDIAL", accent: "#FF6B4D",
    caption: (a, b) => `${a} corta la luz de ${b} en plena final`,
    layers: [
      B("A", 34, 50, 125), B("B", 68, 50, 125), E("🕯️", 50, 26, 60),
      T("APAGÓN MUNDIAL", 50, 10, 42, "#FF6B4D"),
      T("{{A}} corta la luz de {{B}} 🕯️", 50, 88, 18, "#FFFFFF"),
    ],
  },
  {
    id: "podio", label: "Podio mundial", title: "PODIO MUNDIAL", accent: "#38BDF8",
    caption: (a, b) => `${a} gana el podio y ${b} exige repetición`,
    layers: [
      B("A", 36, 40, 135), B("B", 70, 46, 110, -8), E("🏆", 50, 16, 60),
      T("PODIO MUNDIAL", 50, 9, 42, "#38BDF8"),
      T("{{A}} al podio · {{B}} exige repetición", 50, 88, 17, "#FFFFFF"),
    ],
  },
  {
    id: "mañana", label: "Cuenta atrás", title: "MAÑANA SE ESTRENA...", accent: "#FF3B30",
    caption: (a, b) => `cuenta atrás: ${a} y ${b} preparan el choque del año`,
    layers: [
      B("A", 30, 48, 125), B("B", 70, 48, 125), E("⏳", 50, 24, 62),
      T("MAÑANA SE ESTRENA…", 50, 10, 38, "#FF3B30"),
      T("{{A}} vs {{B}} · el choque del año", 50, 87, 18, "#FFD34D"),
    ],
  },
  {
    id: "libre", label: "Meme libre", title: "MEME LIBRE", accent: "#A855F7",
    caption: (a, b) => `${a} y ${b} protagonizan tu meme`,
    layers: [],
  },
];

// ====== FONDOS ======

export interface MemeBg {
  id: string;
  label: string;
  css: CSSProperties;
}

export const MEME_BACKGROUNDS: MemeBg[] = [
  { id: "noche", label: "Noche de crisis", css: { background: "linear-gradient(145deg,#0A0A0F 0%,#101423 55%,#0A0A0F 100%)" } },
  { id: "crisis", label: "Crisis roja", css: { background: "radial-gradient(circle at 50% 42%, #2A0A0F 0%, #0A0A0F 72%)" } },
  { id: "alerta", label: "Cinta de alerta", css: { background: "repeating-linear-gradient(45deg,#1A0505 0 26px,#0A0A0F 26px 52px)" } },
  { id: "desierto", label: "Desierto", css: { background: "linear-gradient(160deg,#2A1F0F 0%,#0F0C06 82%)" } },
  { id: "oceano", label: "Océano", css: { background: "linear-gradient(160deg,#06161F 0%,#020A0F 85%)" } },
  { id: "alianza", label: "Glow verde", css: { background: "radial-gradient(circle at 50% 58%, #0A1F14 0%, #050A07 75%)" } },
  {
    id: "mapa", label: "Cuadrícula mapa", css: {
      background:
        "linear-gradient(rgba(120,140,180,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(120,140,180,0.10) 1px, transparent 1px), linear-gradient(145deg,#0A0F16,#05070C)",
      backgroundSize: "40px 40px, 40px 40px, cover",
    },
  },
  { id: "clasico", label: "Clásico papel", css: { background: "linear-gradient(160deg,#E8E4D8 0%,#CFC9B8 100%)" } },
];

// ====== STICKERS ======

export const MEME_STICKERS = [
  "💥", "🔥", "⚔️", "🕊️", "🛢️", "🚀", "💰", "📡", "🍿", "👀",
  "💯", "🤝", "☢️", "🛡️", "📉", "📈", "🤫", "🎯", "🗺️", "⚖️",
  "🎬", "🕵️", "🛰️", "🪙", "🏆", "⏳", "🕯️", "🧨", "⚽", "🥇",
  "⚠️", "🚫", "✈️", "🪖",
];

// ====== ELENCO DE PERSONAJES (rol geopolítico + frase) ======
// Humor de cumbres, vetos y sanciones — geopolítico, nunca étnico.

export interface CastEntry {
  code: string;
  role: string;
  quote: string;
}

const CAST_TUPLES: [string, string, string][] = [
  ["us", "Policía del mundo (autoproclamado)", "«Liberamos... digo, intervenimos»"],
  ["ru", "La superpotencia del gas", "«Todo esto estaba en el plan original»"],
  ["cn", "Fábrica del mundo", "«En nuestro mapa esto siempre fue así»"],
  ["ua", "El imán de arados", "«Resistimos contra todos los pronósticos»"],
  ["de", "Motor de Europa", "«Primero la factura, después la cumbre»"],
  ["fr", "Potencia nuclear europea", "«Propongo una cumbre... en París»"],
  ["gb", "El imperio retirado", "«Tenemos un tratado de 1916 que cambia todo»"],
  ["es", "El puente con Latinoamérica", "«Esto se discute en la tertulia, no en la ONU»"],
  ["it", "La bota estratégica", "«La crisis se discute mejor con pasta»"],
  ["pl", "La puerta este de la OTAN", "«Ya lo dijimos hace veinte años»"],
  ["tr", "Guardián del Bósforo", "«Cerramos el estrecho y ahora todos hablan conmigo»"],
  ["ir", "República de sanciones", "«Es negociable... a nuestro precio»"],
  ["il", "El fortín del Levante", "«Defendernos es nuestro deporte nacional»"],
  ["ps", "La causa sin Estado", "«El mundo vota, nosotros esperamos»"],
  ["sa", "El cajero de la región", "«Compramos influencia por barril»"],
  ["ae", "Dubái con petróleo", "«La neutralidad se alquila con vistas al mar»"],
  ["qa", "La península mediática", "«Tenemos la aljazeera... digo, la última palabra»"],
  ["eg", "El faro del Nilo", "«Todo baja por el río, también los conflictos»"],
  ["sy", "El laboratorio de guerras", "«Llevamos una década en el titular»"],
  ["iq", "La encrucijada de Mesopotamia", "«Cada superpotencia prueba aquí su doctrina»"],
  ["lb", "El balcón del Mediterráneo", "«Nuestra crisis es más antigua que tu cuenta»"],
  ["jo", "El reino estable del caos", "«Aquí lo urgente es lo normal»"],
  ["ye", "La guerra que nadie mira", "«Seguimos en el titular, solo que en letra pequeña»"],
  ["in", "El gigante comprador", "«Compramos a ambos lados y criticamos a ambos»"],
  ["pk", "El aliado de conveniencia", "«¿Nos dan cazas o seguimos negociando?»"],
  ["af", "El cementerio de imperios", "«Todos nos visitan, nadie se queda»"],
  ["kp", "El reino hermético", "«Este sábado probamos el nuevo misil»"],
  ["kr", "El vecino armado y delatado", "«Concierto de K-pop y radares: entrambos»"],
  ["jp", "La potencia pacífica armada", "«Constitución aparte, presupuestamos defensa»"],
  ["tw", "La isla de los microchips", "«Somos importantes: pregunta a cualquier fábrica»"],
  ["mm", "El golpista crónico", "«Elecciones: en cuanto las organicemos»"],
  ["th", "El reino de medias tornas", "«Cada década, un golpe de routine»"],
  ["vn", "El vencedor histórico", "«Ya nos intentaron invadir; preguntad cómo acabó»"],
  ["ph", "El archipiélago disputado", "«El mar es nuestro; el juez, ajeno»"],
  ["id", "El gigante equidistante", "«No tomamos partido: vendemos a todos»"],
  ["my", "El negociador silencioso", "«Hablamos por dentro, comerciamos por fuera»"],
  ["sg", "El diminuto banquero", "«Nuestra neutralidad tiene suite de lujo»"],
  ["au", "El sheriff del sur", "«Todo lo que pasa en el Pacífico nos concierne»"],
  ["ca", "El vecino educado", "«Estamos de acuerdo, pero por escrito»"],
  ["mx", "El norte con sabor", "«No vemos, no oímos, no comentamos»"],
  ["br", "Gigante del sur", "«¿Y si resolvemos esto con fútbol?»"],
  ["ar", "La perla del plata", "«Tenemos la teoría más extensa del mundo»"],
  ["cl", "El ejemplo de la región", "«Nuestro conflicto es con el cobre, no con vecinos»"],
  ["pe", "El país minero", "«Cada crisis sube nuestro precio por tonelada»"],
  ["ve", "La república petrolera", "«Sin petróleo somos un ejemplo; con petróleo, un titular»"],
  ["co", "El aliado del norte", "«Llevamos décadas en el mismo capítulo»"],
  ["do", "La isla del turismo", "«El conflicto se para en la aduana»"],
  ["cu", "La isla de la revolución", "«El bloqueo es nuestro combustible retórico»"],
  ["ht", "La hermana olvidada", "«Noticias nuestras: solo si hay crisis»"],
  ["ec", "El país de la mitad del mundo", "«Estamos en la mitad de todos los conflictos»"],
  ["bo", "El altiplano con litio", "«Nuestra sal vale más que nuestra voz»"],
  ["py", "El corazón de Sudamérica", "«Guerras nos llegan por Netflix»"],
  ["uy", "La matriz tranquila", "«Nuestro mayor golpe fue en el Mundial»"],
  ["gt", "El país de los volcanes", "«Nuestra erupción es burocrática»"],
  ["hn", "El puente centroamericano", "«Las caravanas pasan, la política espera»"],
  ["sv", "El país Bitcoin", "«Apostamos la economía a otra moneda»"],
  ["ni", "El lago dos volcanes", "«El canal sigue en el papel»"],
  ["cr", "El país sin ejército", "«Desarmamos en 1948 y no nos han devuelto el favor»"],
  ["pa", "El canal de todos", "«Nuestra neutralidad tiene peaje»"],
  ["ng", "El gigante de África", "«Somos el futuro; el futuro tarda»"],
  ["et", "El país de los mil años", "«Colonizarnos quedó fuera de agenda»"],
  ["sd", "La confluencia en guerra", "«Dos generales, un país de rehén»"],
  ["ss", "El país más joven", "«Nacimos y entramos directo al titular»"],
  ["ke", "El hub de África oriental", "«Nuestra maratón es diplomática»"],
  ["so", "La nación de los clanes", "«El Estado se funda mañana a las 9»"],
  ["cd", "El scandium gigante", "«Riquezas infinitas, paz pendiente»"],
  ["ml", "El sahara del sahel", "«Cada golpe, un nuevo himno»"],
  ["ne", "El uranio disputado", "«El resplandor es nuestro; la luz, ajena»"],
  ["za", "El milagro del cabo", "«Resolvemos todo en mesa de diálogo»"],
  ["ma", "El reino alauí", "«El Sáhara es nuestro; también en el mapa propio»"],
  ["dz", "El gigante del gas", "«Europa escribe cuando baja la temperatura»"],
  ["ly", "Las dos capitales", "«Un país, dos gobiernos, cero contradicciones»"],
  ["se", "La neutralidad abandonada", "«Doscientos años de paz y ahora OTAN»"],
  ["fi", "La frontera milenaria", "«Compartimos 1340 km con la noticia»"],
  ["no", "El fondo del petróleo", "«La paz nos sale gratis: tenemos fondos»"],
  ["ch", "La neutralidad profesional", "«Guardamos el dinero de todos los bandos»"],
  ["at", "La capital de los espías", "«Aquí se negocia y se espía, por ese orden»"],
  ["hu", "El socio incómodo", "«Vetamos primero y explicamos después»"],
  ["ro", "El balcón del mar Negro", "«La OTAN empieza en nuestro jardín»"],
  ["by", "El último soviético", "«Somos independientes según Moscú»"],
  ["md", "El país de dos banderas", "«La política exterior es un cuestión de región»"],
  ["nl", "La Corte del mundo", "«Los criminales de guerra nos visitan en Scheveningen»"],
  ["be", "La capital de la burocracia", "«La Europa real se decide aquí, en comité»"],
  ["pt", "El atlántico histórico", "«El conflicto llegó en el siglo XV; lo archive»"],
  ["gr", "La cuna de la democracia", "«La filosofía es gratis; la defensa, no»"],
  ["cz", "El silencio central", "«Fuimos sacrificados en 1938; tomamos nota»"],
  ["sk", "El giro europeo", "«Nuestra política cambia cada elección»"],
  ["rs", "El orgullo balkánico", "«Kosovo es nuestra eterna sesión extraordinaria»"],
  ["ba", "El puente de Sarajevo", "«Nuestra historia enseña sin licencia»"],
  ["hr", "La costa de la rivalidad", "«El fútbol con el vecino es nuestra guerra fría»"],
  ["bg", "El silencio del Bósforo", "«Catorce siglos mirando pasar ejércitos»"],
  ["dk", "El estrecho de la OTAN", "«El Báltico ahora tiene dueño»"],
  ["ie", "La isla neutral", "«La neutralidad nos rentó como paraíso fiscal»"],
  ["lt", "El corredor nervioso", "«Suwalqui es la palabra que no pronunciamos»"],
  ["lv", "La costa vigilada", "«Tenemos rusia al lado; tenemos memoria»"],
  ["ee", "El tigre digital", "«Nuestra defensa es de bits y de bunker»"],
];

export const COUNTRY_CAST: CastEntry[] = CAST_TUPLES.map(([code, role, quote]) => ({ code, role, quote }));

// ====== UTILIDADES ======

let layerSeq = 0;
export function newLayerId(): string {
  layerSeq += 1;
  return `L${Date.now().toString(36)}${layerSeq}`;
}

/** Construye las capas de una plantilla resolviendo {{A}}/{{B}} por códigos reales. */
export function buildTemplateLayers(tpl: MemeTemplate, codeA: string, codeB: string): MemeLayer[] {
  return tpl.layers.map((l) => ({
    ...l,
    id: newLayerId(),
    code: l.code === "A" ? codeA : l.code === "B" ? codeB : undefined,
    text: l.text?.replace("{{A}}", codeA.toUpperCase()).replace("{{B}}", codeB.toUpperCase()),
  }));
}

// VANGUARD v97.0 · PANTALLA TOTAL — MOTOR DE VANGUARD TV
// La plataforma de video de Vanguard: feed vertical de pases cortos + sala de
// proyección con comentarios, likes y suscripciones. Contenido 100% original del
// mundo Vanguard (canales OSINT ficticios, crónicas guiadas, cámaras del mundo y
// explicadores de lugares) generado de forma determinista por día UTC.
// Sin red, sin azar no reproducible: misma semilla → mismos pases.
import { CANALES } from "@/lib/canales-data";
import { CRONICAS, LUGARES } from "@/lib/tierra-data";

export interface PaseTV {
  id: string;
  titulo: string;
  canalId: string;
  img: string;
  duracion: number; // segundos
  vistas: number;
  meGusta: number;
  nComentarios: number;
  compartidos: number;
  haceHoras: number;
  tags: string[];
  descripcion: string;
  tipo: "cronica" | "camara" | "analisis" | "directo" | "archivo" | "explicador";
  lugarId?: string;
  enVivo?: boolean;
  espectadores?: number;
}

// ── utilidades deterministas ──
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function rng(seed: string) {
  let s = hashStr(seed) || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
export function diaUtc(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

// ilustraciones del mundo Vanguard por ambiente (todas originales del juego)
const IMG = {
  guerra: ["/ilustraciones/camaras.jpg", "/ilustraciones/frente.jpg", "/ilustraciones/warsim.jpg", "/ilustraciones/combate.jpg", "/ilustraciones/dron.jpg", "/ilustraciones/sirenas.jpg"],
  analisis: ["/ilustraciones/osint.jpg", "/ilustraciones/centinela.jpg", "/ilustraciones/radar.jpg", "/ilustraciones/mapa.jpg", "/ilustraciones/geoint.jpg", "/ilustraciones/planeta.jpg"],
  archivo: ["/ilustraciones/biblioteca.jpg", "/ilustraciones/historia.jpg", "/ilustraciones/epocas.jpg", "/ilustraciones/muertes.jpg", "/ilustraciones/tribunal.jpg", "/ilustraciones/oscura.jpg"],
  mundo: ["/ilustraciones/cielos.jpg", "/ilustraciones/sismo.jpg", "/ilustraciones/planeta.jpg", "/ilustraciones/mundial.jpg", "/ilustraciones/canales.jpg", "/ilustraciones/estudio.jpg"],
};
function imgDe(pool: string[], seed: string): string {
  return pool[hashStr(seed) % pool.length];
}

// ── comentarios generados del mundo Vanguard ──
export interface ComentarioTV {
  id: string;
  handle: string;
  texto: string;
  meGusta: number;
  haceMin: number;
  fija?: boolean;
}

const HANDLE_A = ["mapa", "radar", "frente", "archivo", "orbita", "puerto", "atlas", "señal", "bruma", "cifra", "norte", "sonda"];
const HANDLE_B = ["karsk", "vand", "zenit", "sarno", "osint", "nocturno", "delta", "merid", "eco", "alpha", "vox", "cero"];
const COMENTARIOS_POOL = [
  "El corte del minuto 3 explica en 40 segundos lo que llevo tres días intentando entender.",
  "Confirmado desde el lado que no sale en portada: los convoy cambiaron de hora esta semana.",
  "No es la cantidad, es el ritmo. Cuando el ritmo cambia, alguien ya decidió algo.",
  "El mapa del final merece estar fijo en la pared de cualquier sala de análisis.",
  "Vengo del grafo siguiendo la arista de comercio y terminé aquí. Vanguard es otra cosa.",
  "Quien editó este pase entendió que el silencio también es información.",
  "Puse el sonido del canal nocturno de fondo y el análisis de la 1AM conecta con esto.",
  "Tres pases seguidos y ya tengo la línea temporal armada. Suscrito.",
  "Los que piden fuentes: la sala de proyección enlaza el expediente, está en la descripción.",
  "Este canal nunca grita. Y aun así es el que antes avisa.",
  "El detalle del satélite a las 04:12 no estaba en ningún medio grande. Brutal.",
  "Mi abuelo decía que los puentes se cierran antes de que suenen las sirenas. Aquí pasa literal.",
  "La crónica de los seis estrechos + este pase = masterclass gratuita.",
  "Pausa en el segundo 27 y mirad el techo del hangar. No es una mancha.",
  "Estoy aprendiendo más de geopolítica aquí que en un semestre entero.",
];

export function comentariosDe(paseId: string, n: number): ComentarioTV[] {
  const r = rng("cmt:" + paseId);
  const out: ComentarioTV[] = [];
  for (let i = 0; i < n; i++) {
    const h = HANDLE_A[Math.floor(r() * HANDLE_A.length)] + "_" + HANDLE_B[Math.floor(r() * HANDLE_B.length)] + Math.floor(r() * 90 + 10);
    out.push({
      id: paseId + ":c" + i,
      handle: "@" + h,
      texto: COMENTARIOS_POOL[Math.floor(r() * COMENTARIOS_POOL.length)],
      meGusta: Math.floor(r() * 2400) + 3,
      haceMin: Math.floor(r() * 900) + 4,
      fija: i === 0,
    });
  }
  return out.sort((a, b) => (b.fija ? 1 : 0) - (a.fija ? 1 : 0) || b.meGusta - a.meGusta);
}

// ── construcciones de pases por tipo ──
function pasesCronicas(dia: string): PaseTV[] {
  return CRONICAS.map((c, i) => {
    const r = rng("cron:" + dia + c.id);
    const vistas = Math.floor(r() * 420000) + 58000;
    return {
      id: "tv-cron-" + c.id,
      titulo: "CRÓNICA · " + c.titulo,
      canalId: i % 3 === 0 ? "archivo" : i % 3 === 1 ? "vigia" : "puente",
      img: imgDe(IMG.archivo, c.id + dia),
      duracion: 300 + Math.floor(r() * 240),
      vistas,
      meGusta: Math.floor(vistas * (0.05 + r() * 0.04)),
      nComentarios: Math.floor(vistas * 0.004) + 40,
      compartidos: Math.floor(vistas * 0.011),
      haceHoras: 6 + i * 9,
      tags: ["#crónica", "#expediente", "#VanguardTV"],
      descripcion: c.lema + " Seis paradas guiadas por el planeta en vivo: cada parada abre la cámara, el contacto y el veredicto neuronal del lugar. Proyección continua, sin cortes.",
      tipo: "cronica" as const,
      enVivo: false,
    };
  });
}

function pasesCanales(dia: string): PaseTV[] {
  return CANALES.map((c) => {
    const r = rng("canal:" + dia + c.id);
    const vistas = Math.floor(r() * 900000) + 120000;
    return {
      id: "tv-can-" + c.id,
      titulo: c.nombre.toUpperCase() + " · informe de la sala",
      canalId: c.id,
      img: imgDe(IMG.analisis, c.id + dia),
      duracion: 480 + Math.floor(r() * 420),
      vistas,
      meGusta: Math.floor(vistas * (0.04 + r() * 0.05)),
      nComentarios: Math.floor(vistas * 0.006) + 60,
      compartidos: Math.floor(vistas * 0.02),
      haceHoras: 2 + Math.floor(r() * 20),
      tags: ["#" + c.id, "#análisis", "#en vivo"],
      descripcion: `Informe de sala de ${c.nombre} (${c.handle}): lo que mueve el mundo hoy contado desde su ventana. ${c.subs.toLocaleString("es")} suscriptores vigilan esta frecuencia. ${c.tipo === "INSTITUCIONAL" ? "Fuente institucional verificada." : c.tipo === "INDEPENDIENTE" ? "Sala independiente con método propio." : "Frecuencia sin verificar: contrasta con la Mesa."}`,
      tipo: "analisis" as const,
      enVivo: hashStr("live" + c.id + dia) % 4 === 0,
      espectadores: hashStr("esp" + c.id + dia) % 9000 + 400,
    };
  });
}

function pasesLugares(dia: string): PaseTV[] {
  return LUGARES.slice(0, 24).map((l) => {
    const r = rng("lugar:" + dia + l.id);
    const vistas = Math.floor(r() * 260000) + 21000;
    return {
      id: "tv-lug-" + l.id,
      titulo: l.nombre.toUpperCase() + " en 60 segundos",
      canalId: ["gaviota", "radarnoc", "sismografo", "laberinto"][hashStr(l.id) % 4],
      img: imgDe(IMG.mundo, l.id + dia),
      duracion: 45 + Math.floor(r() * 75),
      vistas,
      meGusta: Math.floor(vistas * (0.06 + r() * 0.05)),
      nComentarios: Math.floor(vistas * 0.005) + 12,
      compartidos: Math.floor(vistas * 0.03),
      haceHoras: 1 + Math.floor(r() * 46),
      tags: ["#" + l.id.replace(/[^a-z]/g, ""), "#explicador", "#mapa"],
      descripcion: l.nota + " Coordenadas " + l.lat.toFixed(2) + ", " + l.lng.toFixed(2) + " — ábrelo en Vanguard Earth y mira los contactos que cruzan ahora mismo por su cielo y sus aguas.",
      tipo: "explicador" as const,
      lugarId: l.id,
      enVivo: false,
    };
  });
}

function pasesCamara(dia: string): PaseTV[] {
  const ids = ["puerto", "frontera", "plaza", "hangar", "embajada", "túnel", "refinería", "aduana"];
  return ids.map((x, i) => {
    const r = rng("cam:" + dia + x);
    const vistas = Math.floor(r() * 1300000) + 90000;
    return {
      id: "tv-cam-" + i,
      titulo: "CÁMARA " + x.toUpperCase() + " · el mundo en vivo",
      canalId: ["frontline", "radarnoc", "vigia", "laberinto"][i % 4],
      img: imgDe(IMG.guerra, x + dia),
      duracion: 60 + Math.floor(r() * 120),
      vistas,
      meGusta: Math.floor(vistas * (0.07 + r() * 0.06)),
      nComentarios: Math.floor(vistas * 0.009) + 100,
      compartidos: Math.floor(vistas * 0.04),
      haceHoras: Math.floor(r() * 10),
      tags: ["#envivo", "#cámaras", "#sin cortes"],
      descripcion: "Feed CCTV del mundo Vanguard sin cortes: mira lo que ven las lentes cuando nadie las mira. Cada cámara enlaza su sala en VIGILANCIA TOTAL para cruzar con radar, cielos y sismos.",
      tipo: "camara" as const,
      enVivo: true,
      espectadores: hashStr("camEsp" + x + dia) % 14000 + 900,
    };
  });
}

function pasesArchivo(dia: string): PaseTV[] {
  const temas = [
    { id: "mk", t: "Lo que el ARCHIVO MUNDIAL desclasificó esta semana", d: "Recorrido por los expedientes desclasificados que acabaron de entrar en la biblioteca: quién los firmó, qué se tachó y qué revela lo tachado." },
    { id: "st", t: "La guerra que casi fue (y el papel que la frenó)", d: "Cuando un solo telegrama pesa más que una flotilla: el pase revisa el momento exacto en que una escalera diplomática detuvo un despliegue." },
    { id: "pc", t: "Tres civilizaciones que desaparecieron por una ruta", d: "Del ASSIGNMENT ALEJANDRÍA OSCURA: qué pasa cuando el comercio cambia de brazo y una costa entera se queda sin nadie que la mire." },
    { id: "gl", t: "El mapa del miedo: cómo se dibuja una frontera", d: "Líneas sobre papel, tropas sobre el terreno. Explicador del taller de cartografía de Vanguard sobre por qué algunas fronteras tiemblan y otras no." },
  ];
  return temas.map((x) => {
    const r = rng("arc:" + dia + x.id);
    const vistas = Math.floor(r() * 700000) + 70000;
    return {
      id: "tv-arc-" + x.id,
      titulo: x.t,
      canalId: "archivo",
      img: imgDe(IMG.archivo, x.id + dia),
      duracion: 600 + Math.floor(r() * 600),
      vistas,
      meGusta: Math.floor(vistas * (0.05 + r() * 0.04)),
      nComentarios: Math.floor(vistas * 0.005) + 80,
      compartidos: Math.floor(vistas * 0.015),
      haceHoras: 12 + Math.floor(r() * 30),
      tags: ["#archivo", "#desclasificado", "#historia"],
      descripcion: x.d + " Todo el material citado vive en ARCHIVO MUNDIAL con su fuente nombrada.",
      tipo: "archivo" as const,
      enVivo: false,
    };
  });
}

// ── FEED determinista del día: 40+ pases mezclados con semilla por día UTC ──
export function feedTV(dia = diaUtc()): PaseTV[] {
  const todo = [...pasesCamara(dia), ...pasesCanales(dia), ...pasesLugares(dia), ...pasesCronicas(dia), ...pasesArchivo(dia)];
  const r = rng("feed:" + dia);
  // barajado determinista: interleave ponderado para que no se agrupen por tipo
  const out: PaseTV[] = [];
  const bolsas: PaseTV[][] = [
    todo.filter((p) => p.tipo === "camara"),
    todo.filter((p) => p.tipo === "analisis"),
    todo.filter((p) => p.tipo === "explicador"),
    todo.filter((p) => p.tipo === "cronica" || p.tipo === "archivo"),
  ];
  let i = 0;
  while (out.length < todo.length) {
    const b = bolsas[i % bolsas.length];
    if (b.length) out.push(b.splice(Math.floor(r() * b.length), 1)[0]);
    i++;
    if (i > 400) break;
  }
  return out;
}

export function pasePorId(id: string, dia = diaUtc()): PaseTV | undefined {
  return feedTV(dia).find((p) => p.id === id);
}

export function canalNombre(id: string): string {
  return CANALES.find((c) => c.id === id)?.nombre ?? "VANGUARD TV";
}

export function canalEmoji(id: string): string {
  return CANALES.find((c) => c.id === id)?.emoji ?? "📺";
}

export function canalColor(id: string): string {
  return CANALES.find((c) => c.id === id)?.color ?? "#FFC94D";
}

export function canalHandle(id: string): string {
  return CANALES.find((c) => c.id === id)?.handle ?? "@vanguardtv";
}

export function canalSubs(id: string): number {
  return CANALES.find((c) => c.id === id)?.subs ?? 0;
}

// relacionados: mismos tags o mismo canal, sin repetir el propio
export function relacionadosDe(pase: PaseTV, dia = diaUtc(), n = 8): PaseTV[] {
  const feed = feedTV(dia).filter((p) => p.id !== pase.id);
  const mismo = feed.filter((p) => p.canalId === pase.canalId || p.tipo === pase.tipo);
  const resto = feed.filter((p) => !(p.canalId === pase.canalId || p.tipo === pase.tipo));
  return [...mismo, ...resto].slice(0, n);
}

// tendencias de la pantalla: top por vistas del día
export function tendenciasTV(dia = diaUtc(), n = 6): PaseTV[] {
  return [...feedTV(dia)].sort((a, b) => b.vistas - a.vistas).slice(0, n);
}

export function compacto(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(".0", "") + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(n >= 1e4 ? 0 : 1).replace(".0", "") + "K";
  return String(n);
}

export function duracionTxt(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m + ":" + String(sec).padStart(2, "0");
}

export function haceTxt(h: number): string {
  if (h < 1) return "hace minutos";
  if (h < 24) return "hace " + h + " h";
  return "hace " + Math.floor(h / 24) + " d";
}

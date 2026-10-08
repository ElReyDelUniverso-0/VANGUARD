// v89.0 OPERACIÓN ESPEJO — MOTOR DE CANALES OSINT (espejo del agregador de
// canales tipo Telegram que todo analista tiene abierto). 8 canales con
// personalidad propia; los mensajes ENGANCHAN con los incidentes del motor de
// PULSOS para que el ecosistema de información sea coherente entre salas.

import { generarPulsos, fnv89, horaCorta, type PulsoIncidente } from "./pulsos-data";

export interface CanalOSINT {
  id: string;
  nombre: string;
  handle: string;
  emoji: string;
  color: string;
  subs: number;
  verificado: boolean;
  tipo: "INSTITUCIONAL" | "INDEPENDIENTE" | "SIN VERIFICAR";
}

export const CANALES: CanalOSINT[] = [
  { id: "archivo", nombre: "Z-ARCHIVO", handle: "@zarchivo", emoji: "🗄️", color: "#B48CFF", subs: 412300, verificado: true, tipo: "INSTITUCIONAL" },
  { id: "vigia", nombre: "Vigía del Sur", handle: "@vigiadelsur", emoji: "🔭", color: "#3DDCFF", subs: 288700, verificado: true, tipo: "INDEPENDIENTE" },
  { id: "puente", nombre: "Puente Este", handle: "@puenteste", emoji: "🌉", color: "#9AE04D", subs: 197400, verificado: true, tipo: "INSTITUCIONAL" },
  { id: "radarnoc", nombre: "Radar Nocturno", handle: "@radarnoc", emoji: "📡", color: "#FFD23D", subs: 165900, verificado: false, tipo: "INDEPENDIENTE" },
  { id: "gaviota", nombre: "La Gaviota OSINT", handle: "@gaviota_osint", emoji: "🕊️", color: "#FF6BC1", subs: 121050, verificado: false, tipo: "INDEPENDIENTE" },
  { id: "frontline", nombre: "FRENTE·CERO", handle: "@frontecero", emoji: "⚡", color: "#FF8A3D", subs: 98800, verificado: false, tipo: "SIN VERIFICAR" },
  { id: "sismografo", nombre: "Sismógrafo", handle: "@sismografo_g", emoji: "📊", color: "#4DFFC4", subs: 76200, verificado: true, tipo: "INSTITUCIONAL" },
  { id: "laberinto", nombre: "Laberinto Gris", handle: "@laberintogris", emoji: "🌀", color: "#FF4D6D", subs: 54300, verificado: false, tipo: "SIN VERIFICAR" },
];

export interface MensajeCanal {
  id: string;
  canal: string;
  texto: string;
  ts: number;
  vistas: number;
  reenvios: number;
  coincideCable: boolean; // contrastado contra el motor de PULSOS
}

const CONECTORES = [
  "Confirmado por nuestra red:",
  "Aún sin confirmación oficial, pero:",
  "Nos llega desde el frente:",
  "Circula en canales afines:",
  "Imagen satelital del mediodía muestra:",
  "Dos fuentes convergen en:",
  "DESCLASIFICADO parcialmente:",
  "ATENCIÓN —",
];

const CIERRES = [
  "Esperamos confirmación de segunda fuente.",
  "Vigilando el eje las próximas 6 horas.",
  "Las agencias mayores aún no lo recogen.",
  "Coincide con el patrón de la semana.",
  "Si se confirma, cambia el mapa.",
  "Seguimos con el canal abierto 24/7.",
  "No compartan coordenadas exactas por seguridad.",
  "Actualizaremos en este mismo hilo.",
];

function rnd(seed: string, salt: number): number {
  const h = parseInt(fnv89(seed + ":" + salt).slice(0, 7), 36);
  return (h % 100000) / 100000;
}

export function generarMensajes(ventanaMs: number, ahora = Date.now()): MensajeCanal[] {
  // 1) incidencias del mundo (misma materia prima que PULSOS)
  const incidentes = generarPulsos(Math.min(ventanaMs, 6 * 3600_000), ahora);
  const paso = 4 * 60 * 1000; // un mensaje cada ~4 min en el ecosistema
  const tramoAhora = Math.floor(ahora / paso);
  const tramos = Math.min(40, Math.ceil(ventanaMs / paso));
  const out: MensajeCanal[] = [];

  let incIdx = 0;
  for (let t = tramos - 1; t >= 0; t--) {
    const tramo = tramoAhora - t;
    const seed = "canal89:" + tramo;
    const canal = CANALES[Math.floor(rnd(seed, 1) * CANALES.length)];
    const usaIncidente = incidentes.length > 0 && rnd(seed, 2) > 0.45;
    let texto: string;
    let coincide = false;
    if (usaIncidente) {
      const inc: PulsoIncidente | undefined = incidentes[incIdx % incidentes.length];
      incIdx++;
      if (!inc) continue;
      const conector = CONECTORES[Math.floor(rnd(seed, 3) * CONECTORES.length)];
      const cierre = CIERRES[Math.floor(rnd(seed, 4) * CIERRES.length)];
      const tono = canal.tipo === "INSTITUCIONAL" ? "" : canal.tipo === "SIN VERIFICAR" ? " — no verificado, TÓMELO CON PINZAS" : "";
      texto = `${conector} ${inc.titulo}${tono}. ${cierre}`;
      coincide = canal.verificado;
    } else {
      const gen = [
        `Resumen de la guardia nocturna: el pulso de la tensión global se mantiene y la aviación de patrulla no bajó del umbral. ${CIERRES[Math.floor(rnd(seed, 5) * CIERRES.length)]}`,
        `Análisis: el movimiento de buques en los canales calientes anticipa lo que las agencias dirán mañana. ${CIERRES[Math.floor(rnd(seed, 6) * CIERRES.length)]}`,
        `Hilo de geolocalización: un lector cruzó 3 imágenes y situó el depósito exacto. El método importa más que el titular. ${CIERRES[Math.floor(rnd(seed, 7) * CIERRES.length)]}`,
        `Recordatorio metodológico: si una imagen no tiene sombra coherente con la hora local, no es prueba. ${CIERRES[Math.floor(rnd(seed, 8) * CIERRES.length)]}`,
      ];
      texto = gen[Math.floor(rnd(seed, 9) * gen.length)];
    }
    const ts = tramo * paso + Math.floor(rnd(seed, 10) * paso);
    if (ts > ahora) continue;
    out.push({
      id: `m${tramo.toString(36)}`,
      canal: canal.id,
      texto,
      ts,
      vistas: Math.round(2000 + rnd(seed, 11) * 98000),
      reenvios: Math.round(50 + rnd(seed, 12) * 3200),
      coincideCable: coincide,
    });
  }
  return out.sort((a, b) => b.ts - a.ts);
}

export function canalDe(id: string): CanalOSINT {
  return CANALES.find((c) => c.id === id) ?? CANALES[0];
}

export { horaCorta };

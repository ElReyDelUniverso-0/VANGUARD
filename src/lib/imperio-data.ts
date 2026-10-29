// v91.0 AUGE Y CAÍDA — motor del RTS territorial de Vanguard.
// Un continente ficticio del mundo Vanguard donde imperios crecen celda a celda:
// economía de oro y ciencia, civiles y soldados, frentes con mantener/contraatacar,
// investigación, cañones que golpean a ambos bandos y ataques navales desde puertos.
// Todo se genera aquí: mapa por semilla, facciones, bots con personalidad y crónica.

export type TipoCelda = "mar" | "llanura" | "bosque" | "colina" | "montaña";
export type TipoEdificio = "ciudad" | "mercado" | "laboratorio" | "cuartel" | "fortaleza" | "puerto" | "cañon";

export interface Celda {
  id: number;
  col: number;
  row: number;
  x: number;
  y: number;
  tipo: TipoCelda;
  dueño: string | null;
  guarnicion: number;
  edificio: TipoEdificio | null;
  capital: string | null;
  costera: boolean;
}

export interface Frente {
  id: number;
  objetivo: number;
  atacante: string;
  naval: boolean;
  tropas: number;
  modo: "avanzar" | "mantener";
  edad: number;
}

export interface Investigando {
  id: string;
  restante: number;
}

export interface Imperio {
  id: string;
  nombre: string;
  color: string;
  esJugador: boolean;
  faccion: number;
  oro: number;
  ciencia: number;
  civiles: number;
  reserva: number;
  viva: boolean;
  recarga: number;
  investigacion: Investigando | null;
  completadas: string[];
  personalidad: "conquistador" | "expansor" | "mercader" | "fortificador";
  relojBot: number;
}

export interface CronicaLinea {
  t: number;
  texto: string;
  color: string;
  id: number;
}

export interface Boom {
  celda: number;
  edad: number;
}

export interface Onda {
  celda: number;
  edad: number;
}

export interface EstadoJuego {
  celdas: Celda[];
  imperios: Imperio[];
  frentes: Frente[];
  reloj: number;
  cronicas: CronicaLinea[];
  booms: Boom[];
  ondas: Onda[];
  seq: number;
  terminado: null | { victoria: boolean; motivo: string; ganador: string };
  semilla: number;
}

// ---------- FACCIÓN Y BOTICA DE NOMBRES ----------

export interface Faccion {
  id: string;
  nombre: string;
  lema: string;
  bono: string;
  oro: number;
  ciencia: number;
  recluta: number;
  asalto: number;
  defensa: number;
}

export const FACciones: Faccion[] = [
  { id: "legion", nombre: "Legión de Acero", lema: "El acero manda", bono: "+30% reclutamiento · +10% asalto", oro: 1, ciencia: 1, recluta: 1.3, asalto: 1.1, defensa: 1 },
  { id: "gremio", nombre: "Gremio Dorado", lema: "Todo tiene precio", bono: "+35% oro", oro: 1.35, ciencia: 1, recluta: 1, asalto: 1, defensa: 1 },
  { id: "academia", nombre: "Academia del Alba", lema: "Saber es artillería", bono: "+35% ciencia", oro: 1, ciencia: 1.35, recluta: 1, asalto: 1, defensa: 1 },
  { id: "muro", nombre: "Custodios del Muro", lema: "Nada pasa", bono: "+35% defensa", oro: 1, ciencia: 1, recluta: 1, asalto: 1, defensa: 1.35 },
];

export const BOTS: { nombre: string; color: string; personalidad: Imperio["personalidad"] }[] = [
  { nombre: "Dominio Karsk", color: "#FF5A5A", personalidad: "conquistador" },
  { nombre: "Comarca de Osk", color: "#4DFFC4", personalidad: "mercader" },
  { nombre: "Horda Vhalgar", color: "#FF9A4D", personalidad: "conquistador" },
  { nombre: "República Meridia", color: "#4DD8FF", personalidad: "expansor" },
  { nombre: "Fraternidad Nhil", color: "#B18CFF", personalidad: "fortificador" },
  { nombre: "Clan Dravik", color: "#FF7AB8", personalidad: "expansor" },
  { nombre: "Santuario Lumen", color: "#C8FF4D", personalidad: "fortificador" },
];

export const INVESTIGACIONES: { id: string; nombre: string; desc: string; costo: number; segundos: number }[] = [
  { id: "arado", nombre: "Arado de hierro", desc: "+25% oro de ciudades y mercados", costo: 40, segundos: 45 },
  { id: "expres", nombre: "Conscripción exprés", desc: "+40% ritmo de reclutamiento", costo: 55, segundos: 55 },
  { id: "muralla", nombre: "Muralla avanzada", desc: "+30% defensa de guarniciones", costo: 70, segundos: 70 },
  { id: "polvora", nombre: "Pólvora mejorada", desc: "+25% fuerza de asalto", costo: 90, segundos: 85 },
  { id: "cartas", nombre: "Cartas náuticas", desc: "Los puertos alcanzan el doble de lejos", costo: 110, segundos: 95 },
  { id: "precisa", nombre: "Artillería de precisión", desc: "El cañón golpea el doble", costo: 130, segundos: 110 },
];

export const COSTES: Record<TipoEdificio, number> = {
  ciudad: 60,
  mercado: 45,
  laboratorio: 70,
  cuartel: 55,
  fortaleza: 65,
  puerto: 50,
  cañon: 80,
};

export const EFECTOS: Record<TipoEdificio, string> = {
  ciudad: "expande frontera, +vivienda y +cap de ejército",
  mercado: "+0.9 oro/s independiente de las ciudades",
  laboratorio: "gasta oro y lo convierte en ciencia",
  cuartel: "+50% recluta aquí cerca y apoya asaltos vecinos",
  fortaleza: "+30% defensa de la zona",
  puerto: "abre ataques navales de largo alcance",
  cañon: "dispara a 6 celdas · golpea a AMBOS bandos",
};

export const RELOJ_INICIAL = 900; // 15 minutos
export const META_DOMINIO = 0.75; // 75% del terreno

// ---------- AZAR DETERMINISTA ----------

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- GEOMETRÍA HEX (punta arriba) ----------

export const HEX = 21;
export const COLS = 26;
const ROWS = 14;

const VECINOS: [number, number][] = [
  [1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1],
];

export function hexCentro(col: number, row: number): { x: number; y: number } {
  return { x: HEX * Math.sqrt(3) * (col + row / 2) + HEX * 2, y: HEX * 1.5 * row + HEX * 2 };
}

export function hexPoligono(cx: number, cy: number, r = HEX - 1.2): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i - 30);
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
}

function distancia(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dx + dy));
}

// ---------- MAPA ----------

export const MAPA_W = HEX * Math.sqrt(3) * (COLS + ROWS / 2) + HEX * 4;
export const MAPA_H = HEX * 1.5 * ROWS + HEX * 4;

function ruido(col: number, row: number, rnd: number[]): number {
  // valor suavizado con la rejilla de 8 vecinos — terreno orgánico barato
  let suma = 0;
  let peso = 0;
  for (let drow = -1; drow <= 1; drow++) {
    for (let dcol = -1; dcol <= 1; dcol++) {
      const cc = col + dcol;
      const rr = row + drow;
      const idx = ((rr + 8) * 41 + (cc + 8)) % rnd.length;
      const fallo = dcol === 0 && drow === 0 ? 2.2 : 1;
      suma += rnd[idx] * fallo;
      peso += fallo;
    }
  }
  return suma / peso;
}

function crearMapa(seed: number): Celda[] {
  const rnd = mulberry32(seed);
  const rejilla: number[] = [];
  for (let i = 0; i < 512; i++) rejilla.push(rnd());
  const celdas: Celda[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const id = row * COLS + col;
      const centro = hexCentro(col, row);
      // caída radial: bordes = mar, corazón = continente
      const nx = col / (COLS - 1);
      const ny = row / (ROWS - 1);
      const radial = 1 - Math.pow(Math.abs(nx - 0.5) * 2, 2.4) * 0.75 - Math.pow(Math.abs(ny - 0.5) * 2, 2.6) * 0.7;
      const v = ruido(col, row, rejilla) * 0.62 + radial * 0.38;
      let tipo: TipoCelda;
      if (v < 0.47) tipo = "mar";
      else if (v > 0.815) tipo = "montaña";
      else if (v > 0.73) tipo = "bosque";
      else if (v > 0.62) tipo = "colina";
      else tipo = "llanura";
      celdas.push({
        id,
        col,
        row,
        x: centro.x,
        y: centro.y,
        tipo,
        dueño: null,
        guarnicion: tipo === "mar" ? 0 : 1 + Math.floor(rnd() * 3),
        edificio: null,
        capital: null,
        costera: false,
      });
    }
  }
  // marcar costeras
  for (const c of celdas) {
    if (c.tipo === "mar") continue;
    for (const [dc, dr] of VECINOS) {
      const v = celdas.find((o) => o.col === c.col + dc && o.row === c.row + dr);
      if (v && v.tipo === "mar") {
        c.costera = true;
        break;
      }
    }
  }
  return celdas;
}

function vecinosDe(celdas: Celda[], c: Celda): Celda[] {
  const out: Celda[] = [];
  for (const [dc, dr] of VECINOS) {
    const col = c.col + dc;
    const row = c.row + dr;
    if (col < 0 || row < 0 || col >= COLS || row >= ROWS) continue;
    out.push(celdas[row * COLS + col]);
  }
  return out;
}

function colocarCapitales(celdas: Celda[], rnd: () => number): Celda[] {
  const tierra = celdas.filter((c) => c.tipo !== "mar");
  const capis: Celda[] = [tierra[Math.floor(rnd() * tierra.length)]];
  while (capis.length < 8) {
    let mejor: Celda | null = null;
    let mejorD = -1;
    for (const c of tierra) {
      if (c.capital) continue;
      let dmin = 999;
      for (const k of capis) dmin = Math.min(dmin, distancia(c.col, c.row, k.col, k.row));
      // pesos: preferir llanura/colina y soltar algo de azar para que cambie cada partida
      const peso = dmin * (c.tipo === "montaña" ? 0.55 : 1) + rnd() * 1.6;
      if (peso > mejorD) {
        mejorD = peso;
        mejor = c;
      }
    }
    if (!mejor) break;
    capis.push(mejor);
  }
  capis.forEach((c, i) => {
    c.capital = i === 0 ? "jugador" : BOTS[i - 1] ? `bot-${i - 1}` : null;
    c.dueño = c.capital;
    c.guarnicion = 14;
    c.edificio = "ciudad";
  });
  // cada imperio respira en una celda vecina
  for (const k of capis) {
    if (!k.dueño) continue;
    const libres = vecinosDe(celdas, k).filter((v) => v.tipo !== "mar" && !v.dueño);
    if (libres.length) {
      const v = libres[Math.floor(rnd() * libres.length)];
      v.dueño = k.dueño;
      v.guarnicion = 4;
    }
  }
  return capis;
}

// ---------- CREACIÓN DE PARTIDA ----------

export function crearJuego(seed: number, faccionId: string): EstadoJuego {
  const rnd = mulberry32(seed ^ 0x9e3779b9);
  const celdas = crearMapa(seed);
  const capis = colocarCapitales(celdas, rnd);

  const jugador: Imperio = {
    id: "jugador",
    nombre: "TU IMPERIO",
    color: "#FFC94D",
    esJugador: true,
    faccion: Math.max(0, FACciones.findIndex((f) => f.id === faccionId)),
    oro: 80,
    ciencia: 0,
    civiles: 20,
    reserva: 10,
    viva: true,
    recarga: 0,
    investigacion: null,
    completadas: [],
    personalidad: "conquistador",
    relojBot: 0,
  };

  const imperios: Imperio[] = [jugador];
  for (let i = 0; i < 7 && i < BOTS.length; i++) {
    const b = BOTS[i];
    imperios.push({
      id: `bot-${i}`,
      nombre: b.nombre,
      color: b.color,
      esJugador: false,
      faccion: Math.floor(rnd() * FACciones.length),
      oro: 80,
      ciencia: 0,
      civiles: 20,
      reserva: 10,
      viva: true,
      recarga: 0,
      investigacion: null,
      completadas: [],
      personalidad: b.personalidad,
      relojBot: 3 + Math.floor(rnd() * 5),
    });
  }

  const e: EstadoJuego = {
    celdas,
    imperios,
    frentes: [],
    reloj: RELOJ_INICIAL,
    cronicas: [
      { t: RELOJ_INICIAL, texto: "El continente despierta: 8 imperios, un solo trono.", color: "#FFC94D", id: 1 },
    ],
    booms: [],
    ondas: [],
    seq: 2,
    terminado: null,
    semilla: seed,
  };

  cronica(e, "Funda tu imperio: construye, recluta y toma el 75% del terreno.", "#FFC94D");
  return e;
}

function cronica(e: EstadoJuego, texto: string, color: string) {
  e.cronicas.unshift({ t: e.reloj, texto, color, id: e.seq++ });
  if (e.cronicas.length > 46) e.cronicas.pop();
}

// ---------- CONSULTAS ----------

export function tierraTotal(e: EstadoJuego): number {
  return e.celdas.filter((c) => c.tipo !== "mar").length;
}

export function celdasDe(e: EstadoJuego, id: string): Celda[] {
  return e.celdas.filter((c) => c.dueño === id);
}

export function porcentajeMundo(e: EstadoJuego, id: string): number {
  const t = tierraTotal(e);
  return t ? celdasDe(e, id).filter((c) => c.tipo !== "mar").length / t : 0;
}

export function cuentaEdificio(e: EstadoJuego, id: string, tipo: TipoEdificio): number {
  return e.celdas.filter((c) => c.dueño === id && (c.edificio === tipo || (tipo === "ciudad" && c.capital === id))).length;
}

export function capReserva(e: EstadoJuego, imp: Imperio): number {
  return 30 + cuentaEdificio(e, imp.id, "ciudad") * 12 + cuentaEdificio(e, imp.id, "cuartel") * 18;
}

export function capVivienda(e: EstadoJuego, imp: Imperio): number {
  return 12 + cuentaEdificio(e, imp.id, "ciudad") * 9;
}

function multAtaque(e: EstadoJuego, imp: Imperio): number {
  const f = FACciones[imp.faccion] ?? FACciones[0];
  let m = f.asalto;
  if (imp.completadas.includes("polvora")) m *= 1.25;
  return m;
}

function multDefensa(e: EstadoJuego, imp: Imperio, c: Celda): number {
  const f = FACciones[imp.faccion] ?? FACciones[0];
  let m = f.defensa;
  if (imp.completadas.includes("muralla")) m *= 1.3;
  if (c.tipo === "bosque") m *= 1.15;
  if (c.tipo === "colina") m *= 1.22;
  if (c.tipo === "montaña") m *= 1.4;
  if (c.edificio === "fortaleza" || c.edificio === "cañon") m *= 1.25;
  if (vecinosDe(e.celdas, c).some((v) => v.dueño === c.dueño && v.edificio === "fortaleza")) m *= 1.3;
  return m;
}

function multRecluta(imp: Imperio): number {
  const f = FACciones[imp.faccion] ?? FACciones[0];
  return f.recluta * (imp.completadas.includes("expres") ? 1.4 : 1);
}

function multOro(imp: Imperio): number {
  const f = FACciones[imp.faccion] ?? FACciones[0];
  return f.oro * (imp.completadas.includes("arado") ? 1.25 : 1);
}

function multCiencia(imp: Imperio): number {
  const f = FACciones[imp.faccion] ?? FACciones[0];
  return f.ciencia;
}

// ---------- ACCIONES DEL JUGADOR ----------

export function puedeAtacarDesde(e: EstadoJuego, jugador: Imperio, objetivo: Celda): { ok: boolean; naval: boolean } {
  if (objetivo.tipo === "mar") return { ok: false, naval: false };
  if (objetivo.dueño === jugador.id) return { ok: false, naval: false };
  const mias = celdasDe(e, jugador.id);
  // contacto terrestre: cualquier celda propia pegada al objetivo
  const toca = vecinosDe(e.celdas, objetivo).some((v) => v.dueño === jugador.id);
  if (toca) return { ok: true, naval: false };
  // naval: alcance desde cualquier puerto propio
  const puertos = mias.filter((c) => c.edificio === "puerto");
  if (!puertos.length) return { ok: false, naval: false };
  const alcance = jugador.completadas.includes("cartas") ? 10 : 5;
  for (const p of puertos) {
    if (distancia(p.col, p.row, objetivo.col, objetivo.row) <= alcance && objetivo.costera) {
      return { ok: true, naval: true };
    }
  }
  return { ok: false, naval: false };
}

export function lanzarAtaque(e: EstadoJuego, jugador: Imperio, objetivo: Celda, pct: number, naval: boolean): string | null {
  if (e.terminado) return "La partida terminó";
  if (jugador.reserva < 3) return "Reserva insuficiente (mín. 3)";
  if (e.frentes.filter((f) => f.atacante === jugador.id).length >= 4) return "Máximo 4 frentes activos: resuelve o mantén";
  const tropas = Math.max(1, Math.round((jugador.reserva * pct) / 100));
  jugador.reserva -= tropas;
  const defensor = objetivo.dueño ? e.imperios.find((i) => i.id === objetivo.dueño) ?? null : null;
  e.frentes.push({
    id: e.seq++,
    objetivo: objetivo.id,
    atacante: jugador.id,
    naval,
    tropas,
    modo: "avanzar",
    edad: 0,
  });
  if (defensor && defensor.viva) {
    cronica(e, `TU IMPERIO asalta tierras de ${defensor.nombre}${naval ? " desde el mar" : ""} (${tropas} tropas).`, "#FFC94D");
  } else if (!objetivo.dueño) {
    cronica(e, `Tropas marchan sobre tierras neutrales (${tropas}).`, "#FFC94D");
  }
  return null;
}

export function construir(e: EstadoJuego, imp: Imperio, celdaId: number, tipo: TipoEdificio): string | null {
  const c = e.celdas[celdaId];
  if (!c || c.dueño !== imp.id || c.tipo === "mar") return "Celda inválida";
  if (c.edificio) return "Ya hay un edificio aquí";
  if (tipo === "ciudad" && c.capital) return "La capital ya es una ciudad";
  if (tipo === "puerto" && !c.costera) return "El puerto exige costa";
  const coste = COSTES[tipo];
  if (imp.oro < coste) return `Faltan ${Math.ceil(coste - imp.oro)} de oro`;
  imp.oro -= coste;
  c.edificio = tipo;
  if (tipo === "ciudad") {
    // la ciudad empuja la frontera: reclama hasta 2 vecinas neutrales
    const libres = vecinosDe(e.celdas, c).filter((v) => v.tipo !== "mar" && !v.dueño);
    libres.slice(0, 2).forEach((v) => {
      v.dueño = imp.id;
      v.guarnicion = 2;
      e.ondas.push({ celda: v.id, edad: 0 });
    });
  }
  cronica(e, `${imp.esJugador ? "TU IMPERIO" : imp.nombre} levanta ${tipo.toUpperCase()}${tipo === "ciudad" ? ": la frontera crece." : "."}`, imp.color);
  return null;
}

export function reclutar(e: EstadoJuego, imp: Imperio): string | null {
  const toma = Math.min(Math.floor(imp.civiles * 0.4), 8);
  if (toma < 2) return "Civiles insuficientes";
  const nueva = Math.min(imp.reserva + Math.round(toma * multRecluta(imp)), capReserva(e, imp));
  imp.civiles -= toma;
  imp.reserva = nueva;
  return null;
}

export function lanzarInvestigacion(e: EstadoJuego, imp: Imperio, id: string): string | null {
  const inv = INVESTIGACIONES.find((i) => i.id === id);
  if (!inv) return "Investigación desconocida";
  if (imp.investigacion) return "Ya hay una investigación en marcha";
  if (imp.completadas.includes(id)) return "Ya completada";
  if (imp.ciencia < inv.costo) return `Faltan ${Math.ceil(inv.costo - imp.ciencia)} de ciencia`;
  imp.ciencia -= inv.costo;
  imp.investigacion = { id, restante: inv.segundos };
  cronica(e, `${imp.esJugador ? "TU IMPERIO" : imp.nombre} investiga ${inv.nombre.toUpperCase()}.`, imp.color);
  return null;
}

export function dispararCañon(e: EstadoJuego, imp: Imperio, cañonCelda: number, objetivo: number): string | null {
  const c = e.celdas[cañonCelda];
  const t = e.celdas[objetivo];
  if (!c || !t || c.edificio !== "cañon" || c.dueño !== imp.id) return "Ese cañón no es tuyo";
  if (imp.recarga > 0) return `Recargando: ${imp.recarga}s`;
  if (imp.oro < 100) return "El disparo cuesta 100 de oro";
  if (distancia(c.col, c.row, t.col, t.row) > 6) return "Fuera de alcance (6 celdas)";
  imp.oro -= 100;
  imp.recarga = 30;
  const dmg = imp.completadas.includes("precisa") ? 0.45 : 0.28;
  // golpea a AMBOS bandos: guarnición de la celda Y tropas comprometidas de cualquier frente sobre ella
  if (t.guarnicion > 0) t.guarnicion = Math.max(0, Math.round(t.guarnicion * (1 - dmg)));
  for (const f of e.frentes) {
    if (f.objetivo === objetivo) f.tropas = Math.max(0, Math.round(f.tropas * (1 - dmg)));
  }
  e.booms.push({ celda: objetivo, edad: 0 });
  cronica(e, `CAÑONAZO sobre (${t.col},${t.row}): hierro y fuego para quien esté ahí — de ambos lados.`, imp.color);
  return null;
}

export function reforzar(e: EstadoJuego, imp: Imperio, origen: number, destino: number): string | null {
  const a = e.celdas[origen];
  const b = e.celdas[destino];
  if (!a || !b || a.dueño !== imp.id || b.dueño !== imp.id) return "Solo entre celdas propias";
  if (a.capital === imp.id) return "La capital no mueve su guarnición";
  const mueve = Math.floor(a.guarnicion * 0.6);
  if (mueve < 1) return "Guarnición mínima";
  a.guarnicion -= mueve;
  b.guarnicion += mueve;
  return null;
}

export function cambiarModoFrente(e: EstadoJuego, imp: Imperio, frenteId: number, modo: "avanzar" | "mantener" | "contraatacar"): string | null {
  const f = e.frentes.find((x) => x.id === frenteId && x.atacante === imp.id);
  if (!f) return "Frente ajeno";
  if (modo === "contraatacar") {
    if (imp.reserva < 3) return "Sin reserva para contraatacar";
    const extra = Math.round(imp.reserva * 0.25);
    imp.reserva -= extra;
    f.tropas += Math.round(extra * 1.25); // el impulso del contraataque
    f.modo = "avanzar";
    cronica(e, `CONTRAATAQUE: +${extra} reservas se lanzan al frente.`, "#FFC94D");
  } else {
    f.modo = modo;
  }
  return null;
}

// ---------- IA DE LOS BOTS ----------

function actoBot(e: EstadoJuego, imp: Imperio, rnd: () => number) {
  const mias = celdasDe(e, imp.id);
  if (!mias.length) {
    imp.viva = false;
    return;
  }
  const f = FACciones[imp.faccion] ?? FACciones[0];

  // reclutar siempre que sobren civiles
  if (imp.civiles >= 16 && imp.reserva < capReserva(e, imp) - 6) {
    imp.civiles -= 6;
    imp.reserva = Math.min(imp.reserva + Math.round(6 * multRecluta(imp)), capReserva(e, imp));
  }

  // construir según personalidad
  if (imp.oro > 110 && rnd() < 0.5) {
    const sinEdificio = mias.filter((c) => !c.edificio && c.tipo !== "montaña");
    if (sinEdificio.length) {
      const pref: Record<Imperio["personalidad"], TipoEdificio[]> = {
        conquistador: ["cuartel", "mercado", "cañon", "ciudad"],
        expansor: ["ciudad", "mercado", "laboratorio", "cuartel"],
        mercader: ["mercado", "laboratorio", "puerto", "ciudad"],
        fortificador: ["fortaleza", "mercado", "ciudad", "laboratorio"],
      };
      const lista = pref[imp.personalidad];
      for (const t of lista) {
        const candidata = sinEdificio.find((c) => (t === "puerto" ? c.costera : true));
        if (candidata && imp.oro >= COSTES[t] * 1.4) {
          construir(e, imp, candidata.id, t);
          break;
        }
      }
    }
  }

  // investigación cuando sobra ciencia
  if (!imp.investigacion && imp.ciencia > 50) {
    const pendiente = INVESTIGACIONES.filter((i) => !imp.completadas.includes(i.id));
    if (pendiente.length) lanzarInvestigacion(e, imp, pendiente[Math.floor(rnd() * pendiente.length)].id);
  }

  // cañonazo si hay guerra y polvo
  if (imp.oro >= 160 && imp.recarga <= 0 && rnd() < 0.35) {
    const cañon = mias.find((c) => c.edificio === "cañon");
    if (cañon) {
      const blancos = e.celdas.filter(
        (c) => c.dueño && c.dueño !== imp.id && distancia(cañon.col, cañon.row, c.col, c.row) <= 6 && c.guarnicion >= 10
      );
      if (blancos.length) dispararCañon(e, imp, cañon.id, blancos[Math.floor(rnd() * blancos.length)].id);
    }
  }

  // atacar o expandir
  const frontera = mias.filter((c) => vecinosDe(e.celdas, c).some((v) => v.tipo !== "mar" && v.dueño !== imp.id));
  if (!frontera.length || imp.reserva < 6) {
    // replegar: meter reserva a la celda fronteriza más débil
    if (frontera.length && imp.reserva >= 4) {
      const destino = frontera.sort((a, b) => a.guarnicion - b.guarnicion)[0];
      destino.guarnicion += imp.reserva;
      imp.reserva = 0;
    }
    return;
  }
  const agresividad = imp.personalidad === "conquistador" ? 0.85 : imp.personalidad === "expansor" ? 0.7 : imp.personalidad === "mercader" ? 0.4 : 0.5;
  if (rnd() > agresividad) return;

  // preferir neutral barato; si no, enemigo débil
  const neutrales: Celda[] = [];
  const enemigas: Celda[] = [];
  const vistas = new Set<number>();
  for (const c of frontera) {
    for (const v of vecinosDe(e.celdas, c)) {
      if (v.tipo === "mar" || vistas.has(v.id)) continue;
      vistas.add(v.id);
      if (!v.dueño) neutrales.push(v);
      else if (v.dueño !== imp.id) enemigas.push(v);
    }
  }
  if (neutrales.length && rnd() < 0.72) {
    const objetivo = neutrales[Math.floor(rnd() * neutrales.length)];
    const tropas = Math.max(2, Math.round(imp.reserva * 0.4));
    imp.reserva -= tropas;
    e.frentes.push({ id: e.seq++, objetivo: objetivo.id, atacante: imp.id, naval: false, tropas, modo: "avanzar", edad: 0 });
    return;
  }
  if (enemigas.length) {
    const debil = enemigas.sort((a, b) => a.guarnicion - b.guarnicion)[0];
    const rival = e.imperios.find((i) => i.id === debil.dueño);
    const miPoder = imp.reserva * multAtaque(e, imp) * f.asalto;
    if (rival && debil.guarnicion * multDefensa(e, rival, debil) < miPoder * 0.9) {
      const tropas = Math.max(2, Math.round(imp.reserva * 0.55));
      imp.reserva -= tropas;
      e.frentes.push({ id: e.seq++, objetivo: debil.id, atacante: imp.id, naval: false, tropas, modo: "avanzar", edad: 0 });
    }
  }
}

// ---------- TICK PRINCIPAL (1 segundo) ----------

export function tickJuego(e: EstadoJuego): void {
  if (e.terminado) return;
  e.reloj -= 1;
  const rnd = mulberry32((e.semilla ^ (e.reloj * 2654435761)) >>> 0);

  // economía por imperio
  for (const imp of e.imperios) {
    if (!imp.viva) continue;
    const mias = celdasDe(e, imp.id);
    if (!mias.length) {
      if (imp.viva) {
        imp.viva = false;
        cronica(e, `${imp.esJugador ? "TU IMPERIO ha caído" : `${imp.nombre} ha caído`}. El continente lo recuerda.`, imp.color);
        if (imp.esJugador && !e.terminado) {
          e.terminado = { victoria: false, motivo: "Tu último balcón fue tomado.", ganador: e.imperios.find((i) => i.viva && !i.esJugador)?.nombre ?? "EL CONTINENTE" };
        }
      }
      continue;
    }
    const ciudades = cuentaEdificio(e, imp.id, "ciudad");
    const mercados = cuentaEdificio(e, imp.id, "mercado");
    const labs = cuentaEdificio(e, imp.id, "laboratorio");
    imp.oro += (1.1 + ciudades * 1.1 + mercados * 0.9) * multOro(imp);
    const consumo = labs * 1.2;
    if (imp.oro >= consumo) {
      imp.oro -= consumo;
      imp.ciencia += labs * 2.0 * multCiencia(imp);
    }
    const cap = capVivienda(e, imp);
    if (imp.civiles < cap) imp.civiles += 0.4 + ciudades * 0.14;

    // expansión pasiva: la frontera respira cada 22 s si hay ciudad
    if (ciudades >= 1 && e.reloj % 22 === 0) {
      const frontera = mias.filter((c) => vecinosDe(e.celdas, c).some((v) => v.tipo !== "mar" && !v.dueño));
      if (frontera.length) {
        const origen = frontera[Math.floor(rnd() * frontera.length)];
        const libres = vecinosDe(e.celdas, origen).filter((v) => v.tipo !== "mar" && !v.dueño);
        if (libres.length) {
          const v = libres[Math.floor(rnd() * libres.length)];
          v.dueño = imp.id;
          v.guarnicion = 2;
          e.ondas.push({ celda: v.id, edad: 0 });
        }
      }
    }

    // investigación
    if (imp.investigacion) {
      imp.investigacion.restante -= 1;
      if (imp.investigacion.restante <= 0) {
        const inv = INVESTIGACIONES.find((i) => i.id === imp.investigacion!.id);
        imp.completadas.push(imp.investigacion.id);
        cronica(e, `${imp.esJugador ? "TU IMPERIO" : imp.nombre} completa ${inv?.nombre.toUpperCase() ?? "una investigación"}.`, imp.color);
        imp.investigacion = null;
      }
    }
    if (imp.recarga > 0) imp.recarga -= 1;

    // bots piensan
    if (!imp.esJugador) {
      imp.relojBot -= 1;
      if (imp.relojBot <= 0) {
        imp.relojBot = 4 + Math.floor(rnd() * 5);
        actoBot(e, imp, rnd);
      }
    }
  }

  // frentes: fuego cruzado
  const muertos: number[] = [];
  for (const f of e.frentes) {
    const c = e.celdas[f.objetivo];
    const atacante = e.imperios.find((i) => i.id === f.atacante);
    if (!c || !atacante || !atacante.viva) {
      muertos.push(f.id);
      continue;
    }
    f.edad += 1;
    const defensor = c.dueño ? e.imperios.find((i) => i.id === c.dueño) : null;
    const defFuerza = (defensor ? multDefensa(e, defensor, c) : 1) * Math.max(1, c.guarnicion);
    if (f.modo === "avanzar") {
      const fuerza = f.tropas * multAtaque(e, atacante) * (f.naval ? 0.85 : 1);
      c.guarnicion -= fuerza * 0.1;
      f.tropas -= defFuerza * 0.085;
      if (c.guarnicion <= 0) {
        // captura
        const previo = c.dueño;
        c.dueño = atacante.id;
        c.guarnicion = Math.max(1, Math.round(f.tropas * 0.8));
        f.tropas = 0;
        e.ondas.push({ celda: c.id, edad: 0 });
        if (c.edificio === "fortaleza" && rnd() < 0.5) c.edificio = null;
        if (c.capital && c.capital !== atacante.id) {
          const rival = e.imperios.find((i) => i.id === c.capital);
          cronica(e, `¡LA CAPITAL DE ${rival?.nombre ?? "un imperio"} HA CAÍDO ante ${atacante.esJugador ? "TU IMPERIO" : atacante.nombre}!`, atacante.color);
        } else if (previo) {
          const rival = e.imperios.find((i) => i.id === previo);
          cronica(e, `${atacante.esJugador ? "TU IMPERIO" : atacante.nombre} toma ${c.edificio ? `un ${c.edificio} de ${rival?.nombre ?? "?"}` : "territorio"}${f.naval ? " desde el mar" : ""}.`, atacante.color);
        } else {
          cronica(e, `${atacante.esJugador ? "TU IMPERIO" : atacante.nombre} ocupa tierras neutrales del continente.`, atacante.color);
        }
        muertos.push(f.id);
      } else if (f.tropas <= 0) {
        c.guarnicion = Math.max(1, Math.round(c.guarnicion));
        muertos.push(f.id);
      }
    } else {
      // mantener: asedio de desgaste
      f.tropas -= defFuerza * 0.015;
      c.guarnicion -= f.tropas * multAtaque(e, atacante) * 0.008;
      if (f.tropas <= 0) muertos.push(f.id);
    }
  }
  e.frentes = e.frentes.filter((f) => !muertos.includes(f.id));

  // efectos
  for (const b of e.booms) b.edad += 1;
  e.booms = e.booms.filter((b) => b.edad < 2);
  for (const o of e.ondas) o.edad += 1;
  e.ondas = e.ondas.filter((o) => o.edad < 3);

  // condiciones de victoria
  const vivos = e.imperios.filter((i) => i.viva);
  if (!e.terminado) {
    const cuotaJugador = porcentajeMundo(e, "jugador");
    if (cuotaJugador >= META_DOMINIO) {
      e.terminado = { victoria: true, motivo: "Dominio total: tres cuartas partes del continente ondean tu bandera.", ganador: "TU IMPERIO" };
    } else if (vivos.length === 1) {
      e.terminado = { victoria: vivos[0].esJugador, motivo: vivos[0].esJugador ? "Último imperio en pie." : "El continente quedó en manos ajenas.", ganador: vivos[0].nombre };
    } else if (e.reloj <= 0) {
      const mejor = e.imperios.filter((i) => i.viva).sort((a, b) => porcentajeMundo(e, b.id) - porcentajeMundo(e, a.id))[0];
      e.terminado = { victoria: mejor.esJugador, motivo: "Se agotó el reloj: el mayor territorio gana.", ganador: mejor.nombre };
    }
  }
}

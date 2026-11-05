// ============================================================
// VANGUARD v170.2 «GLORIA» — PRESTIGIO, TÍTULOS, ADICCIÓN
// La capa de presunción sobre FICHAS DEL LINAJE:
//  · PRESTIGIO: puntuación de colección con desglose por rareza.
//  · TÍTULOS exclusivos desbloqueables (se equipan y presumen).
//  · MISIONES diarias de colección (mon ◉ + XP).
//  · RANKING MUNDIAL simulado, nuevo cada día (FOMO noble).
//  · SOBRE RELÁMPAGO: descuento por hora (urgencia honesta).
//  · TEXTO DE PRESUNCIÓN para copiar y presumir fuera de la red.
// Todo local, todo determinista, sin dependencias externas.
// ============================================================

import {
  type CategoriaFicha,
  type DefFicha,
  type EstadoFichas,
  type FichaInstancia,
  type RarezaFicha,
  type Sobre,
  CATALOGO,
  ORDEN_RAREZA,
  RAREZA_META,
  SOBRES,
  hashSemilla,
  rngDesde,
} from "./fichas";

// ── Prestigio: cuánto vale presumir cada rareza (1.ª copia) ─
export const PRESTIGIO_RAREZA: Record<RarezaFicha, number> = {
  COMUN: 5,
  RARO: 15,
  EPICO: 45,
  LEGENDARIO: 140,
  MITICO: 450,
  UNICO: 1200,
};

export function separarMiles(n: number): string {
  return n.toLocaleString("es-ES").replace(/\u00a0/g, " ");
}

// ── Contexto de desbloqueo: qué ha logrado el agente ────────
export interface CtxGloria {
  distintasPorCat: Record<CategoriaFicha, number>;
  distintas: number; // fichas distintas del catálogo poseídas
  legendarias: number; // fichas LEGENDARIAS distintas
  miticas: number; // fichas MÍTICAS distintas
  unicas: number; // fichas ÚNICAS 1/1 poseídas
  ejemplares: number;
  sobresAbiertos: number;
  rachaSobres: number;
  presumidas: number;
}

export function contextoGloria(estado: EstadoFichas): CtxGloria {
  const ids = new Set(estado.inventario.map((i) => i.fichaId));
  const distintasPorCat = { ARMAS: 0, GUERRAS: 0, PERSONAJES: 0, SIMBOLOS: 0 } as Record<CategoriaFicha, number>;
  let legendarias = 0;
  let miticas = 0;
  for (const def of CATALOGO) {
    if (!ids.has(def.id)) continue;
    distintasPorCat[def.categoria] += 1;
    if (def.rareza === "LEGENDARIO") legendarias += 1;
    if (def.rareza === "MITICO") miticas += 1;
  }
  const unicas = estado.inventario.filter((i) => i.fichaId.startsWith("unica-")).length;
  return {
    distintasPorCat,
    distintas: ids.size,
    legendarias,
    miticas,
    unicas,
    ejemplares: estado.inventario.length,
    sobresAbiertos: estado.sobresAbiertos,
    rachaSobres: estado.rachaSobres,
    presumidas: estado.presumidas,
  };
}

// ── TÍTULOS — la insignia que la gente ve y envidia ─────────
export interface TituloDef {
  id: string;
  nombre: string;
  descripcion: string;
  color: string;
  bonus: number; // prestigio extra por poseerlo
  logro: (c: CtxGloria) => boolean;
}

export const TITULOS: TituloDef[] = [
  { id: "coleccionista", nombre: "COLECCIONISTA", descripcion: "Reúne 10 fichas distintas", color: "#9aa7b8", bonus: 50, logro: (c) => c.distintas >= 10 },
  { id: "noble", nombre: "NOBLE DEL LINAJE", descripcion: "Reúne 20 fichas distintas", color: "#b0b8ff", bonus: 120, logro: (c) => c.distintas >= 20 },
  { id: "devoto", nombre: "DEVOTO DEL LINAJE", descripcion: "Racha de 3 días reclamando el regalo diario", color: "#ff8fa8", bonus: 150, logro: (c) => c.rachaSobres >= 3 },
  { id: "magnate", nombre: "MAGNATE DE SOBRES", descripcion: "Abre 25 sobres", color: "#ffc94d", bonus: 200, logro: (c) => c.sobresAbiertos >= 25 },
  { id: "senor-armas", nombre: "SEÑOR DE ARMAS", descripcion: "Completa la categoría ARMAS (14/14)", color: "#e8b04d", bonus: 300, logro: (c) => c.distintasPorCat.ARMAS >= 14 },
  { id: "cronista", nombre: "CRONISTA DE GUERRAS", descripcion: "Completa la categoría GUERRAS (12/12)", color: "#ff7a5c", bonus: 300, logro: (c) => c.distintasPorCat.GUERRAS >= 12 },
  { id: "maestro", nombre: "MAESTRO DE PERSONAJES", descripcion: "Completa la categoría PERSONAJES (14/14)", color: "#c49bff", bonus: 300, logro: (c) => c.distintasPorCat.PERSONAJES >= 14 },
  { id: "guardian", nombre: "GUARDIÁN DE SÍMBOLOS", descripcion: "Completa la categoría SÍMBOLOS (12/12)", color: "#5fd4e8", bonus: 300, logro: (c) => c.distintasPorCat.SIMBOLOS >= 12 },
  { id: "tocamitos", nombre: "TOCADOR DE MITOS", descripcion: "Posee una ficha MÍTICA", color: "#ff6fb5", bonus: 400, logro: (c) => c.miticas >= 1 },
  { id: "portador", nombre: "PORTADOR DE LO ÚNICO", descripcion: "Posee una ficha ÚNICA 1/1", color: "#f4f6ff", bonus: 500, logro: (c) => c.unicas >= 1 },
  { id: "codice", nombre: "PORTADOR DEL CÓDICE", descripcion: "Reúne 40 fichas distintas", color: "#ffd977", bonus: 600, logro: (c) => c.distintas >= 40 },
  { id: "linaje-completo", nombre: "LINAJE COMPLETO", descripcion: "El catálogo entero: 52/52", color: "#ffffff", bonus: 1000, logro: (c) => c.distintas >= CATALOGO.length },
];

export function titulosDesbloqueados(ctx: CtxGloria): TituloDef[] {
  return TITULOS.filter((t) => t.logro(ctx));
}

export function tituloPorId(id: string | null): TituloDef | null {
  if (!id) return null;
  return TITULOS.find((t) => t.id === id) ?? null;
}

// ── Cálculo de prestigio con desglose ────────────────────────
export interface DesglosePrestigio {
  total: number;
  porRareza: Record<RarezaFicha, number>;
  base: number;
  bonusTitulos: number;
  desbloqueados: TituloDef[];
}

export function calcularPrestigio(estado: EstadoFichas): DesglosePrestigio {
  const ids = new Set(estado.inventario.map((i) => i.fichaId));
  const porRareza: Record<RarezaFicha, number> = { COMUN: 0, RARO: 0, EPICO: 0, LEGENDARIO: 0, MITICO: 0, UNICO: 0 };
  let base = 0;
  for (const def of CATALOGO) {
    if (!ids.has(def.id)) continue;
    porRareza[def.rareza] += 1;
    base += PRESTIGIO_RAREZA[def.rareza];
  }
  const unicas = estado.inventario.filter((i) => i.fichaId.startsWith("unica-")).length;
  porRareza.UNICO += unicas;
  base += unicas * PRESTIGIO_RAREZA.UNICO;

  const ctx = contextoGloria(estado);
  const desbloqueados = titulosDesbloqueados(ctx);
  const bonusTitulos = desbloqueados.reduce((s, t) => s + t.bonus, 0);
  return { total: base + bonusTitulos, porRareza, base, bonusTitulos, desbloqueados };
}

// ── RANKING MUNDIAL — rivalidad nueva cada día ───────────────
const NOMBRES_RIVAL = [
  "El Centinela", "La Orácula", "Sr. Umbral", "Dama Vidrio", "Capitán Ceniza",
  "El Cartógrafo", "Reina Polvo", "Lobo Blanco", "Hermana Luna", "El Juez de Hueso",
  "General Bruma", "La Herrera", "El Náufrago", "Marquesa Sal", "El Prisma",
];

export interface FilaRanking {
  nombre: string;
  prestigio: number;
  tu?: boolean;
  titulo?: string;
}

export interface RankingMundial {
  filas: FilaRanking[];
  posicion: number;
  pctTop: number; // "estás en el top X%"
  dia: string;
}

function diaIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function rankingMundial(estado: EstadoFichas): RankingMundial {
  const dia = diaIso();
  const rng = rngDesde(hashSemilla(`gloria:${dia}:${estado.semilla}`));
  const nombres = [...NOMBRES_RIVAL];
  const rivales: FilaRanking[] = [];
  for (let i = 0; i < 11; i++) {
    const idx = Math.floor(rng() * nombres.length);
    const base = nombres.splice(idx, 1)[0] ?? `Agente ${i + 1}`;
    const sufijo = 10 + Math.floor(rng() * 90);
    const prestigio = 140 + Math.floor(rng() * rng() * 5600);
    rivales.push({ nombre: `${base} ${sufijo}`, prestigio });
  }
  rivales.sort((a, b) => b.prestigio - a.prestigio);

  const desglose = calcularPrestigio(estado);
  const tituloEquipado = tituloPorId(estado.tituloEquipado);
  const tuya: FilaRanking = {
    nombre: "TÚ",
    prestigio: desglose.total,
    tu: true,
    titulo: tituloEquipado?.nombre,
  };
  const filas = [...rivales, tuya].sort((a, b) => b.prestigio - a.prestigio);
  const posicion = filas.findIndex((f) => f.tu) + 1;
  const pctTop = Math.max(1, Math.round((posicion / filas.length) * 100));
  return { filas, posicion, pctTop, dia };
}

// ── SOBRE RELÁMPAGO — oferta rotativa por hora ───────────────
export interface OfertaRelampago {
  sobre: Sobre;
  pct: number;
  precio: number;
  precioOriginal: number;
  claveHora: number; // cambia a la hora siguiente
  segundosRestantes: number;
}

const DESCUENTOS = [30, 40, 45, 50];

export function paqueteRelampago(ahora = new Date()): OfertaRelampago | null {
  const elegibles = SOBRES.filter((s) => s.precio > 0 && !s.unico);
  if (elegibles.length === 0) return null;
  const clave = ahora.getDate() * 24 + ahora.getHours();
  const base = elegibles[clave % elegibles.length];
  const pct = DESCUENTOS[clave % DESCUENTOS.length];
  const precio = Math.max(10, Math.round((base.precio * (100 - pct)) / 100 / 5) * 5);
  const fin = new Date(ahora);
  fin.setMinutes(59, 59, 999);
  const segundosRestantes = Math.max(0, Math.floor((fin.getTime() - ahora.getTime()) / 1000));
  return { sobre: { ...base, precio }, pct, precio, precioOriginal: base.precio, claveHora: clave, segundosRestantes };
}

// ── TICKER DE LA RED — ambencia de FOMO noble ────────────────
export function mensajeTicker(_estado: EstadoFichas, tick: number): string {
  const dia = diaIso();
  const rng = rngDesde(hashSemilla(`ticker:${dia}:${tick}`));
  const nombre = `${NOMBRES_RIVAL[Math.floor(rng() * NOMBRES_RIVAL.length)]} ${10 + Math.floor(rng() * 90)}`;
  const ficha = CATALOGO[Math.floor(rng() * CATALOGO.length)];
  const tipo = Math.floor(rng() * 100);
  const meta = RAREZA_META[ficha.rareza];
  if (tipo < 40) {
    const serial = 1 + Math.floor(rng() * ficha.acunacion);
    return `${nombre} acuñó ${ficha.nombre} Nº${String(serial).padStart(3, "0")}/${ficha.acunacion} · ${meta.etiqueta}`;
  }
  if (tipo < 62) {
    const t = TITULOS[Math.floor(rng() * TITULOS.length)];
    return `${nombre} equipó el título «${t.nombre}»`;
  }
  if (tipo < 80) {
    const prestigio = 200 + Math.floor(rng() * 4800);
    return `${nombre} alcanzó ${separarMiles(prestigio)} de prestigio`;
  }
  if (tipo < 92) {
    return `Un agente anónimo fundió una duplicada ${meta.etiqueta} · la red rumorea`;
  }
  return `Se rumorea que ${ficha.nombre} vuelve a caer esta noche · ${meta.etiqueta}`;
}

// ── MISIONES DIARIAS — el bucle que hace volver mañana ───────
export interface MisionDef {
  id: "sobres" | "fundir" | "presumir";
  texto: string;
  objetivo: number;
  mon: number;
  xp: number;
}

export const MISIONES: MisionDef[] = [
  { id: "sobres", texto: "ABRE 2 SOBRES", objetivo: 2, mon: 40, xp: 12 },
  { id: "fundir", texto: "FUNDE 3 DUPLICADAS", objetivo: 3, mon: 30, xp: 10 },
  { id: "presumir", texto: "PRESUME TU COLECCIÓN", objetivo: 1, mon: 25, xp: 8 },
];

export function progresoMision(estado: EstadoFichas, mision: MisionDef): number {
  if (estado.misionesDia !== diaIso()) return 0;
  return estado.misionesProgreso[mision.id] ?? 0;
}

export function misionReclamada(estado: EstadoFichas, mision: MisionDef): boolean {
  if (estado.misionesDia !== diaIso()) return false;
  return Boolean(estado.misionesReclamadas[mision.id]);
}

// ── TEXTO DE PRESUNCIÓN — el arma del flex ───────────────────
export function textoPresumir(estado: EstadoFichas, vitrina: { def: DefFicha; instancia?: FichaInstancia }[]): string {
  const desglose = calcularPrestigio(estado);
  const titulo = tituloPorId(estado.tituloEquipado);
  const rank = rankingMundial(estado);
  const legendarias = desglose.porRareza.LEGENDARIO;
  const miticas = desglose.porRareza.MITICO;
  const lineas: string[] = [];
  lineas.push("◈ VANGUARD · FICHAS DEL LINAJE ◈");
  lineas.push(`Título: «${titulo?.nombre ?? "SIN TÍTULO"}»`);
  lineas.push(`Prestigio ${separarMiles(desglose.total)} · Top ${rank.pctTop}% del mundo`);
  if (vitrina.length > 0) {
    const piezas = vitrina
      .map(({ def, instancia }) => (instancia ? `${def.nombre} Nº${String(instancia.serial).padStart(3, "0")}/${def.acunacion}` : def.nombre))
      .join(" · ");
    lineas.push(`Vitrina: ${piezas}`);
  } else {
    lineas.push("Vitrina: vacía (oculta tus joyas, ¿verdad?)");
  }
  lineas.push(`Catálogo ${desglose.porRareza ? estado.inventario.filter((i) => !i.fichaId.startsWith("unica-")).length : 0} ejemplares · ${desglose.desbloqueados.length}/${TITULOS.length} títulos`);
  if (miticas > 0) lineas.push(`${miticas} MÍTICA${miticas > 1 ? "S" : ""} en posesión`);
  if (legendarias > 0 && miticas === 0) lineas.push(`${legendarias} LEGENDARIA${legendarias > 1 ? "S" : ""} en posesión`);
  if (estado.inventario.some((i) => i.fichaId.startsWith("unica-"))) {
    lineas.push("Posee ficha(s) 1 DE 1 EN EL MUNDO");
  }
  lineas.push("La colección es para siempre. ¿Y la tuya?");
  return lineas.join("\n");
}

// ── Texto de presunción de una sola carta (celebración) ──────
export function textoPresumirCarta(def: DefFicha, instancia?: FichaInstancia): string {
  const meta = RAREZA_META[def.rareza];
  const serie = instancia ? `Nº${String(instancia.serial).padStart(3, "0")}/${def.acunacion}` : def.acunacion === 1 ? "1/1" : "";
  return [
    `◈ ACUÑÉ ${def.nombre} ${serie} ◈`,
    `${meta.etiqueta} · ${def.elemento} · PODER ${def.poder}`,
    "VANGUARD — FICHAS DEL LINAJE",
    "Solo entra quien se atreve a cruzar el umbral.",
  ].join("\n");
}

// ── Escasez honesta: qué % de la red posee esta rareza ───────
export function pctPosesion(r: RarezaFicha): number {
  // tirada mundial × probabilidad base → plausibilidad simple
  const mundo = 1_000_000;
  const pesos = ORDEN_RAREZA.reduce((s, x) => s + RAREZA_META[x].peso, 0);
  const esperado = (RAREZA_META[r].peso / pesos) * mundo * 2.2; // ~2.2 fichas por agente
  return Math.min(95, Math.max(0.0001, (Math.min(esperado, mundo) / mundo) * 100));
}

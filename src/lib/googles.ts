// v94.0 GOOGLES TOTAL — VANGUARD COMO EL "GOOGLE" DE LOS PROBLEMAS GEOPOLÍTICOS
// El motor de la suite: un índice unificado de TODO el mundo Vanguard (lugares,
// expedientes, entradas oscuras, armas, civilizaciones, documentos, wiki,
// papers académicos y tendencias) con búsqueda rankeada, fichas de conocimiento
// tipo grafo, autocompletado, "Voy a tener suerte" y estadísticas de indexado.
// 100% determinista y sin red: el buscador responde siempre, incluso offline.

import { fnvHash, mulberry32, evaluarNeuronal, type Veredicto } from "./neurona-core";
import { LUGARES } from "./tierra-data";
import { EXPEDIENTES } from "./expedientes";
import { TEORIAS, ARMAS, CIVILIZACIONES, DOCS } from "./oscura-data";
import { generarArticulo, WIKI_IDS } from "./wikiguerra-data";

// ---------- normalización (misma receta que section-search) ----------
function norm(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

// ---------- KINDS ----------
export type GooglesKind =
  | "lugar" | "expediente" | "oscuro" | "arma" | "civil"
  | "documento" | "wiki" | "academico" | "tendencia";

export const KIND_META: Record<GooglesKind, { label: string; hex: string; tag: string }> = {
  lugar:      { label: "Lugar del planeta",   hex: "#FFB347", tag: "MAPA" },
  expediente: { label: "Expediente desclasificado", hex: "#FF6B4A", tag: "ARCHIVO" },
  oscuro:     { label: "Teoría (veredicto)",  hex: "#FF3B30", tag: "OSCURO" },
  arma:       { label: "Arma que cambió todo", hex: "#FFA24D", tag: "ARMAS-IDEA" },
  civil:      { label: "Civilización perdida", hex: "#FFD166", tag: "CIVIS" },
  documento:  { label: "Documento desclasificado", hex: "#E8A54B", tag: "DOCS" },
  wiki:       { label: "WIKIGUERRA (enciclopedia)", hex: "#F2C879", tag: "WIKI" },
  academico:  { label: "Paper académico",     hex: "#F7E7C3", tag: "ACADÉMICO" },
  tendencia:  { label: "Tendencia del planeta", hex: "#FFC94D", tag: "TENDENCIA" },
};

// ---------- PRODUCTOS (el dock de apps tipo "cuadrícula de 9") ----------
export type ProductoId =
  | "buscador" | "tendencias" | "traductor" | "noticias"
  | "academico" | "alertas" | "tierra" | "ojodios" | "wikiguerra";

export interface ProductoGoogles {
  id: ProductoId;
  nombre: string;
  desc: string;
  hex: string;
  tab?: string; // si el producto vive en otra pestaña
}

export const PRODUCTOS: ProductoGoogles[] = [
  { id: "buscador",  nombre: "Buscar",     desc: "El motor de todo el mundo Vanguard", hex: "#FFC94D" },
  { id: "tendencias", nombre: "Tendencias", desc: "Lo que el planeta entero está mirando ahora", hex: "#FFB347" },
  { id: "traductor", nombre: "Traductor",  desc: "8 idiomas, un solo planeta", hex: "#FFA24D" },
  { id: "noticias",  nombre: "Noticias",   desc: "Titulares de todos los frentes, ordenados", hex: "#FF8A5C" },
  { id: "academico", nombre: "Académico",  desc: "Papers y estudios del mundo Vanguard", hex: "#F2C879" },
  { id: "alertas",   nombre: "Alertas",    desc: "Vigila un término: el mundo te avisa", hex: "#FF6B4A" },
  { id: "tierra",    nombre: "V.Earth",    desc: "El planeta entero con contactos en vivo", hex: "#FFB347", tab: "tierra" },
  { id: "ojodios",   nombre: "Ojo de Dios", desc: "El muro infinito de informes", hex: "#FF3B30", tab: "ojodios" },
  { id: "wikiguerra", nombre: "WikiGuerra", desc: "La enciclopedia del conflicto", hex: "#E8A54B", tab: "wikiguerra" },
];

// ---------- ÍNDICE ----------
export interface AccionDoc {
  tipo: "tab" | "producto";
  tab?: string;
  producto?: ProductoId;
}

export interface DocGoogles {
  id: string;
  kind: GooglesKind;
  titulo: string;
  sub: string;
  texto: string;
  tags: string[];
  accion: AccionDoc;
  peso: number; // relevancia base por kind
}

const PESO_KIND: Record<GooglesKind, number> = {
  lugar: 34, expediente: 30, wiki: 28, oscuro: 26, tendencia: 24,
  arma: 22, civil: 20, documento: 20, academico: 18,
};

// ---------- TENDENCIAS ----------
export type EstadoTendencia = "DISPARA" | "AUGE" | "SUBE" | "ESTABLE" | "BAJA";

export interface TerminoTendencia {
  id: string;
  termino: string;
  region: string;
  volumen: number;   // búsquedas por hora (k)
  estado: EstadoTendencia;
  delta: number;     // % vs ayer
  serie: number[];   // 24 puntos (últimas 24 h)
}

const SEMILLA_TENDENCIAS: Array<[string, string]> = [
  ["Valle del Karsk", "Europa Oriental"],
  ["Estrecho de Vand", "Índico"],
  ["Emirato de Sarn", "Golfo"],
  ["República de Karvath", "Europa Oriental"],
  ["Liga de Tarquinia", "Mediterráneo"],
  ["Comarca de Osk", "Europa Oriental"],
  ["Base Meridiana", "Antártida"],
  ["Torre Aurora", "Ártico"],
  ["Cuenca de Zenit", "Índico Austral"],
  ["República de Alvar", "Sudamérica"],
  ["Estrecho de Ormuz", "Golfo"],
  ["Bab el-Mandeb", "Mar Rojo"],
  ["Canal de Suez", "Mediterráneo"],
  ["Estrecho de Taiwán", "Indo-Pacífico"],
  ["Bósforo", "Mar Negro"],
  ["Mar de China Meridional", "Indo-Pacífico"],
  ["Cables del Báltico", "Báltico"],
  ["Insurgencia del Sahel", "África"],
  ["Crisis de Cachemira", "Asia Meridional"],
  ["Crisis del Mar Rojo", "Mar Rojo"],
  ["Grano del Mar Negro", "Mar Negro"],
  ["Drones kamikaze", "Frentes"],
  ["Sanciones al petróleo", "Global"],
  ["Guerra de la fibra", "Ciberespacio"],
];

const REGIONES = [...new Set(SEMILLA_TENDENCIAS.map(([, r]) => r))];

function serieDeTermino(termino: string, dia: number): number[] {
  const rnd = mulberry32(fnvHash(termino) + dia * 7919);
  const base = 8 + rnd() * 90;
  const tendencia = (rnd() - 0.42) * 0.5; // sesgo alcista
  const out: number[] = [];
  let v = base;
  for (let i = 0; i < 24; i++) {
    v = Math.max(2, v + tendencia * 4 + (rnd() - 0.5) * base * 0.34);
    out.push(Math.round(v * 10) / 10);
  }
  return out;
}

function estadoDeSerie(serie: number[]): { estado: EstadoTendencia; delta: number } {
  const primero = serie.slice(0, 6).reduce((a, b) => a + b, 0) / 6;
  const ultimo = serie.slice(-6).reduce((a, b) => a + b, 0) / 6;
  const delta = Math.round(((ultimo - primero) / Math.max(1, primero)) * 100);
  if (delta >= 80) return { estado: "DISPARA", delta };
  if (delta >= 40) return { estado: "AUGE", delta };
  if (delta >= 12) return { estado: "SUBE", delta };
  if (delta <= -18) return { estado: "BAJA", delta };
  return { estado: "ESTABLE", delta };
}

function construirTendencias(): TerminoTendencia[] {
  const dia = Math.floor(Date.now() / 86_400_000);
  return SEMILLA_TENDENCIAS.map(([termino, region]) => {
    const serie = serieDeTermino(termino, dia);
    const { estado, delta } = estadoDeSerie(serie);
    const rnd = mulberry32(fnvHash(termino + "vol") + dia);
    const volumen = Math.round((serie[23] * (1.4 + rnd() * 2.2)) * 10) / 10;
    return { id: "tend:" + norm(termino).replace(/\s+/g, "-"), termino, region, volumen, estado, delta, serie };
  });
}

export function serieViva(t: TerminoTendencia): number[] {
  // desplaza la serie un poco según la hora actual para que "respire" sin cambiar de día
  const h = new Date().getUTCHours();
  return t.serie.map((v, i) => Math.round(Math.max(1, v * (0.9 + 0.2 * Math.sin((i + h) / 3.1))) * 10) / 10);
}

// ---------- ACADÉMICO ----------
export interface PaperGoogles {
  id: string;
  titulo: string;
  autores: string[];
  revista: string;
  year: number;
  citas: number;
  abstracto: string;
}

const REVISTAS = [
  "Revista Vanguard de Asuntos Globales",
  "Cuadernos del Karsk",
  "Anales del Índico",
  "Estudios de Vand",
  "Política Exterior Vanguard",
  "Boletín de la Base Meridiana",
];

const AUTORES = [
  "E. Cansado de Bóveda", "R. Malalhue", "T. Ferreira", "A. de Sarn-Bakhour",
  "L. Okonkwo", "M. Karska", "J. Vandel", "N. Turquinia",
  "H. Aurvandil", "S. Meridiana-Vega", "K. Ostrowska", "F. del Estrecho",
];

const SEMILLA_PAPERS: Array<[string, string]> = [
  ["Escalada y gargantas: por qué 39 kilómetros de agua deciden el precio del mundo", "Modelo de tres variables (tráfico, seguros, retórica) que anticipa cierres de gargantas oceánicas con 11 días de antelación en el teatro del Índico."],
  ["La economía del convoy: logró nocturno y attrition en el Valle del Karsk", "Once puntos que cambian de mano cada noche: análisis de 400 simulaciones de la Línea del Frente y qué predice quién aguanta."],
  ["Islas escritas en hormigón: reclamaciones marítimas como gramática visual", "Cómo las estructuras artificiales del Mar de China Meridional funcionan como enunciados diplomáticos legibles desde la órbita."],
  ["Hidrófonos y silencios: la acústica militar de la Cuenca de Zenit", "Catálogo de firmas sonoras no identificadas en el Índico austral y la curva de confianza del núcleo neuronal al clasificarlas."],
  ["El grano como arma: tres cadenas, dos estrechos y un precio del pan", "Interdependencia alimentaria en el Mar Negro: un modelo de difusión de choques entre Róterdam y El Cairo."],
  ["Refinamientos y manifiestos: la doctrina exterior de Karvath", "Estudio comparado de la guardia fronteriza karvathi: disuasión por expediente, disuasión por manifiesto."],
  ["Fibra partida: sabotaje submarino y la nueva patrulla del Báltico", "Cincuenta y dos cortes de cable 'accidentales' en una década: patrón, estacionalidad y bandera del buque reparador."],
  ["Colecciones de misiles y diplomacia de vitrina: el caso Sarn", "Cuando el arsenal es museo: la exhibición de sistemas como mensaje a los buques de Malaca."],
  ["La ciudad-república vuelve: Tarquinia y la política de radar", "Veintidós ciudades, una tinta: el confederalismo mediterráneo como protocolo de escalada controlada."],
  ["Referéndum y golpe: tres ciclos políticos de la República de Alvar", "Selva, soja y constituciones rotatorias: una serie de tiempo de inestabilidad hemisférica."],
  ["Auroras y escuadras: ionosfera como variable estratégica del Ártico", "Por qué toda la flota del Báltico sale a superficie cuando la Torre Aurora anuncia tormenta geomagnética."],
  ["El pan y el flete: coste logístico de un cierre de Suez (revisión)", "Meta-análisis de seis episodios de bloqueo y su firma en el precio del contenedor durante 90 días."],
  ["Drones kamikaze y la gramática del frente barato", "Cambió el coste de destruir: modelado del intercambio dron-convoy y su efecto en la moral de la retaguardia."],
  ["Meridiana bajo hielo: radar de banda ancha en latitudes extremas", "Anomalías de propagación polar y qué aprende un ojo sintético cuando el cielo completo se convierte en sensor."],
  ["Sanciones por vía marítima: la sombra de los buques de bandera dudosa", "Redes de renacimiento de bandera en cuatro teatros: topología, persistencia y detección temprana."],
  ["El Bósforo de 1936: una convención que sigue decidiendo guerras", "Derecho de paso, buques de guerra y el parachoques diplomático más viejo que sigue en pie."],
  ["Ciberescenarios sobre arena: la guerra de la fibra y los puertos", "Simulación de ataques encadenados a terminales container y el índice de resiliencia Vanguard por garganta."],
  ["Escuchar el planeta: arquitectura del núcleo neuronal Vanguard v3", "Del lexicón de escalada al veredicto reproducible: rasgos, pesos, sigmoide y explicabilidad como contrato de diseño."],
];

function construirPapers(): PaperGoogles[] {
  return SEMILLA_PAPERS.map(([titulo, abstracto], i) => {
    const rnd = mulberry32(fnvHash(titulo));
    const nAutores = 1 + Math.floor(rnd() * 3);
    const autores: string[] = [];
    for (let k = 0; k < nAutores; k++) {
      autores.push(AUTORES[(fnvHash(titulo + k) + k * 7) % AUTORES.length]);
    }
    const year = 2021 + Math.floor(rnd() * 5);
    const citas = Math.round(4 + rnd() * 260);
    return {
      id: "pap:" + norm(titulo).slice(0, 24).replace(/\s+/g, "-"),
      titulo, autores, revista: REVISTAS[i % REVISTAS.length], year, citas, abstracto,
    };
  });
}

export function citacionAPA(p: PaperGoogles): string {
  return `${p.autores.map((a) => a.split(" ").reverse().join(", ")).join(" & ")} (${p.year}). ${p.titulo}. ${p.revista}, ${12 + (fnvHash(p.id) % 30)}, ${100 + (fnvHash(p.titulo) % 700)}–${100 + (fnvHash(p.id) % 700)}. Vanguard Académico.`;
}

export function citacionMLA(p: PaperGoogles): string {
  return `${p.autores[0]}, et al. "${p.titulo}." ${p.revista}, vol. ${3 + (fnvHash(p.id) % 20)}, ${p.year}, pp. ${100 + (fnvHash(p.titulo) % 700)}–${100 + (fnvHash(p.id) % 700)}.`;
}

// ---------- CONSTRUCCIÓN DEL ÍNDICE ----------
function construirIndice(): DocGoogles[] {
  const docs: DocGoogles[] = [];

  // 47 lugares de VANGUARD EARTH
  for (const l of LUGARES) {
    docs.push({
      id: "lugar:" + l.id,
      kind: "lugar",
      titulo: l.nombre,
      sub: l.tipo === "ficticio" ? "Teatro del mundo Vanguard" : l.tipo === "ciudad" ? "Ciudad centinela" : l.tipo === "estrecho" ? "Garganta oceánica" : l.tipo === "mar" ? "Mar vigilado" : "Base de la red",
      texto: l.nota,
      tags: [l.tipo, "coordenadas", "geografía", "estratégico", l.nombre],
      accion: { tipo: "tab", tab: "tierra" },
      peso: PESO_KIND.lugar,
    });
  }

  // 23 expedientes desclasificados
  for (const e of EXPEDIENTES) {
    docs.push({
      id: "exp:" + e.id,
      kind: "expediente",
      titulo: e.titulo,
      sub: `${e.agencia} · ${e.year} · ${e.cat}`,
      texto: e.desc,
      tags: [e.agencia, e.year, e.cat, e.rareza, "desclasificado", "secreto"],
      accion: { tipo: "tab", tab: "expedientes" },
      peso: PESO_KIND.expediente,
    });
  }

  // 43 entradas de Alejandría Oscura
  for (const t of TEORIAS) {
    docs.push({
      id: "osc:" + t.id,
      kind: "oscuro",
      titulo: t.titulo,
      sub: `Teoría · veredicto ${t.veredicto}`,
      texto: `${t.creencia} ${t.realidad}`,
      tags: [t.veredicto, "teoría", "mito", "desclasificado"],
      accion: { tipo: "tab", tab: "oscura" },
      peso: PESO_KIND.oscuro,
    });
  }
  for (const a of ARMAS) {
    docs.push({
      id: "arm:" + a.id,
      kind: "arma",
      titulo: a.titulo,
      sub: `Arma-idea · ${a.epoca}`,
      texto: `${a.idea} ${a.legado}`,
      tags: [a.epoca, "arma", "tecnología", "idea"],
      accion: { tipo: "tab", tab: "oscura" },
      peso: PESO_KIND.arma,
    });
  }
  for (const c of CIVILIZACIONES) {
    docs.push({
      id: "civ:" + c.id,
      kind: "civil",
      titulo: c.titulo,
      sub: `Civilización perdida · ${c.epoca}`,
      texto: `${c.que} ${c.misterio}`,
      tags: [c.epoca, "civilización", "arqueología", "imperio"],
      accion: { tipo: "tab", tab: "oscura" },
      peso: PESO_KIND.civil,
    });
  }
  for (const d of DOCS) {
    docs.push({
      id: "doc:" + d.id,
      kind: "documento",
      titulo: d.titulo,
      sub: `Sala de documentos · ${d.tag}`,
      texto: d.desc,
      tags: [d.tag, "documento", "desclasificado", "archivo", "PDF"],
      accion: { tipo: "tab", tab: "oscura" },
      peso: PESO_KIND.documento,
    });
  }

  // 5 artículos de WIKIGUERRA
  for (const wid of WIKI_IDS) {
    try {
      const a = generarArticulo(wid);
      docs.push({
        id: "wiki:" + a.id,
        kind: "wiki",
        titulo: a.titulo,
        sub: `WIKIGUERRA · ${a.categorias[0] ?? "conflicto"}`,
        texto: a.extracto,
        tags: a.categorias,
        accion: { tipo: "tab", tab: "wikiguerra" },
        peso: PESO_KIND.wiki,
      });
    } catch { /* wiki nunca debe romper el índice */ }
  }

  // 18 papers académicos
  for (const p of construirPapers()) {
    docs.push({
      id: p.id,
      kind: "academico",
      titulo: p.titulo,
      sub: `${p.revista} · ${p.year} · ${p.citas} citas`,
      texto: p.abstracto,
      tags: [...p.autores, p_revista_tag(p.revista)],
      accion: { tipo: "producto", producto: "academico" },
      peso: PESO_KIND.academico,
    });
  }

  // 24 tendencias
  for (const t of construirTendencias()) {
    docs.push({
      id: t.id,
      kind: "tendencia",
      titulo: t.termino,
      sub: `Tendencia · ${t.region} · ${t.volumen}k/hora`,
      texto: `Lo que el planeta está buscando ahora sobre ${t.termino}. Volumen ${t.volumen} mil búsquedas por hora, tendencia ${t.estado} (${t.delta > 0 ? "+" : ""}${t.delta}% en 24 h).`,
      tags: [t.region, "tendencia", "en vivo", "búsquedas"],
      accion: { tipo: "producto", producto: "tendencias" },
      peso: PESO_KIND.tendencia,
    });
  }

  return docs;
}

// helper pequeño para no ensuciar el spread de tags
function p_revista_tag(revista: string): string {
  return revista.split(" ").slice(0, 2).join(" ");
}

export const INDICE_GOOGLES: DocGoogles[] = construirIndice();
export const TENDENCIAS: TerminoTendencia[] = construirTendencias();
export const PAPERS: PaperGoogles[] = construirPapers();

export function estadisticasIndice(): { total: number; porKind: Record<string, number> } {
  const porKind: Record<string, number> = {};
  for (const d of INDICE_GOOGLES) porKind[d.kind] = (porKind[d.kind] ?? 0) + 1;
  return { total: INDICE_GOOGLES.length, porKind };
}

// ---------- BÚSQUEDA ----------
export interface ResultadoGoogles {
  doc: DocGoogles;
  score: number;
  snippet: string;
}

export interface FichaGoogles {
  doc: DocGoogles;
  filas: Array<[string, string]>;
  veredicto: Veredicto;
  relacionados: string[];
}

export interface RespuestaBusqueda {
  resultados: ResultadoGoogles[];
  total: number;
  ms: number;
  ficha: FichaGoogles | null;
  relacionadas: string[];
  corregido: string | null;
}

function snippetDe(texto: string, tokens: string[]): string {
  const n = norm(texto);
  let pos = -1;
  for (const tk of tokens) {
    const p = n.indexOf(tk);
    if (p >= 0 && (pos < 0 || p < pos)) pos = p;
  }
  if (pos < 0) return texto.slice(0, 170).trim() + (texto.length > 170 ? "…" : "");
  const ini = Math.max(0, pos - 70);
  const fin = Math.min(texto.length, pos + 110);
  return (ini > 0 ? "…" : "") + texto.slice(ini, fin).trim() + (fin < texto.length ? "…" : "");
}

export function buscarGoogles(q: string, filtro: GooglesKind | "todo" = "todo", max = 9): RespuestaBusqueda {
  const query = q.trim();
  const nq = norm(query);
  const tokens = nq.split(/\s+/).filter(Boolean);
  const ms = 11 + (fnvHash(nq || "vanguard") % 128);

  if (!tokens.length) {
    return { resultados: [], total: 0, ms, ficha: null, relacionadas: [], corregido: null };
  }

  const pool = filtro === "todo" ? INDICE_GOOGLES : INDICE_GOOGLES.filter((d) => d.kind === filtro);
  const scores: Array<{ doc: DocGoogles; score: number }> = [];

  for (const d of pool) {
    const nt = norm(d.titulo);
    const ntags = norm(d.tags.join(" ") + " " + d.sub);
    const ntexto = norm(d.texto);
    let score = 0;
    let okTodos = true;
    for (const tk of tokens) {
      let hit = 0;
      if (nt.startsWith(tk)) hit += 3.2;
      else if (nt.includes(tk)) hit += 2.4;
      if (ntags.includes(tk)) hit += 1.3;
      if (ntexto.includes(tk)) hit += 0.7;
      if (hit === 0) { okTodos = false; break; }
      score += hit;
    }
    if (!okTodos) continue;
    scores.push({ doc: d, score: score * 10 + d.peso });
  }

  scores.sort((a, b) => b.score - a.score);
  const total = scores.length;

  // ficha de conocimiento: coincidencia exacta de título del primer resultado
  let ficha: FichaGoogles | null = null;
  if (scores.length) {
    const primero = scores[0].doc;
    const nt = norm(primero.titulo);
    const esFicha = nt === nq || (tokens.length <= 3 && nt.startsWith(nq) && scores[0].score >= (primero.peso + 24));
    if (esFicha) {
      const filas: Array<[string, string]> = [["Tipo", KIND_META[primero.kind].label], ["Índice", primero.sub]];
      if (primero.kind === "lugar") {
        const l = LUGARES.find((x) => "lugar:" + x.id === primero.id);
        if (l) filas.push(["Coordenadas", `${Math.abs(l.lat).toFixed(2)}° ${l.lat >= 0 ? "N" : "S"} / ${Math.abs(l.lng).toFixed(2)}° ${l.lng >= 0 ? "E" : "O"}`], ["Clase", l.tipo]);
      }
      if (primero.kind === "expediente") {
        const e = EXPEDIENTES.find((x) => "exp:" + x.id === primero.id);
        if (e) filas.push(["Agencia", e.agencia], ["Clasificación original", e.clasificacion], ["Rareza", e.rareza]);
      }
      const veredicto = evaluarNeuronal(primero.texto);
      const relacionados = INDICE_GOOGLES
        .filter((d) => d.id !== primero.id && d.tags.some((tg) => primero.tags.includes(tg) || norm(d.titulo).includes(tokens[0])))
        .slice(0, 4)
        .map((d) => d.titulo);
      ficha = { doc: primero, filas, veredicto, relacionados };
    }
  }

  // búsquedas relacionadas (títulos que comparten primer token)
  const vistas = new Set<string>();
  const relacionadas: string[] = [];
  for (const tk of tokens) {
    for (const d of INDICE_GOOGLES) {
      const nt = norm(d.titulo);
      if (nt.includes(tk) && !vistas.has(nt) && norm(scores[0]?.doc.titulo ?? "") !== nt) {
        vistas.add(nt);
        relacionadas.push(d.titulo);
        if (relacionadas.length >= 8) break;
      }
    }
    if (relacionadas.length >= 8) break;
  }

  // corrección ortográfica ingenua: si 0 resultados, prueba prefijos de 1 token
  let corregido: string | null = null;
  if (!total) {
    const tk0 = tokens[0];
    for (const d of INDICE_GOOGLES) {
      const nt = norm(d.titulo);
      if (nt.startsWith(tk0.slice(0, Math.max(3, tk0.length - 2)))) {
        corregido = d.titulo;
        break;
      }
    }
  }

  return {
    resultados: scores.slice(0, max).map(({ doc, score }) => ({ doc, score, snippet: snippetDe(doc.texto, tokens) })),
    total, ms, ficha, relacionadas, corregido,
  };
}

// ---------- AUTOCOMPLETADO ----------
export function sugerenciasGoogles(q: string, max = 8): string[] {
  const nq = norm(q.trim());
  if (!nq) {
    // sugerencias frías: 3 tendencias + 2 productos
    return TENDENCIAS.slice(0, 3).map((t) => t.termino).concat(["Expedientes desclasificados", "Estrecho de Ormuz"]);
  }
  const empiezan: string[] = [];
  const contienen: string[] = [];
  const vistas = new Set<string>();
  for (const d of INDICE_GOOGLES) {
    const nt = norm(d.titulo);
    if (vistas.has(nt)) continue;
    if (nt.startsWith(nq)) { empiezan.push(d.titulo); vistas.add(nt); }
    else if (nt.includes(nq)) { contienen.push(d.titulo); vistas.add(nt); }
  }
  for (const t of TENDENCIAS) {
    const nt = norm(t.termino);
    if (!vistas.has(nt) && nt.startsWith(nq)) { empiezan.push(t.termino); vistas.add(nt); }
  }
  const out = [...empiezan, ...contienen];
  if (out.length < max && !nq.endsWith(" ")) {
    out.push(q.trim() + " en el Valle del Karsk");
    out.push("quién controla " + q.trim());
  }
  return out.slice(0, max);
}

// ---------- SUERTE ----------
export function suerteGoogles(): DocGoogles {
  const dia = Math.floor(Date.now() / 86_400_000);
  const rnd = mulberry32(fnvHash("suerte" + dia + new Date().getUTCHours()));
  return INDICE_GOOGLES[Math.floor(rnd() * INDICE_GOOGLES.length)];
}

// ---------- RECOMPENSAS ----------
export const BUSQUEDA_REWARD = { coins: 8, xp: 5 };
export const BUSQUEDA_MAX_DIA = 5;

export function dayKeyUtc(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

// ═══════════════════════════════════════════════════════════════════
// v405.10 · EL CATÁLOGO DE DESTINOS — una sola verdad, derivada
//
// La casa tiene hoy seis navegaciones y, dentro de ellas, los mismos sitios
// repetidos con nombres distintos: el mapa 3D es una sala del cuartel Y una
// ruta (/mundo); el atlas es una sala Y una ruta (/atlas); las salas del
// cuartel son 155 pestañas Y 20 constelaciones Y 9 módulos Y 155 puertas
// (/sala/<clave>).
//
// Este archivo NO vuelve a escribir esa lista: la DERIVA de las fuentes que ya
// existen (mapa-salas.ts, modulos.ts) y le añade, con nombre y apellidos, las
// rutas que ninguna de las dos conocía todavía. Así, cuando la otra IA corra
// `generar-mapa-salas.mjs`, este catálogo se actualiza solo.
//
// Y de ahí sale la FUSIÓN, que tampoco se escribe a mano: dos destinos con la
// misma familia son el mismo asunto con dos puertas; se declara la canónica y
// las demás siguen funcionando como alias. Nada se cierra.
// ═══════════════════════════════════════════════════════════════════

import { CONSTELACIONES, SALAS_MAPA } from "@/lib/vanguard/mapa-salas";
import { MODULOS_PUBLICOS } from "@/components/portada/modulos";
import { espacioDe } from "./contexto";
import type { ClaveEspacio, Destino, Fusion } from "./tipos";

/** Rutas vivas que ninguna de las dos fuentes conoce todavía y que la
 *  navegación adaptativa debe poder ofrecer igual. Cada entrada es real. */
const RUTAS_VIVAS: { href: string; nombre: string; corto: string; sub: string; desde: string }[] = [
  { href: "/mapas", nombre: "Centro de mapas", corto: "MAPA", sub: "Las ocho capas geográficas sobre el globo", desde: "v405.9" },
  { href: "/navegacion", nombre: "Navegación adaptativa", corto: "NAV", sub: "Los once espacios, sus herramientas y sus fusiones", desde: "v405.10" },
  { href: "/espacio", nombre: "Espacio de trabajo", corto: "MI MESA", sub: "Proyectos con piezas, paneles, sesiones, historial y papelera", desde: "v405.11" },
];

/** Familias que son el mismo asunto con dos puertas. Se declaran UNA vez.
 *  La clave es el nombre normalizado del destino; el valor, la familia. */
const FAMILIA: Record<string, string> = {
  mapa: "mapa",
  mapas: "mapa",
  "mapa-3d": "mapa",
  mundo: "mapa",
  "mundo-3d": "mapa",
  planeta: "mapa",
  tierra: "mapa",
  atlas: "atlas",
  "atlas-mundial": "atlas",
  modulos: "indice-de-salas",
  salas: "indice-de-salas",
  cuartel: "indice-de-salas",
  constelacion: "indice-de-salas",
  galeria: "medios",
  medios: "medios",
  imagenes: "medios",
  audios: "medios",
  videos: "medios",
  redaccion: "redaccion",
  noticias: "redaccion",
  inicio: "redaccion",
  centro: "redaccion",
  divisas: "dinero",
  mercado: "dinero",
  bolsa: "dinero",
  universo: "colecciones",
  "daily-universe": "colecciones",
  archivo: "archivo",
  "archivo-mundial": "archivo",
  historia: "archivo",
  catalogo: "archivo",
  escenarios: "simulacion",
  simulador: "simulacion",
  "teatro-3d": "teatro",
  teatro3d: "teatro",
  guerra: "conflicto",
  conflictos: "conflicto",
  "guerra-hoy": "conflicto",
  estado: "la-casa",
  calidad: "la-casa",
  torre: "la-casa",
  escudo: "la-casa",
  nucleo: "la-casa",
};

const limpiar = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function familiaDe(nombre: string, clave: string): string {
  const k = limpiar(clave);
  return FAMILIA[k] ?? k ?? limpiar(nombre);
}

function destinoRuta(href: string, nombre: string, corto: string, sub: string): Destino {
  const clave = href.replace(/^\//, "").split("/")[0] || "portada";
  return {
    id: `ruta:${href}`,
    tipo: "ruta",
    nombre,
    corto,
    familia: familiaDe(nombre, clave),
    sub,
    href,
    espacio: espacioDe(href),
    origen: "modulos",
  };
}

/** ① las rutas de los nueve módulos (46 salas públicas con su href real) */
function destinosDeRutas(): Destino[] {
  const vistos = new Set<string>();
  const out: Destino[] = [];
  for (const m of MODULOS_PUBLICOS) {
    for (const p of m.pestanas) {
      if (vistos.has(p.href)) continue;
      vistos.add(p.href);
      out.push(destinoRuta(p.href, `${p.label} · ${m.nombre}`, p.label.toUpperCase(), m.lema));
    }
  }
  for (const r of RUTAS_VIVAS) {
    if (vistos.has(r.href)) continue;
    vistos.add(r.href);
    out.push({ ...destinoRuta(r.href, r.nombre, r.corto, r.sub), origen: "rutas-vivas" });
  }
  return out;
}

/** ② las 155 salas del cuartel (generadas de tab-nav.tsx) */
function destinosDeSalas(): Destino[] {
  return SALAS_MAPA.map((s) => ({
    id: `sala:${s.clave}`,
    tipo: "sala" as const,
    nombre: s.nombre,
    corto: s.corto,
    familia: familiaDe(s.corto, s.clave),
    sub: `${s.constelacion} · ${s.nombre}`,
    href: `/cuartel?sala=${s.clave}`,
    color: s.color,
    espacio: espacioDe(`/cuartel?sala=${s.clave}`),
    origen: "mapa-salas" as const,
  }));
}

/** ③ las 20 constelaciones (la vista de conjunto de las salas) */
function destinosDeConstelaciones(): Destino[] {
  return CONSTELACIONES.map((c) => ({
    id: `constelacion:${c.clave}`,
    tipo: "constelacion" as const,
    nombre: c.nombre,
    corto: c.corto,
    familia: familiaDe(c.corto, c.clave),
    sub: `${c.salas.length} ${c.salas.length === 1 ? "sala" : "salas"} · ${c.desc}`,
    href: `/constelacion/${c.clave}`,
    color: c.color,
    espacio: espacioDe(`/constelacion/${c.clave}`),
    origen: "constelaciones" as const,
  }));
}

/** EL CATÁLOGO: todo lo que existe, cada cosa una vez, con su espacio. */
export const CATALOGO: Destino[] = [...destinosDeRutas(), ...destinosDeSalas(), ...destinosDeConstelaciones()];

export const POR_ID: Record<string, Destino> = CATALOGO.reduce((acc, d) => {
  acc[d.id] = d;
  return acc;
}, {} as Record<string, Destino>);

/** Cuántos destinos hay de cada tipo (para la sala de auditoría). */
export const TOTALES = {
  destinos: CATALOGO.length,
  rutas: CATALOGO.filter((d) => d.tipo === "ruta").length,
  salas: CATALOGO.filter((d) => d.tipo === "sala").length,
  constelaciones: CATALOGO.filter((d) => d.tipo === "constelacion").length,
};

/** Un destino por href (los módulos repiten href entre módulos). */
export const POR_HREF: Record<string, Destino> = CATALOGO.reduce((acc, d) => {
  if (!acc[d.href]) acc[d.href] = d;
  return acc;
}, {} as Record<string, Destino>);

export function destinosDeEspacio(clave: ClaveEspacio): Destino[] {
  return CATALOGO.filter((d) => d.espacio === clave);
}

/** Un destino por familia y espacio (para rellenar los vecinos sin ruido). */
export function canonicosDeEspacio(clave: ClaveEspacio): Destino[] {
  const vistos = new Set<string>();
  const out: Destino[] = [];
  for (const d of destinosDeEspacio(clave)) {
    if (vistos.has(d.familia)) continue;
    vistos.add(d.familia);
    out.push(d);
  }
  return out;
}

/**
 * LAS FUSIONES, DERIVADAS: una familia con más de una puerta.
 * Regla del canónico (la misma siempre, para que nadie se pregunte por qué):
 *  ① una ruta propia gana a una sala del cuartel (enlace profundo y compartible);
 *  ② entre rutas, la más corta;
 *  ③ entre salas, la primera del mapa de salas (el orden del cuartel).
 * Las demás NO se cierran: siguen siendo alias navegables y buscables.
 */
const MOTIVOS: Record<string, string> = {
  mapa: "El mapa de la casa tiene tres puertas: el globo del mundo (/mundo), la sala histórica del cuartel (mapa) y el centro de mapas nuevo (/mapas). Las tres se quedan; /mapas es la entrada porque es la única que declara capas y fuentes.",
  atlas: "El atlas vive como sala del cuartel y como ruta propia. La ruta gana: se puede compartir y sale en el mapa de Google.",
  "indice-de-salas": "El índice de las 155 salas tiene cuatro puertas: /modulos, /cuartel, las constelaciones y las puertas /sala/<clave>. La canónica es /modulos, la única pensada para mirar el conjunto.",
  medios: "Los medios están repartidos entre /galeria y cuatro salas. /galeria manda porque junta imagen, audio y directo en un solo sitio.",
  dinero: "Las divisas, la bolsa y el mercado se pisaban. /divisas es la puerta de los datos; la bolsa y las apuestas siguen en el cuartel, donde se juegan.",
};

export function fusiones(): Fusion[] {
  const porFamilia = new Map<string, Destino[]>();
  for (const d of CATALOGO) {
    const lista = porFamilia.get(d.familia) ?? [];
    lista.push(d);
    porFamilia.set(d.familia, lista);
  }
  const out: Fusion[] = [];
  for (const [familia, lista] of porFamilia) {
    if (lista.length < 2) continue;
    const rutas = lista.filter((d) => d.tipo === "ruta").sort((a, b) => a.href.length - b.href.length);
    const canonico = rutas[0] ?? lista.find((d) => d.tipo === "sala") ?? lista[0];
    out.push({
      familia,
      canonico,
      alias: lista.filter((d) => d.id !== canonico.id),
      motivo:
        MOTIVOS[familia] ??
        `«${familia}» tiene ${lista.length} puertas en la casa (${lista.map((d) => d.corto).join(", ")}). Se declara ${canonico.corto} como entrada y las demás siguen funcionando.`,
    });
  }
  return out.sort((a, b) => b.alias.length - a.alias.length || a.familia.localeCompare(b.familia));
}

/** Resumen de la auditoría, para la sala /navegacion y para el informe. */
export function auditoria() {
  const f = fusiones();
  return {
    ...TOTALES,
    familias: new Set(CATALOGO.map((d) => d.familia)).size,
    familiasConVariasPuertas: f.length,
    puertasDuplicadas: f.reduce((t, x) => t + x.alias.length, 0),
    porOrigen: {
      modulos: CATALOGO.filter((d) => d.origen === "modulos").length,
      mapaSalas: CATALOGO.filter((d) => d.origen === "mapa-salas").length,
      constelaciones: CATALOGO.filter((d) => d.origen === "constelaciones").length,
      rutasVivas: CATALOGO.filter((d) => d.origen === "rutas-vivas").length,
    },
  };
}

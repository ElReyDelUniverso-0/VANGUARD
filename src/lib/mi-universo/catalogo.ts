// ═══════════════════════════════════════════════════════════════════
// v421.8 · MY UNIVERSE — EL CATÁLOGO
//
// De dónde salen las piezas: de las estructuras que YA declaran las salas de
// la casa, no de una lista escrita a mano.
//   · MODULOS (src/components/portada/modulos.ts) — los nueve módulos y sus
//     pestañas, que son las salas reales.
//   · ESPACIOS (src/lib/navegacion/espacios.ts) — los once espacios de trabajo
//     con sus herramientas y su color.
// Así una sala nueva aparece en la paleta sola, y ninguna pieza puede apuntar
// a una URL que no exista: aquí no se inventa ni un href.
//
// REGLA: una pieza = una PUERTA a una sala real. My Universe no reimplementa
// herramientas: las organiza. Nada de copias independientes.
// ═══════════════════════════════════════════════════════════════════
import { MODULOS } from "@/components/portada/modulos";
import { ESPACIOS } from "@/lib/navegacion/espacios";

export type PiezaCatalogo = {
  /** identidad estable de la pieza en el catálogo */
  clave: string;
  nombre: string;
  /** ruta real de la casa (nunca inventada) */
  href: string;
  grupo: string;
  desc: string;
  acento: string;
};

const ACENTO_MODULO = "#e8c56a";

function deModulos(): PiezaCatalogo[] {
  const salida: PiezaCatalogo[] = [];
  for (const m of MODULOS) {
    salida.push({
      clave: `modulo:${m.id}`,
      nombre: m.nombre,
      href: m.nav,
      grupo: "Módulos",
      desc: m.lema || m.gancho,
      acento: ACENTO_MODULO,
    });
    for (const p of m.pestanas) {
      if (!p.href || p.href === m.nav) continue;
      salida.push({
        clave: `sala:${p.href}`,
        nombre: p.label,
        href: p.href,
        grupo: m.nombre,
        desc: p.txt ?? m.gancho ?? m.lema,
        acento: ACENTO_MODULO,
      });
    }
  }
  return salida;
}

function deEspacios(): PiezaCatalogo[] {
  const salida: PiezaCatalogo[] = [];
  for (const e of ESPACIOS) {
    for (const t of e.herramientas) {
      if (!t.href || !t.href.startsWith("/")) continue;
      salida.push({
        clave: `herramienta:${t.id}`,
        nombre: t.nombre,
        href: t.href,
        grupo: e.nombre,
        desc: t.desc ?? e.lema,
        acento: e.color ?? ACENTO_MODULO,
      });
    }
  }
  return salida;
}

/** Una entrada por ruta: si dos registros apuntan al mismo sitio, manda el primero. */
function sinRepetir(lista: PiezaCatalogo[]): PiezaCatalogo[] {
  const vistos = new Set<string>();
  const claves = new Set<string>();
  const salida: PiezaCatalogo[] = [];
  for (const p of lista) {
    if (vistos.has(p.href) || claves.has(p.clave)) continue;
    vistos.add(p.href);
    claves.add(p.clave);
    salida.push(p);
  }
  return salida;
}

export const CATALOGO: PiezaCatalogo[] = sinRepetir([...deModulos(), ...deEspacios()]);

/** Los grupos en el orden en que se declaran (Módulos primero, luego la casa). */
export const GRUPOS: string[] = [...new Set(CATALOGO.map((p) => p.grupo))];

const POR_CLAVE = new Map(CATALOGO.map((p) => [p.clave, p]));

export const piezaDe = (clave: string): PiezaCatalogo | undefined => POR_CLAVE.get(clave);

/**
 * Lo que trae un espacio recién creado.
 * v421.8.1 — se eligen por RUTA, no por clave: el catálogo deduplica por href,
 * así que escribir claves a mano dejaba el espacio de arranque con dos piezas
 * de seis (medido). Una ruta sólo puede tener un dueño, y aquí se pide ese.
 */
const ARRANQUE = ["/guerra-hoy", "/conflictos", "/mapas", "/conocimiento", "/investigacion", "/espacio"];

export const CLAVES_INICIALES: string[] = (() => {
  const porRuta = new Map(CATALOGO.map((p) => [p.href, p.clave]));
  const elegidas = ARRANQUE.map((h) => porRuta.get(h)).filter((c): c is string => !!c);
  // si algún día la casa renombra esas rutas, el arranque sigue teniendo contenido
  for (const p of CATALOGO) {
    if (elegidas.length >= 6) break;
    if (!elegidas.includes(p.clave)) elegidas.push(p.clave);
  }
  return elegidas.slice(0, 6);
})();

/** Buscador de la paleta: nombre, grupo o descripción. */
export function buscar(consulta: string): PiezaCatalogo[] {
  const q = consulta.trim().toLowerCase();
  if (!q) return CATALOGO;
  return CATALOGO.filter(
    (p) =>
      p.nombre.toLowerCase().includes(q) ||
      p.grupo.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q),
  );
}

/** Sólo para las pruebas: garantiza que el catálogo no está vacío ni roto. */
export const CIFRAS_CATALOGO = {
  piezas: CATALOGO.length,
  grupos: GRUPOS.length,
  modulos: MODULOS.length,
  espacios: ESPACIOS.length,
} as const;

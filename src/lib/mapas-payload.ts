// ═══════════════════════════════════════════════════════════════════
// v405.9 · LA CARGA DEL CENTRO DE MAPAS — server → cliente, sin duplicar.
//
// El cliente no calcula geografía: recibe el planeta ya resuelto. Aquí se
// unen las cuatro identidades de un país (Natural Earth numérico, ISO-3 del
// Banco Mundial, ISO-2 de las banderas y el nombre en español) y se prepara,
// por capa, el color y el valor de cada polígono.
//
// Esto es lo que hace barata la novena capa: añadir una capa al registro
// (`mapas-capas.ts`) hace que este archivo la resuelva sola.
// ═══════════════════════════════════════════════════════════════════

import { PAISES_GEO, POR_ISO3, type PaisGeo } from "./geo-paises";
import {
  CAPAS,
  PUNTOS_ACONTECIMIENTOS,
  PUNTOS_HISTORICOS,
  PAISES_POR_ACONTECIMIENTO,
  colorDeValor,
  coberturaDeCapa,
  type CapaMapa,
} from "./mapas-capas";
import { SEMILLA_ACONTECIMIENTOS } from "./nucleo/acontecimientos";
import { PODER_FILAS } from "./poder-data";
import { WORLD_CURRENCIES_FULL } from "./world-data";

export interface AcontecimientoDePais {
  slug: string;
  titulo: string;
  estado: string;
  href: string;
}

export interface FichaPais {
  iso3: string;
  iso2: string;
  nombre: string;
  region: string;
  subregion: string;
  lat: number;
  lng: number;
  /** capaId → valor ya formateado */
  valores: Record<string, string>;
  acontecimientos: AcontecimientoDePais[];
}

export interface CapaCliente {
  id: string;
  nombre: string;
  pregunta: string;
  fuente: string;
  tipo: CapaMapa["tipo"];
  textura?: "oscuridad" | "satelite" | "noche";
  escala?: { min: number; max: number; unidad: string; minTexto: string; maxTexto: string };
  categorias?: { clave: string; etiqueta: string; color: string }[];
  /** id numérico del país → color del polígono */
  colores: Record<string, string>;
  /** id numérico del país → valor formateado (tooltip) */
  valores: Record<string, string>;
  cobertura: { conDato: number; conPoligono: number };
}

export interface PayloadMapas {
  capas: CapaCliente[];
  fichas: Record<string, FichaPais>;
  historicos: typeof PUNTOS_HISTORICOS;
  acontecimientos: typeof PUNTOS_ACONTECIMIENTOS;
  /** años del archivo histórico, para el filtro */
  epocasHistoricas: { clave: string; etiqueta: string; desde: number; hasta: number }[];
  totales: {
    paises: number;
    conPoligono: number;
    acontecimientos: number;
    guerras: number;
    conGasto: number;
    conMoneda: number;
  };
}

function formatoEscala(capa: CapaMapa): CapaCliente["escala"] {
  if (!capa.escala) return undefined;
  const { min, max, unidad, formato } = capa.escala;
  const f = (v: number) => {
    if (formato === "usd") {
      if (v >= 1e12) return `${(v / 1e12).toLocaleString("es-ES", { maximumFractionDigits: 1 })} B US$`;
      if (v >= 1e9) return `${(v / 1e9).toLocaleString("es-ES", { maximumFractionDigits: 0 })} mil M US$`;
      if (v >= 1e6) return `${(v / 1e6).toLocaleString("es-ES", { maximumFractionDigits: 0 })} M US$`;
      return `${Math.round(v)} US$`;
    }
    if (formato === "personas") {
      if (v >= 1e6) return `${(v / 1e6).toLocaleString("es-ES", { maximumFractionDigits: 1 })} M`;
      if (v >= 1e3) return `${(v / 1e3).toLocaleString("es-ES", { maximumFractionDigits: 0 })} mil`;
      return `${Math.round(v)}`;
    }
    return v.toLocaleString("es-ES", { maximumFractionDigits: 2 });
  };
  return { min, max, unidad, minTexto: f(min), maxTexto: f(max) };
}

/** Los acontecimientos que tocan a un país (por ISO-2, la clave del núcleo). */
const ACONTECIMIENTOS_POR_ISO2 = (() => {
  const mapa = new Map<string, AcontecimientoDePais[]>();
  for (const a of SEMILLA_ACONTECIMIENTOS) {
    for (const iso2 of a.paisCodes) {
      const lista = mapa.get(iso2.toLowerCase()) ?? [];
      lista.push({
        slug: a.slug,
        titulo: a.titulo,
        estado: a.estado,
        href: a.teatroTag ? `/conflicto/${a.slug}` : `/guerra-hoy`,
      });
      mapa.set(iso2.toLowerCase(), lista);
    }
  }
  return mapa;
})();

export function construirPayload(): PayloadMapas {
  // 1 · la ficha de cada país, con TODAS sus capas numéricas resueltas
  const fichas: Record<string, FichaPais> = {};
  const porNum: Record<string, PaisGeo> = {};
  for (const p of PAISES_GEO) porNum[p.num] = p;

  for (const capa of CAPAS) {
    for (const d of capa.datos) {
      const p = POR_ISO3.get(d.iso3);
      if (!p) continue;
      const ficha = (fichas[p.num] ??= {
        iso3: p.iso3,
        iso2: p.iso2,
        nombre: p.nombre,
        region: p.region,
        subregion: p.subregion,
        lat: p.lat,
        lng: p.lng,
        valores: {},
        acontecimientos: ACONTECIMIENTOS_POR_ISO2.get(p.iso2) ?? [],
      });
      ficha.valores[capa.id] = d.texto;
    }
  }

  // 2 · por capa: el color y el valor de cada polígono del planeta
  const capas: CapaCliente[] = CAPAS.map((capa) => {
    const colores: Record<string, string> = {};
    const valores: Record<string, string> = {};

    if (capa.tipo === "coropleta") {
      for (const d of capa.datos) {
        const p = POR_ISO3.get(d.iso3);
        if (!p) continue;
        colores[p.num] = colorDeValor(d.valor, capa.escala);
        valores[p.num] = d.texto;
      }
    } else if (capa.tipo === "categorica") {
      if (capa.id === "mundial") {
        for (const cat of capa.categorias ?? []) {
          for (const p of PAISES_GEO) {
            if (p.region !== cat.clave) continue;
            colores[p.num] = cat.color;
            valores[p.num] = `${p.nombre} · ${p.region}${p.subregion ? ` · ${p.subregion}` : ""}`;
          }
        }
      } else {
        // político: los bloques del Banco Mundial
        for (const cat of capa.categorias ?? []) {
          for (const fila of PODER_FILAS.filter((f) => f.region === cat.clave)) {
            const p = POR_ISO3.get(fila.iso3);
            if (!p) continue;
            colores[p.num] = cat.color;
            valores[p.num] = `${fila.nombre} · ${fila.region}`;
          }
        }
      }
    }
    // textura y puntos no pintan polígonos: el globo queda como planeta limpio

    return {
      id: capa.id,
      nombre: capa.nombre,
      pregunta: capa.pregunta,
      fuente: capa.fuente,
      tipo: capa.tipo,
      textura: capa.textura,
      escala: formatoEscala(capa),
      categorias: capa.categorias,
      colores,
      valores,
      cobertura: coberturaDeCapa(capa),
    };
  });

  // 3 · las épocas del archivo histórico, derivadas de la fuente
  const eras = new Map<string, { desde: number; hasta: number }>();
  for (const g of PUNTOS_HISTORICOS) {
    const clave = g.epoca ?? "OTRA";
    const actual = eras.get(clave) ?? { desde: Number.POSITIVE_INFINITY, hasta: Number.NEGATIVE_INFINITY };
    eras.set(clave, {
      desde: Math.min(actual.desde, g.desde ?? 0),
      hasta: Math.max(actual.hasta, g.hasta ?? 0),
    });
  }
  const ETIQUETA_ERA: Record<string, string> = {
    ANTIGUA: "Edad Antigua",
    EDAD_MEDIA: "Edad Media",
    MODERNA: "Edad Moderna",
    CONTEMPORANEA: "Edad Contemporánea",
  };
  const epocasHistoricas = [...eras.entries()]
    .sort((a, b) => a[1].desde - b[1].desde)
    .map(([clave, r]) => ({ clave, etiqueta: ETIQUETA_ERA[clave] ?? clave, ...r }));

  return {
    capas,
    fichas,
    historicos: PUNTOS_HISTORICOS,
    acontecimientos: PUNTOS_ACONTECIMIENTOS,
    epocasHistoricas,
    totales: {
      paises: PAISES_GEO.length,
      conPoligono: Object.keys(porNum).length,
      acontecimientos: SEMILLA_ACONTECIMIENTOS.length,
      guerras: PUNTOS_HISTORICOS.length,
      conGasto: PODER_FILAS.filter((f) => f.gasto > 0).length,
      conMoneda: WORLD_CURRENCIES_FULL.length,
    },
  };
}

/** Los países de un acontecimiento, resueltos a su id numérico (para encender su polígono). */
export function paisesDeAcontecimiento(): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [slug, paises] of Object.entries(PAISES_POR_ACONTECIMIENTO)) {
    out[slug] = paises.map((p) => p.num);
  }
  return out;
}

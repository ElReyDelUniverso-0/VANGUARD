// ═══════════════════════════════════════════════════════════════════
// v406.2 LA PORTADA NUEVA — «DESCUBRE HOY».
// Seis hallazgos del archivo REAL de la casa, que cambian solos cada día
// (medianoche de Santo Domingo, UTC−4). Nada inventado: cada pieza sale de su
// fuente (archive-data, atlas-data, game-data, arsenal-data, puertas-salas) y
// lleva a SU ficha exacta — /mundos/<iso>, /historia#id, /armeria#arma-xx,
// /archivo-mundial#… o la puerta /sala/<clave> indexable.
// ═══════════════════════════════════════════════════════════════════
import { CURIOSITIES, ERAS } from "@/lib/archive-data";
import { PAISES_ATLAS } from "@/lib/atlas-data";
import { HISTORICAL_WARS } from "@/lib/game-data";
import { ARSENAL } from "@/lib/arsenal-data";
import { PUERTAS_SALAS } from "@/lib/vanguard/puertas-salas";

export type Hallazgo = {
  clave: string;
  tipo: string; // sello corto: «Curiosidad», «País»…
  titulo: string;
  texto: string;
  dato?: string; // línea de datos (mono)
  href: string;
  cta: string;
  color: string;
  img?: string; // foto real de la fuente (solo el arsenal la trae)
  ficha?: { k: string; v: string }[]; // datos de la ficha (tarjeta grande)
};

const HUSO_SANTO_DOMINGO_MS = 4 * 3600 * 1000;

/** Nº de día en Santo Domingo (cambia a medianoche local). */
export function diaLocal(ahora: number = Date.now()): number {
  return Math.floor((ahora - HUSO_SANTO_DOMINGO_MS) / 86_400_000);
}

/** Elige un elemento estable para el día, con un paso propio por lista
 *  para que las seis tarjetas no roten al unísono. */
function delDia<T>(lista: readonly T[], dia: number, paso: number, desfase: number): T {
  const n = lista.length;
  return lista[(((dia * paso + desfase) % n) + n) % n];
}

function ano(a: number): string {
  return a < 0 ? `${Math.abs(a)} a.C.` : String(a);
}

function recorta(t: string, max: number): string {
  const s = t.trim();
  if (s.length <= max) return s;
  const corte = s.slice(0, max);
  const ultimo = corte.lastIndexOf(" ");
  return `${corte.slice(0, ultimo > max * 0.6 ? ultimo : max).replace(/[,;:.\s]+$/, "")}…`;
}

const fmtPob = (m: number) => (m >= 1000 ? `${(m / 1000).toLocaleString("es", { maximumFractionDigits: 2 })} mil millones` : `${m.toLocaleString("es", { maximumFractionDigits: 1 })} M hab.`);

export const SALAS_INDEXABLES: { clave: string; titulo: string; lema: string }[] = Object.entries(PUERTAS_SALAS)
  .filter(([, p]) => p.indexable)
  // la que no trae lema se presenta con su primer texto; sin ninguno, no entra
  .map(([clave, p]) => ({ clave, titulo: p.titulo, lema: (p.lema || p.textos[0] || "").trim() }))
  .filter((s) => s.lema.length > 0);

export function hallazgosDelDia(ahora: number = Date.now()): Hallazgo[] {
  const dia = diaLocal(ahora);
  const curio = delDia(CURIOSITIES, dia, 7, 3);
  const pais = delDia(PAISES_ATLAS, dia, 11, 5);
  const guerra = delDia(HISTORICAL_WARS, dia, 5, 1);
  const arma = delDia(ARSENAL, dia, 3, 2);
  const era = delDia(ERAS, dia, 1, 0);
  const sala = SALAS_INDEXABLES.length ? delDia(SALAS_INDEXABLES, dia, 13, 7) : null;

  const lista: Hallazgo[] = [
    {
      clave: `pais-${pais.id}`,
      tipo: "País del día",
      titulo: pais.nombre,
      texto: pais.dato,
      dato: `${pais.capital} · ${fmtPob(pais.poblacion)} · ${pais.region}`,
      ficha: [
        { k: "Gobierno", v: pais.gobierno },
        { k: "Liderazgo", v: pais.lider },
        { k: "Idiomas", v: pais.idiomas },
        { k: "Moneda", v: pais.moneda },
      ],
      // la ficha única de /mundos/<iso> (v405.12): fronteras, datos y puentes
      href: `/mundos/${pais.id}`,
      cta: "Abrir su ficha completa",
      color: "#38bdf8",
    },
    {
      clave: `curio-${curio.id}`,
      tipo: `Curiosidad · ${curio.cat.toLowerCase()}`,
      titulo: "¿Sabías que…?",
      texto: recorta(curio.text, 210),
      href: "/archivo-mundial#curiosidades",
      cta: `Ver las ${CURIOSITIES.length} curiosidades`,
      color: "#e8c56a",
    },
    {
      clave: `guerra-${guerra.id}`,
      tipo: "Guerra de la historia",
      titulo: guerra.name,
      texto: recorta(guerra.summary, 190),
      dato: `${ano(guerra.yearStart)} – ${ano(guerra.yearEnd)} · ${guerra.region}`,
      href: `/historia#${guerra.id}`,
      cta: "Leer la ficha",
      color: "#f59e0b",
    },
    {
      clave: `arma-${arma.id}`,
      tipo: "Pieza del arsenal",
      titulo: arma.name,
      texto: recorta(arma.function, 170),
      dato: `${arma.origin} · ${arma.era}`,
      href: `/armeria#arma-${arma.id}`,
      cta: "Ver en la armería",
      color: "#ff6b4a",
      img: arma.photo,
    },
    {
      clave: `era-${era.id}`,
      tipo: "Una era",
      titulo: era.name,
      texto: recorta(era.desc, 180),
      dato: era.period,
      href: "/archivo-mundial#epocas",
      cta: `Las ${ERAS.length} eras`,
      color: "#a78bfa",
    },
  ];
  if (sala) {
    lista.push({
      clave: `sala-${sala.clave}`,
      tipo: "Sala del día",
      titulo: sala.titulo,
      texto: recorta(sala.lema, 170),
      href: `/sala/${sala.clave}`,
      cta: "Entrar a la sala",
      color: "#3ddc97",
    });
  }
  return lista;
}

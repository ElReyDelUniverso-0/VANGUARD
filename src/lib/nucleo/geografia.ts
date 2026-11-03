// ============================================================
// v220.0 EL CARTÓGRAFO — GEOGRAFÍA DEL FRENTE CON PROCEDENCIA
// Conecta los teatros y acontecimientos del núcleo con las
// coordenadas REALES ya documentadas en la casa:
//   · TEATRO_3D (src/lib/mundo.ts, v215 EL MUNDO) — el centro de
//     cada teatro en el globo de /mundo.
//   · GUERRAS (src/lib/guerras-activas-data.ts, v129 LA SALA DE
//     GUERRA) — las salas de /ver-guerra: ciudades con estado,
//     frentes y zonas de control, cada sala con su fuente OSINT
//     declarada (ISW, ACLED, OCHA, ACNUR, AAPP…).
// LEYES QUE CUMPLE (mandato del sistema):
//   · Vanguard NO inventa ni una coordenada: este archivo solo
//     PROYECTA y CITA lo que ya existe en el repo. Fíjate: no hay
//     un solo literal lat/lng aquí — el anti-invención lo prueba.
//   · Todo es estimación OSINT editorializada: esquema aproximado,
//     NO cartografía oficial (ley de honestidad de la sala v129).
//   · Lo que no tiene sala de guerra se DECLARA (no se finge):
//     Corea del Norte no tiene sala propia y aquí se dice.
// Puro y sin BD: lo consumen las fichas del núcleo (relaciones.ts)
// y la API /api/nucleo/entidad.
// ============================================================

import { TEATRO_3D } from "@/lib/mundo";
import { guerraDe } from "@/lib/guerras-activas-data";

// ── MAPEO EDITORIAL DECLARADO: teatro del núcleo → sala de guerra ──
// La sala «oriente» (v129) cubre el eje entero desde el 7-O:
// Gaza, el Líbano, el mar Rojo e Irán — cuatro teatros del núcleo
// comparten sala y aquí se dice cuál es el tablero de cada uno.
const SALA_POR_TEATRO: Record<string, { sala: string; nota: string }> = {
  ukraine: { sala: "ucrania", nota: "misma guerra, misma sala" },
  gaza: { sala: "oriente", nota: "tablero gaza dentro de la sala del eje (7-O)" },
  lebanon: { sala: "oriente", nota: "tablero libanés dentro de la sala del eje (7-O)" },
  redsea: { sala: "oriente", nota: "tablero hutí dentro de la sala del eje (7-O)" },
  hormuz: { sala: "oriente", nota: "tablero iraní dentro de la sala del eje (7-O)" },
  sudan: { sala: "sudan", nota: "misma guerra, misma sala" },
  sahel: { sala: "sahel", nota: "misma insurgencia, misma sala" },
  taiwan: { sala: "taiwan", nota: "teatro observado (sin guerra activa) en la sala" },
  // korea NO tiene sala de guerra propia: se declara sin sala abajo,
  // no se finge (ley de la casa: si falta un dato, estado real).
};

// ── Ciudades de la sala oriente → teatro del núcleo (tabla explícita) ──
// La sala del eje reúne cuatro tableros: aquí se reparte cada ciudad
// a su teatro. Damasco queda FUERA (Siria no es teatro del núcleo):
// no se fuerza ninguna asignación.
const TABLERO_ORIENTE: Record<string, string> = {
  "Gaza (ciudad)": "gaza",
  Rafah: "gaza",
  Jenín: "gaza",
  "Tel Aviv": "gaza",
  Jerusalén: "gaza",
  Beirut: "lebanon",
  Sanaa: "redsea",
  Teherán: "hormuz",
};

/** Un punto del frente: ciudad de la sala de guerra con su estado. */
export interface PuntoFrente {
  nombre: string;
  lat: number;
  lng: number;
  estado: string;
  nota: string | null;
}

/** Geografía de un teatro: centro + puntos + procedencia declarada. */
export interface GeografiaTeatro {
  teatro: string;
  /** Centro del teatro en el globo (TEATRO_3D, vista /mundo). */
  centro: { lat: number; lng: number; procedencia: string } | null;
  /** Ciudades del frente (GUERRAS de /ver-guerra). */
  puntos: PuntoFrente[];
  /** id de la sala de guerra que cubre el teatro, si existe. */
  salaGuerra: string | null;
  /** La fuente OSINT declarada por la propia sala (no la copiamos: la citamos). */
  fuenteDatos: string | null;
  precision: string;
  vistas: { etiqueta: string; ruta: string; motivo: string }[];
}

const PRECISION_MAPA =
  "Esquema aproximado de estimación OSINT editorializada — NO cartografía oficial. " +
  "El estado de cada ciudad es el del corte editorial de la sala de guerra de la casa.";

/** Geografía de un teatro del núcleo: solo coordenadas ya documentadas. */
export function geografiaDeTeatro(slug: string): GeografiaTeatro {
  const centro3d = TEATRO_3D[slug] ?? null;
  const salaInfo = SALA_POR_TEATRO[slug] ?? null;
  const sala = salaInfo ? (guerraDe(salaInfo.sala) ?? null) : null;

  let puntos: PuntoFrente[] = [];
  if (sala) {
    puntos = sala.ciudades
      // en la sala del eje, cada ciudad va a su tablero (tabla explícita);
      // en las salas 1:1, todas las ciudades son del teatro
      .filter((c) => (sala.id === "oriente" ? TABLERO_ORIENTE[c.nombre] === slug : true))
      .map((c) => ({
        nombre: c.nombre,
        lat: c.lat,
        lng: c.lng,
        estado: c.estado,
        nota: c.nota ?? null,
      }));
  }

  const vistas: GeografiaTeatro["vistas"] = [
    {
      etiqueta: "EL GLOBO ▸",
      ruta: `/mundo?teatro=${slug}`,
      motivo: "El teatro encendido en el planeta 3D con su tensión del día",
    },
  ];
  if (sala) {
    vistas.push({
      etiqueta: "EL MAPA DEL FRENTE ▸",
      ruta: "/ver-guerra",
      motivo: `La sala de guerra «${sala.nombre}» con ciudades, frentes y zonas de control`,
    });
  }

  return {
    teatro: slug,
    centro: centro3d
      ? { ...centro3d, procedencia: "Centro del teatro en el globo /mundo (TEATRO_3D, v215)" }
      : null,
    puntos,
    salaGuerra: sala ? sala.id : null,
    fuenteDatos: sala?.fuente ?? null,
    precision: PRECISION_MAPA,
    vistas,
  };
}

/** Metadatos legibles (k/v) para las fichas de entidad. */
export function metaGeografia(g: GeografiaTeatro): { k: string; v: string }[] {
  const meta: { k: string; v: string }[] = [];
  if (g.centro) {
    meta.push({
      k: "Centro del teatro",
      v: `${g.centro.lat.toFixed(2)}°, ${g.centro.lng.toFixed(2)}° — globo /mundo`,
    });
  }
  if (g.puntos.length > 0) {
    const resumen = g.puntos
      .slice(0, 4)
      .map((p) => `${p.nombre} [${p.estado}]`)
      .join(", ");
    meta.push({ k: "Puntos del frente", v: `${g.puntos.length} ciudades: ${resumen}…` });
    meta.push({ k: "Fuente del mapa", v: g.fuenteDatos ?? "—" });
    meta.push({ k: "Precisión del mapa", v: g.precision });
  } else {
    meta.push({
      k: "Mapa del frente",
      v: "sin sala de guerra propia — el teatro se vigila desde el globo y sus cables",
    });
  }
  return meta;
}

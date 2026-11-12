// ============================================================
// v367.3 LA RADIO DE VANGUARD — EL DIAL (lib/musica/radios.ts)
//
// «Agrega que se pueda escuchar radios de lugares de conflictos en Vanguard
// Music, música militar y la radio de Vanguard» (el Dueño).
//
// Dos clases de emisora, y la casa dice SIEMPRE cuál es cuál:
//
//  ① EMISORAS REALES: emisoras públicas que emiten por internet. Aquí está
//     la fecha en que la casa comprobó que respondían, con su código HTTP.
//     Lo que no se comprobó se marca «SIN VERIFICAR» — no se disfraza de
//     comprobado. Son enlaces externos: si caen, la casa NO se queda muda,
//     cae a la radio de la casa.
//
//  ② LA RADIO DE LA CASA: una emisora que se fabrica aquí mismo — estática,
//     morse, sirena y un boletín leído con la VOZ MAESTRA sobre los cables
//     REALES del teatro elegido. No depende de nadie, no enlaza a nadie y
//     no puede caerse: mientras haya archivo, hay radio.
// ============================================================

export interface Emisora {
  id: string;
  nombre: string;
  pais: string;
  idioma: string;
  /** teatro al que se arrima (clave de teatro de la casa) o null si es general */
  teatro: string | null;
  url: string;
  /** fecha en que la casa comprobó la respuesta, o "SIN VERIFICAR" */
  verificada: string;
  /** código HTTP obtenido en la comprobación (0 = no respondió) */
  http: number;
  nota: string;
}

/** Comprobadas el 2026-11-12 con petición parcial (Range 0-2048). */
export const EMISORAS: Emisora[] = [
  {
    id: "bbc-ws",
    nombre: "BBC World Service",
    pais: "Reino Unido",
    idioma: "inglés",
    teatro: "ukraine",
    url: "https://stream.live.vc.bbcmedia.co.uk/bbc_world_service",
    verificada: "2026-11-12",
    http: 200,
    nota: "Cobertura global: es la emisora que más se escucha cuando hay guerra en Europa del Este.",
  },
  {
    id: "mcd",
    nombre: "Monte Carlo Doualiya",
    pais: "Francia · Oriente Medio",
    idioma: "árabe",
    teatro: "gaza",
    url: "https://montecarlodoualiya128k.ice.infomaniak.ch/mc-doualiya.mp3",
    verificada: "2026-11-12",
    http: 200,
    nota: "Emisora pública francesa en árabe: la voz de Oriente Medio desde París.",
  },
  {
    id: "rfi-monde",
    nombre: "RFI Monde",
    pais: "Francia · África",
    idioma: "francés",
    teatro: "sahel",
    url: "https://rfimonde64k.ice.infomaniak.ch/rfimonde-64.mp3",
    verificada: "2026-11-12",
    http: 200,
    nota: "La emisora que se oye en buena parte del Sahel: informativos de África en directo.",
  },
  {
    id: "france-info",
    nombre: "France Info",
    pais: "Francia",
    idioma: "francés",
    teatro: "lebanon",
    url: "https://icecast.radiofrance.fr/franceinfo-midfi.mp3",
    verificada: "2026-11-12",
    http: 200,
    nota: "Todo noticias, sin música: útil para seguir una crisis minuto a minuto.",
  },
  {
    id: "france-inter",
    nombre: "France Inter",
    pais: "Francia",
    idioma: "francés",
    teatro: null,
    url: "https://icecast.radiofrance.fr/franceinter-midfi.mp3",
    verificada: "2026-11-12",
    http: 200,
    nota: "Generalista de la radio pública francesa.",
  },
  // ── Respondieron con redirección a un nodo interno de su red: pueden
  //    sonar en muchos navegadores y fallar en otros. Se declaran tal cual.
  {
    id: "rfi-arabe",
    nombre: "RFI Árabe",
    pais: "Francia · Oriente Medio",
    idioma: "árabe",
    teatro: "gaza",
    url: "https://rfiarabe64k.ice.infomaniak.ch/rfiarabe-64.mp3",
    verificada: "SIN VERIFICAR",
    http: 302,
    nota: "Respondió con redirección interna: puede sonar o no según el aparato.",
  },
  {
    id: "rfi-ukrainien",
    nombre: "RFI Ucraniano",
    pais: "Francia · Ucrania",
    idioma: "ucraniano",
    teatro: "ukraine",
    url: "https://rfiukrainien64k.ice.infomaniak.ch/rfiukrainien-64.mp3",
    verificada: "SIN VERIFICAR",
    http: 302,
    nota: "Redirección interna: sin garantía.",
  },
  {
    id: "rfi-russe",
    nombre: "RFI Ruso",
    pais: "Francia · Rusia",
    idioma: "ruso",
    teatro: "ukraine",
    url: "https://rfirusse64k.ice.infomaniak.ch/rfirusse-64.mp3",
    verificada: "SIN VERIFICAR",
    http: 302,
    nota: "Redirección interna: sin garantía.",
  },
  {
    id: "rfi-hausa",
    nombre: "RFI Hausa",
    pais: "Francia · Sahel",
    idioma: "hausa",
    teatro: "sahel",
    url: "https://rfihausa64k.ice.infomaniak.ch/rfihausa-64.mp3",
    verificada: "SIN VERIFICAR",
    http: 302,
    nota: "Redirección interna: sin garantía.",
  },
  {
    id: "rfi-persan",
    nombre: "RFI Persa",
    pais: "Francia · Irán",
    idioma: "persa",
    teatro: "hormuz",
    url: "https://rfipersan64k.ice.infomaniak.ch/rfipersan-64.mp3",
    verificada: "SIN VERIFICAR",
    http: 302,
    nota: "Redirección interna: sin garantía.",
  },
];

// ── LA RADIO DE LA CASA ──────────────────────────────────
// Cada teatro tiene su emisora fabricada: qué ambiente suena y qué dice el
// locutor. El boletín NO está escrito aquí: se lee del archivo real cuando
// el visitante la enciende (así nunca hay una noticia inventada).
export interface RadioCasa {
  teatro: string;
  nombre: string;
  /** frecuencia ficticia pero estable: la casa no finge diales reales */
  dial: string;
  ambiente: {
    estatica: number; // 0–1
    morse: boolean;
    sirena: "ninguna" | "lejana" | "cercana";
    tambor: boolean;
  };
  presentacion: string;
}

export const RADIOS_CASA: RadioCasa[] = [
  {
    teatro: "ukraine",
    nombre: "RADIO CASA · FRENTE ESTE",
    dial: "87.4",
    ambiente: { estatica: 0.1, morse: true, sirena: "lejana", tambor: true },
    presentacion: "Boletín del frente este, leído del archivo real de la casa.",
  },
  {
    teatro: "gaza",
    nombre: "RADIO CASA · FRANJA",
    dial: "88.1",
    ambiente: { estatica: 0.14, morse: false, sirena: "cercana", tambor: true },
    presentacion: "Boletín de la franja, leído del archivo real de la casa.",
  },
  {
    teatro: "lebanon",
    nombre: "RADIO CASA · LÍNEA AZUL",
    dial: "89.6",
    ambiente: { estatica: 0.12, morse: true, sirena: "lejana", tambor: false },
    presentacion: "Boletín de la frontera norte, leído del archivo real de la casa.",
  },
  {
    teatro: "redsea",
    nombre: "RADIO CASA · MAR ROJO",
    dial: "90.3",
    ambiente: { estatica: 0.18, morse: true, sirena: "ninguna", tambor: false },
    presentacion: "Boletín del corredor marítimo, leído del archivo real de la casa.",
  },
  {
    teatro: "sudan",
    nombre: "RADIO CASA · DOS RÍOS",
    dial: "91.0",
    ambiente: { estatica: 0.16, morse: false, sirena: "lejana", tambor: true },
    presentacion: "Boletín de Sudán, leído del archivo real de la casa.",
  },
  {
    teatro: "korea",
    nombre: "RADIO CASA · DMZ",
    dial: "92.5",
    ambiente: { estatica: 0.1, morse: true, sirena: "ninguna", tambor: false },
    presentacion: "Boletín de la península, leído del archivo real de la casa.",
  },
  {
    teatro: "taiwan",
    nombre: "RADIO CASA · ESTRECHO",
    dial: "93.8",
    ambiente: { estatica: 0.1, morse: true, sirena: "ninguna", tambor: false },
    presentacion: "Boletín del estrecho, leído del archivo real de la casa.",
  },
  {
    teatro: "hormuz",
    nombre: "RADIO CASA · ORMUZ",
    dial: "94.2",
    ambiente: { estatica: 0.15, morse: true, sirena: "lejana", tambor: false },
    presentacion: "Boletín del estrecho de Ormuz, leído del archivo real de la casa.",
  },
  {
    teatro: "sahel",
    nombre: "RADIO CASA · SAHEL",
    dial: "95.7",
    ambiente: { estatica: 0.2, morse: false, sirena: "ninguna", tambor: true },
    presentacion: "Boletín del Sahel, leído del archivo real de la casa.",
  },
];

export const NOMBRE_TEATRO: Record<string, string> = {
  ukraine: "Ucrania",
  gaza: "Gaza",
  lebanon: "Líbano",
  redsea: "mar Rojo",
  sudan: "Sudán",
  korea: "Corea",
  taiwan: "Taiwán",
  hormuz: "Ormuz",
  sahel: "Sahel",
};

export function emisorasDeTeatro(teatro: string): Emisora[] {
  return EMISORAS.filter((e) => e.teatro === teatro);
}

export function radioCasaDe(teatro: string): RadioCasa | null {
  return RADIOS_CASA.find((r) => r.teatro === teatro) ?? null;
}

/** Cuántas emisoras reales están comprobadas (la sala lo dice en la cara). */
export function cuentaVerificadas(): { verificadas: number; total: number } {
  return {
    verificadas: EMISORAS.filter((e) => e.verificada !== "SIN VERIFICAR").length,
    total: EMISORAS.length,
  };
}

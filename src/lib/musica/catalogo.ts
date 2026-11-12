// ============================================================
// v367.4 MÚSICA REAL DE LA CASA (lib/musica/catalogo.ts)
//
// El Dueño fue tajante: «la música que agregaste es horrible; busca música,
// agrégala; no crees nada nuevo». Pues eso: aquí está música REAL, hecha
// por otros, copiada exactamente y con su licencia a la vista.
//
// Requisitos que cumple cada pista de este catálogo:
//  ① ES REAL: la tocó una banda, una orquesta o un tenor de verdad.
//  ② ES LEGAL: dominio público o CC0 — se puede escuchar y enlazar sin
//     pedir permiso a nadie. La licencia va escrita en cada entrada.
//  ③ ESTÁ COMPROBADA: cada enlace respondió HTTP 206 (audio/mpeg) el
//     2026-11-12 con una petición parcial de 4 KB. Si una pista se cae, la
//     sala lo dice y no la disfraza.
//  ④ NO HAY COPIA ILEGAL: no se copia música con derechos. Las canciones
//     modernas que le gustan al Dueño (Terranova, «Tu locura es mi
//     ciencia») NO se pueden enlazar ni copiar; en su lugar está la música
//     libre de verdad, y el taller de la casa sigue ahí para experimentar.
//
// Toda la música se sirve desde archive.org (dominio público / CC0): la
// casa no aloja ni un byte de audio ajeno.
// ============================================================

export type CategoriaMusica = "marcha" | "orquesta" | "voz" | "ambiente";

export interface PistaReal {
  id: string;
  categoria: CategoriaMusica;
  nombre: string;
  autor: string;
  licencia: string;
  descripcion: string;
  /** enlace directo al mp3 (archive.org) */
  url: string;
  /** la ficha de la fuente, para citarla */
  fuente: string;
  duracionSeg: number;
  /** fecha en que la casa comprobó que responde */
  comprobada: string;
  /** código HTTP obtenido en la comprobación */
  http: number;
}

export const MUSICA_REAL: PistaReal[] = [
  {
    id: "real-01",
    categoria: "marcha",
    nombre: "Colonel Bogey March",
    autor: "United States Coast Guard Band",
    licencia: "dominio público (PD Mark 1.0)",
    descripcion: "Marcha británica de Kenneth J. Alford, tocada por la banda de la Guardia Costera de EE. UU.",
    url: "https://archive.org/download/ColonelBogeyMarch_191/03ColonelBogey.mp3",
    fuente: "https://archive.org/details/ColonelBogeyMarch_191",
    duracionSeg: 215,
    comprobada: "2026-11-12",
    http: 206,
  },
  {
    id: "real-02",
    categoria: "marcha",
    nombre: "American Patrol",
    autor: "United States Marine Band",
    licencia: "dominio público (PD Mark 1.0)",
    descripcion: "Marcha de F. W. Meacham por la Banda del Cuerpo de Marines de EE. UU.",
    url: "https://archive.org/download/american-patrol-meacham-united-states-marine-band-2018/American_Patrol_Meacham_United_States_Marine_Band.ogg.mp3",
    fuente: "https://archive.org/details/american-patrol-meacham-united-states-marine-band-2018",
    duracionSeg: 251,
    comprobada: "2026-11-12",
    http: 206,
  },
  {
    id: "real-03",
    categoria: "marcha",
    nombre: "Marcha Radetzky",
    autor: "Prince's Military Band",
    licencia: "dominio público (PD Mark 1.0)",
    descripcion: "Johann Strauss (padre), grabación histórica del catálogo de la Biblioteca del Congreso.",
    url: "https://archive.org/download/loc-jukebox-761174-radetsky-march/jukebox-761174_radetsky-march.mp3",
    fuente: "https://archive.org/details/loc-jukebox-761174-radetsky-march",
    duracionSeg: 220,
    comprobada: "2026-11-12",
    http: 206,
  },
  {
    id: "real-04",
    categoria: "marcha",
    nombre: "The Washington Post",
    autor: "Victor Military Band",
    licencia: "dominio público (PD Mark 1.0)",
    descripcion: "John Philip Sousa por la Victor Military Band, 1910 aprox.",
    url: "https://archive.org/download/loc-jukebox-132786-washington-post-march/jukebox-132786_washington-post-march.mp3",
    fuente: "https://archive.org/details/loc-jukebox-132786-washington-post-march",
    duracionSeg: 229,
    comprobada: "2026-11-12",
    http: 206,
  },
  {
    id: "real-05",
    categoria: "marcha",
    nombre: "The Liberty Bell",
    autor: "UCSB",
    licencia: "dominio público",
    descripcion: "La marcha de Sousa más reconocible del mundo, archivo de la Universidad de California.",
    url: "https://archive.org/download/TheLibertyBellMarch_1239/Liberty_bell_march2_64kb.mp3",
    fuente: "https://archive.org/details/TheLibertyBellMarch_1239",
    duracionSeg: 202,
    comprobada: "2026-11-12",
    http: 206,
  },
  {
    id: "real-06",
    categoria: "marcha",
    nombre: "National Emblem",
    autor: "Freddie Mitchell y su orquesta",
    licencia: "dominio público",
    descripcion: "Marcha de E. E. Bagley en disco de 78 rpm del archivo Great 78 Project.",
    url: "https://archive.org/download/78_national-emblem-march_freddie-mitchell-freed-bagler_gbia0112830b/National%20Emblem%20March%20-%20Freddie%20Mitchell.mp3",
    fuente: "https://archive.org/details/78_national-emblem-march_freddie-mitchell-freed-bagler_gbia0112830b",
    duracionSeg: 163,
    comprobada: "2026-11-12",
    http: 206,
  },
  {
    id: "real-07",
    categoria: "marcha",
    nombre: "Jolly Coppersmith",
    autor: "National Music Lovers Military Band",
    licencia: "dominio público",
    descripcion: "Marcha de Carl Peter en 78 rpm, banda militar.",
    url: "https://archive.org/download/78_jolly-coppersmith_national-music-lovers-military-band-peters_gbia0286714b/JOLLY%20COPPERSMITH%20-%20NATIONAL%20MUSIC%20LOVERS%20MILITARY%20BAND.mp3",
    fuente: "https://archive.org/details/78_jolly-coppersmith_national-music-lovers-military-band-peters_gbia0286714b",
    duracionSeg: 181,
    comprobada: "2026-11-12",
    http: 206,
  },
  {
    id: "real-08",
    categoria: "orquesta",
    nombre: "The Birds and the Brook",
    autor: "Pryor's Orchestra",
    licencia: "dominio público (PD Mark 1.0)",
    descripcion: "Orquesta de Arthur Pryor: colchón de cuerda y viento para leer el mapa.",
    url: "https://archive.org/download/loc-jukebox-119429-the-birds-and-the-brook/jukebox-119429_the-birds-and-the-brook.mp3",
    fuente: "https://archive.org/details/loc-jukebox-119429-the-birds-and-the-brook",
    duracionSeg: 165,
    comprobada: "2026-11-12",
    http: 206,
  },
  {
    id: "real-09",
    categoria: "orquesta",
    nombre: "Vale of the Shenandoah",
    autor: "Arthur Pryor's Band",
    licencia: "dominio público (PD Mark 1.0)",
    descripcion: "Medley orquestal de 1910: nostalgia de valle, ideal para la crónica.",
    url: "https://archive.org/download/loc-jukebox-121132-vale-of-the-shenandoah-medley/jukebox-121132_vale-of-the-shenandoah-medley.mp3",
    fuente: "https://archive.org/details/loc-jukebox-121132-vale-of-the-shenandoah-medley",
    duracionSeg: 240,
    comprobada: "2026-11-12",
    http: 206,
  },
  {
    id: "real-10",
    categoria: "orquesta",
    nombre: "Woodland Songsters Waltz",
    autor: "Victor Orchestra",
    licencia: "dominio público (PD Mark 1.0)",
    descripcion: "Vals de la Victor Orchestra: sala de baile de otra época.",
    url: "https://archive.org/download/loc-jukebox-248539-woodland-songsters-waltz/jukebox-248539_woodland-songsters-waltz.mp3",
    fuente: "https://archive.org/details/loc-jukebox-248539-woodland-songsters-waltz",
    duracionSeg: 202,
    comprobada: "2026-11-12",
    http: 206,
  },
  {
    id: "real-11",
    categoria: "voz",
    nombre: "Und es blitzten die Sterne",
    autor: "Franz Völker",
    licencia: "dominio público (PD Mark 1.0)",
    descripcion: "Franz Völker, tenor: ópera grabada en los años treinta.",
    url: "https://archive.org/download/undesblitztenvolker/Und%20es%20blitzten%20V%C3%B6lker.mp3",
    fuente: "https://archive.org/details/undesblitztenvolker",
    duracionSeg: 146,
    comprobada: "2026-11-12",
    http: 206,
  },
  {
    id: "real-12",
    categoria: "orquesta",
    nombre: "Shaken not Stirred",
    autor: "Br. Cleve & His Lush Orchestra",
    licencia: "dominio público",
    descripcion: "Orquesta de salón de Br. Cleve: lounge de los cincuenta.",
    url: "https://archive.org/download/Br.Cleve_HisLushOrchestraShakennotStirred/song1_64kb.mp3",
    fuente: "https://archive.org/details/Br.Cleve_HisLushOrchestraShakennotStirred",
    duracionSeg: 225,
    comprobada: "2026-11-12",
    http: 206,
  },
  {
    id: "real-13",
    categoria: "ambiente",
    nombre: "Recorded Through a Stranger's Door",
    autor: "Anónimo (Baltimore)",
    licencia: "CC0 1.0",
    descripcion: "Grabación de campo de un residente de Baltimore: el sonido de una casa ajena.",
    url: "https://archive.org/download/RecordedThroughAStrangersDoor/Voice144.mp3",
    fuente: "https://archive.org/details/RecordedThroughAStrangersDoor",
    duracionSeg: 122,
    comprobada: "2026-11-12",
    http: 206,
  },
];

export const ETIQUETA_CATEGORIA: Record<CategoriaMusica, string> = {
  marcha: "MARCHAS Y BANDAS",
  orquesta: "ORQUESTA Y SALÓN",
  voz: "VOZ",
  ambiente: "AMBIENTE",
};

export function pistasDe(categoria: CategoriaMusica): PistaReal[] {
  return MUSICA_REAL.filter((p) => p.categoria === categoria);
}

export function cuentaMusicaReal(): { total: number; categorias: number } {
  return { total: MUSICA_REAL.length, categorias: new Set(MUSICA_REAL.map((p) => p.categoria)).size };
}

/** Duración legible, desde los segundos. */
export function minutos(seg: number): string {
  const m = Math.floor(seg / 60);
  const s = Math.round(seg % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

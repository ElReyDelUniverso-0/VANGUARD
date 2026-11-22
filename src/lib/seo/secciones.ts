// ============================================================
// v421.0 EL MAPA DIVIDIDO — LAS SECCIONES DEL SITEMAP
//
// Hasta aquí Vanguard anunciaba a Google 3.766 puertas en UN solo
// sitemap.xml de 628 KB. Funcionaba, pero Search Console no podía decir
// la verdad que importa: «¿qué sección falla?». Un archivo único mezcla
// las 2.000 noticias con los 9 teatros de guerra y las 250 fichas de país,
// así que un error de una sala se lee como un error del sitio entero, y
// una sección que crece (noticias) tapa a las que se quedan quietas.
//
// Google acepta 50.000 URLs por archivo y recomienda separar por tipo de
// contenido. Aquí cada sección tiene SU archivo, y el índice
// (/sitemap.xml) los reúne. El límite de 50.000 se respeta por archivo,
// no por sitio: cuando /noticia pase de 50.000, se parte solo.
//
// LA LEY: una URL vive en UNA sola sección (nunca en dos: duplicar en el
// mapa es pedirle a Google que elija) y NINGUNA se pierde (lo que no casa
// con ninguna regla cae en «otros», y la auditoría lo delata).
// ============================================================

export type SeccionId =
  | "informacion"
  | "geopolitica"
  | "noticias"
  | "mapas"
  | "simuladores"
  | "educacion"
  | "herramientas"
  | "otros";

export interface Seccion {
  id: SeccionId;
  /** lo que se lee en el índice y en el panel interno */
  titulo: string;
  /** prefijos de ruta (sin dominio). El primero que casa manda. */
  prefijos: string[];
}

// El ORDEN importa: gana el primer prefijo que casa. Los prefijos largos
// van antes que los cortos para que /organizaciones/redes no caiga en
// información por culpa de /organizaciones.
export const SECCIONES: Seccion[] = [
  {
    id: "noticias",
    titulo: "Noticias y acontecimientos en vivo",
    prefijos: ["/noticia", "/guerra-hoy", "/en-vivo", "/novedades"],
  },
  {
    id: "geopolitica",
    titulo: "Conflictos y relaciones internacionales",
    prefijos: [
      "/conflicto",
      "/conflictos",
      "/organizaciones/redes",
      "/poder",
      "/objetivos",
      "/inteligencia",
      "/centinela",
      "/espia",
      "/ver-guerra",
      "/verdad-cruda",
      "/cronica",
      "/oscura",
      "/vertigo",
      "/pulso-mundial",
    ],
  },
  {
    id: "mapas",
    titulo: "Mapas 3D, geografía y salas",
    prefijos: [
      "/worlds",
      "/mapas",
      "/atlas",
      "/teatro-3d",
      "/vanguard2",
      "/universo",
      "/sala",
      "/constelacion",
      "/tierra",
      "/espacio",
      "/mundo",
      "/mundos",
      "/infraestructura",
      // v441.3 ABANDONED WORLD — atlas de lugares abandonados
      "/abandonados",
    ],
  },
  {
    id: "simuladores",
    titulo: "Simuladores y herramientas interactivas",
    prefijos: ["/escenarios", "/cruce", "/labs", "/simulador", "/juego", "/modo", "/zona-cero"],
  },
  {
    id: "educacion",
    titulo: "Educación, enciclopedia e investigación",
    prefijos: [
      "/academia",
      "/resiliencia",
      "/conocimiento",
      "/enciclopedia",
      "/lingua",
      "/memoria",
      "/ciencia", // v421.9 · el departamento científico
      "/editorial",
      "/investigacion",
      "/historia",
      "/glosario",
      "/aprender",
      "/armeria",
      "/galeria",
      "/musica",
      "/audios",
      "/voz",
      "/rostros",
      "/lectura",
      "/traductor",
      "/creadores",
      "/laboratorio",
    ],
  },
  {
    id: "informacion",
    titulo: "Países, territorios y datos del mundo",
    prefijos: [
      "/datos-mundiales",
      "/datos",
      "/regiones",
      "/organizaciones",
      "/colecciones",
      "/directorio",
      "/rankings",
      "/comparador",
      "/demografia",
      "/divisas",
      "/paises",
      "/arquitectura",
      "/archivo-mundial",
    ],
  },
  {
    id: "herramientas",
    titulo: "Herramientas, módulos y sistema",
    prefijos: [
      "/herramientas",
      "/modulo",
      "/modulos",
      "/sistema",
      "/navegacion",
      "/servicios",
      "/privacidad",
      "/perfil",
      "/estado",
      "/registro",
      "/cuartel",
      "/escudo",
      "/base",
      "/inicio",
    ],
  },
  { id: "otros", titulo: "El resto de la casa", prefijos: [] },
];

/** La sección de una URL absoluta o de una ruta. La portada «/» es información. */
export function seccionDe(url: string): SeccionId {
  let ruta = url;
  try {
    ruta = new URL(url).pathname;
  } catch {
    /* ya es una ruta */
  }
  if (ruta === "" ) ruta = "/";
  if (ruta === "/") return "informacion";
  for (const s of SECCIONES) {
    for (const p of s.prefijos) {
      if (ruta === p || ruta.startsWith(p + "/") || ruta.startsWith(p + "?")) {
        return s.id;
      }
    }
  }
  return "otros";
}

/** El nombre del archivo que se anuncia (y que se ve en Search Console). */
export const archivoDe = (id: SeccionId) => `sitemap-${id}.xml`;

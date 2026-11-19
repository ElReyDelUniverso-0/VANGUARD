// ═══════════════════════════════════════════════════════════════════
// v407.1 · EL DIRECTORIO DE LA CASA — todas las puertas en un solo índice
//
// La casa ya tenía tres censos que no se hablaban: los módulos públicos de la
// cabecera (portada/modulos.ts), el censo del Núcleo (nucleo/registro.ts) y
// las familias de módulos (nucleo/fusiones.ts). Este archivo los CRUZA, sin
// copiar nada a mano: cada destino sale de esas fuentes y se le añaden sus
// TEMAS (categorías inteligentes: un mismo destino puede vivir en varios).
//
// Con eso se construyen tres cosas que la casa no tenía:
//   · el directorio buscable (/directorio) con favoritos y recientes;
//   · las recomendaciones de «sigue explorando» de cualquier página;
//   · las colecciones temáticas (/colecciones): recorridos guiados.
//
// Ley de la casa: ninguna ruta se escribe aquí si no existe en src/app
// (scripts/pruebas-nucleo.mjs lo verifica, incluidas las de las colecciones).
// ═══════════════════════════════════════════════════════════════════

import { MODULOS, SALAS_INTERNAS } from "@/components/portada/modulos";
import { MODULOS_NUCLEO } from "@/lib/nucleo/registro";
import { familiaDeRuta } from "@/lib/nucleo/fusiones";
import { CONSTELACIONES } from "@/lib/vanguard/mapa-salas";
import { PUERTAS_SALAS } from "@/lib/vanguard/puertas-salas";

/** ── Temas: las categorías inteligentes ─────────────────────── */

export interface Tema {
  id: string;
  nombre: string;
  /** la pregunta del lector que resuelve el tema */
  pregunta: string;
  color: string;
  /** rutas (sin query) que pertenecen al tema */
  rutas: string[];
}

export const TEMAS: Tema[] = [
  {
    id: "conflictos",
    nombre: "Guerras y conflictos",
    pregunta: "¿Qué está pasando en los frentes abiertos?",
    color: "#ff4d5e",
    rutas: ["/guerra-hoy", "/en-vivo", "/conflictos", "/cronica", "/verdad-cruda", "/ver-guerra", "/zona-cero", "/vertigo", "/mundo", "/noticia/[id]", "/conflicto/[tag]"],
  },
  {
    id: "paises",
    nombre: "Países y territorios",
    pregunta: "¿Cómo es un país y cómo se compara con otros?",
    color: "#5eead4",
    rutas: ["/mundos", "/mundos/[iso]", "/atlas", "/comparador", "/regiones", "/organizaciones", "/rankings", "/divisas", "/rostros", "/mapas"],
  },
  // v417.0 VANGUARD KNOWLEDGE — el saber de fondo, independiente de la actualidad
  {
    id: "saber",
    nombre: "Conocimiento y enciclopedia",
    pregunta: "¿Qué hay que saber del mundo para entenderlo a fondo?",
    color: "#a78bfa",
    rutas: ["/conocimiento/enciclopedia", "/conocimiento", "/conocimiento/aprender", "/lingua", "/historia", "/organizaciones", "/regiones", "/mundos", "/investigacion"],
  },
  // v420.0 VANGUARD LINGUA — lenguas, escrituras y comunicación
  {
    id: "lenguas",
    nombre: "Lenguas y comunicación",
    pregunta: "¿Qué lenguas se hablan, de dónde vienen y cómo se escriben?",
    color: "#5eead4",
    rutas: ["/lingua", "/lingua/idiomas", "/lingua/familias", "/lingua/mapa", "/lingua/regiones", "/lingua/peligro", "/lingua/escrituras", "/lingua/diccionario", "/lingua/traductor", "/mundos/[iso]"],
  },
  {
    id: "cifras",
    nombre: "Población y economía",
    pregunta: "¿Cuánta gente, cuánto dinero, cuántos años de vida?",
    color: "#3ddc97",
    rutas: ["/demografia", "/rankings", "/comparador", "/regiones", "/divisas", "/pulso-mundial", "/poder", "/organizaciones"],
  },
  {
    id: "defensa",
    nombre: "Defensa y armamento",
    pregunta: "¿Quién tiene qué y cuánto gasta en defensa?",
    color: "#ff9a4d",
    rutas: ["/armeria", "/poder", "/teatro-3d", "/escenarios", "/servicios", "/organizaciones"],
  },
  {
    id: "historia",
    nombre: "Historia y archivo",
    pregunta: "¿De dónde viene lo que pasa hoy?",
    color: "#e8c56a",
    rutas: ["/historia", "/archivo-mundial", "/editorial", "/oscura", "/galeria", "/lectura/[clave]", "/colecciones", "/conocimiento/enciclopedia"],
  },
  {
    id: "mapas",
    nombre: "Mapas y mundos 3D",
    pregunta: "¿Dónde queda y cómo se ve?",
    color: "#6ed6ff",
    rutas: ["/mapas", "/mundo", "/mundos", "/vanguard2", "/zona-cero", "/teatro-3d", "/ver-guerra", "/regiones", "/constelacion/[clave]"],
  },
  {
    id: "inteligencia",
    nombre: "Inteligencia y fuentes abiertas",
    pregunta: "¿Cómo se vigila, se verifica y se traduce?",
    color: "#a9b8ff",
    rutas: ["/espia", "/servicios", "/herramientas", "/cruce", "/centinela", "/traductor", "/nucleo"],
  },
  {
    id: "medios",
    nombre: "Escuchar y mirar",
    pregunta: "¿Prefieres oírlo o verlo?",
    color: "#ffd166",
    rutas: ["/audios", "/musica", "/voz", "/galeria", "/vertigo"],
  },
  {
    id: "simulacion",
    nombre: "Jugar y simular",
    pregunta: "¿Y si lo vives tú?",
    color: "#d4af37",
    rutas: ["/cuartel", "/objetivos", "/escenarios", "/zona-cero", "/universo", "/mision", "/clasico", "/vanguard2", "/modo"],
  },
  {
    id: "personal",
    nombre: "Tu espacio y la comunidad",
    pregunta: "¿Dónde guardo lo mío y publico lo que hago?",
    color: "#f472b6",
    rutas: ["/espacio", "/creadores", "/perfil", "/modo", "/mision", "/universo", "/centinela", "/directorio"],
  },
  {
    id: "casa",
    nombre: "La casa por dentro",
    pregunta: "¿Qué hay en Vanguard y cómo funciona?",
    color: "#94a3b8",
    rutas: ["/estado", "/novedades", "/calidad", "/torre", "/catalogo", "/nucleo", "/escudo", "/privacidad", "/navegacion", "/modulos", "/directorio", "/colecciones"],
  },
];

export const TEMA_POR_ID = new Map(TEMAS.map((t) => [t.id, t]));

/** ── Destinos ────────────────────────────────────────────────── */

export interface Destino {
  ruta: string;
  nombre: string;
  descripcion: string;
  /** módulo de la cabecera al que pertenece (o «Núcleo» si solo está en el censo) */
  modulo: string;
  moduloId: string | null;
  temas: string[];
  img: string | null;
  vivo: boolean;
  estado: "VIVO" | "BETA" | "PLAN";
  permiso: "publico" | "cuenta" | "dueno";
  /** texto donde se busca (nombre, descripción, alias del censo) */
  buscar: string;
  /** la familia de fusiones.ts a la que pertenece, si la hay */
  familia: string | null;
  interno: boolean;
  /** «centro»: puerta de primer nivel · «sala»: una de las salas del cuartel */
  nivel: "centro" | "sala";
}

/** Las constelaciones del cuartel, repartidas en los temas del directorio. */
const TEMAS_DE_CONSTELACION: Record<string, string[]> = {
  teatro3d: ["mapas", "simulacion"],
  novedades: ["casa"],
  universo: ["simulacion", "personal"],
  hangar: ["defensa"],
  inteligencia: ["inteligencia", "conflictos"],
  inicio: ["conflictos"],
  juego: ["simulacion"],
  mercado: ["cifras"],
  archivo: ["historia"],
  comando: ["simulacion", "defensa"],
  observatorio: ["conflictos", "inteligencia"],
  estrategia: ["simulacion"],
  emisora: ["medios"],
  oscsuro: ["historia"],
  creadores: ["personal"],
  social: ["personal"],
  sistema: ["casa"],
  experimental: ["casa"],
  arquitecto: ["casa"],
  nueva: ["casa"],
};

function capital(s: string): string {
  const bajo = s.toLowerCase();
  return bajo.charAt(0).toUpperCase() + bajo.slice(1);
}

export function normalizar(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function temasDe(ruta: string): string[] {
  return TEMAS.filter((t) => t.rutas.includes(ruta)).map((t) => t.id);
}

let CACHE: Destino[] | null = null;

/** Todas las puertas de la casa, sin duplicados (una por ruta). */
export function destinos(): Destino[] {
  if (CACHE) return CACHE;
  const porRuta = new Map<string, Destino>();

  // 1 · los módulos de la cabecera: nombre corto, ilustración y frase
  for (const m of MODULOS) {
    for (const p of m.pestanas) {
      if (porRuta.has(p.href)) continue;
      porRuta.set(p.href, {
        ruta: p.href,
        nombre: p.label,
        descripcion: p.txt ?? "",
        modulo: m.nombre,
        moduloId: m.id,
        temas: temasDe(p.href),
        img: p.img ?? null,
        vivo: !!p.vivo,
        estado: "VIVO",
        permiso: "publico",
        buscar: "",
        familia: null,
        interno: SALAS_INTERNAS.includes(p.href),
        nivel: "centro",
      });
    }
  }

  // 2 · el censo del Núcleo: descripción larga, alias, permiso y estado
  for (const n of MODULOS_NUCLEO) {
    if (n.ruta === "/" || n.ruta.includes("[")) continue;
    const ya = porRuta.get(n.ruta);
    if (ya) {
      ya.descripcion = ya.descripcion || n.lema;
      ya.buscar += ` ${n.nombre} ${n.lema} ${n.descripcion} ${n.alias}`;
      ya.estado = n.estado;
      ya.permiso = n.permiso;
      continue;
    }
    porRuta.set(n.ruta, {
      ruta: n.ruta,
      nombre: capital(n.nombre.replace(/^(EL|LA|LOS|LAS)\s+/, "").split(" · ")[0]),
      descripcion: n.lema,
      modulo: "Núcleo",
      moduloId: null,
      temas: temasDe(n.ruta),
      img: null,
      vivo: false,
      estado: n.estado,
      permiso: n.permiso,
      buscar: ` ${n.nombre} ${n.lema} ${n.descripcion} ${n.alias}`,
      familia: null,
      interno: SALAS_INTERNAS.includes(n.ruta),
      nivel: "centro",
    });
  }

  // 3 · las salas del cuartel (mapa-salas.ts): cada una tiene su puerta
  //     /sala/<clave> (v405.8), que explica la sala y la abre en el cuartel
  for (const c of CONSTELACIONES) {
    for (const sala of c.salas) {
      const ruta = `/sala/${sala.clave}`;
      if (porRuta.has(ruta)) continue;
      const puerta = PUERTAS_SALAS[sala.clave];
      const corto = /[a-záéíóúñ]/.test(sala.corto) ? sala.corto : capital(sala.corto);
      porRuta.set(ruta, {
        ruta,
        nombre: corto,
        descripcion: puerta?.lema ?? c.desc,
        modulo: `Cuartel · ${/[a-záéíóúñ]/.test(c.corto) ? c.corto : capital(c.corto)}`,
        moduloId: "juego",
        temas: TEMAS_DE_CONSTELACION[c.clave] ?? ["simulacion"],
        img: null,
        vivo: false,
        estado: "VIVO",
        permiso: "publico",
        buscar: ` ${sala.nombre} ${(puerta?.otrosNombres ?? []).join(" ")} cuartel sala`,
        familia: null,
        interno: false,
        nivel: "sala",
      });
    }
  }

  for (const d of porRuta.values()) {
    d.familia = familiaDeRuta(d.ruta)?.pregunta ?? null;
    d.buscar = normalizar(`${d.nombre} ${d.descripcion} ${d.modulo} ${d.ruta} ${d.buscar}`);
    if (d.temas.length === 0) d.temas = ["casa"];
  }
  CACHE = [...porRuta.values()];
  return CACHE;
}

export function destinoDe(ruta: string): Destino | null {
  const limpia = ruta.split("?")[0];
  return destinos().find((d) => d.ruta === limpia) ?? null;
}

/**
 * «Sigue explorando»: los destinos más cercanos a una ruta. Primero los de su
 * misma familia de módulos (fusiones.ts), después los que comparten más temas.
 * Determinista (sin azar): la misma página recomienda siempre lo mismo.
 */
export function relacionados(ruta: string, limite = 6): Destino[] {
  const base = destinoDe(ruta);
  const temas = base?.temas ?? [];
  const familia = familiaDeRuta(ruta.split("?")[0]);
  const enFamilia = new Set(familia ? [familia.canonico.ruta, ...familia.piezas.map((p) => p.ruta)] : []);
  return destinos()
    .filter((d) => d.ruta !== base?.ruta && !d.interno && d.permiso === "publico" && d.nivel === "centro")
    .map((d) => ({
      d,
      puntos: (enFamilia.has(d.ruta) ? 3 : 0) + d.temas.filter((t) => temas.includes(t)).length * 2 + (d.img ? 0.5 : 0),
    }))
    .filter((x) => x.puntos >= 2)
    .sort((a, b) => b.puntos - a.puntos || a.d.nombre.localeCompare(b.d.nombre, "es"))
    .slice(0, limite)
    .map((x) => x.d);
}

/** ── Colecciones temáticas: recorridos guiados ──────────────── */

export interface Parada {
  ruta: string;
  titulo: string;
  porque: string;
}

export interface Coleccion {
  clave: string;
  titulo: string;
  pregunta: string;
  intro: string;
  tema: string;
  minutos: number;
  paradas: Parada[];
}

export const COLECCIONES: Coleccion[] = [
  {
    clave: "tu-pais-en-el-mundo",
    titulo: "Tu país en el mundo",
    pregunta: "¿Qué lugar ocupa la República Dominicana en el planeta?",
    intro: "Seis paradas para situar a un país con cifras: su ficha, su vecino, su región, sus bloques y su puesto mundial. Funciona con cualquier país: cambia «do» por el código del tuyo.",
    tema: "paises",
    minutos: 15,
    paradas: [
      { ruta: "/mundos/do", titulo: "La ficha de la República Dominicana", porque: "Geografía, economía, vecinos reales y conflictos del archivo, en una sola página." },
      { ruta: "/comparador?p=do,ht", titulo: "La isla, cara a cara", porque: "La Española la comparten dos países: el comparador pone sus cifras una al lado de la otra." },
      { ruta: "/regiones/caribe", titulo: "El Caribe entero", porque: "Cuánta gente vive en la región, cuánto produce y qué peso tiene cada isla." },
      { ruta: "/organizaciones/sica", titulo: "El bloque al que pertenece", porque: "La República Dominicana es miembro pleno del SICA: quiénes son sus socios y cuánto pesan juntos." },
      { ruta: "/rankings/pibPC", titulo: "Su puesto en renta por habitante", porque: "La lista mundial completa, con el año del dato de cada país." },
      { ruta: "/divisas", titulo: "Su moneda frente al mundo", porque: "El peso dominicano entre las monedas oficiales del planeta." },
    ],
  },
  {
    clave: "entender-una-guerra",
    titulo: "Entender una guerra en veinte minutos",
    pregunta: "¿Por dónde empiezo si no sé nada de un conflicto?",
    intro: "Un recorrido de lo urgente a lo profundo: qué pasa hoy, dónde, con qué armas, qué lo explica y qué no se cuenta.",
    tema: "conflictos",
    minutos: 20,
    paradas: [
      { ruta: "/guerra-hoy", titulo: "El resumen de hoy", porque: "Todos los frentes abiertos en una pantalla: el punto de partida." },
      { ruta: "/conflictos", titulo: "El tablero de regiones", porque: "La intensidad medida de cada teatro, para saber cuál pesa más." },
      { ruta: "/cronica", titulo: "Lo que pasó en 24 horas", porque: "La crónica del día, teatro por teatro, con sus fuentes." },
      { ruta: "/armeria", titulo: "Las armas que se usan", porque: "Qué hace cada sistema y en qué conflictos aparece." },
      { ruta: "/historia", titulo: "Las guerras que lo explican", porque: "Los precedentes históricos que ayudan a leer las de hoy." },
      { ruta: "/verdad-cruda", titulo: "Lo que no se dice", porque: "Los abusos documentados, siempre con su fuente." },
      { ruta: "/escenarios", titulo: "¿Y si…?", porque: "Mueve los supuestos y mira la presión. No es una predicción." },
    ],
  },
  {
    clave: "quien-manda",
    titulo: "¿Quién manda en el planeta?",
    pregunta: "¿Dónde se toman las decisiones que afectan a todos?",
    intro: "Del veto en la ONU al gasto militar: los foros, las personas y el dinero que deciden.",
    tema: "paises",
    minutos: 15,
    paradas: [
      { ruta: "/organizaciones/consejo-seguridad", titulo: "Los cinco del veto", porque: "Cinco países pueden frenar cualquier resolución del Consejo de Seguridad." },
      { ruta: "/organizaciones/g20", titulo: "El club de las grandes economías", porque: "Diecinueve países que juntos reúnen la mayor parte del PIB mundial." },
      { ruta: "/rostros", titulo: "Las caras del poder", porque: "Quién decide y quién ejecuta, ficha por ficha." },
      { ruta: "/poder", titulo: "El dinero de la defensa", porque: "El gasto militar real del planeta, país por país." },
      { ruta: "/servicios", titulo: "Los servicios secretos", porque: "Las agencias de inteligencia, con su expediente." },
      { ruta: "/organizaciones", titulo: "Todos los bloques", porque: "Dieciséis organizaciones con sus miembros y su peso real." },
    ],
  },
  {
    clave: "humanidad-en-numeros",
    titulo: "La humanidad en números",
    pregunta: "¿Cuántos somos, dónde vivimos y cuánto vivimos?",
    intro: "Población, densidad y esperanza de vida con datos del Banco Mundial: del total del planeta a las diferencias que separan a dos países.",
    tema: "cifras",
    minutos: 12,
    paradas: [
      { ruta: "/demografia", titulo: "El centro de población", porque: "Cuántos somos, dónde nos concentramos y cuánto vivimos." },
      { ruta: "/rankings/pob", titulo: "Los países más poblados", porque: "La lista mundial completa, de mayor a menor." },
      { ruta: "/rankings/vida", titulo: "Dónde se vive más años", porque: "La esperanza de vida al nacer, país por país." },
      { ruta: "/regiones", titulo: "Las regiones del mundo", porque: "Veinticuatro subregiones con su población y su economía sumadas." },
      { ruta: "/comparador?p=ng,jp", titulo: "Dos pirámides opuestas", porque: "Nigeria y Japón, cifra a cifra: población, renta y años de vida." },
    ],
  },
  {
    clave: "energia-y-dinero",
    titulo: "El petróleo, el dinero y los bloques",
    pregunta: "¿Quién controla la energía y las finanzas?",
    intro: "El cartel del petróleo, las grandes economías emergentes y el dinero del planeta en una sola ruta.",
    tema: "cifras",
    minutos: 12,
    paradas: [
      { ruta: "/organizaciones/opep", titulo: "La OPEP tras la salida de Emiratos", porque: "Once miembros desde mayo de 2026 y lo que pesan juntos." },
      { ruta: "/organizaciones/brics", titulo: "Los BRICS ampliados", porque: "Diez miembros plenos: población y PIB frente al G7." },
      { ruta: "/organizaciones/g7", titulo: "El G7", porque: "Las siete economías industrializadas, para comparar con los BRICS." },
      { ruta: "/rankings/pib", titulo: "Las mayores economías", porque: "El PIB de cada país en dólares corrientes, con su año." },
      { ruta: "/divisas", titulo: "Las monedas del mundo", porque: "Las monedas oficiales y quién las comparte." },
      { ruta: "/pulso-mundial", titulo: "El pulso mundial", porque: "Indicadores del Banco Mundial y la cronología del día." },
    ],
  },
  {
    clave: "aprender-a-verificar",
    titulo: "Aprender a verificar",
    pregunta: "¿Cómo compruebo yo mismo lo que leo?",
    intro: "Las herramientas abiertas que usa un analista: vigilar, traducir, medir distancias y seguir un tema.",
    tema: "inteligencia",
    minutos: 15,
    paradas: [
      { ruta: "/herramientas", titulo: "Las diez llaves", porque: "Herramientas externas de vigilancia, abiertas dentro de la casa." },
      { ruta: "/espia", titulo: "Lo que publican los gobiernos", porque: "Las fuentes oficiales en un radar." },
      { ruta: "/traductor", titulo: "Leer en el idioma original", porque: "Las noticias del mundo traducidas, para comparar versiones." },
      { ruta: "/cruce", titulo: "Medir desde tu casa", porque: "Lo que pasó hoy, con su distancia real hasta ti." },
      { ruta: "/centinela", titulo: "Ponerlo bajo vigilancia", porque: "Elige un tema y la casa te avisa cuando se mueve." },
      { ruta: "/editorial", titulo: "La redacción con fuentes", porque: "Artículos con cada cifra enlazada a su origen." },
    ],
  },
  {
    clave: "primera-visita",
    titulo: "Primera visita a Vanguard",
    pregunta: "Acabo de llegar: ¿qué hay aquí?",
    intro: "Lo esencial de la casa en seis puertas, para saber qué ofrece cada parte antes de quedarte en una.",
    tema: "casa",
    minutos: 10,
    paradas: [
      { ruta: "/mundo", titulo: "El globo vivo", porque: "El planeta en 3D con los teatros encendidos." },
      { ruta: "/guerra-hoy", titulo: "La guerra, hoy", porque: "El resumen de todos los frentes abiertos." },
      { ruta: "/mundos", titulo: "Los países", porque: "El mapa de los mundos: cualquier país con su ficha." },
      { ruta: "/editorial", titulo: "La redacción", porque: "Artículos con fuentes en diez áreas." },
      { ruta: "/cuartel", titulo: "El juego", porque: "El centro de mando: misiones, retos y colecciones." },
      { ruta: "/directorio", titulo: "Todo lo demás", porque: "El directorio completo para buscar cualquier herramienta." },
    ],
  },
];

export function coleccionDe(clave: string): Coleccion | null {
  return COLECCIONES.find((c) => c.clave === clave) ?? null;
}

/** Colecciones que pasan por una ruta (para enlazarlas desde esa página). */
export function coleccionesConRuta(ruta: string): Coleccion[] {
  const limpia = ruta.split("?")[0];
  return COLECCIONES.filter((c) => c.paradas.some((p) => p.ruta.split("?")[0] === limpia));
}

/** Lo que viaja al cliente del directorio (sin funciones). */
export interface DestinoCliente {
  r: string;
  n: string;
  d: string;
  m: string;
  t: string[];
  img: string | null;
  vivo: boolean;
  e: string;
  p: string;
  b: string;
  f: string | null;
  /** 1 = sala del cuartel (va después de los centros) */
  s: 0 | 1;
}

export function payloadDirectorio(): DestinoCliente[] {
  return destinos()
    .filter((d) => d.permiso !== "dueno")
    .map((d) => ({
      r: d.ruta,
      n: d.nombre,
      d: d.descripcion,
      m: d.modulo,
      t: d.temas,
      img: d.img,
      vivo: d.vivo,
      e: d.estado,
      p: d.permiso,
      b: d.buscar,
      f: d.familia,
      s: d.nivel === "sala" ? 1 : 0,
    }));
}

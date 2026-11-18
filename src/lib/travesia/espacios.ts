// ═══════════════════════════════════════════════════════════════════
// v406.0 LA TRAVESÍA — LOS ESPACIOS.
// Cada módulo público de la casa (modulos.ts, fuente única) se convierte en
// un ESPACIO que se recorre: su ilustración, su verbo, sus puertas (las
// mismas salas de siempre) y las HERRAMIENTAS que tienen sentido ahí — todas
// rutas que ya existen. Cero cifras a mano: puertas y cuentas salen de
// modulos.ts y de mapa-salas.ts.
// ═══════════════════════════════════════════════════════════════════
import { MODULOS_PUBLICOS, moduloDe, type Modulo } from "@/components/portada/modulos";
import { SALAS_MAPA, TOTAL_SALAS } from "@/lib/vanguard/mapa-salas";
import { tipoDeRuta, type TipoActividad } from "./rastro";

export type Herramienta = { href: string; label: string; txt: string };

export type Espacio = {
  id: string;
  nombre: string;
  verbo: string;
  lema: string;
  gancho: string;
  img: string;
  color: string;
  entrada: string;
  puertas: { href: string; label: string; txt: string; vivo?: boolean; img?: string }[];
  herramientas: Herramienta[];
};

const H = {
  centinela: { href: "/centinela", label: "Vigílalo", txt: "Pon un frente o un medio bajo tu centinela." },
  traductor: { href: "/traductor", label: "En tu idioma", txt: "Las noticias del mundo, traducidas." },
  globo: { href: "/mundo", label: "Velo en el globo", txt: "Los teatros encendidos sobre el planeta 3D." },
  mapas: { href: "/mapas", label: "Centro de mapas", txt: "Todas las lecturas del planeta en un sistema de mapas." },
  escenarios: { href: "/escenarios", label: "Prueba un escenario", txt: "Mueve los supuestos y mira la presión. Nunca predicción." },
  cruce: { href: "/cruce", label: "Cerca de ti", txt: "Lo que pasó hoy, medido desde tu casa." },
  nucleo: { href: "/nucleo", label: "Ficha de cualquier cosa", txt: "Busca un país, un frente o un documento en el núcleo." },
  poder: { href: "/poder", label: "Compara el poder", txt: "El gasto militar real, país por país." },
  historia: { href: "/historia", label: "El contexto", txt: "Las guerras que enseñaron a leer las de hoy." },
  arsenal3d: { href: "/teatro-3d", label: "Míralo en 3D", txt: "Uniformes, escuadrones y armas de cerca." },
  herramientas: { href: "/herramientas", label: "Las diez llaves", txt: "Herramientas de vigilancia, abiertas en la casa." },
  voz: { href: "/voz", label: "Pregúntale a la voz", txt: "La voz que explica Vanguard y responde." },
  galeria: { href: "/galeria", label: "La fototeca", txt: "Fotografías reales del planeta." },
  objetivos: { href: "/objetivos", label: "Lo de hoy", txt: "Misiones, retos y torneos del día." },
  perfil: { href: "/perfil", label: "Tu carnet", txt: "Tu rango, tu código y tus permisos." },
  modo: { href: "/modo", label: "Tu modo", txt: "Elige por qué puerta te recibe la casa." },
} satisfies Record<string, Herramienta>;

const EXTRA: Record<string, { verbo: string; color: string; herramientas: Herramienta[] }> = {
  conflictos: { verbo: "Investiga", color: "#ff4d5e", herramientas: [H.centinela, H.globo, H.traductor] },
  mapa: { verbo: "Recorre", color: "#6ed6ff", herramientas: [H.mapas, H.escenarios, H.cruce] },
  planeta: { verbo: "Compara", color: "#5eead4", herramientas: [H.mapas, H.poder, H.nucleo] },
  conocimiento: { verbo: "Entiende", color: "#e8c56a", herramientas: [H.nucleo, H.poder, H.traductor] },
  secretos: { verbo: "Descifra", color: "#a9b8ff", herramientas: [H.nucleo, H.historia, H.centinela] },
  arsenal: { verbo: "Analiza", color: "#ff9a4d", herramientas: [H.escenarios, H.arsenal3d, H.globo] },
  datos: { verbo: "Mide", color: "#3ddc97", herramientas: [H.centinela, H.herramientas, H.mapas, H.globo, H.nucleo] },
  medios: { verbo: "Escucha", color: "#ffd166", herramientas: [H.voz, H.galeria, H.traductor] },
  juego: { verbo: "Juega", color: "#d4af37", herramientas: [H.objetivos, H.perfil, H.modo] },
};

function aEspacio(m: Modulo): Espacio {
  const x = EXTRA[m.id] ?? { verbo: "Explora", color: "#e8c56a", herramientas: [] };
  return {
    id: m.id,
    nombre: m.nombre,
    verbo: x.verbo,
    lema: m.lema,
    gancho: m.gancho,
    img: m.img,
    color: x.color,
    entrada: m.nav,
    puertas: m.pestanas.map((p) => ({ href: p.href, label: p.label, txt: p.txt ?? "", vivo: p.vivo, img: p.img })),
    // una herramienta nunca repite una puerta del propio espacio
    herramientas: x.herramientas.filter((h) => !m.pestanas.some((p) => p.href === h.href)),
  };
}

export const ESPACIOS: Espacio[] = MODULOS_PUBLICOS.map(aEspacio);

export const TOTAL_PUERTAS = ESPACIOS.reduce((t, e) => t + e.puertas.length, 0);
export { TOTAL_SALAS };

/** ordena los espacios con la brújula del visitante delante (sin perder ninguno) */
export function ordenarEspacios(intereses: string[] | null | undefined, lista = ESPACIOS): Espacio[] {
  if (!intereses?.length) return lista;
  const pri = intereses.map((id) => lista.find((e) => e.id === id)).filter((e): e is Espacio => !!e);
  return [...pri, ...lista.filter((e) => !intereses.includes(e.id))];
}

const NOMBRE_SALA = new Map(SALAS_MAPA.map((s) => [s.clave, s.corto]));

export function nombreSala(clave: string): string | null {
  return NOMBRE_SALA.get(clave) ?? null;
}

/** título legible de una url de la casa (el de la pestaña del módulo si existe) */
export function tituloDeRuta(url: string, tituloDoc = ""): string {
  const [ruta, query = ""] = url.split("?");
  const sala = new URLSearchParams(query).get("sala");
  if (ruta === "/cuartel" && sala) {
    const n = nombreSala(sala);
    if (n) return `Cuartel · ${n}`;
  }
  if (ruta.startsWith("/sala/")) {
    const n = nombreSala(ruta.slice(6));
    if (n) return n;
  }
  const m = moduloDe(ruta);
  const p = m?.pestanas.find((x) => x.href === ruta);
  if (p) return `${p.label} · ${m!.corto}`;
  const limpio = tituloDoc.replace(/\s*[·|—-]\s*VANGUARD.*$/i, "").trim();
  return limpio || ruta;
}

export function espacioDeRuta(ruta: string): string | null {
  return moduloDe(ruta.split("?")[0])?.id ?? null;
}

export const NOMBRE_TIPO: Record<TipoActividad, { titulo: string; verbo: string }> = {
  investigacion: { titulo: "Investigación", verbo: "Sigue investigando" },
  simulacion: { titulo: "Simulación", verbo: "Vuelve a la partida" },
  proyecto: { titulo: "Proyecto", verbo: "Retoma tu proyecto" },
  exploracion: { titulo: "Exploración", verbo: "Sigue explorando" },
};

export { tipoDeRuta };

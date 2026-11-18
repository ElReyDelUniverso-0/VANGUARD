// v406.1 · LA FORJA — RECONOCIMIENTO (puro, sin BD).
//
// Nada de puntos mágicos: cada insignia sale de algo que la comunidad PUEDE
// comprobar en la página del creador, y la fórmula de la fama es la misma
// lógica que el Paseo de la Fama (v104) ampliada a las obras de La Forja.

export type Historial = {
  obras: { clase: string; estado: string; version: number; ratingSum: number; ratingCount: number; destacada: boolean; fuentes: number; creada: number }[];
  comentariosAprobados: number;
  coleccionesPublicas: { obras: number }[];
  rol: string;
};

export type Insignia = { id: string; nombre: string; detalle: string; color: string };

const publicadas = (h: Historial) => h.obras.filter((o) => o.estado === "APROBADO");

/** semana ISO aproximada (para «constante»: obras en semanas distintas) */
function semana(t: number) {
  return Math.floor(t / (7 * 86400e3));
}

export function insignias(h: Historial): Insignia[] {
  const pub = publicadas(h);
  const por = (c: string) => pub.filter((o) => o.clase === c).length;
  const votos = pub.reduce((s, o) => s + o.ratingCount, 0);
  const suma = pub.reduce((s, o) => s + o.ratingSum, 0);
  const out: Insignia[] = [];
  const add = (cond: boolean, id: string, nombre: string, detalle: string, color: string) => {
    if (cond) out.push({ id, nombre, detalle, color });
  };
  add(h.rol === "dueno", "dueno", "Fundador", "La cuenta del dueño de VANGUARD", "#e8c56a");
  add(h.rol === "moderador", "moderador", "Moderador", "Cuida la comunidad con motivo y bitácora", "#ff6b6b");
  add(h.rol === "verificado", "verificado", "Verificado", "Reconocido por la moderación", "#6ed6ff");
  add(pub.length >= 1, "primera", "Primera obra", "Publicó su primera obra en La Forja", "#f4efe2");
  add(pub.length >= 10, "prolifico", "Prolífico", "10 obras publicadas", "#f4efe2");
  add(por("mapa") >= 3, "cartografo", "Cartógrafo", "3 mapas publicados", "#6ed6ff");
  add(por("escenario") >= 3, "estratega", "Estratega", "3 escenarios publicados", "#ff9f43");
  add(por("simulacion") >= 3, "modelador", "Modelador", "3 simulaciones publicadas", "#c084fc");
  add(por("proyecto") >= 2, "constructor", "Constructor", "2 proyectos publicados", "#e8c56a");
  add(pub.some((o) => o.clase === "investigacion" && o.fuentes >= 3), "riguroso", "Riguroso", "Una investigación con 3 o más fuentes", "#3ddc97");
  add(pub.some((o) => o.version >= 3), "iterador", "Iterador", "Mejoró una obra hasta su versión 3", "#a3e635");
  add(votos >= 5 && suma / votos >= 4, "bien-valorado", "Bien valorado", "Media de 4★ o más con 5 votos o más", "#fbbf24");
  add(pub.some((o) => o.destacada), "destacado", "Obra destacada", "La moderación destacó una de sus obras", "#e8c56a");
  add(new Set(pub.map((o) => semana(o.creada))).size >= 3, "constante", "Constante", "Publicó en 3 semanas distintas", "#94a3b8");
  add(h.coleccionesPublicas.some((c) => c.obras >= 5), "curador", "Curador", "Una colección pública con 5 obras o más", "#f472b6");
  add(h.comentariosAprobados >= 10, "voz", "Voz de la comunidad", "10 comentarios publicados", "#94a3b8");
  return out;
}

/**
 * FAMA = obras×5 + estrellas recibidas×2 + destacadas×15 + versiones extra×1
 * (estrellas recibidas = suma de valoraciones; versiones extra = versión−1 de cada obra)
 */
export function fama(h: Historial): number {
  const pub = publicadas(h);
  return pub.reduce((s, o) => s + 5 + o.ratingSum * 2 + (o.destacada ? 15 : 0) + Math.max(0, o.version - 1), 0);
}

/** rango del creador por fama — escalones fijos y públicos */
export const RANGOS = [
  { min: 0, nombre: "Aprendiz" },
  { min: 10, nombre: "Artesano" },
  { min: 50, nombre: "Forjador" },
  { min: 150, nombre: "Maestro forjador" },
  { min: 400, nombre: "Leyenda de la Forja" },
] as const;

export function rango(f: number): { nombre: string; siguiente: { nombre: string; faltan: number } | null } {
  let i = 0;
  for (let k = 0; k < RANGOS.length; k++) if (f >= RANGOS[k].min) i = k;
  const sig = RANGOS[i + 1];
  return { nombre: RANGOS[i].nombre, siguiente: sig ? { nombre: sig.nombre, faltan: sig.min - f } : null };
}

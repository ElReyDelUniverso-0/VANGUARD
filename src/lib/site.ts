// ============================================================
// v403.4 LA PUERTA BUENA — FUENTE ÚNICA DEL DOMINIO
//
// El diagnóstico de noticias cazó el defecto D3: `canonical`, `og:url` y los
// enlaces del feed apuntaban a `vanguard-kq9r.vercel.app`, un ALIAS DE PREVIEW
// del proyecto, no al dominio donde vive la casa. Google consolida el sitio en
// el dominio equivocado y cada cable compartido enseñaba la puerta de atrás.
//
// Se resuelve en UN sitio: NEXT_PUBLIC_SITE_URL manda (si algún día el Dueño
// pone dominio propio, se cambia ahí y en ningún otro lugar); si no existe, el
// respaldo es el dominio de producción real, no un alias de preview.
// ============================================================
//
// v405.0 LA CASA ÚNICA — LA PUERTA QUE SE COMPARTE ES LA QUE MANDA
//
// Auditoría de la ronda (medida en vivo, no supuesta): el producto tenía TRES
// puertas abiertas y no decían lo mismo.
//   ① vanguard-kq9r.vercel.app — proyecto Vercel prj_uJKJQvYBrY8wRtsS82Jl73cmj1lB.
//      Es la puerta de TODA la campaña (22 enlaces verificados, GitHub Pages,
//      los packs de difusión). Tiene DATABASE_URL y NEXT_PUBLIC_REALTIME_URL
//      configurados: es la casa con memoria.
//   ② vanguard-u6b9.vercel.app — proyecto Vercel prj_9yaVutiX18Qgb2o2ESwcTRGiHIEf.
//      Mismo código, MISMA versión, pero SIN variables de entorno: sirve la
//      SQLite que viaja en el repo. Medido: los mismos tres latidos de
//      presencia daban `online: 3` en ① y `online: 0` en ② — dos universos
//      con contadores distintos (dos casas, dos memorias, dos jugadores).
//   ③ vanguard.world — el dominio del `homepage` del repo y de los textos
//      viejos: NO TIENE DNS. No resuelve desde ninguna red.
// Y el código declaraba canónica a ② (la casa vacía) mientras la campaña
// empujaba a ① (la casa con datos). Cada visita que llegaba por un enlace
// compartido le decía a Google «mi casa de verdad es la otra», y la otra
// respondía con un contador de jugadores en cero.
//
// LA LEY DE ESTA VERSIÓN: una sola casa, una sola canónica, una sola memoria.
// `CASA_OFICIAL` es la puerta que se comparte; `PUERTAS_GEMELAS` son las que
// sirven el mismo código con otra memoria y por eso dejan de ser destino
// (next.config.ts las redirige 301 a la casa). El robot y el sitemap ya leen
// de aquí: no hay una segunda copia del dominio en ningún otro archivo.
// ============================================================

/** La casa con memoria y con todos los enlaces de la campaña (kq9r). */
export const CASA_OFICIAL = "https://vanguard-kq9r.vercel.app";

/**
 * Gemelos del mismo código con OTRA base de datos: sirven la casa, pero su
 * memoria (presencia, contadores, cables) no es la de la casa. No son destino:
 * next.config.ts los redirige 301 a `SITE_URL`.
 */
// v405.1 (IA de diseño) — son TRES proyectos Vercel, no dos. Medido el
// 2026-11-16 como Googlebot: el proyecto `vanguard` (prj_fVFCfOXkltjEBWGQBl5Xtfej6cfE)
// también responde 200 con el mismo HTML y OTRA DATABASE_URL en sus dos alias.
export const PUERTAS_GEMELAS = [
  "vanguard-u6b9.vercel.app",
  "vanguard-chi-puce.vercel.app",
  "vanguard-cuevasgabriel371-7536s-projects.vercel.app",
] as const;

/** Dominios anunciados en textos viejos que hoy no existen. Se listan para que
 *  nadie los vuelva a poner en un canonical: si algún día el Dueño registra el
 *  dominio, basta NEXT_PUBLIC_SITE_URL (no se toca código). */
export const DOMINIOS_SIN_DNS = ["vanguard.world"] as const;

const CRUDO = process.env.NEXT_PUBLIC_SITE_URL || CASA_OFICIAL;

export const SITE_URL = CRUDO.replace(/\/+$/, "");

/** ¿Este host es un gemelo (otra memoria de la misma casa)? */
export function esPuertaGemela(host: string | null | undefined): boolean {
  if (!host) return false;
  const limpio = host.toLowerCase().split(":")[0];
  return (PUERTAS_GEMELAS as readonly string[]).includes(limpio);
}

/** El host que se sirve, visto desde el navegador del visitante ("" en servidor). */
export function hostActual(): string {
  if (typeof window === "undefined") return "";
  return window.location.hostname;
}

// una imagen relativa del repositorio, servida desde el dominio bueno
export function urlAbsoluta(u: string | null | undefined): string | null {
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("/")) return `${SITE_URL}${u}`;
  return null;
}

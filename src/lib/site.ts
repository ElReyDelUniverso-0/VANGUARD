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

// v404.1 — DECISIÓN DEL DUEÑO (2026-11-16): la casa es vanguard-kq9r.vercel.app.
// Medido: es el proyecto del Dueño (COORDINACION.md: «app viva»), el ÚNICO de
// los tres proyectos Vercel con base de datos Y tiempo real, el enlace de la
// bio y de 79 archivos del repo. u6b9 no tiene ninguna variable de entorno.
// Los otros dos proyectos se retiran y sus direcciones redirigen aquí (308):
// ver redireccion-casa/ y docs/VANGUARD_UNIVERSO.md.
const CRUDO = process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const SITE_URL = CRUDO.replace(/\/+$/, "");

// una imagen relativa del repositorio, servida desde el dominio bueno
export function urlAbsoluta(u: string | null | undefined): string | null {
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("/")) return `${SITE_URL}${u}`;
  return null;
}

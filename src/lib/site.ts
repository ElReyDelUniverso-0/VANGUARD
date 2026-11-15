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

const CRUDO = process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-u6b9.vercel.app";

export const SITE_URL = CRUDO.replace(/\/+$/, "");

// una imagen relativa del repositorio, servida desde el dominio bueno
export function urlAbsoluta(u: string | null | undefined): string | null {
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("/")) return `${SITE_URL}${u}`;
  return null;
}

/** Misión 003 · URLs canónicas — para detectar la MISMA noticia aunque venga con utm, www o fragmento. */
const PARAMETROS_BASURA = /^(utm_[a-z]+|fbclid|gclid|dclid|mc_cid|mc_eid|_ga|ref|source|feature|cmp)$/i;

export function canonicalizarUrl(raw: string): string {
  const limpia = (raw || "").trim();
  if (!limpia) return "";
  try {
    const u = new URL(limpia);
    let host = u.hostname.toLowerCase().replace(/^www\./, "");
    const params = new URLSearchParams();
    for (const [k, v] of u.searchParams) {
      if (PARAMETROS_BASURA.test(k)) continue;
      params.append(k.toLowerCase(), v);
    }
    const qs = params.toString();
    let path = u.pathname.replace(/\/{2,}/g, "/").replace(/\/+$/, "");
    return `${host}${path}${qs ? "?" + qs : ""}`;
  } catch {
    return limpia.toLowerCase().replace(/\/+$/, "");
  }
}

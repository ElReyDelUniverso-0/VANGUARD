// v105.0 LA REDACCIÓN — búsqueda alternativa de hallazgos REALES para el
// lambda de producción. El gateway de búsqueda (web_search) vive detrás del
// mismo dominio bloqueado que el chat, así que en Vercel caemos al canal que
// SÍ siempre ha salido del lambda: los RSS de medios reales. Google News RSS
// acepta búsqueda por consulta y devuelve titulares con medio y fecha —
// exactamente lo que una investigación honesta necesita citar.

export interface HallazgoRss {
  titulo: string;
  medio: string;
  fecha: string;
  fragmento: string;
}

function decodeCdata(s: string): string {
  return s.replace(/^\s*<!\[CDATA\[/, "").replace(/\]\]>\s*$/, "").trim();
}

function unescapeXml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function limpiar(s: string, max: number): string {
  return String(s ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export async function busquedaAlternativa(q: string, max = 8): Promise<HallazgoRss[]> {
  const out: HallazgoRss[] = [];
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=es-419&gl=US&ceid=US:es-419`;
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      headers: { "User-Agent": "Vanguard/2.0" },
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(t);
    if (!res.ok) return out;
    const xml = await res.text();
    const chunks = xml.split(/<item[\s>]/).slice(1);
    for (const raw of chunks.slice(0, max)) {
      const titulo = limpiar(unescapeXml(decodeCdata(raw.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "")), 220);
      if (!titulo) continue;
      const medio = limpiar(unescapeXml(decodeCdata(raw.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] ?? "")), 60) || "Google News";
      const fechaRaw = raw.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? "";
      const fecha = fechaRaw ? limpiar(new Date(fechaRaw).toISOString().slice(0, 10), 10) : "";
      out.push({ titulo, medio, fecha, fragmento: "" });
      if (out.length >= max) break;
    }
  } catch {
    /* la red alternativa no respondió: la sala lo dirá con honestidad */
  }
  return out;
}

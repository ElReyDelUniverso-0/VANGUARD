import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// v51.3 — GET /api/efemerides — EFEMÉRIDES DE HOY: qué pasó un día como hoy
// en la historia, en español, con datos REALES de la API de Wikimedia
// (feed "onthisday", gratuita, SIN API key, sin registro). Caché en memoria
// 60 min: el contenido solo cambia a medianoche, así que una hora es de sobra.
// Selección: mezcla de "selected" (curados por editores) y "events", filtrados
// a los más relevantes para el tono del juego (guerra, política, espionaje,
// ciencia y catástrofes) y ordenados del más reciente al más antiguo.

interface RawItem {
  text?: string;
  year?: number;
  pages?: { content_urls?: { desktop?: { page?: string } }; title?: string }[];
}

interface Efem {
  year: number;
  text: string;
  link: string | null;
}

let cache: { at: number; dateKey: string; data: Efem[] } | null = null;
const TTL = 60 * 60 * 1000;

// palabras clave para priorizar contenido bélico/histórico sin excluir lo demás
const HOT = /guerra|batalla|firma|tratado|independ|revoluc|atentad|bomba|misil|ataque|invasi|accidente|terremoto|explosi|nuclear|espion|golpe|asalt|derrib|asesin|elecc|constituc|espacial|satélite|primer|fundac/i;

function pickUrl(it: RawItem): string | null {
  const p = it.pages?.find((x) => x.content_urls?.desktop?.page);
  return p?.content_urls?.desktop?.page ?? null;
}

function clean(text: string): string {
  return text.replace(/\s+/g, " ").replace(/^\W+\s/, "").trim();
}

export async function GET() {
  const now = new Date();
  const dateKey = `${now.getUTCDate()}-${now.getUTCMonth() + 1}`;
  if (cache && cache.dateKey === dateKey && Date.now() - cache.at < TTL) {
    return NextResponse.json({ ok: true, dateKey, efemerides: cache.data, cached: true });
  }

  try {
    const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(now.getUTCDate()).padStart(2, "0");
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const r = await fetch(
      `https://api.wikimedia.org/feed/v1/wikipedia/es/onthisday/selected/${mm}/${dd}`,
      { signal: ctrl.signal, headers: { "User-Agent": "VANGUARD/51.3 (juego educativo)" } }
    );
    clearTimeout(t);
    if (!r.ok) throw new Error(`wikimedia ${r.status}`);
    const j = (await r.json()) as { selected?: RawItem[] };

    let items = j.selected ?? [];
    if (items.length < 6) {
      // si "selected" trae poco, ensancha con la lista general de eventos
      const r2 = await fetch(
        `https://api.wikimedia.org/feed/v1/wikipedia/es/onthisday/events/${mm}/${dd}`,
        { headers: { "User-Agent": "VANGUARD/51.3 (juego educativo)" } }
      );
      if (r2.ok) {
        const j2 = (await r2.json()) as { events?: RawItem[] };
        items = [...items, ...(j2.events ?? [])];
      }
    }

    const seen = new Set<string>();
    const data: Efem[] = items
      .filter((it) => it.text && typeof it.year === "number" && it.year > 0)
      .map((it) => ({ year: it.year as number, text: clean(it.text as string), link: pickUrl(it) }))
      .filter((it) => {
        const k = `${it.year}|${it.text.slice(0, 40)}`;
        if (seen.has(k) || it.text.length < 40 || it.text.length > 320) return false;
        seen.add(k);
        return true;
      })
      .sort((a, b) => {
        const ha = HOT.test(a.text) ? 1 : 0;
        const hb = HOT.test(b.text) ? 1 : 0;
        if (ha !== hb) return hb - ha;
        return b.year - a.year;
      })
      .slice(0, 12);

    if (data.length === 0) throw new Error("sin efemérides");
    cache = { at: Date.now(), dateKey, data };
    return NextResponse.json({ ok: true, dateKey, efemerides: data });
  } catch (e) {
    // degradación digna: si hay caché del día se sirve; si no, ok:false sin 500 seco
    if (cache && cache.dateKey === dateKey) {
      return NextResponse.json({ ok: true, dateKey, efemerides: cache.data, cached: true });
    }
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "error efemérides", efemerides: [] },
      { status: 200 }
    );
  }
}

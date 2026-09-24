"use client";

// v43.0 RADAR GEOPOLÍTICO GLOBAL — sección cliente de /guerra-hoy.
//  · GDACS: vía /api/geopolitics (server).
//  · GDELT: DIRECTO desde este navegador a api.gdeltproject.org — su API es
//    abierta con CORS *, pero limita 1 petición cada 5 s POR IP; desde el
//    navegador del visitante no hay saturación y las dos llamadas (ES y EN)
//    van espaciadas 6 s. Sin servidores de por medio: coste cero.
// Degradación: fuente vacía -> "sin señal"; fallo total -> retry manual.

import { useCallback, useEffect, useState } from "react";
import { Radio, Newspaper, AlertTriangle, ExternalLink } from "lucide-react";

type RadarItem = { title: string; url: string; source: string; seen: string };
type GdeltArt = { url?: string; title?: string; domain?: string; seendate?: string };

function fmtGdeltDate(s: string): string {
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/.exec(s ?? "");
  return m ? `${m[3]}/${m[2]} ${m[4]}:${m[5]}` : "";
}

function parseGdelt(j: { articles?: GdeltArt[] } | null): RadarItem[] {
  const arts = Array.isArray(j?.articles) ? j!.articles : [];
  return arts
    .filter((a) => a.title && a.url)
    .slice(0, 12)
    .map((a) => ({
      title: String(a.title).slice(0, 220),
      url: String(a.url),
      source: String(a.domain ?? "gdelt"),
      seen: fmtGdeltDate(String(a.seendate ?? "")),
    }));
}

async function fetchGdeltDirect(query: string, max: number): Promise<RadarItem[]> {
  const p = new URLSearchParams({
    query,
    mode: "artlist",
    maxrecords: String(max),
    format: "json",
    sort: "datedesc",
  });
  const r = await fetch(`https://api.gdeltproject.org/api/v2/doc/doc?${p.toString()}`, {
    signal: AbortSignal.timeout(12_000),
  });
  if (!r.ok) throw new Error(`gdelt ${r.status}`);
  const txt = await r.text();
  if (!txt.trimStart().startsWith("{")) throw new Error("gdelt rate-limit");
  return parseGdelt(JSON.parse(txt));
}

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

function fmtHora(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString("es-DO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function RadarList({ items, empty }: { items: RadarItem[]; empty: string }) {
  if (!items.length) {
    return <p className="mt-2 text-[11px] font-mono text-muted-foreground">{empty}</p>;
  }
  return (
    <ul className="mt-2 divide-y divide-border/60">
      {items.map((a, i) => (
        <li key={`${a.url}-${i}`} className="py-1.5">
          <a
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-2 text-[12px] leading-snug"
          >
            <span className="mt-0.5 text-electric opacity-60 group-hover:opacity-100">
              <ExternalLink className="h-3 w-3" />
            </span>
            <span className="min-w-0">
              <span className="text-foreground group-hover:text-electric line-clamp-2">
                {a.title}
              </span>
              <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground">
                {a.source}
                {a.seen ? ` · ${a.seen}` : ""}
              </span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function GeopoliticsRadar() {
  const [gdeltEs, setGdeltEs] = useState<RadarItem[] | null>(null);
  const [gdeltEn, setGdeltEn] = useState<RadarItem[] | null>(null);
  const [gdacs, setGdacs] = useState<RadarItem[] | null>(null);
  const [gdacsAt, setGdacsAt] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    setGdeltEs(null);
    setGdeltEn(null);
    setGdacs(null);
    setGdacsAt(null);

    // GDACS por el servidor + GDELT ES directo del navegador, en paralelo
    const esP = fetchGdeltDirect(
      "(war OR conflict OR military OR guerra OR militar OR ataque OR ofensiva) sourcelang:spanish",
      12
    )
      .then(setGdeltEs)
      .catch(() => setGdeltEs([]));
    const rwP = fetch("/api/geopolitics", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { ok?: boolean; gdacs?: RadarItem[]; cachedAt?: string | null }) => {
        setGdacs(Array.isArray(j.gdacs) ? j.gdacs : []);
        setGdacsAt(j.cachedAt ?? null);
      })
      .catch(() => setGdacs([]));

    await Promise.all([esP, rwP]);

    // GDELT EN a los 6 s de la ES: la API admite 1 petición cada 5 s por IP
    await sleep(6_000);
    await fetchGdeltDirect(
      "(war OR conflict OR military OR offensive OR airstrike) sourcelang:english",
      10
    )
      .then(setGdeltEn)
      .catch(() => setGdeltEn([]));

    setLoading(false);
    if (gdacs?.length === 0 && !gdeltEs?.length) setFailed(true);
  }, [gdacs, gdeltEs]);

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="mt-8 border border-border rounded-md p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Radio className="h-4 w-4 text-sky-300 animate-pulse" />
        <h2 className="font-mono text-[11px] uppercase tracking-widest text-sky-300">
          Radar geopolítico global — el mundo entero, ahora
        </h2>
        <span className="ml-auto font-mono text-[10px] text-muted-foreground">
          {loading
            ? "escaneando fuentes..."
            : gdacsAt
              ? `alertas actualizadas ${fmtHora(gdacsAt)} · refresco 5 min`
              : ""}
        </span>
      </div>
      <p className="mt-2 text-[11px] font-mono text-muted-foreground leading-relaxed">
        Titulares de guerra y conflicto monitorizados por GDELT (~100.000 medios
        del planeta, datos abiertos) + alertas de desastres de GDACS (Comisión
        Europea). Sin API keys: inteligencia abierta de verdad.
      </p>

      {loading ? (
        <div className="mt-3 space-y-2" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-8 rounded-sm bg-border/30 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          <div>
            <h3 className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <Newspaper className="h-3 w-3 text-electric" /> Conflicto en español
            </h3>
            <RadarList items={gdeltEs ?? []} empty="Sin señal de GDELT en español ahora mismo." />
          </div>
          <div>
            <h3 className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <Newspaper className="h-3 w-3 text-electric" /> Conflict in English
            </h3>
            <RadarList items={gdeltEn ?? []} empty="No GDELT signal in English right now." />
          </div>
          <div>
            <h3 className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <AlertTriangle className="h-3 w-3 text-amber" /> Alertas de desastres (GDACS)
            </h3>
            <RadarList items={gdacs ?? []} empty="Sin alertas activas de GDACS ahora mismo." />
          </div>
        </div>
      )}

      {!loading && failed && (
        <button
          onClick={load}
          className="mt-3 font-mono text-[11px] text-electric underline underline-offset-2"
        >
          REINTENTAR RADAR
        </button>
      )}
    </section>
  );
}

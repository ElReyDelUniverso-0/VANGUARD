"use client";

// v43.0 RADAR GEOPOLÍTICO GLOBAL — sección cliente de /guerra-hoy.
// Consumo de /api/geopolitics (GDELT + GDACS): titulares de conflicto del
// mundo entero y alertas de desastres, SIN API key y a coste cero.
// Degradación: fuente vacía -> "sin señal"; fallo total -> retry manual.

import { useCallback, useEffect, useState } from "react";
import { Radio, Newspaper, AlertTriangle, ExternalLink } from "lucide-react";

type RadarItem = { title: string; url: string; source: string; seen: string };
type RadarData = {
  ok: boolean;
  gdeltEs: RadarItem[];
  gdeltEn: RadarItem[];
  gdacs: RadarItem[];
  cachedAt: string | null;
};

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

function RadarList({
  items,
  empty,
}: {
  items: RadarItem[];
  empty: string;
}) {
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
  const [data, setData] = useState<RadarData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/geopolitics", { cache: "no-store" });
      const j = (await r.json()) as RadarData;
      setData(j);
    } catch {
      setData({ ok: false, gdeltEs: [], gdeltEn: [], gdacs: [], cachedAt: null });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
            : data?.cachedAt
              ? `actualizado ${fmtHora(data.cachedAt)} · refresco 5 min`
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
            <RadarList items={data?.gdeltEs ?? []} empty="Sin señal de GDELT en español ahora mismo." />
          </div>
          <div>
            <h3 className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <Newspaper className="h-3 w-3 text-electric" /> Conflict in English
            </h3>
            <RadarList items={data?.gdeltEn ?? []} empty="No GDELT signal in English right now." />
          </div>
          <div>
            <h3 className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <AlertTriangle className="h-3 w-3 text-amber" /> Alertas de desastres (GDACS)
            </h3>
            <RadarList items={data?.gdacs ?? []} empty="Sin alertas activas de GDACS ahora mismo." />
          </div>
        </div>
      )}

      {!loading && !data?.ok && (
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

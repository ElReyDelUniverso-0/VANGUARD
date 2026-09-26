"use client";

// v52.1 TABLERO GEOPOLÍTICO — la sala de inteligencia bajo la ciudad.
// Datos reales de fuentes abiertas servidos por /api/geo-tablero:
//   · Despachos de conflicto por región (GDELT, ~100.000 medios del mundo)
//   · Aeronaves militares en el aire AHORA (ADS-B público vía adsb.lol)
//   · Sismos M4.5+ de la semana (USGS)
//   · Índice Kp planetary (NOAA): tormenta geomagnética = GPS y radio tocados
// Rota las 5 regiones automáticamente cada 35 s (una petición por ciclo para
// respetar el límite de GDELT); el visitante puede fijar la región que quiera.

import { useCallback, useEffect, useRef, useState } from "react";
import { Plane, Globe2, Activity, Radio } from "lucide-react";

interface Art { title: string; url: string; domain: string; country: string }
interface MilData { total: number; types: { t: string; n: number }[]; samples: { cs: string; t: string; gs: number; lat: number; lon: number }[] }
interface Quake { mag: number; place: string; url: string; ago: string }
interface Payload {
  ts: number;
  regionIdx: number;
  region: { name: string; arts: Art[]; live: boolean } | null;
  mil: MilData | null;
  quakes: Quake[] | null;
  kp: { kp: number; storm: string } | null;
}

const REGION_TABS = ["EUROPA DEL ESTE", "MEDIO ORIENTE", "ÁFRICA", "ASIA-PACÍFICO", "AMÉRICA LATINA"];

export function ZonaCeroGeo() {
  const [data, setData] = useState<Payload | null>(null);
  const [tab, setTab] = useState(0); // región visible
  const [auto, setAuto] = useState(true);
  const shownRef = useRef(0); // última región PEDIDA al servidor

  const pull = useCallback(async (r: number) => {
    shownRef.current = r;
    try {
      const res = await fetch(`/api/geo-tablero?r=${r}`, { cache: "no-store" });
      if (!res.ok) return;
      const j = (await res.json()) as Payload;
      // no pisa una respuesta de una región más nueva que ya llegó
      if (shownRef.current === j.regionIdx) setData(j);
    } catch { /* reintenta en el próximo ciclo */ }
  }, []);

  useEffect(() => {
    const t0 = window.setTimeout(() => pull(0), 300);
    let iv = 0;
    if (auto) {
      iv = window.setInterval(() => {
        const nx = (shownRef.current + 1) % REGION_TABS.length;
        setTab(nx);
        pull(nx);
      }, 35000);
    }
    return () => { window.clearTimeout(t0); if (iv) window.clearInterval(iv); };
  }, [auto, pull]);

  const pickTab = (i: number) => {
    setAuto(false);
    setTab(i);
    pull(i);
  };

  const arts = tab === data?.regionIdx ? (data?.region?.arts ?? []) : [];

  return (
    <div className="border border-zinc-800 rounded-lg bg-zinc-900/40 overflow-hidden">
      {/* cabecera */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 bg-black/40 px-4 py-3">
        <Globe2 className="w-4 h-4 text-emerald-300" />
        <h2 className="font-mono text-[11px] uppercase tracking-[0.24em] text-emerald-300">
          Tablero geopolítico · datos reales
        </h2>
        <span className="ml-auto flex items-center gap-1.5 font-mono text-[9px] text-zinc-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
          OSINT sin API keys · se actualiza solo
        </span>
      </div>

      {/* pestañas de región */}
      <div className="flex gap-1 px-3 pt-2.5 overflow-x-auto">
        {REGION_TABS.map((name, i) => (
          <button
            key={name}
            onClick={() => pickTab(i)}
            className={`whitespace-nowrap font-mono text-[9.5px] tracking-wider rounded-t px-2.5 py-1.5 border-b-2 transition-colors ${
              tab === i
                ? "border-amber-400 text-amber-300 bg-amber-400/10"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
            aria-label={`Ver despachos de ${name}`}
          >
            {name}
          </button>
        ))}
        <button
          onClick={() => setAuto((a) => !a)}
          className={`ml-auto whitespace-nowrap font-mono text-[9px] rounded px-2 py-1.5 border transition-colors ${
            auto ? "border-emerald-400/50 text-emerald-300" : "border-zinc-700 text-zinc-500"
          }`}
          title="Rotación automática de regiones"
        >
          {auto ? "AUTO ▸" : "AUTO ∥"}
        </button>
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-0">
        {/* despachos de la región */}
        <div className="px-4 py-3 border-t border-zinc-800 min-h-[190px]">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500 mb-2">
            Radar de medios · {REGION_TABS[tab]}
            {data?.regionIdx === tab && data.region && !data.region.live && (
              <span className="text-amber-400 normal-case tracking-normal"> · reintentando señal</span>
            )}
          </p>
          {arts.length === 0 ? (
            <p className="font-mono text-[10px] text-zinc-600 leading-relaxed">
              Escaneando las portadas del mundo… Si el radar tarda, es que el planeta
              está en calma o la señal está saturada: reintenta en un minuto.
            </p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {arts.slice(0, 5).map((a) => (
                <li key={a.url}>
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="block font-mono text-[10px] leading-snug text-zinc-400 hover:text-amber-200 transition-colors"
                  >
                    <span className="text-emerald-400">▮</span> {a.title}
                    <span className="text-zinc-600"> — {a.domain}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* columnas laterales: aéreo militar / sismos / Kp */}
        <div className="border-t lg:border-t lg:border-l border-zinc-800 grid sm:grid-cols-2 lg:grid-cols-1">
          <div className="px-4 py-3 border-b border-zinc-800">
            <p className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-sky-300 mb-1.5">
              <Plane className="w-3 h-3" /> Aéreo militar en vivo · ADS-B
            </p>
            {data?.mil ? (
              <>
                <p className="font-mono text-[13px] text-sky-200">
                  {data.mil.total} aeronaves militares en el aire ahora mismo
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {data.mil.types.slice(0, 5).map((tp) => (
                    <span key={tp.t} className="border border-sky-500/30 rounded px-1.5 py-0.5 font-mono text-[9px] text-sky-300">
                      {tp.t} ×{tp.n}
                    </span>
                  ))}
                </div>
                {data.mil.samples.length > 0 && (
                  <p className="mt-1.5 font-mono text-[9px] text-zinc-500 leading-relaxed">
                    Ej.: {data.mil.samples.slice(0, 2).map((s) => `${s.cs} (${s.t}, ${s.gs} kt)`).join(" · ")}
                  </p>
                )}
              </>
            ) : (
              <p className="font-mono text-[10px] text-zinc-600">Conectando con la red ADS-B…</p>
            )}
          </div>

          <div className="px-4 py-3 sm:border-l lg:border-l-0 border-zinc-800">
            <p className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-orange-300 mb-1.5">
              <Activity className="w-3 h-3" /> Sismos M4.5+ semana · USGS
            </p>
            {data?.quakes && data.quakes.length > 0 ? (
              <ul className="flex flex-col gap-1">
                {data.quakes.slice(0, 3).map((q) => (
                  <li key={q.url} className="font-mono text-[10px] text-orange-200/90 leading-snug">
                    M {q.mag.toFixed(1)} — {q.place} <span className="text-zinc-600">· hace {q.ago}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-mono text-[10px] text-zinc-600">Sin sismos significativos registrados.</p>
            )}
            <p className="mt-2 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-violet-300">
              <Radio className="w-3 h-3" /> Kp planetary (NOAA)
            </p>
            {data?.kp ? (
              <p className="font-mono text-[10px] text-violet-200/90">
                Kp {data.kp.kp.toFixed(1)} — tormenta{" "}
                <span className={data.kp.kp >= 5 ? "text-red-300" : "text-violet-300"}>{data.kp.storm}</span>
                <span className="text-zinc-600"> · GPS/radio</span>
              </p>
            ) : (
              <p className="font-mono text-[10px] text-zinc-600">Leyendo el clima espacial…</p>
            )}
          </div>
        </div>
      </div>

      <p className="border-t border-zinc-800 bg-black/30 px-4 py-2 font-mono text-[9px] text-zinc-600 leading-relaxed">
        Fuentes abiertas: GDELT Project (despachos), red ADS-B de adsb.lol (aéreo militar),
        USGS (sismos), NOAA SWPC (clima espacial). Titulares enlazados a sus medios
        originales — VANGUARD no edita ni interpeta la noticia.
      </p>
    </div>
  );
}

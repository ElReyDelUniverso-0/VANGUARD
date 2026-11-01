"use client";

// ════════════════════════════════════════════════════════════════
// v215.0 EL MUNDO — EL GLOBO VIVO (client).
// Reusa el motor GlobeMap3D de la casa (globe.gl + polígonos reales):
//  · teatros de guerra encendidos por cables reales de 24 h (anillo pulsante)
//  · plazas del poder: gobiernos, ONU/OTAN y gargantas estratégicas
//  · arcos de las grandes fricciones (Rusia▸Ucrania, Irán▸Israel…)
//  · territorios que se tiñen por intensidad; vista OSCURIDAD/SATÉLITE/NOCHE
//  · sondeo /api/mundo cada 60 s con pestaña visible — la página jamás
//    se recarga (ley v190) y respeta prefers-reduced-motion (ley de la casa)
// ════════════════════════════════════════════════════════════════

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Globe3DArc, Globe3DMarker, GlobeFlyTo, GlobeViewMode } from "@/components/vanguard/globe-map-3d";
import {
  ARCAS_MUNDO,
  PLAZAS_MUNDO,
  TEATRO_TERRITORIO,
  colorPorCables,
  colorTension,
  haceDe,
  recortar,
  tensionPorCables,
} from "@/lib/mundo";
import type { InstantaneaMundo } from "@/lib/mundo-datos";

const GlobeMap3D = dynamic(
  () => import("@/components/vanguard/globe-map-3d").then((m) => m.GlobeMap3D),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full rounded-md border border-zinc-800 bg-zinc-900/40 flex items-center justify-center"
        style={{ height: "min(72vh, 700px)", minHeight: 320 }}
      >
        <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500 animate-pulse">
          Desplegando el planeta…
        </p>
      </div>
    ),
  }
);

const COLOR_PLAZA = "#7DD3FC";
const COLOR_ORG = "#C4B5FD";
const COLOR_GARGANTA = "#FBBF24";

type Seleccion =
  | { kind: "teatro"; slug: string }
  | { kind: "plaza"; id: string }
  | null;

interface Props {
  inicial: InstantaneaMundo | null;
  teatroInicial: string | null;
}

export function Mundo3DVivo({ inicial, teatroInicial }: Props) {
  // ?teatro=ukraine — el teatro pedido nace seleccionado (estado inicial,
  // sin efectos: el compilador de React veta los setState en cascada)
  const teatroInicialValido =
    teatroInicial && inicial?.teatros.some((t) => t.slug === teatroInicial)
      ? teatroInicial
      : null;
  const [snap, setSnap] = useState<InstantaneaMundo | null>(inicial);
  const [seleccion, setSeleccion] = useState<Seleccion>(
    teatroInicialValido ? { kind: "teatro", slug: teatroInicialValido } : null
  );
  const [pestana, setPestana] = useState<"teatros" | "lugares">("teatros");
  const [modo, setModo] = useState<GlobeViewMode>("oscuridad");
  const [flyTo, setFlyTo] = useState<GlobeFlyTo | null>(() => {
    const t = teatroInicialValido
      ? inicial?.teatros.find((x) => x.slug === teatroInicialValido)
      : null;
    return t ? { lat: t.lat, lng: t.lng, altitude: 1.35, nonce: 1 } : null;
  });
  // reduced-motion: el planeta no gira si el cuerpo pide calma — se lee UNA
  // vez en el arranque (SSR seguro: window no existe ahí y devolvemos calma)
  const [reducido] = useState<boolean>(() => {
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      return false;
    }
  });

  const sondear = async () => {
    if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
    try {
      const res = await fetch("/api/mundo", { cache: "no-store" });
      if (!res.ok) return;
      const j = (await res.json()) as InstantaneaMundo & { ok?: boolean };
      if (j && Array.isArray(j.teatros)) setSnap(j);
    } catch {
      /* el próximo latido vuelve a intentarlo */
    }
  };

  // latido del planeta: sondeo cada 60 s; si la server no pudo entregar la
  // instantánea (BD fría), el primer latido sale diferido — sin cascadas
  useEffect(() => {
    const t = setInterval(() => {
      void sondear();
    }, 60_000);
    if (!inicial) {
      const primero = setTimeout(() => {
        void sondear();
      }, 350);
      return () => {
        clearInterval(t);
        clearTimeout(primero);
      };
    }
    return () => {
      clearInterval(t);
    };
  }, []);

  const teatros = snap?.teatros ?? [];
  const teatroSel = seleccion?.kind === "teatro" ? teatros.find((t) => t.slug === seleccion.slug) ?? null : null;
  const plazaSel = seleccion?.kind === "plaza" ? PLAZAS_MUNDO.find((p) => p.id === seleccion.id) ?? null : null;

  const seleccionarTeatro = (slug: string) => {
    const t = snap?.teatros.find((x) => x.slug === slug);
    if (!t) return;
    setSeleccion({ kind: "teatro", slug });
    setFlyTo({ lat: t.lat, lng: t.lng, altitude: 1.35, nonce: Date.now() });
  };

  const seleccionarPlaza = (id: string) => {
    const p = PLAZAS_MUNDO.find((x) => x.id === id);
    if (!p) return;
    setSeleccion({ kind: "plaza", id });
    setFlyTo({ lat: p.lat, lng: p.lng, altitude: 0.95, nonce: Date.now() });
  };

  // ---- datos derivados del globo ----
  const markers: Globe3DMarker[] = [];
  for (const t of teatros) {
    markers.push({
      id: `teatro-${t.slug}`,
      lat: t.lat,
      lng: t.lng,
      color: colorPorCables(t.n),
      size: t.n > 0 ? 0.34 + Math.min(0.3, t.n / 150) : 0.2,
      alt: t.n > 0 ? 0.05 + Math.min(0.06, t.n / 800) : 0.03,
      ring: t.n > 0,
      ringMax: t.n > 0 ? 3 + Math.min(5, Math.floor(t.n / 12)) : undefined,
      labelTag: t.n > 0 ? `TEATRO EN VIVO · ${t.n} cables hoy` : "TEATRO · sin cables en 24 h",
      label: t.ultimo ? `${t.nombre} — ${recortar(t.ultimo.t, 90)}` : t.nombre,
      onClick: () => seleccionarTeatro(t.slug),
    });
  }
  for (const p of PLAZAS_MUNDO) {
    markers.push({
      id: `plaza-${p.id}`,
      lat: p.lat,
      lng: p.lng,
      color: p.tipo === "organizacion" ? COLOR_ORG : p.tipo === "estrategico" ? COLOR_GARGANTA : COLOR_PLAZA,
      size: 0.16,
      alt: 0.03,
      labelTag:
        p.tipo === "organizacion"
          ? "ORGANIZACIÓN"
          : p.tipo === "estrategico"
            ? "GARGANTA ESTRATÉGICA"
            : "GOBIERNO",
      label: `${p.nombre} — ${p.detalle}`,
      onClick: () => seleccionarPlaza(p.id),
    });
  }

  const arcs: Globe3DArc[] = ARCAS_MUNDO.map((a) => ({
    startLat: a.desde.lat,
    startLng: a.desde.lng,
    endLat: a.hasta.lat,
    endLng: a.hasta.lng,
    color: a.color,
    dashTime: 2600,
    stroke: 0.6,
  }));

  // territorios del juego teñidos por la intensidad del teatro más caliente
  const maxN: Record<string, number> = {};
  for (const t of teatros) {
    if (t.n <= 0) continue;
    const tid = TEATRO_TERRITORIO[t.slug];
    if (!tid) continue;
    maxN[tid] = Math.max(maxN[tid] ?? 0, t.n);
  }
  const territoryColors: Record<string, string> | null = Object.keys(maxN).length
    ? Object.fromEntries(Object.entries(maxN).map(([tid, n]) => [tid, colorPorCables(n)]))
    : null;

  const highlightTerritory =
    seleccion?.kind === "teatro" ? TEATRO_TERRITORIO[seleccion.slug] ?? null : null;

  const vivos = teatros.filter((t) => t.n > 0);
  const generadoHora = snap
    ? new Date(snap.generado).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* EL GLOBO */}
      <div className="flex-1 min-w-0">
        <div className="relative">
          <GlobeMap3D
            markers={markers}
            arcs={arcs}
            territoryColors={territoryColors}
            territoryNames={{}}
            highlightTerritory={highlightTerritory}
            height="min(72vh, 700px)"
            minHeight={320}
            autoRotate={!reducido && !seleccion}
            rotateSpeed={0.42}
            viewMode={modo}
            flyTo={flyTo}
            ariaLabel="El mundo 3D de Vanguard: guerras en vivo, gobiernos y lugares importantes"
          />
          {/* conmutador de vista del planeta */}
          <div className="absolute top-2 right-2 flex gap-1 flex-wrap">
            {(
              [
                ["oscuridad", "OSCURIDAD"],
                ["satelite", "SATÉLITE"],
                ["noche", "NOCHE · CIUDADES"],
              ] as Array<[GlobeViewMode, string]>
            ).map(([m, label]) => (
              <button
                key={m}
                type="button"
                onClick={() => setModo(m)}
                className={`font-mono text-[9px] uppercase tracking-widest rounded px-2 py-1 border transition-colors ${
                  modo === m
                    ? "border-amber-400/80 bg-amber-500/15 text-amber-300"
                    : "border-zinc-700 bg-zinc-900/80 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {/* sello EN VIVO */}
          <div className="absolute bottom-2 left-2 flex items-center gap-2 pointer-events-none">
            <span className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.2em] uppercase text-red-300 border border-red-500/50 bg-zinc-950/80 rounded px-2 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
              En vivo
            </span>
            {generadoHora && (
              <span className="font-mono text-[9px] text-zinc-500 bg-zinc-950/80 rounded px-2 py-1">
                sondeo {generadoHora}
              </span>
            )}
          </div>
        </div>
        {/* leyenda */}
        <div className="mt-2 flex items-center gap-3 flex-wrap font-mono text-[9px] uppercase tracking-widest text-zinc-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: "#3DDC97" }} />
            sin cables 24 h
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: colorTension(50) }} />
            tensión media
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: colorTension(90) }} />
            guerra caliente
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: COLOR_PLAZA }} />
            gobierno
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: COLOR_ORG }} />
            organización
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: COLOR_GARGANTA }} />
            garganta estratégica
          </span>
        </div>
      </div>

      {/* EL PANEL VIVO */}
      <aside className="w-full lg:w-[360px] shrink-0 border border-zinc-800 rounded-md bg-zinc-900/40 p-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="font-mono text-[10px] uppercase tracking-widest text-amber-300">
            El planeta ahora
          </p>
          {snap && (
            <p className="font-mono text-[10px] text-zinc-500">
              {snap.hoy} cables · {snap.paises} países · {vivos.length} teatros
            </p>
          )}
        </div>

        {/* pestañas */}
        <div className="mt-2 grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setPestana("teatros")}
            className={`font-mono text-[9px] uppercase tracking-widest rounded px-2 py-1.5 border transition-colors ${
              pestana === "teatros"
                ? "border-amber-400/70 bg-amber-500/10 text-amber-300"
                : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Teatros ({teatros.length})
          </button>
          <button
            type="button"
            onClick={() => setPestana("lugares")}
            className={`font-mono text-[9px] uppercase tracking-widest rounded px-2 py-1.5 border transition-colors ${
              pestana === "lugares"
                ? "border-amber-400/70 bg-amber-500/10 text-amber-300"
                : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Lugares ({PLAZAS_MUNDO.length})
          </button>
        </div>

        {!snap && (
          <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-zinc-500 animate-pulse">
            Bajando la instantánea del planeta…
          </p>
        )}

        {/* TEATROS */}
        {snap && pestana === "teatros" && (
          <ul className="mt-2 space-y-1 max-h-[46vh] overflow-y-auto pr-1">
            {teatros.map((t) => {
              const activo = seleccion?.kind === "teatro" && seleccion.slug === t.slug;
              return (
                <li key={t.slug}>
                  <button
                    type="button"
                    onClick={() => seleccionarTeatro(t.slug)}
                    className={`w-full text-left rounded border px-2.5 py-2 transition-colors ${
                      activo
                        ? "border-amber-400/60 bg-amber-500/10"
                        : "border-zinc-800 hover:border-zinc-600 bg-zinc-950/40"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0 inline-block"
                        style={{ background: colorPorCables(t.n) }}
                      />
                      <span className="flex-1 text-[13px] font-bold text-soft truncate">
                        {t.nombre}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-500 shrink-0">
                        {t.n > 0 ? `${t.n} · ${t.ultimo ? haceDe(t.ultimo.fecha) : ""}` : "—"}
                      </span>
                    </span>
                    {activo && t.ultimo && (
                      <span className="block mt-1.5 border-t border-zinc-800 pt-1.5">
                        <Link
                          href={`/noticia/${t.ultimo.id}`}
                          className="text-[12px] leading-snug text-zinc-300 hover:text-amber-300"
                        >
                          {recortar(t.ultimo.t, 110)}
                        </Link>
                        <span className="block mt-1 font-mono text-[9px] uppercase tracking-widest text-zinc-500">
                          {t.ultimo.f} · hace {haceDe(t.ultimo.fecha)}
                        </span>
                        <Link
                          href={`/conflicto/${t.slug}`}
                          className="inline-block mt-1.5 font-mono text-[9px] uppercase tracking-widest text-amber-400 hover:text-amber-300"
                        >
                          Abrir el teatro ▸
                        </Link>
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {/* LUGARES */}
        {snap && pestana === "lugares" && (
          <ul className="mt-2 grid grid-cols-2 gap-1 max-h-[46vh] overflow-y-auto pr-1">
            {PLAZAS_MUNDO.map((p) => {
              const activo = seleccion?.kind === "plaza" && seleccion.id === p.id;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => seleccionarPlaza(p.id)}
                    className={`w-full text-left rounded border px-2 py-1.5 transition-colors ${
                      activo
                        ? "border-sky-400/60 bg-sky-500/10"
                        : "border-zinc-800 hover:border-zinc-600 bg-zinc-950/40"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0 inline-block"
                        style={{
                          background:
                            p.tipo === "organizacion"
                              ? COLOR_ORG
                              : p.tipo === "estrategico"
                                ? COLOR_GARGANTA
                                : COLOR_PLAZA,
                        }}
                      />
                      <span className="text-[12px] font-bold text-soft truncate">{p.nombre}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {/* SELECCIÓN */}
        {(teatroSel || plazaSel) && (
          <div className="mt-3 border-t border-zinc-800 pt-3">
            {teatroSel && (
              <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-amber-300">
                  Teatro seleccionado
                </p>
                <p className="mt-1 font-display text-lg font-black text-soft">
                  {teatroSel.nombre}
                </p>
                <p className="font-mono text-[10px] text-zinc-500">
                  {teatroSel.n} cables en 24 h · tensión {tensionPorCables(teatroSel.n)}/100
                </p>
                <div className="mt-2 h-1.5 w-full rounded bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded"
                    style={{
                      width: `${Math.max(4, tensionPorCables(teatroSel.n))}%`,
                      background: colorTension(tensionPorCables(teatroSel.n)),
                    }}
                  />
                </div>
                <Link
                  href={`/conflicto/${teatroSel.slug}`}
                  className="inline-block mt-2.5 font-mono text-[10px] uppercase tracking-widest text-amber-400 hover:text-amber-300"
                >
                  Todos los cables del teatro ▸
                </Link>
              </div>
            )}
            {plazaSel && (
              <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-sky-300">
                  {plazaSel.tipo === "organizacion"
                    ? "Organización"
                    : plazaSel.tipo === "estrategico"
                      ? "Garganta estratégica"
                      : "Gobierno"}
                </p>
                <p className="mt-1 font-display text-lg font-black text-soft">{plazaSel.nombre}</p>
                <p className="text-[12px] text-muted-foreground leading-snug">{plazaSel.detalle}</p>
                <p className="mt-1 font-mono text-[9px] text-zinc-500">
                  {plazaSel.lat.toFixed(2)}°, {plazaSel.lng.toFixed(2)}°
                </p>
                <Link
                  href="/espia"
                  className="inline-block mt-2 font-mono text-[10px] uppercase tracking-widest text-cyan-400 hover:text-cyan-300"
                >
                  Espiar lo que publica ▸
                </Link>
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}

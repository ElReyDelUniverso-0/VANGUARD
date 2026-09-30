"use client";

// v72.0 INFINITA VERDADES — EL MAYOR CENTRO DE NOTICIAS DEL MUNDO.
// El comandante pidió "el mayor centro de noticias, infinitas verdades":
//  · MURO INFINITO: página a página del archivo completo (/api/news?page=N)
//    — nunca se acaba, con botón CARGAR MÁS VERDADES y contador.
//  · FILTRO POR PAÍS: chips con bandera táctica (FlagBadge) que filtran el
//    muro al instante, más búsqueda por texto.
//  · EL PLANETA EN VIVO: relojes mundiales con segundos + terremotos USGS
//    (siempre algo moviéndose, nada plano).
//  · REGLA DE ORO: título grande → ilustración → texto fácil de leer.
// v75.0 PLANETA VIVO:
//  · CINTA DE ÚLTIMA HORA en movimiento continuo (marquesina, pausa al hover).
//  · AUTO-REFRESCO cada 90s: las verdades recién nacidas entran solas al muro
//    con badge NUEVO pulsante — el muro respira solo, ilimitado.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Eye, Loader2, Search, Activity, ArrowUpRight, Globe2, Clock3, Mountain, Zap } from "lucide-react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { TituloEpico } from "@/components/vanguard/titulo-epico";
import { FlagBadge } from "@/components/vanguard/flag-badge";
import { countryName } from "@/lib/world-data";
import { cn } from "@/lib/utils";

interface Noticia {
  id: string;
  title: string;
  url: string;
  source: string;
  imageUrl: string | null;
  publishedAt: string;
  tacticalTag?: string | null;
  sourceCountry?: string | null;
  summary?: string | null;
}

interface Quake {
  mag: number;
  place: string;
  time: number;
  depth: number;
}

const RELOJES = [
  { ciudad: "Washington", tz: "America/New_York" },
  { ciudad: "Bruselas", tz: "Europe/Brussels" },
  { ciudad: "Moscú", tz: "Europe/Moscow" },
  { ciudad: "Pekín", tz: "Asia/Shanghai" },
  { ciudad: "Jerusalén", tz: "Asia/Jerusalem" },
  { ciudad: "Ciudad de México", tz: "America/Mexico_City" },
];

const PAISES_FIJOS = ["US", "RU", "UA", "IL", "PS", "IR", "CN", "MX", "VE", "CO", "BR", "SD", "TW", "KP", "IN", "NG", "AF", "SY", "YE", "MM"];

const TAG_COLOR: Record<string, string> = {
  ALERTA: "text-red-hud border-red-hud/50 bg-red-hud/15",
  DIPLOMACIA: "text-cyan-hud border-cyan-hud/50 bg-cyan-hud/15",
  ECONOMIA: "text-amber border-amber-hud/50 bg-amber-hud/15",
  HUMANITARIO: "text-violet-hud border-violet-hud/50 bg-violet-hud/15",
  ANALISIS: "text-green-hud border-green-hud/50 bg-green-hud/15",
};

function hace(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "ahora mismo";
  if (mins < 60) return `hace ${mins} min`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} días`;
}

export function InfinitaPanel() {
  const [items, setItems] = useState<Noticia[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [pais, setPais] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [quakes, setQuakes] = useState<Quake[]>([]);
  const [hora, setHora] = useState(() => new Date());
  const vivoRef = useRef(true);
  // v75: verdades recién nacidas del auto-refresco (id -> ts de llegada)
  const [nuevosIds, setNuevosIds] = useState<Map<string, number>>(new Map());

  // carga del muro infinito (página a página del archivo)
  const cargar = useCallback(async (pag: number) => {
    setCargando(true);
    try {
      const r = await fetch(`/api/news?page=${pag}&limit=18`, { cache: "no-store" });
      const d = await r.json();
      if (!vivoRef.current) return;
      const nuevos: Noticia[] = Array.isArray(d?.items) ? d.items : [];
      setItems((prev) => {
        const vistos = new Set(prev.map((p) => p.id));
        return pag === 1 ? nuevos : [...prev, ...nuevos.filter((n) => !vistos.has(n.id))];
      });
      setHasMore(Boolean(d?.hasMore));
    } catch {
      /* el muro aguanta: reintenta con el botón */
    } finally {
      if (vivoRef.current) setCargando(false);
    }
  }, []);

  useEffect(() => {
    vivoRef.current = true;
    cargar(1);
    fetch("/api/earthquakes", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (vivoRef.current && Array.isArray(d?.quakes)) setQuakes(d.quakes.slice(0, 3)); })
      .catch(() => {});
    const t = setInterval(() => setHora(new Date()), 1000);
    return () => { vivoRef.current = false; clearInterval(t); };
  }, [cargar]);

  // v75 AUTO-REFRESCO: cada 90s sondea la página 1 y las verdades recién
  // nacidas entran SOLAS arriba del muro con badge NUEVO (ilimitado de verdad).
  useEffect(() => {
    const sondear = async () => {
      try {
        const r = await fetch("/api/news?page=1&limit=18", { cache: "no-store" });
        const d = await r.json();
        if (!vivoRef.current || !Array.isArray(d?.items)) return;
        const frescos: Noticia[] = d.items;
        setItems((prev) => {
          const vistos = new Set(prev.map((p) => p.id));
          const llegan = frescos.filter((n) => !vistos.has(n.id));
          if (llegan.length === 0) return prev;
          const marca = new Map(nuevosIds);
          const ahora = Date.now();
          for (const n of llegan) marca.set(n.id, ahora);
          setNuevosIds(marca);
          return [...llegan, ...prev];
        });
      } catch { /* el muro aguanta: reintenta en el próximo ciclo */ }
    };
    const t = setInterval(sondear, 90_000);
    return () => clearInterval(t);
    // nuevosIds leído una vez: se muta dentro de setItems via closure — OK
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // expira el badge NUEVO a los 3 minutos
  useEffect(() => {
    if (nuevosIds.size === 0) return;
    const t = setInterval(() => {
      const ahora = Date.now();
      const vivo = new Map([...nuevosIds.entries()].filter(([, ts]) => ahora - ts < 180_000));
      if (vivo.size !== nuevosIds.size) setNuevosIds(vivo);
    }, 20_000);
    return () => clearInterval(t);
  }, [nuevosIds]);

  // países presentes en el muro + fijos (orden por cantidad)
  const chips = useMemo(() => {
    const cuenta = new Map<string, number>();
    for (const it of items) {
      const c = it.sourceCountry || "";
      if (c) cuenta.set(c, (cuenta.get(c) || 0) + 1);
    }
    const extras = [...cuenta.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c);
    return [...new Set([...PAISES_FIJOS, ...extras])].slice(0, 26);
  }, [items]);

  const filtradas = useMemo(() => {
    const qn = q.trim().toLowerCase();
    return items.filter((it) => {
      if (pais && (it.sourceCountry || "") !== pais) return false;
      if (qn && !(`${it.title} ${it.summary ?? ""}`.toLowerCase().includes(qn))) return false;
      return true;
    });
  }, [items, pais, q]);

  // v75 CINTA DE ÚLTIMA HORA: lo publicado hace menos de 2h (o lo último si no hay)
  const cinta = useMemo(() => {
    const recientes = items.filter((n) => n.publishedAt && Date.now() - new Date(n.publishedAt).getTime() < 2 * 3_600_000);
    const base = recientes.length >= 3 ? recientes : items.slice(0, 6);
    return base.slice(0, 8).map((n) => n.title);
  }, [items]);

  return (
    <div className="space-y-4">
      <PanelHeader title="INFINITA VERDADES" subtitle="El mayor centro de noticias del mundo" />

      {/* REGLA DE ORO: título gigante + ilustración + texto fácil */}
      <TituloEpico
        titulo="INFINITA VERDADES"
        volanta="El mayor centro de noticias del mundo"
        imagen="/ilustraciones/verdades.jpg"
        prioritaria
        texto="Todas las verdades del planeta en un solo muro que nunca se acaba: noticia a noticia, país por país, minuto a minuto. Filtra por bandera, busca por palabra y desciende tan profundo como quieras. Aquí nada se esconde."
        altura={280}
      />

      {/* v75 CINTA DE ÚLTIMA HORA — marquesina continua, se pausa al tocar */}
      {cinta.length > 0 && (
        <div
          className="marquee-contenedor relative overflow-hidden rounded-sm border border-red-hud/40 bg-gradient-to-r from-red-950/50 via-black/60 to-black/40 py-2"
          aria-label="Cinta de última hora"
        >
          <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center gap-1.5 bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/95 to-transparent pr-6 pl-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-hud blink-soft" />
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-red-hud whitespace-nowrap">Última hora</span>
          </div>
          <div className="marquee-pista pl-40">
            {[0, 1].map((rep) => (
              <span key={rep} className="flex items-center" aria-hidden={rep === 1}>
                {cinta.map((t, i) => (
                  <span key={i} className="flex items-center text-[11px] text-foreground/85">
                    <Zap className="w-3 h-3 mx-3 text-amber shrink-0" aria-hidden />
                    {t}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* EL PLANETA EN VIVO: relojes + sismos */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3" aria-label="El planeta en vivo">
        <div className="hud-panel p-4 md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <Clock3 className="w-4 h-4 text-amber" />
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Relojes del mando — hora exacta mundial</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {RELOJES.map((r) => (
              <div key={r.tz} className="rounded-sm border border-white/5 bg-black/30 px-2.5 py-2 text-center hover:border-amber-hud/40 transition-colors">
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground truncate">{r.ciudad}</p>
                <p className="font-mono text-sm text-foreground tabular-nums">
                  {new Intl.DateTimeFormat("es", { timeZone: r.tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(hora)}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="hud-panel p-4">
          <div className="flex items-center gap-2 mb-3">
            <Mountain className="w-4 h-4 text-red-hud" />
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">El planeta tiembla — USGS</h3>
          </div>
          {quakes.length === 0 ? (
            <p className="text-[11px] font-mono text-muted-foreground">Calibrando sismógrafos…</p>
          ) : (
            <ul className="space-y-2">
              {quakes.map((qk, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className={cn("font-mono text-xs px-1.5 py-0.5 border", qk.mag >= 5.5 ? "text-red-hud border-red-hud/50 bg-red-hud/15" : "text-amber border-amber-hud/50 bg-amber-hud/15")}>
                    M{qk.mag.toFixed(1)}
                  </span>
                  <span className="text-[11px] text-foreground/80 leading-tight line-clamp-2">{qk.place}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* CONTROLES: búsqueda + filtro por país */}
      <section className="hud-panel p-4 space-y-3" aria-label="Filtros del muro">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar una verdad: drones, cese el fuego, sanciones…"
            aria-label="Buscar noticias"
            className="w-full bg-black/40 border border-white/10 focus:border-amber-hud/60 rounded-sm pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors min-h-[44px]"
          />
        </div>
        <div className="flex flex-wrap gap-1.5 items-center">
          <button
            onClick={() => setPais(null)}
            aria-pressed={pais === null}
            className={cn(
              "px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-widest border rounded-sm transition-all active:scale-95 min-h-[32px]",
              pais === null ? "text-amber border-amber-hud bg-amber-hud/20 shadow-[0_0_14px_rgba(255,138,42,0.25)]" : "text-muted-foreground border-white/10 hover:border-amber-hud/40 hover:text-foreground"
            )}
          >
            <Globe2 className="w-3 h-3 inline mr-1 -mt-0.5" />MUNDO
          </button>
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => setPais(pais === c ? null : c)}
              aria-pressed={pais === c}
              className={cn(
                "transition-all active:scale-95 rounded-sm",
                pais === c ? "ring-1 ring-amber shadow-[0_0_14px_rgba(255,138,42,0.3)]" : "opacity-80 hover:opacity-100"
              )}
              title={countryName(c)}
            >
              <FlagBadge code={c} />
            </button>
          ))}
        </div>
        <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">
          {filtradas.length} verdades en pantalla {pais ? `· filtro: ${countryName(pais)}` : ""}
        </p>
      </section>

      {/* EL MURO INFINITO — imagen primero, nada plano */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" aria-label="Muro infinito de noticias">
        {filtradas.map((n, i) => (
          <article
            key={n.id}
            className="hud-panel overflow-hidden group hover:border-amber-hud/50 hover:shadow-[0_10px_34px_rgba(255,138,42,0.14)] transition-all duration-300 hover:-translate-y-0.5"
          >
            {/* la imagen SIEMPRE primero (regla de oro) */}
            <div className="relative h-40 bg-gradient-to-br from-[#1a1206] via-[#0c0c12] to-[#241005]">
              {n.imageUrl ? (
                <Image
                  src={n.imageUrl}
                  alt={n.title.slice(0, 90)}
                  fill
                  sizes="(max-width: 640px) 100vw, 380px"
                  loading={i < 6 ? "eager" : "lazy"}
                  className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-500"
                  unoptimized={n.imageUrl.startsWith("http")}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Eye className="w-8 h-8 text-amber-hud/40" aria-hidden />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/80 to-transparent" aria-hidden />
              {n.tacticalTag ? (
                <span className={cn("absolute top-2 left-2 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-widest border backdrop-blur-sm", TAG_COLOR[n.tacticalTag] || "text-foreground border-white/20 bg-black/40")}>
                  {n.tacticalTag}
                </span>
              ) : null}
              {n.sourceCountry ? (
                <span className="absolute top-2 right-2"><FlagBadge code={n.sourceCountry} /></span>
              ) : null}
            </div>
            <div className="p-3.5">
              <h3 className="text-[13px] font-semibold leading-snug text-foreground group-hover:text-amber transition-colors line-clamp-3">
                <a href={n.url?.startsWith("http") ? n.url : "#"} target="_blank" rel="noopener noreferrer">
                  {nuevosIds.has(n.id) ? <span className="nuevo-pulse inline-block mr-1.5 px-1 py-0.5 text-[8px] font-mono font-bold uppercase tracking-widest rounded-sm bg-amber text-black align-middle">NUEVO</span> : null}
                  {n.title}
                </a>
              </h3>
              <div className="mt-2.5 flex items-center justify-between gap-2">
                <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground truncate">
                  {n.source} · {hace(n.publishedAt)}
                </span>
                <a
                  href={n.url?.startsWith("http") ? n.url : "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-0.5 text-[10px] font-mono uppercase tracking-widest text-amber hover:text-foreground transition-colors"
                >
                  fuente <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </article>
        ))}
      </section>

      {filtradas.length === 0 && !cargando ? (
        <div className="hud-panel p-8 text-center">
          <Eye className="w-10 h-10 mx-auto text-amber-hud/50 mb-3" aria-hidden />
          <p className="text-sm text-muted-foreground">
            Ninguna verdad pasa el filtro todavía. Sube más el muro con CARGAR MÁS o cambia de país.
          </p>
        </div>
      ) : null}

      {/* CARGAR MÁS VERDADES — el muro nunca se acaba */}
      <div className="flex justify-center pt-1 pb-2">
        {hasMore ? (
          <button
            onClick={() => { const np = page + 1; setPage(np); cargar(np); }}
            disabled={cargando}
            className="inline-flex items-center gap-2 px-6 py-3 min-h-[48px] font-mono text-xs uppercase tracking-[0.25em] text-black bg-gradient-to-b from-[#ffc46b] to-[#ff8a2a] rounded-sm shadow-[0_6px_24px_rgba(255,138,42,0.35),inset_0_1px_0_rgba(255,255,255,0.5)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-60 border border-[#ffd9a0]/60"
          >
            {cargando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
            {cargando ? "Descifrando…" : "Cargar más verdades"}
          </button>
        ) : (
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Fin del archivo por ahora — el mundo seguirá generando verdades mañana
          </p>
        )}
      </div>
    </div>
  );
}

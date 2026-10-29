"use client";

// ============================================================
// v121.0 MODO ATLAS MUNDIAL — la sala que pedía el dueño:
// "toda la información de cada país, cada persona importante en
// el mundo, donde están las ubicaciones de cada persona
// importante en el mundo".
//   · MAPA: el planeta entero con los pines de las personas
//     importantes (color por categoría) y el país seleccionado.
//   · PAÍSES: 66 naciones con capital, población, superficie,
//     idiomas, moneda, gobierno, líder y dato estratégico.
//   · PERSONAS: 70 figuras clave con SU UBICACIÓN REAL y la
//     hora local EN VIVO de donde están ahora mismo.
// Los relojes viven (1 Hz). El mapa es el SVG real de Vanguard
// (Natural Earth) — cero imágenes externas.
// ============================================================
import { useEffect, useMemo, useState } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { useSala3DContenido } from "../use-sala3d-contenido";
import { Flag } from "@/lib/flags";
import { IlustracionViva } from "@/components/vanguard/ilustraciones-vivas";
import { projectLatLng } from "@/components/vanguard/world-map-svg";
import worldPaths from "@/lib/world-paths.json";
import { cn } from "@/lib/utils";
import { Search, MapPin, Clock3, Users, Globe2, Crosshair, X, Landmark, Coins, FlaskConical, Clapperboard, Building2, ChevronRight, Route, Scale, Crown } from "lucide-react";
import {
  PAISES_ATLAS, PERSONAS_ATLAS, COLOR_CATEGORIA, RUTAS_PODER, personaPorId, compararPaises,
  buscarPaises, buscarPersonas, fmtKm2, fmtMillones,
  type PaisAtlas, type PersonaAtlas, type CategoriaPersona,
} from "@/lib/atlas-data";

type Vista = "mapa" | "paises" | "personas" | "comparar";

const CATS: (CategoriaPersona | "TODAS")[] = ["TODAS", "GOBIERNO", "ORGANISMOS", "DINERO", "CIENCIA", "CULTURA"];
const CAT_ICON: Record<CategoriaPersona, React.ReactNode> = {
  GOBIERNO: <Landmark className="w-3 h-3" />,
  ORGANISMOS: <Building2 className="w-3 h-3" />,
  DINERO: <Coins className="w-3 h-3" />,
  CIENCIA: <FlaskConical className="w-3 h-3" />,
  CULTURA: <Clapperboard className="w-3 h-3" />,
};

const CIUDADES_VIVAS = [
  { nombre: "Washington", zona: "America/New_York" },
  { nombre: "Pekín", zona: "Asia/Shanghai" },
  { nombre: "Moscú", zona: "Europe/Moscow" },
  { nombre: "Londres", zona: "Europe/London" },
  { nombre: "Nueva Delhi", zona: "Asia/Kolkata" },
  { nombre: "Tokio", zona: "Asia/Tokyo" },
  { nombre: "Brasilia", zona: "America/Sao_Paulo" },
  { nombre: "Madrid", zona: "Europe/Madrid" },
];

function horaEn(zona: string, now: Date): string {
  try {
    return new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit", timeZone: zona }).format(now);
  } catch {
    return "--:--";
  }
}

export function AtlasPanel() {
  const [vista, setVista] = useState<Vista>("mapa");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<CategoriaPersona | "TODAS">("TODAS");
  const [region, setRegion] = useState<string>("TODAS");
  const [selPersona, setSelPersona] = useState<PersonaAtlas | null>(null);
  const [selPais, setSelPais] = useState<PaisAtlas | null>(null);
  const [now, setNow] = useState(() => new Date());
  // v122.0 RUTAS DE PODER + COMPARADOR A vs B
  const [rutasOn, setRutasOn] = useState(true);
  const [cmpA, setCmpA] = useState<string>("us");
  const [cmpB, setCmpB] = useState<string>("cn");

  // RELOJ VIVO del planeta (1 Hz — un solo intervalo para toda la sala)
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const personasFiltradas = useMemo(() => {
    let r = buscarPersonas(q);
    if (cat !== "TODAS") r = r.filter((p) => p.categoria === cat);
    return r;
  }, [q, cat]);

  const paisesFiltrados = useMemo(() => {
    let r = buscarPaises(q);
    if (region !== "TODAS") r = r.filter((p) => p.region === region);
    return r;
  }, [q, region]);

  // v164 SALA EN VOLUMEN: los protagonistas del poder en filas de cristal 3D
  useSala3DContenido(
    "atlas",
    "Atlas del Poder",
    "#C9A0FF",
    `${paisesFiltrados.length} PAÍSES · ${personasFiltradas.length} PERSONAS · EDICIÓN 2026`,
    personasFiltradas.slice(0, 6).map((pr: PersonaAtlas) => ({
      t: pr.nombre,
      v: pr.categoria?.slice(0, 12).toUpperCase() || "",
      color: COLOR_CATEGORIA[pr.categoria] || undefined,
    })),
  );

  const pinesPersonas = useMemo(() => {
    return personasFiltradas.map((p) => ({ ...p, xy: projectLatLng(p.lat, p.lng) })).filter((p) => p.xy.x > 0 && p.xy.x < 1000);
  }, [personasFiltradas]);

  const pinPais = useMemo(() => (selPais ? { ...selPais, xy: projectLatLng(selPais.lat, selPais.lng) } : null), [selPais]);

  // v122 RUTAS DE PODER: arcos entre las personas de cada eje (proyectados una vez)
  const rutasProyectadas = useMemo(() => {
    return RUTAS_PODER.map((r) => {
      const pa = personaPorId(r.de);
      const pb = personaPorId(r.a);
      if (!pa || !pb) return null;
      const xa = projectLatLng(pa.lat, pa.lng);
      const xb = projectLatLng(pb.lat, pb.lng);
      if (xa.x <= 0 || xa.x >= 1000 || xb.x <= 0 || xb.x >= 1000) return null;
      // control point: punto medio levantado hacia el norte, escala por distancia
      const dist = Math.hypot(xb.x - xa.x, xb.y - xa.y);
      return { ruta: r, pa, pb, xa, xb, cx: (xa.x + xb.x) / 2, cy: (xa.y + xb.y) / 2 - Math.min(120, dist * 0.22) };
    }).filter(Boolean) as { ruta: (typeof RUTAS_PODER)[number]; pa: PersonaAtlas; pb: PersonaAtlas; xa: { x: number; y: number }; xb: { x: number; y: number }; cx: number; cy: number }[];
  }, []);

  const paisA = PAISES_ATLAS.find((p) => p.id === cmpA) ?? PAISES_ATLAS[0];
  const paisB = PAISES_ATLAS.find((p) => p.id === cmpB) ?? PAISES_ATLAS[1];

  const verEnMapa = (p: PersonaAtlas) => {
    setSelPersona(p);
    setVista("mapa");
  };

  return (
    <div className="space-y-4">
      <PanelHeader
        title="ATLAS MUNDIAL"
        subtitle="Cada país · cada persona importante · donde están ahora mismo"
        icon={<Globe2 className="w-4 h-4" />}
        color="cyan"
        right={
          <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-green-hud blink-soft" />
            EDICIÓN 2026 · <span className="text-cyan-hud">{PAISES_ATLAS.length}</span> PAÍSES · <span className="text-amber-hud">{PERSONAS_ATLAS.length}</span> PERSONAS
          </div>
        }
      />

      {/* SUB-NAVEGACIÓN interna de la sala */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {([["mapa", "MAPA", <MapPin key="m" className="w-3.5 h-3.5" />], ["paises", "PAÍSES", <Globe2 key="p" className="w-3.5 h-3.5" />], ["personas", "PERSONAS", <Users key="u" className="w-3.5 h-3.5" />], ["comparar", "COMPARAR", <Scale key="c" className="w-3.5 h-3.5" />]] as [Vista, string, React.ReactNode][]).map(([v, label, icon]) => (
          <button
            key={v}
            onClick={() => setVista(v)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded border font-mono text-[11px] font-bold uppercase tracking-wider transition-all",
              vista === v
                ? "border-cyan-hud bg-cyan-hud/15 text-cyan-hud shadow-[0_0_14px_-4px_var(--vg-acento,#FFC94D)]"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
            )}
          >
            {icon}
            {label}
          </button>
        ))}
        {(vista === "paises" || vista === "personas") && (
          <div className="relative flex-1 min-w-[180px] max-w-xs ml-auto">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={vista === "paises" ? "Buscar país, capital o líder..." : "Buscar persona, cargo o ciudad..."}
              className="w-full pl-8 pr-3 py-1.5 bg-black/40 border border-border rounded text-[11px] font-mono text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-cyan-hud"
            />
          </div>
        )}
      </div>

      {/* ===== VISTA MAPA ===== */}
      {vista === "mapa" && (
        <div className="grid lg:grid-cols-[1fr_330px] gap-4">
          <div className="hud-panel p-3 relative overflow-hidden">
            {/* filtros por categoría sobre el mapa */}
            <div className="flex items-center gap-1 flex-wrap mb-2">
              {CATS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={cn(
                    "px-2 py-1 rounded font-mono text-[9px] font-bold tracking-wider border transition-all",
                    cat === c ? "border-cyan-hud bg-cyan-hud/15 text-cyan-hud" : "border-border text-muted-foreground hover:text-foreground"
                  )}
                  style={c !== "TODAS" && cat !== c ? { color: COLOR_CATEGORIA[c as CategoriaPersona], borderColor: `${COLOR_CATEGORIA[c as CategoriaPersona]}44` } : undefined}
                >
                  {c === "TODAS" ? "TODAS" : CAT_ICON[c as CategoriaPersona]} {c === "TODAS" ? "TODAS" : c}
                </button>
              ))}
              <button
                onClick={() => setRutasOn((v) => !v)}
                className={cn(
                  "ml-auto flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[9px] font-bold tracking-wider transition-all",
                  rutasOn ? "border-amber-hud bg-amber-hud/15 text-amber" : "border-border text-muted-foreground hover:text-foreground"
                )}
                title="Los ejes reales entre las personas que mueven el mundo"
              >
                <Route className="w-3 h-3" /> RUTAS DE PODER · {rutasProyectadas.length}
              </button>
              <span className="font-mono text-[9px] text-muted-foreground flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-hud blink-soft" /> {pinesPersonas.length} PINES
              </span>
            </div>

            <svg viewBox="0 0 1000 500" className="w-full h-auto rounded border border-border/60 bg-[#060a0f]" role="img" aria-label="Mapa mundial con las personas importantes del planeta">
              <path d={worldPaths.graticulePath} fill="none" stroke="#1a2a3a" strokeWidth="0.5" />
              <path d={worldPaths.landPath} fill="#0e1a24" stroke="#2a4a5a" strokeWidth="0.6" />
              <path d={worldPaths.borderPath} fill="none" stroke="#1e3446" strokeWidth="0.5" />

              {/* v122 RUTAS DE PODER: arcos de vuelo animados entre los ejes del planeta */}
              {rutasOn && rutasProyectadas.map(({ ruta, pa, pb, xa, xb, cx, cy }) => {
                const tocada = selPersona != null && (selPersona.id === pa.id || selPersona.id === pb.id);
                const col = tocada ? "var(--vg-acento, #FFC94D)" : "#5a8aa8";
                return (
                  <g key={`${ruta.de}-${ruta.a}`}>
                    <path d={`M ${xa.x} ${xa.y} Q ${cx} ${cy} ${xb.x} ${xb.y}`} fill="none" stroke={col} strokeWidth={tocada ? 1.6 : 0.8} opacity={tocada ? 0.95 : 0.5} className="v122-ruta" />
                    <text x={cx} y={cy - 4} fontSize="10" fill={tocada ? "var(--vg-acento, #FFC94D)" : "#7aa8c8"} fontFamily="monospace" fontWeight="bold" textAnchor="middle" opacity={tocada ? 1 : 0.65}>{ruta.etiqueta}</text>
                  </g>
                );
              })}

              {/* capital del país seleccionado */}
              {pinPais && pinPais.xy && (
                <g>
                  <circle cx={pinPais.xy.x} cy={pinPais.xy.y} r="10" fill="none" stroke="var(--vg-acento, #FFC94D)" strokeWidth="1.2" className="iv-pulso-pin" />
                  <circle cx={pinPais.xy.x} cy={pinPais.xy.y} r="4" fill="var(--vg-acento, #FFC94D)" />
                  <text x={pinPais.xy.x + 10} y={pinPais.xy.y + 4} fontSize="13" fill="var(--vg-acento, #FFC94D)" fontFamily="monospace" fontWeight="bold">{pinPais.capital} · {pinPais.nombre}</text>
                </g>
              )}

              {/* pines de las personas importantes */}
              {pinesPersonas.map((p) => {
                const sel = selPersona?.id === p.id;
                const col = COLOR_CATEGORIA[p.categoria];
                return (
                  <g key={p.id} onClick={() => setSelPersona(p)} className="cursor-pointer" role="button" aria-label={p.nombre}>
                    <circle cx={p.xy.x} cy={p.xy.y} r={sel ? 11 : 8} fill="none" stroke={col} strokeWidth="1" opacity={sel ? 0.9 : 0.45} className="iv-pulso-pin" />
                    <circle cx={p.xy.x} cy={p.xy.y} r={sel ? 3.4 : 2.4} fill={col} />
                    {sel && (
                      <text x={p.xy.x + 9} y={p.xy.y - 6} fontSize="13" fill={col} fontFamily="monospace" fontWeight="bold">{p.nombre} — {p.ciudad}</text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* leyenda */}
            <div className="flex items-center gap-3 flex-wrap mt-2 font-mono text-[9px] text-muted-foreground">
              {(Object.keys(COLOR_CATEGORIA) as CategoriaPersona[]).map((c) => (
                <span key={c} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: COLOR_CATEGORIA[c] }} /> {c}
                </span>
              ))}
              <span className="ml-auto flex items-center gap-1"><Crosshair className="w-3 h-3" /> TOCA UN PIN PARA VER LA FICHA</span>
            </div>
          </div>

          {/* Ficha lateral (persona o país) */}
          <div className="space-y-3">
            {selPersona ? (
              <FichaPersona p={selPersona} now={now} onCerrar={() => setSelPersona(null)} />
            ) : selPais ? (
              <FichaPais pais={selPais} now={now} onCerrar={() => setSelPais(null)} />
            ) : (
              <div className="hud-panel p-6 text-center">
                <IlustracionViva tipo="globo" ancho={150} className="mx-auto" />
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mt-3">
                  EL PLANETA, POBLADO
                </p>
                <p className="text-[11px] text-muted-foreground/80 mt-2 leading-relaxed">
                  Cada pin es una persona que mueve el mundo — presidentes, magnates, científicos y artistas — en su ubicación real de hoy. Elige un pin o busca a alguien.
                </p>
              </div>
            )}

            {/* relojes vivos de las potencias */}
            <div className="hud-panel p-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground mb-2 flex items-center gap-1.5">
                <Clock3 className="w-3 h-3" /> AHORA MISMO EN EL PLANETA
              </p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {CIUDADES_VIVAS.map((c) => (
                  <div key={c.zona} className="flex items-center justify-between font-mono text-[10px]">
                    <span className="text-muted-foreground">{c.nombre}</span>
                    <span className="text-cyan-hud font-bold tabular-nums">{horaEn(c.zona, now)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== VISTA PAÍSES ===== */}
      {vista === "paises" && (
        <div className="space-y-3">
          <div className="flex items-center gap-1 flex-wrap">
            {["TODAS", "América", "Europa", "Asia", "África", "Oceanía"].map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={cn(
                  "px-2.5 py-1 rounded font-mono text-[9px] font-bold tracking-wider border transition-all",
                  region === r ? "border-cyan-hud bg-cyan-hud/15 text-cyan-hud" : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {r.toUpperCase()}
              </button>
            ))}
            <span className="ml-auto font-mono text-[9px] text-muted-foreground">{paisesFiltrados.length} NACIONES</span>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
            {paisesFiltrados.map((p) => (
              <div
                key={p.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelPais(selPais?.id === p.id ? null : p)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelPais(selPais?.id === p.id ? null : p); } }}
                className={cn(
                  "text-left hud-panel p-3 transition-all hover:border-cyan-hud/50 group cursor-pointer focus-visible:outline-2",
                  selPais?.id === p.id && "border-cyan-hud shadow-[0_0_18px_-6px_var(--vg-acento,#FFC94D)]"
                )}
              >
                <div className="flex items-center gap-2">
                  <Flag code={p.id} size={22} />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[11px] font-bold text-foreground truncate">{p.nombre}</p>
                    <p className="text-[9px] text-muted-foreground truncate">{p.capital} · {p.region}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-cyan-hud transition-colors" />
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-2 font-mono text-[9px] text-muted-foreground">
                  <span>POB. <span className="text-foreground">{fmtMillones(p.poblacion)}</span></span>
                  <span className="text-right">HORA <span className="text-cyan-hud tabular-nums">{horaEn(p.zona, now)}</span></span>
                </div>
                {selPais?.id === p.id && <FichaPais pais={p} now={now} onCerrar={() => setSelPais(null)} inline />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== VISTA PERSONAS ===== */}
      {vista === "personas" && (
        <div className="space-y-3">
          <div className="flex items-center gap-1 flex-wrap">
            {CATS.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn(
                  "px-2.5 py-1 rounded font-mono text-[9px] font-bold tracking-wider border transition-all",
                  cat === c ? "border-cyan-hud bg-cyan-hud/15 text-cyan-hud" : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {c}
              </button>
            ))}
            <span className="ml-auto font-mono text-[9px] text-muted-foreground">{personasFiltradas.length} FIGURAS</span>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
            {personasFiltradas.map((p) => (
              <div
                key={p.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelPersona(selPersona?.id === p.id ? null : p)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelPersona(selPersona?.id === p.id ? null : p); } }}
                className={cn(
                  "text-left hud-panel p-3 transition-all hover:border-cyan-hud/50 group cursor-pointer focus-visible:outline-2",
                  selPersona?.id === p.id && "border-cyan-hud shadow-[0_0_18px_-6px_var(--vg-acento,#FFC94D)]"
                )}
              >
                <div className="flex items-center gap-2">
                  <Flag code={p.pais} size={20} />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[11px] font-bold text-foreground truncate">{p.nombre}</p>
                    <p className="text-[9px] text-muted-foreground truncate">{p.cargo}</p>
                  </div>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COLOR_CATEGORIA[p.categoria] }} />
                </div>
                <div className="flex items-center justify-between mt-2 font-mono text-[9px] text-muted-foreground">
                  <span className="truncate">{p.sede} · {p.ciudad}</span>
                  <span className="text-cyan-hud tabular-nums shrink-0 ml-2">{horaEn(p.zona, now)}</span>
                </div>
                {selPersona?.id === p.id && <FichaPersona p={p} now={now} onCerrar={() => setSelPersona(null)} onVerEnMapa={verEnMapa} inline />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== v122 VISTA COMPARAR (A vs B) ===== */}
      {vista === "comparar" && (
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-2">
            {([[cmpA, setCmpA, paisA], [cmpB, setCmpB, paisB]] as [string, (v: string) => void, PaisAtlas][]).map(([val, set, pais], i) => (
              <div key={i} className="hud-panel p-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground mb-1.5">{i === 0 ? "PAÍS A" : "PAÍS B"}</p>
                <div className="flex items-center gap-2">
                  <Flag code={pais.id} size={28} />
                  <select
                    value={val}
                    onChange={(e) => set(e.target.value)}
                    aria-label={i === 0 ? "Selecciona el país A" : "Selecciona el país B"}
                    className="flex-1 min-w-0 bg-black/50 border border-border rounded px-2 py-1.5 font-mono text-[11px] font-bold text-foreground focus:outline-none focus:border-cyan-hud"
                  >
                    {PAISES_ATLAS.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
                <p className="text-[9px] text-muted-foreground mt-1.5 truncate">{pais.gobierno} · LÍDER: <span className="text-amber-hud font-bold">{pais.lider}</span></p>
              </div>
            ))}
          </div>

          {(() => {
            const cmp = compararPaises(paisA, paisB);
            const maxPob = Math.max(paisA.poblacion, paisB.poblacion);
            const maxSup = Math.max(paisA.superficie, paisB.superficie);
            const maxDen = Math.max(cmp.densidadA, cmp.densidadB);
            const fila = (label: string, va: number, vb: number, max: number, gana: string | null, fmt: (n: number) => string) => (
              <div key={label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <div className="flex flex-col items-end gap-0.5">
                  <span className={cn("font-mono text-[10px] font-bold tabular-nums", gana === "a" ? "text-cyan-hud" : "text-muted-foreground")}>{fmt(va)}</span>
                  <div className="h-1.5 w-full rounded bg-black/50 overflow-hidden"><div className={cn("h-full rounded-r", gana === "a" ? "bg-cyan-hud" : "bg-muted-foreground/40")} style={{ width: `${Math.max(4, (va / max) * 100)}%` }} /></div>
                </div>
                <span className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground w-20 text-center shrink-0">{label}{gana && <span className={cn("block font-bold", gana === "a" ? "text-cyan-hud" : "text-amber-hud")}>◄ {gana === "a" ? "A" : "B"}</span>}</span>
                <div className="flex flex-col items-start gap-0.5">
                  <span className={cn("font-mono text-[10px] font-bold tabular-nums", gana === "b" ? "text-amber-hud" : "text-muted-foreground")}>{fmt(vb)}</span>
                  <div className="h-1.5 w-full rounded bg-black/50 overflow-hidden"><div className={cn("h-full rounded-l", gana === "b" ? "bg-amber-hud" : "bg-muted-foreground/40")} style={{ width: `${Math.max(4, (vb / max) * 100)}%` }} /></div>
                </div>
              </div>
            );
            return (
              <div className="hud-panel p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">CAREO DE NACIONES</p>
                  <p className="font-mono text-[9px] text-muted-foreground">densidad: {cmp.densidadA.toFixed(0)} vs {cmp.densidadB.toFixed(0)} hab/km²</p>
                </div>
                {fila("POBLACIÓN", paisA.poblacion, paisB.poblacion, maxPob, cmp.poblacionGana, fmtMillones)}
                {fila("SUPERFICIE", paisA.superficie, paisB.superficie, maxSup, cmp.superficieGana, fmtKm2)}
                {fila("DENSIDAD", cmp.densidadA, cmp.densidadB, maxDen, cmp.densidadGana, (n) => `${n.toFixed(0)} hab/km²`)}
                <div className="grid sm:grid-cols-2 gap-2 pt-1 border-t border-border/60">
                  {(["A", "B"] as const).map((lado) => {
                    const p = lado === "A" ? paisA : paisB;
                    return (
                      <div key={lado} className="rounded border border-border/60 bg-black/30 p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Flag code={p.id} size={16} />
                          <span className="font-mono text-[10px] font-bold text-foreground truncate">{p.nombre}</span>
                          <span className="ml-auto font-mono text-[9px] text-cyan-hud tabular-nums">{horaEn(p.zona, now)}</span>
                        </div>
                        <p className="font-mono text-[9px] text-muted-foreground">CAP. <span className="text-foreground">{p.capital}</span> · MONEDA <span className="text-foreground">{p.moneda}</span></p>
                        <p className="font-mono text-[9px] text-muted-foreground mt-0.5">IDIOMAS <span className="text-foreground">{p.idiomas}</span></p>
                        <p className="text-[10px] text-foreground/75 leading-relaxed mt-1.5">{p.dato}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      <p className="font-mono text-[9px] text-muted-foreground text-center pt-1">
        EDICIÓN VANGUARD 2026 · DATOS VERIFICADOS HASTA OCTUBRE 2025 · LOS RELOVES SON REALES, LA UBICACIÓN DE CADA FIGURA ES SU SEDE DE TRABAJO
      </p>
    </div>
  );
}

// ===== FICHA DE PERSONA (con hora local EN VIVO) =====
function FichaPersona({ p, now, onCerrar, onVerEnMapa, inline }: { p: PersonaAtlas; now: Date; onCerrar: () => void; onVerEnMapa?: (p: PersonaAtlas) => void; inline?: boolean }) {
  return (
    <div className={cn("border border-cyan-hud/40 rounded p-3 bg-black/30", inline ? "mt-3" : "hud-panel")}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Flag code={p.pais} size={24} />
          <div className="min-w-0">
            <p className="font-mono text-xs font-bold text-foreground truncate">{p.nombre}</p>
            <p className="text-[10px] text-muted-foreground truncate">{p.cargo}</p>
          </div>
        </div>
        <button onClick={onCerrar} className="text-muted-foreground hover:text-foreground shrink-0" aria-label="Cerrar ficha">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2 mt-3 px-2 py-1.5 rounded bg-cyan-hud/10 border border-cyan-hud/30">
        <MapPin className="w-3.5 h-3.5 text-cyan-hud shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] text-cyan-hud font-bold truncate">{p.sede}</p>
          <p className="text-[9px] text-muted-foreground truncate">{p.ciudad}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-mono text-sm font-bold text-cyan-hud tabular-nums leading-none">{horaEn(p.zona, now)}</p>
          <p className="text-[8px] text-muted-foreground">HORA LOCAL · EN VIVO</p>
        </div>
      </div>

      <p className="text-[11px] text-foreground/85 leading-relaxed mt-3">{p.bio}</p>

      <div className="flex items-center justify-between mt-3">
        <span className="px-2 py-0.5 rounded font-mono text-[8px] font-bold tracking-wider" style={{ background: `${COLOR_CATEGORIA[p.categoria]}22`, color: COLOR_CATEGORIA[p.categoria] }}>
          {p.categoria} · DESDE {String(p.desde)}
        </span>
        {onVerEnMapa && (
          <button onClick={() => onVerEnMapa(p)} className="flex items-center gap-1 font-mono text-[9px] font-bold text-cyan-hud hover:underline">
            <MapPin className="w-3 h-3" /> VER EN EL MAPA
          </button>
        )}
      </div>
    </div>
  );
}

// ===== FICHA DE PAÍS (completa) =====
function FichaPais({ pais, now, onCerrar, inline }: { pais: PaisAtlas; now: Date; onCerrar: () => void; inline?: boolean }) {
  return (
    <div className={cn("border border-amber-hud/40 rounded p-3 bg-black/30", inline ? "mt-3" : "hud-panel")}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Flag code={pais.id} size={26} />
          <div className="min-w-0">
            <p className="font-mono text-xs font-bold text-foreground truncate">{pais.nombre}</p>
            <p className="text-[10px] text-muted-foreground truncate">{pais.gobierno}</p>
          </div>
        </div>
        <button onClick={onCerrar} className="text-muted-foreground hover:text-foreground shrink-0" aria-label="Cerrar ficha">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1.5 mt-3 font-mono text-[10px]">
        <Dato k="CAPITAL" v={pais.capital} />
        <Dato k="POBLACIÓN" v={fmtMillones(pais.poblacion)} />
        <Dato k="SUPERFICIE" v={fmtKm2(pais.superficie)} />
        <Dato k="MONEDA" v={pais.moneda} />
        <Dato k="IDIOMAS" v={pais.idiomas} />
        <Dato k="HORA EN CAPITAL" v={horaEn(pais.zona, now)} vivo />
      </div>

      <div className="mt-2 font-mono text-[10px] leading-relaxed">
        <span className="text-muted-foreground">LÍDER: </span>
        <span className="text-amber-hud font-bold">{pais.lider}</span>
      </div>

      <p className="text-[11px] text-foreground/85 leading-relaxed mt-2 border-t border-border/60 pt-2">
        <span className="font-mono text-[9px] font-bold text-cyan-hud tracking-wider">DATO VANGUARD · </span>
        {pais.dato}
      </p>
    </div>
  );
}

function Dato({ k, v, vivo }: { k: string; v: string; vivo?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[8px] text-muted-foreground tracking-wider">{k}</p>
      <p className={cn("text-[10px] font-bold truncate", vivo ? "text-cyan-hud tabular-nums" : "text-foreground")}>{v}</p>
    </div>
  );
}

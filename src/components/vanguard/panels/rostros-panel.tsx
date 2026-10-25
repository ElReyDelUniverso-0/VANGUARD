"use client";

// ============================================================
// v130.0 LOS ROSTROS DEL PODER — el dossier de las personas
// que mueven el planeta, nación por nación y sillón por sillón:
//   · EL MAPA DEL PODER — 34 ubicaciones reales proyectadas
//   · LOS CUATRO CORTES — tronos, dinero, tribunal, nuevos
//   · EL EXPEDIENTE — ruta al poder, rasgos, guardia y sucesión
//   · LA JERARQUÍA — el top de poder de la Casa
//   · EL PULSO REAL — los cables que la Casa recibe de cada rostro
// Doctrina: los rostros no posan — se vigilan.
// ============================================================
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { LectorNoticia, type CableLectura } from "@/components/vanguard/lector-noticia";
// v174 LAS INTROS GTA: la placa de cambio de personaje — cada rostro
// elegido se presenta en la pantalla grande, como en GTA V.
import { IntroGtaPersonaje } from "@/components/vanguard/intros-gta";
import { projectLatLng } from "@/components/vanguard/world-map-svg";
import worldPaths from "@/lib/world-paths.json";
import { sfx } from "@/lib/sound";
import { cn, q2 } from "@/lib/utils";
import {
  ROSTROS, COLECCION_ROSTROS, CATEGORIAS_ROSTRO, PULSO_KEYWORDS_ROSTROS,
  rostroDe, type Rostro, type CategoriaRostro,
} from "@/lib/personas-data";
import {
  Crown, Map as MapIcon, Radio, ChevronRight, Fingerprint, Users, Shield, TrendingUp,
} from "lucide-react";
import { useSala3DContenido, type FilaContenido3D } from "@/components/vanguard/use-sala3d-contenido";

type Filtro = "todos" | CategoriaRostro;

// posición proyectada de un rostro (+ guiado anti-solape si existe)
function xyDe(r: Rostro) {
  const { x, y } = projectLatLng(r.lat, r.lng);
  return { x: x + (r.guiado?.dx ?? 0), y: y + (r.guiado?.dy ?? 0) };
}

// cables de un rostro en la red dada (pura — fuera del componente)
function cablesDeRostro(id: string, cables: CableLectura[]): CableLectura[] {
  const kws = (PULSO_KEYWORDS_ROSTROS[id] ?? []).map((k) => k.toLowerCase());
  if (kws.length === 0) return [];
  return cables
    .filter((c) => kws.some((k) => c.title.toLowerCase().includes(k)))
    .slice(0, 3);
}

// los cuatro cortes, en orden de mando
const CORTES: CategoriaRostro[] = ["tronos", "dinero", "tribunal", "nuevos"];

export function RostrosPanel() {
  const [selId, setSelId] = useState<string>("trump");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [cables, setCables] = useState<CableLectura[]>([]);
  const [cableSel, setCableSel] = useState<CableLectura | null>(null);
  // v174 LAS INTROS GTA: la placa de presentación — cada vez que se elige
  // otro rostro, la casa lo presenta en la pantalla grande (2D y mundo 3D).
  const [introId, setIntroId] = useState<string | null>(null);

  const sel: Rostro = rostroDe(selId) ?? ROSTROS[0];
  const cm = CATEGORIAS_ROSTRO[sel.categoria];

  // ── pulso real: cables de la casa, frescos cada 5 minutos ──
  useEffect(() => {
    let vivo = true;
    const cargar = async () => {
      try {
        const r = await fetch("/api/news", { cache: "no-store" });
        const j = await r.json();
        if (!vivo || !Array.isArray(j?.items)) return;
        const cs: CableLectura[] = (j.items as Record<string, unknown>[]).map((it) => ({
          id: String(it.id ?? it.url ?? Math.random().toString(36).slice(2)),
          title: String(it.title ?? ""),
          url: String(it.url ?? ""),
          source: String(it.source ?? "casa"),
          publishedAt: String(it.publishedAt ?? new Date().toISOString()),
          tacticalTag: (it.tacticalTag as string) ?? null,
          conflictTag: (it.conflictTag as string) ?? null,
          sourceCountry: (it.sourceCountry as string) ?? null,
        })).filter((c) => c.title.length > 12);
        if (cs.length > 0) setCables(cs);
      } catch { /* la red también vive en silencio */ }
    };
    cargar();
    const id = setInterval(cargar, 300_000);
    return () => { vivo = false; clearInterval(id); };
  }, []);

  // señales por rostro (leyenda + índice)
  const senalesPor = useMemo(() => {
    const m: Record<string, number> = {};
    for (const r of ROSTROS) m[r.id] = cablesDeRostro(r.id, cables).length;
    return m;
  }, [cables]);
  const totalSenales = useMemo(
    () => Object.values(senalesPor).reduce((s, n) => s + n, 0),
    [senalesPor]
  );

  const cablesSel = useMemo(
    () => cablesDeRostro(sel.id, cables),
    [sel, cables]
  );

  // la colección filtrada por corte
  const visibles = useMemo(
    () => (filtro === "todos" ? ROSTROS : ROSTROS.filter((r) => r.categoria === filtro)),
    [filtro]
  );

  // la jerarquía: top 10 del índice de poder de la Casa
  const jerarquia = useMemo(
    () => [...ROSTROS].sort((a, b) => b.poder - a.poder).slice(0, 10),
    []
  );

  const elegir = (id: string) => {
    if (id === selId) return;
    setSelId(id);
    setIntroId(id); // v174: la placa de presentación entra con el cambio
    sfx.campana(); // la campana de salón: cada expediente se abre con dignidad
  };

  const irAlExpediente = (id: string) => {
    elegir(id);
    requestAnimationFrame(() => {
      document.getElementById("v130-expediente")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  // ════════════════════════════════════════════════════════════
  // v168: PARIDAD 2D→3D — el dossier del poder en volumen: la
  // colección, el expediente abierto (con su índice de poder real),
  // la jerarquía top (abre expediente) y el pulso real de cables
  // ════════════════════════════════════════════════════════════
  const filas3D = useMemo<FilaContenido3D[]>(() => {
    const filas: FilaContenido3D[] = [
      {
        t: `EL MAPA DEL PODER: ${COLECCION_ROSTROS.total} ROSTROS`,
        v: `${visibles.length} EN VISTA`,
        color: "#D4AF37",
        d: `${COLECCION_ROSTROS.tronos} tronos · ${COLECCION_ROSTROS.dinero} dineros · ${COLECCION_ROSTROS.tribunal} tribunales · ${COLECCION_ROSTROS.nuevos} nuevos · filtro: ${filtro === "todos" ? "todos" : CATEGORIAS_ROSTRO[filtro].etiqueta} · ${totalSenales} señales vivas`,
      },
      {
        t: `EXPEDIENTE Nº ${String(sel.num).padStart(2, "0")}: ${sel.nombre.toUpperCase()}`,
        v: `${sel.poder}/100`,
        p: sel.poder,
        color: cm.color,
        d: `${sel.cargo} · ${sel.organizacion} · sede: ${sel.sede}, ${sel.ciudad} · mandato: ${sel.mandato}`,
      },
      {
        t: "LA RUTA AL PODER",
        color: "#7AB8FF",
        d: sel.ruta,
      },
    ];
    // offset 3: colección + expediente + ruta preceden a la jerarquía
    for (const [i, r] of jerarquia.slice(0, 6).entries()) {
      filas.push({
        t: `${String(i + 1).padStart(2, "0")}· ${r.nombre.toUpperCase()}`,
        v: `${r.poder}`,
        p: r.poder,
        color: CATEGORIAS_ROSTRO[r.categoria].color,
        d: `${r.cargo} · ${r.pais} · índice de poder de la Casa`,
        a: "abrir expediente",
      });
    }
    if (cablesSel.length > 0) {
      for (const c of cablesSel.slice(0, 2)) {
        filas.push({
          t: c.title,
          color: "#D4AF37",
          d: `${c.tacticalTag ?? "SEÑAL"} · ${c.source} · pulsa para leer en la sala interna`,
          a: "leer cable",
        });
      }
    } else {
      filas.push({
        t: "EL ROSTRO ESTÁ EN SILENCIO",
        color: "#7AB8FF",
        d: "Ningún cable de su dominio en la franja actual · el pulso se renueva cada cinco minutos",
      });
    }
    return filas;
  }, [sel, cm, visibles, filtro, totalSenales, jerarquia, cablesSel]);
  useSala3DContenido(
    "rostros",
    "LOS ROSTROS DEL PODER",
    "#D4AF37",
    `${COLECCION_ROSTROS.total} rostros vigilados · expediente abierto: ${sel.nombre} · ${totalSenales} señales vivas`,
    filas3D,
  );

  // v168: oyente de acciones del mundo 3D — mismos handlers que la UI 2D:
  // irAlExpediente (jerarquía) y apertura del cable en la sala de lectura
  useEffect(() => {
    const onAccion = (e: Event) => {
      const det = (e as CustomEvent<{ tab: string; accion: string; idx: number }>).detail;
      if (det?.tab !== "rostros") return;
      if (det.accion === "abrir expediente") {
        // offset 3: colección + expediente + ruta preceden a la jerarquía en filas3D
        const r = jerarquia[det.idx - 3];
        if (r) irAlExpediente(r.id);
      } else if (det.accion === "leer cable") {
        // offset dinámico: 3 fijas + hasta 6 de jerarquía preceden a los cables
        const c = cablesSel[det.idx - (3 + Math.min(jerarquia.length, 6))];
        if (c) {
          setCableSel(c);
          sfx.campana();
        }
      }
    };
    window.addEventListener("vg:sala3d-accion", onAccion);
    return () => window.removeEventListener("vg:sala3d-accion", onAccion);
  }, [jerarquia, cablesSel]);

  return (
    <div className="space-y-5">
      <PanelHeader
        title="LOS ROSTROS DEL PODER"
        subtitle="Las 34 personas que mueven el planeta: dónde viven, cómo llegaron y quién las espera en la sombra"
        icon={<Users className="w-4 h-4" />}
        color="amber"
      />

      <HeroOro panel="rostros" />

      {/* ── CIFRAS DE LA COLECCIÓN ── */}
      <div className="flex flex-wrap gap-x-6 gap-y-1.5 justify-center font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
        <span><span className="text-foreground font-bold">{COLECCION_ROSTROS.total}</span> rostros en el dossier</span>
        <span><span className="text-foreground font-bold">{COLECCION_ROSTROS.tronos}</span> tronos · <span className="text-foreground font-bold">{COLECCION_ROSTROS.dinero}</span> dineros · <span className="text-foreground font-bold">{COLECCION_ROSTROS.tribunal}</span> tribunales · <span className="text-foreground font-bold">{COLECCION_ROSTROS.nuevos}</span> nuevos</span>
        <span><span className="text-foreground font-bold">{COLECCION_ROSTROS.medios}</span> con poder ≥ 80</span>
        <span>el más poderoso: <span className="text-foreground font-bold">{COLECCION_ROSTROS.masPoderoso.bandera} {COLECCION_ROSTROS.masPoderoso.nombre}</span></span>
        {totalSenales > 0 && <span className="text-foreground"><Radio className="inline w-3 h-3 -mt-0.5" /> {totalSenales} señales vivas ahora</span>}
      </div>

      {/* ── FILTROS DE CORTE ── */}
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <button
          onClick={() => { setFiltro("todos"); sfx.campana(); }}
          className={cn(
            "rounded-full border px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-widest transition-all",
            filtro === "todos"
              ? "border-foreground/50 bg-foreground/10 text-foreground"
              : "border-border text-muted-foreground hover:text-foreground"
          )}
        >
          Todos · {COLECCION_ROSTROS.total}
        </button>
        {CORTES.map((c) => {
          const meta = CATEGORIAS_ROSTRO[c];
          const on = filtro === c;
          const cuenta = ROSTROS.filter((r) => r.categoria === c).length;
          return (
            <button
              key={c}
              onClick={() => { setFiltro(c); sfx.campana(); }}
              className={cn(
                "rounded-full border px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-widest transition-all",
                on ? "text-foreground" : "border-border text-muted-foreground hover:text-foreground"
              )}
              style={on ? { borderColor: `${meta.color}88`, background: `${meta.color}18` } : undefined}
            >
              {meta.icono} {meta.etiqueta} · {cuenta}
            </button>
          );
        })}
      </div>

      {/* ── EL MAPA DEL PODER + ÍNDICE POR CORTES ── */}
      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-4">
        <div className="hud-panel p-4">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
            <MapIcon className="w-3.5 h-3.5 text-amber-hud" /> EL MAPA DEL PODER — {visibles.length} UBICACIONES REALES
          </p>
          <p className="text-[10px] text-muted-foreground leading-relaxed mt-1 mb-3">
            Cada punto es el sillón real de un rostro: la sede donde se le encuentra de verdad.
            El tamaño del punto es su índice de poder — el anillo dorado marca el expediente abierto.
            Toca un punto para abrirlo.
          </p>
          <svg viewBox="0 0 1000 500" className="w-full h-auto select-none rounded border border-border/60 bg-[#060a0f]" role="img" aria-label="Mapa mundial con las 34 ubicaciones reales de los rostros del poder">
            <path d={worldPaths.graticulePath} fill="none" stroke="#1a2a3a" strokeWidth="0.5" />
            <path d={worldPaths.landPath} fill="#0e1a24" stroke="#2a4a5a" strokeWidth="0.6" />
            <path d={worldPaths.borderPath} fill="none" stroke="#1e3446" strokeWidth="0.5" />

            {visibles.map((r) => {
              const { x, y } = xyDe(r);
              const meta = CATEGORIAS_ROSTRO[r.categoria];
              const activo = r.id === selId;
              const sen = senalesPor[r.id] ?? 0;
              const radio = 2.4 + (r.poder / 100) * 4.2; // el poder manda en el tamaño
              return (
                <g key={r.id} onClick={() => elegir(r.id)} className="cursor-pointer" role="button" aria-label={`${r.nombre} — ${r.sede}`}>
                  <circle cx={x} cy={y} r={Math.max(14, radio + 8)} fill="transparent" />
                  {activo && (
                    <circle cx={x} cy={y} r={radio + 5} fill="none" stroke="#D4AF37" strokeWidth={1.4} className="v130-anillo" />
                  )}
                  <circle cx={x} cy={y} r={radio} fill={activo ? "#D4AF37" : meta.color} fillOpacity={activo ? 1 : 0.85} />
                  {sen > 0 && (
                    <circle cx={x + radio + 3} cy={y - radio - 3} r={2.2} fill="#D4AF37" />
                  )}
                  <text
                    x={x + radio + 5} y={y + 3}
                    fontSize="10"
                    fill={activo ? "#D4AF37" : "var(--muted-foreground)"}
                    fontFamily="monospace"
                    fontWeight="bold"
                    style={{ pointerEvents: "none" }}
                  >
                    {String(r.num).padStart(2, "0")}
                  </text>
                </g>
              );
            })}
          </svg>
          {/* leyenda de cortes */}
          <div className="flex items-center gap-3 flex-wrap mt-2 font-mono text-[9px] text-muted-foreground">
            {CORTES.map((c) => (
              <span key={c} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: CATEGORIAS_ROSTRO[c].color }} />
                {CATEGORIAS_ROSTRO[c].icono} {CATEGORIAS_ROSTRO[c].etiqueta}
              </span>
            ))}
          </div>
        </div>

        {/* índice por cortes con barra de poder */}
        <div className="hud-panel p-4">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2 mb-3">
            <Fingerprint className="w-3.5 h-3.5" style={{ color: "#D4AF37" }} /> ÍNDICE DE EXPEDIENTES
          </p>
          <div className="space-y-3 max-h-[430px] overflow-y-auto pr-1">
            {(filtro === "todos" ? CORTES : [filtro]).map((c, ci) => {
              const meta = CATEGORIAS_ROSTRO[c];
              const filas = ROSTROS.filter((r) => r.categoria === c);
              return (
                <div key={c}>
                  <p className="font-mono text-[8px] uppercase tracking-[0.22em] mb-1" style={{ color: `${meta.color}bb` }}>
                    {meta.icono} {meta.etiqueta} — {meta.leyenda}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {filas.map((r, i) => {
                      const activo = r.id === selId;
                      const sen = senalesPor[r.id] ?? 0;
                      return (
                        <motion.button
                          key={r.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: q2(ci * 0.03 + i * 0.012), duration: 0.3 }}
                          onClick={() => elegir(r.id)}
                          className={cn(
                            "flex items-center gap-1.5 rounded px-2 py-1.5 text-left transition-all border",
                            activo ? "border-foreground/40 bg-foreground/5" : "border-transparent hover:border-border"
                          )}
                        >
                          <span className="font-mono text-[9px] opacity-60 shrink-0">{String(r.num).padStart(2, "0")}</span>
                          <span className="text-[11px] leading-none shrink-0">{r.bandera}</span>
                          <span className={cn("text-[10px] leading-none truncate flex-1", activo ? "text-foreground font-bold" : "text-muted-foreground")}>
                            {r.nombre}
                          </span>
                          {sen > 0 && (
                            <span className="font-mono text-[8px] flex items-center gap-0.5 shrink-0" style={{ color: "#D4AF37" }}>
                              <Radio className="w-2.5 h-2.5" />{sen}
                            </span>
                          )}
                          {activo && <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── EL EXPEDIENTE ABIERTO ── */}
      <div id="v130-expediente" className="grid lg:grid-cols-[1.1fr_1fr] gap-4 scroll-mt-24">
        <div className="hud-panel p-5 vg-mat-vidrio relative overflow-hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-muted-foreground">
                EXPEDIENTE Nº {String(sel.num).padStart(2, "0")} · {cm.etiqueta}
              </p>
              <h3 className="font-caviar text-3xl tracking-wide text-foreground mt-1 leading-none">
                {sel.bandera} {sel.nombre}
              </h3>
              <p className="text-[10px] text-foreground mt-1.5 leading-snug">{sel.cargo}</p>
              <p className="text-[9px] text-muted-foreground leading-snug">{sel.organizacion}</p>
            </div>
            <span className="shrink-0 flex items-center justify-center w-11 h-11 rounded-full border" style={{ borderColor: cm.color, color: cm.color }}>
              <Crown className="w-4.5 h-4.5" />
            </span>
          </div>

          {/* índice de poder de la Casa */}
          <div className="mt-4 pt-3 border-t border-border/60">
            <div className="flex items-center justify-between font-mono text-[8px] uppercase tracking-widest text-muted-foreground mb-1">
              <span>índice de poder de la Casa</span>
              <span className="text-foreground font-bold text-[11px]">{sel.poder}/100</span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary/60 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${sel.poder}%`, background: `linear-gradient(90deg, ${cm.color}, #D4AF37)` }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 font-mono text-[9px]">
            <div><p className="text-muted-foreground uppercase tracking-widest text-[8px]">nación</p><p className="text-foreground font-bold">{sel.bandera} {sel.pais}</p></div>
            <div><p className="text-muted-foreground uppercase tracking-widest text-[8px]">alcance</p><p className="text-foreground font-bold uppercase">{sel.alcance}</p></div>
            <div className="col-span-2"><p className="text-muted-foreground uppercase tracking-widest text-[8px]">sede física</p><p className="text-foreground font-bold leading-tight">{sel.sede} · {sel.ciudad}</p></div>
            <div className="col-span-2"><p className="text-muted-foreground uppercase tracking-widest text-[8px]">mandato</p><p className="text-foreground font-bold leading-tight">{sel.mandato}</p></div>
          </div>

          <p className="font-caviar text-sm italic text-foreground/90 mt-4 leading-relaxed">{sel.frase}</p>
        </div>

        <div className="hud-panel p-5">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" style={{ color: cm.color }} /> LA RUTA AL PODER
          </p>
          <p className="text-[11px] text-foreground/90 leading-relaxed mt-2">{sel.ruta}</p>

          <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-muted-foreground mt-4">rasgos de mando</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {sel.senas.map((d) => (
              <span key={d} className="rounded-full border border-border px-2 py-0.5 font-mono text-[8px] tracking-widest text-muted-foreground">{d}</span>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-2 mt-4">
            <div className="rounded border border-border p-2.5">
              <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-muted-foreground flex items-center gap-1"><Shield className="w-3 h-3" /> la guardia</p>
              <p className="text-[9px] text-muted-foreground leading-relaxed mt-1">{sel.guardia}</p>
            </div>
            <div className="rounded border border-border p-2.5">
              <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> el relevo</p>
              <p className="text-[9px] text-muted-foreground leading-relaxed mt-1">{sel.sucesion}</p>
            </div>
          </div>

          <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-muted-foreground mt-4">el expediente</p>
          <ul className="mt-1.5 space-y-1.5">
            {sel.notas.map((f, i) => (
              <motion.li
                key={f.slice(0, 18)}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: q2(i * 0.06), duration: 0.3 }}
                className="flex gap-2 text-[10px] text-muted-foreground leading-relaxed"
              >
                <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: cm.color }} aria-hidden />
                {f}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── LA JERARQUÍA: el top 10 del índice de poder ── */}
      <div className="hud-panel p-4">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
          <Crown className="w-3.5 h-3.5 text-amber-hud" /> LA JERARQUÍA — EL TOP 10 DEL ÍNDICE DE PODER DE LA CASA
        </p>
        <p className="text-[10px] text-muted-foreground leading-relaxed mt-1 mb-3">
          Mando, presupuesto y alcance mezclados en una sola cifra. No es popularidad:
          es la distancia entre la firma de este rostro y la vida del planeta.
        </p>
        <div className="space-y-1.5">
          {jerarquia.map((r, i) => {
            const meta = CATEGORIAS_ROSTRO[r.categoria];
            const activo = r.id === selId;
            return (
              <button
                key={r.id}
                onClick={() => irAlExpediente(r.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 rounded border px-3 py-2 text-left transition-all",
                  activo ? "border-foreground/40 bg-foreground/5" : "border-border/60 hover:border-foreground/25"
                )}
              >
                <span className="font-mono text-[10px] font-bold w-6 shrink-0" style={{ color: i < 3 ? "#D4AF37" : "var(--muted-foreground)" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[12px] shrink-0">{r.bandera}</span>
                <span className={cn("text-[11px] truncate shrink-0 w-40 sm:w-52", activo ? "text-foreground font-bold" : "text-foreground/90")}>{r.nombre}</span>
                <span className="hidden sm:block text-[9px] text-muted-foreground truncate flex-1">{r.cargo}</span>
                <div className="flex-1 sm:flex-none sm:w-48 h-1.5 rounded-full bg-secondary/60 overflow-hidden shrink-0">
                  <div className="h-full rounded-full" style={{ width: `${r.poder}%`, background: meta.color }} />
                </div>
                <span className="font-mono text-[10px] font-bold w-7 text-right shrink-0" style={{ color: meta.color }}>{r.poder}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── EL PULSO REAL: cables de la casa sobre este rostro ── */}
      <div className="hud-panel p-4">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-amber-hud" /> EL PULSO REAL — {sel.nombre.toUpperCase()} EN LOS CABLES DE AHORA
        </p>
        <p className="text-[10px] text-muted-foreground leading-relaxed mt-1 mb-3">
          Señales auténticas recibidas por la Casa en este momento, filtradas por el dominio del rostro
          seleccionado. Se leen aquí mismo, en la sala de lectura — la Casa nunca manda a otro portal.
        </p>
        {cablesSel.length > 0 ? (
          <div className="space-y-1.5">
            {cablesSel.map((c) => (
              <button
                key={c.id}
                onClick={() => { setCableSel(c); sfx.campana(); }}
                className="w-full text-left rounded border border-border px-3 py-2 transition-all hover:border-foreground/30 group"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[7px] font-bold tracking-widest"
                    style={{ background: "rgba(212,175,55,0.12)", color: "#D4AF37" }}
                  >
                    {c.tacticalTag ?? "SEÑAL"}
                  </span>
                  <span className="text-[10px] text-foreground leading-snug">{c.title}</span>
                </span>
                <span className="block font-mono text-[8px] text-muted-foreground mt-1 uppercase tracking-wider">
                  {c.source} · {new Date(c.publishedAt).toLocaleDateString("es", { day: "numeric", month: "short" })} · leer en la sala interna
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-muted-foreground italic leading-relaxed rounded border border-dashed border-border px-4 py-5 text-center">
            El rostro está en silencio en la franja actual — ningún cable de su dominio ahora mismo.
            El poder también descansa; el pulso se renueva cada cinco minutos.
          </p>
        )}
      </div>

      {/* ── LA LEY DEL ACCESO: por qué esta sala existe ── */}
      <div className="hud-panel p-4">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
          <Fingerprint className="w-3.5 h-3.5" style={{ color: "#D4AF37" }} /> LA LEY DEL ACCESO
        </p>
        <div className="grid sm:grid-cols-3 gap-2.5 mt-3">
          <div className="rounded border border-border p-3.5">
            <p className="font-mono text-[11px] font-bold tracking-widest text-foreground">ABIERTO</p>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">como un gobierno, pero libre</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed mt-1.5">
              En un gobierno real, este dossier vive en un búnker con acreditación de por vida. Aquí lo
              tiene cualquier persona con curiosidad: la potencia del Estado, liberada.
            </p>
          </div>
          <div className="rounded border border-border p-3.5">
            <p className="font-mono text-[11px] font-bold tracking-widest text-foreground">VERIFICADO</p>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">fuentes abiertas, sin maquillaje</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed mt-1.5">
              Cada ruta, cada sede y cada guardia salen de fuentes abiertas: biografías oficiales,
              prensa de registro y bases OSINT. Vanguard no predice — presenta.
            </p>
          </div>
          <div className="rounded border border-dashed border-border p-3.5 flex flex-col justify-center">
            <p className="font-mono text-[11px] font-bold tracking-widest" style={{ color: "#D4AF37" }}>VIVO</p>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">el pulso se renueva</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed mt-1.5">
              Los rostros no posan: se vigilan. Cuando uno de ellos entra en los cables del momento,
              su punto enciende la señal dorada en el mapa — y la sala entera lo sabe.
            </p>
          </div>
        </div>
      </div>

      {/* v174 LAS INTROS GTA — la placa de presentación del rostro elegido
          (portal propio al body; también suena al abrir desde el mundo 3D) */}
      {introId && rostroDe(introId) && (
        <IntroGtaPersonaje
          key={introId}
          rostro={rostroDe(introId)!}
          senales={senalesPor[introId] ?? 0}
          onFin={() => setIntroId(null)}
        />
      )}

      {/* lectura interna */}
      {cableSel && <LectorNoticia cable={cableSel} onCerrar={() => setCableSel(null)} />}
    </div>
  );
}

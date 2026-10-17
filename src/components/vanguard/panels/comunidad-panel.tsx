"use client";

// ============================================================
// v127.0 LA COMUNIDAD — LOS 18 OJOS DE LA CASA
// La sala donde VANGUARD abre la Comunidad de Inteligencia de los
// Estados Unidos como una colección de expedientes finos:
//   · LA PIRÁMIDE — la corona, los ojos, el Pentágono y los ministerios
//   · EL CORREDOR — el mapa real de sedes: Washington · Virginia · Maryland
//   · EL EXPEDIENTE — misión, lema, fichas y dominio de cada agencia
//   · EL PULSO REAL — los cables que la Casa recibe AHORA sobre cada ojo
//   · LOS CINCO SENTIDOS — HUMINT · SIGINT · GEOINT · OSINT · FININT
//   · SALA ANEXA — DHS, FEMA y las manos que actúan tras los ojos
// Doctrina de la Casa: espacio negativo, placa numerada, narrativa.
// ============================================================
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { IlustracionViva } from "@/components/vanguard/ilustraciones-vivas";
import { LectorNoticia, type CableLectura } from "@/components/vanguard/lector-noticia";
import { sfx } from "@/lib/sound";
import { cn, q2 } from "@/lib/utils";
import {
  AGENCIAS, ALIADAS, SENTIDOS, CATEGORIA_META, PULSO_KEYWORDS, COLECCION,
  agenciaDe, type Agencia, type CategoriaAgencia,
} from "@/lib/agencias-data";
import {
  Crown, Eye, Signal, Crosshair, Map as MapIcon, Satellite, Landmark, Ship, Swords,
  Plane, Rocket, Scale, Building2, Anchor, Pill, ScrollText, Coins, Atom, Radar,
  Handshake, Radio, ChevronRight, Fingerprint, ShieldCheck,
} from "lucide-react";

const ICONO: Record<string, React.ReactNode> = {
  odni: <Crown className="w-4 h-4" />,
  cia: <Eye className="w-4 h-4" />,
  nsa: <Signal className="w-4 h-4" />,
  dia: <Crosshair className="w-4 h-4" />,
  nga: <MapIcon className="w-4 h-4" />,
  nro: <Satellite className="w-4 h-4" />,
  inscom: <Landmark className="w-4 h-4" />,
  oni: <Ship className="w-4 h-4" />,
  mcia: <Swords className="w-4 h-4" />,
  afintel: <Plane className="w-4 h-4" />,
  sfintel: <Rocket className="w-4 h-4" />,
  fbi: <Scale className="w-4 h-4" />,
  dhs: <Building2 className="w-4 h-4" />,
  costera: <Anchor className="w-4 h-4" />,
  dea: <Pill className="w-4 h-4" />,
  inr: <ScrollText className="w-4 h-4" />,
  oia: <Coins className="w-4 h-4" />,
  oici: <Atom className="w-4 h-4" />,
};

// orden de la pirámide: de la corona a los ministerios
const TIERS: { cat: CategoriaAgencia; leyenda: string }[] = [
  { cat: "coordinacion", leyenda: "LA CORONA — quien entrega el informe diario al Presidente" },
  { cat: "independiente", leyenda: "EL OJO EXTERIOR — todo lo que ocurre fuera de casa" },
  { cat: "defensa", leyenda: "LAS CUATRO GRANDES DEL PENTÁGONO" },
  { cat: "militar", leyenda: "LOS CINCO SERVICIOS ARMADOS" },
  { cat: "seguridad", leyenda: "EL ESCUDO INTERNO — el enemigo dentro de casa" },
  { cat: "ministerio", leyenda: "LOS MINISTERIOS — diplomáticos, dinero y átomo" },
];

// señales de un ojo en los cables dados (pura — fuera del componente para el lint)
function cablesDeAgencia(id: string, cables: CableLectura[]): CableLectura[] {
  const kws = (PULSO_KEYWORDS[id] ?? []).map((k) => k.toLowerCase());
  if (kws.length === 0) return [];
  return cables
    .filter((c) => kws.some((k) => c.title.toLowerCase().includes(k)))
    .slice(0, 3);
}

export function ComunidadPanel() {
  const [selId, setSelId] = useState<string>("odni");
  const [cables, setCables] = useState<CableLectura[]>([]);
  const [cableSel, setCableSel] = useState<CableLectura | null>(null);

  const sel: Agencia = agenciaDe(selId) ?? AGENCIAS[0];
  const meta = CATEGORIA_META[sel.categoria];

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
      } catch { /* la comunidad vive también en silencio */ }
    };
    cargar();
    const id = setInterval(cargar, 300_000);
    return () => { vivo = false; clearInterval(id); };
  }, []);

  // señales por agencia (leyenda + índice)
  const senalesPor = useMemo(() => {
    const m: Record<string, number> = {};
    for (const a of AGENCIAS) {
      m[a.id] = cablesDeAgencia(a.id, cables).length;
    }
    return m;
  }, [cables]);
  const totalSenales = useMemo(
    () => Object.values(senalesPor).reduce((s, n) => s + n, 0),
    [senalesPor]
  );

  const cablesSel = useMemo(
    () => cablesDeAgencia(sel.id, cables),
    [sel, cables]
  );

  const elegir = (id: string) => {
    if (id === selId) return;
    setSelId(id);
    sfx.campana(); // la campana de salón: cada expediente se abre con dignidad
  };

  const irAlExpediente = (id: string) => {
    elegir(id);
    requestAnimationFrame(() => {
      document.getElementById("v127-expediente")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="space-y-5">
      <PanelHeader
        title="LA COMUNIDAD"
        subtitle="Los 18 ojos de la Casa: la Comunidad de Inteligencia de los EE. UU., expediente a expediente"
        icon={<Eye className="w-4 h-4" />}
        color="cyan"
      />

      <HeroOro panel="comunidad" />

      {/* ── CIFRAS DE LA COLECCIÓN ── */}
      <div className="flex flex-wrap gap-x-6 gap-y-1.5 justify-center font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
        <span><span className="text-foreground font-bold">{COLECCION.total}</span> expedientes oficiales</span>
        <span><span className="text-foreground font-bold">{COLECCION.enCorredor}</span> sedes en el corredor</span>
        <span>fundada <span className="text-foreground font-bold">{COLECCION.masAntigua.fundacion}</span> ({COLECCION.masAntigua.sigla}) — última <span className="text-foreground font-bold">{COLECCION.masJoven.fundacion}</span> ({COLECCION.masJoven.sigla})</span>
        <span><span className="text-foreground font-bold">{COLECCION.creadasPost11S}</span> nacidas tras el 11-S</span>
        {totalSenales > 0 && <span className="text-foreground"><Radio className="inline w-3 h-3 -mt-0.5" /> {totalSenales} señales vivas ahora</span>}
      </div>

      {/* ── LA PIRÁMIDE ── */}
      <div className="hud-panel p-4 vg-mat-vidrio">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5" style={{ color: meta.color }} /> LA PIRÁMIDE
        </p>
        <p className="text-[10px] text-muted-foreground leading-relaxed mt-1 mb-4">
          Dieciocho agencias, una sola cadena de mando: la ODNI en la corona coordina a los diecisiete
          ojos restantes para que ninguna pieza mire al vacío. Toca cualquier sigla y su expediente se abre.
        </p>
        <div className="space-y-3">
          {TIERS.map((tier, ti) => {
            const cm = CATEGORIA_META[tier.cat];
            const filas = AGENCIAS.filter((a) => a.categoria === tier.cat);
            return (
              <div key={tier.cat} className="text-center">
                <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-muted-foreground mb-1.5">
                  {tier.leyenda}
                </p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {filas.map((a, i) => {
                    const activo = a.id === selId;
                    const sen = senalesPor[a.id] ?? 0;
                    return (
                      <motion.button
                        key={a.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: q2(ti * 0.05 + i * 0.02), duration: 0.3 }}
                        onClick={() => elegir(a.id)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[10px] font-bold tracking-wider transition-all",
                          activo ? "text-foreground" : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                        )}
                        style={activo ? { borderColor: cm.color, boxShadow: `0 0 18px -6px ${cm.color}` } : undefined}
                      >
                        <span className="opacity-60">{String(a.num).padStart(2, "0")}</span>
                        {a.sigla}
                        {sen > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#D4AF37" }} title={`${sen} señales vivas`} />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── EL CORREDOR: el mapa de sedes ── */}
      <div className="grid lg:grid-cols-[1.35fr_1fr] gap-4">
        <div className="hud-panel p-4">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
            <MapIcon className="w-3.5 h-3.5 text-cyan-hud" /> EL CORREDOR — WASHINGTON · VIRGINIA · MARYLAND
          </p>
          <p className="text-[10px] text-muted-foreground leading-relaxed mt-1 mb-3">
            La densidad de información más alta del planeta: en un radio de 50 kilómetros conviven
            {COLECCION.enCorredor} de las 18 sedes. Toca un punto numerado para abrir su expediente.
          </p>
          <svg viewBox="0 0 100 100" className="w-full h-auto select-none" role="img" aria-label="Mapa del corredor de inteligencia">
            {/* retícula fina */}
            {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((g) => (
              <g key={g} stroke="var(--border)" strokeOpacity={0.35} strokeWidth={0.15}>
                <line x1={g} y1={0} x2={g} y2={100} />
                <line x1={0} y1={g} x2={100} y2={g} />
              </g>
            ))}
            {/* el Potomac */}
            <path
              d="M 14 24 C 26 32, 36 28, 42 40 C 47 50, 50 58, 53 70 C 55 79, 60 88, 67 95"
              fill="none" stroke="#7FE3FF" strokeOpacity={0.35} strokeWidth={1.3} strokeLinecap="round"
            />
            <path
              d="M 76 82 C 83 87, 90 92, 98 98"
              fill="none" stroke="#7FE3FF" strokeOpacity={0.25} strokeWidth={1.0} strokeLinecap="round"
            />
            {/* geografía */}
            <text x={50} y={36} textAnchor="middle" fontSize={2.8} fill="var(--muted-foreground)" className="font-mono" letterSpacing={0.6}>WASHINGTON</text>
            <text x={22} y={98} fontSize={2.4} fill="var(--muted-foreground)" className="font-mono" opacity={0.7}>VIRGINIA</text>
            <text x={72} y={12} fontSize={2.4} fill="var(--muted-foreground)" className="font-mono" opacity={0.7}>MARYLAND</text>
            {AGENCIAS.map((a) => {
              if (!a.pos) return null;
              const activo = a.id === selId;
              const cm = CATEGORIA_META[a.categoria];
              return (
                <g key={a.id} onClick={() => elegir(a.id)} className="cursor-pointer">
                  <circle cx={a.pos.x} cy={a.pos.y} r={4.4} fill="transparent" />
                  {activo && (
                    <circle cx={a.pos.x} cy={a.pos.y} r={2.8} fill="none" stroke="#D4AF37" strokeWidth={0.4} className="v127-anillo" />
                  )}
                  <circle
                    cx={a.pos.x} cy={a.pos.y}
                    r={activo ? 1.6 : 1.05}
                    fill={activo ? "#D4AF37" : cm.color}
                    fillOpacity={activo ? 1 : 0.85}
                  />
                  <text
                    x={a.pos.x + 2.4} y={a.pos.y + 0.95}
                    fontSize={2.7}
                    fill={activo ? "#D4AF37" : "var(--muted-foreground)"}
                    className="font-mono"
                    style={{ pointerEvents: "none" }}
                  >
                    {String(a.num).padStart(2, "0")}
                  </text>
                </g>
              );
            })}
          </svg>
          <p className="font-mono text-[9px] text-muted-foreground mt-2 text-center">
            fuera del corredor: {COLECCION.fueraCorredor.join(" · ")} — expedientes {AGENCIAS.filter((a) => !a.pos).map((a) => String(a.num).padStart(2, "0")).join(" y ")}
          </p>
        </div>

        {/* leyenda-índice del corredor */}
        <div className="hud-panel p-4">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2 mb-3">
            <Fingerprint className="w-3.5 h-3.5" style={{ color: "#D4AF37" }} /> ÍNDICE DE EXPEDIENTES
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1">
            {AGENCIAS.map((a) => {
              const activo = a.id === selId;
              const cm = CATEGORIA_META[a.categoria];
              const sen = senalesPor[a.id] ?? 0;
              return (
                <button
                  key={a.id}
                  onClick={() => elegir(a.id)}
                  className={cn(
                    "flex items-center gap-2 rounded px-2 py-1.5 text-left transition-all border",
                    activo ? "border-foreground/40 bg-foreground/5" : "border-transparent hover:border-border"
                  )}
                >
                  <span className="font-mono text-[9px] opacity-60 w-4 shrink-0">{String(a.num).padStart(2, "0")}</span>
                  <span className="w-3.5 h-3.5 shrink-0 flex items-center justify-center" style={{ color: cm.color }}>
                    {ICONO[a.id]}
                  </span>
                  <span className={cn("font-mono text-[10px] font-bold tracking-wider truncate", activo ? "text-foreground" : "text-muted-foreground")}>
                    {a.sigla}
                  </span>
                  <span className="flex-1" />
                  {sen > 0 && (
                    <span className="font-mono text-[8px] text-foreground flex items-center gap-1 shrink-0">
                      <Radio className="w-2.5 h-2.5" style={{ color: "#D4AF37" }} />{sen}
                    </span>
                  )}
                  {activo && <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── EL EXPEDIENTE ABIERTO ── */}
      <div id="v127-expediente" className="grid lg:grid-cols-[1.1fr_1fr] gap-4 scroll-mt-24">
        <div className="hud-panel p-5 vg-mat-vidrio relative overflow-hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-muted-foreground">
                EXPEDIENTE Nº {String(sel.num).padStart(2, "0")} · {meta.etiqueta}
              </p>
              <h3 className="font-caviar text-3xl tracking-wide text-foreground mt-1 leading-none">{sel.sigla}</h3>
              <p className="text-[10px] text-foreground mt-1.5 leading-snug">{sel.nombre}</p>
              <p className="text-[9px] text-muted-foreground leading-snug">{sel.nombreEs}</p>
            </div>
            <span className="shrink-0 flex items-center justify-center w-11 h-11 rounded-full border" style={{ borderColor: meta.color, color: meta.color }}>
              {ICONO[sel.id]}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 pt-3 border-t border-border/60 font-mono text-[9px]">
            <div><p className="text-muted-foreground uppercase tracking-widest text-[8px]">fundada</p><p className="text-foreground font-bold">{sel.fundacion}</p></div>
            <div><p className="text-muted-foreground uppercase tracking-widest text-[8px]">sede</p><p className="text-foreground font-bold leading-tight">{sel.sede}</p></div>
            <div><p className="text-muted-foreground uppercase tracking-widest text-[8px]">plantilla</p><p className="text-foreground font-bold leading-tight">{sel.personal}</p></div>
            <div><p className="text-muted-foreground uppercase tracking-widest text-[8px]">oficio</p><p className="text-foreground font-bold leading-tight">{sel.especialidad}</p></div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {sel.dominio.map((d) => (
              <span key={d} className="rounded-full border border-border px-2 py-0.5 font-mono text-[8px] tracking-widest text-muted-foreground">{d}</span>
            ))}
          </div>

          <p className="font-caviar text-sm italic text-foreground/90 mt-4 leading-relaxed">{sel.lema}</p>
        </div>

        <div className="hud-panel p-5">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
            {ICONO[sel.id]} LA MISIÓN
          </p>
          <p className="text-[11px] text-foreground/90 leading-relaxed mt-2">{sel.mision}</p>
          <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-muted-foreground mt-4">el expediente</p>
          <ul className="mt-1.5 space-y-1.5">
            {sel.fichas.map((f, i) => (
              <motion.li
                key={f.slice(0, 18)}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: q2(i * 0.06), duration: 0.3 }}
                className="flex gap-2 text-[10px] text-muted-foreground leading-relaxed"
              >
                <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: meta.color }} aria-hidden />
                {f}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── EL PULSO REAL: cables de la casa sobre esta agencia ── */}
      <div className="hud-panel p-4">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-cyan-hud" /> EL PULSO REAL — {sel.sigla} EN LOS CABLES DE AHORA
        </p>
        <p className="text-[10px] text-muted-foreground leading-relaxed mt-1 mb-3">
          Señales auténticas recibidas por la Casa en este momento, filtradas por el dominio del ojo
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
            El corredor está en silencio ahora mismo para {sel.sigla} — ningún cable de su dominio en la
            franja actual. La paciencia es el primer oficio de la inteligencia; el pulso se renueva cada
            cinco minutos.
          </p>
        )}
      </div>

      {/* ── LOS CINCO SENTIDOS ── */}
      <div className="hud-panel p-4">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
          <Radar className="w-3.5 h-3.5 text-cyan-hud" /> LOS CINCO SENTIDOS DE LA INTELIGENCIA
        </p>
        <p className="text-[10px] text-muted-foreground leading-relaxed mt-1 mb-3">
          Cada agencia destaca en un sentido distinto. Estos son los oficios que se reparten el mundo.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {SENTIDOS.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: q2(i * 0.05), duration: 0.35 }}
              className="rounded border border-border p-3"
            >
              <p className="font-mono text-[11px] font-bold tracking-widest text-foreground">{s.sigla}</p>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">{s.nombre}</p>
              <p className="text-[9px] text-muted-foreground leading-relaxed mt-1.5">{s.texto}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── SALA ANEXA: DHS, FEMA y las manos ── */}
      <div className="hud-panel p-4">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
          <Handshake className="w-3.5 h-3.5" style={{ color: "#3DDC97" }} /> SALA ANEXA — LAS MANOS QUE ACTÚAN
        </p>
        <p className="text-[10px] text-muted-foreground leading-relaxed mt-1 mb-3">
          No están entre los 18 ojos, pero sin ellas la visión no se vuelve acción: el ministerio que
          unifica y la agencia que corre cuando el desastre ya es visible.
        </p>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {ALIADAS.map((a) => (
            <div key={a.id} className="rounded border border-border p-3.5">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full border border-border text-muted-foreground">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
                <div>
                  <p className="font-mono text-[11px] font-bold tracking-widest text-foreground">{a.sigla}</p>
                  <p className="text-[9px] text-muted-foreground">{a.nombre}</p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed mt-2">{a.nota}</p>
            </div>
          ))}
          <div className="rounded border border-dashed border-border p-3.5 flex flex-col justify-center">
            <IlustracionViva tipo="satelite" ancho={110} className="mx-auto" />
            <p className="text-[9px] text-muted-foreground leading-relaxed mt-2 text-center">
              El DHS unifica 22 agencias bajo un mismo techo desde 2002 — y su Oficina I&A (expediente Nº 13)
              es la puerta por la que la Comunidad habla con las policías de los 50 estados.
            </p>
          </div>
        </div>
      </div>

      {/* lectura interna */}
      {cableSel && <LectorNoticia cable={cableSel} onCerrar={() => setCableSel(null)} />}
    </div>
  );
}

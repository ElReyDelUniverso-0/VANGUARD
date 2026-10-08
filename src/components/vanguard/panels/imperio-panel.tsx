"use client";

// v91.0 AUGE Y CAÍDA — espejo jugable del RTS territorial, adaptado al mundo
// Vanguard: funda un imperio, crece celda a celda, sostén frentes (mantener /
// contraatacar), investiga, bombardea con cañones que golpean a AMBOS bandos,
// desembarca con navales desde tus puertos y toma el 75% del continente antes
// de que el reloj de 15 minutos se apague. Motor propio en imperio-data.ts.

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Anchor, Crown, FlaskConical, Hammer, Landmark, Map as MapIcon, Minus, Move,
  Pause, Play, Plus, RotateCcw, Scroll, Shield, Swords, Target, Timer, Users,
} from "lucide-react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { HeroOro } from "@/components/vanguard/hero-oro";
import {
  COLS, COSTES, EFECTOS, FACciones, INVESTIGACIONES, MAPA_H, MAPA_W, META_DOMINIO, RELOJ_INICIAL,
  cambiarModoFrente, celdasDe, construir, crearJuego, cuentaEdificio, dispararCañon, hexPoligono,
  lanzarAtaque, lanzarInvestigacion, puedeAtacarDesde, porcentajeMundo, reclutar, reforzar,
  tickJuego, tierraTotal, capReserva, capVivienda,
  type Celda, type EstadoJuego, type TipoEdificio,
} from "@/lib/imperio-data";
import { cn } from "@/lib/utils";

// ---------- utilidades ----------

function mmss(s: number): string {
  const m = Math.max(0, Math.floor(s / 60));
  const r = Math.max(0, Math.floor(s % 60));
  return `${m}:${r.toString().padStart(2, "0")}`;
}

const TERRENO_TINTE: Record<string, string> = {
  llanura: "",
  bosque: "S,.2,.12",
  colina: "S,.12,.05",
  montaña: "S,0,-.08",
};

// mezcla un color hex con negro/blanco para dar matiz de terreno
function matiz(hex: string, terreno: string): string {
  const t = TERRENO_TINTE[terreno] ?? "";
  if (!t) return hex;
  const [, dl, dh] = t.split(",");
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  const f = parseFloat(dl);
  const w = parseFloat(dh);
  r = Math.max(0, Math.min(255, Math.round(r * (1 - f) + f * 20 + w * 255)));
  g = Math.max(0, Math.min(255, Math.round(g * (1 - f) + f * 20 + w * 255)));
  b = Math.max(0, Math.min(255, Math.round(b * (1 - f) + f * 20 + w * 255)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// ---------- edificio dibujado (formas geométricas propias, sin emoji) ----------

function EdificioIcono({ c }: { c: Celda }) {
  const t = c.edificio;
  if (!t) return null;
  const ink = "#0B0E14";
  if (t === "ciudad") {
    return (
      <g pointerEvents="none">
        <rect x={c.x - 4.5} y={c.y - 1} width={3.6} height={5.4} fill={ink} />
        <rect x={c.x + 0.6} y={c.y - 3.4} width={3.6} height={7.8} fill={ink} />
        <rect x={c.x - 0.9} y={c.y + 4.4} width={1.8} height={1.2} fill={ink} />
      </g>
    );
  }
  if (t === "mercado") {
    return (
      <g pointerEvents="none">
        <polygon points={`${c.x},${c.y - 4.2} ${c.x + 4.2},${c.y} ${c.x},${c.y + 4.2} ${c.x - 4.2},${c.y}`} fill={ink} />
        <circle cx={c.x} cy={c.y} r={1.1} fill="#FFC94D" />
      </g>
    );
  }
  if (t === "laboratorio") {
    return (
      <g pointerEvents="none">
        <polygon points={`${c.x},${c.y - 4.6} ${c.x + 4.2},${c.y + 3.6} ${c.x - 4.2},${c.y + 3.6}`} fill={ink} />
        <circle cx={c.x} cy={c.y + 1.4} r={1.3} fill="#B18CFF" />
      </g>
    );
  }
  if (t === "cuartel") {
    return (
      <g pointerEvents="none">
        <polygon points={`${c.x - 4.4},${c.y + 3} ${c.x},${c.y - 3.6} ${c.x + 4.4},${c.y + 3}`} fill="none" stroke={ink} strokeWidth={2.1} />
        <polygon points={`${c.x - 2.4},${c.y + 4.4} ${c.x},${c.y + 0.6} ${c.x + 2.4},${c.y + 4.4}`} fill={ink} />
      </g>
    );
  }
  if (t === "fortaleza") {
    return (
      <g pointerEvents="none">
        <rect x={c.x - 4} y={c.y - 2.4} width={8} height={6.6} fill={ink} />
        <rect x={c.x - 4} y={c.y - 4.2} width={2} height={1.8} fill={ink} />
        <rect x={c.x - 1} y={c.y - 4.2} width={2} height={1.8} fill={ink} />
        <rect x={c.x + 2} y={c.y - 4.2} width={2} height={1.8} fill={ink} />
      </g>
    );
  }
  if (t === "puerto") {
    return (
      <g pointerEvents="none">
        <circle cx={c.x} cy={c.y - 1.6} r={2.5} fill="none" stroke={ink} strokeWidth={1.7} />
        <path d={`M ${c.x - 4.4} ${c.y + 2.8} q 2.2 -1.8 4.4 0 q 2.2 1.8 4.4 0`} fill="none" stroke={ink} strokeWidth={1.5} />
      </g>
    );
  }
  // cañón
  return (
    <g pointerEvents="none">
      <circle cx={c.x - 1.4} cy={c.y + 2.4} r={2.4} fill={ink} />
      <rect x={c.x - 1} y={c.y - 4.6} width={2.4} height={6.4} rx={1} fill={ink} transform={`rotate(38 ${c.x} ${c.y})`} />
    </g>
  );
}

// ---------- una celda del mapa ----------

function CeldaSvg({
  c, e, resaltada, tenue, alClick, ver,
}: {
  c: Celda;
  e: EstadoJuego;
  resaltada: boolean;
  tenue: boolean;
  alClick: (c: Celda) => void;
  ver: number;
}) {
  const imp = c.dueño ? e.imperios.find((i) => i.id === c.dueño) : null;
  const esMar = c.tipo === "mar";
  const frente = e.frentes.find((f) => f.objetivo === c.id);
  const boom = e.booms.find((b) => b.celda === c.id);
  const onda = e.ondas.find((o) => o.celda === c.id);
  const fill = esMar ? "#0A1526" : imp ? matiz(imp.color, c.tipo) : c.tipo === "montaña" ? "#55504B" : c.tipo === "bosque" ? "#2F4237" : c.tipo === "colina" ? "#45403A" : "#3A3A44";
  const sel = resaltada;

  return (
    <g
      onClick={() => alClick(c)}
      className="cursor-pointer"
      style={{ opacity: tenue ? 0.55 : 1 }}
    >
      <polygon
        points={hexPoligono(c.x, c.y)}
        fill={fill}
        stroke={sel ? "#FFFFFF" : esMar ? "#0D1B30" : "rgba(6,8,12,.42)"}
        strokeWidth={sel ? 2 : 0.7}
        opacity={esMar ? 1 : 0.88}
      />
      {/* capital: estrella ondeando */}
      {c.capital && (
        <polygon
          className="v91-bandera"
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          points={estrella(c.x, c.y - 9.5, 4.6, 2)}
          fill="#0B0E14"
          stroke="#FFC94D"
          strokeWidth={0.8}
          pointerEvents="none"
        />
      )}
      <EdificioIcono c={c} />
      {/* guarnición */}
      {!esMar && c.dueño && c.guarnicion >= 1 && (
        <text x={c.x} y={c.y + 11.6} textAnchor="middle" fontSize={8.4} fontWeight={700} fill="#0B0E14" pointerEvents="none" className="font-mono">
          {Math.ceil(c.guarnicion)}
        </text>
      )}
      {!esMar && !c.dueño && (
        <text x={c.x} y={c.y + 10.6} textAnchor="middle" fontSize={7} fill="rgba(210,214,226,.4)" pointerEvents="none" className="font-mono">
          {c.guarnicion}
        </text>
      )}
      {/* frente activo: insignia pulsante del atacante */}
      {frente && (
        <g pointerEvents="none">
          <circle className="v91-frente" style={{ transformBox: "fill-box", transformOrigin: "center" }} cx={c.x} cy={c.y} r={10.5} fill="none" stroke={e.imperios.find((i) => i.id === frente.atacante)?.color ?? "#FFC94D"} strokeWidth={1.6} strokeDasharray="3 2.4" />
          <text x={c.x} y={c.y - 13.4} textAnchor="middle" fontSize={7.6} fontWeight={700} fill={e.imperios.find((i) => i.id === frente.atacante)?.color ?? "#FFC94D"} className="font-mono">
            {Math.ceil(frente.tropas)}
          </text>
        </g>
      )}
      {/* onda de conquista */}
      {onda && (
        <circle className="v91-onda" style={{ transformBox: "fill-box", transformOrigin: "center" }} cx={c.x} cy={c.y} r={11} fill="none" stroke={imp?.color ?? "#FFC94D"} strokeWidth={2} pointerEvents="none" />
      )}
      {/* cañonazo */}
      {boom && (
        <g pointerEvents="none">
          <circle className="v91-boom" style={{ transformBox: "fill-box", transformOrigin: "center" }} cx={c.x} cy={c.y} r={13} fill="#FFF3D6" opacity={0.95} />
          <circle className="v91-boom" style={{ transformBox: "fill-box", transformOrigin: "center", animationDelay: ".12s" }} cx={c.x} cy={c.y} r={9} fill="#FF9A4D" opacity={0.8} />
        </g>
      )}
      {/* ancla sutil en costeras para el modo naval */}
      {ver >= 0 && null}
    </g>
  );
}

function estrella(cx: number, cy: number, r: number, ri: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : ri;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
}

// ---------- pantalla de fundación ----------

function Fundar({
  faccion, setFaccion, onFundar, record,
}: {
  faccion: string;
  setFaccion: (v: string) => void;
  onFundar: () => void;
  record: { victorias: number; partidas: number; mejor: number };
}) {
  return (
    <div className="space-y-4">
      <PanelHeader
        title="IMPERIO · AUGE Y CAÍDA"
        subtitle="Funda un imperio sobre el continente y haz caer a los demás — el trono no se hereda: se toma"
        icon={<Crown className="w-4 h-4 text-amber-hud" />}
        color="amber"
      />
      <HeroOro panel="imperio" />

      <div className="hud-panel p-4 space-y-3">
        <p className="text-[10px] font-mono uppercase tracking-widest text-amber-hud flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" /> elige tu facción — define cómo ganaras
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {FACciones.map((f, i) => (
            <button
              key={f.id}
              onClick={() => setFaccion(f.id)}
              className={cn(
                "text-left p-3 border transition-all group",
                faccion === f.id
                  ? "border-amber-hud bg-amber-hud/10 shadow-[0_0_18px_rgba(255,201,77,.18)]"
                  : "border-border/60 hover:border-amber-hud/40 bg-black/20"
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-bold font-mono text-amber-hud">{f.nombre}</p>
                <motion.span
                  animate={{ rotate: faccion === f.id ? [0, -8, 8, 0] : 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-[9px] font-mono text-muted-foreground"
                >
                  {faccion === f.id ? "ELEGIDA" : `0${i + 1}`}
                </motion.span>
              </div>
              <p className="text-[9px] font-mono uppercase text-muted-foreground mt-0.5">«{f.lema}»</p>
              <p className="text-[10px] font-mono text-emerald-hud mt-1">{f.bono}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {[
          { k: "VICTORIAS", v: record.victorias, c: "#4DFFC4" },
          { k: "PARTIDAS", v: record.partidas, c: "#FFC94D" },
          { k: "MEJOR DOMINIO", v: `${Math.round(record.mejor * 100)}%`, c: "#B18CFF" },
        ].map((x, i) => (
          <motion.div key={x.k} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="hud-panel p-3 text-center">
            <p className="text-lg font-bold font-mono" style={{ color: x.c }}>{x.v}</p>
            <p className="text-[8px] font-mono uppercase text-muted-foreground">{x.k}</p>
          </motion.div>
        ))}
      </div>

      <div className="hud-panel p-4 space-y-2">
        <p className="text-[10px] font-mono uppercase tracking-widest text-amber-hud flex items-center gap-1.5">
          <Scroll className="w-3.5 h-3.5" /> las tres maneras de ganar
        </p>
        <ul className="space-y-1.5 text-[11px] text-muted-foreground leading-snug">
          <li><span className="text-amber-hud font-mono">01</span> · Ser el <b className="text-foreground">último imperio en pie</b> cuando los demás caigan.</li>
          <li><span className="text-amber-hud font-mono">02</span> · Controlar el <b className="text-foreground">75% del terreno</b> del continente.</li>
          <li><span className="text-amber-hud font-mono">03</span> · Al apagarse el reloj de <b className="text-foreground">15 minutos</b>, el mayor territorio gana.</li>
        </ul>
        <p className="text-[10px] text-muted-foreground leading-snug pt-1">
          Las ciudades expanden tu frontera; los mercados cunden oro; los laboratorios lo convierten en ciencia;
          los cuarteles reclutan y apoyan asaltos; las fortalezas defienden la zona; los puertos abren el mar y los
          cañones bombardean a distancia — golpeando a AMBOS bandos. En cada asalto eliges qué porcentaje de tu
          reserva envías; los frentes activos pueden MANTENER el asedio o CONTRAATACAR con reservas frescas.
        </p>
      </div>

      <motion.button
        onClick={onFundar}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="w-full py-4 bg-amber-hud text-black font-bold font-mono text-sm tracking-widest hover:shadow-[0_0_28px_rgba(255,201,77,.4)] transition-shadow flex items-center justify-center gap-2"
      >
        <Crown className="w-4 h-4" /> FUNDAR IMPERIO
      </motion.button>
    </div>
  );
}

// ---------- récord local ----------

const REC_KEY = "vg-imperio-v91";
interface RecordImperio { victorias: number; partidas: number; mejor: number }

function leerRecord(): RecordImperio {
  if (typeof window === "undefined") return { victorias: 0, partidas: 0, mejor: 0 };
  try {
    const raw = JSON.parse(localStorage.getItem(REC_KEY) ?? "");
    if (raw && typeof raw === "object") return { victorias: raw.victorias | 0, partidas: raw.partidas | 0, mejor: Number(raw.mejor) || 0 };
  } catch { /* primera vez */ }
  return { victorias: 0, partidas: 0, mejor: 0 };
}

function guardarRecord(e: EstadoJuego, setRecord: (r: RecordImperio) => void) {
  const r = leerRecord();
  r.partidas += 1;
  if (e.terminado?.victoria) r.victorias += 1;
  r.mejor = Math.max(r.mejor, porcentajeMundo(e, "jugador"));
  try { localStorage.setItem(REC_KEY, JSON.stringify(r)); } catch { /* privado */ }
  setRecord(r);
}

// ---------- chips de recursos ----------

function Chip({ icono, etiqueta, valor, color, sub }: { icono: React.ReactNode; etiqueta: string; valor: string; color: string; sub?: string }) {
  return (
    <motion.div layout className="hud-panel px-2.5 py-1.5 flex items-center gap-2 min-w-0">
      <span style={{ color }}>{icono}</span>
      <div className="min-w-0">
        <p className="text-[8px] font-mono uppercase text-muted-foreground leading-none">{etiqueta}</p>
        <motion.p key={valor} initial={{ scale: 1.12 }} animate={{ scale: 1 }} className="text-[13px] font-bold font-mono leading-tight" style={{ color }}>
          {valor}{sub && <span className="text-[8px] text-muted-foreground font-normal"> {sub}</span>}
        </motion.p>
      </div>
    </motion.div>
  );
}

// ---------- panel principal ----------

export function ImperioPanel() {
  const [fase, setFase] = useState<"fundar" | "juego">("fundar");
  const [faccion, setFaccion] = useState("legion");
  const [record, setRecord] = useState<RecordImperio>(() => leerRecord());

  const juegoRef = useRef<EstadoJuego | null>(null);
  const [ver, setVer] = useState(0);
  const [pausa, setPausa] = useState(false);
  const [vel, setVel] = useState(1);
  const pausaRef = useRef(false);
  const velRef = useRef(1);
  const recordadoRef = useRef(false);
  const [overlayCerrado, setOverlayCerrado] = useState(false);

  useEffect(() => { pausaRef.current = pausa; }, [pausa]);
  useEffect(() => { velRef.current = vel; }, [vel]);

  // interacción
  const [modo, setModo] = useState<"ordenes" | "atacar" | "mover" | "cañon">("ordenes");
  const [sel, setSel] = useState<number | null>(null);
  const [cañonSel, setCañonSel] = useState<number | null>(null);
  const [pct, setPct] = useState(50);
  const [error, setError] = useState<string | null>(null);
  const errRef = useRef<number | null>(null);
  const mostrarError = (m: string) => {
    setError(m);
    if (errRef.current) window.clearTimeout(errRef.current);
    errRef.current = window.setTimeout(() => setError(null), 2600);
  };

  // cámara
  const [vb, setVb] = useState({ x: 0, y: 0, w: MAPA_W, h: MAPA_H });
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<{ px: number; py: number; vx: number; vy: number; movio: boolean } | null>(null);

  // bucle maestro: 1 latido por segundo, multiplicado por la velocidad
  useEffect(() => {
    const t = setInterval(() => {
      const e = juegoRef.current;
      if (!e) return;
      if (e.terminado) {
        if (!recordadoRef.current) {
          recordadoRef.current = true;
          guardarRecord(e, setRecord);
        }
        return;
      }
      if (pausaRef.current) return;
      for (let i = 0; i < velRef.current; i++) tickJuego(e);
      setVer((v) => v + 1);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // zoom con rueda (no pasivo para frenar el scroll de la página)
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (ev: WheelEvent) => {
      ev.preventDefault();
      setVb((v) => {
        const f = ev.deltaY > 0 ? 1.12 : 0.89;
        const w = Math.max(MAPA_W * 0.32, Math.min(MAPA_W * 1.35, v.w * f));
        const h = w * (MAPA_H / MAPA_W);
        const cx = v.x + v.w / 2;
        const cy = v.y + v.h / 2;
        return { x: cx - w / 2, y: cy - h / 2, w, h };
      });
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, [fase]);

  const e = juegoRef.current;
  const jugador = e?.imperios.find((i) => i.esJugador) ?? null;

  // objetivos válidos en modo atacar (mapa celda -> naval)
  const objetivos = useMemo(() => {
    const m = new Map<number, boolean>();
    if (!e || !jugador || modo !== "atacar") return m;
    for (const c of e.celdas) {
      const r = puedeAtacarDesde(e, jugador, c);
      if (r.ok) m.set(c.id, r.naval);
    }
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [e, ver, modo, jugador]);

  // alcance del cañón
  const rangoCañon = useMemo(() => {
    const s = new Set<number>();
    if (!e || modo !== "cañon" || cañonSel === null) return s;
    const k = e.celdas[cañonSel];
    if (!k) return s;
    for (const c of e.celdas) {
      if (c.tipo === "mar") continue;
      const dx = c.col - k.col;
      const dy = c.row - k.row;
      const d = Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dx + dy));
      if (d <= 6) s.add(c.id);
    }
    return s;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [e, ver, modo, cañonSel]);

  function fundar() {
    juegoRef.current = crearJuego((Date.now() & 0x7fffffff) >>> 0, faccion);
    recordadoRef.current = false;
    setOverlayCerrado(false);
    setFase("juego");
    setSel(null);
    setModo("ordenes");
    setCañonSel(null);
    setPausa(false);
    setVel(1);
    setVb({ x: 0, y: 0, w: MAPA_W, h: MAPA_H });
  }

  function alClick(c: Celda) {
    if (dragRef.current?.movio) return;
    const st = juegoRef.current;
    const jug = st?.imperios.find((i) => i.esJugador);
    if (!st || !jug || st.terminado) return;
    if (modo === "atacar") {
      const r = puedeAtacarDesde(st, jug, c);
      if (!r.ok) {
        mostrarError(c.tipo === "mar" ? "El mar no se ocupa: se cruza desde un puerto" : "Fuera de alcance: pega a tu frontera o desembarca desde un puerto");
        return;
      }
      const err = lanzarAtaque(st, jug, c, pct, r.naval);
      if (err) mostrarError(err);
      setVer((v) => v + 1);
      return;
    }
    if (modo === "mover") {
      if (sel === null || !st.celdas[sel] || st.celdas[sel].dueño !== jug.id) {
        if (c.dueño !== jug.id || c.capital === jug.id) {
          mostrarError("Primero elige una celda tuya (la capital no mueve tropas)");
          return;
        }
        setSel(c.id);
        mostrarError("Origen fijado: ahora elige a dónde reforzar");
        return;
      }
      const err = reforzar(st, jug, sel, c.id);
      if (err) mostrarError(err);
      else {
        setSel(null);
        setModo("ordenes");
      }
      setVer((v) => v + 1);
      return;
    }
    if (modo === "cañon") {
      if (cañonSel === null) {
        mostrarError("Selecciona uno de tus cañones");
        return;
      }
      const err = dispararCañon(st, jug, cañonSel, c.id);
      if (err) mostrarError(err);
      setVer((v) => v + 1);
      return;
    }
    setSel(c.id);
  }

  // ---------- pantallas ----------

  if (fase === "fundar" || !e || !jugador) {
    return (
      <div className="space-y-4">
        <Fundar faccion={faccion} setFaccion={setFaccion} onFundar={fundar} record={record} />
      </div>
    );
  }

  const celdaSel = sel !== null ? e.celdas[sel] : null;
  const misFrentes = e.frentes.filter((f) => f.atacante === jugador.id);
  const tierra = tierraTotal(e);
  const cuota = porcentajeMundo(e, jugador.id);
  const ranking = [...e.imperios].sort((a, b) => porcentajeMundo(e, b.id) - porcentajeMundo(e, a.id));
  const miCañon = e.celdas.find((c) => c.dueño === jugador.id && c.edificio === "cañon");
  const capR = capReserva(e, jugador);
  const capV = capVivienda(e, jugador);

  const entrarLayout = (dx: number, dy: number) => {
    setVb((v) => {
      const f = dx < 0 ? 0.9 : 1.1;
      const w = Math.max(MAPA_W * 0.32, Math.min(MAPA_W * 1.35, v.w * f));
      const h = w * (MAPA_H / MAPA_W);
      return { x: v.x + (v.w - w) / 2, y: v.y + (v.h - h) / 2, w, h };
    });
  };

  return (
    <div className="space-y-3">
      <PanelHeader
        title="IMPERIO · AUGE Y CAÍDA"
        subtitle={`${tierra} celdas de tierra · 8 imperios · el reloj manda`}
        icon={<Crown className="w-4 h-4 text-amber-hud" />}
        color="amber"
        right={
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPausa((p) => !p)} className="px-2 py-1 border border-amber-hud/50 text-amber-hud bg-amber-hud/10 font-mono text-[9px] flex items-center gap-1">
              {pausa ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />} {pausa ? "REANUDAR" : "PAUSA"}
            </button>
            {[1, 2, 4].map((v) => (
              <button key={v} onClick={() => setVel(v)} className={cn("px-1.5 py-1 border font-mono text-[9px]", vel === v ? "border-amber-hud bg-amber-hud text-black" : "border-border/60 text-muted-foreground")}>
                ×{v}
              </button>
            ))}
            <button onClick={() => { setFase("fundar"); juegoRef.current = null; }} className="px-2 py-1 border border-red-hud/50 text-red-hud bg-red-hud/10 font-mono text-[9px]">
              ABANDONAR
            </button>
          </div>
        }
      />

      {/* HUD de recursos */}
      <div className="flex flex-wrap items-stretch gap-1.5">
        <Chip icono={<Landmark className="w-3.5 h-3.5" />} etiqueta="oro" valor={Math.floor(jugador.oro).toString()} color="#FFC94D" />
        <Chip icono={<FlaskConical className="w-3.5 h-3.5" />} etiqueta="ciencia" valor={Math.floor(jugador.ciencia).toString()} color="#B18CFF" />
        <Chip icono={<Users className="w-3.5 h-3.5" />} etiqueta="civiles" valor={Math.floor(jugador.civiles).toString()} color="#4DFFC4" sub={`/${capV}`} />
        <Chip icono={<Swords className="w-3.5 h-3.5" />} etiqueta="reserva" valor={Math.floor(jugador.reserva).toString()} color="#FF5A5A" sub={`/${capR}`} />
        <Chip icono={<Target className="w-3.5 h-3.5" />} etiqueta="terreno" valor={`${(cuota * 100).toFixed(1)}%`} color={cuota >= META_DOMINIO ? "#4DFFC4" : "#FFC94D"} sub="meta 75%" />
        <Chip icono={<Timer className="w-3.5 h-3.5" />} etiqueta="reloj" valor={mmss(e.reloj)} color={e.reloj < 120 ? "#FF5A5A" : "#4DD8FF"} />
        <Chip icono={<Crown className="w-3.5 h-3.5" />} etiqueta="facción" valor={FACciones[jugador.faccion].nombre} color="#FF9A4D" />
      </div>

      {/* barra de meta 75% */}
      <div className="hud-panel px-3 py-2">
        <div className="h-2.5 bg-border/50 relative overflow-hidden">
          <motion.div animate={{ width: `${Math.min(100, cuota * 100)}%` }} transition={{ type: "spring", stiffness: 55 }} className="h-full v91-barra" style={{ background: "linear-gradient(90deg,#8a6a1e,#FFC94D)" }} />
          <span className="absolute top-0 bottom-0 w-0.5 bg-emerald-hud" style={{ left: `${META_DOMINIO * 100}%` }} />
        </div>
        <div className="flex justify-between text-[8px] font-mono uppercase text-muted-foreground mt-1">
          <span>tu bandera: {(cuota * 100).toFixed(1)}% del terreno</span>
          <span className="text-emerald-hud">meta 75% → victoria por dominio</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-3">
        {/* MAPA */}
        <div className="space-y-2 min-w-0">
          <div className="hud-panel overflow-hidden relative">
            <svg
              ref={svgRef}
              viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
              className="w-full touch-none"
              style={{ height: "clamp(320px, 52vh, 560px)", cursor: modo === "atacar" ? "crosshair" : modo === "cañon" ? "crosshair" : "grab", background: "#060A12" }}
              onPointerDown={(ev) => {
                dragRef.current = { px: ev.clientX, py: ev.clientY, vx: vb.x, vy: vb.y, movio: false };
              }}
              onPointerMove={(ev) => {
                const d = dragRef.current;
                if (!d || !svgRef.current) return;
                const rect = svgRef.current.getBoundingClientRect();
                const dx = ((ev.clientX - d.px) * vb.w) / rect.width;
                const dy = ((ev.clientY - d.py) * vb.h) / rect.height;
                if (Math.abs(ev.clientX - d.px) + Math.abs(ev.clientY - d.py) > 6) d.movio = true;
                if (d.movio) setVb((v) => ({ ...v, x: d.vx - dx, y: d.vy - dy }));
              }}
              onPointerUp={() => { setTimeout(() => { if (dragRef.current) dragRef.current.movio = false; }, 0); }}
              onPointerLeave={() => { dragRef.current = null; }}
            >
              {e.celdas.map((c) => {
                const destacada = sel === c.id || objetivos.has(c.id) || rangoCañon.has(c.id);
                const tenue = modo === "atacar" && !objetivos.has(c.id) && c.tipo !== "mar";
                return (
                  <CeldaSvg key={c.id} c={c} e={e} ver={ver} resaltada={destacada} tenue={tenue} alClick={alClick} />
                );
              })}
            </svg>

            {/* controles de cámara */}
            <div className="absolute top-2 right-2 flex flex-col gap-1">
              <button onClick={() => entrarLayout(-1, 0)} className="hud-panel p-1.5 hover:border-amber-hud/50"><Plus className="w-3.5 h-3.5 text-amber-hud" /></button>
              <button onClick={() => entrarLayout(1, 0)} className="hud-panel p-1.5 hover:border-amber-hud/50"><Minus className="w-3.5 h-3.5 text-amber-hud" /></button>
              <button onClick={() => setVb({ x: 0, y: 0, w: MAPA_W, h: MAPA_H })} className="hud-panel p-1.5 hover:border-amber-hud/50"><RotateCcw className="w-3.5 h-3.5 text-amber-hud" /></button>
            </div>

            {/* leyenda */}
            <div className="absolute bottom-2 left-2 flex flex-wrap gap-1.5 text-[8px] font-mono uppercase pointer-events-none">
              <span className="px-1.5 py-0.5 bg-black/60 border border-border/60 text-muted-foreground">arrastra = mover · rueda = zoom</span>
              {modo === "atacar" && <span className="px-1.5 py-0.5 bg-amber-hud/20 border border-amber-hud/60 text-amber-hud">marcadas: alcanzables · con anillo punteado = frente vivo</span>}
              {modo === "cañon" && <span className="px-1.5 py-0.5 bg-red-hud/20 border border-red-hud/60 text-red-hud">radio del cañón: golpea a ambos bandos</span>}
            </div>
          </div>

          {/* BARRA DE ÓRDENES */}
          <div className="hud-panel p-2.5 space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {([
                { k: "ordenes", n: "ÓRDENES", i: <MapIcon className="w-3 h-3" />, c: "#FFC94D" },
                { k: "atacar", n: `ATACAR ${pct}%`, i: <Swords className="w-3 h-3" />, c: "#FF5A5A" },
                { k: "mover", n: "REFORZAR", i: <Move className="w-3 h-3" />, c: "#4DD8FF" },
                { k: "cañon", n: miCañon ? "CAÑÓN" : "CAÑÓN (falta)", i: <Target className="w-3 h-3" />, c: "#FF9A4D" },
              ] as const).map((b) => (
                <button
                  key={b.k}
                  onClick={() => {
                    if (b.k === "cañon" && !miCañon) {
                      mostrarError("Necesitas construir un CAÑÓN (80 oro) para bombardear");
                      return;
                    }
                    if (b.k === "cañon") setCañonSel(miCañon ? miCañon.id : null);
                    setModo(b.k);
                    setSel(null);
                  }}
                  className={cn(
                    "px-2.5 py-1.5 border font-mono text-[10px] flex items-center gap-1.5 transition-all",
                    modo === b.k ? "text-black font-bold" : "text-muted-foreground hover:text-foreground",
                    modo === b.k ? "" : "border-border/60 bg-black/20"
                  )}
                  style={modo === b.k ? { background: b.c, borderColor: b.c } : undefined}
                >
                  {b.i} {b.n}
                  {b.k === "atacar" && misFrentes.length > 0 && (
                    <span className="text-[8px] px-1 border border-current">{misFrentes.length} frente{misFrentes.length > 1 ? "s" : ""}</span>
                  )}
                </button>
              ))}
              <button
                onClick={() => {
                  const err = reclutar(e, jugador);
                  if (err) mostrarError(err);
                  setVer((v) => v + 1);
                }}
                className="px-2.5 py-1.5 border font-mono text-[10px] flex items-center gap-1.5 border-emerald-hud/60 text-emerald-hud bg-emerald-hud/10 hover:bg-emerald-hud/20 transition-all"
              >
                <Users className="w-3 h-3" /> RECLUTAR (civiles → reserva)
              </button>
              {modo === "atacar" && (
                <div className="flex items-center gap-2 flex-1 min-w-[180px] pl-2">
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={pct}
                    onChange={(ev) => setPct(Number(ev.target.value))}
                    className="flex-1 accent-[#FFC94D]"
                  />
                  <span className="text-[11px] font-mono font-bold text-amber-hud w-10 text-right">{pct}%</span>
                </div>
              )}
            </div>
            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[10px] font-mono text-red-hud">
                  ⚠ {error}
                </motion.p>
              )}
            </AnimatePresence>
            <p className="text-[9px] font-mono text-muted-foreground leading-snug">
              {modo === "atacar" && "Toca una celda marcada para lanzar el asalto con ese porcentaje de tu reserva. Los frentes se pelean solos cada segundo: MANTENER aprieta el asedio, CONTRAATACAR vuelca reservas frescas."}
              {modo === "mover" && "Elige una celda tuya de origen y luego el destino: el 60% de la guarnición marcha allí. La capital no mueve sus tropas."}
              {modo === "cañon" && "Toca cualquier celda dentro del radio: el obús arrasa guarnición Y tropas comprometidas — amigo o enemigo. Cuesta 100 de oro y recarga 30 s."}
              {modo === "ordenes" && "Toca una celda para inspeccionarla y construir. En ATACAR marcas el porcentaje de reserva; en REFORZAR mueves guarniciones; en CAÑÓN abres fuego."}
            </p>
          </div>

          {/* CELDA SELECCIONADA + CONSTRUCCIÓN */}
          {celdaSel && (
            <div className="hud-panel p-3 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <p className="text-[10px] font-mono uppercase tracking-widest text-amber-hud flex items-center gap-1.5">
                  <MapIcon className="w-3.5 h-3.5" /> celda ({celdaSel.col},{celdaSel.row}) · {celdaSel.tipo}
                </p>
                <p className="text-[9px] font-mono text-muted-foreground">
                  {celdaSel.dueño
                    ? `bandera: ${e.imperios.find((i) => i.id === celdaSel.dueño)?.nombre ?? "?"} · guarnición ${Math.ceil(celdaSel.guarnicion)}`
                    : `neutral · resistencia ${celdaSel.guarnicion}`}
                  {celdaSel.costera && " · costa"}
                  {celdaSel.capital && " · CAPITAL"}
                </p>
              </div>
              {celdaSel.dueño === jugador.id && (
                <div>
                  <p className="text-[9px] font-mono uppercase text-muted-foreground mb-1 flex items-center gap-1"><Hammer className="w-3 h-3" /> construir aquí (un edificio por celda)</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
                    {(Object.keys(COSTES) as TipoEdificio[]).map((t) => {
                      const bloqueado = (t === "puerto" && !celdaSel.costera) || (t === "ciudad" && celdaSel.capital === jugador.id);
                      const caro = jugador.oro < COSTES[t];
                      return (
                        <button
                          key={t}
                          disabled={bloqueado || caro || !!celdaSel.edificio}
                          onClick={() => {
                            const err = construir(e, jugador, celdaSel.id, t);
                            if (err) mostrarError(err);
                            setVer((v) => v + 1);
                          }}
                          className={cn(
                            "p-2 border text-left transition-all",
                            bloqueado || caro || celdaSel.edificio
                              ? "border-border/40 opacity-40 cursor-not-allowed"
                              : "border-amber-hud/50 hover:bg-amber-hud/10"
                          )}
                        >
                          <p className="text-[10px] font-bold font-mono text-amber-hud flex justify-between">
                            {t.toUpperCase()} <span className="text-muted-foreground font-normal">{COSTES[t]}</span>
                          </p>
                          <p className="text-[8px] text-muted-foreground leading-tight mt-0.5">{EFECTOS[t]}</p>
                        </button>
                      );
                    })}
                  </div>
                  {celdaSel.edificio && (
                    <p className="text-[9px] font-mono text-emerald-hud mt-1">
                      Aquí se alza: {celdaSel.edificio.toUpperCase()} — {EFECTOS[celdaSel.edificio]}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="space-y-2 min-w-0">
          {/* FRENTES ACTIVOS */}
          <div className="hud-panel p-3 space-y-2">
            <p className="text-[10px] font-mono uppercase tracking-widest text-amber-hud flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5" /> frentes activos · {misFrentes.length}/4
            </p>
            {misFrentes.length === 0 ? (
              <p className="text-[9px] font-mono text-muted-foreground leading-snug">
                Sin frentes. Ve a ATACAR, marca el porcentaje de reserva y toca una celda alcanzable — el asalto nace aquí con su insignia pulsante.
              </p>
            ) : (
              misFrentes.map((f) => {
                const c = e.celdas[f.objetivo];
                return (
                  <motion.div key={f.id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="border border-red-hud/40 bg-red-hud/5 p-2 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-amber-hud font-bold">→ ({c?.col},{c?.row}) {f.naval && <span className="text-cyan-300">· NAVAL</span>}</span>
                      <span className={cn("font-bold", f.modo === "avanzar" ? "text-red-hud" : "text-amber-hud")}>
                        {Math.ceil(f.tropas)} tropas · {f.modo === "avanzar" ? "AVANZANDO" : "ASEDIO"}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { const err = cambiarModoFrente(e, jugador, f.id, "mantener"); if (err) mostrarError(err); setVer((v) => v + 1); }} className={cn("flex-1 py-1 text-[9px] font-mono border", f.modo === "mantener" ? "border-amber-hud bg-amber-hud/20 text-amber-hud" : "border-border/60 text-muted-foreground")}>
                        MANTENER
                      </button>
                      <button onClick={() => { const err = cambiarModoFrente(e, jugador, f.id, "avanzar"); if (err) mostrarError(err); setVer((v) => v + 1); }} className={cn("flex-1 py-1 text-[9px] font-mono border", f.modo === "avanzar" ? "border-red-hud bg-red-hud/20 text-red-hud" : "border-border/60 text-muted-foreground")}>
                        AVANZAR
                      </button>
                      <button onClick={() => { const err = cambiarModoFrente(e, jugador, f.id, "contraatacar"); if (err) mostrarError(err); setVer((v) => v + 1); }} className="flex-1 py-1 text-[9px] font-mono border border-emerald-hud/60 text-emerald-hud hover:bg-emerald-hud/10">
                        CONTRAATACAR
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* INVESTIGACIÓN */}
          <div className="hud-panel p-3 space-y-2">
            <p className="text-[10px] font-mono uppercase tracking-widest text-violet-300 flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5" /> investigación · {Math.floor(jugador.ciencia)} ciencia
            </p>
            {jugador.investigacion && (
              <div className="border border-violet-400/50 bg-violet-400/10 p-2">
                <p className="text-[10px] font-mono text-violet-300 font-bold">
                  EN CURSO: {INVESTIGACIONES.find((i) => i.id === jugador.investigacion!.id)?.nombre} · {jugador.investigacion.restante}s
                </p>
                <div className="h-1.5 bg-black/40 mt-1">
                  <motion.div className="h-full bg-violet-400" animate={{ width: `${100 - (jugador.investigacion.restante / (INVESTIGACIONES.find((i) => i.id === jugador.investigacion!.id)?.segundos ?? 1)) * 100}%` }} />
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 gap-1">
              {INVESTIGACIONES.map((inv) => {
                const hecha = jugador.completadas.includes(inv.id);
                const enCurso = jugador.investigacion?.id === inv.id;
                const puede = !hecha && !enCurso && !jugador.investigacion && jugador.ciencia >= inv.costo;
                return (
                  <button
                    key={inv.id}
                    disabled={!puede}
                    onClick={() => { const err = lanzarInvestigacion(e, jugador, inv.id); if (err) mostrarError(err); setVer((v) => v + 1); }}
                    className={cn(
                      "p-2 border text-left transition-all",
                      hecha ? "border-emerald-hud/60 bg-emerald-hud/10" : puede ? "border-violet-400/60 hover:bg-violet-400/10" : "border-border/40 opacity-50"
                    )}
                  >
                    <p className="text-[10px] font-mono font-bold flex justify-between">
                      <span className={hecha ? "text-emerald-hud" : "text-violet-300"}>{inv.nombre}{hecha && " ✓"}</span>
                      <span className="text-muted-foreground font-normal">{inv.costo} c.</span>
                    </p>
                    <p className="text-[8px] text-muted-foreground leading-tight">{inv.desc} · {inv.segundos}s</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RANKING DE IMPERIOS */}
          <div className="hud-panel p-3 space-y-1.5">
            <p className="text-[10px] font-mono uppercase tracking-widest text-amber-hud flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> los ocho tronos
            </p>
            {ranking.map((imp) => {
              const pctImp = porcentajeMundo(e, imp.id);
              const tropas = imp.reserva + e.celdas.filter((c) => c.dueño === imp.id).reduce((a, c) => a + Math.max(0, c.guarnicion), 0);
              return (
                <div key={imp.id} className={cn("flex items-center gap-2 text-[10px] font-mono", !imp.viva && "opacity-40")}>
                  <span className="w-2.5 h-2.5 shrink-0" style={{ background: imp.color }} />
                  <span className={cn("flex-1 truncate", imp.esJugador && "text-amber-hud font-bold")}>
                    {imp.esJugador ? "TU IMPERIO" : imp.nombre}
                    {!imp.viva && <span className="text-red-hud"> · CAÍDO</span>}
                  </span>
                  <span className="text-muted-foreground w-12 text-right">{(pctImp * 100).toFixed(1)}%</span>
                  <span className="text-muted-foreground w-10 text-right">{Math.round(tropas)}</span>
                </div>
              );
            })}
          </div>

          {/* CRÓNICA */}
          <div className="hud-panel p-3">
            <p className="text-[10px] font-mono uppercase tracking-widest text-amber-hud flex items-center gap-1.5 mb-2">
              <Scroll className="w-3.5 h-3.5" /> crónica del continente
            </p>
            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              {e.cronicas.map((l) => (
                <motion.p key={l.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="text-[9.5px] font-mono leading-snug flex gap-1.5">
                  <span className="text-muted-foreground shrink-0">{mmss(l.t)}</span>
                  <span style={{ color: l.color }}>{l.texto}</span>
                </motion.p>
              ))}
            </div>
          </div>

          <p className="text-[8px] font-mono text-muted-foreground text-center uppercase pb-2">
            continente ficticio del mundo vanguard · simulador educativo de auge y caída
          </p>
        </div>
      </div>

      {/* OVERLAY FINAL */}
      <AnimatePresence>
        {e.terminado && !overlayCerrado && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setOverlayCerrado(true)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 120 }}
              onClick={(ev) => ev.stopPropagation()}
              className="hud-panel max-w-md w-full p-6 text-center space-y-3"
              style={{ borderColor: e.terminado.victoria ? "#4DFFC4" : "#FF5A5A" }}
            >
              <motion.div animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.12, 1] }} transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1.4 }}>
                <Crown className={cn("w-12 h-12 mx-auto", e.terminado.victoria ? "text-emerald-hud" : "text-red-hud")} />
              </motion.div>
              <p className="text-xl font-bold font-mono tracking-widest" style={{ color: e.terminado.victoria ? "#4DFFC4" : "#FF5A5A" }}>
                {e.terminado.victoria ? "EL TRONO ES TUYO" : "EL IMPERIO HA CAÍDO"}
              </p>
              <p className="text-[11px] text-muted-foreground leading-snug">{e.terminado.motivo}</p>
              <p className="text-[10px] font-mono text-amber-hud uppercase">
                vencedor: {e.terminado.ganador} · tu dominio final: {(cuota * 100).toFixed(1)}%
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button onClick={() => { setFase("fundar"); juegoRef.current = null; }} className="py-2.5 bg-amber-hud text-black font-bold font-mono text-[11px] tracking-wider">
                  OTRA CAMPAÑA
                </button>
                <button onClick={() => setOverlayCerrado(true)} className="py-2.5 border border-border/60 text-muted-foreground font-mono text-[11px]">
                  MIRAR EL FINAL
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


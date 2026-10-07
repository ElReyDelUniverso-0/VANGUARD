"use client";

// v86.0 CENTINELA GLOBAL — SISTEMA DE ALERTA TEMPRANA (tab: centinela)
// El Early Warning System del portal definitivo: un índice de riesgo por
// región del planeta, calculado con la tensión viva de Vanguard + factores
// deterministas del día (movimientos de tropas, actividad diplomática, pico
// de propaganda estatal, flujo de refugiados, ciberactividad). Una aguja que
// no duerme, una lista de qué vigilar, y la historia de la tensión.

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Binoculars, Gauge, Radar, ShieldAlert } from "lucide-react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { getTension } from "@/lib/tension";
import { cn } from "@/lib/utils";

// ---------- determinismo ----------
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function rngDe(semilla: number) {
  let a = semilla >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- regiones y drivers ----------
interface Region {
  id: string;
  nombre: string;
  base: number; // riesgo base estructural 0-100
  nota: string;
}

const REGIONES: Region[] = [
  { id: "europa-este", nombre: "Europa del Este", base: 78, nota: "Guerra de posición + raids de drones diarios" },
  { id: "medio-oriente", nombre: "Medio Oriente", base: 82, nota: "Multi-frente: Gaza, Líbano, Mar Rojo, Irán" },
  { id: "indo-pacifico", nombre: "Indo-Pacífico", base: 64, nota: "Cruces de la medianera y bloqueos de cortesía" },
  { id: "sahel", nombre: "África · Sahel y Cuerno", base: 71, nota: "Golpes, mercenarios y hambrunas silenciosas" },
  { id: "caucaso", nombre: "Cáucaso", base: 55, nota: "Corredor de Zangezur y heridas de 2020" },
  { id: "latam", nombre: "Latinoamérica", base: 38, nota: "Crimen organizado transnacional y crisis bolivarianas" },
  { id: "artico", nombre: "Ártico", base: 42, nota: "Militarización del polo y rutas de gas" },
  { id: "ciber", nombre: "Ciberespacio", base: 68, nota: "Cables cortados, GPS jammado y ransomware estatal" },
];

const DRIVERS = [
  { id: "tropas", nombre: "Movimientos de tropas" },
  { id: "diplomacia", nombre: "Actividad diplomática" },
  { id: "propaganda", nombre: "Pico de propaganda estatal" },
  { id: "refugiados", nombre: "Flujo de refugiados" },
  { id: "ciber", nombre: "Ciberactividad hostil" },
] as const;

interface DriverOut { valor: number; trend: 1 | 0 | -1; }
interface RegionOut {
  r: Region;
  indice: number;
  nivel: "BAJO" | "VIGILANCIA" | "ELEVADO" | "CRÍTICO";
  color: string;
  drivers: DriverOut[];
  razon: string;
}

const RAZONES = [
  "acumulación de artillería reportada por 2 fuentes satelitales",
  "cumbre de emergencia convocada sin orden del día",
  "test de mensaje a la población civil emitido por radio",
  "3 cables submarinos con latencia anómala en 72h",
  "movimiento de hospitales de campaña hacia la retaguardia",
  "contratos de seguros navales duplicados esta semana",
  "vuelos de reabastecimiento aéreo sin plan de vuelo público",
  "reservas estratégicas de crudo movidas fuera de las bases",
];

function nivelDe(i: number): { nivel: RegionOut["nivel"]; color: string } {
  if (i >= 78) return { nivel: "CRÍTICO", color: "#FF4655" };
  if (i >= 58) return { nivel: "ELEVADO", color: "#FFB020" };
  if (i >= 38) return { nivel: "VIGILANCIA", color: "#38BDF8" };
  return { nivel: "BAJO", color: "#00FF87" };
}

function calcularRegiones(tension: number): RegionOut[] {
  const dia = Math.floor(Date.now() / 86_400_000);
  return REGIONES.map((r) => {
    const h = hash(`${r.id}:${dia}`);
    const rnd = rngDe(h);
    const drivers: DriverOut[] = DRIVERS.map((d) => {
      const v = Math.min(100, Math.max(5, Math.round(rnd() * 55 + r.base * 0.35 + (tension - 55) * (d.id === "ciber" ? 0.5 : 0.25))));
      const tr = rnd();
      return { valor: v, trend: tr < 0.42 ? 1 : tr < 0.72 ? 0 : -1 };
    });
    const mediaDrivers = drivers.reduce((s, d) => s + d.valor, 0) / drivers.length;
    const indice = Math.min(98, Math.round(r.base * 0.52 + mediaDrivers * 0.4 + (tension - 55) * 0.28));
    const { nivel, color } = nivelDe(indice);
    const razon = RAZONES[h % RAZONES.length];
    return { r, indice, nivel, color, drivers, razon };
  }).sort((a, b) => b.indice - a.indice);
}

// ---------- historial de tensión (24 muestras, 1 cada 3 min) ----------
const HIST_KEY = "vanguard-centinela-hist-v86";
function pushHistorial(t: number): number[] {
  try {
    const raw = JSON.parse(localStorage.getItem(HIST_KEY) ?? "[]") as number[];
    const ahora = Date.now();
    const last = Number(localStorage.getItem(HIST_KEY + ":ts") ?? 0);
    if (ahora - last > 180_000) {
      raw.push(t);
      localStorage.setItem(HIST_KEY + ":ts", String(ahora));
    }
    const recortado = raw.slice(-24);
    localStorage.setItem(HIST_KEY, JSON.stringify(recortado));
    return recortado.length >= 2 ? recortado : [t, t];
  } catch {
    return [t, t];
  }
}

// ---------- AGUJA (gauge semicircular) ----------
function Aguja({ valor, tam = 220 }: { valor: number; tam?: number }) {
  const ang = -90 + (Math.min(100, Math.max(0, valor)) / 100) * 180;
  const R = 86;
  const cx = 100;
  const cy = 100;
  const nx = cx + R * Math.cos(((ang - 90) * Math.PI) / 180);
  const ny = cy + R * Math.sin(((ang - 90) * Math.PI) / 180);
  const arcoDe = (desde: number, hasta: number, color: string) => {
    const a1 = -90 + desde * 1.8 - 90;
    const a2 = -90 + hasta * 1.8 - 90;
    const x1 = cx + R * Math.cos((a1 * Math.PI) / 180);
    const y1 = cy + R * Math.sin((a1 * Math.PI) / 180);
    const x2 = cx + R * Math.cos((a2 * Math.PI) / 180);
    const y2 = cy + R * Math.sin((a2 * Math.PI) / 180);
    return <path key={`${desde}`} d={`M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`} fill="none" stroke={color} strokeWidth="9" strokeLinecap="butt" opacity="0.85" />;
  };
  return (
    <svg viewBox="0 0 200 118" style={{ width: tam, maxWidth: "100%" }} role="img" aria-label={`Índice global: ${Math.round(valor)} de 100`}>
      {arcoDe(0, 37, "#00FF87")}
      {arcoDe(38, 57, "#38BDF8")}
      {arcoDe(58, 77, "#FFB020")}
      {arcoDe(78, 100, "#FF4655")}
      {/* ticks */}
      {[0, 25, 50, 75, 100].map((t) => {
        const a = -90 + t * 1.8 - 90;
        const x1 = cx + (R - 13) * Math.cos((a * Math.PI) / 180);
        const y1 = cy + (R - 13) * Math.sin((a * Math.PI) / 180);
        const x2 = cx + (R - 19) * Math.cos((a * Math.PI) / 180);
        const y2 = cy + (R - 19) * Math.sin((a * Math.PI) / 180);
        return <line key={t} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" />;
      })}
      {/* aguja */}
      <motion.g
        initial={{ rotate: -90 }}
        animate={{ rotate: 0 }}
        transition={{ duration: 0 }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      >
        <motion.line
          x1={cx} y1={cy} x2={nx} y2={ny}
          stroke="#ffb020" strokeWidth="3" strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 6px rgba(255,176,32,0.8))" }}
          initial={false}
          animate={{ x2: nx, y2: ny }}
          transition={{ type: "spring", stiffness: 60, damping: 14 }}
        />
      </motion.g>
      <circle cx={cx} cy={cy} r="6.5" fill="#0d0304" stroke="#ffb020" strokeWidth="2" />
      <text x={cx} y={cy - 26} textAnchor="middle" fill="#ffb020" fontSize="21" fontFamily="monospace" fontWeight="bold" style={{ filter: "drop-shadow(0 0 8px rgba(255,176,32,0.6))" }}>
        {Math.round(valor)}
      </text>
      <text x={cx} y={cy - 13} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="6.5" fontFamily="monospace" letterSpacing="2">ÍNDICE DEL MUNDO</text>
    </svg>
  );
}

// ---------- vigilancia 24h ----------
const VIGILANCIA = [
  "Cierre de airspace militar sobre el Báltico sin NOTAM público",
  "Sesión urgente del Consejo de Seguridad antes del cierre del día",
  "Nuevo paquete de sanciones con votos dudosos",
  "Prueba de misil programada con ventana de 48h",
  "Cable submarino #4 con latencia anómala (tercera vez este mes)",
];

export function CentinelaPanel() {
  const [tension, setTension] = useState(62);
  const [hist, setHist] = useState<number[]>([62, 62]);
  const [reloj, setReloj] = useState(0);
  const vivoRef = useRef(true);

  useEffect(() => {
    vivoRef.current = true;
    const t = getTension();
    setTension(t);
    setHist(pushHistorial(t));
    const iv = setInterval(() => {
      if (!vivoRef.current) return;
      const v = getTension();
      setTension(v);
      setHist(pushHistorial(v));
    }, 30_000);
    const iv2 = setInterval(() => setReloj((r) => r + 1), 1000);
    return () => { vivoRef.current = false; clearInterval(iv); clearInterval(iv2); };
  }, []);

  const regiones = useMemo(() => calcularRegiones(tension), [tension]);
  const criticos = regiones.filter((r) => r.nivel === "CRÍTICO").length;
  const elevados = regiones.filter((r) => r.nivel === "ELEVADO").length;

  // ventana de riesgo: próxima "hora crítica" determinista
  const proximaVentana = useMemo(() => {
    const h = hash(`ventana:${Math.floor(Date.now() / 3600_000)}`);
    const minutos = 8 + (h % 52);
    const mm = String(minutos % 60).padStart(2, "0");
    const hh = String(Math.floor(minutos / 60)).padStart(2, "0");
    return `+${hh}:${mm}h`;
  }, [reloj < 60 ? 0 : 1]); // refresca cada minuto
  void proximaVentana;

  const vigia = useMemo(() => {
    const dia = Math.floor(Date.now() / 86_400_000);
    const h = hash(`vigia:${dia}`);
    return [0, 1, 2, 3, 4].map((i) => VIGILANCIA[(h + i * 3) % VIGILANCIA.length]);
  }, [Math.floor(reloj / 300)]);

  // sparkline del historial
  const spark = useMemo(() => {
    if (hist.length < 2) return "";
    const min = Math.min(...hist) - 4;
    const max = Math.max(...hist) + 4;
    return hist.map((v, i) => {
      const x = (i / (hist.length - 1)) * 240;
      const y = 34 - ((v - min) / (max - min)) * 30;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ");
  }, [hist]);

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Centinela · Alerta Temprana"
        subtitle="El índice de riesgo del planeta, antes de que sea titular"
        icon={<Radar className="w-4 h-4 text-amber" />}
        color="amber"
        right={
          <span className="flex items-center gap-1.5 text-[9px] font-mono uppercase px-2 py-1 border border-amber-hud/60 text-amber bg-amber-hud/10">
            <span className="beacon w-1.5 h-1.5 rounded-full bg-amber" style={{ color: "#FFB020" }} />
            ESCUCHANDO
          </span>
        }
      />

      {/* DOCTRINA */}
      <div className="hud-panel p-4">
        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-amber mb-1">Doctrina del centinela</p>
        <p className="text-[12.5px] text-muted-foreground leading-relaxed max-w-3xl">
          La guerra casi nunca estalla sin avisar: primero se mueven las tropas, se enfría la diplomacia,
          sube la propaganda y tiembla el espectro. El Centinela cruza esas señales con la tensión viva de
          Vanguard y devuelve un índice por región — para que leas el mundo <b className="text-foreground">antes</b> de que sea noticia.
        </p>
      </div>

      {/* AGUJA GLOBAL + resumen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="hud-panel p-4 flex flex-col items-center justify-center">
          <Aguja valor={tension} tam={230} />
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-2">
            {tension >= 80 ? "Zona de crisis — protocolo vivo" : tension >= 58 ? "Zona elevada — vigía despierto" : "Planeta contenido"}
          </p>
        </div>
        <div className="lg:col-span-2 grid grid-cols-2 gap-3 content-start">
          <div className="hud-panel p-3.5">
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5 text-red-hud" /> Regiones críticas</p>
            <p className="font-display text-3xl font-black text-red-hud tabular-nums">{criticos}</p>
            <p className="text-[10px] font-mono text-muted-foreground mt-1">{elevados} más en nivel ELEVADO</p>
          </div>
          <div className="hud-panel p-3.5">
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1.5"><Gauge className="w-3.5 h-3.5 text-amber" /> Próxima ventana de riesgo</p>
            <p className="font-display text-3xl font-black text-amber tabular-nums">{proximaVentana}</p>
            <p className="text-[10px] font-mono text-muted-foreground mt-1">estimación del turno vigente</p>
          </div>
          <div className="col-span-2 hud-panel p-3.5">
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-cyan-hud" /> Tensión global · últimas horas</p>
            {hist.length >= 2 ? (
              <svg viewBox="0 0 240 38" className="w-full h-10" role="img" aria-label="Historia de tensión">
                <path d={spark} fill="none" stroke="#38BDF8" strokeWidth="1.8" style={{ filter: "drop-shadow(0 0 4px rgba(56,189,248,0.6))" }} />
              </svg>
            ) : (
              <p className="text-[10px] font-mono text-muted-foreground">Calibrando la pluma del sismógrafo…</p>
            )}
          </div>
        </div>
      </div>

      {/* REGIONES */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-3" aria-label="Índice por región">
        {regiones.map(({ r, indice, nivel, color, drivers, razon }) => (
          <article key={r.id} className="hud-panel p-3.5 relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-[3px]" style={{ background: color, boxShadow: `0 0 12px ${color}` }} aria-hidden />
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-[13px] font-bold text-foreground">{r.nombre}</h3>
                <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{r.nota}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono text-2xl font-black tabular-nums" style={{ color }}>{indice}</p>
                <p className="font-mono text-[8px] uppercase tracking-widest px-1.5 py-0.5 border rounded-sm inline-block" style={{ color, borderColor: `${color}55`, background: `${color}14` }}>{nivel}</p>
              </div>
            </div>
            {/* drivers */}
            <div className="mt-2.5 space-y-1.5">
              {drivers.map((d, i) => (
                <div key={DRIVERS[i].id} className="flex items-center gap-2">
                  <span className="font-mono text-[8.5px] uppercase tracking-wide text-muted-foreground w-[152px] shrink-0 truncate">{DRIVERS[i].nombre}</span>
                  <div className="flex-1 h-1 bg-black/50 border border-white/10 rounded-sm overflow-hidden">
                    <div className="h-full rounded-sm transition-all duration-700" style={{ width: `${d.valor}%`, background: d.trend === 1 ? "#FF4655" : d.trend === -1 ? "#00FF87" : "#FFB020", boxShadow: "none" }} />
                  </div>
                  <span className="shrink-0 w-4 text-right">
                    {d.trend === 1 ? <ArrowUpRight className="w-3 h-3 text-red-hud" /> : d.trend === -1 ? <ArrowDownRight className="w-3 h-3 text-green-hud" /> : <ArrowRight className="w-3 h-3 text-amber" />}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[10px] font-mono leading-relaxed text-foreground/70 border-l-2 pl-2" style={{ borderColor: `${color}66` }}>
              Señal del día: {razon}
            </p>
          </article>
        ))}
      </section>

      {/* VIGILANCIA 24H */}
      <section className="hud-panel p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2.5 flex items-center gap-1.5">
          <Binoculars className="w-3.5 h-3.5 text-amber" /> Qué vigilar las próximas 24 horas
        </p>
        <ul className="space-y-1.5">
          {vigia.map((v, i) => (
            <li key={i} className={cn("flex items-start gap-2 text-[11.5px] text-foreground/85 leading-relaxed", i === 0 && "holo-flicker")}>
              <span className="font-mono text-amber shrink-0 mt-0.5">▸</span>
              {v}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
          La lista rota cada día a las 00:00 UTC — cuando cambia el mundo, cambia el vigía
        </p>
      </section>
    </div>
  );
}

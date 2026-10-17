"use client";

// ============================================================
// v117.0 ATMÓSFERA — LA CIUDAD QUE RESPIRA
// Sobre la MEGALÓPOLIS v116 (regiones diarias + ciclo real), el
// nuevo mandato: "el clima del planeta tiñe la ciudad; sombras
// por hora; que el cambio de región se SIENTA; que la ciudad
// suene; y que la comunidad pueda bautizar sus regiones".
//   · CLIMA REAL — la ruta /api/meteo alimenta la ciudad: lluvia
//     que cae, nieve, niebla que se arrastra, tormenta con
//     relámpagos, nubes cubiertas. Sin datos: despejado (la
//     casa no se queja, la ciudad sigue en pie).
//   · TERMINADOR POR HORA — cada edificio recibe la LUZ del lado
//     que mira al sol y sombra en el contrario, siguiendo la
//     posición real del sol en TU reloj (alba este, ocaso oeste).
//   · CROSSFADE DE REGIÓN — cuando la ciudad cambia de región,
//     la antigua se desvanece sobre la nueva durante 2.4 s (y
//     con el evento vanguard:rotar-region se puede girar a mano).
//   · VOZ DE LA CIUDAD — botón que arranca el audio ambiente
//     procedural de la casa (ciudad-audio.ts, cero muestras).
//   · BAUTIZO POPULAR — la FORJA puede bautizar regiones
//     (vg-forja-regiones) y la ciudad luce el nombre popular.
//   · Contrato 60 FPS intacto: solo transform/opacity; reduced-
//     motion apaga meteo y fundidos. SSR pinta la noche y el
//     cliente corrige (hidratación sin salto).
// ============================================================

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/lib/game-store";
import { arrancarAmbiente, pararAmbiente, faseAmbiente } from "@/lib/ciudad-audio";

// ---------- REGIONES (cada una con su perfil, acento y mojón) ----------
export interface RegionCiudad {
  id: string;
  nombre: string;
  /** color secundario de la región (se mezcla con el acento del mundo) */
  acc2: string;
  /** silueta de la ciudad: alturas 0..1 (14 lotes) */
  perfil: number[];
  /** mojón (landmark) característico */
  mojon: "aguja" | "letreos" | "domos" | "grua" | "terraza" | "ciudadela";
}

export const REGIONES_CIUDAD: RegionCiudad[] = [
  {
    id: "cromo", nombre: "NÚCLEO CROMO", acc2: "#9FB8D8", mojon: "aguja",
    perfil: [0.52, 0.78, 0.44, 0.92, 0.60, 0.36, 0.84, 0.70, 0.48, 0.95, 0.58, 0.40, 0.76, 0.62],
  },
  {
    id: "neon", nombre: "DISTRITO NEÓN", acc2: "#FF4DD8", mojon: "letreos",
    perfil: [0.34, 0.58, 0.72, 0.50, 0.88, 0.64, 0.42, 0.78, 0.55, 0.68, 0.90, 0.47, 0.61, 0.75],
  },
  {
    id: "solar", nombre: "MESETA SOLAR", acc2: "#FFB84D", mojon: "domos",
    perfil: [0.26, 0.40, 0.30, 0.52, 0.38, 0.62, 0.33, 0.48, 0.28, 0.55, 0.36, 0.44, 0.30, 0.50],
  },
  {
    id: "puerto", nombre: "PUERTO ABIERTO", acc2: "#3DDCFF", mojon: "grua",
    perfil: [0.30, 0.46, 0.38, 0.60, 0.34, 0.72, 0.44, 0.52, 0.66, 0.40, 0.58, 0.35, 0.63, 0.47],
  },
  {
    id: "jardines", nombre: "JARDINES VERTICALES", acc2: "#5EFF9A", mojon: "terraza",
    perfil: [0.44, 0.62, 0.50, 0.74, 0.56, 0.68, 0.48, 0.80, 0.58, 0.52, 0.70, 0.46, 0.64, 0.54],
  },
  {
    id: "ciudadela", nombre: "CIUDADELA VANGUARD", acc2: "#FFC94D", mojon: "ciudadela",
    perfil: [0.40, 0.55, 0.66, 0.50, 0.98, 0.72, 0.58, 0.86, 0.62, 0.48, 0.78, 0.54, 0.68, 0.44],
  },
];

/** día del año 0..365 */
function diaDelAno(d: Date): number {
  const inicio = Date.UTC(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - inicio) / 86_400_000);
}

/** LA REGLA DEL CAMBIO: cada día del año la ciudad amanece en otra región */
export function regionDeCiudad(d: Date = new Date()): RegionCiudad {
  return REGIONES_CIUDAD[diaDelAno(d) % REGIONES_CIUDAD.length];
}

// ---------- BAUTIZO POPULAR (v117): la FORJA nombra las regiones ----------
export interface BautismoRegion { nombre: string; autor: string; t: number; }
const CLAVE_BAUTIZOS = "vg-forja-regiones";

export function leerBautizos(): Record<string, BautismoRegion> {
  try {
    const raw = localStorage.getItem(CLAVE_BAUTIZOS);
    if (!raw) return {};
    const j = JSON.parse(raw) as Record<string, BautismoRegion>;
    return j && typeof j === "object" ? j : {};
  } catch {
    return {};
  }
}

export function bautizarRegion(id: string, nombre: string, autor = "AGENTE"): BautismoRegion {
  const b: BautismoRegion = { nombre: nombre.trim().slice(0, 24).toUpperCase(), autor, t: Date.now() };
  try {
    const todos = leerBautizos();
    todos[id] = b;
    localStorage.setItem(CLAVE_BAUTIZOS, JSON.stringify(todos));
    window.dispatchEvent(new CustomEvent("vanguard:bautismo", { detail: id }));
  } catch {
    /* sin almacenamiento: el bautismo vuela */
  }
  return b;
}

/** v117: la FORJA también puede retirar un bautizo popular */
export function quitarBautismo(id: string): void {
  try {
    const todos = leerBautizos();
    delete todos[id];
    localStorage.setItem(CLAVE_BAUTIZOS, JSON.stringify(todos));
    window.dispatchEvent(new CustomEvent("vanguard:bautismo", { detail: id }));
  } catch {
    /* sin almacenamiento: nada que retirar */
  }
}

// ---------- CLIMA REAL (v117): el METEO del planeta tiñe la ciudad ----------
export type EfectoClima = "despejado" | "nublado" | "lluvia" | "nieve" | "tormenta" | "niebla";

export function efectoDeClima(cond: string): EfectoClima {
  const c = (cond || "").toLowerCase();
  if (c.includes("tormenta")) return "tormenta";
  if (c.includes("nieve") || c.includes("nevad")) return "nieve";
  if (c.includes("lluvia") || c.includes("chubasc") || c.includes("llovizn")) return "lluvia";
  if (c.includes("niebla")) return "niebla";
  if (c.includes("cubierto")) return "nublado";
  return "despejado";
}

// gotas y flocos DETERMINISTAS (cero Math.random en render → hidratación sin salto)
const GOTAS: { x: number; h: number; d: number; delay: number; op: number }[] =
  Array.from({ length: 26 }, (_, i) => ({
    x: (i * 37 + 11) % 100,
    h: 26 + ((i * 13) % 22),
    d: 0.6 + ((i * 7) % 9) / 14,
    delay: ((i * 29) % 17) / 9,
    op: 0.22 + ((i * 5) % 5) / 12,
  }));
const FLOCOS: { x: number; d: number; delay: number; r: number }[] =
  Array.from({ length: 22 }, (_, i) => ({
    x: (i * 43 + 7) % 100,
    d: 6 + ((i * 17) % 8),
    delay: ((i * 31) % 22) / 4,
    r: 2 + (i % 3),
  }));

// ---------- CICLO DÍA/NOCHE EN TIEMPO REAL ----------
export type FaseDia = "noche" | "alba" | "dia" | "ocaso";

export interface EstadoCiclo {
  fase: FaseDia;
  /** 0..1 progreso DENTRO de la fase (para interpolar el cielo) */
  t: number;
  /** ¿es de noche cerrada? (ventanas encendidas, luna, estrellas) */
  noche: boolean;
  /** altura del sol 0..1 (1 = mediodía) — 0 si no hay sol */
  alturaSol: number;
  /** posición horizontal del sol/luna 0..1 */
  x: number;
}

export function faseDeHora(h: number, m: number): EstadoCiclo {
  const hm = h + m / 60;
  if (hm >= 19.5 || hm < 5) {
    // noche: la luna recorre SU arco (19.5→5)
    const tn = hm >= 19.5 ? (hm - 19.5) / 9.5 : (hm + 4.5) / 9.5;
    return { fase: "noche", t: Math.min(1, Math.max(0, tn)), noche: true, alturaSol: 0, x: Math.min(1, Math.max(0, tn)) };
  }
  if (hm < 7.5) {
    const t = (hm - 5) / 2.5;
    return { fase: "alba", t, noche: false, alturaSol: Math.sin(t * Math.PI * 0.5) * 0.45, x: t * 0.22 };
  }
  if (hm < 17.5) {
    const t = (hm - 7.5) / 10;
    return { fase: "dia", t, noche: false, alturaSol: Math.sin(t * Math.PI) * 0.55 + 0.45, x: 0.22 + t * 0.56 };
  }
  const t = (hm - 17.5) / 2;
  return { fase: "ocaso", t, noche: false, alturaSol: Math.max(0, Math.sin(Math.PI * 0.5 * (1 - t)) * 0.45), x: 0.78 + t * 0.22 };
}

// ---------- interpolación de color (hex → rgb → mezcla) ----------
function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mezcla(a: string, b: string, t: number): string {
  const [r1, g1, b1] = rgb(a);
  const [r2, g2, b2] = rgb(b);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${bl})`;
}

export interface PaletaCielo {
  alto: string; medio: string; horizonte: string;
  estrellas: number; ventanas: number; nubes: number; meteoro: boolean;
}

export function paletaCielo(c: EstadoCiclo, acc: string): PaletaCielo {
  const a2 = 0.10; // presencia del acento en el horizonte
  switch (c.fase) {
    case "noche":
      return { alto: "#03030a", medio: "#080814", horizonte: mezcla("#0a0a18", acc.slice(0, 7) === "#" ? acc : "#FFC94D", a2), estrellas: 1, ventanas: 1, nubes: 0.06, meteoro: true };
    case "alba": {
      const t = c.t;
      return {
        alto: mezcla("#03030a", "#141032", t),
        medio: mezcla("#080814", "#3a2050", t),
        horizonte: mezcla(mezcla("#0a0a18", acc, a2), "#ff9a5a", t * 0.9),
        estrellas: 1 - t, ventanas: 1 - t * 0.8, nubes: 0.10 + t * 0.1, meteoro: t < 0.35,
      };
    }
    case "dia": {
      const t = c.t;
      return {
        alto: mezcla("#141032", "#1c3f6e", t),
        medio: mezcla("#3a2050", "#2c5a8c", t),
        horizonte: mezcla("#ff9a5a", "#6aa5c8", t),
        estrellas: 0, ventanas: 0.08, nubes: 0.22, meteoro: false,
      };
    }
    default: { // ocaso
      const t = c.t;
      return {
        alto: mezcla("#1c3f6e", "#060614", t),
        medio: mezcla("#2c5a8c", "#2a1030", t),
        horizonte: mezcla("#6aa5c8", mezcla("#ff6a3a", acc, 0.25), t),
        estrellas: t * 0.9, ventanas: t, nubes: 0.2 - t * 0.14, meteoro: t > 0.6,
      };
    }
  }
}

// ---------- estrellas fijas (deterministas, cero random en render) ----------
const ESTRELLAS_MEGA: [number, number, number][] = [
  [4, 14, 1.4], [9, 30, 1], [15, 8, 1.2], [21, 24, 1], [27, 6, 1.6],
  [33, 32, 1], [39, 18, 1.3], [45, 38, 1], [51, 10, 1.4], [57, 26, 1],
  [63, 6, 1.5], [69, 34, 1], [75, 16, 1.2], [81, 40, 1], [87, 22, 1.5],
  [93, 12, 1], [97, 36, 1.1], [48, 44, 0.9],
  // v123 GLORIA: el cielo ganó población — 16 más, la bóveda ya no es un desierto
  [2, 42, 0.9], [11, 20, 1], [18, 44, 1.1], [24, 12, 0.9], [30, 46, 1],
  [36, 26, 0.8], [43, 2, 1.1], [54, 46, 0.9], [60, 20, 1.1], [66, 44, 0.8],
  [72, 4, 1], [78, 30, 0.9], [84, 8, 1.2], [90, 44, 1], [95, 28, 0.9], [99, 16, 1.1],
];

// v123 GLORIA — LA CIUDAD VIVA: habitantes del cielo y de la calle (deterministas)
const AVES_V123 = [
  { top: "18%", dur: 34, delay: 0, esc: 1 },
  { top: "26%", dur: 42, delay: -14, esc: 0.8 },
  { top: "12%", dur: 50, delay: -27, esc: 1.2 },
];
const FAROLES_V123 = [7, 18, 30, 41, 52, 63, 74, 86]; // % de la calle
const PISOS_V123 = [26, 58]; // rastros de coches (dos direcciones)

// ============================================================
// SKYLINE — las 3 capas de la ciudad de UNA región (extraído para
// el crossfade v117: la región que se va se desvanece encima)
// ============================================================
function SkylineCiudad({ region, pal, acc, ciclo }: { region: RegionCiudad; pal: PaletaCielo; acc: string; ciclo: EstadoCiclo }) {
  const acc2 = region.acc2;
  return (
    <>
      {/* CAPA 1 — silueta lejana (translateZ negativo, tono del cielo) */}
      <div className="absolute inset-x-0 bottom-[16%] flex items-end justify-center gap-[2px] px-3" style={{ height: "34%", transform: "translateZ(-70px) scale(1.04)", opacity: 0.55 }}>
        {region.perfil.map((h, i) => (
          <div key={i} className="relative flex-1 max-w-[30px]" style={{ height: `${h * 72 + 8}%`, background: `linear-gradient(180deg, ${pal.medio}, ${pal.alto})`, borderTop: `1px solid ${acc2}22` }} />
        ))}
      </div>

      {/* CAPA 2 — la ciudad principal de la REGIÓN (ventanas vivas + TERMINADOR) */}
      <div className="absolute inset-x-0 bottom-[10%] flex items-end justify-center gap-[3px] px-2" style={{ height: "52%", transform: "translateZ(-18px)" }}>
        {region.perfil.map((h, i) => {
          const centroLote = (i + 0.5) / region.perfil.length;
          const luzIzq = ciclo.x < centroLote; // el sol pinta la cara que lo mira
          return (
            <div key={i} className="relative flex-1 max-w-[34px] overflow-hidden" style={{
              height: `${h * 100}%`,
              background: `linear-gradient(180deg, ${acc2}${ciclo.noche ? "2E" : "3C"}, rgba(7,7,12,0.96) 72%)`,
              borderTop: `1px solid ${acc2}77`,
              boxShadow: `0 -6px 18px -10px ${acc2}${ciclo.noche ? "88" : "44"}`,
              clipPath: region.mojon === "aguja" && h > 0.8 ? "polygon(46% 0, 54% 0, 100% 7%, 100% 100%, 0 100%, 0 7%)" : undefined,
            }}>
              {/* v117 TERMINADOR POR HORA: luz en el lado del sol, sombra en el opuesto */}
              {!ciclo.noche && ciclo.alturaSol > 0.03 && (
                <>
                  <span className="absolute inset-y-0 pointer-events-none" style={{ ...(luzIzq ? { left: 0 } : { right: 0 }), width: "38%", background: `linear-gradient(${luzIzq ? "90deg" : "270deg"}, ${acc2}59, transparent)`, opacity: Math.min(0.7, ciclo.alturaSol) }} />
                  <span className="absolute inset-y-0 pointer-events-none" style={{ ...(luzIzq ? { right: 0 } : { left: 0 }), width: "28%", background: `linear-gradient(${luzIzq ? "270deg" : "90deg"}, rgba(0,0,0,0.6), transparent)`, opacity: Math.min(0.55, ciclo.alturaSol * 0.85) }} />
                </>
              )}
              {/* techos vivos: domos / terrazas / antenas según la región */}
              {region.mojon === "domos" && h > 0.5 && (
                <span className="absolute left-1/2 -translate-x-1/2 rounded-t-full" style={{ top: -7, width: 14, height: 7, border: `1px solid ${acc2}99`, borderBottom: "none", background: `${acc2}14` }} />
              )}
              {region.mojon === "grua" && h > 0.62 && (
                <span className="absolute" style={{ top: -9, left: "30%", width: 1, height: 10, background: `${acc2}CC` }}>
                  <span style={{ position: "absolute", top: 1, left: 1, width: 12, height: 1, background: `${acc2}88` }} />
                </span>
              )}
              {region.mojon === "terraza" && h > 0.6 && (
                <>
                  <span className="absolute inset-x-1" style={{ top: "22%", height: 1, background: `${acc2}55` }} />
                  <span className="absolute inset-x-2" style={{ top: "48%", height: 1, background: `${acc2}44` }} />
                </>
              )}
              {region.mojon === "letreos" && h > 0.55 && (
                <span className="v110-ventana absolute rounded-[1px]" style={{ top: "14%", left: i % 2 ? 2 : "auto", right: i % 2 ? "auto" : 2, width: 3, height: 8, background: i % 3 ? "#3DDCFF" : "#FF4DD8", boxShadow: `0 0 6px ${i % 3 ? "#3DDCFF" : "#FF4DD8"}`, animationDelay: `${(i % 7) * 0.4}s` }} />
              )}
              {/* v123 DETALLES DE TECHO: antena con baliza en los altos del Núcleo/Ciudadela */}
              {(region.mojon === "aguja" || region.mojon === "ciudadela") && h > 0.7 && (
                <span className="absolute left-1/2 -translate-x-1/2" style={{ top: -8, width: 1, height: 9, background: `${acc2}AA` }}>
                  <span className="v110-latido absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: "#FF3B30", boxShadow: "0 0 6px #FF3B30" }} />
                </span>
              )}
              {/* v123 LUZ DE AVIACIÓN: los tres más altos llevan su baliza roja de vuelo */}
              {h > 0.84 && (
                <span className="v110-latido absolute left-1/2 -translate-x-1/2 rounded-full" style={{ top: -4, width: 3, height: 3, background: "#FF3B30", boxShadow: "0 0 7px 1px #FF3B30" }} />
              )}
              {/* v123 TANQUE DE AGUA en los medianos del Puerto y la Meseta */}
              {(region.mojon === "grua" || region.mojon === "domos") && h > 0.55 && h <= 0.84 && (
                <span className="absolute" style={{ top: -6, left: i % 2 ? "22%" : "auto", right: i % 2 ? "auto" : "22%", width: 5, height: 6, background: `${acc2}33`, borderTop: `2px solid ${acc2}88` }} />
              )}
              {/* ventanas que obedecen a la LUZ real: encendidas de noche */}
              <VentanasMega n={Math.max(3, Math.round(h * 10))} acc={acc2} lit={pal.ventanas} flicker={i % 2 === 0} />
            </div>
          );
        })}
      </div>

      {/* MOJÓN DE LA REGIÓN — el punto de referencia que delata dónde estás */}
      <CapaMojon mojon={region.mojon} acc={acc} acc2={acc2} noche={ciclo.noche} />

      {/* CAPA 3 — primer plano oscuro (profundidad de calle) */}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-center gap-[4px] px-4" style={{ height: "26%", transform: "translateZ(30px)" }}>
        {[0.5, 0.3, 0.62, 0.38, 0.55, 0.34, 0.6, 0.42, 0.5, 0.36, 0.58, 0.44].map((h, i) => (
          <div key={i} className="relative flex-1 max-w-[38px]" style={{
            height: `${h * 100}%`,
            background: "linear-gradient(180deg, rgba(4,4,9,0.97), rgba(2,2,6,0.99))",
            borderTop: `1px solid ${acc}55`,
            boxShadow: `0 -8px 22px -12px ${acc}66`,
          }}>
            <VentanasMega n={Math.max(2, Math.round(h * 8))} acc={acc} lit={pal.ventanas} flicker={i % 3 === 0} tenue />
          </div>
        ))}
      </div>
    </>
  );
}

// ============================================================
// CIUDAD INICIO — el componente público (portada viva del INICIO)
// ============================================================
export function CiudadInicio({ acc = "#FFC94D", className, mostrarChips = true }: { acc?: string; className?: string; mostrarChips?: boolean }) {
  // SSR pinta la noche (22:47) y el cliente corrige con la hora REAL (patrón v111)
  const [ciclo, setCiclo] = useState<EstadoCiclo>(() => faseDeHora(22, 47));
  const [region, setRegion] = useState<RegionCiudad>(() => REGIONES_CIUDAD[2]);
  // v117 CROSSFADE: la región que se va permanece 2.4 s desvaneciéndose
  const [saliente, setSaliente] = useState<RegionCiudad | null>(null);
  const [fundido, setFundido] = useState(false);
  const [popular, setPopular] = useState<string | null>(null);
  const [clima, setClima] = useState<{ cond: string; temp: number | null } | null>(null);
  const [ambienteOn, setAmbienteOn] = useState(false);
  const [montado, setMontado] = useState(false);
  const regionRef = useRef(region);
  const primeroRef = useRef(true);
  const muted = useGameStore((s) => s.muted);
  useEffect(() => setMontado(true), []);

  useEffect(() => {
    const pinta = () => {
      const d = new Date();
      setCiclo(faseDeHora(d.getHours(), d.getMinutes()));
      const r = regionDeCiudad(d);
      if (r.id !== regionRef.current.id) {
        if (!primeroRef.current) {
          setSaliente(regionRef.current);
          setFundido(false);
        }
        regionRef.current = r;
        setRegion(r);
      }
      primeroRef.current = false;
      setPopular(leerBautizos()[r.id]?.nombre ?? null);
    };
    pinta();
    const iv = setInterval(pinta, 30_000); // el cielo respira cada medio minuto
    // v117: giro manual de región con crossfade real (QA + demo + futuras salas)
    const rota = () => {
      const idx = REGIONES_CIUDAD.findIndex((x) => x.id === regionRef.current.id);
      const r = REGIONES_CIUDAD[(idx + 1) % REGIONES_CIUDAD.length];
      setSaliente(regionRef.current);
      setFundido(false);
      regionRef.current = r;
      setRegion(r);
      setPopular(leerBautizos()[r.id]?.nombre ?? null);
    };
    window.addEventListener("vanguard:rotar-region", rota);
    return () => {
      clearInterval(iv);
      window.removeEventListener("vanguard:rotar-region", rota);
    };
  }, []);

  // el bautizo popular puede llegar desde la FORJA en caliente
  useEffect(() => {
    const lee = () => setPopular(leerBautizos()[regionRef.current.id]?.nombre ?? null);
    window.addEventListener("vanguard:bautismo", lee);
    return () => window.removeEventListener("vanguard:bautismo", lee);
  }, []);

  // fundido de salida de la región que se va (2.4 s, opacity puro)
  useEffect(() => {
    if (!saliente) return;
    const raf = requestAnimationFrame(() => setFundido(true));
    const to = setTimeout(() => {
      setSaliente(null);
      setFundido(false);
    }, 2700);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(to);
    };
  }, [saliente]);

  // v117 CLIMA REAL: el METEO del planeta tiñe la ciudad (la ruta cachea 10 min)
  useEffect(() => {
    let viva = true;
    const pide = async () => {
      try {
        const r = await fetch("/api/meteo", { signal: AbortSignal.timeout(9000) });
        const j = await r.json();
        if (!viva || !j?.ok || !Array.isArray(j.zones) || j.zones.length === 0) return;
        const idx = Math.max(0, REGIONES_CIUDAD.findIndex((x) => x.id === regionRef.current.id));
        const z = j.zones[idx % j.zones.length];
        if (z) setClima({ cond: String(z.cond ?? ""), temp: typeof z.temp === "number" ? z.temp : null });
      } catch {
        /* sin datos: la ciudad sigue despejada, la casa no se queja */
      }
    };
    pide();
    const iv = setInterval(pide, 600_000);
    return () => {
      viva = false;
      clearInterval(iv);
    };
  }, []);

  // voz de la ciudad: se apaga sola si la casa está silenciada
  useEffect(() => {
    if (muted && ambienteOn) {
      pararAmbiente();
      setAmbienteOn(false);
    }
  }, [muted, ambienteOn]);
  useEffect(() => () => pararAmbiente(), []);
  useEffect(() => {
    if (ambienteOn) faseAmbiente(ciclo.fase);
  }, [ciclo.fase, ambienteOn]);

  const toggleAmbiente = async () => {
    if (ambienteOn) {
      pararAmbiente();
      setAmbienteOn(false);
      return;
    }
    const ok = await arrancarAmbiente(ciclo.fase);
    setAmbienteOn(ok);
  };

  const pal = useMemo(() => paletaCielo(ciclo, acc), [ciclo, acc]);
  const acc2 = region.acc2;
  const sol = !ciclo.noche;
  const lx = 6 + ciclo.x * 88; // posición horizontal del astro (%)
  const ly = sol ? 78 - ciclo.alturaSol * 66 : 66 - Math.sin(ciclo.x * Math.PI) * 46;
  const efecto: EfectoClima = clima ? efectoDeClima(clima.cond) : "despejado";
  const nubesClima = efecto === "nublado" ? 0.5 : 0;

  const horaTxt = (() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  })();

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)} aria-hidden>
      {/* CIELO REAL: cambia con TU hora — noche, alba, día, ocaso */}
      <div className="absolute inset-0 transition-[background] duration-1000" style={{ background: `linear-gradient(180deg, ${pal.alto} 0%, ${pal.medio} 46%, ${pal.horizonte} 82%, ${acc}26 100%)` }} />

      {/* estrellas titilantes — solo cuando la luz lo permite */}
      {pal.estrellas > 0.02 && ESTRELLAS_MEGA.map(([x, y, r], i) => (
        <span key={i} className="v108-estrella absolute rounded-full bg-white" style={{ left: `${x}%`, top: `${y}%`, width: r, height: r, opacity: pal.estrellas, animationDelay: `${(i % 5) * 0.7}s` }} />
      ))}

      {/* meteoro nocturno — la señal de la casa */}
      {pal.meteoro && <span className="v116-meteoro absolute" style={{ top: "12%", left: "70%" }} />}

      {/* v123 AURORA BOREAL — la bóveda se tiñe de verde y violeta en las noches limpias */}
      {pal.estrellas > 0.5 && efecto === "despejado" && (
        <div className="absolute inset-x-0 top-0 h-[46%] overflow-hidden pointer-events-none" aria-hidden>
          <span className="v123-aurora absolute" style={{ left: "-6%", top: "6%", width: "62%", height: "60%", background: "linear-gradient(100deg, transparent 4%, rgba(94,255,154,0.16) 30%, rgba(61,220,255,0.13) 55%, rgba(138,92,255,0.10) 78%, transparent 96%)", filter: "blur(9px)" }} />
          <span className="v123-aurora absolute" style={{ left: "38%", top: "0%", width: "55%", height: "70%", background: "linear-gradient(84deg, transparent 6%, rgba(255,77,216,0.10) 34%, rgba(61,220,255,0.12) 62%, transparent 92%)", filter: "blur(11px)", animationDelay: "-11s" }} />
        </div>
      )}

      {/* v123 AVES DE DÍA — tres bandadas lejanas cruzando la bóveda */}
      {!ciclo.noche && ciclo.alturaSol > 0.12 && efecto !== "tormenta" && efecto !== "lluvia" && AVES_V123.map((a, i) => (
        <span key={i} className="v123-ave absolute" style={{ top: a.top, animationDuration: `${a.dur}s`, animationDelay: `${a.delay}s`, transform: `scale(${a.esc})` }} aria-hidden />
      ))}

      {/* v123 EL DRON DE LA CASA — de noche patrulla la bóveda con su baliza */}
      {ciclo.noche && (
        <span className="v123-dron absolute" style={{ top: "16%" }} aria-hidden>
          <span className="absolute inset-0 rounded-full" style={{ background: "rgba(10,10,16,0.9)", border: "1px solid rgba(255,201,77,0.4)" }} />
          <span className="v110-latido absolute rounded-full" style={{ top: 1, left: 9, width: 3, height: 3, background: "#FF3B30", boxShadow: "0 0 6px #FF3B30" }} />
        </span>
      )}

      {/* nubes de día — bandas que cruzan (v117: el clima CUBIERTO las espesa) */}
      {(pal.nubes > 0.03 || nubesClima > 0) && (
        <>
          <span className="v116-nube absolute h-[3px] rounded-full" style={{ top: "24%", left: "8%", width: "26%", background: `rgba(255,255,255,${Math.max(pal.nubes, nubesClima) * 0.5})` }} />
          <span className="v116-nube absolute h-[2px] rounded-full" style={{ top: "38%", left: "55%", width: "34%", background: `rgba(255,255,255,${Math.max(pal.nubes, nubesClima) * 0.35})`, animationDelay: "-6s" }} />
          {nubesClima > 0 && (
            <span className="v116-nube absolute h-[4px] rounded-full" style={{ top: "14%", left: "22%", width: "48%", background: `rgba(255,255,255,${nubesClima * 0.4})`, animationDelay: "-3s" }} />
          )}
          {/* v123 CÚMULOS CON CUERPO — dos nubes de tres lóbulos que derivan despacio */}
          {ciclo.alturaSol > 0.05 && (
            <>
              <span className="v116-nube absolute" style={{ top: "20%", left: "12%", width: 58, height: 10, borderRadius: 999, background: `rgba(255,255,255,${0.10 + pal.nubes * 0.3})`, filter: "blur(1px)" }}>
                <span className="absolute rounded-full" style={{ top: -6, left: 10, width: 22, height: 12, background: `rgba(255,255,255,${0.09 + pal.nubes * 0.26})` }} />
                <span className="absolute rounded-full" style={{ top: -4, left: 30, width: 16, height: 9, background: `rgba(255,255,255,${0.08 + pal.nubes * 0.22})` }} />
              </span>
              <span className="v116-nube absolute" style={{ top: "33%", left: "64%", width: 44, height: 8, borderRadius: 999, background: `rgba(255,255,255,${0.08 + pal.nubes * 0.24})`, filter: "blur(1px)", animationDelay: "-9s" }}>
                <span className="absolute rounded-full" style={{ top: -5, left: 8, width: 17, height: 10, background: `rgba(255,255,255,${0.07 + pal.nubes * 0.2})` }} />
              </span>
            </>
          )}
        </>
      )}

      {/* v117 METEO REAL — lluvia, nieve, tormenta o niebla según el planeta */}
      {(efecto === "lluvia" || efecto === "tormenta") && (
        <div className="absolute inset-0 overflow-hidden">
          {GOTAS.map((g, i) => (
            <span key={i} className="v117-gota" style={{ left: `${g.x}%`, height: g.h, opacity: g.op, animationDuration: `${g.d}s`, animationDelay: `-${g.delay}s` }} />
          ))}
          {efecto === "tormenta" && <span className="v117-relampago" />}
        </div>
      )}
      {efecto === "nieve" && (
        <div className="absolute inset-0 overflow-hidden">
          {FLOCOS.map((f, i) => (
            <span key={i} className="v117-floco" style={{ left: `${f.x}%`, width: f.r, height: f.r, opacity: 0.5 + (i % 4) * 0.1, animationDuration: `${f.d}s`, animationDelay: `-${f.delay}s` }} />
          ))}
        </div>
      )}
      {efecto === "niebla" && (
        <div className="absolute inset-0 overflow-hidden">
          <span className="v117-niebla" style={{ bottom: "14%" }} />
          <span className="v117-niebla" style={{ bottom: "32%", animationDelay: "-9s", opacity: 0.7 }} />
        </div>
      )}

      {/* LA CIUDAD EN VOLUMEN — 3 capas que se inclinan con la persona */}
      <div className="absolute inset-0" style={{ perspective: "700px", perspectiveOrigin: "50% 100%" }}>
        <div
          className="absolute inset-0"
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateX(calc(var(--vg-my, 0) * -3deg * var(--vg-3d-i, 0.5))) rotateY(calc(var(--vg-mx, 0) * 4deg * var(--vg-3d-i, 0.5)))",
          }}
        >
          {/* v117 CROSSFADE: la región que seva se desvanece sobre la nueva */}
          {saliente && (
            <div className="absolute inset-0 transition-opacity ease-out" style={{ opacity: fundido ? 0 : 1, transitionDuration: "2400ms" }}>
              <SkylineCiudad region={saliente} pal={pal} acc={acc} ciclo={ciclo} />
            </div>
          )}
          <SkylineCiudad region={region} pal={pal} acc={acc} ciclo={ciclo} />
        </div>
      </div>

      {/* calle: horizonte + reflejo del acento */}
      <div className="absolute inset-x-0 bottom-0 h-[9%]" style={{ background: `linear-gradient(180deg, ${acc}18, rgba(2,2,6,0.98) 70%)`, borderTop: `1px solid ${acc}55` }} />
      <div className="v116-reflejo absolute bottom-[2%] left-[12%] h-[2px] w-[30%]" style={{ background: `linear-gradient(90deg, transparent, ${acc2}AA, transparent)`, opacity: ciclo.noche ? 0.8 : 0.4 }} />

      {/* v123 LA CALLE VIVA — faroles encendidos al anochecer + tránsito perpetuo */}
      <div className="absolute inset-x-0 bottom-0 h-[9%] overflow-hidden pointer-events-none" aria-hidden>
        {FAROLES_V123.map((x, i) => (
          <span key={i} className="absolute rounded-full" style={{ left: `${x}%`, top: 1, width: 3, height: 3, background: "#FFD98A", boxShadow: "0 0 6px 1px rgba(255,217,138,0.8)", opacity: pal.ventanas, transition: "opacity 1.2s" }} />
        ))}
        {PISOS_V123.map((x, i) => (
          <span key={i} className={i === 0 ? "v123-coche-a absolute" : "v123-coche-b absolute"} style={{ bottom: i === 0 ? 4 : 10, background: i === 0
            ? "linear-gradient(90deg, transparent, rgba(255,235,190,0.9), rgba(255,255,255,0.98))"
            : "linear-gradient(270deg, transparent, rgba(255,80,70,0.85), rgba(255,140,120,0.95))", animationDelay: `${i * -13}s` }} />
        ))}
        {/* farola encendida en tiempo real según la luz (la ciudad se ilumina sola) */}
        <span className="absolute inset-x-0 top-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${acc2}44, transparent)`, opacity: pal.ventanas }} />
      </div>

      {/* SOL DE DÍA / LUNA LLENA DE NOCHE — la firma de Vanguard (v123: corona y cráteres) */}
      {sol ? (
        <div className="absolute" style={{ left: `${lx}%`, top: `${ly}%`, transform: "translate(-50%,-50%)" }}>
          <span className="v123-corona absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ width: 58, height: 58, border: "1px solid rgba(255,201,77,0.35)" }} />
          <span className="absolute rounded-full" style={{ width: 26, height: 26, background: "radial-gradient(circle at 40% 36%, #FFF3D0, #FFD97A 58%, #FFB84D)", boxShadow: "0 0 34px 12px rgba(255,201,77,0.30), 0 0 70px 24px rgba(255,201,77,0.12)" }} />
        </div>
      ) : (
        <div className="absolute" style={{ left: `${lx}%`, top: `${ly}%`, transform: "translate(-50%,-50%)" }}>
          <span className="absolute rounded-full" style={{ width: 30, height: 30, background: "radial-gradient(circle at 38% 34%, #FFF7E0, #FFE9B8 52%, #F5D48A)", boxShadow: "0 0 36px 14px rgba(255,233,184,0.20), 0 0 80px 30px rgba(255,233,184,0.10)" }} />
          {/* cráteres de la luna — el astro ahora tiene cara */}
          <span className="absolute rounded-full" style={{ top: 6, left: 7, width: 5, height: 5, background: "rgba(190,160,110,0.35)" }} />
          <span className="absolute rounded-full" style={{ top: 14, left: 17, width: 4, height: 4, background: "rgba(190,160,110,0.3)" }} />
          <span className="absolute rounded-full" style={{ top: 18, left: 6, width: 3, height: 3, background: "rgba(190,160,110,0.28)" }} />
        </div>
      )}

      {/* CHIPS EN VIVO (v117): clima + voz de la ciudad + región (bautizada) + fase */}
      {mostrarChips && (
        <>
          <div className="absolute left-2 bottom-1.5 flex flex-col items-start gap-1">
            {montado && clima && (
              <span className="rounded-full px-2 py-0.5 font-mono text-[8px] tracking-[0.25em] backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.5)", border: `1px solid ${acc2}55`, color: acc2 }}>
                CLIMA · {clima.cond.toUpperCase()}{clima.temp !== null ? ` ${clima.temp}°` : ""}
              </span>
            )}
            <span className="rounded-full px-2 py-0.5 font-mono text-[8px] tracking-[0.25em] backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.5)", border: `1px solid ${acc2}66`, color: acc2 }}>
              REGIÓN · {popular ? `★ ${popular}` : region.nombre}
            </span>
          </div>
          <div className="absolute right-2 bottom-1.5 flex flex-col items-end gap-1">
            {montado && (
              <button
                onClick={() => void toggleAmbiente()}
                title="La voz de la ciudad — tráfico lejano, aire y pitidos en vivo (síntesis de la casa)"
                className="cursor-pointer rounded-full px-2 py-0.5 font-mono text-[8px] tracking-[0.25em] backdrop-blur-sm transition-colors"
                style={{ background: "rgba(0,0,0,0.5)", border: `1px solid ${ambienteOn ? "#5EFF9A88" : `${acc}55`}`, color: ambienteOn ? "#5EFF9A" : acc }}
              >
                {ambienteOn ? "CIUDAD EN VIVO" : "SONIDO DE LA CIUDAD"}
              </button>
            )}
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[8px] tracking-[0.25em] backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.5)", border: `1px solid ${acc}55`, color: acc }}>
              <span className="v110-latido inline-block w-1 h-1 rounded-full" style={{ background: acc }} />
              {ciclo.fase === "noche" ? "NOCHE REAL" : ciclo.fase === "alba" ? "ALBA REAL" : ciclo.fase === "ocaso" ? "OCASO REAL" : "DÍA REAL"} {horaTxt}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

// ---------- ventanas que obedecen a la luz (no al teatro) ----------
function VentanasMega({ n, acc, lit, flicker, tenue }: { n: number; acc: string; lit: number; flicker?: boolean; tenue?: boolean }) {
  if (lit < 0.05) return null;
  // v123 GLORIA: la ciudad ganó paleta — cálido, frío, blanco cálido y el acento
  const tonos = [acc, "#FFD98A", "#FFD98A", "#9BD4FF", "#FFF6E3", acc, "#FFD98A", "#B7F5D8"];
  return (
    <div className="absolute inset-x-1 flex flex-wrap gap-[3px] content-start" style={{ top: "5px", maxHeight: "calc(100% - 8px)" }}>
      {Array.from({ length: n }).map((_, i) => (
        <span
          key={i}
          className={cn("w-[3px] h-[3px] rounded-[0.5px]", flicker && i % 3 === 0 && "v108-ventana")}
          style={{
            background: tonos[i % tonos.length],
            opacity: (i % 5 === 0 ? 0.35 : 0.8) * (tenue ? 0.7 : 1) * Math.min(1, lit + 0.15),
            animationDelay: `${(i % 7) * 0.5}s`,
            boxShadow: i % 4 === 1 && !tenue ? "0 0 3px rgba(255,217,138,0.7)" : undefined,
          }}
        />
      ))}
    </div>
  );
}

// ---------- el MOJÓN de cada región (landmark en primer plano) ----------
function CapaMojon({ mojon, acc, acc2, noche }: { mojon: RegionCiudad["mojon"]; acc: string; acc2: string; noche: boolean }) {
  const luz = noche ? 0.9 : 0.5;
  switch (mojon) {
    case "aguja": // la aguja de comunicaciones del Núcleo Cromo
      return (
        <div className="absolute bottom-[9%] left-[16%]" aria-hidden>
          <span className="block w-[2px] h-14" style={{ background: `linear-gradient(180deg, ${acc2}, ${acc}44)`, boxShadow: `0 0 10px ${acc2}66` }} />
          <span className="v110-latido absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{ background: "#FF3B30", boxShadow: `0 0 8px #FF3B30`, opacity: luz }} />
          {[0, 1, 2].map((i) => (
            <span key={i} className="absolute left-1/2 -translate-x-1/2 rounded-full" style={{ top: 10 + i * 9, width: 5 - i, height: 5 - i, border: `1px solid ${acc2}${i === 0 ? "AA" : "55"}`, background: `${acc2}12` }} />
          ))}
        </div>
      );
    case "domos": // la cúpula solar de la Meseta
      return (
        <div className="absolute bottom-[9%] right-[14%]" aria-hidden>
          <span className="block rounded-t-full" style={{ width: 34, height: 17, border: `1px solid ${acc2}AA`, borderBottom: "none", background: `linear-gradient(180deg, ${acc2}22, transparent)`, boxShadow: `0 0 16px -4px ${acc2}66` }} />
          <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: acc2, boxShadow: `0 0 6px ${acc2}`, opacity: luz }} />
        </div>
      );
    case "grua": // la grúa de contenedores del Puerto
      return (
        <div className="absolute bottom-[9%] left-[24%]" aria-hidden>
          <span className="block w-[2px] h-16" style={{ background: `${acc2}CC` }} />
          <span className="absolute top-0 left-1/2 block w-16 h-[2px]" style={{ background: `${acc2}AA` }} />
          <span className="v116-carga absolute block w-3 h-2" style={{ top: 12, left: "calc(50% + 40px)", border: `1px solid ${acc2}88`, background: `${acc2}22` }} />
        </div>
      );
    case "terraza": // la torre-jardín escalonada
      return (
        <div className="absolute bottom-[9%] right-[20%]" aria-hidden>
          <span className="block" style={{ width: 26, height: 40, background: `linear-gradient(180deg, ${acc2}20, rgba(6,6,10,0.95))`, border: `1px solid ${acc2}66`, borderBottom: "none" }} />
          {[0, 1, 2].map((i) => (
            <span key={i} className="absolute block" style={{ bottom: 12 + i * 10, left: -5 - i * 3, width: 9, height: 5, background: `linear-gradient(180deg, #5EFF9A55, #5EFF9A14)`, border: `1px solid #5EFF9A77` }} />
          ))}
        </div>
      );
    case "letreos": // el portal de letreros del Distrito Neón
      return (
        <div className="absolute bottom-[9%] left-[38%]" aria-hidden>
          <span className="v110-ventana block px-1 rounded-[2px] font-mono text-[7px] font-bold leading-[10px]" style={{ color: "#04040a", background: acc2, boxShadow: `0 0 12px ${acc2}`, letterSpacing: "0.2em" }}>VG</span>
          <span className="block w-[2px] h-6 mx-auto" style={{ background: `${acc}88` }} />
        </div>
      );
    default: // la CIUDADELA: la puerta dorada con el rombo de Vanguard
      return (
        <div className="absolute left-1/2 bottom-[9%] -translate-x-1/2 w-24 sm:w-32 h-[46%]" aria-hidden>
          <div className="absolute inset-x-0 bottom-0 top-0 rounded-t-full border-2" style={{ borderColor: `${acc}AA`, background: `linear-gradient(180deg, ${acc}1E, rgba(8,8,13,0.92) 72%)`, boxShadow: `0 0 34px -6px ${acc}77, inset 0 0 24px -8px ${acc}55` }} />
          <div className="absolute left-1/2 top-[26%] -translate-x-1/2 w-4 h-4 rotate-45" style={{ background: acc, boxShadow: `0 0 16px ${acc}` }} />
        </div>
      );
  }
}

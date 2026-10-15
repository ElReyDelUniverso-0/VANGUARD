"use client";

// ============================================================
// v116.0 MEGALÓPOLIS — LA CIUDAD DEL INICIO CON REGIONES
// Mandato del comandante: "haz la ciudad del inicio que cambie
// a veces de región, edificios 3D, y que cambie de ciclo de día
// a noche a tiempo real".
//   · 6 REGIONES procedurales: la ciudad ROTA de región según el
//     día del año (cada día una región distinta de la casa) —
//     Núcleo Cromo, Distrito Neón, Meseta Solar, Puerto Abierto,
//     Jardines Verticales y la Ciudadela Vanguard.
//   · CICLO REAL: el cielo vive TU hora — noche profunda, alba,
//     día pleno y ocaso interpolados minuto a minuto; sol y luna
//     recorren su arco real, las estrellas y las ventanas obedecen
//     a la luz, no al teatro.
//   · EDIFICIOS 3D: tres capas de profundidad (translateZ) que se
//     inclinan con la persona (consume --vg-mx/--vg-my del Motor,
//     cero re-render) + techos en volumen por región.
//   · Contrato 60 FPS: solo transform/opacity anima; reduced-motion
//     deja la ciudad quieta. SSR pinta la noche y el cliente corrige
//     (hidratación sin salto).
// ============================================================

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

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
];

// ============================================================
// CIUDAD INICIO — el componente público (portada viva del INICIO)
// ============================================================
export function CiudadInicio({ acc = "#FFC94D", className, mostrarChips = true }: { acc?: string; className?: string; mostrarChips?: boolean }) {
  // SSR pinta la noche (22:47) y el cliente corrige con la hora REAL (patrón v111)
  const [ciclo, setCiclo] = useState<EstadoCiclo>(() => faseDeHora(22, 47));
  const [region, setRegion] = useState<RegionCiudad>(() => REGIONES_CIUDAD[2]);
  useEffect(() => {
    const pinta = () => {
      const d = new Date();
      setCiclo(faseDeHora(d.getHours(), d.getMinutes()));
      setRegion(regionDeCiudad(d));
    };
    pinta();
    const iv = setInterval(pinta, 30_000); // el cielo respira cada medio minuto
    return () => clearInterval(iv);
  }, []);

  const pal = useMemo(() => paletaCielo(ciclo, acc), [ciclo, acc]);
  const acc2 = region.acc2;
  const sol = !ciclo.noche;
  const lx = 6 + ciclo.x * 88; // posición horizontal del astro (%)
  const ly = sol ? 78 - ciclo.alturaSol * 66 : 66 - Math.sin(ciclo.x * Math.PI) * 46;

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

      {/* nubes de día — bandas que cruzan */}
      {pal.nubes > 0.03 && (
        <>
          <span className="v116-nube absolute h-[3px] rounded-full" style={{ top: "24%", left: "8%", width: "26%", background: `rgba(255,255,255,${pal.nubes * 0.5})` }} />
          <span className="v116-nube absolute h-[2px] rounded-full" style={{ top: "38%", left: "55%", width: "34%", background: `rgba(255,255,255,${pal.nubes * 0.35})`, animationDelay: "-6s" }} />
        </>
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
          {/* CAPA 1 — silueta lejana (translateZ negativo, tono del cielo) */}
          <div className="absolute inset-x-0 bottom-[16%] flex items-end justify-center gap-[2px] px-3" style={{ height: "34%", transform: "translateZ(-70px) scale(1.04)", opacity: 0.55 }}>
            {region.perfil.map((h, i) => (
              <div key={i} className="relative flex-1 max-w-[30px]" style={{ height: `${h * 72 + 8}%`, background: `linear-gradient(180deg, ${pal.medio}, ${pal.alto})`, borderTop: `1px solid ${acc2}22` }} />
            ))}
          </div>

          {/* CAPA 2 — la ciudad principal de la REGIÓN (con ventanas vivas) */}
          <div className="absolute inset-x-0 bottom-[10%] flex items-end justify-center gap-[3px] px-2" style={{ height: "52%", transform: "translateZ(-18px)" }}>
            {region.perfil.map((h, i) => (
              <div key={i} className="relative flex-1 max-w-[34px]" style={{
                height: `${h * 100}%`,
                background: `linear-gradient(180deg, ${acc2}${ciclo.noche ? "2E" : "3C"}, rgba(7,7,12,0.96) 72%)`,
                borderTop: `1px solid ${acc2}77`,
                boxShadow: `0 -6px 18px -10px ${acc2}${ciclo.noche ? "88" : "44"}`,
                clipPath: region.mojon === "aguja" && h > 0.8 ? "polygon(46% 0, 54% 0, 100% 7%, 100% 100%, 0 100%, 0 7%)" : undefined,
              }}>
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
                {/* ventanas que obedecen a la LUZ real: encendidas de noche */}
                <VentanasMega n={Math.max(3, Math.round(h * 10))} acc={acc2} lit={pal.ventanas} flicker={i % 2 === 0} />
              </div>
            ))}
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
        </div>
      </div>

      {/* calle: horizonte + reflejo del acento */}
      <div className="absolute inset-x-0 bottom-0 h-[9%]" style={{ background: `linear-gradient(180deg, ${acc}18, rgba(2,2,6,0.98) 70%)`, borderTop: `1px solid ${acc}55` }} />
      <div className="v116-reflejo absolute bottom-[2%] left-[12%] h-[2px] w-[30%]" style={{ background: `linear-gradient(90deg, transparent, ${acc2}AA, transparent)`, opacity: ciclo.noche ? 0.8 : 0.4 }} />

      {/* SOL DE DÍA / LUNA LLENA DE NOCHE — la firma de Vanguard */}
      {sol ? (
        <div className="absolute rounded-full" style={{ left: `${lx}%`, top: `${ly}%`, width: 26, height: 26, transform: "translate(-50%,-50%)", background: "radial-gradient(circle at 40% 36%, #FFF3D0, #FFD97A 58%, #FFB84D)", boxShadow: `0 0 34px 12px rgba(255,201,77,0.30), 0 0 70px 24px rgba(255,201,77,0.12)` }} />
      ) : (
        <div className="absolute rounded-full" style={{ left: `${lx}%`, top: `${ly}%`, width: 30, height: 30, transform: "translate(-50%,-50%)", background: "radial-gradient(circle at 38% 34%, #FFF7E0, #FFE9B8 52%, #F5D48A)", boxShadow: `0 0 36px 14px rgba(255,233,184,0.20), 0 0 80px 30px rgba(255,233,184,0.10)` }} />
      )}

      {/* CHIPS EN VIVO: región del día + fase real del cielo */}
      {mostrarChips && (
        <>
          <span className="absolute left-2 bottom-1.5 rounded-full px-2 py-0.5 font-mono text-[8px] tracking-[0.25em] backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.5)", border: `1px solid ${acc2}66`, color: acc2 }}>
            REGIÓN · {region.nombre}
          </span>
          <span className="absolute right-2 bottom-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[8px] tracking-[0.25em] backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.5)", border: `1px solid ${acc}55`, color: acc }}>
            <span className="v110-latido inline-block w-1 h-1 rounded-full" style={{ background: acc }} />
            {ciclo.fase === "noche" ? "NOCHE REAL" : ciclo.fase === "alba" ? "ALBA REAL" : ciclo.fase === "ocaso" ? "OCASO REAL" : "DÍA REAL"} {horaTxt}
          </span>
        </>
      )}
    </div>
  );
}

// ---------- ventanas que obedecen a la luz (no al teatro) ----------
function VentanasMega({ n, acc, lit, flicker, tenue }: { n: number; acc: string; lit: number; flicker?: boolean; tenue?: boolean }) {
  if (lit < 0.05) return null;
  return (
    <div className="absolute inset-x-1 flex flex-wrap gap-[3px] content-start" style={{ top: "5px", maxHeight: "calc(100% - 8px)" }}>
      {Array.from({ length: n }).map((_, i) => (
        <span
          key={i}
          className={cn("w-[3px] h-[3px] rounded-[0.5px]", flicker && i % 3 === 0 && "v108-ventana")}
          style={{
            background: i % 4 === 0 ? acc : "#FFD98A",
            opacity: (i % 5 === 0 ? 0.35 : 0.8) * (tenue ? 0.7 : 1) * Math.min(1, lit + 0.15),
            animationDelay: `${(i % 7) * 0.5}s`,
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

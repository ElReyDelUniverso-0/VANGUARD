"use client";

// ═══════════════════════════════════════════════════════════════════
// v406.0 LA TRAVESÍA — la entrada nueva de VANGUARD.
//
// Mandato del Dueño: «reconstruir la experiencia de entrada… no quiero otro
// dashboard ni otro centro de mando: una entrada interactiva, con
// transiciones, espacios de exploración, continuidad entre actividades y
// acceso contextual a las herramientas existentes… el usuario debe poder
// continuar desde donde lo dejó… y que funcione en móviles».
//
// Qué es: un VIAJE horizontal por espacios a pantalla completa.
//   ① LA LLEGADA — 2 s de umbral (una vez por sesión, se salta con un toque).
//   ② LA BRÚJULA — la primera vez: «¿qué te trae hoy?» (hasta 3 espacios).
//      Esos espacios pasan delante. Se cambia cuando quieras.
//   ③ EL VIAJE — 10 espacios que se deslizan con el dedo (scroll-snap nativo,
//      60 fps, cero librerías): TU HILO · los 8 módulos · LO DESCONOCIDO.
//      Cada espacio trae sus puertas (las salas de siempre), las herramientas
//      que tienen sentido ahí y lo que ya hiciste dentro.
//   ④ LA PUERTA — al abrir una sala, la tarjeta crece hasta llenar la
//      pantalla y la casa te deja dentro (transform/opacity, 420 ms).
//   ⑤ EL HILO — al volver, la Travesía te recibe en el espacio donde
//      estabas y con lo último que hiciste: investigación, simulación y
//      proyecto, más lo que la casa ya guardaba (sala del cuartel, Centinela,
//      favoritos, modo, marca del Vértigo).
//
// Reglas: nada inventado (todo sale de modulos.ts, mapa-salas.ts, modos.ts,
// los cables reales y TU aparato); «reducir movimiento» = sin animaciones;
// teclado ← → y Esc; nada se envía a ningún servidor.
// ═══════════════════════════════════════════════════════════════════
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import {
  CLAVE_ESPACIO,
  borrarRastro,
  guardarBrujula,
  haceCuanto,
  leerBrujula,
  leerJSON,
  leerRastro,
  leerTienda,
  paraContinuar,
  pasosDe,
  salasCuartelVistas,
  type Paso,
  type TipoActividad,
} from "@/lib/travesia/rastro";
import { ESPACIOS, NOMBRE_TIPO, TOTAL_PUERTAS, TOTAL_SALAS, nombreSala, ordenarEspacios, type Espacio } from "@/lib/travesia/espacios";
import { SALAS_MAPA } from "@/lib/vanguard/mapa-salas";
import { MODOS } from "@/lib/modos";
import { BuscadorUniversal } from "@/components/vanguard/buscador-universal";
import "./travesia.css";

export type CableTravesia = { id: string; titulo: string; fecha: string; fuente: string; frente: string | null };

type Fase = "llegada" | "brujula" | "viaje";
type Abriendo = { href: string; titulo: string; img?: string; color: string; x: number; y: number; w: number; h: number; lleno: boolean };
type Extras = {
  centinela: number;
  favoritos: string[];
  modo: (typeof MODOS)[number] | null;
  vertigo: number | null;
  salaCuartel: string | null;
};

const VISTA_SESION = "vg-travesia-sesion";
const BRUJULA_SALTADA = "vg-brujula-saltada";

function calma() {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

function hora(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Santo_Domingo" });
  } catch {
    return "";
  }
}

function leerExtras(): Extras {
  const cent = leerTienda<{ seguidos?: unknown[] }>("vg367-centinela");
  const fav = leerTienda<{ favoritos?: unknown[] }>("vg171-favoritos");
  let modoId: string | null = null;
  try {
    modoId = localStorage.getItem("vg-modo");
  } catch {
    /* sin modo */
  }
  const vert = leerJSON<{ t?: number }>("vg-vertigo-ultimo");
  let sala: string | null = null;
  try {
    sala = localStorage.getItem("vg-cromo-activa-v106");
  } catch {
    /* sin cuartel */
  }
  return {
    centinela: Array.isArray(cent?.seguidos) ? cent!.seguidos!.length : 0,
    favoritos: (Array.isArray(fav?.favoritos) ? fav!.favoritos! : []).filter((k): k is string => typeof k === "string" && !!nombreSala(k)).slice(0, 6),
    modo: MODOS.find((m) => m.id === modoId) ?? null,
    vertigo: typeof vert?.t === "number" ? vert.t : null,
    salaCuartel: sala && sala !== "inicio" && nombreSala(sala) ? sala : null,
  };
}

/** la sala al azar: primero las que aún no abriste */
function salaAlAzar(vistas: string[], evitar?: string) {
  const sin = SALAS_MAPA.filter((s) => !vistas.includes(s.clave) && s.clave !== evitar);
  const pool = sin.length ? sin : SALAS_MAPA.filter((s) => s.clave !== evitar);
  return pool[Math.floor(Math.random() * pool.length)];
}

// ───────── piezas pequeñas

function Emblema({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id="tv-oro" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6e3a1" />
          <stop offset="0.5" stopColor="#e8c56a" />
          <stop offset="1" stopColor="#a8842c" />
        </linearGradient>
      </defs>
      <path d="M32 3 L59 18 L59 46 L32 61 L5 46 L5 18 Z" fill="none" stroke="url(#tv-oro)" strokeWidth="2.5" />
      <path d="M18 20 L32 46 L46 20 L39.5 20 L32 35 L24.5 20 Z" fill="url(#tv-oro)" />
    </svg>
  );
}

function Flecha({ dir = 1 }: { dir?: 1 | -1 }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden style={{ transform: dir < 0 ? "scaleX(-1)" : undefined }}>
      <path d="M8 4 L16 12 L8 20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICONO_TIPO: Record<TipoActividad, ReactNode> = {
  investigacion: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d="M15.5 15.5 L21 21" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  ),
  simulacion: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 1.5 V5.5 M12 18.5 V22.5 M1.5 12 H5.5 M18.5 12 H22.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  proyecto: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M4 5 H10 L12 7.5 H20 V19 H4 Z" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinejoin="round" />
    </svg>
  ),
  exploracion: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M15.5 8.5 L13.5 13.5 L8.5 15.5 L10.5 10.5 Z" fill="currentColor" />
    </svg>
  ),
};

// ═══════════════════════════════════════════════════════════════════

export function Travesia({ cables, total24 }: { cables: CableTravesia[]; total24: number }) {
  const router = useRouter();
  const [listo, setListo] = useState(false);
  const [fase, setFase] = useState<Fase>("viaje");
  const [rastro, setRastro] = useState<Paso[]>([]);
  const [intereses, setIntereses] = useState<string[]>([]);
  const [eligiendo, setEligiendo] = useState<string[]>([]);
  const [extras, setExtras] = useState<Extras>({ centinela: 0, favoritos: [], modo: null, vertigo: null, salaCuartel: null });
  const [activo, setActivo] = useState(0);
  const [abriendo, setAbriendo] = useState<Abriendo | null>(null);
  const [azar, setAzar] = useState<(typeof SALAS_MAPA)[number] | null>(null);
  const pista = useRef<HTMLDivElement | null>(null);
  const fondos = useRef<(HTMLDivElement | null)[]>([]);
  const nav = useRef<HTMLDivElement | null>(null);
  const restaurado = useRef(false);

  const espacios = useMemo(() => ordenarEspacios(intereses), [intereses]);
  // índice 0 = TU HILO · 1..8 = módulos · 9 = LO DESCONOCIDO
  const paradas = useMemo(
    () => [
      { id: "hilo", corto: "Tu hilo", color: "#e8c56a" },
      ...espacios.map((e) => ({ id: e.id, corto: e.nombre.split(" ")[0], color: e.color })),
      { id: "desconocido", corto: "Lo desconocido", color: "#b9c2d0" },
    ],
    [espacios]
  );

  const vistas = useMemo(() => salasCuartelVistas(rastro), [rastro]);
  const puertasVistas = useMemo(() => {
    const rutas = new Set(rastro.map((p) => p.r));
    return ESPACIOS.reduce((t, e) => t + e.puertas.filter((p) => rutas.has(p.href)).length, 0);
  }, [rastro]);
  const continuar = useMemo(() => paraContinuar(rastro), [rastro]);

  // ── arranque: lee el aparato y decide la fase
  useEffect(() => {
    // señal de vida para la cortina/vigía del layout (la Travesía no monta la
    // cabecera de la casa, que es quien la daba): sin ella saldría el socorro
    (window as unknown as { __vgvivo?: boolean }).__vgvivo = true;
    const recargar = () => {
      setRastro(leerRastro());
      setExtras(leerExtras());
      const b = leerBrujula();
      setIntereses(b?.intereses ?? []);
    };
    recargar();
    const b = leerBrujula();
    let vistaSesion = false;
    let saltada = false;
    try {
      vistaSesion = sessionStorage.getItem(VISTA_SESION) === "1";
      saltada = localStorage.getItem(BRUJULA_SALTADA) === "1";
      sessionStorage.setItem(VISTA_SESION, "1");
    } catch {
      /* sin almacenamiento */
    }
    const pideBrujula = !b && !saltada;
    // montaje en cliente: la fase depende del aparato (localStorage/sessionStorage), que el servidor no ve
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (calma()) setFase(pideBrujula ? "brujula" : "viaje");
    else if (!vistaSesion) setFase("llegada");
    else setFase(pideBrujula ? "brujula" : "viaje");
    setListo(true);
    window.addEventListener("vg-rastro", recargar);
    window.addEventListener("storage", recargar);
    // volver con «atrás» desde una sala: la página sale de la bfcache y la puerta abierta se cierra
    const alVolver = (e: PageTransitionEvent) => {
      if (e.persisted) {
        setAbriendo(null);
        recargar();
      }
    };
    window.addEventListener("pageshow", alVolver);
    return () => {
      window.removeEventListener("vg-rastro", recargar);
      window.removeEventListener("storage", recargar);
      window.removeEventListener("pageshow", alVolver);
    };
  }, []);

  const terminarLlegada = useCallback(() => {
    let saltada = false;
    try {
      saltada = localStorage.getItem(BRUJULA_SALTADA) === "1";
    } catch {
      /* */
    }
    setFase(!leerBrujula() && !saltada ? "brujula" : "viaje");
  }, []);

  // la llegada se va sola
  const hayHilo = !!continuar;
  useEffect(() => {
    if (fase !== "llegada") return;
    const t = window.setTimeout(() => terminarLlegada(), hayHilo ? 2300 : 2700);
    return () => window.clearTimeout(t);
  }, [fase, hayHilo, terminarLlegada]);


  // ── ir a una parada
  const ir = useCallback((i: number, suave = true) => {
    const p = pista.current;
    if (!p) return;
    const n = Math.max(0, Math.min(i, p.children.length - 1));
    p.scrollTo({ left: n * p.clientWidth, behavior: suave && !calma() ? "smooth" : "auto" });
  }, []);

  // ── restaurar el espacio donde estabas (o el del #hash)
  useEffect(() => {
    if (!listo || fase !== "viaje" || restaurado.current) return;
    restaurado.current = true;
    let id = window.location.hash.slice(1);
    if (!id) {
      try {
        id = localStorage.getItem(CLAVE_ESPACIO) ?? "";
      } catch {
        /* */
      }
    }
    const i = paradas.findIndex((p) => p.id === id);
    if (i > 0) requestAnimationFrame(() => ir(i, false));
  }, [listo, fase, paradas, ir]);

  // ── el viaje: parallax de fondos + parada activa (sin re-render por frame)
  useEffect(() => {
    const p = pista.current;
    if (!p || fase !== "viaje") return;
    let raf = 0;
    const pintar = () => {
      raf = 0;
      const w = p.clientWidth || 1;
      const x = p.scrollLeft;
      if (!calma()) {
        fondos.current.forEach((f, i) => {
          if (!f) return;
          const d = (x - i * w) / w; // -1..1 alrededor de su parada
          if (Math.abs(d) > 1.2) return;
          f.style.transform = `translate3d(${d * 38}%,0,0) scale(${1.08 + Math.abs(d) * 0.06})`;
          f.style.opacity = String(1 - Math.min(1, Math.abs(d)) * 0.55);
        });
      }
      const i = Math.round(x / w);
      setActivo((a) => (a === i ? a : i));
    };
    const alMover = () => {
      if (!raf) raf = requestAnimationFrame(pintar);
    };
    pintar();
    p.addEventListener("scroll", alMover, { passive: true });
    window.addEventListener("resize", alMover);
    return () => {
      p.removeEventListener("scroll", alMover);
      window.removeEventListener("resize", alMover);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [fase, paradas.length]);

  // ── recordar la parada + #hash compartible + centrar la constelación
  useEffect(() => {
    if (fase !== "viaje" || !restaurado.current) return;
    const id = paradas[activo]?.id;
    if (!id) return;
    try {
      localStorage.setItem(CLAVE_ESPACIO, id);
      window.history.replaceState(null, "", activo === 0 ? window.location.pathname : `#${id}`);
    } catch {
      /* */
    }
    const b = nav.current?.querySelector<HTMLElement>(`[data-i="${activo}"]`);
    const c = nav.current;
    if (b && c) c.scrollTo({ left: b.offsetLeft - c.clientWidth / 2 + b.clientWidth / 2, behavior: calma() ? "auto" : "smooth" });
  }, [activo, fase, paradas]);

  // ── teclado
  useEffect(() => {
    if (fase !== "viaje") return;
    const tecla = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (document.querySelector("[role='dialog'][aria-modal='true']")) return;
      if (e.key === "ArrowRight") ir(activo + 1);
      else if (e.key === "ArrowLeft") ir(activo - 1);
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [fase, activo, ir]);

  // la sala al azar nace en cliente (Math.random no viaja en el HTML del servidor)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (listo && !azar) setAzar(salaAlAzar(vistas));
  }, [listo, azar, vistas]);

  // ── LA PUERTA: la tarjeta crece hasta llenar la pantalla y la casa te deja dentro
  const abrir = useCallback(
    (e: ReactMouseEvent<HTMLElement>, href: string, titulo: string, color: string, img?: string) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      if (calma()) {
        router.push(href);
        return;
      }
      const r = e.currentTarget.getBoundingClientRect();
      setAbriendo({ href, titulo, img, color, x: r.left, y: r.top, w: r.width, h: r.height, lleno: false });
      router.prefetch(href);
      requestAnimationFrame(() => requestAnimationFrame(() => setAbriendo((a) => (a ? { ...a, lleno: true } : a))));
      window.setTimeout(() => router.push(href), 430);
    },
    [router]
  );

  // ── brújula
  const alternar = (id: string) =>
    setEligiendo((l) => (l.includes(id) ? l.filter((x) => x !== id) : l.length >= 3 ? [...l.slice(1), id] : [...l, id]));
  const fijarBrujula = (l: string[]) => {
    if (l.length) guardarBrujula(l);
    else
      try {
        localStorage.setItem(BRUJULA_SALTADA, "1");
      } catch {
        /* */
      }
    setIntereses(l);
    setFase("viaje");
    restaurado.current = true;
    requestAnimationFrame(() => ir(l.length ? 1 : 0, false));
  };
  const abrirBrujula = () => {
    setEligiendo(intereses);
    setFase("brujula");
  };

  // ═════════ render

  const puertaProps = (href: string, titulo: string, color: string, img?: string) => ({
    href,
    onClick: (e: ReactMouseEvent<HTMLAnchorElement>) => abrir(e, href, titulo, color, img),
    onPointerEnter: () => router.prefetch(href),
  });

  return (
    <div className="tv" data-fase={fase} data-listo={listo ? "1" : "0"}>
      {/* ───── ① LA LLEGADA */}
      {fase === "llegada" && (
        <div className="tv-llegada" role="button" tabIndex={0} aria-label="Entrar a la Travesía" onClick={terminarLlegada} onKeyDown={(e) => (e.key === "Enter" || e.key === " " || e.key === "Escape") && terminarLlegada()}>
          <div className="tv-anillos" aria-hidden>
            <i />
            <i />
            <i />
          </div>
          <Emblema className="tv-llegada-emb" />
          {continuar ? (
            <>
              <p className="tv-llegada-l1">De vuelta en la Travesía</p>
              <p className="tv-llegada-l2">
                Lo dejaste en <b>{continuar.ti}</b>
              </p>
            </>
          ) : (
            <>
              <p className="tv-llegada-l1">El mundo no se detiene.</p>
              <p className="tv-llegada-l2">
                <b>Explóralo.</b>
              </p>
            </>
          )}
          <span className="tv-llegada-toca">Toca para entrar</span>
        </div>
      )}

      {/* ───── ② LA BRÚJULA */}
      {fase === "brujula" && (
        <div className="tv-brujula" role="dialog" aria-modal="true" aria-labelledby="tv-brujula-t">
          <div className="tv-brujula-in">
            <p className="tv-volanta">La brújula</p>
            <h2 id="tv-brujula-t">¿Qué te trae al mundo hoy?</h2>
            <p className="tv-brujula-sub">Elige hasta 3. Esos espacios pasan delante en tu Travesía. Lo cambias cuando quieras.</p>
            <div className="tv-brujula-rejilla">
              {ESPACIOS.map((e) => {
                const on = eligiendo.includes(e.id);
                return (
                  <button key={e.id} type="button" className="tv-rumbo" data-on={on ? "1" : "0"} style={{ ["--c" as string]: e.color }} onClick={() => alternar(e.id)} aria-pressed={on}>
                    <img src={e.img} alt="" loading="lazy" decoding="async" />
                    <span className="tv-rumbo-n">{e.nombre}</span>
                    <span className="tv-rumbo-l">{e.lema}</span>
                    {on && <span className="tv-rumbo-orden">{eligiendo.indexOf(e.id) + 1}</span>}
                  </button>
                );
              })}
            </div>
            <div className="tv-brujula-acc">
              <button type="button" className="tv-btn tv-btn-fantasma" onClick={() => fijarBrujula([])}>
                Saltar
              </button>
              <button type="button" className="tv-btn" disabled={!eligiendo.length} onClick={() => fijarBrujula(eligiendo)}>
                {eligiendo.length ? `Empezar con ${eligiendo.length}` : "Elige al menos uno"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───── ③ EL VIAJE */}
      <header className="tv-cab">
        <Link href="/" className="tv-marca" aria-label="VANGUARD — portada">
          <Emblema className="tv-marca-emb" />
          <span>VANGUARD</span>
        </Link>
        <p className="tv-donde" aria-live="polite">
          <span>La Travesía</span>
          <b style={{ color: paradas[activo]?.color }}>{paradas[activo]?.corto}</b>
        </p>
        <div className="tv-cab-der">
          <BuscadorUniversal />
        </div>
      </header>

      <div className="tv-pista" ref={pista} aria-label="Espacios de VANGUARD (desliza)">
        {/* ── 0 · TU HILO */}
        <section className="tv-esp tv-hilo" id="hilo" aria-label="Tu hilo">
          <div className="tv-fondo" ref={(el) => { fondos.current[0] = el; }} aria-hidden>
            <img src="/ilustraciones/planeta.jpg" alt="" decoding="async" />
          </div>
          <div className="tv-velo" aria-hidden />
          <div className="tv-esp-in">
            <p className="tv-num">01 / {String(paradas.length).padStart(2, "0")}</p>
            {continuar ? (
              <>
                <h2 className="tv-verbo">Tu hilo</h2>
                <p className="tv-lema">Todo lo que dejaste a medias, justo donde lo dejaste.</p>
                <Link {...puertaProps(continuar.u, continuar.ti, "#e8c56a")} className="tv-seguir">
                  <span className="tv-seguir-k">
                    {ICONO_TIPO[continuar.k]} {NOMBRE_TIPO[continuar.k].verbo}
                  </span>
                  <span className="tv-seguir-t">{continuar.ti}</span>
                  <span className="tv-seguir-h">{haceCuanto(continuar.t)} · continuar</span>
                  <span className="tv-seguir-ir">
                    <Flecha />
                  </span>
                </Link>
                <div className="tv-carriles">
                  {(["investigacion", "simulacion", "proyecto"] as TipoActividad[]).map((k) => {
                    const lista = pasosDe(rastro, k, 3);
                    return (
                      <div key={k} className="tv-carril">
                        <p className="tv-carril-t">
                          {ICONO_TIPO[k]} {NOMBRE_TIPO[k].titulo}
                        </p>
                        {lista.length ? (
                          lista.map((p) => (
                            <Link key={p.u} {...puertaProps(p.u, p.ti, "#e8c56a")} className="tv-paso">
                              <span>{p.ti}</span>
                              <time>{haceCuanto(p.t)}</time>
                            </Link>
                          ))
                        ) : (
                          <SugerenciaVacia k={k} puertaProps={puertaProps} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <h2 className="tv-verbo" data-largo="1">Empieza aquí</h2>
                <p className="tv-lema">Desliza para recorrer la casa. Cada espacio tiene sus puertas y sus herramientas.</p>
                <div className="tv-arranques">
                  {(espacios.slice(0, 3)).map((e) => (
                    <Link key={e.id} {...puertaProps(e.puertas[0].href, e.puertas[0].label, e.color, e.puertas[0].img)} className="tv-arranque" style={{ ["--c" as string]: e.color }}>
                      <span className="tv-arranque-v">{e.verbo}</span>
                      <span className="tv-arranque-t">{e.puertas[0].label}</span>
                      <span className="tv-arranque-x">{e.puertas[0].txt}</span>
                    </Link>
                  ))}
                </div>
              </>
            )}

            <Lotuyo extras={extras} puertaProps={puertaProps} />

            {cables.length > 0 && (
              <div className="tv-ahora">
                <p className="tv-mini">
                  <span className="tv-punto" /> Ahora en el mundo{total24 ? ` · ${total24} cables en 24 h` : ""}
                </p>
                <Link {...puertaProps(`/lectura/${cables[0].id}`, cables[0].titulo, "#ff4d5e")} className="tv-cable">
                  <time dateTime={cables[0].fecha} suppressHydrationWarning>
                    {hora(cables[0].fecha)}
                  </time>
                  <span>{cables[0].titulo}</span>
                  <em>{cables[0].fuente}</em>
                </Link>
              </div>
            )}

            <div className="tv-progreso">
              <Barra label="Puertas de los módulos" n={puertasVistas} total={TOTAL_PUERTAS} />
              <Barra label="Salas del cuartel" n={vistas.length} total={TOTAL_SALAS} />
            </div>

            <div className="tv-hilo-acc">
              <button type="button" className="tv-btn tv-btn-fantasma" onClick={abrirBrujula}>
                {intereses.length ? "Ajustar la brújula" : "Elegir mi brújula"}
              </button>
              {rastro.length > 0 && (
                <button
                  type="button"
                  className="tv-btn tv-btn-fantasma"
                  onClick={() => {
                    if (window.confirm("¿Borrar tu rastro? Solo vive en este aparato y no se puede recuperar.")) borrarRastro();
                  }}
                >
                  Borrar mi rastro
                </button>
              )}
              <button type="button" className="tv-btn" onClick={() => ir(1)}>
                Empezar la travesía <Flecha />
              </button>
            </div>
            <p className="tv-privado">Tu rastro vive solo en este aparato. No se envía a ningún servidor.</p>
          </div>
        </section>

        {/* ── 1..8 · LOS ESPACIOS */}
        {espacios.map((e, i) => (
          <EspacioVista
            key={e.id}
            e={e}
            i={i + 1}
            total={paradas.length}
            rastro={rastro}
            cables={e.id === "conflictos" ? cables : []}
            total24={total24}
            refFondo={(el) => {
              fondos.current[i + 1] = el;
            }}
            puertaProps={puertaProps}
            siguiente={() => ir(i + 2)}
            siguienteNombre={paradas[i + 2]?.corto}
          />
        ))}

        {/* ── 9 · LO DESCONOCIDO */}
        <section className="tv-esp tv-desc" id="desconocido" aria-label="Lo desconocido">
          <div className="tv-fondo" ref={(el) => { fondos.current[paradas.length - 1] = el; }} aria-hidden>
            <img src="/ilustraciones/epocas.jpg" alt="" loading="lazy" decoding="async" />
          </div>
          <div className="tv-velo" aria-hidden />
          <div className="tv-esp-in">
            <p className="tv-num">
              {String(paradas.length).padStart(2, "0")} / {String(paradas.length).padStart(2, "0")}
            </p>
            <h2 className="tv-verbo" data-largo="1">Lo desconocido</h2>
            <p className="tv-lema">
              La casa tiene {TOTAL_SALAS} salas. Has abierto {vistas.length}. Deja que el azar elija la siguiente.
            </p>
            {azar && (
              <div className="tv-azar">
                <p className="tv-mini">Una sala al azar{vistas.includes(azar.clave) ? "" : " · aún no la abriste"}</p>
                <p className="tv-azar-n">{azar.corto}</p>
                <p className="tv-azar-c">Constelación · {azar.constelacionCorta}</p>
                <div className="tv-azar-acc">
                  <Link {...puertaProps(`/cuartel?sala=${azar.clave}`, azar.corto, "#b9c2d0")} className="tv-btn">
                    Abrir esta sala <Flecha />
                  </Link>
                  <button type="button" className="tv-btn tv-btn-fantasma" onClick={() => setAzar(salaAlAzar(vistas, azar.clave))}>
                    Otra
                  </button>
                </div>
              </div>
            )}
            <p className="tv-sub">Seis maneras de entrar</p>
            <div className="tv-modos">
              {MODOS.map((m) => (
                <Link key={m.id} {...puertaProps(m.ruta, m.nombre, m.hex)} className="tv-modo" style={{ ["--c" as string]: m.hex }} data-tuyo={extras.modo?.id === m.id ? "1" : "0"}>
                  <span className="tv-modo-n">{m.nombre}</span>
                  <span className="tv-modo-l">{m.lema}</span>
                </Link>
              ))}
            </div>
            <div className="tv-herr">
              <Link {...puertaProps("/novedades", "Para ti", "#6ed6ff")} className="tv-herr-b">
                <b>Para ti</b>
                <span>El feed que aprende lo que te gusta.</span>
              </Link>
              <Link {...puertaProps("/modulos", "El mapa de la casa", "#e8c56a")} className="tv-herr-b">
                <b>El mapa de la casa</b>
                <span>Las {TOTAL_SALAS} salas, por constelaciones.</span>
              </Link>
            </div>
            <div className="tv-hilo-acc">
              <button type="button" className="tv-btn tv-btn-fantasma" onClick={() => ir(0)}>
                <Flecha dir={-1} /> Volver a tu hilo
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ───── la constelación: dónde estás y a dónde puedes saltar */}
      <nav className="tv-nav" aria-label="Saltar a un espacio">
        <button type="button" className="tv-nav-f" onClick={() => ir(activo - 1)} disabled={activo === 0} aria-label="Espacio anterior">
          <Flecha dir={-1} />
        </button>
        <div className="tv-nav-lista" ref={nav}>
          {paradas.map((p, i) => (
            <button
              key={p.id}
              type="button"
              data-i={i}
              data-on={i === activo ? "1" : "0"}
              aria-current={i === activo ? "true" : undefined}
              style={{ ["--c" as string]: p.color }}
              onClick={() => ir(i)}
            >
              <i aria-hidden />
              {p.corto}
            </button>
          ))}
        </div>
        <button type="button" className="tv-nav-f" onClick={() => ir(activo + 1)} disabled={activo === paradas.length - 1} aria-label="Espacio siguiente">
          <Flecha />
        </button>
      </nav>

      {/* ───── ④ LA PUERTA que se abre */}
      {abriendo && (
        <div
          className="tv-puerta"
          data-lleno={abriendo.lleno ? "1" : "0"}
          style={
            {
              "--x": `${abriendo.x}px`,
              "--y": `${abriendo.y}px`,
              "--w": `${abriendo.w}px`,
              "--h": `${abriendo.h}px`,
              "--c": abriendo.color,
            } as React.CSSProperties
          }
          aria-hidden
        >
          {abriendo.img && <img src={abriendo.img} alt="" />}
          <div className="tv-puerta-t">
            <span>Entrando</span>
            <b>{abriendo.titulo}</b>
          </div>
        </div>
      )}
    </div>
  );
}

type PuertaProps = (href: string, titulo: string, color: string, img?: string) => {
  href: string;
  onClick: (e: ReactMouseEvent<HTMLAnchorElement>) => void;
  onPointerEnter: () => void;
};

function Barra({ label, n, total }: { label: string; n: number; total: number }) {
  const p = total ? Math.min(100, (n / total) * 100) : 0;
  return (
    <div className="tv-barra">
      <p>
        <span>{label}</span>
        <b>
          {n} / {total}
        </b>
      </p>
      <div>
        <i style={{ width: `${p}%` }} />
      </div>
    </div>
  );
}

function SugerenciaVacia({ k, puertaProps }: { k: TipoActividad; puertaProps: PuertaProps }) {
  const s =
    k === "investigacion"
      ? { href: "/en-vivo", t: "Abre el cable en vivo" }
      : k === "simulacion"
        ? { href: "/escenarios", t: "Prueba un escenario" }
        : { href: "/centinela", t: "Arma tu centinela" };
  return (
    <Link {...puertaProps(s.href, s.t, "#e8c56a")} className="tv-paso tv-paso-vacio">
      <span>Aún nada aquí · {s.t}</span>
      <Flecha />
    </Link>
  );
}

function Lotuyo({ extras, puertaProps }: { extras: Extras; puertaProps: PuertaProps }) {
  const piezas: ReactNode[] = [];
  if (extras.salaCuartel) {
    const n = nombreSala(extras.salaCuartel)!;
    piezas.push(
      <Link key="sala" {...puertaProps(`/cuartel?sala=${extras.salaCuartel}`, n, "#d4af37")} className="tv-tuyo">
        <b>Tu sala del cuartel</b>
        <span>{n}</span>
      </Link>
    );
  }
  if (extras.centinela > 0)
    piezas.push(
      <Link key="cent" {...puertaProps("/centinela", "Mi centinela", "#3ddc97")} className="tv-tuyo">
        <b>Tu centinela</b>
        <span>
          {extras.centinela} {extras.centinela === 1 ? "vigilancia activa" : "vigilancias activas"}
        </span>
      </Link>
    );
  if (extras.vertigo)
    piezas.push(
      <Link key="vert" {...puertaProps("/vertigo", "El Vértigo", "#ffc94d")} className="tv-tuyo">
        <b>Tu marca en el Vértigo</b>
        <span>{haceCuanto(extras.vertigo)} · sigue deslizando</span>
      </Link>
    );
  if (extras.modo)
    piezas.push(
      <Link key="modo" {...puertaProps(extras.modo.ruta, extras.modo.nombre, extras.modo.hex)} className="tv-tuyo">
        <b>Tu modo</b>
        <span>{extras.modo.nombre}</span>
      </Link>
    );
  for (const k of extras.favoritos) {
    const n = nombreSala(k)!;
    piezas.push(
      <Link key={`fav-${k}`} {...puertaProps(`/cuartel?sala=${k}`, n, "#e8c56a")} className="tv-tuyo">
        <b>★ Favorita</b>
        <span>{n}</span>
      </Link>
    );
  }
  if (!piezas.length) return null;
  return (
    <div className="tv-lotuyo">
      <p className="tv-mini">Lo tuyo en la casa</p>
      <div className="tv-lotuyo-l">{piezas}</div>
    </div>
  );
}

function EspacioVista({
  e,
  i,
  total,
  rastro,
  cables,
  total24,
  refFondo,
  puertaProps,
  siguiente,
  siguienteNombre,
}: {
  e: Espacio;
  i: number;
  total: number;
  rastro: Paso[];
  cables: CableTravesia[];
  total24: number;
  refFondo: (el: HTMLDivElement | null) => void;
  puertaProps: PuertaProps;
  siguiente: () => void;
  siguienteNombre?: string;
}) {
  const aqui = rastro.filter((p) => p.e === e.id).sort((a, b) => b.t - a.t);
  const ultimo = aqui[0];
  const visita = new Map(aqui.map((p) => [p.r, p.t]));
  const abiertas = e.puertas.filter((p) => visita.has(p.href)).length;
  return (
    <section className="tv-esp" id={e.id} aria-label={e.nombre} style={{ ["--c" as string]: e.color }}>
      <div className="tv-fondo" ref={refFondo} aria-hidden>
        <img src={e.img} alt="" loading="lazy" decoding="async" />
      </div>
      <div className="tv-velo" aria-hidden />
      <div className="tv-esp-in">
        <p className="tv-num">
          {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} · {e.nombre}
        </p>
        <h2 className="tv-verbo" data-largo={e.verbo.length > 8 ? "1" : "0"}>{e.verbo}</h2>
        <p className="tv-lema">{e.lema}</p>
        <p className="tv-gancho">{e.gancho}</p>

        {ultimo && (
          <Link {...puertaProps(ultimo.u, ultimo.ti, e.color)} className="tv-seguir tv-seguir-mini">
            <span className="tv-seguir-k">Continuar aquí</span>
            <span className="tv-seguir-t">{ultimo.ti}</span>
            <span className="tv-seguir-h">{haceCuanto(ultimo.t)}</span>
            <span className="tv-seguir-ir">
              <Flecha />
            </span>
          </Link>
        )}

        {cables.length > 0 && (
          <div className="tv-cables">
            <p className="tv-mini">
              <span className="tv-punto" /> Cables reales{total24 ? ` · ${total24} en 24 h` : ""}
            </p>
            {cables.slice(0, 3).map((c) => (
              <Link key={c.id} {...puertaProps(`/lectura/${c.id}`, c.titulo, e.color)} className="tv-cable">
                <time dateTime={c.fecha} suppressHydrationWarning>
                  {hora(c.fecha)}
                </time>
                <span>{c.titulo}</span>
                <em>
                  {c.fuente}
                  {c.frente ? ` · ${c.frente}` : ""}
                </em>
              </Link>
            ))}
          </div>
        )}

        <p className="tv-sub">
          Puertas <span>{abiertas ? `${abiertas} de ${e.puertas.length} abiertas` : `${e.puertas.length} salas`}</span>
        </p>
        <div className="tv-puertas">
          {e.puertas.map((p) => {
            const t = visita.get(p.href);
            return (
              <Link key={p.href} {...puertaProps(p.href, p.label, e.color, p.img)} className="tv-door" data-visto={t ? "1" : "0"}>
                {p.img && <img src={p.img} alt="" loading="lazy" decoding="async" />}
                <span className="tv-door-t">
                  {p.vivo && <span className="tv-punto" />}
                  {p.label}
                </span>
                <span className="tv-door-x">{p.txt}</span>
                {t && <span className="tv-door-v">✓ {haceCuanto(t)}</span>}
              </Link>
            );
          })}
        </div>

        {e.herramientas.length > 0 && (
          <>
            <p className="tv-sub">A mano en este espacio</p>
            <div className="tv-herr">
              {e.herramientas.map((h) => (
                <Link key={h.href} {...puertaProps(h.href, h.label, e.color)} className="tv-herr-b">
                  <b>{h.label}</b>
                  <span>{h.txt}</span>
                </Link>
              ))}
            </div>
          </>
        )}

        <div className="tv-hilo-acc">
          <Link {...puertaProps(`/modulo/${e.id}`, e.nombre, e.color, e.img)} className="tv-btn tv-btn-fantasma">
            Portada de {e.nombre}
          </Link>
          {siguienteNombre && (
            <button type="button" className="tv-btn" onClick={siguiente}>
              {siguienteNombre} <Flecha />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

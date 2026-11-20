"use client";

// ============================================================
// v432.0 UN SOLO MUNDO — la Puerta ya no reparte la casa en dos mundos: ofrece
// la casa ENTERA (Vanguard, un solo mundo con un solo estilo) y su centro (la
// Zona Cero, el ojo de Vanguard). El Cruce — el barrido al pasar de Noticias a
// Juego — se retira: ya no hay frontera que cruzar.
// (historia) v403.1 LOS DOS MUNDOS — LA PUERTA y EL CRUCE
// ① LA PUERTA: la primera vez que alguien llega a la portada (y siempre en
//    /entrar) se abre una secuencia de entrada: línea de oro, emblema,
//    «DOS MUNDOS · UNA SOLA CASA», y la pantalla se parte en dos puertas:
//    NOTICIAS y JUEGO. Al elegir, el mundo elegido se traga la pantalla (warp)
//    con un golpe de sonido sintetizado (Web Audio, sin archivos, solo tras el
//    toque del usuario) y la casa te deja dentro.
// ② EL CRUCE: navegando, cada vez que pasas de un mundo al otro se dibuja un
//    barrido de 1,5 s con el nombre del mundo. Nunca bloquea: toque = fuera.
// Reglas: espera a que la cortina de carga muera; nunca a robots ni a
// navegadores automatizados; con «reducir movimiento» todo es estático;
// SALTAR y Esc siempre; solo transform/opacity (60 fps).
// ============================================================
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { CLAVE_VISTA, EVENTO_ABRIR, FICHA_SALIDAS, type Salida } from "./mundos";
import "./puerta.css";

function esRobot(): boolean {
  if (typeof navigator === "undefined") return true;
  if ((navigator as Navigator & { webdriver?: boolean }).webdriver) return true;
  return /bot|crawl|spider|slurp|lighthouse|headless|preview|facebookexternalhit|whatsapp/i.test(navigator.userAgent);
}

function calma(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

function leer(alm: "local" | "session", k: string): string | null {
  try {
    return (alm === "local" ? localStorage : sessionStorage).getItem(k);
  } catch {
    return null;
  }
}
function guardar(alm: "local" | "session", k: string, v: string) {
  try {
    (alm === "local" ? localStorage : sessionStorage).setItem(k, v);
  } catch {
    /* modo privado: la puerta simplemente vuelve a salir */
  }
}

/** espera a que la cortina de carga del layout termine (o a que no exista) */
function trasLaCortina(fn: () => void): () => void {
  let vivo = true;
  const t0 = Date.now();
  const mirar = () => {
    if (!vivo) return;
    const c = document.getElementById("vg-cortina");
    const fuera = !c || c.dataset.vgGone === "1" || c.dataset.vgOff === "1" || getComputedStyle(c).display === "none";
    if (fuera || Date.now() - t0 > 12_000) fn();
    else window.setTimeout(mirar, 180);
  };
  mirar();
  return () => {
    vivo = false;
  };
}

/** golpe épico sintetizado: sub-grave que cae + soplo de ruido que sube. Solo tras un toque. */
function golpe(m: Salida) {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ac = new AC();
    const t = ac.currentTime;
    const master = ac.createGain();
    master.gain.value = 0.22;
    master.connect(ac.destination);
    // sub-grave
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(m === "zona" ? 92 : 74, t);
    o.frequency.exponentialRampToValueAtTime(32, t + 1.1);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(1, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + 1.35);
    // soplo (ruido filtrado que sube)
    const largo = Math.floor(ac.sampleRate * 0.9);
    const buf = ac.createBuffer(1, largo, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < largo; i++) d[i] = (Math.random() * 2 - 1) * (i / largo);
    const ruido = ac.createBufferSource();
    ruido.buffer = buf;
    const f = ac.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 0.8;
    f.frequency.setValueAtTime(400, t);
    f.frequency.exponentialRampToValueAtTime(m === "zona" ? 5200 : 3600, t + 0.85);
    const gn = ac.createGain();
    gn.gain.value = 0.35;
    ruido.connect(f).connect(gn).connect(master);
    ruido.start(t);
    // campana de llegada (quinta justa, oro)
    [m === "zona" ? 392 : 330, m === "zona" ? 587.3 : 494].forEach((hz, i) => {
      const c = ac.createOscillator();
      const gc = ac.createGain();
      c.type = "triangle";
      c.frequency.value = hz;
      gc.gain.setValueAtTime(0.0001, t + 0.8);
      gc.gain.exponentialRampToValueAtTime(0.12 / (i + 1), t + 0.84);
      gc.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
      c.connect(gc).connect(master);
      c.start(t + 0.8);
      c.stop(t + 2.3);
    });
    window.setTimeout(() => ac.close().catch(() => {}), 2600);
  } catch {
    /* sin audio: la imagen basta */
  }
}

function Emblema({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id="vp-oro" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset=".55" stopColor="#e8c56a" />
          <stop offset="1" stopColor="#b8862b" />
        </linearGradient>
      </defs>
      <path d="M32 3 59 18v28L32 61 5 46V18z" fill="none" stroke="url(#vp-oro)" strokeWidth="2" />
      <path d="M17 20h8l7 18 7-18h8L35 47h-6z" fill="url(#vp-oro)" />
    </svg>
  );
}

type Fase = "intro" | "eleccion" | "warp";

export function Puerta({ onElegir, onSaltar }: { onElegir: (m: Salida) => void; onSaltar?: () => void }) {
  const quieto = calma();
  const [fase, setFase] = useState<Fase>(quieto ? "eleccion" : "intro");
  const [elegido, setElegido] = useState<Salida | null>(null);
  const caja = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (fase !== "intro") return;
    const t = window.setTimeout(() => setFase("eleccion"), 2900);
    return () => window.clearTimeout(t);
  }, [fase]);

  useEffect(() => {
    // foco en el propio diálogo (no en una puerta: ninguna sale «favorecida»); Tab recorre Noticias → Juego
    if (fase === "eleccion") caja.current?.focus({ preventScroll: true });
  }, [fase]);

  const elegir = useCallback(
    (m: Salida) => {
      if (elegido) return;
      setElegido(m);
      setFase("warp");
      golpe(m);
      window.setTimeout(() => onElegir(m), quieto ? 150 : 1250);
    },
    [elegido, onElegir, quieto],
  );

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (fase === "intro") setFase("eleccion");
        else if (onSaltar && !elegido) onSaltar();
      }
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [fase, onSaltar, elegido]);

  return (
    <div
      ref={caja}
      tabIndex={-1}
      className="vp"
      role="dialog"
      aria-modal="true"
      aria-label="Entra a Vanguard, un solo mundo, o abre la Zona Cero"
      data-fase={fase}
      data-elegido={elegido ?? ""}
      data-quieto={quieto ? "1" : "0"}
      onClick={() => fase === "intro" && setFase("eleccion")}
    >
      <div className="vp-fondo" aria-hidden />
      <div className="vp-estrellas" aria-hidden />
      <div className="vp-scan" aria-hidden />
      <div className="vp-linea" aria-hidden />

      <div className="vp-intro" aria-hidden={fase !== "intro"}>
        <Emblema className="vp-emblema" />
        <p className="vp-marca">VANGUARD</p>
        <p className="vp-lema">
          <span>Un solo mundo</span> <i>·</i> <span>toda la casa</span>
        </p>
      </div>

      <div className="vp-puertas">
        {(["vanguard", "zona"] as Salida[]).map((m) => {
          const f = FICHA_SALIDAS[m];
          return (
            <button
              key={m}
              type="button"
              className="vp-mundo"
              data-m={m}
              tabIndex={fase === "eleccion" ? 0 : -1}
              aria-label={`Entrar a ${f.nombre}: ${f.lema}`}
              onClick={(e) => {
                e.stopPropagation();
                if (fase === "eleccion") elegir(m);
              }}
            >
              <span className="vp-mundo-img" style={{ backgroundImage: `url(${f.img})` }} aria-hidden />
              <span className="vp-mundo-velo" aria-hidden />
              <span className="vp-mira" aria-hidden />
              <span className="vp-mundo-top">
                <span className="vp-num">{m === "vanguard" ? "Toda la casa" : "El centro"}</span>
                {m === "vanguard" ? (
                  <span className="vp-vivo">
                    <i /> En vivo
                  </span>
                ) : (
                  <span className="vp-rango">◉ El ojo</span>
                )}
              </span>
              <span className="vp-mundo-pie">
                <span className="vp-nombre">{f.nombre}</span>
                <span className="vp-lema-m">{f.lema}</span>
                <span className="vp-texto">{f.texto}</span>
                <span className="vp-chips">
                  {f.chips.slice(0, 6).map((c) => (
                    <span key={c}>{c}</span>
                  ))}
                </span>
                <span className="vp-ir">
                  Entrar <b aria-hidden>→</b>
                  <em>{m === "vanguard" ? `${f.salas} salas · ${f.modulos} módulos` : `busca en los ${f.modulos} módulos`}</em>
                </span>
              </span>
            </button>
          );
        })}
        <span className="vp-eje" aria-hidden>
          <Emblema className="vp-eje-emb" />
        </span>
      </div>

      {/* v406.0 LA TRAVESÍA: una tercera salida — recorrer toda la casa, espacio a espacio */}
      {fase === "eleccion" && (
        <a
          href="/entrar"
          className="vp-saltar vp-travesia"
          onClick={(e) => {
            e.stopPropagation();
            onSaltar?.();
          }}
        >
          Explorar toda la casa <span aria-hidden>›</span>
        </a>
      )}

      {onSaltar && fase !== "warp" && (
        <button
          type="button"
          className="vp-saltar"
          onClick={(e) => {
            e.stopPropagation();
            if (fase === "intro") setFase("eleccion");
            else onSaltar();
          }}
        >
          {fase === "intro" ? "Saltar intro" : "Ahora no"} <span aria-hidden>›</span>
        </button>
      )}

      {/* v405.12 — EL MAPA DE LOS MUNDOS: la Puerta declara lo que hay detrás.
          No sustituye a las dos salidas (v432: la casa entera y la Zona Cero):
          añade la tercera salida que faltaba, el índice de todo el planeta. */}
      {fase !== "warp" && (
        <a
          className="vp-mapamundos"
          href="/mundos"
          onClick={(e) => e.stopPropagation()}
          aria-label="Abrir el mapa de los mundos: todos los países y todos los módulos"
        >
          <span aria-hidden>◎</span> El mapa de los mundos
        </a>
      )}

      {elegido && (
        <div className="vp-warp" data-m={elegido} role="status">
          <span className="vp-warp-rayo" aria-hidden />
          <span className="vp-warp-t">Entrando a</span>
          <b>{FICHA_SALIDAS[elegido].nombre}</b>
          <span className="vp-warp-sub">{FICHA_SALIDAS[elegido].sub}</span>
          <i aria-hidden />
        </div>
      )}
    </div>
  );
}

/** Montado una vez en el layout: decide cuándo abrir la Puerta (v432: sin Cruce, ya hay un solo mundo) */
export function PuertaMundos() {
  const ruta = usePathname();
  const router = useRouter();
  const [abierta, setAbierta] = useState(false);

  // la Puerta: primera visita a la portada, o cuando alguien la pide (botón «Elegir mundo»)
  useEffect(() => {
    if (ruta !== "/" || esRobot() || leer("local", CLAVE_VISTA)) return;
    if (new URLSearchParams(window.location.search).has("sinintro")) return;
    return trasLaCortina(() => setAbierta(true));
  }, [ruta]);

  useEffect(() => {
    const abrir = () => setAbierta(true);
    window.addEventListener(EVENTO_ABRIR, abrir);
    return () => window.removeEventListener(EVENTO_ABRIR, abrir);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.vpAbierta = abierta ? "1" : "0";
  }, [abierta]);

  const cerrar = useCallback(() => {
    guardar("local", CLAVE_VISTA, "1");
    setAbierta(false);
  }, []);

  const elegir = useCallback(
    (m: Salida) => {
      guardar("local", CLAVE_VISTA, "1");
      setAbierta(false);
      const destino = FICHA_SALIDAS[m].destino;
      if (destino !== ruta) router.push(destino);
    },
    [router, ruta],
  );

  if (ruta === "/entrar") return null;
  return (
    <>
      {abierta && <Puerta onElegir={elegir} onSaltar={cerrar} />}
    </>
  );
}

/** /entrar: la Puerta como página propia (se puede compartir) */
export function PuertaPagina() {
  const router = useRouter();
  const [lista, setLista] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- la Puerta depende de window (movimiento reducido): se pinta tras hidratar
  useEffect(() => setLista(true), []);
  const elegir = useCallback(
    (m: Salida) => {
      guardar("local", CLAVE_VISTA, "1");
      router.push(FICHA_SALIDAS[m].destino);
    },
    [router],
  );
  if (!lista)
    return (
      <div className="vp-sinjs">
        <a href={FICHA_SALIDAS.vanguard.destino}>Entrar a Vanguard →</a>
        <a href={FICHA_SALIDAS.zona.destino}>Abrir la Zona Cero →</a>
        <a href="/mundos">El mapa de los mundos →</a>
      </div>
    );
  return <Puerta onElegir={elegir} />;
}

/** v432.0: el antiguo «⇄ Elegir mundo» lleva ahora a la Zona Cero (ya hay un
 *  solo mundo). Mismo nombre exportado: las cinco salas que lo usan no cambian. */
export function BotonMundos({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <Link href="/zona-cero" className={className ?? "vp-boton"} aria-label="Abrir la Zona Cero: el ojo de Vanguard que busca en toda la casa">
      {children ?? (
        <>
          <span aria-hidden>◉</span> Zona Cero
        </>
      )}
    </Link>
  );
}

"use client";

// ═══════════════════════════════════════════════════════════════════
// v438.1 · LA PLAZA VIVA — se pasea, se pregunta, se escucha y se apunta
//
// Lo que el Dueño pidió en v437.2 (interactivo, música pegadiza, cada módulo
// con sus secciones) ya estaba. Esta tanda lo pone a vivir:
//   ① EL PREGÓN: una cinta en la entrada que va soltando, puesto por puesto, lo
//      que hay dentro — compuesta con los datos reales, nunca inventada.
//   ② LA RONDA: «dar una vuelta» abre los diez puestos en orden, uno cada 4,5 s.
//      Se para con su botón, con Escape o tocando cualquier puesto: no secuestra.
//   ③ LA VOZ: si la enciendes, cada mercader DICE su saludo con la boca de la
//      casa (lib/voz/decir) en su persona. Con el sonido apagado, no habla.
//   ④ LA CESTA: apuntas las secciones que quieres volver a ver; viven en tu
//      aparato (vg:mercado:v1) y se borran con un botón.
//   ⑤ ENLACE DIRECTO: /mercado#puesto-geografia abre ese puesto (y se puede
//      copiar el enlace para mandarlo).
//
// LA LEY DEL SONIDO, intacta: nada suena antes de un toque, se calla con el
// sonido apagado, con el modo calma, en pestaña oculta y al cerrar el puesto.
// Con movimiento quieto no hay ronda ni pregón girando: la plaza se queda
// quieta y sigue entera.
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  PUESTOS,
  buscar,
  cifrasMercado,
  puestoDeId,
  puestoDelDia,
  type Puesto,
  type Seccion,
} from "@/lib/mercado/puestos";
import { BPM, DURACION_COMPAS, TOTAL_COMPASES, nombreDeGrado, notasDeCompas, partitura } from "@/lib/mercado/musica";
import { SEGUNDOS_PREGON, pregonDe, pregones } from "@/lib/mercado/pregon";
import {
  CLAVE_CESTA,
  alternarCesta,
  cestaVacia,
  contarCesta,
  detalleCesta,
  enCesta,
  leerCesta,
  textoCesta,
  type Cesta,
} from "@/lib/mercado/cesta";
import { desbloquearSonido, suena, suenaNotas } from "@/lib/sonido/tocar";
import { EVENTO, debeAnimar, leer, sistemaQuieto } from "@/lib/interfaz/vivo";
import { decir, pararBoca } from "@/lib/voz/decir";
import { Personaje } from "./personaje";

const estiloDe = (p: Puesto) =>
  ({ ["--pm-color" as string]: p.color, ["--pm-hondo" as string]: p.hondo }) as CSSProperties;

/** Cada cuánto avanza la ronda, en milisegundos. */
const MS_RONDA = 4500;

/** Una tarjeta de puesto: el toldo, el mercader, el letrero y su etiqueta. */
function Tarjeta({
  p,
  abierto,
  atenuado,
  delDia,
  onAbrir,
  secciones,
}: {
  p: Puesto;
  abierto: boolean;
  atenuado: boolean;
  delDia: boolean;
  onAbrir: () => void;
  secciones?: Seccion[];
}) {
  const texto = secciones && secciones.length > 1 ? secciones.map((s) => s.nombre).join(" · ") : p.lema;
  return (
    <li className={atenuado ? "pm-otro" : undefined}>
      <button
        type="button"
        className="pm-puesto"
        style={estiloDe(p)}
        aria-expanded={abierto}
        aria-controls="pm-mostrador"
        onClick={onAbrir}
      >
        <span className="pm-toldo" aria-hidden />
        <span className="pm-num">{p.numero}</span>
        <span className="pm-etiqueta">{p.secciones.length} secc.</span>
        <span className="pm-lona">
          <Personaje nombre={p.personaje.nombre} pieza={p.personaje.pieza} color={p.color} semilla={Number(p.numero)} />
        </span>
        <span className="pm-letrero">
          <strong>{p.nombre}</strong>
          <span>{texto}</span>
        </span>
        <span className="pm-pie-puesto">
          <span className="pm-mercader">
            <em>{p.personaje.nombre}</em>, {p.personaje.oficio}
          </span>
          <span className="pm-ver">{abierto ? "cerrar" : "abrir"}</span>
        </span>
        {delDia ? <span className="pm-hoy">el puesto del día</span> : null}
      </button>
    </li>
  );
}

export function MercadoCliente() {
  const [abierto, setAbierto] = useState<string | null>(null);
  const [consulta, setConsulta] = useState("");
  const [sonando, setSonando] = useState(false);
  const [montado, setMontado] = useState(false);
  const [quieto, setQuieto] = useState(false);
  const [delDia, setDelDia] = useState<string | null>(null);
  const [cesta, setCesta] = useState<Cesta>(cestaVacia);
  const [verCesta, setVerCesta] = useState(false);
  const [voz, setVoz] = useState(false);
  const [ronda, setRonda] = useState<number | null>(null);
  const [pregon, setPregon] = useState(0);
  const [pregonPausa, setPregonPausa] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);
  const compas = useRef(0);
  const reloj = useRef<ReturnType<typeof setInterval> | null>(null);

  const puesto = abierto ? puestoDeId(abierto) : null;
  const hallazgos = useMemo(() => (consulta.trim() ? buscar(consulta) : null), [consulta]);
  const cifras = useMemo(() => cifrasMercado(), []);
  const enLaCesta = useMemo(() => detalleCesta(cesta), [cesta]);
  const cinta = useMemo(() => pregones(), []);

  /** ¿Puede sonar algo ahora mismo, según las perillas de la casa? */
  const sonidoVivo = useCallback(() => {
    try {
      return leer().sonido;
    } catch {
      return true;
    }
  }, []);

  // ① el arranque: el día, la cesta guardada y el enlace directo (#puesto-x)
  useEffect(() => {
    setMontado(true);
    setDelDia(puestoDelDia().id);
    desbloquearSonido();
    try {
      setCesta(leerCesta(window.localStorage.getItem(CLAVE_CESTA)));
    } catch {
      setCesta(cestaVacia());
    }
    setQuieto(!debeAnimar(leer(), sistemaQuieto()));
    const m = /^#puesto-([a-z]+)$/.exec(window.location.hash);
    const porEnlace = m ? puestoDeId(m[1]) : null;
    if (porEnlace) setAbierto(porEnlace.id);
  }, []);

  // la música, compás a compás
  useEffect(() => {
    if (!sonando) return;
    desbloquearSonido();
    compas.current = 0;
    const paso = () => {
      suenaNotas("mercado-musica", notasDeCompas(compas.current));
      compas.current = (compas.current + 1) % TOTAL_COMPASES;
    };
    paso();
    reloj.current = setInterval(paso, Math.round(DURACION_COMPAS * 1000));
    return () => {
      if (reloj.current) clearInterval(reloj.current);
      reloj.current = null;
    };
  }, [sonando]);

  // ② el pregón: pasa de puesto en puesto (y se queda quieto si la casa está quieta)
  useEffect(() => {
    if (pregonPausa || quieto) return;
    const t = setInterval(() => setPregon((i) => i + 1), SEGUNDOS_PREGON * 1000);
    return () => clearInterval(t);
  }, [pregonPausa, quieto]);

  // ③ la ronda: abre los puestos en orden, con su voz, y se para sola al final
  useEffect(() => {
    if (ronda === null) return;
    const t = setInterval(() => {
      setRonda((i) => {
        if (i === null) return null;
        const siguiente = i + 1;
        if (siguiente >= PUESTOS.length) {
          setAbierto(null);
          return null;
        }
        setAbierto(PUESTOS[siguiente].id);
        suena("puesto-abrir");
        return siguiente;
      });
    }, MS_RONDA);
    return () => clearInterval(t);
  }, [ronda]);

  // silencio honrado: pestaña oculta o sonido apagado en los interruptores
  useEffect(() => {
    const alOcultar = () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        setSonando(false);
        setRonda(null);
        pararBoca();
      }
    };
    const alCambiar = () => {
      try {
        if (!leer().sonido) {
          setSonando(false);
          setVoz(false);
          pararBoca();
        }
        setQuieto(!debeAnimar(leer(), sistemaQuieto()));
      } catch {
        /* sin preferencias guardadas no hay nada que apagar */
      }
    };
    document.addEventListener("visibilitychange", alOcultar);
    window.addEventListener(EVENTO, alCambiar);
    return () => {
      document.removeEventListener("visibilitychange", alOcultar);
      window.removeEventListener(EVENTO, alCambiar);
    };
  }, []);

  // ④ el mercader habla al abrir su puesto (solo si la voz está encendida)
  useEffect(() => {
    if (!puesto || !voz || !sonidoVivo()) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    decir(`${puesto.personaje.nombre}, ${puesto.personaje.oficio}. ${puesto.personaje.saludo}`, {
      persona: puesto.personaje.voz,
    });
    return () => pararBoca();
  }, [puesto, voz, sonidoVivo]);

  // ⑤ el enlace del puesto, en la barra del navegador (sin recargar)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const limpia = window.location.pathname + window.location.search;
    const destino = abierto ? `${limpia}#puesto-${abierto}` : limpia;
    if (window.location.href.replace(window.location.origin, "") !== destino) {
      window.history.replaceState(null, "", destino);
    }
  }, [abierto]);

  // Escape cierra el puesto (y la ronda). Nunca secuestra el teclado.
  useEffect(() => {
    if (!abierto && ronda === null) return;
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (abierto) {
        setAbierto(null);
        suena("puesto-cerrar");
      }
      setRonda(null);
      setVerCesta(false);
      pararBoca();
    };
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [abierto, ronda]);

  const cerrar = () => {
    setAbierto(null);
    setRonda(null);
    pararBoca();
    suena("puesto-cerrar");
  };

  const abrir = (id: string) => {
    if (abierto === id) {
      cerrar();
      return;
    }
    setRonda(null);
    setAbierto(id);
    suena("puesto-abrir");
  };

  const darUnaVuelta = () => {
    if (ronda !== null) {
      setRonda(null);
      suena("puesto-cerrar");
      return;
    }
    setAbierto(PUESTOS[0].id);
    setRonda(0);
    setVoz(false);
    suena("puesto-abrir");
  };

  const guardar = (seccion: Seccion) => {
    const siguiente = alternarCesta(cesta, seccion.href);
    setCesta(siguiente);
    try {
      window.localStorage.setItem(CLAVE_CESTA, textoCesta(siguiente));
    } catch {
      /* sin almacenamiento, la cesta vive solo en esta visita */
    }
    suena(enCesta(cesta, seccion.href) ? "deshacer" : "guardar");
  };

  const vaciarCesta = () => {
    setCesta(cestaVacia());
    try {
      window.localStorage.removeItem(CLAVE_CESTA);
    } catch {
      /* nada que borrar */
    }
    suena("reiniciar");
  };

  const copiarEnlace = async () => {
    if (!abierto) return;
    const url = `${window.location.origin}/mercado#puesto-${abierto}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiado("enlace copiado");
    } catch {
      setCopiado(url);
    }
    suena("copiar");
    window.setTimeout(() => setCopiado(null), 2400);
  };

  const lista = hallazgos ?? PUESTOS.map((p) => ({ puesto: p, secciones: p.secciones }));
  const enRonda = ronda !== null;
  const elPregon = pregonDe(pregon);

  return (
    <div className="pm-pagina" id="plaza">
      <header className="pm-cabecera">
        <p className="pm-volanta">
          {cifras.puestos} puestos · {cifras.mercaderes} mercaderes · {cifras.secciones} secciones
        </p>
        <h2 className="pm-titulo">La plaza, abierta</h2>
        <p className="pm-sub">
          Cada familia tiene aquí su puesto y su mercader. Abre uno y te enseña lo que vende: su
          puerta y todas sus secciones, con su ruta a la vista. La música es de la casa, corta y
          tarareable; si molesta, se calla.
        </p>
      </header>

      {/* ② el pregón: lo que va cantando la plaza */}
      <div className="pm-pregon" aria-live="off">
        <span className="pm-pregon-sello">pregón</span>
        <Link href={elPregon.href} className="pm-pregon-txt" onClick={() => suena("moneda")}>
          {elPregon.texto}
        </Link>
        <span className="pm-pregon-puntos" aria-hidden>
          {cinta.map((x, i) => (
            <i key={x.puesto.id} className={i === ((pregon % cinta.length) + cinta.length) % cinta.length ? "pm-on" : undefined} />
          ))}
        </span>
        <button
          type="button"
          className="pm-pregon-freno"
          aria-pressed={pregonPausa || quieto}
          onClick={() => setPregonPausa((v) => !v)}
          disabled={quieto}
          title={quieto ? "la casa está en movimiento quieto: el pregón no gira" : undefined}
        >
          {pregonPausa || quieto ? "pregón parado" : "parar el pregón"}
        </button>
      </div>

      <div className="pm-barra">
        <label className="pm-buscador">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            placeholder="Busca una familia, un mercader, una sección o una ruta"
            aria-label="Buscar en el mercado"
            enterKeyHint="search"
          />
        </label>

        <button
          type="button"
          className="pm-musica"
          aria-pressed={sonando}
          onClick={() => {
            const encender = !sonando;
            setSonando(encender);
            suena(encender ? "mercado-musica" : "puesto-cerrar");
          }}
        >
          <span className="pm-ecualizador" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          {sonando ? "la música suena" : "poner la música"}
        </button>

        <button
          type="button"
          className="pm-tecla"
          aria-pressed={voz}
          onClick={() => {
            const encender = !voz;
            setVoz(encender);
            if (!encender) pararBoca();
            suena(encender ? "permiso-voz" : "puesto-cerrar");
          }}
        >
          {voz ? "los mercaderes hablan" : "que hablen"}
        </button>

        <button type="button" className="pm-tecla" aria-pressed={enRonda} onClick={darUnaVuelta}>
          {enRonda ? `ronda ${(ronda ?? 0) + 1}/${PUESTOS.length} · parar` : "dar una vuelta"}
        </button>

        <button type="button" className="pm-tecla pm-cesta-tecla" aria-expanded={verCesta} onClick={() => setVerCesta((v) => !v)}>
          tu cesta · {contarCesta(cesta)}
        </button>

        <span className="pm-partitura" aria-hidden>
          {BPM} ppm · {TOTAL_COMPASES} compases · {partitura()[0]}
        </span>
      </div>

      {copiado ? (
        <p className="pm-aviso" role="status">
          {copiado}
        </p>
      ) : null}

      {hallazgos && hallazgos.length === 0 ? (
        <p className="pm-vacio">
          En esta plaza no hay nada que se llame «{consulta.trim()}». Prueba con una familia
          (geografía, ciencia, historia…), un mercader (Nora, Teo, Elena…) o una sección (/mundos,
          /academia…).
        </p>
      ) : (
        <ul className={`pm-plaza${abierto ? " pm-con-abierto" : ""}`}>
          {lista.map(({ puesto: p, secciones }) => (
            <Tarjeta
              key={p.id}
              p={p}
              abierto={abierto === p.id}
              atenuado={Boolean(abierto) && abierto !== p.id}
              delDia={delDia === p.id}
              onAbrir={() => abrir(p.id)}
              secciones={secciones}
            />
          ))}
        </ul>
      )}

      {verCesta ? (
        <section className="pm-cesta" aria-label="Tu cesta del mercado">
          <div className="pm-cesta-cab">
            <h3>Tu cesta · {contarCesta(cesta)}</h3>
            <div className="pm-cesta-acciones">
              {contarCesta(cesta) > 0 ? (
                <button type="button" className="pm-tecla" onClick={vaciarCesta}>
                  vaciar
                </button>
              ) : null}
              <button type="button" className="pm-cerrar pm-cerrar-cesta" onClick={() => setVerCesta(false)} aria-label="Cerrar la cesta">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
          {enLaCesta.length === 0 ? (
            <p className="pm-cesta-vacia">
              Vacía. En cualquier puesto, la tecla «a la cesta» apunta una sección para volver a
              ella. Se guarda en tu aparato y no viaja a ninguna parte.
            </p>
          ) : (
            <ul className="pm-secciones">
              {enLaCesta.map((s) => (
                <li key={s.href} className="pm-seccion" style={{ ["--pm-color" as string]: s.color } as CSSProperties}>
                  <span className="pm-seccion-txt">
                    <Link href={s.href} onClick={() => suena("moneda")}>
                      {s.nombre}
                    </Link>
                    <p>
                      {s.puestoNombre} · {s.detalle}
                    </p>
                    <span className="pm-cifra">{s.href}</span>
                  </span>
                  <button type="button" className="pm-quitar" onClick={() => guardar(s)} aria-label={`Sacar ${s.nombre} de la cesta`}>
                    quitar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <div className="pm-mostrador-wrap" aria-live="polite">
        {puesto ? (
          <section
            id="pm-mostrador"
            className="pm-mostrador"
            style={estiloDe(puesto)}
            aria-label={`El puesto de ${puesto.nombre}`}
          >
            <button type="button" className="pm-cerrar" onClick={cerrar} aria-label="Cerrar el puesto">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </button>

            <div className="pm-ficha">
              <Personaje
                nombre={puesto.personaje.nombre}
                pieza={puesto.personaje.pieza}
                color={puesto.color}
                semilla={Number(puesto.numero)}
                saluda={montado && !quieto}
              />
              <div className="pm-bocadillo">
                <p className="pm-quien">
                  Puesto {puesto.numero} · {puesto.personaje.nombre}, {puesto.personaje.oficio}
                </p>
                <p>{puesto.personaje.saludo}</p>
                <p className="pm-bocadillo-pie">
                  <button type="button" className="pm-tecla pm-tecla-mini" onClick={copiarEnlace}>
                    copiar el enlace del puesto
                  </button>
                  <Link className="pm-tecla pm-tecla-mini" href={puesto.puerta}>
                    ir a {puesto.nombre} →
                  </Link>
                </p>
              </div>
            </div>

            <ul className="pm-cifras">
              {puesto.cifras.map((c) => (
                <li key={c.etiqueta}>
                  <strong>{c.valor}</strong>
                  <span>{c.etiqueta}</span>
                </li>
              ))}
              <li>
                <strong>{puesto.secciones.length}</strong>
                <span>secciones en el puesto</span>
              </li>
              <li>
                <strong>
                  {nombreDeGrado(0)}–{nombreDeGrado(7)}
                </strong>
                <span>la armonía de la vuelta</span>
              </li>
            </ul>

            <p className="pm-titulo-lista">Lo que vende este puesto</p>
            <ul className="pm-secciones">
              {puesto.secciones.map((s) => (
                <li key={s.href} className="pm-seccion">
                  <span className="pm-seccion-txt">
                    <Link href={s.href} onClick={() => suena("moneda")}>
                      {s.nombre}
                    </Link>
                    <p>{s.detalle}</p>
                    <span className="pm-cifra">
                      {s.href}
                      {s.cifra ? ` · ${s.cifra}` : ""}
                    </span>
                  </span>
                  <span className="pm-seccion-acciones">
                    <button
                      type="button"
                      className="pm-cesta-btn"
                      aria-pressed={enCesta(cesta, s.href)}
                      onClick={() => guardar(s)}
                      aria-label={`${enCesta(cesta, s.href) ? "Sacar" : "Echar"} ${s.nombre} ${enCesta(cesta, s.href) ? "de" : "a"} la cesta`}
                    >
                      {enCesta(cesta, s.href) ? "en la cesta" : "a la cesta"}
                    </button>
                    <Link
                      className="pm-abrir"
                      href={s.href}
                      onClick={() => suena("moneda")}
                      aria-label={`Abrir ${s.nombre}`}
                    >
                      abrir
                    </Link>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <p className="pm-vacio">
            Elige un puesto y el mercader te atiende. Son diez: uno por familia, con su color y su
            toldo. O pide «dar una vuelta» y la plaza te los enseña en orden.
          </p>
        )}
      </div>

      <footer className="pm-pie">
        <span>
          {cifras.secciones} secciones en {cifras.puestos} puestos · todas las rutas de esta plaza
          existen en la casa y se comprueban en cada tanda.
        </span>
        <Link href="/orden">ver el índice completo →</Link>
      </footer>
    </div>
  );
}

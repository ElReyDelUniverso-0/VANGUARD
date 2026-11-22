"use client";

// ═══════════════════════════════════════════════════════════════════
// v438.3 · EL MERCADO SE ENCIENDE — que al entrar se diga «wow»
//
// El Dueño, textual: «no he visto nada de los que agregaste, mejóralo tanto y
// púlelo más que diga wow». Y tenía razón: v437.2 y v438.1 añadieron cosas
// buenas pero PEQUEÑAS —una cinta fina, cuatro teclas grises— y lo que se veía
// seguía siendo una rejilla de tarjetas. Esta tanda cambia lo que se ve:
//
//   ① EL ARCO DE ENTRADA: cuerdas de farolillos que se mecen y los diez
//      banderines de las familias colgando. Se entra al mercado, no a una lista.
//   ② EL PREGÓN, EN GRANDE: una marquesina que desfila con letras de cartel,
//      cada nombre en el color de su familia. Se para sola al pasar el ratón,
//      con su botón, y con la casa en movimiento quieto.
//   ③ LAS CUATRO TECLAS DE VERDAD: «dar una vuelta», «poner la música», «que
//      hablen» y la cesta, en una barra pegajosa grande (dorada la principal).
//   ④ LOS PUESTOS TIENEN VIDA: el toldo se inclina al pasar el ratón, el
//      mercader saluda, el farolillo se enciende y la etiqueta de cartón se
//      mueve. Al abrir uno, el resto de la plaza se retira y el puesto se lleva
//      un foco de luz de su color: el mostrador sube y las secciones caen en
//      cascada.
//   ⑤ PAPELITOS: al pedir la vuelta, la plaza tira papelitos de colores (una
//      sola vez, y nada si la casa está en quietud).
//
// Todo respeta lo de siempre: nada suena antes de un toque, con movimiento
// quieto no hay mecido ni desfile ni papelitos, y ninguna capa nueva tapa lo
// que se puede pulsar (el arco, el pregón y la barra van en flujo normal).
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
import { nombreDeGrado } from "@/lib/mercado/musica";
import {
  BPM_SUAVE,
  DURACION_COMPAS_SUAVE,
  TOTAL_COMPASES_SUAVE,
  notasDeCompasSuave,
  partituraSuave,
} from "@/lib/mercado/musica-suave";
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
import { decir, leerGustos, pararBoca } from "@/lib/voz/decir";
import { Emblema } from "./emblema";

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
        <span className="pm-garlanda" aria-hidden>
          <i />
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="pm-num">{p.numero}</span>
        <span className="pm-etiqueta">{p.secciones.length} secc.</span>
        <span className="pm-lona">
          <span className="pm-farol" aria-hidden />
          <Emblema tipo={p.agente.emblema} color={p.color} nombre={p.agente.nombre} />
        </span>
        <span className="pm-letrero">
          <strong>{p.nombre}</strong>
          <span>{texto}</span>
        </span>
        <span className="pm-pie-puesto">
          <span className="pm-mercader">
            <em>{p.agente.codigo}</em> · {p.agente.oficio}
          </span>
          <span className="pm-ver">{abierto ? "cerrar" : "abrir"}</span>
        </span>
        {delDia ? <span className="pm-hoy">el puesto del día</span> : null}
      </button>
    </li>
  );
}

export function MercadoCliente({ version }: { version?: string }) {
  const [abierto, setAbierto] = useState<string | null>(null);
  const [consulta, setConsulta] = useState("");
  const [sonando, setSonando] = useState(false);
  const [montado, setMontado] = useState(false);
  const [quieto, setQuieto] = useState(false);
  const [delDia, setDelDia] = useState<string | null>(null);
  const [cesta, setCesta] = useState<Cesta>(cestaVacia);
  const [verCesta, setVerCesta] = useState(false);
  const [voz, setVoz] = useState(true);
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

  // el arranque: el día, la cesta guardada y el enlace directo (#puesto-x)
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
      suenaNotas("mercado-musica", notasDeCompasSuave(compas.current));
      compas.current = (compas.current + 1) % TOTAL_COMPASES_SUAVE;
    };
    paso();
    reloj.current = setInterval(paso, Math.round(DURACION_COMPAS_SUAVE * 1000));
    return () => {
      if (reloj.current) clearInterval(reloj.current);
      reloj.current = null;
    };
  }, [sonando]);

  // el pregón: pasa de puesto en puesto (y se queda quieto si la casa está quieta)
  useEffect(() => {
    if (pregonPausa || quieto) return;
    const t = setInterval(() => setPregon((i) => i + 1), SEGUNDOS_PREGON * 1000);
    return () => clearInterval(t);
  }, [pregonPausa, quieto]);

  // la ronda: abre los puestos en orden, con su voz, y se para sola al final
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

  // el mercader habla al abrir su puesto (solo si la voz está encendida)
  useEffect(() => {
    if (!puesto || !voz || !sonidoVivo()) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    // voz gruesa, de respeto: la persona más baja de la casa y el tono todavía
    // más abajo (0,70), sin prisa. Es el agente el que habla, no un locutor.
    decir(`${puesto.agente.nombre}. ${puesto.agente.oficio}. ${puesto.agente.saludo}`, {
      persona: puesto.agente.voz,
      gustos: { ...leerGustos(), pitch: 0.7, rate: 0.86 },
    });
    return () => pararBoca();
  }, [puesto, voz, sonidoVivo]);

  // el enlace del puesto, en la barra del navegador (sin recargar)
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

  const alternarMusica = () => {
    const encender = !sonando;
    setSonando(encender);
    suena(encender ? "mercado-musica" : "puesto-cerrar");
  };

  const alternarVoz = () => {
    const encender = !voz;
    setVoz(encender);
    if (!encender) pararBoca();
    suena(encender ? "permiso-voz" : "puesto-cerrar");
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
  const indicePregon = ((pregon % cinta.length) + cinta.length) % cinta.length;

  return (
    <div className={`pm-pagina${abierto ? " pm-foco" : ""}`} id="plaza">
      {/* ① el arco: farolillos y los diez banderines de las familias */}
      <div className="pm-arco" aria-hidden>
        <span className="pm-arco-cuerda" />
        <span className="pm-arco-luces">
          {Array.from({ length: 14 }, (_, i) => (
            <i key={i} style={{ ["--i" as string]: i } as CSSProperties} />
          ))}
        </span>
        <span className="pm-arco-banderines">
          {PUESTOS.map((p) => (
            <i key={p.id} style={{ ["--pm-color" as string]: p.color } as CSSProperties} />
          ))}
        </span>
        <span className="pm-arco-rotulo">mercado</span>
      </div>

      {/* la tira de luces de la feria: veinticuatro bombillas que parpadean */}
      <div className="pm-luces" aria-hidden>
        {Array.from({ length: 24 }, (_, i) => (
          <i key={i} style={{ ["--i" as string]: i } as CSSProperties} />
        ))}
      </div>

      <header className="pm-cabecera">
        <p className="pm-volanta">puesto a puesto · familia a familia</p>
        <h2 className="pm-titulo">La feria de Vanguard</h2>
        <p className="pm-sub">
          Diez puestos, diez agentes de la casa y todas las secciones de cada familia. Abre un puesto
          y su agente te enseña lo que guarda. Todo lo que se oye aquí es de la casa y se puede callar.
        </p>

        <ul className="pm-vivo" aria-label="La plaza en cifras">
          <li>
            <strong>{cifras.puestos}</strong>
            <span>puestos</span>
          </li>
          <li>
            <strong>{cifras.mercaderes}</strong>
            <span>agentes</span>
          </li>
          <li>
            <strong>{cifras.secciones}</strong>
            <span>secciones</span>
          </li>
          <li>
            <strong>{BPM_SUAVE}</strong>
            <span>pulsos de la música suave</span>
          </li>
        </ul>
      </header>

      {/* ② el pregón, en grande */}
      <div className={`pm-pregon${pregonPausa || quieto ? " pm-pregon-quieta" : ""}`} aria-live="off">
        <span className="pm-pregon-sello">pregón</span>
        <div className="pm-pregon-pista">
          <div className="pm-pregon-cinta">
            {[0, 1].map((vuelta) => (
              <span key={vuelta} className="pm-pregon-vuelta" aria-hidden={vuelta === 1 || undefined}>
                {cinta.map((x) => (
                  <Link
                    key={`${vuelta}-${x.puesto.id}`}
                    href={x.href}
                    className="pm-pregon-item"
                    onClick={() => suena("moneda")}
                    tabIndex={vuelta === 1 ? -1 : undefined}
                  >
                    <b style={{ color: x.puesto.color }}>¡{x.puesto.nombre}!</b> {x.puesto.agente.codigo},{" "}
                    {x.puesto.agente.oficio} — {x.puesto.secciones.length} secciones
                  </Link>
                ))}
              </span>
            ))}
          </div>
        </div>
        <span className="pm-pregon-puntos" aria-hidden>
          {cinta.map((x, i) => (
            <i key={x.puesto.id} className={i === indicePregon ? "pm-on" : undefined} />
          ))}
        </span>
        <button
          type="button"
          className="pm-pregon-freno"
          aria-pressed={pregonPausa || quieto}
          onClick={() => setPregonPausa((v) => !v)}
          disabled={quieto}
          title={quieto ? "la casa está en movimiento quieto: el pregón no desfila" : undefined}
        >
          {pregonPausa || quieto ? "parado" : "parar"}
        </button>
      </div>

      {/* ③ la barra: buscar y las cuatro teclas grandes */}
      <div className="pm-dock">
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

        <div className="pm-dock-teclas">
          <button type="button" className="pm-cta" aria-pressed={enRonda} onClick={darUnaVuelta}>
            <span aria-hidden>↻</span>
            {enRonda ? `ronda ${(ronda ?? 0) + 1}/${PUESTOS.length} · parar` : "dar una vuelta"}
          </button>

          <button type="button" className="pm-cta pm-cta-2" aria-pressed={sonando} onClick={alternarMusica}>
            <span className="pm-ecualizador" aria-hidden>
              <i />
              <i />
              <i />
            </span>
            {sonando ? "la música suave suena" : "música suave"}
          </button>

          <button type="button" className="pm-tecla" aria-pressed={voz} onClick={alternarVoz}>
            {voz ? "voces graves · sí" : "voces graves · no"}
          </button>

          <button type="button" className="pm-tecla pm-cesta-tecla" aria-expanded={verCesta} onClick={() => setVerCesta((v) => !v)}>
            tu cesta · {contarCesta(cesta)}
          </button>
        </div>
      </div>

      <p className="pm-partitura" aria-hidden>
        música suave · {BPM_SUAVE} ppm · {TOTAL_COMPASES_SUAVE} compases · {partituraSuave()[0]} · vuelta de {TOTAL_COMPASES_SUAVE} compases
      </p>

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
        <ul className={`pm-plaza${abierto ? " pm-con-abierto" : ""}${hallazgos ? " pm-buscando" : ""}`}>
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

      {enRonda ? (
        <div className="pm-papelitos" aria-hidden>
          {Array.from({ length: 18 }, (_, i) => (
            <i
              key={i}
              style={
                {
                  ["--i" as string]: i,
                  ["--c" as string]: PUESTOS[i % PUESTOS.length].color,
                } as CSSProperties
              }
            />
          ))}
        </div>
      ) : null}

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
              <Emblema tipo={puesto.agente.emblema} color={puesto.color} nombre={puesto.agente.nombre} encendida={montado} />
              <div className="pm-bocadillo">
                <p className="pm-quien">
                  Puesto {puesto.numero} · {puesto.agente.nombre}
                </p>
                <p>{puesto.agente.saludo}</p>
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
              {puesto.secciones.map((s, i) => (
                <li
                  key={s.href}
                  className="pm-seccion pm-cae"
                  style={{ ["--i" as string]: i } as CSSProperties}
                >
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
          <p className="pm-vacio pm-vacio-grande">
            Toca un toldo y el agente te atiende. O pulsa <strong>dar una vuelta</strong> y la
            plaza te enseña los diez puestos en orden, uno por uno.
          </p>
        )}
      </div>

      <footer className="pm-pie">
        <span>
          {cifras.secciones} secciones en {cifras.puestos} puestos · todas las rutas de esta plaza
          existen en la casa y se comprueban en cada tanda.
        </span>
        <span className="pm-pie-version">{version ? `mercado · ${version}` : null}</span>
        <Link href="/orden">ver el índice completo →</Link>
      </footer>
    </div>
  );
}

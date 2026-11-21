"use client";

// ═══════════════════════════════════════════════════════════════════
// v437.2 · LA PLAZA — el mercado se pasea, se pregunta y se escucha
//
// Orden del Dueño: «que sea interactivo», «con una música clásica sencilla y
// que se te quede en la cabeza», «enseña cada módulo perfectamente con sus
// secciones». Todo eso está aquí, en el único componente de cliente del
// mercado (los datos son puros y los mercaderes son SVG de servidor).
//
// LA LEY DEL SONIDO, respetada al pie de la letra:
//   · Nada suena antes de un toque: la música se enciende con el botón.
//   · Se apaga con su botón, al cambiar de pestaña y cuando el Dueño apaga el
//     sonido en los interruptores (evento `vg:interfaz`).
//   · No hay mp3 ni AudioContext nuevo: la contradanza se toca compás a compás
//     con el motor de la casa (`suenaNotas` → `lib/sound.ts`).
//   · Con movimiento quieto (sistema o perilla) los mercaderes no saludan.
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
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
import { DURACION_COMPAS, BPM, TOTAL_COMPASES, notasDeCompas, nombreDeGrado, partitura } from "@/lib/mercado/musica";
import { desbloquearSonido, suena, suenaNotas } from "@/lib/sonido/tocar";
import { EVENTO, leer } from "@/lib/interfaz/vivo";
import { Personaje } from "./personaje";

const estiloDe = (p: Puesto) =>
  ({ ["--pm-color" as string]: p.color, ["--pm-hondo" as string]: p.hondo }) as CSSProperties;

/** Una tarjeta de puesto: el toldo, el mercader, el letrero y su etiqueta. */
function Tarjeta({
  p,
  abierto,
  delDia,
  onAbrir,
  secciones,
}: {
  p: Puesto;
  abierto: boolean;
  delDia: boolean;
  onAbrir: () => void;
  secciones?: Seccion[];
}) {
  const texto = secciones && secciones.length > 1 ? secciones.map((s) => s.nombre).join(" · ") : p.lema;
  return (
    <li>
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
  const [delDia, setDelDia] = useState<string | null>(null);
  const compas = useRef(0);
  const reloj = useRef<ReturnType<typeof setInterval> | null>(null);

  const puesto = abierto ? puestoDeId(abierto) : null;
  const hallazgos = useMemo(() => (consulta.trim() ? buscar(consulta) : null), [consulta]);
  const cifras = useMemo(() => cifrasMercado(), []);

  // el puesto del día se resuelve en el aparato: el HTML del servidor no
  // adivina qué día es cuando lo lees (y no hay desajuste de hidratación)
  useEffect(() => {
    setMontado(true);
    setDelDia(puestoDelDia().id);
    desbloquearSonido();
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

  // silencio honrado: pestaña oculta o sonido apagado en los interruptores
  useEffect(() => {
    const alOcultar = () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") setSonando(false);
    };
    const alCambiar = () => {
      try {
        if (!leer().sonido) setSonando(false);
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

  // Escape cierra el puesto abierto (nunca secuestra el teclado)
  useEffect(() => {
    if (!abierto) return;
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAbierto(null);
        suena("puesto-cerrar");
      }
    };
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [abierto]);

  const abrir = (id: string) => {
    if (abierto === id) {
      setAbierto(null);
      suena("puesto-cerrar");
      return;
    }
    setAbierto(id);
    suena("puesto-abrir");
  };

  const lista = hallazgos ?? PUESTOS.map((p) => ({ puesto: p, secciones: p.secciones }));
  const saluda = montado;

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

        <span className="pm-partitura" aria-hidden>
          {BPM} ppm · {TOTAL_COMPASES} compases · {partitura()[0]}
        </span>
      </div>

      {hallazgos && hallazgos.length === 0 ? (
        <p className="pm-vacio">
          En esta plaza no hay nada que se llame «{consulta.trim()}». Prueba con una familia
          (geografía, ciencia, historia…), un mercader (Nora, Teo, Elena…) o una sección (/mundos,
          /academia…).
        </p>
      ) : (
        <ul className="pm-plaza">
          {lista.map(({ puesto: p, secciones }) => (
            <Tarjeta
              key={p.id}
              p={p}
              abierto={abierto === p.id}
              delDia={delDia === p.id}
              onAbrir={() => abrir(p.id)}
              secciones={secciones}
            />
          ))}
        </ul>
      )}

      <div className="pm-mostrador-wrap" aria-live="polite">
        {puesto ? (
          <section
            id="pm-mostrador"
            className="pm-mostrador"
            style={estiloDe(puesto)}
            aria-label={`El puesto de ${puesto.nombre}`}
          >
            <button type="button" className="pm-cerrar" onClick={() => abrir(puesto.id)} aria-label="Cerrar el puesto">
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
                saluda={saluda}
              />
              <div className="pm-bocadillo">
                <p className="pm-quien">
                  Puesto {puesto.numero} · {puesto.personaje.nombre}, {puesto.personaje.oficio}
                </p>
                <p>{puesto.personaje.saludo}</p>
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
                <strong>{nombreDeGrado(0)}–{nombreDeGrado(7)}</strong>
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
                  <Link
                    className="pm-abrir"
                    href={s.href}
                    onClick={() => suena("moneda")}
                    aria-label={`Abrir ${s.nombre}`}
                  >
                    abrir
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <p className="pm-vacio">
            Elige un puesto y el mercader te atiende. Son diez: uno por familia, con su color y su
            toldo.
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

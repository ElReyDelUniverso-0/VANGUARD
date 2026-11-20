"use client";
// ═══════════════════════════════════════════════════════════════════
// v422.3 RADIO VANGUARD · EL ESTUDIO (cliente)
//
// La boca es la de la casa (`lib/voz/decir`): las mismas cuatro personas,
// los mismos gustos guardados y el mismo respeto por el aparato. Lo que se
// añade aquí es el PROGRAMA: se lee por bloques, cada bloque deja su
// silencio, la pantalla va señalando lo que suena y el texto queda entero
// a la vista — si el aparato no puede hablar, la radio sigue siendo
// legible (la casa nunca se queda muda).
//
// Personalizable y guardado en el aparato (nada viaja): estilo, persona,
// voz, velocidad, tono, pausas, longitud del programa y temas.
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Nota } from "@/lib/portada/notas";
import {
  PERSONAS,
  type GustosVoz,
  type PersonaId,
  type VozDisponible,
  decir,
  duracionAproxMs,
  escanearVoces,
  guardarGustos,
  leerGustos,
  pararBoca,
  pausarBoca,
  reanudarBoca,
  avisosDelAparato,
} from "@/lib/voz/decir";
import { type BloqueGuion, type EstiloRadio, construirPrograma, programaATexto } from "@/lib/radio/guion";
import { SUGERENCIAS, responder } from "@/lib/radio/conversar";
import "./radio.css";

const LS = "vanguard:radio:v1";

type Ajustes = {
  estilo: EstiloRadio;
  limite: number;
  conResumen: boolean;
  gustos: GustosVoz;
};

const AJUSTES_DEFECTO: Ajustes = {
  estilo: "cercana",
  limite: 4,
  conResumen: true,
  gustos: { persona: "locutora", vozURI: null, rate: 1, pitch: 1, volumen: 0.95, pausas: true },
};

function leerAjustes(): Ajustes {
  if (typeof window === "undefined") return AJUSTES_DEFECTO;
  try {
    const raw = window.localStorage.getItem(LS);
    const gustos = leerGustos();
    if (!raw) return { ...AJUSTES_DEFECTO, gustos };
    const j = JSON.parse(raw) as Partial<Ajustes>;
    return {
      estilo: j.estilo === "serena" || j.estilo === "filosa" ? j.estilo : "cercana",
      limite: Math.min(8, Math.max(1, Number(j.limite) || 4)),
      conResumen: j.conResumen !== false,
      gustos,
    };
  } catch {
    return { ...AJUSTES_DEFECTO, gustos: leerGustos() };
  }
}

function mmss(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function RadioVanguard({ notas, ahoraServidor }: { notas: Nota[]; ahoraServidor: number }) {
  const [ajustes, setAjustes] = useState<Ajustes>(AJUSTES_DEFECTO);
  // EL RELOJ NO PUEDE DIFERIR ENTRE SERVIDOR Y CLIENTE: si el programa se
  // arma con `new Date()` aquí mismo, el HTML dice «hace 2 horas» y el
  // navegador «hace 3», y React rompe la hidratación (error #418, medido en
  // el QA). El primer render usa la hora del SERVIDOR; ya montados se pasa al
  // reloj del aparato, que es el que manda para decir «hace X».
  const [reloj, setReloj] = useState<{ hora?: number; ahora: number }>({ ahora: ahoraServidor });
  const [voces, setVoces] = useState<VozDisponible[]>([]);
  const [avisos, setAvisos] = useState<string[]>([]);
  const [sonando, setSonando] = useState(false);
  const [bloqueActual, setBloqueActual] = useState(-1);
  const [conversacion, setConversacion] = useState<{ quien: "tu" | "radio"; texto: string; rotulos?: { texto: string; href: string; fuente: string }[] }[]>([]);
  const [pregunta, setPregunta] = useState("");
  const [copiado, setCopiado] = useState(false);
  const vivo = useRef(false);
  const temporizador = useRef<number | null>(null);

  const programa = useMemo(
    () =>
      construirPrograma(notas, {
        estilo: ajustes.estilo,
        limite: ajustes.limite,
        conResumen: ajustes.conResumen,
        hora: reloj.hora,
        ahora: reloj.ahora,
      }),
    [notas, ajustes.estilo, ajustes.limite, ajustes.conResumen, reloj],
  );

  // ① ajustes y voces del aparato (después de montar: así el HTML del
  // servidor y el primer render del cliente coinciden siempre)
  useEffect(() => {
    setReloj({ hora: new Date().getHours(), ahora: Date.now() });
    setAjustes(leerAjustes());
    const cargar = () => {
      setVoces(escanearVoces("es"));
      setAvisos(avisosDelAparato("es"));
    };
    cargar();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.addEventListener("voiceschanged", cargar);
      return () => window.speechSynthesis.removeEventListener("voiceschanged", cargar);
    }
  }, []);

  const guardar = useCallback((nuevo: Ajustes) => {
    setAjustes(nuevo);
    guardarGustos(nuevo.gustos);
    try {
      window.localStorage.setItem(LS, JSON.stringify({ ...nuevo, gustos: undefined }));
    } catch {
      /* modo privado: vive en memoria */
    }
  }, []);

  const parar = useCallback(() => {
    vivo.current = false;
    if (temporizador.current) window.clearTimeout(temporizador.current);
    pararBoca();
    setSonando(false);
    setBloqueActual(-1);
  }, []);

  // ② el programa, bloque a bloque, con su silencio
  const decirBloque = useCallback(
    (i: number) => {
      if (!vivo.current) return;
      if (i >= programa.bloques.length) {
        vivo.current = false;
        setSonando(false);
        setBloqueActual(-1);
        return;
      }
      const bloque = programa.bloques[i];
      setBloqueActual(i);
      const ok = decir(bloque.texto, {
        gustos: ajustes.gustos,
        interrumpir: i === 0,
        onFin: () => {
          if (!vivo.current) return;
          temporizador.current = window.setTimeout(() => decirBloque(i + 1), bloque.pausaMs);
        },
      });
      if (!ok) {
        // el aparato no puede hablar: el programa sigue en pantalla, en silencio
        vivo.current = false;
        setSonando(false);
      }
    },
    [ajustes.gustos, programa]
  );

  const emitir = useCallback(() => {
    if (sonando) {
      parar();
      return;
    }
    vivo.current = true;
    setSonando(true);
    decirBloque(0);
  }, [decirBloque, parar, sonando]);

  const pausar = useCallback(() => {
    if (!sonando) return;
    if (window.speechSynthesis?.paused) {
      reanudarBoca();
      setAjustes((a) => ({ ...a }));
    } else {
      pausarBoca();
      setAjustes((a) => ({ ...a }));
    }
  }, [sonando]);

  const saltar = useCallback(
    (delta: number) => {
      const destino = Math.max(0, Math.min(programa.bloques.length - 1, bloqueActual + delta));
      vivo.current = false;
      pararBoca();
      if (temporizador.current) window.clearTimeout(temporizador.current);
      vivo.current = true;
      setSonando(true);
      decirBloque(destino);
    },
    [bloqueActual, decirBloque, programa.bloques.length]
  );

  // ③ la conversación
  const preguntar = useCallback(
    (texto: string) => {
      const limpia = texto.trim();
      if (!limpia) return;
      const r = responder(limpia, notas);
      setConversacion((c) => [
        ...c.slice(-8),
        { quien: "tu", texto: limpia },
        { quien: "radio", texto: r.texto, rotulos: r.rotulos },
      ]);
      setPregunta("");
      if (r.intencion === "silencio") {
        parar();
        return;
      }
      vivo.current = false;
      pararBoca();
      decir(r.texto, { gustos: ajustes.gustos });
    },
    [ajustes.gustos, notas, parar]
  );

  useEffect(() => () => pararBoca(), []);

  const bloque: BloqueGuion | undefined = programa.bloques[bloqueActual];
  const restante = programa.bloques.slice(Math.max(0, bloqueActual)).reduce((ms, b) => ms + duracionAproxMs(b.texto) + b.pausaMs, 0);
  const avisoPrincipal = avisos[0];

  return (
    <div className="vxr">
      {/* ── el estudio ── */}
      <section className="vxr-estudio" aria-label="El programa">
        <div className={sonando ? "vxr-aire vxr-aire--on" : "vxr-aire"}>
          <span className="vxr-punto" aria-hidden />
          <span>{sonando ? "EN EL AIRE" : "EN SILENCIO"}</span>
          <span className="vxr-ecualizador" aria-hidden>
            <i /><i /><i /><i /><i />
          </span>
        </div>

        <h2 className="vxr-titulo-programa">
          {programa.titulo}
          <span className="vxr-dur"> · {mmss(programa.duracionMs)}</span>
        </h2>

        <p className="vxr-ahora" aria-live="polite">
          {bloque ? bloque.texto : programa.bloques[0]?.texto}
        </p>

        <div className="vxr-controles">
          <button type="button" className="vxr-btn vxr-btn--play" onClick={emitir} aria-pressed={sonando}>
            {sonando ? "◼ Detener" : "▶ Escuchar el programa"}
          </button>
          <button type="button" className="vxr-btn" onClick={pausar} disabled={!sonando}>
            <span aria-hidden="true">❙❙</span> Pausa
          </button>
          <button
            type="button"
            className="vxr-btn vxr-btn--salto"
            onClick={() => saltar(-1)}
            disabled={bloqueActual <= 0}
            aria-label="Bloque anterior"
            title="Bloque anterior"
          >
            <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true" focusable="false">
              <path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            className="vxr-btn vxr-btn--salto"
            onClick={() => saltar(1)}
            disabled={bloqueActual < 0 || bloqueActual >= programa.bloques.length - 1}
            aria-label="Bloque siguiente"
            title="Bloque siguiente"
          >
            <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true" focusable="false">
              <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="vxr-restante">{bloqueActual >= 0 ? `quedan ${mmss(restante)}` : `${programa.bloques.length} bloques`}</span>
          <button
            type="button"
            className="vxr-btn vxr-btn--fantasma"
            onClick={() => {
              navigator.clipboard?.writeText(programaATexto(programa)).then(
                () => {
                  setCopiado(true);
                  window.setTimeout(() => setCopiado(false), 1600);
                },
                () => setCopiado(false)
              );
            }}
          >
            {copiado ? "✓ Copiado" : "Copiar el guion"}
          </button>
        </div>

        {avisoPrincipal ? <p className="vxr-aviso">{avisoPrincipal}</p> : null}

        <ol className="vxr-guion" aria-label="Guion del programa">
          {programa.bloques.map((b, i) => (
            <li
              key={b.id}
              className={i === bloqueActual ? "vxr-parte vxr-parte--sonando" : "vxr-parte"}
              data-bloque={i}
              data-tipo={b.tipo}
              data-pausa-ms={b.pausaMs}
            >
              <span className={`vxr-tipo vxr-tipo--${b.tipo}`}>{b.tipo}</span>
              <span className="vxr-texto">{b.texto}</span>
              {b.href ? (
                <a className="vxr-fuente" href={b.href}>
                  {b.fuente} ↗
                </a>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      {/* ── la conversación ── */}
      <section className="vxr-charla" aria-label="Habla con la radio">
        <h3>Pregúntale a la radio</h3>
        <p className="vxr-charla-sub">
          Responde con los cables de la casa y cita la fuente. Si no hay nada sobre lo que preguntas, lo dice.
        </p>
        <div className="vxr-sugerencias">
          {SUGERENCIAS.map((s) => (
            <button key={s} type="button" className="vxr-chip" onClick={() => preguntar(s)}>
              {s}
            </button>
          ))}
        </div>
        <form
          className="vxr-form"
          onSubmit={(e) => {
            e.preventDefault();
            preguntar(pregunta);
          }}
        >
          <label className="vxr-oculto" htmlFor="vxr-pregunta">Escribe tu pregunta</label>
          <input
            id="vxr-pregunta"
            className="vxr-input"
            value={pregunta}
            onChange={(e) => setPregunta(e.target.value)}
            placeholder="¿Qué pasa en Ucrania? · resumen · ¿algo bueno?"
            autoComplete="off"
          />
          <button type="submit" className="vxr-btn vxr-btn--play">Preguntar</button>
        </form>
        <div className="vxr-hilo" aria-live="polite">
          {conversacion.length === 0 ? (
            <p className="vxr-vacio">Aún no le has preguntado nada.</p>
          ) : (
            conversacion.map((m, i) => (
              <div key={i} className={m.quien === "tu" ? "vxr-msg vxr-msg--tu" : "vxr-msg vxr-msg--radio"}>
                <span className="vxr-quien">{m.quien === "tu" ? "Tú" : "Radio Vanguard"}</span>
                <p>{m.texto}</p>
                {m.rotulos && m.rotulos.length > 0 ? (
                  <ul className="vxr-fuentes">
                    {m.rotulos.map((r) => (
                      <li key={r.href}>
                        <a href={r.href}>{r.texto}</a> <small>{r.fuente}</small>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── personalización ── */}
      <section className="vxr-ajustes" aria-label="Personalización">
        <h3>Tu radio</h3>
        <div className="vxr-grid">
          <label className="vxr-campo">
            <span>Estilo</span>
            <select
              value={ajustes.estilo}
              onChange={(e) => guardar({ ...ajustes, estilo: e.target.value as EstiloRadio })}
            >
              <option value="serena">Serena · informativa</option>
              <option value="cercana">Cercana · conversacional</option>
              <option value="filosa">Filosa · directa</option>
            </select>
          </label>

          <label className="vxr-campo">
            <span>Persona</span>
            <select
              value={ajustes.gustos.persona}
              onChange={(e) => guardar({ ...ajustes, gustos: { ...ajustes.gustos, persona: e.target.value as PersonaId } })}
            >
              {(Object.keys(PERSONAS) as PersonaId[]).map((p) => (
                <option key={p} value={p}>{PERSONAS[p].nombre} — {PERSONAS[p].lema}</option>
              ))}
            </select>
          </label>

          <label className="vxr-campo">
            <span>Voz del aparato ({voces.length})</span>
            <select
              value={ajustes.gustos.vozURI ?? ""}
              onChange={(e) => guardar({ ...ajustes, gustos: { ...ajustes.gustos, vozURI: e.target.value || null } })}
            >
              <option value="">La mejor disponible (automático)</option>
              {voces.map((v) => (
                <option key={v.uri} value={v.uri}>
                  {v.nombre} · {v.idioma} · {v.calidad}/100
                </option>
              ))}
            </select>
          </label>

          <label className="vxr-campo">
            <span>Velocidad · {ajustes.gustos.rate.toFixed(2)}×</span>
            <input
              type="range" min={0.7} max={1.3} step={0.05}
              value={ajustes.gustos.rate}
              onChange={(e) => guardar({ ...ajustes, gustos: { ...ajustes.gustos, rate: Number(e.target.value) } })}
            />
          </label>

          <label className="vxr-campo">
            <span>Tono · {ajustes.gustos.pitch.toFixed(2)}</span>
            <input
              type="range" min={0.7} max={1.3} step={0.05}
              value={ajustes.gustos.pitch}
              onChange={(e) => guardar({ ...ajustes, gustos: { ...ajustes.gustos, pitch: Number(e.target.value) } })}
            />
          </label>

          <label className="vxr-campo">
            <span>Noticias desarrolladas · {ajustes.limite}</span>
            <input
              type="range" min={1} max={8} step={1}
              value={ajustes.limite}
              onChange={(e) => guardar({ ...ajustes, limite: Number(e.target.value) })}
            />
          </label>

          <label className="vxr-switch">
            <input
              type="checkbox"
              checked={ajustes.gustos.pausas}
              onChange={(e) => guardar({ ...ajustes, gustos: { ...ajustes.gustos, pausas: e.target.checked } })}
            />
            <span>Pausas naturales (respiración entre frases)</span>
          </label>

          <label className="vxr-switch">
            <input
              type="checkbox"
              checked={ajustes.conResumen}
              onChange={(e) => guardar({ ...ajustes, conResumen: e.target.checked })}
            />
            <span>Leer también el resumen, no solo el titular</span>
          </label>
        </div>
        <p className="vxr-nota">
          Todo se guarda en tu aparato (no hay cuenta ni servidor). La voz la pone el sistema: si suena metálica, elige
          otra en la lista — la calidad de cada una está medida, no prometida.
        </p>
      </section>
    </div>
  );
}

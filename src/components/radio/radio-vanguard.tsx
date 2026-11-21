"use client";
// ═══════════════════════════════════════════════════════════════════
// v431.2 RADIO VANGUARD · EL ESTUDIO (segunda versión).
//
// La boca sigue siendo la de la casa (`lib/voz/decir`) y ahora AVISA DE CADA
// FRASE (`onFrase`), así que la pantalla puede poner subtítulos de lo que
// suena — sin reimplementar la voz ni adivinar por dónde va.
//
// LO QUE HACE, en orden de importancia:
//   ① PROGRAMA EDITADO: el guion agrupa los cables que cuentan lo mismo y
//      elige con diversidad de región y fuente (lib/radio/agrupar.ts).
//   ② TIEMPO A LA CARTA: 2, 5, 10 o 15 minutos; el número de asuntos sale
//      de ahí y la duración estimada se ve antes de darle al play.
//   ③ SUBTÍTULOS: la frase que se está diciendo, grande y sincronizada.
//   ④ RAIL DE BLOQUES: se ve cuánto ocupa cada bloque y se salta a cualquiera
//      con un clic o con las flechas.
//   ⑤ CONVERSACIÓN CON MEMORIA: seguimientos («cuéntame más», «la segunda»,
//      «¿y en África?») y cifras del archivo.
//   ⑥ SE ACUERDA DE DÓNDE IBAS: al volver, ofrece continuar en el bloque.
//   ⑦ HABLAS TÚ: micrófono del aparato (si lo hay) para preguntar en voz alta.
//   ⑧ CONTROLES DEL SISTEMA: Media Session (pantalla de bloqueo/auriculares)
//      y Wake Lock (la pantalla no se apaga mientras escuchas).
//   ⑨ TU RADIO EN UN ENLACE: los ajustes se pueden copiar como URL.
//
// Reglas que no se rompen: sin cuenta, sin servidor, sin enviar audio; si el
// aparato no puede hablar, el programa entero queda en pantalla y se copia.
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Nota } from "@/lib/portada/notas";
import {
  PERSONAS,
  type GustosVoz,
  type PersonaId,
  type VozDisponible,
  decir,
  escanearVoces,
  guardarGustos,
  leerGustos,
  pararBoca,
  pausarBoca,
  reanudarBoca,
  avisosDelAparato,
} from "@/lib/voz/decir";
import { type BloqueGuion, type EstiloRadio, construirPrograma, programaAGuion } from "@/lib/radio/guion";
import { SUGERENCIAS, type Memoria, MEMORIA_VACIA, responder } from "@/lib/radio/conversar";
import { usaEmision } from "@/lib/radio/usa-emision";
import { useT } from "@/lib/i18n";
import { comoIdiomaVoz, idiomaVoz } from "@/lib/voz/idiomas";
import "./radio.css";

const LS = "vanguard:radio:v2";
const LS_POS = "vanguard:radio:posicion";

type Ajustes = {
  estilo: EstiloRadio;
  duracionMin: number;
  conResumen: boolean;
  conFuentes: boolean;
  gustos: GustosVoz;
};

const AJUSTES_DEFECTO: Ajustes = {
  estilo: "cercana",
  duracionMin: 5,
  conResumen: true,
  conFuentes: true,
  gustos: { persona: "locutora", vozURI: null, rate: 1, pitch: 1, volumen: 0.95, pausas: true },
};

const PRESETS: { id: string; nombre: string; detalle: string; ajustes: Partial<Ajustes> }[] = [
  { id: "manana", nombre: "Mañana serena", detalle: "5 min · informativa · pausada", ajustes: { estilo: "serena", duracionMin: 5, conResumen: true, conFuentes: true } },
  { id: "frente", nombre: "Frente abierto", detalle: "10 min · directa · sin adornos", ajustes: { estilo: "filosa", duracionMin: 10, conResumen: true, conFuentes: true } },
  { id: "paseo", nombre: "Paseo largo", detalle: "15 min · cercana · con fuentes", ajustes: { estilo: "cercana", duracionMin: 15, conResumen: true, conFuentes: true } },
  { id: "corto", nombre: "Solo lo esencial", detalle: "2 min · titulares y cierre", ajustes: { estilo: "filosa", duracionMin: 2, conResumen: false, conFuentes: false } },
];

function leerAjustes(): Ajustes {
  if (typeof window === "undefined") return AJUSTES_DEFECTO;
  const gustos = leerGustos();
  try {
    const raw = window.localStorage.getItem(LS);
    if (raw) {
      const j = JSON.parse(raw) as Partial<Ajustes>;
      return {
        estilo: j.estilo === "serena" || j.estilo === "filosa" ? j.estilo : "cercana",
        duracionMin: [2, 5, 10, 15].includes(Number(j.duracionMin)) ? Number(j.duracionMin) : 5,
        conResumen: j.conResumen !== false,
        conFuentes: j.conFuentes !== false,
        gustos,
      };
    }
    const p = new URLSearchParams(window.location.search).get("p");
    if (p) {
      const j = JSON.parse(atob(p.replace(/-/g, "+").replace(/_/g, "/"))) as Partial<Ajustes>;
      return {
        estilo: j.estilo === "serena" || j.estilo === "filosa" ? j.estilo : "cercana",
        duracionMin: [2, 5, 10, 15].includes(Number(j.duracionMin)) ? Number(j.duracionMin) : 5,
        conResumen: j.conResumen !== false,
        conFuentes: j.conFuentes !== false,
        gustos,
      };
    }
  } catch {
    /* modo privado o enlace roto: se queda en los ajustes por defecto */
  }
  return { ...AJUSTES_DEFECTO, gustos };
}

/** La MISMA cuenta que el guion: 14 caracteres por segundo más el silencio. */
function msDe(b: { texto: string; pausaMs: number }): number {
  return Math.round((b.texto.length / 14) * 1000) + b.pausaMs;
}

function mmss(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

type Reconocimiento = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: { 0: { 0: { transcript: string } } } }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

export function RadioVanguard({ notas, ahoraServidor }: { notas: Nota[]; ahoraServidor: number }) {
  // v437.0 · el idioma de la casa manda: el programa se escribe y se dice en él
  const { lang } = useT();
  const idioma = comoIdiomaVoz(lang);
  const [ajustes, setAjustes] = useState<Ajustes>(AJUSTES_DEFECTO);
  const [reloj, setReloj] = useState<{ hora?: number; ahora: number }>({ ahora: ahoraServidor });
  const [voces, setVoces] = useState<VozDisponible[]>([]);
  const [avisos, setAvisos] = useState<string[]>([]);
  const [charla, setCharla] = useState<{ quien: "tu" | "radio"; texto: string; rotulos?: { texto: string; href: string; fuente: string }[] }[]>([]);
  const [memoria, setMemoria] = useState<Memoria>(MEMORIA_VACIA);
  const [siguientes, setSiguientes] = useState<string[]>([]);
  const [pregunta, setPregunta] = useState("");
  const [copiado, setCopiado] = useState<"" | "guion" | "enlace">("");
  const [micro, setMicro] = useState(false);
  const [escuchando, setEscuchando] = useState(false);
  const [continuarEn, setContinuarEn] = useState<number | null>(null);
  const reconocedor = useRef<Reconocimiento | null>(null);
  const pantalla = useRef<unknown>(null);

  const programa = useMemo(
    () =>
      construirPrograma(notas, {
        estilo: ajustes.estilo,
        objetivoMs: ajustes.duracionMin * 60_000,
        conResumen: ajustes.conResumen,
        conFuentes: ajustes.conFuentes,
        hora: reloj.hora,
        ahora: reloj.ahora,
        idioma,
      }),
    [notas, ajustes.estilo, ajustes.duracionMin, ajustes.conResumen, ajustes.conFuentes, reloj, idioma]
  );

  const guardar = useCallback((nuevo: Ajustes) => {
    setAjustes(nuevo);
    guardarGustos(nuevo.gustos);
    try {
      window.localStorage.setItem(LS, JSON.stringify({ ...nuevo, gustos: undefined }));
    } catch {
      /* modo privado: vive en memoria */
    }
  }, []);

  // ① arranque: reloj, ajustes, voces, micrófono, media session, posición
  useEffect(() => {
    setReloj({ hora: new Date().getHours(), ahora: Date.now() });
    setAjustes(leerAjustes());
    const cargar = () => {
      setVoces(escanearVoces(idioma));
      setAvisos(avisosDelAparato(idioma));
    };
    cargar();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.addEventListener("voiceschanged", cargar);
    }
    const Recon =
      (window as unknown as { SpeechRecognition?: new () => Reconocimiento; webkitSpeechRecognition?: new () => Reconocimiento })
        .SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: new () => Reconocimiento }).webkitSpeechRecognition;
    if (Recon) {
      try {
        const r = new Recon();
        r.lang = idiomaVoz(idioma).bcp47;
        r.continuous = false;
        r.interimResults = false;
        reconocedor.current = r;
        setMicro(true);
      } catch {
        setMicro(false);
      }
    }
    try {
      const pos = JSON.parse(window.localStorage.getItem(LS_POS) ?? "null") as { generadoEn: string; bloque: number } | null;
      if (pos && pos.bloque > 0) setContinuarEn(pos.bloque);
    } catch {
      /* posición ilegible */
    }
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.removeEventListener("voiceschanged", cargar);
    };
  }, [idioma]);

  // ② LA EMISIÓN: un solo encadenado para toda la casa (lib/radio/usa-emision).
  // Aquí ya no hay copia del bucle: la misma pieza que usa la emisora global.
  const emision = usaEmision(programa.bloques, ajustes.gustos, {
    idioma,
    onBloque: (i) => {
      try {
        window.localStorage.setItem(LS_POS, JSON.stringify({ generadoEn: programa.generadoEn, bloque: i }));
      } catch {
        /* modo privado */
      }
    },
    onFin: () => {
      try {
        window.localStorage.removeItem(LS_POS);
      } catch {
        /* noop */
      }
    },
  });
  const { sonando, bloqueActual } = emision;
  const subtitulo = emision.frase;

  const parar = useCallback(() => {
    emision.parar();
    try {
      (pantalla.current as { release?: () => Promise<void> } | null)?.release?.();
    } catch {
      /* noop */
    }
    pantalla.current = null;
  }, [emision]);

  const emitir = useCallback(
    (desde = 0) => {
      if (emision.sonando) {
        parar();
        return;
      }
      setContinuarEn(null);
      // la pantalla no se apaga mientras escuchas (si el aparato lo permite)
      try {
        const nav = navigator as unknown as { wakeLock?: { request: (t: string) => Promise<unknown> } };
        nav.wakeLock?.request("screen").then((s) => (pantalla.current = s)).catch(() => undefined);
      } catch {
        /* noop */
      }
      emision.empezar(desde);
    },
    [emision, parar]
  );

  const pausar = useCallback(() => {
    if (!emision.sonando) return;
    if (window.speechSynthesis?.paused) reanudarBoca();
    else pausarBoca();
    setAjustes((a) => ({ ...a }));
  }, [emision.sonando]);

  const saltar = useCallback((delta: number) => emision.saltar(delta), [emision]);

  // ③ la conversación (con memoria de la charla)
  const preguntar = useCallback(
    (texto: string) => {
      const limpia = texto.trim();
      if (!limpia) return;
      const r = responder(limpia, notas, Date.now(), memoria);
      setMemoria(r.memoria);
      setSiguientes(r.siguientes);
      setCharla((c) => [...c.slice(-8), { quien: "tu", texto: limpia }, { quien: "radio", texto: r.texto, rotulos: r.rotulos }]);
      setPregunta("");
      if (r.intencion === "silencio") {
        parar();
        return;
      }
      emision.parar();
      decir(r.texto, { gustos: ajustes.gustos });
    },
    [ajustes.gustos, memoria, notas, parar]
  );

  const hablar = useCallback(() => {
    const r = reconocedor.current;
    if (!r || escuchando) return;
    r.onresult = (e) => {
      const dicho = e.results[0][0].transcript;
      setEscuchando(false);
      if (dicho) preguntar(dicho);
    };
    r.onend = () => setEscuchando(false);
    r.onerror = () => setEscuchando(false);
    try {
      r.start();
      setEscuchando(true);
    } catch {
      setEscuchando(false);
    }
  }, [escuchando, preguntar]);

  // ④ controles del sistema (pantalla de bloqueo, auriculares)
  useEffect(() => {
    const ms = (navigator as unknown as { mediaSession?: { metadata: unknown; setActionHandler: (a: string, f: () => void) => void; playbackState: string } }).mediaSession;
    if (!ms) return;
    try {
      const MM = (window as unknown as { MediaMetadata?: new (i: Record<string, unknown>) => unknown }).MediaMetadata;
      if (MM) {
        ms.metadata = new MM({
          title: "Radio Vanguard",
          artist: `${programa.asuntos} asuntos · ${Math.round(programa.duracionMs / 60000)} min`,
          album: "La casa en voz alta",
        });
      }
      ms.setActionHandler("play", () => emitir(0));
      ms.setActionHandler("pause", () => parar());
      ms.setActionHandler("stop", () => parar());
      ms.setActionHandler("nexttrack", () => saltar(1));
      ms.setActionHandler("previoustrack", () => saltar(-1));
    } catch {
      /* un aparato sin estos controles sigue funcionando igual */
    }
  }, [programa, emitir, parar, saltar]);

  useEffect(() => () => pararBoca(), []);

  const bloque: BloqueGuion | undefined = programa.bloques[bloqueActual];
  const restante = programa.bloques.slice(Math.max(0, bloqueActual)).reduce((ms, b) => ms + msDe(b), 0);
  const avisoPrincipal = avisos[0];
  const total = programa.bloques.reduce((ms, b) => ms + msDe(b), 0) || 1;

  const copiar = (que: "guion" | "enlace") => {
    const texto =
      que === "guion"
        ? programaAGuion(programa)
        : `${window.location.origin}/radio?p=${btoa(JSON.stringify({ estilo: ajustes.estilo, duracionMin: ajustes.duracionMin, conResumen: ajustes.conResumen, conFuentes: ajustes.conFuentes }))
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "")}`;
    navigator.clipboard?.writeText(texto).then(
      () => {
        setCopiado(que);
        window.setTimeout(() => setCopiado(""), 1600);
      },
      () => setCopiado("")
    );
  };

  return (
    <div
      className="vxr"
      onKeyDown={(e) => {
        if ((e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "SELECT") return;
        if (e.code === "Space") {
          e.preventDefault();
          emitir(bloqueActual < 0 ? 0 : bloqueActual);
        }
        if (e.code === "ArrowRight") {
          e.preventDefault();
          saltar(1);
        }
        if (e.code === "ArrowLeft") {
          e.preventDefault();
          saltar(-1);
        }
        if (e.code === "Escape") parar();
      }}
    >
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
          {/* v437.0 · lo que la casa dice va en tu idioma; los cables, como se publicaron */}
          <span className="vxr-idioma-nota">
            {idiomaVoz(idioma).nativo} · los cables llegan en el idioma en que se publicaron
          </span>
          <span className="vxr-dur"> · {mmss(programa.duracionMs)}</span>
        </h2>

        {/* SUBTÍTULOS: la frase que suena, no un resumen de la frase */}
        <div className="vxr-captions" aria-live="polite">
          <p className="vxr-caption">
            {sonando && subtitulo ? subtitulo.texto : bloque?.texto ?? programa.bloques[0]?.texto}
          </p>
          <p className="vxr-caption-pie">
            {sonando && subtitulo
              ? `bloque ${bloqueActual + 1} de ${programa.bloques.length} · frase ${subtitulo.i + 1} de ${subtitulo.total}`
              : sonando
                ? `bloque ${bloqueActual + 1} de ${programa.bloques.length} · silencio`
                : bloque
                ? `bloque ${bloqueActual + 1} de ${programa.bloques.length}`
                : `${programa.bloques.length} bloques · ${programa.asuntos} asuntos`}
          </p>
        </div>

        <div className="vxr-controles">
          <button type="button" className="vxr-btn vxr-btn--play" onClick={() => emitir(continuarEn ?? 0)} aria-pressed={sonando}>
            {sonando ? "◼ Detener" : continuarEn !== null ? `▶ Continuar (bloque ${continuarEn + 1})` : "▶ Escuchar el programa"}
          </button>
          <button type="button" className="vxr-btn" onClick={pausar} disabled={!sonando}>
            <span aria-hidden="true">❙❙</span> Pausa
          </button>
          <button type="button" className="vxr-btn vxr-btn--salto" onClick={() => saltar(-1)} disabled={bloqueActual <= 0} aria-label="Bloque anterior" title="Bloque anterior (←)">
            <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true" focusable="false"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button type="button" className="vxr-btn vxr-btn--salto" onClick={() => saltar(1)} disabled={bloqueActual < 0 || bloqueActual >= programa.bloques.length - 1} aria-label="Bloque siguiente" title="Bloque siguiente (→)">
            <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true" focusable="false"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <span className="vxr-restante">{bloqueActual >= 0 ? `quedan ${mmss(restante)}` : `${mmss(total)} en total`}</span>
          <button type="button" className="vxr-btn vxr-btn--fantasma" onClick={() => copiar("guion")}>
            {copiado === "guion" ? "✓ Copiado" : "Copiar el guion"}
          </button>
          <button type="button" className="vxr-btn vxr-btn--fantasma" onClick={() => copiar("enlace")}>
            {copiado === "enlace" ? "✓ Copiado" : "Copiar mi radio"}
          </button>
        </div>

        {avisoPrincipal ? <p className="vxr-aviso">{avisoPrincipal}</p> : null}

        {/* RAIL: cuánto ocupa cada bloque; se salta con un clic */}
        <div className="vxr-rail" role="group" aria-label="Bloques del programa">
          {programa.bloques.map((b, i) => {
            const ms = msDe(b);
            return (
              <button
                key={b.id}
                type="button"
                className={i === bloqueActual ? "vxr-tramo vxr-tramo--activo" : i < bloqueActual ? "vxr-tramo vxr-tramo--oido" : "vxr-tramo"}
                style={{ flexGrow: Math.max(1, Math.round(ms / 1000)) }}
                onClick={() => emision.empezar(i)}
                title={`${b.tipo} · ${mmss(ms)}`}
                aria-label={`Ir al bloque ${i + 1}: ${b.tipo}`}
              />
            );
          })}
        </div>

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
                  {b.fuente}
                  {b.fuentes && b.fuentes.length > 1 ? ` +${b.fuentes.length - 1}` : ""} ↗
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
          Entiende seguimientos («cuéntame más», «la segunda») y cifras del archivo. Responde con los cables de la casa
          y cita la fuente. Si no hay nada sobre lo que preguntas, lo dice.
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
            placeholder="¿Qué pasa en Ucrania? · resumen · cuéntame más"
            autoComplete="off"
          />
          {micro ? (
            <button
              type="button"
              className={escuchando ? "vxr-btn vxr-btn--micro vxr-btn--escuchando" : "vxr-btn vxr-btn--micro"}
              onClick={hablar}
              aria-pressed={escuchando}
              title="Preguntar hablando (micrófono del aparato)"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false">
                <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3Z" fill="currentColor" />
                <path d="M5 11a7 7 0 0 0 14 0M12 18v3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {escuchando ? "Escucho…" : "Hablar"}
            </button>
          ) : null}
          <button type="submit" className="vxr-btn vxr-btn--play">Preguntar</button>
        </form>
        {siguientes.length > 0 ? (
          <div className="vxr-siguientes">
            <span>Puedes seguir con:</span>
            {siguientes.map((s) => (
              <button key={s} type="button" className="vxr-chip vxr-chip--seguir" onClick={() => preguntar(s)}>
                {s}
              </button>
            ))}
          </div>
        ) : null}
        <div className="vxr-hilo" aria-live="polite">
          {charla.length === 0 ? (
            <p className="vxr-vacio">Aún no le has preguntado nada.</p>
          ) : (
            charla.map((m, i) => (
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
        <div className="vxr-presets">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={
                ajustes.estilo === p.ajustes.estilo && ajustes.duracionMin === p.ajustes.duracionMin
                  ? "vxr-preset vxr-preset--activo"
                  : "vxr-preset"
              }
              onClick={() => guardar({ ...ajustes, ...p.ajustes })}
              title={p.detalle}
            >
              <strong>{p.nombre}</strong>
              <small>{p.detalle}</small>
            </button>
          ))}
        </div>
        <div className="vxr-grid">
          <label className="vxr-campo">
            <span>Estilo</span>
            <select value={ajustes.estilo} onChange={(e) => guardar({ ...ajustes, estilo: e.target.value as EstiloRadio })}>
              <option value="serena">Serena · informativa</option>
              <option value="cercana">Cercana · conversacional</option>
              <option value="filosa">Filosa · directa</option>
            </select>
          </label>

          <label className="vxr-campo">
            <span>Duración · {ajustes.duracionMin} min</span>
            <select value={ajustes.duracionMin} onChange={(e) => guardar({ ...ajustes, duracionMin: Number(e.target.value) })}>
              <option value={2}>2 minutos · lo esencial</option>
              <option value={5}>5 minutos · el día</option>
              <option value={10}>10 minutos · con detalle</option>
              <option value={15}>15 minutos · programa largo</option>
            </select>
          </label>

          <label className="vxr-campo">
            <span>Persona</span>
            <select
              value={ajustes.gustos.persona}
              onChange={(e) => guardar({ ...ajustes, gustos: { ...ajustes.gustos, persona: e.target.value as PersonaId } })}
            >
              {Object.keys(PERSONAS).map((p) => (
                <option key={p} value={p}>{PERSONAS[p as PersonaId].nombre} — {PERSONAS[p as PersonaId].lema}</option>
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
            <input type="range" min={0.7} max={1.3} step={0.05} value={ajustes.gustos.rate}
              onChange={(e) => guardar({ ...ajustes, gustos: { ...ajustes.gustos, rate: Number(e.target.value) } })} />
          </label>

          <label className="vxr-campo">
            <span>Tono · {ajustes.gustos.pitch.toFixed(2)}</span>
            <input type="range" min={0.7} max={1.3} step={0.05} value={ajustes.gustos.pitch}
              onChange={(e) => guardar({ ...ajustes, gustos: { ...ajustes.gustos, pitch: Number(e.target.value) } })} />
          </label>

          <label className="vxr-switch">
            <input type="checkbox" checked={ajustes.gustos.pausas}
              onChange={(e) => guardar({ ...ajustes, gustos: { ...ajustes.gustos, pausas: e.target.checked } })} />
            <span>Pausas naturales (respiración entre frases)</span>
          </label>

          <label className="vxr-switch">
            <input type="checkbox" checked={ajustes.conResumen} onChange={(e) => guardar({ ...ajustes, conResumen: e.target.checked })} />
            <span>Leer también el resumen, no solo el titular</span>
          </label>

          <label className="vxr-switch">
            <input type="checkbox" checked={ajustes.conFuentes} onChange={(e) => guardar({ ...ajustes, conFuentes: e.target.checked })} />
            <span>Decir cuántos medios firman cada asunto</span>
          </label>
        </div>
        <p className="vxr-nota">
          Todo se guarda en tu aparato; «Copiar mi radio» te da un enlace con estos ajustes. La voz la pone el sistema:
          si suena metálica, elige otra en la lista — la calidad de cada una está medida, no prometida. Atajos:
          espacio reproduce o para, ← → cambian de bloque, Esc detiene.
        </p>
      </section>
    </div>
  );
}

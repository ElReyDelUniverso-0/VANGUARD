"use client";

// ============================================================
// v367.2 LA VOZ MAESTRA — LA SALA (/voz)
//
// El Dueño pidió una voz que EXPLIQUE, que NAVEGUE, que AGUANTE una
// conversación larga y que sepa de geopolítica. Esto es la cara visible de
// esa voz: el orbe, el oído, la boca y el maestro, en una sala.
//
// Cuatro decisiones de esta sala:
//  ① EL TEXTO SIEMPRE ESTÁ. Si el aparato no puede hablar (sin voces, sin
//     permiso de micrófono), la respuesta se lee — la casa nunca se queda
//     muda porque el aparato no sepa hablar.
//  ② LA MEMORIA ES DEL PILOTO. Los últimos 12 turnos viajan con cada
//     pregunta (conversación larga de verdad) y viven en esta pestaña: no se
//     guardan en ningún servidor.
//  ③ LA BOCA RESPIRA. Texto → limpiar.ts → trocear → decir.ts (frases con
//     silencio real, cuatro personas, voz neuronal preferida).
//  ④ HONESTIDAD DEL APARATO. Si la mejor voz del teléfono es robótica, la
//     sala lo dice y explica cómo instalar una mejor — en vez de fingir que
//     suena humano.
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Square, Pause, Play, Send, Volume2, ChevronRight } from "lucide-react";
import {
  PERSONAS,
  GUSTOS_DEFECTO,
  avisosDelAparato,
  decir,
  escanearVoces,
  guardarGustos,
  leerGustos,
  pausarBoca,
  pararBoca,
  reanudarBoca,
  alCambiarBoca,
  type GustosVoz,
  type PersonaId,
  type VozDisponible,
} from "@/lib/voz/decir";

// ── tipos mínimos de la Web Speech API (sin dependencias) ──
interface SRItem {
  transcript: string;
}
interface SREvento {
  resultIndex: number;
  results: { length: number; [i: number]: { isFinal: boolean; [j: number]: SRItem } };
}
interface Reconocedor {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SREvento) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}
type CtorSR = new () => Reconocedor;

function ctorSR(): CtorSR | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: CtorSR; webkitSpeechRecognition?: CtorSR };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

interface Turno {
  rol: "piloto" | "casa";
  texto: string;
}

interface RespuestaApi {
  ok?: boolean;
  hablar?: string;
  error?: string;
  accion?: { tipo?: string; destino?: string; consulta?: string; ruta?: string };
  fuentes?: { titulo: string; fuente: string; fecha: string; ruta: string }[];
  modo?: string;
  tema?: string;
  seguir?: string[];
}

export function VozSala() {
  const router = useRouter();
  const [gustos, setGustos] = useState<GustosVoz>(GUSTOS_DEFECTO);
  const [persona, setPersona] = useState<PersonaId>("locutora");
  const [voces, setVoces] = useState<VozDisponible[]>([]);
  const [avisos, setAvisos] = useState<string[]>([]);
  const [entrada, setEntrada] = useState("");
  const [historial, setHistorial] = useState<Turno[]>([]);
  const [fuentes, setFuentes] = useState<RespuestaApi["fuentes"]>([]);
  const [seguir, setSeguir] = useState<string[]>([]);
  const [modo, setModo] = useState<string>("");
  const [cargando, setCargando] = useState(false);
  const [escuchando, setEscuchando] = useState(false);
  const [boca, setBoca] = useState<"quieta" | "hablando" | "pausada">("quieta");
  const [sinVoz, setSinVoz] = useState(false);
  const [rutaDestino, setRutaDestino] = useState<string>("");
  const srRef = useRef<Reconocedor | null>(null);
  const historialRef = useRef<Turno[]>([]);

  // ① preferencias del piloto + censo de voces del aparato (tras hidratar)
  useEffect(() => {
    const g = leerGustos();
    setGustos(g);
    setPersona(g.persona);
    const cargar = () => {
      const lista = escanearVoces("es");
      setVoces(lista);
      setAvisos(avisosDelAparato("es"));
      setSinVoz(lista.length === 0);
    };
    cargar();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = cargar;
    }
    const quitar = alCambiarBoca(setBoca);
    return () => {
      quitar();
      pararBoca();
      if ("speechSynthesis" in window) window.speechSynthesis.onvoiceschanged = null;
      try {
        srRef.current?.abort();
      } catch {
        /* noop */
      }
    };
  }, []);

  const guardar = useCallback((g: GustosVoz) => {
    setGustos(g);
    guardarGustos(g);
  }, []);

  const preguntar = useCallback(
    async (texto: string) => {
      const limpio = texto.trim();
      if (!limpio || cargando) return;
      pararBoca();
      setEntrada("");
      setCargando(true);
      setSeguir([]);
      const nuevoHistorial: Turno[] = [...historialRef.current, { rol: "piloto", texto: limpio }];
      setHistorial([...nuevoHistorial, { rol: "casa", texto: "…" }]);
      try {
        const r = await fetch("/api/maestro", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ texto: limpio, historial: historialRef.current.slice(-12) }),
        });
        const j = (await r.json()) as RespuestaApi;
        const respuesta = j.hablar || j.error || "No he podido responder.";
        // la memoria: se guarda el tema que el maestro dejó abierto
        const conTema: Turno[] = [
          ...nuevoHistorial,
          { rol: "casa", texto: respuesta },
          { rol: "casa", texto: `TEMA:${j.tema ?? ""}` },
        ];
        historialRef.current = conTema.filter((t) => !t.texto.startsWith("TEMA:"));
        setHistorial([...nuevoHistorial, { rol: "casa", texto: respuesta }]);
        setFuentes(j.fuentes ?? []);
        setSeguir(j.seguir ?? []);
        setModo(j.modo ?? "");
        const ruta = j.accion?.ruta && j.accion.ruta.startsWith("/") ? j.accion.ruta : "";
        setRutaDestino(ruta);
        // MANOS: si el piloto pidió «llévame a…», la casa obedece — pero
        // primero TERMINA de decirlo. Navegar a mitad de frase cortaba la
        // voz por el desmontaje de la sala: eso era un fallo, no una prisa.
        const dicho = decir(respuesta, {
          persona,
          gustos: { ...gustos, persona },
          onFin: ruta && j.modo === "navegar" ? () => router.push(ruta) : undefined,
        });
        if (!dicho) setSinVoz(true);
      } catch {
        setHistorial([
          ...nuevoHistorial,
          { rol: "casa", texto: "La casa no responde ahora mismo. No voy a inventarte una respuesta." },
        ]);
      } finally {
        setCargando(false);
      }
    },
    [cargando, gustos, persona, router],
  );

  // el micrófono: una frase por pulsación (honesto: sin escucha permanente)
  const alternarMicro = useCallback(() => {
    if (escuchando) {
      try {
        srRef.current?.stop();
      } catch {
        /* noop */
      }
      setEscuchando(false);
      return;
    }
    const Ctor = ctorSR();
    if (!Ctor) {
      setAvisos((a) => [
        ...a,
        "Este navegador no tiene reconocimiento de voz. Escribe: el maestro responde igual.",
      ]);
      return;
    }
    pararBoca();
    const sr = new Ctor();
    srRef.current = sr;
    sr.lang = "es-ES";
    sr.continuous = false;
    sr.interimResults = false;
    sr.onresult = (e) => {
      let texto = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal && res[0]) texto += res[0].transcript;
      }
      if (texto.trim()) void preguntar(texto);
    };
    sr.onend = () => setEscuchando(false);
    sr.onerror = () => setEscuchando(false);
    try {
      sr.start();
      setEscuchando(true);
    } catch {
      setEscuchando(false);
    }
  }, [escuchando, preguntar]);

  const probar = useCallback(() => {
    const frase = `${PERSONAS[persona].nombre}. ${PERSONAS[persona].lema}. Así suena la casa cuando habla de geopolítica: con pausas, con datos y con fuente.`;
    if (!decir(frase, { persona, gustos: { ...gustos, persona } })) setSinVoz(true);
  }, [persona, gustos]);

  const mejorVoz = voces[0];
  const etiquetaBoca = useMemo(() => {
    if (boca === "hablando") return "HABLANDO";
    if (boca === "pausada") return "EN PAUSA";
    return cargando ? "PENSANDO" : "EN ESCUCHA";
  }, [boca, cargando]);

  return (
    <div className="flex flex-col gap-5">
      {/* ── EL ORBE + LA BOCA ── */}
      <section className="rounded-md border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-400">
            LA VOZ MAESTRA · {etiquetaBoca}
            {modo ? <span className="ml-2 text-zinc-500">· {modo}</span> : null}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => (boca === "pausada" ? reanudarBoca() : pausarBoca())}
              disabled={boca === "quieta"}
              className="rounded-sm border border-zinc-700 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-zinc-300 disabled:opacity-30"
              title="Pausa / sigue"
            >
              {boca === "pausada" ? <Play size={12} /> : <Pause size={12} />}
            </button>
            <button
              type="button"
              onClick={() => pararBoca()}
              disabled={boca === "quieta"}
              className="rounded-sm border border-zinc-700 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-zinc-300 disabled:opacity-30"
              title="Calla"
            >
              <Square size={12} />
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={alternarMicro}
            className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border transition-colors ${
              escuchando
                ? "border-red-400/70 bg-red-500/20 text-red-300"
                : "border-amber-500/50 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
            }`}
            title={escuchando ? "Escuchando… pulsa para cortar" : "Habla"}
          >
            <Mic size={22} />
            {escuchando ? (
              <span className="absolute inset-0 animate-ping rounded-full border border-red-400/40" />
            ) : null}
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex gap-2">
              <input
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void preguntar(entrada);
                }}
                placeholder="Escríbele o háblale: «explícame el mar Rojo», «qué es la disuasión», «llévame a la crónica»…"
                className="min-w-0 flex-1 rounded-sm border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-[12px] text-zinc-200 outline-none focus:border-amber-hud"
              />
              <button
                type="button"
                onClick={() => void preguntar(entrada)}
                disabled={cargando || !entrada.trim()}
                className="rounded-sm border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-amber-300 disabled:opacity-30"
                title="Preguntar"
              >
                <Send size={14} />
              </button>
            </div>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-600">
              {sinVoz
                ? "SIN BOCA EN ESTE APARATO · todo se lee en pantalla (la casa no finge hablar)"
                : mejorVoz
                  ? `BOCA · ${mejorVoz.nombre} (${mejorVoz.nota})`
                  : "BOCA · cargando las voces del aparato…"}
            </p>
          </div>
        </div>
      </section>

      {/* ── AVISOS HONESTOS DEL APARATO ── */}
      {avisos.length > 0 ? (
        <ul className="flex flex-col gap-1 rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
          {avisos.map((a) => (
            <li key={a} className="font-mono text-[10px] leading-relaxed text-zinc-400">
              ⚠ {a}
            </li>
          ))}
        </ul>
      ) : null}

      {/* ── LAS CUATRO PERSONAS ── */}
      <section className="rounded-md border border-zinc-800 bg-zinc-900/40 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber/70">
          LAS CUATRO VOCES DE LA CASA · elige con quién hablas
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {(Object.keys(PERSONAS) as PersonaId[]).map((id) => {
            const p = PERSONAS[id];
            const activa = persona === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setPersona(id);
                  guardar({ ...gustos, persona: id });
                  pararBoca();
                  decir(`Soy ${p.nombre.toLowerCase()}. ${p.lema}.`, {
                    persona: id,
                    gustos: { ...gustos, persona: id },
                  });
                }}
                className={`rounded-sm border px-3 py-2 text-left transition-colors ${
                  activa
                    ? "border-amber-500/60 bg-amber-500/15"
                    : "border-zinc-800 bg-zinc-950/50 hover:border-amber-hud"
                }`}
              >
                <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-100">
                  {p.nombre}
                </p>
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500">
                  {p.lema} · velocidad {p.rate.toFixed(2)} · tono {p.pitch.toFixed(2)}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-zinc-400">
            VELOCIDAD
            <input
              type="range"
              min={0.7}
              max={1.3}
              step={0.05}
              value={gustos.rate}
              onChange={(e) => guardar({ ...gustos, rate: Number(e.target.value) })}
              className="w-24 accent-amber-400"
            />
          </label>
          <label className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-zinc-400">
            TONO
            <input
              type="range"
              min={0.7}
              max={1.3}
              step={0.05}
              value={gustos.pitch}
              onChange={(e) => guardar({ ...gustos, pitch: Number(e.target.value) })}
              className="w-24 accent-amber-400"
            />
          </label>
          <label className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-zinc-400">
            <input
              type="checkbox"
              checked={gustos.pausas}
              onChange={(e) => guardar({ ...gustos, pausas: e.target.checked })}
              className="accent-amber-400"
            />
            PAUSAS
          </label>
          <button
            type="button"
            onClick={probar}
            className="ml-auto inline-flex items-center gap-2 rounded-sm border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest text-amber-300"
          >
            <Volume2 size={12} /> probar esta voz
          </button>
        </div>

        {voces.length > 1 ? (
          <div className="mt-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500">
              VOCES INSTALADAS EN TU APARATO (la casa elige la mejor; puedes forzar otra)
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => guardar({ ...gustos, vozURI: null })}
                className={`rounded-sm border px-2 py-1 font-mono text-[9px] uppercase tracking-widest ${
                  gustos.vozURI === null
                    ? "border-amber-500/60 text-amber-300"
                    : "border-zinc-700 text-zinc-400"
                }`}
              >
                AUTOMÁTICA
              </button>
              {voces.slice(0, 8).map((v) => (
                <button
                  key={v.uri}
                  type="button"
                  title={v.nota}
                  onClick={() => guardar({ ...gustos, vozURI: v.uri })}
                  className={`rounded-sm border px-2 py-1 font-mono text-[9px] uppercase tracking-widest ${
                    gustos.vozURI === v.uri
                      ? "border-amber-500/60 text-amber-300"
                      : "border-zinc-700 text-zinc-400"
                  }`}
                >
                  {v.nombre.slice(0, 22)} · {v.calidad}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {/* ── LA CONVERSACIÓN (larga, con memoria) ── */}
      <section className="rounded-md border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber/70">
            CONVERSACIÓN · {historial.length} turnos (memoria del aparato)
          </p>
          {historial.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                setHistorial([]);
                historialRef.current = [];
                setFuentes([]);
                setSeguir([]);
                setModo("");
                pararBoca();
              }}
              className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 hover:text-red-300"
            >
              empezar de cero
            </button>
          ) : null}
        </div>

        {historial.length === 0 ? (
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Pregúntale lo que quieras de geopolítica: un teatro, un concepto, el parte del día. Y
            síguela — «dame un ejemplo», «¿por qué?», «sigue» — que la memoria aguanta la
            conversación.
          </p>
        ) : (
          <div className="mt-3 flex max-h-[420px] flex-col gap-3 overflow-y-auto pr-1">
            {historial.map((t, i) =>
              t.texto.startsWith("TEMA:") ? null : (
                <div
                  key={`${t.rol}-${i}`}
                  className={`rounded-sm border px-3 py-2 ${
                    t.rol === "piloto"
                      ? "border-zinc-700 bg-zinc-950/60"
                      : "border-amber-500/25 bg-amber-500/5"
                  }`}
                >
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">
                    {t.rol === "piloto" ? "TÚ" : "LA CASA"}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                    {t.texto}
                  </p>
                </div>
              ),
            )}
          </div>
        )}

        {seguir.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {seguir.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => void preguntar(s)}
                className="inline-flex items-center gap-1 rounded-sm border border-zinc-700 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-zinc-300 hover:border-amber-hud hover:text-amber"
              >
                {s} <ChevronRight size={10} />
              </button>
            ))}
          </div>
        ) : null}

        {rutaDestino ? (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => {
                pararBoca();
                router.push(rutaDestino);
              }}
              className="inline-flex items-center gap-1 rounded-sm border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest text-amber-300 hover:bg-amber-500/20"
            >
              IR A LA SALA {rutaDestino} <ChevronRight size={10} />
            </button>
          </div>
        ) : null}

        {fuentes && fuentes.length > 0 ? (
          <div className="mt-3 border-t border-zinc-800 pt-2">
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">
              FUENTES DE ESTA RESPUESTA
            </p>
            <ul className="mt-1 flex flex-col gap-0.5">
              {fuentes.map((f, i) => (
                <li key={`${f.titulo}-${i}`} className="font-mono text-[9px] leading-relaxed text-zinc-500">
                  · {f.fuente} · {f.fecha} — {f.titulo.slice(0, 80)}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-600">
        El maestro no inventa: si el archivo no trae señal, lo dice. Las cifras salen del archivo
        real de la casa y la memoria de la conversación no sale de tu aparato.
      </p>
    </div>
  );
}

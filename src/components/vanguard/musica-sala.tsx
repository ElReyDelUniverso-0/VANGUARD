"use client";

// ============================================================
// v367.4 LA SALA DE MÚSICA — AHORA CON MÚSICA DE VERDAD (/musica)
//
// Orden del Dueño, textual: «copia la música que agregaste, es horrible;
// busca música, agrégala… no crees nada nuevo».
//
// Pues eso. El orden de la sala cambia y la música sintetizada baja al
// sótano, donde debe estar:
//
//  ① MÚSICA REAL — trece pistas de verdad (bandas militares, orquestas de
//     1910, un tenor de los treinta, una grabación de campo), todas de
//     dominio público o CC0, con su licencia y su fuente a la vista y su
//     enlace comprobado el 2026-11-12. Se sirven desde archive.org: la casa
//     no aloja ni un byte de audio ajeno.
//  ② LA RADIO DE CONFLICTO — emisoras reales comprobadas + la radio de la
//     casa (ambiente sintetizado y boletín leído del archivo real).
//  ③ LOS SONIDOS DE GUERRA — sirena, morse, estática, explosión, radar,
//     helicóptero y tambor.
//  ④ EL TALLER DE LA CASA — el motor de composición de la v367.3, plegado y
//     declarado como lo que es: un taller de experimentos. No se borra (regla
//     de la casa), pero deja de ser lo primero que suena.
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Play, Square, Radio, Volume2, VolumeX } from "lucide-react";
import {
  ETIQUETA_CATEGORIA,
  MUSICA_REAL,
  cuentaMusicaReal,
  minutos,
  type CategoriaMusica,
  type PistaReal,
} from "@/lib/musica/catalogo";
import { SELLO, armarForma, duracionLegible, duracionPieza, type Pieza } from "@/lib/musica/forma";
import { HIMNO, MUSICA_CASA } from "@/lib/musica/piezas";
import { alCambiarMotor, pararMusica, setVolumen, tocar, type EstadoMotor } from "@/lib/musica/motor";
import {
  NOMBRE_TEATRO,
  RADIOS_CASA,
  cuentaVerificadas,
  emisorasDeTeatro,
  radioCasaDe,
  type Emisora,
} from "@/lib/musica/radios";
import { arrancarAmbiente, ambienteSonando, efecto, pararAmbiente, type Efecto } from "@/lib/musica/efectos";
import { decir, pararBoca, type PersonaId } from "@/lib/voz/decir";

interface Cable {
  titulo: string;
  fuente: string;
}
interface TeatroCronica {
  tag: string;
  hoy: number;
  semana: number;
  ultimo: Cable | null;
}
interface ParteCronica {
  ok: boolean;
  teatros: TeatroCronica[];
  medios: { medio: string; n: number }[];
  nota: string;
}

const SONIDOS: { id: Efecto; nombre: string; nota: string }[] = [
  { id: "sirena", nombre: "SIRENA", nota: "alerta aérea, 4 s" },
  { id: "morse", nombre: "MORSE", nota: "«VG» en código" },
  { id: "estatica", nombre: "ESTÁTICA", nota: "radio mal sintonizada" },
  { id: "explosion", nombre: "EXPLOSIÓN", nota: "lejana, grabe" },
  { id: "radar", nombre: "RADAR", nota: "dos pings" },
  { id: "helicoptero", nombre: "HELICÓPTERO", nota: "palas, 1 s" },
  { id: "tambor", nombre: "TAMBOR", nota: "marcha, un golpe" },
];

const ORDEN: CategoriaMusica[] = ["marcha", "orquesta", "voz", "ambiente"];

export function MusicaSala() {
  // ── música real ──
  const [pista, setPista] = useState<PistaReal | null>(null);
  const [sonandoReal, setSonandoReal] = useState(false);
  const [avisoPista, setAvisoPista] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── radio ──
  const [teatro, setTeatro] = useState("ukraine");
  const [emisora, setEmisora] = useState<Emisora | null>(null);
  const [radioCasa, setRadioCasa] = useState(false);
  const [boletin, setBoletin] = useState("");
  const [aviso, setAviso] = useState("");
  const [parte, setParte] = useState<ParteCronica | null>(null);
  const audioRadio = useRef<HTMLAudioElement | null>(null);
  const relojRef = useRef<number | null>(null);

  // ── taller (motor sintetizado, plegado) ──
  const [motor, setMotor] = useState<EstadoMotor>({ sonando: null, compas: 0, seccion: "—", vuelta: 0 });
  const [vol, setVol] = useState(0.42);
  const [mudo, setMudo] = useState(false);

  useEffect(() => alCambiarMotor(setMotor), []);

  useEffect(() => {
    let vivo = true;
    fetch("/api/cronica", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: ParteCronica) => {
        if (vivo) setParte(j);
      })
      .catch(() => {
        if (vivo) setParte(null);
      });
    return () => {
      vivo = false;
      pararMusica(false);
      pararAmbiente();
      pararBoca();
      if (audioRef.current) audioRef.current.pause();
      if (audioRadio.current) audioRadio.current.pause();
      if (relojRef.current) window.clearInterval(relojRef.current);
    };
  }, []);

  const apagarTodo = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (audioRadio.current) {
      audioRadio.current.pause();
      audioRadio.current.src = "";
      audioRadio.current = null;
    }
    pararAmbiente();
    pararBoca();
    pararMusica();
    if (relojRef.current) {
      window.clearInterval(relojRef.current);
      relojRef.current = null;
    }
    setSonandoReal(false);
    setEmisora(null);
    setRadioCasa(false);
  }, []);

  const ponerPista = useCallback(
    (p: PistaReal) => {
      apagarTodo();
      setAvisoPista("");
      setPista(p);
      const a = new Audio(p.url);
      a.volume = 0.7;
      audioRef.current = a;
      a.addEventListener("playing", () => setSonandoReal(true));
      a.addEventListener("ended", () => setSonandoReal(false));
      a.addEventListener("error", () => {
        setSonandoReal(false);
        setAvisoPista(
          `«${p.nombre}» no ha abierto desde tu aparato. La ficha sigue ahí (${p.fuente}) para escucharla en el navegador. Puede que archive.org esté saturado: prueba otra pista o la radio de la casa.`,
        );
      });
      void a.play().catch(() =>
        setAvisoPista("El navegador ha bloqueado el sonido: vuelve a pulsar la pista (exigen un toque)."),
      );
    },
    [apagarTodo],
  );

  const pararPista = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    setSonandoReal(false);
  }, []);

  // ── radio ──
  const encenderEmisora = useCallback(
    (e: Emisora) => {
      apagarTodo();
      setAviso("");
      setEmisora(e);
      const a = new Audio(e.url);
      a.volume = 0.65;
      audioRadio.current = a;
      const vigilante = window.setTimeout(() => {
        if (a.readyState === 0 && audioRadio.current === a) {
          setAviso(
            `«${e.nombre}» no ha abierto en 6 segundos desde tu aparato. Enciende la RADIO DE LA CASA: siempre suena.`,
          );
        }
      }, 6000);
      a.addEventListener("playing", () => {
        window.clearTimeout(vigilante);
        setAviso("");
      });
      a.addEventListener("error", () => {
        window.clearTimeout(vigilante);
        setAviso(`«${e.nombre}» no responde desde tu aparato. Abajo está la RADIO DE LA CASA.`);
      });
      void a.play().catch(() => setAviso("El navegador ha bloqueado la radio: vuelve a pulsar (exigen un toque)."));
    },
    [apagarTodo],
  );

  const encenderRadioCasa = useCallback(() => {
    apagarTodo();
    const cfg = radioCasaDe(teatro);
    if (!cfg) return;
    arrancarAmbiente(cfg.ambiente);
    setRadioCasa(true);
    const t = parte?.teatros.find((x) => x.tag === teatro);
    const nombre = NOMBRE_TEATRO[teatro] ?? teatro;
    let texto: string;
    if (!parte) {
      texto = "Radio de la casa. No he podido leer el archivo ahora mismo, así que solo te doy el ambiente: no te invento un boletín.";
    } else if (!t || (t.semana === 0 && !t.ultimo)) {
      texto = `Radio de la casa, boletín de ${nombre}. El archivo no registra cables de este teatro en la ventana medida. Te lo digo tal cual: hoy esta frecuencia está en silencio.`;
    } else {
      const ultimo = t.ultimo ? ` Último cable, firmado por ${t.ultimo.fuente}: ${t.ultimo.titulo}.` : "";
      texto = `Radio de la casa, boletín de ${nombre}. El archivo registra ${t.semana} cables en la ventana de siete días y ${t.hoy} en las últimas veinticuatro horas.${ultimo} Esto es lo que hay, ni más ni menos.`;
    }
    setBoletin(texto);
    decir(texto, { persona: "cronista" as PersonaId });
    relojRef.current = window.setInterval(() => decir(texto, { persona: "cronista" as PersonaId }), 45000);
  }, [teatro, parte, apagarTodo]);

  const alternarPieza = useCallback(
    (p: Pieza) => {
      apagarTodo();
      if (motor.sonando === p.id) return;
      const ok = tocar(p.id, { volumen: mudo ? 0 : vol });
      if (!ok) setAvisoPista("Este aparato no deja crear sonido (o el navegador lo bloquea).");
    },
    [motor.sonando, mudo, vol, apagarTodo],
  );

  const cuadroHimno = useMemo(() => armarForma(HIMNO), []);
  const verificadas = cuentaVerificadas();
  const musica = cuentaMusicaReal();
  const listaEmisoras = emisorasDeTeatro(teatro);
  const cfgCasa = radioCasaDe(teatro);

  return (
    <div className="flex flex-col gap-5">
      {/* ══════════ ① MÚSICA REAL ══════════ */}
      <section className="rounded-md border border-amber-500/40 bg-amber-500/5 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-400">
              MÚSICA REAL · {musica.total} PISTAS · DOMINIO PÚBLICO Y CC0
            </p>
            <h2 className="mt-1 text-xl font-bold text-zinc-100">Lo que suena de verdad</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Bandas militares, orquestas de 1910, un tenor de los años treinta y una grabación de
              campo. Música hecha por otros, copiada exactamente, con su licencia a la vista.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-zinc-400">
              {mudo ? <VolumeX size={12} /> : <Volume2 size={12} />}
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={vol}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setVol(v);
                  setMudo(v === 0);
                  setVolumen(v);
                  if (audioRef.current) audioRef.current.volume = v;
                  if (audioRadio.current) audioRadio.current.volume = v;
                }}
                className="w-20 accent-amber-400"
              />
            </label>
            {sonandoReal || emisora || radioCasa ? (
              <button
                type="button"
                onClick={apagarTodo}
                className="inline-flex items-center gap-1 rounded-sm border border-red-500/40 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-red-300"
              >
                <Square size={11} /> silencio
              </button>
            ) : null}
          </div>
        </div>

        {pista && sonandoReal ? (
          <p className="mt-3 rounded-sm border border-amber-500/30 bg-zinc-950/60 px-2 py-1 font-mono text-[10px] text-amber-200">
            ▸ SUENA: {pista.nombre} — {pista.autor} · {pista.licencia}
          </p>
        ) : null}

        {avisoPista ? (
          <p className="mt-2 rounded-sm border border-amber-500/30 bg-zinc-950/60 px-2 py-1 font-mono text-[9px] leading-relaxed text-amber-200">
            ⚠ {avisoPista}
          </p>
        ) : null}

        <div className="mt-4 flex flex-col gap-4">
          {ORDEN.map((cat) => {
            const lista = MUSICA_REAL.filter((p) => p.categoria === cat);
            if (lista.length === 0) return null;
            return (
              <div key={cat}>
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">
                  {ETIQUETA_CATEGORIA[cat]} · {lista.length}
                </p>
                <div className="mt-2 grid gap-2">
                  {lista.map((p) => {
                    const activa = pista?.id === p.id && sonandoReal;
                    return (
                      <div
                        key={p.id}
                        className={`rounded-sm border px-3 py-2 ${activa ? "border-amber-500/60 bg-amber-500/10" : "border-zinc-800 bg-zinc-950/40"}`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-100">
                              {p.nombre} <span className="text-zinc-500">· {minutos(p.duracionSeg)}</span>
                            </p>
                            <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-zinc-500">
                              {p.autor} · {p.licencia}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => (activa ? pararPista() : ponerPista(p))}
                              className="inline-flex items-center gap-1 rounded-sm border border-zinc-700 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-zinc-200 hover:border-amber-hud hover:text-amber"
                            >
                              {activa ? <Square size={11} /> : <Play size={11} />}
                              {activa ? "parar" : "escuchar"}
                            </button>
                            <a
                              href={p.fuente}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-sm border border-zinc-800 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-zinc-500 hover:text-zinc-300"
                              title="Ficha original en archive.org (fuente y licencia)"
                            >
                              fuente
                            </a>
                          </div>
                        </div>
                        <p className="mt-1 font-mono text-[9px] leading-relaxed text-zinc-600">{p.descripcion}</p>
                        <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-zinc-700">
                          enlace comprobado {p.comprobada} · HTTP {p.http} · audio/mpeg
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-3 font-mono text-[9px] leading-relaxed text-zinc-600">
          Todas son de dominio público o CC0: se pueden escuchar sin permiso de nadie y la licencia
          está escrita en cada ficha. El audio se sirve desde archive.org — la casa no aloja ni un
          byte de música ajena. Las canciones modernas con derechos (Terranova, «Tu locura es mi
          ciencia») NO se pueden enlazar ni copiar, y aquí no se finge que sí.
        </p>
      </section>

      {/* ══════════ ② LA RADIO ══════════ */}
      <section className="rounded-md border border-zinc-800 bg-zinc-900/40 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber/70">
          RADIO DE CONFLICTO · {verificadas.verificadas} emisoras reales comprobadas de {verificadas.total}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {RADIOS_CASA.map((r) => (
            <button
              key={r.teatro}
              type="button"
              onClick={() => setTeatro(r.teatro)}
              className={`rounded-sm border px-2 py-1 font-mono text-[9px] uppercase tracking-widest ${
                teatro === r.teatro
                  ? "border-amber-500/60 text-amber-300"
                  : "border-zinc-700 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {NOMBRE_TEATRO[r.teatro] ?? r.teatro}
            </button>
          ))}
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {listaEmisoras.length === 0 ? (
            <p className="font-mono text-[10px] leading-relaxed text-zinc-500">
              Para este teatro no hay emisora real comprobada. La casa no inventa diales: usa la RADIO
              DE LA CASA, que se fabrica aquí mismo.
            </p>
          ) : (
            listaEmisoras.map((e) => (
              <div
                key={e.id}
                className={`rounded-sm border px-3 py-2 ${emisora?.id === e.id ? "border-amber-500/50 bg-amber-500/10" : "border-zinc-800 bg-zinc-950/40"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-100">{e.nombre}</p>
                    <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500">
                      {e.pais} · {e.idioma} ·{" "}
                      <span className={e.verificada === "SIN VERIFICAR" ? "text-red-300" : "text-emerald-300"}>
                        {e.verificada === "SIN VERIFICAR" ? "sin verificar" : `comprobada ${e.verificada}`}
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => encenderEmisora(e)}
                    className="inline-flex items-center gap-1 rounded-sm border border-zinc-700 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-zinc-300 hover:border-amber-hud hover:text-amber"
                  >
                    <Radio size={11} /> sintonizar
                  </button>
                </div>
                <p className="mt-1 font-mono text-[9px] leading-relaxed text-zinc-600">{e.nota}</p>
              </div>
            ))
          )}
        </div>

        {cfgCasa ? (
          <div className="mt-3 rounded-sm border border-amber-500/30 bg-amber-500/5 px-3 py-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-widest text-amber-300">
                  {cfgCasa.nombre} · {cfgCasa.dial} FM
                </p>
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500">
                  ambiente sintetizado + boletín leído del archivo real · no depende de nadie
                </p>
              </div>
              <button
                type="button"
                onClick={encenderRadioCasa}
                className="inline-flex items-center gap-1 rounded-sm border border-amber-500/50 bg-amber-500/10 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-amber-200"
              >
                <Radio size={11} /> {radioCasa ? "repetir boletín" : "encender"}
              </button>
            </div>
            {radioCasa && boletin ? (
              <p className="mt-2 whitespace-pre-wrap font-mono text-[10px] leading-relaxed text-zinc-300">{boletin}</p>
            ) : null}
          </div>
        ) : null}

        {aviso ? (
          <p className="mt-2 rounded-sm border border-amber-500/30 bg-amber-500/5 px-2 py-1 font-mono text-[9px] leading-relaxed text-amber-200">
            ⚠ {aviso}
          </p>
        ) : null}
      </section>

      {/* ══════════ ③ SONIDOS DE GUERRA ══════════ */}
      <section className="rounded-md border border-zinc-800 bg-zinc-900/40 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber/70">
          SONIDOS DE GUERRA · sintetizados aquí
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SONIDOS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => efecto(s.id, 0.6)}
              className="rounded-sm border border-zinc-800 bg-zinc-950/50 px-2 py-2 text-left hover:border-amber-hud"
            >
              <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-200">{s.nombre}</p>
              <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-zinc-500">{s.nota}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ══════════ ④ EL TALLER (plegado) ══════════ */}
      <details className="rounded-md border border-zinc-800 bg-zinc-900/40 p-4">
        <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
          EL TALLER DE LA CASA · composición sintetizada (v367.3) — plegado
        </summary>
        <p className="mt-2 font-mono text-[9px] leading-relaxed text-zinc-600">
          Aquí está el motor de composición que se hizo en la ronda anterior: himno, tributos de pulso
          y marchas fabricadas con osciladores. Se queda como taller de experimentos y NO se borra
          (regla de la casa), pero ya no es lo primero que suena: arriba está la música de verdad.
        </p>

        <div className="mt-3 rounded-sm border border-amber-500/30 bg-amber-500/5 px-3 py-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-amber-300">
                HIMNO DEL TALLER · {HIMNO.nombre}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500">
                {HIMNO.bpm} bpm · {duracionLegible(duracionPieza(HIMNO))} · sección{" "}
                <b className="text-amber-300">{motor.sonando === HIMNO.id ? motor.seccion : "—"}</b> · sello{" "}
                {SELLO.join("·")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => alternarPieza(HIMNO)}
              className="inline-flex items-center gap-1 rounded-sm border border-amber-500/50 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-amber-200"
            >
              {motor.sonando === HIMNO.id ? <Square size={11} /> : <Play size={11} />}
              {motor.sonando === HIMNO.id ? "silencio" : "tocar"}
            </button>
          </div>
          <div className="mt-2 flex gap-1">
            {cuadroHimno.map((c) => (
              <div
                key={c.idx}
                className={`h-1.5 flex-1 rounded-sm ${
                  motor.sonando === HIMNO.id && motor.compas === c.idx
                    ? "bg-amber-400"
                    : c.nombre === "A" || c.nombre === "A2"
                      ? "bg-amber-500/40"
                      : c.nombre === "B"
                        ? "bg-sky-500/40"
                        : "bg-zinc-700"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-2 grid gap-1.5">
          {MUSICA_CASA.filter((p) => p.familia !== "himno").map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-zinc-800 bg-zinc-950/40 px-2 py-1.5"
            >
              <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-400">
                {p.nombre} · {p.bpm} bpm · {p.familia}
              </p>
              <button
                type="button"
                onClick={() => alternarPieza(p)}
                className="rounded-sm border border-zinc-700 px-2 py-0.5 font-mono text-[8px] uppercase tracking-widest text-zinc-400 hover:text-amber"
              >
                {motor.sonando === p.id ? "parar" : "tocar"}
              </button>
            </div>
          ))}
        </div>
      </details>

      <p className="font-mono text-[9px] uppercase leading-relaxed tracking-[0.12em] text-zinc-600">
        Arriba, música real con licencia libre. Abajo, el taller de la casa. Ninguna canción con
        derechos se copia aquí.
      </p>
    </div>
  );
}

export default MusicaSala;

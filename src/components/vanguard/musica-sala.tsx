"use client";

// ============================================================
// v367.3 LA MÚSICA CON FORMA — LA SALA (/musica)
//
// Todo lo que el Dueño pidió en una sola mesa:
//  · EL HIMNO de la casa (60-90 s, sello de 4 notas, forma A-B-A).
//  · LAS PIEZAS con forma de verdad (tributos de PULSO — ritmo prestado,
//    melodía original — y música militar sintetizada aquí).
//  · LA RADIO DE CONFLICTO: emisoras reales comprobadas + LA RADIO DE LA
//    CASA (ambiente sintetizado y boletín leído del archivo real). Si la
//    emisora real no abre en 6 segundos, la casa lo dice y ofrece su radio.
//  · LOS SONIDOS DE GUERRA: sirena, morse, estática, explosión, radar,
//    helicóptero y tambor — sintetizados, cero archivos.
//
// El audio nunca sale del aparato y nada se descarga: se fabrica con
// osciladores. Por eso no hay copia posible ni factura de licencias.
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Play, Square, Radio, Volume2, VolumeX, Music2, ShieldAlert } from "lucide-react";
import {
  SELLO,
  armarForma,
  duracionLegible,
  duracionPieza,
  type Pieza,
} from "@/lib/musica/forma";
import { HIMNO, MUSICA_CASA } from "@/lib/musica/piezas";
import {
  alCambiarMotor,
  pararMusica,
  setVolumen,
  tocar,
  type EstadoMotor,
} from "@/lib/musica/motor";
import {
  EMISORAS,
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

const FAMILIA: Record<Pieza["familia"], { etiqueta: string; clase: string }> = {
  himno: { etiqueta: "HIMNO", clase: "border-amber-500/60 text-amber-300" },
  tributo: { etiqueta: "TRIBUTO DE PULSO", clase: "border-sky-500/40 text-sky-300" },
  militar: { etiqueta: "MILITAR", clase: "border-red-500/40 text-red-300" },
  casa: { etiqueta: "DE LA CASA", clase: "border-zinc-600 text-zinc-300" },
};

export function MusicaSala() {
  const [motor, setMotor] = useState<EstadoMotor>({ sonando: null, compas: 0, seccion: "—", vuelta: 0 });
  const [vol, setVol] = useState(0.42);
  const [mudo, setMudo] = useState(false);
  const [teatro, setTeatro] = useState("ukraine");
  const [emisora, setEmisora] = useState<Emisora | null>(null);
  const [radioCasa, setRadioCasa] = useState(false);
  const [boletin, setBoletin] = useState("");
  const [aviso, setAviso] = useState("");
  const [parte, setParte] = useState<ParteCronica | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const relojRef = useRef<number | null>(null);

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
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (relojRef.current) window.clearInterval(relojRef.current);
    };
  }, []);

  const cuadroHimno = useMemo(() => armarForma(HIMNO), []);
  const seccionActual = motor.sonando === HIMNO.id ? motor.seccion : "—";

  const alternarPieza = useCallback(
    (p: Pieza) => {
      cerrarRadio();
      if (motor.sonando === p.id) {
        pararMusica();
        return;
      }
      const ok = tocar(p.id, { volumen: mudo ? 0 : vol });
      if (!ok) setAviso("Este aparato no deja crear sonido (o el navegador lo bloquea). No se finge música.");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [motor.sonando, mudo, vol],
  );

  const cerrarRadio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    pararAmbiente();
    pararBoca();
    if (relojRef.current) {
      window.clearInterval(relojRef.current);
      relojRef.current = null;
    }
    setEmisora(null);
    setRadioCasa(false);
  }, []);

  const encenderEmisora = useCallback((e: Emisora) => {
    pararMusica();
    pararAmbiente();
    pararBoca();
    setRadioCasa(false);
    setAviso("");
    setEmisora(e);
    const a = new Audio(e.url);
    a.volume = 0.65;
    audioRef.current = a;
    const vigilante = window.setTimeout(() => {
      if (a.readyState === 0 && audioRef.current === a) {
        setAviso(
          `«${e.nombre}» no ha abierto en 6 segundos desde tu aparato (puede estar caída o bloqueada). Enciende la RADIO DE LA CASA: siempre suena.`,
        );
      }
    }, 6000);
    a.addEventListener("playing", () => {
      window.clearTimeout(vigilante);
      setAviso("");
    });
    a.addEventListener("error", () => {
      window.clearTimeout(vigilante);
      setAviso(`«${e.nombre}» no responde desde tu aparato. Abajo está la RADIO DE LA CASA, que no depende de nadie.`);
    });
    void a.play().catch(() => {
      setAviso(
        `El navegador ha bloqueado el audio de «${e.nombre}». Pulsa otra vez el botón (los navegadores exigen un toque).`,
      );
    });
  }, []);

  /** LA RADIO DE LA CASA: ambiente sintetizado + boletín leído del archivo real. */
  const encenderRadioCasa = useCallback(() => {
    pararMusica();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setEmisora(null);
    }
    const cfg = radioCasaDe(teatro);
    if (!cfg) return;
    arrancarAmbiente(cfg.ambiente);
    setRadioCasa(true);
    setAviso("");

    const t = parte?.teatros.find((x) => x.tag === teatro);
    const nombre = NOMBRE_TEATRO[teatro] ?? teatro;
    let texto: string;
    if (!parte) {
      texto = `Radio de la casa. No he podido leer el archivo ahora mismo, así que solo te doy el ambiente: no te invento un boletín.`;
    } else if (!t || (t.semana === 0 && !t.ultimo)) {
      texto = `Radio de la casa, boletín de ${nombre}. El archivo no registra cables de este teatro en la ventana medida. Te lo digo tal cual: hoy esta frecuencia está en silencio.`;
    } else {
      const ultimo = t.ultimo
        ? ` Último cable, firmado por ${t.ultimo.fuente}: ${t.ultimo.titulo}.`
        : "";
      texto = `Radio de la casa, boletín de ${nombre}. El archivo registra ${t.semana} cables en la ventana de siete días y ${t.hoy} en las últimas veinticuatro horas.${ultimo} Esto es lo que hay, ni más ni menos.`;
    }
    setBoletin(texto);
    decir(texto, { persona: "cronista" as PersonaId });
    if (relojRef.current) window.clearInterval(relojRef.current);
    // repite el boletín cada 45 s (radio de verdad: el parte vuelve)
    relojRef.current = window.setInterval(() => {
      decir(texto, { persona: "cronista" as PersonaId });
    }, 45000);
  }, [teatro, parte]);

  const cambiarVolumen = useCallback(
    (v: number) => {
      setVol(v);
      setMudo(v === 0);
      setVolumen(v);
      if (audioRef.current) audioRef.current.volume = Math.min(1, v * 1.5);
    },
    [],
  );

  const verificadas = cuentaVerificadas();
  const listaEmisoras = emisorasDeTeatro(teatro);
  const cfgCasa = radioCasaDe(teatro);

  return (
    <div className="flex flex-col gap-5">
      {/* ── EL HIMNO ── */}
      <section className="rounded-md border border-amber-500/40 bg-amber-500/5 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-400">
              EL HIMNO DE VANGUARD
            </p>
            <h2 className="mt-1 text-xl font-bold text-zinc-100">{HIMNO.nombre}</h2>
            <p className="mt-1 text-sm text-zinc-400">{HIMNO.lema}</p>
          </div>
          <button
            type="button"
            onClick={() => alternarPieza(HIMNO)}
            className="inline-flex items-center gap-2 rounded-sm border border-amber-500/60 bg-amber-500/15 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-amber-200 hover:bg-amber-500/25"
          >
            {motor.sonando === HIMNO.id ? <Square size={13} /> : <Play size={13} />}
            {motor.sonando === HIMNO.id ? "silencio" : "tocar el himno"}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">
          <span>{HIMNO.bpm} bpm</span>
          <span>·</span>
          <span>{duracionLegible(duracionPieza(HIMNO))}</span>
          <span>·</span>
          <span>sección: <b className="text-amber-300">{seccionActual}</b></span>
          <span>·</span>
          <span>vuelta {motor.vuelta + 1}</span>
        </div>

        {/* la forma, a la vista: esto es lo que impide que la pieza se deforme */}
        <div className="mt-3 flex gap-1">
          {cuadroHimno.map((c) => (
            <div
              key={c.idx}
              title={`compás ${c.idx + 1} · sección ${c.nombre}`}
              className={`h-2 flex-1 rounded-sm ${
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

        <p className="mt-2 font-mono text-[9px] leading-relaxed text-zinc-500">
          SELLO DE LA CASA: {SELLO.join(" · ")} — las cuatro notas que se repiten en cada sección.
          Forma A-B-A: presenta, contrasta y vuelve. Por eso se recuerda.
        </p>
        <p className="mt-1 font-mono text-[9px] leading-relaxed text-zinc-600">{HIMNO.nota}</p>
      </section>

      {/* ── LAS PIEZAS ── */}
      <section className="rounded-md border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber/70">
            LAS PIEZAS DE LA CASA · con forma y sin deriva
          </p>
          <label className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-zinc-400">
            {mudo ? <VolumeX size={12} /> : <Volume2 size={12} />}
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={vol}
              onChange={(e) => cambiarVolumen(Number(e.target.value))}
              className="w-24 accent-amber-400"
            />
          </label>
        </div>

        <div className="mt-3 grid gap-2">
          {MUSICA_CASA.filter((p) => p.familia !== "himno").map((p) => {
            const fam = FAMILIA[p.familia];
            const sonando = motor.sonando === p.id;
            return (
              <div
                key={p.id}
                className={`rounded-sm border px-3 py-2 ${sonando ? "border-amber-500/50 bg-amber-500/10" : "border-zinc-800 bg-zinc-950/40"}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-100">
                      {p.nombre}{" "}
                      <span className={`ml-1 rounded-sm border px-1 py-0.5 text-[8px] ${fam.clase}`}>
                        {fam.etiqueta}
                      </span>
                    </p>
                    <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500">
                      {p.lema} · {p.bpm} bpm · {duracionLegible(duracionPieza(p))}
                      {p.tributoA ? ` · pulso de ${p.tributoA}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => alternarPieza(p)}
                    className="inline-flex items-center gap-1 rounded-sm border border-zinc-700 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-zinc-300 hover:border-amber-hud hover:text-amber"
                  >
                    {sonando ? <Square size={11} /> : <Play size={11} />}
                    {sonando ? "parar" : "tocar"}
                  </button>
                </div>
                <p className="mt-1 font-mono text-[9px] leading-relaxed text-zinc-600">{p.nota}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── LA RADIO ── */}
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
                    <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-100">
                      {e.nombre}
                    </p>
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
              <p className="mt-2 whitespace-pre-wrap font-mono text-[10px] leading-relaxed text-zinc-300">
                {boletin}
              </p>
            ) : null}
          </div>
        ) : null}

        {(emisora || radioCasa || ambienteSonando()) && (
          <button
            type="button"
            onClick={cerrarRadio}
            className="mt-3 inline-flex items-center gap-1 rounded-sm border border-red-500/40 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-red-300"
          >
            <Square size={11} /> apagar la radio
          </button>
        )}

        {aviso ? (
          <p className="mt-2 rounded-sm border border-amber-500/30 bg-amber-500/5 px-2 py-1 font-mono text-[9px] leading-relaxed text-amber-200">
            ⚠ {aviso}
          </p>
        ) : null}

        <p className="mt-2 font-mono text-[9px] leading-relaxed text-zinc-600">
          Las emisoras reales son enlaces externos: si caen, la casa lo dice y ofrece la suya. La radio
          de la casa NO enlaza a nadie y no puede caerse: se fabrica en tu aparato.
        </p>
      </section>

      {/* ── SONIDOS DE GUERRA ── */}
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
        <p className="mt-2 font-mono text-[9px] leading-relaxed text-zinc-600">
          Ni un archivo de audio viaja con la casa: todo son osciladores y ruido del propio aparato.
          Por eso no hay licencias, ni copia, ni factura.
        </p>
      </section>

      <p className="flex items-start gap-2 font-mono text-[9px] uppercase leading-relaxed tracking-[0.12em] text-zinc-600">
        <ShieldAlert size={12} className="mt-0.5 shrink-0" />
        La música de Vanguard es original: mismos pulsos, melodías nuevas. El sello de cuatro notas y la
        forma A-B-A son lo que la hace reconocible — no la repetición de una canción ajena.
      </p>
    </div>
  );
}

export default MusicaSala;

// (marca de la casa: el icono de música se usa en la cabecera de la sala)
export const ICONO_SALA = Music2;

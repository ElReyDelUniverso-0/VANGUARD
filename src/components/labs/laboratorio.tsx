"use client";

// ═══════════════════════════════════════════════════════════════════
// v411.0 · LA MESA DEL LABORATORIO (isla cliente)
//
// Todo lo que el visitante puede tocar de un modelo:
//   ① EDITOR DE VARIABLES — cada mando con su unidad, su rango, su origen
//      (dato real / supuesto / decisión) y su explicación.
//   ② CONTROL DE TIEMPO — pasos simulados y semilla reproducible.
//   ③ COMPARADOR A/B — fija un escenario, cambia lo que quieras y compara.
//   ④ PANEL DE RESULTADOS — métricas, lectura en español y eventos.
//   ⑤ EXPERIMENTOS GUARDADOS — en el navegador, con huella para citarlos.
//   ⑥ EXPORTACIÓN — CSV y JSON con supuestos y límites dentro.
//   ⑦ REINICIO — vuelve a los valores de fábrica.
//
// Nada de esto ejecuta código del visitante: los números se recortan al
// rango declarado por el modelo y el motor es una función pura. Misma
// semilla + mismos parámetros = misma corrida, siempre.
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CLAVE_ALMACEN,
  LIMITE_EXPERIMENTOS,
  comparar,
  exportarCSV,
  exportarJSON,
  parametrosDefecto,
  simular,
  variablesFueraDeDefecto,
  type ExperimentoGuardado,
} from "@/lib/labs/motor";
import { CATEGORIA_LAB, ORIGEN_ETIQUETA, formatearValor, type ModeloLab, type ParametrosLab } from "@/lib/labs/tipos";
import { obtenerModelo } from "@/lib/labs/registro";
import { GraficoSeries } from "./grafico-series";
import { MapaLabSvg } from "./mapa-lab";

interface Props {
  /** El modelo se resuelve DENTRO del cliente: un objeto con funciones no se
   *  puede cruzar la frontera servidor→cliente. El registro es el mismo. */
  modeloId: string;
}

function descargar(nombre: string, contenido: string, tipo: string) {
  const blob = new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function Laboratorio({ modeloId }: Props) {
  const modelo = obtenerModelo(modeloId);
  if (!modelo) {
    return (
      <p className="rounded border border-rose-500/40 bg-rose-500/5 p-4 text-sm text-rose-200">
        Este laboratorio no existe en el registro de la casa.
      </p>
    );
  }
  return <Mesa modelo={modelo} />;
}

function Mesa({ modelo }: { modelo: ModeloLab }) {
  const defecto = useMemo(() => parametrosDefecto(modelo), [modelo]);
  const [params, setParams] = useState<ParametrosLab>(defecto);
  const [pasos, setPasos] = useState(modelo.pasosDefecto);
  const [semilla, setSemilla] = useState(20260922);
  const [presetActivo, setPresetActivo] = useState<string | null>(null);
  const [ocultas, setOcultas] = useState<string[]>([]);
  const [aFijado, setAFijado] = useState<{ params: ParametrosLab; pasos: number; nombre: string } | null>(null);
  const [experimentos, setExperimentos] = useState<ExperimentoGuardado[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);

  const resultado = useMemo(() => simular(modelo, params, { pasos, semilla }), [modelo, params, pasos, semilla]);
  const fuera = variablesFueraDeDefecto(modelo.variables, params);

  // Los experimentos viven en el navegador; el primer render no puede leerlos
  // (no hay localStorage en el servidor), así que llegan en el montaje.
  useEffect(() => {
    try {
      const crudo = localStorage.getItem(CLAVE_ALMACEN);
      if (!crudo) return;
      const todos = JSON.parse(crudo) as ExperimentoGuardado[];
      if (Array.isArray(todos)) setExperimentos(todos);
    } catch {
      // almacenamiento bloqueado o JSON corrupto: el laboratorio sigue sin
      // experimentos guardados, no se rompe nada.
    }
  }, []);

  function persistir(lista: ExperimentoGuardado[]) {
    setExperimentos(lista);
    try {
      localStorage.setItem(CLAVE_ALMACEN, JSON.stringify(lista));
    } catch {
      setAviso("El navegador no deja guardar: el experimento no quedará para la próxima visita.");
    }
  }

  function guardar() {
    const titulo = presetActivo
      ? `${modelo.nombre} · ${modelo.presets?.find((p) => p.id === presetActivo)?.nombre ?? presetActivo}`
      : `${modelo.nombre} · escenario propio`;
    const nuevo: ExperimentoGuardado = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      modeloId: modelo.id,
      nombre: titulo,
      creado: new Date().toISOString(),
      parametros: { ...params },
      pasos,
      semilla,
      huella: resultado.huella,
    };
    const otros = experimentos.filter((e) => e.modeloId !== modelo.id);
    const mios = [nuevo, ...experimentos.filter((e) => e.modeloId === modelo.id)].slice(0, LIMITE_EXPERIMENTOS);
    persistir([...mios, ...otros]);
    setAviso(`Guardado con la huella ${resultado.huella}. Misma semilla y mismos mandos devuelven esta misma corrida.`);
  }

  function cargar(e: ExperimentoGuardado) {
    setParams({ ...defecto, ...e.parametros });
    setPasos(e.pasos);
    setSemilla(e.semilla);
    setPresetActivo(null);
    setAviso(`Cargado «${e.nombre}» (huella ${e.huella}).`);
  }

  function borrar(id: string) {
    persistir(experimentos.filter((e) => e.id !== id));
  }

  const comparacion = useMemo(() => {
    if (!aFijado) return null;
    const a = simular(modelo, aFijado.params, { pasos: aFijado.pasos, semilla });
    return comparar(a, resultado);
  }, [aFijado, modelo, resultado, semilla]);

  const cat = CATEGORIA_LAB[modelo.categoria];
  const mapa = resultado.mapa;
  const misExperimentos = experimentos.filter((e) => e.modeloId === modelo.id);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
      {/* ─────────── columna de mandos ─────────── */}
      <aside className="space-y-5">
        <section className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Editor de variables</h2>
            <button
              type="button"
              onClick={() => {
                setParams(defecto);
                setPasos(modelo.pasosDefecto);
                setPresetActivo(null);
                setAviso("Mandos devueltos a los valores de fábrica del modelo.");
              }}
              className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 underline decoration-zinc-700 underline-offset-4 hover:text-amber-300"
            >
              Reiniciar
            </button>
          </div>

          <div className="mt-3 space-y-4">
            {modelo.variables.map((v) => {
              const valor = params[v.id] ?? v.defecto;
              const origen = ORIGEN_ETIQUETA[v.origen];
              const cambiada = Math.abs(valor - v.defecto) > 1e-9;
              return (
                <div key={v.id}>
                  <div className="flex items-baseline justify-between gap-2">
                    <label htmlFor={`v-${v.id}`} className="text-[13px] font-semibold text-zinc-200">
                      {v.nombre}
                    </label>
                    <span
                      className="shrink-0 rounded-sm px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider"
                      style={{ color: origen.color, backgroundColor: `${origen.color}18`, border: `1px solid ${origen.color}44` }}
                      title={origen.texto}
                    >
                      {origen.nombre}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      id={`v-${v.id}`}
                      type="range"
                      min={v.min}
                      max={v.max}
                      step={v.paso}
                      value={valor}
                      onChange={(ev) => {
                        setParams((p) => ({ ...p, [v.id]: Number(ev.target.value) }));
                        setPresetActivo(null);
                      }}
                      className="h-1 w-full accent-amber-400"
                    />
                    <input
                      type="number"
                      min={v.min}
                      max={v.max}
                      step={v.paso}
                      value={Number(valor.toFixed(4))}
                      onChange={(ev) => {
                        const n = Number(ev.target.value);
                        if (Number.isFinite(n)) {
                          setParams((p) => ({ ...p, [v.id]: Math.max(v.min, Math.min(v.max, n)) }));
                          setPresetActivo(null);
                        }
                      }}
                      className="w-20 rounded border border-zinc-700 bg-zinc-900 px-1.5 py-1 text-right font-mono text-[11px] text-amber-200"
                    />
                  </div>
                  <p className="mt-0.5 flex items-baseline justify-between gap-2 font-mono text-[10px] text-zinc-500">
                    <span>{v.unidad}</span>
                    <span className={cambiada ? "text-amber-300/90" : "text-zinc-600"}>
                      {cambiada ? `fábrica ${v.defecto}` : "valor de fábrica"}
                    </span>
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-zinc-500">{v.nota}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Control del tiempo</h2>
          <div className="mt-3">
            <div className="flex items-baseline justify-between text-[12px] text-zinc-300">
              <label htmlFor="pasos">Horizonte</label>
              <span className="font-mono text-amber-200">
                {pasos} {modelo.unidadTiempo}
                {pasos === 1 ? "" : "s"}
              </span>
            </div>
            <input
              id="pasos"
              type="range"
              min={2}
              max={modelo.pasosMax}
              step={1}
              value={pasos}
              onChange={(ev) => setPasos(Number(ev.target.value))}
              className="mt-1 h-1 w-full accent-amber-400"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[10, 25, 50, modelo.pasosMax].map((n, i) => (
                <button
                  key={`${n}-${i}`}
                  type="button"
                  onClick={() => setPasos(Math.min(modelo.pasosMax, Math.max(2, n)))}
                  className="rounded border border-zinc-700 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-300 hover:border-amber-400/60 hover:text-amber-200"
                >
                  {n} {modelo.unidadTiempo === "año" ? "años" : modelo.unidadTiempo + "s"}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 flex items-end gap-2">
            <div className="flex-1">
              <label htmlFor="semilla" className="text-[12px] text-zinc-300">
                Semilla
              </label>
              <input
                id="semilla"
                type="number"
                value={semilla}
                onChange={(ev) => setSemilla(Math.max(1, Number(ev.target.value) || 1))}
                className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 font-mono text-[11px] text-zinc-200"
              />
            </div>
            <button
              type="button"
              onClick={() => setSemilla(Math.floor(Math.random() * 9_000_000) + 1)}
              className="rounded border border-zinc-700 px-2 py-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-300 hover:border-amber-400/60 hover:text-amber-200"
            >
              Otra
            </button>
          </div>
          <p className="mt-2 text-[11px] leading-snug text-zinc-500">
            La semilla solo mueve el ruido del modelo. Los mandos y el horizonte son los que deciden el resultado.
          </p>
        </section>

        <section className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Escenarios de partida</h2>
          {modelo.presets?.length ? (
            <ul className="mt-3 space-y-2">
              {modelo.presets.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setParams({ ...defecto, ...p.parametros } as ParametrosLab);
                      setPasos(p.pasos ?? modelo.pasosDefecto);
                      setPresetActivo(p.id);
                      setAviso(null);
                    }}
                    className={`w-full rounded border p-2 text-left transition-colors ${
                      presetActivo === p.id
                        ? "border-amber-400/60 bg-amber-400/10"
                        : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-600"
                    }`}
                  >
                    <span className="block text-[12px] font-bold text-zinc-100">{p.nombre}</span>
                    <span className="block text-[11px] leading-snug text-zinc-500">{p.descripcion}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[11px] text-zinc-500">Este modelo no trae escenarios de partida: se explora desde los valores de fábrica.</p>
          )}
        </section>
      </aside>

      {/* ─────────── columna de resultados ─────────── */}
      <div className="min-w-0 space-y-5">
        <div className="rounded-lg border border-amber-400/25 bg-amber-400/[0.06] px-4 py-3 text-[12px] leading-relaxed text-amber-100/90">
          <strong className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-300">No es una predicción.</strong>{" "}
          Es un sistema dinámico con supuestos declarados: sirve para ver cómo se relacionan las variables, no para saber qué
          pasará. Cada número de aquí es una consecuencia de los mandos que has movido.
        </div>

        <section className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              Panel de resultados · {cat.nombre}
            </h2>
            <span className="font-mono text-[10px] text-zinc-600">huella {resultado.huella}</span>
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {resultado.metricas.map((m) => {
              const delta = m.valor - m.inicial;
              const sube = delta > 0;
              const cambia = Math.abs(delta) > Math.max(1e-9, Math.abs(m.inicial) * 0.001);
              return (
                <div key={m.campo} className="rounded border border-zinc-800 bg-zinc-900/50 p-3" title={m.nota ?? m.nombre}>
                  <dt className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">{m.nombre}</dt>
                  <dd className="mt-1 font-orbitron text-xl font-black text-amber-200">
                    {formatearValor(m.valor, m.formato, m.decimales)}
                  </dd>
                  <dd className="font-mono text-[10px] text-zinc-500">
                    {m.formato === "pct" && m.unidad.trim().startsWith("%") ? m.unidad.replace(/^%\s*/, "") : m.unidad}
                  </dd>
                  <dd className={`font-mono text-[10px] ${cambia ? (sube ? "text-emerald-400" : "text-rose-400") : "text-zinc-600"}`}>
                    {cambia ? `${sube ? "▲" : "▼"} desde ${formatearValor(m.inicial, m.formato, m.decimales)}` : "sin cambio"}
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>

        <section className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Gráficos dinámicos</h2>
            <div className="flex flex-wrap gap-1.5">
              {modelo.series.map((s) => {
                const apagada = ocultas.includes(s.campo);
                return (
                  <button
                    key={s.campo}
                    type="button"
                    onClick={() => setOcultas((o) => (apagada ? o.filter((x) => x !== s.campo) : [...o, s.campo]))}
                    className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                      apagada ? "border-zinc-800 text-zinc-600" : "border-zinc-700 text-zinc-300"
                    }`}
                    style={apagada ? undefined : { borderColor: `${s.color}66` }}
                  >
                    {s.nombre}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-3">
            <GraficoSeries etiquetas={resultado.etiquetasTiempo} series={resultado.series} ocultas={ocultas} />
          </div>
        </section>

        {mapa && (
          <section className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Visualización geográfica</h2>
            <div className="mt-3">
              <MapaLabSvg mapa={mapa} />
            </div>
          </section>
        )}

        <section className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Lectura de la corrida</h2>
          <ul className="mt-3 space-y-2">
            {resultado.lectura.map((l, i) => (
              <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-zinc-300">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                <span>{l}</span>
              </li>
            ))}
          </ul>
          {resultado.eventos.length > 0 && (
            <ul className="mt-3 space-y-1 border-t border-zinc-800 pt-3">
              {resultado.eventos.slice(0, 6).map((ev, i) => (
                <li key={i} className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                  {ev.tipo === "limite" ? "▲" : "•"} {ev.texto}
                </li>
              ))}
            </ul>
          )}
          {fuera.length > 0 && (
            <p className="mt-3 text-[11px] text-zinc-500">
              Mandos movidos: {fuera.map((v) => v.nombre).join(" · ")}.
            </p>
          )}
        </section>

        {/* comparador A/B */}
        <section className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Comparador de escenarios</h2>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setAFijado({ params: { ...params }, pasos, nombre: presetActivo ?? "escenario A" });
                  setAviso("Escenario A fijado. Cambia lo que quieras y compara.");
                }}
                className="rounded border border-sky-400/50 bg-sky-400/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-sky-200 hover:bg-sky-400/20"
              >
                Fijar A
              </button>
              <button
                type="button"
                disabled={!aFijado}
                onClick={() => setAFijado(null)}
                className="rounded border border-zinc-700 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-400 disabled:opacity-40"
              >
                Soltar
              </button>
            </div>
          </div>
          {!comparacion ? (
            <p className="mt-2 text-[12px] leading-relaxed text-zinc-500">
              Fija el escenario actual como A, mueve los mandos y aquí aparecerá la diferencia con B (el que estás viendo).
              Sirve para responder a «¿cuánto cambia si subo esto?» sin tener que apuntar números a mano.
            </p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                A: {aFijado?.nombre} · {aFijado?.pasos} {modelo.unidadTiempo}s → B: escenario actual
              </p>
              <table className="w-full min-w-[420px] text-left text-[12px]">
                <thead>
                  <tr className="border-b border-zinc-800 font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                    <th className="py-1">Métrica</th>
                    <th className="py-1 text-right">A</th>
                    <th className="py-1 text-right">B</th>
                    <th className="py-1 text-right">Diferencia</th>
                  </tr>
                </thead>
                <tbody>
                  {comparacion.filas.map((f) => (
                    <tr key={f.nombre} className="border-b border-zinc-900 last:border-0">
                      <td className="py-1.5 text-zinc-300">{f.nombre}</td>
                      <td className="py-1.5 text-right font-mono text-zinc-400">{formatearValor(f.a, f.formato, f.decimales)}</td>
                      <td className="py-1.5 text-right font-mono text-zinc-200">{formatearValor(f.b, f.formato, f.decimales)}</td>
                      <td
                        className={`py-1.5 text-right font-mono ${
                          Math.abs(f.delta) < 1e-9 ? "text-zinc-600" : f.delta > 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {f.delta > 0 ? "+" : ""}
                        {formatearValor(f.delta, f.formato, f.decimales)}
                        {f.deltaPct !== null && Math.abs(f.deltaPct) > 0.05 ? ` (${f.deltaPct > 0 ? "+" : ""}${f.deltaPct} %)` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* experimentos + exportación */}
        <section className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Experimentos guardados</h2>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={guardar}
                className="rounded border border-amber-400/50 bg-amber-400/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-amber-200 hover:bg-amber-400/20"
              >
                Guardar corrida
              </button>
              <button
                type="button"
                onClick={() => descargar(`vanguard-lab-${modelo.id}-${resultado.huella}.csv`, exportarCSV(resultado), "text/csv;charset=utf-8")}
                className="rounded border border-zinc-700 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-300 hover:border-zinc-500"
              >
                CSV
              </button>
              <button
                type="button"
                onClick={() =>
                  descargar(
                    `vanguard-lab-${modelo.id}-${resultado.huella}.json`,
                    exportarJSON(modelo, params, resultado),
                    "application/json;charset=utf-8"
                  )
                }
                className="rounded border border-zinc-700 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-300 hover:border-zinc-500"
              >
                JSON
              </button>
            </div>
          </div>

          {aviso && <p className="mt-2 rounded border border-zinc-800 bg-zinc-900/60 px-2 py-1.5 text-[11px] text-zinc-400">{aviso}</p>}

          {misExperimentos.length === 0 ? (
            <p className="mt-2 text-[12px] text-zinc-500">
              Todavía no has guardado ninguna corrida de este modelo. Se guardan en este navegador (máximo{" "}
              {LIMITE_EXPERIMENTOS}), no en un servidor: nadie más las ve.
            </p>
          ) : (
            <ul className="mt-3 space-y-1.5">
              {misExperimentos.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-zinc-800 bg-zinc-900/40 px-2 py-1.5">
                  <div className="min-w-0">
                    <p className="truncate text-[12px] text-zinc-200">{e.nombre}</p>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                      {new Date(e.creado).toLocaleString("es-ES")} · {e.pasos} {modelo.unidadTiempo}s · huella {e.huella}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => cargar(e)}
                      className="rounded border border-zinc-700 px-2 py-0.5 font-mono text-[10px] uppercase text-zinc-300 hover:border-amber-400/60 hover:text-amber-200"
                    >
                      Cargar
                    </button>
                    <button
                      type="button"
                      onClick={() => borrar(e.id)}
                      className="rounded border border-zinc-800 px-2 py-0.5 font-mono text-[10px] uppercase text-zinc-500 hover:border-rose-500/50 hover:text-rose-300"
                    >
                      Borrar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="text-[12px] leading-relaxed text-zinc-500">
          ¿Buscas otro sistema? <Link href="/labs" className="text-amber-300 underline decoration-amber-400/40 underline-offset-4">Vuelve al catálogo de laboratorios</Link>{" "}
          o compara con el <Link href="/escenarios" className="text-amber-300 underline decoration-amber-400/40 underline-offset-4">Estratega de escenarios</Link>.
        </p>
      </div>
    </div>
  );
}

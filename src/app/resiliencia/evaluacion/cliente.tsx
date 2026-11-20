"use client";

// ═══════════════════════════════════════════════════════════════════
// v420.1 · MISIÓN 09 · «COMMUNITY RESILIENCE» — EL INSTRUMENTO
//
// Cómo está hecho, y por qué así:
//  · La puntuación NO se calcula aquí. Se importa `evaluarComunidad` de
//    src/lib/resiliencia/evaluador.ts — la misma función pura que prueban
//    scripts/pruebas-resiliencia.mjs. Lo que se comprueba es lo que se
//    publica, no una versión de cortesía del cálculo.
//  · El resultado es ORIENTATIVO: sin sello, sin rango, sin envío. Lo exige
//    el encargo de la MISIÓN 09 y lo recuerda la propia pantalla.
//  · Las respuestas viven en localStorage de este navegador. Nada sale del
//    aparato: ni BD, ni analítica, ni sincronización.
//  · El CHROME está en los ocho idiomas de la casa (lib/resiliencia/i18n.ts);
//    las preguntas, en español primero, como el resto del contenido de la
//    casa, que se traduce progresivamente.
//  · Cero animaciones infinitas y cero blur: las barras se pintan con
//    anchura, sin transición (regla 60 FPS de la casa).
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useT } from "@/lib/i18n";
import { RES_BANDAS, RES_CATEGORIAS, RES_ESCALA, tRes, type ResClave } from "@/lib/resiliencia/i18n";
import {
  CATEGORIAS,
  ESCALA,
  ITEMS,
  LIMITES,
  RESPUESTA_MINIMA,
  evaluarComunidad,
  type CategoriaId,
} from "@/lib/resiliencia/evaluador";
import { ENCUADRE } from "@/lib/resiliencia/secciones";

const CLAVE = "vg.resiliencia.evaluacion";

type Respuestas = Record<string, number>;

function leer(): { respuestas: Respuestas; visto: boolean } {
  if (typeof window === "undefined") return { respuestas: {}, visto: false };
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    if (!crudo) return { respuestas: {}, visto: false };
    const obj = JSON.parse(crudo) as { respuestas?: unknown; visto?: unknown };
    const r: Respuestas = {};
    if (obj.respuestas && typeof obj.respuestas === "object") {
      for (const [k, v] of Object.entries(obj.respuestas as Record<string, unknown>)) {
        if (typeof v === "number" && v >= 0 && v <= 3) r[k] = Math.round(v);
      }
    }
    return { respuestas: r, visto: obj.visto === true };
  } catch {
    return { respuestas: {}, visto: false };
  }
}

export function EvaluadorResiliencia() {
  const { lang } = useT();
  const [respuestas, setRespuestas] = useState<Respuestas>({});
  const [fase, setFase] = useState<"intro" | "test" | "fin">("intro");
  const [indice, setIndice] = useState(0);
  const [copiado, setCopiado] = useState(false);
  const [aviso, setAviso] = useState(false);
  // el rastro local se lee UNA vez, durante el render (no en un efecto): así
  // React repinta antes de comprometer el DOM y servidor y navegador dibujan
  // lo mismo. En el servidor `leer()` devuelve vacío, que es el primer frame
  // correcto de cualquier visita.
  const [leido, setLeido] = useState(false);

  const t = useCallback((k: ResClave, vars?: Record<string, string | number>) => tRes(lang, k, vars), [lang]);
  const categoria = useCallback((id: CategoriaId) => RES_CATEGORIAS[lang]?.[id] ?? RES_CATEGORIAS.es[id], [lang]);
  const escala = RES_ESCALA[lang] ?? RES_ESCALA.es;
  const bandas = RES_BANDAS[lang] ?? RES_BANDAS.es;

  // ── el rastro local: se retoma donde se dejó ──────────────────
  if (!leido) {
    setLeido(true);
    const guardado = leer();
    const hay = Object.keys(guardado.respuestas).length;
    if (hay > 0) {
      setRespuestas(guardado.respuestas);
      // se vuelve a la portada de la herramienta, con el botón de continuar y
      // el índice donde se quedó: retomar no es saltar a mitad de examen sin avisar.
      setIndice(Math.min(ITEMS.length - 1, ITEMS.findIndex((it) => guardado.respuestas[it.id] === undefined) === -1 ? ITEMS.length - 1 : ITEMS.findIndex((it) => guardado.respuestas[it.id] === undefined)));
    }
  }

  const escribir = useCallback((nuevas: Respuestas, visto: boolean) => {
    try {
      window.localStorage.setItem(CLAVE, JSON.stringify({ respuestas: nuevas, visto }));
    } catch {
      /* almacenamiento bloqueado o lleno: la evaluación sigue funcionando en memoria */
    }
  }, []);

  const respondidos = useMemo(() => Object.keys(respuestas).length, [respuestas]);
  const item = ITEMS[indice];
  const resultado = useMemo(() => (fase === "fin" ? evaluarComunidad(respuestas) : null), [fase, respuestas]);

  function contestar(valor: number) {
    const nuevas: Respuestas = { ...respuestas, [item.id]: valor };
    setRespuestas(nuevas);
    escribir(nuevas, true);
    setAviso(false);
    if (indice < ITEMS.length - 1) setIndice((i) => i + 1);
  }

  function saltar(dir: -1 | 1) {
    setIndice((i) => Math.max(0, Math.min(ITEMS.length - 1, i + dir)));
  }

  function alFinal() {
    if (respondidos < RESPUESTA_MINIMA) {
      setAviso(true);
      const primeroSinResponder = ITEMS.findIndex((it) => respuestas[it.id] === undefined);
      if (primeroSinResponder >= 0) setIndice(primeroSinResponder);
      setFase("test");
      return;
    }
    escribir(respuestas, true);
    setFase("fin");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
  }

  function reiniciar() {
    setRespuestas({});
    setIndice(0);
    setFase("intro");
    setAviso(false);
    try {
      window.localStorage.removeItem(CLAVE);
    } catch {
      /* nada que borrar */
    }
  }

  function copiar() {
    if (!resultado) return;
    const lineas = [
      "COMMUNITY RESILIENCE · VANGUARD CIVIL RESILIENCE",
      t("resultado") + ":",
      `  ${t("total")}: ${resultado.puntos ?? "—"}/100 · ${bandas[resultado.nivel] ?? ""}`,
      ...resultado.categorias.map(
        (c) => `  ${categoria(c.id)}: ${c.puntos ?? "—"}/100 (${c.respondidos}/${c.total})`,
      ),
      "",
      resultado.aviso,
    ].join("\n");
    navigator.clipboard?.writeText(lineas).then(
      () => {
        setCopiado(true);
        window.setTimeout(() => setCopiado(false), 1800);
      },
      () => setCopiado(false),
    );
  }

  // ── LA PORTADA DE LA HERRAMIENTA ──────────────────────────────
  if (fase === "intro") {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-12 text-zinc-200 sm:px-5">
        <div className="mx-auto max-w-3xl">
          <Link href="/resiliencia" className="font-mono text-[11px] uppercase tracking-widest text-teal-400 hover:text-teal-300">
            ← {t("volverCentro")}
          </Link>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-zinc-100">COMMUNITY RESILIENCE</h1>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-zinc-500">{t("evaluacion")}</p>
          <p className="mt-4 text-[15px] leading-7 text-zinc-300">{t("intro")}</p>

          <ul className="mt-6 space-y-2">
            {CATEGORIAS.map((c, i) => (
              <li key={c.id} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3.5">
                <p className="text-[13.5px] font-semibold text-zinc-100">
                  <span className="mr-2 font-mono text-[11px] text-teal-300">{String(i + 1).padStart(2, "0")}</span>
                  {categoria(c.id)}
                </p>
                <p className="mt-1 text-[12.5px] leading-6 text-zinc-400">{c.mira}</p>
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-lg border border-amber-500/25 bg-amber-500/[0.06] p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-amber-300">{t("limites")}</p>
            <ul className="mt-2 space-y-1.5">
              {LIMITES.map((l) => (
                <li key={l} className="text-[12.5px] leading-6 text-zinc-300">
                  · {l}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setFase("test");
                escribir(respuestas, true);
              }}
              className="rounded-lg bg-teal-400 px-5 py-3 text-[14px] font-semibold text-zinc-950 hover:bg-teal-300"
            >
              {Object.keys(respuestas).length > 0 ? t("resume") : t("start")}
            </button>
            {Object.keys(respuestas).length > 0 ? (
              <span className="self-center text-[12px] text-zinc-500">
                {t("respondidas", { n: Object.keys(respuestas).length, total: ITEMS.length })}
              </span>
            ) : null}
          </div>
          <p className="mt-3 text-[11.5px] text-zinc-600">{t("guardar")}.</p>
        </div>
      </main>
    );
  }

  // ── EL RESULTADO ──────────────────────────────────────────────
  if (fase === "fin" && resultado) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-12 text-zinc-200 sm:px-5">
        <div className="mx-auto max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-widest text-teal-400">{t("resultado")}</p>
          <h1 className="mt-2 text-2xl font-bold text-zinc-100">
            {resultado.valido && resultado.puntos !== null
              ? `${resultado.puntos}/100 · ${bandas[resultado.nivel] ?? resultado.banda?.nombre}`
              : t("faltan")}
          </h1>
          <p className="mt-2 text-[13px] text-zinc-400">
            {t("respondidas", { n: resultado.respondidos, total: resultado.totalItems })}
          </p>

          {!resultado.valido ? (
            <div className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/[0.06] p-4 text-[13px] leading-6 text-zinc-300">
              {resultado.motivo}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setFase("test")}
                  className="rounded-lg border border-amber-400/40 px-4 py-2 text-[13px] font-semibold text-amber-200 hover:bg-amber-400/10"
                >
                  {t("previous")}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div id="como-se-leen" className="mt-6 scroll-mt-20 space-y-2.5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{t("categorias")}</p>
                {resultado.categorias.map((c) => {
                  const pct = c.puntos ?? 0;
                  const color = ["#f87171", "#fbbf24", "#a3e635", "#34d399"][c.nivel] ?? "#34d399";
                  return (
                    <div key={c.id} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3.5">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-[13.5px] font-semibold text-zinc-100">{categoria(c.id)}</p>
                        <p className="font-mono text-[13px]" style={{ color }}>
                          {c.puntos === null ? "—" : `${c.puntos}`}
                          <span className="text-zinc-600">/100</span>
                        </p>
                      </div>
                      <div aria-hidden className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <p className="mt-1.5 text-[11.5px] text-zinc-500">
                        {bandas[c.nivel] ?? ""} · {t("respondidas", { n: c.respondidos, total: c.total })}
                      </p>
                      {c.mejoras.length ? (
                        <ul className="mt-2 space-y-1.5 border-t border-zinc-800 pt-2">
                          {c.mejoras.map((m) => (
                            <li key={m.pregunta} className="flex flex-wrap items-baseline gap-2 text-[12px] leading-5">
                              <span className="text-zinc-400">{t("paraMejorar")}: </span>
                              <Link href={m.ruta} className="font-semibold text-teal-300 hover:text-teal-200">
                                {m.etiquetaRuta}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <section className="mt-8 rounded-xl border border-teal-500/25 bg-teal-500/[0.05] p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-teal-300">{t("empezarPor")}</p>
                <ol className="mt-3 space-y-2">
                  {resultado.prioridades.map((p, i) => (
                    <li key={p.id} className="text-[13.5px] leading-6 text-zinc-200">
                      <span className="mr-2 font-mono text-[11px] text-teal-300">{i + 1}</span>
                      <strong className="font-semibold">{categoria(p.id)}</strong>
                      {p.mejoras[0] ? (
                        <>
                          {" — "}
                          <Link href={p.mejoras[0].ruta} className="text-teal-300 underline decoration-teal-500/40 hover:text-teal-200">
                            {p.mejoras[0].etiquetaRuta}
                          </Link>
                        </>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </section>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={copiar}
                  className="rounded-lg border border-zinc-700 px-4 py-2.5 text-[13px] font-semibold text-zinc-200 hover:border-teal-500/50 hover:text-teal-200"
                >
                  {copiado ? t("copied") : t("copy")}
                </button>
                <button
                  type="button"
                  onClick={reiniciar}
                  className="rounded-lg border border-zinc-800 px-4 py-2.5 text-[13px] text-zinc-400 hover:border-red-500/40 hover:text-red-300"
                >
                  {t("restart")}
                </button>
                <Link
                  href="/resiliencia"
                  className="rounded-lg bg-teal-400 px-4 py-2.5 text-[13px] font-semibold text-zinc-950 hover:bg-teal-300"
                >
                  {t("volverCentro")}
                </Link>
              </div>
            </>
          )}

          <aside className="mt-8 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{t("limites")}</p>
            <p className="mt-1.5 text-[12.5px] leading-6 text-zinc-400">{resultado.aviso}</p>
            <p className="mt-2 text-[12px] leading-6 text-zinc-500">{t("noAlerta")}</p>
            <p className="mt-2 text-[12px] leading-6 text-zinc-500">{ENCUADRE.datosVivos}</p>
          </aside>
        </div>
      </main>
    );
  }

  // ── LAS PREGUNTAS ──────────────────────────────────────────────
  const progreso = Math.round((respondidos / ITEMS.length) * 100);
  const cats = CATEGORIAS.filter((c) => c.id === item?.categoria);

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-200 sm:px-5">
      <div className="mx-auto max-w-3xl">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/resiliencia" className="font-mono text-[11px] uppercase tracking-widest text-teal-400 hover:text-teal-300">
            ← {t("volverCentro")}
          </Link>
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            {t("progreso")} {progreso}% · {t("respondidas", { n: respondidos, total: ITEMS.length })}
          </p>
        </header>

        <div aria-hidden className="mt-3 h-1 w-full overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full rounded-full bg-teal-400" style={{ width: `${progreso}%` }} />
        </div>

        {item ? (
          <section className="mt-8">
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              {t("pregunta", { n: indice + 1, total: ITEMS.length })}
            </p>
            {cats.map((c) => (
              <p key={c.id} className="mt-1 text-[12px] font-semibold text-teal-300">
                {categoria(c.id)}
              </p>
            ))}
            <h1 className="mt-3 text-xl font-semibold leading-8 text-zinc-100">{item.pregunta}</h1>
            <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{t("porqueImporta")}</p>
              <p className="mt-1.5 text-[13px] leading-6 text-zinc-300">{item.ayuda}</p>
            </div>

            <fieldset className="mt-5">
              <legend className="sr-only">{t("respuesta")}</legend>
              <div className="space-y-2">
                {ESCALA.map((op) => {
                  const activo = respuestas[item.id] === op.valor;
                  return (
                    <label
                      key={op.valor}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 ${
                        activo ? "border-teal-500/60 bg-teal-500/[0.07]" : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name={item.id}
                        checked={activo}
                        onChange={() => contestar(op.valor)}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-teal-400"
                      />
                      <span>
                        <span className={`block text-[14px] font-semibold ${activo ? "text-teal-200" : "text-zinc-200"}`}>
                          {escala[op.valor] ?? op.etiqueta}
                        </span>
                        <span className="mt-0.5 block text-[12px] leading-5 text-zinc-500">{op.texto}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {respuestas[item.id] !== undefined ? (
              <p className="mt-4 text-[12.5px] text-zinc-500">
                {t("paraMejorar")}:{" "}
                <Link href={item.ruta} className="font-semibold text-teal-300 hover:text-teal-200">
                  {item.etiquetaRuta} →
                </Link>
              </p>
            ) : null}

            {aviso ? (
              <p role="status" className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/[0.07] p-3 text-[12.5px] leading-6 text-amber-100">
                {t("faltan")} {t("respondidas", { n: respondidos, total: ITEMS.length })} · {t("noAlerta")}
              </p>
            ) : null}
          </section>
        ) : (
          <p className="mt-10 text-[13px] text-zinc-400">Fin.</p>
        )}

        <nav className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-900 pt-5">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => saltar(-1)}
              disabled={indice === 0}
              className="rounded-lg border border-zinc-800 px-3.5 py-2 text-[13px] text-zinc-300 hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("previous")}
            </button>
            <button
              type="button"
              onClick={() => saltar(1)}
              disabled={indice >= ITEMS.length - 1}
              className="rounded-lg border border-zinc-800 px-3.5 py-2 text-[13px] text-zinc-300 hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("next")}
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={reiniciar}
              className="rounded-lg px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500 hover:text-red-300"
            >
              {t("restart")}
            </button>
            <button
              type="button"
              onClick={alFinal}
              className="rounded-lg bg-teal-400 px-4 py-2.5 text-[13px] font-semibold text-zinc-950 hover:bg-teal-300"
            >
              {t("seeResults")}
            </button>
          </div>
        </nav>

        <div className="mt-4 flex flex-wrap gap-1.5" aria-label={t("categorias")}>
          {CATEGORIAS.map((c) => {
            const suyos = ITEMS.map((it, i) => ({ it, i })).filter((x) => x.it.categoria === c.id);
            const hechos = suyos.filter((x) => respuestas[x.it.id] !== undefined).length;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setIndice(suyos[0].i)}
                className="rounded-full border border-zinc-800 bg-zinc-900/50 px-2.5 py-1 text-[11.5px] text-zinc-400 hover:border-teal-500/40 hover:text-teal-200"
              >
                {categoria(c.id)} <span className="font-mono text-[10px] text-zinc-500">{hechos}/{suyos.length}</span>
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-[11.5px] leading-5 text-zinc-600">
          {t("guardar")} · {t("noAlerta")}
        </p>
      </div>
    </main>
  );
}

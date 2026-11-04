"use client";

// ══════════════════════════════════════════════════════════════════════
// v272.0 EL QUIZ DEL PESO — ¿QUÉ CABLE PESA MÁS?
// El motor de impacto v172 da a cada cable real su peso 0-100
// (determinista y auditable); este quiz pone a prueba el ojo del
// comandante: dos cables REALES de la instantánea del pulso, una
// apuesta, el veredicto con el peso revelado de ambos.
//
// DISCIPLINA DE LA CASA:
//  · Las parejas nacen en el servidor de la MISMA instantánea (cero
//    consultas de más, herencia v256/v262) y solo viajan parejas con
//    pesos DISTINTOS: la casa jamás pregunta lo que no tiene respuesta.
//  · El veredicto no es una opinión: es el impacto real del motor v172
//    (la fuente manda — directiva v266: las etiquetas vienen de TIERS,
//    este componente no inventa).
//  · Ley v176: nada de setState en effects — el botín vive FUERA de
//    React (mini-store propio con useSyncExternalStore, patrón v216):
//    el servidor pinta los ceros, el navegador despierta el botín
//    post-montaje con el servidor-snapshot de React — cero mismatch,
//    cero parpadeo #418.
//  · Cerradura v132: ninguna escritura sale antes de hidratar (el
//    progreso del visitante es sagrado) y JAMÁS toca la BD (leyes
//    v245/v246: un solo escritor).
//  · Cero red: la sala ya sirvió la comida — este componente no hace
//    fetch ni consulta la casa por cable.
//
// v279.0 EL QUIZ DEL FRENTE — LA SEGUNDA CAPA (cola v272): el mismo
//    quiz con un modo nuevo — parejas POR TEATRO: los dos cables más
//    pesados de UNA sala (conflictTag, ya presente en el payload v213),
//    derivados en el servidor de la MISMA instantánea. El frente habla
//    en una línea compuesta en JS (lección v256); la sala huérfana (un
//    solo cable) se declara sin par posible — vacío honesto derivado.
//
// v280.0 EL CONTRARRELOJ DEL PESO — LA TERCERA CAPA (la otra mitad de
//    la cola v272): 60 s contra el archivo (el interrogatorio
//    contrarreloj del linaje, v61) sobre el POOL ACTIVO (sala o
//    frente). El reloj vive FUERA de React (ley v176: nada de setState
//    en effects — intervalo a nivel de módulo, React solo escucha con
//    useSyncExternalStore, patrón v216). El servidor pinta la fase
//    «quieto» (el botón viaja en el SSR); la marcha y el final son del
//    navegador. El récord del sprint entra en el botín (cerradura v132,
//    JAMÁS la BD). Y la cota de parejas crece 8 → 12 (la cola lo pedía:
//    más combustible sin consultas nuevas — el servidor ya sirvió los
//    60 cables, la derivación es la misma).
// ══════════════════════════════════════════════════════════════════════

import { useEffect, useState, useSyncExternalStore } from "react";
import { TIERS, type TierImpacto } from "@/lib/impacto";
import { estaHidratado, marcarHidratado, storageBlindado } from "@/lib/storage-blindado";
import type { CableVivo } from "./sala-en-vivo";

export interface ParPeso {
  a: CableVivo;
  b: CableVivo;
}

// v279.0 — la pareja del frente: los dos cables más pesados de UNA sala
export interface ParTeatro extends ParPeso {
  teatro: string; // el conflictTag de la sala, en mayúsculas (lo puso el servidor)
  total: number;  // cables de ESA sala en la instantánea (para la ficha del frente)
}

// la clave del botín en el navegador (cerradura v132 por clave)
const CLAVE_PESO = "vg-quiz-peso";

interface BotinPeso {
  racha: number;       // aciertos consecutivos de la ronda en curso
  record: number;      // la mejor racha de la casa (este navegador)
  jugadas: number;     // apuestas totales
  aciertos: number;    // apuestas ganadas
  sprintRecord: number; // v280.0 — el mejor contrarreloj de la casa (aciertos en 60 s)
}

const BOTIN_LIMPIO: BotinPeso = { racha: 0, record: 0, jugadas: 0, aciertos: 0, sprintRecord: 0 };

// ── EL MINI-STORE DEL BOTÍN (fuera de React, patrón v216) ─────────────
// El valor nace de localStorage con caché por crudo (getSnapshot debe
// ser estable: el mismo crudo devuelve el mismo objeto) y los oyentes
// se avisan en cada apuesta. El servidor, sin ventana, pinta los ceros.
let crudoCache: string | null = null;
let valorCache: BotinPeso = BOTIN_LIMPIO;
const oyentes = new Set<() => void>();

function leerBotin(): BotinPeso {
  const crudo = storageBlindado.getItem(CLAVE_PESO);
  if (crudo !== crudoCache) {
    crudoCache = crudo;
    try {
      const g = crudo ? (JSON.parse(crudo) as Partial<BotinPeso>) : null;
      valorCache = {
        racha: g?.racha ?? 0,
        record: g?.record ?? 0,
        jugadas: g?.jugadas ?? 0,
        aciertos: g?.aciertos ?? 0,
        sprintRecord: g?.sprintRecord ?? 0, // v280.0 — los botines viejos despiertan con 0
      };
    } catch {
      valorCache = BOTIN_LIMPIO; // botín corrupto: la casa empieza limpia
    }
  }
  return valorCache;
}

function suscribir(fn: () => void): () => void {
  oyentes.add(fn);
  if (typeof window !== "undefined") {
    // otra pestaña jugando el mismo quiz también avisa
    window.addEventListener("storage", fn);
    return () => {
      oyentes.delete(fn);
      window.removeEventListener("storage", fn);
    };
  }
  return () => {
    oyentes.delete(fn);
  };
}

function guardarBotin(nuevo: BotinPeso): void {
  if (!estaHidratado(CLAVE_PESO)) return; // cerradura v132: nada sale antes de hidratar
  storageBlindado.setItem(CLAVE_PESO, JSON.stringify(nuevo));
  crudoCache = null; // invalida la caché y despierta a los oyentes
  for (const fn of oyentes) fn();
}

// ── EL RELOJ DEL CONTRARRELOJ (fuera de React, patrón v216) ───────────
// v280.0 — ley v176: nada de setState en effects; el intervalo vive en
// el módulo y React solo escucha (useSyncExternalStore con caché por
// tick: getSnapshot estable entre avisos). El servidor, sin ventana,
// pinta la fase «quieto» — cero mismatch, cero parpadeo #418.
const DURACION_SPRINT = 60000; // 60 s — el interrogatorio contrarreloj del linaje (v61)

interface SprintVivo {
  fase: "quieto" | "marcha" | "fin";
  quedanMs: number;
  aciertos: number;
}

const SPRINT_QUIETO: SprintVivo = { fase: "quieto", quedanMs: 0, aciertos: 0 };
let sprintFinMs: number | null = null;
let sprintTerminado = false;
let sprintAciertos = 0;
let sprintCache: SprintVivo = SPRINT_QUIETO;
let sprintTimer: ReturnType<typeof setInterval> | null = null;
const sprintOyentes = new Set<() => void>();

function sprintAvisar(): void {
  for (const fn of sprintOyentes) fn();
}

function sprintRecalcular(): void {
  if (sprintFinMs !== null) {
    const restan = sprintFinMs - Date.now();
    if (restan <= 0) {
      // la campana: el récord entra en el botín (la cerradura v132 decide)
      sprintFinMs = null;
      sprintTerminado = true;
      if (sprintTimer) {
        clearInterval(sprintTimer);
        sprintTimer = null;
      }
      sprintCache = { fase: "fin", quedanMs: 0, aciertos: sprintAciertos };
      const b = leerBotin();
      guardarBotin({ ...b, sprintRecord: Math.max(b.sprintRecord, sprintAciertos) });
      return;
    }
    sprintCache = { fase: "marcha", quedanMs: restan, aciertos: sprintAciertos };
    return;
  }
  sprintCache = sprintTerminado
    ? { fase: "fin", quedanMs: 0, aciertos: sprintAciertos }
    : SPRINT_QUIETO;
}

function tickSprint(): void {
  sprintRecalcular();
  sprintAvisar();
}

function sprintSnapshot(): SprintVivo {
  return sprintCache;
}

function sprintSuscribir(fn: () => void): () => void {
  sprintOyentes.add(fn);
  return () => {
    sprintOyentes.delete(fn);
  };
}

function arrancarSprint(): void {
  sprintTerminado = false;
  sprintAciertos = 0;
  sprintFinMs = Date.now() + DURACION_SPRINT;
  if (!sprintTimer) sprintTimer = setInterval(tickSprint, 250);
  sprintRecalcular();
  sprintAvisar();
}

// el quiz llama aquí con cada acierto mientras el reloj corre
function anotarSprintAcierto(): void {
  if (sprintFinMs === null) return;
  sprintAciertos += 1;
  sprintCache = {
    fase: "marcha",
    quedanMs: Math.max(0, sprintFinMs - Date.now()),
    aciertos: sprintAciertos,
  };
  sprintAvisar();
}

// ── EL SELLO DEL PESO — la etiqueta canónica del motor, nunca inventada ──
function etiquetaTier(tier: CableVivo["tier"]): string {
  return TIERS[tier as TierImpacto]?.label ?? "CONTEXTO";
}

function colorTier(tier: CableVivo["tier"]): string {
  const clase = TIERS[tier as TierImpacto]?.clase ?? "text-muted-foreground";
  return clase.split(" ")[0] ?? "text-muted-foreground";
}

const sinSuscripcion = () => () => {};
const esCliente = () => true;
const esServidor = () => false;

export default function QuizPeso({
  parejas,
  parejasTeatro = [],
  salasSinPar = 0,
}: {
  parejas: ParPeso[];
  parejasTeatro?: ParTeatro[];
  salasSinPar?: number;
}) {
  const [ronda, setRonda] = useState(0);
  const [apostada, setApostada] = useState<"a" | "b" | null>(null);
  const [modo, setModo] = useState<"sala" | "teatro">("sala");
  // ley v176: el botín y el reloj vienen de stores externos — cero setState en effects
  const botin = useSyncExternalStore(suscribir, leerBotin, () => BOTIN_LIMPIO);
  const sprint = useSyncExternalStore(sprintSuscribir, sprintSnapshot, () => SPRINT_QUIETO);
  const montado = useSyncExternalStore(sinSuscripcion, esCliente, esServidor);

  // LA CERRADURA v132 se abre post-montaje: desde aquí el botín sale
  // a localStorage (las apuestas son eventos del usuario — imposibles
  // antes de hidratar — pero la cerradura formaliza la disciplina).
  useEffect(() => {
    marcarHidratado(CLAVE_PESO);
  }, []);

  // VACÍO HONESTO: sin al menos dos parejas servidas no hay quiz —
  // la casa no pinta un juego sin cables reales detrás.
  if (parejas.length < 2) return null;

  // v279.0 — el modo manda: en teatro, las parejas del frente; en sala,
  // las generales de la instantánea. La ronda se resetea al cambiar.
  const pares: (ParPeso | ParTeatro)[] =
    modo === "teatro" && parejasTeatro.length > 0 ? parejasTeatro : parejas;
  const par = pares[ronda % pares.length];

  // LA LÍNEA DE LA CASA compuesta COMPLETA en JS (lección v256): si el
  // archivo cambia, la cifra cambia sola — cero cifras escritas a mano.
  const lineaQuiz = `EL QUIZ DEL PESO — ${parejas.length} parejas reales del archivo miden tu ojo`;

  // v279.0 — LA LÍNEA DEL FRENTE, compuesta COMPLETA en JS: salas con
  // par y salas huérfanas, ambas derivadas — el vacío se declara solo.
  const nombresFrente = parejasTeatro.map((p) => p.teatro.toUpperCase()).join(" · ");
  const lineaTeatro = `EL QUIZ POR TEATRO — ${parejasTeatro.length} ${parejasTeatro.length === 1 ? "sala" : "salas"} del frente con par en la instantánea: ${nombresFrente || "ninguna todavía"}${salasSinPar > 0 ? ` · ${salasSinPar} ${salasSinPar === 1 ? "sala" : "salas"} sin par posible` : ""}`;

  // v280.0 — LA LÍNEA DEL SPRINT, compuesta desde la constante del reloj
  // (el linaje la bautizó en la v61: interrogatorio contrarreloj 60 s)
  const lineaSprint = `contrarreloj: ${DURACION_SPRINT / 1000} s contra el archivo — cuántos pesos aciertas antes de que suene la campana`;

  function apostar(lado: "a" | "b") {
    if (apostada) return; // la ronda ya está servida
    const pesoApostado = lado === "a" ? par.a.impacto : par.b.impacto;
    const pesoRival = lado === "a" ? par.b.impacto : par.a.impacto;
    const acierto = pesoApostado > pesoRival;
    const nuevaRacha = acierto ? botin.racha + 1 : 0;
    if (acierto) anotarSprintAcierto(); // v280.0 — el reloj anota si corre
    setApostada(lado);
    guardarBotin({
      racha: nuevaRacha,
      record: Math.max(botin.record, nuevaRacha),
      jugadas: botin.jugadas + 1,
      aciertos: botin.aciertos + (acierto ? 1 : 0),
      sprintRecord: botin.sprintRecord, // v280.0 — el récord del sprint viaja intacto
    });
  }

  function siguiente() {
    setApostada(null);
    setRonda((r) => (r + 1) % pares.length);
  }

  // v279.0 — el cambio de modo resetea la ronda (eventos del usuario:
  // imposible antes de hidratar, cerradura v132 intacta)
  function cambiarModo(nuevo: "sala" | "teatro") {
    if (nuevo === modo) return;
    setModo(nuevo);
    setApostada(null);
    setRonda(0);
  }

  // el veredicto: el peso real del motor decide, no la casa
  const acierto = apostada
    ? (apostada === "a" ? par.a.impacto : par.b.impacto) >
      (apostada === "a" ? par.b.impacto : par.a.impacto)
    : false;
  const pesoGanador = Math.max(par.a.impacto, par.b.impacto);
  const tierGanador = par.a.impacto >= par.b.impacto ? par.a.tier : par.b.tier;

  return (
    <section
      className="border-t border-zinc-800 bg-zinc-950 px-4 sm:px-5 py-12"
      aria-label={lineaQuiz}
    >
      <div className="max-w-7xl mx-auto">
        <p className="font-mono text-[11px] uppercase tracking-widest text-amber-400">
          ◈ VANGUARD · LA SALA EN VIVO
        </p>
        <h2 className="mt-2 text-xl font-bold text-zinc-100">¿Qué cable pesa más?</h2>
        <p className="mt-1 text-sm text-zinc-400">{lineaQuiz}</p>
        {montado ? (
          <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-zinc-500">
            racha {botin.racha} · récord {botin.record} · {botin.aciertos} de {botin.jugadas} apuestas
          </p>
        ) : (
          <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-zinc-600">
            el botín despierta al hidratarse
          </p>
        )}

        {/* v279.0 — LA LÍNEA DEL FRENTE: compuesta en JS desde la fuente,
            viaja en el SSR los dos modos — si la BD cambia, cambia sola. */}
        <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-zinc-500">
          {lineaTeatro}
        </p>

        {/* v279.0 — EL TOGGLE DE LA CASA: sala general o frente. Solo con
            al menos una sala con par — sin teatro real no hay teatro falso. */}
        {parejasTeatro.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Modo del quiz del peso">
            <button
              type="button"
              onClick={() => cambiarModo("sala")}
              aria-pressed={modo === "sala"}
              disabled={sprint.fase === "marcha"}
              className={`rounded border px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest disabled:cursor-not-allowed disabled:opacity-50 ${
                modo === "sala"
                  ? "border-amber-hud bg-amber-hud/15 text-amber-400"
                  : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-amber-hud/40 hover:text-amber-400"
              }`}
            >
              SALA GENERAL ▸
            </button>
            <button
              type="button"
              onClick={() => cambiarModo("teatro")}
              aria-pressed={modo === "teatro"}
              disabled={sprint.fase === "marcha"}
              className={`rounded border px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest disabled:cursor-not-allowed disabled:opacity-50 ${
                modo === "teatro"
                  ? "border-violet-hud bg-violet-hud/15 text-violet-300"
                  : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-violet-hud/40 hover:text-violet-300"
              }`}
            >
              POR TEATRO ▸
            </button>
          </div>
        )}

        {/* v280.0 — EL CONTRARRELOJ: 60 s contra el archivo (linaje v61)
            sobre el pool activo. El reloj vive fuera de React (patrón
            v216); el SSR pinta el botón y la invitación compuesta. */}
        {sprint.fase === "quieto" && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={arrancarSprint}
              aria-label="Arrancar el contrarreloj del peso"
              className="rounded border border-violet-hud/60 bg-violet-hud/10 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-violet-300 hover:bg-violet-hud/20"
            >
              CONTRARRELOJ ▸
            </button>
            <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
              {lineaSprint}
            </p>
          </div>
        )}
        {sprint.fase === "marcha" && (
          <p
            className="mt-3 font-mono text-sm font-bold uppercase tracking-wider text-violet-300"
            aria-live="polite"
          >
            contrarreloj: quedan {Math.ceil(sprint.quedanMs / 1000)} s · {sprint.aciertos}{" "}
            {sprint.aciertos === 1 ? "acierto" : "aciertos"} del sprint
          </p>
        )}
        {sprint.fase === "fin" && (
          <div className="mt-3 rounded-lg border border-violet-hud/40 bg-violet-hud/5 p-3">
            <p className="font-mono text-sm font-bold uppercase tracking-wider text-violet-300">
              ○ LA CAMPANA SONÓ — {sprint.aciertos} {sprint.aciertos === 1 ? "acierto" : "aciertos"} en{" "}
              {DURACION_SPRINT / 1000} s
            </p>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-zinc-500">
              récord del contrarreloj: {Math.max(botin.sprintRecord, sprint.aciertos)} aciertos en{" "}
              {DURACION_SPRINT / 1000} s
            </p>
            <button
              type="button"
              onClick={arrancarSprint}
              aria-label="Arrancar otro contrarreloj del peso"
              className="mt-2 rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-zinc-200 hover:border-violet-hud/50 hover:text-violet-300"
            >
              OTRO SPRINT ▸
            </button>
          </div>
        )}

        {modo === "teatro" && "teatro" in par && (
          <p className="mt-6 font-mono text-[11px] uppercase tracking-widest text-violet-300">
            FRENTE · {par.teatro.toUpperCase()} — {par.total} cables de esta sala en la instantánea
          </p>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {(["a", "b"] as const).map((lado) => {
            const c = par[lado];
            const pesoEste = lado === "a" ? par.a.impacto : par.b.impacto;
            // las parejas viajan con pesos DISTINTOS: el ganador es único
            const ganoEste = apostada ? pesoEste === pesoGanador : false;
            const perdiEste = apostada ? lado === apostada && !acierto : false;
            return (
              <article
                key={`${par.a.id}-${lado}`}
                className={`rounded-lg border p-4 transition-colors ${
                  apostada
                    ? ganoEste
                      ? "border-emerald-500/60 bg-emerald-500/5"
                      : perdiEste
                        ? "border-red-hud/60 bg-red-hud/5"
                        : "border-zinc-800 bg-zinc-900/40"
                    : "border-zinc-800 bg-zinc-900/40 hover:border-amber-hud/50"
                }`}
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                  {modo === "teatro"
                    ? `SEÑAL · ${c.tag}`
                    : c.conflicto
                      ? `TEATRO · ${c.conflicto.toUpperCase()}`
                      : `SEÑAL · ${c.tag}`}
                </p>
                <h3 className="mt-2 text-sm font-semibold leading-snug text-zinc-100">{c.t}</h3>
                <p className="mt-2 font-mono text-[11px] text-zinc-500">{c.f}</p>

                {apostada ? (
                  <p className={`mt-3 font-mono text-sm font-bold ${colorTier(c.tier)}`}>
                    PESO REAL: {c.impacto}/100 · {etiquetaTier(c.tier)}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => apostar(lado)}
                    aria-label={`Apuesto por este cable: ${c.t}`}
                    className="mt-3 w-full rounded border border-amber-hud/60 bg-amber-hud/10 px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest text-amber-400 hover:bg-amber-hud/20"
                  >
                    PESA MÁS ▸
                  </button>
                )}
              </article>
            );
          })}
        </div>

        {apostada && (
          <div className="mt-5 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
            <p className={`font-mono text-sm font-bold uppercase tracking-wider ${acierto ? "text-emerald-400" : "text-red-hud"}`}>
              {acierto
                ? "○ OJO DE ÁGUILA — la casa pesó contigo"
                : "○ LA CASA PESÓ EL OTRO CABLE"}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-400">
              El veredicto no es una opinión: es el motor de impacto de la Agencia (v172),
              determinista y auditable línea a línea. El cable que pesa lleva{" "}
              <span className="font-mono text-zinc-200">
                {pesoGanador}/100 · {etiquetaTier(tierGanador)}
              </span>
              .
            </p>
            <button
              type="button"
              onClick={siguiente}
              aria-label="Siguiente ronda del quiz del peso"
              className="mt-3 rounded border border-zinc-700 bg-zinc-800 px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-zinc-200 hover:border-amber-hud/50 hover:text-amber-400"
            >
              SIGUIENTE RONDA ▸
            </button>
          </div>
        )}

        <p className="mt-6 text-[11px] leading-relaxed text-zinc-600">
          La racha y el récord del contrarreloj viven en tu navegador y en
          ninguna otra parte — la casa no apunta tu botín en su libro (un solo
          escritor). El peso de cada cable
          lo midió el motor de impacto de la Agencia: vocabulario, etiqueta
          táctica, país, credibilidad de la fuente y frescura, auditable línea a línea.
        </p>
      </div>
    </section>
  );
}

"use client";

// v92.0 OJO DEL MUNDO — ESTRATEGIA GLOBAL (espejo del hub de estrategia y
// wargames): escuela de doctrinas con árboles de mejora, escenarios jugables
// con reglas especiales, ciclo OODA animado, lecciones tácticas y ranking de
// generales donde el jugador compite (TU).

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { GraduationCap, Swords, BrainCircuit, Medal, Repeat, X, Play, History, RotateCcw, Trophy, Ghost } from "lucide-react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { HeroOro } from "@/components/vanguard/hero-oro";
// v344 EL TABLÓN DE LA MESA — LA MESA VIVA etapa 6: los rivales del desafío
// nacen de la MISMA data de la escuela (girados por la misma semana del
// tablón, cero copias de la fórmula fuera del módulo)
// v348 EL ARCHIVO DE LA MESA — etapa 7: las semanas cerradas cuentan su
// historia (racha por jueves ISO, puesto frente a la escuela recomputado)
// v352 EL SALÓN DEL FANTASMA — etapa 9: el archivo completo revive como coro
// de fantasmas ELEGIBLES — elijo a cuál de mis pasados reto hoy
import { estrategiaDeHoy, escenarioPorId, desafioDeLaSemana, parDesafio, rivalesDeLaMesa, rachaDeLaMesa, puestoDeLaMesa, fantasmaDeLaMesa, salonDeLaMesa, type General, type EscenarioWargame } from "@/lib/estrategia-data";
import { useGameStore } from "@/lib/game-store";
// v338 LA MESA EN EL TABLÓN — la llave de semana del TABLÓN (la misma que
// cierra el podio semanal cierra el desafío: una sola llave, cero copias)
import { weekKeyOf } from "@/lib/retention";
import { ACHIEVEMENTS } from "@/lib/game-data";
import {
  jugadasDeTurno,
  estadoInicial,
  resolverJugada,
  veredictoDe,
  type EstadoWargame,
} from "@/lib/wargame-motor";
import { cn } from "@/lib/utils";
import { useSala3DContenido, type FilaContenido3D } from "@/components/vanguard/use-sala3d-contenido";

// v315 LA MESA CON MEMORIA — una partida guardada: contadores propios del
// wargame (JAMÁS cruzar conquestWins — la ley de contadores honestos) y las
// jugadas exactas por turno que el motor determinista sabe revivir.
type PartidaMesa = {
  escId: string;
  titulo: string;
  dificultad: number;
  fecha: number;
  jugadas: string[];
  objetivoAzul: number;
  objetivoRojo: number;
  ganaAzul: boolean;
  botinCoins: number;
  botinXp: number;
};

const RAMA_COLOR: Record<string, string> = {
  ATAQUE: "#FF6B4D",
  DEFENSA: "#4D9DFF",
  MOVIMIENTO: "#FFC94D",
  INFORMACIÓN: "#C89AFF",
};

export function EstrategiaGlobalPanel() {
  const hoy = useMemo(() => estrategiaDeHoy(), []);
  const [docSel, setDocSel] = useState(0);
  const [escSel, setEscSel] = useState(0);
  const [oodaFase, setOodaFase] = useState(0);
  // v313 LA ESCUELA QUE RESPIRA — EL FIN DEL CARTEL: la fila «TU» ya no es
  // un «¿?» decorativo; sube a la tabla con las victorias REALES de conquista
  // del operador (game-store) y el puesto que esas victorias le dan entre las
  // leyendas. Progreso de verdad, no carteles (la ley de la v216).
  const victoriasTu = useGameStore((s) => s.conquestWins);
  // v315 LA MESA CON MEMORIA — la mesa recuerda: contadores propios y las
  // últimas partidas revivibles; el revivir abre la mesa en modo replay.
  const memoria = useGameStore((s) => s.wargameStats);
  const historial = useGameStore((s) => s.wargameHistorial);
  // v316 LAS INSIGNIAS DE LA ESCUELA — la caza se compone de la fuente canónica
  // (cero números a mano) y se lee del estado real del operador
  const totalInsignias = useMemo(() => ACHIEVEMENTS.filter((a) => a.category === "ESCUELA").length, []);
  const unlocked = useGameStore((s) => s.unlockedAchievements);
  const insigniasCazadas = useMemo(() => unlocked.filter((id) => id.startsWith("ACH-WGM-")).length, [unlocked]);
  const [replay, setReplay] = useState<PartidaMesa | null>(null);
  const [mesa, setMesa] = useState<EscenarioWargame | null>(null);
  // v338 LA MESA EN EL TABLÓN — el desafío de la semana: UNA mesa + UNA
  // dificultad FIJA para toda la escuela (la llave de semana es la del
  // tablón — una sola llave, cero copias); el récord propio vive en la
  // tienda (desafioMejor) y el contrato al tablón lo pinta allá.
  const semanaMesa = useMemo(() => weekKeyOf(), []);
  const desafio = useMemo(() => desafioDeLaSemana(parseInt(semanaMesa.slice(6), 10) || 1), [semanaMesa]);
  const _recordDesafio = useGameStore((s) => s.recordDesafio);
  const desafioMejor = useGameStore((s) => s.desafioMejor);
  const mejorVigente = desafioMejor && desafioMejor.wk === semanaMesa ? desafioMejor.objetivo : null;
  const [mesaDesafio, setMesaDesafio] = useState(false);
  const archivoDesafio = useGameStore((s) => s.desafioHistorial);
  // v350 EL FANTASMA DE LA MESA — LA MESA VIVA etapa 8: tu mejor semana
  // cerrada vuelve al tablón como un rival REAL (tu propio dato, contadores
  // propios — la fila que no es SIM ni es TU fila de hoy). A diferencia de
  // los cadetes, el fantasma NO se recalibra: es tu pasado con su número
  // fijo. Cero efectos nuevos: el fantasma respira en un useMemo.
  const fantasma = useMemo(() => fantasmaDeLaMesa(archivoDesafio), [archivoDesafio]);
  // v344 EL TABLÓN DE LA MESA — LA MESA VIVA etapa 6: los cadetes de la
  // escuela giran con la MISMA semana del tablón y se calibran a la escala
  // del operador (su mejor mesa REAL; si aún no jugó, el par de la casa —
  // estimación declarada). La fila del operador es su único dato REAL.
  // v350 etapa 8: y el FANTASMA — tu mejor semana cerrada, REAL y fija,
  // sentado a la mesa de hoy para que la compares contigo de ahora.
  const alias = useGameStore((s) => s.alias);
  const tablonMesa = useMemo(() => {
    const rivales = rivalesDeLaMesa(parseInt(semanaMesa.slice(6), 10) || 1, mejorVigente ?? parDesafio(desafio.dificultad));
    return [
      ...rivales.map((r) => ({ nombre: r.nombre, tag: r.tag, score: r.score, propio: false, fantasma: false })),
      ...(fantasma ? [{ nombre: "TU FANTASMA", tag: fantasma.wk, score: fantasma.objetivo, propio: false, fantasma: true }] : []),
      { nombre: alias || "TU", tag: "AG", score: mejorVigente ?? -1, propio: true, fantasma: false },
    ].sort((a, b) => b.score - a.score);
  }, [semanaMesa, mejorVigente, desafio, alias, fantasma]);
  const puestoTu = tablonMesa.findIndex((f) => f.propio) + 1;
  // v348 EL ARCHIVO DE LA MESA — LA MESA VIVA etapa 7: las semanas cerradas
  // del desafío. El título de cada mesa se RECOMPUTA del anillo
  // (desafioDeLaSemana con el número de la llave: el mismo giro de
  // entonces — cero relojes nuevos) y el puesto frente a la escuela de la
  // fórmula determinista calibrada al dato REAL de aquella semana (SIM
  // recomputada, se declara). La fila del operador es la única REAL.
  // Cero efectos nuevos: el archivo respira en un useMemo.
  const archivoMesa = useMemo(() => {
    const semanas = [...archivoDesafio.map((a) => a.wk), ...(mejorVigente !== null ? [semanaMesa] : [])];
    const racha = rachaDeLaMesa(semanas, semanaMesa);
    const filas = archivoDesafio.slice(0, 6).map((a) => {
      const num = parseInt(a.wk.slice(6), 10) || 1;
      const mesa = desafioDeLaSemana(num);
      return { wk: a.wk, titulo: mesa.titulo, dificultad: mesa.dificultad, objetivo: a.objetivo, puesto: puestoDeLaMesa(num, a.objetivo) };
    });
    const todas = [...archivoDesafio.map((a) => ({ wk: a.wk, objetivo: a.objetivo })), ...(mejorVigente !== null ? [{ wk: semanaMesa, objetivo: mejorVigente }] : [])];
    const mejor = todas.reduce<{ wk: string; objetivo: number } | null>((m, e) => (!m || e.objetivo > m.objetivo ? e : m), null);
    return { semanasCerradas: todas.length, racha, filas, mejor };
  }, [archivoDesafio, mejorVigente, semanaMesa]);
  // v352 EL SALÓN DEL FANTASMA — LA MESA VIVA etapa 9: el archivo COMPLETO
  // revive como coro de fantasmas elegibles. Cero efectos nuevos: el salón
  // respira en un useMemo; la ELECCIÓN es interacción (patrón legal v168).
  // v354 EL SALÓN QUE PERMANECE — LA MESA VIVA etapa 10: la elección deja el
  // useState local y vive en la TIENDA (elegirRivalSalon): persist auto con
  // el throttle de la casa — el rival de hoy SOBREVIVE al refresco. Sin
  // elección (o si la semana elegida salió del archivo, tope 12), el fantasma
  // de la etapa 8 manda: la degradación es honesta, la casa no reescribe.
  const salon = useMemo(() => salonDeLaMesa(archivoDesafio), [archivoDesafio]);
  const rivalSalon = useGameStore((s) => s.rivalSalon);
  const elegirRivalSalon = useGameStore((s) => s.elegirRivalSalon);
  // el elegido VIVO (v356 etapa 11): la llave de la tienda solo manda si el
  // fantasma sigue en el salón — si la semana salió del archivo (tope 12),
  // la degradación es honesta: manda el fantasma y la fila 3D lo canta tal
  // cual (la casa no reescribe la historia).
  const rivalElegido = useMemo(
    () => (rivalSalon ? salon.find((f) => f.wk === rivalSalon) ?? null : null),
    [salon, rivalSalon],
  );
  // el rival de HOY: el elegido en el salón; sin elección, el fantasma de la
  // etapa 8 (el tablón no cambia — la casa manda y el default es el mejor).
  const rivalHoy = useMemo(
    () => rivalElegido ?? fantasma,
    [rivalElegido, fantasma],
  );
  const rivalVencido = rivalHoy !== null && mejorVigente !== null && mejorVigente > rivalHoy.objetivo;
  const abrirDesafio = () => { setMesa({ ...desafio }); setMesaDesafio(true); };
  const mejoresPartidas = useMemo(() => [...historial].sort((a, b) => b.objetivoAzul - a.objetivoAzul || b.fecha - a.fecha).slice(0, 3), [historial]);
  const generalesOrdenados = useMemo<General[]>(() => {
    const tu: General = { nombre: "TU · operador de Vanguard", victorias: victoriasTu, doctrinaFav: "conquista en vivo", eres: true };
    return [...hoy.generales, tu].sort((a, b) => b.victorias - a.victorias || (a.eres ? 1 : -1));
  }, [hoy, victoriasTu]);

  // ciclo OODA en marcha perpetua
  useEffect(() => {
    const iv = setInterval(() => setOodaFase((f) => (f + 1) % 4), 2600);
    return () => clearInterval(iv);
  }, []);

  const doctrina = hoy.doctrinas[docSel];
  const escenario = hoy.escenarios[escSel];

  // v168: PARIDAD 2D→3D — la escuela del mando en volumen: OODA, wargames y tabla real
  const filas3D = useMemo<FilaContenido3D[]>(() => {
    const filas: FilaContenido3D[] = [
      ...hoy.ooda.map((f, i): FilaContenido3D => ({
        t: `${i + 1} · ${f.fase}`,
        color: "#7AB8FF",
        d: f.texto,
      })),
      ...hoy.escenarios.slice(0, 4).map((e, i): FilaContenido3D => ({
        t: e.titulo,
        v: `${e.turns} TURNOS`,
        p: e.dificultad * 20,
        color: i === escSel ? "#F5C542" : "#A855F7",
        d: `dificultad ${e.dificultad}/5 · regla especial: ${e.reglaEspecial} · ${e.fuerzas.azul} contra ${e.fuerzas.rojo}`,
        a: "elegir",
      })),
      {
        // v315 LA MESA CON MEMORIA — la sala 3D también refleja tu récord real
        t: "TU MEMORIA DE LA MESA",
        v: memoria.jugadas > 0 ? `${memoria.ganadas}/${memoria.jugadas} V` : "SIN PARTIDAS",
        color: memoria.jugadas > 0 ? "#4D9DFF" : "#A855F7",
        d: memoria.jugadas > 0
          ? `mejor racha ${memoria.mejorRacha} · mejor objetivo ${memoria.mejorObjetivo}/100 — contadores propios de la escuela`
          : "juega una mesa y la escuela guardará tu partida: contadores propios, revivibles",
      },
      {
        t: `DOCTRINA EN CLASE · ${doctrina.nombre}`,
        color: RAMA_COLOR[doctrina.rama] ?? "#A855F7",
        d: `${doctrina.principio} · contra-doctrina histórica: ${doctrina.contra}`,
      },
      ...generalesOrdenados.slice(0, 3).map((g, i): FilaContenido3D => ({
        t: `${i + 1}. ${g.nombre}`,
        v: `${g.victorias} V`,
        color: g.eres ? "#7AB8FF" : "#F5C542",
        d: g.eres ? "tus victorias REALES de conquista — el puesto lo das tú, no el cartel" : `doctrina favorita: ${g.doctrinaFav}`,
      })),
      {
        // v338 LA MESA EN EL TABLÓN — el desafío de la semana en la sala 3D
        t: `DESAFÍO DE LA SEMANA · ${desafio.titulo}`,
        v: `PAR ${parDesafio(desafio.dificultad)}`,
        p: parDesafio(desafio.dificultad),
        color: "#4D9DFF",
        d: `dificultad FIJA ${desafio.dificultad}/5 · ${mejorVigente !== null ? `tu mejor mesa: ${mejorVigente}/100` : "la mesa te espera"} — la misma mesa para toda la escuela`,
        a: "abrir desafío",
      },
      {
        // v344 EL TABLÓN DE LA MESA — la fila viaja AL FINAL: el contrato de
        // «elegir» se cuenta DESDE LA CABEZA (offset 4) y no se rompe con
        // cola nueva (lección v342: el contrato manda, no la estética); la
        // acción reutiliza la rama del desafío (abrir la MISMA mesa)
        t: "TABLÓN DE LA MESA",
        v: `${puestoTu}º DE ${tablonMesa.length}`,
        p: Math.round((Math.max(0, tablonMesa.find((f) => f.propio)?.score ?? 0))),
        color: "#C9A85C",
        d: `${mejorVigente !== null ? `tu mejor mesa ${mejorVigente}/100` : "sin mesa tuya esta semana"} · rivales SIM de la escuela, deterministas por semana — tu fila es la única REAL`,
        a: "abrir desafío",
      },
      {
        // v352 EL SALÓN DEL FANTASMA — etapa 9 en la sala 3D: el coro entero
        // con la cabeza del honor; la acción reutiliza la rama del desafío.
        // v356 EL RIVAL ANUNCIADO — etapa 11: la sala 3D ya sabe a quién
        // ELEGISTE (la elección persiste en la tienda desde la etapa 10):
        // si el rival de hoy está vivo en el salón, la fila lo canta con su
        // número fijo y su duelo (VENCIDO incluido); sin elección, la cabeza
        // del honor manda como siempre. Solo cambia la palabra (d): v y p
        // siguen siendo del CORO, la elección no reordena el honor.
        t: "EL SALÓN DEL FANTASMA",
        v: salon.length > 0 ? `${salon.length} FANTASMAS` : "VACÍO",
        p: salon.length > 0 ? salon[0].objetivo : 0,
        color: "#A855F7",
        d: salon.length > 0
          ? rivalElegido && rivalHoy
            ? `tu rival de hoy: ${rivalHoy.objetivo}/100 (semana ${rivalHoy.wk})${rivalVencido ? " — RIVAL VENCIDO" : " te espera con su número fijo"} · toca otro fantasma en la mesa para cambiar de duelo`
            : `el más duro espera con su ${salon[0].objetivo}/100 fijo (${salon[0].wk}) · toca uno en la mesa y se vuelve tu rival de hoy — tu pasado NO se recalibra`
          : "tu primera mesa cerrada despierta el salón: cada semana que dejes atrás se sienta aquí con su número fijo",
        a: "abrir desafío",
      },
    ];
    return filas;
  }, [hoy, doctrina, escSel, generalesOrdenados, memoria, desafio, mejorVigente, tablonMesa, puestoTu, salon, rivalElegido, rivalHoy, rivalVencido]);
  useSala3DContenido(
    "estrategia",
    "ESTRATEGIA GLOBAL",
    "#A855F7",
    `${hoy.doctrinas.length} doctrinas · ${hoy.escenarios.length} wargames · el ranking donde TU compites`,
    filas3D,
  );
  // v168: "elegir" desde el 3D selecciona el mismo wargame que la mesa 2D
  // (offset 4: las 4 fases OODA ocupan 0-3, los escenarios empiezan en idx 4)
  useEffect(() => {
    const onAccion = (e: Event) => {
      const d = (e as CustomEvent<{ tab: string; accion: string; idx: number }>).detail;
      if (d?.tab !== "estrategia") return;
      // v338: la rama del desafío sale PRIMERO y retorna — el contrato de
      // índices de «elegir» (d.idx - 4) queda intacto (patrón v326/v328/v330)
      if (d.accion === "abrir desafío") { abrirDesafio(); return; }
      if (d.accion !== "elegir") return;
      const item = hoy.escenarios[d.idx - 4];
      if (item) setEscSel(hoy.escenarios.indexOf(item));
    };
    window.addEventListener("vg:sala3d-accion", onAccion);
    return () => window.removeEventListener("vg:sala3d-accion", onAccion);
  }, [hoy, desafio]);

  // v317 LA MESA EN LA PORTADA — el feed del home ordena el revivir: la
  // tarjeta LA MESA despacha vg:mesa-revivir con la LLAVE (fecha) y la mesa
  // busca la partida en SU fuente canónica (wargameHistorial de la tienda —
  // cero payload de fe en el evento). El evento puede llegar antes del
  // montaje perezoso (el feed navega y reintentar); el contrato es
  // idempotente y este oyente solo existe mientras la escuela está viva.
  // Patrón legal v168: evento→setState en el callback — cero escrituras de
  // estado en montaje (censo estable 9+4).
  useEffect(() => {
    const onRevivir = (e: Event) => {
      const d = (e as CustomEvent<{ fecha?: number }>).detail;
      if (!d || typeof d.fecha !== "number") return;
      const p = historial.find((x) => x.fecha === d.fecha);
      if (p) setReplay(p);
    };
    window.addEventListener("vg:mesa-revivir", onRevivir);
    return () => window.removeEventListener("vg:mesa-revivir", onRevivir);
  }, [historial]);

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Estrategia Global"
        subtitle="La escuela del mando: doctrinas, wargames con reglas y el ranking donde TU compites"
        icon={<GraduationCap className="w-4 h-4 text-violet" />}
        color="violet"
        right={<span className="text-[9px] font-mono uppercase px-2 py-1 border border-violet-hud/60 text-violet bg-violet-hud/10">CLASE DE HOY</span>}
      />
      <HeroOro panel="estrategia" />

      {/* ══════ v338 LA MESA EN EL TABLÓN — EL DESAFÍO DE LA SEMANA ══════
        LA MESA VIVA etapa 5: la misma mesa + la misma dificultad FIJA para
        toda la escuela durante la semana del tablón. La comparación es
        honesta porque la mesa es UNA; el récord es propio (contadores
        honestos) y el tablón lo pinta (el contrato al tablón, pagado). */}
      <div
        className="hud-panel border-blue-400/50 p-3 space-y-2"
        aria-label="Desafío de la semana"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <Swords className="w-4 h-4 text-blue-400" />
          <span className="text-[11px] font-caviar font-bold uppercase tracking-widest text-blue-400">Desafío de la semana</span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 bg-blue-400/15 text-blue-400 rounded">{semanaMesa}</span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 border border-amber/40 text-amber rounded">dificultad FIJA {"★".repeat(desafio.dificultad)}{"☆".repeat(5 - desafio.dificultad)}</span>
          <span className="ml-auto text-[9px] font-mono text-muted-foreground">
            {mejorVigente !== null ? `tu mejor mesa: ${mejorVigente}/100` : "la mesa te espera"}
          </span>
        </div>
        {/* v350 EL FANTASMA DE LA MESA — el chip del rival que no se recalibra.
            v352 etapa 9: el chip canta al RIVAL DE HOY — el fantasma elegido en
            el salón; sin elección sigue siendo el mejor cerrado (etapa 8). */}
        {rivalHoy && (
          <div className="flex items-center gap-2 flex-wrap">
            <Ghost className={cn("w-3.5 h-3.5", rivalVencido ? "text-emerald-400" : "text-violet-hud")} />
            <span className={cn(
              "text-[9px] font-mono px-1.5 py-0.5 rounded",
              rivalVencido ? "bg-emerald-500/10 text-emerald-300" : "bg-violet-hud/15 text-violet",
            )}>
              {rivalSalon
                ? (rivalVencido
                  ? `RIVAL VENCIDO — superaste su ${rivalHoy.objetivo}/100 de la semana ${rivalHoy.wk}`
                  : `tu rival de hoy: ${rivalHoy.objetivo}/100 · semana ${rivalHoy.wk}`)
                : (rivalVencido
                  ? `FANTASMA VENCIDO — superaste tu ${rivalHoy.objetivo}/100 de la semana ${rivalHoy.wk}`
                  : `tu fantasma te espera: ${rivalHoy.objetivo}/100 · semana ${rivalHoy.wk}`)}
            </span>
            {rivalSalon && (
              <button
                onClick={() => elegirRivalSalon(null)}
                className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-violet-hud/40 text-violet/80 hover:bg-violet-hud/10 transition-colors"
              >
                volver al mejor
              </button>
            )}
            <span className="text-[9px] font-mono text-muted-foreground/70">los cadetes se calibran a tu escala — el fantasma NO se mueve: es tu semana cerrada con su número fijo</span>
          </div>
        )}
        <p className="text-[13px] font-bold font-mono text-foreground">{desafio.titulo}</p>
        <p className="text-[10px] font-mono text-muted-foreground leading-snug">
          {desafio.fuerzas.azul} contra {desafio.fuerzas.rojo} · regla especial: {desafio.reglaEspecial} · par de la casa: {parDesafio(desafio.dificultad)}/100 (estimación de la escuela)
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={abrirDesafio}
            className="px-3 py-1.5 bg-blue-400 text-black text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-blue-300 transition-colors"
          >
            <Play className="w-3 h-3 inline mr-1" /> abrir la mesa del desafío
          </button>
          <span className="text-[9px] font-mono text-muted-foreground/80">
            la misma mesa para toda la escuela — la comparación es honesta · el tablón la anota
          </span>
        </div>

        {/* v344 EL TABLÓN DE LA MESA — LA MESA VIVA etapa 6: los cadetes de la
            escuela (SIM determinista por semana, calibrados a la escala del
            operador) alrededor de la única fila REAL — la mejor mesa propia.
            La frontera SIM/REAL viaja en pantalla (la ley de distinguir
            hechos de estimaciones). */}
        <div className="border-t border-border/40 pt-2 space-y-1" aria-label="Tablón de la mesa">
          <div className="flex items-center gap-2 flex-wrap">
            <Trophy className="w-3.5 h-3.5 text-amber" />
            <span className="text-[10px] font-caviar font-bold uppercase tracking-widest text-amber">Tablón de la mesa</span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-white/5 text-muted-foreground rounded">SIM determinista · semana {semanaMesa}</span>
            <span className="ml-auto text-[9px] font-mono text-muted-foreground">
              {mejorVigente !== null ? `tu fila: REAL · ${mejorVigente}/100` : "tu fila: REAL · sin mesa aún"}
            </span>
          </div>
          <div className="grid gap-0.5">
            {tablonMesa.map((f, i) => (
              <div
                key={`${f.tag}-${i}`}
                className={cn(
                  "flex items-center gap-2 px-2 py-1 rounded-sm text-[10px] font-mono",
                  f.propio ? "bg-blue-400/15 border border-blue-400/40" : f.fantasma ? "bg-violet-hud/10 border border-violet-hud/40" : "bg-white/[0.03]",
                )}
              >
                <span className={cn("w-5 text-right", f.propio ? "text-blue-300 font-bold" : f.fantasma ? "text-violet font-bold" : "text-muted-foreground")}>{i + 1}º</span>
                <span className={cn("truncate flex-1", f.propio ? "text-blue-100 font-bold" : f.fantasma ? "text-violet font-bold" : "text-foreground/60")}>{f.nombre}</span>
                <span className="text-muted-foreground/50 hidden sm:inline">{f.tag}</span>
                <span className={cn("w-10 text-right", f.propio ? "text-blue-300 font-bold" : f.fantasma ? "text-violet font-bold" : "text-foreground/50")}>
                  {f.propio && f.score < 0 ? "—" : `${f.score}`}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[9px] font-mono text-muted-foreground/70 leading-snug">
            rivales: cadetes SIM de la escuela — deterministas por semana, calibrados a tu escala ({mejorVigente !== null ? `tu mejor mesa` : "el par de la casa, estimación declarada"}). tu fila es la única REAL (contadores propios).{fantasma ? " TU FANTASMA también es REAL — tu mejor semana cerrada con su número fijo: no se recalibra cuando mejoras." : ""}
          </p>
        </div>

        {/* v348 EL ARCHIVO DE LA MESA — LA MESA VIVA etapa 7: las semanas
            cerradas del desafío cuentan su historia. La fila del operador es
            REAL (contadores propios); el título de cada mesa se recomputa del
            anillo y el puesto frente a la escuela de la fórmula determinista
            (SIM recomputada, se declara — la ley de distinguir hechos de
            estimaciones). */}
        <div className="border-t border-border/40 pt-2 space-y-1" aria-label="Archivo de la mesa">
          <div className="flex items-center gap-2 flex-wrap">
            <History className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] font-caviar font-bold uppercase tracking-widest text-blue-400">Archivo de la mesa</span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-white/5 text-muted-foreground rounded">
              {archivoMesa.semanasCerradas === 1 ? "1 semana cerrada" : `${archivoMesa.semanasCerradas} semanas cerradas`}
            </span>
            {archivoMesa.racha.racha > 1 && (
              <span className={cn("text-[9px] font-mono px-1.5 py-0.5 rounded", archivoMesa.racha.rota ? "bg-red-500/10 text-red-300/80" : "bg-emerald-500/10 text-emerald-300")}>
                racha {archivoMesa.racha.racha} sem · {archivoMesa.racha.rota ? "rota" : "vigente"}
              </span>
            )}
            <span className="ml-auto text-[9px] font-mono text-muted-foreground">
              {archivoMesa.mejor ? `mejor mesa: ${archivoMesa.mejor.objetivo}/100 · ${archivoMesa.mejor.wk}` : "el archivo espera"}
            </span>
          </div>
          {archivoMesa.filas.length === 0 ? (
            <p className="text-[9px] font-mono text-muted-foreground/70 leading-snug">
              {mejorVigente !== null
                ? "tu semana vigente aún no cierra: cuando la llave gire y vuelvas a la mesa, entrará al archivo"
                : "sin semanas cerradas aún — juega el desafío y, cuando la semana gire, tu mesa entra aquí"}
            </p>
          ) : (
            <div className="grid gap-0.5">
              {archivoMesa.filas.map((f) => (
                <div key={f.wk} className="flex items-center gap-2 px-2 py-1 rounded-sm text-[10px] font-mono bg-white/[0.03]">
                  <span className="w-14 text-muted-foreground/60 hidden sm:inline">{f.wk}</span>
                  <span className="truncate flex-1 text-foreground/70">
                    {f.titulo} <span className="text-amber/50">{"★".repeat(f.dificultad)}</span>
                  </span>
                  <span className="text-amber/80 whitespace-nowrap">{f.puesto}º de la escuela</span>
                  <span className="w-10 text-right text-blue-300 font-bold">{f.objetivo}</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-[9px] font-mono text-muted-foreground/70 leading-snug">
            archivo: tus filas son REALES (contadores propios — cada semana guarda su mejor mesa, tope 12); el título de cada mesa se recomputa del anillo y el puesto de la escuela es SIM recomputada con la escala real de aquella semana.
          </p>
        </div>

        {/* v352 EL SALÓN DEL FANTASMA — LA MESA VIVA etapa 9: cada semana
            cerrada del archivo revive como un fantasma ELEGIBLE — el coro
            completo de tus pasados. Toca uno y se vuelve tu RIVAL DE HOY (el
            chip del desafío canta su número fijo). Las filas son REALES
            (contadores propios); título/puesto recomputados del anillo (SIM
            recomputada, se declara). Sin archivo el salón duerme. */}
        <div className="border-t border-border/40 pt-2 space-y-1" aria-label="Salón del fantasma">
          <div className="flex items-center gap-2 flex-wrap">
            <Ghost className="w-3.5 h-3.5 text-violet-hud" />
            <span className="text-[10px] font-caviar font-bold uppercase tracking-widest text-violet">Salón del fantasma</span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-white/5 text-muted-foreground rounded">
              {salon.length === 1 ? "1 fantasma" : `${salon.length} fantasmas`}
            </span>
            {rivalSalon && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 bg-violet-hud/15 text-violet rounded">rival de hoy: semana {rivalSalon}</span>
            )}
            <span className="ml-auto text-[9px] font-mono text-muted-foreground">
              {salon.length > 0 ? `el más duro: ${salon[0].objetivo}/100` : "el salón duerme"}
            </span>
          </div>
          {salon.length === 0 ? (
            <p className="text-[9px] font-mono text-muted-foreground/70 leading-snug">
              sin semanas cerradas aún — tu primera mesa cerrada despierta el salón y cada semana que dejes atrás se sienta aquí como un rival con su número fijo
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {salon.map((f) => {
                  const vencido = mejorVigente !== null && mejorVigente > f.objetivo;
                  const elegido = rivalSalon === f.wk;
                  return (
                    <button
                      key={f.wk}
                      onClick={() => elegirRivalSalon(elegido ? null : f.wk)}
                      aria-pressed={elegido}
                      className={cn(
                        "text-left px-2 py-1.5 rounded-sm text-[10px] font-mono transition-colors border",
                        elegido
                          ? "bg-violet-hud/15 border-violet-hud/60"
                          : "bg-white/[0.03] border-transparent hover:border-violet-hud/30",
                      )}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className={cn("font-bold", elegido ? "text-violet" : "text-foreground/70")}>
                          {f.esMejor ? "TU FANTASMA" : "tu fantasma"}
                        </span>
                        <span className="text-muted-foreground/50 hidden sm:inline">{f.wk}</span>
                        {vencido && <span className="text-[8px] px-1 rounded bg-emerald-500/15 text-emerald-300">VENCIDO</span>}
                        <span className="ml-auto text-blue-300 font-bold">{f.objetivo}/100</span>
                      </span>
                      <span className="block truncate text-[9px] text-muted-foreground/70 mt-0.5">
                        {f.titulo} <span className="text-amber/50">{"★".repeat(f.dificultad)}</span> · {f.puesto}º de la escuela esa semana
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[9px] font-mono text-muted-foreground/70 leading-snug">
                toca un fantasma y se vuelve tu rival de hoy: su número es REAL (contadores propios) y NO se recalibra — el título y el puesto de la escuela se recomputan del anillo (SIM recomputada, se declara). el tablón sigue cantando al mejor: tu fantasma de la etapa 8.
              </p>
            </>
          )}
        </div>
      </div>

      {/* CICLO OODA */}
      <div className="hud-panel border-violet-hud/40 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border/60 bg-violet-hud/5 flex items-center gap-2">
          <Repeat className="w-3.5 h-3.5 text-violet" />
          <h4 className="text-[12px] font-bold uppercase tracking-wider text-foreground">El ciclo del mando (OODA)</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border/40">
          {hoy.ooda.map((f, i) => (
            <motion.div
              key={f.fase}
              animate={{
                backgroundColor: i === oodaFase ? "rgba(200,154,255,0.12)" : "rgba(0,0,0,0.2)",
                scale: i === oodaFase ? 1.015 : 1,
              }}
              transition={{ duration: 0.5 }}
              className="px-3 py-3"
            >
              <p className={cn("text-[10px] font-mono tracking-[0.25em]", i === oodaFase ? "text-violet font-bold" : "text-muted-foreground")}>
                {i + 1} · {f.fase}
              </p>
              <p className="text-[11px] leading-snug text-foreground/80 mt-1">{f.texto}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* DOCTRINAS */}
        <div className="hud-panel border-violet-hud/40 overflow-hidden">
          <div className="px-3 py-2 border-b border-border/60 bg-violet-hud/5 flex items-center gap-1.5">
            <BrainCircuit className="w-3.5 h-3.5 text-violet" />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-foreground">Escuela de doctrinas</h4>
          </div>
          <div className="flex flex-wrap gap-1.5 p-2.5 border-b border-border/40">
            {hoy.doctrinas.map((d, i) => (
              <button
                key={d.id}
                onClick={() => setDocSel(i)}
                className={cn("text-[10px] font-mono px-2 py-1 border transition-colors", i === docSel ? "text-black font-bold" : "text-muted-foreground hover:text-foreground border-border")}
                style={i === docSel ? { background: RAMA_COLOR[d.rama], borderColor: RAMA_COLOR[d.rama] } : {}}
              >
                {d.nombre}
              </button>
            ))}
          </div>
          <motion.div key={doctrina.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-3 space-y-3">
            <div>
              <span className="text-[8px] font-mono px-1.5 py-0.5 border" style={{ color: RAMA_COLOR[doctrina.rama], borderColor: RAMA_COLOR[doctrina.rama] + "66" }}>
                {doctrina.rama}
              </span>
              <p className="text-[12.5px] leading-relaxed text-foreground/85 mt-1.5">{doctrina.principio}</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-[9px] font-mono uppercase tracking-widest text-violet">Árbol de mejora</p>
              {doctrina.nodos.map((n, i) => (
                <motion.div
                  key={n.nombre}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.09 }}
                  className="flex items-center gap-2 border border-border/50 px-2.5 py-2 bg-black/30"
                >
                  <span className="font-mono text-[9px] w-5 h-5 flex items-center justify-center border shrink-0" style={{ borderColor: RAMA_COLOR[doctrina.rama] + "66", color: RAMA_COLOR[doctrina.rama] }}>
                    {n.coste}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-foreground">{n.nombre}</p>
                    <p className="text-[10px] text-muted-foreground">{n.efecto}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="text-[10px] font-mono text-muted-foreground border-t border-dashed border-border/40 pt-2">
              contra-doctrina histórica: <span className="text-foreground/80">{doctrina.contra}</span>
            </p>
          </motion.div>
        </div>

        {/* WARGAMES */}
        <div className="hud-panel border-violet-hud/40 overflow-hidden">
          <div className="px-3 py-2 border-b border-border/60 bg-violet-hud/5 flex items-center gap-1.5">
            <Swords className="w-3.5 h-3.5 text-violet" />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-foreground">Mesa de wargames <span className="text-[9px] font-mono text-muted-foreground font-normal">· hoy tocan {hoy.escenarios.length} de 10</span></h4>
          </div>
          <div className="divide-y divide-border/40">
            {hoy.escenarios.map((e, i) => (
              <button
                key={e.id}
                onClick={() => setEscSel(i)}
                className={cn("w-full text-left px-3 py-2 hover:bg-violet-hud/5 transition-colors", i === escSel && "bg-violet-hud/10")}
              >
                <div className="flex items-center gap-2">
                  <p className="text-[12px] font-semibold text-foreground flex-1">{e.titulo}</p>
                  <span className="text-[9px] font-mono text-amber shrink-0">{"★".repeat(e.dificultad)}{"☆".repeat(5 - e.dificultad)}</span>
                </div>
                <p className="text-[9px] font-mono text-muted-foreground">{e.turns} turnos · dificultad {e.dificultad}/5</p>
              </button>
            ))}
          </div>
          <motion.div key={escenario.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 space-y-2 bg-black/20 border-t border-border/40">
            <div className="grid grid-cols-2 gap-2">
              <div className="border-l-2 pl-2" style={{ borderColor: "#4D9DFF" }}>
                <p className="text-[8px] font-mono uppercase text-muted-foreground">Fuerza azul</p>
                <p className="text-[11px] text-foreground/85 leading-snug">{escenario.fuerzas.azul}</p>
              </div>
              <div className="border-l-2 pl-2" style={{ borderColor: "#FF4D4D" }}>
                <p className="text-[8px] font-mono uppercase text-muted-foreground">Fuerza roja</p>
                <p className="text-[11px] text-foreground/85 leading-snug">{escenario.fuerzas.rojo}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[8px] font-mono uppercase text-blue-400">Objetivo azul</p>
                <p className="text-[10.5px] text-foreground/75 leading-snug">{escenario.objetivoAzul}</p>
              </div>
              <div>
                <p className="text-[8px] font-mono uppercase text-red">Objetivo rojo</p>
                <p className="text-[10.5px] text-foreground/75 leading-snug">{escenario.objetivoRojo}</p>
              </div>
            </div>
            <p className="text-[10px] font-mono text-amber border border-amber/40 px-2 py-1.5 bg-amber-hud/5">
              regla especial: {escenario.reglaEspecial}
            </p>
            {/* v314 LA MESA VIVA: el escenario deja de ser ficha — se juega */}
            <button
              onClick={() => { setMesa(escenario); setMesaDesafio(false); }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-violet-hud bg-violet-hud/20 text-violet hover:bg-violet-hud/40 transition-colors text-[11px] font-mono uppercase tracking-wider"
            >
              <Play className="w-3.5 h-3.5" /> jugar esta mesa · {escenario.turns} turnos
            </button>
            {/* v315 LA MESA CON MEMORIA: el récord real del operador en esta
                escuela — contadores propios (jamás conquestWins) y el tablero
                de las mejores partidas con su revivir determinista */}
            <div className="border-t border-dashed border-border/40 pt-2 space-y-2">
              <p className="text-[9px] font-mono uppercase tracking-widest text-violet flex items-center gap-1.5">
                <History className="w-3 h-3" /> memoria del operador
              </p>
              <div className="grid grid-cols-4 gap-1.5 text-center">
                <div className="border border-border/50 px-1 py-1.5 bg-black/30">
                  <p className="text-[13px] font-bold text-foreground tabular-nums">{memoria.jugadas}</p>
                  <p className="text-[7.5px] font-mono uppercase text-muted-foreground">partidas</p>
                </div>
                <div className="border border-border/50 px-1 py-1.5 bg-black/30">
                  <p className="text-[13px] font-bold text-blue-400 tabular-nums">{memoria.ganadas}</p>
                  <p className="text-[7.5px] font-mono uppercase text-muted-foreground">ganadas</p>
                </div>
                <div className="border border-border/50 px-1 py-1.5 bg-black/30">
                  <p className="text-[13px] font-bold text-amber tabular-nums">{memoria.mejorRacha}</p>
                  <p className="text-[7.5px] font-mono uppercase text-muted-foreground">mejor racha</p>
                </div>
                <div className="border border-border/50 px-1 py-1.5 bg-black/30">
                  <p className="text-[13px] font-bold text-violet tabular-nums">{memoria.mejorObjetivo}</p>
                  <p className="text-[7.5px] font-mono uppercase text-muted-foreground">mejor objetivo</p>
                </div>
              </div>
              <p className="text-[9px] font-mono text-muted-foreground">
                insignias de la escuela: <span className="text-amber font-bold">{insigniasCazadas}</span> de {totalInsignias} — se cazan jugando la mesa
              </p>
              {mejoresPartidas.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[8px] font-mono uppercase text-muted-foreground">mejores partidas · revivibles (el motor determinista las re-juega al exacto)</p>
                  {mejoresPartidas.map((p, i) => (
                    <div key={`${p.escId}-${p.fecha}`} className="flex items-center gap-2 border border-border/50 px-2 py-1.5 bg-black/30">
                      <span className="text-[9px] font-mono text-amber w-4 text-center">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold text-foreground truncate">{p.titulo}</p>
                        <p className="text-[8.5px] font-mono text-muted-foreground">
                          {p.objetivoAzul}/100 · {p.ganaAzul ? "victoria azul" : "sin victoria"} · {new Date(p.fecha).toLocaleDateString("es", { day: "2-digit", month: "short" })}
                        </p>
                      </div>
                      <button
                        onClick={() => setReplay(p)}
                        title="Revivir la partida (replay determinista, sin botín)"
                        className="flex items-center gap-1 text-[9px] font-mono uppercase px-1.5 py-1 border border-violet-hud/60 text-violet hover:bg-violet-hud/20 transition-colors flex-shrink-0"
                      >
                        <RotateCcw className="w-3 h-3" /> revivir
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-3">
        {/* LECCIONES */}
        <div className="hud-panel border-border/60 overflow-hidden">
          <div className="px-3 py-2 border-b border-border/60">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-foreground/80">Lecciones del aula <span className="text-[9px] font-mono text-muted-foreground font-normal">· {hoy.lecciones.length} de 10 cada día</span></h4>
          </div>
          <div className="divide-y divide-border/40">
            {hoy.lecciones.map((l, i) => (
              <motion.div key={l.titulo} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="px-4 py-3">
                <p className="text-[13px] font-bold text-foreground">{i + 1}. {l.titulo}</p>
                <p className="text-[12px] leading-relaxed text-foreground/70 mt-1">{l.cuerpo}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* RANKING DE GENERALES */}
        <div className="hud-panel border-amber-hud/40 overflow-hidden">
          <div className="px-3 py-2 border-b border-border/60 bg-amber-hud/5 flex items-center gap-1.5">
            <Medal className="w-3.5 h-3.5 text-amber" />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-foreground">Tabla de generales</h4>
          </div>
          <div className="divide-y divide-border/40">
            {generalesOrdenados.map((g, i) => (
              <div key={g.nombre} className={cn("px-3 py-2 flex items-center gap-2.5", g.eres ? "bg-amber-hud/10 border-t-2 border-amber" : i >= 3 && "opacity-80")}>
                <span className={cn("font-black w-6 text-center", g.eres || i < 3 ? "text-[13px] text-amber" : "text-[12px] text-muted-foreground")}>{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className={cn("truncate", g.eres ? "text-[12px] font-bold text-amber" : i < 3 ? "text-[12px] font-semibold text-foreground" : "text-[11.5px] font-semibold text-foreground/85")}>
                    {g.nombre}{g.eres && <span className="ml-1.5 text-[8px] font-mono px-1 py-0.5 border border-amber/50 text-amber uppercase">real</span>}
                  </p>
                  <p className="text-[9px] font-mono text-muted-foreground">{g.doctrinaFav}</p>
                </div>
                <span className={cn("font-mono", g.eres || i < 3 ? "text-[12px] text-foreground/90" : "text-[11px] text-foreground/70")}>{g.victorias} V</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* v314: la mesa viva — el portal libra la mesa del wrapper de transición
          (la misma cura del ancla robada que la cámara de la v135) */}
      {mesa && <MesaWargame esc={mesa} onCerrar={() => setMesa(null)} desafioSemana={mesaDesafio ? semanaMesa : null} />}
      {/* v315: el revivir — replay determinista de una partida guardada */}
      {replay && <ReplayMesa partida={replay} onCerrar={() => setReplay(null)} />}
    </div>
  );
}

// v314.0 LA MESA VIVA — el wargame por decisiones: el operador elige la
// jugada de cada turno y el motor determinista (wargame-motor, cero
// Math.random) mueve el frente y narra. Recompensa honesta por la tienda
// del juego (addCoins/addXp) SOLO en el handler de la jugada final — cero
// escrituras de estado en efectos (la ley del censo).
function MesaWargame({ esc, onCerrar, desafioSemana }: { esc: EscenarioWargame; onCerrar: () => void; desafioSemana?: string | null }) {
  const [estado, setEstado] = useState<EstadoWargame>(() => estadoInicial(esc));
  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);
  // v315 LA MESA CON MEMORIA: la partida se guarda al cerrar — en el MISMO
  // handler de la jugada final (cero escrituras de estado en efectos).
  const recordWargame = useGameStore((s) => s.recordWargame);
  // v338 LA MESA EN EL TABLÓN — si esta mesa ES el desafío de la semana, el
  // objetivo final queda anotado en el récord de la semana del tablón
  const recordDesafio = useGameStore((s) => s.recordDesafio);
  const desafioMejor = useGameStore((s) => s.desafioMejor);
  const mejorDesafio = desafioSemana && desafioMejor?.wk === desafioSemana ? desafioMejor.objetivo : null;
  const stats = useGameStore((s) => s.wargameStats);
  const [ruta, setRuta] = useState<string[]>([]);

  // Escape honesto + el fondo deja de desplazar mientras la mesa está abierta
  // (efecto PURO: ninguna escritura de estado — la ley del censo)
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => { if (e.key === "Escape") onCerrar(); };
    window.addEventListener("keydown", alTeclear);
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = previo;
    };
  }, [onCerrar]);

  const jugar = (idx: number) => {
    const jugada = jugadasDeTurno(esc, estado.turno)[idx];
    const siguiente = resolverJugada(esc, estado, jugada);
    setEstado(siguiente);
    const rutaCompleta = [...ruta, jugada.id];
    setRuta(rutaCompleta);
    if (siguiente.cerrada) {
      const v = veredictoDe(esc, siguiente);
      addCoins(v.botinCoins, `wargame ${esc.id} — veredicto de la mesa`);
      addXp(v.botinXp);
      // v315: la memoria de la mesa — la partida con sus jugadas exactas
      // queda guardada (revivible por el motor determinista)
      recordWargame({
        escId: esc.id,
        titulo: esc.titulo,
        dificultad: esc.dificultad,
        jugadas: rutaCompleta,
        objetivoAzul: siguiente.objetivoAzul,
        objetivoRojo: siguiente.objetivoRojo,
        ganaAzul: v.ganaAzul,
        botinCoins: v.botinCoins,
        botinXp: v.botinXp,
      });
      // v338: el contrato al tablón — el mejor objetivo del desafío de la
      // semana se anota (Math.max dentro de la semana, contadores honestos)
      if (desafioSemana) recordDesafio(desafioSemana, siguiente.objetivoAzul);
    }
  };

  const veredicto = estado.cerrada ? veredictoDe(esc, estado) : null;
  const jugadas = estado.cerrada ? [] : jugadasDeTurno(esc, estado.turno);
  const RIESGO_COLOR: Record<string, string> = { bajo: "#34C759", medio: "#FFC94D", alto: "#FF3B30" };

  return createPortal(
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-2 sm:p-6" role="dialog" aria-label={`Mesa de wargame: ${esc.titulo}`}>
      <button aria-label="Cerrar mesa" onClick={onCerrar} className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-default" />
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto hud-panel border-violet-hud shadow-[0_30px_120px_-20px_rgba(0,0,0,0.95)]">
        {/* cabecera */}
        <div className="sticky top-0 z-10 flex items-center gap-2 px-3 sm:px-4 py-2.5 border-b border-violet-hud/60 bg-[#0B0B12]/95 backdrop-blur-sm">
          <div className="w-8 h-8 hud-corner flex items-center justify-center border-violet-hud text-violet flex-shrink-0">
            <Swords className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-caviar text-sm sm:text-base font-bold tracking-[0.14em] uppercase text-violet truncate">{esc.titulo}</h2>
            <p className="text-[9px] font-mono text-muted-foreground uppercase truncate">{desafioSemana ? "desafío de la semana · la misma mesa para toda la escuela" : `mesa viva · ${esc.fuerzas.azul} contra ${esc.fuerzas.rojo}`}</p>
          </div>
          <button onClick={onCerrar} title="Cerrar (Esc)" className="w-7 h-7 hud-corner flex items-center justify-center border-violet-hud text-violet hover:bg-violet-hud transition-colors flex-shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-3 sm:p-4 space-y-3">
          {/* el frente: moral, reserva y objetivos con barras vivas */}
          <div className="grid grid-cols-2 gap-2">
            <div className="hud-corner p-2 space-y-1.5">
              <p className="text-[8px] font-mono uppercase text-muted-foreground flex justify-between"><span>moral azul</span><span className="text-blue-400 font-bold tabular-nums">{estado.moralAzul}</span></p>
              <div className="h-1.5 bg-secondary overflow-hidden"><div className="h-full transition-all duration-500" style={{ width: `${estado.moralAzul}%`, background: "#4D9DFF" }} /></div>
              <p className="text-[8px] font-mono uppercase text-muted-foreground flex justify-between"><span>objetivo azul</span><span className="text-blue-400 font-bold tabular-nums">{estado.objetivoAzul}/100</span></p>
              <div className="h-1.5 bg-secondary overflow-hidden"><div className="h-full transition-all duration-500" style={{ width: `${estado.objetivoAzul}%`, background: "#4D9DFF" }} /></div>
            </div>
            <div className="hud-corner p-2 space-y-1.5">
              <p className="text-[8px] font-mono uppercase text-muted-foreground flex justify-between"><span>moral roja</span><span className="text-red font-bold tabular-nums">{estado.moralRojo}</span></p>
              <div className="h-1.5 bg-secondary overflow-hidden"><div className="h-full transition-all duration-500" style={{ width: `${estado.moralRojo}%`, background: "#FF3B30" }} /></div>
              <p className="text-[8px] font-mono uppercase text-muted-foreground flex justify-between"><span>reserva</span><span className="text-amber font-bold tabular-nums">{estado.reserva}</span></p>
              <div className="h-1.5 bg-secondary overflow-hidden"><div className="h-full transition-all duration-500" style={{ width: `${estado.reserva}%`, background: "#FFC94D" }} /></div>
            </div>
          </div>

          {/* la bitácora de la mesa */}
          <div className="hud-corner p-2 max-h-44 overflow-y-auto space-y-1">
            {estado.bitacora.slice(-8).map((l, i) => (
              <p key={`${l.turno}-${i}`} className={cn("text-[10.5px] font-mono leading-snug", l.tono === "azul" ? "text-blue-400" : l.tono === "rojo" ? "text-red" : "text-amber/90")}>
                <span className="text-muted-foreground">T{String(l.turno).padStart(2, "0")} ·</span> {l.texto}
              </p>
            ))}
          </div>

          {/* las jugadas de la mesa (o el veredicto) */}
          {estado.cerrada && veredicto ? (
            <div className={cn("hud-corner p-3 space-y-2", veredicto.ganaAzul ? "v135-veredicto" : "")}>
              <p className={cn("text-sm font-caviar font-bold uppercase tracking-wide", veredicto.ganaAzul ? "text-blue-400" : veredicto.ganaRojo ? "text-red" : "text-amber")}>
                {veredicto.ganaAzul ? "objetivo azul cumplido" : veredicto.ganaRojo ? "el rojo impone su objetivo" : "la mesa cierra en empate"}
              </p>
              <p className="text-[10px] font-mono text-muted-foreground">
                botín de la mesa: <span className="text-amber font-bold">+{veredicto.botinCoins} monedas</span> · <span className="text-violet font-bold">+{veredicto.botinXp} XP</span> — cobrado en tu cuenta de Vanguard
              </p>
              <p className="text-[9px] font-mono text-muted-foreground/70 border border-border/60 px-1.5 py-0.5 inline-block">partida determinista · las mismas jugadas reproducen la misma mesa · ficción de la escuela</p>
              {estado.cerrada && (
                <p className="text-[9.5px] font-mono text-violet border border-violet-hud/40 px-2 py-1 bg-violet-hud/5">
                  memoria de la mesa: <span className="font-bold">{stats.jugadas}</span> partidas · <span className="font-bold text-blue-400">{stats.ganadas}</span> ganadas · racha <span className="font-bold">{stats.racha}</span> (mejor {stats.mejorRacha}) — la partida quedó guardada para revivir
                </p>
              )}
              {desafioSemana && (
                <p className="text-[9.5px] font-mono text-blue-400 border border-blue-400/40 px-2 py-1 bg-blue-400/5">
                  desafío de la semana: {mejorDesafio !== null ? `tu mejor mesa: ${mejorDesafio}/100 — el tablón de la escuela la anota` : "el tablón de la escuela la anota"}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[9px] font-mono uppercase tracking-widest text-violet">turno {estado.turno} de {estado.total} — elige la jugada</p>
              {jugadas.map((j, i) => (
                <button key={j.id} onClick={() => jugar(i)} className="w-full text-left flex items-center gap-2.5 border border-border/60 px-2.5 py-2 hover:bg-violet-hud/10 transition-colors">
                  <span className="w-14 text-center text-[8px] font-mono uppercase px-1 py-0.5 border flex-shrink-0" style={{ color: RIESGO_COLOR[j.riesgo], borderColor: RIESGO_COLOR[j.riesgo] + "66" }}>{j.riesgo}</span>
                  <span className="min-w-0">
                    <span className="block text-[12px] font-semibold text-foreground">{j.nombre}</span>
                    <span className="block text-[10px] text-muted-foreground leading-snug">{j.descripcion}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

// v315.0 LA MESA CON MEMORIA — EL REVIVIR: el determinismo del motor hace el
// replay gratis — la partida guardada trae sus jugadas exactas y la mesa
// original (escenarioPorId con la dificultad GUARDADA: la v313 re-tira la
// dificultad cada día y sin ella el replay no sería exacto). El replay es
// CINE, no economía: CERO addCoins/addXp — la mesa solo se paga una vez.
function ReplayMesa({ partida, onCerrar }: { partida: PartidaMesa; onCerrar: () => void }) {
  const esc = useMemo(() => escenarioPorId(partida.escId, partida.dificultad as EscenarioWargame["dificultad"]), [partida.escId, partida.dificultad]);
  // el curso completo: re-jugar la ruta guardada turno a turno (puro, memo)
  const curso = useMemo(() => {
    if (!esc) return null;
    let st = estadoInicial(esc);
    for (let t = 1; t <= esc.turns; t++) {
      const elegida = jugadasDeTurno(esc, t).find((j) => j.id === partida.jugadas[t - 1]);
      if (!elegida) return null; // la escuela cambió el arsenal: fallo honesto
      st = resolverJugada(esc, st, elegida);
    }
    return st;
  }, [esc, partida.jugadas]);
  const veredicto = esc && curso ? veredictoDe(esc, curso) : null;

  // Escape honesto (la misma ley de la mesa viva) — efecto PURO
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => { if (e.key === "Escape") onCerrar(); };
    window.addEventListener("keydown", alTeclear);
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = previo;
    };
  }, [onCerrar]);

  const exacto = !!veredicto && veredicto.ganaAzul === partida.ganaAzul && curso?.objetivoAzul === partida.objetivoAzul;

  return createPortal(
    <div className="fixed inset-0 z-[96] flex items-center justify-center p-2 sm:p-6" role="dialog" aria-label={`Replay de la mesa: ${partida.titulo}`}>
      <button aria-label="Cerrar replay" onClick={onCerrar} className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-default" />
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto hud-panel border-violet-hud shadow-[0_30px_120px_-20px_rgba(0,0,0,0.95)]">
        {/* cabecera */}
        <div className="sticky top-0 z-10 flex items-center gap-2 px-3 sm:px-4 py-2.5 border-b border-violet-hud/60 bg-[#0B0B12]/95 backdrop-blur-sm">
          <div className="w-8 h-8 hud-corner flex items-center justify-center border-violet-hud text-violet flex-shrink-0">
            <History className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-caviar text-sm sm:text-base font-bold tracking-[0.14em] uppercase text-violet truncate">revivir · {partida.titulo}</h2>
            <p className="text-[9px] font-mono text-muted-foreground uppercase truncate">
              replay determinista · {new Date(partida.fecha).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" })} · dificultad {partida.dificultad}/5
            </p>
          </div>
          <button onClick={onCerrar} title="Cerrar (Esc)" className="w-7 h-7 hud-corner flex items-center justify-center border-violet-hud text-violet hover:bg-violet-hud transition-colors flex-shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-3 sm:p-4 space-y-3">
          {!esc || !curso || !veredicto ? (
            <p className="text-[11px] font-mono text-amber border border-amber/40 px-2.5 py-2 bg-amber-hud/5">
              esta partida ya no puede revivirse: la escuela cambió su currículo desde entonces — la memoria guarda la lección, no el estreno
            </p>
          ) : (
            <>
              {/* el frente final: el mismo curso, las mismas decisiones */}
              <div className="grid grid-cols-2 gap-2">
                <div className="hud-corner p-2 space-y-1.5">
                  <p className="text-[8px] font-mono uppercase text-muted-foreground flex justify-between"><span>moral azul</span><span className="text-blue-400 font-bold tabular-nums">{curso.moralAzul}</span></p>
                  <div className="h-1.5 bg-secondary overflow-hidden"><div className="h-full" style={{ width: `${curso.moralAzul}%`, background: "#4D9DFF" }} /></div>
                  <p className="text-[8px] font-mono uppercase text-muted-foreground flex justify-between"><span>objetivo azul</span><span className="text-blue-400 font-bold tabular-nums">{curso.objetivoAzul}/100</span></p>
                  <div className="h-1.5 bg-secondary overflow-hidden"><div className="h-full" style={{ width: `${curso.objetivoAzul}%`, background: "#4D9DFF" }} /></div>
                </div>
                <div className="hud-corner p-2 space-y-1.5">
                  <p className="text-[8px] font-mono uppercase text-muted-foreground flex justify-between"><span>moral roja</span><span className="text-red font-bold tabular-nums">{curso.moralRojo}</span></p>
                  <div className="h-1.5 bg-secondary overflow-hidden"><div className="h-full" style={{ width: `${curso.moralRojo}%`, background: "#FF3B30" }} /></div>
                  <p className="text-[8px] font-mono uppercase text-muted-foreground flex justify-between"><span>objetivo rojo</span><span className="text-red font-bold tabular-nums">{curso.objetivoRojo}/100</span></p>
                  <div className="h-1.5 bg-secondary overflow-hidden"><div className="h-full" style={{ width: `${curso.objetivoRojo}%`, background: "#FF3B30" }} /></div>
                </div>
              </div>

              {/* la bitácora completa del curso revivido */}
              <div className="hud-corner p-2 max-h-56 overflow-y-auto space-y-1">
                {curso.bitacora.map((l, i) => (
                  <p key={i} className={cn("text-[10.5px] font-mono leading-snug", l.tono === "azul" ? "text-blue-400" : l.tono === "rojo" ? "text-red" : "text-amber/90")}>
                    <span className="text-muted-foreground">T{String(l.turno).padStart(2, "0")} ·</span> {l.texto}
                  </p>
                ))}
              </div>

              {/* el veredicto revivido: EXACTO al original o se confiesa */}
              <div className="hud-corner p-3 space-y-2">
                <p className={cn("text-sm font-caviar font-bold uppercase tracking-wide", veredicto.ganaAzul ? "text-blue-400" : veredicto.ganaRojo ? "text-red" : "text-amber")}>
                  {veredicto.ganaAzul ? "objetivo azul cumplido" : veredicto.ganaRojo ? "el rojo impone su objetivo" : "la mesa cierra en empate"}
                </p>
                <p className="text-[10px] font-mono text-muted-foreground">
                  {exacto
                    ? `replay EXACTO: ${curso.objetivoAzul}/100 como la partida original — las mismas jugadas, la misma mesa`
                    : "replay desviado del original: el currículo cambió desde entonces — la mesa es honesta incluso con su pasado"}
                </p>
                <p className="text-[9px] font-mono text-muted-foreground/70 border border-border/60 px-1.5 py-0.5 inline-block">
                  replay determinista · sin botín — la mesa solo se paga una vez · ficción de la escuela
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

"use client";

// ══════════════════════════════════════════════════════════════════════
// v365.0 LA GRAN BIBLIOTECA — el módulo del Dueño: «la biblioteca funciona
// como un libro de política: las constituciones de cada país y las cosas
// importantes para el mundo geopolítico, que uno puede seleccionar y
// buscar». TRES salas bajo un mismo techo:
//
//   ① CONSTITUCIONES — la estantería real de las cartas magnas vigentes:
//      buscar, filtrar por región y abrir la FICHA ELEGANTE de cada país.
//   ② GEOPOLÍTICA — los tratados, doctrinas y conceptos que mueven el
//      tablero desde 1648, con su «por qué importa».
//   ③ ARSENAL — LA ARMERÍA DEL MUNDO (v365): las armas de TODAS las
//      familias — nuclear, química, biológica, blindada, aérea, naval,
//      misiles, drones, cibernética — como dossier escolar: qué fue,
//      cuándo fue y por qué cambió el mundo. Consecuencias, no recetas.
//   ④ SECRETA — la Biblioteca Secreta de v13/v336 intacta, montada TAL
//      CUAL (el contrato de sus 2 efectos y su anillo no se tocan).
//
//   LA CÁTEDRA (la ficha escolar): misiones diarias con el reloj CENTRAL
//   de la escuela (ley v324), el saludo que le habla a la persona según su
//   NIVEL y su REGULARIDAD, el progreso marcado AL LADO de cada misión y
//   el EXAMEN DEL DÍA — saber más da puntos, como en la escuela.
//
//   LA CARTA DEL DEBER (v365): la carta OBLIGATORIA — se abre sola al
//   entrar mientras el deber del día esté a medias, solo cierra con un
//   toque explícito, y si te fuiste incompleto vuelve vestida de rojo con
//   su sello INCOMPLETO estampado. El deber hecho la viste verde.
//
//   v366.0 EL IMÁN — la ciencia de retención de las plataformas top,
//   aplicada a la escuela con la honestidad de la casa:
//   ⑤ LA MADRIGUERA — «DE AQUÍ SALTA A»: cada ficha abre la siguiente
//     (misma época, misma región, misma familia — datos reales, un toque).
//   ⑥ EL BONO SORPRESA DEL ARCHIVO — recompensa variable honesta: el
//     sorteo del día ya está decidido (15-60 mon, 1 de 8 dorado), el toque
//     lo cobra; la regla está a la vista, la sorpresa es el monto.
//   ⑦ EL ESCALÓN SIGUIENTE — «SOLO TE FALTAN N XP» con barra real y el
//     siguiente título del lector.
//   ⑧ EL EXAMEN ES DE TODOS — el mismo examen para toda la escuela,
//     caduca a medianoche (urgencia real, cero relojes nuevos).
//   ⑨ NUEVA — las fichas sin leer lucen su chip: es verdad que no la leíste.
//
//   CERO efectos: cada gesto firma el día (leer, buscar, examinar) — la
//   racha cuenta días de estudio real, no días de mirar (ley v335).
//   El saludo es useMemo puro; el examen gira con diaDelAnillo().
// ══════════════════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  BookMarked, Globe2, BookLock, Search, GraduationCap, Flame, Library,
  ScrollText, X, Trophy, CheckCircle2, Circle, Coins, Star, Landmark,
  Bomb, AlertTriangle, ClipboardList, Gift, Sparkles, ChevronRight,
} from "lucide-react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { Countryball } from "@/components/vanguard/countryball";
import { useGameStore } from "@/lib/game-store";
import { cn } from "@/lib/utils";
import { SecretLibraryPanel } from "@/components/vanguard/panels/biblioteca-panel";
import { diaDelAnillo } from "@/lib/estrategia-data";
import {
  CONSTITUCIONES, GEOPOLITICA, REGIONES, TIPOS_GEO,
  XP_POR_FICHA_NUEVA, XP_POR_ACIERTO,
  misionesDeHoy, examenDelDia, saludoCatedra, nivelLector, nivelLectorSiguiente,
  bonoDelDia, REGLA_BONO,
  saltosDesdeConstitucion, saltosDesdeGeo, saltosDesdeArma,
  useEstudioBiblioteca, selloLectura,
  type Constitucion, type PiezaGeo, type Region, type TipoGeo, type Salto,
} from "@/lib/biblioteca-data";
import { xpForLevel, getRankForLevel } from "@/lib/game-data";
import {
  ARSENAL, FAMILIAS_ARMAS, CLASES_ARMAS,
  type PiezaArma, type FamiliaArma, type ClaseArma,
} from "@/lib/biblioteca-armas-data";
import {
  useCartaDeber, useCartaAbierta, debeAbrirLaCarta, estadoDeberDeHoy,
  misionesPendientesDeHoy, montarCanalCarta,
} from "@/lib/biblioteca-carta-data";

// el canal de UI de la carta vive listo desde el módulo (patrón del store
// de la casa: creadores inyectados fuera de la fábrica)
montarCanalCarta();

// la firma de hoy, sin reloj nuevo (el mismo es-ES de la casa)
function firmaDeHoy(): string {
  try {
    return new Date().toLocaleDateString("es-ES", { year: "numeric", month: "2-digit", day: "2-digit" });
  } catch { return ""; }
}

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

type Sala = "constituciones" | "geopolitica" | "arsenal" | "secreta";

export function GranBibliotecaPanel() {
  const [sala, setSala] = useState<Sala>("constituciones");

  // LA CARTA OBLIGATORIA: se juzga UNA vez, en el estado inicial del panel
  // (cero efectos, ley v335: el initializer corre en el primer render de
  // este componente ssr:false — ya en el navegador, sin hidratación)
  const [checada] = useState(() => {
    if (debeAbrirLaCarta()) useCartaAbierta.getState().abrir();
    return true;
  });
  const cartaAbierta = useCartaAbierta((s) => s.abierta);
  void checada;

  return (
    <div className="space-y-3">
      <PanelHeader
        title="LA GRAN BIBLIOTECA"
        subtitle="Las constituciones del mundo, el tablero geopolítico y la armería — buscar, seleccionar y aprender por puntos, como en la escuela"
        icon={<Library className="w-4 h-4 text-amber" />}
        color="amber"
        right={
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
            {CONSTITUCIONES.length} cartas · {GEOPOLITICA.length} piezas · {ARSENAL.length} dossiers
          </span>
        }
      />

      {/* LAS CUATRO SALAS — chips como la casa usa en la máquina */}
      <div data-testid="biblio-salas" className="flex gap-1.5 flex-wrap">
        <button
          data-testid="biblio-sala-constituciones"
          onClick={() => setSala("constituciones")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 border rounded-sm text-[10px] font-mono uppercase font-bold tracking-wider transition-colors",
            sala === "constituciones" ? "border-amber-hud text-amber bg-amber-hud/20" : "border-border text-muted-foreground hover:text-foreground hover:border-amber-hud/50"
          )}
        >
          <Landmark className="w-3.5 h-3.5" /> CONSTITUCIONES ({CONSTITUCIONES.length})
        </button>
        <button
          data-testid="biblio-sala-geopolitica"
          onClick={() => setSala("geopolitica")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 border rounded-sm text-[10px] font-mono uppercase font-bold tracking-wider transition-colors",
            sala === "geopolitica" ? "border-amber-hud text-amber bg-amber-hud/20" : "border-border text-muted-foreground hover:text-foreground hover:border-amber-hud/50"
          )}
        >
          <Globe2 className="w-3.5 h-3.5" /> GEOPOLÍTICA ({GEOPOLITICA.length})
        </button>
        <button
          data-testid="biblio-sala-arsenal"
          onClick={() => setSala("arsenal")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 border rounded-sm text-[10px] font-mono uppercase font-bold tracking-wider transition-colors",
            sala === "arsenal" ? "border-amber-hud text-amber bg-amber-hud/20" : "border-border text-muted-foreground hover:text-foreground hover:border-amber-hud/50"
          )}
        >
          <Bomb className="w-3.5 h-3.5" /> ARSENAL ({ARSENAL.length})
        </button>
        <button
          data-testid="biblio-sala-secreta"
          onClick={() => setSala("secreta")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 border rounded-sm text-[10px] font-mono uppercase font-bold tracking-wider transition-colors",
            sala === "secreta" ? "border-amber-hud text-amber bg-amber-hud/20" : "border-border text-muted-foreground hover:text-foreground hover:border-amber-hud/50"
          )}
        >
          <BookLock className="w-3.5 h-3.5" /> SALA SECRETA
        </button>
      </div>

      {sala === "constituciones" && <SalaConstituciones />}
      {sala === "geopolitica" && <SalaGeopolitica />}
      {sala === "arsenal" && <SalaArsenal />}
      {sala === "secreta" && <SecretLibraryPanel />}

      {/* LA CARTA DEL DEBER — obligatoria mientras el deber esté a medias */}
      <AnimatePresence>
        {cartaAbierta && <CartaDelDeber />}
      </AnimatePresence>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// LA CARTA DEL DEBER — la carta obligatoria de la escuela (v365). Se abre
// SOLA mientras el deber del día esté a medias y SOLO cierra con el toque
// explícito («A ESTUDIAR»): sin X y sin cerrar por el fondo. Si te fuiste
// incompleto, vuelve vestida de rojo con su sello INCOMPLETO estampado;
// el deber hecho la viste verde. Cero efectos (ley v335): todo se deriva
// de los stores en el render.
// ══════════════════════════════════════════════════════════════════════
function CartaDelDeber() {
  const cerrarCarta = useCartaAbierta((s) => s.cerrar);
  const alias = useGameStore((s) => s.alias);
  const nivel = useGameStore((s) => s.level);
  const estudio = useEstudioBiblioteca();

  const dia = useMemo(() => diaDelAnillo(), []);
  const hoy = useMemo(() => firmaDeHoy(), []);
  const misiones = useMemo(() => misionesDeHoy(dia), [dia]);

  const vivo = estudio.misiones.dia === hoy;
  const progreso = vivo ? estudio.misiones.progreso : {};
  // el estado del deber se lee por la MISMA regla que el sello de la
  // cátedra (estadoDeberDeHoy): el día sin firmar cuenta 0 progreso —
  // una carta no puede fingir que el deber está a punto de estar vivo
  const estado = estadoDeberDeHoy();
  const fea = estado === "A MEDIAS";

  const saludo = saludoCatedra(alias, nivel, estudio.estudio.racha, Object.keys(estudio.leidas).length);

  // el ÚNICO cierre posible: el toque explícito de la mano del estudiante
  const firmarYSalir = () => {
    const completa = estado === "CUMPLIDA";
    useCartaDeber.getState().firmarVisto(completa);
    cerrarCarta();
    if (!completa) {
      toast.error("DEBER A MEDIAS — la cátedra lo apunta", {
        description: "La carta vuelve a mostrarse, vestida como merece, hasta que cumplas el deber del día.",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 bg-black/80 flex items-center justify-center p-3"
    >
      <motion.div
        initial={{ scale: 0.94, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.97, opacity: 0 }}
        data-testid="carta-deber"
        className={cn(
          "hud-panel w-full max-w-md max-h-[85vh] overflow-y-auto thin-scroll relative",
          fea ? "border-red-hud" : estado === "CUMPLIDA" ? "border-green-hud" : "neon-border",
        )}
      >
        {fea && (
          <div
            data-testid="carta-sello"
            className="absolute top-3 right-3 rotate-12 border-2 border-red-hud text-red-hud font-mono font-black text-[11px] tracking-[0.25em] px-2 py-1 select-none pointer-events-none"
          >
            INCOMPLETO
          </div>
        )}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <ClipboardList className={cn("w-4 h-4", fea ? "text-red-hud" : "text-amber")} />
            <h3 className="text-[12px] font-mono font-black uppercase tracking-widest text-foreground">
              LA CARTA DEL DEBER
            </h3>
            <span className="font-mono text-[9px] text-muted-foreground ml-auto">{hoy}</span>
          </div>

          <p
            data-testid="carta-estado"
            className={cn(
              "text-[11px] font-mono leading-snug border-l-2 pl-2",
              fea ? "border-red-hud text-red-hud" : estado === "CUMPLIDA" ? "border-green-hud text-green-400" : "border-amber-hud text-amber",
            )}
          >
            {fea
              ? "Te fuiste a medias — la cátedra no olvida: el deber del día sigue abierto."
              : estado === "CUMPLIDA"
                ? "El deber del día está cumplido — la escuela te aplaude."
                : "La escuela te deja la carta del día: cumplir el deber da puntos."}
          </p>

          <p className="text-[10px] text-muted-foreground leading-snug">{saludo}</p>

          {/* el deber: las misiones del día marcadas AL LADO */}
          <div data-testid="carta-misiones" className="space-y-1.5">
            {misiones.map((m) => {
              const prog = Math.min(progreso[m.codigo] ?? 0, m.meta);
              const completa = prog >= m.meta;
              return (
                <div key={m.codigo} data-testid="carta-mision" className="bg-secondary/40 rounded-sm p-2 border border-border/60 flex items-center justify-between gap-2">
                  <span className={cn("text-[10px] font-mono font-bold leading-snug", completa ? "text-green-400" : "text-foreground")}>
                    {m.titulo}
                  </span>
                  <span className={cn("shrink-0 font-mono text-[10px] font-bold tabular-nums", completa ? "text-green-400" : "text-amber")}>
                    {completa ? "✓" : "✗"} {prog}/{m.meta}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            data-testid="carta-boton"
            onClick={firmarYSalir}
            className={cn(
              "w-full px-3 py-2 border rounded-sm text-[11px] font-mono uppercase font-black tracking-widest transition-colors",
              fea ? "border-red-hud text-red-hud bg-red-hud/10 hover:bg-red-hud/20" :
              estado === "CUMPLIDA" ? "border-green-hud text-green-400 bg-green-hud/10 hover:bg-green-hud/20" :
                "border-amber-hud text-amber bg-amber-hud/20 hover:bg-amber-hud/40",
            )}
          >
            {estado === "CUMPLIDA" ? "Deber entregado ✓" : "A estudiar"}
          </button>

          <p className="text-[9px] font-mono text-muted-foreground leading-snug text-center">
            La carta se abre sola mientras el deber esté a medias — así es la escuela.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// LA CÁTEDRA — la ficha escolar: saludo según nivel y regularidad,
// misiones diarias con el progreso MARCADO AL LADO y el examen del día.
// ══════════════════════════════════════════════════════════════════════
function Catedra() {
  const alias = useGameStore((s) => s.alias);
  const nivel = useGameStore((s) => s.level);
  const rango = useGameStore((s) => s.rank);
  const xp = useGameStore((s) => s.xp);
  const addXp = useGameStore((s) => s.addXp);
  const addCoins = useGameStore((s) => s.addCoins);
  const estudio = useEstudioBiblioteca();

  const dia = useMemo(() => diaDelAnillo(), []);
  const hoy = useMemo(() => firmaDeHoy(), []);
  const misiones = useMemo(() => misionesDeHoy(dia), [dia]);
  const preguntas = useMemo(() => examenDelDia(dia), [dia]);
  // v366 EL IMÁN — el sorteo del día es el MISMO para toda la escuela
  // (mulberry32 + reloj central, ley v324): el monto ya está decidido,
  // el toque lo cobra.
  const bonoRevelado = useMemo(() => bonoDelDia(dia), [dia]);
  const bonoReclamado = estudio.bono.dia === hoy && estudio.bono.reclamado;

  // si el día guardado no es hoy, la cátedra pinta el día limpio (sin
  // mutar: el primer gesto real lo firma en el store)
  const vivo = estudio.misiones.dia === hoy;
  const progreso = vivo ? estudio.misiones.progreso : {};
  const reclamadas = vivo ? estudio.misiones.reclamadas : [];

  const fichasLeidas = Object.keys(estudio.leidas).length;
  const lector = nivelLector(fichasLeidas);
  // v366 — EL ESCALÓN SIGUIENTE: aversión a la pérdida con datos REALES
  const escalon = nivelLectorSiguiente(fichasLeidas);
  const xpNecesario = xpForLevel(nivel);
  const faltanXp = Math.max(xpNecesario - xp, 0);
  const rangoSiguiente = getRankForLevel(nivel + 1).name;
  const saludo = useMemo(
    () => saludoCatedra(alias, nivel, estudio.estudio.racha, fichasLeidas),
    [alias, nivel, estudio.estudio.racha, fichasLeidas],
  );

  // examen
  const [examenAbierto, setExamenAbierto] = useState(false);
  const [respuestas, setRespuestas] = useState<Record<string, number>>({});
  const contestadas = preguntas.filter((p) => respuestas[p.id] !== undefined).length;
  const aciertosDeHoy = preguntas.filter((p) => respuestas[p.id] === p.correcta).length;
  const examenCompleto = contestadas === preguntas.length;

  // (el XP de primera lectura vive en las cartas de las salas — ver abajo)

  const reclamar = (codigo: string) => {
    const mision = estudio.reclamar(codigo);
    if (!mision) return;
    addXp(mision.xp);
    addCoins(mision.coins, `BIBLIOTECA: ${mision.titulo}`);
    toast.success(`MISIÓN CUMPLIDA · +${mision.xp} XP +${mision.coins} mon`, {
      description: mision.titulo,
    });
  };

  // v366 — ABRIR EL BONO DEL DÍA: el toque que cobra el sorteo (una vez)
  const abrirBono = () => {
    const b = estudio.reclamarBono();
    if (!b) return;
    addCoins(b.monto, "BIBLIOTECA: BONO SORPRESA DEL ARCHIVO");
    toast.success(`+${b.monto} mon · BONO DEL ARCHIVO${b.dorado ? " DORADO" : ""}`, {
      description: b.dorado
        ? "El sorteo de hoy cayó DORADO — doble pago. Mañana hay otro."
        : "El sorteo del día, cobrado. Mañana el archivo sortea otro.",
    });
  };

  const responder = (pid: string, idx: number, correcta: number) => {
    if (respuestas[pid] !== undefined) return;
    setRespuestas((r) => ({ ...r, [pid]: idx }));
    if (idx === correcta) {
      const puntua = estudio.acierto(pid);
      addXp(XP_POR_ACIERTO);
      toast.success(`+${XP_POR_ACIERTO} XP · ACIERTO`, { description: "El examen del día enseña: busca la pista y refuerza." });
      if (!puntua) { /* ya puntuada antes: solo el toast de acierto */ }
    } else {
      estudio.fallo(pid);
      toast.error("Fallaste — la cátedra marca la pista para estudiarla", {});
    }
  };

  return (
    <section data-testid="biblio-catedra" className="hud-panel p-3 border-amber-hud/50 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-1.5">
        <h3 className="text-[11px] font-mono uppercase text-amber flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4" /> LA CÁTEDRA · aprende por puntos, como en la escuela
        </h3>
        <div className="flex items-center gap-1.5">
          {/* el sello feo visible aunque la carta esté cerrada (v365) */}
          {estadoDeberDeHoy() === "A MEDIAS" && (
            <button
              data-testid="catedra-incompleto"
              onClick={() => useCartaAbierta.getState().abrir()}
              className="flex items-center gap-1 px-1.5 py-0.5 border border-red-hud text-red-hud bg-red-hud/10 font-mono text-[9px] font-black tracking-widest uppercase animate-pulse"
              title="Te fuiste con el deber a medias — toca para ver la carta"
            >
              <AlertTriangle className="w-3 h-3" /> A MEDIAS
            </button>
          )}
          {/* la carta se puede volver a ver en cualquier momento (v365) */}
          <button
            data-testid="carta-abrir"
            onClick={() => useCartaAbierta.getState().abrir()}
            className="flex items-center gap-1 px-1.5 py-0.5 border border-amber-hud/60 text-amber font-mono text-[9px] font-bold tracking-widest uppercase hover:bg-amber-hud/20 transition-colors"
            title="Ver la carta del deber"
          >
            <ClipboardList className="w-3 h-3" /> LA CARTA
          </button>
          <span className="px-1.5 py-0.5 border border-amber-hud/60 text-amber font-mono text-[9px] font-bold tracking-widest uppercase">
            {lector.titulo}
          </span>
          <span className="flex items-center gap-1 font-mono text-[10px] text-orange-300" title="Racha de días de estudio real">
            <Flame className="w-3.5 h-3.5" /> {estudio.estudio.racha}
          </span>
        </div>
      </div>

      {/* el saludo: le habla según su NIVEL y su REGULARIDAD */}
      <p data-testid="biblio-saludo" className="text-[11px] text-foreground/90 leading-snug border-l-2 border-amber-hud/60 pl-2">
        {saludo} <span className="text-muted-foreground">Rango de la casa: {rango} · nivel {nivel}.</span>
      </p>

      {/* v366 EL IMÁN — EL BONO SORPRESA DEL ARCHIVO: recompensa variable con
          la regla a la vista (la sorpresa es el monto, jamás la regla) */}
      <div
        data-testid="catedra-bono"
        className={cn(
          "rounded-sm p-2 border space-y-1",
          bonoReclamado ? "border-border/60 bg-secondary/30" : bonoRevelado.dorado ? "border-amber-hud bg-amber-hud/20" : "border-amber-hud/50 bg-amber-hud/10",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-amber">
            <Gift className="w-3.5 h-3.5" /> El bono sorpresa del archivo
          </span>
          {!bonoReclamado && bonoRevelado.dorado && (
            <span className="text-[8px] font-mono font-black tracking-widest text-amber animate-pulse">HOY ES DORADO</span>
          )}
        </div>
        {bonoReclamado ? (
          <div data-testid="catedra-bono-monto" className="text-[10px] font-mono text-foreground leading-snug">
            Cobrado hoy: +{bonoRevelado.monto} mon{bonoRevelado.dorado ? " · sorteo DORADO" : ""} — vuelve mañana, el archivo sortea otro.
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-[9px] font-mono text-muted-foreground leading-snug flex-1 min-w-[170px]">{REGLA_BONO}</p>
            <button
              data-testid="catedra-bono-abrir"
              onClick={abrirBono}
              className="px-2.5 py-1 border border-amber-hud text-amber bg-amber-hud/30 hover:bg-amber-hud/50 rounded-sm text-[10px] font-mono uppercase font-black tracking-widest transition-colors"
            >
              Abrir el bono del día
            </button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_240px] gap-3">
        {/* LAS MISIONES DEL DÍA — el progreso marcado AL LADO */}
        <div data-testid="catedra-misiones" className="space-y-2">
          {misiones.map((m) => {
            const prog = Math.min(progreso[m.codigo] ?? 0, m.meta);
            const completa = prog >= m.meta;
            const reclamada = reclamadas.includes(m.codigo);
            return (
              <div key={m.codigo} data-testid="catedra-mision" className="bg-secondary/40 rounded-sm p-2 border border-amber-hud/20">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-mono font-bold text-foreground">{m.titulo}</div>
                    <div className="text-[10px] text-muted-foreground leading-snug">{m.desc}</div>
                  </div>
                  {/* EL MARCO AL LADO: progreso + botín + botón */}
                  <div className="flex flex-col items-end gap-1 shrink-0 w-[92px]">
                    <span data-testid="catedra-progreso" className={cn("font-mono text-[11px] font-bold tabular-nums", completa ? "text-green-400" : "text-amber")}>
                      {prog}/{m.meta}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[9px] text-muted-foreground">
                      <Star className="w-2.5 h-2.5 text-cyan-hud" /> {m.xp} <Coins className="w-2.5 h-2.5 text-amber" /> {m.coins}
                    </span>
                    <button
                      data-testid="catedra-reclamar"
                      onClick={() => reclamar(m.codigo)}
                      disabled={!completa || reclamada}
                      className={cn(
                        "w-full px-1.5 py-1 border rounded-sm text-[9px] font-mono uppercase font-bold tracking-wider transition-colors",
                        reclamada ? "border-green-hud/40 text-green-400/70" :
                        completa ? "border-amber-hud text-amber bg-amber-hud/30 hover:bg-amber-hud/50" :
                          "border-border text-muted-foreground/60 cursor-not-allowed"
                      )}
                    >
                      {reclamada ? "Reclamada ✓" : completa ? "Reclamar" : "En curso"}
                    </button>
                  </div>
                </div>
                <div className="mt-1.5 h-1 bg-background rounded-full overflow-hidden">
                  <div className={cn("h-full transition-all", completa ? "bg-green-hud" : "bg-amber")} style={{ width: `${(prog / m.meta) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* EL REGISTRO DE LA CÁTEDRA — el expediente escolar */}
        <aside data-testid="catedra-registro" className="bg-secondary/40 rounded-sm p-2.5 border border-amber-hud/20 space-y-1.5">
          <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-amber">EL REGISTRO</div>
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-muted-foreground flex items-center gap-1"><BookMarked className="w-3 h-3" /> Fichas leídas</span>
            <span className="text-foreground font-bold tabular-nums">{fichasLeidas}/{CONSTITUCIONES.length + GEOPOLITICA.length + ARSENAL.length}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-muted-foreground flex items-center gap-1"><Flame className="w-3 h-3" /> Racha de estudio</span>
            <span className="text-orange-300 font-bold tabular-nums">{estudio.estudio.racha} día{estudio.estudio.racha === 1 ? "" : "s"}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-muted-foreground flex items-center gap-1"><ScrollText className="w-3 h-3" /> Días en la cátedra</span>
            <span className="text-foreground font-bold tabular-nums">{estudio.estudio.diasTotales}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-muted-foreground flex items-center gap-1"><Trophy className="w-3 h-3" /> Aciertos del examen</span>
            <span className="text-foreground font-bold tabular-nums">{estudio.examen.aciertos} · {estudio.examen.errores} fallos</span>
          </div>
          {/* v366 — EL ESCALÓN SIGUIENTE: «solo te faltan N» con datos reales */}
          <div data-testid="catedra-escalon" className="space-y-1 pt-1.5 border-t border-amber-hud/20">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-muted-foreground">Nivel {nivel} → {nivel + 1}</span>
              <span className="text-amber font-bold tabular-nums">-{faltanXp} XP</span>
            </div>
            <div className="h-1 bg-background rounded-full overflow-hidden">
              <div className="h-full bg-cyan-hud transition-all" style={{ width: `${Math.min(100, (xp / Math.max(xpNecesario, 1)) * 100)}%` }} />
            </div>
            <div className="text-[9px] font-mono text-muted-foreground leading-snug">
              SOLO TE FALTAN {faltanXp} XP PARA EL NIVEL {nivel + 1} — el escalón siguiente viste el rango {rangoSiguiente}.
            </div>
            {escalon && (
              <div data-testid="catedra-escalon-lector" className="text-[9px] font-mono text-amber leading-snug">
                Y {escalon.faltan} ficha{escalon.faltan === 1 ? "" : "s"} para que la cátedra te llame {escalon.titulo}.
              </div>
            )}
          </div>
          <div className="pt-1.5 border-t border-amber-hud/20 text-[9px] font-mono text-muted-foreground leading-snug">
            La racha cuenta días de estudio REAL: leer, buscar o examinar firma tu día.
          </div>
        </aside>
      </div>

      {/* EL EXAMEN DEL DÍA — 6 preguntas giradas por el reloj de la escuela.
          v366: EL EXAMEN ES DE TODOS — prueba social honesta (el mismo para
          toda la escuela, determinista por día) + urgencia real (caduca a
          medianoche con el reloj central: cero relojes nuevos, ley v324). */}
      <div data-testid="biblio-examen-zona" className="border-t border-amber-hud/20 pt-2 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-1.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber">
            EL EXAMEN DEL DÍA · {contestadas}/{preguntas.length} contestadas
            {examenCompleto && <span className="text-green-400"> · nota: {aciertosDeHoy}/{preguntas.length}</span>}
          </span>
          <button
            data-testid="biblio-examen"
            onClick={() => setExamenAbierto((v) => !v)}
            className="px-2.5 py-1 border border-amber-hud/70 text-amber rounded-sm text-[10px] font-mono uppercase font-bold tracking-wider hover:bg-amber-hud/20 transition-colors"
          >
            {examenAbierto ? "Cerrar el examen" : examenCompleto ? "Revisar el examen" : "Sentar el examen"}
          </button>
        </div>
        <p data-testid="biblio-examen-comun" className="text-[9px] font-mono text-muted-foreground leading-snug">
          EL MISMO EXAMEN PARA TODA LA ESCUELA — hoy lo sientan todos a la vez; a medianoche caduca y nace otro.
        </p>

        <AnimatePresence>
          {examenAbierto && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <div className="space-y-2">
                {preguntas.map((p, qi) => {
                  const elegida = respuestas[p.id];
                  const contestada = elegida !== undefined;
                  return (
                    <div key={p.id} data-testid="examen-pregunta" className="bg-secondary/40 rounded-sm p-2.5 border border-border/60">
                      <div className="flex items-start gap-2">
                        <span className="shrink-0 w-5 h-5 rounded-full border border-amber-hud/50 text-amber flex items-center justify-center font-mono text-[9px] font-bold">{qi + 1}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-mono font-bold text-foreground leading-snug">{p.enunciado}</div>
                          <div className="mt-1.5 grid sm:grid-cols-2 gap-1">
                            {p.opciones.map((op, oi) => {
                              const esElegida = elegida === oi;
                              const esCorrecta = oi === p.correcta;
                              const revelar = contestada && (esElegida || esCorrecta);
                              return (
                                <button
                                  key={oi}
                                  data-testid="examen-opcion"
                                  onClick={() => responder(p.id, oi, p.correcta)}
                                  disabled={contestada}
                                  className={cn(
                                    "text-left px-2 py-1.5 rounded-sm border text-[10px] font-mono leading-snug transition-colors",
                                    !contestada && "border-border/70 text-muted-foreground hover:border-amber-hud/60 hover:text-foreground",
                                    revelar && esCorrecta && "border-green-hud text-green-400 bg-green-hud/10",
                                    revelar && esElegida && !esCorrecta && "border-red-hud text-red-hud bg-red-hud/10",
                                    contestada && !revelar && "border-border/40 text-muted-foreground/50"
                                  )}
                                >
                                  {revelar && (esCorrecta ? <CheckCircle2 className="w-3 h-3 inline mr-1 -mt-0.5" /> : <Circle className="w-3 h-3 inline mr-1 -mt-0.5" />)}
                                  {op}
                                </button>
                              );
                            })}
                          </div>
                          {contestada && (
                            <div className="mt-1 text-[9px] font-mono text-muted-foreground">
                              Estúdiala en: <span className="text-amber">{p.pista}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {examenCompleto && (
                  <div data-testid="examen-nota" className="text-[10px] font-mono text-amber border border-amber-hud/40 rounded-sm p-2 bg-amber-hud/10">
                    Nota del día: {aciertosDeHoy}/{preguntas.length} — {aciertosDeHoy === preguntas.length ? "matrícula de honor: la cátedra aplaude" : aciertosDeHoy >= Math.ceil(preguntas.length / 2) ? "aprobado: refuerza las pistas marcadas" : "a repasar: el archivo te espera mañana con un examen nuevo"}.
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SALA CONSTITUCIONES — la estantería real: buscar, filtrar, abrir ficha
// ══════════════════════════════════════════════════════════════════════
function SalaConstituciones() {
  const estudio = useEstudioBiblioteca();
  const addXp = useGameStore((s) => s.addXp);
  const [q, setQ] = useState("");
  const [region, setRegion] = useState<Region | "TODAS">("TODAS");
  const [abierta, setAbierta] = useState<Constitucion | null>(null);
  // v366 EL IMÁN — la madriguera salta entre las TRES estanterías: la sala
  // sostiene la ficha abierta de cualquier familia
  const [abiertaGeo, setAbiertaGeo] = useState<PiezaGeo | null>(null);
  const [abiertaArma, setAbiertaArma] = useState<PiezaArma | null>(null);

  // leer una ficha: la primera vez paga XP publicado (la regla de la cátedra)
  const leerFicha = (id: string) => {
    if (estudio.leer(id)) {
      addXp(XP_POR_FICHA_NUEVA);
      toast.success(`+${XP_POR_FICHA_NUEVA} XP · FICHA NUEVA EN TU EXPEDIENTE`, {
        description: "Saber más da puntos, como en la escuela.",
      });
    }
  };

  // EL SALTO: un toque abre la ficha siguiente (y la cuenta como lectura)
  const saltar = (s: Salto) => {
    if (s.kind === "const") {
      const c = CONSTITUCIONES.find((x) => x.id === s.id);
      if (!c) return;
      setAbierta(c); setAbiertaGeo(null); setAbiertaArma(null); leerFicha(c.id);
    } else if (s.kind === "geo") {
      const g = GEOPOLITICA.find((x) => x.id === s.id);
      if (!g) return;
      setAbierta(null); setAbiertaGeo(g); setAbiertaArma(null); leerFicha(g.id);
    } else {
      const a = ARSENAL.find((x) => x.id === s.id);
      if (!a) return;
      setAbierta(null); setAbiertaGeo(null); setAbiertaArma(a); leerFicha(a.id);
    }
  };

  const filtradas = useMemo(() => {
    const v = norm(q.trim());
    return CONSTITUCIONES.filter((c) => {
      if (region !== "TODAS" && c.region !== region) return false;
      if (!v) return true;
      return norm(c.pais).includes(v) || norm(c.nombre).includes(v) || norm(c.tipo).includes(v) || c.rasgos.some((r) => norm(r).includes(v));
    });
  }, [q, region]);

  return (
    <div className="space-y-3">
      <Catedra />
      <div data-testid="biblio-estanteria" className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              data-testid="biblio-buscar"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") estudio.firmarBusqueda(); }}
              placeholder="Buscar país, carta o rasgo — Enter firma tu día de estudio…"
              className="w-full h-8 pl-7 pr-2 bg-secondary border border-amber-hud/40 rounded-sm font-mono text-xs outline-none focus:border-amber-hud"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {(["TODAS", ...REGIONES] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r as Region | "TODAS")}
                className={cn(
                  "px-2 py-1 border rounded-sm text-[9px] font-mono uppercase font-bold tracking-wider transition-colors",
                  region === r ? "border-amber-hud text-amber bg-amber-hud/20" : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div data-testid="biblio-conteo" className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
          {filtradas.length} de {CONSTITUCIONES.length} cartas · síntesis de consulta: la letra pequeña siempre en el texto original
        </div>

        {filtradas.length === 0 ? (
          <div className="hud-corner p-6 text-center">
            <BookMarked className="w-7 h-7 mx-auto text-muted-foreground opacity-40 mb-2" />
            <p className="text-xs font-mono text-muted-foreground">Ninguna carta coincide — prueba con otro país o quita el filtro</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {filtradas.map((c) => {
              const leida = !!estudio.leidas[c.id];
              return (
                <button
                  key={c.id}
                  data-testid="biblio-carta"
                  onClick={() => { setAbierta(c); leerFicha(c.id); }}
                  className={cn(
                    "hud-corner p-2.5 text-left transition-all hover:-translate-y-0.5",
                    leida ? "border-green-hud/40" : "border-amber-hud/30 hover:border-amber-hud"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Countryball code={c.iso} size={22} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-mono font-bold text-foreground truncate">{c.pais}</div>
                      <div className="text-[9px] font-mono text-muted-foreground truncate">{c.nombre}</div>
                    </div>
                    <span className="shrink-0 px-1 py-0.5 border border-amber-hud/50 text-amber font-mono text-[8px] font-bold">{c.año}</span>
                  </div>
                  <div className="mt-1.5 text-[9px] font-mono text-muted-foreground leading-snug line-clamp-1">{c.tipo}</div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground/70">{c.region}</span>
                    {leida
                      ? <span className="text-[8px] font-mono text-green-400 flex items-center gap-0.5"><CheckCircle2 className="w-2.5 h-2.5" /> leída</span>
                      : <span data-testid="biblio-nueva" className="text-[8px] font-mono text-amber flex items-center gap-0.5"><Sparkles className="w-2.5 h-2.5" /> nueva</span>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* LA FICHA ELEGANTE — como la del módulo del gobierno: campos claros.
          v366: la madriguera sostiene fichas de las TRES salas a la vez. */}
      <AnimatePresence>
        {abierta && <FichaConstitucion c={abierta} onClose={() => setAbierta(null)} onSalta={saltar} />}
        {abiertaGeo && <FichaGeo g={abiertaGeo} onClose={() => setAbiertaGeo(null)} onSalta={saltar} />}
        {abiertaArma && <FichaArma a={abiertaArma} onClose={() => setAbiertaArma(null)} onSalta={saltar} />}
      </AnimatePresence>
    </div>
  );
}

function FichaConstitucion({ c, onClose, onSalta }: { c: Constitucion; onClose: () => void; onSalta: (s: Salto) => void }) {
  const estudio = useEstudioBiblioteca();
  const leida = !!estudio.leidas[c.id];
  const saltos = useMemo(() => saltosDesdeConstitucion(c), [c]);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-3"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, y: 14 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.97, opacity: 0 }}
        data-testid="biblio-ficha"
        className="hud-panel neon-border w-full max-w-2xl max-h-[85vh] overflow-y-auto thin-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <Countryball code={c.iso} size={34} />
              <div className="min-w-0">
                <h3 className="font-display text-lg font-black tracking-wide truncate">{c.pais}</h3>
                <div className="font-mono text-[10px] text-muted-foreground">{c.nombre}</div>
              </div>
            </div>
            <button onClick={onClose} aria-label="Cerrar ficha" className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-2">
            <div className="bg-secondary/50 rounded-sm p-2 border border-amber-hud/20">
              <div className="text-[8px] font-mono uppercase tracking-[0.2em] text-amber">Año de la carta</div>
              <div className="text-sm font-mono font-bold text-foreground">{c.año}</div>
            </div>
            <div className="bg-secondary/50 rounded-sm p-2 border border-amber-hud/20">
              <div className="text-[8px] font-mono uppercase tracking-[0.2em] text-amber">Región</div>
              <div className="text-sm font-mono font-bold text-foreground">{c.region}</div>
            </div>
            <div className="bg-secondary/50 rounded-sm p-2 border border-amber-hud/20">
              <div className="text-[8px] font-mono uppercase tracking-[0.2em] text-amber">Forma de gobierno</div>
              <div className="text-[11px] font-mono font-bold text-foreground leading-snug">{c.tipo}</div>
            </div>
            <div className="bg-secondary/50 rounded-sm p-2 border border-amber-hud/20">
              <div className="text-[8px] font-mono uppercase tracking-[0.2em] text-amber">Mandato</div>
              <div className="text-[11px] font-mono font-bold text-foreground leading-snug">{c.mandato}</div>
            </div>
          </div>

          <div>
            <div className="text-[8px] font-mono uppercase tracking-[0.2em] text-amber mb-1">Rasgos de la carta</div>
            <ul className="space-y-1">
              {c.rasgos.map((r, i) => (
                <li key={i} className="text-[11px] text-foreground/90 leading-snug flex gap-1.5">
                  <span className="text-amber shrink-0">›</span> {r}
                </li>
              ))}
            </ul>
          </div>

          {c.nota && (
            <div className="border border-amber-hud/50 bg-amber-hud/10 rounded-sm p-2 text-[10px] font-mono text-amber leading-snug">
              NOTA HONESTA · {c.nota}
            </div>
          )}

          {/* v366 EL IMÁN — LA MADRIGUERA: cada ficha abre la siguiente.
              Saltos derivados SIEMPRE de los datos reales de las estanterías. */}
          {saltos.length > 0 && (
            <div data-testid="ficha-saltos" className="space-y-1">
              <div className="text-[8px] font-mono uppercase tracking-[0.2em] text-cyan-hud">De aquí salta a — la madriguera de la biblioteca</div>
              {saltos.map((s) => (
                <button
                  key={s.id}
                  data-testid="ficha-salto"
                  onClick={() => onSalta(s)}
                  className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-sm border border-cyan-hud/30 bg-secondary/40 hover:border-cyan-hud hover:bg-cyan-hud/10 transition-colors text-left"
                >
                  <span className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono font-bold text-foreground truncate block">{s.nombre} · {s.año}</span>
                    <span className="text-[8px] font-mono text-muted-foreground block">{s.porQue}</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-cyan-hud shrink-0" />
                </button>
              ))}
              <div className="text-[8px] font-mono text-muted-foreground/70 leading-snug">
                cada salto abre otra ficha y suma a tu expediente — la madriguera de la escuela no tiene fondo
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-border flex items-center justify-between flex-wrap gap-1.5">
            <span className="font-mono text-[9px] text-muted-foreground">
              {leida ? `En tu expediente desde ${selloLectura(estudio.leidas[c.id])}` : `Leer por primera vez: +${XP_POR_FICHA_NUEVA} XP`}
            </span>
            <span className="font-mono text-[8px] text-muted-foreground uppercase tracking-widest">
              síntesis de consulta · la fuente es el texto constitucional vigente
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SALA GEOPOLÍTICA — tratados, doctrinas y conceptos del tablero mundial
// ══════════════════════════════════════════════════════════════════════
function SalaGeopolitica() {
  const estudio = useEstudioBiblioteca();
  const addXp = useGameStore((s) => s.addXp);
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState<TipoGeo | "TODOS">("TODOS");
  const [abierta, setAbierta] = useState<PiezaGeo | null>(null);
  // v366 — la madriguera sostiene fichas de las TRES salas
  const [abiertaConst, setAbiertaConst] = useState<Constitucion | null>(null);
  const [abiertaArma, setAbiertaArma] = useState<PiezaArma | null>(null);

  const leerFicha = (id: string) => {
    if (estudio.leer(id)) {
      addXp(XP_POR_FICHA_NUEVA);
      toast.success(`+${XP_POR_FICHA_NUEVA} XP · FICHA NUEVA EN TU EXPEDIENTE`, {
        description: "Saber más da puntos, como en la escuela.",
      });
    }
  };

  const saltar = (s: Salto) => {
    if (s.kind === "const") {
      const c = CONSTITUCIONES.find((x) => x.id === s.id);
      if (!c) return;
      setAbierta(null); setAbiertaConst(c); setAbiertaArma(null); leerFicha(c.id);
    } else if (s.kind === "geo") {
      const g = GEOPOLITICA.find((x) => x.id === s.id);
      if (!g) return;
      setAbierta(g); setAbiertaConst(null); setAbiertaArma(null); leerFicha(g.id);
    } else {
      const a = ARSENAL.find((x) => x.id === s.id);
      if (!a) return;
      setAbierta(null); setAbiertaConst(null); setAbiertaArma(a); leerFicha(a.id);
    }
  };

  const filtradas = useMemo(() => {
    const v = norm(q.trim());
    return GEOPOLITICA.filter((g) => {
      if (tipo !== "TODOS" && g.tipo !== tipo) return false;
      if (!v) return true;
      return norm(g.nombre).includes(v) || norm(g.resumen).includes(v) || norm(g.porQueImporta).includes(v);
    });
  }, [q, tipo]);

  return (
    <div className="space-y-3">
      <Catedra />
      <div data-testid="biblio-estanteria" className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              data-testid="biblio-buscar"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") estudio.firmarBusqueda(); }}
              placeholder="Buscar tratado, doctrina o concepto — Enter firma tu día…"
              className="w-full h-8 pl-7 pr-2 bg-secondary border border-amber-hud/40 rounded-sm font-mono text-xs outline-none focus:border-amber-hud"
            />
          </div>
          <div className="flex gap-1">
            {(["TODOS", ...TIPOS_GEO] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTipo(t as TipoGeo | "TODOS")}
                className={cn(
                  "px-2 py-1 border rounded-sm text-[9px] font-mono uppercase font-bold tracking-wider transition-colors",
                  tipo === t ? "border-amber-hud text-amber bg-amber-hud/20" : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div data-testid="biblio-conteo" className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
          {filtradas.length} de {GEOPOLITICA.length} piezas · de Westfalia (1648) a la geoeconomía de hoy
        </div>

        {filtradas.length === 0 ? (
          <div className="hud-corner p-6 text-center">
            <Globe2 className="w-7 h-7 mx-auto text-muted-foreground opacity-40 mb-2" />
            <p className="text-xs font-mono text-muted-foreground">Ninguna pieza coincide — prueba con «soberanía» o «OTAN»</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {filtradas.map((g) => {
              const leida = !!estudio.leidas[g.id];
              return (
                <button
                  key={g.id}
                  data-testid="biblio-carta"
                  onClick={() => { setAbierta(g); leerFicha(g.id); }}
                  className={cn(
                    "hud-corner p-2.5 text-left transition-all hover:-translate-y-0.5",
                    leida ? "border-green-hud/40" : "border-amber-hud/30 hover:border-amber-hud"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[11px] font-mono font-bold text-foreground truncate">{g.nombre}</div>
                    <span className="shrink-0 px-1 py-0.5 border border-amber-hud/50 text-amber font-mono text-[8px] font-bold">{g.año}</span>
                  </div>
                  <div className="mt-1 text-[9px] font-mono text-muted-foreground leading-snug line-clamp-2">{g.resumen}</div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="px-1 py-0.5 border border-cyan-hud/40 text-cyan-hud font-mono text-[8px] font-bold tracking-widest">{g.tipo}</span>
                    {leida
                      ? <span className="text-[8px] font-mono text-green-400 flex items-center gap-0.5"><CheckCircle2 className="w-2.5 h-2.5" /> leída</span>
                      : <span data-testid="biblio-nueva" className="text-[8px] font-mono text-amber flex items-center gap-0.5"><Sparkles className="w-2.5 h-2.5" /> nueva</span>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {abierta && <FichaGeo g={abierta} onClose={() => setAbierta(null)} onSalta={saltar} />}
        {abiertaConst && <FichaConstitucion c={abiertaConst} onClose={() => setAbiertaConst(null)} onSalta={saltar} />}
        {abiertaArma && <FichaArma a={abiertaArma} onClose={() => setAbiertaArma(null)} onSalta={saltar} />}
      </AnimatePresence>
    </div>
  );
}

function FichaGeo({ g, onClose, onSalta }: { g: PiezaGeo; onClose: () => void; onSalta: (s: Salto) => void }) {
  const estudio = useEstudioBiblioteca();
  const leida = !!estudio.leidas[g.id];
  const saltos = useMemo(() => saltosDesdeGeo(g), [g]);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-3"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, y: 14 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.97, opacity: 0 }}
        data-testid="biblio-ficha"
        className="hud-panel neon-border w-full max-w-2xl max-h-[85vh] overflow-y-auto thin-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-display text-lg font-black tracking-wide">{g.nombre}</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-1 py-0.5 border border-cyan-hud/40 text-cyan-hud font-mono text-[8px] font-bold tracking-widest">{g.tipo}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{g.año}</span>
              </div>
            </div>
            <button onClick={onClose} aria-label="Cerrar ficha" className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-foreground/90 leading-relaxed">{g.resumen}</p>

          <div className="border-l-2 border-amber-hud/60 pl-2">
            <div className="text-[8px] font-mono uppercase tracking-[0.2em] text-amber mb-0.5">Por qué importa</div>
            <p className="text-[11px] text-foreground/90 leading-relaxed">{g.porQueImporta}</p>
          </div>

          {/* v366 EL IMÁN — LA MADRIGUERA: cada ficha abre la siguiente */}
          {saltos.length > 0 && (
            <div data-testid="ficha-saltos" className="space-y-1">
              <div className="text-[8px] font-mono uppercase tracking-[0.2em] text-cyan-hud">De aquí salta a — la madriguera de la biblioteca</div>
              {saltos.map((s) => (
                <button
                  key={s.id}
                  data-testid="ficha-salto"
                  onClick={() => onSalta(s)}
                  className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-sm border border-cyan-hud/30 bg-secondary/40 hover:border-cyan-hud hover:bg-cyan-hud/10 transition-colors text-left"
                >
                  <span className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono font-bold text-foreground truncate block">{s.nombre} · {s.año}</span>
                    <span className="text-[8px] font-mono text-muted-foreground block">{s.porQue}</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-cyan-hud shrink-0" />
                </button>
              ))}
              <div className="text-[8px] font-mono text-muted-foreground/70 leading-snug">
                cada salto abre otra ficha y suma a tu expediente — la madriguera de la escuela no tiene fondo
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-border flex items-center justify-between flex-wrap gap-1.5">
            <span className="font-mono text-[9px] text-muted-foreground">
              {leida ? `En tu expediente desde ${selloLectura(estudio.leidas[g.id])}` : `Leer por primera vez: +${XP_POR_FICHA_NUEVA} XP`}
            </span>
            <span className="font-mono text-[8px] text-muted-foreground uppercase tracking-widest">
              síntesis de consulta · el documento original es la fuente
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SALA ARSENAL — LA ARMERÍA DEL MUNDO (v365): el dossier escolar de las
// armas de TODAS las familias. La regla de la sala está publicada y la
// ficha la confiesa: consecuciones, no recetas — historia y control.
// ══════════════════════════════════════════════════════════════════════
function SalaArsenal() {
  const estudio = useEstudioBiblioteca();
  const addXp = useGameStore((s) => s.addXp);
  const [q, setQ] = useState("");
  const [familia, setFamilia] = useState<FamiliaArma | "TODAS">("TODAS");
  const [clase, setClase] = useState<ClaseArma | "TODAS">("TODAS");
  const [abierta, setAbierta] = useState<PiezaArma | null>(null);
  // v366 — la madriguera sostiene fichas de las TRES salas
  const [abiertaConst, setAbiertaConst] = useState<Constitucion | null>(null);
  const [abiertaGeo, setAbiertaGeo] = useState<PiezaGeo | null>(null);

  const leerFicha = (id: string) => {
    if (estudio.leer(id)) {
      addXp(XP_POR_FICHA_NUEVA);
      toast.success(`+${XP_POR_FICHA_NUEVA} XP · FICHA NUEVA EN TU EXPEDIENTE`, {
        description: "Saber más da puntos, como en la escuela.",
      });
    }
  };

  const saltar = (s: Salto) => {
    if (s.kind === "const") {
      const c = CONSTITUCIONES.find((x) => x.id === s.id);
      if (!c) return;
      setAbierta(null); setAbiertaConst(c); setAbiertaGeo(null); leerFicha(c.id);
    } else if (s.kind === "geo") {
      const g = GEOPOLITICA.find((x) => x.id === s.id);
      if (!g) return;
      setAbierta(null); setAbiertaConst(null); setAbiertaGeo(g); leerFicha(g.id);
    } else {
      const a = ARSENAL.find((x) => x.id === s.id);
      if (!a) return;
      setAbierta(a); setAbiertaConst(null); setAbiertaGeo(null); leerFicha(a.id);
    }
  };

  const filtradas = useMemo(() => {
    const v = norm(q.trim());
    return ARSENAL.filter((a) => {
      if (familia !== "TODAS" && a.familia !== familia) return false;
      if (clase !== "TODAS" && a.clase !== clase) return false;
      if (!v) return true;
      return norm(a.nombre).includes(v) || norm(a.resumen).includes(v) || norm(a.comoCambioElMundo).includes(v);
    });
  }, [q, familia, clase]);

  return (
    <div className="space-y-3">
      <Catedra />
      <div data-testid="biblio-estanteria" className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              data-testid="biblio-buscar"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") estudio.firmarBusqueda(); }}
              placeholder="Buscar arma, programa o regla — Enter firma tu día…"
              className="w-full h-8 pl-7 pr-2 bg-secondary border border-amber-hud/40 rounded-sm font-mono text-xs outline-none focus:border-amber-hud"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {(["TODAS", ...FAMILIAS_ARMAS] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFamilia(f as FamiliaArma | "TODAS")}
                className={cn(
                  "px-2 py-1 border rounded-sm text-[9px] font-mono uppercase font-bold tracking-wider transition-colors",
                  familia === f ? "border-amber-hud text-amber bg-amber-hud/20" : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-1 flex-wrap">
          {(["TODAS", ...CLASES_ARMAS] as const).map((c) => (
            <button
              key={c}
              onClick={() => setClase(c as ClaseArma | "TODAS")}
              className={cn(
                "px-2 py-1 border rounded-sm text-[9px] font-mono uppercase font-bold tracking-wider transition-colors",
                clase === c ? "border-cyan-hud text-cyan-hud bg-cyan-hud/10" : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div data-testid="biblio-conteo" className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
          {filtradas.length} de {ARSENAL.length} dossiers · archivo escolar: consecuencias, no recetas
        </div>

        {filtradas.length === 0 ? (
          <div className="hud-corner p-6 text-center">
            <Bomb className="w-7 h-7 mx-auto text-muted-foreground opacity-40 mb-2" />
            <p className="text-xs font-mono text-muted-foreground">Ningún dossier coincide — prueba con «Manhattan» o quita el filtro</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {filtradas.map((a) => {
              const leida = !!estudio.leidas[a.id];
              return (
                <button
                  key={a.id}
                  data-testid="biblio-carta"
                  onClick={() => { setAbierta(a); leerFicha(a.id); }}
                  className={cn(
                    "hud-corner p-2.5 text-left transition-all hover:-translate-y-0.5",
                    leida ? "border-green-hud/40" : "border-amber-hud/30 hover:border-amber-hud"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[11px] font-mono font-bold text-foreground truncate">{a.nombre}</div>
                    <span className="shrink-0 px-1 py-0.5 border border-amber-hud/50 text-amber font-mono text-[8px] font-bold">{a.año}</span>
                  </div>
                  <div className="mt-1 text-[9px] font-mono text-muted-foreground leading-snug line-clamp-2">{a.resumen}</div>
                  <div className="mt-1 flex items-center justify-between gap-1">
                    <span className="px-1 py-0.5 border border-red-hud/40 text-red-hud/90 font-mono text-[8px] font-bold tracking-widest">{a.familia}</span>
                    <span className="px-1 py-0.5 border border-cyan-hud/40 text-cyan-hud font-mono text-[8px] font-bold tracking-widest">{a.clase}</span>
                    {leida
                      ? <span className="text-[8px] font-mono text-green-400 flex items-center gap-0.5"><CheckCircle2 className="w-2.5 h-2.5" /> leída</span>
                      : <span data-testid="biblio-nueva" className="text-[8px] font-mono text-amber flex items-center gap-0.5"><Sparkles className="w-2.5 h-2.5" /> nueva</span>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {abierta && <FichaArma a={abierta} onClose={() => setAbierta(null)} onSalta={saltar} />}
        {abiertaConst && <FichaConstitucion c={abiertaConst} onClose={() => setAbiertaConst(null)} onSalta={saltar} />}
        {abiertaGeo && <FichaGeo g={abiertaGeo} onClose={() => setAbiertaGeo(null)} onSalta={saltar} />}
      </AnimatePresence>
    </div>
  );
}

function FichaArma({ a, onClose, onSalta }: { a: PiezaArma; onClose: () => void; onSalta: (s: Salto) => void }) {
  const estudio = useEstudioBiblioteca();
  const leida = !!estudio.leidas[a.id];
  const saltos = useMemo(() => saltosDesdeArma(a), [a]);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-3"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, y: 14 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.97, opacity: 0 }}
        data-testid="biblio-ficha"
        className="hud-panel neon-border w-full max-w-2xl max-h-[85vh] overflow-y-auto thin-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-display text-lg font-black tracking-wide">{a.nombre}</h3>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="px-1 py-0.5 border border-red-hud/40 text-red-hud/90 font-mono text-[8px] font-bold tracking-widest">{a.familia}</span>
                <span className="px-1 py-0.5 border border-cyan-hud/40 text-cyan-hud font-mono text-[8px] font-bold tracking-widest">{a.clase}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{a.año}</span>
              </div>
            </div>
            <button onClick={onClose} aria-label="Cerrar ficha" className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-foreground/90 leading-relaxed">{a.resumen}</p>

          <div className="border-l-2 border-amber-hud/60 pl-2">
            <div className="text-[8px] font-mono uppercase tracking-[0.2em] text-amber mb-0.5">Por qué cambió el mundo</div>
            <p className="text-[11px] text-foreground/90 leading-relaxed">{a.comoCambioElMundo}</p>
          </div>

          {a.dato && (
            <div className="bg-secondary/50 rounded-sm p-2 border border-border/60">
              <div className="text-[8px] font-mono uppercase tracking-[0.2em] text-cyan-hud mb-0.5">El dato para el examen</div>
              <p className="text-[10px] font-mono text-foreground/90 leading-snug">{a.dato}</p>
            </div>
          )}

          {a.nota && (
            <div className="border border-amber-hud/50 bg-amber-hud/10 rounded-sm p-2 text-[10px] font-mono text-amber leading-snug">
              NOTA HONESTA · {a.nota}
            </div>
          )}

          {/* v366 EL IMÁN — LA MADRIGUERA: cada ficha abre la siguiente */}
          {saltos.length > 0 && (
            <div data-testid="ficha-saltos" className="space-y-1">
              <div className="text-[8px] font-mono uppercase tracking-[0.2em] text-cyan-hud">De aquí salta a — la madriguera de la biblioteca</div>
              {saltos.map((s) => (
                <button
                  key={s.id}
                  data-testid="ficha-salto"
                  onClick={() => onSalta(s)}
                  className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-sm border border-cyan-hud/30 bg-secondary/40 hover:border-cyan-hud hover:bg-cyan-hud/10 transition-colors text-left"
                >
                  <span className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono font-bold text-foreground truncate block">{s.nombre} · {s.año}</span>
                    <span className="text-[8px] font-mono text-muted-foreground block">{s.porQue}</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-cyan-hud shrink-0" />
                </button>
              ))}
              <div className="text-[8px] font-mono text-muted-foreground/70 leading-snug">
                cada salto abre otra ficha y suma a tu expediente — la madriguera de la escuela no tiene fondo
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-border flex items-center justify-between flex-wrap gap-1.5">
            <span className="font-mono text-[9px] text-muted-foreground">
              {leida ? `En tu expediente desde ${selloLectura(estudio.leidas[a.id])}` : `Leer por primera vez: +${XP_POR_FICHA_NUEVA} XP`}
            </span>
            <span className="font-mono text-[8px] text-muted-foreground uppercase tracking-widest">
              dossier escolar · enseña consecuencias, no recetas
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

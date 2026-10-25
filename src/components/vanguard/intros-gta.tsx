"use client";

// ============================================================
// v174.0 LAS INTROS GTA — la tarjetería de cine de la casa
// Orden del Dueño: «que Vanguard tenga intros hermosas,
// diferentes, como las de GTA pero de noticias, personajes».
//
//   · PLACA DE PERSONAJE (IntroGtaPersonaje) — el cambio de
//     personaje de GTA V: letterbox de cine entra por arriba y
//     por abajo, la bandera respira con zoom lento (Ken Burns),
//     el NOMBRE aterriza en dos tiempos (pila pequeña + apellido
//     GIGANTE con sombra dura), el color del corte de poder tiñe
//     la escena, la placa de ubicación desliza con coordenadas
//     reales y las tres barras de atributos suben como las
//     habilidades del juego. Al elegir otro rostro, la placa
//     vuelve a sonar — como en el juego.
//
//   · PLACA DE NOTICIA (IntroGtaNoticia) — la tarjeta de inicio
//     de misión: sello de LA AGENCIA CENTRAL con punto EN VIVO,
//     el escalón de impacto con su medidor llenándose, el titular
//     entrando PALABRA A PALABRA y la placa de fuente con su
//     credibilidad. Una vez por cable por sesión: quien ya la vio
//     entra directo a la sala de lectura.
//
//   · PLACA DE CONFLICTO (IntroGtaConflicto, v176) — la tercera
//     tarjeta de la familia, al abrir la ficha coleccionable de
//     una guerra (LA COLECCIÓN DE GUERRA): los DOS BANDOS frente
//     a frente (A ✕ B), el sello de rareza vivo de la colección,
//     el medidor de intensidad con la misma verdad del motor de
//     impacto y las barras de la ficha subiendo como en el juego.
//
// Contrato de la casa: portal al body (lección v116: los ancestros
// con transform rompen el fixed), solo transform/opacity, tap =
// saltar siempre, reduced-motion = no hay cine, móvil primero.
// ============================================================

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  TIERS,
  scoreImpacto,
  tierDeImpacto,
  type EntradaImpacto,
} from "@/lib/impacto";
import { CATEGORIAS_ROSTRO, type Rostro } from "@/lib/personas-data";
import { Flag } from "@/lib/flags";
import { APP_VERSION_LABEL } from "@/lib/version";

const DURACION_PERSONAJE = 2100;
const DURACION_NOTICIA = 2300;
const DURACION_CONFLICTO = 2400; // v176: la placa de conflicto (dos bandos + stats de ficha)
const SALIDA_MS = 380;

// utilidad: CSS var --vg-stat para las barras scaleX
function statStyle(valor: number, delay: number): CSSProperties {
  return {
    "--vg-stat": `${Math.max(0.04, Math.min(1, valor))}`,
    animationDelay: `${delay}ms`,
  } as CSSProperties;
}

// utilidad: nombre estilo GTA — pila pequeña + apellido GIGANTE
function divideNombre(nombre: string): { sup: string | null; grande: string } {
  const partes = nombre.trim().split(/\s+/);
  if (partes.length >= 2) {
    return { sup: partes.slice(0, -1).join(" "), grande: partes[partes.length - 1] };
  }
  return { sup: null, grande: partes[0] };
}

// utilidad: coordenadas al estilo de la carta naval
function coordTxt(lat: number, lng: number): string {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(2)}°${ns} ${Math.abs(lng).toFixed(2)}°${ew}`;
}

// utilidad: reduced-motion (el cine no es para todos los aparatos)
function esReducido(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

// ────────────────────────────────────────────────────────────
// LA PLACA DE PERSONAJE — el cambio de GTA V
// ────────────────────────────────────────────────────────────
export function IntroGtaPersonaje({
  rostro,
  senales,
  onFin,
}: {
  rostro: Rostro;
  senales: number;
  onFin: () => void;
}) {
  const [montado, setMontado] = useState(false);
  const [saliendo, setSaliendo] = useState(false);
  const onFinRef = useRef(onFin);
  useEffect(() => { onFinRef.current = onFin; }); // el ref se actualiza FUERA del render (react-hooks/refs)
  const saliendoRef = useRef(false);

  useEffect(() => setMontado(true), []);

  const cerrar = () => {
    if (saliendoRef.current) return;
    saliendoRef.current = true;
    setSaliendo(true);
    setTimeout(() => onFinRef.current(), SALIDA_MS);
  };

  useEffect(() => {
    if (!montado) return;
    if (esReducido()) {
      onFinRef.current();
      return;
    }
    const t = setTimeout(cerrar, DURACION_PERSONAJE);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [montado]);

  const color = CATEGORIAS_ROSTRO[rostro.categoria].color;
  const nombre = divideNombre(rostro.nombre);
  const alcanceValor =
    rostro.alcance === "mundial" ? 1 : rostro.alcance === "continental" ? 0.62 : 0.34;

  if (!montado) return null;

  return createPortal(
    <AnimatePresence>
      {!saliendo && (
        <motion.div
          key="v174gta-p"
          className="fixed inset-0 z-[300] select-none overflow-hidden"
          style={{ background: "rgba(2,2,4,0.93)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          onPointerDown={cerrar}
          role="dialog"
          aria-label={`Placa de presentación de ${rostro.nombre}`}
        >
          {/* el tinte del corte de poder */}
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(110% 80% at 30% 45%, ${color}14 0%, transparent 62%)` }}
            aria-hidden
          />

          {/* letterbox de cine */}
          <div className="v174gta-barra-sup absolute inset-x-0 top-0 h-[9vh] border-b border-white/10 bg-black" aria-hidden />
          <div className="v174gta-barra-inf absolute inset-x-0 bottom-0 h-[9vh] border-t border-white/10 bg-black" aria-hidden />

          {/* la escena */}
          <div className="relative flex h-full items-center justify-center px-6">
            <div className="w-full max-w-md sm:max-w-xl">
              {/* la bandera respira */}
              <div className="v174gta-ken mb-3 text-6xl sm:text-7xl" style={{ filter: `drop-shadow(0 6px 22px ${color}55)` }} aria-hidden>
                {rostro.bandera}
              </div>

              {/* el cargo: desliza desde la derecha */}
              <p
                className="v174gta-linea-sup font-mono text-[10px] uppercase tracking-[0.3em]"
                style={{ color, animationDelay: "240ms" }}
              >
                {rostro.cargo}
              </p>

              {/* el nombre en dos tiempos */}
              {nombre.sup && (
                <p
                  className="v174gta-nombre mt-2 font-sans text-2xl font-black uppercase leading-none tracking-tight text-white/85 sm:text-4xl"
                  style={{ animationDelay: "330ms" }}
                >
                  {nombre.sup}
                </p>
              )}
              <h2
                className="v174gta-nombre mt-0.5 font-sans text-6xl font-black uppercase leading-[0.92] tracking-tight text-white sm:text-8xl"
                style={{
                  animationDelay: "420ms",
                  textShadow: `0 4px 0 rgba(0,0,0,0.9), 0 0 46px ${color}40`,
                }}
              >
                {nombre.grande}
              </h2>
              <div
                className="v174gta-subrayado mt-2 h-[5px] w-[46%] rounded-sm"
                style={{ background: color, boxShadow: `0 0 18px ${color}88`, animationDelay: "600ms" }}
                aria-hidden
              />

              {/* la placa de ubicación: el sello de la carta naval */}
              <div
                className="v174gta-placa mt-5 border-l-[3px] pl-3"
                style={{ borderColor: color, animationDelay: "740ms" }}
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/90">
                  {rostro.ciudad} · {rostro.pais}
                </p>
                <p className="mt-0.5 font-mono text-[9px] tracking-[0.14em] text-white/45">
                  {coordTxt(rostro.lat, rostro.lng)} · {rostro.sede}
                </p>
              </div>

              {/* los atributos: suben como las habilidades del juego */}
              <div className="mt-6 max-w-[320px] space-y-2.5">
                <BarraAtributo
                  etiqueta="PODER"
                  valorTxt={`${rostro.poder}/100`}
                  valor={rostro.poder / 100}
                  color={color}
                  delay={880}
                />
                <BarraAtributo
                  etiqueta="ALCANCE"
                  valorTxt={rostro.alcance.toUpperCase()}
                  valor={alcanceValor}
                  color={color}
                  delay={1000}
                />
                <BarraAtributo
                  etiqueta="SEÑALES"
                  valorTxt={`${senales} EN VIVO`}
                  valor={senales / 3}
                  color={color}
                  delay={1120}
                />
              </div>
            </div>
          </div>

          {/* las marcas de la casa */}
          <p className="v174gta-pulso absolute bottom-[3.4vh] left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-[0.3em] text-white/50">
            TOCA PARA CONTINUAR
          </p>
          <p className="absolute right-3 top-3 font-mono text-[9px] tracking-[0.2em] text-white/35">
            {APP_VERSION_LABEL}
          </p>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function BarraAtributo({
  etiqueta,
  valorTxt,
  valor,
  color,
  delay,
}: {
  etiqueta: string;
  valorTxt: string;
  valor: number;
  color: string;
  delay: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-[64px] shrink-0 font-mono text-[9px] uppercase tracking-[0.22em] text-white/60">
        {etiqueta}
      </span>
      <div className="h-[7px] flex-1 overflow-hidden rounded-sm bg-white/10">
        <div
          className="v174gta-stat h-full rounded-sm"
          style={{ background: color, boxShadow: `0 0 12px ${color}66`, ...statStyle(valor, delay) }}
        />
      </div>
      <span className="w-[92px] shrink-0 text-right font-mono text-[9px] uppercase tracking-[0.12em] text-white/75">
        {valorTxt}
      </span>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// LA PLACA DE CONFLICTO (v176) — la tercera tarjeta de la familia:
// los DOS BANDOS frente a frente (A ✕ B) al abrir la ficha
// coleccionable de una guerra. La rareza de la colección tiñe la
// escena; la intensidad es la misma verdad del motor de impacto.
// ────────────────────────────────────────────────────────────
export function IntroGtaConflicto({
  bandoA,
  bandoB,
  teatro,
  lat,
  lng,
  serie,
  rareza,
  hexRareza,
  intensidad,
  pulso,
  frescuraTxt,
  frescuraVal,
  onFin,
}: {
  bandoA: { bandera: string; nombre: string };
  bandoB: { bandera: string; nombre: string };
  teatro: string;
  lat: number;
  lng: number;
  serie: string;
  rareza: string;
  hexRareza: string;
  intensidad: number; // 0-100 (la del mejor cable de HOY)
  pulso: number;      // nº de cables de la guerra en el escáner
  frescuraTxt: string;
  frescuraVal: number; // 0-1
  onFin: () => void;
}) {
  const [saliendo, setSaliendo] = useState(false);
  const onFinRef = useRef(onFin);
  useEffect(() => { onFinRef.current = onFin; }); // el ref se actualiza FUERA del render (react-hooks/refs)
  const saliendoRef = useRef(false);
  // el módulo vive tras dynamic(..., { ssr: false }): document existe siempre —
  // sin guard de montaje (la regla set-state-in-effect lo prohíbe en la casa)

  const cerrar = () => {
    if (saliendoRef.current) return;
    saliendoRef.current = true;
    setSaliendo(true);
    setTimeout(() => onFinRef.current(), SALIDA_MS);
  };

  useEffect(() => {
    if (esReducido()) {
      onFinRef.current();
      return;
    }
    const t = setTimeout(cerrar, DURACION_CONFLICTO);
    return () => clearTimeout(t);
  }, []);

  return createPortal(
    <AnimatePresence>
      {!saliendo && (
        <motion.div
          key={`v176ficha-${serie}`}
          className="fixed inset-0 z-[300] select-none overflow-hidden"
          style={{ background: "rgba(2,2,4,0.93)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          onPointerDown={cerrar}
          role="dialog"
          aria-label={`Placa de conflicto: ${bandoA.nombre} contra ${bandoB.nombre}`}
        >
          {/* el tinte de la rareza */}
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(115% 82% at 50% 42%, ${hexRareza}17 0%, transparent 62%)` }}
            aria-hidden
          />

          {/* letterbox de cine */}
          <div className="v174gta-barra-sup absolute inset-x-0 top-0 h-[9vh] border-b border-white/10 bg-black" aria-hidden />
          <div className="v174gta-barra-inf absolute inset-x-0 bottom-0 h-[9vh] border-t border-white/10 bg-black" aria-hidden />

          {/* sello de la colección arriba */}
          <div className="v174gta-linea-sup absolute left-6 top-[11vh] flex items-center gap-2.5" style={{ animationDelay: "160ms" }}>
            <span className="v174gta-pulso inline-block h-1.5 w-1.5 rounded-full" style={{ background: hexRareza, boxShadow: `0 0 10px ${hexRareza}` }} aria-hidden />
            <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-white/70">
              LA COLECCIÓN DE GUERRA · {serie}
            </span>
            <span
              className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] border px-1.5 py-0.5"
              style={{ color: hexRareza, borderColor: `${hexRareza}66`, background: `${hexRareza}14` }}
            >
              {rareza}
            </span>
          </div>

          {/* los dos bandos frente a frente */}
          <div className="relative flex h-full items-center justify-center px-6">
            <div className="w-full max-w-xl">
              <div className="flex items-end justify-between gap-3">
                {/* bando A */}
                <div className="min-w-0 flex-1 text-left">
                  <p className="v174gta-ken text-4xl sm:text-5xl leading-none" style={{ filter: `drop-shadow(0 6px 20px ${hexRareza}55)` }} aria-hidden>
                    {bandoA.bandera}
                  </p>
                  <h2
                    className="v174gta-nombre mt-2 font-sans text-2xl font-black uppercase leading-[0.94] tracking-tight text-white sm:text-4xl"
                    style={{
                      animationDelay: "240ms",
                      textShadow: `0 4px 0 rgba(0,0,0,0.9), 0 0 40px ${hexRareza}40`,
                    }}
                  >
                    {bandoA.nombre}
                  </h2>
                </div>

                {/* el cruce de guerra */}
                <span
                  className="v174gta-nombre shrink-0 pb-1 font-mono text-2xl font-black sm:text-3xl"
                  style={{ color: hexRareza, textShadow: `0 0 22px ${hexRareza}88`, animationDelay: "380ms" }}
                  aria-hidden
                >
                  ✕
                </span>

                {/* bando B */}
                <div className="min-w-0 flex-1 text-right">
                  <p className="v174gta-ken text-4xl sm:text-5xl leading-none" style={{ filter: `drop-shadow(0 6px 20px ${hexRareza}55)` }} aria-hidden>
                    {bandoB.bandera}
                  </p>
                  <h2
                    className="v174gta-nombre mt-2 font-sans text-2xl font-black uppercase leading-[0.94] tracking-tight text-white sm:text-4xl"
                    style={{
                      animationDelay: "300ms",
                      textShadow: `0 4px 0 rgba(0,0,0,0.9), 0 0 40px ${hexRareza}40`,
                    }}
                  >
                    {bandoB.nombre}
                  </h2>
                </div>
              </div>

              <div
                className="v174gta-subrayado mt-3 h-[5px] w-[52%] rounded-sm"
                style={{ background: hexRareza, boxShadow: `0 0 18px ${hexRareza}88`, animationDelay: "480ms" }}
                aria-hidden
              />

              {/* el medidor de intensidad — la misma verdad del ranking */}
              <div className="mt-4 flex items-center gap-2.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/60">INTENSIDAD</span>
                <div className="h-[7px] flex-1 overflow-hidden rounded-sm bg-white/10" aria-hidden>
                  <div
                    className="v174gta-stat h-full rounded-sm"
                    style={{ background: hexRareza, boxShadow: `0 0 14px ${hexRareza}77`, ...statStyle(Math.max(0.04, intensidad / 100), 640) }}
                  />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/80">{intensidad}/100</span>
              </div>

              {/* la placa del teatro */}
              <div className="v174gta-placa mt-4 border-l-[3px] pl-3" style={{ borderColor: hexRareza, animationDelay: "760ms" }}>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/90">{teatro}</p>
                <p className="mt-0.5 font-mono text-[9px] tracking-[0.14em] text-white/45">
                  {coordTxt(lat, lng)} · FICHA {serie}
                </p>
              </div>

              {/* los atributos de la ficha */}
              <div className="mt-5 max-w-[340px] space-y-2.5">
                <BarraAtributo etiqueta="PULSO" valorTxt={`${pulso} CABLES HOY`} valor={Math.min(1, pulso / 8)} color={hexRareza} delay={900} />
                <BarraAtributo etiqueta="FRESCURA" valorTxt={frescuraTxt.toUpperCase()} valor={frescuraVal} color={hexRareza} delay={1020} />
                <BarraAtributo etiqueta="INTENSIDAD" valorTxt={`${intensidad}/100`} valor={intensidad / 100} color={hexRareza} delay={1140} />
              </div>
            </div>
          </div>

          {/* las marcas de la casa */}
          <p className="v174gta-pulso absolute bottom-[3.4vh] left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-[0.3em] text-white/50">
            TOCA PARA VER LA FICHA
          </p>
          <p className="absolute right-3 top-3 font-mono text-[9px] tracking-[0.2em] text-white/35">
            {APP_VERSION_LABEL}
          </p>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

// ────────────────────────────────────────────────────────────
// LA PLACA DE NOTICIA — la tarjeta de inicio de misión
// ────────────────────────────────────────────────────────────
export function IntroGtaNoticia({ cable, onFin }: { cable: EntradaImpacto; onFin: () => void }) {
  const [montado, setMontado] = useState(false);
  const [saliendo, setSaliendo] = useState(false);
  const onFinRef = useRef(onFin);
  useEffect(() => { onFinRef.current = onFin; }); // el ref se actualiza FUERA del render (react-hooks/refs)
  const saliendoRef = useRef(false);

  useEffect(() => setMontado(true), []);

  const cerrar = () => {
    if (saliendoRef.current) return;
    saliendoRef.current = true;
    setSaliendo(true);
    setTimeout(() => onFinRef.current(), SALIDA_MS);
  };

  useEffect(() => {
    if (!montado) return;
    if (esReducido()) {
      onFinRef.current();
      return;
    }
    const t = setTimeout(cerrar, DURACION_NOTICIA);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [montado]);

  // el veredicto de la Agencia — determinista, la misma verdad del ranking
  const score = useMemo(() => scoreImpacto(cable), [cable]);
  const tier = tierDeImpacto(score);
  const hex = TIERS[tier].hex;
  const label = TIERS[tier].label;

  // el titular entra palabra a palabra (recorte a 16 para el ritmo)
  const palabras = useMemo(() => {
    const lista = cable.title.trim().split(/\s+/);
    const recorte = lista.slice(0, 16);
    return lista.length > 16 ? [...recorte, "…"] : recorte;
  }, [cable.title]);
  const delayPalabras = 620;
  const delayPlaca = delayPalabras + Math.min(palabras.length, 17) * 55 + 180;

  const hora = (() => {
    try {
      return new Date(cable.publishedAt).toLocaleString("es-ES", { hour12: false, timeStyle: "short" });
    } catch {
      return "";
    }
  })();

  if (!montado) return null;

  return createPortal(
    <AnimatePresence>
      {!saliendo && (
        <motion.div
          key={`v174gta-n-${cable.id}`}
          className="fixed inset-0 z-[300] select-none overflow-hidden"
          style={{ background: "rgba(2,2,4,0.93)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          onPointerDown={cerrar}
          role="dialog"
          aria-label={`Placa de entrada de la noticia: ${cable.title}`}
        >
          {/* el tinte del escalón */}
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(120% 85% at 24% 60%, ${hex}16 0%, transparent 60%)` }}
            aria-hidden
          />

          {/* letterbox de cine */}
          <div className="v174gta-barra-sup absolute inset-x-0 top-0 h-[9vh] border-b border-white/10 bg-black" aria-hidden />
          <div className="v174gta-barra-inf absolute inset-x-0 bottom-0 h-[9vh] border-t border-white/10 bg-black" aria-hidden />

          {/* sello de la Agencia arriba */}
          <div className="v174gta-linea-sup absolute left-6 top-[11vh] flex items-center gap-2.5" style={{ animationDelay: "160ms" }}>
            <span className="v174gta-pulso inline-block h-1.5 w-1.5 rounded-full" style={{ background: hex, boxShadow: `0 0 10px ${hex}` }} aria-hidden />
            <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-white/70">
              LA AGENCIA CENTRAL · {hora}
            </span>
          </div>

          {/* la tarjeta de misión */}
          <div className="relative flex h-full items-center justify-center px-6">
            <div className="w-full max-w-xl">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h2
                  className="v174gta-nombre font-sans text-4xl font-black uppercase leading-none tracking-tight sm:text-6xl"
                  style={{ color: hex, textShadow: `0 4px 0 rgba(0,0,0,0.9), 0 0 46px ${hex}45`, animationDelay: "200ms" }}
                >
                  {label}
                </h2>
                <p className="v174gta-linea-sup font-mono text-[11px] uppercase tracking-[0.24em] text-white/80" style={{ animationDelay: "380ms" }}>
                  IMPACTO {score}/100
                </p>
              </div>

              {/* el medidor del impacto */}
              <div className="mt-3 h-[6px] w-full max-w-[280px] overflow-hidden rounded-sm bg-white/10" aria-hidden>
                <div
                  className="v174gta-stat h-full rounded-sm"
                  style={{ background: hex, boxShadow: `0 0 14px ${hex}77`, ...statStyle(score / 100, 520) }}
                />
              </div>

              {/* el titular, palabra a palabra */}
              <p className="mt-5 max-w-xl text-xl font-bold leading-snug text-white sm:text-3xl">
                {palabras.map((p, i) => (
                  <span
                    key={`${i}-${p}`}
                    className="v174gta-palabra"
                    style={{ animationDelay: `${delayPalabras + i * 55}ms` }}
                  >
                    {p}
                    {i < palabras.length - 1 ? "\u00A0" : ""}
                  </span>
                ))}
              </p>

              {/* la placa de la fuente */}
              <div
                className="v174gta-placa mt-6 flex items-center gap-2.5 border-l-[3px] pl-3"
                style={{ borderColor: hex, animationDelay: `${delayPlaca}ms` }}
              >
                {cable.sourceCountry && <Flag code={cable.sourceCountry} size={16} />}
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/85">{cable.source}</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/45">
                  {(cable.tacticalTag || "INFO").toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* las marcas de la casa */}
          <p className="v174gta-pulso absolute bottom-[3.4vh] left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-[0.3em] text-white/50">
            TOCA PARA SEGUIR LEYENDO
          </p>
          <p className="absolute right-3 top-3 font-mono text-[9px] tracking-[0.2em] text-white/35">
            {APP_VERSION_LABEL}
          </p>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

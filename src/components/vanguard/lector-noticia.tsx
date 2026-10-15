"use client";

// ============================================================
// v116.0 MEGALÓPOLIS — SALA DE LECTURA
// Mandato del comandante: "que Vanguard no te mande a otras
// páginas, quítale importancia — haz que sea como si la página
// estuviera DENTRO de Vanguard".
//   · Cualquier cable (INICIO, REDACCIÓN/NOTICIAS) se abre aquí:
//     una sala de la casa, no una pestaña externa.
//   · Portada 3D viva, credibilidad de fuente, bandera real, hora,
//     etiquetas tácticas y EL CONTEXTO VANGUARD (lo que la casa
//     sabe del asunto, derivado del propio cable en vivo).
//   · SALAS RELACIONADAS: el asunto te lleva a las salas donde se
//     vigila — cero navegación externa.
//   · La fuente original queda como nota al pie en mono pequeño
//     (solo texto, sin enlace): se informa, no se manda.
// ============================================================

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldAlert, Clock, Copy, Check, Newspaper, Compass, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { useCalma } from "@/lib/calma";
import { Flag } from "@/lib/flags";
import { navigateTo } from "@/lib/nav";
import type { TabKey } from "./tab-nav";
import { PortadaNoticia } from "./portada-noticia";
// v117.0 ATMÓSFERA: la NEURONA lee el cable — núcleo v4 determinista que
// corre EN TU DISPOSITIVO (misma receta que el Monitor Global y la Mente:
// rasgos → pesos → sigmoide → veredicto, reproducible en los 8 idiomas).
import { evaluarNeuronal, type Sentimiento } from "@/lib/neurona-core";

export interface CableLectura {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  tacticalTag: string | null;
  conflictTag: string | null;
  sourceCountry?: string | null;
}

// credibilidad por fuente (la misma escala de la casa)
const CRED: Record<string, number> = {
  reuters: 97, ap: 96, "associated press": 96, bbc: 93, "bbc news": 93, "the guardian": 89,
  "ny times": 88, "new york times": 88, dw: 87, "france 24": 86, "al jazeera": 84, cnn: 81,
  "google news": 72, gnews: 72, "vanguard-cmd": 85, wikipedia: 75,
};

// etiqueta táctica → salas donde la casa vigila ese asunto
const SALAS_POR_TAG: Record<string, TabKey[]> = {
  MILITAR: ["frentes", "osint", "warsim"],
  ULTIMA_HORA: ["noticias", "centinela", "radar"],
  FLASH: ["noticias", "centinela", "radar"],
  ECONOMIA: ["bolsa", "divisas", "hacienda"],
  MERCADOS: ["bolsa", "divisas", "hacienda"],
  DIPLOMACIA: ["geopolitica", "embajadores", "tribunal"],
  CIENCIA: ["observatorio", "laboratorio", "biblioteca"],
  ESPACIO: ["observatorio", "cielos", "planeta"],
  CIBER: ["ciber", "espionaje", "centinela"],
  INFO: ["redaccion", "verifica", "wikiguerra"],
};

function dominioDe(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function credibilidadDe(source: string): number | null {
  const s = (source || "").toLowerCase();
  for (const k of Object.keys(CRED)) {
    if (s.includes(k)) return CRED[k];
  }
  return null;
}

const ETIQUETA_TAG: Record<string, string> = {
  MILITAR: "MILITAR",
  ULTIMA_HORA: "ÚLTIMA HORA",
  FLASH: "FLASH",
  ECONOMIA: "ECONOMÍA",
  MERCADOS: "MERCADOS",
  DIPLOMACIA: "DIPLOMACIA",
  CIENCIA: "CIENCIA",
  ESPACIO: "ESPACIO",
  CIBER: "CIBER",
  INFO: "INFORMACIÓN",
};

// v117 — color del sentimiento de la NEURONA (semáforo de la casa)
const COLOR_SENTIMIENTO: Record<Sentimiento, string> = {
  ESCALADA: "#FF6B5E",
  TENSIÓN: "#FFC94D",
  ESTABLE: "#34C759",
  DÉTENTE: "#38BDF8",
};

function colorNivel(n: number): string {
  return n >= 70 ? "#FF6B5E" : n >= 40 ? "#FFC94D" : "#34C759";
}

// barra de nivel de la NEURONA (ancho via width, sin re-render en vivo)
function BarraNeurona({ etiqueta, valor }: { etiqueta: string; valor: number }) {
  const c = colorNivel(valor);
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{etiqueta}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${Math.round(valor)}%`, background: c, boxShadow: `0 0 8px ${c}66` }} />
      </div>
      <span className="w-8 shrink-0 text-right font-mono text-[10px] font-bold tabular-nums" style={{ color: c }}>{Math.round(valor)}</span>
    </div>
  );
}

export function LectorNoticia({
  cable,
  onCerrar,
}: {
  cable: CableLectura | null;
  onCerrar: () => void;
}) {
  const { t } = useT();
  const activarLectura = useCalma((s) => s.activarLectura);
  const desactivarLectura = useCalma((s) => s.desactivarLectura);
  const [copiado, setCopiado] = useState(false);
  // v116 FIX QA: el lector vive DENTRO del árbol de la sala — si un ancestro
  // lleva transform (framer-motion), position:fixed deja de ser viewport y el
  // modal cae a 9000 px de profundidad (cazado en móvil 390×844). Portal al
  // body: el modal flota SIEMPRE sobre la pantalla, en cualquier sala.
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  // mientras se lee, la sala queda en calma (nada interrumpe la lectura)
  useEffect(() => {
    if (!cable) return;
    activarLectura();
    return () => desactivarLectura();
  }, [cable, activarLectura, desactivarLectura]);

  useEffect(() => {
    if (!cable) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCerrar(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cable, onCerrar]);

  const hora = cable ? (() => {
    try {
      return new Date(cable.publishedAt).toLocaleString("es-ES", { hour12: false, dateStyle: "short", timeStyle: "short" });
    } catch {
      return "";
    }
  })() : "";

  const cred = cable ? credibilidadDe(cable.source) : null;
  const salas = cable ? (SALAS_POR_TAG[(cable.tacticalTag || "").toUpperCase()] ?? ["redaccion", "verifica", "noticias"]) : [];
  const dominio = cable ? dominioDe(cable.url) : "";

  // v117 LECTURA NEURONA: veredicto del núcleo v4 sobre el titular —
  // determinista (misma semilla → mismo veredicto) y cero latencia.
  const neurona = useMemo(() => (cable ? evaluarNeuronal(cable.title) : null), [cable]);

  // EL CONTEXTO VANGUARD: lo que la casa sabe del asunto — derivado del
  // propio cable (fuente, etiqueta, bandera), sin pedidos externos.
  const contexto = useMemo(() => {
    if (!cable) return [];
    const out: string[] = [];
    const cred2 = credibilidadDe(cable.source);
    if (cred2 !== null) {
      out.push(t("lector116.ctx.cred", { fuente: cable.source, cred: cred2 }));
    } else {
      out.push(t("lector116.ctx.fuente", { fuente: cable.source }));
    }
    const tag = (cable.tacticalTag || "INFO").toUpperCase();
    out.push(t("lector116.ctx.tag", { tag: ETIQUETA_TAG[tag] ?? tag }));
    if (cable.conflictTag) out.push(t("lector116.ctx.conflicto", { conflicto: cable.conflictTag }));
    if (cable.sourceCountry) out.push(t("lector116.ctx.pais"));
    return out;
  }, [cable, cred, t]);

  const copiarTitular = async () => {
    if (!cable) return;
    try {
      await navigator.clipboard.writeText(cable.title);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1600);
    } catch { /* portapapeles bloqueado: silencio, la casa no se queja */ }
  };

  return (
    <>
      {montado && createPortal(
        <AnimatePresence>
        {cable && (
        <motion.div
          className="fixed inset-0 z-[96] flex items-start sm:items-center justify-center overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          role="dialog"
          aria-modal="true"
          aria-label={t("lector116.titulo")}
        >
          <button aria-label={t("lector116.cerrar")} onClick={onCerrar} className="absolute inset-0 bg-black/85 backdrop-blur-[4px] cursor-default" />

          <motion.div
            className="relative z-10 w-[min(720px,94vw)] my-auto rounded-2xl border overflow-hidden"
            style={{ borderColor: "#FF8A2A55", background: "linear-gradient(165deg, #12100a 0%, #0a0906 55%, #06060a 100%)" }}
            initial={{ opacity: 0, y: 26, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* cabecera de la sala */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FF8A2A1f", border: "1px solid #FF8A2A55" }}>
                <Newspaper className="w-5 h-5" style={{ color: "#FF8A2A" }} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-mono font-bold text-[12px] sm:text-[13px] tracking-[0.3em] uppercase" style={{ color: "#FF8A2A" }}>
                  {t("lector116.titulo")}
                </h2>
                <p className="text-[10.5px] text-muted-foreground leading-snug mt-0.5 font-mono">
                  {t("lector116.sub")}
                </p>
              </div>
              <button onClick={onCerrar} className="rounded-lg border border-white/15 p-1.5 text-muted-foreground hover:text-foreground transition-colors shrink-0" aria-label={t("lector116.cerrar")}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 max-h-[72vh] overflow-y-auto">
              {/* portada 3D viva del cable */}
              <div className="rounded-md overflow-hidden border border-white/10 relative h-40 sm:h-48">
                <PortadaNoticia id={cable.id} tag={cable.tacticalTag} className="absolute inset-0" />
              </div>

              {/* titular */}
              <h3 className="font-serif text-lg sm:text-[21px] font-bold leading-snug text-soft">
                {cable.title}
              </h3>

              {/* línea de credibilidad: fuente + bandera + hora */}
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-muted-foreground">
                {cable.sourceCountry && <Flag code={cable.sourceCountry} size={16} />}
                <span className="uppercase tracking-widest text-foreground/85">{cable.source}</span>
                {cred !== null && (
                  <span className="inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5" style={{ border: `1px solid ${cred >= 90 ? "#34C75966" : cred >= 80 ? "#FFC94D66" : "#FF6B5E66"}`, color: cred >= 90 ? "#34C759" : cred >= 80 ? "#FFC94D" : "#FF6B5E" }}>
                    <ShieldAlert className="w-3 h-3" /> {t("lector116.credibilidad")} {cred}/100
                  </span>
                )}
                <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {hora}</span>
                {cable.tacticalTag && (
                  <span className="rounded-sm px-1.5 py-0.5 bg-white/5 border border-white/10 uppercase tracking-widest">
                    {ETIQUETA_TAG[(cable.tacticalTag || "").toUpperCase()] ?? cable.tacticalTag}
                  </span>
                )}
              </div>

              {/* EL CONTEXTO VANGUARD */}
              <div className="rounded-md border border-amber-hud/25 bg-amber-hud/5 p-3">
                <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-amber mb-1.5">{t("lector116.contexto")}</p>
                <ul className="space-y-1">
                  {contexto.map((c, i) => (
                    <li key={i} className="text-[12px] leading-relaxed text-foreground/80 flex gap-2">
                      <span className="text-amber shrink-0" aria-hidden>▸</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* v117 LECTURA NEURONA — el núcleo v4 lee el cable en tu dispositivo */}
              {neurona && (
                <div className="rounded-md border p-3" style={{ borderColor: "#B48CFF44", background: "rgba(180,140,255,0.06)" }}>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.3em] uppercase" style={{ color: "#B48CFF" }}>
                      <BrainCircuit className="w-3.5 h-3.5" /> {t("lector117.neurona")}
                    </p>
                    <span className="rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest" style={{ border: `1px solid ${COLOR_SENTIMIENTO[neurona.sentimiento]}66`, color: COLOR_SENTIMIENTO[neurona.sentimiento], background: `${COLOR_SENTIMIENTO[neurona.sentimiento]}14` }}>
                      {neurona.sentimiento}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <BarraNeurona etiqueta={t("lector117.riesgo")} valor={neurona.riesgo} />
                    <BarraNeurona etiqueta={t("lector117.tension")} valor={neurona.tension} />
                    <BarraNeurona etiqueta={t("lector117.confianza")} valor={neurona.confianza} />
                  </div>
                  <p className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{t("lector117.neuronas")}</span>
                    {neurona.neuronasActivas.length > 0 ? (
                      neurona.neuronasActivas.map((n) => (
                        <span key={n} className="rounded-sm border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-foreground/80">{n}</span>
                      ))
                    ) : (
                      <span className="font-mono text-[9px] text-muted-foreground">{t("lector117.ninguna")}</span>
                    )}
                  </p>
                  <p className="mt-1.5 font-mono text-[8.5px] leading-relaxed text-muted-foreground/80">{t("lector117.sub")}</p>
                </div>
              )}

              {/* SALAS RELACIONADAS — el asunto te lleva a donde se vigila */}
              <div>
                <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-electric" /> {t("lector116.relacionada")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {salas.map((s) => (
                    <button
                      key={s}
                      onClick={() => { onCerrar(); setTimeout(() => navigateTo(s), 60); }}
                      className="rounded-sm border border-electric-hud/50 bg-electric-hud/10 px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-electric hover:bg-electric-hud/30 transition-colors"
                    >
                      {s} →
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* pie: acciones de la casa + la fuente como NOTA (sin enlaces) */}
            <div className="px-4 sm:px-5 pb-4 pt-3 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap">
              <button
                onClick={() => void copiarTitular()}
                className="inline-flex items-center gap-1.5 rounded-sm border border-white/15 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-white/35 transition-colors"
              >
                {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} {t("lector116.copiar")}
              </button>
              <p className={cn("font-mono text-[9px] text-muted-foreground/70 tracking-widest")}>
                {t("lector116.fuente")} · {dominio || cable?.source}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )},
      </AnimatePresence>,
      document.body
      )}
    </>
  );
}

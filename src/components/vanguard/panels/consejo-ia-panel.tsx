"use client";

// v79.0 — EL CONSEJO DE ACERO: la primera sala de deliberación con IA en vivo.
// Planteas una crisis → 4 consejeros de IA intervienen con efecto máquina de
// escribir → votan → firman un DECRETO que paga monedas al cumplirlo.
// Después puedes contestarles cara a cara: cada consejero mantiene memoria
// de la sala mientras viva la sesión. Todo animado, todo con acento propio.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gavel, Send, Swords, Landmark, Crosshair, LineChart, Sparkles, Check, X, MinusCircle, Hourglass, ScrollText, Coins } from "lucide-react";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { useGameStore } from "@/lib/game-store";
import { sfx } from "@/lib/sound";
import { cn } from "@/lib/utils";

type ConsejeroId = "estratega" | "canciller" | "general" | "analista";

const ACERO = "#00E5FF";

const CONSEJEROS: { id: ConsejeroId; nombre: string; rol: string; icon: typeof Swords; hex: string }[] = [
  { id: "estratega", nombre: "EL ESTRATEGA", rol: "Táctica · mapas · logística", icon: Crosshair, hex: "#38BDF8" },
  { id: "canciller", nombre: "LA CANCILLER", rol: "Diplomacia · alianzas", icon: Landmark, hex: "#FFC94D" },
  { id: "general", nombre: "EL GENERAL", rol: "Fuerza · disuasión", icon: Swords, hex: "#FF5A3C" },
  { id: "analista", nombre: "EL ANALISTA", rol: "Datos · probabilidad", icon: LineChart, hex: "#00FF87" },
];

const TEMAS_SUGERIDOS = [
  "Escalada naval en el mar Rojo",
  "Una nueva guerra fría por los chips",
  "Crisis energética en Europa",
  "Conflicto fronterizo con retirada imposible",
  "Sanciones que no hacen mella",
];

type Intervencion = { id: ConsejeroId; texto: string };
type Voto = { id: ConsejeroId; voto: string; confianza: number };
type Decreto = { titulo: string; veredicto: string; texto: string; acciones: string[] };

// máquina de escribir a 60fps: revela por caracteres con intervalo fijo
function useTypewriter(text: string, active: boolean, cps = 55) {
  const [out, setOut] = useState("");
  useEffect(() => {
    if (!active || !text) {
      setOut(active ? "" : text);
      return;
    }
    setOut("");
    let i = 0;
    const step = Math.max(1, Math.round(cps / 20));
    const t = setInterval(() => {
      i += step;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(t);
    }, 50);
    return () => clearInterval(t);
  }, [text, active, cps]);
  return out;
}

function ConsejoCard({
  c,
  estado,
  texto,
  voto,
  onHablar,
  escribiendo,
}: {
  c: (typeof CONSEJEROS)[number];
  estado: "reposo" | "deliberando" | "listo";
  texto: string;
  voto?: Voto;
  onHablar: () => void;
  escribiendo: boolean;
}) {
  const Icon = c.icon;
  const visible = useTypewriter(texto, escribiendo);
  const mostrado = escribiendo ? visible : texto;
  return (
    <motion.div
      layout
      className={cn("hud-corner relative overflow-hidden border rounded-sm p-3.5 transition-colors")}
      style={{
        borderColor: `${c.hex}55`,
        background: `linear-gradient(150deg, ${c.hex}12 0%, rgba(7,7,11,0.92) 55%)`,
        boxShadow: estado !== "reposo" ? `0 0 26px ${c.hex}33` : undefined,
      }}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <span
          className={cn("w-9 h-9 shrink-0 rounded-sm flex items-center justify-center border", estado === "deliberando" && "animate-pulse")}
          style={{ borderColor: `${c.hex}88`, color: c.hex, background: `${c.hex}14`, boxShadow: `0 0 18px ${c.hex}44` }}
        >
          <Icon className="w-4 h-4" />
        </span>
        <div className="min-w-0">
          <div className="font-display text-[12px] font-black tracking-widest leading-none" style={{ color: c.hex, textShadow: `0 0 14px ${c.hex}66` }}>
            {c.nombre}
          </div>
          <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground mt-1">{c.rol}</div>
        </div>
        {estado === "deliberando" && (
          <span className="ml-auto text-[8px] font-mono font-bold uppercase tracking-widest" style={{ color: c.hex }}>
            deliberando…
          </span>
        )}
        {voto && estado === "listo" && (
          <span
            className="ml-auto shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm border text-[8px] font-mono font-black tracking-wider"
            style={{
              borderColor: voto.voto === "A FAVOR" ? "#00FF8766" : voto.voto === "EN CONTRA" ? "#FF3B3066" : "#8A8A9466",
              color: voto.voto === "A FAVOR" ? "#00FF87" : voto.voto === "EN CONTRA" ? "#FF3B30" : "#9CA3AF",
              background: voto.voto === "A FAVOR" ? "#00FF8714" : voto.voto === "EN CONTRA" ? "#FF3B3014" : "#8A8A9414",
            }}
          >
            {voto.voto === "A FAVOR" ? <Check className="w-2.5 h-2.5" /> : voto.voto === "EN CONTRA" ? <X className="w-2.5 h-2.5" /> : <MinusCircle className="w-2.5 h-2.5" />}
            {voto.voto} {voto.confianza}%
          </span>
        )}
      </div>
      {mostrado && (
        <p className="text-[12px] leading-relaxed text-soft/90 min-h-[3em]">
          {mostrado}
          {escribiendo && <span className="inline-block w-1.5 h-3.5 ml-0.5 align-middle animate-pulse" style={{ background: c.hex }} />}
        </p>
      )}
      {estado === "listo" && !escribiendo && (
        <button
          onClick={onHablar}
          className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border text-[9px] font-mono font-bold uppercase tracking-widest transition-colors hover:bg-opacity-30"
          style={{ borderColor: `${c.hex}77`, color: c.hex, background: `${c.hex}14` }}
        >
          <Send className="w-3 h-3" /> Contestar a {c.nombre}
        </button>
      )}
    </motion.div>
  );
}

export function ConsejoIaPanel() {
  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);

  const [tema, setTema] = useState("");
  const [fase, setFase] = useState<"sala" | "deliberando" | "votacion" | "decreto">("sala");
  const [intervenciones, setIntervenciones] = useState<Intervencion[]>([]);
  const [votos, setVotos] = useState<Voto[]>([]);
  const [decreto, setDecreto] = useState<Decreto | null>(null);
  const [orden, setOrden] = useState(0); // cuántas intervenciones ya se escribieron
  const [error, setError] = useState("");
  const [iaViva, setIaViva] = useState(true);

  // diálogo directo
  const [hablandoCon, setHablandoCon] = useState<ConsejeroId | null>(null);
  const [replica, setReplica] = useState("");
  const [pensando, setPensando] = useState(false);
  const [respuestas, setRespuestas] = useState<Record<string, string[]>>({});

  const salaRef = useRef<HTMLDivElement>(null);

  // v79 SOCIAL: prefill desde los foros ("Llevar al Consejo")
  useEffect(() => {
    try {
      const pre = sessionStorage.getItem("vanguard:consejo-tema");
      if (pre) {
        setTema(pre.slice(0, 280));
        sessionStorage.removeItem("vanguard:consejo-tema");
      }
    } catch {}
  }, []);

  const estadoDe = useCallback(
    (idx: number): "reposo" | "deliberando" | "listo" => {
      if (fase === "sala") return "reposo";
      if (idx < orden) return "listo";
      if (idx === orden && (fase === "deliberando" || fase === "votacion")) return "deliberando";
      return fase === "decreto" ? "listo" : "reposo";
    },
    [fase, orden],
  );

  // revela las intervenciones una a una (efecto consejo hablando por turnos)
  useEffect(() => {
    if (fase !== "deliberando" || intervenciones.length === 0) return;
    const textoActual = intervenciones[orden]?.texto ?? "";
    if (!textoActual) return;
    const dur = Math.min(5200, Math.max(1400, textoActual.length * 18));
    const t = setTimeout(() => {
      if (orden + 1 < intervenciones.length) {
        setOrden((o) => o + 1);
      } else {
        setFase("decreto");
        sfx.success();
      }
    }, dur);
    return () => clearTimeout(t);
  }, [fase, orden, intervenciones]);

  const deliberar = useCallback(async () => {
    const t = tema.trim();
    if (t.length < 4) {
      setError("Plantea la crisis con al menos 4 caracteres.");
      sfx.error();
      return;
    }
    setError("");
    setIntervenciones([]);
    setVotos([]);
    setDecreto(null);
    setOrden(0);
    setRespuestas({});
    setFase("deliberando");
    sfx.click();
    try {
      const res = await fetch("/api/consejo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modo: "deliberacion", tema: t }),
      });
      const data = await res.json();
      if (!data?.ok) {
        setError(data?.error ?? "El consejo no pudo reunirse.");
        setFase("sala");
        sfx.error();
        return;
      }
      setIaViva(data.ia !== false);
      setIntervenciones(data.intervenciones ?? []);
      setVotos(data.votos ?? []);
      setDecreto(data.decreto ?? null);
    } catch {
      setError("Señal perdida con la sala. Reintenta.");
      setFase("sala");
      sfx.error();
    }
  }, [tema]);

  const enviarReplica = useCallback(async () => {
    if (!hablandoCon || replica.trim().length < 2) return;
    setPensando(true);
    sfx.click();
    const id = hablandoCon;
    const historial = [
      { consejero: "tema", texto: tema },
      ...intervenciones.filter((i) => i.id === id).map((i) => ({ consejero: id, texto: i.texto })),
      ...(respuestas[id] ?? []).map((r, i) => ({ consejero: i % 2 ? id : "comandante", texto: r })),
    ];
    try {
      const res = await fetch("/api/consejo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modo: "dialogo", consejero: id, mensaje: replica, historial }),
      });
      const data = await res.json();
      const respuesta = data?.respuesta ?? "…";
      setRespuestas((prev) => ({ ...prev, [id]: [...(prev[id] ?? []), replica, respuesta] }));
    } catch {
      setRespuestas((prev) => ({ ...prev, [id]: [...(prev[id] ?? []), replica, "Señal perdida. Repite la orden."] }));
    } finally {
      setReplica("");
      setPensando(false);
    }
  }, [hablandoCon, replica, tema, intervenciones, respuestas]);

  const cumplirDecreto = useCallback(() => {
    if (!decreto) return;
    addCoins(150, "Decreto del Consejo de Acero cumplido");
    addXp(60);
    sfx.coin();
    setDecreto(decreto ? { ...decreto, titulo: decreto.titulo } : null);
  }, [decreto, addCoins, addXp]);

  const enVivo = useMemo(() => fase === "deliberando" || fase === "decreto", [fase]);

  return (
    <section className="mt-4 space-y-4" aria-label="Consejo de Acero: deliberación con IA en vivo">
      <HeroOro panel="consejoia" />

      {/* SALA DE DELIBERACIÓN */}
      <div className="hud-panel p-4" style={{ borderColor: `${ACERO}44` }}>
        <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
          <div className="flex items-center gap-2">
            <Gavel className="w-4 h-4" style={{ color: ACERO }} />
            <span className="font-display text-sm font-black tracking-widest" style={{ color: ACERO, textShadow: `0 0 16px ${ACERO}66` }}>
              SALA DE DELIBERACIÓN
            </span>
          </div>
          <span
            className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-sm border text-[8px] font-mono font-bold uppercase tracking-widest", enVivo && "animate-pulse")}
            style={{ borderColor: `${ACERO}55`, color: ACERO, background: `${ACERO}10` }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: iaViva ? "#00FF87" : "#FFB020" }} />
            {iaViva ? "NÚCLEO IA EN VIVO" : "NÚCLEO LOCAL (SIN IA)"}
          </span>
        </div>

        <textarea
          value={tema}
          onChange={(e) => setTema(e.target.value.slice(0, 280))}
          rows={2}
          placeholder="Plantea la crisis ante el consejo: ¿qué debe deliberar?"
          className="w-full bg-secondary/40 border border-border rounded-sm p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-hud resize-none"
          aria-label="Tema para el consejo"
        />
        <div className="flex flex-wrap gap-1.5 mt-2">
          {TEMAS_SUGERIDOS.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTema(t);
                sfx.hover();
              }}
              className="px-2 py-1 rounded-sm border border-border/60 text-[9px] font-mono uppercase tracking-wide text-muted-foreground hover:text-foreground hover:border-cyan-hud/70 hover:bg-cyan-hud/15 transition-colors"
            >
              {t}
            </button>
          ))}
        </div>
        <button
          onClick={deliberar}
          disabled={fase === "deliberando" || fase === "decreto"}
          className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-sm border font-display text-xs font-black tracking-[0.25em] uppercase transition-all disabled:opacity-50"
          style={{ borderColor: `${ACERO}88`, color: "#04121A", background: `linear-gradient(120deg, ${ACERO}, #7DF3FF)`, boxShadow: `0 0 30px ${ACERO}55` }}
        >
          {fase === "deliberando" ? (
            <>
              <Hourglass className="w-4 h-4 animate-spin" /> EL CONSEJO DELIBERA…
            </>
          ) : (
            <>
              <Gavel className="w-4 h-4" /> CONVOCAR AL CONSEJO
            </>
          )}
        </button>
        {error && <p className="mt-2 text-[11px] font-mono text-red-400">{error}</p>}
      </div>

      {/* LOS 4 CONSEJEROS */}
      <div ref={salaRef} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {CONSEJEROS.map((c, idx) => (
          <AnimatePresence key={c.id} mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.35 }}
            >
              <ConsejoCard
                c={c}
                estado={estadoDe(idx)}
                texto={intervenciones.find((i) => i.id === c.id)?.texto ?? ""}
                voto={votos.find((v) => v.id === c.id)}
                escribiendo={estadoDe(idx) === "deliberando"}
                onHablar={() => {
                  setHablandoCon(c.id);
                  sfx.tab();
                }}
              />
              {/* respuestas del diálogo directo */}
              {hablandoCon === c.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-2 border rounded-sm p-3"
                  style={{ borderColor: `${c.hex}44`, background: "rgba(5,5,9,0.92)" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest" style={{ color: c.hex }}>
                      Cara a cara con {c.nombre}
                    </span>
                    <button onClick={() => setHablandoCon(null)} className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground" aria-label="Cerrar diálogo">
                      cerrar ✕
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto thin-scroll mb-2">
                    {(respuestas[c.id] ?? []).map((r, i) => (
                      <p key={i} className={cn("text-[11px] leading-relaxed", i % 2 === 0 ? "text-muted-foreground italic" : "text-soft")}>
                        {i % 2 === 0 ? "TÚ: " : `${c.nombre}: `}
                        {r}
                      </p>
                    ))}
                    {pensando && <p className="text-[10px] font-mono animate-pulse" style={{ color: c.hex }}>piensa…</p>}
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      value={replica}
                      onChange={(e) => setReplica(e.target.value.slice(0, 500))}
                      onKeyDown={(e) => e.key === "Enter" && enviarReplica()}
                      placeholder={`Contesta a ${c.nombre}…`}
                      className="flex-1 bg-secondary/40 border border-border rounded-sm px-2.5 py-2 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                      aria-label={`Réplica a ${c.nombre}`}
                    />
                    <button
                      onClick={enviarReplica}
                      disabled={pensando || replica.trim().length < 2}
                      className="px-3 rounded-sm border transition-colors disabled:opacity-40"
                      style={{ borderColor: `${c.hex}88`, color: c.hex, background: `${c.hex}14` }}
                      aria-label="Enviar réplica"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        ))}
      </div>

      {/* EL DECRETO */}
      <AnimatePresence>
        {fase === "decreto" && decreto && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45, type: "spring", bounce: 0.3 }}
            className="hud-corner relative overflow-hidden border rounded-sm p-5"
            style={{ borderColor: `${ACERO}88`, background: `linear-gradient(155deg, ${ACERO}18 0%, rgba(5,5,9,0.95) 60%)`, boxShadow: `0 0 44px ${ACERO}33` }}
          >
            <div className="flex items-center gap-2.5 mb-1.5">
              <ScrollText className="w-5 h-5" style={{ color: ACERO }} />
              <span className="font-display text-base sm:text-lg font-black tracking-widest text-soft" style={{ textShadow: `0 0 18px ${ACERO}77` }}>
                {decreto.titulo}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span
                className="px-2 py-0.5 rounded-sm border text-[9px] font-mono font-black tracking-widest"
                style={{ borderColor: `${ACERO}88`, color: ACERO, background: `${ACERO}14` }}
              >
                VEREDICTO: {decreto.veredicto}
              </span>
              {votos.length > 0 && (
                <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                  {votos.filter((v) => v.voto === "A FAVOR").length} a favor · {votos.filter((v) => v.voto === "EN CONTRA").length} en contra ·{" "}
                  {votos.filter((v) => v.voto === "ABSTENCIÓN").length} abstención
                </span>
              )}
            </div>
            <p className="text-[13px] leading-relaxed text-soft/90 mb-3">{decreto.texto}</p>
            {decreto.acciones.length > 0 && (
              <ul className="space-y-1.5 mb-4">
                {decreto.acciones.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-muted-foreground">
                    <span className="mt-1 w-1.5 h-1.5 shrink-0 rounded-full" style={{ background: ACERO, boxShadow: `0 0 8px ${ACERO}` }} />
                    {a}
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={cumplirDecreto}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-sm border font-display text-xs font-black tracking-[0.25em] uppercase transition-transform hover:scale-[1.01] active:scale-[0.99]"
              style={{ borderColor: "#FFC94D88", color: "#1A1206", background: "linear-gradient(120deg, #FFC94D, #FFB35C)", boxShadow: "0 0 30px rgba(255,201,77,0.4)" }}
            >
              <Coins className="w-4 h-4" /> CUMPLIR EL DECRETO · +150 MONEDAS · +60 XP
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-center text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60 flex items-center justify-center gap-1.5">
        <Sparkles className="w-3 h-3" /> El Consejo de Acero es IA en vivo: cada deliberación es única e irrepetible
      </p>
    </section>
  );
}

"use client";

// v99.0 MENTE VIVA — LA MENTE DE VANGUARD (panel del cerebro central).
// Tres salas en una: PULSO (el mundo se actualiza solo cada 5 min y la MENTE
// piensa en voz alta), CHARLA (conversa con ella) y ANÁLISIS (firma expedientes
// completos con proyección explicable de cualquier titular que le pongas).
// Todo con respaldo determinista local: la sala NUNCA queda en silencio.

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Brain, Send, Loader2, Eye, Timer, MessageSquare, ScanSearch, Sparkles, Zap, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/lib/game-store";
// v101.0 EL REGRESO — PILAR 2: cada análisis alimenta el PERFIL DE ANALISTA
import { useAnalista } from "@/lib/analista";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { HeroOro } from "@/components/vanguard/hero-oro";
import {
  pulsoActual, proximoPulsoMs, eventosPulso, pensamientoMente, riesgoPulso,
  TIPO_COLOR, type EventoPulso, type TipoPulso,
} from "@/lib/mente-data";

type Sala = "pulso" | "charla" | "analisis";

const LS_MENTE = "vg-mente-v99";
const LS_CHAT = "vg-mente-chat-v99";
const MENTE_ACC = "#BEF264";

type ChatMsg = { role: "user" | "mente"; text: string; ia?: boolean };

function leerMente(): { recompensados: string[]; dia: string; n: number; chatDia: string; chatHecho: boolean } {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_MENTE) || "{}");
    const dia = new Date().toISOString().slice(0, 10);
    return {
      recompensados: Array.isArray(raw.recompensados) ? raw.recompensados : [],
      dia: typeof raw.dia === "string" ? raw.dia : "",
      n: typeof raw.n === "number" ? raw.n : 0,
      chatDia: typeof raw.chatDia === "string" ? raw.chatDia : "",
      chatHecho: raw.chatHecho === true,
    };
  } catch {
    return { recompensados: [], dia: "", n: 0, chatDia: "", chatHecho: false };
  }
}

function RiesgoBar({ riesgo, color }: { riesgo: number; color?: string }) {
  return (
    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden w-full">
      <div
        className="h-full rounded-full transition-transform duration-700 origin-left"
        style={{ width: "100%", transform: `scaleX(${riesgo / 100})`, background: color || (riesgo >= 70 ? "#FF3B30" : riesgo >= 45 ? "#FFA030" : "#4ADE80") }}
      />
    </div>
  );
}

function ChipTipo({ tipo }: { tipo: TipoPulso }) {
  const c = TIPO_COLOR[tipo];
  return (
    <span
      className="px-1.5 py-0.5 rounded font-mono text-[9px] font-bold tracking-wider shrink-0"
      style={{ color: c, background: `${c}1f`, border: `1px solid ${c}44` }}
    >
      {tipo}
    </span>
  );
}

function EventoCard({ ev, i }: { ev: EventoPulso; i: number }) {
  return (
    <div
      className="v99-entra rounded-lg border border-white/10 bg-black/40 p-2.5 flex flex-col gap-1.5"
      style={{ animationDelay: `${i * 70}ms` }}
    >
      <div className="flex items-center gap-2">
        <ChipTipo tipo={ev.tipo} />
        <span className="ml-auto font-mono text-[9px] text-muted-foreground">{ev.hora}</span>
      </div>
      <p className="text-[12px] leading-snug text-foreground/90">{ev.titulo}</p>
      <div className="flex items-center gap-2 mt-0.5">
        <RiesgoBar riesgo={ev.riesgo} color={TIPO_COLOR[ev.tipo]} />
        <span className="font-mono text-[9px] text-muted-foreground shrink-0">riesgo {ev.riesgo}</span>
      </div>
    </div>
  );
}

function CerebroVivo() {
  // red neuronal decorativa: 8 nodos (las 8 neuronas del núcleo) + sinapsis
  const nodos: { x: number; y: number; d: number }[] = useMemo(
    () => [
      { x: 50, y: 14, d: 0 }, { x: 18, y: 34, d: 300 }, { x: 82, y: 34, d: 600 },
      { x: 8, y: 62, d: 900 }, { x: 50, y: 54, d: 450 }, { x: 92, y: 62, d: 1200 },
      { x: 28, y: 84, d: 1500 }, { x: 72, y: 84, d: 1800 },
    ],
    []
  );
  const lineas = useMemo(
    () => [
      [0, 1], [0, 2], [1, 3], [2, 5], [1, 4], [2, 4], [3, 6], [5, 7], [4, 6], [4, 5], [3, 4], [0, 4],
    ],
    []
  );
  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {lineas.map(([a, b], i) => (
          <line
            key={i}
            x1={nodos[a].x} y1={nodos[a].y} x2={nodos[b].x} y2={nodos[b].y}
            stroke={MENTE_ACC} strokeWidth="0.6"
            className="v99-sinapsis"
            style={{ animationDelay: `${i * 180}ms`, opacity: 0.5 }}
          />
        ))}
        {nodos.map((n, i) => (
          <circle
            key={i} cx={n.x} cy={n.y} r="3.2"
            fill={MENTE_ACC}
            className="v99-latido"
            style={{ animationDelay: `${n.d}ms`, transformOrigin: `${n.x}px ${n.y}px` }}
          />
        ))}
      </svg>
      <Brain className="absolute inset-0 m-auto w-7 h-7" style={{ color: MENTE_ACC }} strokeWidth={1.5} />
    </div>
  );
}

export function MentePanel() {
  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);

  const [sala, setSala] = useState<Sala>("pulso");
  const [now, setNow] = useState<number>(() => Date.now());

  // ---- charla ----
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [pensando, setPensando] = useState(false);
  const chatFin = useRef<HTMLDivElement | null>(null);

  // ---- análisis ----
  const [texto, setTexto] = useState("");
  const [exp, setExp] = useState<Record<string, unknown> | null>(null);
  const [cargando, setCargando] = useState(false);

  // reloj global: 1 tick/seg (cuenta atrás + pulso)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // chat persistido
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(LS_CHAT) || "[]") as ChatMsg[];
      if (Array.isArray(raw)) setChat(raw.slice(-24));
    } catch { /* chat fresco */ }
  }, []);

  const bucket = pulsoActual(now);
  const restante = Math.floor(proximoPulsoMs(now) / 1000);
  const restanteTxt = `${String(Math.floor(restante / 60)).padStart(2, "0")}:${String(restante % 60).padStart(2, "0")}`;
  const progreso = 1 - proximoPulsoMs(now) / (5 * 60_000);

  const eventos = useMemo(() => eventosPulso(bucket), [bucket]);
  const pensamiento = useMemo(() => pensamientoMente(bucket), [bucket]);
  const riesgoMedio = useMemo(() => riesgoPulso(bucket), [bucket]);
  const historia = useMemo(
    () => [bucket - 1, bucket - 2, bucket - 3].flatMap((b) => eventosPulso(b).map((e) => ({ ...e, ev: b }))),
    [bucket]
  );

  useEffect(() => {
    chatFin.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chat.length, pensando]);

  async function enviar() {
    const msg = input.trim();
    if (!msg || pensando) return;
    setInput("");
    const siguiente: ChatMsg[] = [...chat, { role: "user", text: msg }];
    setChat(siguiente);
    setPensando(true);
    try {
      // recompensa de primera charla del día
      const m = leerMente();
      const dia = new Date().toISOString().slice(0, 10);
      if (m.chatDia !== dia) {
        addCoins(2, "Abrir la charla con LA MENTE");
        addXp(2);
        toast.success("LA MENTE te escucha: +2ⓒ +2 XP por abrir la charla");
        localStorage.setItem(LS_MENTE, JSON.stringify({ ...m, chatDia: dia, chatHecho: true }));
      }
      const res = await fetch("/api/mente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modo: "dialogo", mensaje: msg, historial: siguiente.slice(-6).map((c) => ({ role: c.role === "user" ? "user" : "assistant", content: c.text })) }),
      });
      const data = await res.json();
      const respuesta: string = data.respuesta || data.error || "…";
      const conIa: ChatMsg[] = [...siguiente, { role: "mente", text: respuesta, ia: data.ia === true }];
      setChat(conIa);
      localStorage.setItem(LS_CHAT, JSON.stringify(conIa.slice(-24)));
    } catch {
      toast.error("LA MENTE no responde — el pulso sigue de todos modos");
    } finally {
      setPensando(false);
    }
  }

  async function analizar() {
    const t = texto.trim();
    if (t.length < 10 || cargando) return;
    setCargando(true);
    setExp(null);
    try {
      const res = await fetch("/api/mente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modo: "expediente", texto: t }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "sin análisis");
      setExp(data);
      useAnalista.getState().registrar("mente"); // v101.0 PILAR 2: PERFIL DE ANALISTA
      // recompensa OPERADOR NEURONAL: análisis distinto, máx 5/día
      const m = leerMente();
      const dia = new Date().toISOString().slice(0, 10);
      const hoy = m.dia === dia ? m.n : 0;
      const clave = `${dia}:${t.length}:${t.slice(0, 40)}`;
      if (hoy < 5 && !m.recompensados.includes(clave)) {
        addCoins(3, "Expediente firmado por LA MENTE");
        addXp(2);
        localStorage.setItem(LS_MENTE, JSON.stringify({
          ...m, dia, n: hoy + 1, recompensados: [...m.recompensados, clave].slice(-40),
        }));
        toast.success(`Expediente firmado: +3ⓒ +2 XP (${Math.min(5, hoy + 1)}/5 hoy)`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "El análisis no pudo firmarse");
    } finally {
      setCargando(false);
    }
  }

  const prob = exp?.probabilidades as Record<string, number> | undefined;
  const pred = exp?.prediccion as {
    horizonte: string;
    escenarios: { nombre: string; probabilidad: number; señal: string }[];
    pasos: string[];
    confianzaRed: number;
  } | undefined;

  return (
    <div className="space-y-3">
      <HeroOro panel="mente" prioritaria />

      <PanelHeader
        title="LA MENTE DE VANGUARD"
        subtitle="El cerebro central · pulso de 5 minutos · se actualiza sola"
        icon={<Brain className="w-4 h-4" />}
        color="cyan"
        right={
          <div className="flex items-center gap-1.5 font-mono text-[9px] px-2 py-1 rounded-full border" style={{ color: MENTE_ACC, borderColor: `${MENTE_ACC}55` }}>
            <span className="w-1.5 h-1.5 rounded-full vg-acc-dot" style={{ background: MENTE_ACC }} />
            PULSO Nº {bucket}
          </div>
        }
      />

      {/* conmutador de salas */}
      <div className="grid grid-cols-3 gap-1.5">
        {([
          { k: "pulso", label: "PULSO", icon: <Timer className="w-3.5 h-3.5" /> },
          { k: "charla", label: "CHARLA", icon: <MessageSquare className="w-3.5 h-3.5" /> },
          { k: "analisis", label: "ANÁLISIS", icon: <ScanSearch className="w-3.5 h-3.5" /> },
        ] as { k: Sala; label: string; icon: React.ReactNode }[]).map((s) => (
          <button
            key={s.k}
            onClick={() => setSala(s.k)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg border py-2 font-mono text-[11px] font-bold tracking-wider transition-all",
              sala === s.k ? "text-black" : "text-muted-foreground border-white/10 bg-black/30 hover:border-white/25"
            )}
            style={sala === s.k ? { background: MENTE_ACC, borderColor: MENTE_ACC } : undefined}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* ---------------- SALA PULSO ---------------- */}
      {sala === "pulso" && (
        <div className="space-y-3">
          {/* contador vivo */}
          <div className="rounded-xl border border-white/10 bg-black/40 p-4 flex items-center gap-4">
            <CerebroVivo />
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Vanguard se actualiza sola</p>
              <p className="font-mono text-2xl font-bold tabular-nums" style={{ color: MENTE_ACC }}>
                {restanteTxt}
              </p>
              <p className="text-[10px] text-muted-foreground font-mono">próximo pulso del mundo · eventos nuevos garantizados</p>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mt-2">
                <div className="h-full rounded-full origin-left" style={{ width: "100%", transform: `scaleX(${progreso})`, background: MENTE_ACC, transition: "transform 1s linear" }} />
              </div>
            </div>
          </div>

          {/* pensamiento del instante */}
          <div className="rounded-xl border p-3.5 relative overflow-hidden" style={{ borderColor: `${MENTE_ACC}44`, background: `${MENTE_ACC}0d` }} key={bucket}>
            <div className="v99-entra">
              <p className="font-mono text-[9px] uppercase tracking-widest mb-1 flex items-center gap-1.5" style={{ color: MENTE_ACC }}>
                <Sparkles className="w-3 h-3" /> ESTOY PENSANDO EN… · {new Date(now).toISOString().slice(11, 16)} UTC
              </p>
              <p className="text-[13px] leading-relaxed text-foreground/90 italic">&ldquo;{pensamiento}&rdquo;</p>
            </div>
          </div>

          {/* riesgo medio del mundo */}
          <div className="rounded-xl border border-white/10 bg-black/40 p-3.5 flex items-center gap-3">
            <Eye className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">riesgo medio del mundo en este pulso</p>
                <p className="font-mono text-sm font-bold" style={{ color: riesgoMedio >= 70 ? "#FF3B30" : riesgoMedio >= 45 ? "#FFA030" : "#4ADE80" }}>{riesgoMedio}/100</p>
              </div>
              <RiesgoBar riesgo={riesgoMedio} />
            </div>
          </div>

          {/* lo que veo ahora */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">lo que veo ahora · {eventos.length} señales en el pulso</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {eventos.map((ev, i) => <EventoCard key={ev.id} ev={ev} i={i} />)}
            </div>
          </div>

          {/* el mundo mientras no mirabas */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">el mundo mientras no mirabas · 3 pulsos atrás</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {historia.map((ev, i) => <EventoCard key={`${ev.id}-${ev.ev}`} ev={ev} i={i % 3} />)}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- SALA CHARLA ---------------- */}
      {sala === "charla" && (
        <div className="rounded-xl border border-white/10 bg-black/40 flex flex-col" style={{ minHeight: 420 }}>
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[52vh]">
            {chat.length === 0 && (
              <div className="text-center py-8 space-y-2">
                <CerebroVivo />
                <p className="text-[13px] text-foreground/80 italic">Háblame. Pregúntame por un lugar, un frente, una decisión — o por lo que acabo de ver.</p>
                <p className="text-[10px] text-muted-foreground font-mono">LA MENTE contesta en su voz · si el núcleo cae, la red local responde igual</p>
              </div>
            )}
            {chat.map((c, i) => (
              <div key={i} className={cn("v99-msg flex", c.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-xl px-3 py-2 text-[12.5px] leading-relaxed border",
                    c.role === "user" ? "bg-amber/10 border-amber/30 text-foreground" : "bg-black/60 text-foreground/90"
                  )}
                  style={c.role === "mente" ? { borderColor: `${MENTE_ACC}44` } : undefined}
                >
                  {c.role === "mente" && (
                    <p className="font-mono text-[8.5px] uppercase tracking-widest mb-1 flex items-center gap-1" style={{ color: MENTE_ACC }}>
                      <Brain className="w-2.5 h-2.5" /> LA MENTE {c.ia === false && <span className="text-muted-foreground">· red local</span>}
                    </p>
                  )}
                  {c.text}
                </div>
              </div>
            ))}
            {pensando && (
              <div className="flex justify-start">
                <div className="rounded-xl px-3 py-2 border bg-black/60 flex items-center gap-2" style={{ borderColor: `${MENTE_ACC}44` }}>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: MENTE_ACC }} />
                  <span className="text-[11px] text-muted-foreground font-mono">LA MENTE está siguiendo el patrón…</span>
                </div>
              </div>
            )}
            <div ref={chatFin} />
          </div>
          <div className="p-2.5 border-t border-white/10 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") enviar(); }}
              placeholder="Escríbele a LA MENTE…"
              className="flex-1 bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-amber/50"
            />
            <button
              onClick={enviar}
              disabled={pensando || !input.trim()}
              className="rounded-lg px-3.5 font-bold text-black transition-transform active:scale-95 disabled:opacity-40"
              style={{ background: MENTE_ACC }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ---------------- SALA ANÁLISIS ---------------- */}
      {sala === "analisis" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-white/10 bg-black/40 p-3.5 space-y-2.5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">pégale un titular, un cable o un rumor — LA MENTE firma el expediente</p>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={3}
              placeholder="Ej.: convoy sin rotación cruza el estrecho de Ormuz mientras tres salas OSINT discrepan sobre el cargamento…"
              className="w-full bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-amber/50 resize-none"
            />
            <button
              onClick={analizar}
              disabled={cargando || texto.trim().length < 10}
              className="w-full rounded-lg py-2.5 font-mono text-[12px] font-bold tracking-widest text-black transition-transform active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2"
              style={{ background: MENTE_ACC }}
            >
              {cargando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {cargando ? "LAS 8 NEURONAS ESTÁN LEYENDO…" : "FIRMAR EXPEDIENTE NEURONAL"}
            </button>
          </div>

          {exp && (
            <div className="v99-entra rounded-xl border border-white/10 bg-black/40 p-4 space-y-3.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[9px] px-2 py-0.5 rounded-full border" style={{ color: MENTE_ACC, borderColor: `${MENTE_ACC}55` }}>
                  {exp.ia === true ? "FIRMADO POR EL NÚCLEO IA" : "RED NEURONAL LOCAL"}
                </span>
                <span className="font-mono text-[9px] px-2 py-0.5 rounded-full border border-white/20 text-muted-foreground">{String(exp.sentimiento)}</span>
                <span className="ml-auto font-mono text-[9px] text-muted-foreground">confianza {String(exp.confianza)}/100</span>
              </div>

              <p className="text-[13px] leading-relaxed text-foreground/90">{String(exp.resumen)}</p>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">riesgo del episodio</p>
                  <p className="font-mono text-xs font-bold text-red-hud">{String(exp.riesgo)}/100</p>
                </div>
                <RiesgoBar riesgo={Number(exp.riesgo)} />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-1.5">actores</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(exp.actores as string[]).map((a, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/15 text-[10.5px]">{a}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-1.5">conexiones temáticas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(exp.conexiones as string[]).map((a, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full border text-[10.5px]" style={{ color: MENTE_ACC, borderColor: `${MENTE_ACC}44`, background: `${MENTE_ACC}0f` }}>{a}</span>
                    ))}
                  </div>
                </div>
              </div>

              {prob && (
                <div className="space-y-1.5">
                  <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">probabilidades de sentimiento</p>
                  {([["escalada", "#FF3B30"], ["tension", "#FFA030"], ["estable", "#4ADE80"], ["detente", "#7FE3FF"]] as [string, string][]).map(([k, c]) => (
                    <div key={k} className="flex items-center gap-2">
                      <span className="font-mono text-[9px] w-20 text-muted-foreground uppercase">{k}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full origin-left transition-transform duration-700" style={{ width: "100%", transform: `scaleX(${(Number(prob[k]) || 0) / 100})`, background: c }} />
                      </div>
                      <span className="font-mono text-[9px] w-8 text-right text-muted-foreground">{prob[k]}%</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-lg border border-white/10 p-2.5 space-y-1.5">
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">clave estratégica</p>
                <p className="text-[12.5px] text-foreground/90">{String(exp.clave)}</p>
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground pt-1">recomendación al operador</p>
                <p className="text-[12.5px]" style={{ color: MENTE_ACC }}>{String(exp.recomendacion)}</p>
              </div>

              {pred && (
                <div className="rounded-lg border p-3 space-y-2.5" style={{ borderColor: `${MENTE_ACC}44`, background: `${MENTE_ACC}08` }}>
                  <p className="font-mono text-[10px] uppercase tracking-widest flex items-center gap-1.5" style={{ color: MENTE_ACC }}>
                    <RefreshCw className="w-3 h-3" /> PROYECCIÓN DE LA MENTE · horizonte {pred.horizonte}
                  </p>
                  <div className="space-y-1.5">
                    {pred.escenarios.map((e, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="font-mono text-[9.5px] w-[148px] shrink-0 truncate" style={{ color: i === 0 ? MENTE_ACC : undefined }}>{e.nombre}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full origin-left transition-transform duration-700" style={{ width: "100%", transform: `scaleX(${e.probabilidad / 100})`, background: i === 0 ? MENTE_ACC : "#ffffff55" }} />
                        </div>
                        <span className="font-mono text-[9px] w-9 text-right text-muted-foreground">{e.probabilidad}%</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10.5px] text-muted-foreground">señal principal: {pred.escenarios[0]?.señal}</p>
                  <details className="group">
                    <summary className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-foreground">razonamiento de la red (explicable)</summary>
                    <ol className="mt-1.5 space-y-1 list-decimal list-inside">
                      {pred.pasos.map((p, i) => (
                        <li key={i} className="text-[11px] text-muted-foreground font-mono">{p}</li>
                      ))}
                    </ol>
                  </details>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

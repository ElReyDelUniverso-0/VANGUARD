"use client";

// v67.0 EL HANGAR — ESTACIONES INTERACTIVAS DEL HUB 3D (modales).
// 1) TAROT GEOPOLÍTICO: cada lunes, 3 cartas que "predicen" la semana a partir
//    de patrones históricos (entretenimiento, rotación determinista por semana).
// 2) DETECTOR DE PROPAGANDA: pega un texto y la agencia señala técnicas de
//    manipulación (lenguaje emocional, absolutos, fuentes no verificadas,
//    deshumanización, urgencia artificial) con heurística local.
// 3) DIARIO DEL AGENTE / YEAR IN REVIEW: la película del año del agente con
//    sus estadísticas reales + imagen compartible "Analizado por {alias} en VANGUARD".

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Sparkles, ShieldAlert, BookOpen, Wand2, Download, Share2 } from "lucide-react";
import { useGameStore } from "@/lib/game-store";
import { getRankForLevel } from "@/lib/game-data";

// ================= TAROT GEOPOLÍTICO =================

interface TarotCard { name: string; past: string; warns: string; icon: string; }

const TAROT_DECK: TarotCard[] = [
  { name: "EL TANQUE INVERTIDO", past: "Una ofensiva que avanza más rápido de lo que su logística soporta", warns: "Las victorias rápidas de esta semana esconden líneas de suministro frágiles", icon: "🛡️" },
  { name: "LA PALOMA ROTA", past: "Una tregua firmada por quienes ya planean romperla", warns: "El alto el fuego de la semana durará exactamente lo que tarde en reposicionarse el bando débil", icon: "🕊️" },
  { name: "EL OJO DEL SATÉLITE", past: "Lo que se construye de noche en zonas prohibidas", warns: "Tres imágenes nuevas de instalaciones desconocidas circularán en 72h", icon: "🛰️" },
  { name: "EL MERCADO EN LLAMAS", past: "El precio del crudo miente sobre la salud del mundo", warns: "Un movimiento de bolsa de un solo dígito porcentual dirá más que cien discursos", icon: "📈" },
  { name: "LA CARTA CIFRADA", past: "Una comunicación diplomática filtrada a propósito", warns: "El 'filtrado accidental' de esta semana es una estrategia de presión deliberada", icon: "✉️" },
  { name: "EL PUENTE SANCIONADO", past: "Cadenas de suministro que se reescriben en silencio", warns: "Un país puente cambiará de bando comercial y cobrará en efectivo", icon: "🌉" },
  { name: "EL DESPERTAR DEL SUR", past: "Poblaciones que dejan de pedir y empiezan a exigir", warns: "Una capital del hemisferio sur será titular mundial por razones que nadie predijo", icon: "🔥" },
  { name: "EL GENERAL VIEJO", past: "Poder acumulado en despachos sin testigos", warns: "Una sucesión interna moverá tropas sin disparar un tiro", icon: "🎖️" },
  { name: "EL RÍO DE GENTE", past: "Migraciones que los mapas no dibujan pero los hospitales sí", warns: "Una ruta migratoria se cerrará y otra se abrirá en la misma semana", icon: "🌊" },
];

function weekKey(): string {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 1);
  const week = Math.floor((d.getTime() - start.getTime()) / (7 * 86400000));
  return `${d.getFullYear()}-W${week}`;
}

function cardsForWeek(key: string): TarotCard[] {
  let h = 0;
  for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const picks: TarotCard[] = [];
  const used = new Set<number>();
  let cursor = h;
  while (picks.length < 3) {
    cursor = (cursor * 1103515245 + 12345) >>> 0;
    const idx = cursor % TAROT_DECK.length;
    if (!used.has(idx)) {
      used.add(idx);
      picks.push(TAROT_DECK[idx]);
    }
  }
  return picks;
}

export function TarotModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [flipped, setFlipped] = useState<boolean[]>([false, false, false]);
  const cards = useMemo(() => cardsForWeek(weekKey()), []);
  const week = useMemo(() => weekKey(), []);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl bg-card">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wide flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet" /> TAROT GEOPOLÍTICO · {week}
          </DialogTitle>
          <DialogDescription>
            Tres cartas por semana, tiradas con patrones históricos. Es entretenimiento ritual de la agencia — el futuro real se decide en la Sala de Predicciones.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-2">
          {cards.map((c, i) => (
            <motion.button
              key={c.name}
              onClick={() => setFlipped((f) => f.map((v, j) => (j === i ? true : v)))}
              whileTap={{ scale: 0.96 }}
              className="relative aspect-[2/3] vg-transition"
              style={{ perspective: 800 }}
              aria-label={`Carta ${i + 1} del tarot geopolítico`}
            >
              <motion.div
                className="absolute inset-0"
                animate={{ rotateY: flipped[i] ? 180 : 0 }}
                transition={{ duration: 0.55 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* reverso */}
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-md"
                  style={{
                    backfaceVisibility: "hidden",
                    background: "linear-gradient(150deg,#12122a,#1e1e44)",
                    border: "1px solid rgba(120,90,220,0.5)",
                    boxShadow: "0 0 18px rgba(120,90,220,0.25)",
                  }}
                >
                  <div className="font-display text-2xl text-violet/80">◈</div>
                </div>
                {/* cara */}
                <div
                  className="absolute inset-0 p-2 rounded-md flex flex-col text-left"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    background: "linear-gradient(160deg,#181428,#0f0f1c)",
                    border: "1px solid rgba(168,85,247,0.6)",
                  }}
                >
                  <div className="text-xl">{c.icon}</div>
                  <div className="font-display text-[10px] leading-tight mt-1 text-foreground">{c.name}</div>
                  <div className="text-[8px] text-muted-foreground leading-snug mt-1 overflow-hidden">{flipped[i] ? c.past : ""}</div>
                  <div className="text-[8px] text-violet leading-snug mt-auto overflow-hidden">{flipped[i] ? `AVISO: ${c.warns}` : ""}</div>
                </div>
              </motion.div>
            </motion.button>
          ))}
        </div>
        <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest text-center">
          {flipped.every(Boolean) ? "Las cartas hablan. La historia decide." : "Toca cada carta para revelarla"}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ================= DETECTOR DE PROPAGANDA =================

interface Technique { name: string; hint: string; re: RegExp; }

const TECHNIQUES: Technique[] = [
  { name: "LENGUAJE EMOCIONAL EXTREMO", hint: "palabras diseñadas para provocar miedo/odio antes que informar", re: /\b(horr(?:or|oso|osa)|masacr[ae]|barbarie|brutal(?:idad|es|mente)?|devastador|atrocidad|infame|sanguinario|sádico|carnicería|infierno|homo.?sidal)\b/gi },
  { name: "GENERALIZACIÓN DEHUMANIZANTE", hint: "reduce a un pueblo entero a 'el enemigo'", re: /\b(los|las|todos|todas)\s+(rusos|russianos|ucranianos|chinos|norteamericanos|estadounidenses|iraníes|israelíes|palestinos|árabes|musulmanes|migrantes|inmigrantes)\b(?![^.]*\balgunos?|\balguna?s?)/gi },
  { name: "ABSOLUTOS SIN MATIZ", hint: "los hechos reales casi nunca son 'siempre' ni 'nunca'", re: /\b(siempre|nunca|jamás|todos|nadie|absolutamente|inevitablemente|totalmente)\b/gi },
  { name: "FUENTE NO VERIFICADA", hint: "afirma sin decir quién lo afirma", re: /\b(según fuentes|se sabe que|todo indica|se especula|ruidos corren|fuentes cercanas|expertos aseguran|se rumorea)\b/gi },
  { name: "URGENCIA ARTIFICIAL", hint: "presión de tiempo para que no verifiques", re: /\b(última hora|urgente|ahora mismo|antes de que|corre la voz|comparte antes de que lo borren|no lo van a contar)\b/gi },
  { name: "CONSPIRACIA SIN EVIDENCIA", hint: "implica ocultamiento sin prueba", re: /\b(lo ocultan|no quieren que sepas|verdad oculta|controlan(?:n)? los medios|mentira oficial|operación de bandera falsa|false flag)\b/gi },
  { name: "SEDICIÓN PATRÓTICA", hint: "disuelve la crítica acusando traición", re: /\b(traidor(?:es|a)?|anti.?patria|vendepatria|quien no apoya|enemigo interno)\b/gi },
];

export function PropagandaModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [text, setText] = useState("");
  const [analized, setAnalized] = useState(false);
  const addXp = useGameStore((s) => s.addXp);

  const matches = useMemo(() => {
    if (!text.trim()) return [];
    return TECHNIQUES.map((t) => {
      const found = [...text.matchAll(t.re)].map((m) => m[0]);
      return { ...t, found, count: found.length };
    }).filter((t) => t.count > 0);
  }, [text]);

  const totalHits = matches.reduce((s, m) => s + m.count, 0);
  const risk = text.trim().length < 30 ? null : Math.min(100, totalHits * 14);
  const riskLabel = risk === null ? "" : risk >= 60 ? "PROPAGANDA PROBABLE 🔴" : risk >= 30 ? "SESGO NOTABLE 🟡" : "TONO INFORMATIVO 🟢";

  const analyze = () => {
    if (text.trim().length < 30) {
      toast.error("Texto demasiado corto", { description: "Pega al menos un párrafo (30+ caracteres) para que la agencia pueda examinarlo." });
      return;
    }
    setAnalized(true);
    addXp(10);
    toast.success("Análisis retórico completado · +10 XP", { description: "Las técnicas marcadas son heurísticas, no sentencia judicial." });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl bg-card">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wide flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-crisis" /> DETECTOR DE PROPAGANDA
          </DialogTitle>
          <DialogDescription>
            Pega una noticia, un tuit o un mensaje de cadena. La agencia marca técnicas de manipulación en el texto: tú pones el veredicto final.
          </DialogDescription>
        </DialogHeader>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setAnalized(false);
          }}
          placeholder="Pega aquí el texto sospechoso…"
          className="w-full h-32 p-3 text-sm bg-secondary/40 border border-border vg-transition focus:border-electric-hud outline-none resize-none font-mono"
        />
        <div className="flex items-center gap-2">
          <Button onClick={analyze} className="flex-1 font-mono text-[11px] uppercase tracking-widest">
            <Wand2 className="w-3.5 h-3.5 mr-1" /> Analizar texto
          </Button>
          {risk !== null && analized && (
            <div className="font-tech text-sm font-bold px-3" style={{ color: risk >= 60 ? "#FF3B30" : risk >= 30 ? "#FFD60A" : "#00FF87" }}>
              {riskLabel} · {risk}/100
            </div>
          )}
        </div>
        {analized && matches.length > 0 && (
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {matches.map((m) => (
              <div key={m.name} className="border border-crisis/30 p-2">
                <div className="font-mono text-[10px] font-bold text-crisis tracking-widest">{m.name} ×{m.count}</div>
                <div className="text-[10px] text-muted-foreground italic">{m.hint}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {m.found.slice(0, 6).map((f, i) => (
                    <span key={i} className="px-1 bg-crisis-hud/40 border border-crisis/40 text-[9px] font-mono">"{f}"</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {analized && matches.length === 0 && (
          <div className="border border-neon-hud/40 p-3 text-center text-[11px] font-mono text-neon">
            Sin banderas rojas retóricas detectadas. Sigue verificando la fuente de todos modos — la manipulación más eficaz no usa palabras agresivas.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ================= DIARIO DEL AGENTE (YEAR IN REVIEW) =================

export function DiarioModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { alias, level, streak, coins, gems, betStats, quizAnswered, log, rank } = useGameStore();
  const accuracy = betStats.placed > 0 ? Math.round((betStats.won / betStats.placed) * 100) : 0;
  const missionsDone = quizAnswered.length;
  const rankName = rank || getRankForLevel(level).name;
  const joinDate = useMemo(() => {
    try {
      const stored = localStorage.getItem("vanguard-agent-since");
      if (stored) return stored;
      const d = new Date().toISOString().slice(0, 10);
      localStorage.setItem("vanguard-agent-since", d);
      return d;
    } catch {
      return new Date().toISOString().slice(0, 10);
    }
  }, []);
  const highlights = log.slice(0, 4);

  const shareDiario = async () => {
    try {
      const { toPng } = await import("html-to-image");
      const el = document.getElementById("diario-share-card");
      if (!el) return;
      const url = await toPng(el, { pixelRatio: 3, backgroundColor: "#0A0A0F" });
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], "vanguard-diario.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Mi año en VANGUARD" });
        toast.success("Diario compartido — la imagen viaja sin enlaces");
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = "vanguard-diario.png";
        a.click();
        toast.success("PNG del diario descargada");
      }
    } catch {
      toast.error("No se pudo generar la imagen del diario");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg bg-card">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wide flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber" /> DIARIO DEL AGENTE
          </DialogTitle>
          <DialogDescription>La película de tu tiempo en VANGUARD, escrita por tus propias operaciones.</DialogDescription>
        </DialogHeader>

        <div id="diario-share-card" className="p-4 border border-amber-hud/40" style={{ background: "linear-gradient(160deg,#0d1526,#0A0A0F)" }}>
          <div className="font-mono text-[9px] tracking-[0.35em] text-electric uppercase mb-1">Expediente personal · desde {joinDate}</div>
          <div className="font-display text-2xl font-black text-gradient tracking-widest">{alias || "AGENTE SIN NOMBRE"}</div>
          <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
            NIVEL {level} · {rankName} · racha {streak} 🔥
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 font-mono text-center">
            <div className="border border-border p-2"><div className="font-tech text-lg text-amber tabular-nums">{coins}</div><div className="text-[8px] uppercase tracking-widest text-muted-foreground">monedas</div></div>
            <div className="border border-border p-2"><div className="font-tech text-lg text-violet tabular-nums">{gems}</div><div className="text-[8px] uppercase tracking-widest text-muted-foreground">gemas</div></div>
            <div className="border border-border p-2"><div className="font-tech text-lg text-neon tabular-nums">{accuracy}%</div><div className="text-[8px] uppercase tracking-widest text-muted-foreground">acierto</div></div>
            <div className="border border-border p-2"><div className="font-tech text-lg text-electric tabular-nums">{missionsDone}</div><div className="text-[8px] uppercase tracking-widest text-muted-foreground">operaciones</div></div>
          </div>
          {highlights.length > 0 && (
            <div className="mt-3 space-y-1">
              <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Momentos recientes</div>
              {highlights.map((h) => (
                <div key={h.ts} className="text-[10px] font-mono text-soft/80 truncate">▸ {h.msg}</div>
              ))}
            </div>
          )}
          <div className="mt-3 text-center font-mono text-[8px] tracking-[0.3em] text-electric/80 uppercase">Analizado por {alias || "un agente"} en VANGUARD</div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={shareDiario} className="flex-1 font-mono text-[10px] uppercase tracking-widest">
            <Share2 className="w-3.5 h-3.5 mr-1" /> Compartir diario
          </Button>
          <Button variant="outline" onClick={shareDiario} className="font-mono text-[10px] uppercase tracking-widest">
            <Download className="w-3.5 h-3.5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

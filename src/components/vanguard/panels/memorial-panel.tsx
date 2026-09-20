"use client";

// ============================================================
// VANGUARD v24 — MEMORIAL †
// Homenaje a periodistas, comunicadores y verificadores caídos
// documentando las guerras actuales. Fotos de archivo de prensa
// con atribución. Emblema de despedida militar por cada guerra.
// ============================================================
import { useMemo, useState } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { FlagBadge } from "@/components/vanguard/flag-badge";
import { MEMORIAL_FALLEN, MEMORIAL_WARS, type FallenJournalist } from "@/lib/dark-data";
import { useGameStore } from "@/lib/game-store";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, ExternalLink, ShieldCheck, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";

const LS_CANDLES = "vanguard_memorial_candles_v1";

// ---- Emblema de despedida militar: cruz de campo (rifle + casco + placas) ----
export function MemorialEmblem({ label, flag, size = 96 }: { label: string; flag: string; size?: number }) {
  return (
    <div className="flex flex-col items-center gap-1.5 select-none">
      <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`Emblema memorial ${label}`}>
        <circle cx="50" cy="50" r="47" fill="#0a0a0a" stroke="#b8860b" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="#b8860b" strokeWidth="0.5" opacity="0.5" />
        {/* laurel izquierdo */}
        <path d="M26 78 Q18 60 24 42 Q27 50 28 58 M26 78 Q34 66 32 54" stroke="#3f6b3f" strokeWidth="1.4" fill="none" />
        {/* laurel derecho */}
        <path d="M74 78 Q82 60 76 42 Q73 50 72 58 M74 78 Q66 66 68 54" stroke="#3f6b3f" strokeWidth="1.4" fill="none" />
        {/* rifle invertido (bayoneta al suelo) */}
        <rect x="47.2" y="26" width="5.6" height="46" rx="2" fill="#6b5b3e" />
        <rect x="45" y="20" width="10" height="8" rx="2" fill="#4a4030" />
        <path d="M50 72 L50 80" stroke="#8a8a8a" strokeWidth="2" />
        {/* casco sobre el rifle */}
        <path d="M38 26 Q50 14 62 26 Q50 32 38 26 Z" fill="#4a4a3a" stroke="#2a2a20" strokeWidth="1" />
        {/* placas de identificación */}
        <rect x="57" y="30" width="7" height="4.4" rx="1.4" fill="#c0c0c0" transform="rotate(12 60 32)" />
        <rect x="59" y="34" width="7" height="4.4" rx="1.4" fill="#a8a8a8" transform="rotate(16 62 36)" />
        {/* estrella superior */}
        <path d="M50 8 L52 12.5 L57 12.5 L53 15.5 L54.5 20 L50 17.2 L45.5 20 L47 15.5 L43 12.5 L48 12.5 Z" fill="#b8860b" />
        {/* † */}
        <text x="50" y="66" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#b8860b" fontFamily="monospace">†</text>
      </svg>
      <div className="flex items-center gap-1.5">
        <FlagBadge code={flag} size="sm" />
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-amber">{label}</span>
      </div>
    </div>
  );
}

function CandleBtn({ lit, onClick, disabled }: { lit: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={lit ? "Vela encendida" : "Encender vela"}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 border font-mono text-[9px] uppercase transition-colors",
        lit
          ? "border-amber-hud text-amber bg-amber-hud/20"
          : "border-border text-muted-foreground hover:border-amber-hud/60 hover:text-amber",
        disabled && "opacity-60 cursor-not-allowed"
      )}
    >
      <span className="relative w-2 h-4 flex items-end justify-center">
        <AnimatePresence>
          {lit && (
            <motion.span
              key="flame"
              initial={{ scale: 0, y: 2 }}
              animate={{ scale: 1, y: 0 }}
              className="absolute -top-1.5 w-1.5 h-2.5 rounded-full"
              style={{ background: "radial-gradient(ellipse at bottom, #fde68a 0%, #f59e0b 55%, transparent 80%)", filter: "blur(0.4px)" }}
            />
          )}
        </AnimatePresence>
        <span className={cn("w-1.5 h-3 rounded-sm", lit ? "bg-amber/80" : "bg-muted-foreground/40")} />
      </span>
      {lit ? "Vela encendida" : "Encender vela"}
    </button>
  );
}

export function MemorialPanel() {
  const alias = useGameStore((s) => s.alias);
  const addXp = useGameStore((s) => s.addXp);
  const addCoins = useGameStore((s) => s.addCoins);
  const [war, setWar] = useState<"UCRANIA" | "GAZA" | "OTROS">("UCRANIA");
  const [selected, setSelected] = useState<FallenJournalist | null>(null);

  // init lazy de velas persistidas (panel client-only, doble lectura simple)
  const readCandles = (): { lit: Record<string, boolean>; total: number } => {
    try {
      const raw = localStorage.getItem(LS_CANDLES);
      if (raw) {
        const d = JSON.parse(raw) as { lit: Record<string, boolean>; total: number };
        return { lit: d.lit ?? {}, total: d.total ?? 0 };
      }
    } catch { /* primera vez */ }
    return { lit: {}, total: 0 };
  };
  const [lit, setLit] = useState<Record<string, boolean>>(() => readCandles().lit);
  const [totalCandles, setTotalCandles] = useState(() => readCandles().total);

  const persist = (nextLit: Record<string, boolean>, nextTotal: number) => {
    setLit(nextLit);
    setTotalCandles(nextTotal);
    try { localStorage.setItem(LS_CANDLES, JSON.stringify({ lit: nextLit, total: nextTotal })); } catch { /* noop */ }
  };

  const lightCandle = (id: string) => {
    if (lit[id]) return;
    persist({ ...lit, [id]: true }, totalCandles + 1);
    addXp(2);
    toast.success("🕯️ Vela encendida en su honor · +2 XP");
  };

  const fallen = useMemo(() => MEMORIAL_FALLEN.filter((f) => f.war === war), [war]);
  const warMeta = MEMORIAL_WARS[war];
  const litCount = fallen.filter((f) => lit[f.id]).length;

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Memorial † · Los que documentaron y cayeron"
        subtitle={`${MEMORIAL_FALLEN.length} homenajes · ${totalCandles} velas encendidas por la comunidad`}
        icon={<Flame className="w-4 h-4 text-violet-hud" />}
        color="violet"
      />

      {/* Aviso de respeto */}
      <div className="hud-corner p-3 border-violet-hud/40 bg-violet-hud/5">
        <div className="flex items-start gap-2">
          <ScrollText className="w-4 h-4 text-violet-hud mt-0.5 flex-shrink-0" />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Este memorial honra a periodistas, camarógrafos, fixers y documentalistas que murieron informando sobre
            las guerras actuales. Sus historias están verificadas por el Comité para la Protección de Periodistas
            (CPJ), Reporteros Sin Fronteras (RSF) y la IPI. Las fotos provienen de archivo de prensa con atribución
            a su fuente. Encender una vela registra tu homenaje público.
          </p>
        </div>
      </div>

      {/* Emblema central + guerra seleccionada */}
      <div className="hud-corner p-4 flex flex-col sm:flex-row items-center gap-4">
        <MemorialEmblem label={warMeta.label} flag={warMeta.flag} size={104} />
        <div className="flex-1 text-center sm:text-left">
          <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-foreground">{warMeta.label}</h3>
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{warMeta.tagline}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap justify-center sm:justify-start">
            {(Object.keys(MEMORIAL_WARS) as (keyof typeof MEMORIAL_WARS)[]).map((w) => (
              <button
                key={w}
                onClick={() => setWar(w as typeof war)}
                className={cn(
                  "px-2 py-1 border text-[9px] font-mono uppercase tracking-wider transition-colors",
                  war === w ? "border-violet-hud text-violet-hud bg-violet-hud/20" : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {MEMORIAL_WARS[w].label}
              </button>
            ))}
            <span className="text-[9px] font-mono text-muted-foreground/70 ml-1">
              🕯️ {litCount}/{fallen.length} velas encendidas por ti
            </span>
          </div>
        </div>
      </div>

      {/* Tarjetas de homenaje */}
      <div className="grid gap-3 sm:grid-cols-2">
        {fallen.map((f, i) => (
          <motion.article
            key={f.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="hud-corner overflow-hidden border-violet-hud/30 hover:border-violet-hud/60 transition-colors"
          >
            <div className="flex gap-3 p-3">
              {/* Foto real de archivo o emblema */}
              <div className="relative w-20 h-24 flex-shrink-0 overflow-hidden border border-border bg-secondary/40">
                {f.photo ? (
                  <img
                    src={f.photo}
                    alt={`Foto de ${f.name}`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    style={{ filter: "grayscale(1) contrast(1.05)" }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-gradient-to-b from-violet-hud/10 to-transparent">
                    <MemorialEmblem label="" flag={f.country} size={56} />
                  </div>
                )}
                {/* signo de muerte † */}
                <div className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center bg-black/80 border border-amber-hud/70">
                  <span className="text-amber font-bold text-sm leading-none">†</span>
                </div>
                {f.photo && f.photoSource && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5">
                    <span className="text-[7px] font-mono text-muted-foreground uppercase">foto: {f.photoSource}</span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  <FlagBadge code={f.country} size="sm" />
                  <span className="text-[9px] font-mono px-1 py-0.5 border border-violet-hud/50 text-violet-hud uppercase">† {f.deathDate}</span>
                  <span className="text-[9px] font-mono text-muted-foreground">{f.age}</span>
                </div>
                <h3 className="text-sm font-bold text-foreground leading-tight">{f.name}</h3>
                <p className="text-[10px] font-mono text-cyan-hud uppercase mt-0.5">{f.outlet}</p>
                <p className="text-[10px] text-muted-foreground mt-1 leading-snug line-clamp-2">{f.note}</p>
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <CandleBtn lit={!!lit[f.id]} onClick={() => lightCandle(f.id)} />
                  <button
                    onClick={() => setSelected(f)}
                    className="px-2 py-1 border border-border text-[9px] font-mono uppercase text-muted-foreground hover:text-foreground hover:border-violet-hud/60 transition-colors"
                  >
                    Ver historia
                  </button>
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      {/* Documentación global */}
      <div className="hud-corner p-3 flex flex-wrap items-center gap-2 text-[10px] font-mono text-muted-foreground">
        <ShieldCheck className="w-3.5 h-3.5 text-green-hud" />
        <span>Verificado por: CPJ · RSF · IPI · Free Press Unlimited</span>
        <a
          href="https://cpj.org/es/killed/"
          target="_blank"
          rel="noreferrer"
          className="ml-auto flex items-center gap-1 text-cyan-hud hover:underline uppercase"
        >
          <ExternalLink className="w-3 h-3" /> base de datos cpj
        </a>
      </div>

      {/* Modal historia completa */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="hud-panel border-violet-hud max-w-lg w-full max-h-[85vh] overflow-y-auto thin-scroll p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="relative w-24 h-28 flex-shrink-0 overflow-hidden border border-violet-hud/40 bg-secondary/40">
                {selected.photo ? (
                  <img src={selected.photo} alt={`Foto de ${selected.name}`} className="w-full h-full object-cover" style={{ filter: "grayscale(1)" }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-violet-hud/10 to-transparent">
                    <MemorialEmblem label="" flag={selected.country} size={64} />
                  </div>
                )}
                <div className="absolute top-1 right-1 w-7 h-7 flex items-center justify-center bg-black/80 border border-amber-hud/70">
                  <span className="text-amber font-bold text-lg leading-none">†</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-mono text-base font-bold text-foreground">{selected.name}</h3>
                <p className="text-[10px] font-mono text-cyan-hud uppercase">{selected.outlet}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  † {selected.deathDate} · {selected.place} · {selected.age}
                </p>
                <p className="text-[9px] font-mono text-violet-hud uppercase mt-1">documentado por {selected.documentedBy}</p>
              </div>
            </div>
            <p className="text-xs text-foreground/90 leading-relaxed mt-3">{selected.note}</p>
            <p className="text-[10px] text-muted-foreground italic mt-3 border-l-2 border-amber-hud/50 pl-2">
              &ldquo;El periodismo es la primera historia borrador de la humanidad. Ellos pagaron con su vida por
              escribirla.&rdquo; — Comunidad VANGUARD
            </p>
            <div className="flex items-center gap-2 mt-4">
              <CandleBtn lit={!!lit[selected.id]} onClick={() => lightCandle(selected.id)} />
              <button
                onClick={() => setSelected(null)}
                className="ml-auto px-3 py-1.5 border border-violet-hud/50 text-violet-hud font-mono text-[10px] uppercase hover:bg-violet-hud/20 transition-colors"
              >
                Cerrar
              </button>
            </div>
            {alias && <p className="text-[9px] font-mono text-muted-foreground mt-2 uppercase">operador: {alias}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

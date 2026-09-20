"use client";

// ============================================================
// VANGUARD v24 — SALA ROJA (18+)
// Contenido fuerte documentado con DOBLE advertencia: age gate
// persistente + confirmación por cinta. Todo apunta a fuentes
// verificadas; VANGUARD no aloja gore sin contexto.
// ============================================================
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { FlagBadge } from "@/components/vanguard/flag-badge";
import { SALA_ROJA_ITEMS, SALA_CATEGORIES, type SalaRojaItem } from "@/lib/dark-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { AlertTriangle, ShieldCheck, Eye, EyeOff, X, ExternalLink, Lock, HeartHandshake } from "lucide-react";
import { isStrict18, subscribeStrict18 } from "@/lib/safety";

const LS_SALA18 = "vanguard_sala18_ok";

const WARNING_COLOR: Record<SalaRojaItem["warning"], string> = {
  "GRAVEDAD EXTREMA": "border-red-hud text-red-hud bg-red-hud/20",
  "GRAVEDAD ALTA": "border-amber-hud text-amber bg-amber-hud/20",
  "GRAVEDAD MEDIA": "border-border text-muted-foreground",
};

export function SalaRojaPanel() {
  // age gate persistente — init lazy (panel client-only), muta solo en handlers
  const [gate, setGate] = useState<"checking" | "locked" | "open">(() => {
    try {
      return localStorage.getItem(LS_SALA18) === "yes" ? "open" : "locked";
    } catch {
      return "locked";
    }
  });
  const [cat, setCat] = useState<string>("TODAS");
  const [confirmItem, setConfirmItem] = useState<SalaRojaItem | null>(null);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const acceptGate = () => {
    try { localStorage.setItem(LS_SALA18, "yes"); } catch { /* noop */ }
    setGate("open");
    toast.warning("Acceso 18+ activado. Cada cinta seguirá pidiendo confirmación.");
  };

  const revokeGate = () => {
    try { localStorage.removeItem(LS_SALA18); } catch { /* noop */ }
    setGate("locked");
    setRevealed({});
  };

  const items = useMemo(() => (cat === "TODAS" ? SALA_ROJA_ITEMS : SALA_ROJA_ITEMS.filter((i) => i.category === cat)), [cat]);

  // v26 MODO ESTRICTO 18+: si está activo, la sala entera queda oculta —
  // ni siquiera con censura (el usuario pidió "ahorrarse todo ese tiempo")
  const strict = useSyncExternalStore(
    (cb) => subscribeStrict18(cb),
    () => isStrict18(),
    () => false
  );

  if (strict) {
    return (
      <div className="space-y-3">
        <PanelHeader title="Sala Roja · Contenido documental fuerte (18+)" icon={<Lock className="w-4 h-4 text-red-hud" />} color="red" />
        <div className="hud-corner border-red-hud p-8 max-w-lg mx-auto text-center space-y-3">
          <EyeOff className="w-10 h-10 mx-auto text-red-hud" />
          <h3 className="font-mono text-base font-bold uppercase text-red-hud tracking-widest">contenido oculto</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Tu <strong className="text-foreground">MODO ESTRICTO 18+</strong> está activado: nada de esta sala se muestra,
            ni siquiera censurado. Puedes desactivarlo en Ajustes → Modo estricto 18+ si quieres volver a verlo con advertencias.
          </p>
        </div>
      </div>
    );
  }

  // ---------- AGE GATE ----------
  if (gate !== "open") {
    return (
      <div className="space-y-3">
        <PanelHeader title="Sala Roja · Contenido documental fuerte (18+)" icon={<Lock className="w-4 h-4 text-red-hud" />} color="red" />
        <div className="hud-corner border-red-hud p-6 max-w-lg mx-auto text-center space-y-4">
          <div className="w-16 h-16 mx-auto border-2 border-red-hud flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-hud" />
          </div>
          <h3 className="font-mono text-lg font-bold uppercase text-red-hud tracking-widest">sala roja · acceso restringido</h3>
          <p className="text-xs text-muted-foreground leading-relaxed text-left">
            Esta sala reúne material documental de guerra <strong className="text-foreground">muy duro</strong>: combate real,
            consecuencias sobre civiles, cámaras de seguridad de ataques y evidencia de tortura. No hay gore gratuito:
            cada cinta tiene contexto, advertencia de gravedad y fuente verificada. Pero <strong className="text-foreground">sí es real</strong>.
          </p>
          <ul className="text-[10px] font-mono text-muted-foreground text-left space-y-1 uppercase">
            <li>· debes tener 18 años o más</li>
            <li>· cada cinta pide una segunda confirmación</li>
            <li>· puedes desactivar el acceso cuando quieras</li>
            <li>· si estás mal anímicamente, no entres hoy</li>
          </ul>
          {gate === "checking" ? (
            <p className="text-[10px] font-mono text-muted-foreground uppercase">verificando acceso…</p>
          ) : (
            <div className="flex items-center gap-2 justify-center flex-wrap">
              <button
                onClick={acceptGate}
                className="px-4 py-2 bg-red-hud/30 border border-red-hud text-red-hud font-mono text-xs uppercase tracking-widest hover:bg-red-hud/50 transition-colors"
              >
                Soy mayor de 18 · entrar
              </button>
              <button
                onClick={() => { toast("Decisión respetada. La Sala queda bloqueada."); }}
                className="px-4 py-2 border border-border text-muted-foreground font-mono text-xs uppercase tracking-widest hover:text-foreground transition-colors"
              >
                Salir de aquí
              </button>
            </div>
          )}
          <p className="text-[9px] font-mono text-muted-foreground/70 uppercase leading-relaxed">
            el objetivo de esta sala no es el morbo: es que ninguna cifra siga siendo abstracta
          </p>
        </div>
      </div>
    );
  }

  // ---------- SALA ABIERTA ----------
  return (
    <div className="space-y-3">
      <PanelHeader
        title="Sala Roja · Material documental verificado"
        subtitle={`${SALA_ROJA_ITEMS.length} cintas · acceso 18+ activo · doble confirmación por cinta`}
        icon={<AlertTriangle className="w-4 h-4 text-red-hud" />}
        color="red"
        right={
          <button onClick={revokeGate} className="px-2 py-1 border border-red-hud/50 text-red-hud font-mono text-[9px] uppercase hover:bg-red-hud/20 transition-colors">
            desactivar 18+
          </button>
        }
      />

      {/* Aviso ético */}
      <div className="hud-corner p-3 border-red-hud/40 bg-red-hud/5 flex items-start gap-2">
        <HeartHandshake className="w-4 h-4 text-red-hud mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Regla de la Sala: <strong className="text-foreground">cada imagen tiene dueño y contexto</strong>. VANGUARD no
          rehostea gore ni material de propaganda: enlazamos a la investigación documental verificada (AP, NYT Visual
          Investigations, ONU, MSF, ACLED). Si una cinta te afecta, ciérrala: no hay nada aquí obligatorio. Apoya a las
          víctimas compartiendo fuentes, no capturas.
        </p>
      </div>

      {/* Filtros */}
      <div className="hud-corner p-2 flex items-center gap-1 flex-wrap">
        {SALA_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={cn(
              "px-1.5 py-0.5 border text-[9px] font-mono uppercase transition-colors",
              cat === c ? "border-red-hud text-red-hud bg-red-hud/20" : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {c.toLowerCase()}
          </button>
        ))}
      </div>

      {/* Grid de cintas */}
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item, i) => {
          const isRevealed = !!revealed[item.id];
          return (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="hud-corner overflow-hidden"
            >
              {/* Miniatura CCTV con blur */}
              <div className="relative aspect-video bg-black/70 border-b border-red-hud/30">
                <div
                  className="absolute inset-0"
                  style={{
                    background: "radial-gradient(ellipse at 35% 35%, #171310 0%, #060505 100%)",
                    filter: isRevealed ? "none" : "blur(14px) saturate(0.4)",
                  }}
                />
                <div className="absolute inset-0 pointer-events-none" style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 1px, transparent 1px, transparent 3px)" }} />
                {/* HUD cámara */}
                <div className="absolute top-1.5 left-2 right-2 flex items-center justify-between z-10">
                  <span className="flex items-center gap-1 text-[8px] font-mono text-red-hud">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-hud blink-soft" /> REC · {item.tape}
                  </span>
                  <span className="text-[8px] font-mono text-muted-foreground uppercase">{item.category}</span>
                </div>
                <div className="absolute bottom-1.5 left-2 z-10">
                  <span className="text-[8px] font-mono text-muted-foreground">▲ {Intl.NumberFormat("es", { notation: "compact" }).format(item.views)} reproducciones documentadas</span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  {isRevealed ? (
                    <div className="text-center px-4">
                      <EyeOff className="w-6 h-6 text-amber mx-auto mb-1" />
                      <p className="text-[9px] font-mono uppercase text-amber leading-relaxed">descripción visible abajo — la fuente sigue siendo externa y verificada</p>
                    </div>
                  ) : (
                    <div className="text-center px-4">
                      <Lock className="w-6 h-6 text-red-hud mx-auto mb-1" />
                      <p className="text-[9px] font-mono uppercase text-red-hud">{item.warning}</p>
                      <p className="text-[9px] font-mono text-muted-foreground mt-0.5">pulsa confirmar para ver el contexto</p>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-1.5 right-2 z-10">
                  <FlagBadge code={item.country} size="sm" />
                </div>
              </div>

              <div className="p-3">
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  <span className={cn("text-[9px] font-mono px-1.5 py-0.5 border uppercase", WARNING_COLOR[item.warning])}>{item.warning}</span>
                  {item.verified && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 border border-green-hud/50 text-green-hud uppercase flex items-center gap-0.5">
                      <ShieldCheck className="w-2.5 h-2.5" /> fuente verificada
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-foreground leading-tight">{item.title}</h3>
                {isRevealed && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                    <p className="text-[10px] font-mono uppercase text-amber mt-2">qué vas a ver:</p>
                    <p className="text-[11px] text-foreground/90 leading-relaxed mt-0.5">{item.whatYoullSee}</p>
                    <p className="text-[10px] font-mono uppercase text-cyan-hud mt-2">por qué esta sala la muestra:</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{item.why}</p>
                  </motion.div>
                )}
                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  <button
                    onClick={() => setConfirmItem(item)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 border font-mono text-[9px] uppercase transition-colors",
                      isRevealed ? "border-amber-hud/60 text-amber" : "border-red-hud/60 text-red-hud hover:bg-red-hud/20"
                    )}
                  >
                    <Eye className="w-3 h-3" /> {isRevealed ? "abrir fuente" : "confirmar y ver"}
                  </button>
                  {isRevealed && (
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(item.sourceQuery)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 px-2 py-1 border border-cyan-hud/50 text-cyan-hud font-mono text-[9px] uppercase hover:bg-cyan-hud/10 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" /> fuente: {item.sourceLabel}
                    </a>
                  )}
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      {/* Modal de segunda confirmación */}
      {confirmItem && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setConfirmItem(null)} role="dialog" aria-modal="true">
          <div className="hud-panel border-red-hud max-w-md w-full p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-mono text-sm font-bold uppercase text-red-hud flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> segunda advertencia
              </h3>
              <button onClick={() => setConfirmItem(null)} aria-label="Cerrar" className="p-1 border border-border hover:border-red-hud text-muted-foreground hover:text-red-hud">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs font-mono uppercase text-foreground mt-2">{confirmItem.title}</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-2">{confirmItem.whatYoullSee}</p>
            <div className="border border-red-hud/40 bg-red-hud/10 p-2.5 mt-3">
              <p className="text-[10px] font-mono uppercase text-red-hud">confirmas que:</p>
              <ul className="text-[10px] text-muted-foreground mt-1 space-y-0.5 font-mono uppercase leading-relaxed">
                <li>· tienes 18+ y estás en condiciones de verlo</li>
                <li>· es material real de guerra, no ficción</li>
                <li>· respetarás a las víctimas: fuentes, no capturas</li>
              </ul>
            </div>
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <button
                onClick={() => {
                  setRevealed((r) => ({ ...r, [confirmItem.id]: true }));
                  setConfirmItem(null);
                  window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(confirmItem.sourceQuery)}`, "_blank", "noreferrer");
                }}
                className="px-3 py-2 bg-red-hud/30 border border-red-hud text-red-hud font-mono text-[10px] uppercase tracking-wider hover:bg-red-hud/50 transition-colors"
              >
                he entendido · abrir fuente verificada
              </button>
              <button
                onClick={() => setConfirmItem(null)}
                className="px-3 py-2 border border-border text-muted-foreground font-mono text-[10px] uppercase hover:text-foreground transition-colors"
              >
                mejor no
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

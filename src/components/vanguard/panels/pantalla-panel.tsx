"use client";

// VANGUARD v97.0 · PANTALLA TOTAL — VANGUARD TV
// La plataforma de video del mundo Vanguard, con la estructura de las apps de
// video más usadas del planeta adaptada a la identidad atardecer:
//   · FEED VERTICAL de pases cortos (scroll con snap, doble tap = corazón,
//     raíl de acciones, suscribirse, comentarios, barra de progreso, EN VIVO)
//   · SALA DE PROYECCIÓN (watch): reproductor 16:9 con Ken Burns, like/no,
//     compartir, guardar, suscripción, descripción y comentarios + relacionados
// Todo el contenido es 100% original del mundo Vanguard (motor pantalla-data).
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, MessageCircle, Share2, Bookmark, Play, Pause, ThumbsDown, Bell,
  BellRing, ChevronUp, ChevronDown, X, Expand, Volume2, VolumeX, Eye,
  ListVideo, Sparkles, MonitorPlay, Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { toast } from "sonner";
import { sfx } from "@/lib/sound";
import { useGameStore } from "@/lib/game-store";
import {
  feedTV, comentariosDe, relacionadosDe, canalNombre, canalEmoji, canalColor,
  canalHandle, canalSubs, compacto, duracionTxt, haceTxt, diaUtc, tendenciasTV,
  type PaseTV, type ComentarioTV,
} from "@/lib/pantalla-data";
import { usePantalla, TV_REWARD } from "@/lib/pantalla-store";

type VistaTV = "feed" | "siguiendo" | "vivo";

// ── corazón doble-tap: ráfaga de corazones que ascienden ──
function RafagaCorazones({ k }: { k: number }) {
  return (
    <AnimatePresence>
      {k > 0 && (
        <div key={k} className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center" aria-hidden>
          {Array.from({ length: 7 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.4, y: 10, x: (i - 3) * 14, rotate: (i - 3) * 12 }}
              animate={{ opacity: [0, 1, 1, 0], scale: 0.7 + (i % 3) * 0.35, y: -90 - i * 18 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, delay: i * 0.04, ease: "easeOut" }}
              className="absolute"
            >
              <Heart className={cn("w-7 h-7", i % 2 ? "w-5 h-5" : "")} style={{ color: i % 2 ? "#FF6BC1" : "#FF4D6D", fill: "#FF4D6D" }} />
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// ── raíl de acciones lateral (like, comentarios, share, guardar) ──
function AccionRail({
  pase, liked, likes, guardado, nCom, onLike, onComments, onShare, onSave,
}: {
  pase: PaseTV; liked: boolean; likes: number; guardado: boolean; nCom: number;
  onLike: () => void; onComments: () => void; onShare: () => void; onSave: () => void;
}) {
  const { t } = useT();
  const btn = "flex flex-col items-center gap-1 group";
  const circ = "w-11 h-11 rounded-full flex items-center justify-center border backdrop-blur-md transition-all duration-200 group-active:scale-90";
  return (
    <div className="flex flex-col items-center gap-4">
      <button onClick={onLike} className={btn} aria-label={t("tv.like")} title={t("tv.like")}>
        <span className={cn(circ, liked ? "border-red-hud bg-red-hud/25" : "border-white/20 bg-black/45 hover:border-red-hud/60")}>
          <motion.span key={String(liked)} initial={{ scale: liked ? 0.4 : 1 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 14 }}>
            <Heart className={cn("w-5 h-5 transition-colors", liked ? "text-red-hud" : "text-white")} style={liked ? { fill: "#FF4D6D" } : undefined} />
          </motion.span>
        </span>
        <span className="text-[10px] font-mono font-bold text-white/90 drop-shadow">{compacto(likes + (liked ? 1 : 0))}</span>
      </button>

      <button onClick={onComments} className={btn} aria-label={t("tv.comentarios")} title={t("tv.comentarios")}>
        <span className={cn(circ, "border-white/20 bg-black/45 hover:border-amber-hud/60")}>
          <MessageCircle className="w-5 h-5 text-white" />
        </span>
        <span className="text-[10px] font-mono font-bold text-white/90 drop-shadow">{compacto(nCom)}</span>
      </button>

      <button onClick={onShare} className={btn} aria-label={t("tv.compartir")} title={t("tv.compartir")}>
        <span className={cn(circ, "border-white/20 bg-black/45 hover:border-green-hud/60")}>
          <Share2 className="w-5 h-5 text-white" />
        </span>
        <span className="text-[10px] font-mono font-bold text-white/90 drop-shadow">{compacto(pase.compartidos)}</span>
      </button>

      <button onClick={onSave} className={btn} aria-label={t("tv.guardar")} title={t("tv.guardar")}>
        <span className={cn(circ, guardado ? "border-amber bg-amber-hud/25" : "border-white/20 bg-black/45 hover:border-amber-hud/60")}>
          <Bookmark className={cn("w-5 h-5 transition-colors", guardado ? "text-amber" : "text-white")} style={guardado ? { fill: "#FFC94D" } : undefined} />
        </span>
        <span className="text-[10px] font-mono font-bold text-white/90 drop-shadow">{t("tv.guardar")}</span>
      </button>
    </div>
  );
}

// ── ficha de canal + SUSCRIBIRSE ──
function FilaCanal({ pase, compact = false }: { pase: PaseTV; compact?: boolean }) {
  const { t } = useT();
  const subs = usePantalla((s) => s.subs);
  const toggleSub = usePantalla((s) => s.toggleSub);
  const suscrito = subs.includes(pase.canalId);
  const hex = canalColor(pase.canalId);
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <span
        className={cn("shrink-0 rounded-full flex items-center justify-center border", compact ? "w-8 h-8 text-base" : "w-10 h-10 text-xl")}
        style={{ background: `linear-gradient(150deg, ${hex}33, rgba(6,6,10,0.9))`, borderColor: hex + "55", boxShadow: `0 0 14px ${hex}33` }}
        aria-hidden
      >
        {canalEmoji(pase.canalId)}
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={cn("font-mono font-bold text-white truncate", compact ? "text-[11px]" : "text-xs")}>{canalNombre(pase.canalId)}</span>
          {canalHandle(pase.canalId) !== "@vanguardtv" && <span className="text-[9px] text-white/50 font-mono hidden sm:inline">{canalHandle(pase.canalId)}</span>}
        </div>
        <span className="text-[9px] font-mono text-white/55">{compacto(canalSubs(pase.canalId))} · {t("tv.suscriptores")}</span>
      </div>
      <button
        onClick={() => {
          const on = toggleSub(pase.canalId);
          sfx.click();
          toast.success(on ? `${t("tv.suscritoA")} ${canalNombre(pase.canalId)}` : `${t("tv.desuscrito")}`, { duration: 1800 });
        }}
        className={cn(
          "shrink-0 ml-1 flex items-center gap-1.5 h-8 px-3 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider border transition-all duration-200 active:scale-95",
          suscrito ? "border-white/25 text-white/80 bg-white/10" : "border-amber text-amber bg-amber-hud/20 hover:bg-amber-hud/35"
        )}
      >
        {suscrito ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
        {suscrito ? t("tv.suscrito") : t("tv.suscribirse")}
      </button>
    </div>
  );
}

// ── hoja de comentarios (drawer lateral en desktop, hoja inferior en móvil) ──
function HojaComentarios({ pase, onCerrar }: { pase: PaseTV; onCerrar: () => void }) {
  const { t } = useT();
  const [texto, setTexto] = useState("");
  const generados = useMemo(() => comentariosDe(pase.id, 8) as ComentarioTV[], [pase.id]);
  // v97 FIX #185: el selector devuelve SIEMPRE la referencia estable del array;
  // el filtro se deriva con useMemo fuera del store (getSnapshot estable)
  const todosMios = usePantalla((s) => s.misComentarios);
  const mios = useMemo(() => todosMios.filter((c) => c.paseId === pase.id), [todosMios, pase.id]);
  const comentar = usePantalla((s) => s.comentar);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex sm:items-center sm:justify-end"
      onClick={onCerrar}
    >
      <motion.aside
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="mt-auto sm:mt-0 w-full sm:w-[400px] h-[62vh] sm:h-[78vh] rounded-t-2xl sm:rounded-2xl border border-amber-hud/40 bg-[#0B0E14]/97 backdrop-blur-md shadow-[0_24px_80px_-20px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden"
        aria-label={t("tv.comentarios")}
      >
        <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber">{t("tv.comentarios")} · {compacto(pase.nComentarios)}</span>
          <button onClick={onCerrar} aria-label="Cerrar" className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto thin-scroll px-4 py-3 space-y-3.5">
          {mios.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <span className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs border border-amber-hud/50 bg-amber-hud/15" aria-hidden>🎯</span>
              <div className="min-w-0">
                <div className="text-[10px] font-mono text-amber">{t("tv.tu")} · {t("tv.ahora")}</div>
                <p className="text-[12px] text-foreground/90 leading-snug break-words">{c.texto}</p>
              </div>
            </div>
          ))}
          {generados.map((c) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5">
              <span className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-mono font-bold border border-border/60 bg-black/40 text-white/70" aria-hidden>
                {c.handle.slice(1, 3).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-mono text-white/50">
                  {c.handle}{c.fija && <span className="ml-1.5 text-amber">· {t("tv.fijado")}</span>} · {t("tv.hace")} {c.haceMin < 60 ? c.haceMin + " min" : Math.floor(c.haceMin / 60) + " h"}
                </div>
                <p className="text-[12px] text-foreground/90 leading-snug">{c.texto}</p>
                <div className="flex items-center gap-3 mt-1 text-white/40">
                  <span className="flex items-center gap-1 text-[10px] font-mono"><Heart className="w-3 h-3" /> {compacto(c.meGusta)}</span>
                  <span className="text-[10px] font-mono">{t("tv.responder")}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <form
          className="p-3 border-t border-border/50 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (comentar(pase.id, texto)) {
              sfx.click();
              setTexto("");
              toast.success(t("tv.comentarioOk"), { duration: 1600 });
            }
          }}
        >
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder={t("tv.comentarioPh")}
            maxLength={240}
            className="flex-1 min-w-0 h-9 rounded-full border border-border/60 bg-black/40 px-4 text-[12px] font-mono text-foreground outline-none focus:border-amber-hud/70 transition-colors placeholder:text-muted-foreground/60"
          />
          <button type="submit" className="shrink-0 h-9 px-4 rounded-full bg-amber-hud/25 border border-amber-hud/70 text-amber font-mono text-[10px] font-bold uppercase tracking-wider hover:bg-amber-hud/40 transition-colors active:scale-95">
            {t("tv.publicar")}
          </button>
        </form>
      </motion.aside>
    </motion.div>
  );
}

// ── tarjeta de pase del feed vertical ──
function TarjetaPase({
  pase, activo, muted, onMute, onLike, onComments, onShare, onSave, onProyectar,
}: {
  pase: PaseTV; activo: boolean; muted: boolean; onMute: () => void;
  onLike: () => void; onComments: () => void; onShare: () => void; onSave: () => void; onProyectar: () => void;
}) {
  const { t } = useT();
  const liked = usePantalla((s) => s.liked.includes(pase.id));
  const guardado = usePantalla((s) => s.guardar.includes(pase.id));
  const [rafaga, setRafaga] = useState(0);
  const ultimoTap = useRef(0);

  const dobleTap = () => {
    const ahora = Date.now();
    if (ahora - ultimoTap.current < 320) {
      setRafaga((k) => k + 1);
      if (!liked) onLike();
      sfx.click();
    }
    ultimoTap.current = ahora;
  };

  return (
    <div className="snap-start snap-always h-full w-full shrink-0 relative flex items-center justify-center px-2 sm:px-6 py-2">
      <div
        className="relative w-full max-w-[430px] h-full max-h-[640px] rounded-2xl overflow-hidden border border-amber-hud/30 bg-black select-none"
        onClick={dobleTap}
      >
        {/* imagen con ken burns vivo (solo cuando el pase está activo) */}
        <motion.img
          src={pase.img}
          alt={pase.titulo}
          loading={activo ? "eager" : "lazy"}
          className="absolute inset-0 w-full h-full object-cover"
          animate={activo && !pase.enVivo ? { scale: [1, 1.09], x: [0, -8] } : { scale: 1.02 }}
          transition={activo && !pase.enVivo ? { duration: 20, repeat: Infinity, repeatType: "mirror", ease: "linear" } : { duration: 0.4 }}
        />
        {/* velos de atardecer para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/55 pointer-events-none" />

        <RafagaCorazones k={rafaga} />

        {/* insignia EN VIVO con espectadores */}
        {pase.enVivo && (
          <div className="absolute top-3 left-3 flex items-center gap-2 z-20">
            <span className="flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-red-hud/90 text-white text-[9px] font-mono font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" aria-hidden /> {t("tv.envivo")}
            </span>
            <span className="flex items-center gap-1 h-6 px-2.5 rounded-full bg-black/60 backdrop-blur text-white/90 text-[9px] font-mono">
              <Eye className="w-3 h-3" /> {compacto(pase.espectadores ?? 0)}
            </span>
          </div>
        )}

        {/* tipo de pase + duración */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
          <span className="h-6 px-2.5 rounded-full bg-black/60 backdrop-blur text-white/85 text-[9px] font-mono uppercase tracking-wider border border-white/15">
            {pase.tipo}
          </span>
          <span className="h-6 px-2 rounded-full bg-black/60 backdrop-blur text-white/85 text-[9px] font-mono">
            {pase.enVivo ? "LIVE" : duracionTxt(pase.duracion)}
          </span>
        </div>

        {/* botón proyectar (ver en sala) */}
        <button
          onClick={(e) => { e.stopPropagation(); sfx.tab(); onProyectar(); }}
          title={t("tv.proyectar")}
          aria-label={t("tv.proyectar")}
          className="absolute top-12 right-3 z-20 w-9 h-9 rounded-full border border-amber-hud/60 bg-black/55 backdrop-blur text-amber flex items-center justify-center hover:bg-amber-hud/25 transition-colors active:scale-90"
        >
          <Expand className="w-4 h-4" />
        </button>

        {/* botón sonido */}
        <button
          onClick={(e) => { e.stopPropagation(); onMute(); }}
          title={muted ? t("tv.sonidoOn") : t("tv.sonidoOff")}
          aria-label={muted ? t("tv.sonidoOn") : t("tv.sonidoOff")}
          className="absolute bottom-[152px] right-3 z-20 w-9 h-9 rounded-full border border-white/20 bg-black/55 backdrop-blur text-white flex items-center justify-center hover:border-amber-hud/60 transition-colors active:scale-90"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* barra de progreso del pase */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/15 z-20">
          {activo && (
            <div
              key={pase.id + (pase.enVivo ? "v" : "")}
              className={cn("h-full bg-gradient-to-r from-amber via-orange to-amber", pase.enVivo && "animate-pulse")}
              style={{
                width: pase.enVivo ? "100%" : undefined,
                animation: pase.enVivo ? undefined : "tvProgreso 30s linear forwards",
              }}
            />
          )}
        </div>

        {/* información inferior: canal + caption + tags */}
        <div className="absolute bottom-3 left-3 right-[64px] z-20" onClick={(e) => e.stopPropagation()}>
          <FilaCanal pase={pase} />
          <p className="mt-2 text-[12px] leading-snug text-white/95 font-medium line-clamp-2">{pase.titulo}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            {pase.tags.slice(0, 3).map((tg) => (
              <span key={tg} className="text-[10px] font-mono font-bold text-amber/90">{tg}</span>
            ))}
            <span className="text-[10px] font-mono text-white/50">{haceTxt(pase.haceHoras)}</span>
          </div>
        </div>

        {/* raíl de acciones */}
        <div className="absolute bottom-6 right-2.5 z-20" onClick={(e) => e.stopPropagation()}>
          <AccionRail
            pase={pase}
            liked={liked}
            likes={pase.meGusta}
            guardado={guardado}
            nCom={pase.nComentarios}
            onLike={onLike}
            onComments={onComments}
            onShare={onShare}
            onSave={onSave}
          />
        </div>
      </div>
    </div>
  );
}

// ── miniatura para la lista de relacionados ──
function MiniPase({ pase, onAbrir }: { pase: PaseTV; onAbrir: () => void }) {
  return (
    <button
      onClick={() => { sfx.click(); onAbrir(); }}
      className="group w-full flex gap-2.5 text-left rounded-xl border border-border/40 hover:border-amber-hud/50 bg-black/30 hover:bg-amber-hud/10 p-2 transition-all duration-200"
    >
      <span className="relative shrink-0 w-[112px] h-[64px] rounded-lg overflow-hidden border border-white/10">
        <img src={pase.img} alt="" loading="lazy" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
        <span className="absolute bottom-1 right-1 px-1 rounded bg-black/80 text-white text-[8px] font-mono">
          {pase.enVivo ? "LIVE" : duracionTxt(pase.duracion)}
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-medium text-foreground leading-tight line-clamp-2 group-hover:text-amber transition-colors">{pase.titulo}</span>
        <span className="mt-1 block text-[9px] font-mono text-muted-foreground">
          {canalEmoji(pase.canalId)} {canalNombre(pase.canalId)}
        </span>
        <span className="block text-[9px] font-mono text-muted-foreground/70">
          {compacto(pase.vistas)} · {haceTxt(pase.haceHoras)}
        </span>
      </span>
    </button>
  );
}

// ── SALA DE PROYECCIÓN (vista watch) ──
function SalaProyeccion({ pase, onVolver, onAbrirPase }: { pase: PaseTV; onVolver: () => void; onAbrirPase: (p: PaseTV) => void }) {
  const { t } = useT();
  const recompensaTV = useRecompensaTV();
  const liked = usePantalla((s) => s.liked.includes(pase.id));
  const guardado = usePantalla((s) => s.guardar.includes(pase.id));
  const toggleLike = usePantalla((s) => s.toggleLike);
  const toggleGuardar = usePantalla((s) => s.toggleGuardar);
  const [dislike, setDislike] = useState(false);
  const [reproduciendo, setReproduciendo] = useState(true);
  const [descAbierta, setDescAbierta] = useState(false);
  const [chip, setChip] = useState("todo");
  const generados = useMemo(() => comentariosDe(pase.id, 6), [pase.id]);
  // v97 FIX #185: misma receta que en la hoja — filtro fuera del selector
  const todosMios = usePantalla((s) => s.misComentarios);
  const mios = useMemo(() => todosMios.filter((c) => c.paseId === pase.id), [todosMios, pase.id]);
  const relacionados = useMemo(() => relacionadosDe(pase), [pase]);
  const chips = useMemo(() => {
    const set = new Set(relacionados.map((p) => p.tipo));
    return ["todo", ...Array.from(set)];
  }, [relacionados]);
  const listaRel = chip === "todo" ? relacionados : relacionados.filter((p) => p.tipo === chip);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4"
    >
      {/* columna principal */}
      <div className="min-w-0">
        {/* reproductor 16:9 con ken burns */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-amber-hud/40 bg-black shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)]">
          <motion.img
            src={pase.img}
            alt={pase.titulo}
            className="absolute inset-0 w-full h-full object-cover"
            animate={reproduciendo ? { scale: [1, 1.08], x: [0, -10] } : { scale: 1.04 }}
            transition={reproduciendo ? { duration: 24, repeat: Infinity, repeatType: "mirror", ease: "linear" } : { duration: 0.4 }}
            style={{ animationPlayState: reproduciendo ? "running" : "paused" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

          {/* controles centrales */}
          <button
            onClick={() => { setReproduciendo((v) => !v); sfx.click(); }}
            aria-label={reproduciendo ? t("tv.pausa") : t("tv.play")}
            className="absolute inset-0 z-10 flex items-center justify-center group"
          >
            <AnimatePresence>
              {!reproduciendo && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  className="w-16 h-16 rounded-full bg-black/60 backdrop-blur border border-amber-hud/50 flex items-center justify-center"
                >
                  <Play className="w-7 h-7 text-amber ml-1" style={{ fill: "#FFC94D" }} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* insignia live */}
          {pase.enVivo && (
            <span className="absolute top-3 left-3 flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-red-hud/90 text-white text-[9px] font-mono font-bold uppercase tracking-widest z-20">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" aria-hidden /> {t("tv.envivo")} · {compacto(pase.espectadores ?? 0)} {t("tv.mirando")}
            </span>
          )}

          {/* progreso + controles inferiores */}
          <div className="absolute bottom-0 left-0 right-0 z-20 px-3 pb-2 pt-6 bg-gradient-to-t from-black/85 to-transparent">
            <div className="h-[3px] rounded-full bg-white/20 overflow-hidden mb-2">
              <div
                key={pase.id + String(reproduciendo)}
                className="h-full bg-gradient-to-r from-amber via-orange to-amber"
                style={{
                  width: pase.enVivo ? "100%" : undefined,
                  animation: reproduciendo && !pase.enVivo ? "tvProgreso 90s linear forwards" : undefined,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-white/85">
              <div className="flex items-center gap-3">
                <button onClick={() => { setReproduciendo((v) => !v); sfx.click(); }} aria-label={reproduciendo ? t("tv.pausa") : t("tv.play")} className="hover:text-amber transition-colors">
                  {reproduciendo ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <Volume2 className="w-4 h-4 opacity-70" />
                <span className="text-[10px] font-mono">{pase.enVivo ? t("tv.envivo") : duracionTxt(pase.duracion)}</span>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber/90">VANGUARD TV</span>
            </div>
          </div>
        </div>

        {/* título + métricas */}
        <h2 className="mt-3 text-base sm:text-lg font-bold text-foreground leading-tight">{pase.titulo}</h2>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono text-muted-foreground">
          <span>{compacto(pase.vistas)} {t("tv.vistas")}</span>
          <span>· {haceTxt(pase.haceHoras)}</span>
          <span className="flex items-center gap-1 text-amber/80"><Sparkles className="w-3 h-3" /> {pase.tipo}</span>
        </div>

        {/* fila de acciones estilo sala de proyección */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              const on = toggleLike(pase.id);
              sfx.click();
              if (on) recompensaTV(pase.id);
            }}
            className={cn(
              "flex items-center gap-1.5 h-9 px-4 rounded-full border font-mono text-[11px] font-bold transition-all active:scale-95",
              liked ? "border-red-hud text-red-hud bg-red-hud/15" : "border-border/60 text-muted-foreground hover:border-red-hud/50 hover:text-red-hud"
            )}
          >
            <Heart className="w-4 h-4" style={liked ? { fill: "#FF4D6D" } : undefined} /> {compacto(pase.meGusta + (liked ? 1 : 0))}
          </button>
          <button
            onClick={() => { setDislike((v) => !v); sfx.click(); }}
            className={cn(
              "flex items-center gap-1.5 h-9 px-4 rounded-full border font-mono text-[11px] font-bold transition-all active:scale-95",
              dislike ? "border-cyan-hud text-cyan-hud bg-cyan-hud/15" : "border-border/60 text-muted-foreground hover:border-cyan-hud/50"
            )}
          >
            <ThumbsDown className="w-4 h-4" /> {t("tv.no")}
          </button>
          <button
            onClick={() => {
              compartirPase(pase);
              toast.success(t("tv.shareOk"), { duration: 1800 });
            }}
            className="flex items-center gap-1.5 h-9 px-4 rounded-full border border-border/60 text-muted-foreground hover:border-green-hud/50 hover:text-green-hud font-mono text-[11px] font-bold transition-all active:scale-95"
          >
            <Share2 className="w-4 h-4" /> {t("tv.compartir")}
          </button>
          <button
            onClick={() => {
              const on = toggleGuardar(pase.id);
              sfx.click();
              if (on) recompensaTV(pase.id);
              toast.success(on ? t("tv.guardadoOk") : t("tv.quitadoOk"), { duration: 1600 });
            }}
            className={cn(
              "flex items-center gap-1.5 h-9 px-4 rounded-full border font-mono text-[11px] font-bold transition-all active:scale-95",
              guardado ? "border-amber text-amber bg-amber-hud/15" : "border-border/60 text-muted-foreground hover:border-amber-hud/50"
            )}
          >
            <Bookmark className="w-4 h-4" style={guardado ? { fill: "#FFC94D" } : undefined} /> {guardado ? t("tv.guardado") : t("tv.guardar")}
          </button>
        </div>

        {/* canal + suscripción */}
        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-border/40 bg-black/30 px-4 py-3">
          <FilaCanal pase={pase} />
        </div>

        {/* descripción expandible */}
        <div className="mt-3 rounded-2xl border border-border/40 bg-black/30 px-4 py-3">
          <p className={cn("text-[12px] leading-relaxed text-foreground/85", descAbierta ? "" : "line-clamp-2")}>{pase.descripcion}</p>
          <button onClick={() => { setDescAbierta((v) => !v); sfx.click(); }} className="mt-1.5 text-[10px] font-mono uppercase tracking-widest text-amber hover:text-foreground transition-colors">
            {descAbierta ? t("tv.verMenos") : t("tv.verMas")}
          </button>
        </div>

        {/* comentarios */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="w-4 h-4 text-amber" />
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-amber">{t("tv.comentarios")} · {compacto(pase.nComentarios + mios.length)}</span>
          </div>
          <div className="space-y-3">
            {mios.map((c) => (
              <div key={c.id} className="flex gap-2.5">
                <span className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm border border-amber-hud/50 bg-amber-hud/15" aria-hidden>🎯</span>
                <div>
                  <div className="text-[10px] font-mono text-amber">{t("tv.tu")}</div>
                  <p className="text-[12px] text-foreground/90">{c.texto}</p>
                </div>
              </div>
            ))}
            {generados.map((c) => (
              <div key={c.id} className="flex gap-2.5">
                <span className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-mono font-bold border border-border/60 bg-black/40 text-white/70" aria-hidden>
                  {c.handle.slice(1, 3).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono text-muted-foreground">
                    {c.handle}{c.fija && <span className="ml-1.5 text-amber">· {t("tv.fijado")}</span>} · {t("tv.hace")} {c.haceMin < 60 ? c.haceMin + " min" : Math.floor(c.haceMin / 60) + " h"}
                  </div>
                  <p className="text-[12px] text-foreground/90 leading-snug">{c.texto}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-muted-foreground/70">
                    <Heart className="w-3 h-3" /> <span className="text-[10px] font-mono">{compacto(c.meGusta)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* relacionados */}
      <aside className="min-w-0">
        <div className="flex items-center gap-2 mb-2.5">
          <ListVideo className="w-4 h-4 text-amber" />
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-amber">{t("tv.siguiente")}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => { setChip(c); sfx.click(); }}
              className={cn(
                "h-7 px-3 rounded-full border font-mono text-[9px] font-bold uppercase tracking-wider transition-colors",
                chip === c ? "border-amber text-amber bg-amber-hud/20" : "border-border/50 text-muted-foreground hover:border-amber-hud/40"
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="space-y-2 max-h-[70vh] overflow-y-auto thin-scroll pr-1">
          {listaRel.map((p) => (
            <MiniPase key={p.id} pase={p} onAbrir={() => onAbrirPase(p)} />
          ))}
        </div>
      </aside>
    </motion.div>
  );
}

// ── helpers de interacción con recompensa y portapapeles ──
function compartirPase(pase: PaseTV) {
  sfx.click();
  const texto = `VANGUARD TV · ${pase.titulo}`;
  try {
    void navigator.clipboard.writeText(texto);
  } catch {
    /* portapapeles no disponible — el toast igual confirma la intención */
  }
}

function useRecompensaTV() {
  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);
  const registrarTV = usePantalla((s) => s.registrarTV);
  return useCallback(
    (paseId: string) => {
      const pago = registrarTV(paseId);
      if (pago) {
        addCoins(TV_REWARD.coins, "Espectador crítico (pase nuevo)");
        addXp(TV_REWARD.xp);
        toast.success(`Espectador crítico +${TV_REWARD.coins}ⓒ +${TV_REWARD.xp} XP`, { duration: 2400 });
      }
    },
    [addCoins, addXp, registrarTV]
  );
}

// ── VANGUARD TV: componente principal ──
export function PantallaPanel() {
  const { t } = useT();
  const recompensaTV = useRecompensaTV();
  const [dia] = useState(() => diaUtc());
  const feedBase = useMemo(() => feedTV(dia), [dia]);
  const [vista, setVista] = useState<VistaTV>("feed");
  const [activo, setActivo] = useState(0);
  const [muted, setMuted] = useState(true);
  const [comentariosDePase, setComentariosDePase] = useState<PaseTV | null>(null);
  const [sala, setSala] = useState<PaseTV | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const subs = usePantalla((s) => s.subs);
  const toggleLike = usePantalla((s) => s.toggleLike);
  const toggleGuardar = usePantalla((s) => s.toggleGuardar);

  // feed según la vista elegida (para ti / siguiendo / en vivo)
  const feed = useMemo(() => {
    if (vista === "siguiendo") {
      const f = feedBase.filter((p) => subs.includes(p.canalId));
      return f.length ? f : feedBase.slice(0, 8);
    }
    if (vista === "vivo") {
      const f = feedBase.filter((p) => p.enVivo);
      return f.length ? f : feedBase.slice(0, 6);
    }
    return feedBase;
  }, [feedBase, vista, subs]);

  // tendencias del día como franja superior
  const tendencias = useMemo(() => tendenciasTV(dia), [dia]);

  // seguir el scroll para saber qué pase está activo (rAF + posición)
  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / el.clientHeight);
    setActivo((prev) => (prev === idx ? prev : idx));
  }, []);

  // navegar a un pase concreto (desde tendencias o teclado)
  const irA = useCallback((idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const i = Math.max(0, Math.min(idx, feed.length - 1));
    el.scrollTo({ top: i * el.clientHeight, behavior: "smooth" });
    setActivo(i);
  }, [feed.length]);

  // teclado: ↑↓ cambia de pase, M sonido, L like, C comentarios
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (sala || comentariosDePase) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowDown") { e.preventDefault(); sfx.click(); irA(activo + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); sfx.click(); irA(activo - 1); }
      else if (e.key === "m" || e.key === "M") setMuted((v) => !v);
      else if (e.key === "l" || e.key === "L") {
        const p = feed[activo];
        if (p) { const on = toggleLike(p.id); if (on) recompensaTV(p.id); }
      } else if (e.key === "c" || e.key === "C") {
        const p = feed[activo];
        if (p) setComentariosDePase(p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activo, feed, irA, sala, comentariosDePase, toggleLike, recompensaTV]);

  const compartirDelFeed = useCallback((p: PaseTV) => {
    compartirPase(p);
    toast.success(t("tv.shareOk"), { duration: 1600 });
  }, [t]);

  const guardarDelFeed = useCallback((p: PaseTV) => {
    const on = toggleGuardar(p.id);
    sfx.click();
    if (on) recompensaTV(p.id);
    toast.success(on ? t("tv.guardadoOk") : t("tv.quitadoOk"), { duration: 1500 });
  }, [toggleGuardar, recompensaTV, t]);

  const likeDelFeed = useCallback((p: PaseTV) => {
    const on = toggleLike(p.id);
    sfx.click();
    if (on) recompensaTV(p.id);
  }, [toggleLike, recompensaTV]);

  return (
    <div className="space-y-4">
      {/* cabecera de VANGUARD TV */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-10 h-10 rounded-xl flex items-center justify-center text-amber border border-amber-hud/50" style={{ background: "linear-gradient(150deg, #FFC94D33, rgba(6,6,10,0.9))", boxShadow: "0 0 18px #FFC94D33" }}>
            <MonitorPlay className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-lg sm:text-xl font-black font-display tracking-tight text-gradient">VANGUARD TV</h1>
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">{t("tv.tagline")}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {(["feed", "siguiendo", "vivo"] as VistaTV[]).map((v) => (
            <button
              key={v}
              onClick={() => { setVista(v); setActivo(0); sfx.tab(); irA(0); }}
              className={cn(
                "h-9 px-4 rounded-full border font-mono text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95",
                vista === v ? "border-amber text-amber bg-amber-hud/25 shadow-[0_0_16px_rgba(255,201,77,0.25)]" : "border-border/60 text-muted-foreground hover:border-amber-hud/50 hover:text-foreground"
              )}
            >
              {v === "feed" ? t("tv.parati") : v === "siguiendo" ? t("tv.siguiendo") : t("tv.envivoTab")}
            </button>
          ))}
        </div>
      </div>

      {/* franja de tendencias del día */}
      <div className="flex items-center gap-2 overflow-x-auto thin-scroll pb-1 -mx-1 px-1">
        <span className="shrink-0 flex items-center gap-1.5 h-7 px-3 rounded-full bg-red-hud/15 border border-red-hud/40 text-red-hud text-[9px] font-mono font-bold uppercase tracking-widest">
          <Flame className="w-3 h-3" /> {t("tv.tendencias")}
        </span>
        {tendencias.map((p, i) => (
          <button
            key={p.id}
            onClick={() => { setSala(p); sfx.tab(); }}
            className="shrink-0 flex items-center gap-2 h-7 pl-1.5 pr-3 rounded-full border border-border/50 hover:border-amber-hud/60 bg-black/30 hover:bg-amber-hud/10 transition-colors"
          >
            <span className="w-5 h-5 rounded-full overflow-hidden border border-white/15" aria-hidden>
              <img src={p.img} alt="" className="w-full h-full object-cover" loading="lazy" />
            </span>
            <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[180px] hover:text-amber transition-colors">{i + 1}· {p.titulo}</span>
          </button>
        ))}
      </div>

      {/* sala o feed */}
      <AnimatePresence mode="wait">
        {sala ? (
          <div key="sala">
            <button
              onClick={() => { setSala(null); sfx.tab(); }}
              className="mb-3 flex items-center gap-1.5 h-9 px-4 rounded-full border border-border/60 text-muted-foreground hover:border-amber-hud/60 hover:text-amber font-mono text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95"
            >
              <ChevronDown className="w-4 h-4 rotate-90" /> {t("tv.volver")}
            </button>
            <SalaProyeccion pase={sala} onVolver={() => setSala(null)} onAbrirPase={(p) => setSala(p)} />
          </div>
        ) : (
          <motion.div
            key="feed"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div
              ref={scrollRef}
              onScroll={onScroll}
              className="snap-y snap-mandatory overflow-y-auto rounded-2xl border border-amber-hud/25 bg-black/30"
              style={{ height: "min(78vh, 720px)" }}
            >
              {feed.map((p, i) => (
                <TarjetaPase
                  key={p.id}
                  pase={p}
                  activo={i === activo}
                  muted={muted}
                  onMute={() => setMuted((v) => !v)}
                  onLike={() => likeDelFeed(p)}
                  onComments={() => setComentariosDePase(p)}
                  onShare={() => compartirDelFeed(p)}
                  onSave={() => guardarDelFeed(p)}
                  onProyectar={() => setSala(p)}
                />
              ))}
            </div>

            {/* flechas laterales de navegación (desktop) */}
            <div className="hidden lg:flex flex-col gap-2 absolute -right-14 top-1/2 -translate-y-1/2 z-30">
              <button
                onClick={() => { sfx.click(); irA(activo - 1); }}
                disabled={activo === 0}
                aria-label={t("tv.ant")}
                className="w-11 h-11 rounded-full border border-amber-hud/50 bg-black/50 backdrop-blur text-amber flex items-center justify-center hover:bg-amber-hud/20 transition-all active:scale-90 disabled:opacity-25 disabled:cursor-not-allowed"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <button
                onClick={() => { sfx.click(); irA(activo + 1); }}
                disabled={activo >= feed.length - 1}
                aria-label={t("tv.sig")}
                className="w-11 h-11 rounded-full border border-amber-hud/50 bg-black/50 backdrop-blur text-amber flex items-center justify-center hover:bg-amber-hud/20 transition-all active:scale-90 disabled:opacity-25 disabled:cursor-not-allowed"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* contador de posición */}
            <div className="mt-2 flex items-center justify-between px-1 text-[9px] font-mono uppercase tracking-[0.25em] text-muted-foreground/60">
              <span>{t("tv.pase")} {Math.min(activo + 1, feed.length)} / {feed.length}</span>
              <span>{t("tv.ayudaTeclas")}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* hoja de comentarios */}
      <AnimatePresence>
        {comentariosDePase && (
          <HojaComentarios pase={comentariosDePase} onCerrar={() => setComentariosDePase(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}


"use client";

// v25 MEMES GEOPOLÍTICOS — ESTUDIO COMPLETO.
// Editor libre de memes: 251 países como countryballs arrastrables, textos con
// contorno estilo meme, stickers emoji, 8 fondos, 12 plantillas con disposición
// automática, exportación PNG, compartir y GALERÍA comunitaria con base de datos
// (publicar +25 monedas, like +2 XP, anti-spam server-side).
// Lienzo de diseño: 640 x 480 escalado con ResizeObserver (misma render en editor y galería).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Countryball, STICKER_CODES as STICKER_CODES_EXPANDED } from "@/components/vanguard/countryball";
import { WORLD_FLAGS, countryName } from "@/lib/world-data";
import {
  MEME_TEMPLATES, MEME_BACKGROUNDS, MEME_STICKERS, COUNTRY_CAST,
  buildTemplateLayers, newLayerId,
  type MemeComposition, type MemeLayer,
} from "@/lib/meme-data";
import { useGameStore } from "@/lib/game-store";
import { toast } from "sonner";
import {
  Download, Share2, Upload, Laugh, Trash2, Sparkles, Trophy, Heart,
  Layers, Palette, Type as TypeIcon, Sticker, Search, Crown, Move,
} from "lucide-react";

// ====== CONSTANTES DE DISEÑO ======

const DW = 640; // ancho del lienzo de diseño
const DH = 480; // alto del lienzo de diseño

interface GalleryMeme {
  id: string;
  author: string;
  template: string;
  caption: string;
  composition: string;
  likes: number;
  createdAt: string;
}

// ====== HOOKS ======

/** Escala el lienzo 640x480 al ancho del contenedor (con ResizeObserver). */
function useStageScale() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setScale(Math.min(el.clientWidth / DW, 1.2));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { wrapRef, scale };
}

function uid() {
  return newLayerId();
}

/** Recompensa con enfriamiento local de 60s (anti-granja). */
function recompensarCd(key: string, coins: number, motivo: string, addCoins: (n: number, r: string) => void): boolean {
  const last = parseInt(localStorage.getItem(key) || "0", 10);
  if (Date.now() - last < 60_000) {
    toast.info("Recibido hace poco — espera un minuto para volver a ganar");
    return false;
  }
  localStorage.setItem(key, String(Date.now()));
  addCoins(coins, motivo);
  return true;
}

// ====== BOLA DEL LIENZO (img crossOrigin para export PNG fiable) ======

function StageBall({ code, size }: { code: string; size: number }) {
  const [err, setErr] = useState(false);
  const name = countryName(code);
  if (err || !/^[a-z]{2}$/.test(code)) {
    return <Countryball code={code} size={size} />;
  }
  return (
    <span
      className="relative inline-block shrink-0 overflow-hidden rounded-full align-middle"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Countryball ${name}`}
    >
      <img
        src={`https://flagcdn.com/w160/${code}.png`}
        alt=""
        crossOrigin="anonymous"
        draggable={false}
        onError={() => setErr(true)}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 30% 22%, rgba(255,255,255,0.30), transparent 46%), radial-gradient(circle at 68% 92%, rgba(0,0,0,0.42), transparent 58%)",
        }}
      />
      {/* ojos estilo polandball de guerra */}
      <svg viewBox="0 0 64 64" className="absolute inset-0 h-full w-full" aria-hidden>
        <ellipse cx="41.5" cy="24.5" rx="7" ry="8" fill="#fff" />
        <ellipse cx="55" cy="24.5" rx="6" ry="7" fill="#fff" opacity="0.95" />
        <circle cx="43" cy="25.5" r="2.9" fill="#101010" />
        <circle cx="56.5" cy="25.5" r="2.7" fill="#101010" />
        <path d="M35 16.5 q6 -3.5 11 -0.5" stroke="#101010" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <path d="M50 14.5 q5 -1.5 9 1.5" stroke="#101010" strokeWidth="2.3" fill="none" strokeLinecap="round" />
      </svg>
      <span
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{ boxShadow: `inset 0 0 0 ${Math.max(1.5, size * 0.045)}px #0A0A0F` }}
      />
    </span>
  );
}

// ====== RENDER PURO DEL DISEÑO (editor, export y galería) ======

export function MemeDesign({
  comp,
  interactive,
}: {
  comp: MemeComposition;
  interactive?: { selectedId: string | null; onDown: (e: React.PointerEvent, l: MemeLayer) => void };
}) {
  const bg = MEME_BACKGROUNDS.find((b) => b.id === comp.bg) ?? MEME_BACKGROUNDS[0];
  const selCls = (id: string) =>
    interactive
      ? `cursor-grab ${interactive.selectedId === id ? "outline outline-2 outline-dashed outline-electric" : ""}`
      : "";
  const down = (l: MemeLayer) => (interactive ? (e: React.PointerEvent) => interactive.onDown(e, l) : undefined);
  return (
    <div className="relative overflow-hidden" style={{ width: DW, height: DH, ...bg.css }}>
      {comp.layers.map((l) => {
        const pos: React.CSSProperties = {
          left: `${l.x}%`,
          top: `${l.y}%`,
          transform: `translate(-50%, -50%) rotate(${l.rotate ?? 0}deg)`,
        };
        if (l.kind === "ball") {
          return (
            <div key={l.id} className={`absolute ${selCls(l.id)}`} style={pos} onPointerDown={down(l)}>
              <StageBall code={l.code || "un"} size={l.size} />
            </div>
          );
        }
        if (l.kind === "emoji") {
          return (
            <div key={l.id} className={`absolute select-none leading-none ${selCls(l.id)}`} style={{ ...pos, fontSize: l.size }} onPointerDown={down(l)} aria-hidden>
              {l.emoji}
            </div>
          );
        }
        const outline = l.outline !== false;
        return (
          <div
            key={l.id}
            onPointerDown={down(l)}
            className={`absolute whitespace-pre text-center font-orbitron font-black uppercase leading-tight ${selCls(l.id)}`}
            style={{
              ...pos,
              fontSize: l.size,
              color: l.color || "#FFFFFF",
              WebkitTextStroke: outline ? `${Math.max(1.5, l.size * 0.085)}px #0A0A0F` : undefined,
              paintOrder: "stroke fill",
              textShadow: outline ? "0 3px 10px rgba(0,0,0,0.55)" : "none",
              maxWidth: DW * 0.86,
            }}
          >
            {l.text}
          </div>
        );
      })}
      {/* firma VANGUARD */}
      <div className="absolute bottom-1.5 right-2.5 font-mono text-[9px] uppercase tracking-[0.25em]" style={{ color: "#FFB800" }}>
        vanguard.world
      </div>
    </div>
  );
}

/** Miniatura de galería: escala el diseño al ancho de la tarjeta. */
function MemeThumb({ comp }: { comp: MemeComposition }) {
  const { wrapRef, scale } = useStageScale();
  return (
    <div ref={wrapRef} className="relative w-full overflow-hidden" style={{ height: DH * scale }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: "0 0" }}>
        <MemeDesign comp={comp} />
      </div>
    </div>
  );
}

// ====== PANEL PRINCIPAL ======

const TEXT_COLORS = ["#FFFFFF", "#FFD34D", "#FF3B30", "#00FF87", "#38BDF8", "#C084FC", "#FF6B4D", "#0A0A0F"];

function parseComp(raw: string): MemeComposition | null {
  try {
    const p = JSON.parse(raw);
    if (p && Array.isArray(p.layers)) return { bg: typeof p.bg === "string" ? p.bg : "noche", layers: p.layers };
  } catch {
    /* composición corrupta */
  }
  return null;
}

export function MemeStudioPanel() {
  const alias = useGameStore((s) => s.alias);
  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);

  // prefill desde la tarjeta viral (localStorage) — leído una sola vez en el arranque
  const boot = useMemo(() => {
    let a = "do";
    let b = "us";
    let pre = false;
    try {
      const raw = localStorage.getItem("vanguard_meme_prefill");
      if (raw) {
        const p = JSON.parse(raw);
        localStorage.removeItem("vanguard_meme_prefill");
        if (Array.isArray(p.codes) && p.codes.length) {
          a = p.codes[0];
          b = p.codes[1] ?? "us";
          pre = true;
        }
      }
    } catch {
      /* prefill inválido */
    }
    return { a, b, pre };
  }, []);

  const [view, setView] = useState<"editor" | "galeria">("editor");
  const [bg, setBg] = useState("noche");
  const [layers, setLayers] = useState<MemeLayer[]>(() => buildTemplateLayers(MEME_TEMPLATES[0], boot.a, boot.b));
  const [selected, setSelected] = useState<string | null>(null);
  const [tplId, setTplId] = useState("vs");
  const [codeA, setCodeA] = useState(boot.a);
  const [codeB, setCodeB] = useState(boot.b);
  const [addCode, setAddCode] = useState("ar");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [newText, setNewText] = useState("");
  const [picker, setPicker] = useState<"quicks" | "cast" | "buscar">("quicks");
  const [query, setQuery] = useState("");

  // galería
  const [memes, setMemes] = useState<GalleryMeme[]>([]);
  const [stats, setStats] = useState({ total: 0, today: 0, likes: 0 });
  const [memeOfDay, setMemeOfDay] = useState<GalleryMeme | null>(null);
  const [sort, setSort] = useState<"recent" | "top">("recent");
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [loadingG, setLoadingG] = useState(true);

  const { wrapRef: editorWrapRef, scale } = useStageScale();
  const designRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; offX: number; offY: number } | null>(null);

  const comp: MemeComposition = useMemo(() => ({ bg, layers }), [bg, layers]);
  const sel = layers.find((l) => l.id === selected) ?? null;

  const cargarGaleria = useCallback(async (s: "recent" | "top") => {
    try {
      const res = await fetch(`/api/memes?sort=${s}&limit=48`);
      const data = await res.json();
      setMemes(Array.isArray(data.memes) ? data.memes : []);
      setStats(data.stats || { total: 0, today: 0, likes: 0 });
      setMemeOfDay(data.memeOfDay || null);
    } catch {
      /* sin galería por ahora */
    } finally {
      setLoadingG(false);
    }
  }, []);

  useEffect(() => {
    cargarGaleria(sort);
  }, [cargarGaleria, sort]);

  // ====== EDICIÓN ======

  const applyTemplate = (id: string, a = codeA, b = codeB) => {
    const tpl = MEME_TEMPLATES.find((t) => t.id === id) ?? MEME_TEMPLATES[0];
    setTplId(id);
    setSelected(null);
    if (id === "libre") {
      setLayers([]);
      return;
    }
    setLayers(buildTemplateLayers(tpl, a, b));
    setCaption(tpl.caption(countryName(a) || a.toUpperCase(), countryName(b) || b.toUpperCase()));
  };

  const addBall = (code: string) => {
    const id = newLayerId();
    const n = layers.length;
    setLayers((prev) => [...prev, { id, kind: "ball", code, x: 28 + ((n * 17) % 46), y: 40 + ((n * 23) % 28), size: 130, rotate: 0 }]);
    setSelected(id);
  };

  const addTextPreset = (text: string, x: number, y: number, size: number, color: string) => {
    const id = newLayerId();
    setLayers((prev) => [...prev, { id, kind: "text", text, x, y, size, color, outline: true }]);
    setSelected(id);
  };

  const addTextFree = () => {
    const t = newText.trim();
    if (!t) return;
    addTextPreset(t, 50, 30 + ((layers.length * 11) % 50), 30, "#FFFFFF");
    setNewText("");
  };

  const addEmoji = (emoji: string) => {
    const id = newLayerId();
    const n = layers.length;
    setLayers((prev) => [...prev, { id, kind: "emoji", emoji, x: 35 + ((n * 19) % 34), y: 42 + ((n * 13) % 26), size: 64 }]);
    setSelected(id);
  };

  const patchLayer = (id: string, patch: Partial<MemeLayer>) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const duplicateLayer = (l: MemeLayer) => {
    const id = newLayerId();
    setLayers((prev) => [...prev, { ...l, id, x: Math.min(94, l.x + 4), y: Math.min(92, l.y + 4) }]);
    setSelected(id);
  };

  const deleteLayer = (id: string) => {
    setLayers((prev) => prev.filter((l) => l.id !== id));
    setSelected(null);
  };

  // ====== ARRASTRE ======

  const onLayerDown = (e: React.PointerEvent, l: MemeLayer) => {
    if (view !== "editor") return;
    e.stopPropagation();
    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      /* sin captura */
    }
    const rect = editorWrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    dragRef.current = { id: l.id, offX: px - l.x, offY: py - l.y };
    setSelected(l.id);
    setLayers((prev) => {
      const i = prev.findIndex((x) => x.id === l.id);
      if (i < 0 || i === prev.length - 1) return prev;
      const c = [...prev];
      const [it] = c.splice(i, 1);
      c.push(it);
      return c;
    });
  };

  const onStageMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const rect = editorWrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.min(97, Math.max(3, ((e.clientX - rect.left) / rect.width) * 100 - d.offX));
    const y = Math.min(95, Math.max(5, ((e.clientY - rect.top) / rect.height) * 100 - d.offY));
    setLayers((prev) => prev.map((l) => (l.id === d.id ? { ...l, x, y } : l)));
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  // ====== ACCIONES ======

  const exportarPng = async () => {
    if (!designRef.current || busy) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(designRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        width: DW,
        height: DH,
      });
      const link = document.createElement("a");
      link.download = `vanguard-meme-${tplId}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Meme descargado — publícalo con #VANGUARD");
      recompensarCd("vanguard_meme_dl", 15, "Meme descargado del estudio", addCoins);
    } catch {
      toast.error("No se pudo generar el PNG — inténtalo de nuevo");
    } finally {
      setBusy(false);
    }
  };

  const compartir = async () => {
    const url = typeof window !== "undefined" ? window.location.origin : "https://vanguard.world";
    const texto = `${caption || "Meme geopolítico"} · Hecho en el Estudio de Memes de VANGUARD: ${url}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "VANGUARD — Meme geopolítico", text: texto, url });
        recompensarCd("vanguard_meme_share", 15, "Meme compartido", addCoins);
        return;
      } catch {
        /* cancelado */
      }
    }
    try {
      await navigator.clipboard.writeText(texto);
      toast.success("Texto del meme copiado para compartir");
      recompensarCd("vanguard_meme_share", 15, "Meme compartido", addCoins);
    } catch {
      /* sin permisos */
    }
  };

  const publicar = async () => {
    if (publishing) return;
    if (layers.length === 0) {
      toast.error("Añade al menos un personaje o texto al meme");
      return;
    }
    setPublishing(true);
    try {
      const res = await fetch("/api/memes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: alias || "ANÓNIMO",
          template: tplId,
          caption: caption.slice(0, 140),
          composition: JSON.stringify({ bg, layers }),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "No se pudo publicar el meme");
        return;
      }
      addCoins(25, "Meme publicado en la galería");
      toast.success("+25 monedas — meme publicado en la galería");
      await cargarGaleria(sort);
      setView("galeria");
    } catch {
      toast.error("Error de red al publicar el meme");
    } finally {
      setPublishing(false);
    }
  };

  const toggleLike = async (m: GalleryMeme) => {
    try {
      const wasLiked = likedIds.includes(m.id);
      const res = await fetch(`/api/memes/${m.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voter: alias || "ANÓNIMO" }),
      });
      const data = await res.json();
      if (!res.ok) return;
      setMemes((prev) => prev.map((x) => (x.id === m.id ? { ...x, likes: data.likes } : x)));
      if (memeOfDay?.id === m.id) setMemeOfDay((p) => (p ? { ...p, likes: data.likes } : p));
      if (!wasLiked && data.liked) {
        setLikedIds((prev) => [...prev, m.id]);
        addXp(2);
        toast.success("+2 XP — te gustó un meme");
      } else {
        setLikedIds((prev) => prev.filter((x) => x !== m.id));
      }
    } catch {
      toast.error("No se pudo procesar el like");
    }
  };

  // ====== LISTAS DEL PICKER ======

  const castList = useMemo(() => {
    if (picker !== "buscar") return [];
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return WORLD_FLAGS.filter((c) => c.name.toLowerCase().includes(q) || c.code.includes(q)).slice(0, 36);
  }, [picker, query]);

  const fechaRel = (iso: string) => {
    const d = Date.now() - new Date(iso).getTime();
    const m = Math.floor(d / 60_000);
    if (m < 1) return "ahora";
    if (m < 60) return `hace ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `hace ${h} h`;
    return `hace ${Math.floor(h / 24)} d`;
  };

  return (
    <section className="mt-4 space-y-4" aria-label="Estudio de memes geopolíticos">
      {/* ===== ENCABEZADO ===== */}
      <div className="hud-panel p-5 relative overflow-hidden">
        <div className="hairline-gradient absolute top-0 left-0 right-0 opacity-60" aria-hidden />
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <Laugh className="w-5 h-5 text-violet-400" />
          <h3 className="font-orbitron text-sm tracking-widest uppercase text-gradient">Estudio de Memes — diseña tu meme geopolítico</h3>
          <span className="ml-auto text-[9px] font-mono text-muted-foreground/70 uppercase tracking-wider">v25 · MEMES GEOPOLÍTICOS</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          251 países como personajes arrastrables, 12 plantillas, textos con contorno, stickers y 8 fondos. Publica en la
          galería mundial y gana: <span className="text-green-hud">+25 monedas</span> por publicar,{" "}
          <span className="text-amber">+15</span> por descargar o compartir, <span className="text-electric">+2 XP</span> por cada like que das.
          {boot.pre && <span className="ml-1 text-amber font-bold">· Tarjeta viral cargada en el lienzo</span>}
        </p>
        <div className="mt-3 flex gap-2">
          <Button size="sm" variant={view === "editor" ? "default" : "outline"} onClick={() => setView("editor")} className="gap-2 font-mono text-[11px] uppercase tracking-widest">
            <Palette className="w-4 h-4" /> Estudio
          </Button>
          <Button size="sm" variant={view === "galeria" ? "default" : "outline"} onClick={() => setView("galeria")} className="gap-2 font-mono text-[11px] uppercase tracking-widest">
            <Layers className="w-4 h-4" /> Galería ({stats.total})
          </Button>
        </div>
      </div>

      {view === "editor" ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_360px] items-start">
          {/* ===== COLUMNA IZQUIERDA ===== */}
          <div className="space-y-4 min-w-0">
            {/* PLANTILLAS */}
            <div className="hud-panel p-4">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Plantillas con disposición automática</div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {MEME_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => applyTemplate(t.id)}
                    className={`h-8 rounded-md border text-[9px] font-mono uppercase tracking-wider transition-colors ${
                      tplId === t.id ? "border-violet-400 bg-violet-400/10 text-violet-300" : "border-border text-muted-foreground hover:bg-white/5"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Protagonistas:</span>
                <select value={codeA} onChange={(e) => setCodeA(e.target.value)} className="min-w-0 max-w-[46%] flex-1 sm:flex-none bg-background/60 border border-border rounded-md h-7 px-1.5 text-[10px] font-mono" aria-label="Nación A">
                  {WORLD_FLAGS.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
                <span className="text-[10px] text-muted-foreground">vs</span>
                <select value={codeB} onChange={(e) => setCodeB(e.target.value)} className="min-w-0 max-w-[46%] flex-1 sm:flex-none bg-background/60 border border-border rounded-md h-7 px-1.5 text-[10px] font-mono" aria-label="Nación B">
                  {WORLD_FLAGS.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
                <Button size="sm" variant="outline" onClick={() => applyTemplate(tplId)} className="h-7 px-2 text-[9px] font-mono uppercase tracking-wider">
                  Reaplicar
                </Button>
              </div>
            </div>

            {/* LIENZO */}
            <div className="hud-panel p-4">
              <div className="flex items-center gap-2 mb-2">
                <Move className="w-4 h-4 text-electric" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Lienzo — arrastra para mover, toca para editar</span>
              </div>
              <div
                ref={editorWrapRef}
                className="relative mx-auto max-w-[640px] touch-none select-none overflow-hidden rounded-xl border border-white/10 shadow-2xl"
                style={{ height: DH * scale }}
                onPointerMove={onStageMove}
                onPointerUp={endDrag}
                onPointerLeave={endDrag}
                aria-label="Lienzo del meme"
              >
                <div style={{ transform: `scale(${scale})`, transformOrigin: "0 0" }}>
                  <div ref={designRef} style={{ width: DW, height: DH }}>
                    <MemeDesign comp={comp} interactive={{ selectedId: selected, onDown: onLayerDown }} />
                  </div>
                </div>
                {layers.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground bg-background/70 rounded px-3 py-1.5">
                      Lienzo vacío — añade personajes o aplica una plantilla
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => { setLayers([]); setSelected(null); }} className="gap-1.5 text-[10px] font-mono uppercase tracking-wider border-border">
                  <Trash2 className="w-3.5 h-3.5" /> Limpiar lienzo
                </Button>
                <span className="text-[9px] font-mono text-muted-foreground/70 self-center">{layers.length} capa(s) · {DW}×{DH}</span>
              </div>
            </div>

            {/* CONTROLES DE LA CAPA SELECCIONADA */}
            {sel && (
              <div className="hud-panel p-4">
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                  Capa seleccionada — {sel.kind === "ball" ? `personaje ${countryName(sel.code || "")}` : sel.kind === "emoji" ? "sticker" : "texto"}
                </div>
                {sel.kind === "text" && (
                  <input
                    value={sel.text || ""}
                    onChange={(e) => patchLayer(sel.id, { text: e.target.value })}
                    maxLength={80}
                    className="w-full mb-2 bg-background/60 border border-border rounded-md h-9 px-2 text-xs font-mono"
                    placeholder="Texto del meme"
                    aria-label="Editar texto"
                  />
                )}
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="grid gap-1">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Tamaño ({sel.size}px)</span>
                    <input type="range" min={sel.kind === "ball" ? 40 : 10} max={sel.kind === "ball" ? 300 : sel.kind === "emoji" ? 160 : 110} value={sel.size}
                      onChange={(e) => patchLayer(sel.id, { size: parseInt(e.target.value, 10) })} className="accent-electric" />
                  </label>
                  {sel.kind !== "text" && (
                    <label className="grid gap-1">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Rotación ({sel.rotate ?? 0}°)</span>
                      <input type="range" min={-30} max={30} value={sel.rotate ?? 0}
                        onChange={(e) => patchLayer(sel.id, { rotate: parseInt(e.target.value, 10) })} className="accent-crisis" />
                    </label>
                  )}
                </div>
                {sel.kind === "text" && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mr-1">Color:</span>
                    {TEXT_COLORS.map((c) => (
                      <button key={c} onClick={() => patchLayer(sel.id, { color: c })} aria-label={`Color ${c}`}
                        className={`w-6 h-6 rounded-full border ${sel.color === c ? "border-electric ring-2 ring-electric/40" : "border-white/20"}`}
                        style={{ background: c }} />
                    ))}
                    <button onClick={() => patchLayer(sel.id, { outline: !(sel.outline !== false) })}
                      className={`ml-2 h-7 px-2 rounded-md border text-[9px] font-mono uppercase tracking-wider ${sel.outline !== false ? "border-electric text-electric" : "border-border text-muted-foreground"}`}>
                      Contorno {sel.outline !== false ? "ON" : "OFF"}
                    </button>
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => duplicateLayer(sel)} className="h-8 gap-1.5 text-[10px] font-mono uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" /> Duplicar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteLayer(sel.id)} className="h-8 gap-1.5 text-[10px] font-mono uppercase tracking-wider border-crisis/40 text-crisis hover:bg-crisis/10">
                    <Trash2 className="w-3.5 h-3.5" /> Eliminar capa
                  </Button>
                </div>
              </div>
            )}

            {/* ACCIONES */}
            <div className="hud-panel p-4">
              <label className="grid gap-1.5 mb-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Frase del meme (se publica con la galería)</span>
                <input value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={140}
                  className="bg-background/60 border border-border rounded-md h-9 px-2 text-xs font-mono"
                  placeholder="Ej: la cumbre que nadie esperaba…" aria-label="Frase del meme" />
              </label>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={exportarPng} disabled={busy} className="gap-2 font-mono text-[11px] uppercase tracking-widest">
                  <Download className="w-4 h-4" /> {busy ? "Generando…" : "Descargar PNG +15"}
                </Button>
                <Button size="sm" variant="outline" onClick={compartir} className="gap-2 font-mono text-[11px] uppercase tracking-widest border-amber/40 text-amber hover:bg-amber/10">
                  <Share2 className="w-4 h-4" /> Compartir +15
                </Button>
                <Button size="sm" onClick={publicar} disabled={publishing} className="gap-2 font-mono text-[11px] uppercase tracking-widest bg-violet-500 hover:bg-violet-400">
                  <Upload className="w-4 h-4" /> {publishing ? "Publicando…" : "Publicar en la galería +25"}
                </Button>
              </div>
            </div>
          </div>

          {/* ===== COLUMNA DERECHA: AÑADIR ELEMENTOS ===== */}
          <div className="space-y-4">
            {/* PERSONAJES */}
            <div className="hud-panel p-4">
              <div className="flex items-center gap-2 mb-2">
                <Laugh className="w-4 h-4 text-violet-400" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Personajes (251 países)</span>
              </div>
              <div className="flex gap-1.5 mb-2">
                {(["quicks", "cast", "buscar"] as const).map((p) => (
                  <button key={p} onClick={() => setPicker(p)}
                    className={`h-7 px-2 rounded-md border text-[9px] font-mono uppercase tracking-wider ${picker === p ? "border-violet-400 text-violet-300 bg-violet-400/10" : "border-border text-muted-foreground"}`}>
                    {p === "quicks" ? "Rápidos" : p === "cast" ? "Elenco" : "Buscar"}
                  </button>
                ))}
              </div>
              {picker === "quicks" && (
                <div className="grid grid-cols-8 gap-1 max-h-44 overflow-y-auto pr-1">
                  {(STICKER_CODES_EXPANDED).map((c) => (
                    <button key={c} onClick={() => addBall(c)} title={countryName(c)} className="flex items-center justify-center p-0.5 rounded hover:bg-white/10 transition-colors">
                      <Countryball code={c} size={26} />
                    </button>
                  ))}
                </div>
              )}
              {picker === "cast" && (
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {COUNTRY_CAST.map((c) => (
                    <button key={c.code} onClick={() => addBall(c.code)}
                      className="w-full flex items-start gap-2 p-1.5 rounded-md border border-border/60 hover:border-violet-400/50 hover:bg-violet-400/5 text-left transition-colors">
                      <Countryball code={c.code} size={30} />
                      <span className="min-w-0">
                        <span className="block text-[10px] font-orbitron uppercase tracking-wide text-white/90">{countryName(c.code)}</span>
                        <span className="block text-[9px] text-muted-foreground leading-tight">{c.role}</span>
                        <span className="block text-[9px] text-amber/80 leading-tight">{c.quote}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {picker === "buscar" && (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-muted-foreground" />
                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar país…"
                      className="w-full bg-background/60 border border-border rounded-md h-8 pl-7 pr-2 text-[11px] font-mono" aria-label="Buscar país" />
                  </div>
                  <div className="grid grid-cols-2 gap-1 max-h-44 overflow-y-auto pr-1">
                    {castList.map((c) => (
                      <button key={c.code} onClick={() => addBall(c.code)} className="flex items-center gap-1.5 p-1 rounded hover:bg-white/10 text-left">
                        <Countryball code={c.code} size={20} />
                        <span className="text-[9px] font-mono truncate">{c.name}</span>
                      </button>
                    ))}
                    {query && castList.length === 0 && <span className="text-[10px] text-muted-foreground col-span-2">Sin resultados para “{query}”</span>}
                  </div>
                </div>
              )}
              <div className="mt-2 pt-2 border-t border-border/60 flex items-center gap-1.5">
                <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Añadir directo:</span>
                <select value={addCode} onChange={(e) => setAddCode(e.target.value)} className="bg-background/60 border border-border rounded-md h-7 px-1 text-[10px] font-mono min-w-0 flex-1" aria-label="País a añadir">
                  {WORLD_FLAGS.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
                <Button size="sm" onClick={() => addBall(addCode)} className="h-7 px-2 text-[9px] font-mono uppercase tracking-wider">Añadir</Button>
              </div>
            </div>

            {/* TEXTOS */}
            <div className="hud-panel p-4">
              <div className="flex items-center gap-2 mb-2">
                <TypeIcon className="w-4 h-4 text-amber" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Textos de meme</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 mb-2">
                <Button size="sm" variant="outline" onClick={() => addTextPreset("TITULAR DEL MEME", 50, 12, 44, "#FFFFFF")} className="h-8 text-[9px] font-mono uppercase tracking-wider">Titular</Button>
                <Button size="sm" variant="outline" onClick={() => addTextPreset("VS", 50, 46, 72, "#FF3B30")} className="h-8 text-[9px] font-mono uppercase tracking-wider">VS</Button>
                <Button size="sm" variant="outline" onClick={() => addTextPreset("SUBTÍTULO", 50, 88, 20, "#FFFFFF")} className="h-8 text-[9px] font-mono uppercase tracking-wider">Subtítulo</Button>
                <Button size="sm" variant="outline" onClick={() => addTextPreset("BREAKING NEWS", 50, 8, 34, "#FFD34D")} className="h-8 text-[9px] font-mono uppercase tracking-wider">Breaking</Button>
              </div>
              <div className="flex gap-1.5">
                <input value={newText} onChange={(e) => setNewText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTextFree()}
                  maxLength={80} placeholder="Texto libre…" className="flex-1 min-w-0 bg-background/60 border border-border rounded-md h-8 px-2 text-[11px] font-mono" aria-label="Nuevo texto libre" />
                <Button size="sm" onClick={addTextFree} className="h-8 px-2 text-[9px] font-mono uppercase tracking-wider">Añadir</Button>
              </div>
            </div>

            {/* STICKERS */}
            <div className="hud-panel p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sticker className="w-4 h-4 text-crisis" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Stickers</span>
              </div>
              <div className="grid grid-cols-8 gap-1">
                {MEME_STICKERS.map((s) => (
                  <button key={s} onClick={() => addEmoji(s)} className="h-8 flex items-center justify-center rounded hover:bg-white/10 text-lg transition-colors" aria-label={`Sticker ${s}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* FONDOS */}
            <div className="hud-panel p-4">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-4 h-4 text-green-hud" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Fondos</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {MEME_BACKGROUNDS.map((b) => (
                  <button key={b.id} onClick={() => setBg(b.id)} title={b.label}
                    className={`h-10 rounded-md border-2 overflow-hidden ${bg === b.id ? "border-electric" : "border-white/10"}`} aria-label={`Fondo ${b.label}`}>
                    <span className="block w-full h-full" style={b.css} />
                  </button>
                ))}
              </div>
              <div className="mt-1 text-[9px] font-mono text-muted-foreground/70 uppercase tracking-wider">{MEME_BACKGROUNDS.find((b) => b.id === bg)?.label}</div>
            </div>
          </div>
        </div>
      ) : (
        /* ===== GALERÍA ===== */
        <div className="space-y-4">
          <div className="hud-panel p-4 flex flex-wrap items-center gap-3">
            <div className="flex gap-4 text-center">
              <div><div className="font-orbitron text-lg text-gradient">{stats.total}</div><div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">memes</div></div>
              <div><div className="font-orbitron text-lg text-amber">{stats.today}</div><div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">hoy</div></div>
              <div><div className="font-orbitron text-lg text-crisis">{stats.likes}</div><div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">likes</div></div>
            </div>
            <div className="ml-auto flex gap-1.5">
              <Button size="sm" variant={sort === "recent" ? "default" : "outline"} onClick={() => setSort("recent")} className="h-8 text-[9px] font-mono uppercase tracking-wider">Recientes</Button>
              <Button size="sm" variant={sort === "top" ? "default" : "outline"} onClick={() => setSort("top")} className="h-8 gap-1 text-[9px] font-mono uppercase tracking-wider"><Trophy className="w-3 h-3" /> Top</Button>
              <Button size="sm" variant="outline" onClick={() => setView("editor")} className="h-8 text-[9px] font-mono uppercase tracking-wider">+ Crear meme</Button>
            </div>
          </div>

          {/* MEME DEL DÍA */}
          {memeOfDay && (() => {
            const c = parseComp(memeOfDay.composition);
            if (!c) return null;
            return (
              <div className="hud-panel p-4 border-amber/40">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-4 h-4 text-amber" />
                  <span className="font-orbitron text-[11px] uppercase tracking-widest text-amber">Meme del día</span>
                </div>
                <div className="max-w-md rounded-lg overflow-hidden border border-white/10">
                  <MemeThumb comp={c} />
                </div>
                <div className="mt-2 flex items-center gap-2 text-[10px] font-mono">
                  <span className="text-white/90 font-bold uppercase">{memeOfDay.author}</span>
                  <span className="text-muted-foreground">· {memeOfDay.caption || "sin frase"} · {memeOfDay.likes} ❤</span>
                </div>
              </div>
            );
          })()}

          {loadingG && <div className="hud-panel p-8 text-center text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Cargando galería…</div>}
          {!loadingG && memes.length === 0 && (
            <div className="hud-panel p-8 text-center">
              <Laugh className="w-8 h-8 mx-auto text-violet-400/60 mb-2" />
              <p className="text-xs text-muted-foreground">Aún no hay memes — sé el primero en publicar y gana +25 monedas.</p>
              <Button size="sm" className="mt-3" onClick={() => setView("editor")}>Abrir el estudio</Button>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {memes.filter((m) => m.id !== memeOfDay?.id).map((m) => {
              const c = parseComp(m.composition);
              if (!c) return null;
              const liked = likedIds.includes(m.id);
              return (
                <div key={m.id} className="hud-panel overflow-hidden">
                  <MemeThumb comp={c} />
                  <div className="p-3">
                    <p className="text-[11px] text-white/90 leading-snug min-h-[2.5em]">{m.caption || <span className="text-muted-foreground italic">sin frase</span>}</p>
                    <div className="mt-2 flex items-center gap-2 text-[9px] font-mono uppercase tracking-wider">
                      <span className="text-violet-300 font-bold">{m.author}</span>
                      <span className="text-muted-foreground/70">{fechaRel(m.createdAt)}</span>
                      <button onClick={() => toggleLike(m)}
                        className={`ml-auto flex items-center gap-1 h-7 px-2 rounded-md border transition-colors ${liked ? "border-crisis text-crisis bg-crisis/10" : "border-border text-muted-foreground hover:bg-white/5"}`}
                        aria-label="Me gusta este meme">
                        <Heart className={`w-3.5 h-3.5 ${liked ? "fill-current" : ""}`} /> {m.likes}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

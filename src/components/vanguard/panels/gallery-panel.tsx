"use client";

// Vanguard v7 — Galeria OSINT + FOTOS DEL JUGADOR: publica tus propias fotos
// (+15 monedas, +5 XP) con subida real a /uploads/fotos y miniatura reducida en cliente.
import { useRef, useState } from "react";
import { PHOTOS, CONFLICTS, type AlertLevel } from "@/lib/game-data";
import { useGameStore } from "@/lib/game-store";
import { PanelHeader } from "@/components/vanguard/panel-header";
import {
  Images, X, MapPin, AlertTriangle, Crosshair, Search, Plus, Camera, Loader2, User, BadgeCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FlagBadge } from "@/components/vanguard/flag-badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { sfx } from "@/lib/sound";
import { toast } from "sonner";

const levelColor: Record<AlertLevel, string> = {
  CRITICO: "text-red-hud border-red-hud bg-red-hud/50",
  TENSION: "text-amber border-amber-hud bg-amber-hud/50",
  INESTABILIDAD: "text-violet-hud border-violet-hud bg-violet-hud/50",
  VIGILANCIA: "text-cyan-hud border-cyan-hud bg-cyan-hud/50",
};

// reduce la imagen en cliente (max 1280px, JPEG 0.78) antes de subir
async function shrinkImage(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error("imagen invalida"));
      i.src = url;
    });
    const max = 1280;
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((res, rej) => canvas.toBlob(
      (b) => (b ? res(b) : rej(new Error("blob"))), "image/jpeg", 0.78
    ));
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function GalleryPanel() {
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("ALL");
  const [onlyReal, setOnlyReal] = useState(false);
  const [search, setSearch] = useState("");
  const recordViewPhoto = useGameStore((s) => s.recordViewPhoto);
  const myPhotos = useGameStore((s) => s.myPhotos);
  const publishPhoto = useGameStore((s) => s.publishPhoto);
  const [pubOpen, setPubOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [picked, setPicked] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const photo = PHOTOS.find((p) => p.id === selected);
  const conflict = photo ? CONFLICTS.find((c) => c.id === photo.conflictId) : null;

  const conflicts = ["ALL", ...Array.from(new Set(PHOTOS.map((p) => p.conflictId)))];
  const filtered = PHOTOS.filter((p) => {
    if (onlyReal && !p.real) return false;
    if (filter !== "ALL" && p.conflictId !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      const c = CONFLICTS.find((co) => co.id === p.conflictId);
      return p.title.toLowerCase().includes(q) || p.caption.toLowerCase().includes(q) || c?.country.toLowerCase().includes(q);
    }
    return true;
  });

  const handleView = (id: string) => {
    setSelected(id);
    recordViewPhoto(id);
  };

  const pick = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast.error("Eso no es una imagen");
    if (f.size > 12 * 1024 * 1024) return toast.error("Imagen demasiado grande (max 12 MB)");
    setPicked(f);
    setPreviewUrl(URL.createObjectURL(f));
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, "").slice(0, 50));
  };

  const submitPhoto = async () => {
    if (!picked) return toast.error("Selecciona una foto real");
    if (title.trim().length < 3) return toast.error("Ponle un titulo a la foto");
    setBusy(true);
    try {
      const blob = await shrinkImage(picked);
      const fd = new FormData();
      fd.append("file", new File([blob], "foto.jpg", { type: "image/jpeg" }));
      fd.append("kind", "photo");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Error de subida");
      publishPhoto({ title, country: "OSINT", src: json.url });
      toast.success("¡Foto publicada en la galería! +15 monedas, +5 XP");
      sfx.unlock();
      setPicked(null); setPreviewUrl(null); setTitle(""); setPubOpen(false);
      setFilter("MIS-FOTOS");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo publicar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Galeria OSINT"
        subtitle="Fotogramas verificados · publica tus fotos de campo (+15 monedas)"
        icon={<Images className="w-4 h-4 text-violet-hud" />}
        color="violet"
        right={
          <Button
            size="sm"
            onClick={() => { setPubOpen(true); sfx.click(); }}
            className="h-8 px-2.5 font-mono text-[10px] uppercase bg-violet-hud/80 border border-violet-hud text-white hover:bg-violet-hud"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> PUBLICAR FOTO
          </Button>
        }
      />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por titulo, contexto o pais..."
          className="pl-7 h-8 bg-secondary border-violet-hud/40 font-mono text-xs"
        />
      </div>

      {/* filtro MIS FOTOS + SOLO REALES */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setOnlyReal((v) => !v)}
          className={cn(
            "px-2 py-1 border text-[10px] font-mono uppercase flex items-center gap-1",
            onlyReal
              ? "border-green-hud text-green-hud bg-green-hud/30"
              : "border-green-hud/50 text-green-hud/80 hover:text-green-hud"
          )}
        >
          <BadgeCheck className="w-2.5 h-2.5" /> Solo reales ({PHOTOS.filter((p) => p.real).length})
        </button>
        {myPhotos.length > 0 && (
          <button
            onClick={() => setFilter(filter === "MIS-FOTOS" ? "ALL" : "MIS-FOTOS")}
            className={cn(
              "px-2 py-1 border text-[10px] font-mono uppercase flex items-center gap-1",
              filter === "MIS-FOTOS"
                ? "border-amber-hud text-amber bg-amber-hud/30"
                : "border-amber-hud/50 text-amber/80 hover:text-amber"
            )}
          >
            <User className="w-2.5 h-2.5" /> Mis fotos ({myPhotos.length})
          </button>
        )}
      </div>

      {/* ===== TUS FOTOS (v7) ===== */}
      {filter === "MIS-FOTOS" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {myPhotos.map((p) => (
            <div key={p.id} className="hud-corner overflow-hidden group text-left">
              <div className="aspect-square relative bg-secondary/40 overflow-hidden">
                <img
                  src={p.src}
                  alt={p.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                <span className="absolute top-1.5 left-1.5 text-[8px] font-mono px-1.5 py-0.5 border border-amber-hud bg-amber-hud/80 text-black font-bold uppercase">
                  TU FOTO
                </span>
                <div className="absolute bottom-1.5 left-1.5 right-1.5">
                  <div className="text-[10px] font-mono font-bold text-foreground line-clamp-2 leading-tight">
                    {p.title}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* dialogo de publicacion */}
      <Dialog open={pubOpen} onOpenChange={(o) => { if (!busy) setPubOpen(o); }}>
        <DialogContent className="max-w-md bg-background border-violet-hud">
          <DialogHeader>
            <DialogTitle className="font-mono uppercase text-violet-hud tracking-wider text-sm flex items-center gap-2">
              <Camera className="w-4 h-4" /> Publicar foto OSINT
            </DialogTitle>
            <DialogDescription className="font-mono text-[11px] text-muted-foreground">
              JPG/PNG/WebP (max 12 MB). Recompensa: <b className="text-amber">+15 monedas</b> +5 XP
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {!previewUrl ? (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-violet-hud/40 hover:border-violet-hud hover:bg-violet-hud/10 transition-colors p-8 text-center"
              >
                <Camera className="w-8 h-8 mx-auto mb-2 text-violet-hud" />
                <p className="text-xs font-mono uppercase text-foreground">Selecciona tu foto</p>
              </button>
            ) : (
              <img src={previewUrl} alt="Vista previa" className="w-full max-h-52 object-contain bg-black/40 border border-border" />
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              aria-label="Archivo de foto"
              onChange={(e) => pick(e.target.files?.[0] ?? null)}
            />
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titulo de la foto (obligatorio)"
              maxLength={80}
              className="h-9 bg-background/60 border-border font-mono text-xs"
            />
            <Button
              onClick={submitPhoto}
              disabled={busy}
              className="w-full h-9 font-mono text-[11px] uppercase bg-violet-hud/80 border border-violet-hud text-white hover:bg-violet-hud"
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Plus className="w-3.5 h-3.5 mr-1" />}
              {busy ? "Publicando..." : "PUBLICAR FOTO"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-wrap gap-1.5">
        {conflicts.map((c) => {
          const conflict = CONFLICTS.find((co) => co.id === c);
          return (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={cn(
                "px-2 py-1 border text-[10px] font-mono uppercase",
                filter === c
                  ? "border-violet-hud text-violet-hud bg-violet-hud/50"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {c === "ALL" ? "Todos" : conflict?.country ?? c}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {filtered.map((p) => {
          const c = CONFLICTS.find((co) => co.id === p.conflictId);
          return (
            <motion.button
              key={p.id}
              onClick={() => handleView(p.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="hud-corner overflow-hidden group text-left"
            >
              <div className="aspect-square relative bg-gradient-to-br from-secondary to-background overflow-hidden">
                { }
                <img
                  src={p.image}
                  alt={p.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  style={{ filter: "saturate(0.85) contrast(1.05)" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                <div className="absolute top-1.5 left-1.5 flex gap-1">
                  <span className={cn("text-[8px] font-mono px-1.5 py-0.5 border uppercase", levelColor[p.severity])}>
                    {p.severity}
                  </span>
                  {p.real && (
                    <span className="text-[8px] font-mono px-1.5 py-0.5 border border-green-hud text-green-hud bg-background/70 uppercase flex items-center gap-0.5">
                      <BadgeCheck className="w-2.5 h-2.5" /> REAL
                    </span>
                  )}
                </div>
                <div className="absolute bottom-1.5 left-1.5 right-1.5 pr-1">
                  <div className="text-[9px] font-mono text-amber mb-0.5 flex items-center gap-0.5 truncate">
                    <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                    <span className="truncate">{c?.country}</span>
                  </div>
                  <div className="text-[10px] font-mono font-bold text-foreground line-clamp-2 leading-tight break-words">
                    {p.title}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <Dialog open={!!photo} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="!fixed hud-panel border-violet-hud sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-mono text-violet-hud flex items-center gap-2">
              <Images className="w-5 h-5" /> {photo?.title}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground flex items-center gap-1.5">
              {conflict && <FlagBadge code={conflict.flag} />} {conflict?.country} · {photo?.severity}
            </DialogDescription>
          </DialogHeader>

          {photo && (
            <div className="space-y-3">
              <div className="aspect-video relative hud-corner overflow-hidden">
                { }
                <img
                  src={photo.image}
                  alt={photo.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ filter: "saturate(0.9) contrast(1.05)" }}
                />
                <div className="absolute inset-0 scanline" />
                <div className="absolute top-2 left-2 flex gap-1.5">
                  <span className="text-[10px] font-mono text-amber bg-background/80 px-2 py-0.5 hud-corner border-amber-hud">
                    {photo.real ? "REAL · VERIFICADO" : "OSINT"} · {photo.id}
                  </span>
                </div>
              </div>

              <p className="text-sm text-foreground">{photo.caption}</p>

              <div className="grid sm:grid-cols-2 gap-2">
                <div className="hud-corner p-2 bg-secondary/40">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber" /> Severidad
                  </div>
                  <div className={cn("text-xs font-mono font-bold", levelColor[photo.severity].split(" ")[0])}>
                    {photo.severity}
                  </div>
                </div>
                <div className="hud-corner p-2 bg-secondary/40">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1 flex items-center gap-1">
                    <Crosshair className="w-3 h-3 text-amber" /> Contexto
                  </div>
                  <div className="text-xs text-foreground">{photo.context}</div>
                </div>
              </div>

              <div className="hud-corner p-3 bg-secondary/40">
                <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Evaluacion BDA</div>
                <div className="text-xs text-foreground">{photo.bda}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

// v21.1 ESTUDIO TOTAL — estudio de video COMPLETO dentro de VANGUARD.
// MODO CREAR: 4 escenografías animadas + titulares + countryballs de bandera
//   real (251 países) → GRABAR 8s WebM → publicar a GlobalVision / descargar.
// MODO EDITAR: SUBE tu propio video (selector o arrastrar y soltar) →
//   RECORTAR (inicio/fin), 8 FILTROS, titulares, VELOCIDAD y STICKERS
//   arrastrables/redimensionables → EXPORTAR WebM CON AUDIO → publicar
//   y/o descargar. El archivo original también se puede descargar.
//
// Publicación real vía /api/upload (mp4/webm + miniatura) → public/uploads.

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGameStore } from "@/lib/game-store";
import { useProfileStore } from "@/lib/profile-store";
import { Countryball, COUNTRYBALLS } from "@/components/vanguard/countryball";
import { WORLD_FLAGS, countryName } from "@/lib/world-data";
import { toast } from "sonner";
import {
  Clapperboard, Circle, Square, Download, Palette, Type, Sparkles,
  Scissors, Trash2, Film, Play, Pause, UploadCloud, Upload, Move, SlidersHorizontal,
} from "lucide-react";

// ================= ENGINE: countryballs de bandera real en canvas =================

const flagCache = new Map<string, HTMLImageElement>();
function flagImg(code: string): HTMLImageElement | null {
  let img = flagCache.get(code);
  if (!img) {
    img = new Image();
    img.crossOrigin = "anonymous"; // flagcdn sirve CORS * → el canvas no se contamina
    img.src = `https://flagcdn.com/w160/${code}.png`;
    flagCache.set(code, img);
  }
  return img.complete && img.naturalWidth > 0 ? img : null;
}

/** Dibuja una countryball de BANDERA REAL (fallback: franjas v19) sobre el canvas. */
function drawBall(ctx: CanvasRenderingContext2D, code: string, cx: number, cy: number, r: number) {
  const img = flagImg(code);
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  if (img) {
    const s = Math.max((2 * r) / img.naturalWidth, (2 * r) / img.naturalHeight);
    const w = img.naturalWidth * s;
    const h = img.naturalHeight * s;
    ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
  } else {
    const def = COUNTRYBALLS.find((c) => c.code === code);
    if (def) {
      const n = def.stripes.length;
      def.stripes.forEach((c, i) => {
        ctx.fillStyle = c;
        if (def.vertical) ctx.fillRect(cx - r + ((2 * r) / n) * i, cy - r, (2 * r) / n + 1, 2 * r);
        else ctx.fillRect(cx - r, cy - r + ((2 * r) / n) * i, 2 * r, (2 * r) / n + 1);
      });
      if (def.canton) { ctx.fillStyle = def.canton; ctx.fillRect(cx - r, cy - r, r, r); }
      if (def.emblem) { ctx.fillStyle = def.emblem; ctx.beginPath(); ctx.arc(cx, cy, r * 0.35, 0, Math.PI * 2); ctx.fill(); }
      if (def.star) { ctx.fillStyle = def.star; ctx.beginPath(); ctx.arc(cx - r * 0.2, cy - r * 0.2, r * 0.3, 0, Math.PI * 2); ctx.fill(); }
    } else {
      ctx.fillStyle = "#3A3F4A";
      ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
    }
  }
  // ojos + cejas enfadadas (estilo polandball, escala sobre viewBox 64 → r=32)
  const k = r / 32;
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.ellipse(cx + 9.5 * k, cy - 7.5 * k, 7 * k, 8 * k, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 23 * k, cy - 7.5 * k, 6 * k, 7 * k, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#101010";
  ctx.beginPath(); ctx.arc(cx + 11 * k, cy - 6.5 * k, 2.9 * k, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 24.5 * k, cy - 6.5 * k, 2.7 * k, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#101010"; ctx.lineWidth = 2.6 * k; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(cx + 3 * k, cy - 15.5 * k); ctx.quadraticCurveTo(cx + 9 * k, cy - 19 * k, cx + 14 * k, cy - 16 * k); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + 18 * k, cy - 17.5 * k); ctx.quadraticCurveTo(cx + 23 * k, cy - 19 * k, cx + 27 * k, cy - 16 * k); ctx.stroke();
  // sombreado esférico
  const sh = ctx.createRadialGradient(cx - r * 0.4, cy - r * 0.45, r * 0.2, cx, cy, r);
  sh.addColorStop(0, "rgba(255,255,255,0.18)");
  sh.addColorStop(0.55, "rgba(0,0,0,0)");
  sh.addColorStop(1, "rgba(0,0,0,0.38)");
  ctx.fillStyle = sh;
  ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
  ctx.restore();
  ctx.strokeStyle = "#0A0A0F";
  ctx.lineWidth = Math.max(2, r * 0.09);
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
}

// ================= CONSTANTES =================

type Scene = "war" | "battle" | "breaking" | "globe";
const SCENES: { id: Scene; label: string; desc: string }[] = [
  { id: "war", label: "MAPA DE GUERRA", desc: "Frentes pulsantes y arcos de conflicto" },
  { id: "battle", label: "BATALLA", desc: "Silueta de tanques y trazadoras nocturnas" },
  { id: "breaking", label: "BREAKING NEWS", desc: "Cinta roja de última hora en vivo" },
  { id: "globe", label: "GLOBO 3D", desc: "Giro mundial con malla táctica" },
];
const PALETTES = [
  { id: "blue", label: "Eléctrico", main: "#1E90FF", accent: "#00FF87" },
  { id: "red", label: "Crisis", main: "#FF3B30", accent: "#FFD60A" },
  { id: "gold", label: "Premium", main: "#d4af37", accent: "#F0F0F0" },
  { id: "green", label: "Comando", main: "#00FF87", accent: "#1E90FF" },
];
const FILTERS = [
  { id: "none", label: "Original", css: "none" },
  { id: "noir", label: "Noir", css: "grayscale(1) contrast(1.2)" },
  { id: "archivo", label: "Archivo", css: "sepia(0.85) contrast(1.05)" },
  { id: "crisis", label: "Crisis", css: "saturate(1.7) hue-rotate(-15deg)" },
  { id: "tactico", label: "Táctico", css: "hue-rotate(15deg) brightness(1.05) saturate(0.85)" },
  { id: "nvision", label: "Visión noct.", css: "grayscale(1) sepia(1) hue-rotate(60deg) saturate(4) brightness(1.15)" },
  { id: "negativo", label: "Negativo", css: "invert(1)" },
  { id: "comic", label: "Cómic", css: "contrast(2.2) saturate(1.9)" },
];
const SPEEDS = [0.5, 1, 1.5, 2];
const CATEGORIES = ["DIRECTO", "COMBATE", "DIPLOMACIA", "TECNOLOGIA", "HUMANITARIO", "HISTORIA"] as const;
type Cat = (typeof CATEGORIES)[number];

// v21.1 idea del AGENTE DE MEJORA (#5-2, esfuerzo S): plantillas de un clic
const TEMPLATES: { id: string; label: string; title: string; subtitle: string; pal: (typeof PALETTES)[number]; scene?: Scene; filter?: string }[] = [
  { id: "urgente", label: "ÚLTIMA HORA", title: "ÚLTIMA HORA: TENSIÓN MUNDIAL", subtitle: "Cobertura especial — Vanguard", pal: PALETTES[1], scene: "breaking", filter: "none" },
  { id: "analisis", label: "ANÁLISIS", title: "ANÁLISIS: EL TABLERO GLOBAL", subtitle: "Qué está pasando y por qué", pal: PALETTES[0], scene: "war", filter: "none" },
  { id: "batalla", label: "BATALLA", title: "COMBATE EN EL FRENTE ORIENTAL", subtitle: "Imágenes de la línea de fuego", pal: PALETTES[1], scene: "battle", filter: "noir" },
  { id: "archivo", label: "ARCHIVO", title: "DOCUMENTAL: HISTORIA SECRETA", subtitle: "Imágenes recuperadas del archivo", pal: PALETTES[2], scene: "globe", filter: "archivo" },
  { id: "comando", label: "COMANDO", title: "OPERACIÓN NOCTURNA EN CURSO", subtitle: "Transmisión cifrada del mando", pal: PALETTES[3], scene: "battle", filter: "nvision" },
  { id: "meme", label: "MEME", title: "¿QUIÉN GANARÍA ESTA GUERRA?", subtitle: "Tú decides — vota en comentarios", pal: PALETTES[0], scene: "globe", filter: "comic" },
];

// v22 ESTILO INSHOT: stickers de countryball (kind "ball") O TEXTO LIBRE (kind "text")
interface Sticker { id: number; code: string; x: number; y: number; r: number; kind?: "ball" | "text"; text?: string; }

const REC_SECONDS = 8;
const CW = 880, CH = 495;

const fmt = (t: number) => {
  if (!isFinite(t) || t < 0) t = 0;
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

function pickMime(): { mime: string; ext: string } {
  const candidates: { mime: string; ext: string }[] = [
    { mime: "video/webm;codecs=vp9,opus", ext: "webm" },
    { mime: "video/webm;codecs=vp8,opus", ext: "webm" },
    { mime: "video/webm", ext: "webm" },
    { mime: "video/mp4", ext: "mp4" },
  ];
  for (const c of candidates) {
    try { if (MediaRecorder.isTypeSupported(c.mime)) return c; } catch { /* ignore */ }
  }
  return { mime: "", ext: "webm" };
}

async function uploadFile(file: Blob | File, kind: "video" | "thumb"): Promise<string> {
  const fd = new FormData();
  const name = kind === "thumb"
    ? "thumb.jpg"
    : (file instanceof File && file.name) || "video.webm";
  fd.append("file", file, name);
  fd.append("kind", kind);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error ?? "Error de subida");
  return json.url as string;
}

// ================= COMPONENTE =================

export function EstudioPanel() {
  const [mode, setMode] = useState<"crear" | "editar">("crear");
  const [pal, setPal] = useState(PALETTES[0]);
  const [title, setTitle] = useState("ÚLTIMA HORA: EL MUNDO EN TENSIÓN");
  const [subtitle, setSubtitle] = useState("Análisis en vivo — Vanguard Estudio");
  const [stickers, setStickers] = useState<Sticker[]>([{ id: 1, code: "us", x: CW - 110, y: CH - 130, r: 34 }]);
  const [selId, setSelId] = useState<number | null>(1);
  const [showOverlay, setShowOverlay] = useState(true);
  const [category, setCategory] = useState<Cat>("DIRECTO");
  const [pickerQuery, setPickerQuery] = useState("");

  // CREAR
  const [scene, setScene] = useState<Scene>("war");
  const [recording, setRecording] = useState(false);
  const [recSecs, setRecSecs] = useState(0);
  const [lastUrl, setLastUrl] = useState<string | null>(null);
  const [lastExt, setLastExt] = useState("webm");

  // EDITAR
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoName, setVideoName] = useState("");
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [filter, setFilter] = useState<string>("none");
  // v22 AJUSTES estilo InShot: brillo/contraste/saturación combinables con el filtro
  const [adj, setAdj] = useState({ b: 100, c: 100, s: 100 });
  const filterCss = (() => {
    const base = FILTERS.find((f) => f.id === filter)?.css ?? "none";
    const tweak = `brightness(${adj.b / 100}) contrast(${adj.c / 100}) saturate(${adj.s / 100})`;
    const neutral = adj.b === 100 && adj.c === 100 && adj.s === 100;
    if (base === "none") return neutral ? "none" : tweak;
    return neutral ? base : `${base} ${tweak}`;
  })();
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportPct, setExportPct] = useState(0);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const dragRef = useRef<{ id: number; dx: number; dy: number } | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const audioVideoRef = useRef<HTMLVideoElement | null>(null);
  const monitorRef = useRef(0);

  const [canRecord] = useState(
    () => typeof MediaRecorder !== "undefined" &&
      typeof HTMLCanvasElement !== "undefined" &&
      typeof HTMLCanvasElement.prototype.captureStream === "function"
  );

  const cbAvatar = useProfileStore((s) => s.cbAvatar);
  const publishVideo = useGameStore((s) => s.publishVideo);
  const addXp = useGameStore((s) => s.addXp);
  const addCoins = useGameStore((s) => s.addCoins);

  // ================= MOTOR DE ESCENAS (CREAR) =================
  const drawScene = useCallback((ctx: CanvasRenderingContext2D, t: number) => {
    const W = CW, H = CH;
    if (scene === "war") {
      const pts: [number, number][] = [[0.2, 0.4], [0.5, 0.55], [0.78, 0.35], [0.36, 0.7], [0.66, 0.66]];
      for (const [px, py] of pts) {
        const pulse = 6 + Math.sin(t * 0.05 + px * 10) * 3;
        ctx.fillStyle = "rgba(255,59,48,0.8)";
        ctx.beginPath(); ctx.arc(px * W, py * H, pulse, 0, Math.PI * 2); ctx.fill();
        for (const [qx, qy] of pts) {
          if (px < qx) {
            ctx.strokeStyle = "rgba(30,144,255,0.25)";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(px * W, py * H);
            ctx.quadraticCurveTo(((px + qx) / 2) * W, Math.min(py, qy) * H - 40, qx * W, qy * H);
            ctx.stroke();
          }
        }
      }
      ctx.strokeStyle = "rgba(30,144,255,0.08)";
      for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    } else if (scene === "battle") {
      ctx.fillStyle = "#131824";
      ctx.fillRect(0, H * 0.72, W, H * 0.28);
      for (let i = 0; i < 4; i++) {
        const bx = (0.12 + i * 0.22) * W + Math.sin(t * 0.02 + i) * 8;
        ctx.fillStyle = "#050608";
        ctx.fillRect(bx, H * 0.78, 64, 16);
        ctx.fillRect(bx + 18, H * 0.74, 28, 8);
        ctx.strokeStyle = "#050608"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(bx + 32, H * 0.76); ctx.lineTo(bx + 58, H * 0.76); ctx.stroke();
      }
      for (let i = 0; i < 5; i++) {
        const p = ((t * 2 + i * 90) % 300) / 300;
        ctx.strokeStyle = `rgba(255,200,80,${1 - p})`;
        ctx.beginPath();
        ctx.moveTo(W * 0.15 + i * W * 0.15, H * 0.76);
        ctx.lineTo(W * 0.15 + i * W * 0.15 + p * 90, H * 0.76 - p * 110);
        ctx.stroke();
      }
    } else if (scene === "breaking") {
      ctx.save();
      ctx.translate((t * 1.5) % 80, 0);
      for (let x = -80; x < W + 80; x += 40) {
        ctx.fillStyle = "rgba(255,59,48,0.08)";
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 18, 0); ctx.lineTo(x + 18 - H, H); ctx.lineTo(x - H, H); ctx.fill();
      }
      ctx.restore();
      ctx.fillStyle = "rgba(255,59,48,0.15)";
      ctx.fillRect(0, 0, W, H);
    } else {
      const cx = W / 2, cy = H * 0.52, R = H * 0.4;
      ctx.strokeStyle = "rgba(30,144,255,0.5)";
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
      for (let i = 1; i < 6; i++) {
        ctx.beginPath(); ctx.ellipse(cx, cy, R * (i / 6), R, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(cx, cy, R, R * (i / 6), 0, 0, Math.PI * 2); ctx.stroke();
      }
      const spin = t * 0.012;
      for (let i = 0; i < 8; i++) {
        const a = spin + i * (Math.PI / 4);
        const px = cx + Math.cos(a) * R * 0.85;
        const py = cy + Math.sin(a) * R * 0.35;
        ctx.fillStyle = "rgba(255,59,48,0.85)";
        ctx.beginPath(); ctx.arc(px, py, 3.4, 0, Math.PI * 2); ctx.fill();
      }
    }
  }, [scene]);

  // ================= BUCLE DE RENDER PRINCIPAL =================
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let t = 0;

    const frame = () => {
      t++;
      const W = CW, H = CH;
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#0A0A0F"); bg.addColorStop(1, "#10141f");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      ctx.filter = "none";

      if (mode === "editar") {
        const v = videoRef.current;
        if (v && videoUrl && v.readyState >= 2) {
          const vw = v.videoWidth || 16, vh = v.videoHeight || 9;
          const scale = Math.min(W / vw, H / vh);
          const dw = vw * scale, dh = vh * scale;
          ctx.save();
          ctx.filter = filterCss; // v22: filtro + ajustes InShot combinados
          ctx.drawImage(v, (W - dw) / 2, (H - dh) / 2, dw, dh);
          ctx.restore();
          ctx.filter = "none";
          // bucle dentro del recorte (solo en previsualización)
          if (!exporting && trimEnd > trimStart && v.currentTime >= trimEnd - 0.03) {
            v.currentTime = trimStart;
          }
        } else {
          ctx.fillStyle = "rgba(255,255,255,0.55)";
          ctx.font = "bold 26px Arial";
          ctx.textAlign = "center";
          ctx.fillText("SUBE UN VIDEO PARA EDITARLO", W / 2, H / 2 - 12);
          ctx.font = "14px monospace";
          ctx.fillStyle = "rgba(255,255,255,0.3)";
          ctx.fillText("clic en la zona de carga · o arrástralo aquí · mp4 / webm / mov", W / 2, H / 2 + 18);
          ctx.textAlign = "left";
        }
      } else {
        drawScene(ctx, t);
        // scanlines solo en estudio virtual
        ctx.fillStyle = "rgba(0,0,0,0.16)";
        for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);
      }

      // banda de titulares
      if (showOverlay) {
        const band = ctx.createLinearGradient(0, 0, W, 0);
        band.addColorStop(0, pal.main); band.addColorStop(1, "transparent");
        ctx.fillStyle = band;
        ctx.fillRect(0, H * 0.13, W * 0.82, 44);
        ctx.fillStyle = "#F0F0F0";
        ctx.font = "bold 24px Arial";
        ctx.fillText(title.slice(0, 42).toUpperCase(), 18, H * 0.13 + 30);
        const subY = mode === "editar" ? H - 30 : H - 58;
        ctx.fillStyle = "rgba(10,10,15,0.82)";
        ctx.fillRect(0, subY, W, mode === "editar" ? 26 : 40);
        ctx.fillStyle = pal.accent;
        ctx.font = "bold 14px monospace";
        ctx.fillText("▮ " + subtitle.slice(0, 60), 14, subY + 18);
        if (mode === "crear") {
          ctx.fillStyle = "#FF3B30";
          ctx.fillRect(0, H - 18, W, 18);
          ctx.fillStyle = "#fff";
          ctx.font = "bold 11px monospace";
          const tick = "EN VIVO · VANGUARD ESTUDIO · " + new Date().toLocaleTimeString("es") + " · ";
          const off = (t * 1.2) % 400;
          ctx.fillText((tick + tick + tick).slice(0, 90), 12 - off, H - 5);
        }
      }

      // barra de recorte (EDITAR)
      if (mode === "editar" && duration > 0) {
        const barY = H - 12;
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.fillRect(0, barY, W, 7);
        const x0 = (trimStart / duration) * W;
        const x1 = (trimEnd / duration) * W;
        ctx.fillStyle = pal.main;
        ctx.fillRect(x0, barY, Math.max(2, x1 - x0), 7);
        const v = videoRef.current;
        if (v && v.readyState >= 2) {
          ctx.fillStyle = "#fff";
          ctx.fillRect(Math.min(W - 2, (v.currentTime / duration) * W), barY - 2, 2, 11);
        }
      }

      // stickers (countryballs de bandera real + TEXTO LIBRE v22)
      for (const s of stickers) {
        const bob = mode === "crear" ? Math.sin(t * 0.06 + s.id) * 6 : 0;
        if (s.kind === "text") {
          // ---- sticker de TEXTO editable ----
          const fs = Math.max(12, Math.round(s.r * 0.72));
          const txt = (s.text ?? "TEXTO").slice(0, 28);
          ctx.font = `bold ${fs}px Arial`;
          const tw = ctx.measureText(txt).width;
          const bw = tw + 22, bh = fs + 16;
          const bx = s.x - bw / 2, by = s.y + bob - bh / 2;
          ctx.fillStyle = "rgba(10,10,15,0.85)";
          ctx.fillRect(bx, by, bw, bh);
          ctx.fillStyle = pal.main;
          ctx.fillRect(bx, by, 4, bh);
          ctx.fillStyle = "#F0F0F0";
          ctx.textAlign = "center";
          ctx.fillText(txt, s.x, s.y + bob + fs * 0.36);
          ctx.textAlign = "left";
          if (s.id === selId) {
            ctx.strokeStyle = pal.accent;
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.strokeRect(bx - 5, by - 5, bw + 10, bh + 10);
            ctx.setLineDash([]);
          }
        } else {
          drawBall(ctx, s.code, s.x, s.y + bob, s.r);
          if (s.id === selId) {
            ctx.strokeStyle = pal.accent;
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.beginPath(); ctx.arc(s.x, s.y + bob, s.r + 7, 0, Math.PI * 2); ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = "rgba(10,10,15,0.75)";
            ctx.fillRect(s.x - s.r, s.y + bob + s.r + 10, s.r * 2, 14);
            ctx.fillStyle = pal.accent;
            ctx.font = "bold 9px monospace";
            ctx.textAlign = "center";
            ctx.fillText((countryName(s.code) || s.code).toUpperCase().slice(0, 18), s.x, s.y + bob + s.r + 20);
            ctx.textAlign = "left";
          }
        }
      }

      // indicador REC / EXPORTANDO
      if (recording || exporting) {
        const secs = recording ? recSecs : Math.ceil(trimEnd - trimStart - (trimEnd - trimStart) * (exportPct / 100));
        ctx.fillStyle = "rgba(255,59,48,0.9)";
        ctx.beginPath(); ctx.arc(W - 66, 24, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "bold 13px monospace";
        ctx.fillText(`${recording ? "REC" : "EXP"} ${String(Math.max(0, secs)).padStart(2, "0")}s`, W - 52, 29);
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [mode, scene, pal, title, subtitle, stickers, selId, showOverlay, filter, filterCss, duration, trimStart, trimEnd, recording, recSecs, exporting, exportPct, videoUrl, drawScene]);

  // ================= ARRASTRE DE STICKERS SOBRE EL LIENZO =================
  const canvasPos = (e: React.PointerEvent) => {
    const cv = canvasRef.current!;
    const rect = cv.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * cv.width,
      y: ((e.clientY - rect.top) / rect.height) * cv.height,
    };
  };
  const onPointerDown = (e: React.PointerEvent) => {
    const p = canvasPos(e);
    for (let i = stickers.length - 1; i >= 0; i--) {
      const s = stickers[i];
      // v22: hit-test distinto para TEXTO (caja) y bolas (círculo)
      const hit = s.kind === "text"
        ? (() => {
            const fs = Math.max(12, Math.round(s.r * 0.72));
            const w = (s.text ?? "TEXTO").slice(0, 28).length * fs * 0.62 + 30;
            const h = fs + 24;
            return Math.abs(p.x - s.x) <= w / 2 && Math.abs(p.y - s.y) <= h / 2;
          })()
        : Math.hypot(p.x - s.x, p.y - s.y) <= s.r + 8;
      if (hit) {
        dragRef.current = { id: s.id, dx: p.x - s.x, dy: p.y - s.y };
        setSelId(s.id);
        try { canvasRef.current?.setPointerCapture(e.pointerId); } catch { /* ignore */ }
        return;
      }
    }
    setSelId(null);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const p = canvasPos(e);
    setStickers((ss) => ss.map((s) => s.id === d.id
      ? { ...s, x: Math.min(CW - s.r, Math.max(s.r, p.x - d.dx)), y: Math.min(CH - s.r, Math.max(s.r, p.y - d.dy)) }
      : s
    ));
  };
  const onPointerUp = () => { dragRef.current = null; };

  // ================= GESTIÓN DE PERSONAJES =================
  const addSticker = (code: string) => {
    const id = Math.floor(Math.random() * 900000) + 100;
    const r = stickers.find((s) => s.id === selId)?.r ?? 34;
    setStickers((ss) => [...ss, { id, code, x: 180 + Math.random() * 420, y: 160 + Math.random() * 180, r }]);
    setSelId(id);
    toast.success(`Personaje en escena: ${countryName(code)}`);
  };
  // v22: sticker de TEXTO LIBRE (estilo InShot) — arrastrable, escalable y editable
  const addTextSticker = () => {
    const id = Math.floor(Math.random() * 900000) + 100;
    setStickers((ss) => [...ss, { id, code: cbAvatar, kind: "text", text: "TEXTO NUEVO", x: CW / 2 + (Math.random() * 140 - 70), y: CH / 2 + (Math.random() * 90 - 45), r: 36 }]);
    setSelId(id);
    toast.success("Texto añadido — arrástralo y edítalo aquí abajo");
  };
  const removeSelected = () => {
    if (selId == null) return;
    setStickers((ss) => ss.filter((s) => s.id !== selId));
    setSelId(null);
  };
  const resizeSelected = (r: number) => setStickers((ss) => ss.map((s) => (s.id === selId ? { ...s, r } : s)));

  const applyTemplate = (t: (typeof TEMPLATES)[number]) => {
    setTitle(t.title);
    setSubtitle(t.subtitle);
    setPal(t.pal);
    if (t.scene) setScene(t.scene);
    if (t.filter) setFilter(t.filter);
    toast.success(`Plantilla aplicada: ${t.label}`);
  };

  const filteredCountries = WORLD_FLAGS.filter((f) => {
    const q = pickerQuery.trim().toLowerCase();
    if (!q) return true;
    return f.name.toLowerCase().includes(q) || f.code.includes(q);
  }).slice(0, 84);

  // ================= CARGA DE VIDEO (EDITAR) =================
  const loadFile = useCallback((f: File) => {
    if (!f.type.startsWith("video/")) {
      toast.error("Ese archivo no es un video — usa mp4, webm o mov");
      return;
    }
    if (f.size > 30 * 1024 * 1024) {
      toast.error("Video demasiado grande (máximo 30 MB)");
      return;
    }
    setVideoUrl((old) => { if (old) URL.revokeObjectURL(old); return URL.createObjectURL(f); });
    setVideoName(f.name);
    setDuration(0); setTrimStart(0); setTrimEnd(0);
    setExportUrl(null); setPlaying(false); setExporting(false);
    toast.success(`Video cargado: ${f.name}`, { description: `${(f.size / 1048576).toFixed(1)} MB · ya puedes editarlo` });
  }, []);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) loadFile(f);
    e.currentTarget.value = "";
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && mode === "editar") loadFile(f);
  };

  // audio del video → flujo de grabación (se crea UNA vez por elemento)
  const ensureAudio = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (audioCtxRef.current && audioVideoRef.current === v) return;
    try { audioCtxRef.current?.close(); } catch { /* ignore */ }
    try {
      const actx = new AudioContext();
      const srcN = actx.createMediaElementSource(v);
      const dest = actx.createMediaStreamDestination();
      srcN.connect(dest);
      srcN.connect(actx.destination);
      audioCtxRef.current = actx;
      audioDestRef.current = dest;
      audioVideoRef.current = v;
    } catch (err) {
      console.warn("audio graph", err);
    }
  }, []);

  const togglePlay = useCallback(async () => {
    const v = videoRef.current;
    if (!v || !videoUrl) return;
    if (v.paused) {
      v.playbackRate = speed;
      if (trimEnd > trimStart && (v.currentTime < trimStart || v.currentTime >= trimEnd)) {
        v.currentTime = trimStart;
      }
      try { await v.play(); } catch { /* ignore */ }
    } else {
      v.pause();
    }
  }, [videoUrl, speed, trimStart, trimEnd]);

  // ================= PUBLICAR (subida real a /api/upload) =================
  const publishBlob = useCallback(async (blob: Blob, thumbCanvas: HTMLCanvasElement, dur: number, country: string) => {
    setPublishing(true);
    try {
      let src = URL.createObjectURL(blob);
      let thumb = thumbCanvas.toDataURL("image/jpeg", 0.7);
      try {
        src = await uploadFile(blob, "video");
        const tb = await new Promise<Blob | null>((res) => thumbCanvas.toBlob((b) => res(b), "image/jpeg", 0.72));
        if (tb) thumb = await uploadFile(tb, "thumb");
      } catch {
        toast.warning("Servidor de subida no disponible — se publica solo en tu sesión");
      }
      publishVideo({
        title: title.slice(0, 80),
        desc: subtitle.slice(0, 140),
        country: country.toUpperCase().slice(0, 2),
        category,
        src, thumb, durationSec: Math.max(1, Math.round(dur)),
      });
      addXp(60);
      addCoins(50, "Video publicado en GlobalVision");
      toast.success("¡Video publicado en GlobalVision! +60 XP · +50 ◉");
    } finally {
      setPublishing(false);
    }
  }, [title, subtitle, category, publishVideo, addXp, addCoins]);

  // ================= GRABAR (CREAR · 8s) =================
  const startRec = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv || !canRecord) {
      toast.error("Tu navegador no soporta grabación de lienzo");
      return;
    }
    try {
      const { mime, ext } = pickMime();
      const stream = cv.captureStream(30);
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 2_500_000 } : { videoBitsPerSecond: 2_500_000 });
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mime.split(";")[0] || "video/webm" });
        const url = URL.createObjectURL(blob);
        setLastUrl(url);
        setLastExt(ext);
        publishBlob(blob, cv, REC_SECONDS, stickers[0]?.code ?? cbAvatar);
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
      setRecSecs(REC_SECONDS);
      const iv = setInterval(() => {
        setRecSecs((s) => {
          if (s <= 1) {
            clearInterval(iv);
            rec.stop();
            setRecording(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } catch {
      toast.error("Error al iniciar la grabación");
      setRecording(false);
    }
  }, [canRecord, stickers, cbAvatar, publishBlob]);

  const stopRec = useCallback(() => {
    recorderRef.current?.stop();
    setRecording(false);
  }, []);

  // ================= EXPORTAR (EDITAR · recorte con AUDIO) =================
  const exportEdited = useCallback(async () => {
    const cv = canvasRef.current;
    const v = videoRef.current;
    if (!cv || !v || !videoUrl) return;
    if (!canRecord) {
      toast.error("Tu navegador no soporta exportación de video");
      return;
    }
    if (trimEnd - trimStart < 0.5) {
      toast.error("El recorte es demasiado corto (mínimo 0.5 s)");
      return;
    }
    try {
      ensureAudio();
      if (audioCtxRef.current?.state === "suspended") await audioCtxRef.current.resume();
      v.pause();
      v.currentTime = trimStart;
      await new Promise<void>((res) => {
        const h = () => { v.removeEventListener("seeked", h); res(); };
        v.addEventListener("seeked", h);
        setTimeout(res, 900);
      });
      const { mime, ext } = pickMime();
      const stream = cv.captureStream(30);
      audioDestRef.current?.stream.getAudioTracks().forEach((tr) => stream.addTrack(tr));
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 3_000_000 } : { videoBitsPerSecond: 3_000_000 });
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mime.split(";")[0] || "video/webm" });
        const url = URL.createObjectURL(blob);
        setExportUrl(url);
        setLastExt(ext);
        setExporting(false);
        setExportPct(0);
        setPlaying(false);
        toast.success(`Video exportado (${(blob.size / 1048576).toFixed(1)} MB) — descárgalo o publícalo`, {
          description: fmt(trimEnd - trimStart) + " de video con audio",
        });
      };
      recorderRef.current = rec;
      setExporting(true);
      setExportPct(0);
      rec.start(250);
      v.playbackRate = speed;
      await v.play();
      const monitor = () => {
        if (!recorderRef.current) return;
        const seg = trimEnd - trimStart;
        setExportPct(Math.min(100, Math.max(0, ((v.currentTime - trimStart) / seg) * 100)));
        if (v.currentTime >= trimEnd || v.ended) {
          v.pause();
          const r = recorderRef.current;
          recorderRef.current = null;
          r.stop();
          return;
        }
        monitorRef.current = requestAnimationFrame(monitor);
      };
      monitorRef.current = requestAnimationFrame(monitor);
    } catch (err) {
      console.error("export", err);
      toast.error("No se pudo exportar (posible restricción del navegador)");
      setExporting(false);
    }
  }, [videoUrl, canRecord, trimStart, trimEnd, speed, ensureAudio]);

  const publishEdited = useCallback(async () => {
    if (!exportUrl || !canvasRef.current || publishing) return;
    try {
      const blob = await (await fetch(exportUrl)).blob();
      await publishBlob(blob, canvasRef.current, trimEnd - trimStart, stickers[0]?.code ?? cbAvatar);
    } catch {
      toast.error("No se pudo publicar el video editado");
    }
  }, [exportUrl, publishing, trimStart, trimEnd, stickers, cbAvatar, publishBlob]);

  const sel = stickers.find((s) => s.id === selId) ?? null;

  // ================= INTERFAZ =================
  return (
    <div className="space-y-3">
      {/* selector de modo */}
      <div className="grid grid-cols-2 gap-2 max-w-md" role="tablist" aria-label="Modo del estudio">
        <Button
          onClick={() => setMode("crear")}
          variant={mode === "crear" ? "default" : "outline"}
          className={`gap-2 font-mono text-xs ${mode === "crear" ? "bg-red-hud/90 hover:bg-red-hud" : ""}`}
          aria-pressed={mode === "crear"}
        >
          <Sparkles className="w-4 h-4" /> CREAR DESDE CERO
        </Button>
        <Button
          onClick={() => setMode("editar")}
          variant={mode === "editar" ? "default" : "outline"}
          className={`gap-2 font-mono text-xs ${mode === "editar" ? "bg-red-hud/90 hover:bg-red-hud" : ""}`}
          aria-pressed={mode === "editar"}
        >
          <Film className="w-4 h-4" /> EDITAR MI VIDEO
        </Button>
      </div>

      {/* zona de carga (EDITAR sin video) */}
      {mode === "editar" && !videoUrl && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Zona para subir video: clic o arrastrar y soltar"
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`hud-panel border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${dragOver ? "border-green-hud bg-green-hud/10" : "border-electric/40 hover:border-electric"}`}
        >
          <UploadCloud className="w-10 h-10 mx-auto mb-2 text-electric" />
          <p className="font-orbitron text-sm tracking-widest uppercase text-gradient">Sube tu video</p>
          <p className="text-[11px] font-mono text-muted-foreground mt-1">
            Haz clic o arrastra y suelta aquí · mp4 / webm / mov · máx 30 MB · tu video no sale de tu dispositivo salvo que lo publiques
          </p>
        </div>
      )}
      <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={onPickFile} aria-hidden />

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        {/* ================= PREVISUALIZACIÓN ================= */}
        <div className="space-y-3">
          <div
            className="hud-panel overflow-hidden relative"
            onDragOver={(e) => { e.preventDefault(); if (mode === "editar") setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            <canvas
              ref={canvasRef}
              width={CW}
              height={CH}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              className="w-full h-auto block touch-none"
              style={{ cursor: dragRef.current ? "grabbing" : "default" }}
              aria-label="Lienzo del estudio de video"
            />
            {dragOver && (
              <div className="absolute inset-0 border-2 border-dashed border-green-hud bg-green-hud/10 flex items-center justify-center pointer-events-none">
                <span className="font-mono text-xs text-green-hud">SUELTA EL VIDEO AQUÍ</span>
              </div>
            )}
            {exporting && (
              <div className="absolute inset-x-0 bottom-0 h-1.5 bg-black/60">
                <div className="h-full bg-red-hud transition-all" style={{ width: `${exportPct}%` }} />
              </div>
            )}
          </div>

          {mode === "editar" && videoUrl ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={togglePlay} variant="outline" size="sm" className="gap-1.5 font-mono" disabled={exporting}>
                {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {playing ? "PAUSA" : "REPRODUCIR"}
              </Button>
              <Button onClick={exportEdited} disabled={exporting || publishing} size="sm" className="gap-1.5 font-mono bg-red-hud/90 hover:bg-red-hud">
                {exporting ? <>EXPORTANDO {Math.round(exportPct)}%</> : <><Scissors className="w-3.5 h-3.5" /> EXPORTAR {fmt(trimEnd - trimStart)}</>}
              </Button>
              {exportUrl && (
                <a href={exportUrl} download={`vanguard-editado.${lastExt}`}>
                  <Button variant="outline" size="sm" className="gap-1.5 font-mono"><Download className="w-3.5 h-3.5" /> Descargar editado</Button>
                </a>
              )}
              {exportUrl && (
                <Button onClick={publishEdited} disabled={publishing} variant="outline" size="sm" className="gap-1.5 font-mono">
                  <Upload className="w-3.5 h-3.5" /> {publishing ? "Publicando…" : "Publicar en GlobalVision"}
                </Button>
              )}
              <a href={videoUrl} download={videoName || "mi-video"}>
                <Button variant="outline" size="sm" className="gap-1.5 font-mono"><Download className="w-3.5 h-3.5" /> Original</Button>
              </a>
            </div>
          ) : mode === "crear" ? (
            <div className="flex flex-wrap items-center gap-2">
              {recording ? (
                <Button onClick={stopRec} variant="outline" className="gap-2 border-red-hud/50 text-red-hud hover:bg-red-hud/10 font-mono">
                  <Square className="w-4 h-4" /> DETENER ({recSecs}s)
                </Button>
              ) : (
                <Button onClick={startRec} disabled={publishing} className="gap-2 font-mono bg-red-hud/90 hover:bg-red-hud">
                  <Circle className="w-4 h-4 fill-current" /> GRABAR Y PUBLICAR (8s)
                </Button>
              )}
              {lastUrl && (
                <>
                  <a href={lastUrl} download={`vanguard-video.${lastExt}`}>
                    <Button variant="outline" size="sm" className="gap-1.5 font-mono"><Download className="w-3.5 h-3.5" /> Descargar WebM</Button>
                  </a>
                  <span className="text-[10px] font-mono text-green-hud flex items-center gap-1"><Sparkles className="w-3 h-3" /> publicado en GlobalVision</span>
                </>
              )}
            </div>
          ) : null}

          {!canRecord && (
            <span className="text-[10px] font-mono text-amber block">grabación no disponible en este navegador — la edición y previsualización siguen activas</span>
          )}
        </div>

        {/* ================= CONTROLES ================= */}
        <div className="space-y-3">
          {mode === "crear" && (
            <div className="hud-panel p-4 space-y-3">
              <h3 className="font-orbitron text-xs tracking-widest uppercase text-gradient flex items-center gap-2">
                <Clapperboard className="w-4 h-4 text-electric" /> Escenografía
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {SCENES.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => setScene(sc.id)}
                    className={`border rounded p-2 text-left transition-colors ${scene === sc.id ? "border-electric bg-electric/10" : "border-border hover:border-electric/40"}`}
                    aria-pressed={scene === sc.id}
                  >
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider">{sc.label}</div>
                    <div className="text-[9px] text-muted-foreground leading-tight">{sc.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === "editar" && videoUrl && (
            <>
              <div className="hud-panel p-4 space-y-3">
                <h3 className="font-orbitron text-xs tracking-widest uppercase text-gradient flex items-center gap-2">
                  <Film className="w-4 h-4 text-electric" /> Mi video
                </h3>
                <p className="text-[10px] font-mono text-muted-foreground truncate" title={videoName}>📹 {videoName} · {fmt(duration)}</p>
                <div className="space-y-2">
                  <div>
                    <label className="text-[9px] font-mono uppercase text-muted-foreground flex justify-between">
                      <span>Inicio del recorte</span><span className="text-electric">{fmt(trimStart)}</span>
                    </label>
                    <input
                      type="range" min={0} max={Math.max(0.5, duration)} step={0.1}
                      value={trimStart}
                      onChange={(e) => setTrimStart(Math.min(Number(e.target.value), trimEnd - 0.5))}
                      className="w-full" style={{ accentColor: "#1E90FF" }}
                      aria-label="Punto de inicio del recorte en segundos"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono uppercase text-muted-foreground flex justify-between">
                      <span>Fin del recorte</span><span className="text-electric">{fmt(trimEnd)}</span>
                    </label>
                    <input
                      type="range" min={0} max={Math.max(0.5, duration)} step={0.1}
                      value={trimEnd}
                      onChange={(e) => setTrimEnd(Math.max(Number(e.target.value), trimStart + 0.5))}
                      className="w-full" style={{ accentColor: "#FF3B30" }}
                      aria-label="Punto de fin del recorte en segundos"
                    />
                  </div>
                  <p className="text-[9px] font-mono text-green-hud">✂ Se exportarán {fmt(trimEnd - trimStart)} con audio incluido</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono uppercase text-muted-foreground">Velocidad</span>
                  {SPEEDS.map((sp) => (
                    <button
                      key={sp}
                      onClick={() => { setSpeed(sp); if (videoRef.current) videoRef.current.playbackRate = sp; }}
                      className={`px-2 py-0.5 rounded border text-[10px] font-mono transition-colors ${speed === sp ? "border-amber text-amber bg-amber/10" : "border-border text-muted-foreground hover:border-amber/40"}`}
                      aria-pressed={speed === sp}
                    >
                      {sp}×
                    </button>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full font-mono text-[10px]" onClick={() => fileInputRef.current?.click()}>
                  Cambiar video…
                </Button>
              </div>

              <div className="hud-panel p-4 space-y-2.5">
                <h3 className="font-orbitron text-xs tracking-widest uppercase text-gradient">Filtros</h3>
                <div className="grid grid-cols-4 gap-1.5">
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id)}
                      className={`border rounded px-1 py-1.5 text-[9px] font-mono uppercase tracking-wide transition-colors ${filter === f.id ? "border-electric bg-electric/10 text-electric" : "border-border text-muted-foreground hover:border-electric/40"}`}
                      aria-pressed={filter === f.id}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* v22 AJUSTES estilo InShot: brillo/contraste/saturación */}
                <div className="pt-2 border-t border-border/50 space-y-2">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-amber" />
                    <h4 className="font-mono text-[10px] uppercase tracking-widest text-amber">Ajustes</h4>
                    <button
                      onClick={() => setAdj({ b: 100, c: 100, s: 100 })}
                      className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded border border-border text-muted-foreground hover:border-amber hover:text-amber transition-colors"
                    >
                      RESET
                    </button>
                  </div>
                  {([
                    { key: "b" as const, label: "Brillo", min: 50, max: 160, color: "#00E5FF" },
                    { key: "c" as const, label: "Contraste", min: 50, max: 200, color: "#FFD60A" },
                    { key: "s" as const, label: "Saturación", min: 0, max: 250, color: "#FF3B30" },
                  ]).map((a) => (
                    <label key={a.key} className="block">
                      <span className="text-[9px] font-mono uppercase text-muted-foreground flex justify-between">
                        <span>{a.label}</span><span className="text-electric">{adj[a.key]}%</span>
                      </span>
                      <input
                        type="range" min={a.min} max={a.max} step={5}
                        value={adj[a.key]}
                        onChange={(e) => setAdj((v) => ({ ...v, [a.key]: Number(e.target.value) }))}
                        className="w-full"
                        style={{ accentColor: a.color }}
                        aria-label={`${a.label} del video`}
                      />
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* titulares (ambos modos) */}
          <div className="hud-panel p-4 space-y-2.5">
            <h3 className="font-orbitron text-xs tracking-widest uppercase text-gradient flex items-center gap-2">
              <Type className="w-4 h-4 text-amber" /> Titulares
              <button
                onClick={() => setShowOverlay((v) => !v)}
                className={`ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded border ${showOverlay ? "border-green-hud text-green-hud" : "border-border text-muted-foreground"}`}
                aria-pressed={showOverlay}
              >
                {showOverlay ? "VISIBLES" : "OCULTOS"}
              </button>
            </h3>
            <div className="flex flex-wrap gap-1" role="group" aria-label="Plantillas rápidas del estudio">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => applyTemplate(t)}
                  className={`px-1.5 py-0.5 rounded border text-[9px] font-mono uppercase tracking-wide transition-colors ${title === t.title ? "border-amber text-amber bg-amber/10" : "border-border text-muted-foreground hover:border-amber/40 hover:text-amber"}`}
                  aria-label={`Aplicar plantilla ${t.label}`}
                  aria-pressed={title === t.title}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={44} className="font-mono text-xs h-9" placeholder="Titular principal" aria-label="Titular del video" />
            <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} maxLength={58} className="font-mono text-xs h-9" placeholder="Subtítulo / canal" aria-label="Subtítulo del video" />
            <div className="flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <div className="flex gap-1.5">
                {PALETTES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPal(p)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${pal.id === p.id ? "scale-110 border-white" : "border-transparent"}`}
                    style={{ background: `linear-gradient(135deg,${p.main},${p.accent})` }}
                    aria-label={`Paleta ${p.label}`}
                    aria-pressed={pal.id === p.id}
                  />
                ))}
              </div>
            </div>
            {mode === "editar" && videoUrl && (
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono uppercase text-muted-foreground">Categoría al publicar</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Cat)}
                  className="bg-black/40 border border-border rounded px-1.5 py-0.5 text-[10px] font-mono uppercase"
                  aria-label="Categoría del video al publicar"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* personajes de países */}
          <div className="hud-panel p-4 space-y-2">
            <h3 className="font-orbitron text-xs tracking-widest uppercase text-gradient flex items-center gap-2">
              <Move className="w-4 h-4 text-green-hud" /> Personajes de países
              <span className="ml-auto text-[9px] font-mono text-muted-foreground">{stickers.length} en escena</span>
            </h3>
            <p className="text-[9px] font-mono text-muted-foreground leading-tight">
              Añade tantas bolas como quieras, <b className="text-green-hud">arrástralas sobre el lienzo</b> y ajusta su tamaño. {WORLD_FLAGS.length} países disponibles.
            </p>
            {/* v22: TEXTO LIBRE estilo InShot */}
            <button
              onClick={addTextSticker}
              className="w-full border border-amber-hud/60 bg-amber-hud/10 rounded px-2 py-1.5 text-[10px] font-mono uppercase tracking-widest text-amber hover:bg-amber-hud/20 transition-colors flex items-center justify-center gap-1.5"
            >
              <Type className="w-3.5 h-3.5" /> Añadir texto libre
            </button>
            <Input
              value={pickerQuery}
              onChange={(e) => setPickerQuery(e.target.value)}
              maxLength={24}
              className="font-mono text-xs h-8"
              placeholder="Buscar país (ej. dominicana, jp…)"
              aria-label="Buscar país para añadir personaje"
            />
            <div className="grid grid-cols-7 gap-1 max-h-36 overflow-y-auto pr-1">
              {filteredCountries.map((f) => (
                <button
                  key={f.code}
                  onClick={() => addSticker(f.code)}
                  className="p-0.5 rounded border border-transparent hover:border-green-hud hover:bg-green-hud/10 transition-transform hover:scale-110"
                  title={`${f.name} — añadir a la escena`}
                  aria-label={`Añadir personaje de ${f.name}`}
                >
                  <Countryball code={f.code} size={26} />
                </button>
              ))}
            </div>

            {sel && (
              <div className="border border-green-hud/40 rounded p-2 space-y-2 bg-green-hud/5">
                <div className="flex items-center gap-2">
                  {sel.kind === "text" ? (
                    <span className="w-6 h-6 rounded border border-amber-hud/60 bg-amber-hud/10 flex items-center justify-center flex-shrink-0"><Type className="w-3 h-3 text-amber" /></span>
                  ) : (
                    <Countryball code={sel.code} size={24} />
                  )}
                  <span className="text-[10px] font-mono text-green-hud flex-1 truncate">{sel.kind === "text" ? "Sticker de texto" : countryName(sel.code)}</span>
                  <Button variant="outline" size="sm" className="h-6 px-2 border-red-hud/50 text-red-hud hover:bg-red-hud/10" onClick={removeSelected} aria-label="Eliminar personaje seleccionado">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                {sel.kind === "text" && (
                  <Input
                    value={sel.text ?? ""}
                    maxLength={28}
                    onChange={(e) => setStickers((ss) => ss.map((x) => x.id === sel.id ? { ...x, text: e.target.value } : x))}
                    className="font-mono text-xs h-8"
                    placeholder="Texto del sticker"
                    aria-label="Texto del sticker seleccionado"
                  />
                )}
                <label className="block">
                  <span className="text-[9px] font-mono uppercase text-muted-foreground flex justify-between">
                    <span>Tamaño</span><span className="text-electric">{Math.round(sel.r * 2)}px</span>
                  </span>
                  <input
                    type="range" min={18} max={110} step={1}
                    value={sel.r}
                    onChange={(e) => resizeSelected(Number(e.target.value))}
                    className="w-full" style={{ accentColor: "#00FF87" }}
                    aria-label="Tamaño del personaje seleccionado"
                  />
                </label>
              </div>
            )}

            {stickers.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {stickers.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelId(s.id)}
                    className={`p-1 rounded border transition-transform ${selId === s.id ? "border-green-hud bg-green-hud/10 scale-105" : "border-border hover:border-green-hud/40"}`}
                    title={s.kind === "text" ? `${s.text ?? "Texto"} — seleccionar` : `${countryName(s.code)} — seleccionar`}
                    aria-pressed={selId === s.id}
                  >
                    {s.kind === "text" ? (
                      <span className="w-[22px] h-[22px] flex items-center justify-center"><Type className="w-3.5 h-3.5 text-amber" /></span>
                    ) : (
                      <Countryball code={s.code} size={22} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* video oculto (fuente de frames y audio) */}
      <video
        ref={videoRef}
        key={videoUrl ?? "vacio"}
        src={videoUrl ?? undefined}
        className="hidden"
        playsInline
        preload="auto"
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration || 0;
          setDuration(d);
          setTrimStart(0);
          setTrimEnd(d);
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        aria-hidden
      />
    </div>
  );
}

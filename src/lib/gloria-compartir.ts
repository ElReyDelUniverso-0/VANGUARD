"use client";

// ══════════════════════════════════════════════════════════════════════
// v183.0 LA GLORIA — PRESUMIR: la ficha sale de la Casa como imagen.
// Canvas nativo (cero dependencias) → PNG → navigator.share con Files
// (WhatsApp/X/lo que el aparato tenga) y, si el aparato no comparte
// archivos, DESCARGA directa. Honesto: solo datos reales de la ficha.
// ══════════════════════════════════════════════════════════════════════

import type { FichaGuerra } from "@/lib/fichas-guerra-data";
import type { SelloDorado } from "@/lib/gloria";

export interface DatosPresumir {
  serie: string;
  nombre: string;
  bandos: [string, string];
  teatro: string;
  hex: string;
  rarezaLabel: string;
  intensidad: number;      // impacto de HOY (0 = sin señal)
  pulso: number;
  titular: string | null;  // LA NOTICIA ÚNICA de hoy
  fuente: string | null;
  selloFecha: string | null; // fecha del descubrimiento
  selloDorado: SelloDorado | null;
  version: string;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function texto(ctx: CanvasRenderingContext2D, t: string, max: number): string {
  if (ctx.measureText(t).width <= max) return t;
  let s = t;
  while (s.length > 4 && ctx.measureText(s + "…").width > max) s = s.slice(0, -1);
  return s + "…";
}

export function pintarFicha(d: DatosPresumir): string {
  const W = 640, H = 800;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d");
  if (!ctx) return "";

  // el fondo de la casa
  ctx.fillStyle = "#050508";
  ctx.fillRect(0, 0, W, H);
  // el tinte de la rareza
  const g = ctx.createRadialGradient(W * 0.2, 0, 0, W * 0.2, 0, W * 1.1);
  g.addColorStop(0, d.hex + "26");
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // la línea de acento
  ctx.fillStyle = d.hex;
  ctx.fillRect(0, 0, W, 5);

  // cabecera de la Agencia
  ctx.fillStyle = "#8B98AD";
  ctx.font = "600 15px monospace";
  ctx.fillText("VANGUARD · LA COLECCIÓN DE GUERRA", 36, 52);
  ctx.textAlign = "right";
  ctx.fillStyle = d.hex;
  ctx.font = "bold 16px monospace";
  ctx.fillText(d.serie, W - 36, 52);
  ctx.textAlign = "left";

  // la rareza
  ctx.font = "bold 13px monospace";
  ctx.fillStyle = d.hex;
  ctx.fillText("RAREZA " + d.rarezaLabel + " — LA DECRECE EL IMPACTO DE HOY", 36, 84);

  // el nombre de la guerra
  ctx.fillStyle = "#F5F3EE";
  ctx.font = "900 46px sans-serif";
  const nombre = texto(ctx, d.nombre, W - 72);
  ctx.fillText(nombre, 36, 148);

  // bandos
  ctx.fillStyle = "#B9C2D0";
  ctx.font = "600 17px monospace";
  ctx.fillText(d.bandos[0] + "  ✕  " + d.bandos[1], 36, 182);
  ctx.fillStyle = "#66707F";
  ctx.font = "600 13px monospace";
  ctx.fillText(texto(ctx, d.teatro, W - 72), 36, 206);

  // LA NOTICIA ÚNICA
  ctx.fillStyle = "#66707F";
  ctx.font = "bold 12px monospace";
  ctx.fillText("LA NOTICIA ÚNICA DE HOY", 36, 252);
  ctx.fillStyle = "#F5F3EE";
  ctx.font = "700 21px sans-serif";
  const t1 = d.titular ?? "SIN SEÑAL FRESCA — LA GUERRA SIGUE, LA CARTA DUELE";
  const palabras = t1.split(" ");
  let linea = "", ly = 282, ancho = 0;
  for (const p of palabras) {
    const prueba = linea ? linea + " " + p : p;
    if (ctx.measureText(prueba).width > W - 76 && linea) {
      ctx.fillText(linea, 36, ly); ly += 28; linea = p;
      if (ly > 380) break;
    } else linea = prueba;
  }
  if (linea && ly <= 380) ctx.fillText(linea, 36, ly);
  if (d.fuente) {
    ctx.fillStyle = "#8B98AD";
    ctx.font = "600 13px monospace";
    ctx.fillText("FUENTE: " + d.fuente.toUpperCase() + (d.intensidad ? " · IMP " + d.intensidad : ""), 36, Math.min(ly + 24, 404));
  }

  // el panel del sello — la hora que solo tú viviste
  const sy = 448, sh = 130;
  ctx.fillStyle = "#0B0B12";
  roundRect(ctx, 36, sy, W - 72, sh, 10);
  ctx.fill();
  ctx.strokeStyle = d.selloDorado ? "#F5C542" : "#6D5AE6";
  ctx.lineWidth = 2;
  roundRect(ctx, 36, sy, W - 72, sh, 10);
  ctx.stroke();
  if (d.selloFecha) {
    ctx.fillStyle = d.selloDorado ? "#F5C542" : "#B4A7F5";
    ctx.font = "bold 17px monospace";
    ctx.fillText(d.selloDorado ? "★ SELLO DORADO 1/1" : "EN TU COLECCIÓN", 60, sy + 38);
    ctx.fillStyle = "#F5F3EE";
    ctx.font = "600 15px monospace";
    ctx.fillText("DESCUBIERTA EL " + d.selloFecha.toUpperCase(), 60, sy + 66);
    if (d.selloDorado) {
      ctx.fillStyle = "#F5C542";
      ctx.font = "700 15px monospace";
      ctx.fillText("CAPTADA EN VIVO A LAS " + d.selloDorado.hora + " · IMP " + d.selloDorado.intensidad, 60, sy + 94);
    }
  } else {
    ctx.fillStyle = "#8B98AD";
    ctx.font = "600 15px monospace";
    ctx.fillText("CARTA EN VISTA — SIN DESCUBRIR", 60, sy + 60);
  }

  // pie de la casa
  ctx.fillStyle = "#66707F";
  ctx.font = "600 14px monospace";
  ctx.fillText("VANGUARD " + d.version + " · FICHA COLECCIONABLE DE CONFLICTO REAL", 36, H - 58);
  ctx.fillStyle = d.hex;
  ctx.font = "bold 13px monospace";
  ctx.fillText("LA RAREZA RESPIRA CON LAS NOTICIAS DEL MUNDO", 36, H - 32);

  try { return cv.toDataURL("image/png"); } catch { return ""; }
}

// ── LA VITRINA — el escaparate entero del agente como imagen ───────
export interface DatosVitrina {
  tituloActivo: string | null;   // el título GLORIA vestido
  colorTitulo: string;
  fichas: { serie: string; nombre: string; hex: string; dorada: boolean }[];
  racha: number;
  sellos: number;
  descubiertas: number;
  total: number;
  version: string;
}

export function pintarVitrina(d: DatosVitrina): string {
  const W = 640, H = 560;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d");
  if (!ctx) return "";

  ctx.fillStyle = "#050508";
  ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W * 0.5, -80, 0, W * 0.5, -80, W);
  g.addColorStop(0, "#F5C54222");
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#F5C542";
  ctx.fillRect(0, 0, W, 5);

  ctx.fillStyle = "#8B98AD";
  ctx.font = "600 15px monospace";
  ctx.fillText("VANGUARD · LA VITRINA DE LA GLORIA", 36, 52);

  ctx.fillStyle = "#F5F3EE";
  ctx.font = "900 34px sans-serif";
  ctx.fillText(texto(ctx, d.tituloActivo ?? "AGENTE SIN TÍTULO AÚN", W - 72), 36, 100);
  if (d.tituloActivo) {
    ctx.fillStyle = d.colorTitulo;
    ctx.font = "bold 14px monospace";
    ctx.fillText("TÍTULO GLORIA EN VIVO", 36, 126);
  }

  // los huecos de la vitrina
  const sy = 158, cw = (W - 72 - 24) / 3;
  for (let i = 0; i < 3; i++) {
    const x = 36 + i * (cw + 12);
    const f = d.fichas[i];
    ctx.fillStyle = "#0B0B12";
    roundRect(ctx, x, sy, cw, 170, 8);
    ctx.fill();
    ctx.strokeStyle = f ? f.hex : "#2A2F3A";
    ctx.lineWidth = 2;
    roundRect(ctx, x, sy, cw, 170, 8);
    ctx.stroke();
    if (f) {
      ctx.fillStyle = f.hex;
      ctx.font = "bold 13px monospace";
      ctx.fillText(f.serie, x + 14, sy + 30);
      ctx.fillStyle = "#F5F3EE";
      ctx.font = "800 16px sans-serif";
      const n = texto(ctx, f.nombre, cw - 28);
      ctx.fillText(n, x + 14, sy + 60);
      ctx.fillStyle = f.dorada ? "#F5C542" : "#66707F";
      ctx.font = "700 12px monospace";
      ctx.fillText(f.dorada ? "★ SELLO DORADO" : "EN COLECCIÓN", x + 14, sy + 88);
    } else {
      ctx.fillStyle = "#4A5160";
      ctx.font = "600 13px monospace";
      ctx.fillText("HUECO LIBRE", x + 14, sy + 84);
    }
  }

  // las cifras de la gloria
  const gy = 372;
  ctx.fillStyle = "#0B0B12";
  roundRect(ctx, 36, gy, W - 72, 92, 8);
  ctx.fill();
  const cifras: [string, string][] = [
    [String(d.racha), "RACHA DEL CAZADOR"],
    ["★ " + d.sellos, "SELLOS DORADOS"],
    [`${d.descubiertas}/${d.total}`, "COLECCIÓN"],
  ];
  for (let i = 0; i < 3; i++) {
    const x = 36 + i * ((W - 72) / 3);
    ctx.fillStyle = "#F5F3EE";
    ctx.font = "bold 26px monospace";
    ctx.fillText(cifras[i][0], x + 20, gy + 42);
    ctx.fillStyle = "#66707F";
    ctx.font = "600 10px monospace";
    ctx.fillText(cifras[i][1], x + 20, gy + 66);
  }

  ctx.fillStyle = "#66707F";
  ctx.font = "600 14px monospace";
  ctx.fillText("PRESUME TU COLECCIÓN — " + d.version, 36, H - 36);

  try { return cv.toDataURL("image/png"); } catch { return ""; }
}

// COMPARTIR: share con archivos si el aparato puede; si no, descarga.
export async function compartirImagen(dataUrl: string, nombreArchivo: string): Promise<"share" | "descarga" | "no"> {
  if (!dataUrl) return "no";
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const archivo = new File([blob], nombreArchivo, { type: "image/png" });
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (nav.canShare?.({ files: [archivo] })) {
      await navigator.share({ files: [archivo], title: "VANGUARD — LA COLECCIÓN DE GUERRA" });
      return "share";
    }
    // descarga directa
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return "descarga";
  } catch {
    // el share cancelado (AbortError) no es un error de la casa
    try {
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = nombreArchivo;
      document.body.appendChild(a);
      a.click();
      a.remove();
      return "descarga";
    } catch { return "no"; }
  }
}

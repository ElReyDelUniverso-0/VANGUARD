"use client";

// ============================================================
// VANGUARD v85.0 EL MUNDO DENTRO — MODO AR
// "El mundo está dentro de Vanguard" — literalmente: levanta la cámara
// y los conflictos del planeta aparecen FLOTANDO en tu calle.
// Cámara real (getUserMedia trasera) + giroscopio (deviceorientation) o
// arrastre en escritorio; captura compuesta descargable; modo DEMO si no
// hay cámara. Todo transform/opacity a 60 fps.
// ============================================================
import { useCallback, useEffect, useRef, useState } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScanLine, Camera, CameraOff, Crosshair, Download, Compass, Layers,
  Move3d, RefreshCw, Radar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { CONFLICTS, type ConflictRegion } from "@/lib/game-data";

type EstadoCam = "apagada" | "pidiendo" | "activa" | "denegada" | "indisponible";

interface Flotante {
  c: ConflictRegion;
  // posición base en pantalla (fracción 0..1) repartida en arco
  bx: number;
  by: number;
  profundidad: number; // 0.4..1: multiplica el parallax (los "lejanos" se mueven menos)
}

// reparto de conflictos en un arco amplio (no se amontonan)
function flotantesDe(lista: ConflictRegion[]): Flotante[] {
  return lista.slice(0, 8).map((c, i) => ({
    c,
    bx: 0.12 + ((i % 4) * 0.24) + ((i % 2) * 0.04),
    by: 0.22 + Math.floor(i / 4) * 0.3 + ((i * 37) % 11) / 100,
    profundidad: 0.45 + ((i * 29) % 50) / 100,
  }));
}

export function ModoArPanel() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [estadoCam, setEstadoCam] = useState<EstadoCam>("apagada");
  const [yaw, setYaw] = useState(0); // -1..1
  const [pitch, setPitch] = useState(0);
  const [giroDisponible, setGiroDisponible] = useState(false);
  const [conflictoActivo, setConflictoActivo] = useState<string | null>(null);
  const [escaneando, setEscaneando] = useState(false);
  const [filtro, setFiltro] = useState<"todos" | "criticos">("todos");

  const lista = filtro === "criticos"
    ? CONFLICTS.filter((c) => c.level === "CRITICO" || c.level === "TENSION").slice(0, 8)
    : CONFLICTS.slice(0, 8);
  const flotantes = flotantesDe(lista);

  // ===== cámara =====
  const encenderCamara = useCallback(async () => {
    setEstadoCam("pidiendo");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => { /* autoplay ok */ });
      }
      setEstadoCam("activa");
      toast.success("Cámara activa: los conflictos flotan en tu mundo");
    } catch (e) {
      const name = e instanceof DOMException ? e.name : "";
      if (name === "NotAllowedError") {
        setEstadoCam("denegada");
        toast.error("Permiso de cámara denegado — modo DEMO activado");
      } else {
        setEstadoCam("indisponible");
        toast.error("Sin cámara disponible — modo DEMO activado");
      }
    }
  }, []);

  const apagarCamara = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setEstadoCam("apagada");
  }, []);

  useEffect(() => () => apagarCamara(), [apagarCamara]);

  // ===== giroscopio (iOS pide permiso; escritorio cae a arrastre) =====
  useEffect(() => {
    const handler = (e: DeviceOrientationEvent) => {
      const g = e.gamma ?? 0; // -90..90
      const b = e.beta ?? 0; // -180..180
      setYaw(Math.max(-1, Math.min(1, g / 45)));
      setPitch(Math.max(-1, Math.min(1, (b - 45) / 45)));
    };
    window.addEventListener("deviceorientation", handler, true);
    // detección rápida: si llega un evento con datos, hay giroscopio
    const check = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) setGiroDisponible(true);
    };
    window.addEventListener("deviceorientation", check, { once: true });
    return () => {
      window.removeEventListener("deviceorientation", handler, true);
      window.removeEventListener("deviceorientation", check);
    };
  }, []);

  // arrastre en escritorio (fallback del giroscopio)
  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || giroDisponible) return;
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    setYaw(((e.clientX - rect.left) / rect.width) * 2 - 1);
    setPitch(((e.clientY - rect.top) / rect.height) * 2 - 1);
  };

  // ===== barrido de escaneo =====
  const escanear = () => {
    setEscaneando(true);
    setTimeout(() => setEscaneando(false), 2200);
  };

  // ===== captura compuesta =====
  const capturar = () => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const W = wrap.clientWidth;
    const H = wrap.clientHeight;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // fondo: video (o cielo de demo)
    const video = videoRef.current;
    if (estadoCam === "activa" && video && video.videoWidth) {
      ctx.drawImage(video, 0, 0, W, H);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#0b1026");
      grad.addColorStop(0.65, "#2b1a3a");
      grad.addColorStop(1, "#7a3b2e");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }
    // velo + sellos AR
    ctx.fillStyle = "rgba(5,8,18,0.28)";
    ctx.fillRect(0, 0, W, H);
    const sello = `VANGUARD AR · ${new Date().toLocaleString("es")} · ${lista.length} CONFLICTOS EN VIVO`;
    ctx.font = "bold 13px monospace";
    ctx.fillStyle = "#FFB020";
    ctx.fillText(sello, 12, H - 14);
    ctx.strokeStyle = "rgba(255,176,32,0.7)";
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, W - 8, H - 8);
    // marcadores flotantes
    for (const f of flotantes) {
      const x = f.bx * W + yaw * 26 * f.profundidad;
      const y = f.by * H + pitch * 20 * f.profundidad;
      ctx.strokeStyle = "#FF3B30";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - 22, y); ctx.lineTo(x - 8, y);
      ctx.moveTo(x + 8, y); ctx.lineTo(x + 22, y);
      ctx.stroke();
      ctx.font = "bold 10px monospace";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(`${f.c.flag} ${f.c.name.slice(0, 22).toUpperCase()}`, x + 26, y + 3);
      ctx.fillStyle = "#FF3B30";
      ctx.fillText(`INTENSIDAD ${f.c.intensity}%`, x + 26, y + 15);
    }
    try {
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `vanguard-ar-${Date.now()}.png`;
      a.click();
      toast.success("Captura AR descargada");
    } catch {
      toast.error("El navegador bloqueó la captura");
    }
  };

  return (
    <div className="space-y-3">
      <HeroOro panel="armodo" />
      <PanelHeader
        title="MODO AR · Conflictos en tu mundo"
        subtitle={`${lista.length} marcadores flotando · ${giroDisponible ? "giroscopio conectado" : "arrastra para mirar"}`}
        icon={<ScanLine className="w-4 h-4 text-cyan-hud" />}
        color="cyan"
        right={
          <Button
            size="sm"
            onClick={estadoCam === "activa" ? apagarCamara : encenderCamara}
            disabled={estadoCam === "pidiendo"}
            className="h-8 px-2.5 font-mono text-[10px] uppercase bg-cyan-hud/80 border border-cyan-hud text-black hover:bg-cyan-hud"
          >
            <Camera className="w-3.5 h-3.5 mr-1" />
            {estadoCam === "activa" ? "APAGAR" : estadoCam === "pidiendo" ? "ABRIENDO…" : "ABRIR CÁMARA"}
          </Button>
        }
      />

      {/* ===== VISOR AR ===== */}
      <div
        ref={wrapRef}
        onPointerMove={onPointerMove}
        className="relative w-full h-[420px] sm:h-[520px] border border-cyan-hud/50 overflow-hidden select-none"
        style={{ perspective: "900px" }}
      >
        {/* cámara real */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={cn(
            "absolute inset-0 w-full h-full object-cover",
            estadoCam !== "activa" && "hidden"
          )}
        />
        {/* cielo de demo (sin cámara) */}
        {estadoCam !== "activa" && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b1026] via-[#2b1a3a] to-[#7a3b2e]">
            {/* luna llena */}
            <div className="absolute top-10 right-14 w-16 h-16 rounded-full bg-[#fff3d6] shadow-[0_0_60px_20px_rgba(255,243,214,0.35)]" />
            {/* estrellas */}
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white/70"
                style={{
                  left: `${(i * 137) % 100}%`,
                  top: `${(i * 61) % 55}%`,
                  width: i % 5 === 0 ? 2.5 : 1.5,
                  height: i % 5 === 0 ? 2.5 : 1.5,
                  animation: `v85Titilar ${2 + (i % 5)}s ease-in-out ${i % 3}s infinite`,
                }}
              />
            ))}
            {/* horizonte de la ciudad */}
            <div className="absolute bottom-0 inset-x-0 h-24 bg-black/60" style={{ clipPath: "polygon(0 100%, 0 55%, 8% 55%, 8% 30%, 14% 30%, 14% 60%, 22% 60%, 22% 20%, 30% 20%, 30% 50%, 38% 50%, 38% 35%, 46% 35%, 46% 70%, 55% 70%, 55% 25%, 63% 25%, 63% 55%, 72% 55%, 72% 40%, 80% 40%, 80% 65%, 88% 65%, 88% 30%, 100% 30%, 100% 100%)" }} />
          </div>
        )}

        {/* velo nocturno */}
        <div className="absolute inset-0 bg-black/25 pointer-events-none" />

        {/* retícula central + líneas de mira */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <Crosshair className={cn("w-10 h-10 text-cyan-hud/70", escaneando && "animate-ping")} />
        </div>
        <div className="absolute left-3 top-3 bottom-3 w-px bg-cyan-hud/25 pointer-events-none" />
        <div className="absolute right-3 top-3 bottom-3 w-px bg-cyan-hud/25 pointer-events-none" />
        <div className="absolute top-3 left-3 right-3 h-px bg-cyan-hud/25 pointer-events-none" />
        <div className="absolute bottom-3 left-3 right-3 h-px bg-cyan-hud/25 pointer-events-none" />

        {/* barrido de escaneo */}
        {escaneando && (
          <motion.div
            initial={{ top: "0%" }}
            animate={{ top: "100%" }}
            transition={{ duration: 2.1, ease: "linear" }}
            className="absolute inset-x-0 h-16 pointer-events-none"
          >
            <div className="h-full w-full bg-gradient-to-b from-transparent via-cyan-hud/30 to-transparent" />
          </motion.div>
        )}

        {/* MARCADORES FLOTANTES con parallax */}
        {flotantes.map((f, i) => {
          const px = f.bx * 100 + yaw * 5 * f.profundidad;
          const py = f.by * 100 + pitch * 4 * f.profundidad;
          const activo = conflictoActivo === f.c.id;
          return (
            <motion.button
              key={f.c.id}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.09, duration: 0.4 }}
              onClick={() => setConflictoActivo(activo ? null : f.c.id)}
              className="absolute z-20"
              style={{
                left: `${Math.max(4, Math.min(78, px))}%`,
                top: `${Math.max(6, Math.min(80, py))}%`,
                transform: "translate(-50%, -50%)",
              }}
              aria-label={`Conflicto ${f.c.name}`}
            >
              <span className="relative flex items-center justify-center">
                <span
                  className={cn(
                    "absolute w-12 h-12 rounded-full border-2 animate-ping",
                    f.c.level === "CRITICO" ? "border-red-hud" : f.c.level === "TENSION" ? "border-amber-hud" : "border-cyan-hud"
                  )}
                  style={{ animationDuration: "2.4s" }}
                />
                <span className={cn(
                  "relative w-7 h-7 rounded-full border flex items-center justify-center text-[10px]",
                  f.c.level === "CRITICO" ? "border-red-hud bg-red-hud/30" : f.c.level === "TENSION" ? "border-amber-hud bg-amber-hud/30" : "border-cyan-hud bg-cyan-hud/30"
                )}>
                  {f.c.flag}
                </span>
              </span>
              <span className={cn(
                "block mt-1 px-1.5 py-0.5 border bg-black/70 text-[9px] font-mono uppercase whitespace-nowrap",
                activo ? "border-cyan-hud text-cyan-hud" : "border-white/30 text-white/90"
              )}>
                {f.c.name.slice(0, 24)}
              </span>
            </motion.button>
          );
        })}

        {/* HUD superior */}
        <div className="absolute top-5 left-5 right-5 z-30 flex items-start justify-between gap-2 pointer-events-none">
          <div className="border border-cyan-hud/60 bg-black/70 px-2 py-1">
            <p className="text-[9px] font-mono text-cyan-hud uppercase tracking-widest">vanguard ar · capa: conflictos en vivo</p>
            <p className="text-[9px] font-mono text-white/80 uppercase mt-0.5 flex items-center gap-1">
              <Compass className="w-3 h-3" /> {giroDisponible ? "giro: mueve el teléfono" : "modo escritorio: arrastra el cursor"}
            </p>
          </div>
          <div className="border border-red-hud/60 bg-black/70 px-2 py-1 text-right">
            <p className="text-[9px] font-mono text-red-hud uppercase">● rec</p>
            <p className="text-[9px] font-mono text-white/80">{new Date().toLocaleTimeString("es")}</p>
          </div>
        </div>

        {/* ficha del conflicto activo */}
        <AnimatePresence>
          {conflictoActivo && (() => {
            const f = flotantes.find((x) => x.c.id === conflictoActivo);
            if (!f) return null;
            return (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                className="absolute bottom-5 left-5 right-5 z-30 border border-cyan-hud/70 bg-black/85 p-3"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-xs font-bold text-foreground uppercase leading-tight">
                    {f.c.flag} {f.c.name} · {f.c.country}
                  </p>
                  <span className={cn(
                    "text-[9px] font-mono px-1.5 py-0.5 border uppercase",
                    f.c.level === "CRITICO" ? "border-red-hud text-red-hud" : f.c.level === "TENSION" ? "border-amber-hud text-amber" : "border-cyan-hud text-cyan-hud"
                  )}>
                    {f.c.level}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug mb-1.5">{f.c.summary}</p>
                <div className="flex items-center gap-3 text-[9px] font-mono uppercase text-muted-foreground flex-wrap">
                  <span className="text-amber">intensidad {f.c.intensity}%</span>
                  <span>desde {f.c.since}</span>
                  <span>{f.c.casualties}</span>
                  <span className="text-cyan-hud">{f.c.lat.toFixed(1)}°, {f.c.lng.toFixed(1)}°</span>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* estado de cámara */}
        {(estadoCam === "apagada" || estadoCam === "denegada" || estadoCam === "indisponible") && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-30 text-center px-6">
            <CameraOff className="w-8 h-8 mx-auto text-white/60 mb-2" />
            <p className="text-xs font-mono uppercase text-white/90">
              {estadoCam === "apagada" ? "modo demo · abre la cámara para AR real" : estadoCam === "denegada" ? "permiso denegado · modo demo" : "cámara indisponible · modo demo"}
            </p>
          </div>
        )}
      </div>

      {/* ===== CONTROLES ===== */}
      <div className="hud-corner p-3 flex items-center gap-2 flex-wrap">
        <Button size="sm" onClick={escanear} disabled={escaneando} className="h-8 font-mono text-[10px] uppercase bg-cyan-hud/30 border border-cyan-hud text-cyan-hud hover:bg-cyan-hud/50">
          <Radar className="w-3.5 h-3.5 mr-1" /> {escaneando ? "escaneando…" : "escanear zona"}
        </Button>
        <Button size="sm" onClick={capturar} className="h-8 font-mono text-[10px] uppercase bg-amber-hud/30 border border-amber-hud text-amber hover:bg-amber-hud/50">
          <Download className="w-3.5 h-3.5 mr-1" /> capturar AR
        </Button>
        <div className="ml-auto flex items-center gap-1">
          {(["todos", "criticos"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={cn(
                "px-2 py-1 border text-[9px] font-mono uppercase",
                filtro === f ? "border-cyan-hud text-cyan-hud bg-cyan-hud/20" : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {f === "todos" ? "todos" : "críticos"}
            </button>
          ))}
        </div>
      </div>

      {/* instrucciones */}
      <div className="grid sm:grid-cols-3 gap-2">
        {[
          { icon: <Move3d className="w-4 h-4 text-cyan-hud" />, t: "MIRA ALREDEDOR", d: "En móvil, mueve el teléfono: los marcadores se desplazan con el giroscopio. En escritorio, arrastra el cursor sobre el visor." },
          { icon: <Layers className="w-4 h-4 text-cyan-hud" />, t: "TOCA UN MARCADOR", d: "Cada burbuja es un conflicto real del mapa de Vanguard con su intensidad, año y datos humanitarios." },
          { icon: <RefreshCw className="w-4 h-4 text-cyan-hud" />, t: "CAPTURA Y COMPARTE", d: "La captura compone tu mundo + la capa de conflicto en una imagen PNG lista para enviar." },
        ].map((c) => (
          <div key={c.t} className="hud-corner p-2.5">
            <p className="text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 text-foreground mb-1">
              {c.icon} {c.t}
            </p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">{c.d}</p>
          </div>
        ))}
      </div>

      <p className="text-[9px] font-mono text-muted-foreground text-center uppercase">
        la cámara nunca sale de tu dispositivo: la imagen no se sube a ningún servidor
      </p>
    </div>
  );
}

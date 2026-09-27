"use client";

// v64.0 GLORIA COMPARTIDA — TARJETA DE GUERRA: compartir SIN enlaces.
// El jefe pidió que los agentes compartan VANGUARD pero "que no sean links":
// cada jugador genera su tarjeta de guerra personal (PNG con sus estadísticas
// reales: racha, nivel, rango, XP de temporada) y la envía DIRECTO como imagen
// por WhatsApp/Telegram/Instagram con la Web Share API Level 2 (navigator.share
// con files). La dirección del juego viaja IMPRESA dentro de la imagen — la
// invitación es contenido, no spam de enlaces. La misión diaria PREGONERO DE
// GUERRA y la semanal ECO DEL ABISMO premian cada difusión (bucle adictivo).

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/game-store";
import { useRetention } from "@/lib/retention";
import { toast } from "sonner";
import { Share2, Download, Flame, ImageDown, CheckCircle2 } from "lucide-react";

const SHARE_TEXT =
  "Mi tarjeta de guerra de VANGUARD — el mundo en guerra, en tiempo real. Juega gratis buscando vanguard-kq9r.vercel.app";

// Ojo reptil del abismo: triángulo omnisciente + iris ámbar + pupila vertical
function OjoAbismo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <path d="M50 6 L96 90 L4 90 Z" fill="none" stroke="#FF3B30" strokeWidth="5" strokeLinejoin="round" />
      <ellipse cx="50" cy="64" rx="24" ry="13" fill="#0A0A0F" stroke="#FFB800" strokeWidth="3" />
      <circle cx="50" cy="64" r="7" fill="#FFB800" />
      <rect x="47.5" y="51" width="5" height="26" rx="2.5" fill="#0A0A0F" />
    </svg>
  );
}

export function TarjetaGuerra({ compact = false }: { compact?: boolean }) {
  const alias = useGameStore((s) => s.alias);
  const level = useGameStore((s) => s.level);
  const rank = useGameStore((s) => s.rank);
  const streak = useGameStore((s) => s.streak);
  const coins = useGameStore((s) => s.coins);
  const addCoins = useGameStore((s) => s.addCoins);
  const progressMission = useGameStore((s) => s.progressMission);
  const seasonXp = useRetention((s) => s.seasonXp);

  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [canShareFiles, setCanShareFiles] = useState(false);
  const [hoy, setHoy] = useState("");
  const [sharedCount, setSharedCount] = useState(0);

  // estado de la misión diaria PREGONERO (feedback del bucle adictivo)
  const pregonezHoy = useGameStore((s) => s.missionProgress["D_PREGON_1"]);

  useEffect(() => {
    // Web Share Level 2: ¿este navegador puede enviar ARCHIVOS? (móviles: sí)
    try {
      const probe = new File([new Blob(["x"])], "p.png", { type: "image/png" });
      setCanShareFiles(!!navigator.canShare?.({ files: [probe] }));
    } catch {
      setCanShareFiles(false);
    }
    setHoy(
      new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
    );
    try {
      setSharedCount(parseInt(localStorage.getItem("vanguard_cards_shared") || "0", 10) || 0);
    } catch {
      /* sin almacenamiento */
    }
  }, []);

  const referral = `VGD-${(alias || "AGENTE").replace(/[^A-Z0-9]/gi, "").slice(0, 6).toUpperCase() || "AGENTE"}`;

  const generarPng = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    const dataUrl = await toPng(cardRef.current, {
      pixelRatio: 3,
      cacheBust: true,
      backgroundColor: "#050508",
    });
    const res = await fetch(dataUrl);
    return await res.blob();
  };

  const registrarDifusion = (motivo: string) => {
    // progreso de las DOS misiones virales (la diaria se resetea sola cada día UTC)
    progressMission("D_PREGON_1");
    progressMission("W_CARD_3");
    // contador global de la comunidad (shares:total) + campaña MISIÓN 100
    fetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "share" }),
    }).catch(() => {});
    window.dispatchEvent(new CustomEvent("vanguard:share"));
    const n = sharedCount + 1;
    setSharedCount(n);
    try {
      localStorage.setItem("vanguard_cards_shared", String(n));
    } catch {
      /* sin almacenamiento */
    }
    // +25 monedas por difundir, con enfriamiento de 60s anti-granja
    if (typeof window !== "undefined") {
      const last = parseInt(localStorage.getItem("vanguard_card_cd") || "0", 10);
      if (Date.now() - last >= 60_000) {
        localStorage.setItem("vanguard_card_cd", String(Date.now()));
        addCoins(25, motivo);
        toast.success("+25 monedas — tarjeta de guerra difundida");
      } else {
        toast.success("Tarjeta difundida — la alianza crece");
      }
    }
  };

  const compartirImagen = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const blob = await generarPng();
      if (!blob) throw new Error("sin blob");
      const file = new File([blob], "vanguard-tarjeta-de-guerra.png", { type: "image/png" });
      // SIN ENLACES: se comparte la IMAGEN pura (+ texto corto). Sin url.
      if (navigator.canShare?.({ files: [file] }) && navigator.share) {
        await navigator.share({
          files: [file],
          title: "VANGUARD — Tarjeta de guerra",
          text: SHARE_TEXT,
        });
        registrarDifusion("Tarjeta de guerra compartida como imagen");
      } else {
        // fallback escritorio: descarga la PNG para pegarla donde quiera
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "vanguard-tarjeta-de-guerra.png";
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Tarjeta descargada — envíala por WhatsApp como imagen");
        registrarDifusion("Tarjeta de guerra descargada y difundida");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("cancel") || msg.includes("abort")) return; // cancelado por el usuario
      toast.error("No se pudo generar la tarjeta — inténtalo de nuevo");
    } finally {
      setBusy(false);
    }
  };

  const descargarPng = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const blob = await generarPng();
      if (!blob) throw new Error("sin blob");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "vanguard-tarjeta-de-guerra.png";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PNG descargada — publícala y etiqueta #VANGUARD");
      registrarDifusion("Tarjeta de guerra descargada");
    } catch {
      toast.error("No se pudo generar el PNG — inténtalo de nuevo");
    } finally {
      setBusy(false);
    }
  };

  const pregonezCompleta = (pregonezHoy?.progress ?? 0) >= 1;

  return (
    <section className="mt-4 hud-panel p-5 relative overflow-hidden" aria-label="Tarjeta de guerra para compartir sin enlaces">
      <div className="hairline-gradient absolute top-0 left-0 right-0 opacity-60" aria-hidden />
      <div className="flex items-center gap-2 mb-1">
        <Flame className="w-5 h-5 text-crisis" />
        <h3 className="font-orbitron text-sm tracking-widest uppercase text-gradient">
          Tarjeta de guerra — comparte imagen, no enlaces
        </h3>
      </div>
      {!compact && (
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          Tu tarjeta lleva tus estadísticas reales impresas y la dirección del cuartel grabada en la
          imagen. Envíala por WhatsApp o Telegram <span className="text-crisis font-bold">como foto</span>:
          nada de links sosos — la invitación viaja como trofeo.{" "}
          <span className="text-green-hud">+25 monedas</span> por difundir y progreso de la misión{" "}
          <span className="text-amber font-bold">PREGONERO DE GUERRA</span>.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_300px] items-start">
        {/* ===== CONTROLES + ESTADO DE MISIÓN ===== */}
        <div className="grid gap-3 content-start">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={compartirImagen}
              disabled={busy}
              className="gap-2 font-mono text-[11px] uppercase tracking-widest border border-crisis/50 bg-crisis/15 hover:bg-crisis/25 text-crisis"
              variant="outline"
            >
              <Share2 className="w-4 h-4" />
              {busy ? "Generando…" : canShareFiles ? "Enviar imagen (WhatsApp, Telegram…)" : "Descargar y enviar imagen"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={descargarPng}
              disabled={busy}
              className="gap-2 font-mono text-[11px] uppercase tracking-widest"
            >
              <ImageDown className="w-4 h-4" /> Descargar PNG
            </Button>
          </div>
          <div className="text-[11px] font-mono text-muted-foreground space-y-1.5">
            <p className="flex items-center gap-1.5">
              {canShareFiles ? (
                <>
                  <Share2 className="w-3.5 h-3.5 text-green-hud" /> Tu móvil puede enviar la tarjeta
                  DIRECTO como imagen — cero enlaces.
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-amber" /> Este navegador descarga la PNG:
                  adjúntala en tu chat favorita.
                </>
              )}
            </p>
            <p className="flex items-center gap-1.5">
              {pregonezCompleta ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-hud" />
                  <span className="text-green-hud">PREGONERO DE GUERRA: completado HOY — reclama 80ⓒ+50XP en Misiones</span>
                </>
              ) : (
                <>
                  <Flame className="w-3.5 h-3.5 text-crisis" />
                  MISIÓN PREGONERO: difunde 1 tarjeta hoy → <span className="text-amber">80ⓒ+50XP</span>
                  {pregonezHoy?.claimed && <span className="text-muted-foreground"> (reclamada — vuelve mañana)</span>}
                </>
              )}
            </p>
            <p> Tarjetas difundidas en total: <span className="text-green-hud font-bold">{sharedCount}</span></p>
          </div>
        </div>

        {/* ===== PREVISUALIZACIÓN (capturable) ===== */}
        <div
          ref={cardRef}
          className="relative rounded-xl overflow-hidden border border-white/10 p-4 select-none"
          style={{ background: "linear-gradient(160deg, #050508 0%, #12060A 55%, #050508 100%)" }}
          aria-label="Previsualización de tu tarjeta de guerra"
        >
          <div className="flex items-center justify-between text-[8px] font-mono tracking-[0.28em] uppercase" style={{ color: "#5B6478" }}>
            <span>VANGUARD · EL MUNDO EN TIEMPO REAL</span>
            <span style={{ color: "#FF3B30" }}>● VIVO</span>
          </div>

          <div className="mt-3 flex justify-center">
            <OjoAbismo className="w-14 h-14" />
          </div>

          <div className="mt-2 text-center">
            <div className="font-orbitron text-lg font-black tracking-wide text-white leading-tight">
              {alias || "AGENTE"}
            </div>
            <div className="text-[9px] font-mono tracking-[0.2em] uppercase" style={{ color: "#FFB800" }}>
              NIVEL {level} · {rank || "RECLUTA"}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-1.5 text-center">
            <div className="rounded-md border border-white/10 py-1.5" style={{ background: "rgba(255,59,48,0.08)" }}>
              <div className="font-orbitron text-sm font-black" style={{ color: "#FF3B30" }}>{streak}</div>
              <div className="text-[7px] font-mono tracking-widest uppercase" style={{ color: "#8A93A6" }}>RACHA DÍAS</div>
            </div>
            <div className="rounded-md border border-white/10 py-1.5" style={{ background: "rgba(255,184,0,0.08)" }}>
              <div className="font-orbitron text-sm font-black" style={{ color: "#FFB800" }}>{seasonXp}</div>
              <div className="text-[7px] font-mono tracking-widest uppercase" style={{ color: "#8A93A6" }}>XP TEMPORADA</div>
            </div>
            <div className="rounded-md border border-white/10 py-1.5" style={{ background: "rgba(0,255,135,0.07)" }}>
              <div className="font-orbitron text-sm font-black" style={{ color: "#00FF87" }}>{coins}</div>
              <div className="text-[7px] font-mono tracking-widest uppercase" style={{ color: "#8A93A6" }}>MONEDAS</div>
            </div>
          </div>

          <div className="mt-3 text-center">
            <div className="font-orbitron text-[11px] font-black tracking-wider uppercase" style={{ color: "#FF3B30" }}>
              ¿Tienes el valor del abismo?
            </div>
            <div className="text-[8px] mt-0.5 leading-snug" style={{ color: "#B7BECD" }}>
              Guerra global en vivo · mapa OSINT 3D · examen del archivo · multijugador ELO
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[8px] font-mono tracking-widest uppercase" style={{ color: "#5B6478" }}>
            <span>JUEGA GRATIS · vanguard-kq9r.vercel.app</span>
            <span style={{ color: "#FFB800" }}>{referral}</span>
          </div>
          {hoy && (
            <div className="mt-1 text-right text-[7px] font-mono tracking-widest" style={{ color: "#3E4658" }}>
              EMITIDA {hoy}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

"use client";

// v20.1 TARJETA VIRAL — generador de memes geopolíticos con banderas verdaderas.
// Nace de la IDEA #3 del AGENTE DE MEJORA CONTINUA (agent-ctx/improvement-inbox.md):
// "Compartir historias — meme personalizado con país elegido · viralidad orgánica · Esfuerzo: S".
// Cada tarjeta lleva la firma VANGUARD + el código de referido del agente:
// todo meme exportado es una invitación disfrazada de contenido.

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Flag } from "@/lib/flags";
import { WORLD_FLAGS, countryName } from "@/lib/world-data";
import { Countryball } from "@/components/vanguard/countryball";
import { useGameStore } from "@/lib/game-store";
import { toast } from "sonner";
import { Download, Flame, Share2, Clapperboard, Laugh } from "lucide-react";

type PlantillaId = "vs" | "alerta" | "alianza" | "reto" | "expectativa" | "trato";

const PLANTILLAS: { id: PlantillaId; label: string; glifo: string; titulo: string; sub: (a: string, b: string) => string; acento: string }[] = [
  {
    id: "vs",
    label: "¿Quién ganaría?",
    glifo: "VS",
    titulo: "¿QUIÉN GANARÍA?",
    sub: (a, b) => `${a} contra ${b} — vota en el coliseo global`,
    acento: "#FF3B30",
  },
  {
    id: "alerta",
    label: "Alerta global",
    glifo: "⚠",
    titulo: "ALERTA GLOBAL",
    sub: (a, b) => `tensión máxima entre ${a} y ${b}`,
    acento: "#FFB800",
  },
  {
    id: "alianza",
    label: "Alianza épica",
    glifo: "+",
    titulo: "ALIANZA ÉPICA",
    sub: (a, b) => `${a} y ${b} dominan el tablero mundial`,
    acento: "#00FF87",
  },
  {
    id: "reto",
    label: "Tu misión",
    glifo: "➜",
    titulo: "TU MISIÓN, AGENTE",
    sub: (a, b) => `conquista ${b} saliendo desde ${a}`,
    acento: "#1E90FF",
  },
  {
    id: "expectativa",
    label: "Expectativa vs realidad",
    glifo: "≠",
    titulo: "EXPECTATIVA VS REALIDAD",
    sub: (a, b) => `lo que ${a} prometió vs lo que quedó en ${b}`,
    acento: "#FFD34D",
  },
  {
    id: "trato",
    label: "Trato secreto",
    glifo: "🤫",
    titulo: "TRATO SECRETO",
    sub: (a, b) => `se filtra: ${a} y ${b} firman a puerta cerrada`,
    acento: "#00FF87",
  },
];

export function ViralCard() {
  const alias = useGameStore((s) => s.alias);
  const addCoins = useGameStore((s) => s.addCoins);
  const [a, setA] = useState("do"); // República Dominicana por defecto (tierra del agente)
  const [b, setB] = useState("us");
  const [tpl, setTpl] = useState<PlantillaId>("vs");
  const [mode, setMode] = useState<"flag" | "ball">("flag");
  const [busy, setBusy] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const referral = `VGD-${(alias || "AGENTE").replace(/[^A-Z0-9]/gi, "").slice(0, 6).toUpperCase() || "AGENTE"}`;
  const t = PLANTILLAS.find((p) => p.id === tpl) ?? PLANTILLAS[0];
  const nameA = countryName(a) || a.toUpperCase();
  const nameB = countryName(b) || b.toUpperCase();

  const recompensar = (motivo: string) => {
    // +25 monedas por viralizar, con enfriamiento de 60s anti-granja
    if (typeof window === "undefined") return;
    const last = parseInt(localStorage.getItem("vanguard_viral_cd") || "0", 10);
    if (Date.now() - last < 60_000) return;
    localStorage.setItem("vanguard_viral_cd", String(Date.now()));
    addCoins(25, motivo);
    toast.success("+25 monedas — contenido viral difundido");
  };

  const abrirEstudio = () => {
    // v25: puente con el Estudio de Memes — precarga las dos naciones elegidas
    try {
      localStorage.setItem("vanguard_meme_prefill", JSON.stringify({ codes: [a, b] }));
    } catch {
      /* sin almacenamiento */
    }
    window.dispatchEvent(new CustomEvent("vanguard:navigate", { detail: "memes" }));
    toast.success("Tarjeta cargada en el Estudio de Memes — edítala y publícala");
  };

  const descargarPng = async () => {
    if (!cardRef.current || busy) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#0A0A0F",
      });
      const link = document.createElement("a");
      link.download = `vanguard-${a}-${b}-${tpl}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Tarjeta viral descargada — publícala y etiqueta #VANGUARD");
      recompensar("Tarjeta viral descargada");
    } catch {
      toast.error("No se pudo generar el PNG — inténtalo de nuevo");
    } finally {
      setBusy(false);
    }
  };

  const compartir = async () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/?ref=${referral}` : "https://vanguard.world";
    const texto = `${t.titulo} — ${t.sub(nameA, nameB)} · Simúlalo tú mismo en VANGUARD: ${url}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "VANGUARD — Tarjeta viral", text: texto, url });
        recompensar("Tarjeta viral compartida");
        return;
      } catch {
        /* cancelado */
      }
    }
    try {
      await navigator.clipboard.writeText(texto);
      toast.success("Texto de la tarjeta copiado para compartir");
      recompensar("Tarjeta viral compartida");
    } catch {
      /* sin permisos */
    }
  };

  return (
    <section className="mt-4 hud-panel p-5 relative overflow-hidden" aria-label="Generador de tarjeta viral">
      <div className="hairline-gradient absolute top-0 left-0 right-0 opacity-60" aria-hidden />
      <div className="flex items-center gap-2 mb-1">
        <Flame className="w-5 h-5 text-crisis" />
        <h3 className="font-orbitron text-sm tracking-widest uppercase text-gradient">Tarjeta viral — diseña tu meme geopolítico</h3>
        <span className="ml-auto text-[9px] font-mono text-muted-foreground/70 uppercase tracking-wider hidden sm:inline">
          <Clapperboard className="w-3 h-3 inline mr-1" />idea del agente de mejora
        </span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed mb-4">
        Elige dos naciones y una plantilla: la tarjeta sale con banderas verdaderas y lleva tu código{" "}
        <span className="text-amber font-bold">{referral}</span> impreso — cada meme compartido recluta agentes nuevos.{" "}
        <span className="text-green-hud">+25 monedas</span> por difundir.
      </p>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px] items-start">
        {/* ===== CONTROLES ===== */}
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Nación A</span>
            <select
              value={a}
              onChange={(e) => setA(e.target.value)}
              className="bg-background/60 border border-border rounded-md h-9 px-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-electric"
              aria-label="Elegir nación A"
            >
              {WORLD_FLAGS.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Nación B</span>
            <select
              value={b}
              onChange={(e) => setB(e.target.value)}
              className="bg-background/60 border border-border rounded-md h-9 px-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-crisis"
              aria-label="Elegir nación B"
            >
              {WORLD_FLAGS.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </label>
          <div className="sm:col-span-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1.5">Plantilla</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PLANTILLAS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setTpl(p.id)}
                  className={`h-9 rounded-md border text-[10px] font-mono uppercase tracking-wider transition-colors ${
                    tpl === p.id ? "border-electric bg-electric/10 text-electric" : "border-border text-muted-foreground hover:bg-white/5"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1.5">Estilo de retrato</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode("flag")}
                className={`h-9 rounded-md border text-[10px] font-mono uppercase tracking-wider transition-colors ${
                  mode === "flag" ? "border-amber bg-amber/10 text-amber" : "border-border text-muted-foreground hover:bg-white/5"
                }`}
              >
                Banderas rectangulares
              </button>
              <button
                onClick={() => setMode("ball")}
                className={`h-9 rounded-md border text-[10px] font-mono uppercase tracking-wider transition-colors ${
                  mode === "ball" ? "border-violet-400 bg-violet-400/10 text-violet-300" : "border-border text-muted-foreground hover:bg-white/5"
                }`}
              >
                Countryballs (personajes)
              </button>
            </div>
          </div>
          <div className="sm:col-span-2 flex flex-wrap gap-2 pt-1">
            <Button size="sm" onClick={descargarPng} disabled={busy} className="gap-2 font-mono text-[11px] uppercase tracking-widest">
              <Download className="w-4 h-4" /> {busy ? "Generando…" : "Descargar PNG"}
            </Button>
            <Button size="sm" variant="outline" onClick={compartir} className="gap-2 font-mono text-[11px] uppercase tracking-widest border-crisis/40 text-crisis hover:bg-crisis/10">
              <Share2 className="w-4 h-4" /> Compartir
            </Button>
            <Button size="sm" variant="outline" onClick={abrirEstudio} className="gap-2 font-mono text-[11px] uppercase tracking-widest border-violet-400/40 text-violet-300 hover:bg-violet-400/10">
              <Laugh className="w-4 h-4" /> Abrir en el Estudio de Memes
            </Button>
          </div>
        </div>

        {/* ===== PREVISUALIZACIÓN (capturable) ===== */}
        <div
          ref={cardRef}
          className="relative rounded-xl overflow-hidden border border-white/10 p-5 select-none"
          style={{ background: "linear-gradient(145deg, #0A0A0F 0%, #101423 55%, #0A0A0F 100%)" }}
          aria-label="Previsualización de la tarjeta viral"
        >
          <div className="flex items-center justify-between text-[9px] font-mono tracking-[0.3em] uppercase" style={{ color: "#5B6478" }}>
            <span>VANGUARD · EL MUNDO EN TIEMPO REAL</span>
            <span style={{ color: t.acento }}>● EN VIVO</span>
          </div>
          <div className="mt-5 flex items-center justify-center gap-4 sm:gap-6">
            <div className="flex flex-col items-center gap-2 w-[110px]">
              {mode === "flag" ? (
                <img src={`https://flagcdn.com/w160/${a}.png`} alt={nameA} className="w-20 h-auto rounded shadow-lg shadow-black/60" crossOrigin="anonymous" />
              ) : (
                <Countryball code={a} size={76} />
              )}
              <span className="font-orbitron text-[11px] uppercase tracking-wider text-white/90 text-center leading-tight">{nameA}</span>
            </div>
            <div className="font-orbitron text-3xl font-black" style={{ color: t.acento, textShadow: `0 0 18px ${t.acento}66` }}>
              {t.glifo}
            </div>
            <div className="flex flex-col items-center gap-2 w-[110px]">
              {mode === "flag" ? (
                <img src={`https://flagcdn.com/w160/${b}.png`} alt={nameB} className="w-20 h-auto rounded shadow-lg shadow-black/60" crossOrigin="anonymous" />
              ) : (
                <Countryball code={b} size={76} />
              )}
              <span className="font-orbitron text-[11px] uppercase tracking-wider text-white/90 text-center leading-tight">{nameB}</span>
            </div>
          </div>
          <div className="mt-5 text-center">
            <div className="font-orbitron text-base sm:text-lg font-black tracking-wide" style={{ color: t.acento }}>
              {t.titulo}
            </div>
            <div className="text-[11px] sm:text-xs text-white/70 mt-1 leading-snug">{t.sub(nameA, nameB)}</div>
          </div>
          <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[9px] font-mono tracking-widest uppercase" style={{ color: "#5B6478" }}>
            <span>vanguard.world</span>
            <span style={{ color: "#FFB800" }}>{referral}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

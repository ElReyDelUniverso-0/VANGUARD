"use client";

// v34 LLAMADO A LAS ARMAS — arsenal de reclutamiento para el comandante.
// El usuario NO es técnico: este kit le da todo masticado.
// 1) MEDIDOR DE AGENTES: cuánta gente ha entrado (total + hoy) — /api/visits.
// 2) KIT DE MENSAJES: 7 textos listos para copiar y pegar donde haya gente
//    (WhatsApp, Facebook, X, Discord, Reddit, TikTok/IG) con su enlace de referido.
// 3) PLAN DE GUERRA 7 DÍAS: qué hacer cada día para que llegue gente.

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/game-store";
import { toast } from "sonner";
import {
  Megaphone, Copy, Check, Users, CalendarDays, Radio, ChevronDown,
} from "lucide-react";

function buildReferral(alias: string | null) {
  const code = `VGD-${(alias || "AGENTE").replace(/[^A-Z0-9]/gi, "").slice(0, 6).toUpperCase() || "AGENTE"}`;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return { code, url: `${origin}/?ref=${code}` };
}

// ===== MEDIDOR DE AGENTES =====
function VisitMeter() {
  const [stats, setStats] = useState<{ total: number; today: number } | null>(null);

  useEffect(() => {
    // una sola cuenta por sesión (refrescos no inflan el número)
    if (sessionStorage.getItem("vanguard_counted") === "1") {
      fetch("/api/visits")
        .then((r) => r.json())
        .then((d) => d?.ok && setStats({ total: d.total, today: d.today }))
        .catch(() => {});
      return;
    }
    fetch("/api/visits", { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok) {
          sessionStorage.setItem("vanguard_counted", "1");
          setStats({ total: d.total, today: d.today });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="border border-electric/30 bg-electric/5 rounded-md px-4 py-3 text-center">
        <div className="font-orbitron text-2xl font-bold text-electric tabular-nums">
          {stats ? stats.today.toLocaleString("es") : "—"}
        </div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-1">
          <Radio className="w-3 h-3" /> agentes hoy
        </div>
      </div>
      <div className="border border-green-hud/30 bg-green-hud/5 rounded-md px-4 py-3 text-center">
        <div className="font-orbitron text-2xl font-bold text-green-hud tabular-nums">
          {stats ? stats.total.toLocaleString("es") : "—"}
        </div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-1">
          <Users className="w-3 h-3" /> agentes totales
        </div>
      </div>
    </div>
  );
}

// ===== KIT DE MENSAJES =====
interface KitMsg {
  id: string;
  where: string;
  hint: string;
  text: (url: string) => string;
}

const KIT: KitMsg[] = [
  {
    id: "wa-grupos",
    where: "WhatsApp · grupos",
    hint: "Grupos de familia, amigos, juegos o actualidad. Mándalo tal cual.",
    text: (u) =>
      `🛰️ Descubrí esta plataforma y está buenísima: VANGUARD — todo lo que pasa en el mundo en tiempo real. Noticias de guerras en vivo, un mapa 3D con aviones y tanques, y encima podés jugar guerra global con gente de todo el mundo. Gratis, sin instalar nada: ${u}`,
  },
  {
    id: "wa-estado",
    where: "WhatsApp · estado",
    hint: "Tu estado lo ven todos tus contactos. Publicalo 1 vez al día.",
    text: (u) =>
      `El mundo está pasando cosas AHORA. Miralas en vivo y jugá la guerra global: ${u} 🌍⚡`,
  },
  {
    id: "facebook",
    where: "Facebook · muro y grupos",
    hint: "Grupos de noticias, geopolítica, videojuegos o debates. Posteo honesto = más clics.",
    text: (u) =>
      `¿Os gustan los mapas, las noticias internacionales y los juegos de estrategia? Encontré VANGUARD: una plataforma GRATIS en español donde ves los conflictos del mundo en tiempo real, explorás un mapa 3D militar y jugás Partidas Mundiales multijugador con ranking. Funciona directo en el navegador del celular: ${u}`,
  },
  {
    id: "x",
    where: "X / Twitter",
    hint: "Responde noticias de guerra de cuentas grandes con tu enlace (sin spam).",
    text: (u) =>
      `Sigo el mundo en vivo en VANGUARD: mapa OSINT 3D, conflictos en tiempo real y guerra global multijugador. Gratis: ${u} #VANGUARD #OSINT #Geopolitica`,
  },
  {
    id: "discord",
    where: "Discord · servidores",
    hint: "Canales de #juegos, #off-topic o #noticias. Pregunta primero, comparte después.",
    text: (u) =>
      `Gente, les dejo esto: VANGUARD — conflictos mundiales en vivo + mapa 3D militar + guerra global multijugador por rondas. Todo gratis en el navegador: ${u} (yo ya tengo mi código de agente, ¡únanse a mi unidad!)`,
  },
  {
    id: "reddit",
    where: "Reddit",
    hint: "En r/argentina, r/mexico, r/Colombia o r/videojuegos: cuenta tu experiencia real.",
    text: (u) =>
      `Título: Encontré una plataforma gratis que mezcla noticias de guerra en vivo con un juego de estrategia mundial\n\nLa uso hace un rato: se llama VANGUARD y está en español. Tiene un mapa OSINT 3D con capas de inteligencia, noticias de conflictos actualizadas y un modo de guerra global multijugador con ranking ELO. No hay que instalar nada y no pide tarjeta. La comparto por si a alguien le interesa: ${u}`,
  },
  {
    id: "bio",
    where: "TikTok / Instagram · bio",
    hint: "Pega el enlace en tu bio y graba la pantalla mientras gira el globo 3D.",
    text: (u) =>
      `🌍 El mundo en vivo + guerra global\n🛰️ Mapa 3D militar en tiempo real\n🎮 Gratis, sin instalar nada\n${u}`,
  },
];

const PLAN = [
  { d: "DÍA 1", t: "Estados de WhatsApp + 3 grupos tuyos. Calienta motores." },
  { d: "DÍA 2", t: "Grupos de WhatsApp/Discord de juegos y noticias (5 sitios)." },
  { d: "DÍA 3", t: "Facebook: tu muro + 3 grupos grandes de geopolítica o videojuegos." },
  { d: "DÍA 4", t: "X/Twitter: responde 5 noticias de guerra con tu enlace." },
  { d: "DÍA 5", t: "TikTok: graba la pantalla girando el globo 3D con música. Sube el enlace en bio." },
  { d: "DÍA 6", t: "Retás a 5 amigos: quien entre con tu código suma a tu unidad." },
  { d: "DÍA 7", t: "Mira el medidor de agentes arriba y repite lo que más gente trajo." },
];

export function PromoKit() {
  const alias = useGameStore((s) => s.alias);
  const [copied, setCopied] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const { code, url } = buildReferral(alias);

  const copy = useCallback(async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(key);
    toast.success("Mensaje copiado — pégalo y listo");
    setTimeout(() => setCopied(null), 1800);
  }, []);

  return (
    <section className="mt-6 hud-panel p-5 relative overflow-hidden" aria-label="Kit de reclutamiento">
      <div className="hairline-gradient absolute top-0 left-0 right-0 opacity-60" aria-hidden />
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-amber" />
          <h3 className="font-orbitron text-sm tracking-widest uppercase text-gradient">
            Kit de reclutamiento — trae agentes
          </h3>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
        Todo lo que necesitas para que la gente llegue, en mensajes listos para copiar y pegar.
        Cada enlace lleva tu código <span className="text-amber font-bold font-mono">{code}</span> y
        el invitado recibe bono de bienvenida.
      </p>

      <div className="mt-4">
        <VisitMeter />
      </div>

      {open && (
        <>
          <div className="mt-5 grid gap-3">
            {KIT.map((m) => (
              <div key={m.id} className="border border-border rounded-md p-3 bg-black/20">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-widest text-electric font-bold">
                      {m.where}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{m.hint}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copy(m.text(url), m.id)}
                    className="shrink-0 gap-1.5 h-8 font-mono text-[10px] uppercase tracking-wider"
                  >
                    {copied === m.id ? (
                      <><Check className="w-3.5 h-3.5 text-green-hud" /> Copiado</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> Copiar</>
                    )}
                  </Button>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-foreground/80 font-mono whitespace-pre-line">
                  {m.text(url)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-border pt-4">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="w-4 h-4 text-green-hud" />
              <h4 className="font-orbitron text-xs tracking-widest uppercase text-green-hud">
                Plan de guerra · 7 días
              </h4>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2 text-[11px] font-mono">
              {PLAN.map((p) => (
                <li key={p.d} className="flex gap-2 items-start border border-border/60 rounded px-2.5 py-2 bg-black/10">
                  <span className="text-amber font-bold shrink-0">{p.d}</span>
                  <span className="text-muted-foreground leading-relaxed">{p.t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 text-[10px] font-mono text-muted-foreground/80">
            Hashtags que funcionan: #VANGUARD #ConflictosMundiales #GuerraEnVivo #OSINT
            #Geopolitica #MapaMundial #JuegoDeEstrategia
          </div>
        </>
      )}
    </section>
  );
}

"use client";

// ════════════════════════════════════════════════════════════════
// v213.0 EL PULSO — LA FRANJA DE ÚLTIMA HORA DEL OJO DE DIOS
// Mandato del Dueño: «el modo Ojo de Dios debería tener MÁS
// información». Esta franja enchufa el OJO a la redacción: sondea
// /api/pulso cada 60 s (solo con la pestaña visible) y muestra los
// cables REALES más frescos con su tier de impacto — el Ojo ya no
// solo mira: LEE el mundo. Sin recargas jamás (ley v190).
// ════════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";

interface CablePulso {
  id: string;
  title: string;
  source: string;
  url?: string | null;
  publishedAt?: string | Date;
  impacto: number;
  tier: "urgente" | "critico" | "alto" | "desarrollo" | "contexto";
  edad: string;
  edadMin: number;
  conflictTag?: string | null;
  cred: number;
}

interface StatsPulso {
  hoy: number;
  ultimaHora: number;
  urgente: number;
  teatros: number;
}

const TIER_COLOR: Record<CablePulso["tier"], string> = {
  urgente: "#FF3B30",
  critico: "#FF8A3D",
  alto: "#F5C542",
  desarrollo: "#7AB8FF",
  contexto: "#8B98AD",
};

function edadDe(iso?: string | Date | null): string {
  if (!iso) return "";
  const t = typeof iso === "string" ? new Date(iso).getTime() : iso.getTime();
  if (Number.isNaN(t)) return "";
  const min = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (min < 1) return "AHORA";
  if (min < 60) return `HACE ${min} MIN`;
  const h = Math.round(min / 60);
  if (h < 24) return `HACE ${h} H`;
  return `HACE ${Math.round(h / 24)} D`;
}

export function PulsoOjo() {
  const [cables, setCables] = useState<CablePulso[]>([]);
  const [stats, setStats] = useState<StatsPulso | null>(null);
  const [sinSenal, setSinSenal] = useState(false);

  useEffect(() => {
    let vivo = true;
    let timer = 0;
    const sondear = async () => {
      if (!vivo) return;
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        timer = window.setTimeout(sondear, 8000);
        return;
      }
      try {
        const r = await fetch("/api/pulso", { cache: "no-store" });
        if (r.ok && vivo) {
          const j = (await r.json()) as {
            ok?: boolean;
            items?: CablePulso[];
            stats?: StatsPulso;
          };
          if (j.ok && Array.isArray(j.items)) {
            setCables(j.items.slice(0, 4));
            if (j.stats) {
              setStats({
                hoy: j.stats.hoy,
                ultimaHora: j.stats.ultimaHora,
                urgente: j.stats.urgente,
                teatros: j.stats.teatros,
              });
            }
            setSinSenal(false);
          }
        } else if (vivo) {
          setSinSenal(true);
        }
      } catch {
        if (vivo) setSinSenal(true);
      }
      if (vivo) timer = window.setTimeout(sondear, 60_000);
    };
    sondear();
    return () => { vivo = false; window.clearTimeout(timer); };
  }, []);

  return (
    <div className="hud-panel p-3">
      <div className="flex items-center gap-1.5 mb-2 text-[9px] font-mono uppercase tracking-widest text-amber-hud">
        <Zap className="w-3 h-3" />
        EL PULSO · ÚLTIMA HORA REAL
        <span className="w-1.5 h-1.5 rounded-full bg-red-hud blink-soft ml-1" />
        <Link
          href="/en-vivo"
          className="ml-auto px-1.5 py-0.5 border border-amber-hud/60 text-amber-hud hover:bg-amber-hud/10 active:scale-95"
        >
          ABRIR SALA EN VIVO →
        </Link>
      </div>

      {stats && (
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mb-2 font-mono text-[8px] uppercase tracking-widest text-muted-foreground">
          <span>cables hoy <span className="text-foreground font-bold">{stats.hoy}</span></span>
          <span>última hora <span className="text-red-hud font-bold">{stats.ultimaHora}</span></span>
          <span>urgentes <span className="text-amber-hud font-bold">{stats.urgente}</span></span>
          <span>teatros <span className="text-cyan-hud font-bold">{stats.teatros}</span></span>
        </div>
      )}

      {sinSenal && cables.length === 0 && (
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-3 text-center">
          sin señal del pulso — el próximo latido reintenta
        </div>
      )}

      <div className="space-y-1.5">
        {cables.map((c) => (
          <div key={c.id} className="flex items-start gap-2 text-[10px] leading-snug border-l-2 pl-2 py-0.5" style={{ borderColor: TIER_COLOR[c.tier] ?? "#8B98AD" }}>
            <span className="font-mono text-[7px] uppercase px-1 border border-border text-muted-foreground shrink-0 mt-0.5">
              {c.impacto}
            </span>
            {c.url && c.url.startsWith("http") ? (
              <a href={c.url} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-0 break-words text-foreground/90 hover:text-amber-hud transition-colors">
                {c.title}
              </a>
            ) : (
              <span className="flex-1 min-w-0 break-words text-foreground/90">{c.title}</span>
            )}
            <span className="text-[8px] font-mono text-muted-foreground shrink-0 mt-0.5">
              {c.edad || edadDe(c.publishedAt)}
            </span>
          </div>
        ))}
        {!sinSenal && cables.length === 0 && (
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-3 text-center">
            sintonizando la redacción…
          </div>
        )}
      </div>
    </div>
  );
}

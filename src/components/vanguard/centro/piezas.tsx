"use client";

// v419.1 · PIEZAS DE LA CÁMARA — los ladrillos visuales del centro de investigación.
// Reglas de la casa que estas piezas respetan a propósito (las mide el aro de QA
// del departamento 10): texto nunca por debajo de 12 px y objetivos táctiles de
// 32 px como mínimo, incluso en teléfono.

import type { ReactNode } from "react";

export function Chip({
  activo,
  onClick,
  children,
  tono = "amber",
  titulo,
}: {
  activo?: boolean;
  onClick?: () => void;
  children: ReactNode;
  tono?: "amber" | "cyan" | "rojo" | "neutro";
  titulo?: string;
}) {
  const paleta = {
    amber: activo ? "border-amber-hud bg-amber-hud text-amber" : "border-border/70 text-muted-foreground hover:border-amber-hud hover:text-amber",
    cyan: activo ? "border-cyan-hud bg-cyan-hud text-cyan-hud" : "border-border/70 text-muted-foreground hover:border-cyan-hud",
    rojo: activo ? "border-red-hud bg-red-hud text-red-hud" : "border-border/70 text-muted-foreground hover:border-red-hud",
    neutro: activo ? "border-border bg-secondary text-foreground" : "border-border/60 text-muted-foreground hover:text-foreground",
  }[tono];
  const clase = `inline-flex min-h-[32px] items-center gap-1.5 rounded-sm border px-2.5 font-mono text-[12px] uppercase tracking-[0.12em] transition-colors ${paleta}`;
  if (!onClick) return <span className={clase} title={titulo}>{children}</span>;
  return (
    <button type="button" onClick={onClick} className={clase} title={titulo} aria-pressed={activo}>
      {children}
    </button>
  );
}

export function Boton({
  onClick,
  children,
  tono = "amber",
  disabled,
  full,
  titulo,
}: {
  onClick?: () => void;
  children: ReactNode;
  tono?: "amber" | "cyan" | "fantasma" | "rojo";
  disabled?: boolean;
  full?: boolean;
  titulo?: string;
}) {
  const paleta = {
    amber: "border-amber-hud bg-amber-hud text-amber hover:bg-amber-hud/70",
    cyan: "border-cyan-hud bg-cyan-hud text-cyan-hud hover:bg-cyan-hud/70",
    fantasma: "border-border text-muted-foreground hover:border-amber-hud hover:text-amber",
    rojo: "border-red-hud text-red-hud hover:bg-red-hud",
  }[tono];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={titulo}
      className={`inline-flex min-h-[38px] items-center justify-center gap-2 rounded-sm border px-3.5 font-mono text-[12px] uppercase tracking-[0.16em] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${paleta} ${full ? "w-full" : ""}`}
    >
      {children}
    </button>
  );
}

export function Etiqueta({ children, tono = "neutro" }: { children: ReactNode; tono?: "hecho" | "interp" | "noconf" | "neutro" }) {
  const c = {
    hecho: "border-cyan-hud/60 text-cyan-hud",
    interp: "border-amber-hud/60 text-amber",
    noconf: "border-red-hud/60 text-red-hud",
    neutro: "border-border/70 text-muted-foreground",
  }[tono];
  return (
    <span className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.16em] ${c}`}>
      {children}
    </span>
  );
}

export function Bloque({ titulo, children, nota, tono = "neutro" }: { titulo: string; children: ReactNode; nota?: string; tono?: "neutro" | "amber" | "cyan" | "rojo" }) {
  const borde = { neutro: "border-border/60", amber: "border-amber-hud/40", cyan: "border-cyan-hud/40", rojo: "border-red-hud/40" }[tono];
  return (
    <section className={`rounded-sm border ${borde} bg-card/40 p-3 sm:p-4`}>
      <header className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-mono text-[12px] uppercase tracking-[0.22em] text-muted-foreground">{titulo}</h3>
        {nota ? <span className="font-mono text-[12px] text-muted-foreground/70">{nota}</span> : null}
      </header>
      {children}
    </section>
  );
}

export function Barra({ valor, tono = "amber" }: { valor: number; tono?: "amber" | "cyan" | "rojo" }) {
  const color = { amber: "bg-amber", cyan: "bg-cyan-hud", rojo: "bg-red-hud" }[tono];
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/60">
      <div className={`h-full ${color}`} style={{ width: `${Math.max(0, Math.min(100, valor))}%` }} />
    </div>
  );
}

export function Vacio({ children }: { children: ReactNode }) {
  return <p className="py-3 font-mono text-[12.5px] leading-relaxed text-muted-foreground">{children}</p>;
}

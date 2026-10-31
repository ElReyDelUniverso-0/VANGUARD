"use client";

// ============================================================
// v214.0 LA PUERTA — LA FRANJA «TU MODO» DE LA PORTADA
// Si ya elegiste modo (ritual o /modo), la portada te recuerda tu
// puerta y te deja entrar con un toque (SIEMPRE toque — ley v190:
// nada navega solo). Si aún no elegiste, ofrece la puerta: /modo.
// Vivo en el aparato (vg-modo) + espejo en la nube (/api/auth/me).
// Español fijo (patrón Navegador v105).
// ============================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import { modoDe } from "@/lib/modos";

const LS_MODO = "vg-modo";

export function ModoActivo() {
  const [modoId, setModoId] = useState<string>("");
  const [listo, setListo] = useState(false);

  useEffect(() => {
    let vivo = true;
    (async () => {
      let local = "";
      try { local = localStorage.getItem(LS_MODO) || ""; } catch { /* aparato mudo */ }
      try {
        const r = await fetch("/api/auth/me", { cache: "no-store" });
        const j = (await r.json()) as { account?: { modo?: string } | null };
        if (!vivo) return;
        const deLaNube = j.account?.modo || "";
        if (deLaNube && deLaNube !== local) {
          try { localStorage.setItem(LS_MODO, deLaNube); } catch {}
          setModoId(deLaNube);
        } else {
          setModoId(local);
        }
      } catch {
        if (vivo) setModoId(local);
      } finally {
        if (vivo) setListo(true);
      }
    })();
    return () => { vivo = false; };
  }, []);

  if (!listo) return null;
  const modo = modoDe(modoId);

  if (!modo) {
    return (
      <Link
        href="/modo"
        className="group block border border-white/12 bg-black/30 rounded-md p-3 hover:border-amber-400/50 transition-colors"
        data-vg-modo-strip
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-muted-foreground border border-muted-foreground/30 bg-white/5 rounded px-2 py-0.5">
            🧭 La puerta
          </span>
          <span className="font-mono text-[12.5px] font-bold tracking-wide text-foreground group-hover:text-amber-200 transition-colors">
            ELIGE TU MODO — ¿qué quieres hacer en Vanguard?
          </span>
        </div>
        <p className="mt-1 text-[11.5px] text-muted-foreground leading-relaxed">
          VÉRTIGO, EN VIVO, GUERRA HOY, ZONA CERO, MISIONES o TODO: tu puerta de entrada de cada día, en /modo.
        </p>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap" data-vg-modo-strip>
      <Link
        href={modo.ruta}
        className="group flex items-center gap-2 min-w-0 border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 rounded-md px-3 py-1.5 transition-colors"
      >
        <span className="text-[13px]" aria-hidden>{modo.emoji}</span>
        <span className="font-mono text-[10px] tracking-[0.2em] text-amber uppercase shrink-0">Tu modo</span>
        <span className="font-mono text-[11.5px] font-bold text-foreground group-hover:text-amber-200 transition-colors truncate">
          {modo.nombre} ▸
        </span>
      </Link>
      <Link
        href="/modo"
        className="font-mono text-[10px] tracking-wide text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
      >
        cambiar
      </Link>
    </div>
  );
}

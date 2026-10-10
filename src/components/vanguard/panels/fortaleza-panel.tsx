"use client";

// Vanguard v102.0 LA CIUDADELA — PANEL FORTALEZA (SISTEMA).
// La seguridad pide el comandante se VE: sellos de acero activos, telemetría
// de los muros en vivo y el estado del pasaporte del analista. Si intentas
// publicar sin cuenta, este panel te explica por qué el muro existe.

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/lib/game-store";
import { ShieldCheck, ShieldAlert, Lock, Fingerprint, Eye, ServerCog, ScanFace } from "lucide-react";

interface Sello { id: string; label: string }
interface Estado {
  ok: boolean;
  sellos: Sello[];
  murosActivos: number;
  blindajes: number;
}

const ICONOS: Record<string, React.ReactNode> = {
  scrypt: <Lock className="w-4 h-4" />,
  hmac: <Fingerprint className="w-4 h-4" />,
  muros: <ShieldAlert className="w-4 h-4" />,
  lockout: <ScanFace className="w-4 h-4" />,
  moderador: <Eye className="w-4 h-4" />,
  sanit: <ShieldCheck className="w-4 h-4" />,
  cabeceras: <ServerCog className="w-4 h-4" />,
  pasaporte: <Fingerprint className="w-4 h-4" />,
};

export function FortalezaPanel() {
  const account = useGameStore((s) => s.account);
  const [estado, setEstado] = useState<Estado | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const res = await fetch("/api/fortaleza", { cache: "no-store" });
        const data = await res.json();
        if (vivo && data.ok) setEstado(data);
        else if (vivo) setError(true);
      } catch {
        if (vivo) setError(true);
      }
    })();
    return () => { vivo = false; };
  }, []);

  return (
    <div className="space-y-4 v101-panel">
      <div className="hud-panel border-green-hud/50 p-4 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-green-hud/10 blur-2xl pointer-events-none" aria-hidden />
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-sm border border-green-hud bg-green-hud/15 flex items-center justify-center shrink-0 v102-latido">
            <ShieldCheck className="w-5 h-5 text-green-hud" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-base font-bold uppercase tracking-[0.2em] text-green-hud leading-tight">
              FORTALEZA DE ACERO
            </h2>
            <p className="text-[11px] font-mono text-muted-foreground leading-relaxed mt-0.5">
              Los muros invisibles que protegen Vanguard — cifrado, muros de frecuencia, moderación IA y sesiones firmadas.
            </p>
          </div>
        </div>

        {/* estado del pasaporte */}
        <div className={cn(
          "mt-3 flex items-center gap-2 px-3 py-2 rounded-sm border text-[10px] font-mono uppercase tracking-widest",
          account ? "border-green-hud/50 bg-green-hud/10 text-green-hud" : "border-amber-hud/50 bg-amber-hud/10 text-amber"
        )}>
          <Fingerprint className="w-3.5 h-3.5 shrink-0" />
          {account
            ? <>Pasaporte firmado: <b className="ml-1">{account.username}</b> · sesión cifrada de 30 días</>
            : <>Exploras como VISITANTE · crea tu pasaporte para publicar juegos y guardar tu progreso en la nube</>}
        </div>
      </div>

      {/* telemetría */}
      <div className="grid grid-cols-2 gap-2">
        <div className="hud-panel border-border/60 p-3 text-center">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Muros activos</p>
          <motion.p key={estado?.murosActivos} initial={{ scale: 1.3 }} animate={{ scale: 1 }}
            className="font-mono text-2xl font-bold text-green-hud">
            {estado ? estado.murosActivos : "—"}
          </motion.p>
        </div>
        <div className="hud-panel border-border/60 p-3 text-center">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Blindajes de login</p>
          <motion.p key={estado?.blindajes} initial={{ scale: 1.3 }} animate={{ scale: 1 }}
            className="font-mono text-2xl font-bold text-amber">
            {estado ? estado.blindajes : "—"}
          </motion.p>
        </div>
      </div>

      {/* sellos */}
      <div className="hud-panel border-border/60 p-3.5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-foreground mb-2.5">
          SELLOS DE ACERO ACTIVOS
        </p>
        {error && (
          <p className="font-mono text-[11px] text-red-hud">La fortaleza no responde — inténtalo de nuevo en unos segundos.</p>
        )}
        <div className="space-y-2">
          {(estado?.sellos ?? []).map((s, i) => (
            <motion.div key={s.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.5) }}
              className="flex items-start gap-2.5 px-2.5 py-2 rounded-sm border border-green-hud/25 bg-green-hud/5">
              <span className="text-green-hud shrink-0 mt-0.5">{ICONOS[s.id] ?? <ShieldCheck className="w-4 h-4" />}</span>
              <span className="text-[11px] font-mono text-foreground/90 leading-snug">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <p className="text-[10px] font-mono text-muted-foreground/70 leading-relaxed px-1">
        La Ciudadela nunca usa notificaciones engañosas ni castiga si faltas un día: los muros existen para que
        confíes en lo que ves, no para asustarte.
      </p>
    </div>
  );
}

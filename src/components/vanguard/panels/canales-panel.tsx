"use client";

// v89.0 OPERACIÓN ESPEJO — CANALES OSINT (espejo del agregador de canales que
// todo analista tiene abierto: lista de canales a la izquierda con sus sellos,
// flujo de mensajes a la derecha con vistas, reenvíos y CONTRASTE contra el
// motor de PULSOS — si un mensaje coincide con un cable del mundo, se estampa
// el sello de verificación).

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rss, Eye, Forward, BadgeCheck, ShieldAlert, Search, Users } from "lucide-react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { CANALES, canalDe, generarMensajes, horaCorta, type MensajeCanal } from "@/lib/canales-data";
import { cn } from "@/lib/utils";

export function CanalesPanel() {
  const [mensajes, setMensajes] = useState<MensajeCanal[]>([]);
  const [canalFiltro, setCanalFiltro] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [ahora, setAhora] = useState(() => Date.now());
  const [leidos, setLeidos] = useState<Set<string>>(new Set());

  // refresco en vivo cada 30 s (nuevos mensajes entran deslizándose)
  useEffect(() => {
    setMensajes(generarMensajes(4 * 3600_000, Date.now()));
    const t = setInterval(() => {
      setAhora(Date.now());
      setMensajes(generarMensajes(4 * 3600_000, Date.now()));
    }, 30_000);
    return () => clearInterval(t);
  }, []);

  const visibles = useMemo(
    () =>
      mensajes
        .filter((m) => !canalFiltro || m.canal === canalFiltro)
        .filter((m) => !q || m.texto.toLowerCase().includes(q.toLowerCase())),
    [mensajes, canalFiltro, q]
  );

  const noLeidos = (id: string) => mensajes.filter((m) => m.canal === id && !leidos.has(m.id)).length;

  const marcarLeidos = (id: string) =>
    setLeidos((s) => {
      const n = new Set(s);
      mensajes.filter((m) => m.canal === id).forEach((m) => n.add(m.id));
      return n;
    });

  const msg = (id: string) => {
    const c = canalDe(id);
    return c;
  };

  const verificados = visibles.filter((m) => m.coincideCable).length;

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Canales OSINT en vivo"
        subtitle="La escucha abierta del planeta — contrastada contra los cables de Vanguard"
        icon={<Rss className="w-4 h-4 text-violet-hud" />}
        color="violet"
        right={
          <span className="flex items-center gap-1.5 text-[9px] font-mono uppercase px-2 py-1 border border-violet-hud/60 text-violet-hud bg-violet-hud/10">
            <span className="beacon w-1.5 h-1.5 rounded-full bg-violet-hud" /> {visibles.length} MENSAJES
          </span>
        }
      />
      <HeroOro panel="canales" />

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-3">
        {/* CANALES */}
        <div className="hud-panel p-2 space-y-1 max-h-[600px] overflow-y-auto thin-scroll">
          <button
            onClick={() => { setCanalFiltro(null); marcarLeidosTodos(); }}
            className={cn(
              "w-full flex items-center gap-2 px-2 py-1.5 border text-left transition-all",
              !canalFiltro ? "border-violet-hud bg-violet-hud/15" : "border-transparent hover:border-border"
            )}
          >
            <span className="w-7 h-7 rounded-full bg-violet-hud/20 flex items-center justify-center text-[11px]">🌐</span>
            <span className="flex-1 min-w-0">
              <span className="block text-[11px] font-mono uppercase font-bold text-violet-hud">TODOS</span>
              <span className="block text-[9px] font-mono text-muted-foreground">escucha global</span>
            </span>
            <span className="text-[9px] font-mono text-muted-foreground">{mensajes.length}</span>
          </button>
          {CANALES.map((c) => {
            const nl = noLeidos(c.id);
            const activo = canalFiltro === c.id;
            return (
              <button
                key={c.id}
                onClick={() => { setCanalFiltro(c.id); marcarLeidos(c.id); }}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 border text-left transition-all active:scale-[0.99]",
                  activo ? "border-violet-hud bg-violet-hud/15" : "border-transparent hover:border-border"
                )}
              >
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] shrink-0" style={{ background: `${c.color}22`, border: `1px solid ${c.color}55` }}>
                  {c.emoji}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-1">
                    <span className="text-[11px] font-mono font-bold truncate" style={{ color: c.color }}>{c.nombre}</span>
                    {c.verificado ? <BadgeCheck className="w-3 h-3 text-emerald-400 shrink-0" /> : <ShieldAlert className="w-3 h-3 text-amber shrink-0" />}
                  </span>
                  <span className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground">
                    <Users className="w-2.5 h-2.5" /> {(c.subs / 1000).toFixed(0)}K · {c.tipo.toLowerCase()}
                  </span>
                </span>
                {nl > 0 && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-violet-hud text-background min-w-[18px] text-center">{nl}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* FLUJO */}
        <div className="hud-panel flex flex-col overflow-hidden max-h-[600px]">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border/60">
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="buscar en la escucha…"
              className="flex-1 bg-transparent text-[11px] font-mono outline-none placeholder:text-muted-foreground"
            />
            <span className="text-[9px] font-mono uppercase text-emerald-400 hidden sm:flex items-center gap-1">
              <BadgeCheck className="w-3 h-3" /> {verificados} contrastados
            </span>
          </div>
          <div className="overflow-y-auto thin-scroll flex-1 p-2.5 space-y-2">
            <AnimatePresence initial={false}>
              {visibles.slice(0, 60).map((m, idx) => {
                const c = msg(m.canal);
                return (
                  <motion.div
                    key={m.id + c.id}
                    initial={{ opacity: 0, y: 16, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: Math.min(idx * 0.025, 0.5) }}
                    className="border border-border/60 bg-background/50 p-2.5 hover:border-violet-hud/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0" style={{ background: `${c.color}22`, border: `1px solid ${c.color}55` }}>
                        {c.emoji}
                      </span>
                      <span className="text-[11px] font-mono font-bold truncate" style={{ color: c.color }}>{c.nombre}</span>
                      {c.verificado && <BadgeCheck className="w-3 h-3 text-emerald-400 shrink-0" />}
                      <span className="ml-auto text-[9px] font-mono text-muted-foreground shrink-0">{horaCorta(m.ts)}</span>
                    </div>
                    <p className="text-[12px] leading-relaxed text-foreground/90">{m.texto}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground"><Eye className="w-3 h-3" /> {m.vistas.toLocaleString("es-ES")}</span>
                      <span className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground"><Forward className="w-3 h-3" /> {m.reenvios.toLocaleString("es-ES")}</span>
                      {m.coincideCable ? (
                        <span className="ml-auto text-[8px] font-mono uppercase px-1.5 py-0.5 border border-emerald-500/60 text-emerald-400 bg-emerald-500/10">
                          ✔ coincide con cable verificado
                        </span>
                      ) : (
                        <span className="ml-auto text-[8px] font-mono uppercase px-1.5 py-0.5 border border-amber/50 text-amber bg-amber/10">
                          sin verificar · tómelo con pinzas
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {visibles.length === 0 && (
              <p className="text-[10px] font-mono uppercase text-muted-foreground text-center py-8">
                la escucha está en silencio con ese filtro — prueba con otro canal
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  function marcarLeidosTodos() {
    setLeidos((s) => {
      const n = new Set(s);
      mensajes.forEach((m) => n.add(m.id));
      return n;
    });
  }
}

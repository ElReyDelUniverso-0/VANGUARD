"use client";

// ============================================================
// VANGUARD v24 — CRÍMENES Y ABUSOS · EL LADO DESAGRADABLE
// Base de datos documentada de abusos en las guerras actuales,
// con fuentes (ONU, HRW, Amnistía, OSCE, ACLED) y puente
// directo al sistema de DENUNCIAS de los foros.
// ============================================================
import { useMemo, useState } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { FlagBadge } from "@/components/vanguard/flag-badge";
import { WAR_ABUSES, ABUSE_TYPES, type WarAbuse } from "@/lib/dark-data";
import { useGameStore } from "@/lib/game-store";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { AlertTriangle, ShieldCheck, Scale, FileWarning, X, Search, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const LS_ABUSE_DOC = "vanguard_abuse_doc_cd"; // cooldown de recompensa por documentar

const WAR_FILTERS = ["TODAS", "UCRANIA", "GAZA", "SUDÁN", "MYANMAR", "GLOBAL"] as const;

export function AbusosPanel() {
  const alias = useGameStore((s) => s.alias);
  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);
  const [war, setWar] = useState<string>("TODAS");
  const [type, setType] = useState<string>("TODOS");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<WarAbuse | null>(null);
  const [denunciaOpen, setDenunciaOpen] = useState<WarAbuse | null>(null);
  const [dTitle, setDTitle] = useState("");
  const [dDetail, setDDetail] = useState("");
  const [dEvidence, setDEvidence] = useState("");
  const [sending, setSending] = useState(false);

  const filtered = useMemo(() => {
    let list = WAR_ABUSES;
    if (war !== "TODAS") list = list.filter((a) => a.war === war);
    if (type !== "TODOS") list = list.filter((a) => a.type === type);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (a) => a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q) || a.location.toLowerCase().includes(q)
      );
    }
    return list;
  }, [war, type, query]);

  const typeCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const a of WAR_ABUSES) m[a.type] = (m[a.type] ?? 0) + 1;
    return m;
  }, []);

  const documentar = (abuse: WarAbuse) => {
    setSelected(null);
    setDenunciaOpen(abuse);
    setDTitle(`Verificación cruzada: ${abuse.title}`);
    setDDetail(`Solicito verificación comunitaria del caso documentado en VANGUARD.\n\nCaso: ${abuse.title}\nUbicación: ${abuse.location} (${abuse.date})\nCifras: ${abuse.deaths}\nFuentes: ${abuse.sources.map((s) => `${s.org} — ${s.label}`).join(" · ")}`);
  };

  const sendDenuncia = async () => {
    if (!denunciaOpen) return;
    if (dTitle.trim().length < 8 || dDetail.trim().length < 20) {
      toast.error("Título (8+) y detalle (20+) obligatorios");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/denuncias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: alias || "OPERADOR",
          country: denunciaOpen.countries[0] ?? "un",
          category: denunciaOpen.type === "ATAQUE_CIVILES" || denunciaOpen.type === "EJECUCIONES" ? "CRIMEN_GUERRA" : "ABUSO",
          title: dTitle,
          detail: dDetail,
          evidenceUrl: dEvidence,
          location: denunciaOpen.location,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      // recompensa única cada 12h por documentar
      let cd: Record<string, number> = {};
      try { cd = JSON.parse(localStorage.getItem(LS_ABUSE_DOC) ?? "{}"); } catch { /* noop */ }
      const now = Date.now();
      if (!cd.last || now - cd.last > 12 * 3600 * 1000) {
        cd.last = now;
        localStorage.setItem(LS_ABUSE_DOC, JSON.stringify(cd));
        addCoins(15, "Documentar abuso de guerra");
        addXp(8);
        toast.success("⚖️ Denuncia registrada en foros · +15 monedas, +8 XP");
      } else {
        toast.success("⚖️ Denuncia registrada en el sistema de foros");
      }
      setDenunciaOpen(null);
      setDEvidence("");
      window.dispatchEvent(new CustomEvent("vanguard:navigate", { detail: "foros" }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al enviar");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Crímenes y abusos · Lo que prefieren que no veas"
        subtitle={`${WAR_ABUSES.length} casos documentados con fuente primaria · ${filtered.length} en vista`}
        icon={<Scale className="w-4 h-4 text-red-hud" />}
        color="red"
      />

      {/* ADVERTENCIA de contenido */}
      <div className="hud-corner p-3 border-red-hud/50 bg-red-hud/10">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-hud mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[11px] font-mono uppercase text-red-hud tracking-wider">Advertencia de contenido</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
              Esta sección documenta el lado desagradable de los conflictos: miles de personas mueren, son torturadas
              o desplazadas. Las descripciones son sobrias y verificadas, pero pueden herir tu sensibilidad. Todas las
              entradas citan fuentes primarias (ONU, HRW, Amnistía Internacional, OSCE, ACLED) para que puedas
              comprobar cada dato tú mismo.
            </p>
          </div>
        </div>
      </div>

      {/* Contadores del lado oscuro */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { n: "12", l: "conflictos activos monitorizados" },
          { n: ">28.000", l: "muertos violentos en Sudán (ACLED)" },
          { n: ">50.000", l: "muertos en Gaza (Gaza MoH, ONU fiable)" },
          { n: "12 M", l: "desplazados solo en Sudán (UNHCR)" },
        ].map((s) => (
          <div key={s.l} className="hud-corner p-2.5 text-center">
            <p className="font-mono text-lg font-bold text-red-hud leading-none">{s.n}</p>
            <p className="text-[9px] font-mono text-muted-foreground uppercase mt-1 leading-tight">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="hud-corner p-2 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar caso, ubicación..."
            className="h-7 flex-1 min-w-[140px] bg-background/60 border-border font-mono text-[11px]"
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {WAR_FILTERS.map((w) => (
            <button
              key={w}
              onClick={() => setWar(w)}
              className={cn(
                "px-1.5 py-0.5 border text-[9px] font-mono uppercase transition-colors",
                war === w ? "border-red-hud text-red-hud bg-red-hud/20" : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {w}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => setType("TODOS")}
            className={cn(
              "px-1.5 py-0.5 border text-[9px] font-mono uppercase transition-colors",
              type === "TODOS" ? "border-red-hud text-red-hud bg-red-hud/20" : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            todos ({WAR_ABUSES.length})
          </button>
          {Object.entries(ABUSE_TYPES).map(([k, m]) => (
            <button
              key={k}
              onClick={() => setType(k)}
              className={cn(
                "px-1.5 py-0.5 border text-[9px] font-mono uppercase transition-colors",
                type === k ? "border-red-hud text-red-hud bg-red-hud/20" : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {m.icon} {m.label.toLowerCase()} ({typeCounts[k] ?? 0})
            </button>
          ))}
        </div>
      </div>

      {/* Lista de abusos */}
      <div className="grid gap-2">
        {filtered.map((a, i) => {
          const tm = ABUSE_TYPES[a.type];
          return (
            <motion.article
              key={a.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="hud-corner p-3 hover:bg-secondary/40 transition-colors cursor-pointer group"
              onClick={() => setSelected(a)}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 flex-shrink-0 hud-corner bg-secondary/40 flex items-center justify-center border border-border text-base">
                  {tm.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className={cn("text-[9px] font-mono px-1.5 py-0.5 border uppercase", tm.color)}>{tm.label}</span>
                    {a.countries.map((c) => <FlagBadge key={c} code={c} size="sm" />)}
                    <span className="text-[9px] font-mono px-1.5 py-0.5 border border-border text-muted-foreground uppercase">{a.war}</span>
                    {a.verified && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 border border-green-hud/50 text-green-hud uppercase flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5" /> verificado
                      </span>
                    )}
                    <span className="text-[9px] font-mono text-muted-foreground ml-auto">{a.date}</span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-red-hud transition-colors leading-tight">{a.title}</h3>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase mt-0.5">📍 {a.location} · 💀 {a.deaths}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-1 line-clamp-2">{a.summary}</p>
                </div>
              </div>
            </motion.article>
          );
        })}
        {filtered.length === 0 && (
          <div className="hud-corner p-8 text-center text-muted-foreground">
            <FileWarning className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-mono">Sin casos con ese filtro</p>
          </div>
        )}
      </div>

      {/* Modal detalle */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4" onClick={() => setSelected(null)} role="dialog" aria-modal="true">
          <div className="hud-panel border-red-hud max-w-xl w-full max-h-[85vh] overflow-y-auto thin-scroll p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  <span className={cn("text-[9px] font-mono px-1.5 py-0.5 border uppercase", ABUSE_TYPES[selected.type].color)}>
                    {ABUSE_TYPES[selected.type].label}
                  </span>
                  <span className="text-[9px] font-mono text-muted-foreground uppercase">{selected.date}</span>
                </div>
                <h3 className="font-mono text-base font-bold text-foreground leading-tight">{selected.title}</h3>
                <p className="text-[10px] font-mono text-muted-foreground uppercase mt-1">📍 {selected.location} · 💀 {selected.deaths}</p>
              </div>
              <button onClick={() => setSelected(null)} aria-label="Cerrar" className="p-1 border border-border hover:border-red-hud text-muted-foreground hover:text-red-hud transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-foreground/90 leading-relaxed mt-3">{selected.summary}</p>

            <div className="mt-3 border-t border-red-hud/20 pt-2">
              <p className="text-[10px] font-mono uppercase text-muted-foreground mb-1.5">Fuentes primarias</p>
              <div className="space-y-1">
                {selected.sources.map((s) => (
                  <div key={s.label} className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-hud">
                    <ShieldCheck className="w-3 h-3 flex-shrink-0 text-green-hud" />
                    <span className="uppercase">{s.org}</span>
                    <span className="text-muted-foreground">· {s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <Button
                size="sm"
                onClick={() => documentar(selected)}
                className="h-7 font-mono text-[10px] uppercase bg-red-hud/40 border border-red-hud text-red-hud hover:bg-red-hud/60"
              >
                <Scale className="w-3 h-3 mr-1" /> Documentar en foros
              </Button>
              <a
                href={`https://www.ohchr.org/es`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[10px] font-mono uppercase text-cyan-hud hover:underline"
              >
                <ExternalLink className="w-3 h-3" /> verificar en ohchr
              </a>
              <button
                onClick={() => setSelected(null)}
                className="ml-auto px-3 py-1.5 border border-border text-[10px] font-mono uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal documentar → denuncia */}
      {denunciaOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4" onClick={() => setDenunciaOpen(null)} role="dialog" aria-modal="true">
          <div className="hud-panel border-amber-hud max-w-lg w-full max-h-[85vh] overflow-y-auto thin-scroll p-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-mono text-sm font-bold uppercase text-amber flex items-center gap-2">
              <Scale className="w-4 h-4" /> Documentar caso en los foros
            </h3>
            <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
              Se enviará al sistema de DENUNCIAS de la comunidad, donde otros operadores con cuenta dedicada podrán
              apoyarla y los embajadores votarán con peso doble. Los embajadores no pueden editar tu texto: se publica tal cual.
            </p>
            <div className="space-y-2 mt-3">
              <Input value={dTitle} onChange={(e) => setDTitle(e.target.value)} placeholder="Título de la denuncia (min. 8)" className="bg-background/60 border-border font-mono text-xs" maxLength={140} />
              <Textarea value={dDetail} onChange={(e) => setDDetail(e.target.value)} placeholder="Detalle (min. 20)" className="min-h-[110px] bg-background/60 border-border font-mono text-xs" maxLength={3000} />
              <Input value={dEvidence} onChange={(e) => setDEvidence(e.target.value)} placeholder="URL de evidencia (opcional)" className="bg-background/60 border-border font-mono text-xs" maxLength={400} />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Button size="sm" onClick={sendDenuncia} disabled={sending} className="h-7 font-mono text-[10px] uppercase bg-amber-hud border border-amber-hud text-amber hover:bg-amber-hud/70 disabled:opacity-50">
                {sending ? "Enviando..." : "Enviar denuncia"}
              </Button>
              <button onClick={() => setDenunciaOpen(null)} className="ml-auto px-3 py-1.5 border border-border text-[10px] font-mono uppercase text-muted-foreground hover:text-foreground">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

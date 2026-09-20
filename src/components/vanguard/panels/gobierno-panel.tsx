"use client";

// VANGUARD v27 — GOBIERNO MUNDIAL
// El embajador ELECTO de cada país puede TOMAR EL PODER como PRESIDENTE,
// nombrar CANCILLER / GENERAL / MINISTRO DE PRENSA, reclutar jugadores a los
// departamentos de su nación y publicar DECRETOS oficiales. Poder político =
// roster x10 + decretos x25 + base 100. El ranking mundial muestra quién manda.

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Landmark, Crown, ScrollText, Users, ShieldHalf, Vote, Loader2, Megaphone, UserPlus, LogOut,
  Anchor, Plane, VenetianMask, Coins,
} from "lucide-react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { Countryball } from "@/components/vanguard/countryball";
import { WORLD_FLAGS, countryName } from "@/lib/world-data";
import { useGameStore } from "@/lib/game-store";
import { sfx } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/components/vanguard/creador-parts";

interface GovRole { id: string; country: string; role: string; alias: string; appointedBy: string }
interface GovRecruit { id: string; alias: string; dept: string }
interface Decree { id: string; title: string; body: string; author: string; createdAt: string }
interface GovData {
  cycle: { cycle: string; phase: string; daysLeft: number };
  electedAmbassador: string;
  roles: GovRole[];
  roster: GovRecruit[];
  decrees: Decree[];
  power: number;
}
interface PowerRow { country: string; president: string; roster: number; decrees: number; power: number }

// v28 — JERARQUÍA COMPLETA (8 cargos, el presidente nombra 7)
const ROLE_META: Record<string, { label: string; icon: React.ReactNode }> = {
  PRESIDENTE: { label: "Presidente", icon: <Crown className="w-3.5 h-3.5 text-amber" /> },
  CANCILLER: { label: "Canciller", icon: <Landmark className="w-3.5 h-3.5 text-cyan-hud" /> },
  GENERAL: { label: "General", icon: <ShieldHalf className="w-3.5 h-3.5 text-red-hud" /> },
  ALMIRANTE: { label: "Almirante", icon: <Anchor className="w-3.5 h-3.5 text-cyan-hud" /> },
  MARISCAL_AIRE: { label: "Mariscal del Aire", icon: <Plane className="w-3.5 h-3.5 text-amber" /> },
  ESPIA_MAESTRO: { label: "Espía Maestro", icon: <VenetianMask className="w-3.5 h-3.5 text-violet-hud" /> },
  TESORERO: { label: "Tesoro", icon: <Coins className="w-3.5 h-3.5 text-green-hud" /> },
  MINISTRO_PRENSA: { label: "Ministro de Prensa", icon: <Megaphone className="w-3.5 h-3.5 text-violet-hud" /> },
};

const DEPTS = [
  { id: "MILITAR", desc: "Defensa y operaciones" },
  { id: "DIPLOMACIA", desc: "Tratados y alianzas" },
  { id: "INTELIGENCIA", desc: "OSINT y análisis" },
  { id: "PRENSA", desc: "Difusión y medios" },
  { id: "ECONOMIA", desc: "Fábricas y bolsa de monedas" },
];

export function GobiernoPanel() {
  const alias = useGameStore((s) => s.alias);
  const addXp = useGameStore((s) => s.addXp);
  const addCoins = useGameStore((s) => s.addCoins);
  const [country, setCountry] = useState("ua");
  const [data, setData] = useState<GovData | null>(null);
  const [ranking, setRanking] = useState<PowerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  // formulario de decreto (presidente)
  const [decTitle, setDecTitle] = useState("");
  const [decBody, setDecBody] = useState("");
  // nombramientos
  const [appointAlias, setAppointAlias] = useState("");
  const [appointRole, setAppointRole] = useState("CANCILLER");
  // reclutamiento
  const [dept, setDept] = useState("MILITAR");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [gRes, rRes] = await Promise.all([
        fetch(`/api/government?country=${country}`, { cache: "no-store" }),
        fetch(`/api/government`, { cache: "no-store" }),
      ]);
      const g = await gRes.json();
      const r = await rRes.json();
      setData(g);
      setRanking(r.ranking ?? []);
    } catch {
      toast.error("Sin conexión con el gobierno");
    } finally {
      setLoading(false);
    }
  }, [country]);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (payload: Record<string, unknown>) => {
    setBusy(true);
    try {
      const res = await fetch("/api/government", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alias: alias || "ANÓNIMO", country, ...payload }),
      });
      const out = await res.json();
      if (!res.ok) {
        toast.error(out.error || "El gobierno rechazó la acción");
        sfx.error();
        return null;
      }
      sfx.reward();
      toast.success(out.message || "Hecho");
      addXp(5);
      void load();
      return out;
    } catch {
      toast.error("Sin conexión");
      return null;
    } finally {
      setBusy(false);
    }
  };

  const president = data?.roles.find((r) => r.role === "PRESIDENTE");
  const isPresident = !!president && president.alias === (alias || "ANÓNIMO");
  const iAmElected = !!data?.electedAmbassador && data.electedAmbassador === (alias || "ANÓNIMO");
  const mineJoined = data?.roster.some((r) => r.alias === (alias || "ANÓNIMO"));

  return (
    <div className="space-y-4">
      <PanelHeader
        title="GOBIERNO MUNDIAL"
        subtitle="El embajador electo toma el poder, nombra ministros, recluta jugadores y publica decretos — el poder político se pelea país por país"
        icon={<Landmark className="w-5 h-5" />}
        color="amber"
      />

      {/* selector de país + ranking toggle */}
      <div className="flex gap-2 items-end flex-wrap">
        <label className="flex-1 min-w-[220px]">
          <span className="text-[9px] font-mono uppercase text-muted-foreground">Gobierno de qué país</span>
          <select value={country} onChange={(e) => setCountry(e.target.value)}
            className="w-full bg-secondary border border-amber-hud/30 rounded-sm px-2 py-1.5 text-[11px]">
            {WORLD_FLAGS.map((f) => (
              <option key={f.code} value={f.code}>{f.name}</option>
            ))}
          </select>
        </label>
        {president ? (
          <div className="flex items-center gap-1.5 border border-amber-hud/50 bg-amber-hud/10 rounded-sm px-2.5 py-2">
            <Crown className="w-4 h-4 text-amber" />
            <span className="text-[10px] font-mono uppercase text-amber">
              Presidente: @{president.alias}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 border border-muted rounded-sm px-2.5 py-2">
            <Vote className="w-4 h-4 text-muted-foreground" />
            <span className="text-[10px] font-mono uppercase text-muted-foreground">Sin presidente — el trono está libre</span>
          </div>
        )}
      </div>

      {loading && <div className="text-[10px] font-mono text-muted-foreground">consultando al palacio…</div>}

      {data && (
        <div className="grid lg:grid-cols-2 gap-3">
          {/* columna izquierda: poder + acciones */}
          <div className="space-y-3">
            <div className="hud-panel p-3 border-amber-hud/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-mono uppercase text-amber flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5" /> {countryName(country) || country}
                </h3>
                <span className="text-[10px] font-mono text-amber font-bold">PODER POLÍTICO: {data.power}</span>
              </div>

              {/* cargos */}
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(ROLE_META).map(([role, meta]) => {
                  const holder = data.roles.find((r) => r.role === role);
                  return (
                    <div key={role} className="bg-secondary/50 rounded-sm px-2 py-1.5 border border-amber-hud/20">
                      <div className="text-[8px] font-mono uppercase text-muted-foreground flex items-center gap-1">{meta.icon} {meta.label}</div>
                      <div className="text-[10px] font-mono text-foreground truncate">{holder ? `@${holder.alias}` : "— vacante —"}</div>
                    </div>
                  );
                })}
              </div>

              {/* TOMAR EL PODER */}
              {!president && (
                <div className="space-y-1.5">
                  {iAmElected ? (
                    <button onClick={() => void act({ action: "claim" })} disabled={busy}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-amber-hud/40 border border-amber-hud text-amber rounded-sm text-[11px] font-mono uppercase font-bold hover:bg-amber-hud/70 disabled:opacity-40">
                      <Crown className="w-4 h-4" /> Tomar el poder — ¡eres el embajador electo! (+5 XP)
                    </button>
                  ) : (
                    <p className="text-[10px] text-muted-foreground leading-snug border border-amber-hud/20 rounded-sm p-2">
                      {data.electedAmbassador
                        ? `El embajador electo de este ciclo es @${data.electedAmbassador} — solo esa persona puede tomar el poder.`
                        : "Nadie ganó la elección de este ciclo en este país. Presenta tu candidatura en EMBAJADORES (Social) y gana los votos."}
                    </p>
                  )}
                </div>
              )}

              {/* nombrar cargos (solo presidente) */}
              {isPresident && (
                <div className="space-y-1.5 border-t border-amber-hud/20 pt-2">
                  <span className="text-[9px] font-mono uppercase text-amber">Nombrar cargos (solo el presidente)</span>
                  <div className="flex gap-1">
                    <input value={appointAlias} onChange={(e) => setAppointAlias(e.target.value)} maxLength={24}
                      placeholder="@alias"
                      className="flex-1 min-w-0 bg-secondary border border-amber-hud/30 rounded-sm px-2 py-1.5 text-[11px]" />
                    <select value={appointRole} onChange={(e) => setAppointRole(e.target.value)}
                      className="bg-secondary border border-amber-hud/30 rounded-sm px-1 py-1.5 text-[10px]">
                      <option value="CANCILLER">Canciller</option>
                      <option value="GENERAL">General</option>
                      <option value="ALMIRANTE">Almirante</option>
                      <option value="MARISCAL_AIRE">Mariscal Aire</option>
                      <option value="ESPIA_MAESTRO">Espía Maestro</option>
                      <option value="TESORERO">Tesoro</option>
                      <option value="MINISTRO_PRENSA">Min. Prensa</option>
                    </select>
                    <button onClick={() => appointAlias.trim() && void act({ action: "appoint", role: appointRole, target: appointAlias.trim() })}
                      disabled={busy || !appointAlias.trim()}
                      className="px-2 bg-amber-hud/40 border border-amber-hud text-amber rounded-sm text-[10px] font-mono uppercase disabled:opacity-40">
                      Nombrar
                    </button>
                  </div>
                </div>
              )}

              {/* decreto presidencial */}
              {isPresident && (
                <div className="space-y-1.5 border-t border-amber-hud/20 pt-2">
                  <span className="text-[9px] font-mono uppercase text-amber flex items-center gap-1">
                    <ScrollText className="w-3 h-3" /> Publicar decreto presidencial
                  </span>
                  <input value={decTitle} onChange={(e) => setDecTitle(e.target.value)} maxLength={100}
                    placeholder="Título: Movilización general…"
                    className="w-full bg-secondary border border-amber-hud/30 rounded-sm px-2 py-1.5 text-[11px] font-mono" />
                  <textarea value={decBody} onChange={(e) => setDecBody(e.target.value)} rows={3} maxLength={2000}
                    placeholder="Cuerpo del decreto (mínimo 30 caracteres)…"
                    className="w-full bg-secondary border border-amber-hud/30 rounded-sm px-2 py-1.5 text-[11px]" />
                  <button onClick={() => void act({ action: "declaim", title: decTitle, body: decBody }).then((out) => {
                    if (out) { setDecTitle(""); setDecBody(""); addCoins(10, "Decreto publicado"); }
                  })} disabled={busy || decTitle.trim().length < 5 || decBody.trim().length < 30}
                    className="w-full px-3 py-2 bg-amber-hud/40 border border-amber-hud text-amber rounded-sm text-[11px] font-mono uppercase font-bold disabled:opacity-40">
                    <ScrollText className="w-3.5 h-3.5 inline mr-1" /> Firmar decreto (+10 monedas)
                  </button>
                </div>
              )}

              {/* reclutamiento */}
              <div className="space-y-1.5 border-t border-amber-hud/20 pt-2">
                <span className="text-[9px] font-mono uppercase text-amber flex items-center gap-1">
                  <UserPlus className="w-3 h-3" /> Reclutamiento — únete a un departamento
                </span>
                <div className="grid grid-cols-2 gap-1">
                  {DEPTS.map((d) => (
                    <button key={d.id} onClick={() => setDept(d.id)} title={d.desc}
                      className={cn("px-2 py-1 text-[10px] font-mono border rounded-sm text-left",
                        dept === d.id ? "border-red-hud text-red-hud bg-red-hud/15" : "border-amber-hud/25 text-muted-foreground hover:border-red-hud")}>
                      {d.id}
                    </button>
                  ))}
                </div>
                {mineJoined ? (
                  <button onClick={() => void act({ action: "leave" })} disabled={busy}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 border border-red-hud/50 text-red-hud rounded-sm text-[10px] font-mono uppercase hover:bg-red-hud/10">
                    <LogOut className="w-3 h-3" /> Dejar el servicio del país
                  </button>
                ) : (
                  <button onClick={() => void act({ action: "join", dept })} disabled={busy}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-red-hud/30 border border-red-hud text-red-hud rounded-sm text-[11px] font-mono uppercase font-bold hover:bg-red-hud/50 disabled:opacity-40">
                    <UserPlus className="w-3.5 h-3.5" /> Reclutarme en {dept} (+5 XP)
                  </button>
                )}
                <div className="text-[9px] font-mono text-muted-foreground">
                  {data.roster.length} servidores en activo
                  {data.roster.length > 0 && (
                    <span> · {data.roster.slice(0, 8).map((r) => `@${r.alias}(${r.dept.slice(0, 3)})`).join(" ")}
                      {data.roster.length > 8 && ` +${data.roster.length - 8}`}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* columna derecha: decretos + ranking */}
          <div className="space-y-3">
            <div className="hud-panel p-3 border-amber-hud/40 space-y-2">
              <h3 className="text-[11px] font-mono uppercase text-amber flex items-center gap-1.5">
                <ScrollText className="w-3.5 h-3.5" /> Decretos oficiales ({data.decrees.length})
              </h3>
              {data.decrees.length === 0 && (
                <p className="text-[10px] text-muted-foreground">Sin decretos publicados todavía.</p>
              )}
              {data.decrees.slice(0, 6).map((d) => (
                <div key={d.id} className="bg-secondary/40 rounded-sm p-2 border-l-2 border-amber-hud">
                  <div className="text-[10px] font-mono font-bold text-amber">{d.title}</div>
                  <p className="text-[10px] text-foreground/85 leading-snug line-clamp-2">{d.body}</p>
                  <div className="text-[8px] font-mono text-muted-foreground">@{d.author} · {timeAgo(d.createdAt)}</div>
                </div>
              ))}
            </div>

            <div className="hud-panel p-3 border-cyan-hud/40 space-y-1.5">
              <h3 className="text-[11px] font-mono uppercase text-cyan-hud flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Ranking de poder político
              </h3>
              {ranking.length === 0 && <p className="text-[10px] text-muted-foreground">Nadie gobierna aún — el mapa está sin repartir.</p>}
              {ranking.slice(0, 10).map((row, i) => (
                <div key={row.country} className="flex items-center gap-2 text-[10px] font-mono">
                  <span className={cn("w-4 text-right", i === 0 ? "text-amber font-bold" : "text-muted-foreground")}>{i + 1}</span>
                  <Countryball code={row.country} size={16} />
                  <span className="flex-1 truncate">{countryName(row.country) || row.country}</span>
                  <span className="text-muted-foreground">👥{row.roster} 📜{row.decrees}</span>
                  <span className="text-amber font-bold w-10 text-right">{row.power}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

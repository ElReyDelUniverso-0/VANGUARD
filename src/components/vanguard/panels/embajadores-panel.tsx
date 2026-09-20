"use client";

// ============================================================
// VANGUARD v24 — EMBAJADORES POR PAÍS
// Cada jugador dedica su cuenta a UN país, lo defiende en foros
// y debates, y compite en elecciones que duran 1-2 meses. El
// ganador por país es EMBAJADOR con privilegios reales (DB).
// ============================================================
import { useEffect, useMemo, useState } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { FlagBadge } from "@/components/vanguard/flag-badge";
import { WORLD_FLAGS, countryName } from "@/lib/world-data";
import { ELECTION_CYCLE_MS, electionCycle, AMBASSADOR_REQUIREMENTS, AMBASSADOR_PRIVILEGES } from "@/lib/dark-data";
import { useGameStore } from "@/lib/game-store";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Vote, Crown, Medal, ShieldCheck, Search, CalendarClock, Users, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const LS_MY_COUNTRY = "vanguard_mypais_v1"; // cuenta dedicada a un país
const LS_MY_COUNTRY_SINCE = "vanguard_mypais_since";

interface Candidate {
  id: string;
  alias: string;
  country: string;
  cycle: string;
  slogan: string;
  platform: string;
  votes: number;
}

export function EmbajadoresPanel() {
  const alias = useGameStore((s) => s.alias);
  const level = useGameStore((s) => s.level);
  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);

  const [myCountry, setMyCountry] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [countryQuery, setCountryQuery] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [myVoteCountry, setMyVoteCountry] = useState<Record<string, string>>({}); // country -> candidateId
  const [candOpen, setCandOpen] = useState(false);
  const [slogan, setSlogan] = useState("");
  const [platform, setPlatform] = useState("");
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState<"ELECCION" | "ROL" | "RANKING">("ELECCION");

  const cyc = electionCycle();

  useEffect(() => {
    try {
      setMyCountry(localStorage.getItem(LS_MY_COUNTRY));
    } catch { /* noop */ }
  }, []);

  const loadCandidates = async () => {
    try {
      const res = await fetch(`/api/ambassadors?cycle=${cyc.cycle}`);
      const data = await res.json();
      setCandidates(data.candidates ?? []);
      // reconstruir mi voto por país desde la respuesta
      const votes: Record<string, string> = {};
      for (const c of data.candidates ?? []) {
        const mine = (c.votesRel ?? []).some((v: { voter: string }) => v.voter === (alias || ""));
        if (mine) votes[c.country] = c.id;
      }
      setMyVoteCountry(votes);
    } catch { /* silencio */ }
  };

  useEffect(() => {
    loadCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cyc.cycle]);

  const filteredCountries = useMemo(() => {
    const q = countryQuery.trim().toLowerCase();
    const list = q ? WORLD_FLAGS.filter((c) => c.name.toLowerCase().includes(q) || c.code.includes(q)) : WORLD_FLAGS;
    return list.slice(0, 60);
  }, [countryQuery]);

  const dedicate = (code: string) => {
    setMyCountry(code);
    try {
      localStorage.setItem(LS_MY_COUNTRY, code);
      localStorage.setItem(LS_MY_COUNTRY_SINCE, String(Date.now()));
    } catch { /* noop */ }
    setPickerOpen(false);
    addXp(10);
    toast.success(`🇺🇳 Cuenta dedicada a ${countryName(code)} · +10 XP. Ahora defiéndelo en foros y elecciones.`);
  };

  const registerCandidacy = async () => {
    if (!myCountry || !alias) {
      toast.error("Necesitas cuenta dedicada a un país y alias registrado");
      return;
    }
    if (level < 3) {
      toast.error(`Necesitas nivel 3 para presentarte (nivel actual: ${level})`);
      return;
    }
    if (slogan.trim().length < 8) {
      toast.error("El lema necesita al menos 8 caracteres");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/ambassadors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alias, country: myCountry, slogan, platform, cycle: cyc.cycle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      toast.success(`🎖️ Candidatura registrada para ${countryName(myCountry)} · ciclo ${cyc.cycle}`);
      setSlogan("");
      setPlatform("");
      setCandOpen(false);
      loadCandidates();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al registrar");
    } finally {
      setSending(false);
    }
  };

  const vote = async (c: Candidate) => {
    if (!alias) {
      toast.error("Registra tu alias para votar");
      return;
    }
    if (myCountry && c.country !== myCountry) {
      toast.error(`Como cuenta dedicada a ${countryName(myCountry)}, solo puedes votar en la elección de tu país`);
      return;
    }
    if (c.alias === alias) {
      toast.error("No puedes votarte a ti mismo");
      return;
    }
    try {
      const res = await fetch("/api/ambassadors/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: c.id, voter: alias }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setMyVoteCountry((m) => ({ ...m, [c.country]: c.id }));
      addXp(5);
      toast.success(`🗳️ Voto registrado para ${c.alias} en ${countryName(c.country)} · +5 XP`);
      loadCandidates();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al votar");
    }
  };

  const byCountry = useMemo(() => {
    const m: Record<string, Candidate[]> = {};
    for (const c of candidates) (m[c.country] ??= []).push(c);
    return m;
  }, [candidates]);

  const myCountryCandidates = myCountry ? byCountry[myCountry] ?? [] : [];
  const leaderOf = (list: Candidate[]) => [...list].sort((a, b) => b.votes - a.votes)[0];

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Embajadores · Elige quién defiende a tu país"
        subtitle={`ciclo ${cyc.cycle} · ${cyc.daysLeft} días restantes · elecciones cada ${Math.round(ELECTION_CYCLE_MS / 86400000)} días`}
        icon={<Vote className="w-4 h-4 text-green-hud" />}
        color="green"
      />

      {/* Tabs internos */}
      <div className="hud-corner p-2 flex items-center gap-1 flex-wrap">
        {(["ELECCION", "ROL", "RANKING"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-2 py-1 border text-[9px] font-mono uppercase transition-colors",
              tab === t ? "border-green-hud text-green-hud bg-green-hud/20" : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {t === "ELECCION" ? "🗳️ elección activa" : t === "ROL" ? "🎖️ el rol" : "👑 embajadores al frente"}
          </button>
        ))}
      </div>

      {tab === "ELECCION" && (
        <>
          {/* Cuenta dedicada */}
          <div className="hud-corner p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 border border-border flex items-center justify-center bg-secondary/40">
                {myCountry ? <FlagBadge code={myCountry} size="md" /> : <Lock className="w-4 h-4 text-muted-foreground" />}
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase text-muted-foreground">tu cuenta dedicada</p>
                <p className="text-sm font-bold text-foreground leading-tight">
                  {myCountry ? countryName(myCountry) : "Sin país asignado"}
                </p>
                {myCountry && (
                  <p className="text-[9px] font-mono text-green-hud uppercase">cuenta dedicada · nivel {level} {level >= 3 ? "✓" : "(necesitas 3)"}</p>
                )}
              </div>
            </div>
            <div className="sm:ml-auto flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPickerOpen(true)}
                className="h-7 font-mono text-[10px] uppercase border-cyan-hud text-cyan-hud"
              >
                {myCountry ? "Ver dedicación" : "Dedicar mi cuenta a un país"}
              </Button>
              {myCountry && level >= 3 && (
                <Button
                  size="sm"
                  onClick={() => setCandOpen(true)}
                  className="h-7 font-mono text-[10px] uppercase bg-green-hud/30 border border-green-hud text-green-hud hover:bg-green-hud/50"
                >
                  Presentarme como candidato
                </Button>
              )}
            </div>
          </div>

          {/* Estado de la elección */}
          <div className="hud-corner p-3">
            <div className="flex items-center gap-2 flex-wrap">
              <CalendarClock className="w-4 h-4 text-amber" />
              <p className="text-[11px] font-mono uppercase text-foreground">
                ciclo {cyc.cycle} en curso · termina en <span className="text-amber">{cyc.daysLeft} días</span>
              </p>
              <span className="text-[9px] font-mono text-muted-foreground uppercase ml-auto">
                {candidates.length} candidatos · {Object.keys(byCountry).length} países en disputa
              </span>
            </div>
            <div className="h-1.5 bg-secondary mt-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-hud to-amber"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(2, 100 - (cyc.daysLeft / 60) * 100))}%` }}
              />
            </div>
          </div>

          {/* Candidatos por país */}
          {Object.keys(byCountry).length === 0 ? (
            <div className="hud-corner p-8 text-center text-muted-foreground">
              <Vote className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-mono">Nadie se ha presentado aún en este ciclo</p>
              <p className="text-[10px] font-mono uppercase mt-1">sé el primero: dedica tu cuenta y preséntate</p>
            </div>
          ) : (
            <div className="grid gap-2">
              {Object.entries(byCountry).map(([country, list]) => {
                const leader = leaderOf(list);
                const myVoted = myVoteCountry[country];
                return (
                  <motion.article key={country} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="hud-corner p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <FlagBadge code={country} size="md" />
                      <h3 className="font-mono text-xs font-bold uppercase text-foreground">{countryName(country)}</h3>
                      <span className="text-[9px] font-mono text-muted-foreground uppercase ml-auto flex items-center gap-1">
                        <Users className="w-3 h-3" /> {list.length} candidatos · {list.reduce((n, c) => n + c.votes, 0)} votos
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {list.map((c) => {
                        const isLeader = leader?.id === c.id;
                        const voted = myVoted === c.id;
                        return (
                          <div
                            key={c.id}
                            className={cn(
                              "p-2 border flex items-center gap-2",
                              isLeader ? "border-amber-hud/60 bg-amber-hud/10" : "border-border/60 bg-secondary/30"
                            )}
                          >
                            <div className="text-center flex-shrink-0">
                              <p className={cn("font-mono text-sm font-bold leading-none", isLeader ? "text-amber" : "text-foreground")}>{c.votes}</p>
                              <p className="text-[7px] font-mono uppercase text-muted-foreground">votos</p>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-foreground flex items-center gap-1.5 flex-wrap">
                                {c.alias}
                                {isLeader && <span className="text-[8px] px-1 py-0.5 border border-amber-hud text-amber uppercase">👑 líder</span>}
                                {c.alias === alias && <span className="text-[8px] px-1 py-0.5 border border-green-hud text-green-hud uppercase">tú</span>}
                              </p>
                              <p className="text-[10px] text-muted-foreground italic line-clamp-1">&ldquo;{c.slogan}&rdquo;</p>
                            </div>
                            <button
                              onClick={() => vote(c)}
                              disabled={voted}
                              className={cn(
                                "flex items-center gap-1 px-2 py-1 border font-mono text-[9px] uppercase flex-shrink-0 transition-colors",
                                voted
                                  ? "border-green-hud text-green-hud bg-green-hud/20"
                                  : "border-border text-muted-foreground hover:border-green-hud hover:text-green-hud"
                              )}
                            >
                              <Vote className="w-3 h-3" /> {voted ? "votado" : "votar"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === "ROL" && (
        <div className="space-y-2">
          <div className="hud-corner p-3">
            <h3 className="font-mono text-sm font-bold uppercase text-foreground flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber" /> qué es un embajador
            </h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-1.5">
              Un embajador es un jugador que crea su cuenta <strong className="text-foreground">dedicada a un solo país</strong>:
              lo defiende en foros, debates y directos, aporta datos verificados sobre él y participa constantemente en
              la comunidad. Cada <strong className="text-foreground">{Math.round(ELECTION_CYCLE_MS / 86400000)} días</strong> se celebran
              elecciones: la comunidad vota y el más votado de cada país se convierte en su Embajador oficial hasta el
              siguiente ciclo. Ser constante es la única forma de mantenerse al frente.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            <div className="hud-corner p-3">
              <p className="text-[10px] font-mono uppercase text-cyan-hud tracking-wider mb-2">requisitos para presentarte</p>
              <ul className="space-y-1.5">
                {AMBASSADOR_REQUIREMENTS.map((r) => (
                  <li key={r.req} className="text-[11px] text-muted-foreground flex items-start gap-2">
                    <span>{r.icon}</span> {r.req}
                  </li>
                ))}
              </ul>
            </div>
            <div className="hud-corner p-3">
              <p className="text-[10px] font-mono uppercase text-amber tracking-wider mb-2">privilegios del embajador electo</p>
              <ul className="space-y-1.5">
                {AMBASSADOR_PRIVILEGES.map((p) => (
                  <li key={p.priv} className="text-[11px] text-muted-foreground flex items-start gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-hud mt-0.5 flex-shrink-0" />
                    <span>
                      {p.priv}
                      {p.reward && <span className="text-green-hud font-mono text-[9px] uppercase ml-1">({p.reward})</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {tab === "RANKING" && (
        <div className="hud-corner p-3">
          <h3 className="font-mono text-sm font-bold uppercase text-foreground flex items-center gap-2 mb-2">
            <Medal className="w-4 h-4 text-amber" /> líderes del ciclo {cyc.cycle}
          </h3>
          {candidates.length === 0 ? (
            <p className="text-xs text-muted-foreground font-mono uppercase">aún sin resultados este ciclo</p>
          ) : (
            <div className="space-y-1.5">
              {[...candidates]
                .sort((a, b) => b.votes - a.votes)
                .slice(0, 12)
                .map((c, i) => (
                  <div key={c.id} className={cn("p-2 border flex items-center gap-2.5", i === 0 ? "border-amber-hud/60 bg-amber-hud/10" : "border-border/60 bg-secondary/30")}>
                    <span className={cn("font-mono text-xs font-bold w-6 text-center", i === 0 ? "text-amber" : "text-muted-foreground")}>
                      {i === 0 ? "👑" : i + 1}
                    </span>
                    <FlagBadge code={c.country} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{c.alias} <span className="text-[9px] text-muted-foreground font-mono uppercase">· {countryName(c.country)}</span></p>
                      <p className="text-[9px] text-muted-foreground italic truncate">&ldquo;{c.slogan}&rdquo;</p>
                    </div>
                    <span className="font-mono text-xs font-bold text-green-hud">{c.votes} 🗳️</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Modal selector de país */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4" onClick={() => setPickerOpen(false)} role="dialog" aria-modal="true">
          <div className="hud-panel border-cyan-hud max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col p-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-mono text-sm font-bold uppercase text-cyan-hud">dedica tu cuenta a un país</h3>
            <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
              Tu cuenta se identifica con ese país durante todo el ciclo: votarás solo en su elección y tu rol es
              defenderlo. Elige con cuidado: el cambio resetea tu constancia.
            </p>
            <div className="relative mt-2">
              <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={countryQuery}
                onChange={(e) => setCountryQuery(e.target.value)}
                placeholder="Buscar país (251 disponibles)..."
                className="h-8 pl-7 bg-background/60 border-border font-mono text-xs"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 mt-2 overflow-y-auto thin-scroll max-h-[46vh] pr-1">
              {filteredCountries.map((c) => (
                <button
                  key={c.code}
                  onClick={() => dedicate(c.code)}
                  className={cn(
                    "flex items-center gap-1.5 px-1.5 py-1 border text-left transition-colors hover:border-green-hud",
                    myCountry === c.code ? "border-green-hud bg-green-hud/10" : "border-border/60"
                  )}
                >
                  <FlagBadge code={c.code} size="sm" />
                  <span className="text-[10px] font-mono text-foreground truncate">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal candidatura */}
      {candOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4" onClick={() => setCandOpen(false)} role="dialog" aria-modal="true">
          <div className="hud-panel border-green-hud max-w-md w-full p-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-mono text-sm font-bold uppercase text-green-hud flex items-center gap-2">
              <Vote className="w-4 h-4" /> candidatura · {myCountry ? countryName(myCountry) : ""} · ciclo {cyc.cycle}
            </h3>
            <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
              Presenta tu lema y tu plan de defensa del país. La comunidad votará durante {Math.round(ELECTION_CYCLE_MS / 86400000)} días.
            </p>
            <div className="space-y-2 mt-3">
              <Input
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                placeholder="Lema de campaña (ej: 'Datos, no odio: Ucrania primero')"
                className="bg-background/60 border-border font-mono text-xs"
                maxLength={140}
              />
              <Textarea
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                placeholder="Tu plan: qué harás por el país en foros, verificaciones y directos..."
                className="min-h-[100px] bg-background/60 border-border font-mono text-xs"
                maxLength={1000}
              />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Button
                size="sm"
                onClick={registerCandidacy}
                disabled={sending}
                className="h-7 font-mono text-[10px] uppercase bg-green-hud/30 border border-green-hud text-green-hud hover:bg-green-hud/50 disabled:opacity-50"
              >
                {sending ? "Registrando..." : "Registrar candidatura"}
              </Button>
              <button onClick={() => setCandOpen(false)} className="ml-auto px-3 py-1.5 border border-border text-[10px] font-mono uppercase text-muted-foreground hover:text-foreground">
                Cancelar
              </button>
            </div>
            <p className="text-[9px] font-mono text-muted-foreground/70 uppercase mt-2">
              requisito: nivel 3+ · cuenta dedicada · ganador: +30 monedas e insignia 🎖️
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

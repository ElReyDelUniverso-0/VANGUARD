"use client";

// v20 PERFIL: personalización total del agente — avatar countryball con BANDERA
// REAL (los 251 países con buscador), banner, marco, bio, facción y país favorito
// con su bandera verdadera. Todo persiste en localStorage (profile-store).

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Countryball } from "@/components/vanguard/countryball";
import { Flag } from "@/lib/flags";
import { WORLD_FLAGS, countryName } from "@/lib/world-data";
import { useProfileStore, BANNERS, FRAMES, FACTIONS, type BannerStyle, type FrameStyle } from "@/lib/profile-store";
import { toast } from "sonner";
import { UserCog, Check, Swords, ScrollText, Search } from "lucide-react";

export function PerfilPanel() {
  const {
    cbAvatar, banner, frame, bio, favCountry, favFaction,
    setCbAvatar, setBanner, setFrame, setBio, setFavCountry, setFavFaction,
  } = useProfileStore();
  const [bioLocal, setBioLocal] = useState(bio);
  const [qAvatar, setQAvatar] = useState("");
  const [qFav, setQFav] = useState("");

  const avatarList = useMemo(() => {
    const ql = qAvatar.trim().toLowerCase();
    if (!ql) return WORLD_FLAGS;
    return WORLD_FLAGS.filter((f) => f.name.toLowerCase().includes(ql) || f.code.includes(ql));
  }, [qAvatar]);

  const favList = useMemo(() => {
    const ql = qFav.trim().toLowerCase();
    if (!ql) return WORLD_FLAGS;
    return WORLD_FLAGS.filter((f) => f.name.toLowerCase().includes(ql) || f.code.includes(ql));
  }, [qFav]);

  const saveBio = () => {
    setBio(bioLocal.slice(0, 90));
    toast.success("Bio actualizada");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
      {/* VISTA PREVIA EN VIVO */}
      <div className="space-y-3">
        <div className="hud-panel overflow-hidden">
          {/* banner */}
          <div className="h-28 relative" style={{ background: BANNERS[banner].css }}>
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, #fff 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
            <div className="absolute -bottom-7 left-5">
              <div className="rounded-full" style={{ boxShadow: FRAMES[frame].ring }}>
                <div className="rounded-full border-4 border-background">
                  <Countryball code={cbAvatar} size={76} />
                </div>
              </div>
            </div>
            <div className="absolute bottom-2 right-3 text-[9px] font-mono text-white/70">VISTA PREVIA DEL PERFIL</div>
          </div>
          <div className="pt-10 px-5 pb-5">
            <div className="font-orbitron font-bold tracking-wider text-lg text-gradient">AGENTE VANGUARD</div>
            <div className="text-[10px] font-mono text-muted-foreground mb-2 flex items-center gap-1.5">
              <Flag code={favCountry} size={16} />
              {countryName(favCountry)} · {favFaction}
            </div>
            <p className="text-xs text-foreground/80 border-l-2 border-amber-hud/50 pl-2 italic min-h-8">{bio || "Sin bio todavía…"}</p>
            <div className="mt-3 flex items-center gap-2">
              <Countryball code={favCountry} size={22} />
              <span className="text-[10px] font-mono text-muted-foreground">país favorito · {countryName(favCountry)}</span>
            </div>
          </div>
        </div>

        {/* bio */}
        <div className="hud-panel p-4 space-y-2">
          <h3 className="font-orbitron text-xs tracking-widest uppercase text-gradient flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-amber" /> Tu frase de agente
          </h3>
          <Input value={bioLocal} onChange={(e) => setBioLocal(e.target.value)} maxLength={90} className="font-mono text-xs h-9" placeholder="Ej: Observo los frentes antes que el mundo." aria-label="Bio del perfil" />
          <Button size="sm" onClick={saveBio} className="w-full font-mono text-[11px]">Guardar bio</Button>
        </div>
      </div>

      {/* OPCIONES */}
      <div className="space-y-3">
        {/* countryballs */}
        <div className="hud-panel p-4">
          <h3 className="font-orbitron text-xs tracking-widest uppercase text-gradient mb-3 flex items-center gap-2">
            <UserCog className="w-4 h-4 text-electric" /> Avatar Countryball · {WORLD_FLAGS.length} países con bandera real
          </h3>
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={qAvatar} onChange={(e) => setQAvatar(e.target.value)} placeholder="Busca tu país: España, Japón, do…" className="pl-8 font-mono text-xs h-9" aria-label="Buscar país para avatar" />
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-11 gap-2 max-h-60 overflow-y-auto pr-1">
            {avatarList.map((f) => (
              <button
                key={f.code}
                onClick={() => { setCbAvatar(f.code); toast.success(`Avatar: ${f.name}`); }}
                className={`p-1.5 rounded-lg border transition-all hover:scale-105 hover:border-electric/60 ${cbAvatar === f.code ? "border-electric bg-electric/10 shadow-[0_0_10px_#1E90FF55]" : "border-transparent bg-black/20"}`}
                title={f.name}
                aria-pressed={cbAvatar === f.code}
              >
                <Countryball code={f.code} size={38} className="mx-auto" />
                {cbAvatar === f.code && <Check className="w-3 h-3 text-electric mx-auto mt-0.5" />}
              </button>
            ))}
          </div>
          {avatarList.length === 0 && (
            <p className="text-[10px] font-mono text-muted-foreground mt-2">Ningún país coincide con «{qAvatar}»</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {/* banners */}
          <div className="hud-panel p-4">
            <h3 className="font-orbitron text-xs tracking-widest uppercase text-gradient mb-3">Banner del perfil</h3>
            <div className="grid grid-cols-1 gap-2">
              {(Object.keys(BANNERS) as BannerStyle[]).map((b) => (
                <button
                  key={b}
                  onClick={() => setBanner(b)}
                  className={`relative h-10 rounded border-2 text-left px-3 flex items-center justify-between transition-transform hover:scale-[1.02] ${banner === b ? "border-electric" : "border-transparent"}`}
                  style={{ background: BANNERS[b].css }}
                  aria-pressed={banner === b}
                >
                  <span className="text-[10px] font-mono font-bold text-white/90 uppercase tracking-wider">{BANNERS[b].label}</span>
                  {banner === b && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* marcos + facción + país fav */}
          <div className="space-y-3">
            <div className="hud-panel p-4">
              <h3 className="font-orbitron text-xs tracking-widest uppercase text-gradient mb-3">Marco del avatar</h3>
              <div className="grid grid-cols-5 gap-2">
                {(Object.keys(FRAMES) as FrameStyle[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFrame(f)}
                    className={`flex flex-col items-center gap-1 p-2 rounded border transition-colors ${frame === f ? "border-electric bg-electric/10" : "border-border hover:border-electric/40"}`}
                    aria-pressed={frame === f}
                  >
                    <div className="rounded-full" style={{ boxShadow: FRAMES[f].ring === "none" ? "0 0 0 1px #333" : FRAMES[f].ring }}>
                      <Countryball code={cbAvatar} size={26} />
                    </div>
                    <span className="text-[8px] font-mono uppercase text-muted-foreground">{FRAMES[f].label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="hud-panel p-4 space-y-3">
              <h3 className="font-orbitron text-xs tracking-widest uppercase text-gradient flex items-center gap-2">
                <Swords className="w-4 h-4 text-red-hud" /> Facción declarada
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {FACTIONS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFavFaction(f)}
                    className={`px-2 py-1 rounded text-[9px] font-mono uppercase tracking-wider border transition-colors ${favFaction === f ? "border-red-hud text-red-hud bg-red-hud/10" : "border-border text-muted-foreground hover:border-red-hud/40"}`}
                    aria-pressed={favFaction === f}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">País favorito · bandera verdadera</span>
                </div>
                <div className="relative">
                  <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input value={qFav} onChange={(e) => setQFav(e.target.value)} placeholder="Buscar entre 251 países…" className="pl-8 font-mono text-[11px] h-8" aria-label="Buscar país favorito" />
                </div>
                <div className="max-h-36 overflow-y-auto divide-y divide-border/60 rounded border border-border">
                  {favList.slice(0, 60).map((f) => (
                    <button
                      key={f.code}
                      onClick={() => { setFavCountry(f.code); setCbAvatar(f.code); }}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 text-left transition-colors ${favCountry === f.code ? "bg-amber/10" : "hover:bg-white/[0.04]"}`}
                      aria-pressed={favCountry === f.code}
                    >
                      <Flag code={f.code} size={22} title={f.name} />
                      <span className={`text-[10px] font-mono flex-1 truncate ${favCountry === f.code ? "text-amber" : ""}`}>{f.name}</span>
                      {favCountry === f.code && <Check className="w-3 h-3 text-amber" />}
                    </button>
                  ))}
                </div>
                <p className="text-[8px] font-mono text-muted-foreground">Al elegir país favorito también se sugiere como avatar.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

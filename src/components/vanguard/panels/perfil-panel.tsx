"use client";

// v20 PERFIL: personalización total del agente — avatar countryball con BANDERA
// REAL (los 251 países con buscador), banner, marco, bio, facción y país favorito
// con su bandera verdadera. Todo persiste en localStorage (profile-store).
// v114.0 ECLIPSE — FIRMA 3D: la firma forjada en EXPERIMENTAL → FORJA luce
// bajo la bio con el motor de letras 3D de la casa (grabar/quitar aquí).

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Countryball } from "@/components/vanguard/countryball";
import { Flag } from "@/lib/flags";
import { WORLD_FLAGS, countryName } from "@/lib/world-data";
import { useProfileStore, BANNERS, FRAMES, FACTIONS, type BannerStyle, type FrameStyle } from "@/lib/profile-store";
import { useGameStore } from "@/lib/game-store";
import { toast } from "sonner";
import { sfx } from "@/lib/sound";
import { UserCog, Check, Swords, ScrollText, Search, Signature, X, Activity, Trophy, Sparkles, Share2, Lock } from "lucide-react";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { TituloLetras3D } from "@/components/vanguard/letras-3d";
import { useT } from "@/lib/i18n";
// v172 EL PULSO DE LA PARIDAD — el agente lleva su propia cuenta 3D vs 2D
import { useTelemetriaParidad } from "@/lib/telemetria-paridad";
// v183.0 LA GLORIA — presunción, exclusividad, adicción: la vitrina del agente
import { FICHAS_GUERRA, useColeccionFichas } from "@/lib/fichas-guerra-data";
import { useGloria, TITULOS_GLORIA, proximoTitulo, ctxDe } from "@/lib/gloria";
import { pintarVitrina, compartirImagen } from "@/lib/gloria-compartir";
import { APP_VERSION_LABEL } from "@/lib/version";

export function PerfilPanel() {
  const {
    cbAvatar, banner, frame, bio, favCountry, favFaction, firma,
    setCbAvatar, setBanner, setFrame, setBio, setFavCountry, setFavFaction, setFirma,
  } = useProfileStore();
  const { t } = useT();
  const [bioLocal, setBioLocal] = useState(bio);
  const [qAvatar, setQAvatar] = useState("");
  const [qFav, setQFav] = useState("");

  // ════════════════════════════════════════════════════════════
  // v145.1 SALAS EN VOLUMEN: EL NÚCLEO DEL AGENTE — el perfil vive
  // como ser de energía en el mundo 3D: icosaedro del color del
  // nivel, anillos de logros orbitando, nombre y botín extruidos.
  // ════════════════════════════════════════════════════════════
  const nivel = useGameStore((s) => s.level);
  const coins = useGameStore((s) => s.coins);
  const gems = useGameStore((s) => s.gems);
  const xp = useGameStore((s) => s.xp);
  const racha = useGameStore((s) => s.streak);
  const aliasAgente = useGameStore((s) => s.alias);

  // ══ v183.0 LA GLORIA — el escaparate del agente ══
  const gloria = useGloria();
  const coleccion = useColeccionFichas();
  const nDescubiertas = useMemo(() => Object.keys(coleccion.descubiertas).length, [coleccion.descubiertas]);
  const ctxG = useMemo(
    () => ctxDe(nDescubiertas, coleccion.aperturas, { sellos: gloria.sellos, rachaDias: gloria.rachaDias }),
    [nDescubiertas, coleccion.aperturas, gloria.sellos, gloria.rachaDias],
  );
  const tituloInfo = useMemo(() => TITULOS_GLORIA.find((t) => t.id === gloria.tituloActivo) ?? null, [gloria.tituloActivo]);
  const prox = useMemo(() => proximoTitulo(ctxG), [ctxG]);
  const nOro = useMemo(() => Object.keys(gloria.sellos).length, [gloria.sellos]);
  const [presumiendoV, setPresumiendoV] = useState(false);
  const presumirVitrina = async () => {
    if (presumiendoV) return;
    setPresumiendoV(true);
    try {
      const fichas = gloria.vitrina.flatMap((k) => {
        const f = FICHAS_GUERRA.find((x) => x.key === k);
        return f ? [{ serie: f.serie, nombre: f.nombre, hex: f.color, dorada: !!gloria.sellos[f.key] }] : [];
      });
      const url = pintarVitrina({
        tituloActivo: tituloInfo?.nombre ?? null,
        colorTitulo: tituloInfo?.color ?? "#F5C542",
        fichas,
        racha: gloria.rachaDias,
        sellos: nOro,
        descubiertas: nDescubiertas,
        total: FICHAS_GUERRA.length,
        version: APP_VERSION_LABEL,
      });
      const r = await compartirImagen(url, "VANGUARD-vitrina.png");
      useGloria.getState().contarCompartido();
      if (r === "share") toast.success("VITRINA COMPARTIDA — LA GLORIA SALE DE LA CASA");
      else if (r === "descarga") toast.success("PNG DESCARGADO — PRESUME TU VITRINA DONDE QUIERAS");
      else toast.error("ESTE APARATO NO PUDO GENERAR LA IMAGEN");
    } finally {
      setPresumiendoV(false);
    }
  };
  useEffect(() => {
    const emitir = () => {
      try {
        // v172: el pulso de la paridad viaja con el agente a su sala
        const tel = useTelemetriaParidad.getState();
        window.dispatchEvent(new CustomEvent("vg:sala3d-datos", {
          detail: {
            tab: "perfil", tipo: "perfil",
            nombre: (aliasAgente || "AGENTE").toUpperCase().slice(0, 14),
            nivel, xp, monedas: coins, gemas: gems, racha,
            acc3d: tel.total3d, acc2d: tel.total2d,
          },
        }));
      } catch { /* el mundo 3D no bloquea el panel */ }
    };
    emitir();
    const id = window.setInterval(emitir, 5000);
    return () => window.clearInterval(id);
  }, [aliasAgente, nivel, xp, coins, gems, racha]);

  // ════════════════════════════════════════════════════════════
  // v172 EL PULSO DE LA PARIDAD — la cuenta 3D vs 2D del agente:
  // el raycast del mundo alimenta 3D, la caja de la Casa el 2D
  // (selectores atómicos: solo este panel respira, la Casa no)
  // ════════════════════════════════════════════════════════════
  const total3d = useTelemetriaParidad((s) => s.total3d);
  const total2d = useTelemetriaParidad((s) => s.total2d);
  const hoy3d = useTelemetriaParidad((s) => s.hoy3d);
  const hoy2d = useTelemetriaParidad((s) => s.hoy2d);
  const porTab3d = useTelemetriaParidad((s) => s.porTab3d);
  const ultima = useTelemetriaParidad((s) => s.ultima);
  const reiniciarTel = useTelemetriaParidad((s) => s.reiniciar);
  const pct3d = total3d + total2d > 0 ? Math.round((total3d / (total3d + total2d)) * 100) : 0;
  const topTabs = useMemo(
    () => Object.entries(porTab3d).sort((a, b) => b[1] - a[1]).slice(0, 4),
    [porTab3d],
  );

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
    <div className="lg:col-span-2"><HeroOro panel="perfil" /></div>
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
            {/* v183.0: el título GLORIA vestido — la primera impresión del perfil */}
            {tituloInfo && (
              <div className="mt-1.5 inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: tituloInfo.color, borderColor: `${tituloInfo.color}55`, background: `${tituloInfo.color}10` }}>
                <Sparkles className="h-2.5 w-2.5" /> {tituloInfo.nombre}
              </div>
            )}
            <div className="text-[10px] font-mono text-muted-foreground mb-2 flex items-center gap-1.5">
              <Flag code={favCountry} size={16} />
              {countryName(favCountry)} · {favFaction}
            </div>
            <p className="text-xs text-foreground/80 border-l-2 border-amber-hud/50 pl-2 italic min-h-8">{bio || "Sin bio todavía…"}</p>
            {/* v114: la FIRMA 3D del agente — forjada en EXPERIMENTAL → FORJA */}
            {firma && (
              <div className="mt-3 rounded-sm border border-white/10 bg-black/35 px-3 py-2.5 overflow-hidden">
                <TituloLetras3D
                  texto={firma.texto}
                  acento={firma.acento}
                  material={firma.material}
                  profundidad={firma.profundidad}
                  className="text-[clamp(1rem,3.4vw,1.6rem)]"
                  etiqueta={firma.texto}
                />
              </div>
            )}
            <div className="mt-3 flex items-center gap-2">
              <Countryball code={favCountry} size={22} />
              <span className="text-[10px] font-mono text-muted-foreground">país favorito · {countryName(favCountry)}</span>
            </div>
          </div>
        </div>

        {/* ══ v183.0 LA VITRINA DE LA GLORIA — presunción, exclusividad, adicción ══ */}
        <div className="hud-panel p-4 space-y-3" style={{ boxShadow: "0 0 28px -18px #F5C54255" }}>
          <h3 className="font-orbitron text-xs tracking-widest uppercase text-gradient flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber" /> La vitrina de la gloria
          </h3>
          {/* los 12 títulos — solo los GANADOS se visten */}
          <div className="flex flex-wrap gap-1.5">
            {TITULOS_GLORIA.map((t) => {
              const ganado = gloria.titulos.includes(t.id);
              const activo = gloria.tituloActivo === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    if (ganado) { gloria.elegirTitulo(activo ? null : t.id); try { sfx.coin(); } catch { /* noop */ } }
                    else toast.info(`BLOQUEADO — ${t.nota}`);
                  }}
                  className="flex items-center gap-1 border px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.12em] transition-colors"
                  style={ganado
                    ? { color: t.color, borderColor: activo ? t.color : `${t.color}44`, background: activo ? `${t.color}18` : "transparent" }
                    : { color: "#4A5160", borderColor: "#2A2F3A" }}
                  aria-pressed={activo}
                  aria-label={ganado ? `Vestir título ${t.nombre}` : `Título bloqueado: ${t.nota}`}
                >
                  {ganado ? <Sparkles className="h-2.5 w-2.5" /> : <Lock className="h-2.5 w-2.5" />} {t.nombre}
                </button>
              );
            })}
          </div>
          {prox && (
            <p className="text-[9px] font-mono text-muted-foreground leading-snug">
              PRÓXIMO TÍTULO · <span style={{ color: prox.titulo.color }}>{prox.titulo.nombre}</span> ({Math.round(prox.progreso * 100)}%) — {prox.titulo.nota}
            </p>
          )}
          {/* los 3 huecos de la vitrina */}
          <div className="grid grid-cols-3 gap-2">
            {([0, 1, 2] as const).map((slot) => {
              const key = gloria.vitrina[slot];
              const f = FICHAS_GUERRA.find((x) => x.key === key) ?? null;
              return (
                <div key={slot} className="border p-2 text-center" style={{ borderColor: f ? `${f.color}55` : "#2A2F3A", background: f ? `${f.color}0D` : "transparent" }}>
                  <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted-foreground">HUECO {slot + 1}</p>
                  {f ? (
                    <>
                      <p className="mt-1 text-[11px] font-black uppercase leading-tight">{f.nombre}</p>
                      <p className="mt-0.5 font-mono text-[8px]" style={{ color: f.color }}>
                        {f.serie}{gloria.sellos[f.key] ? " ★ DORADO" : ""}
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-[9px] font-mono text-muted-foreground">VACÍO</p>
                  )}
                  <select
                    value={key ?? ""}
                    onChange={(e) => gloria.ponerVitrina(slot, e.target.value || null)}
                    className="mt-1.5 w-full border border-border/60 bg-black/40 px-1 py-0.5 font-mono text-[8.5px]"
                    aria-label={`Elegir ficha para el hueco ${slot + 1}`}
                  >
                    <option value="">— elegir —</option>
                    {FICHAS_GUERRA.filter((x) => !!coleccion.descubiertas[x.key]).map((x) => (
                      <option key={x.key} value={x.key}>{x.serie} · {x.nombre}{gloria.sellos[x.key] ? " ★" : ""}</option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
          <p className="text-[9px] font-mono text-muted-foreground">
            RACHA {gloria.rachaDias} DÍA{gloria.rachaDias === 1 ? "" : "S"} · ★ {nOro} SELLO{nOro === 1 ? "" : "S"} DORADO{nOro === 1 ? "" : "S"} · {nDescubiertas}/{FICHAS_GUERRA.length} FICHAS · {gloria.compartido} PRESUMIDA{gloria.compartido === 1 ? "" : "S"}
          </p>
          <Button size="sm" variant="outline" onClick={presumirVitrina} disabled={presumiendoV} className="w-full font-mono text-[11px] flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5" /> {presumiendoV ? "Pintando…" : "Presumir vitrina (PNG)"}
          </Button>
        </div>

        {/* bio */}
        <div className="hud-panel p-4 space-y-2">
          <h3 className="font-orbitron text-xs tracking-widest uppercase text-gradient flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-amber" /> Tu frase de agente
          </h3>
          <Input value={bioLocal} onChange={(e) => setBioLocal(e.target.value)} maxLength={90} className="font-mono text-xs h-9" placeholder="Ej: Observo los frentes antes que el mundo." aria-label="Bio del perfil" />
          <Button size="sm" onClick={saveBio} className="w-full font-mono text-[11px]">Guardar bio</Button>
        </div>

        {/* v172 EL PULSO DE LA PARIDAD — la paridad se mide, no se promete */}
        <div className="hud-panel p-4 space-y-2">
          <h3 className="font-orbitron text-xs tracking-widest uppercase text-gradient flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber" /> Pulso de la paridad
          </h3>
          <div className="flex items-end justify-between font-mono">
            <div>
              <div className="text-2xl font-bold text-emerald-400 leading-none">{total3d}</div>
              <div className="text-[9px] text-muted-foreground uppercase tracking-wider">acciones en 3D</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-sky-300 leading-none">{total2d}</div>
              <div className="text-[9px] text-muted-foreground uppercase tracking-wider">acciones en 2D</div>
            </div>
          </div>
          <div className="h-2 rounded-full overflow-hidden bg-black/40 border border-white/10" role="img" aria-label={`Paridad 3D ${pct3d}%`}>
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-sky-400 transition-all duration-500"
              style={{ width: `${Math.max(pct3d, total3d > 0 ? 3 : 0)}%` }}
            />
          </div>
          <p className="text-[10px] font-mono text-muted-foreground leading-snug">
            {pct3d}% del pulso vive en el mundo 3D · hoy {hoy3d} en 3D / {hoy2d} en 2D
            {ultima ? ` · última: ${ultima.verbo} (${ultima.fuente})` : ""}
          </p>
          {topTabs.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {topTabs.map(([k, n]) => (
                <span key={k} className="px-1.5 py-0.5 rounded border border-white/10 bg-black/30 text-[9px] font-mono text-emerald-300/90">{k} ×{n}</span>
              ))}
            </div>
          )}
          <button
            onClick={() => { reiniciarTel(); toast.info("Telemetría reiniciada"); }}
            className="text-[9px] font-mono text-muted-foreground hover:text-foreground underline text-left"
          >
            reiniciar cuenta
          </button>
        </div>

        {/* v114: FIRMA 3D — se forja en EXPERIMENTAL, se luce aquí */}
        <div className="hud-panel p-4 space-y-2">
          <h3 className="font-orbitron text-xs tracking-widest uppercase text-gradient flex items-center gap-2">
            <Signature className="w-4 h-4 text-electric" /> {t("perfil114.firma.titulo")}
          </h3>
          {firma ? (
            <>
              <p className="text-[10px] font-mono text-muted-foreground leading-snug">
                «{firma.texto}» · {firma.material.toUpperCase()} · {firma.acento}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setFirma(null); toast.info(t("exp114.firma.quitar")); }}
                className="w-full font-mono text-[11px] flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" /> {t("exp114.firma.quitar")}
              </Button>
            </>
          ) : (
            <p className="text-[10px] font-mono text-muted-foreground leading-snug">{t("exp114.firma.edita")}</p>
          )}
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
                className={`p-1.5 rounded-lg border transition-all hover:scale-105 hover:border-electric/60 ${cbAvatar === f.code ? "border-electric bg-electric/10 shadow-[0_0_10px_#DCC07855]" : "border-transparent bg-black/20"}`}
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

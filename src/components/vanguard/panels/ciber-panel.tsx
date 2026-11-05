"use client";

// v90.0 ESPEJOS SIN FIN — CIBER (espejo del gran mapa de ciberamenazas:
// arcos de ataque volando entre naciones sobre el mapa oscuro, contadores que
// ruedan, ranking de orígenes/objetivos y feed de intrusión). Todo ficticio
// del mundo Vanguard.
//
// v322.0 EL ADVERSARIO CON NOMBRE: el mapa respira con el anillo de la
// escuela (QUINTO consumidor de girar) — la CAMPAÑA DEL DÍA da nombre al
// adversario: franja con su crónica y firma técnica, chip de atribución
// (estimación declarada) en el feed y fila propia en la sala 3D.

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bug, ShieldAlert, Target, Globe2, Activity } from "lucide-react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { WorldMapSVG } from "@/components/vanguard/world-map-svg";
import { generarCiber, rutasDeAtaques, TIPOS_ATAQUE, SECTORES, campanaDelDia, nacionCiberDe, type Ataque } from "@/lib/ciber-data";
import { getTension } from "@/lib/tension";
import { useSala3DContenido, type FilaContenido3D } from "@/components/vanguard/use-sala3d-contenido";
import { cn } from "@/lib/utils";

function Contador({ valor, etiqueta, color }: { valor: number; etiqueta: string; color: string }) {
  return (
    <div className="text-center">
      <motion.p
        key={valor}
        initial={{ scale: 1.18, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-xl font-bold font-mono v90-num"
        style={{ color }}
      >
        {valor.toLocaleString("es-ES")}
      </motion.p>
      <p className="text-[8px] font-mono uppercase text-muted-foreground">{etiqueta}</p>
    </div>
  );
}

export function CiberPanel() {
  const [ahora, setAhora] = useState(() => Date.now());
  const tension = useMemo(() => getTension(), []);

  // pulso vivo: cada 2.5 s nueva ventana de ataques
  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 2500);
    return () => clearInterval(t);
  }, []);

  const estado = useMemo(() => generarCiber(ahora), [ahora]);
  const rutas = useMemo(() => rutasDeAtaques(estado.ataques), [estado]);
  const maxTop = Math.max(...estado.topOrigenes.map((o) => o.n), 1);

  // v322: el adversario del día — el anillo decide (una muesca por fecha),
  // el panel solo lee. La atribución de cada arco es estimación declarada.
  const campana = useMemo(() => campanaDelDia(), []);
  const nacionCampana = nacionCiberDe(campana.origen);
  const vivosCampana = estado.ataques.filter((a: Ataque) => a.campanaId === campana.id).length;

  // v168: PARIDAD 2D→3D — la sala CIBER asciende con las filas reales del panel:
  // DEFCON, rankings de objetivos/orígenes y el feed de intrusión en vivo.
  const filas3D = useMemo<FilaContenido3D[]>(() => {
    const filas: FilaContenido3D[] = [
      {
        t: `DEFCON CIBER ${estado.defconCiber}`,
        v: estado.defconCiber >= 4 ? "PELIGRO" : "ACTIVO",
        p: Math.min(100, estado.defconCiber * 20),
        color: estado.defconCiber >= 4 ? "#FF4D5E" : "#3DDC84",
        d: `${estado.totalHoy.toLocaleString("es-ES")} ataques hoy · ${estado.ataques.length} arcos vivos ahora · tensión ${Math.round(tension)}`,
      },
      {
        t: `CAMPAÑA · ${campana.nombre}`,
        v: vivosCampana > 0 ? `${vivosCampana} arcos` : "en sombra",
        p: Math.round((vivosCampana / Math.max(1, estado.ataques.length)) * 100),
        color: campana.color,
        d: `campaña del día · ${campana.tec} · atribución estimada`,
      },
    ];
    for (const o of estado.topObjetivos.slice(0, 3)) {
      filas.push({
        t: `OBJETIVO · ${o.nacion.nombre}`,
        v: o.n.toLocaleString("es-ES"),
        p: Math.round((o.n / maxTop) * 100),
        color: "#FF6B4D",
        d: `${o.nacion.bandera} está entre los países más atacados del mapa en vivo`,
      });
    }
    for (const o of estado.topOrigenes.slice(0, 3)) {
      filas.push({
        t: `ORIGEN · ${o.nacion.nombre}`,
        v: o.n.toLocaleString("es-ES"),
        p: Math.round((o.n / maxTop) * 100),
        color: "#B48CFF",
        d: `${o.nacion.bandera} origina más intrusiones activas en este momento`,
      });
    }
    for (const a of estado.ataques.slice(0, 3)) {
      filas.push({
        t: `${a.origen.bandera} → ${a.objetivo.bandera} ${a.tipo.nombre}`,
        p: a.intensidad * 20,
        color: a.tipo.color,
        d: `${a.sector.emoji} ${a.sector.nombre} · intensidad ${a.intensidad}/5`,
      });
    }
    return filas;
  }, [estado, tension, maxTop, campana, vivosCampana]);
  useSala3DContenido(
    "ciber",
    "CIBER — MAPA DE AMENAZAS EN VIVO",
    "#3DDC97",
    "La guerra que no hace ruido: intrusión por intrusión, nación a nación",
    filas3D,
  );

  return (
    <div className="space-y-4">
      <PanelHeader
        title="CIBER — mapa de amenazas en vivo"
        subtitle="La guerra que no hace ruido: intrusión por intrusión, nación a nación"
        icon={<Bug className="w-4 h-4 text-emerald-hud" />}
        color="green"
        right={
          <span className={cn("flex items-center gap-1.5 text-[9px] font-mono uppercase px-2 py-1 border", estado.defconCiber >= 4 ? "border-red-hud text-red-hud bg-red-hud/10 v90-lateja2" : "border-emerald-hud/60 text-emerald-hud bg-emerald-hud/10")}>
            <ShieldAlert className="w-3 h-3" /> DEFCON CIBER {estado.defconCiber}
          </span>
        }
      />
      <HeroOro panel="ciber" />

      {/* v322: EL ADVERSARIO DEL DÍA — el anillo del ciber (QUINTO consumidor
          del patrón compartido: mando v313, instituto v318, red v320, canal
          v321, ciber v322). La franja da nombre al quién y declara la ley. */}
      <div className="hud-panel px-3 py-2.5 relative overflow-hidden" aria-label="Campaña del día">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[8px] font-mono uppercase tracking-widest" style={{ color: campana.color }}>★ campaña del día</span>
          <span className="text-xs font-bold font-mono uppercase" style={{ color: campana.color }}>{campana.nombre}</span>
          <span className="text-[9px] font-mono text-muted-foreground">{campana.alias} · {nacionCampana?.bandera} {nacionCampana?.nombre}</span>
        </div>
        <p className="text-[10px] text-muted-foreground leading-snug mt-1">{campana.nota}</p>
        <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
          {campana.sectores.map((sid) => {
            const s = SECTORES.find((x) => x.id === sid);
            return s ? (
              <span key={sid} className="text-[8px] font-mono uppercase px-1.5 py-0.5 border bg-background/80" style={{ color: campana.color, borderColor: `${campana.color}55` }}>
                {s.emoji} {s.nombre}
              </span>
            ) : null;
          })}
          <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 border border-border bg-background/80 text-muted-foreground">
            firma: {campana.tec}
          </span>
          <span className="ml-auto text-[9px] font-mono uppercase" style={{ color: vivosCampana > 0 ? campana.color : undefined }}>
            {vivosCampana > 0 ? `${vivosCampana} arcos suyos vivos ahora` : "sin arcos suyos en la ventana — el contador sigue"}
          </span>
        </div>
        <p className="text-[8px] font-mono uppercase text-muted-foreground/70 mt-1.5">
          el anillo del ciber avanza una campaña por día — 12 campañas en el catálogo, dos días seguidos jamás repiten la campaña del día · la atribución de cada arco es estimación
        </p>
      </div>

      {/* contadores */}
      <div className="hud-panel p-3 grid grid-cols-3 sm:grid-cols-6 gap-2">
        <Contador valor={estado.totalHoy} etiqueta="ataques hoy" color="#FF4D4D" />
        <Contador valor={estado.ataques.length} etiqueta="vivos ahora" color="#FF8A3D" />
        <Contador valor={estado.porTipo[0]?.n ?? 0} etiqueta={estado.porTipo[0]?.tipo.nombre ?? "ddos"} color="#FFD23D" />
        <Contador valor={estado.topObjetivos[0]?.n ?? 0} etiqueta={`objetivo #1 · ${estado.topObjetivos[0]?.nacion.bandera ?? ""}`} color="#B48CFF" />
        <Contador valor={estado.topOrigenes[0]?.n ?? 0} etiqueta={`origen #1 · ${estado.topOrigenes[0]?.nacion.bandera ?? ""}`} color="#4DFFC4" />
        <Contador valor={Math.round(tension)} etiqueta="tensión vanguard" color="#3DDCFF" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-3">
        {/* MAPA DE ARCOS */}
        <div className="hud-panel p-2 relative overflow-hidden">
          <WorldMapSVG routes={rutas} showFronts={false} showSat />
          <div className="absolute top-2 left-2 hud-panel px-2 py-1 text-[8px] font-mono uppercase text-muted-foreground flex items-center gap-1.5">
            <span className="beacon w-1.5 h-1.5 rounded-full bg-red-hud" /> {estado.ataques.length} arcos de intrusión activos
          </div>
          {/* leyenda de tipos */}
          <div className="absolute bottom-2 left-2 flex gap-1.5 flex-wrap max-w-[70%]">
            {TIPOS_ATAQUE.map((t) => {
              const n = estado.ataques.filter((a: Ataque) => a.tipo.id === t.id).length;
              return (
                <span key={t.id} className="text-[8px] font-mono uppercase px-1.5 py-0.5 border bg-background/80" style={{ color: t.color, borderColor: `${t.color}55` }}>
                  {t.nombre} {n > 0 && <b>{n}</b>}
                </span>
              );
            })}
          </div>
        </div>

        {/* RANKINGS + FEED */}
        <div className="space-y-3">
          <div className="hud-panel p-3">
            <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-2">
              <Target className="w-3 h-3" /> objetivos más atacados
            </p>
            <div className="space-y-1.5">
              {estado.topObjetivos.map((o, i) => (
                <div key={o.nacion.id} className="flex items-center gap-2">
                  <span className="text-[10px] w-5 text-muted-foreground font-mono">#{i + 1}</span>
                  <span className="text-xs w-6">{o.nacion.bandera}</span>
                  <span className="text-[10px] font-mono uppercase flex-1 truncate">{o.nacion.nombre}</span>
                  <div className="w-16 h-1.5 bg-border/50 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(o.n / maxTop) * 100}%` }}
                      transition={{ duration: 0.6 }}
                      className="h-full v90-barra"
                      style={{ background: "#FF6B4D" }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground w-10 text-right">{o.n.toLocaleString("es-ES")}</span>
                </div>
              ))}
            </div>
            <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mt-3 mb-2">
              <Globe2 className="w-3 h-3" /> orígenes más activos
            </p>
            <div className="space-y-1.5">
              {estado.topOrigenes.map((o, i) => (
                <div key={o.nacion.id} className="flex items-center gap-2">
                  <span className="text-[10px] w-5 text-muted-foreground font-mono">#{i + 1}</span>
                  <span className="text-xs w-6">{o.nacion.bandera}</span>
                  <span className="text-[10px] font-mono uppercase flex-1 truncate">{o.nacion.nombre}</span>
                  <div className="w-16 h-1.5 bg-border/50 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(o.n / maxTop) * 100}%` }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className="h-full v90-barra"
                      style={{ background: "#B48CFF" }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground w-10 text-right">{o.n.toLocaleString("es-ES")}</span>
                </div>
              ))}
            </div>
          </div>

          {/* FEED DE INTRUSIÓN */}
          <div className="hud-panel p-0 flex flex-col max-h-[300px] overflow-hidden">
            <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground px-3 py-2 border-b border-border/60 sticky top-0 bg-background/95 flex items-center gap-1.5">
              <Activity className="w-3 h-3" /> feed de intrusión
            </p>
            <div className="overflow-y-auto thin-scroll flex-1">
              <AnimatePresence initial={false}>
                {estado.ataques.slice(0, 12).map((a) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="px-3 py-1.5 border-b border-border/40 flex items-center gap-2"
                  >
                    <span className="text-sm leading-none">{a.origen.bandera}</span>
                    <span className="text-[9px] font-mono" style={{ color: a.tipo.color }}>→</span>
                    <span className="text-sm leading-none">{a.objetivo.bandera}</span>
                    <span className="text-[9px] font-mono uppercase" style={{ color: a.tipo.color }}>{a.tipo.nombre}</span>
                    <span className="text-[9px] font-mono text-muted-foreground truncate">{a.sector.emoji} {a.sector.nombre}</span>
                    {a.campanaId === campana.id && (
                      <span title="atribución estimada" className="text-[7px] font-mono uppercase px-1 border shrink-0" style={{ color: campana.color, borderColor: `${campana.color}66` }}>⚔ {campana.alias}</span>
                    )}
                    <span className="ml-auto flex gap-0.5 shrink-0">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={cn("w-1 h-2.5", i < a.intensidad ? "" : "opacity-20")} style={{ background: i < a.intensidad ? a.tipo.color : undefined }} />
                      ))}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

// ============================================================
// v121.0 LA CAMA MÁS CÓMODA — LA HABITACIÓN DE PERSONALIZACIÓN
// "imagina que Vanguard lo hagas como la cama más cómoda que se
// adapte a cada usuario y personalice". Esta sala ajusta TODA la
// casa en vivo: el movimiento entre secciones, el tamaño de las
// letras, el aire, el color personal, el modo noche y —lo más
// íntimo— APRENDE qué salas visitas y te las pone a mano.
// ============================================================
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { IlustracionViva } from "@/components/vanguard/ilustraciones-vivas";
import { useCama, ESTILOS_TRANSICION, ACENTOS, type EstiloTransicion, type Densidad } from "@/lib/cama-store";
import { ALL_TABS, TABS, type TabKey } from "@/components/vanguard/tab-nav";
import { navigateTo } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { BedDouble, Sparkles, Palette, Type, Move3d, MoonStar, History, Star, RotateCcw, Play, Flame, Gauge } from "lucide-react";

/** Variantes de la vista previa — espejo exacto de las de page.tsx */
function variantePreview(estilo: EstiloTransicion) {
  switch (estilo) {
    case "cine3d":
      return { inicial: { opacity: 0, rotateY: -70, x: 40 }, final: { opacity: 1, rotateY: 0, x: 0 } };
    case "telon":
      return { inicial: { opacity: 0, scaleY: 0.3, y: -30 }, final: { opacity: 1, scaleY: 1, y: 0 } };
    case "hiperespacio":
      return { inicial: { opacity: 0, scale: 1.9 }, final: { opacity: 1, scale: 1 } };
    case "disolver":
      return { inicial: { opacity: 0, scale: 0.985 }, final: { opacity: 1, scale: 1 } };
    default:
      return { inicial: { opacity: 0, x: 44 }, final: { opacity: 1, x: 0 } };
  }
}

export function CamaPanel() {
  const cama = useCama();
  const [demoKey, setDemoKey] = useState(0);
  const [demoEstilo, setDemoEstilo] = useState<EstiloTransicion | null>(null);

  const estiloActivo = demoEstilo ?? cama.transicion;
  const v = variantePreview(estiloActivo);

  /** Las salas favoritas del dueño: sus 4 más visitadas + recientes */
  const topSalas = useMemo(
    () => Object.entries(cama.visitas).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, n]) => ({ key: k as TabKey, n })),
    [cama.visitas]
  );

  const reproducir = (estilo?: EstiloTransicion) => {
    if (estilo) setDemoEstilo(estilo);
    setDemoKey((k) => k + 1);
  };

  return (
    <div className="space-y-4">
      <PanelHeader
        title="LA CAMA"
        subtitle="La habitación donde Vanguard se adapta a ti — todo cambia EN VIVO"
        icon={<BedDouble className="w-4 h-4" />}
        color="violet"
      />

      {/* HÉROE: la metáfora de la cama */}
      <div className="hud-panel p-5 relative overflow-hidden">
        <div className="flex items-center gap-5 flex-wrap">
          <IlustracionViva tipo="cama" ancho={150} className="shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="font-mono text-sm font-bold tracking-wider text-foreground uppercase">
              Vanguard <span style={{ color: "var(--vg-acento, #FFC94D)" }}>se hace a tu medida</span>
            </h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-1.5">
              Como la cama más cómoda del mundo: se adapta a tu cuerpo y a tu horario. Elige cómo
              viajas entre salas, cómo de grande se ve todo, tu color personal, y déjala aprender
              tu camino — <span className="text-foreground">tus salas de siempre llegan solas</span>.
            </p>
          </div>
        </div>
      </div>

      {/* 1. MOVIMIENTO: estilo de transición + vista previa */}
      <div className="hud-panel p-4">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2 mb-3">
          <Move3d className="w-3.5 h-3.5 text-violet-hud" /> CÓMO VIAJAS ENTRE SECCIONES
        </p>
        <div className="grid sm:grid-cols-[240px_1fr] gap-4">
          <div className="space-y-1.5">
            {ESTILOS_TRANSICION.map((e) => (
              <button
                key={e.id}
                onClick={() => { cama.setTransicion(e.id); reproducir(e.id); }}
                className={cn(
                  "w-full text-left px-3 py-2 rounded border font-mono text-[10px] transition-all",
                  cama.transicion === e.id
                    ? "border-violet-hud bg-violet-hud/15 text-violet-hud shadow-[0_0_14px_-4px_var(--vg-acento,#FFC94D)]"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                )}
              >
                <span className="font-bold tracking-wider">{e.nombre}</span>
                <span className="block text-[9px] opacity-70 normal-case mt-0.5">{e.desc}</span>
              </button>
            ))}
          </div>
          <div className="relative border border-border rounded bg-black/50 overflow-hidden min-h-[220px] flex flex-col">
            <div className="absolute top-2 left-0 right-0 text-center font-mono text-[8px] uppercase tracking-[0.25em] text-muted-foreground z-10">
              VISTA PREVIA — toca reproducir
            </div>
            <button
              onClick={() => reproducir()}
              className="absolute top-6 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded border border-violet-hud/50 text-violet-hud font-mono text-[9px] font-bold hover:bg-violet-hud/15 transition-colors"
            >
              <Play className="w-3 h-3" /> REPRODUCIR
            </button>
            <div className="flex-1 flex items-center justify-center p-4 [perspective:800px]" style={{ marginTop: 28 }}>
              <motion.div
                key={demoKey}
                initial={v.inicial}
                animate={v.final}
                transition={{ duration: Math.max(0.25, 0.55 * Math.max(0.2, cama.movimiento)), ease: [0.22, 1, 0.36, 1] }}
                className="hud-panel px-6 py-5 text-center"
                style={{ transformOrigin: "center" }}
              >
                <IlustracionViva tipo={cama.modoCama ? "cama" : "ciudad"} ancho={110} className="mx-auto" />
                <p className="font-mono text-[10px] font-bold tracking-widest mt-2" style={{ color: "var(--vg-acento, #FFC94D)" }}>
                  TU SALA
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. INTENSIDAD DE MOVIMIENTO */}
      <div className="hud-panel p-4">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2 mb-3">
          <Gauge className="w-3.5 h-3.5 text-cyan-hud" /> INTENSIDAD DE MOVIMIENTO — <span className="text-cyan-hud">{Math.round(cama.movimiento * 100)}%</span>
        </p>
        <input
          type="range"
          min={0}
          max={120}
          value={Math.round(cama.movimiento * 100)}
          onChange={(e) => cama.setMovimiento(Number(e.target.value) / 100)}
          className="w-full accent-cyan-400"
        />
        <div className="flex justify-between font-mono text-[8px] text-muted-foreground mt-1">
          <span>CALMA ABSOLUTA (0%)</span>
          <span>NORMAL (100%)</span>
          <span>TORRENTE (120%)</span>
        </div>
      </div>

      {/* 3. LETRAS + DENSIDAD */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="hud-panel p-4">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2 mb-3">
            <Type className="w-3.5 h-3.5 text-amber-hud" /> TAMAÑO DE LAS LETRAS — <span className="text-amber-hud">{Math.round(cama.letraEscala * 100)}%</span>
          </p>
          <input
            type="range"
            min={85}
            max={130}
            value={Math.round(cama.letraEscala * 100)}
            onChange={(e) => cama.setLetraEscala(Number(e.target.value) / 100)}
            className="w-full accent-amber-400"
          />
          <div className="flex justify-between font-mono text-[8px] text-muted-foreground mt-1">
            <span>85%</span><span>100%</span><span>130%</span>
          </div>
          <p className="text-[9px] text-muted-foreground mt-2 leading-relaxed">
            Toda la casa crece o respira contigo: títulos, noticias, fichas y hasta el mapa.
          </p>
        </div>

        <div className="hud-panel p-4">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-green-hud" /> AIRE VISUAL (DENSIDAD)
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {(["compacta", "normal", "amplia"] as Densidad[]).map((d) => (
              <button
                key={d}
                onClick={() => cama.setDensidad(d)}
                className={cn(
                  "px-2 py-2 rounded border font-mono text-[9px] font-bold uppercase tracking-wider transition-all",
                  cama.densidad === d ? "border-green-hud bg-green-hud/15 text-green-hud" : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {d}
              </button>
            ))}
          </div>
          <p className="text-[9px] text-muted-foreground mt-2 leading-relaxed">
            Compacta para leer más de un vistazo; amplia para dejar descansar la vista.
          </p>
        </div>
      </div>

      {/* 4. COLOR PERSONAL */}
      <div className="hud-panel p-4">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2 mb-3">
          <Palette className="w-3.5 h-3.5 text-amber-hud" /> TU COLOR PERSONAL
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {ACENTOS.map((a) => (
            <button
              key={a.id}
              onClick={() => cama.setAcento(a.hex)}
              title={a.nombre}
              className={cn(
                "w-9 h-9 rounded-full border-2 transition-all hover:scale-110",
                cama.acento === a.hex ? "scale-110" : "border-transparent opacity-70"
              )}
              style={{
                background: a.hex,
                borderColor: cama.acento === a.hex ? "#fff" : "transparent",
                boxShadow: cama.acento === a.hex ? `0 0 16px -2px ${a.hex}` : undefined,
              }}
              aria-label={a.nombre}
            />
          ))}
          <span className="font-mono text-[9px] text-muted-foreground ml-2">
            se aplica a selección, bordes, brillos y transiciones en TODA la casa
          </span>
        </div>
      </div>

      {/* 5. MODO CAMA + AUTO-CAMA */}
      <div className="hud-panel p-4">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2 mb-3">
          <MoonStar className="w-3.5 h-3.5 text-violet-hud" /> MODO CAMA — LA CALMA DE NOCHE
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <button
            onClick={() => cama.setModoCama(!cama.modoCama)}
            className={cn(
              "text-left p-3 rounded border transition-all",
              cama.modoCama ? "border-violet-hud bg-violet-hud/15" : "border-border hover:border-foreground/30"
            )}
          >
            <p className="font-mono text-[10px] font-bold tracking-wider text-foreground">MODO CAMA MANUAL</p>
            <p className="text-[9px] text-muted-foreground mt-1 leading-relaxed">
              Tinte cálido de ocaso, movimiento suave y todo listo para descansar los ojos.
              <span className={cn("ml-1 font-bold", cama.modoCama ? "text-violet-hud" : "text-muted-foreground")}>{cama.modoCama ? "ACTIVO" : "APAGADO"}</span>
            </p>
          </button>
          <button
            onClick={() => cama.setAutoCama(!cama.autoCama)}
            className={cn(
              "text-left p-3 rounded border transition-all",
              cama.autoCama ? "border-violet-hud bg-violet-hud/15" : "border-border hover:border-foreground/30"
            )}
          >
            <p className="font-mono text-[10px] font-bold tracking-wider text-foreground">AUTO-CAMA (22:00 → 07:00)</p>
            <p className="text-[9px] text-muted-foreground mt-1 leading-relaxed">
              La casa se acuesta sola: a las 22:00 de TU reloj el modo cama se pone sin tocar nada.
              <span className={cn("ml-1 font-bold", cama.autoCama ? "text-violet-hud" : "text-muted-foreground")}>{cama.autoCama ? "ACTIVO" : "APAGADO"}</span>
            </p>
          </button>
        </div>
      </div>

      {/* 6. ADAPTACIÓN: tus salas de siempre */}
      <div className="hud-panel p-4">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2 mb-3">
          <History className="w-3.5 h-3.5 text-cyan-hud" /> LA CASA APRENDIÓ TU CAMINO
        </p>
        {topSalas.length === 0 ? (
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Recorre Vanguard y esta cama se moldeará a ti: tus salas más visitadas aparecerán aquí a un toque.
          </p>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {topSalas.map(({ key, n }, i) => (
                <button
                  key={key}
                  onClick={() => navigateTo(key)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-amber-hud/40 bg-amber-hud/10 font-mono text-[10px] font-bold text-amber hover:border-amber-hud transition-colors"
                >
                  <Flame className="w-3 h-3" />
                  {TABS[key]?.short ?? key.toUpperCase()}
                  <span className="opacity-60">×{n}</span>
                  {i === 0 && <Star className="w-3 h-3 text-amber-hud" />}
                </button>
              ))}
            </div>
            {cama.recientes.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground">recientes:</span>
                {cama.recientes.slice(0, 6).map((k) => (
                  <button
                    key={k}
                    onClick={() => navigateTo(k)}
                    className="px-2 py-1 rounded border border-border font-mono text-[9px] text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
                  >
                    {TABS[k]?.short ?? k}
                  </button>
                ))}
              </div>
            )}
            <p className="font-mono text-[9px] text-muted-foreground pt-1">
              {Object.values(cama.visitas).reduce((a, b) => a + b, 0)} viajes registrados · {ALL_TABS.length} salas te esperan
            </p>
          </div>
        )}
      </div>

      {/* Reset */}
      <div className="flex justify-end">
        <button
          onClick={() => { if (confirm("¿Devolver LA CAMA a su estado de fábrica?")) { cama.resetCama(); } }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border font-mono text-[9px] font-bold uppercase tracking-wider text-muted-foreground hover:text-red-hud hover:border-red-hud/50 transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> RESTAURAR LA CAMA
        </button>
      </div>
    </div>
  );
}

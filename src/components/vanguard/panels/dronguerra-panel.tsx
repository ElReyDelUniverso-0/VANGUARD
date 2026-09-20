"use client";

// ============================================================
// VANGUARD v24 — GUERRA DE DRONES · EL LADO DESAGRADABLE
// Cifras duras documentadas de muertes por drones + planos
// técnicos anotados (museo) de los 4 sistemas que dominan el
// frente: Shahed, FPV, Bayraktar TB2 y Lancet.
// ============================================================
import { useMemo, useState } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { DRONE_MODELS, DRONE_CASUALTY_FACTS, type DroneModel } from "@/lib/dark-data";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Crosshair, Skull, Radio, AlertTriangle, ChevronRight } from "lucide-react";

// ---------- planos SVG por modelo (vista lateral, estilo museo) ----------
function DroneDiagram({ model, activePart }: { model: DroneModel; activePart: number | null }) {
  const ink = "#8b8b8b";
  const hi = "#f59e0b";
  const stroke = (i: number) => (activePart === i ? hi : ink);
  const sw = (i: number) => (activePart === i ? 1.8 : 1.1);

  return (
    <svg viewBox="0 0 100 74" className="w-full" role="img" aria-label={`Plano técnico ${model.name}`}>
      <rect x="0" y="0" width="100" height="74" fill="#0b0b0c" />
      <g opacity="0.25" stroke="#333" strokeWidth="0.15">
        {Array.from({ length: 12 }, (_, i) => (
          <line key={`v${i}`} x1={i * 9} y1="0" x2={i * 9} y2="74" />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 10.5} x2="100" y2={i * 10.5} />
        ))}
      </g>

      {model.id === "shahed" && (
        <g>
          {/* fuselaje delta */}
          <path d="M12 36 L72 30 L88 34 L72 42 Z" fill="none" stroke={stroke(2)} strokeWidth={sw(2)} />
          {/* nariz */}
          <path d="M12 36 L20 32.5 L20 39 Z" fill="none" stroke={stroke(0)} strokeWidth={sw(0)} />
          {/* ojiva */}
          <path d="M20 32.5 L30 31.5 L30 40.5 L20 39 Z" fill="none" stroke={stroke(1)} strokeWidth={sw(1)} />
          {/* motor */}
          <rect x="56" y="31.5" width="12" height="9" fill="none" stroke={stroke(3)} strokeWidth={sw(3)} />
          {/* hélice */}
          <path d="M84 30 L84 42" stroke={stroke(4)} strokeWidth={sw(4)} />
          <path d="M82 36 Q84 30 86 36 Q88 42 84 36" fill="none" stroke={stroke(4)} strokeWidth={sw(4) * 0.7} />
          {/* aletas */}
          <path d="M72 30 L82 18 L88 34" fill="none" stroke={stroke(5)} strokeWidth={sw(5)} />
          <path d="M76 40 L84 48" stroke={stroke(5)} strokeWidth={sw(5)} opacity="0.7" />
        </g>
      )}

      {model.id === "fpv" && (
        <g>
          {/* brazos */}
          <path d="M35 37 L14 22 M35 37 L14 52 M65 37 L86 22 M65 37 L86 52" stroke={stroke(1)} strokeWidth={sw(1)} />
          {/* hélices */}
          {[14, 22, 86, 22].map((x, idx) => (
            <circle key={idx} cx={x} cy={idx % 2 === 0 ? 22 : 52} r="6" fill="none" stroke={stroke(3)} strokeWidth={sw(3) * 0.6} strokeDasharray="2 1.5" />
          ))}
          {/* frame central */}
          <rect x="34" y="30" width="32" height="14" rx="2" fill="none" stroke={stroke(1)} strokeWidth={sw(1)} />
          {/* cámara */}
          <path d="M30 35 L34 33 L34 39 L30 37 Z" fill="none" stroke={stroke(0)} strokeWidth={sw(0)} />
          {/* batería */}
          <rect x="40" y="41" width="16" height="6" rx="1" fill="none" stroke={stroke(2)} strokeWidth={sw(2)} />
          {/* carga útil */}
          <path d="M58 44 L58 50 L70 50 L70 44" fill="none" stroke={stroke(4)} strokeWidth={sw(4)} />
          <path d="M60 50 L60 53 M68 50 L68 53" stroke={stroke(4)} strokeWidth={sw(4) * 0.7} />
          {/* antena */}
          <path d="M66 30 L72 24" stroke={stroke(5)} strokeWidth={sw(5)} />
          <circle cx="72.5" cy="23.5" r="1.6" fill="none" stroke={stroke(5)} strokeWidth={sw(5) * 0.7} />
        </g>
      )}

      {model.id === "bayraktar" && (
        <g>
          {/* nariz EO/IR */}
          <circle cx="14" cy="38" r="5" fill="none" stroke={stroke(0)} strokeWidth={sw(0)} />
          <circle cx="14" cy="38" r="2" fill="none" stroke={stroke(0)} strokeWidth={sw(0) * 0.7} />
          {/* fuselaje */}
          <path d="M18 36 Q40 32 66 34 L74 36 Q60 42 24 42 Z" fill="none" stroke={stroke(1)} strokeWidth={sw(1)} />
          {/* ala */}
          <path d="M40 34 L48 20 L56 20 L50 34" fill="none" stroke={stroke(2)} strokeWidth={sw(2)} />
          <path d="M40 41 L46 54 L54 54 L50 41" fill="none" stroke={stroke(2)} strokeWidth={sw(2) * 0.7} />
          {/* pilones MAM */}
          <rect x="43" y="55" width="4" height="6" fill="none" stroke={stroke(3)} strokeWidth={sw(3)} />
          <rect x="52" y="55" width="4" height="6" fill="none" stroke={stroke(3)} strokeWidth={sw(3)} />
          {/* cola V invertida */}
          <path d="M66 34 L80 26 M66 42 L80 50" fill="none" stroke={stroke(4)} strokeWidth={sw(4)} />
          {/* hélice */}
          <path d="M84 30 L84 46" stroke={stroke(5)} strokeWidth={sw(5)} />
          <path d="M82 38 Q84 30 86 38 Q88 46 84 38" fill="none" stroke={stroke(5)} strokeWidth={sw(5) * 0.7} />
        </g>
      )}

      {model.id === "lancet" && (
        <g>
          {/* cámara de guiado */}
          <circle cx="12" cy="38" r="4" fill="none" stroke={stroke(0)} strokeWidth={sw(0)} />
          {/* ojiva */}
          <path d="M16 35 L26 34 L26 42 L16 41 Z" fill="none" stroke={stroke(1)} strokeWidth={sw(1)} />
          {/* alas X dobles */}
          <path d="M26 34 L48 22 L54 24 L38 34 M26 42 L48 54 L54 52 L38 42" fill="none" stroke={stroke(2)} strokeWidth={sw(2)} />
          <path d="M42 28 L62 16 L68 18 L54 28 M42 48 L62 60 L68 58 L54 48" fill="none" stroke={stroke(2)} strokeWidth={sw(2) * 0.7} />
          {/* motor */}
          <rect x="58" y="33" width="12" height="10" rx="1.5" fill="none" stroke={stroke(3)} strokeWidth={sw(3)} />
          {/* hélice */}
          <path d="M82 30 L82 46" stroke={stroke(4)} strokeWidth={sw(4)} />
          <path d="M80 38 Q82 30 84 38 Q86 46 82 38" fill="none" stroke={stroke(4)} strokeWidth={sw(4) * 0.7} />
        </g>
      )}

      {/* marcadores numerados de piezas */}
      {model.parts.map((p, i) => (
        <g key={i} onClick={() => document.getElementById(`dp-${model.id}-${i}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" })} className="cursor-pointer">
          <circle cx={p.x} cy={p.y} r="3.4" fill={activePart === i ? hi : "#111"} stroke={activePart === i ? hi : ink} strokeWidth="0.7" />
          <text x={p.x} y={p.y + 1.4} textAnchor="middle" fontSize="3.6" fontWeight="bold" fill={activePart === i ? "#000" : ink} fontFamily="monospace">
            {i + 1}
          </text>
        </g>
      ))}
      <text x="2.5" y="71" fontSize="3" fill="#555" fontFamily="monospace">VANGUARD ARCHIVO TÉCNICO · SOLO EDUCATIVO</text>
    </svg>
  );
}

export function DronGuerraPanel() {
  const [modelIdx, setModelIdx] = useState(0);
  const [activePart, setActivePart] = useState<number | null>(null);
  const model = DRONE_MODELS[modelIdx];

  const facts = useMemo(() => DRONE_CASUALTY_FACTS, []);

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Guerra de drones · Miles mueren desde el cielo"
        subtitle={`${DRONE_MODELS.length} sistemas con plano técnico · cifras documentadas de víctimas`}
        icon={<Crosshair className="w-4 h-4 text-red-hud" />}
        color="red"
      />

      {/* Cifras duras */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {facts.map((f) => (
          <motion.div key={f.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="hud-corner p-3">
            <p className="font-mono text-xl font-bold text-red-hud leading-none">{f.stat}</p>
            <p className="text-[10px] text-muted-foreground leading-snug mt-1.5">{f.label}</p>
            <p className="text-[8px] font-mono text-green-hud uppercase mt-1">fuente: {f.source}</p>
          </motion.div>
        ))}
      </div>

      {/* Aviso */}
      <div className="hud-corner p-3 border-red-hud/40 bg-red-hud/5 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-red-hud mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Los drones matan a miles de personas civiles y militares cada año, y también a quienes los documentan:
          operadores de cámara y verificadores han sido objetivo directo por grabar impactos. Los planos de esta sala
          son de archivo público (museo educativo): su objetivo es que entiendas <strong className="text-foreground">cómo funciona el arma
          que está redefiniendo el frente</strong>, no cómo construir ninguna.
        </p>
      </div>

      {/* Selector de modelos */}
      <div className="hud-corner p-2 flex items-center gap-1 flex-wrap">
        {DRONE_MODELS.map((m, i) => (
          <button
            key={m.id}
            onClick={() => { setModelIdx(i); setActivePart(null); }}
            className={cn(
              "px-2 py-1 border text-[9px] font-mono uppercase transition-colors",
              modelIdx === i ? "border-red-hud text-red-hud bg-red-hud/20" : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* Plano + fichas */}
      <div className="grid lg:grid-cols-5 gap-3">
        <div className="lg:col-span-2 space-y-2">
          <div className="hud-corner p-2">
            <DroneDiagram model={model} activePart={activePart} />
          </div>
          <div className="hud-corner p-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] font-mono">
            {[
              ["origen", model.origin],
              ["usuarios", model.users],
              ["clase", model.kind],
              ["alcance", model.reach],
              ["velocidad", model.speed],
              ["carga", model.warhead],
              ["costo aprox.", model.cost],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline gap-1 min-w-0">
                <span className="text-muted-foreground uppercase flex-shrink-0">{k}:</span>
                <span className="text-foreground truncate">{v}</span>
              </div>
            ))}
          </div>
          <div className="hud-corner p-2.5">
            <p className="text-[11px] text-muted-foreground leading-relaxed">{model.note}</p>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-1.5">
          <p className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
            <Radio className="w-3 h-3 inline mr-1" /> piezas que hacen que funcione — pulsa cada una
          </p>
          <AnimatePresence mode="wait">
            <motion.div key={model.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-1.5">
              {model.parts.map((p, i) => (
                <button
                  key={i}
                  id={`dp-${model.id}-${i}`}
                  onClick={() => setActivePart(activePart === i ? null : i)}
                  className={cn(
                    "hud-corner p-2.5 text-left transition-colors flex items-start gap-2.5",
                    activePart === i ? "border-amber-hud bg-amber-hud/10" : "hover:bg-secondary/40"
                  )}
                >
                  <span
                    className={cn(
                      "w-6 h-6 flex-shrink-0 flex items-center justify-center border font-mono text-[11px] font-bold",
                      activePart === i ? "border-amber-hud text-amber bg-amber-hud/20" : "border-border text-muted-foreground"
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className={cn("text-xs font-bold leading-tight block", activePart === i ? "text-amber" : "text-foreground")}>{p.name}</span>
                    <span className="text-[11px] text-muted-foreground leading-snug mt-0.5 block">{p.desc}</span>
                  </span>
                  <ChevronRight className={cn("w-3.5 h-3.5 flex-shrink-0 mt-1", activePart === i ? "text-amber" : "text-muted-foreground/40")} />
                </button>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* El lado humano */}
      <div className="hud-corner p-3 border-violet-hud/40">
        <p className="text-[10px] font-mono uppercase text-violet-hud tracking-wider mb-1.5 flex items-center gap-1.5">
          <Skull className="w-3 h-3" /> el lado humano de las estadísticas
        </p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Detrás de cada &ldquo;impacto confirmado&rdquo; hay personas: familias que esperan trenes en Kramatorsk, vecinos que
          sacan a heridos de un campo de refugiados con las manos, soldados que escuchan por primera vez el zumbido de
          un FPV sin poder correr. Si quieres entender el costo completo, visita el <strong className="text-foreground">MEMORIAL</strong> y
          enciende una vela, o documenta un caso en <strong className="text-foreground">CRÍMENES Y ABUSOS</strong> para que no caiga en el olvido.
        </p>
      </div>
    </div>
  );
}

"use client";

// VANGUARD v26 — GOOGLE MAPS DE LOS CONFLICTOS (SIN LAG)
// El usuario pidió: "el mapa 3D tiene lag, agrega el de Google Maps".
// Este panel usa los iframes EMBEBIDOS de Google Maps (output=embed) que no
// requieren API key, cargan ligero y muestran el terreno REAL satelital de
// cada zona de conflicto. El globo 3D (globe.gl) queda para vista panorámica;
// aquí está la vista rápida sin lag.

import { useState } from "react";
import { cn } from "@/lib/utils";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { Maximize2, ExternalLink, MapPin, Satellite } from "lucide-react";
import { WORLD_FLAG_MAP } from "@/lib/world-data";

interface Zone {
  id: string;
  name: string;
  flag: string; // ISO2
  lat: number;
  lng: number;
  z: number; // zoom
  desc: string;
  facts: string[];
}

const ZONES: Zone[] = [
  {
    id: "ucrania-donbas", name: "Frente del Donbás", flag: "ua",
    lat: 48.0159, lng: 37.8029, z: 8,
    desc: "La línea de contacto más larga de Europa: trincheras, zonas fortificadas y ciudades fortaleza en disputa constante desde 2014.",
    facts: ["Línea de contacto ~1.200 km", "Fortificaciones desde 2014", "Combates activos: Donetsk, Luhansk, Zaporizhzhia"],
  },
  {
    id: "gaza", name: "Franja de Gaza", flag: "ps",
    lat: 31.5017, lng: 34.4668, z: 11,
    desc: "41 km de costa densamente poblada, escenario de una de las crisis humanitarias más documentadas de la década.",
    facts: ["~365 km² de superficie", "2.1M de habitantes", "Frontera con Egipto e Israel"],
  },
  {
    id: "sudan", name: "Jartum, Sudán", flag: "sd",
    lat: 15.5007, lng: 32.5599, z: 11,
    desc: "El mayor desplazamiento forzado del planeta: RSF y el ejército disputan la capital y el valle del Nilo.",
    facts: ["10M+ de desplazados internos", "Hambruna declarada en Darfur", "Conflicto RSF vs SAF desde abr 2023"],
  },
  {
    id: "mar-rojo", name: "Mar Rojo — Bab el-Mandeb", flag: "ye",
    lat: 12.5833, lng: 43.3333, z: 7,
    desc: "El cuello de botella del comercio mundial: 12% del tráfico marítimo pasa bajo los misiles de los hutíes.",
    facts: ["Estrecho de ~26 km de ancho", "Rutas Asia-Europa críticas", "Ataques a buques desde 2023"],
  },
  {
    id: "taiwan", name: "Estrecho de Taiwán", flag: "tw",
    lat: 24.5, lng: 120.0, z: 7,
    desc: "La línea roja global: maniobras navales diarias, incursiones aéreas y la mayor tensión estratégica del Pacífico.",
    facts: ["180 km de ancho mínimo", "Línea mediana cruzada a diario", "90% de los chips avanzados del mundo cerca"],
  },
  {
    id: "sahel", name: "Sahel — Lago Chad", flag: "ne",
    lat: 13.0, lng: 14.0, z: 7,
    desc: "Cuatro países, tres insurgencias y el cinturón más letal del terrorismo yihadista según el Índice Global del Terrorismo.",
    facts: ["Níger, Nigeria, Chad y Camerún", "Boko Haram + JNIM + ISGS", "Coup belt: 6 golpes desde 2020"],
  },
  {
    id: "myanmar", name: "Myanmar — Rakhine", flag: "mm",
    lat: 20.15, lng: 92.9, z: 8,
    desc: "Guerra civil tras el golpe de 2021: Ejército de Defensa étnicos, junta y ofensivas coordinadas en el norte.",
    facts: ["3M+ desplazados", "Operación 1027 desde oct 2023", "Conflicto Rohingya documentado por la ONU"],
  },
  {
    id: "kashmir", name: "Cachemira — LoC", flag: "in",
    lat: 34.0837, lng: 74.7973, z: 9,
    desc: "La frontera más militarizada del mundo entre dos potencias nucleares: India y Pakistán se disputan el valle desde 1947.",
    facts: ["Línea de Control de 740 km", "2 potencias nucleares", "Cese al fuego violado cientos de veces"],
  },
];

function embedUrl(z: Zone, sat: boolean): string {
  const t = sat ? "k" : "m"; // k = satélite, m = mapa
  return `https://maps.google.com/maps?q=${z.lat},${z.lng}&z=${z.z}&t=${t}&hl=es&output=embed`;
}

function extUrl(z: Zone): string {
  return `https://www.google.com/maps/@${z.lat},${z.lng},${z.z}z/data=!5m1!1e4`;
}

export function GMapsPanel() {
  const [active, setActive] = useState<Zone>(ZONES[0]);
  const [sat, setSat] = useState(true);
  const [full, setFull] = useState(false);

  return (
    <div className="space-y-4">
      <PanelHeader
        title="GOOGLE MAPS DE CONFLICTOS"
        subtitle="Vista satelital REAL de cada zona caliente — ligera, sin lag, sin globos 3D pesados"
        icon={<Satellite className="w-5 h-5 text-cyan-hud" />}
        color="cyan"
      />

      <div className="grid lg:grid-cols-[280px_1fr] gap-3">
        {/* selector de zonas */}
        <div className="hud-panel p-2 max-h-[340px] lg:max-h-[520px] overflow-y-auto thin-scroll">
          {ZONES.map((z) => (
            <button
              key={z.id}
              onClick={() => setActive(z)}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-2 rounded-sm text-left transition-colors border-b border-amber-hud/10 last:border-0",
                active.id === z.id ? "bg-cyan-hud/20" : "hover:bg-secondary/60"
              )}
            >
              <img
                src={`https://flagcdn.com/w40/${z.flag}.png`}
                alt={WORLD_FLAG_MAP[z.flag] || z.flag}
                width={28}
                height={20}
                className="border border-amber-hud/20 rounded-[2px] shrink-0"
              />
              <span className={cn("text-[11px] font-mono uppercase leading-tight", active.id === z.id ? "text-cyan-hud font-bold" : "text-foreground")}>
                {z.name}
              </span>
            </button>
          ))}
        </div>

        {/* mapa + ficha */}
        <div className="space-y-3 min-w-0">
          <div className={cn("relative hud-panel border-cyan-hud/40 overflow-hidden", full && "fixed inset-2 sm:inset-6 z-50 border-cyan-hud")}>
            <div className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-amber-hud/20 bg-secondary/30">
              <div className="flex items-center gap-1.5 min-w-0">
                <MapPin className="w-3.5 h-3.5 text-cyan-hud shrink-0" />
                <span className="text-[10px] font-mono uppercase font-bold text-cyan-hud truncate">
                  {active.name} · {active.lat.toFixed(3)}, {active.lng.toFixed(3)}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setSat((v) => !v)}
                  className={cn("px-2 py-1 text-[9px] font-mono uppercase rounded-sm border", sat ? "border-cyan-hud text-cyan-hud bg-cyan-hud/20" : "border-border text-muted-foreground")}
                >
                  {sat ? "Satélite" : "Mapa"}
                </button>
                <button
                  onClick={() => setFull((v) => !v)}
                  className="px-2 py-1 text-[9px] font-mono uppercase rounded-sm border border-border text-muted-foreground hover:text-foreground flex items-center gap-1"
                  aria-label="Pantalla completa"
                >
                  <Maximize2 className="w-3 h-3" /> {full ? "Salir" : "Ampliar"}
                </button>
                <a
                  href={extUrl(active)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2 py-1 text-[9px] font-mono uppercase rounded-sm border border-border text-muted-foreground hover:text-cyan-hud flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> Google
                </a>
              </div>
            </div>
            <iframe
              key={`${active.id}-${sat}`}
              title={`Mapa de ${active.name}`}
              src={embedUrl(active, sat)}
              className={cn("w-full", full ? "h-[calc(100vh-140px)]" : "h-[300px] sm:h-[420px]")}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="hud-panel p-3">
            <div className="text-xs font-mono font-bold uppercase text-amber mb-1">{active.name}</div>
            <p className="text-[11px] text-muted-foreground leading-snug mb-2">{active.desc}</p>
            <div className="flex flex-wrap gap-1.5">
              {active.facts.map((f) => (
                <span key={f} className="px-1.5 py-0.5 bg-cyan-hud/15 border border-cyan-hud/40 text-cyan-hud text-[9px] font-mono uppercase rounded-sm">
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

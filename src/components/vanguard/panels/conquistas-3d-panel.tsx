"use client";

// Vanguard v12 — CONQUISTAS 3D EXPLICADAS: campanas historicas paso a paso
// sobre el globo (globe.gl). Roma, Mongoles, Napoleon, WWII y Colonizacion.
// Cada paso: arcos de avance + ciudades tomadas + narracion historica.

import { useEffect, useRef, useState } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { Globe2, Play, Pause, ChevronLeft, ChevronRight, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { sfx } from "@/lib/sound";
import GlobeFactory from "globe.gl";

interface Step {
  year: string;
  title: string;
  text: string;
  arcs: [number, number, number, number][]; // [lat1,lng1,lat2,lng2]
  points: { lat: number; lng: number; name: string }[];
}

interface Campaign {
  id: string;
  name: string;
  color: string;
  desc: string;
  steps: Step[];
}

const CAMPAIGNS: Campaign[] = [
  {
    id: "roma", name: "Expansion de Roma", color: "#ef4444",
    desc: "De aldea del Tiber a dueña del Mediterraneo (Mare Nostrum) en 700 anos.",
    steps: [
      { year: "493 a.C.", title: "Latium", text: "Roma domina la Liga Latina: la base de la peninsula itálica.", arcs: [[41.9, 12.5, 41.7, 12.8], [41.9, 12.5, 41.4, 12.9]], points: [{ lat: 41.9, lng: 12.5, name: "Roma" }] },
      { year: "264 a.C.", title: "Italia entera", text: "Tras Samnitas y Pirro, Roma controla de los Apeninos a Magna Grecia.", arcs: [[41.9, 12.5, 40.9, 14.3], [41.9, 12.5, 45.4, 12.3]], points: [{ lat: 40.9, lng: 14.3, name: "Capua" }, { lat: 45.4, lng: 12.3, name: "Venetia" }] },
      { year: "146 a.C.", title: "Cartago y Grecia", text: "Zama destruye Cartago; Corinto absorbe Grecia. El Mediterraneo se abre.", arcs: [[41.9, 12.5, 36.8, 10.2], [41.9, 12.5, 37.9, 22.9]], points: [{ lat: 36.8, lng: 10.2, name: "Cartago" }, { lat: 37.9, lng: 22.9, name: "Corinto" }] },
      { year: "44 a.C.", title: "Galia e Hispania", text: "Cesar conquista la Galia; las legiones ocupan Iberia hasta el Atlantico.", arcs: [[41.9, 12.5, 45.8, 4.8], [41.9, 12.5, 40.4, -3.7], [45.8, 4.8, 50.8, 4.4]], points: [{ lat: 45.8, lng: 4.8, name: "Lugdunum" }, { lat: 40.4, lng: -3.7, name: "Hispania" }] },
      { year: "117 d.C.", title: "Apogeo de Trajano", text: "Dacia, Mesopotamia y Egipto: 5 M de km2, el maximo territorial romano.", arcs: [[41.9, 12.5, 31.2, 29.9], [41.9, 12.5, 44.4, 26.1], [41.9, 12.5, 33.3, 44.4]], points: [{ lat: 31.2, lng: 29.9, name: "Alejandria" }, { lat: 44.4, lng: 26.1, name: "Dacia" }, { lat: 33.3, lng: 44.4, name: "Mesopotamia" }] },
    ],
  },
  {
    id: "mongol", name: "Los Mongoles", color: "#a855f7",
    desc: "El imperio continuo mas grande de tierra firme: 24 M de km2 en 150 anos.",
    steps: [
      { year: "1206", title: "Genghis unifica Mongolia", text: "Temujin es proclamado Genghis Kan: todas las tribus de la estepa bajo un kan.", arcs: [], points: [{ lat: 47.9, lng: 106.9, name: "Karakorum" }] },
      { year: "1215", title: "China del Norte", text: "Los jineteos saquean Zhongdu (Pekin) y parten el imperio Yurchen.", arcs: [[47.9, 106.9, 39.9, 116.4]], points: [{ lat: 39.9, lng: 116.4, name: "Zhongdu" }] },
      { year: "1220", title: "Asia Central cae", text: "Samarcanda y Bujara arden: la ruta de la seda queda mongola.", arcs: [[47.9, 106.9, 39.7, 66.9], [39.7, 66.9, 41.3, 69.2]], points: [{ lat: 39.7, lng: 66.9, name: "Bujara" }, { lat: 41.3, lng: 69.2, name: "Samarcanda" }] },
      { year: "1241", title: "Europa en panico", text: "Legnica y el rio Sajo: polacos y hungaros caen ante Subotai.", arcs: [[47.9, 106.9, 51.1, 16.9], [51.1, 16.9, 47.5, 19.0]], points: [{ lat: 51.1, lng: 16.9, name: "Legnica" }, { lat: 47.5, lng: 19.0, name: "Mohi" }] },
      { year: "1258", title: "Bagdad", text: "Hulagu destruye la casa de la sabiduria: fin de la edad de oro islamica.", arcs: [[47.9, 106.9, 33.3, 44.4]], points: [{ lat: 33.3, lng: 44.4, name: "Bagdad" }] },
      { year: "1279", title: "China completa", text: "Kublai vence a los Song: primera vez que China entera es un imperio extranjero.", arcs: [[47.9, 106.9, 31.2, 121.5]], points: [{ lat: 31.2, lng: 121.5, name: "Lin'an" }] },
    ],
  },
  {
    id: "napoleon", name: "Napoleon", color: "#f59e0b",
    desc: "En 10 anos, un teniente de artilleria corona imperios y reescribe Europa.",
    steps: [
      { year: "1797", title: "Italia", text: "El joven general derrota a Austria en 17 meses: Lodi, Rivoli, Campo Formio.", arcs: [[45.5, 9.2, 45.4, 10.9], [45.4, 10.9, 48.2, 16.4]], points: [{ lat: 45.4, lng: 10.9, name: "Rivoli" }, { lat: 48.2, lng: 16.4, name: "Viena (amenazada)" }] },
      { year: "1805", title: "Austerlitz", text: "La batalla de los Tres Emperadores: Austria y Rusia quebradas en un dia.", arcs: [[48.9, 2.35, 49.1, 16.8]], points: [{ lat: 49.1, lng: 16.8, name: "Austerlitz" }] },
      { year: "1807", title: "El continente doblado", text: "Tras Jena y Friedland, Napoleon dicta Europa en Tilsit con el zar.", arcs: [[48.9, 2.35, 52.5, 13.4], [52.5, 13.4, 55.1, 21.0]], points: [{ lat: 52.5, lng: 13.4, name: "Berlin" }, { lat: 55.1, lng: 21.0, name: "Tilsit" }] },
      { year: "1812", title: "Rusia: el punto de quiebre", text: "600.000 hombres entran; decenas de miles vuelven. El Gran Ejercito muere en el frio.", arcs: [[48.9, 2.35, 55.7, 37.6]], points: [{ lat: 55.7, lng: 37.6, name: "Moscu" }] },
      { year: "1815", title: "Waterloo", text: "Cien dias de regreso y la derrota final ante Wellington y Blucher.", arcs: [[48.9, 2.35, 50.7, 4.4]], points: [{ lat: 50.7, lng: 4.4, name: "Waterloo" }] },
    ],
  },
  {
    id: "ww2", name: "Segunda Guerra Mundial", color: "#ef4444",
    desc: "La guerra mecanizada en tres teatros: el relampago, el frente helado y el Pacifico.",
    steps: [
      { year: "1939", title: "Blitzkrieg", text: "Polonia cae en 5 semanas; en 1940, Francia firma el armisticio en Compiegne.", arcs: [[52.2, 21.0, 50.9, 6.9], [50.9, 6.9, 48.9, 2.35]], points: [{ lat: 52.2, lng: 21.0, name: "Varsovia" }, { lat: 48.9, lng: 2.35, name: "Paris" }] },
      { year: "1941", title: "Barbarroja", text: "3,8 M de hombres invaden la URSS: la mayor invasion de la historia.", arcs: [[52.5, 13.4, 55.7, 37.6], [52.5, 13.4, 50.4, 30.5]], points: [{ lat: 55.7, lng: 37.6, name: "Moscu" }, { lat: 50.4, lng: 30.5, name: "Kiev" }] },
      { year: "1941", title: "Pearl Harbor", text: "Japon golpea la flota norteamericana: EEUU entra en la guerra.", arcs: [[35.7, 139.7, 21.4, -157.8]], points: [{ lat: 21.4, lng: -157.8, name: "Pearl Harbor" }] },
      { year: "1942-43", title: "Stalingrado y El Alamein", text: "La marea gira: el 6o ejercito se rinde; Rommel es frenado en Egipto.", arcs: [[55.7, 37.6, 48.7, 44.5], [31.2, 29.9, 30.8, 28.9]], points: [{ lat: 48.7, lng: 44.5, name: "Stalingrado" }, { lat: 30.8, lng: 28.9, name: "El Alamein" }] },
      { year: "1944", title: "Dia D", text: "156.000 aliados desembarcan en Normandia: el frente occidental renace.", arcs: [[50.9, -1.3, 49.4, -0.7]], points: [{ lat: 49.4, lng: -0.7, name: "Normandia" }] },
      { year: "1945", title: "Berlin y Hiroshima", text: "El Reich cae en mayo; dos bombas atomicas cierran la guerra en agosto.", arcs: [[52.5, 13.4, 34.4, 132.5]], points: [{ lat: 52.5, lng: 13.4, name: "Berlin" }, { lat: 34.4, lng: 132.5, name: "Hiroshima" }] },
    ],
  },
  {
    id: "colonial", name: "Colonizacion", color: "#22d3ee",
    desc: "Tres siglos de veleros y companias que tejerian la primera globalizacion.",
    steps: [
      { year: "1492", title: "El salto del Atlantico", text: "Colon abre America; Tordesillas (1494) reparte el mundo entre España y Portugal.", arcs: [[37.2, -6.0, 19.9, -70.7]], points: [{ lat: 19.9, lng: -70.7, name: "La Española" }] },
      { year: "1521", title: "Caida de los imperios", text: "Cortes y Pizarro derriban a aztecas e incas: plata de Potosi para el mundo.", arcs: [[19.9, -70.7, 19.4, -99.1], [19.9, -70.7, -13.2, -72.4]], points: [{ lat: 19.4, lng: -99.1, name: "Tenochtitlan" }, { lat: -13.2, lng: -72.4, name: "Potosi (1545)" }] },
      { year: "1600", title: "Companias de comercio", text: "EIC y VOC: corporaciones con ejercito y moneda propia gobiernan Asia.", arcs: [[51.5, -0.1, -6.2, 106.8]], points: [{ lat: -6.2, lng: 106.8, name: "Batavia" }] },
      { year: "1652-1880", title: "Africa y el triangulo", text: "Ciudades-costera, esclavitud atlantica y, al final, la Conferencia de Berlin reparte el continente.", arcs: [[51.5, -0.1, 8.5, -13.2], [8.5, -13.2, 18.9, -76.9]], points: [{ lat: 8.5, lng: -13.2, name: "Freetown" }, { lat: 18.9, lng: -76.9, name: "Kingston" }] },
      { year: "1914", title: "El planeta repartido", text: "Europa controla ~84% de la tierra: las semillas de las guerras mundiales.", arcs: [[51.5, -0.1, -25.7, 28.2], [51.5, -0.1, 28.6, 77.2]], points: [{ lat: -25.7, lng: 28.2, name: "Pretoria" }, { lat: 28.6, lng: 77.2, name: "Delhi" }] },
    ],
  },
];

interface GArc { startLat: number; startLng: number; endLat: number; endLng: number; color: [string, string]; }
interface GPoint { lat: number; lng: number; name: string; }

export function Conquistas3DPanel() {
  const [camp, setCamp] = useState(CAMPAIGNS[0]);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const globeRef = useRef<unknown>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // preparar datos acumulados hasta el paso actual
  const arcs: GArc[] = [];
  const points: GPoint[] = [];
  for (let i = 0; i <= step && i < camp.steps.length; i++) {
    const s = camp.steps[i];
    s.arcs.forEach((a) => arcs.push({ startLat: a[0], startLng: a[1], endLat: a[2], endLng: a[3], color: [camp.color, "#ffffff"] }));
    s.points.forEach((p) => points.push(p));
  }

  // init / update del globo
  useEffect(() => {
    let disposed = false;
    const el = containerRef.current;
    if (!el) return;
    {
      if (disposed) return;
      const w = el.clientWidth, h = el.clientHeight;
      el.innerHTML = "";
      const g = new GlobeFactory(el, { animateIn: true })
        .width(w).height(h)
        .backgroundColor("rgba(0,0,0,0)")
        .globeImageUrl("/assets/globe/earth-dark.jpg")
        .bumpImageUrl("/assets/globe/earth-topology.png")
        .atmosphereColor("#f59e0b").atmosphereAltitude(0.16);
      globeRef.current = g;
      const paint = () => {
        g.arcsData(arcs)
          .arcColor("color")
          .arcDashLength(0.35)
          .arcDashGap(0.16)
          .arcDashAnimateTime(1400)
          .arcStroke(0.55)
          .arcAltitudeAutoScale(0.4)
          .pointsData(points)
          .pointLat("lat").pointLng("lng")
          .pointColor(() => camp.color)
          .pointAltitude(0.012)
          .pointRadius(0.32)
          .pointLabel("name");
        const last = camp.steps[Math.min(step, camp.steps.length - 1)];
        if (last.points.length) g.pointOfView({ lat: last.points[0].lat, lng: last.points[0].lng, altitude: 1.7 }, 700);
      };
      paint();
      (globeRef.current as { __paint?: () => void }).__paint = paint;
    }
    return () => { disposed = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camp.id]);

  // repintar al cambiar de paso
  useEffect(() => {
    const g = globeRef.current as { __paint?: () => void } | null;
    g?.__paint?.();
  }, [step, camp.id]);

  // autoplay
  useEffect(() => {
    if (!playing) return;
    const iv = setInterval(() => {
      setStep((s) => (s + 1) % camp.steps.length);
    }, 3800);
    return () => clearInterval(iv);
  }, [playing, camp.id]);

  const current = camp.steps[Math.min(step, camp.steps.length - 1)];

  return (
    <div className="space-y-3">
      <PanelHeader title="CONQUISTAS 3D EXPLICADAS" subtitle="Campañas historicas paso a paso sobre el globo" icon={<Globe2 className="w-4 h-4" />} color="cyan" />

      <div className="flex gap-1.5 flex-wrap">
        {CAMPAIGNS.map((c) => (
          <button key={c.id} onClick={() => { sfx.tab(); setCamp(c); setStep(0); setPlaying(true); }}
            className={cn("px-2.5 py-1.5 rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider border flex items-center gap-1.5",
              camp.id === c.id ? "border-amber-hud bg-amber-hud/20 text-amber" : "border-border/60 text-muted-foreground hover:border-amber-hud/40")}>
            <span className="w-2 h-2 rounded-full" style={{ background: c.color }} /> {c.name}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-2 items-stretch">
        <div ref={containerRef} className="hud-corner border border-amber-hud/40 bg-background min-h-[340px] sm:min-h-[420px] relative overflow-hidden" />
        <div className="flex flex-col gap-2">
          <div className="hud-corner border bg-secondary/20 p-3 flex-1">
            <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-1">{camp.desc}</div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold border rounded-sm" style={{ color: camp.color, borderColor: `${camp.color}66` }}>{current.year}</span>
              <span className="font-mono text-xs font-bold text-foreground">{current.title}</span>
              <span className="text-[9px] font-mono text-muted-foreground">paso {step + 1}/{camp.steps.length}</span>
            </div>
            <p className="text-[11px] font-mono text-foreground/85 leading-relaxed">{current.text}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {current.points.map((p) => (
                <span key={p.name} className="px-1.5 py-0.5 text-[9px] font-mono border rounded-sm" style={{ borderColor: `${camp.color}55`, color: camp.color }}>
                  <Map className="w-2.5 h-2.5 inline mr-0.5" />{p.name}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-1.5">
            <Button size="sm" onClick={() => { sfx.beep(); setStep((s) => Math.max(0, s - 1)); setPlaying(false); }} className="flex-1 h-8 font-mono text-[10px] uppercase bg-secondary/50 border-border/60"><ChevronLeft className="w-3.5 h-3.5" /> ANTERIOR</Button>
            <Button size="sm" onClick={() => { sfx.beep(); setPlaying((p) => !p); }} className="flex-1 h-8 font-mono text-[10px] uppercase bg-amber-hud/30 border-amber-hud text-amber">
              {playing ? <><Pause className="w-3.5 h-3.5 mr-1" /> PAUSA</> : <><Play className="w-3.5 h-3.5 mr-1" /> AUTO</>}
            </Button>
            <Button size="sm" onClick={() => { sfx.beep(); setStep((s) => (s + 1) % camp.steps.length); setPlaying(false); }} className="flex-1 h-8 font-mono text-[10px] uppercase bg-secondary/50 border-border/60">SIGUIENTE <ChevronRight className="w-3.5 h-3.5" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}

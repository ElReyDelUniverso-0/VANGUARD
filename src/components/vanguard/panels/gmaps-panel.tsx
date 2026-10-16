"use client";

// VANGUARD v26 — GOOGLE MAPS DE LOS CONFLICTOS (SIN LAG)
// El usuario pidió: "el mapa 3D tiene lag, agrega el de Google Maps".
// Este panel usa los iframes EMBEBIDOS de Google Maps (output=embed) que no
// requieren API key, cargan ligero y muestran el terreno REAL satelital de
// cada zona de conflicto. El globo 3D (globe.gl) queda para vista panorámica;
// aquí está la vista rápida sin lag.
// v88.0 TERRA 3D: tercer modo con relieve satelital TRIDIMENSIONAL real
// (MapLibre + Esri World Imagery + AWS Terrain DEM) y vuelos cinemáticos.
// v118.0 CRONOATLAS — EL ATLAS QUE INFORMA:
//   · 12 zonas calientes (antes 8): Líbano Sur, Mar Negro, Cáucaso y Congo Este.
//   · FICHA RICA por zona: actores del conflicto, cifras clave e historial
//     (mini-línea de tiempo) junto a los datos del terreno.
//   · INTEL EN VIVO: los cables de la casa (/api/news) se emparejan a cada
//     zona por palabras clave y se leen DENTRO de Vanguard con la SALA DE
//     LECTURA (portal) — cero saltos a otras páginas.
//   · El enlace externo de Google desaparece: las coordenadas se COPIAN y
//     quedan como nota al pie (se informa, no se manda).

import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { Maximize2, MapPin, Satellite, Mountain, Copy, Check, Radio, Users, BarChart3, History } from "lucide-react";
import { WORLD_FLAG_MAP } from "@/lib/world-data";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { Terra3D } from "@/components/vanguard/terra-3d";
import { LectorNoticia, type CableLectura } from "@/components/vanguard/lector-noticia";
import { toast } from "sonner";

interface Zone {
  id: string;
  name: string;
  flag: string; // ISO2
  lat: number;
  lng: number;
  z: number; // zoom
  desc: string;
  facts: string[];
  // v118: la ficha rica
  actores: string[];
  cifras: { k: string; v: string }[];
  historial: { anio: string; txt: string }[];
  // v118: palabras clave para emparejar la INTEL EN VIVO
  keys: string[];
}

const ZONES: Zone[] = [
  {
    id: "ucrania-donbas", name: "Frente del Donbás", flag: "ua",
    lat: 48.0159, lng: 37.8029, z: 8,
    desc: "La línea de contacto más larga de Europa: trincheras, zonas fortificadas y ciudades fortaleza en disputa constante desde 2014.",
    facts: ["Línea de contacto ~1.200 km", "Fortificaciones desde 2014", "Combates activos: Donetsk, Luhansk, Zaporizhzhia"],
    actores: ["Fuerzas de Ucrania", "Federación Rusa", "Brigadas territoriales", "Grupos de drones de ambos bandos"],
    cifras: [
      { k: "Línea de frente", v: "~1.200 km" },
      { k: "Minas instaladas", v: "las más densas del planeta" },
      { k: "Frontera con" , v: "Rusia · Bielorrusia" },
    ],
    historial: [
      { anio: "2014", txt: "Euromaidán, anexión de Crimea y guerra del Donbás." },
      { anio: "2022", txt: "Invasión a gran escala; el frente se estabiliza en el este." },
      { anio: "2023→", txt: "Guerra de posiciones, drones y artillería de precisión." },
    ],
    keys: ["ucrania", "donbas", "ukraine", "kharkiv", "donetsk", "zaporizhzhia", "bakhmut", "rusia", "russia", "kremlin", "dron"],
  },
  {
    id: "gaza", name: "Franja de Gaza", flag: "ps",
    lat: 31.5017, lng: 34.4668, z: 11,
    desc: "41 km de costa densamente poblada, escenario de una de las crisis humanitarias más documentadas de la década.",
    facts: ["~365 km² de superficie", "2.1M de habitantes", "Frontera con Egipto e Israel"],
    actores: ["Hamás", "Israel (FDI)", "Autoridad Palestina", "Mediadores: Egipto y Qatar"],
    cifras: [
      { k: "Densidad", v: "~5.700 hab/km²" },
      { k: "Población", v: "2.1 millones" },
      { k: "Ayuda humanitaria", v: "convoyes diarios, insuficientes" },
    ],
    historial: [
      { anio: "2007", txt: "Bloqueo terrestre, marítimo y aéreo por parte de Israel y Egipto." },
      { anio: "2023", txt: "Ataque del 7 de octubre y campaña militar a gran escala." },
      { anio: "2024→", txt: "Ciclos de tregua mediada por Egipto y Qatar." },
    ],
    keys: ["gaza", "israel", "hamas", "rafah", "palestin", "west bank", "ceasefire", "netanyahu", "tregua"],
  },
  {
    id: "sudan", name: "Jartum, Sudán", flag: "sd",
    lat: 15.5007, lng: 32.5599, z: 11,
    desc: "El mayor desplazamiento forzado del planeta: RSF y el ejército disputan la capital y el valle del Nilo.",
    facts: ["10M+ de desplazados internos", "Hambruna declarada en Darfur", "Conflicto RSF vs SAF desde abr 2023"],
    actores: ["RSF (Fuerzas de Apoyo Rápido)", "Ejército sudanés (SAF)", "Movimientos de Darfur", "CEDEAO y Liga Árabe"],
    cifras: [
      { k: "Desplazados", v: "10M+ internos y vecinos" },
      { k: "Inseguridad alimentaria", v: "IPC fase 3+ en gran parte del país" },
      { k: "Duración", v: "desde abril de 2023" },
    ],
    historial: [
      { anio: "2019", txt: "Caída de Omar al-Bashir tras meses de protestas." },
      { anio: "2023", txt: "RSF y SAF rompen su alianza y estallan los combates urbanos." },
      { anio: "2024→", txt: "Hambruna en Darfur y cerco de El Fasher." },
    ],
    keys: ["sudan", "sudán", "khartoum", "jartum", "rsf", "darfur", "el fasher", "elfasher"],
  },
  {
    id: "mar-rojo", name: "Mar Rojo — Bab el-Mandeb", flag: "ye",
    lat: 13.5895, lng: 42.9113, z: 6,
    desc: "La compuerta del Suez: 12% del comercio mundial pasa por aquí y desde 2023 los ataques a buques han desviado rutas hacia el Cabo.",
    facts: ["~12% del comercio mundial", "Desvíos al Cabo de Buena Esperanza", "Peaje de guerra para el transporte marítimo"],
    actores: ["Hutíes (Ansar Alá)", "Coalición naval internacional", "Compañías navieras", "Egipto y Yibuti (economía)"],
    cifras: [
      { k: "Tráfico", v: "Suez −50% en picos de crisis" },
      { k: "Coste de ruta", v: "+10 días vía Cabo" },
      { k: "Ancho del estrecho", v: "~30 km" },
    ],
    historial: [
      { anio: "2015", txt: "Intervención saudí en Yemen; el estrecho ya era zona de riesgo." },
      { anio: "2023", txt: "Los ataques hutíes a buques forzan desvíos masivos." },
      { anio: "2024→", txt: "Operaciones navales de escolta y ataques alternos a instalaciones." },
    ],
    keys: ["red sea", "mar rojo", "houthi", "huti", "yemen", "bab el-mandeb", "buque", "tanker", "suez", "shipping"],
  },
  {
    id: "taiwan", name: "Estrecho de Taiwán", flag: "tw",
    lat: 24.4011, lng: 119.6013, z: 7,
    desc: "El punto caliente del Indo-Pacífico: incursiones aéreas diarias, ejercicios de bloqueo y la fábrica de chips del mundo en medio.",
    facts: ["180 km en su punto más estrecho", "ADIZ cruzada a diario", "TSMC produce >60% de los chips del mundo"],
    actores: ["República Popular China (APL)", "Taiwán (ROCA)", "EE.UU. (Pacto Taiwan Relations Act)", "Aliados del Indo-Pacífico"],
    cifras: [
      { k: "Incursiones ADIZ", v: "decenas por semana" },
      { k: "Distancia a China", v: "~130-180 km" },
      { k: "Chips avanzados", v: ">60% producidos aquí" },
    ],
    historial: [
      { anio: "1949", txt: "División de facto tras la guerra civil china." },
      { anio: "2022", txt: "Ejercicios de cerco tras la visita de la presidenta de la Cámara de EE.UU." },
      { anio: "2024→", txt: "Patrullas regulares de la APL y drills de bloqueo." },
    ],
    keys: ["taiwan", "china", "beijing", "strait", "adiz", "indopacific", "indo-pacifico", "indopacífico", "pla "],
  },
  {
    id: "sahel", name: "Sahel — Lago Chad", flag: "ne",
    lat: 13.0975, lng: 12.8500, z: 6,
    desc: "La franja más letal del mundo para civiles: JNIM y Boko Haram contra juntas militares, con tres golpes de Estado desde 2020.",
    facts: ["Golpes: Malí (2), Burkina Faso (2), Níger", "Desplazados internos: >3M", "Salida de tropas francesas y MINUSMA"],
    actores: ["JNIM (afiliado a AQMI)", "Boko Haram / ISWAP", "Juntas del Sahel", "Alianza AES"],
    cifras: [
      { k: "Bajas civiles", v: "más de la mitad de las globales" },
      { k: "Desplazados", v: ">3 millones" },
      { k: "Superficie afectada", v: "5 países" },
    ],
    historial: [
      { anio: "2012", txt: "Crisis del norte de Malí y llegada de tropas francesas." },
      { anio: "2020-2023", txt: "Golpes en cadena y giro geopolítico hacia Moscú." },
      { anio: "2024→", txt: "Malí, Burkina y Níger abandonan la CEDEAO; ofensivas yihadistas en alza." },
    ],
    keys: ["sahel", "mali", "malí", "niger", "níger", "burkina", "jnim", "chad", "boko", "haram", "golpe", "coup"],
  },
  {
    id: "myanmar", name: "Myanmar — Rakhine", flag: "mm",
    lat: 20.1500, lng: 92.9000, z: 7,
    desc: "Guerra civil tras el golpe de 2021: la junta pierde pueblos fronterizos frente a la alianza de ejércitos étnicos.",
    facts: ["Golpe de Estado: feb 2021", "1M+ de rohingyá desplazados", "Ejércitos étnicos controlan fronteras"],
    actores: ["Consejo militar (Tatmadaw)", "Gobierno de Unidad Nacional (NUG)", "Arakan Army", "Alianza de los Tres Hermanos"],
    cifras: [
      { k: "Desplazados internos", v: ">3 millones" },
      { k: "Rohingyá en Bangladesh", v: "~1 millón" },
      { k: "Territorio bajo la junta", v: "en retroceso" },
    ],
    historial: [
      { anio: "2017", txt: "Campaña contra los rohingyá: exodo masivo a Bangladesh." },
      { anio: "2021", txt: "Golpe militar; el país entra en guerra civil." },
      { anio: "2023→", txt: "Ofensiva 1027 de los ejércitos étnicos en el norte." },
    ],
    keys: ["myanmar", "rakhine", "rohingya", "rohingyá", "junta", "aung", "shan", "arakan"],
  },
  {
    id: "kashmir", name: "Cachemira — LoC", flag: "in",
    lat: 34.0837, lng: 74.7973, z: 8,
    desc: "Dos potencias nucleares mirándose por una Línea de Control congelada desde 1949, con crisis periódicas que el mundo vigila de cerca.",
    facts: ["LoC de 740 km", "Dos guerras totales (1965, 1999)", "Artillería esporádica y filtraciones cruzadas"],
    actores: ["India", "Pakistán", "Grupos armados cachemires", "ONU (MONUI, misión reducida)"],
    cifras: [
      { k: "LoC", v: "~740 km" },
      { k: "Altura media", v: "3.500-5.500 m" },
      { k: "Arsenal declarado", v: "ambos con armas nucleares" },
    ],
    historial: [
      { anio: "1947-49", txt: "Primera guerra y Línea de Control trazada por la ONU." },
      { anio: "1999", txt: "Guerra de Kargil en altura." },
      { anio: "2019→", txt: "Revocación del artículo 370 y nueva normalidad tensa." },
    ],
    keys: ["kashmir", "cachemira", "jammu", "loc ", "line of control", "kargil"],
  },
  // ====== v118 CRONOATLAS: 4 zonas nuevas ======
  {
    id: "libano-sur", name: "Líbano Sur — Línea Azul", flag: "lb",
    lat: 33.2705, lng: 35.4051, z: 9,
    desc: "La Línea Azul trazada por la ONU en 2000: el frente entre Hezbolá e Israel, con intercambios de fuego que amenazan con generalizar la guerra.",
    facts: ["Línea Azul: 120 km", "90K+ desplazados en picos", "Resolución 1701 de la ONU"],
    actores: ["Hezbolá", "Israel (FDI)", "FINUL (ONU)", "Ejército libanés"],
    cifras: [
      { k: "Línea Azul", v: "~120 km" },
      { k: "Desplazados", v: "90K+ en escaladas" },
      { k: "Vigilancia", v: "FINUL desde 1978" },
    ],
    historial: [
      { anio: "2000", txt: "Retirada israelí del sur y trazado de la Línea Azul." },
      { anio: "2006", txt: "Guerra del Líbano: 34 días y resolución 1701." },
      { anio: "2023→", txt: "Intercambios diarios sincronizados con Gaza." },
    ],
    keys: ["lebanon", "líbano", "libano", "hezbollah", "hezbolá", "blue line", "línea azul", "beirut", "finul", "unifil"],
  },
  {
    id: "mar-negro", name: "Mar Negro — Odesa", flag: "ua",
    lat: 46.4825, lng: 30.7233, z: 8,
    desc: "El corredor de grano que alimenta a África y Oriente Medio: minas, drones navales y un tratado de trigo que vive en coma.",
    facts: ["Corredor humanitario de grano", "Drone naval: arma estrella", "Puerto de Odesa bajo ataque periódico"],
    actores: ["Flota del Mar Negro (Rusia)", "Marina de Ucrania", "Bulgaria, Rumanía y Turquía (OTAN)", "Convoyes mercantes"],
    cifras: [
      { k: "Exportación ucraniana", v: "~60% por mar" },
      { k: "Superficie", v: "436.400 km²" },
      { k: "Litoral OTAN", v: "Bulgaria, Rumanía, Turquía" },
    ],
    historial: [
      { anio: "2022", txt: "Bloqueo ruso e iniciativa de granos mediada por la ONU." },
      { anio: "2023", txt: "Rusia sale del pacto; Ucrania abre su corredor unilateral." },
      { anio: "2024→", txt: "Drones navales obligan a la flota rusa a replegarse a Novorosíisk." },
    ],
    keys: ["black sea", "mar negro", "odesa", "odessa", "sevastopol", "grain", "trigo", "corredor", "novorossiysk"],
  },
  {
    id: "caucaso", name: "Cáucaso — Nagorno-Karabaj", flag: "az",
    lat: 39.8250, lng: 46.7500, z: 8,
    desc: "El enclave que cambió de manos en 2020 y se vació en 2023: Azerbaiyán recuperó el territorio y más de 100.000 armenios partieron.",
    facts: ["Guerras: 1988-94, 2020, 2023", "100K+ armenios evacuados", "Corredor de Lachín en disputa"],
    actores: ["Azerbaiyán", "Armenia", "Rusia (misión de paz, retirada)", "Comunidad armenia de Karabaj"],
    cifras: [
      { k: "Refugiados armenios", v: "100.000+ en 2023" },
      { k: "Guerra de 2020", v: "44 días" },
      { k: "Monitorización", v: "misión de la UE en el lado armenio" },
    ],
    historial: [
      { anio: "1994", txt: "Alto el fuego tras la primera guerra; Karabaj armenio de facto." },
      { anio: "2020", txt: "Azerbaiyán recupera dos tercios en 44 días." },
      { anio: "2023", txt: "Ofensiva relámpago: el enclave se disuelve y se vacía." },
    ],
    keys: ["nagorno", "karabakh", "karabaj", "azerbaijan", "azerbaiyán", "armenia", "yerevan", "baku", "bakú", "caucasus", "cáucaso", "caucaso"],
  },
  {
    id: "congo-este", name: "Congo Este — Goma", flag: "cd",
    lat: -1.6580, lng: 29.2205, z: 9,
    desc: "Más de 100 grupos armados, coltán y cobalto bajo los pies y una crisis humanitaria que el mundo mira a medias: el conflicto más silencioso de la década.",
    facts: ["100+ grupos armados activos", "7M+ de desplazados", "Reservas mundiales de coltán y cobalto"],
    actores: ["M23", "Ejército de RD Congo (FARDC)", "Rwanda (señalado por la ONU, lo niega)", "Grupos Mai-Mai y ADF"],
    cifras: [
      { k: "Desplazados", v: "7M+ (el mayor de África)" },
      { k: "Coltán", v: "~70% de la producción mundial" },
      { k: "Grupos armados", v: "100+ contabilizados" },
    ],
    historial: [
      { anio: "1994", txt: "El genocidio de Rwanda desborda la crisis hacia el Kivu." },
      { anio: "2012", txt: "M23 toma Goma por primera vez." },
      { anio: "2022→", txt: "Resurgimiento del M23 con apoyo externo señalado por la ONU." },
    ],
    keys: ["congo", "goma", "drc", "m23", "rwanda", "ruanda", "kivu", "coltan"],
  },
];

function embedUrl(z: Zone, sat: boolean): string {
  const t = sat ? "k" : "m"; // k = satélite, m = mapa
  return `https://maps.google.com/maps?q=${z.lat},${z.lng}&z=${z.z}&t=${t}&hl=es&output=embed`;
}

// ---- v118: INTEL EN VIVO — cables de la casa emparejados por zona ----
// (los campos son los reales de /api/news: publishedAt ISO, source, tags)
interface CableRuta { url: string; title: string; publishedAt: string; source: string; tacticalTag?: string | null; conflictTag?: string | null; sourceCountry?: string | null }

function parseFecha(s: string): Date | null {
  if (!s) return null;
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(s);
  if (m) return new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`);
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function haceCuanto(s: string): string {
  const d = parseFecha(s);
  if (!d) return "";
  const min = Math.max(0, Math.round((Date.now() - d.getTime()) / 60000));
  if (min < 60) return `HACE ${min} MIN`;
  const h = Math.round(min / 60);
  if (h < 36) return `HACE ${h} H`;
  return `HACE ${Math.round(h / 24)} D`;
}

function emparejar(zona: Zone, cables: CableRuta[]): CableRuta[] {
  const t = zona.name.toLowerCase();
  return cables
    .filter((c) => {
      const titulo = (c.title || "").toLowerCase();
      return zona.keys.some((k) => titulo.includes(k)) || titulo.includes(t);
    })
    .slice(0, 3);
}

export function GMapsPanel() {
  const [active, setActive] = useState<Zone>(ZONES[0]);
  const [full, setFull] = useState(false);
  const [modo, setModo] = useState<"sat" | "mapa" | "terra">("sat");
  // v118: la intel en vivo de la casa
  const [cables, setCables] = useState<CableRuta[]>([]);
  const [cargado, setCargado] = useState(false);
  const [cableSel, setCableSel] = useState<CableLectura | null>(null);
  const [copiadas, setCopiadas] = useState(false);

  useEffect(() => {
    let vivo = true;
    const cargar = async () => {
      try {
        const res = await fetch("/api/news", { cache: "no-store" });
        const j = await res.json();
        if (vivo && Array.isArray(j?.items)) {
          setCables((j.items as Record<string, unknown>[]).map((it) => ({
            url: String(it.url ?? "#"),
            title: String(it.title ?? ""),
            publishedAt: String(it.publishedAt ?? ""),
            source: String(it.source ?? it.domain ?? "frente"),
            tacticalTag: (it.tacticalTag as string | null) ?? null,
            conflictTag: (it.conflictTag as string | null) ?? null,
            sourceCountry: (it.sourceCountry as string | null) ?? (it.sourcecountry as string | null) ?? null,
          })));
        }
      } catch { /* la casa sigue viva sin intel */ }
      if (vivo) setCargado(true);
    };
    cargar();
    const id = setInterval(cargar, 300000); // refresco cada 5 min
    return () => { vivo = false; clearInterval(id); };
  }, []);

  const intelZona = useMemo(() => emparejar(active, cables), [active, cables]);
  const intelPorZona = useMemo(() => {
    const mapa: Record<string, number> = {};
    ZONES.forEach((z) => { mapa[z.id] = emparejar(z, cables).length; });
    return mapa;
  }, [cables]);

  const copiarCoordenadas = useCallback(async (z: Zone) => {
    const txt = `${z.lat.toFixed(5)}, ${z.lng.toFixed(5)}`;
    try {
      await navigator.clipboard.writeText(txt);
      setCopiadas(true);
      toast.success(`COORDENADAS COPIADAS · ${txt}`);
      setTimeout(() => setCopiadas(false), 1600);
    } catch {
      toast.error("EL NAVEGADOR NO PERMITIÓ COPIAR");
    }
  }, []);

  const abrirCable = useCallback((c: CableRuta) => {
    setCableSel({
      id: c.url || c.title,
      title: c.title,
      url: c.url,
      source: c.source || "frente",
      publishedAt: parseFecha(c.publishedAt)?.toISOString() || new Date().toISOString(),
      tacticalTag: c.tacticalTag && c.tacticalTag !== "None" ? c.tacticalTag : null,
      conflictTag: c.conflictTag && c.conflictTag !== "None" ? c.conflictTag : null,
      sourceCountry: c.sourceCountry ?? null,
    });
  }, []);

  return (
    <div className="space-y-4">
      <HeroOro panel="maps" />
      <PanelHeader
        title="GOOGLE MAPS DE CONFLICTOS"
        subtitle="Vista satelital REAL de cada zona caliente — con ficha rica e intel en vivo de la casa"
        icon={<Satellite className="w-5 h-5 text-cyan-hud" />}
        color="cyan"
      />

      <div className="grid lg:grid-cols-[280px_1fr] gap-3">
        {/* selector de zonas */}
        <div className="hud-panel p-2 max-h-[340px] lg:max-h-[560px] overflow-y-auto thin-scroll">
          {ZONES.map((z) => {
            const n = intelPorZona[z.id] ?? 0;
            return (
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
                <span className={cn("flex-1 text-[11px] font-mono uppercase leading-tight", active.id === z.id ? "text-cyan-hud font-bold" : "text-foreground")}>
                  {z.name}
                </span>
                {n > 0 && (
                  <span className="flex shrink-0 items-center gap-1 rounded-full border border-cyan-hud/40 bg-cyan-hud/10 px-1.5 py-0.5 text-[8px] font-mono font-black text-cyan-hud">
                    <span className="inline-block h-1 w-1 animate-pulse rounded-full bg-cyan-hud" />{n}
                  </span>
                )}
              </button>
            );
          })}
          <div className="px-2 pt-2 text-[8.5px] font-mono uppercase tracking-wider text-muted-foreground/60">
            {cargado ? `${cables.length} señales en escucha · refresh 5 min` : "sintonizando la casa..."}
          </div>
        </div>

        {/* mapa + ficha rica + intel */}
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
                  onClick={() => setModo("sat")}
                  className={cn("px-2 py-1 text-[9px] font-mono uppercase rounded-sm border", modo === "sat" ? "border-cyan-hud text-cyan-hud bg-cyan-hud/20" : "border-border text-muted-foreground")}
                >
                  Satélite
                </button>
                <button
                  onClick={() => setModo("mapa")}
                  className={cn("px-2 py-1 text-[9px] font-mono uppercase rounded-sm border", modo === "mapa" ? "border-cyan-hud text-cyan-hud bg-cyan-hud/20" : "border-border text-muted-foreground")}
                >
                  Mapa
                </button>
                <button
                  onClick={() => setModo("terra")}
                  className={cn("px-2 py-1 text-[9px] font-mono uppercase rounded-sm border flex items-center gap-1", modo === "terra" ? "border-amber text-amber bg-amber/15" : "border-border text-muted-foreground hover:text-amber")}
                >
                  <Mountain className="w-3 h-3" /> 3D
                </button>
                <button
                  onClick={() => setFull((v) => !v)}
                  className="px-2 py-1 text-[9px] font-mono uppercase rounded-sm border border-border text-muted-foreground hover:text-foreground flex items-center gap-1"
                  aria-label="Pantalla completa"
                >
                  <Maximize2 className="w-3 h-3" /> {full ? "Salir" : "Ampliar"}
                </button>
                <button
                  onClick={() => copiarCoordenadas(active)}
                  title="Copiar coordenadas"
                  className="px-2 py-1 text-[9px] font-mono uppercase rounded-sm border border-border text-muted-foreground hover:text-cyan-hud flex items-center gap-1"
                >
                  {copiadas ? <Check className="w-3 h-3 text-cyan-hud" /> : <Copy className="w-3 h-3" />} COORD
                </button>
              </div>
            </div>
            {modo === "terra" ? (
              <Terra3D className="border-0" />
            ) : (
              <iframe
                key={`${active.id}-${modo}`}
                title={`Mapa de ${active.name}`}
                src={embedUrl(active, modo === "sat")}
                className={cn("w-full", full ? "h-[calc(100vh-140px)]" : "h-[300px] sm:h-[420px]")}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
            {/* nota al pie: la vista completa vive fuera — se informa, no se manda */}
            <div className="px-3 py-1.5 border-t border-amber-hud/10 bg-black/30 text-[8.5px] font-mono uppercase tracking-wider text-muted-foreground/60">
              vista satelital embebida · la vista completa vive fuera de vanguard: {active.lat.toFixed(5)}, {active.lng.toFixed(5)}
            </div>
          </div>

          {/* ficha rica v118 */}
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

            {/* actores */}
            <div className="mt-3">
              <div className="flex items-center gap-1.5 text-[9px] font-mono font-black uppercase tracking-widest text-amber/80">
                <Users className="h-3 w-3" /> actores del conflicto
              </div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {active.actores.map((a) => (
                  <span key={a} className="px-1.5 py-0.5 bg-secondary/70 border border-border text-foreground/80 text-[9.5px] font-semibold rounded-sm">
                    {a}
                  </span>
                ))}
              </div>
            </div>

            {/* cifras */}
            <div className="mt-3">
              <div className="flex items-center gap-1.5 text-[9px] font-mono font-black uppercase tracking-widest text-amber/80">
                <BarChart3 className="h-3 w-3" /> cifras clave
              </div>
              <div className="mt-1 grid gap-1.5 sm:grid-cols-3">
                {active.cifras.map((c) => (
                  <div key={c.k} className="rounded-sm border border-border bg-secondary/40 px-2 py-1.5">
                    <div className="text-[8.5px] font-mono uppercase tracking-wider text-muted-foreground">{c.k}</div>
                    <div className="text-[11px] font-mono font-bold text-foreground">{c.v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* historial */}
            <div className="mt-3">
              <div className="flex items-center gap-1.5 text-[9px] font-mono font-black uppercase tracking-widest text-amber/80">
                <History className="h-3 w-3" /> historial del frente
              </div>
              <div className="mt-1.5 space-y-1">
                {active.historial.map((h) => (
                  <div key={h.anio} className="flex gap-2 items-baseline">
                    <span className="shrink-0 rounded-sm bg-amber/15 border border-amber/40 px-1.5 py-0.5 text-[9px] font-mono font-black text-amber">{h.anio}</span>
                    <span className="text-[10.5px] leading-snug text-muted-foreground">{h.txt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* v118: INTEL EN VIVO de la casa — se lee DENTRO de Vanguard */}
            <div className="mt-3 rounded-sm border border-cyan-hud/30 bg-cyan-hud/[0.04] p-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[9px] font-mono font-black uppercase tracking-widest text-cyan-hud">
                  <Radio className="h-3 w-3" /> intel en vivo · cables de la casa
                </div>
                <span className="flex items-center gap-1 text-[8.5px] font-mono uppercase text-muted-foreground">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-hud" /> en escucha
                </span>
              </div>
              {intelZona.length === 0 ? (
                <p className="mt-1.5 text-[10px] font-mono text-muted-foreground/70">
                  {cargado ? "sin señales de esta zona ahora mismo — el mundo sigue hablando" : "sintonizando la casa..."}
                </p>
              ) : (
                <div className="mt-1.5 space-y-1">
                  {intelZona.map((c) => (
                    <button
                      key={c.url || c.title}
                      onClick={() => abrirCable(c)}
                      className="block w-full rounded-sm border border-border/60 bg-secondary/40 px-2 py-1.5 text-left transition hover:border-cyan-hud/50 hover:bg-cyan-hud/10 active:scale-[0.99]"
                    >
                      <span className="line-clamp-2 text-[10.5px] leading-snug text-foreground/90">{c.title}</span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-[8.5px] font-mono uppercase tracking-wider text-muted-foreground">
                        <span className="text-cyan-hud/70">{haceCuanto(c.publishedAt)}</span>· {c.source}
                      </span>
                    </button>
                  ))}
                  <div className="pt-0.5 text-right text-[8px] font-mono uppercase tracking-wider text-muted-foreground/50">
                    se abre en la sala de lectura · se informa, no se manda
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* la sala de lectura interna (portal al body — flota sobre todo) */}
      <LectorNoticia cable={cableSel} onCerrar={() => setCableSel(null)} />
    </div>
  );
}

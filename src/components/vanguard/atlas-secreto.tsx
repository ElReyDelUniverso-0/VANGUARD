"use client";

// v82.0 TODO EL MUNDO — ATLAS SECRETO DEL MUNDO (en El Ojo de Dios).
// El comandante pidió: "que Vanguard tenga TODA la información del mundo —
// ubicaciones, lugares secretos, cámaras". Tres piezas:
//  1) LUGARES SECRETOs — 24 instalaciones reales clasificadas/legendarias con
//     ficha RECON jugable: pagar 30ⓒ, barrido de reconocimiento animado y
//     informe determinista por sitio+día (actividad, personal, alerta, hallazgo).
//     Primera vez paga +120ⓒ +40XP; repetición +15ⓒ con enfriamiento 24h.
//  2) REGISTRO MUNDIAL — relojes en vivo + coordenadas de las ubicaciones
//     estratégicas del planeta (capitales, bases, frentes, bóvedas).
//  3) Persistencia: localStorage vanguard-atlas-v82 (reconIds + enfriamientos).

import { useEffect, useMemo, useState } from "react";
import {
  MapPin, ScanLine, Lock, TriangleAlert, Star, Clock3, Coins, Eye, Loader2, Compass,
} from "lucide-react";
import { FlagBadge } from "@/components/vanguard/flag-badge";
import { useGameStore } from "@/lib/game-store";
import { sfx } from "@/lib/sound";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ————— datos: lugares secretos reales —————
type TipoLugar = "AÉREA" | "NUCLEAR" | "ESPACIAL" | "SIGINT" | "SUBTERRÁNEA" | "NAVAL" | "MISILES" | "BÓVEDA" | "LEYENDA";
interface LugarSecreto {
  id: string; nombre: string; pais: string; iso: string;
  lat: number; lng: number; tipo: TipoLugar; secreto: 1 | 2 | 3 | 4 | 5;
  estado: "ACTIVO" | "PRESUNTIVO" | "LEYENDA";
  nota: string;
}

const LUGARES_SECRETOS: LugarSecreto[] = [
  { id: "groom-lake", nombre: "Área 51 · Groom Lake", pais: "Estados Unidos", iso: "US", lat: 37.2431, lng: -115.793, tipo: "AÉREA", secreto: 5, estado: "ACTIVO", nota: "El hangar más famoso del planeta. Pista de 5,5 km y aviones que no existen." },
  { id: "cheyenne", nombre: "Cheyenne Mountain", pais: "Estados Unidos", iso: "US", lat: 38.7436, lng: -104.8473, tipo: "SUBTERRÁNEA", secreto: 5, estado: "ACTIVO", nota: "NORAD bajo 600 m de granito, sobre resortes para aguantar un pulso EM." },
  { id: "raven-rock", nombre: "Raven Rock · Site R", pais: "Estados Unidos", iso: "US", lat: 39.7223, lng: -77.4689, tipo: "SUBTERRÁNEA", secreto: 5, estado: "ACTIVO", nota: "El Pentágono alternativo. Aquí se gobierna la Tercera Guerra Mundial." },
  { id: "pine-gap", nombre: "Pine Gap", pais: "Australia", iso: "AU", lat: -23.799, lng: 133.737, tipo: "SIGINT", secreto: 5, estado: "ACTIVO", nota: "Orejas gigantes en el desierto: intercepta media hemisferio sur." },
  { id: "menwith-hill", nombre: "RAF Menwith Hill", pais: "Reino Unido", iso: "GB", lat: 54.0118, lng: -1.689, tipo: "SIGINT", secreto: 5, estado: "ACTIVO", nota: "Las bolas blancas que escuchan Europa entera." },
  { id: "diego-garcia", nombre: "Diego García", pais: "Territorio Británico del Índico", iso: "IO", lat: -7.3195, lng: 72.4229, tipo: "NAVAL", secreto: 4, estado: "ACTIVO", nota: "Base enmedio del Índico: bombarderos, submarinos y misterios de vuelos." },
  { id: "kapustin-yar", nombre: "Kapustin Yar", pais: "Rusia", iso: "RU", lat: 48.4, lng: 45.8, tipo: "MISILES", secreto: 5, estado: "ACTIVO", nota: "Polígono soviético de cohetes donde nació el programa espacial secreto." },
  { id: "yamantau", nombre: "Monte Yamantau · Mezhgorye", pais: "Rusia", iso: "RU", lat: 54.2667, lng: 58.1, tipo: "SUBTERRÁNEA", secreto: 5, estado: "PRESUNTIVO", nota: "Ciudad cerrada dos: nadie sabe qué se excava dentro desde 1980." },
  { id: "seversk", nombre: "Seversk (Tomsk-7)", pais: "Rusia", iso: "RU", lat: 56.6, lng: 84.8833, tipo: "NUCLEAR", secreto: 4, estado: "ACTIVO", nota: "Ciudad cerrada con reactores: no aparece en los mapas de carretera." },
  { id: "star-city", nombre: "Star City · Zvyozdny", pais: "Rusia", iso: "RU", lat: 55.88, lng: 38.12, tipo: "ESPACIAL", secreto: 3, estado: "ACTIVO", nota: "Donde se entrena cosmonauta: centro Gagarin de entrenamiento." },
  { id: "svalbard", nombre: "Bóveda Global de Semillas", pais: "Noruega", iso: "NO", lat: 78.2382, lng: 15.4357, tipo: "BÓVEDA", secreto: 3, estado: "ACTIVO", nota: "El respaldo de la humanidad: 1M de semillas dentro del ártico." },
  { id: "pituffik", nombre: "Pituffik (Thule)", pais: "Groenlandia", iso: "GL", lat: 76.5313, lng: -68.7031, tipo: "AÉREA", secreto: 4, estado: "ACTIVO", nota: "La base más al norte: radar de alerta temprana contra misiles polares." },
  { id: "dimona", nombre: "Centro Dimona", pais: "Israel", iso: "IL", lat: 31.0, lng: 35.15, tipo: "NUCLEAR", secreto: 5, estado: "ACTIVO", nota: "El secreto peor guardado de Oriente Medio en el corazón del Negev." },
  { id: "yongbyon", nombre: "Complejo de Yongbyon", pais: "Corea del Norte", iso: "KP", lat: 39.7983, lng: 125.7542, tipo: "NUCLEAR", secreto: 5, estado: "ACTIVO", nota: "El reactor que alimenta el arsenal. Los satélites lo miran a diario." },
  { id: "punggye-ri", nombre: "Punggye-ri", pais: "Corea del Norte", iso: "KP", lat: 41.2778, lng: 129.0942, tipo: "SUBTERRÁNEA", secreto: 5, estado: "PRESUNTIVO", nota: "Campo de pruebas nuclear bajo la montaña Mantap. Túneles tapiados." },
  { id: "fordow", nombre: "Instalación de Fordow", pais: "Irán", iso: "IR", lat: 34.8846, lng: 50.9959, tipo: "NUCLEAR", secreto: 5, estado: "ACTIVO", nota: "Centrifugadoras excavadas 90 m dentro de una montaña santa." },
  { id: "natanz", nombre: "Complejo de Natanz", pais: "Irán", iso: "IR", lat: 33.7227, lng: 51.7275, tipo: "NUCLEAR", secreto: 5, estado: "ACTIVO", nota: "Escenario del ciberguerra: Stuxnet nació aquí." },
  { id: "baikonur", nombre: "Cosmódromo de Baikonur", pais: "Kazajistán", iso: "KZ", lat: 45.965, lng: 63.305, tipo: "ESPACIAL", secreto: 3, estado: "ACTIVO", nota: "Donde empezó todo: la plataforma del Sputnik y del Vostok." },
  { id: "jiuquan", nombre: "Centro de Jiuquan", pais: "China", iso: "CN", lat: 40.9606, lng: 100.291, tipo: "ESPACIAL", secreto: 4, estado: "ACTIVO", nota: "Puerta al cielo del ejército chino: lanzamientos tripulados." },
  { id: "lop-nur", nombre: "Lop Nur", pais: "China", iso: "CN", lat: 41.6, lng: 88.7, tipo: "NUCLEAR", secreto: 5, estado: "PRESUNTIVO", nota: "Lago seco donde China probó sus bombas. Aún mide radiación." },
  { id: "kwajalein", nombre: "Atolón Kwajalein", pais: "Islas Marshall", iso: "MH", lat: 9.048, lng: 167.74, tipo: "MISILES", secreto: 4, estado: "ACTIVO", nota: "El radar más potente del Pacífico: interceptores y dianas balísticas." },
  { id: "tonopah", nombre: "Tonopah Test Range · Area 6", pais: "Estados Unidos", iso: "US", lat: 37.7986, lng: -116.7795, tipo: "AÉREA", secreto: 4, estado: "ACTIVO", nota: "El hermano menor del Área 51: F-117 secretos despegaron de aquí." },
  { id: "al-dhafra", nombre: "Base Al Dhafra", pais: "Emiratos Árabes Unidos", iso: "AE", lat: 24.2484, lng: 54.5479, tipo: "AÉREA", secreto: 3, estado: "ACTIVO", nota: "F-35 y drones de vigilancia mirando el Golfo las 24 horas." },
  { id: "dulce", nombre: "Base de Dulce", pais: "Estados Unidos", iso: "US", lat: 36.9386, lng: -107.4386, tipo: "LEYENDA", secreto: 5, estado: "LEYENDA", nota: "La leyenda subterránea de Nuevo México: siete niveles, dicen." },
];

const TIPO_HEX: Record<TipoLugar, string> = {
  AÉREA: "#38BDF8", NUCLEAR: "#A3E635", ESPACIAL: "#8B5CF6", SIGINT: "#00E5FF",
  SUBTERRÁNEA: "#FF8A3B", NAVAL: "#2DD4BF", MISILES: "#FF5A3C", BÓVEDA: "#FFC94D", LEYENDA: "#FF5AC8",
};

// ————— informe RECON determinista por sitio + día —————
function seedOf(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rngDe(seed: number) {
  let v = seed || 1;
  return () => { v ^= v << 13; v ^= v >>> 17; v ^= v << 5; return ((v >>> 0) % 10000) / 10000; };
}
const HALLAZGOS: Record<string, string[]> = {
  AÉREA: ["Un stealth despegó sin transpondedor.", "Pista marcada con nuevos cruces de taxi.", "Escuadrón rehecho con cazas de otra base."],
  NUCLEAR: ["Vapor anómalo en la torre de refrigeración.", "Convoy blindado entró al recinto de mingitorios… digo, de centrifugadoras.", "Nivel de tritio sube según filtraciones internas."],
  ESPACIAL: ["Plataforma despejada: lanzamiento en ventana corta.", "Cápsula tripulada en pruebas de integración.", "Telescopio del perímetro apunta a otro satélite."],
  SIGINT: ["Antenas rotando al ritmo de un ejercicio de radio.", "Tráfico cifrado multiplicado ×3 esta noche.", "Bola radómica nueva en construcción."],
  SUBTERRÁNEA: ["Gruta de ventilación activa a 40°.", "Camiones de hormigón entrando en fila india.", "Sismo local microscópico: profundización de túnel."],
  NAVAL: ["Muelle este ocupado por un submarino nuclear.", "Buque de apoyo cargó misiles de contenedor.", "Helicópteros de entrega nocturna en patrón."],
  MISILES: ["Silos abiertos en secuencia durante 4 minutos.", "Camión TEL recargado bajo luna llena.", "Radar de seguimiento apuntando al mar."],
  BÓVEDA: ["Puerta sellada a nueva presión.", "Entrega especial escoltada por la policía ártica.", "Cámara térmica detecta actividad en el anexo."],
  LEYENDA: ["Luces no identificadas sobre la cresta, 03:12.", "Cowboy local jura que cerraron la carretera una noche.", "El radar no ve nada… y a la vez ve demasiado."],
};
interface InformeRecon { actividad: number; personal: number; vehiculos: number; alerta: string; hallazgo: string; }
function informeDe(lugar: LugarSecreto, dia: number): InformeRecon {
  const rng = rngDe(seedOf(`${lugar.id}:${dia}`));
  const alertas = ["BAJO", "MEDIO", "ALTO", "MÁXIMO"];
  return {
    actividad: 18 + Math.floor(rng() * 80),
    personal: 120 + Math.floor(rng() * 3200),
    vehiculos: 8 + Math.floor(rng() * 60),
    alerta: alertas[Math.floor(rng() * alertas.length)],
    hallazgo: HALLAZGOS[lugar.tipo][Math.floor(rng() * HALLAZGOS[lugar.tipo].length)],
  };
}

// ————— persistencia —————
const ATLAS_KEY = "vanguard-atlas-v82";
interface AtlasEstado { reconIds: string[]; lastRecon: Record<string, number>; }
function cargarAtlas(): AtlasEstado {
  try { return JSON.parse(localStorage.getItem(ATLAS_KEY) || "") as AtlasEstado; } catch { return { reconIds: [], lastRecon: {} }; }
}
const RANGOS = [
  { min: 0, nombre: "VIGÍA" }, { min: 4, nombre: "RASTREADOR" }, { min: 9, nombre: "CARTÓGRAFO" },
  { min: 15, nombre: "OJOS DE LA NOCHE" }, { min: 20, nombre: "MAESTRO DEL ATLAS" },
];

// ————— componente principal —————
export function AtlasSecreto() {
  const coins = useGameStore((s) => s.coins);
  const addCoins = useGameStore((s) => s.addCoins);
  const spendCoins = useGameStore((s) => s.spendCoins);
  const addXp = useGameStore((s) => s.addXp);
  const [estado, setEstado] = useState<AtlasEstado>({ reconIds: [], lastRecon: {} });
  const [sel, setSel] = useState<LugarSecreto | null>(null);
  const [escaneando, setEscaneando] = useState(false);
  const [informe, setInforme] = useState<InformeRecon | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<TipoLugar | "TODOS">("TODOS");

  useEffect(() => { setEstado(cargarAtlas()); }, []);

  const dia = Math.floor(Date.now() / 86_400_000);
  const reconocidos = estado.reconIds.length;
  const rango = [...RANGOS].reverse().find((r) => reconocidos >= r.min) ?? RANGOS[0];
  const filtrados = useMemo(
    () => (filtroTipo === "TODOS" ? LUGARES_SECRETOS : LUGARES_SECRETOS.filter((l) => l.tipo === filtroTipo)),
    [filtroTipo]
  );

  const hacerRecon = (lugar: LugarSecreto) => {
    if (escaneando) return;
    const esPrimera = !estado.reconIds.includes(lugar.id);
    const enfriamiento = 86_400_000 - (Date.now() - (estado.lastRecon[lugar.id] ?? 0));
    if (!esPrimera && enfriamiento > 0) {
      toast(`El sitio sigue caliente — vuelve en ${Math.ceil(enfriamiento / 3600_000)} h para un informe nuevo`);
      return;
    }
    if (!spendCoins(30, `Reconocimiento de ${lugar.nombre}`)) {
      toast.error("Necesitas 30ⓒ para lanzar el reconocimiento");
      sfx.error();
      return;
    }
    setSel(lugar); setInforme(null); setEscaneando(true); sfx.coin();
    window.setTimeout(() => {
      const inf = informeDe(lugar, dia);
      setInforme(inf); setEscaneando(false); sfx.reward();
      const nuevoEstado: AtlasEstado = {
        reconIds: esPrimera ? [...estado.reconIds, lugar.id] : estado.reconIds,
        lastRecon: { ...estado.lastRecon, [lugar.id]: Date.now() },
      };
      setEstado(nuevoEstado);
      try { localStorage.setItem(ATLAS_KEY, JSON.stringify(nuevoEstado)); } catch { /* noop */ }
      if (esPrimera) {
        addCoins(120, `ATLAS SECRETO: ${lugar.nombre} reconocido por primera vez`);
        addXp(40);
        toast.success(`SITIO EN EL MAPA: ${lugar.nombre} · +120ⓒ +40XP`, { description: inf.hallazgo });
      } else {
        addCoins(15, `Informe de vigilancia: ${lugar.nombre}`);
        toast(`Informe de vigilancia listo · +15ⓒ`, { description: inf.hallazgo });
      }
    }, 2200);
  };

  return (
    <section className="space-y-3" aria-label="Atlas secreto del mundo">
      <div className="flex items-center gap-2 flex-wrap">
        <MapPin className="w-4 h-4 text-amber" aria-hidden />
        <h3 className="font-display font-bold uppercase tracking-wide text-sm text-foreground">Atlas secreto del mundo</h3>
        <span className="font-mono text-[9px] uppercase tracking-widest text-amber border border-amber-hud/40 bg-amber-hud/10 px-1.5 py-0.5">
          {reconocidos}/{LUGARES_SECRETOS.length} reconocidos · {rango.nombre}
        </span>
        <div className="ml-auto flex items-center gap-1 flex-wrap">
          {(["TODOS", "NUCLEAR", "AÉREA", "SIGINT", "SUBTERRÁNEA", "ESPACIAL", "LEYENDA"] as const).map((tp) => (
            <button key={tp} onClick={() => setFiltroTipo(tp)}
              className={cn("px-1.5 py-0.5 text-[8px] font-mono uppercase tracking-widest border transition-colors",
                filtroTipo === tp ? "border-amber-hud text-amber bg-amber-hud/20" : "border-border text-muted-foreground hover:text-foreground")}>
              {tp}
            </button>
          ))}
        </div>
      </div>

      {/* rejilla de lugares secretos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
        {filtrados.map((l) => {
          const reconocido = estado.reconIds.includes(l.id);
          const activo = sel?.id === l.id;
          return (
            <article key={l.id}
              className={cn("hud-panel p-2.5 relative overflow-hidden transition-all", activo && "border-amber-hud", reconocido && "bg-amber-hud/5")}>
              <div className="flex items-center gap-1.5 flex-wrap">
                <FlagBadge code={l.iso} />
                <button onClick={() => { setSel(activo ? null : l); setInforme(null); }}
                  className="font-display font-bold text-[12px] text-foreground hover:text-amber transition-colors text-left leading-tight">
                  {l.nombre}
                </button>
                <span className="ml-auto flex items-center gap-0.5" title={`Nivel de secreto ${l.secreto}/5`}>
                  {Array.from({ length: l.secreto }).map((_, i) => (
                    <Star key={i} className="w-2.5 h-2.5 text-amber fill-amber" aria-hidden />
                  ))}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="font-mono text-[8px] px-1 py-0.5 border uppercase tracking-widest"
                  style={{ color: TIPO_HEX[l.tipo], borderColor: `${TIPO_HEX[l.tipo]}55`, background: `${TIPO_HEX[l.tipo]}14` }}>
                  {l.tipo}
                </span>
                <span className={cn("font-mono text-[8px] px-1 py-0.5 border uppercase tracking-widest",
                  l.estado === "ACTIVO" ? "text-crisis border-crisis-hud bg-crisis-hud/15" : l.estado === "LEYENDA" ? "text-violet-hud border-violet-hud/60" : "text-amber border-amber-hud/50")}>
                  {l.estado}
                </span>
                <span className="font-mono text-[9px] text-muted-foreground tabular-nums">
                  {l.lat.toFixed(2)}°, {l.lng.toFixed(2)}°
                </span>
              </div>

              {activo && (
                <div className="mt-2 pt-2 border-t border-amber-hud/20 space-y-2 animate-in fade-in duration-300">
                  <p className="text-[11px] text-foreground/85 leading-snug">{l.nota}</p>

                  {/* visor RECON: retícula + barrido mientras escanea */}
                  <div className={cn("relative rounded-sm border border-amber-hud/40 bg-black/50 h-28 overflow-hidden flex items-center justify-center",
                    escaneando && "recon-scan")}>
                    <div className="reticula-objetivo absolute inset-2 pointer-events-none" aria-hidden />
                    <div className="corona-blanco absolute w-12 h-12 rounded-full border border-amber-hud/60 pointer-events-none" aria-hidden />
                    {escaneando ? (
                      <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-amber animate-pulse">reconociendo…</span>
                    ) : informe ? (
                      <div className="px-3 py-1 space-y-0.5 text-left">
                        <p className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground">informe de reconocimiento · hoy</p>
                        <p className="text-[11px] text-amber font-semibold">{informe.hallazgo}</p>
                        <p className="font-mono text-[9px] text-foreground/85">
                          actividad {informe.actividad}% · {informe.personal.toLocaleString("es")} personas · {informe.vehiculos} vehículos · alerta <b className="text-crisis">{informe.alerta}</b>
                        </p>
                      </div>
                    ) : (
                      <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">señal en espera</span>
                    )}
                    <div className="absolute top-1 right-1.5 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5 text-amber" aria-hidden />
                      <span className="font-mono text-[7px] text-amber tracking-widest">OJO·SAT-7</span>
                    </div>
                  </div>

                  <button onClick={() => hacerRecon(l)} disabled={escaneando}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] bg-amber-hud/30 border border-amber-hud text-amber rounded-sm text-[10px] font-mono uppercase font-bold tracking-widest hover:bg-amber-hud/70 disabled:opacity-50 transition-all active:scale-[0.98]">
                    {escaneando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ScanLine className="w-3.5 h-3.5" />}
                    {reconocido ? "Nuevo informe · 30ⓒ (+15)" : "Reconocer · 30ⓒ (+120 +40XP)"}
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <RegistroMundial />
    </section>
  );
}

// ————— REGISTRO MUNDIAL: relojes en vivo de las ubicaciones estratégicas —————
const REGISTRO: { nombre: string; iso: string; tz: string; lat: number; lng: number; rol: string }[] = [
  { nombre: "Washington D.C.", iso: "US", tz: "America/New_York", lat: 38.9, lng: -77.04, rol: "CAPITAL" },
  { nombre: "Londres", iso: "GB", tz: "Europe/London", lat: 51.5, lng: -0.13, rol: "SIGINT" },
  { nombre: "Moscú", iso: "RU", tz: "Europe/Moscow", lat: 55.76, lng: 37.62, rol: "CAPITAL" },
  { nombre: "Pekín", iso: "CN", tz: "Asia/Shanghai", lat: 39.9, lng: 116.4, rol: "CAPITAL" },
  { nombre: "Teherán", iso: "IR", tz: "Asia/Tehran", lat: 35.7, lng: 51.42, rol: "NUCLEAR" },
  { nombre: "Tel Aviv", iso: "IL", tz: "Asia/Jerusalem", lat: 32.08, lng: 34.78, rol: "DEFENSA" },
  { nombre: "Kiev", iso: "UA", tz: "Europe/Kyiv", lat: 50.45, lng: 30.52, rol: "FRENTE" },
  { nombre: "Taipéi", iso: "TW", tz: "Asia/Taipei", lat: 25.03, lng: 121.56, rol: "TENSIÓN" },
  { nombre: "Pionyang", iso: "KP", tz: "Asia/Pyongyang", lat: 39.03, lng: 125.75, rol: "NUCLEAR" },
  { nombre: "Diego García", iso: "IO", tz: "Indian/Chagos", lat: -7.32, lng: 72.42, rol: "BASE" },
  { nombre: "Guam", iso: "GU", tz: "Pacific/Guam", lat: 13.44, lng: 144.79, rol: "BASE" },
  { nombre: "Dubái", iso: "AE", tz: "Asia/Dubai", lat: 25.2, lng: 55.27, rol: "FLOTA" },
];

function RelojVivo({ tz }: { tz: string }) {
  const [ahora, setAhora] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setAhora(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);
  return (
    <span className="font-mono text-[10px] text-green-hud tabular-nums">
      {new Intl.DateTimeFormat("es", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(ahora)}
    </span>
  );
}

function RegistroMundial() {
  return (
    <div className="hud-panel p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Compass className="w-3.5 h-3.5 text-cyan-hud" aria-hidden />
        <h4 className="font-mono text-[10px] uppercase tracking-widest text-cyan-hud">Registro mundial de ubicaciones · hora local en vivo</h4>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-1.5">
        {REGISTRO.map((r) => (
          <div key={r.nombre} className="rounded-sm border border-white/5 bg-black/30 p-2 hover:border-cyan-hud/40 transition-colors">
            <div className="flex items-center gap-1">
              <FlagBadge code={r.iso} />
              <span className="text-[11px] font-semibold text-foreground truncate">{r.nombre}</span>
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <RelojVivo tz={r.tz} />
              <span className="font-mono text-[7px] px-1 border border-cyan-hud/40 text-cyan-hud uppercase tracking-widest">{r.rol}</span>
            </div>
            <p className="font-mono text-[8px] text-muted-foreground tabular-nums mt-0.5">{r.lat.toFixed(1)}° · {r.lng.toFixed(1)}°</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1">
        <TriangleAlert className="w-3 h-3 text-amber" /> El Ojo vigila {LUGARES_SECRETOS.length} instalaciones clasificadas y {REGISTRO.length} ubicaciones estratégicas — la información del mundo, en un solo lugar.
      </p>
    </div>
  );
}

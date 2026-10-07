"use client";

// v82.0 TODO EL MUNDO — TELETIPO EN VIVO
// La agencia de inteligencia de Vanguard NO duerme: cables reales de última hora
// (/api/news) se mezclan con interceptos SIGINT, pases de satélite, reportes de
// agentes en el terreno, alertas de cámaras y ticks de mercado emitidos EN VIVO,
// cada pocos segundos, con reloj real. Dos modos:
//   · modo="cinta"  → marquee horizontal (CSS transform, 60fps, pausa al hover)
//   · modo="feed"   → columna de mensajes apilados que llegan uno a uno
// Perf: transform/opacity únicamente · lista corta (≤14) · fetch de noticias compartido.

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Radio, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

// ————— tipos —————
export interface CableVivo {
  id: string;
  ts: number;
  fuente: string; // SIGINT · SATÉLITE · AGENTE · CÁMARA · MERCADO · EMBAJADA · AGENCIAS…
  texto: string;
  prioridad: "CRITICO" | "URGENTE" | "INFO";
}

// ————— caché compartida de noticias (varias instancias, 1 fetch / 90s) —————
let __noticiasCache: { ts: number; titulares: string[] } | null = null;
let __noticiasPromesa: Promise<string[]> | null = null;
function cargarTitulares(): Promise<string[]> {
  if (__noticiasCache && Date.now() - __noticiasCache.ts < 90_000) return Promise.resolve(__noticiasCache.titulares);
  if (!__noticiasPromesa) {
    __noticiasPromesa = fetch("/api/news", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("http"))))
      .then((d: { items?: { title: string; publishedAt: string }[] }) => {
        const items = Array.isArray(d.items) ? d.items : [];
        const tit = items
          .map((i) => ({ t: (i.title || "").trim(), f: new Date(i.publishedAt).getTime() }))
          .filter((i) => i.t.length > 18 && Number.isFinite(i.f))
          .sort((a, b) => b.f - a.f)
          .slice(0, 18)
          .map((i) => i.t.replace(/\s+/g, " ").slice(0, 150));
        __noticiasCache = { ts: Date.now(), titulares: tit };
        return tit;
      })
      .catch(() => {
        __noticiasCache = { ts: Date.now(), titulares: [] };
        return [] as string[];
      })
      .finally(() => { __noticiasPromesa = null; });
  }
  return __noticiasPromesa;
}

// ————— generador de interceptos (mensajes en vivo constantes) —————
// v84.0: 30 LUGARES y 13 FUENTES — el mundo entero emite señal
const LUGARES = [
  "el Báltico", "el Mar Rojo", "el estrecho de Taiwán", "el Sahel", "el Donbás",
  "el Golfo Pérsico", "el Cáucaso", "el mar de China Meridional", "el Ártico",
  "la frontera sur", "el estrecho de Ormuz", "el mar Negro", "Kashmir", "el Sinaí",
  "el canal de Suez", "el estrecho de Malaca", "la península de Corea", "el Sahel occidental",
  "el Bósforo", "el golfo de Adén", "el mar de Barents", "el canal de Panamá",
  "la península de Crimea", "el estrecho de Gibraltar", "el mar de Java", "el lago Chad",
  "el estrecho de Bering", "el valle del Nilo", "el mar de Andamán", "la meseta del Decán",
];
const NUMS = [3, 4, 5, 6, 7, 8, 9, 12, 14, 17, 21, 24, 32, 48];

const PLANTILLAS: { fuente: string; prioridad: CableVivo["prioridad"]; textos: string[] }[] = [
  {
    fuente: "SIGINT", prioridad: "CRITICO", textos: [
      "Intercepto cifrado detectado en {lugar} — estación de escucha reasignando antenas.",
      "Tráfico de radio enemigo se multiplica ×{num} en {lugar} — posible movimiento antes del amanecer.",
      "Ráfaga cifrada de {num} segundos capturada sobre {lugar} — criptoanalistas trabajando.",
      "Emisora número desconocida activa en {lugar} — secuencia de {num} dígitos repetida dos veces.",
    ],
  },
  {
    fuente: "SATÉLITE", prioridad: "URGENTE", textos: [
      "Pase orbital completado sobre {lugar} — {num} cambios térmicos marcados en el mosaico.",
      "KH-Vanguard 7 informa: {num} vehículos pesados en columna por {lugar}.",
      "Imagen SAR sobre {lugar}: huellas de excavación frescas junto a estructura oculta.",
      "Satélite meteorológico avista estelas anómalas cruzando {lugar}.",
    ],
  },
  {
    fuente: "AGENTE", prioridad: "URGENTE", textos: [
      "Informe del activo SOMBRA-{num}: combustible y municiones llegando de noche a {lugar}.",
      "Activo local confirma: oficiales extranjeros inspeccionaron silos junto a {lugar}.",
      "Mensaje de SOMBRA-{num}: «la población almacena agua, algo viene» — {lugar}.",
      "Cita segura consumada — documento fotografiado en la capital, corredor hacia {lugar}.",
    ],
  },
  {
    fuente: "CÁMARA", prioridad: "INFO", textos: [
      "Mosaico CCTV: camión sin matrícula cargado de noche frente al puerto de {lugar}.",
      "Reconocimiento facial en {lugar}: {num} rostros de la lista de vigilancia en 1 hora.",
      "Cámara térmica del perímetro registra {num} siluetas moviéndose hacia {lugar}.",
      "Tráfico portuario duplicado en {lugar} respecto a la media de las últimas semanas.",
    ],
  },
  {
    fuente: "MERCADO", prioridad: "INFO", textos: [
      "El crudo salta +{num}% en operaciones nocturnas — traders apuntan a {lugar}.",
      "Oro al alza: compradores anónimos mueven {num} toneladas — pánico silencioso.",
      "Fletes marítimos se disparan cerca de {lugar} — aseguradoras suben primas.",
      "Divisa regional en mínimos de {num} meses tras rumores que apuntan a {lugar}.",
    ],
  },
  {
    fuente: "EMBAJADA", prioridad: "URGENTE", textos: [
      "Cable diplomático interceptado: «evacuar personal no esencial desde {lugar}».",
      "Embajada quema documentos en el patio trasero — vecino lo filtra — cerca de {lugar}.",
      "Cónsul convoca reunión de emergencia: {num} nacionales esperando corredor humanitario.",
      "Título diplomático retira a su personal de {lugar} — señal clásica de escalada.",
    ],
  },
  {
    fuente: "SONAR", prioridad: "CRITICO", textos: [
      "Hidrófono del pasivo detecta {num} impactos de hélice nuclear saliendo de {lugar}.",
      "Contacto sumergido a {num} nudos en {lugar} — escoltas desplegadas.",
      "Red de sonar del fondo marca depósito de suministro en el lecho de {lugar}.",
    ],
  },
  {
    fuente: "DRON", prioridad: "URGENTE", textos: [
      "Ala fija no identificada ronda el perímetro de {lugar} durante {num} minutos.",
      "Enjambre de {num} aparatos detectado a baja cota cruzando {lugar}.",
      "Dron de vigilancia propio transmite: hangar secundario abierto de madrugada en {lugar}.",
      "Contramedidas activadas: un dron hostil derribado sobre {lugar}, restos en recuperación.",
    ],
  },
  {
    fuente: "HUMINT", prioridad: "CRITICO", textos: [
      "Contacto con el activo BRECHA-{num}: «los convoyes de {lugar} ya no viajan de día».",
      "Red local de {lugar} reporta oficiales comprando todos los mapas de la zona.",
      "Llamada interceptada en {lugar}: se piden {num} camiones de combustible para esta semana.",
      "El activo confirma: en {lugar} pagan en efectivo por silencio — algo grande se mueve.",
    ],
  },
  {
    fuente: "CIBER", prioridad: "URGENTE", textos: [
      "Anomalía en el tráfico: {num} GB salen de {lugar} hacia un destino sin registro.",
      "Intrusión contenida en la red eléctrica de {lugar} — firma de grupo conocido.",
      "Botón de pánico digital: {num} cuentas oficiales de {lugar} borran su historial a la vez.",
      "Secuestro de señal GPS en {lugar}: las naves reportan posiciones imposibles.",
    ],
  },
  {
    fuente: "ARMADA", prioridad: "INFO", textos: [
      "Flotilla de {num} buques avistada a 30 millas de {lugar} — rumbo de colisión.",
      "Reabastecimiento en alta mar cerca de {lugar}: nadie debería estar ahí.",
      "Aviso a la navegación: maniobras de minado simulado notificadas en {lugar}.",
    ],
  },
  {
    fuente: "ADUANA", prioridad: "INFO", textos: [
      "Manifiesto de carga falsificado detectado: {num} contenedores «de fruta» hacia {lugar}.",
      "Alto el tráfico aéreo de carga hacia {lugar}: {num} vuelos cancelados en una noche.",
      "Precinto violado en vagón procedente de {lugar} — revisión en zona aislada.",
    ],
  },
  {
    fuente: "GEODATO", prioridad: "INFO", textos: [
      "Cambios de terreno por satélite: nuevas trincheras en {lugar} desde el último pase.",
      "Calor nocturno anómalo en {lugar}: {num} focos donde ayer no había nada.",
      "El tráfico de barcos alrededor de {lugar} cae {num}% — bloqueo silencioso en curso.",
    ],
  },
];

function elegir<T>(arr: T[], excl?: T): T {
  if (arr.length === 1) return arr[0];
  let v = arr[Math.floor(Math.random() * arr.length)];
  let guard = 0;
  while (excl !== undefined && v === excl && guard++ < 6) v = arr[Math.floor(Math.random() * arr.length)];
  return v;
}
function rellenar(t: string): string {
  return t
    .replace("{lugar}", () => elegir(LUGARES))
    .replace("{num}", () => String(elegir(NUMS)))
    .replace(/ de el /g, " del ")
    .replace(/ a el /g, " al ");
}
let __seq = 0;

// v84.0 — BARAJA SIN REPETICIONES: se baraja el mazo completo de plantillas
// (fuente,texto) y se reparten una a una; SOLO cuando el mazo entero se ha
// jugado se vuelve a barajar. Antes el reparto era aleatorio puro y con 31
// plantillas a un cable cada ~5s la misma frase repetía cada ~2.5 minutos.
interface CartaMazo { ci: number; ti: number; }
function barajarMazo(): CartaMazo[] {
  const mazo: CartaMazo[] = [];
  for (let ci = 0; ci < PLANTILLAS.length; ci++) {
    for (let ti = 0; ti < PLANTILLAS[ci].textos.length; ti++) mazo.push({ ci, ti });
  }
  for (let i = mazo.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [mazo[i], mazo[j]] = [mazo[j], mazo[i]];
  }
  return mazo;
}
function interceptoDeCarta(carta: CartaMazo): CableVivo {
  const cat = PLANTILLAS[carta.ci];
  const plantilla = cat.textos[carta.ti];
  return {
    id: `w${Date.now()}-${__seq++}`,
    ts: Date.now(),
    fuente: cat.fuente,
    texto: rellenar(plantilla),
    prioridad: cat.prioridad,
  };
}
function cableDeTitular(titulo: string, publicadoAt: number): CableVivo {
  const edadH = (Date.now() - publicadoAt) / 3_600_000;
  return {
    id: `n${__seq++}-${titulo.slice(0, 24)}`,
    ts: publicadoAt,
    fuente: "AGENCIAS",
    texto: titulo,
    prioridad: edadH < 2 ? "CRITICO" : edadH < 6 ? "URGENTE" : "INFO",
  };
}

// ————— estilos por prioridad —————
const PRIO_CLS: Record<CableVivo["prioridad"], string> = {
  CRITICO: "text-crisis border-crisis-hud bg-crisis-hud/15",
  URGENTE: "text-amber border-amber-hud bg-amber-hud/15",
  INFO: "text-cyan-hud border-cyan-hud/60 bg-cyan-hud/10",
};
const PRIO_DOT: Record<CableVivo["prioridad"], string> = {
  CRITICO: "bg-crisis",
  URGENTE: "bg-amber",
  INFO: "bg-cyan-hud",
};

function HoraCable({ ts }: { ts: number }) {
  const d = new Date(ts);
  return (
    <span className="font-mono text-[9px] tabular-nums text-muted-foreground shrink-0">
      {String(d.getHours()).padStart(2, "0")}:{String(d.getMinutes()).padStart(2, "0")}:{String(d.getSeconds()).padStart(2, "0")}
    </span>
  );
}

// ————— hook del flujo vivo (compartido por ambos modos) —————
function useFlujoVivo(max: number, intervaloMs: number, activo: boolean) {
  const [cables, setCables] = useState<CableVivo[]>([]);
  const colaRef = useRef<CableVivo[]>([]);
  const usadoRef = useRef<Set<string>>(new Set());
  const mazoRef = useRef<CartaMazo[]>([]);
  const intervaloRef = useRef<number | null>(null);

  // 1) el emisor vive SIEMPRE (interceptos procedurales); los cables reales
  //    de las agencias se siembran en cuanto llegan de /api/news
  useEffect(() => {
    if (!activo) return;
    let vivo = true;
    if (mazoRef.current.length === 0) mazoRef.current = barajarMazo();
    const emitir = () => {
      const cola = colaRef.current;
      let nuevo: CableVivo;
      if (cola.length > 0 && Math.random() < 0.45) {
        nuevo = cola.shift()!;
      } else {
        // v84: mazo sin repeticiones — baraja de nuevo solo al agotar
        if (mazoRef.current.length === 0) mazoRef.current = barajarMazo();
        nuevo = interceptoDeCarta(mazoRef.current.pop()!);
      }
      if (usadoRef.current.has(nuevo.texto) && nuevo.fuente === "AGENCIAS") {
        usadoRef.current.delete(nuevo.texto); // recircula titulares viejos tras agotar pool
      }
      usadoRef.current.add(nuevo.texto);
      if (usadoRef.current.size > 60) {
        // poda del registro de vistos: conserva los más recientes (los primeros añadidos)
        const it = usadoRef.current.values();
        for (let k = 0; k < 20; k++) {
          const v = it.next();
          if (v.done) break;
          usadoRef.current.delete(v.value);
        }
      }
      setCables((prev) => [nuevo, ...prev].slice(0, max));
    };
    emitir();
    emitir();
    intervaloRef.current = window.setInterval(emitir, intervaloMs);
    // 2) sembrar titulares reales (la cola los mezcla con la proporción 0.45)
    //    v84: titulares DEDUPLICADOS entre sí — el mismo suceso desde dos
    //    medios solo entra una vez a la cola
    cargarTitulares().then((titulares) => {
      if (!vivo || titulares.length === 0) return;
      const ahora = Date.now();
      const vistas = new Set<string>();
      const limpio = titulares.filter((t) => {
        const h = t.toLowerCase().split(/[,:·—-]/)[0].split(" ").slice(0, 8).join(" ").trim();
        if (!h || vistas.has(h)) return false;
        vistas.add(h);
        return true;
      });
      colaRef.current.push(
        ...limpio.slice(0, 14).map((t) => cableDeTitular(t, ahora - Math.floor(Math.random() * 5 * 3600_000)))
      );
    });
    return () => {
      vivo = false;
      if (intervaloRef.current) window.clearInterval(intervaloRef.current);
    };
  }, [activo, intervaloMs, max]);

  return cables;
}

// ————— MODO CINTA: marquee de última hora —————
export function TeletipoCinta({ className }: { className?: string }) {
  const [activo, setActivo] = useState(false);
  useEffect(() => setActivo(true), []);
  const cables = useFlujoVivo(16, 5200, activo);
  const cinta = useMemo(() => {
    // cinta estable: mezcla proporcional (agencias primero, luego interceptos)
    const agencias = cables.filter((c) => c.fuente === "AGENCIAS").slice(0, 8);
    const resto = cables.filter((c) => c.fuente !== "AGENCIAS").slice(0, 8);
    return [...agencias, ...resto];
  }, [cables]);

  if (cinta.length === 0) {
    return (
      <div className={cn("hud-panel px-3 py-2 flex items-center gap-2 overflow-hidden", className)} aria-label="Teletipo en vivo">
        <span className="flex items-center gap-1.5 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-crisis blink-soft" />
          <span className="font-mono text-[9px] font-bold tracking-widest text-crisis">ÚLTIMA HORA</span>
        </span>
        <span className="font-mono text-[10px] text-muted-foreground truncate">conectando con las agencias…</span>
      </div>
    );
  }

  return (
    <div className={cn("hud-panel px-3 py-2 flex items-center gap-3 overflow-hidden relative", className)} aria-label="Teletipo en vivo">
      <span className="flex items-center gap-1.5 shrink-0 relative z-10">
        <span className="w-1.5 h-1.5 rounded-full bg-crisis blink-soft" />
        <span className="font-mono text-[9px] font-bold tracking-widest text-crisis">ÚLTIMA HORA</span>
      </span>
      <div className="flex-1 overflow-hidden relative">
        <div className="teletipo-cinta flex items-center gap-8 w-max hover:[animation-play-state:paused]">
          {[0, 1].map((cop) => (
            <div key={cop} className="flex items-center gap-8" aria-hidden={cop === 1}>
              {cinta.map((c) => (
                <span key={`${cop}-${c.id}`} className="flex items-center gap-2 shrink-0">
                  <span className={cn("w-1.5 h-1.5 rounded-full", PRIO_DOT[c.prioridad])} />
                  <span className="font-mono text-[9px] tracking-widest text-muted-foreground">{c.fuente}</span>
                  <span className={cn(
                    "text-[11px] leading-none",
                    c.prioridad === "CRITICO" ? "text-crisis font-semibold" : c.prioridad === "URGENTE" ? "text-amber" : "text-foreground/90"
                  )}>
                    {c.texto.length > 92 ? `${c.texto.slice(0, 92)}…` : c.texto}
                  </span>
                  <span className="text-border">◆</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ————— MODO FEED: mensajes apilados en vivo —————
export function TeletipoFeed({
  max = 12,
  intervaloMs = 4800,
  className,
  titulo = "TELETIPO EN VIVO",
}: {
  max?: number;
  intervaloMs?: number;
  className?: string;
  titulo?: string;
}) {
  const [activo, setActivo] = useState(false);
  useEffect(() => setActivo(true), []);
  const cables = useFlujoVivo(max, intervaloMs, activo);
  const [total, setTotal] = useState(0);
  useEffect(() => setTotal(cables.length), [cables.length]);

  return (
    <section className={cn("hud-panel p-0 overflow-hidden", className)} aria-label="Teletipo de mensajes en vivo">
      <header className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-black/30">
        <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-cyan-hud">
          <Radio className="w-3 h-3" /> {titulo}
        </span>
        <span className="flex items-center gap-1 font-mono text-[9px] text-green-hud">
          <span className="w-1.5 h-1.5 rounded-full bg-green-hud blink-soft" /> EN VIVO · {total} cables
        </span>
      </header>
      <div className="divide-y divide-white/5">
        <AnimatePresence initial={false}>
          {cables.map((c) => (
            <motion.div
              key={c.id}
              layout
              initial={{ opacity: 0, y: -18, backgroundColor: "rgba(255,60,48,0.14)" }}
              animate={{ opacity: 1, y: 0, backgroundColor: "rgba(255,60,48,0)" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-start gap-2 px-3 py-1.5"
            >
              <span className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", PRIO_DOT[c.prioridad], c.prioridad === "CRITICO" && "blink-soft")} />
              <HoraCable ts={c.ts} />
              <span className={cn("font-mono text-[8px] px-1 py-0.5 border uppercase tracking-widest shrink-0", PRIO_CLS[c.prioridad])}>
                {c.fuente}
              </span>
              <p className={cn(
                "text-[11px] leading-snug min-w-0",
                c.prioridad === "CRITICO" ? "text-foreground font-medium" : "text-foreground/85"
              )}>
                {c.texto}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
        {cables.length === 0 && (
          <div className="px-3 py-6 flex items-center justify-center gap-2 text-muted-foreground">
            <Zap className="w-3.5 h-3.5 animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-widest">abriendo la línea de inteligencia…</span>
          </div>
        )}
      </div>
    </section>
  );
}

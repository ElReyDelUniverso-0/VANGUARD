"use client";

// ══════════════════════════════════════════════════════════════════════
// v232.0 LA CENTRAL DE ALARMAS — la campana del HUD.
// «Noticias EN VIVO por importancia e impacto» necesita un SIRENO:
// mientras el visitante recorre la Casa, la Central barra la Agencia
// (60s, la misma dieta del CENTRO) y cuando nace un cable CRÍTICO+
// con menos de 2 horas, la campana cuenta y el toast ÚLTIMA HORA
// aterriza — sin invadir: el archivo completo vive en el CENTRO.
//
//  · CAMPANA con contador rojo (pulsa si hay URGENTE dentro).
//  · PANEL de la campana: las alarmas pendientes con su escalón,
//    impacto, país y edad — tocar abre la SALA DE LECTURA (v116).
//  · TOAST EN VIVO con acción ABRIR — la primicia en la cara.
//  · LECTURA HONESTA: abrir el CENTRO revisa todas las alarmas
//    (centro-panel llama limpiar() en su carga — estar mirando la
//    Agencia ES revisar la campana).
//  · PARIDAD — el mundo 3D ya tiene su sireno: el anillo de alarma
//    de la SALA DEL MAPA MUNDIAL (v173) late en los cables <2h.
//    2D = verdad (ley #25); la campana es la placa de la Casa.
// ══════════════════════════════════════════════════════════════════════
import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, BellRing, ChevronRight, Radio, Siren } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { navigateTo } from "@/lib/nav";
import { useAlarma, barrarAlarma, UMBRAL_ALARMA, VENTANA_MIN, type AlarmaItem } from "@/lib/alarma";
import { estaHidratado } from "@/lib/storage-blindado";
import { TIERS, type NoticiaRanqueada } from "@/lib/impacto";
import { LectorNoticia, type CableLectura } from "@/components/vanguard/lector-noticia";

type Cable = NoticiaRanqueada;

const aLectura = (a: AlarmaItem): CableLectura => ({
  id: a.id,
  title: a.titulo,
  url: a.url,
  source: a.fuente,
  publishedAt: new Date(a.nacido).toISOString(),
  tacticalTag: a.tag,
  conflictTag: null,
  sourceCountry: a.country,
});

export function CentralAlarmas() {
  const pendientes = useAlarma((s) => s.pendientes);
  const ultimaRevision = useAlarma((s) => s.ultimaRevision);
  const [abierto, setAbierto] = useState(false);
  const [lector, setLector] = useState<CableLectura | null>(null);
  const cajaRef = useRef<HTMLDivElement | null>(null);

  // ═══ EL BARRIDO VIVO — 60s, la misma dieta de la Agencia ═══
  const barrer = useCallback(async () => {
    try {
      const r = await fetch("/api/news?modo=centro", { cache: "no-store", signal: AbortSignal.timeout(12000) });
      const j = await r.json();
      const lista: Cable[] = Array.isArray(j?.items) ? j.items : [];
      if (!lista.length) return;
      // el candidato del toast: el cable alarmando más fuerte que la Central
      // todavía no conoce (mismo umbral/ventana que la ley de la alarma)
      const st = useAlarma.getState();
      const conocidos = new Set<string>([...st.vistos, ...st.pendientes.map((p) => p.id)]);
      const primo = lista
        .filter((n) => n?.id && n.impacto >= UMBRAL_ALARMA && n.edadMin < VENTANA_MIN && !conocidos.has(n.id))
        .sort((a, b) => b.impacto - a.impacto)[0];
      const n = barrarAlarma(lista);
      if (n > 0 && primo) {
        const tier = TIERS[primo.tier];
        toast("ÚLTIMA HORA", {
          description: primo.title,
          icon: <Siren className="w-4 h-4" style={{ color: tier.hex }} />,
          action: {
            label: "ABRIR",
            onClick: () => {
              setLector({
                id: primo.id,
                title: primo.title || "",
                url: primo.url || "",
                source: primo.source || "",
                publishedAt: typeof primo.publishedAt === "string" ? primo.publishedAt : new Date(primo.publishedAt).toISOString(),
                tacticalTag: primo.tacticalTag ?? null,
                conflictTag: primo.conflictTag ?? null,
                sourceCountry: primo.sourceCountry ?? null,
              });
            },
          },
          duration: 10000,
        });
      }
    } catch {
      // la Agencia no respondió — la Central espera el próximo barrido en silencio
    }
  }, []);

  useEffect(() => {
    let cancelado = false;
    // FIX CAZADO EN QA E2E (badge 2 con un solo cable nuevo): la primera
    // barrida espera la REHIDRATACIÓN del store — si barre antes, el
    // rehidratador pisa los vistos del primer barrido (cerradura v171/v172)
    // y un cable ya escaneado vuelve a alarma 60s después. Red de seguridad:
    // si la hidratación no llega en 6s, la Central barre igual (la Casa vive).
    let intentos = 0;
    const espera = window.setInterval(() => {
      intentos++;
      if (estaHidratado("vg232-alarma") || intentos > 24) {
        window.clearInterval(espera);
        if (!cancelado) void barrer();
      }
    }, 250);
    const id = window.setInterval(barrer, 60000);
    return () => {
      cancelado = true;
      window.clearInterval(espera);
      window.clearInterval(id);
    };
  }, [barrer]);

  // el clic fuera cierra el panel de la campana (placa educada, patrón casa)
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: PointerEvent) => {
      if (cajaRef.current && !cajaRef.current.contains(e.target as Node)) setAbierto(false);
    };
    window.addEventListener("pointerdown", fuera);
    return () => window.removeEventListener("pointerdown", fuera);
  }, [abierto]);

  const hayUrgente = pendientes.some((p) => p.tier === "urgente");
  const cuenta = pendientes.length;

  const abrirCentro = () => {
    setAbierto(false);
    navigateTo("centro"); // estar mirando la Agencia revisa la campana (limpiar en su carga)
  };

  return (
    <div ref={cajaRef} className="relative flex-shrink-0">
      {/* LA CAMPANA */}
      <button
        onClick={() => setAbierto((v) => !v)}
        aria-pressed={abierto}
        title={cuenta > 0 ? `CENTRAL DE ALARMAS · ${cuenta} cable${cuenta === 1 ? "" : "s"} sin revisar (impacto ≥ ${UMBRAL_ALARMA}, <${VENTANA_MIN} min)` : "CENTRAL DE ALARMAS · la Agencia vigila (alarma = CRÍTICO+ con menos de 2 h)"}
        className={cn(
          "relative w-6 h-6 sm:w-8 sm:h-8 hud-corner flex-shrink-0 flex items-center justify-center transition-colors",
          hayUrgente ? "border-red-hud text-red-hud" : "border-amber-hud text-amber hover:bg-amber-hud",
          cuenta > 0 && "v232-campana-viva",
        )}
      >
        {cuenta > 0 ? (
          <BellRing className={cn("w-3 h-3 sm:w-4 sm:h-4", hayUrgente && "animate-pulse")} />
        ) : (
          <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
        )}
        {cuenta > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[13px] h-[13px] px-0.5 rounded-full bg-red-hud text-white text-[8px] font-bold font-mono flex items-center justify-center border border-background">
            {cuenta > 9 ? "9+" : cuenta}
          </span>
        )}
      </button>

      {/* EL PANEL DE LA CAMPANA */}
      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-[300px] sm:w-[340px] border border-red-hud/50 bg-background/95 backdrop-blur-md shadow-2xl"
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/70 bg-red-hud/10">
              <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] text-red-hud font-mono">
                <Siren className="w-3.5 h-3.5" /> CENTRAL DE ALARMAS
              </span>
              <span className="text-[9px] font-mono text-muted-foreground">
                {ultimaRevision > 0
                  ? `REVISADA ${new Date(ultimaRevision).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                  : "SINTONIZANDO"}
              </span>
            </div>

            <div className="max-h-[320px] overflow-y-auto">
              {cuenta === 0 ? (
                <div className="px-3 py-6 text-center">
                  <Bell className="w-5 h-5 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-xs text-muted-foreground">SIN ALARMAS — LA AGENCIA VIGILA</p>
                  <p className="text-[9px] font-mono text-muted-foreground/70 mt-1.5">
                    ALARMA = IMPACTO ≥ {UMBRAL_ALARMA} (CRÍTICO+) · NACIDO &lt; {VENTANA_MIN} MIN
                  </p>
                </div>
              ) : (
                <ul>
                  {pendientes.map((p) => {
                    const tier = TIERS[p.tier];
                    return (
                      <li key={p.id}>
                        <button
                          onClick={() => { setLector(aLectura(p)); useAlarma.getState().leer(p.id); }}
                          className="w-full text-left px-3 py-2 border-b border-border/50 hover:bg-red-hud/10 transition-colors group"
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={cn("px-1.5 py-0.5 border text-[9px] font-bold tracking-widest", tier.clase)}>
                              {tier.label}
                            </span>
                            <span className="text-[9px] font-mono text-amber">IMP {p.impacto}</span>
                            <span className="text-[9px] font-mono text-muted-foreground truncate">{p.pais}</span>
                            <ChevronRight className="w-3 h-3 ml-auto text-muted-foreground group-hover:text-amber transition-colors shrink-0" />
                          </div>
                          <p className="text-[11px] leading-snug line-clamp-2 text-foreground/90 group-hover:text-foreground">
                            {p.titulo}
                          </p>
                          <p className="text-[9px] font-mono text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Radio className="w-2.5 h-2.5" />
                            {p.fuente} · HACE {p.edadMin < 60 ? `${p.edadMin} MIN` : `${Math.round(p.edadMin / 60)} H`}
                          </p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <button
              onClick={abrirCentro}
              className="w-full px-3 py-2 border-t border-border/70 bg-secondary/60 hover:bg-secondary transition-colors flex items-center justify-center gap-1.5 text-[10px] font-bold tracking-[0.2em] text-amber"
            >
              <Siren className="w-3 h-3" /> ABRIR EL CENTRO MUNDIAL
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LA SALA DE LECTURA — la misma sala interna de la casa (v116) */}
      <LectorNoticia cable={lector} onCerrar={() => setLector(null)} />
    </div>
  );
}

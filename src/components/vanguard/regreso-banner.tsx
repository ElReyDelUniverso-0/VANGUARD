"use client";

// v101.0 EL REGRESO — PILAR 1: EL MUNDO CAMBIA (capa global)
// Montada en layout raíz como PulsoAuto/RetentionLayer. En cada visita:
//  - si es la primera: se registra el instante SIN molestar (honestidad).
//  - si volvió tras ≥4h: banner discreto con el número REAL de cambios
//    desde su última visita (pulsos del mundo) y botón al informe completo.
// Sin urgencia falsa: si no hubo cambios, no hay banner. Cada cuenta es real.

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, X, ArrowRight } from "lucide-react";
import { navigateTo } from "@/lib/nav";
import { useRetention } from "@/lib/retention";
import { informeRegreso, ausenciaTxt, REGRESO_LS, type InformeRegreso } from "@/lib/regreso";
import { useT } from "@/lib/i18n";

const MIN_AWAY_MS = 4 * 3_600_000; // 4h: debajo de esto no hay banner

export function RegresoBanner() {
  const { t } = useT();
  const [informe, setInforme] = useState<InformeRegreso | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // esperar a que la retención se hidrate y al DailyLoginModal (no pelear capas)
    const boot = window.setTimeout(() => {
      try {
        const ret = useRetention.getState();
        ret.touchVisit(); // patrón v55: toca la visita una vez por carga
        const vc = ret.visitCount;
        let seen = -1;
        try {
          seen = Number(localStorage.getItem(REGRESO_LS) || "-1");
        } catch { /* sin storage */ }
        const inf = informeRegreso(ret.lastVisit, vc);
        if (!inf.firstVisit && inf.awayMs >= MIN_AWAY_MS && inf.total > 0 && seen !== vc) {
          setInforme(inf);
          window.setTimeout(() => setVisible(true), 1400);
        }
      } catch { /* nunca romper la app */ }
    }, 3600);
    return () => window.clearTimeout(boot);
  }, []);

  const cerrar = () => {
    setVisible(false);
    try {
      const vc = useRetention.getState().visitCount;
      localStorage.setItem(REGRESO_LS, String(vc));
    } catch { /* noop */ }
  };

  const verInforme = () => {
    cerrar();
    navigateTo("cambios" as never);
  };

  return (
    <AnimatePresence>
      {visible && informe && (
        <motion.div
          className="fixed bottom-16 left-1/2 z-40 w-[min(94vw,520px)] -translate-x-1/2 sm:bottom-20"
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
        >
          <div className="v101-panel relative overflow-hidden rounded-2xl border border-[#f5c542]/30 bg-[#120c03]/95 p-3.5 shadow-[0_10px_40px_rgba(245,197,66,0.12)] backdrop-blur">
            <div className="v101-brillo absolute inset-x-0 top-0 h-px" aria-hidden />
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-[#f5c542]/40 bg-[#f5c542]/10">
                <RefreshCw className="h-4.5 w-4.5 text-[#f5c542]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-black uppercase tracking-widest text-[#f5c542]">
                  {t("regreso.bannerTitulo")}
                </div>
                <p className="mt-0.5 text-[11px] leading-snug text-white/70">
                  <span className="font-black text-white">{informe.total}</span>{" "}
                  {t("regreso.bannerCuerpo")}{" "}
                  <span className="text-white/45">({ausenciaTxt(informe.awayMs)})</span>
                </p>
                <button
                  onClick={verInforme}
                  className="v101-cta mt-2 inline-flex items-center gap-1.5 rounded-lg border border-[#f5c542]/50 bg-[#f5c542]/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#ffe08a] transition hover:bg-[#f5c542]/25 active:scale-95"
                >
                  {t("regreso.bannerBoton")} <ArrowRight className="h-3 w-3" />
                </button>
              </div>
              <button
                onClick={cerrar}
                aria-label={t("regreso.cerrar")}
                className="rounded-md p-1 text-white/35 transition hover:bg-white/10 hover:text-white/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

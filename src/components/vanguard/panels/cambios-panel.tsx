"use client";

// v101.0 EL REGRESO — PILAR 1: EL MUNDO CAMBIA (panel)
// El informe de regreso completo: qué cambió desde la última visita, con
// fechas y fuentes verificables. Tres corrientes, cada una con su etiqueta:
//   · PULSOS DEL MUNDO — eventos de LA MENTE (MUNDO VANGUARD · SIM)
//   · NOTICIAS REALES  — archivo con dominio y fecha (FUENTE REAL · verificable)
//   · ROTARON HOY      — expediente del día, entrada oscura (MUNDO VANGUARD)
// "Que no sea simplemente la misma página de ayer."

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, ExternalLink, Globe2, Newspaper, FolderOpen, BookLock, ShieldQuestion, Eye } from "lucide-react";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { useRetention } from "@/lib/retention";
import { informeRegreso, ausenciaTxt, type InformeRegreso } from "@/lib/regreso";
import { TIPO_COLOR } from "@/lib/mente-data";
import { useT } from "@/lib/i18n";

interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  tacticalTag: string | null;
}

export function CambiosPanel() {
  const { t } = useT();
  const [informe, setInforme] = useState<InformeRegreso | null>(null);
  const [noticias, setNoticias] = useState<NewsItem[] | null>(null);

  // informe local (recomputa al montar y cada minuto por si el pulso avanza)
  useEffect(() => {
    const calc = () => {
      try {
        const ret = useRetention.getState();
        setInforme(informeRegreso(ret.lastVisit, ret.visitCount));
      } catch { /* noop */ }
    };
    calc();
    const iv = window.setInterval(calc, 60_000);
    return () => window.clearInterval(iv);
  }, []);

  // noticias reales desde la última visita (FUENTE REAL · fecha · dominio)
  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const res = await fetch("/api/news?limit=30");
        const data = await res.json();
        if (!vivo) return;
        const items: NewsItem[] = (data.items || []).map((it: NewsItem) => ({
          id: it.id, title: it.title, url: it.url, source: it.source,
          publishedAt: it.publishedAt, tacticalTag: it.tacticalTag,
        }));
        setNoticias(items);
      } catch {
        if (vivo) setNoticias([]);
      }
    })();
    return () => { vivo = false; };
  }, []);

  const noticiasNuevas = useMemo(() => {
    if (!noticias) return null;
    const desde = informe && !informe.firstVisit ? informe.awayMs : 24 * 3_600_000;
    const corte = Date.now() - desde;
    return noticias.filter((n) => new Date(n.publishedAt).getTime() >= corte).slice(0, 12);
  }, [noticias, informe]);

  const fechaTxt = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("es", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
    } catch { return iso; }
  };

  return (
    <div className="mx-auto max-w-6xl px-3 pb-24 pt-2 sm:px-4">
      <HeroOro panel="cambios" />

      {/* CABECERA DEL INFORME */}
      <motion.div
        className="v101-panel mt-3 overflow-hidden rounded-2xl border border-[#f5c542]/25 bg-gradient-to-br from-[#f5c542]/8 via-transparent to-transparent p-4"
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-2.5">
            <RefreshCw className="h-5 w-5 text-[#f5c542]" />
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-white/45">{t("regreso.informeTitulo")}</div>
              <div className="font-orbitron text-lg font-black tracking-wide text-[#f5c542]">
                {informe ? (informe.firstVisit ? t("regreso.primeraVisita") : `${informe.total} ${t("regreso.cambios")}`) : "…"}
              </div>
            </div>
          </div>
          <div className="text-[10px] font-mono text-white/45">
            {informe && !informe.firstVisit && (
              <>
                {t("regreso.ultimaVisita")}: <span className="text-white/70">{ausenciaTxt(informe.awayMs)}</span>
                {" · "}{t("regreso.visitas")}: <span className="text-white/70">{informe.visitCount}</span>
              </>
            )}
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider">
            <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-emerald-300">FUENTE REAL</span>
            <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-amber-300">MUNDO VANGUARD · SIM</span>
          </div>
        </div>
        {informe && !informe.firstVisit && (
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/8">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#f5c542] to-[#ffe08a]"
              initial={{ width: 0 }} animate={{ width: `${Math.min(100, informe.pulsosEscaneados * 1.1)}%` }}
              transition={{ duration: 1.1, ease: "easeOut" }}
            />
          </div>
        )}
      </motion.div>

      {/* 1 · PULSOS DEL MUNDO */}
      <Seccion
        icono={<Globe2 className="h-4 w-4" />}
        titulo={`${t("regreso.pulsos")} · SIM`}
        nota={informe && !informe.firstVisit ? `${t("regreso.pulsosEscaneados")} ${informe.pulsosEscaneados} · ${t("regreso.riesgoMedio")} ${informe.riesgoMedio}/100` : ""}
        color="#FFC94D"
      >
        {informe?.pulsos.length ? (
          <div className="grid gap-2 md:grid-cols-2">
            {informe.pulsos.slice(0, 24).map((ev, i) => (
              <motion.div
                key={ev.id}
                className="v101-entra rounded-xl border border-white/8 bg-black/35 p-2.5"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.6), duration: 0.35 }}
              >
                <div className="flex items-center gap-2">
                  <span className="rounded px-1.5 py-0.5 text-[8px] font-black tracking-wider" style={{ color: TIPO_COLOR[ev.tipo], border: `1px solid ${TIPO_COLOR[ev.tipo]}55` }}>
                    {ev.tipo}
                  </span>
                  <span className="text-[9px] font-mono text-white/35">{ev.hora}</span>
                  <span className="ml-auto text-[9px] font-mono" style={{ color: ev.riesgo > 60 ? "#FF6B5A" : ev.riesgo > 35 ? "#FFD166" : "#4ADE80" }}>
                    R{ev.riesgo}
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-snug text-white/80">{ev.titulo}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-white/45">{t("regreso.sinPulsos")}</p>
        )}
      </Seccion>

      {/* 2 · NOTICIAS REALES (verificables) */}
      <Seccion
        icono={<Newspaper className="h-4 w-4" />}
        titulo={t("regreso.noticias")}
        nota={t("regreso.noticiasNota")}
        color="#00FF87"
      >
        {noticiasNuevas === null ? (
          <p className="text-[11px] text-white/45">…</p>
        ) : noticiasNuevas.length ? (
          <div className="grid gap-2">
            {noticiasNuevas.map((n, i) => (
              <motion.a
                key={n.id}
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                className="v101-entra group flex items-start gap-2.5 rounded-xl border border-emerald-400/12 bg-black/35 p-2.5 transition hover:border-emerald-400/35 hover:bg-emerald-400/5"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.5), duration: 0.35 }}
              >
                <ExternalLink className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-400/70" />
                <div className="min-w-0">
                  <p className="text-[11.5px] leading-snug text-white/85 group-hover:text-white">{n.title}</p>
                  <p className="mt-0.5 text-[9px] font-mono text-white/35">
                    <span className="text-emerald-300/80">{n.source}</span> · {fechaTxt(n.publishedAt)}
                    {n.tacticalTag ? ` · ${n.tacticalTag}` : ""}
                  </p>
                </div>
              </motion.a>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-white/45">{t("regreso.sinNoticias")}</p>
        )}
      </Seccion>

      {/* 3 · ROTARON HOY */}
      <Seccion icono={<Eye className="h-4 w-4" />} titulo={t("regreso.rotaron")} nota={t("regreso.rotaronNota")} color="#A855F7">
        {informe && (
          <div className="grid gap-2 md:grid-cols-3">
            <RotacionCard
              icono={<FolderOpen className="h-4 w-4" />}
              etiqueta="EXPEDIENTE DEL DÍA"
              titulo={informe.rotaciones.expediente.titulo}
              detalle={`${informe.rotaciones.expediente.agencia} · ${new Date().toLocaleDateString("es", { day: "2-digit", month: "short" })}`}
              acento="#A855F7"
            />
            <RotacionCard
              icono={<BookLock className="h-4 w-4" />}
              etiqueta="ALEJANDRÍA OSCURA"
              titulo={informe.rotaciones.oscura.titulo}
              detalle={`${informe.rotaciones.oscura.coleccion} · ${new Date().toLocaleDateString("es", { day: "2-digit", month: "short" })}`}
              acento="#FF3B30"
            />
            <RotacionCard
              icono={<ShieldQuestion className="h-4 w-4" />}
              etiqueta="RETO DEL CREADOR"
              titulo={t("regreso.retoCreador")}
              detalle={t("regreso.retoCreadorNota")}
              acento="#BEF264"
            />
          </div>
        )}
      </Seccion>

      <p className="mt-4 text-center text-[10px] font-semibold text-white/25">
        {t("regreso.pie")}
      </p>
    </div>
  );
}

function Seccion({ icono, titulo, nota, color, children }: {
  icono: React.ReactNode; titulo: string; nota?: string; color: string; children: React.ReactNode;
}) {
  return (
    <motion.div
      className="mt-4"
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg border" style={{ color, borderColor: `${color}44`, background: `${color}12` }}>
          {icono}
        </span>
        <span className="text-[11px] font-black uppercase tracking-widest" style={{ color }}>{titulo}</span>
        {nota && <span className="ml-auto text-[9px] font-mono text-white/35">{nota}</span>}
      </div>
      {children}
    </motion.div>
  );
}

function RotacionCard({ icono, etiqueta, titulo, detalle, acento }: {
  icono: React.ReactNode; etiqueta: string; titulo: string; detalle: string; acento: string;
}) {
  return (
    <motion.div
      className="v101-entra rounded-xl border border-white/8 bg-black/35 p-3"
      initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-2">
        <span style={{ color: acento }}>{icono}</span>
        <span className="text-[8.5px] font-black uppercase tracking-widest" style={{ color: acento }}>{etiqueta}</span>
      </div>
      <p className="mt-1.5 text-[12px] font-bold leading-snug text-white/85">{titulo}</p>
      <p className="mt-0.5 text-[9px] font-mono text-white/35">{detalle}</p>
    </motion.div>
  );
}

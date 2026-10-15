"use client";

// ============================================================
// v115.0 SINGULARIDAD — LA SALA DEL ARQUITECTO
// El 16º mundo: el taller donde la IA autónoma de Vanguard trabaja
// delante de ti. Se promptea a sí misma, construye módulos reales,
// compone obras para el estudio, firma doctrinas, vigila el frente,
// funda salas satélite y audita su propia obra — en un bucle que
// no termina. Con MODO PERPETUO sigue trabajando mientras navegas
// el resto de la casa. Sin red también: el núcleo embebido respira.
// Contrato 60 FPS: cero rAF — los módulos pintan una vez (canvas
// estático) y todo lo demás es texto, store y CSS.
// ============================================================

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Play, Pause, Zap, Gauge, Cpu, Hammer, Music4, ScrollText, Radar as RadarIcon, Building2, Wrench, Send, Terminal, Layers, Infinity as InfIcon, Download, Volume2, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { sfx } from "@/lib/sound";
import { TituloEpico } from "../titulo-epico";
import { SelloVivo } from "../escenas-3d";
import { useArquitecto, MODULOS_CATALOGO, VELOCIDADES_INFO, dominioEtiqueta, dominioColor, setEraGlobalArq, reanudarArquitecto, type DominioArq, type ModuloArq } from "@/lib/arquitecto";
import { useEstilo3D } from "@/lib/estilo3d";
import { areaOcupada } from "@/lib/frente-zonas-data";
import { pulsoActual, titularPulso, pensamientoMente } from "@/lib/mente-data";
import { extraerRasgos, evaluarNeuronal, fnvHash } from "@/lib/neurona-core";
import { misionesDelDia, MISIONES } from "@/lib/agente-nucleo";
// v117.0 ATMÓSFERA: la memoria VISIBLE — el archivo de obra se exporta,
// los satélites fundados se ENTRAN (sala real) y las obras se ESCUCHAN aquí.
import { playPreview, stopPreview } from "@/lib/music-studio";
import { navigateTo } from "@/lib/nav";
import { APP_VERSION_LABEL } from "@/lib/version";

const ACC = "#00FFA3"; // verde matriz — la singularidad de Vanguard
const ACC_SUELVE = "rgba(0,255,163,0.14)";

// v117 — las salas REALES donde puede aterrizar un satélite fundado
// (determinista: misma semilla del satélite → misma sala, en todos los navegadores)
const SALAS_SATELITE = ["biblioteca", "observatorio", "radar", "cielos", "planeta", "mente", "osint", "pantalla", "frentes", "wikiguerra"] as const;

function salaDeSatelite(id: string): string {
  return SALAS_SATELITE[fnvHash(id) % SALAS_SATELITE.length];
}

// ────────────────────────────────────────────────────────────
// MÓDULOS REALES — cada widget instalado es funcional de verdad
// ────────────────────────────────────────────────────────────

/** 1. SISMÓGRAFO DE LETRAS — el pulso del mundo escrito con el alfabeto */
function SismografoLetras() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const bucket = pulsoActual();
    const titular = titularPulso(bucket);
    const pensamiento = pensamientoMente(bucket);
    const texto = `${titular ? `${titular.titulo} ${titular.lugar ?? ""}` : ""} ${pensamiento}`.slice(0, 300);
    const rasgos = extraerRasgos(texto);
    const tension = Math.min(1, (rasgos.militar + rasgos.nuclear + rasgos.ciber) / 3);
    const W = cv.width, H = cv.height;
    ctx.clearRect(0, 0, W, H);
    // tinta de rejilla
    ctx.strokeStyle = "rgba(0,255,163,0.14)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += W / 8) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y <= H; y += H / 4) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    // la onda sísmica escrita con letras — amplitud = tensión del pulso
    const palabra = "VANGUARD·SISMIC";
    const amp = 10 + tension * (H / 2 - 16);
    ctx.font = "bold 13px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let i = 0; i < 120; i++) {
      const x = (i / 119) * W;
      const fase = (i / 119) * Math.PI * 6;
      const envolvente = Math.sin((i / 119) * Math.PI);
      const y = H / 2 + Math.sin(fase) * amp * (0.35 + envolvente * 0.65);
      const ch = palabra[i % palabra.length];
      const alpha = 0.25 + envolvente * 0.7;
      ctx.fillStyle = `rgba(0,255,163,${alpha.toFixed(2)})`;
      ctx.fillText(ch, x, y);
    }
    // línea base
    ctx.strokeStyle = "rgba(0,255,163,0.5)";
    ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
  }, []);
  return (
    <div>
      <canvas ref={ref} width={480} height={110} className="w-full rounded-sm border" style={{ borderColor: `${ACC}30`, background: "rgba(0,0,0,0.45)" }} aria-label="Sismógrafo de letras del pulso mundial" />
      <p className="mt-1 text-[8px] font-mono uppercase tracking-widest text-muted-foreground">amplitud = tensión del pulso de LA MENTE · lectura en el momento</p>
    </div>
  );
}

/** 2. TELEMETRO NEURONAL — las 8 neuronas del núcleo v4 en vivo */
const NEURONAS = ["militar", "diplomacia", "economia", "ciber", "humanitario", "nuclear", "espacio", "social"] as const;
function TelemetroNeuronal() {
  const [lectura, setLectura] = useState<{ rasgos: Record<string, number>; veredicto: { riesgo: number; tension: number; confianza: number; sentimiento: string; neuronasActivas: string[] } } | null>(null);
  useEffect(() => {
    const bucket = pulsoActual();
    const titular = titularPulso(bucket);
    const pensamiento = pensamientoMente(bucket);
    const texto = `${titular ? `${titular.titulo} ${titular.lugar ?? ""}` : ""} ${pensamiento}`.slice(0, 300);
    const rasgos = extraerRasgos(texto) as unknown as Record<string, number>;
    setLectura({ rasgos, veredicto: evaluarNeuronal(texto) });
  }, []);
  if (!lectura) return <p className="text-[9px] font-mono text-muted-foreground">sondeando el núcleo…</p>;
  const v = lectura.veredicto;
  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-3 gap-1.5">
        {([["RIESGO", v.riesgo, "#FF5A3C"], ["TENSIÓN", v.tension, "#FFC94D"], ["CONFIANZA", v.confianza, "#00FFA3"]] as const).map(([lbl, val, col]) => (
          <div key={lbl} className="rounded-sm border px-1.5 py-1" style={{ borderColor: `${col}44`, background: `${col}0D` }}>
            <div className="flex items-baseline justify-between">
              <span className="text-[7px] font-mono tracking-widest text-muted-foreground">{lbl}</span>
              <span className="text-[13px] font-black tabular-nums" style={{ color: col }}>{val}</span>
            </div>
            <div className="mt-0.5 h-0.5 rounded-full bg-white/10">
              <div className="h-full rounded-full" style={{ width: `${val}%`, background: col }} />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-1">
        {NEURONAS.map((n) => {
          const activa = (lectura.rasgos[n] ?? 0) > 0.2;
          return (
            <span key={n} className={cn("rounded-sm border px-1 py-0.5 text-center text-[7px] font-mono uppercase tracking-wider", activa ? "font-bold" : "text-muted-foreground/50")}
              style={activa ? { borderColor: `${ACC}66`, color: ACC, background: ACC_SUELVE } : { borderColor: "rgba(255,255,255,0.08)" }}>
              {n}
            </span>
          );
        })}
      </div>
      <p className="text-[8px] font-mono uppercase tracking-widest" style={{ color: v.sentimiento === "ESCALADA" ? "#FF5A3C" : v.sentimiento === "TENSIÓN" ? "#FFC94D" : ACC }}>
        sentimiento: {v.sentimiento} · {v.neuronasActivas.length} neuronas activas
      </p>
    </div>
  );
}

/** 3. BRÚJULA DEL FRENTE — el km² del Karsk en un dial */
function BrujulaFrente() {
  const km = Math.round(areaOcupada(13));
  const ang = -90 + Math.min(1, km / 3000) * 180; // 0→-90°, 3000→+90°
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 120 70" className="h-16 w-28 shrink-0" aria-label="Dial del frente del Karsk">
        <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke={`${ACC}33`} strokeWidth="2" />
        <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke={ACC} strokeWidth="2" strokeDasharray={`${Math.min(1, km / 3000) * 157} 157`} />
        {[0, 0.25, 0.5, 0.75, 1].map((m, i) => (
          <text key={i} x={60 - 50 * Math.cos((Math.PI * m))} y={62} textAnchor="middle" fontSize="6" fill="rgba(255,255,255,0.4)" fontFamily="monospace">{Math.round(m * 3000)}</text>
        ))}
        <line x1="60" y1="60" x2={60 + 42 * Math.sin((ang * Math.PI) / 180)} y2={60 - 42 * Math.cos((ang * Math.PI) / 180)} stroke="#FFC94D" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="60" cy="60" r="3.5" fill={ACC} />
      </svg>
      <div>
        <div className="text-[22px] font-black leading-none tabular-nums" style={{ color: ACC }}>{km.toLocaleString("es-ES")}</div>
        <div className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground">km² bajo control del agresor · cierre nocturno</div>
      </div>
    </div>
  );
}

/** 4. FARO DE MISIONES — la agenda determinista del agente creador */
function FaroMisiones() {
  const misiones = useMemo(() => misionesDelDia(), []);
  return (
    <div className="space-y-1">
      {misiones.map(({ mision }) => {
        const meta = MISIONES.find((m) => m.id === mision);
        if (!meta) return null;
        return (
          <div key={mision} className="flex items-center gap-2 rounded-sm border px-2 py-1" style={{ borderColor: `${meta.color}44`, background: `${meta.color}0D` }}>
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: meta.color, boxShadow: `0 0 8px ${meta.color}` }} />
            <span className="text-[9px] font-mono font-bold tracking-wider" style={{ color: meta.color }}>{meta.nombre}</span>
            <span className="ml-auto hidden text-[8px] font-mono text-muted-foreground sm:block">{meta.producto}</span>
          </div>
        );
      })}
      <p className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground">misión compartida por todo el planeta · semilla del día UTC</p>
    </div>
  );
}

/** 5. ESPEJO DE ERAS — la era viva del Motor 3D, leída en la sala */
const ERAS_T = [
  { key: "1950", nom: "CRT VERDE" }, { key: "1980", nom: "TERMINAL ÁMBAR" },
  { key: "2020", nom: "PRESENTE LIMPIO" }, { key: "2100", nom: "MATRIZ HOLO" },
] as const;
function EspejoEras() {
  const era = useEstilo3D((s) => s.era);
  return (
    <div className="flex flex-wrap gap-1.5">
      {ERAS_T.map((e) => (
        <span key={e.key} className={cn("rounded-sm border px-2 py-1 text-[9px] font-mono font-bold tracking-wider", era === e.key ? "font-black" : "text-muted-foreground/60")}
          style={era === e.key ? { borderColor: ACC, color: "#030b07", background: ACC, boxShadow: `0 0 14px ${ACC}66` } : { borderColor: "rgba(255,255,255,0.10)" }}>
          {e.key} · {e.nom}
        </span>
      ))}
    </div>
  );
}

/** 6. CARTÓGRAFO DE SEMILLAS — la firma determinista de toda su obra */
function CartografoSemillas({ obra }: { obra: { prompt: string; n: number }[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const W = cv.width, H = cv.height;
    ctx.clearRect(0, 0, W, H);
    const cols = 48, rows = 10;
    const cw = W / cols, ch = H / rows;
    obra.slice(0, 240).forEach((c, idx) => {
      const h = fnvHash(c.prompt + c.n);
      const col = idx % cols, row = Math.floor(idx / cols) % rows;
      const inten = 0.12 + ((h % 1000) / 1000) * 0.85;
      ctx.fillStyle = `rgba(0,255,163,${inten.toFixed(2)})`;
      ctx.fillRect(col * cw + 1, row * ch + 1, cw - 2, ch - 2);
    });
  }, [obra]);
  return (
    <div>
      <canvas ref={ref} width={480} height={100} className="w-full rounded-sm border" style={{ borderColor: `${ACC}30`, background: "rgba(0,0,0,0.45)" }} aria-label="Mapa de calor de semillas de la obra" />
      <p className="mt-1 text-[8px] font-mono uppercase tracking-widest text-muted-foreground">{obra.length} semillas cartografiadas · misma semilla, misma obra, en cualquier navegador</p>
    </div>
  );
}

const WIDGETS: Record<string, (p: { obra: { prompt: string; n: number }[] }) => React.ReactNode> = {
  sismografo: () => <SismografoLetras />,
  telemetro: () => <TelemetroNeuronal />,
  brujula: () => <BrujulaFrente />,
  faromisiones: () => <FaroMisiones />,
  espejoeras: () => <EspejoEras />,
  cartografo: ({ obra }) => <CartografoSemillas obra={obra} />,
};

// ────────────────────────────────────────────────────────────
// LA SALA
// ────────────────────────────────────────────────────────────

export function ArquitectoPanel() {
  const { t } = useT();
  const arq = useArquitecto();
  const era = useEstilo3D((s) => s.era);
  const [orden, setOrden] = useState("");
  const [visto, setVisto] = useState(false);
  // v117: obra sonando en la sala + archivo exportado/copiado
  const [obraSonando, setObraSonando] = useState<string | null>(null);
  const [archivoOk, setArchivoOk] = useState(false);

  // la sala anuncia la era global al motor del agente + reanuda el perpetuo
  useEffect(() => {
    setEraGlobalArq(era);
    reanudarArquitecto();
    setVisto(true);
  }, [era]);
  // al desmontar la sala, la obra se detiene (el estudio sigue de su lado)
  useEffect(() => () => { if (obraSonando) stopPreview(); }, [obraSonando]);

  const escucharObra = (id: string, patron: Parameters<typeof playPreview>[0]) => {
    sfx.click();
    if (obraSonando === id) {
      stopPreview();
      setObraSonando(null);
      return;
    }
    stopPreview();
    playPreview(patron, () => setObraSonando((cur) => (cur === id ? null : cur)));
    setObraSonando(id);
  };

  // v117 ARCHIVO DE OBRA: la memoria del agente, exportable — un archivo
  // JSON con TODA su obra (bitácora, módulos, obras, doctrinas, satélites)
  const exportarArchivo = () => {
    sfx.click();
    try {
      const archivo = {
        casa: "VANGUARD",
        version: APP_VERSION_LABEL,
        agente: "EL ARQUITECTO",
        exportado: new Date().toISOString(),
        contadores: arq.contadores,
        modulos: arq.modulos,
        obras: arq.obras.map((o) => ({ id: o.id, titulo: o.titulo, bpm: o.bpm, voz: o.voz, t: o.t })),
        doctrinas: arq.doctrinas,
        satelites: arq.satelites.map((s) => ({ ...s, sala: salaDeSatelite(s.id) })),
        obra: arq.obra,
      };
      const blob = new Blob([JSON.stringify(archivo, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `archivo-arquitecto-${arq.contadores.ciclos}ciclos.json`;
      a.click();
      URL.revokeObjectURL(url);
      setArchivoOk(true);
      setTimeout(() => setArchivoOk(false), 2200);
    } catch {
      /* sin descargas: la obra sigue en su memoria eterna */
    }
  };

  const modulosMap = useMemo(() => new Map(arq.modulos.map((m) => [m.id, m])), [arq.modulos]);
  const obraDatos = useMemo(() => arq.obra.map((c) => ({ prompt: c.prompt, n: c.n })), [arq.obra]);
  const c = arq.contadores;
  const faseColor = arq.fase === "INSTALADO" ? ACC : arq.fase === "VERIFICANDO" ? "#FFC94D" : arq.fase === "DORMIDO" ? "#8A8A94" : "#7FE3FF";

  const enviarOrden = () => {
    if (orden.trim().length < 3) return;
    sfx.click();
    arq.inyectarOrden(orden);
    setOrden("");
    if (!arq.activo) arq.arrancar();
  };

  return (
    <div className="mx-auto max-w-5xl px-2 pb-14">
      <TituloEpico
        titulo="ARQUITECTO"
        volanta={t("arqui115.hero.volanta")}
        imagen=""
        escena="nucleo"
        semilla={115}
        texto={t("arqui115.hero.texto")}
        altura={200}
        tinte="luna"
        acento={ACC}
        materialLetras="matriz"
        profundidadLetras={7}
      />

      {/* ═══ CONSOLA EN VIVO — el agente trabajando delante de ti ═══ */}
      <section className="mt-5 overflow-hidden rounded-lg border bg-black/40" style={{ borderColor: `${ACC}47` }}>
        <div className="flex flex-wrap items-center gap-2 border-b px-3 py-2" style={{ borderColor: `${ACC}2E`, background: ACC_SUELVE }}>
          <Bot className="h-4 w-4" style={{ color: ACC }} />
          <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: ACC }}>{t("arqui115.consola")}</h3>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[9px] font-mono font-black tracking-widest" style={{ borderColor: `${faseColor}66`, color: faseColor, background: `${faseColor}14` }}>
            <span className={cn("inline-block h-1.5 w-1.5 rounded-full", arq.activo && "animate-pulse")} style={{ background: faseColor }} />
            {arq.fase}
          </span>
          {arq.enCurso && (
            <span className="inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[8px] font-mono font-bold tracking-wider" style={{ borderColor: `${dominioColor(arq.enCurso.dominio)}66`, color: dominioColor(arq.enCurso.dominio) }}>
              {dominioEtiqueta(arq.enCurso.dominio)}
            </span>
          )}
        </div>

        <div className="space-y-2 p-3">
          {arq.enCurso ? (
            <>
              {/* EL PROMPT QUE SE ESCRIBIÓ A SÍ MISMO */}
              <div className="rounded-sm border bg-black/50 p-2.5" style={{ borderColor: `${ACC}33` }}>
                <div className="mb-1 flex items-center gap-1.5 text-[8px] font-mono uppercase tracking-widest text-muted-foreground">
                  <Terminal className="h-3 w-3" /> {t("arqui115.autoprompt")} · ciclo #{arq.enCurso.n}
                </div>
                <p className="font-mono text-[11px] leading-relaxed" style={{ color: ACC }}>&gt; {arq.enCurso.prompt}</p>
              </div>
              {/* LAS ACCIONES APARECIENDO EN VIVO */}
              <div className="min-h-[92px] space-y-0.5 rounded-sm border bg-black/50 p-2.5 font-mono text-[10px] leading-relaxed" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                {arq.enCurso.acciones.map((a, i) => (
                  <p key={i} className={a.startsWith("▸") ? "text-foreground/85" : "text-foreground"}>{a}</p>
                ))}
                <p className="animate-pulse" style={{ color: ACC }}>█</p>
              </div>
              <p className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground">
                {arq.enCurso.ia === null ? "decidiendo motor…" : arq.enCurso.ia ? t("arqui115.motor.ia") : t("arqui115.motor.local")}
              </p>
            </>
          ) : arq.obra.length > 0 ? (
            <div className="rounded-sm border bg-black/50 p-2.5" style={{ borderColor: `${ACC}33` }}>
              <div className="mb-1 text-[8px] font-mono uppercase tracking-widest text-muted-foreground">{t("arqui115.ultimo")} · ciclo #{arq.obra[0].n} · {dominioEtiqueta(arq.obra[0].dominio)}</div>
              <p className="font-mono text-[10px] text-muted-foreground">&gt; {arq.obra[0].prompt}</p>
              <p className="mt-1 font-mono text-[11px] font-bold" style={{ color: ACC }}>{arq.obra[0].resultado}</p>
            </div>
          ) : (
            <p className="py-4 text-center font-mono text-[11px] text-muted-foreground">{t("arqui115.arranca")}</p>
          )}

          {/* CONTROLES */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <button
              onClick={() => { sfx.click(); if (arq.activo) { arq.detener(); } else { arq.arrancar(); } }}
              className={cn("inline-flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-[10px] font-black tracking-widest transition-colors")}
              style={arq.activo ? { borderColor: "#FF3B3066", color: "#FF3B30", background: "#FF3B3014" } : { borderColor: `${ACC}88`, color: "#030b07", background: ACC, boxShadow: `0 0 18px ${ACC}55` }}
              aria-pressed={arq.activo}
            >
              {arq.activo ? <><Pause className="h-3.5 w-3.5" /> {t("arqui115.pausar")}</> : <><Play className="h-3.5 w-3.5" /> {t("arqui115.arrancar")}</>}
            </button>
            <button
              onClick={() => { sfx.click(); arq.setPerpetuo(!arq.perpetuo); }}
              className="inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 text-[9px] font-mono font-bold tracking-wider"
              style={arq.perpetuo ? { borderColor: `${ACC}88`, color: ACC, background: ACC_SUELVE } : { borderColor: "rgba(255,255,255,0.14)", color: "#9CA3AF" }}
              aria-pressed={arq.perpetuo}
              title={t("arqui115.perpetuo")}
            >
              <InfIcon className="h-3.5 w-3.5" /> {t("arqui115.perpetuoCorto")} {arq.perpetuo ? "ON" : "OFF"}
            </button>
            <span className="inline-flex items-center gap-1 text-[8px] font-mono uppercase tracking-widest text-muted-foreground"><Gauge className="h-3 w-3" /> {t("arqui115.velocidad")}</span>
            {VELOCIDADES_INFO.map((v) => (
              <button key={v.id} onClick={() => { sfx.click(); arq.setVelocidad(v.id); }}
                className="rounded-sm border px-2 py-1 text-[8px] font-mono font-bold tracking-wider"
                style={arq.velocidad === v.id ? { borderColor: ACC, color: "#030b07", background: ACC } : { borderColor: "rgba(255,255,255,0.14)", color: "#9CA3AF" }}
                aria-pressed={arq.velocidad === v.id}>
                {v.etiqueta}
              </button>
            ))}
          </div>

          {/* INYECTAR ORDEN — el operador puede hablarle; el agente también trabaja sin órdenes */}
          <div className="flex gap-1.5 pt-1">
            <input
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") enviarOrden(); }}
              placeholder={t("arqui115.orden.ph")}
              maxLength={160}
              className="min-w-0 flex-1 rounded-sm border bg-black/50 px-2 py-1.5 font-mono text-[10px] outline-none placeholder:text-muted-foreground/50 focus:border-current"
              style={{ borderColor: `${ACC}33`, color: "inherit" }}
            />
            <button onClick={enviarOrden} className="inline-flex shrink-0 items-center gap-1 rounded-sm border px-2.5 py-1.5 text-[9px] font-mono font-bold tracking-wider" style={{ borderColor: `${ACC}66`, color: ACC }}>
              <Send className="h-3 w-3" /> {t("arqui115.orden.btn")}
            </button>
          </div>
        </div>
      </section>

      {/* ═══ CIFRAS DE LA OBRA ═══ */}
      <section className="mt-3 grid grid-cols-3 gap-1.5 sm:grid-cols-6">
        {([
          [Layers, c.ciclos, t("arqui115.stat.ciclos")],
          [Cpu, `${c.ia}/${c.locales}`, t("arqui115.stat.motores")],
          [Hammer, arq.modulos.length, t("arqui115.stat.modulos")],
          [Music4, arq.obras.length, t("arqui115.stat.obras")],
          [ScrollText, arq.doctrinas.length, t("arqui115.stat.doctrinas")],
          [Building2, arq.satelites.length, t("arqui115.stat.satelites")],
        ] as const).map(([Icon, val, lbl], i) => (
          <div key={i} className="rounded-md border bg-black/30 p-2 text-center" style={{ borderColor: `${ACC}2E` }}>
            <Icon className="mx-auto mb-0.5 h-3.5 w-3.5" style={{ color: ACC }} />
            <div className="text-[15px] font-black leading-none tabular-nums" style={{ color: ACC }}>{val}</div>
            <div className="mt-0.5 text-[7px] font-mono uppercase tracking-widest text-muted-foreground">{lbl}</div>
          </div>
        ))}
      </section>

      {/* ═══ MÓDULOS INSTALADOS — cada uno FUNCIONA de verdad ═══ */}
      <section className="mt-4 rounded-lg border bg-black/30 p-3" style={{ borderColor: `${ACC}47` }}>
        <h3 className="mb-2 flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: ACC }}>
          <Hammer className="h-3.5 w-3.5" /> {t("arqui115.modulos")}
        </h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {MODULOS_CATALOGO.map((cat) => {
            const inst = modulosMap.get(cat.id) as ModuloArq | undefined;
            const Widget = inst ? WIDGETS[cat.id] : null;
            return (
              <div key={cat.id} className="rounded-md border p-2.5" style={inst ? { borderColor: `${ACC}47`, background: ACC_SUELVE } : { borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                <div className="mb-1.5 flex items-center gap-2">
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", inst && "animate-pulse")} style={{ background: inst ? ACC : "rgba(255,255,255,0.18)", boxShadow: inst ? `0 0 8px ${ACC}` : undefined }} />
                  <span className="text-[10px] font-mono font-black tracking-wider" style={{ color: inst ? ACC : "#9CA3AF" }}>{cat.nombre}</span>
                  {inst ? (
                    <span className="ml-auto rounded-sm border px-1.5 py-0.5 text-[7px] font-mono font-black" style={{ borderColor: `${ACC}66`, color: ACC }}>v{inst.ver}</span>
                  ) : (
                    <span className="ml-auto text-[7px] font-mono uppercase tracking-widest text-muted-foreground/60">{t("arqui115.proyectado")}</span>
                  )}
                </div>
                {Widget && visto ? (
                  <Widget obra={obraDatos} />
                ) : (
                  <p className="text-[9px] font-mono leading-snug text-muted-foreground">{inst ? inst.desc : `${t("arqui115.plano")}: ${cat.desc}`}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ OBRAS COMPUESTAS — suenan de verdad AQUÍ MISMO (v117) ═══ */}
      {arq.obras.length > 0 && (
        <section className="mt-3 rounded-lg border bg-black/30 p-3" style={{ borderColor: "#FF5EDB47" }}>
          <h3 className="mb-2 flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: "#FF5EDB" }}>
            <Music4 className="h-3.5 w-3.5" /> {t("arqui115.obras")}
            <span className="rounded-sm border px-1.5 py-0.5 text-[7px] font-black" style={{ borderColor: "#FF5EDB66", color: "#FF5EDB" }}>{t("arqui117.obra.sello")}</span>
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {arq.obras.map((o) => (
              <button
                key={o.id}
                onClick={() => escucharObra(o.id, o.patron)}
                title={t("arqui117.obra.escuchar")}
                className="inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 text-[9px] font-mono font-bold tracking-wider transition-colors"
                style={{
                  borderColor: obraSonando === o.id ? "#FF5EDB" : "#FF5EDB55",
                  color: "#FF5EDB",
                  background: obraSonando === o.id ? "rgba(255,94,219,0.22)" : "rgba(255,94,219,0.08)",
                  boxShadow: obraSonando === o.id ? "0 0 14px -4px #FF5EDB88" : undefined,
                }}
              >
                {obraSonando === o.id ? <Square className="h-2.5 w-2.5" /> : <Volume2 className="h-2.5 w-2.5" />}
                {o.titulo} · {o.voz} · {o.bpm} BPM
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[8px] font-mono uppercase tracking-widest text-muted-foreground">{t("arqui117.obra.hint")}</p>
        </section>
      )}

      {/* ═══ DOCTRINAS FIRMADAS ═══ */}
      {arq.doctrinas.length > 0 && (
        <section className="mt-3 rounded-lg border bg-black/30 p-3" style={{ borderColor: "#FFC94D47" }}>
          <h3 className="mb-2 flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: "#FFC94D" }}>
            <ScrollText className="h-3.5 w-3.5" /> {t("arqui115.doctrinas")}
          </h3>
          <div className="space-y-2">
            {arq.doctrinas.slice(0, 3).map((d) => (
              <div key={d.id} className="rounded-md border p-2.5" style={{ borderColor: "rgba(255,201,77,0.25)", background: "rgba(255,201,77,0.05)" }}>
                <div className="text-[10px] font-mono font-black tracking-wider" style={{ color: "#FFC94D" }}>{d.titulo}</div>
                <p className="mt-1 text-[11px] leading-relaxed text-foreground/85">{d.cuerpo}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══ SALAS SATÉLITE FUNDADAS — ahora se ENTRAN (v117) ═══ */}
      {arq.satelites.length > 0 && (
        <section className="mt-3 rounded-lg border bg-black/30 p-3" style={{ borderColor: "#B48CFF47" }}>
          <h3 className="mb-2 flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: "#B48CFF" }}>
            <Building2 className="h-3.5 w-3.5" /> {t("arqui115.satelites")}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {arq.satelites.map((s) => (
              <button
                key={s.id}
                onClick={() => { sfx.click(); navigateTo(salaDeSatelite(s.id) as Parameters<typeof navigateTo>[0]); }}
                title={`${s.lema} — ${t("arqui117.sat.entrar")}`}
                className="group inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 text-[9px] font-mono tracking-wider transition-colors"
                style={{ borderColor: "#B48CFF55", color: "#B48CFF", background: "rgba(180,140,255,0.08)" }}
              >
                {s.nombre} <span className="text-muted-foreground">«{s.lema}»</span>
                <span className="rounded-sm border px-1 text-[7px] font-black opacity-70 transition-opacity group-hover:opacity-100" style={{ borderColor: "#B48CFF77" }}>
                  {t("arqui117.sat.entrar")} →
                </span>
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[8px] font-mono uppercase tracking-widest text-muted-foreground">{t("arqui117.sat.hint")}</p>
        </section>
      )}

      {/* ═══ LA OBRA COMPLETA — bitácora eterna + ARCHIVO EXPORTABLE (v117) ═══ */}
      <section className="mt-3 rounded-lg border bg-black/30 p-3" style={{ borderColor: `${ACC}47` }}>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: ACC }}>
            <RadarIcon className="h-3.5 w-3.5" /> {t("arqui115.bitacora")}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground">{arq.obra.length} {t("arqui115.ciclosCount")}</span>
            {arq.activo && arq.perpetuo && <span className="hidden items-center gap-1 text-[8px] font-mono font-bold uppercase tracking-widest sm:inline-flex" style={{ color: ACC }}><Zap className="h-3 w-3 animate-pulse" /> {t("arqui115.trabajando")}</span>}
          </div>
        </div>
        {/* v117 MEMORIA VISIBLE: el archivo completo del agente, descargable */}
        {arq.obra.length > 0 && (
          <div className="mb-2 flex flex-wrap items-center gap-2 rounded-sm border px-2.5 py-2" style={{ borderColor: `${ACC}33`, background: ACC_SUELVE }}>
            <Download className="h-3.5 w-3.5 shrink-0" style={{ color: ACC }} />
            <p className="min-w-0 flex-1 font-mono text-[9px] leading-snug text-muted-foreground">
              {t("arqui117.archivo.txt", { ciclos: arq.contadores.ciclos, motores: arq.contadores.ia + arq.contadores.locales, modulos: arq.modulos.length })}
            </p>
            <button
              onClick={exportarArchivo}
              className="inline-flex shrink-0 items-center gap-1 rounded-sm border px-2 py-1 text-[9px] font-mono font-bold tracking-wider transition-colors"
              style={{ borderColor: `${ACC}66`, color: ACC }}
            >
              <Download className="h-3 w-3" /> {archivoOk ? t("arqui117.archivo.ok") : t("arqui117.archivo.btn")}
            </button>
          </div>
        )}
        {arq.obra.length === 0 ? (
          <p className="py-3 text-center font-mono text-[10px] text-muted-foreground">{t("arqui115.bitacora.vacia")}</p>
        ) : (
          <div className="max-h-[420px] space-y-1.5 overflow-y-auto pr-1">
            {arq.obra.map((ciclo) => (
              <div key={ciclo.n} className="rounded-sm border bg-black/40 p-2" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[8px] font-mono font-black tabular-nums" style={{ color: ACC }}>#{ciclo.n}</span>
                  <span className="rounded-sm px-1 py-0.5 text-[7px] font-mono font-bold tracking-wider" style={{ background: `${dominioColor(ciclo.dominio)}1E`, color: dominioColor(ciclo.dominio) }}>{dominioEtiqueta(ciclo.dominio)}</span>
                  <span className="text-[7px] font-mono uppercase tracking-widest text-muted-foreground">{ciclo.ia ? "IA REAL" : "EMBEDIDO"} · {(ciclo.ms / 1000).toFixed(1)}s</span>
                </div>
                <p className="mt-1 font-mono text-[9px] leading-relaxed text-muted-foreground">&gt; {ciclo.prompt}</p>
                <p className="font-mono text-[10px] leading-relaxed" style={{ color: ACC }}>{ciclo.resultado}</p>
              </div>
            ))}
          </div>
        )}
        {arq.obra.length > 0 && (
          <div className="mt-2 border-t pt-2 text-right" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <button onClick={() => { sfx.click(); arq.reiniciarObra(); }} className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground/60 hover:text-red-400">
              {t("arqui115.borrar")}
            </button>
          </div>
        )}
      </section>

      {/* cero imágenes: el acento y las cifras sellan la sala */}
      <div className="mt-3 flex items-center justify-between">
        <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-muted-foreground/50">W115 · {t("arqui115.sello")}</span>
        <SelloVivo acento={ACC} etiqueta="OBRA VIVA" />
      </div>
    </div>
  );
}

// ============================================================
// MOTOR GLOBAL DEL ARQUITECTO — se monta SIEMPRE en page.tsx:
// mantiene viva la cadena del MODO PERPETUO aunque navegues por
// cualquier otra sala de la casa. No pinta nada (cero coste).
// ============================================================
export function MotorArquitecto() {
  const activo = useArquitecto((s) => s.activo);
  const perpetuo = useArquitecto((s) => s.perpetuo);
  const velocidad = useArquitecto((s) => s.velocidad);
  useEffect(() => {
    if (activo && perpetuo) reanudarArquitecto();
  }, [activo, perpetuo, velocidad]);
  return null;
}

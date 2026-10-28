"use client";

// v179.0 VG-ASSIST — EL AGENTE DE VOZ DE VANGUARD (el Siri de la Casa).
// Un orbe que vive en toda la app: pulsa y HABLA, Vanguard obedece.
//  · OÍDO: Web Speech API del navegador (gratis, en el aparato) — es-ES y los 8 idiomas
//  · CEREBRO: /api/asistente (LLM con whitelist real de salas + red determinista)
//  · MANOS: CustomEvent «vg:asistente-accion» → page.tsx navega / abre paleta / menú
//  · BOCA: speechSynthesis del aparato (voz del idioma del piloto, rápida)
// Honestidad de acero: sin micrófono o sin permiso → modo TEXTO con aviso real.
// El panel también acepta órdenes escritas: el agente nunca se queda mudo.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Mic, X, Send, Loader2, Volume2 } from "lucide-react";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
// v191 EL CONSEJO DE VOCES — VG-ASSIST y el CENTINELA con voz PROPIA
import { hablarAgente } from "@/lib/voces-agentes";

// ── tipos mínimos de la Web Speech API (sin @types externos) ──
interface SRResultadoItem {
  transcript: string;
  confidence: number;
}
interface SRResultado {
  isFinal: boolean;
  length: number;
  [i: number]: SRResultadoItem;
}
interface SREvento {
  resultIndex: number;
  results: { length: number; [i: number]: SRResultado };
}
interface SRError {
  error: string;
}
interface Reconocedor {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SREvento) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: SRError) => void) | null;
}
type ConstructorSR = new () => Reconocedor;

function ctorSR(): ConstructorSR | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: ConstructorSR;
    webkitSpeechRecognition?: ConstructorSR;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

const LANG_SR: Record<string, string> = {
  es: "es-ES", en: "en-US", pt: "pt-BR", fr: "fr-FR",
  de: "de-DE", it: "it-IT", ru: "ru-RU", zh: "zh-CN",
};

// ── textos propios del agente (dict local: 8 idiomas, cero riesgo en i18n.ts) ──
const TXT = {
  llave: {
    es: "VG-ASSIST", en: "VG-ASSIST", pt: "VG-ASSIST", fr: "VG-ASSIST", de: "VG-ASSIST", it: "VG-ASSIST", ru: "VG-ASSIST", zh: "VG-ASSIST",
  } as Record<string, string>,
  escucha: {
    es: "Te escucho, piloto…", en: "Listening, pilot…", pt: "Estou a ouvir, piloto…", fr: "Je vous écoute, pilote…",
    de: "Ich höre, Pilot…", it: "Ti ascolto, pilota…", ru: "Слушаю, пилот…", zh: "我在听，飞行员…",
  } as Record<string, string>,
  piensa: {
    es: "Interpretando la orden…", en: "Interpreting the order…", pt: "A interpretar a ordem…", fr: "Interprétation de l'ordre…",
    de: "Befehl wird gedeutet…", it: "Interpreto l'ordine…", ru: "Разбираю приказ…", zh: "正在解析指令…",
  } as Record<string, string>,
  micNo: {
    es: "Este navegador no tiene micrófono de voz — usa la orden escrita de abajo.",
    en: "This browser has no speech input — use the typed order below.",
    pt: "Este navegador não tem voz — usa a ordem escrita abaixo.",
    fr: "Ce navigateur n'a pas de voix — utilise l'ordre écrite ci-dessous.",
    de: "Dieser Browser hat keine Spracheingabe — nutze den Befehl unten.",
    it: "Questo browser non ha la voce — usa l'ordine scritto qui sotto.",
    ru: "Этот браузер без голоса — используйте письменный приказ ниже.",
    zh: "此浏览器不支持语音 — 请使用下方文字指令。",
  } as Record<string, string>,
  micDenegado: {
    es: "Permiso de micrófono denegado — ábrelo en el candado del navegador o escribe la orden.",
    en: "Microphone permission denied — allow it in the browser lock or type the order.",
    pt: "Permissão de microfone negada — autoriza no cadeado ou escreve a ordem.",
    fr: "Micro refusé — autorise-le dans le cadenas ou écris l'ordre.",
    de: "Mikrofon verweigert — im Schloss erlauben oder Befehl tippen.",
    it: "Microfono negato — consenti dal lucchetto o scrivi l'ordine.",
    ru: "Доступ к микрофону запрещён — разрешите в замке браузера или напишите приказ.",
    zh: "麦克风权限被拒绝 — 请在浏览器锁中允许或输入文字指令。",
  } as Record<string, string>,
  red: {
    es: "El cerebro no respondió — inténtalo de nuevo.",
    en: "The brain did not respond — try again.",
    pt: "O cérebro não respondeu — tenta de novo.",
    fr: "Le cerveau n'a pas répondu — réessaie.",
    de: "Das Gehirn antwortete nicht — nochmal versuchen.",
    it: "Il cervello non ha risposto — riprova.",
    ru: "Мозг не ответил — попробуйте снова.",
    zh: "大脑没有响应 — 请重试。",
  } as Record<string, string>,
  chipLeer: {
    es: "LÉEME EL MUNDO", en: "READ THE WORLD", pt: "LÊ O MUNDO", fr: "LIS LE MONDE",
    de: "LIES DIE WELT", it: "LEGGI IL MONDO", ru: "ПРОЧТИ МИР", zh: "读世界",
  } as Record<string, string>,
  chipFicha: {
    es: "FICHA UCRAINA", en: "UKRAINE CARD", pt: "CARTÃO UCRÂNIA", fr: "FICHE UKRAINE",
    de: "KARTE UKRAINE", it: "CARTA UCRAINA", ru: "КАРТА УКРАИНЫ", zh: "乌克兰卡",
  } as Record<string, string>,
  chipVozOn: {
    es: "VOZ DE ALERTAS: ON", en: "ALERT VOICE: ON", pt: "VOZ DE ALERTAS: ON", fr: "VOIX D'ALERTE: ON",
    de: "ALARMSTIMME: AN", it: "VOCE ALLERTE: ON", ru: "ГОЛОС ТРЕВОГИ: ВКЛ", zh: "警报语音: 开",
  } as Record<string, string>,
  chipVozOff: {
    es: "VOZ DE ALERTAS: OFF", en: "ALERT VOICE: OFF", pt: "VOZ DE ALERTAS: OFF", fr: "VOIX D'ALERTE: OFF",
    de: "ALARMSTIMME: AUS", it: "VOCE ALLERTE: OFF", ru: "ГОЛОС ТРЕВОГИ: ВЫКЛ", zh: "警报语音: 关",
  } as Record<string, string>,
  placeholder: {
    es: "o escribe la orden… (ej: abre fichas)", en: "or type the order… (e.g. open fichas)",
    pt: "ou escreve a ordem…", fr: "ou écris l'ordre…", de: "oder Befehl tippen…",
    it: "o scrivi l'ordine…", ru: "или напишите приказ…", zh: "或输入指令…",
  } as Record<string, string>,
};

type Estado = "dormido" | "escuchando" | "pensando" | "hablando";

export function AsistenteVoz() {
  const { lang } = useT();
  const [portalReady, setPortalReady] = useState(false);
  const [oculto, setOculto] = useState(false);
  const [estado, setEstado] = useState<Estado>("dormido");
  const [parcial, setParcial] = useState(""); // transcripción en vivo
  const [respuesta, setRespuesta] = useState(""); // lo que el agente dice
  const [aviso, setAviso] = useState(""); // errores honestos
  const [escrito, setEscrito] = useState("");
  const [abierto, setAbierto] = useState(false); // panel desplegado
  // v180: briefing del centro mundial (los cables reales que el agente leyó)
  const [briefing, setBriefing] = useState<{ titulo: string; pais: string; impacto: number; tier: string; edad?: string }[]>([]);
  // v180: voz de las alertas del Centinela (ON por defecto, honesta: se puede callar)
  const [vozAlertas, setVozAlertas] = useState(true);

  const reconRef = useRef<Reconocedor | null>(null);
  const estadoRef = useRef<Estado>("dormido");
  const tabRef = useRef<string>("inicio");

  useEffect(() => {
    // patrón verificado: setState síncrono en effect → setTimeout(0)
    const t = setTimeout(() => setPortalReady(true), 0);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        if (sessionStorage.getItem("vg179-asistente-oculto") === "1") setOculto(true);
        if (localStorage.getItem("vg180-voz-alertas") === "0") setVozAlertas(false);
      } catch {}
    }, 0);
    return () => clearTimeout(t);
  }, []);
  // la pestaña actual va en el paquete (contexto del piloto)
  useEffect(() => {
    const lee = (e: Event) => {
      const d = (e as CustomEvent<{ tab?: string }>).detail || {};
      if (d.tab) tabRef.current = d.tab;
    };
    window.addEventListener("vg:asistente-contexto", lee);
    return () => window.removeEventListener("vg:asistente-contexto", lee);
  }, []);

  const tieneVoz = useMemo(() => ctorSR() !== null, []);

  // ── BOCA: habla la respuesta con la voz PROPIA de VG-ASSIST (v191 —
  //    antes: rate 1.18 con la primera voz del aparato, apresurada y
  //    robótica; ahora el Consejo de Voces le da identidad clara y humana) ──
  const hablar = useCallback((texto: string) => {
    if (!texto) return;
    estadoRef.current = "hablando";
    setEstado("hablando");
    hablarAgente("assist", texto, {
      onend: () => { estadoRef.current = "dormido"; setEstado("dormido"); },
      onerror: () => { estadoRef.current = "dormido"; setEstado("dormido"); },
    });
  }, []);

  // ── CEREBRO → MANOS: manda el texto y ejecuta la acción que vuelva ──
  const despachar = useCallback(async (texto: string) => {
    const limpio = texto.trim().slice(0, 300);
    if (!limpio) return;
    setParcial("");
    setAviso("");
    setRespuesta("");
    setBriefing([]);
    estadoRef.current = "pensando";
    setEstado("pensando");
    try {
      const r = await fetch("/api/asistente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: limpio, lang, tab: tabRef.current }),
      });
      const j = (await r.json()) as {
        hablar?: string;
        accion?: { tipo?: string; destino?: string; consulta?: string };
        briefing?: { titulo: string; pais: string; impacto: number; tier: string; edad?: string }[];
        error?: string;
      };
      if (!r.ok || j.error) {
        setAviso(j.error || TXT.red[lang] || TXT.red.es);
        estadoRef.current = "dormido";
        setEstado("dormido");
        return;
      }
      const accion = j.accion || { tipo: "hablar" };
      setRespuesta(j.hablar || "");
      if (j.briefing?.length) setBriefing(j.briefing); // v180: el panel muestra los cables reales
      // MANOS: la Casa obedece ANTES de hablar (la voz confirma lo que ya ves)
      try {
        window.dispatchEvent(new CustomEvent("vg:asistente-accion", { detail: accion }));
      } catch {}
      hablar(j.hablar || "");
    } catch {
      setAviso(TXT.red[lang] || TXT.red.es);
      estadoRef.current = "dormido";
      setEstado("dormido");
    }
  }, [lang, hablar]);

  // ── OÍDO: reconocimiento de voz nativo ──
  const escuchar = useCallback(() => {
    const Ctor = ctorSR();
    if (!Ctor) {
      setAviso(TXT.micNo[lang] || TXT.micNo.es);
      setAbierto(true);
      return;
    }
    // si está hablando, corta la boca y vuelve a escuchar (interrupción tipo Siri)
    try { window.speechSynthesis?.cancel(); } catch {}
    try { reconRef.current?.abort(); } catch {}

    const r = new Ctor();
    reconRef.current = r;
    r.lang = LANG_SR[lang] || "es-ES";
    r.continuous = false;
    r.interimResults = true;
    r.maxAlternatives = 1;
    setParcial("");
    setAviso("");
    setRespuesta("");
    setAbierto(true);
    estadoRef.current = "escuchando";
    setEstado("escuchando");

    r.onresult = (e: SREvento) => {
      let final = "";
      let enVivo = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) final += res[0].transcript;
        else enVivo += res[0].transcript;
      }
      if (enVivo) setParcial(enVivo);
      if (final.trim()) {
        setParcial(final.trim());
        try { r.stop(); } catch {}
        void despachar(final.trim());
      }
    };
    r.onerror = (e: SRError) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setAviso(TXT.micDenegado[lang] || TXT.micDenegado.es);
      } else if (e.error === "no-speech") {
        setAviso(lang === "es" ? "No te oí. Pulsa y habla de nuevo." : "No speech caught. Tap and try again.");
      } else if (e.error !== "aborted") {
        setAviso(TXT.red[lang] || TXT.red.es);
      }
      estadoRef.current = "dormido";
      setEstado("dormido");
    };
    r.onend = () => {
      // si terminó de escuchar sin resultado y sin pensamiento, duerme
      if (estadoRef.current === "escuchando") {
        estadoRef.current = "dormido";
        setEstado("dormido");
      }
    };
    try { r.start(); } catch {
      estadoRef.current = "dormido";
      setEstado("dormido");
    }
  }, [lang, despachar]);

  // contexto del piloto + ANUNCIOS DEL CENTINELA (v180: las noticias te buscan)
  useEffect(() => {
    const anuncia = (e: Event) => {
      const d = (e as CustomEvent<{ texto?: string; auto?: boolean }>).detail || {};
      if (!d.texto) return;
      setRespuesta(d.texto);
      setBriefing([]);
      // v191: la boca del radar tiene voz PROPIA — grave, de CENTINELA
      hablarAgente("centinela", d.texto); // el cable URGENTE se anuncia solo
    };
    window.addEventListener("vg:asistente-anunciar", anuncia);
    return () => window.removeEventListener("vg:asistente-anunciar", anuncia);
  }, [hablar]);

  const ocultar = useCallback(() => {
    try { sessionStorage.setItem("vg179-asistente-oculto", "1"); } catch {}
    try { reconRef.current?.abort(); } catch {}
    try { window.speechSynthesis?.cancel(); } catch {}
    setOculto(true);
  }, []);

  if (!portalReady || oculto) return null;

  const etiquetaEstado =
    estado === "escuchando" ? (TXT.escucha[lang] || TXT.escucha.es)
    : estado === "pensando" ? (TXT.piensa[lang] || TXT.piensa.es)
    : estado === "hablando" ? (respuesta || "")
    : (parcial || "");

  return createPortal(
    <div
      className="fixed z-[47] right-3 bottom-[calc(84px+env(safe-area-inset-bottom,0px))] sm:right-5 sm:bottom-5"
      data-vg-asistente
    >
      {/* PANEL del agente (encima del orbe) */}
      {abierto && (
        <div
          className="absolute bottom-[74px] right-0 w-[min(88vw,320px)] rounded-2xl border border-amber-hud/35 bg-[rgba(11,11,18,0.94)] backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.6)] overflow-hidden vg179-panel"
          role="dialog"
          aria-label={TXT.llave[lang] || TXT.llave.es}
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-amber-hud/20">
            <div className="flex items-center gap-2">
              <span className={cn("w-2 h-2 rounded-full", estado === "dormido" ? "bg-muted-foreground" : "bg-green-hud blink-soft")} />
              <span className="font-mono text-[11px] tracking-[0.18em] text-amber">{TXT.llave[lang] || TXT.llave.es}</span>
            </div>
            <button
              onClick={() => setAbierto(false)}
              className="p-1 rounded hover:bg-white/5 text-muted-foreground hover:text-foreground"
              aria-label="Cerrar panel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="px-3 py-2.5 min-h-[64px] max-h-[150px] overflow-y-auto">
            {/* lo que DICES (en vivo) o la ÚLTIMA orden */}
            {(parcial || estado === "escuchando") && (
              <p className="text-[13px] leading-snug text-foreground/90 font-medium">{etiquetaEstado || TXT.escucha[lang]}</p>
            )}
            {respuesta && estado !== "escuchando" && (
              <p className={cn("text-[13px] leading-snug flex gap-1.5", estado === "hablando" ? "text-green-hud" : "text-muted-foreground")}>
                <Volume2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{respuesta}</span>
              </p>
            )}
            {estado === "pensando" && (
              <p className="text-[13px] text-amber-hud/90 flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> {TXT.piensa[lang]}
              </p>
            )}
            {aviso && <p className="text-[12px] leading-snug text-red-400/90">{aviso}</p>}
            {!parcial && !respuesta && !aviso && estado === "dormido" && (
              <p className="text-[13px] text-muted-foreground">
                {tieneVoz ? TXT.escucha[lang] : TXT.micNo[lang]}
              </p>
            )}
            {/* v180: los cables REALES del briefing (el mundo leído por el agente) */}
            {briefing.length > 0 && (
              <ul className="mt-1.5 space-y-1 border-t border-amber-hud/15 pt-1.5">
                {briefing.slice(0, 4).map((b, i) => (
                  <li key={i} className="text-[11px] leading-snug flex gap-1.5 items-start">
                    <span className={cn("shrink-0 font-mono font-bold px-1 rounded", Number(b.impacto) >= 80 ? "text-red-400" : Number(b.impacto) >= 64 ? "text-amber" : "text-muted-foreground")}>
                      {b.impacto}
                    </span>
                    <span className="text-foreground/85"><b className="text-amber/90">{b.pais}</b> — {b.titulo}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* v181: comandos rápidos de los poderes nuevos + interruptor honesto de las alertas */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 border-t border-amber-hud/15">
            <button
              onClick={() => void despachar(lang === "es" ? "léeme las noticias" : "read me the news")}
              className="flex-1 min-w-0 px-2 py-1 rounded-lg border border-green-hud/30 bg-green-hud/5 text-[10px] font-mono tracking-wide text-green-hud hover:bg-green-hud/15 truncate"
              aria-label="Pedir briefing del mundo por voz"
            >
              {TXT.chipLeer[lang] || TXT.chipLeer.es}
            </button>
            <button
              onClick={() => void despachar(lang === "es" ? "muéstrame la ficha de Ucrania" : "show me the Ukraine card")}
              className="flex-1 min-w-0 px-2 py-1 rounded-lg border border-violet-400/30 bg-violet-400/5 text-[10px] font-mono tracking-wide text-violet-300 hover:bg-violet-400/15 truncate"
              aria-label="Abrir la ficha de Ucrania de la colección por voz"
            >
              {TXT.chipFicha[lang] || TXT.chipFicha.es}
            </button>
            <button
              onClick={() => {
                const nv = !vozAlertas;
                setVozAlertas(nv);
                try { localStorage.setItem("vg180-voz-alertas", nv ? "1" : "0"); } catch {}
              }}
              className={cn(
                "shrink-0 px-2 py-1 rounded-lg border text-[10px] font-mono tracking-wide",
                vozAlertas ? "border-amber-hud/40 text-amber hover:bg-amber-hud/10" : "border-muted-foreground/30 text-muted-foreground hover:bg-white/5"
              )}
              aria-label="Activar o silenciar la voz de las alertas automáticas"
              title={vozAlertas ? "El radar habla — toca para silenciarlo" : "El radar está mudo — toca para despertar su voz"}
            >
              {(vozAlertas ? TXT.chipVozOn : TXT.chipVozOff)[lang] || (vozAlertas ? TXT.chipVozOn.es : TXT.chipVozOff.es)}
            </button>
          </div>

          {/* orden escrita: el agente NUNCA se queda mudo */}
          <form
            className="flex items-center gap-1.5 px-2.5 py-2 border-t border-amber-hud/20"
            onSubmit={(e) => {
              e.preventDefault();
              const v = escrito.trim();
              if (!v) return;
              setEscrito("");
              void despachar(v);
            }}
          >
            <input
              value={escrito}
              onChange={(e) => setEscrito(e.target.value)}
              placeholder={TXT.placeholder[lang] || TXT.placeholder.es}
              className="flex-1 min-w-0 bg-black/30 border border-amber-hud/25 rounded-lg px-2.5 py-1.5 text-[12px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-amber-hud/50"
              aria-label="Orden escrita para VG-ASSIST"
            />
            <button
              type="submit"
              className="shrink-0 p-1.5 rounded-lg border border-amber-hud/30 text-amber hover:bg-amber-hud/10"
              aria-label="Enviar orden"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* ORBE — el botón Siri de Vanguard */}
      <button
        onClick={() => (estado === "escuchando" ? (reconRef.current?.stop(), setAbierto(true)) : escuchar())}
        onDoubleClick={() => setAbierto((v) => !v)}
        className={cn(
          "relative block w-[58px] h-[58px] rounded-full vg179-orbe select-none touch-manipulation",
          estado !== "dormido" && "vg179-orbe-activo"
        )}
        aria-label="VG-ASSIST: agente de voz de Vanguard. Toca y habla."
        title={estado === "escuchando" ? "Escuchando… (toca para parar)" : "VG-ASSIST · toca y habla"}
      >
        {/* anillos de escucha */}
        {estado === "escuchando" && (
          <>
            <span className="vg179-onda vg179-onda-1" aria-hidden />
            <span className="vg179-onda vg179-onda-2" aria-hidden />
          </>
        )}
        {/* núcleo con gradiente vivo (Siri de la Casa: ámbar + verde HUD) */}
        <span className="vg179-nucleo" aria-hidden>
          <span className="vg179-nucleo-gira" aria-hidden />
        </span>
        <span className="absolute inset-0 grid place-items-center pointer-events-none">
          {estado === "pensando" ? (
            <Loader2 className="w-5 h-5 text-amber animate-spin" />
          ) : estado === "hablando" ? (
            <span className="vg179-barras" aria-hidden>
              <i /><i /><i /><i /><i />
            </span>
          ) : (
            <Mic className={cn("w-5 h-5 relative z-10", estado === "escuchando" ? "text-black/85" : "text-amber")} />
          )}
        </span>
      </button>
    </div>,
    document.body // v116: portal al body — ni el HUD ni los widgets lo atrapan
  );
}

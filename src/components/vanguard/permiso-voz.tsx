"use client";

// ============================================================
// v201.0 LA VOZ VIVA — EL PERMISO DE HABLAR
// La tarjeta que el Dueño pidió: «vanguard te de una notificación
// para darle permiso de hablar». Qué hace y por qué ASÍ:
//  · Los navegadores BLOQUEAN la síntesis de voz hasta que la
//    persona toca la pantalla (política de autoplay). Sin esta
//    tarjeta, el Centinela intentaba hablar y el aparato lo
//    callaba sin decir por qué — la primera alerta se perdía.
//  · La tarjeta sale UNA vez, con calma (5s tras entrar) o AL
//    INSTANTE si llega la primera alerta urgente (evento
//    vg:pide-permiso-hablar, mandado por VG-ASSIST).
//  · ACTIVAR LA VOZ = el toque que abre la boca del aparato:
//    VG-ASSIST saluda con voz real y desde ahí el radar narra
//    alertas, noticias y salidas de la casa.
//  · MANTENER EN SILENCIO = respeto total: no vuelve a preguntar
//    sola. Se reactiva cuando la persona quiera (panel del orbe).
//  · Guardado honesto en el aparato (vg201-permiso-hablar), con
//    evento vg:permiso-hablar para que toda la casa lo sepa.
// Ley v189 intacta: esta tarjeta JAMÁS bloquea la casa — es un
// aviso aparte, sin cortina, sin espera forzada, se cierra sola
// a los 45s si nadie la toca.
// ============================================================

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Volume2, VolumeX, X } from "lucide-react";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  darPermisoHablar,
  hablarAgente,
  leerPermisoHablar,
  negarPermisoHablar,
  puedeHablarSolo,
  type PermisoHablar,
} from "@/lib/voces-agentes";

// textos locales (8 idiomas — mismo patrón que el orbe: cero riesgo en i18n.ts)
const TXT = {
  titulo: {
    es: "VANGUARD QUIERE HABLAR", en: "VANGUARD WANTS TO SPEAK", pt: "VANGUARD QUER FALAR",
    fr: "VANGUARD VEUT PARLER", de: "VANGUARD WILL SPRECHEN", it: "VANGUARD VUOLE PARLARE",
    ru: "VANGUARD ХОЧЕТ ГОВОРИТЬ", zh: "VANGUARD 想要开口",
  } as Record<string, string>,
  cuerpo: {
    es: "Activa la voz y Vanguard te narrará el mundo: alertas urgentes del radar, las noticias del momento y tu agente VG-ASSIST respondiendo en voz alta.",
    en: "Enable the voice and Vanguard will narrate the world: urgent radar alerts, breaking news and your VG-ASSIST agent answering out loud.",
    pt: "Ative a voz e a Vanguard narrará o mundo: alertas urgentes do radar, notícias do momento e teu agente VG-ASSIST respondendo em voz alta.",
    fr: "Activez la voix et Vanguard narrera le monde : alertes urgentes du radar, actualités et votre agent VG-ASSIST qui répond à voix haute.",
    de: "Aktiviere die Stimme und Vanguard erzählt die Welt: dringende Radar-Alarme, Nachrichten und dein VG-ASSIST-Agent, der laut antwortet.",
    it: "Attiva la voce e Vanguard ti racconterà il mondo: allerte urgenti del radar, notizie e il tuo agente VG-ASSIST che risponde ad alta voce.",
    ru: "Включите голос — и Vanguard будет рассказывать о мире: срочные тревоги радара, новости и ваш агент VG-ASSIST, отвечающий вслух.",
    zh: "开启语音后，Vanguard 将为你播报世界：雷达紧急警报、最新新闻，以及大声回答你的 VG-ASSIST 助手。",
  } as Record<string, string>,
  activar: {
    es: "ACTIVAR LA VOZ", en: "ENABLE THE VOICE", pt: "ATIVAR A VOZ", fr: "ACTIVER LA VOIX",
    de: "STIMME AKTIVIEREN", it: "ATTIVA LA VOCE", ru: "ВКЛЮЧИТЬ ГОЛОС", zh: "开启语音",
  } as Record<string, string>,
  silencio: {
    es: "MANTENER EN SILENCIO", en: "KEEP IT SILENT", pt: "MANTER EM SILÊNCIO", fr: "GARDER LE SILENCE",
    de: "STUMM LASSEN", it: "MANTIENI SILENZIO", ru: "ОСТАВИТЬ ТИШИНУ", zh: "保持静音",
  } as Record<string, string>,
  saludo: {
    es: "Permiso concedido, comandante. Ya puedo hablarte: pídeme las noticias, el mapa o las banderas. Estaré atenta a cada alerta del radar.",
    en: "Permission granted, commander. I can speak now: ask me for the news, the map or the flags. I'll be watching every radar alert.",
    pt: "Permissão concedida, comandante. Já posso falar: pede-me as notícias, o mapa ou as bandeiras. Estarei atenta a cada alerta.",
    fr: "Permission accordée, commandant. Je peux parler : demandez-moi les actualités, la carte ou les drapeaux. Je surveille chaque alerte.",
    de: "Erlaubnis erteilt, Kommandant. Ich kann sprechen: Frag mich nach Nachrichten, Karte oder Flaggen. Ich achte auf jeden Alarm.",
    it: "Permesso concesso, comandante. Posso parlare: chiedimi le notizie, la mappa o le bandiere. Veglio su ogni allerta.",
    ru: "Разрешение получено, командир. Теперь я могу говорить: спросите новости, карту или флаги. Слежу за каждой тревогой.",
    zh: "权限已授予，指挥官。我现在可以说话了：向我索要新闻、地图或旗帜。我会留意每一条警报。",
  } as Record<string, string>,
  saludoAlerta: {
    es: "Permiso concedido. Y ya llega la primera alerta del radar:",
    en: "Permission granted. And here comes the first radar alert:",
    pt: "Permissão concedida. E já chega o primeiro alerta do radar:",
    fr: "Permission accordée. Et voici la première alerte du radar :",
    de: "Erlaubnis erteilt. Und da kommt der erste Radar-Alarm:",
    it: "Permesso concesso. E arriva la prima allerta del radar:",
    ru: "Разрешение получено. И приходит первая тревога радара:",
    zh: "权限已授予。雷达的第一条警报来了：",
  } as Record<string, string>,
};

const EVENTO_PIDE = "vg:pide-permiso-hablar";

export function PermisoVoz() {
  const { lang } = useT();
  const [portalReady, setPortalReady] = useState(false);
  const [permiso, setPermiso] = useState<PermisoHablar>("sin-responder");
  const [visible, setVisible] = useState(false);
  const pendienteRef = useRef<string | null>(null); // alerta que pidió la boca

  useEffect(() => {
    const t = setTimeout(() => setPortalReady(true), 0);
    return () => clearTimeout(t);
  }, []);

  // lee el permiso del aparato y, si nadie respondió aún, sale con calma (5s)
  useEffect(() => {
    const t = setTimeout(() => {
      const p = leerPermisoHablar();
      setPermiso(p);
      if (p === "sin-responder") setVisible(true);
    }, 5000);
    return () => clearTimeout(t);
  }, []);

  // la primera alerta urgente acelera la pregunta (y queda pendiente de oírse)
  useEffect(() => {
    const pide = (e: Event) => {
      const d = (e as CustomEvent<{ texto?: string }>).detail || {};
      if (d.texto && !pendienteRef.current) pendienteRef.current = d.texto.slice(0, 300);
      setPermiso(leerPermisoHablar());
      if (leerPermisoHablar() === "sin-responder") setVisible(true);
    };
    window.addEventListener(EVENTO_PIDE, pide);
    return () => window.removeEventListener(EVENTO_PIDE, pide);
  }, []);

  // la casa entera puede cambiar el permiso (panel del orbe, ajustes) → resincroniza
  useEffect(() => {
    const sync = () => {
      const p = leerPermisoHablar();
      setPermiso(p);
      if (p !== "sin-responder") setVisible(false);
    };
    window.addEventListener("vg:permiso-hablar", sync);
    return () => window.removeEventListener("vg:permiso-hablar", sync);
  }, []);

  // cortesía: si nadie responde en 45s, la tarjeta se aparta sola (vuelve con la próxima alerta)
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setVisible(false), 45000);
    return () => clearTimeout(t);
  }, [visible]);

  const activar = useCallback(() => {
    darPermisoHablar();
    setPermiso("concedido");
    setVisible(false);
    // el toque de ACTIVAR es el gesto del aparato: aquí la voz SÍ suena
    const alerta = pendienteRef.current;
    pendienteRef.current = null;
    const saludo = alerta
      ? `${TXT.saludoAlerta[lang] || TXT.saludoAlerta.es} ${alerta}`
      : TXT.saludo[lang] || TXT.saludo.es;
    hablarAgente("assist", saludo);
  }, [lang]);

  const silenciar = useCallback(() => {
    negarPermisoHablar();
    setPermiso("silencio");
    setVisible(false);
  }, []);

  if (!portalReady || !visible || permiso !== "sin-responder" || puedeHablarSolo()) return null;

  return createPortal(
    <div
      className="fixed left-1/2 -translate-x-1/2 bottom-[calc(96px+env(safe-area-inset-bottom,0px))] sm:bottom-8 z-[48] w-[min(92vw,430px)] vg201-permiso"
      data-vg-permiso-voz
      role="dialog"
      aria-label={TXT.titulo[lang] || TXT.titulo.es}
    >
      <div className="relative rounded-2xl border border-amber-hud/40 bg-[rgba(12,10,8,0.96)] backdrop-blur-md shadow-[0_14px_50px_rgba(0,0,0,0.7)] overflow-hidden">
        {/* franja viva de la casa */}
        <div className="h-[3px] w-full bg-gradient-to-r from-amber-hud/70 via-green-hud/60 to-amber-hud/70 vg201-franja" aria-hidden />
        <button
          onClick={silenciar}
          className="absolute top-2 right-2 p-1.5 rounded-lg text-muted-foreground/70 hover:text-foreground hover:bg-white/5"
          aria-label={TXT.silencio[lang] || TXT.silencio.es}
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <div className="px-4 pt-3.5 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid place-items-center w-9 h-9 rounded-full border border-amber-hud/40 bg-amber-hud/10 shrink-0">
              <Volume2 className="w-4.5 h-4.5 w-[18px] h-[18px] text-amber" />
            </span>
            <p className="font-mono text-[12px] tracking-[0.22em] text-amber">{TXT.titulo[lang] || TXT.titulo.es}</p>
          </div>
          <p className="mt-2.5 text-[12.5px] leading-relaxed text-foreground/85">
            {TXT.cuerpo[lang] || TXT.cuerpo.es}
          </p>
          <div className="mt-3.5 flex items-center gap-2">
            <button
              onClick={activar}
              className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-green-hud/40 bg-green-hud/10 text-[11.5px] font-mono tracking-[0.14em] text-green-hud hover:bg-green-hud/20 active:scale-[0.98] transition flex items-center justify-center gap-2"
              data-vg-permiso-activar
            >
              <Volume2 className="w-4 h-4 shrink-0" />
              {TXT.activar[lang] || TXT.activar.es}
            </button>
            <button
              onClick={silenciar}
              className={cn(
                "shrink-0 px-3 py-2.5 rounded-xl border border-muted-foreground/30 text-[11px] font-mono tracking-wide text-muted-foreground hover:bg-white/5 active:scale-[0.98] transition flex items-center gap-1.5"
              )}
            >
              <VolumeX className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{TXT.silencio[lang] || TXT.silencio.es}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

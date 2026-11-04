"use client";

// ============================================================
// v299.0 LA VOZ DE VANGUARD — EL PERMISO DE HABLARLE (el oído)
// El Dueño mandó: «la voz de Vanguard no tiene permiso para
// hablarle en audio». Resuelto: la tarjeta gemela de la v201 —
// aquella pide permiso para que Vanguard HABLE; esta pide
// permiso para que Vanguard ESCUCHE.
// Qué hace y por qué ASÍ:
//  · El reconocimiento de voz (orbe VG-ASSIST) dispara su propio
//    prompt del navegador EN PLENA FRASE: si la persona duda,
//    el navegador recuerda la duda y el oído queda cerrado para
//    siempre hasta tocar el candado. Pedir el permiso POR
//    ADELANTE (getUserMedia audio, 1 gesto limpio, soltar los
//    tracks al instante) deja el micrófono GRANTED para cuando
//    el piloto toque el orbe y hable.
//  · Sale UNA vez, con calma (6 s tras entrar) o AL INSTANTE si
//    el orbe topa un not-allowed (evento vg:pide-permiso-mic).
//  · ACTIVAR EL OÍDO = getUserMedia + sfx.himno() (la llamada
//    de la casa) + evento vg:permiso-mic para toda la Casa.
//  · MANTENER EN SILENCIO = respeto total: no vuelve a preguntar.
//  · Guardado honesto en el aparato (vg299-permiso-mic).
// Ley v189 intacta: esta tarjeta JAMÁS bloquea la casa — se
// cierra sola a los 45 s si nadie la toca. Sin getUserMedia
// (navegadores sin oído) NO sale: honestidad de acero.
// ============================================================

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Mic, MicOff, X } from "lucide-react";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { sfx } from "@/lib/sound";
// v299: coordinación entre las DOS tarjetas de permiso — la boca (v201) y
// el oído (v299) no pueden salir a la vez: manda la boca, luego el oído.
import { leerPermisoHablar } from "@/lib/voces-agentes";

// textos locales (8 idiomas — mismo patrón de la tarjeta v201)
const TXT = {
  titulo: {
    es: "VANGUARD QUIERE ESCUCHARTE", en: "VANGUARD WANTS TO HEAR YOU", pt: "VANGUARD QUER OUVIR VOCÊ",
    fr: "VANGUARD VEUT VOUS ENTENDRE", de: "VANGUARD WILL DICH HÖREN", it: "VANGUARD VUOLE ASCOLTARTI",
    ru: "VANGUARD ХОЧЕТ ВАС СЛЫШАТЬ", zh: "VANGUARD 想听你说话",
  } as Record<string, string>,
  cuerpo: {
    es: "Concede el micrófono y habla con Vanguard en audio: toca el orbe y pide las noticias, el mapa o las banderas — VG-ASSIST te escuchará sin preguntar dos veces.",
    en: "Grant the microphone and talk to Vanguard out loud: tap the orb and ask for news, the map or the flags — VG-ASSIST will listen without asking twice.",
    pt: "Concede o microfone e fala com a Vanguard em áudio: toca no orbe e pede as notícias, o mapa ou as bandeiras — o VG-ASSIST ouvirá sem perguntar duas vezes.",
    fr: "Accorde le micro et parlez à Vanguard en audio : touchez l'orbe et demandez les actualités, la carte ou les drapeaux — VG-ASSIST écoutera sans redemander.",
    de: "Erteile das Mikrofon und sprich mit Vanguard: Tippe den Orb an und fordere Nachrichten, Karte oder Flaggen — VG-ASSIST hört ohne Nachfragen.",
    it: "Concedi il microfono e parla con Vanguard a voce: tocca l'orbe e chiedi notizie, mappa o bandiere — VG-ASSIST ascolterà senza chiedere due volte.",
    ru: "Разрешите микрофон и говорите с Vanguard вслух: коснитесь орба и попросите новости, карту или флаги — VG-ASSIST услышит без повторных вопросов.",
    zh: "授权麦克风，与 Vanguard 语音对话：点按光球，索要新闻、地图或旗帜——VG-ASSIST 会直接聆听，不再重复询问。",
  } as Record<string, string>,
  activar: {
    es: "ACTIVAR EL OÍDO", en: "ENABLE THE EAR", pt: "ATIVAR O OUVIDO", fr: "ACTIVER L'OREILLE",
    de: "OHR AKTIVIEREN", it: "ATTIVA L'ORECCHIO", ru: "ВКЛЮЧИТЬ СЛУХ", zh: "开启听觉",
  } as Record<string, string>,
  silencio: {
    es: "MANTENER EN SILENCIO", en: "KEEP IT SILENT", pt: "MANTER EM SILÊNCIO", fr: "GARDER LE SILENCE",
    de: "STUMM LASSEN", it: "MANTIENI SILENZIO", ru: "ОСТАВИТЬ ТИШИНУ", zh: "保持静音",
  } as Record<string, string>,
  nota: {
    es: "La Casa solo pregunta una vez. El micrófono se abre con un gesto limpio y se suelta al instante — Vanguard escucha solo cuando tú pulsas el orbe.",
    en: "The House only asks once. The mic opens with one clean gesture and is released instantly — Vanguard listens only when you tap the orb.",
    pt: "A Casa só pergunta uma vez. O microfone abre com um gesto limpio e é solto no ato — a Vanguard só ouve quando tu tocas no orbe.",
    fr: "La Maison ne demande qu'une fois. Le micro s'ouvre d'un geste propre et se relâche aussitôt — Vanguard n'écoute que quand vous touchez l'orbe.",
    de: "Das Haus fragt nur einmal. Das Mikrofon öffnet sich mit einer sauberen Geste und wird sofort freigegeben — Vanguard hört nur auf Orb-Tipp.",
    it: "La Casa chiede solo una volta. Il microfono si apre con un gesto pulito e si rilascia subito — Vanguard ascolta solo quando tocchi l'orbe.",
    ru: "Дом спрашивает один раз. Микрофон открывается одним чистым жестом и сразу освобождается — Vanguard слушает только по касанию орба.",
    zh: "房子只问一次。麦克风以一次干净的手势开启并立即释放——Vanguard 只在你点按光球时聆听。",
  } as Record<string, string>,
};

const LS_MIC = "vg299-permiso-mic";
const EVENTO_PIDE = "vg:pide-permiso-mic";
export const EVENTO_MIC = "vg:permiso-mic";

export function permisoMicActual(): "concedido" | "denegado" | "sin-responder" {
  if (typeof window === "undefined") return "sin-responder";
  try {
    const v = localStorage.getItem(LS_MIC);
    if (v === "concedido" || v === "denegado") return v;
  } catch { /* aparato honesto */ }
  return "sin-responder";
}

export function PermisoMic() {
  const { lang } = useT();
  const [portalReady, setPortalReady] = useState(false);
  const [permiso, setPermiso] = useState<"concedido" | "denegado" | "sin-responder">("sin-responder");
  const [visible, setVisible] = useState(false);
  const [pidiendo, setPidiendo] = useState(false);
  const decididoRef = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setPortalReady(true), 0);
    return () => clearTimeout(t);
  }, []);

  // lee el permiso del aparato y pregunta con calma (6 s) — PERO la boca
  // manda: si la tarjeta v201 sigue sin respuesta, el oído espera su turno
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let listo = false;
    const puedeOir = typeof navigator !== "undefined"
      && !!navigator.mediaDevices?.getUserMedia
      && !!((window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition
        || (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition);
    const intenta = () => {
      if (listo) return;
      const p = permisoMicActual();
      setPermiso(p);
      if (p === "sin-responder" && puedeOir) {
        if (leerPermisoHablar() === "sin-responder") return; // la boca manda
        listo = true;
        setVisible(true);
      }
    };
    timer = setTimeout(intenta, 6000);
    const boca = () => { timer = setTimeout(intenta, 2500); };
    window.addEventListener("vg:permiso-hablar", boca, { once: true });
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("vg:permiso-hablar", boca);
    };
  }, []);

  // el orbe topó un "not-allowed" → la tarjeta sale AL INSTANTE
  useEffect(() => {
    const pide = () => {
      setPermiso(permisoMicActual());
      if (permisoMicActual() === "sin-responder") setVisible(true);
    };
    window.addEventListener(EVENTO_PIDE, pide);
    return () => window.removeEventListener(EVENTO_PIDE, pide);
  }, []);

  // la Casa entera puede cambiar el estado → resincroniza
  useEffect(() => {
    const sync = () => {
      const p = permisoMicActual();
      setPermiso(p);
      if (p !== "sin-responder") setVisible(false);
    };
    window.addEventListener(EVENTO_MIC, sync);
    return () => window.removeEventListener(EVENTO_MIC, sync);
  }, []);

  // v214 LA PUERTA: mientras el ritual de entrada está abierto, el oído
  // también se aparta (el permiso de voz se pregunta ALLÍ, paso 1)
  useEffect(() => {
    const ritual = (e: Event) => {
      const abierto = !!(e as CustomEvent<{ abierto?: boolean }>).detail?.abierto;
      if (abierto) setVisible(false);
    };
    window.addEventListener("vg:ritual-abierto", ritual);
    return () => window.removeEventListener("vg:ritual-abierto", ritual);
  }, []);

  // cortesía: si nadie responde en 45 s, la tarjeta se aparta sola
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setVisible(false), 45000);
    return () => clearTimeout(t);
  }, [visible]);

  const activar = useCallback(async () => {
    if (decididoRef.current || pidiendo) return;
    setPidiendo(true);
    decididoRef.current = true;
    let concedido = false;
    try {
      // el permiso SE PIDE y SE SUELTA: Vanguard no escucha nunca de fondo —
      // el gesto deja el micrófono GRANTED para el orbe, nada más
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((tr) => tr.stop());
      concedido = true;
    } catch { /* denegado honesto */ }
    try { localStorage.setItem(LS_MIC, concedido ? "concedido" : "denegado"); } catch {}
    setPermiso(concedido ? "concedido" : "denegado");
    setVisible(false);
    setPidiendo(false);
    if (concedido) {
      sfx.himno(); // la llamada de la casa: el oído abre con música propia
      try {
        window.dispatchEvent(new CustomEvent(EVENTO_MIC, { detail: { concedido: true } }));
      } catch {}
    }
  }, [pidiendo]);

  const silenciar = useCallback(() => {
    if (decididoRef.current) return;
    decididoRef.current = true;
    try { localStorage.setItem(LS_MIC, "denegado"); } catch {}
    setPermiso("denegado");
    setVisible(false);
  }, []);

  if (!portalReady || !visible || permiso !== "sin-responder") return null;

  return createPortal(
    <div
      className="fixed left-1/2 -translate-x-1/2 bottom-[calc(96px+env(safe-area-inset-bottom,0px))] sm:bottom-8 z-[49] w-[min(92vw,430px)] vg201-permiso"
      data-vg-permiso-mic
      role="dialog"
      aria-label={TXT.titulo[lang] || TXT.titulo.es}
    >
      <div className="relative rounded-2xl border border-cyan-400/40 bg-[rgba(8,12,12,0.96)] backdrop-blur-md shadow-[0_14px_50px_rgba(0,0,0,0.7)] overflow-hidden">
        {/* franja viva del oído */}
        <div className="h-[3px] w-full bg-gradient-to-r from-cyan-400/70 via-green-hud/60 to-cyan-400/70 vg201-franja" aria-hidden />
        <button
          onClick={silenciar}
          className="absolute top-2 right-2 p-1.5 rounded-lg text-muted-foreground/70 hover:text-foreground hover:bg-white/5"
          aria-label={TXT.silencio[lang] || TXT.silencio.es}
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <div className="px-4 pt-3.5 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid place-items-center w-9 h-9 rounded-full border border-cyan-400/40 bg-cyan-400/10 shrink-0">
              <Mic className="w-[18px] h-[18px] text-cyan-300" />
            </span>
            <p className="font-mono text-[12px] tracking-[0.22em] text-cyan-200">{TXT.titulo[lang] || TXT.titulo.es}</p>
          </div>
          <p className="mt-2.5 text-[12.5px] leading-relaxed text-foreground/85">
            {TXT.cuerpo[lang] || TXT.cuerpo.es}
          </p>
          <p className="mt-2 text-[10.5px] leading-relaxed text-muted-foreground/75">
            {TXT.nota[lang] || TXT.nota.es}
          </p>
          <div className="mt-3.5 flex items-center gap-2">
            <button
              onClick={() => void activar()}
              disabled={pidiendo}
              className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-cyan-400/40 bg-cyan-400/10 text-[11.5px] font-mono tracking-[0.14em] text-cyan-200 hover:bg-cyan-400/20 active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-60"
              data-vg-permiso-mic-activar
            >
              <Mic className="w-4 h-4 shrink-0" />
              {TXT.activar[lang] || TXT.activar.es}
            </button>
            <button
              onClick={silenciar}
              className={cn(
                "shrink-0 px-3 py-2.5 rounded-xl border border-muted-foreground/30 text-[11px] font-mono tracking-wide text-muted-foreground hover:bg-white/5 active:scale-[0.98] transition flex items-center gap-1.5"
              )}
            >
              <MicOff className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{TXT.silencio[lang] || TXT.silencio.es}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

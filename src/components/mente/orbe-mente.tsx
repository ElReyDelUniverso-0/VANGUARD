"use client";

// ═══════════════════════════════════════════════════════════════════════════
// v431.6 · EL ORBE — LA MENTE CON VOZ, SIN MENÚ
//
// Encargo del Dueño: «usa la voz que tenemos ahora… un orbe minimalista abajo
// en el centro, ondas reactivas, chips de sugerencias, Web Speech API en
// español con respaldo de texto, y que la IA decida cuándo habla y cuándo
// ejecuta una acción en la página».
//
// QUÉ ES ESTO Y QUÉ NO:
//   · No es un chatbot pegado encima: es la misma LA MENTE de la casa (misma
//     puerta /api/mente/chat, mismo mapa de 271 lugares, mismos artefactos).
//     El orbe solo le pone cara y boca.
//   · No inventa nada: si el navegador no sabe escuchar, lo dice y ofrece el
//     teclado (⌘J abre la conversación entera).
//   · Nada de audio simulado: las ondas son CSS sincronizadas con estados
//     reales (escuchando / pensando / hablando), no un adorno que finja.
//
// ESTADOS: inactivo · escuchando · pensando · hablando · sinvoz
// ATAJOS:  ⌘J / Ctrl+J abre el panel · clic en el orbe escucha · Esc calla
// ═══════════════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Artefacto, Enlace } from "@/lib/mente/agente";
import "./orbe-mente.css";

type Estado = "inactivo" | "escuchando" | "pensando" | "hablando" | "sinvoz";

type AlternativaVoz = { transcript: string };
type ResultadoVoz = { isFinal: boolean; length: number; [indice: number]: AlternativaVoz };
type ResultadosVoz = { length: number; [indice: number]: ResultadoVoz };
type EventoVoz = { resultIndex: number; results: ResultadosVoz };

type Reconocedor = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((evento: EventoVoz) => void) | null;
  onerror: ((evento: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type FabricaReconocedor = new () => Reconocedor;

function fabricaDeVoz(): FabricaReconocedor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: FabricaReconocedor; webkitSpeechRecognition?: FabricaReconocedor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const K_CONV = "vg:mente:conversacion:v1";
const K_MEMO = "vg:mente:memoria:v1";

/** Sugerencias por sitio: lo que de verdad se puede pedir desde ahí. */
const CHIPS: { prefijo: string; chips: string[] }[] = [
  { prefijo: "/cuartel", chips: ["Llévame al mapa", "¿Qué salas hay aquí?", "Hazme un plan de misión"] },
  { prefijo: "/mapas", chips: ["Llévame a las divisas", "¿Cómo leo este mapa?", "Llévame al mundo 3D"] },
  { prefijo: "/radio", chips: ["Ponme el pulso del día", "¿Qué cables son los más fuertes?", "Llévame al archivo"] },
  { prefijo: "/academia", chips: ["¿Por dónde empiezo?", "Llévame a los cursos", "Hazme un plan de estudio"] },
  { prefijo: "/mundo", chips: ["¿Qué frentes están abiertos?", "Llévame al mapa vivo", "Explícame este globo"] },
  { prefijo: "/", chips: ["Llévame a lo que pasa ahora", "¿Qué es VANGUARD?", "Quiero jugar la misión"] },
];

function chipsDe(ruta: string): string[] {
  const encontrado = CHIPS.find((c) => c.prefijo !== "/" && ruta.startsWith(c.prefijo));
  return (encontrado ?? CHIPS[CHIPS.length - 1]).chips;
}

/** Llevar la vista a una sección de la página actual, con resalte temporal. */
export function navegarASeccion(id: string): boolean {
  if (typeof document === "undefined") return false;
  const limpio = id.replace(/^#/, "");
  const destino = document.getElementById(limpio);
  if (!destino) return false;
  const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  destino.scrollIntoView({ behavior: suave ? "smooth" : "auto", block: "start" });
  // CSS.escape no existe en navegadores viejos: sin él, el resalte se omite y
  // el scroll ya se ha hecho (la navegación nunca depende del adorno).
  const escapado = typeof CSS !== "undefined" && typeof CSS.escape === "function" ? CSS.escape(limpio) : limpio;
  resaltarElemento(`#${escapado}`);
  return true;
}

/** Encender un borde sobre un elemento para que el ojo lo encuentre. */
export function resaltarElemento(selector: string): boolean {
  if (typeof document === "undefined") return false;
  let el: Element | null = null;
  try {
    el = document.querySelector(selector);
  } catch {
    return false;
  }
  if (!el) return false;
  el.classList.add("vg-resalte");
  window.setTimeout(() => el?.classList.remove("vg-resalte"), 2200);
  return true;
}

export function OrbeMente() {
  const ruta = usePathname() ?? "/";
  const navegar = useRouter();

  const [montado, setMontado] = useState(false);
  const [estado, setEstado] = useState<Estado>("inactivo");
  const [escuchado, setEscuchado] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [enlaces, setEnlaces] = useState<Enlace[]>([]);
  const [artefactos, setArtefactos] = useState<Artefacto[]>([]);
  const [error, setError] = useState("");
  const [tarjeta, setTarjeta] = useState(false);
  const [escribiendo, setEscribiendo] = useState(false);
  const [texto, setTexto] = useState("");

  const reconocedor = useRef<Reconocedor | null>(null);
  const escuchando = useRef(false);
  const ultimo = useRef("");
  const cajaTexto = useRef<HTMLInputElement | null>(null);

  const soporte = useMemo(() => (montado ? fabricaDeVoz() !== null : true), [montado]);
  const chips = useMemo(() => chipsDe(ruta), [ruta]);

  // ── hablar: si el operador vuelve a hablar, la voz se corta al instante ──
  const callar = useCallback(() => {
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* sin voz en este aparato */
    }
    setEstado((e) => (e === "hablando" ? "inactivo" : e));
  }, []);

  const decir = useCallback(
    (textoVoz: string) => {
      const limpio = textoVoz.replace(/\s+/g, " ").trim().slice(0, 600);
      if (!limpio) return;
      try {
        const sintesis = window.speechSynthesis;
        if (!sintesis) return;
        sintesis.cancel();
        const voz = new SpeechSynthesisUtterance(limpio);
        voz.lang = "es-ES";
        voz.rate = 1.03;
        voz.pitch = 1;
        voz.onstart = () => setEstado("hablando");
        voz.onend = () => setEstado((e) => (e === "hablando" ? "inactivo" : e));
        voz.onerror = () => setEstado((e) => (e === "hablando" ? "inactivo" : e));
        sintesis.speak(voz);
      } catch {
        setEstado("inactivo");
      }
    },
    []
  );

  // ── mandar lo dicho (o escrito) a LA MENTE de la casa ──
  const preguntar = useCallback(
    async (mensaje: string) => {
      const limpio = mensaje.trim();
      if (!limpio) return;
      setError("");
      setEscuchado(limpio);
      setTarjeta(true);
      setEstado("pensando");
      callar();

      let memoria: string[] = [];
      let historial: { rol: "operador" | "mente"; texto: string }[] = [];
      try {
        const guardado = JSON.parse(window.localStorage.getItem(K_MEMO) ?? "[]");
        if (Array.isArray(guardado)) memoria = guardado.filter((x) => typeof x === "string").slice(-12);
        const conv = JSON.parse(window.localStorage.getItem(K_CONV) ?? "[]");
        if (Array.isArray(conv)) {
          historial = conv
            .slice(-8)
            .map((l: { rol?: string; texto?: string }) => ({
              rol: l.rol === "operador" ? ("operador" as const) : ("mente" as const),
              texto: typeof l.texto === "string" ? l.texto : "",
            }))
            .filter((l) => l.texto);
        }
      } catch {
        /* aparato sin almacén: se pregunta igual */
      }

      try {
        const res = await fetch("/api/mente/chat?json=1", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mensaje: limpio, historial, ruta, memoria }),
        });
        const datos = (await res.json()) as {
          respuesta?: string;
          enlaces?: Enlace[];
          artefactos?: Artefacto[];
          dirigir?: boolean;
          pasos?: { etiqueta: string; ms: number }[];
          ia?: boolean;
        };
        const dicho = (datos.respuesta ?? "").trim();
        setRespuesta(dicho || "No he podido responder.");
        setEnlaces(Array.isArray(datos.enlaces) ? datos.enlaces.slice(0, 3) : []);
        setArtefactos(Array.isArray(datos.artefactos) ? datos.artefactos.slice(0, 2) : []);
        setEstado("inactivo");

        // a la conversación de la casa, para que el panel lo muestre también
        try {
          const antes = JSON.parse(window.localStorage.getItem(K_CONV) ?? "[]");
          const nuevas = Array.isArray(antes) ? antes.slice(-38) : [];
          nuevas.push({ rol: "operador", texto: limpio });
          if (dicho) {
            nuevas.push({
              rol: "mente",
              texto: dicho,
              enlaces: datos.enlaces ?? [],
              artefactos: datos.artefactos ?? [],
              pasos: datos.pasos ?? [],
              ia: datos.ia === true,
            });
          }
          window.localStorage.setItem(K_CONV, JSON.stringify(nuevas));
        } catch {
          /* sin almacén, no pasa nada */
        }

        if (dicho) decir(dicho);

        // ── ACCIÓN EN LA PÁGINA: si la orden fue «llévame», se va ──
        const puerta = datos.enlaces?.[0];
        if (datos.dirigir === true && puerta) {
          // si la puerta es una sección de ESTA página, se baja sin recargar
          const esAncla = puerta.ruta.startsWith("#") || puerta.ruta.startsWith(`${ruta}#`);
          const ancla = puerta.ruta.split("#")[1];
          if (esAncla && ancla) {
            window.setTimeout(() => {
              if (!navegarASeccion(ancla)) navegar.push(puerta.ruta);
            }, 900);
          } else if (puerta.ruta !== ruta) {
            window.setTimeout(() => navegar.push(puerta.ruta), 900);
          }
        }
      } catch {
        setEstado("inactivo");
        setError("No he podido conectar con LA MENTE. Prueba otra vez o escríbelo.");
      }
    },
    [callar, decir, navegar, ruta]
  );

  // ── escuchar ──
  const escucharAhora = useCallback(() => {
    const Fabrica = fabricaDeVoz();
    if (!Fabrica) {
      setEstado("sinvoz");
      setEscribiendo(true);
      window.setTimeout(() => cajaTexto.current?.focus(), 60);
      return;
    }
    callar();
    try {
      reconocedor.current?.abort();
    } catch {
      /* nada */
    }
    const r = new Fabrica();
    reconocedor.current = r;
    r.lang = "es-ES";
    r.continuous = false;
    r.interimResults = true;
    r.maxAlternatives = 1;

    r.onstart = () => {
      escuchando.current = true;
      setEstado("escuchando");
      setError("");
      setEscuchado("");
      setTarjeta(true);
    };
    r.onresult = (evento) => {
      let parcial = "";
      let final = "";
      for (let i = evento.resultIndex; i < evento.results.length; i += 1) {
        const res = evento.results[i];
        const txt = res[0]?.transcript ?? "";
        if (res.isFinal) final += txt;
        else parcial += txt;
      }
      if (parcial) setEscuchado(parcial);
      if (final.trim()) {
        ultimo.current = final.trim();
        setEscuchado(final.trim());
      }
    };
    r.onerror = (evento) => {
      escuchando.current = false;
      setEstado("inactivo");
      const codigo = evento.error ?? "";
      if (codigo === "not-allowed" || codigo === "service-not-allowed") {
        setError("El micrófono está bloqueado. Puedes escribirlo aquí abajo.");
        setEscribiendo(true);
      } else if (codigo === "no-speech") {
        setError("No te he oído. Toca el orbe y habla otra vez.");
      } else if (codigo !== "aborted") {
        setError("No se pudo escuchar. Prueba con el teclado.");
        setEscribiendo(true);
      }
    };
    r.onend = () => {
      escuchando.current = false;
      const dicho = ultimo.current.trim();
      ultimo.current = "";
      if (dicho) void preguntar(dicho);
      else setEstado((e) => (e === "escuchando" ? "inactivo" : e));
    };

    try {
      r.start();
    } catch {
      setEstado("inactivo");
      setError("El micrófono no arrancó. Usa el teclado.");
      setEscribiendo(true);
    }
  }, [callar, preguntar]);

  const parar = useCallback(() => {
    try {
      reconocedor.current?.stop();
    } catch {
      /* nada */
    }
    escuchando.current = false;
    setEstado("inactivo");
  }, []);

  // ── montaje y atajos ──
  useEffect(() => {
    setMontado(true);
    return () => {
      try {
        reconocedor.current?.abort();
      } catch {
        /* nada */
      }
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* nada */
      }
    };
  }, []);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") callar();
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [callar]);

  // al cambiar de página, la tarjeta se recoge (la conversación vive en el panel)
  useEffect(() => {
    setTarjeta(false);
    setEscribiendo(false);
    setRespuesta("");
    setEnlaces([]);
    setArtefactos([]);
    setError("");
  }, [ruta]);

  if (!montado) return null;

  const abrirPanel = () => {
    try {
      window.dispatchEvent(new CustomEvent("vg:mente:abrir", { detail: {} }));
    } catch {
      /* nada */
    }
    setTarjeta(false);
  };

  const activo = estado !== "inactivo";
  const etiquetaEstado =
    estado === "escuchando" ? "Te escucho" : estado === "pensando" ? "Pensando" : estado === "hablando" ? "Hablando" : "Hablar con LA MENTE";

  return (
    <div className="vg-orbe-zona" data-estado={estado}>
      {tarjeta ? (
        <div className="vg-orbe-tarjeta" role="status" aria-live="polite">
          <div className="vg-orbe-tarjeta-cab">
            <span className="vg-orbe-rotulo">
              <i className="vg-orbe-punto" aria-hidden />
              {estado === "escuchando" ? "escuchando" : estado === "pensando" ? "pensando" : "LA MENTE"}
            </span>
            <button type="button" className="vg-orbe-mini" onClick={() => { callar(); parar(); setTarjeta(false); }} aria-label="Cerrar">
              ×
            </button>
          </div>

          <p className={`vg-orbe-dicho ${escuchado ? "" : "vg-orbe-vacio"}`}>
            {escuchado || "Dime a dónde vamos o qué quieres saber…"}
          </p>

          {respuesta ? <p className="vg-orbe-respuesta">{respuesta}</p> : null}

          {enlaces.length ? (
            <div className="vg-orbe-puertas">
              {enlaces.map((e, n) => (
                <button
                  key={e.ruta}
                  type="button"
                  className="vg-orbe-puerta"
                  onClick={() => {
                    callar();
                    if (!navegarASeccion(e.ruta.split("#")[1] ?? "")) navegar.push(e.ruta);
                    setTarjeta(false);
                  }}
                  title={`${e.ruta} — ${e.porque}`}
                >
                  <b>{e.nombre}</b>
                  <span>{e.ruta}</span>
                  <em>Alt+{n + 1}</em>
                </button>
              ))}
            </div>
          ) : null}

          {artefactos.length ? (
            <div className="vg-orbe-artes">
              {artefactos.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className="vg-orbe-arte"
                  onClick={() => {
                    try {
                      const url = URL.createObjectURL(new Blob([a.contenido], { type: "text/markdown;charset=utf-8" }));
                      const el = document.createElement("a");
                      el.href = url;
                      el.download = `${a.titulo.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "mente"}.md`;
                      el.click();
                      URL.revokeObjectURL(url);
                    } catch {
                      /* nada */
                    }
                  }}
                >
                  {a.tipo}: {a.titulo} · .md
                </button>
              ))}
            </div>
          ) : null}

          {error ? <p className="vg-orbe-error">{error}</p> : null}

          {escribiendo ? (
            <form
              className="vg-orbe-form"
              onSubmit={(e) => {
                e.preventDefault();
                const t = texto.trim();
                if (!t) return;
                setTexto("");
                setEscribiendo(false);
                void preguntar(t);
              }}
            >
              <input
                ref={cajaTexto}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Escríbelo aquí…"
                maxLength={400}
                aria-label="Escribe lo que quieres pedirle a LA MENTE"
              />
              <button type="submit">→</button>
            </form>
          ) : null}

          <div className="vg-orbe-pie">
            <button type="button" className="vg-orbe-mini" onClick={() => setEscribiendo((v) => !v)}>
              teclado
            </button>
            <button type="button" className="vg-orbe-mini" onClick={abrirPanel}>
              conversación completa
            </button>
            {respuesta ? (
              <button type="button" className="vg-orbe-mini" onClick={() => decir(respuesta)}>
                repetir
              </button>
            ) : null}
            {!soporte ? <span className="vg-orbe-aviso">este navegador no sabe escuchar: usa el teclado</span> : null}
          </div>
        </div>
      ) : null}

      {!tarjeta && estado === "inactivo" ? (
        <div className="vg-orbe-chips" aria-label="Sugerencias">
          {chips.map((c) => (
            <button key={c} type="button" className="vg-orbe-chip" onClick={() => void preguntar(c)}>
              {c}
            </button>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        className="vg-orbe"
        data-estado={estado}
        aria-label={etiquetaEstado}
        aria-pressed={activo}
        onClick={() => {
          if (estado === "escuchando") parar();
          else if (estado === "hablando") callar();
          else escucharAhora();
        }}
        onDoubleClick={abrirPanel}
        title={`${etiquetaEstado} · clic para hablar · doble clic para la conversación · ⌘J`}
      >
        <span className="vg-orbe-nucleo" aria-hidden>
          <i /><i /><i /><i /><i />
        </span>
        <span className="vg-orbe-aro vg-orbe-aro-1" aria-hidden />
        <span className="vg-orbe-aro vg-orbe-aro-2" aria-hidden />
        <span className="vg-orbe-estado">{etiquetaEstado}</span>
      </button>
    </div>
  );
}

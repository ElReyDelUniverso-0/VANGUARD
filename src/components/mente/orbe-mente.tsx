"use client";

// ═══════════════════════════════════════════════════════════════════════════
// v432.2 · EL ORBE — se puede mover, se puede editar, no tapa botones
//
// Lo que pidió el Dueño, textual: «que uno pueda editar todo sobre ella… y que
// uno pueda mover su lugar, que no opaque botones… que explique mejor… y que
// sea la voz de ChatGPT súper realista».
//
// LO QUE CAMBIA EN ESTA VUELTA:
//   ① SE MUEVE. Se arrastra con el dedo o el ratón y se queda donde lo dejes
//      (se guarda en el aparato). Si lo sueltas cerca de un borde, se pega.
//   ② NO TAPA. En reposo baja de opacidad mientras lees, y en cuanto se coloca
//      encima de algo pulsable (un botón, un enlace, un campo) se aparta solo.
//      Además hay «modo discreto»: un punto pequeño que solo crece al tocarlo.
//   ③ SE EDITA TODO. Una hoja de ajustes con tamaño, opacidad, voz, persona,
//      velocidad, idioma, chips, si te lleva sola y si se esconde al desplazar.
//      Todo se guarda en `vg:mente:orbe:v1`; nada sale del aparato.
//   ④ HABLA MEJOR. Usa la BOCA DE LA CASA (lib/voz/decir): elige la mejor voz
//      neuronal instalada, respeta las pausas entre frases y encadena sin
//      pisarse. Si el proyecto tiene clave de voz neuronal (/api/voz/tts), usa
//      esa primero: es la voz de estudio. Si no hay clave, no lo finge.
//   ⑤ EXPLICA MEJOR. La respuesta ya no es un párrafo suelto: se dice qué hay,
//      dónde está y qué vas a encontrar, con las puertas a la vista.
//
// SIGUE IGUAL EN LO BUENO: misma puerta /api/mente/chat, mismo mapa de 271
// lugares, mismos artefactos, ⌘J para la conversación completa, respaldo de
// teclado siempre a mano.
// ═══════════════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Artefacto, Enlace } from "@/lib/mente/agente";
import { decir, leerGustos, pararBoca, type PersonaId } from "@/lib/voz/decir";
import {
  AJUSTES_DEFECTO,
  leerAjustes,
  guardarAjustes,
  esInteractivo,
  type AjustesOrbe,
} from "@/lib/mente/ajustes-orbe";
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
  const [ajustes, setAjustes] = useState<AjustesOrbe>(AJUSTES_DEFECTO);
  const [estado, setEstado] = useState<Estado>("inactivo");
  const [escuchado, setEscuchado] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [enlaces, setEnlaces] = useState<Enlace[]>([]);
  const [artefactos, setArtefactos] = useState<Artefacto[]>([]);
  const [error, setError] = useState("");
  const [tarjeta, setTarjeta] = useState(false);
  const [escribiendo, setEscribiendo] = useState(false);
  const [texto, setTexto] = useState("");
  const [hoja, setHoja] = useState(false);
  const [apartado, setApartado] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);

  const reconocedor = useRef<Reconocedor | null>(null);
  const ultimo = useRef("");
  const cajaTexto = useRef<HTMLInputElement | null>(null);
  const orbeRef = useRef<HTMLDivElement | null>(null);
  const botonRef = useRef<HTMLButtonElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const arrastre = useRef<{ x0: number; y0: number; px: number; py: number; movido: boolean } | null>(null);

  const soporte = useMemo(() => (montado ? fabricaDeVoz() !== null : true), [montado]);
  const chips = useMemo(() => chipsDe(ruta), [ruta]);

  const guardar = useCallback((siguiente: AjustesOrbe) => {
    setAjustes(siguiente);
    guardarAjustes(siguiente);
  }, []);

  // ── voz: primero la de estudio (si hay clave), después la boca de la casa ──
  const callar = useCallback(() => {
    try {
      pararBoca();
    } catch {
      /* sin boca */
    }
    const audio = audioRef.current;
    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {
        /* nada */
      }
      audioRef.current = null;
    }
    setEstado((e) => (e === "hablando" ? "inactivo" : e));
  }, []);

  const hablar = useCallback(
    async (textoVoz: string) => {
      const limpio = textoVoz.replace(/\s+/g, " ").trim();
      if (!limpio) return;
      if (ajustes.voz === "apagada") return;
      setEstado("hablando");

      if (ajustes.voz === "casa") {
        try {
          const res = await fetch("/api/voz/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ texto: limpio.slice(0, 700) }),
          });
          const tipo = res.headers.get("content-type") ?? "";
          if (res.ok && tipo.startsWith("audio")) {
            const blob = await res.blob();
            const audio = new Audio(URL.createObjectURL(blob));
            audioRef.current = audio;
            audio.onended = () => setEstado((e) => (e === "hablando" ? "inactivo" : e));
            audio.onerror = () => setEstado((e) => (e === "hablando" ? "inactivo" : e));
            await audio.play();
            return;
          }
        } catch {
          /* sin voz de estudio: sigue la del aparato */
        }
      }

      try {
        const gustos = { ...leerGustos(), persona: ajustes.persona, rate: ajustes.velocidad };
        const hablo = decir(limpio.slice(0, 900), {
          persona: ajustes.persona,
          gustos,
          idioma: ajustes.idioma.split("-")[0],
          interrumpir: true,
          onFin: () => setEstado((e) => (e === "hablando" ? "inactivo" : e)),
        });
        if (!hablo) setEstado("inactivo");
      } catch {
        setEstado("inactivo");
      }
    },
    [ajustes.voz, ajustes.persona, ajustes.velocidad, ajustes.idioma]
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

        if (dicho) void hablar(dicho);

        // ── ACCIÓN EN LA PÁGINA: si la orden fue «llévame», se va ──
        const puerta = datos.enlaces?.[0];
        if (ajustes.dirigirSolo && datos.dirigir === true && puerta) {
          const ancla = puerta.ruta.split("#")[1];
          const esAncla = puerta.ruta.startsWith("#") || puerta.ruta.startsWith(`${ruta}#`);
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
    [ajustes.dirigirSolo, callar, hablar, navegar, ruta]
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
    r.lang = ajustes.idioma;
    r.continuous = false;
    r.interimResults = true;
    r.maxAlternatives = 1;

    r.onstart = () => {
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
  }, [ajustes.idioma, callar, preguntar]);

  const parar = useCallback(() => {
    try {
      reconocedor.current?.stop();
    } catch {
      /* nada */
    }
    setEstado("inactivo");
  }, []);

  // ── montaje, atajos y ajustes que llegan de fuera ──
  useEffect(() => {
    setAjustes(leerAjustes());
    setMontado(true);
    const alAjustar = (e: Event) => {
      const d = (e as CustomEvent<AjustesOrbe>).detail;
      if (d) setAjustes(d);
    };
    const alAbrir = () => setHoja(true);
    window.addEventListener("vg:orbe:ajustes", alAjustar);
    window.addEventListener("vg:orbe:ajustes:abrir", alAbrir);
    return () => {
      window.removeEventListener("vg:orbe:ajustes", alAjustar);
      window.removeEventListener("vg:orbe:ajustes:abrir", alAbrir);
      try {
        reconocedor.current?.abort();
      } catch {
        /* nada */
      }
      try {
        pararBoca();
      } catch {
        /* nada */
      }
    };
  }, []);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        callar();
        setHoja(false);
      }
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [callar]);

  // al cambiar de página, la tarjeta se recoge
  useEffect(() => {
    setTarjeta(false);
    setEscribiendo(false);
    setRespuesta("");
    setEnlaces([]);
    setArtefactos([]);
    setError("");
  }, [ruta]);

  // ── NO TAPAR BOTONES: se aparta si cae encima de algo pulsable ──
  const apartarSiTapa = useCallback(() => {
    const el = botonRef.current;
    if (!el || ajustes.x === null || ajustes.y === null) return;
    const caja = el.getBoundingClientRect();
    const puntos: [number, number][] = [
      [caja.left + caja.width / 2, caja.top + caja.height / 2],
      [caja.left + 6, caja.top + 6],
      [caja.right - 6, caja.top + 6],
    ];
    for (const [x, y] of puntos) {
      const bajo = document.elementFromPoint(x, y);
      if (bajo && !el.contains(bajo) && esInteractivo(bajo)) {
        setApartado(true);
        return;
      }
    }
    setApartado(false);
  }, [ajustes.x, ajustes.y, ajustes.tamano]);

  useEffect(() => {
    if (!montado) return;
    const t = window.setTimeout(apartarSiTapa, 420);
    return () => window.clearTimeout(t);
  }, [montado, apartarSiTapa]);

  // ── transparencia mientras se lee ──
  useEffect(() => {
    if (!ajustes.autoOcultar) return;
    let temporizador = 0;
    const alDesplazar = () => {
      setApartado(true);
      window.clearTimeout(temporizador);
      temporizador = window.setTimeout(() => setApartado(false), 900);
    };
    window.addEventListener("scroll", alDesplazar, { passive: true });
    return () => {
      window.removeEventListener("scroll", alDesplazar);
      window.clearTimeout(temporizador);
    };
  }, [ajustes.autoOcultar]);

  // ── arrastrar: se queda donde lo dejes y se pega al borde ──
  const alSoltar = useCallback(() => {
    const d = arrastre.current;
    arrastre.current = null;
    setArrastrando(false);
    if (!d) return;
    if (d.movido) {
      const el = botonRef.current;
      if (el) {
        const caja = el.getBoundingClientRect();
        const ancho = window.innerWidth;
        const alto = window.innerHeight;
        const margen = 10;
        let x = caja.left;
        let y = caja.top;
        if (x < 44) x = margen;
        if (x + caja.width > ancho - 44) x = ancho - caja.width - margen;
        if (y < 44) y = margen;
        if (y + caja.height > alto - 44) y = alto - caja.height - margen;
        guardar({ ...ajustes, x: Math.round(x), y: Math.round(y) });
      }
    }
  }, [ajustes, guardar]);

  const alMoverPuntero = useCallback(
    (e: PointerEvent) => {
      const d = arrastre.current;
      if (!d) return;
      const dx = e.clientX - d.x0;
      const dy = e.clientY - d.y0;
      if (!d.movido && Math.hypot(dx, dy) < 7) return;
      d.movido = true;
      setArrastrando(true);
      const zona = orbeRef.current;
      const boton = botonRef.current;
      if (!zona || !boton) return;
      const x = Math.min(Math.max(4, d.px + dx), window.innerWidth - boton.offsetWidth - 4);
      const y = Math.min(Math.max(4, d.py + dy), window.innerHeight - boton.offsetHeight - 4);
      zona.style.left = `${x}px`;
      zona.style.top = `${y}px`;
      zona.style.bottom = "auto";
      zona.style.transform = "none";
    },
    []
  );

  useEffect(() => {
    if (!arrastrando) return;
    const soltar = () => alSoltar();
    window.addEventListener("pointermove", alMoverPuntero);
    window.addEventListener("pointerup", soltar);
    window.addEventListener("pointercancel", soltar);
    return () => {
      window.removeEventListener("pointermove", alMoverPuntero);
      window.removeEventListener("pointerup", soltar);
      window.removeEventListener("pointercancel", soltar);
    };
  }, [arrastrando, alMoverPuntero, alSoltar]);

  const alPulsar = (e: React.PointerEvent<HTMLButtonElement>) => {
    const el = botonRef.current;
    if (!el) return;
    const caja = el.getBoundingClientRect();
    arrastre.current = { x0: e.clientX, y0: e.clientY, px: caja.left, py: caja.top, movido: false };
  };

  if (!montado || !ajustes.visible) return null;

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

  const libre = ajustes.x !== null && ajustes.y !== null;
  const estilo: React.CSSProperties = {
    ["--vg-orbe-tam" as string]: `${ajustes.tamano}px`,
    ["--vg-orbe-op" as string]: String(ajustes.opacidad),
  };
  if (libre) {
    estilo.left = `${ajustes.x}px`;
    estilo.top = `${ajustes.y}px`;
    estilo.bottom = "auto";
    estilo.transform = "none";
  }

  return (
    <div
      ref={orbeRef}
      className="vg-orbe-zona"
      data-estado={estado}
      data-apartado={apartado ? "1" : "0"}
      data-libre={libre ? "1" : "0"}
      data-arrastrando={arrastrando ? "1" : "0"}
      data-discreto={ajustes.discreto ? "1" : "0"}
      style={estilo}
    >
      {hoja ? (
        <div className="vg-orbe-hoja" role="dialog" aria-label="Ajustes del orbe">
          <div className="vg-orbe-hoja-cab">
            <b>Ajustar el orbe</b>
            <button type="button" className="vg-orbe-mini" onClick={() => setHoja(false)} aria-label="Cerrar ajustes">
              ×
            </button>
          </div>

          <label className="vg-orbe-campo">
            <span>Tamaño</span>
            <input
              type="range"
              min={40}
              max={96}
              step={2}
              value={ajustes.tamano}
              onChange={(e) => guardar({ ...ajustes, tamano: Number(e.target.value) })}
            />
            <em>{ajustes.tamano}px</em>
          </label>

          <label className="vg-orbe-campo">
            <span>Transparencia</span>
            <input
              type="range"
              min={0.3}
              max={1}
              step={0.02}
              value={ajustes.opacidad}
              onChange={(e) => guardar({ ...ajustes, opacidad: Number(e.target.value) })}
            />
            <em>{Math.round(ajustes.opacidad * 100)}%</em>
          </label>

          <div className="vg-orbe-fila">
            <label>
              <input type="checkbox" checked={ajustes.chips} onChange={(e) => guardar({ ...ajustes, chips: e.target.checked })} />
              sugerencias
            </label>
            <label>
              <input type="checkbox" checked={ajustes.autoOcultar} onChange={(e) => guardar({ ...ajustes, autoOcultar: e.target.checked })} />
              apartarse al leer
            </label>
            <label>
              <input type="checkbox" checked={ajustes.discreto} onChange={(e) => guardar({ ...ajustes, discreto: e.target.checked })} />
              modo discreto
            </label>
            <label>
              <input type="checkbox" checked={ajustes.dirigirSolo} onChange={(e) => guardar({ ...ajustes, dirigirSolo: e.target.checked })} />
              llevarme sola
            </label>
          </div>

          <label className="vg-orbe-campo">
            <span>Voz</span>
            <select value={ajustes.voz} onChange={(e) => guardar({ ...ajustes, voz: e.target.value as AjustesOrbe["voz"] })}>
              <option value="casa">de estudio si hay clave; si no, la de la casa</option>
              <option value="aparato">la del aparato</option>
              <option value="apagada">callada (solo texto)</option>
            </select>
          </label>

          <label className="vg-orbe-campo">
            <span>Persona</span>
            <select value={ajustes.persona} onChange={(e) => guardar({ ...ajustes, persona: e.target.value as PersonaId })}>
              <option value="locutora">locutora — clara, sin prisa</option>
              <option value="analista">analista — fría, segura</option>
              <option value="general">general — grave, lenta</option>
              <option value="cronista">cronista — rápida, cercana</option>
            </select>
          </label>

          <label className="vg-orbe-campo">
            <span>Velocidad</span>
            <input
              type="range"
              min={0.6}
              max={1.4}
              step={0.02}
              value={ajustes.velocidad}
              onChange={(e) => guardar({ ...ajustes, velocidad: Number(e.target.value) })}
            />
            <em>×{ajustes.velocidad.toFixed(2)}</em>
          </label>

          <label className="vg-orbe-campo">
            <span>Escuchar en</span>
            <select value={ajustes.idioma} onChange={(e) => guardar({ ...ajustes, idioma: e.target.value as AjustesOrbe["idioma"] })}>
              <option value="es-ES">español (España)</option>
              <option value="es-419">español (Latinoamérica)</option>
              <option value="es-MX">español (México)</option>
            </select>
          </label>

          <div className="vg-orbe-hoja-pie">
            <button type="button" className="vg-orbe-mini" onClick={() => guardar({ ...ajustes, x: null, y: null })}>
              centrar abajo
            </button>
            <button type="button" className="vg-orbe-mini" onClick={() => hablar("Así suena mi voz. Puedes cambiarla en los ajustes.")}>
              probar voz
            </button>
            <button type="button" className="vg-orbe-mini" onClick={() => guardar({ ...ajustes, visible: false })}>
              quitarlo (⌘J sigue)
            </button>
          </div>
          <p className="vg-orbe-nota">Se guarda en este aparato. Arrastra el orbe para moverlo; si cae sobre un botón, se aparta solo.</p>
        </div>
      ) : null}

      {tarjeta ? (
        <div className="vg-orbe-tarjeta" role="status" aria-live="polite">
          <div className="vg-orbe-tarjeta-cab">
            <span className="vg-orbe-rotulo">
              <i className="vg-orbe-punto" aria-hidden />
              {estado === "escuchando" ? "escuchando" : estado === "pensando" ? "pensando" : "LA MENTE"}
            </span>
            <button type="button" className="vg-orbe-mini" onClick={() => setHoja((v) => !v)} title="Ajustar el orbe">
              ajustes
            </button>
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
              <button type="button" className="vg-orbe-mini" onClick={() => void hablar(respuesta)}>
                repetir
              </button>
            ) : null}
            {!soporte ? <span className="vg-orbe-aviso">este navegador no sabe escuchar: usa el teclado</span> : null}
          </div>
        </div>
      ) : null}

      {!tarjeta && !hoja && estado === "inactivo" && ajustes.chips ? (
        <div className="vg-orbe-chips" aria-label="Sugerencias">
          {chips.map((c) => (
            <button key={c} type="button" className="vg-orbe-chip" onClick={() => void preguntar(c)}>
              {c}
            </button>
          ))}
        </div>
      ) : null}

      <button
        ref={botonRef}
        type="button"
        className="vg-orbe"
        data-estado={estado}
        aria-label={etiquetaEstado}
        aria-pressed={activo}
        onPointerDown={alPulsar}
        onClick={() => {
          if (arrastre.current?.movido) return;
          if (estado === "escuchando") parar();
          else if (estado === "hablando") callar();
          else escucharAhora();
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setHoja(true);
        }}
        title={`${etiquetaEstado} · toca para hablar · arrastra para mover · clic derecho: ajustes`}
      >
        <span className="vg-orbe-nucleo" aria-hidden>
          <i /><i /><i /><i /><i />
        </span>
        <span className="vg-orbe-aro vg-orbe-aro-1" aria-hidden />
        <span className="vg-orbe-aro vg-orbe-aro-2" aria-hidden />
        <span className="vg-orbe-estado">{etiquetaEstado}</span>
      </button>

      {!tarjeta && !hoja ? (
        <button type="button" className="vg-orbe-rueda" onClick={() => setHoja(true)} aria-label="Ajustar el orbe" title="Ajustar el orbe">
          ⚙
        </button>
      ) : null}
    </div>
  );
}

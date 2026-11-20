"use client";

// ═══════════════════════════════════════════════════════════════════════════
// v431.0 · LA MENTE EN TODAS PARTES — el panel global
//
// ANTES: para hablar con LA MENTE había que ir a /cuartel?sala=mente. Fuera de
// su sala no existía, y lo que te decía no tenía puertas: nombraba sitios, pero
// no te llevaba.
//
// AHORA: está en cualquier página. Se abre con ⌘J / Ctrl+J o con su botón, sabe
// en qué ruta estás (y lo usa), te lleva a los sitios con enlaces reales y deja
// los artefactos que crea para copiarlos o descargarlos.
//
// DÓNDE VIVE LO SUYO (todo en el aparato del operador, nada en servidores):
//   vg:mente:conversacion:v1   últimos 40 mensajes
//   vg:mente:artefactos:v1     lo que ha creado
//   vg:mente:memoria:v1        lo que le has pedido recordar
//
// LEY DE LA CASA: no pinta nada antes de montar (cero desajustes de hidratación);
// el panel solo existe cuando se abre, así que la casa no paga su coste.
// ═══════════════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Artefacto, Enlace, Mensaje, Paso } from "@/lib/mente/agente";
import "./panel-mente.css";

const K_CONV = "vg:mente:conversacion:v1";
const K_ARTE = "vg:mente:artefactos:v1";
const K_MEMO = "vg:mente:memoria:v1";
const MAX_MENSAJES = 40;

type Linea =
  | { rol: "operador"; texto: string }
  | { rol: "mente"; texto: string; enlaces: Enlace[]; artefactos: Artefacto[]; pasos: Paso[]; ia: boolean };

const SUGERENCIAS = [
  "Llévame al mapa",
  "¿Dónde veo las divisas?",
  "Hazme un plan de tres pasos para seguir un conflicto",
  "¿Qué hay en el cuartel?",
];

function leerJSON<T>(clave: string, defecto: T): T {
  try {
    const bruto = window.localStorage.getItem(clave);
    return bruto ? (JSON.parse(bruto) as T) : defecto;
  } catch {
    return defecto;
  }
}

function guardar(clave: string, valor: unknown) {
  try {
    window.localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    /* aparato lleno o sin permiso: la mente sigue en memoria */
  }
}

export function PanelMente() {
  const ruta = usePathname() ?? "/";
  const [montada, setMontada] = useState(false);
  const [abierta, setAbierta] = useState(false);
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [memoria, setMemoria] = useState<string[]>([]);
  const [artefactos, setArtefactos] = useState<Artefacto[]>([]);
  const [texto, setTexto] = useState("");
  const [pasos, setPasos] = useState<Paso[]>([]);
  const [cargando, setCargando] = useState(false);
  const [motor, setMotor] = useState<"desconocido" | "nube" | "casa">("desconocido");
  const [error, setError] = useState("");
  const [cajon, setCajon] = useState<"ninguno" | "artefactos">("ninguno");
  const [copiado, setCopiado] = useState("");
  const caja = useRef<HTMLTextAreaElement | null>(null);
  const hilo = useRef<HTMLDivElement | null>(null);
  const abortar = useRef<AbortController | null>(null);

  // ── montaje: se lee el aparato aquí, nunca en el render del servidor ──
  useEffect(() => {
    setLineas(leerJSON<Linea[]>(K_CONV, []));
    setMemoria(leerJSON<string[]>(K_MEMO, []));
    setArtefactos(leerJSON<Artefacto[]>(K_ARTE, []));
    setMontada(true);
    fetch("/api/mente/estado")
      .then((r) => r.json())
      .then((d) => setMotor(d?.motor === "nube" ? "nube" : "casa"))
      .catch(() => setMotor("casa"));
  }, []);

  // ── atajos y órdenes de otras piezas de la casa ──
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setAbierta((v) => !v);
      }
      if (e.key === "Escape") {
        setAbierta(false);
        setCajon("ninguno");
      }
    };
    const orden = (e: Event) => {
      const detalle = (e as CustomEvent<{ mensaje?: string }>).detail;
      setAbierta(true);
      if (detalle?.mensaje) setTexto(detalle.mensaje);
    };
    window.addEventListener("keydown", tecla);
    window.addEventListener("vg:mente:abrir", orden);
    return () => {
      window.removeEventListener("keydown", tecla);
      window.removeEventListener("vg:mente:abrir", orden);
    };
  }, []);

  useEffect(() => {
    if (!abierta) return;
    const t = window.setTimeout(() => caja.current?.focus(), 60);
    return () => window.clearTimeout(t);
  }, [abierta]);

  useEffect(() => {
    if (!abierta) return;
    const el = hilo.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [abierta, lineas, pasos]);

  const guardarConversacion = useCallback((nuevas: Linea[]) => {
    const recorte = nuevas.slice(-MAX_MENSAJES);
    setLineas(recorte);
    guardar(K_CONV, recorte);
  }, []);

  const enviar = useCallback(
    async (mensajeCrudo?: string) => {
      const mensaje = (mensajeCrudo ?? texto).trim();
      if (!mensaje || cargando) return;
      setTexto("");
      setError("");
      setPasos([{ etiqueta: "enviando", ms: 0 }]);
      setCargando(true);

      const historial: Mensaje[] = lineas.slice(-8).map((l) => ({
        rol: l.rol === "operador" ? "operador" : "mente",
        texto: l.texto,
      }));
      const conOperador: Linea[] = [...lineas, { rol: "operador", texto: mensaje }];
      guardarConversacion(conOperador);

      const control = new AbortController();
      abortar.current = control;
      let final: Linea | null = null;
      try {
        const res = await fetch("/api/mente/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
          body: JSON.stringify({ mensaje, historial, ruta, memoria }),
          signal: control.signal,
        });
        if (!res.ok || !res.body) throw new Error(`puerta ${res.status}`);

        const lector = res.body.getReader();
        const dec = new TextDecoder();
        let resto = "";

        for (;;) {
          const { done, value } = await lector.read();
          if (done) break;
          resto += dec.decode(value, { stream: true });
          const bloques = resto.split("\n\n");
          resto = bloques.pop() ?? "";
          for (const bloque of bloques) {
            const ev = /^event:\s*(.+)$/m.exec(bloque)?.[1]?.trim();
            const datos = /^data:\s*(.+)$/m.exec(bloque)?.[1];
            if (!ev || !datos || ev === "latido") continue;
            let carga: Record<string, unknown> = {};
            try {
              carga = JSON.parse(datos) as Record<string, unknown>;
            } catch {
              continue;
            }
            if (ev === "paso") {
              const p = carga as unknown as Paso;
              if (p?.etiqueta) setPasos((prev) => (prev.some((x) => x.etiqueta === p.etiqueta) ? prev : [...prev, p]));
            } else if (ev === "final") {
              const nuevos = (carga.artefactos as Artefacto[]) ?? [];
              final = {
                rol: "mente",
                texto: String(carga.respuesta ?? ""),
                enlaces: (carga.enlaces as Enlace[]) ?? [],
                artefactos: nuevos,
                pasos: (carga.pasos as Paso[]) ?? [],
                ia: Boolean(carga.ia),
              };
              setMotor(carga.motor === "nube" ? "nube" : "casa");
              const recuerdos = (carga.recuerdos as string[]) ?? [];
              if (recuerdos.length) {
                setMemoria((prev) => {
                  const nueva = Array.from(new Set([...prev, ...recuerdos])).slice(-12);
                  guardar(K_MEMO, nueva);
                  return nueva;
                });
              }
              if (nuevos.length) {
                setArtefactos((prev) => {
                  const juntos = [...nuevos, ...prev].slice(0, 30);
                  guardar(K_ARTE, juntos);
                  return juntos;
                });
              }
            } else if (ev === "error") {
              setError(String(carga.mensaje ?? "La mente no respondió."));
            }
          }
        }

        if (final) guardarConversacion([...conOperador, final]);
        else setError("La mente cerró la conexión sin respuesta. Prueba otra vez.");
      } catch (e) {
        if ((e as Error)?.name === "AbortError") {
          setError("Interrumpido. Puedes volver a preguntar cuando quieras.");
        } else {
          setError("No se pudo hablar con la mente. Revisa la conexión.");
        }
      } finally {
        setCargando(false);
        setPasos([]);
        abortar.current = null;
      }
    },
    [texto, cargando, lineas, ruta, memoria, guardarConversacion]
  );

  const detener = useCallback(() => {
    abortar.current?.abort();
  }, []);

  const copiarTextoLargo = useCallback(async (etiqueta: string, contenido: string) => {
    try {
      await navigator.clipboard.writeText(contenido);
      setCopiado(etiqueta);
      window.setTimeout(() => setCopiado(""), 1400);
    } catch {
      /* sin portapapeles: queda la descarga */
    }
  }, []);

  const descargar = useCallback((a: Artefacto) => {
    try {
      const blob = new Blob([a.contenido], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `${a.titulo.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "mente"}.md`;
      enlace.click();
      URL.revokeObjectURL(url);
    } catch {
      /* nada que hacer */
    }
  }, []);

  /** Leer la respuesta en voz alta (Web Speech del navegador; si no hay, no pasa nada). */
  const escuchar = useCallback((t: string) => {
    try {
      const sintesis = window.speechSynthesis;
      if (!sintesis) return;
      sintesis.cancel();
      const voz = new SpeechSynthesisUtterance(t);
      voz.lang = "es-ES";
      voz.rate = 1.02;
      sintesis.speak(voz);
    } catch {
      /* aparato sin voz */
    }
  }, []);

  const vaciar = useCallback(() => {
    guardarConversacion([]);
    setError("");
  }, [guardarConversacion]);

  const etiquetaMotor = useMemo(() => {
    if (motor === "nube") return { texto: "núcleo conectado", vivo: true };
    if (motor === "casa") return { texto: "modo casa", vivo: false };
    return { texto: "comprobando", vivo: false };
  }, [motor]);

  // Nada en el servidor: la casa no hidrata un panel que está cerrado.
  if (!montada) return null;

  const lanzador = (
    <button
      type="button"
      className="vg-mente-fab"
      onClick={() => setAbierta(true)}
      aria-label="Abrir LA MENTE"
      title="Hablar con LA MENTE (⌘J)"
    >
      <span aria-hidden>◈</span> LA MENTE <kbd>⌘J</kbd>
    </button>
  );

  if (!abierta) return lanzador;

  const ultima = [...lineas].reverse().find((l) => l.rol === "mente");

  return (
    <>
      {lanzador}
      <div className="vg-mente-velo" onClick={() => setAbierta(false)} aria-hidden />
      <section className="vg-mente" role="dialog" aria-modal="true" aria-label="LA MENTE" data-motor={motor === "nube" ? "nube" : "casa"}>
        <header className="vg-mente-cab">
          <span className="vg-mente-marca">LA MENTE</span>
          <span className="vg-mente-motor" data-vivo={etiquetaMotor.vivo ? "1" : "0"} title="Con qué motor está hablando">
            {etiquetaMotor.texto}
          </span>
          <div className="vg-mente-acciones">
            <button
              type="button"
              onClick={() => setCajon(cajon === "artefactos" ? "ninguno" : "artefactos")}
              title="Lo que la mente ha creado"
              aria-pressed={cajon === "artefactos"}
            >
              artefactos {artefactos.length ? `(${artefactos.length})` : ""}
            </button>
            <button type="button" className="vg-mente-cerrar" onClick={() => setAbierta(false)} aria-label="Cerrar">
              ×
            </button>
          </div>
        </header>

        {motor === "casa" ? (
          <p className="vg-mente-aviso">
            Modo casa: el núcleo de lenguaje no responde ahora mismo. Te llevo a los sitios y te dejo esqueletos editables; la conversación
            abierta volverá cuando el núcleo despierte.
          </p>
        ) : null}

        {cajon === "artefactos" ? (
          <div className="vg-mente-cajon">
            {artefactos.length === 0 ? (
              <p className="vg-mente-vacio">Aquí aparecerá lo que la mente cree: planes, documentos, tablas, código.</p>
            ) : (
              artefactos.map((a) => (
                <div key={a.id} className="vg-mente-arte">
                  <div className="vg-mente-arte-cab">
                    <b>{a.titulo}</b>
                    <i>{a.tipo}</i>
                    <span className="vg-mente-arte-acc">
                      <button type="button" onClick={() => copiarTextoLargo(a.id, a.contenido)}>
                        {copiado === a.id ? "copiado" : "copiar"}
                      </button>
                      <button type="button" onClick={() => descargar(a)}>
                        .md
                      </button>
                    </span>
                  </div>
                  <pre>{a.contenido}</pre>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="vg-mente-hilo" ref={hilo}>
            {lineas.length === 0 && !cargando ? (
              <div className="vg-mente-linea" data-rol="mente">
                <div className="vg-mente-burbuja">
                  Soy LA MENTE. Te llevo a cualquier lugar de la casa, busco dentro de ella y creo lo que necesites. Pregúntame lo que sea o
                  dime «llévame a…».
                </div>
              </div>
            ) : null}

            {lineas.map((l, i) => (
              <div key={i} className="vg-mente-linea" data-rol={l.rol}>
                <div className="vg-mente-burbuja">{l.texto}</div>

                {l.rol === "mente" && l.pasos.length ? (
                  <div className="vg-mente-pasos">
                    {l.pasos.map((p, j) => (
                      <span key={j}>{p.etiqueta}</span>
                    ))}
                  </div>
                ) : null}

                {l.rol === "mente" && l.enlaces.length ? (
                  <div className="vg-mente-enlaces">
                    {l.enlaces.map((e) => (
                      <Link key={e.ruta} href={e.ruta} className="vg-mente-enlace" onClick={() => setAbierta(false)}>
                        <b>{e.nombre}</b>
                        <span className="vg-mente-enlace-ruta">{e.ruta}</span>
                        <em>{e.porque}</em>
                      </Link>
                    ))}
                  </div>
                ) : null}

                {l.rol === "mente"
                  ? l.artefactos.map((a) => (
                      <div key={a.id} className="vg-mente-arte">
                        <div className="vg-mente-arte-cab">
                          <b>{a.titulo}</b>
                          <i>{a.tipo}</i>
                          <span className="vg-mente-arte-acc">
                            <button type="button" onClick={() => copiarTextoLargo(a.id, a.contenido)}>
                              {copiado === a.id ? "copiado" : "copiar"}
                            </button>
                            <button type="button" onClick={() => descargar(a)}>
                              .md
                            </button>
                          </span>
                        </div>
                        <pre>{a.contenido}</pre>
                      </div>
                    ))
                  : null}

                {l.rol === "mente" && l.texto ? (
                  <div className="vg-mente-mini">
                    <button type="button" onClick={() => copiarTextoLargo(`t${i}`, l.texto)}>
                      {copiado === `t${i}` ? "copiado" : "copiar"}
                    </button>
                    <button type="button" onClick={() => escuchar(l.texto)}>
                      escuchar
                    </button>
                    {!l.ia ? <span className="vg-mente-sin-ia">sin modelo</span> : null}
                  </div>
                ) : null}
              </div>
            ))}

            {cargando ? (
              <div className="vg-mente-linea" data-rol="mente">
                <div className="vg-mente-pasos">
                  {(pasos.length ? pasos : [{ etiqueta: "pensando", ms: 0 }]).map((p, i) => (
                    <span key={i}>{p.etiqueta}…</span>
                  ))}
                </div>
                <div className="vg-mente-mini">
                  <button type="button" onClick={detener}>
                    detener
                  </button>
                </div>
              </div>
            ) : null}

            {error ? (
              <div className="vg-mente-linea" data-rol="mente">
                <div className="vg-mente-burbuja">{error}</div>
              </div>
            ) : null}
          </div>
        )}

        {lineas.length === 0 && cajon === "ninguno" ? (
          <div className="vg-mente-sugerencias">
            {SUGERENCIAS.map((s) => (
              <button key={s} type="button" onClick={() => void enviar(s)}>
                {s}
              </button>
            ))}
          </div>
        ) : null}

        <footer className="vg-mente-pie">
          <div className="vg-mente-caja">
            <textarea
              ref={caja}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void enviar();
                }
              }}
              placeholder="Habla con LA MENTE… (Enter envía, Mayús+Enter salta línea)"
              rows={1}
              maxLength={1500}
            />
            <button type="button" className="vg-mente-enviar" onClick={() => void enviar()} disabled={cargando || !texto.trim()}>
              {cargando ? "…" : "ENVIAR"}
            </button>
          </div>
          <div className="vg-mente-nota">
            <span>
              {memoria.length
                ? `Recuerda ${memoria.length} dato(s) tuyos · en este aparato`
                : "Conversación y artefactos guardados solo en este aparato"}
            </span>
            {ultima ? (
              <button type="button" onClick={() => escuchar(ultima.texto)}>
                escuchar
              </button>
            ) : null}
            {lineas.length ? (
              <button type="button" onClick={vaciar}>
                vaciar hilo
              </button>
            ) : null}
          </div>
        </footer>
      </section>
    </>
  );
}

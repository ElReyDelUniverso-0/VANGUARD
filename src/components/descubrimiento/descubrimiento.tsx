"use client";

// ═══════════════════════════════════════════════════════════════════════════
// v435.2 · VANGUARD DISCOVERY SYSTEM — la pieza que acompaña en toda la casa
//
// Un solo lanzador discreto (abajo a la izquierda) con tres caras:
//   ① ESTA SALA — qué es lo que tienes delante y tres cosas que puedes hacer.
//      Aparece sola la primera vez que pisas una sala, SOLO si llevas poco
//      recorrido; a los veteranos no les da la lata.
//   ② GUÍAS — cuatro caminos con pasos que existen de verdad; cada paso te
//      lleva a la puerta y tú decides cuándo darlo por hecho.
//   ③ PROGRESO — qué has visto de la casa, tres puertas que no has abierto y
//      el interruptor del MODO LIBRE (la casa deja de explicarse).
//
// Libertad primero: nada bloquea, nada tapa, nada obliga. Cerrar el panel no
// borra el progreso, y el modo libre se recuerda.
// ═══════════════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Check, ChevronRight, Compass, Info, Lock, RotateCcw, Sparkles, X } from "lucide-react";
import { fichaDe, TOTAL_FICHAS, type Ficha } from "@/lib/descubrimiento/fichas";
import { GUIAS, GUIA_POR_ID, guiaSugerida, pasoDe } from "@/lib/descubrimiento/guias";
import {
  EVENTO, fichasVisitadas, guardar, leer, marcarVisita, pctDescubierto, recomendarVarias,
  registrarPaso, reiniciar, type Progreso,
} from "@/lib/descubrimiento/progreso";
import { ultimosDestacados } from "@/lib/descubrimiento/destacados";
// v436.2 · cada acción con su voz y sus dos interruptores
import { suena } from "@/lib/sonido/tocar";
import { AjustesVivo } from "@/components/interfaz/ajustes-vivo";
import "./descubrimiento.css";

type Cara = "sala" | "guias" | "progreso";

/** Donde NO se abre sola la ficha: la portada y las salas de entrada. */
const SIN_AVISO = ["/", "/descubrir", "/entrar", "/vanguard2", "/vertigo", "/offline", "/cortina", "/trailer"];

/** Donde el lanzador NI SIQUIERA se monta: pantalla completa y el propio hub.
 *  La portada NO está aquí a propósito: si el mapa no está en la puerta de
 *  entrada, nadie lo encuentra. */
const SIN_MONTAJE = ["/descubrir", "/vanguard2", "/vertigo", "/offline", "/cortina", "/trailer", "/entrar"];

function enLista(ruta: string, lista: string[]): boolean {
  return lista.some((r) => ruta === r || ruta.startsWith(r + "/"));
}

export function Descubrimiento() {
  const ruta = usePathname() ?? "/";
  const router = useRouter();
  const [montado, setMontado] = useState(false);
  const [progreso, setProgreso] = useState<Progreso | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [cara, setCara] = useState<Cara>("sala");
  const [guiaId, setGuiaId] = useState<string | null>(null);

  const ficha = useMemo<Ficha | null>(() => fichaDe(ruta), [ruta]);
  const guia = guiaId ? GUIA_POR_ID.get(guiaId) ?? null : null;

  // ── carga, visita y aviso de bienvenida ──────────────────────────────────
  useEffect(() => {
    const p = leer();
    setProgreso(p);
    setMontado(true);
    // en una puerta sin ficha (la portada, por ejemplo) se abre por las guías:
    // «esta sala» no tendría nada que contar
    if (!fichaDe(window.location.pathname)) setCara("guias");
  }, []);

  useEffect(() => {
    if (!montado || !progreso) return;
    const antes = progreso.visitadas[ruta.split("#")[0].split("?")[0]];
    const actualizado = marcarVisita(progreso, ruta);
    if (!antes) {
      guardar(actualizado);
      setProgreso(actualizado);
      // a quien acaba de llegar se le explica la sala; al veterano, no
      const pct = pctDescubierto(actualizado);
      suena("sala-nueva");
      // v436.6 — EL PANEL YA NO SE ABRE SOLO. Orden del Dueño: al entrar, el
      // panel de descubrimiento se abría encima del muelle de herramientas y
      // tapaba la sala. La guía sigue ahí, en el lanzador de la izquierda con
      // su anillo de progreso: se abre cuando el lector la pide, no antes.
      if (!actualizado.modoLibre && !actualizado.avisosApagados && pct < 30 && ficha && !enLista(ruta, SIN_AVISO)) {
        setCara("sala");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ruta, montado]);

  // primera vez: la guía sugerida queda preparada
  useEffect(() => {
    if (!progreso) return;
    setGuiaId((g) => g ?? guiaSugerida(progreso.guias).id);
  }, [progreso]);

  useEffect(() => {
    const alCambiar = (e: Event) => {
      const d = (e as CustomEvent<Progreso>).detail;
      if (d && typeof d === "object") setProgreso(d);
    };
    window.addEventListener(EVENTO, alCambiar);
    return () => window.removeEventListener(EVENTO, alCambiar);
  }, []);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, []);

  const cerrar = useCallback(() => {
    suena("panel-cerrar");
    setAbierto(false);
  }, []);

  const actualizar = useCallback((p: Progreso) => {
    guardar(p);
    setProgreso(p);
  }, []);

  if (!montado || !progreso) return null;

  // el hub ya explica todo, y en las salas de pantalla completa no se monta nada
  if (enLista(ruta, SIN_MONTAJE)) return null;

  const pct = pctDescubierto(progreso);
  const vistas = fichasVisitadas(progreso);
  const sugeridas = recomendarVarias(progreso, 3);
  const pasoActual = guia ? progreso.guias[guia.id] ?? 0 : 0;
  const paso = guia ? pasoDe(guia.id, pasoActual) : null;
  const destacados = ultimosDestacados(3);

  const ir = (destino: string, voz: string = "viaje") => {
    suena(voz);
    setAbierto(false);
    router.push(destino);
  };

  const abrirPanel = () => {
    suena("panel-abrir");
    setAbierto(true);
  };

  const cambiarCara = (c: Cara) => {
    suena("pestana");
    setCara(c);
  };

  return (
    <>
      {!abierto ? (
        <button
          type="button"
          className={progreso.modoLibre ? "vd-burbuja vd-burbuja-libre" : "vd-burbuja"}
          onClick={abrirPanel}
          aria-label="Abrir la guía de la casa"
          title={progreso.modoLibre ? "Descubrimiento (modo libre — sigues tú al mando)" : "¿Perdido? Te guío"}
        >
          <Compass className="w-4 h-4" />
          {pct < 100 ? <span className="vd-anillo" style={{ ["--pct" as string]: `${pct}%` }} aria-hidden /> : null}
        </button>
      ) : null}

      {abierto ? (
        <aside className="vd-panel vv-entra" role="dialog" aria-label="Descubrimiento de Vanguard" aria-modal={false}>
          <header className="vd-cab">
            <span className="vd-rotulo"><Compass className="w-3.5 h-3.5" /> descubrir</span>
            <div className="vd-tabs" role="tablist" aria-label="Caras del descubrimiento">
              <button type="button" role="tab" aria-selected={cara === "sala"} className={cara === "sala" ? "vd-tab on" : "vd-tab"} onClick={() => cambiarCara("sala")}>esta sala</button>
              <button type="button" role="tab" aria-selected={cara === "guias"} className={cara === "guias" ? "vd-tab on" : "vd-tab"} onClick={() => cambiarCara("guias")}>guías</button>
              <button type="button" role="tab" aria-selected={cara === "progreso"} className={cara === "progreso" ? "vd-tab on" : "vd-tab"} onClick={() => cambiarCara("progreso")}>progreso</button>
            </div>
            <button type="button" className="vd-x" onClick={cerrar} aria-label="Cerrar"><X className="w-3.5 h-3.5" /></button>
          </header>

          {/* ① ESTA SALA */}
          {cara === "sala" ? (
            <div className="vd-cuerpo">
              {ficha ? (
                <>
                  <div className="vd-distintivo">
                    <span>{ficha.division}</span>
                    <span>{ficha.divisionNombre}</span>
                    {ficha.vivo ? <span className="vd-vivo">en vivo</span> : null}
                    {ficha.nivel === "sin prisa" ? <span className="vd-suave">sin prisa</span> : <span className="vd-suave">a fondo</span>}
                  </div>
                  <h3 className="vd-titulo">{ficha.nombre}</h3>
                  <p className="vd-que">{ficha.que}</p>
                  <span className="vd-rotulo-mini">qué puedes hacer aquí</span>
                  <ul className="vd-ejemplos">
                    {ficha.ejemplos.map((e, i) => (
                      <li key={i}><Check className="w-3 h-3" /> {e}</li>
                    ))}
                  </ul>
                  <div className="vd-acciones">
                    <Link className="vd-b" href="/descubrir">todas las salas</Link>
                    <button type="button" className="vd-b vd-b-suave" onClick={() => cambiarCara("guias")}>
                      <BookOpen className="w-3 h-3" /> guíame
                    </button>
                  </div>
                </>
              ) : (
                <p className="vd-que">Esta puerta no está en el catálogo de la casa, así que no tengo una ficha que darte. Puedes abrir <Link href="/orden">el índice completo</Link> o preguntarle al <Link href="/buscar">buscador</Link>.</p>
              )}
              <span className="vd-rotulo-mini">lo último que llegó</span>
              <ul className="vd-destacados" data-vg-vivo>
                {destacados.map((d) => (
                  <li key={d.version}>
                    <button type="button" onClick={() => ir(d.ruta)}>
                      <b>{d.nombre}</b>
                      <em>{d.version} · {d.que}</em>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="vd-pie-acciones">
                <button type="button" className="vd-enlace" onClick={() => { suena("guardar"); actualizar({ ...progreso, avisosApagados: true }); }}>
                  no volver a explicarme las salas
                </button>
              </div>
            </div>
          ) : null}

          {/* ② GUÍAS */}
          {cara === "guias" ? (
            <div className="vd-cuerpo">
              <div className="vd-guias" data-vg-vivo>
                {GUIAS.map((g) => {
                  const hechos = progreso.guias[g.id] ?? 0;
                  const on = g.id === guiaId;
                  return (
                    <button key={g.id} type="button" className={`vd-guia ${on ? "on" : ""}`} onClick={() => { suena("guia-elegida"); setGuiaId(g.id); }}>
                      <span className="vd-guia-nombre" style={{ color: g.color }}>{g.nombre}</span>
                      <span className="vd-guia-para">{g.para}</span>
                      <span className="vd-guia-pct">{hechos >= g.pasos.length ? "hecha" : `${hechos}/${g.pasos.length}`}</span>
                    </button>
                  );
                })}
              </div>

              {guia ? (
                <>
                  <p className="vd-promesa"><Sparkles className="w-3 h-3" /> {guia.promesa}</p>
                  <ol className="vd-pasos">
                    {guia.pasos.map((p, i) => {
                      const hecho = i < pasoActual;
                      const actual = i === pasoActual;
                      return (
                        <li key={p.ruta + i} className={`vd-paso ${hecho ? "hecho" : ""} ${actual ? "actual" : ""}`}>
                          <span className="vd-paso-n">{hecho ? <Check className="w-3 h-3" /> : i + 1}</span>
                          <div className="vd-paso-txt">
                            <b>{fichaDe(p.ruta)?.nombre ?? p.ruta}</b>
                            <em>{p.que}</em>
                            {actual ? <span className="vd-haz">{p.haz}</span> : null}
                          </div>
                          <div className="vd-paso-acciones">
                            <button type="button" className="vd-mini" onClick={() => ir(p.ruta, "paso-ir")} title="Ir a este paso">ir</button>
                            {!hecho ? (
                              <button
                                type="button"
                                className="vd-mini vd-mini-ok"
                                onClick={() => { suena("paso-hecho"); actualizar(registrarPaso(progreso, guia.id, i)); }}
                                title="Dar por hecho"
                              >
                                hecho
                              </button>
                            ) : null}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                  {paso ? (
                    <p className="vd-paso-pie">
                      Paso {Math.min(pasoActual + 1, guia.pasos.length)} de {guia.pasos.length} · ~{paso.minutos} min
                    </p>
                  ) : null}
                </>
              ) : null}

              <div className="vd-pie-acciones">
                <button type="button" className="vd-enlace" onClick={() => { suena("modo-libre"); actualizar({ ...progreso, modoLibre: true }); }}>
                  explorar por mi cuenta (sin guía)
                </button>
              </div>
            </div>
          ) : null}

          {/* ③ PROGRESO */}
          {cara === "progreso" ? (
            <div className="vd-cuerpo">
              <div className="vd-barra">
                <i style={{ width: `${pct}%` }} />
              </div>
              <p className="vd-cifra">
                <b>{pct} %</b> de la casa descubierta · {vistas} de {TOTAL_FICHAS} salas
              </p>

              <span className="vd-rotulo-mini">tres puertas que no has abierto</span>
              <ul className="vd-sugeridas" data-vg-vivo>
                {sugeridas.length === 0 ? (
                  <li className="vd-que">Has entrado en todas las salas del catálogo. Ya no hay nada que enseñarte: ahora manda tu criterio.</li>
                ) : (
                  sugeridas.map((f) => (
                    <li key={f.href}>
                      <button type="button" onClick={() => ir(f.href)}>
                        <b>{f.nombre}</b>
                        <em>{f.que}</em>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </li>
                  ))
                )}
              </ul>

              <span className="vd-rotulo-mini">la casa, a tu manera</span>
              <label className="vd-switch">
                <input
                  type="checkbox"
                  checked={progreso.modoLibre}
                  onChange={(e) => { suena("modo-libre"); actualizar({ ...progreso, modoLibre: e.target.checked }); }}
                />
                <span>
                  <b>Modo libre</b>
                  <em>la casa deja de explicarse; sigues teniendo el lanzador</em>
                </span>
              </label>
              <label className="vd-switch">
                <input
                  type="checkbox"
                  checked={progreso.avisosApagados}
                  onChange={(e) => { suena("guardar"); actualizar({ ...progreso, avisosApagados: e.target.checked }); }}
                />
                <span>
                  <b>Avisos de sala</b>
                  <em>dejar de abrir la ficha al entrar en una sala nueva</em>
                </span>
              </label>

              <span className="vd-rotulo-mini">sonido y movimiento</span>
              <AjustesVivo />

              <div className="vd-acciones">
                <Link className="vd-b" href="/descubrir">el mapa completo</Link>
                <Link className="vd-b vd-b-suave" href="/novedades">lo nuevo</Link>
                <button type="button" className="vd-b vd-b-suave" onClick={() => { suena("reiniciar"); actualizar(reiniciar()); }} title="Borra lo apuntado en este aparato">
                  <RotateCcw className="w-3 h-3" /> reiniciar
                </button>
              </div>
              <p className="vd-nota"><Lock className="w-3 h-3" /> Todo esto vive en tu aparato. Nadie más lo ve.</p>
            </div>
          ) : null}
        </aside>
      ) : null}
    </>
  );
}

/** Pieza de la portada del hub: un botón para empezar la guía donde toca. */
export function BotonEmpezarGuia({ etiqueta = "Empezar la guía" }: { etiqueta?: string }) {
  const router = useRouter();
  const [listo, setListo] = useState(false);
  useEffect(() => setListo(true), []);
  return (
    <button
      type="button"
      className="vd-b vd-b-oro"
      onClick={() => {
        const p = leer();
        const g = guiaSugerida(p.guias);
        const paso = pasoDe(g.id, p.guias[g.id] ?? 0);
        router.push(paso?.ruta ?? "/guerra-hoy");
      }}
      disabled={!listo}
    >
      <Compass className="w-3.5 h-3.5" /> {etiqueta}
    </button>
  );
}

/** Aviso honesto para las salas que aún no tienen ficha. */
export function SinFicha() {
  return <p className="vd-que"><Info className="w-3 h-3" /> Esta sala todavía no tiene ficha en el descubrimiento.</p>;
}

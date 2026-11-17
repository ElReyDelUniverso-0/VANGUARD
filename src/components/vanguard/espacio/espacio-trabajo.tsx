"use client";

// ═══════════════════════════════════════════════════════════════════
// v405.11 · EL ESPACIO DE TRABAJO — la mesa del operador
//
// QUÉ ES: el sitio donde uno organiza SU trabajo dentro de la casa. No es una
// sala más del catálogo: es el escritorio. Proyectos, y dentro de cada
// proyecto, piezas (mapas, simulaciones, escenarios, herramientas,
// investigaciones, notas, enlaces) y paneles que se ordenan y se apagan.
//
// LO QUE YA EXISTÍA Y AQUÍ SE REÚNE (sin borrarlo): los favoritos del riel
// (vg171-favoritos), el uso real de las salas (vg195-atajos-usage) —se traen
// al primer proyecto con `migrarLegado`— y el orden de las herramientas de la
// navegación (vx405.10-navegacion), que se sigue usando desde la barra.
//
// TODO SE GUARDA EN EL APARATO: proyectos, paneles, sesiones, actividad y
// papelera viven en localStorage. Nada viaja a un servidor porque no hay
// cuentas todavía; y el panel de papelera y el de recuperar existen para que
// un error nunca cueste trabajo.
// ═══════════════════════════════════════════════════════════════════
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { IconoNav } from "@/components/vanguard/navegacion/iconos-nav";
import { ESPACIOS, ESPACIO_POR_CLAVE } from "@/lib/navegacion/espacios";
import type { ClaveEspacio } from "@/lib/navegacion/tipos";
import {
  CLASES, PANELES, añadirElemento, abrirProyecto, abrirSesion, alternarPanel, archivarProyecto,
  borrarSesion, cargar, crearProyecto, deshacer, editarProyecto, elementosOrdenados, estadoInicial,
  exportar, fijarElemento, guardar, guardarSesion, importar, leerLegado, marcarUso, migrarLegado,
  moverPanel, panelesVisibles, proyectoActivo, quitarElemento, recuperarProyecto,
  restaurarDePapelera, vaciarPapelera,
} from "@/lib/espacio/almacen";
import type { ClaseElemento, Elemento, EstadoEspacio, PanelId, Proyecto } from "@/lib/espacio/almacen";

const COLORES = ["#5eead4", "#f5a623", "#f472b6", "#3ddcff", "#a78bfa", "#34d399", "#e8c56a", "#ff3b30"];

/** Una sola copia del estado por pestaña: el hook y la hoja hablan con ella. */
let estadoMemoria: EstadoEspacio | null = null;
const oyentes = new Set<(e: EstadoEspacio) => void>();

function emitir(e: EstadoEspacio) {
  estadoMemoria = e;
  guardar(e);
  for (const o of oyentes) o(e);
}

export function useEspacio() {
  const [estado, setEstado] = useState<EstadoEspacio>(() => estadoMemoria ?? estadoInicial());

  useEffect(() => {
    // ① leer lo guardado ② sembrar con el legado si es la primera vez
    let inicial = estadoMemoria ?? cargar();
    if (!inicial.migrado) {
      const legado = leerLegado();
      const migrado = migrarLegado(inicial, legado);
      if (migrado !== inicial) {
        inicial = migrado;
        guardar(inicial);
      }
    }
    estadoMemoria = inicial;
    setEstado(inicial);
    oyentes.add(setEstado);
    return () => {
      oyentes.delete(setEstado);
    };
  }, []);

  const aplicar = useCallback((fn: (e: EstadoEspacio) => EstadoEspacio) => {
    const base = estadoMemoria ?? estadoInicial();
    emitir(fn(base));
  }, []);

  return { estado, aplicar };
}

const formatFecha = (iso?: string) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("es-DO", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
};

export function EspacioTrabajo() {
  const { estado, aplicar } = useEspacio();
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [clase, setClase] = useState<ClaseElemento>("mapa");
  const [titulo, setTitulo] = useState("");
  const [href, setHref] = useState("");
  const [nota, setNota] = useState("");
  const [filtro, setFiltro] = useState<ClaseElemento | "todo">("todo");
  const [espacioAccesos, setEspacioAccesos] = useState<ClaveEspacio>("geo");
  const [aviso, setAviso] = useState<string | null>(null);
  const [importando, setImportando] = useState(false);
  const areaImport = useRef<HTMLTextAreaElement | null>(null);

  const proyecto = proyectoActivo(estado);
  const activos = estado.proyectos.filter((p) => !p.archivado);
  const archivados = estado.proyectos.filter((p) => p.archivado);
  const paneles = panelesVisibles(proyecto);
  const piezas = useMemo(() => elementosOrdenados(proyecto, filtro === "todo" ? undefined : filtro), [proyecto, filtro]);
  const cuenta = useMemo(() => {
    const m: Record<string, number> = {};
    for (const el of proyecto.elementos) m[el.clase] = (m[el.clase] ?? 0) + 1;
    return m;
  }, [proyecto]);

  useEffect(() => {
    if (!aviso) return;
    const t = window.setTimeout(() => setAviso(null), 3200);
    return () => window.clearTimeout(t);
  }, [aviso]);

  const añadir = () => {
    if (!titulo.trim()) return;
    aplicar((e) => añadirElemento(e, proyecto.id, { clase, titulo, href: href.trim() || undefined, nota: nota.trim() || undefined }));
    setTitulo("");
    setHref("");
    setNota("");
    setAviso("Pieza añadida al proyecto");
  };

  const añadirHerramienta = (id: string, nombre: string, destino: string, color: string) => {
    const cl = id.includes("mapa") || destino.includes("mapas") ? "mapa" : id.includes("sim") || destino.includes("teatro") ? "simulacion" : "herramienta";
    aplicar((e) => añadirElemento(e, proyecto.id, { clase: cl as ClaseElemento, titulo: nombre, href: destino, etiquetas: [ESPACIO_POR_CLAVE[espacioAccesos].nombre], origen: "registro" }));
    setAviso(`${nombre} añadida (${color})`);
  };

  const exportarArchivo = () => {
    const json = exportar(estado);
    try {
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vanguard-espacio-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setAviso("Espacio exportado a tu equipo");
    } catch {
      setAviso("El navegador no dejó descargar: copia el JSON del panel");
    }
  };

  const hacerImportacion = () => {
    const json = areaImport.current?.value ?? "";
    if (!json.trim()) return;
    let resultado: { estado: EstadoEspacio; añadidos: number; error?: string } = { estado, añadidos: 0 };
    aplicar((e) => {
      resultado = importar(e, json);
      return resultado.estado;
    });
    setAviso(resultado.error ?? `${resultado.añadidos} proyecto(s) importados`);
    if (areaImport.current) areaImport.current.value = "";
    setImportando(false);
  };

  const Controles = ({ panel }: { panel: PanelId }) => (
    <div className="vx-esp-panel-acc">
      <button type="button" aria-label="Subir panel" onClick={() => aplicar((e) => moverPanel(e, proyecto.id, panel, -1))}>
        <IconoNav nombre="chevron-up" />
      </button>
      <button type="button" aria-label="Bajar panel" onClick={() => aplicar((e) => moverPanel(e, proyecto.id, panel, 1))}>
        <IconoNav nombre="chevron-down" />
      </button>
      <button type="button" aria-label="Apagar panel" onClick={() => aplicar((e) => alternarPanel(e, proyecto.id, panel))}>
        <IconoNav nombre="x" />
      </button>
    </div>
  );

  const panelesApagados = proyecto.paneles.filter((q) => proyecto.ocultos.includes(q));

  return (
    <div className="vx-esp" style={{ "--esp": proyecto.color } as React.CSSProperties}>
      {/* ── la cabecera: proyectos y acciones de la mesa ─────────────── */}
      <header className="vx-esp-cab">
        <div className="vx-esp-proyectos">
          {activos.map((p) => (
            <button
              key={p.id}
              type="button"
              className="vx-esp-proy"
              data-on={p.id === proyecto.id ? "1" : "0"}
              style={{ "--proy": p.color } as React.CSSProperties}
              onClick={() => aplicar((e) => abrirProyecto(e, p.id))}
            >
              <i aria-hidden />
              <b>{p.nombre}</b>
              <em>{p.elementos.length}</em>
            </button>
          ))}
          <form
            className="vx-esp-nuevo"
            onSubmit={(ev) => {
              ev.preventDefault();
              if (!nuevoNombre.trim()) return;
              aplicar((e) => crearProyecto(e, nuevoNombre, COLORES[estado.proyectos.length % COLORES.length]));
              setNuevoNombre("");
              setAviso("Proyecto creado");
            }}
          >
            <input value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} placeholder="Nuevo proyecto…" aria-label="Nombre del nuevo proyecto" />
            <button type="submit" aria-label="Crear proyecto">+</button>
          </form>
        </div>

        <div className="vx-esp-acciones">
          <button type="button" onClick={() => aplicar((e) => guardarSesion(e))}>Guardar sesión</button>
          <button type="button" onClick={exportarArchivo}>Exportar</button>
          <button type="button" onClick={() => setImportando((v) => !v)}>{importando ? "Cerrar" : "Importar"}</button>
          <button type="button" disabled={!estado.historial.length} onClick={() => { aplicar(deshacer); setAviso("Un paso atrás"); }}>
            <IconoNav nombre="chevron-left" /> Deshacer
          </button>
          <Link href="/navegacion" className="vx-esp-enlace">Arquitectura ▸</Link>
        </div>
      </header>

      {importando && (
        <section className="vx-esp-importar" aria-label="Importar un espacio">
          <p>Pega el JSON de otro espacio (o de una copia de seguridad). Se AÑADE a lo que ya tienes: no se pisa nada.</p>
          <textarea ref={areaImport} rows={4} placeholder='{"app":"vanguard","proyectos":[…]}' />
          <button type="button" onClick={hacerImportacion}>Importar ahora</button>
        </section>
      )}

      {aviso && <p className="vx-esp-aviso" role="status">{aviso}</p>}

      {/* ── la mesa: los paneles del proyecto, en su orden ───────────── */}
      <div className="vx-esp-mesa">
        {paneles.map((panel) => (
          <section key={panel} className="vx-esp-panel" data-panel={panel} aria-label={PANELES.find((p) => p.clave === panel)?.nombre}>
            <header className="vx-esp-panel-cab">
              <div>
                <h2>{PANELES.find((p) => p.clave === panel)?.nombre}</h2>
                <p>{PANELES.find((p) => p.clave === panel)?.desc}</p>
              </div>
              <Controles panel={panel} />
            </header>

            {panel === "elementos" && (
              <>
                <div className="vx-esp-filtros">
                  <button type="button" data-on={filtro === "todo" ? "1" : "0"} onClick={() => setFiltro("todo")}>Todo ({proyecto.elementos.length})</button>
                  {CLASES.map((c) => (
                    <button key={c.clave} type="button" data-on={filtro === c.clave ? "1" : "0"} style={{ "--cl": c.color } as React.CSSProperties} onClick={() => setFiltro(c.clave)}>
                      {c.nombre} {cuenta[c.clave] ? `(${cuenta[c.clave]})` : ""}
                    </button>
                  ))}
                </div>

                <ul className="vx-esp-piezas">
                  {piezas.length === 0 && <li className="vx-esp-vacio">Todavía no hay piezas. Añade una abajo o desde los accesos.</li>}
                  {piezas.map((el) => {
                    const c = CLASES.find((x) => x.clave === el.clase)!;
                    return (
                      <li key={el.id} data-fijado={el.fijado ? "1" : "0"} style={{ "--cl": c.color } as React.CSSProperties}>
                        <span className="vx-esp-pieza-ico"><IconoNav nombre={c.icono} /></span>
                        <div className="vx-esp-pieza-txt">
                          {el.href ? (
                            <Link href={el.href} onClick={() => aplicar((e) => marcarUso(e, proyecto.id, el.id))}>{el.titulo}</Link>
                          ) : (
                            <b>{el.titulo}</b>
                          )}
                          {el.nota && <p>{el.nota}</p>}
                          <em>
                            {c.nombre} · añadida {formatFecha(el.creado)}
                            {el.origen && el.origen !== "manual" ? ` · viene de ${el.origen}` : ""}
                          </em>
                        </div>
                        <span className="vx-esp-pieza-acc">
                          <button type="button" aria-pressed={!!el.fijado} aria-label={el.fijado ? "Soltar" : "Fijar arriba"} onClick={() => aplicar((e) => fijarElemento(e, proyecto.id, el.id))}>
                            <IconoNav nombre={el.fijado ? "check" : "chevron-up"} />
                          </button>
                          <button type="button" aria-label={`Quitar ${el.titulo}`} onClick={() => { aplicar((e) => quitarElemento(e, proyecto.id, el.id)); setAviso("Movida a la papelera"); }}>
                            <IconoNav nombre="x" />
                          </button>
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <form className="vx-esp-anadir" onSubmit={(e) => { e.preventDefault(); añadir(); }}>
                  <select value={clase} onChange={(e) => setClase(e.target.value as ClaseElemento)} aria-label="Tipo de pieza">
                    {CLASES.map((c) => <option key={c.clave} value={c.clave}>{c.nombre}</option>)}
                  </select>
                  <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título de la pieza" aria-label="Título" />
                  <input value={href} onChange={(e) => setHref(e.target.value)} placeholder="/mapas (opcional)" aria-label="Dirección" />
                  <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Nota (opcional)" aria-label="Nota" />
                  <button type="submit">Añadir</button>
                </form>
              </>
            )}

            {panel === "accesos" && (
              <>
                <div className="vx-esp-filtros">
                  {ESPACIOS.map((e) => (
                    <button key={e.clave} type="button" data-on={espacioAccesos === e.clave ? "1" : "0"} style={{ "--cl": e.color } as React.CSSProperties} onClick={() => setEspacioAccesos(e.clave)}>
                      {e.nombre}
                    </button>
                  ))}
                </div>
                <ul className="vx-esp-herramientas">
                  {ESPACIO_POR_CLAVE[espacioAccesos].herramientas.map((h) => (
                    <li key={h.id}>
                      <button type="button" onClick={() => añadirHerramienta(h.id, h.nombre, h.href, ESPACIO_POR_CLAVE[espacioAccesos].color)} title={h.desc}>
                        <IconoNav nombre={h.icono} />
                        <span>{h.nombre}</span>
                      </button>
                      <Link href={h.href} className="vx-esp-ir" aria-label={`Ir a ${h.nombre}`}>▸</Link>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {panel === "sesiones" && (
              <ul className="vx-esp-sesiones">
                {estado.sesiones.length === 0 && <li className="vx-esp-vacio">Aún no has guardado ninguna sesión. «Guardar sesión» congela el proyecto como está ahora.</li>}
                {estado.sesiones.map((s) => (
                  <li key={s.id}>
                    <div>
                      <b>{s.nombre}</b>
                      <em>{formatFecha(s.ts)} · {s.elementos.length} piezas · {estado.proyectos.find((p) => p.id === s.proyectoId)?.nombre ?? "proyecto borrado"}</em>
                    </div>
                    <span className="vx-esp-sesion-acc">
                      <button type="button" onClick={() => { aplicar((e) => abrirSesion(e, s.id)); setAviso(`Continuando «${s.nombre}»`); }}>Continuar</button>
                      <button type="button" onClick={() => aplicar((e) => borrarSesion(e, s.id))} aria-label="Borrar sesión"><IconoNav nombre="x" /></button>
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {panel === "actividad" && (
              <ul className="vx-esp-actividad">
                {estado.actividad.length === 0 && <li className="vx-esp-vacio">Aquí aparecerá todo lo que hagas en la mesa.</li>}
                {estado.actividad.slice(0, 40).map((a) => (
                  <li key={a.id}>
                    <time dateTime={a.ts}>{formatFecha(a.ts)}</time>
                    <b>{a.detalle}</b>
                    <em>{a.tipo}</em>
                  </li>
                ))}
              </ul>
            )}

            {panel === "recuperar" && (
              <>
                <p className="vx-esp-nota">Cada paso deja una huella. Deshacer devuelve la mesa al estado anterior, con sus paneles y sus piezas.</p>
                <ul className="vx-esp-recuperar">
                  {estado.historial.length === 0 && <li className="vx-esp-vacio">Sin pasos que deshacer.</li>}
                  {estado.historial.slice(0, 12).map((h, i) => (
                    <li key={h.ts + i}>
                      <time dateTime={h.ts}>{formatFecha(h.ts)}</time>
                      <b>{h.etiqueta}</b>
                    </li>
                  ))}
                </ul>
                <button type="button" className="vx-esp-boton" disabled={!estado.historial.length} onClick={() => aplicar(deshacer)}>
                  Deshacer el último paso
                </button>
              </>
            )}

            {panel === "papelera" && (
              <>
                <ul className="vx-esp-papelera">
                  {estado.papelera.length === 0 && <li className="vx-esp-vacio">La papelera está vacía: nada se ha perdido.</li>}
                  {estado.papelera.map((it) => (
                    <li key={it.elemento.id + it.ts}>
                      <div>
                        <b>{it.elemento.titulo}</b>
                        <em>{CLASES.find((c) => c.clave === it.elemento.clase)?.nombre} · {formatFecha(it.ts)} · {estado.proyectos.find((p) => p.id === it.proyectoId)?.nombre ?? "proyecto archivado"}</em>
                      </div>
                      <button type="button" onClick={() => { aplicar((e) => restaurarDePapelera(e, it.elemento.id)); setAviso("Restaurada al proyecto"); }}>Restaurar</button>
                    </li>
                  ))}
                </ul>
                {estado.papelera.length > 0 && (
                  <button type="button" className="vx-esp-boton" onClick={() => aplicar(vaciarPapelera)}>Vaciar la papelera</button>
                )}
              </>
            )}
          </section>
        ))}
      </div>

      {/* ── el pie: paneles apagados, proyectos archivados, rutas ────── */}
      <footer className="vx-esp-pie">
        {panelesApagados.length > 0 && (
          <div className="vx-esp-apagados">
            <span>Paneles apagados:</span>
            {panelesApagados.map((q) => (
              <button key={q} type="button" onClick={() => aplicar((e) => alternarPanel(e, proyecto.id, q))}>
                + {PANELES.find((p) => p.clave === q)?.nombre}
              </button>
            ))}
          </div>
        )}
        <div className="vx-esp-proyacc">
          <button type="button" onClick={() => aplicar((e) => archivarProyecto(e, proyecto.id))}>Archivar «{proyecto.nombre}»</button>
          {archivados.length > 0 && (
            <details>
              <summary>Archivados ({archivados.length})</summary>
              <ul>
                {archivados.map((p: Proyecto) => (
                  <li key={p.id}>
                    <span>{p.nombre} · {p.elementos.length} piezas</span>
                    <button type="button" onClick={() => aplicar((e) => recuperarProyecto(e, p.id))}>Recuperar</button>
                  </li>
                ))}
              </ul>
            </details>
          )}
          {estado.papelera.length > 0 && (
            <button type="button" onClick={() => { aplicar((e) => restaurarDePapelera(e, estado.papelera[0].elemento.id)); setAviso("Última pieza restaurada"); }}>
              Restaurar lo último quitado
            </button>
          )}
        </div>
        <p className="vx-esp-nota">
          Todo esto vive en este aparato: proyectos, paneles, sesiones, actividad y papelera. Nada viaja a un servidor.
        </p>
      </footer>
    </div>
  );
}

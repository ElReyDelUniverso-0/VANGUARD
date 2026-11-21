"use client";
// ═══════════════════════════════════════════════════════════════════
// v431.6 EL CUADERNO · EL MÓDULO
//
// LO QUE PIDIÓ EL DUEÑO, textual: «Mejora la anotadero, que sea un módulo
// aparte, que sea más hermoso, que sea más fluido, que pueda agregar más
// cosas; este módulo también uno pueda escribir, señalar y mucho más.
// También agrega más variaciones, pueda editar el logo, o sea todo anotar y
// poner mapas 3D de todo, hacerlo expansible más».
//
// Y aquí está, pieza por pieza:
//   · TRES VISTAS — lista (leer), tablero (ordenar arrastrando) y mapa 3D
//     (todo el planeta). La misma verdad en las tres.
//   · ESCRIBIR — un editor con negrita, cursiva, código, listas, tareas y
//     citas, con vista previa y contador de palabras y de tiempo de lectura.
//   · SEÑALAR — eliges un tramo del texto y se resalta (==así==); si vuelves
//     a pulsar el mismo tramo, se quita. El resaltado toma el acento de la piel.
//   · SIETE CLASES de pieza: nota, cita, enlace, lugar, cifra, tarea e imagen.
//   · CUATRO PIELES y el EMBLEMA editable (el logo), con su SVG descargable.
//   · FLUIDO — el arrastre mueve el DOM y sólo guarda al soltar; el guardado
//     espera 400 ms; deshacer y rehacer; atajos de teclado.
//   · EXPANSIBLE — exporta Markdown y JSON, importa lo que le des, trae el
//     tablero de la Zona Cero y cualquier sala puede mandarle una pieza con
//     el evento `vg:cuaderno`.
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ChangeEvent, type PointerEvent as PEvent } from "react";
import Link from "next/link";
import { EditorEmblema, SelloCuaderno } from "./emblema";
import { GloboNotas, puedeIrAlGlobo, type PuntoGlobo } from "./globo-notas";
import { usaCuaderno } from "./use-cuaderno";
import { PIELES, TINTA_HEX, TOKENS, TINTAS, VISTAS, variablesDe, type Piel, type Tinta, type Vista } from "@/lib/cuaderno/pieles";
import {
  MARCA_INFO,
  MARCAS,
  TIPO_INFO,
  TIPOS,
  filtrar,
  formatear,
  lectura,
  relacionadas,
  senalar,
  vecinasDeEnlace,
  type Marca,
  type Pieza,
  type Tipo,
  type Trozo,
} from "@/lib/cuaderno/modelo";
import "./cuaderno.css";

const NOMBRE_VISTA: Record<Vista, string> = { lista: "Lista", tablero: "Tablero", mapa: "Mapa 3D" };
const BORRADOR: Partial<Pieza> = { tipo: "nota", titulo: "", cuerpo: "", etiquetas: [], marca: "ninguna", tinta: "ambar" };

export function Cuaderno({ embebido = false }: { embebido?: boolean }) {
  const cu = usaCuaderno();
  const { cuaderno, cifras } = cu;
  const [q, setQ] = useState("");
  const [fTipo, setFTipo] = useState<Tipo | "todo">("todo");
  const [fMarca, setFMarca] = useState<Marca | "todo">("todo");
  const [etiqueta, setEtiqueta] = useState<string | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  const [escribiendo, setEscribiendo] = useState(false);
  const [borrador, setBorrador] = useState<Partial<Pieza>>(BORRADOR);
  const [previa, setPrevia] = useState(false);
  const [editEmblema, setEditEmblema] = useState(false);
  const [enlazando, setEnlazando] = useState<string | null>(null);
  const [importar, setImportar] = useState(false);
  const [pegado, setPegado] = useState("");
  const areaTexto = useRef<HTMLTextAreaElement>(null);
  const lienzo = useRef<HTMLDivElement>(null);
  const arrastre = useRef<{ id: string; dx: number; dy: number; nodo: HTMLElement } | null>(null);

  const piezas = useMemo(
    () => filtrar(cuaderno, { q, tipo: fTipo, marca: fMarca, etiqueta }),
    [cuaderno, q, fTipo, fMarca, etiqueta]
  );
  const seleccionada = useMemo(() => cuaderno.piezas.find((p) => p.id === sel) ?? null, [cuaderno.piezas, sel]);
  const parientes = useMemo(() => (sel ? relacionadas(cuaderno, sel, 4) : []), [cuaderno, sel]);
  const hilos = useMemo(() => (sel ? vecinasDeEnlace(cuaderno, sel) : []), [cuaderno, sel]);
  const lector = useMemo(() => lectura(borrador.cuerpo ?? ""), [borrador.cuerpo]);

  // ── escribir: abrir el editor con una pieza nueva o con la elegida ──
  const nuevo = useCallback((tipo: Tipo = "nota", extra: Partial<Pieza> = {}) => {
    setBorrador({ ...BORRADOR, tipo, ...extra });
    setSel(null);
    setEscribiendo(true);
    setPrevia(false);
    setTimeout(() => areaTexto.current?.focus(), 60);
  }, []);

  const abrir = useCallback((p: Pieza) => {
    setBorrador({ ...p });
    setSel(p.id);
    setEscribiendo(true);
    setPrevia(true);
    setEnlazando(null);
  }, []);

  const guardar = useCallback(() => {
    const titulo = (borrador.titulo ?? "").trim();
    const cuerpo = (borrador.cuerpo ?? "").trim();
    if (!titulo && !cuerpo) {
      cu.avisar("Una pieza vacía no se guarda: escribe un título o algo en el cuerpo.");
      return;
    }
    if (sel) {
      cu.editar(sel, { ...borrador });
      cu.avisar("Pieza guardada.");
    } else {
      cu.poner({ ...borrador, titulo: titulo || cuerpo.slice(0, 90) });
      cu.avisar("Pieza nueva en el cuaderno.");
    }
    setEscribiendo(false);
    setBorrador(BORRADOR);
  }, [borrador, cu, sel]);

  const cerrarEditor = useCallback(() => {
    setEscribiendo(false);
    setBorrador(BORRADOR);
    setSel(null);
  }, []);

  // ── señalar: el tramo elegido del textarea se resalta (o se quita) ──
  const senalarSeleccion = useCallback(() => {
    const area = areaTexto.current;
    if (!area) return;
    const desde = area.selectionStart;
    const hasta = area.selectionEnd;
    if (desde === hasta) {
      cu.avisar("Elige primero el tramo que quieres señalar (ratón o dedo sobre el texto).");
      return;
    }
    const cuerpo = borrador.cuerpo ?? "";
    // el MISMO `senalar` del modelo que usan las pruebas, aplicado a lo que escribes
    const r = senalar(cuerpo, desde, hasta);
    setBorrador((b) => ({ ...b, cuerpo: r.texto }));
    requestAnimationFrame(() => {
      const a = areaTexto.current;
      if (!a) return;
      a.focus();
      a.setSelectionRange(r.desde, r.hasta);
    });
  }, [borrador.cuerpo, cu]);

  /** mete marcas alrededor de la selección (**negrita**, *cursiva*, `código`…) */
  const envolver = useCallback((marca: string) => {
    const area = areaTexto.current;
    if (!area) return;
    const cuerpo = borrador.cuerpo ?? "";
    const a = area.selectionStart;
    const b = area.selectionEnd;
    const tramo = cuerpo.slice(a, b) || "texto";
    const texto = `${cuerpo.slice(0, a)}${marca}${tramo}${marca}${cuerpo.slice(b)}`;
    setBorrador((prev) => ({ ...prev, cuerpo: texto }));
    requestAnimationFrame(() => {
      const el = areaTexto.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(a + marca.length, a + marca.length + tramo.length);
    });
  }, [borrador.cuerpo]);

  const meterLinea = useCallback((prefijo: string) => {
    const area = areaTexto.current;
    if (!area) return;
    const cuerpo = borrador.cuerpo ?? "";
    const a = area.selectionStart;
    const inicio = cuerpo.lastIndexOf("\n", Math.max(0, a - 1)) + 1;
    const texto = `${cuerpo.slice(0, inicio)}${prefijo}${cuerpo.slice(inicio)}`;
    setBorrador((prev) => ({ ...prev, cuerpo: texto }));
    requestAnimationFrame(() => {
      const el = areaTexto.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(a + prefijo.length, a + prefijo.length);
    });
  }, [borrador.cuerpo]);

  // ── arrastre del tablero: mueve el DOM y sólo guarda al soltar ──
  const alBajar = useCallback((e: PEvent<HTMLElement>, p: Pieza) => {
    const nodo = e.currentTarget as HTMLElement;
    const caja = lienzo.current?.getBoundingClientRect();
    if (!caja) return;
    arrastre.current = { id: p.id, dx: e.clientX - nodo.getBoundingClientRect().left, dy: e.clientY - nodo.getBoundingClientRect().top, nodo };
    nodo.setPointerCapture?.(e.pointerId);
    nodo.dataset.arrastrando = "si";
  }, []);

  const alMover = useCallback((e: PEvent<HTMLElement>) => {
    const a = arrastre.current;
    const caja = lienzo.current?.getBoundingClientRect();
    if (!a || !caja) return;
    const x = ((e.clientX - caja.left - a.dx) / caja.width) * 100;
    const y = ((e.clientY - caja.top - a.dy) / caja.height) * 100;
    a.nodo.style.left = `${Math.min(96, Math.max(0, x))}%`;
    a.nodo.style.top = `${Math.min(94, Math.max(0, y))}%`;
    a.nodo.style.zIndex = "5";
  }, []);

  const alSoltar = useCallback((e: PEvent<HTMLElement>) => {
    const a = arrastre.current;
    const caja = lienzo.current?.getBoundingClientRect();
    if (!a || !caja) return;
    delete a.nodo.dataset.arrastrando;
    const x = ((e.clientX - caja.left - a.dx) / caja.width) * 100;
    const y = ((e.clientY - caja.top - a.dy) / caja.height) * 100;
    arrastre.current = null;
    cu.mover(a.id, x, y);
  }, [cu]);

  // ── exportar / importar ──
  const descargar = useCallback((nombre: string, contenido: string, tipo: string) => {
    try {
      const blob = new Blob([contenido], { type: tipo });
      const url = URL.createObjectURL(blob);
      const el = document.createElement("a");
      el.href = url;
      el.download = nombre;
      document.body.appendChild(el);
      el.click();
      el.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch {
      cu.avisar("Este aparato no deja descargar; usa «Copiar como texto».");
    }
  }, [cu]);

  const copiar = useCallback(async (texto: string, dicho: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      cu.avisar(dicho);
    } catch {
      cu.avisar("No hay permiso de portapapeles en este aparato.");
    }
  }, [cu]);

  // ── atajos: n nueva · b negrita · s señalar · 1/2/3 vistas · Esc cerrar ──
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      const enCampo = ["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName ?? "");
      if (e.key === "Escape") {
        if (escribiendo) cerrarEditor();
        else if (editEmblema) setEditEmblema(false);
        return;
      }
      if (enCampo) {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
          e.preventDefault();
          envolver("**");
        }
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
          e.preventDefault();
          guardar();
        }
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) cu.rehacer();
        else cu.deshacer();
        return;
      }
      if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        nuevo();
      }
      if (e.key === "1") cu.vista("lista");
      if (e.key === "2") cu.vista("tablero");
      if (e.key === "3") cu.vista("mapa");
      if (e.key.toLowerCase() === "s" && escribiendo) {
        e.preventDefault();
        senalarSeleccion();
      }
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [cerrarEditor, cu, editEmblema, envolver, escribiendo, guardar, nuevo, senalarSeleccion]);

  const fijarLugar = useCallback((p: PuntoGlobo) => {
    if (sel) {
      cu.editar(sel, { lat: p.lat, lng: p.lng, tipo: "lugar" });
      cu.avisar(`Sitio fijado: ${p.lat.toFixed(3)}, ${p.lng.toFixed(3)}. Escribe su nombre en la pieza.`);
      return;
    }
    nuevo("lugar", { lat: p.lat, lng: p.lng, titulo: `${p.lat.toFixed(2)}, ${p.lng.toFixed(2)}` });
    cu.avisar("Pieza de lugar creada con ese punto: ponle nombre y cuenta qué pasa ahí.");
  }, [cu, nuevo, sel]);

  return (
    <div
      className={`cu${embebido ? " cu--embebido" : ""}`}
      style={variablesDe(cuaderno.piel) as CSSProperties}
      data-piel={cuaderno.piel}
      data-vista={cuaderno.vista}
      data-textura={TOKENS[cuaderno.piel].textura}
    >
      {/* ─────────── cabecera: el sello, el estado y las variaciones ─────────── */}
      <header className="cu-cab">
        <div className="cu-cab-marca">
          <button
            type="button"
            className="cu-cab-sello"
            onClick={() => setEditEmblema((v) => !v)}
            aria-label="Editar el emblema del cuaderno"
            title="Editar el emblema"
          >
            <SelloCuaderno emblema={cuaderno.emblema} tam={44} />
          </button>
          <div className="cu-cab-texto">
            <h2>
              EL CUADERNO
              <span className="cu-cab-mono">{cuaderno.emblema.monograma}</span>
            </h2>
            <p>{cuaderno.emblema.lema}</p>
          </div>
        </div>

        <div className="cu-cab-acciones">
          <div className="cu-pieles" role="group" aria-label="Piel del cuaderno">
            {PIELES.map((p: Piel) => (
              <button
                key={p}
                type="button"
                className={cuaderno.piel === p ? "cu-piel cu-piel--on" : "cu-piel"}
                onClick={() => cu.piel(p)}
                aria-pressed={cuaderno.piel === p}
                title={TOKENS[p].detalle}
              >
                <i style={{ background: TOKENS[p].fondo, borderColor: TOKENS[p].acento }} aria-hidden />
                {TOKENS[p].nombre}
              </button>
            ))}
          </div>

          <div className="cu-vistas" role="group" aria-label="Cómo mirar el cuaderno">
            {VISTAS.map((v: Vista) => (
              <button
                key={v}
                type="button"
                className={cuaderno.vista === v ? "cu-vista cu-vista--on" : "cu-vista"}
                onClick={() => cu.vista(v)}
                aria-pressed={cuaderno.vista === v}
              >
                {NOMBRE_VISTA[v]}
              </button>
            ))}
          </div>

          <div className="cu-herramientas">
            <button type="button" className="cu-btn cu-btn--oro" onClick={() => nuevo()}>
              ✎ Escribir
            </button>
            <button type="button" className="cu-btn" onClick={() => cu.deshacer()} disabled={!cu.puedeDeshacer} title="Deshacer (Ctrl+Z)">
              ↺
            </button>
            <button type="button" className="cu-btn" onClick={() => cu.rehacer()} disabled={!cu.puedeRehacer} title="Rehacer (Ctrl+Shift+Z)">
              ↻
            </button>
            <button
              type="button"
              className="cu-btn"
              onClick={() => descargar("cuaderno.md", cu.exportarMarkdown(), "text/markdown;charset=utf-8")}
            >
              ↓ Markdown
            </button>
            <button
              type="button"
              className="cu-btn"
              onClick={() => descargar("cuaderno.json", cu.exportarJSON(), "application/json;charset=utf-8")}
            >
              ↓ JSON
            </button>
            <button type="button" className="cu-btn" onClick={() => setImportar((v) => !v)}>
              ↑ Importar
            </button>
          </div>
        </div>
      </header>

      <p className="cu-estado" aria-live="polite">
        {cu.estado === "guardando" ? "Guardando…" : cu.estado === "guardado" ? "Guardado en este aparato" : cu.estado === "sin-espacio" ? "Sin espacio en el aparato" : "En este aparato, sin cuentas"}
        {cu.aviso ? <span className="cu-aviso"> · {cu.aviso}</span> : null}
        {cu.traido > 0 ? <span className="cu-traido"> · {cu.traido} piezas traídas de la Zona Cero</span> : null}
      </p>

      {importar ? (
        <div className="cu-importar">
          <label>
            <span>Pega aquí un cuaderno exportado (.json) y pulsa traer</span>
            <textarea value={pegado} onChange={(e) => setPegado(e.target.value)} rows={4} placeholder='{"v":3,"piezas":[…] }' />
          </label>
          <div className="cu-importar-fila">
            <button
              type="button"
              className="cu-btn cu-btn--oro"
              onClick={() => {
                const ok = cu.importar(pegado);
                cu.avisar(ok ? "Cuaderno importado y fusionado sin pisar tus piezas." : "Eso no es un cuaderno válido: no se ha tocado nada.");
                if (ok) setPegado("");
              }}
            >
              Traer
            </button>
            <button
              type="button"
              className="cu-btn"
              onClick={() => {
                const n = cu.traerZonaCero();
                cu.avisar(n ? `${n} piezas de la Zona Cero entraron en el cuaderno.` : "En la Zona Cero no hay piezas nuevas que traer.");
              }}
            >
              Traer de la Zona Cero
            </button>
            <button
              type="button"
              className="cu-btn"
              onClick={() => copiar(cu.exportarMarkdown(), "El cuaderno entero copiado como texto.")}
            >
              Copiar como texto
            </button>
          </div>
        </div>
      ) : null}

      {editEmblema ? (
        <div className="cu-panel-emb">
          <EditorEmblema
            emblema={cuaderno.emblema}
            onCambio={(cambios) => cu.emblema(cambios)}
            onCerrar={() => setEditEmblema(false)}
          />
        </div>
      ) : null}

      <div className="cu-cuerpo">
        {/* ─────────── el lado: buscar, filtrar, cifras ─────────── */}
        <aside className="cu-lado" aria-label="Buscar y filtrar en el cuaderno">
          <div className="cu-buscador">
            <input
              value={q}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
              placeholder="Buscar en tus piezas…"
              aria-label="Buscar en el cuaderno"
              type="search"
            />
            {q ? (
              <button type="button" className="cu-limpiar" onClick={() => setQ("")} aria-label="Limpiar la búsqueda">
                ✕
              </button>
            ) : null}
          </div>

          <div className="cu-filtros" role="group" aria-label="Filtrar por clase">
            <button
              type="button"
              className={fTipo === "todo" ? "cu-filtro cu-filtro--on" : "cu-filtro"}
              onClick={() => setFTipo("todo")}
            >
              Todo <b>{cifras.piezas}</b>
            </button>
            {TIPOS.map((t) => (
              <button
                key={t}
                type="button"
                className={fTipo === t ? "cu-filtro cu-filtro--on" : "cu-filtro"}
                onClick={() => setFTipo(fTipo === t ? "todo" : t)}
                title={TIPO_INFO[t].detalle}
              >
                <span aria-hidden>{TIPO_INFO[t].simbolo}</span> {TIPO_INFO[t].nombre}
                <b>{cifras.porTipo[t]}</b>
              </button>
            ))}
          </div>

          <div className="cu-filtros cu-filtros--marcas" role="group" aria-label="Filtrar por marca">
            {MARCAS.filter((m) => m !== "ninguna").map((m) => (
              <button
                key={m}
                type="button"
                className={fMarca === m ? "cu-filtro cu-filtro--on" : "cu-filtro"}
                onClick={() => setFMarca(fMarca === m ? "todo" : m)}
                title={`${MARCA_INFO[m].nombre} · ${cifras.porMarca[m]}`}
              >
                <span aria-hidden>{MARCA_INFO[m].simbolo}</span> {cifras.porMarca[m]}
              </button>
            ))}
          </div>

          {cifras.etiquetas.length ? (
            <div className="cu-etiquetas">
              <h3>Etiquetas</h3>
              <div className="cu-chips">
                {cifras.etiquetas.map((e) => (
                  <button
                    key={e.etiqueta}
                    type="button"
                    className={etiqueta === e.etiqueta ? "cu-chip cu-chip--on" : "cu-chip"}
                    onClick={() => setEtiqueta(etiqueta === e.etiqueta ? null : e.etiqueta)}
                  >
                    #{e.etiqueta} <b>{e.n}</b>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="cu-cifras">
            <p>
              <b>{filtrar(cuaderno, { q, tipo: fTipo, marca: fMarca, etiqueta }).length}</b> de {cifras.piezas} piezas
            </p>
            <p>
              {cifras.enlaces} hilos · {cifras.conLugar} con lugar · {cifras.palabras} palabras
            </p>
            {cifras.tareasTotal ? (
              <p>
                {cifras.tareasHechas}/{cifras.tareasTotal} tareas hechas
              </p>
            ) : null}
          </div>
        </aside>

        {/* ─────────── el lienzo: lista, tablero o globo ─────────── */}
        <main className="cu-lienzo-marco">
          {cifras.piezas === 0 ? (
            <div className="cu-vacio">
              <SelloCuaderno emblema={cuaderno.emblema} tam={72} />
              <h3>El cuaderno está en blanco</h3>
              <p>
                Escribe lo primero que quieras recordar. Puede ser una nota, una cita con su fuente, una cifra,
                una tarea, un enlace a una sala o un lugar del planeta. Nada de esto se inventa: lo que no
                escribas, no está.
              </p>
              <div className="cu-vacio-acciones">
                <button type="button" className="cu-btn cu-btn--oro" onClick={() => nuevo("nota")}>
                  ✎ Escribir la primera nota
                </button>
                <button type="button" className="cu-btn" onClick={() => nuevo("lugar")}>
                  ◎ Anotar un lugar
                </button>
                <button
                  type="button"
                  className="cu-btn"
                  onClick={() => {
                    const n = cu.traerZonaCero();
                    cu.avisar(n ? `${n} piezas traídas de la Zona Cero.` : "La Zona Cero no tiene piezas que traer.");
                  }}
                >
                  Traer de la Zona Cero
                </button>
              </div>
            </div>
          ) : cuaderno.vista === "lista" ? (
            <ul className="cu-lista">
              {piezas.map((p) => (
                <li key={p.id}>
                  <article className={sel === p.id ? "cu-pieza cu-pieza--on" : "cu-pieza"} data-tipo={p.tipo}>
                    <header>
                      <button type="button" className="cu-pieza-abrir" onClick={() => abrir(p)}>
                        <span className="cu-pieza-tipo" style={{ color: TINTA_HEX[p.tinta as Tinta] }}>
                          {TIPO_INFO[p.tipo].simbolo}
                        </span>
                        <h4>{p.titulo}</h4>
                        {p.marca !== "ninguna" ? (
                          <span className="cu-pieza-marca" title={MARCA_INFO[p.marca].nombre}>
                            {MARCA_INFO[p.marca].simbolo}
                          </span>
                        ) : null}
                      </button>
                      <div className="cu-pieza-acciones">
                        {p.tipo === "tarea" ? (
                          <button
                            type="button"
                            className={p.hecha ? "cu-mini cu-mini--on" : "cu-mini"}
                            onClick={() => cu.tarea(p.id)}
                            aria-label={p.hecha ? "Marcar como pendiente" : "Dar por hecha"}
                          >
                            {p.hecha ? "✓" : "☐"}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="cu-mini"
                          onClick={() => setEnlazando(enlazando === p.id ? null : p.id)}
                          aria-label="Unir con otra pieza"
                          title="Unir con otra pieza"
                        >
                          ⇄
                        </button>
                        <button
                          type="button"
                          className="cu-mini cu-mini--peligro"
                          onClick={() => {
                            cu.quitar(p.id);
                            cu.avisar(`«${p.titulo}» fuera del cuaderno (puedes deshacerlo).`);
                          }}
                          aria-label="Quitar la pieza"
                        >
                          ✕
                        </button>
                      </div>
                    </header>
                    {p.cuerpo.trim() ? (
                      <div className="cu-pieza-cuerpo">
                        <CuerpoRico cuerpo={p.cuerpo} compacto />
                      </div>
                    ) : null}
                    <footer>
                      {p.etiquetas.map((e) => (
                        <button key={e} type="button" className="cu-tag" onClick={() => setEtiqueta(e)}>
                          #{e}
                        </button>
                      ))}
                      {p.lugar ? <span className="cu-dato">◎ {p.lugar}</span> : null}
                      {p.fuente ? <span className="cu-dato">❝ {p.fuente}</span> : null}
                      {p.ruta ? (
                        <a className="cu-dato cu-dato--enlace" href={p.ruta}>
                          ↗ {p.ruta}
                        </a>
                      ) : null}
                    </footer>

                    {enlazando === p.id ? (
                      <div className="cu-enlazar">
                        <p>Unir «{p.titulo}» con…</p>
                        <div className="cu-chips">
                          {cuaderno.piezas
                            .filter((o) => o.id !== p.id)
                            .slice(0, 12)
                            .map((o) => (
                              <button
                                key={o.id}
                                type="button"
                                className="cu-chip"
                                onClick={() => {
                                  cu.enlazar(p.id, o.id);
                                  setEnlazando(null);
                                  cu.avisar(`Hilo: «${p.titulo}» ↔ «${o.titulo}».`);
                                }}
                              >
                                {o.titulo.slice(0, 28)}
                              </button>
                            ))}
                          {cuaderno.piezas.length < 2 ? <span className="cu-dato">Hace falta otra pieza.</span> : null}
                        </div>
                      </div>
                    ) : null}
                  </article>
                </li>
              ))}
              {piezas.length === 0 ? (
                <li className="cu-sin-resultados">
                  Ninguna pieza coincide con «{q || "ese filtro"}». Cambia la búsqueda o quita el filtro.
                </li>
              ) : null}
            </ul>
          ) : cuaderno.vista === "tablero" ? (
            <div className="cu-tablero" ref={lienzo}>
              <svg className="cu-hilos" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                {cuaderno.enlaces.map(([a, b]) => {
                  const A = cuaderno.piezas.find((p) => p.id === a);
                  const B = cuaderno.piezas.find((p) => p.id === b);
                  if (!A || !B) return null;
                  return (
                    <line
                      key={`${a}-${b}`}
                      x1={A.x}
                      y1={A.y}
                      x2={B.x}
                      y2={B.y}
                      stroke="var(--cu-acento)"
                      strokeWidth={0.16}
                      strokeOpacity={0.55}
                      strokeDasharray="0.6 0.6"
                    />
                  );
                })}
              </svg>
              {piezas.map((p) => (
                <article
                  key={p.id}
                  className={sel === p.id ? "cu-ficha-tablero cu-ficha-tablero--on" : "cu-ficha-tablero"}
                  style={{ left: `${p.x}%`, top: `${p.y}%`, borderColor: TINTA_HEX[p.tinta as Tinta] }}
                  onPointerDown={(e) => alBajar(e, p)}
                  onPointerMove={alMover}
                  onPointerUp={alSoltar}
                  onDoubleClick={() => abrir(p)}
                  data-pieza={p.id}
                >
                  <span className="cu-ficha-tipo" style={{ color: TINTA_HEX[p.tinta as Tinta] }}>
                    {TIPO_INFO[p.tipo].simbolo}
                  </span>
                  <h4>{p.titulo}</h4>
                  {p.etiquetas.length ? <small>#{p.etiquetas[0]}</small> : null}
                  <div className="cu-ficha-botones">
                    <button type="button" onClick={() => abrir(p)} aria-label="Abrir la pieza">
                      ✎
                    </button>
                    <button
                      type="button"
                      onClick={() => setEnlazando(enlazando === p.id ? null : p.id)}
                      aria-label="Unir con otra pieza"
                    >
                      ⇄
                    </button>
                  </div>
                </article>
              ))}
              <div className="cu-tablero-pie">
                <button type="button" className="cu-btn" onClick={() => cu.acomodar()}>
                  Acomodar
                </button>
                <span>Arrastra las fichas · doble toque para abrir · {cuaderno.enlaces.length} hilos</span>
              </div>
            </div>
          ) : (
            <GloboNotas cuaderno={cuaderno} seleccion={sel} onPunto={fijarLugar} onAbrir={(id) => {
              const p = cuaderno.piezas.find((x) => x.id === id);
              if (p) abrir(p);
            }} />
          )}
        </main>

        {/* ─────────── la ficha: escribir, señalar, unir ─────────── */}
        {escribiendo ? (
          <aside className="cu-editor" aria-label="Editor de la pieza">
            <header className="cu-editor-cab">
              <div className="cu-tipos">
                {TIPOS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={(borrador.tipo ?? "nota") === t ? "cu-tipo cu-tipo--on" : "cu-tipo"}
                    onClick={() => setBorrador((b) => ({ ...b, tipo: t }))}
                    title={TIPO_INFO[t].detalle}
                    aria-pressed={(borrador.tipo ?? "nota") === t}
                  >
                    <span aria-hidden>{TIPO_INFO[t].simbolo}</span> {TIPO_INFO[t].nombre}
                  </button>
                ))}
              </div>
              <button type="button" className="cu-x" onClick={cerrarEditor} aria-label="Cerrar el editor">
                ✕
              </button>
            </header>

            <input
              className="cu-titulo"
              value={borrador.titulo ?? ""}
              onChange={(e) => setBorrador((b) => ({ ...b, titulo: e.target.value }))}
              placeholder={TIPO_INFO[(borrador.tipo ?? "nota") as Tipo].detalle}
              aria-label="Título de la pieza"
              maxLength={140}
            />

            <div className="cu-barra" role="toolbar" aria-label="Formato del texto">
              <button type="button" onClick={() => envolver("**")} title="Negrita (Ctrl+B)"><b>B</b></button>
              <button type="button" onClick={() => envolver("*")} title="Cursiva"><i>I</i></button>
              <button type="button" onClick={() => envolver("`")} title="Código"><code>{"</>"}</code></button>
              <button type="button" className="cu-barra-senal" onClick={senalarSeleccion} title="Señalar el tramo elegido (S)">
                ▮ Señalar
              </button>
              <button type="button" onClick={() => meterLinea("- ")} title="Lista">• Lista</button>
              <button type="button" onClick={() => meterLinea("- [ ] ")} title="Tarea">☐ Tarea</button>
              <button type="button" onClick={() => meterLinea("> ")} title="Cita">❝ Cita</button>
              <button type="button" onClick={() => meterLinea("## ")} title="Título de sección">H</button>
              <button type="button" onClick={() => meterLinea("[texto](/ruta)")} title="Enlace a una sala">↗ Enlace</button>
              <button
                type="button"
                className={previa ? "cu-barra-on" : ""}
                onClick={() => setPrevia((v) => !v)}
                title="Ver cómo queda"
              >
                ◲ Ver
              </button>
            </div>

            <textarea
              ref={areaTexto}
              className="cu-area"
              value={borrador.cuerpo ?? ""}
              onChange={(e) => setBorrador((b) => ({ ...b, cuerpo: e.target.value }))}
              placeholder={"Escribe aquí. Puedes usar **negrita**, ==señalar==, - listas, - [ ] tareas, > citas y [enlaces](/radio)."}
              rows={previa ? 6 : 12}
              spellCheck
              aria-label="Cuerpo de la pieza"
            />

            <p className="cu-cuenta">
              {lector.palabras} palabras · {lector.segundos < 60 ? `${lector.segundos} s` : `${Math.round(lector.segundos / 60)} min`} de lectura
              {previa ? " · vista previa abajo" : ""}
            </p>

            {previa ? (
              <div className="cu-previa">
                <CuerpoRico cuerpo={borrador.cuerpo ?? ""} />
                {!(borrador.cuerpo ?? "").trim() ? <p className="cu-vacio-lado">Aún no hay nada escrito.</p> : null}
              </div>
            ) : null}

            <div className="cu-fila">
              <label className="cu-campo">
                <span>Etiquetas (separadas por comas)</span>
                <input
                  value={(borrador.etiquetas ?? []).join(", ")}
                  onChange={(e) => setBorrador((b) => ({ ...b, etiquetas: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) }))}
                  placeholder="europa, guerra, 2026"
                />
              </label>
              <label className="cu-campo">
                <span>Marca</span>
                <select value={borrador.marca ?? "ninguna"} onChange={(e) => setBorrador((b) => ({ ...b, marca: e.target.value as Marca }))}>
                  {MARCAS.map((m) => (
                    <option key={m} value={m}>{MARCA_INFO[m].simbolo} {MARCA_INFO[m].nombre}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="cu-fila">
              <label className="cu-campo">
                <span>Tinta de la pieza</span>
                <select value={borrador.tinta ?? "ambar"} onChange={(e) => setBorrador((b) => ({ ...b, tinta: e.target.value as Tinta }))}>
                  {TINTAS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label className="cu-campo">
                <span>Fuente / de dónde sale</span>
                <input
                  value={borrador.fuente ?? ""}
                  onChange={(e) => setBorrador((b) => ({ ...b, fuente: e.target.value }))}
                  placeholder="medio, institución o persona"
                />
              </label>
            </div>

            <div className="cu-fila">
              <label className="cu-campo">
                <span>Enlace (ruta de la casa o https)</span>
                <input
                  value={borrador.ruta ?? ""}
                  onChange={(e) => setBorrador((b) => ({ ...b, ruta: e.target.value }))}
                  placeholder="/en-vivo · https://…"
                />
              </label>
              <label className="cu-campo">
                <span>Imagen (https o /ruta)</span>
                <input
                  value={borrador.imagen ?? ""}
                  onChange={(e) => setBorrador((b) => ({ ...b, imagen: e.target.value }))}
                  placeholder="https://…"
                />
              </label>
            </div>

            <div className="cu-fila">
              <label className="cu-campo">
                <span>Lugar (nombre)</span>
                <input
                  value={borrador.lugar ?? ""}
                  onChange={(e) => setBorrador((b) => ({ ...b, lugar: e.target.value }))}
                  placeholder="Kiev, Ucrania"
                />
              </label>
              <div className="cu-campo">
                <span>Coordenadas</span>
                <div className="cu-coords">
                  <input
                    value={borrador.lat ?? ""}
                    onChange={(e) => setBorrador((b) => ({ ...b, lat: e.target.value === "" ? undefined : Number(e.target.value) }))}
                    placeholder="lat"
                    aria-label="Latitud"
                  />
                  <input
                    value={borrador.lng ?? ""}
                    onChange={(e) => setBorrador((b) => ({ ...b, lng: e.target.value === "" ? undefined : Number(e.target.value) }))}
                    placeholder="lng"
                    aria-label="Longitud"
                  />
                  <button
                    type="button"
                    className="cu-btn"
                    onClick={() => {
                      cu.vista("mapa");
                      cu.avisar("Toca el planeta para fijar el sitio de esta pieza.");
                    }}
                  >
                    ◎ Mapa
                  </button>
                </div>
              </div>
            </div>

            <div className="cu-editor-acciones">
              <button type="button" className="cu-btn cu-btn--oro" onClick={guardar}>
                {sel ? "Guardar cambios" : "Añadir al cuaderno"}
              </button>
              {sel ? (
                <button
                  type="button"
                  className="cu-btn cu-btn--peligro"
                  onClick={() => {
                    cu.quitar(sel);
                    cerrarEditor();
                  }}
                >
                  Quitar
                </button>
              ) : null}
              <button type="button" className="cu-btn" onClick={cerrarEditor}>
                Cancelar
              </button>
            </div>

            {sel ? (
              <div className="cu-relacionadas">
                <h4>Unido a</h4>
                {hilos.length ? (
                  <ul>
                    {hilos.map((id) => {
                      const o = cuaderno.piezas.find((p) => p.id === id);
                      if (!o) return null;
                      return (
                        <li key={id}>
                          <button type="button" onClick={() => abrir(o)}>{o.titulo}</button>
                          <button
                            type="button"
                            className="cu-mini"
                            onClick={() => cu.desenlazar(sel, id)}
                            aria-label={`Desunir de ${o.titulo}`}
                          >
                            ✕
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="cu-vacio-lado">Todavía sin hilos. Usa ⇄ en la lista para unir dos piezas.</p>
                )}
                {parientes.length ? (
                  <>
                    <h4>Se parecen</h4>
                    <ul>
                      {parientes.map((p) => (
                        <li key={p.id}>
                          <button type="button" onClick={() => abrir(p)}>{p.titulo}</button>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </div>
            ) : null}
          </aside>
        ) : null}
      </div>

      <footer className="cu-pie">
        <span>
          {cifras.piezas} piezas · {cifras.enlaces} hilos · {cifras.conLugar} en el mapa · {cifras.palabras} palabras
        </span>
        <span className="cu-atajos">
          n nueva · b negrita · s señalar · 1/2/3 vistas · Ctrl+Z deshacer · Esc cerrar
        </span>
        {!embebido ? (
          <span className="cu-puertas">
            <Link href="/zona-cero">◎ Buscar en la casa (Zona Cero)</Link>
            <Link href="/radio">▶ Escucharlo en la Radio</Link>
            <Link href="/cuartel">◇ Todas las salas</Link>
          </span>
        ) : null}
      </footer>
    </div>
  );
}

/** El cuerpo con sus marcas, en piezas tipadas (nunca HTML inyectado). */
export function CuerpoRico({ cuerpo, compacto = false }: { cuerpo: string; compacto?: boolean }) {
  const bloques = useMemo(() => formatear(cuerpo), [cuerpo]);
  if (!bloques.length) return null;
  return (
    <div className={compacto ? "cu-rico cu-rico--compacto" : "cu-rico"}>
      {bloques.map((b, i) => {
        const trozos = b.trozos.map((t: Trozo, j: number) =>
          t.href ? (
            <a key={j} href={t.href} className={t.resaltado ? "cu-senal" : undefined}>
              {t.fuerte ? <b>{t.texto}</b> : t.texto}
            </a>
          ) : t.fuerte ? (
            <b key={j}>{t.texto}</b>
          ) : t.cursiva ? (
            <i key={j}>{t.texto}</i>
          ) : t.resaltado ? (
            <mark key={j} className="cu-senal">{t.texto}</mark>
          ) : t.codigo ? (
            <code key={j}>{t.texto}</code>
          ) : (
            <span key={j}>{t.texto}</span>
          )
        );
        if (b.tipo === "titulo") return <h5 key={i}>{trozos}</h5>;
        if (b.tipo === "lista") return <ul key={i}><li>{trozos}</li></ul>;
        if (b.tipo === "tarea")
          return (
            <p key={i} className={b.hecha ? "cu-tarea-hecha" : "cu-tarea"}>
              <span aria-hidden>{b.hecha ? "✓" : "☐"}</span> {trozos}
            </p>
          );
        if (b.tipo === "cita") return <blockquote key={i}>{trozos}</blockquote>;
        return <p key={i}>{trozos}</p>;
      })}
    </div>
  );
}

/** Lo que cualquier sala puede montar para mandar una pieza al cuaderno. */
export function enviarAlCuaderno(pieza: Partial<Pieza>) {
  try {
    window.dispatchEvent(new CustomEvent("vg:cuaderno", { detail: pieza }));
    return true;
  } catch {
    return false;
  }
}

export { puedeIrAlGlobo };

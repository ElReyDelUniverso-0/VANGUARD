"use client";

// ═══════════════════════════════════════════════════════════════════
// v421.8 · MY UNIVERSE — EL ESPACIO (cliente)
//
// La parrilla personal: piezas que son puertas a salas reales, zonas propias,
// arrastre, tamaños, distribuciones, temas, espacios independientes, copias y
// restauración. Todo se guarda en el aparato, con clave por cuenta, y así se
// dice en la barra: no hay ningún «en la nube» que no sea verdad.
//
// SE RENDERIZA EN DOS TIEMPOS: primero un esqueleto (servidor y primera
// pasada del cliente dicen lo mismo) y luego el espacio leído del aparato.
// Nada de fechas ni identificadores aleatorios en el primer render: eso es lo
// que rompe la hidratación.
// ═══════════════════════════════════════════════════════════════════
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  DISTRIBUCIONES,
  TEMAS,
  abrirNucleo,
  alternarFavorito,
  anadirPieza,
  aplicarDistribucion,
  borrarInstantanea,
  borrarNucleo,
  cambiarColumnas,
  cambiarTema,
  crearInstantanea,
  crearNucleo,
  crearZona,
  editarActivo,
  huecoLibre,
  moverPieza,
  quitarPieza,
  quitarZona,
  recuperarInstantanea,
  redimensionar,
  restaurarOriginal,
  resumen,
  temaDe,
  type ClaveDistribucion,
  type Columnas,
  type Espacio,
  type Nucleo,
  type Pieza,
  type Tema,
} from "@/lib/mi-universo/modelo";
import { buscar, type PiezaCatalogo } from "@/lib/mi-universo/catalogo";
import {
  cargar,
  capacidad,
  descargarArchivo,
  guardar,
  leerArchivo,
  reclamar,
  type Capacidad,
} from "@/lib/mi-universo/almacen";
import { PiezaTarjeta } from "@/components/mi-universo/pieza-tarjeta";

type Props = { catalogo: PiezaCatalogo[]; clavesIniciales: string[] };

const ANCHOS = [1, 2, 3, 4, 6];
const ALTOS = [1, 2, 3];

export function UniversoCliente({ catalogo, clavesIniciales }: Props) {
  const [montado, setMontado] = useState(false);
  const [espacio, setEspacio] = useState<Espacio | null>(null);
  const [cap, setCap] = useState<Capacidad | null>(null);
  const [estado, setEstado] = useState<"limpio" | "sucio" | "guardando" | "guardado" | "error">("limpio");
  const [bytes, setBytes] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);

  const [sel, setSel] = useState<string | null>(null);
  const [arrastre, setArrastre] = useState<string | null>(null);
  const [paleta, setPaleta] = useState(false);
  const [zonaDestino, setZonaDestino] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [panel, setPanel] = useState<"ninguno" | "copias" | "almacen" | "espacios">("ninguno");
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [etiquetaCopia, setEtiquetaCopia] = useState("");
  const archivo = useRef<HTMLInputElement>(null);

  const ficha = useMemo(() => new Map(catalogo.map((p) => [p.clave, p])), [catalogo]);
  const usuario = cap?.usuario ?? null;

  // ── arranque: quién soy, qué hay guardado ──────────────────────────
  useEffect(() => {
    let vivo = true;
    void (async () => {
      const c = await capacidad();
      if (!vivo) return;
      setCap(c);
      if (c.usuario) reclamar(c.usuario);
      const leido = cargar(c.usuario, clavesIniciales);
      setEspacio(leido.espacio);
      setBytes(0);
      setMontado(true);
      if (leido.origen === "legado") setAviso("Se ha recuperado un espacio guardado antes de existir las cuentas en este aparato.");
    })();
    return () => {
      vivo = false;
    };
  }, [clavesIniciales]);

  // ── guardado automático (500 ms después del último cambio) ─────────
  useEffect(() => {
    if (!montado || !espacio) return;
    setEstado("sucio");
    const id = setTimeout(() => {
      const r = guardar(usuario, espacio);
      setBytes(r.bytes);
      setEstado(r.ok ? "guardado" : "error");
      if (!r.ok && r.error) setAviso(r.error);
    }, 500);
    return () => clearTimeout(id);
  }, [espacio, montado, usuario]);

  const editar = useCallback((f: (n: Nucleo) => Nucleo) => {
    setEspacio((e) => (e ? editarActivo(e, f) : e));
  }, []);

  const guardarYa = useCallback(() => {
    if (!espacio) return;
    setEstado("guardando");
    const r = guardar(usuario, espacio);
    setBytes(r.bytes);
    setEstado(r.ok ? "guardado" : "error");
    setAviso(r.ok ? `Guardado en este dispositivo (${(r.bytes / 1024).toFixed(1)} KB).` : r.error ?? "no se pudo guardar");
  }, [espacio, usuario]);

  if (!montado || !espacio) {
    return (
      <div className="mx-auto w-full max-w-[1400px] px-4 py-10" aria-busy="true">
        <div className="h-9 w-56 animate-pulse rounded-lg bg-white/[0.06]" />
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-white/[0.04]" />
          ))}
        </div>
      </div>
    );
  }

  const nucleo = espacio.nucleos[espacio.activo];
  const t = temaDe(nucleo.tema);
  const r = resumen(espacio);
  const anchos = ANCHOS.filter((w) => w <= nucleo.columnas);

  const paso = (actual: number, delta: number, opciones: number[]): number => {
    const i = opciones.indexOf(actual);
    const j = Math.min(opciones.length - 1, Math.max(0, (i < 0 ? 0 : i) + delta));
    return opciones[j];
  };

  const soltarEnZona = (zonaId: string) => {
    if (!arrastre) return;
    const h = huecoLibre(nucleo, zonaId, 2, 1);
    editar((n) => moverPieza(n, arrastre, { zona: zonaId, col: h.col, fila: h.fila }));
    setArrastre(null);
  };

  const soltarSobre = (destino: Pieza) => {
    if (!arrastre || arrastre === destino.id) return;
    editar((n) => moverPieza(n, arrastre, { zona: destino.zona, col: destino.col, fila: destino.fila }));
    setArrastre(null);
  };

  const anadir = (clave: string) => {
    const yaEstaba = nucleo.piezas.some((p) => p.clave === clave);
    editar((n) => anadirPieza(n, clave, zonaDestino ?? undefined).nucleo);
    const f = ficha.get(clave);
    setAviso(f ? (yaEstaba ? `${f.nombre} ya estaba en el espacio.` : `${f.nombre} añadido al espacio.`) : "Pieza añadida.");
  };

  const estadoTexto =
    estado === "guardado" ? "Guardado ahora" : estado === "guardando" ? "Guardando…" : estado === "error" ? "No se pudo guardar" : estado === "sucio" ? "Cambios sin guardar" : "Limpio";

  return (
    <div
      className="mx-auto w-full max-w-[1400px] px-4 pb-24"
      style={{ ["--mu-acento" as string]: t.acento, ["--mu-borde" as string]: t.borde, ["--mu-tinta" as string]: t.tinta }}
    >
      {/* ── barra: espacios, almacenamiento y acciones ── */}
      <div className="sticky top-0 z-30 -mx-4 mb-6 border-b border-white/5 bg-[#05060b]/85 px-4 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {Object.entries(espacio.nucleos).map(([clave, n]) => {
              const activo = clave === espacio.activo;
              return (
                <button
                  key={clave}
                  type="button"
                  onClick={() => setEspacio((e) => (e ? abrirNucleo(e, clave) : e))}
                  className={`rounded-lg border px-2.5 py-1 text-[12px] transition ${
                    activo ? "border-transparent text-black" : "border-white/10 text-white/60 hover:text-white"
                  }`}
                  style={activo ? { background: t.acento } : undefined}
                >
                  {n.nombre}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setPanel(panel === "espacios" ? "ninguno" : "espacios")}
              className="rounded-lg border border-dashed border-white/15 px-2 py-1 text-[12px] text-white/50 hover:text-white"
              aria-label="Crear o gestionar espacios"
            >
              + espacio
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPanel(panel === "almacen" ? "ninguno" : "almacen")}
              className="rounded-lg border border-white/10 px-2.5 py-1 text-[11px] text-white/60 hover:text-white"
              title="¿Dónde se guarda esto?"
            >
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle" style={{ background: estado === "error" ? "#ff6b6b" : t.acento }} />
              Este dispositivo
            </button>
            <span className="hidden text-[11px] text-white/35 sm:inline">{estadoTexto}{bytes ? ` · ${(bytes / 1024).toFixed(1)} KB` : ""}</span>
            <button type="button" onClick={guardarYa} className="mu-accion">Guardar</button>
            <button type="button" onClick={() => setPanel(panel === "copias" ? "ninguno" : "copias")} className="mu-accion">Copias</button>
          </div>
        </div>

        {/* ── ajustes del núcleo activo ── */}
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-white/50">
          <div className="flex items-center gap-1">
            <span className="mr-1 text-white/35">Distribución</span>
            {DISTRIBUCIONES.map((d) => (
              <button
                key={d.clave}
                type="button"
                title={d.lema}
                onClick={() => editar((n) => aplicarDistribucion(n, d.clave as ClaveDistribucion))}
                className="rounded-md border border-white/10 px-2 py-0.5 hover:border-white/25 hover:text-white"
              >
                {d.nombre}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <span className="mr-1 text-white/35">Tema</span>
            {TEMAS.map((tema) => (
              <button
                key={tema.clave}
                type="button"
                title={`${tema.nombre} — ${tema.lema}`}
                aria-label={`Tema ${tema.nombre}`}
                onClick={() => editar((n) => cambiarTema(n, tema.clave as Tema))}
                className="h-4 w-4 rounded-full border transition"
                style={{
                  background: tema.acento,
                  borderColor: nucleo.tema === tema.clave ? "#fff" : "transparent",
                  boxShadow: nucleo.tema === tema.clave ? `0 0 0 2px ${tema.acento}55` : "none",
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-1">
            <span className="mr-1 text-white/35">Columnas</span>
            {([6, 8, 12] as Columnas[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => editar((n) => cambiarColumnas(n, c))}
                className={`rounded-md border px-2 py-0.5 ${nucleo.columnas === c ? "border-white/40 text-white" : "border-white/10 hover:text-white"}`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <button type="button" onClick={() => setPaleta(true)} className="mu-accion" style={{ borderColor: `${t.acento}55`, color: t.acento }}>
              + Añadir módulo
            </button>
            <button
              type="button"
              onClick={() => {
                if (!window.confirm("¿Volver al trazado original? Se conservan tus piezas; solo se recolocan.")) return;
                editar((n) => restaurarOriginal(n));
              }}
              className="mu-accion"
            >
              Restaurar
            </button>
          </div>
        </div>
      </div>

      {aviso && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[12px] text-white/70">
          <span className="flex-1">{aviso}</span>
          <button type="button" onClick={() => setAviso(null)} className="text-white/40 hover:text-white" aria-label="Cerrar aviso">×</button>
        </div>
      )}

      {/* ── paneles laterales ── */}
      {panel === "almacen" && cap && (
        <section className="mu-panel">
          <h2>¿Dónde se guarda esto?</h2>
          <p className="mu-p">
            <strong>En este dispositivo.</strong> Con la cuenta <code>{cap.usuario ?? "invitado"}</code> como clave: dos cuentas en el mismo
            navegador no comparten espacio.
          </p>
          <p className="mu-p">{cap.detalle}</p>
          <p className="mu-p">
            Puedes llevarte el espacio con <strong>Exportar</strong> (un archivo JSON) e instalarlo en otro aparato con <strong>Importar</strong>.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => setAviso(`Exportado: ${descargarArchivo(espacio, usuario)}`)} className="mu-accion">Exportar</button>
            <button type="button" onClick={() => archivo.current?.click()} className="mu-accion">Importar</button>
            {!cap.autenticado && (
              <Link href="/entrar" className="mu-accion" style={{ borderColor: `${t.acento}55`, color: t.acento }}>
                Entrar con mi cuenta
              </Link>
            )}
          </div>
        </section>
      )}

      {panel === "copias" && (
        <section className="mu-panel">
          <h2>Copias del espacio</h2>
          <p className="mu-p">Una copia guarda el trazado tal y como está ahora. Se conservan las últimas 20.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              value={etiquetaCopia}
              onChange={(e) => setEtiquetaCopia(e.target.value)}
              placeholder="nombre de la copia (opcional)"
              className="mu-input min-w-[200px] flex-1"
              maxLength={48}
            />
            <button
              type="button"
              onClick={() => {
                setEspacio((e) => (e ? crearInstantanea(e, etiquetaCopia) : e));
                setEtiquetaCopia("");
                setAviso("Copia guardada.");
              }}
              className="mu-accion"
            >
              Guardar copia
            </button>
          </div>
          <ul className="mt-3 space-y-1.5">
            {espacio.instantaneas.length === 0 && <li className="mu-p">Todavía no hay copias.</li>}
            {espacio.instantaneas.map((i) => (
              <li key={i.id} className="flex items-center gap-2 rounded-lg border border-white/10 px-2 py-1.5 text-[12px]">
                <span className="min-w-0 flex-1 truncate text-white/70">
                  {i.etiqueta} <span className="text-white/30">· {new Date(i.cuando).toLocaleString("es-ES")}</span>
                </span>
                <button type="button" onClick={() => { setEspacio((e) => (e ? recuperarInstantanea(e, i.id) : e)); setAviso("Copia recuperada."); }} className="mu-accion">Recuperar</button>
                <button type="button" onClick={() => setEspacio((e) => (e ? borrarInstantanea(e, i.id) : e))} className="mu-icono" aria-label="Borrar copia">×</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {panel === "espacios" && (
        <section className="mu-panel">
          <h2>Espacios independientes</h2>
          <p className="mu-p">Cada espacio tiene su parrilla, sus zonas y su tema. Se guardan todos juntos.</p>
          <form
            className="mt-2 flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!nuevoNombre.trim()) return;
              setEspacio((prev) => {
                if (!prev) return prev;
                return crearNucleo(prev, nuevoNombre, clavesIniciales).espacio;
              });
              setNuevoNombre("");
              setAviso("Espacio creado.");
            }}
          >
            <input value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} placeholder="nombre del espacio" className="mu-input min-w-[200px] flex-1" maxLength={32} />
            <button type="submit" className="mu-accion">Crear</button>
          </form>
          <ul className="mt-3 space-y-1.5">
            {Object.entries(espacio.nucleos).map(([clave, n]) => (
              <li key={clave} className="flex items-center gap-2 rounded-lg border border-white/10 px-2 py-1.5 text-[12px]">
                <span className="min-w-0 flex-1 truncate text-white/70">
                  {n.nombre} <span className="text-white/30">· {n.piezas.length} piezas · {n.zonas.length} zonas</span>
                </span>
                {clave === espacio.activo ? (
                  <span className="text-[11px] text-white/35">activo</span>
                ) : (
                  <button type="button" onClick={() => setEspacio((e) => (e ? abrirNucleo(e, clave) : e))} className="mu-accion">Abrir</button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (Object.keys(espacio.nucleos).length <= 1) return;
                    if (!window.confirm(`¿Borrar el espacio «${n.nombre}»? Sus piezas no tocan la casa; este trazado se pierde.`)) return;
                    setEspacio((e) => (e ? borrarNucleo(e, clave) : e));
                  }}
                  className="mu-icono"
                  aria-label={`Borrar ${n.nombre}`}
                  disabled={Object.keys(espacio.nucleos).length <= 1}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── la parrilla ── */}
      <div className="space-y-5">
        {nucleo.zonas.map((zona) => {
          const piezas = nucleo.piezas.filter((p) => p.zona === zona.id);
          return (
            <section
              key={zona.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                soltarEnZona(zona.id);
              }}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-3"
            >
              <header className="mb-2.5 flex items-center gap-2">
                <input
                  value={zona.nombre}
                  onChange={(e) => {
                    const v = e.target.value;
                    editar((n) => ({
                      ...n,
                      zonas: n.zonas.map((z) => (z.id === zona.id ? { ...z, nombre: v.slice(0, 28) } : z)),
                    }));
                  }}
                  aria-label="Nombre de la zona"
                  className="w-32 bg-transparent text-[12px] font-semibold uppercase tracking-[0.16em] text-white/55 outline-none focus:text-white/90"
                  maxLength={28}
                />
                <span className="text-[11px] text-white/25">{piezas.length}</span>
                <div className="ml-auto flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setZonaDestino(zona.id);
                      setPaleta(true);
                    }}
                    className="mu-icono"
                    aria-label={`Añadir pieza a ${zona.nombre}`}
                    title="Añadir pieza a esta zona"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (nucleo.zonas.length <= 1) return;
                      if (!window.confirm(`¿Quitar la zona «${zona.nombre}»? Sus piezas pasan a la primera zona.`)) return;
                      editar((n) => quitarZona(n, zona.id));
                    }}
                    className="mu-icono"
                    aria-label={`Quitar zona ${zona.nombre}`}
                    title="Quitar zona (las piezas se mudan, no se borran)"
                    disabled={nucleo.zonas.length <= 1}
                  >
                    ×
                  </button>
                </div>
              </header>

              <div
                className="grid gap-2.5"
                style={{ gridTemplateColumns: `repeat(${nucleo.columnas}, minmax(0, 1fr))`, gridAutoRows: "104px" }}
              >
                {piezas.map((p) => (
                  <PiezaTarjeta
                    key={p.id}
                    pieza={p}
                    ficha={ficha.get(p.clave)}
                    acento={t.acento}
                    seleccionada={sel === p.id}
                    arrastrando={arrastre === p.id}
                    onSeleccionar={() => setSel(sel === p.id ? null : p.id)}
                    onArrastreInicio={() => setArrastre(p.id)}
                    onArrastreFin={() => setArrastre(null)}
                    onSoltarSobre={() => soltarSobre(p)}
                    onFavorito={() => editar((n) => alternarFavorito(n, p.id))}
                    onAncho={(d) => editar((n) => redimensionar(n, p.id, paso(p.ancho, d, anchos), p.alto))}
                    onAlto={(d) => editar((n) => redimensionar(n, p.id, p.ancho, paso(p.alto, d, ALTOS)))}
                    onQuitar={() => {
                      editar((n) => quitarPieza(n, p.id));
                      setSel(null);
                      setAviso("Pieza quitada del espacio. El módulo sigue en la casa.");
                    }}
                  />
                ))}
                {piezas.length === 0 && (
                  <p className="col-span-full rounded-xl border border-dashed border-white/10 px-3 py-6 text-center text-[12px] text-white/35">
                    Zona vacía. Arrastra una pieza aquí o pulsa «+».
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            const nombre = window.prompt("Nombre de la zona nueva");
            if (nombre) editar((n) => crearZona(n, nombre));
          }}
          className="mu-accion"
        >
          + Zona
        </button>
        <span className="text-[11px] text-white/30">
          {r.piezas} piezas · {r.zonas} zonas · {r.favoritas} favoritas · {r.espacios} espacio(s) · {r.instantaneas} copia(s)
        </span>
        <input
          ref={archivo}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const texto = await f.text();
            const leido = leerArchivo(texto);
            if (!leido) {
              setAviso("Ese archivo no es un espacio de Mi universo válido: no se ha tocado nada.");
              return;
            }
            setEspacio(leido);
            setAviso("Espacio importado. Guardado en este dispositivo.");
            e.target.value = "";
          }}
        />
      </div>

      {/* ── paleta ── */}
      {paleta && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={() => setPaleta(false)} role="dialog" aria-modal="true" aria-label="Añadir módulos">
          <div className="flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#08090f]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <h2 className="text-[13px] font-semibold text-white/80">Añadir al espacio</h2>
              <button type="button" onClick={() => setPaleta(false)} className="ml-auto mu-icono" aria-label="Cerrar">×</button>
            </div>
            <div className="px-4 py-3">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Buscar entre ${catalogo.length} salas reales…`} className="mu-input w-full" autoFocus />
              <p className="mt-1.5 text-[11px] text-white/30">
                Todo lo que hay aquí es una sala que ya existe en la casa. Añadir una pieza no crea nada nuevo: te da la puerta.
              </p>
            </div>
            <ul className="flex-1 overflow-y-auto px-2 pb-6">
              {buscar(q).slice(0, 200).map((p) => {
                const yaEsta = nucleo.piezas.some((x) => x.clave === p.clave);
                return (
                  <li key={p.clave}>
                    <button
                      type="button"
                      onClick={() => anadir(p.clave)}
                      disabled={yaEsta}
                      className="flex w-full items-start gap-2.5 rounded-lg px-2 py-2 text-left transition hover:bg-white/[0.05] disabled:opacity-40"
                    >
                      <span
                        aria-hidden
                        className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md text-[10px] font-semibold"
                        style={{ background: `${p.acento}22`, color: p.acento, border: `1px solid ${p.acento}44` }}
                      >
                        {p.nombre.charAt(0).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12.5px] text-white/85">{p.nombre}</span>
                        <span className="block truncate text-[10.5px] uppercase tracking-[0.12em] text-white/30">{p.grupo}</span>
                        <span className="mt-0.5 block line-clamp-2 text-[11px] text-white/40">{p.desc}</span>
                      </span>
                      <span className="mt-1 shrink-0 text-[10px] text-white/30">{yaEsta ? "dentro" : "+"}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      <style jsx>{`
        .mu-accion {
          border-radius: 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 0.2rem 0.55rem;
          font-size: 11.5px;
          color: rgba(255, 255, 255, 0.72);
          background: rgba(255, 255, 255, 0.03);
          transition: all 0.15s ease;
        }
        .mu-accion:hover {
          color: #fff;
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.07);
        }
        .mu-icono {
          border-radius: 0.375rem;
          padding: 0 0.3rem;
          font-size: 14px;
          line-height: 1.2;
          color: rgba(255, 255, 255, 0.4);
        }
        .mu-icono:hover:not(:disabled) {
          color: #fff;
          background: rgba(255, 255, 255, 0.08);
        }
        .mu-icono:disabled {
          opacity: 0.25;
        }
        .mu-panel {
          margin-bottom: 1rem;
          border-radius: 0.9rem;
          border: 1px solid rgba(255, 255, 255, 0.09);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.012));
          padding: 0.9rem 1rem;
        }
        .mu-panel h2 {
          font-size: 12.5px;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: rgba(255, 255, 255, 0.85);
          margin-bottom: 0.4rem;
        }
        .mu-p {
          font-size: 11.5px;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 0.35rem;
        }
        .mu-p code {
          border-radius: 0.25rem;
          background: rgba(255, 255, 255, 0.08);
          padding: 0 0.25rem;
          color: rgba(255, 255, 255, 0.75);
        }
        .mu-input {
          border-radius: 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.03);
          padding: 0.3rem 0.55rem;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.85);
          outline: none;
        }
        .mu-input:focus {
          border-color: var(--mu-acento);
        }
      `}</style>
    </div>
  );
}

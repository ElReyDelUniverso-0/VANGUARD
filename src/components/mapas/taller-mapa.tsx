"use client";

// ═══════════════════════════════════════════════════════════════════
// v436.5 · EL TALLER — crear el mapa, verlo en 2D y en 3D, sacarlo
//
// Tres columnas y ninguna ceremonia: a la izquierda el planeta (2D con las
// fronteras reales del mapa de la casa, o 3D con el globo de verdad), en medio
// lo que llevas puesto (puntos y trazos, con su nota y su fuente), a la derecha
// el documento y las salidas (guardar, exportar GeoJSON, JSON, HTML, importar).
//
// Honestidad del aparato: el mapa se guarda en TU navegador. Vanguard no tiene
// tu mapa hasta que lo exportes o lo publiques en La Forja, y así se dice en la
// propia pantalla, no en una nota al pie.
// ═══════════════════════════════════════════════════════════════════
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, MouseEvent as EventoReact } from "react";
import worldPaths from "@/lib/world-paths.json";
import { geoMercator } from "d3-geo";
import {
  COLOR_TRAZO,
  TIPOS,
  aGeoJSON,
  aHTML,
  aJSON,
  colorDeTipo,
  desdeTexto,
  descargar,
  documentoVacio,
  guardarDocumento,
  borrarDocumento,
  leerLista,
  nombreDeArchivo,
  normalizar,
  nuevoId,
  resumen,
  type DocumentoMapa,
  type Punto,
  type TipoPunto,
} from "@/lib/mapas/taller";

const Globo = dynamic(() => import("@/components/vanguard/globe-map-3d").then((m) => m.GlobeMap3D), {
  ssr: false,
  loading: () => (
    <div style={{ height: "min(58vh, 520px)", display: "grid", placeItems: "center", color: "#6d7a8c" }}>
      DESPLEGANDO EL PLANETA…
    </div>
  ),
});

const W = 1000;
const H = 500;

// La MISMA proyección que el mapa de la casa (world-map-svg): si un punto cae
// aquí, cae en el mismo sitio en el resto de Vanguard. Copiada a propósito para
// que el taller no arrastre el componente entero del tablero.
const proyeccion = geoMercator()
  .rotate([-10, 0])
  .center([0, 20])
  .scale(155)
  .translate([W / 2, H / 2 + 45]);

const projectLatLng = (lat: number, lng: number) => {
  const p = proyeccion([lng, lat]);
  return { x: p?.[0] ?? 0, y: p?.[1] ?? 0 };
};

const unprojectXY = (x: number, y: number) => {
  const inv = proyeccion.invert?.([x, y]);
  return { lng: inv?.[0] ?? 0, lat: inv?.[1] ?? 0 };
};

const oro = "#FF9F45";
const borde = "#1b2430";
const tenue = "#8b98aa";

export function TallerMapa() {
  const [doc, setDoc] = useState<DocumentoMapa>(() => documentoVacio());
  const [vista, setVista] = useState<"2d" | "3d">("2d");
  const [herramienta, setHerramienta] = useState<"punto" | "trazo">("punto");
  const [tipo, setTipo] = useState<TipoPunto>("punto");
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [trazoEnCurso, setTrazoEnCurso] = useState<[number, number][]>([]);
  const [guardados, setGuardados] = useState<DocumentoMapa[]>([]);
  const [aviso, setAviso] = useState<string>("");
  const [entrada, setEntrada] = useState<string>("");
  const archivo = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setGuardados(leerLista());
  }, []);

  const decir = useCallback((t: string) => {
    setAviso(t);
    window.setTimeout(() => setAviso(""), 4200);
  }, []);

  const cambiar = useCallback((parcial: Partial<DocumentoMapa>) => {
    setDoc((d) => ({ ...d, ...parcial }));
  }, []);

  // ── el planeta se toca y aparece un punto ────────────────────────────
  const clic2D = useCallback(
    (e: EventoReact<SVGSVGElement>) => {
      const caja = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - caja.left) / caja.width) * W;
      const y = ((e.clientY - caja.top) / caja.height) * H;
      const { lat, lng } = unprojectXY(x, y);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      if (herramienta === "trazo") {
        setTrazoEnCurso((t) => [...t, [Number(lat.toFixed(4)), Number(lng.toFixed(4))]]);
        return;
      }
      const p: Punto = {
        id: nuevoId(),
        lat: Number(lat.toFixed(4)),
        lng: Number(lng.toFixed(4)),
        nombre: `Punto ${doc.puntos.length + 1}`,
        tipo,
        nota: "",
        fuente: "",
      };
      setDoc((d) => ({ ...d, puntos: [...d.puntos, p] }));
      setSeleccion(p.id);
    },
    [doc.puntos.length, herramienta, tipo]
  );

  // El mismo gesto sirve en el globo: se toca el planeta y cae el punto.
  const clic3D = useCallback(
    (lat: number, lng: number) => {
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      if (herramienta === "trazo") {
        setTrazoEnCurso((t) => [...t, [Number(lat.toFixed(4)), Number(lng.toFixed(4))]]);
        return;
      }
      const p: Punto = {
        id: nuevoId(),
        lat: Number(lat.toFixed(4)),
        lng: Number(lng.toFixed(4)),
        nombre: `Punto ${doc.puntos.length + 1}`,
        tipo,
        nota: "",
        fuente: "",
      };
      setDoc((d) => ({ ...d, puntos: [...d.puntos, p] }));
      setSeleccion(p.id);
    },
    [doc.puntos.length, herramienta, tipo]
  );

  const cerrarTrazo = useCallback(() => {
    if (trazoEnCurso.length < 2) {
      decir("Un trazo necesita al menos dos puntos.");
      return;
    }
    setDoc((d) => ({
      ...d,
      trazos: [
        ...d.trazos,
        { id: nuevoId(), nombre: `Trazo ${d.trazos.length + 1}`, color: COLOR_TRAZO, puntos: trazoEnCurso },
      ],
    }));
    setTrazoEnCurso([]);
    decir("Trazo cerrado.");
  }, [decir, trazoEnCurso]);

  const editarPunto = useCallback((id: string, parcial: Partial<Punto>) => {
    setDoc((d) => ({ ...d, puntos: d.puntos.map((p) => (p.id === id ? { ...p, ...parcial } : p)) }));
  }, []);

  const quitarPunto = useCallback((id: string) => {
    setDoc((d) => ({ ...d, puntos: d.puntos.filter((p) => p.id !== id) }));
    setSeleccion((s) => (s === id ? null : s));
  }, []);

  const n = resumen(doc);

  // ── el globo 3D se alimenta del mismo documento ─────────────────────
  const marcadores = useMemo(
    () =>
      doc.puntos.map((p) => ({
        id: p.id,
        lat: p.lat,
        lng: p.lng,
        color: colorDeTipo(p.tipo),
        label: `${p.nombre}${p.fuente ? ` · ${p.fuente}` : ""}`,
        ring: false,
      })),
    [doc.puntos]
  );

  const arcos = useMemo(
    () =>
      doc.trazos.flatMap((t) =>
        t.puntos.slice(1).map((p, i) => ({
          startLat: t.puntos[i][0],
          startLng: t.puntos[i][1],
          endLat: p[0],
          endLng: p[1],
          color: [t.color, t.color] as [string, string],
          stroke: 0.6,
        }))
      ),
    [doc.trazos]
  );

  const guardar = useCallback(() => {
    setGuardados(guardarDocumento(doc));
    decir("Guardado en este aparato. Vanguard no lo tiene: expórtalo si quieres sacarlo de aquí.");
  }, [decir, doc]);

  const exportar = useCallback(
    (que: "geojson" | "json" | "html") => {
      if (que === "geojson") {
        descargar(nombreDeArchivo(doc, "geojson"), aGeoJSON(doc), "application/geo+json");
      } else if (que === "json") {
        descargar(nombreDeArchivo(doc, "json"), aJSON(doc), "application/json");
      } else {
        descargar(
          nombreDeArchivo(doc, "html"),
          aHTML(doc, worldPaths as { landPath: string; borderPath: string; graticulePath: string }, projectLatLng),
          "text/html"
        );
      }
      decir(que === "html" ? "HTML autónomo descargado: se abre sin Vanguard y sin internet." : "Archivo descargado.");
    },
    [decir, doc]
  );

  const importar = useCallback(
    (crudo: string) => {
      const leido = desdeTexto(crudo);
      if (!leido) {
        decir("No he podido leer eso: pega un documento de este taller o un GeoJSON con puntos.");
        return;
      }
      setDoc(leido);
      decir(`Importado: ${leido.puntos.length} puntos y ${leido.trazos.length} trazos.`);
      setEntrada("");
    },
    [decir]
  );

  const subirArchivo = useCallback(
    async (file: File | null) => {
      if (!file) return;
      const texto = await file.text();
      importar(texto);
    },
    [importar]
  );

  const punto = doc.puntos.find((p) => p.id === seleccion) ?? null;

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {/* barra de mandos */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        {(["2d", "3d"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setVista(v)}
            style={boton(vista === v)}
          >
            {v === "2d" ? "Plano 2D" : "Globo 3D"}
          </button>
        ))}
        <span style={{ width: 1, height: 22, background: borde, margin: "0 4px" }} />
        <button type="button" onClick={() => setHerramienta("punto")} style={boton(herramienta === "punto")}>
          Poner punto
        </button>
        <button type="button" onClick={() => setHerramienta("trazo")} style={boton(herramienta === "trazo")}>
          Dibujar trazo
        </button>
        {herramienta === "trazo" && (
          <>
            <button type="button" onClick={cerrarTrazo} style={boton(false)}>
              Cerrar trazo ({trazoEnCurso.length})
            </button>
            {trazoEnCurso.length > 0 && (
              <button type="button" onClick={() => setTrazoEnCurso([])} style={boton(false)}>
                Deshacer vértices
              </button>
            )}
          </>
        )}
        <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: tenue }}>
          {vista === "3d" ? "gira y toca el globo para poner" : "toca el plano para poner"}
        </span>
        <span style={{ marginLeft: "auto", fontFamily: "ui-monospace, monospace", fontSize: 11, color: tenue }}>
          {n.puntos} puntos · {n.trazos} trazos{n.sinFuente > 0 ? ` · ${n.sinFuente} sin fuente` : ""}
        </span>
      </div>

      {herramienta === "punto" && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {TIPOS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTipo(t.id)}
              style={{
                ...boton(tipo === t.id),
                borderColor: tipo === t.id ? t.color : borde,
                color: tipo === t.id ? t.color : tenue,
              }}
            >
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 8, background: t.color, marginRight: 6 }} />
              {t.nombre}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.6fr) minmax(280px, 1fr)", gap: 14 }}>
        {/* el planeta */}
        <div style={{ border: `1px solid ${borde}`, background: "#070c12", borderRadius: 4, overflow: "hidden" }}>
          {vista === "2d" ? (
            <svg
              viewBox={`0 0 ${W} ${H}`}
              onClick={clic2D}
              style={{ display: "block", width: "100%", height: "auto", cursor: "crosshair" }}
              role="application"
              aria-label="Plano del mundo: toca para poner un punto o un vértice del trazo"
            >
              <path d={(worldPaths as { graticulePath: string }).graticulePath} fill="none" stroke="#1c2733" strokeWidth={0.5} />
              <path d={(worldPaths as { landPath: string }).landPath} fill="#121a24" stroke="#28394d" strokeWidth={0.5} />
              <path d={(worldPaths as { borderPath: string }).borderPath} fill="none" stroke="#33475e" strokeWidth={0.4} />
              {doc.trazos.map((t) => (
                <path
                  key={t.id}
                  d={t.puntos
                    .map(([lat, lng], i) => {
                      const { x, y } = projectLatLng(lat, lng);
                      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke={t.color}
                  strokeWidth={1.8}
                  strokeDasharray="6 4"
                />
              ))}
              {trazoEnCurso.length > 1 && (
                <path
                  d={trazoEnCurso
                    .map(([lat, lng], i) => {
                      const { x, y } = projectLatLng(lat, lng);
                      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke={oro}
                  strokeWidth={1.6}
                  strokeDasharray="3 3"
                />
              )}
              {trazoEnCurso.map(([lat, lng], i) => {
                const { x, y } = projectLatLng(lat, lng);
                return <circle key={`v${i}`} cx={x} cy={y} r={2.6} fill={oro} />;
              })}
              {doc.puntos.map((p) => {
                const { x, y } = projectLatLng(p.lat, p.lng);
                const activo = p.id === seleccion;
                return (
                  <g key={p.id} onClick={() => setSeleccion(p.id)} style={{ cursor: "pointer" }}>
                    {activo && <circle cx={x} cy={y} r={9} fill="none" stroke={colorDeTipo(p.tipo)} strokeWidth={1} />}
                    <circle cx={x} cy={y} r={4} fill={colorDeTipo(p.tipo)} stroke="#05070a" strokeWidth={1.2} />
                    <title>{`${p.nombre}${p.nota ? ` — ${p.nota}` : ""}`}</title>
                  </g>
                );
              })}
            </svg>
          ) : (
            <Globo markers={marcadores} arcs={arcos} bordes graticulas autoRotate height="min(58vh, 520px)" minHeight={320} onGlobeClick={clic3D} />
          )}
        </div>

        {/* lo que llevas puesto */}
        <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
          <div style={{ border: `1px solid ${borde}`, borderRadius: 4, padding: 12, background: "#0a1017" }}>
            <label style={etiqueta}>Nombre del mapa</label>
            <input
              value={doc.nombre}
              onChange={(e) => cambiar({ nombre: e.target.value.slice(0, 120) })}
              style={campo}
              placeholder="Los estrechos que importan"
            />
            <label style={etiqueta}>Lema (una línea)</label>
            <input
              value={doc.lema}
              onChange={(e) => cambiar({ lema: e.target.value.slice(0, 240) })}
              style={campo}
              placeholder="Qué responde este mapa"
            />
            <label style={etiqueta}>Firma</label>
            <input
              value={doc.autor}
              onChange={(e) => cambiar({ autor: e.target.value.slice(0, 80) })}
              style={campo}
              placeholder="Quién lo hizo"
            />
          </div>

          <div style={{ border: `1px solid ${borde}`, borderRadius: 4, padding: 12, background: "#0a1017", maxHeight: 300, overflow: "auto" }}>
            <p style={{ margin: "0 0 8px", fontFamily: "ui-monospace, monospace", fontSize: 10, letterSpacing: ".16em", color: oro }}>
              PUNTOS
            </p>
            {doc.puntos.length === 0 && <p style={{ margin: 0, fontSize: 12, color: tenue }}>Toca el mapa para poner el primero.</p>}
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 4 }}>
              {doc.puntos.map((p, i) => (
                <li key={p.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => setSeleccion(p.id)}
                    style={{
                      flex: 1,
                      textAlign: "left",
                      background: p.id === seleccion ? "#16202b" : "transparent",
                      border: "none",
                      color: p.id === seleccion ? "#fff" : "#c8d2e0",
                      fontSize: 12,
                      padding: "4px 6px",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ color: colorDeTipo(p.tipo) }}>●</span> {i + 1}. {p.nombre || "sin nombre"}
                    {!p.fuente && <span style={{ color: "#b45309", fontSize: 10 }}> · sin fuente</span>}
                  </button>
                  <button type="button" onClick={() => quitarPunto(p.id)} style={botonMini} aria-label={`Quitar ${p.nombre}`}>
                    ×
                  </button>
                </li>
              ))}
            </ul>
            {doc.trazos.length > 0 && (
              <>
                <p style={{ margin: "10px 0 6px", fontFamily: "ui-monospace, monospace", fontSize: 10, letterSpacing: ".16em", color: oro }}>
                  TRAZOS
                </p>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 4 }}>
                  {doc.trazos.map((t) => (
                    <li key={t.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#c8d2e0" }}>
                      <span style={{ color: t.color }}>▬</span>
                      <span style={{ flex: 1 }}>
                        {t.nombre} <span style={{ color: tenue, fontSize: 10 }}>({t.puntos.length} vértices)</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setDoc((d) => ({ ...d, trazos: d.trazos.filter((x) => x.id !== t.id) }))}
                        style={botonMini}
                        aria-label={`Quitar ${t.nombre}`}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {punto && (
            <div style={{ border: `1px solid ${borde}`, borderRadius: 4, padding: 12, background: "#0a1017" }}>
              <p style={{ margin: "0 0 8px", fontFamily: "ui-monospace, monospace", fontSize: 10, letterSpacing: ".16em", color: colorDeTipo(punto.tipo) }}>
                FICHA DEL PUNTO · {punto.lat.toFixed(3)}, {punto.lng.toFixed(3)}
              </p>
              <label style={etiqueta}>Nombre</label>
              <input value={punto.nombre} onChange={(e) => editarPunto(punto.id, { nombre: e.target.value.slice(0, 120) })} style={campo} />
              <label style={etiqueta}>Qué es</label>
              <textarea
                value={punto.nota}
                onChange={(e) => editarPunto(punto.id, { nota: e.target.value.slice(0, 600) })}
                rows={3}
                style={{ ...campo, resize: "vertical" }}
                placeholder="Qué pasa aquí y por qué importa"
              />
              <label style={etiqueta}>Fuente</label>
              <input
                value={punto.fuente}
                onChange={(e) => editarPunto(punto.id, { fuente: e.target.value.slice(0, 240) })}
                style={campo}
                placeholder="De dónde sale el dato"
              />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                {TIPOS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => editarPunto(punto.id, { tipo: t.id })}
                    style={{ ...botonMini, color: punto.tipo === t.id ? t.color : tenue, borderColor: punto.tipo === t.id ? t.color : borde, width: "auto", padding: "0 6px" }}
                  >
                    {t.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* salidas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
        <section style={caja}>
          <p style={titulillo}>GUARDAR EN ESTE APARATO</p>
          <p style={parrafo}>
            El mapa vive en tu navegador. No viaja a ningún servidor y Vanguard no lo ve: si quieres sacarlo de aquí,
            expórtalo.
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button type="button" onClick={guardar} style={boton(true)}>
              Guardar mapa
            </button>
            <button type="button" onClick={() => { setDoc(documentoVacio()); setSeleccion(null); setTrazoEnCurso([]); }} style={boton(false)}>
              Empezar otro
            </button>
          </div>
          {guardados.length > 0 && (
            <ul style={{ margin: "10px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 3 }}>
              {guardados.map((g) => (
                <li key={g.id} style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12, color: "#c8d2e0" }}>
                  <button type="button" onClick={() => setDoc(normalizar(g) ?? g)} style={{ ...botonMini, width: "auto", flex: 1, textAlign: "left", border: "none" }}>
                    {g.nombre} <span style={{ color: tenue, fontSize: 10 }}>· {g.puntos.length}p</span>
                  </button>
                  <button type="button" onClick={() => setGuardados(borrarDocumento(g.id))} style={botonMini} aria-label={`Borrar ${g.nombre}`}>
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section style={caja}>
          <p style={titulillo}>SACARLO DE AQUÍ</p>
          <p style={parrafo}>
            GeoJSON para cualquier SIG (QGIS, ArcGIS, Kepler), JSON para volver a abrirlo en este taller, y un HTML
            autónomo que se abre solo con el planeta y las fichas dentro.
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button type="button" onClick={() => exportar("geojson")} style={boton(false)}>
              GeoJSON
            </button>
            <button type="button" onClick={() => exportar("json")} style={boton(false)}>
              JSON
            </button>
            <button type="button" onClick={() => exportar("html")} style={boton(false)}>
              HTML autónomo
            </button>
          </div>
        </section>

        <section style={caja}>
          <p style={titulillo}>METER UN MAPA DE FUERA</p>
          <p style={parrafo}>Pega un documento de este taller o un GeoJSON con puntos y líneas. Se valida campo a campo.</p>
          <textarea
            value={entrada}
            onChange={(e) => setEntrada(e.target.value)}
            rows={3}
            style={{ ...campo, resize: "vertical", fontFamily: "ui-monospace, monospace", fontSize: 11 }}
            placeholder='{"type":"FeatureCollection","features":[…]}'
          />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
            <button type="button" onClick={() => importar(entrada)} style={boton(false)}>
              Importar lo pegado
            </button>
            <button type="button" onClick={() => archivo.current?.click()} style={boton(false)}>
              Abrir archivo
            </button>
            <input
              ref={archivo}
              type="file"
              accept=".json,.geojson,application/json"
              onChange={(e) => void subirArchivo(e.target.files?.[0] ?? null)}
              style={{ display: "none" }}
            />
          </div>
        </section>

        <section style={caja}>
          <p style={titulillo}>PUBLICARLO EN LA CASA</p>
          <p style={parrafo}>
            La Forja es la puerta de la casa para lo que hace la gente: mapas, escenarios e investigaciones, con tu
            nombre. Exporta el HTML o el GeoJSON y publícalo allí — con su fuente, que es lo que hace que un mapa valga.
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Link href="/creadores/publicar" style={{ ...boton(true), textDecoration: "none", display: "inline-block" }}>
              Ir a La Forja
            </Link>
            <Link href="/mapas/indice" style={{ ...boton(false), textDecoration: "none", display: "inline-block" }}>
              Ver los mapas de la casa
            </Link>
          </div>
        </section>
      </div>

      {aviso && (
        <p
          role="status"
          style={{
            margin: 0,
            padding: "8px 12px",
            border: `1px solid ${oro}55`,
            background: "#1a1206",
            color: "#ffd9a8",
            fontSize: 12,
            borderRadius: 4,
          }}
        >
          {aviso}
        </p>
      )}
    </div>
  );
}

const boton = (activo: boolean): CSSProperties => ({
  padding: "6px 10px",
  fontSize: 12,
  fontFamily: "ui-monospace, monospace",
  letterSpacing: ".04em",
  background: activo ? "#1a1206" : "#0a1017",
  color: activo ? oro : "#c8d2e0",
  border: `1px solid ${activo ? oro : borde}`,
  borderRadius: 3,
  cursor: "pointer",
});

const botonMini: CSSProperties = {
  width: 22,
  height: 22,
  fontSize: 13,
  lineHeight: 1,
  background: "transparent",
  color: tenue,
  border: `1px solid ${borde}`,
  borderRadius: 3,
  cursor: "pointer",
};

const campo: CSSProperties = {
  width: "100%",
  padding: "7px 9px",
  fontSize: 13,
  background: "#05070a",
  color: "#e6e9ef",
  border: `1px solid ${borde}`,
  borderRadius: 3,
  marginBottom: 8,
};

const etiqueta: CSSProperties = {
  display: "block",
  fontSize: 10,
  fontFamily: "ui-monospace, monospace",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: tenue,
  marginBottom: 4,
};

const caja: CSSProperties = {
  border: `1px solid ${borde}`,
  borderRadius: 4,
  padding: 12,
  background: "#0a1017",
};

const titulillo: CSSProperties = {
  margin: "0 0 6px",
  fontFamily: "ui-monospace, monospace",
  fontSize: 10,
  letterSpacing: ".16em",
  color: oro,
};

const parrafo: CSSProperties = {
  margin: "0 0 8px",
  fontSize: 12,
  lineHeight: 1.5,
  color: tenue,
};

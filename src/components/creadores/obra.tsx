"use client";

// v406.1 · LA FORJA — la página de una obra: contenido, versiones, valoración,
// comentarios, colecciones y reporte. Solo enseña los botones que tu rol permite.
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { INFO_CLASES, esClase, type Datos } from "@/lib/creadores/tipos";
import { MOTIVOS_REPORTE, TEXTO_ESTADO, type Estado } from "@/lib/creadores/moderacion";
import { useYo, pedir, Acceso, AvisoAlmacen, MiniMapa, Estrellas, Chip, Cargando, haceCuanto } from "./comun";

type Detalle = {
  obra: {
    id: string;
    clase: string;
    autor: string;
    titulo: string;
    resumen: string;
    cuerpo: string;
    datos: Datos;
    etiquetas: string[];
    version: number;
    destacada: boolean;
    estado: string;
    valoracion: { suma: number; n: number };
    vistas: number;
    creada: number;
    motivoModeracion?: string;
  };
  versiones: { n: number; titulo: string; nota: string; creada: number; cambios: string[] }[];
  comentarios: { id: string; autor: string; texto: string; estado: string; creada: number }[];
  miValoracion: number;
  misColecciones: { id: string; titulo: string; contiene: boolean }[];
  yo: { alias: string | null; rol: string; esAutor: boolean; modera: boolean };
};

export function Obra({ id }: { id: string }) {
  const { yo, recargar: recargarYo } = useYo();
  const [d, setD] = useState<Detalle | null>(null);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [texto, setTexto] = useState("");
  const [nuevaCol, setNuevaCol] = useState("");
  const [reporte, setReporte] = useState<{ comentario?: string } | null>(null);
  const [motivo, setMotivo] = useState<string>("");
  const [detalle, setDetalle] = useState("");
  const dlg = useRef<HTMLDialogElement>(null);

  const cargar = useCallback(async () => {
    const r = await pedir<Detalle>(`/api/creadores/obras/${encodeURIComponent(id)}`);
    if (r.ok) setD(r.data);
    else setError(r.data.error || "No se pudo abrir la obra.");
  }, [id]);
  useEffect(() => {
    let vivo = true;
    pedir<Detalle>(`/api/creadores/obras/${encodeURIComponent(id)}`).then((r) => {
      if (!vivo) return;
      if (r.ok) setD(r.data);
      else setError(r.data.error || "No se pudo abrir la obra.");
    });
    return () => {
      vivo = false;
    };
  }, [id]);
  useEffect(() => {
    if (reporte) dlg.current?.showModal();
    else dlg.current?.close();
  }, [reporte]);

  const accion = async (cuerpo: Record<string, unknown>) => {
    setAviso("");
    const r = await pedir<{ mensaje?: string }>(`/api/creadores/obras/${encodeURIComponent(id)}`, cuerpo);
    setAviso(r.data.mensaje || r.data.error || (r.ok ? "Hecho." : "No se pudo."));
    if (r.ok) await cargar();
    return r.ok;
  };
  const col = async (cuerpo: Record<string, unknown>) => {
    const r = await pedir<{ mensaje?: string }>("/api/creadores/colecciones", cuerpo);
    setAviso(r.data.mensaje || r.data.error || "");
    if (r.ok) await cargar();
  };

  if (error)
    return (
      <div className="fj">
        <div className="fj-vacio" style={{ marginTop: 40 }}>
          {error}
          <br />
          <Link className="fj-btn" href="/creadores" style={{ marginTop: 12 }}>
            Volver a La Forja
          </Link>
        </div>
      </div>
    );
  if (!d || !yo) return <div className="fj"><Cargando /></div>;

  const o = d.obra;
  const info = esClase(o.clase) ? INFO_CLASES[o.clase] : null;
  const p = yo.permisos;
  const datos = o.datos ?? {};

  return (
    <div className="fj" style={{ ["--c" as string]: info?.color ?? "#e8c56a" }}>
      <header className="fj-obra-cab">
        <p className="fj-volanta">
          <Link href="/creadores" style={{ color: "inherit" }}>
            La Forja
          </Link>{" "}
          · {info?.plural ?? o.clase}
        </p>
        <div className="fj-tarjeta-cab">
          <Chip clase={o.clase} />
          {o.destacada && <span className="fj-dest">★ Destacada por la moderación</span>}
          {o.estado !== "APROBADO" && <span className="fj-estado">{TEXTO_ESTADO[o.estado as Estado] ?? o.estado}</span>}
        </div>
        <h1>{o.titulo}</h1>
        <div className="fj-meta">
          <span>
            por <Link href={`/creadores/perfil/${o.autor}`}>{o.autor}</Link>
          </span>
          <span>versión {o.version}</span>
          <span>{haceCuanto(o.creada)}</span>
          <Estrellas suma={o.valoracion.suma} n={o.valoracion.n} />
          <span>{o.vistas} lecturas</span>
        </div>
        <p className="fj-resumen">{o.resumen}</p>
        {o.motivoModeracion && o.estado !== "APROBADO" && (
          <p className="fj-aviso">
            <b>Nota de moderación:</b> {o.motivoModeracion}
          </p>
        )}
        <AvisoAlmacen yo={yo} />
      </header>

      <div className="fj-dos">
        <article style={{ display: "grid", gap: 16, alignContent: "start" }}>
          {o.clase === "mapa" && datos.puntos && (
            <div className="fj-panel">
              <h2>El mapa · {datos.puntos.length} puntos</h2>
              <MiniMapa puntos={datos.puntos} alto={420} />
              <ol className="fj-lista">
                {datos.puntos.map((pt, i) => (
                  <li key={i}>
                    <b>{pt.etiqueta}</b> — {pt.lat}, {pt.lon}
                  </li>
                ))}
              </ol>
            </div>
          )}
          {o.clase === "escenario" && (
            <div className="fj-panel">
              <h2>El escenario · hipótesis, no predicción</h2>
              <p className="fj-resumen" style={{ color: "var(--tx)" }}>
                {datos.premisa}
              </p>
              <h3>Supuestos</h3>
              <ul className="fj-lista">{datos.supuestos?.map((s, i) => <li key={i}>{s}</li>)}</ul>
              {!!datos.vigilar?.length && (
                <>
                  <h3>Qué vigilar</h3>
                  <ul className="fj-lista">{datos.vigilar.map((s, i) => <li key={i}>{s}</li>)}</ul>
                </>
              )}
            </div>
          )}
          {o.clase === "investigacion" && (
            <div className="fj-panel">
              <h2>La pregunta</h2>
              <p className="fj-resumen" style={{ color: "var(--tx)" }}>
                {datos.pregunta}
              </p>
              <h3>Fuentes · {datos.fuentes?.length ?? 0}</h3>
              <ol className="fj-lista">
                {datos.fuentes?.map((u, i) => (
                  <li key={i}>
                    <a href={u} target="_blank" rel="noopener noreferrer nofollow ugc">
                      {u}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          )}
          {o.clase === "simulacion" && (
            <div className="fj-panel">
              <h2>El modelo</h2>
              <div className="fj-vars">
                {datos.variables?.map((v, i) => (
                  <div key={i}>
                    <b>
                      {v.valor}
                      {v.unidad ? ` ${v.unidad}` : ""}
                    </b>
                    <span>{v.nombre}</span>
                  </div>
                ))}
              </div>
              <h3>La regla</h3>
              <p className="fj-cuerpo">{datos.regla}</p>
              <Link className="fj-btn fj-btn-mini" href="/escenarios">
                Repetirla en El Estratega →
              </Link>
            </div>
          )}
          {o.clase === "proyecto" && (
            <div className="fj-panel">
              <h2>El proyecto</h2>
              <p className="fj-resumen" style={{ color: "var(--tx)" }}>
                {datos.objetivo}
              </p>
              <h3>
                Hitos · {datos.hitos?.filter((h) => h.hecho).length ?? 0}/{datos.hitos?.length ?? 0}
              </h3>
              <div className="fj-barra">
                <i style={{ width: `${datos.hitos?.length ? (100 * datos.hitos.filter((h) => h.hecho).length) / datos.hitos.length : 0}%` }} />
              </div>
              {datos.hitos?.map((h, i) => (
                <div className="fj-hito" key={i} data-hecho={h.hecho ? "1" : "0"}>
                  <i>{h.hecho ? "✓" : "○"}</i>
                  <span>{h.texto}</span>
                </div>
              ))}
            </div>
          )}
          {o.cuerpo && <p className="fj-cuerpo">{o.cuerpo}</p>}
          {!!datos.enlaces?.length && (
            <div className="fj-panel">
              <h3>En VANGUARD</h3>
              <div className="fj-etiquetas">
                {datos.enlaces.map((u) => (
                  <Link key={u} href={u} className="fj-btn fj-btn-mini">
                    {u}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {!!o.etiquetas.length && (
            <div className="fj-etiquetas">
              {o.etiquetas.map((e) => (
                <span key={e}>#{e}</span>
              ))}
            </div>
          )}

          {/* comentarios */}
          <section className="fj-panel" aria-labelledby="fj-com">
            <h2 id="fj-com">Comentarios · {d.comentarios.filter((c) => c.estado === "APROBADO").length}</h2>
            {p.includes("comentar") ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (await accion({ accion: "comentar", texto })) setTexto("");
                }}
                className="fj-form"
              >
                <label>
                  Tu comentario
                  <textarea value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={600} rows={3} style={{ minHeight: 80 }} />
                </label>
                <button className="fj-btn fj-btn-mini" disabled={texto.trim().length < 2} style={{ justifySelf: "start" }}>
                  Comentar
                </button>
              </form>
            ) : !yo.alias ? (
              <Acceso alEntrar={() => recargarYo().then(cargar)} texto="Entra para comentar y valorar" />
            ) : null}
            {d.comentarios.length ? (
              d.comentarios.map((c) => (
                <div className="fj-comentario" key={c.id}>
                  <header>
                    <Link href={`/creadores/perfil/${c.autor}`}>{c.autor}</Link>
                    <span>{haceCuanto(c.creada)}</span>
                    {c.estado !== "APROBADO" && <span className="fj-estado">en revisión</span>}
                  </header>
                  <p>{c.texto}</p>
                  {p.includes("reportar") && c.autor !== yo.alias && (
                    <button onClick={() => setReporte({ comentario: c.id })}>Reportar comentario</button>
                  )}
                </div>
              ))
            ) : (
              <p className="fj-ayuda">Nadie ha comentado todavía.</p>
            )}
          </section>
        </article>

        <aside style={{ display: "grid", gap: 16, alignContent: "start" }}>
          {aviso && (
            <p className="fj-aviso" role="status">
              {aviso}
            </p>
          )}

          {d.yo.esAutor && (
            <div className="fj-panel">
              <h3>Tu obra</h3>
              <div className="fj-acciones">
                {o.estado !== "OCULTO" && o.estado !== "ELIMINADO" && (
                  <Link className="fj-btn fj-btn-oro fj-btn-mini" href={`/creadores/publicar?editar=${o.id}`}>
                    Nueva versión
                  </Link>
                )}
                {o.estado === "RETIRADA" ? (
                  <button className="fj-btn fj-btn-mini" onClick={() => accion({ accion: "republicar" })}>
                    Volver a publicar
                  </button>
                ) : (
                  <button className="fj-btn fj-btn-mini fj-btn-rojo" onClick={() => confirm("¿Retirar la obra de la vitrina?") && accion({ accion: "retirar" })}>
                    Retirar
                  </button>
                )}
              </div>
            </div>
          )}

          {!d.yo.esAutor && o.estado === "APROBADO" && p.includes("valorar") && (
            <div className="fj-panel">
              <h3>Tu valoración</h3>
              <div className="fj-votar" role="group" aria-label="Valorar de 1 a 5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} data-on={n <= d.miValoracion ? "1" : "0"} aria-label={`${n} estrellas`} aria-pressed={n === d.miValoracion} onClick={() => accion({ accion: "valorar", valor: n })}>
                    ★
                  </button>
                ))}
              </div>
              <p className="fj-ayuda">Una valoración por cuenta. Puedes cambiarla cuando quieras.</p>
            </div>
          )}

          {p.includes("coleccionar") && o.estado === "APROBADO" && (
            <div className="fj-panel">
              <h3>Colecciones</h3>
              {d.misColecciones.map((c) => (
                <label key={c.id} style={{ display: "flex", gap: 8, alignItems: "center", textTransform: "none", letterSpacing: 0, font: "inherit", color: "var(--tx)" }}>
                  <input type="checkbox" checked={c.contiene} onChange={() => col({ accion: c.contiene ? "quitar" : "agregar", id: c.id, itemId: o.id })} style={{ width: 20, height: 20 }} />
                  {c.titulo}
                </label>
              ))}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await col({ accion: "crear", titulo: nuevaCol, itemId: o.id });
                  setNuevaCol("");
                }}
                className="fj-acciones"
              >
                <input value={nuevaCol} onChange={(e) => setNuevaCol(e.target.value)} placeholder="Nueva colección" maxLength={70} aria-label="Nombre de la nueva colección" style={{ flex: 1, minHeight: 38, borderRadius: 999, border: "1px solid var(--linea)", background: "rgba(0,0,0,.35)", color: "var(--tx)", padding: "0 12px" }} />
                <button className="fj-btn fj-btn-mini" disabled={nuevaCol.trim().length < 3}>
                  Crear y añadir
                </button>
              </form>
            </div>
          )}

          <div className="fj-panel">
            <h3>Versiones · {d.versiones.length}</h3>
            {d.versiones.map((v) => (
              <div className="fj-version" key={v.n}>
                <b>v{v.n}</b>
                <span>
                  {v.nota}
                  <br />
                  <small>{v.cambios.join(" · ")}</small>
                </span>
                <span style={{ display: "grid", justifyItems: "end", gap: 4 }}>
                  <small>{haceCuanto(v.creada)}</small>
                  {d.yo.esAutor && v.n !== o.version && (
                    <button className="fj-btn fj-btn-mini" onClick={() => confirm(`¿Publicar de nuevo la versión ${v.n} como versión ${o.version + 1}?`) && accion({ accion: "volver-a-version", n: v.n })}>
                      Volver a esta
                    </button>
                  )}
                </span>
              </div>
            ))}
          </div>

          {info && (
            <Link className="fj-btn" href={info.sala.href}>
              Abrir {info.sala.nombre} →
            </Link>
          )}
          {p.includes("reportar") && !d.yo.esAutor && (
            <button className="fj-btn fj-btn-mini fj-btn-rojo" onClick={() => setReporte({})}>
              Reportar esta obra
            </button>
          )}
          {d.yo.modera && (
            <Link className="fj-btn fj-btn-mini fj-btn-rojo" href="/creadores/moderacion">
              Abrir en la mesa de moderación
            </Link>
          )}
        </aside>
      </div>

      <dialog ref={dlg} className="fj-dialogo" onClose={() => setReporte(null)}>
        <form
          method="dialog"
          className="fj-form"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!motivo) return;
            await accion({ accion: "reportar", motivo, detalle, ...(reporte?.comentario ? { comentario: reporte.comentario } : {}) });
            setReporte(null);
            setMotivo("");
            setDetalle("");
          }}
        >
          <p className="fj-volanta">{reporte?.comentario ? "Reportar comentario" : "Reportar obra"}</p>
          {MOTIVOS_REPORTE.map((m) => (
            <label key={m.id} style={{ display: "flex", gap: 8, alignItems: "center", textTransform: "none", letterSpacing: 0, font: "inherit", color: "var(--tx)" }}>
              <input type="radio" name="motivo" value={m.id} checked={motivo === m.id} onChange={() => setMotivo(m.id)} style={{ width: 18, minHeight: 18 }} />
              {m.texto}
            </label>
          ))}
          <label>
            Detalle (opcional)
            <textarea value={detalle} onChange={(e) => setDetalle(e.target.value)} maxLength={300} rows={2} style={{ minHeight: 60 }} />
          </label>
          <div className="fj-acciones">
            <button className="fj-btn fj-btn-rojo" disabled={!motivo}>
              Enviar reporte
            </button>
            <button type="button" className="fj-btn" onClick={() => setReporte(null)}>
              Cancelar
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}

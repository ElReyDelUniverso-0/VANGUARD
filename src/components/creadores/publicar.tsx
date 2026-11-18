"use client";

// v406.1 · LA FORJA — publicar (o publicar una versión nueva) de una obra.
// El borrador se guarda solo en el aparato mientras escribes; al publicar,
// una copia queda en «tu taller» por si la base del servidor se reinicia.
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CLASES, INFO_CLASES, LIM, esClase, validarObra, type ClaseObra, type Punto, type Variable, type Hito, type Datos } from "@/lib/creadores/tipos";
import { useYo, pedir, Acceso, AvisoAlmacen, MiniMapa, Cargando, guardarEnTaller, leerTaller, type CopiaLocal } from "./comun";

type Form = {
  clase: ClaseObra;
  titulo: string;
  resumen: string;
  cuerpo: string;
  etiquetas: string;
  puntos: Punto[];
  premisa: string;
  supuestos: string;
  vigilar: string;
  pregunta: string;
  fuentes: string;
  variables: Variable[];
  regla: string;
  objetivo: string;
  hitos: Hito[];
  enlaces: string;
  nota: string;
};

const VACIO: Form = {
  clase: "mapa",
  titulo: "",
  resumen: "",
  cuerpo: "",
  etiquetas: "",
  puntos: [{ lat: 18.47, lon: -69.9, etiqueta: "" }],
  premisa: "",
  supuestos: "",
  vigilar: "",
  pregunta: "",
  fuentes: "",
  variables: [
    { nombre: "", valor: 0, unidad: "" },
    { nombre: "", valor: 0, unidad: "" },
  ],
  regla: "",
  objetivo: "",
  hitos: [{ texto: "", hecho: false }],
  enlaces: "",
  nota: "",
};

const CLAVE_BORRADOR = "vg-forja-borrador-v1";

function aEnvio(f: Form) {
  const datos: Datos = { enlaces: f.enlaces.split("\n").map((s) => s.trim()).filter(Boolean) };
  if (f.clase === "mapa") datos.puntos = f.puntos;
  if (f.clase === "escenario") Object.assign(datos, { premisa: f.premisa, supuestos: f.supuestos.split("\n"), vigilar: f.vigilar.split("\n") });
  if (f.clase === "investigacion") Object.assign(datos, { pregunta: f.pregunta, fuentes: f.fuentes.split("\n") });
  if (f.clase === "simulacion") Object.assign(datos, { variables: f.variables, regla: f.regla });
  if (f.clase === "proyecto") Object.assign(datos, { objetivo: f.objetivo, hitos: f.hitos });
  return { clase: f.clase, titulo: f.titulo, resumen: f.resumen, cuerpo: f.cuerpo, etiquetas: f.etiquetas, datos };
}

function desdeObra(o: { clase: string; titulo: string; resumen: string; cuerpo?: string; etiquetas: string[]; datos?: Datos }): Form {
  const d = o.datos ?? {};
  return {
    ...VACIO,
    clase: esClase(o.clase) ? o.clase : "mapa",
    titulo: o.titulo,
    resumen: o.resumen,
    cuerpo: o.cuerpo ?? "",
    etiquetas: o.etiquetas.join(", "),
    puntos: d.puntos?.length ? d.puntos : VACIO.puntos,
    premisa: d.premisa ?? "",
    supuestos: (d.supuestos ?? []).join("\n"),
    vigilar: (d.vigilar ?? []).join("\n"),
    pregunta: d.pregunta ?? "",
    fuentes: (d.fuentes ?? []).join("\n"),
    variables: d.variables?.length ? d.variables : VACIO.variables,
    regla: d.regla ?? "",
    objetivo: d.objetivo ?? "",
    hitos: d.hitos?.length ? d.hitos : VACIO.hitos,
    enlaces: (d.enlaces ?? []).join("\n"),
  };
}

export function Publicar() {
  const { yo, recargar } = useYo();
  const router = useRouter();
  const sp = useSearchParams();
  const editar = sp.get("editar");
  const [f, setF] = useState<Form>(VACIO);
  const [listo, setListo] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [taller, setTaller] = useState<CopiaLocal[]>([]);

  // arranque: edición de una obra, borrador del aparato o clase de la URL
  useEffect(() => {
    let vivo = true;
    (async () => {
      if (editar) {
        const r = await pedir<{ obra: Parameters<typeof desdeObra>[0] }>(`/api/creadores/obras/${encodeURIComponent(editar)}`);
        if (vivo && r.ok && r.data.obra) setF(desdeObra(r.data.obra));
        else if (vivo) setError(r.data.error || "No se pudo cargar la obra.");
      } else {
        let base = VACIO;
        try {
          const b = JSON.parse(localStorage.getItem(CLAVE_BORRADOR) || "null");
          if (b && esClase(b.clase)) base = { ...VACIO, ...b };
        } catch {
          /* sin borrador */
        }
        const c = sp.get("clase");
        if (esClase(c) && !(base.titulo || base.cuerpo)) base = { ...base, clase: c };
        if (vivo) setF(base);
      }
      if (vivo) {
        setTaller(leerTaller());
        setListo(true);
      }
    })();
    return () => {
      vivo = false;
    };
  }, [editar, sp]);

  // el borrador se guarda solo (no en modo edición)
  useEffect(() => {
    if (!listo || editar) return;
    const t = window.setTimeout(() => {
      try {
        localStorage.setItem(CLAVE_BORRADOR, JSON.stringify(f));
      } catch {
        /* aparato lleno */
      }
    }, 400);
    return () => window.clearTimeout(t);
  }, [f, listo, editar]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));
  const previa = useMemo(() => validarObra(aEnvio(f)), [f]);
  const info = INFO_CLASES[f.clase];

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOk("");
    if (!previa.obra) {
      setError(previa.error || "Revisa el formulario.");
      return;
    }
    setOcupado(true);
    const cuerpo = aEnvio(f);
    const r = editar
      ? await pedir<{ ok?: boolean; mensaje?: string }>(`/api/creadores/obras/${encodeURIComponent(editar)}`, { accion: "version", ...cuerpo, nota: f.nota })
      : await pedir<{ ok?: boolean; id?: string; mensaje?: string }>("/api/creadores/obras", cuerpo);
    setOcupado(false);
    if (!r.ok) {
      setError(r.data.error || r.data.mensaje || "No se pudo publicar.");
      return;
    }
    const id = editar || (r.data as { id?: string }).id;
    if (id) guardarEnTaller({ id, clase: f.clase, titulo: f.titulo, guardada: Date.now(), obra: cuerpo });
    if (!editar) {
      try {
        localStorage.removeItem(CLAVE_BORRADOR);
      } catch {
        /* */
      }
    }
    setOk(r.data.mensaje || "Hecho.");
    if (id) router.push(`/creadores/obra/${id}`);
  };

  if (!yo || !listo) return <div className="fj"><Cargando /></div>;

  return (
    <div className="fj">
      <header className="fj-heroe">
        <p className="fj-volanta">
          <Link href="/creadores" style={{ color: "inherit" }}>
            La Forja
          </Link>{" "}
          · {editar ? "Nueva versión" : "Publicar"}
        </p>
        <h1>{editar ? "Mejora tu obra" : `${info.verbo} algo nuevo`}</h1>
        <p>{editar ? "La versión anterior queda guardada en la historia de la obra. Explica qué cambias." : "Tu borrador se guarda solo en este aparato mientras escribes."}</p>
        <AvisoAlmacen yo={yo} />
      </header>

      {!yo.alias ? (
        <Acceso alEntrar={recargar} texto="Entra con tu cuenta para publicar: tu obra queda firmada con tu nombre." />
      ) : !yo.permisos.includes("publicar") ? (
        <p className="fj-aviso fj-aviso-rojo">
          <b>Tu cuenta está suspendida.</b> Puedes leer todo, pero no publicar. Si crees que es un error, la decisión y su motivo están en tu campana de avisos.
        </p>
      ) : (
        <form className="fj-form" onSubmit={enviar} noValidate>
          {!editar && (
            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="fj-volanta">¿Qué publicas?</legend>
              <div className="fj-clases">
                {CLASES.map((c) => (
                  <button type="button" key={c} className="fj-clase" aria-pressed={f.clase === c} style={{ ["--c" as string]: INFO_CLASES[c].color }} onClick={() => set("clase", c)}>
                    <em>{INFO_CLASES[c].verbo}</em>
                    <b>{INFO_CLASES[c].nombre}</b>
                  </button>
                ))}
              </div>
              <p className="fj-ayuda" style={{ marginTop: 8 }}>
                {info.ayuda}
              </p>
            </fieldset>
          )}

          <label>
            Título
            <input value={f.titulo} onChange={(e) => set("titulo", e.target.value)} maxLength={LIM.titulo} required placeholder="Un título claro" />
            <small className="fj-cuenta">
              {f.titulo.length}/{LIM.titulo}
            </small>
          </label>
          <label>
            Resumen (lo que se ve en la vitrina)
            <textarea value={f.resumen} onChange={(e) => set("resumen", e.target.value)} maxLength={LIM.resumen} rows={2} style={{ minHeight: 70 }} />
            <small className="fj-cuenta">
              {f.resumen.length}/{LIM.resumen}
            </small>
          </label>

          {f.clase === "mapa" && (
            <div className="fj-panel">
              <h3>Puntos del mapa ({f.puntos.length}/{LIM.puntos})</h3>
              {f.puntos.map((p, i) => (
                <div className="fj-fila" key={i}>
                  <input inputMode="decimal" aria-label={`Latitud del punto ${i + 1}`} placeholder="Lat" value={Number.isFinite(p.lat) ? p.lat : ""} onChange={(e) => set("puntos", f.puntos.map((x, k) => (k === i ? { ...x, lat: parseFloat(e.target.value) } : x)))} />
                  <input inputMode="decimal" aria-label={`Longitud del punto ${i + 1}`} placeholder="Lon" value={Number.isFinite(p.lon) ? p.lon : ""} onChange={(e) => set("puntos", f.puntos.map((x, k) => (k === i ? { ...x, lon: parseFloat(e.target.value) } : x)))} />
                  <input aria-label={`Etiqueta del punto ${i + 1}`} placeholder="Etiqueta" maxLength={LIM.etiqueta} value={p.etiqueta} onChange={(e) => set("puntos", f.puntos.map((x, k) => (k === i ? { ...x, etiqueta: e.target.value } : x)))} />
                  <button type="button" aria-label="Quitar punto" onClick={() => set("puntos", f.puntos.filter((_, k) => k !== i))} disabled={f.puntos.length <= 1}>
                    ✕
                  </button>
                </div>
              ))}
              <button type="button" className="fj-btn fj-btn-mini" onClick={() => set("puntos", [...f.puntos, { lat: 0, lon: 0, etiqueta: "" }])} disabled={f.puntos.length >= LIM.puntos}>
                + Punto
              </button>
              <MiniMapa puntos={f.puntos.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon) && Math.abs(p.lat) <= 90 && Math.abs(p.lon) <= 180)} />
            </div>
          )}

          {f.clase === "escenario" && (
            <>
              <label>
                Premisa («¿Y si…?»)
                <input value={f.premisa} onChange={(e) => set("premisa", e.target.value)} maxLength={300} placeholder="¿Y si…?" />
              </label>
              <label>
                Supuestos (uno por línea)
                <textarea value={f.supuestos} onChange={(e) => set("supuestos", e.target.value)} rows={3} />
              </label>
              <label>
                Qué vigilarías (uno por línea)
                <textarea value={f.vigilar} onChange={(e) => set("vigilar", e.target.value)} rows={3} />
                <small>Un escenario es una hipótesis para pensar, nunca una predicción.</small>
              </label>
            </>
          )}

          {f.clase === "investigacion" && (
            <>
              <label>
                La pregunta que investigas
                <input value={f.pregunta} onChange={(e) => set("pregunta", e.target.value)} maxLength={300} />
              </label>
              <label>
                Fuentes (una URL https por línea)
                <textarea value={f.fuentes} onChange={(e) => set("fuentes", e.target.value)} rows={3} placeholder="https://…" />
                <small>Obligatorio: al menos una fuente pública. Las direcciones privadas o locales se descartan.</small>
              </label>
            </>
          )}

          {f.clase === "simulacion" && (
            <div className="fj-panel">
              <h3>Variables ({f.variables.length}/{LIM.variables})</h3>
              {f.variables.map((v, i) => (
                <div className="fj-fila" key={i} style={{ gridTemplateColumns: "2fr 1fr 1fr auto" }}>
                  <input aria-label={`Nombre de la variable ${i + 1}`} placeholder="Nombre" maxLength={48} value={v.nombre} onChange={(e) => set("variables", f.variables.map((x, k) => (k === i ? { ...x, nombre: e.target.value } : x)))} />
                  <input inputMode="decimal" aria-label={`Valor de la variable ${i + 1}`} placeholder="Valor" value={Number.isFinite(v.valor) ? v.valor : ""} onChange={(e) => set("variables", f.variables.map((x, k) => (k === i ? { ...x, valor: parseFloat(e.target.value) } : x)))} />
                  <input aria-label={`Unidad de la variable ${i + 1}`} placeholder="Unidad" maxLength={16} value={v.unidad} onChange={(e) => set("variables", f.variables.map((x, k) => (k === i ? { ...x, unidad: e.target.value } : x)))} />
                  <button type="button" aria-label="Quitar variable" onClick={() => set("variables", f.variables.filter((_, k) => k !== i))} disabled={f.variables.length <= 2}>
                    ✕
                  </button>
                </div>
              ))}
              <button type="button" className="fj-btn fj-btn-mini" onClick={() => set("variables", [...f.variables, { nombre: "", valor: 0, unidad: "" }])} disabled={f.variables.length >= LIM.variables}>
                + Variable
              </button>
              <label>
                La regla que las une
                <textarea value={f.regla} onChange={(e) => set("regla", e.target.value)} rows={3} maxLength={600} />
              </label>
            </div>
          )}

          {f.clase === "proyecto" && (
            <div className="fj-panel">
              <label>
                Objetivo
                <input value={f.objetivo} onChange={(e) => set("objetivo", e.target.value)} maxLength={300} />
              </label>
              <h3>Hitos ({f.hitos.length}/{LIM.hitos})</h3>
              {f.hitos.map((h, i) => (
                <div className="fj-fila" key={i} style={{ gridTemplateColumns: "auto 1fr auto" }}>
                  <input type="checkbox" aria-label={`Hito ${i + 1} hecho`} checked={h.hecho} onChange={(e) => set("hitos", f.hitos.map((x, k) => (k === i ? { ...x, hecho: e.target.checked } : x)))} style={{ width: 22, minHeight: 22 }} />
                  <input aria-label={`Hito ${i + 1}`} placeholder="Hito" maxLength={140} value={h.texto} onChange={(e) => set("hitos", f.hitos.map((x, k) => (k === i ? { ...x, texto: e.target.value } : x)))} />
                  <button type="button" aria-label="Quitar hito" onClick={() => set("hitos", f.hitos.filter((_, k) => k !== i))} disabled={f.hitos.length <= 1}>
                    ✕
                  </button>
                </div>
              ))}
              <button type="button" className="fj-btn fj-btn-mini" onClick={() => set("hitos", [...f.hitos, { texto: "", hecho: false }])} disabled={f.hitos.length >= LIM.hitos}>
                + Hito
              </button>
            </div>
          )}

          <label>
            Texto (opcional)
            <textarea value={f.cuerpo} onChange={(e) => set("cuerpo", e.target.value)} maxLength={LIM.cuerpo} rows={8} />
            <small className="fj-cuenta">
              {f.cuerpo.length}/{LIM.cuerpo}
            </small>
          </label>
          <label>
            Salas u obras de VANGUARD relacionadas (una ruta por línea, p. ej. /escenarios o /cuartel?sala=warsim)
            <textarea value={f.enlaces} onChange={(e) => set("enlaces", e.target.value)} rows={2} style={{ minHeight: 60 }} />
          </label>
          <label>
            Etiquetas (separadas por comas, hasta 6)
            <input value={f.etiquetas} onChange={(e) => set("etiquetas", e.target.value)} maxLength={160} placeholder="caribe, energía, rutas" />
          </label>
          {editar && (
            <label>
              ¿Qué cambia en esta versión?
              <input value={f.nota} onChange={(e) => set("nota", e.target.value)} maxLength={LIM.nota} placeholder="Añado dos fuentes y corrijo una cifra" />
            </label>
          )}

          {!previa.obra && (f.titulo || f.resumen) && <p className="fj-ayuda">Falta: {previa.error}</p>}
          {error && <p className="fj-error" role="alert">{error}</p>}
          {ok && <p className="fj-ok" role="status">{ok}</p>}
          <div className="fj-acciones">
            <button className="fj-btn fj-btn-oro" disabled={ocupado}>
              {ocupado ? "Enviando…" : editar ? "Publicar versión" : "Publicar"}
            </button>
            <Link className="fj-btn" href={editar ? `/creadores/obra/${editar}` : "/creadores"}>
              Cancelar
            </Link>
            <span className="fj-ayuda">El agente moderador revisa cada envío. Si duda, una persona lo revisa antes de mostrarlo.</span>
          </div>
        </form>
      )}

      {!editar && taller.length > 0 && (
        <section className="fj-seccion" aria-labelledby="fj-taller">
          <div className="fj-seccion-cab">
            <h2 id="fj-taller">Tu taller</h2>
            <small>Copias guardadas en este aparato</small>
          </div>
          <div className="fj-ranking">
            {taller.map((c) => (
              <div key={c.id} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <Link href={`/creadores/obra/${c.id}`} style={{ flex: 1 }}>
                  <i>{INFO_CLASES[esClase(c.clase) ? c.clase : "mapa"].nombre.slice(0, 1)}</i>
                  <span>
                    <b>{c.titulo}</b>
                  </span>
                  <small>{new Date(c.guardada).toLocaleDateString("es")}</small>
                </Link>
                <button type="button" className="fj-btn fj-btn-mini" onClick={() => setF(desdeObra({ ...(c.obra as Parameters<typeof desdeObra>[0]), etiquetas: String((c.obra as { etiquetas?: string }).etiquetas ?? "").split(",").filter(Boolean) }))}>
                  Usar como borrador
                </button>
              </div>
            ))}
          </div>
          <p className="fj-ayuda">Si una obra desapareció porque el servidor se reinició, cárgala como borrador y vuelve a publicarla.</p>
        </section>
      )}
    </div>
  );
}

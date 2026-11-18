"use client";

// v406.1 · LA FORJA — la página de un creador: rango, fama, insignias, obras y colecciones.
import Link from "next/link";
import { useEffect, useState } from "react";
import { INFO_CLASES, esClase } from "@/lib/creadores/tipos";
import { NOMBRE_ROL, permisosDe, type Rol } from "@/lib/creadores/permisos";
import { useYo, pedir, TarjetaObra, AvisoAlmacen, Cargando, type ObraTarjeta } from "./comun";

type Perfil = {
  alias: string;
  rol: Rol;
  nombreRol: string;
  fama: number;
  rango: { nombre: string; siguiente: { nombre: string; faltan: number } | null };
  insignias: { id: string; nombre: string; detalle: string; color: string }[];
  obras: ObraTarjeta[];
  colecciones: { id: string; titulo: string; descripcion: string; publica: boolean; obras: number }[];
  cifras: { publicadas: number; valoraciones: number; estrellas: number; comentarios: number };
  estudios: { clase: string; n: number }[];
  propio: boolean;
};

const ACCION_TXT: Record<string, string> = {
  leer: "Leer todo lo publicado",
  publicar: "Publicar obras",
  versionar: "Publicar versiones de tus obras",
  retirar: "Retirar tus obras",
  comentar: "Comentar",
  valorar: "Valorar obras ajenas",
  reportar: "Reportar",
  coleccionar: "Crear colecciones",
  moderar: "Moderar obras y comentarios",
  suspender: "Suspender cuentas",
  nombrar: "Nombrar verificados y moderadores",
};

export function PerfilCreador({ alias }: { alias: string }) {
  const { yo } = useYo();
  const [p, setP] = useState<Perfil | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let vivo = true;
    pedir<Perfil>(`/api/creadores/perfil/${encodeURIComponent(alias)}`).then((r) => {
      if (!vivo) return;
      if (r.ok) setP(r.data);
      else setError(r.data.error || "No se pudo abrir el perfil.");
    });
    return () => {
      vivo = false;
    };
  }, [alias]);

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
  if (!p) return <div className="fj"><Cargando /></div>;
  const siguiente = p.rango.siguiente;
  const progreso = siguiente ? Math.min(100, Math.round((100 * p.fama) / (p.fama + siguiente.faltan))) : 100;

  return (
    <div className="fj">
      <header className="fj-perfil-cab">
        <p className="fj-volanta">
          <Link href="/creadores" style={{ color: "inherit" }}>
            La Forja
          </Link>{" "}
          · Creador
        </p>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div className="fj-avatar" aria-hidden>
            {p.alias.slice(0, 1)}
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            <h1>{p.alias}</h1>
            <span className="fj-meta">
              <span>{p.nombreRol}</span>
              <span>
                Rango: <b style={{ color: "var(--oro)" }}>{p.rango.nombre}</b>
              </span>
              <span title="Fama en La Forja: obras×5 + estrellas×2 + destacadas×15 + versiones extra">Fama Forja {p.fama}</span>
            </span>
          </div>
        </div>
        {siguiente && (
          <div style={{ display: "grid", gap: 6, maxWidth: 420 }}>
            <div className="fj-barra">
              <i style={{ width: `${progreso}%` }} />
            </div>
            <small className="fj-ayuda">
              Le faltan {siguiente.faltan} de fama para «{siguiente.nombre}».
            </small>
          </div>
        )}
        {p.propio && (
          <div className="fj-acciones">
            <Link className="fj-btn fj-btn-oro" href="/creadores/publicar">
              Publicar una obra
            </Link>
          </div>
        )}
        <AvisoAlmacen yo={yo} />
      </header>

      <div className="fj-cifras">
        <div>
          <b>{p.cifras.publicadas}</b>
          <span>obras publicadas</span>
        </div>
        <div>
          <b>{p.cifras.valoraciones}</b>
          <span>valoraciones recibidas</span>
        </div>
        <div>
          <b>{p.cifras.valoraciones ? (p.cifras.estrellas / p.cifras.valoraciones).toFixed(1) : "—"}</b>
          <span>media de estrellas</span>
        </div>
        <div>
          <b>{p.cifras.comentarios}</b>
          <span>comentarios</span>
        </div>
      </div>

      <section className="fj-seccion" aria-labelledby="fj-ins">
        <div className="fj-seccion-cab">
          <h2 id="fj-ins">Reconocimientos</h2>
          <small>{p.insignias.length} insignias</small>
        </div>
        {p.insignias.length ? (
          <div className="fj-insignias">
            {p.insignias.map((i) => (
              <div key={i.id} className="fj-insignia" style={{ ["--c" as string]: i.color }}>
                <b>{i.nombre}</b>
                <span>{i.detalle}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="fj-ayuda">La primera insignia llega con la primera obra publicada.</p>
        )}
        <p className="fj-ayuda">Fama en La Forja = obras×5 publicadas + estrellas recibidas×2 + destacadas×15 + versiones extra. Cada insignia sale de algo que puedes comprobar en esta página. (El Paseo de la Fama de la vitrina mide otra cosa: toda tu actividad en la comunidad, con su fórmula de siempre.)</p>
      </section>

      <section className="fj-seccion" aria-labelledby="fj-po">
        <div className="fj-seccion-cab">
          <h2 id="fj-po">Obras</h2>
          <small>{p.obras.length}</small>
        </div>
        {p.obras.length ? (
          <div className="fj-rejilla">
            {p.obras.map((o) => (
              <TarjetaObra key={o.id} o={o} />
            ))}
          </div>
        ) : (
          <p className="fj-vacio">Aún no hay obras publicadas en La Forja.</p>
        )}
        {!!p.estudios.length && (
          <p className="fj-ayuda" style={{ marginTop: 10 }}>
            También publicó en los estudios del cuartel: {p.estudios.map((e) => `${e.n} ${esClase(e.clase) ? INFO_CLASES[e.clase].plural.toLowerCase() : e.clase}`).join(", ")}.{" "}
            <Link href="/cuartel?sala=obras" style={{ color: "var(--oro)" }}>
              Ver el Muro de Obras
            </Link>
          </p>
        )}
      </section>

      <section className="fj-seccion" aria-labelledby="fj-pc">
        <div className="fj-seccion-cab">
          <h2 id="fj-pc">Colecciones</h2>
        </div>
        {p.colecciones.length ? (
          <div className="fj-ranking">
            {p.colecciones.map((c) => (
              <Link key={c.id} href={`/creadores/coleccion/${c.id}`}>
                <i>▤</i>
                <span>
                  <b>{c.titulo}</b> {!c.publica && <small>(privada)</small>}
                  <br />
                  <small>{c.descripcion}</small>
                </span>
                <small>{c.obras}</small>
              </Link>
            ))}
          </div>
        ) : (
          <p className="fj-ayuda">Sin colecciones todavía.</p>
        )}
      </section>

      {p.propio && yo && (
        <section className="fj-seccion" aria-labelledby="fj-perm">
          <div className="fj-seccion-cab">
            <h2 id="fj-perm">Tus permisos</h2>
            <small>{NOMBRE_ROL[yo.rol]}</small>
          </div>
          <ul className="fj-normas">
            {permisosDe(yo.rol, yo.moderacionActiva).map((a) => (
              <li key={a}>{ACCION_TXT[a] ?? a}</li>
            ))}
          </ul>
          {(yo.rol === "moderador" || yo.rol === "dueno") && !yo.moderacionActiva && (
            <p className="fj-aviso fj-aviso-rojo" style={{ marginTop: 10 }}>
              <b>Moderación cerrada por seguridad.</b> La casa usa todavía la clave de sesión de reserva, que es pública en el repositorio. Define AUTH_SECRET en Vercel para abrir la mesa.
            </p>
          )}
        </section>
      )}
    </div>
  );
}

"use client";

// v406.1 · LA FORJA — una colección: obras reunidas por un creador.
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { pedir, TarjetaObra, Cargando, type ObraTarjeta } from "./comun";

type Col = { coleccion: { id: string; dueno: string; titulo: string; descripcion: string; publica: boolean; actualizada: number }; obras: ObraTarjeta[]; ocultas: number; esDueno: boolean };

export function Coleccion({ id }: { id: string }) {
  const [c, setC] = useState<Col | null>(null);
  const [error, setError] = useState("");
  const [editando, setEditando] = useState(false);
  const [t, setT] = useState("");
  const [desc, setDesc] = useState("");
  const [pub, setPub] = useState(true);
  const [aviso, setAviso] = useState("");

  const cargar = useCallback(async () => {
    const r = await pedir<Col>(`/api/creadores/colecciones?id=${encodeURIComponent(id)}`);
    if (r.ok) {
      setC(r.data);
      setT(r.data.coleccion.titulo);
      setDesc(r.data.coleccion.descripcion);
      setPub(r.data.coleccion.publica);
    } else setError(r.data.error || "No se pudo abrir la colección.");
  }, [id]);
  useEffect(() => {
    let vivo = true;
    pedir<Col>(`/api/creadores/colecciones?id=${encodeURIComponent(id)}`).then((r) => {
      if (!vivo) return;
      if (r.ok) {
        setC(r.data);
        setT(r.data.coleccion.titulo);
        setDesc(r.data.coleccion.descripcion);
        setPub(r.data.coleccion.publica);
      } else setError(r.data.error || "No se pudo abrir la colección.");
    });
    return () => {
      vivo = false;
    };
  }, [id]);

  const enviar = async (cuerpo: Record<string, unknown>) => {
    const r = await pedir<{ mensaje?: string }>("/api/creadores/colecciones", { id, ...cuerpo });
    setAviso(r.data.mensaje || r.data.error || "");
    return r.ok;
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
  if (!c) return <div className="fj"><Cargando /></div>;

  return (
    <div className="fj">
      <header className="fj-heroe">
        <p className="fj-volanta">
          <Link href="/creadores" style={{ color: "inherit" }}>
            La Forja
          </Link>{" "}
          · Colección {c.coleccion.publica ? "pública" : "privada"}
        </p>
        <h1 style={{ fontSize: "clamp(28px,6vw,52px)" }}>{c.coleccion.titulo}</h1>
        {c.coleccion.descripcion && <p>{c.coleccion.descripcion}</p>}
        <div className="fj-meta">
          <span>
            reunida por <Link href={`/creadores/perfil/${c.coleccion.dueno}`}>{c.coleccion.dueno}</Link>
          </span>
          <span>{c.obras.length} obras</span>
          {c.ocultas > 0 && <span>{c.ocultas} ya no están visibles</span>}
        </div>
        {c.esDueno && (
          <div className="fj-acciones">
            <button className="fj-btn fj-btn-mini" onClick={() => setEditando((x) => !x)}>
              {editando ? "Cerrar edición" : "Editar"}
            </button>
            <button
              className="fj-btn fj-btn-mini fj-btn-rojo"
              onClick={async () => {
                if (confirm("¿Borrar la colección? Las obras no se tocan.") && (await enviar({ accion: "borrar" }))) location.href = `/creadores/perfil/${c.coleccion.dueno}`;
              }}
            >
              Borrar colección
            </button>
          </div>
        )}
        {editando && (
          <form
            className="fj-form"
            onSubmit={async (e) => {
              e.preventDefault();
              if (await enviar({ accion: "editar", titulo: t, descripcion: desc, publica: pub })) {
                setEditando(false);
                await cargar();
              }
            }}
          >
            <label>
              Nombre
              <input value={t} onChange={(e) => setT(e.target.value)} maxLength={70} />
            </label>
            <label>
              Descripción
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={280} rows={2} style={{ minHeight: 60 }} />
            </label>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="checkbox" checked={pub} onChange={(e) => setPub(e.target.checked)} style={{ width: 20, minHeight: 20 }} /> Pública
            </label>
            <button className="fj-btn fj-btn-oro fj-btn-mini" style={{ justifySelf: "start" }}>
              Guardar
            </button>
          </form>
        )}
        {aviso && <p className="fj-aviso">{aviso}</p>}
      </header>
      {c.obras.length ? (
        <div className="fj-rejilla">
          {c.obras.map((o) => (
            <div key={o.id} style={{ display: "grid", gap: 6 }}>
              <TarjetaObra o={o} />
              {c.esDueno && (
                <button
                  className="fj-btn fj-btn-mini"
                  onClick={async () => {
                    if (await enviar({ accion: "quitar", itemId: o.id })) await cargar();
                  }}
                >
                  Quitar
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="fj-vacio">Esta colección está vacía.</p>
      )}
    </div>
  );
}

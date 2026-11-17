"use client";

// v406.1 · LA FORJA — la mesa de moderación: cola, reportes, comentarios,
// roles y bitácora. Cada decisión pide motivo; nada se borra de verdad.
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { NOMBRE_ROL, type Rol } from "@/lib/creadores/permisos";
import { MOTIVOS_REPORTE, TEXTO_ESTADO, type Estado } from "@/lib/creadores/moderacion";
import { useYo, pedir, Acceso, Chip, Cargando, haceCuanto } from "./comun";

type Mesa = {
  yo: { alias: string; rol: Rol; nombra: boolean };
  cola: { id: string; clase: string; autor: string; titulo: string; resumen: string; estado: string; creada: number; motivoModeracion?: string }[];
  reportes: { objetivo: string; itemId: string; titulo: string; estado: string; n: number; motivos: string[]; ultima: number }[];
  comentarios: { id: string; itemId: string; autor: string; texto: string; motivo: string; creada: number }[];
  roles: { alias: string; rol: string; nombreRol: string; por: string; motivo: string; actualizada: number }[];
  bitacora: { id: string; actor: string; accion: string; objetivo: string; motivo: string; antes: string; despues: string; creada: number }[];
  asignables: Rol[];
};

const motivoTxt = (id: string) => MOTIVOS_REPORTE.find((m) => m.id === id)?.texto ?? id;

function Decidir({ botones, alDecidir }: { botones: { d: string; txt: string; rojo?: boolean }[]; alDecidir: (d: string, motivo: string) => Promise<void> }) {
  const [m, setM] = useState("");
  return (
    <div className="fj-mod-acciones">
      <input value={m} onChange={(e) => setM(e.target.value)} placeholder="Motivo (obligatorio, lo verá el autor)" maxLength={200} aria-label="Motivo de la decisión" />
      {botones.map((b) => (
        <button
          key={b.d}
          className={`fj-btn fj-btn-mini${b.rojo ? " fj-btn-rojo" : ""}`}
          disabled={m.trim().length < 4}
          onClick={async () => {
            await alDecidir(b.d, m);
            setM("");
          }}
        >
          {b.txt}
        </button>
      ))}
    </div>
  );
}

export function Moderacion() {
  const { yo, recargar } = useYo();
  const [mesa, setMesa] = useState<Mesa | null>(null);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [rolAlias, setRolAlias] = useState("");
  const [rolNuevo, setRolNuevo] = useState<Rol>("suspendido");
  const [rolMotivo, setRolMotivo] = useState("");

  const cargar = useCallback(async () => {
    const r = await pedir<Mesa>("/api/creadores/moderacion");
    if (r.ok) {
      setMesa(r.data);
      setError("");
    } else setError(r.data.error || "No se pudo abrir la mesa.");
  }, []);
  useEffect(() => {
    if (!yo) return;
    let vivo = true;
    pedir<Mesa>("/api/creadores/moderacion").then((r) => {
      if (!vivo) return;
      if (r.ok) setMesa(r.data);
      else setError(r.data.error || "No se pudo abrir la mesa.");
    });
    return () => {
      vivo = false;
    };
  }, [yo]);

  const enviar = async (cuerpo: Record<string, unknown>) => {
    const r = await pedir<{ mensaje?: string }>("/api/creadores/moderacion", cuerpo);
    setAviso(r.data.mensaje || r.data.error || "");
    if (r.ok) await cargar();
  };

  if (!yo) return <div className="fj"><Cargando /></div>;

  return (
    <div className="fj">
      <header className="fj-heroe">
        <p className="fj-volanta">
          <Link href="/creadores" style={{ color: "inherit" }}>
            La Forja
          </Link>{" "}
          · Moderación
        </p>
        <h1 style={{ fontSize: "clamp(28px,6vw,52px)" }}>La mesa de moderación</h1>
        <p>Cada decisión lleva motivo, avisa al autor y queda en la bitácora. Ocultar y rechazar son reversibles.</p>
        {aviso && (
          <p className="fj-aviso" role="status">
            {aviso}
          </p>
        )}
      </header>

      {!yo.alias ? (
        <Acceso alEntrar={recargar} texto="Entra con tu cuenta de moderación" />
      ) : error ? (
        <p className="fj-aviso fj-aviso-rojo">
          <b>Sin acceso.</b> {error}
        </p>
      ) : !mesa ? (
        <Cargando />
      ) : (
        <>
          <section className="fj-seccion" aria-labelledby="fj-mc">
            <div className="fj-seccion-cab">
              <h2 id="fj-mc">Cola de revisión</h2>
              <small>{mesa.cola.length}</small>
            </div>
            {mesa.cola.length ? (
              <div style={{ display: "grid", gap: 10 }}>
                {mesa.cola.map((o) => (
                  <div key={o.id} className="fj-mod-item">
                    <div className="fj-tarjeta-cab">
                      <Chip clase={o.clase} />
                      <span className="fj-estado">{TEXTO_ESTADO[o.estado as Estado] ?? o.estado}</span>
                      <span className="fj-ayuda">
                        por {o.autor} · {haceCuanto(o.creada)}
                      </span>
                    </div>
                    <h3>
                      <Link href={`/creadores/obra/${o.id}`} style={{ color: "var(--tx)" }}>
                        {o.titulo}
                      </Link>
                    </h3>
                    <p>{o.resumen}</p>
                    {o.motivoModeracion && <p>Agente: {o.motivoModeracion}</p>}
                    <Decidir
                      botones={
                        o.estado === "PENDIENTE"
                          ? [
                              { d: "aprobar", txt: "Aprobar" },
                              { d: "ocultar", txt: "Ocultar", rojo: true },
                              { d: "eliminar", txt: "Rechazar", rojo: true },
                            ]
                          : [
                              { d: "restaurar", txt: "Restaurar" },
                              { d: "eliminar", txt: "Rechazar", rojo: true },
                            ]
                      }
                      alDecidir={(d, motivo) => enviar({ accion: "decidir", id: o.id, decision: d, motivo })}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="fj-ayuda">La cola está vacía.</p>
            )}
          </section>

          <section className="fj-seccion" aria-labelledby="fj-mr">
            <div className="fj-seccion-cab">
              <h2 id="fj-mr">Reportes abiertos</h2>
              <small>{mesa.reportes.length}</small>
            </div>
            {mesa.reportes.length ? (
              <div style={{ display: "grid", gap: 10 }}>
                {mesa.reportes.map((r) => (
                  <div key={r.objetivo} className="fj-mod-item">
                    <h3>
                      {r.objetivo.startsWith("comentario:") ? "Comentario en " : ""}
                      <Link href={`/creadores/obra/${r.itemId}`} style={{ color: "var(--tx)" }}>
                        {r.titulo}
                      </Link>
                    </h3>
                    <p>
                      {r.n} {r.n === 1 ? "cuenta" : "cuentas"} · {r.motivos.map(motivoTxt).join(", ")} · {haceCuanto(r.ultima)}
                    </p>
                    <Decidir
                      botones={[
                        ...(r.objetivo.startsWith("obra:") && r.estado === "APROBADO" ? [{ d: "ocultar", txt: "Ocultar la obra", rojo: true }] : []),
                        { d: "desestimar", txt: "Desestimar" },
                      ]}
                      alDecidir={(d, motivo) =>
                        d === "desestimar" ? enviar({ accion: "resolver-reporte", objetivo: r.objetivo, motivo }) : enviar({ accion: "decidir", id: r.itemId, decision: d, motivo })
                      }
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="fj-ayuda">Sin reportes abiertos.</p>
            )}
          </section>

          <section className="fj-seccion" aria-labelledby="fj-mco">
            <div className="fj-seccion-cab">
              <h2 id="fj-mco">Comentarios en revisión</h2>
              <small>{mesa.comentarios.length}</small>
            </div>
            {mesa.comentarios.length ? (
              <div style={{ display: "grid", gap: 10 }}>
                {mesa.comentarios.map((c) => (
                  <div key={c.id} className="fj-mod-item">
                    <p>
                      <b>{c.autor}</b> en{" "}
                      <Link href={`/creadores/obra/${c.itemId}`} style={{ color: "var(--oro)" }}>
                        la obra
                      </Link>{" "}
                      · {haceCuanto(c.creada)}
                    </p>
                    <p style={{ color: "var(--tx)" }}>{c.texto}</p>
                    {c.motivo && <p>Agente: {c.motivo}</p>}
                    <Decidir
                      botones={[
                        { d: "aprobar", txt: "Publicar" },
                        { d: "eliminar", txt: "Retirar", rojo: true },
                      ]}
                      alDecidir={(d, motivo) => enviar({ accion: "comentario", id: c.id, decision: d, motivo })}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="fj-ayuda">Ningún comentario espera revisión.</p>
            )}
          </section>

          <section className="fj-seccion" aria-labelledby="fj-mroles">
            <div className="fj-seccion-cab">
              <h2 id="fj-mroles">Cuentas y roles</h2>
              <small>{mesa.yo.nombra ? "Dueño: nombra y suspende" : "Moderador: suspende y levanta suspensiones"}</small>
            </div>
            <form
              className="fj-mod-acciones"
              onSubmit={async (e) => {
                e.preventDefault();
                await enviar({ accion: "rol", alias: rolAlias, rol: rolNuevo, motivo: rolMotivo });
                setRolMotivo("");
              }}
            >
              <input value={rolAlias} onChange={(e) => setRolAlias(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "").slice(0, 16))} placeholder="ALIAS" aria-label="Alias de la cuenta" style={{ flex: "0 1 160px" }} />
              <select value={rolNuevo} onChange={(e) => setRolNuevo(e.target.value as Rol)} aria-label="Rol nuevo" className="fj-pildora" style={{ minHeight: 36 }}>
                {mesa.asignables
                  .filter((r) => mesa.yo.nombra || r === "suspendido" || r === "creador")
                  .map((r) => (
                    <option key={r} value={r}>
                      {NOMBRE_ROL[r]}
                    </option>
                  ))}
              </select>
              <input value={rolMotivo} onChange={(e) => setRolMotivo(e.target.value)} placeholder="Motivo (obligatorio)" maxLength={200} aria-label="Motivo del cambio de rol" />
              <button className="fj-btn fj-btn-mini" disabled={rolAlias.length < 3 || rolMotivo.trim().length < 4}>
                Aplicar
              </button>
            </form>
            {!!mesa.roles.length && (
              <div className="fj-bitacora" style={{ marginTop: 10 }}>
                {mesa.roles.map((r) => (
                  <div key={r.alias}>
                    <b>{r.alias}</b> — {r.nombreRol} · por {r.por} · «{r.motivo}» · {haceCuanto(r.actualizada)}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="fj-seccion" aria-labelledby="fj-mb">
            <div className="fj-seccion-cab">
              <h2 id="fj-mb">Bitácora</h2>
              <small>Las 80 últimas decisiones</small>
            </div>
            {mesa.bitacora.length ? (
              <div className="fj-bitacora">
                {mesa.bitacora.map((b) => (
                  <div key={b.id}>
                    <b>{b.actor}</b> · {b.accion} · {b.objetivo}
                    {b.antes || b.despues ? ` · ${b.antes} → ${b.despues}` : ""} · «{b.motivo}» · {haceCuanto(b.creada)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="fj-ayuda">Aún no hay decisiones registradas.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}

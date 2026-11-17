"use client";

// v406.1 · LA FORJA — la vitrina: qué se puede crear, lo publicado, las colecciones,
// el Paseo de la Fama (v104) y las herramientas de creación que ya vivían en el cuartel.
import Link from "next/link";
import { useEffect, useState } from "react";
import { CLASES, INFO_CLASES, type ClaseObra } from "@/lib/creadores/tipos";
import { NOMBRE_ROL } from "@/lib/creadores/permisos";
import { useYo, pedir, TarjetaObra, AvisoAlmacen, Cargando, type ObraTarjeta } from "./comun";

type Lista = { obras: ObraTarjeta[]; total: number; porClase: Record<string, number> };
type Col = { id: string; dueno: string; titulo: string; descripcion: string; obras: number };
type Fama = { author: string; obras: number; likes: number; plays: number; fama: number };

/** las herramientas de creación que la casa ya tenía (constelación CREADORES del cuartel) */
const HERRAMIENTAS = [
  { href: "/cuartel?sala=mapascrea", nombre: "Constructor de Mapas", txt: "Dibuja mapas de composición libre." },
  { href: "/cuartel?sala=laboratorio", nombre: "Laboratorio del ¿Y si…?", txt: "Perturba crisis del Espejo y compártelas." },
  { href: "/cuartel?sala=escenarios", nombre: "Galería del Destino", txt: "Los escenarios ¿Y si…? de la comunidad." },
  { href: "/cuartel?sala=studios", nombre: "Estudios Creadores", txt: "Noticias, banderas, mapas y música." },
  { href: "/cuartel?sala=creador", nombre: "Estudio Comunitario", txt: "Personajes, armas, encuestas y vídeos." },
  { href: "/cuartel?sala=obras", nombre: "Muro de Obras", txt: "La vitrina del cuartel: juega, simula y remezcla." },
  { href: "/escenarios", nombre: "El Estratega", txt: "Simulación con supuestos y reglas declaradas." },
  { href: "/mapas", nombre: "Centro de mapas", txt: "Ocho capas del planeta para documentar tu mapa." },
];

export function Vitrina() {
  const { yo } = useYo();
  const [clase, setClase] = useState<ClaseObra | "">("");
  const [orden, setOrden] = useState<"recientes" | "valoradas" | "destacadas">("recientes");
  const [q, setQ] = useState("");
  const [lista, setLista] = useState<Lista | null>(null);
  const [cols, setCols] = useState<Col[] | null>(null);
  const [fama, setFama] = useState<Fama[] | null>(null);

  useEffect(() => {
    let vivo = true;
    const t = window.setTimeout(async () => {
      const p = new URLSearchParams({ orden, limite: "36" });
      if (clase) p.set("clase", clase);
      if (q.trim()) p.set("q", q.trim());
      const r = await pedir<Lista>(`/api/creadores/obras?${p}`);
      if (vivo) setLista(r.data.obras ? r.data : { obras: [], total: 0, porClase: {} });
    }, q ? 300 : 0);
    return () => {
      vivo = false;
      window.clearTimeout(t);
    };
  }, [clase, orden, q]);

  useEffect(() => {
    pedir<{ colecciones: Col[] }>("/api/creadores/colecciones").then((r) => setCols(r.data.colecciones ?? []));
    pedir<{ creadores: Fama[] }>("/api/creadores/fama?limit=10").then((r) => setFama(r.data.creadores ?? []));
  }, []);

  const puedePublicar = !!yo?.permisos.includes("publicar");

  return (
    <div className="fj">
      <header className="fj-heroe">
        <p className="fj-volanta">La Forja · Ecosistema de creadores</p>
        <h1>Lo que el mundo necesita, lo crea su gente.</h1>
        <p>
          Publica mapas, escenarios, investigaciones, simulaciones y proyectos con tu nombre. Cada obra tiene versiones, comentarios y valoraciones; la comunidad la colecciona y la moderación la cuida.
        </p>
        <div className="fj-acciones">
          <Link className="fj-btn fj-btn-oro" href="/creadores/publicar">
            Publicar una obra
          </Link>
          {yo?.alias && (
            <Link className="fj-btn" href={`/creadores/perfil/${yo.alias}`}>
              Mi página de creador
            </Link>
          )}
          {yo?.permisos.includes("moderar") && (
            <Link className="fj-btn fj-btn-rojo" href="/creadores/moderacion">
              Mesa de moderación
            </Link>
          )}
          {yo && <span className="fj-ayuda">{yo.alias ? `Entraste como ${yo.alias} · ${NOMBRE_ROL[yo.rol]}` : "Estás de visita: puedes leer todo lo publicado."}</span>}
        </div>
        <AvisoAlmacen yo={yo} />
      </header>

      <section className="fj-seccion" aria-labelledby="fj-crea">
        <div className="fj-seccion-cab">
          <h2 id="fj-crea">Qué puedes crear</h2>
          <small>Cinco formas de aportar</small>
        </div>
        <div className="fj-clases">
          {CLASES.map((c) => {
            const i = INFO_CLASES[c];
            return (
              <Link key={c} className="fj-clase" style={{ ["--c" as string]: i.color }} href={puedePublicar || !yo?.alias ? `/creadores/publicar?clase=${c}` : "#"}>
                <em>{i.verbo}</em>
                <b>{i.nombre}</b>
                <span>{i.ayuda}</span>
                <em>{lista?.porClase?.[c] ?? 0} publicadas</em>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="fj-dos">
        <section className="fj-seccion" aria-labelledby="fj-obras">
          <div className="fj-seccion-cab">
            <h2 id="fj-obras">La vitrina</h2>
            <small>{lista ? `${lista.total} obras` : ""}</small>
          </div>
          <div className="fj-filtros">
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por título, etiqueta o creador" aria-label="Buscar obras" />
            {(["recientes", "valoradas", "destacadas"] as const).map((o) => (
              <button key={o} className="fj-pildora" aria-pressed={orden === o} onClick={() => setOrden(o)}>
                {o === "recientes" ? "Recientes" : o === "valoradas" ? "Mejor valoradas" : "Destacadas"}
              </button>
            ))}
          </div>
          <div className="fj-filtros" role="group" aria-label="Filtrar por clase">
            <button className="fj-pildora" aria-pressed={clase === ""} onClick={() => setClase("")}>
              Todas
            </button>
            {CLASES.map((c) => (
              <button key={c} className="fj-pildora" aria-pressed={clase === c} onClick={() => setClase(c)}>
                {INFO_CLASES[c].plural}
              </button>
            ))}
          </div>
          {!lista ? (
            <Cargando />
          ) : lista.obras.length ? (
            <div className="fj-rejilla">
              {lista.obras.map((o) => (
                <TarjetaObra key={o.id} o={o} />
              ))}
            </div>
          ) : (
            <div className="fj-vacio">
              {q || clase || orden !== "recientes" ? "Nada coincide con ese filtro todavía." : "La vitrina está esperando su primera obra."}
              <br />
              <Link className="fj-btn fj-btn-oro" href="/creadores/publicar" style={{ marginTop: 12 }}>
                Sé el primero en publicar
              </Link>
            </div>
          )}
        </section>

        <aside>
          <section className="fj-seccion" aria-labelledby="fj-fama">
            <div className="fj-seccion-cab">
              <h2 id="fj-fama">Paseo de la Fama</h2>
              <small>Toda la comunidad</small>
            </div>
            {!fama ? (
              <Cargando />
            ) : fama.length ? (
              <div className="fj-ranking">
                {fama.map((c, i) => (
                  <Link key={c.author} href={`/creadores/perfil/${encodeURIComponent(c.author)}`}>
                    <i>{i + 1}</i>
                    <span>
                      <b>{c.author}</b>
                      <br />
                      <small>
                        {c.obras} obras · {c.likes} me gusta
                      </small>
                    </span>
                    <small>{c.fama}</small>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="fj-ayuda">Aún no hay creadores en el paseo.</p>
            )}
            <p className="fj-ayuda">Fama = me gusta×3 + jugadas×2 + obras×5 (la fórmula de siempre del Paseo).</p>
          </section>

          <section className="fj-seccion" aria-labelledby="fj-cols">
            <div className="fj-seccion-cab">
              <h2 id="fj-cols">Colecciones</h2>
            </div>
            {!cols ? (
              <Cargando />
            ) : cols.length ? (
              <div className="fj-ranking">
                {cols.map((c) => (
                  <Link key={c.id} href={`/creadores/coleccion/${c.id}`}>
                    <i>▤</i>
                    <span>
                      <b>{c.titulo}</b>
                      <br />
                      <small>de {c.dueno}</small>
                    </span>
                    <small>{c.obras}</small>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="fj-ayuda">Abre cualquier obra y pulsa «Añadir a colección» para empezar la tuya.</p>
            )}
          </section>

          <section className="fj-seccion" aria-labelledby="fj-normas">
            <div className="fj-seccion-cab">
              <h2 id="fj-normas">Normas</h2>
            </div>
            <ul className="fj-normas">
              <li>Firma con tu cuenta: cada obra, comentario y voto lleva tu nombre.</li>
              <li>Los datos llevan fuente. Las investigaciones sin fuente no se publican.</li>
              <li>Un escenario es una hipótesis, nunca una predicción.</li>
              <li>Sin odio, acoso, spam ni copias. El agente moderador revisa cada envío.</li>
              <li>Tres reportes de cuentas distintas mandan una obra a revisión humana.</li>
              <li>Toda decisión de la moderación lleva motivo y queda en la bitácora.</li>
            </ul>
          </section>
        </aside>
      </div>

      <section className="fj-seccion" aria-labelledby="fj-herr">
        <div className="fj-seccion-cab">
          <h2 id="fj-herr">Herramientas de creación de la casa</h2>
          <small>Ya existían: aquí se juntan</small>
        </div>
        <div className="fj-herr">
          {HERRAMIENTAS.map((h) => (
            <Link key={h.href} href={h.href}>
              <b>{h.nombre}</b>
              <span>{h.txt}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

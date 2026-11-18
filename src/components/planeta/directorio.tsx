"use client";

// ═══════════════════════════════════════════════════════════════════
// v406.5 · EL DIRECTORIO (cliente)
//   · búsqueda instantánea por palabras (todas deben aparecer, sin tildes);
//   · temas inteligentes (un destino puede estar en varios);
//   · ★ favoritos propios del directorio (vx406.5-directorio-favs) — no se
//     mezclan con los favoritos del riel (vg171-favoritos), que guardan salas;
//   · recientes: el rastro de la Travesía (vg-rastro-v1), solo lectura;
//   · «porque visitaste…»: recomendaciones por temas compartidos con lo
//     último que viste, sin repetir lo ya visto;
//   · cualquier destino se guarda en tu espacio (almacén vx405.11-espacio).
// ═══════════════════════════════════════════════════════════════════
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { DestinoCliente } from "@/lib/planeta/directorio";
import { haceCuanto, leerRastro, type Paso } from "@/lib/travesia/rastro";
import { GuardarPieza } from "./guardar";

const CLAVE_FAVS = "vx406.5-directorio-favs";

type TemaC = { id: string; nombre: string; pregunta: string; color: string };
type ColC = { clave: string; titulo: string; pregunta: string; paradas: number; minutos: number };

function norm(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function leerFavs(): string[] {
  try {
    const x = JSON.parse(window.localStorage.getItem(CLAVE_FAVS) ?? "[]");
    return Array.isArray(x) ? x.filter((k): k is string => typeof k === "string").slice(0, 60) : [];
  } catch {
    return [];
  }
}

function guardarFavs(l: string[]) {
  try {
    window.localStorage.setItem(CLAVE_FAVS, JSON.stringify(l));
  } catch {
    /* almacenamiento lleno o bloqueado: los favoritos duran la sesión */
  }
}

export function Directorio({ destinos, temas, colecciones }: { destinos: DestinoCliente[]; temas: TemaC[]; colecciones: ColC[] }) {
  const [q, setQ] = useState("");
  const [tema, setTema] = useState<string | null>(null);
  const [favs, setFavs] = useState<string[]>([]);
  const [rastro, setRastro] = useState<Paso[]>([]);
  const [montado, setMontado] = useState(false);

  // lo personal vive en este navegador: se lee al montar (mismo patrón que la Travesía)
  useEffect(() => {
    const cargar = () => {
      setFavs(leerFavs());
      setRastro(leerRastro());
      setMontado(true);
      try {
        const p = new URLSearchParams(window.location.search);
        const t = p.get("tema");
        if (t && temas.some((x) => x.id === t)) setTema(t);
        const qq = p.get("q");
        if (qq) setQ(qq.slice(0, 60));
      } catch {
        /* sin URL legible */
      }
    };
    cargar();
  }, [temas]);

  const porRuta = useMemo(() => new Map(destinos.map((d) => [d.r, d])), [destinos]);
  const temaPorId = useMemo(() => new Map(temas.map((t) => [t.id, t])), [temas]);

  function alternarFav(r: string) {
    setFavs((l) => {
      const n = l.includes(r) ? l.filter((x) => x !== r) : [...l, r];
      guardarFavs(n);
      return n;
    });
  }

  const lista = useMemo(() => {
    const palabras = norm(q).split(/\s+/).filter((w) => w.length >= 2);
    return destinos
      .filter((d) => (tema ? d.t.includes(tema) : true))
      .filter((d) => palabras.every((w) => d.b.includes(w)))
      .map((d) => {
        const n = norm(d.n);
        const puntos = palabras.reduce((s, w) => s + (n.includes(w) ? 3 : 0) + (norm(d.d).includes(w) ? 1 : 0), 0);
        return { d, puntos };
      })
      .sort((a, b) => b.puntos - a.puntos || a.d.s - b.d.s || a.d.n.localeCompare(b.d.n, "es"))
      .map((x) => x.d);
  }, [destinos, q, tema]);

  // recientes: rutas del rastro que son destinos del directorio (sin repetir)
  const recientes = useMemo(() => {
    const vistos = new Set<string>();
    const out: { d: DestinoCliente; paso: Paso }[] = [];
    for (const p of [...rastro].sort((a, b) => b.t - a.t)) {
      // el cuartel apunta sus salas como /cuartel?sala=<clave>: su puerta es /sala/<clave>
      const sala = p.r === "/cuartel" ? new URLSearchParams(p.u.split("?")[1] ?? "").get("sala") : null;
      const d = (sala ? porRuta.get(`/sala/${sala}`) : null) ?? porRuta.get(p.r);
      if (!d || vistos.has(d.r)) continue;
      vistos.add(d.r);
      out.push({ d, paso: p });
      if (out.length >= 6) break;
    }
    return out;
  }, [rastro, porRuta]);

  // «porque visitaste…»: temas de lo último visto → destinos no visitados
  const sugeridos = useMemo(() => {
    if (recientes.length === 0) return null;
    const ultimo = recientes[0].d;
    const visitados = new Set(rastro.map((p) => p.r));
    const pesos = new Map<string, number>();
    recientes.forEach((r, i) => r.d.t.forEach((t) => pesos.set(t, (pesos.get(t) ?? 0) + (6 - i))));
    const l = destinos
      .filter((d) => !visitados.has(d.r) && d.p === "publico" && d.s === 0 && d.t.some((t) => pesos.has(t)))
      .map((d) => ({ d, s: d.t.reduce((s, t) => s + (pesos.get(t) ?? 0), 0) + (d.img ? 0.5 : 0) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 6)
      .map((x) => x.d);
    return { ultimo, l };
  }, [recientes, rastro, destinos]);

  const favoritos = favs.map((r) => porRuta.get(r)).filter((d): d is DestinoCliente => !!d);
  const nSalas = lista.filter((d) => d.s === 1).length;
  const filtrando = q.trim().length > 0 || tema !== null;

  return (
    <div style={{ marginTop: 16 }}>
      <div className="vx-pl-panel vx-pl-dir-cab">
        <input
          className="vx-pl-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="¿Qué quieres hacer? Ej.: comparar países, mapa 3D, radio, armas, mis favoritos…"
          aria-label="Buscar en el directorio"
        />
        <div className="vx-pl-temas" role="group" aria-label="Temas">
          <button type="button" className="vx-pl-tema" aria-pressed={tema === null} onClick={() => setTema(null)} style={tema === null ? { background: "#e7edf5" } : undefined}>
            Todo · {destinos.length}
          </button>
          {temas.map((t) => {
            const n = destinos.filter((d) => d.t.includes(t.id)).length;
            if (n === 0) return null;
            const on = tema === t.id;
            return (
              <button
                key={t.id}
                type="button"
                className="vx-pl-tema"
                aria-pressed={on}
                title={t.pregunta}
                onClick={() => setTema(on ? null : t.id)}
                style={on ? { background: t.color, borderColor: t.color } : { borderColor: `${t.color}55` }}
              >
                {t.nombre} · {n}
              </button>
            );
          })}
        </div>
        {tema ? <p className="vx-pl-vacio" style={{ margin: 0 }}>{temaPorId.get(tema)?.pregunta}</p> : null}
      </div>

      {!filtrando && montado ? (
        <>
          <section className="vx-pl-sec">
            <h2 className="vx-pl-h2">★ Tus favoritos</h2>
            {favoritos.length === 0 ? (
              <p className="vx-pl-vacio">Todavía no marcaste ninguno. Toca la ★ de cualquier destino y quedará aquí, en este navegador.</p>
            ) : (
              <div className="vx-pl-rejilla">
                {favoritos.map((d) => (
                  <Tarjeta key={d.r} d={d} fav onFav={alternarFav} temaPorId={temaPorId} />
                ))}
              </div>
            )}
          </section>

          <section className="vx-pl-sec">
            <h2 className="vx-pl-h2">Visto hace poco</h2>
            {recientes.length === 0 ? (
              <p className="vx-pl-vacio">Cuando recorras la casa, aquí aparecerán las últimas puertas que abriste para volver con un toque.</p>
            ) : (
              <div className="vx-pl-rejilla">
                {recientes.map(({ d, paso }) => (
                  <Link key={d.r} href={paso.u} className="vx-pl-tarjeta">
                    <h3>{d.n}</h3>
                    <p>{paso.ti && paso.ti !== d.n ? paso.ti : d.d}</p>
                    <p className="vx-pl-meta">
                      {haceCuanto(paso.t)}
                      {paso.n > 1 ? ` · ${paso.n} visitas` : ""}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {sugeridos && sugeridos.l.length > 0 ? (
            <section className="vx-pl-sec">
              <h2 className="vx-pl-h2">Porque visitaste {sugeridos.ultimo.n}</h2>
              <p className="vx-pl-h2-sub">Puertas de los mismos temas que todavía no abriste.</p>
              <div className="vx-pl-rejilla">
                {sugeridos.l.map((d) => (
                  <Tarjeta key={d.r} d={d} fav={favs.includes(d.r)} onFav={alternarFav} temaPorId={temaPorId} />
                ))}
              </div>
            </section>
          ) : null}

          <section className="vx-pl-sec">
            <h2 className="vx-pl-h2">Colecciones: recorridos guiados</h2>
            <div className="vx-pl-rejilla">
              {colecciones.map((c) => (
                <Link key={c.clave} href={`/colecciones/${c.clave}`} className="vx-pl-tarjeta">
                  <h3>{c.titulo}</h3>
                  <p>{c.pregunta}</p>
                  <p className="vx-pl-meta">
                    {c.paradas} paradas · {c.minutos} min
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </>
      ) : null}

      <section className="vx-pl-sec">
        <h2 className="vx-pl-h2">{filtrando ? `${lista.length} resultados` : "Todo el directorio"}</h2>
        <p className="vx-pl-h2-sub">
          {lista.length - nSalas} centros y {nSalas} salas del cuartel (las salas van después: cada una abre su puerta /sala con su explicación).
        </p>
        {lista.length === 0 ? (
          <p className="vx-pl-vacio">
            Nada coincide con «{q}». Prueba con otra palabra o busca en el archivo de cables:{" "}
            <Link href={`/nucleo?q=${encodeURIComponent(q)}`} style={{ color: "#5eead4" }}>
              buscar «{q}» en el núcleo →
            </Link>
          </p>
        ) : (
          <div className="vx-pl-rejilla">
            {lista.map((d) => (
              <Tarjeta key={d.r} d={d} fav={favs.includes(d.r)} onFav={alternarFav} temaPorId={temaPorId} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Tarjeta({
  d,
  fav,
  onFav,
  temaPorId,
}: {
  d: DestinoCliente;
  fav: boolean;
  onFav: (r: string) => void;
  temaPorId: Map<string, TemaC>;
}) {
  return (
    <article className="vx-pl-tarjeta vx-pl-dest">
      {d.img ? (
        <img src={d.img} alt="" loading="lazy" width={54} height={54} />
      ) : null}
      <div className="vx-pl-dest-cuerpo">
        <h3>
          <Link href={d.r}>{d.n}</Link>
          {d.vivo ? <span style={{ color: "#ff6b7a", fontSize: 11, marginLeft: 6 }}>● en vivo</span> : null}
          {d.e !== "VIVO" ? <span style={{ color: "#e8c56a", fontSize: 11, marginLeft: 6 }}>{d.e}</span> : null}
        </h3>
        <p>{d.d}</p>
        <div className="vx-pl-mini">
          <span>{d.m}</span>
          {d.t.slice(0, 2).map((t) => (
            <span key={t} style={{ color: temaPorId.get(t)?.color }}>
              {temaPorId.get(t)?.nombre}
            </span>
          ))}
          {d.p === "cuenta" ? <span>requiere cuenta</span> : null}
          <GuardarPieza compacto titulo={d.n} href={d.r} nota={d.d} clase="herramienta" etiquetas={["directorio"]} />
        </div>
      </div>
      <button type="button" className="vx-pl-estrella" aria-pressed={fav} aria-label={fav ? `Quitar ${d.n} de favoritos` : `Marcar ${d.n} como favorito`} onClick={() => onFav(d.r)}>
        {fav ? "★" : "☆"}
      </button>
    </article>
  );
}

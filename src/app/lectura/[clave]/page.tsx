// ═══════════════════════════════════════════════════════════════════
// v400.0 LA LECTURA — cada nota en formato «lo esencial en 30 segundos»
// (Axios / BBC Key points): titular corto, foto real del medio, tres
// puntos, línea de tiempo del frente y mini mapa. Nada de muros de texto.
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import "../../portada.css";
import { buscarNota, obtenerNotas, type Nota } from "@/lib/portada/notas";
import { REGIONES, conflictoPorKey, horaCorta, minutosLectura } from "@/lib/portada/clasificar";
import { TEATROS } from "@/lib/teatros";
import { Cabecera, BarraMovil } from "@/components/portada/cabecera";
import { Tarjeta, Etiqueta } from "@/components/portada/tarjeta";
import { Foto } from "@/components/portada/foto";
import { Hace } from "@/components/portada/hace";
import { MiniMapa } from "@/components/portada/mini-mapa";
import { Pie } from "@/components/portada/pie";
import { IcoCheck, IcoExterno } from "@/components/portada/iconos";
import { inter } from "@/components/portada/fuente";

export const revalidate = 300;

type Props = { params: Promise<{ clave: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { clave } = await params;
  const n = await buscarNota(clave);
  if (!n) return { title: "Nota no encontrada", robots: { index: false } };
  return {
    title: n.titulo,
    description: n.resumen.slice(0, 160) || n.titulo,
    alternates: { canonical: `/lectura/${clave}` },
    openGraph: { title: n.titulo, description: n.resumen.slice(0, 160), images: n.imagen ? [n.imagen] : ["/api/og"] },
  };
}

function frases(t: string): string[] {
  return (t.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [t]).map((s) => s.trim()).filter(Boolean);
}

export default async function Lectura({ params }: Props) {
  const { clave } = await params;
  const [nota, todas] = await Promise.all([buscarNota(clave), obtenerNotas()]);
  if (!nota) notFound();

  const c = conflictoPorKey(nota.conflicto);
  const reg = REGIONES[nota.region] ?? REGIONES.mundo;
  const teatro = c?.teatro ? TEATROS[c.teatro] : null;
  const fr = frases(nota.resumen);
  const quePaso = fr.slice(0, 2).join(" ") || nota.titulo;
  const resto = fr.slice(2).join(" ");
  const mismas = todas.filter((x) => x.id !== nota.id && (c ? x.conflicto === c.key : x.region === nota.region));
  const linea: Nota[] = [nota, ...mismas.slice(0, 5)].sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha));
  const relacionadas = mismas.slice(0, 3);
  const enVivo = Date.now() - new Date(nota.fecha).getTime() < 3 * 3600_000;

  return (
    <div className={`vx ${inter.variable}`}>
      <Cabecera />
      <main className="vx-wrap">
        <div className="vx-lec">
          <article className="vx-entra">
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              {enVivo && (
                <span className="vx-vivo" style={{ padding: "4px 10px", fontSize: 12 }}>
                  <span className="vx-punto" /> EN VIVO
                </span>
              )}
              <Etiqueta nota={nota} />
            </div>
            <h1>{nota.titulo}</h1>
            <div className="vx-meta" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <b>{nota.fuente}</b> · <Hace iso={nota.fecha} /> · {minutosLectura(nota.resumen)} min de lectura ·
              <span className="vx-ok">
                <IcoCheck className="" /> Medio verificado
              </span>
            </div>

            <div className="vx-lec-foto">
              <Foto src={nota.imagen} alt={nota.titulo} region={nota.region} prioridad />
            </div>

            <section className="vx-esencial" aria-label="Lo esencial">
              <h2>⚡ Lo esencial en 30 segundos</h2>
              <ul>
                <li>
                  <b>Qué pasó:</b> {quePaso}
                </li>
                <li>
                  <b>Dónde:</b> {c ? `${c.nombre} (${reg.nombre})` : reg.nombre}.{" "}
                  {mismas.length > 0 && `${mismas.length} ${mismas.length === 1 ? "nota más" : "notas más"} sobre el tema en las últimas 72 h.`}
                </li>
                <li>
                  <b>Contexto:</b>{" "}
                  {teatro ? teatro.resumen.split(". ")[0] + "." : `Información publicada por ${nota.fuente} a las ${horaCorta(nota.fecha)} (hora de Santo Domingo).`}
                </li>
              </ul>
            </section>

            {resto && (
              <p style={{ fontSize: 18, lineHeight: 1.65, color: "var(--vx-tx2)", margin: "26px 0 0" }}>{resto}</p>
            )}

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "28px 0 0" }}>
              <a href={nota.url} target="_blank" rel="noopener noreferrer" className="vx-btn">
                Leer la nota completa en {nota.fuente} <IcoExterno className="" />
              </a>
              <Link href="/" className="vx-btn vx-btn-sec">
                ← Volver a la portada
              </Link>
            </div>
          </article>

          <aside className="vx-lec-lado vx-entra-2">
            {c && <MiniMapa coords={c.coords} nombre={c.nombre} />}
            {linea.length > 1 && (
              <div className="vx-caja">
                <h3>{c ? "Línea de tiempo" : `Lo último en ${reg.nombre}`}</h3>
                <ol className="vx-linea">
                  {linea.map((x) => (
                    <li key={x.id} data-yo={x.id === nota.id ? "1" : "0"}>
                      <time dateTime={x.fecha}>{horaCorta(x.fecha)} · {x.fuente}</time>
                      {x.id === nota.id ? <b>{x.titulo}</b> : <Link href={`/lectura/${x.id}`}>{x.titulo}</Link>}
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {c?.teatro && (
              <Link href={`/conflicto/${c.teatro}`} className="vx-btn vx-btn-sec" style={{ justifyContent: "center" }}>
                Todo sobre {c.nombre} →
              </Link>
            )}
          </aside>
        </div>

        {relacionadas.length > 0 && (
          <section className="vx-sec">
            <div className="vx-sec-h">
              <h2>Más sobre {c ? c.nombre : reg.nombre}</h2>
            </div>
            <div className="vx-bento" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
              {relacionadas.map((x) => (
                <Tarjeta key={x.id} nota={x} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Pie />
      <BarraMovil />
    </div>
  );
}

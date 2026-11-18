// ═══════════════════════════════════════════════════════════════════
// v406.3 LA PORTADA DE UN ÁREA — /editorial/area/<clave>.
// Artículos del área, piezas en cola para ella y sus puertas de la casa.
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import "../../editorial.css";
import { PortadaSala } from "@/components/vanguard/portada-sala";
import { TarjetaArticulo } from "@/components/editorial/bloques";
import { articulosDeArea } from "@/lib/editorial";
import { AREAS_EDITORIALES, AREA_POR_CLAVE, puertasClasicas } from "@/lib/editorial/areas";
import { cola, ESTADO_ES } from "@/lib/editorial/calendario";
import type { ClaveArea } from "@/lib/editorial/tipos";

export const dynamicParams = false;

export function generateStaticParams() {
  return AREAS_EDITORIALES.map((a) => ({ clave: a.clave }));
}

type Props = { params: Promise<{ clave: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { clave } = await params;
  const ar = AREA_POR_CLAVE.get(clave as ClaveArea);
  if (!ar) return { title: "Área no encontrada — Vanguard" };
  return {
    title: `${ar.nombre} — La redacción de Vanguard`,
    description: ar.descripcion,
    alternates: { canonical: `/editorial/area/${ar.clave}` },
  };
}

export default async function AreaPage({ params }: Props) {
  const { clave } = await params;
  const ar = AREA_POR_CLAVE.get(clave as ClaveArea);
  if (!ar) notFound();
  const arts = articulosDeArea(ar.clave);
  const pend = cola().filter((p) => p.area === ar.clave);
  const clasicas = puertasClasicas(ar.clasico);

  return (
    <main className="vx ed" style={{ ["--ed-acento" as string]: ar.color }}>
      <PortadaSala
        imagen={ar.imagen}
        alt={`Ilustración del área ${ar.nombre}`}
        volanta={`REDACCIÓN · ${ar.lema.toUpperCase()}`}
        titulo={ar.nombre}
        sumario={ar.descripcion}
        cifras={[
          { valor: arts.length, etiqueta: "artículos" },
          { valor: pend.length, etiqueta: "en la cola" },
          { valor: ar.moderno.length + clasicas.length, etiqueta: "salas enlazadas" },
        ]}
        anclas={[
          { etiqueta: "Artículos", href: "#articulos" },
          { etiqueta: "En la cola", href: "#cola" },
          { etiqueta: "Salas", href: "#salas" },
          { etiqueta: "Toda la redacción", href: "/editorial" },
        ]}
        acento={ar.color}
        prioritaria
        nivel="h1"
      />
      <section className="vx-sec" id="articulos" aria-labelledby="ed-a-t">
        <div className="vx-wrap">
          <div className="vx-sec-h">
            <div>
              <span className="vx-sello">Publicado</span>
              <h2 id="ed-a-t">Artículos de {ar.nombre}</h2>
            </div>
          </div>
          {arts.length > 0 ? (
            <div className="ed-rejilla">
              {arts.map((a) => (
                <TarjetaArticulo key={a.slug} a={a} />
              ))}
            </div>
          ) : (
            <p className="ed-area-vacia">Las primeras piezas de esta área están en la cola (abajo).</p>
          )}
        </div>
      </section>
      <section className="vx-sec" id="cola" aria-labelledby="ed-c-t">
        <div className="vx-wrap">
          <div className="vx-sec-h">
            <div>
              <span className="vx-sello">Próximas semanas</span>
              <h2 id="ed-c-t">En la cola</h2>
            </div>
            <Link href="/editorial/calendario">Calendario →</Link>
          </div>
          {pend.length > 0 ? (
            <ul className="ed-dias">
              {pend.map((p) => (
                <li key={p.fecha + p.titulo} className="ed-pieza" style={{ ["--ed-acento" as string]: ar.color }}>
                  <span className="ed-pieza-fecha">
                    <b>{Number(p.fecha.slice(8))}</b>
                    {p.fecha.slice(5, 7) === "11" ? "nov" : "dic"}
                  </span>
                  <div>
                    <span className="ed-estado" data-e={p.estado}>
                      {ESTADO_ES[p.estado]}
                    </span>
                    <p className="ed-pieza-t">{p.titulo}</p>
                    <p className="ed-pieza-a">{p.angulo}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ed-area-vacia">Sin piezas programadas en esta ventana.</p>
          )}
        </div>
      </section>
      <section className="vx-sec" id="salas" aria-labelledby="ed-s-t">
        <div className="vx-wrap">
          <div className="vx-sec-h">
            <div>
              <span className="vx-sello">Vanguard moderno y clásico</span>
              <h2 id="ed-s-t">Las salas del área</h2>
            </div>
          </div>
          <div className="ed-puertas" style={{ borderTop: 0 }}>
            {ar.moderno.map((e) => (
              <Link key={e.href} href={e.href}>
                {e.label}
              </Link>
            ))}
            {clasicas.map((e) => (
              <Link key={e.href} href={e.href} data-clasico="1">
                {e.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE_URL } from "@/lib/site";
import { Marco } from "@/components/planeta/marco";
import { GuardarPieza } from "@/components/planeta/guardar";
import { COLECCIONES, TEMA_POR_ID, coleccionDe, destinoDe } from "@/lib/planeta/directorio";

// v407.1 · /colecciones/[clave] — UN RECORRIDO, PARADA A PARADA

export const dynamicParams = false;

export function generateStaticParams() {
  return COLECCIONES.map((c) => ({ clave: c.clave }));
}

interface Props {
  params: Promise<{ clave: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { clave } = await params;
  const c = coleccionDe(clave);
  if (!c) return { title: "Colección no encontrada | VANGUARD" };
  return {
    title: `${c.titulo} · recorrido guiado | VANGUARD`,
    description: `${c.pregunta} ${c.intro}`,
    alternates: { canonical: `${SITE_URL}/colecciones/${c.clave}` },
  };
}

export default async function ColeccionPage({ params }: Props) {
  const { clave } = await params;
  const c = coleccionDe(clave);
  if (!c) notFound();
  const t = TEMA_POR_ID.get(c.tema);
  const otras = COLECCIONES.filter((x) => x.clave !== c.clave);
  return (
    <Marco
      ruta="/colecciones"
      volanta={`Colección · ${t?.nombre ?? "Vanguard"} · ${c.paradas.length} paradas · unos ${c.minutos} min`}
      titulo={c.titulo}
      sub={
        <>
          <b>{c.pregunta}</b> {c.intro}
        </>
      }
    >
      <div className="vx-pl-fila" style={{ marginTop: 14 }}>
        <Link href={c.paradas[0].ruta} className="vx-pl-btn vx-pl-btn--on">Empezar por la parada 1 →</Link>
        <GuardarPieza titulo={`Colección · ${c.titulo}`} href={`/colecciones/${c.clave}`} nota={c.pregunta} clase="investigacion" etiquetas={["coleccion", c.clave]} />
      </div>

      <section className="vx-pl-sec">
        <ol className="vx-pl-paradas">
          {c.paradas.map((p) => {
            const d = destinoDe(p.ruta);
            return (
              <li key={p.ruta}>
                <Link href={p.ruta} className="vx-pl-tarjeta">
                  <h3>{p.titulo}</h3>
                  <p>{p.porque}</p>
                  <p className="vx-pl-meta">
                    {d ? `${d.nombre} · ${d.modulo}` : p.ruta.split("?")[0]} · abrir →
                  </p>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="vx-pl-sec">
        <h2 className="vx-pl-h2">Otras colecciones</h2>
        <div>
          {otras.map((o) => (
            <Link key={o.clave} href={`/colecciones/${o.clave}`} className="vx-pl-chip">
              {o.titulo}
            </Link>
          ))}
        </div>
      </section>
    </Marco>
  );
}

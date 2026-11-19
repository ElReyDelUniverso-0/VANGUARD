// ═══════════════════════════════════════════════════════════════════
// v420.0 VANGUARD LINGUA — el árbol interactivo de una familia.
// /lingua/familias/<glottocode>?n=<nodo> abre el árbol con la ruta
// hasta <nodo> desplegada y su panel a la vista (enlace compartible).
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MarcoLingua } from "@/components/lingua/marco-lingua";
import { Migas } from "@/components/lingua/piezas";
import { ArbolLenguas } from "@/components/lingua/arbol";
import { detalleArbol, hijosArbol, type HijoArbol } from "@/lib/lingua/arbol";
import { linaje, nodoPorId, nombreNodo, tipoDe } from "@/lib/lingua/servidor";
import { fichaFamilia } from "@/lib/lingua/familias";
import { RUTAS_LINGUA, formatoNumero, rutaFamilia } from "@/lib/lingua/tipos";
import { SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const n = nodoPorId(id);
  if (!n) return { title: "Familias · Lingua · VANGUARD" };
  const d = detalleArbol(id);
  return {
    title: `${nombreNodo(n)}: árbol de la familia lingüística · Lingua · VANGUARD`,
    description: `${nombreNodo(n)} (${n.nombre}): ${formatoNumero(d?.nLenguas ?? 0)} lenguas según Glottolog 5.4. Recorre sus ramas, su distribución en el mapa, su estado de amenaza y su historia.`,
    alternates: { canonical: `${SITE_URL}${rutaFamilia(id)}` },
  };
}

export default async function Page({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const tipo = tipoDe(id);
  if (!tipo) notFound();
  if (tipo !== "familia") {
    const pasos = linaje(id);
    const raiz = pasos.find((p) => p.tipo === "familia");
    if (raiz) redirect(`${rutaFamilia(raiz.id)}?n=${id}`);
    redirect(`/lingua/idioma/${id}`);
  }
  const nodo = nodoPorId(id)!;
  const nTxt = typeof sp.n === "string" ? sp.n : "";
  let objetivo = id;
  let ruta: string[] = [];
  if (nTxt && nTxt !== id && tipoDe(nTxt)) {
    const l = linaje(nTxt).map((p) => p.id);
    const k = l.indexOf(id);
    if (k >= 0) {
      objetivo = nTxt;
      ruta = l.slice(k + 1);
    }
  }
  const hijosIniciales: Record<string, HijoArbol[]> = { [id]: hijosArbol(id) };
  for (const r of ruta) hijosIniciales[r] = hijosArbol(r);
  const detalle = detalleArbol(objetivo)!;
  const raizDet = objetivo === id ? detalle : detalleArbol(id)!;
  const padres = linaje(id);
  const ficha = fichaFamilia(id);

  return (
    <MarcoLingua
      activo={RUTAS_LINGUA.familias}
      volanta={nodo.pseudo ? "Lingua · Agrupación no genealógica" : padres.length ? "Lingua · Rama lingüística" : "Lingua · Familia lingüística"}
      titulo={nombreNodo(nodo)}
      sub={
        <>
          {nombreNodo(nodo) !== nodo.nombre ? `${nodo.nombre} en Glottolog. ` : ""}
          {formatoNumero(raizDet.nLenguas)} lenguas y {formatoNumero(raizDet.nDialectos)} dialectos.
          {padres.length ? (
            <>
              {" "}
              Rama de <Link href={`${rutaFamilia(padres[0].id)}?n=${id}`}>{padres[0].nombre}</Link>.
            </>
          ) : null}
          {ficha?.protolengua ? ` Antepasado común: ${ficha.protolengua.split(" (")[0].toLowerCase()}.` : ""} Toca cualquier rama para desplegarla y ver qué hay debajo.
        </>
      }
    >
      <Migas
        pasos={[
          { href: RUTAS_LINGUA.inicio, label: "Lingua" },
          { href: RUTAS_LINGUA.familias, label: "Familias" },
          ...padres.map((p) => ({ href: rutaFamilia(p.id), label: p.nombre })),
          { label: nombreNodo(nodo) },
        ]}
      />
      <ArbolLenguas
        raiz={id}
        nombreRaiz={nombreNodo(nodo)}
        hijosIniciales={hijosIniciales}
        abiertosIniciales={ruta}
        seleccionInicial={objetivo}
        detalleInicial={detalle}
      />
      <p className="vx-li-nota" style={{ marginTop: 14 }}>
        Clasificación: Glottolog 5.4, que solo agrupa lenguas cuando el parentesco está demostrado por el método comparativo. Otras obras (Ethnologue, por ejemplo) pueden usar
        agrupaciones más amplias. Fechas y lugares de origen son estimaciones de la bibliografía citada, no hechos establecidos.
      </p>
    </MarcoLingua>
  );
}

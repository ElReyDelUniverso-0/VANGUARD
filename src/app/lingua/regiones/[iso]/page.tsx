// v420.0 VANGUARD LINGUA — las lenguas de un país.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarcoLingua } from "@/components/lingua/marco-lingua";
import { BarraAes, Cifras, MapaPuntos, Migas, PuntoAes, bandera } from "@/components/lingua/piezas";
import { filtrarLenguas, glottoDeCodigo, lenguaPorId, nombreCodigo, nombreDe, nombreLengua, nombreTerritorio, resumir, territorioCldr } from "@/lib/lingua/servidor";
import { AES_ES, CATEGORIAS_ES, RUTAS_LINGUA, formatoNumero, formatoPoblacion, rutaFamilia, rutaIdioma, rutaPais } from "@/lib/lingua/tipos";
import { POR_ISO2 } from "@/lib/geo-paises";
import { SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ iso: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { iso } = await params;
  const I = iso.toUpperCase();
  const n = filtrarLenguas({ pais: I }).length;
  if (!n && !territorioCldr(I)) return { title: "Regiones · Lingua · VANGUARD" };
  return {
    title: `Lenguas de ${nombreTerritorio(I)} · Lingua · VANGUARD`,
    description: `Qué lenguas se hablan en ${nombreTerritorio(I)}: ${n} lenguas con presencia según Glottolog, población hablante según CLDR, familias y estado de amenaza.`,
    alternates: { canonical: `${SITE_URL}${rutaPais(I)}` },
  };
}

const ESTATUS: Record<string, string> = { official: "Oficial", de_facto_official: "Oficial de facto", official_regional: "Oficial regional", official_minority: "Minoritaria reconocida" };

export default async function Page({ params }: Props) {
  const { iso } = await params;
  if (!/^[a-zA-Z]{2}$/.test(iso)) notFound();
  const I = iso.toUpperCase();
  const lenguas = filtrarLenguas({ pais: I, orden: "nombre" });
  const cldr = territorioCldr(I);
  if (!lenguas.length && !(cldr?.l ?? []).some(([c]) => c !== "und")) notFound();
  const r = resumir(lenguas);
  const nombre = nombreTerritorio(I);
  const fam = new Map<string, number>();
  let aisladas = 0;
  for (const l of lenguas) {
    if (l.familia) fam.set(l.familia, (fam.get(l.familia) ?? 0) + 1);
    else if (l.aislada) aisladas++;
  }
  const familias = [...fam.entries()].sort((a, b) => b[1] - a[1]);
  const habladas = (cldr?.l ?? []).filter(([code]) => code !== "und").sort((a, b) => b[1] - a[1]);
  const orden = [...lenguas].sort((a, b) => (a.aes < 0 ? 9 : a.aes) - (b.aes < 0 ? 9 : b.aes) || nombreLengua(a).localeCompare(nombreLengua(b), "es"));
  const enMundos = POR_ISO2.has(I);
  return (
    <MarcoLingua
      activo={RUTAS_LINGUA.regiones}
      volanta="Lingua · Lenguas por país"
      titulo={`${bandera(I)} Lenguas de ${nombre}`}
      sub={
        <>
          {formatoNumero(lenguas.length)} lenguas con presencia en {nombre} según Glottolog
          {cldr ? `, ${habladas.length} con estimación de uso en Unicode CLDR para una población de ${formatoPoblacion(cldr.pob)}` : ""}.{" "}
          {enMundos ? <Link href={`/mundos/${I.toLowerCase()}`}>Ver la ficha completa del país →</Link> : null}
        </>
      }
    >
      <Migas pasos={[{ href: RUTAS_LINGUA.inicio, label: "Lingua" }, { href: RUTAS_LINGUA.regiones, label: "Regiones" }, { label: nombre }]} />
      <Cifras
        items={[
          { valor: formatoNumero(lenguas.length), label: "lenguas con presencia (Glottolog)" },
          { valor: familias.length, label: "familias representadas" },
          { valor: formatoNumero(r.aes[2] + r.aes[3] + r.aes[4]), label: "en retroceso a casi extintas" },
          { valor: formatoNumero(r.aes[5]), label: "extintas" },
        ]}
      />

      {habladas.length ? (
        <section className="vx-li-seccion">
          <h2>Qué lenguas usa hoy la población</h2>
          <p className="vx-li-nota">Estimación de Unicode CLDR: porcentaje de la población que usa cada lengua, como primera o segunda lengua. CLDR suele ajustar la cifra por alfabetización, así que no equivale a hablantes nativos (en la República Dominicana da un 78 % para el español, cuando casi toda la población lo habla). Los porcentajes pueden sumar más de 100.</p>
          <div className="vx-li-tabla-caja">
            <table className="vx-li-tabla">
              <thead>
                <tr>
                  <th>Lengua</th>
                  <th className="num">% población</th>
                  <th className="num">Personas</th>
                  <th>Estatus</th>
                </tr>
              </thead>
              <tbody>
                {habladas.map(([code, pct, est, g]) => {
                  const l = g ? lenguaPorId(g) : glottoDeCodigo(code) ? lenguaPorId(glottoDeCodigo(code)!) : undefined;
                  return (
                    <tr key={code}>
                      <td>
                        {l ? <Link href={rutaIdioma(l.id)}>{nombreCodigo(code)}</Link> : nombreCodigo(code)}
                        <small>{code}</small>
                      </td>
                      <td className="num">{pct.toLocaleString("es-ES", { maximumFractionDigits: 3 })} %</td>
                      <td className="num">{formatoPoblacion(Math.round((cldr!.pob * pct) / 100))}</td>
                      <td>{ESTATUS[est] ?? (est ? est : "—")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {lenguas.length ? (
        <>
          <section className="vx-li-seccion">
            <h2>Mapa</h2>
            <MapaPuntos
              puntos={lenguas.filter((l) => l.lat !== null && l.lon !== null).map((l) => ({ lat: l.lat as number, lon: l.lon as number, color: AES_ES[l.aes]?.color ?? "#475569", titulo: nombreLengua(l), href: rutaIdioma(l.id) }))}
              etiqueta={`Lenguas con presencia en ${nombre}`}
            />
            <p className="vx-li-nota" style={{ marginTop: 6 }}>
              Cada punto es la ubicación de referencia de una lengua en Glottolog, que puede estar fuera del país si la lengua es transfronteriza. Color: estado de amenaza.
            </p>
            <BarraAes aes={r.aes} sinAes={r.sinAes} />
          </section>

          <section className="vx-li-seccion">
            <h2>Familias</h2>
            <ul className="vx-li-chips">
              {familias.map(([f, n]) => (
                <li key={f}>
                  <Link href={rutaFamilia(f)}>
                    {nombreDe(f)} · {n}
                  </Link>
                </li>
              ))}
              {aisladas ? (
                <li>
                  <Link href={`${RUTAS_LINGUA.familias}#aisladas`}>Lenguas aisladas · {aisladas}</Link>
                </li>
              ) : null}
            </ul>
          </section>

          <section className="vx-li-seccion">
            <h2>Todas las lenguas ({formatoNumero(lenguas.length)})</h2>
            <p className="vx-li-nota">Primero las que corren menos peligro; al final, las extintas.</p>
            <div className="vx-li-tabla-caja">
              <table className="vx-li-tabla">
                <thead>
                  <tr>
                    <th>Lengua</th>
                    <th>Familia</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {orden.slice(0, 400).map((l) => (
                    <tr key={l.id}>
                      <td>
                        <Link href={rutaIdioma(l.id)}>{nombreLengua(l)}</Link>
                        <small>
                          {l.iso ? `ISO ${l.iso}` : l.id}
                          {l.categoria !== "Spoken_L1_Language" ? ` · ${CATEGORIAS_ES[l.categoria]?.nombre ?? ""}` : ""}
                        </small>
                      </td>
                      <td>{l.aislada ? <em>Aislada</em> : l.familia ? nombreDe(l.familia) : "—"}</td>
                      <td>
                        <PuntoAes aes={l.aes} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {lenguas.length > 400 ? (
              <p className="vx-li-nota">
                Se muestran 400. <Link href={`${RUTAS_LINGUA.idiomas}?pais=${I}`}>Ver las {formatoNumero(lenguas.length)} en el catálogo con filtros →</Link>
              </p>
            ) : null}
          </section>
        </>
      ) : null}
    </MarcoLingua>
  );
}

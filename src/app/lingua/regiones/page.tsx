// v420.0 VANGUARD LINGUA — colecciones de idiomas por región.
import type { Metadata } from "next";
import Link from "next/link";
import { MarcoLingua } from "@/components/lingua/marco-lingua";
import { Migas, bandera } from "@/components/lingua/piezas";
import { nombreDe, nombreTerritorio, resumir, todasLasLenguas } from "@/lib/lingua/servidor";
import { MACROAREAS_ES, NOTA_MACROAREAS, RUTAS_LINGUA, formatoNumero, rutaFamilia, rutaPais } from "@/lib/lingua/tipos";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Lenguas por región y por país · Lingua · VANGUARD",
  description: "Colecciones de idiomas por macroárea y por país: cuántas lenguas se hablan en cada lugar, de qué familias y cuántas están en peligro.",
  alternates: { canonical: `${SITE_URL}/lingua/regiones` },
};

export default function Page() {
  const todas = todasLasLenguas();
  const macro = Object.keys(MACROAREAS_ES).map((m) => {
    const ls = todas.filter((l) => l.macro === m);
    const fam = new Map<string, number>();
    for (const l of ls) if (l.familia) fam.set(l.familia, (fam.get(l.familia) ?? 0) + 1);
    return { m, n: ls.length, riesgo: ls.filter((l) => l.aes >= 2 && l.aes <= 4).length, top: [...fam.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4) };
  });
  const paises = resumir(todas).paises;
  return (
    <MarcoLingua
      activo={RUTAS_LINGUA.regiones}
      titulo="Lenguas por región"
      sub="Dónde se habla cada lengua. Las colecciones por país combinan dos fuentes: Glottolog dice qué lenguas tienen presencia histórica en el territorio; Unicode CLDR estima qué parte de la población usa cada lengua hoy."
    >
      <Migas pasos={[{ href: RUTAS_LINGUA.inicio, label: "Lingua" }, { label: "Regiones" }]} />
      <section>
        <h2 style={{ fontSize: 19, margin: "0 0 4px" }}>Seis macroáreas</h2>
        <p className="vx-li-nota">{NOTA_MACROAREAS}</p>
        <div className="vx-li-rejilla tres">
          {macro.map((x) => (
            <div key={x.m} className="vx-li-tarjeta">
              <h3>
                <Link href={`${RUTAS_LINGUA.idiomas}?macro=${encodeURIComponent(x.m)}`} style={{ color: "inherit" }}>
                  {MACROAREAS_ES[x.m]}
                </Link>
              </h3>
              <p>
                {formatoNumero(x.n)} lenguas · {formatoNumero(x.riesgo)} en riesgo
              </p>
              <small>
                {x.top.map(([f, n], i) => (
                  <span key={f}>
                    {i ? " · " : ""}
                    <Link href={rutaFamilia(f)}>{nombreDe(f)}</Link> ({n})
                  </span>
                ))}
              </small>
              <small>
                <Link href={`${RUTAS_LINGUA.peligro}?macro=${encodeURIComponent(x.m)}`}>Lenguas en peligro de {MACROAREAS_ES[x.m]} →</Link>
              </small>
            </div>
          ))}
        </div>
      </section>
      <section className="vx-li-seccion">
        <h2>Países y territorios ({paises.length})</h2>
        <p className="vx-li-nota">Ordenados por número de lenguas con presencia según Glottolog (una lengua transfronteriza cuenta en cada país).</p>
        <ul className="vx-li-chips">
          {paises.map(([iso, n]) => (
            <li key={iso}>
              <Link href={rutaPais(iso)}>
                {bandera(iso)} {nombreTerritorio(iso)} · {n}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </MarcoLingua>
  );
}

// v420.0 VANGUARD LINGUA — bloque «Lenguas» de la ficha de país (/mundos/[iso]).
// Componente de servidor: lee las tablas de Lingua (Glottolog 5.4 + CLDR 49)
// y enlaza a la colección del país en /lingua/regiones/{iso}.
import Link from "next/link";
import { filtrarLenguas, glottoDeCodigo, lenguaPorId, nombreCodigo, resumir, territorioCldr } from "@/lib/lingua/servidor";
import { RUTAS_LINGUA, rutaIdioma, rutaPais } from "@/lib/lingua/tipos";

const ESTATUS: Record<string, string> = { official: "oficial", de_facto_official: "oficial de facto", official_regional: "oficial regional" };

export function LenguasDelPais({ iso2, nombre }: { iso2: string; nombre: string }) {
  const I = iso2.toUpperCase();
  const lenguas = filtrarLenguas({ pais: I });
  const cldr = territorioCldr(I);
  if (!lenguas.length && !cldr) return null;
  const r = resumir(lenguas);
  const amenazadas = r.aes[2] + r.aes[3] + r.aes[4];
  // «und» (lengua indeterminada) es el relleno de CLDR para territorios sin población estable
  const habladas = (cldr?.l ?? [])
    .filter(([code]) => code !== "und")
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  if (!lenguas.length && !habladas.length) return null;
  return (
    <div className="vx-mp-bloque" id="lenguas">
      <h2>Lenguas · qué se habla en {nombre}</h2>
      <p style={{ margin: "0 0 10px", fontSize: 14, lineHeight: 1.6 }}>
        {lenguas.length ? (
          <>
            Glottolog registra <b>{lenguas.length.toLocaleString("es-ES")}</b> {lenguas.length === 1 ? "lengua" : "lenguas"} con presencia en {nombre}, de las que{" "}
            <b>{amenazadas.toLocaleString("es-ES")}</b> están en retroceso, moribundas o casi extintas y <b>{r.aes[5].toLocaleString("es-ES")}</b> ya se extinguieron.
          </>
        ) : (
          <>Glottolog no sitúa ninguna lengua originaria en {nombre}.</>
        )}
      </p>
      {habladas.length ? (
        <>
          <p style={{ margin: "0 0 6px", fontSize: 12, letterSpacing: 1, color: "#94a3b8" }}>USO POR LA POBLACIÓN · ESTIMACIÓN UNICODE CLDR</p>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 12px", display: "grid", gap: 4 }}>
            {habladas.map(([code, pct, est, g]) => {
              const id = g || glottoDeCodigo(code);
              const l = id ? lenguaPorId(id) : undefined;
              return (
                <li key={code} style={{ fontSize: 13.5 }}>
                  {l ? (
                    <Link href={rutaIdioma(l.id)} style={{ color: "#5eead4" }}>
                      {nombreCodigo(code)}
                    </Link>
                  ) : (
                    nombreCodigo(code)
                  )}{" "}
                  <span style={{ color: "#94a3b8" }}>
                    · {pct.toLocaleString("es-ES", { maximumFractionDigits: 1 })} %{ESTATUS[est] ? ` · ${ESTATUS[est]}` : ""}
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
      <p style={{ margin: 0, display: "flex", flexWrap: "wrap", gap: 12, fontSize: 13.5 }}>
        <Link href={rutaPais(I)} style={{ color: "#5eead4" }}>
          Todas las lenguas de {nombre} →
        </Link>
        <Link href={RUTAS_LINGUA.mapa} style={{ color: "#5eead4" }}>
          Mapa mundial de lenguas →
        </Link>
        <Link href={RUTAS_LINGUA.conceptos} style={{ color: "#5eead4" }}>
          Lengua, dialecto o variedad →
        </Link>
      </p>
      <p style={{ margin: "8px 0 0", fontSize: 11.5, color: "#64748b" }}>Fuentes: Glottolog 5.4 (CC BY 4.0) y Unicode CLDR 49. Los porcentajes de CLDR estiman qué parte de la población usa cada lengua —a menudo ajustada por alfabetización, no hablantes nativos—, incluyen segundas lenguas y pueden sumar más de 100.</p>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { Marco, Bandera } from "@/components/planeta/marco";
import { INDICADORES, fmt } from "@/lib/planeta/indicadores";
import { anioTipico, ranking } from "@/lib/planeta/datos";

// ═══════════════════════════════════════════════════════════════════
// v407.1 · /rankings — LAS LISTAS DEL PLANETA (índice)
// Ocho indicadores, cada uno con su podio y la puerta a la lista completa.
// Estática: se calcula en el build con la tabla única del planeta.
// ═══════════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: "Rankings del planeta: población, PIB, renta, gasto militar y más | VANGUARD",
  description:
    "Ocho listas mundiales completas con datos del Banco Mundial: población, superficie, densidad, PIB, renta por habitante, gasto militar, esfuerzo militar y esperanza de vida, con el año de cada dato.",
  alternates: { canonical: `${SITE_URL}/rankings` },
};

export default function RankingsPage() {
  return (
    <Marco
      ruta="/rankings"
      volanta="Planeta en cifras · Rankings"
      titulo="Los rankings del planeta"
      sub="Ocho listas mundiales completas —no un top 10— con todos los países que tienen dato. Elige una para ver la clasificación entera, el peso de cada país sobre el total y el año de cada cifra."
      fuente={
        <>
          Fuente: tabla única del planeta (src/lib/planeta/datos.ts), que lee la ficha canónica de cada país: atlas de la casa y Banco Mundial API v2
          (captura 17-nov-2026). Lo que una fuente no publica para un país no se estima: ese país no entra en esa lista.
        </>
      }
    >
      <section className="vx-pl-sec">
        <div className="vx-pl-rejilla">
          {INDICADORES.map((ind) => {
            const r = ranking(ind.id);
            const anio = ind.anioDe ? anioTipico(ind.anioDe) : null;
            return (
              <Link key={ind.id} href={`/rankings/${ind.id}`} className="vx-pl-tarjeta">
                <h3>{ind.nombre}</h3>
                <p>{ind.pregunta}</p>
                <ol style={{ margin: "10px 0 0", paddingLeft: 18, fontSize: 13.5, lineHeight: 1.6 }}>
                  {r.slice(0, 3).map((p) => (
                    <li key={p.fila.iso2}>
                      <Bandera iso2={p.fila.iso2} nombre={p.fila.nombre} />
                      {p.fila.nombre} · <span style={{ color: "#9fb0c3" }}>{fmt(ind.id, p.valor)}</span>
                    </li>
                  ))}
                </ol>
                <p className="vx-pl-meta">
                  {r.length} países con dato{anio ? ` · dato más común: ${anio}` : ""} · ver la lista completa →
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </Marco>
  );
}

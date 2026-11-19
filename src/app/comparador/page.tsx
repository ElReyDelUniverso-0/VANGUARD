import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { Marco } from "@/components/planeta/marco";
import { Comparador } from "@/components/planeta/comparador";
import { payloadComparador } from "@/lib/planeta/datos";
import { INDICADORES } from "@/lib/planeta/indicadores";
import { ORGANIZACIONES } from "@/lib/planeta/organizaciones";

// ═══════════════════════════════════════════════════════════════════
// v407.1 · /comparador — EL COMPARADOR INTERNACIONAL
// La casa tenía 249 fichas de país y ninguna forma de ponerlas una al lado
// de otra. La página es estática: la tabla del planeta (≈250 filas, solo
// números) viaja en el HTML y el cliente compara sin pedir nada a la red.
// ?p=do,ht,cu guarda la comparación en el enlace.
// ═══════════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: "Comparador de países: población, PIB, renta, gasto militar y esperanza de vida | VANGUARD",
  description:
    "Compara hasta cuatro países cifra a cifra con datos del Banco Mundial: población, superficie, densidad, PIB, renta por habitante, gasto y esfuerzo militar y esperanza de vida, con su puesto mundial.",
  alternates: { canonical: `${SITE_URL}/comparador` },
};

export default function ComparadorPage() {
  const filas = payloadComparador();
  const orgs = ORGANIZACIONES.map((o) => ({ clave: o.clave, sigla: o.sigla, miembros: o.miembros }));
  return (
    <Marco
      ruta="/comparador"
      volanta="Planeta en cifras · Comparador internacional"
      titulo="Compara países cara a cara"
      sub="Elige de dos a cuatro países. Cada fila dice quién encabeza, cuántas veces es uno respecto del primero, su puesto en el mundo y el año del dato. El enlace guarda tu comparación."
      fuente={
        <>
          Fuentes: {INDICADORES.map((i) => `${i.nombre} — ${i.fuente}`).join(" · ")}. Captura del Banco Mundial: 17-nov-2026. «sin dato» significa que la
          fuente no publica esa cifra para ese país: la casa no la estima.
        </>
      }
    >
      <p
        style={{
          margin: "0 0 16px",
          borderLeft: "3px solid #f5c542",
          background: "rgba(245,197,66,.07)",
          padding: "12px 14px",
          fontSize: 13.5,
          lineHeight: 1.6,
          color: "#ded8c8",
        }}
      >
        Este comparador es el clásico: <b>ocho indicadores</b> contra una foto del Banco Mundial. El{" "}
        <a href="/datos-mundiales/comparar" style={{ color: "#5eead4" }}>
          comparador mundial
        </a>{" "}
        lleva la misma idea a <b>52 indicadores</b>, hasta cuatro países y seis indicadores a la vez, con serie histórica desde 1990 y la diferencia
        explicada en una frase. Los dos leen el mismo Banco Mundial y declaran el año de cada cifra.
      </p>
      <Comparador filas={filas} orgs={orgs} />
    </Marco>
  );
}

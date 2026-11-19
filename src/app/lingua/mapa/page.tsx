// v420.0 VANGUARD LINGUA — mapa mundial de lenguas.
import type { Metadata } from "next";
import { MarcoLingua } from "@/components/lingua/marco-lingua";
import { Migas } from "@/components/lingua/piezas";
import { MapaMundialLenguas } from "@/components/lingua/mapa-mundial";
import { NOMBRES_FAMILIA_ES } from "@/lib/lingua/familias";
import { NOTA_MACROAREAS, RUTAS_LINGUA } from "@/lib/lingua/tipos";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mapa mundial de lenguas · Lingua · VANGUARD",
  description: "Más de 8.000 lenguas en el mapa, coloreadas por familia o por estado de amenaza. Toca un punto para abrir su ficha.",
  alternates: { canonical: `${SITE_URL}/lingua/mapa` },
};

export default function Page() {
  return (
    <MarcoLingua
      activo={RUTAS_LINGUA.mapa}
      titulo="Mapa mundial de lenguas"
      sub="Cada punto es una lengua situada en su ubicación de referencia según Glottolog: un centro aproximado de su zona, no una frontera. Las zonas más densas —Nueva Guinea, el golfo de Guinea, el Himalaya, Mesoamérica— son las de mayor diversidad lingüística del planeta."
    >
      <Migas pasos={[{ href: RUTAS_LINGUA.inicio, label: "Lingua" }, { label: "Mapa" }]} />
      <MapaMundialLenguas nombresEs={NOMBRES_FAMILIA_ES} />
      <p className="vx-li-nota" style={{ marginTop: 12 }}>
        {NOTA_MACROAREAS} Las lenguas de señas, extintas y sin coordenadas conocidas pueden no aparecer. Fondo: Natural Earth (dominio público).
      </p>
    </MarcoLingua>
  );
}

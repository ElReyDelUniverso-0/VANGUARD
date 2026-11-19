// v420.0 VANGUARD LINGUA — el Marco de los centros + la navegación propia.
import type { ReactNode } from "react";
import { Marco } from "@/components/planeta/marco";
import { NavLingua } from "./piezas";
import { BASE_LINGUA, FUENTES_LINGUA } from "@/lib/lingua/tipos";

export function MarcoLingua({
  activo,
  volanta,
  titulo,
  sub,
  children,
  fuente,
}: {
  activo: string;
  volanta?: string;
  titulo: string;
  sub?: ReactNode;
  children: ReactNode;
  fuente?: ReactNode;
}) {
  return (
    <Marco
      ruta={BASE_LINGUA}
      activo="/lingua"
      volanta={volanta ?? "Lingua · Centro mundial de lenguas"}
      titulo={titulo}
      sub={sub}
      fuente={
        fuente ?? (
          <>
            Datos: <a href={FUENTES_LINGUA.glottolog.url}>Glottolog 5.4</a> (CC BY 4.0), <a href={FUENTES_LINGUA.iso.url}>ISO 639-3</a>,{" "}
            <a href={FUENTES_LINGUA.cldr.url}>Unicode CLDR 49</a> y <a href={FUENTES_LINGUA.wikcionario.url}>Wikcionario</a> (CC BY-SA 4.0).
          </>
        )
      }
    >
      <NavLingua activo={activo} />
      {children}
    </Marco>
  );
}

// v420.0 VANGUARD LINGUA — traductor de textos (servicio compatible: MyMemory).
import type { Metadata } from "next";
import Link from "next/link";
import { MarcoLingua } from "@/components/lingua/marco-lingua";
import { Migas } from "@/components/lingua/piezas";
import { TraductorLingua } from "@/components/lingua/traductor";
import { FUENTES_LINGUA, RUTAS_LINGUA } from "@/lib/lingua/tipos";
import { IDIOMAS_TRADUCTOR } from "@/lib/lingua/traduccion";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Traductor de textos · Lingua · VANGUARD",
  description: `Traduce textos cortos entre ${IDIOMAS_TRADUCTOR.length} idiomas con MyMemory, con el proveedor y el grado de coincidencia siempre visibles.`,
  alternates: { canonical: `${SITE_URL}/lingua/traductor` },
};

export default function Page() {
  return (
    <MarcoLingua
      activo={RUTAS_LINGUA.traductor}
      titulo="Traductor de textos"
      sub={`Traducción automática entre ${IDIOMAS_TRADUCTOR.length} idiomas mediante MyMemory, el servicio público de memorias de traducción de Translated. Lingua no reescribe ni retoca el resultado: lo muestra con su proveedor y su grado de coincidencia.`}
      fuente={
        <>
          Proveedor: <a href={FUENTES_LINGUA.mymemory.url}>MyMemory (Translated)</a>, uso gratuito con cuota diaria. Los textos se envían a ese servicio para traducirlos; no escribas datos
          personales.
        </>
      }
    >
      <Migas pasos={[{ href: RUTAS_LINGUA.inicio, label: "Lingua" }, { label: "Traductor" }]} />
      <TraductorLingua />
      <section className="vx-li-seccion">
        <h2>Antes de fiarte de una traducción automática</h2>
        <div className="vx-li-texto">
          <p>
            MyMemory combina traducciones humanas almacenadas (memorias de traducción) con traducción automática. Funciona bien en pares con mucho material —español, inglés, francés,
            portugués— y peor en lenguas con pocos textos digitales: ahí el resultado puede ser aproximado o directamente erróneo. Por eso el traductor no ofrece lenguas para las que
            no hay un servicio fiable.
          </p>
          <p>
            Para palabras sueltas, el <Link href={RUTAS_LINGUA.diccionario}>diccionario</Link> da traducciones revisadas por editores humanos en cientos de lenguas; para fórmulas de
            cortesía, la <Link href={RUTAS_LINGUA.expresiones}>biblioteca de expresiones</Link> indica cuándo se usa cada una.
          </p>
        </div>
      </section>
    </MarcoLingua>
  );
}

// v420.0 VANGUARD LINGUA — biblioteca de expresiones.
import type { Metadata } from "next";
import Link from "next/link";
import { MarcoLingua } from "@/components/lingua/marco-lingua";
import { Migas } from "@/components/lingua/piezas";
import { expresiones, FUENTE_EXPRESIONES } from "@/lib/lingua/servidor";
import { RUTAS_LINGUA, rutaExpresion } from "@/lib/lingua/tipos";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Biblioteca de expresiones en cientos de lenguas · Lingua · VANGUARD",
  description: "Cómo se dice hola, gracias, por favor, lo siento, te quiero o buen provecho en cientos de lenguas, con los matices de uso que anota Wiktionary.",
  alternates: { canonical: `${SITE_URL}/lingua/expresiones` },
};

const CATEGORIAS: Record<string, { nombre: string; nota: string }> = {
  saludos: { nombre: "Saludos y despedidas", nota: "Muchas lenguas no tienen un «hola» neutro: saludan según la hora, la persona o la situación." },
  cortesia: { nombre: "Cortesía", nota: "Agradecer, pedir y disculparse: las fórmulas que más se usan al llegar a otro país." },
  viaje: { nombre: "Viaje", nota: "Lo imprescindible para orientarse y presentarse." },
  afecto: { nombre: "Afecto y celebración", nota: "Brindis, felicitaciones y buenos deseos." },
};

export default function Page() {
  const lista = expresiones();
  return (
    <MarcoLingua
      activo={RUTAS_LINGUA.expresiones}
      titulo="Biblioteca de expresiones"
      sub="Fórmulas de cada día en cientos de lenguas, tomadas de las tablas de traducción de Wiktionary. Lingua conserva las notas de uso de la fuente (por la mañana, a un hombre, formal…) porque una traducción sin su matiz puede ser incorrecta."
      fuente={<>{FUENTE_EXPRESIONES}</>}
    >
      <Migas pasos={[{ href: RUTAS_LINGUA.inicio, label: "Lingua" }, { label: "Expresiones" }]} />
      {Object.entries(CATEGORIAS).map(([k, c]) => {
        const items = lista.filter((e) => e.categoria === k);
        if (!items.length) return null;
        return (
          <section key={k} className="vx-li-seccion">
            <h2>{c.nombre}</h2>
            <p className="vx-li-nota">{c.nota}</p>
            <div className="vx-li-rejilla tres">
              {items.map((e) => {
                const muestra = ["fr", "ja", "sw", "qu", "ar", "ru"].map((code) => e.t[code]?.[0]?.[0]).filter(Boolean).slice(0, 3);
                return (
                  <Link key={e.id} href={rutaExpresion(e.id)} className="vx-li-tarjeta">
                    <h3>{e.es}</h3>
                    <p>{muestra.join(" · ")}</p>
                    <small>{Object.keys(e.t).length} lenguas</small>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </MarcoLingua>
  );
}

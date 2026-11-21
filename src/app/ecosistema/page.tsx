// ═══════════════════════════════════════════════════════════════════
// v422.1 REBIRTH · /ecosistema — la misma composición de la portada, con
// URL propia.
//
// POR QUÉ EXISTE: la portada enseña las diez familias, pero una sección de
// portada no se puede enlazar desde fuera ni aparece como puerta propia. Esta
// página monta EL MISMO COMPONENTE (`Ecosistema`) — no una copia — y añade lo
// que solo tiene sentido en una página suelta: un índice de las cuarenta
// experiencias y la explicación de cómo se mantiene la lista.
// ═══════════════════════════════════════════════════════════════════

import type { Metadata } from "next";
import Link from "next/link";
import "@/components/experiencia/experiencia.css";
import { Ecosistema } from "@/components/experiencia/ecosistema";
import { EJES, EXPERIENCIAS, cifrasEcosistema } from "@/lib/experiencia/registro";

export const metadata: Metadata = {
  title: "El ecosistema · las diez familias de Vanguard",
  description:
    "Las diez familias de Vanguard —actualidad, geografía, historia, ciencia, economía y datos, educación, simulaciones, narrativa, investigación y nuevos mundos— con sus cuarenta experiencias y sus cifras reales.",
  alternates: { canonical: "/ecosistema" },
};

export default function PaginaEcosistema() {
  const c = cifrasEcosistema();

  return (
    <div className="vxe-pagina">
      <header className="vxe-pagina-cab">
        <p className="vxe-eco-sello">VANGUARD · MAPA DE LA CASA</p>
        <h1 className="vxe-ent-titulo" style={{ fontSize: "clamp(28px, 4.6vw, 52px)" }}>
          Un ecosistema, <em>no una colección de herramientas</em>
        </h1>
        <p className="vxe-ent-lema" style={{ marginBottom: 18 }}>
          {c.ejes} familias, {c.experiencias} experiencias, {c.paises} países con ficha,{" "}
          {c.publicaciones} publicaciones con identificador y {c.lecciones} lecciones. Todo con la
          misma barra arriba y tu recorrido guardado en tu aparato.
        </p>
      </header>

      <Ecosistema />

      <section className="vxe-pagina-indice" aria-labelledby="vxe-indice-titulo">
        <h2 id="vxe-indice-titulo" className="vxe-viva-titulo">
          Índice de las {EXPERIENCIAS.length} experiencias
        </h2>
        <p className="vxe-viva-sub">
          Esta lista no se escribe aquí: sale del registro que también alimenta la portada. Si una
          experiencia cambia de ruta, cambia en los dos sitios a la vez.
        </p>
        <div className="vxe-indice-cols">
          {EJES.map((eje) => (
            <div key={eje.id} className="vxe-indice-col" style={{ ["--eje" as string]: eje.color }}>
              <h3>
                <span aria-hidden>{eje.numero}</span> {eje.nombre}
              </h3>
              <ul>
                {eje.experiencias.map((x) => (
                  <li key={x.href}>
                    <Link href={x.href}>{x.nombre}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <footer className="vxe-pagina-pie">
        <p>
          ¿Prefieres buscar por nombre? <Link href="/directorio">El directorio</Link> lista todas
          las salas; <Link href="/nucleo">el Núcleo</Link> busca dentro de todas a la vez, y la{" "}
          <Link href="/navegacion">Travesía</Link> recuerda por dónde ibas.
        </p>
      </footer>
    </div>
  );
}

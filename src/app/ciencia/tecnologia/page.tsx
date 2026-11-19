// ============================================================
// v421.9 AVANCES TECNOLÓGICOS — la herramienta detrás del hallazgo.
// Cada tecnología declara su madurez (en uso / en desarrollo) y su
// límite. No se anuncia nada como disponible si no lo está.
// ============================================================
import type { Metadata } from "next";
import Link from "next/link";
import { MarcoCiencia, Migas, SelloNivel, SelloTipo } from "@/components/ciencia/piezas";
import { TECNOLOGIAS, publicacionDe, rutaPublicacion } from "@/lib/ciencia/indice";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Avances tecnológicos · Science Frontier",
  description:
    "Interferometría, óptica criogénica, fotometría de tránsito, espectroscopía, imanes superconductores y materiales bidimensionales: madurez, límite y publicaciones asociadas.",
  alternates: { canonical: `${SITE_URL}/ciencia/tecnologia` },
};

const COLOR_MADUREZ: Record<string, string> = { "en uso": "#34d399", "en desarrollo": "#fbbf24", promesa: "#fb7185" };

export default function Page() {
  const porTipo = new Map<string, typeof TECNOLOGIAS>();
  for (const t of TECNOLOGIAS) porTipo.set(t.tipo, [...(porTipo.get(t.tipo) ?? []), t]);

  return (
    <MarcoCiencia activa="/ciencia/tecnologia">
      <Migas pasos={[{ href: "/ciencia", label: "Science Frontier" }, { label: "Tecnología" }]} />
      <p className="vx-sc-volanta">Avances tecnológicos</p>
      <h1>
        La herramienta
        <br />
        <em>antes que el titular</em>.
      </h1>
      <p className="vx-sc-sub">
        {TECNOLOGIAS.length} tecnologías que hicieron posibles los registros de este índice —o que salieron de ellos—.
        Cada una declara su madurez real y su límite: ninguna se vende como resuelta.
      </p>

      {[...porTipo.entries()].map(([tipo, lista]) => (
        <section className="vx-sc-seccion" key={tipo}>
          <header>
            <h2>{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</h2>
            <span className="vx-sc-kicker">{lista.length} entradas</span>
          </header>
          <div className="vx-sc-lista">
            {lista.map((t) => (
              <article key={t.id} id={t.id} className="vx-sc-ficha" style={{ scrollMarginTop: 80 }}>
                <div className="vx-sc-sellos">
                  <span className="vx-sc-sello-tipo" style={{ color: COLOR_MADUREZ[t.madurez] ?? "#cbd5e1" }}>
                    {t.madurez}
                  </span>
                  <span className="vx-sc-meta">{t.publicaciones.length} publicaciones</span>
                </div>
                <h3 style={{ fontSize: 18 }}>{t.nombre}</h3>
                <p>{t.descripcion}</p>
                <p className="vx-sc-cautela" style={{ margin: 0 }}>
                  Límite: {t.limite}
                </p>
                <div className="vx-sc-lista" style={{ gap: 6, margin: 0 }}>
                  {t.publicaciones.map((pid) => {
                    const p = publicacionDe(pid);
                    if (!p) return null;
                    return (
                      <div key={pid} className="vx-sc-meta" style={{ flexWrap: "wrap", gap: 6 }}>
                        <SelloTipo tipo={p.tipo} />
                        <SelloNivel nivel={p.nivel} />
                        <Link href={rutaPublicacion(pid)} style={{ color: "#22d3ee", fontSize: 12.5 }}>
                          {p.anio} · {p.titulo}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </MarcoCiencia>
  );
}

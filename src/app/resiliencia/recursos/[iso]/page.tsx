import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { SITE_URL } from "@/lib/site";
import { PAISES, NOTA_VERIFICACION, type Organismo } from "@/lib/resiliencia/organismos";
import { PELIGRO_POR_ID } from "@/lib/resiliencia/peligros";
import { POR_ISO2 } from "@/lib/geo-paises";
import { ENCUADRE, seccionesOrdenadas } from "@/lib/resiliencia/secciones";
import { Pictograma } from "@/components/resiliencia/pictograma";
import { slug } from "@/components/resiliencia/bloques";

// ═══════════════════════════════════════════════════════════════════
// v420.1 · MISIÓN 09 · ENTREGABLE 15 — RECURSOS OFICIALES POR PAÍS
//
// La página que conecta el centro con la geografía: cada país con ficha
// propia tiene aquí su número, su forma de avisar, su marco legal y sus
// organismos. Se genera desde PAISES (el mismo objeto que pinta el
// directorio), así que un país nuevo del directorio aparece aquí sin tocar
// esta ruta, y un país que no existe en el censo geográfico responde 404 en
// vez de mentir con una ficha huérfana.
// ═══════════════════════════════════════════════════════════════════

export const dynamic = "force-static";

type Props = { params: Promise<{ iso: string }> };

export function generateStaticParams() {
  return Object.keys(PAISES).map((iso) => ({ iso }));
}

function buscar(iso: string | undefined) {
  if (!iso) return null;
  const clave = iso.toLowerCase();
  const dato = PAISES[clave];
  if (!dato) return null;
  const geo = POR_ISO2.get(clave);
  if (!geo) return null;
  return { dato, geo };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { iso } = await params;
  const hallado = buscar(iso);
  if (!hallado) return { title: "País sin ficha de recursos · VANGUARD" };
  const titulo = `Protección civil y resiliencia en ${hallado.geo.nombre} — VANGUARD`;
  return {
    title: titulo,
    description: `A quién llamar, cómo llega el aviso, qué marco rige y qué organismos responden en ${hallado.geo.nombre}, con los peligros habituales de su territorio y su conexión con la ficha geográfica. ${NOTA_VERIFICACION.slice(0, 80)}`,
    alternates: { canonical: `${SITE_URL}/resiliencia/recursos/${hallado.geo.iso2}` },
    openGraph: { title: titulo, description: ENCUADRE.texto.slice(0, 150), url: `${SITE_URL}/resiliencia/recursos/${hallado.geo.iso2}`, type: "article" },
  };
}

function Nivel({ nivel }: { nivel: Organismo["nivel"] }) {
  const texto: Record<Organismo["nivel"], string> = {
    nacional: "nacional",
    regional: "regional",
    local: "local",
    sociedad: "sociedad de socorro",
  };
  return (
    <span className="rounded border border-zinc-800 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-zinc-500">
      {texto[nivel]}
    </span>
  );
}

export default async function RecursosPais({ params }: Props) {
  const { iso } = await params;
  const hallado = buscar(iso);
  if (!hallado) notFound();
  const { dato: p, geo } = hallado;
  const secciones = seccionesOrdenadas();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "GovernmentService",
    name: `Recursos de protección civil y resiliencia en ${geo.nombre}`,
    serviceType: "Prevención, preparación y recuperación comunitaria",
    areaServed: { "@type": "Country", name: geo.nombre },
    description: `Ficha educativa de ${geo.nombre}: número de emergencias cuando es de dominio público, cómo llega el aviso oficial, marco de protección civil, organismos y peligros habituales.`,
    url: `${SITE_URL}/resiliencia/recursos/${geo.iso2}`,
    publisher: { "@type": "Organization", name: "VANGUARD", url: SITE_URL },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }} />
      <main className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-200 sm:px-5">
        <div className="mx-auto max-w-5xl">
          <nav aria-label="Volver" className="flex flex-wrap items-center gap-3 text-[12px]">
            <Link href="/resiliencia" className="font-mono uppercase tracking-widest text-teal-400 hover:text-teal-300">
              ← Centro de resiliencia
            </Link>
            <span className="text-zinc-700">·</span>
            <Link href="/resiliencia/organismos" className="text-zinc-400 hover:text-zinc-200">
              Directorio de organismos
            </Link>
          </nav>

          <header className="mt-6 border-b border-zinc-900 pb-6">
            <p className="font-mono text-[11px] uppercase tracking-widest text-teal-400">
              ◈ VANGUARD · RECURSOS POR PAÍS · {geo.iso2.toUpperCase()}
            </p>
            <h1 className="mt-2 text-2xl font-bold text-zinc-100 sm:text-3xl">{geo.nombre}</h1>
            <p className="mt-2 text-[13px] text-zinc-400">
              {geo.region} · {geo.subregion} · centro geográfico {geo.lat.toFixed(2)}, {geo.lng.toFixed(2)}
            </p>
          </header>

          <section className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-teal-500/30 bg-teal-500/[0.06] p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-teal-300">Número de emergencias</p>
              <p className="mt-1.5 font-mono text-3xl text-zinc-100">{p.numero ?? "—"}</p>
              <p className="mt-1.5 text-[11.5px] leading-5 text-zinc-500">
                {p.numero
                  ? "Confírmalo en tu municipio: los números cambian y las redes locales no siempre los reflejan."
                  : "Este país no tiene un número único en el dominio público consultado: cada servicio mantiene el suyo. Anota los de tu localidad."}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:col-span-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Cómo llega el aviso</p>
              <p className="mt-1.5 text-[13px] leading-6 text-zinc-300">{p.aviso}</p>
            </div>
          </section>

          {p.otrosNumeros.length ? (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {p.otrosNumeros.map((o) => (
                <li key={o.texto} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
                  <p className="font-mono text-[12.5px] text-zinc-100">{o.texto}</p>
                  <p className="mt-1 text-[11.5px] leading-5 text-zinc-500">{o.nota}</p>
                </li>
              ))}
            </ul>
          ) : null}

          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="text-[15px] font-semibold text-zinc-100">Quién responde</h2>
              <ul className="mt-3 space-y-2">
                {p.organismos.map((o) => (
                  <li key={o.nombre} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3.5">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <p className="text-[13.5px] font-semibold text-zinc-100">{o.nombre}</p>
                      {o.siglas ? <span className="font-mono text-[11px] text-teal-300">{o.siglas}</span> : null}
                      <Nivel nivel={o.nivel} />
                    </div>
                    <p className="mt-1 text-[12.5px] leading-6 text-zinc-400">{o.rol}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
                <h2 className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">El marco</h2>
                <p className="mt-1.5 text-[13px] leading-6 text-zinc-300">{p.marco}</p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
                <h2 className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                  Peligros habituales en el territorio
                </h2>
                <p className="mt-1.5 text-[11.5px] leading-5 text-zinc-500">
                  Índice de lectura, según la bibliografía pública de los organismos: no es un ranking, no es una
                  predicción y no dice que hoy vaya a pasar nada.
                </p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {p.peligros.map((id) => {
                    const ficha = PELIGRO_POR_ID[id];
                    if (!ficha) return null;
                    return (
                      <li key={id}>
                        <Link
                          href={`/resiliencia/peligros#${slug(ficha.nombre)}`}
                          className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950/60 px-2.5 py-1.5 text-[11.5px] text-zinc-300 hover:border-teal-500/40 hover:text-teal-200"
                        >
                          <Pictograma nombre={ficha.icono} className="h-3.5 w-3.5" />
                          {ficha.nombre}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
              {p.notas.length ? (
                <ul className="space-y-2">
                  {p.notas.map((n) => (
                    <li key={n} className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3 text-[12.5px] leading-6 text-zinc-400">
                      {n}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>

          <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
            <h2 className="text-[15px] font-semibold text-zinc-100">Qué hacer con esta ficha, esta semana</h2>
            <ol className="mt-3 grid gap-2 sm:grid-cols-2">
              {[
                `Anota ${p.numero ?? "el número de emergencias de tu municipio"} en la nevera y en la mochila.`,
                "Busca el canal oficial de aviso de tu zona y actívalo en el móvil.",
                "Escribe en el plan familiar quién avisa a los tres vecinos que lo necesitan.",
                "Marca la lista de la mochila y la de revisión de la vivienda.",
                `Lee las fichas de los peligros habituales de ${geo.nombre}.`,
                "Haz el simulacro de dos minutos: salida de casa con las luces apagadas.",
              ].map((t, i) => (
                <li key={i} className="flex gap-2.5 text-[13px] leading-6 text-zinc-300">
                  <span className="font-mono text-[11px] text-teal-300">{String(i + 1).padStart(2, "0")}</span>
                  {t}
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-10">
            <h2 className="text-[15px] font-semibold text-zinc-100">El centro, entero</h2>
            <ul className="mt-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
              {secciones.map((s) => (
                <li key={s.id}>
                  <Link href={`/resiliencia/${s.id}`} className="block truncate rounded px-2 py-1 text-[12.5px] text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200">
                    {String(s.n).padStart(2, "0")} · {s.titulo}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <nav aria-label="El país, en el resto de la casa" className="mt-8 flex flex-wrap gap-2">
            <Link href={`/mundos/${geo.iso2}`} className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-[12.5px] text-zinc-300 hover:border-teal-500/40 hover:text-teal-200">
              Ficha geográfica de {geo.nombre}
            </Link>
            <Link href="/regiones" className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-[12.5px] text-zinc-300 hover:border-teal-500/40 hover:text-teal-200">
              Su región ({geo.subregion})
            </Link>
            <Link href="/atlas" className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-[12.5px] text-zinc-300 hover:border-teal-500/40 hover:text-teal-200">
              El atlas
            </Link>
            <Link href="/mapas" className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-[12.5px] text-zinc-300 hover:border-teal-500/40 hover:text-teal-200">
              Verlo en el globo
            </Link>
            <Link href="/pulso-mundial" className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-[12.5px] text-zinc-300 hover:border-teal-500/40 hover:text-teal-200">
              Datos vivos del planeta
            </Link>
            <Link href="/resiliencia/evaluacion" className="rounded-lg bg-teal-400 px-3 py-2 text-[12.5px] font-semibold text-zinc-950 hover:bg-teal-300">
              Evaluar la preparación
            </Link>
          </nav>

          <aside className="mt-8 rounded-lg border border-amber-500/25 bg-amber-500/[0.06] p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-amber-300">Verificación</p>
            <p className="mt-1.5 text-[12.5px] leading-6 text-zinc-300">{NOTA_VERIFICACION}</p>
            <p className="mt-2 text-[12.5px] leading-6 text-zinc-500">{ENCUADRE.texto}</p>
          </aside>
        </div>
      </main>
    </>
  );
}

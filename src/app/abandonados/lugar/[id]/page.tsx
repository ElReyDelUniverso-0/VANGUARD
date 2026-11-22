// ═══════════════════════════════════════════════════════════════════
// v441.3 · /abandonados/lugar/[id] — LA FICHA COMPLETA DE UN LUGAR
// Portada, historia, razones del abandono, cronología, estado actual,
// cómo conocerlo con seguridad (solo vías oficiales o puntos públicos),
// fotografías con crédito y fuentes. Estática: 35 páginas en el build.
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE_URL } from "@/lib/site";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { LUGARES, META_CATEGORIA, lugarPorId } from "@/lib/abandonados/lugares";
import { FOTOS_ABANDONO } from "@/lib/abandonados/fotos";
import { CreditoFoto, FichaCuerpo } from "@/components/abandonados/ficha-cuerpo";
import { MapaAbandonos } from "@/components/abandonados/mapa-abandonos";
import "@/components/abandonados/abandonados.css";

export const revalidate = 86400;
export const dynamicParams = false;

export function generateStaticParams() {
  return LUGARES.map((l) => ({ id: l.id }));
}

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const l = lugarPorId(id);
  if (!l) return { title: "Lugar no encontrado | VANGUARD" };
  const foto = FOTOS_ABANDONO[l.id]?.[0];
  return {
    title: `${l.nombre} (${l.pais}): historia y abandono | Abandoned World · VANGUARD`,
    description: `${l.resumen} Historia, razones del abandono, cronología, estado actual y cómo conocerlo de forma segura y legal.`,
    alternates: { canonical: `${SITE_URL}/abandonados/lugar/${l.id}` },
    openGraph: foto ? { images: [{ url: `${SITE_URL}${foto.src}`, width: foto.w, height: foto.h }] } : undefined,
  };
}

export default async function LugarPage({ params }: Props) {
  const { id } = await params;
  const l = lugarPorId(id);
  if (!l) notFound();
  const m = META_CATEGORIA[l.categoria];
  const fotos = FOTOS_ABANDONO[l.id] ?? [];
  const portada = fotos[0];
  const i = LUGARES.findIndex((x) => x.id === l.id);
  const prev = LUGARES[(i - 1 + LUGARES.length) % LUGARES.length];
  const next = LUGARES[(i + 1) % LUGARES.length];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LandmarksOrHistoricalBuildings",
    name: l.nombre,
    description: l.resumen,
    url: `${SITE_URL}/abandonados/lugar/${l.id}`,
    geo: { "@type": "GeoCoordinates", latitude: l.lat, longitude: l.lon },
    address: { "@type": "PostalAddress", addressCountry: l.iso2, addressRegion: l.region },
    image: portada ? `${SITE_URL}${portada.src}` : undefined,
  };

  return (
    <main className="aw aw-pag" style={{ ["--c" as string]: m.color }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }} />
      <div className="aw-caja">
        <nav className="aw-migas" aria-label="Migas">
          <Link href="/">Vanguard</Link>
          <span>·</span>
          <Link href="/abandonados">Abandoned World</Link>
          <span>·</span>
          <Link href={`/abandonados?cat=${l.categoria}`}>{m.nombre}</Link>
        </nav>
        <header>
          <p className="aw-volanta" style={{ color: m.color }}>
            {m.icono} {m.corto} · {l.pais} · {l.epoca}
          </p>
          <h1 className="aw-titulo">{l.nombre}</h1>
          <p className="aw-sub">
            {l.resumen} <span style={{ color: "var(--gris)" }}>({l.region})</span>
          </p>
        </header>

        {portada ? (
          <>
            <img className="aw-portada" src={portada.src} width={portada.w} height={portada.h} alt={`${l.nombre}: ${portada.titulo}`} fetchPriority="high" />
            <p className="aw-portada-cap">
              <CreditoFoto f={portada} />
            </p>
          </>
        ) : null}

        <aside className="aw-aviso" role="note" aria-label="Aviso de seguridad">
          <span className="aw-aviso-ico" aria-hidden="true">!</span>
          <p>
            <strong>Mira, no entres.</strong> Conoce este lugar solo por vías oficiales o desde puntos públicos. Entrar sin permiso en recintos cerrados es
            ilegal en la mayoría de países y puede ser mortal.
          </p>
        </aside>

        <FichaCuerpo lugar={l} fotos={fotos} saltarPrimera />

        <h2>En el mapa</h2>
        <MapaAbandonos enlaceFicha />

        <nav className="aw-nav-lugar" aria-label="Otros lugares">
          <Link href={`/abandonados/lugar/${prev.id}`}>← {prev.nombre}</Link>
          <Link href="/abandonados">Todo el atlas</Link>
          <Link href={`/abandonados/lugar/${next.id}`}>{next.nombre} →</Link>
        </nav>
      </div>
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════════
// v441.3 · /abandonados — ABANDONED WORLD
// Atlas interactivo de lugares abandonados y estructuras olvidadas:
// mapa mundial, ciudades fantasma, hospitales históricos, hoteles y
// parques desiertos, instalaciones industriales, galería documental y
// fichas desplegables con historia, razones del abandono y cronología.
//
// Solo lugares documentados y públicos. El atlas no enseña a colarse:
// cada ficha dice cómo conocer el sitio por vías oficiales o desde
// puntos públicos, y advierte de los riesgos.
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { CATEGORIAS, LUGARES, META_ACCESO, META_CATEGORIA, cifrasAbandono } from "@/lib/abandonados/lugares";
import { FOTOS_ABANDONO } from "@/lib/abandonados/fotos";
import { MapaAbandonos } from "@/components/abandonados/mapa-abandonos";
import { FichaCuerpo } from "@/components/abandonados/ficha-cuerpo";
import { ExploradorAbandonos } from "@/components/abandonados/explorador-abandonos";
import "@/components/abandonados/abandonados.css";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Abandoned World: atlas de lugares abandonados del mundo | VANGUARD",
  description:
    "Atlas interactivo de lugares abandonados documentados: ciudades fantasma como Prípiat o Kolmanskop, hospitales históricos, hoteles y parques desiertos e instalaciones industriales. Mapa mundial, fotografías documentales, historia, razones del abandono y cronologías.",
  alternates: { canonical: `${SITE_URL}/abandonados` },
};

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AbandonadosPage({ searchParams }: Props) {
  const sp = await searchParams;
  const pedida = typeof sp.cat === "string" ? sp.cat : "";
  const inicial = (CATEGORIAS as string[]).includes(pedida) ? pedida : "todos";
  const cifras = cifrasAbandono();

  return (
    <main className="aw">
      <div className="aw-caja">
        <nav className="aw-migas" aria-label="Migas">
          <Link href="/">Vanguard</Link>
          <span>·</span>
          <span>Abandoned World</span>
        </nav>

        <header>
          <p className="aw-volanta">Atlas de lugares abandonados y estructuras olvidadas</p>
          <h1 className="aw-titulo">
            Los lugares que el mundo <em>dejó atrás</em>
          </h1>
          <p className="aw-sub">
            Un atlas de ciudades fantasma, hospitales históricos, hoteles y parques desiertos e instalaciones industriales olvidadas. Cada ficha cuenta qué
            fue el lugar, por qué se vació y qué queda hoy, con fotografías documentales de licencia libre y sus fuentes.
          </p>
        </header>

        <div className="aw-cifras">
          <div className="aw-cifra">
            <b>{cifras.total}</b>
            <span>lugares documentados</span>
          </div>
          <div className="aw-cifra">
            <b>{cifras.paises}</b>
            <span>países</span>
          </div>
          <div className="aw-cifra">
            <b>{cifras.visitables}</b>
            <span>con visita oficial</span>
          </div>
          <div className="aw-cifra">
            <b>{Object.values(FOTOS_ABANDONO).reduce((n, f) => n + f.length, 0)}</b>
            <span>fotografías documentales</span>
          </div>
        </div>

        <aside className="aw-aviso" role="note" aria-label="Aviso de seguridad">
          <span className="aw-aviso-ico" aria-hidden="true">!</span>
          <p>
            <strong>Mira, no entres.</strong> Este atlas recopila lugares documentados y públicos con fines culturales e históricos. No promueve la entrada
            ilegal ni la exploración peligrosa: muchos de estos sitios son propiedad privada, zonas militares o lugares de memoria, y tienen suelos
            hundidos, amianto, radiación o estructuras a punto de caer. Visítalos solo con recorridos oficiales o desde los puntos públicos que indica
            cada ficha.
          </p>
        </aside>

        <ExploradorAbandonos
          inicial={inicial}
          total={LUGARES.length}
          opciones={cifras.porCat.map((c) => ({
            id: c.categoria,
            nombre: META_CATEGORIA[c.categoria].nombre,
            color: META_CATEGORIA[c.categoria].color,
            cantidad: c.cantidad,
          }))}
        >
          <h2 className="aw-h2">Mapa mundial</h2>
          <MapaAbandonos />

          <h2 className="aw-h2">Galería documental</h2>
          <div className="aw-galeria">
            {LUGARES.map((l) => (
              <a key={l.id} href={`#lugar-${l.id}`} className="aw-gal" data-cat={l.categoria} style={{ ["--c" as string]: META_CATEGORIA[l.categoria].color }}>
                <img src={`/abandonados/mini/${l.id}.jpg`} width={440} height={330} alt={l.nombre} loading="lazy" decoding="async" />
                <b aria-hidden="true" />
                <span>
                  {l.nombre}
                  <small>
                    {l.pais} · {l.epoca}
                  </small>
                </span>
              </a>
            ))}
          </div>

          <h2 className="aw-h2">Fichas</h2>
          <div className="aw-fichas">
            {LUGARES.map((l) => {
              const m = META_CATEGORIA[l.categoria];
              const acc = META_ACCESO[l.acceso.tipo];
              return (
                <details key={l.id} id={`lugar-${l.id}`} className="aw-ficha" data-cat={l.categoria} style={{ ["--c" as string]: m.color }}>
                  <summary>
                    <img src={`/abandonados/mini/${l.id}.jpg`} width={440} height={330} alt="" loading="lazy" decoding="async" />
                    <div>
                      <h3 className="aw-ficha-nombre">{l.nombre}</h3>
                      <p className="aw-ficha-meta">
                        <span className="aw-cat">
                          {m.icono} {m.corto}
                        </span>
                        <span>
                          {l.pais} · {l.region}
                        </span>
                        <span>{l.epoca}</span>
                        <span className={`aw-acc ${acc.clase}`}>{acc.etiqueta}</span>
                      </p>
                      <p className="aw-ficha-res">{l.resumen}</p>
                    </div>
                    <span className="aw-mas" aria-hidden="true">
                      +
                    </span>
                  </summary>
                  <div className="aw-cuerpo">
                    <FichaCuerpo lugar={l} fotos={FOTOS_ABANDONO[l.id] ?? []} />
                    <div className="aw-pie-ficha">
                      <Link className="aw-boton" href={`/abandonados/lugar/${l.id}`}>
                        Abrir la ficha completa →
                      </Link>
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        </ExploradorAbandonos>

        <footer className="aw-pie">
          Textos de VANGUARD elaborados a partir de las fuentes citadas en cada ficha (sobre todo Wikipedia y medios locales). Fotografías de Wikimedia
          Commons con licencias libres; el autor y la licencia de cada imagen figuran bajo la foto. Mapa base: Natural Earth. Si detectas un dato
          desactualizado —muchos de estos lugares cambian de estado—, la fuente enlazada manda.
        </footer>
      </div>
    </main>
  );
}

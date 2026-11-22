import type { Metadata } from "next";
import Link from "next/link";
import { PortadaSala } from "@/components/vanguard/portada-sala";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { SITE_URL } from "@/lib/site";
import { CENTRO_META, cifrasCentro, ENCUADRE, FUENTES_CENTRO, seccionesOrdenadas } from "@/lib/resiliencia/secciones";
import { ITEMS, CATEGORIAS } from "@/lib/resiliencia/evaluador";
import { PAISES_CON_RECURSOS } from "@/lib/resiliencia/organismos";
import { PAISES_GEO } from "@/lib/geo-paises";
import { CuadroEntrada } from "@/components/resiliencia/cuadro-entrada";

// ═══════════════════════════════════════════════════════════════════
// v420.1 · MISIÓN 09 — VANGUARD CIVIL RESILIENCE
// El CENTRO DE PREVENCIÓN, PREPARACIÓN Y RESILIENCIA DE COMUNIDADES.
//
// El encargo del Dueño lo decía con una frase que hay que respetar: «no es
// otro observatorio meteorológico». Este centro no informa de lo que está
// pasando: enseña a estar listo. Por eso
//   · no emite alertas ni declara emergencias (ENCUADRE, repetido en cada
//     página del centro);
//   · no publica ninguna instrucción de violencia, ataque o sabotaje;
//   · cita a los organismos reconocidos en el texto, sin enlaces exteriores
//     (regla de oro de la casa);
//   · y su herramienta, COMMUNITY RESILIENCE, da una lectura ORIENTATIVA:
//     nunca una certificación.
//
// Sala de SERVIDOR puro (patrón /oscura, /historia, /atlas): prerenderizada,
// cero JavaScript, indexable, y con las cifras derivadas del dato — nadie
// escribe un número a mano en esta casa.
// ═══════════════════════════════════════════════════════════════════

export const dynamic = "force-static";

const SECCIONES = seccionesOrdenadas();
const CIFRAS = cifrasCentro();

export const metadata: Metadata = {
  title: "VANGUARD CIVIL RESILIENCE — centro de prevención, preparación y resiliencia comunitaria",
  description:
    `Quince secciones y una herramienta educativa: guías por emergencia, fichas de peligros naturales, continuidad familiar, protección civil, directorio de organismos oficiales, prevención, recuperación, listas de preparación, accesibilidad, cortes de agua y luz, glosario y recursos por país. ${ENCUADRE.texto.slice(0, 90)}`,
  alternates: { canonical: `${SITE_URL}/resiliencia` },
  openGraph: {
    title: `${CENTRO_META.nombre} — ${CENTRO_META.subtitulo}`,
    description: CENTRO_META.lema,
    url: `${SITE_URL}/resiliencia`,
    type: "website",
  },
};

export default function CentroResiliencia() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${CENTRO_META.nombre} — ${CENTRO_META.subtitulo}`,
    description: CENTRO_META.lema,
    url: `${SITE_URL}/resiliencia`,
    inLanguage: "es",
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: SECCIONES.length + 1,
      itemListElement: [
        ...SECCIONES.map((s) => ({ name: s.titulo, description: s.lema })),
        { name: "COMMUNITY RESILIENCE", description: "Evaluación educativa de la preparación comunitaria, seis categorías, resultado orientativo." },
      ].map((it, i) => ({ position: i + 1, name: it.name, description: it.description })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }} />

      <PortadaSala ruta="/resiliencia"
        imagen="/imagenes-reales/panama.jpg"
        alt="Manos que sostienen mantas, agua embotellada y linternas sobre una mesa de trabajo"
        volanta="VANGUARD · CENTRO CIVIL"
        titulo={CENTRO_META.nombre}
        sumario={CENTRO_META.lema}
        acento="#2dd4bf"
        prioritaria
        // la portada no firma el título: la página ya tiene su <h1> más abajo
        nivel="p"
        cifras={CIFRAS.slice(0, 6).map((c) => ({ valor: c.valor, etiqueta: c.etiqueta, nota: c.nota }))}
        puntos={[
          {
            titulo: "PREVENCIÓN",
            texto: "Fichas de peligro y recomendaciones por ámbito: qué se puede hacer hoy, en casa, en el portal y en el ayuntamiento.",
          },
          {
            titulo: "PREPARACIÓN",
            texto: "Guías por emergencia, plan familiar, listas marcables y la herramienta que dice por dónde empezar.",
          },
          {
            titulo: "RECUPERACIÓN",
            texto: "Volver, reparar, documentar, apoyarse y dejar el sitio más seguro que antes. Y un barrio que se recupera no se despuebla.",
          },
          {
            titulo: "LO QUE ESTE CENTRO NO HACE",
            texto: "No emite alertas, no declara emergencias, no certifica a nadie y no da instrucciones de daño. Eso es trabajo de la autoridad oficial.",
          },
        ]}
        anclas={[
          ...SECCIONES.slice(0, 4).map((s) => ({ etiqueta: s.titulo.toLowerCase(), href: `#${s.id}` })),
          { etiqueta: "la herramienta", href: "#herramienta" },
          { etiqueta: "los países", href: "#paises" },
        ]}
        nota={`Portada de la casa (viaja en el repositorio). Las siete cifras salen del propio registro del centro, calculadas en el render: ${CIFRAS.length} medidas, cero escritas a mano.`}
      />

      <main className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-200 sm:px-5">
        <div className="mx-auto max-w-5xl">
          <p className="font-mono text-[11px] uppercase tracking-widest text-teal-400">◈ VANGUARD · MISIÓN 09</p>
          <h1 className="mt-2 text-2xl font-bold text-zinc-100 sm:text-3xl">{CENTRO_META.subtitulo}</h1>

          <div className="mt-4 space-y-3">
            {CENTRO_META.texto.map((p, i) => (
              <p key={i} className="max-w-3xl text-[15px] leading-7 text-zinc-300">
                {p}
              </p>
            ))}
          </div>

          <Encuadre />

          {/* ── LAS QUINCE SECCIONES ─────────────────────────────── */}
          <section className="mt-12">
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">El centro entero</p>
            <h2 className="mt-1 text-lg font-semibold text-zinc-100">Las quince secciones</h2>
            <p className="mt-1 text-[13px] text-zinc-400">
              El orden es el del encargo: primero lo que hay que saber, después lo que hay que hacer, al final lo que
              hay que reclamar y aprender.
            </p>
            <ol className="mt-5 grid gap-2 sm:grid-cols-2">
              <li>
                <span className="flex h-full flex-col justify-between rounded-xl border border-teal-500/25 bg-teal-500/[0.06] p-4">
                  <span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-teal-300">01 · la puerta</span>
                    <span className="mt-1 block text-[15px] font-semibold text-zinc-100">Centro de preparación comunitaria</span>
                    <span className="mt-1 block text-[12.5px] leading-6 text-zinc-400">
                      Esta página: el índice, el encuadre, la evaluación y las fuentes.
                    </span>
                  </span>
                  <span className="mt-3 block text-[11.5px] text-zinc-500">Estás aquí.</span>
                </span>
              </li>
              {SECCIONES.map((s) => (
                <li key={s.id} id={s.id} className="scroll-mt-20">
                  <Link
                    href={`/resiliencia/${s.id}`}
                    className="flex h-full flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 hover:border-teal-500/40"
                  >
                    <span>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                        {String(s.n).padStart(2, "0")} · {s.icono}
                      </span>
                      <span className="mt-1 block text-[15px] font-semibold text-zinc-100">{s.titulo}</span>
                      <span className="mt-1 block text-[12.5px] leading-6 text-zinc-400">{s.lema}</span>
                    </span>
                    <span className="mt-3 block font-mono text-[11px] text-teal-300">Abrir sección →</span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          {/* ── LA HERRAMIENTA ──────────────────────────────────── */}
          <section id="herramienta" className="mt-12 scroll-mt-20 rounded-2xl border border-teal-500/25 bg-teal-500/[0.05] p-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-teal-300">La herramienta de la MISIÓN 09</p>
            <h2 className="mt-1 text-xl font-semibold text-zinc-100">COMMUNITY RESILIENCE</h2>
            <p className="mt-2 max-w-3xl text-[13.5px] leading-6 text-zinc-300">
              Un evaluador educativo de la preparación de tu comunidad sobre seis categorías: información y
              comunicación, acceso a servicios, educación preventiva, inclusión de personas vulnerables, continuidad
              de servicios esenciales y recuperación comunitaria. {ITEMS.length} preguntas, {CATEGORIAS.length} ejes,
              una lectura orientativa y un «por dónde empezar».
            </p>
            <p className="mt-2 max-w-3xl text-[12.5px] leading-6 text-zinc-500">
              El resultado no es un certificado ni una nota oficial: es una brújula para la próxima reunión del barrio.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/resiliencia/evaluacion"
                className="rounded-lg bg-teal-400 px-4 py-2.5 text-[13px] font-semibold text-zinc-950 hover:bg-teal-300"
              >
                Hacer la evaluación
              </Link>
              <Link
                href="/resiliencia/evaluacion#como-se-leen"
                className="rounded-lg border border-teal-500/40 px-4 py-2.5 text-[13px] text-teal-200 hover:bg-teal-500/10"
              >
                Cómo se lee el resultado
              </Link>
            </div>
          </section>

          {/* ── LOS PAÍSES ──────────────────────────────────────── */}
          <section id="paises" className="mt-12 scroll-mt-20">
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Con conexión geográfica</p>
            <h2 className="mt-1 text-lg font-semibold text-zinc-100">Recursos oficiales por país</h2>
            <p className="mt-1 max-w-3xl text-[13px] leading-6 text-zinc-400">
              {PAISES_CON_RECURSOS.length} países con ficha propia —a quién llamar, cómo llega el aviso, qué marco
              rige y quién responde—, cada uno enlazado con su ficha geográfica y con su región. La ficha de país y la
              ficha de recursos son las dos mitades de la misma pregunta: qué terreno piso y quién me cuida en él.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {PAISES_CON_RECURSOS.map((iso) => (
                <Link
                  key={iso}
                  href={`/resiliencia/recursos/${iso}`}
                  className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 font-mono text-[11.5px] uppercase text-zinc-300 hover:border-teal-500/40 hover:text-teal-200"
                >
                  {iso}
                </Link>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-[12.5px]">
              <Link href="/resiliencia/organismos" className="text-teal-300 hover:text-teal-200">
                El directorio completo →
              </Link>
              <Link href="/mundos" className="text-zinc-400 hover:text-zinc-200">
                Los {PAISES_GEO.length} países del censo
              </Link>
            </div>
          </section>

          {/* ── LAS FUENTES Y EL CUADRO DE ENTRADA ──────────────── */}
          <section className="mt-12 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
              <h2 className="text-[15px] font-semibold text-zinc-100">De dónde sale esto</h2>
              <p className="mt-1 text-[12.5px] leading-6 text-zinc-500">
                Recomendaciones de organismos reconocidos, contadas con palabras propias. La casa no enlaza fuera: la
                cita viaja en el texto de cada sección.
              </p>
              <ul className="mt-3 space-y-2">
                {FUENTES_CENTRO.map((f) => (
                  <li key={f} className="flex gap-2 text-[12.5px] leading-6 text-zinc-300">
                    <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-teal-400" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <CuadroEntrada />
          </section>

          <footer className="mt-12 border-t border-zinc-900 pt-6">
            <p className="text-[12px] leading-6 text-zinc-500">
              VANGUARD CIVIL RESILIENCE es un centro educativo. No sustituye al plan de protección civil de tu país, a
              la indicación de un técnico ni a la orden de evacuación de tu autoridad. Si hay una emergencia en curso,
              el número de emergencias y el canal oficial de tu país mandan sobre cualquier página, incluida esta.
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}

function Encuadre() {
  return (
    <aside className="mt-8 rounded-xl border border-teal-500/25 bg-teal-500/[0.05] p-5">
      <h2 className="font-mono text-[10px] uppercase tracking-widest text-teal-300">{ENCUADRE.titulo}</h2>
      <p className="mt-2 text-[13px] leading-6 text-zinc-300">{ENCUADRE.texto}</p>
      <p className="mt-2 text-[12.5px] leading-6 text-zinc-500">{ENCUADRE.datosVivos}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href="/pulso-mundial" className="rounded border border-zinc-700 px-2 py-1 text-[11.5px] text-zinc-300 hover:border-teal-500/50 hover:text-teal-200">
          Sismos medidos, en vivo
        </Link>
        <Link href="/centinela" className="rounded border border-zinc-700 px-2 py-1 text-[11.5px] text-zinc-300 hover:border-teal-500/50 hover:text-teal-200">
          Alerta temprana del planeta
        </Link>
        <Link href="/datos" className="rounded border border-zinc-700 px-2 py-1 text-[11.5px] text-zinc-300 hover:border-teal-500/50 hover:text-teal-200">
          Qué datos tiene la casa
        </Link>
      </div>
    </aside>
  );
}

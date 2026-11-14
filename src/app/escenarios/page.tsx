import type { Metadata } from "next";
import Link from "next/link";
import { VanguardMarkSvg } from "@/components/vanguard/vanguard-mark-svg";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { APP_VERSION_LABEL } from "@/lib/version";
import { ejecutarEscenario, catalogoSimulacion } from "@/lib/nucleo/simulacion";
import type { EnlaceContextual } from "@/lib/nucleo/tipos";
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";
import { EscenarioControles } from "@/components/vanguard/escenario-controles";
// v367.8 EL PARQUE MILITAR — las piezas reales (CC0) del simulador
import { ParqueMilitarCarga } from "@/components/vanguard/parque-militar-carga";
import { PortadaSala } from "@/components/vanguard/portada-sala";

// ============================================================
// v224.0 EL ESTRATEGA — LA PUERTA DEL ESCENARIO (/escenarios)
// v233.0 LA BALANZA — las VARIABLES se explican una a una (qué
// mueve, de dónde sale el dato, contra qué ancla satura, qué
// significan 0 y 2, y la puerta real del núcleo); las ANCLAS
// editoriales salen del tooltip a su propia sección con texto;
// CONECTA CON EL NÚCLEO abre la cadena de procedencia (patrón
// v230). Todo aditivo: la casa jamás quita, solo agranda.
// Tarea (f) del mandato: «simulación pequeña verificable:
// datos/supuestos/variables/reglas/resultados SEPARADOS, nunca
// presentarla como predicción, sin ejecutar código arbitrario».
// La página server-rendered muestra el escenario por defecto con
// TODAS sus piezas a la vista; la isla client solo mueve los 4
// pesos. El aviso «NO ES PREDICCIÓN» viaja con los resultados
// SIEMPRE — en la página, en la API y en la isla.
// ============================================================

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

/** v233.0 — las puertas REALES de la cadena de procedencia (el
 * mismo censo de puertas de v230: cero rutas inventadas). */
const conectaNucleo: EnlaceContextual[] = [
  {
    etiqueta: "EL ARCHIVO DE CABLES ▸",
    ruta: "/nucleo?tipo=noticia",
    motivo: "El archivo vivo donde vive el factor cobertura — cada cable con su fuente",
    tipoRelacion: "documenta",
  },
  {
    etiqueta: "LOS ACONTECIMIENTOS ▸",
    ruta: "/nucleo?tipo=acontecimiento",
    motivo: "Los hechos históricos documentados que arrancan el reloj del factor tiempo",
    tipoRelacion: "documenta",
  },
  {
    etiqueta: "EL MAPA DEL FRENTE ▸",
    ruta: "/ver-guerra",
    motivo: "El mural FRENTE TOTAL donde arden los frentes del factor frentes",
    tipoRelacion: "documenta",
  },
  {
    etiqueta: "LAS FICHAS DE PAÍS ▸",
    ruta: "/nucleo?tipo=pais",
    motivo: "Las fichas donde vive el gasto militar del Banco Mundial del factor capacidad",
    tipoRelacion: "documenta",
  },
  {
    etiqueta: "LA BÚSQUEDA DEL NÚCLEO ▸",
    ruta: "/nucleo",
    motivo: "El buscador global de todas las entidades documentadas de la casa",
    tipoRelacion: "visible_en",
  },
];

export const metadata: Metadata = {
  title: "EL ESTRATEGA — escenarios de presión por teatro, nunca predicciones",
  description:
    "Una herramienta de razonamiento con datos reales documentados: fechas históricas, cables del archivo, frentes OSINT y gasto militar del Banco Mundial, combinados bajo supuestos declarados y pesos que tú ajustas. No es una predicción.",
  alternates: { canonical: `${SITE_URL}/escenarios` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/escenarios`,
    title: "EL ESTRATEGA — escenarios, nunca predicciones",
    description:
      "Recombina datos reales documentados bajo supuestos declarados: determinista, con desglose, procedencia y límites a la vista.",
    siteName: "VANGUARD — Conflictos Mundiales en Tiempo Real",
    locale: "es_ES",
    images: [{ url: `${SITE_URL}/api/og`, width: 1200, height: 630, alt: "EL ESTRATEGA de Vanguard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EL ESTRATEGA — escenarios, nunca predicciones",
    description: "Simulación pequeña verificable: datos, supuestos, variables, reglas y resultados separados.",
  },
};

export default async function EscenariosPage() {
  // El escenario por defecto se ejecuta en el propio proceso server
  // (sin llamada HTTP a sí mismo) — con aviso, supuestos y límites.
  const escenario = await ejecutarEscenario(undefined);
  if (!escenario.ok) {
    // inalcanzable con undefined (pesos por defecto siempre válidos),
    // pero la casa no finge: si algún día lo fuera, mensaje honesto.
    return (
      <main className="min-h-screen bg-zinc-950 px-5 py-20 text-center text-zinc-300">
        <h1 className="font-orbitron text-2xl font-black text-zinc-100">EL ESTRATEGA</h1>
        <p className="mt-3 text-sm text-zinc-400">
          El escenario no pudo ejecutarse — estado real, nada fingido:{" "}
          {escenario.errores.join(" · ")}
        </p>
      </main>
    );
  }

  const cat = catalogoSimulacion();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "EL ESTRATEGA — escenarios de presión por teatro",
    description:
      "Simulación verificable de Vanguard: datos, supuestos, variables, reglas y resultados separados. No es una predicción.",
    url: `${SITE_URL}/escenarios`,
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
  };

  return (
    <>
    <PortadaSala
      imagen="/ilustraciones/simulador.jpg"
      alt="Sala de simulación con pantallas que muestran escenarios y variables"
      volanta="LA CASA · EL ESTRATEGA"
      titulo="QUÉ PASARÍA SI…"
      nivel="p"
      acento="#a855f7"
      sumario="Escenarios de presión por teatro con sus datos, supuestos, variables, reglas y resultados separados: una simulación que se puede auditar, no una predicción."
      cifras={[
          { valor: cat.variables.length, etiqueta: "variables", nota: "declaradas" },
          { valor: cat.supuestos.length, etiqueta: "supuestos", nota: "a la vista" },
          { valor: cat.anclas.length, etiqueta: "anclas", nota: "de datos" },
          { valor: cat.limites.length, etiqueta: "límites", nota: "confesados" }
      ]}
      puntos={[
          { titulo: "SEPARADO, NO MEZCLADO", texto:
              "Datos, supuestos, variables, reglas y resultados van cada uno en su bloque: quien lee puede discutir el supuesto sin tener que creerse el resultado." },
          { titulo: "NO ES UNA PREDICCIÓN", texto:
              "La sala lo dice en la cara. Es un ejercicio de presión con reglas explícitas y límites escritos." },
          { titulo: "SE PUEDE REPETIR", texto:
              "El mismo escenario, con las mismas reglas, da el mismo resultado: la simulación se ejecuta, no se narra." }
      ]}
      nota="Portada y cifras servidas desde la propia casa: la ilustración viaja en el repositorio y cada número sale de la fuente de esta sala, calculado en el render. Cero cifras escritas a mano."
    />

    <main className="min-h-screen bg-zinc-950 text-zinc-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }}
      />

      <div className="border-b border-zinc-800 bg-zinc-900/60">
        <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-amber-400 hover:text-amber-300"
          >
            <VanguardMarkSvg size={18} idPrefix="esce-mark" />
            <span>VANGUARD</span>
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600 truncate">
            {APP_VERSION_LABEL}
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-10">
        {/* HERO */}
        <header className="text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-red-300">
            Escenario — no predicción
          </div>
          <h1 className="mt-3 font-orbitron text-3xl sm:text-5xl font-black tracking-wide text-zinc-100">
            EL <span className="text-amber">ESTRATEGA</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            {cat.escena.es}
          </p>
        </header>

        {/* EL ESCENARIO + SUS MANDOS (isla client) */}
        <EscenarioControles inicial={escenario} />

        {/* v367.8 EL PARQUE MILITAR — el escenario se puede VER con las piezas
            reales que ya existían (modelos CC0 de Quaternius, copiados sin
            retocar). El uniforme cambia con el bando elegido en la escena. */}
        <section className="mt-10" aria-label="El parque militar del escenario">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber/70">
            LAS PIEZAS REALES DEL ESCENARIO — personajes, carros y mech
          </p>
          <p className="mt-2 max-w-3xl text-[13px] text-zinc-400 leading-relaxed">
            Un ejercicio sin unidades a la vista es una tabla. Estas son las
            unidades: modelos 3D que ya existían (Quaternius, CC0 1.0),
            copiados a la casa tal cual, con el uniforme del bando encima.
          </p>
          <div className="mt-3">
            <ParqueMilitarCarga alto={400} compacto />
          </div>
        </section>

        {/* CÓMO FUNCIONA — la cadena separada, a la vista */}
        <section className="mt-12" aria-label="Cómo se calcula">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber/70">
            CÓMO SE CALCULA — las piezas separadas
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                k: "① DATOS",
                v: "Fechas históricas públicas (fnt:acontecimientos), cables reales del archivo (fnt:cables), frentes de las salas OSINT (fnt:teatros) y gasto militar del Banco Mundial (fnt:indicadores). Cada uno con su procedencia.",
              },
              {
                k: "② SUPUESTOS",
                v: "5 decisiones editoriales declaradas — qué asume el modelo, por qué y qué NO captura. Un supuesto no es un hecho.",
              },
              {
                k: "③ VARIABLES",
                v: "4 pesos (0–2, paso 0.1) — lo único que mueve el usuario. Nada de código: números validados en el servidor.",
              },
              {
                k: "④ REGLAS → RESULTADO",
                v: "Funciones puras y deterministas: mismo input, mismo output. Cada resultado trae su desglose factor a factor con el ancla usada.",
              },
            ].map((b) => (
              <div key={b.k} className="rounded-md border border-zinc-800 bg-zinc-900/50 p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-cyan-hud">{b.k}</p>
                <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">{b.v}</p>
              </div>
            ))}
          </div>
        </section>

        {/* LAS VARIABLES — explicadas una a una (v233.0 LA BALANZA) */}
        <section className="mt-12" aria-label="Las variables explicadas">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber/70">
            LAS VARIABLES — explicadas una a una
          </p>
          <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed">
            Los 4 pesos son lo ÚNICO que mueve el usuario. Cada uno multiplica un factor del desglose:
            esto es lo que mueve, de dónde sale su dato, contra qué ancla satura y qué significan sus extremos.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {cat.variables.map((v) => (
              <article key={v.id} className="rounded-md border border-zinc-800 bg-zinc-900/50 p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-amber/70">{v.id}</p>
                <p className="mt-1 text-sm font-bold text-zinc-100">{v.nombre}</p>
                <p className="mt-1.5 text-xs text-zinc-300 leading-relaxed">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-cyan-hud/80">qué mueve: </span>
                  {v.mueve}
                </p>
                <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-cyan-hud/80">de dónde sale el dato: </span>
                  {v.fuente}
                </p>
                <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-amber/70">ancla: </span>
                  {v.ancla}
                </p>
                <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed">
                  {v.cero} · {v.dos}
                </p>
                <Link
                  href={v.puerta.ruta}
                  className="mt-2 inline-flex items-center rounded-sm border border-zinc-700 bg-zinc-900/70 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-widest text-zinc-300 transition-colors hover:border-amber-hud hover:text-amber"
                  title={`El dato que multiplica este peso vive aquí: ${v.puerta.etiqueta}`}
                >
                  {v.puerta.etiqueta} ▸
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* LAS ANCLAS — las decisiones editoriales a la vista (v233.0) */}
        <section className="mt-12" aria-label="Las anclas del modelo">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber/70">
            LAS ANCLAS — las decisiones editoriales del modelo
          </p>
          <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed">
            Los techos donde cada factor satura a 100. NO son datos: son decisiones editoriales de la casa,
            visibles en el desglose de cada teatro y discutibles — cambiarlas cambia el resultado, por eso
            están declaradas aquí y viven en ANCLAS de reglas.ts.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {cat.anclas.map((a) => (
              <article key={a.id} className="rounded-md border border-zinc-800 bg-zinc-900/50 p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-cyan-hud/80">{a.id}</p>
                <p className="mt-1 font-orbitron text-lg font-black text-amber">{a.valor}</p>
                <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">{a.texto}</p>
              </article>
            ))}
          </div>
        </section>

        {/* LOS SUPUESTOS — uno a uno */}
        <section className="mt-12" aria-label="Supuestos declarados">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber/70">
            LOS SUPUESTOS — declarados, no escondidos
          </p>
          <div className="mt-3 space-y-3">
            {cat.supuestos.map((s) => (
              <article key={s.id} className="rounded-md border border-zinc-800 bg-zinc-900/50 p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-amber/70">{s.id}</p>
                <p className="mt-1 text-sm text-zinc-200 leading-relaxed">{s.texto}</p>
                <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-cyan-hud/80">
                    por qué:{" "}
                  </span>
                  {s.justificacion}
                </p>
                <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-red-hud/70">
                    qué no captura:{" "}
                  </span>
                  {s.limite}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* LOS LÍMITES — la honestidad por escrito */}
        <section className="mt-12 mb-4" aria-label="Límites del escenario">
          <div className="rounded-md border border-red-hud/30 bg-red-hud/5 p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-red-hud">
              LOS LÍMITES — lo que esta herramienta NO es
            </p>
            <ul className="mt-2 space-y-1.5">
              {cat.limites.map((l) => (
                <li key={l} className="text-xs text-zinc-300 leading-relaxed">
                  · {l}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* v233.0 — la cadena de procedencia, navegable (patrón v230) */}
        <EnlacesNucleo
          titulo="CONECTA CON EL NÚCLEO"
          enlaces={conectaNucleo}
        />
      </div>
    </main>
    </>
  );
}

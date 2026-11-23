import type { Metadata } from "next";
import Link from "next/link";
import { ListaMapas } from "@/components/mapas/lista-mapas";
import { MiniMapa } from "@/components/mapas/mini-mapa";
import {
  CAPAS_DEL_CENTRO,
  CAPAS_TACTICAS,
  MAPAS,
  TOTAL_SUPERFICIES,
} from "@/lib/mapas/indice";

// ═══════════════════════════════════════════════════════════════════
// v436.5 · /mapas/indice — el mapa de los mapas
//
// Orden del Dueño: «reúne los cien mapas de todo el mundo… Vanguard Maps
// infinitos, deja las puertas abiertas a que entre producto».
//
// Lo que esta sala es: el índice de TODA la superficie de mapa que la casa
// tiene de verdad. Cada línea dice su ruta, lo que responde, con qué motor se
// pinta y de qué fuente sale el dato, y cada línea se puede abrir.
//
// Lo que esta sala NO es: un catálogo de mapas inventados para llegar a cien.
// Se cuenta lo que hay —las superficies declaradas, las capas del Centro de
// Mapas y las clases de trazo que el motor ya sabe pintar— y se dice el número
// que sale. Lo infinito no es el catálogo: es el taller, donde cada mapa nuevo
// entra como un documento sin tocar ni el globo ni el índice.
// ═══════════════════════════════════════════════════════════════════

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard.vanguard-casa.workers.dev";

export const metadata: Metadata = {
  title: "El índice de mapas — todas las superficies de mapa de VANGUARD, una por una",
  description:
    "El mapa de los mapas de VANGUARD: el Centro de Mapas y sus ocho capas, el globo de guerras, los países, el atlas, el poder, las divisas, la Tierra, los cinco mundos, la infraestructura, las lenguas, el teatro 3D, Zona Cero, los escenarios, los conflictos, la historia, el cruce y el Taller de Mapas — cada uno con su ruta, su motor y su fuente.",
  alternates: { canonical: `${SITE_URL}/mapas/indice` },
  openGraph: {
    title: "El índice de mapas — VANGUARD",
    description:
      "Toda la superficie de mapa de la casa en una lista: ruta, pregunta, motor y fuente de cada una.",
    url: `${SITE_URL}/mapas/indice`,
    siteName: "VANGUARD",
    type: "website",
  },
};

const ACENTO = "#FF9F45";
const VERDE = "#4ADE80";

const CSS = `
.vxi-hero{position:relative;overflow:hidden;border:1px solid #24313f;border-radius:6px;margin-bottom:18px;
  background:
    radial-gradient(110% 150% at 6% 0%, rgba(255,159,69,.12), transparent 55%),
    radial-gradient(90% 130% at 100% 100%, rgba(74,222,128,.10), transparent 60%),
    linear-gradient(180deg,#0a1017,#070b10 72%);}
.vxi-hero::before{content:"";position:absolute;inset:0;pointer-events:none;
  background-image:linear-gradient(rgba(255,255,255,.028) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.028) 1px,transparent 1px);
  background-size:42px 42px;mask-image:radial-gradient(120% 120% at 45% 0%,#000 25%,transparent 80%)}
.vxi-in{position:relative;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:22px;align-items:center;padding:24px}
.vxi-sello{display:inline-flex;align-items:center;gap:8px;font:700 10px/1 ui-monospace,monospace;letter-spacing:.3em;text-transform:uppercase;
  color:${ACENTO};border:1px solid rgba(255,159,69,.45);border-radius:999px;padding:7px 12px;background:rgba(255,159,69,.08)}
.vxi-sello i{display:inline-block;width:6px;height:6px;border-radius:50%;background:${ACENTO};animation:vxi-l 2.4s ease-out infinite}
.vxi-h{margin:14px 0 6px;font-size:clamp(28px,3.8vw,50px);line-height:1;letter-spacing:-.03em;font-weight:800;color:#f4f7fb}
.vxi-h em{font-style:normal;background:linear-gradient(180deg,#ffe9c9,#FF9F45 68%);-webkit-background-clip:text;background-clip:text;color:transparent}
.vxi-p{margin:0;max-width:58ch;font-size:14px;line-height:1.6;color:#a2b2c6}
.vxi-num{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:18px}
.vxi-num div{padding:10px 11px;border:1px solid #1e2a37;border-radius:4px;background:rgba(8,13,19,.72)}
.vxi-num b{display:block;font:800 22px/1 ui-monospace,monospace;color:#fff;letter-spacing:-.03em}
.vxi-num span{display:block;margin-top:5px;font:600 8.5px/1.2 ui-monospace,monospace;letter-spacing:.16em;color:#7b8ca0;text-transform:uppercase}
.vxi-botones{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}
.vxi-b1,.vxi-b2{display:inline-flex;align-items:center;gap:9px;padding:11px 17px;border-radius:4px;font:700 11px/1 ui-monospace,monospace;
  letter-spacing:.16em;text-transform:uppercase;text-decoration:none;transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease}
.vxi-b1{color:#0a0d12;background:linear-gradient(180deg,#ffca8a,#FF9F45);box-shadow:0 10px 26px rgba(255,159,69,.28)}
.vxi-b1:hover{transform:translateY(-2px);box-shadow:0 16px 34px rgba(255,159,69,.4)}
.vxi-b2{color:#dbe6f2;border:1px solid #2c3d4f;background:rgba(255,255,255,.03)}
.vxi-b2:hover{transform:translateY(-2px);border-color:${VERDE};color:#fff}
.vxi-planeta{position:relative;border:1px solid #24313f;border-radius:5px;overflow:hidden;background:#070c12}
.vxi-planeta .vxm{display:block;width:100%;height:auto}
.vxi-planeta span{position:absolute;right:10px;bottom:8px;font:600 8.5px/1 ui-monospace,monospace;letter-spacing:.2em;text-transform:uppercase;color:#7d8ea2}
@keyframes vxi-l{0%{box-shadow:0 0 0 0 rgba(255,159,69,.55)}70%{box-shadow:0 0 0 10px rgba(255,159,69,0)}100%{box-shadow:0 0 0 0 rgba(255,159,69,0)}}
@media (max-width:900px){.vxi-in{grid-template-columns:1fr;padding:18px}.vxi-num{grid-template-columns:repeat(2,minmax(0,1fr))}.vxi-planeta{display:none}}
@media (prefers-reduced-motion:reduce){.vxi-sello i{animation:none}}
/* v436.7b — EL MUELLE NO TAPA EL HÉROE (misma cura que en el taller). */
.vxi-page{padding-left:82px}
/* v436.7d · el cartel de bienvenida de la casa (fixed abajo a la derecha)
   caía justo encima del formulario del taller / de las tarjetas del índice.
   Aquí estorba: se retira sólo en estas dos salas. */
body:has(.vxtl-page) .vg-primera-vez,
body:has(.vxi-page) .vg-primera-vez{display:none!important}

@media (max-width:979px){.vxi-page{padding-left:12px}}
`;

export default function PaginaIndiceMapas() {
  return (
    <main className="mx-auto w-full max-w-[1500px] px-3 py-6 sm:px-5 vxi-page">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <header className="vxi-hero">
        <div className="vxi-in">
          <div>
            <span className="vxi-sello"><i aria-hidden /> Índice · {TOTAL_SUPERFICIES} superficies declaradas</span>
            <h1 className="vxi-h">
              El índice <em>de mapas</em>
            </h1>
            <p className="vxi-p">
              Todos los mapas que la casa tiene, uno por uno: su ruta, la pregunta que responde, con qué se pinta y de
              qué fuente sale cada cifra. No hay relleno — lo que no está, no existe todavía. Y lo que falte se puede
              hacer abajo, en el taller.
            </p>
            <div className="vxi-num">
              <div><b>{MAPAS.length}</b><span>salas con mapa</span></div>
              <div><b>{CAPAS_DEL_CENTRO.length}</b><span>capas del planeta</span></div>
              <div><b>{CAPAS_TACTICAS.length}</b><span>clases de trazo</span></div>
              <div><b>∞</b><span>mapas posibles</span></div>
            </div>
            <div className="vxi-botones">
              <Link href="/mapas/taller" className="vxi-b1">
                Abrir el Taller de Mapas <span aria-hidden>▸</span>
              </Link>
              <Link href="/mapas" className="vxi-b2">
                Centro de Mapas
              </Link>
              <Link href="/mundos" className="vxi-b2">
                Los 249 países
              </Link>
            </div>
          </div>
          <div className="vxi-planeta">
            <MiniMapa etiqueta="El planeta de la casa" />
            <span>Natural Earth 110m</span>
          </div>
        </div>
      </header>

      <ListaMapas mapas={MAPAS} />

      <section className="mt-8">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.24em]" style={{ color: VERDE }}>
          Las ocho capas del Centro de Mapas
        </h2>
        <p className="mt-1 max-w-3xl text-[12px] leading-relaxed text-slate-500">
          Cada capa es una declaración en <code className="text-slate-400">src/lib/mapas-capas.ts</code>:
          la novena no toca ni el globo ni la sala. Se conmutan sobre el mismo planeta en{" "}
          <Link href="/mapas" className="underline" style={{ color: ACENTO }}>
            /mapas
          </Link>
          .
        </p>
        <ul className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          {CAPAS_DEL_CENTRO.map((c, i) => (
            <li key={c.id} className="rounded border border-slate-800 bg-slate-950/60 p-3">
              <p className="font-mono text-[10px] tracking-[0.16em] text-slate-500">
                CAPA {String(i + 1).padStart(2, "0")}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-100">{c.nombre}</p>
              <p className="mt-1 text-[11px] leading-snug text-slate-400">{c.pregunta}</p>
              <p className="mt-2 border-t border-slate-800 pt-2 text-[10px] leading-snug text-slate-500">
                {c.fuente}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.24em]" style={{ color: VERDE }}>
          Las seis clases de trazo que el planeta ya sabe pintar
        </h2>
        <p className="mt-1 max-w-3xl text-[12px] leading-relaxed text-slate-500">
          El motor de la casa no solo pinta países: sabe poner bases, rutas de energía, zonas de
          exclusión, bloqueos, manchas de población y rutas de suministro. El taller usa las mismas
          clases, así que un punto tuyo habla el idioma del resto de la casa.
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {CAPAS_TACTICAS.map((t) => (
            <li
              key={t.id}
              className="rounded border border-slate-800 bg-slate-950/60 px-3 py-2 text-[11px] text-slate-300"
            >
              <span className="font-mono text-[10px]" style={{ color: ACENTO }}>
                {t.nombre.toUpperCase()}
              </span>{" "}
              <span className="text-slate-500">{t.queEs}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded border border-slate-800 bg-slate-950/60 p-4">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.24em]" style={{ color: ACENTO }}>
          Por qué este índice no llega a cien
        </h2>
        <p className="mt-2 max-w-4xl text-[13px] leading-relaxed text-slate-400">
          Porque una casa que dice tener cien mapas cuando tiene {MAPAS.length} está mintiendo, y esa
          es la única cosa que aquí no se hace. Este índice cuenta lo que hay:{" "}
          <strong className="text-slate-200">{MAPAS.length} salas con mapa</strong>,{" "}
          <strong className="text-slate-200">{CAPAS_DEL_CENTRO.length} capas</strong> y{" "}
          <strong className="text-slate-200">{CAPAS_TACTICAS.length} clases de trazo</strong>, es
          decir <strong className="text-slate-200">{TOTAL_SUPERFICIES} superficies</strong>. Los
          mapas que faltan hasta cien no se inventan: se hacen. Cada uno que se haga en el taller se
          abre aquí mismo y se puede publicar en{" "}
          <Link href="/creadores/publicar" className="underline" style={{ color: ACENTO }}>
            La Forja
          </Link>
          . Ahí es donde la puerta queda abierta y el número sube solo.
        </p>
      </section>
    </main>
  );
}

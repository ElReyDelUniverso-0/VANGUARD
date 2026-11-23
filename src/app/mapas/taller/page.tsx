import type { Metadata } from "next";
import Link from "next/link";
import { TallerMapa } from "@/components/mapas/taller-mapa";
import { MiniMapa } from "@/components/mapas/mini-mapa";

// ═══════════════════════════════════════════════════════════════════
// v436.7 · /mapas/taller — crear un mapa dentro de Vanguard
//
// Orden del Dueño: «herramientas para crear mapas 3D 2D interactivos con
// informaciones, crearlos dentro de Vanguard, exportarlos, publicar maps» y,
// después: «no he visto nada de lo que agregaste, mejóralo y púlelo más, que
// diga wow».
//
// Lo que esta sala es: el taller. Se pone un punto sobre el planeta —en el
// plano con las fronteras reales o en el globo de verdad—, se le escribe qué
// es y de dónde sale el dato, se dibujan trazos y el mapa se saca de aquí en
// GeoJSON, en JSON o en un HTML autónomo que se abre solo.
//
// Lo que esta sala NO es: un mapa nuevo. Usa el mismo planeta que el resto de
// la casa (Natural Earth 110m, la misma proyección de /mundos) y el mismo
// globo (globe.gl). No hay un segundo motor que pueda contradecir al primero.
//
// Nada inventado: un punto sin fuente se marca «sin fuente» en el taller y en
// el índice; el contador de la barra lo dice antes de exportar.
// ═══════════════════════════════════════════════════════════════════

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard.vanguard-casa.workers.dev";

export const metadata: Metadata = {
  title: "El Taller de Mapas — crear mapas 2D y 3D con información, dentro de VANGUARD",
  description:
    "Herramienta de creación de mapas interactivos de VANGUARD: pon puntos sobre el planeta, escribe qué es cada uno y su fuente, dibuja trazos, míralo en plano o en globo 3D y expórtalo en GeoJSON, JSON o un HTML autónomo. Tres plantillas para empezar, importación de GeoJSON y publicación en La Forja.",
  alternates: { canonical: `${SITE_URL}/mapas/taller` },
  openGraph: {
    title: "El Taller de Mapas — VANGUARD",
    description:
      "Crear mapas 2D y 3D con fichas y fuentes, verlos en plano o en globo, y exportarlos en GeoJSON, JSON o HTML autónomo.",
    url: `${SITE_URL}/mapas/taller`,
    siteName: "VANGUARD",
    type: "website",
  },
};

const ORO = "#FF9F45";
const CIAN = "#38BDF8";

const CSS = `
.vxtl-hero{position:relative;overflow:hidden;border:1px solid #24313f;border-radius:6px;margin-bottom:16px;
  background:
    radial-gradient(110% 150% at 8% 0%, rgba(255,159,69,.12), transparent 55%),
    radial-gradient(90% 130% at 100% 100%, rgba(56,189,248,.12), transparent 60%),
    linear-gradient(180deg,#0a1017,#070b10 72%);}
.vxtl-hero::before{content:"";position:absolute;inset:0;pointer-events:none;
  background-image:linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px);
  background-size:42px 42px;mask-image:radial-gradient(120% 120% at 40% 0%,#000 25%,transparent 80%)}
.vxtl-in{position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.85fr);gap:22px;align-items:center;padding:24px}
.vxtl-sello{display:inline-flex;align-items:center;gap:8px;font:700 10px/1 ui-monospace,monospace;letter-spacing:.3em;text-transform:uppercase;
  color:${ORO};border:1px solid rgba(255,159,69,.45);border-radius:999px;padding:7px 12px;background:rgba(255,159,69,.08)}
.vxtl-sello i{display:inline-block;width:6px;height:6px;border-radius:50%;background:${ORO};animation:vxtl-l 2.4s ease-out infinite}
.vxtl-h{margin:14px 0 6px;font-size:clamp(30px,4.4vw,58px);line-height:.98;letter-spacing:-.035em;font-weight:800;color:#f4f7fb}
.vxtl-h em{font-style:normal;background:linear-gradient(180deg,#ffe9c9,#FF9F45 68%);-webkit-background-clip:text;background-clip:text;color:transparent}
.vxtl-p{margin:0;max-width:56ch;font-size:14px;line-height:1.6;color:#a2b2c6}
.vxtl-chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:16px}
.vxtl-chips span{font:600 9.5px/1 ui-monospace,monospace;letter-spacing:.16em;text-transform:uppercase;color:#c8d5e4;
  border:1px solid #2a3a4b;border-radius:999px;padding:7px 10px;background:rgba(255,255,255,.03)}
.vxtl-chips span b{color:${CIAN}}
.vxtl-nav{display:flex;flex-wrap:wrap;gap:14px;margin-top:18px;font:700 10.5px/1 ui-monospace,monospace;letter-spacing:.16em;text-transform:uppercase}
.vxtl-nav a{color:#93a4b8;text-decoration:none;border-bottom:1px solid transparent;padding-bottom:2px}
.vxtl-nav a:hover{color:#fff;border-bottom-color:${ORO}}
.vxtl-map{position:relative;border:1px solid #24313f;border-radius:5px;overflow:hidden;background:#070c12}
.vxtl-map .vxm{display:block;width:100%;height:auto}
.vxtl-map-i{position:absolute;left:10px;top:9px;font:600 8.5px/1.4 ui-monospace,monospace;letter-spacing:.18em;text-transform:uppercase;color:#8ea1b6}
.vxtl-map-i b{color:${ORO}}
.vxtl-map-p{position:absolute;right:10px;bottom:8px;font:600 8.5px/1 ui-monospace,monospace;letter-spacing:.18em;text-transform:uppercase;color:#7d8ea2}
.vxtl-pie{margin-top:14px;display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center;justify-content:space-between;
  border-top:1px solid #1b2430;padding-top:12px;font-size:11.5px;color:#7f8ea1}
.vxtl-pie a{color:#b9c6d6;text-decoration:none;border-bottom:1px dotted #3a4b5e}
.vxtl-pie a:hover{color:#fff;border-bottom-color:${ORO}}
@keyframes vxtl-l{0%{box-shadow:0 0 0 0 rgba(255,159,69,.55)}70%{box-shadow:0 0 0 10px rgba(255,159,69,0)}100%{box-shadow:0 0 0 0 rgba(255,159,69,0)}}
@media (max-width:900px){.vxtl-in{grid-template-columns:1fr;padding:18px}.vxtl-map{order:-1}}
@media (prefers-reduced-motion:reduce){.vxtl-sello i{animation:none}}
/* v436.7b — EL MUELLE NO TAPA EL HÉROE: en pantalla grande el muelle vive en
   x 10–68, y esta sala empezaba en x 12. Aquí se aparta, como el resto de la
   casa. En pantalla pequeña el muelle no existe y el margen vuelve a cero. */
.vxtl-page{padding-left:82px}
/* v436.7d · el cartel de bienvenida de la casa (fixed abajo a la derecha)
   caía justo encima del formulario del taller / de las tarjetas del índice.
   Aquí estorba: se retira sólo en estas dos salas. */
body:has(.vxtl-page) .vg-primera-vez,
body:has(.vxi-page) .vg-primera-vez{display:none!important}

@media (max-width:979px){.vxtl-page{padding-left:12px}}
`;

export default function PaginaTallerMapas() {
  return (
    <main className="mx-auto w-full max-w-[1500px] px-3 py-5 sm:px-5 vxtl-page">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <header className="vxtl-hero">
        <div className="vxtl-in">
          <div>
            <span className="vxtl-sello"><i aria-hidden /> Herramienta · crear mapas 2D y 3D</span>
            <h1 className="vxtl-h">
              El Taller <em>de Mapas</em>
            </h1>
            <p className="vxtl-p">
              Aquí un mapa se hace a mano y se sostiene en su fuente. Toca el planeta para poner un punto, escribe qué
              es y de dónde sale el dato, dibuja la ruta si hace falta, y míralo en plano o en globo. Después se lo
              lleva cualquiera: GeoJSON para un SIG, JSON para volver a abrirlo, o un HTML autónomo que se abre sin
              Vanguard y sin internet.
            </p>
            <div className="vxtl-chips">
              <span><b>2D</b> plano · Natural Earth</span>
              <span><b>3D</b> globo real</span>
              <span><b>3</b> formatos de salida</span>
              <span><b>3</b> plantillas</span>
              <span>sin cuenta</span>
            </div>
            <nav className="vxtl-nav" aria-label="Salidas del taller">
              <Link href="/mapas">◂ Centro de Mapas</Link>
              <Link href="/mapas/indice">Los 36 mapas de la casa</Link>
              <Link href="/mundos">Los 249 países</Link>
              <Link href="/creadores/publicar">Publicar en La Forja ▸</Link>
            </nav>
          </div>

          <div className="vxtl-map">
            <MiniMapa
              puntos={[
                { lat: 26.5667, lng: 56.25 },
                { lat: 12.5833, lng: 43.3333 },
                { lat: 1.4333, lng: 102.8833 },
                { lat: -8.65, lng: 115.2167, color: CIAN },
              ]}
              trazos={[
                {
                  puntos: [[26.5667, 56.25], [12.5833, 43.3333], [5.0, 80.0], [1.4333, 102.8833], [-8.65, 115.2167]],
                  color: "#FFD166",
                },
              ]}
              etiqueta="Ejemplo: la ruta de los tres estrechos, dibujada en el taller"
            />
            <span className="vxtl-map-i"><b>TALLER</b> · ejemplo vivo</span>
            <span className="vxtl-map-p">Natural Earth 110m</span>
          </div>
        </div>
      </header>

      <TallerMapa />

      <footer className="vxtl-pie">
        <p style={{ margin: 0, maxWidth: "70ch" }}>
          El taller no guarda nada en un servidor: tu mapa vive en este navegador hasta que lo exportas. La geografía es
          Natural Earth 110m, la misma que usan el resto de las salas de mapa de la casa. Los datos son los que
          escribas, con la fuente que declares.
        </p>
        <p style={{ margin: 0 }}>
          <Link href="/mapas/indice">Ver el índice de mapas</Link> · <Link href="/mapas">Centro de Mapas</Link>
        </p>
      </footer>
    </main>
  );
}

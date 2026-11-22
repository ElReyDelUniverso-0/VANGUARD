// ═══════════════════════════════════════════════════════════════════
// v436.7 · EL ESCAPARATE DEL TALLER — que se VEA desde la portada
//
// Orden del Dueño: «no he visto nada de lo que agregaste, mejóralo y púlelo
// más, que diga wow».
//
// El problema no era el taller: era que nadie lo encontraba. Esto es la puerta
// grande, en la portada y en /mapas: el planeta vivo a la derecha (el mismo
// mapa de la casa, en miniatura, con sus puntos latiendo) y a la izquierda lo
// que hace, en tres líneas, con dos botones.
//
// Servidor puro: cero JavaScript enviado al navegador. El latido es CSS.
// ═══════════════════════════════════════════════════════════════════
import Link from "next/link";
import { MiniMapa, type PuntoMini, type TrazoMini } from "./mini-mapa";

const ORO = "#FF9F45";
const CIAN = "#38BDF8";
const VERDE = "#4ADE80";

/** Los tres estrechos: geografía verificable, la misma del ejemplo exportable. */
const EJEMPLO: PuntoMini[] = [
  { lat: 26.5667, lng: 56.25, color: ORO },
  { lat: 12.5833, lng: 43.3333, color: ORO },
  { lat: 1.4333, lng: 102.8833, color: ORO },
  { lat: -8.65, lng: 115.2167, color: CIAN },
  { lat: 51.9244, lng: 4.4777, color: VERDE },
  { lat: 33.7405, lng: -118.2775, color: VERDE },
];

const RUTA: TrazoMini[] = [
  { puntos: [[51.9244, 4.4777], [36.0, -5.6], [26.5667, 56.25], [12.5833, 43.3333], [1.4333, 102.8833], [-8.65, 115.2167]], color: "#FFD166" },
  { puntos: [[33.7405, -118.2775], [-8.65, 115.2167]], color: "#38BDF8" },
];

const CSS = `
.vxt-wrap{position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);gap:26px;align-items:center;
  padding:26px;border:1px solid #24313f;border-radius:6px;overflow:hidden;
  background:
    radial-gradient(120% 140% at 12% 0%, rgba(255,159,69,.10), transparent 55%),
    radial-gradient(90% 120% at 100% 100%, rgba(56,189,248,.10), transparent 60%),
    linear-gradient(180deg,#0a1017,#070b10 70%);}
.vxt-wrap::before{content:"";position:absolute;inset:0;pointer-events:none;
  background-image:linear-gradient(rgba(255,255,255,.028) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.028) 1px,transparent 1px);
  background-size:44px 44px;mask-image:radial-gradient(120% 120% at 50% 0%,#000 30%,transparent 78%)}
.vxt-txt{position:relative;min-width:0}
.vxt-sello{display:inline-flex;align-items:center;gap:8px;font:700 10px/1 ui-monospace,monospace;letter-spacing:.28em;
  text-transform:uppercase;color:${ORO};border:1px solid rgba(255,159,69,.45);border-radius:999px;padding:7px 11px;
  background:rgba(255,159,69,.08)}
.vxt-sello i{width:6px;height:6px;border-radius:50%;background:${ORO};box-shadow:0 0 0 0 rgba(255,159,69,.6);animation:vxt-late 2.4s ease-out infinite;display:inline-block}
.vxt-h{position:relative;margin:14px 0 8px;font-size:clamp(24px,3vw,40px);line-height:1.03;letter-spacing:-.02em;font-weight:750;color:#f2f5fa}
.vxt-h em{font-style:normal;background:linear-gradient(180deg,#ffe6bd,#FF9F45 70%);-webkit-background-clip:text;background-clip:text;color:transparent}
.vxt-p{position:relative;margin:0;max-width:52ch;font-size:14px;line-height:1.6;color:#9fb0c4}
.vxt-li{position:relative;margin:16px 0 0;padding:0;list-style:none;display:grid;gap:9px}
.vxt-li li{display:flex;gap:10px;align-items:flex-start;font-size:13px;line-height:1.45;color:#c9d5e3}
.vxt-li b{color:#fff;font-weight:650}
.vxt-li svg{flex:0 0 16px;margin-top:1px}
.vxt-cta{position:relative;display:flex;flex-wrap:wrap;gap:10px;margin-top:20px}
.vxt-b1,.vxt-b2{display:inline-flex;align-items:center;gap:9px;padding:11px 17px;border-radius:4px;font:700 11px/1 ui-monospace,monospace;
  letter-spacing:.16em;text-transform:uppercase;text-decoration:none;transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease}
.vxt-b1{color:#0a0d12;background:linear-gradient(180deg,#ffca8a,#FF9F45);box-shadow:0 10px 26px rgba(255,159,69,.28)}
.vxt-b1:hover{transform:translateY(-2px);box-shadow:0 16px 34px rgba(255,159,69,.4)}
.vxt-b2{color:#dbe6f2;border:1px solid #2c3d4f;background:rgba(255,255,255,.03)}
.vxt-b2:hover{transform:translateY(-2px);border-color:${CIAN};color:#fff}
.vxt-nota{position:relative;margin:12px 0 0;font:400 10.5px/1.5 ui-monospace,monospace;letter-spacing:.06em;color:#6d7a8c;text-transform:uppercase}
.vxt-mapa{position:relative;min-width:0}
.vxt-lienzo{position:relative;border:1px solid #24313f;border-radius:5px;overflow:hidden;background:#070c12}
.vxt-lienzo .vxm{display:block;width:100%;height:auto}
.vxt-esquinas::before,.vxt-esquinas::after{content:"";position:absolute;width:16px;height:16px;border:1px solid ${ORO};opacity:.8}
.vxt-esquinas::before{left:6px;top:6px;border-right:0;border-bottom:0}
.vxt-esquinas::after{right:6px;bottom:6px;border-left:0;border-top:0}
.vxt-hud{position:absolute;left:10px;top:34px;display:grid;gap:3px;font:500 9.5px/1.35 ui-monospace,monospace;letter-spacing:.1em;color:#8fa1b6;text-transform:uppercase}
.vxt-hud b{color:${ORO}}
.vxt-etq{position:absolute;right:10px;bottom:9px;font:500 9px/1 ui-monospace,monospace;letter-spacing:.2em;color:#7b8ca0;text-transform:uppercase}
.vxt-cifras{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:12px 0 0}
.vxt-cifras div{padding:9px 10px;border:1px solid #1e2a37;border-radius:4px;background:rgba(8,13,19,.72)}
.vxt-cifras b{display:block;font:750 19px/1 ui-monospace,monospace;color:#fff;letter-spacing:-.02em}
.vxt-cifras span{display:block;margin-top:4px;font:500 8.5px/1.2 ui-monospace,monospace;letter-spacing:.16em;color:#7b8ca0;text-transform:uppercase}
.vxm-onde{animation:vxm-late 2.8s ease-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes vxm-late{0%{r:3;opacity:.7}70%{r:13;opacity:0}100%{r:13;opacity:0}}
@keyframes vxt-late{0%{box-shadow:0 0 0 0 rgba(255,159,69,.55)}70%{box-shadow:0 0 0 10px rgba(255,159,69,0)}100%{box-shadow:0 0 0 0 rgba(255,159,69,0)}}
@media (max-width:900px){.vxt-wrap{grid-template-columns:1fr;gap:18px;padding:18px}.vxt-cifras{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (prefers-reduced-motion:reduce){.vxm-onde,.vxt-sello i{animation:none}}
`;

export function EscaparateTaller({ compacto = false }: { compacto?: boolean }) {
  return (
    <div className="vxt-wrap">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="vxt-txt">
        <span className="vxt-sello"><i aria-hidden /> Herramienta nueva · crear mapas</span>
        <h2 className="vxt-h">
          Haz tu propio mapa: <em>pon el punto, firma la fuente</em> y llévatelo.
        </h2>
        <p className="vxt-p">
          El Taller es la primera herramienta de la casa que no te enseña un mapa: te deja hacerlo. Tocas el planeta
          —en plano o en globo 3D—, escribes qué es cada sitio y de dónde sale el dato, dibujas la ruta, y el mapa sale
          de aquí en GeoJSON, en JSON o en un HTML que se abre solo, sin Vanguard y sin internet.
        </p>

        {!compacto && (
          <ul className="vxt-li">
            <li>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={ORO} strokeWidth="1.8"><circle cx="12" cy="10" r="3" /><path d="M12 21s7-6.4 7-11a7 7 0 1 0-14 0c0 4.6 7 11 7 11Z" /></svg>
              <span><b>Un punto, una ficha.</b> Nombre, qué es y fuente. Si no pones fuente, el taller lo dice en voz alta.</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={CIAN} strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>
              <span><b>Plano y globo, el mismo mapa.</b> Natural Earth y el globo de verdad de la casa: ningún motor nuevo que pueda contradecir al primero.</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={VERDE} strokeWidth="1.8"><path d="M12 3v12m0 0 4-4m-4 4-4-4" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>
              <span><b>Sale de aquí.</b> GeoJSON para QGIS, JSON para volver a abrirlo, HTML autónomo para enseñarlo. Y se publica en La Forja.</span>
            </li>
          </ul>
        )}

        <div className="vxt-cta">
          <Link href="/mapas/taller" className="vxt-b1">
            Abrir el Taller de Mapas <span aria-hidden>▸</span>
          </Link>
          <Link href="/mapas/indice" className="vxt-b2">
            Los 36 mapas de la casa
          </Link>
        </div>
        <p className="vxt-nota">Sin cuenta · se guarda en tu aparato · exportable</p>
      </div>

      <div className="vxt-mapa">
        <div className="vxt-lienzo vxt-esquinas">
          <MiniMapa
            puntos={EJEMPLO}
            trazos={RUTA}
            etiqueta="Ejemplo hecho en el Taller: tres estrechos y dos rutas"
          />
          <div className="vxt-hud" aria-hidden>
            <span><b>TALLER</b> · mapa de ejemplo</span>
            <span>6 puntos · 2 trazos · 0 sin fuente</span>
          </div>
          <div className="vxt-etq" aria-hidden>Natural Earth 110m</div>
        </div>
        <div className="vxt-cifras">
          <div><b>36</b><span>mapas y capas</span></div>
          <div><b>2D · 3D</b><span>plano y globo</span></div>
          <div><b>3</b><span>formatos de salida</span></div>
          <div><b>∞</b><span>mapas posibles</span></div>
        </div>
      </div>
    </div>
  );
}

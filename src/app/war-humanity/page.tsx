// ═══════════════════════════════════════════════════════════════════
// v437.0 · WAR & HUMANITY — centro mundial de guerras y crisis humanitarias
//
// Orden del Dueño (22-nov): «Crea un centro mundial de información sobre
// guerras, conflictos y crisis humanitarias… No presentes estimaciones como
// cifras confirmadas. Construye una experiencia visual profesional, funcional y
// completa».
//
// Cómo se cumple, y por qué así:
//
//   · MAPA. El mismo planeta de la casa (Natural Earth 110m, la misma
//     proyección). Encima van burbujas por país con el radio en raíz cuadrada
//     del valor: el doble de área es el doble de personas. Sin JavaScript: cada
//     burbuja es un enlace y los filtros son un formulario normal.
//   · CIFRAS. No hay una sola cifra escrita a mano. UCDP/PRIO (muertes en
//     combate, servido por el Banco Mundial) y UNHCR (población desplazada).
//     Cada número lleva su año y su fuente, y la sala dice si está leyendo la
//     API en vivo o la instantánea guardada.
//   · CIVILES. UCDP/PRIO no desglosa las víctimas civiles y no existe una
//     serie abierta de civiles verificados sin clave de acceso. En vez de
//     rellenar el hueco con una estimación, la sala lo declara y enlaza a las
//     fuentes que sí publican esos datos en informes (OHCHR, UCDP One-sided).
//   · FILTROS. Países con dato, años (2014–2024) y dos vistas: muertes en
//     combate y desplazamiento forzado. El «tipo de conflicto» no se ofrece
//     porque la fuente abierta que tenemos no lo desglosa: inventarlo sería
//     romper la primera regla de la casa.
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import Link from "next/link";
import { PAISES_GEO } from "@/lib/geo-paises";
import {
  SNAP,
  cargarCombate,
  cargarDesplazamiento,
  claseDeIntensidad,
  ETIQUETA_INTENSIDAD,
  valorDe,
  totalAnio,
  ranking,
  serieDe,
  cifra,
  porcentaje,
} from "@/lib/guerra/datos";
import { MapaGuerra, COLOR_INTENSIDAD, type PuntoGuerra } from "@/components/guerra/mapa-guerra";

// Las regiones del atlas vienen en inglés de PAISES_GEO; la sala es en español.
// No se toca el dato: se traduce la etiqueta al pintarla.
const LUGAR_ES: Record<string, string> = {
  Africa: "África",
  Americas: "América",
  Asia: "Asia",
  Europe: "Europa",
  Oceania: "Oceanía",
  Antarctica: "Antártida",
  "Northern Africa": "África del Norte",
  "Western Africa": "África Occidental",
  "Middle Africa": "África Central",
  "Eastern Africa": "África Oriental",
  "Southern Africa": "África Austral",
  "Northern America": "América del Norte",
  "Central America": "América Central",
  Caribbean: "Caribe",
  "South America": "América del Sur",
  "Western Asia": "Asia Occidental",
  "Central Asia": "Asia Central",
  "Southern Asia": "Asia del Sur",
  "Eastern Asia": "Asia Oriental",
  "South-Eastern Asia": "Sudeste Asiático",
  "Eastern Europe": "Europa Oriental",
  "Northern Europe": "Europa del Norte",
  "Southern Europe": "Europa del Sur",
  "Western Europe": "Europa Occidental",
  "Australia and New Zealand": "Australia y Nueva Zelanda",
  Melanesia: "Melanesia",
  Micronesia: "Micronesia",
  Polynesia: "Polinesia",
};
const etiquetaLugar = (t: string): string => LUGAR_ES[t] ?? t;

export const revalidate = 86400;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard.vanguard-casa.workers.dev";

export const metadata: Metadata = {
  title: "War & Humanity — guerras, conflictos y crisis humanitarias, con su fuente",
  description:
    "Centro de información sobre guerras y crisis humanitarias: mapa interactivo de conflictos, países afectados, muertes en combate declaradas (UCDP/PRIO vía Banco Mundial), desplazamiento forzado (UNHCR), comparaciones históricas 2014–2024, cronologías y fuentes internacionales. Cada cifra con su año y su origen; ninguna estimación presentada como confirmada.",
  alternates: { canonical: `${SITE_URL}/war-humanity` },
  openGraph: {
    title: "War & Humanity · VANGUARD",
    description: "Guerras y crisis humanitarias con fuente, año y límites a la vista.",
    url: `${SITE_URL}/war-humanity`,
    siteName: "VANGUARD",
    type: "website",
  },
};

const CSS = `
.vxgh{padding-left:82px}
@media (max-width:979px){.vxgh{padding-left:12px}}
.vxgh-wrap{max-width:1460px;margin:0 auto;padding:0 14px 70px}
.vxgh-hero{position:relative;overflow:hidden;border:1px solid #22303f;background:
  radial-gradient(120% 140% at 82% 0%,rgba(216,31,38,.16),transparent 58%),
  radial-gradient(90% 120% at 8% 100%,rgba(242,183,74,.10),transparent 60%),
  linear-gradient(180deg,#0b1219,#070b10);padding:34px 30px 26px}
.vxgh-hero::after{content:"";position:absolute;inset:0;pointer-events:none;
  background-image:linear-gradient(#141d27 1px,transparent 1px),linear-gradient(90deg,#141d27 1px,transparent 1px);
  background-size:48px 48px;opacity:.5;mask-image:radial-gradient(80% 100% at 20% 0%,#000,transparent 72%)}
.vxgh-sello{position:relative;display:inline-flex;align-items:center;gap:9px;border:1px solid #6b2226;background:#1a0708;color:#ff8f8a;
  font-family:ui-monospace,monospace;font-size:10.5px;letter-spacing:.22em;text-transform:uppercase;padding:6px 12px;border-radius:2px}
.vxgh-h1{position:relative;font-family:ui-monospace,Menlo,monospace;font-size:clamp(30px,5.6vw,60px);line-height:1.02;letter-spacing:-.02em;
  font-weight:800;text-transform:uppercase;margin:16px 0 12px;color:#eef4fa}
.vxgh-h1 em{color:#f2b74a;font-style:normal}
.vxgh-lead{position:relative;max-width:74ch;color:#a9b8c8;font-size:16.5px;line-height:1.6;margin:0 0 6px}
.vxgh-lead b{color:#e9f1f8}
.vxgh-cifras{position:relative;display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-top:24px}
.vxgh-cifra{border:1px solid #23303e;background:#0a1118;padding:12px 14px}
.vxgh-cifra b{display:block;font-family:ui-monospace,monospace;font-size:29px;line-height:1;color:#f2b74a}
.vxgh-cifra b.rojo{color:#ff6b63}
.vxgh-cifra span{display:block;font-family:ui-monospace,monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#7f8fa3;margin-top:7px}
.vxgh-cifra i{display:block;font-style:normal;font-size:11px;color:#5f7285;margin-top:4px}
.vxgh-filtros{display:flex;flex-wrap:wrap;gap:10px 14px;align-items:flex-end;border:1px solid #222f3d;background:#0a1017;padding:12px 14px;margin-top:22px}
.vxgh-filtros label{display:grid;gap:5px;font-family:ui-monospace,monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#7f8fa3}
.vxgh-filtros select{background:#0d151d;border:1px solid #2a3a4a;color:#dbe6f1;font-family:ui-monospace,monospace;font-size:12.5px;padding:7px 9px;min-width:170px}
.vxgh-filtros button{background:#f2b74a;color:#120c02;border:0;font-family:ui-monospace,monospace;font-weight:700;font-size:11.5px;letter-spacing:.14em;
  text-transform:uppercase;padding:9px 16px;cursor:pointer}
.vxgh-filtros button:hover{background:#ffc966}
.vxgh-anios{display:flex;flex-wrap:wrap;gap:5px;margin-top:12px}
.vxgh-anios a{font-family:ui-monospace,monospace;font-size:11.5px;padding:4px 9px;border:1px solid #24313f;color:#93a4b8;text-decoration:none;background:#0b1118}
.vxgh-anios a:hover{border-color:#f2b74a;color:#f2b74a}
.vxgh-anios a[data-on="1"]{background:#20180a;border-color:#f2b74a;color:#f2b74a;font-weight:700}
.vxgh-grid{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(300px,1fr);gap:16px;margin-top:18px;align-items:start}
@media (max-width:1100px){.vxgh-grid{grid-template-columns:1fr}}
.vxgh-caja{border:1px solid #22303f;background:#0a1017}
.vxgh-caja > h2{margin:0;padding:12px 16px;border-bottom:1px solid #22303f;background:#0d151d;font-family:ui-monospace,monospace;font-size:11.5px;
  letter-spacing:.2em;text-transform:uppercase;color:#f2b74a;font-weight:600;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
.vxgh-caja > h2 span{color:#6f8296;letter-spacing:.06em;text-transform:none;font-size:11.5px;font-weight:400}
.vxgh-mapa{display:block;width:100%;height:auto;background:#070c12}
.vxgh-leyenda{display:flex;flex-wrap:wrap;gap:14px;padding:11px 16px;border-top:1px solid #1b2734;font-family:ui-monospace,monospace;font-size:11px;color:#8b9cb0}
.vxgh-leyenda span{display:inline-flex;align-items:center;gap:7px}
.vxgh-leyenda i{width:10px;height:10px;border-radius:50%;display:inline-block}
.vxgh-tabla{width:100%;border-collapse:collapse;font-size:13.5px}
.vxgh-tabla th{font-family:ui-monospace,monospace;font-size:9.5px;letter-spacing:.16em;text-transform:uppercase;color:#7f8fa3;text-align:left;
  padding:9px 12px;border-bottom:1px solid #1d2733;background:#0d151d;position:sticky;top:0}
.vxgh-tabla td{padding:8px 12px;border-top:1px solid #151f2a;color:#b8c5d3;vertical-align:middle}
.vxgh-tabla tr[data-on="1"] td{background:#1a1408;color:#f4e7c8}
.vxgh-tabla a{color:#dbe6f1;text-decoration:none;font-weight:600}
.vxgh-tabla a:hover{color:#f2b74a}
.vxgh-num{font-family:ui-monospace,monospace;text-align:right;white-space:nowrap}
.vxgh-barra{height:5px;background:#16202b;position:relative;min-width:60px}
.vxgh-barra i{position:absolute;inset:0 auto 0 0;background:linear-gradient(90deg,#d81f26,#f2b74a)}
.vxgh-tag{font-family:ui-monospace,monospace;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;padding:2px 6px;border:1px solid #2c3d4d;color:#8fa3b8;white-space:nowrap}
.vxgh-tag.alta{color:#ff8177;border-color:#7a2b26;background:#1a0a09}
.vxgh-tag.media{color:#f2b74a;border-color:#6b5323;background:#171004}
.vxgh-tag.baja{color:#8fc7ec;border-color:#2b4a63;background:#0a1520}
.vxgh-scroll{max-height:520px;overflow:auto}
.vxgh-ficha{padding:14px 16px}
.vxgh-ficha h3{margin:0 0 4px;font-family:ui-monospace,monospace;font-size:20px;color:#eef4fa;letter-spacing:-.01em}
.vxgh-ficha p{margin:0;color:#93a4b8;font-size:13px}
.vxgh-mini{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:12px}
.vxgh-mini div{border:1px solid #1e2a37;background:#080e14;padding:9px 11px}
.vxgh-mini b{display:block;font-family:ui-monospace,monospace;font-size:17px;color:#dbe6f1}
.vxgh-mini span{display:block;font-family:ui-monospace,monospace;font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:#6f8296;margin-top:4px}
.vxgh-serie{display:flex;align-items:flex-end;gap:4px;height:138px;margin-top:14px;padding-top:8px;border-top:1px solid #1b2734}
.vxgh-serie div{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:4px;height:100%}
.vxgh-serie i{display:block;width:100%;background:linear-gradient(180deg,#f2b74a,#8a5a10);min-height:2px}
.vxgh-serie i.vacia{background:#1b2734}
.vxgh-serie span{font-family:ui-monospace,monospace;font-size:8.5px;color:#5f7285}
.vxgh-nota{padding:11px 16px;border-top:1px solid #1b2734;font-size:12px;color:#7f8fa3;line-height:1.55}
.vxgh-nota b{color:#cbd8e5}
.vxgh-scroll{width:100%;max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}
.vxgh-scroll table{min-width:520px}
@media (max-width:520px){.vxgh-scroll{border:1px solid rgba(255,255,255,.06)}}
.vxgh-fotos{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:14px}
@media (max-width:900px){.vxgh-fotos{grid-template-columns:repeat(2,1fr)}}
.vxgh-foto{border:1px solid #22303f;background:#0a1017;overflow:hidden}
.vxgh-foto img{display:block;width:100%;height:150px;object-fit:cover;filter:saturate(.75) contrast(1.05)}
.vxgh-foto p{margin:0;padding:9px 11px;font-size:11.5px;color:#8b9cb0;line-height:1.5}
.vxgh-foto p b{display:block;color:#dbe6f1;font-family:ui-monospace,monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;margin-bottom:4px}
.vxgh-tab{margin-top:14px}
.vxgh-tab td:first-child{white-space:nowrap;font-family:ui-monospace,monospace;font-size:11.5px;color:#a9bccd}
.vxgh-aviso{border:1px solid #6b5323;background:#140f05;padding:14px 16px;margin-top:16px;font-size:13.5px;color:#d7c39a;line-height:1.6}
.vxgh-aviso b{color:#f2b74a}
.vxgh-humano{border-left:3px solid #d81f26;background:linear-gradient(90deg,rgba(216,31,38,.10),transparent);padding:14px 16px;margin-top:16px;font-size:13.5px;color:#c9d6e3;line-height:1.6}
.vxgh-humano b{color:#ff8177}
.vxgh-nav{display:flex;flex-wrap:wrap;gap:8px;margin-top:20px;position:relative}
.vxgh-nav a{font-family:ui-monospace,monospace;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;padding:6px 11px;border:1px solid #24313f;color:#93a4b8;text-decoration:none;background:#0a1017}
.vxgh-nav a:hover{border-color:#f2b74a;color:#f2b74a}
.vxgh-mundo{display:flex;align-items:flex-end;gap:3px;height:130px;margin-top:12px;padding:12px 16px 0;border-top:1px solid #1b2734}
.vxgh-mundo div{flex:1;display:flex;flex-direction:column;justify-content:flex-end;gap:3px;height:100%}
.vxgh-mundo i{display:block;width:100%;background:linear-gradient(180deg,#4a90c2,#16344a);min-height:2px}
.vxgh-mundo i.ref{background:linear-gradient(180deg,#d81f26,#4a1414)}
.vxgh-leyenda-mundo{display:flex;gap:16px;padding:8px 16px 12px;font-family:ui-monospace,monospace;font-size:10.5px;color:#7f8fa3}
.vxgh-leyenda-mundo span{display:inline-flex;gap:6px;align-items:center}
.vxgh-leyenda-mundo i{width:9px;height:9px;display:inline-block}
`;

type Params = { anio?: string; pais?: string; vista?: string };

export default async function GuerraHumanidad({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = (await searchParams) ?? {};
  const [{ datos: combate, procedencia }, { datos: desplazamiento, mundo, procedencia: procDesp }] = await Promise.all([
    cargarCombate(),
    cargarDesplazamiento(),
  ]);

  const ANIOS = SNAP.anios.combate;
  const anioPedido = Number.parseInt(String(sp.anio ?? ""), 10);
  const ultimoConDato = [...ANIOS].reverse().find((a) => totalAnio(combate, a).total > 0) ?? 2024;
  const anio = ANIOS.includes(anioPedido) ? anioPedido : ultimoConDato;
  const vista: "combate" | "desplazamiento" = sp.vista === "desplazamiento" ? "desplazamiento" : "combate";

  const geoPorIso3 = new Map(PAISES_GEO.map((p) => [p.iso3, p]));

  // ── filas del año elegido, según la vista ──────────────────────────
  const filas: { iso3: string; nombre: string; iso2: string; valor: number; desplazamiento?: (typeof desplazamiento)[string] }[] =
    vista === "combate"
      ? ranking(combate, anio).map((r) => {
          const g = geoPorIso3.get(r.iso3);
          return { iso3: r.iso3, nombre: g?.nombre ?? r.iso3, iso2: g?.iso2 ?? "", valor: r.valor };
        })
      : Object.entries(desplazamiento)
          .map(([iso3, d]) => {
            const g = geoPorIso3.get(iso3);
            return { iso3, nombre: g?.nombre ?? iso3, iso2: g?.iso2 ?? "", valor: d.desplazadosInternos + d.refugiados + d.solicitantes, desplazamiento: d };
          })
          .filter((x) => x.valor > 0)
          .sort((a, b) => b.valor - a.valor);

  const maximo = filas[0]?.valor ?? 1;
  const paisPedido = String(sp.pais ?? "").toUpperCase();
  const sel = filas.find((f) => f.iso3 === paisPedido) ?? filas[0] ?? null;

  const puntos: PuntoGuerra[] = [];
  for (const f of filas) {
    const g = geoPorIso3.get(f.iso3);
    if (!g) continue;
    puntos.push({
      iso3: f.iso3,
      nombre: f.nombre,
      lat: g.lat,
      lng: g.lng,
      valor: f.valor,
      href: `/war-humanity?anio=${anio}&vista=${vista}&pais=${f.iso3}#pais`,
      seleccionado: sel?.iso3 === f.iso3,
    });
  }

  const totales = totalAnio(combate, anio);
  const mundoAnio = mundo.find((m) => m.anio === 2024) ?? mundo[mundo.length - 1];
  const mundoAnterior = mundo.length > 1 ? mundo[mundo.length - 2] : undefined;
  const seriePais = sel ? serieDe(combate, sel.iso3, ANIOS) : [];
  const maxSerie = Math.max(1, ...seriePais.map((s) => s.valor ?? 0));
  const aniosConDato = seriePais.filter((s) => (s.valor ?? 0) > 0);
  const pico = aniosConDato.slice().sort((a, b) => (b.valor ?? 0) - (a.valor ?? 0))[0];
  const geo = sel ? geoPorIso3.get(sel.iso3) : undefined;
  const desp = sel ? desplazamiento[sel.iso3] : undefined;

  const maxMundo = Math.max(1, ...mundo.map((m) => m.desplazadosInternos + m.refugiados));
  const selHref = (iso3: string) => `/war-humanity?anio=${anio}&vista=${vista}&pais=${iso3}#pais`;

  return (
    <main className="mx-auto w-full max-w-[1500px] px-3 py-5 sm:px-5 vxgh">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="vxgh-wrap" style={{ padding: 0 }}>
        {/* ── HÉROE ───────────────────────────────────────────────── */}
        <header className="vxgh-hero">
          <span className="vxgh-sello">◆ Centro mundial · guerras, conflictos y crisis humanitarias</span>
          <h1 className="vxgh-h1">
            War <em>&amp;</em> Humanity
          </h1>
          <p className="vxgh-lead">
            Donde está la guerra, cuánta gente muere en combate y cuánta gente ha tenido que dejar su casa. Con{" "}
            <b>cada cifra fechada y firmada</b>: muertes declaradas por UCDP/PRIO a través del Banco Mundial y población desplazada
            declarada por UNHCR. Y con los huecos a la vista: <b>lo que no se puede citar, no se pone</b>.
          </p>

          <div className="vxgh-cifras">
            <div className="vxgh-cifra">
              <b className="rojo">{cifra(totales.total)}</b>
              <span>Muertes en combate · {anio}</span>
              <i>UCDP/PRIO vía Banco Mundial</i>
            </div>
            <div className="vxgh-cifra">
              <b>{cifra(mundoAnio?.desplazadosInternos)}</b>
              <span>Desplazados internos · {mundoAnio?.anio}</span>
              <i>UNHCR · por origen declarado</i>
            </div>
            <div className="vxgh-cifra">
              <b>{cifra(mundoAnio?.refugiados)}</b>
              <span>Refugiados · {mundoAnio?.anio}</span>
              <i>UNHCR</i>
            </div>
            <div className="vxgh-cifra">
              <b>{cifra(totales.paises)}</b>
              <span>Países con combate · {anio}</span>
              <i>con dato declarado</i>
            </div>
          </div>

          {/* ── FILTROS (formulario nativo: funciona sin JavaScript) ── */}
          <form className="vxgh-filtros" method="get" action="/war-humanity">
            <label>
              Año
              <select name="anio" defaultValue={String(anio)}>
                {[...ANIOS].reverse().map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>
            <label>
              País
              <select name="pais" defaultValue={sel?.iso3 ?? ""}>
                {filas.slice(0, 90).map((f) => (
                  <option key={f.iso3} value={f.iso3}>
                    {f.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Qué se mide
              <select name="vista" defaultValue={vista}>
                <option value="combate">Muertes en combate</option>
                <option value="desplazamiento">Desplazamiento forzado</option>
              </select>
            </label>
            <button type="submit">Aplicar</button>
            <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: "#5f7285", marginLeft: "auto" }}>
              {procedencia.vivo ? "● leyendo la API en vivo" : "○ instantánea guardada"}
            </span>
          </form>

          <div className="vxgh-anios" aria-label="Elegir año">
            {ANIOS.map((a) => (
              <Link key={a} href={`/war-humanity?anio=${a}&vista=${vista}${sel ? `&pais=${sel.iso3}` : ""}#mapa`} data-on={a === anio ? "1" : "0"}>
                {a}
              </Link>
            ))}
          </div>

          <nav className="vxgh-nav" aria-label="Secciones de War & Humanity">
            <a href="#mapa">Mapa y zonas</a>
            <a href="#pais">Ficha del país</a>
            <a href="#historico">Comparación histórica</a>
            <a href="#cronologia">Cronología</a>
            <a href="#archivo">Archivo fotográfico</a>
            <a href="#fuentes">Fuentes y límites</a>
          </nav>
        </header>

        {/* ── MAPA + ZONAS ────────────────────────────────────────── */}
        <section id="mapa" className="vxgh-grid">
          <div className="vxgh-caja">
            <h2>
              Mapa de conflictos <span>{vista === "combate" ? `muertes en combate · ${anio}` : "desplazamiento forzado · por origen"}</span>
            </h2>
            <MapaGuerra
              puntos={puntos}
              maximo={maximo}
              etiqueta={`Mapa del mundo con ${puntos.length} países con ${vista === "combate" ? "muertes en combate declaradas" : "población desplazada"} en ${anio}`}
            />
            <div className="vxgh-leyenda">
              <span>
                <i style={{ background: COLOR_INTENSIDAD.alta }} /> {ETIQUETA_INTENSIDAD.alta}
              </span>
              <span>
                <i style={{ background: COLOR_INTENSIDAD.media }} /> {ETIQUETA_INTENSIDAD.media}
              </span>
              <span>
                <i style={{ background: COLOR_INTENSIDAD.baja }} /> {ETIQUETA_INTENSIDAD.baja}
              </span>
              <span style={{ marginLeft: "auto" }}>el área crece con la cifra, no el radio</span>
            </div>
            <p className="vxgh-nota">
              Cada burbuja es un enlace: al tocar un país se abre su ficha aquí abajo. Los países sin dato no se pintan —no se
              pintan como cero—. Geografía: Natural Earth 110m, la misma del resto de la casa.
            </p>
          </div>

          <div className="vxgh-caja">
            <h2>
              Zonas afectadas <span>{filas.length} países con dato</span>
            </h2>
            <div className="vxgh-scroll">
              <div className="vxgh-scroll">
              <table className="vxgh-tabla">
                <thead>
                  <tr>
                    <th>País</th>
                    <th style={{ textAlign: "right" }}>{vista === "combate" ? "Muertes" : "Personas"}</th>
                    <th>Peso</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.slice(0, 40).map((f) => (
                    <tr key={f.iso3} data-on={sel?.iso3 === f.iso3 ? "1" : "0"}>
                      <td>
                        <Link href={selHref(f.iso3)}>{f.nombre}</Link>{" "}
                        <span className={`vxgh-tag ${claseDeIntensidad(f.valor)}`}>{claseDeIntensidad(f.valor)}</span>
                      </td>
                      <td className="vxgh-num">{cifra(f.valor)}</td>
                      <td>
                        <div className="vxgh-barra">
                          <i style={{ width: `${Math.max(2, (f.valor / maximo) * 100)}%` }} />
                        </div>
                        <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: "#6f8296" }}>{porcentaje(f.valor, maximo)} del mayor</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
            <p className="vxgh-nota">
              {vista === "combate"
                ? `Muertes en combate declaradas en ${anio}. Fuente: UCDP/PRIO, indicador VC.BTL.DETH del Banco Mundial.`
                : `Desplazados internos + refugiados + solicitantes de asilo por país de origen. Fuente: UNHCR (${desp?.anio ?? 2024}).`}
            </p>
          </div>
        </section>

        {/* ── FICHA DEL PAÍS ──────────────────────────────────────── */}
        <section id="pais" className="vxgh-grid" style={{ marginTop: 16 }}>
          <div className="vxgh-caja">
            <h2>
              Cronología del conflicto · {sel?.nombre ?? "sin país elegido"} <span>serie 2014–2024</span>
            </h2>
            <div className="vxgh-ficha">
              {sel ? (
                <>
                  <p style={{ marginBottom: 10 }}>
                    Muertes en combate declaradas por año. {pico ? `El año más alto de la serie es ${pico.anio}, con ${cifra(pico.valor)}.` : ""}{" "}
                    {aniosConDato.length === 0 ? "La fuente no declara muertes en combate para este país en ningún año de la serie." : ""}
                  </p>
                  <div className="vxgh-serie" role="img" aria-label={`Serie de muertes en combate de ${sel.nombre}, 2014 a 2024`}>
                    {seriePais.map((s) => (
                      <div key={s.anio} title={`${s.anio}: ${s.valor === undefined ? "sin dato" : cifra(s.valor)}`}>
                        <i
                          className={s.valor ? "" : "vacia"}
                          style={{ height: s.valor ? `${Math.max(3, ((s.valor ?? 0) / maxSerie) * 100)}%` : "2px" }}
                        />
                        <span>{String(s.anio).slice(2)}</span>
                      </div>
                    ))}
                  </div>
                  <p className="vxgh-nota" style={{ borderTop: "1px solid #1b2734", margin: "12px -16px -14px", padding: "10px 16px" }}>
                    Años con cifra: <b>{aniosConDato.length} de {ANIOS.length}</b>. Los años sin dato se dibujan como línea plana, no como
                    cero.
                  </p>
                </>
              ) : (
                <p>Elige un país en el mapa o en la lista.</p>
              )}
            </div>
          </div>

          <div className="vxgh-caja">
            <h2>
              Ficha <span>{etiquetaLugar(geo?.subregion || geo?.region || "")}</span>
            </h2>
            <div className="vxgh-ficha">
              <h3>{sel?.nombre ?? "—"}</h3>
              <p>
                {geo ? `${etiquetaLugar(geo.region)} · ${etiquetaLugar(geo.subregion)}` : "sin geografía declarada"}
                {sel ? ` · ${sel.iso3}` : ""}
              </p>
              <div className="vxgh-mini">
                <div>
                  <b className="rojo">{cifra(valorDe(combate, sel?.iso3 ?? "", anio))}</b>
                  <span>muertes en combate · {anio}</span>
                </div>
                <div>
                  <b>{cifra(desp ? desp.desplazadosInternos : undefined)}</b>
                  <span>desplazados internos · {desp?.anio ?? "s/d"}</span>
                </div>
                <div>
                  <b>{cifra(desp ? desp.refugiados : undefined)}</b>
                  <span>refugiados · {desp?.anio ?? "s/d"}</span>
                </div>
                <div>
                  <b>{cifra(desp ? desp.solicitantes : undefined)}</b>
                  <span>solicitantes de asilo · {desp?.anio ?? "s/d"}</span>
                </div>
              </div>
              <p style={{ marginTop: 12, fontSize: 12.5, lineHeight: 1.6 }}>
                Cada cifra es del año que dice al lado. Donde la fuente no declara nada, dice <b>sin dato</b>: no ponemos un cero que
                mienta.
              </p>
              {geo ? (
                <p style={{ marginTop: 10 }}>
                  <Link href={`/mundos/${geo.iso2}`} style={{ color: "#f2b74a", fontWeight: 600 }}>
                    Ver el país en El mundo →
                  </Link>
                </p>
              ) : null}
            </div>
          </div>
        </section>

        {/* ── COMPARACIÓN HISTÓRICA ───────────────────────────────── */}
        <section id="historico" className="vxgh-caja" style={{ marginTop: 16 }}>
          <h2>
            Comparación histórica · el mundo, 2014–2024 <span>mismas fuentes, misma serie</span>
          </h2>
          <div className="vxgh-mundo" role="img" aria-label="Serie mundial de desplazamiento forzado 2014 a 2024">
            {mundo.map((m) => {
              const total = m.desplazadosInternos + m.refugiados;
              return (
                <div key={m.anio} title={`${m.anio} · ${cifra(total)}`}>
                  <i className="ref" style={{ height: `${Math.max(2, (m.refugiados / maxMundo) * 100)}%` }} />
                  <i style={{ height: `${Math.max(2, (m.desplazadosInternos / maxMundo) * 100)}%` }} />
                </div>
              );
            })}
          </div>
          <div className="vxgh-leyenda-mundo">
            <span>
              <i style={{ background: "#d81f26" }} /> refugiados
            </span>
            <span>
              <i style={{ background: "#4a90c2" }} /> desplazados internos
            </span>
            <span style={{ marginLeft: "auto" }}>
              {mundo[0]?.anio} → {mundo[mundo.length - 1]?.anio} · UNHCR
            </span>
          </div>
          <div style={{ padding: "0 16px 14px" }}>
            <div className="vxgh-scroll">
            <table className="vxgh-tabla vxgh-tab">
              <thead>
                <tr>
                  <th>Año</th>
                  <th style={{ textAlign: "right" }}>Muertes en combate</th>
                  <th style={{ textAlign: "right" }}>Refugiados</th>
                  <th style={{ textAlign: "right" }}>Desplazados internos</th>
                  <th style={{ textAlign: "right" }}>Total desplazado</th>
                </tr>
              </thead>
              <tbody>
                {[...ANIOS].reverse().map((a) => {
                  const t = totalAnio(combate, a);
                  const m = mundo.find((x) => x.anio === a);
                  return (
                    <tr key={a} data-on={a === anio ? "1" : "0"}>
                      <td>
                        <Link href={`/war-humanity?anio=${a}&vista=${vista}${sel ? `&pais=${sel.iso3}` : ""}#historico`}>{a}</Link>
                      </td>
                      <td className="vxgh-num">{t.total ? cifra(t.total) : "sin dato"}</td>
                      <td className="vxgh-num">{m ? cifra(m.refugiados) : "sin dato"}</td>
                      <td className="vxgh-num">{m ? cifra(m.desplazadosInternos) : "sin dato"}</td>
                      <td className="vxgh-num">{m ? cifra(m.refugiados + m.desplazadosInternos) : "sin dato"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
            <p className="vxgh-nota" style={{ marginTop: 10 }}>
              Las dos columnas de la izquierda y las dos de la derecha no se suman entre sí: son cosas distintas y de fuentes
              distintas. {mundoAnterior ? `El desplazamiento total pasó de ${cifra(mundoAnterior.refugiados + mundoAnterior.desplazadosInternos)} (${mundoAnterior.anio}) a ${cifra((mundoAnio?.refugiados ?? 0) + (mundoAnio?.desplazadosInternos ?? 0))} (${mundoAnio?.anio}).` : ""}
            </p>
          </div>
        </section>

        {/* ── CRONOLOGÍA ──────────────────────────────────────────── */}
        <section id="cronologia" className="vxgh-caja" style={{ marginTop: 16 }}>
          <h2>
            Cronología <span>los años que la fuente sí declara, país por país</span>
          </h2>
          <div style={{ padding: "12px 16px 16px" }}>
            <p style={{ margin: "0 0 12px", color: "#93a4b8", fontSize: 13.5 }}>
              Una cronología honesta de un conflicto no se puede escribir sin sus cifras: ésta sale de la serie de muertes en combate y
              dice, año a año, en qué países hubo guerra declarada y con qué intensidad. Se puede filtrar por año con los botones de
              arriba.
            </p>
            <div className="vxgh-scroll">
            <table className="vxgh-tabla">
              <thead>
                <tr>
                  <th>Año</th>
                  <th style={{ textAlign: "right" }}>Países con combate</th>
                  <th style={{ textAlign: "right" }}>Muertes declaradas</th>
                  <th>Los tres primeros</th>
                </tr>
              </thead>
              <tbody>
                {[...ANIOS].reverse().map((a) => {
                  const t = totalAnio(combate, a);
                  const top3 = ranking(combate, a).slice(0, 3);
                  return (
                    <tr key={a} data-on={a === anio ? "1" : "0"}>
                      <td>
                        <Link href={`/war-humanity?anio=${a}&vista=combate${sel ? `&pais=${sel.iso3}` : ""}#cronologia`}>{a}</Link>
                      </td>
                      <td className="vxgh-num">{t.paises || "sin dato"}</td>
                      <td className="vxgh-num">{t.total ? cifra(t.total) : "sin dato"}</td>
                      <td>
                        {top3.length
                          ? top3
                              .map((x) => `${geoPorIso3.get(x.iso3)?.nombre ?? x.iso3} (${cifra(x.valor)})`)
                              .join(" · ")
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        </section>

        {/* ── FOTOGRAFÍA ──────────────────────────────────────────── */}
        <section id="archivo" className="vxgh-caja" style={{ marginTop: 16 }}>
          <h2>
            Archivo documental <span>fotografía real de la casa · sin imágenes generadas</span>
          </h2>
          <div style={{ padding: "0 16px 16px" }}>
            <div className="vxgh-fotos">
              <figure className="vxgh-foto" style={{ margin: 0 }}>
                <img src="/imagenes-reales/onu.jpg" alt="Sede de las Naciones Unidas" loading="lazy" />
                <p>
                  <b>Naciones Unidas</b>Donde se declaran las crisis y se pide el dinero de la ayuda.
                </p>
              </figure>
              <figure className="vxgh-foto" style={{ margin: 0 }}>
                <img src="/imagenes-reales/khmer.jpg" alt="Templos de Angkor, en Camboya" loading="lazy" />
                <p>
                  <b>Camboya</b>El país del genocidio jemer: el caso que enseñó al mundo a contar víctimas civiles.
                </p>
              </figure>
              <figure className="vxgh-foto" style={{ margin: 0 }}>
                <img src="/imagenes-reales/muroberlin.jpg" alt="Restos del Muro de Berlín" loading="lazy" />
                <p>
                  <b>Berlín</b>El muro: la comparación histórica con la que se mide casi todo.
                </p>
              </figure>
              <figure className="vxgh-foto" style={{ margin: 0 }}>
                <img src="/imagenes-reales/portaaviones.jpg" alt="Portaaviones en el mar" loading="lazy" />
                <p>
                  <b>Proyección naval</b>Donde el conflicto se vuelve noticia antes de tener cifras.
                </p>
              </figure>
            </div>
            <p className="vxgh-nota" style={{ marginTop: 12, borderTop: "1px solid #1b2734", paddingTop: 10 }}>
              Fotografías del archivo real de Vanguard (no generadas por IA). El pie describe el tema del archivo, no un suceso fechado:
              no atribuimos una imagen a un conflicto concreto sin poder demostrarlo.
            </p>
          </div>
        </section>

        {/* ── FUENTES Y LÍMITES ───────────────────────────────────── */}
        <section id="fuentes" className="vxgh-caja" style={{ marginTop: 16 }}>
          <h2>
            Fuentes internacionales <span>{procedencia.vivo ? "API en vivo" : "instantánea guardada"} · {procDesp.nota}</span>
          </h2>
          <div style={{ padding: "12px 16px 6px" }}>
            <div className="vxgh-scroll">
            <table className="vxgh-tabla vxgh-tab">
              <thead>
                <tr>
                  <th>Fuente</th>
                  <th>Qué aporta</th>
                  <th>Última actualización</th>
                  <th>Licencia</th>
                </tr>
              </thead>
              <tbody>
                {SNAP.meta.fuentes.map((f) => (
                  <tr key={f.id}>
                    <td>
                      <a href={f.url} target="_blank" rel="noopener noreferrer">
                        {f.nombre}
                      </a>
                    </td>
                    <td>{f.quéEs}</td>
                    <td>{f.ultimaActualizacionFuente ?? "—"}</td>
                    <td>{f.licencia ?? "—"}</td>
                  </tr>
                ))}
                <tr>
                  <td>
                    <a href="https://www.ohchr.org/en/press-releases" target="_blank" rel="noopener noreferrer">
                      OHCHR · oficina de derechos humanos
                    </a>
                  </td>
                  <td>Víctimas civiles verificadas, publicadas en informes por país (no hay serie abierta sin clave de acceso).</td>
                  <td>—</td>
                  <td>Uso con atribución</td>
                </tr>
                <tr>
                  <td>
                    <a href="https://ucdp.uu.se/" target="_blank" rel="noopener noreferrer">
                      UCDP · Uppsala Conflict Data Program
                    </a>
                  </td>
                  <td>Datos de conflicto: muertes en combate, violencia unilateral y eventos geolocalizados.</td>
                  <td>2026-11-11 (Banco Mundial)</td>
                  <td>CC BY 4.0</td>
                </tr>
                <tr>
                  <td>
                    <a href="https://www.unocha.org/" target="_blank" rel="noopener noreferrer">
                      OCHA · coordinación humanitaria
                    </a>
                  </td>
                  <td>Planes de respuesta, personas necesitadas y financiación por crisis.</td>
                  <td>—</td>
                  <td>Uso con atribución</td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>
          <div style={{ padding: "0 16px 16px" }}>
            <div className="vxgh-aviso">
              <b>Lo que esta sala NO afirma.</b>
              <ul style={{ margin: "8px 0 0", paddingLeft: 18, lineHeight: 1.7 }}>
                {SNAP.meta.limitaciones.map((l) => (
                  <li key={l}>{l}</li>
                ))}
                <li>
                  No se ofrece un filtro por «tipo de conflicto» porque la fuente abierta conectada no lo desglosa. Poner etiquetas
                  nuestras (interestatal, interno, unilateral) sería clasificar nosotros lo que la fuente no clasifica.
                </li>
              </ul>
            </div>
            <div className="vxgh-humano">
              <b>Detrás de cada cifra hay una persona.</b> Esta sala cuenta lo que las organizaciones pueden verificar, y la
              verificación siempre llega tarde y siempre se queda corta: los muertos sin identificar no aparecen en ninguna serie y los
              desplazados que no se registran tampoco. Cuando la cifra dice «sin dato», no significa que allí no pase nada.
            </div>
            <p className="vxgh-nota" style={{ marginTop: 14, borderTop: "1px solid #1b2734", paddingTop: 10 }}>
              Instantánea de datos: <b>{SNAP.meta.generado}</b>. Actualización automática: la sala vuelve a pedir las cifras a las dos
              APIs cada 24 horas y, si no contestan, sigue leyendo la instantánea y lo dice. {procedencia.nota}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

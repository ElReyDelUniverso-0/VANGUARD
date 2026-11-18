import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth-server";
import { configuracion } from "@/lib/busqueda-google/cliente";
import { accesoADatos } from "@/lib/busqueda-google/acceso";
import {
  comprobacionesPublicas,
  probarConexion,
  informe,
  paginasDeLaCasa,
  DIAS_PERMITIDOS,
  type Dias,
  type InformeCompleto,
  type ResultadoPrueba,
} from "@/lib/busqueda-google/servicio";
import { UMBRALES } from "@/lib/busqueda-google/analisis";
import { NOMBRE_TIPO, TIPOS_OPORTUNIDAD, type TipoOportunidad } from "@/lib/busqueda-google/tipos";

// ============================================================
// v415.0 · /oportunidades — VANGUARD SEARCH OPPORTUNITIES
//
// El panel de oportunidades de búsqueda orgánica. Cada fila sale de la API de
// Google Search Console (searchAnalytics.query) en el momento de abrirlo —con
// caché de 6 h—; si no hay credenciales, la tabla queda VACÍA y lo dice: aquí
// no hay filas de ejemplo ni posiciones inventadas, y ninguna acción promete
// un puesto en Google.
// ============================================================

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export const metadata: Metadata = {
  title: "VANGUARD SEARCH OPPORTUNITIES — oportunidades de búsqueda orgánica | VANGUARD",
  description:
    "Panel interno de VANGUARD conectado a Google Search Console: consultas, páginas, impresiones, clics, CTR, posición media y la acción recomendada para cada oportunidad.",
  alternates: { canonical: "/oportunidades" },
  robots: { index: false, follow: false },
};

const caja = "rounded-md border border-zinc-800 bg-zinc-900/40 p-4";
const titulo = "font-mono text-[10px] uppercase tracking-[0.2em] text-amber/70";
const enlace = "font-mono text-[10px] uppercase tracking-widest text-amber hover:underline";

const n = (x: number) => x.toLocaleString("es-ES");
const pct = (x: number | null) => (x === null ? "sin dato" : `${(x * 100).toLocaleString("es-ES", { maximumFractionDigits: 1 })} %`);
const pos = (x: number | null) => (x === null ? "sin dato" : x.toLocaleString("es-ES", { maximumFractionDigits: 1 }));

function Marca({ ok }: { ok: boolean | null }) {
  if (ok === null) return <span className="text-zinc-500">·</span>;
  return <span className={ok ? "text-emerald-400" : "text-red-400"}>{ok ? "✓" : "✗"}</span>;
}

const COLUMNAS = [
  "Consulta de búsqueda",
  "Página relacionada",
  "Impresiones",
  "Clics",
  "CTR",
  "Posición media",
  "Oportunidad detectada",
  "Acción recomendada",
];

type Params = Promise<Record<string, string | string[] | undefined>>;

export default async function OportunidadesPage({ searchParams }: { searchParams: Params }) {
  const sp = await searchParams;
  const uno = (k: string) => (Array.isArray(sp[k]) ? sp[k]?.[0] : (sp[k] as string | undefined));
  const diasCrudo = Number(uno("dias") ?? 28);
  const dias: Dias = (DIAS_PERMITIDOS as readonly number[]).includes(diasCrudo) ? (diasCrudo as Dias) : 28;
  const tipoCrudo = uno("tipo");
  const tipo = tipoCrudo && (TIPOS_OPORTUNIDAD as readonly string[]).includes(tipoCrudo) ? (tipoCrudo as TipoOportunidad) : null;
  const pedirPrueba = uno("probar") === "1";

  const cfg = configuracion();
  const jar = await cookies();
  const acceso = accesoADatos(jar.get(SESSION_COOKIE)?.value ?? null);
  const publicas = await comprobacionesPublicas();
  const paginas = paginasDeLaCasa();

  let prueba: ResultadoPrueba | null = null;
  let inf: InformeCompleto | null = null;
  let errorInforme: string | null = null;
  if (acceso.permitido && pedirPrueba) prueba = await probarConexion();
  if (acceso.permitido && cfg.lista) {
    try {
      inf = await informe(dias);
    } catch (e) {
      errorInforme = e instanceof Error ? e.message : String(e);
    }
  }
  const filas = inf ? inf.oportunidades.filter((o) => !tipo || o.tipo === tipo) : [];
  const q = (extra: Record<string, string | null>) => {
    const u = new URLSearchParams();
    const base: Record<string, string | null> = { dias: String(dias), tipo, ...extra };
    for (const [k, v] of Object.entries(base)) if (v) u.set(k, v);
    const s = u.toString();
    return s ? `/oportunidades?${s}` : "/oportunidades";
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <p className={titulo}>EL SISTEMA · BÚSQUEDA ORGÁNICA · GOOGLE SEARCH CONSOLE</p>
      <h1 className="mt-2 text-2xl font-bold text-zinc-100">VANGUARD SEARCH OPPORTUNITIES</h1>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-400">
        Qué busca la gente cuando Google enseña la casa, qué página aparece, cuántas veces la ven y la eligen,
        y qué conviene revisar. Todas las cifras salen de la API oficial de Search Console; si no hay
        conexión, la tabla queda vacía. No se estiman posiciones ni se promete ningún puesto.
      </p>

      {/* ── CONEXIÓN ── */}
      <section className="mt-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className={titulo}>LA CONEXIÓN CON GOOGLE</h2>
          <Link href="/api/sistema/busqueda-google" className={enlace}>
            /api/sistema/busqueda-google ▸
          </Link>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
          <div className={caja}>
            <p className="text-sm font-semibold text-zinc-200">
              <Marca ok={cfg.lista} /> Credenciales de Search Console en el servidor
            </p>
            <p className="mt-1 text-[12px] leading-snug text-zinc-400">
              {cfg.lista
                ? `Configuradas (modo ${cfg.modo}${cfg.cuentaServicio ? `, ${cfg.cuentaServicio}` : ""}).`
                : cfg.aviso ?? "No hay ninguna. La integración está lista, pero sin credenciales no se pide ni se enseña ningún dato."}
            </p>
            <p className="mt-1 font-mono text-[11px] text-zinc-500">Propiedad: {cfg.sitio}</p>
          </div>
          <div className={caja}>
            <p className="text-sm font-semibold text-zinc-200">
              <Marca ok={acceso.permitido} /> Acceso a los datos privados
            </p>
            <p className="mt-1 text-[12px] leading-snug text-zinc-400">{acceso.motivo}</p>
            {!acceso.duenoBlindado && (
              <p className="mt-1 text-[11px] leading-snug text-red-300/90">
                AUTH_SECRET u OWNER_PASSWORD no están definidas en el servidor.
              </p>
            )}
          </div>
          {publicas.map((c) => (
            <div key={c.id} className={caja}>
              <p className="text-sm font-semibold text-zinc-200">
                <Marca ok={c.ok} /> {c.nombre}
              </p>
              <p className="mt-1 text-[12px] leading-snug text-zinc-400">{c.detalle}</p>
            </div>
          ))}
        </div>
        {acceso.permitido && (
          <p className="mt-3">
            <Link href={q({ probar: "1" })} className={enlace}>
              Probar la conexión ahora ▸
            </Link>
          </p>
        )}
        {prueba && (
          <div className={`${caja} mt-3`}>
            <p className="text-sm font-semibold text-zinc-200">
              <Marca ok={prueba.conectado} /> Prueba real contra Google · {prueba.sitio}
            </p>
            <ol className="mt-2 space-y-1">
              {prueba.pasos.map((p, i) => (
                <li key={i} className="text-[12px] leading-snug text-zinc-400">
                  <Marca ok={p.ok} /> <strong className="text-zinc-200">{p.paso}</strong> — {p.detalle}
                  {p.ms ? <span className="text-zinc-600"> · {p.ms} ms</span> : null}
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      {/* ── CÓMO CONECTAR (solo si falta) ── */}
      {!cfg.lista && (
        <section className="mt-10">
          <h2 className={titulo}>CÓMO CONECTARLA (UNA VEZ)</h2>
          <ol className={`${caja} mt-3 list-decimal space-y-2 pl-8 text-[13px] leading-relaxed text-zinc-300`}>
            <li>
              En Google Cloud Console, crea (o elige) un proyecto y activa la <strong>Google Search Console API</strong>.
            </li>
            <li>
              Crea una <strong>cuenta de servicio</strong> y descarga su clave en JSON. No hace falta darle ningún rol en
              el proyecto.
            </li>
            <li>
              En Search Console, abre la propiedad <code className="text-amber">{cfg.sitio}</code> → Configuración →
              Usuarios y permisos → Añadir usuario: pega el <code className="text-amber">client_email</code> de la cuenta
              de servicio con permiso <strong>Restringido</strong> (solo lectura basta).
            </li>
            <li>
              En Vercel → vanguard-kq9r → Settings → Environment Variables, crea{" "}
              <code className="text-amber">GSC_SERVICE_ACCOUNT_JSON</code> con el JSON completo (o en base64) para
              Production. Si la propiedad es de dominio, añade también <code className="text-amber">GSC_SITE_URL</code> ={" "}
              <code className="text-amber">sc-domain:tu-dominio</code>.
            </li>
            <li>
              Define también <code className="text-amber">AUTH_SECRET</code> y <code className="text-amber">OWNER_PASSWORD</code>{" "}
              propios: sin ellos el panel no enseña datos privados a nadie.
            </li>
            <li>Vuelve a desplegar, entra en /modo con la cuenta DUENO y pulsa «Probar la conexión ahora».</li>
          </ol>
          <p className="mt-2 text-[11px] text-zinc-500">
            Alternativa: OAuth con tu propia cuenta de Google (GSC_OAUTH_CLIENT_ID, GSC_OAUTH_CLIENT_SECRET y
            GSC_OAUTH_REFRESH_TOKEN con el alcance webmasters.readonly).
          </p>
        </section>
      )}

      {/* ── RESUMEN DEL INFORME ── */}
      {inf && (
        <section className="mt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className={titulo}>
              PERIODO {inf.periodo.inicio} → {inf.periodo.fin} · {inf.periodo.dias} DÍAS CERRADOS
              {inf.cacheado ? " · DESDE CACHÉ" : ""}
            </h2>
            <div className="flex gap-3">
              {DIAS_PERMITIDOS.map((d) => (
                <Link key={d} href={q({ dias: String(d) })} className={`${enlace} ${d === dias ? "underline" : ""}`}>
                  {d} días
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
            {[
              ["Impresiones", n(inf.totales.impresiones)],
              ["Clics", n(inf.totales.clics)],
              ["CTR del sitio", pct(inf.totales.ctr)],
              ["Posición media del sitio", pos(inf.totales.posicion)],
            ].map(([k, v]) => (
              <div key={k} className={caja}>
                <p className="text-xl font-bold text-zinc-100">{v}</p>
                <p className="text-[11px] text-zinc-500">{k}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">
            {n(inf.control.filasConsultaPagina)} filas consulta × página · {n(inf.control.consultasDistintas)} consultas
            distintas · {n(inf.control.paginasConImpresiones)} páginas con impresiones · {inf.control.paginasImportantesSinImpresiones} de{" "}
            {inf.control.paginasImportantes} puertas importantes sin ninguna. Google no entrega como fila las consultas
            poco frecuentes (anonimizadas): por eso las filas no suman el total del sitio.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className={caja}>
              <h3 className={titulo}>POR TIPO DE OPORTUNIDAD</h3>
              <ul className="mt-2 space-y-1 text-[12px]">
                <li>
                  <Link href={q({ tipo: null })} className={!tipo ? "text-amber" : "text-zinc-300 hover:text-amber"}>
                    Todas · {inf.oportunidades.length}
                  </Link>
                </li>
                {inf.porTipo.map((t) => (
                  <li key={t.tipo}>
                    <Link href={q({ tipo: t.tipo })} className={tipo === t.tipo ? "text-amber" : "text-zinc-300 hover:text-amber"}>
                      {t.nombre} · {t.cuantas}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className={caja}>
              <h3 className={titulo}>POR CATEGORÍA DE LA CASA</h3>
              <ul className="mt-2 space-y-1 text-[12px] text-zinc-300">
                {inf.porCategoria.slice(0, 12).map((c) => (
                  <li key={c.categoria}>
                    {c.categoria} · {c.cuantas} oportunidad{c.cuantas === 1 ? "" : "es"} · {n(c.impresiones)} impresiones
                  </li>
                ))}
                {inf.porCategoria.length === 0 && <li className="text-zinc-500">Ninguna oportunidad en este periodo.</li>}
              </ul>
            </div>
          </div>

          <div className={`${caja} mt-3`}>
            <h3 className={titulo}>LA REFERENCIA: EL CTR DE LA PROPIA CASA POR FRANJA DE POSICIÓN</h3>
            <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
              {inf.franjas.map((f) => (
                <p key={f.franja} className="text-[12px] text-zinc-400">
                  <strong className="text-zinc-200">Posiciones {f.franja}</strong>: {pct(f.ctr)}{" "}
                  <span className="text-zinc-600">({n(f.clics)} / {n(f.impresiones)})</span>
                </p>
              ))}
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">
              Una franja con menos de {UMBRALES.minImpresionesFranja} impresiones no sirve de referencia («sin dato») y la regla
              de CTR bajo no se aplica en ella.
            </p>
          </div>
        </section>
      )}

      {/* ── LA TABLA ── */}
      <section className="mt-10">
        <h2 className={titulo}>
          OPORTUNIDADES{tipo ? ` · ${NOMBRE_TIPO[tipo].nombre.toUpperCase()}` : ""}
          {inf ? ` · ${filas.length}` : ""}
        </h2>
        {tipo && <p className="mt-1 text-[12px] text-zinc-400">{NOMBRE_TIPO[tipo].pregunta}</p>}
        <div className="mt-3 overflow-x-auto rounded-md border border-zinc-800">
          <table className="min-w-[1100px] w-full text-left text-[12px]">
            <thead className="bg-zinc-900/80 text-zinc-400">
              <tr>
                {COLUMNAS.map((c) => (
                  <th key={c} className="px-3 py-2 font-mono text-[10px] uppercase tracking-wider">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map((o) => (
                <tr key={o.id} className="border-t border-zinc-800 align-top">
                  <td className="px-3 py-2 text-zinc-200">{o.consulta ?? <span className="text-zinc-500">—</span>}</td>
                  <td className="px-3 py-2">
                    {o.ruta ? (
                      <Link href={o.ruta} className="text-amber hover:underline">
                        {o.ruta}
                      </Link>
                    ) : (
                      "—"
                    )}
                    <div className="text-[11px] text-zinc-500">{o.paginaNombre}</div>
                    {o.sugerida && (
                      <div className="mt-1 text-[11px] text-emerald-300">
                        mejor:{" "}
                        <Link href={o.sugerida.ruta} className="hover:underline">
                          {o.sugerida.ruta}
                        </Link>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 tabular-nums text-zinc-300">{n(o.impresiones)}</td>
                  <td className="px-3 py-2 tabular-nums text-zinc-300">{n(o.clics)}</td>
                  <td className="px-3 py-2 tabular-nums text-zinc-300">{pct(o.ctr)}</td>
                  <td className="px-3 py-2 tabular-nums text-zinc-300">{pos(o.posicion)}</td>
                  <td className="px-3 py-2 text-zinc-300">
                    <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-amber/80">{NOMBRE_TIPO[o.tipo].nombre}</span>
                    {o.detectada}
                  </td>
                  <td className="px-3 py-2 text-zinc-300">{o.accion}</td>
                </tr>
              ))}
              {filas.length === 0 && (
                <tr className="border-t border-zinc-800">
                  <td colSpan={COLUMNAS.length} className="px-3 py-6 text-center text-[12px] text-zinc-500">
                    {!cfg.lista
                      ? "Sin datos: Search Console no está conectado. No se muestran filas de ejemplo."
                      : !acceso.permitido
                        ? "Hay conexión configurada, pero estos datos son privados."
                        : errorInforme
                          ? `Google no entregó los datos: ${errorInforme}`
                          : "Ninguna oportunidad cumple las reglas en este periodo."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── LAS REGLAS ── */}
      <section className="mt-10">
        <h2 className={titulo}>CÓMO SE DETECTA CADA OPORTUNIDAD</h2>
        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
          {[
            [
              "CTR_BAJO",
              `Fila consulta × página con al menos ${UMBRALES.minImpresionesFila} impresiones, posición media hasta ${UMBRALES.posicionMaxCtrBajo} y un CTR por debajo de la mitad del CTR medio de la propia casa en su franja de posición.`,
            ],
            [
              "CONTENIDO_A_MEJORAR",
              `Página con al menos un clic y posición media (ponderada por Google) entre ${UMBRALES.posicionContenidoDesde} y ${UMBRALES.posicionContenidoHasta}: ya interesa, pero se queda al final de la primera página o en la segunda.`,
            ],
            [
              "SIN_IMPRESIONES",
              `Una de las ${paginas.filter((p) => p.importante).length} puertas importantes del directorio de la casa sin ninguna impresión en el periodo (se mira también si está en el sitemap).`,
            ],
            ["CANIBALIZACION", `Una consulta para la que dos o más páginas de la casa suman al menos ${UMBRALES.minImpresionesCanibal} impresiones cada una.`],
            [
              "PAGINA_MEJOR",
              `La consulta encaja al menos en un ${Math.round(UMBRALES.encajeSugerir * 100)} % con otra página real de la casa (directorio de ${paginas.length} páginas + fichas de país) distinta de la que muestra Google.`,
            ],
            ["HUECO", `Consulta con al menos ${UMBRALES.minImpresionesFila} impresiones, posición media peor que ${UMBRALES.posicionHueco} y ninguna página que la trate.`],
          ].map(([t, txt]) => (
            <div key={t} className={caja}>
              <p className="text-sm font-semibold text-zinc-200">{NOMBRE_TIPO[t as TipoOportunidad].nombre}</p>
              <p className="mt-1 text-[12px] leading-snug text-zinc-400">{txt}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-zinc-500">
          Las acciones dicen qué revisar; ninguna garantiza subir posiciones ni llegar al primer puesto. Search Console
          entrega los datos con 2–3 días de retraso, por eso el periodo termina hace tres días. Ver también{" "}
          <Link href="/sistema" className="text-amber hover:underline">
            /sistema
          </Link>{" "}
          y{" "}
          <Link href="/directorio" className="text-amber hover:underline">
            /directorio
          </Link>
          .
        </p>
      </section>
    </main>
  );
}

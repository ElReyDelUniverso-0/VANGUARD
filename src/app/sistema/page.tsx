import type { Metadata } from "next";
import Link from "next/link";
import { APP_VERSION, APP_CODENAME } from "@/lib/version";
import { diagnosticar } from "@/lib/sistema/diagnostico";
import { coberturaApi, documentadosDeGrupo, GRUPOS_API, RUTAS_INVENTARIADAS } from "@/lib/api/catalogo";
import { estadoExtensiones } from "@/lib/sistema/extensiones";
import { estadoCache } from "@/lib/sistema/cache";
import { resumen as resumenActividad } from "@/lib/sistema/actividad";
import { repartoPermisos } from "@/lib/sistema/permisos";
import { estadoMotor } from "@/lib/nucleo/recomendaciones";
import { estadoProveedores } from "@/lib/ia/proveedor";

// ============================================================
// v407.0 · /sistema — EL PANEL TÉCNICO DE LA CASA
//
// Una sola página donde se ve el estado REAL del sistema central: versión,
// diagnóstico en caliente, contratos de API, caché, actividad, permisos,
// motor de relaciones, extensiones e IA configurada.
//
// Es la puerta humana de los servicios compartidos: cada bloque dice dónde está
// su JSON y qué límites tiene. Nada aquí es una captura de pantalla: el
// diagnóstico se ejecuta al abrir la página.
// ============================================================

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "El sistema — contratos, datos y diagnóstico | VANGUARD",
  description:
    "Panel técnico de VANGUARD: estado del sistema central, contratos de API documentados, catálogo de datos con procedencia, caché, actividad, permisos y puntos de extensión.",
  alternates: { canonical: "/sistema" },
};

const caja = "rounded-md border border-zinc-800 bg-zinc-900/40 p-4";
const titulo = "font-mono text-[10px] uppercase tracking-[0.2em] text-amber/70";
const mono = "font-mono text-[11px] text-zinc-400";

export default async function SistemaPage() {
  const diag = await diagnosticar({ profundo: false });
  const api = coberturaApi();
  const ext = estadoExtensiones();
  const cache = estadoCache();
  const act = resumenActividad();
  const permisos = repartoPermisos();
  const motor = estadoMotor();
  const ia = estadoProveedores();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <p className={titulo}>EL SISTEMA · {APP_VERSION} · {APP_CODENAME}</p>
      <h1 className="mt-2 text-2xl font-bold text-zinc-100">La casa por dentro</h1>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-400">
        Estado real del sistema central: diagnóstico en caliente, contratos de API, catálogo de datos,
        caché, actividad, permisos y puntos de extensión. Cada bloque enlaza al JSON que lo sirve, para
        que otro equipo pueda consumirlo sin leer el código.
      </p>

      <Link href="/sistema/departamentos" className="mt-6 inline-block rounded border border-amber/40 px-4 py-3 text-sm text-amber">Los 22 departamentos · inventario, dependencias y plan de expansión ▸</Link>

      {/* ── DIAGNÓSTICO ── */}
      <section className="mt-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className={titulo}>DIAGNÓSTICO EN CALIENTE · {diag.resumen.ok} ✓ · {diag.resumen.fallos} ✗ · {diag.resumen.msTotal} ms</h2>
          <Link href="/api/sistema/diagnostico" className="font-mono text-[10px] uppercase tracking-widest text-amber hover:underline">
            /api/sistema/diagnostico ▸
          </Link>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
          {diag.checks.map((c) => (
            <div key={c.id} className={caja}>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-zinc-200">
                  <span className={c.ok ? "text-emerald-400" : "text-red-400"}>{c.ok ? "✓" : "✗"}</span> {c.nombre}
                </p>
                <span className={mono}>{c.ms} ms</span>
              </div>
              <p className="mt-1 text-[12px] leading-snug text-zinc-400">{c.detalle}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-zinc-500">
          Sin tocar la base de datos. Añade <code className="text-amber">?profundo=1</code> al endpoint para
          incluirla (con reloj de 3,5 s: una BD lenta no cuelga la respuesta).
        </p>
      </section>

      {/* ── API ── */}
      <section className="mt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className={titulo}>
            CONTRATOS DE API · {api.documentados} documentados de {api.total} ({api.porcentajeDocumentado} %)
          </h2>
          <Link href="/api/sistema/endpoints" className="font-mono text-[10px] uppercase tracking-widest text-amber hover:underline">
            /api/sistema/endpoints ▸
          </Link>
        </div>
        <p className="mt-2 text-[12px] leading-relaxed text-zinc-400">
          <strong className="text-zinc-200">Documentado</strong> significa contrato revisado a mano
          (método, parámetros reales, forma de la respuesta y muro).{" "}
          <strong className="text-zinc-200">Inventariado</strong> significa que la ruta existe y las pruebas
          lo comprueban, pero nadie ha verificado su contrato. No se presenta lo uno como lo otro.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          {GRUPOS_API.filter((g) => documentadosDeGrupo(g).length > 0).map((g) => (
            <div key={g} className={caja}>
              <p className={titulo}>{g}</p>
              <ul className="mt-2 space-y-1">
                {documentadosDeGrupo(g).map((e) => (
                  <li key={e.ruta} className="text-[12px] leading-snug text-zinc-400">
                    <span className="font-mono text-[11px] text-zinc-200">{e.ruta}</span>{" "}
                    <span className="text-zinc-600">{e.metodos.join("/")}</span>
                    <span className="block text-zinc-500">{e.descripcion}</span>
                    {e.muro ? <span className="block text-[10px] text-amber/60">muro: {e.muro}</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-zinc-500">
          Inventariados sin contrato verificado: {RUTAS_INVENTARIADAS.length} rutas (listadas en el JSON).
          Forma común de las respuestas nuevas: <code className="text-amber">{"{ ok, api, version, datos, meta }"}</code>.
        </p>
      </section>

      {/* ── SERVICIOS COMPARTIDOS ── */}
      <section className="mt-10">
        <h2 className={titulo}>SERVICIOS COMPARTIDOS</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className={caja}>
            <p className="text-sm font-semibold text-zinc-200">Caché</p>
            <p className="mt-1 text-[12px] text-zinc-400">
              {cache.claves}/{cache.limite} claves · acierto {cache.acierto} %
            </p>
            <p className="mt-1 text-[11px] text-zinc-500">{cache.ambito}</p>
          </div>
          <div className={caja}>
            <p className="text-sm font-semibold text-zinc-200">Actividad</p>
            <p className="mt-1 text-[12px] text-zinc-400">
              {act.guardados}/{act.limite} eventos · {act.totalDesdeArranque} desde el arranque
            </p>
            <Link href="/api/sistema/actividad" className="mt-1 inline-block text-[10px] uppercase tracking-widest text-amber hover:underline">
              /api/sistema/actividad ▸
            </Link>
          </div>
          <div className={caja}>
            <p className="text-sm font-semibold text-zinc-200">Permisos</p>
            <p className="mt-1 text-[12px] text-zinc-400">
              {permisos.publico} públicos · {permisos.cuenta} con cuenta · {permisos.dueno} solo Dueño
            </p>
            <p className="mt-1 text-[11px] text-zinc-500">Del censo, juzgados en el servidor.</p>
          </div>
          <div className={caja}>
            <p className="text-sm font-semibold text-zinc-200">Motor de relaciones</p>
            <p className="mt-1 text-[12px] text-zinc-400">
              {motor.fuentesDeRelacion} fuentes · {motor.familias} familias · {motor.modelosDeDato} modelos
            </p>
            <p className="mt-1 text-[11px] text-zinc-500">{motor.nota}</p>
          </div>
          <div className={caja}>
            <p className="text-sm font-semibold text-zinc-200">Extensiones</p>
            <p className="mt-1 text-[12px] text-zinc-400">{ext.puntos.length} puntos · {ext.total} instaladas</p>
            <Link href="/api/sistema/extensiones" className="mt-1 inline-block text-[10px] uppercase tracking-widest text-amber hover:underline">
              contrato del descriptor ▸
            </Link>
          </div>
          <div className={caja}>
            <p className="text-sm font-semibold text-zinc-200">IA configurada</p>
            <p className="mt-1 text-[12px] text-zinc-400">
              {ia.conCredencial} proveedor(es) con credencial · {ia.implementados} con cliente
            </p>
            <Link href="/api/sistema/ia" className="mt-1 inline-block text-[10px] uppercase tracking-widest text-amber hover:underline">
              qué se resuelve sin IA ▸
            </Link>
          </div>
        </div>
      </section>

      {/* ── PUERTAS ── */}
      <section className="mt-10">
        <h2 className={titulo}>LAS PUERTAS DE ESTE PANEL</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            ["/datos", "Catálogo de datos"],
            ["/api/sistema/endpoints", "Endpoints"],
            ["/api/sistema/diagnostico", "Diagnóstico"],
            ["/api/sistema/novedades", "Novedades"],
            ["/api/sistema/actividad", "Actividad"],
            ["/api/sistema/datos", "Datos (JSON)"],
            ["/api/sistema/ia", "IA (estado)"],
            ["/api/consulta?q=ucrania", "Consulta estructurada"],
            ["/nucleo", "El núcleo"],
          ].map(([ruta, etiqueta]) => (
            <Link
              key={ruta}
              href={ruta}
              className="rounded-sm border border-zinc-700 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-zinc-300 hover:border-amber hover:text-amber"
            >
              {etiqueta} ▸
            </Link>
          ))}
        </div>
      </section>

      <p className="mt-10 text-[11px] leading-relaxed text-zinc-600">
        Diagnóstico generado {diag.generado}. Esta página no consulta la base de datos. Los límites de cada
        servicio están escritos donde se sirven: la caché no es global, la actividad no es auditoría y los
        endpoints inventariados no son una promesa.
      </p>
    </main>
  );
}

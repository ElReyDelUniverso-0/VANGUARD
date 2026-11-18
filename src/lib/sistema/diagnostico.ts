// ============================================================
// v407.0 · EL DIAGNÓSTICO — la casa se revisa a sí misma y dice la verdad
//
// Lo que había: /calidad audita rutas e idioma desde un script, y /api/health
// dice si la base de datos responde. Lo que faltaba: una comprobación que se
// pueda pedir EN CALIENTE y que revise las piezas del sistema central — censo,
// permisos, catálogo de datos, contratos de API, extensiones, caché y actividad
// — devolviendo cada una con su tiempo y su detalle.
//
// Reglas:
//   · Cada comprobación es REAL: mira estructuras vivas, no texto de un README.
//   · Ninguna comprobación puede tumbar el diagnóstico: si una falla, se anota
//     como fallo y las demás siguen.
//   · La base de datos solo se toca en modo `profundo` (y con reloj, para que
//     una BD lenta no cuelgue la respuesta).
// ============================================================

import { APP_VERSION } from "@/lib/version";
import { MODULOS_NUCLEO } from "@/lib/nucleo/registro";
import { repartoPermisos } from "@/lib/sistema/permisos";
import { coberturaCatalogo, MODELOS_DATO } from "@/lib/datos/catalogo";
import { coberturaApi, ENDPOINTS_DOCUMENTADOS, RUTAS_INVENTARIADAS } from "@/lib/api/catalogo";
import { estadoExtensiones } from "@/lib/sistema/extensiones";
import { estadoCache } from "@/lib/sistema/cache";
import { resumen as resumenActividad, anotar } from "@/lib/sistema/actividad";
import { estadoMotor } from "@/lib/nucleo/recomendaciones";

export interface Check {
  id: string;
  nombre: string;
  ok: boolean;
  detalle: string;
  ms: number;
}

export interface Diagnostico {
  sano: boolean;
  version: string;
  generado: string;
  profundo: boolean;
  checks: Check[];
  resumen: {
    ok: number;
    fallos: number;
    avisos: number;
    msTotal: number;
  };
}

async function medir(id: string, nombre: string, fn: () => Promise<string> | string): Promise<Check> {
  const t0 = Date.now();
  try {
    const detalle = await fn();
    return { id, nombre, ok: true, detalle, ms: Date.now() - t0 };
  } catch (e) {
    return {
      id,
      nombre,
      ok: false,
      detalle: e instanceof Error ? e.message.slice(0, 200) : String(e).slice(0, 200),
      ms: Date.now() - t0,
    };
  }
}

function exigir(cond: boolean, mensaje: string): void {
  if (!cond) throw new Error(mensaje);
}

/**
 * Ejecuta el diagnóstico. `profundo: true` añade la comprobación de base de
 * datos (con reloj de 3,5 s, como /api/health).
 */
export async function diagnosticar(opciones: { profundo?: boolean } = {}): Promise<Diagnostico> {
  const t0 = Date.now();
  const profundo = opciones.profundo === true;
  const checks: Check[] = [];

  checks.push(
    await medir("version", "Versión desplegada", () => {
      exigir(!!APP_VERSION && APP_VERSION.startsWith("v"), "la versión no está declarada");
      return `${APP_VERSION}`;
    })
  );

  checks.push(
    await medir("censo", "Censo de módulos", () => {
      exigir(MODULOS_NUCLEO.length >= 60, `solo ${MODULOS_NUCLEO.length} módulos en el censo`);
      const ids = MODULOS_NUCLEO.map((m) => m.id);
      const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
      exigir(dup.length === 0, `ids duplicados: ${dup.join(", ")}`);
      const sinRuta = MODULOS_NUCLEO.filter((m) => !m.ruta?.startsWith("/"));
      exigir(sinRuta.length === 0, `módulos sin ruta válida: ${sinRuta.map((m) => m.id).join(", ")}`);
      return `${MODULOS_NUCLEO.length} módulos · ${new Set(ids).size} ids únicos`;
    })
  );

  checks.push(
    await medir("permisos", "Reparto de permisos", () => {
      const r = repartoPermisos();
      exigir(r.total === MODULOS_NUCLEO.length, "el reparto no cuadra con el censo");
      exigir(r.publico + r.cuenta + r.dueno === r.total, "niveles de permiso desconocidos en el censo");
      return `${r.publico} públicos · ${r.cuenta} con cuenta · ${r.dueno} solo Dueño`;
    })
  );

  checks.push(
    await medir("datos", "Catálogo de datos", () => {
      const c = coberturaCatalogo();
      exigir(c.modelos >= 8, `solo ${c.modelos} modelos declarados`);
      exigir(c.conProcedencia === c.modelos, "hay modelos sin procedencia declarada");
      exigir(c.conLimites === c.modelos, "hay modelos sin límites escritos");
      const sinRutas = MODELOS_DATO.filter((m) => m.rutas.length === 0);
      exigir(sinRutas.length === 0, `modelos sin ruta donde verse: ${sinRutas.map((m) => m.id).join(", ")}`);
      return `${c.modelos} modelos · ${c.relaciones} relaciones · ${c.conFechaDeCaptura} con fecha de captura`;
    })
  );

  checks.push(
    await medir("api", "Contratos de API", () => {
      const c = coberturaApi();
      exigir(c.documentados >= 20, `solo ${c.documentados} endpoints documentados`);
      const todas = [...ENDPOINTS_DOCUMENTADOS.map((e) => e.ruta), ...RUTAS_INVENTARIADAS];
      const dup = todas.filter((x, i) => todas.indexOf(x) !== i);
      exigir(dup.length === 0, `endpoints repetidos en el catálogo: ${[...new Set(dup)].join(", ")}`);
      for (const e of ENDPOINTS_DOCUMENTADOS) {
        exigir(e.ruta.startsWith("/api"), `ruta no-API documentada: ${e.ruta}`);
        exigir(e.version.length > 0, `endpoint sin versión: ${e.ruta}`);
        exigir(e.descripcion.length >= 20, `endpoint documentado sin descripción útil: ${e.ruta}`);
      }
      return `${c.documentados} documentados · ${c.inventariados} inventariados · ${c.porcentajeDocumentado}% del total`;
    })
  );

  checks.push(
    await medir("extensiones", "Puntos de extensión", () => {
      const e = estadoExtensiones();
      exigir(e.puntos.length === 6, `se esperaban 6 puntos de extensión, hay ${e.puntos.length}`);
      return `${e.puntos.length} puntos · ${e.total} extensiones instaladas`;
    })
  );

  checks.push(
    await medir("motor", "Motor de relaciones", () => {
      const m = estadoMotor();
      exigir(m.familias >= 4, `solo ${m.familias} familias declaradas`);
      exigir(m.modelosDeDato >= 8, "el motor no ve el catálogo de datos");
      return `${m.fuentesDeRelacion} fuentes · ${m.familias} familias · ${m.modelosDeDato} modelos`;
    })
  );

  checks.push(
    await medir("cache", "Caché en memoria", () => {
      const c = estadoCache();
      exigir(c.limite > 0, "la caché no declara límite");
      return `${c.claves}/${c.limite} claves · acierto ${c.acierto}% · ${c.ambito}`;
    })
  );

  checks.push(
    await medir("actividad", "Registro de actividad", () => {
      const a = resumenActividad();
      exigir(a.limite > 0, "el anillo de actividad no está activo");
      return `${a.guardados}/${a.limite} eventos · ${a.totalDesdeArranque} desde el arranque`;
    })
  );

  if (profundo) {
    checks.push(
      await medir("bd", "Base de datos", async () => {
        const reloj = new Promise<never>((_, rechaza) => setTimeout(() => rechaza(new Error("la base de datos no respondió en 3,5 s")), 3500));
        const consulta = (async () => {
          const { db } = await import("@/lib/db");
          const n = await db.newsItem.count();
          return n;
        })();
        const n = await Promise.race([consulta, reloj]);
        return `${n} cables en el archivo`;
      })
    );
  }

  const msTotal = Date.now() - t0;
  const fallos = checks.filter((c) => !c.ok).length;
  const d: Diagnostico = {
    sano: fallos === 0,
    version: APP_VERSION,
    generado: new Date().toISOString(),
    profundo,
    checks,
    resumen: { ok: checks.length - fallos, fallos, avisos: 0, msTotal },
  };
  anotar(fallos === 0 ? "info" : "aviso", "diagnostico", {
    checks: checks.length,
    fallos,
    ms: msTotal,
    profundo,
  });
  return d;
}

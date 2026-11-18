// v414.0 · GET /api/sistema/arquitectura — el mapa de la casa, para las máquinas
//
// Lo que la v412.0 publicó en la página /arquitectura (censo, departamentos,
// contratos, nexos), servido con el contrato de la v407.0 para que las otras 21
// IA —y cualquier equipo— puedan consultarlo sin leer el repositorio.
//
// Secciones: resumen · grafo · huecos · piezas · acoplamientos · todo
import { muro, claveCliente } from "@/lib/fortaleza";
import { ok, fallo, conManejo, cacheable, validar } from "@/lib/sistema/contrato";
import {
  PIEZAS,
  validarIntegracion,
  resumenArquitectura,
  areasCentrales,
  acoplamientosFuertes,
  huecosDeArquitectura,
  VERSION_ARQUITECTURA,
} from "@/lib/arquitectura/integracion";
import { DEPARTAMENTOS, CONTRATOS, resumenDepartamentos } from "@/lib/arquitectura/departamentos";

export const dynamic = "force-dynamic";

const SECCIONES = ["resumen", "grafo", "huecos", "piezas", "acoplamientos", "departamentos", "todo"] as const;

export const GET = conManejo("/api/sistema/arquitectura", async (req, t0) => {
  const veredicto = muro(`arq:${claveCliente(req)}`, 60, 60_000);
  if (!veredicto.permitido) return fallo("MURO", `Demasiadas consultas. Espera ${veredicto.espera} s.`, undefined, { t0 });

  const url = new URL(req.url);
  const seccion = validar.unoDe(url.searchParams.get("seccion"), "seccion", SECCIONES, "resumen");

  const cuerpo: Record<string, unknown> = { version: VERSION_ARQUITECTURA, seccion };

  if (seccion === "resumen" || seccion === "todo") cuerpo.resumen = resumenArquitectura();
  if (seccion === "grafo" || seccion === "todo") cuerpo.areasCentrales = areasCentrales(10);
  if (seccion === "acoplamientos" || seccion === "todo") cuerpo.acoplamientos = acoplamientosFuertes(12);
  if (seccion === "huecos" || seccion === "todo") cuerpo.huecos = huecosDeArquitectura();
  if (seccion === "piezas" || seccion === "todo") {
    cuerpo.piezas = PIEZAS;
    cuerpo.ejemplo = validarIntegracion({ area: "ejemplo" });
  }
  if (seccion === "departamentos" || seccion === "todo") {
    cuerpo.departamentos = {
      resumen: resumenDepartamentos(),
      total: DEPARTAMENTOS.length,
      contratos: CONTRATOS.length,
      detalle: DEPARTAMENTOS.map((d) => ({ id: d.id, nombre: d.nombre, estado: d.estado, existe: d.existe.length, falta: d.falta.length })),
    };
  }

  return ok(cuerpo, {
    t0,
    cabeceras: cacheable(300),
    nota:
      "El grafo se genera con tools/arquitectura/grafo.mjs a partir del censo del árbol y del registro de módulos. " +
      "Un ciclo de enlace no es un error: es una ida y vuelta entre salas.",
  });
});

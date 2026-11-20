// ═══════════════════════════════════════════════════════════════════
// v420.1 · MISIÓN 09 · GET /api/resiliencia — la puerta de máquina
//
// El centro entero, servido en JSON para las otras áreas de la casa y para
// cualquier equipo que quiera consumirlo, con el contrato de la v407.0.
// Cero base de datos y cero claves: todo sale de datos versionados en el
// repositorio, así que la puerta no puede decir nada que la página no diga.
//
// Secciones: resumen · centro · seccion · peligros · guias · listas ·
//            glosario · evaluador · paises · pais
// La puerta tampoco emite alertas: no hay ningún campo «ahora mismo». Lo que
// pasa en el mundo se consulta en /api (USGS, clima espacial) — no aquí.
// ═══════════════════════════════════════════════════════════════════

import { muro, claveCliente } from "@/lib/fortaleza";
import { ok, fallo, conManejo, cacheable, validar } from "@/lib/sistema/contrato";
import { APP_VERSION } from "@/lib/version";
import { CENTRO_META, ENCUADRE, FUENTES_CENTRO, SECCIONES, SECCION_POR_ID, cifrasCentro } from "@/lib/resiliencia/secciones";
import { PELIGROS } from "@/lib/resiliencia/peligros";
import { GUIAS } from "@/lib/resiliencia/guias";
import { LISTAS } from "@/lib/resiliencia/listas";
import { GLOSARIO } from "@/lib/resiliencia/glosario";
import { CATEGORIAS, ESCALA, ITEMS, BANDAS, LIMITES, RESPUESTA_MINIMA, AVISO_RESULTADO, evaluarComunidad } from "@/lib/resiliencia/evaluador";
import { NOTA_VERIFICACION, ORGANISMOS_GLOBALES, PAISES, PAISES_CON_RECURSOS, recursoDePais } from "@/lib/resiliencia/organismos";

export const dynamic = "force-dynamic";

const SECCIONES_API = ["resumen", "todo", "centro", "seccion", "peligros", "guias", "listas", "glosario", "evaluador", "paises", "pais"] as const;

export const GET = conManejo("/api/resiliencia", async (req, t0) => {
  const veredicto = muro(`res:${claveCliente(req)}`, 120, 60_000);
  if (!veredicto.permitido) return fallo("MURO", `Demasiadas consultas. Espera ${veredicto.espera} s.`, undefined, { t0 });

  const url = new URL(req.url);
  const seccion = validar.unoDe(url.searchParams.get("seccion"), "seccion", SECCIONES_API, "resumen");
  const cabeceras = cacheable(600);

  const resumen = {
    nombre: CENTRO_META.nombre,
    subtitulo: CENTRO_META.subtitulo,
    lema: CENTRO_META.lema,
    encuadre: ENCUADRE.texto,
    version: APP_VERSION,
    cifras: cifrasCentro(),
    conteo: {
      secciones: SECCIONES.length + 1,
      peligros: PELIGROS.length,
      guias: GUIAS.length,
      listas: LISTAS.length,
      terminos: GLOSARIO.length,
      paises: PAISES_CON_RECURSOS.length,
      organismosInternacionales: ORGANISMOS_GLOBALES.length,
      preguntasEvaluador: ITEMS.length,
      categoriasEvaluador: CATEGORIAS.length,
    },
    fuentes: FUENTES_CENTRO,
    nota: NOTA_VERIFICACION,
  };

  const cuerpo: Record<string, unknown> = { resumen };

  if (seccion === "centro" || seccion === "todo") {
    cuerpo.secciones = SECCIONES.map((s) => ({
      n: s.n,
      id: s.id,
      titulo: s.titulo,
      lema: s.lema,
      resumen: s.resumen,
      ruta: `/resiliencia/${s.id}`,
      bloques: s.bloques.map((b) => b.tipo),
      saleA: s.saleA ?? [],
    }));
    cuerpo.herramienta = { ruta: "/resiliencia/evaluacion", nombre: "COMMUNITY RESILIENCE", orientativa: true };
  }

  if (seccion === "seccion") {
    const id = validar.texto(url.searchParams.get("id"), "id", { max: 40, requerido: true });
    const s = SECCION_POR_ID[id];
    if (!s) {
      return fallo("NO_ENCONTRADO", `No hay ninguna sección «${id}».`, { validas: Object.keys(SECCION_POR_ID) }, { t0 });
    }
    cuerpo.seccion = s;
  }

  if (seccion === "peligros" || seccion === "todo") cuerpo.peligros = PELIGROS;
  if (seccion === "guias" || seccion === "todo") cuerpo.guias = GUIAS;
  if (seccion === "listas" || seccion === "todo") cuerpo.listas = LISTAS;
  if (seccion === "glosario" || seccion === "todo") cuerpo.glosario = GLOSARIO;

  if (seccion === "evaluador") {
    cuerpo.evaluador = {
      categorias: CATEGORIAS,
      escala: ESCALA,
      items: ITEMS,
      bandas: BANDAS,
      respuestaMinima: RESPUESTA_MINIMA,
      aviso: AVISO_RESULTADO,
      limites: LIMITES,
      ejemplo: evaluarComunidad(Object.fromEntries(ITEMS.map((i) => [i.id, 2]))),
    };
    cuerpo.advertencia =
      "Salida orientativa de una autoevaluación educativa. No es una certificación ni una categoría de riesgo oficial, y no describe ninguna situación en curso.";
  }

  if (seccion === "paises" || seccion === "todo") {
    cuerpo.paises = PAISES_CON_RECURSOS.map((iso) => ({
      iso2: iso,
      numero: PAISES[iso].numero,
      peligros: PAISES[iso].peligros,
      organismos: PAISES[iso].organismos.length,
      ruta: `/resiliencia/recursos/${iso}`,
    }));
    cuerpo.organismosGlobales = ORGANISMOS_GLOBALES;
  }

  if (seccion === "pais") {
    const iso = (url.searchParams.get("iso") ?? url.searchParams.get("pais") ?? "").trim().toLowerCase();
    if (!iso) {
      return fallo("VALIDACION", "Falta el país: usa ?seccion=pais&iso=do.", { parametro: "iso" }, { t0 });
    }
    const dato = recursoDePais(iso);
    if (!dato) {
      return fallo("NO_ENCONTRADO", `El directorio todavía no tiene ficha para «${iso}».`, { sugerencia: "Usa ?seccion=paises para ver los países cubiertos." }, { t0 });
    }
    cuerpo.pais = { ...dato, iso2: iso, ruta: `/resiliencia/recursos/${iso}` };
  }

  return ok(cuerpo, { t0, nota: `Centro de resiliencia civil · ${resumen.conteo.secciones} secciones · puerta de máquina`, cabeceras });
});

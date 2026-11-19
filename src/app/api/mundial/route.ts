// v416.0 · GET /api/mundial — el centro de datos, para las máquinas
//
// Departamento 4 · VANGUARD WORLD DATA. Una sola puerta con seis secciones, el
// contrato de la v407.0 y el muro de siempre. Nada de cifras propias: todo sale
// del Banco Mundial con su año, y lo que no publica se devuelve como null
// (nunca como cero, nunca interpolado).
//
//   ?seccion=catalogo                     el índice: 52 indicadores, 9 categorías
//   ?seccion=paises                       países con región y nivel de renta
//   ?seccion=serie&indicador=poblacion&paises=do,ht&desde=1990
//   ?seccion=ranking&indicador=pib_pc&anio=2023   (sin `anio` = último dato de cada país)
//   ?seccion=comparar&paises=do,ht&indicadores=poblacion,pib_pc,esperanza_vida
//   ?seccion=panel&indicador=poblacion&agregados=WLD,LCN
import { muro, claveCliente } from "@/lib/fortaleza";
import { ok, fallo, conManejo, cacheable, validar } from "@/lib/sistema/contrato";
import { INDICADORES, CATEGORIAS, indicador as buscarIndicador, catalogoPublico, VERSION_MUNDIAL } from "@/lib/mundial/catalogo";
import { catalogoPaises, serieDePais, seriesDeVarios, rankingDeIndicador, serieDeAgregado, AGREGADOS } from "@/lib/mundial/banco";
import { explicarPar, explicarSerie } from "@/lib/mundial/explicar";

export const dynamic = "force-dynamic";

const SECCIONES = ["catalogo", "paises", "serie", "ranking", "comparar", "panel", "todo"] as const;
const MAX_PAISES = 6;

export const GET = conManejo("/api/mundial", async (req, t0) => {
  const veredicto = muro(`mundial:${claveCliente(req)}`, 40, 60_000);
  if (!veredicto.permitido) {
    return fallo("MURO", `Demasiadas consultas. Espera ${veredicto.espera} s.`, undefined, { t0 });
  }

  const url = new URL(req.url);
  const seccion = validar.unoDe(url.searchParams.get("seccion"), "seccion", SECCIONES, "catalogo");

  const pedirIndicador = () => {
    const crudo = validar.texto(url.searchParams.get("indicador"), "indicador", { max: 60, requerido: true });
    const ind = buscarIndicador(crudo);
    if (!ind) {
      throw Object.assign(new Error("indicador desconocido"), { codigo: "VALIDACION" });
    }
    return ind;
  };

  const pedirPaises = (max = MAX_PAISES) => {
    const crudo = validar.texto(url.searchParams.get("paises"), "paises", { max: 80 }) || "do";
    const isos = crudo.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (isos.length > max) {
      return isos.slice(0, max);
    }
    return isos.filter((i) => /^[a-z]{2}$/.test(i));
  };

  const cuerpo: Record<string, unknown> = { version: VERSION_MUNDIAL, seccion };

  if (seccion === "catalogo" || seccion === "todo") {
    cuerpo.catalogo = catalogoPublico();
    cuerpo.reglas = [
      "Cada cifra viaja con su año: nunca se compara 2024 con 2019 sin decirlo.",
      "Lo que la fuente no publica se devuelve como null y se escribe «sin dato». No se estima ni se interpola.",
      "Cada indicador declara código, unidad, método, fuente, licencia y enlace de definición.",
      "Los rankings en modo «reciente» mezclan años: cada fila lleva el suyo y la respuesta lo declara.",
    ];
  }

  if (seccion === "paises" || seccion === "todo") {
    const paises = await catalogoPaises();
    cuerpo.paises = {
      total: paises.length,
      regiones: [...new Set(paises.map((p) => p.region))].sort((a, b) => a.localeCompare(b, "es")),
      detalle: paises.map((p) => ({ iso2: p.iso2, iso3: p.iso3, nombre: p.nombre, region: p.region, renta: p.renta })),
    };
  }

  if (seccion === "serie" || seccion === "todo") {
    const ind = seccion === "todo" ? INDICADORES[0] : pedirIndicador();
    const desde = validar.entero(url.searchParams.get("desde"), "desde", { min: 1960, max: 2035, porDefecto: 1990 });
    const isos = pedirPaises();
    let series;
    try {
      series = await seriesDeVarios(isos, ind, desde);
    } catch {
      return fallo("PROVEEDOR", "El Banco Mundial no contestó. Vuelve a intentarlo en un minuto.", { indicador: ind.id }, { t0 });
    }
    cuerpo.serie = {
      indicador: ind.id,
      unidad: ind.unidad,
      metodo: ind.metodo,
      fuente: ind.fuente,
      licencia: ind.licencia,
      series: series.map((s) => ({
        iso: s.iso,
        pais: s.pais,
        anios: s.puntos.length,
        ultimo: s.ultimo,
        disponible: s.disponible,
        puntos: s.puntos,
        resumen: explicarSerie(s.puntos, ind, s.pais),
      })),
    };
  }

  if (seccion === "ranking" || seccion === "todo") {
    const ind = seccion === "todo" ? INDICADORES[0] : pedirIndicador();
    const anioCrudo = url.searchParams.get("anio");
    const anio = anioCrudo ? validar.entero(anioCrudo, "anio", { min: 1960, max: 2035, porDefecto: 2023 }) : null;
    const r = await rankingDeIndicador(ind, { anio });
    cuerpo.ranking = r;
  }

  if (seccion === "comparar" || seccion === "todo") {
    const isos = pedirPaises(4);
    const crudo = validar.texto(url.searchParams.get("indicadores"), "indicadores", { max: 240 }) || "poblacion";
    const ids = crudo.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 6);
    const inds = ids.map((id) => buscarIndicador(id)).filter((i): i is NonNullable<typeof i> => Boolean(i));
    if (isos.length < 2) {
      return fallo("VALIDACION", "Hacen falta al menos dos países para comparar.", { recibidos: isos.length }, { t0 });
    }
    if (inds.length === 0) {
      return fallo("VALIDACION", "Ninguno de los indicadores pedidos está en el catálogo.", { pedidos: ids }, { t0 });
    }
    const bloques = [];
    for (const ind of inds) {
      const series = await seriesDeVarios(isos, ind, 1990);
      const cifras = series.map((s) => ({ iso: s.iso, pais: s.pais, valor: s.ultimo?.valor ?? null, anio: s.ultimo?.anio ?? null }));
      const explicaciones = [];
      for (let i = 0; i < cifras.length; i++) {
        for (let j = i + 1; j < cifras.length; j++) {
          explicaciones.push({ par: [cifras[i].pais, cifras[j].pais], ...explicarPar(cifras[i], cifras[j], ind) });
        }
      }
      bloques.push({
        indicador: { id: ind.id, nombre: ind.nombre, unidad: ind.unidad, metodo: ind.metodo, sentido: ind.sentido, fuente: ind.fuente, licencia: ind.licencia },
        series: series.map((s) => ({ iso: s.iso, pais: s.pais, puntos: s.puntos, ultimo: s.ultimo })),
        cifras,
        explicaciones,
      });
    }
    cuerpo.comparacion = { paises: isos, indicadores: inds.map((i) => i.id), bloques };
  }

  if (seccion === "panel" || seccion === "todo") {
    const ind = seccion === "todo" ? INDICADORES[0] : pedirIndicador();
    const crudo = validar.texto(url.searchParams.get("agregados"), "agregados", { max: 80 }) || "WLD";
    const pedidos = crudo.split(",").map((s) => s.trim().toUpperCase()).filter((s) => AGREGADOS.some((a) => a.iso === s));
    const lista = pedidos.length ? pedidos : ["WLD"];
    const series = await Promise.all(lista.map((iso) => serieDeAgregado(iso, ind, 1990)));
    cuerpo.panel = {
      indicador: { id: ind.id, nombre: ind.nombre, unidad: ind.unidad, metodo: ind.metodo, fuente: ind.fuente },
      agregados: AGREGADOS,
      series: series.map((s) => ({ iso: s.iso, nombre: s.pais, puntos: s.puntos, ultimo: s.ultimo })),
    };
  }

  if (seccion === "todo") {
    cuerpo.categorias = CATEGORIAS.map((c) => ({ id: c.id, nombre: c.nombre }));
    cuerpo.totalIndicadores = INDICADORES.length;
  }

  return ok(cuerpo, {
    t0,
    cabeceras: cacheable(1800),
    nota:
      "Fuente: Banco Mundial, World Development Indicators (CC BY 4.0). Cada valor lleva su año; " +
      "un null significa que la fuente no publica ese dato para ese país ese año. La casa no estima ni interpola.",
  });
});

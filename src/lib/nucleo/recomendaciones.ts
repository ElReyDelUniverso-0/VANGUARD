// ============================================================
// v407.0 · EL MOTOR DE RELACIONES Y RECOMENDACIONES CONTEXTUALES
//
// La casa ya sabe muchísimo de cada cosa (censo, familias, relaciones, catálogo
// de datos), pero cada página solo enseñaba SUS enlaces. Nadie decía «ya que
// estás aquí, esto es lo siguiente que tiene sentido».
//
// Este motor reúne las cuatro fuentes de relación que ya existen y las ordena:
//   ① RELACIÓN EXPLÍCITA (relaciones.ts): el cable→teatro, la ficha→simulador…
//   ② FAMILIA (fusiones.ts): la misma pregunta vista desde otra puerta.
//   ③ MODELO DE DATO (datos/catalogo.ts): qué otro modelo se une por la misma clave.
//   ④ NEXO (nexo.ts): de un país a sus cuatro puertas reales.
//
// NO ES UN ALGORITMO OPACO: cada paso viaja con su motivo escrito y su peso
// declarado, y el que no tiene motivo no se propone. Cero personalización
// encubierta: con los mismos datos, la misma recomendación.
// ============================================================

import { familiaDeRuta, FAMILIAS_MODULO } from "@/lib/nucleo/fusiones";
import { MODULOS_NUCLEO, moduloPorRuta } from "@/lib/nucleo/registro";
import { contextoDePais, paisDeTexto } from "@/lib/nucleo/nexo";
import { MODELOS_DATO, vecinosDeModelo } from "@/lib/datos/catalogo";
import type { TipoEntidad } from "@/lib/nucleo/tipos";

/** Un paso siguiente propuesto, con su razón a la vista. */
export interface SiguientePaso {
  etiqueta: string;
  ruta: string;
  motivo: string;
  /** 0–1: cuánta confianza tiene esta propuesta, y por qué categoría */
  peso: number;
  /** de dónde sale (para que el usuario sepa qué está viendo) */
  porque: "explicita" | "familia" | "modelo" | "pais" | "censo";
}

export interface EntradaRecomendacion {
  /** ruta actual (la casa la usa para no recomendar lo mismo) */
  ruta?: string;
  /** id de módulo del censo (mod:…) */
  moduloId?: string;
  /** país del que trata la página */
  pais?: string;
  /** texto libre (un titular, una consulta) para sacar el país */
  texto?: string;
  /** tipo de entidad, para unir con el catálogo de datos */
  tipo?: TipoEntidad | null;
  /** cuántos pasos devolver */
  limite?: number;
}

/** Qué modelo del catálogo corresponde a cada tipo de entidad del núcleo. */
const MODELO_DE_TIPO: Partial<Record<TipoEntidad, string>> = {
  pais: "dato:ficha-pais",
  region: "dato:poligono",
  noticia: "dato:cable",
  acontecimiento: "dato:acontecimiento",
  documento: "dato:documento",
  mapa: "dato:poligono",
  simulacion: "dato:simulacion",
  punto: "dato:punto",
  fuente: "dato:indicador",
  analisis: "dato:documento",
};

/** Etiqueta legible de un modelo del catálogo. */
function nombreDeModelo(id: string): string {
  return MODELOS_DATO.find((m) => m.id === id)?.nombre ?? id;
}

/**
 * La función que monta cualquier página: devuelve hasta `limite` pasos con
 * motivo, sin repetir la ruta actual y sin proponer rutas que no existan en el
 * censo (salvo las puertas de país, que son rutas reales de la casa).
 */
export function recomendar(entrada: EntradaRecomendacion): SiguientePaso[] {
  const limite = Math.max(1, Math.min(8, entrada.limite ?? 3));
  const actual = entrada.ruta ?? null;
  const pasos = new Map<string, SiguientePaso>();

  const añadir = (p: SiguientePaso) => {
    if (actual && p.ruta === actual) return;
    const previo = pasos.get(p.ruta);
    if (!previo || previo.peso < p.peso) pasos.set(p.ruta, p);
  };

  // ① RELACIÓN EXPLÍCITA Y ② FAMILIA, a partir del módulo actual
  const modulo =
    (entrada.moduloId ? MODULOS_NUCLEO.find((m) => m.id === entrada.moduloId) : null) ??
    (actual ? moduloPorRuta(actual) : null) ??
    null;

  if (actual) {
    const familia = familiaDeRuta(actual);
    if (familia) {
      añadir({
        etiqueta: `${familia.canonico.nombre.toUpperCase()} ▸`,
        ruta: familia.canonico.ruta,
        motivo: `La puerta canónica de esta familia: ${familia.pregunta}`,
        peso: 0.72,
        porque: "familia",
      });
      for (const p of familia.piezas) {
        añadir({
          etiqueta: `${p.nombre.toUpperCase()} ▸`,
          ruta: p.ruta,
          motivo: p.papel,
          peso: 0.55,
          porque: "familia",
        });
      }
    }
  }

  if (modulo) {
    for (const dep of modulo.dependencias) {
      if (!dep.startsWith("mod:")) continue;
      const m = MODULOS_NUCLEO.find((x) => x.id === dep);
      if (!m) continue;
      añadir({
        etiqueta: `${m.nombre} ▸`,
        ruta: m.ruta,
        motivo: `«${modulo.nombre}» vive de este módulo (dependencia declarada en el censo)`,
        peso: 0.66,
        porque: "explicita",
      });
    }
    // los que dependen de él: el camino de vuelta
    for (const otro of MODULOS_NUCLEO) {
      if (!otro.dependencias.includes(modulo.id)) continue;
      añadir({
        etiqueta: `${otro.nombre} ▸`,
        ruta: otro.ruta,
        motivo: `Este módulo alimenta a «${otro.nombre}» (dependencia declarada)`,
        peso: 0.6,
        porque: "explicita",
      });
    }
  }

  // ③ MODELO DE DATO
  const modeloId = entrada.tipo ? MODELO_DE_TIPO[entrada.tipo] ?? null : null;
  if (modeloId) {
    añadir({
      etiqueta: `CATÁLOGO: ${nombreDeModelo(modeloId).toUpperCase()} ▸`,
      ruta: "/datos",
      motivo: `Los datos que estás viendo están declarados en el catálogo: procedencia, licencia y fecha de captura`,
      peso: 0.4,
      porque: "modelo",
    });
    for (const v of vecinosDeModelo(modeloId).slice(0, 2)) {
      añadir({
        etiqueta: `CATÁLOGO: ${nombreDeModelo(v.con).toUpperCase()} ▸`,
        ruta: "/datos",
        motivo: `Se une con lo que estás viendo por ${v.por} — ${v.nota}`,
        peso: 0.34,
        porque: "modelo",
      });
    }
  }

  // ④ NEXO: el país, si la página trata de uno
  const iso = entrada.pais ?? (entrada.texto ? paisDeTexto(entrada.texto)?.iso2 ?? null : null);
  if (iso) {
    const ctx = contextoDePais(iso);
    if (ctx) {
      for (const puerta of ctx.puertas) {
        añadir({
          etiqueta: puerta.etiqueta,
          ruta: puerta.ruta,
          motivo: puerta.motivo,
          peso: puerta.clave === "ficha" ? 0.8 : 0.5,
          porque: "pais",
        });
      }
    }
  }

  // ⑤ CENSO: si no hay nada mejor, el índice y el buscador (nunca un vacío)
  if (pasos.size < limite) {
    añadir({
      etiqueta: "BUSCAR EN EL NÚCLEO ▸",
      ruta: "/nucleo",
      motivo: "Búsqueda global: cables, entidades y módulos en un solo sitio",
      peso: 0.2,
      porque: "censo",
    });
    añadir({
      etiqueta: "EL CENSO COMPLETO ▸",
      ruta: "/modulos",
      motivo: `Las ${MODULOS_NUCLEO.length} puertas de la casa, con su estado`,
      peso: 0.15,
      porque: "censo",
    });
  }

  return [...pasos.values()]
    .sort((a, b) => b.peso - a.peso || a.ruta.localeCompare(b.ruta))
    .slice(0, limite);
}

/** Cifras del motor, para /sistema y las pruebas (nada de datos personales). */
export function estadoMotor() {
  const conFamilia = new Set(
    FAMILIAS_MODULO.flatMap((f) => [f.canonico.ruta, ...f.piezas.map((p) => p.ruta)])
  );
  const enCenso = MODULOS_NUCLEO.filter((m) => conFamilia.has(m.ruta)).length;
  return {
    fuentesDeRelacion: 4,
    familias: FAMILIAS_MODULO.length,
    rutasEnFamilias: conFamilia.size,
    modulosEnCensoConFamilia: enCenso,
    modelosDeDato: MODELOS_DATO.length,
    nota: "Determinista: los mismos datos producen siempre la misma recomendación, con su motivo escrito.",
  };
}

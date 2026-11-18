// ═══════════════════════════════════════════════════════════════════
// v405.12 · LA CARGA DEL MAPA DE LOS MUNDOS — servidor → cliente
//
// El cliente NO calcula geografía ni cruza tablas: recibe el planeta ya
// resuelto. Aquí se decide, por capa, qué color tiene cada país y con qué
// umbrales, para que la leyenda que el lector ve sea exactamente la que se
// pintó (una leyenda que no casa con el mapa es una mentira silenciosa).
// ═══════════════════════════════════════════════════════════════════

import { fichas, MEDIDAS, coberturaGlobal, regionEnEspanol, type FichaPais, type Medida } from "./ficha";
import { LIENZO, POLIGONOS_ORDENADOS, TERRITORIOS, coberturaMapa, REJILLA_SVG, vecinosDe, territorioDe } from "./mapa";
import { formatear } from "./formato";
import { proyectar, type BandaLeyenda, type CapaCliente, type PaisCliente, type PayloadMundos, type PoligonoCliente } from "./capas";

/** Rampa secuencial de la casa (frío → cian → oro). Se invierte si la capa
 *  premia lo pequeño (una moneda fuerte no es la que más unidades tiene). */
export const RAMPAS: Record<string, string[]> = {
  defecto: ["#0d3b46", "#125e6e", "#1b8fa0", "#3ddcff", "#9ff0e4", "#ffe9a8"],
  militar: ["#2b1220", "#4d1b2e", "#7d2740", "#b53a52", "#e07a3f", "#ffd27a"],
  dinero: ["#10242e", "#14424f", "#1b6b63", "#3f9e6a", "#a8c95a", "#f4e39b"],
};

export function rampaDe(medida: Medida): string[] {
  if (medida.id === "gasto" || medida.id === "personal" || medida.id === "gastoPib") return RAMPAS.militar;
  if (medida.id === "tasa" || medida.id === "pib" || medida.id === "pibPC") return RAMPAS.dinero;
  return RAMPAS.defecto;
}

/** Umbrales por cuantiles: cada banda lleva el mismo número de países.
 *  Con pocos países con dato se cae a un umbral por valor distinto. */
export function cortesDe(valores: number[]): number[] {
  const v = valores.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (v.length === 0) return [];
  if (v.length < 8) {
    const unicos = Array.from(new Set(v));
    return unicos.slice(0, -1).map((x, i) => (x + unicos[i + 1]) / 2);
  }
  const cortes: number[] = [];
  for (let i = 1; i < 6; i++) {
    const pos = Math.floor((i * v.length) / 6);
    const valor = v[Math.min(pos, v.length - 1)];
    if (!cortes.length || valor > cortes[cortes.length - 1]) cortes.push(valor);
  }
  return cortes;
}

export interface ContextoConflictos {
  /** iso2 → cuántos acontecimientos reales lo tocan */
  porPais: Record<string, number>;
}

/**
 * Construye el planeta resuelto.
 * `ctx.porPais` lo aporta la sala (es la única que tiene el archivo de
 * acontecimientos); todo lo demás sale de la ficha unificada.
 */
export function construirPayload(ctx: ContextoConflictos): PayloadMundos {
  const todas = fichas();
  const porIso = new Map<string, FichaPais>(todas.map((f) => [f.iso2, f]));

  // fronteras reales resueltas una vez por proceso
  const listaVecinos = new Map<string, string[]>();
  for (const f of todas) listaVecinos.set(f.iso2, vecinosDe(f.iso2).map((v) => v.iso2).filter((x): x is string => !!x));

  const poligonos: PoligonoCliente[] = POLIGONOS_ORDENADOS.map((p) => ({
    k: p.clave,
    d: p.pais.d,
    iso2: p.iso2,
    b: p.pais.b,
    c: p.pais.c,
  }));

  const clavePorIso = new Map<string, string>();
  for (const p of POLIGONOS_ORDENADOS) if (p.iso2) clavePorIso.set(p.iso2, p.clave);

  const paises: PaisCliente[] = todas.map((f) => {
    const t = territorioDe(f.iso2);
    return {
      iso2: f.iso2,
      nombre: f.nombre,
      region: f.region,
      subregion: f.subregion,
      territorio: t ? t.nombre : null,
      capital: f.atlas ? f.atlas.capital : null,
      poblacion: f.poblacion === null ? null : formatear("poblacion", f.poblacion / 1_000_000),
      superficie: f.superficie === null ? null : formatear("superficie", f.superficie),
      vecinos: listaVecinos.get(f.iso2)?.length ?? null,
      vecinosIso: listaVecinos.get(f.iso2) ?? [],
      conflictos: ctx.porPais[f.iso2] ?? 0,
      lat: f.lat,
      lng: f.lng,
      xy: proyectar(f.lat, f.lng),
      clave: clavePorIso.get(f.iso2) ?? null,
    };
  });

  // ── las capas: cada medida con sus datos y su leyenda ──
  const capas: CapaCliente[] = MEDIDAS.map((medida) => {
    const datos: Record<string, number> = {};
    for (const f of todas) {
      let v: number | null;
      if (medida.id === "vecinos") v = listaVecinos.get(f.iso2)?.length ?? null;
      else if (medida.id === "conflictos") v = ctx.porPais[f.iso2] ?? 0;
      else v = medida.valor(f);
      if (v !== null && Number.isFinite(v)) datos[f.iso2] = v;
    }
    const valores = Object.values(datos);
    const cortes = cortesDe(valores);
    const rampa = medida.sentido === "menor" ? [...rampaDe(medida)].reverse() : rampaDe(medida);
    const colores = cortes.length >= 5 ? rampa : rampa.slice(rampa.length - (cortes.length + 1));
    const ordenados = Object.entries(datos).sort((a, b) => b[1] - a[1]);
    const mayor = ordenados[0];
    const menor = ordenados[ordenados.length - 1];
    const leyenda: BandaLeyenda[] = [];
    for (let i = 0; i < colores.length; i++) {
      const desde = i === 0 ? null : cortes[i - 1];
      const hasta = i === cortes.length ? null : cortes[i];
      const etiqueta =
        desde === null && hasta === null
          ? formatear(medida.formato, valores[0] ?? 0)
          : desde === null
            ? "≤ " + formatear(medida.formato, hasta as number)
            : hasta === null
              ? "> " + formatear(medida.formato, desde)
              : formatear(medida.formato, desde) + " – " + formatear(medida.formato, hasta);
      leyenda.push({ etiqueta, color: colores[i] });
    }
    return {
      id: medida.id,
      nombre: medida.nombre,
      pregunta: medida.pregunta,
      fuente: medida.fuente,
      formato: medida.formato,
      sentido: medida.sentido,
      datos,
      cortes,
      colores,
      leyenda,
      conDato: valores.length,
      sinDato: todas.length - valores.length,
      mayor: mayor ? { iso2: mayor[0], nombre: porIso.get(mayor[0])?.nombre ?? mayor[0], valor: mayor[1] } : null,
      menor: menor ? { iso2: menor[0], nombre: porIso.get(menor[0])?.nombre ?? menor[0], valor: menor[1] } : null,
    };
  });

  const regiones = coberturaGlobal().regiones.map((r) => ({
    clave: r.clave,
    nombre: regionEnEspanol(r.clave),
    cuantos: r.paises,
  }));

  return {
    lienzo: LIENZO,
    rejilla: REJILLA_SVG,
    poligonos,
    paises,
    capas,
    territorios: TERRITORIOS.map((t) => ({ clave: t.clave, nombre: t.nombre, cuantos: t.paises.length })),
    regiones,
    cobertura: { mapa: coberturaMapa(), global: coberturaGlobal() },
  };
}

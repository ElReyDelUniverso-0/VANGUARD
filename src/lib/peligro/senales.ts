// ═══════════════════════════════════════════════════════════════════
// v440.5 · LAS SEÑALES — seis familias, cada dato con fecha, fuente,
// metodología y contexto
//
// Aquí no hay ni un número escrito a mano: los valores llegan de las lecturas
// (`vivo.ts`) y, si una fuente no contesta, de la instantánea con su fecha.
// Lo que sí está escrito es lo que rodea al número —el método y el contexto—,
// que es lo que convierte un dato en información y no en alarma.
// ═══════════════════════════════════════════════════════════════════

import type { Categoria, Nivel, Senal } from "./tipos";
import type { Aire, Brote, Lectura, ValorIndicador } from "./vivo";
import { BANCO_MUNDIAL } from "./instantanea";
import { nivelAgua, nivelPM25, nivelSubalimentacion } from "./niveles";

export const CATEGORIAS: { id: Categoria; nombre: string; color: string; que: string }[] = [
  {
    id: "contaminacion",
    nombre: "Contaminación",
    color: "#c9a227",
    que: "Aire que respira la gente, año a año y ahora mismo en ocho ciudades.",
  },
  {
    id: "epidemias",
    nombre: "Enfermedades y brotes",
    color: "#ff5a5f",
    que: "Los partes que publica la OMS, con su fecha y su país.",
  },
  {
    id: "alimentacion",
    nombre: "Inseguridad alimentaria",
    color: "#48c78e",
    que: "Cuánta gente no llega a la energía que necesita, según la FAO.",
  },
  {
    id: "humanitaria",
    nombre: "Crisis humanitarias",
    color: "#ff9040",
    que: "Desastres con impacto estimado sobre la población, según GDACS.",
  },
  {
    id: "ambiental",
    nombre: "Riesgos ambientales",
    color: "#5de6f7",
    que: "Fuego, tormentas, volcanes y bosque que se gana o se pierde.",
  },
  {
    id: "recursos",
    nombre: "Escasez de recursos",
    color: "#8ee9f5",
    que: "Agua, energía y lo que cuesta mantener esto en marcha.",
  },
];

export function categoriaDe(id: Categoria) {
  return CATEGORIAS.find((c) => c.id === id) ?? CATEGORIAS[0];
}

function num(n: number, decimales = 2): string {
  if (!Number.isFinite(n)) return "sin lectura";
  return n.toLocaleString("es-ES", { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
}

function valorWB(l: Lectura<ValorIndicador> | undefined, codigo: string): ValorIndicador {
  return l?.datos ?? BANCO_MUNDIAL[codigo] ?? { valor: Number.NaN, anio: "" };
}

function fechaWB(l: Lectura<ValorIndicador> | undefined, codigo: string): string {
  const v = valorWB(l, codigo);
  const de = l?.de === "instantanea" ? " · última lectura conocida" : "";
  return v.anio ? `${v.anio}${de}` : "sin fecha";
}

export type Contexto = {
  indicadores: Record<string, Lectura<ValorIndicador>>;
  brotes: Lectura<Brote[]>;
  aire: Lectura<Aire>[];
  desastres: { rojos: number; naranjas: number; verdes: number; total: number; ultimo: string | null };
  eventos: { total: number; incendios: number; tormentas: number; otros: number; ultimo: string | null };
  sismos: { total: number; mayor: number | null; mayorLugar: string | null };
};

/** Las señales, montadas con lo que se ha leído. Orden fijo: seis familias. */
export function construirSenales(c: Contexto): Senal[] {
  const salida: Senal[] = [];

  // ── 1 · CONTAMINACIÓN ────────────────────────────────────────────────────
  {
    const v = valorWB(c.indicadores["EN.ATM.PM25.MC.M3"], "EN.ATM.PM25.MC.M3");
    const n = nivelPM25(v.valor);
    salida.push({
      id: "pm25-mundo",
      categoria: "contaminacion",
      titulo: "PM2,5 en el aire · media mundial",
      valor: `${num(v.valor)} µg/m³`,
      numero: v.valor,
      unidad: "µg/m³",
      fecha: fechaWB(c.indicadores["EN.ATM.PM25.MC.M3"], "EN.ATM.PM25.MC.M3"),
      fuente: "Banco Mundial (WDI), a partir de datos de satélite y modelos de superficie",
      fuenteUrl: "https://data.worldbank.org/indicator/EN.ATM.PM25.MC.M3",
      codigo: "EN.ATM.PM25.MC.M3",
      metodologia:
        "Exposición media anual de la población a partículas finas de 2,5 micras o menos, en microgramos por metro cúbico: se combinan mediciones en tierra con estimaciones de satélite (modelo de Van Donkelaar y otros) y se pondera por población. No es el aire de una esquina: es lo que respira una persona media del planeta.",
      contexto:
        "La guía de la OMS de 2021 baja el umbral anual a 5 µg/m³; el mundo va muy por encima. Que el número sea alto no significa que hoy pase algo: significa que el aire de fondo de la mayoría de los países no está en el nivel que la OMS considera seguro a lo largo de una vida.",
      nivel: n.nivel,
      criterioNivel: `Escalera de la OMS 2021: ${n.etiqueta}`,
      enVivo: c.indicadores["EN.ATM.PM25.MC.M3"]?.de === "vivo",
    });

    const vivas = c.aire.filter((a) => a.ok && Number.isFinite(a.datos.pm25));
    if (vivas.length > 0) {
      const peor = vivas.reduce((a, b) => (b.datos.pm25 > a.datos.pm25 ? b : a));
      salida.push({
        id: "aire-ahora",
        categoria: "contaminacion",
        titulo: "Aire ahora mismo · ocho ciudades",
        valor: `peor: ${peor.datos.lugar} ${num(peor.datos.pm25, 1)} µg/m³`,
        numero: peor.datos.pm25,
        unidad: "µg/m³",
        fecha: `lectura ${peor.datos.hora || "de la última hora"} UTC`,
        fuente: "Open-Meteo (modelo CAMS de Copernicus) · API de calidad del aire",
        fuenteUrl: "https://open-meteo.com/en/docs/air-quality-api",
        metodologia:
          "Media horaria de PM2,5 en el punto exacto de cada ciudad, según el modelo de transporte químico CAMS. Se piden las ocho ciudades a la vez, cada visita.",
        contexto:
          "Esto es el aire de una hora concreta, no la media anual: un pico de una hora por polvo sahariano o por un incendio lejano se ve aquí y no en la serie anual. Por eso esta señal NO lleva nivel del observatorio: la escalera de la OMS es anual y compararla con una hora sería engañoso.",
        nivel: null,
        criterioNivel: "Sin nivel: la escalera de la OMS es anual y esto es horario",
        enVivo: true,
      });
    }
  }

  // ── 2 · ENFERMEDADES Y BROTES ────────────────────────────────────────────
  {
    const b = c.brotes;
    const ultimo = b.datos[0];
    salida.push({
      id: "brotes-oms",
      categoria: "epidemias",
      titulo: "Brotes notificados por la OMS",
      valor: `${b.datos.length} partes · el último, ${ultimo?.fecha ?? "sin fecha"}`,
      numero: b.datos.length,
      fecha: ultimo?.fecha ?? "sin fecha",
      fuente: "OMS · Disease Outbreak News",
      fuenteUrl: "https://www.who.int/emergencies/disease-outbreak-news",
      metodologia:
        "Cada parte es un evento de salud pública que un Estado Parte notifica a la OMS o que la OMS verifica por su cuenta (Reglamento Sanitario Internacional). El parte trae país, fechas, casos y medidas; aquí se listan los últimos ocho con su enlace, sin resumir cifras que cambian.",
      contexto:
        ultimo
          ? `El parte más reciente es «${ultimo.titulo}». Que la OMS publique un parte no es una emergencia internacional: eso es otra cosa, la ESPII, y la declara el Director General. Vanguard no adelanta esa decisión.`
          : "Ahora mismo no se ha podido leer la lista de la OMS; mira el enlace oficial.",
      nivel: null,
      criterioNivel: "Sin nivel: la OMS no puntúa los partes; la ESPII se declara aparte",
      enVivo: b.de === "vivo",
    });
  }

  // ── 3 · INSEGURIDAD ALIMENTARIA ──────────────────────────────────────────
  {
    const v = valorWB(c.indicadores["SN.ITK.DEFC.ZS"], "SN.ITK.DEFC.ZS");
    const n = nivelSubalimentacion(v.valor);
    const personas = Number.isFinite(v.valor) ? Math.round((v.valor / 100) * 8_100_000_000) : Number.NaN;
    salida.push({
      id: "subalimentacion",
      categoria: "alimentacion",
      titulo: "Prevalencia de subalimentación · mundo",
      valor: `${num(v.valor, 1)} %`,
      numero: v.valor,
      unidad: "%",
      fecha: fechaWB(c.indicadores["SN.ITK.DEFC.ZS"], "SN.ITK.DEFC.ZS"),
      fuente: "FAO (SOFI) a través de los Indicadores del Desarrollo del Banco Mundial",
      fuenteUrl: "https://data.worldbank.org/indicator/SN.ITK.DEFC.ZS",
      codigo: "SN.ITK.DEFC.ZS",
      metodologia:
        "Prevalencia de subalimentación: proporción de la población cuya ingesta energética habitual no llega al mínimo necesario para una vida sana, estimada con la oferta alimentaria y su distribución (método FAO). Se publica como media trienal y aquí se muestra el último año disponible.",
      contexto: Number.isFinite(personas)
        ? `Traducido con la población mundial de referencia (8.100 millones), ese ${num(v.valor, 1)} % son unos ${(personas / 1_000_000).toFixed(0)} millones de personas. El cálculo es nuestro; el porcentaje es de la FAO y lleva su año al lado.`
        : "El porcentaje es de la FAO; el año va al lado.",
      nivel: n.nivel,
      criterioNivel: `Bandas de gravedad de la FAO: ${n.etiqueta}`,
      enVivo: c.indicadores["SN.ITK.DEFC.ZS"]?.de === "vivo",
    });
  }

  // ── 4 · CRISIS HUMANITARIAS ──────────────────────────────────────────────
  {
    const d = c.desastres;
    const nivel: Nivel | null = d.rojos > 0 ? 4 : d.naranjas > 0 ? 3 : d.total > 0 ? 2 : 1;
    salida.push({
      id: "desastres-gdacs",
      categoria: "humanitaria",
      titulo: "Desastres abiertos con impacto estimado",
      valor: `${d.rojos} rojos · ${d.naranjas} naranjas · ${d.total} en total`,
      numero: d.total,
      fecha: d.ultimo ? `última alerta ${d.ultimo.slice(0, 10)}` : "sin alertas legibles",
      fuente: "GDACS · Comisión Europea (JRC) y OCHA",
      fuenteUrl: "https://www.gdacs.org/",
      metodologia:
        "GDACS estima el impacto potencial de cada terremoto, ciclón, inundación, sequía, incendio o volcán combinando la magnitud física del evento, la población expuesta en un radio de influencia y la vulnerabilidad del país. Con eso saca un nivel: verde, naranja o rojo, y lo recalcula mientras el evento sigue abierto.",
      contexto:
        "Verde no es «nada»: es «hay un evento y se espera poco impacto». Rojo no es «catástrofe confirmada»: es «la estimación de impacto es alta y hay que mirar el parte». Las cifras de daños y víctimas se confirman despacio; aquí no se adelantan. Las crisis crónicas (desplazamiento por conflicto) no están en GDACS y no se inventan en esta casa: se enlazan a OCHA.",
      nivel,
      criterioNivel: "Nivel de GDACS tal cual (rojo → 4, naranja → 3, verde → 2)",
      enVivo: true,
    });
  }

  // ── 5 · RIESGOS AMBIENTALES ──────────────────────────────────────────────
  {
    const e = c.eventos;
    salida.push({
      id: "eventos-naturales",
      categoria: "ambiental",
      titulo: "Eventos naturales abiertos observados por satélite",
      valor: `${e.total} abiertos · ${e.incendios} incendios · ${e.tormentas} tormentas`,
      numero: e.total,
      fecha: e.ultimo ? `último ${e.ultimo.slice(0, 10)}` : "sin eventos legibles",
      fuente: "NASA EONET · Earth Observatory",
      fuenteUrl: "https://eonet.gsfc.nasa.gov/",
      metodologia:
        "EONET reúne eventos naturales detectados por satélites y por agencias asociadas (incendios por foco térmico, tormentas por seguimiento de sistemas, volcanes por actividad registrada). Cada evento trae su fecha y su fuente original.",
      contexto:
        "Un incendio en EONET es un foco observado, no una superficie quemada certificada; el parte final lo da la autoridad del país. Se listan abiertos ahora, sin sumar hectáreas ni muertos.",
      nivel: null,
      criterioNivel: "Sin nivel: EONET no publica clasificación de gravedad",
      enVivo: true,
    });

    const v = valorWB(c.indicadores["AG.LND.FRST.ZS"], "AG.LND.FRST.ZS");
    salida.push({
      id: "bosque",
      categoria: "ambiental",
      titulo: "Superficie forestal del planeta",
      valor: `${num(v.valor, 1)} % de la tierra`,
      numero: v.valor,
      unidad: "%",
      fecha: fechaWB(c.indicadores["AG.LND.FRST.ZS"], "AG.LND.FRST.ZS"),
      fuente: "FAO (Evaluación de los Recursos Forestales) vía Banco Mundial",
      fuenteUrl: "https://data.worldbank.org/indicator/AG.LND.FRST.ZS",
      codigo: "AG.LND.FRST.ZS",
      metodologia:
        "Porcentaje de la superficie terrestre cubierta por bosque, según la definición de la FAO (árboles de más de 5 m, cobertura superior al 10 %, mínimo 0,5 ha).",
      contexto:
        "El porcentaje cambia poco de un año a otro y por eso engaña: la pérdida neta se ve en décimas. La cifra dice cuánto bosque hay, no cuánto se está perdiendo en este momento.",
      nivel: null,
      criterioNivel: "Sin nivel: no hay umbral oficial de «bosque peligroso»",
      enVivo: c.indicadores["AG.LND.FRST.ZS"]?.de === "vivo",
    });
  }

  // ── 6 · ESCASEZ DE RECURSOS ──────────────────────────────────────────────
  {
    const v = valorWB(c.indicadores["ER.H2O.FWTL.ZS"], "ER.H2O.FWTL.ZS");
    const n = nivelAgua(v.valor);
    salida.push({
      id: "agua",
      categoria: "recursos",
      titulo: "Extracción de agua dulce",
      valor: `${num(v.valor, 1)} % de los recursos renovables`,
      numero: v.valor,
      unidad: "%",
      fecha: fechaWB(c.indicadores["ER.H2O.FWTL.ZS"], "ER.H2O.FWTL.ZS"),
      fuente: "FAO AQUASTAT vía Banco Mundial",
      fuenteUrl: "https://data.worldbank.org/indicator/ER.H2O.FWTL.ZS",
      codigo: "ER.H2O.FWTL.ZS",
      metodologia:
        "Agua dulce extraída para agricultura, industria y ciudades, dividida por los recursos renovables disponibles. Es la medida estándar de estrés hídrico; la FAO considera que por encima del 25 % hay estrés.",
      contexto:
        "El 9 % mundial esconde países por encima del 100 %, que dependen de agua de fuera o de acuíferos que no se recargan. La media mundial no describe a nadie: la comparación por país está más abajo.",
      nivel: n.nivel,
      criterioNivel: `Umbral de la FAO (25 %): ${n.etiqueta}`,
      enVivo: c.indicadores["ER.H2O.FWTL.ZS"]?.de === "vivo",
    });

    const e = valorWB(c.indicadores["EG.ELC.ACCS.ZS"], "EG.ELC.ACCS.ZS");
    salida.push({
      id: "electricidad",
      categoria: "recursos",
      titulo: "Población con acceso a electricidad",
      valor: `${num(e.valor, 1)} %`,
      numero: e.valor,
      unidad: "%",
      fecha: fechaWB(c.indicadores["EG.ELC.ACCS.ZS"], "EG.ELC.ACCS.ZS"),
      fuente: "Banco Mundial / Agencia Internacional de la Energía",
      fuenteUrl: "https://data.worldbank.org/indicator/EG.ELC.ACCS.ZS",
      codigo: "EG.ELC.ACCS.ZS",
      metodologia:
        "Porcentaje de personas con conexión eléctrica en su hogar, estimado por encuestas nacionales armonizadas.",
      contexto:
        "Casi una de cada doce personas sigue sin conexión. Es el reverso de la escasez: donde no hay energía no hay agua potable, ni frío para la comida, ni hospital que funcione de noche.",
      nivel: null,
      criterioNivel: "Sin nivel: no hay banda oficial de «escasez eléctrica»",
      enVivo: c.indicadores["EG.ELC.ACCS.ZS"]?.de === "vivo",
    });
  }

  return salida;
}

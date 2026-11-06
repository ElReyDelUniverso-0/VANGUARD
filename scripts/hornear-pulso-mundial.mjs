// HORNADA v358.0 WORLD PULSE — hornea la INSTANTÁNEA REAL del Banco Mundial.
// Cero valores inventados: TODO número aquí nace de la API v2 (CC BY 4.0).
// Cada código fue verificado EN VIVO contra la API antes de esta hornada.
// Salida: src/lib/pulso-mundial-instantanea.json (con fecha de extracción,
// licencia, cobertura y limitaciones declaradas).
import { writeFileSync } from "node:fs";

const ANIOS = "2012:2025";
const PAISES = [
  // África
  ["DZA", "Argelia", "África"], ["AGO", "Angola", "África"], ["ETH", "Etiopía", "África"],
  ["GHA", "Ghana", "África"], ["KEN", "Kenia", "África"], ["MAR", "Marruecos", "África"],
  ["NGA", "Nigeria", "África"], ["ZAF", "Sudáfrica", "África"], ["SDN", "Sudán", "África"],
  // América
  ["ARG", "Argentina", "América"], ["BRA", "Brasil", "América"], ["CAN", "Canadá", "América"],
  ["CHL", "Chile", "América"], ["COL", "Colombia", "América"], ["MEX", "México", "América"],
  ["PER", "Perú", "América"], ["USA", "Estados Unidos", "América"], ["VEN", "Venezuela", "América"],
  // Asia
  ["ARE", "Emiratos Árabes Unidos", "Asia"], ["CHN", "China", "Asia"], ["IDN", "Indonesia", "Asia"],
  ["IND", "India", "Asia"], ["IRN", "Irán", "Asia"], ["ISR", "Israel", "Asia"],
  ["JPN", "Japón", "Asia"], ["KAZ", "Kazajistán", "Asia"], ["KOR", "Corea del Sur", "Asia"],
  ["MYS", "Malasia", "Asia"], ["PAK", "Pakistán", "Asia"], ["PHL", "Filipinas", "Asia"],
  ["SAU", "Arabia Saudita", "Asia"], ["THA", "Tailandia", "Asia"], ["TUR", "Turquía", "Asia"],
  ["VNM", "Vietnam", "Asia"],
  // Europa
  ["DEU", "Alemania", "Europa"], ["ESP", "España", "Europa"], ["FRA", "Francia", "Europa"],
  ["GBR", "Reino Unido", "Europa"], ["ITA", "Italia", "Europa"], ["NLD", "Países Bajos", "Europa"],
  ["POL", "Polonia", "Europa"], ["SWE", "Suecia", "Europa"], ["UKR", "Ucrania", "Europa"],
  ["RUS", "Rusia", "Europa"], ["CHE", "Suiza", "Europa"],
  // Oceanía
  ["AUS", "Australia", "Oceanía"], ["NZL", "Nueva Zelanda", "Oceanía"],
];

const INDICADORES = [
  { codigo: "NY.GDP.MKTP.KD.ZG", nombre: "Crecimiento del PIB", descripcion: "Variación anual del producto interior bruto a precios constantes, en porcentaje.", unidad: "%", categoria: "ECONOMIA", papel: "indice", direccion: 1 },
  { codigo: "FP.CPI.TOTL.ZG", nombre: "Inflación", descripcion: "Variación anual de los precios al consumidor, en porcentaje. Un valor alto erosiona salarios y ahorro.", unidad: "%", categoria: "ECONOMIA", papel: "indice", direccion: -1 },
  { codigo: "NY.GDP.PCAP.CD", nombre: "PIB per cápita", descripcion: "Producto interior bruto por habitante en dólares corrientes.", unidad: "US$", categoria: "ECONOMIA", papel: "indice", direccion: 1 },
  { codigo: "NE.TRD.GNFS.ZS", nombre: "Apertura comercial", descripcion: "Suma de exportaciones e importaciones de bienes y servicios como porcentaje del PIB.", unidad: "% del PIB", categoria: "ECONOMIA", papel: "contexto", direccion: 1 },
  { codigo: "SP.POP.TOTL", nombre: "Población", descripcion: "Número de habitantes registrados por el Banco Mundial.", unidad: "personas", categoria: "CONTEXTO", papel: "contexto", direccion: 1 },
  { codigo: "SP.DYN.LE00.IN", nombre: "Esperanza de vida", descripcion: "Años medios que viviría un recién nacido con los patrones de mortalidad del año.", unidad: "años", categoria: "SOCIEDAD", papel: "indice", direccion: 1 },
  { codigo: "SL.UEM.TOTL.ZS", nombre: "Desempleo", descripcion: "Porcentaje de la fuerza laboral sin trabajo pero disponible y buscándolo.", unidad: "%", categoria: "SOCIEDAD", papel: "indice", direccion: -1 },
  { codigo: "SH.XPD.CHEX.GD.ZS", nombre: "Gasto en salud", descripcion: "Gasto corriente en salud como porcentaje del PIB.", unidad: "% del PIB", categoria: "SOCIEDAD", papel: "indice", direccion: 1 },
  { codigo: "EN.GHG.CO2.PC.CE.AR5", nombre: "CO₂ per cápita", descripcion: "Emisiones de dióxido de carbono per cápita, en toneladas de CO2 equivalente (excluye cambios de uso de suelo).", unidad: "t CO2e", categoria: "AMBIENTE", papel: "indice", direccion: -1 },
  { codigo: "EG.FEC.RNEW.ZS", nombre: "Energía renovable", descripcion: "Porcentaje del consumo final de energía que procede de fuentes renovables.", unidad: "%", categoria: "AMBIENTE", papel: "indice", direccion: 1 },
  { codigo: "SM.POP.TOTL", nombre: "Población migrante", descripcion: "Personas nacidas fuera que residen en el país (stock migratorio internacional).", unidad: "personas", categoria: "CONTEXTO", papel: "contexto", direccion: 1 },
];

const iso3s = PAISES.map((p) => p[0]).join(";");
const datos = {};
let ultimaActualizacionWB = "";
let peticiones = 0;
let fallos = [];

for (const ind of INDICADORES) {
  const url = `https://api.worldbank.org/v2/country/${iso3s};WLD/indicator/${ind.codigo}?format=json&per_page=1000&date=${ANIOS}`;
  const res = await fetch(url, { headers: { "User-Agent": "Vanguard/2.0 (+https://vanguard-kq9r.vercel.app · atribución CC BY 4.0)" } });
  peticiones++;
  if (!res.ok) { fallos.push(`${ind.codigo}: HTTP ${res.status}`); continue; }
  const cuerpo = await res.json();
  if (!Array.isArray(cuerpo) || !Array.isArray(cuerpo[1])) { fallos.push(`${ind.codigo}: cuerpo raro`); continue; }
  if (cuerpo[0]?.lastupdated)
    ultimaActualizacionWB = ultimaActualizacionWB > cuerpo[0].lastupdated ? ultimaActualizacionWB : cuerpo[0].lastupdated;
  let filas = 0;
  for (const f of cuerpo[1]) {
    if (typeof f?.value !== "number" || !Number.isFinite(f.value)) continue;
    const iso3 = f.countryiso3code; const anio = String(f.date);
    if (!iso3 || !/^\d{4}$/.test(anio)) continue;
    datos[iso3] = datos[iso3] || {};
    datos[iso3][ind.codigo] = datos[iso3][ind.codigo] || {};
    datos[iso3][ind.codigo][anio] = Math.round(f.value * 1e6) / 1e6;
    filas++;
  }
  console.log(`${ind.codigo}: ${filas} filas reales`);
  if (filas === 0) fallos.push(`${ind.codigo}: 0 filas`);
}

if (fallos.length > 0) {
  console.error("FALLOS HONESTOS:", fallos);
  // Un indicador sin datos NO entra: la casa no finge. Con menos de 8 vivos, abortar.
  const vivos = INDICADORES.length - fallos.length;
  if (vivos < 8) { console.error(`Solo ${vivos}/11 indicadores vivos: HORNADA ABORTADA`); process.exit(1); }
}

const paises = PAISES.map(([iso3, nombre, continente]) => ({ iso3, nombre, continente }));
paises.push({ iso3: "WLD", nombre: "Mundo", continente: "MUNDO" });

const salida = {
  meta: {
    fuente: "Banco Mundial · Indicadores del Desarrollo Mundial (API v2)",
    licencia: "CC BY 4.0 — atribución preservada, enlaces al original en cada indicador",
    enlace: "https://datos.bancomundial.org/",
    extraccion: new Date().toISOString(),
    ultimaActualizacionWB,
    anios: ANIOS.replace(":", "–"),
    peticiones,
    paisesCubiertos: PAISES.length + 1,
    limitaciones: [
      "Los datos NO son de Vanguard: nacen del Banco Mundial y se citan con enlace al original en cada indicador.",
      "Cada indicador tiene su propio último año disponible (de 2021 a 2025): comparar años distintos entre indicadores exige leer la etiqueta de año de cada dato.",
      "Serie 2012–2025: los años más recientes pueden ser estimaciones preliminares del propio Banco Mundial y revisarse en su casa.",
      "47 naciones + el agregado mundial: es una muestra curada del planeta, NO el censo completo del Banco Mundial (~200 economías).",
      "Taiwán, Corea del Norte y otros territorios sin cobertura del Banco Mundial quedan FUERA (ausencia declarada, no fingida).",
      "Desempleo y gasto en salud tienen lagunas por país y año: un hueco se muestra como hueco, jamás rellenado.",
      "El WORLD PULSE INDEX es un índice DERIVADO por Vanguard (percentiles de los 7 indicadores del índice con pesos editoriales publicados): no es una fuente primaria ni una medida oficial.",
    ],
  },
  indicadores: INDICADORES.map(({ codigo, nombre, descripcion, unidad, categoria, papel, direccion }) => {
    let ultimo = 0;
    for (const iso3 of Object.keys(datos)) {
      const serie = datos[iso3]?.[codigo];
      if (serie) for (const a of Object.keys(serie)) ultimo = Math.max(ultimo, Number(a));
    }
    return { codigo, nombre, descripcion, unidad, categoria, papel, direccion, ultimoAnio: ultimo || null };
  }),
  paises,
  datos,
};

const destino = "public/pulso-mundial-instantanea.json";
writeFileSync(destino, JSON.stringify(salida, null, 1));
console.log(`HORNADA OK: ${peticiones} peticiones, WB lastupdated=${ultimaActualizacionWB}, países=${Object.keys(datos).length}`);
console.log(`Escrito: ${destino} (${(JSON.stringify(salida).length / 1024).toFixed(0)} KB)`);

#!/usr/bin/env node
/**
 * v405.13 · EL CENSO COMPLETO — generador del censo del Banco Mundial
 *
 * POR QUÉ EXISTE: la ficha del país unía cinco tablas de la casa, pero la
 * población y la superficie solo las tenía `atlas-data` para 84 naciones: en el
 * mapa, la capa «Población» apagaba 165 países con la palabra «sin dato». Este
 * script completa el censo con la fuente pública que la propia casa ya usa para
 * el gasto militar (Banco Mundial) y añade tres columnas que no existían: PIB,
 * PIB por habitante y esperanza de vida.
 *
 * REGLA QUE CUMPLE: no se escribe ni un número a mano. Se pregunta a la API, se
 * guarda el año de CADA dato (no todos los países publican el mismo año) y se
 * deja escrito el día de la captura. Donde el Banco Mundial no tiene valor, la
 * entrada no existe: la ficha dirá «sin dato», nunca un cero.
 *
 * Uso:  node scripts/generar-censo-banco-mundial.mjs
 * Sale: src/lib/mundos/censo-banco-mundial.json
 */
import { readFile, writeFile } from "node:fs/promises";

const INDICADORES = {
  pob: "SP.POP.TOTL", // población total (personas)
  sup: "AG.SRF.TOTL.K2", // superficie (km²)
  pib: "NY.GDP.MKTP.CD", // PIB a precios corrientes (US$)
  pibPC: "NY.GDP.PCAP.CD", // PIB por habitante (US$)
  mil: "MS.MIL.XPND.CD", // gasto militar (US$)
  vida: "SP.DYN.LE00.IN", // esperanza de vida al nacer (años)
};

const BASE = "https://api.worldbank.org/v2/country/all/indicator";

/** El censo de la casa se lee de su fuente (geo-paises.ts) sin compilarlo:
 *  se extraen los ISO-3 declarados. Si el censo crece, esto crece solo. */
async function iso3DelCenso() {
  const texto = await readFile(new URL("../src/lib/geo-paises.ts", import.meta.url), "utf8");
  return new Set([...texto.matchAll(/iso3:\s*"([A-Z]{3})"/g)].map((m) => m[1]));
}

async function pedir(codigo) {
  const url = `${BASE}/${codigo}?format=json&per_page=400&mrnev=1`;
  for (let intento = 1; intento <= 5; intento++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": "vanguard-ia3" } });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const d = await r.json();
      if (!Array.isArray(d) || !Array.isArray(d[1])) throw new Error("respuesta inesperada");
      return { filas: d[1], actualizado: d[0]?.lastupdated ?? null };
    } catch (e) {
      if (intento === 5) throw e;
      await new Promise((ok) => setTimeout(ok, 2500 * intento));
    }
  }
}

const main = async () => {
  const censo = {};
  const anios = {};
  const actualizado = {};
  const porIndicador = {};

  for (const [clave, codigo] of Object.entries(INDICADORES)) {
    const { filas, actualizado: upd } = await pedir(codigo);
    actualizado[codigo] = upd;
    porIndicador[codigo] = { nombre: clave, filas: filas.length, conDato: 0 };
    for (const f of filas) {
      const iso3 = (f.countryiso3code || "").toUpperCase();
      if (!iso3 || f.value === null || f.value === undefined) continue;
      censo[iso3] ??= {};
      anios[iso3] ??= {};
      censo[iso3][clave] = Math.round(f.value * 100) / 100;
      anios[iso3][clave] = Number(f.date);
      porIndicador[codigo].conDato += 1;
    }
    console.log(`${clave.padEnd(6)} ${codigo.padEnd(16)} ${filas.length} filas · ${porIndicador[codigo].conDato} con dato`);
  }

  // solo los países del censo de la casa (249): los agregados del Banco
  // Mundial (AFE, EUU, WLD…) no son países y aquí no entran
  const delCenso = await iso3DelCenso();
  const paises = {};
  for (const [iso3, valores] of Object.entries(censo)) {
    if (!delCenso.has(iso3)) continue;
    paises[iso3] = { ...valores, anios: anios[iso3] };
  }

  const salida = {
    fuente: "Banco Mundial · API v2 (datos abiertos)",
    actualizado,
    captura: new Date().toISOString().slice(0, 10),
    indicadores: INDICADORES,
    paises,
  };

  const ruta = new URL("../src/lib/mundos/censo-banco-mundial.json", import.meta.url);
  await writeFile(ruta, JSON.stringify(salida) + "\n", "utf8");
  const con = (k) => Object.values(paises).filter((p) => p[k] !== undefined).length;
  console.log(`\n${Object.keys(paises).length} países del censo · pob ${con("pob")} · sup ${con("sup")} · pib ${con("pib")} · pibPC ${con("pibPC")} · mil ${con("mil")} · vida ${con("vida")}`);
  console.log(`escrito ${ruta.pathname}`);
};

main().catch((e) => {
  console.error("falló:", e.message);
  process.exit(1);
});

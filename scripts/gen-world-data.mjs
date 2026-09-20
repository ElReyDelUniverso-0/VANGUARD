// Genera src/lib/world-data.ts — 250 países con nombre ES, moneda, símbolo, región y tasa.
// Fuentes: mledoze/countries (nombres+monedas) + open.er-api.com (tasas en vivo de hoy).
import fs from "node:fs";

const RAW = JSON.parse(fs.readFileSync("/home/z/my-project/scripts/countries-raw.json", "utf8"));

// 1) Tasas en vivo por 1 USD
let RATES = {};
try {
  const r = await fetch("https://open.er-api.com/v6/latest/USD", { signal: AbortSignal.timeout(15000) }).then((x) => x.json());
  RATES = r?.rates ?? {};
  console.log("tasas OK:", Object.keys(RATES).length);
} catch (e) {
  console.error("er-api falló, uso tasas de respaldo parciales", e.message);
  RATES = { EUR: 0.92, GBP: 0.79, JPY: 149, CNY: 7.2, MXN: 17.1, CAD: 1.36, BRL: 5.0, ARS: 980, RUB: 92, UAH: 41, TRY: 33, INR: 83, ILS: 3.7, KRW: 1340, AUD: 1.52, CHF: 0.88, CLP: 915, COP: 4050, PEN: 3.7 };
}

const REGION_ES = { Americas: "América", Europe: "Europa", Asia: "Asia", Africa: "África", Oceania: "Oceanía", Antarctic: "Antártida" };

// 2) Nombres ES de monedas frecuentes (fallback: nombre EN de mledoze)
const CUR_ES = {
  USD: "Dólar estadounidense", EUR: "Euro", GBP: "Libra esterlina", JPY: "Yen", CNY: "Yuan", KRW: "Won", KPW: "Won norcoreano",
  INR: "Rupia india", RUB: "Rublo", UAH: "Grivna", PLN: "Zloty", CZK: "Corona checa", SEK: "Corona sueca", NOK: "Corona noruega",
  DKK: "Corona danesa", ISK: "Corona islandesa", CHF: "Franco suizo", TRY: "Lira turca", RON: "Leu rumano", BGN: "Lev búlgaro",
  HUF: "Florín húngaro", HRK: "Kuna", RSD: "Dinar serbio", MKD: "Denar macedonio", ALL: "Lek albanés", BAM: "Marco convertible",
  MDL: "Leu moldavo", BYN: "Rublo bielorruso", MXN: "Peso mexicano", CAD: "Dólar canadiense", GTQ: "Quetzal", HNL: "Lempira",
  NIO: "Córdoba", CRC: "Colón", PAB: "Balboa", CUP: "Peso cubano", DOP: "Peso dominicano", HTG: "Gourde", JMD: "Dólar jamaicano",
  BSD: "Dólar bahameño", BBD: "Dólar barbadeño", TTD: "Dólar trinitario", XCD: "Dólar del Caribe Oriental", BZD: "Dólar beliceño",
  COP: "Peso colombiano", VES: "Bolívar", CLP: "Peso chileno", ARS: "Peso argentino", UYU: "Peso uruguayo", PYG: "Guaraní",
  BOB: "Boliviano", PEN: "Sol peruano", BRL: "Real", GYD: "Dólar guyanés", SRD: "Dólar surinamés", ILS: "Séquel",
  JOD: "Dinar jordano", LBP: "Libra libanesa", SYP: "Libra siria", IQD: "Dinar iraquí", IRR: "Rial iraní", SAR: "Riyal saudita",
  QAR: "Riyal catarí", KWD: "Dinar kuwaití", BHD: "Dinar bareiní", OMR: "Rial omaní", AED: "Dirham", YER: "Rial yemení",
  AFN: "Afgani", PKR: "Rupia pakistaní", BDT: "Taka", LKR: "Rupia de Sri Lanka", NPR: "Rupia nepalesa", BTN: "Ngultrum",
  MVR: "Rufiyaa", MMK: "Kyat", THB: "Baht", LAK: "Kip", KHR: "Riel", VND: "Dong", MYR: "Ringgit", SGD: "Dólar de Singapur",
  IDR: "Rupia indonesia", PHP: "Peso filipino", BND: "Dólar de Brunéi", TWD: "Nuevo dólar taiwanés", HKD: "Dólar de Hong Kong",
  MOP: "Pataca", MNT: "Tugrik", KZT: "Tenge", UZS: "Som uzbeko", KGS: "Som kirguís", TJS: "Somoni", TMT: "Manat turcomano",
  AZN: "Manat azerbaiyano", AMD: "Dram", GEL: "Lari", EGP: "Libra egipcia", LYD: "Dinar libio", TND: "Dinar tunecino",
  DZD: "Dinar argelino", MAD: "Dirham marroquí", MRU: "Uguiya", SDG: "Libra sudanesa", SSP: "Libra sursudanesa", ETB: "Birr",
  ERN: "Nakfa", DJF: "Franco yibutiano", SOS: "Chelín somalí", KES: "Chelín keniano", UGX: "Chelín ugandés", TZS: "Chelín tanzano",
  RWF: "Franco ruandés", BIF: "Franco burundés", CDF: "Franco congoleño", AOA: "Kwanza", ZMW: "Kwacha zambiano",
  MWK: "Kwacha malauí", MZN: "Metical", ZWL: "Dólar zimbabuense", ZAR: "Rand", NAD: "Dólar namibio", BWP: "Pula",
  LSL: "Loti", SZL: "Lilangeni", MGA: "Ariary", KMF: "Franco comorense", SCR: "Rupia de Seychelles", MUR: "Rupia de Mauricio",
  XOF: "Franco CFA occidental", XAF: "Franco CFA central", GHS: "Cedi", NGN: "Naira", GMD: "Dalasi", GNF: "Franco guineano",
  SLL: "Leone", SLE: "Leone", LRD: "Dólar liberiano", CVE: "Escudo caboverdiano", STN: "Dobra", CDP: "—",
  AUD: "Dólar australiano", NZD: "Dólar neozelandés", FJD: "Dólar fiyiano", PGK: "Kina", SBD: "Dólar salomonense",
  VUV: "Vatu", WST: "Tala", TOP: "Paanga", XPF: "Franco CFP", KID: "Dólar kiribatí", TVD: "Dólar tuvaluano",
  FKP: "Libra malvinense", GIP: "Libra gibraltareña", SHP: "Libra de Santa Elena", JEP: "Libra de Jersey",
  GGP: "Libra de Guernsey", IMP: "Libra de Man", GGP2: "—", CYP: "—", AWG: "Florín arubeño", ANG: "Florín antillano",
  KYD: "Dólar caimán", BMD: "Dólar bermudeño", GIP2: "—", MXV: "—", CLF: "—", COU: "—", UYI: "—", CHE: "—", CHW: "—",
  BOV: "—", TPE: "—", CUC: "Peso convertible cubano", NLG: "—", FRO: "—", GGP3: "—",
};

// 3) Símbolos de respaldo
const SYM = {
  USD: "$", EUR: "€", GBP: "£", JPY: "¥", CNY: "¥", KRW: "₩", KPW: "₩", INR: "₹", RUB: "₽", UAH: "₴", PLN: "zł",
  CZK: "Kč", SEK: "kr", NOK: "kr", DKK: "kr", ISK: "kr", CHF: "Fr", TRY: "₺", RON: "lei", BGN: "лв", HUF: "Ft",
  RSD: "дин", MKD: "ден", ALL: "L", BAM: "KM", MDL: "L", BYN: "Br", MXN: "$", CAD: "C$", GTQ: "Q", HNL: "L",
  NIO: "C$", CRC: "₡", PAB: "B/.", CUP: "$", DOP: "RD$", HTG: "G", COP: "$", VES: "Bs.", CLP: "$", ARS: "$",
  UYU: "$U", PYG: "₲", BOB: "Bs.", PEN: "S/", BRL: "R$", ILS: "₪", JOD: "د.ا", LBP: "ل.ل", SYP: "£S", IQD: "ع.د",
  IRR: "﷼", SAR: "﷼", QAR: "﷼", KWD: "د.ك", BHD: ".د.ب", OMR: "ر.ع.", AED: "د.إ", YER: "﷼", AFN: "؋",
  PKR: "₨", BDT: "৳", LKR: "Rs", NPR: "Rs", BTN: "Nu.", MVR: "Rf", MMK: "K", THB: "฿", LAK: "₭", KHR: "៛",
  VND: "₫", MYR: "RM", SGD: "S$", IDR: "Rp", PHP: "₱", BND: "B$", TWD: "NT$", HKD: "HK$", MOP: "P", MNT: "₮",
  KZT: "₸", UZS: "soʻm", KGS: "⃀", TJS: "SM", TMT: "m", AZN: "₼", AMD: "֏", GEL: "₾", EGP: "E£", LYD: "ل.د",
  TND: "د.ت", DZD: "دج", MAD: "د.م.", MRU: "UM", SDG: "ج.س", SSP: "£", ETB: "Br", ERN: "Nfk", DJF: "Fdj",
  SOS: "Sh", KES: "KSh", UGX: "USh", TZS: "TSh", RWF: "FRw", BIF: "FBu", CDF: "FC", AOA: "Kz", ZMW: "ZK",
  MWK: "MK", MZN: "MT", ZWL: "Z$", ZAR: "R", NAD: "N$", BWP: "P", LSL: "L", SZL: "E", MGA: "Ar", KMF: "CF",
  SCR: "Rs", MUR: "Rs", XOF: "CFA", XAF: "FCFA", GHS: "₵", NGN: "₦", GMD: "D", GNF: "FG", SLE: "Le",
  LRD: "L$", CVE: "$", STN: "Db", AUD: "A$", NZD: "NZ$", FJD: "FJ$", PGK: "K", SBD: "SI$", VUV: "VT",
  WST: "T", TOP: "T$", XPF: "₣", FKP: "£", GIP: "£", SHP: "£", JEP: "£", GGP: "£", IMP: "£", AWG: "ƒ",
  ANG: "ƒ", KYD: "CI$", BMD: "BD$", TTD: "TT$", JMD: "J$", BSD: "B$", BBD: "Bds$", XCD: "EC$", BZD: "BZ$",
  GYD: "G$", SRD: "G$", CUC: "CUC$", WST2: "—",
};

function pickCur(curs) {
  const codes = Object.keys(curs ?? {});
  if (!codes.length) return null;
  const code = codes[0];
  const meta = curs[code] ?? {};
  return { code, name: CUR_ES[code] || meta.name || code, symbol: meta.symbol || SYM[code] || "" };
}

const outFlags = [];
const outCur = [];

for (const c of RAW) {
  const code = c.cca2.toLowerCase();
  const name = c.translations?.spa?.common || c.name?.common || code.toUpperCase();
  const region = REGION_ES[c.region] || "Oceanía";
  outFlags.push({ code, name, region });
  const cur = pickCur(c.currencies);
  if (cur) {
    const rate = RATES[cur.code] ?? (cur.code === "USD" ? 1 : null);
    outCur.push({ code, name, region, curCode: cur.code, curName: cur.name, symbol: cur.symbol, rate: rate ?? 1, noRate: rate == null });
  } else {
    console.log("sin moneda:", code, name);
  }
}

// Unión Europea como entrada propia (bandera real "eu")
if (!outCur.some((x) => x.code === "eu")) {
  outCur.push({ code: "eu", name: "Unión Europea", region: "Europa", curCode: "EUR", curName: "Euro", symbol: "€", rate: RATES.EUR ?? 0.92, noRate: false });
  outFlags.push({ code: "eu", name: "Unión Europea", region: "Europa" });
}

outFlags.sort((a, b) => a.name.localeCompare(b.name, "es"));
outCur.sort((a, b) => a.name.localeCompare(b.name, "es"));

const fmtRate = (n) => (n >= 1000 ? Math.round(n * 100) / 100 : n >= 10 ? Math.round(n * 10000) / 10000 : Math.round(n * 1000000) / 1000000);

const flagsTs = outFlags
  .map((f) => `  { code: ${JSON.stringify(f.code)}, name: ${JSON.stringify(f.name)}, region: ${JSON.stringify(f.region)} }`)
  .join(",\n");

const curTs = outCur
  .map((c) => `  { code: ${JSON.stringify(c.code)}, name: ${JSON.stringify(c.name)}, region: ${JSON.stringify(c.region)}, curCode: ${JSON.stringify(c.curCode)}, curName: ${JSON.stringify(c.curName)}, symbol: ${JSON.stringify(c.symbol)}, rate: ${fmtRate(c.rate)} }`)
  .join(",\n");

const ts = `// v20 DATASET MUNDIAL REAL: ${outFlags.length} países/territorios con nombre en español,
// bandera real (flagcdn.com/{code}.png) y moneda oficial con tasa de cambio (fuente: open.er-api.com, captura del ${new Date().toISOString().slice(0, 10)}).
// NO editar a mano: regenerar con scripts/gen-world-data.mjs.

export interface WorldFlag {
  code: string;   // ISO 3166-1 alpha-2 en minúsculas (= código de bandera en flagcdn)
  name: string;   // nombre en español
  region: string;
}

export interface WorldCountry {
  code: string;
  name: string;
  region: string;
  curCode: string;  // código ISO 4217 de la moneda
  curName: string;
  symbol: string;
  rate: number;     // unidades de moneda por 1 USD
}

export const WORLD_FLAGS: WorldFlag[] = [
${flagsTs},
];

export const WORLD_CURRENCIES_FULL: WorldCountry[] = [
${curTs},
];

export const WORLD_FLAG_MAP: Record<string, string> = Object.fromEntries(WORLD_FLAGS.map((f) => [f.code, f.name]));

export function countryName(code: string): string {
  return WORLD_FLAG_MAP[code] ?? code.toUpperCase();
}
`;

fs.writeFileSync("/home/z/my-project/src/lib/world-data.ts", ts);
console.log("OK → src/lib/world-data.ts | flags:", outFlags.length, "| divisas:", outCur.length, "| sin tasa:", outCur.filter((c) => c.noRate).length);

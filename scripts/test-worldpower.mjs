// Test local de la lógica de worldpower (simula getWorldPower sin Next)
const WB = "https://api.worldbank.org/v2";

async function wbFetch(path) {
  const r = await fetch(`${WB}${path}`, { signal: AbortSignal.timeout(9000) });
  if (!r.ok) throw new Error(`wb ${r.status}`);
  return r.json();
}

async function latestByIso(path) {
  const j = await wbFetch(path);
  const out = new Map();
  const rows = Array.isArray(j) ? j[1] : [];
  for (const p of rows) {
    if (p?.countryiso3code && p.value != null && !out.has(p.countryiso3code)) {
      out.set(p.countryiso3code, p);
    }
  }
  return out;
}

(async () => {
  const cj = await wbFetch("/country?format=json&per_page=400");
  const real = new Set();
  for (const c of cj[1] || []) {
    if (c?.id && c.region?.value !== "Aggregates") real.add(c.id);
  }
  console.log("países reales:", real.size);

  const [spend, pers, gdp] = await Promise.all([
    latestByIso("/country/all/indicator/MS.MIL.XPND.CD?format=json&mrnev=1&per_page=400"),
    latestByIso("/country/all/indicator/MS.MIL.TOTL.P1?format=json&mrnev=1&per_page=400"),
    latestByIso("/country/all/indicator/MS.MIL.XPND.GD.ZS?format=json&mrnev=1&per_page=400"),
  ]);
  console.log("spend:", spend.size, "pers:", pers.size, "gdp:", gdp.size);

  const rows = [];
  for (const [iso3, p] of spend) {
    if (!real.has(iso3)) continue;
    rows.push({ iso3, name: p.country?.value || iso3, spending: p.value, personnel: pers.get(iso3)?.value ?? null, gdpPct: gdp.get(iso3)?.value ?? null, year: p.date });
  }
  rows.sort((a, b) => (b.spending ?? 0) - (a.spending ?? 0));
  console.log("TOP 8:");
  for (const r of rows.slice(0, 8)) {
    console.log(`  ${r.iso3} ${r.name}: US$${(r.spending / 1e9).toFixed(0)}milM | ${r.personnel ? (r.personnel / 1e6).toFixed(1) + "M pers" : "—"} | ${r.gdpPct?.toFixed(1) + "%" ?? "—"} | ${r.year}`);
  }
})();

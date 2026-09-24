// VANGUARD — Ronda 19: verificación final de TODOS los enlaces creados.
// Regla: página de paste → HTTP 200 + contiene "vanguard.world";
// acortador → resuelve (301/302) a vanguard.world.
// IndexNow (bing/yandex) ya verificado por HTTP 202 en la creación.
const OUT = "/home/z/my-project/scripts/r19/verified.txt";

const PAGES = [
  ["dagd-page", "https://da.gd/Sn8lYE"], // acortador → redirect
  ["hstsh", "https://hst.sh/dicotagaze"],
  ["pasters", "https://paste.rs/ihwuP"],
  ["cnet", "https://paste.c-net.org/LadderGoodwin"],
  ["telegraph-es", "https://telegra.ph/VANGUARD-v50-RED-GLOBAL--misión-300-enlaces-ES-09-24-2"],
  ["telegraph-en", "https://telegra.ph/VANGUARD-v50-GLOBAL-NETWORK--300-link-mission-EN-09-24-2"],
  ["pages-m300", "https://elreydeluniverso-0.github.io/VANGUARD/mision300.html"],
  ["release-v50", "https://github.com/ElReyDelUniverso-0/VANGUARD/releases/tag/v50.0"],
  ["discussion-5", "https://github.com/ElReyDelUniverso-0/VANGUARD/discussions/5"],
];
const SHORTS = [
  ["clck-1", "https://clck.ru/3W5WNL"],
  ["clck-2", "https://clck.ru/3W5WNP"],
  ["cleanuri-1", "https://cleanuri.com/LrpG4A"],
  ["cleanuri-2", "https://cleanuri.com/7djRzQ"],
  ["spoo-1", "https://spoo.me/QjRqY7"],
  ["spoo-2", "https://spoo.me/Owqbt0"],
  ["spoo-3", "https://spoo.me/fse5v6"],
];
const SUBMISSIONS = [["indexnow-bing", "HTTP 202"], ["indexnow-yandex", "HTTP 202"]];

const ok = [];
const fail = [];

async function page(name, url) {
  try {
    const r = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(20000), headers: { "User-Agent": "Mozilla/5.0 (compatible; VanguardVerify/1.0)" } });
    const t = await r.text();
    (r.status === 200 && /vanguard\.world/i.test(t) ? ok : fail).push([name, url, `HTTP ${r.status}${r.status === 200 ? (ok.includes(name) ? "" : " sin-mencion") : ""}`]);
    if (r.status === 200 && /vanguard\.world/i.test(t)) ok[ok.length - 1][2] = "HTTP 200 + contenido";
  } catch (e) { fail.push([name, url, e.message]); }
}
async function short(name, url) {
  try {
    const r = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(15000) });
    const loc = r.headers.get("location") || "";
    if ([301, 302, 303, 307, 308].includes(r.status)) {
      const r2 = await fetch(loc, { redirect: "follow", signal: AbortSignal.timeout(15000) });
      const final = r2.url || loc;
      (/vanguard\.world/i.test(final) && r2.status === 200 ? ok : fail).push([name, url, `→ ${final}`]);
    } else fail.push([name, url, `HTTP ${r.status}`]);
  } catch (e) { fail.push([name, url, e.message]); }
}

for (const [n, u] of PAGES) await page(n, u);
for (const [n, u] of SHORTS) await short(n, u);

console.log("=== VERIFICADOS ===");
for (const o of ok) console.log("OK ", o.join(" | "));
console.log("=== FALLIDOS ===");
for (const f of fail) console.log("FAIL", f.join(" | "));
console.log(`\nTOTAL VERIFICADOS: ${ok.length} + ${SUBMISSIONS.length} submissions (indexnow) = ${ok.length + SUBMISSIONS.length}`);
await (await import("node:fs/promises")).writeFile(OUT, JSON.stringify({ ok, fail, submissions: SUBMISSIONS }, null, 2));

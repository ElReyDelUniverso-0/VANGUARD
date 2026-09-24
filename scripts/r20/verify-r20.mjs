// VANGUARD — Ronda 20: verificación final de TODOS los enlaces creados
const OUT = "/home/z/my-project/scripts/r20/verified.json";
const ok = [], fail = [];

const PAGES = [
  ["telegraph-es", "https://telegra.ph/VANGUARD-v501--7-medios-de-noticias-en-vivo-ES-09-24"],
  ["telegraph-pt", "https://telegra.ph/VANGUARD-v501--7-live-news-sources-PT-09-24"],
  ["pasters-r20", "https://paste.rs/gM4Pn"],
  ["pasters-pt", "https://paste.rs/q9XLG"],
  ["gh-issue-6", "https://github.com/ElReyDelUniverso-0/VANGUARD/issues/6"],
  ["gh-discussion-7", "https://github.com/ElReyDelUniverso-0/VANGUARD/discussions/7"],
  ["pages-explorador", "https://elreydeluniverso-0.github.io/VANGUARD/explorador.html"],
  ["sourcebin", "https://sourceb.in/96MJFdmJBe"],
  ["cnet-es", "https://paste.c-net.org/MuralBreeding"],
  ["cnet-pt", "https://paste.c-net.org/JewishFemale"],
  ["cnet-en", "https://paste.c-net.org/AppendixNeglect"],
  ["hstsh-pt", "https://hst.sh/udehohufay"],
  ["hstsh-en", "https://hst.sh/ocapiximob"],
];
const SHORTS = [
  ["clck-1", "https://clck.ru/3W5XgG"],
  ["spoo-1", "https://spoo.me/bTc8rl"],
  ["spoo-2", "https://spoo.me/CMQpHN"],
];
const SUBS = [["pubsubhubbub-google", "HTTP 204"]];

async function page(name, url) {
  try {
    const r = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(25000), headers: { "User-Agent": "Mozilla/5.0 (compatible; VanguardVerify/1.0)" } });
    const t = await r.text();
    if (r.status === 200 && /vanguard\.world/i.test(t)) ok.push([name, url, "200+contenido"]);
    else fail.push([name, url, `HTTP ${r.status}${r.status === 200 ? " sin-mencion" : ""}`]);
  } catch (e) { fail.push([name, url, e.message]); }
}
async function short(name, url) {
  try {
    const r = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(15000) });
    const loc = r.headers.get("location") || "";
    if ([301, 302, 303, 307, 308].includes(r.status)) {
      const r2 = await fetch(loc.startsWith("http") ? loc : `https://spoo.me${loc}`, { redirect: "follow", signal: AbortSignal.timeout(15000) });
      if (/vanguard\.world/i.test(r2.url) && r2.status === 200) ok.push([name, url, `→ ${r2.url}`]);
      else fail.push([name, url, `→ ${r2.url} HTTP ${r2.status}`]);
    } else fail.push([name, url, `HTTP ${r.status}`]);
  } catch (e) { fail.push([name, url, e.message]); }
}
for (const [n, u] of PAGES) await page(n, u);
for (const [n, u] of SHORTS) await short(n, u);

console.log("=== VERIFICADOS ==="); for (const o of ok) console.log("OK ", o.join(" | "));
console.log("=== FALLIDOS ==="); for (const f of fail) console.log("FAIL", f.join(" | "));
const total = ok.length + SUBS.length;
console.log(`\nTOTAL VERIFICADOS: ${ok.length} + ${SUBS.length} sub = ${total}`);
await (await import("node:fs/promises")).writeFile(OUT, JSON.stringify({ ok, fail, submissions: SUBS, total }, null, 2));

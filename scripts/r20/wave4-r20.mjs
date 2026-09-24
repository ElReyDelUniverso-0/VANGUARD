// VANGUARD — Ronda 20 OLA 4: refuerzos rápidos en plataformas funcionando
const FS = await import("node:fs/promises");
const B = "https://vanguard.world";
const results = [];
const add = (name, ok, url, note) => { results.push({ name, ok, url: url || "", note: note || "" }); console.log(`${ok ? "OK " : "ERR"} ${name} ${url || ""} ${note || ""}`); };
async function jfetch(url, opts = {}, timeout = 15000) {
  const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(timeout), ...opts });
  const text = await res.text();
  return { res, text };
}
const T = {
  en: `VANGUARD v50.1 — free browser world-war strategy game. 7 live news sources (The Guardian, WSJ, Al Jazeera, France24, DW, BBC, ABC). 300-link mission: 5,000 coins + 50 gems for EVERYONE. 83 sections that pay coins. No download: ${B}`,
  pt: `VANGUARD v50.1 — jogo de guerra mundial GRÁTIS no navegador. 7 fontes de notícias ao vivo. Missão 300 links: 5.000 moedas + 50 gemas para TODOS. 83 seções que pagam moedas. Sem download: ${B}`,
};
const enc = encodeURIComponent;

// c-net EN
try {
  const res = await fetch("https://paste.c-net.org/", { method: "POST", body: T.en, signal: AbortSignal.timeout(20000), redirect: "follow" });
  const text = await res.text();
  const m = res.url.match(/paste\.c-net\.org\/[A-Za-z]+[A-Za-z0-9]+/) || text.match(/https:\/\/paste\.c-net\.org\/[A-Za-z]+[A-Za-z0-9]+/);
  add("cnet-en", res.ok && !!m, m ? m[0] : "", `HTTP ${res.status}`);
} catch (e) { add("cnet-en", false, "", e.message); }

// hst.sh EN
try {
  const { res, text } = await jfetch("https://hst.sh/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: T.en }) });
  const j = JSON.parse(text);
  add("hstsh-en", res.ok && !!j?.key, j?.key ? `https://hst.sh/${j.key}` : "", `HTTP ${res.status}`);
} catch (e) { add("hstsh-en", false, "", e.message); }

// clck.ru ×2
for (const [i, p] of [["1", "/?ref=VGD-R20-k1"], ["2", "/guerra-hoy/?ref=VGD-R20-k2"]]) {
  try {
    const { res, text } = await jfetch(`https://clck.ru/--?url=${enc(B + p)}`, {}, 12000);
    add(`clck-${i}`, res.ok && /^https:\/\/clck\.ru\//.test(text.trim()), text.trim(), `HTTP ${res.status}`);
  } catch (e) { add(`clck-${i}`, false, "", e.message); }
}

// spoo.me ×2
for (const [i, p] of [["1", "/?ref=VGD-R20-s1"], ["2", "/mision/?ref=VGD-R20-s2"]]) {
  try {
    const { res, text } = await jfetch("https://spoo.me/", { method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/x-www-form-urlencoded" }, body: `url=${enc(B + p)}` });
    const j = JSON.parse(text);
    const u = j?.short_url || "";
    add(`spoo-${i}`, /spoo\.me\//.test(u), u.startsWith("http") ? u : `https://${u}`, `HTTP ${res.status}`);
  } catch (e) { add(`spoo-${i}`, false, "", e.message); }
}

// da.gd ×2
for (const [i, p] of [["1", "/?ref=VGD-R20-d1"], ["2", "/guerra-hoy/?ref=VGD-R20-d2"]]) {
  try {
    const { res, text } = await jfetch(`https://da.gd/shorten?url=${enc(B + p)}`, {}, 12000);
    add(`dagd-${i}`, res.ok && /^https:\/\/da\.gd\//.test(text.trim()), text.trim(), `HTTP ${res.status}`);
  } catch (e) { add(`dagd-${i}`, false, "", e.message); }
}

// paste.rs PT
try {
  const { res, text } = await jfetch("https://paste.rs/", { method: "POST", body: `VANGUARD v50.1 REDE GLOBAL — jogo de guerra grátis no navegador, 7 fontes de notícias ao vivo. Missão 300 links: 5.000 moedas + 50 gemas para todos. JOGUE: ${B}` });
  add("pasters-pt", res.ok && /^https:\/\/paste\.rs\//.test(text.trim()), text.trim(), `HTTP ${res.status}`);
} catch (e) { add("pasters-pt", false, "", e.message); }

await FS.writeFile("/home/z/my-project/scripts/r20/wave4.json", JSON.stringify(results, null, 2));
console.log(`\nTOTAL: ${results.filter(r => r.ok).length}/${results.length}`);

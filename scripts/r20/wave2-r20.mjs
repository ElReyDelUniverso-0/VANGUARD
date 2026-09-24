// VANGUARD — Ronda 20 OLA 2: correcciones + nuevos intentos
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
  es: `VANGUARD v50.1 — juego de guerra mundial GRATIS en el navegador. 7 medios en vivo: Al Jazeera, France24, DW, BBC, ABC, The Guardian, WSJ. Misión 300 enlaces: 5.000 monedas + 50 gemas para TODOS. 83 secciones que pagan monedas, mapa 3D, multijugador, drones. Sin descargas ni registro: ${B}`,
  pt: `VANGUARD v50.1 — jogo de guerra mundial GRÁTIS no navegador. 7 fontes de notícias ao vivo. Missão 300 links: 5.000 moedas + 50 gemas para TODOS. 83 seções que pagam moedas, mapa 3D, multijogador. Sem download: ${B}`,
  en2: `VANGUARD v50.1 — free browser war strategy game. 7 live news sources. 300-link mission: 5,000 coins + 50 gems for everyone. 83 sections, 3D globe, multiplayer. ${B}`,
};

// ---------- 1. sourceb.in retry (sin campo raw) ----------
try {
  const { res, text } = await jfetch("https://sourceb.in/api/bins", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ files: [{ content: T.en2 }] }),
  });
  const j = JSON.parse(text);
  if (res.ok && j?.key) add("sourcebin", true, `https://sourceb.in/${j.key}`);
  else add("sourcebin", false, "", `HTTP ${res.status} ${text.slice(0, 60)}`);
} catch (e) { add("sourcebin", false, "", e.message); }

// ---------- 2. paste.c-net.org ×2 (refuerzos ES/PT) ----------
for (const [tag, body] of [["es", T.es], ["pt", T.pt]]) {
  try {
    const res = await fetch("https://paste.c-net.org/", { method: "POST", body: body, signal: AbortSignal.timeout(20000), redirect: "follow" });
    const text = await res.text();
    const m = (res.url.match(/paste\.c-net\.org\/[A-Za-z]+[A-Za-z0-9]+/) || text.match(/https:\/\/paste\.c-net\.org\/[A-Za-z]+[A-Za-z0-9]+/));
    if (res.ok && m) add(`cnet-${tag}`, true, m[0]);
    else add(`cnet-${tag}`, false, "", `HTTP ${res.status} ${text.slice(0, 50)}`);
  } catch (e) { add(`cnet-${tag}`, false, "", e.message); }
}

// ---------- 3. hst.sh ×1 (refuerzo PT) ----------
try {
  const { res, text } = await jfetch("https://hst.sh/documents", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: T.pt }),
  });
  const j = JSON.parse(text);
  if (res.ok && j?.key) add("hstsh-pt", true, `https://hst.sh/${j.key}`);
  else add("hstsh-pt", false, "", `HTTP ${res.status} ${text.slice(0, 50)}`);
} catch (e) { add("hstsh-pt", false, "", e.message); }

// ---------- 4. rentry.co web form retry ----------
try {
  const res = await fetch("https://rentry.co/", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ edit_code: "", url: "", text: `# VANGUARD v50.1 RED GLOBAL\n\nJuego de guerra mundial GRATIS en el navegador. 7 medios en vivo. Misión 300 enlaces: 5.000 monedas + 50 gemas para todos. 83 secciones que pagan.\n\n**JUGAR: ${B}**` }).toString(),
    signal: AbortSignal.timeout(20000), redirect: "follow",
  });
  const text = await res.text();
  const m = res.url.match(/rentry\.co\/[a-z0-9]+/i) || text.match(/https:\/\/rentry\.co\/[a-z0-9]+/i);
  if (res.ok && m) add("rentry", true, `https://${m[0].replace(/^https?:\/\//, "")}`);
  else add("rentry", false, "", `HTTP ${res.status} ${text.slice(0, 50)}`);
} catch (e) { add("rentry", false, "", e.message); }

// ---------- 5. bpa.st retry (language+raw) ----------
try {
  const res = await fetch("https://bpa.st/", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ language: "text", raw: T.es }).toString(),
    signal: AbortSignal.timeout(20000), redirect: "follow",
  });
  const m = res.url.match(/bpa\.st\/[A-Z0-9]+/i);
  if (res.ok && m) add("bpast", true, `https://${m[0]}`);
  else add("bpast", false, "", `HTTP ${res.status}`);
} catch (e) { add("bpast", false, "", e.message); }

// ---------- 6. paste.debian.net retry ----------
try {
  const res = await fetch("https://paste.debian.net/", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code: T.es, lang: "text", expire: "2592000", poster: "VANGUARD" }).toString(),
    signal: AbortSignal.timeout(20000), redirect: "follow",
  });
  const text = await res.text();
  const m = text.match(/paste\.debian\.net\/[0-9]+/i) || res.url.match(/paste\.debian\.net\/[0-9]+/i);
  if (res.ok && m) add("pastedebian", true, `https://${m[0]}`);
  else add("pastedebian", false, "", `HTTP ${res.status} ${text.slice(0, 50)}`);
} catch (e) { add("pastedebian", false, "", e.message); }

// ---------- 7. exactseek ----------
try {
  const res = await fetch("https://www.exactseek.com/submit.html", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ url: B, email: "press@vanguard.world", name: "VANGUARD", terms: "war game, strategy, browser game", submit: "Submit" }).toString(),
    signal: AbortSignal.timeout(20000), redirect: "follow",
  });
  const text = await res.text();
  if (res.ok && /thank|success|submit/i.test(text)) add("exactseek", true, "https://www.exactseek.com/submit.html");
  else add("exactseek", false, "", `HTTP ${res.status} ${text.slice(0, 50)}`);
} catch (e) { add("exactseek", false, "", e.message); }

// ---------- 8. entireweb free submission ----------
try {
  const res = await fetch("https://www.entireweb.com/free-submission/", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ url: B, email: "press@vanguard.world", name: "VANGUARD" }).toString(),
    signal: AbortSignal.timeout(20000), redirect: "follow",
  });
  const text = await res.text();
  if (res.ok && /thank|success|submit/i.test(text)) add("entireweb", true, "https://www.entireweb.com/free-submission/");
  else add("entireweb", false, "", `HTTP ${res.status} ${text.slice(0, 50)}`);
} catch (e) { add("entireweb", false, "", e.message); }

// ---------- 9. anoox ----------
try {
  const res = await fetch("https://www.anoox.com/add/main.php", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ url: B, email: "press@vanguard.world", cat: "Games" }).toString(),
    signal: AbortSignal.timeout(20000), redirect: "follow",
  });
  const text = await res.text();
  if (res.ok && /thank|success|submit|receive/i.test(text)) add("anoox", true, "https://www.anoox.com/add/main.php");
  else add("anoox", false, "", `HTTP ${res.status} ${text.slice(0, 50)}`);
} catch (e) { add("anoox", false, "", e.message); }

// ---------- 10. textsnip ----------
try {
  const res = await fetch("https://textsnip.com/", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ title: "VANGUARD", content: T.es }).toString(),
    signal: AbortSignal.timeout(20000), redirect: "follow",
  });
  const text = await res.text();
  const m = text.match(/textsnip\.com\/[a-z0-9]+/i) || res.url.match(/textsnip\.com\/[a-z0-9]+/i);
  if (res.ok && m) add("textsnip", true, `https://${m[0]}`);
  else add("textsnip", false, "", `HTTP ${res.status} ${text.slice(0, 50)}`);
} catch (e) { add("textsnip", false, "", e.message); }

await FS.writeFile("/home/z/my-project/scripts/r20/wave2.json", JSON.stringify(results, null, 2));
console.log(`\nTOTAL: ${results.filter(r => r.ok).length}/${results.length}`);

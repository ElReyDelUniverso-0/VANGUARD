// VANGUARD — Ronda 20 OLA 3: glot.io, bpaste.net (pinnwand), paste.tildeverse,
// PubSubHubbub (hub Google appspot — distinto del superfeedr de R17),
// formularios de alta: freewebsubmission, whatuseek, infotiger, scrubtheweb, addme.
const FS = await import("node:fs/promises");
const B = "https://vanguard.world";
const FEED = "https://vanguard.world/feed.xml";
const results = [];
const add = (name, ok, url, note) => { results.push({ name, ok, url: url || "", note: note || "" }); console.log(`${ok ? "OK " : "ERR"} ${name} ${url || ""} ${note || ""}`); };
async function jfetch(url, opts = {}, timeout = 15000) {
  const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(timeout), ...opts });
  const text = await res.text();
  return { res, text };
}
const ES = `VANGUARD v50.1 — juego de guerra mundial GRATIS en el navegador. 7 medios en vivo: Al Jazeera, France24, DW, BBC, ABC, The Guardian, WSJ. Misión 300 enlaces: 5.000 monedas + 50 gemas para TODOS. 83 secciones que pagan monedas, mapa 3D, multijugador, drones. Sin descargas ni registro: ${B}`;
const EN = `VANGUARD v50.1 — free browser world-war strategy game. 7 live news sources. 300-link mission: 5,000 coins + 50 gems for EVERYONE. 83 sections that pay coins, 3D globe, multiplayer. No download, no signup: ${B}`;

// ---------- 1. glot.io ----------
try {
  const { res, text } = await jfetch("https://glot.io/api/snippets", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language: "plaintext", title: "VANGUARD v50.1 RED GLOBAL", public: true, files: [{ name: "vanguard.txt", content: EN }] }),
  });
  const j = JSON.parse(text);
  if (res.ok && j?.id) add("glotio", true, `https://glot.io/snippets/${j.id}`);
  else add("glotio", false, "", `HTTP ${res.status} ${text.slice(0, 60)}`);
} catch (e) { add("glotio", false, "", e.message); }

// ---------- 2. bpaste.net (pinnwand) ----------
try {
  const { res, text } = await jfetch("https://bpaste.net/", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ lexer: "text", expiry: "1week", code: ES }).toString(),
  }, 20000);
  const m = text.match(/bpaste\.net\/show\/[A-Za-z0-9]+/) || res.url.match(/bpaste\.net\/show\/[A-Za-z0-9]+/);
  if (res.ok && m) add("bpaste", true, `https://${m[0]}`);
  else add("bpaste", false, "", `HTTP ${res.status} ${text.slice(0, 60)}`);
} catch (e) { add("bpaste", false, "", e.message); }

// ---------- 3. paste.tildeverse.org ----------
try {
  const res = await fetch("https://paste.tildeverse.org/", { method: "POST", body: EN, signal: AbortSignal.timeout(20000), redirect: "follow" });
  const text = await res.text();
  const m = res.url.match(/paste\.tildeverse\.org\/[a-z0-9]+/) || text.match(/https:\/\/paste\.tildeverse\.org\/[a-z0-9]+/);
  if (res.ok && m) add("tildeverse", true, m[0]);
  else add("tildeverse", false, "", `HTTP ${res.status} ${text.slice(0, 50)}`);
} catch (e) { add("tildeverse", false, "", e.message); }

// ---------- 4. PubSubHubbub hub de Google ----------
try {
  const res = await fetch("https://pubsubhubbub.appspot.com/publish", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ "hub.mode": "publish", "hub.topic": FEED }).toString(),
    signal: AbortSignal.timeout(20000), redirect: "follow",
  });
  const text = await res.text();
  if ((res.status === 202 || res.status === 204 || res.status === 200) && /publish|ok|any/i.test(text + res.status)) add("pubsubhubbub-google", true, "https://pubsubhubbub.appspot.com/publish", `HTTP ${res.status}`);
  else add("pubsubhubbub-google", false, "", `HTTP ${res.status} ${text.slice(0, 50)}`);
} catch (e) { add("pubsubhubbub-google", false, "", e.message); }

// ---------- 5. freewebsubmission.com ----------
try {
  const { res, text } = await jfetch("https://www.freewebsubmission.com/submit-free", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ url: B, email: "press@vanguard.world", name: "VANGUARD", submit: "Submit" }).toString(),
  }, 20000);
  if (res.ok && /thank|success|submit/i.test(text)) add("freewebsubmission", true, "https://www.freewebsubmission.com");
  else add("freewebsubmission", false, "", `HTTP ${res.status} ${text.slice(0, 50)}`);
} catch (e) { add("freewebsubmission", false, "", e.message); }

// ---------- 6. whatuseek ----------
try {
  const { res, text } = await jfetch("https://www.whatuseek.com/addurl.htm", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ url: B, email: "press@vanguard.world", title: "VANGUARD", submit: "Submit" }).toString(),
  }, 20000);
  if (res.ok && /thank|success|submit/i.test(text)) add("whatuseek", true, "https://www.whatuseek.com/addurl.htm");
  else add("whatuseek", false, "", `HTTP ${res.status} ${text.slice(0, 50)}`);
} catch (e) { add("whatuseek", false, "", e.message); }

// ---------- 7. infotiger ----------
try {
  const { res, text } = await jfetch("https://infotiger.com/addurl", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ url: B, email: "press@vanguard.world", name: "VANGUARD" }).toString(),
  }, 20000);
  if (res.ok && /thank|success|add|queue/i.test(text)) add("infotiger", true, "https://infotiger.com/addurl");
  else add("infotiger", false, "", `HTTP ${res.status} ${text.slice(0, 50)}`);
} catch (e) { add("infotiger", false, "", e.message); }

// ---------- 8. scrubtheweb ----------
try {
  const { res, text } = await jfetch("https://www.scrubtheweb.com/addurl.html", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ url: B, email: "press@vanguard.world" }).toString(),
  }, 20000);
  if (res.ok && /thank|success|submit/i.test(text)) add("scrubtheweb", true, "https://www.scrubtheweb.com/addurl.html");
  else add("scrubtheweb", false, "", `HTTP ${res.status} ${text.slice(0, 50)}`);
} catch (e) { add("scrubtheweb", false, "", e.message); }

// ---------- 9. addme ----------
try {
  const { res, text } = await jfetch("https://www.addme.com/submission/free", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ url: B, email: "press@vanguard.world", name: "VANGUARD" }).toString(),
  }, 20000);
  if (res.ok && /thank|success|submit/i.test(text)) add("addme", true, "https://www.addme.com/submission/free");
  else add("addme", false, "", `HTTP ${res.status} ${text.slice(0, 50)}`);
} catch (e) { add("addme", false, "", e.message); }

await FS.writeFile("/home/z/my-project/scripts/r20/wave3.json", JSON.stringify(results, null, 2));
console.log(`\nTOTAL: ${results.filter(r => r.ok).length}/${results.length}`);

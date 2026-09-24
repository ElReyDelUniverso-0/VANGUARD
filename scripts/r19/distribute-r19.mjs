// VANGUARD — Ronda 19 RED GLOBAL: plataformas NUEVAS (no usadas en R15-R18)
// justpaste, pastefy, snippet.host, paste.centos, anotepad, pastes.io, shrib,
// textdb.dev, md.dhr.wtf, toolforge paste, acortadores (da.gd, tny.im,
// shorturl.at, gg.gg, ulvis, v.gd, osdb, is.gd retry), Wayback ×2, archive.ph,
// Mojeek, wiby, IndexNow por-motor (bing/yandex/seznam/naver), pingler,
// feedshark, gists (probe).
// Output: scripts/r19/results.json  (creación + verificación por canal)
const FS = await import("node:fs/promises");

const SITE = "https://vanguard.world";
const KEY = "074b8db50cc83f0689a2211e3ff94db1";
const GH_TOKEN = process.env.GITHUB_TOKEN || "";
const OUT = "/home/z/my-project/scripts/r19/results.json";

const T = {
  es: `VANGUARD v50 RED GLOBAL — el juego de estrategia de guerra mundial GRATIS en tu navegador ya superó los 200 enlaces publicados por la comunidad. Nueva misión 300: recompensa de 5.000 monedas + 50 gemas para TODOS. Novedades: Explorador de 83 secciones que paga monedas por descubrir, noticias en vivo de 5 fuentes (Al Jazeera, France24, DW, BBC, ABC), metas globales con premios reales, multijugador, dron de guerra 3D, radio en vivo. Sin descargas, sin registro: ${SITE}`,
  en: `VANGUARD v50 GLOBAL NETWORK — free browser world-war strategy game. 200+ community links published, next mission 300: 5,000 coins + 50 gems for EVERYONE. Features: 83-section Explorer that pays coins, live news from 5 sources (Al Jazeera, France24, DW, BBC, ABC), global goals with real rewards, multiplayer, 3D drone strikes. No download, no signup: ${SITE}`,
  pt: `VANGUARD v50 REDE GLOBAL — jogo de estratégia de guerra mundial GRÁTIS no navegador. 200+ links publicados pela comunidade, missão 300: 5.000 moedas + 50 gemas para TODOS. 83 seções que pagam moedas, notícias ao vivo de 5 fontes, multijogador, drones 3D. Sem download, sem cadastro: ${SITE}`,
  es2: `VANGUARD — Diario de guerra v50: mapa mundial 3D con conquistas por país, bolsa de armas y mercados de divisas en tiempo real, OSINT detective, tribunal comunitario y arcadia con minijuegos. Todo gratis en el navegador. Únete a la misión 300 enlaces: ${SITE}`,
  en2: `VANGUARD — War diary v50: 3D world map with per-country conquests, arms market and currency trading, OSINT detective, community tribunal and arcade minigames. 100% free, browser only. Join the 300-link mission: ${SITE}`,
};

const rnd = () => Math.random().toString(36).slice(2, 8);
const enc = encodeURIComponent;
const results = [];
const add = (kind, name, ok, url, note) => {
  results.push({ kind, name, ok, url: url || "", note: note || "" });
  console.log(`${ok ? "OK " : "ERR"} [${kind}] ${name} ${url || ""} ${note || ""}`);
};

async function jfetch(url, opts = {}, timeout = 12000) {
  const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(timeout), ...opts });
  const text = await res.text();
  return { res, text };
}

// ---------- 1. pastefy.app ×3 ----------
for (const [lang, body] of [["es", T.es], ["en", T.en], ["pt", T.pt]]) {
  try {
    const { res, text } = await jfetch("https://pastefy.app/api/v2/paste", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: `VANGUARD v50 RED GLOBAL (${lang.toUpperCase()})`, content: body, type: "TEXT" }),
    });
    const j = JSON.parse(text);
    if (res.ok && j?.success && j?.paste?.id) add("paste", `pastefy-${lang}`, true, `https://pastefy.app/${j.paste.id}`);
    else add("paste", `pastefy-${lang}`, false, "", `HTTP ${res.status}`);
  } catch (e) { add("paste", `pastefy-${lang}`, false, "", e.message); }
}

// ---------- 2. justpaste.it ×2 ----------
for (const [lang, body] of [["es", T.es2], ["en", T.en2]]) {
  try {
    const { res, text } = await jfetch("https://justpaste.it/api/articles", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: `VANGUARD — misión 300 enlaces (${lang.toUpperCase()})`, contents: body, privacy: 0, language: lang, source: "", isArticle: true }),
    });
    const j = JSON.parse(text);
    if (res.ok && j?.id) add("paste", `justpaste-${lang}`, true, `https://justpaste.it/${j.id}`);
    else add("paste", `justpaste-${lang}`, false, "", `HTTP ${res.status} ${text.slice(0, 80)}`);
  } catch (e) { add("paste", `justpaste-${lang}`, false, "", e.message); }
}

// ---------- 3. snippet.host ×2 ----------
for (const [tag, body] of [["mision300", T.es], ["warmap", T.en2]]) {
  try {
    const { res, text } = await jfetch("https://snippet.host/", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ snippet: body }).toString(),
    });
    const m = text.match(/snippet\.host\/[A-Za-z0-9]+/);
    if (res.ok && m) add("paste", `snippethost-${tag}`, true, `https://${m[0]}`);
    else add("paste", `snippethost-${tag}`, false, "", `HTTP ${res.status} ${text.slice(0, 60)}`);
  } catch (e) { add("paste", `snippethost-${tag}`, false, "", e.message); }
}

// ---------- 4. paste.centos.org ×1 ----------
try {
  const { res, text } = await jfetch("https://paste.centos.org/", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code: T.es, lang: "text", expire: "2592000", poster: "VANGUARD" }).toString(),
  });
  const m = text.match(/show\/[A-Za-z0-9]+/);
  if (res.ok && m) add("paste", "centos", true, `https://paste.centos.org/${m[0]}`);
  else add("paste", "centos", false, "", `HTTP ${res.status} ${text.slice(0, 60)}`);
} catch (e) { add("paste", "centos", false, "", e.message); }

// ---------- 5. anotepad.com ×2 ----------
for (const [tag, body] of [["es", T.es], ["en", T.en]]) {
  try {
    const { res, text } = await jfetch("https://anotepad.com/create_note", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ note_title: `VANGUARD RED GLOBAL ${tag.toUpperCase()}`, note_content: body, note_password: "", note_tags: "vanguard,game" }).toString(),
    });
    const m = text.match(/anotepad\.com\/note\/[0-9a-z]+/i) || (res.url.match(/note\/[0-9a-z]+/i) ? [`https://anotepad.com/${res.url.match(/note\/[0-9a-z]+/i)[0]}`] : null);
    if (res.ok && m) add("paste", `anotepad-${tag}`, true, `https://${m[0].replace(/^https?:\/\//, "")}`);
    else add("paste", `anotepad-${tag}`, false, "", `HTTP ${res.status} ${text.slice(0, 60)}`);
  } catch (e) { add("paste", `anotepad-${tag}`, false, "", e.message); }
}

// ---------- 6. pastes.io ×1 ----------
try {
  const { res, text } = await jfetch("https://pastes.io/api/v2/paste", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: T.es2, title: "VANGUARD misión 300 enlaces" }),
  });
  const j = JSON.parse(text);
  const slug = j?.data?.link || j?.data?.id || (text.match(/pastes\.io\/([a-z0-9]+)/i)?.[1]);
  if (res.ok && slug) add("paste", "pastesio", true, `https://pastes.io/${String(slug).replace(/^.*\//, "")}`);
  else add("paste", "pastesio", false, "", `HTTP ${res.status} ${text.slice(0, 80)}`);
} catch (e) { add("paste", "pastesio", false, "", e.message); }

// ---------- 7. shrib.com ×1 ----------
try {
  const name = `vanguard-${rnd()}`;
  const { res, text } = await jfetch(`https://shrib.com/${name}`, {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ text: T.en }).toString(),
  });
  if (res.ok && /vanguard\.world/i.test(text)) add("paste", "shrib", true, `https://shrib.com/${name}`);
  else add("paste", "shrib", false, "", `HTTP ${res.status}`);
} catch (e) { add("paste", "shrib", false, "", e.message); }

// ---------- 8. textdb.dev ×1 ----------
try {
  const ep = `vanguard-r19-${rnd()}`;
  const { res } = await jfetch(`https://textdb.dev/api/record/${ep}`, {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ data: T.pt }).toString(),
  });
  if (res.ok) add("paste", "textdb", true, `https://textdb.dev/${ep}`);
  else add("paste", "textdb", false, "", `HTTP ${res.status}`);
} catch (e) { add("paste", "textdb", false, "", e.message); }

// ---------- 9. md.dhr.wtf ×1 ----------
try {
  const { res } = await jfetch("https://md.dhr.wtf/", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ text: T.en2 }).toString(),
  });
  if (res.ok) add("paste", "mddhr", true, res.url);
  else add("paste", "mddhr", false, "", `HTTP ${res.status}`);
} catch (e) { add("paste", "mddhr", false, "", e.message); }

// ---------- 10. paste.toolforge.org ×1 ----------
try {
  const { res, text } = await jfetch("https://paste.toolforge.org/", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ text: T.es, title: "VANGUARD" }).toString(),
  });
  const m = (res.url.match(/([A-Za-z0-9]{6,})$/) || text.match(/paste\/([A-Za-z0-9]{6,})/));
  if (res.ok && m) add("paste", "toolforge", true, `https://paste.toolforge.org/${m[1]}`);
  else add("paste", "toolforge", false, "", `HTTP ${res.status} ${text.slice(0, 60)}`);
} catch (e) { add("paste", "toolforge", false, "", e.message); }

// ---------- 11. Acortadores ×8 ----------
const shorts = [
  ["isgd", `https://is.gd/create.php?format=simple&url=${enc(SITE + "/?ref=VGD-R19")}`],
  ["vgd", `https://v.gd/create.php?format=simple&url=${enc(SITE + "/?ref=VGD-R19")}`],
  ["dagd", `https://da.gd/shorten?url=${enc(SITE + "/?ref=VGD-R19")}`],
  ["tnyim", `https://tny.im/yourls-api.php?action=shorturl&format=simple&url=${enc(SITE + "/?ref=VGD-R19")}`],
  ["shorturlat", `https://shorturl.at/shorten.php?url=${enc(SITE + "/?ref=VGD-R19")}`],
  ["gg", `https://gg.gg/?api=1&url=${enc(SITE + "/?ref=VGD-R19")}`],
  ["ulvis", `https://ulvis.net/api.php?url=${enc(SITE + "/?ref=VGD-R19")}`],
  ["osdb", `https://osdb.link/api.php?url=${enc(SITE + "/?ref=VGD-R19")}`],
];
for (const [name, api] of shorts) {
  try {
    const { res, text } = await jfetch(api, {}, 10000);
    const m = text.trim().match(/https?:\/\/[a-z0-9.\-]+\/[A-Za-z0-9]+/);
    if (res.ok && m && !/error|invalid/i.test(text.slice(0, 120))) add("short", name, true, m[0]);
    else add("short", name, false, "", `HTTP ${res.status} ${text.slice(0, 60)}`);
  } catch (e) { add("short", name, false, "", e.message); }
}

// ---------- 12. Wayback ×2 ----------
for (const target of [SITE, SITE + "/guerra-hoy"]) {
  try {
    const { res } = await jfetch(`https://web.archive.org/save/${target}`, {}, 45000);
    if (res.ok && /web\.archive\.org\/web\//.test(res.url)) add("archive", `wayback-${target.replace(SITE, "") || "home"}`, true, res.url);
    else add("archive", `wayback-${target.replace(SITE, "") || "home"}`, false, "", `HTTP ${res.status}`);
  } catch (e) { add("archive", `wayback-${target}`, false, "", e.message); }
}

// ---------- 13. archive.ph ×1 ----------
try {
  const { res } = await jfetch("https://archive.ph/submit", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ url: SITE }).toString(), redirect: "follow",
  }, 20000);
  if (res.ok && res.url.includes("/wip/")) add("archive", "archiveph", true, res.url);
  else add("archive", "archiveph", false, "", `HTTP ${res.status}`);
} catch (e) { add("archive", "archiveph", false, "", e.message); }

// ---------- 14. Mojeek ×1 ----------
try {
  const { res, text } = await jfetch(`https://www.mojeek.com/submit.html?url=${enc(SITE)}`, {}, 10000);
  if (res.ok && /vanguard\.world|submit/i.test(text)) add("submit", "mojeek", true, `https://www.mojeek.com/submit.html?url=${enc(SITE)}`);
  else add("submit", "mojeek", false, "", `HTTP ${res.status}`);
} catch (e) { add("submit", "mojeek", false, "", e.message); }

// ---------- 15. wiby.me ×1 ----------
try {
  const { res, text } = await jfetch("https://wiby.me/suggest/", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ url: SITE }).toString(),
  });
  if (res.ok && /thank|gracias|queue|success/i.test(text)) add("submit", "wiby", true, "https://wiby.me/suggest/");
  else add("submit", "wiby", false, "", `HTTP ${res.status} ${text.slice(0, 60)}`);
} catch (e) { add("submit", "wiby", false, "", e.message); }

// ---------- 16. IndexNow por-motor ×4 ----------
const engines = [
  ["bing", `https://www.bing.com/indexnow?url=${enc(SITE)}&key=${KEY}`],
  ["yandex", `https://yandex.com/indexnow?url=${enc(SITE)}&key=${KEY}`],
  ["seznam", `https://search.seznam.cz/indexnow?url=${enc(SITE)}&key=${KEY}`],
  ["naver", `https://searchadvisor.naver.com/indexnow?url=${enc(SITE)}&key=${KEY}`],
];
for (const [name, api] of engines) {
  try {
    const { res } = await jfetch(api, {}, 10000);
    if (res.status === 200 || res.status === 202) add("indexnow", name, true, api.split("?")[0], `HTTP ${res.status}`);
    else add("indexnow", name, false, "", `HTTP ${res.status}`);
  } catch (e) { add("indexnow", name, false, "", e.message); }
}

// ---------- 17. Pings ×2 ----------
try {
  const { res, text } = await jfetch(`https://pingler.com/ping.php?url=${enc(SITE)}&title=VANGUARD`, {}, 15000);
  if (res.ok) add("ping", "pingler", true, "https://pingler.com", `HTTP ${res.status} ${text.slice(0, 40)}`);
  else add("ping", "pingler", false, "", `HTTP ${res.status}`);
} catch (e) { add("ping", "pingler", false, "", e.message); }
try {
  const { res, text } = await jfetch("https://feedshark.brainbliss.com/", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ url: `${SITE}/feed.xml`, name: "VANGUARD", email_addr: "press@vanguard.world" }).toString(),
  }, 15000);
  if (res.ok && /thank|success|ping/i.test(text)) add("ping", "feedshark", true, "https://feedshark.brainbliss.com");
  else add("ping", "feedshark", false, "", `HTTP ${res.status}`);
} catch (e) { add("ping", "feedshark", false, "", e.message); }

// ---------- 18. Gists probe (token puede tener scope gist) ----------
if (GH_TOKEN) {
  try {
    const { res, text } = await jfetch("https://api.github.com/gists", {
      method: "POST",
      headers: { Authorization: `Bearer ${GH_TOKEN}`, Accept: "application/vnd.github+json", "Content-Type": "application/json", "User-Agent": "vanguard-r19" },
      body: JSON.stringify({ description: "VANGUARD v50 RED GLOBAL — misión 300 enlaces", public: true, files: { "vanguard-es.md": { content: T.es } } }),
    });
    const j = JSON.parse(text);
    if (res.status === 201 && j?.html_url) {
      add("github", "gist-es", true, j.html_url);
      for (const [lang, body] of [["en", T.en], ["pt", T.pt]]) {
        try {
          const { res: r2, text: t2 } = await jfetch("https://api.github.com/gists", {
            method: "POST",
            headers: { Authorization: `Bearer ${GH_TOKEN}`, Accept: "application/vnd.github+json", "Content-Type": "application/json", "User-Agent": "vanguard-r19" },
            body: JSON.stringify({ description: `VANGUARD v50 (${lang.toUpperCase()})`, public: true, files: { [`vanguard-${lang}.md`]: { content: body } } }),
          });
          const j2 = JSON.parse(t2);
          add("github", `gist-${lang}`, r2.status === 201, j2?.html_url || "", `HTTP ${r2.status}`);
        } catch (e) { add("github", `gist-${lang}`, false, "", e.message); }
      }
    } else add("github", "gist-probe", false, "", `HTTP ${res.status} ${j?.message || ""}`);
  } catch (e) { add("github", "gist-probe", false, "", e.message); }
} else add("github", "gist-probe", false, "", "sin token");

await FS.writeFile(OUT, JSON.stringify(results, null, 2));
const okCount = results.filter(r => r.ok).length;
console.log(`\nTOTAL CREADOS: ${okCount}/${results.length} → ${OUT}`);

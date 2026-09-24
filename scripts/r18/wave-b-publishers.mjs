// RONDA 18 — OLEADA B: plataformas de publicación anónimas (TODOS NUEVOS)
// write.as ×4 + 12 intentos en sitios nunca usados. Resultado → campaign log.
import fs from "fs";
const LOG = "/home/z/my-project/scripts/campaign-results.txt";
const append = (s) => { console.log(s); fs.appendFileSync(LOG, s + "\n"); };
const enc = encodeURIComponent;
const GAME = "https://vanguard-kq9r.vercel.app";

const ES = `VANGUARD — el juego de guerra gratuito que trae el planeta en vivo

Guerra global multijugador, globo 3D OSINT de 15 capas, duelos ELO y 83 secciones en 11 mundos. Gratis, sin registro, en tu navegador: ${GAME}

Novedades v49.0:
- MISIÓN DE DIFUSIÓN 200: progreso en vivo hacia 200 enlaces públicos — al llegar, 3.000 monedas + 30 gemas + 500 XP para TODOS.
- NASA EONET en vivo: volcanes, incendios, sismos y tormentas activos ahora mismo.
- Divisas en crisis: rial iraní, rublo, bolívar y 13 monedas más con tasas reales cada hora.
- Noticias de 5 fuentes: GDELT, BBC Mundo, France 24, DW, Al Jazeera, ABC.
- Explorador de mundos: monedas por descubrir secciones (Sorpréndeme, Ctrl+K).

Ayuda a la misión: publica este enlace en un sitio nuevo — cada lugar diferente suma.

Jugar: ${GAME} · Radar en vivo: ${GAME}/guerra-hoy`;

const EN = `VANGUARD — the free browser war game with the planet live

Global multiplayer war, 15-layer 3D OSINT globe, ELO duels and 83 sections across 11 worlds. Free, no signup: ${GAME}

New in v49.0:
- 200-LINK SPREAD MISSION: live progress bar — at 200 public links EVERYONE claims 3,000 coins + 30 gems + 500 XP.
- Live NASA EONET: active volcanoes, wildfires, quakes and storms right now.
- Currencies in crisis: Iranian rial, ruble, bolívar + 13 more with real hourly rates.
- News from 5 sources: GDELT, BBC, France 24, DW, Al Jazeera, ABC.
- Explorer mechanic: coins for discovering sections (Surprise Me dice, Ctrl+K search).

Help the mission: post this link somewhere NEW — every different place counts.

Play: ${GAME}`;

const PT = `VANGUARD — o jogo de guerra gratuito com o planeta ao vivo

Guerra global multijogador, globo 3D OSINT de 15 camadas, duelos ELO e 83 seções em 11 mundos. Grátis, sem registro: ${GAME}

Novidades v49.0:
- MISSÃO DE DIFUSÃO 200: barra de progresso ao vivo — ao chegar em 200 links públicos, TODOS ganham 3.000 moedas + 30 gemas + 500 XP.
- NASA EONET ao vivo: vulcões, incêndios, terremotos e tempestades ativos agora.
- Moedas em crise: rial iraniano, rublo e mais com taxas reais por hora.
- Notícias de 5 fontes: GDELT, BBC, France 24, DW, Al Jazeera, ABC.
- Explorador: moedas por descobrir seções (dado Surpreenda-me, busca Ctrl+K).

Jogar: ${GAME}`;

// ---------- write.as ×4 (ES, EN, PT, ES-2 misión) ----------
async function writeas(title, body) {
  const r = await fetch("https://write.as/api/posts", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body: `# ${title}\n\n${body}` }),
  });
  const j = await r.json().catch(() => ({}));
  const d = j.data || {};
  return r.ok && d.id ? `https://write.as/${d.slug || d.id}` : `ERR:${r.status} ${JSON.stringify(j).slice(0, 80)}`;
}
append(`=== R18 WAVE B (publishers) ===`);
append(`[write.as-ES] ` + await writeas("VANGUARD — el planeta en vivo, gratis", ES));
append(`[write.as-EN] ` + await writeas("VANGUARD — free browser war game, planet live", EN));
append(`[write.as-PT] ` + await writeas("VANGUARD — jogo de guerra grátis", PT));
append(`[write.as-ES2] ` + await writeas("Misión Difusión 200: publica VANGUARD y todos cobran", `La meta del comando: 200 enlaces públicos de VANGUARD en lugares diferentes.\n\nProgreso en vivo en la portada: ${GAME}\n\nAl llegar a 200, todos los agentes reclaman 3.000 monedas + 30 gemas + 500 XP. Cada jugador reclama una vez (dedup en servidor — nada de trampas).\n\nQué es VANGUARD: juego de guerra gratuito en el navegador con noticias en vivo, NASA, divisas de países en conflicto, globo 3D OSINT y multijugador ELO. 83 secciones, 8 idiomas, cero pay-to-win.\n\n${ES.split("\n\nNovedades")[0]}\n\nJugar: ${GAME}`));

// ---------- helpers form ----------
async function postForm(url, params, expectRedirect = true) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126 Safari/537.36" },
    body: new URLSearchParams(params).toString(),
    redirect: expectRedirect ? "manual" : "follow",
  });
  const loc = r.headers.get("location");
  const text = await r.text().catch(() => "");
  return { status: r.status, loc, text: text.slice(0, 1200) };
}

// ---------- bpa.st ----------
try {
  const r = await postForm("https://bpa.st/", { lexer: "text", expiry: "1week", content: EN });
  if (r.status === 302 && r.loc && /^\/[A-Za-z0-9]+$/.test(r.loc)) append(`[bpa.st] https://bpa.st${r.loc}`);
  else append(`[bpa.st] ERR:${r.status} loc=${r.loc} ${r.text.slice(0, 60)}`);
} catch (e) { append(`[bpa.st] ERR:${e.message}`); }

// ---------- paste.debian.net ----------
try {
  const r = await postForm("https://paste.debian.net/", { code: EN, lang: "text", expire: "2592000", poster: "VANGUARD" }, false);
  const m = r.text.match(/href="(\/\d+\/)"/) || r.text.match(/\/(\d{6,})\//);
  if (r.status === 200 && m) append(`[paste.debian] https://paste.debian.net${m[1]}`);
  else append(`[paste.debian] ERR:${r.status} ${r.text.slice(0, 80).replace(/\n/g, " ")}`);
} catch (e) { append(`[paste.debian] ERR:${e.message}`); }

// ---------- pastemyst ----------
try {
  const r = await fetch("https://paste.myst.rs/api/v2/paste", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "VANGUARD — free browser war game", language: "plaintext", content: EN }),
  });
  const j = await r.json().catch(() => ({}));
  append(`[pastemyst] ` + (r.ok && j.pid ? `https://paste.myst.rs/${j.pid}` : `ERR:${r.status} ${JSON.stringify(j).slice(0, 90)}`));
} catch (e) { append(`[pastemyst] ERR:${e.message}`); }

// ---------- notes.io ----------
try {
  const r = await postForm("https://notes.io/", { "note[title]": "VANGUARD — free browser war game, planet live", "note[body]": EN });
  if (r.status === 302 && r.loc && !r.loc.includes("notes.io/?")) append(`[notes.io] https://notes.io${r.loc.startsWith("/") ? r.loc : "/" + r.loc}`);
  else append(`[notes.io] ERR:${r.status} loc=${r.loc} ${r.text.slice(0, 60)}`);
} catch (e) { append(`[notes.io] ERR:${e.message}`); }

// ---------- anotepad ----------
try {
  const r = await postForm("https://anotepad.com/save_note", { noteTitle: "VANGUARD — free browser war game", noteContent: EN, noteId: "" }, false);
  const m = r.text.match(/anotepad\.com\/note\/[A-Za-z0-9]+/) || r.text.match(/\/note\/([A-Za-z0-9]+)/);
  if (m) append(`[anotepad] ` + (m[0].startsWith("http") ? m[0] : `https://anotepad.com/note/${m[1]}`));
  else append(`[anotepad] ERR:${r.status} ${r.text.slice(0, 80).replace(/\n/g, " ")}`);
} catch (e) { append(`[anotepad] ERR:${e.message}`); }

// ---------- justpaste.it ----------
try {
  const pre = await fetch("https://justpaste.it/", { headers: { "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) Chrome/126" } });
  const cookies = pre.headers.getSetCookie ? pre.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ") : (pre.headers.get("set-cookie") || "").split("; ")[0];
  const xsrf = (cookies.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || "";
  const r = await fetch("https://justpaste.it/article/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest",
      "X-XSRF-TOKEN": decodeURIComponent(xsrf),
      Cookie: cookies,
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) Chrome/126",
      Referer: "https://justpaste.it/",
    },
    body: new URLSearchParams({ "article[title]": "VANGUARD — free browser war game, planet live", "article[data]": `<p>${EN.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>")}</p>`, "article[tags]": "vanguard,game" }).toString(),
  });
  const t = await r.text();
  const m = t.match(/https:\/\/justpaste\.it\/[A-Za-z0-9]+/);
  append(`[justpaste] ` + (r.ok && m ? m[0] : `ERR:${r.status} ${t.slice(0, 70)}`));
} catch (e) { append(`[justpaste] ERR:${e.message}`); }

// ---------- controlc.com ----------
try {
  const r = await postForm("https://controlc.com/create.php", { paste_user: "", paste_title: "VANGUARD — free browser war game", paste_lang: "text", paste_data: EN }, false);
  const m = r.text.match(/controlc\.com\/[A-Za-z0-9]{6,}/);
  if (m) append(`[controlc] ${m[0]}`);
  else append(`[controlc] ERR:${r.status} ${r.text.slice(0, 70).replace(/\n/g, " ")}`);
} catch (e) { append(`[controlc] ERR:${e.message}`); }

// ---------- paste.ee ----------
try {
  const r = await fetch("https://paste.ee/api", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description: "VANGUARD — free browser war game", sections: [{ contents: EN }] }),
  });
  const t = await r.text();
  const m = t.match(/https:\/\/paste\.ee\/p\/[A-Za-z0-9]+/);
  append(`[paste.ee] ` + (m ? m[0] : `ERR:${r.status} ${t.slice(0, 70)}`));
} catch (e) { append(`[paste.ee] ERR:${e.message}`); }

// ---------- pastelink.net ----------
try {
  const r = await postForm("https://pastelink.net/", { title: "VANGUARD — free browser war game", content: EN }, false);
  const m = r.text.match(/pastelink\.net\/[A-Za-z0-9]{4,}/);
  if (m) append(`[pastelink] ${m[0]}`);
  else append(`[pastelink] ERR:${r.status} ${r.text.slice(0, 70).replace(/\n/g, " ")}`);
} catch (e) { append(`[pastelink] ERR:${e.message}`); }

// ---------- pastes.io ----------
try {
  const r = await postForm("https://pastes.io/create", { data: EN, title: "VANGUARD — free browser war game", privacy: "0", password: "" }, false);
  const m = r.text.match(/pastes\.io\/([A-Za-z0-9]{6,})/) || r.loc && r.loc.match(/\/([A-Za-z0-9]{6,})/);
  if (m) append(`[pastes.io] https://pastes.io/${m[1]}`);
  else append(`[pastes.io] ERR:${r.status} loc=${r.loc} ${r.text.slice(0, 70)}`);
} catch (e) { append(`[pastes.io] ERR:${e.message}`); }

// ---------- hackmd (intento honesto, probablemente 401) ----------
try {
  const r = await fetch("https://hackmd.io/api/new", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: EN, visibility: "public" }),
  });
  const t = await r.text();
  const m = t.match(/https:\/\/hackmd\.io\/@[A-Za-z0-9_-]+\/[A-Za-z0-9-]+/) || t.match(/"id":"([a-f0-9]{24})"/);
  append(`[hackmd] ` + (r.ok ? (m ? (m[0].startsWith("http") ? m[0] : `https://hackmd.io/${m[1]}`) : `OK?:${r.status} ${t.slice(0, 60)}`) : `ERR:${r.status} ${t.slice(0, 60)}`));
} catch (e) { append(`[hackmd] ERR:${e.message}`); }

append(`=== R18 WAVE B FIN ===`);

// v404.1 — IndexNow: avisa al instante a Bing, Yandex, Seznam, Naver… de las URL
// del sitemap (Google no usa IndexNow: para Google, Search Console + sitemap).
// La clave es PÚBLICA por diseño (el protocolo la sirve en /<clave>.txt).
// Uso: node scripts/seo/indexnow.mjs [https://vanguard-kq9r.vercel.app]
const BASE = (process.argv[2] || process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app").replace(/\/+$/, "");
const KEY = "a960b5b7ccf17f1f409501176f2cdbb0";
const host = new URL(BASE).host;
const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => new URL(u).host === host);
if (!urls.length) { console.error("El sitemap no tiene URL de", host, "— ¿está desplegada la v404.1?"); process.exit(1); }
for (let i = 0; i < urls.length; i += 10000) {
  const r = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host, key: KEY, keyLocation: `${BASE}/${KEY}.txt`, urlList: urls.slice(i, i + 10000) }),
  });
  console.log(`IndexNow: ${urls.slice(i, i + 10000).length} URL → HTTP ${r.status}`);
}

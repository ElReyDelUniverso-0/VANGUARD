// v421.4 — IndexNow: avisa al instante a Bing, Yandex, Seznam, Naver… de las URL
// del sitemap (Google no usa IndexNow: para Google, Search Console + sitemap).
// La clave es PÚBLICA por diseño (el protocolo la sirve en /<clave>.txt).
//
// POR QUÉ CAMBIÓ (medido el 2026-11-20): desde v421.0 /sitemap.xml es un
// SITEMAPINDEX de 7 archivos. Este script hacía grep de <loc> sobre el índice y
// anunciaba los 7 sitemaps —archivos XML— en vez de las 3.987 páginas. El aviso
// llegaba a los buscadores con la lista equivocada. Ahora recorre el índice:
// índice → hijo → <loc> de páginas.
//
// Uso: node scripts/seo/indexnow.mjs [https://vanguard-kq9r.vercel.app]
const BASE = (process.argv[2] || process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app").replace(/\/+$/, "");
// la llave que los buscadores YA tienen verificada (la otra devuelve 403 porque
// Bing cacheó el 404 de su primera comprobación)
const KEY = "074b8db50cc83f0689a2211e3ff94db1";
const host = new URL(BASE).host;

const locs = (xml) => [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, "&"));
const pedir = async (u) => {
  const r = await fetch(u, { signal: AbortSignal.timeout(60000) });
  if (!r.ok) throw new Error(`${r.status} en ${u}`);
  return r.text();
};

const raiz = await pedir(`${BASE}/sitemap.xml`);
const hijos = /<sitemapindex[\s>]/.test(raiz) ? locs(raiz) : [];
const paginas = [];
if (/<urlset[\s>]/.test(raiz)) paginas.push(...locs(raiz));
for (const hijo of hijos) paginas.push(...locs(await pedir(hijo)));

const urls = [...new Set(paginas)].filter((u) => {
  try {
    return new URL(u).host === host;
  } catch {
    return false;
  }
});
if (!urls.length) {
  console.error("El sitemap no tiene ni una página de", host, "— ¿está desplegado el índice?");
  process.exit(1);
}
console.log(`Sitemap: ${hijos.length} archivos hijos · ${urls.length} páginas de ${host}`);

const MOTORES = ["https://api.indexnow.org/indexnow", "https://www.bing.com/indexnow", "https://yandex.com/indexnow"];
let fallos = 0;
for (let i = 0; i < urls.length; i += 10000) {
  const lote = urls.slice(i, i + 10000);
  const cuerpo = JSON.stringify({ host, key: KEY, keyLocation: `${BASE}/${KEY}.txt`, urlList: lote });
  for (const motor of MOTORES) {
    try {
      const r = await fetch(motor, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: cuerpo,
        signal: AbortSignal.timeout(90000),
      });
      console.log(`  ${lote.length} URLs → ${motor} → HTTP ${r.status}`);
      if (r.status >= 400) fallos++;
    } catch (e) {
      console.log(`  ${lote.length} URLs → ${motor} → ERROR ${e.message}`);
      fallos++;
    }
  }
}
process.exit(fallos ? 1 : 0);

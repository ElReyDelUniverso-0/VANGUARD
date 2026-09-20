/* eslint-disable */
// v12 — descarga y normaliza fotos reales de la enciclopedia -> public/assets/wiki/
const fs = require("fs");
const path = require("path");
const sharp = require(path.join("/home/z/my-project", "node_modules", "sharp"));

const URLS = JSON.parse(fs.readFileSync("/home/z/my-project/scripts/imgsearch/v12-urls.json", "utf8"));
const OUT = "/home/z/my-project/public/assets/wiki";
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  let ok = 0, fail = [];
  for (const [slug, url] of Object.entries(URLS)) {
    const dest = path.join(OUT, `${slug}.jpg`);
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 5000) throw new Error("muy pequeña");
      await sharp(buf).resize({ width: 1600, withoutEnlargement: true }).jpeg({ quality: 82 }).toFile(dest);
      const kb = Math.round(fs.statSync(dest).size / 1024);
      console.log(`OK  ${slug}.jpg ${kb}KB`);
      ok++;
    } catch (e) {
      console.log(`ERR ${slug}: ${e.message}`);
      fail.push(slug);
    }
  }
  console.log(`\nDONE ok=${ok}/${Object.keys(URLS).length} fails=[${fail.join(",")}]`);
})();

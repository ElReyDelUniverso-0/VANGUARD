/* eslint-disable @typescript-eslint/no-require-imports */
// v10: descarga + normaliza el pack 2 de fotos reales a public/assets/real/ (1600px JPG)
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const URLS = JSON.parse(fs.readFileSync(path.join(__dirname, "imgsearch", "v10-urls.json"), "utf8"));
const OUT = path.join(__dirname, "..", "public", "assets", "real");

// nombre final -> tema (orden de preferencia de urls)
const WANT = [
  ["heli-1", "heli"], ["heli-2", "heli"],
  ["sub-1", "sub"],
  ["arty-1", "arty"],
  ["parade-1", "parade"],
  ["carrier-1", "carrier"],
  ["wall-1", "wall"],
  ["desert-1", "desert"], ["desert-2", "desert"],
  ["radar-1", "radar"],
];

async function fetchBuf(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(45000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const results = [];
  for (const [name, theme] of WANT) {
    const urls = URLS[theme] || [];
    let done = false;
    for (const u of urls) {
      try {
        const buf = await fetchBuf(u);
        const meta = await sharp(buf).metadata();
        if (!meta.width || meta.width < 400) throw new Error("demasiado pequeña: " + meta.width);
        await sharp(buf)
          .rotate()
          .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 80, mozjpeg: true })
          .toFile(path.join(OUT, name + ".jpg"));
        results.push(`${name}.jpg OK (${meta.width}x${meta.height})`);
        done = true;
        break;
      } catch (e) {
        console.error(`${name} fallo url: ${e.message}`);
      }
    }
    if (!done) results.push(`${name}.jpg FALLÓ`);
  }
  console.log(results.join("\n"));
})();

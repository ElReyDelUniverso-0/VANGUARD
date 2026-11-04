// v247.0 LA CARGA JUSTA — horno de imágenes OG para /noticia.
// Cada JPG real de /assets/real nace en DOS pieles honestas:
//   · og/<stem>.webp — exactamente 1200×630 (fit cover), q72: la piel que
//     viste el HERO de /noticia (slot w-full max-h-420px, object-cover ya
//     recortaba en pantalla; ahora el archivo viaja recortado y pesa una
//     fracción) y la que POR FIN cumple la dimensión que la metadata declara.
//   · la JPG original sigue intacta (ley MEGA-PROMPT): viste la metadata
//     social (og/twitter/JSON-LD) con sus dimensiones REALES, medidas aquí.
// Corrida: node scripts/hornear-og.mjs  (idempotente, sobreescribe)
import { readdirSync, statSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const RAIZ = "public/assets/real";
const DEST = join(RAIZ, "og");
mkdirSync(DEST, { recursive: true });

const jpgs = readdirSync(RAIZ).filter((f) => f.endsWith(".jpg")).sort();
const filas = [];
for (const f of jpgs) {
  const stem = f.replace(/\.jpg$/, "");
  const src = join(RAIZ, f);
  const meta = await sharp(src).metadata();
  const dest = join(DEST, `${stem}.webp`);
  const info = await sharp(src)
    .resize(1200, 630, { fit: "cover", position: "attention" })
    .webp({ quality: 72 })
    .toFile(dest);
  filas.push({
    stem,
    jpgBytes: statSync(src).size,
    jpgDims: `${meta.width}x${meta.height}`,
    webpBytes: info.size,
  });
}

console.log("stem | jpg dims | jpg B | og.webp B | ahorro");
let totJpg = 0, totWebp = 0;
for (const r of filas) {
  totJpg += r.jpgBytes; totWebp += r.webpBytes;
  console.log(
    `${r.stem} | ${r.jpgDims} | ${r.jpgBytes} | ${r.webpBytes} | ${Math.round((1 - r.webpBytes / r.jpgBytes) * 100)}%`,
  );
}
console.log(`TOTAL | — | ${totJpg} | ${totWebp} | ${Math.round((1 - totWebp / totJpg) * 100)}%`);
console.log("\nTabla DIMS_REALES (pegable en page.tsx):");
for (const r of filas) {
  const [w, h] = r.jpgDims.split("x");
  console.log(`  "${r.stem}": { w: ${w}, h: ${h} },`);
}

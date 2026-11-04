// v237.0 EL RELIEVE — mide candidatos de compresión para el bump map del
// globo. El PNG original (378 KB, 2048x1024 gris) queda INTACTO: esto solo
// mide y escribe candidatos nuevos junto a él. La casa jamás borra obra.
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const SRC = "public/assets/globe/earth-topology.png";
const DIR = "public/assets/globe";

const original = fs.statSync(SRC).size;
console.log(`original PNG: ${original} bytes (${(original / 1024).toFixed(1)} KB)`);

const meta = await sharp(SRC).metadata();
console.log(`metadata: ${meta.width}x${meta.height} ${meta.format} canales=${meta.channels}`);

// fideliad: máximo error de píxel entre original y candidato (heightmap → el
// error SE CONVIERTE EN GEOMETRÍA visible; hay que conocerlo, no adivinarlo)
async function mide(nombre, buf) {
  const out = path.join(DIR, nombre);
  fs.writeFileSync(out, buf);
  const size = fs.statSync(out).size;
  // diferencia contra el original: rasterizar candidato a gris crudo
  const a = await sharp(SRC).raw().toBuffer();
  const b = await sharp(out).raw().toBuffer();
  let maxD = 0, sumD = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const d = Math.abs(a[i] - b[i]);
    if (d > maxD) maxD = d;
    sumD += d;
  }
  const pct = ((1 - size / original) * 100).toFixed(1);
  console.log(
    `${nombre}: ${size} bytes (${(size / 1024).toFixed(1)} KB) —${pct}% · Δmax=${maxD} · Δmedio=${(sumD / n).toFixed(2)}`,
  );
}

// ① WebP SIN PÉRDIDA — píxel exacto, la fidelidad del relieve intacta
await mide("candidato-lossless.webp", await sharp(SRC).webp({ lossless: true }).toBuffer());

// ② WebP casi sin pérdida q95 / q90 — para ver cuánto baja si se acepta Δ mínimo
await mide("candidato-q95.webp", await sharp(SRC).webp({ quality: 95 }).toBuffer());
await mide("candidato-q90.webp", await sharp(SRC).webp({ quality: 90 }).toBuffer());

// ③ PNG optimizado (paleta) — compatible con todo, sin WebP
await mide("candidato-paleta.png", await sharp(SRC).png({ palette: true, compressionLevel: 9 }).toBuffer());
console.log("medición terminada — nada se decide aquí, se decide con los números");

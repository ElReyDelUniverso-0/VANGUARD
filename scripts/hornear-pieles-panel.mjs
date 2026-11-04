// v248.0 EL FOTOGRAMA LIGERO — horno de pieles para los paneles SPA.
// Cada JPG real de /assets/real (24, el archivo de fotos verificadas de la
// sala OSINT y las miniaturas sembradas del feed social) nace en UNA piel
// nueva además de las que ya tenía:
//   · paneles/<stem>.webp — exactamente 640×360 (fit cover, position
//     attention), q72: la piel que visten las TARJETAS (grid aspect-square
//     de la galería de fotogramas, thumbs del feed de vídeos y su poster)
//     — slots que en pantalla hacen object-cover sobre huecos de 150-250 px,
//     así que el archivo viaja ya recortado y pesa una fracción.
//   · la JPG original sigue INTACTA (ley MEGA-PROMPT): conserva dos deberes
//     únicos — el visor de la ficha (el modal de la galería sirve el
//     negativo completo detrás del click) y la metadata social (v247).
//   · las pieles og/ (1200×630, v247) y thumbs/ (480w, v238) siguen vivas
//     para SUS consumidores; esta familia no las toca.
// Corrida: node scripts/hornear-pieles-panel.mjs  (idempotente, sobreescribe)
import { readdirSync, statSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const RAIZ = "public/assets/real";
const DEST = join(RAIZ, "paneles");
mkdirSync(DEST, { recursive: true });

const jpgs = readdirSync(RAIZ).filter((f) => f.endsWith(".jpg")).sort();
const filas = [];
for (const f of jpgs) {
  const stem = f.replace(/\.jpg$/, "");
  const src = join(RAIZ, f);
  const meta = await sharp(src).metadata();
  const dest = join(DEST, `${stem}.webp`);
  const info = await sharp(src)
    .resize(640, 360, { fit: "cover", position: "attention" })
    .webp({ quality: 72 })
    .toFile(dest);
  filas.push({
    stem,
    jpgBytes: statSync(src).size,
    jpgDims: `${meta.width}x${meta.height}`,
    webpBytes: info.size,
  });
}

console.log("stem | jpg dims | jpg B | paneles.webp B | ahorro");
let totJpg = 0, totWebp = 0;
for (const r of filas) {
  totJpg += r.jpgBytes; totWebp += r.webpBytes;
  console.log(
    `${r.stem} | ${r.jpgDims} | ${r.jpgBytes} | ${r.webpBytes} | ${Math.round((1 - r.webpBytes / r.jpgBytes) * 100)}%`,
  );
}
console.log(`TOTAL (${filas.length} pieles) | — | ${totJpg} | ${totWebp} | ${Math.round((1 - totWebp / totJpg) * 100)}%`);

// CIRUGÍA v333.0 — LA CICATRIZ QUE NO DUELE
// Retira las directivas eslint-disable MUERTAS (reportadas como
// "Unused eslint-disable directive" — la regla ya no dispara ahí).
// Ley de la casa (v331): «una cicatriz que ya no duele no se viste».
// Seguro: cada línea se verifica como directiva antes de tocarla;
// si una sola no lo parece, la ronda ABORTA sin escribir nada.
import fs from "node:fs";

const REPORTE = "/tmp/eslint-full.json";
const RAIZ = "/home/z/my-project";
const data = JSON.parse(fs.readFileSync(REPORTE, "utf8"));

// 1. Recolectar mensajes sin ruleId (directivas muertas), deduplicados
const muertas = new Map(); // archivo -> Set(lineas)
for (const f of data) {
  for (const m of f.messages) {
    if (m.ruleId) continue;
    if (!m.message.includes("Unused eslint-disable directive")) continue;
    const rel = f.filePath.replace(RAIZ + "/", "");
    if (!muertas.has(rel)) muertas.set(rel, new Set());
    muertas.get(rel).add(m.line);
  }
}

let total = 0;
for (const [, lins] of muertas) total += lins.size;
console.log(`Directivas muertas: ${total} en ${muertas.size} archivos`);

// 2. Verificación previa de TODAS las líneas — aborto si una no encaja
const fallos = [];
for (const [rel, lins] of muertas) {
  const lineas = fs.readFileSync(`${RAIZ}/${rel}`, "utf8").split("\n");
  for (const ln of lins) {
    const texto = (lineas[ln - 1] ?? "").trim();
    const esDirectiva =
      /^\/?\*?\s*eslint-disable(-next-line|-line)?\b/.test(texto) ||
      /\/\/\s*eslint-disable(-next-line|-line)?\b/.test(texto) ||
      /\/\*\s*eslint-disable(-next-line|-line)?\b/.test(texto);
    if (!esDirectiva) fallos.push(`${rel}:${ln} → "${texto.slice(0, 90)}"`);
  }
}
if (fallos.length) {
  console.error("ABORTO — líneas que no parecen directivas:");
  for (const f of fallos) console.error("  " + f);
  process.exit(1);
}

// 3. Cirugía: quitar la directiva; si la línea queda vacía, quitar la línea
let cortadas = 0;
for (const [rel, lins] of muertas) {
  const ruta = `${RAIZ}/${rel}`;
  const lineas = fs.readFileSync(ruta, "utf8").split("\n");
  // de mayor a menor para que los índices no bailen
  const orden = [...lins].sort((a, b) => b - a);
  const retiradas = [];
  for (const ln of orden) {
    const original = lineas[ln - 1];
    const sinDirectiva = original.replace(
      /\/\/\s*eslint-disable(-next-line|-line)?\s+[^\n]*?(?=\s*$)|\/\*\s*eslint-disable(-next-line|-line)?[^]*?\*\//g,
      ""
    );
    if (sinDirectiva.trim() === "") {
      lineas.splice(ln - 1, 1); // la línea era SOLO la directiva
    } else {
      lineas[ln - 1] = sinDirectiva.replace(/\s{2,}$/, "");
    }
    retiradas.push(ln);
    cortadas++;
  }
  fs.writeFileSync(ruta, lineas.join("\n"));
  console.log(`  ${rel}: retiradas L${[...retiradas].sort((a, b) => a - b).join(", L")}`);
}
console.log(`CICATRICES RETIRADAS: ${cortadas}`);

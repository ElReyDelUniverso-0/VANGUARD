#!/usr/bin/env node
// v26 — completar fotos restantes del arsenal CON PAUSAS LARGAS (Wikimedia
// limita por IP). Escribe resultados incrementalmente en arsenal-photos.json.
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const UA = "VanguardEducational/26.0 (educational conflict platform)";
const FILE = "/home/z/my-project/scripts/arsenal-photos.json";

function sleep(n) { execFileSync("sleep", [String(n)]); }
function code(url) {
  try {
    return execFileSync("curl", ["-s", "-L", "-A", UA, "--max-time", "30", "-r", "0-0", "-o", "/dev/null", "-w", "%{http_code}", url], { encoding: "utf8" }).trim();
  } catch { return "ERR"; }
}
function get(url) {
  try {
    return execFileSync("curl", ["-s", "-L", "-A", UA, "--max-time", "30", url], { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
  } catch { return ""; }
}

const out = (() => { try { return JSON.parse(fs.readFileSync(FILE, "utf8")); } catch { return {}; } })();
const save = () => fs.writeFileSync(FILE, JSON.stringify(out, null, 2));

console.log("[1] pausa inicial 60s (deja pasar el rate-limit)…"); sleep(60);

// --- fotos principales que faltan ---
const mains = [
  ["bayraktar", "https://upload.wikimedia.org/wikipedia/commons/4/4d/Bayraktar_TB2_Runway.jpg"],
  ["lancet", "https://upload.wikimedia.org/wikipedia/commons/8/8f/ZALA_Lancet_1.jpg"],
  ["fpv", "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/30/REN_6515.jpg/1280px-REN_6515.jpg"],
];
for (const [slug, url] of mains) {
  if (out[slug] && !out[slug].includes("3840px")) { console.log(`${slug}: ya OK`); continue; }
  for (let i = 0; i < 3; i++) {
    const c = code(url);
    console.log(`${slug}: intento ${i + 1} → ${c}`);
    if (c === "200" || c === "206") { out[slug] = url; save(); break; }
    sleep(50);
  }
}

// --- fotos de despiece vía API de Commons ---
const COMMONS = [
  ["ak_parts", "AK-47 disassembled"],
  ["m4_parts", "M4 carbine disassembled"],
  ["fpv_parts", "FPV drone antenna"],
  ["bayraktar_ops", "Bayraktar TB2"],
  ["t90_ops", "T-90 tank 2023"],
  ["himars_ops", "HIMARS launch 2022"],
];
function commonsPhoto(search) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(search)}&gsrlimit=8&prop=imageinfo&iiprop=url&iiurlwidth=900&format=json`;
  const body = get(url);
  try {
    const j = JSON.parse(body);
    const pages = Object.values(j?.query?.pages || {});
    for (const p of pages) {
      const ii = p?.imageinfo?.[0];
      const src = (ii?.thumburl || ii?.url || "").split("?")[0];
      if (src && /\.(jpe?g|png)$/i.test(src)) return src;
    }
  } catch { /* vacío */ }
  return null;
}

for (const [slug, search] of COMMONS) {
  if (out[slug]) { console.log(`${slug}: ya OK`); continue; }
  let ok = false;
  for (let i = 0; i < 3 && !ok; i++) {
    const src = commonsPhoto(search);
    console.log(`${slug}: api → ${src ? src.slice(0, 80) : "null"}`);
    if (src) {
      const c = code(src);
      console.log(`${slug}: check → ${c}`);
      if (c === "200" || c === "206") { out[slug] = src; save(); ok = true; }
    }
    if (!ok) sleep(45);
  }
}
save();
console.log("FIN — estado:", Object.entries(out).filter(([, v]) => v).length, "fotos OK");

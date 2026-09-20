#!/usr/bin/env node
// v26 — FOTOS REALES de armas desde Wikimedia vía curl (node fetch es bloqueado
// por el bot-wall de Wikimedia; curl pasa). Verifica cada URL con HEAD.
// Salida: scripts/arsenal-photos.json
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const UA = "VanguardEducational/26.0 (educational conflict platform)";

const WIKI = [
  ["ak47", ["AK-47"]],
  ["m4", ["M4 carbine"]],
  ["fpv", ["FPV drone", "First-person view (radio control)", "Unmanned combat aerial vehicle"]],
  ["shahed", ["HESA Shahed 136"]],
  ["bayraktar", ["Bayraktar TB2"]],
  ["javelin", ["FGM-148 Javelin"]],
  ["himars", ["M142 HIMARS"]],
  ["lancet", ["ZALA Lancet"]],
  ["t90", ["T-90"]],
  ["leopard2", ["Leopard 2"]],
  ["rpg7", ["RPG-7"]],
  ["m777", ["M777 howitzer", "M777 Howitzer"]],
];

const COMMONS = [
  ["ak_parts", "AK-47 disassembled"],
  ["m4_parts", "M4 carbine disassembled"],
  ["fpv_parts", "FPV drone components"],
  ["bayraktar_ops", "Bayraktar TB2 airfield"],
  ["t90_ops", "T-90 tank firing"],
  ["himars_ops", "HIMARS firing rocket"],
];

function curl(url, { head = false } = {}) {
  const args = ["-s", "-L", "-A", UA, "--max-time", "25", "-w", "\n%{http_code}", url];
  if (head) args.push("-I", "--http1.1");
  try {
    const out = execFileSync("curl", args, { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
    const idx = out.lastIndexOf("\n");
    const code = out.slice(idx + 1).trim();
    return { code, body: out.slice(0, idx) };
  } catch (e) {
    return { code: "ERR", body: String(e).slice(0, 120) };
  }
}

function stripUtm(u) {
  return (u || "").split("?")[0];
}

// construye thumb 900px desde la URL del archivo original
function toThumb900(raw) {
  const u = stripUtm(raw);
  if (u.includes("/thumb/")) {
    // ya es thumb: reemplaza el tamaño NNNpx
    return u.replace(/\/(\d+)px-/, "/900px-");
  }
  const m = u.match(/\/wikipedia\/commons\/([a-f0-9])\/([a-f0-9]{2})\/(.+)$/);
  if (!m) return u;
  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${m[1]}/${m[2]}/${m[3]}/900px-${m[3]}`;
}

function wikiPhoto(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, "_"))}`;
  for (let i = 0; i < 3; i++) {
    const { code, body } = curl(url);
    if (code === "200") {
      try {
        const j = JSON.parse(body);
        return j.originalimage?.source || j.thumbnail?.source || null;
      } catch {
        return null;
      }
    }
    if (code === "429" || code === "403") {
      execFileSync("sleep", ["3"]);
      continue;
    }
    return null;
  }
  return null;
}

function commonsPhoto(search) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(search)}&gsrlimit=8&prop=imageinfo&iiprop=url&iiurlwidth=900&format=json`;
  for (let i = 0; i < 3; i++) {
    const { code, body } = curl(url);
    if (code === "200") {
      try {
        const j = JSON.parse(body);
        const pages = Object.values(j?.query?.pages || {});
        for (const p of pages) {
          const ii = p?.imageinfo?.[0];
          const src = ii?.thumburl || ii?.url;
          if (src && /\.(jpe?g|png)$/i.test(src)) return src;
        }
        return null;
      } catch {
        return null;
      }
    }
    if (code === "429" || code === "403") {
      execFileSync("sleep", ["3"]);
      continue;
    }
    return null;
  }
  return null;
}

function ok(url) {
  const a = curl(url, { head: true });
  if (a.code === "200") return true;
  // thumb.wikimedia.org a veces bloquea HEAD: probamos GET con rango de 1 byte
  const args = ["-s", "-L", "-A", UA, "--max-time", "25", "-r", "0-0", "-o", "/dev/null", "-w", "%{http_code}", url];
  try {
    const code = execFileSync("curl", args, { encoding: "utf8" }).trim();
    return code === "200" || code === "206";
  } catch {
    return false;
  }
}

const out = (() => {
  try { return JSON.parse(fs.readFileSync("/home/z/my-project/scripts/arsenal-photos.json", "utf8")); } catch { return {}; }
})();
for (const [slug, titles] of WIKI) {
  if (out[slug]) { console.log(`${slug}: CACHE ${out[slug].slice(0, 60)}…`); continue; }
  let raw = null;
  for (const t of titles) {
    raw = wikiPhoto(t);
    if (raw) break;
    execFileSync("sleep", ["1"]);
  }
  if (!raw) { out[slug] = null; console.log(`${slug}: SIN FOTO`); continue; }
  const thumb = toThumb900(raw);
  const clean = stripUtm(raw);
  let final = null;
  for (const cand of [thumb, clean]) {
    if (cand && ok(cand)) { final = cand; break; }
  }
  out[slug] = final;
  console.log(`${slug}: ${final ? "OK" : "FAIL"} ${final || raw}`);
  execFileSync("sleep", ["1"]);
}
for (const [slug, search] of COMMONS) {
  if (out[slug]) { console.log(`${slug}: CACHE`); continue; }
  let raw = commonsPhoto(search);
  if (!raw) { execFileSync("sleep", ["4"]); raw = commonsPhoto(search); }
  if (!raw) { execFileSync("sleep", ["6"]); raw = commonsPhoto(search); }
  raw = stripUtm(raw);
  out[slug] = raw && ok(raw) ? raw : raw;
  console.log(`${slug}: ${out[slug] ? "OK" : "FAIL"} ${out[slug] || "(vacío)"}`);
  execFileSync("sleep", ["1"]);
}
fs.writeFileSync("/home/z/my-project/scripts/arsenal-photos.json", JSON.stringify(out, null, 2));
console.log("SALIDA -> scripts/arsenal-photos.json");

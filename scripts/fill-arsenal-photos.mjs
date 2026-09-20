#!/usr/bin/env node
// v26 — inyecta las URLs verificadas de scripts/arsenal-photos.json en
// src/lib/arsenal-data.ts (reemplaza los tokens __PHOTO_<slug>__).
// Los slugs que aún no tienen foto quedan con token; el panel los detecta
// (empiezan con "__") y muestra un placeholder "foto en camino".
import fs from "node:fs";

const photos = JSON.parse(fs.readFileSync("/home/z/my-project/scripts/arsenal-photos.json", "utf8"));
const p = "/home/z/my-project/src/lib/arsenal-data.ts";
let s = fs.readFileSync(p, "utf8");

let ok = 0, miss = [];
for (const [slug, url] of Object.entries(photos)) {
  const token = `__PHOTO_${slug}__`;
  if (!s.includes(token)) continue;
  if (url) { s = s.split(token).join(url); ok++; }
  else miss.push(slug);
}
fs.writeFileSync(p, s);
console.log(`inyectadas: ${ok} · pendientes: ${miss.join(", ") || "ninguna"}`);

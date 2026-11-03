// QA visual v219 EL HISTORIADOR — capturas de /nucleo y la ficha del acontecimiento
import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const hoy = new Date().toLocaleDateString("en-CA");

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 1,
});
const page = await ctx.newPage();
await page.addInitScript(
  ([d]) => sessionStorage.setItem(`vg-cine-entrada-v178-${d}`, "1"),
  [hoy]
);

// 1) /nucleo desktop — el mapa de entidades con los 9 tipos
await page.goto(`${BASE}/nucleo`, { waitUntil: "networkidle", timeout: 45000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: "capturas/historiador-nucleo.png" });
console.log("capturas/historiador-nucleo.png");

// 2) ficha del acontecimiento en móvil 390px
const mv = await ctx.newPage();
await mv.addInitScript(
  ([d]) => sessionStorage.setItem(`vg-cine-entrada-v178-${d}`, "1"),
  [hoy]
);
await mv.setViewportSize({ width: 390, height: 844 });
await mv.goto(
  `${BASE}/nucleo?id=${encodeURIComponent("vg:acontecimiento:invasion-rusa-de-ucrania")}`,
  { waitUntil: "networkidle", timeout: 45000 }
);
await mv.waitForTimeout(1200);
await mv.screenshot({ path: "capturas/historiador-ficha-movil.png" });
console.log("capturas/historiador-ficha-movil.png");

await browser.close();
console.log("QA VISUAL OK");

#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════
// v416.1 · PRUEBA EN NAVEGADOR DEL SELECTOR DE ANIMACIONES
//
// `probar.mjs` lee el código; esto abre un Chromium de verdad y comprueba lo
// único que importa: que al pulsar «Desactivadas» la casa cambie EN EL ACTO
// (sin recargar), que la elección SOBREVIVA a la recarga, que las animaciones
// de verdad se paren y que volver a «automática» borre la elección.
//
//   LD_LIBRARY_PATH=/tmp/libs/usr/lib/x86_64-linux-gnu \
//     node tools/anim/probar-navegador.mjs http://localhost:3211
//
// Sin dependencias nuevas del proyecto: puppeteer se instala aparte
// (`npm i --no-save puppeteer`) y solo se usa para medir y probar.
// ═══════════════════════════════════════════════════════════════════

import puppeteer from "puppeteer";

// Otro motor: VG_NAVEGADOR=/ruta/al/binario. Sirve para repetir la misma
// medida en Brave o Chrome de verdad sin instalar nada en el proyecto.
const EJECUTABLE = process.env.VG_NAVEGADOR || undefined;

const BASE = process.argv[2] ?? "http://localhost:3211";
const fallos = [];
const ok = (cond, texto) => {
  console.log(`${cond ? "  ✓" : "  ✗"} ${texto}`);
  if (!cond) fallos.push(texto);
};

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

async function abrir(browser, ruta, movil) {
  const page = await browser.newPage();
  await page.setViewport(
    movil
      ? { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
      : { width: 1440, height: 900, deviceScaleFactor: 1 }
  );
  await page.goto(BASE + ruta, { waitUntil: "domcontentloaded", timeout: 120000 });
  return page;
}

// Cuenta animaciones realmente en curso y lee el atributo del <html>.
const estado = (page) =>
  page.evaluate(() => ({
    nivel: document.documentElement.getAttribute("data-vg-anim"),
    guardado: localStorage.getItem("vg-anim"),
    enCurso: document.getAnimations().filter((a) => a.playState === "running").length,
    botones: [...document.querySelectorAll(".vg-anim-op")].map((b) => ({
      texto: b.textContent.trim(),
      pulsado: b.getAttribute("aria-pressed"),
    })),
  }));

// Pulsa un botón del selector por su texto, dentro de la primera caja visible.
async function pulsar(page, texto) {
  return page.evaluate((t) => {
    const b = [...document.querySelectorAll(".vg-anim-op")].find(
      (x) => x.textContent.trim().toLowerCase() === t.toLowerCase()
    );
    if (!b) return false;
    b.click();
    return true;
  }, texto);
}

const browser = await puppeteer.launch({
  executablePath: EJECUTABLE,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none"],
});

try {
  // ── A. /modo, en vertical de teléfono ─────────────────────────────
  console.log("\nA. /modo en teléfono (412×915)");
  let page = await abrir(browser, "/modo", true);
  await page.waitForSelector(".vg-anim-op", { timeout: 90000 });
  await dormir(600);

  let e = await estado(page);
  ok(e.botones.length === 3, `hay tres opciones (${e.botones.map((b) => b.texto).join(" · ")})`);
  ok(!!e.nivel, `el <html> declara el nivel («${e.nivel}»)`);

  // Marca de vida: si la página recargara, cambiaría.
  await page.evaluate(() => (window.__vgVivo = "si"));

  ok(await pulsar(page, "Desactivadas"), "se pulsa «Desactivadas»");
  await dormir(700);
  e = await estado(page);
  ok(e.nivel === "desactivadas", `el nivel se aplica en el acto («${e.nivel}»)`);
  ok(e.guardado === "desactivadas", `la elección queda guardada (${e.guardado})`);
  ok(e.enCurso === 0, `quedan ${e.enCurso} animaciones en curso (se esperaban 0)`);
  ok(
    e.botones.find((b) => b.texto === "Desactivadas")?.pulsado === "true",
    "el botón pulsado se anuncia con aria-pressed"
  );
  ok(
    (await page.evaluate(() => window.__vgVivo)) === "si",
    "sin recargar la página (la marca de vida sigue puesta)"
  );
  ok((await page.evaluate(() => !!document.querySelector(".vg-anim-nota"))), "la nota del nivel está a la vista");

  // Recarga: la elección tiene que sobrevivir.
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(".vg-anim-op", { timeout: 90000 });
  await dormir(900);
  e = await estado(page);
  ok(e.nivel === "desactivadas", `tras recargar sigue «${e.nivel}»`);
  ok(e.enCurso === 0, `tras recargar siguen ${e.enCurso} animaciones en curso`);

  // Volver a la elección automática.
  const volvio = await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) =>
      /volver a la elección automática/i.test(x.textContent)
    );
    if (!b) return false;
    b.click();
    return true;
  });
  ok(volvio, "existe «volver a la elección automática»");
  await dormir(600);
  e = await estado(page);
  ok(e.guardado === null, `la elección se borra (${e.guardado})`);
  ok(e.nivel !== null, `la casa vuelve a decidir sola («${e.nivel}»)`);

  // Y «Completas» tiene que devolver animación de verdad.
  await pulsar(page, "Completas");
  await dormir(800);
  e = await estado(page);
  ok(e.nivel === "completas", `«Completas» se aplica («${e.nivel}»)`);
  ok(e.enCurso > 0, `con «Completas» vuelven a correr ${e.enCurso} animaciones`);
  await page.close();

  // ── B. /cuartel, el selector dentro de los ajustes ───────────────
  console.log("\nB. /cuartel · ajustes, en escritorio (1440×900)");
  page = await abrir(browser, "/cuartel", false);
  await page.waitForFunction(() => document.body && document.body.innerText.length > 200, {
    timeout: 150000,
  });
  await dormir(1200);

  const abrio = await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) =>
      /ajustes|settings/i.test((x.getAttribute("title") || "") + " " + (x.getAttribute("aria-label") || ""))
    );
    if (!b) return false;
    b.click();
    return true;
  });
  ok(abrio, "se abre el panel de ajustes desde la cabecera");
  await dormir(900);

  const dentro = await page.evaluate(() => {
    const grupo = document.querySelector('[aria-label="Nivel de animación"]');
    if (!grupo) return null;
    return {
      visible: !!(grupo.offsetWidth || grupo.offsetHeight),
      opciones: [...grupo.querySelectorAll(".vg-anim-op")].map((b) => b.textContent.trim()),
      rotulo: (grupo.previousElementSibling?.textContent || "").trim(),
    };
  });
  ok(!!dentro, "el selector está dentro de los ajustes");
  ok(dentro?.visible === true, "y se ve (no está escondido)");
  ok(dentro?.opciones.length === 3, `con sus tres opciones (${dentro?.opciones.join(" · ")})`);

  const cambio = await page.evaluate(() => {
    const b = [...document.querySelectorAll('[aria-label="Nivel de animación"] .vg-anim-op')].find(
      (x) => x.textContent.trim() === "Reducidas"
    );
    if (!b) return false;
    b.click();
    return true;
  });
  await dormir(600);
  const tras = await estado(page);
  ok(cambio && tras.nivel === "reducidas", `pulsar «Reducidas» en los ajustes cambia el nivel («${tras.nivel}»)`);

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.body && document.body.innerText.length > 200, {
    timeout: 150000,
  });
  const trasRecarga = await page.evaluate(() => ({
    nivel: document.documentElement.getAttribute("data-vg-anim"),
    guardado: localStorage.getItem("vg-anim"),
  }));
  ok(
    trasRecarga.nivel === "reducidas" && trasRecarga.guardado === "reducidas",
    `y sobrevive a la recarga («${trasRecarga.nivel}»)`
  );
  await page.close();
} catch (err) {
  fallos.push("excepción: " + err.message);
  console.error("\n✗ excepción:", err.message);
} finally {
  await browser.close();
}

console.log(
  fallos.length === 0
    ? "\nTODO LIMPIO: el selector cambia en el acto, se guarda y sobrevive a la recarga.\n"
    : `\n${fallos.length} FALLOS:\n` + fallos.map((f) => " · " + f).join("\n") + "\n"
);
process.exit(fallos.length === 0 ? 0 : 1);

#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════
// v416.0 · EL MEDIDOR — la prueba que el informe pedía, sin trampa
//
// Uso:  node tools/anim/medir.mjs <url> [segundos] [factor-cpu]
//
// Emula un teléfono modesto (412×915, DPR 2) y frena la CPU (por defecto 6×;
// el Galaxy A06 del informe es de gama de entrada). Mide, por nivel:
//   · animaciones declaradas y realmente en ejecución (Web Animations API);
//   · cuadros por segundo (mediana y p95) durante la ventana;
//   · TIEMPO DE HILO PRINCIPAL por segundo (TaskDuration de CDP): es la
//     métrica que de verdad distingue «se ve fluido» de «va a 10 FPS»;
//   · recálculos de estilo y de diseño, y tareas largas (>50 ms).
//
// No inventa: si el navegador no expone una métrica, la deja en cero.
// ═══════════════════════════════════════════════════════════════════
import puppeteer from "puppeteer";

// Otro motor: VG_NAVEGADOR=/ruta/al/binario. Sirve para repetir la misma
// medida en Brave o Chrome de verdad sin instalar nada en el proyecto.
const EJECUTABLE = process.env.VG_NAVEGADOR || undefined;

const URL = process.argv[2] || "http://localhost:3210/";
const SEG = Number(process.argv[3] || 3);
const CPU = Number(process.argv[4] || 6);
const NIVELES = ["completas", "reducidas", "desactivadas"];

const navegador = await puppeteer.launch({
  executablePath: EJECUTABLE,
  // Brave no es chrome-headless-shell: si se apunta a otro binario, headless nuevo.
  headless: EJECUTABLE ? true : "shell",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu-vsync"],
});

const out = [];
for (const nivel of NIVELES) {
  const pagina = await navegador.newPage();
  await pagina.emulate({
    viewport: { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    userAgent:
      "Mozilla/5.0 (Linux; Android 14; SM-A065F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36 Brave/1.64",
  });
  const cdp = await pagina.createCDPSession();
  await cdp.send("Performance.enable");
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: CPU });
  const errores = [];
  pagina.on("pageerror", (e) => errores.push(String(e).slice(0, 140)));

  await pagina.evaluateOnNewDocument((n) => {
    try { localStorage.setItem("vg-anim", n); } catch { /* nada */ }
  }, nivel);

  await pagina.goto(URL, { waitUntil: "networkidle2", timeout: 120000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 2500));

  const antes = await cdp.send("Performance.getMetrics");
  const datos = await pagina.evaluate(async (seg) => {
    const anim = document.getAnimations();
    const largas = [];
    let obs = null;
    try {
      obs = new PerformanceObserver((l) => l.getEntries().forEach((e) => largas.push(e.duration)));
      obs.observe({ type: "longtask", buffered: false });
    } catch { /* sin longtask */ }
    const marcas = [];
    await new Promise((res) => {
      const t0 = performance.now();
      const paso = (t) => {
        marcas.push(t);
        if (t - t0 < seg * 1000) requestAnimationFrame(paso);
        else res();
      };
      requestAnimationFrame(paso);
    });
    obs?.disconnect();
    const deltas = [];
    for (let i = 1; i < marcas.length; i++) deltas.push(marcas[i] - marcas[i - 1]);
    const orden = [...deltas].sort((a, b) => a - b);
    return {
      nivelAplicado: document.documentElement.getAttribute("data-vg-anim"),
      animaciones: anim.length,
      corriendo: anim.filter((a) => a.playState === "running").length,
      fps: orden.length ? +(1000 / orden[Math.floor(orden.length / 2)]).toFixed(1) : 0,
      fpsP95: orden.length ? +(1000 / orden[Math.floor(orden.length * 0.95)]).toFixed(1) : 0,
      cuadrosLentos: deltas.filter((d) => d > 50).length,
      cuadros: deltas.length,
      largas: largas.length,
      largaMax: largas.length ? Math.round(Math.max(...largas)) : 0,
      segundos: seg,
    };
  }, SEG);
  const despues = await cdp.send("Performance.getMetrics");

  const m = (lista, n) => (lista.metrics.find((x) => x.name === n)?.value ?? 0);
  const tarea = m(despues, "TaskDuration") - m(antes, "TaskDuration");
  const estilos = m(despues, "RecalcStyleCount") - m(antes, "RecalcStyleCount");
  const disenos = m(despues, "LayoutCount") - m(antes, "LayoutCount");

  out.push({
    nivel,
    ...datos,
    cpuPorSegundo: +(tarea / SEG).toFixed(3),
    estilos,
    disenos,
    errores: errores.slice(0, 2),
  });
  await pagina.close();
}

await navegador.close();

const linea = (r) =>
  `${r.nivel.padEnd(13)} ${String(r.nivelAplicado).padEnd(13)} ${String(r.animaciones).padStart(6)} ${String(
    r.corriendo
  ).padStart(6)} ${String(r.fps).padStart(6)} ${String(r.fpsP95).padStart(6)} ${String(r.cpuPorSegundo).padStart(
    11
  )} ${String(`${r.largas}/${r.largaMax}ms`).padStart(13)} ${String(`${r.estilos}/${r.disenos}`).padStart(11)}`;

console.log(`\nMEDICIÓN · ${URL}`);
console.log(`emulación: 412×915 · DPR 2 · CPU ${CPU}× más lenta · ventana ${SEG}s\n`);
console.log(
  "nivel         aplicado      anims  en curso    fps   fps95   hilo/seg   tareas>50ms   estilos/diseños"
);
for (const r of out) {
  console.log(linea(r));
  if (r.errores.length) console.log(`   errores: ${r.errores.join(" | ")}`);
}
console.log("");

#!/usr/bin/env node
// ============================================================
// v367.2 LA VOZ MAESTRA — prueba del contrato de /api/maestro
//
// Lo que esta suite comprueba, contra un servidor REAL (no se puede fingir):
//   ① el cerebro responde largo y con estructura (no 220 caracteres de portero)
//   ② la boca puede decirlo: cero markdown, cero URLs, cero claves mod:/vg:
//   ③ la navegación apunta a rutas REALES de la casa (y esas rutas existen)
//   ④ la memoria conversacional funciona: el segundo turno entiende el hilo
//   ⑤ CERO CIFRAS INVENTADAS: toda cifra hablada tiene que aparecer en los
//      datos que el propio endpoint declara (corte, fuentes, briefing)
//   ⑥ honestidad: una pregunta imposible NO devuelve una invención
//   ⑦ el muro responde 429 antes que dejar pasar una avalancha
//
// Uso:
//   BASE_URL=https://vanguard-kq9r.vercel.app node scripts/pruebas-voz.mjs
//   BASE_URL=http://localhost:3000 node scripts/pruebas-voz.mjs   (dev local)
// Sale con 0 si todo pasa; 1 si algo falla (sirve de puerta en el CI del escudo).
// ============================================================

const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
let fallos = 0;
const ok = (cond, etiqueta, detalle = "") => {
  console.log(`${cond ? "✓" : "✗"} ${etiqueta}${detalle ? " · " + detalle : ""}`);
  if (!cond) fallos++;
};

async function preguntar(texto, historial = []) {
  const r = await fetch(`${BASE}/api/maestro`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ texto, historial }),
  });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, j };
}

async function existe(ruta) {
  const r = await fetch(`${BASE}${ruta}`, { method: "GET", redirect: "manual" });
  return r.status === 200 || r.status === 304;
}

const RE_PANTALLA = /(https?:\/\/|www\.|\*\*|__|```|\bmod:|\bvg:|\bfnt:)/;

console.log(`\n═══ LA VOZ MAESTRA · contrato de /api/maestro · ${BASE}\n`);

// ① cerebro largo + estructura
const uno = await preguntar("explícame el mar Rojo");
ok(uno.status === 200, "POST /api/maestro responde 200", `status=${uno.status}`);
const hablar = typeof uno.j.hablar === "string" ? uno.j.hablar : "";
ok(hablar.length >= 300, "la respuesta es larga (explica, no despacha)", `${hablar.length} caracteres`);
ok(
  /terreno|por qué importa|vigilar|actores|ejemplo/i.test(hablar),
  "trae estructura de analista (terreno · por qué importa · qué vigilar)",
);
ok(!RE_PANTALLA.test(hablar), "la boca puede decirlo: sin markdown, URLs ni claves internas");

// ② navegación real
const ruta = uno.j?.accion?.ruta ?? "";
ok(ruta.startsWith("/"), "la respuesta trae una ruta de navegación", ruta || "(ninguna)");
if (ruta.startsWith("/")) ok(await existe(ruta), `la ruta ${ruta} existe de verdad en la casa`);

// ③ memoria conversacional (el hilo, no la amnesia)
const dos = await preguntar("dame un ejemplo", [
  { rol: "piloto", texto: "explícame el mar Rojo" },
  { rol: "casa", texto: hablar.slice(0, 300) },
  { rol: "casa", texto: `TEMA:${uno.j?.tema ?? ""}` },
]);
ok(dos.status === 200 && (dos.j?.hablar ?? "").length > 80, "el seguimiento «dame un ejemplo» se entiende");
ok(
  /ejemplo|mar Rojo|Hodeida|barco|buque|seguro/i.test(dos.j?.hablar ?? ""),
  "el seguimiento continúa el tema anterior (memoria de 12 turnos)",
);

// ④ cero cifras inventadas
const tres = await preguntar("¿qué pasa hoy en el mundo?");
const declaradas = new Set(
  `${tres.j?.corte ?? ""} ${(tres.j?.fuentes ?? [])
    .map((f) => `${f.fecha} ${f.titulo}`)
    .join(" ")}`.match(/\d+/g) ?? [],
);
const habladas = (tres.j?.hablar ?? "").match(/\d+/g) ?? [];
const sospechosas = habladas.filter((n) => !declaradas.has(n));
ok(
  sospechosas.length === 0,
  "ninguna cifra hablada carece de origen en el archivo",
  sospechosas.length ? `sin origen: ${sospechosas.join(", ")}` : `${habladas.length} cifras, todas con fuente`,
);

// ⑤ honestidad ante lo imposible
const cuatro = await preguntar("¿cuánto cuesta un pasaje a Marte en bicicleta?");
ok(
  /no lo tengo|no lo sé|no tengo en el archivo|prefiero/i.test(cuatro.j?.hablar ?? ""),
  "ante lo que no sabe, lo dice (no inventa)",
  cuatro.j?.modo ?? "",
);

// ⑥ muro
const avalancha = await Promise.all(
  Array.from({ length: 34 }, () => preguntar("hola").then((r) => r.status)),
);
ok(avalancha.includes(429), "el muro corta la avalancha con 429", `estados: ${[...new Set(avalancha)].join(",")}`);

console.log(`\n${fallos === 0 ? "TODO VERDE" : `${fallos} FALLO(S)`}\n`);
process.exit(fallos === 0 ? 0 : 1);

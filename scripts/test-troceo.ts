// Test del troceo anti-traba v196 (funciones puras, sin window)
import { trocearTexto } from "../src/lib/voces-agentes";

let fallos = 0;
function ok(cond: boolean, msg: string) {
  if (!cond) { fallos++; console.log("FALLO:", msg); }
  else console.log("OK:", msg);
}

// 1) Texto largo tipo respuesta de LLM → trozos ≤190 y sin perder palabras
const largo = "El mundo no duerme y yo tampoco. ".repeat(20); // ~660 chars
const t1 = trocearTexto(largo);
ok(t1.length >= 3, `texto largo se parte en ${t1.length} trozos`);
ok(t1.every((t) => t.length <= 190), "ningún trozo pasa de 190 chars");
const reunion = t1.join(" ").replace(/\s+/g, " ").trim();
ok(reunion === largo.replace(/\s+/g, " ").trim(), "el troceo no pierde ni duplica texto");

// 2) Texto vacío → sin trozos
ok(trocearTexto("").length === 0, "vacío → 0 trozos");
ok(trocearTexto("   ").length === 0, "espacios → 0 trozos");

// 3) Frase corta única → 1 trozo intacto
ok(JSON.stringify(trocearTexto("Hola, comandante.")) === JSON.stringify(["Hola, comandante."]), "frase corta intacta");

// 4) Frase sin puntos de 500 chars → parte por comas/espacios, nunca media palabra
const sinPuntos = "palabra ".repeat(80).trim();
const t4 = trocearTexto(sinPuntos);
ok(t4.every((t) => !t.endsWith("palab") && !t.startsWith("ra ")), "cortes limpios sin partir palabras");
ok(t4.join(" ") === sinPuntos, "sin puntos: contenido íntegro");

// 5) Palabra larguísima (sin espacios) → corte forzado no bucle infinito
const t5 = trocearTexto("x".repeat(500));
ok(t5.length >= 2 && t5.join("") === "x".repeat(500), "palabra infinita se parte sin colgar");

// 6) Punto con cierre («...»)
const t6 = trocearTexto('Dijo «resiste». Luego calló.');
ok(t6.length === 2 && t6[0] === "Dijo «resiste».", "punto con cierre queda con su frase");

if (fallos === 0) console.log("\nTODO OK — troceo anti-traba verificado");
else { console.log(`\n${fallos} FALLOS`); process.exit(1); }

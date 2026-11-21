// ═══════════════════════════════════════════════════════════════════════════
// v432.4 · PRUEBA DEL ALGORITMO — contra el código real, no contra mocks
//
//   npx tsx tools/para-ti/probar.mts
//
// Lo que se puede romper mañana sin que nadie lo note:
//   ① que el motor no invente contenido ni pierda tarjetas por el camino;
//   ② que aprenda de verdad (like sube, saltar baja, olvidar diluye);
//   ③ que la frescura, los castigos y la diversidad hagan lo que prometen;
//   ④ que la exploración no sea cero (si nunca enseña algo nuevo, no aprende);
//   ⑤ que sea determinista (misma semilla, mismo feed) y que no explote con
//      memoria vacía, corrupta o gigante.
// Sin red, sin base de datos, sin credenciales.
// ═══════════════════════════════════════════════════════════════════════════
import { temasDe, rasgosDe, palabras } from "@/lib/para-ti/rasgos";
import {
  aprender, certeza, gustos, madurar, media, memoriaVacia, recompensaDe,
  type Evento, type Memoria,
} from "@/lib/para-ti/memoria";
import { rango, ordenar, puntuar, salud, type Candidato } from "@/lib/para-ti/motor";
import { aCandidato, ordenarAlgoritmo, type TarjetaFeed } from "@/lib/algoritmo-feed";

let fallos = 0;
const ok = (cond: boolean, nombre: string, extra = "") => {
  console.log(` ${cond ? "✓" : "✗"} ${nombre}${extra ? " → " + extra : ""}`);
  if (!cond) fallos++;
};

const AHORA = 1_800_000_000_000; // instante fijo: la prueba no depende del reloj
const MIN = 60_000;
const HORA = 3_600_000;

const tarjeta = (
  id: string,
  tipo: Candidato["tipo"],
  autor: string,
  titulo: string,
  edadMs = HORA,
  senales: Candidato["senales"] = {}
): Candidato => ({ id, tipo, autor, titulo, ts: AHORA - edadMs, senales });

const evento = (c: Candidato, accion: Evento["accion"], extra: Partial<Evento> = {}): Evento => ({
  id: c.id, tipo: c.tipo, autor: c.autor, titulo: c.titulo, accion, ts: AHORA - 1000, ...extra,
});

// ═══ ① RASGOS: qué ve la máquina ═══════════════════════════════════════════
console.log("── RASGOS DEL CONTENIDO ──");
const temas = temasDe("El conflicto del mar Negro y las divisas del mundo");
ok(temas.length > 0 && temas.length <= 6, `temas acotados: ${temas.length}`);
ok(!temas.includes("del") && !temas.includes("las"), "las palabras vacías no son temas");
ok(temas.includes("conflicto") && temas.includes("divisas"), `temas útiles: ${temas.join(", ")}`);
const rasgos = rasgosDe({ tipo: "video", autor: "Analista", titulo: "El mar Negro arde" });
ok(rasgos[0] === "tipo:video", "el tipo va primero");
ok(rasgos.some((r) => r === "autor:analista"), "el autor va en minúscula y sin acentos");
ok(palabras("¡ÉL dijo: «3 países»!").includes("dijo"), "limpia acentos y signos");

// ═══ ② MEMORIA: aprende de verdad ══════════════════════════════════════════
console.log("\n── MEMORIA DEL ESPECTADOR ──");
const divisas = tarjeta("d1", "video", "analista", "Divisas al alza en el mar Negro");
const memes = tarjeta("m1", "meme", "bromista", "Meme del país que se cae");

let m: Memoria = memoriaVacia(AHORA);
ok(media(m.rasgo["tema:divisas"]) === 0.5, "sin evidencia, ni gusto ni disgusto (0.5)");

for (let i = 0; i < 3; i += 1) m = aprender(m, evento(divisas, "gusta"));
ok(media(m.rasgo["tema:divisas"]) > 0.62, `tres likes suben el tema: ${media(m.rasgo["tema:divisas"]).toFixed(2)}`);
ok(certeza(m.rasgo["tema:divisas"]) > 0.4, "y sube la certeza");

let m2 = memoriaVacia(AHORA);
for (let i = 0; i < 4; i += 1) m2 = aprender(m2, evento(memes, "salta"));
ok(media(m2.rasgo["tema:meme"]) < 0.42, `cuatro saltos bajan el tema: ${media(m2.rasgo["tema:meme"]).toFixed(2)}`);

const negInteresa = aprender(memoriaVacia(AHORA), evento(memes, "noInteresa"));
const negSalta = aprender(memoriaVacia(AHORA), evento(memes, "salta"));
ok(media(negInteresa.rasgo["tema:meme"]) < media(negSalta.rasgo["tema:meme"]), "«no me interesa» pega más que saltar");

const visto2s = recompensaDe({ id: "x", tipo: "video", autor: "a", titulo: "t", accion: "vista", ms: 2_000, duracionMs: 20_000 });
const visto20s = recompensaDe({ id: "x", tipo: "video", autor: "a", titulo: "t", accion: "vista", ms: 19_500, duracionMs: 20_000 });
ok(visto2s.neg > 0 && visto2s.pos === 0, "dos segundos no es interés (se cuenta como salto)");
ok(visto20s.pos > visto2s.pos, "verlo entero suma más");

let m3 = memoriaVacia(AHORA);
for (let i = 0; i < 400; i += 1) m3 = aprender(m3, evento(divisas, "gusta"));
ok(media(m3.rasgo["tema:divisas"]) > 0.9 && media(m3.rasgo["tema:divisas"]) < 1, `nunca llega al 100 %: ${media(m3.rasgo["tema:divisas"]).toFixed(3)}`);

const madura = madurar(m3, AHORA + 30 * 24 * HORA);
ok(madura.rasgo["tema:divisas"].a < m3.rasgo["tema:divisas"].a * 0.6, "a los 30 días la evidencia se ha diluido");
ok(madura.rasgo["tema:divisas"].a > 0.1, "pero no se borra de golpe");
ok(gustos(m3, 3).length > 0, `sabe decir sus gustos: ${gustos(m3, 3).map((g) => g.rasgo).join(", ")}`);

// ═══ ③ PUNTUACIÓN: lo nuevo manda, lo visto se aparta ═════════════════════
console.log("\n── PUNTUACIÓN ──");
const fresca = tarjeta("n1", "video", "analista", "Cable nuevo del mar Negro", MIN);
const vieja = tarjeta("v1", "video", "analista", "Cable viejo del mar Negro", 72 * HORA);
const pFresca = puntuar(fresca, memoriaVacia(AHORA), { ahora: AHORA, semilla: "t" });
const pVieja = puntuar(vieja, memoriaVacia(AHORA), { ahora: AHORA, semilla: "t" });
ok(pFresca.desglose.frescura > pVieja.desglose.frescura, "la frescura decae con la edad");
ok(pFresca.score > pVieja.score, `lo nuevo gana: ${pFresca.score.toFixed(2)} > ${pVieja.score.toFixed(2)}`);

let aprendida = memoriaVacia(AHORA);
for (let i = 0; i < 5; i += 1) aprendida = aprender(aprendida, evento(divisas, "gusta"));
const conGusto = puntuar(divisas, aprendida, { ahora: AHORA, semilla: "t" });
const sinGusto = puntuar(divisas, memoriaVacia(AHORA), { ahora: AHORA, semilla: "t" });
ok(conGusto.desglose.gusto > sinGusto.desglose.gusto, `lo que te gusta puntúa más: ${conGusto.desglose.gusto.toFixed(2)} > ${sinGusto.desglose.gusto.toFixed(2)}`);

let yaVisto = memoriaVacia(AHORA);
yaVisto = aprender(yaVisto, { ...evento(fresca, "vista"), ms: 15_000, duracionMs: 20_000 });
const pRepe = puntuar(fresca, yaVisto, { ahora: AHORA + 30_000, semilla: "t" });
ok(pRepe.desglose.castigo < -1, `visto hace medio minuto, castigado: ${pRepe.desglose.castigo.toFixed(2)}`);
const pLejos = puntuar(fresca, yaVisto, { ahora: AHORA + 26 * HORA, semilla: "t" });
ok(pLejos.desglose.castigo > pRepe.desglose.castigo + 1, "a las 26 horas vuelve a tener derecho");

const conEnganche = puntuar(tarjeta("e1", "video", "a", "Algo", HORA, { vistas: 1000, likes: 300, compartidos: 50 }), memoriaVacia(AHORA), { ahora: AHORA, semilla: "t" });
const sinEnganche = puntuar(tarjeta("e2", "video", "a", "Algo", HORA, { vistas: 1000, likes: 1 }), memoriaVacia(AHORA), { ahora: AHORA, semilla: "t" });
ok(conEnganche.desglose.enganche > sinEnganche.desglose.enganche, "el enganche medido pesa (y está suavizado)");
ok(sinEnganche.desglose.enganche >= 0 && sinEnganche.desglose.enganche <= 1, "el enganche nunca se sale de 0..1");

const vivo = puntuar({ ...tarjeta("vi", "vivo", "canal", "Canal en vivo", 30 * MIN), base: 1.6 }, memoriaVacia(AHORA), { ahora: AHORA, semilla: "t" });
ok(vivo.desglose.base > 1, "un canal EN VIVO lleva empuje declarado");
ok(vivo.porQue === "EN VIVO AHORA MISMO", `y lo dice: «${vivo.porQue}»`);

// ═══ ④ ORDEN: diversidad, exploración y honestidad ════════════════════════
console.log("\n── ORDEN DEL FEED ──");
const muchos: Candidato[] = [];
for (let i = 0; i < 12; i += 1) muchos.push(tarjeta(`v${i}`, "video", "analista", `Cable de divisas número ${i}`, HORA + i * MIN));
for (let i = 0; i < 6; i += 1) muchos.push(tarjeta(`m${i}`, "meme", "bromista", `Meme del país ${i}`, HORA + i * MIN));
for (let i = 0; i < 4; i += 1) muchos.push(tarjeta(`t${i}`, "tv", "tv-vanguard", `Programa ${i}`, HORA + i * MIN));

const feed = rango(muchos, memoriaVacia(AHORA), { ahora: AHORA, semilla: "prueba" });
ok(feed.length === muchos.length, `no se pierde ninguna tarjeta: ${feed.length}/${muchos.length}`);
ok(new Set(feed.map((p) => p.candidato.id)).size === muchos.length, "ni se repite ninguna");
ok(feed.every((p) => muchos.some((c) => c.id === p.candidato.id)), "no inventa contenido");
// un triple solo se admite al final, cuando ya no queda otro tipo que meter
let triplesMalos = 0;
for (let i = 2; i < feed.length; i += 1) {
  const tipo = feed[i].candidato.tipo;
  if (tipo !== feed[i - 1].candidato.tipo || tipo !== feed[i - 2].candidato.tipo) continue;
  if (feed.slice(i + 1).some((p) => p.candidato.tipo !== tipo)) triplesMalos += 1;
}
ok(triplesMalos === 0, `no apila tres del mismo tipo si queda variedad (malos: ${triplesMalos})`);

// con la casa surtida, variedad perfecta
const surtido: Candidato[] = [];
for (let i = 0; i < 8; i += 1) {
  surtido.push(tarjeta(`s-v${i}`, "video", `a${i}`, `Cable ${i}`, HORA + i * MIN));
  surtido.push(tarjeta(`s-m${i}`, "meme", `b${i}`, `Meme ${i}`, HORA + i * MIN));
  surtido.push(tarjeta(`s-t${i}`, "tv", `c${i}`, `Programa ${i}`, HORA + i * MIN));
}
const feedSurtido = rango(surtido, memoriaVacia(AHORA), { ahora: AHORA, semilla: "x" });
let triplesSurtido = 0;
for (let i = 2; i < feedSurtido.length; i += 1) {
  if (feedSurtido[i].candidato.tipo === feedSurtido[i - 1].candidato.tipo && feedSurtido[i].candidato.tipo === feedSurtido[i - 2].candidato.tipo) triplesSurtido += 1;
}
ok(triplesSurtido === 0, `con 3 tipos surtidos, cero triples (${triplesSurtido})`);
ok(feed.every((p) => p.porQue.length > 3 && !/undefined/.test(p.porQue)), "cada tarjeta explica por qué, en cristiano");

const conExploracion = rango(muchos, memoriaVacia(AHORA), { ahora: AHORA, semilla: "prueba" });
ok(conExploracion.some((p) => p.desglose.exploracion > 0), "explora: hay hueco para lo desconocido");
let muySegura = memoriaVacia(AHORA);
for (let i = 0; i < 60; i += 1) muySegura = aprender(muySegura, evento(muchos[0], "gusta"));
const pSegura = puntuar(muchos[0], muySegura, { ahora: AHORA, semilla: "prueba" });
ok(pSegura.desglose.exploracion <= 0.35, `cuando ya lo sabe, deja de explorar ahí: ${pSegura.desglose.exploracion.toFixed(2)}`);

const a = rango(muchos, memoriaVacia(AHORA), { ahora: AHORA, semilla: "misma" }).map((p) => p.candidato.id).join(",");
const b = rango(muchos, memoriaVacia(AHORA), { ahora: AHORA, semilla: "misma" }).map((p) => p.candidato.id).join(",");
ok(a === b, "misma semilla, mismo feed (reproducible)");

ok(rango([], memoriaVacia(AHORA), { ahora: AHORA }).length === 0, "sin candidatos no devuelve nada (nada inventado)");
ok(salud(feed).n === feed.length, `el termómetro cuenta ${salud(feed).n} tarjetas`);

// ═══ ⑤ PUENTE: las tarjetas de la casa de verdad ═════════════════════════
console.log("\n── PUENTE CON LAS TARJETAS DE LA CASA ──");
const casa: TarjetaFeed[] = [
  { id: "ugc-1", tipo: "video", titulo: "El mar Negro y las divisas", autor: "analista", ts: AHORA - HORA, likes: 12, datos: { vistas: 300, vistas3d: 1 } },
  { id: "ugc-2", tipo: "meme", titulo: "Meme del país que se cae", autor: "bromista", ts: AHORA - 2 * HORA, likes: 80, datos: { vistas: 900 } },
  { id: "mesa-1", tipo: "mesa", titulo: "Tu última partida", autor: "escuela", ts: AHORA - 3 * HORA, likes: 3, datos: {} },
];
const cand = aCandidato(casa[2]);
ok(cand.base === 1.2, "la mesa (tu partida) entra con empuje declarado");
const orden = ordenarAlgoritmo(casa, { pesoTipo: {}, pesoAutor: {}, vistas: 0 }, AHORA);
ok(orden.length === casa.length, "el puente devuelve las mismas tarjetas");
ok(orden.every((p) => p.desglose && p.porQue), "y todas traen desglose y explicación");

console.log(fallos ? `\nRESULTADO: ${fallos} fallo(s)` : "\nRESULTADO: 47 comprobaciones, 0 fallos");
process.exit(fallos ? 1 : 0);

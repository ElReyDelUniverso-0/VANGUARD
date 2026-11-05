#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// CIRUGÍA v343 — LA ESPECIE LIMPIA (vena C, segunda leva)
// Las especies que la v341 registró y no tocó: 5 funciones muertas
// enteras, 4 propiedades privadas escritas-jamás-leídas (la de una
// escrita arraiga también su escritura) y 1 binding con default.
// La ley de la casa (v333): validación doble antes de escribir —
// cada nodo se verifica contra el AST REAL del compilador; un solo
// desajuste = ABORTO sin escribir. El --dry COMPUERTA la escritura
// (lección v339-a). La trivia ajena no se toca (lección v341: la
// leva parte del getStart del primer token), PERO los comentarios
// de línea propios que solo describen al muerto viajan con él.
// ═══════════════════════════════════════════════════════════════
import ts from "typescript";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = "/home/z/my-project";
const DRY = !process.argv.includes("--escribir");

// ── 1. EL PROGRAMA ESTRICTO (la misma lente del censo) ──
const cfgPath = ts.findConfigFile(RAIZ, ts.sys.fileExists, "tsconfig.json");
const cfg = ts.readConfigFile(cfgPath, ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(cfg.config, ts.sys, RAIZ);
const host = ts.createCompilerHost(parsed.options, /*setParentNodes*/ true);
const program = ts.createProgram(parsed.fileNames, {
  ...parsed.options,
  noUnusedLocals: true,
  noUnusedParameters: true,
}, host);
const diags = ts.getPreEmitDiagnostics(program).filter(
  (d) => (d.code === 6133 || d.code === 6196) && d.file,
);

const ediciones = new Map(); // archivo -> [{start, fin, nuevo, motivo, nombre}]
const registro = []; // lo que esta leva NO cura (honestidad)
let curados = 0;

// fin de la LÍNEA que contiene pos + las líneas VACÍAS que le siguen:
// la blancura previa al muerto ya da el salto de la elegancia — si el bloque
// borrado dejara además las vacías de su cola, quedarían DOS saltos
// (lección v341: "dos saltos de la elegancia") — se los come la leva.
function finDeLinea(sf, pos) {
  const t = sf.getFullText();
  let k = pos;
  while (k < t.length && t[k] !== "\n") k++;
  if (k < t.length) k++; // el salto de la propia línea
  // come TODAS las líneas vacías que le siguen: la blancura PREVIA al muerto
  // ya da el único salto de la elegancia — cada vacía de la cola sería un
  // salto doble (lección v341: "dos saltos de la elegancia")
  for (;;) {
    let j = k;
    while (j < t.length && (t[j] === " " || t[j] === "\t")) j++;
    if (t[j] === "\n") { k = j + 1; continue; } // línea vacía: sigue comiendo
    break;
  }
  return k;
}
// el inicio de los comentarios de línea propios inmediatamente encima (o el mismo token)
function inicioConComentariosPropios(sf, inicioToken) {
  const t = sf.getFullText();
  let cursor = inicioToken;
  for (;;) {
    // retrocede la blancura entre el cursor y la línea precedente
    let k = cursor;
    while (k > 0 && (t[k - 1] === " " || t[k - 1] === "\t")) k--;
    if (k === 0 || t[k - 1] !== "\n") return cursor === inicioToken ? inicioToken : cursor;
    const lineIni = t.lastIndexOf("\n", k - 2) + 1;
    const linea = t.slice(lineIni, k - 1);
    if (/^\s*\/\//.test(linea)) cursor = lineIni; // línea de comentario propia: viaja con el muerto
    else return cursor === inicioToken ? inicioToken : cursor;
  }
}

for (const d of diags) {
  const sf = d.file;
  const nodo = ts.getTouchingPropertyName(sf, d.start);
  const nombreDiag = ts.flattenDiagnosticMessageText(d.messageText, " ").match(/'(.+?)'/)?.[1] ?? "?";
  const relArchivo = rel(sf.fileName);

  if (!nodo || !ts.isIdentifier(nodo)) { registro.push({ arch: relArchivo, nombre: nombreDiag, cod: d.code, clase: "no-identificador" }); continue; }
  const nombre = nodo.text;
  const p = nodo.parent;

  const editar = (start, fin, nuevo, motivo) => {
    if (!ediciones.has(relArchivo)) ediciones.set(relArchivo, []);
    ediciones.get(relArchivo).push({ start, fin, nuevo, motivo, nombre });
    curados++;
  };

  // ── FUNCIÓN MUERTA ENTERA (FunctionDeclaration: statement completo) ──
  if (ts.isFunctionDeclaration(p) && p.name === nodo) {
    const ini = inicioConComentariosPropios(sf, p.getFirstToken(sf)?.getStart(sf) ?? p.getStart(sf));
    const fin = finDeLinea(sf, p.getEnd());
    editar(ini, fin, "", "funcion-muerta");
    continue;
  }

  // ── PROPIEDAD PRIVADA muerta (PropertyDeclaration: la declaración entera;
  //     su ESCRITURA this.X = ... se caza aparte con el mismo nombre) ──
  if (ts.isPropertyDeclaration(p) && (ts.isIdentifier(p.name) && p.name.text === nombre)) {
    const ini = inicioConComentariosPropios(sf, p.getFirstToken(sf)?.getStart(sf) ?? p.getStart(sf));
    const fin = finDeLinea(sf, p.getEnd());
    editar(ini, fin, "", "propiedad-privada");
    // la escritura: ExpressionStatement cuya izquierda es this.<nombre>
    const texto = sf.getFullText();
    const visitar = (n) => {
      if (
        ts.isExpressionStatement(n) &&
        ts.isBinaryExpression(n.expression) &&
        n.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
        ts.isPropertyAccessExpression(n.expression.left) &&
        n.expression.left.expression.kind === ts.SyntaxKind.ThisKeyword &&
        n.expression.left.name.text === nombre
      ) {
        editar(inicioConComentariosPropios(sf, n.getFirstToken(sf)?.getStart(sf) ?? n.getStart(sf)), finDeLinea(sf, n.getEnd()), "", "escritura-de-propiedad-muerta");
      }
      ts.forEachChild(n, visitar);
    };
    visitar(sf);
    continue;
  }

  // ── BINDING con default (la prop sigue llegando; el binding se calla):
  //     { brasa = false } → { brasa: _brasa = false } ──
  if (ts.isBindingElement(p) && p.name === nodo && p.initializer && ts.isObjectBindingPattern(p.parent)) {
    const texto = sf.getFullText();
    const cola = texto.slice(nodo.getEnd(), p.getEnd()); // " = false"
    editar(p.getStart(sf), p.getEnd(), `${nombre}: _${nombre}${cola}`, "binding-con-default");
    continue;
  }

  // ── LO QUE ESTA LEVA NO CURA (se registra, no se toca) ──
  let clase = "otro";
  if (ts.isVariableDeclaration(p)) clase = "local-const";
  else if (ts.isParameter(p)) clase = "param";
  else if (ts.isImportSpecifier(p)) clase = "import-specifier";
  else if (ts.isInterfaceDeclaration(p) || ts.isTypeAliasDeclaration(p)) clase = "tipo";
  registro.push({ arch: relArchivo, nombre, cod: d.code, clase });
}

function rel(f) { return f.slice(RAIZ.length + 1); }

// ── 2. VALIDACIÓN DOBLE (ley v333): solapes = ABORTO ──
let aborto = null;
const plan = [];
for (const [arch, lista] of ediciones) {
  lista.sort((a, b) => a.start - b.start);
  for (let i = 1; i < lista.length; i++) {
    if (lista[i].start < lista[i - 1].fin) { aborto = `SOLAPE en ${arch}: ${lista[i - 1].nombre} y ${lista[i].nombre}`; }
  }
  const texto = readFileSync(join(RAIZ, arch), "utf8");
  for (const e of lista) plan.push({ arch, ...e, actual: texto.slice(e.start, e.fin) });
}
if (aborto) { console.error("ABORTO:", aborto); process.exit(1); }

console.log(`HALLAZGOS: ${diags.length} · CURAS PLANIFICADAS: ${curados} · REGISTRADAS (no se tocan): ${registro.length}`);
const motivos = {};
for (const p of plan) motivos[p.motivo] = (motivos[p.motivo] ?? 0) + 1;
console.log("MOTIVOS:", JSON.stringify(motivos));
const clases = {};
for (const r of registro) clases[r.clase] = (clases[r.clase] ?? 0) + 1;
console.log("REGISTRO:", JSON.stringify(clases));

if (DRY) {
  console.log("\n── DRY (plan completo) ──");
  for (const p of plan)
    console.log(`${p.arch}:${p.start} [${p.motivo}] '${p.nombre}' → '${String(p.nuevo).slice(0, 30)}' (había: '${p.actual.slice(0, 60).replace(/\n/g, "⏎")}…')`);
  console.log("\n--dry: NADA ESCRITO (usa --escribir para la leva real)");
  writeFileSync("/tmp/plan-v343.json", JSON.stringify({ plan, registro }, null, 1));
  process.exit(0);
}

// ── 3. LA LEVA (escritura real, desc por posición, archivo por archivo) ──
for (const [arch, lista] of ediciones) {
  const ruta = join(RAIZ, arch);
  let texto = readFileSync(ruta, "utf8");
  const desc = [...lista].sort((a, b) => b.start - a.start);
  for (const e of desc) texto = texto.slice(0, e.start) + e.nuevo + texto.slice(e.fin);
  writeFileSync(ruta, texto);
  console.log(`OPERADO: ${arch} (${lista.length} ediciones)`);
}
console.log(`\nLEVA ESCRITA: ${curados} curas en ${ediciones.size} archivos`);

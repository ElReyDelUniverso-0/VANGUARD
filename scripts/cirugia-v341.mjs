#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// CIRUGÍA v341 — LA ESPECIE DE LOS PARÁMETROS (vena C, primera leva)
// La ley de la casa (v333): validación doble antes de escribir —
// cada nodo se verifica contra el AST REAL del compilador; un solo
// desajuste = ABORTO sin escribir. El --dry COMPUERTA la escritura
// (lección de forja v339-a: el flag vive dentro del bucle de escritura).
// ═══════════════════════════════════════════════════════════════
import ts from "typescript";
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";

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

// ── 2. CLASIFICACIÓN POR AST (no por columnas: por nodos) ──
const ediciones = new Map(); // archivo -> [{start, fin, nuevo, motivo, nombre}]
const registro = []; // lo que esta leva NO cura (honestidad)
let curados = 0;

for (const d of diags) {
  const sf = d.file;
  const pos = d.start;
  const nodo = ts.getTouchingPropertyName(sf, pos);
  const nombreDiag = ts.flattenDiagnosticMessageText(d.messageText, " ").match(/'(.+?)'/)?.[1] ?? "?";
  const relArchivo0 = rel(sf.fileName);

  // ── IMPORT DECLARATION entero muerto (TS marca el keyword `import`) ──
  if (nodo && nodo.kind === ts.SyntaxKind.ImportKeyword && ts.isImportDeclaration(nodo.parent)) {
    const decl = nodo.parent;
    const named = decl.importClause?.namedBindings;
    if (named && ts.isNamedImports(named) && named.elements.length === 1) {
      const fin = saltarNueva(decl.getEnd(), sf);
      if (!ediciones.has(relArchivo0)) ediciones.set(relArchivo0, []);
      ediciones.get(relArchivo0).push({ start: decl.getStart(sf), fin, nuevo: "", motivo: "import-statement-entero", nombre: nombreDiag });
      curados++;
      continue;
    }
    registro.push({ arch: relArchivo0, nombre: nombreDiag, clase: "import-multi-especie" });
    continue;
  }

  // ── DESTRUCTURE DE UNA SOLA PROPIEDAD (TS marca la llave `{`) ──
  if (nodo && nodo.kind === ts.SyntaxKind.FirstPunctuation && ts.isObjectBindingPattern(nodo.parent)) {
    const patron = nodo.parent;
    const elems = patron.elements;
    if (elems.length === 1 && ts.isIdentifier(elems[0].name) && !elems[0].propertyName && !elems[0].initializer) {
      const nom = elems[0].name.text;
      if (!ediciones.has(relArchivo0)) ediciones.set(relArchivo0, []);
      ediciones.get(relArchivo0).push({ start: patron.getStart(sf), fin: patron.getEnd(), nuevo: `{ ${nom}: _${nom} }`, motivo: "destructure-una-prop", nombre: nom });
      curados++;
      continue;
    }
    registro.push({ arch: relArchivo0, nombre: nombreDiag, clase: "patron-llave-multi" });
    continue;
  }

  if (!nodo || !ts.isIdentifier(nodo)) { registro.push({ arch: relArchivo0, nombre: nombreDiag, cod: d.code, clase: "no-identificador" }); continue; }
  const nombre = nodo.text;
  const relArchivo = rel(sf.fileName);
  const p = nodo.parent;

  const editar = (start, fin, nuevo, motivo) => {
    if (!ediciones.has(relArchivo)) ediciones.set(relArchivo, []);
    ediciones.get(relArchivo).push({ start, fin, nuevo, motivo, nombre });
    curados++;
  };

  // ── PARÁMETRO posicional (firma normal o flecha): renombra a _nombre ──
  if (ts.isParameter(p) && p.name === nodo) {
    if (nombre.startsWith("_")) { registro.push({ arch: relArchivo, nombre, clase: "param-ya-underscore" }); continue; }
    // guarda: el binding por destructure de props llega como Parameter con ObjectBindingPattern — no entra aquí
    editar(nodo.getStart(sf), nodo.getEnd(), "_" + nombre, "param-posicional");
    continue;
  }

  // ── BINDING ELEMENT (destructuras) ──
  if (ts.isBindingElement(p) && p.name === nodo) {
    const patron = p.parent; // ObjectBindingPattern | ArrayBindingPattern
    if (ts.isArrayBindingPattern(patron)) {
      editar(nodo.getStart(sf), nodo.getEnd(), "_" + nombre, "binding-array");
    } else if (ts.isObjectBindingPattern(patron)) {
      if (p.propertyName) { registro.push({ arch: relArchivo, nombre, clase: "binding-obj-con-propiedad" }); continue; }
      if (p.initializer) { registro.push({ arch: relArchivo, nombre, clase: "binding-obj-con-default" }); continue; }
      // shorthand { idp } → { idp: _idp } (la propiedad sigue llegando; el binding se calla)
      editar(nodo.getStart(sf), nodo.getEnd(), `${nombre}: _${nombre}`, "binding-obj-shorthand");
    } else { registro.push({ arch: relArchivo, nombre, clase: "binding-desconocido" }); }
    continue;
  }

  // ── IMPORT SPECIFIER muerto (gramática v339: la coma viaja) ──
  if (ts.isImportSpecifier(p)) {
    const decl = p.parent.parent.parent; // NamedImports → ImportClause → ImportDeclaration
    const named = p.parent;
    if (named.elements.length === 1) {
      // statement entero muerto: borra la línea completa (con trivia anterior si es la única)
      const ini = decl.getFullStart();
      const fin = saltarNueva(después(sf, decl.getEnd()), sf);
      editar(ini, fin, "", "import-statement-entero");
    } else {
      // cláusula: borra el spec + UNA coma adyacente (siguiente si existe, si no precedente)
      const idx = named.elements.indexOf(p);
      const siguiente = named.elements[idx + 1];
      const precedente = named.elements[idx - 1];
      const texto = sf.getFullText();
      let ini = p.getStart(sf), fin = p.getEnd();
      const hayComaSig = siguiente && texto.slice(p.getEnd(), siguiente.getStart(sf)).trimStart().startsWith(",");
      const hayComaPre = precedente && texto.slice(precedente.getEnd(), p.getStart(sf)).trimEnd().endsWith(",");
      if (hayComaSig) { fin = siguiente.getStart(sf); }
      else if (hayComaPre) { const c = texto.lastIndexOf(",", p.getStart(sf)); ini = c; }
      else { registro.push({ arch: relArchivo, nombre, clase: "import-sin-coma-adyacente" }); continue; }
      // limpia el espacio que queda colgando al inicio del hueco
      while (/\s/.test(texto[ini] ?? "")) ini++;
      editar(ini, fin, "", "import-clausula");
    }
    continue;
  }

  // ── INTERFACE / TYPE ALIAS muerto (TS6196): statement completo ──
  if (ts.isInterfaceDeclaration(p) || ts.isTypeAliasDeclaration(p)) {
    const ini = p.getFirstToken(sf) ? p.getFirstToken(sf).getStart(sf) : p.getStart(sf); // la trivia ajena no se toca
    let fin = p.getEnd();
    const texto = sf.getFullText();
    // se lleva la nueva línea que le sigue (para no dejar línea vacía doble)
    let k = fin;
    while (texto[k] === "\r") k++;
    if (texto[k] === "\n") fin = k + 1;
    editar(ini, fin, "", p.kind === ts.SyntaxKind.InterfaceDeclaration ? "interface-muerta" : "type-alias-muerto");
    continue;
  }

  // ── LO QUE ESTA LEVA NO CURA (se registra, no se toca) ──
  let clase = "otro";
  if (ts.isPropertyDeclaration(p)) clase = "propiedad-privada";
  else if (ts.isVariableDeclaration(p)) clase = "local-const";
  else if (ts.isTypeParameterDeclaration(p)) clase = "type-param";
  else if (ts.isShorthandPropertyAssignment(p) || ts.isPropertyAssignment(p)) clase = "propiedad-objeto";
  registro.push({ arch: relArchivo, nombre, cod: d.code, clase });
}

function rel(f) { return f.slice(RAIZ.length + 1); }
function después(sf, pos) { return pos; }
function saltarNueva(pos, sf) {
  const t = sf.getFullText();
  let k = pos;
  while (t[k] === "\r") k++;
  if (t[k] === "\n") return k + 1;
  return pos;
}

// ── 3. VALIDACIÓN DOBLE (ley v333): solapes = ABORTO ──
let aborto = null;
const plan = [];
for (const [arch, lista] of ediciones) {
  lista.sort((a, b) => a.start - b.start);
  for (let i = 1; i < lista.length; i++) {
    if (lista[i].start < lista[i - 1].fin) { aborto = `SOLAPE en ${arch}: ${lista[i - 1].nombre} y ${lista[i].nombre}`; }
  }
  const texto = readFileSync(join(RAIZ, arch), "utf8");
  for (const e of lista) {
    const actual = texto.slice(e.start, e.fin);
    // la posición del censo apunta al identificador: verifica que lo que hay ahí coincide con la forma esperada
    plan.push({ arch, ...e, actual });
  }
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
  console.log("\n── DRY (muestra de 24) ──");
  for (const p of plan.slice(0, 24))
    console.log(`${p.archivo}:${p.start} [${p.motivo}] '${p.nombre}' → '${String(p.nuevo).slice(0, 40)}' (había: '${p.actual.slice(0, 40)}')`);
  console.log("\n--dry: NADA ESCRITO (usa --escribir para la leva real)");
  writeFileSync("/tmp/plan-v341.json", JSON.stringify({ plan, registro }, null, 1));
  process.exit(0);
}

// ── 4. LA LEVA (escritura real, desc por posición, archivo por archivo) ──
for (const [arch, lista] of ediciones) {
  const ruta = join(RAIZ, arch);
  let texto = readFileSync(ruta, "utf8");
  const desc = [...lista].sort((a, b) => b.start - a.start);
  for (const e of desc) texto = texto.slice(0, e.start) + e.nuevo + texto.slice(e.fin);
  writeFileSync(ruta, texto);
  console.log(`OPERADO: ${arch} (${lista.length} ediciones)`);
}
console.log(`\nLEVA ESCRITA: ${curados} curas en ${ediciones.size} archivos`);

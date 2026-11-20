// ═══════════════════════════════════════════════════════════════════
// v421.8 · PRUEBAS DE MY UNIVERSE — el motor, sin navegador
//
// El modelo del espacio personal es lógica pura a propósito: se puede
// ejercitar entero en node. Esto comprueba, con datos, lo que la misión pide
// demostrar: crear, mover, redimensionar, agrupar, cambiar distribución,
// guardar y recuperar.
//
// Uso:  node scripts/pruebas-mi-universo.mjs
// (compila el .ts al vuelo con esbuild; la primera vez pide red para bajarlo)
// ═══════════════════════════════════════════════════════════════════
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const RAIZ = resolve(new URL("..", import.meta.url).pathname);
const SALIDA = "/tmp/vanguard-mi-universo-modelo.mjs";

mkdirSync("/tmp", { recursive: true });
if (!existsSync(SALIDA)) {
  const r = spawnSync(
    "npx",
    ["--yes", "esbuild", resolve(RAIZ, "src/lib/mi-universo/modelo.ts"), "--bundle", "--format=esm", `--outfile=${SALIDA}`, "--log-level=error"],
    { stdio: "inherit", cwd: RAIZ },
  );
  if (r.status !== 0) {
    console.error("No se pudo compilar el modelo (¿esbuild sin red?). Prueba: npx esbuild src/lib/mi-universo/modelo.ts --bundle --format=esm --outfile=" + SALIDA);
    process.exit(1);
  }
}

const M = await import(SALIDA);

let pasan = 0;
let fallan = 0;
const prueba = (nombre, fn) => {
  try {
    fn();
    pasan++;
    console.log(`  ✓ ${nombre}`);
  } catch (e) {
    fallan++;
    console.log(`  ✗ ${nombre}\n      ${e instanceof Error ? e.message : e}`);
  }
};
const afirmar = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

/** la garantía central: dos piezas nunca comparten celda */
const sinSolapes = (nucleo) => {
  const p = nucleo.piezas;
  for (let i = 0; i < p.length; i++) {
    for (let j = i + 1; j < p.length; j++) {
      if (M.solapan(p[i], p[j])) throw new Error(`solape: ${p[i].clave} con ${p[j].clave}`);
    }
  }
  for (const pieza of p) {
    afirmar(pieza.col >= 0 && pieza.col + pieza.ancho <= nucleo.columnas, `${pieza.clave} se sale de la parrilla (col ${pieza.col}, ancho ${pieza.ancho}, columnas ${nucleo.columnas})`);
    afirmar(nucleo.zonas.some((z) => z.id === pieza.zona), `${pieza.clave} en zona inexistente`);
  }
};

const CLAVES = ["modulo:conflictos", "modulo:mapa", "modulo:noticias", "sala:/guerra-hoy", "herramienta:espacio-trabajo", "herramienta:perfil-mio"];

console.log("\nMY UNIVERSE · motor del espacio personal\n" + "─".repeat(62));

prueba("nace un espacio válido (3 zonas, 6 piezas, sin solapes)", () => {
  const e = M.espacioNuevo("Mi universo", CLAVES);
  const n = e.nucleos[e.activo];
  afirmar(n.piezas.length === 6, `piezas: ${n.piezas.length}`);
  afirmar(n.zonas.length === 3, `zonas: ${n.zonas.length}`);
  afirmar(new Set(n.piezas.map((p) => p.id)).size === 6, "ids repetidos");
  sinSolapes(n);
});

prueba("añadir una pieza la coloca y no duplica el mismo módulo", () => {
  let n = M.espacioNuevo("x", CLAVES).nucleos.principal;
  const r1 = M.anadirPieza(n, "modulo:leer");
  afirmar(r1.nuevo === true, "no se añadió");
  afirmar(r1.nucleo.piezas.length === 7, "no creció");
  sinSolapes(r1.nucleo);
  const r2 = M.anadirPieza(r1.nucleo, "modulo:leer");
  afirmar(r2.nuevo === false && r2.nucleo.piezas.length === 7, "duplicó la misma puerta");
  afirmar(r2.id === r1.id, "no devolvió la pieza existente");
  n = r2.nucleo;
  afirmar(n.piezas.length === 7, "estado inconsistente");
});

prueba("mover sobre una pieza ocupada INTERCAMBIA (no expulsa ni duplica)", () => {
  const n0 = M.espacioNuevo("x", CLAVES).nucleos.principal;
  const a = n0.piezas[0];
  const b = n0.piezas[1];
  const n1 = M.moverPieza(n0, a.id, { zona: b.zona, col: b.col, fila: b.fila });
  afirmar(n1.piezas.length === n0.piezas.length, "se perdió una pieza");
  sinSolapes(n1);
  const aDespues = n1.piezas.find((p) => p.id === a.id);
  afirmar(aDespues.zona === b.zona, "la movida no llegó a la zona destino");
});

prueba("mover a otra zona funciona y la zona se recoloca", () => {
  const n0 = M.espacioNuevo("x", CLAVES).nucleos.principal;
  const p = n0.piezas[0];
  const destino = n0.zonas[2].id;
  const n1 = M.moverPieza(n0, p.id, { zona: destino, col: 0, fila: 0 });
  afirmar(n1.piezas.find((x) => x.id === p.id).zona === destino, "no cambió de zona");
  sinSolapes(n1);
});

prueba("redimensionar respeta límites y reacomoda", () => {
  const n0 = M.espacioNuevo("x", CLAVES).nucleos.principal;
  const p = n0.piezas[0];
  const grande = M.redimensionar(n0, p.id, 99, 99);
  const g = grande.piezas.find((x) => x.id === p.id);
  afirmar(g.ancho === grande.columnas, `ancho ${g.ancho} > columnas ${grande.columnas}`);
  afirmar(g.alto === 3, `alto ${g.alto}`);
  sinSolapes(grande);
  const pequena = M.redimensionar(grande, p.id, 1, 1);
  afirmar(pequena.piezas.find((x) => x.id === p.id).ancho === 1, "no encogió");
  sinSolapes(pequena);
});

prueba("quitar una pieza quita el ACCESO y no toca las demás", () => {
  const n0 = M.espacioNuevo("x", CLAVES).nucleos.principal;
  const victima = n0.piezas[2];
  const n1 = M.quitarPieza(n0, victima.id);
  afirmar(n1.piezas.length === n0.piezas.length - 1, "no se quitó");
  afirmar(!n1.piezas.some((p) => p.id === victima.id), "sigue ahí");
  afirmar(n1.piezas.every((p) => p.clave !== victima.clave), "la clave sigue presente");
  sinSolapes(n1);
});

prueba("favoritos: se marcan y suben al principio de su zona", () => {
  const n0 = M.espacioNuevo("x", CLAVES).nucleos.principal;
  const p = n0.piezas[4];
  const n1 = M.alternarFavorito(n0, p.id);
  afirmar(n1.piezas.find((x) => x.id === p.id).favorito === true, "no se marcó");
  const zona = n1.piezas.filter((x) => x.zona === p.zona);
  afirmar(zona[0].id === p.id, "el favorito no quedó primero de su zona");
  sinSolapes(n1);
});

prueba("zonas: crear, renombrar y quitar SIN perder piezas", () => {
  const n0 = M.espacioNuevo("x", CLAVES).nucleos.principal;
  const z = M.crearZona(n0, "seguimiento");
  afirmar(z.zonas.length === 4, "no se creó");
  const zid = z.zonas[3].id;
  const mudada = z.piezas[0].id;
  const conPieza = M.moverPieza(z, mudada, { zona: zid, col: 0, fila: 0 });
  const quitada = M.quitarZona(conPieza, zid);
  afirmar(quitada.zonas.length === 3, "no se quitó");
  afirmar(quitada.piezas.length === conPieza.piezas.length, "se perdieron piezas al quitar la zona");
  // solo se muda la pieza que vivía en la zona retirada; las demás siguen en la suya
  afirmar(quitada.piezas.find((p) => p.id === mudada).zona === quitada.zonas[0].id, "la pieza de la zona retirada no se mudó a la primera");
  afirmar(quitada.piezas.every((p) => quitada.zonas.some((z2) => z2.id === p.zona)), "quedó una pieza en una zona inexistente");
  sinSolapes(quitada);
});

prueba("las cuatro distribuciones conservan contenido y no solapan", () => {
  const base = M.espacioNuevo("x", [...CLAVES, "modulo:leer", "modulo:jugar"]).nucleos.principal;
  for (const d of M.DISTRIBUCIONES) {
    const n = M.aplicarDistribucion(base, d.clave);
    afirmar(n.piezas.length === base.piezas.length, `${d.clave}: perdió piezas`);
    afirmar(new Set(n.piezas.map((p) => p.clave)).size === base.piezas.length, `${d.clave}: cambió el contenido`);
    sinSolapes(n);
  }
});

prueba("restaurar el trazado original conserva piezas y tema", () => {
  const n0 = M.cambiarTema(M.espacioNuevo("x", CLAVES).nucleos.principal, "jade");
  const desorden = M.aplicarDistribucion(n0, "torre");
  const original = M.restaurarOriginal(desorden);
  afirmar(original.tema === "jade", "perdió el tema");
  afirmar(original.piezas.length === n0.piezas.length, "perdió piezas");
  afirmar(new Set(original.piezas.map((p) => p.clave)).size === n0.piezas.length, "cambió el contenido");
  sinSolapes(original);
});

prueba("instantánea: guardar, romper, recuperar (vuelve exactamente)", () => {
  let e = M.espacioNuevo("x", CLAVES);
  const antes = JSON.stringify(e.nucleos[e.activo].piezas);
  e = M.crearInstantanea(e, "estado bueno");
  afirmar(e.instantaneas.length === 1, "no se guardó la copia");
  // ahora rompemos el trazado a propósito
  e = M.editarActivo(e, (n) => M.aplicarDistribucion(n, "lectura"));
  afirmar(JSON.stringify(e.nucleos[e.activo].piezas) !== antes, "la copia no cambió nada (prueba inválida)");
  e = M.recuperarInstantanea(e, e.instantaneas[0].id);
  afirmar(JSON.stringify(e.nucleos[e.activo].piezas) === antes, "no volvió al estado guardado");
});

prueba("espacios independientes: crear, cambiar y borrar (nunca a cero)", () => {
  let e = M.espacioNuevo("x", CLAVES);
  const { espacio, clave } = M.crearNucleo(e, "Guerra", ["modulo:conflictos"]);
  e = espacio;
  afirmar(Object.keys(e.nucleos).length === 2, "no se creó el espacio");
  afirmar(e.activo === clave, "no se abrió el nuevo");
  e = M.abrirNucleo(e, "principal");
  afirmar(e.activo === "principal", "no volvió");
  e = M.borrarNucleo(e, clave);
  afirmar(Object.keys(e.nucleos).length === 1, "no se borró");
  const igual = M.borrarNucleo(e, e.activo);
  afirmar(Object.keys(igual.nucleos).length === 1, "se quedó sin espacios");
});

prueba("guardar y recuperar: serializar → deserializar es idéntico", () => {
  const e = M.crearInstantanea(M.espacioNuevo("x", CLAVES), "c1");
  const texto = M.serializar(e);
  const vuelta = M.deserializar(texto);
  afirmar(vuelta !== null, "no se pudo leer lo que se guardó");
  afirmar(JSON.stringify(vuelta) === JSON.stringify(e), "el ida y vuelta cambió algo");
});

prueba("un archivo roto NO puede romper el espacio", () => {
  afirmar(M.deserializar("no soy json") === null, "aceptó basura");
  afirmar(M.deserializar("{}") === null, "aceptó un objeto vacío");
  afirmar(M.deserializar(JSON.stringify({ nucleos: { a: { zonas: [], piezas: [] } } })) === null, "aceptó un núcleo sin zonas");
});

prueba("importar recorta lo imposible (col -5, ancho 99, alto 9, zona fantasma)", () => {
  const bruto = {
    version: 1,
    activo: "principal",
    nucleos: {
      principal: {
        nombre: "Importado",
        tema: "tema-que-no-existe",
        columnas: 99,
        zonas: [{ id: "z1", nombre: "Uno" }],
        piezas: [
          { id: "p1", clave: "modulo:mapa", zona: "z1", col: -5, fila: -2, ancho: 99, alto: 9, favorito: "sí" },
          { id: "p2", clave: "", zona: "zona-fantasma", col: 3, fila: 1, ancho: 2, alto: 1 },
        ],
      },
    },
    instantaneas: [],
  };
  const e = M.deserializar(JSON.stringify(bruto));
  afirmar(e !== null, "rechazó un importable recuperable");
  const n = e.nucleos[e.activo];
  afirmar(n.tema === "obsidiana", "no corrigió el tema");
  afirmar(n.columnas === 8, "no corrigió las columnas");
  afirmar(n.piezas.length === 1, `debería quedarse con 1 pieza válida, quedaron ${n.piezas.length}`);
  afirmar(n.piezas[0].ancho <= n.columnas && n.piezas[0].alto <= 3, "no recortó el tamaño");
  afirmar(n.piezas[0].col >= 0, "no corrigió la columna");
  afirmar(n.piezas[0].favorito === false, "aceptó un booleano falso");
  sinSolapes(n);
});

prueba("resumen cuenta lo que hay", () => {
  const e = M.espacioNuevo("x", CLAVES);
  const r = M.resumen(e);
  afirmar(r.piezas === 6 && r.zonas === 3 && r.espacios === 1 && r.instantaneas === 0, JSON.stringify(r));
});

console.log("─".repeat(62));
console.log(pasan + " pasan · " + fallan + " fallan");
process.exit(fallan ? 1 : 0);

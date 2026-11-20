#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════
// tools/tsc-acotado.mjs · EL TYPECHECK POR ESCOPOS
//
// PARA QUÉ: la casa entera no se puede comprobar en una máquina de 2 GB —
// `tsc --noEmit` sobre todo `src/` y `next build` mueren por falta de memoria
// (queda escrito en el worklog de varias misiones). Este envoltorio genera un
// tsconfig temporal limitado a un escopo y lanza el compilador de la casa con
// él, con un tope de heap explícito. No cambia ni un pelo lo que comprueba
// `npm run build`: es la misma herramienta, con menos ficheros a la vez.
//
// CÓMO SE USA:
//   node tools/tsc-acotado.mjs resiliencia        # el centro, entero (lib+ui+rutas+API)
//   node tools/tsc-acotado.mjs resiliencia --extra src/app/sitemap.ts
//   node tools/tsc-acotado.mjs nucleo
// Sale 0 si no hay errores; imprime los que haya con su línea.
// ═══════════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, unlinkSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const RAIZ = process.cwd();

/** Los escopos conocidos. Uno nuevo se añade aquí, no en un script suelto. */
const ESCOPOS = {
  resiliencia: [
    "src/lib/resiliencia/**/*.ts",
    "src/components/resiliencia/**/*.tsx",
    "src/app/resiliencia/**/*.tsx",
    "src/app/api/resiliencia/**/*.ts",
  ],
  nucleo: ["src/lib/nucleo/**/*.ts", "src/app/nucleo/**/*.tsx"],
  navegacion: ["src/lib/navegacion/**/*.ts", "src/app/navegacion/**/*.tsx", "src/app/espacio/**/*.tsx"],
  arquitectura: ["src/lib/arquitectura/**/*.ts", "src/app/arquitectura/**/*.tsx", "src/app/sitemap.ts"],
  portada: ["src/components/portada/**/*.ts", "src/components/portada/**/*.tsx", "src/app/page.tsx"],
  api: ["src/lib/api/**/*.ts", "src/app/api/sistema/**/*.ts"],
};

const argv = process.argv.slice(2);
const nombre = argv.find((a) => !a.startsWith("--")) ?? "";
const extra = [];
for (let i = 0; i < argv.length; i++) if (argv[i] === "--extra") extra.push(argv[++i]);

if (!ESCOPOS[nombre] && extra.length === 0) {
  console.error(`escopo desconocido: «${nombre}». Conocidos: ${Object.keys(ESCOPOS).join(", ")}.`);
  console.error("O usa --extra <ruta> para comprobar ficheros sueltos.");
  process.exit(2);
}

const incluye = [...(ESCOPOS[nombre] ?? []), ...extra];
const base = JSON.parse(readFileSync(join(RAIZ, "tsconfig.json"), "utf8"));
const opts = { ...base.compilerOptions, incremental: false, noEmit: true, skipLibCheck: true, plugins: [] };
const temporal = join(RAIZ, "tsconfig.acotado.tmp.json");
writeFileSync(temporal, JSON.stringify({ compilerOptions: opts, include: incluye, exclude: ["node_modules"] }, null, 1));

const tsc = join(RAIZ, "node_modules", "typescript", "lib", "tsc.js");
if (!existsSync(tsc)) {
  console.error("no hay typescript instalado: `npm ci` antes de comprobar.");
  unlinkSync(temporal);
  process.exit(2);
}

// Un tope de heap declarado, no una sorpresa: 1,2 GB es lo que cabe en una
// caja de 2 GB junto al servidor de desarrollo.
const hijos = ["--max-old-space-size=1200", tsc, "-p", temporal];
const res = spawnSync(process.execPath, hijos, { cwd: RAIZ, stdio: "inherit" });
try {
  unlinkSync(temporal);
} catch {
  /* si no se borra, es basura inofensiva: el nombre lo dice */
}

if (res.status === 0) {
  console.log(`typecheck acotado (${nombre || "extra"}) · ${incluye.length} patrón(es) · SIN ERRORES`);
}
process.exit(res.status ?? 1);

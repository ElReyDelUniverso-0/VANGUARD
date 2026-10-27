#!/usr/bin/env node
/**
 * GUARDIÁN DE INTEGRIDAD — v182.0 (rescate #5)
 * La plataforma revierte el workspace a checkpoints viejos (v173 etc.) cada ~1-2h:
 * 5 veces detectadas (rescate2/3/4/5). Este guardián detecta la reversión y aplica
 * la RECETA CASA solo, cada 5 minutos.
 *
 * VERDAD ÚNICA: origin/main (ley v170/v172: main manda).
 *   1. Cada 5 min: git fetch + compara APP_VERSION de version.ts en DISCO vs origin/main.
 *   2. Si difieren Y el árbol está LIMPIO (sin trabajo local sin commit) → reversión
 *      detectada → respaldo db → reset --hard origin/main → restaura db → rebuild →
 *      relevo del server → relanza vigilante.mjs.
 *   3. Si el árbol tiene trabajo local (una ronda en curso) → NO TOCA NADA y lo
 *      registra (nunca se come el trabajo del Dueño o de la IA).
 *   4. Si health.version != version.ts en disco (server viejo, código nuevo) →
 *      relevo del server con el build existente (sin reset).
 *
 * Log: /tmp/guardian-integridad.log
 */

import { execSync, spawn } from 'node:child_process';
import { readFileSync, existsSync, copyFileSync } from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(process.cwd());
const LOG = '/tmp/guardian-integridad.log';
const INTERVALO = 5 * 60 * 1000; // 5 min
const RSS_TOPE = 900; // MB — igual que vigilante.mjs

function log(msg) {
  const linea = `[${new Date().toISOString()}] ${msg}`;
  try { console.log(linea); } catch {}
  try { execSync(`echo ${JSON.stringify(linea)} >> ${LOG}`); } catch {}
}

function sh(cmd, opts = {}) {
  return execSync(cmd, { cwd: RAIZ, encoding: 'utf8', timeout: opts.timeout ?? 60000, ...opts }).trim();
}

function versionDe(texto) {
  const m = texto.match(/APP_VERSION\s*=\s*["']([^"']+)["']/);
  return m ? m[1] : null;
}

async function health() {
  try {
    const r = await fetch('http://localhost:3000/api/health', { signal: AbortSignal.timeout(8000) });
    return await r.json();
  } catch { return null; }
}

let RESCATANDO = false;

async function relevarServer(motivo) {
  log(`RELEVO SERVER (${motivo})`);
  try { sh("pkill -f 'next-server' || true"); sh("pkill -f 'serve.mjs' || true"); } catch {}
  await new Promise(r => setTimeout(r, 2000));
  spawn('node', ['scripts/serve.mjs', '--prod'], {
    cwd: RAIZ, detached: true, stdio: 'ignore',
    env: { ...process.env, NODE_OPTIONS: '2600' },
  }).unref();
  await new Promise(r => setTimeout(r, 12000));
  const h = await health();
  log(`RELEVO LISTO → ${h ? `ok:${h.ok} v${h.version} rss:${h.rss}` : 'SIN RESPUESTA'}`);
  // vigilante vivo
  try {
    const v = sh('pgrep -fa vigilante.mjs || true');
    if (!v) {
      spawn('node', ['scripts/vigilante.mjs'], { cwd: RAIZ, detached: true, stdio: 'ignore' }).unref();
      log('VIGILANTE relanzado');
    }
  } catch {}
}

async function recetaCasa(motivo) {
  if (RESCATANDO) return;
  RESCATANDO = true;
  log(`############ REVERSIÓN DETECTADA (${motivo}) — RECETA CASA ############`);
  try {
    copyFileSync(path.join(RAIZ, 'db/custom.db'), '/tmp/db.guardian-backup');
    log('DB respaldada → /tmp/db.guardian-backup');
    sh('git fetch origin', { timeout: 120000 });
    const estado = sh('git status --porcelain || true');
    if (estado) {
      log('TRABAJO LOCAL SIN COMMIT detectado tras fetch — NO toco nada (protección de rondas).');
      RESCATANDO = false;
      return;
    }
    sh('git reset --hard origin/main', { timeout: 120000 });
    log('Reset a origin/main hecho');
    copyFileSync('/tmp/db.guardian-backup', path.join(RAIZ, 'db/custom.db'));
    log('DB viva restaurada');
    try { sh("pkill -f 'next-server' || true"); sh("pkill -f 'serve.mjs' || true"); } catch {}
    await new Promise(r => setTimeout(r, 2000));
    log('BUILD iniciado…');
    try {
      sh('NODE_OPTIONS=2600 npm run build', { timeout: 10 * 60 * 1000 });
      log('BUILD EXIT 0');
    } catch (e) {
      log(`BUILD FALLÓ: ${e.message?.slice(0, 200)}`);
      RESCATANDO = false;
      return;
    }
    await relevarServer('post-reset');
    log('############ RECETA CASA COMPLETA ############');
  } catch (e) {
    log(`ERROR EN RECETA: ${e.message?.slice(0, 300)}`);
  }
  RESCATANDO = false;
}

async function chequeo() {
  if (RESCATANDO) { log('chequeo saltado: receta en curso'); return; }
  try {
    // 1) verdad remota
    try {
      sh('git fetch origin', { timeout: 120000 });
      const verRemota = versionDe(sh('git show origin/main:src/lib/version.ts'));
      const verDisco = versionDe(readFileSync(path.join(RAIZ, 'src/lib/version.ts'), 'utf8'));
      if (verRemota && verDisco && verRemota !== verDisco) {
        await recetaCasa(`version.ts disco ${verDisco} != origin/main ${verRemota}`);
        return;
      }
    } catch (e) {
      log(`fetch/show falló (sin red o git roto): ${e.message?.slice(0, 120)}`);
    }
    // 2) server vivo y coherente
    const h = await health();
    if (!h || !h.ok) {
      const buildId = existsSync(path.join(RAIZ, '.next/BUILD_ID'));
      if (buildId) { await relevarServer('health sin respuesta'); }
      else { log('health caído y .next sin BUILD_ID — espero a la receta por versión'); }
      return;
    }
    const verDisco2 = versionDe(readFileSync(path.join(RAIZ, 'src/lib/version.ts'), 'utf8'));
    if (verDisco2 && h.version !== verDisco2) {
      await relevarServer(`server v${h.version} != disco v${verDisco2}`);
      return;
    }
    if (typeof h.rss === 'number' && h.rss >= RSS_TOPE) {
      await relevarServer(`rss ${h.rss} >= ${RSS_TOPE}`);
      return;
    }
    log(`sano: v${h.version} rss:${h.rss} uptime:${Math.round(h.uptime / 60)}min`);
  } catch (e) {
    log(`ERROR EN CHEQUEO: ${e.message?.slice(0, 200)}`);
  }
}

log('GUARDIÁN DE INTEGRIDAD arrancado (cada 5 min, verdad = origin/main)');
chequeo();
setInterval(chequeo, INTERVALO);

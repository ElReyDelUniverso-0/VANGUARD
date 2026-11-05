#!/bin/bash
# QA v311.0 LA TERCERA QUIRURGÍA — ley v302: arranque + suite + cierre en UNA llamada
set -u
cd /home/z/my-project
PORT=3496
BASE="http://localhost:$PORT"
DB="db/custom.db"

echo "── 0) SINTAXIS DEL ARNÉS ──"
node --check scripts/pruebas-nucleo.mjs && echo "suite: sintaxis OK"

echo "── 1) TSC TOTAL (sin caché) ──"
npx tsc --noEmit --incremental false > /tmp/tsc-v311.log 2>&1
echo "TSC_EXIT=$? · $(wc -l < /tmp/tsc-v311.log) líneas de salida"

echo "── 2) LINT: tocados + censo canónico del árbol ──"
npx eslint src/components/vanguard/panels/maquina-panel.tsx eslint.config.mjs src/lib/version.ts 2>&1 | tail -2
echo "TOCADOS_EXIT=$? (0 y vacío = limpios)"
npx eslint . --format json 2>/dev/null | python3 -c "
import json, sys
data = json.load(sys.stdin)
ss, memo, otros, warns = [], [], [], 0
for f in data:
    for m in f['messages']:
        if m['severity'] != 2:
            warns += 1; continue
        ruta = f['filePath'].replace('/home/z/my-project/', '')
        if 'setState synchronously' in m['message']: ss.append(ruta + ':' + str(m['line']))
        elif 'memoization' in m['message']: memo.append(ruta + ':' + str(m['line']))
        else: otros.append(ruta + ':' + str(m['line']))
print('CENSO CANÓNICO: set-state', len(ss), '· memorias', len(memo), '· otros errores', len(otros), '· avisos', warns)
assert len(ss) == 11, 'censo set-state ≠ 11 (la deuda de la v311)'
assert len(memo) == 4, 'censo memorias ≠ 4'
assert len(otros) == 0, 'errores desconocidos: ' + str(otros)
print('CENSO OK: 11 set-state + 4 memorias + 0 otros (deuda 12 → 11 confirmada)')
"

echo "── 3) TESTIGO BD ANTES ──"
python3 -c "
import sqlite3
c = sqlite3.connect('db/custom.db')
print('cables', c.execute('SELECT COUNT(*) FROM NewsItem').fetchone()[0], '· hechos', c.execute('SELECT COUNT(*) FROM Acontecimiento').fetchone()[0])
"

echo "── 4) ARRANQUE ──"
PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa-v311.log 2>&1 &
SRVPID=$!
ARRIBA=0
for i in $(seq 1 25); do
  sleep 1
  if curl -s -o /dev/null "$BASE/api/health"; then ARRIBA=1; break; fi
done
echo "boot=$ARRIBA pid=$SRVPID"
if [ "$ARRIBA" != "1" ]; then echo "SIN SERVIDOR — ABORTO"; kill -9 $SRVPID 2>/dev/null; exit 1; fi
curl -s "$BASE/api/health"; echo

echo "── 5) SUITE COMPLETA (argv BASE) ──"
node scripts/pruebas-nucleo.mjs "$BASE" > /tmp/suite-v311.log 2>&1
SUITE_EXIT=$?
tail -4 /tmp/suite-v311.log
echo "SUITE_EXIT=$SUITE_EXIT"

echo "── 6) CABECERAS VIVAS ──"
curl -sI "$BASE/" | grep -iE 'permissions-policy|x-frame|nosniff|referrer' | head -4

echo "── 7) TESTIGO BD DESPUÉS ──"
python3 -c "
import sqlite3
c = sqlite3.connect('db/custom.db')
print('cables', c.execute('SELECT COUNT(*) FROM NewsItem').fetchone()[0], '· hechos', c.execute('SELECT COUNT(*) FROM Acontecimiento').fetchone()[0])
"

echo "── 8) CIERRE POR PID ──"
kill "$SRVPID" 2>/dev/null; sleep 1; kill -9 "$SRVPID" 2>/dev/null
curl -s -o /dev/null --max-time 2 "$BASE/api/health" && echo "PUERTO AÚN VIVO (zombi)" || echo "puerto 3496 libre — cero zombis"
echo "QA FIN"

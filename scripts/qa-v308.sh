#!/bin/bash
# QA v308.0 EL ESPEJO DEL NAVEGADOR — ley v302: arranque + suite + cierre en UNA llamada
set -u
cd /home/z/my-project
PORT=3496
BASE="http://localhost:$PORT"
DB="db/custom.db"

echo "── 0) SINTAXIS DEL ARNÉS ──"
node --check scripts/pruebas-nucleo.mjs && echo "suite: sintaxis OK"

echo "── 1) TSC TOTAL (sin caché) ──"
npx tsc --noEmit --incremental false > /tmp/tsc-v308.log 2>&1
echo "TSC_EXIT=$? · $(wc -l < /tmp/tsc-v308.log) líneas de salida"

echo "── 2) TESTIGO BD ANTES ──"
ANTES=$(python3 -c "
import sqlite3
c = sqlite3.connect('db/custom.db')
print('cables', c.execute('SELECT COUNT(*) FROM NewsItem').fetchone()[0], '· hechos', c.execute('SELECT COUNT(*) FROM Acontecimiento').fetchone()[0])
")
echo "ANTES: $ANTES"

echo "── 3) ARRANQUE ──"
PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa-v308.log 2>&1 &
SRVPID=$!
ARRIBA=0
for i in $(seq 1 25); do
  sleep 1
  if curl -s -o /dev/null "$BASE/api/health"; then ARRIBA=1; break; fi
done
echo "boot=$ARRIBA pid=$SRVPID"
if [ "$ARRIBA" != "1" ]; then echo "SIN SERVIDOR — ABORTO"; kill -9 $SRVPID 2>/dev/null; exit 1; fi
curl -s "$BASE/api/health"; echo

echo "── 4) SUITE COMPLETA (argv BASE) ──"
node scripts/pruebas-nucleo.mjs "$BASE" > /tmp/suite-v308.log 2>&1
SUITE_EXIT=$?
tail -6 /tmp/suite-v308.log
echo "SUITE_EXIT=$SUITE_EXIT"

echo "── 5) CABECERAS VIVAS ──"
curl -sI "$BASE/" | rg -i 'permissions-policy|x-frame|nosniff|referrer' | head -4

echo "── 6) TESTIGO BD DESPUÉS ──"
DESPUES=$(python3 -c "
import sqlite3
c = sqlite3.connect('db/custom.db')
print('cables', c.execute('SELECT COUNT(*) FROM NewsItem').fetchone()[0], '· hechos', c.execute('SELECT COUNT(*) FROM Acontecimiento').fetchone()[0])
")
echo "DESPUES: $DESPUES"

echo "── 7) CIERRE POR PID ──"
kill "$SRVPID" 2>/dev/null; sleep 1; kill -9 "$SRVPID" 2>/dev/null
curl -s -o /dev/null --max-time 2 "$BASE/api/health" && echo "PUERTO AÚN VIVO (zombi)" || echo "puerto 3496 libre — cero zombis"
echo "QA FIN"

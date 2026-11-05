#!/bin/bash
# QA VISUAL v310-b — EL BONO ABRE (la prueba crítica de la segunda quirurgía)
set -u
PORT=3496
BASE="http://localhost:$PORT"
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa310b.log 2>&1 &
SRVPID=$!
for i in $(seq 1 25); do sleep 1; curl -s -o /dev/null "$BASE/api/health" && break; done

agent-browser console --clear >/dev/null 2>&1
agent-browser errors --clear >/dev/null 2>&1
agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 4
agent-browser eval "(() => { sessionStorage.setItem('vanguard-booted','1'); localStorage.removeItem('vanguard-game-state-v1'); return 'operador nuevo + boot marcado'; })()" >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1

for t in 12 20 30 40 50; do
  sleep $(( t - $(echo) )) 2>/dev/null || true
done
# muestreo con paciencia: 15, 25, 35, 45, 55 s
ESPERA=0
for t in 15 10 10 10 10; do
  sleep $t; ESPERA=$((ESPERA + t))
  R=$(agent-browser eval "(() => { const dlg = [...document.querySelectorAll('[role=dialog]')].find(d => (d.textContent||'').includes('Reconexión diaria')); return (dlg ? 'BONO ABIERTO' : 'pendiente') + ' · ciudad=' + document.documentElement.hasAttribute('data-vg-ciudad') + ' · entrada=' + document.documentElement.getAttribute('data-wgl-entrada'); })()" 2>&1 | head -1)
  echo "t=${ESPERA}s: $R"
  echo "$R" | rg -q 'BONO ABIERTO' && break
done
echo "── consola ──"
agent-browser console 2>&1 | rg -i '\[error\]|\[warning\]' | rg -v 'Download the React DevTools' | head -3 || echo "CONSOLA LIMPIA"
agent-browser errors 2>&1 | head -3; echo "(vacío = sin errores)"

agent-browser close >/dev/null 2>&1
kill "$SRVPID" 2>/dev/null; sleep 1; kill -9 "$SRVPID" 2>/dev/null
echo "QA VISUAL v310-b FIN"

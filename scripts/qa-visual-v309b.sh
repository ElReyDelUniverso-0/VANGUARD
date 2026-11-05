#!/bin/bash
# QA VISUAL v309-b — LA FILA CERO (la puerta montado de la quirurgía)
set -u
PORT=3496
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa309b.log 2>&1 &
SRVPID=$!
for i in $(seq 1 25); do sleep 1; curl -s -o /dev/null "$BASE/api/health" && break; done

agent-browser console --clear >/dev/null 2>&1
agent-browser errors --clear >/dev/null 2>&1
agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 8

echo "── fijar DOS favoritos por storage (formato real de la tienda) y recargar ──"
agent-browser storage local set vg171-favoritos '{"state":{"favoritos":["radio","mapa"]},"version":0}' >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 8

echo "── fila cero: los favoritos viven ANTES que los hermanos ──"
agent-browser eval "document.querySelectorAll('.vg171-fav-pill').length + ' en fila cero'" 2>&1 | head -1
agent-browser eval "(() => { const f = [...document.querySelectorAll('.vg171-fav-pill')].map(p => p.textContent?.trim().slice(0,14)); return JSON.stringify(f); })()" 2>&1 | head -1
echo "── y NO están duplicados en la fila de hermanos ──"
agent-browser eval "(() => { const todos = [...document.querySelectorAll('.vg170-riel-pill')].map(p => p.textContent?.trim()); const radios = todos.filter(tx => tx?.includes('RADIO')).length; return 'píldoras RADIO totales: ' + radios + ' (1 = sin duplicado)'; })()" 2>&1 | head -1
echo "── recientes: la Cama aprende y el riel las muestra ──"
agent-browser eval "document.querySelectorAll('.vg170-riel-recpill').length + ' recientes'" 2>&1 | head -1
echo "── consola (limpia = la puerta no rompe hidratación con favoritos) ──"
agent-browser console 2>&1 | rg -i '\[error\]|\[warning\]' | rg -v 'Download the React DevTools' | head -4 || echo "CONSOLA LIMPIA"
agent-browser errors 2>&1 | head -3; echo "(vacío = sin errores)"
agent-browser screenshot /tmp/render/qa309b-fila-cero.png >/dev/null 2>&1

agent-browser storage local clear >/dev/null 2>&1
agent-browser close >/dev/null 2>&1
kill "$SRVPID" 2>/dev/null; sleep 1; kill -9 "$SRVPID" 2>/dev/null
echo "QA VISUAL-b FIN"

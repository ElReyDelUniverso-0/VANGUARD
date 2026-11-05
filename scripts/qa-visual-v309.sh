#!/bin/bash
# QA VISUAL v309 — LA PRIMERA QUIRURGÍA (riel-seccion)
# Ley v302: arranque + cirugía visual + cierre en UNA llamada.
# Verifica: SSR del riel, plegado con memoria, persistencia tras reload,
# fila cero de favoritos, y consola limpia (sin errores de hidratación).
set -u
PORT=3496
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa309.log 2>&1 &
SRVPID=$!
for i in $(seq 1 25); do sleep 1; curl -s -o /dev/null "$BASE/api/health" && break; done
echo "SALUD: $(curl -s "$BASE/api/health")"

agent-browser console --clear >/dev/null 2>&1
agent-browser errors --clear >/dev/null 2>&1
agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 9

echo "── 1) SSR: el riel nace desplegado y sin plegar ──"
curl -s "$BASE/" | rg -o 'data-vg-riel="1" data-vg-riel-plegado="0"' | head -1 || echo "FALTA EL RIEL EN EL SSR"

echo "── 2) CONSOLA tras hidratación (limpia = quirugía sana) ──"
agent-browser console 2>&1 | rg -i '\[error\]|\[warning\]' | rg -v 'Download the React DevTools' | head -5 || echo "CONSOLA LIMPIA"
agent-browser errors 2>&1 | head -4 || true

echo "── 3) FAVORITOS EN FILA CERO (la puerta montado respira) ──"
agent-browser eval "document.querySelector('[data-vg-riel]') ? 'riel vivo' : 'riel muerto'" 2>&1 | head -1
agent-browser eval "document.querySelectorAll('.vg171-fav-pill').length + ' favoritos en fila cero'" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa309-riel-desplegado.png >/dev/null 2>&1

echo "── 4) PLEGAR → atributo + memoria ──"
agent-browser eval "(() => { const b = document.querySelector('.vg170-riel-plegar'); if (!b) return 'sin boton'; b.click(); return 'click dado'; })()" 2>&1 | head -1
sleep 1
agent-browser eval "document.querySelector('[data-vg-riel]')?.getAttribute('data-vg-riel-plegado')" 2>&1 | head -1
agent-browser eval "(() => { try { return 'localStorage=' + localStorage.getItem('vg170-riel'); } catch { return 'sin storage'; } })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa309-riel-plegado.png >/dev/null 2>&1

echo "── 5) RECARGA → el plegado sobrevive (snapshot del cliente) ──"
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 7
agent-browser eval "document.querySelector('[data-vg-riel]')?.getAttribute('data-vg-riel-plegado')" 2>&1 | head -1

echo "── 6) DESPLEGAR de nuevo (estado honesto restaurado) ──"
agent-browser eval "(() => { const b = document.querySelector('.vg170-riel-plegar'); b?.click(); return 'ok'; })()" 2>&1 | head -1
sleep 1
agent-browser eval "document.querySelector('[data-vg-riel]')?.getAttribute('data-vg-riel-plegado')" 2>&1 | head -1
agent-browser eval "(() => { try { localStorage.removeItem('vg170-riel'); return 'storage limpio'; } catch { return 'x'; } })()" 2>&1 | head -1

echo "── 7) ERRORES DE PÁGINA al final ──"
agent-browser errors 2>&1 | head -4; echo "(vacío = sin errores)"

agent-browser close >/dev/null 2>&1
kill "$SRVPID" 2>/dev/null; sleep 1; kill -9 "$SRVPID" 2>/dev/null
curl -s -o /dev/null --max-time 2 "$BASE/api/health" && echo "ZOMBI" || echo "puerto 3496 libre — cero zombis"
echo "QA VISUAL FIN"

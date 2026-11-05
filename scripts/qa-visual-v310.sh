#!/bin/bash
# QA VISUAL v310 — LA SEGUNDA QUIRURGÍA (daily-login-modal: la puerta de rehidratación)
# Ley v302: arranque + cirugía visual + cierre en UNA llamada.
# Los dos comportamientos que la quirugía debe preservar EXACTOS:
#   A) operador que YA reclamó hoy → la modal NO reaparece (la cura v135)
#   B) operador nuevo → la modal abre tras la rehidratación + delay
set -u
PORT=3496
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa310.log 2>&1 &
SRVPID=$!
for i in $(seq 1 25); do sleep 1; curl -s -o /dev/null "$BASE/api/health" && break; done
echo "SALUD: $(curl -s "$BASE/api/health")"

HOY=$(date -u +%F)
agent-browser set viewport 1440 900 >/dev/null 2>&1

echo "── 0) SSR: el SSR jamás abre el bono (server snapshot falso) ──"
curl -s "$BASE/" | rg -c 'data-state="open"' || echo "0 diálogos abiertos en el SSR (correcto)"

echo "── A) YA RECLAMÓ HOY: la modal NO reaparece (cura v135 preservada) ──"
agent-browser console --clear >/dev/null 2>&1
agent-browser errors --clear >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 4
agent-browser eval "(() => { sessionStorage.setItem('vanguard-booted','1'); const st = JSON.parse(localStorage.getItem('vanguard-game-state-v1') || '{}'); st.state = Object.assign(st.state || {}, { lastLoginDate: '$HOY', streak: 5 }); st.version = 8; localStorage.setItem('vanguard-game-state-v1', JSON.stringify(st)); return 'hoy=' + '$HOY' + ' sembrado'; })()" 2>&1 | head -1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 8
agent-browser eval "(() => { const dlg = [...document.querySelectorAll('[role=dialog]')].find(d => (d.textContent||'').includes('Reconexión diaria')); return dlg ? 'BONO ABIERTO (REGRESIÓN)' : 'sin bono — la casa recuerda (correcto)'; })()" 2>&1 | head -1

echo "── B) OPERADOR NUEVO: la modal abre tras rehidratación + delay ──"
agent-browser eval "(() => { localStorage.removeItem('vanguard-game-state-v1'); sessionStorage.setItem('vanguard-booted','1'); return 'store limpio + boot marcado (delay 400ms)'; })()" 2>&1 | head -1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 6
agent-browser eval "(() => { const dlg = [...document.querySelectorAll('[role=dialog]')].find(d => (d.textContent||'').includes('Reconexión diaria')); return dlg ? 'BONO ABIERTO (correcto): ' + (dlg.textContent||'').slice(0,40) : 'sin bono a los 10s (revisar)'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa310-bono-nuevo.png >/dev/null 2>&1

echo "── C) CONSOLA (limpia = sin errores de hidratación) ──"
agent-browser console 2>&1 | rg -i '\[error\]|\[warning\]' | rg -v 'Download the React DevTools' | head -4 || echo "CONSOLA LIMPIA"
agent-browser errors 2>&1 | head -3; echo "(vacío = sin errores)"

agent-browser close >/dev/null 2>&1
kill "$SRVPID" 2>/dev/null; sleep 1; kill -9 "$SRVPID" 2>/dev/null
curl -s -o /dev/null --max-time 2 "$BASE/api/health" && echo "ZOMBI" || echo "puerto 3496 libre — cero zombis"
echo "QA VISUAL v310 FIN"

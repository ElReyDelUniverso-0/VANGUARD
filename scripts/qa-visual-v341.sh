#!/bin/bash
# QA VISUAL v341 — LOS PARÁMETROS MUDOS (la leva de params: 73 curas en 53
# archivos — 40 posicionales, 14 shorthand, 13 bindings, 2 destructures de
# una prop, 1 import entero, 1 cláusula, 2 interfaces — cero cambio de
# conducta). La prueba que importa: la casa ENTERA respira con sus 53
# archivos operados — el shell, los mercados (6 hallazgos), el googles y el
# en-vivo (el SSR de la línea del frente).
# Ley v302: arranque + verificación + cierre en UNA llamada.
set -u
PORT=3536
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa341.log 2>&1 &
ARRIBA=0
for i in $(seq 1 25); do sleep 1; if curl -s -o /dev/null "$BASE/api/health"; then ARRIBA=1; break; fi; done
echo "boot=$ARRIBA"
echo "SALUD: $(curl -s "$BASE/api/health" | head -c 150)"
if [ "$ARRIBA" != "1" ]; then echo "SIN SERVIDOR — ABORTO"; pkill -9 -f "standalone/server.js" 2>/dev/null; exit 1; fi

agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser console --clear >/dev/null 2>&1
agent-browser errors --clear >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 6

echo "── A) EL HOME FIRMA LA RONDA ──"
FIRMA=$(agent-browser eval "(() => { const T = document.body.innerText; return (T.includes('v341.0') ? 'VERSIÓN✓' : 'VERSIÓN✗') + '|' + (T.includes('LOS PARÁMETROS MUDOS') ? 'CODENAME✓' : 'CODENAME✗') + '|' + (T.length > 500 ? 'CASA✓' : 'CASA✗'); })()" 2>/dev/null | tr -d '"')
echo "firma: $FIRMA"
agent-browser screenshot /tmp/render/qa341-home.png >/dev/null 2>&1

echo "── B) MERCADOS VIVO (6 hallazgos operados en markets-panel) ──"
agent-browser eval "(() => { const k = 'vg-cine-entrada-v178-' + new Date().toLocaleDateString('en-CA'); sessionStorage.setItem(k, '1'); localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['mercados'])); localStorage.setItem('vg-cromo-activa-v106', 'mercados'); return 'ok'; })()" >/dev/null 2>&1
agent-browser open "$BASE/?r=1" >/dev/null 2>&1
sleep 7
MERC=$(agent-browser eval "(() => { const T = document.body.innerText.toUpperCase(); const tiene = (s) => T.includes(s); return (tiene('MERCADO') || tiene('MERCADOS') ? 'PANEL✓' : 'PANEL✗') + '|' + (T.includes('MON') || T.includes('COINS') || T.length > 400 ? 'CASA✓' : 'CASA✗'); })()" 2>/dev/null | tr -d '"')
echo "mercados: $MERC"
agent-browser screenshot /tmp/render/qa341-mercados.png >/dev/null 2>&1

echo "── C) EN VIVO RESPIRA (el SSR de la línea del frente, googles operado) ──"
ENVI=$(curl -s "$BASE/en-vivo" | rg -o 'CONTRARRELOJ ▸|EL QUIZ DEL PESO — \d+ parejas' | head -2 | tr '\n' ' ')
echo "en-vivo SSR: ${ENVI:-VACÍO✗}"

echo "── D) SIN BUCLES NI DESHIDRATACIONES ──"
agent-browser console 2>&1 | rg -i "maximum update|too many|hydration|hydrat" | head -3; echo "(vacío = consola limpia — la leva no perturbó nada)"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 390 — REGRESIÓN' : 'sin desborde en 390'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa341-movil.png >/dev/null 2>&1
agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 1440 — REGRESIÓN' : 'sin desborde en 1440'; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -4; echo "(vacío = sin errores de página)"

echo "── CIERRE (el centinela pgrep — ley v332) ──"
agent-browser close >/dev/null 2>&1
pkill -9 -f "standalone/server.js" 2>/dev/null; sleep 1
pgrep -f "standalone/server.js" >/dev/null && echo "ZOMBI (pgrep)" || echo "pgrep limpio — cero zombis"
git checkout HEAD -- db/custom.db 2>/dev/null
echo "canon repo restaurado"
echo "QA VISUAL v341 FIN"

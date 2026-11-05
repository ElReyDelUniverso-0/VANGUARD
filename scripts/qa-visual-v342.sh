#!/bin/bash
# QA VISUAL v342 — LAS PUERTAS GEMELAS (dOS puertas del anillo en una ronda:
# la 14 — LA CRISIS EN EL ESPEJO HOY en espejo-panel — y la 15 — LA RUTA DEL
# DÍA en grafo-panel, ruta de 3 nodos por aristas reales). La prueba que
# importa: las dos franjas viven, abren SU crisis / enfocan SU ruta, la
# estrella DÍA viaja en los chips del espejo y la casa entera respira.
# Ley v302: arranque + verificación + cierre en UNA llamada.
set -u
PORT=3537
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa342.log 2>&1 &
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
FIRMA=$(agent-browser eval "(() => { const T = document.body.innerText; return (T.includes('v342.0') ? 'VERSIÓN✓' : 'VERSIÓN✗') + '|' + (T.includes('LAS PUERTAS GEMELAS') ? 'CODENAME✓' : 'CODENAME✗') + '|' + (T.length > 500 ? 'CASA✓' : 'CASA✗'); })()" 2>/dev/null | tr -d '"')
echo "firma: $FIRMA"
agent-browser screenshot /tmp/render/qa342-home.png >/dev/null 2>&1

echo "── B) PUERTA 14 — LA CRISIS EN EL ESPEJO HOY (espejo-panel) ──"
agent-browser eval "(() => { const k = 'vg-cine-entrada-v178-' + new Date().toLocaleDateString('en-CA'); sessionStorage.setItem(k, '1'); localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['espejo'])); localStorage.setItem('vg-cromo-activa-v106', 'espejo'); return 'ok'; })()" >/dev/null 2>&1
agent-browser open "$BASE/?r=2" >/dev/null 2>&1
sleep 7
ESPEJO=$(agent-browser eval "(() => { const franja = document.querySelector('[aria-label=\"Crisis del día\"]'); if (!franja) return 'FRANJA✗'; const T = franja.innerText.toUpperCase(); const chip = franja.querySelector('[aria-label=\"Crisis del día\"] span') ; const tieneDIA = Array.from(document.querySelectorAll('.vg-chips button')).some(b => b.innerText.toUpperCase().includes('DÍA')); franja.click(); return new Promise((res) => setTimeout(() => { const T2 = franja.innerText.toUpperCase(); res((T.includes('LA CRISIS EN EL ESPEJO HOY') ? 'FRANJA✓' : 'FRANJA✗') + '|' + (T.includes('SIM · MUNDO VANGUARD') ? 'SIM✓' : 'SIM✗') + '|' + (T.includes('EL RELOJ DE LA ESCUELA') ? 'LEY✓' : 'LEY✗') + '|' + (tieneDIA ? 'ESTRELLA✓' : 'ESTRELLA✗') + '|' + (T2.includes('ABIERTA EN EL ESPEJO') ? 'SELLO✓' : 'SELLO✗')); }, 600)); })()" 2>/dev/null | tr -d '"')
echo "espejo: $ESPEJO"
agent-browser screenshot /tmp/render/qa342-espejo.png >/dev/null 2>&1

echo "── C) PUERTA 15 — LA RUTA DEL DÍA (grafo-panel) ──"
agent-browser eval "(() => { const k = 'vg-cine-entrada-v178-' + new Date().toLocaleDateString('en-CA'); sessionStorage.setItem(k, '1'); localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['grafo'])); localStorage.setItem('vg-cromo-activa-v106', 'grafo'); return 'ok'; })()" >/dev/null 2>&1
agent-browser open "$BASE/?r=3" >/dev/null 2>&1
sleep 8
GRAFO=$(agent-browser eval "(() => { const franja = document.querySelector('[aria-label=\"Ruta del día\"]'); if (!franja) return 'FRANJA✗'; const T = franja.innerText.toUpperCase(); const nodos = franja.querySelectorAll('button'); if (nodos.length < 2) return 'FRANJA✓|NODOS✗(' + nodos.length + ')'; nodos[0].click(); return new Promise((res) => setTimeout(() => { const T2 = franja.innerText.toUpperCase(); res((T.includes('LA RUTA DEL DÍA') ? 'FRANJA✓' : 'FRANJA✗') + '|NODOS✓(' + nodos.length + ')|' + (T.includes('EL RELOJ DE LA ESCUELA') ? 'LEY✓' : 'LEY✗') + '|' + (T2.includes('ENFOCADA EN EL GRAFO') ? 'FOCO✓' : 'FOCO✗')); }, 600)); })()" 2>/dev/null | tr -d '"')
echo "grafo: $GRAFO"
agent-browser screenshot /tmp/render/qa342-grafo.png >/dev/null 2>&1

echo "── D) EN VIVO RESPIRA (el SSR de la línea del frente) ──"
ENVI=$(curl -s "$BASE/en-vivo" | rg -o 'CONTRARRELOJ ▸|EL QUIZ DEL PESO — \d+ parejas' | head -2 | tr '\n' ' ')
echo "en-vivo SSR: ${ENVI:-VACÍO✗}"

echo "── E) SIN BUCLES NI DESHIDRATACIONES ──"
agent-browser console 2>&1 | rg -i "maximum update|too many|hydration|hydrat" | head -3; echo "(vacío = consola limpia — las puertas no perturbaron nada)"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 390 — REGRESIÓN' : 'sin desborde en 390'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa342-movil.png >/dev/null 2>&1
agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 1440 — REGRESIÓN' : 'sin desborde en 1440'; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -4; echo "(vacío = sin errores de página)"

echo "── CIERRE (el centinela pgrep — ley v332) ──"
agent-browser close >/dev/null 2>&1
pkill -9 -f "standalone/server.js" 2>/dev/null; sleep 1
pgrep -f "standalone/server.js" >/dev/null && echo "ZOMBI (pgrep)" || echo "pgrep limpio — cero zombis"
git checkout HEAD -- db/custom.db 2>/dev/null
echo "canon repo restaurado"
echo "QA VISUAL v342 FIN"

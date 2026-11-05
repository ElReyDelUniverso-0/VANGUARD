#!/bin/bash
# QA VISUAL v349 — LA LEY SIN EXCEPCIÓN (el build vuelve a leer la ley de
# tipos en DOS capas medidas: tsc --noEmit abre el build, el flag queda como
# el salto de la re-verificación duplicada con su POR QUÉ escrito). La prueba
# que importa: la casa respira IGUAL que en v348 — la cirugía es invisible
# para el visitante y el build nuevo firma la ronda.
# Ley v302: arranque + verificación + cierre en UNA llamada.
set -u
PORT=3544
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa349.log 2>&1 &
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
FIRMA=$(agent-browser eval "(() => { const T = document.body.innerText; return (T.includes('v349.0') ? 'VERSIÓN✓' : 'VERSIÓN✗') + '|' + (T.includes('LA LEY SIN EXCEPCIÓN') ? 'CODENAME✓' : 'CODENAME✗') + '|' + (T.length > 500 ? 'CASA✓' : 'CASA✗'); })()" 2>/dev/null | tr -d '"')
echo "firma: $FIRMA"
agent-browser screenshot /tmp/render/qa349-home.png >/dev/null 2>&1

echo "── B) LA SALUD FIRMA LA LEY ──"
SALUD=$(curl -s "$BASE/api/health" | rg -o '"version":"v349.0"' | head -1)
echo "health: ${SALUD:-SIN FIRMA✗}"

echo "── C) LA CASA SIGUE VIVA (en-vivo respira con su SSR) ──"
ENVIVO=$(curl -s "$BASE/en-vivo" | rg -c "última hora del mundo|EN VIVO" || echo 0)
echo "en-vivo SSR marcas: $ENVIVO"

echo "── D) SIN BUCLES NI DESHIDRATACIONES ──"
agent-browser console 2>&1 | rg -i "maximum update|too many|hydration|hydrat" | head -3; echo "(vacío = consola limpia — la cirugía no perturbó nada)"
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser open "$BASE/?r=2" >/dev/null 2>&1
sleep 4
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 390 — REGRESIÓN' : 'sin desborde en 390'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa349-movil.png >/dev/null 2>&1
agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 1440 — REGRESIÓN' : 'sin desborde en 1440'; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -4; echo "(vacío = sin errores de página)"

echo "── CIERRE (el centinela pgrep — ley v332) ──"
agent-browser close >/dev/null 2>&1
pkill -9 -f "standalone/server.js" 2>/dev/null; sleep 1
pgrep -f "standalone/server.js" >/dev/null && echo "ZOMBI (pgrep)" || echo "pgrep limpio — cero zombis"
git checkout HEAD -- db/custom.db 2>/dev/null
echo "canon repo restaurado"
echo "QA VISUAL v349 FIN"

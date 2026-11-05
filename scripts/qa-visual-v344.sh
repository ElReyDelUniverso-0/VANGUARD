#!/bin/bash
# QA VISUAL v344 — EL TABLÓN DE LA MESA (LA MESA VIVA etapa 6: los rivales
# del desafío de la semana). La prueba que importa: la escuela respira con su
# tablón — los cadetes SIM alrededor de la única fila REAL, la frontera en
# pantalla y la fila 3D sin romper el contrato de cabeza.
# Ley v302: arranque + verificación + cierre en UNA llamada.
set -u
PORT=3539
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa344.log 2>&1 &
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
FIRMA=$(agent-browser eval "(() => { const T = document.body.innerText; return (T.includes('v344.0') ? 'VERSIÓN✓' : 'VERSIÓN✗') + '|' + (T.includes('EL TABLÓN DE LA MESA') ? 'CODENAME✓' : 'CODENAME✗') + '|' + (T.length > 500 ? 'CASA✓' : 'CASA✗'); })()" 2>/dev/null | tr -d '"')
echo "firma: $FIRMA"
agent-browser screenshot /tmp/render/qa344-home.png >/dev/null 2>&1

echo "── B) LA ESCUELA CON SU TABLÓN (estrategia: cadetes SIM + fila REAL) ──"
agent-browser eval "(() => { const k = 'vg-cine-entrada-v178-' + new Date().toLocaleDateString('en-CA'); sessionStorage.setItem(k, '1'); localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['estrategia'])); localStorage.setItem('vg-cromo-activa-v106', 'estrategia'); return 'ok'; })()" >/dev/null 2>&1
agent-browser open "$BASE/?r=1" >/dev/null 2>&1
sleep 8
ESC=$(agent-browser eval "(() => { const T = document.body.innerText; const tiene = (s) => T.includes(s); return (tiene('Desafío de la semana') || tiene('DESAFÍO DE LA SEMANA') ? 'DESAFÍO✓' : 'DESAFÍO✗') + '|' + (tiene('Tablón de la mesa') || tiene('TABLÓN DE LA MESA') ? 'TABLÓN✓' : 'TABLÓN✗') + '|' + (tiene('SIM determinista') ? 'SIM✓' : 'SIM✗') + '|' + (tiene('tu fila: REAL') ? 'REAL✓' : 'REAL✗') + '|' + (tiene('Damaris Oteiza') ? 'CADETES✓' : 'CADETES✗') + '|' + (tiene('tu fila es la única REAL') ? 'LEY✓' : 'LEY✗'); })()" 2>/dev/null | tr -d '"')
echo "estrategia: $ESC"
agent-browser screenshot /tmp/render/qa344-tablon.png >/dev/null 2>&1

echo "── C) EN VIVO RESPIRA (el SSR de la línea del frente) ──"
ENVI=$(curl -s "$BASE/en-vivo" | rg -o 'CONTRARRELOJ ▸|EL QUIZ DEL PESO — \d+ parejas' | head -2 | tr '\n' ' ')
echo "en-vivo SSR: ${ENVI:-VACÍO✗}"

echo "── D) SIN BUCLES NI DESHIDRATACIONES ──"
agent-browser console 2>&1 | rg -i "maximum update|too many|hydration|hydrat" | head -3; echo "(vacío = consola limpia — el tablón no perturbó nada)"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 390 — REGRESIÓN' : 'sin desborde en 390'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa344-movil.png >/dev/null 2>&1
agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 1440 — REGRESIÓN' : 'sin desborde en 1440'; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -4; echo "(vacío = sin errores de página)"

echo "── CIERRE (el centinela pgrep — ley v332) ──"
agent-browser close >/dev/null 2>&1
pkill -9 -f "standalone/server.js" 2>/dev/null; sleep 1
pgrep -f "standalone/server.js" >/dev/null && echo "ZOMBI (pgrep)" || echo "pgrep limpio — cero zombis"
git checkout HEAD -- db/custom.db 2>/dev/null
echo "canon repo restaurado"
echo "QA VISUAL v344 FIN"

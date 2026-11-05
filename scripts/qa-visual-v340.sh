#!/bin/bash
# QA VISUAL v340 — EL ARCHIVO DEL DÍA (la décimo-tercera puerta del anillo de
# la escuela se abre en la máquina del tiempo: las 5 cronologías REALES giran
# con el reloj central; franja con fuente nombrada, ★ DÍA en chips, fila 3D)
# Ley v302: arranque + verificación + cierre en UNA llamada.
#   A) EL HOME FIRMA LA RONDA: v340.0 · EL ARCHIVO DEL DÍA + health
#   B) LA MÁQUINA VIVA: la franja ARCHIVO DEL DÍA con SU archivo del día
#      (el reloj manda), chip REAL · VERIFICABLE, fuente nombrada, ★ DÍA en
#      el chip, y el CLIC abre la cronología en la máquina
#   C) SIN BUCLES: consola limpia · sin desbordes 1440/390 · cero errores
#   D) CIERRE: pgrep centinela (v332) + canon repo restaurado
set -u
PORT=3530
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa340.log 2>&1 &
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
FIRMA=$(agent-browser eval "(() => { const T = document.body.innerText; return (T.includes('v340.0') ? 'VERSIÓN✓' : 'VERSIÓN✗') + '|' + (T.includes('EL ARCHIVO DEL DÍA') ? 'CODENAME✓' : 'CODENAME✗') + '|' + (T.length > 500 ? 'CASA✓' : 'CASA✗'); })()" 2>/dev/null | tr -d '"')
echo "firma: $FIRMA"
SALUD=$(curl -s "$BASE/api/health")
echo "health: $SALUD" | head -c 200; echo ""
agent-browser screenshot /tmp/render/qa340-home.png >/dev/null 2>&1

echo "── B) LA MÁQUINA VIVA: la franja del ANILLO con el archivo del día ──"
agent-browser eval "(() => { const k = 'vg-cine-entrada-v178-' + new Date().toLocaleDateString('en-CA'); sessionStorage.setItem(k, '1'); localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['maquina'])); localStorage.setItem('vg-cromo-activa-v106', 'maquina'); return 'maquina sembrada'; })()" >/dev/null 2>&1
agent-browser open "$BASE/?r=1" >/dev/null 2>&1
sleep 7
FRANJA=$(agent-browser eval "(() => { const T = document.body.innerText; const franja = (T.includes('ARCHIVO DEL DÍA') ? 'FRANJA✓' : 'FRANJA✗'); const ley = (T.includes('la rotación es el reloj de la escuela') ? 'LEY✓' : 'LEY✗'); const cat = (T.includes('cronologías reales en el catálogo') ? 'CATÁLOGO✓' : 'CATÁLOGO✗'); const real = (T.includes('REAL · VERIFICABLE') ? 'REAL✓' : 'REAL✗'); const fuente = (T.includes('fuente:') ? 'FUENTE✓' : 'FUENTE✗'); return franja+'|'+ley+'|'+cat+'|'+real+'|'+fuente; })()" 2>/dev/null | tr -d '"')
echo "franja: $FRANJA"
NOMBRE=$(agent-browser eval "(() => { const f = document.querySelector('button[aria-label=\"Archivo del día\"]'); return f ? (f.innerText.split('\n')[1] || '?') : 'SIN FRANJA'; })()" 2>/dev/null | tr -d '"')
echo "archivo del día (el reloj manda): $NOMBRE"
CLIC=$(agent-browser eval "(() => { const f = document.querySelector('button[aria-label=\"Archivo del día\"]'); if (!f) return 'SIN FRANJA'; f.click(); return 'clic dado'; })()" 2>/dev/null | tr -d '"')
sleep 2
ABIERTA=$(agent-browser eval "(() => { const T = document.body.innerText; const f = document.querySelector('button[aria-label=\"Archivo del día\"]'); const nombre = f ? (f.innerText.split('\n')[1] || '') : ''; return (nombre && T.includes(nombre) && T.includes('REAL · archivo') ? 'CRONOLOGÍA ABIERTA✓' : 'NO ABIERTA✗') + '|' + (T.toUpperCase().includes('ABIERTA EN LA MÁQUINA') ? 'SELLO✓' : 'SELLO✗'); })()" 2>/dev/null | tr -d '"')
echo "clic: $CLIC → $ABIERTA"
agent-browser screenshot /tmp/render/qa340-maquina.png >/dev/null 2>&1

echo "── C) SIN BUCLES NI DESHIDRATACIONES ──"
agent-browser console 2>&1 | rg -i "maximum update|too many|hydration|hydrat" | head -3; echo "(vacío = consola limpia — la puerta no perturbó nada)"

agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 390 — REGRESIÓN' : 'sin desborde en 390'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa340-movil.png >/dev/null 2>&1
agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 1440 — REGRESIÓN' : 'sin desborde en 1440'; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -4; echo "(vacío = sin errores de página)"

echo "── CIERRE (el centinela pgrep — ley v332) ──"
agent-browser close >/dev/null 2>&1
pkill -9 -f "standalone/server.js" 2>/dev/null; sleep 1
pgrep -f "standalone/server.js" >/dev/null && echo "ZOMBI (pgrep)" || echo "pgrep limpio — cero zombis"
git checkout HEAD -- db/custom.db 2>/dev/null
echo "canon repo restaurado"
echo "QA VISUAL v340 FIN"

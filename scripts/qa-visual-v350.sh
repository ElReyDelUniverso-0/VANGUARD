#!/bin/bash
# QA VISUAL v350 — EL FANTASMA DE LA MESA (LA MESA VIVA etapa 8: tu mejor
# semana cerrada vuelve al tablón como rival REAL y fijo — no se recalibra).
# La prueba que importa: con archivo SEMBRADO el fantasma se ve (fila
# violeta TU FANTASMA + chip del duelo + frontera honesta); sin archivo no
# hay fantasma (el vacío honesto de la etapa 7 intacto) y la escuela sigue
# con sus 5 efectos.
# Ley v302: arranque + verificación + cierre en UNA llamada.
set -u
PORT=3545
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa350.log 2>&1 &
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
FIRMA=$(agent-browser eval "(() => { const T = document.body.innerText; return (T.includes('v350.0') ? 'VERSIÓN✓' : 'VERSIÓN✗') + '|' + (T.includes('EL FANTASMA DE LA MESA') ? 'CODENAME✓' : 'CODENAME✗') + '|' + (T.length > 500 ? 'CASA✓' : 'CASA✗'); })()" 2>/dev/null | tr -d '"')
echo "firma: $FIRMA"
agent-browser screenshot /tmp/render/qa350-home.png >/dev/null 2>&1

echo "── B) LA ESCUELA SIN FANTASMA (novato: el vacío honesto de la etapa 7) ──"
agent-browser eval "(() => { const k = 'vg-cine-entrada-v178-' + new Date().toLocaleDateString('en-CA'); sessionStorage.setItem(k, '1'); localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['estrategia'])); localStorage.setItem('vg-cromo-activa-v106', 'estrategia'); return 'ok'; })()" >/dev/null 2>&1
agent-browser open "$BASE/?r=1" >/dev/null 2>&1
sleep 6
NOVATO=$(agent-browser eval "(() => { const T = document.body.innerText.toUpperCase(); const tiene = (s) => T.includes(s); return (tiene('DESAFÍO DE LA SEMANA') ? 'DESAFÍO✓' : 'DESAFÍO✗') + '|' + (tiene('TABLÓN DE LA MESA') ? 'TABLÓN✓' : 'TABLÓN✗') + '|' + (T.includes('TU FANTASMA') ? 'FANTASMA-SIN-ARCHIVO✗' : 'SIN-FANTASMA✓') + '|' + (tiene('SIN SEMANAS CERRADAS AÚN') || tiene('ENTRARÁ AL ARCHIVO') ? 'VACÍO✓' : 'VACÍO✗'); })()" 2>/dev/null | tr -d '"')
echo "novato: $NOVATO"

echo "── C) EL FANTASMA DESPIERTA (archivo sembrado: fila violeta + chip del duelo) ──"
agent-browser eval "(() => { const K = 'vanguard-game-state-v1'; const raw = localStorage.getItem(K); const st = raw ? JSON.parse(raw) : { state: {}, version: 0 }; st.state = st.state || {}; st.state.desafioHistorial = [{ wk: '2026-W44', objetivo: 62, fecha: 1761990000000 }, { wk: '2026-W43', objetivo: 48, fecha: 1761385200000 }]; st.state.desafioMejor = null; localStorage.setItem(K, JSON.stringify(st)); return 'sembrado'; })()" >/dev/null 2>&1
agent-browser open "$BASE/?r=2" >/dev/null 2>&1
sleep 6
FANTASMA=$(agent-browser eval "(() => { const T = document.body.innerText.toUpperCase(); const tiene = (s) => T.includes(s); const fila = Array.from(document.querySelectorAll('[aria-label=\"Tablón de la mesa\"] .font-mono')).some(d => d.textContent.toUpperCase().includes('TU FANTASMA')); return (tiene('TU FANTASMA') ? 'FILA✓' : 'FILA✗') + '|' + (tiene('TU FANTASMA TE ESPERA: 62/100') ? 'CHIP✓' : 'CHIP✗') + '|' + (tiene('2026-W44') ? 'SEMANA✓' : 'SEMANA✗') + '|' + (tiene('NO SE RECALIBRA CUANDO MEJORAS') ? 'FRONTERA✓' : 'FRONTERA✗') + '|' + (T.includes('FANTASMA VENCIDO') ? 'VENCIDO-SIN-MOTIVO✗' : 'DUELO-HONESTO✓'); })()" 2>/dev/null | tr -d '"')
echo "fantasma: $FANTASMA"
agent-browser screenshot /tmp/render/qa350-fantasma.png >/dev/null 2>&1

echo "── D) SIN BUCLES NI DESHIDRATACIONES ──"
agent-browser console 2>&1 | rg -i "maximum update|too many|hydration|hydrat" | head -3; echo "(vacío = consola limpia — la expansión no perturbó nada)"
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser open "$BASE/?r=3" >/dev/null 2>&1
sleep 4
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 390 — REGRESIÓN' : 'sin desborde en 390'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa350-movil.png >/dev/null 2>&1
agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 1440 — REGRESIÓN' : 'sin desborde en 1440'; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -4; echo "(vacío = sin errores de página)"

echo "── CIERRE (el centinela pgrep — ley v332) ──"
agent-browser close >/dev/null 2>&1
pkill -9 -f "standalone/server.js" 2>/dev/null; sleep 1
pgrep -f "standalone/server.js" >/dev/null && echo "ZOMBI (pgrep)" || echo "pgrep limpio — cero zombis"
git checkout HEAD -- db/custom.db 2>/dev/null
echo "canon repo restaurado"
echo "QA VISUAL v350 FIN"

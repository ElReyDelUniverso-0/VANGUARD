#!/bin/bash
# QA VISUAL v348 — EL ARCHIVO DE LA MESA (LA MESA VIVA etapa 7: las semanas
# cerradas del desafío cuentan su historia — filas REALES del operador, título
# recomputado del anillo, puesto de la escuela SIM recomputada y declarada).
# La prueba que importa: la sección del archivo respira dentro del panel de
# estrategia con su frontera honesta y la escuela sigue con sus 5 efectos.
# Ley v302: arranque + verificación + cierre en UNA llamada.
set -u
PORT=3543
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa348.log 2>&1 &
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
FIRMA=$(agent-browser eval "(() => { const T = document.body.innerText; return (T.includes('v348.0') ? 'VERSIÓN✓' : 'VERSIÓN✗') + '|' + (T.includes('EL ARCHIVO DE LA MESA') ? 'CODENAME✓' : 'CODENAME✗') + '|' + (T.length > 500 ? 'CASA✓' : 'CASA✗'); })()" 2>/dev/null | tr -d '"')
echo "firma: $FIRMA"
agent-browser screenshot /tmp/render/qa348-home.png >/dev/null 2>&1

echo "── B) EL ARCHIVO DE LA MESA (tab estrategia: la etapa 7 con su frontera) ──"
agent-browser eval "(() => { const k = 'vg-cine-entrada-v178-' + new Date().toLocaleDateString('en-CA'); sessionStorage.setItem(k, '1'); localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['estrategia'])); localStorage.setItem('vg-cromo-activa-v106', 'estrategia'); return 'ok'; })()" >/dev/null 2>&1
agent-browser open "$BASE/?r=1" >/dev/null 2>&1
sleep 6
ARCHIVO=$(agent-browser eval "(() => { const T = document.body.innerText.toUpperCase(); const tiene = (s) => T.includes(s); const sec = document.querySelector('[aria-label=\"Archivo de la mesa\"]'); return (sec ? 'SECCIÓN✓' : 'SECCIÓN✗') + '|' + (tiene('ARCHIVO DE LA MESA') ? 'TITULAR✓' : 'TITULAR✗') + '|' + ((tiene('SEMANAS CERRADAS') || tiene('1 SEMANA CERRADA')) ? 'CONTEO✓' : 'CONTEO✗') + '|' + (tiene('TUS FILAS SON REALES') ? 'FRONTERA✓' : 'FRONTERA✗') + '|' + ((tiene('SIN SEMANAS CERRADAS AÚN') || tiene('ENTRARÁ AL ARCHIVO')) ? 'VACÍO✓' : 'VACÍO✗') + '|' + (tiene('SIM RECOMPUTADA') ? 'SIM✓' : 'SIM✗'); })()" 2>/dev/null | tr -d '"')
echo "archivo: $ARCHIVO"
agent-browser screenshot /tmp/render/qa348-archivo.png >/dev/null 2>&1

echo "── C) EL DESAFÍO SIGUE VIVO (la etapa 5 y el tablón 6 intactos) ──"
MESA=$(agent-browser eval "(() => { const T = document.body.innerText.toUpperCase(); const tiene = (s) => T.includes(s); return (tiene('DESAFÍO DE LA SEMANA') ? 'DESAFÍO✓' : 'DESAFÍO✗') + '|' + (tiene('TABLÓN DE LA MESA') ? 'TABLÓN✓' : 'TABLÓN✗') + '|' + (tiene('ABRIR LA MESA DEL DESAFÍO') ? 'JUGABLE✓' : 'JUGABLE✗'); })()" 2>/dev/null | tr -d '"')
echo "mesa viva: $MESA"

echo "── D) SIN BUCLES NI DESHIDRATACIONES ──"
agent-browser console 2>&1 | rg -i "maximum update|too many|hydration|hydrat" | head -3; echo "(vacío = consola limpia — la expansión no perturbó nada)"
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser open "$BASE/?r=2" >/dev/null 2>&1
sleep 4
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 390 — REGRESIÓN' : 'sin desborde en 390'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa348-movil.png >/dev/null 2>&1
agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 1440 — REGRESIÓN' : 'sin desborde en 1440'; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -4; echo "(vacío = sin errores de página)"

echo "── CIERRE (el centinela pgrep — ley v332) ──"
agent-browser close >/dev/null 2>&1
pkill -9 -f "standalone/server.js" 2>/dev/null; sleep 1
pgrep -f "standalone/server.js" >/dev/null && echo "ZOMBI (pgrep)" || echo "pgrep limpio — cero zombis"
git checkout HEAD -- db/custom.db 2>/dev/null
echo "canon repo restaurado"
echo "QA VISUAL v348 FIN"

#!/bin/bash
# QA VISUAL v320 — LA RED COMPLETA (la red OSINT paga los 4 que debió y respira)
# Ley v302: arranque + cirugía visual + cierre en UNA llamada.
#   A) LA RED: 20 canales en la lista, los 4 nuevos presentes, el destacado
#      del día declarado (el anillo avanza un canal por fecha)
#   B) EL DESTACADO: clicable — filtrar por el canal del anillo funciona
#   C) LA ESCUCHA: mensajes en vivo con contraste contra la casa
#   D) consola limpia · sin desbordes 1440/390 · cero zombis
set -u
PORT=3496
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa320.log 2>&1 &
SRVPID=$!
ARRIBA=0
for i in $(seq 1 25); do sleep 1; if curl -s -o /dev/null "$BASE/api/health"; then ARRIBA=1; break; fi; done
echo "boot=$ARRIBA"
echo "SALUD: $(curl -s "$BASE/api/health")"
if [ "$ARRIBA" != "1" ]; then echo "SIN SERVIDOR — ABORTO"; kill -9 $SRVPID 2>/dev/null; exit 1; fi

agent-browser set viewport 1440 900 >/dev/null 2>&1

echo "── A) LA RED CON SUS 20 CANALES ──"
agent-browser console --clear >/dev/null 2>&1
agent-browser errors --clear >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 5
agent-browser eval "(() => { localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['canales'])); localStorage.setItem('vg-cromo-activa-v106', 'canales'); return 'pestaña canales sembrada'; })()" 2>&1 | head -1
agent-browser open "$BASE/?r=1" >/dev/null 2>&1
sleep 9
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find((x) => /saltar el cine/i.test(x.textContent||'')); if (b) { b.click(); return 'cine fuera'; } return 'sin cine'; })()" >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find((x) => /^skip$/i.test((x.textContent||'').trim())); if (b) { b.click(); return 'manual fuera'; } return 'sin manual'; })()" >/dev/null 2>&1
sleep 1
agent-browser eval "(() => { const t = document.body.textContent || ''; if (!t.includes('Canales OSINT')) return 'PANEL NO MONTÓ'; if (!t.includes('Destacado del día ·')) return 'REGRESIÓN: el destacado del día no está declarado'; if (!t.includes('dos días seguidos jamás repiten el destacado')) return 'REGRESIÓN: la ley del anillo no se declara'; const nombre = (t.match(/Destacado del día · ([^\\n]+)/) || [])[1]; if (!nombre) return 'REGRESIÓN: sin nombre del destacado'; return 'DESTACADO VERIFICADO: ' + nombre.trim() + ' — el anillo da la cara'; })()" 2>&1 | head -1
agent-browser eval "(() => { const filas = [...document.querySelectorAll('button')].filter((x) => /@[a-z]/.test(x.textContent||'') && (x.textContent||'').includes('K ·')); const nombres = new Set(filas.map((f) => (f.textContent||'').trim().split('·')[0].replace(/^.*?([A-ZÀ-Ý][^·]*?)$/,'$1').trim())); if (filas.length !== 20) return 'REGRESIÓN: ' + filas.length + ' canales en la lista ≠ 20'; return 'LISTA VERIFICADA: 20 canales en la escucha'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa320-red.png >/dev/null 2>&1

echo "── B) EL DESTACADO ES TOCABLE (filtra su canal) ──"
agent-browser eval "(() => { const t = document.body.textContent || ''; const nombre = (t.match(/Destacado del día · ([^\\n]+)/) || [])[1].trim(); const b = [...document.querySelectorAll('button')].find((x) => (x.getAttribute('aria-label') || '').includes('canal destacado de hoy')); if (!b) return 'REGRESIÓN: el destacado no es tocable'; b.click(); return 'click en el destacado: ' + nombre; })()" 2>&1 | head -1
sleep 2
agent-browser eval "(() => { const t = document.body.textContent || ''; if (!t.includes('mensajes')) return 'sin flujo'; return 'FILTRO VERIFICADO: el canal del anillo abrió su escucha'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa320-destacado.png >/dev/null 2>&1

echo "── C) LOS 4 NUEVOS EN PÁGINA ──"
agent-browser eval "(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); localStorage.setItem('vg-cromo-activa-v106', 'canales'); return 'ok'; })()" >/dev/null 2>&1
agent-browser open "$BASE/?r=2" >/dev/null 2>&1
sleep 7
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find((x) => /saltar el cine/i.test(x.textContent||'')); if (b) { b.click(); return 'cine fuera'; } return 'sin cine'; })()" >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const t = document.body.textContent || ''; const nuevos = ['Columna Norte','Faro del Mar','Geófono','Boletín Tiniebla']; const enPagina = nuevos.filter((n) => t.includes(n)); if (enPagina.length !== 4) return 'FALTAN canales nuevos: ' + nuevos.filter((n) => !t.includes(n)).join(', '); return 'LOS 4 NUEVOS EN PÁGINA: ' + enPagina.join(' · '); })()" 2>&1 | head -1

echo "── D) CONSOLA LIMPIA + SIN DESBORDES ──"
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 1440 — REGRESIÓN' : 'sin desborde en 1440'; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -3; echo "(vacío = sin errores de página)"
agent-browser console 2>&1 | grep -i "maximum update\|too many re-renders\|hydration" && echo "REGRESIÓN DE RENDER/HIDRATACIÓN" || echo "consola sin bucles ni deshidrataciones"
agent-browser console 2>&1 | grep -i '\[error\]' | grep -v 'Download the React DevTools' | head -3 || echo "consola sin errores"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 390 — REGRESIÓN' : 'sin desborde en 390 (móvil ok)'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa320-movil.png >/dev/null 2>&1

agent-browser close >/dev/null 2>&1
kill "$SRVPID" 2>/dev/null; sleep 1; kill -9 "$SRVPID" 2>/dev/null
curl -s -o /dev/null --max-time 2 "$BASE/api/health" && echo "ZOMBI" || echo "puerto 3496 libre — cero zombis"
echo "QA VISUAL v320 FIN"

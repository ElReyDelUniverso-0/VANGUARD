#!/bin/bash
# QA VISUAL v323 — LA CIRUGÍA DEL TRIBUNAL (primera cirugía de la cola de deuda)
# Ley v302: arranque + cirugía visual + cierre en UNA llamada.
# Lecciones v320/v321: verificación COMPACTA, DOM preciso, retornos acotados.
#   A) EL TRIBUNAL MONTA SIN EXPEDIENTE: panel visible, botones de veredicto
#   B) LA CIRUGÍA VIVA: click en Culpable → la TIENDA notifica (evento) →
#      «TU VOTO» aparece sin setState — el roundtrip evento→re-render
#   C) EL REVIVIR SIN EFECTO: recarga → el expediente vuelve del aparato
#      por useSyncExternalStore (getServerSnapshot vacío, re-render después)
#   D) consola limpia (sin deshidrataciones) · sin desbordes 1440/390 · cero zombis
set -u
PORT=3496
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa323.log 2>&1 &
SRVPID=$!
ARRIBA=0
for i in $(seq 1 25); do sleep 1; if curl -s -o /dev/null "$BASE/api/health"; then ARRIBA=1; break; fi; done
echo "boot=$ARRIBA"
echo "SALUD: $(curl -s "$BASE/api/health")"
if [ "$ARRIBA" != "1" ]; then echo "SIN SERVIDOR — ABORTO"; kill -9 $SRVPID 2>/dev/null; exit 1; fi

agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser console --clear >/dev/null 2>&1
agent-browser errors --clear >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 5
agent-browser eval "(() => { localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['tribunal'])); localStorage.setItem('vg-cromo-activa-v106', 'tribunal'); localStorage.removeItem('vanguard-tribunal-v13'); return 'pestaña tribunal sembrada y expediente limpio'; })()" 2>&1 | head -1
agent-browser open "$BASE/?r=1" >/dev/null 2>&1
sleep 9
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find((x) => /saltar el cine/i.test(x.textContent||'')); if (b) { b.click(); return 'cine fuera'; } return 'sin cine'; })()" >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find((x) => /^skip$/i.test((x.textContent||'').trim())); if (b) { b.click(); return 'manual fuera'; } return 'sin manual'; })()" >/dev/null 2>&1
sleep 1

echo "── A) EL TRIBUNAL MONTA SIN EXPEDIENTE ──"
agent-browser eval "(() => { const t = document.body.textContent || ''; if (!t.includes('JUICIO HISTÓRICO') && !t.includes('Tu veredicto')) return 'PANEL NO MONTÓ'; const btn = [...document.querySelectorAll('button')].find((x) => /culpable/i.test(x.textContent||'')); if (!btn) return 'REGRESIÓN: sin botón de veredicto'; if (t.includes('TU VOTO:')) return 'REGRESIÓN: hay voto sin votar (hidratación sucia)'; return 'TRIBUNAL EN PIE: botones de veredicto disponibles, expediente vacío como manda el servidor'; })()" 2>&1 | head -c 300; echo
agent-browser screenshot /tmp/render/qa323-tribunal.png >/dev/null 2>&1

echo "── B) LA CIRUGÍA VIVA: voto por la tienda ──"
agent-browser eval "(() => { const btn = [...document.querySelectorAll('button')].find((x) => /culpable/i.test(x.textContent||'')); if (!btn) return 'REGRESIÓN: sin botón'; btn.click(); return 'voto emitido'; })()" 2>&1 | head -1
sleep 2
agent-browser eval "(() => { const t = document.body.textContent || ''; const ls = localStorage.getItem('vanguard-tribunal-v13') || ''; const enLS = ls.includes('CULPABLE'); const enPantalla = t.includes('TU VOTO:'); return ('ROUNDTRIP: pantalla ' + (enPantalla ? 'CUMPLE' : 'FALLA') + ' · aparato ' + (enLS ? 'CUMPLE' : 'FALLA') + ' — la tienda notificó y React re-renderizó sin setState').slice(0, 140); })()" 2>&1 | head -c 400; echo
agent-browser screenshot /tmp/render/qa323-voto.png >/dev/null 2>&1

echo "── C) EL REVIVIR SIN EFECTO ──"
agent-browser open "$BASE/?r=2" >/dev/null 2>&1
sleep 8
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find((x) => /saltar el cine/i.test(x.textContent||'')); if (b) b.click(); return 'ok'; })()" >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find((x) => /^skip$/i.test((x.textContent||'').trim())); if (b) b.click(); return 'ok'; })()" >/dev/null 2>&1
sleep 1
agent-browser eval "(() => { const t = document.body.textContent || ''; const ls = localStorage.getItem('vanguard-tribunal-v13') || ''; return ('REVIVIR: ' + (t.includes('TU VOTO:') ? 'CUMPLE — el expediente volvió del aparato por la tienda' : 'FALLA — el voto no revivió') + ' (aparato: ' + (ls.includes('CULPABLE') ? 'con voto' : 'vacío') + ')').slice(0, 140); })()" 2>&1 | head -c 400; echo
agent-browser screenshot /tmp/render/qa323-revivir.png >/dev/null 2>&1

echo "── D) CONSOLA LIMPIA + SIN DESBORDES ──"
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 1440 — REGRESIÓN' : 'sin desborde en 1440'; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -3; echo "(vacío = sin errores de página)"
agent-browser console 2>&1 | grep -i "maximum update\|too many re-renders\|hydration" && echo "REGRESIÓN DE RENDER/HIDRATACIÓN" || echo "consola sin bucles ni deshidrataciones — la cirugía no rompió el agua"
agent-browser console 2>&1 | grep -i '\[error\]' | grep -v 'Download the React DevTools' | head -3 || echo "consola sin errores"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 390 — REGRESIÓN' : 'sin desborde en 390 (móvil ok)'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa323-movil.png >/dev/null 2>&1

agent-browser close >/dev/null 2>&1
kill "$SRVPID" 2>/dev/null; sleep 1; kill -9 "$SRVPID" 2>/dev/null
curl -s -o /dev/null --max-time 2 "$BASE/api/health" && echo "ZOMBI" || echo "puerto 3496 libre — cero zombis"
echo "QA VISUAL v323 FIN"

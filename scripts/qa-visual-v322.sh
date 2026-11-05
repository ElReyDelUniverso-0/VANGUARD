#!/bin/bash
# QA VISUAL v322 — EL ADVERSARIO CON NOMBRE (el ciber se dobla y respira)
# Ley v302: arranque + cirugía visual + cierre en UNA llamada.
# Lecciones v320/v321: verificación COMPACTA en una sola carga (la casa
#   remonta el cine en cada perfil fresco) y extracción por DOM preciso
#   con retornos acotados (.slice — el textContent sin recortar cuelga).
#   A) EL MAPA DOBLADO: el panel monta con la franja de la CAMPAÑA DEL DÍA,
#      el nombre predicho por la ley del anillo (día 308 % 12) y la ley
#      declarada al lector
#   B) LA ATRIBUCIÓN ES HONESTA: chip de atribución en el feed si hay arcos
#      suyos; «en sombra» si no — y la palabra «estimación» en pantalla
#   C) consola limpia · sin desbordes 1440/390 · cero zombis
set -u
PORT=3496
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa322.log 2>&1 &
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
agent-browser eval "(() => { localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['ciber'])); localStorage.setItem('vg-cromo-activa-v106', 'ciber'); return 'pestaña ciber sembrada'; })()" 2>&1 | head -1
agent-browser open "$BASE/?r=1" >/dev/null 2>&1
sleep 9
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find((x) => /saltar el cine/i.test(x.textContent||'')); if (b) { b.click(); return 'cine fuera'; } return 'sin cine'; })()" >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find((x) => /^skip$/i.test((x.textContent||'').trim())); if (b) { b.click(); return 'manual fuera'; } return 'sin manual'; })()" >/dev/null 2>&1
sleep 1

echo "── A) EL MAPA DOBLADO Y EL ANILLO DECLARADO ──"
agent-browser eval "(() => { const t = document.body.textContent || ''; if (!t.includes('CIBER — mapa de amenazas en vivo') && !t.includes('mapa de amenazas')) return 'PANEL NO MONTÓ'; const franja = document.querySelector('[aria-label=\"Campaña del día\"]'); if (!franja) return 'REGRESIÓN: la franja de la campaña del día no existe'; if (!t.includes('dos días seguidos jamás repiten la campaña del día')) return 'REGRESIÓN: la ley del anillo no se declara al lector'; const f = new Date(); const dia = Math.max(0, Math.floor((Date.UTC(f.getUTCFullYear(), f.getUTCMonth(), f.getUTCDate(), 12) - Date.UTC(f.getUTCFullYear(), 0, 1)) / 86400000)); const NOMBRES = ['MANADA DE INVIERNO','PAPEL DE ARROZ','GUADAÑA DE SAL','MAREA ESPEJO','GATO DE BÓSFORO','CINCEL DEL INDUS','ESCALERA DEL SUBCONTINENTE','SONATA HERMITANA','POLVO DE LEVANTE','HARMATTAN','CABLE INVERSO','PERLA NEGRA']; const esperada = NOMBRES[dia % 12]; const enFranja = franja.textContent || ''; return ('ANILLO VERIFICADO: día ' + dia + ' % 12 predice ' + esperada + ' — en franja: ' + (enFranja.includes(esperada) ? 'CUMPLE' : 'FALLA')).slice(0, 120); })()" 2>&1 | head -c 400; echo
agent-browser screenshot /tmp/render/qa322-campana.png >/dev/null 2>&1

echo "── B) LA ATRIBUCIÓN ES HONESTA ──"
agent-browser eval "(() => { const franja = document.querySelector('[aria-label=\"Campaña del día\"]'); if (!franja) return 'REGRESIÓN: sin franja'; const tf = franja.textContent || ''; const vivos = /arcos suyos vivos ahora/.test(tf); const sombra = /sin arcos suyos en la ventana/.test(tf); const feed = document.body.textContent || ''; const chip = feed.includes('⚔'); const estimacion = tf.includes('estimación'); return ('FRANJA: ' + (vivos ? 'con arcos vivos' : 'en sombra (honesto)') + ' · chip feed: ' + (chip ? 'presente' : 'sin arcos de la campaña') + ' · estima declarada: ' + (estimacion ? 'SÍ' : 'NO')).slice(0, 120); })()" 2>&1 | head -c 400; echo
agent-browser screenshot /tmp/render/qa322-atribucion.png >/dev/null 2>&1

echo "── C) CONSOLA LIMPIA + SIN DESBORDES ──"
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 1440 — REGRESIÓN' : 'sin desborde en 1440'; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -3; echo "(vacío = sin errores de página)"
agent-browser console 2>&1 | grep -i "maximum update\|too many re-renders\|hydration" && echo "REGRESIÓN DE RENDER/HIDRATACIÓN" || echo "consola sin bucles ni deshidrataciones"
agent-browser console 2>&1 | grep -i '\[error\]' | grep -v 'Download the React DevTools' | head -3 || echo "consola sin errores"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 390 — REGRESIÓN' : 'sin desborde en 390 (móvil ok)'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa322-movil.png >/dev/null 2>&1

agent-browser close >/dev/null 2>&1
kill "$SRVPID" 2>/dev/null; sleep 1; kill -9 "$SRVPID" 2>/dev/null
curl -s -o /dev/null --max-time 2 "$BASE/api/health" && echo "ZOMBI" || echo "puerto 3496 libre — cero zombis"
echo "QA VISUAL v322 FIN"

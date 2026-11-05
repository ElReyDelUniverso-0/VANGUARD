#!/bin/bash
# QA VISUAL v321 — LA PANTALLA EN EL ANILLO (el canal brief se dobla y respira)
# Ley v302: arranque + cirugía visual + cierre en UNA llamada.
# Lección v320: verificación COMPACTA en una sola carga (la casa remonta el
#   cine en cada perfil fresco; el encadenado de re-opens cuelga el arnés).
#   A) EL CANAL DOBLADO: el panel monta con la franja del EPISODIO DEL DÍA,
#      la ley del anillo declarada al lector y la voz de la serie en página
#   B) EL DESTACADO ES TOCABLE: click en la franja → el anillo abre su
#      episodio, la insignia «episodio del día» y la serie viajan al reproductor
#   C) consola limpia · sin desbordes 1440/390 · cero zombis
set -u
PORT=3496
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa321.log 2>&1 &
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
agent-browser eval "(() => { localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['canalbrief'])); localStorage.setItem('vg-cromo-activa-v106', 'canalbrief'); return 'pestaña canalbrief sembrada'; })()" 2>&1 | head -1
agent-browser open "$BASE/?r=1" >/dev/null 2>&1
sleep 9
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find((x) => /saltar el cine/i.test(x.textContent||'')); if (b) { b.click(); return 'cine fuera'; } return 'sin cine'; })()" >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find((x) => /^skip$/i.test((x.textContent||'').trim())); if (b) { b.click(); return 'manual fuera'; } return 'sin manual'; })()" >/dev/null 2>&1
sleep 1

echo "── A) EL CANAL DOBLADO Y EL ANILLO DECLARADO ──"
agent-browser eval "(() => { const t = document.body.textContent || ''; if (!t.includes('Canal Brief')) return 'PANEL NO MONTÓ'; if (!t.includes('Episodio del día ·')) return 'REGRESIÓN: el episodio del día no está declarado'; if (!t.includes('dos días seguidos jamás repiten el destacado')) return 'REGRESIÓN: la ley del anillo no se declara al lector'; const franja = [...document.querySelectorAll('button')].find((x) => (x.getAttribute('aria-label') || '') === 'Abrir el episodio destacado de hoy'); if (!franja) return 'REGRESIÓN: la franja del anillo no existe'; const serie = franja.querySelector('span > span').textContent.replace('Episodio del día ·','').trim(); return ('ANILLO VERIFICADO: destacado de la serie ' + serie).slice(0, 120); })()" 2>&1 | head -c 400; echo
agent-browser screenshot /tmp/render/qa321-anillo.png >/dev/null 2>&1

echo "── B) EL DESTACADO ES TOCABLE ──"
agent-browser eval "(() => { const franja = [...document.querySelectorAll('button')].find((x) => (x.getAttribute('aria-label') || '') === 'Abrir el episodio destacado de hoy'); if (!franja) return 'REGRESIÓN: la franja no es tocable'; const serie = franja.querySelector('span > span').textContent.replace('Episodio del día ·','').trim(); franja.click(); return ('click en el destacado: ' + serie).slice(0, 120); })()" 2>&1 | head -c 400; echo
sleep 2
agent-browser eval "(() => { const franja = [...document.querySelectorAll('button')].find((x) => (x.getAttribute('aria-label') || '') === 'Abrir el episodio destacado de hoy'); const serie = franja ? franja.querySelector('span > span').textContent.replace('Episodio del día ·','').trim() : ''; const t = document.body.textContent || ''; if (!t.includes('episodio del día')) return 'REGRESIÓN: la insignia del destacado no llegó al reproductor'; if (!t.includes(serie.toUpperCase())) return 'REGRESIÓN: la voz de la serie no viaja al reproductor'; return ('DESTACADO EN PANTALLA: ' + serie.toUpperCase() + ' abre con su insignia — la pantalla sabe quién habla').slice(0, 140); })()" 2>&1 | head -c 400; echo
agent-browser screenshot /tmp/render/qa321-destacado.png >/dev/null 2>&1

echo "── C) CONSOLA LIMPIA + SIN DESBORDES ──"
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 1440 — REGRESIÓN' : 'sin desborde en 1440'; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -3; echo "(vacío = sin errores de página)"
agent-browser console 2>&1 | grep -i "maximum update\|too many re-renders\|hydration" && echo "REGRESIÓN DE RENDER/HIDRATACIÓN" || echo "consola sin bucles ni deshidrataciones"
agent-browser console 2>&1 | grep -i '\[error\]' | grep -v 'Download the React DevTools' | head -3 || echo "consola sin errores"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 390 — REGRESIÓN' : 'sin desborde en 390 (móvil ok)'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa321-movil.png >/dev/null 2>&1

agent-browser close >/dev/null 2>&1
kill "$SRVPID" 2>/dev/null; sleep 1; kill -9 "$SRVPID" 2>/dev/null
curl -s -o /dev/null --max-time 2 "$BASE/api/health" && echo "ZOMBI" || echo "puerto 3496 libre — cero zombis"
echo "QA VISUAL v321 FIN"
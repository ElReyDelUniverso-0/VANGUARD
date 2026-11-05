#!/bin/bash
# QA VISUAL v331 — LA MEMORIA DEL COMPILADOR (las 4 memorias muertas: el patrón
# useCallback + dep preserva la memoización manual en imagenes y pulsos)
# Ley v302: arranque + verificación + cierre en UNA llamada.
# Lecciones v320-v330: espera ACTIVA, DOM preciso, sembrar localStorage ANTES
# de recargar con ?r=N, la llave del cine en sessionStorage salta la película
# de forma DETERMINISTA (v330), y la predicción honesta captura el MISMO
# catálogo que la fuente (v328).
#   A) PULSOS: la columna de categorías cuenta con `contar` estabilizado —
#      la primera categoría del catálogo con su cifra viva; tocarla alterna
#      sin error (la memoria preservada respira)
#   B) IMAGENES: la primera foto del catálogo abre su lightbox y ESC lo
#      cierra (el teclado del lightbox intacto — la cicatriz retirada no
#      dejó herida); las etiquetas `catLabel` traducen
#   C) SIN BUCLES: consola limpia · sin desbordes 1440/390 · canon repo
#      restaurado · cero zombis
set -u
PORT=3507
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

# ── LA PREDICCIÓN HONESTA (el MISMO catálogo que la fuente — lección v328) ──
PRIMERA_CAT=$(node -e "
const m = require('fs').readFileSync('src/lib/pulsos-data.ts','utf8');
const b = m.match(/export const PULSO_CATS: PulsoCat\[\] = \[\s*\{ id: \"[^\"]+\", nombre: \"([^\"]+)\"/);
console.log(b ? b[1] : 'FALTA');
")
PRIMERA_FOTO=$(node -e "
const m = require('fs').readFileSync('src/lib/imagenes-data.ts','utf8');
const b = m.match(/export const IMAGENES_REALES: ImagenReal\[\] = \[\s*\{ id: \"[^\"]+\", label: \"([^\"]+)\"/);
console.log(b ? b[1] : 'FALTA');
")
if [ "$PRIMERA_CAT" = "FALTA" ] || [ "$PRIMERA_FOTO" = "FALTA" ]; then echo "PREDICCIÓN IMPOSIBLE — ABORTO"; exit 1; fi
echo "PREDICCIÓN: primera categoría = $PRIMERA_CAT · primera foto = $PRIMERA_FOTO"

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa331.log 2>&1 &
SRVPID=$!
ARRIBA=0
for i in $(seq 1 25); do sleep 1; if curl -s -o /dev/null "$BASE/api/health"; then ARRIBA=1; break; fi; done
echo "boot=$ARRIBA"
echo "SALUD: $(curl -s "$BASE/api/health" | head -c 160)"
if [ "$ARRIBA" != "1" ]; then echo "SIN SERVIDOR — ABORTO"; kill -9 $SRVPID 2>/dev/null; exit 1; fi

agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser console --clear >/dev/null 2>&1
agent-browser errors --clear >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 5
# sembrar la pestaña PULSOS y la llave del cine antes de recargar con ?r=N
# (lección v330: el arnés que conoce las llaves de la casa siembra en vez de esperar)
agent-browser eval "(() => { const k = 'vg-cine-entrada-v178-' + new Date().toLocaleDateString('en-CA'); sessionStorage.setItem(k, '1'); localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['pulsos'])); localStorage.setItem('vg-cromo-activa-v106', 'pulsos'); return 'pulsos sembrado + cine fuera'; })()" 2>&1 | head -1
agent-browser open "$BASE/?r=1" >/dev/null 2>&1
sleep 6
MONTO=0
for i in $(seq 1 12); do
  R=$(agent-browser eval "document.body.textContent.includes('Mapa de Pulsos en Vivo') ? 'MONTO' : 'no'" 2>/dev/null | tr -d '"')
  if [ "$R" = "MONTO" ]; then MONTO=1; break; fi
  sleep 2
done
echo "panel_pulsos_monto=$MONTO"
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find((x) => /^skip$/i.test((x.textContent||'').trim())); if (b) b.click(); return 'ok'; })()" >/dev/null 2>&1
sleep 1
agent-browser eval "(() => { const m = [...document.querySelectorAll('[aria-modal=\"true\"]')].find((d) => (d.getAttribute('aria-label')||'').includes('MANUAL')); const x = m && m.querySelector('button[aria-label]'); if (x) x.click(); return 'ok'; })()" >/dev/null 2>&1
sleep 1

echo "── A) PULSOS: LA COLUMNA QUE CUENTA (contar estabilizado) ──"
agent-browser eval "(() => { const col = [...document.querySelectorAll('p')].find((x) => (x.textContent||'').trim() === 'categorías'); if (!col) return 'sin columna ✗'; const panel = col.closest('.hud-panel'); const btns = [...panel.querySelectorAll('button')]; const primera = btns.find((b) => (b.textContent||'').includes('$PRIMERA_CAT')); if (!primera) return 'sin $PRIMERA_CAT ✗'; const cifra = (primera.textContent||'').match(/\d+/); return 'CATEGORÍAS: $PRIMERA_CAT con cifra ' + (cifra ? cifra[0] + ' ✓ (contar respira tras el useCallback)' : 'ausente ✗'); })()" 2>&1 | head -c 240; echo
# tocar la categoría: el toggle vive (el oyente 3D y el botón 2D comparten toggleCat)
agent-browser eval "(() => { const col = [...document.querySelectorAll('p')].find((x) => (x.textContent||'').trim() === 'categorías'); const panel = col.closest('.hud-panel'); const primera = [...panel.querySelectorAll('button')].find((b) => (b.textContent||'').includes('$PRIMERA_CAT')); primera.click(); return 'tocado'; })()" >/dev/null 2>&1
sleep 1
agent-browser eval "(() => { const col = [...document.querySelectorAll('p')].find((x) => (x.textContent||'').trim() === 'categorías'); const panel = col.closest('.hud-panel'); const primera = [...panel.querySelectorAll('button')].find((b) => (b.textContent||'').includes('$PRIMERA_CAT')); const apagada = (primera.className||'').includes('opacity-40'); primera.click(); return 'TOGGLE: ' + (apagada ? 'la categoría se apagó y volvió ✓ (contar y catsOff preservados)' : 'no cambió ✗'); })()" 2>&1 | head -c 220; echo
agent-browser screenshot /tmp/render/qa331-pulsos.png >/dev/null 2>&1

echo "── B) IMAGENES: EL LIGHTBOX Y SU TECLADO (cicatriz limpia) ──"
agent-browser eval "(() => { localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['imagenes'])); localStorage.setItem('vg-cromo-activa-v106', 'imagenes'); return 'imagenes sembrado'; })()" >/dev/null 2>&1
agent-browser open "$BASE/?r=2" >/dev/null 2>&1
sleep 6
FOTO=0
for i in $(seq 1 10); do
  R=$(agent-browser eval "(() => { const b = document.querySelector('button[aria-label=\"$PRIMERA_FOTO\"]'); return b ? 'SI' : 'no'; })()" 2>/dev/null | tr -d '"')
  if [ "$R" = "SI" ]; then FOTO=1; break; fi
  sleep 2
done
echo "foto_en_rejilla=$FOTO"
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find((x) => /^skip$/i.test((x.textContent||'').trim())); if (b) b.click(); return 'ok'; })()" >/dev/null 2>&1
sleep 1
agent-browser eval "(() => { const b = document.querySelector('button[aria-label=\"$PRIMERA_FOTO\"]'); if (!b) return 'sin foto ✗'; b.click(); return 'clic'; })()" >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const lb = document.querySelector('[aria-label=\"$PRIMERA_FOTO\"][role=\"dialog\"], [aria-modal=\"true\"]'); const visible = [...document.querySelectorAll('[aria-label=\"$PRIMERA_FOTO\"]')].length > 1; return 'LIGHTBOX: ' + (visible ? 'abierto con $PRIMERA_FOTO ✓ (catLabel y la fila viva)' : 'no abrió ✗'); })()" 2>&1 | head -c 220; echo
agent-browser eval "(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); return 'esc lanzado'; })()" >/dev/null 2>&1
sleep 1
agent-browser eval "(() => { const quedan = [...document.querySelectorAll('[aria-label=\"$PRIMERA_FOTO\"]')].length; return 'ESC: lightbox ' + (quedan <= 1 ? 'CERRADO ✓ (el teclado del lightbox intacto — la cicatriz retirada no dejó herida)' : 'sigue abierto ✗'); })()" 2>&1 | head -c 240; echo
agent-browser screenshot /tmp/render/qa331-imagenes.png >/dev/null 2>&1

echo "── C) SIN BUCLES NI DESHIDRATACIONES ──"
agent-browser console 2>&1 | rg -i "maximum update|too many|hydration|hydrat" | head -3; echo "(vacío = consola limpia — la memoria preservada se estabiliza)"

echo "── D) MÓVIL + DESBORDES ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 390 — REGRESIÓN' : 'sin desborde en 390'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa331-movil.png >/dev/null 2>&1
agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 1440 — REGRESIÓN' : 'sin desborde en 1440'; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -3; echo "(vacío = sin errores de página)"

echo "── CIERRE ──"
agent-browser close >/dev/null 2>&1
kill $SRVPID 2>/dev/null; sleep 1
kill -9 $SRVPID 2>/dev/null
curl -s -o /dev/null --max-time 2 "$BASE/api/health" && echo "ZOMBI" || echo "puerto 3507 libre — cero zombis"
git checkout HEAD -- db/custom.db 2>/dev/null
echo "canon repo restaurado"
echo "QA VISUAL v331 FIN"

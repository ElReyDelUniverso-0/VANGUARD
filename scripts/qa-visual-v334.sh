#!/bin/bash
# QA VISUAL v334 — EL ANILLO DEL ARCHIVO (la DÉCIMO-PRIMERA puerta del anillo:
# la sala de lectura deja su reloj PRIVADO y entra al reloj CENTRAL — ley v324)
# Ley v302: arranque + verificación + cierre en UNA llamada.
# Lecciones v320-v333: espera ACTIVA, sembrar localStorage ANTES de ?r=N, la
# llave del cine en sessionStorage (v330), predicción desde la FUENTE (v328),
# cierre por pgrep (v332).
#   A) LA PREDICCIÓN: día UTC - 1 % 23 predice el expediente del día → la
#      franja lo CUMPLE con la ley del anillo en pantalla y el contador dual
#   B) LA INSIGNIA: la rejilla marca el del día con ⭐ DÍA (la estrella v57)
#   C) EL CLIC: abrir el dossier del día dispara el toast de la casa
#   D) SIN BUCLES: consola limpia · sin desbordes 1440/390 · cero errores
set -u
PORT=3515
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

# ── LA PREDICCIÓN HONESTA (el MISMO catálogo que la fuente — lección v328) ──
DIA=$(date -u +%j)                       # 1-indexado
IDX=$((DIA - 1))                         # diaDelAnillo es 0-indexado (ley v324)
MAPA=$(node -e "
const m = require('fs').readFileSync('src/lib/expedientes-datos.ts','utf8');
const ids = [...m.matchAll(/id: \"([^\"]+)\"/g)].map(x=>x[1]);
const titulos = [...m.matchAll(/titulo: \"([^\"]+)\"/g)].map(x=>x[1]);
if (ids.length !== titulos.length || ids.length === 0) { console.log('FALTA'); process.exit(1); }
const i = $IDX % ids.length;
console.log(ids[i] + '|' + titulos[i] + '|' + ids.length);
")
if [ "$MAPA" = "FALTA" ]; then echo "PREDICCIÓN IMPOSIBLE — ABORTO"; exit 1; fi
ID_DIA=$(echo "$MAPA" | cut -d'|' -f1)
TITULO_DIA=$(echo "$MAPA" | cut -d'|' -f2)
TOTAL=$(echo "$MAPA" | cut -d'|' -f3)
echo "PREDICCIÓN: día $DIA (0-indexado $IDX) % $TOTAL = $((IDX % TOTAL)) → $TITULO_DIA ($ID_DIA)"

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa334.log 2>&1 &
ARRIBA=0
for i in $(seq 1 25); do sleep 1; if curl -s -o /dev/null "$BASE/api/health"; then ARRIBA=1; break; fi; done
echo "boot=$ARRIBA"
echo "SALUD: $(curl -s "$BASE/api/health" | head -c 160)"
if [ "$ARRIBA" != "1" ]; then echo "SIN SERVIDOR — ABORTO"; pkill -9 -f "standalone/server.js" 2>/dev/null; exit 1; fi

agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser console --clear >/dev/null 2>&1
agent-browser errors --clear >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 5
# sembrar la pestaña EXPEDIENTES y la llave del cine (lección v330)
agent-browser eval "(() => { const k = 'vg-cine-entrada-v178-' + new Date().toLocaleDateString('en-CA'); sessionStorage.setItem(k, '1'); localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['expedientes'])); localStorage.setItem('vg-cromo-activa-v106', 'expedientes'); return 'expedientes sembrado + cine fuera'; })()" 2>&1 | head -1
agent-browser open "$BASE/?r=1" >/dev/null 2>&1
sleep 6
MONTO=0
for i in $(seq 1 12); do
  R=$(agent-browser eval "document.body.textContent.includes('Sala de lectura FOIA') ? 'MONTO' : 'no'" 2>/dev/null | tr -d '"')
  if [ "$R" = "MONTO" ]; then MONTO=1; break; fi
  sleep 2
done
echo "panel_monto=$MONTO"
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find((x) => /^skip$/i.test((x.textContent||'').trim())); if (b) b.click(); return 'ok'; })()" >/dev/null 2>&1
sleep 1
agent-browser eval "(() => { const m = [...document.querySelectorAll('[aria-modal=\"true\"]')].find((d) => (d.getAttribute('aria-label')||'').includes('MANUAL')); const x = m && m.querySelector('button[aria-label]'); if (x) x.click(); return 'ok'; })()" >/dev/null 2>&1
sleep 1

echo "── A) LA FRANJA CUMPLE LA PREDICCIÓN ──"
FRANJA=0
for i in $(seq 1 10); do
  R=$(agent-browser eval "(() => { const f = document.querySelector('[aria-label=\"Expediente del día\"]'); return f ? 'SI' : 'no'; })()" 2>/dev/null | tr -d '"')
  if [ "$R" = "SI" ]; then FRANJA=1; break; fi
  sleep 1
done
echo "franja_montada=$FRANJA"
agent-browser eval "(() => { const f = document.querySelector('[aria-label=\"Expediente del día\"]'); if (!f) return 'FRANJA AUSENTE ✗'; const esperado = \"$TITULO_DIA\"; const cumple = f.textContent.includes(esperado); const ley = f.textContent.includes('el anillo del archivo avanza un expediente por día'); const honesto = f.textContent.includes('(relectura libre)') || f.textContent.includes('(+recompensa)'); const rec = f.textContent.includes('recompensa x1.5'); return 'FRANJA: ' + (cumple ? 'predicción CUMPLIDA ✓ (' + esperado + ')' : 'predicción FALLIDA ✗') + ' · ley ' + (ley ? 'en pantalla ✓' : 'ausente ✗') + ' · contador ' + (honesto ? 'dual honesto ✓' : 'ausente ✗') + ' · x1.5 ' + (rec ? '✓' : '✗'); })()" 2>&1 | head -c 340; echo

echo "── B) LA INSIGNIA EN LA REJILLA ──"
agent-browser eval "(() => { const tarjeta = [...document.querySelectorAll('article')].find((x) => (x.textContent||'').includes('$TITULO_DIA')); if (!tarjeta) return 'sin tarjeta ✗'; const insignia = (tarjeta.textContent||'').includes('⭐ DÍA'); const liberado = (tarjeta.textContent||'').includes('LIBERADO'); return 'REJILLA: ' + (insignia ? 'la ficha del día lleva ⭐ DÍA ✓' : 'sin insignia ✗') + ' · clasificación tachada ' + (liberado ? '→ LIBERADO ✓' : '✗'); })()" 2>&1 | head -c 240; echo
agent-browser screenshot /tmp/render/qa334-franja.png >/dev/null 2>&1

echo "── C) EL CLIC REGISTRA LA LECTURA (el toast de la casa) ──"
# lección v334 (la segunda): la franja aparece en el shell SSR y zustand persist
# no escribe localStorage hasta el primer cambio de estado — el marcador de
# hidratación HONESTO son los reactProps del elemento (solo existen tras el mount)
HIDRO=0
for i in $(seq 1 20); do
  R=$(agent-browser eval "(() => { const f = document.querySelector('[aria-label=\"Expediente del día\"]'); if (!f) return 'no'; const k = Object.keys(f).find((x) => x.startsWith('__reactProps\$')); return k && typeof f[k].onClick === 'function' ? 'HIDRO' : 'no'; })()" 2>/dev/null | tr -d '"')
  if [ "$R" = "HIDRO" ]; then HIDRO=1; break; fi
  sleep 1
done
echo "hidratacion=$HIDRO (los reactProps del handler viven)"
sleep 1
# lección v334 (la tercera): el handler abre el dossier con window.open("_blank")
# — el tab NUEVO roba el foco y los evals siguientes miran el sitio EXTERNO.
# El arnés stubbea window.open: el handler de la casa trabaja entero en ESTE tab.
agent-browser eval "(() => { window.__openReal = window.open; window.open = () => null; const f = document.querySelector('[aria-label=\"Expediente del día\"]'); if (!f) return 'sin franja ✗'; f.click(); window.open = window.__openReal; return 'clic dado (popup stubbeado)'; })()" 2>&1 | head -1
sleep 3
agent-browser eval "(() => { let leidos = []; try { const s = JSON.parse(localStorage.getItem('vg_expedientes_v57') || '{}'); const st = s.state || s; leidos = st.readIds || []; } catch (e) {} const t = document.body.textContent; const toast = t.includes('EXPEDIENTE DEL DÍA'); const registro = leidos.includes('$ID_DIA'); const coleccion = t.includes('en tu colección') || t.includes('ya registrado'); return 'CLIC: ' + (toast ? 'toast ⭐ EXPEDIENTE DEL DÍA ✓ (el handler de la casa, x1.5)' : 'sin toast ✗') + ' · persist ' + (registro ? 'readIds contiene el del día ✓' : 'readIds vacío ✗') + ' · colección ' + (coleccion ? 'registrada ✓' : 'sin marca ✗'); })()" 2>&1 | head -c 300; echo
agent-browser screenshot /tmp/render/qa334-clic.png >/dev/null 2>&1

echo "── D) SIN BUCLES NI DESHIDRATACIONES ──"
agent-browser console 2>&1 | rg -i "maximum update|too many|hydration|hydrat" | head -3; echo "(vacío = consola limpia — el anillo vive en useMemo puro, cero efectos)"

echo "── E) MÓVIL + DESBORDES ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 390 — REGRESIÓN' : 'sin desborde en 390'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa334-movil.png >/dev/null 2>&1
agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 1440 — REGRESIÓN' : 'sin desborde en 1440'; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -6; echo "(vacío = sin errores de página)"

echo "── CIERRE (el centinela pgrep — ley v332) ──"
agent-browser close >/dev/null 2>&1
pkill -9 -f "standalone/server.js" 2>/dev/null; sleep 1
pgrep -f "standalone/server.js" >/dev/null && echo "ZOMBI (pgrep)" || echo "pgrep limpio — cero zombis"
git checkout HEAD -- db/custom.db 2>/dev/null
echo "canon repo restaurado"
echo "QA VISUAL v334 FIN"

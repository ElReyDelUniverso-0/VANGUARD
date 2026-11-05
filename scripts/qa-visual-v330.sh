#!/bin/bash
# QA VISUAL v330 — EL PODER DEL DÍA (la NOVENA puerta del anillo de la escuela:
# el dossier del poder gira con el reloj central)
# Ley v302: arranque + verificación + cierre en UNA llamada.
# Lecciones v320-v329: espera ACTIVA, DOM preciso, sembrar localStorage antes
# de recargar con ?r=N, y la PREDICCIÓN HONESTA captura el MISMO catálogo que
# la fuente (v328) — los id/nombre se extraen de personas-data.ts en orden de
# archivo, el día es el UTC del reloj central (0-indexado, ley v324).
#   A) LA PREDICCIÓN: día UTC - 1 % 34 predice el rostro del día → la franja
#      lo cumple con la ley del anillo en pantalla
#   B) LA ESTRELLA: el mapa del poder marca el sillón del día con ★ y el
#      índice lleva la estrella en su fila
#   C) EL CLIC: «abrir expediente del día →» abre el expediente del rostro
#      previsto (irAlExpediente, el handler de la casa)
#   D) EL CONTADOR HONESTO: señales vivas o silencio — los dos estados son verdad
#   E) SIN BUCLES: consola limpia · sin desbordes 1440/390 · canon repo
#      restaurado · cero zombis
set -u
PORT=3506
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

# ── LA PREDICCIÓN HONESTA (el MISMO catálogo que la fuente — lección v328) ──
DIA=$(date -u +%j)                       # 1-indexado (día 309 el 5-nov)
IDX=$((DIA - 1))                         # diaDelAnillo es 0-indexado (ley v324)
MAPA=$(node -e "
const m = require('fs').readFileSync('src/lib/personas-data.ts','utf8');
const ids = [...m.matchAll(/id: \"([^\"]+)\"/g)].map(x=>x[1]);
const nombres = [...m.matchAll(/nombre: \"([^\"]+)\"/g)].map(x=>x[1]);
if (ids.length !== nombres.length || ids.length === 0) { console.log('FALTA'); process.exit(1); }
const i = $IDX % ids.length;
console.log(ids[i] + '|' + nombres[i] + '|' + ids.length);
")
if [ "$MAPA" = "FALTA" ]; then echo "PREDICCIÓN IMPOSIBLE — ABORTO"; exit 1; fi
ID_DIA=$(echo "$MAPA" | cut -d'|' -f1)
NOMBRE_DIA=$(echo "$MAPA" | cut -d'|' -f2)
TOTAL=$(echo "$MAPA" | cut -d'|' -f3)
echo "PREDICCIÓN: día $DIA (0-indexado $IDX) % $TOTAL = $((IDX % TOTAL)) → $NOMBRE_DIA ($ID_DIA)"

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa330.log 2>&1 &
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
# sembrar la pestaña ROSTROS y la llave del cine antes de recargar con ?r=N
# (lección v330: la llave vg-cine-entrada-v178-<en-CA> en sessionStorage saltó
# el cine de entrada de forma determinista — el arnés que siembra no reza)
agent-browser eval "(() => { const k = 'vg-cine-entrada-v178-' + new Date().toLocaleDateString('en-CA'); sessionStorage.setItem(k, '1'); localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['rostros'])); localStorage.setItem('vg-cromo-activa-v106', 'rostros'); return 'rostros sembrado + cine fuera'; })()" 2>&1 | head -1
agent-browser open "$BASE/?r=1" >/dev/null 2>&1
sleep 6
MONTO=0
for i in $(seq 1 12); do
  R=$(agent-browser eval "document.body.textContent.includes('LOS ROSTROS DEL PODER') ? 'MONTO' : 'no'" 2>/dev/null | tr -d '"')
  if [ "$R" = "MONTO" ]; then MONTO=1; break; fi
  sleep 2
done
echo "panel_monto=$MONTO"
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find((x) => /saltar el cine/i.test(x.textContent||'')); if (b) { b.click(); return 'ok'; } return 'ok'; })()" >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find((x) => /^skip$/i.test((x.textContent||'').trim())); if (b) b.click(); return 'ok'; })()" >/dev/null 2>&1
sleep 1
agent-browser eval "(() => { const m = [...document.querySelectorAll('[aria-modal=\"true\"]')].find((d) => (d.getAttribute('aria-label')||'').includes('MANUAL')); if (!m) return 'sin manual'; const x = m.querySelector('button[aria-label]'); if (x) { x.click(); return 'manual fuera'; } return 'manual sin X'; })()" >/dev/null 2>&1
sleep 1

echo "── A) LA FRANJA CUMPLE LA PREDICCIÓN ──"
FRANJA=0
for i in $(seq 1 10); do
  R=$(agent-browser eval "(() => { const f = document.querySelector('[aria-label=\"Rostro del día\"]'); return f ? 'SI' : 'no'; })()" 2>/dev/null | tr -d '"')
  if [ "$R" = "SI" ]; then FRANJA=1; break; fi
  sleep 1
done
echo "franja_montada=$FRANJA"
agent-browser eval "(() => { const f = document.querySelector('[aria-label=\"Rostro del día\"]'); if (!f) return 'FRANJA AUSENTE ✗'; const esperado = \"$NOMBRE_DIA\"; const cumple = f.textContent.includes(esperado); const ley = f.textContent.includes('el anillo del poder avanza un rostro por día'); const honesto = f.textContent.includes('señales suyas vivas ahora') || f.textContent.includes('en silencio ahora'); return 'FRANJA: ' + (cumple ? 'predicción CUMPLIDA ✓ (' + esperado + ')' : 'predicción FALLIDA ✗') + ' · ley ' + (ley ? 'en pantalla ✓' : 'ausente ✗') + ' · contador ' + (honesto ? 'honesto ✓' : 'ausente ✗'); })()" 2>&1 | head -c 300; echo

echo "── B) LA ESTRELLA EN LAS DOS LISTAS ──"
agent-browser eval "(() => { const s = document.querySelector('[aria-label^=\"Mapa mundial\"]'); if (!s) return 'sin mapa ✗'; const t = [...s.querySelectorAll('text')].some((x) => (x.textContent||'').includes('★')); return 'MAPA: ' + (t ? 'estrella del día en el sillón ✓' : 'sin estrella ✗'); })()" 2>&1 | head -1
agent-browser eval "(() => { const e = document.querySelector('span[title=\"rostro del día\"]'); return 'ÍNDICE: ' + (e ? 'estrella en la fila ✓ (' + e.parentElement.textContent.trim().slice(0, 40) + '…)' : 'sin estrella ✗'); })()" 2>&1 | head -c 200; echo
agent-browser screenshot /tmp/render/qa330-franja.png >/dev/null 2>&1

echo "── C) EL CLIC ABRE EL EXPEDIENTE DEL DÍA ──"
agent-browser eval "(() => { const f = document.querySelector('[aria-label=\"Rostro del día\"]'); const b = [...f.querySelectorAll('button')].find((x) => /abrir expediente del día/i.test(x.textContent||'')); if (!b) return 'sin botón ✗'; b.click(); return 'clic dado'; })()" >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const ex = document.getElementById('v130-expediente'); if (!ex) return 'sin expediente ✗'; const esperado = \"$NOMBRE_DIA\"; const abierto = ex.textContent.includes(esperado); return 'EXPEDIENTE: ' + (abierto ? 'el del día ABIERTO ✓ (' + esperado + ' — el handler de la casa)' : 'no muestra al rostro del día ✗'); })()" 2>&1 | head -c 260; echo

echo "── D) SIN BUCLES NI DESHIDRATACIONES ──"
agent-browser console 2>&1 | rg -i "maximum update|too many|hydration|hydrat" | head -3; echo "(vacío = consola limpia — el anillo vive en useMemo puro)"

echo "── E) MÓVIL + DESBORDES ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 390 — REGRESIÓN' : 'sin desborde en 390'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa330-movil.png >/dev/null 2>&1
agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 1440 — REGRESIÓN' : 'sin desborde en 1440'; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -3; echo "(vacío = sin errores de página)"

echo "── CIERRE ──"
agent-browser close >/dev/null 2>&1
kill $SRVPID 2>/dev/null; sleep 1
kill -9 $SRVPID 2>/dev/null
curl -s -o /dev/null --max-time 2 "$BASE/api/health" && echo "ZOMBI" || echo "puerto 3506 libre — cero zombis"
git checkout HEAD -- db/custom.db 2>/dev/null
echo "canon repo restaurado"
echo "QA VISUAL v330 FIN"

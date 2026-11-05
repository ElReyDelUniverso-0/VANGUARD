#!/bin/bash
# QA VISUAL v332 — LA ENTRADA DEL DÍA (la DÉCIMA puerta del anillo de la
# escuela: la enciclopedia mundial gira con el reloj central)
# Ley v302: arranque + verificación + cierre en UNA llamada.
# Lecciones v320-v331: espera ACTIVA, DOM preciso, sembrar localStorage ANTES
# de recargar con ?r=N, la llave del cine en sessionStorage (v330), y la
# PREDICCIÓN HONESTA captura el MISMO catálogo que la fuente (v328).
#   A) LA PREDICCIÓN: día UTC - 1 % 42 predice la entrada del día → la franja
#      lo cumple con la ley del anillo en pantalla y el contador honesto
#   B) LA ESTRELLA: la ficha del día lleva ★ delante de su categoría en la
#      rejilla
#   C) EL CLIC: «abrir entrada del día →» abre el detalle de la ficha prevista
#      (openDetail, el handler de la casa — con su XP)
#   D) SIN BUCLES: consola limpia · sin desbordes 1440/390 · canon repo
#      restaurado · cero zombis
set -u
PORT=3508
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

# ── LA PREDICCIÓN HONESTA (el MISMO catálogo que la fuente — lección v328) ──
DIA=$(date -u +%j)                       # 1-indexado
IDX=$((DIA - 1))                         # diaDelAnillo es 0-indexado (ley v324)
MAPA=$(node -e "
const m = require('fs').readFileSync('src/lib/wiki-data.ts','utf8');
const ids = [...m.matchAll(/id: \"([^\"]+)\"/g)].map(x=>x[1]);
// lección v332: «subtitle» CONTIENE «title» — el regex suelto capturaba 84
// (42 fichas × 2); el ancla «, title: \"» captura solo el título de la ficha
const titles = [...m.matchAll(/, title: \"([^\"]+)\"/g)].map(x=>x[1]);
if (ids.length !== titles.length || ids.length === 0) { console.log('FALTA'); process.exit(1); }
const i = $IDX % ids.length;
console.log(ids[i] + '|' + titles[i] + '|' + ids.length);
")
if [ "$MAPA" = "FALTA" ]; then echo "PREDICCIÓN IMPOSIBLE — ABORTO"; exit 1; fi
ID_DIA=$(echo "$MAPA" | cut -d'|' -f1)
TITULO_DIA=$(echo "$MAPA" | cut -d'|' -f2)
TOTAL=$(echo "$MAPA" | cut -d'|' -f3)
echo "PREDICCIÓN: día $DIA (0-indexado $IDX) % $TOTAL = $((IDX % TOTAL)) → $TITULO_DIA ($ID_DIA)"

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa332.log 2>&1 &
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
# sembrar la pestaña ENCICLOPEDIA y la llave del cine (lección v330)
agent-browser eval "(() => { const k = 'vg-cine-entrada-v178-' + new Date().toLocaleDateString('en-CA'); sessionStorage.setItem(k, '1'); localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['enciclopedia'])); localStorage.setItem('vg-cromo-activa-v106', 'enciclopedia'); return 'enciclopedia sembrado + cine fuera'; })()" 2>&1 | head -1
agent-browser open "$BASE/?r=1" >/dev/null 2>&1
sleep 6
MONTO=0
for i in $(seq 1 12); do
  R=$(agent-browser eval "document.body.textContent.includes('ENCICLOPEDIA MUNDIAL') ? 'MONTO' : 'no'" 2>/dev/null | tr -d '"')
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
  R=$(agent-browser eval "(() => { const f = document.querySelector('[aria-label=\"Entrada del día\"]'); return f ? 'SI' : 'no'; })()" 2>/dev/null | tr -d '"')
  if [ "$R" = "SI" ]; then FRANJA=1; break; fi
  sleep 1
done
echo "franja_montada=$FRANJA"
agent-browser eval "(() => { const f = document.querySelector('[aria-label=\"Entrada del día\"]'); if (!f) return 'FRANJA AUSENTE ✗'; const esperado = \"$TITULO_DIA\"; const cumple = f.textContent.includes(esperado); const ley = f.textContent.includes('el anillo de la enciclopedia avanza una entrada por día'); const honesto = f.textContent.includes('sin leer — +5 XP esperándote') || f.textContent.includes('leída — está en tu historial'); return 'FRANJA: ' + (cumple ? 'predicción CUMPLIDA ✓ (' + esperado + ')' : 'predicción FALLIDA ✗') + ' · ley ' + (ley ? 'en pantalla ✓' : 'ausente ✗') + ' · contador ' + (honesto ? 'honesto ✓' : 'ausente ✗'); })()" 2>&1 | head -c 320; echo

echo "── B) LA ESTRELLA EN LA REJILLA ──"
agent-browser eval "(() => { const tarjeta = [...document.querySelectorAll('button')].find((x) => (x.textContent||'').includes('$TITULO_DIA')); if (!tarjeta) return 'sin tarjeta ✗'; const insignia = tarjeta.querySelector('span'); const estrella = insignia && (insignia.textContent||'').startsWith('★'); return 'REJILLA: ' + (estrella ? 'la ficha del día lleva ★ ✓ (' + (insignia.textContent||'').trim() + ')' : 'sin estrella ✗'); })()" 2>&1 | head -c 240; echo
agent-browser screenshot /tmp/render/qa332-franja.png >/dev/null 2>&1

echo "── C) EL CLIC ABRE EL DETALLE DEL DÍA ──"
agent-browser eval "(() => { const f = document.querySelector('[aria-label=\"Entrada del día\"]'); const b = [...f.querySelectorAll('button')].find((x) => /abrir entrada del día/i.test(x.textContent||'')); if (!b) return 'sin botón ✗'; b.click(); return 'clic dado'; })()" >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const modal = document.querySelector('[aria-modal=\"true\"], .fixed.inset-0'); const esperado = \"$TITULO_DIA\"; const cronologia = document.body.textContent.includes('Cronologia'); const abierto = modal && modal.textContent.includes(esperado); return 'DETALLE: ' + (abierto ? 'el del día ABIERTO ✓ (' + esperado + ' — el handler de la casa' + (cronologia ? ' + cronologia' : '') + ')' : 'no abrió ✗'); })()" 2>&1 | head -c 280; echo
agent-browser screenshot /tmp/render/qa332-detalle.png >/dev/null 2>&1

echo "── D) SIN BUCLES NI DESHIDRATACIONES ──"
agent-browser console 2>&1 | rg -i "maximum update|too many|hydration|hydrat" | head -3; echo "(vacío = consola limpia — el anillo vive en useMemo puro)"

echo "── E) MÓVIL + DESBORDES ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 390 — REGRESIÓN' : 'sin desborde en 390'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa332-movil.png >/dev/null 2>&1
agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 1440 — REGRESIÓN' : 'sin desborde en 1440'; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -3; echo "(vacío = sin errores de página)"

echo "── CIERRE ──"
agent-browser close >/dev/null 2>&1
kill $SRVPID 2>/dev/null; sleep 1
kill -9 $SRVPID 2>/dev/null
curl -s -o /dev/null --max-time 2 "$BASE/api/health" && echo "ZOMBI" || echo "puerto 3508 libre — cero zombis"
git checkout HEAD -- db/custom.db 2>/dev/null
echo "canon repo restaurado"
echo "QA VISUAL v332 FIN"

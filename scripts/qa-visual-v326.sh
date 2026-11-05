#!/bin/bash
# QA VISUAL v326 — EL ARSENAL SE PUEDE GIRAR (anillo séptimo + censo computado)
# Ley v302: arranque + verificación + cierre en UNA llamada.
# Lecciones v320-v325: espera ACTIVA, DOM preciso, verificar ESTADOS (no
# instantes), la predicción del anillo se COMPUTA del fuente (el arnés
# verifica lo que el DATO dice, no lo que el arquitecto asume — lección v324),
# la casa tiene más de un diálogo vivo (lección v325: el manual muere por su X).
#   A) LA FRANJA DEL ANILLO: día N % 21 predice un arma y la franja la cumple
#      con su origen, su era y su crónica — SÉPTIMO consumidor ante el ojo
#   B) EL CENSO COMPUTADO: 6 chips por categoría a la vista, suma 21
#   C) EL CLIC ABRE LA FICHA: el arma del día en foco con su chip de categoría
#   D) consola limpia · sin desbordes 1440/390 · canon repo restaurado · cero zombis
set -u
PORT=3502
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

# ── la predicción del anillo, computada del FUENTE (nada a mano) ──
PREDICCION=$(node -e "
const fs = require('fs');
const f = fs.readFileSync('src/lib/arsenal-data.ts','utf8');
const ini = f.indexOf('export const ARSENAL');
const fin = f.indexOf('];', ini);
const bloque = f.slice(ini, fin);
const shorts = [...bloque.matchAll(/short: \"([^\"]+)\",/g)].map(m => m[1]);
const dia = Math.max(0, Math.floor((Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate(), 12) - Date.UTC(new Date().getUTCFullYear(), 0, 1)) / 86400000));
console.log(dia + '|' + shorts[dia % shorts.length] + '|' + shorts.length);
")
DIA=$(echo "$PREDICCION" | cut -d'|' -f1)
ARMA=$(echo "$PREDICCION" | cut -d'|' -f2)
NTOTAL=$(echo "$PREDICCION" | cut -d'|' -f3)
echo "prediccion_del_anillo: dia=$DIA % $NTOTAL → $ARMA"

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa326.log 2>&1 &
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
agent-browser eval "(() => { localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['armeria'])); localStorage.setItem('vg-cromo-activa-v106', 'armeria'); return 'pestaña armería sembrada'; })()" 2>&1 | head -1
agent-browser open "$BASE/?r=1" >/dev/null 2>&1
sleep 6
# espera ACTIVA del panel (la cortina disipa cuando el último _next aterriza)
MONTO=0
for i in $(seq 1 12); do
  R=$(agent-browser eval "document.body.textContent.includes('ARMERÍA REAL') ? 'MONTO' : 'no'" 2>/dev/null | tr -d '"')
  if [ "$R" = "MONTO" ]; then MONTO=1; break; fi
  sleep 2
done
echo "panel_monto=$MONTO"
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find((x) => /saltar el cine/i.test(x.textContent||'')); if (b) { b.click(); return 'ok'; } return 'ok'; })()" >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find((x) => /^skip$/i.test((x.textContent||'').trim())); if (b) b.click(); return 'ok'; })()" >/dev/null 2>&1
sleep 1
# el manual manda su X si sobrevivió a los skips (lección v324/v325)
agent-browser eval "(() => { const m = [...document.querySelectorAll('[aria-modal=\"true\"]')].find((d) => (d.getAttribute('aria-label')||'').includes('MANUAL')); if (!m) return 'sin manual'; const x = m.querySelector('button[aria-label]'); if (x) { x.click(); return 'manual fuera'; } return 'manual sin X'; })()" >/dev/null 2>&1
sleep 1

echo "── A) LA FRANJA DEL ANILLO (predice $ARMA y la franja lo cumple) ──"
FRANJA=0
for i in $(seq 1 8); do
  R=$(agent-browser eval "(() => { const f = document.querySelector('[aria-label=\"Arma del día\"]'); return f ? (f.textContent.includes('$ARMA') ? 'SI' : 'otra') : 'no'; })()" 2>/dev/null | tr -d '"')
  if [ "$R" = "SI" ]; then FRANJA=1; break; fi
  sleep 1
done
agent-browser eval "(() => { const f = document.querySelector('[aria-label=\"Arma del día\"]'); if (!f) return 'REGRESIÓN: la franja del arma del día no está'; const t = f.textContent || ''; const ley = t.includes('el anillo de la armería avanza un arma por día'); return ('FRANJA VIVA: ' + (t.includes('$ARMA') ? 'ARMA DEL DÍA $ARMA ✓' : 'ARMA DISTINTA ✗ (predije $ARMA)') + ' · ley del anillo en pantalla ' + (ley ? '✓' : '✗')).slice(0, 200); })()" 2>&1 | head -c 240; echo
agent-browser screenshot /tmp/render/qa326-franja.png >/dev/null 2>&1

echo "── B) EL CENSO COMPUTADO ──"
agent-browser eval "(() => { const f = document.querySelector('[aria-label=\"Arma del día\"]'); if (!f) return 'sin franja'; const chips = [...f.querySelectorAll('span[title]')].filter((s) => / en el catálogo/.test(s.getAttribute('title')||'')); const nums = chips.map((c) => { const m = (c.getAttribute('title')||'').match(/^(\\d+)/); return m ? parseInt(m[1], 10) : 0; }); const suma = nums.reduce((a, b) => a + b, 0); return 'CENSO: ' + chips.length + ' chips (' + nums.join('+') + '), suma ' + suma + (suma === Number('$NTOTAL') ? ' ✓' : ' ✗ (esperaba $NTOTAL)'); })()" 2>&1 | head -c 220; echo

echo "── C) EL CLIC ABRE LA FICHA ──"
agent-browser eval "(() => { const f = document.querySelector('[aria-label=\"Arma del día\"]'); const btn = f && f.querySelector('button'); if (!btn) return 'sin botón de franja'; btn.click(); return 'clic en el arma del día'; })()" >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const imgs = [...document.querySelectorAll('img')]; const foto = imgs.find((i) => (i.closest('.hud-panel') || document.body).textContent.includes('$ARMA')); const chip = [...document.querySelectorAll('span')].some((s) => /Defensa aérea|Antitanque|Artillería|Blindados|Fusilería|Aérea no tripulada/.test(s.textContent||'') && s.closest('.hud-panel')); return ('FICHA EN FOCO: ' + (foto ? 'foto del arma del día presente ✓' : 'sin foto del arma') + ' · chip de categoría ' + (chip ? '✓' : '✗')).slice(0, 180); })()" 2>&1 | head -c 200; echo
agent-browser screenshot /tmp/render/qa326-ficha.png >/dev/null 2>&1

echo "── D) MÓVIL + CONSOLA + DESBORDES ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 390 — REGRESIÓN' : 'sin desborde en 390'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa326-movil.png >/dev/null 2>&1
agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 1440 — REGRESIÓN' : 'sin desborde en 1440'; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -3; echo "(vacío = sin errores de página)"
agent-browser console 2>&1 | rg -i "hydration|hydrat|maximum update|too many" | head -3; echo "(vacío = sin bucles ni deshidrataciones)"

echo "── CIERRE ──"
agent-browser close >/dev/null 2>&1
kill $SRVPID 2>/dev/null; sleep 1
kill -9 $SRVPID 2>/dev/null
curl -s -o /dev/null --max-time 2 "$BASE/api/health" && echo "ZOMBI" || echo "puerto 3502 libre — cero zombis"
git checkout HEAD -- db/custom.db 2>/dev/null
echo "canon repo restaurado"
echo "QA VISUAL v326 FIN"

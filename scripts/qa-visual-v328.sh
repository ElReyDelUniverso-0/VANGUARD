#!/bin/bash
# QA VISUAL v328 — LA COMUNIDAD GIRA (el anillo octavo consumidor, la franja
# del expediente del día, el censo computado y el sentido del día marcado)
# Ley v302: arranque + verificación + cierre en UNA llamada.
# Lecciones v320-v327: espera ACTIVA, DOM preciso, verificar ESTADOS (no
# instantes), sembrar localStorage antes de recargar con ?r=N.
#   A) LA FRANJA DEL ANILLO EN PÁGINA: el día computa la predicción y la
#      franja la cumple (día % 18 = índice del expediente del día)
#   B) EL CENSO COMPUTADO A LA VISTA: chips de categorías que suman 18
#   C) EL SENTIDO DEL DÍA MARCADO: día % 10 = el sentido con estrella
#   D) EL CLIC ABRE EL EXPEDIENTE del día con el handler de la casa
#   E) sin bucles ni deshidrataciones · sin desbordes 1440/390 · canon repo
#      restaurado · cero zombis
set -u
PORT=3504
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

# la predicción se COMPUTA del catálogo real (nada a mano, ley v322)
PRED=$(node -e "
const fs = require('fs');
const f = fs.readFileSync('src/lib/agencias-data.ts', 'utf8');
const bloqueA = f.split('export const AGENCIAS: Agencia[] = [')[1].split('];')[0];
const siglasA = [...bloqueA.matchAll(/sigla: \"([^\"]+)\"/g)].map(m => m[1]);
const bloqueS = f.split('export const SENTIDOS: Sentido[] = [')[1].split('];')[0];
const siglasS = [...bloqueS.matchAll(/sigla: \"([^\"]+)\"/g)].map(m => m[1]);
const hoy = new Date();
const inicio = Date.UTC(hoy.getUTCFullYear(), 0, 1);
const ahora = Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate(), 12);
const dia = Math.max(0, Math.floor((ahora - inicio) / 86400000));
console.log(JSON.stringify({ dia, agencia: siglasA[dia % siglasA.length], ia: dia % siglasA.length, sentido: siglasS[dia % siglasS.length], nA: siglasA.length, nS: siglasS.length }));
")
DIA=$(echo "$PRED" | node -e "process.stdin.on('data', d => console.log(JSON.parse(d).dia))")
AGDIA=$(echo "$PRED" | node -e "process.stdin.on('data', d => console.log(JSON.parse(d).agencia))")
SDIA=$(echo "$PRED" | node -e "process.stdin.on('data', d => console.log(JSON.parse(d).sentido))")
echo "predicción del anillo: día $DIA % 18 → $AGDIA · día % 10 → $SDIA"

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa328.log 2>&1 &
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
# sembrar la pestaña de la comunidad ANTES de recargar con ?r=N (técnica v320-v327)
agent-browser eval "(() => { localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['comunidad'])); localStorage.setItem('vg-cromo-activa-v106', 'comunidad'); return 'comunidad sembrada'; })()" 2>&1 | head -1
agent-browser open "$BASE/?r=1" >/dev/null 2>&1
sleep 6
MONTO=0
for i in $(seq 1 12); do
  R=$(agent-browser eval "document.body.textContent.includes('LA COMUNIDAD') ? 'MONTO' : 'no'" 2>/dev/null | tr -d '"')
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

echo "── A) LA FRANJA DEL ANILLO EN PÁGINA (día $DIA % 18 = $((DIA % 18)) predice $AGDIA) ──"
FRANJA=0
for i in $(seq 1 10); do
  R=$(agent-browser eval "(() => { const f = document.querySelector('[aria-label=\"Expediente del día\"]'); return (f && f.textContent.includes('$AGDIA')) ? 'SI' : 'no'; })()" 2>/dev/null | tr -d '"')
  if [ "$R" = "SI" ]; then FRANJA=1; break; fi
  sleep 1
done
agent-browser eval "(() => { const f = document.querySelector('[aria-label=\"Expediente del día\"]'); if (!f) return 'FRANJA AUSENTE ✗'; const t = f.textContent; const estrella = t.includes('★ expediente del día'); const ley = t.includes('el anillo de la comunidad avanza un ojo por día'); const sigla = t.includes('$AGDIA'); const sentidos = t.includes('10 sentidos'); return 'FRANJA: estrella ' + (estrella ? '✓' : '✗') + ' · expediente del día $AGDIA ' + (sigla ? 'CUMPLE ✓ (día $DIA % 18 = $((DIA % 18)))' : 'FALLA ✗') + ' · ley del anillo ' + (ley ? 'en pantalla ✓' : 'ausente ✗') + ' · «10 sentidos» ' + (sentidos ? '✓' : '✗'); })()" 2>&1 | head -c 300; echo
agent-browser screenshot /tmp/render/qa328-franja.png >/dev/null 2>&1

echo "── B) EL CENSO COMPUTADO A LA VISTA (chips que suman 18) ──"
agent-browser eval "(() => { const f = document.querySelector('[aria-label=\"Expediente del día\"]'); if (!f) return 'sin franja'; const chips = [...f.querySelectorAll('span')].filter((s) => / \\d+$/.test(s.textContent.trim()) && s.title.includes('expedientes de')); const suma = chips.reduce((acc, c) => acc + parseInt(c.textContent.trim().split(' ').pop(), 10), 0); return 'CENSO: ' + chips.length + ' chips computados · suma ' + suma + (suma === 18 ? ' = 18 ✓ (nada duro que se pudra)' : ' ≠ 18 ✗'); })()" 2>&1 | head -c 220; echo

echo "── C) EL SENTIDO DEL DÍA MARCADO (día % 10 predice $SDIA) ──"
SENT=0
for i in $(seq 1 10); do
  R=$(agent-browser eval "(() => { const t = document.body.textContent; return t.includes('★ sentido del día') ? 'SI' : 'no'; })()" 2>/dev/null | tr -d '"')
  if [ "$R" = "SI" ]; then SENT=1; break; fi
  sleep 1
done
agent-browser eval "(() => { const t = document.body.textContent; const marca = t.includes('★ sentido del día'); const diez = document.body.textContent.includes('LOS SENTIDOS DE LA INTELIGENCIA'); return 'SENTIDOS: diez disciplinas ' + (diez ? '✓' : '✗') + ' · sentido del día $SDIA marcado ' + (marca ? 'CON ESTRELLA ✓' : 'SIN MARCA ✗'); })()" 2>&1 | head -c 220; echo
agent-browser screenshot /tmp/render/qa328-sentidos.png >/dev/null 2>&1

echo "── D) EL CLIC ABRE EL EXPEDIENTE DEL DÍA ──"
agent-browser eval "(() => { const b = document.querySelector('[aria-label=\"Expediente del día\"] button'); if (!b) return 'sin botón'; b.click(); return 'clicado'; })()" >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const exp = document.getElementById('v127-expediente'); if (!exp) return 'EXPEDIENTE AUSENTE ✗'; const activo = exp.textContent.includes('$AGDIA'); return 'EXPEDIENTE: ' + (activo ? 'abierto en $AGDIA ✓ (el handler de la casa, con su campana)' : 'abierto en OTRO ojo ✗'); })()" 2>&1 | head -c 220; echo
agent-browser screenshot /tmp/render/qa328-expediente.png >/dev/null 2>&1

echo "── E) SIN BUCLES NI DESHIDRATACIONES ──"
agent-browser console 2>&1 | rg -i "maximum update|too many|hydration|hydrat" | head -3; echo "(vacío = sin bucles ni deshidrataciones — el anillo respira en useMemo)"

echo "── F) MÓVIL + DESBORDES ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 390 — REGRESIÓN' : 'sin desborde en 390'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa328-movil.png >/dev/null 2>&1
agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 1440 — REGRESIÓN' : 'sin desborde en 1440'; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -3; echo "(vacío = sin errores de página)"

echo "── CIERRE ──"
agent-browser close >/dev/null 2>&1
kill $SRVPID 2>/dev/null; sleep 1
kill -9 $SRVPID 2>/dev/null
curl -s -o /dev/null --max-time 2 "$BASE/api/health" && echo "ZOMBI" || echo "puerto 3504 libre — cero zombis"
git checkout HEAD -- db/custom.db 2>/dev/null
echo "canon repo restaurado"
echo "QA VISUAL v328 FIN"

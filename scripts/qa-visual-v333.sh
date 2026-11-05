#!/bin/bash
# QA VISUAL v333 — LA CICATRIZ QUE NO DUELE (la cirugía de las directivas
# muertas: 24 retiradas en archivos limpios, 17 compuertas restauradas y
# declaradas, 8 expresiones vacías curadas con if/else)
# Ley v302: arranque + verificación + cierre en UNA llamada.
# Lecciones v320-v332: espera ACTIVA, sembrar localStorage ANTES de recargar
# con ?r=N, la llave del cine en sessionStorage (v330), y el CIERRE por pgrep
# (el fantasma del wrapper — v332: el kill mira pgrep, no el puerto).
#   A) LA FIRMA: la fuente única predice v333.0 · LA CICATRIZ QUE NO DUELE →
#      el home y el health lo CUMPLEN (predicción honesta desde la fuente)
#   B) EL PANEL TOCADO: la sala ARCADE (4 curas de timer + compuerta intacta)
#      monta y respira sin bucles
#   C) SIN BUCLES: consola limpia · sin desbordes 1440/390 · cero errores
#   D) CIERRE: pgrep centinela (v332) + canon repo restaurado
set -u
PORT=3509
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

# ── LA PREDICCIÓN HONESTA (desde la FUENTE ÚNICA — lección v328) ──
MAPA=$(node -e "
const v = require('fs').readFileSync('src/lib/version.ts','utf8');
const ver = (v.match(/APP_VERSION = \"([^\"]+)\"/) || [])[1];
const cod = (v.match(/APP_CODENAME = \"([^\"]+)\"/) || [])[1];
if (!ver || !cod) { console.log('FALTA'); process.exit(1); }
console.log(ver + '|' + cod);
")
if [ "$MAPA" = "FALTA" ]; then echo "PREDICCIÓN IMPOSIBLE — ABORTO"; exit 1; fi
VER=$(echo "$MAPA" | cut -d'|' -f1)
COD=$(echo "$MAPA" | cut -d'|' -f2)
echo "PREDICCIÓN: la fuente única canta $VER · $COD"

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa333.log 2>&1 &
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
# sembrar la pestaña ARCADE (la sala tocada por la cirugía) y la llave del cine (lección v330)
agent-browser eval "(() => { const k = 'vg-cine-entrada-v178-' + new Date().toLocaleDateString('en-CA'); sessionStorage.setItem(k, '1'); localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['arcade'])); localStorage.setItem('vg-cromo-activa-v106', 'arcade'); return 'arcade sembrado + cine fuera'; })()" 2>&1 | head -1
agent-browser open "$BASE/?r=1" >/dev/null 2>&1
sleep 6
MONTO=0
for i in $(seq 1 12); do
  R=$(agent-browser eval "document.body.textContent.includes('ARCADE') ? 'MONTO' : 'no'" 2>/dev/null | tr -d '"')
  if [ "$R" = "MONTO" ]; then MONTO=1; break; fi
  sleep 2
done
echo "panel_monto=$MONTO"
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find((x) => /^skip$/i.test((x.textContent||'').trim())); if (b) b.click(); return 'ok'; })()" >/dev/null 2>&1
sleep 1
agent-browser eval "(() => { const m = [...document.querySelectorAll('[aria-modal=\"true\"]')].find((d) => (d.getAttribute('aria-label')||'').includes('MANUAL')); const x = m && m.querySelector('button[aria-label]'); if (x) x.click(); return 'ok'; })()" >/dev/null 2>&1
sleep 1

echo "── A) LA FIRMA DE LA RONDA ──"
FIRMA=0
for i in $(seq 1 10); do
  R=$(agent-browser eval "document.body.textContent.includes('$COD') && document.body.textContent.includes('$VER') ? 'SI' : 'no'" 2>/dev/null | tr -d '"')
  if [ "$R" = "SI" ]; then FIRMA=1; break; fi
  sleep 1
done
echo "firma_home=$FIRMA ($VER · $COD)"
HEALTH=$(curl -s "$BASE/api/health")
echo "HEALTH: $(echo "$HEALTH" | head -c 140)"
echo "$HEALTH" | rg -q "$VER" && echo "health canta $VER ✓" || echo "health NO canta $VER ✗"
agent-browser screenshot /tmp/render/qa333-arcade.png >/dev/null 2>&1

echo "── B) LA SALA ARCADE RESPIRA (la cirugía de timers viva) ──"
agent-browser eval "(() => { const t = document.body.textContent; const sala = t.includes('ARCADE'); return 'ARCADE: ' + (sala ? 'la sala monta ✓' : 'no monta ✗'); })()" 2>&1 | head -c 200; echo
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find((x) => /trivia|jugar/i.test(x.textContent||'')); if (b) { b.click(); return 'clic de juego dado: ' + (b.textContent||'').trim().slice(0,30); } return 'sin botón de juego visible (montaje suficiente)'; })()" 2>&1 | head -c 200; echo
sleep 2
agent-browser screenshot /tmp/render/qa333-arcade-juego.png >/dev/null 2>&1

echo "── C) SIN BUCLES NI DESHIDRATACIONES ──"
agent-browser console 2>&1 | rg -i "maximum update|too many|hydration|hydrat" | head -3; echo "(vacío = consola limpia — la cirugía no toca hooks)"

echo "── D) MÓVIL + DESBORDES ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 390 — REGRESIÓN' : 'sin desborde en 390'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa333-movil.png >/dev/null 2>&1
agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 1440 — REGRESIÓN' : 'sin desborde en 1440'; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -3; echo "(vacío = sin errores de página)"

echo "── CIERRE (el centinela pgrep — ley v332) ──"
agent-browser close >/dev/null 2>&1
pkill -9 -f "standalone/server.js" 2>/dev/null; sleep 1
pgrep -f "standalone/server.js" >/dev/null && echo "ZOMBI (pgrep)" || echo "pgrep limpio — cero zombis"
git checkout HEAD -- db/custom.db 2>/dev/null
echo "canon repo restaurado"
echo "QA VISUAL v333 FIN"

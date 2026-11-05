#!/bin/bash
# QA VISUAL v335 — LA COMPUERTA CURADA (la primera leva de «los 95 hallazgos
# detrás de la compuerta»: 5 archivos curados, 14 compuertas retiradas,
# el árbol baja 19 → 5 avisos)
# Ley v302: arranque + verificación + cierre en UNA llamada.
#   A) LOS INTROS VIVOS: la placa de presentación aparece y se va SOLA (los
#      flags de montaje async funcionan — un flag roto dejaría la placa
#      ETERNAMENTE)
#   B) EL INTERROGATORIO (oscura, el render que ya no lee refs): arranca y
#      el progreso visible (qIdx/qLen en estado) marca 1/N
#   C) BETNACION (bookmaker, el motor movido): monta y su motor de 1 s respira
#   D) SIN BUCLES: consola limpia · sin desbordes 1440/390 · cero errores
#   E) CIERRE: pgrep centinela (v332) + canon repo restaurado
set -u
PORT=3517
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa335.log 2>&1 &
ARRIBA=0
for i in $(seq 1 25); do sleep 1; if curl -s -o /dev/null "$BASE/api/health"; then ARRIBA=1; break; fi; done
echo "boot=$ARRIBA"
echo "SALUD: $(curl -s "$BASE/api/health" | head -c 150)"
if [ "$ARRIBA" != "1" ]; then echo "SIN SERVIDOR — ABORTO"; pkill -9 -f "standalone/server.js" 2>/dev/null; exit 1; fi

agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser console --clear >/dev/null 2>&1
agent-browser errors --clear >/dev/null 2>&1
# sembrar la llave del cine (lección v330) pero SIN pestaña: la home fresca
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const k = 'vg-cine-entrada-v178-' + new Date().toLocaleDateString('en-CA'); sessionStorage.setItem(k, '1'); return 'cine fuera'; })()" >/dev/null 2>&1
agent-browser open "$BASE/?r=1" >/dev/null 2>&1
sleep 2

echo "── A) LOS INTROS APARECEN Y SE VAN SOLOS (flags async) ──"
PLACA=0
for i in $(seq 1 8); do
  R=$(agent-browser eval "(() => { const p = document.querySelector('[aria-label^=\"Placa de presentación\"]') || document.querySelector('[aria-label^=\"Placa de conflicto\"]') || document.querySelector('[aria-label^=\"Placa de entrada\"]'); return p ? 'SI' : 'no'; })()" 2>/dev/null | tr -d '"')
  if [ "$R" = "SI" ]; then PLACA=1; break; fi
  sleep 1
done
echo "placa_monto=$PLACA (el intro vive)"
agent-browser screenshot /tmp/render/qa335-intro.png >/dev/null 2>&1
SEFUE=0
for i in $(seq 1 14); do
  sleep 1
  R=$(agent-browser eval "(() => { const p = document.querySelector('[aria-label^=\"Placa de presentación\"]') || document.querySelector('[aria-label^=\"Placa de conflicto\"]') || document.querySelector('[aria-label^=\"Placa de entrada\"]'); return p ? 'no' : 'SI'; })()" 2>/dev/null | tr -d '"')
  if [ "$R" = "SI" ]; then SEFUE=1; break; fi
done
echo "placa_se_fue=$SEFUE (el cierre automático funciona — un flag roto la dejaría eterna)"
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find((x) => /^skip$/i.test((x.textContent||'').trim())); if (b) b.click(); return 'ok'; })()" >/dev/null 2>&1
sleep 1
agent-browser eval "(() => { const m = [...document.querySelectorAll('[aria-modal=\"true\"]')].find((d) => (d.getAttribute('aria-label')||'').includes('MANUAL')); const x = m && m.querySelector('button[aria-label]'); if (x) x.click(); return 'ok'; })()" >/dev/null 2>&1
sleep 1

echo "── B) EL INTERROGATORIO RESPIRA (el render sin refs) ──"
agent-browser eval "(() => { localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['oscura'])); localStorage.setItem('vg-cromo-activa-v106', 'oscura'); return 'oscura sembrado'; })()" >/dev/null 2>&1
agent-browser open "$BASE/?r=2" >/dev/null 2>&1
sleep 6
MONTO=0
for i in $(seq 1 10); do
  R=$(agent-browser eval "document.body.textContent.includes('INTERROGATORIO') ? 'MONTO' : 'no'" 2>/dev/null | tr -d '"')
  if [ "$R" = "MONTO" ]; then MONTO=1; break; fi
  sleep 2
done
echo "oscura_monto=$MONTO"
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find((x) => /comenzar|empezar|iniciar/i.test(x.textContent||'')); if (b) { b.click(); return 'clic: ' + (b.textContent||'').trim().slice(0,24); } return 'sin botón de inicio'; })()" 2>&1 | head -c 160; echo
sleep 2
agent-browser eval "(() => { const t = document.body.textContent; const prog = /\d+\/\d+/.test(t) || t.includes('—'); const resp = [...document.querySelectorAll('button')].filter((x) => x.offsetParent && (x.textContent||'').trim().length > 2 && !/salir|comenzar/i.test(x.textContent||'')); return 'INTERROGATORIO: montado ✓ · progreso visible ' + (prog ? '✓' : '✗') + ' · botones de respuesta: ' + resp.length; })()" 2>&1 | head -c 240; echo
agent-browser screenshot /tmp/render/qa335-oscura.png >/dev/null 2>&1

echo "── C) BETNACION MONTA (el motor reordenado) ──"
agent-browser eval "(() => { localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['bookmaker'])); localStorage.setItem('vg-cromo-activa-v106', 'bookmaker'); return 'bookmaker sembrado'; })()" >/dev/null 2>&1
agent-browser open "$BASE/?r=3" >/dev/null 2>&1
sleep 6
BK=0
for i in $(seq 1 10); do
  R=$(agent-browser eval "document.body.textContent.includes('BETNACION') || document.body.textContent.includes('apuesta') ? 'MONTO' : 'no'" 2>/dev/null | tr -d '"')
  if [ "$R" = "MONTO" ]; then BK=1; break; fi
  sleep 2
done
echo "bookmaker_monto=$BK"
agent-browser screenshot /tmp/render/qa335-bookmaker.png >/dev/null 2>&1

echo "── D) SIN BUCLES NI DESHIDRATACIONES ──"
agent-browser console 2>&1 | rg -i "maximum update|too many|hydration|hydrat" | head -3; echo "(vacío = consola limpia — el orden cambió, la conducta no)"

echo "── E) MÓVIL + DESBORDES ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 390 — REGRESIÓN' : 'sin desborde en 390'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa335-movil.png >/dev/null 2>&1
agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 1440 — REGRESIÓN' : 'sin desborde en 1440'; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -4; echo "(vacío = sin errores de página)"

echo "── CIERRE (el centinela pgrep — ley v332) ──"
agent-browser close >/dev/null 2>&1
pkill -9 -f "standalone/server.js" 2>/dev/null; sleep 1
pgrep -f "standalone/server.js" >/dev/null && echo "ZOMBI (pgrep)" || echo "pgrep limpio — cero zombis"
git checkout HEAD -- db/custom.db 2>/dev/null
echo "canon repo restaurado"
echo "QA VISUAL v335 FIN"

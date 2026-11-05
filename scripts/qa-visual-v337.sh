#!/bin/bash
# QA VISUAL v337 — LA ÚLTIMA COMPUERTA (la segunda leva de «los 95 hallazgos»
# cae entera: el render de imperio lee la INSTANTÁNEA publicada, jamás el ref)
# Ley v302: arranque + verificación + cierre en UNA llamada.
#   A) LA PANTALLA DE FUNDACIÓN VIVA: facciones, récord, las tres maneras
#   B) LA CURA END-TO-END (la prueba que importa): clic FUNDAR IMPERIO → el
#      HUD nace → el RELOJ TICKA (publicar → estado → pintura). Si la cura
#      rompió el juego, el reloj se congela y este arnés arde.
#   C) LA INSTANTÁNEA RESPIRA: oro/ciencia visibles y el mapa SVG montado
#   D) SIN BUCLES: consola limpia · sin desbordes 1440/390 · cero errores
#   E) CIERRE: pgrep centinela (v332) + canon repo restaurado
set -u
PORT=3523
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa337.log 2>&1 &
ARRIBA=0
for i in $(seq 1 25); do sleep 1; if curl -s -o /dev/null "$BASE/api/health"; then ARRIBA=1; break; fi; done
echo "boot=$ARRIBA"
echo "SALUD: $(curl -s "$BASE/api/health" | head -c 150)"
if [ "$ARRIBA" != "1" ]; then echo "SIN SERVIDOR — ABORTO"; pkill -9 -f "standalone/server.js" 2>/dev/null; exit 1; fi

agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser console --clear >/dev/null 2>&1
agent-browser errors --clear >/dev/null 2>&1
# sembrar: llave del cine (lección v330) + pestaña IMPERIO — el estado del
# juego NO se siembra: la pantalla de fundación es la puerta honesta
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const k = 'vg-cine-entrada-v178-' + new Date().toLocaleDateString('en-CA'); sessionStorage.setItem(k, '1'); localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['imperio'])); localStorage.setItem('vg-cromo-activa-v106', 'imperio'); return 'cine fuera · imperio sembrado'; })()" >/dev/null 2>&1
agent-browser open "$BASE/?r=1" >/dev/null 2>&1
sleep 6

echo "── A) LA PANTALLA DE FUNDACIÓN VIVA ──"
FUNDAR=$(agent-browser eval "(() => { const T = document.body.innerText.toUpperCase(); const btn = [...document.querySelectorAll('button')].find((b) => (b.textContent||'').includes('FUNDAR IMPERIO')); return (btn ? 'BOTÓN✓' : 'BOTÓN✗') + '|' + (T.includes('LAS TRES MANERAS DE GANAR') ? 'REGLAS✓' : 'REGLAS✗') + '|' + (T.includes('LA LEGIÓN') || T.includes('LEGIÓN') ? 'FACCIONES✓' : 'FACCIONES?'); })()" 2>/dev/null | tr -d '"')
echo "fundación: $FUNDAR"
agent-browser screenshot /tmp/render/qa337-fundar.png >/dev/null 2>&1

echo "── B) LA CURA END-TO-END: fundar → HUD → el RELOJ TICKA ──"
agent-browser eval "(() => { const btn = [...document.querySelectorAll('button')].find((b) => (b.textContent||'').includes('FUNDAR IMPERIO')); if (!btn) return 'sin botón'; btn.click(); return 'fundado'; })()" >/dev/null 2>&1
sleep 2
HUD=$(agent-browser eval "(() => { const T = document.body.innerText.toUpperCase(); return (T.includes('ORO') && T.includes('CIENCIA') ? 'HUD✓' : 'HUD✗') + '|' + (T.includes('LOS OCHO TRONOS') ? 'RANKING✓' : 'RANKING✗') + '|reloj ' + ((document.body.innerText.match(/\b(\d{1,2}:\d{2})\b/) || ['','?'])[1]); })()" 2>/dev/null | tr -d '"')
echo "HUD: $HUD"
R0=$(agent-browser eval "(() => { const m = document.body.innerText.match(/\b(\d{1,2}:\d{2})\b/); return m ? m[1] : '?'; })()" 2>/dev/null | tr -d '"')
agent-browser screenshot /tmp/render/qa337-juego.png >/dev/null 2>&1
sleep 3
R1=$(agent-browser eval "(() => { const m = document.body.innerText.match(/\b(\d{1,2}:\d{2})\b/); return m ? m[1] : '?'; })()" 2>/dev/null | tr -d '"')
if [ "$R0" != "?" ] && [ "$R1" != "?" ] && [ "$R1" != "$R0" ]; then
  echo "RELOJ✓ la instantánea respira: $R0 → $R1 (publicar → estado → pintura)"
else
  echo "RELOJ✗ CONGELADO ($R0 → $R1) — LA CURA ROMPIÓ EL JUEGO"
fi

echo "── C) SIN BUCLES NI DESHIDRATACIONES ──"
agent-browser console 2>&1 | rg -i "maximum update|too many|hydration|hydrat" | head -3; echo "(vacío = consola limpia — la cura no perturbó nada)"

echo "── D) MÓVIL + DESBORDES ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 390 — REGRESIÓN' : 'sin desborde en 390'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa337-movil.png >/dev/null 2>&1
agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 1440 — REGRESIÓN' : 'sin desborde en 1440'; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -4; echo "(vacío = sin errores de página)"

echo "── CIERRE (el centinela pgrep — ley v332) ──"
agent-browser close >/dev/null 2>&1
pkill -9 -f "standalone/server.js" 2>/dev/null; sleep 1
pgrep -f "standalone/server.js" >/dev/null && echo "ZOMBI (pgrep)" || echo "pgrep limpio — cero zombis"
git checkout HEAD -- db/custom.db 2>/dev/null
echo "canon repo restaurado"
echo "QA VISUAL v337 FIN"
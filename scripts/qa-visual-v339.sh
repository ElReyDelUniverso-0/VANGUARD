#!/bin/bash
# QA VISUAL v339 — EL PESO MUERTO (la leva de los imports muertos: 94 cláusulas
# + 14 statements en 67 archivos, cero cambio de conducta)
# La prueba que importa: la casa ENTERA sigue viva después de quitarle 108
# importaciones — el shell (page.tsx, 4 muertos), el RTS de imperio (lucide
# operado) y la edad de naciones (age-engine operado) montan e interaccionan.
# Ley v302: arranque + verificación + cierre en UNA llamada.
#   A) EL HOME FIRMA LA RONDA: v339.0 · EL PESO MUERTO + health
#   B) IMPERIO VIVO: FUNDAR → HUD nace → el RELOJ TICKA (la instantánea respira)
#   C) EDAD DE NACIONES VIVA: monta y COMENZAR LA HISTORIA ejecuta
#   D) SIN BUCLES: consola limpia · sin desbordes 1440/390 · cero errores
#   E) CIERRE: pgrep centinela (v332) + canon repo restaurado
set -u
PORT=3529
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa339.log 2>&1 &
ARRIBA=0
for i in $(seq 1 25); do sleep 1; if curl -s -o /dev/null "$BASE/api/health"; then ARRIBA=1; break; fi; done
echo "boot=$ARRIBA"
echo "SALUD: $(curl -s "$BASE/api/health" | head -c 150)"
if [ "$ARRIBA" != "1" ]; then echo "SIN SERVIDOR — ABORTO"; pkill -9 -f "standalone/server.js" 2>/dev/null; exit 1; fi

agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser console --clear >/dev/null 2>&1
agent-browser errors --clear >/dev/null 2>&1
# el shell (page.tsx) operado: 4 imports muertos fuera — el home monto y firma
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 6

echo "── A) EL HOME FIRMA LA RONDA (el shell operado respira) ──"
FIRMA=$(agent-browser eval "(() => { const T = document.body.innerText; return (T.includes('v339.0') ? 'VERSIÓN✓' : 'VERSIÓN✗') + '|' + (T.includes('EL PESO MUERTO') ? 'CODENAME✓' : 'CODENAME✗') + '|' + (T.length > 500 ? 'CASA✓' : 'CASA✗'); })()" 2>/dev/null | tr -d '"')
echo "firma: $FIRMA"
SALUD=$(curl -s "$BASE/api/health")
echo "health: $SALUD" | head -c 200; echo ""
agent-browser screenshot /tmp/render/qa339-home.png >/dev/null 2>&1

echo "── B) IMPERIO VIVO: fundar → HUD → el RELOJ TICKA (lucide operado) ──"
agent-browser eval "(() => { const k = 'vg-cine-entrada-v178-' + new Date().toLocaleDateString('en-CA'); sessionStorage.setItem(k, '1'); localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['imperio'])); localStorage.setItem('vg-cromo-activa-v106', 'imperio'); return 'imperio sembrado'; })()" >/dev/null 2>&1
agent-browser open "$BASE/?r=1" >/dev/null 2>&1
sleep 6
FUNDAR=$(agent-browser eval "(() => { const btn = [...document.querySelectorAll('button')].find((b) => (b.textContent||'').includes('FUNDAR IMPERIO')); if (!btn) return 'SIN BOTÓN'; btn.click(); return 'fundado'; })()" 2>/dev/null | tr -d '"')
echo "fundar: $FUNDAR"
sleep 2
HUD=$(agent-browser eval "(() => { const T = document.body.innerText.toUpperCase(); return (T.includes('ORO') && T.includes('CIENCIA') ? 'HUD✓' : 'HUD✗') + '|reloj ' + ((document.body.innerText.match(/\b(\d{1,2}:\d{2})\b/) || ['','?'])[1]); })()" 2>/dev/null | tr -d '"')
echo "HUD: $HUD"
R0=$(agent-browser eval "(() => { const m = document.body.innerText.match(/\b(\d{1,2}:\d{2})\b/); return m ? m[1] : '?'; })()" 2>/dev/null | tr -d '"')
agent-browser screenshot /tmp/render/qa339-imperio.png >/dev/null 2>&1
sleep 3
R1=$(agent-browser eval "(() => { const m = document.body.innerText.match(/\b(\d{1,2}:\d{2})\b/); return m ? m[1] : '?'; })()" 2>/dev/null | tr -d '"')
if [ "$R0" != "?" ] && [ "$R1" != "?" ] && [ "$R1" != "$R0" ]; then
  echo "RELOJ✓ la casa respira tras la leva: $R0 → $R1"
else
  echo "RELOJ✗ CONGELADO ($R0 → $R1) — LA LEVA ROMPIÓ EL RTS"
fi

echo "── C) EDAD DE NACIONES VIVA: monta y COMENZAR ejecuta (age-engine operado) ──"
agent-browser eval "(() => { localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['edad'])); localStorage.setItem('vg-cromo-activa-v106', 'edad'); return 'edad sembrada'; })()" >/dev/null 2>&1
agent-browser open "$BASE/?r=2" >/dev/null 2>&1
sleep 6
AON=$(agent-browser eval "(() => { const T = document.body.innerText.toUpperCase(); const btn = [...document.querySelectorAll('button')].find((b) => (b.textContent||'').toUpperCase().includes('COMENZAR LA HISTORIA')); if (!btn) return 'SIN BOTÓN DE HISTORIA'; btn.click(); return 'PANEL✓ COMENZAR ejecutado'; })()" 2>/dev/null | tr -d '"')
echo "aon: $AON"
sleep 2
AON2=$(agent-browser eval "(() => { const T = document.body.innerText.toUpperCase(); return (T.includes('COMENZAR LA HISTORIA') ? 'aún en portada' : 'EL JUEGO AVANZÓ✓'); })()" 2>/dev/null | tr -d '"')
echo "aon post-clic: $AON2"
agent-browser screenshot /tmp/render/qa339-edad.png >/dev/null 2>&1

echo "── D) SIN BUCLES NI DESHIDRATACIONES ──"
agent-browser console 2>&1 | rg -i "maximum update|too many|hydration|hydrat" | head -3; echo "(vacío = consola limpia — la leva no perturbó nada)"

agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 390 — REGRESIÓN' : 'sin desborde en 390'; })()" 2>&1 | head -1
agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 1440 — REGRESIÓN' : 'sin desborde en 1440'; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -4; echo "(vacío = sin errores de página)"

echo "── CIERRE (el centinela pgrep — ley v332) ──"
agent-browser close >/dev/null 2>&1
pkill -9 -f "standalone/server.js" 2>/dev/null; sleep 1
pgrep -f "standalone/server.js" >/dev/null && echo "ZOMBI (pgrep)" || echo "pgrep limpio — cero zombis"
git checkout HEAD -- db/custom.db 2>/dev/null
echo "canon repo restaurado"
echo "QA VISUAL v339 FIN"

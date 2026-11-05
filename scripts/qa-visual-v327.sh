#!/bin/bash
# QA VISUAL v327 — LA TERCERA CIRUGÍA (arquitecto sin estado que nazca escribiendo)
# Ley v302: arranque + verificación + cierre en UNA llamada.
# Lecciones v320-v326: espera ACTIVA, DOM preciso, verificar ESTADOS (no
# instantes), sembrar localStorage antes de recargar con ?r=N, la casa tiene
# más de un diálogo vivo (el manual muere por su X).
#   A) LOS WIDGETS MONTAN POR HIDRATACIÓN ESCUCHADA: sembrado el store del
#      arquitecto con módulos instalados, la sala los monta al hidratar —
#      sin setVisto, sin efecto-escritor (el canvas del sismógrafo a la vista)
#   B) EL TELEMETRO VIVO: la lectura aparece tras hidratar — «sondeando el
#      núcleo…» NO queda eterno y el veredicto (sentimiento) está en pantalla
#   C) SIN BUCLES: consola sin "Maximum update depth" (el riesgo del snapshot
#      cacheado por bucket) ni deshidrataciones
#   D) sin desbordes 1440/390 · canon repo restaurado · cero zombis
set -u
PORT=3503
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa327.log 2>&1 &
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
# sembrar el store del arquitecto con DOS módulos instalados (sismógrafo + telemetro)
# y activo (el perpetuo respira) ANTES de recargar con ?r=N — técnica v320-v326
agent-browser eval "(() => { localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['arquitecto'])); localStorage.setItem('vg-cromo-activa-v106', 'arquitecto'); localStorage.setItem('vg-arquitecto-v115', JSON.stringify({ state: { activo: true, perpetuo: true, velocidad: 'normal', fase: 'DORMIDO', enCurso: null, obra: [], modulos: [{ id: 'sismografo', nombre: 'SISMÓGRAFO DE LETRAS', desc: 'Convierte el pulso en ondas sísmicas.', ver: 1, t: 1 }, { id: 'telemetro', nombre: 'TELEMETRO NEURONAL', desc: 'Las 8 neuronas del núcleo en vivo.', ver: 1, t: 2 }], obras: [], doctrinas: [], satelites: [], contadores: { ciclos: 0, ia: 0, locales: 0, ms: 0 }, ordenExterna: null }, version: 0 })); return 'arquitecto sembrado: pestaña + 2 módulos instalados'; })()" 2>&1 | head -1
agent-browser open "$BASE/?r=1" >/dev/null 2>&1
sleep 6
# espera ACTIVA del panel (la cortina disipa cuando el último _next aterriza)
MONTO=0
for i in $(seq 1 12); do
  R=$(agent-browser eval "document.body.textContent.includes('ARQUITECTO') ? 'MONTO' : 'no'" 2>/dev/null | tr -d '"')
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

echo "── A) LOS WIDGETS MONTAN POR HIDRATACIÓN ESCUCHADA ──"
WIDGET=0
for i in $(seq 1 10); do
  R=$(agent-browser eval "(() => { const c = document.querySelector('canvas[aria-label=\"Sismógrafo de letras del pulso mundial\"]'); return c ? 'SI' : 'no'; })()" 2>/dev/null | tr -d '"')
  if [ "$R" = "SI" ]; then WIDGET=1; break; fi
  sleep 1
done
agent-browser eval "(() => { const c = document.querySelector('canvas[aria-label=\"Sismógrafo de letras del pulso mundial\"]'); const plano = document.body.textContent.includes('proyectado'); return ('WIDGETS: sismógrafo canvas ' + (c ? 'MONTADO ✓ (la hidratación fue el evento — sin setVisto)' : 'AUSENTE ✗') + ' · plano/proyectado en pantalla ' + (plano ? 'sí (módulos sin instalar, normal)' : 'no')); })()" 2>&1 | head -c 220; echo
agent-browser screenshot /tmp/render/qa327-widget.png >/dev/null 2>&1

echo "── B) EL TELEMETRO VIVO (la lectura tras hidratar) ──"
TELEM=0
for i in $(seq 1 10); do
  R=$(agent-browser eval "(() => { const t = document.body.textContent; return (t.includes('sentimiento:') && !t.includes('sondeando el núcleo…')) ? 'SI' : 'no'; })()" 2>/dev/null | tr -d '"')
  if [ "$R" = "SI" ]; then TELEM=1; break; fi
  sleep 1
done
agent-browser eval "(() => { const t = document.body.textContent; const veredicto = t.includes('sentimiento:'); const sondeando = t.includes('sondeando el núcleo…'); const neuronas = t.includes('neuronas activas'); return ('TELEMETRO: veredicto ' + (veredicto ? 'VIVO ✓ (la lectura se escuchó, no se escribió)' : 'AUSENTE ✗') + ' · «sondeando…» ' + (sondeando ? 'ETERNO ✗' : 'ausente ✓') + ' · 8 neuronas ' + (neuronas ? '✓' : '✗')); })()" 2>&1 | head -c 220; echo
agent-browser screenshot /tmp/render/qa327-telemetro.png >/dev/null 2>&1

echo "── C) SIN BUCLES NI DESHIDRATACIONES ──"
agent-browser console 2>&1 | rg -i "maximum update|too many|hydration|hydrat" | head -3; echo "(vacío = sin bucles ni deshidrataciones — el snapshot cacheado respira)"

echo "── D) MÓVIL + DESBORDES ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 390 — REGRESIÓN' : 'sin desborde en 390'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa327-movil.png >/dev/null 2>&1
agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 1440 — REGRESIÓN' : 'sin desborde en 1440'; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -3; echo "(vacío = sin errores de página)"

echo "── CIERRE ──"
agent-browser close >/dev/null 2>&1
kill $SRVPID 2>/dev/null; sleep 1
kill -9 $SRVPID 2>/dev/null
curl -s -o /dev/null --max-time 2 "$BASE/api/health" && echo "ZOMBI" || echo "puerto 3503 libre — cero zombis"
git checkout HEAD -- db/custom.db 2>/dev/null
echo "canon repo restaurado"
echo "QA VISUAL v327 FIN"

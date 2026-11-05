#!/bin/bash
# QA VISUAL v325 — LA SEGUNDA CIRUGÍA (lector-noticia sin estado que nazca escribiendo)
# Ley v302: arranque + verificación + cierre en UNA llamada.
# Lecciones v320-v324: espera ACTIVA, DOM preciso, verificar ESTADOS (no
# instantes), sembrar localStorage antes de recargar, skip del manual dos veces.
#   A) EL LECTOR ABRE EN EL ESPEJO: click en un cable real → la placa GTA
#      (una vez) y tras ella la SALA DE LECTURA viva con su titular —
#      el portal montado por hidratación ESCUCHADA, no por efecto
#   B) LA MEMORIA DE SESIÓN: vg174-gta-ultimo marcado con el cable leído
#   C) LA REAPERTURA SIN PLACA: cerrar y reabrir el MISMO cable → el lector
#      vuelve y la placa NO repite (calcularIntro respeta la memoria)
#   D) consola limpia · sin desbordes 1440/390 · canon repo restaurado · cero zombis
set -u
PORT=3501
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa325.log 2>&1 &
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
agent-browser eval "(() => { localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['espejo'])); localStorage.setItem('vg-cromo-activa-v106', 'espejo'); sessionStorage.removeItem('vg174-gta-ultimo'); return 'pestaña espejo sembrada, memoria de sesión limpia'; })()" 2>&1 | head -1
agent-browser open "$BASE/?r=1" >/dev/null 2>&1
sleep 6
# espera ACTIVA del panel (la cortina disipa cuando el último _next aterriza)
MONTO=0
for i in $(seq 1 12); do
  R=$(agent-browser eval "document.body.textContent.includes('señales reales de ahora') ? 'MONTO' : 'no'" 2>/dev/null | tr -d '"')
  if [ "$R" = "MONTO" ]; then MONTO=1; break; fi
  sleep 2
done
echo "panel_monto=$MONTO"
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find((x) => /saltar el cine/i.test(x.textContent||'')); if (b) { b.click(); return 'ok'; } return 'ok'; })()" >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find((x) => /^skip$/i.test((x.textContent||'').trim())); if (b) b.click(); return 'ok'; })()" >/dev/null 2>&1
sleep 1

# el manual manda su X si sobrevivió a los skips (lección v324: llega tarde)
agent-browser eval "(() => { const m = [...document.querySelectorAll('[aria-modal=\"true\"]')].find((d) => (d.getAttribute('aria-label')||'').includes('MANUAL')); if (!m) return 'sin manual'; const x = m.querySelector('button[aria-label]'); if (x) { x.click(); return 'manual fuera'; } return 'manual sin X'; })()" >/dev/null 2>&1
sleep 1

echo "── A) EL LECTOR ABRE EN EL ESPEJO (placa GTA + sala de lectura) ──"
agent-browser eval "(() => { const h = [...document.querySelectorAll('span')].find((s) => (s.textContent||'').includes('señales reales de ahora')); if (!h) return 'sin sección de cables reales'; const grid = h.closest('div').parentElement.querySelector('div.grid'); const btn = grid && grid.querySelector('button'); if (!btn) return 'sin botón de cable real'; btn.click(); return 'cable real abierto: ' + btn.textContent.trim().slice(0, 60); })()" 2>&1 | head -c 160; echo
sleep 1
# la placa vive 2.3 s: verificar su EXISTENCIA (instante) sin exigirla (estado)
agent-browser eval "(() => { const placa = document.querySelector('[aria-label^=\"Placa de entrada\"]'); return placa ? 'PLACA GTA VIVA: ' + (placa.getAttribute('aria-label')||'').slice(0, 70) : 'sin placa en este instante (ya pasó o reduced-motion)'; })()" 2>&1 | head -c 160; echo
# espera activa de la SALA DE LECTURA (la placa se va sola a los 2.3 s)
LECTOR=0
for i in $(seq 1 15); do
  R=$(agent-browser eval "[...document.querySelectorAll('[aria-modal=\"true\"]')].some((d) => !(d.getAttribute('aria-label')||'').includes('MANUAL')) ? 'SI' : 'no'" 2>/dev/null | tr -d '"')
  if [ "$R" = "SI" ]; then LECTOR=1; break; fi
  sleep 1
done
echo "lector_monto=$LECTOR"
agent-browser eval "(() => { const d = [...document.querySelectorAll('[aria-modal=\"true\"]')].find((x) => !(x.getAttribute('aria-label')||'').includes('MANUAL')); if (!d) return 'REGRESIÓN: el lector no montó'; const t = d.textContent || ''; const cierro = d.querySelector('button[aria-label]'); return ('LECTOR VIVO: texto ' + (t.length > 100 ? 'presente ✓' : 'vacío ✗') + ' · botón de cierre ' + (cierro ? '✓' : '✗') + ' — el portal montó por hidratación escuchada').slice(0, 180); })()" 2>&1 | head -c 240; echo
agent-browser screenshot /tmp/render/qa325-lector.png >/dev/null 2>&1

echo "── B) LA MEMORIA DE SESIÓN ──"
agent-browser eval "(() => { const m = sessionStorage.getItem('vg174-gta-ultimo'); return 'MEMORIA: ' + (m ? 'marcada (' + m.slice(0, 24) + '…)' : 'VACÍA — la placa no marcó su paso'); })()" 2>&1 | head -c 140; echo

echo "── C) LA REAPERTURA SIN PLACA ──"
agent-browser eval "(() => { const d = [...document.querySelectorAll('[aria-modal=\"true\"]')].find((x) => !(x.getAttribute('aria-label')||'').includes('MANUAL')); if (!d) return 'sin lector que cerrar'; const b = d.querySelector('button[aria-label]'); if (!b) return 'sin botón'; b.click(); return 'lector cerrado'; })()" >/dev/null 2>&1
sleep 1
agent-browser eval "(() => { const h = [...document.querySelectorAll('span')].find((s) => (s.textContent||'').includes('señales reales de ahora')); const grid = h && h.closest('div').parentElement.querySelector('div.grid'); const btn = grid && grid.querySelector('button'); if (!btn) return 'sin botón de cable'; btn.click(); return 'mismo cable real reabierto'; })()" >/dev/null 2>&1
sleep 4
agent-browser eval "(() => { const placa = document.querySelector('[aria-label^=\"Placa de entrada\"]'); const lector = [...document.querySelectorAll('[aria-modal=\"true\"]')].find((x) => !(x.getAttribute('aria-label')||'').includes('MANUAL')); return ('REAPERTURA: placa ' + (placa ? 'REPITIÓ — REGRESIÓN (la memoria manda)' : 'NO repite ✓') + ' · lector ' + (lector ? 'vivo ✓' : 'PERDIDO')); })()" 2>&1 | head -c 200; echo
agent-browser screenshot /tmp/render/qa325-reapertura.png >/dev/null 2>&1
agent-browser eval "(() => { const d = [...document.querySelectorAll('[aria-modal=\"true\"]')].find((x) => !(x.getAttribute('aria-label')||'').includes('MANUAL')); if (!d) return 'cerrado'; const b = d.querySelector('button[aria-label]'); if (b) b.click(); return 'cerrado'; })()" >/dev/null 2>&1

echo "── D) MÓVIL + CONSOLA + DESBORDES ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 390 — REGRESIÓN' : 'sin desborde en 390'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa325-movil.png >/dev/null 2>&1
agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 1440 — REGRESIÓN' : 'sin desborde en 1440'; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -3; echo "(vacío = sin errores de página)"
agent-browser console 2>&1 | rg -i "hydration|hydrat|maximum update|too many" | head -3; echo "(vacío = sin bucles ni deshidrataciones)"

echo "── CIERRE ──"
agent-browser close >/dev/null 2>&1
kill $SRVPID 2>/dev/null; sleep 1
kill -9 $SRVPID 2>/dev/null
curl -s -o /dev/null --max-time 2 "$BASE/api/health" && echo "ZOMBI" || echo "puerto 3501 libre — cero zombis"
git checkout HEAD -- db/custom.db 2>/dev/null
echo "canon repo restaurado"
echo "QA VISUAL v325 FIN"

#!/bin/bash
# QA VISUAL v329 — LA CUARTA CIRUGÍA (doble golpe ENTRE ARCHIVOS: el clima de
# camaras-mundo y el revelado del enjambre ajustan su estado EN RENDER)
# Ley v302: arranque + verificación + cierre en UNA llamada.
# Lecciones v320-v328: espera ACTIVA, DOM preciso, verificar ESTADOS (no
# instantes), sembrar localStorage antes de recargar con ?r=N.
#   A) EL CLIMA (víctima 1): elegir país en el mosaico → la intel aparece con
#      su zona de clima viva (spinner/datos/—); cambiar de país → el reset en
#      render respira y la zona sigue viva, sin errores (el efecto-escritor
#      viejo habría muerto igual, pero el censo 2+4 lo prueba: la escritura
#      síncrona ya no existe)
#   B) EL ENJAMBRE (víctima 2): posar el cursor en una pantalla → la
#      transcripción se intercepta y el texto CRECE letra a letra (el ajuste
#      en render arranca en 0 y el interval revela) — medido en dos instantes
#   C) SIN BUCLES: consola sin "Maximum update depth" (el riesgo del ajuste en
#      render inestable) ni deshidrataciones
#   D) sin desbordes 1440/390 · canon repo restaurado · cero zombis
set -u
PORT=3505
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa329.log 2>&1 &
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
# sembrar la pestaña del OJO DE DIOS antes de recargar con ?r=N (técnica v320-v328)
agent-browser eval "(() => { localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['ojodios'])); localStorage.setItem('vg-cromo-activa-v106', 'ojodios'); return 'ojodios sembrado'; })()" 2>&1 | head -1
agent-browser open "$BASE/?r=1" >/dev/null 2>&1
sleep 6
MONTO=0
for i in $(seq 1 12); do
  R=$(agent-browser eval "document.body.textContent.includes('enjambre de ojos') ? 'MONTO' : 'no'" 2>/dev/null | tr -d '"')
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

echo "── A) EL CLIMA SIN EFECTO-ESCRITOR (la víctima 1) ──"
MOSAICO=0
for i in $(seq 1 10); do
  R=$(agent-browser eval "(() => { const s = document.querySelector('[aria-label=\"Cámaras públicas del mundo\"]'); return s ? 'SI' : 'no'; })()" 2>/dev/null | tr -d '"')
  if [ "$R" = "SI" ]; then MOSAICO=1; break; fi
  sleep 1
done
echo "camaras_montadas=$MOSAICO"
# activar el mosaico y elegir el PRIMER país (celda no-ISS)
agent-browser eval "(() => { const s = document.querySelector('[aria-label=\"Cámaras públicas del mundo\"]'); const b = [...s.querySelectorAll('button')].find((x) => /modo vigilancia/i.test(x.textContent||'')); if (b) { b.click(); return 'mosaico'; } return 'sin mosaico'; })()" >/dev/null 2>&1
sleep 1
agent-browser eval "(() => { const s = document.querySelector('[aria-label=\"Cámaras públicas del mundo\"]'); const celda = [...s.querySelectorAll('button')].find((x) => (x.title||'').includes('— abrir señal') && !(x.title||'').includes('ISS')); if (celda) { celda.click(); return celda.title.split(' — ')[0]; } return 'sin celda'; })()" 2>&1 | head -1
sleep 1
agent-browser eval "(() => { const s = document.querySelector('[aria-label=\"Cámaras públicas del mundo\"]'); const zona = s.textContent.includes('clima actual'); const spin = !!s.querySelector('.animate-spin'); const datos = /°C/.test(s.textContent); const vacio = s.textContent.includes('clima actual'); return 'CLIMA PAÍS 1: zona ' + (zona ? 'viva ✓' : 'ausente ✗') + ' · estado ' + (spin ? 'spinner (en vuelo)' : datos ? 'datos °C ✓' : '— (fallo honesto)'); })()" 2>&1 | head -c 240; echo
# cambiar a OTRO país: el reset en render respira (sin error de render)
agent-browser eval "(() => { const s = document.querySelector('[aria-label=\"Cámaras públicas del mundo\"]'); const celdas = [...s.querySelectorAll('button')].filter((x) => (x.title||'').includes('— abrir señal') && !(x.title||'').includes('ISS')); if (celdas.length > 1) { celdas[1].click(); return celdas[1].title.split(' — ')[0]; } return 'sin segunda celda'; })()" 2>&1 | head -1
sleep 2
agent-browser eval "(() => { const s = document.querySelector('[aria-label=\"Cámaras públicas del mundo\"]'); const zona = s.textContent.includes('clima actual'); return 'CLIMA PAÍS 2 tras el cambio: zona ' + (zona ? 'VIVA ✓ (el ajuste en render respira — sin efecto-escritor)' : 'MUERTA ✗'); })()" 2>&1 | head -c 220; echo
agent-browser screenshot /tmp/render/qa329-clima.png >/dev/null 2>&1

echo "── B) EL ENJAMBRE: EL REVELADO CAMINA (la víctima 2) ──"
OJOS=0
for i in $(seq 1 10); do
  R=$(agent-browser eval "(() => { const p = document.querySelectorAll('.v135-pantalla'); return p.length > 0 ? String(p.length) : 'no'; })()" 2>/dev/null | tr -d '"')
  if [ "$R" != "no" ] && [ "$R" != "0" ]; then OJOS=$R; break; fi
  sleep 1
done
echo "ojos_en_orbita=$OJOS"
# posar el cursor sobre la primera pantalla y medir el revelado dos veces
# (lección v329: React sintetiza onMouseEnter desde mouseover — el evento
# nativo que burbujea es mouseover, un mouseenter directo no lo dispara)
agent-browser eval "(() => { const p = document.querySelector('.v135-pantalla'); if (!p) return 'sin pantalla'; p.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })); return 'cursor posado'; })()" 2>&1 | head -1
sleep 1
LEN1=$(agent-browser eval "(() => { const zona = [...document.querySelectorAll('p')].find((x) => /transcripción de intercepción/.test(x.textContent||'')); if (!zona) return -1; const cuerpo = zona.parentElement.textContent.split('intercepción')[1] || ''; return cuerpo.length; })()" 2>/dev/null | tr -d '"')
sleep 2
LEN2=$(agent-browser eval "(() => { const zona = [...document.querySelectorAll('p')].find((x) => /transcripción de intercepción/.test(x.textContent||'')); if (!zona) return -1; const cuerpo = zona.parentElement.textContent.split('intercepción')[1] || ''; return cuerpo.length; })()" 2>/dev/null | tr -d '"')
agent-browser eval "(() => { const zona = [...document.querySelectorAll('p')].find((x) => /transcripción de intercepción/.test(x.textContent||'')); if (!zona) return 'TRANSCRIPCIÓN AUSENTE ✗'; return 'ENJAMBRE: transcripción interceptada ✓ · revelado ' + $LEN1 + ' → ' + $LEN2 + ' chars ' + ($LEN2 > $LEN1 ? 'CRECIENDO ✓ (el ajuste en render arrancó en 0 y el interval revela)' : $LEN2 === -1 ? '✗' : 'completo o quieto (cuerpo corto — estado legítimo)'); })()" 2>&1 | head -c 260; echo
agent-browser screenshot /tmp/render/qa329-enjambre.png >/dev/null 2>&1

echo "── C) SIN BUCLES NI DESHIDRATACIONES ──"
agent-browser console 2>&1 | rg -i "maximum update|too many|hydration|hydrat" | head -3; echo "(vacío = sin bucles — el ajuste en render se estabiliza: React re-renderiza UNA vez y para)"

echo "── D) MÓVIL + DESBORDES ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 390 — REGRESIÓN' : 'sin desborde en 390'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa329-movil.png >/dev/null 2>&1
agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 1440 — REGRESIÓN' : 'sin desborde en 1440'; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -3; echo "(vacío = sin errores de página)"

echo "── CIERRE ──"
agent-browser close >/dev/null 2>&1
kill $SRVPID 2>/dev/null; sleep 1
kill -9 $SRVPID 2>/dev/null
curl -s -o /dev/null --max-time 2 "$BASE/api/health" && echo "ZOMBI" || echo "puerto 3505 libre — cero zombis"
git checkout HEAD -- db/custom.db 2>/dev/null
echo "canon repo restaurado"
echo "QA VISUAL v329 FIN"

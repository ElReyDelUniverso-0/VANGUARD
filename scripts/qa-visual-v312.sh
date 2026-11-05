#!/bin/bash
# QA VISUAL v312 — LA CUARTA QUIRURGÍA (cámara de consecuencias: los dos
# efectos que escribían estado, v315... v135 NEXUS-HYPNOS operada)
# Ley v302: arranque + cirugía visual + cierre en UNA llamada.
# Lo que la cirugía debe preservar EXACTO:
#   A) el salón de noticias monta y la cámara abre con [simular]
#   B) la proyección corre día a día (el reloj puro programa el intervalo)
#   C) tocar un control (dosis/horizonte) REINICIA la proyección a día 000
#      y el reloj vuelve a avanzar (el ajuste durante el render)
#   D) cerrar con Escape y reabrir OTRO cable → la cámara arranca limpia
#      (el ajuste del cableVisto) sin bucles de render
#   E) consola limpia: sin «Maximum update depth» ni deshidrataciones
#   F) sin desbordes horizontales (1440 y 390) con la cámara abierta
set -u
PORT=3496
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa312.log 2>&1 &
SRVPID=$!
ARRIBA=0
for i in $(seq 1 25); do sleep 1; if curl -s -o /dev/null "$BASE/api/health"; then ARRIBA=1; break; fi; done
echo "boot=$ARRIBA"
echo "SALUD: $(curl -s "$BASE/api/health")"
if [ "$ARRIBA" != "1" ]; then echo "SIN SERVIDOR — ABORTO"; kill -9 $SRVPID 2>/dev/null; exit 1; fi

agent-browser set viewport 1440 900 >/dev/null 2>&1

echo "── 0) SSR: la cámara (portal) no existe en el HTML del servidor ──"
curl -s "$BASE/" | grep -c "Cámara de Consecuencias" || echo "0 en el SSR (correcto: la cámara vive en el cliente)"

echo "── A) SEMBRAR LA PESTAÑA DE NOTICIAS Y VERIFICAR EL SALÓN ──"
agent-browser console --clear >/dev/null 2>&1
agent-browser errors --clear >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 4
agent-browser eval "(() => { localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['noticias'])); localStorage.setItem('vg-cromo-activa-v106', 'noticias'); return 'pestaña de noticias sembrada'; })()" 2>&1 | head -1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 8
agent-browser eval "(() => { const t = document.body.textContent || ''; if (!t.includes('Noticias en vivo')) return 'SALÓN NO MONTÓ'; const n = document.querySelectorAll('button[title*=\"simular la escalada\"]').length; return 'SALÓN MONTADO — botones simular: ' + n; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa312-salon.png >/dev/null 2>&1

echo "── B) ABRIR LA CÁMARA Y MEDIR EL RELOJ PURO (intervalo vivo) ──"
agent-browser eval "(() => { const b = document.querySelector('button[title*=\"simular la escalada\"]'); if (!b) return 'sin botón simular'; b.click(); return 'click en simular (cable #1)'; })()" 2>&1 | head -1
sleep 3
agent-browser eval "(() => { const d = document.querySelector('[aria-label=\"Cámara de Consecuencias\"]'); if (!d) return 'REGRESIÓN: la cámara no abrió'; const sello = d.textContent.includes('simulación · no predicción'); const m = d.textContent.match(/(\d{3})\/(\d+)/); return 'CÁMARA ABIERTA — día ' + (m ? m[1] + '/' + m[2] : '?') + ' · sello honesto: ' + (sello ? 'presente' : 'PERDIDO'); })()" 2>&1 | head -1
agent-browser eval "(() => { const m = document.querySelector('[aria-label=\"Cámara de Consecuencias\"]').textContent.match(/(\d{3})\/(\d+)/); window.__vg_dia_t0 = m ? +m[1] : -1; return 'día t0: ' + window.__vg_dia_t0; })()" 2>&1 | head -1
sleep 3
agent-browser eval "(() => { const m = document.querySelector('[aria-label=\"Cámara de Consecuencias\"]').textContent.match(/(\d{3})\/(\d+)/); const t1 = m ? +m[1] : -1; if (t1 > window.__vg_dia_t0) return 'RELOJ VIVO: día ' + window.__vg_dia_t0 + ' → ' + t1 + ' — el efecto puro programa el intervalo (correcto)'; return 'REGRESIÓN: el reloj no avanza (' + window.__vg_dia_t0 + ' → ' + t1 + ')'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa312-camara.png >/dev/null 2>&1

echo "── C) TOCAR LA DOSIS → REINICIO A DÍA 000 Y EL RELOJ VUELVE (ajuste durante el render) ──"
agent-browser eval "(() => { const d = document.querySelector('[aria-label=\"Cámara de Consecuencias\"]'); const b5 = [...d.querySelectorAll('button')].find(x => x.textContent.trim() === '5'); if (!b5) return 'botón de dosis 5 no encontrado'; b5.click(); return 'click en dosis 5'; })()" 2>&1 | head -1
# TRAMPA DEL ARNÉS PAGADA: leer AL INSTANTE (sin dormir) — un reinicio vivo
# ya avanza ~11 pasos/s; exigir «día 0» tras un sleep mordía al propio reloj
# (la medición de la sección B: día 023 tras 3 s). El arrastre real (si el
# ajuste no corrió) mostraría el día viejo (~50+) intacto.
agent-browser eval "(() => { const m = document.querySelector('[aria-label=\"Cámara de Consecuencias\"]').textContent.match(/(\d{3})\/(\d+)/); const dia = m ? +m[1] : -1; if (dia <= 15) return 'REINICIO MEDIDO AL INSTANTE: día ' + dia + ' tras la dosis (venía de crecer hacia 50+ — el ajuste corrió antes de pintar)'; return 'REGRESIÓN: día ' + dia + ' tras la dosis (arrastró el paso, el ajuste no corrió)'; })()" 2>&1 | head -1
agent-browser eval "(() => { const m = document.querySelector('[aria-label=\"Cámara de Consecuencias\"]').textContent.match(/(\d{3})\/(\d+)/); window.__vg_dia_r0 = m ? +m[1] : -1; return 'día tras reinicio: ' + window.__vg_dia_r0; })()" 2>&1 | head -1
sleep 3
agent-browser eval "(() => { const m = document.querySelector('[aria-label=\"Cámara de Consecuencias\"]').textContent.match(/(\d{3})\/(\d+)/); const t1 = m ? +m[1] : -1; if (t1 > window.__vg_dia_r0) return 'RELOJ REVIVO: día ' + window.__vg_dia_r0 + ' → ' + t1 + ' — el intervalo se reprogramó tras el reinicio (correcto)'; return 'REGRESIÓN: el reloj murió tras el reinicio (' + window.__vg_dia_r0 + ' → ' + t1 + ')'; })()" 2>&1 | head -1

echo "── D) HORIZONTE 90d Y EL VEREDICTO (la proyección termina ante los ojos) ──"
agent-browser eval "(() => { const d = document.querySelector('[aria-label=\"Cámara de Consecuencias\"]'); const b90 = [...d.querySelectorAll('button')].find(x => x.textContent.trim() === '90d'); if (!b90) return 'botón 90d no encontrado'; b90.click(); return 'click en horizonte 90d (reinicia de nuevo)'; })()" 2>&1 | head -1
sleep 11
agent-browser eval "(() => { const d = document.querySelector('[aria-label=\"Cámara de Consecuencias\"]'); const fin = d.textContent.includes('final proyectado'); const mc = d.textContent.includes('24 semillas deterministas'); return fin ? 'VEREDICTO ALCANZADO — «final proyectado» pintado' + (mc ? ' · Monte Carlo presente' : ' · FALTA Monte Carlo') : 'la proyección aún corre (o REGRESIÓN: nunca termina)'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa312-veredicto.png >/dev/null 2>&1

echo "── E) ESCAPE CIERRA · REABRIR OTRO CABLE (el ajuste del cableVisto) ──"
agent-browser eval "(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); return 'Escape despachado'; })()" 2>&1 | head -1
sleep 1
agent-browser eval "(() => { const d = document.querySelector('[aria-label=\"Cámara de Consecuencias\"]'); return d ? 'REGRESIÓN: la cámara sigue abierta tras Escape' : 'la cámara CERRÓ con Escape (contrato intacto)'; })()" 2>&1 | head -1
agent-browser eval "(() => { const bs = document.querySelectorAll('button[title*=\"simular la escalada\"]'); if (bs.length < 2) return 'no hay segundo cable'; bs[1].click(); return 'click en simular (cable #2 — otro tag si lo hay)'; })()" 2>&1 | head -1
# TRAMPA DEL ARNÉS PAGADA (la misma de la sección C): leer AL INSTANTE —
# la sesión anterior terminó en el día 90/90 (veredicto): un paso arrastrado
# pintaría ~090 al abrir; un arranque limpio pinta ~000-015 por la latencia.
agent-browser eval "(() => { const d = document.querySelector('[aria-label=\"Cámara de Consecuencias\"]'); if (!d) return 'REGRESIÓN: la cámara no reabrió con el cable #2'; const m = d.textContent.match(/(\d{3})\/(\d+)/); const dia = m ? +m[1] : -1; if (dia <= 15) return 'REAPERTURA LIMPIA AL INSTANTE: arrancó en día ' + dia + ' (venía de un final en 090 — el ajuste del cableVisto corrió, sin arrastre)'; return 'día en la reapertura: ' + dia + ' — REGRESIÓN: arrastró el paso del cable anterior'; })()" 2>&1 | head -1

echo "── F) SIN BUCLES + CONSOLA LIMPIA + SIN DESBORDES (1440 y 390) ──"
agent-browser eval "(() => { const o = JSON.stringify({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,over:document.documentElement.scrollWidth>document.documentElement.clientWidth+1}); return 'DESBORDE 1440 (cámara abierta): ' + o; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -3; echo "(vacío = sin errores de página)"
agent-browser console 2>&1 | grep -i "maximum update\|too many re-renders\|hydration" && echo "REGRESIÓN DE RENDER/HIDRATACIÓN" || echo "consola sin bucles ni deshidrataciones"
agent-browser console 2>&1 | grep -i '\[error\]' | grep -v 'Download the React DevTools' | head -3 || echo "consola sin errores"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const d = document.querySelector('[aria-label=\"Cámara de Consecuencias\"]'); if (!d) return 'la cámara cerró al cambiar viewport (reabrir)'; const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 390 — REGRESIÓN' : 'sin desborde en 390 con la cámara abierta (móvil ok)'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa312-movil.png >/dev/null 2>&1

agent-browser close >/dev/null 2>&1
kill "$SRVPID" 2>/dev/null; sleep 1; kill -9 "$SRVPID" 2>/dev/null
curl -s -o /dev/null --max-time 2 "$BASE/api/health" && echo "ZOMBI" || echo "puerto 3496 libre — cero zombis"
echo "QA VISUAL v312 FIN"

#!/bin/bash
# QA VISUAL v319 — LA COLECCIÓN QUE CRECE (el álbum de fichas dobla a 11)
# Ley v302: arranque + cirugía visual + cierre en UNA llamada.
#   A) EL ÁLBUM: 11 cartas en el tablero, Congo (VG-10) y Myanmar (VG-11)
#      presentes (con cables del feed → rareza viva; sin cables → SILENCIO
#      honesto — ambos estados son correctos)
#   B) LA GLORIA: el panel canta 13 títulos y el próximo título responde
#   C) EL DETALLE: abrir la carta nueva muestra la ficha técnica honesta
#   D) consola limpia · sin desbordes 1440/390 · cero zombis
set -u
PORT=3496
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa319.log 2>&1 &
SRVPID=$!
ARRIBA=0
for i in $(seq 1 25); do sleep 1; if curl -s -o /dev/null "$BASE/api/health"; then ARRIBA=1; break; fi; done
echo "boot=$ARRIBA"
echo "SALUD: $(curl -s "$BASE/api/health")"
if [ "$ARRIBA" != "1" ]; then echo "SIN SERVIDOR — ABORTO"; kill -9 $SRVPID 2>/dev/null; exit 1; fi

agent-browser set viewport 1440 900 >/dev/null 2>&1

echo "── A) EL ÁLBUM CON SUS 11 CARTAS ──"
agent-browser console --clear >/dev/null 2>&1
agent-browser errors --clear >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 5
agent-browser eval "(() => { localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['fichas'])); localStorage.setItem('vg-cromo-activa-v106', 'fichas'); localStorage.setItem('vg191-cine-visto','1'); localStorage.setItem('vanguard-tutorial-v33','1'); return 'pestaña fichas sembrada'; })()" 2>&1 | head -1
agent-browser open "$BASE/?r=1" >/dev/null 2>&1
sleep 9
agent-browser eval "(() => { const t = document.body.textContent || ''; if (!t.includes('LA COLECCIÓN DE GUERRA')) return 'PANEL NO MONTÓ'; const cartas = (t.match(/VG-\\d{2}/g) || []).filter((x, i, a) => a.indexOf(x) === i); if (cartas.length !== 11) return 'REGRESIÓN: ' + cartas.length + ' cartas ≠ 11 (' + cartas.join(',') + ')'; if (!t.includes('EL KIVU — M23')) return 'REGRESIÓN: la carta del Congo no está'; if (!t.includes('MYANMAR — LA JUNTA')) return 'REGRESIÓN: la carta de Myanmar no está'; if (!t.includes('RUSIA')) return 'REGRESIÓN: la carta clásica de Ucrania murió (no destruir)'; return 'ÁLBUM VERIFICADO: 11 cartas — VG-10 EL KIVU y VG-11 MYANMAR presentes, las 9 clásicas intactas'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa319-album.png >/dev/null 2>&1

echo "── B) LA GLORIA CANTA 13 ──"
agent-browser eval "(() => { const t = document.body.textContent || ''; if (!t.includes('LA GLORIA DEL AGENTE')) return 'sin gloria'; if (!t.includes('/13')) return 'REGRESIÓN: la gloria no canta /13'; return 'GLORIA VERIFICADA: la vitrina canta /13 títulos'; })()" 2>&1 | head -1

echo "── C) EL DETALLE DE LA CARTA NUEVA (la ficha técnica honesta) ──"
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find((x) => (x.getAttribute('aria-label') || '').includes('VG-10')); if (!b) return 'REGRESIÓN: sin botón de la carta VG-10'; b.click(); return 'click en la carta del Kivu'; })()" 2>&1 | head -1
sleep 2
agent-browser eval "(() => { const t = document.body.textContent || ''; if (!t.includes('MAR 2022')) return 'REGRESIÓN: la ficha técnica no muestra el inicio citable'; if (!t.includes('GOMA')) return 'REGRESIÓN: la ficha no nombra su teatro'; return 'DETALLE VERIFICADO: MAR 2022 · GOMA — la carta del Kivu habla humano'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa319-detalle.png >/dev/null 2>&1
agent-browser eval "(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); return 'Escape'; })()" >/dev/null 2>&1

echo "── D) CONSOLA LIMPIA + SIN DESBORDES ──"
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 1440 — REGRESIÓN' : 'sin desborde en 1440'; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -3; echo "(vacío = sin errores de página)"
agent-browser console 2>&1 | grep -i "maximum update\|too many re-renders\|hydration" && echo "REGRESIÓN DE RENDER/HIDRATACIÓN" || echo "consola sin bucles ni deshidrataciones"
agent-browser console 2>&1 | grep -i '\[error\]' | grep -v 'Download the React DevTools' | head -3 || echo "consola sin errores"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 390 — REGRESIÓN' : 'sin desborde en 390 (móvil ok)'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa319-movil.png >/dev/null 2>&1

agent-browser close >/dev/null 2>&1
kill "$SRVPID" 2>/dev/null; sleep 1; kill -9 "$SRVPID" 2>/dev/null
curl -s -o /dev/null --max-time 2 "$BASE/api/health" && echo "ZOMBI" || echo "puerto 3496 libre — cero zombis"
echo "QA VISUAL v319 FIN"

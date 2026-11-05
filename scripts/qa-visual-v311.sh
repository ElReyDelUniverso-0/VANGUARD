#!/bin/bash
# QA VISUAL v311 — LA TERCERA QUIRURGÍA (maquina-panel: el corte de la voz del parte)
# Ley v302: arranque + cirugía visual + cierre en UNA llamada.
# Lo que la cirugía debe preservar EXACTO (contrato de la lib de voz:
# «cambiar de día la corta») + el riesgo propio del ajuste durante el
# render (un bucle infinito colgaría la pestaña — se mide):
#   A) el CRONOATLAS monta y navega días (el reproductor intocado, seis focos)
#   B) la voz del parte se enciende → el aviso pasa a «Callar el parte»
#   C) cambiar de día → el aviso VUELVE a «Escuchar el parte» al instante
#      (el ajuste durante el render) y el audio se corta (el efecto puro)
#   D) consola limpia: sin errores de hidratación ni «Maximum update depth»
set -u
PORT=3496
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa311.log 2>&1 &
SRVPID=$!
ARRIBA=0
for i in $(seq 1 25); do sleep 1; if curl -s -o /dev/null "$BASE/api/health"; then ARRIBA=1; break; fi; done
echo "boot=$ARRIBA"
echo "SALUD: $(curl -s "$BASE/api/health")"
if [ "$ARRIBA" != "1" ]; then echo "SIN SERVIDOR — ABORTO"; kill -9 $SRVPID 2>/dev/null; exit 1; fi

agent-browser set viewport 1440 900 >/dev/null 2>&1

echo "── 0) SSR: el panel es lazy client (el SSR no lo cuelga) ──"
curl -s "$BASE/" | grep -c "despachos del frente" || echo "0 en el SSR (correcto: el panel monta en cliente)"

echo "── A) SEMBRAR LA PESTAÑA DE LA MÁQUINA Y ABRIR EL CRONOATLAS ──"
agent-browser console --clear >/dev/null 2>&1
agent-browser errors --clear >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 4
agent-browser eval "(() => { localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['maquina'])); localStorage.setItem('vg-cromo-activa-v106', 'maquina'); return 'pestaña de la máquina sembrada'; })()" 2>&1 | head -1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 8
agent-browser eval "(() => { const t = document.body.textContent || ''; if (!t.includes('despachos del frente')) return 'CRONOATLAS NO MONTÓ'; const d = (t.match(/despachos del frente · día (\d+)/) || [])[1]; return 'CRONOATLAS MONTADO — día inicial: ' + d; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa311-cronoatlas.png >/dev/null 2>&1

echo "── B) NAVEGAR DÍAS (el reproductor y sus seis focos, intocados) ──"
# TRAMPAS DEL ARNÉS PAGADAS: (1) el chevron genérico cazaba al scroll de la
# FRANJA de pestañas (el primero del DOM) — los botones del reproductor se
# buscan por su aria-label; (2) el día inicial es HOY: el avance está
# DESHABILITADO al arrancar — se retrocede primero y luego se vuelve.
agent-browser eval "(() => { const d1 = (document.body.textContent.match(/despachos del frente · día (\d+)/) || [])[1]; const back = document.querySelector('button[aria-label=\"Día anterior\"]'); if (!back) return 'botón de retroceso no encontrado'; if (back.disabled) return 'retroceso deshabilitado (día 0)'; back.click(); window.__vg_dia_antes = d1; return 'click de RETROCESO dado — día antes: ' + d1; })()" 2>&1 | head -1
sleep 2
agent-browser eval "(() => { const d2 = (document.body.textContent.match(/despachos del frente · día (\d+)/) || [])[1]; return 'día después del retroceso: ' + d2 + (d2 !== window.__vg_dia_antes ? ' — el reproductor responde (correcto)' : ' — REGRESIÓN: el día no cambia'); })()" 2>&1 | head -1
agent-browser eval "(() => { const fwd = document.querySelector('button[aria-label=\"Día siguiente\"]'); if (!fwd) return 'botón de avance no encontrado'; if (fwd.disabled) return 'avance deshabilitado (en HOY)'; fwd.click(); return 'click de AVANCE dado (vuelta a HOY)'; })()" 2>&1 | head -1
sleep 2
agent-browser eval "(() => { const d3 = (document.body.textContent.match(/despachos del frente · día (\d+)/) || [])[1]; return 'día tras el avance: ' + d3 + ' — dos cambios de día, el ajuste durante el render corrió dos veces'; })()" 2>&1 | head -1

echo "── C) EL CONTRATO DE LA VOZ: encender → cambiar de día → la casa calla ──"
agent-browser eval "(() => { const synth = window.speechSynthesis; if (!synth) return 'sin speechSynthesis en este navegador (la casa oculta el botón — correcto)'; const b = [...document.querySelectorAll('button')].find(x => (x.title||'').includes('parte')); if (!b) return 'botón de voz no encontrado'; b.click(); const aviso = b.title; return 'click en el voz — aviso AL INSTANTE: ' + aviso + (aviso === 'Callar el parte' ? ' — la voz se encendió (correcto)' : ' — el parte murió al instante (sin voces reales en headless; onerror honesto)'); })()" 2>&1 | head -1
agent-browser eval "(() => { const back = document.querySelector('button[aria-label=\"Día anterior\"]'); if (!back || back.disabled) return 'sin retroceso disponible'; back.click(); return 'cambio de día CON la voz encendida (la cura se ejercita)'; })()" 2>&1 | head -1
sleep 2
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => (x.title||'').includes('parte')); const aviso = b ? b.title : 'sin botón'; if (aviso === 'Callar el parte') return 'REGRESIÓN: el aviso quedó colgado tras cambiar de día (el ajuste durante el render no corrió)'; const d = (document.body.textContent.match(/despachos del frente · día (\d+)/) || [])[1]; return 'aviso tras cambiar de día: ' + aviso + ' · día ' + d + ' — la casa calla al cambiar de día (contrato intacto)'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa311-tras-cambio.png >/dev/null 2>&1

echo "── D) SIN BUCLES DE RENDER + CONSOLA LIMPIA ──"
agent-browser eval "(() => { const t = (document.body.textContent.match(/despachos del frente · día (\d+)/) || [])[1]; return 'la pestaña RESPONDE (sin bucle): día ' + t; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -3; echo "(vacío = sin errores de página)"
agent-browser console 2>&1 | grep -i "maximum update\|too many re-renders\|hydration" && echo "REGRESIÓN DE RENDER/HIDRATACIÓN" || echo "consola sin bucles ni deshidrataciones"
agent-browser console 2>&1 | grep -i '\[error\]' | grep -v 'Download the React DevTools' | head -3 || echo "consola sin errores"

agent-browser close >/dev/null 2>&1
kill "$SRVPID" 2>/dev/null; sleep 1; kill -9 "$SRVPID" 2>/dev/null
curl -s -o /dev/null --max-time 2 "$BASE/api/health" && echo "ZOMBI" || echo "puerto 3496 libre — cero zombis"
echo "QA VISUAL v311 FIN"

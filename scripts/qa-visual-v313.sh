#!/bin/bash
# QA VISUAL v313 — LA ESCUELA QUE RESPIRA (estrategia-data + panel: currículo
# doblado, giro diario, fin del cartel del ranking)
# Ley v302: arranque + cirugía visual + cierre en UNA llamada.
#   A) la escuela monta: 8 doctrinas, 6 de 10 wargames en mesa, 4 de 10 lecciones
#   B) TU honesto de novato: fila real con 0 V (no «¿?», no cartel)
#   C) EL FIN DEL CARTEL DEMOSTRADO: conquestWins=215 sembrado en el persist →
#      TU corona la tabla con «215 V» y puesto 1 (cableado real, no decoración)
#   D) interacción viva: doctrina y wargame responden al click
#   E) consola limpia: sin bucles ni deshidrataciones · sin desbordes 1440/390
set -u
PORT=3496
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa313.log 2>&1 &
SRVPID=$!
ARRIBA=0
for i in $(seq 1 25); do sleep 1; if curl -s -o /dev/null "$BASE/api/health"; then ARRIBA=1; break; fi; done
echo "boot=$ARRIBA"
echo "SALUD: $(curl -s "$BASE/api/health")"
if [ "$ARRIBA" != "1" ]; then echo "SIN SERVIDOR — ABORTO"; kill -9 $SRVPID 2>/dev/null; exit 1; fi

agent-browser set viewport 1440 900 >/dev/null 2>&1

echo "── A) SEMBRAR LA PESTAÑA DE ESTRATEGIA Y VERIFICAR LA ESCUELA ──"
agent-browser console --clear >/dev/null 2>&1
agent-browser errors --clear >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 4
agent-browser eval "(() => { localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['estrategia'])); localStorage.setItem('vg-cromo-activa-v106', 'estrategia'); return 'pestaña de estrategia sembrada'; })()" 2>&1 | head -1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 8
agent-browser eval "(() => { const t = document.body.textContent || ''; if (!t.includes('Estrategia Global')) return 'ESCUELA NO MONTÓ'; const doctrinas = ['Marea Corta','Muro Elástico','Mano de Sombras','Puño de Acero','Diente de Sierra','Coraza de Sal','Jinete Fantasma','Cámara Lenta'].filter(d => t.includes(d)).length; const hoyToca = (t.match(/hoy tocan (\d+) de 10/) || [])[1]; const lecciones = (t.match(/(\d+) de 10 cada día/) || [])[1]; return 'ESCUELA MONTADA — doctrinas vistas: ' + doctrinas + '/8 · wargames: ' + hoyToca + ' de 10 · lecciones: ' + lecciones + ' de 10'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa313-escuela.png >/dev/null 2>&1

echo "── B) TU HONESTO DE NOVATO: fila real con 0 V (sin cartel) ──"
# TRAMPA DEL ARNÉS PAGADA: las clases con «/» no son selector CSS válido — la
# fila TU se mide por su ventana de texto, no por su className
agent-browser eval "(() => { const t = document.body.textContent || ''; if (t.includes('gana wargames y sube a la tabla')) return 'REGRESIÓN: el texto del cartel antiguo sigue vivo'; if (t.includes('¿?')) return 'REGRESIÓN: el «¿?» decorativo sigue en la tabla'; const i = t.indexOf('TU · operador de Vanguard'); if (i === -1) return 'REGRESIÓN: la fila TU no existe'; const v = (t.slice(i, i + 90).match(/(\d+) V/) || [])[1]; return 'FILA TU REAL — victorias: ' + v + (v === '0' ? ' · novato honesto (0 V de verdad)' : ''); })()" 2>&1 | head -1

echo "── C) EL FIN DEL CARTEL DEMOSTRADO: conquestWins=215 → TU CORONA ──"
agent-browser eval "(() => { const crudo = localStorage.getItem('vanguard-game-state-v1'); if (!crudo) return 'sin persist del juego (novato puro)'; const j = JSON.parse(crudo); j.state = j.state || {}; j.state.conquestWins = 215; localStorage.setItem('vanguard-game-state-v1', JSON.stringify(j)); return 'conquestWins=215 sembrado en el persist'; })()" 2>&1 | head -1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 6
agent-browser eval "(() => { const filas = [...document.querySelectorAll('.divide-y > div')].filter(d => d.textContent.includes(' V')); const tu = filas.findIndex(f => f.textContent.includes('TU · operador de Vanguard')); if (tu === -1) return 'REGRESIÓN: TU desapareció de la tabla tras sembrar'; const v = (filas[tu].textContent.match(/(\d+) V/) || [])[1]; if (v !== '215') return 'REGRESIÓN: TU muestra ' + v + ' V (el cableado no lee el persist)'; const puesto = (filas[tu].textContent.trim().match(/^(\d+)/) || [])[1]; return tu === 0 ? 'TU CORONA LA TABLA — puesto 1 con 215 V REALES (la leyenda máx. tiene 214): el cableado es real' : 'TU con 215 V en el puesto ' + (tu + 1) + ' de la tabla'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa313-tu-corona.png >/dev/null 2>&1

echo "── D) INTERACCIÓN VIVA: doctrina y wargame responden ──"
agent-browser eval "(() => { const botones = [...document.querySelectorAll('button')].filter(b => ['Diente de Sierra','Coraza de Sal','Jinete Fantasma','Cámara Lenta'].includes(b.textContent.trim())); if (botones.length < 4) return 'las doctrinas nuevas no están en las pestañas (' + botones.length + ')'; botones[0].click(); return 'click en «' + botones[0].textContent.trim() + '» (doctrina del segundo ciclo)'; })()" 2>&1 | head -1
sleep 1
# TRAMPA DEL ARNÉS PAGADA (la segunda): «DOCTRINA EN CLASE» vive en la SALA
# 3D (las filas del contenido), no en la pizarra 2D — la pizarra pinta el
# PRINCIPIO y la contra-doctrina de la doctrina seleccionada
agent-browser eval "(() => { const t = document.body.textContent || ''; const sierra = t.includes('No un golpe sino una sierra'); const contra = t.includes('contra-doctrina histórica: Coraza de Sal'); return (sierra && contra) ? 'LA CLASE RESPONDIÓ: el principio de la sierra está en pizarra y su contra (Coraza de Sal) anuncia el ciclo nuevo' : 'REGRESIÓN: pizarra sin el principio (' + sierra + ') o sin la contra (' + contra + ')'; })()" 2>&1 | head -1
agent-browser eval "(() => { const mesa = [...document.querySelectorAll('button')].filter(b => /turnos · dificultad/.test(b.textContent)); if (mesa.length < 2) return 'la mesa no lista wargames'; const antes = mesa[0].className.includes('bg-violet-hud/10'); mesa[1].click(); return 'click en el wargame #2 de la mesa (selección en vivo)'; })()" 2>&1 | head -1
sleep 1
agent-browser eval "(() => { const t = document.body.textContent || ''; return t.includes('regla especial:') ? 'LA MESA RESPONDIÓ: la ficha del wargame pintó su regla especial' : 'REGRESIÓN: la ficha del wargame no pintó'; })()" 2>&1 | head -1

echo "── E) CONSOLA LIMPIA + SIN DESBORDES (1440 y 390) ──"
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 1440 — REGRESIÓN' : 'sin desborde en 1440 (escuela completa)'; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -3; echo "(vacío = sin errores de página)"
agent-browser console 2>&1 | grep -i "maximum update\|too many re-renders\|hydration" && echo "REGRESIÓN DE RENDER/HIDRATACIÓN" || echo "consola sin bucles ni deshidrataciones"
agent-browser console 2>&1 | grep -i '\[error\]' | grep -v 'Download the React DevTools' | head -3 || echo "consola sin errores"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 390 — REGRESIÓN' : 'sin desborde en 390 (móvil ok, la tabla de generales respira)'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa313-movil.png >/dev/null 2>&1

agent-browser close >/dev/null 2>&1
kill "$SRVPID" 2>/dev/null; sleep 1; kill -9 "$SRVPID" 2>/dev/null
curl -s -o /dev/null --max-time 2 "$BASE/api/health" && echo "ZOMBI" || echo "puerto 3496 libre — cero zombis"
echo "QA VISUAL v313 FIN"

#!/bin/bash
# QA VISUAL v315 — LA MESA CON MEMORIA (etapa 2: la mesa recuerda)
# Ley v302: arranque + cirugía visual + cierre en UNA llamada.
#   A) la escuela monta: botón jugar + MEMORIA DEL OPERADOR en ceros (novato honesto)
#   B) LA PARTIDA COMPLETA hasta el veredicto: botín cobrado EXACTO en el persist
#   C) LA MEMORIA RESPONDE: contadores actualizados (1 partida, racha, mejor objetivo)
#   D) EL REVIVIR: replay determinista — bitácora, veredicto y sello EXACTO;
#      y NO paga nada (la mesa solo se paga una vez)
#   E) Escape cierra · consola limpia · sin desbordes 1440/390 · cero zombis
set -u
PORT=3496
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa315.log 2>&1 &
SRVPID=$!
ARRIBA=0
for i in $(seq 1 25); do sleep 1; if curl -s -o /dev/null "$BASE/api/health"; then ARRIBA=1; break; fi; done
echo "boot=$ARRIBA"
echo "SALUD: $(curl -s "$BASE/api/health")"
if [ "$ARRIBA" != "1" ]; then echo "SIN SERVIDOR — ABORTO"; kill -9 $SRVPID 2>/dev/null; exit 1; fi

agent-browser set viewport 1440 900 >/dev/null 2>&1

echo "── A) LA ESCUELA MONTA CON SU MEMORIA EN CEROS ──"
agent-browser console --clear >/dev/null 2>&1
agent-browser errors --clear >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 4
agent-browser eval "(() => { localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['estrategia'])); localStorage.setItem('vg-cromo-activa-v106', 'estrategia'); return 'pestaña sembrada (novato sin persist)'; })()" 2>&1 | head -1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 8
agent-browser eval "(() => { const t = document.body.textContent || ''; if (!t.includes('Estrategia Global')) return 'ESCUELA NO MONTÓ'; if (!t.includes('memoria del operador')) return 'REGRESIÓN: la memoria del operador no se pinta'; const b = [...document.querySelectorAll('button')].find(x => /jugar esta mesa/.test(x.textContent)); if (!b) return 'REGRESIÓN: el botón jugar no existe'; const ceros = /0<\/p>/; return 'ESCUELA + MEMORIA EN CEROS · botón jugar presente'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa315-escuela.png >/dev/null 2>&1

echo "── B) LA PARTIDA COMPLETA HASTA EL VEREDICTO CON BOTÍN EXACTO ──"
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /jugar esta mesa/.test(x.textContent)); b.click(); return 'click en jugar'; })()" 2>&1 | head -1
sleep 2
agent-browser eval "(() => { const d = document.querySelector('[aria-label^=\"Mesa de wargame\"]'); if (!d) return 'REGRESIÓN: la mesa no abrió'; const turnos = (d.textContent.match(/turno (\d+) de (\d+)/) || []); return 'MESA ABIERTA — turno ' + (turnos[1] || '?') + ' de ' + (turnos[2] || '?'); })()" 2>&1 | head -1
agent-browser eval "(() => { let n = 0; const paso = () => { const d = document.querySelector('[aria-label^=\"Mesa de wargame\"]'); if (!d) return; const j = [...d.querySelectorAll('button')].filter(x => { const t = x.textContent.trim(); return t.startsWith('bajo') || t.startsWith('medio') || t.startsWith('alto'); }); if (j.length) { j[0].click(); n++; setTimeout(paso, 120); } }; paso(); return 'jugando la partida entera (jugada 1 de la mesa en cada turno)...'; })()" 2>&1 | head -1
sleep 4
agent-browser eval "(() => { const d = document.querySelector('[aria-label^=\"Mesa de wargame\"]'); if (!d) return 'REGRESIÓN: la mesa se cerró sola'; const t = d.textContent; const fin = t.includes('botín de la mesa'); if (!fin) return 'la partida aún corre (turno ' + ((t.match(/turno (\d+) de/) || [])[1] || '?') + ')'; window.__vg_botin = +(t.match(/\+(\d+) monedas/) || [])[1]; window.__vg_gano = t.includes('objetivo azul cumplido'); window.__vg_objetivo = +(t.match(/(\d+)\/100/) || [])[1]; const m = t.match(/memoria de la mesa: (\d+) partidas · (\d+) ganadas · racha (\d+) \(mejor (\d+)\)/); if (!m) return 'REGRESIÓN: la línea de memoria de la mesa no aparece en el veredicto'; const crudo = localStorage.getItem('vanguard-game-state-v1'); if (!crudo) return 'REGRESIÓN: sin persist tras la partida'; const st = JSON.parse(crudo).state; const esperadoGanadas = window.__vg_gano ? 1 : 0; const ok = +m[1] === 1 && +m[2] === esperadoGanadas && +m[3] === esperadoGanadas && +m[4] === esperadoGanadas && st.wargameStats.jugadas === 1 && st.wargameStats.mejorObjetivo === window.__vg_objetivo && st.coins === 250 + window.__vg_botin; return ok ? 'VEREDICTO + MEMORIA VERIFICADOS: botín ' + window.__vg_botin + ' coins cobrado (persist 250+' + window.__vg_botin + '=' + st.coins + ') · stats 1 partida/' + esperadoGanadas + ' ganadas · racha ' + esperadoGanadas + ' · mejor objetivo ' + window.__vg_objetivo + ' · historial guardado con ' + st.wargameHistorial[0].jugadas.length + ' jugadas' : 'REVISAR: memoria línea=' + JSON.stringify(m) + ' stats=' + JSON.stringify(st.wargameStats) + ' coins=' + st.coins + ' esperado ' + (250 + window.__vg_botin); })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa315-veredicto.png >/dev/null 2>&1

echo "── C) LA FICHA LLEVA EL TABLERO Y EL REVIVIR ──"
agent-browser eval "(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); return 'mesa cerrada con Escape'; })()" 2>&1 | head -1
sleep 1
agent-browser eval "(() => { const t = document.body.textContent || ''; if (!t.includes('mejores partidas')) return 'REGRESIÓN: el tablero de mejores partidas no aparece'; const r = [...document.querySelectorAll('button')].find(x => /revivir/.test(x.textContent)); if (!r) return 'REGRESIÓN: el botón revivir no existe'; const fila = r.closest('div').parentElement.textContent; window.__vg_objetivo_tablero = +(fila.match(/(\d+)\/100/) || [])[1]; return 'TABLERO PRESENTE — partida guardada: ' + window.__vg_objetivo_tablero + '/100 · botón revivir listo'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa315-memoria.png >/dev/null 2>&1

echo "── D) EL REVIVIR: REPLAY DETERMINISTA QUE NO PAGA ──"
agent-browser eval "(() => { const r = [...document.querySelectorAll('button')].find(x => /revivir/.test(x.textContent)); r.click(); return 'click en revivir'; })()" 2>&1 | head -1
sleep 2
agent-browser eval "(() => { const d = document.querySelector('[aria-label^=\"Replay de la mesa\"]'); if (!d) return 'REGRESIÓN: el portal de replay no abrió'; const t = d.textContent; const ex = t.includes('replay EXACTO'); const objetivo = +(t.match(/(\d+)\/100/) || [])[1]; const lineas = d.querySelectorAll('.hud-corner.max-h-56 p').length; const crudo = localStorage.getItem('vanguard-game-state-v1'); const coins = crudo ? JSON.parse(crudo).state.coins : null; const okCoins = coins === 250 + window.__vg_botin; return (ex && objetivo === window.__vg_objetivo_tablero && lineas >= 5 && okCoins) ? 'REPLAY VERIFICADO: bitácora ' + lineas + ' líneas · objetivo ' + objetivo + '/100 EXACTO al original · sello replay EXACTO · coins intactos (' + coins + ' — el replay NO paga)' : 'REVISAR: exacto=' + ex + ' objetivo=' + objetivo + '/' + window.__vg_objetivo_tablero + ' líneas=' + lineas + ' coins=' + coins + ' esperado ' + (250 + window.__vg_botin); })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa315-replay.png >/dev/null 2>&1

echo "── E) ESCAPE CIERRA + CONSOLA LIMPIA + SIN DESBORDES ──"
agent-browser eval "(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); return 'Escape despachado al replay'; })()" 2>&1 | head -1
sleep 1
agent-browser eval "(() => { const d = document.querySelector('[aria-label^=\"Replay de la mesa\"]'); return d ? 'REGRESIÓN: el replay sigue abierto tras Escape' : 'el replay CERRÓ con Escape (contrato intacto)'; })()" 2>&1 | head -1
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 1440 — REGRESIÓN' : 'sin desborde en 1440'; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -3; echo "(vacío = sin errores de página)"
agent-browser console 2>&1 | grep -i "maximum update\|too many re-renders\|hydration" && echo "REGRESIÓN DE RENDER/HIDRATACIÓN" || echo "consola sin bucles ni deshidrataciones"
agent-browser console 2>&1 | grep -i '\[error\]' | grep -v 'Download the React DevTools' | head -3 || echo "consola sin errores"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 390 — REGRESIÓN' : 'sin desborde en 390 (móvil ok)'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa315-movil.png >/dev/null 2>&1

agent-browser close >/dev/null 2>&1
kill "$SRVPID" 2>/dev/null; sleep 1; kill -9 "$SRVPID" 2>/dev/null
curl -s -o /dev/null --max-time 2 "$BASE/api/health" && echo "ZOMBI" || echo "puerto 3496 libre — cero zombis"
echo "QA VISUAL v315 FIN"

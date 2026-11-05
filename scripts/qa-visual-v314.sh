#!/bin/bash
# QA VISUAL v314 — LA MESA VIVA (wargame por decisiones en estrategia-panel)
# Ley v302: arranque + cirugía visual + cierre en UNA llamada.
#   A) la escuela monta y el botón «jugar esta mesa» existe
#   B) la mesa abre en portal: 8 turnos, 3 jugadas, barras y bitácora
#   C) una jugada responde: la bitácora crece y el turno avanza
#   D) LA PARTIDA COMPLETA hasta el veredicto y el botín COBRADO EN EL PERSIST
#      (coins ANTES/DESPUÉS — progreso real, no carteles)
#   E) Escape cierra · consola limpia · sin desbordes 1440/390 · cero zombis
set -u
PORT=3496
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa314.log 2>&1 &
SRVPID=$!
ARRIBA=0
for i in $(seq 1 25); do sleep 1; if curl -s -o /dev/null "$BASE/api/health"; then ARRIBA=1; break; fi; done
echo "boot=$ARRIBA"
echo "SALUD: $(curl -s "$BASE/api/health")"
if [ "$ARRIBA" != "1" ]; then echo "SIN SERVIDOR — ABORTO"; kill -9 $SRVPID 2>/dev/null; exit 1; fi

agent-browser set viewport 1440 900 >/dev/null 2>&1

echo "── A) SEMBRAR ESTRATEGIA Y VERIFICAR EL BOTÓN JUGAR ──"
agent-browser console --clear >/dev/null 2>&1
agent-browser errors --clear >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 4
agent-browser eval "(() => { localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['estrategia'])); localStorage.setItem('vg-cromo-activa-v106', 'estrategia'); const c = localStorage.getItem('vanguard-game-state-v1'); if (c) { const j = JSON.parse(c); j.state = j.state || {}; window.__vg_coins_antes = j.state.coins; } return 'pestaña sembrada · coins ANTES: ' + (window.__vg_coins_antes ?? 'novato (250 por defecto)'); })()" 2>&1 | head -1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 8
agent-browser eval "(() => { const t = document.body.textContent || ''; if (!t.includes('Estrategia Global')) return 'ESCUELA NO MONTÓ'; const b = [...document.querySelectorAll('button')].find(x => /jugar esta mesa/.test(x.textContent)); return b ? 'BOTÓN JUGAR PRESENTE — ' + b.textContent.trim().replace(/\s+/g,' ') : 'REGRESIÓN: el botón jugar no existe (la mesa no es viva)'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa314-escuela.png >/dev/null 2>&1

echo "── B) LA MESA ABRE EN PORTAL ──"
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /jugar esta mesa/.test(x.textContent)); if (!b) return 'sin botón'; b.click(); return 'click en jugar'; })()" 2>&1 | head -1
sleep 2
agent-browser eval "(() => { const d = document.querySelector('[aria-label^=\"Mesa de wargame\"]'); if (!d) return 'REGRESIÓN: el portal de la mesa no abrió'; const t = d.textContent; const turnos = (t.match(/turno (\d+) de (\d+)/) || []); const jugadas = [...d.querySelectorAll('button')].filter(x => x.textContent.trim().startsWith('bajo') || x.textContent.trim().startsWith('medio') || x.textContent.trim().startsWith('alto')).length; return 'MESA ABIERTA — turno ' + (turnos[1] || '?') + ' de ' + (turnos[2] || '?') + ' · jugadas en mesa: ' + jugadas + ' · bitácora: ' + (t.includes('La mesa abre') ? 'con regla especial narrada' : 'SIN regla'); })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa314-mesa.png >/dev/null 2>&1

echo "── C) UNA JUGADA RESPONDE ──"
agent-browser eval "(() => { const d = document.querySelector('[aria-label^=\"Mesa de wargame\"]'); const lineas = d.querySelectorAll('.hud-corner.max-h-44 p').length; window.__vg_bitacora_antes = lineas; const j = [...d.querySelectorAll('button')].find(x => x.textContent.trim().startsWith('bajo') || x.textContent.trim().startsWith('medio') || x.textContent.trim().startsWith('alto')); j.click(); return 'click en «' + j.textContent.trim().split(/\s+/).slice(1).join(' ').slice(0, 30) + '» · líneas de bitácora antes: ' + lineas; })()" 2>&1 | head -1
sleep 1
agent-browser eval "(() => { const d = document.querySelector('[aria-label^=\"Mesa de wargame\"]'); const t = d.textContent; const lineas = d.querySelectorAll('.hud-corner.max-h-44 p').length; const turno = (t.match(/turno (\d+) de/) || [])[1]; return lineas > window.__vg_bitacora_antes && +turno >= 2 ? 'LA MESA RESPONDIÓ: bitácora creció (' + window.__vg_bitacora_antes + ' → ' + lineas + ') y el turno avanza (' + turno + ')' : 'REGRESIÓN: la jugada no respondió (bitácora ' + lineas + ', turno ' + turno + ')'; })()" 2>&1 | head -1

echo "── D) LA PARTIDA COMPLETA HASTA EL VEREDICTO Y EL BOTÍN COBRADO ──"
agent-browser eval "(() => { let n = 0; const paso = () => { const d = document.querySelector('[aria-label^=\"Mesa de wargame\"]'); if (!d) return; const j = [...d.querySelectorAll('button')].filter(x => { const t = x.textContent.trim(); return t.startsWith('bajo') || t.startsWith('medio') || t.startsWith('alto'); }); if (j.length) { j[0].click(); n++; setTimeout(paso, 120); } }; paso(); return 'jugando la partida entera (jugada 1 de la mesa en cada turno)...'; })()" 2>&1 | head -1
sleep 4
agent-browser eval "(() => { const d = document.querySelector('[aria-label^=\"Mesa de wargame\"]'); if (!d) return 'REGRESIÓN: la mesa se cerró sola'; const t = d.textContent; const fin = t.includes('botín de la mesa') || t.includes('objetivo azul cumplido') || t.includes('el rojo impone') || t.includes('empate'); if (!fin) return 'la partida aún corre (turno ' + ((t.match(/turno (\d+) de/) || [])[1] || '?') + ')'; const botin = +(t.match(/\+(\d+) monedas/) || [])[1]; const crudo = localStorage.getItem('vanguard-game-state-v1'); if (!crudo) return 'REGRESIÓN: el botín NO se cobró (persist inexistente tras la partida)'; const coinsAhora = JSON.parse(crudo).state.coins; return coinsAhora === 250 + botin ? 'BOTÍN COBRADO Y VERIFICADO: 250 + ' + botin + ' = ' + coinsAhora + ' coins en el persist (el novato no tenía persist — nació con el cobro exacto)' : 'coins AHORA: ' + coinsAhora + ' (esperado 250+' + botin + '=' + (250 + botin) + ') — REVISAR'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa314-veredicto.png >/dev/null 2>&1

echo "── E) ESCAPE CIERRA + CONSOLA LIMPIA + SIN DESBORDES ──"
agent-browser eval "(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); return 'Escape despachado'; })()" 2>&1 | head -1
sleep 1
agent-browser eval "(() => { const d = document.querySelector('[aria-label^=\"Mesa de wargame\"]'); return d ? 'REGRESIÓN: la mesa sigue abierta tras Escape' : 'la mesa CERRÓ con Escape (contrato intacto)'; })()" 2>&1 | head -1
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 1440 — REGRESIÓN' : 'sin desborde en 1440'; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -3; echo "(vacío = sin errores de página)"
agent-browser console 2>&1 | grep -i "maximum update\|too many re-renders\|hydration" && echo "REGRESIÓN DE RENDER/HIDRATACIÓN" || echo "consola sin bucles ni deshidrataciones"
agent-browser console 2>&1 | grep -i '\[error\]' | grep -v 'Download the React DevTools' | head -3 || echo "consola sin errores"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 390 — REGRESIÓN' : 'sin desborde en 390 (móvil ok)'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa314-movil.png >/dev/null 2>&1

agent-browser close >/dev/null 2>&1
kill "$SRVPID" 2>/dev/null; sleep 1; kill -9 "$SRVPID" 2>/dev/null
curl -s -o /dev/null --max-time 2 "$BASE/api/health" && echo "ZOMBI" || echo "puerto 3496 libre — cero zombis"
echo "QA VISUAL v314 FIN"

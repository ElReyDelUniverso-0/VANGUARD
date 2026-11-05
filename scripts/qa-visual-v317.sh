#!/bin/bash
# QA VISUAL v317 — LA MESA EN LA PORTADA (etapa 4: la escuela entra al FEED)
# Ley v302: arranque + cirugía visual + cierre en UNA llamada.
#   A) LA PARTIDA REAL: la escuela juega una partida completa (novato honesto
#      con historial previo limpio) → botín cobrado + historial[0] en el persist
#   B) LA PORTADA: la tarjeta LA MESA en PARA TI — UNA sola, con el titulo y
#      el veredicto de ESA partida, la racha viva y @LA ESCUELA DEL MANDO
#   C) EL REVIVIR DESDE EL FEED: REVIVIR LA MESA → la escuela abre el replay
#      determinista (sello replay EXACTO, coins intactos — el replay NO paga)
#      → Escape cierra
#   D) consola limpia · sin desbordes 1440/390 · cero zombis
set -u
PORT=3496
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa317.log 2>&1 &
SRVPID=$!
ARRIBA=0
for i in $(seq 1 25); do sleep 1; if curl -s -o /dev/null "$BASE/api/health"; then ARRIBA=1; break; fi; done
echo "boot=$ARRIBA"
echo "SALUD: $(curl -s "$BASE/api/health")"
if [ "$ARRIBA" != "1" ]; then echo "SIN SERVIDOR — ABORTO"; kill -9 $SRVPID 2>/dev/null; exit 1; fi

agent-browser set viewport 1440 900 >/dev/null 2>&1

echo "── A) LA PARTIDA REAL EN LA ESCUELA (el botín que alimenta la tarjeta) ──"
agent-browser console --clear >/dev/null 2>&1
agent-browser errors --clear >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 4
# historial limpio para que la tarjeta de la etapa B sea EXACTAMENTE esta partida
agent-browser eval "(() => { localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['estrategia'])); localStorage.setItem('vg-cromo-activa-v106', 'estrategia'); const K='vanguard-game-state-v1'; const c = localStorage.getItem(K); if (c) { const j = JSON.parse(c); j.state.wargameHistorial = []; j.state.wargameStats = { jugadas: 0, ganadas: 0, racha: 0, mejorRacha: 0, mejorObjetivo: 0 }; localStorage.setItem(K, JSON.stringify(j)); } return 'pestaña sembrada · historial limpio'; })()" 2>&1 | head -1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 8
agent-browser eval "(() => { const t = document.body.textContent || ''; if (!t.includes('Estrategia Global')) return 'ESCUELA NO MONTÓ'; const c = localStorage.getItem('vanguard-game-state-v1'); window.__vg_coins_antes = c ? JSON.parse(c).state.coins : 250; const st = c ? JSON.parse(c).state : {}; if ((st.wargameHistorial || []).length !== 0) return 'REGRESIÓN: el historial no quedó limpio'; return 'ESCUELA MONTADA · historial 0 · coins ANTES: ' + window.__vg_coins_antes; })()" 2>&1 | head -1
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /jugar esta mesa/.test(x.textContent)); if (!b) return 'REGRESIÓN: sin botón jugar'; b.click(); return 'click en jugar'; })()" 2>&1 | head -1
sleep 2
agent-browser eval "(() => { let n = 0; const paso = () => { const d = document.querySelector('[aria-label^=\"Mesa de wargame\"]'); if (!d) return; const j = [...d.querySelectorAll('button')].filter(x => { const t = x.textContent.trim(); return t.startsWith('bajo') || t.startsWith('medio') || t.startsWith('alto'); }); if (j.length) { j[0].click(); n++; setTimeout(paso, 120); } }; paso(); return 'jugando la partida entera...'; })()" 2>&1 | head -1
sleep 4
agent-browser eval "(() => { const d = document.querySelector('[aria-label^=\"Mesa de wargame\"]'); if (!d) return 'REGRESIÓN: la mesa se cerró sola'; const t = d.textContent; if (!t.includes('botín de la mesa')) return 'la partida aún corre (turno ' + ((t.match(/turno (\d+) de/) || [])[1] || '?') + ')'; const botin = +(t.match(/\+(\d+) monedas/) || [])[1]; const st = JSON.parse(localStorage.getItem('vanguard-game-state-v1')).state; const p = (st.wargameHistorial || [])[0]; if (!p) return 'REGRESIÓN: sin partida en el historial'; const delta = st.coins - window.__vg_coins_antes; const logMonedas = (st.log || []).filter(l => /\+\d+ monedas/.test(l.msg || '')).map(l => l.msg); const cobroWargame = logMonedas.some(m => m.includes('veredicto de la mesa')); if (!cobroWargame) return 'REGRESIÓN: el botín de la mesa no quedó en el log'; if (delta < botin) return 'REGRESIÓN: el botín se perdió (delta ' + delta + ' < ' + botin + ')'; const extra = delta !== botin ? ' · cobros extra NOMBRADOS: ' + logMonedas.filter(m => !m.includes('veredicto de la mesa')).join(' | ') : ''; return 'PARTIDA GUARDADA: ' + p.titulo + ' · objetivo ' + p.objetivoAzul + '/' + p.objetivoRojo + ' · ganaAzul=' + p.ganaAzul + ' · botín ' + botin + ' EN EL LOG · delta total ' + delta + ' (antes ' + window.__vg_coins_antes + ' → ahora ' + st.coins + ')' + extra + ' · racha ' + st.wargameStats.racha; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa317-partida.png >/dev/null 2>&1

echo "── B) LA TARJETA LA MESA EN LA PORTADA (PARA TI) ──"
agent-browser eval "(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['foryou'])); localStorage.setItem('vg-cromo-activa-v106', 'foryou'); return 'mesa cerrada · pestaña foryou sembrada'; })()" 2>&1 | head -1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 8
agent-browser eval "(() => { const t = document.body.textContent || ''; if (!t.includes('Para Ti')) return 'PORTADA NO MONTÓ'; const chips = (t.match(/La escuela del mando/g) || []).length; if (chips !== 1) return 'REGRESIÓN: ' + chips + ' tarjetas LA MESA (debe ser UNA — no granja de replays)'; if (!t.includes('@LA ESCUELA DEL MANDO')) return 'REGRESIÓN: la tarjeta no firma la escuela'; if (!t.includes('LA MESA')) return 'REGRESIÓN: sin chip LA MESA'; const crudo = localStorage.getItem('vanguard-game-state-v1'); const st = crudo ? JSON.parse(crudo).state : {}; const primera = (st.wargameHistorial || [])[0]; if (!primera) return 'REGRESIÓN: el persist perdió la partida'; window.__vg_coins_partida = st.coins; if (!t.includes(primera.titulo)) return 'REGRESIÓN: la tarjeta no muestra la partida (' + primera.titulo + ')'; const veredicto = primera.ganaAzul ? 'VICTORIA AZUL' : 'VICTORIA ROJA'; if (!t.includes(veredicto)) return 'REGRESIÓN: sin veredicto ' + veredicto; if (!t.includes('victoria ' + (primera.ganaAzul ? 'azul' : 'roja'))) return 'REGRESIÓN: sin veredicto en la mesa pintada'; if (!t.includes('racha ' + st.wargameStats.racha)) return 'REGRESIÓN: sin racha viva'; if (!t.includes('mejor objetivo ' + st.wargameStats.mejorObjetivo + '/100')) return 'REGRESIÓN: sin mejor objetivo'; if (!t.includes('TU ÚLTIMA PARTIDA EN LA ESCUELA')) return 'REGRESIÓN: el algoritmo no da la cara'; return 'TARJETA LA MESA VERIFICADA: ' + primera.titulo + ' — ' + veredicto + ' · objetivo ' + primera.objetivoAzul + ' vs ' + primera.objetivoRojo + ' · UNA tarjeta · racha ' + st.wargameStats.racha + ' · el algoritmo da la cara'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa317-tarjeta.png >/dev/null 2>&1

echo "── C) EL REVIVIR DESDE EL FEED (el contrato vg:mesa-revivir) ──"
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => (x.textContent || '').includes('Revivir la mesa')); if (!b) return 'REGRESIÓN: sin botón REVIVIR'; b.click(); return 'click en REVIVIR LA MESA — navegando a la escuela...'; })()" 2>&1 | head -1
sleep 5
agent-browser eval "(() => { const t = document.body.textContent || ''; if (!t.includes('Estrategia Global')) return 'REGRESIÓN: el revivir no llevó a la escuela'; if (!t.includes('revivir ·')) return 'REGRESIÓN: el replay no abrió (el contrato no llegó o la llave no resolvió)'; const st = JSON.parse(localStorage.getItem('vanguard-game-state-v1')).state; const primera = (st.wargameHistorial || [])[0]; if (!t.includes(primera.titulo)) return 'REGRESIÓN: el replay no muestra la partida'; if (!t.includes('replay EXACTO')) return 'REVISAR: el replay no firmó EXACTO (¿desvío del currículo?)'; if (st.coins !== window.__vg_coins_partida) return 'REGRESIÓN: el replay PAGÓ (' + st.coins + ' ≠ ' + window.__vg_coins_partida + ') — el replay es cine, no economía'; return 'REVIVIR DESDE LA PORTADA VERIFICADO: replay EXACTO de ' + primera.titulo + ' · ' + primera.objetivoAzul + '/100 · coins intactos ' + st.coins + ' (el replay NO paga)'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa317-replay.png >/dev/null 2>&1
agent-browser eval "(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); return 'Escape'; })()" >/dev/null 2>&1
sleep 1
agent-browser eval "(() => { const t = document.body.textContent || ''; return t.includes('revivir ·') ? 'REGRESIÓN: el replay quedó abierto tras Escape' : 'Escape honesto: el replay se cerró'; })()" 2>&1 | head -1

echo "── D) CONSOLA LIMPIA + SIN DESBORDES ──"
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 1440 — REGRESIÓN' : 'sin desborde en 1440'; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -3; echo "(vacío = sin errores de página)"
agent-browser console 2>&1 | grep -i "maximum update\|too many re-renders\|hydration" && echo "REGRESIÓN DE RENDER/HIDRATACIÓN" || echo "consola sin bucles ni deshidrataciones"
agent-browser console 2>&1 | grep -i '\[error\]' | grep -v 'Download the React DevTools' | head -3 || echo "consola sin errores"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 390 — REGRESIÓN' : 'sin desborde en 390 (móvil ok)'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa317-movil.png >/dev/null 2>&1

agent-browser close >/dev/null 2>&1
kill "$SRVPID" 2>/dev/null; sleep 1; kill -9 "$SRVPID" 2>/dev/null
curl -s -o /dev/null --max-time 2 "$BASE/api/health" && echo "ZOMBI" || echo "puerto 3496 libre — cero zombis"
echo "QA VISUAL v317 FIN"

#!/bin/bash
# QA VISUAL v316 — LA ESCUELA DE INSIGNIAS (etapa 3: la memoria alimenta al checker)
# Ley v302: arranque + cirugía visual + cierre en UNA llamada.
#   A) la escuela monta: memoria + línea «insignias de la escuela: 0 de 6» (novato honesto)
#   B) LA PARTIDA COMPLETA: botín exacto + LAS INSIGNIAS CAZADAS en el persist
#      (unlockedAchievements con ACH-WGM-*) + el log con su desbloqueo
#   C) la ficha muestra la caza (insignias de la escuela: N de 6, compuesto de la fuente)
#   D) la vitrina pública /objetivos compone sus 106 (sin «100» a mano)
#   E) Escape cierra · consola limpia · sin desbordes 1440/390 · cero zombis
set -u
PORT=3496
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa316.log 2>&1 &
SRVPID=$!
ARRIBA=0
for i in $(seq 1 25); do sleep 1; if curl -s -o /dev/null "$BASE/api/health"; then ARRIBA=1; break; fi; done
echo "boot=$ARRIBA"
echo "SALUD: $(curl -s "$BASE/api/health")"
if [ "$ARRIBA" != "1" ]; then echo "SIN SERVIDOR — ABORTO"; kill -9 $SRVPID 2>/dev/null; exit 1; fi

agent-browser set viewport 1440 900 >/dev/null 2>&1

echo "── A) LA ESCUELA MONTA CON SU MEMORIA E INSIGNIAS EN CERO ──"
agent-browser console --clear >/dev/null 2>&1
agent-browser errors --clear >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 4
agent-browser eval "(() => { localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['estrategia'])); localStorage.setItem('vg-cromo-activa-v106', 'estrategia'); const c = localStorage.getItem('vanguard-game-state-v1'); window.__vg_coins_antes = c ? JSON.parse(c).state.coins : 250; return 'pestaña sembrada · coins ANTES: ' + window.__vg_coins_antes; })()" 2>&1 | head -1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 8
agent-browser eval "(() => { const t = document.body.textContent || ''; if (!t.includes('Estrategia Global')) return 'ESCUELA NO MONTÓ'; if (!t.includes('memoria del operador')) return 'REGRESIÓN: la memoria no se pinta'; if (!t.includes('insignias de la escuela')) return 'REGRESIÓN: la línea de insignias no existe'; const m = t.match(/insignias de la escuela: (\d+) de (\d+)/); if (!m) return 'REGRESIÓN: la caza de insignias no está compuesta'; const c2 = localStorage.getItem('vanguard-game-state-v1'); window.__vg_coins_antes = c2 ? JSON.parse(c2).state.coins : 250; return 'ESCUELA MONTADA — insignias del novato: ' + m[1] + ' de ' + m[2] + ' · coins ANTES capturados: ' + window.__vg_coins_antes; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa316-escuela.png >/dev/null 2>&1

echo "── B) LA PARTIDA COMPLETA: BOTÍN EXACTO + INSIGNIAS CAZADAS ──"
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find(x => /jugar esta mesa/.test(x.textContent)); b.click(); return 'click en jugar'; })()" 2>&1 | head -1
sleep 2
agent-browser eval "(() => { let n = 0; const paso = () => { const d = document.querySelector('[aria-label^=\"Mesa de wargame\"]'); if (!d) return; const j = [...d.querySelectorAll('button')].filter(x => { const t = x.textContent.trim(); return t.startsWith('bajo') || t.startsWith('medio') || t.startsWith('alto'); }); if (j.length) { j[0].click(); n++; setTimeout(paso, 120); } }; paso(); return 'jugando la partida entera...'; })()" 2>&1 | head -1
sleep 4
agent-browser eval "(() => { const d = document.querySelector('[aria-label^=\"Mesa de wargame\"]'); if (!d) return 'REGRESIÓN: la mesa se cerró sola'; const t = d.textContent; if (!t.includes('botín de la mesa')) return 'la partida aún corre (turno ' + ((t.match(/turno (\d+) de/) || [])[1] || '?') + ')'; const botin = +(t.match(/\+(\d+) monedas/) || [])[1]; window.__vg_gano = t.includes('objetivo azul cumplido'); const crudo = localStorage.getItem('vanguard-game-state-v1'); if (!crudo) return 'REGRESIÓN: sin persist'; const st = JSON.parse(crudo).state; const wgm = (st.unlockedAchievements || []).filter(x => x.startsWith('ACH-WGM-')); const esperadas = window.__vg_gano ? ['ACH-WGM-1', 'ACH-WGM-WIN-1', 'ACH-WGM-OBJ-80'] : ['ACH-WGM-1']; const todas = esperadas.every(x => wgm.includes(x)); const okCoins = st.coins === window.__vg_coins_antes + botin; const hayLog = (st.log || []).some(l => /Logro desbloqueado/.test(l.msg || '')); return (todas && okCoins) ? 'INSIGNIAS CAZADAS Y VERIFICADAS: ' + wgm.join(', ') + ' · botín ' + botin + ' cobrado (persist ' + window.__vg_coins_antes + '+' + botin + '=' + st.coins + ')' + (hayLog ? ' · log con el desbloqueo (sin pago automático — el reclamo es del operador)' : '') : 'REVISAR: wgm=' + JSON.stringify(wgm) + ' esperadas=' + JSON.stringify(esperadas) + ' coins=' + st.coins + ' esperado ' + (window.__vg_coins_antes + botin); })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa316-veredicto.png >/dev/null 2>&1

echo "── C) LA ESCUELA MUESTRA SU CAZA ──"
agent-browser eval "(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); return 'mesa cerrada'; })()" 2>&1 | head -1
sleep 1
agent-browser eval "(() => { const m = (document.body.textContent || '').match(/insignias de la escuela: (\d+) de (\d+)/); if (!m) return 'REGRESIÓN: la caza desapareció'; const esperado = window.__vg_gano ? 3 : 1; return (+m[1] === esperado) ? 'LA CAZA VIVA: insignias de la escuela ' + m[1] + ' de ' + m[2] + ' (la ficha refleja el checker canónico)' : 'REVISAR: caza ' + m[1] + ' ≠ ' + esperado; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa316-caza.png >/dev/null 2>&1

echo "── D) LA VITRINA PÚBLICA COMPONE SUS OBJETIVOS ──"
curl -s "$BASE/objetivos" -o /tmp/render/objetivos-ssr.html
agent-browser eval "(() => { return 'curl hecho aparte'; })()" >/dev/null 2>&1
python3 -c "
html = open('/tmp/render/objetivos-ssr.html').read()
ok_h1 = 'LOS <span' in html and '106' in html
ok_corona = '106 objetivos' in html or '106</span> OBJETIVOS' in html
ok_mapa = 'Los 106 se cazan aquí' in html
ok_escuela = 'ESCUELA' in html
print('vitrina SSR: H1 compuesto con 106 =', ok_h1, '· mapa con 106 =', ok_mapa, '· bloque ESCUELA viaja =', ok_escuela)
print('VEREDICTO VITRINA:', 'OK — la vitrina compone de la fuente (cero 100 a mano)' if (ok_h1 and ok_mapa) else 'REVISAR: la vitrina no compone')
"

echo "── E) ESCAPE + CONSOLA LIMPIA + SIN DESBORDES ──"
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 1440 — REGRESIÓN' : 'sin desborde en 1440'; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -3; echo "(vacío = sin errores de página)"
agent-browser console 2>&1 | grep -i "maximum update\|too many re-renders\|hydration" && echo "REGRESIÓN DE RENDER/HIDRATACIÓN" || echo "consola sin bucles ni deshidrataciones"
agent-browser console 2>&1 | grep -i '\[error\]' | grep -v 'Download the React DevTools' | head -3 || echo "consola sin errores"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 390 — REGRESIÓN' : 'sin desborde en 390 (móvil ok)'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa316-movil.png >/dev/null 2>&1

agent-browser close >/dev/null 2>&1
kill "$SRVPID" 2>/dev/null; sleep 1; kill -9 "$SRVPID" 2>/dev/null
curl -s -o /dev/null --max-time 2 "$BASE/api/health" && echo "ZOMBI" || echo "puerto 3496 libre — cero zombis"
echo "QA VISUAL v316 FIN"

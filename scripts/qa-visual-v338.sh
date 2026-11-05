#!/bin/bash
# QA VISUAL v338 — LA MESA EN EL TABLÓN (LA MESA VIVA etapa 5: el desafío de
# la semana y el contrato al tablón — la cola viva más vieja, pagada)
# Ley v302: arranque + verificación + cierre en UNA llamada.
#   A) LA FRANJA DEL DESAFÍO: título, dificultad fija, par-estimación, la ley
#      en pantalla y el novato honesto («la mesa te espera»)
#   B) LA MESA DEL DESAFÍO: abre con SU cabecera (la misma mesa para toda la
#      escuela) y la partida SE JUEGA ENTERA por el arnés (jugadas de riesgo)
#   C) EL CONTRATO: el veredicto anota el objetivo — desafioMejor en el
#      persist con la llave de semana del tablón
#   D) EL TABLÓN: DESAFÍO DE LA ESCUELA pinta la MISMA semana y TU mejor mesa
#   E) SIN BUCLES: consola limpia · sin desbordes 1440/390 · cero errores
#   F) CIERRE: pgrep centinela (v332) + canon repo restaurado
set -u
PORT=3527
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa338.log 2>&1 &
ARRIBA=0
for i in $(seq 1 25); do sleep 1; if curl -s -o /dev/null "$BASE/api/health"; then ARRIBA=1; break; fi; done
echo "boot=$ARRIBA"
echo "SALUD: $(curl -s "$BASE/api/health" | head -c 150)"
if [ "$ARRIBA" != "1" ]; then echo "SIN SERVIDOR — ABORTO"; pkill -9 -f "standalone/server.js" 2>/dev/null; exit 1; fi

agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser console --clear >/dev/null 2>&1
agent-browser errors --clear >/dev/null 2>&1
# sembrar: llave del cine (lección v330) + pestaña ESTRATEGIA
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const k = 'vg-cine-entrada-v178-' + new Date().toLocaleDateString('en-CA'); sessionStorage.setItem(k, '1'); localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['estrategia'])); localStorage.setItem('vg-cromo-activa-v106', 'estrategia'); return 'cine fuera · escuela sembrada'; })()" >/dev/null 2>&1
agent-browser open "$BASE/?r=1" >/dev/null 2>&1
sleep 6

echo "── A) LA FRANJA DEL DESAFÍO (novato honesto) ──"
FRANJA=$(agent-browser eval "(() => { const f = document.querySelector('[aria-label=\"Desafío de la semana\"]'); if (!f) return 'SIN FRANJA'; const T = f.textContent; return (T.includes('DESAFÍO DE LA SEMANA') || T.includes('Desafío de la semana') ? 'TITULO✓' : 'TITULO✗') + '|' + (T.includes('la comparación es honesta') ? 'LEY✓' : 'LEY✗') + '|' + (T.includes('estimación de la escuela') ? 'PAR-ESTIMACIÓN✓' : 'PAR✗') + '|' + (T.includes('la mesa te espera') ? 'NOVATO✓' : 'NOVATO?') + '|' + (T.includes('dificultad FIJA') ? 'FIJA✓' : 'FIJA✗'); })()" 2>/dev/null | tr -d '"')
echo "franja: $FRANJA"
TITULO=$(agent-browser eval "(() => { const f = document.querySelector('[aria-label=\"Desafío de la semana\"]'); return f ? (f.textContent.match(/(?:El pasaje de Karvath en 96 horas|Ponte de Bruma|La cosecha de Tarquinia|Apagón en Ostmark|Convoy del Alba|Los puentes de Novy Sad|La ballena de hierro|Órbita Kestrel-7|La ciudad que cierra|El silo de granito)/) || ['?'])[0] : '?'; })()" 2>/dev/null | tr -d '"')
echo "mesa de la semana: $TITULO"
agent-browser screenshot /tmp/render/qa338-franja.png >/dev/null 2>&1

echo "── B) LA MESA DEL DESAFÍO ABRE CON SU CABECERA ──"
agent-browser eval "(() => { const f = document.querySelector('[aria-label=\"Desafío de la semana\"]'); const b = f && [...f.querySelectorAll('button')].find((x) => (x.textContent||'').includes('abrir la mesa del desafío')); if (!b) return 'sin botón'; b.click(); return 'clic dado'; })()" >/dev/null 2>&1
sleep 1.5
CABECERA=$(agent-browser eval "(() => { const d = document.querySelector('[aria-label^=\"Mesa de wargame\"]'); if (!d) return 'SIN MESA'; return d.textContent.includes('la misma mesa para toda la escuela') ? 'CABECERA✓ desafío de la semana' : 'cabecera genérica — el desafío no viaja'; })()" 2>/dev/null | tr -d '"')
echo "mesa: $CABECERA"

echo "── C) LA PARTIDA ENTERA + EL CONTRATO (recordDesafio en la jugada final) ──"
agent-browser eval "(() => { let n = 0; const paso = () => { const d = document.querySelector('[aria-label^=\"Mesa de wargame\"]'); if (!d) return; const j = [...d.querySelectorAll('button')].filter(x => { const t = x.textContent.trim(); return t.startsWith('bajo') || t.startsWith('medio') || t.startsWith('alto'); }); if (j.length) { j[0].click(); n++; setTimeout(paso, 120); } }; paso(); return 'jugando la mesa del desafío entera...'; })()" >/dev/null 2>&1
sleep 4
CONTRATO=$(agent-browser eval "(() => { const d = document.querySelector('[aria-label^=\"Mesa de wargame\"]'); if (!d) return 'la mesa se cerró'; const t = d.textContent; if (!t.includes('botín de la mesa')) return 'partida aún corre (turno ' + ((t.match(/turno (\d+) de/) || [])[1] || '?') + ')'; const obj = +(t.match(/(\d+)\/100/) || [])[1]; const desafioLinea = t.includes('desafío de la semana'); const crudo = localStorage.getItem('vanguard-game-state-v1'); if (!crudo) return 'sin persist'; const st = JSON.parse(crudo).state; const wk = (JSON.stringify(st.desafioMejor) || ''); const ok = st.desafioMejor && typeof st.desafioMejor.wk === 'string' && st.desafioMejor.wk.length > 0 && st.desafioMejor.objetivo === obj; return (desafioLinea ? 'LINEA✓ ' : 'LINEA✗ ') + 'PERSIST: desafioMejor=' + wk + ' · objetivo veredicto ' + obj + (ok ? ' — CONTRATO FIRMAADO' : ' — REVISAR'); })()" 2>/dev/null | tr -d '"')
echo "contrato: $CONTRATO"
agent-browser screenshot /tmp/render/qa338-veredicto.png >/dev/null 2>&1
agent-browser eval "(() => { const b = document.querySelector('[aria-label=\"Cerrar mesa\"]'); if (b) b.click(); return 'mesa cerrada'; })()" >/dev/null 2>&1
sleep 1

echo "── D) EL TABLÓN RECIBE EL CONTRATO ──"
agent-browser eval "(() => { localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['ranking'])); localStorage.setItem('vg-cromo-activa-v106', 'ranking'); return 'ranking sembrado'; })()" >/dev/null 2>&1
agent-browser open "$BASE/?r=2" >/dev/null 2>&1
sleep 6
TABLON=$(agent-browser eval "(() => { const T = document.body.innerText.toUpperCase(); return (T.includes('DESAFÍO DE LA ESCUELA') ? 'TARJETA✓' : 'TARJETA✗') + '|' + (T.includes('CIERRA EN') ? 'SEMANA✓' : 'SEMANA✗') + '|' + (T.includes('TU MEJOR MESA') ? 'RÉCORD✓' : 'RÉCORD✗') + '|' + (T.includes('LA COMPARACIÓN ES HONESTA') ? 'LEY✓' : 'LEY✗'); })()" 2>/dev/null | tr -d '"')
echo "tablón: $TABLON"
agent-browser screenshot /tmp/render/qa338-tablon.png >/dev/null 2>&1

echo "── E) SIN BUCLES NI DESHIDRATACIONES ──"
agent-browser console 2>&1 | rg -i "maximum update|too many|hydration|hydrat" | head -3; echo "(vacío = consola limpia — el contrato no perturbó nada)"

agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 390 — REGRESIÓN' : 'sin desborde en 390'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa338-movil.png >/dev/null 2>&1
agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 1440 — REGRESIÓN' : 'sin desborde en 1440'; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -4; echo "(vacío = sin errores de página)"

echo "── CIERRE (el centinela pgrep — ley v332) ──"
agent-browser close >/dev/null 2>&1
pkill -9 -f "standalone/server.js" 2>/dev/null; sleep 1
pgrep -f "standalone/server.js" >/dev/null && echo "ZOMBI (pgrep)" || echo "pgrep limpio — cero zombis"
git checkout HEAD -- db/custom.db 2>/dev/null
echo "canon repo restaurado"
echo "QA VISUAL v338 FIN"
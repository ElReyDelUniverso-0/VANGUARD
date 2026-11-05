#!/bin/bash
# QA VISUAL v352 — EL CORO DE LOS FANTASMAS (LA MESA VIVA etapa 9: el salón
# del fantasma — el archivo COMPLETO revive como coro de rivales elegibles).
# El guion que importa: sembrar 3 semanas cerradas en la tienda, ver el salón
# ordenado por el honor (78 la cabeza, esMejor marcado), ELEGIR un rival de
# hoy (el chip del desafío canta su número fijo), verlo VENCIDO por la mesa
# vigente, volver al mejor y no dejar rastro. Cero errores en consola.
# Ley v302: arranque + verificación + cierre en UNA llamada.
set -u
PORT=3548
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa352.log 2>&1 &
ARRIBA=0
for i in $(seq 1 25); do sleep 1; if curl -s -o /dev/null "$BASE/api/health"; then ARRIBA=1; break; fi; done
echo "boot=$ARRIBA"
echo "SALUD: $(curl -s "$BASE/api/health" | head -c 150)"
if [ "$ARRIBA" != "1" ]; then echo "SIN SERVIDOR — ABORTO"; pkill -9 -f "standalone/server.js" 2>/dev/null; exit 1; fi

agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser console --clear >/dev/null 2>&1
agent-browser errors --clear >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 5
# limpiar el perfil: el arnés puede reejecutarse en el MISMO origen — el
# sembrado de la pasada anterior contaminaría el salón dormido de la B)
agent-browser eval "(() => { localStorage.clear(); sessionStorage.clear(); return 'perfil-limpio'; })()" >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 6

echo "── A) EL HOME FIRMA LA RONDA ──"
FIRMA=$(agent-browser eval "(() => { const T = document.body.innerText; return (T.includes('v352.0') ? 'VERSIÓN✓' : 'VERSIÓN✗') + '|' + (T.includes('EL CORO DE LOS FANTASMAS') ? 'CODENAME✓' : 'CODENAME✗') + '|' + (T.length > 500 ? 'CASA✓' : 'CASA✗'); })()" 2>/dev/null | tr -d '"')
echo "firma: $FIRMA"
agent-browser screenshot /tmp/render/qa352-home.png >/dev/null 2>&1

echo "── B) LA ESCUELA (estrategia): el desafío, el tablón y el salón DORMIDO ──"
agent-browser eval "(() => { localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['estrategia'])); localStorage.setItem('vg-cromo-activa-v106', 'estrategia'); return 'ok'; })()" >/dev/null 2>&1
agent-browser open "$BASE/?r=1" >/dev/null 2>&1
sleep 6
DORMIDO=$(agent-browser eval "(() => { const T = document.body.innerText.toUpperCase(); return (T.includes('DESAFÍO DE LA SEMANA') ? 'DESAFIO✓' : 'DESAFIO✗') + '|' + (T.includes('TABLÓN DE LA MESA') ? 'TABLON✓' : 'TABLON✗') + '|' + (T.includes('SALÓN DEL FANTASMA') ? 'SALON✓' : 'SALON✗') + '|' + (T.includes('EL SALÓN DUERME') ? 'DORMIDO✓' : 'DORMIDO✗') + '|' + (T.includes('DESPUERTA') ? 'FALSA-ALARA✗' : 'SIN-FANTASMAS✓'); })()" 2>/dev/null | tr -d '"')
echo "salón-dormido: $DORMIDO"
SEMANA=$(agent-browser eval "(() => { const m = document.body.innerText.match(/[0-9]{4}-W[0-9]{2}/); return m ? m[0] : 'sin-semana'; })()" 2>/dev/null | tr -d '"')
echo "semanaMesa: $SEMANA"
agent-browser screenshot /tmp/render/qa352-salon-dormido.png >/dev/null 2>&1

echo "── C) SEMBRAR 3 SEMANAS CERRADAS + LA MESA VIGENTE (80) y DESPERTAR EL CORO ──"
agent-browser eval "(() => {
  const k = 'vanguard-game-state-v1';
  let raw; try { raw = JSON.parse(localStorage.getItem(k) || ''); } catch { raw = null; }
  if (!raw || typeof raw !== 'object') raw = { state: {}, version: 1 };
  raw.state = raw.state || {};
  raw.state.desafioHistorial = [
    { wk: '2026-W44', objetivo: 62, fecha: 1 },
    { wk: '2026-W43', objetivo: 78, fecha: 2 },
    { wk: '2026-W42', objetivo: 71, fecha: 3 },
  ];
  raw.state.desafioMejor = { wk: '$SEMANA', objetivo: 80, fecha: 4 };
  localStorage.setItem(k, JSON.stringify(raw));
  return 'sembrado';
})()" >/dev/null 2>&1
agent-browser open "$BASE/?r=2" >/dev/null 2>&1
sleep 6
CORO=$(agent-browser eval "(() => { const T = document.body.innerText; const n3 = T.includes('3 fantasmas'); const cabeza = T.includes('78/100'); const mejor = T.includes('TU FANTASMA'); const cabezaEsMejor = T.indexOf('TU FANTASMA') >= 0 && T.indexOf('78/100') < T.indexOf('TU FANTASMA') + 60; const chipVigente = T.includes('tu mejor mesa: 80/100'); return (T.includes('SALÓN DEL FANTASMA') ? 'SALON✓' : 'SALON✗') + '|' + (n3 ? 'CORO-3✓' : 'CORO-3✗') + '|' + (cabeza ? 'HONOR-78✓' : 'HONOR-78✗') + '|' + (mejor ? 'ES-MEJOR✓' : 'ES-MEJOR✗') + '|' + (chipVigente ? 'MESA-80✓' : 'MESA-80✗'); })()" 2>/dev/null | tr -d '"')
echo "coro: $CORO"
agent-browser screenshot /tmp/render/qa352-salon-vivo.png >/dev/null 2>&1

echo "── D) ELEGIR UN RIVAL DE HOY (el chip canta su número fijo) ──"
ELECCION=$(agent-browser eval "(() => {
  const btns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('tu fantasma') || b.textContent.includes('TU FANTASMA'));
  if (btns.length < 3) return 'sin-coro:' + btns.length;
  const debil = btns.find(b => b.textContent.includes('62/100'));
  if (!debil) return 'sin-debil';
  debil.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  return 'elegido';
})()" 2>/dev/null | tr -d '"')
echo "elección: $ELECCION"
sleep 2
RIVAL=$(agent-browser eval "(() => { const T = document.body.innerText; const vencido = T.includes('RIVAL VENCIDO — superaste su 62/100'); const chip = vencido || T.includes('tu rival de hoy: 62/100'); const volver = T.includes('volver al mejor'); const elegidoTag = T.includes('rival de hoy: semana 2026-W44'); return (chip ? 'CHIP-62✓' : 'CHIP-62✗') + '|' + (vencido ? 'RIVAL-VENCIDO✓' : 'RIVAL-VENCIDO✗') + '|' + (volver ? 'VOLVER✓' : 'VOLVER✗') + '|' + (elegidoTag ? 'TAG-W44✓' : 'TAG-W44✗'); })()" 2>/dev/null | tr -d '"')
echo "rival-de-hoy: $RIVAL"
agent-browser screenshot /tmp/render/qa352-rival.png >/dev/null 2>&1

echo "── E) VOLVER AL MEJOR (la casa no se reescribe) ──"
VUELTA=$(agent-browser eval "(() => { const b = Array.from(document.querySelectorAll('button')).find(x => x.textContent.includes('volver al mejor')); if (!b) return 'sin-boton'; b.dispatchEvent(new MouseEvent('click', { bubbles: true })); return 'vuelta'; })()" 2>/dev/null | tr -d '"')
sleep 2
MEJOR=$(agent-browser eval "(() => { const T = document.body.innerText; return (T.includes('superaste tu 78/100') ? 'FANTASMA-78✓' : 'FANTASMA-78✗') + '|' + (T.includes('rival de hoy: semana 2026-W44') ? 'RIVAL-PERSISTE✗' : 'SIN-RIVAL✓') + '|' + (T.includes('FANTASMA VENCIDO') ? 'VENCIDO-78✓' : 'VENCIDO-78✗'); })()" 2>/dev/null | tr -d '"')
echo "vuelta ($VUELTA): $MEJOR"

echo "── F) HIGIENE: consola, errores, desbordes ──"
DESBORDE=$(agent-browser eval "(() => { const d = document.documentElement; return d.scrollWidth <= window.innerWidth + 2 ? 'SIN-DESBORDE✓' : 'DESBORDE✗ ' + d.scrollWidth; })()" 2>/dev/null | tr -d '"')
echo "desborde: $DESBORDE"
CONSOLA=$(agent-browser console 2>/dev/null | rg -i "error" | rg -v "401|429|favicon" | head -3)
ERRORES=$(agent-browser errors 2>/dev/null | head -3)
echo "consola: ${CONSOLA:-limpia}"
echo "errores: ${ERRORES:-ninguno}"

pkill -9 -f "standalone/server.js" 2>/dev/null
sleep 1
ZOMBIS=$(pgrep -f "standalone/server.js" | head -2)
echo "zombis: ${ZOMBIS:-cero}"
echo "QA-V352 FIN"

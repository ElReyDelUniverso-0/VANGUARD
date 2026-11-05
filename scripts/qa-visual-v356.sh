#!/bin/bash
# QA VISUAL v356 — EL RIVAL ANUNCIADO (LA MESA VIVA etapa 11: la fila 3D
# dormida canta al rival de hoy — el emisor v173 duerme pero el CONTRATO
# respira; y el 2D entero sigue vivo: salón, elección, VENCIDO, volver).
# El guion que importa: sembrar el coro, ELEGIR un rival, ver el chip del
# duelo, RELOAD y verlo vivo (la etapa 10 intacta), volver al mejor y no
# dejar rastro. La fila 3D se aserta en la suite (código); el 2D se ve aquí.
# Ley v302: arranque + verificación + cierre en UNA llamada.
set -u
PORT=3563
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa356.log 2>&1 &
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
agent-browser eval "(() => { localStorage.clear(); sessionStorage.clear(); return 'perfil-limpio'; })()" >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 6

echo "── A) EL HOME FIRMA LA RONDA ──"
FIRMA=$(agent-browser eval "(() => { const T = document.body.innerText; return (T.includes('v356.0') ? 'VERSION✓' : 'VERSION✗') + '|' + (T.includes('EL RIVAL ANUNCIADO') ? 'CODENAME✓' : 'CODENAME✗') + '|' + (T.length > 500 ? 'CASA✓' : 'CASA✗'); })()" 2>/dev/null | tr -d '"')
echo "firma: $FIRMA"
agent-browser screenshot /tmp/render/qa356-home.png >/dev/null 2>&1

echo "── B) LA ESCUELA: el salón DORMIDO y el coro DESPIERTA ──"
agent-browser eval "(() => { localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['estrategia'])); localStorage.setItem('vg-cromo-activa-v106', 'estrategia'); return 'ok'; })()" >/dev/null 2>&1
agent-browser open "$BASE/?r=1" >/dev/null 2>&1
sleep 6
DORMIDO=$(agent-browser eval "(() => { const T = document.body.innerText.toUpperCase(); return (T.includes('SALÓN DEL FANTASMA') ? 'SALON✓' : 'SALON✗') + '|' + (T.includes('SIN SEMANAS CERRADAS') ? 'DORMIDO✓' : 'DORMIDO✗'); })()" 2>/dev/null | tr -d '"')
echo "salón-dormido: $DORMIDO"
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
  raw.state.desafioMejor = { wk: '2026-W45', objetivo: 80, fecha: 4 };
  localStorage.setItem(k, JSON.stringify(raw));
  return 'sembrado';
})()" >/dev/null 2>&1
agent-browser open "$BASE/?r=2" >/dev/null 2>&1
sleep 6
CORO=$(agent-browser eval "(() => { const T = document.body.innerText; return (T.includes('3 fantasmas') ? 'CORO-3✓' : 'CORO-3✗') + '|' + (T.includes('TU FANTASMA') ? 'ES-MEJOR✓' : 'ES-MEJOR✗') + '|' + (T.includes('tu mejor mesa: 80/100') ? 'MESA-80✓' : 'MESA-80✗'); })()" 2>/dev/null | tr -d '"')
echo "coro: $CORO"

echo "── C) ELEGIR RIVAL (chip del duelo) ──"
ELECCION=$(agent-browser eval "(() => {
  const btns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('tu fantasma') || b.textContent.includes('TU FANTASMA'));
  const debil = btns.find(b => b.textContent.includes('62/100'));
  if (!debil) return 'sin-debil';
  debil.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  return 'elegido';
})()" 2>/dev/null | tr -d '"')
sleep 3
RIVAL=$(agent-browser eval "(() => { const T = document.body.innerText; const raw = localStorage.getItem('vanguard-game-state-v1') || ''; return ((T.includes('tu rival de hoy: 62/100 · semana 2026-W44') || T.includes('RIVAL VENCIDO — superaste su 62/100')) ? 'CHIP-62✓' : 'CHIP-62✗') + '|' + (raw.includes('\"rivalSalon\":\"2026-W44\"') ? 'TIENDA✓' : 'TIENDA✗'); })()" 2>/dev/null | tr -d '"')
echo "rival ($ELECCION): $RIVAL"
agent-browser screenshot /tmp/render/qa356-rival.png >/dev/null 2>&1

echo "── D) RELOAD: la elección PERMANECE (etapa 10 intacta bajo la etapa 11) ──"
agent-browser open "$BASE/?r=3" >/dev/null 2>&1
sleep 7
PERSISTE=$(agent-browser eval "(() => { const T = document.body.innerText; return ((T.includes('tu rival de hoy: 62/100 · semana 2026-W44') || T.includes('RIVAL VENCIDO — superaste su 62/100')) ? 'CHIP-VIVO✓' : 'CHIP-VIVO✗') + '|' + (T.includes('volver al mejor') ? 'VOLVER✓' : 'VOLVER✗'); })()" 2>/dev/null | tr -d '"')
echo "persistencia: $PERSISTE"
agent-browser screenshot /tmp/render/qa356-persiste.png >/dev/null 2>&1

echo "── E) VOLVER AL MEJOR + RELOAD: el fantasma regresa y la tienda limpia ──"
agent-browser eval "(() => { const b = Array.from(document.querySelectorAll('button')).find(x => x.textContent.includes('volver al mejor')); if (b) b.dispatchEvent(new MouseEvent('click', { bubbles: true })); return b ? 'vuelta' : 'sin-boton'; })()" >/dev/null 2>&1
sleep 3
agent-browser open "$BASE/?r=4" >/dev/null 2>&1
sleep 7
MEJOR=$(agent-browser eval "(() => { const T = document.body.innerText; const raw = localStorage.getItem('vanguard-game-state-v1') || ''; return ((T.includes('tu fantasma te espera: 78/100') || T.includes('FANTASMA VENCIDO — superaste tu 78/100')) ? 'FANTASMA-78✓' : 'FANTASMA-78✗') + '|' + (!raw.includes('\"rivalSalon\":\"2026-W44\"') ? 'TIENDA-LIMPIA✓' : 'TIENDA-LIMPIA✗'); })()" 2>/dev/null | tr -d '"')
echo "vuelta: $MEJOR"

echo "── F) MÓVIL 390 ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser open "$BASE/?r=5" >/dev/null 2>&1
sleep 6
MOVIL=$(agent-browser eval "(() => { const d = document.documentElement; return (d.scrollWidth <= window.innerWidth + 2 ? 'SIN-DESBORDE✓' : 'DESBORDE✗ ' + d.scrollWidth) + '|' + (document.body.innerText.length > 300 ? 'CASA✓' : 'CASA✗'); })()" 2>/dev/null | tr -d '"')
echo "móvil: $MOVIL"

echo "── G) HIGIENE: consola, errores, zombis, canon ──"
CONSOLA=$(agent-browser console 2>/dev/null | rg -i "error" | rg -v "401|429|favicon|3003|websocket|socket" | head -3)
ERRORES=$(agent-browser errors 2>/dev/null | head -3)
echo "consola: ${CONSOLA:-limpia}"
echo "errores: ${ERRORES:-ninguno}"

pkill -9 -f "standalone/server.js" 2>/dev/null
sleep 1
ZOMBIS=$(pgrep -f "standalone/server.js" | head -2)
echo "zombis: ${ZOMBIS:-cero}"
echo "QA-V356 FIN"

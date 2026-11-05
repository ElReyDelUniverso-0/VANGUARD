#!/bin/bash
# QA VISUAL v354 — EL SALÓN QUE PERMANECE (LA MESA VIVA etapa 10: la
# elección del rival de hoy deja el useState y vive en la TIENDA — persist
# auto, el refresco NO la borra).
# El guion que importa: sembrar 3 semanas cerradas, ELEGIR un rival del
# salón, RELOAD y verlo VIVO (persistencia — el corazón de la etapa),
# volver al mejor, RELOAD y ver al fantasma de la etapa 8 de vuelta. La
# degradación honesta y el chip no mienten. Cero errores en consola.
# Ley v302: arranque + verificación + cierre en UNA llamada.
set -u
PORT=3554
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa354.log 2>&1 &
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
FIRMA=$(agent-browser eval "(() => { const T = document.body.innerText; return (T.includes('v354.0') ? 'VERSIÓN✓' : 'VERSIÓN✗') + '|' + (T.includes('EL SALÓN QUE PERMANECE') ? 'CODENAME✓' : 'CODENAME✗') + '|' + (T.length > 500 ? 'CASA✓' : 'CASA✗'); })()" 2>/dev/null | tr -d '"')
echo "firma: $FIRMA"
agent-browser screenshot /tmp/render/qa354-home.png >/dev/null 2>&1

echo "── B) LA ESCUELA: el salón DORMIDO (sin semanas cerradas) ──"
agent-browser eval "(() => { localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['estrategia'])); localStorage.setItem('vg-cromo-activa-v106', 'estrategia'); return 'ok'; })()" >/dev/null 2>&1
agent-browser open "$BASE/?r=1" >/dev/null 2>&1
sleep 6
DORMIDO=$(agent-browser eval "(() => { const T = document.body.innerText.toUpperCase(); return (T.includes('DESAFÍO DE LA SEMANA') ? 'DESAFIO✓' : 'DESAFIO✗') + '|' + (T.includes('SALÓN DEL FANTASMA') ? 'SALON✓' : 'SALON✗') + '|' + (T.includes('SIN SEMANAS CERRADAS') ? 'DORMIDO✓' : 'DORMIDO✗'); })()" 2>/dev/null | tr -d '"')
echo "salón-dormido: $DORMIDO"

echo "── C) SEMBRAR 3 SEMANAS + MESA VIGENTE (80) → EL CORO DESPIERTA ──"
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
CORO=$(agent-browser eval "(() => { const T = document.body.innerText; return (T.includes('SALÓN DEL FANTASMA') ? 'SALON✓' : 'SALON✗') + '|' + (T.includes('3 fantasmas') ? 'CORO-3✓' : 'CORO-3✗') + '|' + (T.includes('TU FANTASMA') ? 'ES-MEJOR✓' : 'ES-MEJOR✗') + '|' + (T.includes('tu mejor mesa: 80/100') ? 'MESA-80✓' : 'MESA-80✗'); })()" 2>/dev/null | tr -d '"')
echo "coro: $CORO"

echo "── D) ELEGIR UN RIVAL DEL SALÓN (el chip canta su número fijo) ──"
ELECCION=$(agent-browser eval "(() => {
  const btns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('tu fantasma') || b.textContent.includes('TU FANTASMA'));
  if (btns.length < 3) return 'sin-coro:' + btns.length;
  const debil = btns.find(b => b.textContent.includes('62/100'));
  if (!debil) return 'sin-debil';
  debil.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  return 'elegido';
})()" 2>/dev/null | tr -d '"')
sleep 3
RIVAL=$(agent-browser eval "(() => { const T = document.body.innerText; const raw = localStorage.getItem('vanguard-game-state-v1') || ''; const enTienda = raw.includes('\"rivalSalon\":\"2026-W44\"'); const chip = T.includes('tu rival de hoy: 62/100 · semana 2026-W44') || T.includes('RIVAL VENCIDO — superaste su 62/100'); return (chip ? 'CHIP-62✓' : 'CHIP-62✗') + '|' + (enTienda ? 'TIENDA✓' : 'TIENDA✗'); })()" 2>/dev/null | tr -d '"')
echo "rival-elegido ($ELECCION): $RIVAL"
agent-browser screenshot /tmp/render/qa354-rival.png >/dev/null 2>&1

echo "── E) EL RELOAD: LA ELECCIÓN PERMANECE (el corazón de la etapa 10) ──"
agent-browser open "$BASE/?r=3" >/dev/null 2>&1
sleep 7
PERSISTE=$(agent-browser eval "(() => { const T = document.body.innerText; const chip = T.includes('tu rival de hoy: 62/100 · semana 2026-W44') || T.includes('RIVAL VENCIDO — superaste su 62/100'); const volver = T.includes('volver al mejor'); return (chip ? 'CHIP-VIVO✓' : 'CHIP-VIVO✗') + '|' + (volver ? 'VOLVER✓' : 'VOLVER✗'); })()" 2>/dev/null | tr -d '"')
echo "elección-tras-refresco: $PERSISTE"
agent-browser screenshot /tmp/render/qa354-persiste.png >/dev/null 2>&1

echo "── F) VOLVER AL MEJOR + RELOAD: el fantasma de la etapa 8 regresa ──"
VUELTA=$(agent-browser eval "(() => { const b = Array.from(document.querySelectorAll('button')).find(x => x.textContent.includes('volver al mejor')); if (!b) return 'sin-boton'; b.dispatchEvent(new MouseEvent('click', { bubbles: true })); return 'vuelta'; })()" 2>/dev/null | tr -d '"')
sleep 3
agent-browser open "$BASE/?r=4" >/dev/null 2>&1
sleep 7
MEJOR=$(agent-browser eval "(() => { const T = document.body.innerText; const raw = localStorage.getItem('vanguard-game-state-v1') || ''; const tiendaNull = !raw.includes('\"rivalSalon\":\"2026-W44\"'); return (T.includes('tu fantasma te espera: 78/100') || T.includes('FANTASMA VENCIDO — superaste tu 78/100') ? 'FANTASMA-78✓' : 'FANTASMA-78✗') + '|' + (T.includes('rival de hoy: semana 2026-W44') ? 'RIVAL-PERSISTE✗' : 'SIN-RIVAL✓') + '|' + (tiendaNull ? 'TIENDA-LIMPIA✓' : 'TIENDA-LIMPIA✗'); })()" 2>/dev/null | tr -d '"')
echo "vuelta ($VUELTA): $MEJOR"

echo "── G) MÓVIL 390: el salón y el chip sin desbordes ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser open "$BASE/?r=5" >/dev/null 2>&1
sleep 6
MOVIL=$(agent-browser eval "(() => { const d = document.documentElement; const T = document.body.innerText; return (d.scrollWidth <= window.innerWidth + 2 ? 'SIN-DESBORDE✓' : 'DESBORDE✗ ' + d.scrollWidth) + '|' + (T.includes('SALÓN DEL FANTASMA') ? 'SALON-MÓVIL✓' : 'SALON-MÓVIL✗'); })()" 2>/dev/null | tr -d '"')
echo "móvil: $MOVIL"

echo "── H) HIGIENE: consola, errores, zombis, canon ──"
CONSOLA=$(agent-browser console 2>/dev/null | rg -i "error" | rg -v "401|429|favicon" | head -3)
ERRORES=$(agent-browser errors 2>/dev/null | head -3)
echo "consola: ${CONSOLA:-limpia}"
echo "errores: ${ERRORES:-ninguno}"

pkill -9 -f "standalone/server.js" 2>/dev/null
sleep 1
ZOMBIS=$(pgrep -f "standalone/server.js" | head -2)
echo "zombis: ${ZOMBIS:-cero}"
echo "QA-V354 FIN"

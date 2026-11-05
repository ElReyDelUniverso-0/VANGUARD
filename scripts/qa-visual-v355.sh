#!/bin/bash
# QA VISUAL v355 — LA SALA QUE ESCUCHA (cirugía: los 5 deps exhaustive-deps
# de multiplayer-panel curados — identidad estable ×6: emit, claim, deploy,
# attack, requestRematch, answer; los oyentes del 3D GUERRA/DUELO dejan de
# re-montar en cada render).
# El guion que importa: la sala MULTI responde — el tab activa, el panel
# respira (subtitle GUERRA+DUELO), el modo DUELO monta su mesa (Buscar
# rival + botín), el móvil no se desborda y la consola calla.
# Ley v302: arranque + verificación + cierre en UNA llamada.
set -u
PORT=3559
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa355.log 2>&1 &
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
FIRMA=$(agent-browser eval "(() => { const T = document.body.innerText; return (T.includes('v355.0') ? 'VERSION✓' : 'VERSION✗') + '|' + (T.includes('LA SALA QUE ESCUCHA') ? 'CODENAME✓' : 'CODENAME✗') + '|' + (T.length > 500 ? 'CASA✓' : 'CASA✗'); })()" 2>/dev/null | tr -d '"')
echo "firma: $FIRMA"
agent-browser screenshot /tmp/render/qa355-home.png >/dev/null 2>&1

echo "── B) LA SALA MULTI: el tab activa y el panel respira ──"
agent-browser eval "(() => { localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['multijugador'])); localStorage.setItem('vg-cromo-activa-v106', 'multijugador'); return 'ok'; })()" >/dev/null 2>&1
agent-browser open "$BASE/?r=1" >/dev/null 2>&1
sleep 7
agent-browser eval "(() => {
  const el = Array.from(document.querySelectorAll('span, div')).find(e => e.children.length === 0 && /^multi(player)?$/i.test(e.textContent.trim()));
  const tgt = (el && el.closest('button')) || el;
  if (tgt) tgt.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  return tgt ? 'clicado' : 'sin-elemento';
})()" >/dev/null 2>&1
sleep 4
SALA=$(agent-browser eval "(() => { const T = document.body.innerText; return (T.includes('MUNDO DE GUERRA GLOBAL + DUELOS 1V1') ? 'SUBTITULO✓' : 'SUBTITULO✗') + '|' + (T.includes('DESAFÍO') ? 'MODOS✓' : 'MODOS✗') + '|' + (T.includes('CONTRA OPERADORES REALES') ? 'PIE✓' : 'PIE✗'); })()" 2>/dev/null | tr -d '"')
echo "sala-multi: $SALA"
agent-browser screenshot /tmp/render/qa355-multi.png >/dev/null 2>&1

echo "── C) EL DUELO RESPONDE (modo hijo monta: Buscar rival + botín) ──"
DUELO=$(agent-browser eval "(() => {
  const b = Array.from(document.querySelectorAll('button, span')).find(x => { const s = x.textContent.trim().toUpperCase(); return s === 'DUELO' || s === 'DUEL'; });
  const tgt = b && (b.closest('button') || b);
  if (!tgt) return 'sin-tab-duelo';
  tgt.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  return 'clicado';
})()" 2>/dev/null | tr -d '"')
sleep 3
DUELO2=$(agent-browser eval "(() => { const T = document.body.innerText; return (T.includes('BUSCAR RIVAL') ? 'BUSCAR✓' : 'BUSCAR✗') + '|' + (T.includes('VICTORIA') && T.includes('EMPATE') && T.includes('DERROTA') ? 'BOTIN✓' : 'BOTIN✗'); })()" 2>/dev/null | tr -d '"')
echo "duelo ($DUELO): $DUELO2"
agent-browser screenshot /tmp/render/qa355-duelo.png >/dev/null 2>&1

echo "── D) MÓVIL 390: la casa sin desbordes ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser open "$BASE/?r=2" >/dev/null 2>&1
sleep 6
MOVIL=$(agent-browser eval "(() => { const d = document.documentElement; return (d.scrollWidth <= window.innerWidth + 2 ? 'SIN-DESBORDE✓' : 'DESBORDE✗ ' + d.scrollWidth) + '|' + (document.body.innerText.length > 300 ? 'CASA✓' : 'CASA✗'); })()" 2>/dev/null | tr -d '"')
echo "móvil: $MOVIL"
agent-browser screenshot /tmp/render/qa355-movil.png >/dev/null 2>&1

echo "── E) HIGIENE: consola, errores, zombis, canon ──"
CONSOLA=$(agent-browser console 2>/dev/null | rg -i "error" | rg -v "401|429|favicon|3003|websocket|socket" | head -3)
ERRORES=$(agent-browser errors 2>/dev/null | head -3)
echo "consola: ${CONSOLA:-limpia}"
echo "errores: ${ERRORES:-ninguno}"

pkill -9 -f "standalone/server.js" 2>/dev/null
sleep 1
ZOMBIS=$(pgrep -f "standalone/server.js" | head -2)
echo "zombis: ${ZOMBIS:-cero}"
echo "QA-V355 FIN"

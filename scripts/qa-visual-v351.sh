#!/bin/bash
# QA VISUAL v351 — LA FIEBRE QUE DESPIERTA (cirugía: los 9 deps exhaustive-deps
# del arcade curados + el boost de spawn de la FIEBRE despierto, dormía desde v26).
# La prueba que importa: el ARCADE VIVO — una partida de MEMORIA jugada completa
# por un bot en el DOM (startGame → tablero → parejas → el efecto de fin de
# partida con deps honestos paga UNA vez y cierra), RADAR FURIA encendido y
# salido (startRadar + tick con el ref fresco), cero errores en consola.
# Ley v302: arranque + verificación + cierre en UNA llamada.
set -u
PORT=3546
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa351.log 2>&1 &
ARRIBA=0
for i in $(seq 1 25); do sleep 1; if curl -s -o /dev/null "$BASE/api/health"; then ARRIBA=1; break; fi; done
echo "boot=$ARRIBA"
echo "SALUD: $(curl -s "$BASE/api/health" | head -c 150)"
if [ "$ARRIBA" != "1" ]; then echo "SIN SERVIDOR — ABORTO"; pkill -9 -f "standalone/server.js" 2>/dev/null; exit 1; fi

agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser console --clear >/dev/null 2>&1
agent-browser errors --clear >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 6

echo "── A) EL HOME FIRMA LA RONDA ──"
FIRMA=$(agent-browser eval "(() => { const T = document.body.innerText; return (T.includes('v351.0') ? 'VERSIÓN✓' : 'VERSIÓN✗') + '|' + (T.includes('LA FIEBRE QUE DESPIERTA') ? 'CODENAME✓' : 'CODENAME✗') + '|' + (T.length > 500 ? 'CASA✓' : 'CASA✗'); })()" 2>/dev/null | tr -d '"')
echo "firma: $FIRMA"
agent-browser screenshot /tmp/render/qa351-home.png >/dev/null 2>&1

echo "── B) EL ARCADE VIVO: la sala del cartucho ──"
agent-browser eval "(() => { localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['arcade'])); localStorage.setItem('vg-cromo-activa-v106', 'arcade'); return 'ok'; })()" >/dev/null 2>&1
agent-browser open "$BASE/?r=1" >/dev/null 2>&1
sleep 6
SALA=$(agent-browser eval "(() => { const T = document.body.innerText.toUpperCase(); const cartuchos = Array.from(document.querySelectorAll('button')).filter(b => /MEMORIA DE BANDERAS|RADAR FURIA|DUELO RELAMPAGO|ANTIMISIL/.test(b.textContent)).length; return (T.includes('ARCADE PACK') ? 'PANEL✓' : 'PANEL✗') + '|' + (cartuchos >= 4 ? 'CARTUCHOS✓(' + cartuchos + ')' : 'CARTUCHOS✗') + '|' + (T.includes('JUEGO DEL DÍA') ? 'DEL-DÍA✓' : 'DEL-DÍA✗'); })()" 2>/dev/null | tr -d '"')
echo "sala: $SALA"

echo "── C) RADAR FURIA encendido y salido (startRadar + tick con el ref fresco) ──"
agent-browser eval "(() => { const b = Array.from(document.querySelectorAll('button')).find(x => x.textContent.includes('RADAR FURIA')); if (!b) return 'sin-carta'; b.dispatchEvent(new MouseEvent('click', { bubbles: true })); return 'radar-click'; })()" >/dev/null 2>&1
sleep 3
RADAR=$(agent-browser eval "(() => { const T = document.body.innerText.toUpperCase(); const dentro = T.includes('RADAR FURIA · PUNTOS'); const salir = Array.from(document.querySelectorAll('button')).find(x => x.textContent.includes('SALIR')); if (salir) salir.dispatchEvent(new MouseEvent('click', { bubbles: true })); return (dentro ? 'RADAR-DENTRO✓' : 'RADAR-DENTRO✗') + '|salir-' + (salir ? 'ok' : 'no'); })()" 2>/dev/null | tr -d '"')
echo "radar: $RADAR"
sleep 2

echo "── D) MEMORIA jugada COMPLETA por el bot del DOM (el efecto de fin con deps honestos) ──"
agent-browser eval "(() => { const b = Array.from(document.querySelectorAll('button')).find(x => x.textContent.includes('MEMORIA DE BANDERAS')); if (!b) return 'sin-carta'; b.dispatchEvent(new MouseEvent('click', { bubbles: true })); return 'memoria-click'; })()" >/dev/null 2>&1
sleep 2
ARMADO=$(agent-browser eval "(() => {
  if (window.__vgMemoBot) return 'bot-ya-vivo';
  const cont = () => Array.from(document.querySelectorAll('div')).find(d => { const s = d.querySelector('span'); return s && s.textContent && s.textContent.startsWith('Memoria de banderas'); });
  if (!cont()) return 'sin-tablero';
  window.__vgMemoBot = true; window.__vgMemoFin = null;
  const visto = {};
  const idxVistos = new Set();
  const click = (el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  // un clic por tick (450ms): los dobles clics síncronos pisan el estado del
  // tablero (el segundo setMemCards sale del closure rancio) — la mano del bot
  // imita al jugador real: mira lo volteado, recuerda, elige UNA carta, y
  // EXPLORA cartas nunca vistas antes de repetir (sin exploración gira eterno
  // sobre las dos primeras).
  const iv = setInterval(() => {
    const box = cont();
    if (!box) { clearInterval(iv); window.__vgMemoFin = window.__vgMemoFin || 'tablero-cerro'; return; }
    const grid = box.querySelector('div[class*="grid-cols-4"]');
    const cards = grid ? Array.from(grid.querySelectorAll('button')) : [];
    if (cards.length !== 16) return;
    const estado = cards.map((b, i) => { const t = b.textContent.trim(); return { i, t, done: b.className.includes('bg-green-hud'), flip: t !== '?' }; });
    estado.forEach(c => { if (c.flip && !c.done) { (visto[c.t] = visto[c.t] || new Set()).add(c.i); idxVistos.add(c.i); } });
    const volteadas = estado.filter(c => c.flip && !c.done);
    if (volteadas.length >= 2) return; // resolviéndose: esperar
    const libres = estado.filter(c => !c.done && !c.flip);
    if (libres.length === 0) return; // todas resueltas (el cierre llega solo)
    let objetivo = null;
    if (volteadas.length === 1) {
      const code = volteadas[0].t;
      const gemelo = Array.from(visto[code] || []).find(i => i !== volteadas[0].i && !estado[i].done && !estado[i].flip);
      if (gemelo !== undefined) objetivo = gemelo; // completa la pareja vista
    }
    if (objetivo === null) {
      for (const code of Object.keys(visto)) {
        const idxs = Array.from(visto[code]).filter(i => !estado[i].done && !estado[i].flip);
        if (idxs.length >= 2) { objetivo = idxs[0]; break; } // abre una pareja conocida
      }
    }
    if (objetivo === null) {
      const nueva = libres.find(c => !idxVistos.has(c.i));
      objetivo = nueva ? nueva.i : libres[0].i; // explora lo desconocido primero
    }
    click(cards[objetivo]);
  }, 450);
  setTimeout(() => { clearInterval(iv); window.__vgMemoFin = window.__vgMemoFin || 'timeout'; }, 75000);
  return 'bot-armado';
})()" 2>/dev/null | tr -d '"')
echo "bot: $ARMADO"
for i in $(seq 1 26); do sleep 3; F=$(agent-browser eval "window.__vgMemoFin" 2>/dev/null | tr -d '"'); if [ "$F" != "null" ] && [ -n "$F" ]; then break; fi; done
echo "fin del bot: $F"
MEMORIA=$(agent-browser eval "(() => { const T = document.body.innerText.toUpperCase(); const carta = Array.from(document.querySelectorAll('button')).find(x => x.textContent.includes('MEMORIA DE BANDERAS')); return (window.__vgMemoFin === 'tablero-cerro' ? 'COMPLETA✓' : 'COMPLETA✗(' + window.__vgMemoFin + ')') + '|' + (carta ? 'CARTUCHO-DE-VUELTA✓' : 'CARTUCHO✗') + '|' + ((carta && carta.textContent.includes('NUEVO')) ? 'RECORD-NUEVO✓' : 'RECORD✗'); })()" 2>/dev/null | tr -d '"')
echo "memoria: $MEMORIA"
agent-browser screenshot /tmp/render/qa351-arcade.png >/dev/null 2>&1

echo "── E) SIN BUCLES NI DESHIDRATACIONES ──"
agent-browser console 2>&1 | rg -i "maximum update|too many|hydration|hydrat" | head -3; echo "(vacío = consola limpia — la cirugía no perturbó nada)"
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser open "$BASE/?r=2" >/dev/null 2>&1
sleep 4
agent-browser eval "(() => { localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['arcade'])); localStorage.setItem('vg-cromo-activa-v106', 'arcade'); return 'ok'; })()" >/dev/null 2>&1
agent-browser open "$BASE/?r=3" >/dev/null 2>&1
sleep 5
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 390 — REGRESIÓN' : 'sin desborde en 390'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa351-movil.png >/dev/null 2>&1
agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 1440 — REGRESIÓN' : 'sin desborde en 1440'; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -4; echo "(vacío = sin errores de página)"

echo "── CIERRE (el centinela pgrep — ley v332) ──"
agent-browser close >/dev/null 2>&1
pkill -9 -f "standalone/server.js" 2>/dev/null; sleep 1
pgrep -f "standalone/server.js" >/dev/null && echo "ZOMBI (pgrep)" || echo "pgrep limpio — cero zombis"
git checkout HEAD -- db/custom.db 2>/dev/null
echo "canon repo restaurado"
echo "QA VISUAL v351 FIN"

#!/bin/bash
# QA VISUAL v353 — LA DISTANCIA HONESTA (cirugía: los 9 deps exhaustive-deps
# de tierra-panel curados — identidad estable ×6, grados enteros extraídos,
# roster con el centro VIVO y deps muertos fuera).
# El guion que importa: la TIERRA VIVA — el globo monta, los contactos en
# vivo respiran, una MISIÓN se lanza desde el DOM, el teclado R resetea (el
# oyente de atajos con deps honestos sigue escuchando), cero errores.
# Ley v302: arranque + verificación + cierre en UNA llamada.
set -u
PORT=3552
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa353.log 2>&1 &
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
FIRMA=$(agent-browser eval "(() => { const T = document.body.innerText; return (T.includes('v353.0') ? 'VERSIÓN✓' : 'VERSIÓN✗') + '|' + (T.includes('LA DISTANCIA HONESTA') ? 'CODENAME✓' : 'CODENAME✗') + '|' + (T.length > 500 ? 'CASA✓' : 'CASA✗'); })()" 2>/dev/null | tr -d '"')
echo "firma: $FIRMA"
agent-browser screenshot /tmp/render/qa353-home.png >/dev/null 2>&1

echo "── B) LA TIERRA VIVA: el globo y sus contactos ──"
agent-browser eval "(() => { localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['tierra'])); localStorage.setItem('vg-cromo-activa-v106', 'tierra'); return 'ok'; })()" >/dev/null 2>&1
agent-browser open "$BASE/?r=1" >/dev/null 2>&1
sleep 8
SALA=$(agent-browser eval "(() => { const T = document.body.innerText.toUpperCase(); const stats = (T.match(/CONTACTOS/) ? 'STATS✓' : 'STATS✗'); const misiones = Array.from(document.querySelectorAll('button svg.lucide-sparkles')).length; return (T.includes('VANGUARD EARTH') ? 'PANEL✓' : 'PANEL✗') + '|' + stats + '|' + (misiones >= 4 ? 'MISIONES✓(' + misiones + ')' : 'MISIONES✗') + '|' + (T.includes('EN VIVO') ? 'VIVO✓' : 'VIVO✗'); })()" 2>/dev/null | tr -d '"')
echo "sala: $SALA"
agent-browser screenshot /tmp/render/qa353-tierra.png >/dev/null 2>&1

echo "── C) LANZAR UNA MISIÓN DESDE EL DOM (identidad estable de lanzarMision) ──"
MISION=$(agent-browser eval "(() => { const ic = document.querySelector('button svg.lucide-sparkles'); if (!ic) return 'sin-mision'; const b = ic.closest('button'); if (!b) return 'sin-padre'; b.dispatchEvent(new MouseEvent('click', { bubbles: true })); return (b.textContent || '').slice(0, 30); })()" 2>/dev/null | tr -d '"')
sleep 2
MISION_OK=$(agent-browser eval "(() => { const T = document.body.innerText.toUpperCase(); return (T.includes('MISIÓN ·') || T.includes('MISION ·')) ? 'TOAST-MISION✓' : 'SIN-TOAST'; })()" 2>/dev/null | tr -d '"')
echo "misión: $MISION_OK"

echo "── D) EL TECLADO VIVO: la tecla R resetea (oyente de atajos con deps honestos) ──"
agent-browser eval "(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r', bubbles: true })); return 'r-disparada'; })()" >/dev/null 2>&1
sleep 2
RESET=$(agent-browser eval "(() => { const T = document.body.innerText.toUpperCase(); return (T.includes('PLANETA COMPLETO') ? 'RESET-TOAST✓' : 'RESET-TOAST✗') + '|' + (T.includes('VANGUARD EARTH') ? 'SALA-VIVA✓' : 'SALA-VIVA✗'); })()" 2>/dev/null | tr -d '"')
echo "teclado-r: $RESET"
agent-browser screenshot /tmp/render/qa353-reset.png >/dev/null 2>&1

echo "── E) HIGIENE: consola, errores, desbordes ──"
DESBORDE=$(agent-browser eval "(() => { const d = document.documentElement; return d.scrollWidth <= window.innerWidth + 2 ? 'SIN-DESBORDE✓' : 'DESBORDE✗ ' + d.scrollWidth; })()" 2>/dev/null | tr -d '"')
echo "desborde: $DESBORDE"
CONSOLA=$(agent-browser console 2>/dev/null | rg -i "error" | rg -v "401|429|favicon|WebGL|globe" | head -3)
ERRORES=$(agent-browser errors 2>/dev/null | head -3)
echo "consola: ${CONSOLA:-limpia}"
echo "errores: ${ERRORES:-ninguno}"

echo "── F) MÓVIL 390: la tierra sin desbordes ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
MOVIL=$(agent-browser eval "(() => { const d = document.documentElement; const T = document.body.innerText.toUpperCase(); return (d.scrollWidth <= window.innerWidth + 2 ? 'SIN-DESBORDE✓' : 'DESBORDE✗') + '|' + (T.includes('VANGUARD EARTH') ? 'PANEL✓' : 'PANEL✗'); })()" 2>/dev/null | tr -d '"')
echo "móvil: $MOVIL"
agent-browser screenshot /tmp/render/qa353-movil.png >/dev/null 2>&1

pkill -9 -f "standalone/server.js" 2>/dev/null
sleep 1
ZOMBIS=$(pgrep -f "standalone/server.js" | head -2)
echo "zombis: ${ZOMBIS:-cero}"
echo "QA-V353 FIN"

#!/bin/bash
# QA VISUAL v359 — VANGUARD ID (LA FIRMA VIVA: el carnet del agente con
# KNOWLEDGE LEVEL de pesos publicados, insignias derivadas del estado real,
# privacidad por campo, huella anti-suplantación y bloqueos). El guion que
# importa: el tab identidad VIVE dentro del home (secciones SOCIAL → tab
# VANGUARD ID operadas por bot del DOM), el carnet respira, la metodología
# se abre en details, el localStorage firma la identidad y móvil 390 sin
# desbordes. Canon restaurado por el ritual de la casa (muerte POR PUERTO).
# Ley v302: arranque + verificación + cierre en UNA llamada.
set -u
PORT=3589
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

matar() { local P=$(ss -ltnp 2>/dev/null | grep ":$PORT " | grep -oP 'pid=\K[0-9]+' | head -1); [ -n "$P" ] && kill -9 "$P" 2>/dev/null; return 0; }

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa359.log 2>&1 &
ARRIBA=0
for i in $(seq 1 25); do sleep 1; if curl -s -o /dev/null "$BASE/api/health"; then ARRIBA=1; break; fi; done
echo "boot=$ARRIBA"
echo "SALUD: $(curl -s "$BASE/api/health" | head -c 150)"
if [ "$ARRIBA" != "1" ]; then echo "SIN SERVIDOR — ABORTO"; matar; exit 1; fi

agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser console --clear >/dev/null 2>&1
agent-browser errors --clear >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 5
agent-browser eval "(() => { localStorage.clear(); sessionStorage.clear(); return 'perfil-limpio'; })()" >/dev/null 2>&1

echo "── A) EL HOME FIRMA LA RONDA ──"
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 6
FIRMA=$(agent-browser eval "(() => { const T = document.body.innerText; return (T.includes('v359.0') ? 'VERSION✓' : 'VERSION✗') + '|' + (T.includes('LA FIRMA VIVA') ? 'CODENAME✓' : 'CODENAME✗') + '|' + (T.length > 500 ? 'CASA✓' : 'CASA✗'); })()" 2>/dev/null | tr -d '"')
echo "firma: $FIRMA"
agent-browser screenshot /tmp/render/qa359-home.png >/dev/null 2>&1

echo "── B) EL TAB VANGUARD ID DESPIERTA (bot del DOM: SOCIAL → VANGUARD ID) ──"
agent-browser eval "(() => { const s = Array.from(document.querySelectorAll('button')).find(x => x.textContent.trim() === 'SOCIAL'); if (s) { s.click(); return 'social'; } return 'no-esta'; })()" >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const b = Array.from(document.querySelectorAll('button')).find(x => x.textContent.trim() === 'VANGUARD ID'); if (b) { b.click(); return 'clickado'; } return 'no-esta'; })()" >/dev/null 2>&1
sleep 4
CARNET=$(agent-browser eval "(() => { const T = document.body.innerText.toUpperCase(); return (T.includes('VANGUARD ID') ? 'ID✓' : 'ID✗') + '|' + (T.includes('CARNET') ? 'CARNET✓' : 'CARNET✗') + '|' + (T.includes('INSIGNIAS') ? 'INSIGNIAS✓' : 'INSIGNIAS✗') + '|' + (/KL \d+/.test(T) ? 'KL✓' : 'KL✗') + '|' + (/[A-Z0-9]{4}-[A-Z0-9]{4}/.test(document.body.innerText) ? 'HUELLA✓' : 'HUELLA✗'); })()" 2>/dev/null | tr -d '"')
echo "carnet: $CARNET"
agent-browser screenshot /tmp/render/qa359-carnet.png >/dev/null 2>&1

echo "── C) LA VISTA NIVEL: dimensiones, pesos y metodología ──"
agent-browser eval "(() => { const b = Array.from(document.querySelectorAll('button')).find(x => x.textContent.trim() === 'NIVEL'); if (b) { b.click(); return 'clickado'; } return 'no-esta'; })()" >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const ds = document.querySelectorAll('details'); if (ds[0]) { ds[0].open = true; return 'abierta'; } return 'no-esta'; })()" >/dev/null 2>&1
sleep 1
NIVEL=$(agent-browser eval "(() => { const T = document.body.innerText.toUpperCase(); return (T.includes('KNOWLEDGE LEVEL') ? 'KL✓' : 'KL✗') + '|' + (T.includes('PESOS PUBLICADOS') ? 'PESOS✓' : 'PESOS✗') + '|' + (T.includes('METODOLOGÍA DEL ÍNDICE') ? 'METODO✓' : 'METODO✗') + '|' + (T.includes('LÍMITES DE ESTE CARNET') ? 'LIMITES✓' : 'LIMITES✗') + '|' + (T.includes('NO ES POPULARIDAD') ? 'NOPOPULAR✓' : 'NOPOPULAR✗'); })()" 2>/dev/null | tr -d '"')
echo "nivel: $NIVEL"
agent-browser screenshot /tmp/render/qa359-nivel.png >/dev/null 2>&1

echo "── D) PRIVACIDAD Y SEGURIDAD: campos, bloqueos, huella ──"
agent-browser eval "(() => { const b = Array.from(document.querySelectorAll('button')).find(x => x.textContent.trim() === 'PRIVACIDAD'); if (b) { b.click(); return 'clickado'; } return 'no-esta'; })()" >/dev/null 2>&1
sleep 2
PRIV=$(agent-browser eval "(() => { const T = document.body.innerText.toUpperCase(); return (T.includes('VISIBILIDAD DEL CARNET') ? 'VISIB✓' : 'VISIB✗') + '|' + (T.includes('CAMPOS PÚBLICOS') ? 'CAMPOS✓' : 'CAMPOS✗') + '|' + (T.includes('COMUNIDAD') ? 'COMUNIDAD✓' : 'COMUNIDAD✗'); })()" 2>/dev/null | tr -d '"')
echo "privacidad: $PRIV"
agent-browser eval "(() => { const b = Array.from(document.querySelectorAll('button')).find(x => x.textContent.trim() === 'SEGURIDAD'); if (b) { b.click(); return 'clickado'; } return 'no-esta'; })()" >/dev/null 2>&1
sleep 2
SEG=$(agent-browser eval "(() => { const T = document.body.innerText.toUpperCase(); return (T.includes('HUELLA DE IDENTIDAD') ? 'HUELLA✓' : 'HUELLA✗') + '|' + (T.includes('AGENTES BLOQUEADOS') ? 'BLOQUEOS✓' : 'BLOQUEOS✗') + '|' + (T.includes('NOTIFICACIONES') ? 'NOTIF✓' : 'NOTIF✗') + '|' + (T.includes('RESERVADOS') ? 'RESERVADOS✓' : 'RESERVADOS✗'); })()" 2>/dev/null | tr -d '"')
echo "seguridad: $SEG"
agent-browser screenshot /tmp/render/qa359-seguridad.png >/dev/null 2>&1

echo "── E) EL LOCALSTORAGE FIRMA LA IDENTIDAD ──"
PERSIST=$(agent-browser eval "(() => { const k = Object.keys(localStorage).find(x => x.startsWith('vanguard-game-state')); if (!k) return 'SIN-TIENDA'; const s = JSON.parse(localStorage.getItem(k)); const st = s.state || s; return (st.idHuella && /[A-Z0-9]{4}-[A-Z0-9]{4}/.test(st.idHuella) ? 'HUELLA✓' : 'HUELLA✗') + '|' + (st.idPrivacidad && st.idPrivacidad.mostrarActividad === false ? 'PRIVACIDAD-MINIMA✓' : 'PRIVACIDAD✗') + '|' + (Array.isArray(st.idBloqueados) ? 'BLOQUEOS✓' : 'BLOQUEOS✗'); })()" 2>/dev/null | tr -d '"')
echo "persist: $PERSIST"

echo "── F) MÓVIL 390 EN EL CARNET ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser eval "(() => { const b = Array.from(document.querySelectorAll('button')).find(x => x.textContent.trim() === 'CARNET'); if (b) { b.click(); return 'clickado'; } return 'no-esta'; })()" >/dev/null 2>&1
sleep 3
MOVIL=$(agent-browser eval "(() => { const d = document.documentElement; return (d.scrollWidth <= window.innerWidth + 2 ? 'SIN-DESBORDE✓' : 'DESBORDE✗ ' + d.scrollWidth) + '|' + (document.body.innerText.toUpperCase().includes('VANGUARD ID') ? 'ID✓' : 'ID✗'); })()" 2>/dev/null | tr -d '"')
echo "móvil: $MOVIL"
agent-browser screenshot /tmp/render/qa359-movil.png >/dev/null 2>&1

echo "── G) HIGIENE: consola, errores, zombis, canon ──"
CONSOLA=$(agent-browser console 2>/dev/null | rg -i "error" | rg -v "401|429|favicon|3003|websocket|socket" | head -3)
ERRORES=$(agent-browser errors 2>/dev/null | head -3)
echo "consola: ${CONSOLA:-limpia}"
echo "errores: ${ERRORES:-ninguno}"

matar
sleep 1
VIVO=$(ss -ltn 2>/dev/null | grep -c ":$PORT ")
echo "zombis-puerto: $VIVO (esperado 0)"
rm -f db/custom.db-wal db/custom.db-shm
git checkout HEAD -- db/custom.db 2>/dev/null
CANON=$(md5sum db/custom.db | cut -d' ' -f1)
echo "canon: $CANON (esperado 38121cfce2148acecbc47cca61c8b062)"
CANON2=$(md5sum db/custom.db | cut -d' ' -f1)
[ "$CANON" = "$CANON2" ] && echo "doble lectura: ESTABLE" || echo "doble lectura: DRIFT!"
echo "QA-V359 FIN"

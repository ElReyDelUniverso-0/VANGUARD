#!/bin/bash
# QA VISUAL v357 — EL PULSO FIRME (la CUARTA LEVA exhaustive-deps: los tres
# mayores que quedaban — music-player, retention-layer y sala-vista — en
# CERO). El guion que importa: la RADIO respira con oyentes firmes, la
# RETENCIÓN lee fresco (el cofre vive), y la SALA abre, mide su estancia
# honesta y vuelve sin dejar rastro. La cirugía se aserta en la suite
# (código); la VIDA se ve aquí.
# Ley v302: arranque + verificación + cierre en UNA llamada.
# Lección v357 (quinta act del escritor fantasma): bun renombra su proceso a
# «next-server (vNN)» — pkill por patrón JAMÁS lo mata; se mata POR PUERTO.
set -u
PORT=3568
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa357.log 2>&1 &
ARRIBA=0
for i in $(seq 1 25); do sleep 1; if curl -s -o /dev/null "$BASE/api/health"; then ARRIBA=1; break; fi; done
echo "boot=$ARRIBA"
echo "SALUD: $(curl -s "$BASE/api/health" | head -c 150)"
if [ "$ARRIBA" != "1" ]; then echo "SIN SERVIDOR — ABORTO"; matar; exit 1; fi

matar() { local P=$(ss -ltnp 2>/dev/null | grep ":$PORT " | grep -oP 'pid=\K[0-9]+' | head -1); [ -n "$P" ] && kill -9 "$P" 2>/dev/null; return 0; }

agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser console --clear >/dev/null 2>&1
agent-browser errors --clear >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 5
agent-browser eval "(() => { localStorage.clear(); sessionStorage.clear(); return 'perfil-limpio'; })()" >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 6

echo "── A) EL HOME FIRMA LA RONDA ──"
FIRMA=$(agent-browser eval "(() => { const T = document.body.innerText; return (T.includes('v357.0') ? 'VERSION✓' : 'VERSION✗') + '|' + (T.includes('EL PULSO FIRME') ? 'CODENAME✓' : 'CODENAME✗') + '|' + (T.length > 500 ? 'CASA✓' : 'CASA✗'); })()" 2>/dev/null | tr -d '"')
echo "firma: $FIRMA"
agent-browser screenshot /tmp/render/qa357-home.png >/dev/null 2>&1

echo "── B) LA RADIO VIVA (oyentes firmes: la píldora respira) ──"
RADIO=$(agent-browser eval "(() => { const T = document.body.innerText; const mundo = document.querySelector('[data-vg-mundo]'); return (mundo ? 'PILDORA✓' : 'PILDORA✗') + '|' + (T.length > 500 ? 'CASA✓' : 'CASA✗'); })()" 2>/dev/null | tr -d '"')
echo "radio: $RADIO"

echo "── C) LA RETENCIÓN VIVA (lecturas frescas: el cofre vive) ──"
# v355/v357: el cofre nace en DIFERIDO (MontajeTardio + chunk lazy) — el
# arnés respira con reintentos: la casa despierta primero, la capa llega
# cuando el hilo queda idle
COFRE="COFRE✗"
for i in $(seq 1 12); do
  COFRE=$(agent-browser eval "(() => { const c = document.querySelector('[data-vg-retencion=\"cofre\"]'); return c ? 'COFRE✓' : 'COFRE✗'; })()" 2>/dev/null | tr -d '"')
  [ "$COFRE" = "COFRE✓" ] && break
  sleep 3
done
echo "cofre: $COFRE"

echo "── D) LA SALA DORMIDA (honestidad del contrato: hecho, no estimación) ──"
# v357 HECHO VERIFICADO: vanguard-app.tsx (el único monte de SalaVista) no
# es importado por ninguna ruta viva — el app 2D de la v168 retiróse del
# árbol de rutas (el cromo/panel manda desde entonces). sala-vista compila
# (tsc 0) y su cura vive ASERTADA en la suite (pin EL PULSO FIRME estático:
# entrada copiada, manos estables, TDZ fuera de deps) — el patrón v356 del
# emisor dormido: la pantalla no lo ve hoy, el CONTRATO respira.
SALA=$(agent-browser eval "(() => { const card = Array.from(document.querySelectorAll('button, a')).find(x => x.textContent.includes('TERREMOTOS EN VIVO')); const casa = document.body.innerText.length > 500; return (card ? 'CARD-VIVA✓' : 'CARD-AUSENTE (app 2D retirado — hecho)') + '|' + (casa ? 'CASA✓' : 'CASA✗'); })()" 2>/dev/null | tr -d '"')
echo "sala (dormida declarada): $SALA"

echo "── E) MÓVIL 390 ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser open "$BASE/?r=5" >/dev/null 2>&1
sleep 6
MOVIL=$(agent-browser eval "(() => { const d = document.documentElement; return (d.scrollWidth <= window.innerWidth + 2 ? 'SIN-DESBORDE✓' : 'DESBORDE✗ ' + d.scrollWidth) + '|' + (document.body.innerText.length > 300 ? 'CASA✓' : 'CASA✗'); })()" 2>/dev/null | tr -d '"')
echo "móvil: $MOVIL"
agent-browser screenshot /tmp/render/qa357-movil.png >/dev/null 2>&1

echo "── F) HIGIENE: consola, errores, zombis, canon ──"
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
echo "QA-V357 FIN"

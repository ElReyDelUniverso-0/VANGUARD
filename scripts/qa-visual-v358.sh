#!/bin/bash
# QA VISUAL v358 — WORLD PULSE (el CENTRO DE INTELIGENCIA MUNDIAL: la
# instantánea REAL del Banco Mundial en el primer byte, la cronología de
# cables reales, el índice WPI con metodología publicada y la isla que
# respira SIN un solo effect). El guion que importa: la puerta /pulso-
# mundial VIVE (tabs operados por bot del DOM, ranking WPI visible,
# comparación de períodos con deltas reales), móvil 390 sin desbordes y
# el canon restaurado por el ritual de la casa (muerte POR PUERTO).
# Ley v302: arranque + verificación + cierre en UNA llamada.
# Lección v357: bun firma como «next-server (vNN)» — se mata POR PUERTO.
set -u
PORT=3579
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

matar() { local P=$(ss -ltnp 2>/dev/null | grep ":$PORT " | grep -oP 'pid=\K[0-9]+' | head -1); [ -n "$P" ] && kill -9 "$P" 2>/dev/null; return 0; }

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa358.log 2>&1 &
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
FIRMA=$(agent-browser eval "(() => { const T = document.body.innerText; return (T.includes('v358.0') ? 'VERSION✓' : 'VERSION✗') + '|' + (T.includes('WORLD PULSE') ? 'CODENAME✓' : 'CODENAME✗') + '|' + (T.length > 500 ? 'CASA✓' : 'CASA✗'); })()" 2>/dev/null | tr -d '"')
echo "firma: $FIRMA"
agent-browser screenshot /tmp/render/qa358-home.png >/dev/null 2>&1

echo "── B) LA PUERTA /pulso-mundial DESPIERTA ──"
agent-browser open "$BASE/pulso-mundial" >/dev/null 2>&1
sleep 5
PUERTA=$(agent-browser eval "(() => { const T = document.body.innerText.toUpperCase(); return (T.includes('WORLD PULSE') ? 'CENTRO✓' : 'CENTRO✗') + '|' + (T.includes('WORLD PULSE INDEX') ? 'WPI✓' : 'WPI✗') + '|' + (T.includes('BANCO MUNDIAL') ? 'FUENTE✓' : 'FUENTE✗') + '|' + (T.includes('FUENTES Y LIMITACIONES') ? 'PROCEDENCIA✓' : 'PROCEDENCIA✗') + '|' + (T.includes('DATOS HORNEADOS') ? 'FECHA✓' : 'FECHA✗'); })()" 2>/dev/null | tr -d '"')
echo "puerta: $PUERTA"
agent-browser screenshot /tmp/render/qa358-pulso.png >/dev/null 2>&1

echo "── C) LA ISLA VIVA: tabs operados por bot del DOM ──"
# ACTIVIDAD ya manda por defecto: KPIs + destacados
ACT=$(agent-browser eval "(() => { const T = document.body.innerText.toUpperCase(); return (T.includes('CABLES EN EL FILTRO') ? 'KPI✓' : 'KPI✗') + '|' + ((T.includes('ACONTECIMIENTOS DESTACADOS')) ? 'DESTACADOS✓' : 'DESTACADOS✗'); })()" 2>/dev/null | tr -d '"')
echo "actividad: $ACT"
# bot del DOM: pestaña INDICADORES
agent-browser eval "(() => { const b = Array.from(document.querySelectorAll('button')).find(x => x.textContent.trim() === 'INDICADORES'); if (b) { b.click(); return 'clickado'; } return 'no-esta'; })()" >/dev/null 2>&1
sleep 2
IND=$(agent-browser eval "(() => { const T = document.body.innerText.toUpperCase(); return (T.includes('COMPARAR PERÍODOS') ? 'COMPARAR✓' : 'COMPARAR✗') + '|' + (T.includes('PERCENTIL REAL') ? 'PERCENTIL✓' : 'PERCENTIL✗') + '|' + (document.querySelector('svg polyline') ? 'SERIE✓' : 'SERIE✗'); })()" 2>/dev/null | tr -d '"')
echo "indicadores: $IND"
# bot del DOM: pestaña ÍNDICE WPI
agent-browser eval "(() => { const b = Array.from(document.querySelectorAll('button')).find(x => x.textContent.trim() === 'ÍNDICE WPI'); if (b) { b.click(); return 'clickado'; } return 'no-esta'; })()" >/dev/null 2>&1
sleep 2
# la metodología vive en <details> cerrado (honestidad sin JS): el bot la ABRE antes de juzgar
agent-browser eval "(() => { const d = document.querySelector('details'); if (d) { d.open = true; return 'abierta'; } return 'no-esta'; })()" >/dev/null 2>&1
sleep 1
WPI=$(agent-browser eval "(() => { const T = document.body.innerText.toUpperCase(); return (T.includes('RANKING WORLD PULSE INDEX') ? 'RANKING✓' : 'RANKING✗') + '|' + (T.includes('COBERTURA MÍNIMA 5/8') ? 'COBERTURA✓' : 'COBERTURA✗') + '|' + (T.includes('PESOS PUBLICADOS') ? 'METODO✓' : 'METODO✗'); })()" 2>/dev/null | tr -d '"')
echo "wpi: $WPI"
agent-browser screenshot /tmp/render/qa358-wpi.png >/dev/null 2>&1
# bot del DOM: pestaña CRONOLOGÍA
agent-browser eval "(() => { const b = Array.from(document.querySelectorAll('button')).find(x => x.textContent.trim() === 'CRONOLOGÍA'); if (b) { b.click(); return 'clickado'; } return 'no-esta'; })()" >/dev/null 2>&1
sleep 2
CRON=$(agent-browser eval "(() => { const T = document.body.innerText.toUpperCase(); return ((T.includes('CABLES · MOSTRANDO') || T.includes('CRONOLOGÍA VACÍA')) ? 'CRON✓' : 'CRON✗'); })()" 2>/dev/null | tr -d '"')
echo "cronología: $CRON"

echo "── D) LA INSTANTÁNEA SE SIRVE PÚBLICA ──"
JSON=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/pulso-mundial-instantanea.json")
echo "instantánea: HTTP $JSON (esperado 200)"

echo "── E) MÓVIL 390 EN LA PUERTA ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser open "$BASE/pulso-mundial" >/dev/null 2>&1
sleep 5
MOVIL=$(agent-browser eval "(() => { const d = document.documentElement; return (d.scrollWidth <= window.innerWidth + 2 ? 'SIN-DESBORDE✓' : 'DESBORDE✗ ' + d.scrollWidth) + '|' + (document.body.innerText.includes('WORLD PULSE') ? 'CENTRO✓' : 'CENTRO✗'); })()" 2>/dev/null | tr -d '"')
echo "móvil: $MOVIL"
agent-browser screenshot /tmp/render/qa358-movil.png >/dev/null 2>&1

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
CANON2=$(md5sum db/custom.db | cut -d' ' -f1)
[ "$CANON" = "$CANON2" ] && echo "doble lectura: ESTABLE" || echo "doble lectura: DRIFT!"
echo "QA-V358 FIN"

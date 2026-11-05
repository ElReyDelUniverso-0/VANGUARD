#!/bin/bash
# v308 LA CUARTA CUCHILLA — EL ESPEJO DEL NAVEGADOR
# Audita el render VIVO de la casa: consola, errores de página, desbordes móviles.
# Ley v302: arranque + auditoría + cierre en UNA llamada (el sandbox mata procesos entre llamadas).
set -u
PORT=3496
BASE="http://localhost:$PORT"
mkdir -p /tmp/render

cd /home/z/my-project

# 1) ARRANQUE
PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-audit.log 2>&1 &
SRVPID=$!
for i in $(seq 1 20); do
  sleep 1
  if curl -s -o /dev/null "$BASE/api/health"; then break; fi
done
echo "=== SALUD ==="
curl -s "$BASE/api/health"
echo

agent-browser console --clear >/dev/null 2>&1 || true
agent-browser errors --clear >/dev/null 2>&1 || true

auditar () {
  local ruta="$1" espera="$2" etiqueta="$3" ancho="$4" alto="$5"
  agent-browser set viewport "$ancho" "$alto" >/dev/null 2>&1
  agent-browser open "$BASE$ruta" >/dev/null 2>&1
  sleep "$espera"
  local ERRS CONSOLA DESB
  ERRS=$(agent-browser errors 2>&1 | rg -v '^\s*$' | head -6)
  CONSOLA=$(agent-browser console 2>&1 | rg -i '\[error\]|\[warning\]' | rg -v 'Download the React DevTools' | head -6)
  DESB=$(agent-browser eval "JSON.stringify({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,over:document.documentElement.scrollWidth>document.documentElement.clientWidth+1})" 2>&1 | tr -d '\n' | head -c 200)
  echo "--- [$etiqueta] $ruta ${ancho}x${alto} ---"
  echo "PAGINA: ${ERRS:-limpia}"
  echo "CONSOLA: ${CONSOLA:-limpia}"
  echo "DESBORDE: $DESB"
  agent-browser screenshot "/tmp/render/aud-${etiqueta}.png" >/dev/null 2>&1
  agent-browser console --clear >/dev/null 2>&1
  agent-browser errors --clear >/dev/null 2>&1
}

# 2) AUDITORÍA — escritorio primero, luego móvil
auditar "/" 9 inicio-desk 1440 900
auditar "/vanguard2" 14 universo-desk 1440 900
auditar "/mercado" 8 mercado-desk 1440 900
auditar "/empleos" 8 empleos-desk 1440 900
auditar "/" 9 inicio-movil 390 844
auditar "/vertigo" 8 vertigo-movil 390 844

# 3) CIERRE POR PID
kill "$SRVPID" 2>/dev/null
sleep 1
kill -9 "$SRVPID" 2>/dev/null
echo "=== CIERRE ==="
curl -s -o /dev/null -w 'puerto tras cierre=%{http_code}\n' --max-time 2 "$BASE/api/health" || echo "puerto 3496 libre"
echo "FIN AUDITORÍA"

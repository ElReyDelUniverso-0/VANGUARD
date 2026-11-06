#!/bin/bash
# QA VISUAL v360 — LA VOZ QUE ENTIENDE (fase 1 del mandato del Dueño:
# ① el sanador de voz en el punto único + la guardia de idioma honesta,
# ② LA CASA QUE RESPIRA — el aire vive en el LAYOUT y llega a las páginas
# server que respiraban en negro plano, ③ LA CASA ILUSTRADA — las cabeceras
# server de GUERRA HOY / ESPÍA / MUNDO / WORLD PULSE llevan la biblioteca
# propia como baño de luz con máscara). El guion que importa: el aire viaja
# en el HTML de TODAS las puertas, las ilustraciones pintan sin estorbar la
# lectura, móvil 390 sin desbordes y canon restaurado por el ritual de la
# casa (muerte POR PUERTO). Ley v302: arranque + verificación + cierre en
# UNA llamada.
set -u
PORT=3590
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

matar() { local P=$(ss -ltnp 2>/dev/null | grep ":$PORT " | grep -oP 'pid=\K[0-9]+' | head -1); [ -n "$P" ] && kill -9 "$P" 2>/dev/null; return 0; }

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa360.log 2>&1 &
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
FIRMA=$(agent-browser eval "(() => { const T = document.body.innerText; return (T.includes('v360.0') ? 'VERSION✓' : 'VERSION✗') + '|' + (T.includes('LA VOZ QUE ENTIENDE') ? 'CODENAME✓' : 'CODENAME✗') + '|' + (T.length > 500 ? 'CASA✓' : 'CASA✗'); })()" 2>/dev/null | tr -d '"')
echo "firma: $FIRMA"
agent-browser screenshot /tmp/render/qa360-home.png >/dev/null 2>&1

echo "── B) GUERRA HOY: aire + ilustración en la cabecera ──"
agent-browser open "$BASE/guerra-hoy" >/dev/null 2>&1
sleep 4
GUERRA=$(agent-browser eval "(() => { const aire = document.querySelector('.casa-aire'); const ilu = document.querySelector('.ilu-cabecera'); const orb = document.querySelectorAll('.casa-aire-orbe').length; const T = document.body.innerText.toUpperCase(); return (aire ? 'AIRE✓' : 'AIRE✗') + '|' + (orb >= 3 ? 'ORBES✓' : 'ORBES✗' + orb) + '|' + (ilu ? 'ILUSTRADA✓' : 'ILUSTRADA✗') + '|' + (getComputedStyle(aire || document.body).pointerEvents === 'none' ? 'NOESTORBA✓' : 'ESTORBA✗') + '|' + (T.includes('GUERRA HOY') ? 'TITULO✓' : 'TITULO✗'); })()" 2>/dev/null | tr -d '"')
echo "guerra-hoy: $GUERRA"
agent-browser screenshot /tmp/render/qa360-guerra.png >/dev/null 2>&1

echo "── C) ESPÍA y WORLD PULSE: la casa ilustrada viaja a toda la familia ──"
agent-browser open "$BASE/espia" >/dev/null 2>&1
sleep 4
ESPIA=$(agent-browser eval "(() => { return (document.querySelector('.ilu-cabecera') ? 'ILUSTRADA✓' : 'ILUSTRADA✗') + '|' + (document.querySelector('.casa-aire') ? 'AIRE✓' : 'AIRE✗') + '|' + (document.body.innerText.toUpperCase().includes('MODO ESPÍA') ? 'TITULO✓' : 'TITULO✗'); })()" 2>/dev/null | tr -d '"')
echo "espia: $ESPIA"
agent-browser screenshot /tmp/render/qa360-espia.png >/dev/null 2>&1
agent-browser open "$BASE/pulso-mundial" >/dev/null 2>&1
sleep 4
PULSO=$(agent-browser eval "(() => { const T = document.body.innerText.toUpperCase(); return (document.querySelector('.ilu-cabecera') ? 'ILUSTRADA✓' : 'ILUSTRADA✗') + '|' + (document.querySelector('.casa-aire') ? 'AIRE✓' : 'AIRE✗') + '|' + (T.includes('WORLD PULSE') ? 'CENTRO✓' : 'CENTRO✗'); })()" 2>/dev/null | tr -d '"')
echo "pulso: $PULSO"
agent-browser screenshot /tmp/render/qa360-pulso.png >/dev/null 2>&1

echo "── D) LA PORTADA NO DUPLICA EL AIRE (body:has retira la capa) ──"
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 5
PORTADA=$(agent-browser eval "(() => { const css = Array.from(document.styleSheets).some(s => { try { return Array.from(s.cssRules).some(r => r.cssText && r.cssText.includes('body:has(#vg-casa) .casa-aire')); } catch { return false; } }); return (css ? 'REGLA✓' : 'REGLA✗') + '|' + (document.querySelector('.aurora-layer') ? 'AURORA-VIVA✓' : 'AURORA✗'); })()" 2>/dev/null | tr -d '"')
echo "portada: $PORTADA"

echo "── E) MÓVIL 390 EN GUERRA HOY Y EN LA PORTADA ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser open "$BASE/guerra-hoy" >/dev/null 2>&1
sleep 4
MOVIL1=$(agent-browser eval "(() => { const d = document.documentElement; return (d.scrollWidth <= window.innerWidth + 2 ? 'SIN-DESBORDE✓' : 'DESBORDE✗ ' + d.scrollWidth) + '|' + (document.querySelector('.ilu-cabecera') ? 'ILUSTRADA✓' : 'ILUSTRADA✗'); })()" 2>/dev/null | tr -d '"')
echo "móvil-guerra: $MOVIL1"
agent-browser screenshot /tmp/render/qa360-movil-guerra.png >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 6
MOVIL2=$(agent-browser eval "(() => { const d = document.documentElement; return (d.scrollWidth <= window.innerWidth + 2 ? 'SIN-DESBORDE✓' : 'DESBORDE✗ ' + d.scrollWidth) + '|' + (document.querySelector('.aurora-layer') ? 'AURORA✓' : 'AURORA✗'); })()" 2>/dev/null | tr -d '"')
echo "móvil-portada: $MOVIL2"
agent-browser screenshot /tmp/render/qa360-movil-home.png >/dev/null 2>&1

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
echo "QA-V360 FIN"

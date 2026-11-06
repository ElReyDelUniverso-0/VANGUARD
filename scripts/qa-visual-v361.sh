#!/bin/bash
# QA VISUAL v361 — EL MAPA QUE EXPLICA (fase 2 del mandato del Dueño:
# «mapas como animados explicando conflictos diversos dinámicos en el
# inicio»). El guion que importa: el mapa mundial REAL vive en el CORAZÓN
# del inicio con los seis teatros de la Sala de Guerra marcados y vivos,
# la tarjeta EXPLICA uno a uno en rotación, el clic manda (elegir teatro),
# móvil 390 sin desbordes y canon restaurado por el ritual de la casa
# (muerte POR PUERTO). Ley v302: arranque + verificación + cierre en UNA
# llamada.
set -u
PORT=3600
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

matar() { local P=$(ss -ltnp 2>/dev/null | grep ":$PORT " | grep -oP 'pid=\K[0-9]+' | head -1); [ -n "$P" ] && kill -9 "$P" 2>/dev/null; return 0; }

# DESPERTAR LA CASA: con el perfil limpio, el cine del estreno y el ritual de
# entrada (una vez por aparato) vuelven a disparar y TAPAN la portada — el
# arnés los cierra antes de mirar (la casa despertada es la que se prueba).
despertar() {
  agent-browser eval "(() => {
    const TEXTOS = ['SKIP', 'SALTAR', 'KEEP IT SILENT', 'MANTENER EN SILENCIO', 'NOT NOW', 'AHORA NO', 'MÁS TARDE', 'LATER'];
    for (let i = 0; i < 6; i++) {
      document.querySelectorAll('[aria-label=\"Cerrar el ritual\"]').forEach(b => b.click());
      const bs = Array.from(document.querySelectorAll('button')).filter(b => b.offsetParent !== null);
      let clic = false;
      for (const t of TEXTOS) {
        const b = bs.find(x => x.innerText.trim().toUpperCase() === t);
        if (b) { b.click(); clic = true; break; }
      }
      if (!clic) break;
    }
    return 'despierto';
  })()" >/dev/null 2>&1
}

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa361.log 2>&1 &
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
despertar
sleep 2
FIRMA=$(agent-browser eval "(() => { const T = document.body.innerText; return (T.includes('v361.0') ? 'VERSION✓' : 'VERSION✗') + '|' + (T.includes('EL MAPA QUE EXPLICA') ? 'CODENAME✓' : 'CODENAME✗') + '|' + (T.length > 500 ? 'CASA✓' : 'CASA✗'); })()" 2>/dev/null | tr -d '"')
echo "firma: $FIRMA"
agent-browser screenshot /tmp/render/qa361-home.png >/dev/null 2>&1

echo "── B) EL MAPA VIVE EN EL INICIO: continentes reales, teatros marcados ──"
despertar
sleep 2
MAPA=$(agent-browser eval "(() => {
  const sec = document.querySelector('[data-testid=\"mapa-inicio\"]');
  if (!sec) return 'SECCION✗';
  const svg = sec.querySelector('svg[viewBox=\"0 0 1000 500\"]');
  const foco = sec.querySelector('[data-testid=\"mapa-inicio-foco\"]');
  const puntos = sec.querySelectorAll('[data-testid=\"mapa-inicio-puntos\"] button');
  const marcas = svg ? svg.querySelectorAll('circle').length : 0;
  const tf = foco ? foco.innerText.toUpperCase() : '';
  const SEIS = ['UCRANIA', 'ORIENTE MEDIO', 'SUDÁN', 'SAHEL', 'MYANMAR', 'TAIWÁN'];
  const esTeatro = SEIS.some(n => tf.includes(n));
  const visible = sec.offsetParent !== null;
  return 'SECCION✓' + '|' + (visible ? 'VISIBLE✓' : 'TAPADA✗') + '|' + (svg ? 'SVG✓' : 'SVG✗') + '|' + (marcas > 10 ? 'MARCAS✓' : 'MARCAS✗' + marcas) + '|' + (puntos.length === 6 ? 'PUNTOS✓' : 'PUNTOS✗' + puntos.length) + '|' + (esTeatro ? 'FOCO✓' : 'FOCO✗' + tf.slice(0, 30)) + '|' + (tf.includes('DESDE') ? 'DESDE✓' : 'DESDE✗') + '|' + (tf.includes('FUENTE') ? 'FUENTE✓' : 'FUENTE✗');
})()" 2>/dev/null | tr -d '"')
echo "mapa: $MAPA"
agent-browser eval "(() => { document.querySelector('[data-testid=\"mapa-inicio\"]')?.scrollIntoView({ block: 'center' }); return 'scroll'; })()" >/dev/null 2>&1
sleep 1
agent-browser screenshot /tmp/render/qa361-mapa.png >/dev/null 2>&1

echo "── C) LA ROTACIÓN VIVA: el foco avanza solo y el clic manda ──"
FOCO1=$(agent-browser eval "(() => { const f = document.querySelector('[data-testid=\"mapa-inicio-foco\"]'); return f ? f.innerText.split('\n')[0].trim() : 'NADA'; })()" 2>/dev/null | tr -d '"')
sleep 9
FOCO2=$(agent-browser eval "(() => { const f = document.querySelector('[data-testid=\"mapa-inicio-foco\"]'); return f ? f.innerText.split('\n')[0].trim() : 'NADA'; })()" 2>/dev/null | tr -d '"')
[ "$FOCO1" != "$FOCO2" ] && ROT="ROTACION✓ ($FOCO1 → $FOCO2)" || ROT="ROTACION✗ ($FOCO1 = $FOCO2)"
echo "$ROT"
CLIC=$(agent-browser eval "(() => {
  const pts = document.querySelectorAll('[data-testid=\"mapa-inicio-puntos\"] button');
  if (pts.length < 6) return 'PUNTOS✗';
  pts[2].click();
  return 'CLIC-HECHO';
})()" 2>/dev/null | tr -d '"')
sleep 1
FOCO3=$(agent-browser eval "(() => { const f = document.querySelector('[data-testid=\"mapa-inicio-foco\"]'); return f ? f.innerText.toUpperCase() : 'NADA'; })()" 2>/dev/null | tr -d '"')
echo "clic: $CLIC → $(echo "$FOCO3" | rg -o 'SUDÁN' >/dev/null && echo 'SUDAN✓' || echo 'SUDAN✗')"
HONESTA=$(agent-browser eval "(() => { const s = document.querySelector('[data-testid=\"mapa-inicio\"]'); return s && s.innerText.includes('Vanguard no predice: presenta') ? 'OSINT✓' : 'OSINT✗'; })()" 2>/dev/null | tr -d '"')
echo "honestidad: $HONESTA"
agent-browser screenshot /tmp/render/qa361-foco-sudan.png >/dev/null 2>&1

echo "── D) MÓVIL 390: la portada y el mapa sin desbordes ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 7
despertar
sleep 2
MOVIL=$(agent-browser eval "(() => { const d = document.documentElement; const sec = document.querySelector('[data-testid=\"mapa-inicio\"]'); const svg = sec ? sec.querySelector('svg[viewBox=\"0 0 1000 500\"]') : null; return (d.scrollWidth <= window.innerWidth + 2 ? 'SIN-DESBORDE✓' : 'DESBORDE✗ ' + d.scrollWidth) + '|' + (svg ? 'MAPA✓' : 'MAPA✗') + '|' + (sec ? 'SECCION✓' : 'SECCION✗'); })()" 2>/dev/null | tr -d '"')
echo "móvil-portada: $MOVIL"
agent-browser eval "(() => { document.querySelector('[data-testid=\"mapa-inicio\"]')?.scrollIntoView({ block: 'start' }); return 'scroll'; })()" >/dev/null 2>&1
sleep 1
agent-browser screenshot /tmp/render/qa361-movil-home.png >/dev/null 2>&1

echo "── E) HIGIENE: consola, errores, zombis, canon ──"
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
echo "QA-V361 FIN"

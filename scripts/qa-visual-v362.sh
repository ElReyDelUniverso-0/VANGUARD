#!/bin/bash
# QA VISUAL v362 — EL TIEMPO REAL (fase 3 del mandato del Dueño: «la máquina
# del tiempo debe tener todos los conflictos, mapas y escenarios 3D
# interactivos, líderes y demás datos»). El guion que importa: la MÁQUINA DEL
# TIEMPO abre sus puertas al MUNDO REAL — los seis teatros de la Sala de
# Guerra con reproductor de hitos, mapa del teatro, escenario 3D y líderes —
# y el ATLAS de la historia (las 10 guerras del archivo en una franja).
# móvil 390 sin desbordes y canon restaurado por el ritual de la casa
# (muerte POR PUERTO). Ley v302: arranque + verificación + cierre en UNA
# llamada. Nota de la ronda: el cromo del SPA es el GoogleBar (v174) — la
# ruta al panel es LAUNCHER → TILE DE SECCIÓN → PÍLDORA DEL RIEL, y el
# perfil limpio despierta en EN — el arnés siembra el idioma ES (v132:
# vanguard-lang-v1) antes de mirar.
set -u
PORT=3610
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

matar() { local P=$(ss -ltnp 2>/dev/null | grep ":$PORT " | grep -oP 'pid=\K[0-9]+' | head -1); [ -n "$P" ] && kill -9 "$P" 2>/dev/null; return 0; }

# DESPERTAR LA CASA: con el perfil limpio, el cine del estreno y el ritual de
# entrada (una vez por aparato) vuelven a disparar y TAPAN la portada — el
# arnés los cierra antes de mirar (la casa despertada es la que se prueba).
despertar() {
  agent-browser eval "(() => {
    const TEXTOS = ['SKIP', 'SALTAR', 'KEEP IT SILENT', 'MANTENER EN SILENCIO', 'NOT NOW', 'AHORA NO', 'MÁS TARDE', 'LATER', 'RECLAMAR BONO DIARIO', 'RECLAMAR'];
    for (let i = 0; i < 8; i++) {
      document.querySelectorAll('[aria-label=\"Cerrar el ritual\"], [aria-label=\"Cerrar\"], [aria-label=\"Close\"]').forEach(b => b.click());
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

# LA RUTA A LA MÁQUINA: launcher de apps → tile INTELIGENCIA → píldora del riel
irMaquina() {
  P1=$(agent-browser eval "(() => {
    const L = document.querySelector('button[aria-label=\"Aplicaciones de Vanguard\"]');
    if (!L) return 'sin-launcher';
    L.click();
    return 'launcher';
  })()" 2>/dev/null | tr -d '"')
  sleep 2
  P2=$(agent-browser eval "(() => {
    const tile = Array.from(document.querySelectorAll('.app-tile')).find(t => t.innerText.trim().toUpperCase() === 'INTELIGENCIA');
    if (!tile) return 'sin-tile';
    tile.click();
    return 'tile';
  })()" 2>/dev/null | tr -d '"')
  sleep 2
  P3=$(agent-browser eval "(() => {
    const pill = Array.from(document.querySelectorAll('.vg170-riel-pill')).find(p => p.innerText.includes('MÁQUINA DEL TIEMPO'));
    if (!pill) return 'sin-riel';
    pill.click();
    return 'riel';
  })()" 2>/dev/null | tr -d '"')
  sleep 5
  echo "  ruta: $P1 → $P2 → $P3"
}

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa362.log 2>&1 &
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
agent-browser eval "(() => { localStorage.clear(); sessionStorage.clear(); localStorage.setItem('vanguard-lang-v1', JSON.stringify({state:{lang:'es',autoDetected:false},version:0})); return 'perfil-limpio-es'; })()" >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 6

echo "── A) EL HOME FIRMA LA RONDA ──"
despertar
sleep 2
FIRMA=$(agent-browser eval "(() => { const T = document.body.innerText; return (T.includes('v362.0') ? 'VERSION✓' : 'VERSION✗') + '|' + (T.includes('EL TIEMPO REAL') ? 'CODENAME✓' : 'CODENAME✗') + '|' + (T.length > 500 ? 'CASA✓' : 'CASA✗'); })()" 2>/dev/null | tr -d '"')
echo "firma: $FIRMA"
agent-browser screenshot /tmp/render/qa362-home.png >/dev/null 2>&1

echo "── B) LA MÁQUINA ABRE SUS PUERTAS AL MUNDO REAL ──"
despertar
irMaquina
MAQ=$(agent-browser eval "(() => { const T = document.body.innerText; const chips = document.querySelectorAll('[data-testid^=\"maquina-chip-mundo-\"]').length; return (T.includes('MÁQUINA DEL TIEMPO') ? 'PANEL✓' : 'PANEL✗') + '|' + (T.includes('ARCHIVO DEL DÍA') ? 'ANILLO✓' : 'ANILLO✗') + '|' + (chips === 6 ? 'CHIPS-MUNDO-6✓' : 'CHIPS-MUNDO✗' + chips) + '|' + (T.includes('ATLAS DE LA HISTORIA') ? 'ATLAS-VEZ✓' : 'ATLAS✗'); })()" 2>/dev/null | tr -d '"')
echo "máquina: $MAQ"
agent-browser eval "(() => { document.querySelector('[data-testid=\"maquina-atlas\"]')?.scrollIntoView({ block: 'start' }); return 'scroll'; })()" >/dev/null 2>&1
sleep 1
agent-browser screenshot /tmp/render/qa362-maquina.png >/dev/null 2>&1

echo "── C) EL TEATRO REAL: línea + mapa + ciudad + 3D + líderes + datos ──"
agent-browser eval "(() => { document.querySelector('[data-testid=\"maquina-chip-mundo-ucrania\"]')?.click(); return 'ucrania'; })()" >/dev/null 2>&1
sleep 5
MUNDO=$(agent-browser eval "(() => {
  const T = document.body.innerText.toUpperCase();
  const rep = document.querySelector('[data-testid=\"maquina-mundo-reproductor\"]');
  const mapa = document.querySelector('[data-testid=\"maquina-mundo-mapa\"]');
  const svg = mapa ? mapa.querySelector('[data-testid="maquina-mundo-svg"]') : null;
  const ciudades = svg ? svg.querySelectorAll('[data-testid^=\"maquina-mundo-ciudad-\"]').length : 0;
  const lideres = document.querySelector('[data-testid=\"maquina-mundo-lideres\"]');
  const lienzo = document.querySelector('[data-testid=\"maquina-mundo-3d\"] canvas');
  return (rep ? 'LINEA✓' : 'LINEA✗') + '|' + (T.includes('LA LÍNEA REAL') ? 'HITOS✓' : 'HITOS✗') + '|' + (svg ? 'MAPA✓' : 'MAPA✗') + '|' + (ciudades >= 10 ? 'CIUDADES✓' : 'CIUDADES✗' + ciudades) + '|' + (lideres ? 'LIDERES✓' : 'LIDERES✗') + '|' + (T.includes('PUTIN') ? 'PUTIN✓' : 'PUTIN✗') + '|' + (T.includes('BAJAS') ? 'BAJAS✓' : 'BAJAS✗') + '|' + (T.includes('VANGUARD NO PREDICE: PRESENTA') ? 'DOCTRINA✓' : 'DOCTRINA✗') + '|' + (lienzo ? '3D✓' : '3D-CARGANDO');
})()" 2>/dev/null | tr -d '"')
echo "mundo: $MUNDO"
agent-browser eval "(() => { document.querySelector('[data-testid=\"maquina-mundo-mapa\"]')?.scrollIntoView({ block: 'center' }); return 'scroll'; })()" >/dev/null 2>&1
sleep 1
agent-browser screenshot /tmp/render/qa362-mapa-teatro.png >/dev/null 2>&1

echo "── D) EL MAPA RESPONDE: tocar una ciudad abre su ficha ──"
CIUDAD=$(agent-browser eval "(() => { const c = document.querySelector('[data-testid=\"maquina-mundo-ciudad-0\"]'); if (!c) return 'CIUDAD✗'; c.dispatchEvent(new MouseEvent('click', { bubbles: true })); return 'clic'; })()" 2>/dev/null | tr -d '"')
sleep 1
FICHA=$(agent-browser eval "(() => { const f = document.querySelector('[data-testid=\"maquina-mundo-ciudad-ficha\"]'); return f ? 'FICHA✓ ' + f.innerText.split('\n')[0] : 'FICHA✗'; })()" 2>/dev/null | tr -d '"')
echo "ciudad: $CIUDAD → $FICHA"

echo "── E) EL REPRODUCTOR MANDA: dots de hitos y latido ──"
DOTS=$(agent-browser eval "(() => { const d = document.querySelectorAll('[data-testid=\"maquina-mundo-hitos\"] button'); if (d.length < 5) return 'DOTS✗' + d.length; d[2].click(); return 'DOTS✓' + d.length; })()" 2>/dev/null | tr -d '"')
sleep 1
HITO=$(agent-browser eval "(() => { const T = document.querySelector('[data-testid=\"maquina-mundo-hitos\"]')?.innerText || ''; return T.includes('3/9') ? 'HITO-3✓' : 'HITO✗ ' + T.slice(-6); })()" 2>/dev/null | tr -d '"')
echo "dots: $DOTS → $HITO"
PLAY=$(agent-browser eval "(() => { const b = document.querySelector('[aria-label=\"Reproducir la cronología\"]'); if (!b) return 'PLAY✗'; b.click(); return 'PLAY-ON'; })()" 2>/dev/null | tr -d '"')
# el latido honesto NO avanza hasta 12 s después de la última interacción
# (los pasos D/E acabaron de tocar el DOM) — el test respeta el ritmo de la casa
sleep 15
PAUSA=$(agent-browser eval "(() => { const T = document.querySelector('[data-testid=\"maquina-mundo-hitos\"]')?.innerText || ''; return T.includes('4/9') || T.includes('5/9') ? 'LATIDO✓' : 'LATIDO✗ ' + T.slice(-6); })()" 2>/dev/null | tr -d '"')
echo "play: $PLAY → $PAUSA"
agent-browser eval "(() => { const b = document.querySelector('[aria-label=\"Pausar la cronología\"]'); if (b) b.click(); return 'pausa'; })()" >/dev/null 2>&1

echo "── F) EL ESCENARIO 3D DESPIERTA ──"
sleep 4
TRES=$(agent-browser eval "(() => { const z = document.querySelector('[data-testid=\"maquina-mundo-3d\"]'); const c = z ? z.querySelector('canvas') : null; return c && c.width > 100 ? '3D✓' : '3D✗'; })()" 2>/dev/null | tr -d '"')
echo "escenario-3d: $TRES"
agent-browser eval "(() => { document.querySelector('[data-testid=\"maquina-mundo-3d\"]')?.scrollIntoView({ block: 'center' }); return 'scroll'; })()" >/dev/null 2>&1
sleep 2
agent-browser screenshot /tmp/render/qa362-escenario-3d.png >/dev/null 2>&1

echo "── G) OTRO TEATRO: Oriente Medio con sus propios rostros ──"
agent-browser eval "(() => { document.querySelector('[data-testid=\"maquina-chip-mundo-oriente\"]')?.click(); return 'oriente'; })()" >/dev/null 2>&1
sleep 4
ORIENTE=$(agent-browser eval "(() => { const T = document.body.innerText.toUpperCase(); return (T.includes('ORIENTE MEDIO — EL EJE EN LLAMAS') ? 'TEATRO✓' : 'TEATRO✗') + '|' + (T.includes('TRUMP') ? 'TRUMP✓' : 'TRUMP✗') + '|' + (T.includes('GUTERRES') ? 'GUTERRES✓' : 'GUTERRES✗') + '|' + (T.includes('7 OCT 2023') ? 'HITO1✓' : 'HITO1✗'); })()" 2>/dev/null | tr -d '"')
echo "oriente: $ORIENTE"

echo "── H) EL ATLAS: 10 conflictos del archivo en la franja y su ficha ──"
agent-browser eval "(() => { document.querySelector('[data-testid=\"maquina-atlas\"]')?.scrollIntoView({ block: 'start' }); return 'scroll'; })()" >/dev/null 2>&1
sleep 1
ATLAS=$(agent-browser eval "(() => {
  const a = document.querySelector('[data-testid=\"maquina-atlas\"]');
  if (!a) return 'ATLAS✗';
  const barras = a.querySelectorAll('[data-testid^=\"maquina-atlas-barra-\"]').length;
  return (barras === 10 ? 'BARRAS-10✓' : 'BARRAS✗' + barras) + '|' + (a.innerText.includes('ANTIGÜEDAD') && a.innerText.includes('CONTEMPORÁNEA') ? 'ERAS✓' : 'ERAS✗');
})()" 2>/dev/null | tr -d '"')
echo "atlas: $ATLAS"
CLICK=$(agent-browser eval "(() => { const b = document.querySelector('[data-testid=\"maquina-atlas-barra-0\"]'); if (!b) return 'BARRA✗'; b.click(); return 'clic'; })()" 2>/dev/null | tr -d '"')
sleep 1
FICHAH=$(agent-browser eval "(() => { const f = document.querySelector('[data-testid=\"maquina-atlas-ficha\"]'); return f ? 'FICHA✓ ' + f.innerText.split('\n')[1].slice(0, 30) : 'FICHA✗'; })()" 2>/dev/null | tr -d '"')
echo "ficha-historia: $CLICK → $FICHAH"
agent-browser screenshot /tmp/render/qa362-atlas.png >/dev/null 2>&1

echo "── I) MÓVIL 390: la máquina sin desbordes ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 6
despertar
sleep 1
agent-browser eval "(() => { localStorage.setItem('vanguard-lang-v1', JSON.stringify({state:{lang:'es',autoDetected:false},version:0})); return 'es'; })()" >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 5
despertar
irMaquina
agent-browser eval "(() => { document.querySelector('[data-testid=\"maquina-chip-mundo-ucrania\"]')?.click(); return 'ucrania'; })()" >/dev/null 2>&1
sleep 4
MOVIL=$(agent-browser eval "(() => { const d = document.documentElement; const rep = document.querySelector('[data-testid=\"maquina-mundo-reproductor\"]'); const mapa = document.querySelector('[data-testid=\"maquina-mundo-mapa\"]'); return (d.scrollWidth <= window.innerWidth + 2 ? 'SIN-DESBORDE✓' : 'DESBORDE✗ ' + d.scrollWidth) + '|' + (rep ? 'LINEA✓' : 'LINEA✗') + '|' + (mapa ? 'MAPA✓' : 'MAPA✗'); })()" 2>/dev/null | tr -d '"')
echo "móvil-máquina: $MOVIL"
agent-browser eval "(() => { document.querySelector('[data-testid=\"maquina-mundo-reproductor\"]')?.scrollIntoView({ block: 'start' }); return 'scroll'; })()" >/dev/null 2>&1
sleep 1
agent-browser screenshot /tmp/render/qa362-movil.png >/dev/null 2>&1

echo "── J) HIGIENE: consola, errores, zombis, canon ──"
CONSOLA=$(agent-browser console 2>/dev/null | rg -i "error" | rg -v "401|429|favicon|3610|websocket|socket" | head -3)
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
echo "QA-V362 FIN"

#!/bin/bash
# QA VISUAL v364 — LA BIBLIOTECA DEL MUNDO (mandato del Dueño: «agrega ya la
# biblioteca a Vanguard: que funcione como un libro de política — las
# constituciones de cada país y las cosas importantes para el mundo
# geopolítico, que uno puede seleccionar, buscar; y una ficha elegante como
# la del módulo del gobierno, con misiones diarias que le hablen a la persona
# según su nivel y su regularidad, marcadas al lado — hay que cumplirlas como
# en la escuela: saber más da puntos»). El guion que importa: ① las TRES
# salas bajo un techo (99 CONSTITUCIONES reales + 30 piezas de GEOPOLÍTICA +
# la SALA SECRETA de v13/v336 montada tal cual); ② LA CÁTEDRA (saludo por
# nivel y regularidad, misiones del día con progreso al lado, EXAMEN DEL
# DÍA); ③ buscar→ficha elegante; móvil 390 sin desbordes y canon restaurado
# por el ritual de la casa (muerte POR PUERTO). Ley v302: arranque +
# verificación + cierre en UNA llamada. La ruta al panel es LAUNCHER → TILE
# DE SECCIÓN → PÍLDORA DEL RIEL, y el perfil limpio despierta en EN — el
# arnés siembra el idioma ES (v132: vanguard-lang-v1) antes de mirar.
set -u
PORT=3630
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

# LA RUTA A UNA PESTAÑA: launcher → tile de sección → píldora del riel
irPestana() { # $1 = nombre del tile, $2 = texto de la píldora
  P1=$(agent-browser eval "(() => {
    const L = document.querySelector('button[aria-label=\"Aplicaciones de Vanguard\"]');
    if (!L) return 'sin-launcher';
    L.click();
    return 'launcher';
  })()" 2>/dev/null | tr -d '"')
  sleep 2
  P2=$(agent-browser eval "(() => {
    const tile = Array.from(document.querySelectorAll('.app-tile')).find(t => t.innerText.trim().toUpperCase().startsWith('$1'));
    if (!tile) return 'sin-tile';
    tile.click();
    return 'tile';
  })()" 2>/dev/null | tr -d '"')
  sleep 2
  P3=$(agent-browser eval "(() => {
    const pill = Array.from(document.querySelectorAll('.vg170-riel-pill')).find(p => p.innerText.includes('$2'));
    if (!pill) return 'sin-riel';
    pill.click();
    return 'riel';
  })()" 2>/dev/null | tr -d '"')
  sleep 4
  echo "  ruta: $P1 → $P2 → $P3"
}

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa364.log 2>&1 &
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
FIRMA=$(agent-browser eval "(() => { const T = document.body.innerText; return (T.includes('v364.0') ? 'VERSION✓' : 'VERSION✗') + '|' + (T.includes('LA BIBLIOTECA DEL MUNDO') ? 'CODENAME✓' : 'CODENAME✗') + '|' + (T.length > 500 ? 'CASA✓' : 'CASA✗'); })()" 2>/dev/null | tr -d '"')
echo "firma: $FIRMA"
agent-browser screenshot /tmp/render/qa364-home.png >/dev/null 2>&1

echo "── B) LA RUTA A LA BIBLIOTECA: launcher → ARCHIVO → píldora ──"
despertar
irPestana "ARCHIVO" "GRAN BIBLIOTECA"
BIBLIO=$(agent-browser eval "(() => {
  const T = document.body.innerText.toUpperCase();
  const salas = document.querySelector('[data-testid=\"biblio-salas\"]');
  const chips = salas ? salas.querySelectorAll('button').length : 0;
  const cat = document.querySelector('[data-testid=\"biblio-catedra\"]');
  return (T.includes('LA GRAN BIBLIOTECA') ? 'PANEL✓' : 'PANEL✗') + '|' + (chips === 3 ? 'SALAS-3✓' : 'SALAS✗' + chips) + '|' + (T.includes('CONSTITUCIONES (99)') ? 'CARTAS-99✓' : 'CARTAS✗') + '|' + (T.includes('GEOPOLÍTICA (30)') ? 'GEO-30✓' : 'GEO✗') + '|' + (cat ? 'CATEDRA✓' : 'CATEDRA✗');
})()" 2>/dev/null | tr -d '"')
echo "biblioteca: $BIBLIO"
agent-browser screenshot /tmp/render/qa364-biblioteca.png >/dev/null 2>&1

echo "── C) LA CÁTEDRA: saludo por nivel, misiones marcadas al lado ──"
CATEDRA=$(agent-browser eval "(() => {
  const T = document.body.innerText;
  const TU = T.toUpperCase();
  const misiones = document.querySelectorAll('[data-testid=\"catedra-mision\"]').length;
  const progresos = document.querySelectorAll('[data-testid=\"catedra-progreso\"]').length;
  const registro = document.querySelector('[data-testid=\"catedra-registro\"]');
  const saludo = document.querySelector('[data-testid=\"biblio-saludo\"]');
  const brA = T.includes('Aprendiz del archivo') || T.includes('Analista') || T.includes('Jefe de expedientes') || T.includes('Catedrático del tablero');
  return (TU.includes('APRENDE POR PUNTOS') ? 'PUNTOS✓' : 'PUNTOS✗') + '|' + (brA ? 'SALUDO✓' : 'SALUDO✗') + '|' + (saludo ? 'HABLA✓' : 'HABLA✗') + '|' + (misiones === 3 ? 'MISIONES-3✓' : 'MISIONES✗' + misiones) + '|' + (progresos === 3 ? 'AL-LADO✓' : 'AL-LADO✗' + progresos) + '|' + (registro && registro.innerText.includes('EL REGISTRO') ? 'REGISTRO✓' : 'REGISTRO✗') + '|' + (TU.includes('EL EXAMEN DEL DÍA') ? 'EXAMEN-ZONA✓' : 'EXAMEN✗');
})()" 2>/dev/null | tr -d '"')
echo "cátedra: $CATEDRA"

echo "── D) BUSCAR → FICHA ELEGANTE (España 1978) ──"
agent-browser eval "(() => {
  const i = document.querySelector('[data-testid=\"biblio-buscar\"]');
  if (!i) return 'sin-buscar';
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(i, 'España');
  i.dispatchEvent(new Event('input', { bubbles: true }));
  i.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  return 'buscado';
})()" >/dev/null 2>&1
sleep 1.5
BUSCA=$(agent-browser eval "(() => {
  const cartas = document.querySelectorAll('[data-testid=\"biblio-carta\"]').length;
  const conteo = document.querySelector('[data-testid=\"biblio-conteo\"]');
  return (cartas === 1 ? 'RESULTADO-1✓' : 'RESULTADO✗' + cartas) + '|' + (conteo && conteo.innerText.includes('1 DE 99') ? 'CONTEO✓' : 'CONTEO✗');
})()" 2>/dev/null | tr -d '"')
echo "buscar: $BUSCA"
agent-browser eval "(() => { const c = document.querySelector('[data-testid=\"biblio-carta\"]'); if (c) c.click(); return 'ficha'; })()" >/dev/null 2>&1
sleep 1.5
FICHA=$(agent-browser eval "(() => {
  const f = document.querySelector('[data-testid=\"biblio-ficha\"]');
  const T = document.body.innerText;
  return (f ? 'MODAL✓' : 'MODAL✗') + '|' + (f && f.innerText.includes('FORMA DE GOBIERNO') ? 'GOBIERNO✓' : 'GOBIERNO✗') + '|' + (f && f.innerText.includes('MANDATO') ? 'MANDATO✓' : 'MANDATO✗') + '|' + (f && f.innerText.includes('RASGOS DE LA CARTA') ? 'RASGOS✓' : 'RASGOS✗') + '|' + (T.includes('FICHA NUEVA EN TU EXPEDIENTE') ? 'XP-TOAST✓' : 'XP-TOAST✗');
})()" 2>/dev/null | tr -d '"')
echo "ficha: $FICHA"
agent-browser screenshot /tmp/render/qa364-ficha.png >/dev/null 2>&1
agent-browser eval "(() => { document.querySelector('[aria-label=\"Cerrar ficha\"]')?.click(); return 'cerrado'; })()" >/dev/null 2>&1
sleep 1

echo "── E) GEOPOLÍTICA: la otra estantería con su por qué importa ──"
agent-browser eval "(() => { const b = document.querySelector('[data-testid=\"biblio-sala-geopolitica\"]'); if (b) b.click(); return 'geo'; })()" >/dev/null 2>&1
sleep 2
GEO=$(agent-browser eval "(() => {
  const cartas = document.querySelectorAll('[data-testid=\"biblio-carta\"]').length;
  const T = document.body.innerText.toUpperCase();
  return (cartas === 30 ? 'PIEZAS-30✓' : 'PIEZAS✗' + cartas) + '|' + (T.includes('DE WESTFALIA (1648)') ? 'PIE-HONESTA✓' : 'PIE✗');
})()" 2>/dev/null | tr -d '"')
echo "geopolítica: $GEO"
agent-browser eval "(() => { const cs = document.querySelectorAll('[data-testid=\"biblio-carta\"]'); const c = Array.from(cs).find(x => x.innerText.includes('Paz de Westfalia')); if (c) c.click(); return 'ficha'; })()" >/dev/null 2>&1
sleep 1.5
GEOFICHA=$(agent-browser eval "(() => {
  const f = document.querySelector('[data-testid=\"biblio-ficha\"]');
  return (f && f.innerText.includes('POR QUÉ IMPORTA') ? 'PORQUE✓' : 'PORQUE✗') + '|' + (f && f.innerText.includes('TRATADO') ? 'TIPO✓' : 'TIPO✗');
})()" 2>/dev/null | tr -d '"')
echo "ficha-geo: $GEOFICHA"
agent-browser screenshot /tmp/render/qa364-geo-ficha.png >/dev/null 2>&1
agent-browser eval "(() => { document.querySelector('[aria-label=\"Cerrar ficha\"]')?.click(); return 'cerrado'; })()" >/dev/null 2>&1
sleep 1

echo "── F) EL EXAMEN DEL DÍA: sentarlo y responder una ──"
agent-browser eval "(() => { const b = document.querySelector('[data-testid=\"biblio-examen\"]'); if (b) b.click(); return 'examen'; })()" >/dev/null 2>&1
sleep 1
PREGUNTAS=$(agent-browser eval "(() => {
  const ps = document.querySelectorAll('[data-testid=\"examen-pregunta\"]').length;
  const ops = document.querySelectorAll('[data-testid=\"examen-opcion\"]').length;
  return (ps === 5 ? 'PREGUNTAS-5✓' : 'PREGUNTAS✗' + ps) + '|' + (ops === 20 ? 'OPCIONES-20✓' : 'OPCIONES✗' + ops);
})()" 2>/dev/null | tr -d '"')
echo "examen: $PREGUNTAS"
agent-browser eval "(() => { const o = document.querySelector('[data-testid=\"examen-opcion\"]'); if (o) o.click(); return 'respondida'; })()" >/dev/null 2>&1
sleep 1
VEREDICTO=$(agent-browser eval "(() => {
  const T = document.body.innerText;
  return (T.includes('Estúdiala en:') ? 'PISTA✓' : 'PISTA✗') + '|' + (T.includes('+5 XP · ACIERTO') || T.includes('Fallaste — la cátedra marca la pista') ? 'VEREDICTO✓' : 'VEREDICTO✗');
})()" 2>/dev/null | tr -d '"')
echo "veredicto: $VEREDICTO"
agent-browser screenshot /tmp/render/qa364-examen.png >/dev/null 2>&1

echo "── G) LA SALA SECRETA: intacta bajo el mismo techo ──"
agent-browser eval "(() => { const b = document.querySelector('[data-testid=\"biblio-sala-secreta\"]'); if (b) b.click(); return 'secreta'; })()" >/dev/null 2>&1
sleep 2
SECRETA=$(agent-browser eval "(() => {
  const T = document.body.innerText.toUpperCase();
  return (T.includes('BIBLIOTECA SECRETA') ? 'SECRETA✓' : 'SECRETA✗') + '|' + (T.includes('DOCUMENTO DEL DÍA') ? 'ANILLO✓' : 'ANILLO✗');
})()" 2>/dev/null | tr -d '"')
echo "secreta: $SECRETA"
agent-browser screenshot /tmp/render/qa364-secreta.png >/dev/null 2>&1

echo "── H) MÓVIL 390: la biblioteca sin desbordes ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 6
despertar
sleep 1
agent-browser eval "(() => { localStorage.setItem('vanguard-lang-v1', JSON.stringify({state:{lang:'es',autoDetected:false},version:0})); return 'es'; })()" >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 5
despertar
irPestana "ARCHIVO" "GRAN BIBLIOTECA"
MOVIL=$(agent-browser eval "(() => {
  const d = document.documentElement;
  const cat = document.querySelector('[data-testid=\"biblio-catedra\"]');
  return (d.scrollWidth <= window.innerWidth + 2 ? 'SIN-DESBORDE✓' : 'DESBORDE✗ ' + d.scrollWidth) + '|' + (cat ? 'CATEDRA✓' : 'CATEDRA✗');
})()" 2>/dev/null | tr -d '"')
echo "móvil-biblioteca: $MOVIL"
agent-browser screenshot /tmp/render/qa364-movil.png >/dev/null 2>&1

echo "── I) HIGIENE: consola, errores, zombis, canon ──"
CONSOLA=$(agent-browser console 2>/dev/null | rg -i "error" | rg -v "401|429|favicon|3630|websocket|socket" | head -3)
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
echo "QA-V364 FIN"

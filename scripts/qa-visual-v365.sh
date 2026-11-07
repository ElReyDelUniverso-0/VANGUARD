#!/bin/bash
# QA VISUAL v365 — LA ARMERÍA DEL MUNDO (mandato del Dueño: «sigue y no solo
# armas nucleares, si no todas las armas posibles; y la carta así que
# obligatoriamente se vea, y que se vea feo si uno se va incompleto»). El
# guion que importa: ① las CUATRO salas bajo un techo (99 CONSTITUCIONES +
# 30 piezas de GEOPOLÍTICA + 44 dossiers del ARSENAL en 9 familias + la SALA
# SECRETA intacta); ② LA CARTA DEL DEBER obligatoria (se abre sola, solo
# cierra con «A ESTUDIAR», el fondo no cierra) y FEA si te fuiste incompleto
# (sello INCOMPLETO, borde rojo, chip A MEDIAS en la cátedra); ③ buscar→ficha
# en las dos estanterías; ④ examen de 6 preguntas; móvil 390 sin desbordes y
# canon restaurado por el ritual de la casa (muerte POR PUERTO). Ley v302:
# arranque + verificación + cierre en UNA llamada. La ruta al panel es
# LAUNCHER → TILE DE SECCIÓN → PÍLDORA DEL RIEL, y el perfil limpio despierta
# en EN — el arnés siembra el idioma ES (v132: vanguard-lang-v1) antes de mirar.
set -u
PORT=3640
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

matar() { local P=$(ss -ltnp 2>/dev/null | grep ":$PORT " | grep -oP 'pid=\K[0-9]+' | head -1); [ -n "$P" ] && kill -9 "$P" 2>/dev/null; return 0; }

# DESPERTAR LA CASA: con el perfil limpio, el cine del estreno y el ritual de
# entrada (una vez por aparato) vuelven a disparar y TAPAN la portada — el
# arnés los cierra antes de mirar (la casa despertada es la que se prueba).
# NO toca la carta del deber: su cierre explícito es PARTE DEL TEST.
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

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa365.log 2>&1 &
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
FIRMA=$(agent-browser eval "(() => { const T = document.body.innerText; return (T.includes('v365.0') ? 'VERSION✓' : 'VERSION✗') + '|' + (T.includes('LA ARMERÍA DEL MUNDO') ? 'CODENAME✓' : 'CODENAME✗') + '|' + (T.length > 500 ? 'CASA✓' : 'CASA✗'); })()" 2>/dev/null | tr -d '"')
echo "firma: $FIRMA"
agent-browser screenshot /tmp/render/qa365-home.png >/dev/null 2>&1

echo "── B) LA RUTA A LA BIBLIOTECA: launcher → ARCHIVO → píldora ──"
despertar
irPestana "ARCHIVO" "GRAN BIBLIOTECA"
BIBLIO=$(agent-browser eval "(() => {
  const T = document.body.innerText.toUpperCase();
  const salas = document.querySelector('[data-testid=\"biblio-salas\"]');
  const chips = salas ? salas.querySelectorAll('button').length : 0;
  return (T.includes('LA GRAN BIBLIOTECA') ? 'PANEL✓' : 'PANEL✗') + '|' + (chips === 4 ? 'SALAS-4✓' : 'SALAS✗' + chips) + '|' + (T.includes('CONSTITUCIONES (99)') ? 'CARTAS-99✓' : 'CARTAS✗') + '|' + (T.includes('GEOPOLÍTICA (30)') ? 'GEO-30✓' : 'GEO✗') + '|' + (T.includes('ARSENAL (44)') ? 'ARSENAL-44✓' : 'ARSENAL✗');
})()" 2>/dev/null | tr -d '"')
echo "biblioteca: $BIBLIO"

echo "── C) LA CARTA OBLIGATORIA: se abre sola, el fondo no cierra ──"
CARTA=$(agent-browser eval "(() => {
  const c = document.querySelector('[data-testid=\"carta-deber\"]');
  if (!c) return 'SIN-CARTA';
  const botones = c.querySelectorAll('button').length;
  const misiones = c.querySelectorAll('[data-testid=\"carta-mision\"]').length;
  const T = c.innerText.toUpperCase();
  // el fondo NO cierra: clic fuera de la carta
  const fondo = c.parentElement;
  fondo.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  const sigue = !!document.querySelector('[data-testid=\"carta-deber\"]');
  return (misiones === 3 ? 'MISIONES-3✓' : 'MISIONES✗' + misiones) + '|' + (botones === 1 ? 'UNICO-BOTON✓' : 'BOTONES✗' + botones) + '|' + (T.includes('LA CARTA DEL DEBER') ? 'TITULO✓' : 'TITULO✗') + '|' + (sigue ? 'FONDO-NO-CIERRA✓' : 'FONDO-CIERRA✗');
})()" 2>/dev/null | tr -d '"')
echo "carta-obligatoria: $CARTA"
agent-browser screenshot /tmp/render/qa365-carta.png >/dev/null 2>&1
agent-browser eval "(() => { const b = document.querySelector('[data-testid=\"carta-boton\"]'); if (b) b.click(); return 'cerrada'; })()" >/dev/null 2>&1
sleep 1
SELLO=$(agent-browser eval "(() => {
  const fuera = !document.querySelector('[data-testid=\"carta-deber\"]');
  const badge = document.querySelector('[data-testid=\"catedra-incompleto\"]');
  return (fuera ? 'CIERRE-EXPLICITO✓' : 'SIGUE-ABIERTA✗') + '|' + (badge && badge.innerText.includes('A MEDIAS') ? 'SELLO-CATEDRA✓' : 'SELLO✗');
})()" 2>/dev/null | tr -d '"')
echo "cierre: $SELLO"
agent-browser eval "(() => { const b = document.querySelector('[data-testid=\"catedra-incompleto\"]'); if (b) b.click(); return 'fea'; })()" >/dev/null 2>&1
sleep 1
FEA=$(agent-browser eval "(() => {
  const c = document.querySelector('[data-testid=\"carta-deber\"]');
  const sello = document.querySelector('[data-testid=\"carta-sello\"]');
  const estado = document.querySelector('[data-testid=\"carta-estado\"]');
  return (c && c.className.includes('border-red-hud') ? 'VESTIDA-ROJO✓' : 'VESTIDA✗') + '|' + (sello && sello.innerText.includes('INCOMPLETO') ? 'SELLO-INCOMPLETO✓' : 'SELLO✗') + '|' + (estado && estado.innerText.includes('Te fuiste a medias') ? 'MENSAJE-FEO✓' : 'MENSAJE✗');
})()" 2>/dev/null | tr -d '"')
echo "carta-fea: $FEA"
agent-browser screenshot /tmp/render/qa365-carta-fea.png >/dev/null 2>&1
agent-browser eval "(() => { const b = document.querySelector('[data-testid=\"carta-boton\"]'); if (b) b.click(); return 'cerrada'; })()" >/dev/null 2>&1
sleep 1

echo "── D) LA CÁTEDRA: saludo por nivel, misiones marcadas al lado ──"
CATEDRA=$(agent-browser eval "(() => {
  const T = document.body.innerText;
  const TU = T.toUpperCase();
  const misiones = document.querySelectorAll('[data-testid=\"catedra-mision\"]').length;
  const progresos = document.querySelectorAll('[data-testid=\"catedra-progreso\"]').length;
  const registro = document.querySelector('[data-testid=\"catedra-registro\"]');
  const saludo = document.querySelector('[data-testid=\"biblio-saludo\"]');
  const brA = T.includes('Aprendiz del archivo') || T.includes('Analista') || T.includes('Jefe de expedientes') || T.includes('Catedrático del tablero');
  const puertaCarta = document.querySelector('[data-testid=\"carta-abrir\"]');
  return (TU.includes('APRENDE POR PUNTOS') ? 'PUNTOS✓' : 'PUNTOS✗') + '|' + (brA ? 'SALUDO✓' : 'SALUDO✗') + '|' + (saludo ? 'HABLA✓' : 'HABLA✗') + '|' + (misiones === 3 ? 'MISIONES-3✓' : 'MISIONES✗' + misiones) + '|' + (progresos === 3 ? 'AL-LADO✓' : 'AL-LADO✗' + progresos) + '|' + (registro && registro.innerText.includes('EL REGISTRO') ? 'REGISTRO✓' : 'REGISTRO✗') + '|' + (TU.includes('EL EXAMEN DEL DÍA') ? 'EXAMEN-ZONA✓' : 'EXAMEN✗') + '|' + (puertaCarta ? 'PUERTA-CARTA✓' : 'PUERTA✗');
})()" 2>/dev/null | tr -d '"')
echo "cátedra: $CATEDRA"

echo "── E) BUSCAR → FICHA ELEGANTE (España 1978) ──"
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
  return (f ? 'MODAL✓' : 'MODAL✗') + '|' + (f && f.innerText.includes('FORMA DE GOBIERNO') ? 'GOBIERNO✓' : 'GOBIERNO✗') + '|' + (f && f.innerText.includes('MANDATO') ? 'MANDATO✓' : 'MANDATO✗') + '|' + (T.includes('FICHA NUEVA EN TU EXPEDIENTE') ? 'XP-TOAST✓' : 'XP-TOAST✗');
})()" 2>/dev/null | tr -d '"')
echo "ficha: $FICHA"
agent-browser eval "(() => { document.querySelector('[aria-label=\"Cerrar ficha\"]')?.click(); return 'cerrado'; })()" >/dev/null 2>&1
sleep 1
agent-browser eval "(() => { const i = document.querySelector('[data-testid=\"biblio-buscar\"]'); if (i) { const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; setter.call(i, ''); i.dispatchEvent(new Event('input', { bubbles: true })); } return 'limpio'; })()" >/dev/null 2>&1
sleep 1

echo "── F) EL ARSENAL: 44 dossiers, 9 familias, consecuencias no recetas ──"
agent-browser eval "(() => { const b = document.querySelector('[data-testid=\"biblio-sala-arsenal\"]'); if (b) b.click(); return 'arsenal'; })()" >/dev/null 2>&1
sleep 2
ARSENAL=$(agent-browser eval "(() => {
  const cartas = document.querySelectorAll('[data-testid=\"biblio-carta\"]').length;
  const T = document.body.innerText.toUpperCase();
  return (cartas === 44 ? 'DOSSIERS-44✓' : 'DOSSIERS✗' + cartas) + '|' + (T.includes('ARCHIVO ESCOLAR: CONSECUENCIAS, NO RECETAS') ? 'REGLA✓' : 'REGLA✗') + '|' + (T.includes('NUCLEAR') && T.includes('DRONES') && T.includes('CIBERNÉTICA') ? 'FAMILIAS✓' : 'FAMILIAS✗');
})()" 2>/dev/null | tr -d '"')
echo "arsenal: $ARSENAL"
agent-browser eval "(() => {
  const i = document.querySelector('[data-testid=\"biblio-buscar\"]');
  if (!i) return 'sin-buscar';
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(i, 'Manhattan');
  i.dispatchEvent(new Event('input', { bubbles: true }));
  return 'buscado';
})()" >/dev/null 2>&1
sleep 1.5
MANHATTAN=$(agent-browser eval "(() => {
  const cartas = document.querySelectorAll('[data-testid=\"biblio-carta\"]').length;
  return (cartas === 1 ? 'PROYECTO-1✓' : 'PROYECTO✗' + cartas);
})()" 2>/dev/null | tr -d '"')
echo "buscar-Manhattan: $MANHATTAN"
agent-browser eval "(() => { const c = document.querySelector('[data-testid=\"biblio-carta\"]'); if (c) c.click(); return 'ficha'; })()" >/dev/null 2>&1
sleep 1.5
FICHAARMA=$(agent-browser eval "(() => {
  const f = document.querySelector('[data-testid=\"biblio-ficha\"]');
  const T = document.body.innerText;
  return (f ? 'MODAL✓' : 'MODAL✗') + '|' + (f && f.innerText.includes('POR QUÉ CAMBIÓ EL MUNDO') ? 'PORQUE✓' : 'PORQUE✗') + '|' + (f && f.innerText.includes('DOSSIER ESCOLAR') ? 'ESCOLAR✓' : 'ESCOLAR✗') + '|' + (f && f.innerText.includes('NOTA HONESTA') ? 'HONESTA✓' : 'HONESTA✗') + '|' + (T.includes('FICHA NUEVA EN TU EXPEDIENTE') ? 'XP-TOAST✓' : 'XP-TOAST✗');
})()" 2>/dev/null | tr -d '"')
echo "ficha-arsenal: $FICHAARMA"
agent-browser screenshot /tmp/render/qa365-ficha-arsenal.png >/dev/null 2>&1
agent-browser eval "(() => { document.querySelector('[aria-label=\"Cerrar ficha\"]')?.click(); return 'cerrado'; })()" >/dev/null 2>&1
sleep 1
agent-browser eval "(() => { const i = document.querySelector('[data-testid=\"biblio-buscar\"]'); if (i) { const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; setter.call(i, ''); i.dispatchEvent(new Event('input', { bubbles: true })); } return 'limpio'; })()" >/dev/null 2>&1
sleep 1
agent-browser eval "(() => {
  const chips = Array.from(document.querySelectorAll('button')).filter(b => b.offsetParent !== null && b.innerText.trim() === 'NUCLEAR');
  if (chips[0]) chips[0].click();
  return 'filtro';
})()" >/dev/null 2>&1
sleep 1.5
NUCLEAR=$(agent-browser eval "(() => {
  const cartas = document.querySelectorAll('[data-testid=\"biblio-carta\"]').length;
  return (cartas === 8 ? 'NUCLEAR-8✓' : 'NUCLEAR✗' + cartas);
})()" 2>/dev/null | tr -d '"')
echo "filtro-nuclear: $NUCLEAR"
agent-browser eval "(() => {
  const chips = Array.from(document.querySelectorAll('button')).filter(b => b.offsetParent !== null && b.innerText.trim() === 'TODAS');
  if (chips[0]) chips[0].click();
  return 'reset';
})()" >/dev/null 2>&1
sleep 1

echo "── G) EL EXAMEN DEL DÍA: 6 preguntas giradas con el reloj ──"
agent-browser eval "(() => { const b = document.querySelector('[data-testid=\"biblio-examen\"]'); if (b) b.click(); return 'examen'; })()" >/dev/null 2>&1
sleep 1
PREGUNTAS=$(agent-browser eval "(() => {
  const ps = document.querySelectorAll('[data-testid=\"examen-pregunta\"]').length;
  const ops = document.querySelectorAll('[data-testid=\"examen-opcion\"]').length;
  return (ps === 6 ? 'PREGUNTAS-6✓' : 'PREGUNTAS✗' + ps) + '|' + (ops === 24 ? 'OPCIONES-24✓' : 'OPCIONES✗' + ops);
})()" 2>/dev/null | tr -d '"')
echo "examen: $PREGUNTAS"
agent-browser eval "(() => { const o = document.querySelector('[data-testid=\"examen-opcion\"]'); if (o) o.click(); return 'respondida'; })()" >/dev/null 2>&1
sleep 1
VEREDICTO=$(agent-browser eval "(() => {
  const T = document.body.innerText;
  return (T.includes('Estúdiala en:') ? 'PISTA✓' : 'PISTA✗') + '|' + (T.includes('+5 XP · ACIERTO') || T.includes('Fallaste — la cátedra marca la pista') ? 'VEREDICTO✓' : 'VEREDICTO✗');
})()" 2>/dev/null | tr -d '"')
echo "veredicto: $VEREDICTO"

echo "── H) LA SALA SECRETA: intacta bajo el mismo techo ──"
agent-browser eval "(() => { const b = document.querySelector('[data-testid=\"biblio-sala-secreta\"]'); if (b) b.click(); return 'secreta'; })()" >/dev/null 2>&1
sleep 2
SECRETA=$(agent-browser eval "(() => {
  const T = document.body.innerText.toUpperCase();
  return (T.includes('BIBLIOTECA SECRETA') ? 'SECRETA✓' : 'SECRETA✗') + '|' + (T.includes('DOCUMENTO DEL DÍA') ? 'ANILLO✓' : 'ANILLO✗');
})()" 2>/dev/null | tr -d '"')
echo "secreta: $SECRETA"
agent-browser screenshot /tmp/render/qa365-secreta.png >/dev/null 2>&1

echo "── I) LA CARTA VUELVE FEA AL RE-ENTRAR (panel remonta) ──"
agent-browser eval "(() => { localStorage.setItem('vanguard-lang-v1', JSON.stringify({state:{lang:'es',autoDetected:false},version:0})); return 'es'; })()" >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 6
despertar
irPestana "ARCHIVO" "GRAN BIBLIOTECA"
VUELVE=$(agent-browser eval "(() => {
  const c = document.querySelector('[data-testid=\"carta-deber\"]');
  const sello = document.querySelector('[data-testid=\"carta-sello\"]');
  return (c ? 'REABRE-SOLA✓' : 'NO-REABRE✗') + '|' + (sello && sello.innerText.includes('INCOMPLETO') ? 'SELLO-FEO✓' : 'SELLO✗');
})()" 2>/dev/null | tr -d '"')
echo "vuelve-fea: $VUELVE"
agent-browser eval "(() => { const b = document.querySelector('[data-testid=\"carta-boton\"]'); if (b) b.click(); return 'cerrada'; })()" >/dev/null 2>&1
sleep 1

echo "── J) MÓVIL 390: la biblioteca sin desbordes ──"
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
agent-browser screenshot /tmp/render/qa365-movil.png >/dev/null 2>&1

echo "── K) HIGIENE: consola, errores, zombis, canon ──"
CONSOLA=$(agent-browser console 2>/dev/null | rg -i "error" | rg -v "401|429|favicon|3640|websocket|socket" | head -3)
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
echo "QA-V365 FIN"

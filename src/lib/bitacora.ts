// ============================================================
// v110.0 MATRIZ 2100 — BITÁCORA DE VANGUARD
// "Configura las secciones ACTUALIZACIONES que nunca se pusieron"
// — RESUELTO: registro oficial y honesto de la evolución del
// sistema, de la era 1800 a la MATRIZ 2100. Fuente: historial
// real de despliegues. Se pinta en CAMBIOS y en AYUDA.
// v111.0 MÁQUINA DEL TIEMPO — la bitácora se ALIMENTA SOLA:
// version.ts es la fuente única; si la versión en marcha no
// tiene entrada, bitacoraViva() la antepone automáticamente
// (ningún release volverá a ser invisible en la bitácora).
// ============================================================

import { APP_VERSION, APP_CODENAME } from "@/lib/version";

export interface EntradaBitacora {
  version: string;
  nombre: string;
  hitos: string[];
  /** etiqueta de familia para el color */
  tipo: "nav" | "musica" | "mundo" | "ia" | "tecno" | "reten" | "luxe";
}

export const BITACORA: EntradaBitacora[] = [
  {
    version: "v145.2",
    nombre: "VUELO LIBRE · MODALES HOLO",
    tipo: "tecno",
    hitos: [
      "P3 DEL AGENTE DE PROMPTS: los modales Radix (CUENTA, AJUSTES y BITÁCORA) entran al holograma — DialogContent acepta contenedor y Dialog.Portal los nace DENTRO de la ventana proyectada: el overlay oscurece SOLO el cristal y el formulario flota centrado en el espacio, con foco atrapado y Esc funcionando dentro del CSS3D",
    ],
  },
  {
    version: "v145.1",
    nombre: "VUELO LIBRE · WIDGETS",
    tipo: "tecno",
    hitos: [
      "LOS WIDGETS ENTRAN AL UNIVERSO (P2 del agente de prompts): la RADIO VANGUARD+ y el ESTADO DEL ENLACE dejan de ser capas DOM fijas — viven como MINI-PANTALLAS holográficas CSS3D clavadas en las esquinas del plano de mando (izquierda el enlace, derecha la radio), escalan con el frustum y siguen a la cámara en cada vuelo",
      "El truco: el host transformado es el CONTAINING BLOCK de los position:fixed internos — el widget ancla a SU esquina dentro del host y el host flota en el espacio. NINGÚN backdrop-filter dentro de la capa (lección v144 aplicada a los widgets)",
    ],
  },
  {
    version: "v145.0",
    nombre: "VUELO LIBRE",
    tipo: "tecno",
    hitos: [
      "EL PILOTO TOMA EL MANDO: la cámara obedece AL USUARIO — WASD/flechas vuelan adelante/atrás y a los lados, Q/E suben y bajan, Shift da turbo, la RUEDA (y el pinza en móvil) acercan y alejan, y ARRASTRAR con el dedo o el ratón gira la mirada libremente por todo el universo. Inercia de nave real: la velocidad llega y se va suave (lerp exponencial), y los límites son honestos — la cámara JAMÁS atraviesa el planeta ni abandona el universo",
      "TAP VS DRAG INTELIGENTE: los portales, títulos 3D y marcadores ahora se ejecutan en el ALZADO del toque SOLO si no hubo arrastre — mirar alrededor nunca dispara vuelos accidentales. El gesto cancelado no ejecuta nada",
      "LA VENTANA HOLO: el MENÚ VANGUARD y la BÚSQUEDA dejan de ser capas planas fijas al viewport — se PROYECTAN como un holograma que SALE DE LA PANTALLA: una pantalla CSS3D con marco remachado, filo cian/dorado y barrera de escaneo, acoplada a la cámara con su yaw de consola y su clank de acople. El contenido es DOM real portado (React portal): clicable, scrollable y en los 8 idiomas — y al cambiar de menú a búsqueda la MISMA ventana se conserva",
      "TIPOGRAFÍA FUTURISTA REAL: adiós helvetiker — las letras 3D de TODO Vanguard (logo, títulos de mundos, portales, puente, entrada) nacen de RAJDHANI BOLD convertida al formato typeface (converter propio: TTF→typeface.json con opentype.js): angular, condensada, HUD militar — cero caricatura. Metal más frío (metalness 0.86) y FILO DE NEÓN: el logo y los títulos llevan aristas luminosas EdgesGeometry",
      "HOLOGRAMA VIVO: el HAZ DEL PROYECTOR — un cono de luz volumétrico aditivo nace bajo la cápsula de contenido y la SOSTIENE en el aire (late con el tiempo); las letras holográficas PARPADEAN como proyección real (emissiveIntensity oscila, sin tocar opacidades animadas); cada placa del puente PULSA hacia el piloto (respiración en Z) — el holograma sale de la pantalla",
      "Móvil 390px verificado: puente compacto (INICIO/+/MENU), cápsula al 92%, ventana holo al 97% del cuadro, pinza de dos dedos = dolly + deslizar — el vuelo libre funciona con dedos",
    ],
  },
  {
    version: "v144.0",
    nombre: "HOLOGRAMA TOTAL",
    tipo: "tecno",
    hitos: [
      "EL CHROME PLANO MUERE: la cabecera HUD, la franja de pestañas y el pie de la Casa dejan de ser DOM — ahora viven DENTRO del universo como EL PUENTE DE MANDO, una consola holográfica acoplada a la cámara con PLACAS 3D reales (marco metálico + filos de neón + LETRAS EXTRUIDAS individuales por placa). Cada pestaña abierta es una placa que respira, se enciende con el color de su sección, se toca con raycast (hover = la placa crece y susurra) y se cierra con su × 3D propio",
      "MANDOS DEL PUENTE: + (nueva pestaña), BUSCAR, MENU, CUENTA y AJUSTES son placas 3D con letras de volumen real — nada de botones planos. El MINI LOGO VANGUARD (8 letras de oro extruido) corona el puente en escritorio; en móvil el puente se compacta (pestaña activa + + + MENU) y el pie 3D se apaga para dejar la consola de vuelo limpia",
      "EL PIE Y LA ENTRADA EN 3D: el pie de la Casa (sistema vivo · versión · atajos) son letras 3D en las esquinas; el TAGLINE de la entrada («El mundo no espera. Tú tampoco.») nace LETRA A LETRA en volumen 3D bajo el planeta y la placa ENTRAR («TOCA EL GLOBO PARA ENTRAR») es una placa 3D raycasteable — el DOM de la entrada queda dormido (html[data-holo])",
      "EL RAIL DEL ESTADO: la franja viva (StatsTicker + LiveTitle) vive DENTRO del mundo como tira holográfica CSS3D acoplada a la cámara bajo el puente — cristal oscuro, filo dorado y respiración con el warp. El TÍTULO DE LA PÁGINA también es holograma: pulsa con marcos de esquina animados (document.title vivo)",
      "MODO MUNDO EN 3D PURO: la UI del modo (SALIR DEL MUNDO + hint de portales) son placas y letras 3D en el espacio — el único residuo DOM visible queda en cero. Todo el puente obedece a los 8 idiomas de la Casa (etiquetas via vg:holo-etiquetas) y muere/renace limpio con el mundo WebGL (data-holo se quita, el chrome plano resucita en el fallback sin WebGL)",
    ],
  },
  {
    version: "v143.0",
    nombre: "LA CASA EN EL MUNDO",
    tipo: "tecno",
    hitos: [
      "EL ÚLTIMO PLANO 2D CAE: las salas de la Casa dejan de ser una capa DOM encima del universo — VIVEN DENTRO de él. Una CÁPSULA holográfica (CSS3DRenderer: DOM real proyectado con matriz 3D real) se ACOPLA a la ancla de la zona donde aterriza la cámara: posición real en el espacio, escala real con la distancia (fracción fija del frustum en cualquier zona y pantalla), orientación paralela al piloto (cero skew, lectura perfecta). El contenido es el MISMO árbol de siempre (REGLA 1: cero features borrados) — portal React hacia la cápsula; sin WebGL, el mismo árbol vive en el main plano",
      "LA CONSOLA DE VUELO: la navbar de zonas (HOY · ANÁLISIS · ARENA · CUARTEL · MUNDO) también flota EN EL ESPACIO — CSS3D acoplada a la cámara, respira con el FOV del warp (se hincha en el hipervuelo) y siempre queda al fondo del cuadro. El DOM fijo antiguo solo queda para el fallback sin WebGL",
      "VUELOS DE CÁPSULA: al despegar la pantalla se DESACOPLA (fade 0.42s) mientras la cámara vuela; al aterrizar, el FRENO suena y la cápsula NACE en la ancla nueva (scale 0.9→1, easeOut 620ms). En MODO MUNDO la cápsula se apaga y el universo queda desnudo; al tocar un portal, aterriza con su sala ya dentro. El reencuentro (recarga) acopla AL INSTANTE en la zona de la sala — la Casa vive en su zona desde el primer fotograma",
      "LA PANTALLA ES UNA PANTALLA: scroll propio con overscroll contain (cada sala aterriza leída desde arriba), esquinas de enganche militar, marco holográfico con filo cian, y los planos vivos de la Casa (diorama/cuna/flotador) siguen meciéndose DENTRO del espacio 3D real — doble capa de vida sin romper el 60 FPS (un solo rAF para mundo WebGL + proyección CSS)",
      "QA DE HIERRO EN PRODUCCIÓN: entrada AAA completa → toque al globo → cápsula acoplada con la portada; vuelos a las 4 zonas con su sala dentro (Crisis en el Command Center con globo wireframe al lado, Arena dorada, Cuartel azul); MODO MUNDO desnudo + portal ARENA tocado desde él → aterriza con Arcade Pack; móvil 390px con la cápsula al 92% del frustum; scroll dentro de la pantalla verificado; cero errores de consola; build limpio",
    ],
  },
  {
    version: "v140.0",
    nombre: "MUNDO WEBGL",
    tipo: "tecno",
    hitos: [
      "EL MOD DE VIDEOJUEGO: Vanguard ya no es una web con secciones — es UN MUNDO THREE.JS PERMANENTE (espacio + Tierra girando + estrellas) donde la navegación es VUELO DE CÁMARA entre 5 zonas fijas: ZONA 0 el espacio (entrada, z=8), ZONA 1 el globo/HOY (0,0,4), ZONA 2 el COMMAND CENTER de análisis (−3,2,3 → sala crisis), ZONA 3 la ARENA dorada de juego (3,−2,3 → arcade) y ZONA 4 el CUARTEL azul personal (−4,0,3 → perfil). El contenido de la Casa no se tocó (REGLA 1: cero features borrados) — solo cambió DÓNDE vive: cada sala llega cuando la cámara aterriza en su zona",
      "REGLAS DEL VUELO: cámara SIEMPRE suave (tween propio power2.inOut 1.2s — GSAP casero, cero dependencias nuevas), el usuario VE el viaje (fov punch 50→57° + estrellas ×2.1 + overlay de hipervelocidad radial durante el vuelo), el contenido espera en su zona (AnimatePresence existente hace el fade), y el globo JAMÁS deja de existir: siempre visible, girando (0.05 rad/s) y respirando (escala ±0.6%) en las 5 zonas — grande y central en 0/1, pequeño al fondo en 2/3/4",
      "LA ENTRADA AAA (segundo a segundo): pantalla negra → las estrellas nacen en grupos como ojos que se adaptan (1s) → el globo SUBE desde fuera del borde inferior con su brillo azul de atmósfera fresnel (2s) → los marcadores de conflicto se encienden UNO POR UNO del menos al más grave con destello, y el último (el más grave) lanza una ONDA EXPANSIVA (3.2s) → el logo VANGUARD aparece letra a letra con micro-glitch cian/magenta (4.4s) → typewriter «El mundo no espera. Tú tampoco.» (5.4s) → «Toca el globo para entrar» pulsante + el globo late invitando (6.4s). Tocar el globo: logo se funde, la cámara vuela a Zona 1, VANGUARD está abierto. Una vez por sesión (sessionStorage), y SIN WebGL la Casa cae a su intro cinematográfica v72 intacta",
      "LOS 15 MARCADORES SON REALES: salen de guerras-activas-data.ts (OSINT de la Casa) — los 6 teatros (Ucrania, Oriente, Sudán, Sahel, Myanmar, Taiwán) con su intensidad real pintando el color (ámbar→rojo sangre) + ciudades en el fuego (frente/sitio/contendida) hasta techo de 15. TOCAR UN CONFLICTO: el punto destella, popup mínimo junto al punto (nombre + intensidad + estado), la cámara vuela al COMMAND CENTER y la sala crisis abre ese contexto (evento vg:wgl-conflicto → handleTabChange completo con registro de pestañas)",
      "EL NAVBAR DE ZONAS: 4 íconos SIEMPRE visibles al fondo (HOY · ANÁLISIS · ARENA · CUARTEL) con glassmorphism, safe-area de móvil y glow del activo — tocarlos no cambia de página: VUELA la cámara. Sincronía bidireccional total: tab→vuelo (handleTabChange despacha vg:wgl-ir-a) y vuelo→tab (vg:wgl-zona). Los paneles se inclinan al CONTRARIO del vuelo (parallax --wgl-cx/cy desde la posición real de la cámara), la Arena se baña en oro y el Cuartel en azul (luces lerp + partículas de ambiente + tinte radial por zona)",
      "MÓVIL PRIMERO Y CONTRATO SAGRADO: raycast a nivel window (los paneles HTML jamás roban el mundo, el dedo golpea marcadores con proxy invisible ×3), calidad adaptativa (móvil: 1300 estrellas, esfera 48, sin antialias, pixelRatio 1.5), renderer pausado en hidden, un solo rAF para TODO el mundo, audio Web Audio mínimo honesto (ping/whoosh/onda, try/catch), reduced-motion apaga warp/glitch/pulso y salta la entrada, y sin internet el mundo funciona igual — los conflictos ya viven en la Casa",
    ],
  },
  {
    version: "v139.0",
    nombre: "3D BRUTAL",
    tipo: "tecno",
    hitos: [
      "EL 3D QUE NO PIDE PERMISO: el Dueño recargó dos veces y siguió sin ver 3D — autopsia final: en TÁCTIL no hay puntero (cero tilt) ni hover (cero pop-out), y una respiración de 22px no llega al ojo. LA CURA: el 3D se mueve SOLO — la CUNA hace que la sala entera se meza SIEMPRE (vaivén constante rotateX ±1.6° / rotateY ±3.2° / balanceo de 14px en Z, ciclo de 13s): con la pantalla quieta en la mesa, el mundo ya no está quieto jamás. Cuerpo preserve-3d nuevo entre diorama y flotador — tres planos anidados, cada uno con su animación",
      "EL HOLOGRAMA: el wordmark VANGUARD de la cabecera ya no es texto — GIRA SOLO (rotateY ±14° con perspectiva propia, ciclo de 7s) con DOS capas fantasma REALES detrás (::before/::after a translateZ −16px y −32px): al rotar, la extrusión se separa ante tus ojos — geometría, no sombra. Abajo, los títulos de TODAS las salas flotan en 3D constante (vg-flota-v139, perspectiva embebida en el transform — se ve incluso dentro del cristal backdrop-filter)",
      "CHISPAS AL FRENTE: nueva capa fija ENCIMA de toda la interfaz (z 44, sin puntero) — 12 motas de polvo holográfico cian/oro/magenta a la deriva con paralaje CONTRARIO al puntero, más un RAYO DE ESCANEO que barre la pantalla de arriba a abajo cada 11s: el futuro cruza ENTRE TÚ Y LA INTERFAZ en cualquier dispositivo, sin mover un dedo",
      "BOOSTS GORDOS: el vuelo de sala ahora parte de −640px CON inclinación de 14° (cada cambio de pestaña es una nave que se acerca — el móvil lo ve en cada toque), la respiración sube a 46px en ciclos de 7s, el tilt con mano llega a 11°/8.5°, y las tarjetas salen de la pantalla también AL TOCARLAS (:active translateZ 18px — feedback 3D en táctil)",
      "CONTRATO INTACTO: solo transform/opacity (60 FPS), todo bajo data-vg-3d y reduced-motion (cuna/holograma/flota/chispas se apagan limpio), calc solo con var × literal (lección Blink #1), y el wordmark perdió su truncate para no recortar las capas 3D (VANGUARD con tracking cabe en 360px)",
    ],
  },
  {
    version: "v138.0",
    nombre: "MUNDO VIVO",
    tipo: "tecno",
    hitos: [
      "LA AUTOPSIA DE LA INVISIBILIDAD: el Dueño dijo «aún no veo nada 3D» y tenía RAZÓN — la v137 inclinaba el diorama un MÁXIMO de 1.44° (0.6 de intensidad × 2.4° de coeficiente) y flotaba 4.8px: matemáticamente correcto, humanamente invisible (el ojo necesita >3° para percibir un giro). LA CURA: amplitud ×4 — rotateX hasta 6.5° y rotateY hasta 8° a intensidad plena (~4°/4.8° con la 60 por defecto), flotante constante 8→26px, y el PUNTO DE FUGA del escenario ahora PERSIGUE al puntero (±7%/±5%) — la habitación gira alrededor de donde miras",
      "EL FLOTADOR: la sala entera VUELA desde el fondo del escenario (translateZ −380px, con fundido) en CADA cambio de pestaña — el remount de AnimatePresence relanza la animación CSS sola — y después RESPIRA: se acerca 22px y se retira en ciclos de 9s (la Casa nunca está quieta ni un segundo). La cadena 3D se completó: panel-stagger y flotador llevan preserve-3d para que la profundidad proyecte contra la perspectiva de 1500px del escenario",
      "EL POP-OUT UNIVERSAL: las 447 tarjetas hud-panel de TODAS las salas SALEN DE LA PANTALLA al pasar el cursor — perspective(900px) propia + translateZ(46px) = +5.4% de tamaño REAL proyectado (no un truco de escala), brillo 1.08 y halo cian. Funciona hasta dentro del cristal backdrop-filter porque lleva su propia perspectiva embebida en el transform",
      "EL MUNDO BAJO LA CASA: capa fija z:-1 con tres planos — CIELO de dos campos estelares + nebulosas cian/magenta con deriva de 120s y paralaje CONTRARIO al puntero (el firmamento se desplaza opuesto a tu mano), HORIZONTE vivo donde el mundo se dobla (cian a estribor, magenta a babor, latiendo en 7s) y SUELO de rejilla holográfica en perspectiva real (rotateX 63°) RODANDO hacia ti en ciclos de 16s, huyendo del lado donde está tu mano. El cristal translúcido de los paneles ahora mira A TRAVÉS hacia un mundo infinito",
      "ACCESIBILIDAD Y PUERTAS: todo bajo data-vg-3d (on/off — la Tecnología 3D apagada esconde el mundo y congela el diorama), reduced-motion apaga entrada/respiración/pop/paralaje (el suelo queda quieto pero en perspectiva), calc solo con var × literal (lección Blink #1), y el mundo no captura puntero ni ancla fixed (capa hermana de la aurora)",
    ],
  },
  {
    version: "v137.0",
    nombre: "SALE DE LA PANTALLA",
    tipo: "tecno",
    hitos: [
      "LA ORDEN DEL DUEÑO, EN CLARO: «haz Vanguard 3D completamente, interactivo, que salga de la pantalla LITERALMENTE, que sea un mundo 3D de los conflictos mundiales» — ESTA ES LA RESPUESTA: EL DIORAMA. La Casa entera vive ahora dentro de una escena con perspectiva real (1500px) y los paneles del búnker son CUERPOS FLOTANTES: viven a 22px POR DELANTE de tu pantalla y el tablero completo se inclina hasta ~1.9° siguiendo tu mano (puntero o giroscopio — las vars del Motor3D, cero JS por frame, solo transform = 60 FPS). El panel que MIRAS se acerca otros 18px más hacia ti. La puerta data-vg-3d garantiza transform:none para quien tenga la Tecnología 3D apagada (ni containing blocks, ni regresiones de anclaje — la lección v135 convertida en arquitectura)",
      "LAS LETRAS SALEN DE LA PANTALLA LITERALMENTE: cada título de las 50+ salas (LetrasAnimadas) ahora VUELA desde 300px DEBAJO de tu pantalla — cada glifo viene desde el fondo, girando, creciendo y aterrizando en su sitio, letra a letra. La variante BRASA de los héroes vuela desde 340px. Con la perspectiva del h2 ya existente, el título literalmente SALE hacia ti en cada sala",
      "EL POP POR GLIFO SUBE DE NIVEL: la letra de los títulos 3D (v113) que miras viene hacia tu CARA — translateZ 16→26px + scale 1.09 + brillo de neón con halo (brightness 1.35 + drop-shadow del color propio); los bloques TituloLetras3D ya se inclinaban con tu puntero (Motor3D)",
      "TODAS LAS TRANSICIONES DE SALA VUELAN EN Z: los 6 estilos del dueño (deslizar · cine 3D · telón · oro · hiperespacio · disolver) ahora viajan en la TERCERA DIMENSIÓN — la sala nueva ENTRA desde 120-420px de profundidad (hiperespacio = el salto más largo) y la vieja se va PASANDO DE LARGO hacia ti (z positivo) al despedirse; con rotateX de llegada en el deslizar direccional v118",
      "LA INGENIERÍA INVISIBLE: framer-motion z + transformPerspective en los 6 variants; atributo data-vg-3d (on/off) escrito por el Motor3D como puerta del diorama; los 4 componentes con position:fixed (cámara de consecuencias, lector, buscador, menús del cromo) ya viven en portales al body (cura v135) — el diorama no los captura; reduced-motion apaga diorama, pop y vuelo",
    ],
  },
  {
    version: "v136.0",
    nombre: "PROFUNDIDAD TOTAL",
    tipo: "tecno",
    hitos: [
      "LA ORDEN DEL DUEÑO: «pon las letras en 3D» — y la Casa obedeció por SEGUNDA vez: la extrusión ya no es privilegio de los títulos. NACE EL SISTEMA NEXUS COMPLETO: .nexus-letra (títulos, ahora con FILO CROMÁTICO holográfico — la luz se descompone en los bordes: cian a estribor, magenta a babor), .nexus-letra-suave (micro-extrusión de 3 capas de vidrio para letra de 9-11px: se ve VOLUMEN sin sacrificar legibilidad), .nexus-num (los NÚMEROS del búnker salen de la pantalla, tabulares para que el cajeador no baile), .nexus-sub (subtítulos con una capa de cuerpo) y .nexus-tab/.nexus-btn3d (el HOVER SE LEVANTA EN Z — la pestaña y el botón salen un píxel hacia ti al enfocarlos; contrato 60 FPS: solo transform/filter, reduced-motion lo apaga)",
      "LA CROMO INTEGRA VOLUMEN: el wordmark VANGUARD del HUD ahora extruye (nexus-letra), las píldoras de monedas/gemas/racha son NÚMEROS EN VOLUMEN con lift al foco, el chip L{nivel} y el RANGO del agente llevan cuerpo, y las etiquetas Buscar / Menú / Sorpréndeme se levantan al pasar el cursor",
      "LA NAVEGACIÓN COMPLETA EN 3D: las pestañas de sección (la fila del cromo), los subtemas deslizables y los chips del drawer del menú — TODOS llevan ahora letra extruida que se LEVANTA EN Z al enfocar (el hover vive en el host porque framer-motion pisa el transform del botón: detalle de ingeniería que preserva la píldora deslizante v98 intacta)",
      "EL TRÁILER DE ESTRENO (v134) ahora proyecta sus letras con cuerpo: VANGUARD entra al aire con extrusión de 3 capas + halo doble",
      "los subtítulos de TODAS las salas (PanelHeader) y los metadatos del cromo duermen con profundidad de una capa — hasta lo pequeño tiene cuerpo ahora",
    ],
  },
  {
    version: "v135.0",
    nombre: "NEXUS-HYPNOS",
    tipo: "tecno",
    hitos: [
      "ADIOS AL PLANO DE 1990 (orden del Dueño: «Vanguard se aburrió, se ve plano viejo, que parezca una página del futuro con las letras como 3D»): TIPOGRAFÍA 3D GLOBAL — cada título de las 50+ salas (el PanelHeader que viste toda la Casa) ahora extruye VOLUMEN holográfico (.nexus-letra: pila de capas de vidrio en Z + halo de emisión, sobre el oro CAVIAR de v124); cero JS, cero imágenes, el futuro se escribe con CSS",
      "THE WAR ROOM AMBIENT — LA CASA RESPIRA CON EL PLANETA (módulo 1 de la transmisión NEXUS-HYPNOS): el nuevo MOTOR NEXUS (global en layout) lee el termómetro de tensión cada 12s y escribe html[data-tension] + --vg-tension; el CSS entero obedece — calma azul lenta → tensa ámbar → alta naranja (bordes que sudan, signos de vida acelerados) → CRÍTICA roja (rejilla de estática respirando sobre toda la señal + títulos en glitch RGB); cero re-render, puro CSS reaccionando",
      "EL SONIDO DEL BÚNKER (nuevo botón AudioLines en el HUD): sintetizador generativo 100% Web Audio — drone de sierras desafinadas con filtro que deriva, sub grave, ESTÁTICA DE SATELITE y una ESTACIÓN NUMÉRICA militar emitiendo códigos al fondo; TODO reacciona al pulso global (con la tensión el filtro se abre, la estática muerde y los códigos suenan más seguido); arranque solo con gesto del dueño del clic, preferencia recordada, apagado con desvanecimiento honesto",
      "EL EFECTO MARIPOSA EN LAS NOTICIAS (módulo 2 de la transmisión): cada cable real de la portada lleva ahora su botón [SIMULAR] — abre la CÁMARA DE CONSECUENCIAS, que acopla el cable a un escenario del LABORATORIO DEL DESTINO (el motor real de la casa: atrición de Lanchester, escalera de escalada 1-6, Monte Carlo de 24 semillas); eliges el escenario, la perturbación (¿y si cierran la clave? ¿y si hay refuerzos externos? ¿sanciones totales?), la dosis 1-5 y el horizonte 90/180/240 días — y la guerra corre día a día ante tus ojos: la línea de frente se mueve, los misiles vuelan en escalada alta, bajas y coste suben en vivo y el veredicto final llega con sus probabilidades; con su sello SIMULACIÓN · NO PREDICCIÓN",
      "EL ENJAMBRE DE OJOS (módulo 3 de la transmisión, en VISTA DIOS): una esfera de micro-pantallas orbitando en 3D real (3 anillos a velocidades distintas, el bloque se inclina con tu puntero, el Ojo central vigila) — cada pantalla es una transmisión interna de la Casa (feed del Mundo de Guerra + cables OSINT reales + directos observados; cero enlaces externos); POSA el cursor y el enjambre se congela, suena el BLIP DE INTERCEPCIÓN espacializado (nace del oído del lado de la pantalla) y la TRANSCRIPCIÓN DE INTERCEPCIÓN SATELITAL se descifra letra a letra",
      "LA CAZA DE ERRORES CONTINÚA: veredicto de la Cámara corregido a la API real del veredicto (riesgo/confianza), tipos verificados en los 4 módulos nuevos, contrato 60 FPS en TODO lo animado (solo transform/opacity), reduced-motion apaga el enjambre, el glitch y la estática",
    ],
  },
  {
    version: "v134.0",
    nombre: "EL ESTRENO",
    tipo: "luxe",
    hitos: [
      "EL TRÁILER DE CARGA (orden del Dueño: «una intro tipo tráiler cuando está cargando»): la Casa proyecta su estreno — 4.6 segundos de cine (el ojo de la Casa se abre → VANGUARD letra a letra → tres destellos: EL MUNDO, LA INTELIGENCIA, EL TIEMPO → «BIENVENIDO A LA CASA · ESTÁS DENTRO») con barra de progreso dorada, botón SALTAR siempre a la vista, campana de estreno y UNA proyección por sesión (el recurrente entra directo; reduced-motion no proyecta; 60 FPS: solo transform/opacity)",
      "EL MODO GUERRA HA MUERTO (orden del Dueño tras quedar atrapado: «elimina el modo ligero sin imágenes, se puso todo negro y no puedo salir»): el botón SignalLow del HUD, la lib (sus funciones de apagón), el bloque CSS que congelaba animaciones y oscurecía imágenes — TODO eliminado; y LA CURA queda instalada en el REHIDRATADOR: cada visitante atrapado carga libre (la llave vanguard-modo-guerra se expulsa y la clase se retira del <html>) — el filtro de contenido explícito sobrevive porque es otra cosa: protege sin censurar",
      "ADIOS A LOS PALITOS (orden del Dueño: «las ilustraciones no sean palitos, más detalladas con anchura y que se muevan»): las 8 ilustraciones procedurales re-dibujadas con CUERPO REAL — gradientes metálicos y atmosféricos (planeta con océanos y terminador, sonda con paneles de celdas, skyline en dos planos, torre de celosía, cohete con fuselaje y llama con cuerpo, cama con manta y almohada, micrófono de estudio, diamante facetado), resplandor de fondo + sombra de suelo en 3 planos y más habitantes animados — ATELIER, ATLAS, CAMA y COMUNIDAD heredan el lujo sin tocar una línea",
      "LA CIUDAD MÁS REAL (orden del Dueño: «ciudades más realista 3D, mejor cielo»): ventanas en REJILLA de verdad (filas × columnas deterministas, cada ventana despierta a su hora — torres de edificio, no puntos sueltos), CARA LATERAL VOLUMÉTRICA con arista iluminada del lado del sol (las torres tienen anchura), casetes de aire en azoteas, LA VÍA LÁCTEA cruzando la bóveda en noches limpias y EL RESPLANDOR DEL HORIZONTE encendiéndose donde vive el sol",
      "LA CAZA DE ERRORES LÍNEA A LÍNEA (orden del Dueño): barrido completo de tsc + eslint — cero errores de tipos, cero errores nuevos en los 7 ficheros tocados, y los 3 errores legacy de la MEGALÓPOLIS (setState síncrono en efectos) migrados al contrato rAF; el resto del baseline (patrones de corrección SSR de salas históricas) auditado y documentado",
    ],
  },
  {
    version: "v133.0",
    nombre: "EL ACABADO REAL",
    tipo: "luxe",
    hitos: [
      "LA CASA SE VISTE DE VERDAD (la Ley 2 deja el atelier y toma el palacio): elegir PLATINO NOCTURNO, OBSIDIANA, CHAMPÁN VIEJO, ORO ROSA o MARFIL REAL ahora REDIBUJA la casa entera — el oro del HUD, los marcos de las esquinas, los fondos y la línea de aurora obedecen al material elegido (globals.css redefine --hud-amber y las tres capas de cromo bajo html[data-acabado])",
      "LA FORJA A PRUEBA DE TIEMPO: el Motor del Lujo (v126) forjaba la serie ANTES de la rehidratación y la cerradura del storage (v132) descartaba el grabado — la serie de un visitante nuevo se regeneraba en cada visita; ahora el grabado espera su turno tras la rehidratación y la serie queda en placa UNA sola vez de verdad",
      "LA CAMPANA DEL SALÓN (Ley 2 · sonido): cambiar de material suena — la campana FM del salón (v124) tañe SOLO en el cambio de acabado, nunca en el arranque; el lujo que se oye al vestir la casa",
      "LA PLACA CON Nº DE UNIDAD (Ley 3 · escasez): la serie del HUD ahora luce la pieza numerada de la EDICIÓN LIMITADA vigente — «SERIE VG-XXXX-XXXX · Nº 0184/2500» con la edición de la estación real (equinoccios y solsticios) calculada una sola vez tras la hidratación (contrato anti-#418 respetado)",
      "LOS AGENTES DEJAN DE DECLARAR Y EMPIEZAN A LEER: EL ARCHIVISTA reporta la ÚLTIMA VERSIÓN REAL de la bitácora viva («bitácora al día · v133.0 «EL ACABADO REAL»») y EL CURADOR reporta las UNIDADES QUE QUEDAN del lote de la edición vigente — cada detalle de LOS AGENTES AUTÓNOMOS es ahora verificable",
      "LOS PULIDOS DEL CUERPO (sala CAMBIOS, sección nueva en vivo): la bitácora de la casa luce los pulidos autónomos de los cinco agentes con su sello de color, su hora y su detalle — lo que la Casa se hace sola, aquí queda escrito; como un gobierno, pero libre",
      "EL CUERPO YA NO DUERME EN SU SALA: el motor de los agentes (v131) solo latía cuando visitabas EL GOBIERNO LIBRE — ahora late en el LAYOUT RAÍZ (MotorAgentes) y pule la Casa en TODAS las salas desde el primer segundo, con guardia de instalación única (cero ciclos duplicados) y detenedor honesto",
      "EL RESIDUO DE v132 CAZADO: el store de los agentes (vg-agentes-libres-v131) era el ÚNICO persistido que se rehidrataba SÍNCRONO antes de React — la clase exacta del bug #418 viva en la única sala que se creía curada; ahora lleva skipHydration + cerradura + fila en el REHIDRATADOR como todos los demás",
    ],
  },
  {
    version: "v132.0",
    nombre: "LA GRAN AUDITORÍA",
    tipo: "tecno",
    hitos: [
      "LA GRAN AUDITORÍA (la orden del Dueño cumplida a fondo): «corrige todos los bugs, revisa todas las líneas, a veces no se actualiza» — auditoría completa de la cadena de registro (tab-nav ↔ página ↔ 8 idiomas ↔ regla-oro: 8 salas nuevas × 8 idiomas, todo íntegro), barrido de clases de bug (JSON.parse sin blindar: 0 tras revisar 10 candidatos; intervalos sin limpiar: 0) y prueba de comportamiento real sobre las 3 salas históricas (NOTICIAS, OJO DE DIOS, CÁMARAS): las tres vivas, botones RESPONDIENDO, /api/news sirviendo cables del día",
      "EL BUG RAÍZ CAZADO Y MUERTO: React error #418 (desajuste de hidratación) — los 7 stores persistidos (idioma, juego, lujo, retención, arquitecto, cama, perfil) se rehidrataban SÍNCRONAMENTE ANTES de que React hidratara: el servidor pintaba los valores por defecto y el cliente los guardados → parpadeo garantizado en cada visita recurrente, la firma exacta del «a veces no se actualiza». Ahora todos llevan skipHydration y EL REHIDRATADOR (nuevo, montado en el layout raíz) aplica lo guardado justo tras el montaje — cero desajuste posible, verificado en producción",
      "EL REHIDRATADOR: un componente mínimo y eterno en el layout — rehidrata los 7 stores tras la hidratación de React y luego respeta el idioma elegido a mano (v42) — la Casa carga limpio en cualquier idioma, en cualquier visita, con cualquier historial",
      "LA GUÍA DEL DUEÑO (promesa entregada): GUIA-PASO-A-PASO-PARA-DUENO.md — 7 capítulos en español humano: qué es GitHub sin palabras raras, las llaves del reino, EL PROMPT MAESTRO copiable para encargar la obra a cualquier IA del mundo, los 5 comandos que lo hacen todo, el PROTOCOLO DEL REY (4 sellos para verificar que una IA trabajó de verdad) y el botón rojo de emergencia",
      "LA CADENA QUEDA BLINDADA: v129 LA SALA DE GUERRA, v130 LOS ROSTROS DEL PODER y v131 EL GOBIERNO LIBRE verificadas en producción — el mando supremo, los 34 dossiers y los 5 agentes autónomos puliendo la Casa cada 30-120 segundos, todo respondiendo",
      "MÓVIL SIN COSTURAS: overflow horizontal cazado y corregido en las tres salas históricas a 390px — NOTICIAS (la fila LIVE·AUTO + filtros aprendió a envolver), OJO DE DIOS (min-w-0 en las celdas del escáner planetario: un título largo ya no expande la celda) y CÁMARAS limpia de fábrica — la Casa cae perfecta en cualquier bolsillo",
    ],
  },
  {
    version: "v131.0",
    nombre: "EL GOBIERNO LIBRE",
    tipo: "ia",
    hitos: [
      "EL GOBIERNO LIBRE (sala nueva en SISTEMA, primera pestaña): la respuesta a la orden del Dueño — «agrega agente que cada cierto tiempo hagan actualización o pulan Vanguard» — y el manifiesto hecho sala: Vanguard es como un gobierno, pero libre",
      "LOS AGENTES AUTÓNOMOS (motor real, no teatro): cinco agentes con ciclos verdaderos de setInterval — EL VIGÍA ronda la salud de la Casa cada 30 s (consulta /api/health y reporta la versión), EL EDITOR refresca el pulso del mundo cada 45 s (cuenta los cables de /api/news), EL CARTÓGRAFO re-alinea el mapa del poder cada 60 s, EL ARCHIVISTA ordena la bitácora cada 90 s y EL CURADOR viste la galería cada 120 s — con interruptor EN SERVICIO / EN PAUSA del Dueño",
      "EL PULIDO EN VIVO: bitácora de los agentes anotada al segundo — cada acción con su sello de color, su hora y su detalle verificable (salud OK · v131.0, N cables en la red, pulidos totales); la Casa se mantiene sola y lo demuestra",
      "LA CREDENCIAL EXCLUSIVA: el visitante recibe su número de serie único (VG-XXXX-XXXX), su fecha de emisión, sus visitas contadas una por sesión y su NIVEL DE DESPACHO que sube con cada llegada — OBSERVADOR → ANALISTA → OPERADOR → DIRECTOR → SOBERANO — con el sello del palacio girando en oro (v130-sello)",
      "EL PALACIO LIBRE: el manifiesto «como el gobierno, pero libre» — tabla comparativa gobierno clásico vs. gobierno libre (información, puerta, mantenimiento, precio) y los tres artículos eternos: todo libre, todo verificado, todo en vivo",
      "LA CADENA DE MANDO: EL DUEÑO (soberanía final: pausar el cuerpo, abrir salas), EL CUERPO (los cinco agentes con sus ciclos) y LA CONSTITUCIÓN (un gobierno que no esconde nada — la exclusividad de verdad)",
      "8 IDIOMAS: la sala se traduce a español, inglés, portugués, francés, alemán, italiano, ruso y chino — como todo lo que la Casa abre",
    ],
  },
  {
    version: "v130.0",
    nombre: "LOS ROSTROS DEL PODER",
    tipo: "nav",
    hitos: [
      "LOS ROSTROS DEL PODER (sala nueva en INTELIGENCIA): el dossier de las personas que mueven el planeta — la orden original del Dueño («toda la información de cada persona importante del mundo con sus ubicaciones») hecha colección fina de 34 expedientes",
      "LOS CUATRO CORTES: LOS TRONOS (12 jefes de Estado y monarcas, de la Casa Blanca a Ryongsong), EL DINERO (10 banqueros y magnates, de la Fed al Denny's donde nació NVIDIA), EL TRIBUNAL (6 organismos y cortes, de la ONU a la CPI de La Haya) y LOS NUEVOS (6 poderes del silicio, de OpenAI a ByteDance) — con filtros de corte y conteo en vivo",
      "EL MAPA DEL PODER: las 34 ubicaciones reales proyectadas (projectLatLng de la Casa) — el tamaño de cada punto es su índice de poder, el anillo dorado marca el expediente abierto, el punto encendido son señales vivas, y los tríos que comparten ciudad (Washington ×3, Nueva York ×2, San Francisco ×2, Pekín ×2) respiran con guiado anti-solape",
      "EL EXPEDIENTE ABIERTO: nombre, cargo, organización, sede física exacta, mandato, LA RUTA AL PODER contada sin maquillaje, rasgos de mando, LA GUARDIA (el aro de exclusividad que rodea a cada rostro), EL RELEVO (quién espera en la sombra), la frase que manda y las fichas del expediente — más el índice de poder de la Casa 0-100 con su barra",
      "LA JERARQUÍA: el top 10 del índice de poder — mando, presupuesto y alcance en una sola cifra, con salto directo al expediente tocado",
      "EL PULSO REAL: los cables auténticos de la Casa filtrados por las palabras de cada rostro (Trump busca White House, Powell busca Federal Reserve, Huang busca Nvidia…) — lectura interna, cero portales externos, refresco cada 5 minutos",
      "LA LEY DEL ACCESO: ABIERTO (como un gobierno, pero libre — esto en un gobierno real vive en un búnker), VERIFICADO (fuentes abiertas sin maquillaje) y VIVO (los rostros no posan: se vigilan)",
      "8 IDIOMAS: la sala se traduce a español, inglés, portugués, francés, alemán, italiano, ruso y chino — como todo lo que la Casa abre",
    ],
  },
  {
    version: "v129.0",
    nombre: "LA SALA DE GUERRA",
    tipo: "mundo",
    hitos: [
      "LA SALA DE GUERRA (sala nueva en INTELIGENCIA): el mega simulador del mando supremo — seis teatros del planeta (Ucrania, Oriente Medio, Sudán, Sahel, Myanmar y el estrecho de Taiwán como teatro observado) dentro de una sola sala, con sus banderas, su intensidad y su nivel de escalada",
      "EL TEATRO 3D: entrar y ver una guerra representada — mesa tridimensional con el terreno del país (llanura, urbano, desierto, sabana, selva o marítimo), ciudades con su estado real (capital, frente, sitio, ocupada…), humo sobre las que arden, frentes encendidos con luz de brasa, unidades con símbolos OTAN de ambos bandos, drones orbitando, misiles en arco parabólico y fogonazos de artillería — con velocidad 0.5x/1x/2x, pausa, modo noche y botón ENTRAR (pantalla completa)",
      "EL MAPA MAESTRO: esquema OSINT por teatro con retícula, zonas de control aproximadas de ambos bandos, frentes con dash que marcha, ciudades fichadas clicables con ficha propia (estado, nota y coordenadas), brújula y leyenda de estados",
      "FUERZAS ENFRENTADAS: barras comparadas de efectivos, tanques, artillería y aeronaves de los dos bandos, con sus apoyos externos — y EL BALANCE HUMANO: bajas y desplazados con honestidad radical (fuentes OCHA, ACLED, ACNUR, ISW) y la nota de por qué ninguna cifra es completa",
      "EL PULSO REAL: los cables auténticos de la Casa filtrados por las palabras de cada teatro (Ucrania busca Ucrania, Gaza busca Hamás, Taiwán busca TSMC…) — lectura interna, cero portales externos, refresco cada 5 minutos",
      "LA LÍNEA DEL TIEMPO y LA BOLSA DE GUERRA: los hitos que llevaron cada teatro hasta aquí, las cuotas de la casa por escenario (con la advertencia de siempre: Vanguard no predice, presenta) y el puente directo a BETNACIÓN y al LABORATORIO ¿Y SI...?",
      "8 IDIOMAS: la sala se traduce a español, inglés, portugués, francés, alemán, italiano, ruso y chino — como todo lo que la Casa abre",
    ],
  },
  {
    version: "v128.0",
    nombre: "LA RED MUNDIAL",
    tipo: "nav",
    hitos: [
      "LA RED MUNDIAL (sala nueva en INTELIGENCIA, hermana de LA COMUNIDAD): los 18 servicios de inteligencia del resto del planeta, de 12 naciones, abiertos como colección de expedientes finos — el MI6 y su tinta verde, el Mossad y su proverbio, el bloque ruso-chino, la continental y el Subcontinente",
      "EL MAPA DEL MUNDO: las 18 sedes reales proyectadas sobre el mapa de la Casa con pines numerados clicables — y los arcos del pacto UKUSA de 1946 cruzando el Atlántico hasta Washington, la terminal que une esta sala con los 18 ojos de LA COMUNIDAD",
      "LOS CINCO BLOQUES: la alianza de los Cinco Ojos (MI6 · MI5 · GCHQ · ASIS · CSIS · GCSB), el bloque ruso-chino (SVR · FSB · GRU · MSS), el Levante israelí (Mossad · Shabak · AMAN), la continental europea (DGSE · BND · CNI) y el Subcontinente (RAW · ISI) — índice con banderas y señales vivas",
      "EL EXPEDIENTE ABIERTO: fundación y linaje, sede, plantilla, dominio, lema (o su leyenda honesta cuando el silencio es la firma) y misión narrada de cada servicio — de Semper Occultus a la discreción como cortesía de reyes",
      "EL PULSO REAL: los cables auténticos de la Casa filtrados por el dominio de cada servicio (Mossad busca Mossad, GCHQ busca Bletchley, MI6 busca British Intelligence…) — lectura interna, cero portales externos, refresco cada 5 minutos",
      "EL PACTO: UKUSA 1946 explicado — 5 ojos, 9 y 14, y la segunda fila europea; y la sala hermana anunciada en LA COMUNIDAD: las dos orillas de la misma historia",
      "8 IDIOMAS: la sala se traduce a español, inglés, portugués, francés, alemán, italiano, ruso y chino — como todo lo que la Casa abre",
    ],
  },
  {
    version: "v127.0",
    nombre: "LA COMUNIDAD",
    tipo: "nav",
    hitos: [
      "LA COMUNIDAD (sala nueva en INTELIGENCIA): la Comunidad de Inteligencia de los Estados Unidos abierta como una colección de expedientes finos — 18 agencias oficiales bajo la ODNI, con su historia, su lema y su misión narrados como manda la Casa",
      "LA PIRÁMIDE: la corona (ODNI), el ojo exterior (CIA), las cuatro grandes del Pentágono (NSA · DIA · NGA · NRO), los cinco servicios armados, el escudo interno (FBI · DHS · Guardia Costera · DEA) y los ministerios (INR · OIA · OICI) — toca cualquier sigla y su expediente se abre con campana de salón",
      "EL CORREDOR: mapa real de sedes Washington · Virginia · Maryland con 16 puntos numerados clicables, el Potomac dibujado y la leyenda de expedientes — Langley, Fort Meade, Chantilly y el resto del vecindario más vigilado del planeta",
      "EL PULSO REAL: los cables auténticos que la Casa recibe ahora mismo, filtrados por el dominio de cada agencia (FBI busca FBI, FEMA huracanes, OICI lo nuclear…) — lectura interna en la sala de la Casa, cero portales externos, refresco cada 5 minutos",
      "LOS CINCO SENTIDOS: HUMINT, SIGINT, GEOINT, OSINT y FININT explicados como oficios — y la SALA ANEXA con DHS/FEMA, las manos que actúan tras los ojos",
      "EL ARREGLO DEL prisma:error: «Execute returned results» en SQLite — el helper asegurarTabla() pregunta primero a sqlite_master (canal de consulta) y solo crea lo que falta; 12 sentencias DDL en 9 rutas API corregidas y la primera visita en frío ya no se pierde",
      "8 IDIOMAS: la sala se traduce a español, inglés, portugués, francés, alemán, italiano, ruso y chino — como todo lo que la Casa abre",
    ],
  },
  {
    version: "v126.0",
    nombre: "LA CASA · ATELIER",
    tipo: "luxe",
    hitos: [
      "LAS CINCO LEYES DEL LUJO dictadas por el Dueño, ahora constitución de la Casa: espacio negativo, materia honesta, escasez verdadera, artesanía con nombre y una historia que contar",
      "EL ATELIER (sala nueva en SISTEMA): el armario de ACABADOS finos (Oro Caviar, Platino Nocturno, Obsidiana, Champán Viejo, Oro Rosa, Marfil Real) — tocas uno y la casa entera cambia de piel con su campana de salón",
      "EDICIONES LIMITADAS de verdad: una por estación del planeta (solsticios y equinoccios), 2500 piezas numeradas, barra de escasez y cuenta atrás real — tu unidad Nº queda reservada por tu serie",
      "LA PLACA DE SERIE: cada visitante recibe SU número único grabado (no se repite ni se vende), con grano propio y fecha de forja; vive también en la cabecera de la casa junto a la firma 3D",
      "MODO GALERÍA (Ley del espacio negativo): un interruptor retira avisos, franja de estadísticas, banderines y rivales en TODAS las salas — el aire se ensancha y queda solo la obra",
      "LA HISTORIA DE LA CASA: las eras (la primera forja, las 158 salas, la lección de caviar, las cinco leyes), las horas de taller contadas desde la bitácora real y la firma del fundador",
      "MATERIALES EN CSS: texturas de oro pulido, metal cepillado, vidrio volcánico, satinado, grano artesanal y mate profundo + brillo de luz que barre la tarjeta al pasar (solo transform/opacity, 60 FPS)",
    ],
  },
  {
    version: "v125.0",
    nombre: "CORRECCIÓN TOTAL",
    tipo: "tecno",
    hitos: [
      "EL BUG MÁS VIEJO DE LA CAÍDO: la hidratación fallaba en CADA visita fresca — IlustracionViva firmaba sus gradientes SVG con Math.random() (servidor y cliente tiraban sufijos distintos) y las escenas 3D escribían floats de precisión completa (83.29604581548776px) que React redondeaba distinto a cada lado. Ahora: useId() para los gradientes y cuantizador q2() en TODO valor que entra a un estilo — cero errores de hidratación verificado en cargas frescas",
      "BOTONES REVIVIDOS: durante la recuperación del error de hidratación la casa entera quedaba sorda — clics muertos, secciones que no respondían al primer toque. Con la hidratación limpia, los 1415 botones responden al primer intento",
      "RESOLUTOR DE SALAS: 10 de las 16 salas del mega-menú (juego, inteligencia, mercado, archivo, comando, emisora, oscsuro, creadores, social y sistema) quedaban con el PANEL VACÍO si llegaba su clave de sección por swipe de borde o navegación programática — ahora handleTabChange resuelve cada clave de sala a su primera pestaña real. Barrido completo: 158 pestañas, cero paneles vacíos",
      "LEY CONTRA LA PÁGINA VIEJA: el HTML de la app se sirve ahora con no-cache/no-store — el navegador y cualquier gateway ya NUNCA muestran una versión caducada (la causa «a veces no se actualiza»), mientras los assets /_next/static conservan su caché inmutable",
      "PEAK DE PRESENCIA ARREGLADO: /api/presence usaba GREATEST() (función que SQLite no tiene) y el récord global de guerreros en línea nunca se actualizaba — sustituido por MAX() nativo",
      "PURGA DE ZOMBIS: múltiples servidores de desarrollo competían por el puerto y servían código viejo desde la caché de Turbopack — purga completa de .next y proceso único limpio (2.1 GB → 384 MB de RAM)",
      "QA EN VIVO: barrido de las 158 salas con cero paneles vacíos, cero errores de consola; noticias reales cargando, bono diario, cámaras, GOD VIEW, ATLAS, LA CAMA y la radio verificados clic a clic",
    ],
  },
  {
    version: "v124.0",
    nombre: "CAVIAR",
    tipo: "nav",
    hitos: [
      "LA CASA SE VISTE DE ALTA CLASE: la paleta completa pasa del neón frío a la sala de lujo — noir cálido de terciopelo, marfil, ORO #E8C56A como acento de la casa, champán en lugar del azul eléctrico y esmeralda fina en lugar del verde neón (279 sustituciones en 59 archivos, la crisis sigue siendo roja)",
      "TIPOGRAFÍA DE COLECCIÓN: los títulos de TODAS las salas y el wordmark del HUD van ahora en la serif caviar (Didot · Bodoni · Playfair · Georgia) con ORO EN CADA GLIFO — gradiente champán→oro→bronce por letra",
      "EL TELÓN DE ORO, el 6º estilo de viaje: telas de terciopelo noir con bastilla de oro brillante, costura dorada donde se encuentran y polvo de oro cayendo — y es el nuevo viaje POR DEFECTO de toda la casa (migración de lujo única que conserva tus visitas, favoritos y color)",
      "LA CAMPANA DEL SALÓN: entrar a una sala ya no suena a madera sino a lujo — dos notas de campana (Si5→Mi6, quinta justa) con cola de sala larga en cada cambio de sección",
      "SALÓN CAVIAR, la obra del lounge de la élite: 58 BPM en Fa con séptimas (Fmaj7·Dm7·Bbmaj7·C7), piano de cristal, contrabajo de terciopelo, shaker y swing — la RADIO la programa en la sala SOCIAL y puedes pedir-la en COLECCIÓN",
      "VANGUARD 3D EN ORO: las letras volumétricas de la portada pasan de material brasa a material ORO — la ciudad vive bajo un rótulo de lingote",
      "EL CRISTAL DE LA CASA: hud-panel y glass con veta cálida de terciopelo, rejilla tejida en oro, hilatura dorada en cada borde, selección y foco en oro — hasta el escáner CRT se apacigua para la sala de lujo",
    ],
  },
  {
    version: "v123.0",
    nombre: "GLORIA ETERNA",
    tipo: "musica",
    hitos: [
      "LA ORQUESTA ÉPICA NACE: cinco voces nuevas sintetizadas de cero — TIMBAL afinado al acorde, CORO CELESTIAL que canta \"aah\" con formantes humanos, PLATILLO con cola dorada, TROMPETA HEROICA y ARPA de glissando — todo 100% Web Audio, cero muestras, cero copyright para siempre",
      "GLORIA ETERNA, el himno de la casa: 72 BPM en Re menor que asciende a un clímax de coro, timbales y trompetas con platillo — la portada ahora se abre con el himno épico de Vanguard",
      "EL MOTIVO GLORIA, la firma reconocible en 3 notas: raíz·raíz·raíz→octava→5ª compartida por las 5 obras nuevas — GLORIA ETERNA, MARCHA DEL TRIUNFO, CORO DE LOS HÉROES, SERENIDAD DORADA y NOCHE DE ESTRELLAS son de la misma sangre",
      "MARCHA DEL TRIUNFO: trompetas victoriosas y tambores de desfile a 100 BPM — la guerra de Vanguard ya no entra con metales fríos sino con la marcha que cierra las guerras",
      "CORO DE LOS HÉROES: cien voces sintéticas cantando el arco del héroe — la obra más solemne de la casa, asignada al SISTEMA",
      "CALMA GLORIOSA: SERENIDAD DORADA (arpa de cristal + coro lejano) y NOCHE DE ESTRELLAS (campana sobre drones profundos) — las dos nuevas obras relajantes para mirar el cielo y quedarse; el OBSERVATORIO ahora duerme con ellas",
      "EL CIELO GANA POBLACIÓN: 16 estrellas nuevas (34 en total), AURORA BOREAL en las noches limpias y la luna con sus cráteres — la bóveda ya no es un desierto",
      "EL SOL CORONADO: halo que pulsa lento y noble sobre el astro — la firma de Vanguard brilla con más vida",
      "LA CIUDAD RESPIRA GENTE: tres bandadas de aves cruzando el día, el dron de la casa patrullando la noche, antenas con baliza en los altos, luces de aviación en las torres, tanques de agua en el Puerto y la Meseta",
      "LA CALLE VIVA: 8 faroles que se encienden solos al anochecer y tránsito perpetuo — dos pisos de luz (blancos que van, rojos que vuelven) recorriendo el horizonte noche y día",
      "VENTANAS CON PALETA: los edificios mezclan cálido, frío, blanco cálido, menta y el acento de la región — la ciudad ya no apaga todos los colores al caer el sol",
    ],
  },
  {
    version: "v122.0",
    nombre: "RUTAS DE PODER",
    tipo: "nav",
    hitos: [
      "RUTAS DE PODER EN EL ATLAS: los 15 ejes reales del planeta dibujados como arcos de vuelo animados sobre el mapa — GRAN PARIDAD, SIN LÍMITES, EJE NORTE–SUR, PETRODÓLAR... toca un pin y SUS rutas se encienden con tu color",
      "COMPARADOR DE NACIONES: nueva vista del ATLAS que pone dos países cara a cara — población, superficie y densidad en barras que coronan al ganador, con capital, moneda, idiomas, líder y su hora viva al lado",
      "TU SALA AL ARRANCAR: LA CAMA gana TU SALA DE SIEMPRE — eliges tu sala favorita y Vanguard puede aterrizar directo en ella cuando despierta sin sesión guardada, como entrar a tu habitación y no al hall",
      "LA MORAL RESIENTE EL CIELO: la tormenta pega −12% a la moral de los dos bandos, la nieve −10% y la nieve acumulada castiga −3 por día seguido; el despejado levanta el ánimo +4% — el teatro del Karsk ahora se siente",
      "TARJETA DEL COMANDANTE: cada cronología de localidad se exporta como PNG 1200×630 — su línea de 21 días, sus cambios de mano y sus despachos listos para enviar",
      "PRIORIDAD ALERTA EN EL HUD: los cables marcados ALERTA van PRIMERO en el mini-noticiero 2100 y lo visten de rojo con su chip parpadeante — la casa no entierra un ataque entre el ruido",
      "LA CIUDAD VIGILADA: la sala de CÁMARAS estrena su skyline procedural — vive con tu reloj real (luna y ventanas encendidas de noche, sol de día) mientras el dron de la red la barre en bucle",
      "SEÑALES REALES EN EL ESPEJO Y EL BRIEFING: los frentes del briefing lucen badges de señales en escucha y el espejo estrena su franja REAL separada del SIM — todo se lee dentro de Vanguard con la SALA DE LECTURA",
    ],
  },
  {
    version: "v121.0",
    nombre: "LA CAMA MÁS CÓMODA",
    tipo: "nav",
    hitos: [
      "MODO ATLAS MUNDIAL: la sala que faltaba — 66 países con capital, población, superficie, idiomas, moneda, gobierno y líder; 70 personas importantes del planeta (gobierno, organismos, dinero, ciencia y cultura) con SU UBICACIÓN REAL en el mapa, hora local EN VIVO de donde están y ficha completa con su historia",
      "EL MAPA DEL PLANETA: pines vivos por categoría sobre el mapa real de Vanguard (Natural Earth) — toca un pin y ves quién es, dónde está y qué hora es allí ahora mismo; relojes de las 8 potencias latiendo al segundo",
      "5 FORMAS DE VIAJAR ENTRE SALAS: elige tu movimiento (DESLIZAR direccional, CINE 3D con puertas volumétricas, TELÓN de teatro, HIPERESPACIO con anillos o DISOLVER de calma absoluta) — con vista previa jugable en LA CAMA",
      "LETRAS ANIMADAS EN TODA LA CASA: los títulos de todas las salas entran ahora letra a letra con rotación volumétrica (solo transform/opacity, 60 FPS)",
      "LA CAMA: la habitación de personalización total — tamaño de las letras de la casa entera (85%–130%), densidad del aire, intensidad de movimiento 0–120%, tu color personal (6 acentos que tiñen selección, brillos y transiciones), MODO CAMA de calma cálida y AUTO-CAMA que se pone solo a las 22:00",
      "LA CASA APRENDE TU CAMINO: cada visita queda registrada — tus salas más pisadas y tus recientes aparecen en LA CAMA a un toque",
      "ILUSTRACIONES VIVAS FUNCIONALES: satélite, globo, ciudad, antena, cohete, prensa y una cama lunar — dibujadas a código (cero imágenes), respiran con tu hora real y viven ENTRE los bloques de la portada",
    ],
  },
  {
    version: "v120.0",
    nombre: "GRAN SALTO 3D",
    tipo: "tecno",
    hitos: [
      "LA CIUDAD REINA EN LA PORTADA: el ocaso estático (v71) se jubila — lo primero que ves es la MEGALÓPOLIS viva: cielo real según tu reloj, la región del día con su mojón y el clima del planeta",
      "GIRAR REGIÓN A MANO: botón nuevo sobre la ciudad — salta a la región vecina con el fundido de 2.4 s de la casa (la rotación diaria sigue sola)",
      "VANGUARD EN LETRAS 3D DE VERDAD: el título de la portada se extruye en 7 capas con material BRASA (la identidad dorada) — volumen real, entrada letra a letra, se inclina con tu puntero",
      "LA SANGRE VUELVE A LA CASA: el schema de la BD quedó en PostgreSQL de la era v30 y la casa corre en SQLite — reparado: la BD vuelve a estar viva, las noticias curadas y los perfiles respiran otra vez",
      "MÁS NOTICIEROS QUE NUNCA: 4 canales nuevos en la red OSINT (20 en total) y 8 cables curados nuevos — la portada amanece llena",
    ],
  },
  {
    version: "v119.0",
    nombre: "CRONOTEATRO",
    tipo: "tecno",
    hitos: [
      "EL CLIMA TIÑE LA GUERRA: las estadísticas de campaña ya no son ajenas al cielo — nieve corta la artillería (−40 %) pero endurece la logística (convoyes +20 %), la tormenta aterriza la aviación y deja los drones en el suelo, la niebla dispara a ciegas; cada parte lleva sus modificadores a la vista",
      "NIEVE QUE SE ACUMULA: los días seguidos de nieve velan el terreno del teatro día tras día (hasta ×4) y el chip del clima lo cuenta — NIEVE ×3 DÍAS, como un invierno de verdad",
      "CRONOLOGÍA DE LOCALIDAD: toca cualquier localidad del teatro y la campaña se cuenta desde SU esquina — quién la tuvo cada uno de los 21 días (línea de puntos ROJO/GRIS/AZUL), cuántas veces cambió de mano y qué despachos la mencionaron",
      "LA VOZ DEL PARTE: los despachos del frente se ESCUCHAN — la casa narra su propio parte en es-ES con ritmo de operador de radio, nace en tu máquina, respeta el MUTE de Vanguard y se corta al cambiar de día",
      "EXPORTAR EL TEATRO: el día completo de campaña se descarga como PNG 1600×1080 — serializa el SVG vivo y lo rasteriza en tu máquina, sin servicios ni costes: vanguard-karsk-dia{N}.png",
      "INTEL EN VIVO EN EL MAPA GRANDE: el mapa militar de la casa también recibe los cables emparejados por conflicto — badges pulsantes en la lista, bloque INTEL EN VIVO en la ficha y lectura DENTRO de Vanguard con la SALA DE LECTURA (cero saltos fuera)",
      "SWIPE PARA TODAS LAS SECCIONES: con una sola pestaña abierta el gesto del borde ya no muere — recorre el CATÁLOGO COMPLETO de SECTIONS y abre la sala que toca como pestaña",
    ],
  },
  {
    version: "v118.0",
    nombre: "CRONOATLAS",
    tipo: "tecno",
    hitos: [
      "MÁQUINA DEL TIEMPO REALISTA: la campaña del Karsk pasa de 14 a 21 días con terreno de verdad — río con su puente estratégico, carreteras, contornos de elevación y la sombra de KARSKGRAD al este",
      "CLIMA DIARIO EN EL TEATRO: cada día amanece con su parte — despejado, lluvia, tormenta con relámpago, niebla a ras, nieve o viento — determinista y reproducible, con temperatura y viento por dirección",
      "DESPACHOS DEL FRENTE: el parte diario de la casa — 2-3 despachos por hora y sector sobre las localidades reales del día, escritos por Vanguard",
      "ESTADÍSTICAS DE CAMPAÑA: bajas por bando, bombardeos, drones derribados, convoyes logísticos y la moral de ROJO y AZUL moviéndose con el empuje del frente, día a día",
      "REPRODUCTOR NUEVO: velocidad ×0.5/×1/×2, avance y retroceso paso a paso, y TICKS rojos en la línea de tiempo marcando los días en que una localidad cambia de mano; ejes de presión con flechas que respiran según la fuerza del día",
      "ARCHIVO REAL AMPLIADO: dos cronologías verificables más — COINTELPRO (FBI, 1956-1971) y ECHELON (UKUSA, 1966-2001) — con fases, fuente nombrada y enlaces al grafo; el ARCHIVO pasa de 3 a 5 expedientes reales",
      "ATLAS QUE INFORMA: GOOGLE MAPS DE CONFLICTOS pasa de 8 a 12 zonas (Líbano Sur, Mar Negro, Cáucaso y Congo Este) con FICHA RICA: actores del conflicto, cifras clave e historial del frente",
      "INTEL EN VIVO EN LOS MAPAS: los cables de la casa se emparejan a cada zona por palabras clave y se leen DENTRO de Vanguard con la SALA DE LECTURA — el enlace externo a Google muere: las coordenadas se COPIAN y quedan como nota",
      "FLUIDEZ DIRECCIONAL: las salas entran desde el lado que les toca — adelante entra por la derecha y atrás invierte el movimiento, como un navegador de verdad; el ciclo de pestañas (flechas) viaja en su dirección",
      "SWIPE EN BORDES (móvil): desliza desde el borde para cambiar de pestaña abierta, con umbral honesto, bordes de 44 px y respeto a modales e interactivos; chips con scroll-snap y rebote contenido en toda la casa",
    ],
  },
  {
    version: "v117.0",
    nombre: "ATMÓSFERA",
    tipo: "mundo",
    hitos: [
      "CLIMA REAL EN LA CIUDAD: el METEO del planeta (/api/meteo) tiñe la megalópolis — lluvia que cae, nieve con deriva, niebla que se arrastra, tormenta con relámpagos de la casa y nubes cubiertas; chip CLIMA en vivo con temperatura",
      "TERMINADOR POR HORA: cada edificio recibe la LUZ del lado que mira al sol y sombra en el contrario, siguiendo la posición real del sol en tu reloj (alba este, ocaso oeste) — la ciudad sombreada de verdad",
      "CROSSFADE DE REGIÓN: cuando la ciudad cambia de región, la antigua se desvanece sobre la nueva durante 2.4 s (y el evento vanguard:rotar-region permite girarla a mano) — el cambio de día se SIENTE",
      "VOZ DE LA CIUDAD: audio ambiente 100% procedural de la casa (ciudad-audio.ts) — tráfico lejano que respira con la fase del día, aire y pitidos lejanos; se apaga con el MUTE y nunca arrastra muestras",
      "LECTURA NEURONA: la SALA DE LECTURA gana el veredicto del núcleo v4 sobre cada cable — riesgo/tensión/confianza, sentimiento y neuronas activas, computado EN TU DISPOSITIVO con el mismo motor del Monitor Global",
      "MINI-NOTICIERO 2100 EN EL HUD: titular rotativo de la casa cada 7 s — un toque abre la SALA DE LECTURA interna (cero enlaces externos) — y el CHIP DEL ARQUITECTO respira junto a la brújula con su ciclo vivo",
      "EL ARQUITECTO EXPANDIDO: ARCHIVO DE OBRA exportable (memoria visible descargable como JSON), SALAS SATÉLITE navegables (cada fundación abre su sala real por semilla determinista) y sus OBRAS audibles aquí mismo con sello OBRA DEL ARQUITECTO",
      "BAUTIZAR LA CIUDAD: la FORJA da nombres populares a las regiones — tu bautizo luce en la ciudad del INICIO con su estrella ★ (local en tu dispositivo, retirable)",
    ],
  },
  {
    version: "v116.0",
    nombre: "MEGALÓPOLIS",
    tipo: "mundo",
    hitos: [
      "MEGALÓPOLIS: la ciudad del INICIO rota de REGIÓN cada día (Núcleo Cromo, Distrito Neón, Meseta Solar, Puerto Abierto, Jardines Verticales, Ciudadela Vanguard) — cada región con su propia skyline, mojón y color, en 3 capas de volumen 3D que se inclinan contigo",
      "CICLO DÍA/NOCHE EN TIEMPO REAL: el cielo vive TU hora — noche profunda, alba, día pleno y ocaso interpolados minuto a minuto; sol y luna recorren su arco real, las estrellas y las ventanas obedecen a la luz, hay meteoros de noche y nubes de día",
      "SALA DE LECTURA: ningún cable te manda ya fuera de Vanguard — todo se lee DENTRO (portada 3D viva, credibilidad de fuente, bandera, EL CONTEXTO VANGUARD y salas relacionadas); la fuente original queda como nota al pie, sin enlaces",
      "MÁS NOTICIEROS: 4 canales nuevos (VANGUARD·2100 INFORMATIVO, ALERTA ROJA 24H, Mareas Azules, El Corresponsal) y la fila MÁS SEÑALES con 8 cables más en la portada",
      "3 MATERIALES NUEVOS en la FORJA: PLASMA (energía ionizada), AURORA (boreal en volumen) y TITANIO (el blindaje de la casa) — 11 materiales en total",
      "CERO IMÁGENES PLANAS: el héroe de INICIO y las miniaturas de los cables son ahora escenas 3D vivas derivadas del propio cable (PortadaNoticia) — adiós al <img> de la portada",
    ],
  },
  {
    version: "v115.0",
    nombre: "SINGULARIDAD",
    tipo: "ia",
    hitos: [
      "EL ARQUITECTO: el 16º mundo — el agente autónomo que mejora Vanguard sin manos. Se PROMPTEA A SÍ MISMO (cada ciclo escribe su próximo prompt citando lo que acaba de construir) y trabaja en un bucle que no termina",
      "TRABAJO REAL Y PERMANENTE: instala 6 módulos funcionales (sismógrafo de letras, telemetro neuronal, brújula del frente, faro de misiones, espejo de eras, cartógrafo de semillas), compone obras con voces V4, firma doctrinas, funda salas satélite y audita su propia obra",
      "MODO PERPETUO GLOBAL: sigue construyendo mientras navegas cualquier sala (MotorArquitecto en page.tsx) con 4 velocidades — LENTA/NORMAL/RÁPIDA/TURBO — y memoria eterna en vg-arquitecto-v115",
      "IA REAL CON RED DE SEGURIDAD: cada ciclo intenta el gateway (nueva ruta /api/arquitecto con iaParalela); si el modelo no responde, el núcleo embebido determinista toma el turno — el agente NUNCA se detiene",
      "LAS OBRAS DEL ARQUITECTO SUENAN: sus partituras aparecen como botones verdes ◈ en el ESTUDIO de CREADORES y son jugables al toque",
      "RONDAS PENDIENTES CERRADAS: FIRMA 3D junto al alias en el HUD · SOL con posición y sombras reales por TU hora en la ciudad de INICIO · SUB-SALAS de era (· ESTUDIO y · FORJA) · FORJA exporta .PNG · la radio FUNDE 7 s al cambiar de era (1950↔2100)",
    ],
  },
  {
    version: "v114.0",
    nombre: "ECLIPSE",
    tipo: "tecno",
    hitos: [
      "TERMINADOR SOLAR en VANGUARD EARTH: una cúpula shader oscurece el hemisferio nocturno del globo con crepúsculo suave — la MISMA matemática solar del mini-mapa (lib/sol.ts), el uniforme respira cada 60 s",
      "ERA POR SUB-SALA: el AUDITORIO son dos salas (SALA y COLECCIÓN) y cada una viste SU época — el auditorio en 2100 con la colección en 1980 conviven",
      "CHIP DE GRUPO EXPANDIDO ARRASTRABLE: el chip sobre su bloque mueve el grupo entero pestaña a pestaña (ratón al instante, pulsación larga en táctil) — como Chrome",
      "CROSSFADE DE FAMILIA: al cruzar de franja (alba→día→noche) la SESIÓN INTELIGENTE funde 7 s en vez de 0.8 — el anochecer se OYE llegar",
      "FIRMA 3D DE PERFIL: la FORJA exporta tu composición (texto, material, profundidad, acento) y el PERFIL del agente la luce con el motor de letras — se quita desde el propio perfil",
      "3 MATERIALES NUEVOS de letras: VIDRIO (cristal translúcido con filos de luz), ORO LÍQUIDO (metal dorado en bandas) y GLITCH (aberración cromática RGB con temblor de señal)",
    ],
  },
  {
    version: "v113.0",
    nombre: "LETRAS VIVAS",
    tipo: "tecno",
    hitos: [
      "MOTOR DE LETRAS 3D: cada letra de la casa tiene VOLUMEN real — capas extruidas en preserve-3d, 5 materiales (HOLOGRAMA, NEÓN, CROMO, MATRIZ y la BRASA dorada) y tilt con la persona vía el Motor 3D",
      "TODOS LOS HÉROES visten letras 3D: el título grande de cada sala se extruye por capas y se inclina contigo (mandato: todo sea 3D letras)",
      "EXPERIMENTAL — LA PÁGINA DE LOS IMPOSIBLES: el 15º mundo con la FORJA DE LETRAS (escribe → volumen 3D vivo, material, profundidad, giro orbital y arrastre), la ÓRBITA DE PALABRAS y la LLUVIA DE LETRAS con TU alfabeto",
      "GIROSCOPIO CON VISTA PREVIA EN VIVO: un cubo 3D en Ajustes respira tu mano (o tu móvil) y muestra tu calibración al segundo",
      "RADIO: la PRÓXIMA OBRA ya se ve en la píldora — con SESIÓN INTELIGENTE manda la familia de la hora",
      "ARREGLO: las etiquetas nueva/observatorio de los diccionarios ruso y chino estaban intercambiadas — Rusia y China leen su idioma",
    ],
  },
  {
    version: "v112.0",
    nombre: "SOLSTICIO",
    tipo: "tecno",
    hitos: [
      "ERA POR SALA: presets que visten cada sala de su época al entrar — la MURALLA en 1950, el AUDITORIO en 2100 — y devuelven la casa a su era al salir",
      "ARRASTRAR EL CHIP DE GRUPO: el grupo completo (chip + sus pestañas) viaja por la franja de cromo con pulsación larga en móvil",
      "ESTUDIO DEL CREADOR CON INSTRUMENTOS V4: campana FM, cristal y metal, pad con séptimas, sub-bajo y cadena de estudio en las composiciones publicables",
      "GIROSCOPIO CON CALIBRACIÓN FINA: tu pose de reposo es el cero (mediana de 700 ms) — y el defecto del listener siempre-activo de v111 queda cazado",
      "MURALLA con TERMINADOR SOLAR REAL (declinación + ecuación del tiempo) y las 10 PATRULLAS cruzando el planeta en vivo",
      "SESIÓN CONTINUA INTELIGENTE: la radio encadena la familia que pide la hora — alba→ambiente · día→vanguard · noche→guerra · madrugada→ambiente",
    ],
  },
  {
    version: "v111.0",
    nombre: "MÁQUINA DEL TIEMPO",
    tipo: "tecno",
    hitos: [
      "MÁQUINA DEL TIEMPO 1950→2100: toda la casa viaja de era — CRT verde, terminal ámbar, presentes y MATRIZ HOLO",
      "GIROSCOPIO: en el móvil la matriz se inclina con tu mano (permiso iOS en Ajustes)",
      "Los 14 mundos del MENÚ con profundidad 3D real heredando las escenas holo",
      "RADIO: ECUALIZADOR de 3 bandas ±12 dB + SESIÓN CONTINUA (encadena obras sin cortes) + cada obra con su mini-escena 3D",
      "BITÁCORA AUTO-ALIMENTADA desde version.ts · MURALLA con mapa sísmico en canvas · CONSEJO se reconvoca solo",
    ],
  },
  {
    version: "v110.0",
    nombre: "MATRIZ 2100",
    tipo: "tecno",
    hitos: [
      "MOTOR 3D: todo lo plano se vuelve escena holográfica viva (15 variantes) que se inclina con tu puntero",
      "PORTADA 3D en CADA noticia — nunca más un cable sin portada, funciona sin red",
      "OJO DE DIOS con escena orbital viva · CÁMARAS con KIT DE BIENVENIDA gratis (3 cámaras al entrar)",
      "TECNOLOGÍA 3D personalizable en Ajustes: intensidad, tilt, paralaje, rejilla",
      "BITÁCORA DE VANGUARD: las actualizaciones por fin visibles para todos",
    ],
  },
  {
    version: "v109.0",
    nombre: "ORQUESTA DE ORO",
    tipo: "musica",
    hitos: [
      "Motor de música v4: cadena de estudio (reverb de sala, chorus, ping-pong, compresor + limitador)",
      "Melodías que respiran: motivo → variante → puente → cadencia, humanizadas",
      "4 insignias nuevas + MODO AUDITORIO a pantalla completa con espectro de 32 barras",
    ],
  },
  {
    version: "v108.0",
    nombre: "LA CIUDAD VIVA",
    tipo: "nav",
    hitos: [
      "El mega-menú se vuelve una ciudad nocturna con portadas reales en CSS para cada mundo",
      "VITRINA DE SALAS: ves qué hay en cada subsección antes de entrar",
      "Fijar, renombrar, duplicar y previsualizar pestañas + MODO INMERSIÓN (tecla F)",
    ],
  },
  {
    version: "v107.0",
    nombre: "GRUPOS DE CROMO",
    tipo: "nav",
    hitos: [
      "Arrastra pestañas para reordenarlas (ratón al instante, móvil con pulsación larga)",
      "Grupos de pestañas con color como Chrome: chip contraíble, renombrable, recoloreable",
      "Los personajes del CONSEJO hablan con el modelo fuerte en producción",
    ],
  },
  {
    version: "v106.0",
    nombre: "PESTAÑAS DE CROMO",
    tipo: "nav",
    hitos: [
      "Cada vista es una pestaña que se abre, se elige y se cierra",
      "La NUEVA PESTAÑA trae ómnibox para buscar en todo el índice",
      "Muralla de Vigilancia en el Observatorio con USGS e ISS en vivo",
    ],
  },
  {
    version: "v105.0",
    nombre: "LA MENTE BLINDADA",
    tipo: "ia",
    hitos: [
      "Carrera de IA en paralelo (gateway privado ∥ núcleo público) con memoria de caída",
      "IA embebida de RESERVA en tu navegador: la sala nunca calla",
    ],
  },
  {
    version: "v104.0",
    nombre: "LA VITRINA",
    tipo: "mundo",
    hitos: [
      "Obras de la comunidad con fama real, comentarios y evaluación del agente",
      "Repeticiones de simulación y talleres con precarga",
    ],
  },
  {
    version: "v101.0",
    nombre: "EL REGRESO",
    tipo: "reten",
    hitos: [
      "Informe de regreso: qué cambió en el mundo desde tu última visita",
      "Tres corrientes: pulsos del mundo, noticias reales y expediente del día",
    ],
  },
  {
    version: "v89.0",
    nombre: "RED NEURONAL",
    tipo: "tecno",
    hitos: ["La red neuronal de Vanguard visible y entrenable desde NOTICIAS"],
  },
  {
    version: "v87.0",
    nombre: "SIGNOS VITALES",
    tipo: "mundo",
    hitos: ["Población que nace, tensiones que respiran y ECG planetario que nunca para"],
  },
  {
    version: "v82.0",
    nombre: "TODO EL MUNDO",
    tipo: "mundo",
    hitos: ["Teletipo en vivo: cinta de última hora + mensajes constantes en NOTICIAS"],
  },
  {
    version: "v78.0",
    nombre: "MENÚ DE CINE",
    tipo: "nav",
    hitos: ["El menú de Vanguard se vuelve cinematográfico: ken-burns, destellos, horizonte"],
  },
  {
    version: "v73.0",
    nombre: "REGLA DE ORO",
    tipo: "nav",
    hitos: ["Héroe universal en cada sala: título grande, escena y texto fácil"],
  },
  {
    version: "v72.0",
    nombre: "INFINITA VERDADES",
    tipo: "mundo",
    hitos: ["El mayor centro de noticias de Vanguard con título épico universal"],
  },
  {
    version: "v56.0",
    nombre: "MURO INFINITO",
    tipo: "mundo",
    hitos: ["Carga por lotes del archivo histórico completo en el OJO DE DIOS"],
  },
  {
    version: "v55.0",
    nombre: "TEMPORADA CERO",
    tipo: "reten",
    hitos: [
      "Pase de temporada de 30 días, combo por permanencia y cofres por rareza",
      "Informe de Ausencia con datos reales del pulso del mundo",
    ],
  },
];

export const BITACORA_COLOR: Record<EntradaBitacora["tipo"], string> = {
  nav: "#FF8A2A",
  musica: "#FFC53D",
  mundo: "#5EEAD4",
  ia: "#A8C7FF",
  tecno: "#34C759",
  reten: "#FF3B30",
  luxe: "#D4AF37",
};

// ── v111: ALIMENTACIÓN AUTOMÁTICA — la versión en marcha SIEMPRE está ──
// Si el release actual no tiene entrada escrita a mano, la bitácora la genera
// (título = codename de version.ts, hito honesto de publicación).
export function bitacoraViva(): EntradaBitacora[] {
  const yaEsta = BITACORA.some((e) => e.version === APP_VERSION);
  if (yaEsta) return BITACORA;
  return [
    {
      version: APP_VERSION,
      nombre: APP_CODENAME,
      tipo: "tecno",
      hitos: [
        `${APP_VERSION} · ${APP_CODENAME} — publicado y en marcha (entrada automática de la bitácora viva)`,
        "Los hitos detallados se escriben con cada ronda — esta línea garantiza que ningún release sea invisible",
      ],
    },
    ...BITACORA,
  ];
}

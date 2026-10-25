// FUENTE ÚNICA DE LA VERSIÓN DE VANGUARD (se muestra en HUD, health y feed)
// v159.0: EL ATERRIZAJE — «recuerda que soy de móvil, aún no veo nada de
//         sentido, todo desordenado». Diagnóstico con capturas reales de
//         iPhone: la intro nacía casi negra, el piloto aterrizaba en una SOPA
//         (12 capas DOM peleándose + sala genérica gigante + mundo de zona
//         sangrando) y la CIUDAD v158 solo se veía si tocabas MENU.
// (1) EL ATERRIZAJE EN LA CIUDAD: terminada la ceremonia (o el reencuentro),
//     el mundo VUELA SOLO hasta la metrópolis — la ciudad ordenada ES la
//     pantalla de inicio; un edificio por módulo, una sola acción clara.
// (2) INTRO BRILLANTE: el sol acompaña a la cámara durante la ceremonia —
//     el globo muestra su cara iluminada, el logo dorado manda (antes: un
//     disco negro y un texto sr-only invisible).
// (3) LA DIETA HUD (móvil): PULSO, RADIO, cofre, clúster de retención, la
//     «×» suelta y la barra de zonas DOM duermen cuando el universo 3D vive
//     (data-vg-retencion extendido + capsulaMovil en page.tsx). Una pantalla
//     móvil = un foco.
// (4) SALA HÉROE ÚNICA: en móvil el mundo de zona y sus títulos duermen
//     mientras la sala manda (visibleZona respeta salaHeroMovil) — cero
//     mezcla de gigantes, menos draw calls, cero lag.
// (5) EL ATERRIZAJE PERFECTO: la sala ya no nace varada a mitad del vuelo
//     de descenso (QA la cazó a y=8.9 fuera de la mira) — despierta Y se
//     re-ancla en la pose final al posar la cámara.
// (6) BONO DIARIO y MANUAL DEL COMANDANTE ESPERAN: nada tapa la metrópolis
//     al aterrizar; se sirven cuando el piloto sale a un módulo.
// Herencia v158: LA CIUDAD (metrópolis fija, entrada/salida cinematográficas,
// cielo ámbar, naves, farolas, rótulos a 45°) y todo lo anterior.

// v160.0: EL VACÍO LIMPIO — la ciudad se lee como un cartel de neón en la noche.
// (RENUMERADA: la v159.0 ya era EL ATERRIZAJE, publicada antes en esta misma era.)
// (1) «no me gusta que en el fondo haya un planeta y estructura nada que ver»
//     → al abrir la ciudad el planeta, su atmósfera, las partículas, el logo y
//     los marcadores DUERMEN; el cielo ámbar se sustituye por una cúpula NEGRA
//     con estrellas propias — la metrópolis flota en un vacío legible.
// (2) «las casas están feas» → torres de VIDRIO OSCURO (metal 0.9) con columna
//     de neón, corona luminosa, retícula de ventanas 4×3, rótulo con RESPALDO
//     oscuro de filo vivo y una LÍNEA DE SENTIDO que dice qué hay dentro.
// (3) «no preguntas si quieres entrar» → tocar un edificio YA NO entra solo:
//     un panel 3D anclado a la cámara pregunta «¿ENTRAR?» con SÍ y NO reales
//     (raycast, sonido, auto-cierre a los 9 s, ESC/VOLVER lo retiran).
// (4) «el contenido es pobre, no se entiende y aburrido» + «cuando uno se
//     mueva al rededor aparezcan elementos» → LOS REVELADOS: 8 núcleos de
//     datos brotan del vacío al volar cerca (consejos reales, teatros en
//     guerra, nivel/monedas/racha del piloto) y vuelven a dormir al alejarte;
//     contador «HALLADOS n/8» sobre la puerta convierte el vuelo en expedición.
// Herencia v159 EL ATERRIZAJE (aterrizaje automático en la ciudad, intro
// brillante, dieta HUD móvil, sala héroe única) y v158 LA CIUDAD (metrópolis
// anclada y=10.6, avenida + 16 manzanas, vuelo ida/regreso, corredor propio).
// v161.0: LA CIUDAD VIVA — «sigue mejorando buscando bugs y agregando más
// contenido». La expedición de la ciudad deja de ser estática:
// (1) DATOS EN VIVO: dos revelados nacen «SINTONIZANDO…» y un latido a
//     /api/presence los reescribe con la presencia REAL del servidor —
//     «N OPERADORES EN LÍNEA AHORA MISMO» y «RÉCORD DE LA CIUDADELA · N A LA
//     VEZ». Sin señal, los lemas de espera siguen siendo válidos.
// (2) MÁS CONTENIDO: la avenida ahora esconde DOCE datos ocultos (antes 8)
//     y en móvil SEIS (antes 4) — edificados con datos reales: teatros en
//     guerra, nº de edificios de la ciudad, versión del universo, nivel/
//     monedas/racha del piloto y consejos de vuelo.
// (3) LA RECOMPENSA DEL EXPLORADOR: hallarlos TODOS vuelve el letrero ORO
//     («¡EXPEDICIÓN COMPLETA!») y paga +150 monedas +50 XP una vez por
//     sesión (vg:ciudad-recompensa → la Casa paga con toast).
// (4) BUG DE LA VAPOR-VENTANA (cola v158): COLISIÓN SUAVE CON LAS TORRES —
//     el caza ya no atraviesa los edificios: cada manzana empuja por el eje
//     menos profundo y mata la velocidad entrante (mismo espíritu que los
//     límites que deslizan del v148); rozar es planeo, no fantasma.
// v162.0: LA MEGAPÓLIS — «sigue agregando más contenido completo de
// vanguard, todo el sitio de vanguard súmalo… las ciudades, mejóralas».
// (1) TODO EL SITIO EN LA CIUDAD: la Casa envía el catálogo COMPLETO
//     (antes solo 5 pestañas por sección) y cada sección levanta junto a
//     su torre un TÓTEM DE MÓDULOS: columna de neón + corona girando + una
//     PLACA por cada módulo de la sección (2 columnas × 9) — las 147
//     pestañas del sitio son tocables y abren SU módulo exacto (misma
//     pregunta ¿ENTRAR? con SÍ/NO de la v160).
// (2) EL RÓTULO DE PROXIMIDAD: un SOLO texto 3D compartido se re-escribe
//     por cirugía (dispose + rebuild) para revelar el nombre de la placa
//     más cercana al volar — 147 módulos legibles sin 147 letreros vivos
//     (billboard a cámara, búsqueda cada 6 frames, cero fugas).
// (3) LA ISLA CRECE: plataforma 12.6×16.2 (antes 9.8×15.4), dos CALLES
//     LATERALES con neón cian conectan las torres con sus distritos de
//     placas, farolas extra en escritorio, corredor de vuelo rMax 10.2→11.8
//     y COLISIÓN SUAVE también con los tótems (x 0.58 · z 0.3).
// (4) MÁS CONTENIDO: revelados reescritos con la MEGAPÓLIS («N TORRES · M
//     MÓDULOS TOCABLES», «LOS TÓTEMS GUARDAN TODO EL SITIO»), tótems que
//     nacen en cascada tras las torres y coronas que giran con vaivén.
// Herencia v161 LA CIUDAD VIVA (presencia en vivo, 12 revelados, recompensa
// del explorador, colisión con torres) y todo lo anterior.
// v163.0: LA CIUDAD TALLADA — «sí a todo, pero haz el fondo negro con
// decoraciones del módulo; agrega los módulos completos; los edificios,
// las casas mejoradas; mejora los modelos».
// (1) LAS TORRES TALLADAS: cada edificio se esculpe en 3 CUERPOS con
//     retranqueos (base 0.94 → cintura 0.78 → corona 0.60), PORTAL de
//     entrada con pilares y dintel de neón mirando a la avenida, corona
//     luminosa ajustada al cuerpo alto y ANTENA con baliza que PARPADEA
//     por fases — silueta de rascacielos de verdad, no un bloque pintado.
// (2) LAS DECORACIONES DEL MÓDULO: el vacío negro alrededor de cada torre
//     se puebla con 3 piezas temáticas que ORBITAN despacio (2 en móvil):
//     satélites espía en OSINT, cazas y cajas en el HANGAR, monedas y
//     gemas en el MERCADO, carpetas desclasificadas en el ARCHIVO, ondas
//     de audio en la EMISORA, monolitos rotos en OJOSCURO, redes de nodos
//     en SOCIAL, engranajes en SISTEMA, matraces en EXPERIMENTAL… — 16
//     distritos reconocibles por lo que vuela a su lado, con carril de
//     órbita tenue en escritorio. Nada de proxies: no roban toques.
// (3) VENTANAS ENCAJADAS: la retícula vive en CADA cuerpo (base + cintura)
//     — nada flota fuera del edificio tras los retranqueos.
// Herencia v162 LA MEGAPÓLIS (146 placas de módulo en tótems, rótulo de
// proximidad, colisión con tótems) y v161 LA CIUDAD VIVA y todo lo anterior.
// v164.0: LA REDACCIÓN EN VIVO — «completa vanguard 3D: las noticias en vivo
// y más, el menú de vanguard 3D completamente, también todas las
// informaciones, y todo texto que tenía vanguard 3D, y los juegos también».
// (1) LA REDACCIÓN EN VIVO (salas-3d.ts): la sala de noticias RESPIRA —
//     cartel rojo EN VIVO con latido de cabina (1.4 Hz), contador de
//     ESPECTADORES reales (/api/presence) y FARO DE ÚLTIMA HORA: anillo
//     dorado que late alrededor del núcleo cuando el cable más nuevo nació
//     hace menos de 15 minutos (news-panel manda ultimo/ultimoTitulo).
// (2) EL TELETIPO DE LA CIUDAD (mundo-webgl.tsx): el titular EN VIVO flota
//     sobre la plaza de la megápolis — cartel rojo de ÚLTIMA HORA que late
//     + titular REAL del feed (sintonizarTeletipo: 1 fetch/min a /api/news
//     al abrir la ciudad; onTeletipoEv re-escribe en vivo si el módulo
//     noticias emite). Billboard a cámara SOLO yaw — nunca persigue. La
//     ciudad entera respira con las noticias aunque nunca abras el módulo.
// (3) LA GALERÍA DE JUEGOS (salas-3d.ts): sala insignia nueva — los juegos
//     REALES de Vanguard como CARTUCHOS 3D con su puntuación, el trofeo
//     dorado girando con aros en órbita, la partida en curso latiendo y
//     JUGAR tocable desde dentro del mundo (vg:sala3d-accion jugar).
//     ARCADE emite sus 8 cartuchos con récords reales + juego del día en
//     oro; MINIJUEGO emite Threat Assessment + récords del piloto.
// (4) TODO TEXTO EN 3D: el emisor universal llega a 17 módulos nuevos —
//     redacción, enciclopedia, atlas del poder, sala OSINT, briefings,
//     canal brief, comunidad, escuadra, retos diarios, briefing diario,
//     en vivo, directos, notificaciones, recompensas, apuestas de guerra,
//     torneos y wikiguerra — cada sala de módulo muestra SU contenido real
//     en filas de cristal con valores en oro y barras de volumen.
// Herencia v163 LA CIUDAD TALLADA (torres esculpidas, decoraciones por
// distrito), v162 LA MEGAPÓLIS (146 placas) y todo lo anterior.
// v165.0: LA SALA COMPLETA — «cuando entre a un módulo-casa este el módulo
// COMPLETO, no solo el encabezado... toda la información que está en
// Vanguard sea 3D... y que pueda poner el vanguard 2D o 3D».
// (1) LA SALA DE CONTENIDO CRECE: 9 filas en escritorio / 7 en móvil
//     (antes 7/7), cada fila con su VALOR en oro, barra, imagen y —cuando
//     el panel la manda— su BOTÓN de acción real (comprar / invertir /
//     cobrar / vender / abrir / depositar) que ejecuta DE VERDAD vía
//     vg:sala3d-accion. El pie honesto «+N MÁS EN EL PANEL» confiesa lo
//     que queda en la consola.
// (2) EL DETALLE DE PROXIMIDAD: al volar CERCA de una fila, SU información
//     nueva brota en letras doradas que VAN Y VIENEN (entra flotando, sale
//     desvaneciéndose) con una aguja que la señala y billboard solo-yaw —
//     la sala le contesta al piloto que se acerca a mirar.
// (3) EL MONUMENTO: toda sala de contenido estrena su FIGURA GRANDE —
//     torre de 3 cuerpos coronada por la INICIAL del módulo en letras
//     enormes girando con aro orbital — se ve desde lejos y firma la sala.
// (4) LA ECONOMÍA COMPLETA EN 3D: la BOLSA estrena lista de mercado viva
//     (10 activos con precio y %) + CARTERA del piloto, tocables:
//     INVERTIR compra 1 unidad con su comisión, VENDER liquida la
//     posición. MERCADOS DE GUERRA deja de ser figura+encabezado: miedo,
//     sanciones y TODAS las cotizaciones en volumen. TIENDA manda el
//     CATÁLOGO COMPLETO (14 items con descripción): cofres + estantería
//     con COMPRAR. DIVISAS: casa de cambio con COMPRAR/VENDER reales.
//     HACIENDA: sueldo COBRABLE y bóvedas (depositar/abrir) desde el mundo.
// (5) EL INTERRUPTOR 2D ↔ 3D: píldora fija en todas las pantallas —
//     2D duerme el universo y manda la consola plana clásica; 3D lo
//     despierta (el reencuentro evita repetir la ceremonia). Y desde la
//     consola 2D, CADA módulo estrena su botón VER EN 3D (PanelHeader):
//     todo vanguard 2D se puede volver 3D módulo a módulo.
// (6) LOTE INFORMATIVO: espionaje (agentes, trampas, encubierto), radar
//     de desinformación (veracidad + teorías), alianzas (clan, guerra,
//     ranking, canal) y gobierno (presidente, cargos, decretos, ranking)
//     muestran SU contenido real en filas de cristal.
// ═══════════════════════════════════════════════════════════
// v166.0 LA CASA HABITADA — «el fondo que sea creado por el módulo;
// la información va llegando con el tiempo y por el movimiento; cada
// módulo parezca una casa y voy entrando por habitaciones; ese 3D
// está feo, sí es difícil moverse».
// (1) EL FONDO CREADO POR EL MÓDULO: al entrar a una casa, su acento
//     PINTA el universo — cúpula shader propia (cenit profundo →
//     horizonte vivo del color del módulo, hazes girando lento,
//     estrellas teñidas del acento) y el planeta con todo su corte
//     DUERMEN. Cada módulo genera su propio fondo; al salir, el
//     mundo despierta (gen-counter anti-tweens-peleando).
// (2) LA CASA CON HABITACIONES: la sala de contenido nace FACHADA con
//     PORTAL (título sobre la puerta + arco vivo) y DENTRO: vestíbulo
//     + 2 habitaciones (paredes de vidrio, lámpara, zócalos, umbral
//     ardiente, letrero SALA II/III, estanterías de filas mirando al
//     centro, CUADROS GRANDES enmarcados con las imágenes y el CRISTAL
//     grande sobre columna de luz). El monumento con la inicial vive
//     en el vestíbulo. Todas las acciones reales siguen tocables.
// (3) LA INFORMACIÓN LLEGA CON EL TIEMPO Y POR EL MOVIMIENTO: el
//     vestíbulo nace encendido y cada habitación DORMIDA despierta
//     SOLA (olas ~6s) o cuando el piloto ENTRA a la sala anterior
//     (cámara leída en local de la casa) — la lámpara se enciende,
//     el vidrio sube y las filas entran en CASCADA. La info nunca
//     llega de golpe: llega cuando el piloto la gana.
// (4) EL BOTÓN AVANZAR (móvil): moverse YA NO es difícil — un dedo
//     MANTIENE el avance (misma física del teclado) y el otro mira;
//     y DENTRO de una casa el vuelo se vuelve FINO (55% de gas) para
//     atravesar puertas sin pasarse de largo.
// (5) MÓDULO SIGUIENTE: historia (12 guerras con eras y bajas),
//     estadísticas (6 stats + actividad real) y racha (récord,
//     botín, escudo) entran al emisor universal — sus casas 3D ya
//     están habitadas.
// Herencia v165 LA SALA COMPLETA y todo lo anterior.
// Herencia v164 LA REDACCIÓN EN VIVO y todo lo anterior.

// v167.0: EL ATERRIZAJE EDUCADO — la ronda 19 de caza de bugs entra en
//         producción sobre LA CASA HABITADA (la v164 local «LA CASA DE LAS
//         HABITACIONES» se RENUMERA: el remoto ya tomó v164-v166 con las
//         habitaciones y el fondo del módulo; esta ronda entrega LO QUE
//         FALTABA: tres bugs graves encontrados en QA E2E con flujo real).
// (1) EL ATERRIZAJE RE-ABRÍA LA CIUDAD ENCIMA DEL MÓDULO: los 7 reintentos
//     ×900ms de aterrizajeCiudad corren hasta ~11s tras el boot — si el
//     piloto entra a un módulo en esa ventana, un reintento tardío llamaba
//     abrirCiudad() y la ciudad VIVÍA PARA SIEMPRE encima del módulo, con
//     la sala sin anclar (verificado por cirugía: anclarSala@7915 SEGUNDO
//     de abrirCiudad@8533). TRIPLE GUARD: (a) ciudadCerradaAlgunaVez — un
//     cierre de ciudad es SIEMPRE acción del piloto; (b) salaLlaveArranque —
//     el mundo recuerda la PRIMERA sala que vio y el aterrizaje se retira
//     cuando la llave activa cambia (inmune al timing de hidratación de la
//     Casa); (c) el reintento compara la llave, no la pestaña.
// (2) SALAS VARADAS INVISIBLES: una sala montada a mitad de un vuelo (el
//     guard de v159 la deja dormida para no nacer varada) necesitaba que
//     el vuelo fuese DE CIUDAD para re-anclarse en su onDone — si el vuelo
//     era el de la ceremonia, la sala quedaba INVISIBLE para siempre.
//     WATCHDOG salaAnclaPendiente en el loop: en cuanto el vuelo suelta la
//     cámara, la sala se ancla, se acopla la pantalla y despierta.
// (3) TEXTO MICROSCÓPICO EN MÓVIL (cola v159): las letras informativas de
//     las salas genéricas suben 1.3× (0.052→0.068, prof 0.02) y las placas
//     de datos pasan de 4 en dos filas a 2 grandes en una fila (escala
//     1.22) — legible de verdad en el aparato del Dueño.
// QA v167: entrada a un módulo a los 4.5s del boot (dentro de la ventana de
//     reintentos) → ciudad:false, salaVisible:true, pantalla 899px escritorio
//     / 358px móvil; habitaciones por tiempo (8s sintéticos → 1/3) y por
//     movimiento (5.3m reales → 3/3); consola 0 errores.
// Herencia v166 LA CASA HABITADA y todo lo anterior.
// (v167.0 EL ATERRIZAJE EDUCADO pasó a la historia; ver la cola del archivo
//  para la versión viva y su crónica completa.)

// ════════════════════════════════════════════════════════════
// v169.0 LA CONSOLA PLANA (ia1 · ronda 2D del Dueño: «ve trabajando en lo 2D»
//         mientras ia2 lleva el 3D en su rama ia2/v168.0 — número libre v169).
// RONDA 19 (continúa): dos bugs graves del mundo 2D, cazados en QA E2E con
//         navegador real (agent-browser, producción next start, no dev).
// (1) EL HOME 2D INVISIBLE: al entrar por primera vez al modo 2D desde la
//     ciudad, la cadena 3D de la Casa (diorama-v137→cuna-v139→flotador-v138,
//     perspective + translateZ(-640px) rotateX(14deg) de v139Entra) podía
//     quedar proyectando el panel DETRÁS del mundo v138 (cielo estrellado):
//     el home nacía VACÍO con ~1500px de hueco inalcanzable (DOM sano,
//     opacity 1, layout en offset 0 — pero pintado fuera de vista). Cura:
//     html[data-vg-modo="2d"] APLANA la cadena completa (transform/animation
//     none, flat) — el 2D es la «consola plana clásica» y ahora NACE plana,
//     legible y completa desde el primer frame. Contrato 60 FPS intacto.
// (2) EL INTERRUPTOR SIN MEMORIA (cola v165): recargar devolvía siempre al
//     3D contra la elección del piloto. Cura: localStorage vanguard-modo —
//     recargar en 2D nace en 2D (el universo ni monta), la cortina de boot
//     ya no espera el latido WebGL (layout.tsx: modo2d ⇒ pesado=false) y la
//     consola da señal de vida propia (window.__vgvivo). Default sin
//     memoria: la ciudad sigue siendo el hogar (3D).
// QA v169 (agent-browser + next start, http 200, rss 198MB): boot directo a
//     2D con cortina fuera, home plano con héroe+manifiesto+ZONA CERO+rival+
//     noticias reales (Al Jazeera/RT/France 24) alcanzables por scroll,
//     pestaña ANÁLISIS (WORLD CRISIS) viva, tsc 0, build limpio.
// Herencia v168 (ia2, rama en vuelo) y todo lo anterior.
export const APP_VERSION = "v169.0";
export const APP_CODENAME = "LA CONSOLA PLANA";
export const APP_VERSION_LABEL = `${APP_VERSION} · ${APP_CODENAME}`;

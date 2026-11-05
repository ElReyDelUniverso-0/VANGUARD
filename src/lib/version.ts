// FUENTE ÚNICA DE LA VERSIÓN DE VANGUARD (se muestra en HUD, health y feed)
// v218.0 EL NÚCLEO — mandato del Dueño: «diseña e implementa gradualmente el
//         NÚCLEO CENTRAL de Vanguard… cada nueva función pueda conectarse al
//         resto del ecosistema sin crear una página aislada».
// ① REGISTRO CENTRAL DE MÓDULOS (src/lib/nucleo/registro.ts): censo de 20
//    módulos reales con nombre, descripción, categoría (REDACCION/MUNDO/
//    SIMULACION/COMUNIDAD/SISTEMA), ruta, permisos (publico/cuenta/dueno),
//    estado (VIVO/BETA/PLAN) y dependencias explícitas mod:/fnt:.
// ② ENTIDADES COMPARTIDAS (tipos.ts + fuentes.ts): 8 tipos (país, región,
//    acontecimiento, documento, fuente, mapa, análisis, simulación) con
//    IDENTIFICADOR ESTABLE vg:<tipo>:<clave>, relaciones tipadas y la
//    frontera de datos: 9 fuentes públicas vs 4 privadas (cuentas,
//    jugadores, telemetría, chat — JAMÁS en búsqueda ni API).
// ③ INTERFAZ COMÚN (ProveedorBusqueda/ResultadoNucleo): los módulos
//    publican y consultan por contrato, sin conocerse internamente. El
//    motor (busqueda.ts) corre 8 proveedores en paralelo con guarda de
//    frontera (esFuentePublica) y fallo honesto por fuente.
// ④ BÚSQUEDA GLOBAL: /api/nucleo/busqueda?q= (muro 30/min) + isla client
//    en /nucleo — SOLO fuentes autorizadas y reales (BD + catálogos);
//    pie por pieza declara qué fuente contestó y cuál falló.
// ⑤ FICHAS Y ENLACES CONTEXTUALES: /nucleo?id=vg:… y /api/nucleo/entidad
//    (muro 60/min) con metadatos reales + chips «CONECTA CON EL NÚCLEO»
//    server-rendered en /conflicto/[tag] y /noticia/[id]. Geografía real
//    país↔teatro (RELACION_PAIS_TEATRO).
// ⑥ NAVEGACIÓN: /nucleo server-rendered e indexable (censo agrupado,
//    mapa de entidades con conteos REALES de la BD, frontera declarada,
//    guía de extensión) + pg:nucleo en Ctrl+K + sitemap weekly 0.7.
// ⑦ CÓMO EXTENDER: src/lib/nucleo/README.md — 4 pasos para añadir un
//    módulo sin tocar el sistema. Compatibilidad total: ninguna ruta
//    movida, ninguna función tocada, cero cambios de esquema de BD.
// ⑧ PRUEBAS: scripts/pruebas-nucleo.mjs — censo íntegro (ids únicos,
//    rutas reales, dependencias existentes), búsqueda real sin fuentes
//    privadas, fichas con enlaces 200, navegación y muro 429.
// v217.0 LA EMISORA — mandato del Dueño: «ve mejorando la voz de Vanguard,
//         que hable más de guerra, tenga más información que explique y
//         pueda cambiar la voz; agrega el permiso de uno enviar audios a
//         Vanguard y uno crear una cuenta de verdad de Vanguard».
// ① EMISOR DE GUERRA (src/lib/emisor-guerra.ts): el parte que EXPLICA —
//    datos REALES de la BD (cables/24h por teatro con groupBy + último
//    titular) + dossier del teatrólogo (qué es y por qué pesa cada frente:
//    Ucrania, Gaza, Ormuz, Taiwán, Sahel, Mar Rojo, Coreas, Sudán, Líbano).
// ② CONSEJO DE VOCES +2: COMANDANTE (grave, voz de mando) y CORRESPONSAL
//    (terreno, rápida). /audios muestra los 6 chips: tocar = probar y
//    dejar elegida; el ajuste fino sigue en VG-ASSIST (v196).
// ③ /audios — LA EMISORA: PARTE DE GUERRA COMPLETO al aire (hablarAgente,
//    anti-traba v196, respeta MUTE) + GRABADOR: permiso de micrófono
//    (getUserMedia, vigía 12 s), MediaRecorder ≤90 s, envío base64 →
//    POST /api/audios (muro 10/h, techo 3 MB) → bytes en MediaFile
//    (kind="audio") + rótulo en AudioComandante (nuevo modelo); GET lista
//    30 con URL /api/media/[id]; muro con reproductor en la página.
// ④ CUENTA REAL: ya viva desde v15/v102/v195 (API auth + modal CREAR
//    CUENTA +300 mon + ritual v213); en /audios su puerta explicada con
//    CTA, y el nombre de la cuenta firma los audios.
// ⑤ PUERTAS: sitemap daily 0.7 + chip de voz nueva en el Consejo.
// v215.0 EL MUNDO — mandato del Dueño: «mejora las guerras 3D, osea como los
//         teatros; Vanguard debe ser un MUNDO 3D donde se vea EN VIVO las
//         guerras de todo el mundo, ciudades y lugares importantes 3D; un
//         modo de espiar el gobierno; un modo traductor en los idiomas de
//         Vanguard; la más alta calidad, fuerza y nunca errores».
// ① /mundo — EL MUNDO 3D: el planeta entero girando (motor GlobeMap3D de la
//    casa, globe.gl + polígonos reales): teatros de guerra ENCIENDIDOS por
//    cables reales de 24 h (anillo pulsante, color por intensidad, el último
//    titular en su etiqueta), 28 PLAZAS DEL PODER (gobiernos, ONU, OTAN y
//    gargantas: Ormuz, Babel-Mandeb, Suez, Panamá, Malaca, Zaporiyia,
//    Ártico), 6 ARCOS de fricción (Rusia▸Ucrania, Irán▸Israel, China▸Taiwán,
//    Coreas, Yemen▸Mar Rojo, Pakistán▸India) y territorios teñidos por
//    tensión. Vista OSCURIDAD/SATÉLITE/NOCHE·ciudades; sondeo /api/mundo
//    cada 60 s (solo con pestaña visible), ?teatro= enfoca, la rotación se
//    detiene al seleccionar (reactividad nueva en GlobeMap3D, sin tocar a
//    nadie), reduced-motion respeta la calma, la página JAMÁS se recarga
//    (ley v190). Server-render con instantánea en el primer byte + JSON-LD
//    CollectionPage + noscript honesto. /api/mundo: muro objeto 30/min.
// ② /espia — MODO ESPÍA (radar de gobiernos): la honestidad como técnica —
//    espía SOLO lo que los gobiernos PUBLICAN: ① índice de tensión por
//    teatro (24 h contra media de 7 días, tendencia ▲▼▶), ② escuchas
//    oficiales RSS (ONU Noticias, OTAN, Defensa EEUU, Casa Blanca, Acción
//    Exterior UE) con reloj de 4.5 s, caché de módulo 10 min y «SIN SEÑAL»
//    honesto (nunca un titular inventado), ③ movimientos de gobierno de la
//    BD real (olor a gobierno/diplomacia). Sondeo manual (botón) — nada
//    automático que no sea dato. revalidate 180.
// ③ /traductor — MODO TRADUCTOR: los 8 idiomas de Vanguard (ES·EN·PT·FR·DE
//    ·IT·ZH·RU) en UNA fuente (lib/idiomas.ts, compartida con /api/traductor
//    y el chip); estudio completo (texto libre ⇄ con núcleo IA + glosario de
//    emergencia) y «LAS ÚLTIMAS NOTICIAS EN TU IDIOMA» (cables reales de
//    /api/pulso traducidos al vuelo). /api/traductor entra al muro (20/min,
//    ley v211) y deja de tener su catálogo duplicado. Chip TRADUCIR ⇄ en
//    CADA /noticia (recuerda tu idioma en vg-traductor-idioma).
// PUERTAS: banners EL MUNDO en portada y /guerra-hoy, «VER EN EL MUNDO 3D»
//    en cada /conflicto/[tag] (→ /mundo?teatro=), MUNDO ● en la barra de
//    cada noticia, barra compartida de las 3 puertas nuevas (barra-mundo),
//    pg:mundo/pg:espia/pg:traductor en Ctrl+K, sitemap 0.9/0.8/0.7.
// Leyes intactas: v125, v189, v190, v200, v201, v211 (muro objeto), v213,
//    v214. QA: tsc 0 · eslint 0 · build EXIT 0 · /mundo, /espia, /traductor,
//    /api/mundo, chip y sitemap verificados con servidor vivo.
// v214.0 LA PUERTA — mandato del Dueño: «agrega el permiso de hablar con la
//         voz de Vanguard y hacer que las personas se registren (hacer cuenta)
//         y poner un modo de seleccionar dónde quiere ir o qué quieren hacer».
//         EL RITUAL DE ENTRADA en 3 pasos (portada, una vez por aparato):
//         ① LA VOZ — el permiso v201 se pregunta aquí (su tarjeta se aparta
//           mientras el ritual vive; mismo storage vg201-permiso-hablar).
//         ② TU CUENTA — crear/entrar con las APIs v15/204 intactas; el
//           registro puede nacer CON modo. ③ TU MODO — «¿qué quieres hacer
//           en Vanguard?» (6 puertas reales: /vertigo, /en-vivo, /guerra-hoy,
//           /zona-cero, /mision, /): vg-modo en el aparato + Account.modo en
//           la nube vía POST /api/auth/modo (muro objeto, DUEÑO ilimitado).
//         + /modo: la casa permanente del selector (modo + cuenta), franja
//           TU MODO en portada, pg:modo en Ctrl+K, /modo en sitemap (0.6).
//         Leyes intactas: v189/v190 (nada bloquea, nada navega solo — el
//         salto al modo SIEMPRE es un toque), v201 (una sola voz, el habla
//         pedida funciona, la proactiva respeta el permiso), v105 (el
//         Navegador manda DENTRO del SPA; los modos mandan ENTRE páginas).
// v181.0 EL AGENTE TOTAL — «agente que van por ti a lugares solo por decirle
//         y puedes editar y mira vanguard solo hablando» + «el otro vanguard
//         tiene el mismo bug: se queda cargando y nunca termina»:
// (1) LA VOZ VA POR TI A LOS LUGARES: rama determinista "ficha" — «muéstrame
//     la ficha de Ucrania / abre gaza / la carta VG-05» navega a LA COLECCIÓN
//     DE GUERRA y ABRIR LA CARTA con su ceremonia completa (descubrir, sello
//     fechado, placa GTA de conflicto, sonido): mirar Vanguard solo hablando.
// (2) LA VOZ EDITA LA CASA: rama determinista "idioma" — «cambia el idioma a
//     inglés» cambia el idioma de la plataforma EN VIVO (store persistente) y
//     el agente confirma EN EL NUEVO idioma; «edita mi perfil» → sala PERFIL.
// (3) EL RESCATE TOTAL (bug del otro aparato): ④ cheque de capacidades ES5
//     puro ANTES del bundle (Promise/Map/Set/fetch) — navegador que no puede
//     parsear recibe mensaje honesto, no una cortina eterna; ⑤ VIGÍA
//     POST-CORTINA fuera de React: si __vgvivo no llega (20s/68s), barra
//     honesta con RECARGAR que se retira sola si la casa respira tarde.
// (4) VIGILANTE EXTERNO por cron (30 min): health + RSS + relevo — el server
//     zombi (RSS 2176MB con vigilante muerto, la causa real del «cargando y
//     nunca termina» de hoy) ya no vuelve a quedar solo.
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

// v168.0: LA PARIDAD TOTAL — la ley #25 se cumple: el 2D es la verdad y
//         el 3D la alcanza. Dos mandatos del Dueño en una ronda:
// (1) PARIDAD 2D→3D DE LAS SALAS GENÉRICAS: 98 paneles que vivían como
//     estación informativa (letras + placas) ahora EMITEN SU CONTENIDO
//     REAL por el emisor v165 (use-sala3d-contenido): filas de cristal
//     con título arriba, datos en filas, barra de volumen y ACCIONES
//     REALES por raycast (comprar/invertir/votar/jugar/cobrar/reclamar…
//     — el mismo handler que el botón 2D). 129 paneles emiten en total;
//     el mundo asciende la sala genérica→contenido al vuelo. Fix de
//     paso: divisas mandaba la acción en MAYÚSCULAS y el oyente esperaba
//     minúsculas — contrato verbatim documentado.
// (2) EL MAPA FUERA DE LA INTRO («elimina el mapa de la intro»): la
//     ceremonia ya NO abre con el planeta de frente ni los marcadores de
//     guerra latiendo. Cámara nace en PANTALLA DE TÍTULO (logo dorado +
//     estrellas, planeta solo asoma abajo como escenario); fases
//     «globo»/«marcadores» eliminadas (mundo-webgl) y «earth»/«conflict»
//     eliminadas del cine sin WebGL (intro-cinematica, 8.3s→6.8s). El
//     mundo real (atmósfera + teatros) se enciende AL ENTRAR
//     (encenderMundo) — paridad exacta con el reencuentro.
// Herencia v167 EL ATERRIZAJE EDUCADO (triple guard intacto) y todo lo anterior.

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

// v170.0: LA CONSOLA HERMOSA — el Dueño: «más hermoso visualmente, más fácil
//         de navegar, fluido — sí a todo, sigue con las propuestas».
// (1) EL RIEL DE SECCIÓN (navegación que faltaba): con ~160 módulos, saltar
//     de hermano en hermano obligaba a abrir el menú (M) o el buscador.
//     Ahora los hermanos de TU sección viven SIEMPRE a un toque, pegados
//     bajo la franja de cromo (sticky 165/199): chip de identidad de sección
//     con su acento + píldoras de cristal + la pestaña viva brilla en oro.
//     En la NUEVA PESTAÑA el riel se convierte en lanzador de las 16
//     secciones. Plegable (persistente, vg170-riel) y con fade honesto en
//     los bordes del scroll.
// (2) RECIENTES DE LA CASA: el camino que ya aprende La Cama (cama-store
//     recientes, persistido) viaja a la derecha del riel (escritorio) —
//     tus últimas salas a un toque, con el punto de color de su sección.
// (3) PREFETCH REAL — EL ASCENSOR PRIVADO: pasar el ratón por una píldora
//     del riel (o por una pestaña de la franja, vg:prefetch-tab) baja el
//     chunk del módulo ANTES del click; abrir una sala pasa de «Cargando
//     módulo...» a instantáneo. Mapa curado de ~45 módulos de alto tráfico
//     deduplicado por webpack con los dynamic() existentes; una vez por
//     módulo y por sesión.
// (4) AURORA DEL ACENTO: la casa se tiñe del color del mundo activo —
//     lavado radial fijo que respira var(--vg-acc) (oro INICIO, cian
//     INTELIGENCIA, verde MERCADO...), transición de 1.2s al cambiar de
//     sección; el CSS la apaga sola en los modos 3D y reduced-motion.
// (5) FRANJA PULIDA: línea de acento bajo la franja de cromo; ESQUELETO
//     HERMOSO: el «Cargando módulo...» ahora respira con shimmer del acento
//     (el skeleton era la cara aburrida de la casa).
// (6) FLUIDEZ: blur contenido en móvil, chispas v139 bajan el volumen en la
//     consola plana (0.55), rueda vertical desplaza el riel, overscroll
//     contenido. (contain:paint descartado a conciencia: rompería las
//     cadenas preserve-3d del diorama/cuna/flotador.)
// QA v170 (agent-browser + next start, db up): riel visible escritorio y
//     móvil 390px (38px, scrollable, sin overflow), sticky correcto bajo la
//     franja (strip 160 / riel 199), píldora navega (NEWS abrió pestaña),
//     plegado persiste (vg170-riel), NUEVA lanza las 16 secciones, prefetch
//     E2E verificado con hover real (+2 chunks en performance), 0 errores
//     de consola, tsc 0, build limpio.
// Herencia v169.0 LA CONSOLA PLANA y todo lo anterior.

// v171.0: LA FILA CERO (ia1 · ronda 2D, mandato vigente «más hermoso, más
//         fácil de navegar, fluido»). Tres piezas:
// (1) MERGE ia2/v168.0 (revisión cruzada aprobada): la ley #25 aterriza en
//     main — 129 emisores de contenido real + acciones reales por raycast
//     (QA E2E: «INVERTIDO DESDE EL MUNDO 3D: +1 USDX @ 114.11», saldo
//     MON 290→175) + el mapa fuera de la intro. scripts/serve.mjs recreado
//     (doble fork PPID 1) y persistido con git add -f.
// (2) LOS FAVORITOS — FILA CERO DEL RIEL (idea estrella del inbox v170):
//     la estrella de cada píldora fija el módulo al INICIO del riel para
//     siempre (persistente vg171-favoritos, storage blindado); los fijados
//     viajan con el punto de color de su casa aunque vivan en otra
//     sección (patrón pestañas fijadas v108, sin duplicados); recientes ya
//     no muestran lo que es favorito. El círculo de navegación se cierra:
//     tus salas de siempre a un toque, sin menú y sin búsqueda.
// (3) VERDAD EN LOS IDIOMAS: holo.entrar en los 8 idiomas ya no dice
//     «TOCA EL GLOBO» (el globo ya no participa de la intro desde v168);
//     el hint de la intro ahora usa el i18n real del piloto (antes
//     hardcodeado en español); TOAST HONESTO en VER EN 3D: si la sala no
//     vive en una ZONA del universo (ZONAS_WGL), el toast dice «toca el
//     edificio de este módulo en la ciudad» en vez de prometer un vuelo
//     que no va a ocurrir (queja del QA del merge v168).
// Herencia v170.0 LA CONSOLA HERMOSA y todo lo anterior.

// ════════════════════════════════════════════════════════════
// v172.0 EL PULSO DE LA PARIDAD (ia2 · rama ia2/v172.0 — la cola viva del
//         inbox #16, aprobada por el Dueño con «si a todo»). La paridad ya
//         existe (v168) y ya vive en main (v171): ahora hay que MEDIRLA y
//         sostenerla. Tres piezas:
// (1) TELEMETRÍA 3D vs 2D (⭐ idea estrella del inbox #16): nuevo
//     src/lib/telemetria-paridad.ts (zustand persist vg172-telemetria,
//     storage blindado, rollover diario UTC) — dos puntos únicos de medición:
//     el raycast del mundo (g.tipo === "sala", se saltan "fila" y "__pagina")
//     cuenta 3D; la caja de la Casa (game-store.spendCoins) cuenta 2D y
//     EXCLUYE los motivos «desde el mundo 3D» para no doble-contar. La
//     cuenta vive en el PERFIL: bloque «Pulso de la paridad» en el panel 2D
//     (totales, % del pulso, hoy, top salas 3D, última acción, reiniciar) y
//     línea PARIDAD 3D/2D extruida en la sala insignia del agente (verde si
//     el mundo manda, azul si la Casa gana por ahora). Sin tocar nada visual.
// (2) SONIDO DE CASCADA (idea #1): el ascenso genérica→contenido suena —
//     una gota de cristal (sine 640Hz·pitch, 70ms, ganancia susurrada) por
//     cada fila revelada en el stagger 130ms de la casa de vidrio, con
//     pitch ascendente 1→~1.7; el mundo presta su AudioContext por el nuevo
//     CtxSala3D.sonar. Diferencia el ascenso de la estación informativa.
// (3) PAGINACIÓN 3D UNIVERSAL + DENSIDAD ADAPTATIVA (ideas #4/#2): el pie
//     honesto «+N MÁS EN EL PANEL» muere — todo lo que no cabe en la casa
//     ES TOCABLE. Las placas doradas SIGUIENTE 2/3 · ATRAS 1/3 (patrón BOLSA)
//     viven al pie de la última habitación; el raycast las resuelve EN EL
//     MUNDO (accion "__pagina" → Sala3DInstancia.paginar → pintar la página,
//     clamp + firma anti-churn intacta; nunca viaja a la Casa ni se cuenta
//     como acción). Mismo estante (7 móvil / 9 escritorio) pero el resto
//     alcanzable: densidad primero (ley móvil), cero filas perdidas.
// Herencia v171.0 LA FILA CERO y todo lo anterior. Guards v167 intactos.
// ════════════════════════════════════════════════════════════
// v174.0 LA CASA EN VIVO (ia2 · REENUMERADA: el remoto tomó v173.0 con LA
//         AGENCIA CENTRAL mientras esta ronda navegaba — misma ley v170/v172.
//         ORDEN DIRECTA del Dueño:
//         «los mejores gráficos, que se actualice solo, copia los sitios
//         parecidos sin vergüenza y ELIMINA ese modo 3D»). Nota: la ronda
//         v173.0 remota (LA AGENCIA CENTRAL) trajo una SALA 3D de mapa
//         mundial — muere con el universo por la misma orden; su obra 2D
//         (motor de impacto, EL CENTRO MUNDIAL, /api/news enriquecida) se
//         conserva íntegra. Dos cirugías:
// (0) ADIÓS AL UNIVERSO: mundo-webgl.tsx (6.411 líneas), salas-3d.ts,
//     mundos-3d.ts, hud-3d.ts, ciudad-hero.tsx e intro-cinematica.tsx
//     salen del repo; page.tsx pierde 29 KB de maquinaria 3D en 51
//     operaciones atómicas (ceremonia, cápsula, holo, modo mundo,
//     interruptor 2D/3D, VER EN 3D, portales, dispatchs vg:sala3d*).
//     El emisor use-sala3d-contenido duerme con la MISMA firma — 129
//     paneles sin cambiar un byte. NavZonas se trasplanta a nav-zonas.tsx
//     (4 zonas, sin botón MUNDO). La cortina de arranque ya no espera al
//     universo: la casa plana se funde sola (solo /vanguard2 sigue pesado).
// (1) MERCADO REAL EN VIVO (los grifos de los grandes sitios, sin keys):
//     NUEVA /api/mercado — cripto vía Binance (batch 24hr + klines 1m),
//     acciones/índices/divisas vía Yahoo Finance chart — cache en memoria
//     (4s cripto / 30s yahoo / 45s velas) y fallback simulado sembrado si
//     un grifo se corta: 32 activos (10 cripto, 10 acciones, 6 índices,
//     6 divisas) con chispa de 60 puntos. NUEVO hook useMercadoVivo
//     (latido 5s, pausa honesta con la pestaña dormida, flash sube/baja).
// (2) EL HUB «MERCADO EN VIVO» — héroe de la portada: cinta de tickers
//     que camina sola (marquee 48s, pausa al hover), gráfico de velas 1m
//     con volumen (lightweight-charts, el motor open-source de TradingView,
//     ya estaba en el package.json), lista de seguimiento con chispas SVG,
//     pestañas por clase y flash verde/rojo en cada tick. QA con navegador
//     real: BTC $80-81k en vivo, velas reales de Binance, watchlist 32
//     activos, click NVDA cambia el gráfico, móvil 390px sin overflow.
// (3) LA LECCIÓN DEL DIORAMA: la cuna-v139 respira (rotateX) sobre un
//     escenario de 20.000px y proyecta el módulo superior FUERA del
//     viewport al compás del ciclo (medidas fantasma -9.999/-17.829).
//     Un terminal de datos exige horizonte firme: flotador y cuna se
//     estabilizan donde vive .vg173-terminal (:has, gate data-vg-3d).
// Herencia v172.0 y todo lo anterior. El three.js que queda es de las
// piezas propias (teatro-guerra, hangar, zona-cero, globos): no es el modo.
// ════════════════════════════════════════════════════════════

// v173.0: LA AGENCIA CENTRAL (RENUMERADA: el remoto tomó v172.0 con EL PULSO DE LA PARIDAD antes del retiro del empleado 2 — la crónica queda v171 → v172 → v173) — el mandato del Dueño: «que Vanguard sea el
//         MAYOR CENTRO DE NOTICIAS DEL MUNDO, con noticias en vivo por
//         IMPORTANCIA E IMPACTO, cada una con su pie de foto e información,
//         y mapas interactivos 3D que uno pueda ver en primera persona para
//         ver gráficos de guerra y noticias en vivo». Adiós empleado 2:
//         Vanguard ahora es obra de una sola casa.
// (1) EL MOTOR DE IMPACTO (src/lib/impacto.ts): cada cable del planeta
//     recibe su PUNTUACIÓN 0-100 determinista (vocabulario de la guerra +
//     etiqueta táctica + peso del país + credibilidad de la fuente +
//     frescura) y su escalón: URGENTE → CRÍTICO → ALTO → DESARROLLO →
//     CONTEXTO. La misma noticia puntúa siempre igual: la Agencia es
//     auditable línea a línea.
// (2) /api/news sale ENRIQUECIDA (aditivo, nada se rompe): impacto, tier,
//     pie de foto y «POR QUÉ IMPORTA» en TODA respuesta; ?modo=centro
//     sirve el RANKING por impacto con el héroe y el pulso de la Agencia
//     (urgentes, países, cable más fresco, impacto medio).
// (3) EL CENTRO MUNDIAL (tab centro, primera de INICIO + baldosa del home):
//     HÉROE DE IMPACTO con foto grande + PIE DE FOTO + medidor 0-100,
//     escalera de escalones con contadores, ranking en vivo con
//     miniaturas/pie/bandera/edad, pulso de la Agencia y refresco cada 60s
//     con badge NUEVO. La SALA DE LECTURA (v116) abre cada cable (2D=verdad).
// (4) LA SALA DEL MAPA MUNDIAL (TipoSala3D "mapa" — la 16ª insignia): EL
//     MAPA QUE V168 RETIRÓ DE LA INTRO VUELVE COMO SALA COMPLETA (compatible:
//     cero bloqueo de ceremonia). El planeta REAL (textura equirectangular)
//     inclinado como mesa de guerra; cada cable aterriza en SU país con
//     viga cuya altura ES su impacto, orbe con el color de su escalón,
//     anillo de alarma si nació hace <2h, foto texturizada (top 6, dieta
//     móvil) y PIE DE FOTO revelado POR PROXIMIDAD (v165). Barrido de
//     escáner, retícula de carta naval, cartel EN VIVO latiendo. Tocar un
//     marcador abre el lector en la Casa (protocolo Casa⇄Mundo, ley #25).
// (5) NADA SE ROMPE: news-panel, OJO DE DIOS, verdades y las 129 salas 3D
//     siguen vivos — el motor de impacto solo añade capa sobre la verdad.

// v175.0: LAS INTROS GTA (ia1 · REENUMERADA: el remoto tomó v174.0 con LA
//         CASA EN VIVO mientras esta ronda navegaba — misma ley v170/v172.
//         Ronda del Dueño: «que Vanguard tenga intros hermosas, diferentes,
//         como las de GTA pero de noticias, personajes») — la tarjetería de
//         cine de la casa, montada sobre las dos puertas que ya existían
//         (nada nuevo que aprender):
// (1) LA PLACA DE PERSONAJE (intros-gta.tsx · IntroGtaPersonaje): el
//     cambio de personaje de GTA V al elegir un rostro en LOS ROSTROS DEL
//     PODER — letterbox de cine entra por arriba y por abajo, la bandera
//     respira con zoom Ken Burns, el NOMBRE aterriza en dos tiempos
//     (pila pequeña + apellido GIGANTE con sombra dura), el color del
//     corte de poder (tronos/dinero/tribunal/nuevos) tiñe la escena, la
//     placa de ubicación desliza con coordenadas reales al estilo carta
//     naval y las tres barras de atributos (PODER/ALCANCE/SEÑALES EN
//     VIVO) suben como las habilidades del juego. Suena en la consola al
//     elegir cada rostro (el oyente vg:sala3d-accion del panel duerme con
//     el universo retirado — cuando despierte, la placa ya sabe sonar).
// (2) LA PLACA DE NOTICIA (intros-gta.tsx · IntroGtaNoticia): la tarjeta
//     de inicio de misión al abrir un cable en la SALA DE LECTURA —
//     sello de LA AGENCIA CENTRAL con punto EN VIVO pulsando, el escalón
//     del motor de impacto con su medidor llenándose (misma verdad que
//     el ranking), el titular entrando PALABRA A PALABRA y la
//     placa de fuente con bandera y credibilidad. Una vez por cable por
//     sesión: quien ya la vio entra directo a leer.
// (3) CONTRATO DE LA CASA intacto: portal propio al body (lección v116),
//     solo transform/opacity (las barras escalan con scaleX, nunca width,
//     var --vg-stat), tap = saltar siempre, reduced-motion = no hay cine
//     (kill-switch CSS + guard JS), móvil primero, z-300 bajo el tráiler;
//     las clases v174gta-* conservan su nombre (patrón vg172-telemetria).
// (4) NADA SE ROMPE: ni una línea del lector v116 ni del dossier v130
//     cambió de comportamiento — las placas son capa pura sobre la verdad;
//     compatible con LA CASA EN VIVO (sin modo 3D): las placas no tocan
//     el universo, solo las puertas 2D que sobrevivieron a la cirugía.
// v176.0: LAS FICHAS DE GUERRA (ia1 · la ronda del Dueño: «sí a todo — haz
//         tarjetas de placas también, crea fichas coleccionables de conflictos
//         mundiales, de noticias únicas de cada guerra») — la tercera tarjeta
//         de la familia GTA (idea #1 del inbox #19) y el álbum que la guarda:
// (1) EL CATÁLOGO (src/lib/fichas-guerra-data.ts): las 9 guerras del mapa
//     conflictTag de /api/news (ukraine, gaza, lebanon, sudan, redsea, korea,
//     taiwan, hormuz, sahel) como FICHAS COLECCIONABLES VG-01…VG-09: bandos,
//     teatro, coordenadas, inicio histórico verificable y contexto — los datos
//     históricos son fijos y citables; lo que respira lo pone el feed real.
// (2) LA RAREZA VIVA — la decrece el motor de impacto con los cables de HOY
//     de ESA guerra (LEYENDA ≥80 · ÉPICA ≥64 · RARA ≥48 · COMÚN ≥32 ·
//     SILENCIO sin señales): la misma verdad del ranking del Centro Mundial,
//     una sola fuente, cero invención — sin cables, la carta duerme, no miente.
// (3) LA NOTICIA ÚNICA — cada ficha porta el cable de mayor impacto de SU
//     guerra con foto + pie + POR QUÉ IMPORTA + las señales del día (los
//     cables de esa guerra) + el lector v116 — «noticias únicas de cada guerra».
// (4) EL ÁLBUM (vg176-fichas): abrir una ficha la DESCUBRE — sello con fecha
//     e intensidad del día, progreso X/9, contador de aperturas; persistencia
//     con el escudo de la casa (storageBlindado) y REGISTRO EN EL REHIDRATADOR
//     (la lección v171/v172: sin registro, la cerradura bloquea la escritura).
// (5) LA PLACA DE CONFLICTO (intros-gta.tsx · IntroGtaConflicto) — la tercera
//     tarjeta GTA: letterbox, los DOS BANDOS frente a frente (A ✕ B), sello
//     de rareza de la colección, medidor de intensidad con la misma verdad
//     del ranking, placa del teatro con coordenadas y las barras PULSO/
//     FRESCURA/INTENSIDAD subiendo como las habilidades del juego; una vez
//     por ficha por sesión (vg176-ficha-*, patrón vg174-gta-ultimo), tap =
//     saltar, reduced-motion = no hay cine, portal al body, z-300.
// (6) LA PUERTA — tab FICHAS en la sección INICIO junto al CENTRO MUNDIAL,
//     prefetch real, i18n en 8 idiomas; el feed refresca cada 60s y la caché
//     local sostiene el álbum si la red se corta.
// Herencia v175.0 y todo lo anterior — 100% 2D, compatible con LA CASA EN VIVO.
// v177.0 EL CINE DE LA CASA — el cierre de la queja del Dueño («vanguard dura
// horas cargando y ya no avanza y no hay intro como gta en vanguard»), en dos
// actos sobre la verdad integrada (main remoto v173→v176):
// (1) EL CUELGUE, CURADO DE RAÍZ: el server `next dev` (1.8GB RSS) moría
//     silenciosamente por OOM-killer — el teléfono veía «cargando horas»
//     porque el server YA NO EXISTÍA (reproducido 2× en QA con navegador
//     real). Cura: build de producción + scripts/serve.mjs --prod (doble fork
//     huérfano PPID 1, ~197MB RSS, inmune al OOM). La cortina v155 queda de
//     red de seguridad del cliente.
// (2) EL CINE DE LA CASA (nuevo cine-entrada.tsx): la entrada GTA de noticias
//     renace en la PUERTA 2D del arranque — port del cine que nació con la
//     ceremonia del mundo 3D retirado. 6 PLACAS a pantalla completa: foto
//     real con duotono del acento de CADA conflicto (RUSIA—UCRANIA oro, LA
//     REGIÓN EN LLAMAS fuego, LA RUTA DEL PETRÓLEO azul, QUIÉN MANDA violeta,
//     NO DUERME. REPORTA. cian, EL CENTRO DE NOTICIAS oro), tipografía
//     condensada en itálica (Rajdhani hasta 5.4rem), ceja de agencia, dato
//     duro con filo de acento, Ken Burns (solo transform/opacity: 60 FPS
//     móvil), barras letterbox, progreso GTA y SALTAR siempre. Una vez por
//     sesión (vg-cine-entrada-v177), reduced-motion no ve cine, la consola
//     vive detrás (nada se bloquea), tocar avanza (auto 2.15s por placa).
//     Convive con la familia GTA existente (v174 remota: personaje en ROSTROS
//     + noticia en el LECTOR; v176: conflicto en FICHAS) — ahora el arranque
//     TAMBIÉN tiene su tráiler de cine.
// (3) NADA SE ROMPE: fichas de guerra v176, centro mundial v173, intros GTA
//     v174, cortina v155, guards y álbum intactos; el cine comparte el CSS
//     .vg174-cine (ya fusionado en globals.css) — cero duplicados.
// v178.0 EL DESPERTADOR — la cortina jamás vuelve a ser eterna. El Dueño
// reportó de nuevo: «se queda en desplegando universo y ya cargando» CON el
// servidor sano (health 200, RSS 208MB): la causa era cliente, no infra.
// Diagnóstico con navegador real sobre producción local: la cortina de `/`
// esperaba document.readyState==='complete' (el EVENTO LOAD entero — con
// chunks de 1.1–1.3MB, una conexión móvil estancada deja readyState en
// 'interactive' indefinidamente) y las rutas no-pesadas NO tenían botón de
// rescate ni tope (los timers de rescate eran exclusivos de /vanguard2).
// Segundo bug eterno cazado en la misma sala: en pesado, el ojo hacía
// clearInterval a los 20s — si __vgvivo llegaba tarde, la cortina ya no se
// levantaba NI CON señal de vida.
// (1) LA CURA TRIPLE EN LA CORTINA (layout.tsx): ① la casa plana se funde de
//     la cortina en cuanto el DOM existe (readyState!=='loading' — el HTML
//     prerenderizado YA ES la casa entera; el load dejó de mandar); ② botón
//     «toca para despertarlo» también en rutas ligeras (10s) y TOPE DURO de
//     20s: la cortina jamás es eterna; ③ en el universo pesado el ojo ya no
//     muere a los 20s (la señal tardía despierta igual) + tope duro de 60s.
// (2) LA SEÑAL DE VIDA PROPIA RESTAURADA (page.tsx, lección v165 que se fue
//     con el universo 3D): la Casa pone window.__vgvivo=true al montar — la
//     cortina se funde cuando la consola RESPIRA, no cuando el load termina.
// (3) EL CINE RENACE CADA DÍA (cine-entrada.tsx): la clave de sesión llevaba
//     semanas inmortal (una sesión de PWA móvil dura semanas = «no hay intro
//     como gta»); ahora es DIARIA con fecha LOCAL del aparato
//     (vg-cine-entrada-v178-YYYY-MM-DD): el Dueño ve SU intro GTA cada día
//     que abre Vanguard, sin repetir el mismo día. Reduced-motion sin cine.
// v179.0 EL AGENTE DE VOZ — VG-ASSIST, el Siri de la Casa. El Dueño pidió
// «un modo voz para entrar en la pestaña y un agente como Siri».
// (1) EL ORBE (asistente-voz.tsx): botón flotante en toda la app (abajo a la
//     derecha, nunca pisa la NavZonas) con núcleo de gradiente cónico vivo
//     ámbar/verde HUD; estados reales: escuchando (ondas) → pensando (giro)
//     → hablando (ecualizador). Panel con transcripción en vivo + orden
//     escrita de respaldo: el agente NUNCA se queda mudo (sin mic o permiso
//     denegado → aviso honesto + modo texto).
// (2) EL OÍDO: Web Speech API del aparato (gratis, sin servidor) en los 8
//     idiomas de la Casa (es-ES, en-US, pt-BR, fr-FR, de-DE, it-IT, ru-RU,
//     zh-CN) con resultados intermedios en vivo.
// (3) EL CEREBRO (/api/asistente): LLM con whitelist REAL de salas (i18n-tabs
//     es la fuente única — el destino validado server-side jamás inventa
//     claves), MURO 20/min por IP y reloj 15s; sin IA disponible → intérprete
//     determinista (abre/busca/menú por vocabulario). Devuelve hablar + accion
//     { navegar | buscar | menu | hablar }.
// (4) LAS MANOS (page.tsx): evento vg:asistente-accion — navegar resuelve por
//     el RESOLUTOR DE SALA v125, buscar abre la paleta con consultaInicial
//     pre-cargada (consumo de una sola vez por ref), menú despliega el Mega.
// (5) LA BOCA: speechSynthesis del aparato, voz del idioma del piloto,
//     rate 1.18 (rápida, el ADN del tráiler), pitch 0.95.
// v180.0 VANGUARD AUTOMÁTICO — EL RADAR QUE TE BUSCA. El Dueño: «haz que
// Vanguard sea automático, que no necesite que una persona necesariamente
// esté buscando, porque se puede perder; solo busca noticias y ahí están
// los ayudantes». Tres piezas:
// (1) EL CENTINELA DE IMPACTO (centinela-impacto.tsx): radar autónomo en
//     toda la app — sondea /api/news?modo=centro cada 60s, dedupe real por
//     id (localStorage vg180-vistos, tope 300), SIEMBRA SILENCIOSA en la
//     primera vuelta (el archivo previo no es «noticia nueva para ti») y
//     cuando aterriza un cable NUEVO ≥64 (CRÍTICO/URGENTE): toast con el
//     titular real + VG-ASSIST lo ANUNCIA POR VOZ (vg:asistente-anunciar),
//     máx 2 toasts por sondeo y 1 voz cada 45s (nada de bombardeo); se
//     pausa con la pestaña oculta (el radar respira).
// (2) EL BRIEFING HABLADO (/api/asistente): «léeme las noticias» / «¿qué
//     pasa?» → rama DETERMINISTA antes del LLM que pregunta al motor en
//     vivo y devuelve hablar + briefing[] con los cables reales (título,
//     país, impacto, tier, edad) + navega al CENTRO MUNDIAL. Cero
//     alucinación: los cables no los redacta la IA, los entrega el motor.
// (3) EL PANEL DEL AGENTE: chips nuevos — «LÉEME EL MUNDO» (briefing a un
//     toque) y «VOZ DE ALERTAS ON/OFF» (vg180-voz-alertas: la voz del radar
//     se puede callar, el radar no); los cables del briefing se pintan en
//     el panel con su impacto en color.
// v182.0 EL ÚLTIMO RESCATE — el Dueño lo vio OTRA VEZ: «no termina de
//         cargar, se queda en iniciando universo» CON el server sano (health
//         v181.0, RSS 206MB, HTML servido con los marcadores v181 y no-store)
//         y con la cortina v181 de tope duro 20s/60s. El agujero final: TODO
//         el rescate v178/v181 vive en TIMERS DE JAVASCRIPT — si el hilo
//         principal del aparato muere o bloquea (pestaña congelada por el SO,
//         chunk que spinea el hilo en un móvil viejo), los timers nunca
//         corren y ningún rescate JS se ejecuta. La cura es HTML PURO: un
//         <meta http-equiv=refresh> de 70s DENTRO de la cortina — pasado el
//         tope pesado de 60s, el NAVEGADOR mismo recarga sin depender del
//         hilo, de timers ni de React. Arranque sano: apagar() mata el meta
//         al instante (≤20s/≤60s) y el refresh jamás dispara. Guardia
//         anti-bucle: si hace <90s ya hubo un rescate, el meta se estira a
//         300s (un reintento lento cada 5 min, nunca un bucle vertiginoso).
// Herencia v181.0 y todo lo anterior — cortina v155 de red de seguridad,
// guards v167 intactos, rewrite /socket.io intacto, 100% 2D fiel a la Casa.
// v183.0 LA GLORIA — Orden del Dueño: «creal algo que haga que las personas
//         las necesite presumir exclusivo algo emocionante que las personas
//         se vuelvan adicta estilo vanguard». La capa de gloria sobre LAS
//         FICHAS DE GUERRA v176 (la colección viva del linaje):
// (1) EL SELLO DORADO 1/1 — abrir una ficha mientras SU guerra arde en
//     LEYENDA (impacto ≥80) graba TU hora exacta («SELLO DORADO · VG-01
//     captada 21:47 · IMP 87»): la rareza viva es efímera, si no abres la
//     carta en esa hora el sello NUNCA vuelve a existir — nadie más en el
//     mundo puede tener el tuyo. Exclusividad honesta: tu sello = tu
//     momento de la historia, cero invención.
// (2) PRESUMIR — botón PRESUMIR FICHA: canvas nativo → PNG 640×800 con la
//     carta completa (bandos, LA NOTICIA ÚNICA, sello) → navigator.share
//     con Files (WhatsApp/X/lo que haya) y descarga de respaldo; y en el
//     PERFIL la VITRINA DE LA GLORIA: 12 títulos (solo se visten los
//     ganados), 3 huecos de fichas elegidas, cifras de oro y PRESUMIR
//     VITRINA (PNG del escaparate entero).
// (3) ADICTO — LA RACHA DEL CAZADOR (abrir ≥1 ficha al día sostiene la
//     llama, el bucle Duolingo de la casa), 12 TÍTULOS GLORIA con el
//     PRÓXIMO TÍTULO siempre mostrando su progreso (el casi-alcanzado
//     que muerde) y el FOMO de la hora dorada. Ceremonia: toasts + sfx
//     achievement/levelUp. Persistencia vg183-gloria con el escudo de la
//     casa + registro en rehidratador (la lección v171/v172/v176).
// Herencia v182.0 y todo lo anterior — cortina v155 de red de seguridad,
// guards v167 intactos, rewrite /socket.io intacto, 100% 2D fiel a la Casa.
// v183.1 EL RELEVO — el Dueño (móvil) volvió a ver «Desplegando el universo»
//         horas con el despliegue SANO: la pestaña que su teléfono mantenía
//         viva era de una versión anterior y jamás se enteraba de que detrás
//         había una casa nueva. Dos curas:
// (1) EL RELEVO DE PESTAÑAS (connection-watchdog.tsx): la sonda de /api/health
//     lee la versión del latido — la primera respuesta fija el nacimiento de
//     la pestaña y cualquier versión distinta posterior (despliegue nuevo)
//     levanta la píldora «VANGUARD SE ACTUALIZÓ» y recarga UNA vez con
//     guardia anti-bucle de 90s: ninguna pestaña vuelve a nacer en el pasado.
// (2) LA BD RESPIRA EN VERCEL (src/lib/db.ts + next.config.ts): el lambda es
//     de solo lectura y el .env no viaja — DATABASE_URL moría y /api/health
//     reportaba db:"down" con 48 rutas en fail-soft. El resolver ahora busca
//     db/custom.db (que viaja en el output tracing), usa tal cual si es
//     escribible (casa local) y si es de solo lectura se copia a /tmp y el
//     cliente apunta allí: db:"up" real en producción, sin servicios externos.
// v184.0 LA CORTINA DE PIEDRA — el Dueño la vio OTRA VEZ con captura real
//         (2026-10-27, Chrome móvil): «al principio sí carga, después entra
//         una segunda pantalla de carga y no termina nunca» — cortina viva
//         con el texto ORIGINAL, SIN botón y SIN mensaje de fallo = los
//         timers del ojo NUNCA corrieron. Diagnóstico: el aparato congeló o
//         mató la pestaña A MITAD DE CARGA y Chrome pintó el ÚLTIMO
//         fotograma (la cortina) — un renderer muerto no corre timers, así
//         que ni el ojo v178, ni el vigía v181, ni el meta v182, ni el
//         relevo v183.1 podían salvarla. TRES curas en la cortina:
// (1) LA CORTINA DE PIEDRA (CSS del compositor): la opacidad la anima el
//     hilo del COMPOSITOR, que sigue vivo aunque el hilo principal esté
//     muerto — animation con delay 75s + fill forwards funde la cortina
//     SOLA, sin JS, y deja ver la casa prerenderizada detrás. En un
//     arranque sano jamás se ve: apagar() retira el nodo en ≤1s.
// (2) EL ANTI-BUCLE VERDADERO — bug real cazado en el código: la guardia
//     v182 solo registraba las recargas del BOTÓN (recargar()), pero el
//     meta que recarga SOLO no dejaba rastro → una carga atascada se
//     reanimaba cada 70s ETERNA. Cura: CADA arranque estampa su hora en
//     sessionStorage; si la carga anterior nació <90s atrás, el meta nace
//     a 300s — máximo un ciclo extra, luego un reintento lento cada 5 min.
// (3) LA RESURRECCIÓN (visibilitychange→visible): si la pestaña vuelve a
//     primer plano con la cortina viva, se mata YA — mejor cara viva que
//     cortina muerta; si la casa de verdad está muda, el vigía honesto
//     aparece 20s después con su RECARGAR.
// Herencia v183.1 y todo lo anterior — cortina v155 de red de seguridad,
// guards v167 intactos, rewrite /socket.io intacto, 100% 2D fiel a la Casa.
// v185.0 EL SOCORRISTA — la cura de la SEGUNDA PANTALLA real: la cortina
//         v184 ya muere sola (piedra CSS a 75s), pero DETRÁS está la casa
//         prerenderizada llena de «Cargando módulo...» (paneles dynamic
//         ssr:false). Si el bundle de la Casa nunca baja (señal móvil
//         estancada — HTML de 535 KB + chunks de 1.1–1.3 MB) o la
//         hidratación muere en silencio, el Dueño se queda mirando ESO
//         para siempre: la barra vigía v181 era pequeña y nadie la veía.
//         Tres curas coordinadas, todas fuera de React:
// (1) LA SEÑAL TEMPRANA __vgcasa (page.tsx + vanguard2.tsx): dispara en
//     cuanto el bundle LLEGA Y PARSEA — distingue «el bundle no llega» de
//     «el bundle llegó y la casa está hidratando» (recargar una hidratación
//     en marcha tiraría el progreso de la descarga).
// (2) EL SOCORRISTA (script inline de layout.tsx): a los 50s sin __vgcasa
//     (100s en pesado) = el bundle nunca llegó → SOCORRO A PANTALLA
//     COMPLETA dorado con ENTRAR DE NUEVO + UNA reanimación automática
//     con guardia sessionStorage de 3 min (jamás un bucle); a los 90s con
//     __vgcasa pero sin __vgvivo (150s en pesado) = hidratación atascada →
//     socorro SIN auto-recarga. Si la casa despierta tarde, el socorro se
//     retira solo (vigía cada 1s, tope 3 min).
// (3) EL PROGRESO VERDADERO (la cortina): mientras la descarga avanza, el
//     estado dice los KB REALES llegados (performance API) — «Descargando
//     la casa · 412 KB» — en vez de una mentira eterna; se retira en
//     cuanto enciende el botón de rescate (sus mensajes mandan).
// Herencia v185.1 y todo lo anterior — cortina v155 de red de seguridad,
// guards v167 intactos, rewrite /socket.io intacto, 100% 2D fiel a la Casa.
// v186.0 EL SALVAVIDAS — el Dueño probó v185 CON captura real: «casi vi la
//         pantalla normal por un segundo pero aun sigue» (tablet Android,
//         Chrome). La captura dice: cortina viva, texto ORIGINAL, sin
//         progreso KB, sin botón — y su frase dice lo más importante: UN
//         REINTENTO SÍ ABRIÓ (vio la casa un segundo) antes de morir de
//         nuevo. Dos curas:
// (1) EL BOTE SALVAVIDAS: si un reintento puede abrir, el socorrista modo 1
//     ahora rema hasta TRES veces por ventana de 10 min (vg186-n/vg186-t en
//     sessionStorage, tope duro, ventana que expira, rastro completo) — a la
//     cuarta, el mando pasa al Dueño (botón ENTRAR DE NUEVO). Carril rápido:
//     si la sesión ya se atascó antes, el socorro llega a los 30s en vez de
//     50s — nadie espera lo que ya se sabe atascado.
// (2) LA PLACA DE VERSIÓN: la cortina lleva «despliegue v186.0» grabado (viaja
//     también en el vigía y en el socorro) — cada captura del Dueño
//     diagnostica sola: ¿pestaña vieja sin el build nuevo o build nuevo
//     atascado? Adiós a adivinar la versión por el texto.
// v187.0 EL CINE HONESTO — el Dueño soltó LA PIEZA QUE FALTABA: «a la IA
//         original le dije que al principio haga una cinemática tipo GTA
//         cuando esté cargando — desde ese día no ha vuelto a cargar bien
//         vanguard». La cinemática (cine-entrada.tsx, v177) arranca 900ms
//         DESPUÉS de que la casa despierta: el Dueño ve su consola un
//         segundo («casi vi la pantalla normal por un segundo»), el cine la
//         tapa entera — placas oscuras + barras de progreso + 1.3MB de
//         fotos que en su señal llegan negras — y PARECE otra pantalla de
//         carga eterna. El cine no era la carga, pero nadie podía
//         distinguirlo. Tres curas:
// (1) EL CINE HONESTO: cartel permanente «EL CINE DE ENTRADA · n de 6 — LA
//     CASA YA ESTÁ DESPIERTA» y botón GIGANTE «SALTAR EL CINE» dentro de la
//     barra letterbox inferior (zona del pulgar, imposible de no ver); las
//     placas respiran 1.5s (9s totales, antes 13s).
// (2) EL CINE SE CALLA SI HUBO SUFRIMIENTO: si esta sesión ya pasó por
//     socorro/vigía/bote (vg187-sufrio / vg186-n, ventana 10 min) o la casa
//     tardó >12s en despertar (vg155-recarga = sello de arranque de ESTA
//     carga), el cine NO juega hoy — la casa se abre directa, sin una
//     pantalla más que se pueda confundir con carga.
// (3) EL TESTIGO: el primer error de script y la primera promesa rota de
//     cada pestaña quedan escritos (vg187-err, con la 1a línea del stack,
//     sin regex — indexOf a prueba de template literals) y el socorrista
//     los muestra como «CÓDIGO: …» — la próxima captura del Dueño trae la
//     CAUSA real de su aparato, no una adivinanza.
// v188.0 EL PACIENTE — la captura del Dueño (cortina v187, batería 4%) y su
//         relato («entro, aparece la pestaña normal y otra vez entra la
//         pantalla de carga; 30 segundos después pasa lo mismo») cazaron el
//         BUCLE DE INANICIÓN: el bote v186 recargaba a los ~34s y TIRABA la
//         descarga a medio camino — y una respuesta sin TERMINAR no se
//         cachea: cada reintento volvía a bajar 1.8MB DE CERO en una señal
//         que necesita más de 34s. Matemática de nunca terminar. Curas:
// (1) EL PACIENTE: instrumentos de vida del chorro (vgCargaTerminada cuenta
//     cada script/estilo _next que TERMINA, capture; vgPendientes los que
//     siguen en el alambre; vgChorroVivo = algo terminó hace <15s, o la
//     primera ola aún viaja con tope de 75s). El socorro modo 1 ya no
//     recarga a los 4s: ESPERA mientras el chorro viva, dice «Descarga:
//     X KB llegados · el chorro sigue vivo» y solo reanima si está
//     ESTANCADO de verdad. El bote se gasta solo al recargar de verdad.
// (2) UNA SOLA FUENTE DE KB (kbCasa): la cortina y el socorro dicen la
//     misma verdad (performance API, indexOf, jamás regex — lección v185.1).
// (3) LA NOTA DE BATERÍA: si el aparato está <15% y sin cargador (Battery
//     API), la cortina y el socorro lo dicen a la cara — el ahorro de
//     energía frena el CPU y la señal; «conéctalo y abrirá rápido».
// (4) AVISO HONESTO DE FASE: si __vgcasa llega con el socorro vivo, el
//     texto cambia a «la descarga llegó entera — la casa está despertando».
// v189.0 ADIÓS AL CINE — el Dueño ya no tiene confianza («vanguard sigue
//         igual, no has solucionado nada») y la pieza que él mismo nombró
//         como la raíz del mal SEGUÍA VIVA: tres curas sucesivas (v178
//         diaria, v187 honesta, v188 paciente) no le devolvieron la fe.
//         La decisión definitiva no es otra cinemática más lista: es
//         QUITARLA. Curas:
// (1) EL FIN DEL CINE: <CineEntrada /> retirado del árbol (page.tsx) —
//     ningún aparato volverá a ver su consola despierta tapada por placas
//     oscuras, barras de progreso ni 1.3MB de fotos que en señal mala
//     llegan negras y PARECEN otra pantalla de carga eterna. La casa
//     despierta y YA ESTÁ. Si algún día vuelve, será OPT-IN con un botón
//     dentro de la consola — jamás automática al arranque.
// (2) EL ERROR NO ES VIDA (layout inline): vgCargaTerminada marcaba TODO
//     fin de recurso como vida del chorro — incluso un 404 «alimentaba»
//     al paciente y el socorro esperaba eterno frente a un cadáver.
//     Ahora un recurso que termina ROTO deja de contar como pendiente
//     pero NO refresca la hora de vida: el chorro muere honesto a los
//     15s y el bote puede reanimar un atasco real (con su tope de 3).
// (3) EL BOTÓN DE LA SALIDA LIMPIA: si el bote se agotó (3 reanimaciones),
//     el socorro ofrece «ACTUALIZAR AHORA» — limpia caches API y pide la
//     casa con otro nombre (?vg189=hora): el navegador baja HTML fresco
//     con chunks vivos en vez de reintentar eternamente los mismos 404
//     de un documento viejo guardado en el aparato.
// v189.0 LA LEY SAGRADA — «entro carga bien y después vuelve a cargar y 30
//         segundos exactos recarga de nuevo: injugable». La autopsia halló
//         TRES gatillos de recarga peleándose con una señal lenta: carril
//         rápido v186 (socorro a los 30s EXACTOS en sesiones ya atascadas),
//         bote/paciente que RECARGABAN al detectar estancamiento, y meta de
//         rescate a 70s que mataba el HTML aún en vuelo. Cada recarga tiraba
//         la descarga (una respuesta sin terminar no se cachea) y el
//         reintento empezaba DE CERO: matemática de nunca terminar. La cura
//         es una LEY: NADA SE RECARGA SOLO. JAMÁS.
// (1) BOTE Y PACIENTE EJECUTIVOS MUERTOS: el socorro modo 1 es un monitor
//     honesto (KB reales cada 5s: «el chorro sigue vivo» / «señal lenta —
//     la descarga NO se suelta: sigue») que JAMÁS recarga; el reintento
//     vuelve a ser un botón del Dueño (ENTRAR DE NUEVO).
// (2) CARRIL RÁPIDO DE 30s MUERTO: era el gatillo exacto del bucle.
// (3) META DE RESCATE SIEMPRE A 300s: solo dispara si JavaScript jamás
//     ejecutó (hilo muerto); apagar() lo desarma en ≤20s/≤60s.
// (4) ERRORES DE MÓDULO NO RECARGAN: la casa hidrata con lo que llegó; el
//     fallo se dice a la cara y el reintento es del Dueño.
// (5) __vgcasa POR FIN NACE: v185 la leía pero NADIE la seteaba (el socorro
//     decía «la casa no llega» CON la descarga ya completa) — cuando el
//     último _next termina, la casa anuncia «la descarga llegó entera».
// v190.0 LA DOBLE LEY — fusión de las dos leyes v189 hermanas: el cine
//         muere (ADIÓS AL CINE) y NADA se recarga solo (LA LEY SAGRADA).
// v191.0 EL ALGORITMO — mandato del Dueño: «haz que Vanguard tenga un
//         algoritmo como TikTok, mejora los videos, los en vivo, los
//         memes; que Vanguard produzca contenido nuevo y tenga
//         animaciones en cierto tiempo». Cuatro motores:
// (1) EL ALGORITMO (lib/algoritmo-feed.ts): PARA TI puntúa como TikTok —
//     engaño (log de likes) + frescura (vida media 10h) + afinidad
//     aprendida en localStorage (lo que miras y te gusta pesa más,
//     perfil que NADIE más ve) − visto-hace-poco, con entrelazado de
//     diversidad (jamás 3 tarjetas del mismo tipo seguidas) y chip
//     HONESTO «porque miras MEMES» en cada tarjeta — el algoritmo da
//     la cara, no es una caja negra.
// (2) EL PRODUCTOR (lib/productor-vivo.ts): Vanguard fabrica PULSOS
//     nuevos con el tiempo — efemérides reales de Wikimedia, el meme
//     del día de la galería, el cable caliente de GDELT por impacto,
//     confrontas VS y preguntas al mundo — primera hornada al abrir y
//     1 pulso nuevo cada 4 min con la pestaña visible: el feed JAMÁS
//     vuelve a amanecer vacío.
// (3) MEJORAS videos/en vivo/memes: la galería de memes comunitaria y
//     la TV de Vanguard ENTRAN al algoritmo con sus likes/views reales;
//     tres vistas (PARA TI / RECIENTE / EN VIVO) con control segmentado;
//     doble toque = corazón con ráfaga (el gesto TikTok); autoplay mudo
//     del slide activo (política de móviles); chips de cruce en
//     GlobalVision y EN VIVO MUNDIAL hacia PARA TI.
// (4) EL PULSO TEATRAL (pulso-teatral.tsx): animaciones en cierto
//     tiempo — cada 6 min, 2.8s de barras de cine + titular del mundo.
//     Ley de la casa respetada: jamás antes de 75s de vida, jamás con
//     la pestaña oculta ni movimiento reducido ni la casa muerta,
//     pointer-events none, 0 bytes de red, se retira solo.
// v192.0 EL ESTRENO — el Dueño pidió cinemáticas, portadas distintas y
//         voces de agentes claras/diferentes/menos robóticas, y aquí van
//         las TRES con las leyes respetadas: (1) EL CONSEJO DE VOCES —
//         cada agente con voz PROPIA (pitch/rate/voiceURI distinta por
//         reparto estable, rate humano 0.86–1.06, preferencia por
//         neuronales): CENTINELA grave, LA ANALISTA brillante, VG-ASSIST
//         de mando, EL NARRADOR de radio; (2) PORTADAS VIVAS — cuatro
//         portadas cinematográficas seleccionables para el inicio con
//         AUTO-rotación CSS (NADA se recarga solo) y cero imágenes;
//         (3) LA CINEMÁTICA DEL ESTRENO — tráiler de la Casa que JAMÁS
//         corre durante la carga, se estrena UNA vez por versión solo si
//         la casa despertó sana, SALTAR GIGANTE siempre y cero bytes de
//         red: los agentes se presentan hablando con sus voces nuevas.
// v193.0 LA CASA LIGERA — el Dueño fijó la ley del arranque: «vanguard dura
//         horas cargando; debe cargar en menos de 5 segundos». La autopsia
//         del despliegue vivo midió la casa entera: 845 KB de JS en 34
//         archivos + 88 KB de HTML + 77 KB de CSS + 188 KB de fuentes =
//         ~1.2 MB que una señal móvil estancada tarda horas en bajar (y un
//         solo chunk perdido deja la hidratación muerta para siempre). Cura
//         en tres frentes, sin tocar las leyes v187/v189/v190:
//         (1) DICCIONARIOS DIFERIDOS — el bundle inicial solo lleva ES; los
//             otros 7 idiomas (EN/PT/FR/DE/IT/RU/ZH, ~4100 líneas) viven en
//             src/lib/i18n/lang-*.ts y bajan SOLO si el agente elige ese
//             idioma; mientras viajan, translate() cae a es y al aterrizar
//             dicVersion repinta sin recargar NADA (ley sagrada intacta).
//         (2) 15 PIEZAS EN DIFERIDO — modales (Ajustes/Registro/Cuenta/
//             Buscador/Menú), overlays (CineVivo, AsistenteVoz,
//             CentinelaImpacto, TransicionMaestra) y banners bajo el doblez
//             (Growth/Goal/ShareGoal/Referral/PromoKit/Mission100/SeoFaq)
//             viajan en su propio chunk y bajan solo cuando se usan; la
//             CINEMÁTICA también (ley v192: jamás corre durante la carga).
//         (3) INTER SE JUBILA — la familia Inter salía volando en cada
//             visita por la cadena --font-sans; el texto base nace en Geist
//             Sans y una familia de fuentes menos cruce la señal.
//         Resultado: la primera visita baja ~35-40% menos KB y con menos
//         archivos (menos puntos de estancamiento); las visitas siguientes
//         salen del caché inmutable de /_next/static. La cortina, el vigía,
//         el socorrista y la ley NADA SE RECARGA SOLO quedan intactos.
// v193.1 VIGO Y LA PUERTA — «hazlo más fácil de entrar y una marca única de
//         vanguard que sea icónica, llamativa y fácil de recordar hasta
//         personaje de vanguard»:
//   ① VIGO, EL CENTINELA DE VANGUARD (vigo.tsx): el personaje de la casa —
//      hexágono dorado con UN SOLO OJO-RADAR que barre el mundo, baliza
//      verde de guardia, flota como un satélite centinela; SVG inline puro
//      (cero bytes de red, ley ADIÓS AL CINE), respeta reduced-motion y
//      jamás parece pantalla de carga (lección v177–v189); su cara vive
//      también en el favicon (icon.svg): la marca se reconoce antes de
//      entrar. Voz propia del CENTINELA SOLO con gesto del Dueño (respeta
//      MUTE, ley de voces v192).
//   ② LA PUERTA DE VIGO (puerta-vigo.tsx): la entrada que dirige a lo que
//      importa — «¿QUÉ TE IMPORTA HOY?» con 5 salas grandes (GUERRA HOY /
//      PARA TI / TV EN VIVO / MAPA 3D / MEMES); la elección queda en TU
//      aparato (vg193-tu-sala) y desde entonces el botón GIGANTE entra a
//      TU SALA en un solo toque desde la portada; «cambiar de sala» siempre
//      visible. Navegación por evento interno vanguard:navigate — jamás
//      recarga (ley v190). Bajo la portada viva, obra v191/v193 intacta.
//   ① EL REGISTRO QUE PREGUNTA TU LADO: al crear cuenta, la casa te hace
//      SU pregunta — «¿DE QUÉ LADO ESTÁS?» en 3 problemas del mundo vivo,
//      eliges tu BANDERA y entras ya con identidad (+5 monedas por voto).
//      Se puede saltar siempre: pedir lado jamás bloquea la entrada.
//   ② ¿DE QUÉ LADO ESTÁS? (lados-panel.tsx + lados-data.ts): la sala de
//      bandos — 14 problemas del mundo con DOS lados, el pueblo se parte
//      en % vivo (simulación determinista, patrón de encuestas), declaras
//      tu lado (+5 mon, +5 XP) y APOSTAR por él con cuotas honestas
//      (margen de la casa 0.95, tope 3.40); «EL MUNDO DECIDE» al cierre
//      del ciclo — se suele ir con la mayoría pero NO siempre (ruido
//      determinista por ciclo); pago fijado en el momento de apostar.
//   ③ REDES DE VANGUARD (redes-panel.tsx + redes-data.ts): la vitrina de
//      las redes — Telegram OFICIAL conectado a su sala, 8 canales más
//      listos para que el Dueño pegue su URL real, y COMPARTIR VANGUARD
//      con enlaces REALES que ya funcionan (WhatsApp/X/Telegram/Facebook/
//      Reddit/copiar) con recompensa por compartir. Las existentes se
//      fortalecen: la sala Telegram queda a un toque.
//   ④ ATAJOS DE VANGUARD (atajos-vanguard.tsx + nav.ts): el muelle que
//      aprende — 6 atajos fijos de la casa y tu USO real reordena el
//      muelle (vg195-atajos-usage cuenta cada navigateTo); navegación por
//      el evento interno vanguard:navigate — jamás recarga (ley v190).
//      El teclado 1-9/0 ya existía: no se toca, no se duplica.
//   ⑤ CAZA DE BUGS: tsc completo en 0 errores; verificación de la ley v190
//      y del flujo de cuentas en navegador real sobre build de producción.
//      Mandato del Dueño: «mejora el que las personas se registren con su
//      cuenta, pregúntale de qué lado está de cualquier problema, también
//      apostar, agrega atajos, agrega más redes, fortalece las ya hechas
//      y busca bugs».
// v196.0 LA VOZ QUE SE PROGRAMA — Mandato del Dueño: «mejórame la voz, esa
//      voz se traba, es robótica; inspírate en la voz de ChatGPT: real,
//      original, suave, sutil, que las personas la quieran escuchar, que la
//      puedan programar, como un ayudante de Vanguard que escuche y
//      entienda». Cura del motor v191 en 4 frentes: (1) TROCEO — el texto
//      viaja en frases ≤190 chars encadenadas sin costuras (Chrome cortaba
//      toda emisión >15s y el onend nunca llegaba: la voz moría a media
//      frase); (2) RESPIRO — 70ms entre cancel() y speak() (Chrome se
//      enganchaba y escupía audio roto); (3) VIGÍA ANTI-TRABA cada 2.5s —
//      trozo que excede su tiempo estimado se salta y el discurso SE CURA
//      SOLO, voz pausada por el aparato se despierta; (4) ANTI-ROBÓTICA —
//      eSpeak/Compact/Pico penalizados, neuronales (Google/Natural/
//      Enhanced/Premium) mandan, pitch/rate calmados cerca de lo humano.
//      LA VOZ SE PROGRAMA: panel en VG-ASSIST (engranaje) — voz concreta,
//      velocidad, tono, volumen y pausas naturales, se graba en el aparato
//      (vg196-voz-ajustes) y manda sobre el Consejo de Voces; botón PROBAR
//      VOZ y RESTAURAR. El ayudante que escucha y entiende (VG-ASSIST)
//      intacto: micrófono → /api/asistente → obedece → responde con voz.
// (su export v196.0 quedó registrado aquí; el export activo está al final)

// ─────────────────────────────────────────────────────────────────────────────
// v197.0 EL POZO ÚNICO — mandato del Dueño («optimiza más vanguard, no
//         elimines nada importante, busca lo que ocupa más espacio
//         innecesario y lo mal optimizado, y que vanguard corra más rápido»),
//         sobre v195.0 TU LADO de la ley hermana (fetch antes de tocar; su
//         obra intacta). Autopsia con navegador y perfil limpio sobre la casa
//         viva: primera visita = 1714KB (1147KB de JS en 74 archivos) PERO el
//         verdadero ahogo estaba en los DATOS del runtime: /api/news caía 8
//         veces en los primeros 40s (481KB — news-strip, hud-header,
//         home-panel y teletipo cada uno pedía SU copia) y /api/mercado 21
//         veces (610KB — latido cada 5s con 60 puntos de historia por activo,
//         ~23MB/hora quemados en móvil). Cura en 5 frentes SIN borrar nada
//         importante (los videos y subidas del Dueño NO se tocan):
//   ① EL POZO DE NOTICIAS (lib/noticias-cache.ts): una sola fuente de agua
//      para toda la casa — TTL de 45s (dentro de la ventana, cero red), vuelo
//      compartido (dos peticiones a la vez = UNA viaja), errores compartidos
//      (se acabó la tormenta de reintentos en señal débil). Migrados:
//      news-strip, hud-header, home-panel (su latido de 60s es el MAESTRO que
//      trae agua fresca) y teletipo-vivo. La API no cambia un byte.
//   ② MERCADO A DIETA (api/mercado + lib/mercado-vivo): la chispa de la cinta
//      se dibuja igual con 14 puntos que con 60 → respuesta 32KB→~12KB; el
//      latido 5s→9s (la pausa en pestaña oculta quedaba intacta). El gráfico
//      detallado sigue pidiendo ?id= con su historia completa de velas.
//   ③ UN SOLO CORAZÓN POR SEGUNDO (home-panel): el reloj y la cuenta atrás de
//      la crisis tenían DOS intervalos de 1s y cada uno repintaba la portada
//      entera — ahora un único latido actualiza los dos estados (misma hora
//      en pantalla, la mitad de renders).
//   ④ TEXTURAS DEL GLOBO A DIETA: 4096px es sobremedida para una esfera que
//      en pantalla mide ~600px — earth-blue-marble 1427KB→208KB y
//      earth-night 698KB→85KB (2048px, quality 78, ojo no nota diferencia).
//      El mapa 3D baja de 2.1MB a 0.3MB al abrir OSINT/TIERRA.
//   ⑤ LO QUE NO SE TOCA: los videos del Dueño (V-0XX.mp4) y las subidas del
//      pueblo (uploads/) quedan INTACTOS — contenido, no basura; el watchdog
//      (ping 30s), presence y visitas se quedan (vigías de la casa); el CSS
//      y el prerender SSR no se podan (riesgo de romper leyes > ganancia).
//
// v199.0 EL TURBO — «que vanguard corra más rápido» sin borrar NADA importante
//      (pedido literal del Dueño; auditoría de espacio y optimización).
//   ① EL HALLAZGO MAYOR — CACHÉ DE MEDIA: desde v125 TODOS los videos
//      (/videos 16MB), imágenes reales (/imagenes-reales 15MB), ilustraciones
//      (13MB), posters y uploads caían bajo el no-store global: CADA re-visita
//      revalidaba 30+ MB contra el servidor antes de pintar un solo video.
//      Ahora viajan con Cache-Control public, max-age=1 día +
//      stale-while-revalidate=7 días (next.config headers): la segunda visita
//      abre PARA TI, VANGUARD TV y las imágenes desde el disco al instante.
//      El HTML y las API conservan su no-cache — ley v125 «contra la página
//      vieja» intacta (el Dueño siempre ve la versión nueva de la app).
//   ② IMÁGENES REALES RECOMPRIMIDAS (solo .jpg, dimensiones intactas):
//      35 de 50 archivos con ffmpeg q5 — SSIM verificado ≈0.99 (el ojo no
//      nota la diferencia). 14.6MB→11.7MB: 2.9MB menos en la primera visita
//      móvil. Ninguna imagen creció; las 15 que no mejoraban quedaron intactas.
//   ③ AUDITORÍA REALIZADA (sin acción porque ya están sanos): los 3 deps
//      pesados (three+globe.gl 1.2MB, maplibre 1.1MB, chunk three 348KB) ya
//      viven en chunks perezosos — no se descargan hasta abrir PLANETA/TERRA;
//      primer load de la casa = 1.77MB raw / ~550KB gzip (razonable para la
//      Casa completa); assets sin huérfanos reales (solo hangar.jpg 111KB,
//      se deja por futuro uso); cortina v186 duplicada en payload RSC (~27KB)
//      NO se toca: tocar la cadena de arranque v178-v189 arriesga las leyes
//      por 7KB gzip reales; socket.io-client viaja en el bundle inicial (~40KB)
//      porque realtime.ts es import estático de la Casa — diferirlo obligaría
//      a refactor async en 10 consumidores (riesgo v190 > 40KB).
//   ④ DEPS MUERTAS DETECTADAS (no se quitan del package.json para no pisar
//      al otro agente: jamás se importan en src/ — @huggingface/transformers,
//      @mdxeditor/editor, pagedjs, react-syntax-highlighter — solo engordan
//      el npm install, cero impacto en runtime).
//   ⑤ LO QUE NO SE TOCA: videos del Dueño (re-encode CRF probado, demasiado
//      lento en sandbox y contenido sagrado), boot chain, leyes v178-v190,
//      ni una sola función de la Casa.
// v200.0 EL RELEVO HONESTO (choque de número con EL TURBO resuelto como en
//      v197: el turbo queda v199.0, el relevo sube a v200.0) — el Dueño lo
//      sentenció («entro y carga normal
//      dura como 5 segundos y al rato vuelve a cargar de nuevo y ahí dura dos
//      minutos — la gente se aburrirá y cerrará Vanguard»). Autopsia: el
//      relevo v183.1 del watchdog recargaba SOLO al ver versión distinta en
//      /api/health — cada despliegue nuevo pateaba con una recarga a todo el
//      que estuviera dentro (a ~30s de entrar), y quien entraba en pleno
//      despliegue aterrizaba DOS veces (la segunda contra un server
//      propagándose: minutos). Cura en connection-watchdog.tsx SIN borrar
//      nada: ① el relevo JAMÁS recarga solo — píldora no bloqueante «Vanguard
//      se actualizó» con botón ACTUALIZAR y el mando es del Dueño; ②
//      ANTI-VAHO: 2 cruces de versión SEGUIDOS antes de ofrecer la píldora
//      (en pleno despliegue las instancias viejas/nuevas conviven); ③ guardia
//      anti-bucle de 90s en la recarga manual; ④ el relevo de caída real
//      (down→up tras el overlay RECONECTANDO) se queda intacto.
//
// v201.0 LA VOZ VIVA — «que hable más» + «una notificación para darle
//      permiso de hablar» + «que pueda crear mapas, tener todas las
//      banderas» (pedido literal del Dueño; la voz ya estaba bien, ahora
//      VIVE). Cero funciones borradas, leyes v178-v200 intactas.
//   ① EL PERMISO DE HABLAR (lo que el Dueño pidió): los navegadores
//      BLOQUEAN la síntesis hasta que la persona toca la pantalla — el
//      Centinela intentaba hablar y el aparato lo callaba sin decir por
//      qué. Ahora la CASA pregunta: tarjeta honesta «VANGUARD QUIERE
//      HABLAR» (permiso-voz.tsx) que sale a los 5s, o AL INSTANTE cuando
//      llega la primera alerta urgente. ACTIVAR = el toque que abre la
//      boca del aparato y VG-ASSIST saluda en voz alta (y oye la alerta
//      pendiente). MANTENER EN SILENCIO = no vuelve a preguntar sola.
//      Guardado en vg201-permiso-hablar + evento vg:permiso-hablar.
//   ② HABLA MÁS: motor con puerta automática (hablarAgente automatico:
//      true → exige permiso, fin de los intentos en falso); saludo
//      hablado al conceder; LLM de VG-ASSIST ahora responde hasta 220
//      caracteres (antes 140); el radar respeta también el mute (regla
//      v119 intacta).
//   ③ MÁS PODERES (mapas y banderas): ramas DETERMINISTAS nuevas en el
//      cerebro sin LLM — «abre el mapa» → maps (Google Maps de
//      Conflictos), «mapa de incidentes» → incidentes, «crea un mapa» /
//      «banderas» / «música» → studios (Estudios Creadores),
//      «naciones» → edad (Age of Nations). Chips nuevos en el panel del
//      orbe: MAPA y BANDERAS. El SYSTEM del LLM aprende las mismas rutas.
//   ④ BUG BUSCADO Y HALLADO (falso positivo descartado con pruebas): se
//      auditó page.tsx y route.ts línea a línea — un artefacto de lectura
//      (sanitizador ANSI) simulaba identifiers rotos; verificación con
//      node + bytes crudos confirmó el código SANO. Nada que parchear:
//      la v200 del otro agente está limpia.
//   ⑤ LO QUE NO SE TOCA: cadena de arranque, cortina, watchdog v200,
//      leyes del reloj, y el habla PEDIDA (orbe/órdenes) funciona igual
//      que siempre — solo lo PROACTIVO pide permiso.
//
// v203.0 EL NOTICIERO — mandato del Dueño («la voz de Vanguard está bien
// pero lo que me gustaría es que hable más... que hable más de noticias y
// más... que pula aún más, que sea desarrollo, busca bug, corrige y
// mejora»). Sobre v201 LA VOZ VIVA y v202 PUERTAS ABIERTAS (intactas).
// Cura en cuatro frentes, sin borrar nada:
//  ① EL NOTICIERO HABLADO (src/lib/noticiero.ts, nuevo): LA ANALISTA narra
//    un digest natural de los cables más pesados — apertura rotatoria (5
//    fórmulas × 4 cierres, nunca suena igual), titular principal con país e
//    impacto, «también en la agencia» y cierre. Auto HONESTO: exige permiso
//    v201 + interruptor vg180 ON + pestaña visible + cooldown propio de 4
//    min + titulares NUEVOS (memoria viva: nunca repite cables). El botón
//    «▶ NOTICIERO» del Centro Mundial suena siempre: el toque es el permiso.
//  ② LATIDO DEL RADAR: cada 5 sondeos reales del Centinela (~5 min en salas
//    de noticias, ~15 fuera — semáforo v198 manda) el noticiero sale solo.
//  ③ TODAS LAS BANDERAS DEL MUNDO: galería buscable con las 251 banderas
//    REALES (flagcdn) en el Estudio de Banderas — búsqueda por nombre/ISO/
//    región, filtro por continente, un toque asocia la bandera al diseño
//    (el select «Nación asociada» se rellena solo). Tope 120 a la vista.
//  ④ LA VOZ ATERRIZA DONDE TOCA: «muestra las banderas» / «crea un mapa»
//    lleva SUBTAB (banderas|mapas) — page.tsx dispara vg:studios-subtab y
//    el Estudio Creador abre SU sub-estudio (antes caía siempre en noticias).
// PULIDO Y BUGS: ⑤ la alerta del Centinela ya no promete «Abriendo el
//    centro mundial» que nunca ocurría (honestidad de acero) y estrena 3
//    fórmulas rotatorias; ⑥ el noticiero se calla al salir de la sala
//    (una sola voz viva); ⑦ habandoLabel → hablandoLabel (honesto).
// Leyes intactas: cortina, v190 nada se recarga solo, v189 sin bloqueo,
// v125 HTML no-cache, semáforo v198, pozo v197, turbo v199, relevo v200,
// voz v201, puertas v202.
// v202.0 PUERTAS ABIERTAS — mandato del Dueño («ya está publicada en search
// pero no entra nadie… ¿de qué le sirve tener todo el contenido del mundo si
// nadie lo ve ni entra?»). Autopsia del tráfico: el SEO técnico ya estaba
// fino (título, descripción, OG, twitter card, canonical, sitemap, robots,
// RSS y token de verificación de Google), pero TODAS las noticias de la
// primera página /guerra-hoy regalaban el click a la fuente externa con
// rel="nofollow" — Google no tenía NINGUNA página de Vanguard a la que
// llevar gente que busca «guerra hoy», y el sitemap solo anunciaba 5 URLs.
// Cura sin borrar nada: ① PUERTA POR NOTICIA — /noticia/[id] server-rendered
// con metadata propia por cable (título, resumen, imagen, canonical,
// publishedTime), JSON-LD NewsArticle (Google News/Discover), bandera real,
// cables relacionados (más puertas internas) y CTA «ENTRAR AL MUNDO EN VIVO»;
// not-found amable si un cable salió del aire; ② SITEMAP DINÁMICO — las
// últimas 50 noticias entran al sitemap (5 → 55+ URLs, refrescadas en cada
// rastreo); ③ RSS /feed.xml — cada ítem apunta a SU noticia, no todas a la
// misma página; ④ /guerra-hoy — el titular abre la puerta interna y la fuente
// externa queda como enlace pequeño «FUENTE ↗». Lo que NO se toca: cortina,
// watchdog v200, semáforo v198, pozo v197, turbo v199, voz v201.
// v204.0 EL ESCUDO — mandato del Dueño («busca errores de código, debilidades
// que tiene Vanguard en ataques cibernéticos, busca API keys»). Auditoría de
// seguridad completa de la casa (73 rutas API, 558 archivos TS). Hallazgos y
// cura, sin tocar ni la ley v125 (HTML no-cache) ni el turbo v199 ni la voz:
// ① CLAVE DE ADMIN PÚBLICA — "VANGUARD-2026" estaba en el código servidor Y
//    en el panel cliente (se leía en el bundle y hasta en pantalla): cualquiera
//    podía aprobar contribuciones, dar badges y regalar monedas. Cura:
//    fail-closed — ahora solo la sesión del DUEÑO (isOwner) o la variable de
//    entorno VANGUARD_ADMIN_KEY abren la puerta; el servidor compara con
//    SHA-256 (sin fuga de tiempo) y la clave JAMÁS vive en el cliente.
// ② IDOR DE BORRADO — /api/ugc/[id] DELETE aceptaba ?author= con el nombre
//    público del autor: cualquiera borraba contenido ajeno. Cura: permiso tk
//    HMAC-SHA256 (firmaBorrado) que el servidor entrega al publicar y el
//    autor guarda en su localStorage; también valen la sesión del autor
//    firmado o la del DUEÑO. El parámetro author se retira.
// ③ BASE DE DATOS CON CREDENCIALES PÚBLICAS — db/custom.db (por diseño
//    v183.1) llevaba la tabla Account con 4 hashes scrypt a la vista del
//    mundo + un backup doble. Cura: tabla Account PURGADA (el DUEÑO se
//    recrea solo en el arranque), backup eliminado del repo y regla
//    db/*.backup-* en .gitignore para siempre.
// ④ SECRETOS DE RESERVA QUEMADOS — AUTH_SECRET ("vanguard-launch-2026...")
//    y OWNER_PASSWORD ("vanguard2026") eran públicos: quien los leyera
//    forjaba sesiones y entraba de DUEÑO. Cura: rotados + aviso en consola
//    si el servidor arranca sin AUTH_SECRET + resincronización automática
//    de la contraseña del DUEÑO cuando OWNER_PASSWORD existe en el entorno.
// ⑤ HARDENING DE SESIÓN — firma comparada en tiempo constante (timingSafeEqual)
//    y cookie vg_session con `secure` en producción.
// ⑥ MUROS ANTI-FLOOD — likes de memes, interacciones UGC, verificaciones
//    (¡pagaban monedas!), votos de embajadores, denuncias, acciones de
//    directos y moderación: muro por IP (20-40/min) — antes un guion podía
//    inflar likes, viewers, votos y cosechar monedas sin freno.
// ⑦ XSS POR JSON-LD — JSON.stringify no escapa `<`: un titular con
//    </script> podía romper el documento. Cura: jsonLdSeguro() escapa
//    \u003c en las 6 incrustaciones (layout, guerra-hoy, ver-guerra ×2,
//    zona-cero, noticia).
// ⑧ TELEGRAM — el webhook aceptaba updates falsos de cualquiera; ahora
//    verifica X-Telegram-Bot-Api-Secret-Token si TELEGRAM_WEBHOOK_SECRET
//    está definido.
// ⑨ DEPENDENCIAS — 26 vulnerabilidades (2 críticas) → 7 (0 críticas):
//    npm audit fix + next-auth (muerta, nunca importada) desinstalada.
//    Las 7 restantes son transitivas de librerías 3D/IA (sharp/libvips,
//    transformers, prismjs) sin superficie real aquí — documentadas.
// ACCIÓN DEL DUEÑO (2 minutos): en Vercel → Settings → Environment Variables
// define AUTH_SECRET, OWNER_PASSWORD, VANGUARD_ADMIN_KEY (y opcional
// TELEGRAM_WEBHOOK_SECRET). QA: tsc 0 · build EXIT 0 · 73 rutas API ·
// login/registro/save intactos · delete UGC con tk · muros activos.
// v205.0 EL MUNDO 3D — mandato del Dueño («que Vanguard tenga mapas 3D de
// Google Maps, lugares importantes y ciudades 3D, y las ubicaciones más
// realistas»). El ESTUDIO DE MAPAS ahora vuela: interruptor 2D TÁCTICO ⇄
// CIUDADES 3D dentro del subtab Mapas:
// ① CIUDADES 3D REALES (src/components/vanguard/ciudades-3d.tsx, nuevo):
//    MapLibre GL (dep ya presente, ahora viva) con teselas LIBRES y SIN API
//    KEY — satélite Esri World Imagery (ubicaciones reales a color),
//    EDIFICIOS 3D de OpenStreetMap vía OpenFreeMap (fill-extrusion con las
//    alturas reales render_height, al estilo Google Maps 3D) y RELIEVE del
//    planeta con Terrain-RGB terrarium de AWS Open Data (Everest incluido).
// ② 20 CIUDADES en chips: NY, Madrid, CDMX, Buenos Aires, Bogotá, Lima,
//    Santiago, Miami, LA, París, Londres, Berlín, Roma, Estambul, Dubái,
//    Tokio, Seúl, Moscú, Kiev, El Cairo — vuelo de cámara cinematográfico
//    (pitch 60, bearing propio, 2.2s, reduced-motion respeta).
// ③ 25 LUGARES IMPORTANTES con coordenadas reales: monumentos (Eiffel,
//    Libertad, Guiza, Coliseo, Machu Picchu, Cristo, Muralla, Taj Mahal,
//    Burj Khalifa, Kaaba, Everest, Isla de Pascua), SEDES DE PODER (Casa
//    Blanca, Pentágono, ONU, OTAN, Kremlin) y PUNTOS ESTRATÉGICOS (Suez,
//    Panamá, Ormuz, Bab el-Mandeb, Malaca, Gibraltar, Kerch, Chernóbil) —
//    marcadores por color + ficha con dato real + vuelo directo.
// ④ MODO OSCURO TÁCTICO: apaga el satélite y queda agua/vias cian estilo
//    sala de guerra; interruptores SATÉLITE / EDIFICIOS 3D / RELIEVE en vivo.
// ⑤ LEYES DE LA CASA INTACTAS: dynamic ssr:false (el motor solo baja al
//    abrir el modo 3D — arranque igual que v199), maplibre se destruye al
//    salir (map.remove + marcadores), atribución legal compacta en el mapa,
//    v125/v199/v204 sin tocar. QA: tsc 0 · build EXIT 0 · health v205.0.
// v206.0 MÁS PUERTAS (v206.1: pulido de títulos) — de la ley hermana.
//
// v207.0 INFINITO — mandato del Dueño («sigue puliendo más Vanguard, haz que
// Vanguard siempre se actualice sola y que sea ilimitado»), sobre v206.0/v206.1
// de la ley hermana (intactas). Tres pilares:
// ① SE ACTUALIZA SOLA (src/lib/auto-despliegue.ts + /api/system +
//    auto-actualizacion.tsx, nuevos): el corazón de Vanguard mira el repo
//    público (raw.githubusercontent, sin API key) como mucho 1 vez cada
//    5 min; si hay versión más nueva y VERCEL_DEPLOY_HOOK_URL existe en el
//    entorno, LANZA EL REDEPLOY ELLA MISMA (una sola vez por versión). El
//    cliente pregunta a /api/system cada 4 min (y al volver a la pestaña) y
//    muestra un aviso no bloqueante «NUEVA VERSIÓN DETECTADA — ACTUALIZAR
//    AHORA»: la recarga SIEMPRE la decide el usuario (ley v190: nada se
//    recarga solo; ley v189: opt-in). El aviso vive en CapasGlobales →
//    diferido, jamás en el arranque. Sin hook configurado, el aviso igual
//    avisa cuando el despliegue llegue. El cron diario de agent-ping también
//    corre la mirada (compararVersiones numérico: v207.0 / v207.1.2).
// ② ILIMITADO — los topes artificiales caen: feed UGC 80 → 300 por pedido,
//    galería de memes 96 → 300, sitemap: el archivo de noticias pasa a
//    TAKE_NOTICIAS 500 (sobre las teatros v206 de la ley hermana), las 251
//    BANDERAS todas a la vista (antes 120), la voz lee el pulso completo
//    (220 → 480 caracteres). Y el más grande: EL DUEÑO ES ILIMITADO —
//    sesionDuenoReq() en auth-server verifica su sesión firmada y CRUZA LOS
//    MUROS anti-flood en 9 rutas (ugc POST/PATCH/DELETE, memes, verify,
//    embajadores, denuncias, live, moderación): los muros existen para el
//    spam, no para su rey. Registro/login/lockout intactos.
// ③ MAPAS 3D PULIDOS (ciudades-3d.tsx): 20 → 32 CIUDADES (Caracas, La
//    Habana, Brasilia, Toronto, Viena, Estocolmo, Teherán, Bangkok, Yakarta,
//    Sídney, Lagos, Nairobi) y 25 → 40 LUGARES IMPORTANTES con coordenadas
//    reales (estrecho de Taiwán, Bósforo-Dardanelos, Bering, Diego García,
//    Cabo de Buena Esperanza, Tres Gargantas, Pituffik/Thule, canal de Kiel,
//    Vaticano, Downing Street, Zhongnanhai, Casa Rosada, La Moneda, Ópera
//    de Sídney, Acrópolis, Petra) + ◎ TU POSICIÓN REAL: botón GPS opt-in
//    (geolocation del navegador), marca cian pulsante, vuelo a tu punto y
//    ficha con precisión en metros; si el permiso se deniega, aviso honesto
//    que no bloquea el mapa.
// QA: tsc 0 · build EXIT 0 · /api/system honesto · DUEÑO cruza muros ·
// v190/v189/v125/v199/v204/v205/v206 intactas.
//
// v208.0 EL ESTRENO — mandato del Dueño («sigue puliendo vanguard» + su
// «Si a todo» a las cinemáticas y portadas). Dos piezas, ambas aprobadas
// por las leyes de la casa:
//  ① EL CINE REGRESA OPT-IN (ley v189 se cumple a la letra: «con un botón
//    dentro de la consola — jamás automática»): CineEntrada({ optIn:true })
//    NO arranca solo, NO marca sesión, NO obedece timers — proyecta la intro
//    GTA (6 placas, cartel «LA CASA YA ESTÁ DESPIERTA», SALTAR gigante)
//    SOLO cuando el visitante pulsa ◉ ESTRENO (chip abajo-derecha sobre el
//    reproductor de música). El modo automático queda retirado para siempre.
//  ② LAS CARAS DE VANGUARD (cara-portada.tsx nuevo): cada visitante elige
//    el ambiente — ASALTO (brasa y carmesí, default), SIGILO (verde noche y
//    cian) o GLORIA (oro imperial) — recoloreando las nubes aurora; guardado
//    en SU aparato (localStorage vg-cara), DOM directo sin setState en
//    effects (ley v176), chip «CARA · ASALTO ▴» con menú de 3 opciones.
//    Complementa al Atelier de acabados (el metal manda aparte).
// Ambos montados diferidos (MontajeTardio 9s + dynamic ssr:false), cero
// recargas (ley v200), cero bloqueo (ley v189), ceremonia oculta respetada.
// (sus constantes vivían aquí; el export único sigue al final, sobre v209.0)
//
// v209.0 LA LUPA — de la ley hermana de LA LUPA (rebautizada al rebasar sobre v208.0 EL ESTRENO): mandato del Dueño («sigue puliendo»), auditoría de
// pulido completa de la casa (10 heridas localizadas, 9 curadas):
// ① LA LUPA (el nombre lo dice): el ARCHIVO DE NOTICIAS por fin es
//    buscable. /api/noticias?q= busca REAL en la BD (título, resumen,
//    teatro, país — 1.694 cables) con ranking propio (agujas en el
//    titular pesan 3, en el cuerpo 1). LA PALETA Ctrl+K (section-search)
//    ahora dispara la búsqueda server con debounce 350ms y muestra hasta
//    8 cables REALES arriba de todo, cada uno saltando a /noticia/[id]
//    con ROUTER (antes window.location.href recargaba el SPA entero,
//    contra la ley «la navegación jamás recarga»). Y la sala de lectura
//    (news-panel) gana su filtro de texto «lupa en cables…» que se suma
//    a los filtros de tag. 500+ piezas indexadas por sitemap que nadie
//    podía buscar: ya no.
// ② ICONOS PWA REALES: manifest con solo SVG = Chrome no la instalaba
//    como app e iOS mostraba CAPTURA de página en vez de la marca (no
//    soporta SVG como apple-touch-icon). Vigo dorado ahora vive en
//    /icons/{icon-192,icon-512,icon-maskable-512,apple-touch-icon}.png
//    (maskable con safe zone al 78%), manifest + layout + JSON-LD logo
//    actualizados, favicon.ico de respaldo para navegadores viejos.
// ③ VELOCIDAD DE PUERTAS: /guerra-hoy bajaba 3 servicios externos EN
//    SERIE (WorldPower → EONET → FX, cada uno con deadline propio: peor
//    caso 27s de TTFB muerto ante Google) → Promise.all (el límite es el
//    más lento, no la suma). Y las 3 puertas force-dynamic (/guerra-hoy,
//    /noticia/[id], /conflicto/[tag]) estrenan loading.tsx con esqueleto
//    de la casa: sala visible desde el primer byte, adiós bloque blanco.
// ④ TABLÓN PERSISTENTE: lo LEÍDO y lo OCULTO de notificaciones
//    sobrevivían solo hasta el F5 (useState desnudo) → localStorage
//    (vg-notif-leidas/ocultas-v1, tope 200) con recuperación tras montaje
//    sin mismatch de hidratación (patrón setTimeout(0) de la casa).
// ⑤ ÍNDICES DE BD: NewsItem no tenía NI UN @@index — sitemap (take 500),
//    feed.xml, portada, teatros groupBy y LA LUPA hacían full scan en
//    cada puerta de Google → @@index([publishedAt]) +
//    @@index([conflictTag, publishedAt]) aplicados con prisma db push
//    sobre la BD real (1.694 cables intactos).
// ⑥ ACCESIBILIDAD: /vanguard2 recuperó el pellizco de zoom (maximumScale:1
//    + userScalable:false violaban WCAG 1.4.4) y el <html lang> ahora
//    acompaña el idioma elegido EN VIVO (setLang) y al despertar
//    (rehidratador) — los lectores de pantalla ya no siguen pronunciando
//    español tras cambiar a inglés.
// ⑦ NOTICIAS RELACIONADAS DE VERDAD: /noticia/[id] mostraba «últimas 5
//    sin más» (un cable de Gaza rodeado de Taiwán) → primero las del
//    MISMO teatro (conflictTag + índice nuevo), relleno solo si faltan.
// QA: tsc 0 · build EXIT 0 · /api/noticias?q= probado · índices verificados
// en BD real · iconos PNG verificados (contenido + color de marca).
// v210.0 EL REFUGIO — mandato del Dueño («sigue puliendo», tercera vuelta).
// Auditoría de red de seguridad: la Casa construía puertas de entrada
// (v206) pero tenía el suelo agujereado — quien caía en una URL muerta o
// perdía la red caía fuera de la Casa. 4 heridas curadas:
// ① NOT-FOUND DE LA CASA: Next.js servía su 404 de fábrica (página blanca,
//    sin marca, sin salidas) — perdía visitantes y rompía la sala. Ahora
//    not-found.tsx del refugio: estilo house (zinc-950 + ámbar), «esta sala
//    no existe» honesto, botones a portada / guerra-hoy / zona-cero, chips
//    a los 6 teatros vivos (fuente única TEATROS de v206) y la pista
//    Ctrl+K. noindex + follow: Google sigue el rastro hacia salas vivas.
// ② SERVICE WORKER CONSERVADOR: la PWA no tenía worker — sin red, la Casa
//    entera desaparecía. public/sw.js nuevo: activos MUDOS inmutables
//    (/_next/static con hash, /icons, /vendor, favicon) en cache-first
//    para que la segunda visita vuele; NAVEGACIONES SIEMPRE POR RED (ley
//    v125: el HTML nunca se cachea — el visitante ve la versión nueva en
//    cada llegada); /api/ jamás cacheado (datos vivos); sin red → entrega
//    UNA sola página: el refugio /offline (o su gemela de emergencia en
//    línea si hasta el refugio falta). Cumple v190 a la letra: el worker
//    jamás recarga, jamás avisa, no decide nada — solo sostiene.
// ③ EL REFUGIO /OFFLINE: sala de emergencia con la verdad por delante
//    («no hay conexión», «nada se rompió del lado del servidor») y el
//    botón REINTENTAR. noindex. Registro del worker (registro-sw.tsx)
//    diferido con el patrón MontajeTardio de capas-globales: mudo, sin
//    peso en el arranque, y si el navegador no soporta SW la Casa
//    funciona exactamente igual (red de seguridad, no dependencia).
// ④ RSS AUTODESCUBIERTO: /feed.xml existía pero los lectores y
//    agregadores no lo veían — metadata.alternates.types application/
//    rss+xml en el layout: al abrir la Casa, el lector RSS la detecta solo.
// QA: tsc 0 repo · build EXIT 0 · 404 de la casa servido (200 HTML de
// marca en URL muerta) · /offline 200 · /sw.js 200 JS · feed alternates
// en head · navegación normal intacta (sin worker interferencias).
// v211.0 EL VÉRTIGO — mandato del Dueño («ve puliendo vanguard y haz que
// Vanguard sea único, fácil de recordar y hermoso, práctico, y que nunca
// se quede el usuario con más ganas; copia los formatos ganadores de
// Google, YouTube, TikTok e Instagram — la FÓRMULA, no solo el look»).
// Las cuatro fórmulas ganadoras del planeta, aplicadas de verdad:
// ① TIKTOK — EL VÉRTIGO (/vertigo): el feed infinito a pantalla completa.
//    Cada cable ocupa TODO el viewport; el scroll-snap encaja una pieza
//    por deslizamiento (el gesto nativo del celular ya era el gesto
//    TikTok). Server page baja 48 cables de la BD (primera pieza con el
//    primer byte, indexable, JSON-LD CollectionPage) y el feed client
//    pide MÁS al archivo por cursor publishedAt (/api/vertigo, muro
//    30/min, no-store) cuando te acercas al final — y si el archivo se
//    agota, RECICLA las vistos mezcladas: JAMÁS existe un cartel de
//    «no hay más» (el mandato literal: nunca se queden con más ganas).
//    Riel de progreso lateral, contador pieza/piezas, teclado ↑/↓/Esc,
//    «LEER COMPLETO» navega con ROUTER (ley: la navegación jamás recarga),
//    imagen lazy desde la 3ª pieza, noscript honesto, no-scrollbar propio.
// ② INSTAGRAM — EL LATIDO: doble toque (o doble clic) sobre la pieza =
//    ❤️ con ráfaga animada (vg-ping-once, se apaga sola, reduced-motion
//    respeta); el conteo vive en tu aparato (localStorage vg-vertigo-*),
//    botón ❤️ dedicado en la columna de señales + chip al teatro
//    (/conflicto/[tag]) — engagement sin cuentas, sin servidores.
// ③ YOUTUBE — EL SIGUIENTE: en /noticia/[id] nadie más muere al final del
//    artículo: SiguienteChip aparece fijo abajo-derecha cuando el lector
//    pasó el 50% de la página con el titular del próximo cable (mismo
//    teatro primero — la selección reuse la lógica de relacionadas de LA
//    LUPA); un toque y el ROUTER lleva; JAMÁS auto-navega ni cuenta atrás
//    (ley v190: la decisión es del lector). Y la barra de la sala de
//    lectura estrena el enlace VÉRTIGO ▸▸ permanente.
// ④ GOOGLE — TENDENCIAS: la paleta Ctrl+K ya no recibe a nadie a ciegas:
//    en el estado vacío muestra chips de TENDENCIAS (Ucrania, Gaza,
//    Ormuz, Taiwán, Sahel, Mar Rojo, dron, OTAN) — un toque llena la
//    Lupa y sale a cazar al archivo. Y EL VÉRTIGO entra al índice total
//    del buscador (pg:vertigo, navega con router).
// PUERTAS: banner EL VÉRTIGO en la portada del SPA (home-panel, bajo
// ZONA CERO), banner hermano en /guerra-hoy (la puerta de Google), enlace
// en la barra de cada /noticia y /vertigo en el sitemap (hourly 0.9).
// QA: tsc 0 repo · eslint 0 tocados · build EXIT 0 · health v211.0 db up
// · /vertigo 200 con feed + noscript · /api/vertigo?antes= 24 items +
// honesto 400 sin cursor · sitemap con /vertigo · SIGUIENTE presente en
// /noticia (chip client diferido al 50% de scroll) · tendencias en paleta.
//
// v212.0 A LA VISTA — mandato del Dueño (4 frentes en un solo mensaje:
// «cuando lo pongo modo completo se bugea y no aparece nada; la intro
// está bien pero es muy rápida y no aparece al inicio cuando Vanguard
// está cargando; hay muchos botones y se están opacando; haz que se vea
// bien en celulares pequeños»):
//  ① MODO COMPLETO ARREGLADO: desde v173 (adiós al universo 3D) la sala
//    entera era el contenido y oculta={inmersion} la escondía con
//    display:none — inmersión = pantalla negra con la píldora de salida.
//    Cura: la sala vive SIEMPRE (oculta={false}); la inmersión sigue
//    apartando cabecera/ticker/footer y pidiendo fullscreen nativo.
//  ② LA INTRO VUELVE AL ARRANQUE (mandato expreso anula el retiro v189,
//    con los salvavidas v187 íntegros): arranca AL INSTANTE y es la cara
//    de la carga — z 2147483200 (encima de la cortina); cartel honesto
//    DINÁMICO (VANGUARD ESTÁ DESPERTANDO ⇄ LA CASA YA ESTÁ DESPIERTA vía
//    pulso de 600ms sobre window.__vgvivo); placas 1.5s → 2.4s («muy
//    rápida»); se retira sola a los 12s si la casa no despierta (la
//    cortina de rescate queda libre); reduced-motion/sesión sufrida/
//    una vez al día intactos; el chip ◉ ESTRENO sigue para repetirla.
//  ③ MÓVIL DIGNO: chips v208 compactos (solo «Ver la intro»), fondos casi
//    sólidos (rgba .97 — adiós veladuras), el pulso teatral no existe en
//    ≤480px (menos ruido sobre el contenido), opacity/filter forzados a 1
//    en los chips en ≤640px.
// v212.1 LA CORTINA ZOMBI + EL SILENCIO NO ROMPE — parche de guerra de la
// ley hermana (rebasa sobre v212.0 A LA VISTA intacto), cazado VIVO durante
// la toma de fotos oficiales para el TikTok del Dueño (iPhone emulado,
// sesión larga de navegación — la vida real destapa lo que el build limpio
// no ve):
//  ① LA CORTINA ZOMBI: /vertigo (rutas NUEVAS con hidratación pesada) se
//    quedaba ETERNA en «Desplegando el universo» CON el feed vivo debajo.
//    Cadena exacta: apagar() REMOVÍA el div de la cortina a los 800ms →
//    React hidrataba DESPUÉS (48 piezas client de EL VÉRTIGO tardan), no
//    encontraba el div que su árbol espera → mismatch → re-render cliente
//    → la cortina RE-NACÍA de cero, zombi, sin nadie que la apagara (el
//    script del layout seguía apuntando al nodo viejo detachado);
//    /guerra-hoy nunca la sufrió (su hidratación ligera gana la carrera).
//    Cura: ley nueva — el div de la cortina lo renderiza el layout, es
//    propiedad de React, JAMÁS se remueve; apagar() solo lo esconde
//    (opacity→display:none). Un zombi ya no puede nacer. QA: /vertigo
//    3/3 cargas con cortina fundida sola · / y /guerra-hoy intactos.
//  ② EL SILENCIO NO ROMPE: el service worker (v210) podía matar un chunk
//    entero si cualquier paso interno truena — respondWith con promesa
//    rota mata el recurso y un chunk muerto = React que JAMÁS hidrata
//    (fibers=0 verificado, Casa muda, sin un solo error en consola).
//    Cura: el worker entero en async/try/catch con retorno a red directa
//    en cada paso (match, fetch y el guardado en caché son no-fatales) —
//    una red de seguridad no puede ser la que corta la luz; caché renueva
//    a vg-refugio-v211. QA: /vertigo hidrata CON worker activo (fibers>0).
//
// v213.0 EL PULSO (sobre v212.1 A LA VISTA de la ley hermana, intacto) —
//  mandato del Dueño: «que Vanguard se vuelva MÁS EXACTO, que sea EL
//  PRIMERO en dar noticias — importantes y de MORBO — bien
//  estructuradas, que te lo diga TODO sin salir de Vanguard; el mapa
//  3D bien definido, el Ojo de Dios con MÁS información, todo EN VIVO,
//  EN DIRECTO». Cuatro frentes:
//  ① LA SALA EN VIVO (/en-vivo): la redacción abierta 24 h — línea del
//    tiempo minuto a minuto (solo cables REALES, jamás relleno curado),
//    banner ● ÚLTIMA HORA cuando el cable más nuevo tiene ≤ 15 min,
//    MEDIDOR del planeta (hoy/última hora/urgentes/teatros/países),
//    LO MÁS CALIENTE por impacto 0-100 (el morbo con regla), filtros
//    TODO/URGENTE/teatro, hora exacta + sello de credibilidad
//    (AGENCIA A++ … FUENTE C) y VER FUENTE ↗ en cada cable. Sondeo
//    /api/pulso cada 30 s solo con la pestaña visible — la página
//    JAMÁS se recarga (ley v190), los cables entran solos con su
//    destello ● NUEVO. Server-render con JSON-LD, revalidate 30.
//  ② EL PRIMERO DE VERDAD: /api/pulso MIRA la edad del cable más nuevo
//    — si lleva > 4 min sin entrar nada, el propio latido manda a la
//    redacción a la calle (after() → /api/news: GDELT + 18 medios RSS
//    en paralelo, candado anti-estampida de 3 min). A la red RSS se
//    suman 3 frentes de primicia (Kyiv Independent, BNO News, CNBC
//    World). Más visitas = redacción más despierta = primicia.
//  ③ OJO DE DIOS MÁS INFORMADO: franja «EL PULSO · ÚLTIMA HORA REAL»
//    (pulso-ojo.tsx) arriba del panel — el Ojo LEE el mundo: los 4
//    cables más frescos con tier de impacto + medidor en vivo.
//  ④ MAPA 3D BIEN DEFINIDO: LEYENDA DEL PLANETA (leyenda-planeta.tsx)
//    en el globo del Ojo — cada marca explicada: unidades (jet/tanque/
//    soldado), anillo de batalla, arcos de ataque y pines de cables
//    por impacto (URGENTE→CONTEXTO). Nada indefinido.
//  EXACTITUD: motor de impacto v172 estrena cred (credibilidad 0-9)
//  visible en cada cable; /api/pulso y /en-vivo excluyen las curadas
//  de respaldo — la última hora no lleva relleno. QA: tsc 0, build ok,
//  /api/pulso items reales sin curated-*, banner, calientes, muro.
//
// v216.0 LOS 100 — mandato del Dueño («haz una lista de los 100 objetivos
// de Vanguard, fuertes, abusivos, super llamativos, con morbo, adictivos;
// agrégalo por partes»). La vitrina que engancha y no suelta:
//  ① EL CATÁLOGO: 53 → 100 EXACTOS en game-data.ts (47 objetivos nuevos),
//    todos cableados a contadores REALES del PlayerState (viewedNews,
//    streak, betsWon, marketTrades, mpCaptures, cameraIncome, logros…)
//    — progreso de verdad, no carteles. Nombres que cortan: EL SEDIENTO,
//    EL OJO QUE NUNCA PARPADEA, MANO DE DIOS, EL ADICTO CONFESO, EL MÁS
//    RICO DEL MUNDO, SANGRE EN LAS ACCIONES, IMPERIO DE CÁMARAS…
//  ② EL REY: ACH-LOGROS-100 «EL 1%» — solo cae cuando los otros 99 son
//    tuyos (check logrosUnlocked>=99; el snapshot de checkAchievements
//    lo desbloquea en el siguiente chequeo — estable y honesto).
//    Botín supremo: +1000 mon◉ +10 gemas +1000 XP.
//  ③ LA VITRINA /objetivos: página server-rendered e indexable — 100
//    tarjetas en 9 bloques (El ascenso, El sediento, Sin parpadear, La
//    conquista, El dinero, El vicio, Los ojos, La voz, La leyenda),
//    rarezas con color (COMUN/RARO/EPICO/LEGENDARIO), botín a la vista,
//    JSON-LD ItemList (jsonLdSeguro), canonical y bloque client
//    VitrinaProgreso (progreso real del store, diferido, cero mismatch,
//    ley v176 sin setState en effects).
//  ④ PUERTAS: sitemap weekly 0.7 + pg:objetivos en la paleta Ctrl+K.
// Los 100 también lucen en el panel de logros del SPA SIN tocar nada:
// achievements-panel itera ACHIEVEMENTS — los nuevos aparecen solos.
//
// v223.0 EL BARÓMETRO — AGENT 2 tarea 5 (TURNO AUTOMÁTICO, cron 500735):
//  mandato cola (e) «nuevas fuentes públicas respetando cuotas/licencias»
//  + cierre del eslabón MAPAS que v220 dejó pendiente: mapa →
//  acontecimiento → país → INDICADORES → fuente.
//  ① FUENTE NUEVA: API v2 del Banco Mundial (gratuita, SIN clave,
//    licencia CC BY 4.0). Resumen propio de qué mide cada indicador +
//    año del dato + ENLACE AL ORIGINAL (datos.bancomundial.org) —
//    atribución preservada, nada presentado como propio.
//  ② src/lib/nucleo/indicadores.ts: 4 indicadores VERIFICADOS en vivo
//    (SP.POP.TOTL población · NY.GDP.MKTP.CD PIB · MS.MIL.XPND.GD.ZS
//    gasto militar % PIB · SM.POP.TOTL stock migratorio) para las 15
//    naciones de RELACION_PAIS_TEATRO (ISO3_POR_ISO2, Taiwán declarado
//    aunque el Banco Mundial no lo cubra). CUOTA: 4 peticiones por
//    refresco (batch multi-país + mrnev=1) con cache 6 h (5 min si la
//    red falla). CERO valores en el código: los números SOLO entran
//    por la API; sin cobertura o sin red → nota honesta, nada fingido.
//  ③ ficha vg:pais (relaciones.ts + /nucleo server): bloque
//    «INDICADORES REALES» con valores formateados en español, año y
//    enlace verificable al original; /api/nucleo/entidad lo sirve por
//    contrato (aditivo). fnt:indicadores en la frontera pública
//    (patrón fnt:escuchas: fuente real sin proveedor de búsqueda).
// v224.0 EL ESTRATEGA — AGENT 2 tarea 6 (TURNO AUTOMÁTICO, cron 500735):
//  mandato cola (f) «simulación pequeña verificable: datos/supuestos/
//  variables/reglas/resultados SEPARADOS, nunca presentarla como
//  predicción, sin ejecutar código arbitrario de usuarios».
//  ① CINCO ARCHIVOS SEPARADOS (src/lib/nucleo/simulacion/): datos.ts
//    (solo lo documentado: fechas históricas v219, cables reales de la
//    BD, frentes OSINT v220, gasto militar del Banco Mundial v223 —
//    cada uno con procedencia), supuestos.ts (5 supuestos con texto/
//    justificación/límite), variables.ts (4 pesos 0–2 paso 0.1 con
//    validación dura: clave desconocida/no numérica/fuera de rango →
//    error declarado), reglas.ts (funciones PURAS sin reloj ni BD ni
//    red: mismo input → mismo output; anclas editoriales visibles),
//    index.ts (resultado ensamblado con las piezas separadas).
//  ② API /api/nucleo/simulacion: GET catálogo + escenario por defecto,
//    POST pesos validados (400 honesto con los errores) — muro 30/min.
//  ③ /escenarios: página server + isla client con deslizadores (el
//    aviso «ESCENARIO — NO ES PREDICCIÓN» viaja SIEMPRE con los
//    resultados). mod:escenarios en el censo (SIMULACION, ficha
//    vg:simulacion:escenarios gratis) + sitemap.
//  ④ indicadores.ts aditivo: indicadoresNumericosDePais() — los valores
//    crudos del mismo snapshot (cero peticiones extra).
// v225.0 EL FRENTE — AGENT 2 tarea 7 (TURNO AUTOMÁTICO, cron 500735):
//  mandato cola (b) eslabón MAPAS — el pendiente declarado desde
//  v220/v221: los frentes documentados se vuelven ENTIDADES.
//  ① 10.º tipo de entidad: vg:punto:<clave> (tipos.ts, aditivo;
//    etiqueta PUNTO DEL FRENTE + relación punto_de). Clave estable =
//    slug normalizado del nombre; desambiguación determinista si un
//    día dos teatros comparten ciudad (hoy: cero colisiones reales).
//  ② puntos.ts (puro, sin BD): puntosDelNucleo() — el catálogo de
//    TODOS los frentes proyectando SOLO geografiaDeTeatro (salas
//    OSINT v129 con fuente citada; cero literales lat/lng, la prueba
//    anti-invención lo vigila) + puntoPorClave() con null honesto.
//  ③ Ficha vg:punto (relaciones.ts): estado, teatro, coordenadas
//    DOCUMENTADAS, sala, fuente OSINT, nota de la sala y precisión;
//    enlaces al mapa /ver-guerra, al globo, a la ficha del teatro, al
//    acontecimiento y a los países — la cadena completa
//    mapa → frente → acontecimiento → país → indicadores → fuente.
//  ④ Búsqueda: los frentes responden como entidad vg:punto y llevan
//    a SU FICHA (la ficha lleva al mapa — antes iban directo a
//    /ver-guerra sin ficha). Filtro &tipo=punto gratis por la
//    whitelist. /nucleo: tarjeta PUNTO DEL FRENTE con conteo real.
// v226.0 EL TAMIZ — AGENT 2 tarea (c), TURNO AUTOMÁTICO (cron 500735):
//  la isla de /nucleo aprovecha el contrato que LA LUPA (v221) ya
//  declaraba y la búsqueda quedaba sin usar en la interfaz.
//  ① nucleo-busqueda.tsx: chips de filtro por tipo de entidad (TODO +
//    los 10 de TIPOS_ENTIDAD, aria-pressed, colores COLOR_TIPO) que
//    envían &tipo= al motor; los TÉRMINOS de la pregunta y el filtro
//    APLICADO (lo que respondió el motor, no el estado local) se
//    declaran a la vista; el vacío con filtro explica cómo salir.
//  ② /nucleo acepta ?tipo= en la URL (shareable): whitelist
//    TIPOS_ENTIDAD — un tipo desconocido se IGNORA, jamás se finge.
//  ③ motor (busqueda.ts): con filtro, cada fuente aporta hasta el
//    límite completo y el recorte va DESPUÉS del tamiz — antes el chip
//    solo enseñaba lo que sobró del top-24 sin filtrar (≤ 8 por fuente).
// v227.0 EL DESPLIEGUE — AGENT 2 tarea (b) MAPAS + directiva del Dueño
//  («ve a cada módulo de vanguard y expandelo», TURNO 09:11):
//  módulo expandido: /conflicto/[tag] — el teatro muestra SUS frentes.
//  ① Sección «LOS FRENTES DEL TEATRO»: los puntos de la sala OSINT
//    (v129, proyectados por v220, entidades desde v225) como chips
//    server-rendered que llevan a la FICHA vg:punto en /nucleo (la
//    ficha lleva al mapa — cadena intacta), con nota de cada punto en
//    el title y el conteo real por teatro.
//  ② Procedencia a la vista: «mapa OSINT · fuente: … · NO cartografía
//    oficial» + enlace «el mapa del frente ▸» a /ver-guerra cuando la
//    sala existe. CERO coordenadas en la página.
//  ③ Teatro sin sala (korea): la ausencia se DECLARA («la casa no
//    inventa puntos»), jamás fingida.
// v228.0 EL ATLAS — AGENT 2, TURNO AUTOMÁTICO (cron 500735) + directiva
//  del Dueño («expándelo ronda a ronda, módulo a módulo» + MEGA-PROMPT
//  MAESTRO v2.0 como carta de expansión): módulo expandido: /nucleo —
//  LAS FICHAS DE PAÍS MÁS RICAS (abundancia por país, REGLA #3).
//  ① La ficha vg:pais muestra TODA la ficha del atlas v121 que quedaba
//    fuera del núcleo: Población (~fmtMillones), Superficie (fmtKm2),
//    Idiomas y Moneda — 66 naciones documentadas (edición 2026).
//    CERO datos nuevos inventados: solo proyección del atlas.
//  ② enlacesDePais: los FRENTES del teatro del país (hasta 4) como
//    chips con relación punto_de hacia su ficha vg:punto (motivo con
//    estado + fuente OSINT citada + precisión) y «EL MAPA DEL FRENTE ▸»
//    a /ver-guerra cuando la sala existe. País sin teatro (Brasil):
//    cero frentes — la ausencia se declara, no se finge.
//  ③ QA: tsc 0 · eslint 0 · build EXIT 0 · pruebas 67/67 (+3 EL ATLAS:
//    estática de proyección anti-invención; ua con población, moneda,
//    frentes e ISW; br rica sin fingir frentes) · BD intocada.
// v229.0 EL PUENTE — AGENT 2, TURNO AUTOMÁTICO (cron 500735), directiva
//  del Dueño (módulo a módulo): módulo expandido: /ver-guerra — el mural
//  FRENTE TOTAL (v53) conecta con el núcleo.
//  ① Mapeo editorial EXPLÍCITO FRENTE_A_TEATRO (método TABLERO_ORIENTE
//    v220): 5 frentes con teatro documentado (donbas→ukraine, gaza→gaza,
//    marrojo→redsea, sudan→sudan, sahel→sahel); los otros 5 (Somalia,
//    RDC Este, Myanmar, Cachemira, Haití) NO se fingen — nota honesta
//    derivada del catálogo.
//  ② Tarjetas de LOS DIEZ TEATROS con conteo REAL de cables por teatro
//    (una query groupBy; sin BD la página vive sin chips) hacia
//    /conflicto/[tag] + «EL ACONTECIMIENTO ▸» hacia su ficha vg:aconteci-
//    miento (fechas históricas v219, jamás escritas a mano en la página).
//  ③ Bloque CONECTA CON EL NÚCLEO: /mundo, /nucleo, /escenarios, /audios.
//  ④ QA: tsc 0 · eslint 0 · build EXIT 0 · pruebas 69/69 (+2 EL PUENTE:
//    estática anti-fechas y mapeo; viva /ver-guerra con chips reales,
//    acontecimiento y declaración honesta) · BD intocada (1877 · 9).
// v230.0 EL ESPEJO — AGENT 2, TURNO AUTOMÁTICO (cron 500735), directiva
//  del Dueño (módulo a módulo): módulo expandido: /zona-cero — el simulador
//  (v54) vivía aislado del núcleo: cero puertas a los teatros reales que
//  alimentan su radar.
//  ① LA GUERRA REAL DETRÁS DEL ESPEJO (página async, una query groupBy):
//    los 9 teatros del catálogo documentado (TEATROS, cero nombres a mano)
//    con conteo REAL de cables hacia /conflicto/[tag] + «EL ACONTECIMIENTO ▸»
//    hacia su ficha vg:acontecimiento (fechas históricas v219, jamás escritas
//    a mano). Sin BD la sección se declara ausente — nunca conteos fingidos.
//  ② MATERIA PRIMA PARA TODA LA CASA (relaciones.ts): PUERTA_DE_FUENTE mapea
//    cada fnt: del censo a su puerta REAL (cables→/nucleo?tipo=noticia,
//    teatros→/mundo, acontecimientos→/nucleo?tipo=acontecimiento, audios,
//    escuchas, indicadores, módulos); enlacesDeModulo ahora proyecta las
//    fnt: del módulo (tope 6→8, solo expansión). Toda ficha vg:simulacion:*
//    y vg:mapa:* gana sus chips de materia prima.
//  ③ censo honesto: mod:zona-cero declara dependencias fnt:teatros +
//    fnt:cables (antes: vacías) — el radar de GDELT y la sección real viven
//    de ellas; la ficha vg:simulacion:zona-cero las proyecta gratis.
//  ④ Bloque CONECTA CON EL NÚCLEO en /zona-cero: /ver-guerra, /mundo,
//    /nucleo, /escenarios (anti-predicción en el motivo).
//  ⑤ Higiene del repo: el auto-commit del sistema había metido la copia de
//    rescate de la BD (5,3 MB) y un tmp vacío; reset mixto (los archivos
//    quedan en DISCO) + .gitignore: media/rescate-db-*/ y tmp/ — la ley v204
//    extendida: los rescates viven en el disco, la BD sana ya viaja en
//    db/custom.db.
//  ⑥ QA: tsc 0 · eslint 0 · build EXIT 0 · pruebas 72/72 (+3 EL ESPEJO) ·
//    BD intocada (1877 · 9).
// v231.0 EL LATIDO — AGENT 2, TURNO AUTOMÁTICO (cron 500735), directiva
//  del Dueño (módulo a módulo): módulo expandido: /vertigo — el feed
//  infinito (v211) tenía el país de origen de cada cable como dato muerto
//  (viajaba al client y nunca se renderizaba) y cero puertas al mapa real.
//  ① EL PAÍS DEL CABLE (feed client): cada pieza gana el chip 🌐 con el
//    nombre del país de origen (nombrePais, lib pura client-safe) hacia
//    su FICHA vg:pais en /nucleo — la ficha es honesta para toda ISO con
//    cables (atlas o meta ISO + cables reales), jamás 404. El API
//    /api/vertigo ya entregaba pais — cero cambios de contrato.
//  ② LA SALA DEL MUNDO (última estación del feed): la página server mide
//    el archivo con UNA query groupBy (cables por los teatros del catálogo
//    documentado TEATROS, ordenados por conteo) y entrega las salas al
//    feed — slide snap-start con conteo REAL hacia /conflicto/[tag] +
//    puertas LA BÚSQUEDA DEL NÚCLEO y GUERRA HOY. Sin BD la estación no
//    se finge: el feed vive sin ella. Cero conteos ni fechas a mano.
//  ③ noscript enriquecido: además de /guerra-hoy, la puerta /nucleo.
//  ④ QA: tsc 0 · eslint 0 · build EXIT 0 · pruebas 75/75 (+3 EL LATIDO) ·
//    BD intocada (1877 · 9).

// v232.0: LA CENTRAL DE ALARMAS (RENUMERADA dos veces: esta casa trabajó
//         sobre el árbol local v173 sin ver las 103 rondas de AGENT 2 en el
//         remoto — que consumieron v174-v231 —; integrada sobre origin/main
//         con el siguiente número libre. Crónica exacta en worklog) —
//         «noticias EN VIVO por importancia e impacto» necesitaba un
//         SIRENO: el CENTRO (v173) ranquea, la CENTRAL AVISA. El visitante
//         ya no tiene que estar mirando el rango para enterarse de la
//         primicia: la Casa lo llama.
// (1) LA CAMPANA DEL HUD (central-alarmas.tsx, junto al selector de
//     idioma): la Central barre la Agencia cada 60s (la misma dieta del
//     CENTRO) y cuando nace un cable de alto impacto recién nacido, la
//     campana CUENTA con aro rojo latiendo (v232-campana-viva en
//     globals.css, el lenguaje del anillo de alarma de la sala del mapa).
// (2) LA LEY DE LA ALARMA (src/lib/alarma.ts — determinista como el
//     motor de impacto): alarma = impacto ≥ CRÍTICO (64, el escalón de
//     TIERS) Y nacido < 120 min (la misma ventana EN VIVO del mundo 3D).
//     Store vg232-alarma con storage blindado y registro en el
//     REHIDRATADOR (la lección v171/v172/v176 ya es ley de la casa),
//     FIFO de 240 vistos — nada alarma dos veces — y techo de 9
//     pendientes por impacto: la campana no traga el archivo, el CENTRO
//     lo sirve. La PRIMERA revisión de un visitante siembra silencio
//     (nada inunda), salvo que un URGENTE siga humeando <15 min: una
//     sola alarma honesta.
// (3) EL TOAST ÚLTIMA HORA — la primicia aterriza con el icono siren del
//     color de su escalón y acción ABRIR que abre la SALA DE LECTURA
//     (v116) sin navegar. El panel de la campana lista las pendientes
//     con escalón/impacto/país/edad; tocar una la abre y la marca
//     leída; ABRIR EL CENTRO MUNDIAL vuela a la Agencia.
// (4) LECTURA HONESTA 2D⇄3D — estar mirando el CENTRO ES revisar la
//     campana: centro-panel llama limpiar() en cada carga (quien ve el
//     ranking ya leyó las alarmas). Paridad (ley #25): el mundo 3D ya
//     tiene su sireno — el anillo de alarma de la SALA DEL MAPA
//     MUNDIAL (v173) late en los cables <2h; la campana es la placa
//     de la Casa.
// (5) 3 BUGS CAZADOS EN QA E2E REAL y curados: ① carrera de rehidratación
//     (la primera barrida espera estaHidratado — el rehidratador pisaba
//     los vistos del primer barrido); ② re-alarma tras leer(); ③
//     re-alarma tras limpiar() — leer/limpiar pliegan los ids a vistos.
// Herencia v231.0 EL LATIDO y todo lo anterior. Guards v167 intactos.
// v233.0: LA BALANZA — las variables explicadas y la cadena navegable
//     (/escenarios, primer pendiente marcado de la cola del worklog v231:
//     «/escenarios (variables explicadas)»). El ESTRATEGA v224 ya separaba
//     datos/supuestos/variables/reglas/resultados; faltaba que CADA PIEZA
//     se explicara y que la procedencia fuera NAVEGABLE, no un tooltip:
// (1) LAS VARIABLES EXPLICADAS — VariableSimulacion gana mueve/fuente/
//     ancla/cero/dos/puerta (aditivo; sigue puro dato sin BD/red/React):
//     qué factor del desglose mueve cada peso, de dónde sale el dato que
//     multiplica (fnt:acontecimientos/cables/teatros/indicadores con su
//     detalle), contra qué ancla satura, qué significa 0 y qué significa
//     2, y la PUERTA REAL del núcleo donde vive el dato — el censo de
//     puertas de v230: LOS ACONTECIMIENTOS, EL ARCHIVO DE CABLES, EL
//     MAPA DEL FRENTE, LAS FICHAS DE PAÍS. Cero rutas inventadas.
// (2) LAS ANCLAS AL CATÁLOGO — las 4 decisiones editoriales (3 650 días,
//     500 cables, 12 frentes, 10 % PIB) salen del tooltip a su sección
//     con texto: por qué logaritmo, por qué techo, qué pasa sin sala
//     OSINT, por qué media del Banco Mundial. Los valores siguen viviendo
//     en ANCLAS de reglas.ts (pura) — anclasDelCatalogo() solo los
//     ENALTECE (la casa jamás duplica una constante).
// (3) LA CADENA NAVEGABLE — el id del acontecimiento documentado viaja
//     con cada teatro (DatoTeatro.idAcontecimiento ← ACONTECIMIENTO_POR_
//     TEATRO de la semilla v219, JAMÁS derivado del slug del teatro) y
//     ResultadoTeatro.puertaAcontecimiento lo entrega a la isla: el
//     nombre del teatro abre SU sala real /conflicto/[slug] (solo con
//     cables — 0 cables es 404 real, la puerta se evita, no se finge);
//     el factor tiempo abre /nucleo?id=vg:acontecimiento:<slug real>;
//     frentes abre /ver-guerra; capacidad abre /nucleo?tipo=pais — cada
//     uno SOLO cuando el dato existe (sin dato = sin puerta, declarado).
// (4) LOS MANDOS EXPLICADOS — bajo cada deslizador: qué significan sus
//     extremos (cero · dos) y la puerta al dato que multiplica.
// (5) CONECTA CON EL NÚCLEO (patrón v230) — /escenarios cierra con las
//     5 puertas de la cadena de procedencia (archivo, acontecimientos,
//     frente, fichas de país, búsqueda) server-rendered, cero JS.
// (6) PRUEBAS +3 (79/79): estática (estructura de las 4 variables, las
//     4 puertas reales, anclasDelCatalogo, idAcontecimiento desde la
//     semilla, guardas de la isla); viva /escenarios (secciones, puertas
//     y cadena en el SSR); viva las 5 puertas + la ficha del hecho
//     documentado respondiendo 200. Salud v232→v233.
// QA: tsc 0 · eslint 0 · build EXIT 0 · health v233.0 db up · BD intocada
//     (1877 cables · 9 hechos, un solo escritor). API aditiva: el POST
//     /api/nucleo/simulacion solo GANA campos (puertaAcontecimiento,
//     catalogo con las nuevas claves) — nada se rompe aguas abajo.
// Herencia v232.0 LA CENTRAL DE ALARMAS (la hermana, intacta) y todo lo
//     anterior. Guards v167 intactos.
// v234.0: LA ONDA — la emisora conecta con toda la casa (/audios,
//     primer módulo de la cola del worklog v231; la EMISORA v217 de la
//     casa hermana queda INTACTA — grabador, voces y al-aire sin tocar):
// (1) EL ÚLTIMO HECHO A LA VISTA — el parte ya NARRABA el último titular
//     de cada frente pero en pantalla era invisible: TeatroDelParte gana
//     ultimoId (el id del cable sale de la MISMA consulta — cero datos
//     nuevos) y la tarjeta muestra «ÚLTIMO HECHO: … ▸» hacia /noticia/[id].
// (2) LAS TRES PUERTAS DEL FRENTE — el nombre del frente abre SU SALA
//     REAL /conflicto/[tag] (el parte solo incluye teatros con cables en
//     24 h — la puerta jamás 404); cada tarjeta gana la onda corta «ver
//     en el mundo 3D ▸» a /mundo?teatro= (param real de v215); el último
//     hecho abre su cable. Guardas honestas: sin titular no hay puerta.
// (3) LA PÁGINA SE CONECTA (patrón v230/v233) — CONECTA CON EL NÚCLEO
//     con las 4 puertas reales de la onda (EL ARCHIVO DE CABLES, LAS
//     SALAS DE GUERRA, EL MAPA DEL FRENTE, LA BÚSQUEDA) server-rendered;
//     JSON-LD WebPage honesto con jsonLdSeguro (patrón v204); noscript
//     con las puertas esenciales (guerra-hoy, núcleo, conflicto).
// (4) PRUEBAS +3 (82/82): estática (ultimoId de la misma consulta, las
//     tres puertas del frente, guardas, cero conteos/fechas a mano,
//     jsonLdSeguro+CONECTA+noscript); viva /audios (puertas y conexión
//     en el SSR); viva las 5 puertas respondiendo 200. Salud v233→v234.
// QA: tsc 0 · eslint 0 · build EXIT 0 · health v234.0 db up · BD intocada
//     (1877 cables · 9 hechos, un solo escritor). API aditiva: el parte
//     solo GANA ultimoId — nada se rompe aguas abajo.
// Herencia v233.0 LA BALANZA y todo lo anterior. Guards v167 intactos.
// v235.0: EL BOTÍN — la vitrina cuenta lo que vale la caza y muestra el
//     camino (/objetivos, segundo módulo de la cola; VitrinaProgreso v216
//     y el catálogo ACHIEVEMENTS quedan INTACTOS — todo es aditivo):
// (1) LA BALANZA DEL BOTÍN — la página nunca dijo cuánto vale el botín
//     entero: ahora lo suma PIEZA A PIEZA del catálogo real con reduce
//     (monedas, gemas, XP) y lo declara junto al censo por rareza
//     (COMUN/RARO/EPICO/LEGENDARIO ×N con filter) — CERO números escritos
//     a mano: si el catálogo cambia, la balanza cambia sola (la prueba
//     estática lo vigila con regex).
// (2) EL MAPA DE CAZA — 100 tarjetas pero ninguna decía DÓNDE se caza:
//     sección nueva con solo rutas reales de la casa y etiquetas honestas
//     (EL APARATO / donde los 100 se registran de verdad en sus paneles;
//     LA SALA DEL VÉRTIGO / la materia prima de los INTEL; EL GLOBO 3D;
//     EL MAPA DEL FRENTE) — la ley: cada puerta dice la verdad sobre lo
//     que hay detrás.
// (3) CONECTA CON EL NÚCLEO (patrón v230/v233/v234) — EnlacesNucleo con
//     las 4 puertas reales de la vitrina (vértigo, globo, búsqueda,
//     primera página) server-rendered; noscript con las puertas
//     esenciales (aparato, vértigo, guerra-hoy).
// (4) PRUEBAS +3 (85/85): estática (totales con reduce y censo con
//     filter — regex anti-cifras a mano; mapa de caza solo rutas reales;
//     EnlacesNucleo + noscript); viva /objetivos (balanza, censo, mapa y
//     conexión en el SSR); viva las puertas respondiendo 200. Salud
//     v234→v235.
// QA: tsc 0 · eslint 0 · build EXIT 0 · health v235.0 db up · BD intocada
//     (1877 cables · 9 hechos, un solo escritor).
// Herencia v234.0 LA ONDA y todo lo anterior. Guards v167 intactos.
// v236.0: EL GLOSARIO — el traductor muestra sus tuercas y abre sus
//     cables (/traductor, tercer módulo de la cola; el estudio v215 y la
//     API de traducción quedan INTACTOS en comportamiento — todo aditivo):
// (1) EL GLOSARIO TÁCTICO A LA VISTA — el inventario de emergencia (vía 3
//     de la API: si el núcleo IA se apaga, el traductor nunca calla) vivía
//     enterrado en route.ts; ahora es FUENTE ÚNICA en
//     src/lib/glosario-tactico.ts (GLOSARIO_TACTICO + paresGlosario()), la
//     API lo consume sin cambiar su comportamiento y la página /traductor
//     lo renderiza COMPLETO con su conteo derivado — cero términos ni
//     cifras escritas a mano (patrón v233: la maquinaria editorial se
//     muestra y se discute).
// (2) LA PUERTA DEL CABLE — los cables vivos del estudio eran datos
//     muertos (título sin enlace): ahora cada uno abre SU sala
//     /noticia/[id]; el id real viaja con /api/pulso y la sala EN VIVO
//     solo sirve cables con origen real (externalId curated-* jamás
//     pasan) — la puerta jamás 404 por construcción.
// (3) CONECTA CON EL NÚCLEO (patrón v230) — EnlacesNucleo con las 4
//     puertas reales del traductor (EL ARCHIVO DE CABLES, LA SALA DEL
//     VÉRTIGO, LA BÚSQUEDA, PRIMERA PÁGINA) + noscript con las puertas
//     esenciales; el JSON-LD WebApplication v215 queda intacto.
// (4) PRUEBAS +3 (88/88): estática (fuente única consumida por la API y
//     la vitrina, conteo derivado — regex anti-cifras a mano, puerta
//     /noticia/${c.id}, CONECTA+noscript); viva /traductor (glosario
//     completo en el SSR con pares reales, conexión, JSON-LD); viva las
//     puertas 200 una a una. Salud v235→v236.
// QA: tsc 0 · eslint 0 · build EXIT 0 · health v236.0 db up · BD intocada
//     (1877 cables · 9 hechos, un solo escritor).
// Herencia v235.0 EL BOTÍN y todo lo anterior. Guards v167 intactos.
// v237.0: EL RELIEVE — el globo recupera la dieta pendiente y las pieles
//     del planeta dejan de repetirse a mano (la deuda marcada en la cola
//     desde v235; los cuatro globos de la casa quedan INTACTOS en
//     comportamiento — todo aditivo):
// (1) EL RELIEVE A DIETA — el heightmap earth-topology (2048x1024 gris,
//     378 KB en PNG) quedó FUERA de la dieta v199 (EL TURBO: blue-marble
//     1427→208 KB, night 698→85 KB con quality 78). Ahora viaja como
//     earth-topology.webp q95: 123.964 bytes (−67,2 %), error medido
//     píxel a píxel contra el original — Δmedio 0.28/255, Δmax 7/255 en
//     crestas: el ojo no nota diferencia y el relieve queda intacto. El
//     NEGATIVO ORIGINAL (PNG) no se borra jamás: sigue servido como
//     constancia y la prueba lo vigila. Hereda la caché de /assets de
//     v199 (max-age 1 día + SWR 7 días — el patrón :path* cubre webp).
// (2) FUENTE ÚNICA DE LAS PIELES (src/lib/globe-assets.ts) — la casa
//     jamás duplica una constante: el mapa VIEW_TEXTURES vivía ESCRITO
//     DOS VECES (globe-3d, globe-map-3d), el tipo GlobeViewMode también,
//     la ruta del bump map 4 VECES y earth-dark a mano en conquistas.
//     Ahora las cuatro salas 3D consumen TEXTURA_RELIEVE + TEXTURAS_VISTA
//     + GlobeViewMode del lib (cliente-seguro: constantes puras, cero
//     imports); los dos componentes re-exportan el tipo para no romper a
//     nadie (planeta-panel, mundo-3d-vivo, cameras-panel y map-panel
//     siguen importando GlobeViewMode de globe-map-3d, sin tocar).
// (3) PRUEBAS +3 (91/91): estática (fuente única — cero rutas /assets/
//     globe/ fuera del lib por regex; el negativo PNG sigue en disco y
//     el webp pesa MENOS que el PNG — fs.statSync, sin cifras a mano;
//     anti-fechas en el lib); viva el activo (webp 200 con content-type
//     image/webp y menos bytes que el PNG; el PNG 200 — nada borrado);
//     viva las salas (/, /mundo, /ver-guerra responden 200). Salud
//     v236→v237.
// QA: tsc 0 · eslint 0 · build EXIT 0 · health v237.0 db up · BD intocada
//     (1877 cables · 9 hechos, un solo escritor).
// Herencia v236.0 EL GLOSARIO y todo lo anterior. Guards v167 intactos.
// v238.0: EL VELOCÍMETRO — /mundo y /conflicto MEDIDOS en condiciones de
//     móvil (la cola llevaba «medir primero» desde v235; nada se toca sin
//     números) + el primer arreglo que los números exigieron:
// (1) EL INSTRUMENTO (scripts/velocimetro.mjs) — mide la visita fría de
//     un móvil: documento comprimido, TTFB, TODOS los subrecursos del
//     HTML clasificados (JS/CSS/fuentes/imágenes), las imágenes lazy
//     aparte (bajo demanda) y un CENSO DE BUILD de la familia three.js
//     (los chunks con código WebGLRenderer/PerspectiveCamera — jamás
//     texto: la bitácora dice «THREE.» y no es código). Toda medición
//     declara la versión que midió (lección del zombi: un servidor viejo
//     que sobrevive al pkill retiene el puerto y se medía CÓDIGO VIEJO
//     sin saberlo — EADDRINUSE en el log lo delató).
// (2) LA LÍNEA BASE MEDIDA (v238, visita fría, comprimido): /mundo 572 KB
//     (3G lenta: 3 s) · /conflicto/ukraine 612 KB críticos + 1165 KB de
//     lazy (3G: 10 s) · / 823 KB (3G: 4 s) · el planeta three.js entero:
//     1080 KB comprimidos en 21 chunks, sobre-coste bajo demanda de las
//     salas que montan globo. Ya vivían bien: el globo entra con
//     next/dynamic ssr:false (three JAMÁS en el HTML crítico), las
//     imágenes del teatro son lazy+hidden (v222), DPR capado (v222).
// (3) LA DIETA QUE LOS NÚMEROS MANDARON — los 6 fallbacks de imagen del
//     teatro pesaban 1,2 MB de red para un hueco de 120×90 px: variantes
//     ligeras 480w q80 en /assets/real/thumbs/ (~158 KB, −87 %); el slot
//     de /conflicto las sirve y los ORIGINALES siguen sirviendo a sus
//     otros 7 consumidores (la casa no borra). Medido tras el cambio con
//     servidor verificado fresco: lazy 1165→154 KB, sala completa
//     1777→766 KB (−57 %), 3G lenta 10 s→4 s.
// (4) PRUEBAS +3 (94/94): estática (instrumento honesto — marcadores de
//     código, versión declarada; las 6 thumbs existen y pesan menos que
//     sus originales por fs.statSync; el teatro cita thumbs y no
//     originales); viva (SSR con thumbs, thumb 200 image/webp,
//     PRESUPUESTOS: el HTML del teatro y del mundo no engordan callados);
//     viva las salas medidas 200. Salud v237→v238.
// QA: tsc 0 · eslint 0 · build EXIT 0 · health v238.0 db up · BD intocada
//     (1877 cables · 9 hechos, un solo escritor).
// Herencia v237.0 EL RELIEVE y todo lo anterior. Guards v167 intactos.
// v239.0: EL FRENTE LIGERO — la dieta de v238 llega a las dos salas que
//     quedaban sirviendo /assets/real/ crudo (la cola lo llevaba señalado):
// (1) LA MEDIDA QUE MANDÓ — en la BD 1.857 de 1.877 cables viajan sin
//     imageUrl: las últimas 24 (las que pinta /guerra-hoy) caen TODAS en
//     fallback. Línea base v238 medida con el velocímetro: /guerra-hoy
//     1.817 KB con 1.202 KB de imágenes (3G lenta: 10 s) y /noticia/<id>
//     1.740 KB con las mismas 1.202 KB (3G: 10 s) — seis JPG de ~200 KB
//     promedio vistiendo slots de 220×140 y 96×72 px.
// (2) LA REPARTICIÓN HONESTA — cada imagen de la casa tiene DOS deberes y
//     DOS pieles: /guerra-hoy viste su lista completa (24 cards, slot
//     220×140) con las thumbs 480w de v238; /noticia/[id] separa los
//     deberes — hero y metadata social (og/twitter/JSON-LD declaran
//     1200×630) conservan el ORIGINAL (una thumb ahí es mentirle al
//     crawler y borrosa en pantalla), y SOLO las cards relacionadas (slot
//     96×72) visten la thumb. Los ORIGINALES no se borran jamás: siguen
//     sirviendo a biblioteca, cine, juego y a los crawlers.
// (3) MEDIDO TRAS EL CAMBIO (velocímetro contra health v239.0, visita
//     fría, comprimido): /guerra-hoy 1.817→806 KB, imágenes 1.202→191 KB,
//     3G lenta 10 s→4 s · /noticia/<id> 1.740→879 KB, imágenes
//     1.202→341 KB, 3G 10 s→5 s.
// (4) PRUEBAS +3 (97/97): estática — las dos pieles viven separadas
//     (FALLBACK_IMGS vs FALLBACK_THUMBS, imgDe vs thumbDe) y cada una en
//     su deber (og:image y JSON-LD visten original por regex; el slot de
//     96 px jamás viste el original); viva — el SSR de /guerra-hoy no
//     contiene NI UN src de JPG crudo del archivo, la sala del cable
//     (id real sacado del SSR, jamás a mano) muestra las relacionadas en
//     thumbs y el hero en original exactamente UNA vez; viva las salas
//     vestidas 200 + thumb webp con content-type. Salud v238→v239.
// QA: tsc 0 · eslint 0 · build EXIT 0 · health v239.0 db up · BD intocada
//     (1877 cables · 9 hechos, un solo escritor).
// Herencia v238.0 EL VELOCÍMETRO y todo lo anterior. Guards v167 intactos.
// v240.0: EL REPARTO — la cola señalaba «la familia three.js replicada en
//     21 chunks, dedup o shared chunk, ronda futura con el velocímetro
//     delante». Esta es esa ronda, y los números mandaron otra vez:
// (1) EL CENSO HONESTO — el «censo de three» del velocímetro (marcador
//     WebGLRenderer|PerspectiveCamera) contaba un FALSO POSITIVO: el chunk
//     de 280 KB gzip es MAPLIBRE (maplibre ×357, regl ×59 — ni una clase
//     de three). El marcador fino (ACESFilmicToneMapping, constante del
//     núcleo que sobrevive a la minificación y que maplibre NO contiene)
//     revela la verdad: el núcleo de three viaja en 4 chunks — 55dbcfe0
//     (382 KB gzip: three+globe.gl+tween+controles, bajo demanda de los
//     globos), b53f84af (84 KB) y 37dabf1f (100 KB) — y las constantes del
//     núcleo viven en TRES chunks: three está DUPLICADO en el build.
// (2) LA VIOLACIÓN MEDIDA — el SSR por sala delata al culpable: /, /mundo
//     y /ver-guerra NO declaran ninguno de los gigantes (los globos entran
//     a la hidratación, ley v222 intacta), pero /zona-cero llevaba DOS
//     chunks con three ESTÁTICOS en su HTML crítico: zona-cero-tabs
//     importaba TeatroGlobal3D y ZonaCero3D SIN dynamic — la ley v222
//     («three JAMÁS en el HTML crítico») no cubría a zona-cero. Línea
//     base medida: /zona-cero 800,1 KB con 631,1 KB de JS (3G: 4 s).
// (3) EL REPARTO — los dos teatros 3D de zona-cero cargan ahora bajo
//     demanda (next/dynamic ssr:false, el patrón de los globos desde
//     v222) con pantalla de carga honesta; el lienzo 2D clásico sigue
//     ESTÁTICO (canvas barato, no le debe nada a three) y el modo «2d»
//     NO BAJA THREE JAMÁS. Medido tras el cambio (health v240.0):
//     /zona-cero 800,1→593,1 KB (−26 %), JS 631,1→425,0 KB (−206 KB),
//     3G lenta 4 s→3 s.
// (4) LA DEUDA DOCUMENTADA, NO ESCONDIDA — Turbopack no expone
//     splitChunks y las 3 copias del núcleo siguen en el build (bajo
//     demanda y cacheadas tras el primer teatro): dedup real queda en la
//     cola. El censo del velocímetro se corrige de palabra: 22 chunks por
//     marcador laxo ≈ 1067 KB, 4 chunks de three REAL (~569 KB gzip) +
//     maplibre 280 KB que NO es three.
// (5) PRUEBAS +3 (100/100): estática — dynamic con ssr:false para ambos
//     teatros, CERO import estático de los pesados (regex), el lienzo 2D
//     sigue estático, la ley v222 citada donde se aplica; viva — el HTML
//     crítico de /zona-cero se examina CHUNK POR CHUNK (todos los JS que
//     declara se descargan y NINGUNO lleva el MOTOR de three — marcadores
//     WebGLRenderer/ShaderMaterial/BufferGeometry, ×0 también en maplibre,
//     que falsea «PerspectiveCamera» ×2: por eso el censo laxo mentía);
//     excepción documentada: UNA constante suelta de three viaja en el
//     chunk GLOBAL compartido (~75 KB con zustand, pegado de Turbopack que
//     / y /mundo ya cargaban — deuda del empaquetador, no de zona-cero);
//     los tres modos del selector siguen en el SSR; viva las salas del
//     planeta 200. Salud v239→v240.
// QA: tsc 0 · eslint 0 · build EXIT 0 · health v240.0 db up · BD intocada
//     (1877 cables · 9 hechos, un solo escritor).
// Herencia v239.0 EL FRENTE LIGERO y todo lo anterior. Guards v167 intactos.
// v241.0: EL UNIVERSO ABIERTO — vuelta a la directiva módulo a módulo tras
//     tres rondas de rendimiento (v238-v240). La auditoría de patrones de
//     la casa por sala del censo: /mision es utilitaria noindex (su ley
//     propia, respetada), /espia ya lleva JSON-LD; el módulo más huérfano
//     es /vanguard2 — 0 CONECTA, 0 noscript, 0 JSON-LD PERO declarado
//     indexable (robots index:true): Google la indexa y no encuentra nada
//     estructurado, y un visitante sin JS recibe el vacío absoluto.
// (1) LA LEY ESTRUCTURAL SE RESPETA — vanguard2 es 100% lienzo («cero
//     chrome DOM», su comentario fundacional): todo lo nuevo vive donde no
//     estorba. Con JS encendido el canvas sigue siendo TODO lo que hay.
// (2) LA FICHA DEL UNIVERSO (patrón v215) — JSON-LD WebApplication server-
//     rendered con jsonLdSeguro: name, description honesta (noticias en
//     vivo, conflictos documentados, quiz, encuestas, logros y economía de
//     la guerra en mundos 3D), url, inLanguage es, offers price 0,
//     operatingSystem Web, publisher VANGUARD.
// (3) LAS PUERTAS DEL UNIVERSO (patrón v230/v234/v236) — noscript server-
//     rendered con EnlacesNucleo reutilizado y 6 puertas REALES del censo
//     (/, /mundo, /ver-guerra, /espia, /nucleo, /guerra-hoy) con su motivo
//     de conexión a la vista: el visitante sin JS y el crawler reciben el
//     mapa del universo; sin JS el 3D no puede nacer y la casa lo dice.
// (4) PRUEBAS +3 (103/103): estática — ficha WebApplication con
//     jsonLdSeguro, noscript con EnlacesNucleo, CERO puertas inventadas
//     (cada ruta citada verificada), la ley del lienzo intacta (vanguard2.tsx
//     sin chrome DOM), anti-fechas; viva — /vanguard2 200 con JSON-LD,
//     noscript y puertas en el SSR; viva las 6 puertas responden 200 una
//     a una. Salud v240→v241.
// QA: tsc 0 · eslint 0 · build EXIT 0 · health v241.0 db up · BD intocada
//     (1877 cables · 9 hechos, un solo escritor).
// Herencia v240.0 EL REPARTO y todo lo anterior. Guards v167 intactos.
// v242.0: EL KIT COMPLETO — la cola de v241 dejó tres salas señaladas y
//     esta ronda las viste TODAS: el kit estructural de la casa (CONECTA /
//     noscript / JSON-LD) llega a su última deuda.
// (1) /espia — CONECTA CON EL NÚCLEO (EnlacesNucleo, 4 puertas REALES del
//     censo: /ver-guerra, /mundo, /guerra-hoy, /nucleo) + noscript HONESTO:
//     el radar ES server-rendered — el índice, las escuchas y los
//     movimientos se leen enteros sin JavaScript; lo único que necesita JS
//     es el botón SONPEAR DE NUEVO (v190). La casa lo dice en vez de fingir.
// (2) /en-vivo — CONECTA server-rendered BAJO la sala (patrón v236): las
//     4 puertas del pulso (/guerra-hoy, /espia, /mundo, /nucleo) viven en
//     la página server, jamás dentro del componente client — el chrome no
//     entra en la sala (ley v190: la sala nunca se recarga).
// (3) /modo — la ficha WebPage con jsonLdSeguro (patrón v215): tipo honesto
//     — es una página de la casa, no una app suelta (vanguard2 sí llevó
//     WebApplication porque ES un universo autocontenido); name, url
//     absoluta, isPartOf VANGUARD, inLanguage es.
// (4) PRUEBAS +3 (106/106): estática — las tres salas visten por regex
//     (espia: CONECTA+noscript+ficha intacta+4 puertas; en-vivo: CONECTA
//     fuera de la sala client — la sala-en-vivo.tsx sin EnlacesNucleo;
//     modo: WebPage con jsonLdSeguro), anti-fechas en las tres; viva —
//     las tres salas 200 con su kit en el SSR (chips y href reales, ficha
//     en modo); viva las 7 puertas del kit 200 una a una. Salud v241→v242.
// QA: tsc 0 · eslint 0 · build EXIT 0 · health v242.0 db up · BD intocada
//     (1877 cables · 9 hechos, un solo escritor).
// Herencia v241.0 EL UNIVERSO ABIERTO y todo lo anterior. Guards v167 intactos.
// v243.0: LA POLÍTICA VIVA — el barrido módulo a módulo se completa: la
//     única sala del censo que ninguna ronda había expandido desde su
//     nacimiento (v206→v242, 36 rondas) viste el kit de la casa.
// (1) LA FICHA DE LA POLÍTICA (patrón v215) — JSON-LD WebPage con
//     jsonLdSeguro: la página que Google News Publisher Center exige para
//     validar la publicación merece su ficha estructurada como las demás
//     salas (name, url absoluta, isPartOf VANGUARD, inLanguage es).
// (2) CONECTA CON EL NÚCLEO (patrón v230) — 3 puertas REALES del censo
//     (/nucleo, /modo, /) con su motivo a la vista: la política no es una
//     isla, el censo que declara la frontera queda a un chip.
// (3) LA SECCIÓN 9 «LA FRONTERA TÉCNICA, A LA VISTA» — la política
//     documenta lo que el ÁRBOL DECLARA: los 4 almacenes privados de
//     fuentes.ts (fnt:cuentas, fnt:jugadores, fnt:telemetria,
//     fnt:conversacion) con sus ids reales a la vista y la regla fija
//     (jamás en búsqueda ni API pública), y la vigilancia real de la suite
//     de pruebas. SIN noscript a propósito: la página es 100%
//     server-rendered y funciona entera sin JavaScript — fingir una
//     carencia sería mentir (la honestidad como técnica).
// (4) PRUEBAS +3 (109/109): estática — la HONESTIDAD ESTRUCTURAL: los ids
//     citados por la política son EXACTAMENTE los que fuentes.ts declara
//     (ni uno inventado, ni uno real callado), ficha+puertas por regex, sin
//     noscript fingido; viva — /privacidad 200 con ficha, CONECTA, sección
//     9 y hrefs en el SSR; viva las puertas 200 una a una. Salud v242→v243.
// QA: tsc 0 · eslint 0 · build EXIT 0 · health v243.0 db up · BD intocada
//     (1877 cables · 9 hechos, un solo escritor).
// Herencia v242.0 EL KIT COMPLETO y todo lo anterior. Guards v167 intactos.
// v244.0: LA FAMILIA REUNIDA — la deuda v240 se paga: la familia three deja
//     de viajar replicada y el instrumento de la casa se corrige a sí mismo.
// (1) EL DIAGNÓSTICO HONESTO (medir, no suponer) — censo del build v243:
//     el núcleo del motor vivía en 4 chunks reales (~554 KB gzip): el del
//     globo (373 KB con globo+adornos) más copias por cada raíz de import
//     independiente (teatros, hangar, frente, motor de vanguard2) — el
//     empaquetador no los reunía. Y un hallazgo mayor: la «constante suelta
//     del motor en el chunk global» documentada por v240 era un ARTEFACTO
//     DE MEDICIÓN — el texto de la propia bitácora v240 (que describe el
//     marcador) viaja empaquetado y contaminaba el censo: con marcadores de
//     CLASE limpios (verificados ×0 en bitácora y en maplibre) el chunk
//     global NUNCA llevó código del motor. La casa corrigió su instrumento.
// (2) LA REUNIÓN (next.config.ts) — grupo de caché familiaTres: TODA la
//     familia (motor, globo, three-globe, render-objects, las 3 geometrías,
//     tween) vive en UN chunk asíncrono único; la primera sala 3D lo baja y
//     el navegador lo cachea para todas las demás; chunks:"async" lo mantiene
//     FUERA del HTML crítico de cualquier sala (ley v222) y las salas sin 3D
//     no lo bajan jamás.
// (3) EL MOTOR QUE HONRA LA LEY — el build de producción pasa a --webpack:
//     Turbopack no expone splitChunks y webpack sí; el tree-shaking de
//     webpack además poda el motor por uso real (familia medida: 554 KB en
//     4 copias → un solo chunk compartido). El dev sigue en Turbopack.
// (4) PRUEBAS +3 y curación del comentario v240: estática — la configuración
//     declara el grupo reunido con chunks async y el build declara el motor
//     que lo honra; viva — el censo del build cuenta las piezas del motor
//     con marcadores limpios y las salas /, /mundo, /zona-cero, /privacidad
//     examinan su HTML crítico chunk a chunk sin encontrar el motor (ley
//     v222 extendida a la casa entera). Salud v243→v244.
// QA: tsc 0 · eslint 0 · build EXIT 0 · health v244.0 db up · BD intocada
//     (1877 cables · 9 hechos, un solo escritor).
// Herencia v243.0 LA POLÍTICA VIVA y todo lo anterior. Guards v167 intactos.
// v245.0: LA QUINTA ESCUCHA — el radar /espia se ensancha y una mina
//     latente sale del árbol.
// (1) LA QUINTA FUENTE — el elemento más antiguo de la cola («nuevas
//     fuentes con cuota», presente desde v238) se paga: OPCW (Organización
//     para la Prohibición de las Armas Químicas, La Haya) entra en
//     ESCUCHAS_FUENTES con la regla de la casa cumplida: verificada ANTES
//     de entrar (2026-11-04: 200 con 10 items reales — títulos, enlaces y
//     pubDate que el parser lee tal cual), misma cuota de siempre (4
//     titulares por fuente) y SIN SEÑAL honesto si calla. El radar OSINT
//     de la casa escucha ahora 5 señales oficiales.
// (2) LA MINA LATENTE — al leer el módulo se caza un defecto dormido
//     desde v242: la línea de movimientos decía TAG_COLOR.tag] (clave
//     estática inexistente + un corchete suelto que tsc y SWC se tragan
//     SOLO con el texto exacto de esa plantilla — bisect documentado: con
//     texto corto tsc grita TS1005, con el texto de producción calla).
//     El compilado real (z[a.tag]||z.INFO) siempre fue el correcto — el
//     runtime sirvió colores verdaderos las tres rondas — y la fuente
//     vuelve a decir lo que el runtime lleva haciendo desde v242. La
//     tierra que podía reventar el build en cualquier edición futura
//     queda desactivada.
// (3) EL CENSO AL DÍA — fnt:escuchas y el registro del módulo espía citan
//     a la OPCW (descripción + alias de búsqueda); la metadata de la sala
//     declara las 5 señales y el header ya no mentiría con un «de 4»
//     heredado cuando la red no responde.
// QA: tsc 0 en tocados (3 avisos PREEXISTENTES de andamiaje .next/types —
//     meteo/ZONES, og/size, traductor/IDIOMAS — quedan en cola para su
//     ronda propia) · eslint 0 · build EXIT 0 · health v245.0 db up · BD
//     intocada (1877 cables · 9 hechos, un solo escritor).
// Herencia v244.0 LA FAMILIA REUNIDA y todo lo anterior. Guards v167 intactos.
// v246.0: EL ANDAMIAJE EN SILENCIO — la ronda propia que la cola pedía:
//     las rutas API solo exportan handlers y su configuración.
// (1) EL AVISO MUERE — tres rondas arrastrando el mismo parloteo de
//     andamiaje (.next/types: meteo/ZONES, og/size, traductor/IDIOMAS):
//     Next.js 16 exige que un módulo de ruta exporte SOLO handlers y
//     claves de configuración; los tres valores eran constantes internas
//     con un «export» de más (el de og, hábito de la convención
//     opengraph-image.tsx; el del traductor, un alias re-exportado del
//     catálogo de @/lib/idiomas que el cliente ya importa directo).
// (2) CERO BORRADO (ley MEGA-PROMPT) — las tres constantes siguen vivas
//     y con su uso interno intacto (meteo mapea sus 8 zonas, og viste su
//     ImageResponse 1200×630, el GET del traductor sigue sirviendo la
//     lista entera en su JSON): solo dejan de ser públicas del módulo.
// (3) EL RESULTADO MEDIDO — `npx tsc --noEmit` responde CERO LÍNEAS por
//     primera vez en rondas: el proyecto entero, andamiaje incluido,
//     calla. El aviso queda fuera de la cola para siempre.
// QA: tsc 0 TOTAL (0 líneas, primera vez en rondas) · eslint 0 (3 tocados;
//     scripts/*.mjs fuera de eslint por diseño) · build EXIT 0 · health
//     v246.0 db up · pruebas 116/116 (+2 EL ANDAMIAJE EN SILENCIO:
//     estática — las tres rutas sin export de valores, las constantes
//     presentes (cero borrado), handlers y dynamic en pie; viva —
//     /api/meteo {ok,zones[8]}, /api/og image/*, /api/traductor
//     {ok,idiomas≥8}) · BD intocada (1877 cables · 9 hechos, un solo
//     escritor).
// Herencia v245.0 LA QUINTA ESCUCHA y todo lo anterior. Guards v167 intactos.
// v247.0: LA CARGA JUSTA — el módulo /noticia paga su partida de la cola:
//     el sobre-coste de imágenes (342 KB medidos) baja a 40 KB (−88%).
// (1) LA MEDIDA QUE MANDÓ — página /noticia típica: hero JPG de 70–210 KB
//     + 5 thumbs eager = 342 KB de imágenes compitiendo con el primer
//     paint; censo de la BD: 0/1877 cables con imagen externa http — el
//     «si los orígenes externos traen miniaturas» de la cola estaba
//     resuelto por el censo: el coste era 100% de la casa.
// (2) EL HORNO — scripts/hornear-og.mjs (sharp, dependencia real de la
//     casa) hornea /assets/real/og/*.webp a 1200×630 EXACTOS (fit cover,
//     q72): el recorte que el navegador ya hacía en pantalla viaja hecho
//     en el archivo — city-1 210→40 KB (−81%), media de 24 archivos −65%.
// (3) EL HERO ES EL LCP — fetchPriority="high" + decoding="async"; las
//     5 thumbs relacionadas loading="lazy" (bajo el scroll, ocultas en
//     móvil). La metadata social sigue en JPG (crawlers, v239 intacto)
//     pero ahora declara las dimensiones REALES (DIMS_REALES, medidas con
//     sharp) — el 1200×630 inventado que ningún archivo cumplía muere;
//     URL desconocida → width/height se omiten antes que mentir.
// QA: tsc 0 TOTAL (el silencio v246 se mantiene) · eslint 0 · build
//     EXIT 0 · health v247.0 db up · pruebas 119/119 (+3 LA CARGA JUSTA:
//     estática con anclas exactas y viva — hero og/*.webp en SSR,
//     og:image:width 1600 real, 5 lazy) · BD intocada (1877 cables ·
//     9 hechos, un solo escritor).
// Herencia v246.0 EL ANDAMIAJE EN SILENCIO y todo lo anterior. Guards v167 intactos.
// v248.0 EL FOTOGRAMA LIGERO — la dieta módulo a módulo continúa: la cola de
//     v247 señalaba «/guerra-hoy y /conflicto heredan el patrón de las pieles
//     si sus JPG crudos quieren dieta propia (solo hero pendiente, MEDIR
//     ANTES)» — y la medida movió el objetivo con honestidad: esas salas ya
//     visten thumbs 480w (v238/v239), su SSR no lleva un solo JPG crudo. El
//     censo real de /assets/real/*.jpg encontró la deuda donde nadie miraba:
//     los PANELES SPA — la galería de fotogramas verificados (24 JPG reales,
//     3,69 MB en el archivo) y las 6 emisiones sembradas del feed social.
// (1) LA MEDIDA — grid de gallery-panel: p.image servía el JPG crudo lazy
//     (tanks-1 304 KB, city-1 210 KB…) en huecos aspect-square de 150-250 px
//     que object-cover recortaba en pantalla; social-data sembraba 6 thumbs
//     crudas (958 KB) que videos-panel y foryou-panel pintan en cards.
// (2) EL SEGUNDO HORNO — scripts/hornear-pieles-panel.mjs hornea
//     /assets/real/paneles/*.webp a 640×360 EXACTOS (fit cover attention,
//     q72): 24 pieles, 3,69 MB → 516 KB (−86%). Las og/ (v247) y thumbs/
//     (v238) siguen vivas para SUS consumidores.
// (3) LA PIEL Y EL NEGATIVO — pielDeFoto() en game-data.ts (fuente única del
//     mapa stem→piel; las sintéticas /assets/osint y las subidas de los
//     vecinos vuelven tal cual): la TARJETA viste la piel, el VISOR del
//     modal conserva la JPG completa detrás del click (una foto por click,
//     la pide quien la quiere). Las 6 thumbs del feed apuntan a la piel
//     explícitamente (poster de foryou incluido). La JPG original NADIE la
//     borra: visor + metadata social (v247) + horno.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 · health v248.0 db up ·
//     pruebas 122/122 (+3 EL FOTOGRAMA LIGERO: estática — helper y guardia,
//     tarjeta en piel, visor en negativo, 6 emisiones en piel, familia
//     ≥24 auditada piel a piel; viva — paneles/tanks-2.webp 200 image/webp
//     ligera y tanks-2.jpg sigue 200) · BD intocada (1877 cables · 9
//     hechos, un solo escritor).
// Herencia v247.0 LA CARGA JUSTA y todo lo anterior. Guards v167 intactos.
// v249.0 EL MURO DE PIEDRA — la expansión funcional que la cola pedía («siguiente
//     ronda: expansión funcional del siguiente módulo», directiva módulo a
//     módulo del dueño) llega a la emisora /audios: el muro de las voces deja
//     de vivir SOLO dentro del grabador (client-side, invisible sin JavaScript)
//     y se TALLA en el servidor. La promesa v217 «aparecerá en el muro de la
//     casa» ahora se cumple en el propio HTML.
// (1) LA BRECHA MEDIDA — el muro existía como API (GET /api/audios devuelve
//     las 30 con URLs /api/media/<id>) y como muro vivo dentro de GrabadorAudio
//     (fetch client-side), pero el SSR de /audios no llevaba NI UNA voz: bots,
//     lectores sin JavaScript y el primer paint no veían el archivo.
// (2) EL MURO EN EL SSR — la página consulta la BD real
//     (audioComandante.findMany, últimas 8 por createdAt) y sirve la sección
//     «EL MURO DE LAS VOCES»: autor · duración · fecha (Intl, cero fechas a
//     mano) y reproductor <audio controls preload="none"> NATIVO — funciona
//     sin JavaScript, no pide un byte hasta el click. Vacío honesto si nadie
//     habló («El muro está en pie y vacío…»). El muro vivo del grabador
//     (v217) queda INTACTO como espejo instantáneo.
// (3) LA VOZ ENTRA SIN RECARGAR — GrabadorAudio llama router.refresh() tras
//     el envío: la voz recién mandada entra en el muro de piedra sin recargar
//     la página; el catch de errores queda intacto.
// (4) EL NOSCRIPT GANA SU PUERTA — «Sin JavaScript la emisora no puede sonar»
//     sigue siendo verdad para el parte hablado (TTS), pero ya no para las
//     voces: el noscript señala el muro (reproductor nativo, sin JS).
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 · health v249.0 db up ·
//     pruebas 124/124 (+2 EL MURO DE PIEDRA: estática — anclas del muro,
//     BD real, media real, preload perezoso, vacío honesto, router.refresh;
//     viva — el SSR lleva el muro y, si la BD tiene voces, la más nueva se
//     sirve audio/*; si no, el vacío honesto en pie) · BD intocada (1877
//     cables · 9 hechos, un solo escritor).
// Herencia v248.0 EL FOTOGRAMA LIGERO y todo lo anterior. Guards v167 intactos.
// ── v250.0 EL VÉRTIGO QUE RECUERDA — la expansión funcional módulo a módulo
//     llega a /vertigo (v211 EL VÉRTIGO + v231 EL LATIDO): la fórmula TikTok
//     gana sus dos señales que faltaban.
// (1) COMPARTIR — la tercera señal de la columna derecha (latido ❤️ · teatro
//     🗺️ · país 🌐 · AHORA enviar 📤): la pieza viaja con su URL real de sala
//     de lectura (/noticia/<id>) — hoja nativa Web Share API si el aparato la
//     trae, portapapeles + aviso «Copiado» si no, y última red honesta
//     (prompt de copia manual) si el aparato no deja ni lo uno ni lo otro.
//     stopPropagation: compartir jamás dispara el doble toque de la pieza.
// (2) REANUDAR — continue-watching: la marca del deslizamiento (cable ·
//     índice · instante) vive en el aparato (localStorage vg-vertigo-ultimo,
//     una escritura por cambio de pieza — no por evento de scroll) y al
//     volver el feed salta a la pieza guardada SOLO si ya viaja cargada
//     (jamás inventa un salto a piezas que no trajo), con aviso de una vez
//     arriba: «Reanudado donde lo dejaste». Todo client-side tras montaje:
//     cero mismatch de hidratación, cero recargas (ley v190).
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 · health v250.0 db up ·
//     pruebas 126/126 (+2 EL VÉRTIGO QUE RECUERDA: estática — Web Share con
//     portapapeles y última red, la tercera señal con aria-label, la marca
//     en el aparato, el salto acotado a lo cargado, el aviso y el
//     stopPropagation; viva — el SSR sirve la señal de compartir en cada
//     pieza y las estaciones v231 siguen en pie) · BD intocada (1877
//     cables · 9 hechos, un solo escritor).
// Herencia v249.0 EL MURO DE PIEDRA y todo lo anterior. Guards v167 intactos.
// ── v251.0 EL REFUGIO CON MEMORIA — la expansión funcional módulo a módulo
//     llega a /offline (v210 EL REFUGIO): la sala de emergencia deja de ser
//     una sala sin memoria.
// (1) EL CENTINELA DEL PARTE — /guerra-hoy (la puerta más visitada) monta un
//     componente silencioso que deja en el aparato (localStorage
//     vg-ultimo-parte) la copia de las 8 piezas más nuevas con la hora del
//     guardado; no pinta nada, no pide nada, no decide nada (ley v190).
// (2) EL ÚLTIMO PARTE EN EL MURO — el refugio talla la copia: «EL ÚLTIMO
//     PARTE QUE TU APARATO VIO» — título · fuente · tiempo transcurrido,
//     hora del guardado y la confesión honesta: «es la memoria del aparato,
//     no la red: puede estar desactualizado». Vacío honesto si no hay copia.
// (3) LA DECISIÓN DE INGENIERÍA — el parte viaja en un SCRIPT INLINE del
//     propio HTML (corre durante el parseo, sin esperar a React): los chunks
//     JS de esta ruta quizá nunca se cachean (el refugio solo se sirve SIN
//     red — un chunk pedido por primera vez sin red no llega), así que el
//     script del HTML es la única memoria que funciona SIEMPRE, incluso en
//     la primera visita sin red. El worker (v210) NO se toca: su contrato
//     v125/v190 queda intacto.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 · health v251.0 db up ·
//     pruebas 128/128 (+2 EL REFUGIO CON MEMORIA: estática — el centinela
//     escribe con su hora, el refugio lee inline con la confesión, la
//     primera página deja la copia; viva — el script y el muro viajan en el
//     HTML del refugio y la portada sigue en pie) · BD intocada (1877
//     cables · 9 hechos, un solo escritor).
// Herencia v250.0 EL VÉRTIGO QUE RECUERDA y todo lo anterior. Guards v167 intactos.
// ── v252.0 LA SALA QUE HABLA — la expansión funcional módulo a módulo
//     llega a /noticia/[id] (la puerta de lectura, la sala por la que
//     entra el visitante de Google): la sala deja de ser muda y sin salida.
// (1) ESCUCHAR — speechSynthesis del APARATO (gratis, sin API nueva, la
//     misma boca del asistente v117): lee título + resumen con la voz en
//     español que el aparato trate; toggle honesto (▶ escuchar / ■ parar);
//     cancel() en desmontaje — la sala nunca deja una voz huérfana; sin
//     voz disponible, la sala lo DECLARA — jamás se finge. Ley v190: la
//     voz solo arranca con UN TOQUE del visitante — nada suena solo.
// (2) COMPARTIR — el patrón v250 exacto: hoja nativa Web Share →
//     portapapeles + aviso «Enlace copiado» → última red honesta (prompt);
//     el enlace es SIEMPRE el canónico /noticia/<id> que Google anuncia.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 · health v252.0 db up ·
//     pruebas 130/130 (+2 LA SALA QUE HABLA: estática — la isla con su
//     voz cancelada en desmontaje, su es-ES, sus tres peldaños de
//     compartir y sus aria-labels; la sala monta con titulo/resumen/url;
//     viva — el SSR de un cable real sirve los dos botones y las pieles
//     v247 siguen en pie) · BD intocada (1877 cables · 9 hechos, un solo
//     escritor).
// Herencia v251.0 EL REFUGIO CON MEMORIA y todo lo anterior. Guards v167 intactos.
// v253.0 LA FORMA DE LA SEMANA — la expansión funcional módulo a módulo
//         vuelve al radar (/espia): el índice de tensión daba el NÚMERO
//         pero no su FORMA — el agente sabía cuánto sube un teatro sin
//         ver cómo llegó hasta ahí.
// (1) LA FORMA — formaDeLaSemana() en el módulo espía: 7 barras REALES
//     por teatro, cada una = un cubo RODANTE de 24 h (la más nueva es
//     «hoy», la misma ventana que mide el índice — coherencia, no otro
//     criterio); UNA sola consulta a la BD (7 días de cables etiquetados
//     con conflictTag), cubos en memoria; si la BD no trae cables, las
//     barras son honestamente bajas — jamás se dibuja una.
// (2) EL PULSO DEL PLANETA — tira de 4 números del instante, TODOS
//     derivados de las medidas ya calculadas (tensión + forma): cables
//     escuchados hoy · teatros encendidos/total · el teatro más caliente
//     con sus cables · la semana completa. Sin tensión que medir, la
//     tira ni se pinta (vacío honesto). Cero consultas extra.
// (3) EL SEXTA ESCUCHA HONESTA — la cola pedía «nuevas fuentes si otra
//     verifica 200»: 18+ candidatas oficiales medidas una a una esta
//     ronda (IAEA, ICRC, UNHCR, OSCE, EEAS, IOM, WFP, FAO, Europarl,
//     Interpol, OCHA, CTBTO, IMF, World Bank, gov.uk, prensa ONU es,
//     Consilium, State Dept) — todas 403/404/407 o HTML sin feed desde
//     este cuartel. La regla de la casa (v245) es inviolable: nada entra
//     sin verificar 200 con items reales — el radar se queda en 5
//     señales y lo DECLARA; la sexta esperará su verificación.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 · health v253.0 db up ·
//     pruebas 132/132 (+2 LA FORMA DE LA SEMANA: estática — la función
//     con su cubo rodante y su semana de 168 h, la tira del pulso
//     derivada sin consultas extra, el aria-hidden de la forma; viva —
//     el SSR del radar sirve EL PULSO DEL PLANETA y las barras con su
//     «cada barra = un día de 24 h», las 5 escuchas y el noscript
//     siguen en pie) · BD intocada (1877 cables · 9 hechos, un solo
//     escritor).
// Herencia v252.0 LA SALA QUE HABLA y todo lo anterior. Guards v167 intactos.
// v254.0 EL LATIDO QUE RESPETA — la expansión funcional módulo a módulo
//         llega a la sala en vivo (/en-vivo, v213+v242): el latido sondeaba
//         cada 30 s y los cables entraban solos — pero el timeline se
//         MOVÍA bajo el visitante que estaba leyendo lejos de la cabeza,
//         y nadie podía congelar el pulso con su mano.
// (1) LA PAUSA DEL LATIDO — botón honesto junto al reloj: «PAUSAR EL
//     LATIDO ❚❚» / «REANUDAR EL LATIDO ▸» con aria-pressed; en pausa el
//     sondeo duerme y reintenta en 5 s (la MISMA cadena retoma el pulso
//     al reanudar — cero cadenas dobles, cero timers huérfanos); la sala
//     dice la verdad mientras tanto: «latido en pausa · última señal
//     hace Ns». El latido lee el REF, jamás la cáscara vieja del closure.
// (2) LA PILA DE LOS QUE LLEGARON MIENTRAS LEÍAS — si los nuevos llegan
//     con el visitante lejos de la cabeza (scrollY > 480), la sala los
//     CUENTA y ofrece la subida con UN toque: «▲ N cables nuevos mientras
//     leías — subir» (fixed abajo, aria-live, salto suave, la cuenta se
//     limpia al volver cerca de la cabeza). Nada se navega solo (ley
//     v190); en el SSR la pila no existe (cero mismatch de hidratación).
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 · health v254.0 db up ·
//     pruebas 134/134 (+2 EL LATIDO QUE RESPETA: estática — el ref de la
//     pausa leído por el latido, los dos estados del botón, el guardián
//     de posición 480, la pila con su salto suave y su limpieza; viva —
//     el SSR sirve PAUSAR EL LATIDO y NO sirve la pila, las anclas
//     EL PULSO/CONECTA/sondeado en pie) · BD intocada (1877 cables ·
//     9 hechos, un solo escritor).
// Herencia v253.0 LA FORMA DE LA SEMANA y todo lo anterior. Guards v167 intactos.
// v255.0 TU MISIÓN — la expansión funcional módulo a módulo llega al
//         módulo más antiguo sin tocar: /mision (MISIÓN 100, del v37) —
//         la misión medía el esfuerzo de TODA la casa (contador global
//         /api/visits) pero el propio comandante nunca vio EL SUYO.
// (1) LA BARRA PERSONAL — «N / 100 enlaces tuyos» junto a las barras
//     globales: derivada 100% del aparato (readUsed, localStorage del
//     arsenal ya copiado) — cero servidores, cero invención; con su
//     role=progressbar + aria-label y su meta cumplida celebrada
//     (TU MISIÓN CUMPLIDA). Si aún no repartes nada, lo dice sin pena:
//     «Aún no repartes ninguno — el arsenal de abajo espera su primer
//     golpe». Cero mismatch: el SSR nace con el aparato vacío y la
//     primera pintura client también (setUsed diferido, ya v42).
// (2) LAS PLATAFORMAS CUBIERTAS — cuántas de las 10 plataformas tocó el
//     comandante, derivadas del PREFIJO del código (VGD-XXXnn →
//     c.slice(4,7) contra PLATFORMS): nunca un número inventado.
// (3) EL SIGUIENTE ENLACE SUGERIDO — el mando deriva el primer enlace
//     sin usar del arsenal («el mando sugiere el siguiente: VGD-XXX
//     (plataforma)») — el visitante nunca se queda sin el próximo golpe.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 · health v255.0 db up ·
//     pruebas 136/136 (+2 TU MISIÓN: estática — la meta personal, la
//     barra derivada del aparato, el prefijo de plataforma, el siguiente
//     enlace derivado, el vacío honesto y la meta celebrada; viva — el
//     SSR de /mision sirve la barra personal con su vacío honesto y las
//     anclas Misión 100/contador global/código de guerra en pie) ·
//     BD intocada (1877 cables · 9 hechos, un solo escritor).
// Herencia v254.0 EL LATIDO QUE RESPETA y todo lo anterior. Guards v167 intactos.
// v256.0 LA ÚLTIMA SEÑAL — la expansión funcional módulo a módulo llega al
//         espejo: /zona-cero (v230 EL ESPEJO) decía CUÁNTO hay en cada
//         teatro real (conteo acumulado de cables) pero jamás CUÁNDO sonó
//         la última vez — un teatro con 900 cables cuyo último cable tiene
//         tres semanas se veía igual de encendido que uno con cables de hoy.
// (1) LA MISMA QUERY, DOS MEDIDAS — la groupBy del espejo también trae
//     `_max: { publishedAt: true }`: conteo + última señal en UNA consulta
//     (cero roundtrips extra). Sin BD la página vive igual: sin chips, sin
//     fingir edades (ley de la casa).
// (2) LA EDAD EN CADA TARJETA — «● última señal hace N h / hace N días»,
//     derivada al vuelo de los milisegundos reales (force-dynamic: cada
//     visita recalcula); amber si la señal tiene menos de 48 h, zinc si
//     no; title con la hora exacta formateada por Intl (patrón refugio
//     v251) — cero fechas escritas a mano, la guardia v234 sigue pasando.
//     Teatro sin cables: la línea ni se pinta (vacío honesto).
// (3) LA SEÑAL MÁS FRESCA DEL ARCHIVO — sobre el total del espejo: «la
//     señal más fresca del archivo: [teatro] — última señal hace X»,
//     derivada de las mediciones ya hechas (cero consultas extra).
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 · health v256.0 db up ·
//     pruebas 138/138 (+2 LA ÚLTIMA SEÑAL: estática — el max en la misma
//     query, la edad derivada de milisegundos, la señal más fresca y las
//     guardias de fechas; viva — el SSR del espejo sirve «última señal
//     hace» y la señal más fresca con las anclas v230 en pie) ·
//     BD intocada (1877 cables · 9 hechos, un solo escritor).
// Herencia v255.0 TU MISIÓN y todo lo anterior. Guards v167 intactos.
// v257.0 LA EDAD DEL FRENTE — la expansión funcional módulo a módulo llega
//         al puente: /ver-guerra (v229 EL PUENTE) decía CUÁNTO hay en cada
//         frente documentado (conteo acumulado de cables) pero jamás CUÁNDO
//         sonó la última vez — la misma brecha que la ronda anterior midió
//         en el espejo, con la misma cura: el visitante lee la MISMA
//         gramática «● última señal hace N» en las dos salas de guerra.
// (1) LA MISMA QUERY, DOS MEDIDAS — la groupBy del puente también trae
//     `_max: { publishedAt: true }`: conteo + última señal en UNA consulta
//     (cero roundtrips extra). Sin BD la página vive igual: sin chips, sin
//     fingir edades (ley de la casa).
// (2) LA EDAD EN CADA FICHA — «● última señal hace N h / hace N días»,
//     derivada al vuelo de los milisegundos reales (force-dynamic); amber
//     si < 48 h, zinc si no; title con la hora exacta formateada por Intl
//     (patrón refugio v251 / espejo v256) — cero fechas a mano, la guardia
//     v234 sigue pasando. Frente sin señal: la línea ni se pinta.
// (3) LA SEÑAL MÁS FRESCA DE LOS FRENTES DOCUMENTADOS — sobre el grid:
//     «la señal más fresca de los frentes documentados: [frente] — última
//     señal hace X», con el nombre humano derivado del mapeo
//     FRENTE_A_TEATRO → FRENTES (nunca a mano) y cero consultas extra.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 · health v257.0 db up ·
//     pruebas 140/140 (+2 LA EDAD DEL FRENTE: estática — el max en la
//     misma query, la edad derivada de milisegundos, la señal más fresca
//     con nombre derivado y las guardias de fechas; viva — el SSR del
//     puente sirve «última señal hace» con las anclas v229 en pie) ·
//     BD intocada (1877 cables · 9 hechos, un solo escritor).
// Herencia v256.0 LA ÚLTIMA SEÑAL y todo lo anterior. Guards v167 intactos.
// v258.0 EL VÉRTIGO QUE HABLA — la expansión funcional módulo a módulo
//         llega al feed: /vertigo (v211 + v231 + v250) — la fórmula TikTok
//         de la casa — tenía corazón, teatro, país, compartir y reanudar,
//         pero era el único módulo vivo MUDO: la sala de lectura habla
//         desde v252 y el feed más vivo de la casa no decía palabra.
// (1) LA CUARTA SEÑAL — botón 🔊/🔇 en la columna del feed con
//     aria-label que alterna («Escuchar este cable» / «Parar la voz de
//     este cable») y etiqueta Oír/Parar: la MISMA boca v252
//     (speechSynthesis del aparato, gratis, sin API nueva) lee
//     título + resumen con la voz española que el aparato trate.
// (2) LA VOZ PERTENECE A LA PIEZA — una sola voz a la vez (estado vozId);
//     al deslizar a otra pieza la voz se queda atrás y CALLA (como el
//     video de TikTok); toggle honesto: el mismo toque que enciende,
//     apaga; cancel() al desmontar — el feed jamás deja una voz huérfana.
//     Ley v190: nada suena sin UN TOQUE del visitante.
// (3) LA DECLARACIÓN HONESTA — aparato sin voz: el feed lo DECLARA una
//     vez, arriba, sin ruido («Tu aparato no tiene voz para leer — la
//     casa no finge»), con su timer limpiado al desmontar.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 · health v258.0 db up ·
//     pruebas 142/142 (+2 EL VÉRTIGO QUE HABLA: estática — la cuarta
//     señal con su toggle y sus dos aria-labels, la voz que calla al
//     deslizar, el cancel en desmontaje y la declaración del aparato
//     mudo; viva — el SSR del feed sirve la cuarta señal con las anclas
//     v211/v231/v250 en pie) · BD intocada (1877 cables · 9 hechos, un
//     solo escritor).
// Herencia v257.0 LA EDAD DEL FRENTE y todo lo anterior. Guards v167 intactos.
// v259.0 EL TEATRO CON NOMBRE — la expansión funcional módulo a módulo llega
//         a la tercera sala de guerra: /en-vivo (v213 EL PULSO + v254 EL
//         LATIDO QUE RESPETA) medía el planeta en cinco cifras y filtraba
//         por tags crudos («gaza · 18»), y su propio stat frescoMin viajaba
//         en el payload sin ser leído NINGUNA vez — la sala no decía ni el
//         nombre de sus teatros ni cuán fresca era su señal más nueva.
// (1) LA SEÑAL MÁS FRESCA DE LA SALA — derivada del cable [0] de la
//     muestra (los más nuevos primero, pulso v213): «la señal más fresca
//     de la sala: [fuente] — última señal hace X», la MISMA gramática que
//     el espejo (v256) y el puente (v257) enseñaron, ahora viva en la
//     sala que nunca se recarga (el reloj de 1 s la mantiene al día).
//     Amber con la MISMA regla del rompiendo (≤ 15 min), zinc si no —
//     cero reglas nuevas; title con la hora exacta por Intl (patrón
//     refugio v251 / espejo v256 / puente v257); sin cables la línea ni
//     se pinta (vacío honesto). Cero consultas: viaja en la instantánea.
// (2) LOS TEATROS CON NOMBRE — los chips de filtro y los de la línea del
//     tiempo leen el catálogo canónico de la casa (src/lib/teatros.ts, la
//     misma fuente única que viste /conflicto/[tag] y el sitemap): «GAZA
//     E ISRAEL · 18» en vez de «gaza · 18». Fallback honesto: un tag
//     desconocido viaja tal cual — nunca se inventa un nombre.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 · health v259.0 db up ·
//     pruebas 144/144 (+2 EL TEATRO CON NOMBRE: estática — el catálogo
//     con su fallback, la línea compuesta COMPLETA en JS antes del JSX
//     (lección v256), el umbral 15 min y el vacío honesto; viva — el SSR
//     de la sala sirve la declaración y el nombre humano con las anclas
//     v213/v254 en pie) · BD intocada (1877 cables · 9 hechos, un solo
//     escritor).
// Herencia v258.0 EL VÉRTIGO QUE HABLA y todo lo anterior. Guards v167 intactos.
// v260.0 LA SALA DEL TEATRO — la expansión funcional módulo a módulo llega
//         a la puerta de lectura: /noticia/[id] (v202 + v208 + v211 + v252)
//         era la página más vestida de la casa, pero el visitante que
//         llegaba de Google no sabía CUÁNTO pesaba el teatro del cable ni
//         a qué sala pertenecían las relacionadas — la segunda capa que la
//         cola v259 dejó anotada.
// (1) EL CONTEO DEL TEATRO — UNA count con índice (v209) en Promise.all con
//     las relacionadas (cero roundtrips de más): «N cables en este teatro —
//     entrar a la sala →» bajo el resumen, la puerta /conflicto/[tag] con
//     el número real. Sin tag o sin BD la línea ni se pinta (vacío honesto).
// (2) LAS RELACIONADAS HABLAN HUMANO — cada card declara SU teatro con el
//     nombre del catálogo canónico (src/lib/teatros.ts, gramática v259) y
//     abre su puerta: fallback honesto, tag desconocido viaja tal cual.
// (3) LA HORA EXACTA EN LA FIRMA — el patrón Intl de la casa (refugio v251
//     / espejo v256 / puente v257 / sala v259): la firma lleva hora:minuto
//     junto a la fecha — cero fechas escritas a mano, guardia v234 en pie.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 · health v260.0 db up ·
//     pruebas 146/146 (+2 LA SALA DEL TEATRO: estática — la count con su
//     try/catch, la línea con su vacío honesto, el catálogo con su fallback
//     y la hora Intl; viva — el SSR de un cable real de /conflicto/ukraine
//     sirve el conteo y el nombre humano con las anclas v202/v208/v211/v252
//     en pie) · BD intocada (1877 cables · 9 hechos, un solo escritor).
// v261.0 LA SALA COMPLETA — la expansión funcional módulo a módulo llega a
//         la sala del teatro: /conflicto/[tag] (v206 + v215 + v218 + v222 +
//         v227 + v238) medía su archivo en la cabecera («N cables en la
//         agencia») pero solo encendía los primeros 40 — la sala de ucrania
//         guardaba 173 cables y 133 no tenían puerta: existían en la BD y
//         nadie podía llegar a ellos. La brecha que la cola v260 dejó
//         anotada al cerrar el círculo v259→v260 (el conteo ya viaja, el
//         resto del archivo no).
// (1) LA PAGINACIÓN DEL ARCHIVO — EN EL SERVIDOR, CERO JS: la count real
//     (v209) manda el número de páginas (Math.ceil sobre PAGE_SIZE 40),
//     findMany salta con skip y cada página es una URL limpia
//     (/conflicto/[tag]?page=N): Links de servidor con aria-current, «◀
//     anterior» y «siguiente ▶»; una sola sala (paginas ≤ 1) ni pinta el
//     nav — cero ruido. El nav declara su lugar: «página P de M — N cables
//     en el archivo del teatro».
// (2) FUERA DE RANGO ES CORTINA SIN SALA — página no entera, menor que 1 o
//     mayor que el archivo real: la cortina de la casa, jamás una sala
//     vacía indexable. (Medido en esta ronda: Next 16 sirve el notFound en
//     streaming con 200 en TODA la casa — un tag desconocido de v206 y una
//     /noticia inexistente se comportan igual; lo que la ley v206 protege
//     es que el vacío no viaja.)
// (3) LA ÚLTIMA SEÑAL DEL ARCHIVO — la cabecera medía items[0] de la
//     página; desde v261 mide findFirst sobre TODO el teatro (una fila con
//     índice, en el mismo Promise.all — cero roundtrips de más): la misma
//     verdad en la página 1 y en la 5.
// (4) CANONICAL POR PÁGINA — cada página del archivo se canónica a sí
//     misma (la 1, al limpio) y el title lleva « — página N»: Google puede
//     indexar el archivo entero, no solo la cabeza.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 · health v261.0 db up ·
//     pruebas 148/148 (+2 LA SALA COMPLETA: estática — el skip, la count
//     que manda las páginas, el 404 fuera de rango, la última señal del
//     archivo con findFirst y la canonical por página; viva — ukraine
//     declara «página 1 de 5» con su puerta a la 2, la 2 sirve cables
//     distintos con su anterior, la 99 es 404 limpio y las anclas v227/
//     v238/v218 en pie) · BD intocada (1877 cables · 9 hechos, un solo
//     escritor).
// v262.0 EL CANAL QUE PESA — la expansión funcional módulo a módulo llega a
//         la Primera página: /guerra-hoy (v35 + v42 + v44 + v52 + v63 +
//         v202 + v206 + v208 + v213 + v239 + v251) es la puerta de Google
//         para «guerra hoy», y sus chips de teatro eran los más pobres de
//         la casa: solo decían el nombre — un teatro con 173 cables y
//         señal de hoy se veía IGUAL que uno muerto desde hace semanas.
//         El espejo (v256), el puente (v257) y la sala completa (v261) ya
//         hablaban; el canal guardaba silencio.
// (1) LA MISMA GROUPBY, DOS MEDIDAS — el patrón v256/v257 en la Primera
//     página: `_count` + `_max.publishedAt` en la consulta que YA existía
//     (cero roundtrips de más); sin BD, la página vive igual: sin chips,
//     sin fingir edades (ley de la casa).
// (2) LOS CHIPS HABLAN — cada chip declara SU peso («Ucrania · 173») y SU
//     edad («● última señal hace N»), compuestos COMPLETOS en JS (lección
//     v256); amber < 48 h, zinc si no — la MISMA regla de frescura del
//     espejo y el puente, cero reglas nuevas; title con la hora exacta
//     por Intl (patrón refugio v251 / espejo v256 / puente v257 / sala
//     v259) — cero fechas escritas a mano, guardia v234 en pie.
// (3) LA SEÑAL MÁS FRESCA DEL CANAL — derivada de la cabeza de la muestra
//     (items[0], los 24 más nuevos primero): «la señal más fresca del
//     canal: [fuente] — última señal hace N», la gramática que la casa
//     empezó en el espejo y siguió por puente, sala y puerta — cero
//     consultas extra; sin cables la línea ni se pinta (vacío honesto).
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 · health v262.0 db up ·
//     pruebas 150/150 (+2 EL CANAL QUE PESA: estática — el _max en la
//     misma groupBy, el chip con peso y edad compuestos en JS, el umbral
//     48 h heredado, la hora Intl y la guardia v234; viva — el SSR de la
//     Primera página sirve «Ucrania · 173», «● última señal hace» y «la
//     señal más fresca del canal» con las anclas v206 (Teatros en vivo,
//     /conflicto/ukraine) y la cabeza GUERRA HOY en pie) · BD intocada
//     (1877 cables · 9 hechos, un solo escritor).
// Herencia v261.0 LA SALA COMPLETA y todo lo anterior. Guards v167 intactos.
// v263.0 EL ARCHIVO QUE CRECE — la expansión funcional módulo a módulo
//         vuelve a la sala del teatro y abre el archivo que nadie veía:
//         1396 cables SIN etiqueta (74 % del archivo) no tenían puerta a
//         ninguna sala, aunque sus propias palabras citaran el teatro
//         (censados en esta ronda: 214 citan claves reales de los 9).
// (1) EL CATÁLOGO LLEVA SUS CLAVES — TEATROS gana `claves` por teatro
//     (lugares y actores en español, la lengua del archivo): la misma
//     fuente única de /conflicto, el sitemap y los nombres humanos de
//     v259/v260 ahora también sabe reconocer lo suyo.
// (2) EL HALLAZGO ES EN LECTURA — la casa no clasifica a mano (un solo
//     escritor): pool acotado de los 1000 sin etiqueta más recientes (UNA
//     consulta, campos mínimos) y cruce con las claves en JS — acentos y
//     mayúsculas con toLowerCase, cero trucos SQL. Hasta 6 candidatos por
//     sala; cada uno declara QUÉ palabras abrieron su puerta («citan:
//     kiev · zelenski») — derivación transparente, cero invención.
// (3) SOLO LA CABEZA PAGA — los candidatos viajan únicamente en la página
//     1 (page === 1): las páginas hondas del archivo (v261) no pagan la
//     consulta. Vacío honesto: sala sin candidatos (pool sin match) ni
//     pinta la sección.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 · health v263.0 db up ·
//     pruebas 152/152 (+2 EL ARCHIVO QUE CRECE: estática — las 9 claves
//     canónicas, el pool acotado, el cruce toLowerCase, la página 1
//     exclusiva, la línea compuesta en JS y la guardia v234; viva —
//     ukraine sirve la sección con «SIN ETIQUETA» y «citan:», la página 2
//     no la repite y las anclas v261 (página 1 de 5, Los frentes) en pie) ·
//     BD intocada (1877 cables · 9 hechos, un solo escritor).
// Herencia v262.0 EL CANAL QUE PESA y todo lo anterior. Guards v167 intactos.
// v264.0 EL ÍNDICE DEL PLANETA — la expansión funcional módulo a módulo
//         llega al mapa: /mundo (v215, el globo 3D) sostenía la
//         instantánea viva (peso de 24 h, último titular y fuente por
//         teatro) pero su capa server nunca sirvió las puertas — sin
//         JavaScript el planeta era un hueco y para Google los teatros
//         eran un párrafo sin enlaces.
// (1) EL ÍNDICE DERIVA DE LA INSTANTÁNEA — los 9 teatros con su peso real
//     de 24 h, su último titular como puerta a /noticia y su sala
//     /conflicto a un toque, TODO de la instantánea que la página ya
//     sostenía (cero consultas de más; sin BD la sección ni se pinta).
// (2) EL SILENCIO SE DECLARA — teatro sin señal en 24 h dice «sin señal
//     en 24 h — la sala queda abierta»: la puerta no se apaga porque la
//     señal pause (medido en esta ronda: la BD lleva 96 h sin cable
//     nuevo — las 9 salas declaran su silencio y quedan abiertas).
// (3) LA GRAMÁTICA DE LA CASA — peso y edad compuestos COMPLETOS en JS
//     (lección v256), edad con hace() local, cero fechas escritas a mano
//     (guardia v234).
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 · health v264.0 db up ·
//     pruebas 154/154 (+2 EL ÍNDICE DEL PLANETA: estática — derivado de
//     la instantánea sin db.newsItem, las dos puertas, la línea compuesta
//     en JS, el vacío honesto y la guardia v234; viva — el índice viaja en
//     el SSR con las puertas /conflicto/ukraine y /conflicto/gaza, el
//     silencio de 24 h declarado y las anclas v215 en pie) · BD intocada
//     (1877 cables · 9 hechos, un solo escritor).
// Herencia v263.0 EL ARCHIVO QUE CRECE y todo lo anterior. Guards v167 intactos.
// v265.0 EL PÓRTICO DE LAS SALAS — la expansión funcional módulo a módulo
//         llega a la puerta que las salas nunca tuvieron: desde v206 cada
//         teatro vive en /conflicto/[tag], pero la RAÍZ /conflicto era un
//         404 — las 9 salas solo se alcanzaban por puertas laterales
//         (chips de la Primera página, cards del mural FRENTE TOTAL,
//         «Otros teatros» al pie de cada sala, sitemap).
// (1) LA PUERTA SE SIRVE EN SERVER — nuevo src/app/conflicto/page.tsx:
//     las cards salen del catálogo canónico (TEATROS — la misma fuente
//     única de las salas, el sitemap y los nombres humanos) y el peso se
//     mide con UNA groupBy (_count + _max.publishedAt, el patrón del
//     puente v257 y del mapa v262): el censo, no las filas. Sin BD el
//     pórtico sigue en pie: cards con nombre, resumen y palabras; sin
//     líneas de peso (vacío honesto).
// (2) EL PESO SE DECLARA — cada sala compone su línea COMPLETA en JS
//     (lección v256): «N cables en el archivo · última señal hace X»; el
//     pórtico entero suma sus conteos («El pórtico de las salas — 9
//     salas, 481 cables con puerta»); la señal más fresca se deriva de
//     las mediciones ya hechas (cero consultas extra). Cero números
//     escritos a mano, guardia v234 en pie.
// (3) LA PUERTA SE ANUNCIA — el sitemap gana /conflicto (la raíz ya no
//     es 404 para Google), JSON-LD CollectionPage + ItemList de las 9
//     salas y dos puertas por card: la sala y el planeta 3D
//     (/mundo?teatro=). Las claves de v263 viajan: el pórtico declara
//     «sus palabras:» de cada sala.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 · health v265.0 db up ·
//     pruebas 156/156 (+2 EL PÓRTICO DE LAS SALAS: estática — el
//     catálogo canónico, la groupBy única con dos medidas, las líneas
//     compuestas en JS, el vacío honesto, el sitemap y la guardia v234;
//     viva — la raíz /conflicto 200 con las 9 puertas, peso real,
//     «sus palabras:» y la señal fresca de Gaza) · BD intocada (1877
//     cables · 9 hechos, un solo escritor).
// Herencia v264.0 EL ÍNDICE DEL PLANETA y todo lo anterior. Guards v167 intactos.
// v266.0 EL TELETIPO DE LA CASA — la expansión funcional módulo a módulo
//         vuelve al mural FRENTE TOTAL (/ver-guerra, v53+v229+v257): su
//         teletipo (GDELT/Google Noticias vía /api/geo-tablero) vive en el
//         navegador (frente-total-sim, fetch client-side) — sin JavaScript
//         no viaja despacho alguno, mientras la casa tiene SU propia
//         agencia con 481 cables etiquetados de los 5 frentes documentados.
// (1) EL CABLE DE LA CASA VIAJA EN SSR — despachosDeLaCasa(): los 8 cables
//     más frescos de los frentes documentados (where conflictTag in
//     Object.values(FRENTE_A_TEATRO), orderBy publishedAt desc, take 8,
//     campos mínimos) sirven en una sección server-rendered — sin JS se
//     lee, con JS el mural sigue mandando el espectáculo.
// (2) LA GRAMÁTICA DE LA CASA — cada despacho declara su frente (chip con
//     el nombre humano del mapeo v229), su fuente y su edad (textoEdad, la
//     misma que el puente v257); title con la hora exacta por Intl; la
//     línea de la sección compuesta COMPLETA en JS (lección v256): «el
//     cable de la casa — N despachos reales de los frentes documentados».
//     Cero fechas a mano, guardia v234 en pie.
// (3) LA HONESTIDAD CRECE — sin BD la sección ni se pinta (vacío honesto);
//     la FAQ de la página pasa de «Tres cosas son 100% reales» a «Cuatro»
//     (sumando el cable de la agencia — la declaración crece, no se
//     recorta); las anclas v229 (chips, no inventa puertas) y v257 (edad
//     del frente) intactas.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 · health v266.0 db up ·
//     pruebas 158/158 (+2 EL TELETIPO DE LA CASA: estática — el archivo
//     acotado a los frentes documentados y frescos primero, el vacío
//     honesto, la línea compuesta en JS, las puertas /noticia, el chip del
//     frente y la guardia v234; viva — el SSR sirve «EL TELETIPO DE LA
//     AGENCIA» con despachos reales y las anclas v229/v257 en pie) · BD
//     intocada (1877 cables · 9 hechos, un solo escritor).
// Herencia v265.0 EL PÓRTICO DE LAS SALAS y todo lo anterior. Guards v167 intactos.
// v267.0 EL CABLEADO DEL APARATO — la expansión funcional módulo a módulo
//         vuelve a la vitrina (/objetivos, v216+v235): desde v235 dice
//         «los 100 se cazan aquí» pero nunca declaró QUÉ alimenta cada
//         bloque — el mapa bloque→señal vivía escondido dentro de las
//         funciones check/progress del catálogo (100 logros, 9 bloques).
// (1) LA FUENTE MANDA — el mapa se declara EN LA FUENTE, nunca inventado
//     en la página (directiva v266): CABLEADO_BLOQUES en game-data.ts —
//     9 bloques, 37 parejas bloque→señal, 35 señales distintas del
//     AchievementState, todas extraídas del catálogo real con cruce
//     bidireccional verificado (0 parejas sin evidencia, 0 campos
//     usados-no-declarados).
// (2) LA VITRINA LO SIRVE — sección EL CABLEADO DEL APARATO entre el
//     mapa de caza y los bloques: cada bloque declara «se alimenta de:»
//     con los contadores reales del aparato (nivel, racha, informes
//     leídos, cámaras operando…); la línea de la sección compuesta
//     COMPLETA en JS (lección v256): «El cableado del aparato — 35
//     señales del estado alimentan los 9 bloques de la vitrina»,
//     derivada con Set/flatMap del propio mapa — si la fuente cambia,
//     la línea cambia sola. Cero fechas a mano, guardia v234 en pie.
// (3) LA TRANSPARENCIA ES LA LEY — la vitrina no inventa el mapa: lo
//     sirve y explica dónde vive («El mapa vive en la fuente
//     (game-data.ts), no en esta vitrina»); la suite lo custodia: por
//     cada pareja declarada debe existir un logro real con esa category
//     que lea ese s.<campo>.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 · health v267.0 db up ·
//     pruebas 160/160 (+2 EL CABLEADO DEL APARATO: estática — la fuente
//     declara el mapa, el cruce bloque→señal contra el catálogo real,
//     las líneas compuestas en JS, la guardia v234; viva — el SSR sirve
//     «EL CABLEADO DEL APARATO» con «se alimenta de:» y las anclas
//     v235 en pie) · BD intocada (1877 cables · 9 hechos, un solo
//     escritor).
// Herencia v266.0 EL TELETIPO DE LA CASA y todo lo anterior. Guards v167 intactos.
// v268.0 EL RITMO DE LA CASA — la expansión funcional módulo a módulo
//         completa la trilogía de la vitrina (/objetivos: v235 el botín,
//         v267 el cableado, v268 el ritmo): la casa tiene 19 misiones
//         vivas (MISSION_TEMPLATES — 9 diarias, 5 semanales, 2 especiales
//         y 3 capítulos de campaña) que solo vivían en el panel
//         client-side del aparato; la vitrina pública jamás las sirvió.
// (1) LA JORNADA SE SIRVE EN SERVER — sección entre el cableado y los
//     bloques: censo por ritmo (DAILY/WEEKLY/SPECIAL/STORY) y botín por
//     ritmo derivados de la fuente con filter/reduce — cero cifras
//     escritas a mano (la prueba estática lo vigila, herencia v235).
// (2) LOS CAPÍTULOS ABREN SUS SALAS — los 3 capítulos de campaña
//     (STORY_KIEV→ukraine, STORY_GAZA→gaza, STORY_SUDAN→sudan) llevan
//     puertas reales a /conflicto/[tag] con el conflictTag ya declarado
//     en la fuente — la campaña conecta la vitrina con el archivo;
//     capítulo sin conflictTag no pinta puerta (vacío honesto).
// (3) LA GRAMÁTICA DE LA CASA — la línea de la sección compuesta
//     COMPLETA en JS (lección v256): «La jornada de la casa — 19
//     misiones vivas: 9 cada día, 5 cada semana, 2 especiales y 3
//     capítulos de campaña»; cada celda de botín compuesta en JS con la
//     cifra es-ES de la casa. Cero fechas a mano, guardia v234 en pie.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 · health v268.0 db up ·
//     pruebas 162/162 (+2 EL RITMO DE LA CASA: estática — la fuente
//     MISSION_TEMPLATES intacta, el censo y el botín derivados, las
//     puertas reales de los capítulos, el vacío honesto y la guardia
//     v234; viva — el SSR sirve «LA JORNADA» con «19 misiones vivas»,
//     el botín del ritmo derivado, las 3 salas de campaña y las anclas
//     v235/v267 en pie) · BD intocada (1877 cables · 9 hechos, un solo
//     escritor).
// Herencia v267.0 EL CABLEADO DEL APARATO y todo lo anterior. Guards v167 intactos.
// ── v269.0 EL MAPA DEL ARCHIVO (turno 475802, AGENT 1) ──────────────────
// El mapa que Google rastrea servía solo la cabeza del archivo: la cota de
// v207 (500 puertas /noticia) se quedó corta ante el archivo medido (1877
// cables — 1377 puertas indexables quedaban FUERA del sitemap), y las
// páginas profundas del archivo que la sala v261 hizo canónicas
// (/conflicto/[tag]?page=N) no viajaban al mapa. La casa no se deja
// indexar a medias.
// (1) EL ARCHIVO ENTERO EN EL MAPA: PUERTAS_NOTICIA = 2000 (la cota se
//     declara, no se adivina; Google acepta 50.000 URLs por sitemap — el
//     archivo cabe de sobra y crece tranquilo). Si la BD falla, las
//     puertas estáticas quedan intactas (ley de la casa, herencia v207).
// (2) LAS PÁGINAS PROFUNDAS VIAJAN: la misma groupBy gana
//     _max.publishedAt (patrón v256/v262 — cero consultas de más) y cada
//     teatro vivo deriva sus páginas con Math.ceil(count / PAGE_SIZE) —
//     la página 1 ya viaja limpia (su canónica es al limpio, v261); de la
//     2 en adelante se anuncia cada una con changeFrequency daily.
// (3) EL lastModified HONESTO: el mapa declara la ÚLTIMA SEÑAL REAL de
//     cada teatro (guardia v234 — cero fechas fingidas: un teatro mudo
//     105 h no le miente a Google con un «ahora»).
// (4) EL TAMAÑO VIVE EN LA FUENTE: PAGE_SIZE_ARCHIVO = 40 se declara en el
//     catálogo (teatros.ts, la fuente única de las puertas desde v206) y
//     sala y sitemap consumen el mismo número — una sola verdad para todo
//     el archivo; la guardia v261 de la suite se actualiza al literal de
//     la fuente y custodia el acoplamiento.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 · health v269.0 db up ·
//     pruebas 162/162 (+2 EL MAPA DEL ARCHIVO: estática — la fuente
//     declara el tamaño, la cota del archivo entero, las páginas derivadas
//     de la count real y el lastModified honesto; viva — el sitemap sirve
//     ≥1800 puertas /noticia, /conflicto/ukraine?page=2 viaja y la página
//     1 no se anuncia dos veces) · BD intocada (1877 cables · 9 hechos,
//     un solo escritor).
// Herencia v268.0 EL RITMO DE LA CASA y todo lo anterior. Guards v167 intactos.
// v270.0 EL SEGUNDO CATÁLOGO (renumerada en vuelo: el turno paralelo 500735 tomó
//         v269.0 EL MAPA DEL ARCHIVO — protocolo canon-repo, dos escritores, un
//         canon; ninguna expansión se tira) — la expansión funcional módulo a módulo
//         vuelve a la vitrina (/objetivos): la casa tiene DOS catálogos
//         de misiones y la vitrina solo servía uno — MISSION_TEMPLATES
//         (la jornada, v268) viaja en SSR pero DAILY_CHALLENGES (los 9
//         retos DC-1→DC-9 del aparato) seguía client-side, invisible
//         para el SSR y para Google.
// (1) EL SEGUNDO CATÁLOGO SE SIRVE EN SERVER — sección entre la jornada
//     y los bloques: los 9 retos con su id, título, descripción y botín
//     reales de la fuente; censo y botín derivados con reduce — cero
//     cifras escritas a mano (herencia v235/v268): 330 XP y 280 mon
//     hoy, y si el catálogo cambia, la línea cambia sola.
// (2) LA META SE DECLARA — cada reto compone su celda en JS con el
//     target real (1→5): «botín: +50 XP · +45 mon · meta: 1» (DC-7, la
//     síntesis avanzada que solo pide una fusión, lo dice a la vista).
// (3) LA PROCEDENCIA ES LA LEY — la vitrina declara dónde vive el
//     catálogo («el catálogo vive en la fuente (game-data.ts), no en
//     esta vitrina», directiva v266) y la línea se compone COMPLETA en
//     JS (lección v256). Cero fechas a mano, guardia v234 en pie.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 · health v270.0 db up ·
//     pruebas 166/166 en el árbol fusionado (+2 EL SEGUNDO CATÁLOGO: estática — la fuente
//     DAILY_CHALLENGES intacta con sus 9 retos, el botín y la meta
//     mayor derivados, la línea compuesta en JS y la guardia v234;
//     viva — el SSR sirve «EL SEGUNDO CATÁLOGO» con «9 retos diarios
//     con 330 XP y 280 mon», las cabezas reales de la fuente y las
//     anclas v235/v267/v268 en pie) · BD intocada (1877 cables · 9
//     hechos, un solo escritor).
// Herencia v269.0 EL MAPA DEL ARCHIVO y todo lo anterior. Guards v167 intactos.
// v271.0 EL CANAL CLASIFICADO — la expansión funcional módulo a módulo
//         llega al canal RSS (/feed.xml, v35+v202): la candidata que la
//         v269 dejó medida — el <item> no declaraba <category> y los
//         agregadores no podían filtrar por teatro. Medido antes de
//         elegir: de los 30 cables que el canal sirve, 13 llevan
//         conflictTag (11 gaza · 2 taiwan) y el archivo tiene 481
//         etiquetados en 9 teatros.
// (1) LA CATEGORÍA VIAJA — cada ítem etiquetado declara SU teatro en dos
//     <category>: el conflictTag crudo (ukraine, gaza, taiwan…) y el
//     nombre humano del catálogo canónico TEATROS (teatros.ts, la fuente
//     única de las puertas desde v206 — directiva v266: el mapa vive en
//     la fuente, el canal no inventa).
// (2) VACÍO HONESTO — el cable sin teatro no declara categoría alguna:
//     la casa no le pone etiquetas de ficción a lo que no las tiene; un
//     tag futuro fuera del catálogo cae al crudo (`?? it.conflictTag`),
//     sin fingir un nombre que no existe.
// (3) LA GUARDIA — la suite custodia que cada categoría servida sea del
//     catálogo canónico (los 9 tags crudos y los 9 nombres humanos) y
//     que el par crudo+humano de gaza y taiwan viaja en el XML real.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 · health v271.0 db up ·
//     pruebas 168/168 (+2 EL CANAL CLASIFICADO: estática — la categoría
//     viene del conflictTag con el nombre humano de TEATROS, el vacío
//     honesto y la guardia v234; viva — el RSS sirve 26 categorías
//     canónicas de 13 cables etiquetados con content-type rss+xml y el
//     par crudo+humano de gaza y taiwan) · BD intocada (1877 cables · 9
//     hechos, un solo escritor).
// Herencia v270.0 EL SEGUNDO CATÁLOGO y todo lo anterior. Guards v167 intactos.
// ────────────────────────────────────────────────────────────────
// v272.0 EL QUIZ DEL PESO — ¿QUÉ CABLE PESA MÁS? (AGENT 1, cron 475802,
// TURNO AUTOMÁTICO). El legado del linaje perdido v174–v176 llega al
// canon por la puerta del módulo a módulo: la candidata de la cola del
// incidente (quiz de impacto) medida ANTES de elegir — la CENTRAL DE
// ALARMAS (v232) ya avisa lo urgente y el MOTOR DE IMPACTO (v172) ya
// ranquea, pero NADA conectaba el motor con el juicio del visitante.
// (1) LAS PAREJAS NACEN DE LA MISMA INSTANTÁNEA — /en-vivo (v213)
//     deriva las parejas del pulso ya servido (cero consultas de más,
//     herencia v256/v262): cables reales ordenados por impacto, en
//     parejas con pesos DISTINTOS — la casa jamás pregunta lo que no
//     tiene respuesta; cota de 8 parejas por instantánea.
// (2) EL VEREDICTO ES EL MOTOR — la apuesta se resuelve con el impacto
//     real 0-100 y las etiquetas canónicas de TIERS (directiva v266:
//     el quiz no inventa, consume la fuente); revelación post-apuesta
//     con el peso y el escalón de ambos cables.
// (3) LA RACHA VIVE EN EL NAVEGADOR — cerradura v132 (nada se escribe
//     antes de hidratar, cero parpadeo #418) y JAMÁS en la BD (leyes
//     v245/v246: un solo escritor); récord, racha y aciertos del
//     navegador, sagrados.
// (4) VACÍO HONESTO — si la instantánea no rinde dos parejas, la
//     sección no pinta (herencia v268); la sala y el CONECTA v242
//     quedan intactos bajo el quiz.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 · health v272.0 db up ·
//     pruebas 170/170 (+2 EL QUIZ DEL PESO: estática — las parejas
//     nacen de la instantánea con pesos distintos y cota, el veredicto
//     es el motor canónico, la cerradura v132 custodia el botín y el
//     quiz no toca red ni BD; viva — la sala sirve la cabeza compuesta
//     con la cifra real, los botones de apuesta y las anclas v213/v242
//     en pie) · BD intocada (1877 cables · 9 hechos, un solo escritor).
// Herencia v271.0 EL CANAL CLASIFICADO y todo lo anterior. Guards v167 intactos.
// v273.0 EL TERCER CATÁLOGO — la expansión funcional módulo a módulo
//         completa la trilogía de catálogos de la vitrina (/objetivos):
//         la casa tiene TRES catálogos de competición y la vitrina
//         servía dos — TOURNAMENTS, los torneos de la casa (Copa
//         Estratega, Operación Tritón, Maratón Operacional) con sus
//         tablas de líderes y su botín en la cima, seguía client-side
//         en el panel del aparato, invisible para el SSR y para
//         Google. Medido antes de elegir: 3 torneos, 21 posiciones de
//         leaderboard, botín de la cima derivado 1900 mon · 19 gemas,
//         premio mayor 800 mon (la cola decía «27 entradas»; el repo
//         real manda — canon = repo).
// (1) EL TERCER CATÁLOGO SE SIRVE EN SERVER — sección entre el segundo
//     catálogo (v270) y los bloques: los 3 torneos con id, título,
//     categoría, métrica real y reloj de la fuente; censo, botín y
//     posiciones derivados con reduce — cero cifras escritas a mano
//     (herencia v235/v268/v270): «El tercer catálogo de la casa — 3
//     torneos en marcha con 1900 mon y 19 gemas de botín en la cima,
//     21 posiciones en las tablas»; si el catálogo cambia, la línea
//     cambia sola.
// (2) EL LÍDER SE COMPONE DESDE LA TABLA REAL — cada tarjeta compone
//     en JS «líder: AGUILEGEND-7 con 47 puntos» desde leaderboard[0]
//     de la fuente (y «tabla sin líder todavía» como vacío honesto si
//     un torneo futuro nace sin tabla); el botín de cada torneo se
//     compone en JS: «botín: +500 mon · +5 gemas».
// (3) LA PROCEDENCIA ES LA LEY — la vitrina declara dónde vive el
//     catálogo («este catálogo también vive en la fuente (game-data.ts),
//     no en esta vitrina», directiva v266) y la línea se compone
//     COMPLETA en JS (lección v256). Cero fechas a mano, guardia v234
//     en pie (el reloj «3d 14h» viaja como dato de la fuente, no como
//     fecha escrita).
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 · health v273.0 db up ·
//     pruebas 172/172 en el árbol fusionado (+2 EL TERCER CATÁLOGO: estática — la fuente
//     TOURNAMENTS intacta con sus 3 torneos, botín y posiciones
//     derivados con reduce, la línea compuesta en JS y la guardia
//     v234; viva — el SSR sirve «EL TERCER CATÁLOGO» con «3 torneos
//     en marcha con 1900 mon y 19 gemas», las 3 firmas reales, el
//     botín compuesto y el líder real, con las anclas
//     v235/v267/v268/v270 en pie) · BD intocada (1877 cables · 9
//     hechos, un solo escritor).
// Herencia v272.0 EL QUIZ DEL PESO (del turno paralelo, renumeración en vuelo) y todo lo anterior. Guards v167 intactos.
// v274.0 EL ARCHIVO DE LA HISTORIA — la expansión funcional módulo a módulo
//         abre una puerta nueva: la casa tiene HISTORICAL_WARS (10 guerras
//         reales de la Antigüedad a la Contemporánea con años, facciones,
//         desenlace, coste y significado) que solo vivía en el panel
//         client-side del aparato, invisible para el SSR y para Google.
//         Medido antes de elegir: 10 guerras — ANTIGUA ×3 (Punicas -264→
//         -146, Galia -58→-50, Germanicas -12→16), EDAD_MEDIA ×2
//         (Cruzadas 1096→1291, Cien Años 1337→1453), MODERNA ×1
//         (Napoleónicas 1803→1815), CONTEMPORANEA ×4 (WWI, WWII, Vietnam,
//         Fría 1947→1991); arco real derivado 264 a. C. → 1991; la más
//         larga, las Cruzadas, 195 años.
// (1) PUERTA NUEVA /historia — sala server pura (sin cliente, sin BD):
//     cada guerra con SUS datos de la fuente (los nombres viajan tal como
//     la fuente los declara — nada de acentos inventados), agrupada por
//     las 4 eras del canon de la casa; censo por era y arco de tiempo
//     derivados con filter/reduce — cero cifras escritas a mano
//     (herencia v235/v268/v270/v273): «El archivo de la historia — 10
//     guerras de Antigüedad a Contemporánea: de 264 a. C. a 1991, la
//     memoria con la que la casa lee las de hoy».
// (2) LOS AÑOS SE COMPONEN HONESTOS — el negativo es antes de Cristo y
//     se compone desde el número real (`-264` → «264 a. C.»); la
//     duración de cada guerra se deriva de sus años (g.yearEnd -
//     g.yearStart); las puertas internas son honestas (las guerras de
//     HOY viven en /guerra-hoy y /mundo, no aquí) y noscript declara lo
//     que funciona sin JavaScript. JSON-LD ItemList con los 10 ítems y
//     numberOfItems de la fuente (jsonLdSeguro v204).
// (3) LAS PUERTAS DE LA CASA — el sitemap anuncia /historia (monthly,
//     0.6) y la paleta Ctrl+K la lleva (pg:historia, icono Landmark);
//     la procedencia declarada («El archivo vive en la fuente»,
//     directiva v266); cero fechas a mano, guardia v234 en pie.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 (○ /historia en la tabla) ·
//     health v274.0 db up · pruebas 174/174 (+2 EL ARCHIVO DE LA
//     HISTORIA: estática — la fuente de 10 guerras intacta, censo y
//     arco derivados, los años negativos compuestos desde el número,
//     el mapa y la paleta llevando la puerta; viva — la sala sirve la
//     línea derivada, los censos de era (3/2/1/4), las Punicas con
//     «264 a. C. – 146 a. C.», el coste real de la WW2 y los 195 años
//     de las Cruzadas, con el sitemap vivo anunciando /historia) · BD
//     intocada (1877 cables · 9 hechos, un solo escritor).
// Herencia v273.0 EL TERCER CATÁLOGO y todo lo anterior. Guards v167 intactos.
// v275.0 LA TAQUILLA DEL ARCHIVO — la sala /historia (v274) crece por
//         dentro: la cabeza de la cola de la v274 era WAR_BETS (medida al
//         abrir la ronda: 8 conflictos con cuota — WB1 Punicas 1.4/3.2,
//         WB2 Termopilas 5/1.15, WB3 Cruzadas 2/1.8, WB4 Cien Años
//         1.5/2.5, WB5 Waterloo 1.6/2.3, WB6 WWII Europa 1.3/3.5, WB7
//         Vietnam 1.7/2.1, WB8 Guerra Fria 1.2/5; ANTIGUA ×2 · MEDIEVAL
//         ×2 · MODERNA ×1 · ACTUAL ×3) que solo vivía en el panel de
//         apuestas client-side del aparato, invisible para el SSR y para
//         Google.
// (1) LA TAQUILLA SE SIRVE EN SERVER — nueva sección en /historia tras el
//     archivo (patrón v270/v273): cada conflicto con SUS cuotas y SU
//     probabilidad tal como la fuente los declara (nada de acentos ni
//     cifras inventadas); censo por categoría derivado con Set + filter y
//     línea compuesta COMPLETA en JS (lección v256): «La taquilla del
//     archivo — 8 conflictos con cuota abierta en 4 categorías: el juicio
//     retrospectivo de la casa sobre guerras que ya tienen veredicto en
//     los libros» — si la fuente cambia, la línea cambia sola.
// (2) EL VACÍO HONESTO POR DELANTE — la casa NO acepta apuestas: estas
//     cuotas son su juicio retrospectivo y el veredicto real ya lo
//     escribieron los libros de historia; el salón interactivo vive en el
//     aparato (puerta honesta declarada). Procedencia declarada («La
//     taquilla vive en la fuente», directiva v266).
// (3) EL NOSCRIPT SE COMPONE DERIVADO — los censos compuestos
//     (${GUERRAS.length} guerras · ${APUESTAS.length} cuotas) viajan al
//     noscript, cero cifras nuevas a mano; guardia v234 en pie.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 (○ /historia en la tabla) ·
//     health v275.0 db up · pruebas 176/176 (+2 LA TAQUILLA DEL ARCHIVO:
//     estática — la fuente de 8 cuotas intacta uno a uno (WB1–WB8), censo
//     y línea derivados, la probabilidad compuesta desde la fuente, el
//     vacío honesto y la procedencia; viva — la sala sirve la línea
//     derivada, el censo por categoría (2/2/1/3), las Punicas con «cuotas:
//     1.4 / 3.2» y «la casa da 65% a Roma», las anclas v274 en pie) · BD
//     intocada (1877 cables · 9 hechos, un solo escritor).
// Herencia v274.0 EL ARCHIVO DE LA HISTORIA y todo lo anterior. Guards v167 intactos.
// v276.0 LA ESCUADRA DE LA CASA — la vitrina (/objetivos) viste su último
//         catálogo client-side: la ALIANZA del aparato — FRIENDS, los 6
//         operadores (F1 WOLF_Tactico CAPITAN 14, F2 FALCON_X MAYOR 18, F3
//         GHOST_Cmd TENIENTE 9, F4 VIPER_K SARGENTO 8, F5 RAVEN_Alpha
//         CAPITAN 11, F6 PHOENIX_R CABO 6) con sus contadores reales
//         (quiz, racha, misiones) y el escalafón RANKS de 9 rangos — solo
//         vivía en el panel de amigos client-side, invisible para el SSR
//         y para Google. La cola del turno juraba «12 aliados»: medido al
//         abrir, la fuente declara 6 (el 12 era la longitud del bloque) —
//         canon = repo, la medición se hace ANTES de elegir.
// (1) LA ESCUADRA SE SIRVE EN SERVER — nueva sección en /objetivos tras el
//     tercer catálogo (patrón v270/v273/v275): cada operador con SU rango,
//     SU nivel y SUS contadores tal como la fuente los declara (nada de
//     acentos ni cifras inventadas); censo, presencia y cima derivados con
//     filter/Set/reduce (herencia v235/v268/v270/v273) y línea compuesta
//     COMPLETA en JS (lección v256): «La escuadra de la casa — 6
//     operadores aliados: 3 en línea, 5 rangos del escalafón de 9 y
//     FALCON_X (nivel 18) en la cima» — si la fuente cambia, la línea
//     cambia sola.
// (2) EL ESTADO SE COMPONE HONESTO — «EN LÍNEA» es el booleano real de la
//     fuente y «visto hace 2h» viaja tal como la fuente lo declara (el
//     dato lastActive, no una fecha escrita a mano — guardia v234); el
//     salón interactivo (buscar, comparar, retar) vive en el aparato
//     (puerta honesta declarada); procedencia («La escuadra vive en la
//     fuente», directiva v266).
// (3) LA GUARDIA — la suite custodia la fuente de 6 aliados intacta uno a
//     uno (F1–F6), el escalafón de 9 rangos, las derivaciones (filter /
//     Set / reduce), la línea compuesta en JS, la procedencia y la cima
//     real de la tabla; cero fechas a mano.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 (ƒ /objetivos en pie) ·
//     health v276.0 db up · pruebas 178/178 (+2 LA ESCUADRA DE LA CASA:
//     estática — la fuente de 6 aliados intacta uno a uno (F1–F6), el
//     escalafón de 9 rangos, censo/presencia/cima derivados, la línea
//     compuesta en JS, la procedencia y la guardia v234; viva — el SSR
//     sirve la línea derivada, las 6 firmas reales, «nivel 18 · EN LÍNEA»
//     y «nivel 8 · visto hace 1d», el quiz compuesto de FALCON_X y las
//     anclas v235/v267/v268/v270/v273 en pie) · BD intocada (1877 cables ·
//     9 hechos, un solo escritor).
// Herencia v275.0 LA TAQUILLA DEL ARCHIVO y todo lo anterior. Guards v167 intactos.
// v277.0 EL JUICIO DE LOS LIBROS — la taquilla de /historia (v275) crece
//         por dentro: sus 8 cuotas se cruzan con el desenlace real del
//         archivo (v274). El cruce es honesto por construcción: una cuota
//         solo encuentra su veredicto si su warName coincide EXACTAMENTE
//         con el name de una guerra del archivo — la casa no inventa el
//         cruce que la fuente no declara. Medido al abrir con simulador
//         contra la fuente real: 4 de 8 cuotas encuentran veredicto
//         (WB1 Punicas, WB3 Cruzadas, WB4 Cien Años, WB8 Guerra Fria) y
//         4 no (WB2 Termopilas, WB5 Waterloo, WB6 WWII Europa, WB7
//         Vietnam — el archivo declara otros nombres; el vacío se
//         declara tal cual, derivado con filter, nunca a mano).
// (1) EL CRUCE SE SIRVE EN SERVER — dentro de la taquilla (la segunda
//     capa de la cola v275/v276): línea compuesta COMPLETA en JS
//     (lección v256): «El juicio de los libros — 4 de 8 cuotas encuentran
//     su desenlace en el archivo: la casa dio su porcentaje y los libros
//     escribieron quién ganó»; cada carta con veredicto compone en JS
//     «los libros dicen: <outcome verbatim de la fuente>» bajo sus cuotas
//     (la casa dijo X%, los libros escribieron Y).
// (2) EL VACÍO HONESTO DEL CRUCE — las cuotas sin guerra en el archivo se
//     declaran derivadas con filter + join («Sin veredicto en el archivo:
//     Batalla de Termopilas, Waterloo, WWII Europa, Vietnam — la casa no
//     inventa el cruce que la fuente no declara»); si la fuente nombra la
//     guerra mañana, el juicio aparece solo; si la renombra, el vacío se
//     declara solo. El ternario cubre ambos mundos.
// (3) EL NOSCRIPT SE COMPONE DERIVADO — «8 cuotas de la taquilla, 4 con
//     veredicto de los libros» viaja compuesto desde la fuente; cero
//     cifras nuevas a mano, guardia v234 en pie.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 (○ /historia en la tabla) ·
//     health v277.0 db up · pruebas 180/180 (+2 EL JUICIO DE LOS LIBROS:
//     estática — el cruce por nombre exacto declarado en la sala, el Map
//     y los filters derivados, la línea compuesta en JS, el vacío del
//     cruce con join derivado, la guardia v234; viva — la línea derivada,
//     los 4 desenlaces verbatim (Roma 146 a.C., Acre 1291, Victoria
//     francesa, URSS 1991), el vacío con los 4 nombres reales y las
//     anclas v274/v275 en pie) · BD intocada (1877 cables · 9 hechos, un
//     solo escritor).
// Herencia v276.0 LA ESCUADRA DE LA CASA y todo lo anterior. Guards v167 intactos.
// v278.0 LA MEMORIA EN EL PLANETA — la cola de la v277 pedía «evaluación
//         aparte» y la ronda la paga: el archivo de la historia (v274,
//         10 guerras reales con lat/lng EN la fuente — Punicas 37.0,14.0
//         · Galia 47.0,2.0 · Cruzadas 31.8,35.2 · Cien Años 47.0,2.5 ·
//         Napoleónicas 50.8,4.3 · WWI 49.5,2.8 · WWII 50.0,10.0 ·
//         Vietnam 16.0,107.0 · Fría 50.0,30.0 · Germanicas 51.0,10.0)
//         enciende el globo de /mundo.
// (1) LA PUERTA ?guerra= NACE DEL PATRÓN PROPIO — /mundo ya validaba
//     ?teatro= (v264): el mismo camino ahora valida ?guerra= contra la
//     fuente real (HISTORICAL_WARS.find por id exacto, longitud ≤ 40) —
//     la casa no inventa la guerra que la URL pide; la pedida que no
//     existe se declara honesta («La puerta ?guerra=X no encontró
//     ninguna guerra del archivo»), y si la fuente crece mañana la
//     puerta la recibe sola.
// (2) LA CAPA DE MEMORIA EN EL GLOBO — las 10 guerras viajan como marcas
//     rosas (COLOR_MEMORIA) con SU periodo compuesto desde los años
//     reales («264 a. C. – 146 a. C.» — el negativo es antes de Cristo,
//     guardia v234) y SU desenlace verbatim; sin anillo: el pulso es de
//     las guerras de hoy, la memoria no late — permanece. La pestaña
//     MEMORIA del panel NO depende de la señal viva (funciona con la BD
//     fría); tocar una marca o un botón vuela el planeta hasta sus
//     coordenadas (flyTo altitud 1.1) y el auto-rotado se detiene
//     mientras una memoria está abierta. La fuente completa jamás cruza
//     al cliente: solo el mapa slim que la página server compone.
// (3) LAS PUERTAS DE VUELTA — /historia abre /mundo?guerra=<id> desde
//     cada carta («Encenderla en el globo ▸», enlace server-rendered
//     que funciona sin JavaScript); /mundo declara la sección server LA
//     MEMORIA EN EL PLANETA con la línea derivada (lección v256), la
//     ficha de la guerra pedida (coordenadas compuestas 37.0°, 14.0°) y
//     la puerta de vuelta a /historia#<id>; noscript honesto en ambas
//     salas. Directiva v266: el archivo vive en la fuente, no en la
//     sala. Cero cifras nuevas a mano, cero fechas a mano.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 (ƒ /mundo y ○ /historia en
//     la tabla) · health v278.0 db up · pruebas 182/182 (+2 LA MEMORIA
//     EN EL PLANETA: estática — la fuente de 10 guerras con lat/lng
//     intacta, la puerta validada contra la fuente real, el mapa slim
//     derivado, el periodo compuesto desde los años reales, la capa y
//     la pestaña en el globo, las puertas de vuelta en /historia y la
//     guardia v234 en ambas salas; viva — /mundo?guerra=HW-PUNIC 200 con
//     la guerra, su periodo compuesto y sus coordenadas reales, la
//     puerta fallida declarada honesta, /historia abriendo las 10
//     puertas y las anclas v264/v274/v275/v277 en pie) · BD intocada
//     (1877 cables · 9 hechos, un solo escritor).
// Herencia v277.0 EL JUICIO DE LOS LIBROS y todo lo anterior. Guards v167 intactos.
// v279.0 EL QUIZ DEL FRENTE — la segunda capa de la cola v272 aterriza:
//         el quiz del peso (v272) con un modo nuevo — parejas POR TEATRO:
//         los dos cables más pesados de UNA sala (conflictTag), derivados
//         en el servidor de la MISMA instantánea del pulso (cero consultas
//         de más, herencia v256/v262). Medido contra la BD al abrir: 25 de
//         los 60 cables reales traen teatro — 4 salas, 3 con par (gaza 18,
//         taiwan 3, hormuz 3) y 1 huérfana (ukraine, un solo cable — sin
//         par posible: el vacío se declara derivado, la casa no lo inventa).
// (1) LA DERIVACIÓN ES DEL SERVIDOR — /en-vivo agrupa la instantánea por
//     conflictTag (Map), ordena cada sala por impacto y solo casa los dos
//     primeros si sus pesos son DISTINTOS (la casa jamás pregunta lo que
//     no tiene respuesta); orden determinista (total desc, nombre asc) y
//     censo de salas huérfanas derivado (salasSinPar).
// (2) EL COMPONENTE CRECE POR DENTRO — toggle SALA GENERAL ▸ / POR TEATRO
//     ▸ (solo con al menos una sala con par: sin teatro real no hay teatro
//     falso), la línea del frente compuesta COMPLETA en JS (lección v256):
//     «EL QUIZ POR TEATRO — 3 salas del frente con par en la instantánea:
//     GAZA · HORMUZ · TAIWAN · 1 sala sin par posible» — si la BD cambia,
//     la línea cambia sola; ficha de cada pareja «FRENTE · GAZA — 18
//     cables de esta sala en la instantánea» (total derivado del servidor);
//     el cambio de modo resetea la ronda (eventos del usuario — cerradura
//     v132 intacta) y el botín sigue en el mini-store v216, JAMÁS en la BD
//     (un solo escritor, leyes v245/v246).
// (3) NADA SE ROMPE — la sala general conserva sus 8 parejas y todas sus
//     anclas; el peso lo sigue midiendo el motor de impacto (v172), el
//     veredicto sigue siendo el motor y no la casa; cero fechas a mano,
//     guardia v234 en pie.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 (ƒ /en-vivo en pie) ·
//     health v279.0 db up · pruebas 184/184 (+2 EL QUIZ DEL FRENTE:
//     estática — la derivación por teatro en el servidor (Map por
//     conflictTag, pesos distintos, orden determinista, salasSinPar),
//     la línea del frente compuesta en JS, el toggle con sus dos modos,
//     la ficha FRENTE y la guardia v234; viva — el SSR de /en-vivo sirve
//     la línea derivada con las salas reales (GAZA · HORMUZ · TAIWAN),
//     el toggle POR TEATRO ▸ y las anclas v272/v213 en pie) · BD intocada
//     (1877 cables · 9 hechos, un solo escritor).
// Herencia v278.0 LA MEMORIA EN EL PLANETA y toda la crónica. Guards v167 intactos.
// v280.0 EL CONTRARRELOJ DEL PESO — la otra mitad de la cola v272
//         aterriza: el quiz del peso gana el modo contrarreloj — 60 s
//         contra el archivo (el interrogatorio contrarreloj del linaje,
//         v61) sobre el POOL ACTIVO (sala general o frente), y la cota
//         de parejas crece 8 → 12 (más combustible sin consultas
//         nuevas: la instantánea ya servía los 60 cables; medido con el
//         motor real al abrir: aguanta exactamente 12 parejas con pesos
//         DISTINTOS — 60vs58 · 58vs57 · 57vs56 · 53vs52 · 51vs49 ·
//         47vs46 · 43vs42 · 41vs40 · 39vs38 · 38vs35 · 34vs33 · 32vs30).
// (1) EL RELOJ VIVE FUERA DE REACT — ley v176 (nada de setState en
//     effects): intervalo a nivel de módulo (tick 250 ms), React solo
//     escucha con useSyncExternalStore y caché por tick (getSnapshot
//     estable entre avisos); el servidor pinta la fase «quieto» — el
//     botón CONTRARRELOJ ▸ y la invitación compuesta viajan en el SSR.
// (2) TRES FASES HONESTAS — quieto (invitación + botón), marcha
//     (cuenta atrás compuesta: «quedan Ns · X aciertos del sprint»,
//     aria-live), fin («LA CAMPANA SONÓ — X aciertos en 60 s» + récord
//     compuesto + OTRO SPRINT ▸). Las parejas del pool activo no
//     cambian durante la marcha (los botones de modo se duermen con
//     disabled); el veredicto sigue siendo el motor v172, no la casa.
// (3) EL RÉCORD DEL SPRINT ENTRA EN EL BOTÍN — sprintRecord en el
//     mini-store v216 con cerradura v132 (los botines viejos despiertan
//     con 0 — migración por defaults), JAMÁS la BD (un solo escritor,
//     leyes v245/v246). La campana la toca el reloj del módulo, que
//     escribe el récord máximo y despierta a los oyentes.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 (○ /en-vivo en pie) ·
//     health v280.0 db up · pruebas 186/186 (+2 EL CONTRARRELOJ DEL
//     PESO: estática — la cota 12 en el servidor, la constante del
//     reloj 60000 con su linaje v61, el store del sprint a nivel de
//     módulo (tick + caché + suscripción), el sprintRecord en el botín
//     con migración por defaults, el anotarSprintAcierto en apostar,
//     las tres fases con sus líneas compuestas y la guardia v234; viva
//     — el SSR sirve «CONTRARRELOJ ▸», la invitación compuesta «60 s
//     contra el archivo» y las anclas v272/v279/v213 en pie) · BD
//     intocada (1877 cables · 9 hechos, un solo escritor).
// Herencia v279.0 EL QUIZ DEL FRENTE y toda la crónica. Guards v167 intactos.
// v281.0 LA SALA DE LOS SERVICIOS — la expansión módulo a módulo abre
// una puerta nueva: /servicios, la sala server que sirve los DOS
// catálogos de inteligencia de la casa que solo vivían en paneles
// client-side del aparato (AGENCIAS v127 — los 18 ojos de la Comunidad
// de EE. UU. bajo la ODNI — y SERVICIOS v128 — los 18 servicios
// extranjeros, expediente a expediente, nación por nación), invisibles
// para el SSR y para Google. Medido con el motor real al abrir (tsx):
// 18 + 18 = 36 expedientes, comunidad en 6 categorías (CORONA 1 ·
// EXTERIOR 1 · PENTÁGONO 4 · ARMADO 5 · ESCUDO 4 · MINISTERIO 3), red
// en 5 bloques (ALIANZA 6 · BLOQUE 4 · LEVANTE 3 · CONTINENTAL 3 ·
// SUBCONTINENTE 2), arco de fundación 1882 (ONI) → 2020, 12 naciones
// en la red. Cada expediente viaja con SUS datos de la fuente (lema,
// misión, fichas, linaje — verbatim); los censos por categoría, el
// arco de fundación y las naciones derivados con Set + filter +
// reduce (cero cifras a mano, herencia v235/v274); las líneas
// compuestas COMPLETAS en JS (lección v256); las leyendas de los
// bloques viajan desde la fuente (directiva v266); el salón
// interactivo sigue en el aparato con la puerta honesta declarada
// (patrón v275/v276); sitemap indexa la sala (patrón v274). Nacida de
// la RESURRECCIÓN del sandbox: el volumen volvió a un snapshot v173
// y el canon sobrevivió porque estaba empujado (la lección de siempre:
// el canon que no se empuja no existe) — main restaurada a origin/main
// (v280.0, 5810d5b) y la ronda continuó sobre el canon real.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 (○ /servicios en la
//     tabla) · health v281.0 db up · pruebas 188/188 (+2 LA SALA DE
//     LOS SERVICIOS: estática — las dos fuentes importadas, los censos
//     derivados con Set/filter, las líneas compuestas en JS, la
//     placa derivada del num real, las puertas del núcleo, la
//     procedencia y la guardia v234; viva — el SSR sirve la sala con
//     «LA COMUNIDAD», «LA RED MUNDIAL», MI6 y CIA en el HTML, el
//     censo derivado y las anclas /historia y sitemap en pie) · BD
//     intocada (1877 cables · 9 hechos, un solo escritor).
// Herencia v280.0 EL CONTRARRELOJ DEL PESO y toda la crónica. Guards v167 intactos.
//
// v282.0 LOS SENTIDOS DE LA SALA — la segunda capa de la sala de los
// servicios (la «Queda» de la v281): los TRES exports hermanos de
// agencias-data (líneas 442-527) suben al server junto a los 36
// expedientes. ① SENTIDOS (5): los cinco sentidos del oficio —
// HUMINT · SIGINT · GEOINT · OSINT · FININT —, cada tarjeta con su
// sigla, su nombre y su texto VERBATIM de la fuente (directiva v266).
// ② ALIADAS (1): la sala anexa de las manos que actúan — FEMA, con su
// nota completa («No es uno de los 18 ojos: es la mano que actúa
// cuando los ojos ya vieron el desastre»), vocabulario de la propia
// fuente. ③ COLECCION: la colección en cifras bajo la comunidad —
// total 18, sedes en el corredor 16, arco de fundación ONI 1882 →
// DELTA 7 2020, 6 nacidas tras el 11-S, fuera del corredor
// 16ª AF · DELTA 7 —, TODO ya derivado en la fuente con
// Set + filter + reduce (la sala no escribe una cifra: la sirve).
// Medido con el motor real al abrir (tsx): SENTIDOS 5, ALIADAS 1
// (FEMA), COLECCION 18·16·2·1882·2020·6. Las tres líneas nuevas se
// componen COMPLETAS en JS (lección v256); cero fechas a mano
// (guardia v234); el noscript crece con los sentidos y las manos,
// también compuesto. PRUEBAS 190/190 (+2: estática — los tres
// imports, las tres líneas compuestas, el strip de cifras desde
// COLECCION, el vocabulario de la fuente, la guardia v234; viva —
// LOS SENTIDOS DE LA INTELIGENCIA con HUMINT...FININT, SALA ANEXA
// con FEMA verbatim, la línea de cifras con 16 sedes y el arco, el
// noscript crecido y las anclas v281 en pie). QA: tsc 0 TOTAL ·
// eslint 0 · build EXIT 0 · health v282.0 db up · BD intocada
// (1877 cables · 9 hechos, un solo escritor) · cierre doble.
// Herencia v281.0 LA SALA DE LOS SERVICIOS y toda la crónica.
// v283.0 LA ARMERÍA DEL ARCHIVO — la cabeza de la cola de la v282
//         aterriza: la armería (arsenal-data, la fuente más grande sin
//         vestir — 12 armas reales, 28 KB client-side puros) gana su
//         sala server /armeria, patrón /historia (v274): prerenderizada
//         ○, sin cliente, sin BD, indexable para Google.
// (1) LAS FICHAS VIAJAN VERBATIM — cada arma con su foto real (Wikimedia),
//     su origen y su era tal como la fuente los declara, su función y su
//     impacto VERBATIM (directiva v266: la casa no inventa); el salón
//     interactivo (selector + despiece paso a paso) vive en el aparato y
//     la puerta se declara honesta (patrón v275/v276).
// (2) TODO DERIVADO, NADA A MANO — la línea de la casa compuesta COMPLETA
//     en JS (lección v256): «La armería del archivo — 12 armas reales con
//     su foto, su despiece de 79 piezas y su impacto con datos, desde
//     AK-47 hasta M777, nacidas en 8 orígenes» — ARSENAL.length,
//     reduce de assembly.length, Set de origins y los shorts de los
//     extremos de la fuente; despiece y ficha técnica contados por arma
//     (assembly.length, Object.keys(specs).length); cero años escritos
//     (la era viaja como dato de la fuente, guardia v234 — la lección de
//     las guardias del arco de la v282, generalizada).
// (3) LAS PUERTAS DE LA CASA — el sitemap anuncia /armeria (monthly, 0.6)
//     y la paleta Ctrl+K la lleva (pg:armeria, icono Crosshair); JSON-LD
//     CollectionPage + ItemList con numberOfItems de la fuente; noscript
//     honesto con la línea compuesta.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 (○ /armeria en la tabla) ·
//     health v283.0 db up · pruebas 192/192 (+2 LA ARMERÍA DEL ARCHIVO:
//     estática — la fuente intacta uno a uno (12 ids), el conteo de
//     piezas derivado, la línea compuesta en JS sin cifras escritas, el
//     verbatim de función e impacto, las puertas (sitemap + paleta) y la
//     guardia v234; viva — el SSR sirve la línea derivada, la AK-47 con
//     su ficha verbatim, el despiece contado, la puerta al aparato y el
//     sitemap vivo anunciando la sala) · BD intocada (1877 cables · 9
//     hechos, un solo escritor).
// Herencia v282.0 LOS SENTIDOS DE LA SALA y toda la crónica. Guards v167 intactos.
// v284.0 EL TABLERO DE LOS CONFLICTOS — la cabeza de la cola de la
//         v283 aterriza: CONFLICTS (game-data, 33 regiones con dossier
//         real — nivel, intensidad, resumen, lat/lng, coste humano —
//         medida esta ronda: CRITICO ×9 · INESTABILIDAD ×14 · TENSION
//         ×5 · VIGILANCIA ×5) sube al server como /conflictos, el
//         índice que conecta el catálogo de la casa con las salas de
//         teatro vivas (/conflicto/[tag], v206) y el mapa (/mundo,
//         v215). force-dynamic: el pulso de la BD entra al render.
// (1) LA PUERTA SOLO SE ABRE DONDE EXISTE — cada región mira dos
//     fuentes: el mapa de teatros (TEATROS, la ley v206: una URL
//     desconocida es 404 limpio) y el pulso real de la BD (groupBy
//     conflictTag, lectura pura). Teatro con cables → puerta con el
//     conteo del archivo (ukraine 173 · gaza 146 · hormuz 60...);
//     teatro sin cables → la sala existe y espera; región sin sala →
//     «pulso dormido — sin sala de teatro todavía» (y si el archivo le
//     da cables antes de que exista la sala, lo declara también).
//     Nunca puertas muertas.
// (2) TODO DERIVADO, NADA A MANO — la línea compuesta COMPLETA en JS
//     (lección v256): «El tablero de los conflictos — 33 regiones en
//     seguimiento, 9 con pulso vivo en el archivo y 24 dormidas, con
//     una intensidad media de 66/100» — length, filter y la media con
//     reduce + Math.round; los chips del censo se derivan en el ORDEN
//     DE LA FUENTE (primera aparición, reduce manual — nada de listas
//     de niveles escritas a mano) y componen «CRITICO ×9» en un solo
//     nodo (lección v274); el resumen de cada región viaja VERBATIM
//     (directiva v266); cero años escritos, guardia v234.
// (3) LAS PUERTAS DE LA CASA — el sitemap anuncia /conflictos (daily,
//     0.7 — el pulso la mueve) y la paleta Ctrl+K la lleva
//     (pg:conflictos, icono Activity); JSON-LD CollectionPage +
//     ItemList con numberOfItems de la fuente; noscript honesto.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 (ƒ /conflictos en la
//     tabla) · health v284.0 db up · pruebas 194/194 (+2 EL TABLERO:
//     estática — la fuente intacta (33 ids + borde del slice), el
//     censo derivado en el orden de la fuente, el groupBy de lectura
//     pura, la guardia de puertas por TEATROS, la línea compuesta sin
//     cifras escritas, las puertas (sitemap + paleta) y la guardia
//     v234; viva — el SSR sirve la línea derivada completa, los chips
//     del censo, el dossier de Ucrania verbatim con su puerta «173
//     cables del archivo» y el sitemap vivo anunciando la sala) · BD
//     intocada (1877 cables · 9 hechos, un solo escritor).
// Herencia v283.0 LA ARMERÍA DEL ARCHIVO y toda la crónica. Guards v167 intactos.
//
// v286.0 LOS ROSTROS DEL PODER — la galería de los rostros sube a
// server (patrón /historia v274 · /servicios v281 · /armeria v283):
// personas-data.ts — ROSTROS, 34 fichas reales del censo de poder
// (TRONOS 12 · DINERO 10 · TRIBUNAL 6 · NUEVOS 6), con 20 campos por
// expediente — solo vivía client-side (rostros-panel, intros-gta),
// invisible para el SSR y para Google. Nació v284 en vuelo y el
// número envejeció DOS VECES — la COLISIÓN DOBLE: primero con el
// tablero de la v284 (1ca93e9) y, durante el rebase de esa colisión,
// con el globo de la v285 (6501d17); el protocolo de la casa se
// ejecutó dos veces (stash → pull --ff-only → pop → conservar AMBOS
// trabajos → renumerar) y la galería sube como v286 sobre el canon
// real — el número libre se verifica en el instante del commit, y
// si envejece, se renumera, nunca se pelea.
// ① LA SALA NUEVA /rostros: expediente VERBATIM de la fuente
// (directiva v266) — cargo, organización, sede · ciudad · país,
// mandato, alcance, poder (58–98, derivado), ruta, frase («Yo solo
// puedo arreglarlo.» la primera), señas, guardia, sucesión y notas;
// agrupada por las CUATRO categorías en el ORDEN DE LA FUENTE con su
// leyenda e icono desde CATEGORIAS_ROSTRO (directiva v266).
// ② TODO DERIVADO, NADA A MANO — censo con Set + filter, naciones
// con Set (18), placa padStart del num real, y las cifras mayores
// SERVIDAS de COLECCION_ROSTROS (ya derivada en la fuente): la línea
// de cifras nombra la ficha más poderosa (Donald J. Trump, 98 —
// 47.º Presidente de los Estados Unidos) sin que la sala escriba un
// número; las DOS guardias heredadas: ninguna linea* contiene un año
// literal (v282/v283/v284) y guardia v234 de fechas.
// ③ LAS PUERTAS DE LA CASA — sitemap anuncia /rostros (monthly 0.6,
// patrón v274) y la paleta Ctrl+K la lleva (pg:rostros, icono
// Users); la puerta honesta al aparato declarada (patrón
// v275/v276): el mapa de señales y el pulso siguen en la primera
// página; noscript compuesto. Medido con el motor real al abrir
// (tsx): ROSTROS 34 · censos 12·10·6·6 · naciones 18 · poder 58–98 ·
// frase en las 34 · lat/lng en las 34.
// PRUEBAS 198/198 (+2: estática — la fuente, el censo derivado, las
// leyendas de la fuente, la placa, las líneas compuestas, las cifras
// servidas de COLECCION_ROSTROS, las puertas y las dos guardias;
// viva — /rostros 200 con la línea derivada completa, LOS TRONOS
// ×12, Trump y Putin verbatim con su frase, la placa 01, la puerta
// al aparato y el sitemap VIVO anunciando la sala). QA: tsc 0 TOTAL
// · eslint 0 · build EXIT 0 (○ /rostros y ƒ /conflictos en la
// tabla) · health v286.0 db up · BD intocada (1877 cables · 9
// hechos, un solo escritor) · cierre doble. Herencia v285.0 EL
// TABLERO EN EL GLOBO y toda la crónica.
// v288.0 EL PULSO DEL ARCHIVO POR AGENCIA — la tercera capa de
//         /servicios (la «Queda» de la v282, en pie en la cola de la
//         v287, se paga): los PULSO_KEYWORDS de la fuente (el pulso
//         real por agencia, 18 llaves) cruzan el archivo real
//         (títulos de los cables no-curados) con EL MISMO algoritmo
//         del panel (minúsculas, includes en el título — el canon del
//         consumidor, comunidad-panel v127). Medido contra la BD fría
//         al abrir: 10 de 18 agencias citadas por 451 titulares (CIA
//         307, DEA 38, NSA 39...). Lectura pura — la casa no escribe
//         al servir (un solo escritor, leyes v245/v246); la sala pasa
//         a force-dynamic (el camino del tablero, v284) para que el
//         pulso entre al render, y los expedientes de arriba no
//         dependen de la señal: BD fría → el pulso duerme honesto y
//         se declara.
// (1) EL CRUCE ES DEL CANON — el algoritmo es el del panel (el
//     consumidor es la fuente del matching, no una variante nueva de
//     la sala); el orden es el de la fuente y el vacío no se rellena:
//     las agencias sin menciones no aparecen y la sección lo declara.
// (2) LA LÍNEA DEL PULSO SE COMPONE COMPLETA EN JS (lección v256):
//     «El pulso del archivo por agencia — 10 de 18 agencias citadas
//     por 451 titulares del archivo» — pulso.length, COMUNIDAD.length
//     y el reduce de menciones; cada tarjeta con su conteo derivado y
//     su último titular como puerta viva a /noticia/[id].
// (3) EL NOSCRITO CRECE — compuesto en JS: si el pulso duerme, la
//     frase no viaja; si despierta, nombra el cruce con su conteo.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 (ƒ /servicios en pie) ·
//     health v288.0 db up · pruebas 202/202 (+2 EL PULSO DEL ARCHIVO
//     POR AGENCIA: estática — la fuente de keywords intacta (18), la
//     lectura pura sin curated-, el algoritmo del canon, el orden de
//     la fuente, la línea compuesta, la puerta /noticia y el vacío
//     honesto; viva — el SSR sirve la línea derivada completa (10 de
//     18 · 451), la tarjeta de CIA con sus 307 menciones, el titular
//     vivo y las anclas v282 en pie) · BD intocada (1877 cables ·
//     9 hechos, un solo escritor).
// Herencia v287.0 EL PULSO DEL ARCHIVO POR ROSTRO y toda la crónica.
// Guards v167 intactos.
// v291.0 EL PACTO QUE UNE LAS DOS SALAS — la quinta capa de
//         /servicios (los TRES exports hermanos que quedaban en
//         agencias-mundo-data suben al server, el patrón de la v282):
//         COLECCION_MUNDO (las cifras de la red: 18 expedientes · 12
//         naciones · 6 en los Cinco Ojos · MI6 1909 → CNI 2002),
//         REDES (los cinco arcos del pacto UKUSA que nacen del hub de
//         Londres, verbatim de la fuente) y TERMINAL_PUENTE (la
//         coordenada de Washington, D.C. — 38.8977, -77.0365 — la
//         terminal del puente atlántico con la sala hermana).
// (1) NADA A MANO — las cifras se SIRVEN de COLECCION_MUNDO (la
//     herencia v282), las siglas de los arcos se derivan de
//     SERVICIOS por id, la coordenada se COMPONE desde
//     TERMINAL_PUENTE (el camino del globo, v285) y la etiqueta del
//     pacto viaja VERBATIM de la fuente (directiva v266).
// (2) LA LÍNEA DEL PACTO SE COMPONE COMPLETA EN JS (lección v256):
//     «El pacto que une las dos salas — 5 arcos nacen del hub de
//     Londres (MI6) y 1 cruza el Atlántico hasta Washington
//     (38.8977°, -77.0365°), la terminal del puente con la
//     Comunidad»; el número de puentes sale del filter, el hub de la
//     primera arista — si la fuente crece, la línea crece sola.
// (3) LA GUARDIA DEL ARCO CRECE — ninguna linea* de la sala puede
//     contener un año literal (19|20)\d\d: 1909, 1946 y 2002 viven
//     en la fuente, no en la sala.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 (ƒ /servicios en pie) ·
//     health v291.0 db up · pruebas 208/208 (+2) · BD intocada
//     (1877 cables · 9 hechos, un solo escritor).
// Herencia v290.0 EL PULSO POR PALABRAS y toda la crónica. Guards v167 intactos.
// v287.0 EL PULSO DEL ARCHIVO POR ROSTRO — la tercera capa de
//         /rostros (la cola de la v286 se paga): los
//         PULSO_KEYWORDS_ROSTROS de la fuente cruzan el archivo real
//         (títulos de los cables no-curados) con EL MISMO algoritmo del
//         panel (minúsculas, includes en el título — el canon del
//         consumidor, rostros-panel v286). Medido contra la BD fría al
//         abrir: 28 de 34 rostros citados por 1792 titulares (Trump
//         200, Putin 75, Xi 41...). Lectura pura — la casa no escribe
//         al servir (un solo escritor, leyes v245/v246); la sala pasa a
//         force-dynamic (el camino del tablero, v284) para que el pulso
//         entre al render, y el expediente de arriba no depende de la
//         señal: BD fría → el pulso duerme honesto y se declara.
// (1) EL CRUCE ES DEL CANON — el algoritmo es el del panel (el
//     consumidor es la fuente del matching, no una variante nueva de la
//     sala); el orden es el de la fuente y el vacío no se rellena: los
//     rostros sin menciones no aparecen y la sección lo declara.
// (2) LA LÍNEA DEL PULSO SE COMPONE COMPLETA EN JS (lección v256):
//     «El pulso del archivo por rostro — 28 de 34 rostros citados por
//     1792 titulares del archivo» — pulso.length, ROSTROS.length y el
//     reduce de menciones; cada tarjeta con su conteo derivado y su
//     último titular como puerta viva a /noticia/[id].
// (3) PHOTOS, MEDIDA Y DIFERIDA — la otra cabeza de la cola es ficción
//     OSINT del aparato (semillas de imagen sintética, campos de juego):
//     las salas server no indexan ficción como hecho (el precedente del
//     ciber, v285). La sala nunca miente.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 (ƒ /rostros en pie) ·
//     health v287.0 db up · pruebas 200/200 (+2 EL PULSO DEL ARCHIVO
//     POR ROSTRO: estática — la fuente de keywords intacta, la lectura
//     pura sin curated-, el algoritmo del canon, el orden de la fuente,
//     la línea compuesta, la puerta /noticia y el vacío honesto; viva —
//     el SSR sirve la línea derivada completa (28 de 34 · 1792), la
//     tarjeta de Trump con sus 200 menciones, el titular vivo y las
//     anclas v286 en pie) · BD intocada (1877 cables · 9 hechos, un
//     solo escritor).
// Herencia v286.0 LOS ROSTROS DEL PODER y toda la crónica. Guards v167 intactos.
// v289.0 EL PULSO DE LA RED MUNDIAL — la cuarta capa de /servicios
//         (la cabeza de la cola de la v288 se paga): los
//         PULSO_KEYWORDS_MUNDO de la fuente (el pulso real de los 18
//         servicios extranjeros, v128 — MI6, Mossad, FSB, BND...)
//         cruzan el MISMO archivo con EL MISMO algoritmo del panel
//         (red-mundial-panel: minúsculas, includes en el título — el
//         canon del consumidor). El bloque hermano del pulso por
//         agencia (v288): misma lectura pura (la consulta es UNA para
//         toda la sala), mismo orden de la fuente, mismo vacío
//         honesto. Medido contra la BD fría al abrir: 2 de 18
//         servicios citados por 5 titulares (ASIS 1 · CNI 4) — el
//         pulso es el que el archivo dice, no el que la casa querría.
// (1) EL CRUCE ES DEL CANON — el algoritmo es el del panel, el orden
//     el de la fuente (RED) y el vacío no se rellena; la línea se
//     compone COMPLETA en JS (lección v256): «El pulso de la red
//     mundial — 2 de 18 servicios citados por 5 titulares del
//     archivo»; cada tarjeta con su conteo derivado y su último
//     titular como puerta viva a /noticia/[id].
// (2) PULSO_KEYWORDS_GUERRA, MEDIDO Y CLASIFICADO — el otro hermano
//     del linaje (guerras-activas-data) vive en el corazón del mega
//     simulador de guerra (v129): el pulso de GUERRA queda en la cola
//     con su clasificación pendiente (si es simulación, no sube como
//     hecho — las lecciones del ciber v285 y de PHOTOS v287).
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 (ƒ /servicios en pie) ·
//     health v289.0 db up · pruebas 204/204 (+2 EL PULSO DE LA RED
//     MUNDIAL: estática — la fuente de keywords intacta (18), la
//     lectura compartida, el algoritmo del canon, la línea compuesta,
//     la puerta /noticia, el vacío honesto y las guardias; viva — el
//     SSR sirve la línea derivada completa (2 de 18 · 5), las
//     tarjetas ASIS y CNI con sus menciones, el titular vivo y las
//     anclas v288/v282 en pie) · BD intocada (1877 cables · 9 hechos,
//     un solo escritor).
// Herencia v288.0 EL PULSO DEL ARCHIVO POR AGENCIA y toda la crónica. Guards v167 intactos.
// v290.0 EL PULSO POR PALABRAS — la tercera capa del tablero (la cola
//         de la v289 se paga y la clasificación pendiente se resuelve):
//         las 6 GUERRAS de la fuente (guerras-activas-data, v129 —
//         dossiers REALES de las guerras del planeta: UCRANIA · ORIENTE
//         MEDIO · SUDÁN · SAHEL · MYANMAR · TAIWÁN — clasificadas esta
//         ronda: el simulador las consume, pero los dossiers y sus
//         keywords son los del mundo real) cruzan el archivo con SUS
//         keywords y EL MISMO algoritmo del canon (minúsculas, includes
//         en el título — el pulso-de-cables de la v263). El pulso por
//         conflictTag cuenta los etiquetados; este cuenta los que CITAN
//         a cada guerra — incluidos los que nadie etiquetó. Medido
//         contra la BD fría al abrir: 6 de 6 guerras citadas por 398
//         titulares (Oriente 190 · Ucrania 119 · Taiwán 61 · Sahel 16 ·
//         Sudán 11 · Myanmar 1).
// (1) EL CRUCE ES DEL CANON — el orden es el de la fuente (GUERRAS) y
//     el vacío no se rellena; la línea se compone COMPLETA en JS
//     (lección v256): «El pulso por palabras — 6 de 6 guerras citadas
//     por 398 titulares del archivo»; cada tarjeta con SU nombre
//     verbatim de la fuente, su conteo derivado y su último titular
//     como puerta viva a /noticia/[id].
// (2) LECTURA PURA E INDEPENDIENTE — la sala gana su propia lectura de
//     títulos (select id/title, sin curated-) separada del groupBy del
//     pulso por etiqueta: si una falla, la otra sigue y cada capa
//     declara su propio vacío (la casa no escribe al servir — un solo
//     escritor, leyes v245/v246).
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 (ƒ /conflictos en pie) ·
//     health v290.0 db up · pruebas 206/206 (+2 EL PULSO POR PALABRAS:
//     estática — la fuente clasificada e intacta (6 guerras con sus
//     keywords), el cruce en el orden de la fuente, la línea compuesta,
//     el nombre verbatim, la puerta /noticia, el vacío honesto y las
//     guardias; viva — el SSR sirve la línea derivada completa (6 de 6
//     · 398), las seis tarjetas con sus conteos (Oriente 190, Ucrania
//     119) y las anclas v284/v285 en pie) · BD intocada (1877 cables ·
//     9 hechos, un solo escritor).
// Herencia v289.0 EL PULSO DE LA RED MUNDIAL y toda la crónica. Guards v167 intactos.
// v292.0 EL ARCHIVO DESCLASIFICADO — la sexta capa de /servicios
//         (el censo del almacén de la v291, cabeza clasificada): la
//         capa REAL de expediente-data (v95 — la que la propia fuente
//         declara como tal, frente a la capa SIM del mundo Vanguard que
//         NO sube a esta sala) sube al server: los 5 expedientes reales
//         desclasificados con su FUENTE CITADA verbatim (MK-ULTRA con
//         la CIA Reading Room y la Comisión Church, STARGATE, PAPERCLIP
//         con NARA, COINTELPRO con el FBI Reading Room y el informe
//         Church, ECHELON con el informe TEMP 168 del Parlamento
//         Europeo y los archivos NSA desclasificados). 9,1 KB client-side.
// (1) LA CLASIFICACIÓN MANDA — CRISIS_SEED (la Guerra del Valle del
//     Karsk) y NACIONES_SEED son SIM explícito (capa: "SIM" en la
//     fuente): se difieren con la lección del ciber (v285) y de PHOTOS
//     (v287); ARCHIVO es la capa REAL y sube. El expediente entero no:
//     solo la parte que la propia fuente marca como real.
// (2) TODO DERIVADO, NADA A MANO — la línea compuesta COMPLETA en JS
//     (lección v256): «El archivo desclasificado — 5 expedientes reales
//     de la capa REAL de la fuente, con 21 fases y su fuente citada: la
//     historia que los propios archivos confiesan» — ARCHIVO.length y
//     las fases con reduce; cada carta con su región y su resumen
//     verbatim, su FUENTE CITADA en amber y sus fases con sus títulos
//     verbatim (los años viajan como dato de la fuente, guardia v234 —
//     la guardia del arco vigila que la LÍNEA no los escriba).
// (3) EL VACÍO HONESTO — si la capa REAL llegara vacía, la sección lo
//     declara; la puerta al aparato (donde vive la capa SIM con su
//     declaración de simulación) queda intacta.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 (ƒ /servicios en pie) ·
//     health v292.0 db up · pruebas 210/210 (+2 EL ARCHIVO
//     DESCLASIFICADO: estática — la fuente intacta (5 ids uno a uno),
//     la clasificación SIM/REAL declarada en la sala, la línea
//     compuesta, la fuente citada, las fases con reduce y la guardia
//     del arco; viva — el SSR sirve la línea derivada completa (5 · 21),
//     MK-ULTRA con su fuente citada (CIA Reading Room · Comisión
//     Church), ECHELON y las anclas v291/v288 en pie) · BD intocada
//     (1877 cables · 9 hechos, un solo escritor).
// Herencia v291.0 EL PACTO QUE UNE LAS DOS SALAS y toda la crónica. Guards v167 intactos.
// v293.0 EL ARCHIVO MUNDIAL — el censo del almacén sigue pagándose:
//         archive-data (v12) clasificada esta ronda — REAL de pies a
//         cabeza — y sube como sala server /archivo-mundial, patrón
//         /historia (v274) · /armeria (v283): prerenderizada ○, sin
//         cliente, sin BD. El botín: 44 curiosidades verídicas de la
//         historia en 6 categorías (GUERRA ×10 · POLÍTICA ×7 ·
//         RELIGIÓN ×7 · ANTIGÜEDAD ×7 · ECONOMÍA ×7 · ESPIONAJE ×6),
//         8 eras desde la Prehistoria con su periodo y su relato
//         verbatim, 6 contadores de las grandes guerras con sus totales
//         publicados (WW2 75M · WW1 17M...), el crimen global con sus
//         cifras estimadas y 8 expedientes de cartel con sus líderes
//         reales (Medellín, Escobar...). Solo vivía client-side
//         (curiosidades-panel, counters-panel, carteles-panel).
// (1) LA CLASIFICACIÓN MANDA — los seis exports de la fuente son datos
//     del mundo real (sin capa SIM declarada); LIVE_RATES (la tasa
//     demográfica) NO sube como contador: la tasa es real pero el reloj
//     que la mueve vive en el aparato — la sala declara la puerta
//     honesta y la fuente, no el reloj.
// (2) TODO DERIVADO, NADA A MANO — la línea compuesta COMPLETA en JS
//     (lección v256): «El archivo mundial — 44 curiosidades verídicas
//     en 6 categorías, 8 eras desde Prehistoria, 6 contadores de guerra
//     y 8 expedientes de cartel, con sus líderes reales»; las
//     categorías en el ORDEN DE LA FUENTE con sus chips «GUERRA ×10»;
//     los totales de guerra con toLocaleString("es-ES") sobre el número
//     real de la fuente; cero años escritos en líneas (la guardia del
//     arco), los periodos viajan como dato de la fuente (guardia v234).
// (3) LAS PUERTAS DE LA CASA — el sitemap anuncia /archivo-mundial
//     (monthly, 0.6) y la paleta Ctrl+K la lleva (pg:archivo-mundial,
//     icono ScrollText); JSON-LD ItemList con eras y carteles; noscript
//     honesto con la línea compuesta; puerta al aparato (los contadores
//     vivos y los filtros, patrón v275/v276).
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 (○ /archivo-mundial en la
//     tabla) · health v293.0 db up · pruebas 212/212 (+2 EL ARCHIVO
//     MUNDIAL: estática — la fuente REAL intacta (44/8/6/8 uno a uno
//     por bloque), la línea compuesta sin cifras escritas, los chips
//     por categoría en el orden de la fuente, el toLocaleString, las
//     puertas (sitemap + paleta) y las guardias; viva — el SSR sirve la
//     línea derivada completa, las 8 eras con su periodo verbatim, WW2
//     con sus 75.000.000 formateados, la curiosidad de Karansebes y el
//     expediente de Medellín con Escobar verbatim y el sitemap VIVO) ·
//     BD intocada (1877 cables · 9 hechos, un solo escritor).
// Herencia v292.0 EL ARCHIVO DESCLASIFICADO y toda la crónica. Guards v167 intactos.
// v294.0 EL ATLAS DEL PLANETA — el censo fuera de la cola: las cinco
//         cabezas restantes del almacén (imperio-data, conquest-data,
//         hooks-data, social-data, camera-data) cayeron TODAS en la
//         clasificación de esta ronda — ficción y juego declarados en
//         su propia fuente («continente ficticio», «mini-juego estilo
//         Risk», «todo el contenido es ficticio», monedas y gemas) — y
//         el censo sistemático (147 ficheros × server pages) destapó
//         la veta que ninguna «Queda» nombró: atlas-data (v121), REAL
//         de pies a cabeza («datos verificados hasta octubre 2025»),
//         sin "use client", consumida en server SOLO como cifra en
//         /nucleo (PAISES_ATLAS.length) mientras su plato completo
//         viaja en un panel ssr:false de la portada. La sala nueva
//         /atlas levanta el plato, patrón /historia (v274) · /armeria
//         (v283) · /archivo-mundial (v293): prerenderizada ○, sin
//         cliente, sin BD. El botín: 66 naciones con capital,
//         población (fmtMillones), superficie (fmtKm2, toLocaleString
//         es-ES), idiomas, moneda, gobierno y líder real, agrupadas
//         por región EN EL ORDEN DE LA FUENTE con chips «América ×12»
//         en un solo nodo (lección v274); 69 personas del poder con su
//         sede real agrupadas por categoría (GOBIERNO 33 · ORGANISMOS
//         6 · DINERO 14 · CIENCIA 8 · CULTURA 8 — el censo manda: la
//         cabeza de la fuente dice 70, el dato dice 69, lección v292);
//         15 rutas del poder resueltas contra las personas por id
//         (personaPorId — si la fuente pierde un id, la ruta no se
//         dibuja). La zona IANA es real pero el RELOJ vive en el
//         aparato (el eco del LIVE_RATES de la v293): la sala declara
//         la puerta honesta.
// (1) LA CLASIFICACIÓN MANDA — cinco ficheros medidos y caídos en una
//     ronda (imperio «continente ficticio», conquest «mini-juego
//     estilo Risk», hooks ruleta/gemas de juego, social «todo el
//     contenido es ficticio», camera cámaras compradas con monedas):
//     las salas server no indexan ficción como hecho; el atlas es el
//     dato del mundo real que sí sube.
// (2) TODO DERIVADO, NADA A MANO — la línea compuesta COMPLETA en JS
//     (lección v256): «El atlas del planeta — 66 naciones con su
//     capital y su líder real en 5 regiones, 69 personas del poder
//     con su sede real y 15 rutas que unen los ejes del mundo»; las
//     regiones y categorías en el ORDEN DE LA FUENTE con sus chips en
//     un solo nodo; población y superficie con los fmt del canon de
//     la propia fuente; cero años escritos en líneas (la guardia del
//     arco), el desde de cada persona ni se renderiza.
// (3) LAS PUERTAS DE LA CASA — el sitemap anuncia /atlas (monthly,
//     0.6) y la paleta Ctrl+K la lleva (pg:atlas, icono Globe — ya
//     importado, cero cambios de import); JSON-LD CollectionPage +
//     ItemList con las 66 naciones; noscript honesto con la línea
//     compuesta; puerta al aparato (el globo, los arcos de vuelo y el
//     reloj vivo).
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 (○ /atlas en la tabla) ·
//     health v294.0 db up · pruebas 214/214 (+2 EL ATLAS DEL PLANETA:
//     estática — la fuente REAL intacta (66/69/15 censados por
//     bloque), las regiones y categorías derivadas en el orden de la
//     fuente, la línea compuesta sin cifras escritas, los chips en un
//     nodo, los fmt del canon, las rutas resueltas con personaPorId,
//     las puertas (sitemap + paleta) y las guardias; viva — el SSR
//     sirve la línea derivada completa, «América ×12», «GOBIERNO
//     ×33», Estados Unidos con sus «9.833.517 km²», Xi Jinping con La
//     Casa Blanca, la ruta «Donald Trump ↔ Xi Jinping — GRAN PARIDAD»
//     y el sitemap VIVO) · BD intocada (1877 cables · 9 hechos, un
//     solo escritor).
// Herencia v293.0 EL ARCHIVO MUNDIAL y toda la crónica. Guards v167 intactos.
// v295.0 LA VERDAD CRUDA — el almacén menor clasificado: el censo de la
//         «Queda» de la v294 cayó casi entero en negativo — diez fuentes
//         más medidas y caídas con ficción, simulación determinista o
//         creación propia declarados en su propia cabeza (geoint, lados,
//         monitor, enclaves, perdidas «ficción plausible», sismo
//         «ficticios», mundial «ficticio», tierra «creación propia»,
//         cielos, dark–menores) — y destapó la veta documentada que
//         dormía desde la v24: dark-data (49 KB), «datos documentados
//         de abusos, incidentes, memorial y drones; todas las entradas
//         citan fuentes públicas (ONU, CPJ, RSF, ACLED, HRW, OSCE)»,
//         SIN "use client", consumida en server SOLO por tres rutas API
//         mientras su plato completo viaja en siete paneles client de
//         la portada. La sala nueva /verdad-cruda levanta el registro
//         documental, patrón /historia (v274) · /armeria (v283) ·
//         /archivo-mundial (v293) · /atlas (v294): prerenderizada ○,
//         sin cliente, sin BD. El botín: 12 abusos de guerra
//         verificados uno a uno con su FUENTE CITADA verbatim
//         (Kramatorsk, Bucha, Mariúpol, Gaza, Sudán, Myanmar — el
//         honor de la cita real, v292), agrupados por guerra EN EL
//         ORDEN DE LA FUENTE con chips «UCRANIA ×5» en un solo nodo;
//         el memorial de 10 periodistas caídos documentados por CPJ ·
//         RSF · IPI con su nota verbatim, agrupado por las guerras que
//         la propia fuente declara (MEMORIAL_WARS); 14 incidentes con
//         su estado, su costa y sus fuentes, agrupados por tipo en el
//         orden de la fuente con la etiqueta de la fuente; 4 sistemas
//         de dron con su anatomía completa (Shahed-136, FPV, Bayraktar
//         TB2, Lancet-3); 4 cifras del coste con su fuente.
// (1) LA CLASIFICACIÓN MANDA — el registro documental sube; la
//     mecánica de juego y el índice de metraje NO: RECRUIT_SIDES (el
//     reclutamiento 3D del aparato), ELECTION_*/AMBASSADOR_* (el
//     ciclo electoral) y SALA_ROJA_ITEMS (el índice de metraje
//     gráfico — se declara la puerta honesta, no se indexa) se
//     quedan donde viven.
// (2) TODO DERIVADO, NADA A MANO — la línea compuesta COMPLETA en JS
//     (lección v256): «La verdad cruda de las guerras — 12 abusos
//     documentados con su fuente citada en 5 guerras, 10 periodistas
//     caídos en el memorial, 14 incidentes documentados, 4 sistemas
//     de dron con su anatomía y 4 cifras del coste»; las guerras, los
//     tipos y las categorías en el ORDEN DE LA FUENTE con sus chips
//     en un solo nodo (lección v274); cero años escritos en líneas
//     (la guardia del arco), las fechas viajan como dato de la fuente
//     (guardia v234, el precedente «2,5 M a.C.» de la v293).
// (3) LAS PUERTAS DE LA CASA — el sitemap anuncia /verdad-cruda
//     (monthly, 0.6) y la paleta Ctrl+K la lleva (pg:verdad-cruda,
//     icono Eye — ya importado, cero cambios de import); JSON-LD
//     CollectionPage + ItemList con los 12 abusos; noscript honesto
//     con la línea compuesta; puerta al aparato (los paneles
//     interactivos, la sala roja, el reclutamiento 3D).
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 (○ /verdad-cruda en la
//     tabla) · health v295.0 db up · pruebas 216/216 (+2 LA VERDAD
//     CRUDA: estática — la fuente documentada intacta (12/10/14/4/4
//     censados por bloque), las 5 guerras presentes, la fuente
//     completa (todos los abusos con fuentes y verified, todos los
//     incidentes con fuentes, todo el memorial con documentedBy), la
//     sala derivada (línea compuesta, chips en un nodo, fuentes
//     citadas verbatim, memoria de juego y metraje FUERA), las
//     puertas (sitemap + paleta) y las guardias; viva — el SSR sirve
//     la línea derivada completa, «UCRANIA ×5», Kramatorsk con su
//     «ONU/OHCHR — Informe OHCHR Ucrania #12», Viktoria Roshchyna con
//     «CPJ · RSF · IPI», el Shahed con su «≈2.000 km», la cifra
//     «9.000+» con «ONU/OHCHR 2025» y el sitemap VIVO) · BD intocada
//     (1877 cables · 9 hechos, un solo escritor).
// Herencia v294.0 EL ATLAS DEL PLANETA y toda la crónica. Guards v167 intactos.
// v296.0 LAS DIVISAS DEL PLANETA — el almacén menor sigue pagando: el
//         censo de la «Queda» de la v295 destapó la veta mayor que
//         dormía desde la v20: world-data (46,7 KB), «DATASET MUNDIAL
//         REAL: 251 países y territorios con nombre en español, bandera
//         real (flagcdn) y moneda oficial con tasa de cambio (fuente:
//         open.er-api.com, captura del 9 de septiembre de 2026)»,
//         generado por gen-world-data.mjs, SIN "use client", consumido
//         en server SOLO por una ruta API y como cifra (countryName)
//         mientras su plato completo viaja en el panel divisas del
//         aparato. La sala nueva /divisas levanta el archivo, patrón
//         /historia (v274) · /armeria (v283) · /archivo-mundial (v293)
//         · /atlas (v294) · /verdad-cruda (v295): prerenderizada ○,
//         sin cliente, sin BD. El botín: 247 países y territorios con
//         su moneda oficial real (código ISO 4217, nombre en español,
//         símbolo y tasa por 1 USD), agrupados por región EN EL ORDEN
//         DE LA FUENTE con chips «Asia ×50» en un solo nodo; 154
//         monedas únicas censadas del dato (no del comentario); las
//         monedas COMPARTIDAS derivadas del dato con su conteo (el
//         euro sirve a 37 países, el dólar a 16) y la línea con la más
//         compartida. La tasa es la CAPTURA que la propia fuente
//         declara — la operativa en vivo (simulada, monedas VANGUARD)
//         y las banderas reales de flagcdn viven en el aparato: puerta
//         honesta declarada (el eco del LIVE_RATES v293 y del reloj
//         IANA v294).
// (1) LA CLASIFICACIÓN MANDA — world-data es REAL declarada («DATASET
//     MUNDIAL REAL... no editar a mano: regenerar con scripts/gen-
//     world-data.mjs»); la sala no convierte, no simula, no dibuja
//     banderas: sirve el archivo y declara las puertas.
// (2) TODO DERIVADO, NADA A MANO — la línea compuesta COMPLETA en JS
//     (lección v256): «Las monedas del planeta — 247 países y
//     territorios con su moneda oficial real en 6 regiones y 154
//     monedas únicas; la más compartida: Euro, que sirve a 37 países»;
//     las regiones en el ORDEN DE LA FUENTE con sus chips en un solo
//     nodo (lección v274); el fmt de la tasa es regla derivada
//     (es-ES, 2 decimales para las grandes, 4 para las pequeñas);
//     cero años escritos en líneas (la guardia del arco), la captura
//     se declara en prosa como dato de la fuente (precedente
//     «octubre 2025» de la v294).
// (3) LAS PUERTAS DE LA CASA — el sitemap anuncia /divisas (monthly,
//     0.6) y la paleta Ctrl+K la lleva (pg:divisas, icono Landmark —
//     ya importado, cero cambios de import); JSON-LD CollectionPage +
//     ItemList con los 247 países; noscript honesto con la línea
//     compuesta; puerta al aparato (la casa de cambio, las banderas).
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 (○ /divisas en la tabla) ·
//     health v296.0 db up · pruebas 218/218 (+2 LAS DIVISAS DEL
//     PLANETA: estática — la fuente REAL intacta (247/251 censados por
//     bloque, las 6 regiones presentes, cero tasas nulas), la sala
//     derivada (línea compuesta, chips en un nodo, fmt de tasa, las
//     compartidas del dato), sin cliente ni simulación ni flagcdn, las
//     puertas (sitemap + paleta) y las guardias; viva — el SSR sirve
//     la línea derivada completa, «Asia ×50», Japón con su yen y su
//     «153,82 por 1 USD», Afganistán con su afgani, «EUR — Euro · € ·
//     37 países», «USD — Dólar estadounidense... 16 países» y el
//     sitemap VIVO) · BD intocada (1877 cables · 9 hechos, un solo
//     escritor).
// Herencia v295.0 LA VERDAD CRUDA y toda la crónica. Guards v167 intactos.
// v297.0 EL PODER MUNDIAL — la directiva de la «Queda» de la v296 se
//         cumple al pie de la letra: worldpower (6,6 KB, «datos militares
//         REALES del Banco Mundial», módulo vivo v44 con cache de 24 h)
//         sube SOLO si la sala acepta servir una captura con la red fuera
//         — y el patrón de la captura declarada (v296) ya lo tenía. Así
//         nace poder-data (25,6 KB): los tres indicadores del Banco
//         Mundial (MS.MIL.XPND.CD gasto militar en US$ corrientes,
//         MS.MIL.TOTL.P1 personal de fuerzas armadas, MS.MIL.XPND.GD.ZS
//         gasto militar % del PIB) capturados del 2026-11-05 con mrnev=1
//         por scripts/gen-poder-data.mjs y congelados en server. La sala
//         nueva /poder levanta el archivo, patrón /historia (v274) ·
//         /armeria (v283) · /archivo-mundial (v293) · /atlas (v294) ·
//         /verdad-cruda (v295) · /divisas (v296): prerenderizada ○, sin
//         cliente, sin BD. El botín: 167 países con gasto militar
//         registrado que suman 2,89 billones de US$ (el agregado WLD de
//         la fuente dice 2,856 — las sumas se censan de los países con
//         dato, lección v292); EL RANKING DEL DINERO (top 20 con barra
//         derivada del líder: Estados Unidos 954 mil M, el 33% del total
//         censado); LA FUERZA (top 15 por personal: India 3,1 M, China
//         2,5 M, Corea del Norte 1,5 M); EL ESFUERZO (top 15 por % del
//         PIB: Ucrania al 39,6%, Eritrea al 20,9%); y EL ARCHIVO POR
//         REGIONES con las 7 regiones del Banco Mundial EN EL ORDEN DE
//         LA FUENTE con chips «Europa y Asia Central ×49» en un solo
//         nodo (lección v274).
// (1) LA CLASIFICACIÓN MANDA — el módulo vivo se queda donde vive (la
//     lectura en vivo con cache de 24 h de /guerra-hoy y el aparato) y
//     la sala sirve la CAPTURA declarada con su fecha: puerta honesta
//     (el eco del LIVE_RATES v293, del reloj IANA v294 y de la casa de
//     cambio v296); los agregados regionales de la fuente quedan fuera,
//     regla de la propia fuente.
// (2) TODO DERIVADO, NADA A MANO — la línea compuesta COMPLETA en JS
//     (lección v256): «El poder militar del planeta — 167 países con
//     gasto militar registrado que suman US$ 2,89 billones en el último
//     año con dato; Estados Unidos lidera con US$ 954 mil M, el 33% del
//     total de los países con dato»; las regiones en el ORDEN DE LA
//     FUENTE con sus chips en un solo nodo (lección v274); los fmt del
//     dinero, la gente y el % son reglas derivadas (es-ES); la fecha de
//     la captura viaja como dato de la fuente (guardia v234): el ISO
//     vive en el dataset y la prosa se deriva con el locale; cero años
//     escritos en líneas (la guardia del arco).
// (3) LAS PUERTAS DE LA CASA — el sitemap anuncia /poder (monthly, 0.6)
//     y la paleta Ctrl+K lo lleva (pg:poder, icono Crosshair — ya
//     importado, cero cambios de import); JSON-LD CollectionPage +
//     ItemList con los 167 países; noscript honesto con la línea
//     compuesta; puerta a la sala de guerra (la lectura en vivo).
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 (○ /poder en la tabla) ·
//     health v297.0 db up · pruebas 220/220 (+2 EL PODER MUNDIAL:
//     estática — la captura REAL intacta (167 filas censadas, las 7
//     regiones presentes, cero gasto nulo, los tres indicadores
//     citados), la sala derivada (línea compuesta, chips en un nodo,
//     los tres fmt, la barra contra el líder, la fecha derivada del
//     locale), sin cliente ni fetch ni flagcdn, las puertas (sitemap +
//     paleta) y las guardias; viva — el SSR sirve la línea derivada
//     completa, «Europa y Asia Central ×49», Estados Unidos con su
//     «US$ 954 mil M», India con sus «3,1 M», Ucrania con su «39,6%» y
//     el sitemap VIVO) · BD intocada (1877 cables · 9 hechos, un solo
//     escritor).
// Herencia v296.0 LAS DIVISAS DEL PLANETA y toda la crónica. Guards v167 intactos.
// v301.0 LA BIBLIOTECA OSCURA — la mina que la «Queda» de la v300 señaló
//         (oscura-data, ya servida en /guerra-hoy desde la v63, pendiente
//         solo de sala propia) gana su sala server. La fuente declara en
//         su propia cabeza: «contenido verificado: cada teoría con
//         veredicto REAL/MITO/PARCIAL y fuente real» — y el censo de esta
//         ronda lo mide: 43 entradas (14 teorías · 11 armas-idea · 10
//         civilizaciones · 8 documentos desclasificados), las 43 con su
//         url de archivo público y su fuente declarada (CIA Reading Room,
//         National Archives, NSA, FBI Vault, World History Encyclopedia,
//         NSArchive, Smithsonian, The Black Vault...).
// (1) LA SALA NUEVA: /oscura — patrón /historia (v274) · /armeria (v283)
//     · /archivo-mundial (v293) · /atlas (v294) · /verdad-cruda (v295) ·
//     /divisas (v296) · /poder (v297) · /galeria (v298): prerenderizada,
//     sin cliente, sin BD, indexable. Lo que la sala añade sobre el
//     teaser de /guerra-hoy y la pestaña oscura del aparato: el sistema
//     del veredicto completo (dónde nació · lo que se cuenta · lo que
//     dicen los documentos), las rarezas como rótulos del archivo y CADA
//     ENTRADA ABIERTA a su documento original con enlace real
//     (noopener noreferrer).
// (2) TODO DERIVADO, NADA A MANO — la línea compuesta COMPLETA en JS
//     (lección v256): «La biblioteca oscura — 43 entradas con su fuente
//     real citada: 14 teorías con veredicto, 11 armas-idea que cambiaron
//     la guerra, 10 civilizaciones que aterraron al mundo y desaparecieron,
//     y 8 documentos desclasificados»; veredictos y rarezas EN EL ORDEN
//     DE LA FUENTE con chips en un solo nodo (lección v274); el color del
//     veredicto es regla derivada (el código del teaser de la casa, ahora
//     con su propia función); sin años escritos en líneas (guardia del
//     arco) y sin fechas ISO en la sala (guardia v234).
// (3) LAS PUERTAS DE LA CASA — el sitemap anuncia /oscura (monthly, 0.6)
//     y la paleta Ctrl+K la lleva (pg:oscura, icono EyeOff — un token
//     añadido al import de lucide, el eco de la Camera de la v298);
//     JSON-LD CollectionPage + ItemList de CreativeWork (name +
//     description) con las 43 entradas; noscript honesto con la línea
//     compuesta; puertas honestas al aparato (la pestaña de la Alejandría
//     Oscura, donde cada lectura paga) y al mando (/guerra-hoy, donde la
//     casa la presenta).
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 (○ /oscura en la tabla) ·
//     health v301.0 db up · pruebas 228/228 (+2 LA BIBLIOTECA OSCURA:
//     estática — el dataset intacto (43 entradas censadas por colección,
//     las 43 con url pública y fuente, cero url local, los tres
//     veredictos y las cuatro rarezas dentro de sus dominios), la sala
//     derivada (línea compuesta, chips en un nodo, la función del
//     veredicto, los enlaces con noopener), sin cliente ni fetch, las
//     puertas (sitemap + paleta) y las guardias; viva — el SSR sirve la
//     línea derivada completa, «REAL ×6», «MITO ×3», «PARCIAL ×5»,
//     «LEGENDARIO ×4», «REPTILIANOS», «VENONA», «GATEWAY EXPERIENCE»,
//     «fuente: CIA Reading Room» y el sitemap VIVO) · BD intocada (1877
//     cables · 9 hechos, un solo escritor).
// Herencia v300.0 LA GUARDIA DEL OÍDO y toda la crónica. Guards v167 intactos.
// v298.0 LA FOTOTECA DEL PLANETA — la capa REAL del aparato sale del
//         juego al server: la «Queda» de la v297 pedía clasificación
//         fina para imagenes-data (14 KB, v98 ORO TOTAL, «IMÁGENES
//         REALES (capa REAL del juego), generada automáticamente, cada
//         entrada es una FOTO REAL descargada y servida localmente desde
//         /imagenes-reales/») y la medición la pagó entera: 50 entradas
//         con su etiqueta, su nota editorial y su fuente declarada
//         verbatim (Archivo fotográfico Vanguard ×46 · Rick's Café Noir
//         · Google Arts & Culture · Live Science · NASA Science), y la
//         verificación CONTRA EL DISCO confirma que las 50 fotos existen
//         en public/imagenes-reales/ (11,8 MB) — REAL de pies a cabeza,
//         cero ficción (la capa SIM del juego usa otras ilustraciones,
//         declara la propia fuente). Sala nueva /galeria, patrón
//         /historia (v274) · /armeria (v283) · /archivo-mundial (v293) ·
//         /atlas (v294) · /verdad-cruda (v295) · /divisas (v296) ·
//         /poder (v297): prerenderizada ○, sin cliente, sin BD. Botín:
//         las 5 categorías EN EL ORDEN DE LA FUENTE (primera aparición:
//         armas, archivo, poder, lugares, civilizaciones) con chips
//         «Lugares ×19» en un solo nodo (lección v274) y las 50 tarjetas
//         con su foto local (lazy), su nota y su fuente.
// (1) LA CLASIFICACIÓN CONTRA EL DISCO — por primera vez la guardia
//     mira el SISTEMA DE FICHEROS: las 50 rutas del dataset existen en
//     public/ (la prueba lo verifica con fs.existsSync); el claim REAL
//     se mide, no se lee (lección v292 en su forma más dura).
// (2) TODO DERIVADO, NADA A MANO — la línea compuesta COMPLETA en JS
//     (lección v256): «La fototeca del planeta — 50 fotografías reales
//     servidas localmente en 5 categorías, de «Arco compuesto» a
//     «Cohete V-2»» — primera y última derivadas del orden de la
//     fuente; las categorías y sus chips derivadas (lección v274);
//     cero años escritos en líneas (guardia del arco); las fotos son
//     locales (cero hotlinking, cero flagcdn).
// (3) LAS PUERTAS DE LA CASA — el sitemap anuncia /galeria (monthly,
//     0.6) y la paleta Ctrl+K la lleva (pg:galeria, icono Camera — un
//     token añadido al import de lucide); JSON-LD CollectionPage +
//     ItemList de ImageObject (name + contentUrl + caption); noscript
//     honesto; puerta al aparato (el visor interactivo con búsqueda y
//     filtros, imagenes-panel).
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 (○ /galeria en la tabla) ·
//     health v298.0 db up · pruebas 222/222 (+2 LA FOTOTECA DEL
//     PLANETA: estática — el dataset intacto (50 entradas censadas, 5
//     categorías, cero src remota, las 50 fotos verificadas contra el
//     disco), la sala derivada (línea compuesta con primera y última,
//     chips en un nodo, img local lazy), sin cliente, las puertas
//     (sitemap + paleta) y las guardias; viva — el SSR sirve la línea
//     derivada completa, «lugares ×19», «archivo ×10», «poder ×5»,
//     «Arco compuesto», «Cohete V-2», la foto local del arco viaja en
//     el HTML y el sitemap VIVO) · BD intocada (1877 cables · 9 hechos,
//     un solo escritor).
// Herencia v297.0 EL PODER MUNDIAL y toda la crónica. Guards v167 intactos.
// v300.0 LA GUARDIA DEL OÍDO — la ronda que BLINDA la orden del Dueño: la
//         v299.0 arregló el oído entero (bug, letra, vida, permiso, carriles)
//         y esta ronda hace que NUNCA pueda romperse sin que la suite lo
//         grite. Tres cerrojos nuevos (+2 pruebas, 226):
// (1) EL PERMISO RECUPERABLE — la fila permanente de MICRÓFONO dentro del
//     panel de VG-ASSIST (asistente-voz.tsx): estado REAL del aparato vía
//     navigator.permissions.query({name:"microphone"}) con onchange en vivo,
//     y el botón PEDIR PERMISO que abre el diálogo del navegador con
//     getUserMedia (tracks soltados al instante) — la cura del «no-allowed»
//     silencioso: si el candado bloqueó el oído, hay camino de vuelta sin
//     salir de la casa. La tarjeta v299 pregunta una vez; la fila v300
//     permanece: estado + recuperación para siempre.
// (2) EL CARRIL DEL COFRE queda guardado — la suite fija el cofre en su
//     lane de 8px (bottom-2 right-2, z-30, data-vg-retencion="cofre"): la
//     queja literal del Dueño («el cofre opaca el botón de música») no
//     podrá regresar sin que una prueba roja lo grite.
// (3) LA COEXISTENCIA de las dos puertas del micrófono queda declarada:
//     la tarjeta (v299, pedido proactivo UNA vez) y la fila (v300, estado
//     permanente + recuperación) son complementarias — la suite las vigila
//     juntas.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 · health v300.0 db up ·
//     pruebas 226/226 (+2 LA GUARDIA DEL OÍDO: estática — la fila de
//     micrófono con estado real y PEDIR PERMISO dentro del panel, el carril
//     del cofre fijado, las dos puertas del oído coexistiendo; viva — health
//     v300 y el home cantando la guardia) · BD intocada (1877 cables ·
//     9 hechos, un solo escritor).
// Herencia v299.0 LA VOZ DE VANGUARD y toda la crónica. Guards v167 intactos.
// v299.0 LA VOZ DE VANGUARD — la ronda del OÍDO (mandato directo del Dueño:
//         «la música se bugea, es fea, no hay letra, no es única, los sonidos
//         predeterminados sin vida, Vanguard un mundo sordo, la voz de
//         Vanguard no tiene permiso para hablarle en audio y el cofre opaca
//         el botón de música — arregla todo eso»). Cinco frentes, un solo
//         oído:
// (1) EL BUG CAZADO Y MUERTO (conflict-music.ts) — el secuenciador miraba
//     0.24 s adelante con un tick de 45 ms: en segundo plano el navegador
//     throttea el timer, nextTime quedaba en el pasado y al volver el
//     catch-up AMETRALLABA decenas de notas viejas — EL BUG QUE SE OÍA.
//     Ahora: mirada de 1.2 s (MIRADA_ADELANTE_S), tick de 120 ms (TICK_MS)
//     y RESYNC MUSICAL — si el reloj murió, la obra salta AL COMPÁS
//     SIGUIENTE (helpers puros siguienteCompas/debeResync, probados).
//     Además: CARRERA DE FUNDIDOS eliminada (fadeSeq — el crossfade viejo
//     se retira si llega un mando nuevo) y el arranque limpio LEVANTA el
//     master si un fundido lo dejó en el suelo (pausar durante un fundido
//     dejaba la radio MUDA).
// (2) LA LETRA DE LA CASA (letra-vanguard.ts NUEVO) — las 34 obras de la
//     ORQUESTA DE ORO cantan SU letra propia (intro · verso · verso II ·
//     respiro · puente · cadencia), sincronizada al compás real por el
//     secuenciador (parteDeCompas, UNA fuente para letra y canto). El
//     karaoke vive en la píldora (data-vg-letra) y en el Auditorio el
//     CANCIONERO (data-vg-cancionero) con la parte en marcha iluminada.
// (3) SONIDOS CON VIDA (sound.ts) — cada golpe llevaba frecuencia y
//     ganancia IDÉNTICAS (robot): ahora HUMANIZACIÓN viva (velocidad ±8%,
//     afinación ±0.4-1.2%) en playTone/playWood/playBell. Y nace
//     sfx.himno(): la LLAMADA DE LA CASA (motivo Gloria raíz·raíz·raíz→
//     octava→5ª) que suena cuando el oído recibe su permiso.
// (4) EL PERMISO DE HABLARLE (permiso-mic.tsx NUEVO) — la tarjeta gemela
//     de la v201: Vanguard pide el MICRÓFONO por adelantado con un gesto
//     limpio (getUserMedia + soltar tracks al instante) para que tocar el
//     orbe sea hablar y no negociar con el candado. Coordinada con la
//     boca (la boca manda, luego el oído) y con el ritual v214; el orbe
//     llama a la tarjeta AL INSTANTE si topa un not-allowed.
// (5) LOS CARRILES DE LA ESQUINA — el cofre (8px), la radio (56px) y el
//     orbe (104px) convivían en el MISMO borde y se tapaban (el Dueño lo
//     cantó: «el cofre opaca el botón de música»): ahora cada uno tiene
//     SU carril en móvil y escritorio, y las tarjetas de permiso escalan
//     por encima sin pisar nada.
// BONUS EL MUNDO ESCUCHA — setPulsoMundo(tensión real / 100) cada 5 s
//     mientras suena la Radio: el drone se abre (filtro +0..300 Hz) y el
//     corazón de la sala late al empezar sección cuando el mundo arde.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 (○ en la tabla) ·
//     health v299.0 db up · pruebas 224/224 (+2 LA VOZ DE VANGUARD:
//     estática — la LETRA cubre las 34 obras (verso A no vacío, la
//     herencia A2/B cae a la línea previa, parteDeCompas mapea el ciclo
//     real del motor), los helpers puros del RESYNC (siguienteCompas
//     alinea al compás, debeResync marca el retraso muerto), el motor
//     declara mirada 1.2 s, los carriles separados (cofre 8px · radio
//     sm:bottom-14 · orbe 104px) y la tarjeta del oído con su himno;
//     viva — la píldora sirve data-vg-letra, el cancionero y el carril
//     del orbe en el HTML) · BD intocada (1877 cables · 9 hechos, un
//     solo escritor).
// Herencia v298.0 LA FOTOTECA DEL PLANETA y toda la crónica. Guards v167 intactos.
// v302.0 EL MUNDO RESPIRA — la cola viva del oído (v300) se sirve: el
//         ambiente del mundo con la radio APAGADA. La v299 le dio voz al
//         mundo mientras la Radio suena (setPulsoMundo); esta ronda le da
//         ALIENTO cuando la radio descansa — la sala nunca vuelve a estar
//         muerta. NUEVO src/lib/ambiente-mundo.ts (Web Audio, cero assets,
//         cero copyright — la ley de la casa):
// (1) LO QUE SUENA: un drone grave que sigue la tensión real del planeta
//     (D2 + quinta con deriva lenta, el filtro se abre con getTension —
//     hermano del pulso v299), un ALIENTO de ruido marrón filtrado que
//     entra y sale lento (~14 s, el mundo inhalando/exhalando), un LATIDO
//     distante cuya frecuencia crece con la tensión (siguienteLatido puro:
//     calma ~30 s → mundo ardiendo ~10 s, deriva humana ±25%) y una SEÑAL
//     lejana (campana FM en Re6 — la marca de un cable que llega,
//     siguienteSenal: 45 s → 20 s). El carácter del mundo tiene lengua
//     propia: dormido · respira · late · arde (caracterMundo puro).
// (2) LAS LEYES DEL MOTOR: CANDADO DE GESTO (el AudioContext nace solo
//     dentro del clic del botón MUNDO, o al primer gesto si el Dueño lo
//     dejó querido — resumeAmbienteSiQuerido, la ley v217 del autoplay);
//     CESIÓN A LA RADIO (si la obra suena, el mundo se aparta con fade y
//     queda «en-espera»; cuando la radio descansa, el mundo vuelve si el
//     Dueño lo dejó — el mundo JAMÁS pisa la obra); SIN RÁFAGAS (lección
//     v299: el latido y la señal no acumulan deuda — el próximo golpe se
//     cuenta desde AHORA, el mundo late tarde, nunca ametralla); estado
//     honesto consultable (apagado · en-espera · vivo) con suscripción.
// (3) LA PÍLDORA Y EL 4.º MODO: botón MUNDO (icono Waves, data-vg-mundo)
//     en la fila de la radio — cyan cuando vive (el color de la familia
//     ambiente de la casa), con parpadeo suave; y el 4.º modo EL MUNDO
//     RESPIRA junto a CINE/ESCENA/SESIÓN en el panel expandido, con el
//     estado honesto (· ON · · EN ESPERA) y toasts que dicen la verdad.
//     Persistencia propia vg_ambiente_v302. La esquina respira sin pisar
//     a nadie: los carriles de la v299 intactos.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 (○ en la tabla) ·
//     health v302.0 db up · pruebas 230/230 (+2 EL MUNDO RESPIRA:
//     estática — el motor con sus helpers puros censados (caracterMundo,
//     intensidadAmbiente, siguienteLatido, siguienteSenal), el candado de
//     gesto (resumeAmbienteSiQuerido + persistencia vg_ambiente_v302), la
//     cesión a la radio (isMusicPlaying + subscribeMusic), el sin-ráfagas
//     de la lección v299, la píldora con su botón data-vg-mundo y el
//     4.º modo; viva — el home canta EL MUNDO RESPIRA v302.0 y el health
//     lo respira) · BD intocada (1877 cables · 9 hechos, un solo
//     escritor).
// Herencia v301.0 LA BIBLIOTECA OSCURA y toda la crónica. Guards v167 intactos.
// v303.0 LA PLANTILLA COMPLETA — la expansión del módulo EMPLEOS (la mina
//         primera de la cola del almacén en cuatro «Queda»s seguidas): la
//         sala de juego ya existía (pestaña del aparato desde la v85) —
//         esta ronda la EXPANDE, la ACTUALIZA y la DESARROLLA (la directiva
//         del autociclo: «ve a cada módulo y expándelo»):
// (1) CUATRO OFICINAS NUEVAS (4 → 8 departamentos, 24 → 48 tareas reales):
//     LOGÍSTICA (Táctica, 2.1ⓒ/min — convoys, stocks, el invierno),
//     TRANSMISIONES (Geografía, 2.2 — repetidores, jamming, el espectro),
//     CONTRAINTELIGENCIA (Análisis, 2.7 — desertores, filtraciones,
//     desinformación) y PRENSA DE GUERRA (Diplomacia, 2.2 — partes,
//     corresponsales, el frente que todos ven).
// (2) VACANTES DE RRHH (cura estructural): la entrevista ya no entrega la
//     PRIMERA oficina de la aptitud ganada (los nuevos eran inalcanzables
//     — find d.apt === mejor) — ahora la aptitud abre el selector de
//     VACANTES (VacantesChooser) con TODAS las oficinas de esa aptitud y
//     el operador elige la suya; si solo hay una, entra directo.
// (3) EL CONTRATO DE LA SEMANA: encargo determinista por (oficina,
//     semana ISO — weekKeyOf, la fórmula probada de retention v58) que
//     comparte TODA la plantilla: N turnos con M perfectos → bono
//     300..700ⓒ; helpers PUROS probados (contratoDeSemana, claveContrato,
//     8 títulos de encargo), progreso en EmpleosState (4 campos nuevos,
//     retrocompatible por el spread de loadEmpleos), tarjeta propia en el
//     panel (data-vg-contrato) con barra de progreso y cobro idempotente,
//     fila en la sala 3D con acción «cobrar bono».
// (4) LA ESCALA DE CARRERA SUBE: +2 rangos (SUBDIRECTOR 2200 XP ×2.8 ·
//     MARISCAL DE LA CASA 3400 XP ×3.6) — 7 escalones.
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 (○ en la tabla) ·
//     health v303.0 db up · pruebas 232/232 (+2 LA PLANTILLA COMPLETA:
//     estática — las 8 oficinas censadas con sus 48 tareas (56 q: = 8 de
//     entrevista + 48 de turno), los 7 rangos ascendentes, los helpers
//     puros del contrato (weekKeyOf/contratoDeSemana/claveContrato + 8
//     títulos), los 4 campos de estado retrocompatibles, el selector de
//     vacantes y la tarjeta del contrato en el panel; viva — el home canta
//     LA PLANTILLA COMPLETA v303.0 y el health la firma) · BD intocada
//     (1877 cables · 9 hechos, un solo escritor).
// Herencia v302.0 EL MUNDO RESPIRA y toda la crónica. Guards v167 intactos.
// v304.0 LA MANO DE LA FORTUNA — la expansión del módulo FORTUNA (la mina
//         primera de la «Queda» v303; como con empleos, la medición la
//         corrigió: no hay fortuna-data.ts, la mina es fortuna.ts, el motor
//         de recompensas de la v84 que paga TODOS los premios de la casa).
//         Esta ronda le pone LA MANO ENCIMA (todo aditivo, la v84 sigue
//         girando igual cuando no hay mano):
// (1) LA HORA DORADA — la hora de suerte del día, DETERMINISTA por fecha
//     UTC (seed FNV-1a: la casa entera comparte la misma hora): durante
//     ella todo pago elegible gana ×1.5 adicional; helpers puros probados
//     (horaDorada acepta Date, MULT_HORA_DORADA).
// (2) LA LÁSTIMA DE LA CASA (pity) — la racha de pagos secos calienta la
//     ruleta: a partir de 35 pagos sin golpe la probabilidad sube +0.01
//     por pago seco hasta el techo 0.5 (probGolpe puro: base 0.14, la
//     histórica de la v84); las tres puertas ×2/×3/×5 escalan juntas.
// (3) EL LIBRO DE LA FORTUNA — la memoria persistente de la suerte
//     (vg_fortuna_v304, try/catch: el libro jamás tumba el pago): racha
//     seca, golpes ×2/×3/×5, extra total regalado y el mayor golpe; el
//     gancho de addCoins escribe (registrarFortuna / registrarPagoSeco)
//     y la TIENDA lo muestra (tarjeta data-vg-libro-fortuna con la hora
//     dorada de hoy, el calor de la ruleta y el botín histórico).
// (4) EL RESULTADO HONESTO — FortunaResultado gana elegible (los
//     consumidores viejos no lo leen): el game-store distingue el pago
//     elegible seco del monto menor; el motivo compuesto cuenta la
//     verdad completa («GOLPE DE FORTUNA ×3 · LA HORA DORADA ×1.5»).
// QA: tsc 0 TOTAL · eslint 0 · build EXIT 0 · health v304.0 db up ·
//     pruebas 234/234 (+2 LA MANO DE LA FORTUNA: estática — la hora
//     dorada determinista, la lástima con su escalera y techo, el libro
//     persistente, el gancho del game-store y la tarjeta de la tienda;
//     viva — el home canta LA MANO DE LA FORTUNA v304.0 y el health la
//     firma) · BD intocada (1877 cables · 9 hechos, un solo escritor).
// Herencia v303.0 LA PLANTILLA COMPLETA y toda la crónica. Guards v167 intactos.
// v305.0 LA AUDITORÍA DE ACERO — el mandato del Dueño: «Actúen como un
//         equipo élite de ingenieros… auditen todo el proyecto, detecten
//         errores, mejoren el rendimiento… NO eliminen funciones, NO
//         destruyan código; si una mejora es arriesgada, documentenla sin
//         aplicarla». La auditoría midió TODO el árbol (tsc strict, eslint
//         completo — nunca antes corrido a fondo: solo los ficheros
//         tocados de cada ronda —, fugas de memoria, SSR, XSS, refs en
//         render, escapes de tipo) y pagó la primera tanda:
// (1) ERRORES CORREGIDOS (5 ficheros, eslint errors 26 → 19):
//     · signos-vitales: refs LEÍDAS Y ESCRITAS durante el render (pobl —
//       el delta de nacimientos nace ahora en el reloj, render puro) y el
//       reloj DOBLE absorbido en uno solo (el intervalo viejo seguía
//       corriendo junto al nuevo: la casa crecía al doble de pulso).
//     · experimental-panel: pose.current leído en el style del render —
//       el cursor grabbing es STATE (onDown/onUp lo escriben).
//     · centinela-panel: dos dependencias de useMemo con EXPRESIONES
//       complejas (reloj < 60 ? 0 : 1, Math.floor(reloj / 300)) —
//       precalculadas fuera, el compilador ya no renuncia.
//     · duelo-pvp: interface vacía extendiendo su supertipo (type alias).
//     · en-vivo-panel: el reloj de GRABACIÓN sobrevivía al desmontaje
//       (navegación a mitad de directo = interval huérfano) — cleanup de
//       desmontaje que respeta el stop del usuario.
// (2) TIPOBLINDAJE — coerciones ciegas reales 11 → 9: la guardia de hudTheme en
//     buyCosmetic (un id ajeno al catálogo ya no entra al persist forzado)
//     y el tema de la tienda con su tipo exacto. Los 4 accesos forzados a
//     las cookies del req en las rutas API (residuo de la migración Next 15,
//     camino de auth) DOCUMENTADOS SIN TOCAR — riesgo medio en la sesión.
// (3) LO QUE LA AUDITORÍA MEDICIÓN LIMPIO: CERO directivas de supresión de
//     tipos (ignora/espera-error/sin-revisar) en TODO el árbol; los 10 dangerouslySetInnerHTML
//     pasan TODOS por jsonLdSeguro() o CSS/script estático (sin XSS);
//     addEventListener y setInterval/clearInterval emparejados en los 124
//     ficheros client (los 7 sospechosos auditados uno a uno — todos
//     falsos positivos: dobles clears en una línea, refs de grabación y
//     el latido singleton deliberado de presence-ping).
// (4) EL BLINDAJE — la suite censa los anti-patrones (escapes de tipo ≤
//     9, cero ts-ignore) y los 5 ficheros reparados: la auditoría no es
//     una ronda, es una LEY — ningún escritor paralelo puede volver a
//     meter una coerción ciega o un ts-ignore sin que la suite lo grite.
// QA: tsc 0 TOTAL · eslint 19 errores→barridos los reparables de la ronda
//     (los 17 set-state-in-effect restantes y las 4 memorias del compilador
//     DOCUMENTADOS SIN APLICAR — tocan rutas de hidratación/arranque) ·
//     build EXIT 0 · health v305.0 db up · pruebas 236/236 (+2 LA
//     AUDITORÍA) · BD intocada (1877 cables · 9 hechos).
// Herencia v304.0 LA MANO DE LA FORTUNA y toda la crónica. Guards v167 intactos.
// v306.0 EL AIRE DEL PERMISO — la SEGUNDA cuchilla del mandato del Dueño
//         (auditar todo, detectar errores, documentar lo arriesgado sin
//         aplicarlo): la auditoría v305 documentó pendientes; esta ronda los
//         PAGA y caza un CONFLICTO P0 que nadie había visto:
// (1) EL P0 — LA CABECERA QUE ESTRANGULABA LA VOZ: la ciudadela v102 puso
//     «microphone=()» en Permissions-Policy (prohibir el micrófono A TODO EL
//     MUNDO) en la era sin voz; la v299 LA VOZ DE VANGUARD le dio al
//     operador la palabra y NADIE volvió a mirar la cabecera — el navegador
//     (Chrome/Edge) mata el getUserMedia con NotAllowedError ANTES de
//     mostrar el permiso: la tarjeta PEDIR PERMISO pedía algo que la casa
//     ya le había negado por escrito. Cura: microphone=(self) — la casa
//     confía en su propia sala y nadie externo habla con ella. Las demás
//     cabeceras de la v102 intactas (X-Frame-Options, nosniff, Referrer,
//     geolocation=(self), payment=()).
// (2) LAS 9 COERCIONES FINALES — CERO ley (la v305 documentó, esta ronda
//     aplica): las 4 rutas de sesión (agente, ugc, ugc/[id], contrib/[id])
//     tipadas con NextRequest — req.cookies NACE con la cookie, la
//     coerción ciega desaparece del camino de auth; el consejo usa la forma
//     ya tipada de extractJson (Record<string, unknown>) y el modelo
//     deliberador con su forma declarada (intervenciones/votos/decreto);
//     el prefijo webkitAudioContext de Safari por la puerta con unknown.
//     EL CENSO DE LA SUITE SE APRIETA: coerciones «≤ 9» → «CERO» — ninguna
//     coerción ciega puede volver a nacer en el árbol.
// (3) DOCUMENTADO SIN APLICAR (se mantiene del informe v305): los 17
//     set-state-in-effect (quirurgía de hidratación, una por ronda —
//     verificado: growth-share es el patrón #418 DELIBERADO) y las 4
//     memorias del compilador.
// QA: tsc 0 TOTAL · censo de coerciones 0 · eslint 0 errores en los 7
//     tocados · build EXIT 0 · health v306.0 db up · pruebas 238/238 (+2 LA
//     POLÍTICA DEL AIRE) · BD intocada (1877 cables · 9 hechos).
// Herencia v305.0 LA AUDITORÍA DE ACERO y toda la crónica. Guards v167 intactos.
// v307.0 LA LEY DE LA VELOCIDAD — la TERCERA cuchilla del mandato del Dueño
//         («mejoren el rendimiento… No se limiten a corregir: innoven»): la
//         casa tenía velocímetro (v238) y familia reunida (v244) pero NADIE
//         velaba la reunión — y la medición lo probó:
// (1) EL HALLAZGO MEDIDO: la ruta /vanguard2 importaba su motor de forma
//     ESTÁTICA — three.js viajaba en el grafo INICIAL de la ruta (chunk
//     ~720 KB con el núcleo completo, fuera del alcance del cacheGroup
//     «familia-tres» chunks:"async" de la v244): la casa pagaba DOS copias
//     del motor (la familia reunida 1.6 MB + esta suelta ~720 KB crudos).
//     Cura LA ISLA DEL UNIVERSO (mismo patrón de mundo-3d-vivo): grafo
//     asíncrono, el motor reúne con su familia, la copia duplicada muere.
// (2) EL PRIMER CENSO DE VELOCIDAD de la casa: portada 2.05 MB crudos de JS
//     inicial en 28 ficheros (react+router ~380 · catálogo de pestañas 471 ·
//     pila framer ~430 · i18n/editorial ~273 · polyfills 110 · catálogos de
//     juego 63 · pegamento de la app el resto) · 422 chunks perezosos
//     (12.1 MB totales, code-split sano) · sondeo en vivo honesto (presence
//     30 s · tensión 12 s · notis 180 s · cables 7 s · pulso 1 s VISIBLE).
// (3) LA LEY (el blindaje permanente): la suite censa el BUILD — los chunks
//     > 300 KB que llevan CÓDIGO del motor (marcador honesto
//     isPerspectiveCamera|isMesh) deben ser EXACTAMENTE UNO y llamarse
//     familia-tres: ninguna segunda copia del motor puede volver a nacer
//     sin que la suite lo grite. El ritual del lint COMPLETO (v305 pedía
//     «cada N rondas») corre en la apertura de la ronda: 19 errores, los
//     mismos documentados — CERO errores nuevos en el árbol.
// QA: tsc 0 TOTAL · eslint 0 errores (tocados) · build EXIT 0 · health
//     v307.0 db up · pruebas 240/240 (+2 LA LEY DE LA VELOCIDAD) · BD
//     intocada (1877 cables · 9 hechos).
// Herencia v306.0 EL AIRE DEL PERMISO y toda la crónica. Guards v167 intactos.
// v308.0 EL ESPEJO DEL NAVEGADOR — la CUARTA cuchilla del mandato del Dueño
//         (auditar todo, innovar, perfeccionar cada detalle): las tres cuchillas
//         anteriores midieron el CÓDIGO (acero/aire/velocidad) — esta mide lo que
//         el usuario vive: EL RENDER VIVO. Nadie había puesto la casa delante de
//         un espejo.
// (1) EL INSTRUMENTO NUEVO: scripts/auditoria-render-v308.sh — arranca la casa
//     de verdad (standalone, puerto 3496), la recorre con un navegador real
//     (6 salas: inicio y universo en escritorio, mercado, empleos, inicio y
//     vértigo en móvil 390×844) y censura por sala: errores de página, consola
//     y desborde horizontal (scrollWidth vs clientWidth). Cierre por PID
//     (ley v302: arranque+auditoría+cierre en UNA llamada). Instrumento
//     REPETIBLE: el espejo puede mirar a la casa cada N rondas.
// (2) EL VEREDICTO HONESTO: la casa viva está LIMPIA — cero errores de página
//     en las 6 salas, cero desbordes (1440 y 390 px), y UNA herida en la
//     consola del universo: THREE.Clock DEPRECADA («Please use THREE.Timer
//     instead») — 6 motores 3D (teatro-global, teatro-guerra, drone-strike,
//     hangar, zc3d y el motor del universo) usaban una API que three 0.185
//     marca muerta: cuando la quite, la casa entera en 3D se queda sin tiempo.
// (3) LA CURA — EL RELOJ PROPIO (src/lib/reloj-tres.ts): RelojTres, reloj
//     interno con la SEMÁNTICA EXACTA de THREE.Clock (primer getDelta = 0,
//     acumulación en elapsedTime, performance.now, nada recortado — el techo
//     0.05 lo sigue poniendo cada motor): los 6 motores dejan de depender de
//     una API muerta sin cambiar ni una línea de su comportamiento. La
//     advertencia muere en la consola del universo.
// (4) LA LEY (el blindaje permanente): la suite vela que la casa no construye
//     APIs deprecadas del motor — censo de CONSTRUCCIONES del reloj deprecado
//     EXACTAMENTE CERO en todo el árbol (el censo cuenta construcciones, no
//     menciones — esta crónica misma fue la QUINTA víctima del trap: la frase
//     que declaraba la ley llevaba el constructor literal y el censo la contó;
//     lección v306 elevada a ley de prosa: los informes no escriben código)
//     — y en el BUILD, la marca del reloj deprecado («use THREE.
//     Timer instead», string único del núcleo de three que sobrevive a la
//     minificación — MEDIDO: tree-shaking no la quita, three viaja entero en
//     su barrel) viaja en EXACTAMENTE UN chunk, la familia reunida v244: si
//     la casa volviera a pagar una segunda copia del motor, la marca aparecería
//     en DOS chunks y la suite lo gritaría. Segundo marcador independiente
//     del censo v307 (isPerspectiveCamera|isMesh).
// QA: tsc 0 TOTAL · eslint 0 errores (tocados) · build EXIT 0 · health
//     v308.0 db up · pruebas 242/242 (+2 EL ESPEJO DEL NAVEGADOR) · espejo
//     vivo: 6 salas limpias · BD intocada (1877 cables · 9 hechos).
// Herencia v307.0 LA LEY DE LA VELOCIDAD y toda la crónica. Guards v167 intactos.
// v309.0 LA PRIMERA QUIRURGÍA — el pago de la deuda documentada: de los 15
//         setState-en-efecto censados (v305/v307), la casa opera el PRIMERO
//         con QA visual propio — el riel de sección (v170): su puerta de
//         hidratación y su plegado persistente viven ahora en TIENDAS
//         EXTERNAS CANÓNICAS (useSyncExternalStore con server snapshot, la
//         forma que el propio lint y react.dev piden) en vez de efectos que
//         escriben estado: el HTML del server no miente (riel desplegado en
//         el SSR), React re-compara el snapshot al montar y re-renderea una
//         vez, y el plegado se lee por snapshot con suscripción. REGALO DE
//         LA QUIRURGÍA: el plegado ahora SYNCHRONIZA ENTRE PESTAÑAS (evento
//         storage de las otras + evento propio para la misma). La deuda baja
//         15 → 13. QA VISUAL PROPIO (la regla de la casa): SSR desplegado,
//         plegar→memoria→recarga→sobrevive→desplegar, fila cero de
//         favoritos con la basura filtrada (llave inválida ignorada),
//         consola limpia sin errores de hidratación, cero zombis.
//         growth-share queda INTOCABLE (patrón deliberado, lección v306).
// v309.0 (2) LA VALLA DEL ARCHIVO — la herida P0 de la ronda, cazada con
//         medición: la PODA v84 (ventana de 6 días, «la BD queda pequeña y
//         siempre reciente») cosechó 1600 cables en UN refresco (1877→422,
//         medido con testigo) cuando el refresco logró salir a red tras
//         semanas de candado/ bloqueo — y el archivo que las salas v261
//         (paginación) v262 (canal) v263 (creciente) v288/v289 (pulso) y el
//         sitemap v269 (piso 1800 puertas, «el archivo entero») declararon
//         PROFUNDO quedó hueco: la suite lo gritó (6 pruebas vivas caídas).
//         RECONSTRUCCIÓN con histogramas: el canon tenía 1800 cables con
//         fecha INTEGER (época) y 77 con fecha TEXT (SQL crudo) — en SQLite
//         TEXT es siempre mayor que INTEGER, así que la poda JAMÁS pudo
//         comerse los 77: eran inmortales; los 1600 cosechados eran los
//         INTEGER viejos. La contradicción era de ERAS: la poda v84 (archivo
//         pequeño) contra el archivo profundo de las salas v261+. CURA
//         ADITIVA (ninguna función eliminada): LA VALLA — la poda sigue
//         podando (ventana y exclusión de curadas intactas) pero NUNCA baja
//         del piso del archivo (PISO 1900 > 1800, la ley v269 con margen):
//         mide el excedente y cosecha SOLO ese excedente, los más viejos
//         primero, por ids exactos. Archivo sano: reciente Y profundo. El
//         archivo cosechado se RESTAURÓ del canon (git, 1877 · integridad
//         ok) — la cosecha había sido un efecto de las visitas del QA, no
//         del tráfico real.
// QA: tsc 0 TOTAL · eslint 0 errores (tocados) · censo 15 → 13 · build
//     EXIT 0 · health v309.0 db up · pruebas 245/245 (+3 LA PRIMERA
//     QUIRURGÍA ×2 + LA VALLA DEL ARCHIVO) · BD intocada (1877 cables ·
//     9 hechos, testigo ANTES/DESPUÉS con la valla viva).
// Herencia v308.0 EL ESPEJO DEL NAVEGADOR y toda la crónica. Guards v167 intactos.
// v310.0 LA SEGUNDA QUIRURGÍA — la deuda sigue pagándose (13 → 12): el
//         paciente es la puerta de rehidratación del BONO DIARIO (v135, la
//         cura de la carrera #418): su espera del REHIDRATADOR v132 vivía en
//         un efecto que escribía estado — ahora vive en la TIENDA EXTERNA
//         que siempre fue: useSyncExternalStore lee la bandera de hidratación
//         del persist (booleano primitivo, estable) y se suscribe al aviso
//         de fin de hidratación — el patrón que los propios docs de zustand
//         piden. La tabla de decisiones de la v135 queda EXACTA (calco
//         verificado por hexdump): sin persist, ya hidratado o fallo →
//         hidratado (el bono no queda encerrado jamás); si falta, el aviso
//         del REHIDRATADOR despierta el snapshot; server snapshot falso — el
//         SSR jamás abre el bono. LECCIÓN DE LA RONDA: el trap del substring
//         (v307) volvió a morder a tres lectores seguidos sobre la MISMA
//         línea (`const [h…` sin el corchete) — el hexdump volvió a ser la
//         única verdad: la casa estaba sana. Y el QA VISUAL cazó DOS
//         trampas del propio arnés antes de dar veredicto: la semilla del
//         store llevaba una versión vieja (el persist la descarta y miente)
//         y el detector de diálogo cazaba a la INTRO DEL CINE en vez del
//         bono — el detector ahora busca el título del bono por su nombre.
//         QA VISUAL: SSR mudo (cero diálogos) · operador que YA reclamó hoy
//         → el bono NO reaparece (la cura v135 preservada) · operador nuevo
//         → el bono ABRE tras la rehidratación y el aterrizaje (medido a los
//         15 s) · consola limpia sin errores de hidratación.
// v310.0 (2) LAS CIFRAS VIVAS — la segunda herida de la ronda, destapada
//         por el propio QA: con la red abierta, la casa ingesta cables en
//         cada refresco (+23 medidos en una ronda) y los conteos del archivo
//         RESPIRAN — pero 6 pruebas vivas de la suite congelaban cifras de
//         un momento de la BD (una tarjeta medía 307, un chip 173, una
//         paginación 5 páginas): pasaron durante semanas SOLO porque la red
//         del sandbox estaba bloqueada y el archivo no respiraba. LA LEY
//         VIVA: las cifras del archivo se LEEN del servidor vivo y se
//         verifica su SANIDAD Y SU DERIVACIÓN — cada citado aportó ≥ 1
//         titular, la paginación obedece a la count real (techo peso/40),
//         el noscript discrepa jamás de su línea, y las dos salas (el chip
//         del canal y la sala del teatro) miden el MISMO archivo y se ponen
//         de acuerdo. Los umbrales congelados (≥ 1800 puertas del sitemap,
//         piso 1900 de la valla) quedan: son LEYES de la casa, no alientos.
// QA: tsc 0 TOTAL · eslint 0 errores (tocados) · censo 13 → 12 · build
//     EXIT 0 · health v310.0 db up · pruebas 247/247 (+2 LA SEGUNDA
//     QUIRURGÍA) · BD intocada (1877 cables · 9 hechos, valla viva).
// Herencia v309.0 LA PRIMERA QUIRURGÍA y toda la crónica. Guards v167 intactos.
// v311.0 LA TERCERA QUIRURGÍA — la deuda sigue pagándose (12 → 11): el
//         paciente es el corte de la VOZ DEL PARTE en el CRONOATLAS
//         (v118/v119, el panel de la máquina del tiempo): al cambiar de día
//         el parte se calla y el aviso del botón vuelve a «Escuchar» — esa
//         cura vivía en un efecto que escribía estado. HOY LA PUREZA SE
//         DIVIDE, la forma canónica que react.dev prescribe cuando un valor
//         cambia y el estado debe volver a cero («quizá no necesitas un
//         efecto»): el corte del AUDIO es un efecto secundario legítimo y
//         permanece en un efecto que ya NO escribe estado; el reset del
//         AVISO se ajusta DURANTE EL RENDER — el componente guarda el día
//         previo que ya vio y, si el día cambió, corrige su propio estado
//         en el render en curso: React descarta ese render y re-renderea
//         una vez antes de pintar, sin cascada y sin efecto escritor. El
//         contrato de la lib de voz («cambiar de día la corta») queda
//         EXACTO, y el reproductor con sus seis focos de cambio de día
//         queda intocado (la centralización del corte en las transiciones
//         se DESCARTÓ tras el análisis de dependencias: seis focos, dos de
//         ellos dentro del latido del autoplay — un corte descentralizado
//         era una cura con seis puntos de fallo). SEGUNDA HERRAMIENTA DE
//         LA CASA: las dos cirugías anteriores (el riel de sección en la
//         v309, el bono diario en la v310) usaron la TIENDA EXTERNA
//         canónica porque eran puertas de hidratación; esta tercera estrena
//         el AJUSTE DURANTE EL RENDER para los reseteos de estado que no lo
//         son — cada paciente recibe la forma que su enfermedad pide, no la
//         única que la casa sabe.
// v311.0 (2) LA MEDICIÓN HONESTA — la higiene del linter: el censo del
//         árbol completo arrojaba 4385 problemas (35 errores) y ahogaba la
//         señal: dos territorios SIN ignorar contaminaban la medida — el
//         scratch de QA (artefactos minificados que un arnés dejó en la
//         casa, fuera del git, 4350 avisos de ruido) y el ARCHIVO CONGELADO
//         del legado v69 (código histórico que NADIE importa; su lint es
//         arqueología, no señal). Ambos entran en la lista de ignorados del
//         linter con su crónica: NINGUNA función eliminada, NINGÚN código
//         vivo tocado — solo se acota el alcance para que el baseline del
//         árbol vuelva a ser comparable entre rondas. Baseline honesto
//         nuevo: 15 errores (11 de efecto-escritor + 4 memorias) y los
//         avisos del código vivo.
// QA: tsc 0 TOTAL · eslint 0 errores (tocados) · censo 12 → 11 · build
//     EXIT 0 · health v311.0 db up · pruebas 249/249 (+2 LA TERCERA
//     QUIRURGÍA) · BD intocada (1877 cables · 9 hechos, testigo
//     ANTES/DESPUÉS) · QA visual propio: el CRONOATLAS navega días con la
//     consola limpia y sin bucles de render (el riesgo propio del ajuste
//     durante el render, medido y despejado).
// Herencia v310.0 LA SEGUNDA QUIRURGÍA y toda la crónica. Guards v167 intactos.
// v312.0 LA CUARTA QUIRURGÍA — la deuda sigue pagándose (11 → 9): esta vez
//         DOS heridas en UN solo paciente, la CÁMARA DE CONSECUENCIAS
//         (v135 NEXUS-HYPNOS, el efecto mariposa junto a cada cable). La
//         primera: el reset de los CONTROLES al abrir un cable (el tag
//         táctico decide escenario, primera perturbación, dosis 3 y
//         horizonte 180) vivía en un efecto que escribía estado. La
//         segunda: el REINICIO de la proyección (paso a día 0, o salto al
//         final con movimiento reducido) también se escribía sincrónicamente
//         dentro de su efecto. Ambas curadas con la SEGUNDA HERRAMIENTA de
//         la casa (el ajuste durante el render, la forma canónica de
//         react.dev): el cable ya visto se guarda y, si cambia, corrige sus
//         controles en el render en curso — React descarta ese render y
//         re-renderea una vez antes de pintar; igual el reinicio, que
//         compara el resultado y el gusto de movimiento reducido ya vistos.
//         El RELOJ que avanza la proyección día a día es un efecto
//         secundario legítimo y queda en un efecto que ya no escribe estado
//         sincrónicamente: solo programa el intervalo. Comportamiento
//         EXACTO medido en vivo: abrir un cable arranca limpio por el tag,
//         tocar dosis u horizonte reinicia la proyección ante los ojos, el
//         veredicto y su Monte Carlo llegan al final, Escape cierra,
//         reabrir OTRO cable no arrastra el paso anterior.
// QA: tsc 0 TOTAL · eslint 0 (paciente) · censo 11 → 9 (dos en una ronda)
//     · build EXIT 0 · health v312.0 db up · pruebas 251/251 (+2 LA CUARTA
//     QUIRURGÍA) · arnés visual propio sobre el BUILD NUEVO: reloj vivo
//     (26 → 56), reinicio medido al instante tras la dosis (día 1 venía de
//     crecer hacia 50+), veredicto pintado con Monte Carlo, reapertura sin
//     arrastre (día 1 tras un final en 090), Escape honesto, consola limpia,
//     sin desbordes 1440/390, cero zombis.
// Herencia v311.0 LA TERCERA QUIRURGÍA y toda la crónica. Guards v167 intactos.
// v313.0 LA ESCUELA QUE RESPIRA — la primera ronda de EXPANSIÓN del autociclo
//         (el mandato del Dueño: CREAR · EXPANDIR · PERFECCIONAR · INNOVAR ·
//         CONECTAR) y el pago de la cola expansiva documentada desde la v285:
//         estrategia-data, la escuela del mando. (1) EL CURRÍCULO SE DOBLA:
//         8 doctrinas en DOS ciclos cerrados de contra-doctrina (el segundo
//         ciclo nuevo: Diente de Sierra ↔ Coraza de Sal, Jinete Fantasma ↔
//         Cámara Lenta), 10 wargames con regla especial (invierno, submarino,
//         órbita, urbano, silo), 10 lecciones del aula, 10 leyendas. (2) LA
//         ESCUELA RESPIRA: rotación por envoltura determinista por fecha —
//         cada día tocan 6 de 10 wargames y 4 de 10 lecciones; una clase
//         distinta cada día sin tocar el orden de los originales. (3) EL FIN
//         DEL CARTEL (la ley v216 dentro de la propia casa): la fila «TU ·
//         operador de Vanguard» del ranking — antes un «¿?» decorativo con
//         «gana wargames y sube a la tabla» — sube a la tabla con las
//         victorias REALES de conquista del operador (conquestWins del
//         game-store, selector canónico) y el PUESTO que esas victorias le
//         dan entre las leyendas, con su sello «real»; el campo eres?: true,
//         declarado desde la v92 y jamás usado, por fin trabaja.
// QA: tsc 0 TOTAL (tras regenerar el cliente Prisma del sandbox reciclado,
//     la herida v216) · eslint 0 (tocados) · build EXIT 0 · health v313.0 db
//     up · pruebas 253/253 (+2 LA ESCUELA QUE RESPIRA) · arnés visual propio
//     sobre el BUILD NUEVO: escuela monta con 8 doctrinas, 6 de 10 wargames
//     en mesa, 4 de 10 lecciones, TU honesto con 0 V de novato; el mismo
//     arnés siembra conquestWins=215 en el persist y TU CORONA la tabla con
//     215 V y puesto 1 — el cableado real, demostrado en vivo; consola
//     limpia, sin desbordes 1440/390, cero zombis.
// Herencia v312.0 LA CUARTA QUIRURGÍA y toda la crónica. Guards v167 intactos.
export const APP_VERSION = "v313.0";
export const APP_CODENAME = "LA ESCUELA QUE RESPIRA";
export const APP_VERSION_LABEL = `${APP_VERSION} · ${APP_CODENAME}`;

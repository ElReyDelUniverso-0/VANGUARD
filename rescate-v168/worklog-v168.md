# Worklog — Sandbox Z.ai (ia2 · VANGUARD)

Proyecto: /home/z/my-project/vanguard — rama ia2/v168.0 (git, remote con token en URL)
Mandato: v168.0 — (A) Paridad 2D→3D de las salas genéricas (emisor v165 en ~98 paneles) + (B) mapa fuera de la intro.
Verdad única: npx tsc --noEmit = 0 (baseline verificado 0 antes de editar).

---
Task ID: 0
Agent: ia2 (principal, Z.ai)
Task: Setup + tarea B completa

Work Log:
- Clone rama ia2/v168.0, git identity ia2, npm install, baseline tsc = 0.
- (B) INTRO SIN MAPA: mundo-webgl.tsx — cámara nace en pantalla de título (0,0.75,7.2) mirando el logo (mirada 0,1.75,0); fases «globo»/«marcadores» eliminadas de Fase y de la secuencia (estrellas 1.0 → logo 2.0 → tagline 3.0 → hint 4.0); subirGlobo() eliminado; nuevo encenderMundo() (atmósfera 1.35 + encenderMarcadores) llamado en entrar(); botón «Toca el globo para entrar» → «Toca para entrar»; CSS de fases muertas limpiado. intro-cinematica.tsx (fallback sin WebGL): fases «earth»/«conflict» eliminadas (landBlobs, explosión, alarma fuera), DURATION 8300→6800, warp → title → shatter.
- Divisas bug v165: fila a: "COMPRAR"/"VENDER" → minúsculas (el accion viaja verbatim al listener).
- Inventario: 145 paneles, 31 ya emiten, 15 son insignia (markets/crisis/sala-guerra/meme-studio/news/quiz/polls/perfil/predictions/achievements/shop/missions/ranking/arcade/minigame) → 98 asignables en 6 lotes.

Stage Summary:
- B lista (tsc 0). A lanzada en 6 agentes paralelos (lotes 1-6). Siguiente: tsc final, bitácora, worklog repo, inbox, health, commit + push.

---
Task ID: v168-A5
Agent: subagente lote 5
Task: paridad 2D→3D lote 5 (17 paneles)
Work Log:
- googles-panel.tsx (googles): emisor multi-vista (portada/resultados/tendencias/académico/alertas/traductor/noticias) con filas reales del modo activo; acciones "abrir" (abrirDoc/abrirProducto) y "buscar" (buscar) alineadas por acciones3DRef.
- map-panel.tsx (mapa): DEFCON + modo activo + top-10 frentes por intensidad; acción "volar" → handleSelect (vuelo de cámara real).
- cameras-panel.tsx (camaras): stats + PASE ELITE + 4 modelos + 4 nodos propios; acciones "desplegar"/"ver en vivo"/"reclamar"/"activar" → handlers reales del store.
- arquitecto-panel.tsx (arquitecto): motor (fase/activo), contadores, obras, doctrinas y satélites reales; acciones "escuchar" (playPreview) y "entrar" (navigateTo sala satélite) con offsets recalculados.
- verifica-panel.tsx (verifica): 4 sellos con conteos + cola filtrada con confianza y barra; acción "expandir" → setAbierto (expediente real).
- experimental-panel.tsx (experimental): forja (texto/material/profundidad), giro, órbita, lluvia y 6 regiones con bautizos; acciones "exportar" (exportarPNG), "giro" y "elegir" región.
- help-panel.tsx (ayuda): inicio rápido + 11 secciones reales de la guía; acción "tutorial" → evento vanguard:open-tutorial.
- salas-panel.tsx (salas): conexión, online total, grito del día, 5 salas y últimos 3 mensajes; acción "entrar" → changeRoom.
- cambios-panel.tsx (cambios): informe de regreso (total/ausencia), pulsos con riesgo, noticias fuente real, rotaciones y pulidos del cuerpo; acción "leer" → window.open de la fuente.
- bolsa-panel.tsx (bolsamonedas): fundación, portafolio, tape y mercado con precio/delta; acción "comprar" → trade(code,"BUY") con offset variable documentado.
- conquistas-3d-panel.tsx (conquistas3d): 5 campañas + pasos de la campaña activa; acción "ver" → setCamp/setStep/setPlaying (mismo handler 2D).
- nueva-panel.tsx (nueva): reloj/descubiertas, recientes y 8 mundos con acento real; acción "ir" → irA (navegación real).
- estrategia-panel.tsx (estrategia): 4 fases OODA, wargames, doctrina en clase y top generales; acción "elegir" → setEscSel.
- extranjera-panel.tsx (extranjera): portada del número, cita, ensayos con tono, debate y hemeroteca; acción "leer" → setAbierto del ensayo.
- canales-panel.tsx (canales): escucha global, contrastados, 6 canales con subs y 3 mensajes en vivo; acción "filtrar" → setCanalFiltro + marcarLeidos.
- evaluacion-panel.tsx (evaluacion): informe N.º, hallazgos clave, teatros y archivo; acción "hoy" → setFecha(fechas[0]).
- famous-deaths-panel.tsx (muertes): filtro + 9 figuras con año/causa/lugar/guerra; acción "detalles" → setSelected (ficha desplegada).
Stage Summary:
- 17/17 paneles emitidos (0 saltados) · 12 filas máx. c/u (~180 filas totales, mínimo 4 garantizado) · 14 paneles con acciones cableadas por vg:sala3d-accion (evaluacion/cambios/estrategia incluidos; sin acción: help solo tutorial, filas informativas de arquitecto/verifica/canales/evaluacion) · edits aditivos, un solo archivo por panel, cero cambios de render DOM.

---
Task ID: v168-A1
Agent: subagente lote 1
Task: paridad 2D→3D lote 1 (17 paneles)
Work Log:
- studios-panel.tsx (studios): 7 emisores (uno por sub-estudio activo: noticias/prensa/banderas/mapas/música/stickers/comunidad) con cabecera + feed UGC real (título, autor, ♥ likes) + capacidades del editor; sin acciones de fila (las acciones viven en formularios).
- pantalla-panel.tsx (pantalla): cabecera de vista + 10 pases reales del feed (título, duración/EN VIVO, miniatura img, canal, vistas); acción "ver" → setSala (sala de proyección), offset -1.
- laboratorio-panel.tsx (laboratorio): escenario activo con tensión, perturbación/dosis, botón de simulación, 4 escenarios con a; si terminado: estado final + Monte Carlo top-2; acciones "simular" → correr() y "elegir escenario" → setCrisisId (offset -3).
- warsim-panel.tsx (warsim): enfrentamiento configurado + estado de simulación + 10 potencias con tropas/presupuesto/barra; acciones "elegir" → pick() y "simular" → startSim(), offset -2.
- agente-panel.tsx (agente): expediente real (IQ/grado, alias/nivel/XP, racha, logros, 3 regiones, actividad, PvP, vs promedio global, 2 predicciones); sin acción (el panel no tiene acciones de fila).
- empleos-panel.tsx (empleos): modo sin contrato → 4 departamentos con sueldos; con contrato → nómina viva con barra, turno con cooldown, rango y escala RANGOS; acciones "cobrar" → cobrar() y "cumplir turno" → iniciarTurno().
- embajadores-panel.tsx (embajadores): cuenta dedicada + ciclo, y según tab interno: ELECCION (candidatos con votos, acción "votar" → vote(), offset -2), ROL (requisitos + privilegios reales) o RANKING (top-8 ordenado).
- age-of-nations-panel.tsx (edad): setup → 2 modos (acción "elegir modo"), 6 naciones ("elegir nación", offset -2) y "comenzar" → start(); en juego → turno/oro/acciones ("terminar turno" replica el onClick de ENDER TURNO), dominio/fe y hasta 8 provincias propias ("seleccionar" → onProvClick, offset -3).
- cama-panel.tsx (cama): 6 ajustes en vivo (transición, letras, densidad, color personal, modo cama y auto-cama con toggles), salas top + favorita (acción "ir" → navigateTo, offset -6) y viajes registrados.
- sala-roja-panel.tsx (sala18): emisor ANTES de los returns tempranos con 3 estados honestos: modo estricto (4 filas informativas), age gate (5 reglas reales) o abierto (regla + 8 cintas con gravedad/REC/fuente); acción "confirmar y ver" → setConfirmItem (modal 2D), offset -1.
- atelier-panel.tsx (atelier): 5 cabeceras de las leyes (acabado vigente, edición con barra de escasez, serie grabada, modo galería, horas de forja) + 6 acabados; acciones "elegir acabado" → elegirAcabado() (offset -5) y "alternar galería" → setGaleria + campana.
- simulador-panel.tsx (simulador): arma/modo/objetivo + 6 cabezas y 5 ciudades seleccionables (acciones "elegir arma"/"elegir objetivo" con offsets 3 y 3+CABEZAS) + "detonar" → detonar() + bajas/anillos reales tras detonar.
- frentes-panel.tsx (frentes): día/variación, reproducción (acción "reproducir" → toggle), territorio ocupado con barra, 6 localidades con control real (controlDe) y 4 ejes de presión.
- country-control-panel.tsx (conquista): 3 stats + 12 países con defensa/costo/botín real (Banco Mundial); acción "atacar" → handleConquer (offset -3).
- enclaves-panel.tsx (enclaves): 4 casos seleccionables (acción "abrir caso" → setIdx) + un-minuto + las 5 claves reales del dossier activo.
- counters-panel.tsx (contadores): 3 contadores en vivo (emitidos en bloques de 10 s para no saturar el mundo) + 6 guerras históricas con barra + 4 crímenes globales; sin acción.
- fortaleza-panel.tsx (fortaleza): pasaporte (firmado/visitante), muros activos, blindajes, error y sellos de acero reales de /api/fortaleza; sin acción.
Stage Summary:
- 17/17 paneles emitidos (0 saltados; studios emite por sus 7 sub-estudios activos) · ~150 filas totales, mínimo 4 garantizado en cada estado (sala-roja emite estado real: estricto/gate/abierto) · 12 paneles con acciones cableadas por vg:sala3d-accion (pantalla, laboratorio, warsim, empleos, embajadores, edad, cama, sala18, atelier, simulador, frentes, conquista, enclaves = 13) · sin acción: agente, contadores, fortaleza, studios (acciones de formulario, no de fila) · edits aditivos, un archivo por panel, cero cambios de render DOM, todos los títulos/colores tomados del PanelHeader/h1 real.

---
Task ID: v168-A6
Agent: subagente lote 6
Task: paridad 2D→3D lote 6 (16 paneles)
Work Log:
- activity-log-panel.tsx (registro): 3 totales de la cuenta (eventos/ganancias/gastos) + últimas 9 entradas reales del log con delta y timestamp del filtro activo; sin acción (los botones 2D son filtros de vista).
- reclutamiento-panel.tsx (recluta): 5 bandos RECRUIT_SIDES (activos en oro) + edades/pago/duración + 3 fases + hecho verificado; acciones "ver bando" → setSideIdx (idx = índice RECRUIT_SIDES, sin offset) y "verificar en bellingcat" → window.open del mismo enlace 2D.
- monitorglobal-panel.tsx (monitorglobal): tensión global con delta 24h, 4 dominios, 6 teatros y alerta top del feed — todo con la paleta colorTension real del panel; sin acción.
- mundial-panel.tsx (mundial): dossier activo (riesgo/trasfondo), 5 secciones con los acentos reales de los Bloques, transnacional, 4 naciones alternativas y estado del comparador; acciones "ver nacion" → setSel (offset 7 documentado) y "comparar" → setComparar.
- dronguerra-panel.tsx (dronguerra): 4 drones DRONE_MODELS (activo en oro), ficha técnica, 4 piezas inspeccionables y cifra documentada; acciones "ver dron" → setModelIdx+reset pieza y "inspeccionar pieza" → setActivePart con toggle (offset 5).
- planeta-panel.tsx (planeta): 4 capas (NASA/auroras/sismos/EEI) alternables, 5 eventos EONET con fuente oficial, sismo top USGS, posición EEI en directo y refresco; acciones "alternar capa", "abrir fuente nasa/usgs" (window.open real) y "refrescar" → load().
- gallery-panel.tsx (galeria): cabecera de filtro + 9 fotos reales con img (thumbnails que ya muestra el 2D), severidad y BDA; modo MIS-FOTOS emite tus fotos publicadas; acciones "ver foto" → handleView (con recordViewPhoto) y "abrir publicador" → setPubOpen+sfx.
- escenarios-panel.tsx (escenarios): GALERÍA DEL DESTINO — total UGC + orden, 8 escenarios con crisis/perturbación/final (colores colorFinal) y CTA al Lab; acciones "explorar escenario" → simularAqui, "alternar orden" → setOrden y "ir al laboratorio" → navigateTo.
- combat-simulator-panel.tsx (combate): filas del MODO activo — listo (INICIAR COMBATE), luchando (enemigo con barras HP, items seleccionables, ATACAR CON X) y fin (VOLVER); acciones → startCombat, setSelectedItem, playerAttack y endCombat reales.
- rostros-panel.tsx (rostros): colección de 34 rostros, expediente abierto con índice de poder, ruta al poder, top-6 de la jerarquía y pulso real de cables (o silencio); acciones "abrir expediente" → irAlExpediente y "leer cable" → setCableSel+sfx (offsets 3 y dinámico).
- creador-mapas-panel.tsx (mapascrea): operación con conteos, 4 facciones y 5 herramientas seleccionables, GUARDAR y último mapa de la cartoteca; acciones "pintar faccion" → setFactiva, "usar herramienta" → setHerr+sfx, "guardar mapa" → guardar() y "abrir mapa" → abrir() (offsets 1/5/11).
- gmaps-panel.tsx (maps): zona activa con ficha rica (actores/cifra/historial), 3 vistas del mapa, coordenadas, 2 cables intel en vivo y 2 frentes alternos; acciones "cambiar vista" → setModo, "copiar coordenadas" → copiarCoordenadas, "leer cable" → abrirCable (sala de lectura) y "ir a zona" → setActive.
- ojo-dios-panel.tsx (ojodios): god:state real (fase/ronda/operadores/batallas), mapa omnisciente conmutable, unidades del Cielo de Acero, última batalla, facciones, feed de salas y escáner GDELT; acciones "alternar vista" → setVista3d y "volar al frente" → flyToFront.
- videos-panel.tsx (videos): filas del MODO activo — parrilla con 8 emisiones reales (img + canal + vistas) y PUBLICAR VIDEO, o reproductor (emisión actual, volver, ME GUSTA, suscribirse, relacionados); acciones → openVideo (recordWatch real), reactVideo, toggleSubscribe y setPublishOpen.
- estudio-panel.tsx (estudio): filas del MODO activo — crear (4 escenas, plantillas, GRABAR Y PUBLICAR 8s) o editar (reproducir, EXPORTAR con audio, publicar en GlobalVision, filtros); acciones → setScene, applyTemplate, startRec/stopRec, togglePlay, exportEdited, publishEdited y setMode.
- maquina-panel.tsx (maquina): línea temporal activa (SIM/REAL) con su modo (Karsk vivo/fases/archivo) + 9 crisis y archivos desclasificados seleccionables + hecho de fases; acción "abrir linea" → setCrisis del expediente-store (offset 2).
Stage Summary:
- 16/16 paneles emitidos (0 saltados) · 12 filas máx. c/u (~170 filas totales, mínimo 4 garantizado incluso con datos async vacíos) · 14 paneles con acciones cableadas por vg:sala3d-accion (47 cadenas de acción en total, todas en minúsculas y ejecutando el MISMO handler que el botón 2D; sin acción: registro y monitorglobal, informativos) · imágenes reales emitidas (galería/videos) via img · offsets de idx documentados en comentario en cada oyente · edits aditivos, un solo archivo por panel, cero cambios de render DOM.
---
Task ID: v168-A2
Agent: subagente lote 2
Task: paridad 2D→3D lote 2 (16 paneles)
Work Log:
- contribuidores-panel.tsx (contribuidores): tarjeta de rango real (progreso p, insignias en d) + 5 pestañas y, en modo TRABAJOS, los 7 trabajos con recompensa CONTRIB_REWARDS; acciones "abrir pestaña" → setTab (offset 1), "elegir trabajo" → setJob (offset 6) y "abrir alertas" → setTab("alertas").
- muro-obras-panel.tsx (obras): señales en tus obras (o pasaporte), podio de la fama con fórmula real, filtros por tipo con conteo y 3 obras con miniatura real; acciones "crear pasaporte" → pedirPasaporte, "marcar vistas" → marcarVistas, "filtrar tipo" → setFiltro y "me gusta"/"jugar obra" → like/jugarGame (offset dinámico documentado).
- detective-panel.tsx (detective): emisor ANTES del return temprano — modo lista (casos con fianza/fase/dificultad + expediente propio) y modo caso (fase, ubicaciones, sospechosos, pistas con fiabilidad, veredicto); acciones "entrar al caso" → joinCase/openCase (misma regla del botón), "registrar ubicación" → act("det:search"), "interrogar"/"acusar" → act("det:interrogate"/"det:vote") con offsets 1 y 1+nlocs.
- mi-pais-panel.tsx (mipais): modo asistente (paso actual + 4 pasos navegables) o nación proclamada (nombre/gobierno, población/PIB/ejército con los mismos divisores del 2D, unión, reclutamiento); acciones "ir al paso" → setPaso, "salir de la unión"/"unirse" → accionUnion, "invitar guerrero aleatorio" → reclutar, "aceptar invitación" → aceptar (offset dinámico).
- mente-panel.tsx (mente): filas del MODO activo — pulso (pensamiento, riesgo medio, 5 eventos con TIPO_COLOR), charla (toggle investigación + últimos 5 mensajes o estado vacío) y análisis (expediente firmado con riesgo/escenarios o secciones reales); acción "alternar investigacion" → setInvestigarModo (sin countdown por segundo en filas: cero churn).
- telegram-panel.tsx (telegram): bot personal, radar, 3 reglas, chequeo manual, 4 tipos del puente y registro de envíos; acciones "alternar regla" → toggleRadarRule (offset 2), "escanear ahora" → chequearManual y "alternar alerta" → toggleAlert (offset 6).
- espejo-panel.tsx (espejo): crisis activa — 6 salas de medio con titular (color real del medio), 3 hechos con convergencia, núcleo neuronal con proyección y hasta 2 cables REALES; acciones "desplegar sala" → setAbierto (offset 0) y "leer cable" → setCableSelReal (offset dinámico sobre el final del array).
- ops-panel.tsx (operaciones): tablero + 4 órdenes del día con fase/progreso en vivo (acción solo si PLANIFICADA) + 3 líneas del canal de comunicaciones; acción "ejecutar" → lanzar (offset 1).
- centinela-panel.tsx (centinela): índice del mundo con ventana de riesgo, las 8 regiones con nivel/señal del día y 2 puntos del vigía 24h; sin acción (informativo, el panel no tiene botones).
- imagenes-panel.tsx (imagenes): buscador con nº de resultados, recompensa del día y 8 fotos reales con miniatura, colección y nota editorial; acción "abrir foto" → setSel+cobrarVista (offset 2, misma recompensa que el 2D).
- biblioteca-panel.tsx (biblioteca): contador de desclasificados + los 10 expedientes con nivel de acceso (color por nivel), coste y miniatura real; acciones "desclasificar"/"leer expediente" → unlock (offset 1, misma lógica de coste/nivel 8+).
- analista-panel.tsx (analista): rango con XPA/ELO, 6 contadores honestos, insignias y retos semanales con progreso; acción "reclamar recompensa" → reclamar solo si listo && !cobrado (offset 8).
- perdidas-panel.tsx (perdidas): libro contable con total/azul/rojo/evidencias y hasta 9 categorías con barra proporcional; acción "desplegar categoría" → toggle (offset 1).
- pulso-panel.tsx (pulso): radar con escaneo, ISS real (posición/altitud/huella/visibilidad), 3 zonas del radar aéreo con militares y 3 señales espaciales; acción "escanear ahora" → scan (mismo escaneo recompensado +5 mon).
- ciber-panel.tsx (ciber): DEFCON con contadores, 3 objetivos y 3 orígenes top con barras y 3 intrusiones del feed con intensidad; sin acción (informativo, el panel no tiene botones).
- carteles-panel.tsx (carteles): cabecera del archivo + 7 fichas con foto real del líder (img), origen/ingresos/líder; acción "abrir ficha" → open (offset 1).
Stage Summary:
- 16/16 paneles emitidos (0 saltados) · ~11 filas de media (mín. 4 garantizado en todos los modos y con datos async vacíos) · 14 paneles con acciones cableadas por vg:sala3d-accion (24 cadenas de acción, todas en minúsculas y ejecutando el MISMO handler que el botón 2D; sin acción: centinela y ciber, informativos sin botones) · imágenes reales emitidas via img (carteles, biblioteca, imagenes, muro-obras) · offsets de idx documentados en comentario en cada oyente · detective: hooks colocados antes del return temprano · mente: filas sin datos que tick-ean por segundo (anti-churn) · verificación: los 16 archivos parsean limpio con el compilador TS · edits aditivos, un solo archivo por panel, cero cambios de render DOM.
---
Task ID: v168-A3
Agent: subagente lote 3
Task: paridad 2D→3D lote 3 (16 paneles)
Work Log:
- frente-panel.tsx (frente): TITULO dinámico = el h3 real del frente activo; frente (intensidad p + bajas), control A/B (p), arsenal del operador (saldo ◉), meteo real de Open-Meteo si llegó y 6 teatros del selector; acciones "dron"/"mlrs" → droneStrike/mlrsBarrage y "cambiar frente" → setFrontIdx (offset 4 + meteo).
- imperio-panel.tsx (imperio): hooks colocados ANTES del return temprano de fundación — FUNDAR emite las 4 facciones + récord; JUEGO emite TU IMPERIO (oro/ciencia/civiles/reserva/reloj en d, dominio p), hasta 3 frentes vivos, investigaciones disponibles y top-6 del ranking; acciones "fundar imperio" → fundar, "reclutar" → reclutar, "contraatacar" → cambiarModoFrente (offset 1) e "investigar" → lanzarInvestigacion (offset 1+frentes; inv antes del ranking para quedar tocables).
- creador-panel.tsx (creador): filas de la SECCIÓN activa — crear (rango con progreso, reto del día y los 7 tipos) o galería/mis-envíos (cabecera con stats y 10 obras reales); acciones "crear tipo" → setKind (offset 2), "like" → toggleLike y "jugar" → play (offset 1).
- consejo-ia-panel.tsx (consejoia): CONVOCAR AL CONSEJO con la crisis planteada, los 4 consejeros con su intervención REAL y voto+confianza, el decreto firmado y 3 temas sugeridos; acciones "convocar consejo" → deliberar (solo en fase sala), "cumplir decreto" → cumplirDecreto y "plantear tema" → setTema (offset 5+decreto).
- taller-juegos-panel.tsx (taller): filas del MODO activo — arcade (cabecera + 10 juegos reales con motor/autor/likes o estado vacío) o crear (3 motores + PUBLICAR EN EL ARCADE), y jugando (4 filas con stats); acciones "jugar" → setJugando (offset 1), "elegir motor" → setMotor, "publicar juego" → publicar, "volver al arcade" → setJugando(null) y "crear juego" → setModo("crear").
- bookmaker-panel.tsx (bookmaker): filas de la SUB-PESTAÑA activa (vivo/próximos/política/tickets) + jackpot Fortuna + boleta con cuota y piernas; acciones "apostar" → placeBet, "quitar de la boleta" → remove de slip (offset 2) y "cashout" → doCashout (offset 2+piernas).
- red-mundial-panel.tsx (redmundial): pacto UKUSA 1946 + 10 servicios reales (color por bloque, fundación, sede/misión en d) + cable vivo del pulso; acción "abrir expediente" → elegir (offset 1, misma campana de salón).
- foryou-panel.tsx (foryou): diapositiva EN VIVO con canales oficiales + 10 publicaciones reales del feed (tipo, likes en vivo, autor, 18+), estados honestos de carga/vacío; acciones "ir a en vivo" → navigate("envivo"), "ir al estudio" → navigate("creador") y "like" → toggleLike (offset 1).
- modo-ar-panel.tsx (armodo): capa AR (cámara activa/demo), escanear, capturar PNG y los 8 marcadores flotantes reales con nivel/intensidad; acciones "abrir/apagar camara" → encender/apagarCamara, "escanear zona" → escanear, "capturar ar" → capturar y "fichar marcador" → setConflictoActivo (offset 3).
- tribunal-panel.tsx (tribunal): 8 filas deterministas (2 por caso: acusación/defensa) con jurado global p, TU VOTO cuando ya votaste y la defensa real verdictAnalysis; acciones "votar culpable"/"votar inocente" → vote(c,…) vía idx⌊/2⌋ (vote guarda en localStorage y paga mon/XP igual que el 2D).
- espectro-panel.tsx (espectro): doctrina (ADS-B REAL/SIMULADO), 6 canales marítimos con riesgo coloreado, 2 aviones militares y 2 buques de guerra, 1 banda HF con jamming; estados de carga honestos cuando no llega el barrido; sin acción (informativo).
- incidentes-panel.tsx (incidentes): leyenda de 6 tipos con conteo + fila TODOS + 5 incidentes reales (tipo, país, desde, resumen en d); acciones "filtrar tipo"/"filtrar todos" → setType y "ver incidente" → setSelected (offset tipos+1).
- sismo-panel.tsx (sismo): los 4 stats reales del monitor (eventos, mayor magnitud, energía p, señales sospechosas) + 8 temblores del feed con color de magnitud real; sin acción (informativo).
- pulsos-panel.tsx (pulsos): las 8 categorías con conteo y color real (apagadas en gris), tensión del planeta p y 3 incidentes del feed cronológico; acción "alternar categoria" → toggleCat (idx = PULSO_CATS directo).
- fusion-panel.tsx (fusion): inventario real (cap 5, rareza coloreada) + las 4 recetas con materiales/coste/XP y verde/rojo según puedes fusionar; acción "iniciar fusion" → handleFusion (offset min(inventario,5)).
- curiosidades-panel.tsx (curiosidades): del día, dado, efemérides reales de Wikipedia (async) y 6 fichas del muro con LEÍDA/+5 MON; acciones "archivar del día" → reward(daily.id), "otra curiosidad" → roll y "archivar" → reward(c.id) (offset 2+efemérides).
Stage Summary:
- 16/16 paneles emitidos (0 saltados) · ~11 filas de media, máx. 12 y mín. 4 garantizado (estados de carga/vacío honestos en async: espectro, taller, foryou, bookmaker) · 14 paneles con acciones cableadas por vg:sala3d-accion (36 cadenas de acción, todas en minúsculas y ejecutando el MISMO handler que el botón 2D; sin acción: sismo y espectro, informativos) · acciones colocadas dentro de las 9 filas tocables de salas-3d (MAX 9) reordenando fusion/imperio · TITULO/color tomados del PanelHeader/h real de cada panel · offsets de idx documentados en comentario en cada oyente · imperio: hooks antes del return temprano (patrón detective) · verificación: balance de paréntesis/llaves limpio en los 16 archivos · edits aditivos, un solo archivo por panel, cero cambios de render DOM.

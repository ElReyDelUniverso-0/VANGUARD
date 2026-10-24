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
export const APP_VERSION = "v163.0";
export const APP_CODENAME = "LA CIUDAD TALLADA";
export const APP_VERSION_LABEL = `${APP_VERSION} · ${APP_CODENAME}`;

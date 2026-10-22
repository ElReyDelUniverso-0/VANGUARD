// FUENTE ÚNICA DE LA VERSIÓN DE VANGUARD (se muestra en HUD, health y feed)
// v157.0: EL UNIVERSO VIVO — cuatro quejas del Dueño curadas de raíz:
// (1) «cuando uno dura mucho tiempo lo 3D se borra» → el guard de recarga
//     del contextlost era de UN SOLO USO por pestaña: la 2ª pérdida de
//     contexto GPU ya no se recuperaba jamás. Ahora el guard expira 30s
//     tras cada restauración (re-armable) + vigilante de VRAM cada 8s.
// (2) «no puedo mirar para atrás / las cosas te siguen» → LA CORREA NUEVA:
//     la Casa ya NO persigue al piloto ni se replanta frente a su mirada
//     (CORREA_DIST 2.3→7.2, rescate solo en el borde del universo y
//     conservando orientación); una BALIZA holo dorada late sobre la Casa
//     para guiar la vuelta.
// (3) «hay mucho elemento mezclado» → CAPAS LIMPIAS: en holo el módulo manda
//     el centro (2.3) y el mundo de la sección se retira a fondo profundo
//     (4.6, telón 0.34×) — nada en el mismo plano.
// (4) «lo 3D es muy simple, solo un fondo, no dinamismo, es aburrido» → LA
//     VIDA ORBITAL: satélites con paneles solares, jets de guerra con farol
//     latiente, cometas que cruzan el cielo profundo, drones guardianes
//     alrededor de la Casa, respiración idle del piloto y LA COMITIVA: la
//     corte ÚNICA de cada módulo (monedas, drones-prensa, dados, urnas,
//     escudos, dardos, estrellas, cajas, dianas, donuts) orbitando su sala.
//     Y HOLO TOTAL: TODOS los módulos nacen 100% 3D por defecto (genéricas
//     incluidas) — el chip devuelve la consola 2D con un toque.
export const APP_VERSION = "v157.0";
export const APP_CODENAME = "EL UNIVERSO VIVO";
export const APP_VERSION_LABEL = `${APP_VERSION} · ${APP_CODENAME}`;

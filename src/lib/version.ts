// FUENTE ÚNICA DE LA VERSIÓN DE VANGUARD (se muestra en HUD, health y feed)
// v155.0: LA CORTINA DE ARRANQUE — el fin de la pantalla muerta. El Dueño
// (móvil) pasó 3 días viendo NADA: el servidor dev moría de OOM y su teléfono
// se quedaba en negro sin decir nada. Ahora: (1) el script `dev` del entorno
// sirve la BUILD DE PRODUCCIÓN (148MB estables vs 2.2GB del dev que OOMeaba);
// (2) una cortina HTML/CSS puro se pinta ANTES de todo JavaScript; (3) si el
// universo no da señal de vida (__vgvivo) en 12s, ofrece «TOCA PARA
// DESPERTARLO»; (4) los chunks viejos disparan UNA auto-recarga por minuto.
export const APP_VERSION = "v155.0";
export const APP_CODENAME = "LA CORTINA DE ARRANQUE";
export const APP_VERSION_LABEL = `${APP_VERSION} · ${APP_CODENAME}`;

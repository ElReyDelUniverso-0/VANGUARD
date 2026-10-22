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
export const APP_VERSION = "v159.0";
export const APP_CODENAME = "EL ATERRIZAJE";
export const APP_VERSION_LABEL = `${APP_VERSION} · ${APP_CODENAME}`;
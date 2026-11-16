# LAS FOTOS DE VERDAD Y UNA SOLA PORTADA — v405.9

> Orden del Dueño: «quita las fotos de IA de Vanguard, ponles fotos 4K mejores que
> nunca, y las salas de juego fusiónalas con el Vanguard de portada, el de noticias
> en un solo Vanguard».

## El defecto, medido

Las 107 ilustraciones de `public/ilustraciones/` eran **dibujos generados por IA**
de **1408×704** (104 de ellas; 3 de 1344×768): 0,99 megapíxeles. En una pantalla
de 3840 px se estiraban 2,7 veces. Estaban citadas **276 veces** en `src`, 104
archivos distintos desde `src/lib/regla-oro.ts`.

## Lo que hay ahora

- **107 fotografías reales de 3840×1920** (2,00:1, el mismo encuadre de siempre),
  **mismo nombre de archivo** ⇒ cero páginas, cero componentes y cero líneas de
  `regla-oro.ts` tocadas.
- Licencias: **solo dominio público y CC0**. Las CC BY / CC BY-SA se descartan a
  propósito: obligan a atribuir en cada página y la casa no tiene hueco de créditos.
- Procedencia de las 107 (URL, título original, autor, licencia y la búsqueda que
  se usó): `public/ilustraciones/FUENTES-4K.json`.
- Peso: **58,6 MB** en total, media **561 KB** por foto, calidad adaptativa.
  Ninguna baja de 3840 px para ahorrar peso: si el detalle no cabe (mapas,
  grabados, periódicos) se baja la calidad del JPEG, nunca la resolución.

## Las herramientas

| archivo | qué hace |
|---|---|
| `scripts/ilustraciones-4k.py` | sustituye una ilustración por una foto real 4K de Wikimedia Commons. `--todas`, `--buscar "…"`, `--repeso` (baja el peso sin volver a buscar). Nunca rellena: si no hay foto libre ≥2400 px, no toca el archivo y lo dice. |
| `scripts/portada-vanguard.py` | fabrica la portada única de la casa y sus dos derivados. |

## Una sola portada

| archivo | tamaño | para qué |
|---|---|---|
| `public/portada-vanguard.jpg` | 3840×1920 · 566 KB | la portada de la casa |
| `public/portada-vanguard-1920.jpg` | 1920×960 · 202 KB | la que bajan los móviles (`srcSet`) |
| `public/og-vanguard.jpg` | 1200×630 · 61 KB | la tarjeta de enlace (WhatsApp/X/Telegram), con el nombre |

Fuente: NASA, *ISS-65 Northwest America at night, city lights* — dominio público.
Procedencia en `public/portada-vanguard.json`.

La visten: las **dos puertas** de `/entrar` (Noticias y Juego), la tarjeta del
**módulo Juego** y sus seis salas (`modulos.ts`), y las **155 puertas `/sala/<clave>`**
(banda superior con `srcSet`).

## Pendiente declarado

19 fotos son de tema **aproximado**: Commons no tiene foto de agencia de cada tema
moderno (apuestas → casino, arcade → máquina de pinball, encuestas → papeleta…).
La casa prefiere una foto real cercana a un dibujo de IA exacto, y lo dice.

# LA CASA VIVA · v436.2

> Orden del Dueño: *«Pule aún más con animaciones y sonidos únicos para cada
> acción en Vanguard. Dale colores un poco vivos pero que no parezca de un
> niño.»*

Tres cosas, una sola idea: que la casa **responda**. Que tocar algo suene a ese
algo, que el movimiento tenga oficio, y que el color se encienda sin volverse
caramelo.

---

## 1 · Un sonido propio para cada acción

**`src/lib/sonido/acciones.ts`** — el catálogo. **26 acciones**, ninguna con la
receta de otra. Cada voz define **timbre** (madera = cuerpo · campana = aire ·
tono = color · ruido = piel), **altura**, **duración**, **mezcla de sala**,
**momento** de cada golpe y su **anti-metralleta** (`cada`, en ms).

| acción | qué se oye |
|---|---|
| `entrar-casa` | dos golpes graves que suben: abrir una puerta pesada |
| `viaje` | campana con cola: viajar a una sala |
| `sala-nueva` | aire + tercera: pisar una sala por primera vez |
| `panel-abrir` / `panel-cerrar` | la misma madera, entrando y cayendo |
| `pestana` | toque seco y agudo, sin cola |
| `paso-hecho` | sello de madera + campana que confirma |
| `paso-ir` | madera que empuja hacia delante |
| `guia-elegida` | dos campanas en tercera |
| `sorpresa` | barrido de aire y cuatro notas que escapan |
| `filtro` | golpe grave y corto, madera oscura |
| `buscar` | tono limpio que abre el oído |
| `ficha-abrir` / `ficha-cerrar` | el aire se abre / la nota se cierra |
| `progreso-subir` | tres notas escalonadas, la última con aire |
| `modo-libre` | un campanón grave: la casa se calla |
| `reiniciar` | el aire se vacía y la madera cierra |
| `copiar` | dos toques de cristal |
| `guardar` | madera firme + campana de archivo |
| `predecir` | motor grave (saw) + campana que responde |
| `deshacer` | la nota camina hacia atrás |
| `logro` · `aviso` · `error` | cuatro campanas · dos notas medias · madera grave |
| `permiso-voz` · `silencio` | el motivo de la casa · un toque sin aire |

**La boca** (`src/lib/sonido/tocar.ts`) es una sola: `suena("paso-hecho")`. Y
una sola ley, el **portero**:

```ts
puedeSonar({ mudo, calma, gesto, oculto })
```

- **sin gesto no suena** (política del navegador y respeto al visitante);
- **con el sonido apagado, no suena**;
- **en modo calma** (lectura o silencio pedido, `lib/calma.ts`), no suena;
- **en pestaña oculta**, no suena;
- y la misma acción no se repite antes de su `cada` (rebotes de ratón incluidos).

Todo se **sintetiza** con el motor que la casa ya tenía (`src/lib/sound.ts`:
madera, campana FM, ruido, cadena compartida con reverb corta). Se añadió **una**
pieza nueva allí, `tocar(notas)`, para que el catálogo sea datos y no 26
funciones copiadas. **Cero archivos de audio**: ni un mp3, ni un wav, ni una URL.

**Para cualquier sala nueva, un atributo basta:**

```tsx
<button data-vg-son="logro">reclamar</button>
```

La capa viva escucha en captura y suena. No hay que tocar 380 archivos ni
importar nada.

---

## 2 · Las perillas: sonido y movimiento, recordados

**`src/lib/interfaz/vivo.ts`** (puro) + **`src/components/interfaz/ajustes-vivo.tsx`**:

| perilla | valores | qué hace |
|---|---|---|
| Sonido | sí / no | apaga o enciende **toda** la casa (y suena el apagado) |
| Movimiento | auto · suave · quieto | `auto` obedece al sistema; `suave` deja entradas y quita bucles; `quieto` no mueve nada |

Se guardan en `localStorage["vg:interfaz:v1"]`, se sanean al leer (basura →
defecto) y se escriben en `<html data-vg-son data-vg-mov>`, que es lo que lee el
CSS. Están en el panel del descubrimiento (cara *progreso*) y en `/descubrir`
(bloque *tu progreso*). Donde se apagan, se apagan en todas partes.

---

## 3 · El color: joya, no caramelo

`src/app/vivo.css` — la capa del pulso. La regla que se aplicó, palabra por
palabra de lo que pediste:

- **más luz, no más saturación.** Los acentos brillan (`--vv-oro: #f3d68f`,
  `--vv-cian: #5de6f7`), pero no gritan.
- **acentos finos**: bordes de 1 px, hilos de oro sobre los paneles, subrayados
  que se dibujan, halos suaves. Nunca un bloque de color plano detrás de un
  texto — eso es lo que hace que una interfaz parezca de juguete.
- **registro profundo** (casi negro azulado: `#05070d`) para que el oro y el
  cian parezcan joya.
- **violeta y rosa solo donde toca**: la sorpresa y «en vivo». Dos sitios, no
  veinte.
- pulido global mínimo y seguro: selección de texto, anillo de foco cian,
  barra de desplazamiento de oro, y un velo de presión (`filter`, no
  `transform`, para no pisar las transformaciones que otras capas usan).

---

## 4 · El movimiento: con oficio, no con confeti

`vivo.css` trae **nueve fotogramas** y siete utilidades (`.vv-entra`, `.vv-sube`,
`.vv-sella`, `.vv-onda`, `.vv-latido`, `.vv-tiza`, `.vv-marca`, `.vv-sopla`) más
la entrada escalonada por contenedor: `data-vg-vivo`.

Lo aplicado a lo tuyo:

- el **panel** entra en 320 ms (`vv-entra`); la **pestaña activa** dibuja su
  subrayado en 200 ms; los **botones** se levantan 1 px con halo de oro;
- la **burbuja** sube 2 px al pasar y tiene halo de cian;
- **paso cumplido**: el número se sella (`vv-sella`, 280 ms);
- **barra de progreso**: 320 ms de llenado, sin saltos;
- **«en vivo»**: un latido lento de 2,8 s — nunca un parpadeo nervioso;
- **fichas del hub**: se despliegan en 240 ms y la fila abierta se marca con oro;
- **listas**: entran escalonadas de 35 en 35 ms, máximo 260 ms.

Regla dura: **ninguna transición pasa de 900 ms** y la amplitud va de 1 a 12 px.
Ni rebotes, ni giros eternos, ni confeti.

Y la quietud, respetada por **tres** caminos (los tres probados):

1. `html[data-vg-mov="quieto"]` → todo a 0,001 ms, funciones intactas;
2. `prefers-reduced-motion: reduce` → lo mismo, sin depender del script;
3. `html[data-vg-anim="desactivadas"]` (sistema v416.0) → manda también;
4. y `html[data-vg-oculto="1"]` → ni una animación en pestaña oculta.

---

## 5 · La sorpresa que faltaba

El mandato pedía «llévame a algo que no conozco» y el hub no lo tenía. Ya lo
tiene: botón junto al buscador que elige **entre las salas que no has pisado**
(si ya las viste todas, entre todas), abre su ficha, te lleva a ella y suena con
su propia voz (`sorpresa`). Al lado, cuántas salas te quedan sin pisar.

---

## 6 · Cómo comprobarlo

```bash
npx tsx tools/interfaz/probar.mts      # 76 comprobaciones, 0 fallos
```

Cubre: unicidad de las 26 firmas · rangos del oído (60 Hz–8 kHz, ≤ 0,09 de
ganancia, ≤ 3 s por golpe) · el portero en sus cuatro razones · el
anti-metralleta · el saneado de las perillas · la matriz de movimiento ·
que **ningún `@keyframes` usado sea fantasma** en las tres hojas · que no haya
un solo asset de audio · que el descubrimiento no se quede mudo en un refactor
(7 voces del panel + 7 del hub, clavadas) · que la capa viva esté montada.

En vivo: el panel abajo a la izquierda de cualquier sala, y `/descubrir`.

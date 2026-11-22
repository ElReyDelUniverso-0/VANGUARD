# EL MERCADO DE VANGUARD · v437.2 → v438.1 LA PLAZA VIVA

> Orden del Dueño, textual: *«veo las 10 familias de Vanguard, ocupan mucho
> espacio, la verdad. Haz que la presentación sea un módulo aparte donde se llame
> El Mercado de Vanguard, que tenga estética de mercado, donde presente cada
> módulo con un personaje enseñando cada uno, interactúe, con una música clásica
> sencilla y que se te quede en la cabeza. El módulo debe ser como feliz,
> colorido, enseña cada módulo perfectamente con sus secciones, ¿sabes? Y ya
> sabes: las 10 familias ahora son todos los módulos de Vanguard. Quítalos del
> menú principal.»*

Las nueve cosas, hechas: **módulo aparte** · **estética de mercado** · **un
personaje por familia** · **interactivo** · **música clásica sencilla y
pegadiza** · **alegre y colorido** · **cada familia con sus secciones** · **fuera
de la portada** · **fuera del menú principal**.

---

## 1 · Dónde está: `/mercado`

`src/app/mercado/page.tsx` — portada con foto real (`imagenes-reales/estambul.jpg`,
un bazar de verdad), cuatro cifras derivadas y la plaza debajo.

**La portada ya no las enseña.** En `src/app/page.tsx` se retiró `<Ecosistema />`
(el tráiler de las diez familias, que ocupaba una sección entera) y en su lugar
queda `MercadoPortada`: **una franja de una fila** con los diez toldos en
miniatura y una puerta. El menú principal (`NAV_PRIMARIO`) gana **una** entrada,
`Mercado` — una, no diez — y el muelle del móvil también lo lleva.
`/ecosistema` sigue viva (la evolución es aditiva); simplemente ya no vive en la
portada.

---

## 2 · La plaza: diez puestos, diez mercaderes

`src/lib/mercado/puestos.ts` — **datos puros**, sin React. No inventa nada: lee
`lib/experiencia/registro.ts` (las diez familias con su nombre, lema, promesa,
puerta, color, imagen y cifras) y le añade **lo único que aquí es escritura**: el
mercader.

| # | puesto | mercader | oficio | en las manos |
|---|---|---|---|---|
| 01 | Actualidad | **Nora** | la pregonera | una bocina de latón |
| 02 | Geografía | **Amílcar** | el cartógrafo | un globo terráqueo |
| 03 | Historia | **Elena** | la archivista | legajos y una lámpara |
| 04 | Ciencia | **Teo** | el boticario | un matraz |
| 05 | Economía y datos | **Rita** | la contable | una balanza |
| 06 | Educación | **Ibo** | el librero | un libro abierto |
| 07 | Simulaciones | **Kilombo** | el titiritero | una maqueta con hilos |
| 08 | Narrativa | **Vera** | la cuentacuentos | una cámara |
| 09 | Investigación | **Sergio** | el detective | una lupa |
| 10 | Nuevos mundos | **Aurelio** | el alfarero | el torno y la vasija |

Ningún mercader repite nombre, oficio, pieza ni saludo (la prueba lo vigila).

**Cada puesto enseña sus secciones**: la puerta principal primero y luego
**todas** las experiencias reales de esa familia — **47 secciones** en total, cada
una con su ruta, su explicación y su cifra. Si una familia no traía cifras en el
registro, el puesto cuenta lo que vende (`N secciones`): una cifra calculada,
nunca un adorno.

---

## 3 · Los personajes: dibujados, no descargados

`src/components/mercado/personaje.tsx` — un SVG de 120×138 por mercader. Traje
del color de su familia, delantal de lienzo, gorro/pelo/barba según la semilla
del puesto, y **la pieza de su oficio entre las manos** (diez piezas, diez
formas). Formas planas, pieles cálidas, ojos de dos trazos y una sonrisa: se lee
como un grabado de mercado, no como una mascota. **Ni una imagen descargada** (la
prueba lo comprueba).

---

## 4 · La estética: mercado, alegre, con oficio

`src/components/mercado/mercado.css`:

- **toldos de rayas** del color de cada familia, con **flecos** recortados en
  `clip-path` y sombra de lona;
- **mostrador de madera** con el letrero en tablilla y la **etiqueta de cartón**
  torcida (el número de secciones, como un precio);
- **suelo de adoquín** profundo, farolillos en el borde y halo cálido de plaza de
  noche: los colores vivos viven en el toldo y en el papel, nunca en un bloque
  plano detrás de un texto (eso es lo que vuelve infantil una interfaz);
- **bocadillo de papel** para el saludo del mercader y **lista en papel rayado**
  para las secciones.

Colorido y feliz, sí. De niño, no: oro y lino sobre casi negro, serif para los
carteles y monoespaciada para los precios.

---

## 5 · La música: una contradanza que se queda

`src/lib/mercado/musica.ts` — **compuesta aquí**, sin derechos de nadie:

- **Do mayor, 100 pulsos por minuto, 4/4, ocho compases** (la vuelta entera dura
  **19,2 s** y vuelve a empezar).
- Melodía en triángulo, bajo de madera en los pulsos 1 y 3 (contrabajo de plaza),
  pandereta muy por debajo en los pulsos 2 y 4 y **campana en las dos entradas**
  (compases 1 y 5) — es lo que hace que el oído sepa que la vuelta empieza otra
  vez.
- El gancho está en el compás 4: `Do5 · Sol4 · Mi4 · Do4`, y en el 8 remata
  `Do5 · Sol4 · Do5`. La armonía se lee en pantalla: `I · I · V · I · I · IV · V · I`.

Se toca **compás a compás** con el motor de la casa (`lib/sound.ts` a través del
portero de `lib/sonido/tocar.ts`), así que no hay bucle de audio que cargar ni
que descargar: **cero mp3**. Nunca suena sola (hace falta un toque), se calla con
su botón, se calla si cambias de pestaña y se calla si el Dueño apagó el sonido en
los interruptores de la casa.

---

## 6 · Interactivo, sin secuestrar

- Se **pasea**: cada toldo es un botón; al abrirlo, el mercader saluda, se pone
  de pie (`pm-saluda`) y su puesto se enciende en su color.
- Se **busca** por familia, lema, mercader, oficio, sección o ruta (sin tildes).
- **Escape** cierra el puesto. Todo es teclable y `aria-expanded`/`aria-live` lo
  anuncian.
- Cuatro **voces nuevas** para el mercado (con firma propia en el catálogo):
  `puesto-abrir`, `puesto-cerrar`, `moneda` y `mercado-musica`.
- Respeta `prefers-reduced-motion`, la perilla `data-vg-mov="quieto"` y el
  sistema `data-vg-anim="desactivadas"`: con quietud, los mercaderes no saludan,
  pero el mercado sigue entero.
- El **puesto del día** (rota con el día, sin azar y sin base de datos) se
  resuelve en el aparato, así que no hay desajuste de hidratación.

---

## 7 · Cómo comprobarlo

```bash
npx tsx tools/mercado/probar.mts          # 107 comprobaciones, 0 fallos
npx tsx tools/interfaz/probar.mts         #  80 comprobaciones, 0 fallos
npx tsx tools/descubrimiento/probar.mts   #  47 comprobaciones, 0 fallos
```

La prueba del mercado comprueba, entre otras cosas: que hay diez puestos y uno
por familia · que **cada sección es una ruta que existe de verdad** en `src/app`
(dinámicas incluidas) · que el tono hondo se calcula del color · que no se repite
ningún mercader ni ninguna pieza · que el buscador no inventa y no se rompe con
tildes · que la música no sale del oído (80–1200 Hz), no atruena (≤ 0,09), cabe
en la vuelta y lleva campana en las dos entradas · que **la portada ya no pinta
`<Ecosistema />`** y que el menú tiene una sola puerta al mercado · que no hay ni
un asset de audio ni una imagen descargada en los mercaderes.

En vivo: **`/mercado`**. Y en la portada, la franja de los diez toldos.

---

## 8 · v438.1 · LA PLAZA VIVA — lo que se sumó después

El Dueño dijo «sigue» y «púlelo más, agrega más». Nada de lo anterior se tocó;
todo lo que sigue se **suma**.

### 8.1 · El pregón (`src/lib/mercado/pregon.ts`)

Una cinta en la entrada que va soltando, puesto por puesto, lo que hay dentro:
**diez líneas compuestas con los datos reales** (familia, mercader, oficio, lema
y número de secciones) — no hay una frase publicitaria escrita a mano que la casa
no pueda sostener. Cada línea lleva a **su** puesto (`/mercado#puesto-<id>`), pasa
cada **7 s**, da la vuelta sin romperse y **se puede parar**. Con la casa en
movimiento quieto, la cinta no gira: se lee entera, quieta.

### 8.2 · La ronda

«Dar una vuelta» abre los diez puestos en orden, **uno cada 4,5 s**, cada uno con
su voz. Se para con su botón, con **Escape** o **tocando cualquier puesto**. Es
una ayuda, no un tour obligatorio (regla del Dueño: no secuestrar la exploración).

### 8.3 · La voz de los mercaderes

Cada mercader tiene **su persona de la boca de la casa** (`lib/voz/decir`:
locutora, analista, general, cronista). Solo habla si enciendes «que hablen» y si
el sonido no está apagado; cerrar el puesto corta la voz; si el aparato no sabe
hablar, el bocadillo de papel ya lo dice (la casa nunca finge que suena).

### 8.4 · La cesta (`src/lib/mercado/cesta.ts`)

En un mercado se echa a la cesta lo que quieres volver a ver: cada sección tiene
su tecla «a la cesta», el contador vive en la barra y el panel de la cesta enlaza
lo apuntado. Lógica **pura y probada**; se guarda en el aparato
(`vg:mercado:v1`), **tira sola las rutas que ya no existen**, tiene tope de 24 y
se vacía con un botón.

### 8.5 · Enlace directo

`/mercado#puesto-geografia` abre ese puesto. El enlace se puede **copiar** desde
el mostrador, y los diez toldos de la portada llevan cada uno al suyo. Abrir un
puesto **no recarga** la página (`history.replaceState`).

### 8.6 · La plaza responde

El puesto abierto manda y los demás se retiran un paso (y se recuperan al
tocarlos). Con movimiento quieto no hay salud ni ronda girando: la plaza se queda
quieta y sigue entera.

### 8.7 · Comprobado en esta tanda

```bash
npx tsx tools/mercado/probar.mts          # 156 comprobaciones, 0 fallos
npx tsx tools/interfaz/probar.mts         #  80 comprobaciones, 0 fallos
npx tsx tools/descubrimiento/probar.mts   #  47 comprobaciones, 0 fallos
```

Lo nuevo que vigila la prueba: que el pregón diga el mercader, la familia y las
secciones de cada puesto y que su enlace sea el de su puesto · que la ronda tenga
reloj y se pueda parar · que el mercader use **su** persona y que cerrar corte la
voz · que la cesta no acepte rutas inventadas, no duplique, respete el tope y
sobreviva a un JSON roto · que el enlace directo abra el puesto sin recargar.

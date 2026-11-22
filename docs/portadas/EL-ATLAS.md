# El atlas de portadas de la casa

**v439.4 · «LA CASA SE PONE PORTADA»**

## 1 · Lo que pidió el Dueño

> «Hay muchos módulos que les falta portadas hermosas con estilo único de
> Vanguard, están en todos los lugares o imágenes 4K.»

Y al preguntarle cómo:

> «Todo depende del módulo, la verdad. Sorprende con cada módulo, uno único, o
> sea todos.»

Se decidió **mixto**: arte de la casa (SVG) + **una fotografía de atmósfera**
detrás, y hacerlo **en todos** los módulos.

## 2 · El censo, medido en el disco

- **92 rutas** con `page.tsx`.
- **52** tenían portada propia (héroe o componente).
- **40 no tenían nada** — el hueco del que hablaba el Dueño.

Hoy: **93 fichas** en `src/lib/portadas/atlas.ts`, y **35 salas estrenan
portada** de una vez (las otras cinco sin héroe son salas inmersivas sin carcasa:
`/entrar`, `/clásico`, `/vanguard2`, `/vértigo`, `/offline`).

## 3 · Cómo se hace única cada portada

| Pieza | Qué aporta |
| --- | --- |
| **tono** | el color de la sala: 0–360, 70 colores distintos en uso |
| **técnica** | 12 maneras de dibujar: ojo, órbita, retícula, onda, barras, constelación, diana, espiral, curvas, red, prisma, sello |
| **glifo** | 28 símbolos: el ojo, la V, el mapa, el sello, el átomo, la lupa… |
| **semilla** | huella FNV de la ruta: mismo dibujo siempre, distinto en cada sala |
| **variantes** | cada técnica tiene sus modos (la red puede ser estrella, racimos o malla; el terreno, curvas de nivel, montaña o cordillera) |

No hay dos fichas con la misma combinación de técnica + glifo + color. La prueba
lo verifica.

## 4 · El mixto: la fotografía detrás

Las primeras seis salas con fotografía (`public/portadas/`, 1915×821, recorte
21:9, 120–280 KB): **ciencia, datos, demografía, galería, inteligencia,
investigación**.

La foto va al **34 %** con un degradado que la funde con el negro; el dibujo de
la casa va encima como estructura. No frena la carga: `loading="lazy"` y
`decoding="async"`.

## 5 · Dónde vive todo

```
src/lib/portadas/atlas.ts            las 93 fichas, paletas y semillas (puro)
src/components/portada/escena.tsx    el dibujante: 12 técnicas y 28 glifos
src/components/portada/portada-ruta.tsx  PortadaSala (una sala) + PortadaRuta (la ruta)
src/app/portada-ruta.css             la piel
src/app/layout.tsx                   se monta UNA vez, antes de {children}
public/portadas/*.jpg                las fotografías de atmósfera
tools/portadas/probar.mts            69 comprobaciones
```

## 6 · Comprobado

```bash
npx tsx tools/portadas/probar.mts         # 69 comprobaciones, 0 fallos
npx tsx tools/mercado/probar.mts          # 193 comprobaciones, 0 fallos
npx tsx tools/interfaz/probar.mts         #  80 comprobaciones, 0 fallos
npx tsx tools/descubrimiento/probar.mts   #  47 comprobaciones, 0 fallos
```

## 7 · Lo que queda (tandas siguientes)

1. Rehacer con este marco las **52** portadas que ya existían, sala por sala.
2. Seguir metiendo fotografías en `/public/portadas` (6 de 92 hoy).
3. Las cinco salas inmersivas (`/clásico`, `/vanguard2`, `/vértigo`, `/offline`,
   `/entrar`) tienen su propia ley visual y se tratan aparte.

# Departamento 4 · VANGUARD WORLD DATA — el centro de datos mundiales (v416.0)

Documento de entrega del departamento 4 del plan de los 22. Escrito para que otro
agente pueda continuar sin leer todo el código.

## 1 · Lo que había antes (auditoría medida, no supuesta)

| Pieza previa | Qué era de verdad | Qué le faltaba para «investigar países» |
|---|---|---|
| `/comparador` (v407.1) | 2–4 países, **8 indicadores**, contra una foto horneada del Banco Mundial (`censo-banco-mundial.json`) | sin serie histórica, sin educación/salud/energía/comercio/ambiente, sin filtros, sin puerta de máquina |
| `/rankings` | 8 listas mundiales | sin año fijo, sin filtro por región, sin método visible |
| `/demografia`, `/poder`, `/mundos/[iso]` | fichas con cifras sueltas, cada una con su fuente | tres motores distintos para lo mismo: repetir la misma tabla en cada módulo |
| `/datos` | catálogo de procedencia de 13 modelos | declaraba el Banco Mundial como *instantánea*, no como serie viva |
| `/conocimiento?modo=indicadores` | 35.463 observaciones de otra fuente | no comparables con el Banco Mundial sin declararlo |

**Diagnóstico:** la casa tenía datos, pero no un motor. Cada módulo repetía su
propia tabla de indicadores y ninguna podía responder «enséñame 1990-2025 de
estos dos países en estos seis indicadores».

## 2 · Funcionalidades construidas

1. **Catálogo de 52 indicadores en 9 categorías** (`src/lib/mundial/catalogo.ts`).
   Cada uno: id estable, código del Banco Mundial, unidad, decimales, formato,
   sentido (alto/mejor, bajo/mejor, neutro), **método** (qué mide y qué no),
   fuente, licencia, enlace de definición y pregunta en castellano.
2. **Banco de series en vivo** (`banco.ts`): API v2 del Banco Mundial, sin clave,
   caché 24 h en la plataforma + 10 min por instancia, timeout de 7 s y
   degradación honesta (`disponible:false`, nunca ceros inventados).
3. **Rankings con dos modos declarados**: año fijo (solo filas de ese año) o
   último dato por país (`mrnev=1`, con el año en cada fila).
4. **Explicación de la diferencia** (`explicar.ts`, puro): ratio («1,03 veces
   más»), brecha en la unidad del indicador y **aviso automático cuando los dos
   datos no son del mismo año**.
5. **Explorador** `/datos-mundiales`: tabla ordenable por cualquier columna,
   filtro por región, búsqueda, selector de indicador (agrupado por categoría) y
   de año; ficha metodológica del indicador a la vista.
6. **Comparador mundial** `/datos-mundiales/comparar`: 2–4 países × hasta 6
   indicadores, barras del último dato con su año, serie histórica (los huecos
   de la fuente se dibujan como cortes), tabla de los últimos años y las frases
   de comparación.
7. **Ficha de datos nacional** `/datos-mundiales/pais/[iso]`: seis cifras de
   cabecera iguales para todos los países + todas las de la categoría elegida,
   cada una con sparkline, fuente, método y enlace a comparar.
8. **Panel de desarrollo** `/datos-mundiales/panel`: agregados oficiales del
   Banco Mundial (WLD, HIC/MIC/LIC, seis regiones) en series largas; la casa no
   suma países a mano.
9. **Puerta de máquina** `/api/mundial` (contrato v407.0, muro 40/min, caché
   30 min): `catalogo | paises | serie | ranking | comparar | panel | todo`.

## 3 · Archivos

```
src/lib/mundial/catalogo.ts        52 indicadores (índice, sin cifras)
src/lib/mundial/banco.ts           series, rankings, países, agregados
src/lib/mundial/explicar.ts        la frase que explica la diferencia
src/lib/mundial/formato.ts         formato español de cifras y unidades
src/app/api/mundial/route.ts       puerta de máquina (6 secciones)
src/app/datos-mundiales/page.tsx            explorador
src/app/datos-mundiales/comparar/page.tsx   comparador mundial
src/app/datos-mundiales/pais/[iso]/page.tsx ficha nacional
src/app/datos-mundiales/panel/page.tsx      panel de desarrollo
src/components/mundial/*.tsx       marco, controles, tabla, selector,
                                   gráfico de líneas, barras, sparkline, CSS
scripts/pruebas-mundial.mjs        29 comprobaciones (código + en vivo + API)
```

## 4 · Integración en la casa (no es un módulo aislado)

- **Núcleo**: cuatro módulos nuevos (`mod:datos-mundiales`,
  `mod:comparador-mundial`, `mod:panel-desarrollo`, `mod:ficha-datos-pais`), así
  que aparecen en `/nucleo`, en la búsqueda y en `/directorio`.
- **Catálogo de endpoints**: `/api/mundial` documentado (grupo `datos`).
- **Catálogo de datos** `/datos`: nuevo modelo `dato:serie-mundial` con
  procedencia, licencia, caché, rutas y límites.
- **Censo y grafo**: regenerados; 101 páginas, 117 rutas de API, 0 huérfanas;
  `app/datos-mundiales` entra como segunda área más acoplada (27 referencias).
- **Sitemap**: `/datos-mundiales`, `/datos-mundiales/comparar`,
  `/datos-mundiales/panel` (las fichas de país ya entran por `PAISES_GEO`).
- **Puertas vecinas**: `/comparador` avisa del comparador mundial; `/datos`
  enlaza al centro; la ficha enlaza a `/mundos/[iso]` y viceversa por el marco.
- **Departamento 7 del registro** actualizado: ya no lista como faltantes las
  series históricas ni el empleo (ahora existen) y declara los pendientes reales
  (inflación, desglose sectorial, comercio bilateral, migración).

## 5 · Reglas que cumple (las del encargo, literales)

- **Cada indicador con fuente identificable, fecha, unidad y explicación** →
  campos obligatorios del catálogo; la prueba falla si falta uno.
- **No inventar cifras** → ninguna cifra vive en el repositorio: todo es `fetch`
  a la fuente, y `null` no se convierte en 0.
- **No mezclar años sin indicarlo** → modo de ranking declarado, año en cada
  fila y aviso en la frase de comparación cuando difieren.
- **Un usuario elige dos países, compara indicadores y comprende las
  diferencias** → `/datos-mundiales/comparar?paises=do,ht&indicadores=…` con
  barras, series y frases.

## 6 · Pruebas

```
node scripts/pruebas-mundial.mjs                                  # 29 ✓
node scripts/pruebas-mundial.mjs https://vanguard-kq9r.vercel.app  # + API y páginas en vivo
node scripts/pruebas-arquitectura.mjs                              # 15 ✓ (censo y grafo cuadran)
```

## 7 · Lo que NO se ha hecho (y por qué)

- **Inflación**: el Banco Mundial la publica con cobertura irregular y serie que
  se rompe (cambio de base); exigiría declarar cobertura por país. Pendiente con
  nota escrita en el registro del departamento.
- **Desglose del PIB por sector y comercio bilateral (quién vende a quién)**:
  requiere otra fuente (UNCTAD/OCDE) y la regla de la casa prohíbe mezclar
  fuentes en una misma serie sin declararlo.
- **Migración y remesas**: pendiente de catálogo propio.
- **Más de 4 países en pantalla**: la API acepta 6; la interfaz limita a 4 por
  legibilidad (declarado en el registro).

## 8 · Próxima expansión concreta

1. Exportación CSV de cualquier serie del centro (con su año y su fuente en cada
   fila) y enlace permanente a la vista.
2. Inflación y desglose sectorial con **cobertura declarada por indicador**
   (cuántos países y qué años) calculada en el propio motor.
3. Página de comparación por regiones (agregados) ya está; falta el mismo
   comparador para **grupos de renta** con la misma frase de diferencia.

# ZONA CERO · LA MESA DE ÓRDENES (v434.2)

Orden del Dueño, textual: *«mejora la zona cero, que sea un módulo completo, expándela;
que uno pueda señalar, corregir, editar, poner capturas, poner órdenes por números, o
sea de todo; y que se pueda poner una API key, también predecir y muchas más cosas»*.

La Zona Cero tenía **el ojo** (buscar en toda la casa) y **el teatro** (la mesa de guerra
en 3D). Le faltaba **el papel**: dónde se manda. Eso es esta sala → `/zona-cero/mesa`.

---

## 1 · Seis puertas

| Puerta | Qué se hace |
|---|---|
| **ÓRDENES** | Órdenes **numeradas solas** (1, 2, 3…) con prioridad P1–P5, estado (pendiente · en curso · hecha · descartada), progreso, vencimiento, etiquetas y **dependencias** entre órdenes. Se suben/bajan y se renumeran; si se borra la 2, la 3 pasa a ser la 2. |
| **TABLERO** | **Señalar**: un clic pone una señal donde tocas. Se **arrastra** para moverla. Cada señal tiene número, nombre, tipo (señal · riesgo · objetivo · recurso · nota), color, nota y una **puerta de la casa** opcional (`/mapas`, `/en-vivo`…). |
| **CAPTURAS** | **Se pega con Ctrl+V**, o se arrastra un archivo, o se elige uno. Con título, fuente, nota y tamaño. Se guardan en el aparato, **nunca se suben**. Tope por captura configurable (0,5–4 MB) y máximo 40. |
| **PREDECIR** | El motor de la casa calcula cuatro probabilidades con **tus** datos y enseña los factores de cada número y su confianza. Opcional: **narración** (tu clave o el núcleo de la casa). |
| **HISTORIAL** | Cada corrección deja el antes y el después, con hora. **Deshacer** la última con un botón. |
| **AJUSTES** | **API key** de tu proveedor (OpenAI · Groq · OpenRouter · cualquier base compatible), modelo, dirección, tope de capturas, horizonte, exportar/importar la mesa y **olvidar todo**. |

## 2 · La API key (y por qué es opcional)

- **Sin clave**, las predicciones funcionan igual (son deterministas y locales) y la
  narración la intenta el **núcleo de la casa**.
- **Con clave**, la narración la hace **tu** proveedor. La clave se guarda **solo en tu
  aparato** (`localStorage`), viaja únicamente a la dirección que tú pongas cuando pulsas
  un botón, y **no se registra** ni se guarda en el servidor. El botón *probar* dice si
  responde o no, y *borrar clave* la quita de un golpe.
- Solo se aceptan direcciones `https://` (o `http://localhost`). Si pones otra cosa, la
  casa **no envía la clave** y lo dice.

```bash
# lo que hay detrás (por si quieres llamarlo tú)
curl -s https://vanguard-kq9r.vercel.app/api/zona-cero/predecir | head -40
```

## 3 · Predecir: qué es y qué no es

No adivina el mundo. Mide **tu mesa** y lo declara:

```
cierre    ¿se cierra lo abierto en el horizonte?   ← vencidas, bloqueos, críticas, avance
retraso   ¿se retrasa por dependencias?            ← bloqueadas, vencidas
respaldo  ¿está respaldada con pruebas?            ← señales + capturas frente a órdenes
vence     ¿se te pasa un vencimiento?              ← vencidas hoy, días al más próximo
```

Cada resultado trae **factores** (etiqueta, valor, peso), una **frase** que lo explica y una
**confianza** que baja cuando hay poca mesa (con 3 órdenes, la confianza es ~15 % y lo dice).
Los porcentajes nunca son 0 % ni 100 %: una mesa no es una certeza.

## 4 · Dónde vive cada cosa

- `src/lib/zona-cero/mesa.ts` — el modelo (órdenes, señales, capturas, correcciones,
  predicción, exportar/importar, saneado). Puro y probado.
- `src/lib/zona-cero/almacen.ts` — el almacén del aparato (`vg:zona-cero:mesa:v1`).
- `src/app/api/zona-cero/predecir/route.ts` — la puerta de predecir (motor + narración).
- `src/components/zona-cero/mesa-ordenes.tsx` + `.css` — la sala.
- `src/app/zona-cero/mesa/page.tsx` — la ruta.
- Puerta desde el ojo: el cartel **«Abrir LA MESA DE ÓRDENES»** en `/zona-cero`.

## 5 · Probarlo

```bash
npx tsx tools/zona-cero/probar.mts      # 45 comprobaciones, 0 fallos
```

Comprueba, contra el código real: que las órdenes se numeren y renumeren sin agujeros; que
corregir deje rastro y deshacer devuelva el texto exacto; que borrar no deje dependencias
huérfanas; que una captura de 9 MB o que no sea imagen se rechace **con motivo**; que predecir
sea determinista, explique sus factores y baje la confianza con poca mesa; que exportar e
importar devuelva la misma mesa; y que un almacén manipulado se sane sin romper la pantalla.

## 6 · Lo que no hace (para que no haya sorpresas)

- **No guarda nada en la nube**: si cambias de aparato, exporta el JSON e impórtalo.
- **No lee tus capturas**: no hay OCR ni visión; la captura es prueba, no dato.
- **No promete aciertos**: da probabilidades con sus motivos. Si la mesa está vacía, lo
  primero que dice es que está vacía.

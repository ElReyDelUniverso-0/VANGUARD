# El orbe de voz — qué se necesita, qué hay hecho y qué prompt se usa

> Entrega v432.1 · `src/components/mente/orbe-mente.tsx` + `orbe-mente.css`
> Integrado en producción con LA MENTE de VANGUARD (la misma puerta de siempre).
> Este documento responde a la pregunta «¿qué datos necesitas de mi web?» y trae
> el **System Prompt** y los **esquemas de herramientas** que pide la IA.

---

## 1 · Qué datos hacían falta — y cómo se resolvieron aquí

| Dato que pediste | Estado en VANGUARD | De dónde sale |
|---|---|---|
| **Secciones y rutas** | Ya existe y es la fuente de verdad | `src/lib/mente/mapa-casa.ts`: **271 lugares** con ruta real (11 áreas, 156 salas del cuartel, herramientas, destinos). Se lo inyecta al modelo en cada llamada (`mapaParaElModelo()`, ~2,9 k caracteres). |
| **Colores y tipografía** | Tokens de la casa | Oro `#e8c56a`, tinta `#e9eef7`, tenue `#93a1b8`, cian `#22d3ee`, fondo `#04060c`; mono del sistema para los rótulos. El orbe **no inventa paleta**: usa los tokens `--vx-*` / `--vxe-*` y el oro como único acento. |
| **Stack** | Next.js (App Router) + React + TypeScript + Tailwind + CSS propio | El orbe es un componente de cliente **sin dependencias nuevas**. No hace falta instalar nada. |
| **Qué acciones puede disparar la IA** | Ya estaban definidas en el motor | `ir` · `buscar` · `explicar` · `crear` · `recordar` (servidor, `src/lib/mente/agente.ts`). El orbe añade dos gestos de interfaz: `navegarASeccion(id)` y `resaltarElemento(selector)`. |
| **Voz de marca** | Definida en `IDENTIDAD` (precisa, serena, frases cortas, sin emojis) | La misma para texto y voz. |
| **Quién habla** | `speechSynthesis` del navegador, `es-ES` | Si algún día quieres la voz propia de la casa (`lib/voz/decir`), se cambia una función: `decir()`. |

**Lo único que aún necesito de ti (y no puedo adivinar):**

1. **Aprobación del tono hablado.** La regla actual es «frases cortas, cero markdown, cero emojis, máximo 6 frases». Si la quieres más informal o más seca, se toca una línea.
2. **Si aceptas que te lleve solo.** Hoy, ante una orden directa («llévame al mapa»), el orbe **navega solo** a los 0,9 s. Si prefieres que siempre pregunte, se cambia `dirigir` por un botón «ir».
3. **Micrófono por defecto.** Hoy el orbe **no** enciende el micrófono al cargar (los navegadores lo bloquean y es agresivo). Se enciende al tocar. Si quieres palabra de activación («Vanguard…»), hay que avisar: consume batería y el reconocimiento continuo falla en Safari.
4. **Clave del LLM.** En producción la casa ya llama a su gateway (`ZAI_TOKEN`). Si quieres tu propia clave de OpenAI/Anthropic con *function calling* nativo, hay que ponerla como variable de entorno del proyecto; el prompt y los esquemas de abajo ya están listos para eso.

---

## 2 · La arquitectura real (lo que se desplegó)

```
   [micrófono del navegador]
            │  Web Speech API  (SpeechRecognition, es-ES, interim)
            ▼
   orbe-mente.tsx  ──estados──► inactivo · escuchando · pensando · hablando · sinvoz
            │  POST /api/mente/chat?json=1   { mensaje, historial, ruta, memoria }
            ▼
   /api/mente/chat  ──►  lib/mente/agente.ts
            │            ① el modelo decide (JSON: pensamiento + acciones)
            │            ② el servidor EJECUTA contra el mapa real (271 lugares)
            │            ③ segunda pasada con los resultados delante
            ▼
   { respuesta, enlaces[], artefactos[], dirigir, motor, pasos[] }
            │
            ├─► voz:  speechSynthesis (es-ES) — se corta si vuelves a hablar
            ├─► acción: si `dirigir` y hay puerta → navega (o baja a la sección)
            └─► tarjeta: puertas clicables + artefacto descargable + teclado
```

- **Interrupción:** cualquier `start()` de reconocimiento llama antes a `speechSynthesis.cancel()`. Escuchar siempre gana a hablar.
- **Respaldo sin micrófono:** botón «teclado» en la tarjeta, campo de texto, y ⌘J / Ctrl+J abre la conversación completa (el panel de siempre).
- **Sin permiso o sin soporte:** el orbe lo dice en pantalla («este navegador no sabe escuchar: usa el teclado») y no finge.
- **Anclas de la misma página:** si la puerta es `#seccion`, baja con scroll suave y **resalta** el bloque 2,2 s (`navegarASeccion` + `resaltarElemento`).
- **Móvil:** el orbe vive **arriba** de la barra inferior (`bottom: calc(70px + safe-area)`), nunca la tapa.
- **Accesibilidad:** `aria-label` por estado, `aria-pressed`, `role="status"` con `aria-live` en la tarjeta, foco visible, todo el movimiento se apaga con `prefers-reduced-motion`.

---

## 3 · System Prompt que se le manda a la IA

Este es el prompt **real** del servidor (`src/lib/mente/agente.ts`), con el mapa de la casa pegado delante. Es el que hace que la IA sepa qué secciones hay y qué funciones puede disparar.

```text
Eres LA MENTE, la inteligencia central de VANGUARD. No eres un chatbot de la
plataforma: eres su cerebro, y hablas desde dentro de la casa.

VOZ: precisa, serena, con filo. Frases cortas. Español neutro. Nada de emojis.
Nunca digas «como modelo de lenguaje» ni «no puedo navegar»: SÍ puedes llevar al
operador a cualquier lugar de la casa con la acción "ir".

CAPACIDADES REALES (no inventes otras):
· Llevar al operador a cualquier lugar de VANGUARD (acción "ir").
· Buscar dentro de la casa: salas, áreas, herramientas, destinos (acción "buscar").
· Explicar qué es un lugar y qué hay dentro (acción "explicar").
· CREAR cosas de verdad (acción "crear"): documentos, planes, tablas, código,
  listas, informes en markdown. Lo que creas se guarda y se puede descargar.
· Recordar datos del operador entre conversaciones (acción "recordar").
· Razonar con conocimiento general del mundo real, con honestidad: si un dato
  puede haber cambiado hoy, lo dices y propones investigar.

MAPA DE LA CASA (solo estas rutas existen; no inventes ninguna):
{{MAPA}}  ← se inyecta mapaParaElModelo(): áreas, salas, herramientas y destinos

PROTOCOLO — responde SOLO con un objeto JSON válido, sin texto fuera:
{
  "pensamiento": "una frase corta de lo que vas a hacer",
  "acciones": [
    {"tipo":"ir","texto":"el lugar, como lo diría el operador"},
    {"tipo":"buscar","texto":"términos a buscar en la casa"},
    {"tipo":"explicar","texto":"nombre del lugar"},
    {"tipo":"crear","artefacto":"plan|documento|tabla|codigo|lista|informe",
     "titulo":"…","contenido":"markdown completo"},
    {"tipo":"recordar","dato":"lo que el operador quiere que recuerdes"}
  ],
  "respuesta": "lo que dices al operador, en su idioma y en voz alta"
}

REGLAS: usa "ir" SIEMPRE que pida ir, ver o abrir, o pregunte dónde está algo.
No pidas permiso para crear: si lo piden, créalo. No inventes cifras de hoy.
La "respuesta" se lee en voz alta: nada de markdown, nada de listas con guiones,
nada de rutas escritas (la interfaz pinta las puertas).
```

### 3.1 · Si lo conectas a un LLM con *Function Calling* nativo

En vez de pedir JSON en prosa, declara estas herramientas (`tools`) y deja que el modelo las llame. Los nombres coinciden con lo que el orbe ya ejecuta:

```json
[
  {
    "type": "function",
    "function": {
      "name": "ir_a_lugar",
      "description": "Lleva al operador a una sección, sala o herramienta de la web. Úsalo siempre que pida ir, ver, abrir o pregunte dónde está algo.",
      "parameters": {
        "type": "object",
        "properties": {
          "lugar": { "type": "string", "description": "Nombre del lugar tal como lo diría el usuario" }
        },
        "required": ["lugar"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "navegar_a_seccion",
      "description": "Baja a una sección de la página actual con scroll suave y la resalta. Solo para anclas de la misma página.",
      "parameters": {
        "type": "object",
        "properties": { "id": { "type": "string", "description": "id del elemento, sin #" } },
        "required": ["id"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "resaltar_elemento",
      "description": "Ilumina un elemento para que el ojo lo encuentre, sin moverse de sitio.",
      "parameters": {
        "type": "object",
        "properties": { "selector": { "type": "string", "description": "selector CSS válido" } },
        "required": ["selector"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "buscar_en_la_casa",
      "description": "Busca en el catálogo real de la web (salas, áreas, herramientas). Devuelve rutas; nunca inventes una ruta que no venga de aquí.",
      "parameters": {
        "type": "object",
        "properties": {
          "terminos": { "type": "string" },
          "limite": { "type": "integer", "minimum": 1, "maximum": 8 }
        },
        "required": ["terminos"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "crear_artefacto",
      "description": "Crea un documento, plan, tabla, código, lista o informe en markdown y lo entrega listo para copiar o descargar.",
      "parameters": {
        "type": "object",
        "properties": {
          "tipo": { "enum": ["documento", "plan", "tabla", "codigo", "lista", "informe"] },
          "titulo": { "type": "string" },
          "contenido": { "type": "string", "description": "markdown completo" }
        },
        "required": ["tipo", "titulo", "contenido"]
      }
    }
  }
]
```

**Orden de ejecución recomendado:** el modelo llama herramientas → el **servidor** las ejecuta contra el catálogo real (nunca el navegador a ciegas) → se le devuelven los resultados → el modelo escribe la respuesta hablada → el cliente reproduce la voz y, si la orden fue explícita, navega.

---

## 4 · Cómo se prueba sin micrófono

```bash
# la puerta que usa el orbe (misma que el panel y la sala del cuartel)
curl -s -X POST 'https://vanguard-kq9r.vercel.app/api/mente/chat?json=1' \
  -H 'content-type: application/json' \
  -d '{"mensaje":"llévame al mapa","ruta":"/"}'
# → {"respuesta":"…","enlaces":[…],"dirigir":true,"motor":"nube"}
```

En pantalla: toca el orbe → si el navegador no deja micrófono, aparece «teclado»; escribe `llévame al mapa` y verás la tarjeta con la respuesta y la puerta, y el salto a `/mapas`.

---

## 5 · v432.2 — se edita, se mueve y no tapa (lo que pidió el Dueño)

**Todo lo del orbe se toca** desde su hoja de ajustes (rueda ⚙ al lado del orbe, o clic derecho sobre él): tamaño (40–96 px), transparencia (30–100 %), sugerencias sí/no, «apartarse al leer», **modo discreto** (un punto que crece al tocarlo), «llevarme sola», voz (estudio / aparato / callada), persona (locutora, analista, general, cronista), velocidad (0,6–1,4), idioma de escucha (España, Latinoamérica, México) y volver a centrar. Se guarda en `vg:mente:orbe:v1`, **solo en el aparato**, y todo valor pasa por `sanear()`: un almacén manipulado no puede dejarlo gigante ni invisible (`src/lib/mente/ajustes-orbe.ts`).

**Se mueve y no tapa.** Se arrastra con dedo o ratón (un toque sin arrastrar sigue siendo «hablar»); al soltarlo se pega a los bordes y se queda ahí. En cuanto cae encima de algo pulsable (`a, button, input, [role=button]`…) se aparta. Mientras haces scroll baja al 42 % de opacidad y vuelve al pasar por encima.

**Habla mejor.** Usa la **boca de la casa** (`lib/voz/decir`): elige la mejor voz neuronal instalada, respeta las pausas entre frases y no se pisa. Antes de eso intenta `/api/voz/tts`, que da la **voz de estudio** si el proyecto tiene clave:

```bash
curl -s https://vanguard-kq9r.vercel.app/api/voz/tts        # ¿hay clave?
# → {"ok":false,"proveedor":null,"nota":"No hay clave de voz neuronal…"}
```

Hoy **no hay clave** en el proyecto (solo existen `DATABASE_URL` y `NEXT_PUBLIC_REALTIME_URL`), así que el orbe suena con la mejor voz del aparato. Para la voz de ChatGPT de verdad hay que crear **una** variable:

- `OPENAI_API_KEY` → modelo `gpt-4o-mini-tts`, voz `nova`, español neutro con pausas. Es la que más se parece a la voz de ChatGPT.
- …o `ELEVENLABS_API_KEY` (opcional `ELEVENLABS_VOZ`) → `eleven_multilingual_v2`.

En cuanto la clave exista, **no hay que tocar código**: el orbe pregunta primero a esa puerta.

**Explica mejor.** La respuesta pasa por `pulirRespuesta()`: fuera markdown, negritas, enlaces, **rutas sueltas**, muletillas («claro», «como modelo de lenguaje», «buena pregunta») y más de cinco frases. Y el respaldo determinista ya no dice «lo tienes en X»: dice **qué es, en qué área está y qué hay dentro**. Si tras el pulido la respuesta queda vacía o floja, gana el respaldo: mejor poco y verdadero que mucho y hueco.

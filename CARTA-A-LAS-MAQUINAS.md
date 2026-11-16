# LA CARTA A LAS MÁQUINAS — v405.6 (ia3)

> Dos superficies nuevas para que una máquina entienda la casa **sin adivinar**.
> Ni una línea de UI, ni una cadena de idioma, ni un toque a la base de datos.

---

## 1. `/llms.txt` — la carta para asistentes de IA

El estándar [llmstxt.org](https://llmstxt.org) es un archivo de texto breve que un
asistente lee **antes** de decidir qué es un sitio. En 2026 la pregunta «¿qué
juego de guerra gratis hay en el navegador?» se la hace la gente a un chat, no a
Google — y el chat solo puede citar lo que entiende.

```
https://vanguard-kq9r.vercel.app/llms.txt
```

**Está generado, no escrito a mano.** La lista de puertas sale de
`CONSTELACIONES` (`src/lib/vanguard/mapa-salas.ts`) — el **mismo archivo** del que
comen `/modulos`, el buscador ⌘K y las 20 rutas `/constelacion/<clave>`. Si la
casa añade una sala, la carta la dice sola; si la quita, deja de mentir.
**Cero listas paralelas.**

Medido al generarlo: **47 líneas · 5.556 caracteres · 24 URLs · 20 constelaciones · 155 salas.**

## 2. `/descubrimiento.json` — lo mismo, pero con números

```
https://vanguard-kq9r.vercel.app/descubrimiento.json
```

Una sola llamada devuelve:

| Bloque | Qué dice |
|---|---|
| `sitio` | casa, host, idioma, gratis, sin registro |
| `puertas` | las 20 constelaciones con su descripción real y cuántas salas tiene cada una |
| `mapas` | dónde están el sitemap, el feed, `llms.txt`, `robots.txt` y el estado |
| `sitemap` | cuántas URLs hay **y hace cuántos segundos se contaron** |
| `faro` | la tanda que toca ahora, el ritmo, la vuelta completa y los motores |

### Por qué vive en la raíz y no en `/api/`

`robots.txt` **prohíbe `/api/` a los rastreadores** (v204, «las cocinas no se
rastrean»). Publicar el mapa del sitio en una ruta prohibida sería una broma.

### Qué NO expone

La frontera de datos de `COORDINACION.md` deja fuera **cuentas, jugadores,
telemetría y conversación**. Aquí no aparece ninguna de esas fuentes: solo lo
público.

### El caché, declarado

Contar las URLs de verdad obliga a llamar al sitemap (que consulta la base). Se
cachea **10 minutos por instancia** y la respuesta dice **`contadoHaceSegundos`**.
Si el número tiene 9 minutos, se dice. Nada de cifras sin fecha.

---

## 3. Una ley, tres lectores

```
src/lib/faro.ts   ← la cuenta (tanda, ritmo, llave, motores)
   ├── .github/workflows/faro-indexnow.yml   (ejecuta)
   ├── /api/indexnow                         (audita)
   └── /descubrimiento.json                  (publica)
```

Antes la fórmula vivía copiada en dos sitios. Ahora vive en uno: si un día
dejaran de coincidir, sería visible en un diff. El JSON de `/api/indexnow` **no
cambió ni un campo** (los consumidores viejos, intactos).

---

## 4. Cómo comprobarlo sin creerle a nadie

```bash
curl -s https://vanguard-kq9r.vercel.app/llms.txt | head -12
curl -s https://vanguard-kq9r.vercel.app/descubrimiento.json | python3 -m json.tool
curl -s https://vanguard-kq9r.vercel.app/api/indexnow | python3 -m json.tool
```

Los tres tienen que contar **la misma** tanda. Si no coinciden, algo se rompió.

---

## 5. Lo que sigue fuera de alcance

- **Google sigue sin hablar IndexNow.** `llms.txt` y `descubrimiento.json` ayudan
  a los asistentes que leen la web; Google necesita **Search Console** (cuenta
  del Dueño) y enlaces reales entrantes.
- Nada de esto **garantiza** una cita: describe la casa para que, cuando alguien
  pregunte, la respuesta pueda ser correcta.

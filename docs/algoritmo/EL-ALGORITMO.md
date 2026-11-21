# EL ALGORITMO DE LA CASA — cómo funciona el «PARA TI» de VANGUARD (v432.4)

Mandato del Dueño: *«agrégale un algoritmo como el de TikTok»*.
Esto es lo que hay dentro, sin cajas negras. Todo se aprende **en tu aparato**:
ni un byte sale a un servidor, ni hay perfiles, ni cookies de terceros.

---

## 1 · La idea en una frase

El feed **no ordena por fecha**. Ordena por lo que cree que vas a ver hasta el
final, y aprende de lo que de verdad haces con cada tarjeta.

```
puntuación = 2,4·gusto + 1,5·estancia + 1,0·enganche
           + 1,7·frescura + 0,7·exploración + empuje + castigos
```

Cada tarjeta del feed trae su **desglose numérico** (pasa el ratón por la
etiqueta dorada «PORQUE…») y su frase en cristiano: *«porque te gusta
DIVISAS»*, *«para que descubras algo nuevo»*, *«lo viste hace poco»*.

## 2 · Qué ve la máquina (`lib/para-ti/rasgos.ts`)

Cada contenido se convierte en rasgos: `tipo:video`, `tema:divisas`,
`autor:analista`. Los temas salen del título y de las etiquetas reales del
contenido; las palabras vacías («de», «la», «que») no cuentan. Si un título no
dice nada, ese contenido aporta menos rasgos — y el motor lo nota.

## 3 · Lo que aprende (`lib/para-ti/memoria.ts`)

Cada rasgo lleva una **distribución Beta**: dos números (aciertos y fallos) que
dan a la vez *cuánto te gusta* y *cuánta certeza hay*. Con poca muestra no se
cree nada; un tema desconocido no es «malo», es una incógnita.

| Gesto | Efecto |
|---|---|
| Saltar en menos de 2 s | **resta** (0,8) |
| Verlo entero | suma 1,0 |
| Like | suma 1,2 · quitarlo resta 0,8 |
| Guardar | suma 1,4 |
| Compartir | suma 1,6 |
| Comentar | suma 0,8 |
| Seguir al autor | suma 2,0 |
| «No me interesa» | **resta 2,0** |

**Nada es para siempre:** cada 30 días la evidencia se diluye a la mitad. Si
cambias de gustos, el algoritmo cambia contigo en semanas.

## 4 · Cómo se ordena (`lib/para-ti/motor.ts`)

- **Gusto** — media de las Beta de sus rasgos, encogida según la certeza.
- **Estancia** — probabilidad de que lo veas entero: lo medido en la casa
  (tiempo medio / vistas) mezclado con tu costumbre real.
- **Enganche** — likes + guardados + compartidos sobre vistas, suavizado
  (1 like en 3 vistas no es un 33 %).
- **Frescura** — decaimiento exponencial, con vida media por tipo: lo que está
  pasando ahora (`vivo`) se apaga en 3 h; un vídeo aguanta 24 h.
- **Exploración** — muestreo de Thompson: cuanta menos certeza hay sobre un
  rasgo, más papeletas tiene. Sin esto el feed se encierra en lo que ya sabes.
- **Castigos** — lo visto hace menos de 8 h pierde hasta 1,8; lo que saltaste
  pierde más; repetir autor o tipo en la misma sesión cansa.
- **Diversidad** — regla dura: si las dos últimas tarjetas son del mismo tipo,
  la tercera de ese tipo no entra mientras haya otra cosa.
- **Reproducible** — la exploración usa una semilla de sesión: el mismo día,
  el mismo feed; al recargar, cambia.

## 5 · La caja negra, abierta

Dentro del feed, botón **ALGORITMO** (arriba a la izquierda):

- el termómetro del feed (frescura, exploración, castigo medios);
- tus gustos aprendidos, con su porcentaje y su barra;
- **RE-ORDENAR** — vuelve a pasar el motor con lo aprendido ahora mismo;
- **OLVIDARME** — borra todo lo aprendido. El olvido no se pide: se tiene.

## 6 · Probarlo

```bash
npx tsx tools/para-ti/probar.mts     # 47 comprobaciones, 0 fallos
```

Comprueba que no inventa contenido, que no pierde ni repite tarjetas, que un
like sube y un salto baja, que «no me interesa» pesa más que saltar, que la
evidencia se diluye a los 30 días, que lo visto hace un minuto se aparta y a
las 26 horas vuelve, que nunca apila tres del mismo tipo si hay variedad, que
explora cuando no sabe y deja de explorar cuando ya sabe, y que la misma
semilla da el mismo feed.

## 7 · Dónde vive

- `src/lib/para-ti/rasgos.ts` — qué ve la máquina.
- `src/lib/para-ti/memoria.ts` — qué aprende y cómo olvida.
- `src/lib/para-ti/motor.ts` — cómo puntúa y cómo ordena.
- `src/lib/para-ti/almacen.ts` — dónde se guarda (`vg432:algoritmo:v2`).
- `src/lib/algoritmo-feed.ts` — puente con las tarjetas reales de la casa.
- `src/components/vanguard/panels/foryou-panel.tsx` — el feed: mide el tiempo
  en pantalla, y tiene guardar, compartir y «no me interesa» como señales.
- Feed: `/cuartel?sala=foryou` (LA MENTE lo conoce: «llévame a para ti»).

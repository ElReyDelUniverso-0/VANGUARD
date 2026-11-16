// ============================================================
// v405.6 LA CARTA A LAS MÁQUINAS — LA LEY DEL FARO, EN UN SOLO SITIO
//
// El faro (`.github/workflows/faro-indexnow.yml`), su cara legible
// (`/api/indexnow`) y el mapa para agentes (`/descubrimiento.json`) tienen que
// decir LO MISMO. Si la cuenta vive copiada en tres archivos, un día uno se
// queda atrás y la casa empieza a mentir en un sitio mientras dice la verdad en
// otro. Aquí está la cuenta, una vez.
//
// La rotación NO necesita estado, ni base de datos, ni memoria entre pasadas:
//   tanda = floor(segundos_desde_1970 / 6 h) % total_de_tandas
// El workflow la calcula con el mismo reloj (tiempo UNIX) y la misma fórmula.
// ============================================================

/** La llave de IndexNow. NO es un secreto: IndexNow funciona al revés que una
 *  API key — el dueño publica `public/<llave>.txt` y el buscador lo descarga
 *  para comprobar que quien avisa es el dueño. Por eso puede vivir en el repo.
 *
 *  Se usa la que los cuatro motores ya tienen verificada (medido 16-nov-2026).
 *  La otra llave del repo (4649a31d…) responde 403 en Bing: cacheó el 404 de su
 *  primera comprobación. Ver SEO-INDEXNOW.md. */
export const LLAVE_INDEXNOW = process.env.INDEXNOW_KEY || "074b8db50cc83f0689a2211e3ff94db1";

/** URLs por tanda. IndexNow acepta 10.000 por POST; 200 no es un límite técnico,
 *  es una decisión: avisar de 200 cosas nuevas cada 6 h es señal; avisar de 2.087
 *  cada 6 h es ruido. */
export const TAMANO_TANDA = 200;

/** Cada cuántas horas gira el faro (coincide con el cron del workflow). */
export const HORAS_TANDA = 6;

/** Los motores que hablan IndexNow. Google NO está: no lo habla. */
export const MOTORES = [
  { nombre: "IndexNow (redirección a todos los participantes)", endpoint: "https://api.indexnow.org/indexnow" },
  { nombre: "Bing (y Copilot / ChatGPT Search)", endpoint: "https://www.bing.com/indexnow" },
  { nombre: "Yandex", endpoint: "https://yandex.com/indexnow" },
  { nombre: "Seznam (Chequia)", endpoint: "https://search.seznam.cz/indexnow" },
] as const;

export type TandaFaro = {
  numero: number;
  de: number;
  desde: number;
  hasta: number;
  tamano: number;
};

/** La tanda que le toca a un instante dado, para un total de URLs dado.
 *  Función pura: mismo instante + mismo total ⇒ misma tanda, en cualquier sitio. */
export function tandaDe(ahoraMs: number, totalUrls: number, tamano = TAMANO_TANDA): TandaFaro {
  const tandas = Math.max(1, Math.ceil(totalUrls / tamano));
  const indice = Math.floor(ahoraMs / (HORAS_TANDA * 3_600_000)) % tandas;
  const desde = indice * tamano;
  const hasta = Math.min(desde + tamano, totalUrls);
  return {
    numero: indice + 1,
    de: tandas,
    desde: totalUrls === 0 ? 0 : desde + 1,
    hasta,
    tamano: Math.max(0, hasta - desde),
  };
}

/** Cuántos días tarda el faro en dar la vuelta completa al mapa. */
export function vueltaCompletaDias(totalUrls: number, tamano = TAMANO_TANDA): number {
  const tandas = Math.max(1, Math.ceil(totalUrls / tamano));
  return Number(((tandas * HORAS_TANDA) / 24).toFixed(2));
}

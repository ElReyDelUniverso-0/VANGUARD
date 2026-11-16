// ═══════════════════════════════════════════════════════════════════
// v403.7 EL AFINADOR DE FOTOS — /api/foto?u=<url>&w=<ancho>
//
// POR QUÉ EXISTE: medida de hoy sobre 10 fotos reales de /api/news —
// la más ligera 34 KB, la más pesada 3,2 MB, mediana ~130 KB. Pintar eso
// en una tarjeta de 80×80 px es tirar datos del visitante a la basura.
// Aquí la foto del medio entra entera y sale en WebP al ancho pedido
// (320 px por defecto, 20-30 KB medidos), con caché larga.
//
// REGLAS DE LA CASA QUE ESTE ARCHIVO CUMPLE:
//   · No guarda copias: la foto sigue siendo del medio y se cita el medio
//     en la tarjeta. Esto solo ajusta el tamaño de lo que ya se sirve.
//   · Si sharp no está o la imagen no se deja, devuelve el original tal
//     cual: la tarjeta nunca se queda sin foto por culpa del afinador.
//   · Nada de puertas abiertas: solo http/https públicos, sin IPs
//     internas ni hosts de la casa (nada de que alguien use esto para
//     leer la red privada de Vercel).
// ═══════════════════════════════════════════════════════════════════
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ANCHO_MIN = 80;
const ANCHO_MAX = 1200;
const PESO_MAX = 12 * 1024 * 1024; // 12 MB de fuente como techo duro
const TIEMPO_MAX = 8000;

/** Nada de red privada: ni localhost, ni rangos internos, ni metadatos. */
function urlPermitida(u: URL): boolean {
  if (u.protocol !== "https:" && u.protocol !== "http:") return false;
  const h = u.hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".internal") || h.endsWith(".local")) return false;
  if (h === "metadata.google.internal" || h === "169.254.169.254") return false;
  if (/^\[?::1\]?$/.test(h)) return false;
  if (/^127\./.test(h) || /^0\./.test(h) || /^10\./.test(h) || /^192\.168\./.test(h)) return false;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return false;
  if (/^169\.254\./.test(h)) return false;
  if (!h.includes(".")) return false; // sin dominio, no
  return true;
}

const cache = new Map<string, { cuerpo: ArrayBuffer; tipo: string }>();
const CACHE_MAX = 80;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const crudo = searchParams.get("u");
  const pedido = Number(searchParams.get("w") ?? 320);
  const ancho = Math.min(ANCHO_MAX, Math.max(ANCHO_MIN, Number.isFinite(pedido) ? Math.round(pedido) : 320));

  if (!crudo) return NextResponse.json({ error: "falta u" }, { status: 400 });

  let destino: URL;
  try {
    destino = new URL(crudo);
  } catch {
    return NextResponse.json({ error: "u no es una URL" }, { status: 400 });
  }
  if (!urlPermitida(destino)) return NextResponse.json({ error: "u no permitida" }, { status: 400 });

  const llave = `${ancho}|${destino.toString()}`;
  const guardada = cache.get(llave);
  if (guardada) return respuesta(guardada.cuerpo, guardada.tipo, ancho);

  let fuente: Response;
  try {
    fuente = await fetch(destino.toString(), {
      headers: {
        // Medido: varios medios (El Mundo, ABC, BBC, 20minutos, Europapress,
        // France 24) sirven la foto a un agente de navegador y devuelven HTML
        // al agente propio. Sin estas tres cabeceras, el afinador se queda
        // ciego con 6 de cada 12 fotos reales.
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/*,*/*;q=0.8",
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
        Referer: destino.origin + "/",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(TIEMPO_MAX),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: "el medio no respondió" }, { status: 502 });
  }
  if (!fuente.ok) return NextResponse.json({ error: `el medio respondió ${fuente.status}` }, { status: 502 });

  const largo = Number(fuente.headers.get("content-length") ?? 0);
  if (largo > PESO_MAX) return NextResponse.json({ error: "imagen demasiado pesada" }, { status: 413 });

  let bytes: ArrayBuffer;
  try {
    bytes = await fuente.arrayBuffer();
  } catch {
    return NextResponse.json({ error: "no se pudo leer la imagen" }, { status: 502 });
  }
  if (bytes.byteLength === 0 || bytes.byteLength > PESO_MAX) {
    return NextResponse.json({ error: "imagen vacía o demasiado pesada" }, { status: 413 });
  }

  const tipoOriginal = fuente.headers.get("content-type") ?? "";
  // Un medio puede contestar 200 con una página de error. Si no es imagen de
  // verdad (ni por cabecera ni por los primeros bytes), se declara y la
  // tarjeta pinta la foto por su cuenta desde el navegador.
  if (!tipoOriginal.toLowerCase().startsWith("image/") || !esImagen(bytes)) {
    return NextResponse.json({ error: "el medio no devolvió una imagen" }, { status: 415 });
  }

  // El afinado. Si sharp no está disponible, la foto sale tal cual: mejor
  // pesada que ausente.
  let cuerpo = bytes;
  let tipo = tipoOriginal;
  try {
    const sharp = (await import("sharp")).default;
    const afinada = await sharp(Buffer.from(bytes))
      .rotate()
      .resize({ width: ancho, withoutEnlargement: true, fit: "inside" })
      .webp({ quality: 72, effort: 4 })
      .toBuffer();
    if (afinada.byteLength > 0 && afinada.byteLength < bytes.byteLength) {
      cuerpo = afinada.buffer.slice(afinada.byteOffset, afinada.byteOffset + afinada.byteLength) as ArrayBuffer;
      tipo = "image/webp";
    }
  } catch {
    /* se queda el original */
  }

  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value as string);
  cache.set(llave, { cuerpo, tipo });

  return respuesta(cuerpo, tipo, ancho);
}

/** Los primeros bytes de un archivo de imagen de verdad. */
function esImagen(b: ArrayBuffer): boolean {
  const v = new Uint8Array(b.slice(0, 12));
  const hex = Array.from(v).map((n) => n.toString(16).padStart(2, "0")).join("");
  if (hex.startsWith("ffd8ff")) return true; // jpeg
  if (hex.startsWith("89504e47")) return true; // png
  if (hex.startsWith("47494638")) return true; // gif
  if (hex.startsWith("52494646") && hex.slice(16, 24) === "57454250") return true; // webp
  if (hex.slice(8, 16) === "66747970") return true; // avif/heic
  if (hex.startsWith("424d")) return true; // bmp
  return false;
}

function respuesta(cuerpo: ArrayBuffer, tipo: string, ancho: number) {
  return new NextResponse(cuerpo, {
    status: 200,
    headers: {
      "Content-Type": tipo,
      // la clave de todo: una foto afinada se cachea un año en el borde
      "Cache-Control": "public, max-age=604800, s-maxage=31536000, stale-while-revalidate=86400",
      "X-Foto-Ancho": String(ancho),
      "X-Foto-Bytes": String(cuerpo.byteLength),
      "X-Content-Type-Options": "nosniff",
    },
  });
}

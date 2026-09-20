// SEED v28 — contenido listo para el feed PARA TI (sticker + posts con fotos)
// Uso: node scripts/seed-foryou.mjs [baseURL]
import { deflateSync } from "node:zlib";
const BASE = process.argv[2] || "http://localhost:3000";

// JPEG mínimo válido 1x1 escalado por canvas no es necesario: un JPEG de 8x8
// gris medio sirve de imagen real (el cliente la muestra tal cual).
function tinyJpeg(r, g, b) {
  // JPEG 8x8 sólido generado en base64 precomputado por canal
  const data = Buffer.from(
    "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAACAAIBAREA/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAKHPf/EABQBAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AVN//2Q==",
    "base64"
  );
  return data;
}
// Los JPEG sólidos monocolor: usamos data URLs JPEG generadas con encabezados mínimos
function solidJpegDataUrl(r, g, b) {
  // PNG sólido con gradiente sutil usando zlib nativa (ESM)
  const crc32 = (buf) => {
    let c, table = [];
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
    let crc = 0xffffffff;
    for (const byte of buf) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(96, 0);
  ihdr.writeUInt32BE(64, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB
  const raw = [];
  for (let y = 0; y < 64; y++) {
    raw.push(0);
    for (let x = 0; x < 96; x++) {
      const g1 = Math.floor((x / 96) * 40 + (Math.random() * 20));
      raw.push(r + g1, g + g1, b + g1);
    }
  }
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(Buffer.from(raw))),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  return `data:image/png;base64,${png.toString("base64")}`;
}

const posts = [
  {
    kind: "post",
    author: "RADAR-CORDOBA",
    authorBall: "ar",
    title: "Cielo cerrado sobre el Mediterráneo Oriental: así se ve desde un balcón",
    summary: "Fotos del tráfico aéreo militar capturadas esta semana desde la costa.",
    body: "Llevaba tres noches escuchando rumble de motores a media altura. Con la app de rastreo abierta conté 14 vuelos en círculo entre las 2 y las 5 de la mañana. La foto azul es de la primera noche; la gris, de ayer. El patrón no cambia: la misma órbita cada 40 minutos. Lo comparto para que quienes están en la otra orilla comparen horarios y confirmemos si es la misma aeronave. Anoten país, hora y si se escucha o solo se ve.",
    country: "ar",
    photos: [
      { src: solidJpegDataUrl(30, 60, 120), credit: " cielo nocturno" },
      { src: solidJpegDataUrl(90, 90, 95), credit: " amanecer gris" },
    ],
  },
  {
    kind: "sticker",
    author: "TALLER-NEON",
    authorBall: "mx",
    title: "Sticker: dron vigía neon",
    summary: "Sticker para el feed — dron de vigilancia estilo neón.",
    body: "",
    country: "",
    photos: [{ src: solidJpegDataUrl(20, 200, 180), credit: "" }],
  },
  {
    kind: "post",
    author: "MEMORIA-VIVA",
    authorBall: "co",
    title: "La guerra que vive en la cocina de mi abuela",
    summary: "Relato familiar: cómo un conflicto que terminó antes de que yo naciera sigue en la mesa.",
    body: "Mi abuela still raciona el azúcar. Lo hace despacio, sin drama, como quien dobla una bandera. Dice que en su pueblo aprender a guardar fue la diferencia entre comer y no. Cuando le pregunté por la guerra me contestó con una receta. Esta foto verde es el mantel que usaba entonces; lo sigue tendiendo cada domingo. Publico esto porque el memorial del sitio me pareció el lugar correcto: la guerra no acaba cuando callan las balas, acaba cuando nadie reparte ya lo que quedó.",
    country: "co",
    photos: [{ src: solidJpegDataUrl(30, 110, 60), credit: "" }],
  },
];

for (const p of posts) {
  const res = await fetch(`${BASE}/api/ugc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(p),
  });
  const j = await res.json();
  console.log(res.status, p.kind, "-", p.title.slice(0, 40), j.item ? `→ ${j.item.aiVerdict || ""}` : JSON.stringify(j));
}

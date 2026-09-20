// Genera la imagen Open Graph (1200x630) para compartir en redes sociales
import sharp from "sharp";
import fs from "fs";

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="80%">
      <stop offset="0%" stop-color="#12122a"/>
      <stop offset="60%" stop-color="#0A0A0F"/>
      <stop offset="100%" stop-color="#050508"/>
    </radialGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1E90FF"/>
      <stop offset="50%" stop-color="#00FF87"/>
      <stop offset="100%" stop-color="#FF3B30"/>
    </linearGradient>
    <linearGradient id="title" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#F0F0F0"/>
      <stop offset="100%" stop-color="#7ab8ff"/>
    </linearGradient>
    <g id="globe" stroke="#1E90FF" fill="none" opacity="0.35">
      <circle cx="0" cy="0" r="300" stroke-width="1.5"/>
      <ellipse cx="0" cy="0" rx="300" ry="110" stroke-width="1"/>
      <ellipse cx="0" cy="0" rx="300" ry="210" stroke-width="1"/>
      <ellipse cx="0" cy="0" rx="110" ry="300" stroke-width="1"/>
      <ellipse cx="0" cy="0" rx="210" ry="300" stroke-width="1"/>
      <line x1="-300" y1="0" x2="300" y2="0" stroke-width="1"/>
    </g>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- globos decorativos -->
  <use href="#globe" transform="translate(1080,520)"/>
  <use href="#globe" transform="translate(60,80)" opacity="0.18"/>

  <!-- grid tecnico sutil -->
  ${Array.from({ length: 12 }, (_, i) => `<line x1="${i * 100}" y1="0" x2="${i * 100}" y2="630" stroke="#1E90FF" stroke-opacity="0.05" stroke-width="1"/>`).join("\n  ")}
  ${Array.from({ length: 7 }, (_, i) => `<line x1="0" y1="${i * 90}" x2="1200" y2="${i * 90}" stroke="#1E90FF" stroke-opacity="0.05" stroke-width="1"/>`).join("\n  ")}

  <!-- escudo -->
  <g transform="translate(88,150)">
    <path d="M60 0 L120 22 V80 C120 130 90 165 60 180 C30 165 0 130 0 80 V22 Z"
          fill="#0A0A0F" stroke="#1E90FF" stroke-width="4"/>
    <path d="M34 62 L54 86 L92 44" stroke="#00FF87" stroke-width="9" fill="none"
          stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <!-- marca -->
  <text x="250" y="215" font-family="Arial Black, Arial, sans-serif" font-size="42"
        font-weight="900" fill="url(#title)" letter-spacing="6">VANGUARD</text>
  <text x="252" y="252" font-family="Courier New, monospace" font-size="20"
        fill="#1E90FF" letter-spacing="4">EL MUNDO EN TIEMPO REAL</text>

  <!-- titular principal -->
  <text x="88" y="380" font-family="Arial Black, Arial, sans-serif" font-size="64"
        font-weight="900" fill="#F0F0F0">LA PLATAFORMA DE</text>
  <text x="88" y="455" font-family="Arial Black, Arial, sans-serif" font-size="64"
        font-weight="900" fill="url(#accent)">CONFLICTOS MUNDIALES</text>

  <!-- subtitulo -->
  <text x="90" y="515" font-family="Arial, sans-serif" font-size="26"
        fill="#9aa0b0">Noticias en vivo · Mapa OSINT 3D · Guerra global multijugador · Ranking ELO</text>

  <!-- chips inferiores -->
  <g font-family="Courier New, monospace" font-size="19" font-weight="bold">
    <rect x="88" y="548" width="220" height="42" rx="6" fill="none" stroke="#1E90FF" stroke-width="2"/>
    <text x="110" y="575" fill="#1E90FF">◈ 15 CAPAS OSINT</text>
    <rect x="328" y="548" width="240" height="42" rx="6" fill="none" stroke="#00FF87" stroke-width="2"/>
    <text x="350" y="575" fill="#00FF87">⚔ MULTIJUGADOR 1v1</text>
    <rect x="588" y="548" width="230" height="42" rx="6" fill="none" stroke="#FF3B30" stroke-width="2"/>
    <text x="612" y="575" fill="#FF3B30">◉ TENSIÓN 66/100</text>
  </g>

  <!-- borde superior de marca -->
  <rect x="0" y="0" width="1200" height="8" fill="url(#accent)"/>
</svg>`;

await sharp(Buffer.from(svg)).png({ quality: 92 }).toFile("/home/z/my-project/public/og-image.png");
console.log("og-image.png generado:", fs.statSync("/home/z/my-project/public/og-image.png").size, "bytes");

// Vanguard v195.0 TU LADO — REDES DE VANGUARD: la vitrina de la casa en el
// mundo y los enlaces para compartir la plataforma HOY MISMO.
//
// ⚑ DUEÑO: cuando abras una red social oficial de Vanguard, pega su URL real
//   en el campo `url` de esa red y cambia `estado` a "OFICIAL" — la tarjeta
//   se enciende sola en la sala REDES. Nada más que tocar.
//
// Leyes de la casa: los iconos son SVG inline (cero bytes de red extra) y
// los enlaces de COMPARTIR funcionan ya con la URL real de producción.

export type EstadoRed = "OFICIAL" | "PROXIMO";

export interface RedVanguard {
  id: string;
  nombre: string;
  handle: string;
  desc: string;
  color: string;
  estado: EstadoRed;
  url: string | null; // la URL real del canal oficial (null = PRÓXIMAMENTE)
}

export const REDES_VANGUARD: RedVanguard[] = [
  {
    id: "telegram", nombre: "Telegram", handle: "@VANGUARD",
    desc: "El canal oficial de la casa: alertas del mundo y la sala del bot viva dentro de Vanguard",
    color: "#38BDF8", estado: "OFICIAL", url: "https://t.me/vanguard_kq9r",
  },
  {
    id: "tiktok", nombre: "TikTok", handle: "@VANGUARD",
    desc: "Clips verticales del frente: el mismo ADN del feed PARA TI, fuera de la casa",
    color: "#FF4D5E", estado: "PROXIMO", url: null,
  },
  {
    id: "youtube", nombre: "YouTube", handle: "@VANGUARDTV",
    desc: "VANGUARD TV en canal abierto: briefings semanales y directos del planeta",
    color: "#FF3B30", estado: "PROXIMO", url: null,
  },
  {
    id: "x", nombre: "X", handle: "@VANGUARD",
    desc: "El cable corto: titulares en vivo, tensiones y la palabra oficial de la casa",
    color: "#E8E8E8", estado: "PROXIMO", url: null,
  },
  {
    id: "instagram", nombre: "Instagram", handle: "@vanguard.oficial",
    desc: "La casa en imágenes: portadas, mapas y el día a día del centinela Vigo",
    color: "#FF6B9D", estado: "PROXIMO", url: null,
  },
  {
    id: "discord", nombre: "Discord", handle: "discord.gg/vanguard",
    desc: "El cuartel de voz de la comunidad: salas por región, OSINT y torneos",
    color: "#7C8CFF", estado: "PROXIMO", url: null,
  },
  {
    id: "twitch", nombre: "Twitch", handle: "@vanguardlive",
    desc: "Directos largos: cobertura de crisis en vivo con la comunidad en el chat",
    color: "#B44DFF", estado: "PROXIMO", url: null,
  },
  {
    id: "whatsapp", nombre: "WhatsApp", handle: "Canal VANGUARD",
    desc: "Alertas del mundo directo a tu bolsillo, sin ruido y sin algoritmo ajeno",
    color: "#3DDC97", estado: "PROXIMO", url: null,
  },
  {
    id: "kick", nombre: "Kick", handle: "@vanguard",
    desc: "La casa también emite aquí: directos de guerra y comunidad",
    color: "#9BE500", estado: "PROXIMO", url: null,
  },
];

// ====== COMPARTIR VANGUARD: enlaces REALES que funcionan hoy ======

export const APP_URL = "https://vanguard-kq9r.vercel.app";
export const TEXTO_COMPARTIR = "Estoy dentro de VANGUARD — la agencia del mundo en vivo: noticias reales, mapa 3D, TV en vivo, apuestas y más. Entra conmigo:";

export interface EnlaceCompartir {
  id: string;
  nombre: string;
  color: string;
  url: (texto: string, link: string) => string;
}

export const ENLACES_COMPARTIR: EnlaceCompartir[] = [
  {
    id: "whatsapp", nombre: "WhatsApp", color: "#3DDC97",
    url: (t, l) => `https://wa.me/?text=${encodeURIComponent(`${t} ${l}`)}`,
  },
  {
    id: "telegram", nombre: "Telegram", color: "#38BDF8",
    url: (t, l) => `https://t.me/share/url?url=${encodeURIComponent(l)}&text=${encodeURIComponent(t)}`,
  },
  {
    id: "x", nombre: "X", color: "#E8E8E8",
    url: (t, l) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}&url=${encodeURIComponent(l)}`,
  },
  {
    id: "facebook", nombre: "Facebook", color: "#4D8BFF",
    url: (_t, l) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(l)}`,
  },
  {
    id: "reddit", nombre: "Reddit", color: "#FF7A5C",
    url: (t, l) => `https://www.reddit.com/submit?title=${encodeURIComponent(t)}&url=${encodeURIComponent(l)}`,
  },
];

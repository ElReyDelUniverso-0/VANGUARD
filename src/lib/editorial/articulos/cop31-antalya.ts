import type { Articulo } from "../tipos";

export const cop31: Articulo = {
  slug: "cop31-antalya-que-se-negocia",
  titulo: "COP31 en Antalya: qué se negocia y por qué la cumbre del clima llega bloqueada a su recta final",
  entradilla:
    "La conferencia de la ONU sobre el cambio climático entra en su última semana en Turquía sin acuerdo sobre el dinero, los combustibles fósiles ni la adaptación. Estas son las claves para seguirla.",
  area: "relaciones",
  tipo: "actualidad",
  publicado: "2026-11-17",
  revisado: "2026-11-17",
  revisarCada: 4,
  hito: { fecha: "2026-11-20", que: "cierre previsto de la COP31 (suele prorrogarse uno o dos días)" },
  imagen: "/ilustraciones/consejo.jpg",
  claves: [
    "La COP31 se celebra del 9 al 20 de noviembre de 2026 en Antalya, con Turquía en la presidencia y Australia al frente de las negociaciones.",
    "La cumbre de líderes (11 y 12 de noviembre) cerró sin dinero nuevo; EE. UU. no envió delegación oficial.",
    "El choque central es quién paga la adaptación y la transición: la meta de la COP29 es movilizar 300.000 millones de dólares al año en 2035.",
  ],
  cuerpo: [
    { t: "h2", x: "Qué es una COP", id: "que-es" },
    {
      t: "p",
      x: "La COP, Conferencia de las Partes, es la reunión anual de los países que firmaron la Convención Marco de la ONU sobre el Cambio Climático de 1992. Allí se aplican y se revisan acuerdos como el de París (2015), cuyo objetivo es mantener el calentamiento muy por debajo de 2 °C e intentar limitarlo a 1,5 °C. Las decisiones se toman por consenso, lo que da a cualquier país, o a un bloque, la capacidad de frenar un texto.",
    },
    { t: "h2", x: "Una presidencia compartida", id: "presidencia" },
    {
      t: "p",
      x: "La COP31 tiene una fórmula inédita: Turquía ejerce la presidencia formal y acoge la cita en el Antalya EXPO Center, con el ministro de Medio Ambiente, Murat Kurum, al frente; Australia conduce las negociaciones técnicas a través de su ministro Chris Bowen. Kurum ha dicho que su objetivo no es fijar metas nuevas, sino convertir en acciones los compromisos de ediciones anteriores.",
    },
    { t: "h2", x: "La primera semana: discursos sin dinero", id: "primera-semana" },
    {
      t: "p",
      x: "La cumbre de jefes de Estado y de Gobierno terminó el 12 de noviembre sin decisiones formales ni anuncios de financiación nueva. Estados Unidos no envió delegación oficial y tampoco acudieron los máximos dirigentes de China e India. El secretario general de la ONU, António Guterres, en su última cumbre del clima en el cargo, propuso un «pacto de justicia climática», pidió gravar a las empresas de combustibles fósiles y advirtió de que superar 1,5 °C ya es inevitable: con los compromisos actuales, el termómetro subiría más de 2,5 °C a final de siglo.",
    },
    { t: "h2", x: "Los cuatro nudos de la negociación", id: "nudos" },
    {
      t: "lista",
      numerada: true,
      items: [
        "Financiación: en la COP29 (Bakú, 2024) se acordó movilizar al menos 300.000 millones de dólares anuales para los países en desarrollo hacia 2035, dentro de una aspiración de 1,3 billones. Ahora se discute quién aporta, cuánto es dinero público y cuánto llega como préstamo.",
        "Adaptación: el Grupo Africano pidió triplicar los fondos para adaptarse al calentamiento. No hubo consenso para incluirlo como punto propio de la agenda; Guterres avisó de que incluso triplicarlos cubriría menos de un tercio de las necesidades.",
        "Combustibles fósiles: los países siguen divididos sobre cómo concretar la transición para dejar atrás el carbón, el petróleo y el gas.",
        "La decisión de cierre: Australia circuló el 16 de noviembre un primer borrador de decisión marco, pero los países discuten incluso si debe existir un texto así.",
      ],
    },
    {
      t: "p",
      x: "A esos nudos se suma una disputa sobre la ciencia: algunos países cuestionan el futuro del Grupo Intergubernamental de Expertos sobre el Cambio Climático (IPCC), y figuras como Laurence Tubiana, arquitecta del Acuerdo de París, y la expresidenta irlandesa Mary Robinson han salido a defenderlo.",
    },
    { t: "h2", x: "Lo que sí salió de Antalya", id: "iniciativas" },
    {
      t: "datos",
      titulo: "Iniciativas voluntarias lanzadas en la COP31",
      filas: [
        ["Compromiso de Antalya sobre IA", "Turquía y la UIT · 80 adhesiones y 271 compromisos para reducir la huella ambiental de la inteligencia artificial"],
        ["Pacto de Antalya para la Industrialización Verde", "Inversión y mercados para acero, cemento y otros productos industriales más limpios"],
      ],
    },
    {
      t: "p",
      x: "Son iniciativas voluntarias: suman a gobiernos y empresas, pero no obligan a nadie ni sustituyen a la decisión que deben aprobar por consenso las Partes de la Convención.",
    },
    { t: "h2", x: "Qué vigilar hasta el cierre", id: "que-vigilar" },
    {
      t: "lista",
      items: [
        "Si el texto final menciona de forma explícita la transición fuera de los combustibles fósiles.",
        "Si aparece una cifra nueva para adaptación o solo se remite a la meta de la COP29.",
        "Si la cumbre termina el 20 de noviembre o se prorroga, como ocurrió en las últimas ediciones.",
      ],
    },
    {
      t: "aviso",
      x: "Pieza de actualidad con revisión programada: Vanguard publicará el balance de lo acordado tras el cierre (calendario editorial, 21 de noviembre) y actualizará esta página.",
    },
  ],
  fuentes: [
    { nombre: "Noticias ONU · La COP31 entra en su semana decisiva", url: "https://news.un.org/es/story/2026/11/1542176", tipo: "primaria", fecha: "2026-11-16" },
    { nombre: "Noticias ONU · Especial COP31", url: "https://news.un.org/es/events/cop31", tipo: "primaria" },
    { nombre: "CMNUCC · Convención Marco de la ONU sobre el Cambio Climático", url: "https://unfccc.int", tipo: "primaria" },
    { nombre: "MCN · La cumbre de líderes cierra sin dinero nuevo", url: "https://mcn-comglobal.com/cop31-antalya-cumbre-lideres-negociacion/", tipo: "secundaria", fecha: "2026-11-13" },
    { nombre: "News Digitales · Financiamiento y energía enfrentan a los negociadores", url: "https://www.newsdigitales.com/nota/349639/cop31-en-turquia-financiamiento-y-energia-enfrentan-a-los-negociadores/", tipo: "secundaria", fecha: "2026-11-10" },
  ],
  enlaces: [
    { href: "/pulso-mundial", label: "Pulso mundial" },
    { href: "/mundos/tr", label: "Ficha de Turquía" },
    { href: "/mundos/au", label: "Ficha de Australia" },
  ],
  salas: ["redmundial", "gobierno"],
  etiquetas: ["COP31", "clima", "ONU", "Turquía", "Australia", "financiación climática"],
  informe: "Crónica del día (/cronica) y cables de agencias sobre la cumbre · balance programado el 21 de noviembre",
  complementa: "Tema nuevo en la casa: ninguna sala cubría las cumbres del clima",
  cambios: [{ fecha: "2026-11-17", nota: "Publicación con la situación a 17 de noviembre (segunda semana de negociación)." }],
};

import type { Articulo } from "../tipos";

export const ormuz: Articulo = {
  slug: "ormuz-y-los-cuellos-de-botella-del-comercio-mundial",
  titulo: "Ormuz y los otros cinco cuellos de botella que sostienen el comercio mundial",
  entradilla:
    "Por un puñado de pasos marítimos, algunos de pocas decenas de kilómetros, circula buena parte del petróleo, el gas y las mercancías del planeta. La guerra de Irán ha convertido el más importante de todos en un campo minado.",
  area: "geopolitica",
  tipo: "actualidad",
  publicado: "2026-11-17",
  revisado: "2026-11-17",
  revisarCada: 7,
  imagen: "/imagenes-reales/kremlin.jpg",
  claves: [
    "En 2024 pasaron por Ormuz unos 20 millones de barriles diarios: cerca del 20 % del consumo mundial de petróleo, según la EIA.",
    "Desde finales de febrero de 2026 Irán restringe el tránsito; EE. UU. responde con un bloqueo naval de los puertos iraníes y escoltas a los petroleros.",
    "Malaca, Bab el-Mandeb, Suez, Panamá y los estrechos turcos completan el mapa de los lugares donde una crisis local se vuelve global.",
  ],
  cuerpo: [
    { t: "h2", x: "Qué es un cuello de botella marítimo", id: "que-es" },
    {
      t: "p",
      x: "Los analistas de energía llaman «cuello de botella» (chokepoint, en inglés) a un paso marítimo estrecho por el que circula un volumen enorme de carga y para el que no existe una alternativa barata. Rodearlo cuesta días de navegación, combustible y primas de seguro; cerrarlo, aunque sea parcialmente, se nota en el precio del barril, en los fletes y, semanas después, en la gasolina y los alimentos de países que están a miles de kilómetros.",
    },
    { t: "h2", x: "Ormuz: la llave del golfo Pérsico", id: "ormuz" },
    {
      t: "p",
      x: "El estrecho de Ormuz separa Irán de la península omaní de Musandam y une el golfo Pérsico con el golfo de Omán. En su punto más estrecho mide unos 39 kilómetros, pero los carriles por los que navegan los grandes petroleros son mucho más angostos. Por él sale el crudo de Arabia Saudí, Irak, Kuwait, Emiratos, Catar e Irán.",
    },
    {
      t: "datos",
      titulo: "Ormuz en cifras (EIA, datos de 2024)",
      filas: [
        ["Petróleo en tránsito", "≈ 20 millones de barriles diarios"],
        ["Peso en el consumo mundial", "≈ 20 % de los líquidos del petróleo"],
        ["Comercio marítimo de crudo", "más de una cuarta parte del total"],
        ["Gas natural licuado", "≈ una quinta parte del comercio mundial, sobre todo de Catar"],
        ["Capacidad para rodearlo", "≈ 2,6 millones de b/d por oleoductos saudíes y emiratíes"],
      ],
    },
    {
      t: "p",
      x: "La última fila es la clave del problema: los oleoductos que permiten esquivar el estrecho, el saudí hacia el mar Rojo y el emiratí hacia Fujairah, solo podrían absorber una fracción pequeña del flujo. Si Ormuz se cierra, no hay plan B a la escala necesaria.",
    },
    { t: "h2", x: "La situación en noviembre de 2026", id: "ahora" },
    {
      t: "p",
      x: "Desde que estalló la guerra en Oriente Medio a finales de febrero de 2026, Irán declara restringido el paso y exige que los barcos usen los corredores que autorizan sus fuerzas armadas. Washington respondió con un bloqueo naval de los puertos iraníes y con escoltas militares a los petroleros. El Mando Central de EE. UU. afirma haber ayudado a los países del Golfo a exportar unos 1.500 millones de barriles por el estrecho desde el verano y asegura que limpió de minas las rutas principales.",
    },
    {
      t: "p",
      x: "A mediados de noviembre, la Guardia Revolucionaria iraní informó de varios petroleros alcanzados por minas en rutas «no autorizadas», entre ellos un superpetrolero con más de dos millones de barriles que, según Teherán, se hundió. Las partes negocian de forma indirecta con mediación de Catar, y el Brent cotizaba en torno a 91,7 dólares el 11 de noviembre.",
    },
    {
      t: "aviso",
      x: "Las cifras de buques dañados proceden de comunicados de las partes en guerra y no siempre se han podido verificar de forma independiente. Esta pieza se revisa cada semana mientras dure la crisis; el seguimiento minuto a minuto está en la ficha del teatro de Ormuz.",
    },
    { t: "h2", x: "Malaca: el paso más transitado", id: "malaca" },
    {
      t: "p",
      x: "Entre la península malaya y la isla de Sumatra, con Singapur en su extremo sur, el estrecho de Malaca es la ruta más corta entre el océano Índico y el Pacífico. La EIA lo sitúa entre los mayores pasos de petróleo del mundo por volumen, con más de 20 millones de barriles diarios, casi todos con destino a China, Japón y Corea del Sur. Sus alternativas, los estrechos indonesios de Sonda y Lombok, alargan el viaje varios días.",
    },
    { t: "h2", x: "Bab el-Mandeb y Suez: la ruta del mar Rojo", id: "mar-rojo" },
    {
      t: "p",
      x: "Bab el-Mandeb, entre Yemen y Yibuti, es la puerta sur del mar Rojo; el canal de Suez, inaugurado en 1869, es la norte. Juntos forman el atajo entre Asia y Europa. Desde finales de 2023, los ataques de los hutíes de Yemen contra buques mercantes obligaron a muchas navieras a rodear África por el cabo de Buena Esperanza, lo que añade alrededor de diez días de viaje. La EIA calcula que el petróleo que cruzaba Bab el-Mandeb cayó a menos de la mitad en 2024, y los ingresos de Egipto por el canal se desplomaron.",
    },
    { t: "h2", x: "Panamá: el canal que depende de la lluvia", id: "panama" },
    {
      t: "p",
      x: "El canal de Panamá, abierto en 1914, funciona con esclusas que se llenan con agua dulce del lago Gatún. La sequía de 2023 y 2024 obligó a la Autoridad del Canal a reducir los tránsitos diarios y el calado permitido hasta que volvieron las lluvias. Para el Caribe, incluida la República Dominicana, el canal es la puerta hacia los puertos del Pacífico y de Asia: cualquier restricción se traduce en fletes más caros.",
    },
    { t: "h2", x: "Los estrechos turcos y la Convención de Montreux", id: "bosforo" },
    {
      t: "p",
      x: "El Bósforo y los Dardanelos unen el mar Negro con el Mediterráneo y atraviesan Estambul. Desde 1936, la Convención de Montreux garantiza el paso libre de los buques mercantes en tiempo de paz y permite a Turquía limitar el de buques de guerra. En 2022, tras la invasión rusa de Ucrania, Ankara aplicó esa facultad y cerró los estrechos a los buques de guerra de los países en conflicto.",
    },
    { t: "h2", x: "Por qué importa lejos del mar", id: "por-que-importa" },
    {
      t: "lista",
      items: [
        "Seguros: las primas por riesgo de guerra se disparan y encarecen cada carga que cruza una zona caliente.",
        "Fletes: los rodeos inmovilizan barcos durante más días y reducen la flota disponible en todo el mundo.",
        "Precios: el petróleo y el gas se negocian en mercados globales; una amenaza en Ormuz sube el precio también para quien no compra crudo del Golfo.",
        "Reservas: los miembros de la Agencia Internacional de la Energía mantienen existencias de emergencia para amortiguar cortes de suministro.",
      ],
    },
    {
      t: "p",
      x: "La lección de 2026 es antigua: la economía mundial depende de unas pocas líneas de agua. Quien controla o amenaza un estrecho tiene en la mano una palanca que vale más que muchos ejércitos.",
    },
  ],
  fuentes: [
    { nombre: "EIA · Amid regional conflict, the Strait of Hormuz remains critical oil chokepoint", url: "https://www.eia.gov/todayinenergy/detail.php?id=65504", tipo: "primaria", fecha: "2025-06-16" },
    { nombre: "EIA · World Oil Transit Chokepoints", url: "https://www.eia.gov/international/analysis/special-topics/World_Oil_Transit_Chokepoints", tipo: "primaria" },
    { nombre: "Infobae · Irán afirma que un superpetrolero se hundió tras chocar con una mina en Ormuz", url: "https://www.infobae.com/america/mundo/2026/11/15/iran-informo-que-un-supertanquero-con-mas-de-2-millones-de-barriles-de-crudo-se-hundio-tras-chocar-con-una-mina-en-ormuz/", tipo: "secundaria", fecha: "2026-11-15" },
    { nombre: "Euronews · Oil prices rise as investors monitor shipping disruption in the Strait of Hormuz", url: "https://www.euronews.com/2026/11/11/oil-markets-rise-as-investors-monitor-shipping-disruption-in-the-strait-of-hormuz", tipo: "secundaria", fecha: "2026-11-11" },
    { nombre: "Euronews · Catar alerta de que la escalada amenaza las negociaciones entre EE. UU. e Irán", url: "https://es.euronews.com/2026/11/17/qatar-alerta-escalada-golfo-negociaciones-estados-unidos-iran", tipo: "secundaria", fecha: "2026-11-17" },
    { nombre: "Autoridad del Canal de Panamá", url: "https://pancanal.com", tipo: "primaria" },
    { nombre: "Convención de Montreux sobre el régimen de los estrechos (1936)", url: "https://es.wikipedia.org/wiki/Convenci%C3%B3n_de_Montreux", tipo: "secundaria" },
  ],
  enlaces: [
    { href: "/conflicto/hormuz", label: "Teatro de Ormuz en vivo" },
    { href: "/conflicto/redsea", label: "Teatro del mar Rojo" },
    { href: "/mapas", label: "Centro de mapas" },
  ],
  salas: ["briefing", "lados"],
  etiquetas: ["Ormuz", "petróleo", "Irán", "rutas marítimas", "Malaca", "Suez", "Panamá"],
  informe: "Cables del teatro «hormuz» y «redsea» (radar de actualidad) · ficha /conflicto/hormuz",
  complementa: "/conflicto/hormuz (noticias del teatro): esta pieza explica el sistema de estrechos, no la crónica diaria",
  cambios: [{ fecha: "2026-11-17", nota: "Publicación. Datos de flujo de la EIA (2024) y situación del estrecho a 17 de noviembre de 2026." }],
};

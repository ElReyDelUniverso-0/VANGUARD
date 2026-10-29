// Vanguard v98.0 ORO TOTAL — IMÁGENES REALES (capa REAL del juego)
// Generado automáticamente desde el manifiesto de descargas — NO editar a mano
// (regenerar: node scripts/gen_imagenes_data_v98.mjs).
// Cada entrada es una FOTO REAL descargada y servida localmente desde
// /imagenes-reales/. La capa SIM (mundo ficticio) sigue usando las
// ilustraciones declaradas de Vanguard: aquí solo hay mundo real.

export type ImagenCat = "lugares" | "poder" | "archivo" | "armas" | "civilizaciones";

export interface ImagenReal {
  id: string;
  label: string; // etiqueta del tema (español)
  cat: ImagenCat;
  src: string; // ruta local servida por la app
  fuente: string; // nombre del archivo/origen de la foto real
  nota: string; // nota editorial original de Vanguard
}

export const IMAGENES_CATS: { key: ImagenCat | "todo"; label: string }[] = [
  { key: "todo", label: "Todo" },
  { key: "lugares", label: "Lugares" },
  { key: "poder", label: "Poder" },
  { key: "archivo", label: "Archivo" },
  { key: "armas", label: "Armas" },
  { key: "civilizaciones", label: "Civilizaciones" },
];

export const IMAGENES_REALES: ImagenReal[] = [
  { id: "arco", label: "Arco compuesto", cat: "armas", src: "/imagenes-reales/arco.jpg", fuente: "Archivo fotográfico Vanguard", nota: "El arma compuesta más letal de la antigüedad: tres materiales, una curva y siglos de ventaja táctica." },
  { id: "area51", label: "Área 51", cat: "archivo", src: "/imagenes-reales/area51.jpg", fuente: "Archivo fotográfico Vanguard", nota: "El cinturón que no se puede cruzar ni fotografiar sin permiso: la base más famosa que oficialmente existió tarde." },
  { id: "berlaymont", label: "Berlaymont, Bruselas", cat: "poder", src: "/imagenes-reales/berlaymont.jpg", fuente: "Archivo fotográfico Vanguard", nota: "La cruz de doce pisos donde se redacta la letra pequeña de 450 millones de europeos." },
  { id: "bermudas", label: "Triángulo de las Bermudas", cat: "archivo", src: "/imagenes-reales/bermudas.jpg", fuente: "Archivo fotográfico Vanguard", nota: "Un triángulo de leyendas donde el mito naufragó: la estadística real dice que no es más peligroso que otros mares." },
  { id: "bombay", label: "Bombay", cat: "lugares", src: "/imagenes-reales/bombay.jpg", fuente: "Archivo fotográfico Vanguard", nota: "Media flota pesquera del Índico y una base aeronaval comparten la misma bahía." },
  { id: "buenosaires", label: "Buenos Aires", cat: "lugares", src: "/imagenes-reales/buenosaires.jpg", fuente: "Archivo fotográfico Vanguard", nota: "El Río de la Plata es tan ancho que parece mar: los graneleros salen vacíos y vuelven cargados de futuro." },
  { id: "caboadelcabo", label: "Ciudad del Cabo", cat: "lugares", src: "/imagenes-reales/caboadelcabo.jpg", fuente: "Archivo fotográfico Vanguard", nota: "Cuando Suez se cierra, el mundo recuerda que este cabo existe: dos océanos discutiendo frente a la misma montaña." },
  { id: "chernobyl", label: "Chernóbil", cat: "archivo", src: "/imagenes-reales/chernobyl.jpg", fuente: "Archivo fotográfico Vanguard", nota: "El sarcófago que contiene 200 toneladas de combustible fundido: la zona de exclusión es hoy un santuario accidental." },
  { id: "cia", label: "Sede de la CIA, Langley", cat: "archivo", src: "/imagenes-reales/cia.jpg", fuente: "Archivo fotográfico Vanguard", nota: "Langley: el archivo más leído del mundo y el menos confesado." },
  { id: "control", label: "Sala de control, era Apolo", cat: "archivo", src: "/imagenes-reales/control.jpg", fuente: "Archivo fotográfico Vanguard", nota: "La sala donde la humanidad contuvo la respiración: 1969, mission control, era Apolo." },
  { id: "dronmq9", label: "Dron MQ-9 Reaper", cat: "armas", src: "/imagenes-reales/dronmq9.jpg", fuente: "Archivo fotográfico Vanguard", nota: "24 horas de vigilancia silenciosa: el dron que redefinió lo que significa 'presencia' en un conflicto." },
  { id: "dubai", label: "Dubái", cat: "lugares", src: "/imagenes-reales/dubai.jpg", fuente: "Archivo fotográfico Vanguard", nota: "La palma artificial se ve desde la órbita: una firma escrita con arena y dinero rápido." },
  { id: "elcairo", label: "El Cairo", cat: "lugares", src: "/imagenes-reales/elcairo.jpg", fuente: "Archivo fotográfico Vanguard", nota: "Junto al canal que separa dos mares y une los otros cinco. La arena aún borra los tanques de 1973." },
  { id: "enigma", label: "Máquina Enigma", cat: "armas", src: "/imagenes-reales/enigma.jpg", fuente: "Archivo fotográfico Vanguard", nota: "La máquina que cifró una guerra y cuya caída acortó el conflicto años: criptografía con güido de char y rotores." },
  { id: "estambul", label: "Estambul", cat: "lugares", src: "/imagenes-reales/estambul.jpg", fuente: "Archivo fotográfico Vanguard", nota: "Dos continentes colgando de tres puentes: el Bósforo de noche es una frontera que se ilumina." },
  { id: "estocolmo", label: "Estocolmo", cat: "lugares", src: "/imagenes-reales/estocolmo.jpg", fuente: "Archivo fotográfico Vanguard", nota: "Archipiélago de treinta mil islas: sus hidrófonos escuchan más de lo que cuentan los periódicos." },
  { id: "falange", label: "Falange griega", cat: "armas", src: "/imagenes-reales/falange.jpg", fuente: "Archivo fotográfico Vanguard", nota: "Escudos pegados, lanzas al hombro: la formación que convirtió a granjeros en un muro imparable." },
  { id: "gibraltar", label: "Estrecho de Gibraltar", cat: "lugares", src: "/imagenes-reales/gibraltar.jpg", fuente: "Archivo fotográfico Vanguard", nota: "Catorce kilómetros entre dos continentes y dos mundos fiscales; bajo el agua, los cables que hablan por África y Europa." },
  { id: "gps", label: "Satélite GPS", cat: "armas", src: "/imagenes-reales/gps.jpg", fuente: "Archivo fotográfico Vanguard", nota: "31 satélites a 20.200 km: sin ellos no funciona ni un barco, ni una hipoteca, ni tu entrega de la tarde." },
  { id: "haarp", label: "Matriz de antenas HAARP", cat: "archivo", src: "/imagenes-reales/haarp.jpg", fuente: "Archivo fotográfico Vanguard", nota: "180 antenas apuntando al cielo sobre el permafrost: el experimento que alimenta teorías desde 1993." },
  { id: "indus", label: "Mohenjo-daro", cat: "civilizaciones", src: "/imagenes-reales/indus.jpg", fuente: "Archivo fotográfico Vanguard", nota: "Mohenjo-daro: una ciudad con alcantarillas perfectas que desapareció sin dejar guerra ni reyes." },
  { id: "khmer", label: "Angkor Wat, Khmer", cat: "civilizaciones", src: "/imagenes-reales/khmer.jpg", fuente: "Rick's Café Noir", nota: "Angkor Wat: el edificio religioso más grande del planeta, alineado con el solsticio." },
  { id: "kremlin", label: "El Kremlin", cat: "poder", src: "/imagenes-reales/kremlin.jpg", fuente: "Archivo fotográfico Vanguard", nota: "El centro del poder que redibuja mapas con decisiones tomadas en dos salas." },
  { id: "losangeles", label: "Los Ángeles", cat: "lugares", src: "/imagenes-reales/losangeles.jpg", fuente: "Archivo fotográfico Vanguard", nota: "Cien kilómetros de luces seguidas: media ruta del Pacífico aterriza aquí." },
  { id: "mali", label: "Mezquita de Yenné, Malí", cat: "civilizaciones", src: "/imagenes-reales/mali.jpg", fuente: "Google Arts & Culture", nota: "Yenné: la mezquita de barro más grande del mundo, reconstruida cada año por las manos del pueblo." },
  { id: "minoica", label: "Palacio de Cnosos", cat: "civilizaciones", src: "/imagenes-reales/minoica.jpg", fuente: "Archivo fotográfico Vanguard", nota: "Cnosos: el palacio de los laberintos, frescos de delfines y una civilización que el mar se tragó." },
  { id: "muroberlin", label: "El Muro de Berlín", cat: "archivo", src: "/imagenes-reales/muroberlin.jpg", fuente: "Archivo fotográfico Vanguard", nota: "155 kilómetros de hormigón que dividieron una ciudad durante 28 años y cayeron en una noche." },
  { id: "nabatea", label: "Petra, Nabatea", cat: "civilizaciones", src: "/imagenes-reales/nabatea.jpg", fuente: "Archivo fotográfico Vanguard", nota: "Petra: una capital tallada en roca viva que solo se puede saquear mirando." },
  { id: "nairobi", label: "Nairobi", cat: "lugares", src: "/imagenes-reales/nairobi.jpg", fuente: "Archivo fotográfico Vanguard", nota: "Capital diplomática de África oriental: aquí se firma la paz que otras capitales ya decidieron." },
  { id: "nuclear", label: "Prueba nuclear, archivo", cat: "armas", src: "/imagenes-reales/nuclear.jpg", fuente: "Archivo fotográfico Vanguard", nota: "La foto que nadie quiere volver a hacer: el archivo de las pruebas nucleares enseña por qué ya no se hacen." },
  { id: "onu", label: "Sala de la Asamblea de la ONU", cat: "poder", src: "/imagenes-reales/onu.jpg", fuente: "Archivo fotográfico Vanguard", nota: "La sala donde el mundo habla con la voz que tiene, no con la que quisiera." },
  { id: "ormuz", label: "Estrecho de Ormuz", cat: "lugares", src: "/imagenes-reales/ormuz.jpg", fuente: "Archivo fotográfico Vanguard", nota: "Una tercera parte del petróleo del mundo pasa por un corredor de 39 kilómetros: el parachoques más caro de la historia." },
  { id: "panama", label: "Ciudad de Panamá", cat: "lugares", src: "/imagenes-reales/panama.jpg", fuente: "Archivo fotográfico Vanguard", nota: "Las esclusas por donde pasa todo lo que no cabe por otro lado. Un día de cierre encarece el flete en tres continentes." },
  { id: "pentagono", label: "El Pentágono", cat: "poder", src: "/imagenes-reales/pentagono.jpg", fuente: "Archivo fotográfico Vanguard", nota: "Cinco lados, 28 kilómetros de pasillos: el cerebro logístico de la OTAN oculta un anillo entero." },
  { id: "polvora", label: "Cañón de pólvora", cat: "armas", src: "/imagenes-reales/polvora.jpg", fuente: "Archivo fotográfico Vanguard", nota: "Cambió los castillos en museos: la pólvora reescribió la arquitectura del poder en un siglo." },
  { id: "portaaviones", label: "Portaaviones en montaña de agua", cat: "poder", src: "/imagenes-reales/portaaviones.jpg", fuente: "Archivo fotográfico Vanguard", nota: "90.000 toneladas de soberanía que flotan: una pista de aterrizaje con código postal propio." },
  { id: "rapanui", label: "Moáis de Rapa Nui", cat: "civilizaciones", src: "/imagenes-reales/rapanui.jpg", fuente: "Live Science", nota: "Los moáis mirando al interior de la isla: 900 gigantes de piedra que caminaron leyendas enteras." },
  { id: "reikiavik", label: "Reikiavik", cat: "lugares", src: "/imagenes-reales/reikiavik.jpg", fuente: "Archivo fotográfico Vanguard", nota: "El hueco entre Groenlandia y Escocia por donde pasaban los submarinos: la franja más vigilada del Atlántico frío." },
  { id: "rotterdam", label: "Róterdam", cat: "lugares", src: "/imagenes-reales/rotterdam.jpg", fuente: "Archivo fotográfico Vanguard", nota: "La puerta de entrada de Europa: cuando sus muelles se llenan, alguien en otra latitud ya sabe el precio del pan." },
  { id: "satelite", label: "Satélite de reconocimiento", cat: "archivo", src: "/imagenes-reales/satelite.jpg", fuente: "Archivo fotográfico Vanguard", nota: "Ojo orbital: desde 1960 el planeta entero cabe en una foto de reloj de pulsera." },
  { id: "shanghai", label: "Shanghái", cat: "lugares", src: "/imagenes-reales/shanghai.jpg", fuente: "Archivo fotográfico Vanguard", nota: "Fábricas, ríos de contenedores y puentes que nunca se vacían: el horizonte más fotografiado desde arriba." },
  { id: "sidney", label: "Sídney", cat: "lugares", src: "/imagenes-reales/sidney.jpg", fuente: "Archivo fotográfico Vanguard", nota: "El faro del hemisferio sur: todo buque que cruza el estrecho de Torres firma bitácora frente a esta bahía." },
  { id: "singapur", label: "Singapur", cat: "lugares", src: "/imagenes-reales/singapur.jpg", fuente: "Archivo fotográfico Vanguard", nota: "El puerto que mueve una quinta parte del comercio del planeta en menos superficie que una provincia." },
  { id: "suez", label: "Canal de Suez", cat: "lugares", src: "/imagenes-reales/suez.jpg", fuente: "Archivo fotográfico Vanguard", nota: "Un barco atascado en 2021 paralizó el comercio de medio mundo durante seis días: arteria sin bypass." },
  { id: "sumeria", label: "Zigurat de Ur", cat: "civilizaciones", src: "/imagenes-reales/sumeria.jpg", fuente: "Archivo fotográfico Vanguard", nota: "El zigurat de Ur: donde la escritura empezó a contar deudas, raciones y reyes hace 4.600 años." },
  { id: "svalbard", label: "Bóveda de Semillas de Svalbard", cat: "archivo", src: "/imagenes-reales/svalbard.jpg", fuente: "Archivo fotográfico Vanguard", nota: "La caja fuerte del planeta: medio millón de semillas enterradas bajo el permafrost por si acaso." },
  { id: "tartessos", label: "Marismas del Guadalquivir (Tartessos)", cat: "civilizaciones", src: "/imagenes-reales/tartessos.jpg", fuente: "NASA Science", nota: "Las marismas del Guadalquivir: bajo este agua y este mito duerme la civilización más antigua de Occidente." },
  { id: "tokio", label: "Tokio", cat: "lugares", src: "/imagenes-reales/tokio.jpg", fuente: "Archivo fotográfico Vanguard", nota: "La mayor mancha de luz nocturna del planeta: de noche la ciudad parece flotar sobre un mar de lámparas." },
  { id: "u2", label: "Avión espía U-2", cat: "archivo", src: "/imagenes-reales/u2.jpg", fuente: "Archivo fotográfico Vanguard", nota: "Volando a 21.000 metros desde 1956: el avión que explicó miles de avistamientos y fundó la era del espía aéreo." },
  { id: "v2", label: "Cohete V-2", cat: "armas", src: "/imagenes-reales/v2.jpg", fuente: "Archivo fotográfico Vanguard", nota: "El primer objeto humano en tocar el borde del espacio: nació como arma y acabó abriendo la ruta a las estrellas." },
];

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

export function buscarImagenes(q: string): ImagenReal[] {
  const v = norm(q.trim());
  if (!v) return IMAGENES_REALES;
  return IMAGENES_REALES.filter((im) => norm(im.label + " " + im.nota + " " + im.cat).includes(v));
}

export function imagenesDeCat(cat: ImagenCat | "todo"): ImagenReal[] {
  return cat === "todo" ? IMAGENES_REALES : IMAGENES_REALES.filter((im) => im.cat === cat);
}

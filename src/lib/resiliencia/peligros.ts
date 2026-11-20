// ═══════════════════════════════════════════════════════════════════
// v420.1 · MISIÓN 09 · ENTREGABLE 3 — FICHAS DE PELIGROS NATURALES
//
// Doce fichas: qué es cada peligro, cómo lo mide la ciencia, qué señales
// enseña el propio terreno, qué cifras lo dimensionan y qué mitos hay que
// quitar de en medio. Ninguna ficha declara un suceso real: eso le toca a
// la autoridad y a los datos vivos de la casa (/pulso-mundial, /centinela).
//
// Fuentes citadas en texto (regla de oro: cero enlaces exteriores):
// Ready.gov/FEMA, IFRC, UNDRR (Marco de Sendai 2015-2030), OMS, OCHA,
// servicios meteorológicos nacionales (NWS/AEMET/ONAMET/IDEAM…).
// ═══════════════════════════════════════════════════════════════════

import type { FichaPeligro } from "./tipos";

export const PELIGROS: FichaPeligro[] = [
  {
    id: "sismo",
    nombre: "Terremoto",
    familia: "geológico",
    icono: "activity",
    queEs:
      "Una rotura súbita en la corteza terrestre que libera energía en forma de ondas. El suelo tiembla durante segundos, no durante minutos: casi todo el daño ocurre en ese lapso y en lo que se cae dentro de los edificios.",
    medicion: {
      escala: "Magnitud de momento (la heredera de la escala de Richter)",
      texto:
        "Es logarítmica: cada grado entero multiplica por ~31 la energía liberada. Un 7.0 no es «un poco más» que un 6.0: es treinta veces más energía. Por eso la diferencia entre dos números pequeños es enorme.",
    },
    senales: [
      "No hay predicción operativa: ningún método aceptado por la ciencia anuncia el día y la hora de un sismo.",
      "Lo que sí existe es la alerta sísmica temprana: detecta la primera onda y da segundos de aviso antes de que llegue la onda que daña.",
      "Después del primer temblor vienen réplicas; pueden durar días y semanas y volver a caer lo que quedó debilitado.",
    ],
    exposicion:
      "Zonas de contacto entre placas tectónicas y suelos blandos de antigua cuenca o relleno: ahí la sacudida se amplifica aunque el epicentro esté lejos.",
    datos: [
      { etiqueta: "Tiempo típico de sacudida fuerte", valor: "10–60 s", nota: "Depende de la magnitud y la distancia; el daño se concentra en ese intervalo." },
      { etiqueta: "Energía por grado de magnitud", valor: "×31", nota: "Escala logarítmica de momento sísmico." },
      { etiqueta: "Causa principal de lesiones", valor: "Lo que cae y se desplaza", nota: "Muebles, vidrios, falsos techos, fachadas; no el suelo en sí." },
    ],
    mitos: [
      { mito: "Hay que correr a la puerta del marco.", realidad: "Quedarse, cubrirse y agarrarse es más seguro: la mayoría de las lesiones ocurren al intentar moverse en la oscuridad." },
      { mito: "Existe el «triángulo de la vida».", realidad: "No está respaldado por los organismos de protección civil; los objetos se vuelcan y aplastan ese hueco." },
      { mito: "Las puertas de los coches protegen.", realidad: "Un vehículo puede recibir una caída encima; si estás conduciendo, para en un sitio despejado y quédate dentro." },
    ],
    reduccion: [
      "Fijar estanterías, calderas y muebles altos a la pared",
      "guardar vidrios y líquidos inflamables con cierre de seguridad",
      "revisar la estructura de la vivienda con un técnico",
      "conocer cómo se corta el gas y la luz, y cerrarlos solo si hay fuga o daño real",
    ],
    fuente: "Ready.gov (FEMA) · «Earthquakes: Drop, Cover and Hold On»; IFRC · guías comunitarias",
  },
  {
    id: "tsunami",
    nombre: "Tsunami",
    familia: "geológico",
    icono: "waves",
    queEs:
      "Una serie de olas generada por un sismo submarino, una erupción o un deslizamiento en el mar. No es una ola de surf: es el nivel del mar subiendo con fuerza y arrastrando lo que encuentra, oleada tras oleada.",
    medicion: {
      escala: "Amarillos de alerta de tsunami (aviso, vigilancia, cancelación)",
      texto:
        "Los centros de aviso calculan tiempos de llegada por cuenca. El aviso dice «puede haber oleada»: la orden de evacuar la da la protección civil de cada país, no una app.",
    },
    senales: [
      "Un sismo fuerte cerca de la costa que dura más de un minuto: evacúa hacia lo alto sin esperar orden.",
      "El mar se retira de forma anormal dejando el fondo al aire.",
      "Un rugido continuo parecido al de un tren o un avión, viniendo del mar.",
    ],
    exposicion:
      "Playas, desembocaduras, malecones y terrenos de menos de ~10–15 metros sobre el nivel del mar a menos de 1–2 km de la costa. La costa no es un lugar seguro durante un sismo.",
    datos: [
      { etiqueta: "Intervalo entre oleadas", valor: "minutos", nota: "La primera no es necesariamente la más grande; el peligro sigue horas." },
      { etiqueta: "Aviso útil en costas cercanas", valor: "minutos, no horas", nota: "Por eso la señal natural vale más que la notificación." },
      { etiqueta: "Distancia vertical recomendada", valor: "≥10 m o 2 km tierra dentro", nota: "Criterio orientativo general: manda el plan local de evacuación." },
    ],
    mitos: [
      { mito: "Si el mar se retira, ve a mirar.", realidad: "Esa retirada es la señal de evacuación inmediata: aléjate, no te acerques." },
      { mito: "Una sola ola y se acaba.", realidad: "Es una serie; volver pronto es el error que más víctimas añade." },
      { mito: "Un muro alto protege.", realidad: "El agua remonta, erosiona la base y puede doblar la estructura sobre la población." },
    ],
    reduccion: [
      "Conocer la ruta y el punto alto de evacuación andando (no en coche)",
      "identificar el edificio vertical seguro si no hay altura posible",
      "no vivir, ni dormir, ni estacionar en la franja baja",
      "participar en los simulacros costeros",
    ],
    fuente: "UNDRR · Alertas de tsunami; IFRC · preparación comunitaria costera",
  },
  {
    id: "ciclon",
    nombre: "Ciclón tropical (huracán, tifón)",
    familia: "hidrometeorológico",
    icono: "tornado",
    queEs:
      "Una tormenta que se alimenta de mar cálido y organiza viento, lluvia y mar en espiral. Huracán, tifón y ciclón son el mismo fenómeno con nombre de océano distinto.",
    medicion: {
      escala: "Saffir–Simpson, categorías 1 a 5 por viento sostenido",
      texto:
        "La categoría mide viento, no peligrosidad total. Un ciclón de categoría 1 puede causar más daño que un 4 si trae lluvias torrenciales, crece deprisa o toca tierra donde la gente no se preparó.",
    },
    senales: [
      "«Vigilancia» = condiciones posibles en las siguientes 48 horas: hay que comenzar a prepararse.",
      "«Aviso» (= alerta) = condiciones esperadas en las próximas 36 horas: ya es tarde para empezar; es el momento de proteger la vivienda y evacuar si lo mandan.",
      "El ojo: calma engañosa de minutos a menos de una hora; el viento vuelve de golpe y desde el sentido contrario.",
    ],
    exposicion:
      "Franja costera baja (marejada ciclónica), laderas y barrancos (lluvia = inundación y deslizamiento), y viviendas de techo ligero en cualquier punto del recorrido.",
    datos: [
      { etiqueta: "Peligro que más vidas se lleva", valor: "La marejada", nota: "El mar empujado por el viento inunda la costa; no el viento en sí." },
      { etiqueta: "Viento de categoría 1", valor: "≥119 km/h sostenidos", nota: "Umbral de la escala Saffir–Simpson." },
      { etiqueta: "Ventana de aviso razonable", valor: "3–5 días", nota: "Es la ventaja del ciclón sobre el terremoto: da tiempo. Úsalo." },
    ],
    mitos: [
      { mito: "Cinta adhesiva en forma de X en los cristales.", realidad: "No evita la rotura y sí lanza trozos mayores; son cierres, contraventanas o paneles." },
      { mito: "Está más seguro en casa si el ojo pasa.", realidad: "Sal de la vivienda solo con la orden de retorno oficial: el viento regresa sin avisar." },
      { mito: "Si no es de categoría mayor, no importa.", realidad: "El agua y la marejada no siguen la categoría; la mayoría de muertos por ciclón son por inundación." },
    ],
    reduccion: [
      "Poda y retiro de lo que puede volverse proyectil, limpieza de imbornales y canaletas, cierres para huecos, tener resuelto dónde dormir si la vivienda es ligera, y un plan escrito con nombre y teléfono de la autoridad que manda evacuar",
    ],
    fuente: "Ready.gov (FEMA) · «Hurricanes»; NWS/NOAA · vigilancia y aviso; OMM",
  },
  {
    id: "inundacion",
    nombre: "Inundación y crecida",
    familia: "hidrometeorológico",
    icono: "droplets",
    queEs:
      "Agua donde no la había: por lluvia intensa en pocas horas (inundación repentina, «flash flood»), por desbordamiento lento de un río, o por fallo de drenaje urbano en una tormenta corta.",
    medicion: {
      escala: "Niveles de aviso hidrológico y periodos de retorno",
      texto:
        "Un río «de 100 años» no significa que pase una vez cada siglo: significa que hay una probabilidad anual en torno al 1 %. Es un riesgo estadístico, no un calendario.",
    },
    senales: [
      "Subida rápida del nivel, agua que entra por rejas y bajantes, y olor a barro nuevo.",
      "Ruido de arrastre: golpe de troncos y piedras contra el puente o la pared.",
      "Lluvia intensa sostenida aguas arriba: la crecida puede llegar cuando aquí ya escampó.",
    ],
    exposicion:
      "Llanuras de inundación, cauces entubados o canalizados, urbanizaciones al pie de ladera, sótanos y aparcamientos subterráneos, y pasos de agua en carreteras.",
    datos: [
      { etiqueta: "Agua en movimiento que derriba a un adulto", valor: "~15 cm", nota: "Cifra de seguridad vial usada por los servicios de emergencia." },
      { etiqueta: "Agua que arrastra un turismo", valor: "~60 cm", nota: "Nunca cruces un paso inundado: el firme puede ya no estar bajo el agua." },
      { etiqueta: "Mayor riesgo de muerte", valor: "El coche y el sótano", nota: "Dos lugares donde la gente subestima el agua que sube." },
    ],
    mitos: [
      { mito: "Conozco el vado, puedo pasar.", realidad: "El vado es el punto donde más gente muere en inundaciones: cambia de forma en cada crecida." },
      { mito: "Bajar al garaje a salvar el coche.", realidad: "Un sótano se llena en minutos y la puerta se convierte en un muro de agua." },
      { mito: "Si escampó, pasó el peligro.", realidad: "La cuenca recoge aguas arriba y descarga más tarde." },
    ],
    reduccion: [
      "No construir ni dormir en el punto bajo del solar, elevar cuadro eléctrico y caldera, mantener limpios sumideros y azoteas, conocer la cota de inundación local y tener una ruta hacia un punto alto a pie",
    ],
    fuente: "Ready.gov (FEMA) · «Floods»; IFRC · preparación comunitaria ante inundaciones",
  },
  {
    id: "deslizamiento",
    nombre: "Deslizamiento de terreno",
    familia: "geológico",
    icono: "mountain",
    queEs:
      "Una masa de tierra, roca y agua que se despeña por una ladera, casi siempre tras lluvia intensa o un sismo. Va acompañada de lo que encuentre: árboles, vallados, muros y casas.",
    medicion: {
      escala: "Sin escala única: se estudia por pendiente, material y saturación",
      texto:
        "La lluvia acumulada de los días anteriores pesa tanto como la tormenta del día. Los mapas de susceptibilidad los publica la autoridad geológica de cada país.",
    },
    senales: [
      "Grietas nuevas en muros, soleras o en el terreno del jardín.",
      "Puertas y ventanas que dejan de cerrar o se atascan.",
      "Árboles, postes o vallados que empiezan a inclinarse en fila («árbol borracho»).",
      "Agua que aparece de golpe en un punto nuevo del terreno, o un sonido sordo de árboles rompiéndose.",
    ],
    exposicion:
      "Taludes cortados por carreteras, laderas con corte al pie para construir, cauces con las riberas excavadas y rellenos recientes sin compactar.",
    datos: [
      { etiqueta: "Desencadenante nº 1", valor: "Lluvia sostenida", nota: "La saturación del terreno reduce el rozamiento que lo sostiene." },
      { etiqueta: "Desencadenante nº 2", valor: "Sismo", nota: "Por eso un terremoto fuerte deja deslizamientos durante horas." },
      { etiqueta: "Aviso útil", valor: "Señales lentas, días antes", nota: "Es uno de los pocos peligros que avisa con grietas." },
    ],
    mitos: [
      { mito: "Las raíces de los árboles sujetan siempre.", realidad: "Aportan cohesión, pero un árbol de raíz superficial puede actuar como palanca y volcar arrastrando tierra." },
      { mito: "Si fue hace años, ya no vuelve.", realidad: "El mismo flanco vuelve a moverse con la misma lluvia." },
      { mito: "Un muro de hormigón lo para.", realidad: "Sin drenaje detrás, el agua lo empuja y lo tira." },
    ],
    reduccion: [
      "No cortar el pie de la ladera, gestionar el agua (canaletas, drenajes, no filtraciones de tuberías), vigilar las grietas con una cinta o testigo y reportar el movimiento a la autoridad",
    ],
    fuente: "Ready.gov (FEMA) · «Landslides and Mudslides»; UNDRR · conocimiento del riesgo",
  },
  {
    id: "volcan",
    nombre: "Erupción y ceniza volcánica",
    familia: "volcánico",
    icono: "flame",
    queEs:
      "Un volcán puede dar lluvia de ceniza, gases, flujos piroclásticos y lahares (barro de origen volcánico). La ceniza es roca molida: no es polvo, es vidrio fino y abrasivo.",
    medicion: {
      escala: "Índice de Explosividad Volcánica (VEI) y niveles de alerta interna",
      texto:
        "Los niveles de alerta los mantiene el observatorio del país y solo él cambia el color de la alerta. Aquí no se copia ni se anticipa ninguno.",
    },
    senales: [
      "Aumento de sismos leves y temblores continuos («tremor»).",
      "Deformación del flanco medida por el observatorio.",
      "Cambio en la salida de gases, olor a azufre, animales que se van.",
    ],
    exposicion:
      "Valles que bajan del edificio (lahares), laderas cercanas a la cumbre (flujos), y cualquier punto a sotavento del viento: la ceniza viaja cientos de kilómetros y cae en pueblos que nunca vieron el volcán.",
    datos: [
      { etiqueta: "Por qué cae el tejado", valor: "Ceniza mojada = peso", nota: "10 cm de ceniza húmeda pueden superar la carga de una cubierta ligera." },
      { etiqueta: "Peligro más letal", valor: "Flujo piroclástico", nota: "Mezcla incandescente de gas y roca que baja por el valle a gran velocidad." },
      { etiqueta: "Agua", valor: "Solo cubierta o embotellada", nota: "La ceniza contamina depósitos abiertos y pozas." },
    ],
    mitos: [
      { mito: "La ceniza es como la arena de playa.", realidad: "Es vidrio y roca molida: raya los ojos, daña los pulmones, conduce la electricidad y corroe los motores." },
      { mito: "Barrer la ceniza en seco está bien.", realidad: "Levanta una nube respirable; se humedece antes y se recoge con mascarilla y gafas cerradas." },
      { mito: "Si ya escampó ceniza, vuelve uno a casa.", realidad: "El retorno lo autoriza la autoridad; los lahares pueden bajar con la primera lluvia." },
    ],
    reduccion: [
      "Limpiar canaletas y cubiertas con protocolo seguro, proteger depósitos de agua, guardar respiradores y gafas, no usar el coche con ceniza (arruina motor y frenos) y conocer el nivel de alerta oficial",
    ],
    fuente: "UNDRR · riesgo volcánico; OMS · calidad del aire y ceniza",
  },
  {
    id: "incendio-forestal",
    nombre: "Incendio forestal e interfaz urbano",
    familia: "ambiental",
    icono: "flame",
    queEs:
      "Fuego que se propaga por vegetación. El peligro para una casa no es solo la línea de fuego: son los tizones que el viento lanza por delante y el calor radiante que enciende lo que hay alrededor de la vivienda.",
    medicion: {
      escala: "Índices de peligro meteorológico y avisos rojo/naranja de riesgo",
      texto:
        "El aviso de riesgo lo emite el servicio de emergencias o meteorológico del país, suele durar horas y dice cómo está el combustible vivo: seco, viento, baja humedad. No lo emite una web de contenido.",
    },
    senales: [
      "Humo con olor a resina y viento constante con humedad muy baja.",
      "Puntos de fuego nuevos apareciendo a favor del viento, y «fingers» de humo separados.",
      "Braseros que llegan a la casa: pinochas, trozos de corteza encendidos en el suelo o en el tejado.",
    ],
    exposicion:
      "Viviendas rodeadas de vegetación continua, con tejado de material combustible, canalones llenos de pinocha y sin separación entre macizos y muros.",
    datos: [
      { etiqueta: "Distancia de los braseros", valor: "más de 1 km", nota: "Por eso la defensa empieza en el tejado y el jardín, no en el lindero del monte." },
      { etiqueta: "Construcción que más arde", valor: "Cubierta y canalones", nota: "Son la primera superficie que recibe la brasa." },
      { etiqueta: "Margen para irse", valor: "Mucho antes de que se vea el fuego", nota: "Las órdenes de evacuación preventivas existen para evitar el atasco." },
    ],
    mitos: [
      { mito: "Cortar un árbol alrededor de la casa basta.", realidad: "Hay que gestionar también el suelo: pinocha, mantillo y matorral bajo pegados al muro." },
      { mito: "Puedo quedarme a defender la finca.", realidad: "Un cambio de viento deja la zona sin salida; las autoridades recomiendan irse si hay duda." },
      { mito: "Mojar el tejado lo protege todo el día.", realidad: "El agua se evapora en minutos con viento y calor bajo." },
    ],
    reduccion: [
      "Espacio defendible despejado alrededor de la vivienda, tejado y canalones no combustibles y limpios, no almacenar leña ni gas contra la pared, tener la manguera sin presión pero conectada, y tener la salida decidida de antemano",
    ],
    fuente: "Ready.gov (FEMA) · «Wildfires»; IFRC · fuego y comunidad; servicios de emergencia nacionales",
  },
  {
    id: "calor",
    nombre: "Ola de calor y calor extremo",
    familia: "climático",
    icono: "sun",
    queEs:
      "Temperaturas sostenidas por encima de lo habitual para la zona, con noches que no bajan y no dejan recuperar el cuerpo. Es el peligro natural que más muertes acumula de forma silenciosa.",
    medicion: {
      escala: "Avisos por calor e índice de temperatura-percepción",
      texto:
        "La humedad cambia el riesgo: con aire saturado el sudor no evapora y el cuerpo pierde su sistema de refrigeración. Un «30 °C» con 90 % de humedad puede ser más peligroso que un «38 °C» seco.",
    },
    senales: [
      "Calor que no cede de noche y viviendas sin ventilación cruzada.",
      "Personas mayores, enfermos crónicos, embarazadas, niños y quienes trabajan al aire libre.",
      "Agotamiento: sed intensa, mareo, calambres, piel fría y húmeda, pulso rápido.",
    ],
    exposicion:
      "Últimas plantas y áticos, barrios densos con poco arbolado («isla de calor»), viviendas sin sombra ni ventilación y quienes cuidan a alguien encamado.",
    datos: [
      { etiqueta: "Golpe de calor", valor: "Urgencia médica", nota: "Piel caliente y seca, confusión, desmayo: llama a emergencias y enfría mientras llega la ayuda." },
      { etiqueta: "Interior de un coche aparcado", valor: "Sube en minutos", nota: "Nunca se deja a un niño, una persona mayor ni un animal dentro, ni «un momento»." },
      { etiqueta: "Regla de las visitas", valor: "2 veces al día", nota: "Recomendación estándar para personas vulnerables en episodios de calor." },
    ],
    mitos: [
      { mito: "Beber solo cuando se tiene sed.", realidad: "La sed llega tarde, sobre todo en mayores: hay que ofrecer agua con regularidad." },
      { mito: "El ventilador resuelve todo.", realidad: "Con temperaturas muy altas y poca aireación el ventilador no basta: hace falta bajar la temperatura corporal (ducha, paños, habitación más fresca)." },
      { mito: "Si hace sol, el aire libre es sano.", realidad: "En episodio de calor, las horas duras son para interiores con sombra y agua." },
    ],
    reduccion: [
      "Sombra y arbolado, techos y fachadas claros, contraventanas que cierren el sol de la tarde, botella siempre llena, y una red de vecinos que se cite para llamar a la puerta de quien vive solo",
    ],
    fuente: "OMS · calor y salud; AEMET / servicios meteorológicos nacionales · avisos",
  },
  {
    id: "frio",
    nombre: "Frío extremo, nieve y hielo",
    familia: "climático",
    icono: "snowflake",
    queEs:
      "Temperaturas para las que la vivienda, el cuerpo y la red no están preparados. Combina hipotermia, hielo en la vía pública, cortes de luz y tubos reventados.",
    medicion: {
      escala: "Sensación térmica y avisos por frío/nevada/hielo",
      texto:
        "El viento multiplica el frío: la sensación térmica es lo que el cuerpo aguanta, no lo que marca el termómetro.",
    },
    senales: [
      "Hipotermia: temblor incontrolable, torpeza, memoria floja, habla pastosa, sueño (y deja de temblar: empeora).",
      "Quemadura por frío: zona amarillenta o cérea, endurecida, sin sensibilidad en dedos, nariz, orejas.",
      "Tubo reventado: grifo que no da nada con la vivienda fría; el hielo dilata y revienta.",
    ],
    exposicion:
      "Viviendas mal aisladas y sin calefacción segura, personas sin hogar, mayores con calefacción insuficiente por coste, y quienes calientan con brasas o braseros en interiores.",
    datos: [
      { etiqueta: "Prioridad sanitaria", valor: "Hipotermia = urgencia", nota: "Mantén a la persona despierta y abrigada, retira ropa húmeda y pide ayuda." },
      { etiqueta: "Calefacción improvisada", valor: "Nunca en interior cerrado", nota: "Brasas, hornos y barbacoas matan por monóxido de carbono: invisible y sin olor." },
      { etiqueta: "Conducción", valor: "Hielo negro", nota: "No se ve: puentes, sombras y horas antes del amanecer." },
    ],
    mitos: [
      { mito: "El alcohol entradas.", realidad: "Da sensación de calor y baja la temperatura real del núcleo corporal." },
      { mito: "Frotar la zona congelada.", realidad: "Fricciona daño; se recalienta con agua tibia (no caliente) y se cubre." },
      { mito: "Tapar la estufa para que dure.", realidad: "Convierte la casa en una cámara de monóxido de carbono: detector y ventilación." },
    ],
    reduccion: [
      "Aislar ventanas y grietas, proteger tuberías, dejar un goteo en la noche más dura, tener ropa de abrigo seca a la mano, un plan para cortar leña y mantenerla seca, y conocer quién en tu escalera vive solo",
    ],
    fuente: "Ready.gov (FEMA) · «Cold weather»; OMS · frío y salud pública",
  },
  {
    id: "tornado",
    nombre: "Tornado y mangá",
    familia: "hidrometeorológico",
    icono: "tornado",
    queEs:
      "Una columna de aire en rotación en contacto con el suelo, nacida de una tormenta severa. Dura minutos, pero concentra la fuerza del viento más violenta que existe.",
    medicion: {
      escala: "Escala Enhanced Fujita (EF0–EF5) según el daño",
      texto:
        "La categoría se asigna DESPUÉS, midiendo lo que tiró. Antes solo existen la vigilancia («puede formarse») y el aviso («se formó o lo detecta el radar»: refúgiate ya).",
    },
    senales: [
      "Cielo verdoso, nubes en rotación baja y un ruido continuo como de tren de mercancías.",
      "Debris (basura y ramas) girando antes de ver el embudo.",
      "Calma repentina tras granizo: puede ser la pared del ojo de la tormenta que lo trae.",
    ],
    exposicion:
      "Viviendas sin sótano ni habitación interior, casas móviles y aulas o naves con grandes cubiertas ligeras.",
    datos: [
      { etiqueta: "Refugio en casa", valor: "Nivel más bajo, centro", nota: "Habitación interior sin ventanas: baño, pasillo, bajo la escalera." },
      { etiqueta: "Protección de la cabeza", valor: "Casco", nota: "Recomendación habitual de los servicios de emergencia en zonas de tornado." },
      { etiqueta: "Coche y autocar", valor: "No son refugio", nota: "Si no hay edificio cerca, agáchate en terreno bajo y cúbrete la cabeza." },
    ],
    mitos: [
      { mito: "Abrir las ventanas para «igualar presión».", realidad: "No salva la casa y sí te pone a la intemperie: el daño lo hace el viento que entra." },
      { mito: "Bajo un puente.", realidad: "Es un mal lugar: el flujo acelera y te expone a los escombros." },
      { mito: "Aquí nunca pasa.", realidad: "La estadística regional no protege a ninguna casa concreta." },
    ],
    reduccion: [
      "Tener decidida la habitación de refugio y ensayarlo con los niños, un silbato y una radio de pilas dentro del refugio, y entrar calzado cerrado y casco si se avecina el aviso",
    ],
    fuente: "Ready.gov (FEMA) · «Tornadoes»; NWS · vigilancia y aviso",
  },
  {
    id: "sequia",
    nombre: "Sequía",
    familia: "climático",
    icono: "sun-dim",
    queEs:
      "Falta de agua prolongada que empieza en el cielo (menos lluvia), sigue en el suelo (sin recarga) y llega al grifo (restricciones). Es el peligro lento: no tiene foto, pero vacía embalses y cosechas.",
    medicion: {
      escala: "Índices de sequía (precipitación, evaporación, reservas, caudales)",
      texto:
        "La autoridad de cuenca declara la situación y las restricciones. Aquí no se declara nada: se enseña a leer avisos reales y a ahorrar sin que lo manden.",
    },
    senales: [
      "Pozos y manantiales que bajan su caudal o cambian de color el agua.",
      "Cultivos con estrés en las horas duras, terreno agrietado en la orilla de los embalses.",
      "Nieve de montaña por debajo de lo normal: es la reserva del verano.",
    ],
    exposicion:
      "Dependencias de un solo embalse o acuífero, comunidades de regadío al final de la canal, islas y municipios con agua desalada o camión-cisterna.",
    datos: [
      { etiqueta: "Agua de bebida por persona y día", valor: "≈4 litros", nota: "Criterio humanitario de referencia para situaciones de emergencia; se multiplica con calor y con personas enfermas." },
      { etiqueta: "Uso doméstico que más se puede bajar", valor: "Riego, piscina, grifos abiertos", nota: "Ahorrar en jardín es lo primero que rinde y lo que menos duele." },
      { etiqueta: "Efecto en la salud mental", valor: "Reconocido", nota: "La sequía prolongada golpea a quien vive de la tierra; es un problema de comunidad, no de individual." },
    ],
    mitos: [
      { mito: "Ya lloverá en otoño y se acaba.", realidad: "La recarga de acuíferos es lenta: puede tardar años en reponerse." },
      { mito: "El ahorro doméstico no cuenta.", realidad: "Sumado, es una parte grande de la demanda de un municipio." },
      { mito: "Solo es problema del campo.", realidad: "Sube el precio de los alimentos y afecta al suministro urbano." },
    ],
    reduccion: [
      "Plantas adaptadas al clima local, riego por goteo y a primera o última hora, captación de agua de lluvia para el jardín, reparación de fugas (un goteo constante son cientos de litros al mes) y un plan municipal con prioridades de consumo",
    ],
    fuente: "UNDRR · riesgo de sequía; FAO/OMM · monitoreo de sequías",
  },
  {
    id: "aire",
    nombre: "Aire contaminado y humo",
    familia: "ambiental",
    icono: "wind",
    queEs:
      "Aire con partículas finas (PM2.5), humo de incendios, polvo en suspensión, ceniza o contaminación urbana acumulada por una inversión térmica. Se respira sin notar y es donde más se confunde a la gente.",
    medicion: {
      escala: "Índice de calidad del aire (AQI) por tramos de color",
      texto:
        "Lo publica la red de medición de cada país o región. Aquí no se copia el dato: se enseña a interpretarlo — cuanto más finas las partículas, más adentro llegan.",
    },
    senales: [
      "Olor a humo, picor de ojos y tos en personas sanas.",
      "Visibilidad reducida con aire quieto y sin viento.",
      "Niños, embarazadas, mayores, asmáticos y cardiacos empiezan a notar antes que el resto.",
    ],
    exposicion:
      "Interior de la vivienda (donde se pasa el 80-90 % del tiempo), escuelas junto a vías con tráfico, barrios en el valle con inversión térmica y trabajadores al aire libre.",
    datos: [
      { etiqueta: "Mascarilla quirúrgica", valor: "No filtra PM2.5", nota: "Sirve frente a gotículas; para partículas hace falta un respirador con certificación (N95/FFP2/P2) y buen ajuste." },
      { etiqueta: "Refugio interior", valor: "Ventanas cerradas, aire filtrado", nota: "Si la vivienda no tiene filtro, una caja con filtro HEPA doméstico ayuda mientras dure el episodio." },
      { etiqueta: "Ejercicio al aire libre", valor: "Se suspende en episodio", nota: "Ventilar en las horas de mejor aire, no durante el episodio." },
    ],
    mitos: [
      { mito: "Si no se ve el humo, el aire está bien.", realidad: "Las partículas más dañinas no se ven." },
      { mito: "Un paño mojado basta.", realidad: "Da una sensación de frescor, no filtración certificada." },
      { mito: "Los niños aguantan igual.", realidad: "Respiran más rápido por kilo de peso y su pulmón está en desarrollo." },
    ],
    reduccion: [
      "Reducir quemas agrícolas y de jardín (muchos episodios de aire empiezan ahí), mantenimiento de calefacciones, transporte menos contaminante en las horas punta, y sala de refugio con aire limpio en la escuela",
    ],
    fuente: "OMS · directrices de calidad del aire; redes regionales de medición",
  },
];

export const PELIGRO_POR_ID: Record<string, FichaPeligro> = Object.fromEntries(
  PELIGROS.map((p) => [p.id, p]),
);

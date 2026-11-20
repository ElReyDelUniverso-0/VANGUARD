// ═══════════════════════════════════════════════════════════════════
// v420.1 · MISIÓN 09 · ENTREGABLE 12 — CORTES DE AGUA Y DE LUZ
//
// El caso más frecuente y el peor tratado: se corta el agua o la luz en una
// ciudad de un millón de personas y la gente improvisa con lo que hay a las
// once de la noche. Aquí está el manual de ese caso, con las cifras frías.
// ═══════════════════════════════════════════════════════════════════

export interface CorteFicha {
  id: string;
  titulo: string;
  lema: string;
  señales: string[];
  antes: string[];
  durante: string[];
  despues: string[];
  cifras: { etiqueta: string; valor: string; nota: string }[];
  fuente: string;
}

export const CORTES: CorteFicha[] = [
  {
    id: "agua",
    titulo: "Corte de agua",
    lema: "Sin presión no hay agua en la planta alta, ni en la cisterna, ni en la ducha.",
    señales: [
      "El grifo escupe aire y después agua turbia u oxidada: rotura en la red o trabajo en la zona.",
      "Aviso municipal programado (obras, limpieza de depósitos): es el único corte que te avisa y el que más se ignora.",
      "Agua con sabor a cloro más fuerte de lo normal: la estación está subiendo la desinfección tras una contaminación.",
      "Un corte «para unas horas» que dura días: pasa en islas, cabeceras de red y redes viejas.",
    ],
    antes: [
      "En época seca, llena bidones de uso alimentario, la bañera o cubos limpios: no para beber, para el inodoro y la limpieza.",
      "Guarda agua embotellada para bebida y cocina: 4 litros por persona y día es la referencia humanitaria; multiplícala con calor, embarazo, lactancia o enfermedad.",
      "Ten un recipiente grande con un vaso «solo de beber» para que nadie ande abriendo la nevera y bebiendo del grifo dudoso.",
      "Averigua si tu edificio depende de bomba: en un edificio con depósitos propios, el agua se acaba cuando se agota el tanque, no cuando se seca el grifo de la calle.",
      "Guarda jabón de manos, gel hidroalcohólico y papel higiénico con la misma disciplina con la que se guarda agua.",
    ],
    durante: [
      "Orden de uso estricto: beber y cocinar → lavar manos y cara → bajar la cisterna → fregar y baldear.",
      "La higiene se sostiene con gel, toallitas y paño húmedo: una ducha innecesaria hoy puede ser la última del día.",
      "Si el agua vuelve sucia, abre el grifo y déjala correr a un cubo o desagüe hasta que salga clara antes de beber o cocinar.",
      "Sin agua, la cocina se reduce a lo que no necesita lavar: conserva, pan, fruta que se pela, plato de cartón y cubertería de una sola comida.",
      "Avisos a los vecinos que no tienen forma de enterarse: personas mayores solas, quien tiene un bebé, quien depende de diálisis en casa.",
    ],
    despues: [
      "Si la autoridad dice «no apta para consumo», sigue siéndolo aunque salga clara y sin olor: hiérvela o desinfecta.",
      "Limpia y desinfecta los depósitos que estuvieron secos y vacíos; los sedimentos se levantan con la primera llenada.",
      "Revisa tuberías y flexibles: una junta que trabajó con la presión negativa revienta al día siguiente.",
      "Registra el corte en la comunidad de propietarios con fechas y horas: es lo que se reclama a la compañía o al seguro.",
    ],
    cifras: [
      { etiqueta: "Agua de bebida por persona y día", valor: "≈4 litros", nota: "Referencia humanitaria (esfera/OMS) para situaciones de emergencia; sube con calor y con enfermedad." },
      { etiqueta: "Hervor para hacer agua segura", valor: "1 minuto a borbotón", nota: "3 minutos por encima de ~2.000 m de altitud. El agua turbia se filtra antes con un paño limpio." },
      { etiqueta: "Agua quieta en casa", valor: "riesgo de mosquitos", nota: "Los criaderos de dengue se generan en bidones y cubos mal tapados: tapa y vacía cada semana." },
    ],
    fuente: "OMS/UNICEF · agua en emergencias; CDC · desinfección de agua; normas humanitarias Esfera",
  },
  {
    id: "luz",
    titulo: "Corte de luz",
    lema: "Se apaga el frigorífico, la bomba de agua, el ascensor y el cajero. No se apaga la nevera de tu vecindario.",
    señales: [
      "Corte en el barrio tras tormenta, viento o calor extremo: lo normal es que sea la red, no tu casa.",
      "Se va solo tu cuadro: comprueba primero el diferencial y los magnetotérmicos antes de llamar a nadie.",
      "Parpadeos y luces que suben y bajan: inestabilidad de la red; puede preceder a un corte largo.",
      "Hora punta con avisos de «ajuste de demanda»: reduce el consumo de 19 a 22 h y no programes lavadoras ahí.",
    ],
    antes: [
      "Una linterna por persona en su cajón conocido; cero velas si hay niños, mascotas o cansancio.",
      "Baterías externas cargadas y una radio a pilas o de manivela para seguir el aviso oficial sin gastar el móvil.",
      "Aparca el coche con el depósito medio-alto: los surtidores eléctricos y las gasolineras con bomba eléctrica dejan de funcionar sin luz.",
      "Si dependes de un aparato (respirador, oxígeno, bomba de insulina, CPAP), registra la necesidad en la compañía y ten batería para 24-48 horas.",
      "Deja la puerta del frigorífico abierta «un dedo» solo en casas donde haya alguien con discapacidad cognitiva que pueda meterse: el plan real es un imán o una nota.",
    ],
    durante: [
      "Deja UNA luz encendida: es la que te avisa de que volvió. Apaga el resto para no disparar la instalación al reenganchar.",
      "No abras la nevera: aguanta unas 4 horas cerrada. El congelador lleno, mucho más; un congelador medio se descongela antes.",
      "Grupo electrógeno SOLO fuera, a varios metros de ventanas y puertas, nunca en garaje ni porche cerrado: el monóxido de carbono mata sin olor.",
      "Desconecta aparatos caros (televisor, consola, ordenador, nevera si va a ser largo) y deja un margen de un par de minutos antes de reconectar.",
      "En el ascensor: usa el timbre o el teléfono de emergencias, no forceces la puerta, no intentes salir por el hueco; el rescate es cosa de bomberos.",
      "Comida a la parrilla o brasas: fuera, con viento, lejos de la fachada, con un cubo de agua y sin dejar sola a la llama.",
    ],
    despues: [
      "Si el reloj parpadea, tienes la hora en que se fue la luz: úsala para saber cuánto tiempo estuvo la comida sin frío.",
      "Antes de volver a guardar, comprueba la nevera: si hay comida por encima de 4-5 °C durante más de 2 horas, fuera. «Táparla con agua» no la enfría: la contamina.",
      "Si saltó el diferencial, no lo fuerces: localiza qué circuito lo dispara antes de reconectar; un cable mojado vuelve a saltar dentro de la pared.",
      "Reclama por la vía del consumidor si el corte superó lo que la normativa de tu país permite: los derechos existen, pero hay que pedirlos.",
      "Recarga baterías el primer día que vuelva la luz, no el siguiente que te avisen.",
    ],
    cifras: [
      { etiqueta: "Frigorífico cerrado sin luz", valor: "≈4 horas", nota: "USDA/FDA: a partir de 2 h por encima de 4-5 °C hay que descartar perecederos." },
      { etiqueta: "Congelador lleno y cerrado", valor: "≈48 h", nota: "Un congelador a medias, ~24 h. No lo abras para mirar «por si acaso»." },
      { etiqueta: "Cadena de frío doméstica", valor: "4-5 °C a 60 °C", nota: "La «zona de peligro» microbiológica: ahí se multiplica lo que causa una intoxicación." },
    ],
    fuente: "Ready.gov (FEMA) · «Power outages»; OSHA/OMS · monóxido de carbono; USDA · seguridad alimentaria",
  },
  {
    id: "dos-a-la-vez",
    titulo: "Agua y luz cortadas a la vez",
    lema: "Es el caso real tras un sismo, un huracán o una nevada: se resuelve como logística, no como suerte.",
    señales: [
      "Después de un evento grande, el agua y la luz caen juntas porque las bombas de agua van con electricidad.",
      "Edificios con ascensor, bomba y portero eléctrico: sin luz el edificio está cerrado por dentro y por fuera.",
      "Los móviles entran en pánico social: la primera hora es de «¿estás bien?» y la segunda de «¿cuándo vuelve?».",
    ],
    antes: [
      "Regla de las 72 horas por miembro del hogar: agua, comida sin cocción, luz, batería, medicación y aseo. Se guarda junto, no repartido.",
      "Resuelve el agua y el inodoro sin electricidad: cubo, bolsas resistentes y virutas de gato o aserrín para secar; o el depósito de la bañera.",
      "Un vecino con generador o estufa de leña segura, y acuerdo explícito de qué se comparte y a cambio de nada durante cuántas horas.",
      "Plan de calor o frío pasivo: una sola habitación, mantas, ropa seca, ventanas cerradas de día y ventiladas al mediodía.",
    ],
    durante: [
      "Reúnete: la casa entera a la habitación con luz natural y cargadores, y una sola linterna encendida de noche.",
      "Turnos: quien baja a por agua, quien vigila la nevera, quien avisa a los tres vecinos vulnerables, quien habla con la portería.",
      "No uses agua de la calle, de canal ni de fuente para beber aunque corra limpia: hiérvela o desinfecta.",
      "Si hay humo dentro por una vela o un brasero, se apaga y se ventila; el monóxido no perdona la casa pequeña y cerrada.",
      "Fija una hora al día para el contacto con el mundo: radio, mensaje corto, revisar el aviso oficial una sola vez, no 40.",
    ],
    despues: [
      "El retorno se hace en orden: agua antes de luz si hay obra y barro, luz antes que nada si hay bombas y medicación refrigerada.",
      "Revisión de casa con luz de día: grietas, humedades, cableado, chimenea, tejado, y el olor a gas en cada estancia.",
      "La nevera se limpia con agua desinfectada y guantes; el congelador que se descongeló se limpia antes de volver a llenarlo.",
      "Cuenta el costo: comida tirada, alojamiento, transporte, horas de trabajo. Es la base de la reclamación y del aprendizaje del barrio.",
    ],
    cifras: [
      { etiqueta: "Regla de oro doméstica", valor: "72 horas", nota: "Es la ventana en la que las autoridades piden poder valerte tú solo antes de priorizar lo vital." },
      { etiqueta: "Qué se reanuda primero", valor: "agua, salud, comunicaciones", nota: "El orden de la recuperación de servicios en un municipio dañado." },
      { etiqueta: "Riesgo por vela y brasero", valor: "incendio y CO", nota: "Son las dos muertes «secundarias» más evitables de un corte largo." },
    ],
    fuente: "PAHO · evaluación rápida de daños; OMS · agua, energía y salud; IFRC · hogares resilientes",
  },
];

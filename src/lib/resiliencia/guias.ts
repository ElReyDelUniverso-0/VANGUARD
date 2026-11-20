// ═══════════════════════════════════════════════════════════════════
// v420.1 · MISIÓN 09 · ENTREGABLE 2 — GUÍAS POR TIPO DE EMERGENCIA
//
// Doce guías ANTES / DURANTE / DESPUÉS. Son material educativo: ninguna
// sustituye la orden de la autoridad local, y ninguna instrucción trata
// sobre violencia, ataques o sabotaje (línea roja de la MISIÓN 09).
// El «durante» es lo que se hace por uno mismo y por los de al lado.
// ═══════════════════════════════════════════════════════════════════

import type { GuiaEmergencia } from "./tipos";

export const GUIAS: GuiaEmergencia[] = [
  {
    id: "sismo",
    nombre: "Terremoto",
    peligro: "sismo",
    lema: "Segundos, no minutos: todo se decide antes, en casa.",
    antes: [
      "Asegura lo que puede caerse: estanterías fijadas a la pared, cuadros lejos de camas y sillones, objetos pesados en las baldas bajas.",
      "Localiza los tres puntos de tu casa donde cabe «cubrirse y agarrarse»: bajo una mesa firme, junto a un muro interior, lejos de ventanas.",
      "Corta el paso de una puerta que bloquea una salida y ten una linterna con pilas de repuesto en cada planta.",
      "Acuerda con la familia un punto de reunión a la intemperie y un contacto fuera de la ciudad al que llamar si alguien se pierde.",
      "Participa en los simulacros de verdad: la memoria muscular es lo que funciona cuando hay miedo.",
    ],
    durante: [
      "AGÁCHATE, CÚBRETE, AGÁRRATE. Debajo de una mesa firme, agarrado a la pata, hasta que pare la sacudida.",
      "Si estás en cama, quédate y cúbrete la cabeza con un cojín; si estás de pie, aléjate de cristales y estanterías.",
      "No uses el ascensor ni salgas corriendo a la calle: el frente de la fachada es lo primero que cae.",
      "Si conduces, para en un sitio despejado, fuera de puentes, viaductos y cables, y quédate dentro.",
      "Si te quedas bajo escombros, no grites de inmediato: golpea un tubo o una pared para que te oigan.",
    ],
    despues: [
      "Cuenta tus respiraciones y revisa a los que están contigo; solo después revisa la casa. Comprueba lesiones y sangrados y aplica presión.",
      "Huele gas antes de encender cualquier llama: si hueles, no toques interruptores, abre ventanas y sal; el corte del suministro lo hace la compañía o un técnico.",
      "Aléjate de edificios dañados y de muros agrietados: las réplicas terminan lo que el primer temblor empezó a romper.",
      "Comunica que estás bien a TU contacto fuera de la zona; así liberan la línea para quien necesita a los servicios de emergencia.",
      "Usa la información oficial (radio o canal verificado de la autoridad) para saber cuándo se puede volver al edificio.",
    ],
    noHagas: [
      "No enciendas fósforos ni velas para mirar si hay una fuga de gas.",
      "No vuelvas a por objetos: la vivienda debilitada puede caer con la primera réplica.",
      "No estacionar ni dejar a los niños bajo cables, postes o fachadas con cornisas.",
    ],
    inclusion:
      "Quien usa silla de ruedas bloquea los frenos, se protege la cabeza con cojín o casco y, si puede, se queda junto a un muro interior. Para personas sordas el aviso visual (luz que parpadea, vibración) sustituye a la sirena: acuerda en la familia quién avisa a quién, por escrito o por vibración.",
    fuente: "Ready.gov (FEMA) · «Earthquakes»; IFRC · apoyo psicosocial y protección civil comunitaria",
  },
  {
    id: "tsunami",
    nombre: "Tsunami",
    peligro: "tsunami",
    lema: "Si el suelo tiembla fuerte o el mar se retira, camina: no esperes el aviso.",
    antes: [
      "Mide andando el tiempo que tardas en llegar a un punto alto o a un edificio vertical resistente desde tu casa, tu escuela y tu trabajo.",
      "Aprende la ruta señalizada de evacuación y el punto de encuentro de tu barrio; camínala con la familia, no solo la mires en el mapa.",
      "Ten una bolsa ligera lista para ir a pie: medicación, documentos en bolsa impermeable, agua, abrigo y calzado cerrado.",
      "Si trabajas o estudias en la costa, conoce quién decide la evacuación en el edificio y por dónde se sale.",
    ],
    durante: [
      "Evacúa hacia lo alto en cuanto sientas el sismo fuerte o veas retirarse el mar: camina rápido, no corras, y ayuda a quien va más despacio.",
      "No vuelvas a por lo olvidado. Deja el coche: en las rutas de tsunami el atasco mata a más gente que el agua.",
      "Si no llegas a tiempo a la altura, entra en un edificio de hormigón resistente y sube al menos al tercer piso o a la azotea.",
      "Aléjate de puentes, desembocaduras y canales: la corriente se concentra y arrastra más ahí.",
      "Si estás en el mar, aléjate de la costa y de la desembocadura; en mar abierto la oleada se nota mucho menos.",
    ],
    despues: [
      "No regreses hasta que la autoridad declare el fin de la alerta: las oleadas siguientes pueden llegar con intervalos de decenas de minutos y ser mayores.",
      "Al volver, entra con botas y guantes: el agua que se retira deja clavos, vidrio, lodo y animales desplazados.",
      "Da por contaminado todo lo que el agua tocó: comida envasada no hermética, juguetes, cepillos de dientes, agua del pozo.",
      "Antes de volver a dar luz al inmueble, que un electricista revise la instalación y la humedad del cuadro.",
      "Registra con fotos y testigos los daños y el nivel que alcanzó el agua: es lo que abre después las ayudas y los seguros.",
    ],
    noHagas: [
      "No bajar a la playa a ver el mar retirado ni a grabar.",
      "No cruzar a pie ni en coche un paso con agua en movimiento, aunque parezca poco.",
      "No fiarse de «ya pasó, fue una sola ola».",
    ],
    inclusion:
      "Las personas con movilidad reducida, mayores, y con carrito de bebé necesitan ir más despacio: el plan de barrio debe prever quién acompaña a quién (sistema de compañeros) y prever tiempo extra, no dejarlas para el final. Para personas ciegas, la guía debe ser una persona con nombre y una ruta entrenada en seco.",
    fuente: "UNDRR · educación sobre tsunami; IFRC · comunidades costeras; servicios de alerta nacionales",
  },
  {
    id: "ciclon",
    nombre: "Ciclón, huracán o tifón",
    peligro: "ciclon",
    lema: "El ciclón avisa con días: el peligro es usarlos en otra cosa.",
    antes: [
      "Con vigilancia decretada, entra la vigilancia meteorológica de la autoridad en tu teléfono y repasa el plan familiar; con aviso, ya no se compra: ya se está en el refugio elegido.",
      "Limpia tejado y canalones, retira macetas, chapas, láminas y todo lo que el viento pueda convertir en proyectil; guarda los residuos dentro.",
      "Protege huecos con cierres o paneles; guarda agua embotellada y llena los recipientes de reserva; lava la ropa y tiéndela dentro.",
      "Ten el depósito de combustible lleno, efectivo en casa (los cajeros se quedan sin luz) y documentos en sobre impermeable.",
      "Resuelve dónde dormirán quienes viven en casa móvil, en la última planta o junto a un río: la evacuación temprana es la que salva.",
    ],
    durante: [
      "Si estás en una vivienda resistente, quédate en la habitación más alejada de los ventanales, con linterna, agua y radio a mano.",
      "Si estás fuera, busca refugio en un edificio sólido; no te resguardes bajo árboles, vallas ni marquesinas.",
      "No salgas durante el ojo: es un respiro corto; el viento vuelve de repente y desde el lado contrario.",
      "Si te mandaron evacuar, vete. No negocies con el agua ni con la marejada: un metro de mar empujado por el viento arranca una puerta.",
      "Conduce solo si es imprescindible, a baja velocidad y evita pasos de agua, puentes y caminos junto al mar.",
    ],
    despues: [
      "Mantente dentro hasta el aviso oficial de fin de evento: el viento baja, la lluvia sigue y el agua sube con retraso.",
      "Sal con zapatos gruesos y guantes; mira hacia arriba (ramas y cables sueltos) antes de cruzar.",
      "No toques cables caídos ni postes: da por viva toda línea tirada y avísala a la compañía.",
      "Usa generadores y brasas SOLO fuera de la casa, lejos de ventanas y puertas: el monóxido de carbono no huele y no se ve.",
      "Tira los alimentos que estuvieron sin frío más de dos horas y todo lo que tocó agua de inundación; hierve o desinfecta el agua si hay duda.",
    ],
    noHagas: [
      "No tapes cristales con cinta en X en lugar de cerrarlos con contraventana.",
      "No bajes al garaje a salvar el coche cuando sube el agua.",
      "No uses el ascensor ni el coche en una calzada anegada.",
    ],
    inclusion:
      "Quien depende de un aparato eléctrico (oxígeno, respirador, bomba de insulina) debe registrarse en la compañía eléctrica como cliente con necesidad asistencial ANTES de la temporada, tener baterías y un plan de red con un vecino que tenga generador. Personas con discapacidad intelectual o autismo: llevar auriculares, una tarjeta que explique sus necesidades y una figura de referencia conocida dentro del refugio reduce la crisis más que cualquier discurso.",
    fuente: "Ready.gov (FEMA) · «Hurricanes»; OMS · salud en albergues; OCHA · coordinación de respuesta",
  },
  {
    id: "inundacion",
    nombre: "Inundación",
    peligro: "inundacion",
    lema: "El agua no se negocia: se sube, se va o se espera arriba.",
    antes: [
      "Averigua si tu solar está en zona inundable (el planeamiento urbanístico y la confederación o autoridad de cuenca de tu país lo dice) y a qué cota llegó el agua en las crecidas recientes.",
      "Eleva caldera, cuadro eléctrico, enchufes bajos y electrodomésticos; en obras, usa materiales que se sequen bien en vez de yeso y moqueta en la planta baja.",
      "Mantén limpios imbornales, sumideros y canaletas; retira hojas antes del otoño, no después de la primera alerta.",
      "Ten barreras para puertas y tragaluces, y decide YA qué se sube y a dónde, no cuando llueve.",
    ],
    durante: [
      "Sube al nivel más alto con la bolsa lista y avisa a tu contacto que estás bien y en qué planta estás.",
      "No bajes a sótanos ni garajes; si te sorprende el agua en un garaje, sal y no intentes sacar el coche.",
      "Si el agua sube en la vivienda, cierra el paso de la electricidad y del gas si puedes hacerlo sin meterte en el agua.",
      "Si te quedas aislado en el tejado, hazte visible (ropa clara, linterna, pito) y llama a emergencias con la ubicación exacta; no nades para buscar ayuda.",
      "En la calle, aléjate del agua: 15 centímetros en movimiento tumban a un adulto y 60 centímetros arrastran un coche.",
    ],
    despues: [
      "Solo se vuelve cuando lo autoricen y el agua bajó: entra con luz artificial, no con velas, y con calzado de goma y guantes.",
      "Ventila y deshumidifica de inmediato: el moho empieza en 24-48 horas y es el problema de salud que viene después.",
      "Tira colchones, cojines, juguetes de peluche, alimentos y medicinas que tocó el agua; desinfecta superficies duras y lava ropa a 60 °C.",
      "No conectes aparatos mojados: que un técnico revise instalación, caldera y electrodomésticos.",
      "Documenta con fotos, fecha y una lista firmada lo dañado; comunícalo al seguro y a la autoridad municipal para activar ayudas.",
    ],
    noHagas: [
      "No cruces a pie ni en coche una calzada anegada: «date la vuelta», no «pasa deprisa».",
      "No bebas ni cocines con agua del grifo hasta que digan que es apta.",
      "No retires escombros ni limpies sola o solo una bodega: hay riesgo eléctrico y de desplome.",
    ],
    inclusion:
      "La evacuación de una inundación es vertical y rápida: para sillas de ruedas, camas articuladas y personas encamadas hace falta decidir antes qué edificio tiene planta baja segura y quién ayuda a subir. Guarda la medicación crítica en la bolsa, no en el baño del piso bajo.",
    fuente: "Ready.gov (FEMA) · «Floods»; IFRC · agua, saneamiento e higiene en inundaciones",
  },
  {
    id: "deslizamiento",
    nombre: "Deslizamiento de terreno",
    peligro: "deslizamiento",
    lema: "El terreno avisa días antes con grietas: saber mirar es el 90 %.",
    antes: [
      "Aprende a reconocer las señales: grietas nuevas en muros y soleras, puertas que dejan de cerrar, árboles y postes que se ladean.",
      "Pon un testigo (una tira de papel o cinta con fecha) sobre la grieta y mídela una vez por semana; si se rompe, algo se está moviendo.",
      "No dejes que una tubería, un canalón o un pozo séptico se filtren al talud: el agua es lo que desencadena el deslizamiento.",
      "Nunca cortes el pie de una ladera para ganar plaza, y no construyas ni duermas en el cono de un barranco.",
    ],
    durante: [
      "Si ves oyes el movimiento (crugido de árboles, tierra que corre), muévete PERPENDICULAR a la dirección del flujo, no intentes huir ladera abajo o corriendo delante.",
      "Si estás dentro, sal y aléjate; si no puedes salir, agrégate en un rincón de un muro firme, cúbrete la cabeza y aprieta los dientes.",
      "Si el terreno se agrieta bajo tus pies, arrástrate hacia atrás y busca el borde estable más cercano.",
      "Si vas en coche por una carretera de montaña con ladera encima y llueve fuerte, no te detengas bajo el talud: sigue hasta un tramo despejado.",
    ],
    despues: [
      "El terreno sigue cediendo: quédate fuera de la zona hasta que un técnico lo revise y no hay llovido más.",
      "Revisa el agua potable: un deslizamiento contamina pozos y cambia manantiales; hazla analizar antes de beberla.",
      "Informa a la autoridad del movimiento con fotos y la fecha de las primeras grietas: activa la vigilancia geotécnica.",
      "Si vuelves a la vivienda, espera la inspección estructural y documenta todo el daño antes de mover escombros.",
    ],
    noHagas: [
      "No vuelvas de noche a recoger cosas: sin luz no ves la grieta nueva.",
      "No tires tierra del talud «para nivelar» sin cálculo: eso quita el contrapeso.",
      "No ignores la grieta pequeña «porque siempre hubo alguna».",
    ],
    inclusion:
      "Quien no puede oír el ruido del terreno o no puede desplazarse rápido necesita una red de vecinos con un turno de vigilancia en las noches de lluvia fuerte y una salida acordada antes del episodio, no durante.",
    fuente: "Ready.gov (FEMA) · «Landslides and Mudslides»; servicios geológicos nacionales",
  },
  {
    id: "volcan",
    nombre: "Erupción volcánica",
    peligro: "volcan",
    lema: "Lo que llega a tu pueblo puede ser ceniza, no lava.",
    antes: [
      "Aprende qué nivel de alerta tiene tu volcán y quién lo cambia (el observatorio nacional); ten un radio o canal oficial que funcione con pilas.",
      "Guarda respiradores con certificación y gafas cerradas, y planifica cómo tapar depósitos de agua y tomas de aire.",
      "Ten listos cepillo de cerdas duras, lona y palas para retirar ceniza de cubiertas ligeras con seguridad.",
      "Conoce la ruta de evacuación y, sobre todo, los valles por donde bajarían los lahares: no son la ladera, son las vaguadas.",
    ],
    durante: [
      "Si la orden es evacuar, vete: los flujos piroclásticos no se esquivan, no se corren y no se apagan.",
      "Si cae ceniza y puedes seguir en casa, quédate dentro con ventanas y puertas cerradas y la ventilación al mínimo.",
      "Protégete ojos y vías respiratorias al salir; cubre la boca y la nariz con el respirador, no con un paño.",
      "No conduzcas con ceniza: resbala como hielo, tapa filtros y arruina frenos; si es obligatorio circular, muy despacio y con luz.",
      "Si la lluvia se junta con la ceniza recién caída, aléjate de los cauces: es la receta del lahar.",
    ],
    despues: [
      "Barre la ceniza del tejado antes de que se moje y con la protección puesta; no la eches a la calle: va al sumidero y lo tapa.",
      "Lava alimentos del huerto con abundante agua y pela los que estuvieron a la intemperie; tira los que estaban abiertos.",
      "Revisa animales y apriscos: la ceniza quema pastos y contamina abrevaderos.",
      "No entres en casas con ceniza acumulada en el techo sin una revisión estructural.",
      "Sigue el aviso oficial sobre cuándo el aire y el agua vuelven a ser seguros.",
    ],
    noHagas: [
      "No uses gafas de sol en vez de gafas cerradas: la ceniza raya la córnea.",
      "No soples la ceniza de los ojos: lava con agua limpia y abundante.",
      "No des por bueno el agua del pozo porque «se ve clara».",
    ],
    inclusion:
      "La ceniza castiga a quien tiene EPOC, asma o cardiopatía: hace falta un refugio interior con aire filtrado y medicación de rescate a la mano. Personas ciegas: la ceniza reduce el tacto y el sonido ambiente, que son su orientación; alguien debe guiarles y describir la ruta.",
    fuente: "OMS · salud y ceniza volcánica; UNDRR · riesgo volcánico; observatorios nacionales",
  },
  {
    id: "incendio-forestal",
    nombre: "Incendio forestal cerca de casa",
    peligro: "incendio-forestal",
    lema: "Si hay que irse, la decisión se toma con horas de antelación, no con humo encima.",
    antes: [
      "Crea espacio defendible: suelo limpio y sin matorral pegado a los muros, ramas bajadas, madera y basura almacenadas lejos de la fachada.",
      "Limpia tejado y canalones de pinocha y retira hojas secas de debajo de la terraza: es la mecha más habitual.",
      "Prepara dos salidas distintas por si el fuego corta una, y comprueba de día el tiempo que tardas en recorrerlas.",
      "Riega el entorno de la casa el día de riesgo extremo, llena bidones y deja mangueras conectadas, y ten ropa de algodón de manga larga y zapatos cerrados.",
    ],
    durante: [
      "Si te dan una orden de evacuación, vete ya. Si solo es una advertencia, vete igualmente si ves humo, braseros o el fuego cambia de dirección.",
      "Cierra todo al salir si te quedas: ventanas, puertas, tragaluces y ventilación; deja la luz encendida para ser visible en el humo.",
      "Si te sorprende fuera, conduciendo: ponte el cinturón, cierra ventanillas, pon la ventilación en recirculación y avanza hacia zona ya quemada o terreno sin combustible; no intentes cruzar el frente.",
      "Si no hay escapatoria, entra en un edificio sólido, o en su defecto en agua, tierra desnuda o zona ya calcinada; cúbrete con lana o algodón y protege la respiración.",
      "Con ropa de algodón, no sintética: el plástico se funde con el calor radiante.",
    ],
    despues: [
      "Vuelve solo con el aviso oficial de que el fuego está controlado: las brasas siguen vivas bajo el suelo horas y días después.",
      "Camina el perímetro con zapatos gruesos, revisa el tejado y el bajo de la terraza, y riega lo que humee.",
      "Ventila la casa, tira alimentos expuestos al humo y lava todo lo que quedó cubierto de ceniza; no bebas agua de depósitos abiertos.",
      "Reclama una revisión eléctrica si entró agua en el cuadro o el fuego quemó cableado exterior.",
      "No entres en estructuras quemadas: un piso o una cubierta carbonizada cede sin aviso.",
    ],
    noHagas: [
      "No te quedes «a defender la casa» contra la indicación de la autoridad: el fuego cambia con el viento en minutos.",
      "No uses el coche por una pista llena de humo y ramas caídas: el punto de giro no se ve.",
      "No barras en seco ni limpies la ceniza sin mascarilla.",
    ],
    inclusion:
      "El aire con humo es especialmente peligroso para niños, embarazadas, asmáticos y cardiacos: necesita una sala con aire filtrado y medicación. Personas sordas: el aviso en el móvil, una alarma visual y un vecino designado valen más que una sirena que no oyen.",
    fuente: "Ready.gov (FEMA) · «Wildfires»; IFRC · fuego, comunidad y salud respiratoria",
  },
  {
    id: "calor",
    nombre: "Calor extremo",
    peligro: "calor",
    lema: "El calor mata en el salón, no en la playa.",
    antes: [
      "Identifica la habitación más fresca de la casa (la orientada al norte, en la planta baja) y deja ahí la cama si la vivienda se calienta.",
      "Consigue contraventanas, estores reflectantes o persianas que cierren el sol de la tarde; ventila de noche y cierra de día.",
      "Ten agua en cantidad, una botella reutilizable para cada miembro y frutas y verduras con agua; reduce alcohol, cafeína y comidas muy copiosas.",
      "Apunta en la nevera los medicamentos que se estropean con calor y localiza en el prospecto su límite de temperatura.",
      "Haz una lista de las tres personas de tu entorno que pasan el calor solas y decide a qué hora les llamas o les vas a ver.",
    ],
    durante: [
      "Nada de ejercicio ni trabajo duro en las horas centrales; si es obligatorio, a la sombra, con paños húmedos y agua cada poco tiempo.",
      "Ducha o baño tibio varias veces al día, y paños fríos en cuello, axilas e ingles; la ropa suelta, clara y de algodón.",
      "Nunca dejes a un niño, una persona mayor ni un animal en un vehículo aparcado, ni «cinco minutos» con la ventana abierta.",
      "No salgas a la calle los días de aviso rojo si puedes evitarlo; si tienes que salir, sombrero, gafas y sombra activa.",
      "Reconoce el golpe de calor: confusión, piel muy caliente, desmayo, vómitos. Es una urgencia: llama a emergencias y enfría a la persona mientras tanto.",
    ],
    despues: [
      "Sigue con la hidratación y con las visitas el día después del pico: la deshidratación se nota tarde, sobre todo en mayores.",
      "Revisa la medicación que se guardó a más temperatura de lo que admite y pregúntale a la farmacia si sigue siendo válida.",
      "Duérmete tarde: la vivienda acumula calor y la primera noche tras el pico suele ser la peor.",
      "Anota qué día se te estropearon las cosas (comida, medicamentos, batería) y prepárate para el siguiente episodio.",
    ],
    noHagas: [
      "No tomes pastillas de sal sin indicación: pueden ser peligrosas con hipertensión o problemas renales.",
      "No bebas litros de golpe: se bebe poco y a menudo.",
      "No confíes en el ventilador en una casa saturada de calor si no hay forma de sacar el aire caliente.",
    ],
    inclusion:
      "Muchas personas mayores no perciben la sed ni el calor por la medicación o por el deterioro cognitivo; el plan tiene que ser de la red vecinal, no de la persona. Quien toma antipsicóticos, betabloqueantes o antihistamínicos tiene más riesgo: pregúntale al médico en la revisión de primavera.",
    fuente: "OMS · calor y salud; servicios meteorológicos nacionales · avisos por calor",
  },
  {
    id: "frio",
    nombre: "Frío extremo y nieve",
    peligro: "frio",
    lema: "Una casa sin luz en enero es un problema de salud, no de comodidad.",
    antes: [
      "Aísla lo barato y eficaz: burletes en puertas, plástico en las ventanas que filtran, mantas y ropa de abrigo seca en la habitación que se use.",
      "Protege tuberías y contadores con aislante; deja un hilo de agua en la noche más dura y conoce la llave de paso general.",
      "Ten un depósito de combustible o leña seca para varios días, y un calentador de emergencia que sí sea seguro para interiores (o ninguno: nunca brasas dentro).",
      "Prepara linternas, baterías cargadas, radio a pilas, velas con soporte y un botiquín sin que se congele.",
      "Calcula la reserva de comida caliente sin electricidad y la medicación que necesita frío o que no se puede congelar.",
    ],
    durante: [
      "Calienta una sola habitación y cierra las demás; abrígate en capas, come algo caliente y bebe agua aunque no apetezca.",
      "Ventila un rato cada día aunque haga frío: la condensación de la calefacción y la cocina llena la casa de humedad y moho.",
      "Si usas grupo electrógeno, brasero de obra o barbacoa, siempre fuera de la vivienda y lejos de ventanas abiertas.",
      "No andes por la nieve profunda si tienes cardiopatía: el esfuerzo de palear nieve es un disparador clásico de infarto.",
      "En el coche, quédate con él si la ventisca te sorprende, señalízalo, arranca el motor por ratos con la ventanilla abierta y despeja el tubo de escape antes.",
    ],
    despues: [
      "Cuidado con el hielo negro en escaleras y aceras: es la lesión más frecuente de estos episodios; usa sal, arena o ceniza y camina como un pingüino.",
      "Revisa el techo de nieve: la acumulación húmeda puede vencer una cubierta; quítala desde arriba con seguridad o desde dentro sin forzar.",
      "Seca la casa si hubo filtraciones por nieve derretida: el moho aparece a los dos días.",
      "Comprueba que los tubos aguantaron: abre todos los grifos y busca humedad en el suelo bajo muebles y contadores.",
      "Llama o visita a quien vive solo antes de que él te llame: la hipotermia quita la fuerza para pedir ayuda.",
    ],
    noHagas: [
      "No cierres la casa herméticamente con un brasero dentro: monóxido de carbono.",
      "No entres en una casa muy fría y la calientes de golpe con un fuego grande sin chimenea limpia.",
      "No bebas alcohol para entrar en calor.",
    ],
    inclusion:
      "El frío extremo corta la movilidad y las aceras heladas son una barrera para sillas de ruedas, andadores y personas mayores: decide con la comunidad quién palia y quién limpia la rampa. Quien depende de una bombona de oxígeno no puede usar brasas: cualquier plan de calor debe excluir la combustión en su dormitorio.",
    fuente: "Ready.gov (FEMA) · «Cold weather»; OMS · frío y salud pública",
  },
  {
    id: "tornado",
    nombre: "Tornado y tormenta violenta",
    peligro: "tornado",
    lema: "Minutos, no horas: el refugio se decide antes de ver el embudo.",
    antes: [
      "Elige el refugio: el nivel más bajo, la habitación más interior, sin ventanas. Prepara ahí cascos, calzado cerrado, agua, linterna, radio y una manta.",
      "Guarda en el refugio la medicación, gafas de repuesto, documentos y una tarjeta con alergias y números de contacto.",
      "Aprende la diferencia entre vigilancia («puede formar») y aviso («está formado o lo ve el radar»): con aviso, al refugio.",
      "Retira o ancla lo que está en el jardín: el granizo y el viento convierten macetas y muebles en proyectiles.",
      "Ten un plan para quien está en casa móvil o caravana: no es un refugio; define la casa de un vecino o el edificio comunitario.",
    ],
    durante: [
      "Vete al refugio con el calzado puesto y el casco; cúbrete el cuerpo con manta o abrigo grueso y agáchate mirando hacia el muro.",
      "Si estás en un coche, no intentes adelantar al tornado ni esconderte en un paso elevado: busca un edificio sólido; si no hay, baja, aléjate del vehículo y túmbate en un hueco del terreno cubriéndote la cabeza.",
      "Si el edificio empieza a fallar, protégete la cabeza con los brazos y la ropa; la mayoría de las lesiones son por impacto de objetos.",
      "Aléjate de ventanas y tragaluces; la presión no «revienta» la casa, pero los cristales sí hieren.",
      "Si vas en autobús, tren o en un lugar público, sigue la indicación del personal y muévete al punto interior más bajo.",
    ],
    despues: [
      "Sal con zapatos gruesos y guantes; hay vidrio, clavos y cables. Mira arriba antes de caminar.",
      "No entres en un edificio con la estructura tocada o con techo caído sin la inspección de los servicios de emergencia.",
      "Reporta fugas de gas y cables caídos; no enciendas nada si huele a gas.",
      "Usa la línea de emergencia solo para lo que ponga en riesgo una vida; avisa a tu familia por SMS o mensaje de datos.",
      "Haz fotos de todo el daño antes de recoger y guarda los recibos de lo que tires: es lo que se puede reclamar después.",
    ],
    noHagas: [
      "No te pongas a abrir ventanas para «igualar la presión».",
      "No te quedes grabando desde la ventana: es el punto más expuesto de la casa.",
      "No vuelvas al coche a por la bolsa; el vehículo es el peor lugar.",
    ],
    inclusion:
      "Quien no oye la sirena necesita una alarma con luz y vibración y un aviso directo por mensaje; quien no puede moverse rápido necesita que el refugio esté en su propia planta y una persona designada. Explica el plan a los niños con autismo con fotos del refugio, para que no lo asocie con un juego.",
    fuente: "Ready.gov (FEMA) · «Tornadoes»; NWS · vigilancia y aviso de tornado",
  },
  {
    id: "sequia",
    nombre: "Sequía",
    peligro: "sequia",
    lema: "El agua se ahorra antes de que te lo manden: así duele menos.",
    antes: [
      "Repara goteos y cisternas que pierden: una fuga pequeña en un barrio es un caudal. Un grifo que gotea tira cientos de litros al mes.",
      "Cambia el jardín por especies adaptadas al clima local, riega al amanecer o al anochecer y usa riego por goteo; el césped decorativo es el primer gasto prescindible.",
      "Instala captación de agua de lluvia para el riego y la limpieza, aunque sea con un bidón bajo el canalón.",
      "Agrupa en tu comunidad un listado de puntos de agua compartidos y de familias con dependientes que necesitan el suministro garantizado.",
      "Si vives de la tierra, planifica la campaña con cultivos y variedades de menor consumo y seguro agrario, y busca el apoyo público de la administración antes de la emergencia.",
    ],
    durante: [
      "Cumple las restricciones de la autoridad de cuenca: suelen ser por tramos de consumo y por horas de riego, no por capricho.",
      "Reutiliza: el agua de lavar verduras o de la ducha mientras espera la caliente va al inodoro o a las macetas.",
      "Ducha corta, lavadora y lavavajillas llenos, grifo cerrado al fregar y al cepillarse.",
      "No laves el coche ni las aceras con manguera: cubo y agua reutilizada.",
      "Guarda agua potable embotellada o en depósito limpio para bebida y cocina, especialmente si tu zona tiene cortes programados.",
    ],
    despues: [
      "No vuelvas al riego en cuanto llueve dos días: la tierra agrietada no absorbe y se pierde agua por escorrentía; riega poco y hondo.",
      "Revisa la red de tu casa: los movimientos de terreno por sequía rajan tuberías y juntas. Un consumo nocturno inesperado es fuga.",
      "Si el agua del grifo cambió de color o sabor tras la recuperación, pide el análisis y deja correr hasta que salga limpia.",
      "Cuenta lo que cambiaste (medidor en mano): saber cuánto bajaste es la prueba de que el ahorro funcionó.",
      "Si eres comunidad de regantes, pide ayuda técnica para el plan de sequía: los planes bien hechos se negocian mejor con la administración.",
    ],
    noHagas: [
      "No saques agua de un pozo no declarado ni de un cauce protegido: además del daño, hay sanción.",
      "No almacenes agua potable en bidones de productos químicos.",
      "No des por seguro que «el año que viene llueve».",
    ],
    inclusion:
      "El riego a mano y el acarreo de agua (todavía real en muchas zonas rurales) recae sobre mujeres, niñas y personas mayores: una sequía sin reparto comunitario aumenta el abandono escolar. Las cisternas y los puntos de agua compartida se planifican con horarios y accesos seguros.",
    fuente: "UNDRR · riesgo de sequía; OMS · agua y saneamiento en crisis prolongadas",
  },
  {
    id: "aire",
    nombre: "Aire sucio y humo",
    peligro: "aire",
    lema: "El aire malo no se ve: se lee en el índice y se respira igual.",
    antes: [
      "Aprende dónde mira tu país el índice de calidad del aire y qué significa cada tramo, para no depender de una app cualquiera.",
      "Ten un respirador con certificación (N95/FFP2/P2) por persona, probado que ajuste bien a la cara; la mascarilla quirúrgica no filtra partículas finas.",
      "Prevé una «sala limpia» en casa: la habitación con menos ventanas al tráfico, un filtro de aire doméstico y la puerta que cierra.",
      "Revisa el asma y la medicación respiratoria con tu médico antes de la temporada de humo o de polen alto.",
      "Sella o mejora la ventilación de tu vivienda: un filtro en la entrada de aire vale más que cerrarla del todo.",
    ],
    durante: [
      "Cierra ventanas y ventilación mecánica que introduzca aire exterior; no ventiles durante el episodio, hazlo en las horas de mejor aire.",
      "Reduce el esfuerzo: nada de deporte al aire libre ni cortar leña o barrer en seco en casa; el ejercicio multiplica el aire que entra.",
      "Usa el respirador al salir y sigue las indicaciones de la autoridad sobre desplazamientos.",
      "No quemes nada, ni residuos, ni velas, ni incienso, ni madera en una estufa mal mantenida: estás añadiendo lo mismo que respiras.",
      "Si necesitas aire en el coche, pon recirculación y mantén el filtro del habitáculo cambiado.",
    ],
    despues: [
      "Ventila a fondo cuando el índice baje, limpia superficies con paño húmedo y cambia el filtro del hogar y del coche.",
      "Lava la ropa que estuvo tendida fuera y limpia los juguetes y los pomos que quedaron con polvo.",
      "Si aparece tos persistente, pitos o dolor en el pecho, consulta; en cardiópatas y asmáticos, no esperes al final del episodio.",
      "Registra los días malos de tu barrio: la evidencia vecinal (fechas, olores, síntomas) es lo que mueve una medición oficial.",
      "Si el episodio fue por una quema, denúncialo por el cauce municipal: la prevención del siguiente es la medida más barata.",
    ],
    noHagas: [
      "No uses el ventilador de techo para «mover» el aire cargado: levanta partículas del suelo.",
      "No confíes en plantas de interior como depuradoras: no dan la talla en un episodio real.",
      "No salgas con un paño mojado creyendo que es un respirador.",
    ],
    inclusion:
      "Las partículas finas afectan antes a niños, embarazadas, mayores y personas con enfermedad cardiopulmonar, y a quienes trabajan fuera (construcción, campo, reparto): necesita agua, sombra y derecho a pausar. Los centros escolares deberían cerrar el patio y activar la sala limpia por índice, no por lo que se vea.",
    fuente: "OMS · directrices mundiales de la calidad del aire; redes regionales de medición",
  },
];

export const GUIA_POR_ID: Record<string, GuiaEmergencia> = Object.fromEntries(
  GUIAS.map((g) => [g.id, g]),
);

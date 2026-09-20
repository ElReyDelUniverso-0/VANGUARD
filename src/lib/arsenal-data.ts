// VANGUARD v26 — ARMERÍA REAL: dataset educativo de las armas que definen
// los conflictos actuales. Fotos REALES de Wikimedia Commons (licencia libre,
// atribución del autor visible en la URL de origen). Función, ficha técnica,
// impacto documentado y armado pieza por pieza — sin polígonos, como pidió
// la comunidad. Los estudiantes de VANGUARD también pueden subir las suyas
// desde el ESTUDIO COMUNITARIO.

export interface AssemblyStep {
  pieza: string;
  desc: string;
}

export interface ArsenalWeapon {
  id: string;
  short: string; // nombre corto para el selector
  name: string;
  origin: string;
  era: string;
  photo: string; // foto real (Wikimedia)
  photoH?: number; // alto fijo opcional
  assemblyPhoto?: string; // foto del despiece
  function: string; // qué hace en los conflictos
  impact: string; // por qué importa (con datos)
  specs: Record<string, string>;
  assembly: AssemblyStep[];
}

export const ARSENAL: ArsenalWeapon[] = [
  {
    id: "ak47",
    short: "AK-47",
    name: "AK-47 (Kalashnikov)",
    origin: "URSS",
    era: "1947 · presente",
    photo: "https://upload.wikimedia.org/wikipedia/commons/6/65/AK-47_type_II_noBG.png",
    assemblyPhoto: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/30/AK-47_Disassembled.JPG/960px-AK-47_Disassembled.JPG",
    function:
      "Rifle de asalto automático de 7,62×39 mm: el fusil de infantería básico de decenas de ejércitos y grupos irregulares. Dispara 600 balas por minuto en automático, funciona metido en barro, arena o agua gracias a tolerancias holgadas entre piezas, y por eso domina las trincheras del Sahel, Afganistán y el Congo tanto como los ejércitos regulares.",
    impact:
      "Es el arma de fuego más fabricada de la historia: entre 75 y 100 millones de unidades. Aparece en el escudo de Mozambique y en la bandera de Hezbolá. Su fiabilidad la convirtió en símbolo de insurgencias desde 1950: barata, mantenible en cualquier taller y letal a 300 metros.",
    specs: {
      origen: "URSS (Kalashnikov, 1947)",
      calibre: "7,62 × 39 mm",
      peso: "4,3 kg cargado",
      alcance: "~350 m efectivo",
      cadencia: "600 disparos/min",
      usuarios: "+50 países, milicias",
    },
    assembly: [
      { pieza: "Receptor", desc: "El corazón de acero estampado: aloja el cerrojo, el gatillo y todas las piezas móviles. Todo el arma se ensambla sobre él." },
      { pieza: "Cañón", desc: "Tubo de acero de 415 mm con 4 estrías helicoidales que giran la bala para estabilizarla. Se roscado o fijado por prensa al receptor." },
      { pieza: "Pistón de gases", desc: "Sobre el cañón: los gases del disparo empujan este pistón que carga hacia atrás el cerrojo — el autorecargado clásico AK." },
      { pieza: "Cerrojo portacierre", desc: "Bloque pesado que extrae el casquillo gastado, alimenta la bala nueva del cargador y la introduce en la recámara." },
      { pieza: "Muelle recuperador", desc: "Devuelve el cerrojo a su posición tras cada disparo; su tensión define la cadencia." },
      { pieza: "Cargador curvo", desc: "30 balas en peine curvado: la curva acompaña la forma cónica del casquillo soviético 7,62 para no atascarse." },
      { pieza: "Culata y guardamanos", desc: "Madera originalmente (hoy poliamida): protegen las manos del calor del cañón y absorben el retroceso contra el hombro." },
      { pieza: "Selector de fuego", desc: "La gran palanca lateral: seguro → semi → automático. Simple y gruesa para operarla con guantes en invierno." },
    ],
  },
  {
    id: "m4",
    short: "M4",
    name: "M4 Carbine",
    origin: "EE.UU.",
    era: "1994 · presente",
    photo: "https://upload.wikimedia.org/wikipedia/commons/6/68/PEO_M4_Carbine_RAS_M68_CCO.png",
    assemblyPhoto: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1d/U.S._Air_Force_Staff_Sgt._Julius_Taylor%2C_a_combat_arms_training_and_maintenance_instructor_with_the_628th_Security_Forces_Squadron%2C_disassembles_an_M4_carbine_July_30%2C_2013%2C_at_Joint_Base_Charleston%2C_S.C_130730-F-LR006-010.jpg/960px-thumbnail.jpg",
    function:
      "Carabina estándar de la OTAN en 5,56×45 mm: la del soldado occidental moderno. Es la versión corta del M16 con riel superior PICATINNY que acepta mira telescópica, láser, linterna y lanzagranadas M203. Modular: cada unidad se adapta a la misión en minutos.",
    impact:
      "Más de 500.000 unidades solo en el ejército de EE.UU. El riel picatinny (estándar abierto y gratuito) cambió la industria: cualquier accesorio de cualquier país encaja. Su munición 5,56 es la estándar de todos los aliados de la OTAN.",
    specs: {
      origen: "EE.UU. (Colt, 1994)",
      calibre: "5,56 × 45 mm OTAN",
      peso: "3,4 kg cargado",
      alcance: "~500 m efectivo",
      cadencia: "700-950 disparos/min",
      usuarios: "OTAN y aliados",
    },
    assembly: [
      { pieza: "Upper receiver", desc: "Mitad superior de aluminio forjado: contiene el cañón, el cerrojo y el riel superior de accesorios." },
      { pieza: "Lower receiver", desc: "Mitad inferior: el arma legal es 'esto' — aloja gatillo, cargador, culata plegable y la palanca selectora." },
      { pieza: "Buffer tube", desc: "Tubo trasero con muelle y masa amortiguadora que frena el retroceso del cerrojo y sostiene la culata telescópica." },
      { pieza: "Bolt carrier group (BCG)", desc: "El conjunto cerrojo+portacierre giratorio: 7 piezas de precisión que hacen todo el trabajo de recarga en 50 ms." },
      { pieza: "Cañón y bloque de gas", desc: "El sistema DI (direct impingement): los gases vuelven por un tubo fino y empujan directamente el cerrojo." },
      { pieza: "Cargador STANAG", desc: "30 balas en aluminio o polímero, el estándar OTAN compartido por FAMAS, SA80, AUG y todos los fusiles aliados." },
      { pieza: "Riel PICATINNY", desc: "Ranuras cruzadas universales: mira, apuntador rojo, infrarrojo… se cambia de configuración en menos de un minuto." },
      { pieza: "Guardamanos flotante", desc: "No toca el cañón: la precisión no se degrada por el calor de la mano. Con rieles M-LOK en las versiones nuevas." },
    ],
  },
  {
    id: "fpv",
    short: "Dron FPV",
    name: "Dron FPV Kamikaze",
    origin: "Global (bricolaje)",
    era: "2022 · presente",
    photo: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/30/REN_6515.jpg/3840px-REN_6515.jpg",
    assemblyPhoto: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fe/Remote_Control_FPV_drone_FPV_Goggles.jpg/960px-Remote_Control_FPV_drone_FPV_Goggles.jpg",
    function:
      "Cuadricóptero de carreras de 200-800 dólares con 1-3 kg de explosivo: el arma que redefinió Ucrania. Un piloto con gafas VR lo vuela a 120-160 km/h entre árboles y edificios hasta embestir tanques, búnkeres o motos. Funciona como munición guiada artesanal cuesta 1/10.000 del misil equivalente.",
    impact:
      "Se estima que los FPV causan el 60-70% de las bajas de blindados en el frente ucraniano. Cada bando produce cientos de miles al año. Es el mayor cambio táctico desde la ametralladora: ningún tanque hoy avanza sin 'jaula anti-dron' (cope cage).",
    specs: {
      origen: "Artesanal (kits RC)",
      carga: "1-3 kg explosivo (RPG, PG-7)",
      velocidad: "120-160 km/h",
      alcance: "5-20 km (fibra óptica: 20+)",
      coste: "200-800 USD por unidad",
      usuarios: "Ambos bandos, Ucrania/Rusia",
    },
    assembly: [
      { pieza: "Chasis / frame", desc: "Placa de fibra de carbono en X donde se montan los 4 motores. Ligero y rígido para resistir aceleraciones de 10G." },
      { pieza: "4 motores brushless", desc: "Motores eléctricos sin escobillas de 2207-2306: giran 30.000 rpm y consumen la batería en 5-10 minutos de vuelo." },
      { pieza: "Hélices (props)", desc: "5 pulgadas normalmente: las de punta redonda dan velocidad, las de tripala empuje extra para cargar explosivo." },
      { pieza: "ESC + PDB", desc: "Reguladores electrónicos que traducen las órdenes del piloto en giros precisos de cada motor, 4 placas o integradas." },
      { pieza: "Batería LiPo 6S", desc: "22 voltios de descarga brutal: es el 40% del peso. En frío pierde potencia — por eso los vuelos de invierno son cortos." },
      { pieza: "Cámara + emisor de video", desc: "Envía la imagen en vivo al piloto (analógica 5,8 GHz o digital). Los nuevos usan CABLE de fibra óptica: imposible de interferir." },
      { pieza: "Gafas VR del piloto", desc: "El piloto 'vuela dentro' del dron: solo ve lo que ve la cámara. Por eso un buen piloto de carreras es un artillero de élite." },
      { pieza: "Ojiva", desc: "Granada RPG-7 (PG-7) o plástico C4: al impactar, la carga hueco perfora incluso el blindaje superior del tanque." },
    ],
  },
  {
    id: "shahed",
    short: "Shahed-136",
    name: "Shahed-136 (Geran-2)",
    origin: "Irán",
    era: "2021 · presente",
    photo: "https://upload.wikimedia.org/wikipedia/commons/3/37/2023_IRGC_Aerospace_Force_achievements_Exhibition_in_Qom_%2833%29.jpg",
    function:
      "Dron kamikaze de largo alcance con motor pulsorreactor (ese zumbido de motocicleta que se oye en Kiev). Vuela hacia coordenadas fijas cargadas antes del despegue y se estrella con 40-50 kg de explosivo. Rusia los lanza en enjambres de 10-80 para saturar las defensas antiaéreas, junto a misiles de crucero reales.",
    impact:
      "Cuesta ~20.000-50.000 USD; el misil antiaéreo que lo derriba cuesta ~500.000-1M: la aritmética es devastadora. Ucrania recibe oleadas nocturnas de decenas de 'Geranes' desde 2022 y ha desarrollado interceptores ligeros y ametralladoras móviles solo para ellos.",
    specs: {
      origen: "Irán (HESA, 2021)",
      carga: "40-50 kg explosivo",
      alcance: "~2.500 km declarado",
      velocidad: "185 km/h crucero",
      coste: "20-50.000 USD",
      usuarios: "Rusia (Geran-2), Irán",
    },
    assembly: [
      { pieza: "Alas delta de delta", desc: "Alas en triángulo de fibra: es TODO el aeroplano. Sin cola, estabiliza con elevones mixtos en el borde de fuga." },
      { pieza: "Motor pulsorreactor MD-550", desc: "Sin hélices ni turbina compleja: una tubería que enciende explosiones rítmicas. Barato, ruidoso, imposible de mejorar... y su zumbido es la alarma de la población." },
      { pieza: "Catapulta de lanzamiento", desc: "No despega solo: un riel acelerado o camión lo lanza al aire. Por eso se montan en rampas de 4 en 4 en el frente." },
      { pieza: "Navegación INS + GPS", desc: "Vuela solo a coordenadas fijas: no tiene cámara ni operador. Los rusos le añadieron antenas CRPA para resistir el GPS jamming ucraniano." },
      { pieza: "Ojiva frontal", desc: "40-50 kg de explosivo de fragmentación: no destruye torres, sí tejados, subestaciones y ventanas de un bloque entero. Terror nocturno." },
      { pieza: "Tanque de combustible", desc: "Central, de combustible de aviación: define los 2.500 km de alcance. A veces los derribados caen con el tanque medio vacío — vuelos de descarte." },
    ],
  },
  {
    id: "bayraktar",
    short: "TB2",
    name: "Bayraktar TB2",
    origin: "Turquía",
    era: "2014 · presente",
    photo: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Bayraktar_TB2_Runway.jpg",
    assemblyPhoto: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/Bayraktar_TB2_Runway.jpg/960px-Bayraktar_TB2_Runway.jpg",
    function:
      "Dron de vigilancia y ataque que vuela a 8.000 m durante 27 horas: ojos y garra de ejércitos que no pueden pagar cazas. Detecta artillería y convoyes con su cámara térmica y los destruye con 4 misiles MAM guiados por láser. Famoso por Nagorno-Karabaj 2020 (destruyó 100+ blindados armenios) y la defensa de Ucrania 2022.",
    impact:
      "Revolucionó el equilibrio: un país pequeño con 20 TB2 neutraliza columnas blindadas. Su canción viral ucraniana ('Bayraktar, Bayraktar') se hizo en días. Turquía lo exportó a 30+ países y cambió la geopolítica de los drones.",
    specs: {
      origen: "Turquía (Baykar, 2014)",
      techo: "8.230 m",
      autonomía: "27 horas de vuelo",
      carga: "4 misiles MAM-L (150 kg)",
      alcance: "300 km desde estación",
      usuarios: "30+ países",
    },
    assembly: [
      { pieza: "Ala alta y fuselaje", desc: "Ala de 12 m de envergadura y fuselaje de fibra: el perfil es de planeador — por eso vuela tantas horas con un motor de 100 CV." },
      { pieza: "Motor Rotax de pistón", desc: "Un motor de avioneta civil (100 CV) con hélice de empuje: barato, mantenible, sin tecnología prohibida — la clave de sus exportaciones." },
      { pieza: "Torreta electroóptica", desc: "Bajo el morro: cámara diurna, térmica y telémetro láser giratoria 360°. Es el 'ojo' con el que el operador clasifica objetivos a 8 km de altura." },
      { pieza: "Bodega de misiles MAM", desc: "4 puntos duros bajo las alas: MAM-C (22 kg) y MAM-L (63 kg) guiados por láser/inerciales, con precisión de metro." },
      { pieza: "Enlace satelital", desc: "Antena que permite controlarlo a cientos de km: el piloto y el operador de armas están en una estación en tierra, no cerca del frente." },
      { pieza: "Tren de aterrizaje", desc: "Delantero retráctil: despega de pista convencional — no necesita catapulta ni paracaídas como otros drones." },
    ],
  },
  {
    id: "javelin",
    short: "Javelin",
    name: "FGM-148 Javelin",
    origin: "EE.UU.",
    era: "1996 · presente",
    photo: "https://upload.wikimedia.org/wikipedia/commons/7/76/Javelin_with_checkout_equipment.jpg",
    function:
      "Misil antitanque 'dispara y olvida': el tirador marca el objetivo, lanza, y el misil SOLO sube 150 m y cae sobre la torre del tanque — el blindaje más débil. El CLU (mira térmica) también funciona como binocular de vigilancia nocturna. Se lanza desde el hombro agachado o desde edificios.",
    impact:
      "En Ucrania 2022, los 'Saint Javelin' detuvieron las columnas rusas hacia Kiev: ~30-40% de blindados destruidos en las primeras semanas se atribuye a ATGM. Cada unidad (misil+lanzador) cuesta ~200.000 USD, contra 3-10M del tanque que destruye.",
    specs: {
      origen: "EE.UU. (1996)",
      alcance: "2.500 m (7.500 en F-Model)",
      penetración: "600-800 mm RHA",
      guía: "Infrarrojo autoguiado",
      peso: "22,3 kg con CLU",
      usuarios: "25+ países, Ucrania",
    },
    assembly: [
      { pieza: "CLU (mira/comando)", desc: "La unidad de control: mira térmica de 4x y 12x con refrigerador. También sirve como binocular de vigilancia sin disparar nada." },
      { pieza: "Tubo lanzador", desc: "Cilindro desechable con el misil dentro y su refrigeración: se conecta al CLU, se apunta, se dispara y se tira." },
      { pieza: "Batería de enfriamiento (BCU)", desc: "Tanque de gas argón que enfría el sensor IR del misil al conectarlo: 30-45 segundos de vida antes del lanzamiento." },
      { pieza: "Misil con dos etapas", desc: "Motor de 'salida suave' (expulsa el misil sin llamas para no revelar al tirador) y motor de vuelo que arranca a 8 m de distancia." },
      { pieza: "Cabeza buscadora IR", desc: "Ve el contraste térmico del motor del tanque: memoriza el objetivo ANTES del disparo y lo persigue sola (fire-and-forget)." },
      { pieza: "Trayectoria top-attack", desc: "Software: sube en arco y cae sobre la torre. Contra búnkeres también funciona en modo 'ataque directo'." },
      { pieza: "Ojiva doble en tándem", desc: "Dos cargas: la primera detona las defensas reactivas del tanque (ERA) y la segunda perfora 600-800 mm de acero." },
    ],
  },
  {
    id: "himars",
    short: "HIMARS",
    name: "M142 HIMARS",
    origin: "EE.UU.",
    era: "2005 · presente",
    photo: "https://upload.wikimedia.org/wikipedia/commons/8/83/HIMARS_-_missile_launched.jpg",
    assemblyPhoto: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/66/180614-A-IY962-102_-_M142_High_Mobility_Artillery_Rocket_System_%28HIMARS%29_firing_during_Saber_Strike_18_%28Image_4_of_7%29.jpg/960px-180614-A-IY962-102_-_M142_High_Mobility_Artillery_Rocket_System_%28HIMARS%29_firing_during_Saber_Strike_18_%28Image_4_of_7%29.jpg",
    function:
      "Lanzacohetes sobre camión táctico: 6 cohetes GMLRS de 227 mm con precisión de 2-5 m a 80 km, o 1 misil ATACMS hasta 300 km. Dispara en 40 segundos y cambia de posición antes de que el radar enemigo calcule su origen ('shoot and scoot'). En Ucrania destruyó depósitos de municiones y puentes a 60-80 km del frente.",
    impact:
      "Desde agosto 2022 cambió la guerra logística rusa: los depósitos tuvieron que retroceder 100 km, encareciendo todo el abastecimiento. Los GMLRS con GPS guiado redujeron a casi cero las bajas civiles comparado con la artillería clásica.",
    specs: {
      origen: "EE.UU. (Lockheed, 2005)",
      munición: "6× GMLRS o 1× ATACMS",
      alcance: "80 km (300 ATACMS)",
      precisión: "2-5 m CEP (GMLRS)",
      chasis: "Camión FMTV 6x6",
      usuarios: "EE.UU., Ucrania, 10+",
    },
    assembly: [
      { pieza: "Chasis FMTV 6x6", desc: "Camión táctico estándar de serie: rodado común, mantenimiento sencillo y velocidad de 85 km/h por carretera para escapar tras el disparo." },
      { pieza: "Lanzador M142", desc: "El módulo giratorio con 6 tubos: carga completa en 5 minutos con grúa y dispara la salva entera en menos de 45 segundos." },
      { pieza: "Cohete GMLRS", desc: "227 mm con guía GPS/INS: 90 kg de explosivo que caen a 2-5 m del punto marcado. El 'cuchillo suizo' de la artillería moderna." },
      { pieza: "Misil ATACMS", desc: "Balístico de una etapa: 300 km y 230 kg de submuniciones o unidad. Solo EE.UU. decide cuántos se entregan — es política, no logística." },
      { pieza: "Sistema de fuego AFATDS", desc: "Computadora que recibe objetivos del comando, calcula soluciones y autoriza el disparo con control de fuego centralizado." },
      { pieza: "Blindaje de cabina", desc: "Placas antibalas para fragmentación: la tripulación no combate, DISPARA Y SE VA. Su defensa es la distancia, no la coraza." },
    ],
  },
  {
    id: "lancet",
    short: "Lancet",
    name: "ZALA Lancet-3",
    origin: "Rusia",
    era: "2020 · presente",
    photo: "https://upload.wikimedia.org/wikipedia/commons/8/8f/ZALA_Lancet_1.jpg",
    function:
      "Munición de patrullaje (loitering munition): vuela en círculos sobre el frente durante 40 minutos buscando artillería, radars y cañones con su cámara TV/IR, y se lanza en picada sobre el objetivo. Es la respuesta rusa al HIMARS: el 'cazador de cañones' que obliga a la artillería ucraniana a moverse cada 2 minutos.",
    impact:
      "Inició la era de la 'caza de artillería': Ucrania perdió decenas de M777 y Caesar captados en posición. Ambos bandos desarrollaron 'mallas anti-drone' sobre los cañones y detectores de aproximación — la guerra estática se volvió mortal para cualquier sistema que no se mueva.",
    specs: {
      origen: "Rusia (ZALA, 2020)",
      carga: "3-5 kg (carga hueco)",
      alcance: "40-70 km",
      patrulla: "~40 minutos",
      guía: "TV/IR + reconocimiento óptico",
      usuarios: "Rusia (imitado por ambos)",
    },
    assembly: [
      { pieza: "Fuselaje de doble ala en X", desc: "Dos alas cruzadas y dos canards: diseño compacto que cabe en un tubo de lanzamiento y gira en picada como un misil." },
      { pieza: "Motor eléctrico de hélice", desc: "Silencioso y sin calor IR fuerte: difícil de detectar por los radares acústicos. Vuela lento (110 km/h) pero reposado." },
      { pieza: "Cabeza TV/IR", desc: "Cámara esférica bajo el morro: el operador en tierra la usa como buscador; las versiones nuevas 'memorizan' el objetivo antes del picado." },
      { pieza: "Catapulta / riel", desc: "Lanzado desde rampa elástica: no necesita pista. Un pelotón lanza 3-4 en cadena contra una batería detectada." },
      { pieza: "Enlace de radio", desc: "Antena en la cola: canal de control de 40-70 km. La fibra óptica (que ya usa el FPV) no llegó aún al Lancet — son radiofrecuencia." },
      { pieza: "Ojiva de carga hueca", desc: "3-5 kg con carga dirigida: no destruye el cañón con la onda, lo PERFORA. Un impacto = pieza de artillería fuera de combate." },
    ],
  },
  {
    id: "t90",
    short: "T-90",
    name: "T-90M Proryv",
    origin: "Rusia",
    era: "1992 · presente",
    photo: "https://upload.wikimedia.org/wikipedia/commons/d/d9/T-90M.jpg",
    assemblyPhoto: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/38/T-90_firing.jpg/960px-T-90_firing.jpg",
    function:
      "Carro de combate principal ruso: 46 toneladas, cañón liso de 125 mm que también lanza misiles guiados, y blindaje compuesto Kontakt-5 en ladrillos explosivos. El sistema Shtora 'parpadea' infrarrojos para confundir los misiles enemigos. La versión M (2019) añade pantalla térmica nueva y celosía anti-dron trasera.",
    impact:
      "El tanque ruso más avanzado en Ucrania: también el más cazado por FPV y Javelin. Su fracaso relativo redefinió el blindaje moderno — hoy todo tanque nuevo sale con 'jaula cope' y contramedidas de dron. India tiene +1.000: el usuario más grande fuera de Rusia.",
    specs: {
      origen: "Rusia (Uralvagonzavod)",
      calibre: "125 mm liso + ATGM",
      peso: "46,5 toneladas",
      velocidad: "60 km/h",
      tripulación: "3 (autocargador)",
      usuarios: "Rusia, India, 5+",
    },
    assembly: [
      { pieza: "Cañón 2A46M de 125 mm", desc: "Liso (no rayado) para lanzar proyectiles APFSDS a 1.750 m/s y misiles 9M119 por el mismo tubo. Cambiable en campo en 1 hora." },
      { pieza: "Autocargador", desc: "Carrusel mecánico de 22 proyectiles listos: elimina al cargador humano (tripulación de 3). Si el carrusel es alcanzado, la torre a veces SALE VOLANDO — el 'jack-in-the-box' famoso." },
      { pieza: "Blindaje Kontakt-5", desc: "Ladrillos ERA sobre la torre: placas explosivas que detonan hacia afuera y 'comen' el chorro de la carga hueca enemiga." },
      { pieza: "Sistema Shtora-1", desc: "Dos cajas de 'focos' IR que ciegan misiles guiados por infrarrojos + lanzafumígenos automáticos cuando detecta un láser que lo apunta." },
      { pieza: "Motor V-92S2 diésel", desc: "12 cilindros en V, 1.000 CV: el mismo bloque básico del T-72. Simple, de mantenimiento rudo — y por eso sobrevive a la logística rusa." },
      { pieza: "Torre soldada con Relikt", desc: "La M nueva: torre soldada (no fundida) con paquetes Relikt de 3ª generación y celosía trasera anti-drones FPV de serie." },
    ],
  },
  {
    id: "leopard2",
    short: "Leopard 2",
    name: "Leopard 2 A6",
    origin: "Alemania",
    era: "1979 · presente",
    photo: "https://upload.wikimedia.org/wikipedia/commons/a/a7/Leopard_2_A7V_313_Bad_Frankenhausen_2024.JPG",
    function:
      "El tanque estándar de la OTAN europea: 62 toneladas, cañón liso Rheinmetall L55 de 120 mm (el mejor de su generación) y motor diésel de 1.500 CV que lo empuja a 68 km/h. Tripulación de 4 con cargador humano (más fiable que el autocargador soviético). España, Polonia, Finlandia, Grecia y 15 países más lo operan.",
    impact:
      "En Ucrania 2023, los Leopard 2A6 entregados lideraron la contraofensiva: varios perdidos ante campos minados + Lancet, demostrando que ningún tanque sobrevive hoy sin apoyo. Aun así, sigue siendo la referencia occidental: +3.500 unidades en Europa.",
    specs: {
      origen: "Alemania (KMW, 1979)",
      calibre: "120 mm liso L55",
      peso: "62 toneladas",
      velocidad: "68 km/h",
      tripulación: "4 (cargador humano)",
      usuarios: "18 países europeos",
    },
    assembly: [
      { pieza: "Cañón Rheinmetall L55", desc: "120 mm lisos de 5,3 m: dispara DM53 APFSDS que perfora +900 mm a 2 km. La referencia mundial; también lo montan los Abrams." },
      { pieza: "Motor MTU MB873", desc: "Diésel V12 biturbo de 1.500 CV: puede cambiarlo completo en 15 minutos con grúa — la filosofía alemana de mantenimiento en campo." },
      { pieza: "Transmisión Renk", desc: "4 marchas adelante y 2 atrás con giro neutro (el tanque gira sobre su eje): la maniobra 'neutral steer' que sorprende en combate urbano." },
      { pieza: "Turret con cargador humano", desc: "La torre lleva 4ª tripulación: el cargador. Más lento teóricamente que el autocargador, pero repara, vigila y no explota en cadena." },
      { pieza: "Blindaje compuesto", desc: "Sándwich de cerámica-acero (secretoBM 'Dentsche Armor'): la torre plana con flechas es su firma. Las balas huecas se fragmentan en capas." },
      { pieza: "Sistema de control de tiro", desc: "El EMES 15 con termal y telémetro: el cañón ESTABILIZADO dispara en movimiento a 40 km/h con precisión de meta. Es el 'ojos y cerebro' moderno." },
    ],
  },
  {
    id: "rpg7",
    short: "RPG-7",
    name: "RPG-7",
    origin: "URSS",
    era: "1961 · presente",
    photo: "https://upload.wikimedia.org/wikipedia/commons/3/33/RPG-7_detached.jpg",
    function:
      "El lanzagranadas más usado del planeta: tubo de 40 mm recargable que dispara granadas autopropulsadas de carga hueca contra tanques, búnkeres, helicópteros (Afghanistán, Somalia) y hoy DRONES: las jaulas 'cope cage' de los tanques rusos existen SOLO por el RPG. Un combatiente entrenado dispara 4-6 por minuto.",
    impact:
      "+9 millones fabricados en 40 países. Aparece en TODA insurgencia desde 1968: Vietcong, Afganistán, Irak, Sahel, Somalia. Cuesta ~500-2.000 USD el lanzador y ~100 la granada: la asimetría perfecta contra un tanque de 10M.",
    specs: {
      origen: "URSS (1961)",
      calibre: "40 mm (85 mm ojiva)",
      alcance: "300 m antitanque",
      penetración: "260-750 mm (PG-7VL)",
      peso: "6,3 kg con lanzador",
      usuarios: "40+ países, insurgencias",
    },
    assembly: [
      { pieza: "Tubo lanzador", desc: "Fibra de vidrio reforzada con recámara de acero: el arma completa es solo 6,3 kg y se desmonta en 2 piezas para transportarla en mochila." },
      { pieza: "Culata y empuñaduras", desc: "Dos empuñaduras de madera/poli: la trasera con el gatillo percutor, la delantera para estabilizar. Sin culata contra el hombro: el escape trasero expulsa los gases." },
      { pieza: "Mira óptica PGO-7", desc: "El 'telescopio' famoso con retícula escalonada: cada escalón corrige la caída de la granada a 100, 200, 300 m. También mira mecánica de respaldo." },
      { pieza: "Propulsor de dos etapas", desc: "La granada sale con un cartucho de 9 mm (suave, seguro en espacios pequeños) y a 10 m arranca el cohete: 120 m/s y 300 m/s en plena velocidad." },
      { pieza: "Ojiva de carga hueca", desc: "Cono de cobre que al detonar se convierte en chorro de metal a 10.000 m/s: perfora el acero 'derritiéndolo' por presión, no por calor." },
      { pieza: "Percutor de impacto", desc: "Detonación al tocar con inclinación correcta: por eso los tanques modernos llevan rejillas y jaulas — detonan el RPG a distancia de la piel del blindaje." },
    ],
  },
  {
    id: "m777",
    short: "M777",
    name: "Obús M777",
    origin: "EE.UU./Reino Unido",
    era: "2005 · presente",
    photo: "https://upload.wikimedia.org/wikipedia/commons/a/ac/M777_howitzer_rear.jpg",
    function:
      "Obús remolcado de 155 mm con estructura de TITANIO: pesa 4,2 toneladas (la mitad que su predecesor M198) y un helicóptero CH-47 lo traslada completo. Dispara 40 km con munición base-bleed y 70 km con Excalibur GPS: la artillería 'ligera pero letal' de Ucrania, donde reemplazó a la artillería soviética del ejército ucraniano.",
    impact:
      "+200 unidades entregadas a Ucrania. Su combinación con drones de corrección (Pubg-style: el dron ve la caída, el M777 corrige) creó la 'muerte por Instagram' — artillería conectada. Cada M777 con Excalibur puede destruir un punto con 1 disparo en vez de 100.",
    specs: {
      origen: "EE.UU./UK (BAE, 2005)",
      calibre: "155 mm / 39 calibres",
      alcance: "24-40 km (70 Excalibur)",
      peso: "4,2 toneladas (titanio)",
      cadencia: "5 disparos/min",
      usuarios: "EE.UU., Ucrania, 10+",
    },
    assembly: [
      { pieza: "Estructura de titanio", desc: "El 'esqueleto' completo es titanio aeroespacial: 4,2 toneladas en vez de 7,5 del M198. Por eso un helicóptero lo cuelga y lo mueve entre montañas." },
      { pieza: "Cañón M776 de 155 mm", desc: "39 calibres de largo (6 m): dispara proyectiles de 45 kg. Con Excalibur (guiado GPS) el círculo de error es de 4 metros a 60 km." },
      { pieza: "Chasis con 2 ruedas", desc: "Solo dos ruedas + pata de apoyo: se 'planta' en 2 minutos. La barra de remolque se pliega verticalmente para no molestar en el disparo." },
      { pieza: "Freno de boca", desc: "La doble ranura al final del cañón: redirige gases y reduce el retroceso brutal de 45 kg de proyectil. Sin él, el arma saltaría del suelo." },
      { pieza: "Sistema digital de fuego", desc: "Pantalla y navegación integradas: recibe la orden por radio, el GPS lo coloca exacto y el software calcula la elevación automáticamente." },
      { pieza: "Munición Excalibur", desc: "Proyectil guiado con aletas que se abren en vuelo: 1 disparo = 1 objetivo. La 'munición precisa' que cambió la artillería de área a cirugía." },
    ],
  },
];

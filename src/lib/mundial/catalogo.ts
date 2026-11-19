// ═══════════════════════════════════════════════════════════════════
// v416.0 · EL CATÁLOGO MUNDIAL — qué se mide, con qué código, en qué unidad
// Departamento 4 · VANGUARD WORLD DATA (director de estadísticas)
//
// LO QUE HABÍA (medido, no supuesto): /comparador (v407.1) comparaba OCHO
// indicadores —población, superficie, densidad, PIB, PIB pc, gasto militar,
// esfuerzo militar y esperanza de vida— contra una foto del Banco Mundial
// guardada en censo-banco-mundial.json. Servía para poner dos países uno al
// lado del otro, pero no para investigar: no había serie histórica, ni
// educación, ni salud, ni energía, ni comercio, ni ambiente, ni filtros por
// año o región, y el catálogo era una tabla de ocho filas.
//
// LO QUE HACE ESTE ARCHIVO: declara CINCUENTA Y DOS indicadores en nueve
// categorías. Cada uno lleva lo que el encargo exige y nada más:
//   · código exacto de la fuente (Banco Mundial, WDI) — sin código no hay dato
//   · unidad de medida y decimales con los que se escribe
//   · la pregunta que responde, en palabras del lector
//   · método: qué mide de verdad y qué NO mide (para que nadie lea una cifra
//     como lo que no es)
//   · fuente, licencia y enlace a la definición original
//   · sentido: si más alto es mejor, peor o ninguno de los dos (una esperanza
//     de vida alta es buena; una mortalidad infantil alta, no; una superficie
//     no es ni una cosa ni la otra)
//
// REGLA DE LA CASA: aquí no hay ni una cifra. Este archivo es el índice; los
// números salen del Banco Mundial en `banco.ts` y siempre con su año al lado.
// Lo que la fuente no publica se escribe «sin dato»: no se estima, no se
// interpola y no se rellena con el año de al lado.
// ═══════════════════════════════════════════════════════════════════

export const VERSION_MUNDIAL = "v416.0";

export type CategoriaId =
  | "poblacion"
  | "economia"
  | "educacion"
  | "salud"
  | "energia"
  | "agricultura"
  | "comercio"
  | "ambiente"
  | "desarrollo";

export interface Categoria {
  id: CategoriaId;
  nombre: string;
  /** una línea: qué responde esta familia de indicadores */
  resumen: string;
  icono: string;
}

export const CATEGORIAS: Categoria[] = [
  { id: "poblacion", nombre: "Población y demografía", resumen: "Cuántos son, cómo crecen y cómo se reparten por edad.", icono: "users" },
  { id: "economia", nombre: "Economía y renta", resumen: "Cuánto produce el país, cuánto gana su gente y cuántos buscan trabajo.", icono: "chart-line" },
  { id: "educacion", nombre: "Educación", resumen: "Cuántos saben leer, cuántos siguen estudiando y cuánto gasta el Estado.", icono: "graduation-cap" },
  { id: "salud", nombre: "Salud pública", resumen: "Cuántos niños sobreviven, cuánto vive la gente y cuánto cuesta atenderlos.", icono: "heart-pulse" },
  { id: "energia", nombre: "Energía", resumen: "Quién tiene luz, de dónde la saca y cuánta consume.", icono: "zap" },
  { id: "agricultura", nombre: "Agricultura y alimento", resumen: "Cuánta tierra se cultiva, cuánto rinde y cuánta gente vive de ella.", icono: "wheat" },
  { id: "comercio", nombre: "Comercio exterior", resumen: "Cuánto vende y compra al mundo, y cuánto pesa en su economía.", icono: "ship" },
  { id: "ambiente", nombre: "Medio ambiente", resumen: "Qué emite, qué respira, cuánto bosque le queda y cuánta agua extrae.", icono: "leaf" },
  { id: "desarrollo", nombre: "Urbanización y desarrollo", resumen: "Dónde vive la gente, cuánta es pobre y cuánta está conectada.", icono: "building-2" },
];

export type Formato = "entero" | "decimal" | "millones" | "millardos" | "porcentaje" | "anios" | "indice" | "microgramos" | "kilogramos" | "hectareas" | "racimo";

export interface Indicador {
  id: string;
  nombre: string;
  /** etiqueta corta para tablas estrechas */
  corto: string;
  pregunta: string;
  categoria: CategoriaId;
  /** código del Banco Mundial (World Development Indicators) */
  codigo: string;
  unidad: string;
  formato: Formato;
  decimales: number;
  /** si un valor alto es mejor, peor o ninguna de las dos cosas */
  sentido: "alto" | "bajo" | "neutro";
  /** qué mide de verdad y qué no */
  metodo: string;
  /** la fuente, con nombre y apellido */
  fuente: string;
  licencia: string;
  urlDefinicion: string;
}

const WDI = "Banco Mundial · World Development Indicators";
const CCBY = "CC BY 4.0 (Banco Mundial)";
const base = (codigo: string, ancla = "") => `https://data.worldbank.org/indicator/${codigo}${ancla}`;

export const INDICADORES: Indicador[] = [
  // ── POBLACIÓN Y DEMOGRAFÍA ────────────────────────────────────────
  {
    id: "poblacion", nombre: "Población total", corto: "Población", pregunta: "¿Cuánta gente vive ahí?",
    categoria: "poblacion", codigo: "SP.POP.TOTL", unidad: "personas", formato: "entero", decimales: 0, sentido: "neutro",
    metodo: "Residentes de facto a mitad de año, según censos y estimaciones oficiales armonizadas por el Banco Mundial. No cuenta diáspora ni población flotante.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("SP.POP.TOTL"),
  },
  {
    id: "crecimiento_poblacion", nombre: "Crecimiento anual de la población", corto: "Crec. pobl.", pregunta: "¿Crece o se vacía?",
    categoria: "poblacion", codigo: "SP.POP.GROW", unidad: "% anual", formato: "porcentaje", decimales: 2, sentido: "neutro",
    metodo: "Variación porcentual de la población total respecto al año anterior. Un año negativo no es una tendencia: para eso está la serie completa.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("SP.POP.GROW"),
  },
  {
    id: "menores_14", nombre: "Población de 0 a 14 años", corto: "0-14 años", pregunta: "¿Cuánta gente es niño?",
    categoria: "poblacion", codigo: "SP.POP.0014.TO.ZS", unidad: "% de la población", formato: "porcentaje", decimales: 1, sentido: "neutro",
    metodo: "Porcentaje de la población total menor de 15 años. Depende de la estructura por edades declarada por el país.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("SP.POP.0014.TO.ZS"),
  },
  {
    id: "poblacion_15_64", nombre: "Población de 15 a 64 años", corto: "15-64 años", pregunta: "¿Cuánta gente está en edad de trabajar?",
    categoria: "poblacion", codigo: "SP.POP.1564.TO.ZS", unidad: "% de la población", formato: "porcentaje", decimales: 1, sentido: "neutro",
    metodo: "Porcentaje de población en edad teóricamente activa. Es un dato de estructura, no de empleo: no dice cuántos trabajan.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("SP.POP.1564.TO.ZS"),
  },
  {
    id: "mayores_65", nombre: "Población de 65 años o más", corto: "65+ años", pregunta: "¿Cuántos son mayores?",
    categoria: "poblacion", codigo: "SP.POP.65UP.TO.ZS", unidad: "% de la población", formato: "porcentaje", decimales: 1, sentido: "neutro",
    metodo: "Porcentaje de población de 65 años o más; el indicador habitual del envejecimiento demográfico.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("SP.POP.65UP.TO.ZS"),
  },
  {
    id: "fertilidad", nombre: "Tasa de fecundidad", corto: "Fecundidad", pregunta: "¿Cuántos hijos por mujer?",
    categoria: "poblacion", codigo: "SP.DYN.TFRT.IN", unidad: "hijos por mujer", formato: "decimal", decimales: 2, sentido: "neutro",
    metodo: "Número medio de hijos que tendría una mujer si viviera toda su vida fértil con las tasas actuales por edad. Por debajo de 2,1 la población tiende a reducirse a largo plazo.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("SP.DYN.TFRT.IN"),
  },

  // ── ECONOMÍA Y RENTA ──────────────────────────────────────────────
  {
    id: "pib", nombre: "PIB", corto: "PIB", pregunta: "¿Cuánto produce?",
    categoria: "economia", codigo: "NY.GDP.MKTP.CD", unidad: "US$ corrientes", formato: "millardos", decimales: 1, sentido: "alto",
    metodo: "Producto interior bruto a precios de mercado en dólares corrientes, convertido con el tipo de cambio oficial. Incluye la variación de precios: para volumen, se usa el crecimiento.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("NY.GDP.MKTP.CD"),
  },
  {
    id: "pib_pc", nombre: "PIB por habitante", corto: "PIB pc", pregunta: "¿Cuánto produce por persona?",
    categoria: "economia", codigo: "NY.GDP.PCAP.CD", unidad: "US$ corrientes", formato: "entero", decimales: 0, sentido: "alto",
    metodo: "PIB dividido por la población de mitad de año. Es un promedio: no dice cómo se reparte. Para eso están Gini y la tasa de pobreza.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("NY.GDP.PCAP.CD"),
  },
  {
    id: "crecimiento_pib", nombre: "Crecimiento del PIB", corto: "Crec. PIB", pregunta: "¿Se expande o se hunde?",
    categoria: "economia", codigo: "NY.GDP.MKTP.KD.ZG", unidad: "% anual", formato: "porcentaje", decimales: 2, sentido: "alto",
    metodo: "Variación anual del PIB a precios constantes: mide volumen, no dinero. Un país puede crecer en volumen y caer en dólares por el tipo de cambio.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("NY.GDP.MKTP.KD.ZG"),
  },
  {
    id: "pib_pc_ppa", nombre: "PIB por habitante (paridad de poder adquisitivo)", corto: "PIB pc PPA", pregunta: "¿Cuánto puede comprar de verdad?",
    categoria: "economia", codigo: "NY.GDP.PCAP.PP.CD", unidad: "US$ internacionales de 2021", formato: "entero", decimales: 0, sentido: "alto",
    metodo: "PIB por habitante ajustado por paridad de poder adquisitivo: compara poder de compra entre países, no lo que entra en divisas.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("NY.GDP.PCAP.PP.CD"),
  },
  {
    id: "inb_pc", nombre: "Renta nacional bruta por habitante", corto: "INB pc", pregunta: "¿Cuánto ingresa el país por persona?",
    categoria: "economia", codigo: "NY.GNP.PCAP.CD", unidad: "US$ corrientes (método Atlas)", formato: "entero", decimales: 0, sentido: "alto",
    metodo: "Renta nacional bruta por habitante con el método Atlas del Banco Mundial, que suaviza los saltos del tipo de cambio. Es la cifra con la que se clasifica a los países por nivel de renta.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("NY.GNP.PCAP.CD"),
  },
  {
    id: "inb_pc_ppa", nombre: "Renta nacional bruta por habitante (PPA)", corto: "INB pc PPA", pregunta: "¿Cuánto ingresa, en poder de compra?",
    categoria: "economia", codigo: "NY.GNP.PCAP.PP.CD", unidad: "US$ internacionales de 2021", formato: "entero", decimales: 0, sentido: "alto",
    metodo: "Renta nacional bruta por habitante ajustada por paridad de poder adquisitivo. No incluye remesas como partida separada: ya están dentro de la renta nacional.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("NY.GNP.PCAP.PP.CD"),
  },
  {
    id: "desempleo", nombre: "Desempleo", corto: "Desempleo", pregunta: "¿Cuántos buscan trabajo y no lo encuentran?",
    categoria: "economia", codigo: "SL.UEM.TOTL.ZS", unidad: "% de la población activa", formato: "porcentaje", decimales: 1, sentido: "bajo",
    metodo: "Estimación modelada de la OIT: personas sin trabajo que lo buscan y están disponibles. NO cuenta a quien dejó de buscar ni a la economía informal dominante en muchos países.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("SL.UEM.TOTL.ZS"),
  },
  {
    id: "participacion_laboral", nombre: "Participación en el mercado de trabajo", corto: "Participación", pregunta: "¿Cuánta gente trabaja o busca trabajo?",
    categoria: "economia", codigo: "SL.TLF.CACT.ZS", unidad: "% de la población de 15+", formato: "porcentaje", decimales: 1, sentido: "alto",
    metodo: "Población activa (ocupada más desempleada) sobre población de 15 años o más. Una tasa baja puede ser envejecimiento, estudio o retiro del mercado laboral: no solo desánimo.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("SL.TLF.CACT.ZS"),
  },

  // ── EDUCACIÓN ─────────────────────────────────────────────────────
  {
    id: "alfabetizacion", nombre: "Alfabetización de adultos", corto: "Alfabetización", pregunta: "¿Cuántos saben leer y escribir?",
    categoria: "educacion", codigo: "SE.ADT.LITR.ZS", unidad: "% de 15 años o más", formato: "porcentaje", decimales: 1, sentido: "alto",
    metodo: "Porcentaje de personas de 15 años o más que pueden leer y escribir una frase sencilla. Cada país lo mide con su propio criterio y en años distintos: el año se muestra siempre al lado.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("SE.ADT.LITR.ZS"),
  },
  {
    id: "alfabetizacion_jovenes", nombre: "Alfabetización de jóvenes", corto: "Alfab. 15-24", pregunta: "¿Y entre los jóvenes?",
    categoria: "educacion", codigo: "SE.ADT.1524.LT.ZS", unidad: "% de 15 a 24 años", formato: "porcentaje", decimales: 1, sentido: "alto",
    metodo: "Mismo criterio que la alfabetización de adultos, restringido a 15-24 años. La diferencia entre ambas mide el efecto del sistema escolar reciente.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("SE.ADT.1524.LT.ZS"),
  },
  {
    id: "matricula_primaria", nombre: "Matrícula neta en primaria", corto: "Primaria", pregunta: "¿Cuántos niños van a la escuela?",
    categoria: "educacion", codigo: "SE.PRM.NENR", unidad: "% de la edad oficial", formato: "porcentaje", decimales: 1, sentido: "alto",
    metodo: "Alumnos de la edad oficial matriculados en primaria sobre el total de niños de esa edad. Neta: no infla la cifra con repetidores ni con adultos.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("SE.PRM.NENR"),
  },
  {
    id: "matricula_secundaria", nombre: "Matrícula neta en secundaria", corto: "Secundaria", pregunta: "¿Y cuántos siguen después?",
    categoria: "educacion", codigo: "SE.SEC.NENR", unidad: "% de la edad oficial", formato: "porcentaje", decimales: 1, sentido: "alto",
    metodo: "Alumnos de la edad oficial matriculados en secundaria sobre la población de esa edad. Es donde se mide de verdad la continuidad del sistema.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("SE.SEC.NENR"),
  },
  {
    id: "matricula_terciaria", nombre: "Matrícula en educación superior", corto: "Superior", pregunta: "¿Cuántos llegan a la universidad?",
    categoria: "educacion", codigo: "SE.TER.ENRR", unidad: "% bruto", formato: "porcentaje", decimales: 1, sentido: "alto",
    metodo: "Matriculados en educación terciaria sobre la población en edad oficial, en tasa BRUTA: puede superar el 100 % porque cuenta a alumnos de cualquier edad.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("SE.TER.ENRR"),
  },
  {
    id: "gasto_educacion", nombre: "Gasto público en educación", corto: "Gasto educ.", pregunta: "¿Cuánto pone el Estado?",
    categoria: "educacion", codigo: "SE.XPD.TOTL.GD.ZS", unidad: "% del PIB", formato: "porcentaje", decimales: 2, sentido: "alto",
    metodo: "Gasto público total en educación (corriente y de capital) como porcentaje del PIB. No dice si ese dinero llega al aula ni cuánto pone cada familia.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("SE.XPD.TOTL.GD.ZS"),
  },

  // ── SALUD PÚBLICA ─────────────────────────────────────────────────
  {
    id: "esperanza_vida", nombre: "Esperanza de vida al nacer", corto: "Esperanza vida", pregunta: "¿Cuánto vive la gente?",
    categoria: "salud", codigo: "SP.DYN.LE00.IN", unidad: "años", formato: "anios", decimales: 1, sentido: "alto",
    metodo: "Años que viviría un recién nacido si las tasas de mortalidad por edad de ese año se mantuvieran toda su vida. No es una predicción: es una foto del año.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("SP.DYN.LE00.IN"),
  },
  {
    id: "mortalidad_infantil", nombre: "Mortalidad en menores de 5 años", corto: "Mortal. <5", pregunta: "¿Cuántos niños no llegan a los cinco?",
    categoria: "salud", codigo: "SH.DYN.MORT", unidad: "por cada 1.000 nacidos vivos", formato: "decimal", decimales: 1, sentido: "bajo",
    metodo: "Probabilidad de morir entre el nacimiento y los 5 años por cada 1.000 nacidos vivos. Estimación interinstitucional (IGME), comparable entre países.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("SH.DYN.MORT"),
  },
  {
    id: "mortalidad_neonatal", nombre: "Mortalidad neonatal", corto: "Mortal. neonat.", pregunta: "¿Cuántos mueren en el primer mes?",
    categoria: "salud", codigo: "SH.DYN.NMRT", unidad: "por cada 1.000 nacidos vivos", formato: "decimal", decimales: 1, sentido: "bajo",
    metodo: "Muertes en los primeros 28 días por cada 1.000 nacidos vivos. Mide la calidad del parto y del acceso a cuidados inmediatos.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("SH.DYN.NMRT"),
  },
  {
    id: "mortalidad_materna", nombre: "Mortalidad materna", corto: "Mortal. materna", pregunta: "¿Cuántas mujeres mueren por embarazo?",
    categoria: "salud", codigo: "SH.STA.MMRT", unidad: "por cada 100.000 nacidos vivos", formato: "decimal", decimales: 0, sentido: "bajo",
    metodo: "Muertes maternas durante el embarazo, el parto o los 42 días siguientes, por 100.000 nacidos vivos. Estimación modelada: no es un recuento de certificados.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("SH.STA.MMRT"),
  },
  {
    id: "gasto_salud", nombre: "Gasto en salud", corto: "Gasto salud", pregunta: "¿Cuánto se dedica a sanidad?",
    categoria: "salud", codigo: "SH.XPD.CHEX.GD.ZS", unidad: "% del PIB", formato: "porcentaje", decimales: 2, sentido: "alto",
    metodo: "Gasto corriente en salud (público y privado, incluido el gasto de bolsillo de las familias) como porcentaje del PIB.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("SH.XPD.CHEX.GD.ZS"),
  },
  {
    id: "gasto_salud_pc", nombre: "Gasto en salud por habitante", corto: "Salud pc", pregunta: "¿Cuánto por persona?",
    categoria: "salud", codigo: "SH.XPD.CHEX.PC.CD", unidad: "US$ corrientes", formato: "entero", decimales: 0, sentido: "alto",
    metodo: "Gasto corriente en salud por persona y año en dólares corrientes. No está ajustado por poder de compra: un dólar rinde distinto en cada país.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("SH.XPD.CHEX.PC.CD"),
  },
  {
    id: "vacunacion_sarampion", nombre: "Vacunación contra el sarampión", corto: "Vacuna sarampión", pregunta: "¿Cuántos niños están vacunados?",
    categoria: "salud", codigo: "SH.IMM.MEAS", unidad: "% de niños de 12-23 meses", formato: "porcentaje", decimales: 0, sentido: "alto",
    metodo: "Porcentaje de niños de 12 a 23 meses que han recibido al menos una dosis. Es el indicador clásico de cobertura del sistema de vacunas.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("SH.IMM.MEAS"),
  },

  // ── ENERGÍA ───────────────────────────────────────────────────────
  {
    id: "acceso_electricidad", nombre: "Acceso a la electricidad", corto: "Electricidad", pregunta: "¿Quién tiene luz en casa?",
    categoria: "energia", codigo: "EG.ELC.ACCS.ZS", unidad: "% de la población", formato: "porcentaje", decimales: 1, sentido: "alto",
    metodo: "Porcentaje de la población con conexión eléctrica en su vivienda. No mide cortes, calidad ni precio: solo si hay conexión.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("EG.ELC.ACCS.ZS"),
  },
  {
    id: "renovables", nombre: "Energía renovable en el consumo final", corto: "Renovables", pregunta: "¿Cuánta energía es limpia?",
    categoria: "energia", codigo: "EG.FEC.RNEW.ZS", unidad: "% del consumo final", formato: "porcentaje", decimales: 1, sentido: "alto",
    metodo: "Cuota de renovables (hidráulica, solar, eólica, biocombustibles y biomasa tradicional) en el consumo final de energía. Incluye leña y carbón vegetal: un país puede salir alto por deforestación, no por parques solares.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("EG.FEC.RNEW.ZS"),
  },
  {
    id: "consumo_energia_pc", nombre: "Consumo de energía por habitante", corto: "Energía pc", pregunta: "¿Cuánta energía gasta cada uno?",
    categoria: "energia", codigo: "EG.USE.PCAP.KG.OE", unidad: "kg equivalentes de petróleo", formato: "entero", decimales: 0, sentido: "neutro",
    metodo: "Uso de energía primaria antes de transformarla en electricidad, per cápita. Un valor alto indica industria y consumo, no bienestar por sí mismo.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("EG.USE.PCAP.KG.OE"),
  },
  {
    id: "importacion_energia", nombre: "Dependencia energética exterior", corto: "Depend. energ.", pregunta: "¿Cuánta energía tiene que comprar?",
    categoria: "energia", codigo: "EG.IMP.CONS.ZS", unidad: "% neto del uso de energía", formato: "porcentaje", decimales: 1, sentido: "bajo",
    metodo: "Importaciones netas de energía como porcentaje del uso. Un valor negativo significa que el país es exportador neto.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("EG.IMP.CONS.ZS"),
  },

  // ── AGRICULTURA ───────────────────────────────────────────────────
  {
    id: "tierra_agricola", nombre: "Tierra agrícola", corto: "Tierra agrícola", pregunta: "¿Cuánto territorio se cultiva?",
    categoria: "agricultura", codigo: "AG.LND.AGRI.ZS", unidad: "% de la superficie", formato: "porcentaje", decimales: 1, sentido: "neutro",
    metodo: "Tierra cultivable, pastos y cultivos permanentes sobre superficie total. Incluye pastos extensivos: no equivale a hectáreas sembradas.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("AG.LND.AGRI.ZS"),
  },
  {
    id: "produccion_alimentos", nombre: "Índice de producción de alimentos", corto: "Prod. alimentos", pregunta: "¿Produce más que antes?",
    categoria: "agricultura", codigo: "AG.PRD.FOOD.XD", unidad: "índice (2014-2016 = 100)", formato: "indice", decimales: 1, sentido: "alto",
    metodo: "Volumen de producción alimentaria respecto a la media de 2014-2016. Es un índice: no son toneladas ni dinero.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("AG.PRD.FOOD.XD"),
  },
  {
    id: "rendimiento_cereales", nombre: "Rendimiento de los cereales", corto: "Rend. cereales", pregunta: "¿Cuánto saca de cada hectárea?",
    categoria: "agricultura", codigo: "AG.YLD.CREL.KG", unidad: "kg por hectárea cosechada", formato: "kilogramos", decimales: 0, sentido: "alto",
    metodo: "Kg de cereal cosechado por hectárea. Depende de la tecnología, el clima y el tipo de cereal sembrado.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("AG.YLD.CREL.KG"),
  },
  {
    id: "empleo_agricola", nombre: "Empleo en agricultura", corto: "Empleo agrícola", pregunta: "¿Cuánta gente vive del campo?",
    categoria: "agricultura", codigo: "SL.AGR.EMPL.ZS", unidad: "% del empleo total", formato: "porcentaje", decimales: 1, sentido: "neutro",
    metodo: "Personas ocupadas en agricultura sobre el empleo total, con estimación modelada de la OIT. En países pobres suele ser alto y no significa atraso: significa estructura.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("SL.AGR.EMPL.ZS"),
  },
  {
    id: "fertilizantes", nombre: "Consumo de fertilizantes", corto: "Fertilizantes", pregunta: "¿Cuánto abona la tierra?",
    categoria: "agricultura", codigo: "AG.CON.FERT.ZS", unidad: "kg por hectárea de tierra arable", formato: "kilogramos", decimales: 1, sentido: "neutro",
    metodo: "Fertilizantes nitrogenados, fosfatados y potásicos consumidos por hectárea arable. Más fertilizante no es mejor: mide intensidad, con coste ambiental.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("AG.CON.FERT.ZS"),
  },

  // ── COMERCIO INTERNACIONAL ────────────────────────────────────────
  {
    id: "comercio_pib", nombre: "Comercio exterior sobre el PIB", corto: "Comercio/PIB", pregunta: "¿Cuánto pesa el mundo en su economía?",
    categoria: "comercio", codigo: "NE.TRD.GNFS.ZS", unidad: "% del PIB", formato: "porcentaje", decimales: 1, sentido: "neutro",
    metodo: "Exportaciones más importaciones de bienes y servicios sobre el PIB. Una economía grande y cerrada puede tener un porcentaje bajo sin estar aislada del comercio.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("NE.TRD.GNFS.ZS"),
  },
  {
    id: "exportaciones_pib", nombre: "Exportaciones de bienes y servicios", corto: "Export./PIB", pregunta: "¿Cuánto vende fuera?",
    categoria: "comercio", codigo: "NE.EXP.GNFS.ZS", unidad: "% del PIB", formato: "porcentaje", decimales: 1, sentido: "alto",
    metodo: "Valor de bienes y servicios exportados sobre el PIB, en cuentas nacionales. Incluye servicios como turismo.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("NE.EXP.GNFS.ZS"),
  },
  {
    id: "importaciones_pib", nombre: "Importaciones de bienes y servicios", corto: "Import./PIB", pregunta: "¿Cuánto compra fuera?",
    categoria: "comercio", codigo: "NE.IMP.GNFS.ZS", unidad: "% del PIB", formato: "porcentaje", decimales: 1, sentido: "neutro",
    metodo: "Valor de bienes y servicios importados sobre el PIB. Un porcentaje alto en alimentos o combustible es dependencia, no solo apertura.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("NE.IMP.GNFS.ZS"),
  },
  {
    id: "exportaciones_mercancia", nombre: "Exportaciones de mercancías", corto: "Export. mercancías", pregunta: "¿Cuánto dinero entra por vender?",
    categoria: "comercio", codigo: "TX.VAL.MRCH.CD.WT", unidad: "US$ corrientes", formato: "millardos", decimales: 2, sentido: "alto",
    metodo: "Valor FOB de las mercancías exportadas, según balanza comercial. No incluye servicios ni remesas: en varios países de la región, las remesas superan esta cifra.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("TX.VAL.MRCH.CD.WT"),
  },
  {
    id: "inversion_extranjera", nombre: "Inversión extranjera directa (entradas netas)", corto: "IED", pregunta: "¿Cuánto capital extranjero entra?",
    categoria: "comercio", codigo: "BX.KLT.DINV.CD.WD", unidad: "US$ corrientes", formato: "millardos", decimales: 2, sentido: "neutro",
    metodo: "Entradas netas de inversión directa (capital, reinversión de beneficios y préstamos entre matrices y filiales). Un año alto puede ser una venta de activos, no una fábrica nueva.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("BX.KLT.DINV.CD.WD"),
  },

  // ── MEDIO AMBIENTE ────────────────────────────────────────────────
  {
    id: "co2_pc", nombre: "Emisiones de CO₂ por habitante", corto: "CO₂ pc", pregunta: "¿Cuánto contamina cada uno?",
    categoria: "ambiente", codigo: "EN.GHG.CO2.PC.CE.AR5", unidad: "toneladas de CO₂ por persona", formato: "decimal", decimales: 2, sentido: "bajo",
    metodo: "Emisiones de CO₂ (combustión de fósiles y procesos industriales) por persona, con potenciales de calentamiento AR5. No incluye otros gases como el metano.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("EN.GHG.CO2.PC.CE.AR5"),
  },
  {
    id: "pm25", nombre: "Contaminación por partículas finas", corto: "PM2.5", pregunta: "¿Qué aire respira?",
    categoria: "ambiente", codigo: "EN.ATM.PM25.MC.M3", unidad: "µg/m³ (media anual)", formato: "microgramos", decimales: 1, sentido: "bajo",
    metodo: "Exposición media anual a partículas de menos de 2,5 micras, ponderada por población. La OMS recomienda no pasar de 5 µg/m³: por encima, el riesgo sanitario sube.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("EN.ATM.PM25.MC.M3"),
  },
  {
    id: "bosque", nombre: "Superficie forestal", corto: "Bosque", pregunta: "¿Cuánto bosque le queda?",
    categoria: "ambiente", codigo: "AG.LND.FRST.ZS", unidad: "% de la superficie", formato: "porcentaje", decimales: 1, sentido: "alto",
    metodo: "Tierra con árboles de más de 5 metros, según la FAO. Incluye plantaciones: un porcentaje alto no distingue bosque nativo de cultivo forestal.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("AG.LND.FRST.ZS"),
  },
  {
    id: "agua_dulce", nombre: "Extracción de agua dulce", corto: "Agua extraída", pregunta: "¿Cuánta agua saca?",
    categoria: "ambiente", codigo: "ER.H2O.FWTL.ZS", unidad: "% de los recursos internos", formato: "porcentaje", decimales: 1, sentido: "bajo",
    metodo: "Agua extraída para agricultura, industria y ciudades sobre recursos internos renovables. Por encima del 25 % se considera estrés hídrico; por encima del 100 %, insostenible.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("ER.H2O.FWTL.ZS"),
  },
  {
    id: "areas_protegidas", nombre: "Áreas terrestres y marinas protegidas", corto: "Áreas protegidas", pregunta: "¿Cuánto territorio protege?",
    categoria: "ambiente", codigo: "ER.PTD.TOTL.ZS", unidad: "% del territorio", formato: "porcentaje", decimales: 1, sentido: "alto",
    metodo: "Porcentaje de superficie terrestre y marina bajo figura de protección (UICN). Declarar un parque no es protegerlo: mide superficie declarada.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("ER.PTD.TOTL.ZS"),
  },

  // ── URBANIZACIÓN Y DESARROLLO ─────────────────────────────────────
  {
    id: "poblacion_urbana", nombre: "Población urbana", corto: "Urbana", pregunta: "¿Dónde vive la gente?",
    categoria: "desarrollo", codigo: "SP.URB.TOTL.IN.ZS", unidad: "% de la población", formato: "porcentaje", decimales: 1, sentido: "neutro",
    metodo: "Población que vive en áreas definidas como urbanas según el criterio de cada país: lo que es urbano en uno no lo es en otro. Compárese con cuidado.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("SP.URB.TOTL.IN.ZS"),
  },
  {
    id: "crecimiento_urbano", nombre: "Crecimiento de la población urbana", corto: "Crec. urbano", pregunta: "¿Cómo crecen las ciudades?",
    categoria: "desarrollo", codigo: "SP.URB.GROW", unidad: "% anual", formato: "porcentaje", decimales: 2, sentido: "neutro",
    metodo: "Variación anual de la población urbana. Por encima del 3 % anual, las ciudades duplican población en menos de 25 años: exige vivienda e infraestructura al mismo ritmo.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("SP.URB.GROW"),
  },
  {
    id: "poblacion_rural", nombre: "Población rural", corto: "Rural", pregunta: "¿Y cuánta queda en el campo?",
    categoria: "desarrollo", codigo: "SP.RUR.TOTL.ZS", unidad: "% de la población", formato: "porcentaje", decimales: 1, sentido: "neutro",
    metodo: "Complemento de la población urbana según la definición de cada país. Rural no es sinónimo de agrícola.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("SP.RUR.TOTL.ZS"),
  },
  {
    id: "internet", nombre: "Personas con acceso a internet", corto: "Internet", pregunta: "¿Cuántos están conectados?",
    categoria: "desarrollo", codigo: "IT.NET.USER.ZS", unidad: "% de la población", formato: "porcentaje", decimales: 1, sentido: "alto",
    metodo: "Personas que usaron internet en los últimos tres meses, según encuestas nacionales. No mide calidad de conexión ni dispositivos.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("IT.NET.USER.ZS"),
  },
  {
    id: "pobreza", nombre: "Población bajo el umbral de pobreza", corto: "Pobreza", pregunta: "¿Cuántos viven con casi nada?",
    categoria: "desarrollo", codigo: "SI.POV.DDAY", unidad: "% bajo US$ 3,00 al día (PPA 2021)", formato: "porcentaje", decimales: 1, sentido: "bajo",
    metodo: "Porcentaje que vive con menos del umbral de pobreza internacional (US$ 3,00 diarios en PPA de 2021, la línea vigente para países de renta media-baja). Se mide con encuestas: los años pueden estar lejos del presente y se muestran siempre.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("SI.POV.DDAY"),
  },
  {
    id: "gini", nombre: "Índice de Gini", corto: "Gini", pregunta: "¿Cómo se reparte?",
    categoria: "desarrollo", codigo: "SI.POV.GINI", unidad: "índice 0-100", formato: "decimal", decimales: 1, sentido: "bajo",
    metodo: "Desigualdad de la renta o del consumo: 0 es igualdad perfecta, 100 es que una persona lo tiene todo. Se calcula con encuestas nacionales, y su comparabilidad entre países es limitada.",
    fuente: WDI, licencia: CCBY, urlDefinicion: base("SI.POV.GINI"),
  },
];

/** Índice por id y por código, para no recorrer el catálogo a cada paso. */
export const POR_ID = new Map(INDICADORES.map((i) => [i.id, i]));
export const POR_CODIGO = new Map(INDICADORES.map((i) => [i.codigo, i]));

export function indicador(id: string): Indicador | undefined {
  return POR_ID.get(id) ?? POR_CODIGO.get(id);
}

export function indicadoresDe(categoria: CategoriaId): Indicador[] {
  return INDICADORES.filter((i) => i.categoria === categoria);
}

export function categoriaDe(id: CategoriaId): Categoria {
  return CATEGORIAS.find((c) => c.id === id) ?? CATEGORIAS[0];
}

/** El catálogo en su forma de máquina (para la API y las pruebas). */
export function catalogoPublico() {
  return {
    version: VERSION_MUNDIAL,
    total: INDICADORES.length,
    categorias: CATEGORIAS.map((c) => ({
      ...c,
      indicadores: indicadoresDe(c.id).map((i) => i.id),
    })),
    indicadores: INDICADORES.map((i) => ({
      id: i.id,
      nombre: i.nombre,
      categoria: i.categoria,
      codigo: i.codigo,
      unidad: i.unidad,
      formato: i.formato,
      decimales: i.decimales,
      sentido: i.sentido,
      metodo: i.metodo,
      fuente: i.fuente,
      licencia: i.licencia,
      urlDefinicion: i.urlDefinicion,
    })),
  };
}

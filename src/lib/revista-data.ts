// v92.0 OJO DEL MUNDO — ASUNTOS EXTERIORES (espejo de la gran revista de
// política exterior): número bimestral con ensayos largos de autores
// ficticios, debate a dos voces y cita destacada. Todos los autores, cargos
// y tesis son creación propia del mundo Vanguard.

import { evaluarNeuronal, mulberry32, fnvHash } from "./neurona-core";

export type Ensayo = {
  titulo: string;
  autor: string;
  cargo: string;
  resumen: string;
  tesis: string;
  lecturaMin: number;
  tono: "DISUASIÓN" | "GRAN ESTRATEGIA" | "TECNOLOGÍA" | "ECONOMÍA" | "HISTORIA";
  riesgo: number;
  destacado?: boolean;
};

export type Debate = { pregunta: string; pro: { autor: string; argumento: string }; contra: { autor: string; argumento: string } };

export type NumeroRevista = {
  numero: number;
  volumen: string;
  lema: string;
  ensayos: Ensayo[];
  debate: Debate;
  citaDestacada: { texto: string; autor: string };
  editorial: string;
};

const AUTORES = [
  { nombre: "Elena Marchetti", cargo: "catedrática de Estudios Estratégicos, Universidad de Tarquinia" },
  { nombre: "Anselm Vogt", cargo: "ex-negociador jefe de la Liga Marítima del Norte" },
  { nombre: "Rosa Ibarra", cargo: "directora del Aula de Prospectiva del Ala Norte" },
  { nombre: "Dmitri Halvorsen", cargo: "analista sénior de disuasión extendida" },
  { nombre: "Nour Eddine Kassi", cargo: "profesora de Economía de la Guerra, Escuela de Bruma" },
  { nombre: "Tomasz Wilder", cargo: "coronel retirado, cronista de la guerra del Karvath" },
  { nombre: "Sofía Andrade", cargo: "investigadora de desinformación computacional" },
  { nombre: "Jonas Béranger", cargo: "ex-ministro de Defensa de la Liga de Estrela" },
];

const TITULOS = [
  "La era del pulso eterno",
  "Disuasión sin grito: el nuevo manual silencioso",
  "El continente que aprendió a contar misiles",
  "Cuando el mapa miente: cartografía del deseo imperial",
  "La economía del asedio moderno",
  "Drones pequeños, doctrinas grandes",
  "La soberanía ya se mide en teraflops",
  "Historias de dos bloques: el regreso de la deuda de defensa",
  "El estrecho como rehén de su propio tráfico",
  "Guerras cortas, páramos largos",
];

const TESIS = [
  "El siglo no lo decidirá quien dispare primero, sino quien aguante más sin disparar: la disuasión se traslada del arsenal a la contabilidad.",
  "Toda crisis contemporánea es primero una crisis de narrativa; quien controla la línea temporal del relato controla el permiso de escalar.",
  "Las potencias medias han descubierto que un archipiélago de bases pequeñas dispersas disuade mejor que dos mega-bases invisibles.",
  "La automatización no abrevia las guerras: las encoge tácticamente y las estira estratégicamente, hasta el agotamiento de quien la cree ventajosa.",
  "El petróleo ya no es el cuello de botella: lo es la capacidad de fabricar chips de radar en tiempo de sanción.",
];

const RESUMENES = [
  "Un recorrido por tres décadas de crisis repetidas para preguntarse por qué el mundo volvió a los pactos de seguridad de 1954 con armamento de 2024.",
  "El autor examina cómo las sanciones se convirtieron en moneda corriente y por qué sus efectos ya no sorprenden a nadie que planifique a diez años.",
  "Memoria personal de dos mesas de negociación que fracasaron por diferencias de zona horaria: el detalle doméstico que decide lo estratégico.",
  "Análisis de flota y doctrina: qué cambia cuando un astillero civil puede convertir 40 graneleros en transporte militar en seis semanas.",
  "Por qué la infraestructura civil es hoy el objetivo militar más rentable — y qué dice eso sobre la moralidad declarada de los bandos.",
];

const LEMAS = [
  "El mundo no se estudia desde el centro: se estudia desde los estrechos",
  "La guerra cambia de forma para no cambiar de fondo",
  "Entre dos brumas siempre hay una doctrina",
  "Cada mapa es una promesa incumplida",
];

const EDITORIALES = [
  "Este número nace de una pregunta incómoda: ¿qué pasa cuando el orden que conocemos no colapsa con un estallido, sino con una firma? Nuestros ensayistas recorren salas de negociación, astilleros y redes eléctricas para mostrar que la gran competencia del siglo se juega en el detalle administrativo. Vanguard publica esta colección como ejercicio de mirada larga: entender la guerra empieza por entender quién firma qué, y en qué orden.",
  "Hay épocas en que la historia avanza a saltos; la nuestra avanza a escrituras. Ceden puertos, se renuevan mandatos, se prorrogan bases. Nada de eso aparece en los titulares del día y todo eso define dónde caerá la próxima línea de frente. Esta edición reúne a ocho voces que leen el lento submarinismo del orden internacional — y las pocas válvulas por las que todavía puede subir a superficie.",
];

function generarNumero(numero: number): NumeroRevista {
  const rnd = mulberry32(fnvHash(`revista-${numero}`));
  const sufijos = ["Enero–Febrero", "Marzo–Abril", "Mayo–Junio", "Julio–Agosto", "Septiembre–Octubre", "Noviembre–Diciembre"];
  const volumen = `${sufijos[numero % sufijos.length]} de 20${72 + (numero % 28)}`;

  const ensayos: Ensayo[] = Array.from({ length: 5 }, (_, i) => {
    const autor = AUTORES[(numero * 3 + i) % AUTORES.length];
    const titulo = TITULOS[(numero + i * 3) % TITULOS.length];
    const tesis = TESIS[(numero + i) % TESIS.length];
    const veredicto = evaluarNeuronal(titulo + " " + tesis);
    return {
      titulo,
      autor: autor.nombre,
      cargo: autor.cargo,
      resumen: RESUMENES[(numero + i) % RESUMENES.length],
      tesis,
      lecturaMin: 8 + Math.floor(rnd() * 14),
      tono: (["DISUASIÓN", "GRAN ESTRATEGIA", "TECNOLOGÍA", "ECONOMÍA", "HISTORIA"] as const)[i],
      riesgo: veredicto.riesgo,
      destacado: i === 0,
    };
  });

  const debatePreguntas = [
    "¿Disuade más un arsenal visible o uno ambiguo?",
    "¿Debe la Liga financiar ejércitos ajenos para no enviar los propios?",
    "¿La ambigüedad estratégica protege o compromete a los aliados pequeños?",
  ];
  const pregunta = debatePreguntas[numero % debatePreguntas.length];
  const a1 = AUTORES[(numero + 2) % AUTORES.length];
  const a2 = AUTORES[(numero + 5) % AUTORES.length];

  return {
    numero,
    volumen,
    lema: LEMAS[numero % LEMAS.length],
    ensayos,
    debate: {
      pregunta,
      pro: {
        autor: a1.nombre,
        argumento: "La ambigüedad calculada obliga al adversario a planificar contra el peor caso: es la forma más barata de multiplicar fuerzas sin fabricar un solo misil.",
      },
      contra: {
        autor: a2.nombre,
        argumento: "Cada sombra de duda que sembramos también cae sobre nuestros aliados; una alianza que no sabe qué haría su jefe en el día D ya está medio derrotada.",
      },
    },
    citaDestacada: {
      texto: TESIS[(numero + 1) % TESIS.length],
      autor: AUTORES[(numero + 1) % AUTORES.length].nombre,
    },
    editorial: EDITORIALES[numero % EDITORIALES.length],
  };
}

export function numeroActual(): NumeroRevista {
  const d = new Date();
  return generarNumero(d.getUTCFullYear() * 6 + d.getUTCMonth());
}

export function numerosAtras(n = 4): NumeroRevista[] {
  const d = new Date();
  const actual = d.getUTCFullYear() * 6 + d.getUTCMonth();
  return Array.from({ length: n }, (_, i) => generarNumero(actual - 1 - i));
}

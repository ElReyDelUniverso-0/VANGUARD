// ═══════════════════════════════════════════════════════════════════
// v420.3 · VANGUARD INFRASTRUCTURE ATLAS — EDUCACIÓN
// Grandes instituciones educativas y edificios universitarios, documentados
// en fuentes públicas.
// ═══════════════════════════════════════════════════════════════════

import { e, type Infraestructura } from "./tipos";

const WIK = (nombre: string) => ({ nombre: `Wikipedia · «${nombre}» (fuente pública)`, url: `https://en.wikipedia.org/wiki/${nombre.replace(/ /g, "_")}`, licencia: "contenido de dominio público / libre" });

export const EDUCACION: Infraestructura[] = [
  e("educacion-universidad-harvard", "Universidad de Harvard", "educacion", "us", { ciudad: "Cambridge, Massachusetts", lat: 42.37, lng: -71.12 },
    "La universidad más antigua de Estados Unidos, fundada en 1636. Su campus de Cambridge, Massachusetts, reúne las facultades más prestigiosas del país y una de las bibliotecas más grandes del mundo.",
    "1636",
    [
      { clave: "alumnos", valor: "≈ 23.000 (toda la universidad)" },
      { clave: "biblioteca", valor: "≈ 20 millones de volúmenes" },
    ],
    WIK("Harvard University"), "confirmado", [], true),
  e("educacion-universidad-oxford", "Universidad de Oxford", "educacion", "gb", { ciudad: "Oxford", lat: 51.75, lng: -1.26 },
    "La universidad más antigua del mundo de habla anglófona, con docencia documentada desde 1096. Sus treinta y nueve colleges reparten edificios históricos por toda la ciudad de Oxford.",
    "1096",
    [
      { clave: "colleges", valor: "39 colleges" },
      { clave: "alumnos", valor: "≈ 26.000" },
    ],
    WIK("University of Oxford"), "confirmado", [], true),
  e("educacion-universidad-cambridge", "Universidad de Cambridge", "educacion", "gb", { ciudad: "Cambridge", lat: 52.2, lng: 0.12 },
    "Una de las universidades más antiguas y prestigiosas del mundo, fundada en 1209. Sus colleges y sus bibliotecas, entre ellas la de la universidad, forman un conjunto histórico.",
    "1209",
    [
      { clave: "colleges", valor: "31 colleges" },
      { clave: "alumnos", valor: "≈ 24.000" },
    ],
    WIK("University of Cambridge"), "confirmado", [], true),
  e("educacion-universidad-bogota", "Universidad Nacional de Colombia", "educacion", "co", { ciudad: "Bogotá", lat: 4.71, lng: -74.07 },
    "La universidad pública más grande de Colombia, fundada en 1867. Su sede principal en Bogotá, la Ciudad Universitaria, es el campus más grande del país.",
    "1867",
    [
      { clave: "estudiantes", valor: "≈ 80.000" },
      { clave: "campus", valor: "Ciudad Universitaria, Bogotá" },
    ],
    WIK("National University of Colombia"), "confirmado", [], true),
  e("educacion-universidad-nacional-mexico", "Universidad Nacional Autónoma de México", "educacion", "mx", { ciudad: "Ciudad de México", lat: 19.42, lng: -99.18 },
    "La universidad pública más importante de México, fundada en 1910. Su Ciudad Universitaria, declarada Patrimonio de la Humanidad, es el campus más grande del país.",
    "1910",
    [
      { clave: "estudiantes", valor: "≈ 370.000" },
      { clave: "patrimonio", valor: "Ciudad Universitaria, UNESCO" },
    ],
    WIK("National Autonomous University of Mexico"), "confirmado", [], true),
  e("educacion-universidad-tokyo", "Universidad de Tokio", "educacion", "jp", { ciudad: "Tokio", lat: 35.73, lng: 139.76 },
    "La universidad más prestigiosa de Japón, fundada en 1877. Su campus de Hongo, en el barrio de Bunkyō, es el principal de la institución.",
    "1877",
    [
      { clave: "estudiantes", valor: "≈ 30.000" },
      { clave: "campus", valor: "Campus de Hongo, Bunkyō, Tokio" },
    ],
    WIK("University of Tokyo"), "confirmado", [], true),
  e("educacion-universidad-paris", "Universidad de la Sorbona", "educacion", "fr", { ciudad: "París", lat: 48.85, lng: 2.34 },
    "La universidad más antigua de Francia, fundada en 1257. El edificio histórico de la Sorbona, en la calle de las Escuelas, sigue siendo el símbolo de la universidad.",
    "1257",
    [
      { clave: "estudiantes", valor: "≈ 60.000 (en la actual universidad)" },
      { clave: "patrimonio", valor: "edificio histórico de la Sorbona, París" },
    ],
    WIK("Sorbonne"), "confirmado", [], true),
  e("educacion-universidad-beijing", "Universidad de Pekín", "educacion", "cn", { ciudad: "Pekín", lat: 39.99, lng: 116.31 },
    "La universidad más prestigiosa de China, fundada en 1898 como la Imperial Universidad de Pekín. Su campus de Yanta, en el distrito de Haidian, es el más grande.",
    "1898",
    [
      { clave: "estudiantes", valor: "≈ 46.000" },
      { clave: "campus", valor: "Campus principal de Haidian, Pekín" },
    ],
    WIK("Peking University"), "confirmado", [], true),
  e("educacion-universidad-eco", "Universidad de Costa Rica", "educacion", "cr", { ciudad: "San José", lat: 9.93, lng: -84.04 },
    "La universidad pública de Costa Rica, fundada en 1940. Su sede principal en San José concentra la mayor parte de la docencia del país.",
    "1940",
    [
      { clave: "estudiantes", valor: "≈ 42.000" },
      { clave: "campus", valor: "Sede principal, San José" },
    ],
    WIK("University of Costa Rica"), "confirmado", [], true),
  e("educacion-universidad-costa-rica-sede-cariari", "Sede Cariari de la Universidad de Costa Rica", "educacion", "cr", { ciudad: "Guápiles, Limón", lat: 10.06, lng: -83.6 },
    "La sede regional de la Universidad de Costa Rica en el Caribe, en Guápiles. Es un ejemplo de la infraestructura educativa regional del país.",
    "1974",
    [
      { clave: "estudiantes", valor: "≈ 8.000" },
      { clave: "campus", valor: "Cariari, Guápiles, Limón" },
    ],
    WIK("University of Costa Rica"), "por verificar", [], true),
  e("educacion-universidad-sao-paulo", "Universidad de São Paulo", "educacion", "br", { ciudad: "São Paulo", lat: -23.55, lng: -46.63 },
    "La universidad más importante de Brasil, fundada en 1934. Su campus de la Ciudad Universitaria, en São Paulo, es el más grande del país.",
    "1934",
    [
      { clave: "estudiantes", valor: "≈ 90.000" },
      { clave: "campus", valor: "Ciudad Universitaria de São Paulo" },
    ],
    WIK("University of São Paulo"), "confirmado", [], true),
  e("educacion-universidad-argentina", "Universidad de Buenos Aires", "educacion", "ar", { ciudad: "Buenos Aires", lat: -34.58, lng: -58.41 },
    "La universidad pública más importante de Argentina, fundada en 1821. Su sede histórica en el barrio de Recoleta y sus facultades reparten la docencia por toda Buenos Aires.",
    "1821",
    [
      { clave: "estudiantes", valor: "≈ 380.000" },
      { clave: "campus", valor: "Facultades de Buenos Aires" },
    ],
    WIK("University of Buenos Aires"), "confirmado", [], true),
  e("educacion-universidad-durban", "Universidad de KwaZulu-Natal", "educacion", "za", { ciudad: "Durban", lat: -29.87, lng: 30.3 },
    "La universidad más grande de la provincia de KwaZulu-Natal, creada en 2004 por la fusión de dos universidades históricas de Durban.",
    "2004",
    [
      { clave: "estudiantes", valor: "≈ 60.000" },
      { clave: "campus", valor: "Durban y Pietermaritzburg" },
    ],
    WIK("University of KwaZulu-Natal"), "confirmado", [], true),
  e("educacion-universidad-cubana", "Universidad de La Habana", "educacion", "cu", { ciudad: "La Habana", lat: 23.13, lng: -82.4 },
    "La universidad más antigua de Cuba, fundada en 1728. Su sede histórica en La Habana Vieja sigue siendo el centro de la universidad.",
    "1728",
    [
      { clave: "estudiantes", valor: "≈ 60.000" },
      { clave: "campus", valor: "La Habana Vieja" },
    ],
    WIK("University of Havana"), "confirmado", [], true),
  e("educacion-universidad-san-marcos", "Universidad Nacional Mayor de San Marcos", "educacion", "pe", { ciudad: "Lima", lat: -12.05, lng: -77.04 },
    "La universidad más antigua de América, fundada en 1551. Su sede principal, la Ciudad Universitaria de Lima, sigue siendo el corazón de la educación pública peruana.",
    "1551",
    [
      { clave: "estudiantes", valor: "≈ 40.000" },
      { clave: "antigüedad", valor: "1551, la universidad más antigua de América" },
    ],
    WIK("National University of San Marcos"), "confirmado", [], true),
];

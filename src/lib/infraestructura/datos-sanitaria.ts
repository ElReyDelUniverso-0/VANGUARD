// ═══════════════════════════════════════════════════════════════════
// v420.3 · VANGUARD INFRASTRUCTURE ATLAS — SANITARIA
// Grandes hospitales e instituciones sanitarias, documentados en fuentes
// públicas. Únicamente la infraestructura pública: nada de detalle
// operativo, de pacientes o de sistemas sensibles.
// ═══════════════════════════════════════════════════════════════════

import { e, type Infraestructura } from "./tipos";

const WIK = (nombre: string) => ({ nombre: `Wikipedia · «${nombre}» (fuente pública)`, url: `https://en.wikipedia.org/wiki/${nombre.replace(/ /g, "_")}`, licencia: "contenido de dominio público / libre" });

export const SANITARIA: Infraestructura[] = [
  e("sanitaria-hospital-johns-hopkins", "Hospital Johns Hopkins", "sanitaria", "us", { ciudad: "Baltimore, Maryland", lat: 39.29, lng: -76.62 },
    "El hospital universitario más famoso de Estados Unidos, fundado en 1889. Su conjunto de edificios en Baltimore acoge uno de los centros de investigación médica más grandes del país.",
    "1889",
    [
      { clave: "beds", valor: "≈ 1.800" },
      { clave: "investigación", valor: "centro médico universitario de referencia" },
    ],
    WIK("Johns Hopkins Hospital"), "confirmado", [], true),
  e("sanitaria-hospital-massachusetts", "Hospital General de Massachusetts", "sanitaria", "us", { ciudad: "Boston, Massachusetts", lat: 42.36, lng: -71.06 },
    "Uno de los hospitales más antiguos y prestigiosos de Estados Unidos, fundado en 1811. Es el hospital universitario de la Escuela de Medicina de Harvard.",
    "1811",
    [
      { clave: "beds", valor: "≈ 1.000" },
      { clave: "formación", valor: "hospital universitario de Harvard" },
    ],
    WIK("Massachusetts General Hospital"), "confirmado", [], true),
  e("sanitaria-hospital-charite", "Hospital de la Charité", "sanitaria", "de", { ciudad: "Berlín", lat: 52.52, lng: 13.38 },
    "El hospital más antiguo de Berlín, fundado en 1710. Es el hospital universitario de la Universidad de Humboldt y uno de los centros médicos más grandes de Alemania.",
    "1710",
    [
      { clave: "beds", valor: "≈ 1.400" },
      { clave: "antigüedad", valor: "1710, el hospital más antiguo de Berlín" },
    ],
    WIK("Charité"), "confirmado", [], true),
  e("sanitaria-hospital-aphp", "Asistencia Pública – Hospitales de París (AP-HP)", "sanitaria", "fr", { ciudad: "París", lat: 48.85, lng: 2.35 },
    "El grupo hospitalario público del área de París, que agrupa varios hospitales universitarios. Es uno de los conjuntos hospitalarios más grandes de Europa.",
    "1613",
    [
      { clave: "beds", valor: "≈ 10.000 (agrupación de hospitales)" },
      { clave: "ubicación", valor: "París y su área metropolitana" },
    ],
    WIK("Assistance publique – Hôpitaux de Paris"), "confirmado", [], true),
  e("sanitaria-hospital-la-princesa", "Hospital de la Princesa", "sanitaria", "es", { ciudad: "Madrid", lat: 40.44, lng: -3.68 },
    "El hospital universitario de referencia en el sur de Madrid, fundado en el siglo XVI. Es uno de los hospitales más grandes de España.",
    "1522",
    [
      { clave: "beds", valor: "≈ 1.000" },
      { clave: "antigüedad", valor: "fundado en 1522, el hospital más antiguo de Madrid" },
    ],
    WIK("Hospital Universitario La Princesa"), "confirmado", [], true),
  e("sanitaria-hospital-cuyo", "Hospital General de Valencia (Hospital de la Fe)", "sanitaria", "es", { ciudad: "Valencia", lat: 39.47, lng: -0.38 },
    "El hospital universitario de referencia de la ciudad de Valencia, fundado en el siglo XV. Es el hospital más antiguo de la ciudad.",
    "1459",
    [
      { clave: "beds", valor: "≈ 800" },
      { clave: "antigüedad", valor: "1459, el hospital más antiguo de Valencia" },
    ],
    WIK("Hospital General de Valencia"), "documentado", [], true),
  e("sanitaria-hospital-del-niño", "Hospital del Niño de Panamá", "sanitaria", "pa", { ciudad: "Ciudad de Panamá", lat: 8.98, lng: -79.5 },
    "El hospital pediátrico más importante de Panamá. Atiende a la infancia del país y forma parte del sistema público de salud.",
    "1965",
    [
      { clave: "especialidad", valor: "hospital pediátrico de referencia" },
      { clave: "ubicación", valor: "Ciudad de Panamá" },
    ],
    WIK("Hospital del Niño"), "documentado", [], true),
  e("sanitaria-hospital-calderon", "Hospital Calderón Guardia", "sanitaria", "cr", { ciudad: "San José", lat: 9.92, lng: -84.08 },
    "El hospital público más grande de Costa Rica, en el centro de San José. Es el hospital de referencia del Sistema Nacional de Salud del país.",
    "1940",
    [
      { clave: "beds", valor: "≈ 700" },
      { clave: "ubicación", valor: "San José, Costa Rica" },
    ],
    WIK("Hospital Calderón Guardia"), "por verificar", [], true),
  e("sanitaria-hospital-cuba-principe", "Hospital Universitario de la Plata", "sanitaria", "ar", { ciudad: "La Plata", lat: -34.59, lng: -57.95 },
    "El hospital universitario de la ciudad de La Plata, en Argentina. Es el hospital de referencia de la provincia de Buenos Aires.",
    "1880",
    [
      { clave: "beds", valor: "≈ 600" },
      { clave: "ubicación", valor: "La Plata, Argentina" },
    ],
    WIK("Hospital de La Plata"), "por verificar", [], true),
  e("sanitaria-hospital-march", "Hospital General de Santo Domingo", "sanitaria", "do", { ciudad: "Santo Domingo", lat: 18.49, lng: -69.89 },
    "El hospital público más grande de la República Dominicana. Es el hospital de referencia de la capital y su área metropolitana.",
    "1552",
    [
      { clave: "beds", valor: "≈ 1.000" },
      { clave: "antigüedad", valor: "el hospital más antiguo de América en funcionamiento continuo" },
    ],
    WIK("Hospital General de Santo Domingo"), "por verificar", [], true),
  e("sanitaria-hospital-cincinnati", "Hospital de Cincinnati (Cincinnati Children's)", "sanitaria", "us", { ciudad: "Cincinnati, Ohio", lat: 39.1, lng: -84.5 },
    "El hospital infantil más grande de Estados Unidos. Es un hospital universitario de referencia para la infancia en el medio oeste.",
    "1883",
    [
      { clave: "especialidad", valor: "hospital infantil de referencia" },
      { clave: "beds", valor: "≈ 600" },
    ],
    WIK("Cincinnati Children's Hospital"), "confirmado", [], true),
  e("sanitaria-hospital-sant-pau", "Hospital de Sant Pau", "sanitaria", "es", { ciudad: "Barcelona", lat: 41.41, lng: 2.17 },
    "El hospital de la Santa Creu y Sant Pau, en Barcelona. Su conjunto modernista, construido a principios del siglo XX, es un monumento y sigue funcionando como hospital.",
    "1902",
    [
      { clave: "beds", valor: "≈ 600" },
      { clave: "arquitectura", valor: "conjunto modernista del hospital" },
    ],
    WIK("Hospital de Sant Pau"), "confirmado", [], true),
  e("sanitaria-hospital-general-mexico", "Hospital General de México", "sanitaria", "mx", { ciudad: "Ciudad de México", lat: 19.43, lng: -99.1 },
    "El hospital general de referencia de la Ciudad de México. Es el hospital público más grande de la capital y forma parte del sistema nacional de salud.",
    "1866",
    [
      { clave: "beds", valor: "≈ 700" },
      { clave: "ubicación", valor: "Ciudad de México" },
    ],
    WIK("General Hospital of Mexico"), "por verificar", [], true),
  e("sanitaria-hospital-bangkok", "Hospital Siriraj", "sanitaria", "th", { ciudad: "Bangkok", lat: 13.75, lng: 100.49 },
    "El hospital más antiguo y más grande de Tailandia, fundado en 1888. Es el hospital universitario de la Facultad de Medicina de la Universidad de Mahidol.",
    "1888",
    [
      { clave: "beds", valor: "≈ 1.400" },
      { clave: "antigüedad", valor: "1888, el hospital más antiguo de Tailandia" },
    ],
    WIK("Siriraj Hospital"), "confirmado", [], true),
];

"use client";

// v67.0 EL HANGAR — ISLA DEL ORÁCULO (recompensa secreta compartida).
// El easter egg vive en DOS entradas: caminar hasta el extremo norte del
// hangar 3D, o teclear la palabra secreta en cualquier pantalla (el morse
// del hangar la delata). La recompensa de +250ⓒ solo se paga UNA vez.

const KEY = "vanguard-oraculo-v67";

export function oraculoClaimed(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

/** Devuelve true la primera vez (y solo la primera) que se reclama la isla. */
export function claimOraculo(): boolean {
  if (oraculoClaimed()) return false;
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    /* noop */
  }
  return true;
}

export const ORACULO_SECRET = "ORACULO";

// Documentos clasificados reales de historia geopolítica que custodia la isla
export const ORACULO_DOCS = [
  {
    id: "doc-vk",
    title: "MEMORANDUM VASILIEV-KRASNOV · 1983",
    body: "Durante Able Archer 83, un oficial soviético de contrainteligencia creyó que el ejercicio OTAN era la cubierta de un primer ataque nuclear real. Su informe llegó a Moscú en 48 horas. El mundo estuvo a menos de una decisión de la guerra. Desclasificado parcialmente en 2015.",
    tag: "PARCIAL 🟡",
  },
  {
    id: "doc-colossus",
    title: "OPERACIÓN COLOSSUS · 1944",
    body: "Los aliados ocultaron durante 30 años que habían roto Lorenz (no Enigma) con la primera computadora programable del mundo. Los alemanes jamás supieron por qué sus órdenes llegaban leídas al otro bando. La criptografía moderna nace aquí.",
    tag: "REAL 🟢",
  },
  {
    id: "doc-galapagos",
    title: "EL PACTO DE LA ISLA VACÍA · 1971",
    body: "Cuando la ONU votó retirar la soberanía colonial de un archipiélago remoto, tres potencias firmaron en secreto no instalar bases hasta 2001. El documento original nunca se publicó: solo se conoce por las memorias de un negociador fallecido.",
    tag: "MITO 🔴",
  },
  {
    id: "doc-zimmermann",
    title: "TELEGRAMA ZIMMERMANN · 1917",
    body: "El cable cifrado que ofrecía México recuperar Texas, Arizona y Nuevo México si entraba en guerra contra EE.UU. Los británicos lo interceptaron, lo descifraron y lo filtraron sin revelar que espiaban cables diplomáticos: crearon una 'copia en México' para encubrir la fuente.",
    tag: "REAL 🟢",
  },
];

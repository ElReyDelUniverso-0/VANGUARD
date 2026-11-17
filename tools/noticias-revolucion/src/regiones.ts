/** Misión 003 · Macrorregiones editoriales por país — para filtros y organización. */
const REGIONES: Record<string, string[]> = {
  AMERICA_LATINA: ["AR","BO","BR","CL","CO","CR","CU","DO","EC","SV","GT","HN","MX","NI","PA","PY","PE","PR","UY","VE"],
  AMERICA_DEL_NORTE: ["US","CA"],
  EUROPA: ["DE","FR","IT","GB","PT","ES","NL","BE","PL","CZ","AT","CH","SE","NO","FI","DK","IE","GR","UA","RU","BY","MD","GE","AM","AZ"],
  ORIENTE_MEDIO: ["IL","PS","LB","SY","IQ","IR","SA","YE","JO","TR","EG"],
  AFRICA: ["LY","TN","DZ","MA","SD","ET","ER","SO","NG","ML","BF","NE","TD","CF","CD","MW","ZM","MZ","ZA","KE"],
  ASIA_PACIFICO: ["CN","KP","KR","JP","IN","PK","AF","LK","BD","MM","TH","VN","ID","PH","AU","NZ","KZ"],
};
const INDICE: Record<string, string> = Object.fromEntries(
  Object.entries(REGIONES).flatMap(([reg, isos]) => isos.map((i) => [i, reg]))
);
export const ETIQUETAS_REGION: Record<string, string> = {
  AMERICA_LATINA: "América Latina", AMERICA_DEL_NORTE: "Norteamérica", EUROPA: "Europa",
  ORIENTE_MEDIO: "Oriente Medio", AFRICA: "África", ASIA_PACIFICO: "Asia-Pacífico", SIN_REGION: "Sin región",
};
export function regionDe(iso?: string | null): string {
  if (!iso) return "SIN_REGION";
  return INDICE[iso.trim().toUpperCase()] ?? "SIN_REGION";
}
export function regionesDisponibles(): string[] { return Object.keys(REGIONES); }

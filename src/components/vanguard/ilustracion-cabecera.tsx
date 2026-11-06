// ============================================================
// v360.0 LA CASA ILUSTRADA — las cabeceras server dejan el negro
// plano: la biblioteca de ilustraciones de la casa
// (public/ilustraciones, más de 100 piezas propias) entra como
// BAÑO DE LUZ lateral en las cabeceras de las páginas server.
// Técnica: un div con backgroundImage — sin <img>, sin layout
// shift, sin JS, sin peticiones nuevas (la pieza ya es estática
// en /public). aria-hidden, pointer-events none y opacidad baja
// con máscara: decora JAMÁS estorba la lectura. La intensidad y
// el recorte viven en .ilu-cabecera (globals.css) — móvil incluido.
// ============================================================
export function IlustracionCabecera({ src }: { src: string }) {
  return <div aria-hidden className="ilu-cabecera" style={{ backgroundImage: `url(${src})` }} />;
}

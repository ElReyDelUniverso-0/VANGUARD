// v204.0 EL ESCUDO — JSON-LD a prueba de XSS.
// JSON.stringify NO escapa `<`: un titular que contenga la secuencia
// `</script>` (p.ej. un cable de una fuente externa) podría romper el
// <script type="application/ld+json"> y ejecutar código en la página.
// Aquí `<` siempre viaja como \u003c — JSON válido, HTML inmune.
export function jsonLdSeguro(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

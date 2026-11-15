// v402.4 — franja ilustrada de sección (serie noir de la casa). Marca
// «ILUSTRACIÓN» a la vista: es ambiente, nunca una foto del hecho narrado.
// Servidor puro, imagen perezosa: no pesa hasta que asoma en pantalla.
export function BannerIlustracion({ src, sello, alt = "" }: { src: string; sello: string; alt?: string }) {
  return (
    <figure className="vx-banner-ilus">
      <img src={src} alt={alt} loading="lazy" decoding="async" width={1408} height={704} />
      <figcaption>
        <span className="vx-banner-sello">{sello}</span>
        <span className="vx-banner-marca">Ilustración</span>
      </figcaption>
    </figure>
  );
}

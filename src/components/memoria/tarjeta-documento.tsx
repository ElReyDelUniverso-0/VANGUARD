// v419.0 · MEMORY ARCHIVE — la tarjeta de un documento
// Server component. Si los derechos no permiten la imagen, la tarjeta lo dice
// en el hueco de la imagen: nunca se enseña una miniatura «prestada».

import Link from "next/link";
import type { Documento } from "@/lib/memoria/tipos";
import { CLAVE_TIPO, fechaLegible } from "@/lib/memoria/tipos";
import { veredicto } from "@/lib/memoria/derechos";
import { fuente } from "@/lib/memoria/fuentes";

export function SelloDerechos({ estado }: { estado: Documento["derechos"] }) {
  const v = veredicto(estado);
  return (
    <span className={`vx-mem-sello vx-mem-sello--${estado}`} title={v.explicacion}>
      {v.etiqueta}
    </span>
  );
}

export function TarjetaDocumento({ documento, papel }: { documento: Documento; papel?: string }) {
  const f = fuente(documento.fuente);
  return (
    <article className="vx-mem-tarjeta">
      <Link href={`/memoria/documento/${documento.fuente}/${encodeURIComponent(documento.id)}`} className="vx-mem-tarjeta__marco" aria-label={`Abrir la ficha de ${documento.titulo}`}>
        {documento.imagen ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={documento.imagen} alt={documento.titulo} loading="lazy" decoding="async" />
        ) : (
          <span className="vx-mem-tarjeta__sinimagen">
            <span>Imagen no publicada</span>
            <span>{veredicto(documento.derechos).etiqueta.toLowerCase()}</span>
          </span>
        )}
      </Link>
      <div className="vx-mem-tarjeta__cuerpo">
        <h3 className="vx-mem-tarjeta__titulo">
          <Link href={`/memoria/documento/${documento.fuente}/${encodeURIComponent(documento.id)}`} style={{ color: "inherit", textDecoration: "none" }}>
            {documento.titulo}
          </Link>
        </h3>
        {papel ? <p style={{ margin: 0, fontSize: 12.5, color: "#a1a1aa", lineHeight: 1.5 }}>{papel}</p> : null}
        <p className="vx-mem-meta">
          <span>{f.nombre}</span>
          <span>{fechaLegible(documento.fecha)}</span>
          <span>{CLAVE_TIPO[documento.tipo]}</span>
        </p>
        {documento.autor ? <p className="vx-mem-meta">{documento.autor}</p> : <p className="vx-mem-meta">autor sin declarar</p>}
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <SelloDerechos estado={documento.derechos} />
          <a href={documento.urlOriginal} target="_blank" rel="noopener noreferrer" className="vx-mem-enlace">
            Ver en la fuente ↗
          </a>
        </div>
      </div>
    </article>
  );
}

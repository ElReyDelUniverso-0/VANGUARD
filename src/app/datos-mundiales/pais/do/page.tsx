import PaginaPais, { generateMetadata as gm } from "../[iso]/page";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// La puerta fija de Dominicana conserva la misma consulta y el mismo contrato
// que la ficha dinámica; no crea otra hoja de datos ni pierde los filtros.
export const generateMetadata = ({ searchParams }: Props) =>
  gm({ params: Promise.resolve({ iso: "do" }), searchParams });

export default function PaginaPaisDO({ searchParams }: Props) {
  return <PaginaPais params={Promise.resolve({ iso: "do" })} searchParams={searchParams} />;
}

import PaginaPais, { generateMetadata as gm } from "../[iso]/page";

export const generateMetadata = () =>
  gm({ params: Promise.resolve({ iso: "do" }) });

export default function PaginaPaisDO() {
  return <PaginaPais params={Promise.resolve({ iso: "do" })} />;
}

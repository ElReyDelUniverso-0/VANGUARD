"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const MenuVanguardNovedades = dynamic(
  () => import("@/components/vanguard/menu-vanguard-novedades").then((m) => m.MenuVanguardNovedades),
  { ssr: false }
);

export function MenuVanguardMount() {
  const [montado, setMontado] = useState(false);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const abrir = () => {
      setMontado(true);
      setAbierto(true);
    };
    window.addEventListener("vanguard:menu-novedades", abrir);
    return () => window.removeEventListener("vanguard:menu-novedades", abrir);
  }, []);

  if (!montado) return null;
  return <MenuVanguardNovedades open={abierto} onClose={() => setAbierto(false)} />;
}

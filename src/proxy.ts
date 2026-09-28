import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// v68.0 CONTROL DIRECTO — Next 16 usa proxy.ts (antes middleware.ts).
// La portada "/" sirve la experiencia completa en public/nexo.html.
// Todo lo demas queda intacto; la app clasica vive en /clasico.
export default function proxy(req: NextRequest) {
  if (req.nextUrl.pathname === "/") {
    return NextResponse.rewrite(new URL("/nexo.html", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/",
};

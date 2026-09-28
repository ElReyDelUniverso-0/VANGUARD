import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// v68.0 CONTROL DIRECTO — la portada "/" sirve la experiencia completa en
// public/nexo.html. Todo lo demas queda intacto; la app clasica vive en /clasico.
export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/") {
    return NextResponse.rewrite(new URL("/nexo.html", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/",
};

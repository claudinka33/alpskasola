import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "alpska_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Zaščiti vse /admin strani razen prijavne strani
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const session = req.cookies.get(COOKIE_NAME)?.value;
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

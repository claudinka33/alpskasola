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

  // Pot posredujemo naprej, da lahko postavitev preveri pravice za to stran
  const glave = new Headers(req.headers);
  glave.set("x-pot", pathname);
  return NextResponse.next({ request: { headers: glave } });
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

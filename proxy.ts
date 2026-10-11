import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "./lib/session";

const LOGIN_PAGE = "/admin/login";
const PUBLIC_API = ["/api/admin/login", "/api/admin/logout"];

function next() {
  const res = NextResponse.next();
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  // API admin: belum login -> 401 JSON
  if (pathname.startsWith("/api/")) {
    if (PUBLIC_API.includes(pathname) || session) return next();
    return NextResponse.json(
      { error: "unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  // Halaman login: kalau sudah login, lempar ke dashboard
  if (pathname === LOGIN_PAGE) {
    return session ? redirectTo(request, "/admin") : next();
  }

  // Halaman admin lainnya: wajib login
  if (!session) {
    const res = redirectTo(request, LOGIN_PAGE);
    if (token) res.cookies.delete(SESSION_COOKIE); // cookie kedaluwarsa/palsu
    return res;
  }

  return next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
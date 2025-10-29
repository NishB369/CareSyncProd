import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const careSyncAccessToken = request.cookies.get("careSyncAccessToken")?.value;
  const isLoggedIn = !!careSyncAccessToken;

  const currentPath = request.nextUrl.pathname;

  if (!isLoggedIn) {
    if (currentPath === "/auth/login/manager") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/auth/login/manager", request.url));
  }

  if (isLoggedIn) {
    if (currentPath === "/auth/login/manager") {
      return NextResponse.redirect(new URL("/manager/home", request.url));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.gif|_next/data).*)",
  ],
};

import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const careSyncAccessToken = request.cookies.get("careSyncAccessToken")?.value;
  const isLoggedIn = !!careSyncAccessToken;
  const currentPath = request.nextUrl.pathname;

  const publicRoutes = [
    "/",
    "/landingpage",
    "/auth/login/manager",
    "/alertpage",
    "/documentation",
  ];

  if (!isLoggedIn) {
    if (publicRoutes.includes(currentPath)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/landingpage", request.url));
  }

  // If logged in
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

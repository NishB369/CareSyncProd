// import { NextRequest, NextResponse } from "next/server";

// export function middleware(request: NextRequest) {
//   const careSyncAccessToken = request.cookies.get("careSyncAccessToken")?.value;
//   const isLoggedIn = !!careSyncAccessToken;
//   const currentPath = request.nextUrl.pathname;

//   const publicRoutes = [
//     "/",
//     "/landingpage",
//     "/auth/login/manager",
//     "/alertpage",
//     "/documentation",
//   ];

//   if (!isLoggedIn) {
//     if (publicRoutes.includes(currentPath)) {
//       return NextResponse.next();
//     }
//     return NextResponse.redirect(new URL("/landingpage", request.url));
//   }

//   // If logged in
//   if (isLoggedIn) {
//     if (currentPath === "/auth/login/manager") {
//       return NextResponse.redirect(new URL("/manager/home", request.url));
//     }
//     return NextResponse.next();
//   }
// }

// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.gif|_next/data).*)",
//   ],
// };


import { NextRequest, NextResponse } from "next/server";

const publicRoutes = [
  "/",
  "/landingpage",
  "/auth/login/manager",
  "/alertpage",
  "/documentation",
];

export function middleware(request: NextRequest) {
  const careSyncAccessToken = request.cookies.get("careSyncAccessToken")?.value;
  const isLoggedIn = !!careSyncAccessToken;
  const currentPath = request.nextUrl.pathname;

  // Allow access to public routes without authentication
  if (publicRoutes.some((route) => currentPath === route || currentPath.startsWith(`${route}/`))) {
    if (isLoggedIn && currentPath === "/auth/login/manager") {
      // Redirect logged-in users away from login page
      return NextResponse.redirect(new URL("/manager/home", request.url));
    }
    return NextResponse.next();
  }

  // For protected routes
  if (!isLoggedIn) {
    // Redirect unauthenticated users to login
    return NextResponse.redirect(new URL("/auth/login/manager", request.url));
  }

  // Authenticated users can access protected routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.gif|_next/data).*)",
  ],
};
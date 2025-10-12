import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(req: NextRequest) {

  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Auth redirects
  if (!token && pathname === "/api/auth/signout") {
    return NextResponse.redirect(new URL("/api/auth/signin", req.url));
  }
  if (token && pathname === "/api/auth/signin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // These add the headers to responses
  const res = NextResponse.next();
  
  res.headers.set("x-app-version", process.env.APP_VERSION || "unknown");
  res.headers.set("x-app-env", process.env.NODE_ENV || "dev");
  
  return res;
}

// Limit scope
export const config = { matcher: ["/((?!_next|favicon.ico).*)"] };
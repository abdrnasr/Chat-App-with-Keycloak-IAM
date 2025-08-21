import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET, }); 
  const { pathname } = req.nextUrl;

  console.log(req.url,req.nextUrl);

  if (!token && pathname === "/api/auth/signout") {
    return NextResponse.redirect(new URL("/api/auth/signin", req.url));
  }

  if (token && pathname === "/api/auth/signin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

// Limit to API routes (adjust if you also want to guard pages)
export const config = {
  matcher: ["/api/:path*"],
};
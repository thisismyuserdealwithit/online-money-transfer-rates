import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const match = /^\/corridors\/([^/]+)\/?$/.exec(request.nextUrl.pathname);
  if (!match) return NextResponse.next();
  const target = request.nextUrl.clone();
  target.pathname = `/${match[1]}`;
  return NextResponse.redirect(target, 308);
}

export const config = { matcher: "/corridors/:path*" };

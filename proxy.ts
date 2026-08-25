import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/openapi.json") {
    const target = request.nextUrl.clone();
    target.pathname = "/api/discovery/openapi";
    return NextResponse.rewrite(target);
  }
  if (request.nextUrl.pathname === "/apis.json") {
    const target = request.nextUrl.clone();
    target.pathname = "/api/discovery/apis";
    return NextResponse.rewrite(target);
  }
  if (request.nextUrl.pathname === "/omt-rates.postman_collection.json") {
    const target = request.nextUrl.clone();
    target.pathname = "/api/discovery/postman";
    return NextResponse.rewrite(target);
  }
  if (request.nextUrl.pathname === "/.well-known/api-catalog") {
    const target = request.nextUrl.clone();
    target.pathname = "/api/discovery/catalog";
    return NextResponse.rewrite(target);
  }
  if (request.nextUrl.pathname === "/.well-known/apis.json") {
    const target = request.nextUrl.clone();
    target.pathname = "/api/discovery/apis-well-known";
    return NextResponse.rewrite(target);
  }
  const match = /^\/corridors\/([^/]+)\/?$/.exec(request.nextUrl.pathname);
  if (!match) return NextResponse.next();
  const target = request.nextUrl.clone();
  target.pathname = `/${match[1]}`;
  return NextResponse.redirect(target, 308);
}

export const config = {
  matcher: [
    "/corridors/:path*",
    "/.well-known/:path*",
    "/openapi.json",
    "/apis.json",
    "/omt-rates.postman_collection.json",
  ],
};

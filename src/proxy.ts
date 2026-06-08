import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy skeleton for future authentication.
 * Phase 1: all routes pass through without enforcement.
 */
export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images).*)"],
};

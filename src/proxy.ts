import { NextResponse, type NextRequest } from "next/server";
import { decrypt } from "@/server/session";
import {
  homeForRole,
  storeAdminRole,
  storeManagementRole,
} from "@/types/dashboard";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await decrypt(request.cookies.get("session")?.value);
  const isRead = request.method === "GET" || request.method === "HEAD";

  if (pathname.startsWith("/api/")) {
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.next();
  }

  const blockedAdmin = pathname.startsWith("/store-admin") && session?.role !== storeAdminRole;
  const blockedManagement =
    pathname.startsWith("/store-managment") && session?.role !== storeManagementRole;

  if (blockedAdmin || blockedManagement) {
    if (!isRead) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const destination = session ? homeForRole(session.role) : "/";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (!isRead) return NextResponse.next();

  if (pathname === "/" && session) {
    return NextResponse.redirect(new URL(homeForRole(session.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

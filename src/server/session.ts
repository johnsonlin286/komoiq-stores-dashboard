import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { isSessionRole, type CurrentUser } from "@/types/dashboard";

const COOKIE_NAME = "session";
const MAX_AGE_SECONDS = 60 * 60 * 8;

function getKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET is missing or too short.");
  }

  return new TextEncoder().encode(secret);
}

export async function encrypt(user: CurrentUser) {
  return new SignJWT({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getKey());
}

export async function decrypt(token: string | undefined): Promise<CurrentUser | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getKey(), {
      algorithms: ["HS256"],
    });

    if (
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      !isSessionRole(payload.role)
    ) {
      return null;
    }

    return {
      id: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export async function createSession(user: CurrentUser) {
  const token = await encrypt(user);
  const cookieStore = await cookies();

  // `Secure` cookies are silently dropped by the browser over plain HTTP —
  // no error anywhere, the Set-Cookie header is just ignored, which looks
  // exactly like "login succeeds then immediately bounces back with no
  // error" (the middleware sees no session cookie on the next request).
  // NODE_ENV is always "production" in the Docker image regardless of
  // whether TLS is actually in front of it, so it can't be used to decide
  // this — use the same ENABLE_SECURE_HEADERS flag as next.config.ts's HSTS
  // header instead (set it once a reverse proxy/ELB actually terminates TLS).
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.ENABLE_SECURE_HEADERS === "true",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

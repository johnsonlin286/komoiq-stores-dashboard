import "server-only";

import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { firebaseEnv } from "@/lib/firebase-config";

const firebaseCertificates = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
);

export type VerifiedFirebaseUser = {
  uid: string;
  email: string;
  name: string;
  role: string | null;
};

export async function verifyFirebaseIdToken(idToken: string) {
  const projectId = firebaseEnv.projectId;
  if (!projectId) {
    throw new Error("Firebase project id is missing.");
  }

  const { payload } = await jwtVerify(idToken, firebaseCertificates, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
    algorithms: ["RS256"],
  });

  return toVerifiedUser(payload);
}

function toVerifiedUser(payload: JWTPayload): VerifiedFirebaseUser {
  if (typeof payload.sub !== "string" || payload.sub.length === 0) {
    throw new Error("Firebase token has no user id.");
  }

  if (typeof payload.email !== "string" || payload.email.length === 0) {
    throw new Error("Firebase token has no email.");
  }

  const name = typeof payload.name === "string" && payload.name.trim().length > 0
    ? payload.name.trim()
    : payload.email;

  const role = typeof payload.role === "string" ? payload.role : null;

  return {
    uid: payload.sub,
    email: payload.email,
    name,
    role,
  };
}

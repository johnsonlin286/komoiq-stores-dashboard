import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { firebaseClientConfig } from "@/lib/firebase-config";

export function getFirebaseAuth() {
  const app = getApps()[0] ?? initializeApp(firebaseClientConfig());
  return getAuth(app);
}

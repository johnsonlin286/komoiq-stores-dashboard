export const firebaseEnv = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
} as const;

const requiredKeys = [
  "apiKey",
  "authDomain",
  "projectId",
  "appId",
] as const satisfies readonly (keyof typeof firebaseEnv)[];

export function missingFirebaseEnv() {
  return requiredKeys.filter((key) => !firebaseEnv[key]);
}

export function firebaseClientConfig() {
  const missing = missingFirebaseEnv();
  if (missing.length > 0) {
    throw new Error(`Firebase config is incomplete: ${missing.join(", ")}`);
  }

  return {
    apiKey: firebaseEnv.apiKey!,
    authDomain: firebaseEnv.authDomain!,
    projectId: firebaseEnv.projectId!,
    storageBucket: firebaseEnv.storageBucket,
    messagingSenderId: firebaseEnv.messagingSenderId,
    appId: firebaseEnv.appId!,
  };
}

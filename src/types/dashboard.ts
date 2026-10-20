export const storeAdminRole = "store-admin" as const;
export const storeManagementRole = "store-management" as const;
// Demo-only role (see establishDemoSession in app/actions/auth.ts): logs in
// via AUTH_EMAIL/AUTH_PASSWORD in .env.local instead of Firebase, and can
// open both /store-admin and /store-managment without switching accounts.
export const superAdminRole = "super-admin" as const;

// Roles a Firebase ID token can carry (its `role` custom claim).
export const appRoles = [storeAdminRole, storeManagementRole] as const;
export type AppRole = (typeof appRoles)[number];

// Every role a session cookie can carry, Firebase-issued or demo.
export const sessionRoles = [storeAdminRole, storeManagementRole, superAdminRole] as const;
export type SessionRole = (typeof sessionRoles)[number];

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: SessionRole;
};

export function isAppRole(value: unknown): value is AppRole {
  return value === storeAdminRole || value === storeManagementRole;
}

export function isSessionRole(value: unknown): value is SessionRole {
  return isAppRole(value) || value === superAdminRole;
}

export function homeForRole(role: SessionRole) {
  if (role === storeManagementRole) return "/store-managment";
  return "/store-admin";
}

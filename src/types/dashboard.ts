export const storeAdminRole = "store-admin" as const;
export const storeManagementRole = "store-management" as const;

export const appRoles = [storeAdminRole, storeManagementRole] as const;

export type AppRole = (typeof appRoles)[number];

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: AppRole;
};

export function isAppRole(value: unknown): value is AppRole {
  return value === storeAdminRole || value === storeManagementRole;
}

export function homeForRole(role: AppRole) {
  if (role === storeAdminRole) return "/store-admin";
  return "/store-managment";
}

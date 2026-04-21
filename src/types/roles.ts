import { z } from "zod";

export const UserRoleSchema = z.enum([
  "SUPER_ADMIN",
  "STORE_OWNER",
  "CUSTOMER",
]);

export type IUserRole = z.infer<typeof UserRoleSchema>;
export type UserRole = IUserRole;

export const USER_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  STORE_OWNER: "STORE_OWNER",
  CUSTOMER: "CUSTOMER",
} as const satisfies Record<IUserRole, IUserRole>;

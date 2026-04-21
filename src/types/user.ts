import { z } from "zod";
import { USER_ROLES, UserRoleSchema, type IUserRole } from "./roles";

const optionalStringField = z.string().min(1).nullable().optional();

export const BaseUserSchema = z.object({
  uid: z.string().min(1, "uid is required"),
  email: z.string().email("email must be valid").nullable(),
  displayName: optionalStringField,
  photoURL: optionalStringField,
  role: UserRoleSchema,
});

export const SuperAdminUserSchema = BaseUserSchema.extend({
  role: z.literal(USER_ROLES.SUPER_ADMIN),
  storeId: z.undefined().optional(),
});

export const StoreOwnerUserSchema = BaseUserSchema.extend({
  role: z.literal(USER_ROLES.STORE_OWNER),
  storeId: z.string().min(1, "storeId is required for STORE_OWNER"),
});

export const CustomerUserSchema = BaseUserSchema.extend({
  role: z.literal(USER_ROLES.CUSTOMER),
  storeId: z.string().min(1).optional(),
});

export const UserSchema = z.discriminatedUnion("role", [
  SuperAdminUserSchema,
  StoreOwnerUserSchema,
  CustomerUserSchema,
]);

export interface IUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  role: IUserRole;
  storeId?: string;
}

export interface ISuperAdminUser extends IUser {
  role: typeof USER_ROLES.SUPER_ADMIN;
  storeId?: undefined;
}

export interface IStoreOwnerUser extends IUser {
  role: typeof USER_ROLES.STORE_OWNER;
  storeId: string;
}

export interface ICustomerUser extends IUser {
  role: typeof USER_ROLES.CUSTOMER;
  storeId?: string;
}

export type IUserRecord = z.infer<typeof UserSchema>;

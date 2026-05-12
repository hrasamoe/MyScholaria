export interface UserRole {
  id: string; // uuid
  user_id: string; // FK users.id
  role: UserRoleEnum;
  created_at: Date;
}

export enum UserRoleEnum {
  SUPER_ADMIN = "super_admin",
  ESTABLISHMENT_ADMIN = "establishment_admin",
  TEACHER = "teacher",
  STUDENT = "student",
  PARENT = "parent",
  STAFF = "staff",
  LIBRARIAN = "librarian",
}

export interface CreateUserRoleInput extends Omit<UserRole, "id" | "created_at"> {}
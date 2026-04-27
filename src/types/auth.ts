export type UserRole = "ADMIN" | "TEACHER";

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: "Bearer";
  user: AuthUser;
};

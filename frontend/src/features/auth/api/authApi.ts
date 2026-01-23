import type { AuthCredentials, AuthUser } from "../types";

export async function login(credentials: AuthCredentials): Promise<AuthUser> {
  return {
    id: "user-1",
    name: "Mung User",
    email: credentials.email,
  };
}

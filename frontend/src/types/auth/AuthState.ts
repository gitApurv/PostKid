import type { LoginRequest } from "./LoginRequest";
import type { RegisterRequest } from "./RegisterRequest";
import type { UserItem } from "./UserItem";

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: UserItem | null;

  loginAction: (
    req: LoginRequest,
  ) => Promise<{ success: boolean; error?: string }>;

  registerAction: (
    req: RegisterRequest,
  ) => Promise<{ success: boolean; error?: string }>;

  logoutAction: () => Promise<{ success: boolean; error?: string }>;
}

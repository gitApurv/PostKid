import type { LoginRequest } from "./LoginRequest";
import type { RegisterRequest } from "./RegisterRequest";

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: { name: string; email: string; avatar: string } | null;
  login: (email: string, username: string) => void;
  logout: () => void;
  loginAction: (req: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  registerAction: (req: RegisterRequest) => Promise<{ success: boolean; error?: string }>;
  logoutAction: () => Promise<void>;
}
import { create } from "zustand";
import md5 from "blueimp-md5";
import type AuthState from "../types/state/AuthState";
import AuthService from "../service/AuthService";

const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: !!localStorage.getItem("accessToken"),
  currentUser: (() => {
    const user = localStorage.getItem("currentUser");
    if (user) {
      try {
        return JSON.parse(user);
      } catch {
        return null;
      }
    }
    return null;
  })(),

  // Mutations
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setCurrentUser: (currentUser) => set({ currentUser }),

  // Actions
  loginAction: async (req) => {
    const response = await AuthService.login(req);
    if (response.success && response.data) {
      const authData = response.data;
      localStorage.setItem("accessToken", authData.accessToken);
      localStorage.setItem("refreshToken", authData.refreshToken);

      const hash = md5(authData.email.trim().toLowerCase());
      const avatarUrl = `https://www.gravatar.com/avatar/${hash}?d=identicon`;
      const userObj = {
        name: authData.username,
        email: authData.email,
        avatar: avatarUrl,
      };
      localStorage.setItem("currentUser", JSON.stringify(userObj));

      get().setAuthenticated(true);
      get().setCurrentUser(userObj);
      return { success: true };
    } else {
      return {
        success: false,
        error: response.error || "Login failed.",
      };
    }
  },

  registerAction: async (req) => {
    const response = await AuthService.register(req);
    if (response.success && response.data) {
      const authData = response.data;
      localStorage.setItem("accessToken", authData.accessToken);
      localStorage.setItem("refreshToken", authData.refreshToken);

      const hash = md5(authData.email.trim().toLowerCase());
      const avatarUrl = `https://www.gravatar.com/avatar/${hash}?d=identicon`;
      const userObj = {
        name: authData.username,
        email: authData.email,
        avatar: avatarUrl,
      };
      localStorage.setItem("currentUser", JSON.stringify(userObj));

      get().setAuthenticated(true);
      get().setCurrentUser(userObj);
      return { success: true };
    } else {
      return {
        success: false,
        error: response.error || "Registration failed.",
      };
    }
  },

  logoutAction: async () => {
    const refreshToken = localStorage.getItem("refreshToken") || "";
    const response = await AuthService.logout(refreshToken);

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("currentUser");

    get().setAuthenticated(false);
    get().setCurrentUser(null);

    if (response.success) {
      return { success: true };
    } else {
      return { success: false, error: response.error };
    }
  },
}));

export default useAuthStore;

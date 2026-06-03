import { create } from "zustand";
import md5 from "blueimp-md5";

interface AuthState {
  isAuthenticated: boolean;
  currentUser: { name: string; email: string; avatar: string } | null;
  login: (email: string, username: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
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
  login: (email, username) => {
    const hash = md5(email.trim().toLowerCase());
    const avatarUrl = `https://www.gravatar.com/avatar/${hash}?d=identicon`;
    const userObj = { name: username, email, avatar: avatarUrl };
    localStorage.setItem("currentUser", JSON.stringify(userObj));
    set({
      isAuthenticated: true,
      currentUser: userObj,
    });
  },
  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("currentUser");
    set({ isAuthenticated: false, currentUser: null });
  },
}));

import { create } from "zustand";
import md5 from "blueimp-md5";
import type { AuthState } from "../types/AuthState";
import api from "../../config/axios";
import axios from "axios";
import type { ApiResponse } from "../../common/types/ApiResponse";
import type { AuthResponse } from "../types/AuthResponse";

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

  loginAction: async (req) => {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>(
        "/auth/login",
        req,
      );
      if (response.data.success && response.data.data) {
        const authData = response.data.data;
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

        set({
          isAuthenticated: true,
          currentUser: userObj,
        });
        return { success: true };
      } else {
        return {
          success: false,
          error: response.data.message || "Login failed.",
        };
      }
    } catch (err: unknown) {
      console.error("Login error: ", err);
      let errMsg = "An error occurred during login.";
      if (axios.isAxiosError<ApiResponse<AuthResponse>>(err)) {
        errMsg = err.response?.data?.message || err.message || errMsg;
      } else if (err instanceof Error) {
        errMsg = err.message;
      }
      return { success: false, error: errMsg };
    }
  },

  registerAction: async (req) => {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>(
        "/auth/register",
        req,
      );
      if (response.data.success && response.data.data) {
        const authData = response.data.data;
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

        set({
          isAuthenticated: true,
          currentUser: userObj,
        });
        return { success: true };
      } else {
        return {
          success: false,
          error: response.data.message || "Registration failed.",
        };
      }
    } catch (err: unknown) {
      console.error("Registration error: ", err);
      let errMsg = "An error occurred during registration.";
      if (axios.isAxiosError<ApiResponse<AuthResponse>>(err)) {
        errMsg = err.response?.data?.message || err.message || errMsg;
      } else if (err instanceof Error) {
        errMsg = err.message;
      }
      return { success: false, error: errMsg };
    }
  },

  logoutAction: async () => {
    let success = true;
    let error: string | undefined;
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error("Logout API failed:", e);
      success = false;
      if (axios.isAxiosError(e)) {
        error = e.response?.data?.message || e.message;
      } else if (e instanceof Error) {
        error = e.message;
      }
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("currentUser");
      set({ isAuthenticated: false, currentUser: null });
    }
    return { success, error };
  },
}));

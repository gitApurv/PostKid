import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/store";
import { User, Lock, Eye, EyeOff, Terminal, ArrowRight } from "lucide-react";
import api from "../lib/axios";
import axios from "axios";
import type { ApiResponse } from "../types/common/ApiResponse";
import type { AuthResponse } from "../types/auth/AuthResponse";
import type { LoginRequest } from "../types/auth/LoginRequest";

export default function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    setError(null);
    try {
      const payload: LoginRequest = { username, password };
      const response = await api.post<ApiResponse<AuthResponse>>("/auth/login", payload);

      if (response.data.success && response.data.data) {
        const authData = response.data.data;
        localStorage.setItem("accessToken", authData.accessToken);
        localStorage.setItem("refreshToken", authData.refreshToken);

        login(authData.email, authData.username);
        navigate("/");
      } else {
        setError(response.data.message || "Login failed. Please check your credentials.");
      }
    } catch (err: unknown) {
      console.error("Login error: ", err);
      let errMsg = "An error occurred during login.";
      if (axios.isAxiosError<ApiResponse<AuthResponse>>(err)) {
        errMsg = err.response?.data?.message || err.message || errMsg;
      } else if (err instanceof Error) {
        errMsg = err.message;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-brand-bg font-sans overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[460px] relative z-10">
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-primary via-brand-secondary to-pink-500 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)] mb-4 animate-float">
            <Terminal className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display font-extrabold text-3xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            PostKid
          </h1>
          <span className="mt-1.5 px-2.5 py-0.5 text-[10px] font-semibold font-display tracking-widest text-brand-primary border border-brand-primary/20 bg-brand-primary/5 rounded-full uppercase">
            API Platform
          </span>
        </div>

        {/* Login Card Container */}
        <div className="glass-panel rounded-2xl p-8 sm:p-10 shadow-[0_0_50px_rgba(99,102,241,0.06)] border-white/10 relative overflow-hidden">
          {/* Top card accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-primary via-brand-secondary to-pink-500 opacity-80" />

          <h2 className="text-xl font-display font-semibold text-white mb-1.5">Welcome back</h2>
          <p className="text-xs text-slate-400 mb-8">Enter your credentials to enter the API workspace.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-brand-error/10 border border-brand-error/20 text-xs text-brand-error flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-error shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Username Field */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary transition-standard">
                <User className="h-4 w-4" />
              </div>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="superdeveloper"
                className="block w-full pl-10 pr-3 py-3 bg-brand-layer-2/50 border border-white/5 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/10 transition-standard"
              />
              <label className="absolute left-10 -top-2 text-[10px] font-semibold text-brand-primary/70 bg-brand-layer-1 px-1.5 rounded transition-standard pointer-events-none">
                Username
              </label>
            </div>

            {/* Password Field */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary transition-standard">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="block w-full pl-10 pr-10 py-3 bg-brand-layer-2/50 border border-white/5 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/10 transition-standard"
              />
              <label className="absolute left-10 -top-2 text-[10px] font-semibold text-brand-primary/70 bg-brand-layer-1 px-1.5 rounded transition-standard pointer-events-none">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-standard"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full py-3 px-4 font-display font-medium text-white text-sm bg-gradient-to-r from-brand-primary via-brand-secondary to-pink-500 rounded-lg shadow-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-standard overflow-hidden flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              ) : (
                <>
                  Connect Workspace
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-standard" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="mt-8 text-center text-xs text-slate-500">
          New to PostKid?{" "}
          <Link to="/register" className="text-brand-primary hover:text-brand-secondary transition-standard font-medium">
            Create a Developer Account
          </Link>
        </p>
      </div>
    </div>
  );
}

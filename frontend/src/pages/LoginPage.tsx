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

  const [username, setUsername] = useState("apurv");
  const [password, setPassword] = useState("SuperSecurePassword123!");
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
      {/* Background Radial Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full ambient-glow-1 animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full ambient-glow-2 animate-pulse-slow pointer-events-none" />

      {/* Floating terminal visual in the background */}
      <div className="absolute top-10 right-10 opacity-15 hidden md:block animate-float">
        <div className="bg-brand-layer-1 border border-white/5 rounded-lg p-3 font-mono text-[10px] text-brand-primary w-48 shadow-2xl">
          <div className="flex gap-1.5 mb-2">
            <span className="w-2 h-2 rounded-full bg-red-500/50" />
            <span className="w-2 h-2 rounded-full bg-yellow-500/50" />
            <span className="w-2 h-2 rounded-full bg-green-500/50" />
          </div>
          <p className="text-brand-success">$ postkid run auth_suite</p>
          <p className="text-slate-400">✓ POST /auth/login (242ms)</p>
          <p className="text-slate-400">✓ GET /users/me (98ms)</p>
          <p className="text-brand-warning">⚡ token rotating active</p>
        </div>
      </div>

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
                placeholder="developer_username"
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
                placeholder="••••••••••••••••"
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

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  defaultChecked
                  className="h-3.5 w-3.5 rounded border-white/10 bg-brand-layer-2 text-brand-primary focus:ring-brand-primary/20 accent-brand-primary"
                />
                <label htmlFor="remember-me" className="ml-2 text-slate-400 hover:text-slate-200 cursor-pointer">
                  Remember session
                </label>
              </div>
              <a href="#" className="text-brand-primary hover:text-brand-secondary transition-standard font-medium">
                Forgot password?
              </a>
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

          {/* Social Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <span className="absolute inset-x-0 h-[1px] bg-white/5" />
            <span className="relative px-3 bg-brand-layer-1 text-[10px] text-slate-500 uppercase tracking-widest">
              Or authorize with
            </span>
          </div>

          {/* SSO Google Button */}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-2.5 px-4 bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-white/10 rounded-lg text-xs text-slate-300 transition-standard flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            Google Identity
          </button>
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

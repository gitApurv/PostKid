import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Mail, Lock, User, Terminal, ArrowRight, Check } from "lucide-react";

export default function RegisterPage() {
  const registerAction = useAuthStore((state) => state.registerAction);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasLength = password.length >= 8;
  const hasUpperLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const checks = {
    length: hasLength,
    upperLower: hasUpperLower,
    number: hasNumber,
    special: hasSpecial,
  };

  let strength = 0;
  if (hasLength) strength += 25;
  if (hasUpperLower) strength += 25;
  if (hasNumber) strength += 25;
  if (hasSpecial) strength += 25;

  const getStrengthColor = () => {
    if (strength <= 25) return "text-brand-error stroke-brand-error";
    if (strength <= 75) return "text-brand-warning stroke-brand-warning";
    return "text-brand-success stroke-brand-success";
  };

  const isFormValid =
    username.length >= 3 &&
    email.includes("@") &&
    strength >= 50 &&
    password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError(null);

    const res = await registerAction({ username, email, password });
    setLoading(false);

    if (res.success) {
      navigate("/");
    } else {
      setError(res.error || "Registration failed.");
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

        {/* Register Card Container */}
        <div className="glass-panel rounded-2xl p-8 sm:p-10 shadow-[0_0_50px_rgba(99,102,241,0.06)] border-white/10 relative overflow-hidden">
          {/* Top card accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-primary via-brand-secondary to-pink-500 opacity-80" />

          <h2 className="text-xl font-display font-semibold text-white mb-1.5">
            Create account
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Join global engineering teams managing REST variables.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                className="block w-full pl-10 pr-3 py-2.5 bg-brand-layer-2/50 border border-white/5 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/10 transition-standard"
              />
              <label className="absolute left-10 -top-2 text-[9px] font-semibold text-brand-primary/70 bg-brand-layer-1 px-1 rounded transition-standard pointer-events-none">
                Username
              </label>
            </div>

            {/* Email Field */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary transition-standard">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@postkid.com"
                className="block w-full pl-10 pr-3 py-2.5 bg-brand-layer-2/50 border border-white/5 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/10 transition-standard"
              />
              <label className="absolute left-10 -top-2 text-[9px] font-semibold text-brand-primary/70 bg-brand-layer-1 px-1 rounded transition-standard pointer-events-none">
                Email Address
              </label>
            </div>

            {/* Password Field & Circular Strength SVG */}
            <div className="flex gap-3 items-start relative">
              <div className="relative group flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary transition-standard">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 bg-brand-layer-2/50 border border-white/5 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/10 transition-standard"
                />
                <label className="absolute left-10 -top-2 text-[9px] font-semibold text-brand-primary/70 bg-brand-layer-1 px-1 rounded transition-standard pointer-events-none">
                  Password
                </label>
              </div>

              {/* SVG Circular strength indicator */}
              <div className="relative flex items-center justify-center p-1.5 bg-brand-layer-2/50 rounded-lg border border-white/5">
                <svg className="w-9 h-9 transform -rotate-90">
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    className="stroke-white/5 fill-transparent"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    className={`fill-transparent transition-all duration-500 ease-out ${getStrengthColor()}`}
                    strokeWidth="3"
                    strokeDasharray={2 * Math.PI * 15}
                    strokeDashoffset={
                      2 * Math.PI * 15 - (strength / 100) * 2 * Math.PI * 15
                    }
                  />
                </svg>
                <div className="absolute text-[8px] font-bold text-slate-300 font-display">
                  {strength}%
                </div>
              </div>
            </div>

            {/* Password strength checklist display */}
            {password.length > 0 && (
              <div className="grid grid-cols-2 gap-1 px-1.5 py-1.5 bg-brand-layer-2/30 rounded border border-white/5 text-[10px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${checks.length ? "bg-brand-success/10 border-brand-success text-brand-success" : "border-white/10"}`}
                  >
                    {checks.length && <Check className="w-2.5 h-2.5" />}
                  </span>
                  Min 8 characters
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${checks.upperLower ? "bg-brand-success/10 border-brand-success text-brand-success" : "border-white/10"}`}
                  >
                    {checks.upperLower && <Check className="w-2.5 h-2.5" />}
                  </span>
                  Upper & Lower letters
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${checks.number ? "bg-brand-success/10 border-brand-success text-brand-success" : "border-white/10"}`}
                  >
                    {checks.number && <Check className="w-2.5 h-2.5" />}
                  </span>
                  Contains numbers
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${checks.special ? "bg-brand-success/10 border-brand-success text-brand-success" : "border-white/10"}`}
                  >
                    {checks.special && <Check className="w-2.5 h-2.5" />}
                  </span>
                  Special character
                </div>
              </div>
            )}

            {/* Confirm Password Field */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary transition-standard">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="block w-full pl-10 pr-3 py-2.5 bg-brand-layer-2/50 border border-white/5 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/10 transition-standard"
              />
              <label className="absolute left-10 -top-2 text-[9px] font-semibold text-brand-primary/70 bg-brand-layer-1 px-1 rounded transition-standard pointer-events-none">
                Confirm Password
              </label>
              {password && confirmPassword && password !== confirmPassword && (
                <span className="absolute right-3 top-2.5 text-[9px] text-brand-error font-medium">
                  Mismatch
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="relative w-full py-3 px-4 font-display font-medium text-white text-sm bg-gradient-to-r from-brand-primary via-brand-secondary to-pink-500 rounded-lg shadow-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none transition-standard overflow-hidden flex items-center justify-center gap-2 group mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              ) : (
                <>
                  Register & Provision
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-standard" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="mt-8 text-center text-xs text-slate-500">
          Already have a developer account?{" "}
          <Link
            to="/login"
            className="text-brand-primary hover:text-brand-secondary transition-standard font-medium"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import Logo from "./Logo";
import { motion } from "motion/react";

export default function AuthView({ onAuthSuccess, setErrorAlert, setSuccessAlert }) {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Dynamic Client Validations
    if (isLogin) {
      if (!email.trim() || !password) {
        setFormError("Please fill out all login fields.");
        return;
      }
    } else {
      if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
        setFormError("Please fill out all registration fields.");
        return;
      }
      if (password.length < 6) {
        setFormError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setFormError("Passwords do not match.");
        return;
      }
    }

    setIsLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin
        ? { email: email.trim(), password }
        : { fullName: fullName.trim(), email: email.trim(), password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong. Please check your credentials.");
      }

      setSuccessAlert(
        isLogin 
          ? "Signed in successfully! Welcome back to your CRM workspace." 
          : "Registration completed successfully! Your new account has been created."
      );
      onAuthSuccess(data.token, data.user);
    } catch (error) {
      setFormError(error.message || "Network error. Please try again.");
      setErrorAlert(error.message || "Failed to authenticate.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#04091a] px-4 py-12 relative overflow-hidden" id="auth-page">
      {/* Decorative premium animated background blobs */}
      <motion.div 
        animate={{
          x: [0, 60, -30, 0],
          y: [0, -80, 40, 0],
          scale: [1, 1.25, 0.85, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" 
      />
      <motion.div 
        animate={{
          x: [0, -70, 40, 0],
          y: [0, 60, -50, 0],
          scale: [1, 0.8, 1.15, 1],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-violet-500/10 blur-[100px] pointer-events-none" 
      />
      <motion.div 
        animate={{
          x: [0, 40, -40, 0],
          y: [0, 30, -30, 0],
          opacity: [0.03, 0.08, 0.03]
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/2 left-1/3 -translate-y-1/2 h-80 w-80 rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" 
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="flex justify-center mb-8">
          <Logo size="lg" showSubtitle={false} />
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.3)] backdrop-blur-md">
          {/* Tabs */}
          <div className="flex border-b border-slate-800 pb-4 mb-6">
            <button
              onClick={() => {
                setIsLogin(true);
                setFormError(null);
              }}
              className={`flex-1 text-center font-medium pb-2 transition-all cursor-pointer ${
                isLogin
                  ? "border-b-2 border-blue-500 text-blue-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200 border-b border-transparent"
              }`}
              id="tab-login"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setFormError(null);
              }}
              className={`flex-1 text-center font-medium pb-2 transition-all cursor-pointer ${
                !isLogin
                  ? "border-b-2 border-violet-500 text-violet-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200 border-b border-transparent"
              }`}
              id="tab-register"
            >
              Register
            </button>
          </div>

          <p className="text-slate-400 text-sm mb-4 text-center">
            {isLogin
              ? "Please sign in to manage your client leads."
              : "Create an account to start tracking leads today."}
          </p>

          {/* Error Banner */}
          {formError && (
            <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/25 p-4 text-xs text-red-400 flex flex-col gap-2.5 shadow-sm">
              <div className="flex items-start gap-2">
                <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5"></span>
                <span className="leading-relaxed">{formError}</span>
              </div>
              {formError.toLowerCase().includes("register") && isLogin && (
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(false);
                    setFormError(null);
                  }}
                  className="text-[11px] font-bold text-violet-400 hover:text-violet-300 transition-colors uppercase tracking-wider text-left pl-3.5 underline decoration-dotted cursor-pointer"
                >
                  Create an account now &rarr;
                </button>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full border border-slate-800 text-white rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 bg-slate-950/60"
                    id="input-name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full border border-slate-800 text-white rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-950/60"
                  id="input-email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-slate-800 text-white rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-950/60"
                  id="input-password"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-slate-800 text-white rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 bg-slate-950/60"
                    id="input-confirm-password"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative group mt-6 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white rounded-xl py-2.5 px-4 font-semibold text-sm transition-all shadow-[0_4px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_25px_rgba(139,92,246,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              id="btn-auth-submit"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : isLogin ? (
                <>
                  <LogIn size={16} />
                  <span>Login</span>
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          {/* Account Switcher / Helper message */}
          <div className="mt-6 text-center text-sm">
            {isLogin ? (
              <p className="text-slate-400">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(false);
                    setFormError(null);
                  }}
                  className="font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer inline-block ml-1"
                  id="link-go-to-register"
                >
                  Create now
                </button>
              </p>
            ) : (
              <p className="text-slate-400">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(true);
                    setFormError(null);
                  }}
                  className="font-semibold text-violet-400 hover:text-violet-350 transition-colors cursor-pointer inline-block ml-1"
                  id="link-go-to-login"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

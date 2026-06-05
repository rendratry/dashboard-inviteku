"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Eye, EyeOff, AlertTriangle, Loader2, Globe } from "lucide-react";
import { useAuthStore, useLanguageStore } from "@/lib/store";
import { loginApi, googleLoginApi } from "@/lib/api";
import { useTranslation } from "@/lib/i18n/dictionaries";
import { GoogleLogin } from '@react-oauth/google';

function FloatingBlob({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -18, 0], scale: [1, 1.05, 1] }}
      transition={{ duration: 7, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { setToken, isAuthenticated } = useAuthStore();
  const { language, toggleLanguage } = useLanguageStore();
  const { t } = useTranslation();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await loginApi(identifier, password);
      if (res.data?.token) {
        setToken(res.data.token);
        router.push("/dashboard");
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError(null);
    setLoading(true);
    try {
      const res = await googleLoginApi(credentialResponse.credential!);
      if (res.data?.token) {
        setToken(res.data.token);
        router.push("/dashboard");
      } else {
        setError("Invalid credentials from Google.");
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message ?? "Google Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-pastel-gradient flex items-center justify-center p-4 overflow-hidden">
      <FloatingBlob delay={0} className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blush-200/40 blur-3xl pointer-events-none" />
      <FloatingBlob delay={2} className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-lavender-200/40 blur-3xl pointer-events-none" />
      <FloatingBlob delay={4} className="absolute top-1/2 -right-48 w-72 h-72 rounded-full bg-mint-200/30 blur-3xl pointer-events-none" />
      <FloatingBlob delay={1} className="absolute -bottom-12 left-1/3 w-64 h-64 rounded-full bg-baby-200/30 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="glass-card rounded-3xl p-8 sm:p-10 w-full max-w-md shadow-2xl relative z-10"
      >
        <div className="absolute top-4 right-4">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 h-8 rounded-xl font-bold text-xs bg-white/50 text-slate-soft hover:bg-blush-50 hover:text-blush-600 transition-colors uppercase"
            title="Toggle Language (EN/ID)"
          >
            <Globe size={14} />
            {language}
          </button>
        </div>
        
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
            className="inline-flex items-center justify-center w-48 mb-4"
          >
            <img src="/logo.png" alt="Inviteku Logo" className="w-full h-auto object-contain" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-ink mb-1"
          >
            {t.auth.loginTitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-sm text-slate-soft"
          >
            {t.auth.loginSubtitle}
          </motion.p>
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Identifier */}
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="block text-sm font-medium text-ink-muted">
              {t.auth.emailLabel}
            </label>
            <input
              id="login-email"
              type="text"
              autoComplete="username"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={t.auth.emailPlaceholder}
              className="input-pastel w-full px-4 py-3 rounded-xl border border-cream-300 bg-white/70 text-ink placeholder-slate-soft/60 text-sm transition-all duration-200 focus:border-lavender-300"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="login-password" className="block text-sm font-medium text-ink-muted">
              {t.auth.passwordLabel}
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.auth.passwordPlaceholder}
                className="input-pastel w-full px-4 py-3 pr-11 rounded-xl border border-cream-300 bg-white/70 text-ink placeholder-slate-soft/60 text-sm transition-all duration-200 focus:border-lavender-300"
              />
              <button
                type="button"
                id="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-soft hover:text-blush-500 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl border border-red-100"
            >
              <AlertTriangle size={16} />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Submit */}
          <motion.button
            id="login-submit"
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 px-4 rounded-xl font-semibold text-white text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            style={{
              background: loading
                ? "#f0b3c0"
                : "linear-gradient(135deg, #ff9fb5 0%, #c2a7ff 100%)",
              boxShadow: "0 4px 20px rgba(200, 162, 255, 0.4)",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {t.auth.loggingIn}
              </>
            ) : (
              t.auth.loginButton
            )}
          </motion.button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-cream-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white/70 text-slate-soft">Atau</span>
            </div>
          </div>
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google Login dibatalkan atau gagal")}
              theme="outline"
              size="large"
              shape="pill"
            />
          </div>
        </motion.form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-5 text-center text-sm text-slate-soft"
        >
          {t.auth.noAccount}{" "}
          <button
            id="go-to-register"
            onClick={() => router.push("/register")}
            className="font-semibold text-blush-500 hover:text-blush-400 transition-colors"
          >
            {t.auth.registerLink}
          </button>
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-3 text-center text-xs text-slate-soft/70"
        >
          Inviteku Dashboard • Digital Wedding Invitations
        </motion.p>
      </motion.div>
    </div>
  );
}

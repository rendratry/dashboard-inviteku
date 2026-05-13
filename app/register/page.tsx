"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { registerApi, verifyOtpApi, resendOtpApi, RegisteredUser } from "@/lib/api";

// ── Floating decoration blob ──────────────────────────────────────────────
function FloatingBlob({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -18, 0], scale: [1, 1.05, 1] }}
      transition={{ duration: 7, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

// ── OTP digit input ───────────────────────────────────────────────────────
function OtpInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(4, " ").split("").slice(0, 4);

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const next = value.slice(0, i) + value.slice(i + 1);
      onChange(next);
      if (i > 0) refs.current[i - 1]?.focus();
    }
  };

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const ch = e.target.value.replace(/\D/g, "").slice(-1);
    if (!ch) return;
    const arr = value.padEnd(4, "").split("").slice(0, 4);
    arr[i] = ch;
    const next = arr.join("").replace(/ /g, "");
    onChange(next);
    if (i < 3) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasted) {
      onChange(pasted);
      refs.current[Math.min(pasted.length, 3)]?.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
      {[0, 1, 2, 3].map((i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          id={`otp-digit-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i].trim()}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          className="w-14 h-14 text-center text-2xl font-bold rounded-2xl border-2 border-cream-300 bg-white/70 text-ink transition-all duration-200 focus:border-lavender-400 focus:shadow-[0_0_0_3px_rgba(200,162,255,0.3)] outline-none"
          aria-label={`OTP digit ${i + 1}`}
        />
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();

  // Step 1: registration form
  const [step, setStep] = useState<"form" | "otp" | "success">("form");
  const [registeredUser, setRegisteredUser] = useState<RegisteredUser | null>(null);

  // Form fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Shared state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Cooldown ticker
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const startCooldown = (seconds = 60) => {
    setResendCooldown(seconds);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await registerApi({ username, email, password, name });
      setRegisteredUser(res.data);
      setStep("otp");
      startCooldown(60);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message ?? "Registrasi gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeredUser) return;
    if (otp.length < 4) {
      setError("Masukkan 4 digit kode OTP.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await verifyOtpApi({ id: registeredUser.id, otp: Number(otp) });
      setStep("success");
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message ?? "Verifikasi gagal. Cek kode OTP Anda.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!registeredUser || resendCooldown > 0) return;
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      await resendOtpApi(registeredUser.email);
      setSuccessMsg("Kode OTP baru telah dikirim ke email Anda.");
      setOtp("");
      startCooldown(60);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message ?? "Gagal mengirim ulang OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="relative min-h-screen bg-pastel-gradient flex items-center justify-center p-4 overflow-hidden">
      {/* Background blobs */}
      <FloatingBlob delay={0} className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blush-200/40 blur-3xl pointer-events-none" />
      <FloatingBlob delay={2} className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-lavender-200/40 blur-3xl pointer-events-none" />
      <FloatingBlob delay={4} className="absolute top-1/2 -right-48 w-72 h-72 rounded-full bg-mint-200/30 blur-3xl pointer-events-none" />
      <FloatingBlob delay={1} className="absolute -bottom-12 left-1/3 w-64 h-64 rounded-full bg-baby-200/30 blur-3xl pointer-events-none" />

      <AnimatePresence mode="wait">
        {/* ── Step 1: Registration Form ── */}
        {step === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="glass-card rounded-3xl p-8 sm:p-10 w-full max-w-md shadow-2xl relative z-10"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 20 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                style={{ background: "linear-gradient(135deg, #ffc2cf 0%, #d9c8ff 100%)" }}
              >
                <User size={28} className="text-white" strokeWidth={1.5} />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-2xl font-bold text-ink mb-1"
              >
                Buat Akun Baru
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-slate-soft"
              >
                Daftar ke{" "}
                <span className="font-semibold text-blush-500">Inviteku</span> sekarang
              </motion.p>
            </div>

            {/* Form */}
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              onSubmit={handleRegister}
              className="space-y-4"
            >
              {/* Name */}
              <div className="space-y-1.5">
                <label htmlFor="register-name" className="block text-sm font-medium text-ink-muted">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-soft/60" />
                  <input
                    id="register-name"
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama lengkap Anda"
                    className="input-pastel w-full pl-10 pr-4 py-3 rounded-xl border border-cream-300 bg-white/70 text-ink placeholder-slate-soft/60 text-sm transition-all duration-200 focus:border-lavender-300"
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label htmlFor="register-username" className="block text-sm font-medium text-ink-muted">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-soft/60 text-sm font-medium">@</span>
                  <input
                    id="register-username"
                    type="text"
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
                    placeholder="username_anda"
                    className="input-pastel w-full pl-8 pr-4 py-3 rounded-xl border border-cream-300 bg-white/70 text-ink placeholder-slate-soft/60 text-sm transition-all duration-200 focus:border-lavender-300"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="register-email" className="block text-sm font-medium text-ink-muted">
                  Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-soft/60" />
                  <input
                    id="register-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-pastel w-full pl-10 pr-4 py-3 rounded-xl border border-cream-300 bg-white/70 text-ink placeholder-slate-soft/60 text-sm transition-all duration-200 focus:border-lavender-300"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="register-password" className="block text-sm font-medium text-ink-muted">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-soft/60" />
                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 karakter"
                    className="input-pastel w-full pl-10 pr-11 py-3 rounded-xl border border-cream-300 bg-white/70 text-ink placeholder-slate-soft/60 text-sm transition-all duration-200 focus:border-lavender-300"
                  />
                  <button
                    type="button"
                    id="toggle-register-password"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-soft hover:text-blush-500 transition-colors"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl border border-red-100"
                  >
                    <AlertTriangle size={16} />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                id="register-submit"
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
                    Mendaftar...
                  </>
                ) : (
                  "Daftar Sekarang →"
                )}
              </motion.button>
            </motion.form>

            {/* Login link */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-center text-sm text-slate-soft"
            >
              Sudah punya akun?{" "}
              <button
                id="go-to-login"
                onClick={() => router.push("/login")}
                className="font-semibold text-blush-500 hover:text-blush-400 transition-colors"
              >
                Masuk di sini
              </button>
            </motion.p>
          </motion.div>
        )}

        {/* ── Step 2: OTP Verification ── */}
        {step === "otp" && (
          <motion.div
            key="otp"
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="glass-card rounded-3xl p-8 sm:p-10 w-full max-w-md shadow-2xl relative z-10"
          >
            {/* Back button */}
            <button
              id="otp-back"
              onClick={() => { setStep("form"); setError(null); setSuccessMsg(null); setOtp(""); }}
              className="flex items-center gap-1.5 text-sm text-slate-soft hover:text-blush-500 transition-colors mb-6"
            >
              <ArrowLeft size={16} />
              Kembali
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                style={{ background: "linear-gradient(135deg, #9af5db 0%, #d9c8ff 100%)" }}
              >
                <ShieldCheck size={28} className="text-white" strokeWidth={1.5} />
              </motion.div>
              <h1 className="text-2xl font-bold text-ink mb-1">Verifikasi Email</h1>
              <p className="text-sm text-slate-soft">
                Masukkan kode OTP yang dikirim ke{" "}
                <span className="font-semibold text-ink">{registeredUser?.email}</span>
              </p>
            </div>

            {/* OTP Form */}
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <OtpInput value={otp} onChange={(v) => { setOtp(v); setError(null); }} />

              {/* Error / Success messages */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl border border-red-100"
                  >
                    <AlertTriangle size={16} />
                    <span>{error}</span>
                  </motion.div>
                )}
                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-sm text-mint-500 bg-mint-50 px-4 py-3 rounded-xl border border-mint-100"
                  >
                    <CheckCircle2 size={16} />
                    <span>{successMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Verify button */}
              <motion.button
                id="otp-submit"
                type="submit"
                disabled={loading || otp.length < 4}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-4 rounded-xl font-semibold text-white text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                style={{
                  background: loading || otp.length < 4
                    ? "#b3e3ff"
                    : "linear-gradient(135deg, #5de9c5 0%, #c2a7ff 100%)",
                  boxShadow: "0 4px 20px rgba(93, 233, 197, 0.35)",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  "Verifikasi OTP →"
                )}
              </motion.button>
            </form>

            {/* Resend OTP */}
            <div className="mt-5 text-center">
              {resendCooldown > 0 ? (
                <p className="text-sm text-slate-soft">
                  Kirim ulang OTP dalam{" "}
                  <span className="font-semibold text-lavender-500">{resendCooldown}s</span>
                </p>
              ) : (
                <button
                  id="resend-otp"
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-blush-500 hover:text-blush-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw size={14} />
                  Kirim Ulang OTP
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Step 3: Success ── */}
        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="glass-card rounded-3xl p-10 w-full max-w-sm shadow-2xl relative z-10 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 16 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-5"
              style={{ background: "linear-gradient(135deg, #9af5db 0%, #5de9c5 100%)" }}
            >
              <CheckCircle2 size={36} className="text-white" strokeWidth={1.8} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-2xl font-bold text-ink mb-2"
            >
              Registrasi Berhasil!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-slate-soft mb-2"
            >
              Selamat datang,{" "}
              <span className="font-semibold text-ink">{registeredUser?.name}</span>!
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="text-sm text-slate-soft mb-8"
            >
              Akun Anda telah diverifikasi. Silakan login untuk mulai menggunakan Inviteku.
            </motion.p>

            <motion.button
              id="go-to-login-success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/login")}
              className="w-full py-3 px-4 rounded-xl font-semibold text-white text-sm cursor-pointer flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #ff9fb5 0%, #c2a7ff 100%)",
                boxShadow: "0 4px 20px rgba(200, 162, 255, 0.4)",
              }}
            >
              Masuk ke Dashboard →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, Eye, EyeOff, AlertTriangle, Loader2 } from "lucide-react";
import { useAdminStore } from "@/lib/store";
import { adminLoginApi } from "@/lib/api";

function FloatingBlob({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -18, 0], scale: [1, 1.05, 1] }}
      transition={{ duration: 7, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAdminToken, isAdminAuthenticated } = useAdminStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAdminAuthenticated) router.replace("/admin/dashboard");
  }, [isAdminAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      const res = await adminLoginApi(username, password);
      if (res.data?.token) {
        setAdminToken(res.data.token);
        router.push("/admin/dashboard");
      } else {
        setError("Username atau password salah.");
      }
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? "Terjadi kesalahan.");
    } finally { setLoading(false); }
  };

  return (
    <div className="relative min-h-screen bg-pastel-gradient flex items-center justify-center p-4 overflow-hidden">
      <FloatingBlob delay={0} className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-lavender-200/40 blur-3xl pointer-events-none" />
      <FloatingBlob delay={2} className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-blush-200/40 blur-3xl pointer-events-none" />
      <FloatingBlob delay={4} className="absolute top-1/2 -right-48 w-72 h-72 rounded-full bg-baby-200/30 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="glass-card rounded-3xl p-8 sm:p-10 w-full max-w-md shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #d9c8ff 0%, #80cfff 100%)" }}
          >
            <ShieldCheck size={28} className="text-white" strokeWidth={1.5} />
          </motion.div>
          <h1 className="text-2xl font-bold text-ink mb-1">Admin Portal</h1>
          <p className="text-sm text-slate-soft">
            Masuk ke <span className="font-semibold text-lavender-500">Inviteku Admin</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="admin-username" className="block text-sm font-medium text-ink-muted">Username</label>
            <input id="admin-username" type="text" required autoComplete="username"
              value={username} onChange={e => setUsername(e.target.value)}
              placeholder="admin"
              className="input-pastel w-full px-4 py-3 rounded-xl border border-cream-300 bg-white/70 text-ink text-sm" />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="admin-password" className="block text-sm font-medium text-ink-muted">Password</label>
            <div className="relative">
              <input id="admin-password" type={showPw ? "text" : "password"} required autoComplete="current-password"
                value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                className="input-pastel w-full px-4 py-3 pr-11 rounded-xl border border-cream-300 bg-white/70 text-ink text-sm" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-soft hover:text-lavender-500 transition-colors">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
              <AlertTriangle size={16} />{error}
            </motion.div>
          )}

          <motion.button id="admin-login-submit" type="submit" disabled={loading}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full py-3 px-4 rounded-xl font-semibold text-white text-sm disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #d9c8ff 0%, #80cfff 100%)", boxShadow: "0 4px 20px rgba(180, 160, 255, 0.4)" }}>
            {loading ? <><Loader2 size={16} className="animate-spin" />Masuk…</> : "Masuk sebagai Admin →"}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-soft/70">
          Inviteku Admin · Hanya untuk tim internal
        </p>
      </motion.div>
    </div>
  );
}

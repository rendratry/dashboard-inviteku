"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Plus, CheckCircle2, AlertTriangle, Loader2, Link2, CalendarClock, Eye } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { createUndanganApi, getUndanganApi, type Undangan } from "@/lib/api";

// ── Helpers ────────────────────────────────────────────────────────────────

function formatExp(exp?: string) {
  if (!exp) return null;
  const ms = Number(exp);
  if (isNaN(ms)) return null;
  return new Date(ms).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

// ── Undangan Card ──────────────────────────────────────────────────────────

function UndanganCard({ undangan, index }: { undangan: Undangan; index: number }) {
  const expDate = formatExp(undangan.exp);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="bg-white rounded-2xl p-5 shadow-card hover:shadow-float transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0 mt-0.5"
          style={{ background: `linear-gradient(135deg, hsl(${(index * 55) % 360}, 65%, 72%) 0%, hsl(${(index * 55 + 60) % 360}, 65%, 72%) 100%)` }}
        >
          <Mail size={22} strokeWidth={1.5} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-1">
          <p className="font-semibold text-ink text-sm">{undangan.nama}</p>

          {undangan.key_undangan && (
            <p className="text-xs text-slate-soft flex items-center gap-1 truncate">
              <Link2 size={10} className="flex-shrink-0" />
              <span className="font-mono text-lavender-500">{undangan.key_undangan}</span>
            </p>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            {undangan.template && (
              <span className="text-xs text-slate-soft/70 bg-cream-100 px-2 py-0.5 rounded-lg">
                {undangan.template}
              </span>
            )}
            {expDate && (
              <span className="text-xs text-slate-soft flex items-center gap-1">
                <CalendarClock size={10} />
                Exp: {expDate}
              </span>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${undangan.is_published ? "badge-active" : "badge-inactive"
            }`}>
            {undangan.is_published ? "Published" : "Draft"}
          </span>
          {undangan.key_undangan && (
            <a
              href={`https://inviteku.com/${undangan.key_undangan}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-lavender-500 hover:underline flex items-center gap-1"
            >
              <Eye size={11} /> Lihat
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function UndanganPage() {
  const { token } = useAuthStore();
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [createAlert, setCreateAlert] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });
  const [undanganList, setUndanganList] = useState<Undangan[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    if (!token) return;
    setListLoading(true);
    setListError(null);
    try {
      const res = await getUndanganApi(token);
      setUndanganList(Array.isArray(res.data) ? res.data : []);
    } catch (e: unknown) {
      const err = e as { message?: string };
      setListError(err?.message ?? "Failed to load undangan.");
    } finally {
      setListLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !title.trim()) return;
    setCreating(true);
    setCreateAlert({ type: null, message: "" });
    try {
      await createUndanganApi(token, title.trim());
      setCreateAlert({ type: "success", message: `Undangan "${title.trim()}" berhasil dibuat!` });
      setTitle("");
      fetchList();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setCreateAlert({ type: "error", message: e?.message ?? "Gagal membuat undangan." });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
          style={{ background: "linear-gradient(135deg, #ffc2cf 0%, #d9c8ff 100%)" }}>
          <Mail size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-ink">Buat Undangan</h1>
          <p className="text-sm text-slate-soft">Buat undangan digital baru untuk pernikahan Anda</p>
        </div>
      </motion.div>

      {/* Create card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-white rounded-2xl p-6 shadow-card">
        <h2 className="font-semibold text-ink mb-5 flex items-center gap-2">
          <Plus size={18} className="text-blush-400" /> Undangan Baru
        </h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="undangan-title" className="block text-sm font-medium text-ink-muted">
              Judul Undangan
            </label>
            <input id="undangan-title" type="text" required value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='Contoh: "Undangan Romeo & Juliet"'
              className="input-pastel w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-ink text-sm transition-all duration-200" />
            <p className="text-xs text-slate-soft">Judul ini akan menjadi nama undangan digital Anda.</p>
          </div>

          <AnimatePresence>
            {createAlert.type && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${createAlert.type === "success" ? "bg-mint-100 text-mint-500 border border-mint-200" : "bg-red-50 text-red-500 border border-red-100"
                  }`}>
                {createAlert.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                {createAlert.message}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-end">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              id="create-undangan-btn" type="submit" disabled={creating || !title.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 cursor-pointer"
              style={{ background: "linear-gradient(135deg, #ff9fb5 0%, #c2a7ff 100%)" }}>
              {creating ? <><Loader2 size={15} className="animate-spin" /> Membuat…</> : <><Plus size={15} /> Buat Undangan</>}
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* List */}
      <div>
        <motion.h2 initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="text-sm font-semibold text-slate-soft uppercase tracking-wider mb-4">
          Undangan Anda ({undanganList.length})
        </motion.h2>

        {listLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={28} className="animate-spin text-blush-400" />
          </div>
        ) : listError ? (
          <div className="text-center py-10 bg-white rounded-2xl shadow-card">
            <AlertTriangle size={22} className="text-red-400 mx-auto mb-2" />
            <p className="text-red-400 text-sm">{listError}</p>
            <button onClick={fetchList} className="text-blush-500 text-sm underline mt-2">Coba lagi</button>
          </div>
        ) : undanganList.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-14 bg-white rounded-2xl shadow-card">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mx-auto mb-4"
              style={{ background: "linear-gradient(135deg, #ffc2cf 0%, #d9c8ff 100%)" }}>
              <Mail size={26} strokeWidth={1.5} />
            </div>
            <p className="font-semibold text-ink">Belum ada undangan</p>
            <p className="text-sm text-slate-soft mt-1">Buat undangan pertama Anda di atas.</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {undanganList.map((u, i) => <UndanganCard key={u.id} undangan={u} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}

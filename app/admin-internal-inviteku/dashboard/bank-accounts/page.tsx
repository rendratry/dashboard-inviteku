"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Plus, Trash2, Edit2, Loader2, X, AlertTriangle,
  RefreshCw, CheckCircle2, ToggleLeft, ToggleRight, Copy, Check,
} from "lucide-react";
import { useAdminStore } from "@/lib/store";
import {
  adminGetBankAccountsApi, adminCreateBankAccountApi,
  adminUpdateBankAccountApi, adminDeleteBankAccountApi,
  type BankAccount,
} from "@/lib/api";

// ── Form Modal ─────────────────────────────────────────────────────────────

type FormData = Omit<BankAccount, "id" | "created_at" | "updated_at">;

function BankAccountModal({
  adminToken, editTarget, onClose, onDone,
}: {
  adminToken: string;
  editTarget: BankAccount | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const isEdit = !!editTarget;
  const [form, setForm] = useState<FormData>({
    bank_name: editTarget?.bank_name ?? "",
    account_number: editTarget?.account_number ?? "",
    account_name: editTarget?.account_name ?? "",
    is_active: editTarget?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const set = (k: keyof FormData, v: string | boolean) => setForm(prev => ({ ...prev, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.bank_name || !form.account_number || !form.account_name) {
      setErr("Semua kolom wajib diisi");
      return;
    }
    setSaving(true); setErr(null);
    try {
      if (isEdit && editTarget) {
        await adminUpdateBankAccountApi(adminToken, editTarget.id, form);
      } else {
        await adminCreateBankAccountApi(adminToken, form);
      }
      onDone();
    } catch (e: unknown) {
      setErr((e as { message?: string })?.message ?? "Gagal menyimpan.");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-float w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-ink flex items-center gap-2">
            <Building2 size={16} className="text-lavender-400" />
            {isEdit ? "Edit Rekening" : "Tambah Rekening Bank"}
          </h2>
          <button onClick={onClose} className="text-slate-soft hover:text-red-400 transition-colors"><X size={18} /></button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink-muted">Nama Bank</label>
            <input value={form.bank_name} onChange={e => set("bank_name", e.target.value)}
              placeholder="Contoh: BCA, Mandiri, BNI..."
              className="input-pastel w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-ink text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink-muted">Nomor Rekening</label>
            <input value={form.account_number} onChange={e => set("account_number", e.target.value)}
              placeholder="1234567890"
              className="input-pastel w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-ink text-sm font-mono" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink-muted">Nama Pemilik Rekening</label>
            <input value={form.account_name} onChange={e => set("account_name", e.target.value)}
              placeholder="Nama sesuai buku tabungan"
              className="input-pastel w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-ink text-sm" />
          </div>
          <div className="flex items-center justify-between py-2 px-4 bg-cream-50 rounded-xl border border-cream-200">
            <span className="text-sm font-medium text-ink">Status Aktif</span>
            <button type="button" onClick={() => set("is_active", !form.is_active)}
              className={`transition-colors ${form.is_active ? "text-mint-500" : "text-slate-soft"}`}>
              {form.is_active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
            </button>
          </div>

          {err && <p className="text-red-500 text-xs flex items-center gap-1"><AlertTriangle size={12} />{err}</p>}

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm text-slate-soft hover:bg-cream-200 transition-colors">Batal</button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #d9c8ff 0%, #80cfff 100%)" }}>
              {saving ? <Loader2 size={13} className="animate-spin" /> : null}
              {isEdit ? "Simpan Perubahan" : "Tambah Rekening"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Account Card ───────────────────────────────────────────────────────────

function AccountCard({
  account, adminToken, onEdit, onRefresh,
}: {
  account: BankAccount; adminToken: string;
  onEdit: (a: BankAccount) => void; onRefresh: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(account.account_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm(`Hapus rekening ${account.bank_name} - ${account.account_number}?`)) return;
    setDeleting(true);
    try {
      await adminDeleteBankAccountApi(adminToken, account.id);
      onRefresh();
    } catch { setDeleting(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl shadow-card p-5 border-l-4 transition-all ${
        account.is_active ? "border-mint-400" : "border-cream-300 opacity-60"
      }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg flex-shrink-0`}
            style={{ background: account.is_active
              ? "linear-gradient(135deg, #9af5db 0%, #14b894 100%)"
              : "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)" }}>
            {account.bank_name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-ink">{account.bank_name}</p>
              {account.is_active
                ? <span className="text-xs bg-mint-100 text-mint-600 px-2 py-0.5 rounded-full font-semibold border border-mint-200">Aktif</span>
                : <span className="text-xs bg-cream-200 text-slate-soft px-2 py-0.5 rounded-full font-semibold">Nonaktif</span>
              }
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-sm font-mono text-slate-soft">{account.account_number}</p>
              <button onClick={copy} className="text-lavender-400 hover:text-lavender-600 transition-colors">
                {copied ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </div>
            <p className="text-xs text-slate-soft mt-0.5">a.n. <span className="font-medium text-ink">{account.account_name}</span></p>
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(account)}
            className="p-2 rounded-xl border border-cream-300 text-ink-muted hover:bg-cream-100 transition-all">
            <Edit2 size={14} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleDelete} disabled={deleting}
            className="p-2 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 transition-all disabled:opacity-50">
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function AdminBankAccountsPage() {
  const { adminToken } = useAdminStore();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<BankAccount | null>(null);

  const fetchData = useCallback(async () => {
    if (!adminToken) return;
    setLoading(true); setError(null);
    try {
      const res = await adminGetBankAccountsApi(adminToken);
      setAccounts(Array.isArray(res.data) ? res.data : []);
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? "Gagal memuat data.");
    } finally { setLoading(false); }
  }, [adminToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDone = () => { setShowModal(false); setEditTarget(null); fetchData(); };
  const handleEdit = (a: BankAccount) => { setEditTarget(a); setShowModal(true); };

  const active = accounts.filter(a => a.is_active);
  const inactive = accounts.filter(a => !a.is_active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
            style={{ background: "linear-gradient(135deg, #9af5db 0%, #14b894 100%)" }}>
            <Building2 size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink">Rekening Bank</h1>
            <p className="text-sm text-slate-soft">Kelola rekening tujuan transfer manual</p>
          </div>
        </div>
        <div className="flex gap-2">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={fetchData} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-cream-300 text-ink-muted hover:bg-cream-100 transition-all disabled:opacity-50">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />Refresh
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => { setEditTarget(null); setShowModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md"
            style={{ background: "linear-gradient(135deg, #9af5db 0%, #14b894 100%)" }}>
            <Plus size={15} />Tambah Rekening
          </motion.button>
        </div>
      </motion.div>

      {/* Info Banner */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="bg-lavender-50 border border-lavender-200 rounded-2xl p-4 flex items-start gap-3">
        <Building2 size={18} className="text-lavender-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-lavender-700">Info Transfer Manual</p>
          <p className="text-xs text-lavender-600 mt-0.5">
            Rekening yang ditambahkan di sini akan ditampilkan kepada user saat memilih metode Transfer Manual.
            Pastikan data rekening selalu up-to-date dan akurat. Nonaktifkan rekening yang tidak ingin ditampilkan.
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Rekening", value: accounts.length, color: "#8b5cf6" },
            { label: "Aktif", value: active.length, color: "#14b894" },
            { label: "Nonaktif", value: inactive.length, color: "#94a3b8" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white rounded-2xl p-4 shadow-card text-center">
              <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-slate-soft mt-1 font-medium">{s.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-lavender-400" />
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-card">
          <AlertTriangle size={24} className="text-red-400 mx-auto mb-2" />
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={fetchData} className="text-lavender-500 text-sm underline mt-2">Coba lagi</button>
        </div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-card">
          <Building2 size={40} className="text-lavender-200 mx-auto mb-4" />
          <p className="font-semibold text-ink">Belum ada rekening bank</p>
          <p className="text-sm text-slate-soft mt-1">Tambahkan rekening tujuan transfer untuk user.</p>
          <motion.button whileHover={{ scale: 1.02 }} onClick={() => setShowModal(true)}
            className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white mx-auto"
            style={{ background: "linear-gradient(135deg, #9af5db 0%, #14b894 100%)" }}>
            <Plus size={15} />Tambah Rekening Pertama
          </motion.button>
        </div>
      ) : (
        <div className="space-y-4">
          {active.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={14} className="text-mint-500" />
                <p className="text-sm font-semibold text-ink">Rekening Aktif ({active.length})</p>
              </div>
              <div className="space-y-3">
                {active.map(a => (
                  <AccountCard key={a.id} account={a} adminToken={adminToken!} onEdit={handleEdit} onRefresh={fetchData} />
                ))}
              </div>
            </div>
          )}
          {inactive.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 mt-2">
                <ToggleLeft size={14} className="text-slate-soft" />
                <p className="text-sm font-semibold text-slate-soft">Rekening Nonaktif ({inactive.length})</p>
              </div>
              <div className="space-y-3">
                {inactive.map(a => (
                  <AccountCard key={a.id} account={a} adminToken={adminToken!} onEdit={handleEdit} onRefresh={fetchData} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <BankAccountModal
            adminToken={adminToken!}
            editTarget={editTarget}
            onClose={() => { setShowModal(false); setEditTarget(null); }}
            onDone={handleDone}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

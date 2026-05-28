"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tag, Plus, Trash2, Loader2, X, AlertTriangle, RefreshCw,
  CheckCircle2, Percent, DollarSign, Users, Clock, ToggleLeft, ToggleRight,
} from "lucide-react";
import { useAdminStore } from "@/lib/store";
import {
  adminGetVouchersApi, adminCreateVoucherApi, adminDeleteVoucherApi,
  type Voucher, type CreateVoucherPayload,
} from "@/lib/api";

// ── Helpers ────────────────────────────────────────────────────────────────

function formatRupiah(v: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v);
}

function formatDate(ms: number) {
  if (!ms) return "Tidak ada batas";
  return new Date(ms).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

// ── Create Voucher Modal ────────────────────────────────────────────────────

function CreateVoucherModal({
  adminToken, onClose, onCreated,
}: {
  adminToken: string; onClose: () => void; onCreated: () => void;
}) {
  const [form, setForm] = useState<CreateVoucherPayload>({
    code: "",
    type: "percent",
    value: 10,
    min_price: 0,
    max_discount: 0,
    quota: 0,
    specific_user: "",
    is_active: true,
    expired_at: 0,
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [useExpired, setUseExpired] = useState(false);
  const [expiredDate, setExpiredDate] = useState("");

  const set = <K extends keyof CreateVoucherPayload>(key: K, val: CreateVoucherPayload[K]) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr(null);
    try {
      const payload: CreateVoucherPayload = {
        ...form,
        code: form.code.toUpperCase().trim(),
        expired_at: useExpired && expiredDate ? new Date(expiredDate).getTime() : 0,
      };
      await adminCreateVoucherApi(adminToken, payload);
      onCreated();
    } catch (e: unknown) {
      setErr((e as { message?: string })?.message ?? "Gagal membuat voucher.");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-float w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cream-200 pb-4">
          <h2 className="font-bold text-ink flex items-center gap-2 text-lg">
            <Tag size={18} className="text-lavender-400" /> Buat Voucher Baru
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-cream-100 text-slate-soft hover:text-red-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {/* Kode */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-soft uppercase tracking-wider">Kode Voucher</label>
            <input
              value={form.code}
              onChange={e => set("code", e.target.value.toUpperCase().replace(/\s/g, ""))}
              placeholder="CONTOH: HEMAT10"
              required
              className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-sm font-mono font-bold tracking-widest focus:outline-none focus:border-lavender-300 focus:ring-2 focus:ring-lavender-100"
            />
          </div>

          {/* Tipe & Nilai */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-soft uppercase tracking-wider">Tipe Diskon</label>
              <div className="flex gap-2">
                <button type="button"
                  onClick={() => set("type", "percent")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${form.type === "percent" ? "bg-lavender-100 border-lavender-300 text-lavender-700" : "border-cream-300 text-slate-soft hover:bg-cream-50"}`}>
                  <Percent size={14} /> Persen
                </button>
                <button type="button"
                  onClick={() => set("type", "fixed")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${form.type === "fixed" ? "bg-peach-100 border-peach-300 text-peach-700" : "border-cream-300 text-slate-soft hover:bg-cream-50"}`}>
                  <DollarSign size={14} /> Fixed
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-soft uppercase tracking-wider">
                Nilai {form.type === "percent" ? "(%)" : "(Rp)"}
              </label>
              <input
                type="number"
                value={form.value}
                onChange={e => set("value", Number(e.target.value))}
                min={1}
                max={form.type === "percent" ? 100 : undefined}
                required
                className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-sm focus:outline-none focus:border-lavender-300 focus:ring-2 focus:ring-lavender-100"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gradient-to-r from-lavender-50 to-peach-50 rounded-xl p-3 border border-lavender-100">
            <p className="text-xs text-slate-soft">Preview diskon:</p>
            <p className="text-sm font-bold text-ink mt-0.5">
              {form.type === "percent"
                ? `Potongan ${form.value}% dari harga`
                : `Potongan tetap ${formatRupiah(form.value)}`}
              {form.max_discount > 0 && form.type === "percent" && `, maks. ${formatRupiah(form.max_discount)}`}
            </p>
          </div>

          {/* Min Price & Max Discount */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-soft uppercase tracking-wider">Min. Harga (Rp)</label>
              <input type="number" value={form.min_price} onChange={e => set("min_price", Number(e.target.value))} min={0}
                className="w-full px-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-sm focus:outline-none focus:border-lavender-300" />
              <p className="text-[10px] text-slate-soft">0 = tidak ada syarat</p>
            </div>
            {form.type === "percent" && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-soft uppercase tracking-wider">Maks. Diskon (Rp)</label>
                <input type="number" value={form.max_discount} onChange={e => set("max_discount", Number(e.target.value))} min={0}
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-sm focus:outline-none focus:border-lavender-300" />
                <p className="text-[10px] text-slate-soft">0 = tidak ada batas</p>
              </div>
            )}
          </div>

          {/* Quota */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-soft uppercase tracking-wider">Kuota Penggunaan</label>
            <input type="number" value={form.quota} onChange={e => set("quota", Number(e.target.value))} min={0}
              className="w-full px-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-sm focus:outline-none focus:border-lavender-300" />
            <p className="text-[10px] text-slate-soft">0 = tidak ada batas</p>
          </div>

          {/* Specific User */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-soft uppercase tracking-wider flex items-center gap-1.5">
              <Users size={11} /> User Tertentu (opsional)
            </label>
            <input value={form.specific_user} onChange={e => set("specific_user", e.target.value.trim())}
              placeholder="Kosongkan untuk semua user — isi ID user untuk user tertentu"
              className="w-full px-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-sm focus:outline-none focus:border-lavender-300" />
          </div>

          {/* Expired */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-soft uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={11} /> Tanggal Expired
              </label>
              <button type="button" onClick={() => setUseExpired(v => !v)}
                className="flex items-center gap-1.5 text-xs text-lavender-500 font-medium">
                {useExpired ? <ToggleRight size={18} className="text-lavender-500" /> : <ToggleLeft size={18} />}
                {useExpired ? "Ada batas" : "Tidak ada batas"}
              </button>
            </div>
            {useExpired && (
              <input type="datetime-local" value={expiredDate} onChange={e => setExpiredDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-sm focus:outline-none focus:border-lavender-300" />
            )}
          </div>

          {/* Status */}
          <div className="flex items-center justify-between p-3 bg-cream-50 rounded-xl border border-cream-200">
            <span className="text-sm font-medium text-ink">Status Voucher</span>
            <button type="button" onClick={() => set("is_active", !form.is_active)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${form.is_active ? "bg-mint-100 text-mint-600" : "bg-cream-200 text-slate-soft"}`}>
              {form.is_active ? <><CheckCircle2 size={12} />Aktif</> : <><X size={12} />Nonaktif</>}
            </button>
          </div>

          {err && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex gap-2 text-red-600 text-sm">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" /><p>{err}</p>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-1">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-soft hover:bg-cream-200 transition-colors">
              Batal
            </button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 shadow-md"
              style={{ background: "linear-gradient(135deg, #d9c8ff 0%, #80cfff 100%)" }}>
              {loading ? <><Loader2 size={15} className="animate-spin" />Menyimpan…</> : <><Plus size={15} />Buat Voucher</>}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Delete Confirm Modal ────────────────────────────────────────────────────

function DeleteConfirmModal({
  voucher, adminToken, onClose, onDeleted,
}: {
  voucher: Voucher; adminToken: string; onClose: () => void; onDeleted: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    try {
      await adminDeleteVoucherApi(adminToken, voucher.id);
      onDeleted();
    } catch (e: unknown) {
      alert((e as { message?: string })?.message ?? "Gagal menghapus voucher.");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-float w-full max-w-sm p-6 space-y-5">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-50 mx-auto">
          <Trash2 size={26} className="text-red-500" />
        </div>
        <div className="text-center space-y-1.5">
          <h3 className="font-bold text-ink text-lg">Hapus Voucher?</h3>
          <p className="text-sm text-slate-soft">
            Voucher <span className="font-mono font-bold text-ink">{voucher.code}</span> akan dihapus permanen.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-cream-300 text-slate-soft hover:bg-cream-100 transition-colors disabled:opacity-50">
            Batal
          </button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleDelete} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50 shadow-sm">
            {loading ? <><Loader2 size={14} className="animate-spin" />Menghapus…</> : <><Trash2 size={14} />Ya, Hapus</>}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function AdminVouchersPage() {
  const { adminToken } = useAdminStore();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Voucher | null>(null);

  const fetchVouchers = useCallback(async () => {
    if (!adminToken) return;
    setLoading(true); setError(null);
    try {
      const res = await adminGetVouchersApi(adminToken);
      setVouchers(Array.isArray(res.data) ? res.data : []);
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? "Gagal memuat voucher.");
    } finally { setLoading(false); }
  }, [adminToken]);

  useEffect(() => { fetchVouchers(); }, [fetchVouchers]);

  const handleCreated = () => { setCreateOpen(false); fetchVouchers(); };
  const handleDeleted = () => { setDeleteTarget(null); fetchVouchers(); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
            style={{ background: "linear-gradient(135deg, #d9c8ff 0%, #ff9fb5 100%)" }}>
            <Tag size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink">Manajemen Voucher</h1>
            <p className="text-sm text-slate-soft">Buat dan kelola kode diskon untuk user</p>
          </div>
        </div>
        <div className="flex gap-2">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={fetchVouchers} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-cream-300 text-ink-muted hover:bg-cream-100 transition-all disabled:opacity-50">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white shadow-md"
            style={{ background: "linear-gradient(135deg, #d9c8ff 0%, #80cfff 100%)" }}>
            <Plus size={16} /> Buat Voucher
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Voucher", value: vouchers.length, color: "#8b5cf6" },
          { label: "Aktif", value: vouchers.filter(v => v.is_active).length, color: "#14b894" },
          { label: "Nonaktif", value: vouchers.filter(v => !v.is_active).length, color: "#f95c7e" },
          { label: "Total Dipakai", value: vouchers.reduce((s, v) => s + v.used_count, 0), color: "#ffb06a" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl p-4 shadow-card flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: s.color + "22", color: s.color }}>
              <Tag size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-soft uppercase tracking-wider">{s.label}</p>
              <p className="text-xl font-bold text-ink">{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-lavender-400" />
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-card">
          <AlertTriangle size={24} className="text-red-400 mx-auto mb-2" />
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={fetchVouchers} className="text-lavender-500 text-sm underline mt-2">Coba lagi</button>
        </div>
      ) : vouchers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-card">
          <Tag size={36} className="text-lavender-200 mx-auto mb-3" />
          <p className="font-semibold text-ink">Belum ada voucher</p>
          <p className="text-sm text-slate-soft mt-1">Klik "Buat Voucher" untuk membuat yang pertama.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-200 bg-cream-50">
                  {["Kode", "Tipe & Nilai", "Kuota", "Min. Harga", "Berlaku Untuk", "Expired", "Status", "Aksi"].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-soft uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vouchers.map((v, i) => (
                  <motion.tr key={v.id}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-cream-100 hover:bg-cream-50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-lavender-600 text-sm bg-lavender-50 px-2.5 py-1 rounded-lg">
                        {v.code}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        {v.type === "percent"
                          ? <span className="flex items-center gap-1 text-xs bg-lavender-100 text-lavender-700 px-2 py-0.5 rounded-full font-semibold"><Percent size={10} />{v.value}%</span>
                          : <span className="flex items-center gap-1 text-xs bg-peach-100 text-peach-700 px-2 py-0.5 rounded-full font-semibold"><DollarSign size={10} />{formatRupiah(v.value)}</span>
                        }
                        {v.type === "percent" && v.max_discount > 0 && (
                          <span className="text-[10px] text-slate-soft">maks. {formatRupiah(v.max_discount)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-ink">
                      <span className={v.quota === 0 ? "text-slate-soft" : ""}>{v.quota === 0 ? "Unlimited" : `${v.used_count}/${v.quota}`}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-soft">
                      {v.min_price > 0 ? formatRupiah(v.min_price) : "—"}
                    </td>
                    <td className="px-5 py-4">
                      {v.specific_user ? (
                        <span className="text-xs bg-peach-50 text-peach-600 px-2 py-0.5 rounded-full font-mono">{v.specific_user}</span>
                      ) : (
                        <span className="text-xs text-slate-soft flex items-center gap-1"><Users size={10} />Semua User</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-soft whitespace-nowrap">
                      <span className={v.expired_at > 0 && Date.now() > v.expired_at ? "text-red-400" : ""}>
                        {formatDate(v.expired_at)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {v.is_active
                        ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-mint-100 text-mint-600 border border-mint-200"><CheckCircle2 size={10} />Aktif</span>
                        : <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-cream-200 text-slate-soft border border-cream-300"><X size={10} />Nonaktif</span>
                      }
                    </td>
                    <td className="px-5 py-4">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setDeleteTarget(v)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 border border-red-200 hover:bg-red-50 transition-colors">
                        <Trash2 size={11} />Hapus
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {createOpen && (
          <CreateVoucherModal adminToken={adminToken!} onClose={() => setCreateOpen(false)} onCreated={handleCreated} />
        )}
        {deleteTarget && (
          <DeleteConfirmModal voucher={deleteTarget} adminToken={adminToken!}
            onClose={() => setDeleteTarget(null)} onDeleted={handleDeleted} />
        )}
      </AnimatePresence>
    </div>
  );
}

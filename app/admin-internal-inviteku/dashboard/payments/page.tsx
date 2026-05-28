"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, CheckCircle2, AlertTriangle, Loader2, X,
  ThumbsUp, ThumbsDown, Edit2, RefreshCw, Clock, Ban, Eye,
  TrendingUp, DollarSign, Wallet, Tag, ArrowUpRight,
} from "lucide-react";
import { useAdminStore } from "@/lib/store";
import {
  adminGetPendingPaymentsApi, adminGetApprovedPaymentsApi, adminGetRejectedPaymentsApi, adminGetAllPaymentsApi,
  adminVerifyPaymentApi, adminUpdateUndanganApi,
  getTemplatePricesApi,
  type AdminPayment, type TemplatePrice,
} from "@/lib/api";

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(val?: string | number) {
  if (!val) return "—";
  const ms = Number(val);
  const d = isNaN(ms) ? new Date(val as string) : new Date(ms);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatRupiah(v?: number) {
  if (!v) return "—";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v);
}

// ── Status Badge ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    paid:     { label: "Paid", cls: "bg-mint-100 text-mint-500 border border-mint-200", icon: <CheckCircle2 size={10} /> },
    approved: { label: "Approved", cls: "bg-mint-100 text-mint-500 border border-mint-200", icon: <CheckCircle2 size={10} /> },
    pending:  { label: "Pending", cls: "bg-peach-100 text-peach-500 border border-peach-200", icon: <Clock size={10} /> },
    rejected: { label: "Rejected", cls: "bg-red-50 text-red-500 border border-red-100", icon: <Ban size={10} /> },
    failed:   { label: "Failed", cls: "bg-cream-200 text-slate-soft border border-cream-300", icon: <X size={10} /> },
    draft:    { label: "Draft", cls: "bg-cream-200 text-slate-soft border border-cream-300", icon: null },
  };
  const s = map[status] ?? map.draft;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${s.cls}`}>
      {s.icon}{s.label}
    </span>
  );
}

// ── Revenue Stats Card ─────────────────────────────────────────────────────

function RevenueStats({ payments }: { payments: AdminPayment[] }) {
  const paid = payments.filter(p => p.status === "paid" || p.status === "approved");
  const totalRevenue = paid.reduce((s, p) => s + (p.amount ?? 0), 0);
  const totalDiscount = paid.reduce((s, p) => s + (p.discount_amount ?? 0), 0);
  const totalGross = totalRevenue + totalDiscount; // sebelum diskon
  const voucherUsed = paid.filter(p => (p.voucher_id ?? 0) > 0).length;

  const stats = [
    {
      label: "Total Pendapatan",
      value: formatRupiah(totalRevenue),
      sub: `dari ${paid.length} transaksi`,
      icon: <Wallet size={20} />,
      gradient: "linear-gradient(135deg, #9af5db 0%, #14b894 100%)",
      color: "#14b894",
    },
    {
      label: "Sebelum Diskon",
      value: formatRupiah(totalGross),
      sub: "harga template asli",
      icon: <TrendingUp size={20} />,
      gradient: "linear-gradient(135deg, #d9c8ff 0%, #80cfff 100%)",
      color: "#8b5cf6",
    },
    {
      label: "Total Diskon Voucher",
      value: formatRupiah(totalDiscount),
      sub: `${voucherUsed} transaksi pakai voucher`,
      icon: <Tag size={20} />,
      gradient: "linear-gradient(135deg, #ff9fb5 0%, #ffb06a 100%)",
      color: "#f97316",
    },
    {
      label: "Rata-rata per Transaksi",
      value: paid.length > 0 ? formatRupiah(Math.round(totalRevenue / paid.length)) : "—",
      sub: "rata-rata pendapatan",
      icon: <DollarSign size={20} />,
      gradient: "linear-gradient(135deg, #ffc2cf 0%, #d9c8ff 100%)",
      color: "#ec4899",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <motion.div key={s.label}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          className="bg-white rounded-2xl p-5 shadow-card relative overflow-hidden">
          {/* bg accent */}
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 -translate-y-4 translate-x-4"
            style={{ background: s.gradient }} />
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
              style={{ background: s.gradient }}>
              {s.icon}
            </div>
            <ArrowUpRight size={14} className="text-slate-soft" />
          </div>
          <p className="text-2xl font-extrabold text-ink tracking-tight">{s.value}</p>
          <p className="text-xs font-semibold text-slate-soft uppercase tracking-wider mt-1">{s.label}</p>
          <p className="text-[11px] text-slate-soft mt-0.5">{s.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}

// ── Verify Modal ───────────────────────────────────────────────────────────

function VerifyModal({
  payment, adminToken, onClose, onDone,
}: {
  payment: AdminPayment; adminToken: string; onClose: () => void; onDone: () => void;
}) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (approved: boolean) => {
    setLoading(true); setErr(null);
    try {
      await adminVerifyPaymentApi(adminToken, { order_id: payment.id, approved, note });
      onDone();
    } catch (e: unknown) {
      setErr((e as { message?: string })?.message ?? "Gagal memverifikasi.");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-float w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-ink flex items-center gap-2">
            <CreditCard size={16} className="text-lavender-400" />Verifikasi Pembayaran
          </h2>
          <button onClick={onClose} className="text-slate-soft hover:text-red-400 transition-colors"><X size={18} /></button>
        </div>

        <div className="bg-cream-50 rounded-xl p-4 space-y-1.5 border border-cream-300 text-sm">
          <p className="text-slate-soft">Order <span className="font-mono font-semibold text-ink">#{payment.id}</span></p>
          <p className="text-slate-soft">Undangan: <span className="font-semibold text-ink">{payment.nama_undangan ?? `#${payment.id_undangan}`}</span></p>
          {payment.user_name && <p className="text-slate-soft">User: <span className="font-semibold text-ink">{payment.user_name}</span></p>}
          {payment.amount && (
            <p className="text-slate-soft">Jumlah: <span className="font-bold text-mint-600 text-base">{formatRupiah(payment.amount)}</span>
              {(payment.discount_amount ?? 0) > 0 && <span className="text-xs text-peach-500 ml-1">(diskon {formatRupiah(payment.discount_amount)})</span>}
            </p>
          )}
          {payment.bukti_transfer && (
            <a href={payment.bukti_transfer} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-lavender-500 hover:underline mt-1">
              <Eye size={11} />Lihat Bukti Transfer
            </a>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-ink-muted">Catatan Admin (opsional)</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
            placeholder="Misal: Pembayaran valid, atau: Nominal tidak sesuai"
            className="input-pastel w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-ink text-sm resize-none" />
        </div>

        {err && <p className="text-red-500 text-xs flex items-center gap-1"><AlertTriangle size={12} />{err}</p>}

        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => submit(false)} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #ff9fb5 0%, #ff7a99 100%)" }}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : <ThumbsDown size={14} />}Tolak
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => submit(true)} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #9af5db 0%, #14b894 100%)" }}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : <ThumbsUp size={14} />}Terima
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Admin Edit Modal ───────────────────────────────────────────────────────

function AdminEditModal({
  payment, adminToken, templates, onClose, onDone,
}: {
  payment: AdminPayment; adminToken: string; templates: TemplatePrice[];
  onClose: () => void; onDone: () => void;
}) {
  const [nama, setNama] = useState(payment.nama_undangan ?? "");
  const [template, setTemplate] = useState(payment.template ?? "");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErr(null);
    try {
      await adminUpdateUndanganApi(adminToken, { id_undangan: payment.id_undangan, nama, template, note });
      onDone();
    } catch (e: unknown) {
      setErr((e as { message?: string })?.message ?? "Gagal menyimpan.");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-float w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-ink flex items-center gap-2">
            <Edit2 size={16} className="text-lavender-400" />Edit Undangan (Admin)
          </h2>
          <button onClick={onClose} className="text-slate-soft hover:text-red-400 transition-colors"><X size={18} /></button>
        </div>
        <p className="text-xs text-slate-soft bg-peach-50 border border-peach-200 rounded-lg px-3 py-2">
          Override admin — perubahan ini akan diterapkan langsung ke undangan user.
        </p>
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink-muted">Nama Undangan</label>
            <input value={nama} onChange={e => setNama(e.target.value)} required
              className="input-pastel w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-ink text-sm" />
          </div>
          {templates.length > 0 && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink-muted">Template</label>
              <select value={template} onChange={e => setTemplate(e.target.value)}
                className="input-pastel w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-ink text-sm">
                <option value="">-- Pilih Template --</option>
                {templates.map(t => <option key={t.id} value={t.template}>{t.name_template}</option>)}
              </select>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink-muted">Catatan Admin</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} required
              placeholder="Misal: Perbaikan typo nama dari CS"
              className="input-pastel w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-ink text-sm resize-none" />
          </div>
          {err && <p className="text-red-500 text-xs flex items-center gap-1"><AlertTriangle size={12} />{err}</p>}
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm text-slate-soft hover:bg-cream-200 transition-colors">Batal</button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #d9c8ff 0%, #80cfff 100%)" }}>
              {saving ? <><Loader2 size={13} className="animate-spin" />Menyimpan…</> : "Simpan Override"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Payment Table ──────────────────────────────────────────────────────────

function PaymentTable({
  payments, showActions, adminToken, templates, onRefresh,
}: {
  payments: AdminPayment[]; showActions: boolean;
  adminToken: string; templates: TemplatePrice[]; onRefresh: () => void;
}) {
  const [verifyTarget, setVerifyTarget] = useState<AdminPayment | null>(null);
  const [editTarget, setEditTarget] = useState<AdminPayment | null>(null);

  if (payments.length === 0) {
    return (
      <div className="text-center py-14 bg-white rounded-2xl shadow-card">
        <CheckCircle2 size={28} className="text-mint-400 mx-auto mb-3" />
        <p className="font-semibold text-ink">Tidak ada data</p>
        <p className="text-sm text-slate-soft mt-1">Belum ada pembayaran di kategori ini.</p>
      </div>
    );
  }

  const handleDone = () => { setVerifyTarget(null); setEditTarget(null); onRefresh(); };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-200 bg-cream-50">
                {["Order", "Undangan", "User", "Template", "Jumlah", "Diskon", "Metode", "Status", "Tgl Bayar", "Aksi"].map(h => (
                  <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-slate-soft uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => (
                <motion.tr key={p.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-cream-100 table-row-hover">
                  <td className="px-4 py-4">
                    <span className="font-mono text-xs text-lavender-500 font-semibold">#{p.id}</span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-ink max-w-[140px] truncate">{p.nama_undangan ?? `Undangan #${p.id_undangan}`}</p>
                    {p.requested_key && (
                      <p className="text-[10px] text-slate-soft font-mono">/{p.requested_key}</p>
                    )}
                    {p.bukti_transfer && (
                      <a href={p.bukti_transfer} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-lavender-500 hover:underline mt-0.5">
                        <Eye size={10} />Lihat bukti
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-ink text-xs font-medium">{p.user_name ?? "—"}</p>
                    <p className="text-[10px] text-slate-soft">{p.user_email ?? ""}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs bg-cream-100 px-2 py-0.5 rounded-lg text-slate-soft font-mono">
                      {p.template ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {p.amount ? (
                      <span className="font-bold text-mint-700 text-sm">{formatRupiah(p.amount)}</span>
                    ) : <span className="text-slate-soft">—</span>}
                  </td>
                  <td className="px-4 py-4">
                    {(p.discount_amount ?? 0) > 0 ? (
                      <span className="text-xs font-semibold text-peach-600 bg-peach-50 px-2 py-0.5 rounded-full">
                        -{formatRupiah(p.discount_amount)}
                      </span>
                    ) : <span className="text-slate-soft text-xs">—</span>}
                  </td>
                  <td className="px-4 py-4">
                    {p.payment_method ? (
                      <span className="text-xs bg-lavender-50 text-lavender-600 px-2 py-0.5 rounded-full font-medium capitalize">
                        {p.payment_method}
                      </span>
                    ) : <span className="text-slate-soft text-xs">—</span>}
                  </td>
                  <td className="px-4 py-4"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-4 text-xs text-slate-soft whitespace-nowrap">
                    {p.verified_at ? formatDate(p.verified_at) : formatDate(p.created_at)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {showActions && (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => setVerifyTarget(p)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white"
                          style={{ background: "linear-gradient(135deg, #ffc2cf 0%, #d9c8ff 100%)" }}>
                          <CreditCard size={11} />Verifikasi
                        </motion.button>
                      )}
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setEditTarget(p)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-cream-300 text-ink-muted hover:bg-cream-100 transition-all">
                        <Edit2 size={11} />Edit
                      </motion.button>
                    </div>
                    {p.note && (
                      <p className="text-xs text-slate-soft mt-1 max-w-[140px] truncate" title={p.note}>
                        Note: {p.note}
                      </p>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {verifyTarget && (
          <VerifyModal payment={verifyTarget} adminToken={adminToken}
            onClose={() => setVerifyTarget(null)} onDone={handleDone} />
        )}
        {editTarget && (
          <AdminEditModal payment={editTarget} adminToken={adminToken} templates={templates}
            onClose={() => setEditTarget(null)} onDone={handleDone} />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

type Tab = "pending" | "paid" | "rejected" | "all";

export default function AdminPaymentsPage() {
  const { adminToken } = useAdminStore();
  const [activeTab, setActiveTab] = useState<Tab>("paid");
  const [pendingPayments, setPendingPayments] = useState<AdminPayment[]>([]);
  const [paidPayments, setPaidPayments] = useState<AdminPayment[]>([]);
  const [rejectedPayments, setRejectedPayments] = useState<AdminPayment[]>([]);
  const [allPayments, setAllPayments] = useState<AdminPayment[]>([]);
  const [templates, setTemplates] = useState<TemplatePrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!adminToken) return;
    setLoading(true); setError(null);
    try {
      const [pendRes, appRes, rejRes, allRes, tplRes] = await Promise.all([
        adminGetPendingPaymentsApi(adminToken),
        adminGetApprovedPaymentsApi(adminToken),
        adminGetRejectedPaymentsApi(adminToken),
        adminGetAllPaymentsApi(adminToken),
        getTemplatePricesApi(),
      ]);
      setPendingPayments(Array.isArray(pendRes.data) ? pendRes.data : []);
      setPaidPayments(Array.isArray(appRes.data) ? appRes.data : []);
      setRejectedPayments(Array.isArray(rejRes.data) ? rejRes.data : []);
      setAllPayments(Array.isArray(allRes.data) ? allRes.data : []);
      setTemplates(Array.isArray(tplRes.data) ? tplRes.data : []);
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? "Gagal memuat data.");
    } finally { setLoading(false); }
  }, [adminToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "paid",    label: "Paid",    count: paidPayments.length },
    { key: "pending", label: "Pending", count: pendingPayments.length },
    { key: "rejected",label: "Rejected",count: rejectedPayments.length },
    { key: "all",     label: "Semua",   count: allPayments.length },
  ];

  const currentPayments =
    activeTab === "pending"  ? pendingPayments  :
    activeTab === "paid"     ? paidPayments     :
    activeTab === "rejected" ? rejectedPayments :
    allPayments;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
            style={{ background: "linear-gradient(135deg, #d9c8ff 0%, #80cfff 100%)" }}>
            <CreditCard size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink">Manajemen Pembayaran</h1>
            <p className="text-sm text-slate-soft">Statistik pendapatan & kelola transaksi</p>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={fetchData} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-cream-300 text-ink-muted hover:bg-cream-100 transition-all disabled:opacity-50">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />Refresh
        </motion.button>
      </motion.div>

      {/* Revenue Stats — dari transaksi paid */}
      {!loading && !error && <RevenueStats payments={paidPayments} />}

      {/* Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Pending", value: pendingPayments.length, color: "#ffb06a", tab: "pending" as Tab },
          { label: "Paid", value: paidPayments.length, color: "#14b894", tab: "paid" as Tab },
          { label: "Rejected/Failed", value: rejectedPayments.length, color: "#f95c7e", tab: "rejected" as Tab },
          { label: "Total Order", value: allPayments.length, color: "#8b5cf6", tab: "all" as Tab },
        ].map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setActiveTab(s.tab)}
            className={`bg-white rounded-2xl p-4 shadow-card flex items-center gap-3 cursor-pointer transition-all duration-200 ${activeTab === s.tab ? "ring-2 ring-offset-1" : "hover:shadow-float"}`}
            style={{ '--tw-ring-color': s.color } as React.CSSProperties}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: s.color + "22", color: s.color }}>
              <CreditCard size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-soft uppercase tracking-wider">{s.label}</p>
              <p className="text-xl font-bold text-ink">{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-cream-100 p-1.5 rounded-2xl w-fit">
        {tabs.map(t => (
          <button key={t.key} id={`tab-${t.key}`}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === t.key ? "tab-active" : "text-slate-soft hover:text-ink"}`}>
            {t.label}
            {t.count !== undefined && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${activeTab === t.key ? "bg-white/40" : "bg-cream-200"}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-lavender-400" />
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-card">
          <AlertTriangle size={24} className="text-red-400 mx-auto mb-2" />
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={fetchData} className="text-lavender-500 text-sm underline mt-2">Coba lagi</button>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <PaymentTable
              payments={currentPayments}
              showActions={activeTab === "pending"}
              adminToken={adminToken!}
              templates={templates}
              onRefresh={fetchData}
            />
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

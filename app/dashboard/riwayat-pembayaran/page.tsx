"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, CheckCircle2, Clock, Ban, X, Loader2, AlertTriangle,
  RefreshCw, Receipt, Tag, ExternalLink, TrendingDown, Wallet, ArrowUpRight,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import {
  getMyPaymentsApi, getUndanganApi,
  type UserPaymentOrder, type Undangan,
} from "@/lib/api";

// ── Helpers ────────────────────────────────────────────────────────────────

function formatRupiah(v: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", minimumFractionDigits: 0,
  }).format(v);
}

function formatDate(ms?: number | string) {
  if (!ms) return "—";
  const n = Number(ms);
  const d = isNaN(n) ? new Date(ms as string) : new Date(n);
  return d.toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Status Badge ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    paid:     { label: "Berhasil", cls: "bg-mint-100 text-mint-600 border border-mint-200", icon: <CheckCircle2 size={11} /> },
    approved: { label: "Berhasil", cls: "bg-mint-100 text-mint-600 border border-mint-200", icon: <CheckCircle2 size={11} /> },
    pending:  { label: "Menunggu", cls: "bg-peach-100 text-peach-600 border border-peach-200", icon: <Clock size={11} /> },
    rejected: { label: "Ditolak",  cls: "bg-red-50 text-red-500 border border-red-100",    icon: <Ban size={11} /> },
    failed:   { label: "Gagal",    cls: "bg-cream-200 text-slate-soft border border-cream-300", icon: <X size={11} /> },
  };
  const s = map[status] ?? map.failed;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.cls}`}>
      {s.icon}{s.label}
    </span>
  );
}

// ── Order Detail Modal ─────────────────────────────────────────────────────

function OrderDetailModal({
  order, undanganMap, onClose,
}: {
  order: UserPaymentOrder;
  undanganMap: Record<number, Undangan>;
  onClose: () => void;
}) {
  const undangan = undanganMap[order.id_undangan];
  const originalPrice = order.amount + (order.discount_amount ?? 0);

  const rows = [
    { label: "ID Order", value: `#${order.id}` },
    { label: "Undangan", value: undangan?.nama ?? `Undangan #${order.id_undangan}` },
    { label: "Template", value: undangan?.template ?? "—" },
    { label: "Key URL", value: order.requested_key ? `/${order.requested_key}` : "—" },
    { label: "Status", value: <StatusBadge status={order.status} /> },
    { label: "Metode Bayar", value: order.payment_method ?? "—" },
    { label: "Harga Asli", value: formatRupiah(originalPrice) },
    ...(order.discount_amount && order.discount_amount > 0 ? [
      { label: "Diskon Voucher", value: <span className="text-peach-500 font-semibold">-{formatRupiah(order.discount_amount)}</span> },
    ] : []),
    { label: "Total Dibayar", value: <span className="font-extrabold text-mint-700 text-base">{formatRupiah(order.amount)}</span> },
    { label: "Tanggal Order", value: formatDate(order.created_at) },
    { label: "Tanggal Verifikasi", value: order.verified_at ? formatDate(order.verified_at) : "—" },
    ...(order.note ? [{ label: "Catatan", value: order.note }] : []),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-float w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cream-200">
          <h2 className="font-bold text-ink flex items-center gap-2 text-lg">
            <Receipt size={18} className="text-lavender-400" />Detail Pembayaran
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-cream-100 text-slate-soft hover:text-red-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Rows */}
        <div className="space-y-2.5">
          {rows.map((r, i) => (
            <div key={i} className="flex items-start justify-between gap-4 py-1.5 border-b border-cream-100 last:border-0">
              <span className="text-xs text-slate-soft font-medium shrink-0">{r.label}</span>
              <span className="text-xs text-ink font-semibold text-right">{r.value}</span>
            </div>
          ))}
        </div>

        {/* Bukti Transfer */}
        {order.bukti_transfer && (
          <a href={order.bukti_transfer} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 text-sm text-lavender-500 hover:underline mt-2">
            <ExternalLink size={14} />Lihat Bukti Transfer
          </a>
        )}

        {/* Payment URL (jika masih pending) */}
        {order.status === "pending" && order.payment_url && (
          <a href={order.payment_url} target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white mt-2"
            style={{ background: "linear-gradient(135deg, #ff9fb5 0%, #c2a7ff 100%)" }}>
            <CreditCard size={15} />Lanjutkan Pembayaran
          </a>
        )}

        <button onClick={onClose}
          className="w-full py-2.5 rounded-xl text-sm font-medium text-slate-soft border border-cream-300 hover:bg-cream-100 transition-colors">
          Tutup
        </button>
      </motion.div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function RiwayatPembayaranPage() {
  const { token } = useAuthStore();
  const [orders, setOrders] = useState<UserPaymentOrder[]>([]);
  const [undanganMap, setUndanganMap] = useState<Record<number, Undangan>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<UserPaymentOrder | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError(null);
    try {
      const res = await getMyPaymentsApi(token);
      const data = Array.isArray(res.data) ? res.data : [];
      setOrders(data);

      // Fetch nama undangan untuk setiap order (best-effort)
      const undanganRes = await getUndanganApi(token).catch(() => ({ data: [] as Undangan[] }));
      const map: Record<number, Undangan> = {};
      (Array.isArray(undanganRes.data) ? undanganRes.data : []).forEach((u: Undangan) => { map[u.id] = u; });
      setUndanganMap(map);
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? "Gagal memuat riwayat pembayaran.");
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Stats
  const paidOrders = orders.filter(o => o.status === "paid" || o.status === "approved");
  const totalSpent = paidOrders.reduce((s, o) => s + (o.amount ?? 0), 0);
  const totalSaved = paidOrders.reduce((s, o) => s + (o.discount_amount ?? 0), 0);

  const filters = [
    { key: "all",     label: "Semua",    count: orders.length },
    { key: "paid",    label: "Berhasil", count: paidOrders.length },
    { key: "pending", label: "Pending",  count: orders.filter(o => o.status === "pending").length },
    { key: "failed",  label: "Gagal",    count: orders.filter(o => o.status === "failed" || o.status === "rejected").length },
  ];

  const filtered = filter === "all" ? orders :
    filter === "failed" ? orders.filter(o => o.status === "failed" || o.status === "rejected") :
    orders.filter(o => o.status === filter || (filter === "paid" && o.status === "approved"));

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
            style={{ background: "linear-gradient(135deg, #ff9fb5 0%, #c2a7ff 100%)" }}>
            <Receipt size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink">Riwayat Pembayaran</h1>
            <p className="text-sm text-slate-soft">Semua transaksi pembayaran undangan kamu</p>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={fetchData} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-cream-300 text-ink-muted hover:bg-cream-100 transition-all disabled:opacity-50">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />Refresh
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Total Transaksi",
              value: orders.length,
              sub: `${paidOrders.length} berhasil`,
              icon: <CreditCard size={20} />,
              gradient: "linear-gradient(135deg, #d9c8ff 0%, #80cfff 100%)",
            },
            {
              label: "Total Dibayar",
              value: formatRupiah(totalSpent),
              sub: `dari ${paidOrders.length} transaksi sukses`,
              icon: <Wallet size={20} />,
              gradient: "linear-gradient(135deg, #9af5db 0%, #14b894 100%)",
            },
            {
              label: "Total Hemat (Voucher)",
              value: totalSaved > 0 ? formatRupiah(totalSaved) : "Rp 0",
              sub: totalSaved > 0 ? "kamu hemat dari voucher 🎉" : "belum pakai voucher",
              icon: <TrendingDown size={20} />,
              gradient: "linear-gradient(135deg, #ffc2cf 0%, #ffb06a 100%)",
            },
          ].map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl p-5 shadow-card relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-10 -translate-y-2 translate-x-2"
                style={{ background: s.gradient }} />
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                  style={{ background: s.gradient }}>
                  {s.icon}
                </div>
                <ArrowUpRight size={14} className="text-slate-soft" />
              </div>
              <p className="text-2xl font-extrabold text-ink">{s.value}</p>
              <p className="text-xs font-semibold text-slate-soft uppercase tracking-wider mt-1">{s.label}</p>
              <p className="text-[11px] text-slate-soft mt-0.5">{s.sub}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-cream-100 p-1.5 rounded-2xl w-fit flex-wrap">
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${filter === f.key ? "tab-active" : "text-slate-soft hover:text-ink"}`}>
            {f.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${filter === f.key ? "bg-white/40" : "bg-cream-200"}`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 size={28} className="animate-spin text-lavender-400" />
          <p className="text-sm text-slate-soft">Memuat riwayat pembayaran…</p>
        </div>
      ) : error ? (
        <div className="text-center py-14 bg-white rounded-2xl shadow-card">
          <AlertTriangle size={24} className="text-red-400 mx-auto mb-2" />
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={fetchData} className="text-lavender-500 text-sm underline mt-2">Coba lagi</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-card">
          <Receipt size={40} className="text-lavender-200 mx-auto mb-4" />
          <p className="font-semibold text-ink">Belum ada transaksi</p>
          <p className="text-sm text-slate-soft mt-1">
            {filter === "all" ? "Transaksi pertama kamu akan muncul di sini." : `Tidak ada transaksi dengan status ini.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order, i) => {
            const undangan = undanganMap[order.id_undangan];
            const hasDiscount = (order.discount_amount ?? 0) > 0;
            const originalPrice = order.amount + (order.discount_amount ?? 0);

            return (
              <motion.div key={order.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl shadow-card p-5 flex items-center gap-4 hover:shadow-float transition-shadow duration-300 cursor-pointer group"
                onClick={() => setSelected(order)}>
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${
                  order.status === "paid" || order.status === "approved"
                    ? "bg-mint-100 text-mint-600"
                    : order.status === "pending"
                    ? "bg-peach-100 text-peach-500"
                    : "bg-cream-200 text-slate-soft"
                }`}>
                  <CreditCard size={22} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-ink text-sm truncate">
                      {undangan?.nama ?? `Undangan #${order.id_undangan}`}
                    </p>
                    <StatusBadge status={order.status} />
                    {hasDiscount && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-peach-50 text-peach-500 px-1.5 py-0.5 rounded-full font-semibold">
                        <Tag size={8} />Voucher
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {undangan?.template && (
                      <span className="text-[11px] bg-cream-100 text-slate-soft px-2 py-0.5 rounded-lg font-mono">
                        {undangan.template}
                      </span>
                    )}
                    {order.payment_method && (
                      <span className="text-[11px] text-slate-soft capitalize">
                        via {order.payment_method}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-soft">{formatDate(order.created_at)}</span>
                  </div>
                  {order.note && order.status === "rejected" && (
                    <p className="text-xs text-red-400 mt-1 truncate">Catatan: {order.note}</p>
                  )}
                </div>

                {/* Price */}
                <div className="text-right flex-shrink-0">
                  <p className={`font-extrabold text-base ${
                    order.status === "paid" || order.status === "approved" ? "text-mint-700" : "text-ink"
                  }`}>
                    {formatRupiah(order.amount)}
                  </p>
                  {hasDiscount && (
                    <p className="text-[11px] text-slate-soft line-through">{formatRupiah(originalPrice)}</p>
                  )}
                  <p className="text-[10px] text-slate-soft mt-0.5">Lihat detail →</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <OrderDetailModal
            order={selected}
            undanganMap={undanganMap}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

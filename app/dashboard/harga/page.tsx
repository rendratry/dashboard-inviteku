"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CreditCard, CheckCircle2, AlertTriangle, Loader2, Sparkles, Tag,
} from "lucide-react";
import Link from "next/link";
import { getTemplatePricesApi, type TemplatePrice } from "@/lib/api";

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

const CARD_GRADIENTS = [
  { from: "#ffc2cf", to: "#d9c8ff" },
  { from: "#d9c8ff", to: "#b3e3ff" },
  { from: "#b3e3ff", to: "#9af5db" },
  { from: "#9af5db", to: "#ffc2cf" },
];

const DEFAULT_FEATURES = [
  "Undangan digital eksklusif",
  "Manajemen tamu unlimited",
  "Upload foto & galeri",
  "Musik latar pilihan",
  "RSVP & kotak ucapan",
];

function PriceCard({ price, index }: { price: TemplatePrice; index: number }) {
  const grad = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  const features = price.features ?? DEFAULT_FEATURES;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl shadow-card hover:shadow-float transition-all duration-300 overflow-hidden flex flex-col"
    >
      {price.thumbnail ? (
        <div className="w-full h-40 overflow-hidden relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={price.thumbnail} alt={price.name_template} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      ) : (
        <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${grad.from} 0%, ${grad.to} 100%)` }} />
      )}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${grad.from} 0%, ${grad.to} 100%)` }}
          >
            <Sparkles size={20} strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-bold text-ink text-base">{price.name_template}</p>
            <p className="text-xs text-slate-soft font-mono">{price.template}</p>
          </div>
        </div>
        <div className="mb-5">
          <p className="text-3xl font-extrabold text-ink">{formatRupiah(price.effective_price)}</p>
          {price.description && (
            <p className="text-xs text-slate-soft mt-1 leading-relaxed">{price.description}</p>
          )}
        </div>
        <ul className="space-y-2 flex-1 mb-6">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-ink-muted">
              <CheckCircle2 size={14} className="text-mint-400 mt-0.5 flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <Link href="/dashboard/undangan">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white text-center cursor-pointer"
            style={{ background: `linear-gradient(135deg, ${grad.from} 0%, ${grad.to} 100%)` }}
          >
            Pilih Template Ini
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
}

export default function HargaPage() {
  const [prices, setPrices] = useState<TemplatePrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getTemplatePricesApi()
      .then((res) => setPrices(Array.isArray(res.data) ? res.data : []))
      .catch((e: { message?: string }) => setError(e?.message ?? "Gagal memuat harga."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
          style={{ background: "linear-gradient(135deg, #ffc2cf 0%, #d9c8ff 100%)" }}
        >
          <CreditCard size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-ink">Harga Template</h1>
          <p className="text-sm text-slate-soft">Pilih paket undangan digital yang sesuai untuk Anda</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative overflow-hidden rounded-2xl p-5 text-white"
        style={{ background: "linear-gradient(135deg, #ff9fb5 0%, #c2a7ff 50%, #80cfff 100%)" }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -translate-y-1/3 translate-x-1/3" />
        <div className="relative flex items-center gap-3">
          <Tag size={20} className="flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Satu kali bayar, undangan seumur hidup</p>
            <p className="text-xs text-white/80 mt-0.5">
              Setelah pembayaran diverifikasi, undangan Anda akan langsung dipublikasikan oleh tim kami.
            </p>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-blush-400" />
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-card">
          <AlertTriangle size={24} className="text-red-400 mx-auto mb-2" />
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={load} className="text-blush-500 text-sm underline mt-2">Coba lagi</button>
        </div>
      ) : prices.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-card">
          <Sparkles size={28} className="text-lavender-400 mx-auto mb-3" />
          <p className="font-semibold text-ink">Belum ada paket harga</p>
          <p className="text-sm text-slate-soft mt-1">Cek kembali nanti.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {prices.map((p, i) => <PriceCard key={p.id} price={p} index={i} />)}
        </div>
      )}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-xs text-slate-soft/60 pb-4"
      >
        Pembayaran melalui transfer bank · Verifikasi oleh tim Inviteku dalam 1×24 jam
      </motion.p>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CreditCard, CheckCircle2, AlertTriangle, Loader2, Sparkles, Tag, Eye
} from "lucide-react";
import Link from "next/link";
import { getTemplatePricesApi, type TemplatePrice } from "@/lib/api";
import { useTranslation } from "@/lib/i18n/dictionaries";

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

function PriceCard({ price, index }: { price: TemplatePrice; index: number }) {
  const grad = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  const { t, lang } = useTranslation();
  
  // If API gives features, use it, otherwise use translated defaults
  const defaultFeaturesID = [
    "Undangan digital eksklusif",
    "Manajemen tamu unlimited",
    "Upload foto & galeri",
    "Musik latar pilihan",
    "RSVP & kotak ucapan",
  ];
  const defaultFeaturesEN = [
    "Exclusive digital invitation",
    "Unlimited guest management",
    "Photo & gallery upload",
    "Selected background music",
    "RSVP & wishes box",
  ];
  const defaultFeatures = lang === "en" ? defaultFeaturesEN : defaultFeaturesID;
  const features = price.features ?? defaultFeatures;
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
          {price.is_disc && price.price_disc && price.price_disc > 0 ? (
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-extrabold text-ink">{formatRupiah(price.price_disc)}</p>
              <p className="text-sm line-through text-slate-soft">{formatRupiah(price.price ?? 0)}</p>
            </div>
          ) : (
            <p className="text-3xl font-extrabold text-ink">{formatRupiah(price.price ?? price.effective_price)}</p>
          )}
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
        <div className="flex gap-2">
          <a
            href={`https://inviteku.com/template/preview/${price.template}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 px-4 bg-white border border-cream-200 text-ink text-sm font-semibold rounded-xl text-center hover:bg-cream-50 transition-colors flex items-center justify-center gap-1.5"
          >
            <Eye size={16} /> Preview
          </a>
          <Link
            href="/dashboard/undangan"
            className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-white text-sm text-center transition-all duration-200 hover:opacity-90 flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${grad.from} 0%, ${grad.to} 100%)` }}
          >
            {t.pricing.selectBtn}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function HargaPage() {
  const [prices, setPrices] = useState<TemplatePrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

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
      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl p-8 text-white mb-8"
        style={{ background: "linear-gradient(135deg, #ffc2cf 0%, #b3e3ff 100%)" }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/4" />
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2 text-ink">{t.pricing.bannerTitle}</h2>
            <p className="text-ink/80 text-sm max-w-lg leading-relaxed">
              {t.pricing.bannerSub}
            </p>
          </div>
          <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-white/30 backdrop-blur-md items-center justify-center flex-shrink-0 text-ink">
            <CreditCard size={32} strokeWidth={1.5} />
          </div>
        </div>
      </motion.div>

      {/* Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold text-ink mb-1 flex items-center gap-2"
        >
          <Tag size={24} className="text-blush-400" />
          {t.pricing.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-slate-soft"
        >
          {t.pricing.subtitle}
        </motion.p>
      </div>

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

      <div className="mt-12 text-center">
        <p className="text-xs font-medium text-slate-soft/80 inline-flex items-center gap-1.5 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
          <CheckCircle2 size={14} className="text-mint-500" />
          {t.pricing.footerInfo}
        </p>
      </div>
    </div>
  );
}

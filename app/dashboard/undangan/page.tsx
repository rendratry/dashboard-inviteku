"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Mail, Plus, CheckCircle2, AlertTriangle, Loader2, Link2,
  CalendarClock, Eye, Edit2, CreditCard, X, ImageIcon,
  Clock, Ban, Send, Sparkles, LayoutGrid, Check, HelpCircle,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import {
  createUndanganApi, getUndanganApi, getPaymentStatusApi,
  updateUndanganApi, requestPublishApi, getTemplatePricesApi,
  generatePreviewTokenApi,
  type Undangan, type PaymentStatus, type TemplatePrice,
} from "@/lib/api";

// ── Helpers ────────────────────────────────────────────────────────────────

function formatExp(exp?: string) {
  if (!exp) return null;
  const ms = Number(exp);
  if (isNaN(ms)) return null;
  return new Date(ms).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
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

// ── Status Badge ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status?: string; isPublished?: boolean }) {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    approved: { label: "Published", cls: "bg-mint-100 text-mint-500 border border-mint-200", icon: <CheckCircle2 size={10} /> },
    pending:  { label: "Menunggu Verifikasi", cls: "bg-peach-100 text-peach-500 border border-peach-200", icon: <Clock size={10} /> },
    rejected: { label: "Ditolak", cls: "bg-red-50 text-red-500 border border-red-100", icon: <Ban size={10} /> },
    draft:    { label: "Draft", cls: "bg-cream-200 text-slate-soft border border-cream-300", icon: null },
  };
  const s = map[status ?? "draft"] ?? map.draft;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${s.cls}`}>
      {s.icon}{s.label}
    </span>
  );
}

// ── Template Picker Modal ──────────────────────────────────────────────────

function TemplatePickerModal({
  templates, selected, onSelect, onClose
}: {
  templates: TemplatePrice[]; selected: string; onSelect: (t: string) => void; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-ink/40 backdrop-blur-md">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl shadow-float w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-cream-200 bg-white z-10 sticky top-0">
          <div>
            <h2 className="text-xl font-bold text-ink flex items-center gap-2">
              <LayoutGrid className="text-blush-400" size={24} />
              Pilih Template
            </h2>
            <p className="text-sm text-slate-soft mt-1">Pilih desain yang paling cocok untuk momen spesial Anda.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-cream-100 text-slate-soft hover:text-red-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-cream-50">
          {templates.length === 0 ? (
            <div className="text-center py-12">
              <Loader2 size={32} className="animate-spin text-blush-400 mx-auto mb-4" />
              <p className="text-slate-soft">Memuat template...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((price, index) => {
                const grad = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
                const isSelected = selected === price.template;
                const features = price.features ?? DEFAULT_FEATURES;

                return (
                  <motion.div
                    key={price.id}
                    whileHover={{ y: -4 }}
                    onClick={() => {
                      onSelect(price.template);
                      onClose();
                    }}
                    className={`relative bg-white rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden flex flex-col ${
                      isSelected ? 'ring-4 ring-blush-400 shadow-lg' : 'shadow-card hover:shadow-float border border-cream-200'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 z-10 bg-blush-500 text-white rounded-full p-1.5 shadow-md">
                        <Check size={16} strokeWidth={3} />
                      </div>
                    )}
                    
                    {price.thumbnail ? (
                      <div className="w-full h-40 overflow-hidden relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={price.thumbnail} alt={price.name_template} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-3 left-3 text-white">
                          <p className="font-bold text-lg leading-tight drop-shadow-md">{price.name_template}</p>
                          <p className="text-xs opacity-90 drop-shadow-md">{price.template}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-24 w-full relative flex items-end p-4" style={{ background: `linear-gradient(135deg, ${grad.from} 0%, ${grad.to} 100%)` }}>
                        <div className="text-white">
                          <p className="font-bold text-lg leading-tight drop-shadow-sm">{price.name_template}</p>
                          <p className="text-xs opacity-90 drop-shadow-sm">{price.template}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="p-5 flex flex-col flex-1">
                      <div className="mb-4">
                        {price.is_disc && price.price_disc && price.price_disc > 0 ? (
                          <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-extrabold text-ink">{formatRupiah(price.price_disc)}</p>
                            <p className="text-sm line-through text-slate-soft">{formatRupiah(price.price ?? 0)}</p>
                          </div>
                        ) : (
                          <p className="text-2xl font-extrabold text-ink">{formatRupiah(price.price ?? price.effective_price)}</p>
                        )}
                        {price.description && (
                          <p className="text-xs text-slate-soft mt-1 leading-relaxed line-clamp-2">{price.description}</p>
                        )}
                      </div>
                      <ul className="space-y-1.5 flex-1 mb-4">
                        {features.slice(0, 4).map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-ink-muted">
                            <CheckCircle2 size={12} className="text-mint-400 mt-0.5 flex-shrink-0" />
                            <span className="truncate">{f}</span>
                          </li>
                        ))}
                        {features.length > 4 && (
                          <li className="text-xs text-slate-soft pl-5 italic">+{features.length - 4} fitur lainnya</li>
                        )}
                      </ul>
                      
                      <button 
                        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                          isSelected 
                            ? 'bg-blush-50 text-blush-600' 
                            : 'bg-cream-100 text-ink hover:bg-cream-200'
                        }`}
                      >
                        {isSelected ? 'Terpilih' : 'Pilih Template'}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Edit Modal ─────────────────────────────────────────────────────────────

function EditModal({
  undangan, templates, token, onClose, onSaved,
}: {
  undangan: Undangan; templates: TemplatePrice[]; token: string;
  onClose: () => void; onSaved: () => void;
}) {
  const [nama, setNama] = useState(undangan.nama);
  const [template, setTemplate] = useState(undangan.template ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErr(null);
    try {
      await updateUndanganApi(token, { id_undangan: undangan.id, nama, template });
      onSaved();
    } catch (e: unknown) {
      setErr((e as { message?: string })?.message ?? "Gagal menyimpan.");
    } finally { setSaving(false); }
  };

  const selectedTemplateData = templates.find(t => t.template === template);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-float w-full max-w-md p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-cream-200 pb-4">
            <h2 className="font-bold text-ink flex items-center gap-2 text-lg"><Edit2 size={18} className="text-blush-400" />Edit Undangan</h2>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-cream-100 text-slate-soft hover:text-red-400 transition-colors"><X size={18} /></button>
          </div>
          
          <form onSubmit={save} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-ink-muted">Nama Undangan</label>
              <input value={nama} onChange={e => setNama(e.target.value)} required
                className="input-pastel w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-ink text-sm" />
            </div>
            
            {templates.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-ink-muted">Template</label>
                
                {template && selectedTemplateData ? (
                  <div className="border border-cream-300 bg-white rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {selectedTemplateData.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={selectedTemplateData.thumbnail} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-lavender-200 to-blush-200 flex items-center justify-center">
                          <LayoutGrid size={16} className="text-white" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-sm text-ink">{selectedTemplateData.name_template}</p>
                        <p className="text-xs text-slate-soft font-mono">{template}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setShowPicker(true)}
                      className="text-xs font-medium text-blush-500 hover:text-blush-600 hover:bg-blush-50 px-3 py-1.5 rounded-lg transition-colors">
                      Ganti
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setShowPicker(true)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 hover:bg-cream-100 transition-colors text-left">
                    <span className="text-sm text-slate-soft">{template ? template : "Pilih Template..."}</span>
                    <LayoutGrid size={16} className="text-slate-soft" />
                  </button>
                )}
              </div>
            )}
            
            {err && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex gap-2 text-red-600 text-sm">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <p>{err}</p>
              </div>
            )}
            
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-soft hover:bg-cream-200 transition-colors">Batal</button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 shadow-md"
                style={{ background: "linear-gradient(135deg, #ff9fb5 0%, #c2a7ff 100%)" }}>
                {saving ? <><Loader2 size={16} className="animate-spin" />Menyimpan…</> : "Simpan Perubahan"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>

      <AnimatePresence>
        {showPicker && (
          <TemplatePickerModal 
            templates={templates} 
            selected={template} 
            onSelect={setTemplate} 
            onClose={() => setShowPicker(false)} 
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Checkout Modal ─────────────────────────────────────────────────────────

function CheckoutModal({
  undangan, templates, token, onClose, onSuccess,
}: {
  undangan: Undangan; templates: TemplatePrice[]; token: string;
  onClose: () => void; onSuccess: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [customKey, setCustomKey] = useState("");
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const templatePrice = templates.find(t => t.template === undangan.template);

  const handleFile = (f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !customKey.trim()) {
      setErr("Silakan isi Key Undangan dan upload Bukti Transfer.");
      return;
    }
    setUploading(true); setErr(null);
    try {
      const fd = new FormData();
      fd.append("id_undangan", String(undangan.id));
      fd.append("key", customKey.trim());
      fd.append("bukti_transfer", file);
      await requestPublishApi(token, fd);
      onSuccess();
    } catch (e: unknown) {
      setErr((e as { message?: string })?.message ?? "Gagal mengirim.");
    } finally { setUploading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-float w-full max-w-md p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-cream-200 pb-4">
          <h2 className="font-bold text-ink flex items-center gap-2 text-lg"><CreditCard size={18} className="text-blush-400" />Request Publish</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-cream-100 text-slate-soft hover:text-red-400 transition-colors"><X size={18} /></button>
        </div>

        {/* Price Info */}
        <div className="bg-cream-50 rounded-xl p-4 border border-cream-300 flex items-center gap-4">
          {templatePrice?.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={templatePrice.thumbnail} alt="" className="w-16 h-16 rounded-lg object-cover border border-cream-200" />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-lavender-200 to-blush-200 flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
          )}
          <div>
            <p className="text-xs text-slate-soft mb-0.5">Template {undangan.template}</p>
            <p className="font-semibold text-ink text-sm">{templatePrice?.name_template ?? "—"}</p>
            {templatePrice && (
              <div className="flex items-center gap-2 mt-0.5">
                {templatePrice.is_disc && templatePrice.price_disc && templatePrice.price_disc > 0 ? (
                  <>
                    <p className="text-lg font-extrabold text-blush-500">{formatRupiah(templatePrice.price_disc)}</p>
                    <p className="text-xs line-through text-slate-soft">{formatRupiah(templatePrice.price ?? 0)}</p>
                  </>
                ) : (
                  <p className="text-lg font-extrabold text-blush-500">{formatRupiah(templatePrice.price ?? templatePrice.effective_price)}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bank Info */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-soft uppercase tracking-wider">Instruksi Pembayaran</p>
          <div className="bg-lavender-50 border border-lavender-200 rounded-xl p-4 space-y-2.5 text-sm">
            <div className="flex justify-between"><span className="text-slate-soft">Bank</span><span className="font-semibold text-ink">BCA</span></div>
            <div className="flex justify-between"><span className="text-slate-soft">No. Rekening</span><span className="font-semibold text-ink font-mono text-base">5721813143</span></div>
            <div className="flex justify-between"><span className="text-slate-soft">Atas Nama</span><span className="font-semibold text-ink">Rendra Tri Kusuma</span></div>
            {templatePrice && <div className="flex justify-between border-t border-lavender-200 pt-2.5 mt-1"><span className="text-slate-soft">Jumlah Transfer</span><span className="font-bold text-blush-500 text-lg">{formatRupiah(templatePrice.effective_price)}</span></div>}
          </div>
        </div>

        {/* Upload & Form */}
        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="custom-key" className="block text-xs font-semibold text-slate-soft uppercase tracking-wider">
              Key Undangan (URL)
            </label>
            <div className="flex bg-cream-50 rounded-xl border border-cream-300 overflow-hidden focus-within:border-blush-300 focus-within:ring-2 focus-within:ring-blush-100 transition-all">
              <span className="bg-cream-100 px-3 py-3 text-slate-soft text-sm flex items-center border-r border-cream-300 select-none">
                inviteku.com/
              </span>
              <input
                id="custom-key"
                type="text"
                value={customKey}
                onChange={e => setCustomKey(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                placeholder="nama-pasangan"
                className="flex-1 bg-transparent px-3 py-3 text-sm text-ink outline-none"
                required
              />
            </div>
            <p className="text-[11px] text-slate-soft">Hanya huruf kecil, angka, strip (-), dan underscore (_).</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-soft uppercase tracking-wider">Upload Bukti Transfer</p>
            <div
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                preview ? 'border-blush-300 bg-blush-50/50' : 'border-cream-300 bg-cream-50 hover:border-blush-400 hover:bg-blush-50'
              }`}
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Preview bukti transfer" className="max-h-48 rounded-lg object-contain shadow-sm" />
              ) : (
                <>
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-blush-300 mb-1">
                    <ImageIcon size={24} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-ink">Klik untuk pilih gambar</p>
                    <p className="text-xs text-slate-soft mt-1">Format: JPG, PNG (Max 5MB)</p>
                  </div>
                </>
              )}
            </div>
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            {file && <p className="text-xs text-mint-600 flex items-center gap-1.5 font-medium"><CheckCircle2 size={14} />{file.name}</p>}
          </div>
          
          {err && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex gap-2 text-red-600 text-sm">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <p>{err}</p>
            </div>
          )}
          
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-soft hover:bg-cream-200 transition-colors">Batal</button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
              disabled={!file || !customKey.trim() || uploading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 shadow-md"
              style={{ background: "linear-gradient(135deg, #ff9fb5 0%, #c2a7ff 100%)" }}>
              {uploading ? <><Loader2 size={16} className="animate-spin" />Mengirim…</> : <><Send size={16} />Kirim Request</>}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Undangan Card ──────────────────────────────────────────────────────────

function UndanganCard({
  undangan, index, token, templates,
  onRefresh,
}: {
  undangan: Undangan; index: number; token: string; templates: TemplatePrice[];
  onRefresh: () => void;
}) {
  const expDate = formatExp(undangan.exp);
  const [payStatus, setPayStatus] = useState<PaymentStatus | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutDone, setCheckoutDone] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  const handlePreview = async () => {
    if (previewLoading) return;
    setPreviewLoading(true);
    try {
      const res = await generatePreviewTokenApi(token, undangan.id);
      if (res.data?.preview_token) {
        window.open(`https://inviteku.com/undangan/preview?access=${res.data.preview_token}`, '_blank');
      }
    } catch (e: unknown) {
      alert((e as { message?: string })?.message ?? "Gagal memuat preview.");
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    getPaymentStatusApi(token, undangan.id)
      .then(r => setPayStatus(r.data))
      .catch(() => setPayStatus(null));
  }, [token, undangan.id]);

  const status = payStatus?.status ?? (undangan.is_published ? "approved" : "draft");
  const isDraft = status === "draft";
  const templateData = templates.find(t => t.template === undangan.template);

  const handleCheckoutSuccess = () => {
    setCheckoutOpen(false);
    setCheckoutDone(true);
    setPayStatus(prev => prev ? { ...prev, status: "pending" } : { id: 0, id_undangan: undangan.id, status: "pending" });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.35 }}
        className="bg-white rounded-2xl p-5 sm:p-6 shadow-card hover:shadow-float transition-all duration-300 border border-cream-100"
      >
        <div className="flex flex-col sm:flex-row items-start gap-5">
          
          {/* Visual Indicator */}
          {templateData?.thumbnail ? (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 border border-cream-200 shadow-sm relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={templateData.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Mail className="text-white drop-shadow-md" size={20} />
              </div>
            </div>
          ) : (
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm"
              style={{ background: `linear-gradient(135deg, hsl(${(index * 55) % 360}, 65%, 72%) 0%, hsl(${(index * 55 + 60) % 360}, 65%, 72%) 100%)` }}
            >
              <Mail size={28} strokeWidth={1.5} />
            </div>
          )}

          <div className="flex-1 min-w-0 space-y-2 w-full">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-ink text-lg line-clamp-1">{undangan.nama}</h3>
                {undangan.key_undangan && (
                  <a href={`https://inviteku.com/${undangan.key_undangan}`} target="_blank" rel="noreferrer"
                    className="text-sm text-lavender-500 hover:text-lavender-600 hover:underline flex items-center gap-1.5 mt-0.5 w-fit">
                    <Link2 size={14} />
                    <span className="font-mono">{undangan.key_undangan}</span>
                  </a>
                )}
              </div>
              <div className="flex-shrink-0 hidden sm:block">
                <StatusBadge status={status} />
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap pt-1">
              {undangan.template && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-ink-muted bg-cream-100 px-2.5 py-1 rounded-lg border border-cream-200">
                  <LayoutGrid size={12} className="text-slate-soft" />
                  {templateData?.name_template || undangan.template}
                </div>
              )}
              {expDate && (
                <div className="flex items-center gap-1.5 text-xs text-slate-soft bg-cream-50 px-2.5 py-1 rounded-lg border border-cream-100">
                  <CalendarClock size={12} /> Exp: {expDate}
                </div>
              )}
            </div>
            
            {/* Mobile status badge */}
            <div className="sm:hidden pt-2">
              <StatusBadge status={status} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center flex-wrap gap-3 mt-5 pt-5 border-t border-cream-100">
          <button
            onClick={handlePreview}
            disabled={previewLoading}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-colors disabled:opacity-50 ${
              undangan.key_undangan
                ? "border-lavender-200 text-lavender-600 hover:bg-lavender-50"
                : "border-mint-200 text-mint-600 hover:bg-mint-50"
            }`}
          >
            {previewLoading ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
            {undangan.key_undangan ? " Lihat Undangan" : " Preview"}
          </button>
          
          {isDraft && (
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-cream-300 text-ink-muted hover:bg-cream-100 transition-colors"
            >
              <Edit2 size={16} /> Edit Data
            </button>
          )}

          <div className="flex-1" />

          {isDraft && !checkoutDone && (
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setCheckoutOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md"
              style={{ background: "linear-gradient(135deg, #ff9fb5 0%, #c2a7ff 100%)" }}
            >
              <CreditCard size={16} /> Request Publish
            </motion.button>
          )}

          {(checkoutDone || status === "pending") && (
            <div className="flex items-center gap-2 text-sm font-medium text-peach-500 bg-peach-50 px-4 py-2 rounded-xl border border-peach-100">
              <Clock size={16} className="animate-pulse" /> Menunggu Verifikasi
            </div>
          )}
        </div>

        {payStatus?.note && (
          <div className="mt-4 flex gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
            <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">Catatan dari Admin</p>
              <p className="text-sm text-red-600 mt-0.5">{payStatus.note}</p>
            </div>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {editOpen && (
          <EditModal
            undangan={undangan} templates={templates} token={token}
            onClose={() => setEditOpen(false)}
            onSaved={() => { setEditOpen(false); onRefresh(); }}
          />
        )}
        {checkoutOpen && (
          <CheckoutModal
            undangan={undangan} templates={templates} token={token}
            onClose={() => setCheckoutOpen(false)}
            onSuccess={handleCheckoutSuccess}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function UndanganPage() {
  const { token } = useAuthStore();
  const [nama, setNama] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [creating, setCreating] = useState(false);
  const [createAlert, setCreateAlert] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });
  const [undanganList, setUndanganList] = useState<Undangan[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<TemplatePrice[]>([]);
  
  // Picker state
  const [showPicker, setShowPicker] = useState(false);

  const fetchList = useCallback(async () => {
    if (!token) return;
    setListLoading(true); setListError(null);
    try {
      const res = await getUndanganApi(token);
      setUndanganList(Array.isArray(res.data) ? res.data : []);
    } catch (e: unknown) {
      setListError((e as { message?: string })?.message ?? "Failed to load undangan.");
    } finally { setListLoading(false); }
  }, [token]);

  useEffect(() => { fetchList(); }, [fetchList]);
  useEffect(() => {
    getTemplatePricesApi().then(r => setTemplates(r.data ?? [])).catch(() => {});
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !nama.trim() || !selectedTemplate) return;
    setCreating(true); setCreateAlert({ type: null, message: "" });
    try {
      await createUndanganApi(token, { nama: nama.trim(), template: selectedTemplate });
      setCreateAlert({ type: "success", message: `Undangan "${nama.trim()}" berhasil dibuat!` });
      setNama(""); setSelectedTemplate(""); fetchList();
      
      // Auto hide success message after 5s
      setTimeout(() => setCreateAlert({ type: null, message: "" }), 5000);
    } catch (err: unknown) {
      setCreateAlert({ type: "error", message: (err as { message?: string })?.message ?? "Gagal membuat undangan." });
    } finally { setCreating(false); }
  };

  const selectedTemplateData = templates.find(t => t.template === selectedTemplate);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center text-white shadow-md"
            style={{ background: "linear-gradient(135deg, #ffc2cf 0%, #d9c8ff 100%)" }}>
            <Mail size={24} />
          </div>
          <div className="max-w-xl">
            <h1 className="text-2xl font-bold text-ink">Buat Undangan</h1>
            <p className="text-slate-soft mt-0.5">
              Kelola dan buat undangan digital baru untuk momen spesial Anda. Anda bisa mencoba semua template secara gratis, pembayaran hanya dilakukan ketika ingin mem-publish undangan.
            </p>
          </div>
        </div>
        
        <Link href="/dashboard/bantuan" className="shrink-0">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blush-200 bg-white text-sm font-semibold text-blush-500 hover:bg-blush-50 hover:border-blush-300 shadow-sm transition-all duration-200">
            <HelpCircle size={16} />
            Panduan Bantuan
          </button>
        </Link>
      </motion.div>

      {/* Create Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-cream-100">
        <h2 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
          <Plus size={20} className="text-blush-500" />
          Mulai Undangan Baru
        </h2>
        
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Col: Name */}
            <div className="space-y-2">
              <label htmlFor="undangan-nama" className="block text-sm font-bold text-ink">
                1. Nama Pasangan
              </label>
              <p className="text-xs text-slate-soft mb-2">Nama yang akan menjadi judul utama undangan digital Anda.</p>
              <input id="undangan-nama" type="text" required value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder='Contoh: "Romeo & Juliet"'
                className="input-pastel w-full px-4 py-3.5 rounded-xl border-2 border-cream-200 bg-cream-50 text-ink text-base transition-all duration-200 hover:border-cream-300 focus:bg-white" />
            </div>

            {/* Right Col: Template */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-ink">
                2. Desain Template
              </label>
              <p className="text-xs text-slate-soft mb-2">Pilih visual yang sesuai dengan tema pernikahan Anda.</p>
              
              {selectedTemplate && selectedTemplateData ? (
                <div className="border-2 border-blush-200 bg-white rounded-xl p-3 relative group transition-all hover:border-blush-300 hover:shadow-md cursor-pointer"
                  onClick={() => setShowPicker(true)}>
                  <div className="flex items-center gap-4">
                    {selectedTemplateData.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={selectedTemplateData.thumbnail} alt="" className="w-14 h-14 rounded-lg object-cover" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-lavender-200 to-blush-200 flex items-center justify-center">
                        <LayoutGrid className="text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-bold text-ink">{selectedTemplateData.name_template}</p>
                      <p className="text-xs text-slate-soft mt-0.5">{selectedTemplate}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blush-50 text-blush-500 flex items-center justify-center group-hover:bg-blush-100 transition-colors">
                      <Edit2 size={14} />
                    </div>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => setShowPicker(true)}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-dashed border-cream-300 bg-cream-50 hover:bg-cream-100 hover:border-blush-300 transition-all duration-200 flex items-center justify-between group">
                  <span className="text-slate-soft font-medium flex items-center gap-2">
                    <LayoutGrid size={18} className="text-blush-400 group-hover:text-blush-500 transition-colors" />
                    Klik untuk pilih template
                  </span>
                  <div className="bg-white rounded-full p-1 shadow-sm text-slate-soft group-hover:text-blush-500 transition-colors">
                    <Plus size={16} />
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Alerts */}
          <AnimatePresence>
            {createAlert.type && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden">
                <div className={`flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-medium ${createAlert.type === "success" ? "bg-mint-50 text-mint-700 border border-mint-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                  <div className={`p-1 rounded-full ${createAlert.type === "success" ? "bg-mint-100" : "bg-red-100"}`}>
                    {createAlert.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                  </div>
                  <p>{createAlert.message}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <div className="pt-2 border-t border-cream-100 flex justify-end">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              id="create-undangan-btn" type="submit" disabled={creating || !nama.trim() || !selectedTemplate}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-bold text-white disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
              style={{ background: "linear-gradient(135deg, #ff9fb5 0%, #c2a7ff 100%)" }}>
              {creating ? <><Loader2 size={20} className="animate-spin" />Memproses…</> : <><Sparkles size={20} />Buat Undangan Sekarang</>}
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* List */}
      <div>
        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-ink">Undangan Anda <span className="text-slate-soft font-normal text-sm ml-1">({undanganList.length})</span></h2>
        </motion.div>
        
        {listLoading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-cream-100">
            <Loader2 size={32} className="animate-spin text-blush-400 mb-3" />
            <p className="text-slate-soft font-medium">Memuat data undangan...</p>
          </div>
        ) : listError ? (
          <div className="text-center py-12 bg-white rounded-3xl shadow-card border border-red-100">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} className="text-red-400" />
            </div>
            <p className="text-red-500 font-medium mb-2">{listError}</p>
            <button onClick={fetchList} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">Coba lagi</button>
          </div>
        ) : undanganList.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white rounded-3xl shadow-card border border-cream-100">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-md"
              style={{ background: "linear-gradient(135deg, #ffc2cf 0%, #d9c8ff 100%)" }}>
              <Mail size={36} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-ink mb-2">Belum Ada Undangan</h3>
            <p className="text-slate-soft max-w-sm mx-auto">Anda belum membuat undangan digital. Mulai dengan mengisi form di atas untuk membuat undangan pertama Anda!</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {undanganList.map((u, i) => (
              <UndanganCard key={u.id} undangan={u} index={i} token={token!} templates={templates} onRefresh={fetchList} />
            ))}
          </div>
        )}
      </div>

      {/* Global Modals */}
      <AnimatePresence>
        {showPicker && (
          <TemplatePickerModal 
            templates={templates} 
            selected={selectedTemplate} 
            onSelect={setSelectedTemplate} 
            onClose={() => setShowPicker(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

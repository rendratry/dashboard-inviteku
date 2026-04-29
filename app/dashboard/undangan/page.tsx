"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Plus, CheckCircle2, AlertTriangle, Loader2, Link2,
  CalendarClock, Eye, Edit2, CreditCard, X, Upload, ImageIcon,
  Clock, Ban, Send,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import {
  createUndanganApi, getUndanganApi, getPaymentStatusApi,
  updateUndanganApi, requestPublishApi, getTemplatePricesApi,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-float w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-ink flex items-center gap-2"><Edit2 size={16} className="text-blush-400" />Edit Undangan</h2>
          <button onClick={onClose} className="text-slate-soft hover:text-red-400 transition-colors"><X size={18} /></button>
        </div>
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
                {templates.map(t => (
                  <option key={t.id} value={t.template}>{t.name_template} — {formatRupiah(t.effective_price)}</option>
                ))}
              </select>
            </div>
          )}
          {err && <p className="text-red-500 text-xs flex items-center gap-1"><AlertTriangle size={12} />{err}</p>}
          <div className="flex gap-3 justify-end pt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm text-slate-soft hover:bg-cream-200 transition-colors">Batal</button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #ff9fb5 0%, #c2a7ff 100%)" }}>
              {saving ? <><Loader2 size={13} className="animate-spin" />Menyimpan…</> : "Simpan"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
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
    if (!file) return;
    setUploading(true); setErr(null);
    try {
      const fd = new FormData();
      fd.append("id_undangan", String(undangan.id));
      fd.append("bukti_transfer", file);
      await requestPublishApi(token, fd);
      onSuccess();
    } catch (e: unknown) {
      setErr((e as { message?: string })?.message ?? "Gagal mengirim.");
    } finally { setUploading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-float w-full max-w-md p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-ink flex items-center gap-2"><CreditCard size={16} className="text-blush-400" />Request Publish</h2>
          <button onClick={onClose} className="text-slate-soft hover:text-red-400 transition-colors"><X size={18} /></button>
        </div>

        {/* Price Info */}
        <div className="bg-cream-50 rounded-xl p-4 space-y-1 border border-cream-300">
          <p className="text-xs text-slate-soft">Template yang dipilih</p>
          <p className="font-semibold text-ink">{undangan.template ?? "—"}</p>
          {templatePrice && <p className="text-lg font-extrabold text-blush-500">{formatRupiah(templatePrice.effective_price)}</p>}
        </div>

        {/* Bank Info */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-soft uppercase tracking-wider">Instruksi Pembayaran</p>
          <div className="bg-lavender-50 border border-lavender-200 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-soft">Bank</span><span className="font-semibold text-ink">BCA</span></div>
            <div className="flex justify-between"><span className="text-slate-soft">No. Rekening</span><span className="font-semibold text-ink font-mono">1234567890</span></div>
            <div className="flex justify-between"><span className="text-slate-soft">Atas Nama</span><span className="font-semibold text-ink">Inviteku</span></div>
            {templatePrice && <div className="flex justify-between border-t border-lavender-200 pt-2"><span className="text-slate-soft">Jumlah</span><span className="font-bold text-blush-500">{formatRupiah(templatePrice.effective_price)}</span></div>}
          </div>
        </div>

        {/* Upload */}
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-slate-soft uppercase tracking-wider">Upload Bukti Transfer</p>
            <div
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed border-blush-200 rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-blush-400 hover:bg-blush-50 transition-all"
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Preview bukti transfer" className="max-h-40 rounded-lg object-contain" />
              ) : (
                <>
                  <ImageIcon size={28} className="text-blush-300" />
                  <p className="text-xs text-slate-soft">Klik untuk pilih gambar</p>
                </>
              )}
            </div>
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            {file && <p className="text-xs text-mint-500 flex items-center gap-1"><CheckCircle2 size={11} />{file.name}</p>}
          </div>
          {err && <p className="text-red-500 text-xs flex items-center gap-1"><AlertTriangle size={12} />{err}</p>}
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm text-slate-soft hover:bg-cream-200 transition-colors">Batal</button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
              disabled={!file || uploading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #ff9fb5 0%, #c2a7ff 100%)" }}>
              {uploading ? <><Loader2 size={13} className="animate-spin" />Mengirim…</> : <><Send size={13} />Kirim Request</>}
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

  useEffect(() => {
    getPaymentStatusApi(token, undangan.id)
      .then(r => setPayStatus(r.data))
      .catch(() => setPayStatus(null));
  }, [token, undangan.id]);

  const status = payStatus?.status ?? (undangan.is_published ? "approved" : "draft");
  const isDraft = status === "draft";

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
        className="bg-white rounded-2xl p-5 shadow-card hover:shadow-float transition-all duration-300"
      >
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0 mt-0.5"
            style={{ background: `linear-gradient(135deg, hsl(${(index * 55) % 360}, 65%, 72%) 0%, hsl(${(index * 55 + 60) % 360}, 65%, 72%) 100%)` }}
          >
            <Mail size={22} strokeWidth={1.5} />
          </div>

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
                <span className="text-xs text-slate-soft/70 bg-cream-100 px-2 py-0.5 rounded-lg">{undangan.template}</span>
              )}
              {expDate && (
                <span className="text-xs text-slate-soft flex items-center gap-1">
                  <CalendarClock size={10} />Exp: {expDate}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <StatusBadge status={status} />
            {undangan.key_undangan && (
              <a href={`https://inviteku.com/${undangan.key_undangan}`} target="_blank" rel="noreferrer"
                className="text-xs text-lavender-500 hover:underline flex items-center gap-1">
                <Eye size={11} />Lihat
              </a>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-cream-200">
          {isDraft && (
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-cream-300 text-ink-muted hover:bg-cream-100 transition-all"
            >
              <Edit2 size={12} />Edit
            </motion.button>
          )}

          {isDraft && !checkoutDone && (
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setCheckoutOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #ff9fb5 0%, #c2a7ff 100%)" }}
            >
              <CreditCard size={12} />Request Publish
            </motion.button>
          )}

          {checkoutDone && (
            <span className="flex items-center gap-1 text-xs text-peach-500">
              <Clock size={11} />Menunggu verifikasi admin
            </span>
          )}
        </div>

        {payStatus?.note && (
          <p className="mt-2 text-xs text-slate-soft bg-cream-50 rounded-lg px-3 py-2 border border-cream-200">
            Catatan Admin: {payStatus.note}
          </p>
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
    } catch (err: unknown) {
      setCreateAlert({ type: "error", message: (err as { message?: string })?.message ?? "Gagal membuat undangan." });
    } finally { setCreating(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
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

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-white rounded-2xl p-6 shadow-card">
        <h2 className="font-semibold text-ink mb-5 flex items-center gap-2">
          <Plus size={18} className="text-blush-400" />Undangan Baru
        </h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="undangan-nama" className="block text-sm font-medium text-ink-muted">Nama Undangan</label>
            <input id="undangan-nama" type="text" required value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder='Contoh: "Romeo & Juliet"'
              className="input-pastel w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-ink text-sm transition-all duration-200" />
            <p className="text-xs text-slate-soft">Nama pasangan yang akan tertera di undangan digital Anda.</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="undangan-template" className="block text-sm font-medium text-ink-muted">Pilih Template</label>
            {templates.length > 0 ? (
              <select id="undangan-template" required value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="input-pastel w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-ink text-sm transition-all duration-200">
                <option value="">-- Pilih template --</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.template}>
                    {t.name_template} — {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(t.effective_price)}
                  </option>
                ))}
              </select>
            ) : (
              <input id="undangan-template" type="text" required value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                placeholder='Contoh: "template-1"'
                className="input-pastel w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-ink text-sm transition-all duration-200" />
            )}
            <p className="text-xs text-slate-soft">Template menentukan tampilan visual undangan Anda.</p>
          </div>
          <AnimatePresence>
            {createAlert.type && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${createAlert.type === "success" ? "bg-mint-100 text-mint-500 border border-mint-200" : "bg-red-50 text-red-500 border border-red-100"}`}>
                {createAlert.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                {createAlert.message}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex justify-end">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              id="create-undangan-btn" type="submit" disabled={creating || !nama.trim() || !selectedTemplate}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 cursor-pointer"
              style={{ background: "linear-gradient(135deg, #ff9fb5 0%, #c2a7ff 100%)" }}>
              {creating ? <><Loader2 size={15} className="animate-spin" />Membuat…</> : <><Plus size={15} />Buat Undangan</>}
            </motion.button>
          </div>
        </form>
      </motion.div>

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
            {undanganList.map((u, i) => (
              <UndanganCard key={u.id} undangan={u} index={i} token={token!} templates={templates} onRefresh={fetchList} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

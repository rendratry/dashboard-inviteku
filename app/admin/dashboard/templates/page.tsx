"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, CheckCircle2, AlertTriangle, Loader2, X, Plus, Edit2, RefreshCw, Image as ImageIcon, Trash2,
} from "lucide-react";
import { useAdminStore } from "@/lib/store";
import { getTemplatePricesApi, adminCreateTemplateApi, adminUpdateTemplateApi, type TemplatePrice } from "@/lib/api";

// ── File Upload Helper ─────────────────────────────────────────────────────

function FileUploadField({ label, name, currentFileUrl, onFileChange }: { label: string; name: string; currentFileUrl?: string; onFileChange: (f: File | null) => void }) {
  const [preview, setPreview] = useState<string | null>(currentFileUrl ?? null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      onFileChange(f);
      const reader = new FileReader();
      reader.onload = e => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    }
  };

  const removeFile = () => {
    onFileChange(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-ink-muted">{label}</p>
      {preview ? (
        <div className="relative border border-cream-300 rounded-xl overflow-hidden group w-full h-32 bg-cream-50 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={label} className="max-w-full max-h-full object-contain p-2" />
          <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button type="button" onClick={() => inputRef.current?.click()} className="p-2 bg-white rounded-full text-ink hover:text-blush-500">
              <Edit2 size={16} />
            </button>
            <button type="button" onClick={removeFile} className="p-2 bg-white rounded-full text-ink hover:text-red-500">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-cream-300 rounded-xl h-32 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blush-300 hover:bg-blush-50/50 transition-all text-slate-soft">
          <ImageIcon size={24} className="text-cream-400" />
          <span className="text-xs">Klik untuk upload</span>
        </div>
      )}
      <input ref={inputRef} type="file" name={name} accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

// ── Modal Form ─────────────────────────────────────────────────────────────

function TemplateFormModal({
  template, adminToken, onClose, onDone,
}: {
  template: TemplatePrice | null; adminToken: string; onClose: () => void; onDone: () => void;
}) {
  const isEdit = !!template;
  const [formData, setFormData] = useState({
    template: template?.template ?? "",
    name_template: template?.name_template ?? "",
    accent_color: template?.accent_color ?? "",
  });
  const [files, setFiles] = useState<Record<string, File | null>>({
    thumbnail: null, background: null,
    top_right: null, top_left: null, bottom_right: null, bottom_left: null,
  });
  
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErr(null);
    try {
      const fd = new FormData();
      fd.append("template", formData.template);
      fd.append("name_template", formData.name_template);
      fd.append("accent_color", formData.accent_color);
      
      // Append files if they exist
      Object.entries(files).forEach(([key, file]) => {
        if (file) fd.append(key, file);
      });

      if (isEdit) {
        await adminUpdateTemplateApi(adminToken, fd);
      } else {
        await adminCreateTemplateApi(adminToken, fd);
      }
      onDone();
    } catch (e: unknown) {
      setErr((e as { message?: string })?.message ?? "Gagal menyimpan template.");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-float w-full max-w-3xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-cream-200">
          <h2 className="font-bold text-ink flex items-center gap-2">
            <Sparkles size={18} className="text-blush-400" />
            {isEdit ? "Edit Template" : "Tambah Template Baru"}
          </h2>
          <button onClick={onClose} className="text-slate-soft hover:text-red-400 transition-colors"><X size={20} /></button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <form id="template-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-ink-muted">Slug Template <span className="text-red-400">*</span></label>
                <input value={formData.template} onChange={e => setFormData({ ...formData, template: e.target.value })} required disabled={isEdit}
                  placeholder="Misal: template-1"
                  className="input-pastel w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-ink text-sm disabled:opacity-60 disabled:cursor-not-allowed" />
                <p className="text-xs text-slate-soft">Identifier unik untuk template ini.</p>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-ink-muted">Nama Tampilan <span className="text-red-400">*</span></label>
                <input value={formData.name_template} onChange={e => setFormData({ ...formData, name_template: e.target.value })} required
                  placeholder="Misal: Modern Sage"
                  className="input-pastel w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-ink text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-ink-muted">Accent Color (Hex)</label>
                <div className="flex gap-2">
                  <input type="color" value={formData.accent_color || "#000000"} onChange={e => setFormData({ ...formData, accent_color: e.target.value })}
                    className="w-12 h-[46px] rounded-xl border border-cream-300 cursor-pointer bg-cream-50 p-1 flex-shrink-0" />
                  <input type="text" value={formData.accent_color} onChange={e => setFormData({ ...formData, accent_color: e.target.value })}
                    placeholder="Misal: #778899"
                    className="input-pastel flex-1 px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-ink text-sm uppercase" />
                </div>
              </div>
            </div>

            <div className="border-t border-cream-200 pt-6">
              <h3 className="font-semibold text-ink mb-4 text-sm uppercase tracking-wider">Aset Gambar</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <FileUploadField label="Thumbnail" name="thumbnail" currentFileUrl={template?.thumbnail} onFileChange={f => setFiles(prev => ({ ...prev, thumbnail: f }))} />
                <FileUploadField label="Background" name="background" currentFileUrl={template?.background} onFileChange={f => setFiles(prev => ({ ...prev, background: f }))} />
                <FileUploadField label="Top Left" name="top_left" currentFileUrl={template?.top_left} onFileChange={f => setFiles(prev => ({ ...prev, top_left: f }))} />
                <FileUploadField label="Top Right" name="top_right" currentFileUrl={template?.top_right} onFileChange={f => setFiles(prev => ({ ...prev, top_right: f }))} />
                <FileUploadField label="Bottom Left" name="bottom_left" currentFileUrl={template?.bottom_left} onFileChange={f => setFiles(prev => ({ ...prev, bottom_left: f }))} />
                <FileUploadField label="Bottom Right" name="bottom_right" currentFileUrl={template?.bottom_right} onFileChange={f => setFiles(prev => ({ ...prev, bottom_right: f }))} />
              </div>
            </div>
            
            {err && (
              <div className="p-3 bg-red-50 text-red-500 rounded-xl text-sm flex items-center gap-2 border border-red-100">
                <AlertTriangle size={16} />{err}
              </div>
            )}
          </form>
        </div>
        
        <div className="p-6 border-t border-cream-200 flex justify-end gap-3 bg-gray-50/50 rounded-b-2xl">
          <button type="button" onClick={onClose} disabled={saving}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-soft hover:bg-cream-200 transition-colors">Batal</button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            form="template-form" type="submit" disabled={saving || !formData.template || !formData.name_template}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 shadow-md"
            style={{ background: "linear-gradient(135deg, #d9c8ff 0%, #80cfff 100%)" }}>
            {saving ? <><Loader2 size={16} className="animate-spin" />Menyimpan…</> : isEdit ? "Simpan Perubahan" : "Tambah Template"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function AdminTemplatesPage() {
  const { adminToken } = useAdminStore();
  const [templates, setTemplates] = useState<TemplatePrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [modalTarget, setModalTarget] = useState<TemplatePrice | null | "new">(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await getTemplatePricesApi();
      setTemplates(Array.isArray(res.data) ? res.data : []);
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? "Gagal memuat template.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const handleDone = () => {
    setModalTarget(null);
    fetchTemplates();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
            style={{ background: "linear-gradient(135deg, #d9c8ff 0%, #80cfff 100%)" }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink">Manajemen Template</h1>
            <p className="text-sm text-slate-soft">Kelola desain undangan dan aset gambar (thumbnail, background, dsb).</p>
          </div>
        </div>
        <div className="flex gap-2">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={fetchTemplates} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-cream-300 text-ink-muted hover:bg-cream-100 transition-all disabled:opacity-50">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setModalTarget("new")}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white shadow-md"
            style={{ background: "linear-gradient(135deg, #d9c8ff 0%, #80cfff 100%)" }}>
            <Plus size={16} />Tambah Template
          </motion.button>
        </div>
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-lavender-400" />
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-card border border-cream-200">
          <AlertTriangle size={24} className="text-red-400 mx-auto mb-2" />
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={fetchTemplates} className="text-lavender-500 text-sm underline mt-2">Coba lagi</button>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-card border border-cream-200">
          <Sparkles size={32} className="text-lavender-300 mx-auto mb-3" />
          <p className="font-semibold text-ink text-lg">Belum Ada Template</p>
          <p className="text-sm text-slate-soft mt-1">Tambahkan template pertama Anda untuk mulai.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {templates.map((tpl, i) => (
            <motion.div key={tpl.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl shadow-card border border-cream-100 overflow-hidden group">
              <div className="w-full h-48 bg-cream-50 relative overflow-hidden flex items-center justify-center">
                {tpl.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={tpl.thumbnail} alt={tpl.name_template} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <ImageIcon size={32} className="text-cream-300" />
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  <button onClick={() => setModalTarget(tpl)} className="p-2 bg-white/90 backdrop-blur rounded-lg text-ink hover:text-blush-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit2 size={14} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-ink truncate">{tpl.name_template}</h3>
                    <p className="text-xs font-mono text-slate-soft/80">{tpl.template}</p>
                  </div>
                  <span className="text-xs font-bold text-lavender-600 bg-lavender-50 px-2 py-1 rounded-md">
                    {new Intl.NumberFormat("id-ID", { notation: "compact" }).format(tpl.effective_price)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalTarget && (
          <TemplateFormModal
            template={modalTarget === "new" ? null : modalTarget}
            adminToken={adminToken!}
            onClose={() => setModalTarget(null)}
            onDone={handleDone}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

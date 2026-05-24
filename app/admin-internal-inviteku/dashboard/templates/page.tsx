"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, CheckCircle2, AlertTriangle, Loader2, X, Plus, Edit2, RefreshCw, Image as ImageIcon, Trash2, Eye, Maximize,
} from "lucide-react";
import { useAdminStore } from "@/lib/store";
import { adminGetTemplatesApi, adminCreateTemplateApi, adminUpdateTemplateApi, type TemplatePrice } from "@/lib/api";

// ── Image Resizer Modal ────────────────────────────────────────────────────

function ImageResizerModal({
  fileOrUrl,
  onClose,
  onSave,
}: {
  fileOrUrl: File | string;
  onClose: () => void;
  onSave: (resizedFile: File) => void;
}) {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let url = "";
    let isBlob = false;
    if (typeof fileOrUrl === "string") {
      url = fileOrUrl;
    } else {
      url = URL.createObjectURL(fileOrUrl);
      isBlob = true;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setOriginalImage(img);
      setWidth(img.width);
      setHeight(img.height);
      setAspectRatio(img.width / img.height);
      if (isBlob) URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      alert("Gagal memuat gambar dari server untuk di-resize. Silakan upload file baru.");
      if (isBlob) URL.revokeObjectURL(url);
      onClose();
    };
    img.src = url;
  }, [fileOrUrl, onClose]);

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    setWidth(val);
    if (lockAspectRatio && aspectRatio > 0) {
      setHeight(Math.round(val / aspectRatio));
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    setHeight(val);
    if (lockAspectRatio && aspectRatio > 0) {
      setWidth(Math.round(val * aspectRatio));
    }
  };

  const handleSave = () => {
    if (!originalImage || !canvasRef.current || width <= 0 || height <= 0) return;
    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Draw resized image
    ctx.drawImage(originalImage, 0, 0, width, height);
    
    let targetType = "image/png";
    let targetName = "resized.png";

    if (typeof fileOrUrl === "string") {
      const lowerUrl = fileOrUrl.toLowerCase();
      if (lowerUrl.includes(".jpg") || lowerUrl.includes(".jpeg")) {
        targetType = "image/jpeg";
        targetName = "resized.jpg";
      } else if (lowerUrl.includes(".webp")) {
        targetType = "image/webp";
        targetName = "resized.webp";
      }
    } else {
      targetType = fileOrUrl.type;
      targetName = fileOrUrl.name;
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const newFile = new File([blob], targetName, {
          type: targetType,
          lastModified: Date.now(),
        });
        onSave(newFile);
      }
    }, targetType, 0.9);
  };

  if (!originalImage) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-full">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-100 bg-cream-50/50">
          <h2 className="text-xl font-bold text-ink">Resize Gambar</h2>
          <button type="button" onClick={onClose} className="p-2 -mr-2 text-slate-soft hover:bg-cream-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="bg-cream-50 rounded-2xl p-4 flex justify-center items-center h-48 overflow-hidden border border-cream-100">
            {/* Hidden canvas for processing */}
            <canvas ref={canvasRef} className="hidden" />
            <img src={originalImage.src} alt="Original" className="max-w-full max-h-full object-contain shadow-sm rounded-lg" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-1.5">
                <label className="text-sm font-medium text-ink-muted">Width (px)</label>
                <input type="number" value={width || ""} onChange={handleWidthChange}
                  className="w-full px-4 py-2.5 bg-white border border-cream-200 rounded-xl text-ink font-medium focus:outline-none focus:ring-2 focus:ring-blush-400 focus:border-transparent transition-all" />
              </div>
              <div className="flex-1 space-y-1.5">
                <label className="text-sm font-medium text-ink-muted">Height (px)</label>
                <input type="number" value={height || ""} onChange={handleHeightChange}
                  className="w-full px-4 py-2.5 bg-white border border-cream-200 rounded-xl text-ink font-medium focus:outline-none focus:ring-2 focus:ring-blush-400 focus:border-transparent transition-all" />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${lockAspectRatio ? "bg-mint-500 border-mint-500" : "bg-white border-cream-300 group-hover:border-mint-400"}`}>
                {lockAspectRatio && <CheckCircle2 size={14} className="text-white" />}
              </div>
              <input type="checkbox" checked={lockAspectRatio} onChange={e => setLockAspectRatio(e.target.checked)} className="hidden" />
              <span className="text-sm font-medium text-slate-soft group-hover:text-ink transition-colors">Lock Aspect Ratio</span>
            </label>
            <p className="text-xs text-slate-soft/80 bg-blue-50 text-blue-700 p-3 rounded-lg">
              Dimensi asli: {originalImage.width} x {originalImage.height} px
            </p>
          </div>
        </div>

        <div className="p-6 pt-2 border-t border-cream-100 bg-cream-50/50 flex justify-end gap-3">
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-soft hover:bg-cream-200 transition-colors">Batal</button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={handleSave}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md bg-blush-500 hover:bg-blush-600 transition-colors">
            Simpan Resize
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// ── File Upload Helper ─────────────────────────────────────────────────────

function FileUploadField({ label, name, currentFileUrl, onFileChange }: { label: string; name: string; currentFileUrl?: string; onFileChange: (f: File | null) => void }) {
  const [preview, setPreview] = useState<string | null>(currentFileUrl ?? null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setCurrentFile(f);
      onFileChange(f);
      const reader = new FileReader();
      reader.onload = ev => setPreview(ev.target?.result as string);
      reader.readAsDataURL(f);
    }
  };

  const handleResized = (resizedFile: File) => {
    setCurrentFile(resizedFile);
    onFileChange(resizedFile);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(resizedFile);
    setIsResizing(false);
  };

  const removeFile = () => {
    setCurrentFile(null);
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
            {(currentFile || preview) && (
              <button type="button" onClick={() => setIsResizing(true)} title="Resize Gambar" className="p-2 bg-white rounded-full text-ink hover:text-blush-500">
                <Maximize size={16} />
              </button>
            )}
            <button type="button" onClick={() => inputRef.current?.click()} title="Ganti File" className="p-2 bg-white rounded-full text-ink hover:text-blush-500">
              <Edit2 size={16} />
            </button>
            <button type="button" onClick={removeFile} title="Hapus" className="p-2 bg-white rounded-full text-ink hover:text-red-500">
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

      <AnimatePresence>
        {isResizing && (currentFile || preview) && (
          <ImageResizerModal
            fileOrUrl={currentFile || preview!}
            onClose={() => setIsResizing(false)}
            onSave={handleResized}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Audio Upload Helper ────────────────────────────────────────────────────

function AudioUploadField({ label, name, currentFileUrl, onFileChange }: { label: string; name: string; currentFileUrl?: string; onFileChange: (f: File | null) => void }) {
  const [preview, setPreview] = useState<string | null>(currentFileUrl ?? null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setCurrentFile(f);
      onFileChange(f);
      const reader = new FileReader();
      reader.onload = ev => setPreview(ev.target?.result as string);
      reader.readAsDataURL(f);
    }
  };

  const removeFile = () => {
    setCurrentFile(null);
    onFileChange(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-ink-muted">{label}</p>
      {preview ? (
        <div className="relative border border-cream-300 rounded-xl overflow-hidden group w-full p-4 bg-cream-50 flex flex-col items-center justify-center gap-2">
          <audio controls src={preview} className="w-full max-w-full" />
          <div className="flex gap-2 mt-2">
            <button type="button" onClick={() => inputRef.current?.click()} className="px-3 py-1.5 bg-white border border-cream-200 rounded-lg text-xs font-medium hover:text-blush-500">
              Ganti File
            </button>
            <button type="button" onClick={removeFile} className="px-3 py-1.5 bg-white border border-cream-200 rounded-lg text-xs font-medium hover:text-red-500">
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-cream-300 rounded-xl h-32 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blush-300 hover:bg-blush-50/50 transition-all text-slate-soft">
          <div className="w-8 h-8 rounded-full bg-cream-100 flex items-center justify-center text-cream-500 mb-1">🎵</div>
          <span className="text-xs">Klik untuk upload MP3/WAV</span>
        </div>
      )}
      <input ref={inputRef} type="file" name={name} accept="audio/*" className="hidden" onChange={handleFile} />
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
    price: template?.price ?? 0,
    price_disc: template?.price_disc ?? 0,
    is_disc: template?.is_disc ?? false,
    is_published: template?.is_published ?? false,
    lat: template?.lat ?? "",
    lang: template?.lang ?? "",
  });
  const [files, setFiles] = useState<Record<string, File | null>>({
    thumbnail: null, background: null,
    top_right: null, top_left: null, bottom_right: null, bottom_left: null,
    foto_cover: null, foto_pria: null, foto_wanita: null, foto_akad: null, foto_resepsi: null,
    foto_gallery1: null, foto_gallery2: null, foto_gallery3: null, foto_gallery4: null, foto_gallery5: null, foto_gallery6: null,
    backsound: null,
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
      fd.append("price", String(formData.price));
      fd.append("price_disc", String(formData.price_disc));
      fd.append("is_disc", String(formData.is_disc));
      fd.append("is_published", String(formData.is_published));
      fd.append("lat", formData.lat);
      fd.append("lang", formData.lang);
      
      // Append files if they exist
      Object.entries(files).forEach(([key, file]) => {
        if (file) fd.append(key, file);
      });

      if (isEdit && template?.id) {
        await adminUpdateTemplateApi(adminToken, template.id, fd);
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-cream-200 pt-6">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-ink-muted">Harga Utama (IDR) <span className="text-red-400">*</span></label>
                <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} required
                  placeholder="Misal: 150000"
                  className="input-pastel w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-ink text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-ink-muted">Harga Diskon (IDR)</label>
                <input type="number" value={formData.price_disc} onChange={e => setFormData({ ...formData, price_disc: Number(e.target.value) })}
                  placeholder="Misal: 99000"
                  className="input-pastel w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-ink text-sm" />
              </div>
              <div className="space-y-1.5 flex flex-col justify-end pb-3 gap-2">
                <label className="flex items-center gap-2 text-sm font-medium text-ink-muted cursor-pointer select-none">
                  <input type="checkbox" checked={formData.is_disc} onChange={e => setFormData({ ...formData, is_disc: e.target.checked })}
                    className="w-4 h-4 rounded border-cream-300 text-blush-500 focus:ring-blush-400" />
                  Aktifkan Diskon
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-ink-muted cursor-pointer select-none">
                  <input type="checkbox" checked={formData.is_published} onChange={e => setFormData({ ...formData, is_published: e.target.checked })}
                    className="w-4 h-4 rounded border-cream-300 text-blush-500 focus:ring-blush-400" />
                  Publish Template (Bisa Dipakai User)
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-cream-200 pt-6">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-ink-muted">Default Latitude Lokasi</label>
                <input type="text" value={formData.lat} onChange={e => setFormData({ ...formData, lat: e.target.value })}
                  placeholder="Misal: -6.200000"
                  className="input-pastel w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-ink text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-ink-muted">Default Longitude Lokasi</label>
                <input type="text" value={formData.lang} onChange={e => setFormData({ ...formData, lang: e.target.value })}
                  placeholder="Misal: 106.816666"
                  className="input-pastel w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-ink text-sm" />
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

            <div className="border-t border-cream-200 pt-6">
              <h3 className="font-semibold text-ink mb-4 text-sm uppercase tracking-wider">Foto Bawaan Preview</h3>
              <p className="text-xs text-slate-soft mb-4 -mt-2">Foto-foto ini akan digunakan sebagai contoh default saat user melakukan preview template ini.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <FileUploadField label="Foto Cover" name="foto_cover" currentFileUrl={template?.foto_cover} onFileChange={f => setFiles(prev => ({ ...prev, foto_cover: f }))} />
                <FileUploadField label="Foto Pria" name="foto_pria" currentFileUrl={template?.foto_pria} onFileChange={f => setFiles(prev => ({ ...prev, foto_pria: f }))} />
                <FileUploadField label="Foto Wanita" name="foto_wanita" currentFileUrl={template?.foto_wanita} onFileChange={f => setFiles(prev => ({ ...prev, foto_wanita: f }))} />
                <FileUploadField label="Foto Akad" name="foto_akad" currentFileUrl={template?.foto_akad} onFileChange={f => setFiles(prev => ({ ...prev, foto_akad: f }))} />
                <FileUploadField label="Foto Resepsi" name="foto_resepsi" currentFileUrl={template?.foto_resepsi} onFileChange={f => setFiles(prev => ({ ...prev, foto_resepsi: f }))} />
                <FileUploadField label="Foto Gallery 1" name="foto_gallery1" currentFileUrl={template?.foto_gallery1} onFileChange={f => setFiles(prev => ({ ...prev, foto_gallery1: f }))} />
                <FileUploadField label="Foto Gallery 2" name="foto_gallery2" currentFileUrl={template?.foto_gallery2} onFileChange={f => setFiles(prev => ({ ...prev, foto_gallery2: f }))} />
                <FileUploadField label="Foto Gallery 3" name="foto_gallery3" currentFileUrl={template?.foto_gallery3} onFileChange={f => setFiles(prev => ({ ...prev, foto_gallery3: f }))} />
                <FileUploadField label="Foto Gallery 4" name="foto_gallery4" currentFileUrl={template?.foto_gallery4} onFileChange={f => setFiles(prev => ({ ...prev, foto_gallery4: f }))} />
                <FileUploadField label="Foto Gallery 5" name="foto_gallery5" currentFileUrl={template?.foto_gallery5} onFileChange={f => setFiles(prev => ({ ...prev, foto_gallery5: f }))} />
                <FileUploadField label="Foto Gallery 6" name="foto_gallery6" currentFileUrl={template?.foto_gallery6} onFileChange={f => setFiles(prev => ({ ...prev, foto_gallery6: f }))} />
                <AudioUploadField label="Backsound (MP3/WAV)" name="backsound" currentFileUrl={template?.backsound} onFileChange={f => setFiles(prev => ({ ...prev, backsound: f }))} />
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
    if (!adminToken) return;
    setLoading(true); setError(null);
    try {
      const res = await adminGetTemplatesApi(adminToken);
      setTemplates(Array.isArray(res.data) ? res.data : []);
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? "Gagal memuat template.");
    } finally { setLoading(false); }
  }, [adminToken]);

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
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ${
                    tpl.is_published 
                      ? "bg-mint-500 text-white" 
                      : "bg-amber-500 text-white"
                  }`}>
                    {tpl.is_published ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => window.open(`https://inviteku.com/template/preview/${tpl.template}`, "_blank")} 
                    title="Preview Template"
                    className="p-2 bg-white/90 backdrop-blur rounded-lg text-ink hover:text-blush-500 shadow-sm transition-colors">
                    <Eye size={14} />
                  </button>
                  <button onClick={() => setModalTarget(tpl)} 
                    title="Edit Template"
                    className="p-2 bg-white/90 backdrop-blur rounded-lg text-ink hover:text-blush-500 shadow-sm transition-colors">
                    <Edit2 size={14} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-ink truncate">{tpl.name_template}</h3>
                    <p className="text-xs font-mono text-slate-soft/80">{tpl.template}</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    {tpl.is_disc && tpl.price_disc && tpl.price_disc > 0 ? (
                      <>
                        <span className="text-[10px] line-through text-slate-soft">
                          Rp{new Intl.NumberFormat("id-ID").format(tpl.price ?? 0)}
                        </span>
                        <span className="text-xs font-bold text-mint-500 bg-mint-50 px-2 py-0.5 rounded-md mt-0.5">
                          Rp{new Intl.NumberFormat("id-ID").format(tpl.price_disc)}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs font-bold text-lavender-600 bg-lavender-50 px-2 py-1 rounded-md">
                        Rp{new Intl.NumberFormat("id-ID").format(tpl.price ?? tpl.effective_price)}
                      </span>
                    )}
                  </div>
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

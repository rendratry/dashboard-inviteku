"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Library, Plus, Image as ImageIcon, Music, Trash2, X,
  AlertTriangle, CheckCircle2, Loader2, Copy, ExternalLink,
  Search, Filter, FileText, MoreVertical, Paperclip
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { getLibraryAssetsApi, uploadAssetsApi, deleteAssetApi, type LibraryAsset } from "@/lib/api";

type AssetType = "image" | "audio";

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// ── Asset Card ─────────────────────────────────────────────────────────────

function AssetCard({ 
  asset, onDelete 
}: { 
  asset: LibraryAsset; 
  onDelete: (id: number) => void;
}) {
  const isImage = /\.(jpg|jpeg|png|webp|gif|svg)(\?|$)/i.test(asset.link);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl border border-cream-200 shadow-sm hover:shadow-float transition-all duration-300 overflow-hidden group"
    >
      <div className="aspect-square bg-cream-50 relative overflow-hidden flex items-center justify-center">
        {isImage ? (
          <img src={asset.link} alt={asset.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-lavender-400">
            <Music size={40} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-lavender-100 px-2 py-0.5 rounded text-lavender-600">Audio</span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button 
            onClick={() => window.open(asset.link, "_blank")}
            className="w-10 h-10 rounded-xl bg-white text-ink hover:bg-lavender-50 flex items-center justify-center transition-colors shadow-lg cursor-pointer"
            title="View Full"
          >
            <ExternalLink size={18} />
          </button>

          <button 
            onClick={() => onDelete(asset.id)}
            className="w-10 h-10 rounded-xl bg-white text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors shadow-lg cursor-pointer"
            title="Delete Asset"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      
      <div className="p-3">
        <p className="text-sm font-semibold text-ink truncate" title={asset.name}>{asset.name}</p>
        <p className="text-[10px] font-mono text-slate-soft truncate mt-1">{asset.key}</p>
      </div>
    </motion.div>
  );
}

// ── Upload Modal ───────────────────────────────────────────────────────────

function UploadModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const { token, user } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    // Check type
    const isImage = selected.type.startsWith("image/");
    const isAudio = selected.type.startsWith("audio/");

    if (!isImage && !isAudio) {
      setError("Hanya file gambar (jpg, png, webp, svg) dan audio (mp3, wav) yang diizinkan.");
      return;
    }

    setFile(selected);
    setError(null);
    if (!name) {
      const baseName = selected.name.replace(/\.[^/.]+$/, "");
      setName(baseName);
      setKey(slugify(baseName));
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    setKey(slugify(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !file || !user) return;

    setLoading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("name", name);
      fd.append("key", key);
      fd.append("id_user", user.id.toString());

      await uploadAssetsApi(token, fd);
      onSuccess();
      onClose();
      // Reset
      setFile(null); setName(""); setKey("");
    } catch (err: any) {
      setError(err?.message ?? "Gagal mengunggah asset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-[60] p-4 pointer-events-none">
            <div className="bg-white rounded-3xl shadow-float w-full max-w-md pointer-events-auto overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-cream-100">
                <h3 className="font-bold text-ink flex items-center gap-2">
                  <Library size={18} className="text-blush-400" />
                  Upload New Asset
                </h3>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-cream-100 text-slate-soft transition-colors cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-500 text-xs flex items-start gap-2">
                    <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Dropzone */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative h-32 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-2 cursor-pointer
                      ${file ? "border-mint-200 bg-mint-50/30" : "border-lavender-200 bg-lavender-50/30 hover:bg-lavender-50"}`}
                  >
                    {file ? (
                      <>
                        <div className="w-10 h-10 rounded-full bg-mint-100 flex items-center justify-center text-mint-500">
                          {file.type.startsWith("image") ? <ImageIcon size={20} /> : <Music size={20} />}
                        </div>
                        <p className="text-xs font-semibold text-ink text-center max-w-[200px] truncate">{file.name}</p>
                        <p className="text-[10px] text-slate-soft uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-lavender-100 flex items-center justify-center text-lavender-500">
                          <Paperclip size={20} />
                        </div>
                        <p className="text-sm font-medium text-ink">Choose File</p>
                        <p className="text-xs text-slate-soft">Images or MP3</p>
                      </>
                    )}
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*,audio/*" onChange={handleFileChange} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink-muted px-1">Asset Name</label>
                    <input 
                      type="text" required value={name} onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Background Music Wedding"
                      className="input-pastel w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-cream-50 text-sm" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink-muted px-1">Key (Generated)</label>
                    <input 
                      type="text" required value={key} readOnly
                      className="input-pastel w-full px-4 py-2.5 rounded-xl border border-cream-100 bg-cream-100 text-sm font-mono text-slate-soft" 
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border border-cream-200 text-ink-muted hover:bg-cream-50 transition-colors cursor-pointer">
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading || !file}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all cursor-pointer"
                    style={{ background: "linear-gradient(135deg, #ff9fb5 0%, #c2a7ff 100%)" }}
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    {loading ? "Uploading…" : "Upload Asset"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const { token } = useAuthStore();
  const [assets, setAssets] = useState<LibraryAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "image" | "audio">("all");

  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: "" });

  const fetchAssets = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getLibraryAssetsApi(token);
      console.log("Library Assets Response:", res);
      // Fallback: handle both wrapped {data: []} and direct [] responses
      const list = res && typeof res === "object" && "data" in res && Array.isArray(res.data) 
        ? res.data 
        : (Array.isArray(res) ? res : []);
      setAssets(list);
    } catch (err: any) {
      console.error("Fetch Assets Error:", err);
      setError(err?.message ?? "Gagal memuat assets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssets(); }, [token]);

  const handleDeleteAsset = async (id: number) => {
    if (!token) return;
    if (!confirm("Apakah Anda yakin ingin menghapus asset ini? Tindakan ini tidak dapat dibatalkan.")) return;

    try {
      await deleteAssetApi(token, id);
      showToast("Asset berhasil dihapus!");
      setAssets(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      showToast(err?.message ?? "Gagal menghapus asset.");
    }
  };

  const filteredAssets = assets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.key.toLowerCase().includes(search.toLowerCase());
    const isImage = /\.(jpg|jpeg|png|webp|gif|svg)(\?|$)/i.test(a.link);
    const isAudio = /\.(mp3|wav|ogg)(\?|$)/i.test(a.link);
    
    if (filter === "image") return matchesSearch && isImage;
    if (filter === "audio") return matchesSearch && isAudio;
    return matchesSearch;
  });

  const images = filteredAssets.filter(a => /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(a.link));
  const audios = filteredAssets.filter(a => /\.(mp3|wav|ogg)(\?.*)?$/i.test(a.link));

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
            style={{ background: "linear-gradient(135deg, #ffc2cf 0%, #d9c8ff 100%)" }}>
            <Library size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink">Assets Library</h1>
            <p className="text-sm text-slate-soft">Manage all your images and audio in one place</p>
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setUploadOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-card shadow-blush-100 cursor-pointer"
          style={{ background: "linear-gradient(135deg, #ff9fb5 0%, #c2a7ff 100%)" }}
        >
          <Plus size={18} /> Upload Image / Audio
        </motion.button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-soft" size={16} />
          <input 
            type="text" placeholder="Search by name or key..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-cream-200 shadow-sm focus:border-lavender-300 transition-all text-sm outline-none"
          />
        </div>
        <div className="flex items-center bg-white p-1 rounded-2xl border border-cream-200 shadow-sm w-full sm:w-auto">
          {[
            { id: "all", label: "All" },
            { id: "image", label: "Images" },
            { id: "audio", label: "Audio" }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === f.id ? "bg-lavender-500 text-white shadow-md shadow-lavender-100" : "text-slate-soft hover:bg-cream-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-blush-400" size={32} />
            <p className="text-sm text-slate-soft">Loading library assets...</p>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-cream-100 dashed shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-cream-50 flex items-center justify-center text-slate-soft/30 mx-auto mb-4">
              <Library size={32} />
            </div>
            <p className="font-bold text-ink mb-1">No Assets Found</p>
            <p className="text-sm text-slate-soft mb-6">Start by uploading your first image or audio file.</p>
            <button 
              onClick={() => setUploadOpen(true)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-lavender-500 bg-lavender-50 hover:bg-lavender-100 transition-colors cursor-pointer"
            >
              Upload Asset
            </button>
          </div>
        ) : (
          <>
            {/* Images Grid */}
            {(filter === "all" || filter === "image") && images.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <ImageIcon size={16} className="text-blush-400" />
                  <h3 className="font-bold text-ink uppercase tracking-wider text-xs">Images ({images.length})</h3>
                  <div className="flex-1 h-[1px] bg-cream-100 ml-2" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {images.map(a => <AssetCard key={a.id} asset={a} onDelete={handleDeleteAsset} />)}
                </div>
              </div>
            )}

            {/* Audio Grid */}
            {(filter === "all" || filter === "audio") && audios.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Music size={16} className="text-lavender-400" />
                  <h3 className="font-bold text-ink uppercase tracking-wider text-xs">Audio ({audios.length})</h3>
                  <div className="flex-1 h-[1px] bg-cream-100 ml-2" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {audios.map(a => <AssetCard key={a.id} asset={a} onDelete={handleDeleteAsset} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <UploadModal 
        open={uploadOpen} 
        onClose={() => setUploadOpen(false)} 
        onSuccess={() => {
          fetchAssets();
          showToast("Asset uploaded successfully!");
        }} 
      />

      {/* Toast notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[100] px-4 py-3 rounded-2xl bg-ink text-white shadow-2xl flex items-center gap-3"
          >
            <div className="w-6 h-6 rounded-lg bg-mint-400 flex items-center justify-center text-white">
              <CheckCircle2 size={14} />
            </div>
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

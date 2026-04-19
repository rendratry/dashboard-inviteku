"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Users, Gem, PartyPopper, Image, MapPin, Gift,
  Palette, Paperclip, CheckCircle2, AlertTriangle, Loader2,
  ChevronDown, Music, X, Search, Library
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import {
  getAssetOpeningApi, updateAssetOpeningApi,
  getAssetMempelaiApi, updateAssetMempelaiApi,
  getAssetAkadApi, updateAssetAkadApi,
  getAssetResepsiApi, updateAssetResepsiApi,
  getAssetGalleryApi, updateAssetGalleryApi,
  getAssetMapsApi, updateAssetMapsApi,
  getAssetGiftApi, updateAssetGiftApi,
  getAssetBacksoundApi, updateAssetBacksoundApi,
  getUndanganApi, getLibraryAssetsApi,
  type AssetOpening, type AssetMempelai, type AssetAkad,
  type AssetResepsi, type AssetGallery, type AssetMaps, type AssetGift,
  type AssetBacksound,
  type Undangan, type LibraryAsset
} from "@/lib/api";

// ── Undangan Dropdown ──────────────────────────────────────────────────────

function UndanganSelector({
  list, loading, selected, onSelect,
}: {
  list: Undangan[]; loading: boolean;
  selected: Undangan | null; onSelect: (u: Undangan) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button id="undangan-selector-assets" type="button" onClick={() => setOpen((v) => !v)} disabled={loading}
        className="flex items-center gap-2 pl-4 pr-3 py-2.5 rounded-xl border border-cream-300 bg-white text-sm font-medium text-ink shadow-card hover:border-lavender-300 transition-all duration-200 cursor-pointer disabled:opacity-60 min-w-52">
        <Mail size={15} className="text-blush-400 flex-shrink-0" />
        <span className="flex-1 text-left truncate">
          {loading ? "Memuat undangan…" : selected ? selected.nama : "Pilih Undangan"}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-slate-soft flex-shrink-0">
          <ChevronDown size={14} />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.18 }}
              className="absolute left-0 top-12 z-20 bg-white rounded-2xl shadow-float border border-cream-200 min-w-64 max-w-xs overflow-hidden">
              {list.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Mail size={24} className="text-slate-soft/40 mx-auto mb-2" />
                  <p className="text-sm text-slate-soft">Belum ada undangan</p>
                </div>
              ) : (
                <div className="py-1.5">
                  {list.map((u) => (
                    <button key={u.id} id={`select-undangan-assets-${u.id}`} type="button"
                      onClick={() => { onSelect(u); setOpen(false); }}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-cream-100 transition-colors cursor-pointer ${selected?.id === u.id ? "bg-blush-50" : ""}`}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, #ff9fb5 0%, #c2a7ff 100%)" }}>
                        <Mail size={14} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${selected?.id === u.id ? "text-blush-500" : "text-ink"}`}>{u.nama}</p>
                        {u.key_undangan && <p className="text-xs text-slate-soft font-mono truncate">{u.key_undangan}</p>}
                      </div>
                      {selected?.id === u.id && <div className="w-2 h-2 rounded-full bg-blush-400 mt-2 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Tabs Config ────────────────────────────────────────────────────────────

const TABS = [
  { id: "opening",  label: "Opening",  icon: <Mail size={15} /> },
  { id: "mempelai", label: "Mempelai", icon: <Users size={15} /> },
  { id: "akad",     label: "Akad",     icon: <Gem size={15} /> },
  { id: "resepsi",  label: "Resepsi",  icon: <PartyPopper size={15} /> },
  { id: "gallery",  label: "Gallery",  icon: <Image size={15} /> },
  { id: "maps",     label: "Maps",     icon: <MapPin size={15} /> },
  { id: "gift",     label: "Gift",     icon: <Gift size={15} /> },
  { id: "backsound", label: "Backsound", icon: <Music size={15} /> },
] as const;

type TabId = typeof TABS[number]["id"];

// ── Shared Helpers ─────────────────────────────────────────────────────────

function FormField({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink-muted">{label}</label>
      {children}
    </div>
  );
}

const inputClass = "input-pastel w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-ink text-sm transition-all duration-200";

function SaveButton({ loading }: { loading: boolean }) {
  return (
    <div className="flex justify-end pt-2">
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
        id="asset-save-btn"
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 cursor-pointer"
        style={{ background: "linear-gradient(135deg, #ff9fb5 0%, #c2a7ff 100%)" }}>
        {loading ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : "Save"}
      </motion.button>
    </div>
  );
}

function AlertBanner({ type, message }: { type: "success" | "error" | null; message: string }) {
  if (!type) return null;
  return (
    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
        type === "success" ? "bg-mint-100 text-mint-500 border border-mint-200" : "bg-red-50 text-red-500 border border-red-100"
      }`}>
      {type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
      {message}
    </motion.div>
  );
}

function SectionSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-cream-200 rounded-xl" />)}
    </div>
  );
}

// ── Asset Picker Component ─────────────────────────────────────────────────

function AssetPicker({
  label, currentId, onSelect, token, type = "image"
}: {
  label: string;
  currentId?: number;
  onSelect: (id: number) => void;
  token: string;
  type?: "image" | "audio";
}) {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<LibraryAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await getLibraryAssetsApi(token);
      const list = res && typeof res === "object" && "data" in res && Array.isArray(res.data) 
        ? res.data 
        : (Array.isArray(res) ? res : []) as LibraryAsset[];

      const filtered = list.filter(a => {
        const isImg = /\.(jpg|jpeg|png|webp|gif|svg)(\?|$)/i.test(a.link);
        const isAud = /\.(mp3|wav|ogg)(\?|$)/i.test(a.link);
        return type === "image" ? isImg : isAud;
      });
      setAssets(filtered);
    } catch { /* noop */ } finally { setLoading(false); }
  };

  useEffect(() => { if (open) fetchAssets(); }, [open]);

  const selectedAsset = assets.find(a => a.id === currentId);
  const filteredList = assets.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.key.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-ink-muted">{label}</p>
      
      <button 
        type="button" 
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-cream-200 bg-cream-50 hover:bg-white hover:border-lavender-200 transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {currentId ? (
            <>
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-cream-200">
                {type === "image" && selectedAsset ? (
                  <img src={selectedAsset.link} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full bg-mint-100 flex items-center justify-center text-mint-500">
                    <CheckCircle2 size={18} />
                  </div>
                )}
              </div>
              <div className="text-left">
                <p className="text-sm text-ink font-semibold">{type === "image" ? "Gambar Terpilih" : "Musik Terpilih"}</p>
                <p className="text-[10px] text-slate-soft font-mono truncate">{selectedAsset?.name || ""}</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-lg bg-lavender-100 flex items-center justify-center text-lavender-400 flex-shrink-0">
                <Paperclip size={18} />
              </div>
              <span className="text-sm text-ink-muted italic">Pilih {type === "image" ? "Gambar" : "Audio"}...</span>
            </>
          )}
        </div>
        <ChevronDown size={14} className="text-slate-soft" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-[100]" onClick={() => setOpen(false)} 
            />
            
            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-[110] p-4 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden pointer-events-auto flex flex-col"
              >
                {/* Header */}
                <div className="p-6 border-b border-cream-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-lavender-100 flex items-center justify-center text-lavender-500">
                      {type === "image" ? <Image size={20} /> : <Music size={20} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-ink">Select {type === "image" ? "Image" : "Audio"}</h3>
                      <p className="text-xs text-slate-soft">Pilih dari Library Assets Anda</p>
                    </div>
                  </div>
                  <button onClick={() => setOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-cream-100 text-slate-soft cursor-pointer">
                    <X size={20} />
                  </button>
                </div>

                {/* Sub-header: Search */}
                <div className="px-6 py-4 bg-cream-50/50 border-b border-cream-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-soft" size={16} />
                    <input 
                      type="text" placeholder="Search assets..." value={search} onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-cream-200 rounded-xl text-sm focus:border-lavender-300 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Body: Grid */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                  {loading ? (
                    <div className="py-20 flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-blush-400" size={32} />
                      <p className="text-sm text-slate-soft">Loading library assets...</p>
                    </div>
                  ) : filteredList.length === 0 ? (
                    <div className="py-20 text-center text-slate-soft italic text-sm">
                      Tidak ada aset yang ditemukan.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {filteredList.map(a => (
                        <button 
                          key={a.id} type="button"
                          onClick={() => { onSelect(a.id); setOpen(false); }}
                          className={`flex flex-col rounded-2xl border transition-all cursor-pointer group overflow-hidden ${
                            currentId === a.id ? "border-blush-400 ring-2 ring-blush-100 shadow-md" : "border-cream-200 hover:border-lavender-300 bg-cream-50/30"
                          }`}
                        >
                          <div className="aspect-square bg-white relative">
                            {type === "image" ? (
                              <img src={a.link} alt={a.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lavender-400 group-hover:scale-110 transition-transform"><Music size={32} /></div>
                            )}
                            {currentId === a.id && (
                              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blush-400 text-white flex items-center justify-center shadow-lg">
                                <CheckCircle2 size={14} />
                              </div>
                            )}
                          </div>
                          <div className="p-3 text-left">
                            <p className="text-xs font-bold text-ink truncate line-clamp-1">{a.name}</p>
                            <p className="text-[10px] font-mono text-slate-soft truncate mt-0.5">{a.key}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-cream-50 border-t border-cream-100 flex justify-center">
                  <Link href="/dashboard/library" 
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-lavender-600 hover:bg-lavender-100 transition-colors">
                    <Library size={14} />
                    Go to Library to upload more
                  </Link>
                </div>
              </motion.div>
            </div>
          </>
        )}
        </AnimatePresence>

      {currentId && selectedAsset && type === "image" && (
        <div className="mt-2 w-full h-32 rounded-xl border border-cream-200 overflow-hidden bg-cream-50 flex items-center justify-center">
          <img src={selectedAsset.link} className="h-full w-full object-cover opacity-80" alt="Preview" />
        </div>
      )}
    </div>
  );
}

// ── Tab Panels ─────────────────────────────────────────────────────────────

function OpeningTab({ token, idUndangan }: { token: string; idUndangan: number }) {
  const [data, setData] = useState<AssetOpening | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });

  useEffect(() => {
    setLoading(true); setData(null);
    getAssetOpeningApi(token, idUndangan).then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [token, idUndangan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!data) return; setSaving(true);
    const payload = { ...data, id: data.id ?? 0, id_undangan: idUndangan };
    try { await updateAssetOpeningApi(token, payload); setAlert({ type: "success", message: "Opening saved!" }); }
    catch (err: unknown) { const e = err as { message?: string }; setAlert({ type: "error", message: e?.message ?? "Failed." }); }
    finally { setSaving(false); }
  };

  const update = <K extends keyof AssetOpening>(field: K, value: AssetOpening[K]) => 
    setData((d) => ({ ...(d || { id_undangan: idUndangan }), [field]: value } as AssetOpening));

  if (loading) return <SectionSkeleton />;
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AlertBanner {...alert} />
      <FormField label="Nama Mempelai (Cover)" id="opening-nama">
        <input id="opening-nama" type="text" className={inputClass} value={data?.nama_mempelai ?? ""} placeholder="Romeo & Juliet"
          onChange={(e) => update("nama_mempelai", e.target.value)} />
      </FormField>
      <AssetPicker label="Foto Cover" currentId={data?.foto_cover} token={token} type="image"
        onSelect={(id) => update("foto_cover", id)} />
      <SaveButton loading={saving} />
    </form>
  );
}

function MempelaiTab({ token, idUndangan }: { token: string; idUndangan: number }) {
  const [data, setData] = useState<AssetMempelai | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });

  useEffect(() => {
    setLoading(true); setData(null);
    getAssetMempelaiApi(token, idUndangan).then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [token, idUndangan]);

  const update = <K extends keyof AssetMempelai>(field: K, value: AssetMempelai[K]) => 
    setData((d) => ({ ...(d || { id_undangan: idUndangan }), [field]: value } as AssetMempelai));
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!data) return; setSaving(true);
    const payload = { ...data, id: data.id ?? 0, id_undangan: idUndangan };
    try { await updateAssetMempelaiApi(token, payload); setAlert({ type: "success", message: "Mempelai saved!" }); }
    catch (err: unknown) { const e = err as { message?: string }; setAlert({ type: "error", message: e?.message ?? "Failed." }); }
    finally { setSaving(false); }
  };

  if (loading) return <SectionSkeleton />;
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AlertBanner {...alert} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Nama Mempelai Pria" id="pria-nama"><input id="pria-nama" type="text" className={inputClass} placeholder="Romeo" value={data?.nama_mempelai_pria ?? ""} onChange={(e) => update("nama_mempelai_pria", e.target.value)} /></FormField>
        <FormField label="Nama Mempelai Wanita" id="wanita-nama"><input id="wanita-nama" type="text" className={inputClass} placeholder="Juliet" value={data?.nama_mempelai_wanita ?? ""} onChange={(e) => update("nama_mempelai_wanita", e.target.value)} /></FormField>
        <FormField label="Keluarga Mempelai Pria" id="pria-keluarga"><input id="pria-keluarga" type="text" className={inputClass} placeholder="Bapak & Ibu Montague" value={data?.keluarga_mempelai_pria ?? ""} onChange={(e) => update("keluarga_mempelai_pria", e.target.value)} /></FormField>
        <FormField label="Keluarga Mempelai Wanita" id="wanita-keluarga"><input id="wanita-keluarga" type="text" className={inputClass} placeholder="Bapak & Ibu Capulet" value={data?.keluarga_mempelai_wanita ?? ""} onChange={(e) => update("keluarga_mempelai_wanita", e.target.value)} /></FormField>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <AssetPicker label="Foto Mempelai Pria" currentId={data?.foto_mempelai_pria} token={token} type="image" onSelect={(id) => update("foto_mempelai_pria", id)} />
        <AssetPicker label="Foto Mempelai Wanita" currentId={data?.foto_mempelai_wanita} token={token} type="image" onSelect={(id) => update("foto_mempelai_wanita", id)} />
      </div>
      <SaveButton loading={saving} />
    </form>
  );
}

function AkadTab({ token, idUndangan }: { token: string; idUndangan: number }) {
  const [data, setData] = useState<AssetAkad | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });

  useEffect(() => {
    setLoading(true); setData(null);
    getAssetAkadApi(token, idUndangan).then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [token, idUndangan]);

  const update = <K extends keyof AssetAkad>(field: K, value: AssetAkad[K]) => 
    setData((d) => ({ ...(d || { id_undangan: idUndangan }), [field]: value } as AssetAkad));
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!data) return; setSaving(true);
    const payload = { ...data, id: data.id ?? 0, id_undangan: idUndangan };
    try { await updateAssetAkadApi(token, payload); setAlert({ type: "success", message: "Akad saved!" }); }
    catch (err: unknown) { const e = err as { message?: string }; setAlert({ type: "error", message: e?.message ?? "Failed." }); }
    finally { setSaving(false); }
  };

  if (loading) return <SectionSkeleton />;
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AlertBanner {...alert} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Title" id="akad-title"><input id="akad-title" type="text" className={inputClass} placeholder="Akad Nikah" value={data?.title ?? ""} onChange={(e) => update("title", e.target.value)} /></FormField>
        <FormField label="Hari" id="akad-hari"><input id="akad-hari" type="text" className={inputClass} placeholder="Minggu" value={data?.hari ?? ""} onChange={(e) => update("hari", e.target.value)} /></FormField>
        <FormField label="Tanggal" id="akad-tanggal"><input id="akad-tanggal" type="number" className={inputClass} placeholder="12" value={data?.tanggal ?? ""} onChange={(e) => update("tanggal", Number(e.target.value))} /></FormField>
        <FormField label="Bulan" id="akad-bulan"><input id="akad-bulan" type="text" className={inputClass} placeholder="Desember" value={data?.bulan ?? ""} onChange={(e) => update("bulan", e.target.value)} /></FormField>
        <FormField label="Tahun" id="akad-tahun"><input id="akad-tahun" type="number" className={inputClass} placeholder="2026" value={data?.tahun ?? ""} onChange={(e) => update("tahun", Number(e.target.value))} /></FormField>
      </div>
      <FormField label="Keterangan" id="akad-ket"><input id="akad-ket" type="text" className={inputClass} placeholder="Pukul 08:00 - 10:00 WIB" value={data?.keterangan ?? ""} onChange={(e) => update("keterangan", e.target.value)} /></FormField>
      <FormField label="Alamat" id="akad-alamat"><textarea id="akad-alamat" rows={2} className={`${inputClass} resize-none`} placeholder="Masjid…" value={data?.alamat ?? ""} onChange={(e) => update("alamat", e.target.value)} /></FormField>
      <AssetPicker label="Foto Akad" currentId={data?.foto_akad} token={token} type="image" onSelect={(id) => update("foto_akad", id)} />
      <SaveButton loading={saving} />
    </form>
  );
}

function ResepsiTab({ token, idUndangan }: { token: string; idUndangan: number }) {
  const [data, setData] = useState<AssetResepsi | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });

  useEffect(() => {
    setLoading(true); setData(null);
    getAssetResepsiApi(token, idUndangan).then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [token, idUndangan]);

  const update = <K extends keyof AssetResepsi>(field: K, value: AssetResepsi[K]) => 
    setData((d) => ({ ...(d || { id_undangan: idUndangan }), [field]: value } as AssetResepsi));
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!data) return; setSaving(true);
    const payload = { ...data, id: data.id ?? 0, id_undangan: idUndangan };
    try { await updateAssetResepsiApi(token, payload); setAlert({ type: "success", message: "Resepsi saved!" }); }
    catch (err: unknown) { const e = err as { message?: string }; setAlert({ type: "error", message: e?.message ?? "Failed." }); }
    finally { setSaving(false); }
  };

  if (loading) return <SectionSkeleton />;
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AlertBanner {...alert} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Title" id="resepsi-title"><input id="resepsi-title" type="text" className={inputClass} placeholder="Resepsi Pernikahan" value={data?.title ?? ""} onChange={(e) => update("title", e.target.value)} /></FormField>
        <FormField label="Hari" id="resepsi-hari"><input id="resepsi-hari" type="text" className={inputClass} placeholder="Minggu" value={data?.hari ?? ""} onChange={(e) => update("hari", e.target.value)} /></FormField>
        <FormField label="Tanggal" id="resepsi-tanggal"><input id="resepsi-tanggal" type="number" className={inputClass} placeholder="12" value={data?.tanggal ?? ""} onChange={(e) => update("tanggal", Number(e.target.value))} /></FormField>
        <FormField label="Bulan" id="resepsi-bulan"><input id="resepsi-bulan" type="text" className={inputClass} placeholder="Desember" value={data?.bulan ?? ""} onChange={(e) => update("bulan", e.target.value)} /></FormField>
        <FormField label="Tahun" id="resepsi-tahun"><input id="resepsi-tahun" type="number" className={inputClass} placeholder="2026" value={data?.tahun ?? ""} onChange={(e) => update("tahun", Number(e.target.value))} /></FormField>
      </div>
      <FormField label="Keterangan" id="resepsi-ket"><input id="resepsi-ket" type="text" className={inputClass} placeholder="Pukul 11:00 - Selesai" value={data?.keterangan ?? ""} onChange={(e) => update("keterangan", e.target.value)} /></FormField>
      <FormField label="Alamat" id="resepsi-alamat"><textarea id="resepsi-alamat" rows={2} className={`${inputClass} resize-none`} placeholder="Gedung…" value={data?.alamat ?? ""} onChange={(e) => update("alamat", e.target.value)} /></FormField>
      <AssetPicker label="Foto Resepsi" currentId={data?.foto_resepsi} token={token} type="image" onSelect={(id) => update("foto_resepsi", id)} />
      <SaveButton loading={saving} />
    </form>
  );
}

function GalleryTab({ token, idUndangan }: { token: string; idUndangan: number }) {
  const [data, setData] = useState<AssetGallery | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });

  useEffect(() => {
    setLoading(true); setData(null);
    getAssetGalleryApi(token, idUndangan).then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [token, idUndangan]);

  const update = <K extends keyof AssetGallery>(field: K, value: AssetGallery[K]) => 
    setData((d) => ({ 
      ...(d || { id: 0, id_undangan: idUndangan, foto1: 0, foto2: 0, foto3: 0, foto4: 0, foto5: 0, foto6: 0 }), 
      [field]: value 
    } as AssetGallery));
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!data) return; setSaving(true);
    const payload = {
      ...data,
      id: data.id ?? 0,
      id_undangan: idUndangan,
      foto1: data.foto1 ?? 0,
      foto2: data.foto2 ?? 0,
      foto3: data.foto3 ?? 0,
      foto4: data.foto4 ?? 0,
      foto5: data.foto5 ?? 0,
      foto6: data.foto6 ?? 0,
    };
    try { await updateAssetGalleryApi(token, payload); setAlert({ type: "success", message: "Gallery saved!" }); }
    catch (err: unknown) { const e = err as { message?: string }; setAlert({ type: "error", message: e?.message ?? "Failed." }); }
    finally { setSaving(false); }
  };

  if (loading) return <SectionSkeleton />;
  const fotoKeys: (keyof AssetGallery)[] = ["foto1","foto2","foto3","foto4","foto5","foto6"];
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AlertBanner {...alert} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {fotoKeys.map((key, i) => (
          <AssetPicker key={key} label={`Photo ${i + 1}`} currentId={data?.[key] as number | undefined}
            token={token} type="image" onSelect={(id) => update(key, id)} />
        ))}
      </div>
      <SaveButton loading={saving} />
    </form>
  );
}

function MapsTab({ token, idUndangan }: { token: string; idUndangan: number }) {
  const [data, setData] = useState<AssetMaps | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });

  useEffect(() => {
    setLoading(true); setData(null);
    getAssetMapsApi(token, idUndangan).then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [token, idUndangan]);

  const update = <K extends keyof AssetMaps>(field: K, value: AssetMaps[K]) => 
    setData((d) => ({ ...(d || { id_undangan: idUndangan }), [field]: value } as AssetMaps));
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!data) return; setSaving(true);
    const payload = { ...data, id: data.id ?? 0, id_undangan: idUndangan };
    try { await updateAssetMapsApi(token, payload); setAlert({ type: "success", message: "Maps saved!" }); }
    catch (err: unknown) { const e = err as { message?: string }; setAlert({ type: "error", message: e?.message ?? "Failed." }); }
    finally { setSaving(false); }
  };

  if (loading) return <SectionSkeleton />;
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AlertBanner {...alert} />
      <FormField label="Title / Nama Lokasi" id="maps-title">
        <input id="maps-title" type="text" className={inputClass} placeholder="Gedung Serbaguna…" value={data?.title ?? ""} onChange={(e) => update("title", e.target.value)} />
      </FormField>
      <div className="grid grid-cols-2 gap-5">
        <FormField label="Latitude" id="maps-lat"><input id="maps-lat" type="text" className={inputClass} placeholder="-6.200000" value={data?.lat ?? ""} onChange={(e) => update("lat", e.target.value)} /></FormField>
        <FormField label="Longitude" id="maps-lang"><input id="maps-lang" type="text" className={inputClass} placeholder="106.816666" value={data?.lang ?? ""} onChange={(e) => update("lang", e.target.value)} /></FormField>
      </div>
      {data?.lat && data?.lang && (
        <div className="rounded-2xl overflow-hidden border border-cream-200 h-48">
          <iframe src={`https://maps.google.com/maps?q=${data.lat},${data.lang}&output=embed`}
            className="w-full h-full" loading="lazy" title="location-map" />
        </div>
      )}
      <SaveButton loading={saving} />
    </form>
  );
}

function GiftTab({ token, idUndangan }: { token: string; idUndangan: number }) {
  const [data, setData] = useState<AssetGift | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });

  useEffect(() => {
    setLoading(true); setData(null);
    getAssetGiftApi(token, idUndangan).then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [token, idUndangan]);

  const update = <K extends keyof AssetGift>(field: K, value: AssetGift[K]) => 
    setData((d) => ({ ...(d || { id_undangan: idUndangan }), [field]: value } as AssetGift));
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!data) return; setSaving(true);
    const payload = { ...data, id: data.id ?? 0, id_undangan: idUndangan };
    try { await updateAssetGiftApi(token, payload); setAlert({ type: "success", message: "Gift saved!" }); }
    catch (err: unknown) { const e = err as { message?: string }; setAlert({ type: "error", message: e?.message ?? "Failed." }); }
    finally { setSaving(false); }
  };

  if (loading) return <SectionSkeleton />;
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AlertBanner {...alert} />
      <FormField label="GoPay / Dana Number" id="gift-gopay"><input id="gift-gopay" type="text" className={inputClass} placeholder="0812345678" value={data?.gopay ?? ""} onChange={(e) => update("gopay", e.target.value)} /></FormField>
      <FormField label="Bank Name" id="gift-bank"><input id="gift-bank" type="text" className={inputClass} placeholder="BCA / Mandiri…" value={data?.bank ?? ""} onChange={(e) => update("bank", e.target.value)} /></FormField>
      <FormField label="Account Number" id="gift-no-rek"><input id="gift-no-rek" type="text" className={inputClass} placeholder="1234567890" value={data?.no_rek ?? ""} onChange={(e) => update("no_rek", e.target.value)} /></FormField>
      <FormField label="Account Name" id="gift-nama-rek"><input id="gift-nama-rek" type="text" className={inputClass} placeholder="Romeo Montague" value={data?.nama_rek ?? ""} onChange={(e) => update("nama_rek", e.target.value)} /></FormField>
      <SaveButton loading={saving} />
    </form>
  );
}
function BacksoundTab({ token, idUndangan }: { token: string; idUndangan: number }) {
  const [data, setData] = useState<AssetBacksound | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });

  useEffect(() => {
    setLoading(true); setData(null);
    getAssetBacksoundApi(token, idUndangan).then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [token, idUndangan]);

  const update = (value: number) => 
    setData((d) => ({ ...(d || { id_undangan: idUndangan }), backsound: value } as AssetBacksound));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!data) return; setSaving(true);
    const payload = { ...data, id: data.id ?? 0, id_undangan: idUndangan };
    try { 
      await updateAssetBacksoundApi(token, payload); 
      setAlert({ type: "success", message: "Background Music saved!" }); 
    }
    catch (err: unknown) { const e = err as { message?: string }; setAlert({ type: "error", message: e?.message ?? "Failed." }); }
    finally { setSaving(false); }
  };

  if (loading) return <SectionSkeleton />;
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AlertBanner {...alert} />
      <AssetPicker label="Pilih Background Music" currentId={data?.backsound} token={token} type="audio"
        onSelect={(id) => update(id)} />
      <SaveButton loading={saving} />
    </form>
  );
}

// ── Tab Router ─────────────────────────────────────────────────────────────

function TabContent({ id, token, idUndangan }: { id: TabId; token: string; idUndangan: number }) {
  switch (id) {
    case "opening":  return <OpeningTab  token={token} idUndangan={idUndangan} />;
    case "mempelai": return <MempelaiTab token={token} idUndangan={idUndangan} />;
    case "akad":     return <AkadTab     token={token} idUndangan={idUndangan} />;
    case "resepsi":  return <ResepsiTab  token={token} idUndangan={idUndangan} />;
    case "gallery":  return <GalleryTab  token={token} idUndangan={idUndangan} />;
    case "maps":     return <MapsTab     token={token} idUndangan={idUndangan} />;
    case "gift":     return <GiftTab     token={token} idUndangan={idUndangan} />;
    case "backsound": return <BacksoundTab token={token} idUndangan={idUndangan} />;
  }
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function AssetsPage() {
  const { token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabId>("opening");

  // Undangan selector
  const [undanganList, setUndanganList] = useState<Undangan[]>([]);
  const [undanganLoading, setUndanganLoading] = useState(true);
  const [selectedUndangan, setSelectedUndangan] = useState<Undangan | null>(null);

  const fetchUndangan = useCallback(async () => {
    if (!token) return;
    setUndanganLoading(true);
    try {
      const res = await getUndanganApi(token);
      const list = Array.isArray(res.data) ? res.data : [];
      setUndanganList(list);
      if (list.length > 0) setSelectedUndangan(list[0]);
    } catch { /* noop */ } finally { setUndanganLoading(false); }
  }, [token]);

  useEffect(() => { fetchUndangan(); }, [fetchUndangan]);

  if (!token) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
            style={{ background: "linear-gradient(135deg, #b3e3ff 0%, #9af5db 100%)" }}>
            <Palette size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink">Undangan Assets</h1>
            <p className="text-sm text-slate-soft">
              {selectedUndangan ? `Mengedit: ${selectedUndangan.nama}` : "Pilih undangan untuk mengatur aset"}
            </p>
          </div>
        </div>

        {/* Undangan dropdown */}
        <UndanganSelector
          list={undanganList}
          loading={undanganLoading}
          selected={selectedUndangan}
          onSelect={(u) => { setSelectedUndangan(u); setActiveTab("opening"); }}
        />
      </motion.div>

      {/* No undangan */}
      {!selectedUndangan && !undanganLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-16 bg-white rounded-2xl shadow-card">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mx-auto mb-4"
            style={{ background: "linear-gradient(135deg, #ffc2cf 0%, #d9c8ff 100%)" }}>
            <Mail size={26} strokeWidth={1.5} />
          </div>
          <p className="font-semibold text-ink">Belum ada undangan</p>
          <p className="text-sm text-slate-soft mt-1">Buat undangan terlebih dahulu di menu Buat Undangan.</p>
        </motion.div>
      )}

      {selectedUndangan && (
        <>
          {/* Tabs nav */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {TABS.map((tab) => (
              <button key={tab.id} id={`tab-${tab.id}`} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer flex-shrink-0 ${
                  activeTab === tab.id ? "tab-active shadow-card" : "bg-white text-slate-soft hover:bg-cream-200 hover:text-ink shadow-card"
                }`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </motion.div>

          {/* Tab content */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-card">
            <AnimatePresence mode="wait">
              <motion.div key={`${activeTab}-${selectedUndangan.id}`}
                initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.22 }}>
                <TabContent id={activeTab} token={token} idUndangan={selectedUndangan.id} />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </div>
  );
}

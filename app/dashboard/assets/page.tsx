"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Users, Gem, PartyPopper, Image, MapPin, Gift,
  Palette, Paperclip, CheckCircle2, AlertTriangle, Loader2,
  ChevronDown, Music, X, Search, Library, Plus, Trash2, CreditCard, Eye,
  RotateCcw, Save, Frame, LayoutGrid, UserRound, Heart, Layers2, Camera, Rows3, MessageSquare
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
  getUndanganApi, getLibraryAssetsApi, getPaymentLogosApi,
  generatePreviewTokenApi,
  getDisplayConfigApi, updateDisplayConfigApi, getTemplateDefaultConfigApi,
  updateQuotesAssetsApi, getQuotesAssetsApi,
  type AssetOpening, type AssetMempelai, type AssetAkad,
  type AssetResepsi, type AssetGallery, type AssetMaps, type AssetGift,
  type AssetBacksound, type DisplayConfig, type AssetQuotes,
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
  { id: "quotes",   label: "Quotes",   icon: <MessageSquare size={15} /> },
  { id: "mempelai", label: "Mempelai", icon: <Users size={15} /> },
  { id: "akad",     label: "Akad",     icon: <Gem size={15} /> },
  { id: "resepsi",  label: "Resepsi",  icon: <PartyPopper size={15} /> },
  { id: "gallery",  label: "Gallery",  icon: <Image size={15} /> },
  { id: "maps",     label: "Maps",     icon: <MapPin size={15} /> },
  { id: "gift",     label: "Gift",     icon: <Gift size={15} /> },
  { id: "backsound", label: "Backsound", icon: <Music size={15} /> },
  { id: "tampilan", label: "Tampilan",  icon: <Palette size={15} /> },
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

function QuotesTab({ token, undangan }: { token: string; undangan: Undangan }) {
  const defaultQuote = "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sungguh, pada yang demikian itu benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir.";
  const defaultSumber = "(Q.S. Ar-Rum Ayat 21)";

  const [data, setData] = useState<{ teks: string; sumber: string }>({ teks: "", sumber: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });

  useEffect(() => {
    setLoading(true);
    getQuotesAssetsApi(token, undangan.id).then((r) => {
      const q = r.data;
      setData({
        teks: q?.teks || "",
        sumber: q?.sumber || "",
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [token, undangan.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateQuotesAssetsApi(token, {
        id_undangan: undangan.id,
        teks: data.teks,
        sumber: data.sumber,
      });
      setAlert({ type: "success", message: "Quotes saved!" });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setAlert({ type: "error", message: e?.message ?? "Failed." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <SectionSkeleton />;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AlertBanner {...alert} />
      
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setData({ teks: defaultQuote, sumber: defaultSumber })}
          className="text-xs font-semibold text-lavender-600 hover:text-lavender-700 bg-lavender-50 hover:bg-lavender-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          Reset ke Default
        </button>
      </div>

      <FormField label="Teks Quote" id="quotes-teks">
        <textarea
          id="quotes-teks"
          rows={5}
          className={inputClass + " resize-none"}
          placeholder={defaultQuote}
          value={data.teks}
          onChange={(e) => setData(d => ({ ...d, teks: e.target.value }))}
        />
      </FormField>

      <FormField label="Sumber / Penulis" id="quotes-sumber">
        <input
          id="quotes-sumber"
          type="text"
          className={inputClass}
          placeholder={defaultSumber}
          value={data.sumber}
          onChange={(e) => setData(d => ({ ...d, sumber: e.target.value }))}
        />
      </FormField>

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

function PaymentLogoPicker({
  logos, currentId, onSelect
}: {
  logos: { id: number; name: string; path: string }[];
  currentId?: number;
  onSelect: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedLogo = logos.find(l => l.id === currentId);
  const filteredList = logos.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-1.5 w-full">
      <p className="text-sm font-medium text-ink-muted">Logo Pembayaran</p>
      
      <button 
        type="button" 
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-cream-200 bg-cream-50 hover:bg-white hover:border-lavender-200 transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {currentId && selectedLogo ? (
            <>
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-cream-200 p-1 bg-white">
                <img src={selectedLogo.path} className="w-full h-full object-contain" alt={selectedLogo.name} />
              </div>
              <div className="text-left">
                <p className="text-sm text-ink font-semibold">Logo Terpilih</p>
                <p className="text-[10px] text-slate-soft font-mono truncate">{selectedLogo.name.replace(/\.[^/.]+$/, "")}</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-lg bg-lavender-100 flex items-center justify-center text-lavender-400 flex-shrink-0">
                <Image size={18} />
              </div>
              <span className="text-sm text-ink-muted italic">Pilih Logo...</span>
            </>
          )}
        </div>
        <ChevronDown size={14} className="text-slate-soft" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-[100]" onClick={() => setOpen(false)} 
            />
            
            <div className="fixed inset-0 flex items-center justify-center z-[110] p-4 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden pointer-events-auto flex flex-col"
              >
                <div className="p-6 border-b border-cream-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-lavender-100 flex items-center justify-center text-lavender-500">
                      <Image size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-ink">Pilih Logo Pembayaran</h3>
                      <p className="text-xs text-slate-soft">Pilih logo bank atau e-wallet</p>
                    </div>
                  </div>
                  <button onClick={() => setOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-cream-100 text-slate-soft cursor-pointer">
                    <X size={20} />
                  </button>
                </div>

                <div className="px-6 py-4 bg-cream-50/50 border-b border-cream-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-soft" size={16} />
                    <input 
                      type="text" placeholder="Cari logo..." value={search} onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-cream-200 rounded-xl text-sm focus:border-lavender-300 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                  {filteredList.length === 0 ? (
                    <div className="py-20 text-center text-slate-soft italic text-sm">
                      Logo tidak ditemukan.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {filteredList.map(l => (
                        <button 
                          key={l.id} type="button"
                          onClick={() => { onSelect(l.id); setOpen(false); }}
                          className={`flex flex-col rounded-2xl border transition-all cursor-pointer group overflow-hidden ${
                            currentId === l.id ? "border-blush-400 ring-2 ring-blush-100 shadow-md" : "border-cream-200 hover:border-lavender-300 bg-cream-50/30"
                          }`}
                        >
                          <div className="aspect-square bg-white relative p-4 flex items-center justify-center">
                            <img src={l.path} alt={l.name} className="max-w-full max-h-full object-contain" />
                            {currentId === l.id && (
                              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blush-400 text-white flex items-center justify-center shadow-lg">
                                <CheckCircle2 size={14} />
                              </div>
                            )}
                          </div>
                          <div className="p-3 border-t border-cream-100 bg-white text-center">
                            <p className="text-xs font-bold text-ink truncate">{l.name.replace(/\.[^/.]+$/, "")}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function GiftTab({ token, idUndangan }: { token: string; idUndangan: number }) {
  const [data, setData] = useState<AssetGift[]>([]);
  const [logos, setLogos] = useState<{ id: number; name: string; path: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });

  useEffect(() => {
    setLoading(true); setData([]);
    Promise.all([
      getAssetGiftApi(token, idUndangan).catch(() => ({ data: [] })),
      getPaymentLogosApi().catch(() => ({ data: [] }))
    ])
      .then(([rGift, rLogos]) => {
        setData(Array.isArray(rGift?.data) ? rGift.data : []);
        setLogos(Array.isArray(rLogos?.data) ? rLogos.data : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, idUndangan]);

  const updateGift = (index: number, field: keyof AssetGift, value: string | number) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value } as AssetGift;
    
    // Automatically set bank_name when logo changes, if bank_name is empty
    if (field === "logo_id") {
      const selectedLogo = logos.find(l => l.id === value);
      if (selectedLogo && !newData[index].bank_name) {
        // e.g. "bca.png" -> "Bca", "shopeepay.png" -> "Shopeepay"
        const nameWithoutExt = selectedLogo.name.replace(/\.[^/.]+$/, "");
        newData[index].bank_name = nameWithoutExt.toUpperCase();
      }
    }
    
    setData(newData);
  };

  const removeGift = (index: number) => {
    setData((prev) => prev.filter((_, i) => i !== index));
  };

  const addGift = () => {
    setData((prev) => [
      ...prev,
      { id: 0, id_undangan: idUndangan, bank_name: "", account_number: "", account_name: "" }
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setAlert({ type: null, message: "" });
    const payload = { 
      id_undangan: idUndangan, 
      gifts: data.map(d => ({
        bank_name: d.bank_name,
        account_number: d.account_number,
        account_name: d.account_name,
        logo_id: d.logo_id,
      })) 
    };
    try { 
      await updateAssetGiftApi(token, payload); 
      setAlert({ type: "success", message: "Gifts saved successfully!" }); 
    }
    catch (err: unknown) { const e = err as { message?: string }; setAlert({ type: "error", message: e?.message ?? "Failed." }); }
    finally { setSaving(false); }
  };

  // Helper to generate a dummy color based on bank name
  const getDummyColor = (name: string) => {
    const colors = ["#ff9fb5", "#c2a7ff", "#9af5db", "#b3e3ff", "#ffc2cf"];
    if (!name) return "#e2e8f0"; // default gray
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  if (loading) return <SectionSkeleton />;
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AlertBanner {...alert} />
      
      <div className="space-y-4">
        <AnimatePresence>
          {data.map((gift, index) => {
            const logoUrl = gift.logo_link || gift.logo?.path || logos.find(l => l.id === gift.logo_id)?.path;
            
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-5 rounded-2xl border border-cream-200 bg-cream-50/50 relative group"
              >
                <button 
                  type="button" 
                  onClick={() => removeGift(index)}
                  className="absolute top-4 right-4 p-2 text-slate-soft hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove Gift"
                >
                  <Trash2 size={16} />
                </button>
                
                <div className="flex items-center gap-4 mb-5">
                  {logoUrl ? (
                    <div className="w-16 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm p-2 border border-cream-200">
                      <img src={logoUrl} alt={gift.bank_name || "Logo"} className="max-w-full max-h-full object-contain" />
                    </div>
                  ) : (
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
                      style={{ backgroundColor: getDummyColor(gift.bank_name) }}
                    >
                      {gift.bank_name ? gift.bank_name.charAt(0).toUpperCase() : <CreditCard size={20} />}
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-ink">{gift.bank_name || "Nama Bank / E-Wallet"}</h4>
                    <p className="text-xs text-slate-soft">{logoUrl ? "Logo Pembayaran" : "Dummy icon di-generate otomatis"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <PaymentLogoPicker logos={logos} currentId={gift.logo_id} onSelect={(id) => updateGift(index, "logo_id", id)} />
                  <FormField label="Bank / E-Wallet Name" id={`gift-bank-${index}`}>
                    <input id={`gift-bank-${index}`} type="text" className={inputClass} placeholder="BCA / GoPay / Dana" value={gift.bank_name || ""} onChange={(e) => updateGift(index, "bank_name", e.target.value)} required />
                  </FormField>
                  <FormField label="Account Number" id={`gift-no-rek-${index}`}>
                    <input id={`gift-no-rek-${index}`} type="text" className={inputClass} placeholder="1234567890" value={gift.account_number || ""} onChange={(e) => updateGift(index, "account_number", e.target.value)} required />
                  </FormField>
                  <FormField label="Account Name" id={`gift-nama-rek-${index}`}>
                    <input id={`gift-nama-rek-${index}`} type="text" className={inputClass} placeholder="Romeo Montague" value={gift.account_name || ""} onChange={(e) => updateGift(index, "account_name", e.target.value)} required />
                  </FormField>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {data.length === 0 && (
          <div className="text-center py-10 border-2 border-dashed border-cream-200 rounded-2xl">
            <Gift size={24} className="text-slate-soft/40 mx-auto mb-2" />
            <p className="text-sm text-slate-soft">Belum ada akun hadiah yang ditambahkan.</p>
          </div>
        )}

        <button 
          type="button" 
          onClick={addGift}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-lavender-300 text-lavender-600 hover:bg-lavender-50 transition-colors text-sm font-medium"
        >
          <Plus size={16} /> Tambah Akun / Rekening
        </button>
      </div>

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

// ── Display Config Tab ──────────────────────────────────────────────────────

// Definisi frame shapes untuk picker visual
const FRAME_OPTIONS = [
  { key: 'rounded-arch', label: 'Arch', desc: 'Setengah lingkaran atas' },
  { key: 'circle',       label: 'Circle', desc: 'Lingkaran penuh' },
  { key: 'rectangle',    label: 'Kotak', desc: 'Persegi biasa' },
  { key: 'rounded',      label: 'Rounded', desc: 'Sudut membulat' },
  { key: 'diamond',      label: 'Diamond', desc: 'Belah ketupat' },
  { key: 'love',         label: 'Love', desc: 'Bentuk hati ❤️' },
  { key: 'hexagon',      label: 'Hexagon', desc: 'Segi enam' },
  { key: 'star',         label: 'Star', desc: 'Bintang ⭐' },
];

// Definisi layout gallery untuk picker visual
const GRID_OPTIONS = [
  { key: 'masonry-classic', label: 'Masonry', desc: 'Layout asimetris dinamis' },
  { key: 'grid-equal',      label: 'Grid Rata', desc: '2×3 semua sama besar' },
  { key: 'grid-featured',   label: 'Featured', desc: '1 besar + 5 kecil' },
  { key: 'mosaic',          label: 'Mosaic', desc: 'Pola mosaic estetik' },
  { key: 'polaroid',        label: 'Polaroid', desc: 'Frame ala polaroid' },
];

// Komponen SVG preview untuk frame shape
function FramePreview({ frameKey, size = 56, selected = false }: { frameKey: string; size?: number; selected?: boolean }) {
  const color = selected ? '#ff9fb5' : '#c8bfb8';
  const bg = selected ? '#fff0f3' : '#f8f4f1';

  const shapeStyle: React.CSSProperties = (() => {
    switch (frameKey) {
      // Untuk thumbnail kecil (48px), gunakan persentase tinggi agar arch terlihat proporsional
      // Nilai 90px pada foto real = ~70% dari lebar foto 50%vw
      case 'rounded-arch': return { borderTopLeftRadius: '70%', borderTopRightRadius: '70%', borderBottomLeftRadius: '6px', borderBottomRightRadius: '6px' };
      case 'circle':       return { borderRadius: '50%' };
      case 'rectangle':    return { borderRadius: '0' };
      case 'rounded':      return { borderRadius: '8px' };
      case 'diamond':      return { clipPath: 'polygon(50% 0%,100% 50%,50% 100%,0% 50%)', borderRadius: '0' };
      case 'love':         return { clipPath: 'path("M 50 85 C 50 85 10 60 10 30 C 10 15 20 5 35 5 C 42 5 48 9 50 13 C 52 9 58 5 65 5 C 80 5 90 15 90 30 C 90 60 50 85 50 85 Z")', borderRadius: '0' };
      case 'hexagon':      return { clipPath: 'polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)', borderRadius: '0' };
      case 'star':         return { clipPath: 'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)', borderRadius: '0' };
      default:             return { borderTopLeftRadius: '70%', borderTopRightRadius: '70%', borderBottomLeftRadius: '6px', borderBottomRightRadius: '6px' };
    }
  })();

  return (
    <div
      style={{
        width: size, height: size,
        background: `linear-gradient(135deg, ${color}88, ${color}44)`,
        backgroundColor: bg,
        border: `2px solid ${color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        ...shapeStyle,
      }}
    />
  );
}

// Picker untuk satu group frame (misal: frame_opening)
function FramePicker({ label, icon, value, onChange }: { label: string; icon?: React.ReactNode; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-ink flex items-center gap-1.5">
        {icon && <span className="text-blush-400">{icon}</span>}
        {label}
      </p>
      <div className="flex flex-wrap gap-3">
        {FRAME_OPTIONS.map((opt) => {
          const isSelected = value === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onChange(opt.key)}
              title={opt.desc}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-blush-400 bg-blush-50 shadow-md'
                  : 'border-cream-200 bg-white hover:border-lavender-300 hover:bg-cream-50'
              }`}
              style={{ minWidth: 68 }}
            >
              <FramePreview frameKey={opt.key} size={48} selected={isSelected} />
              <span className={`text-xs font-medium leading-tight text-center ${isSelected ? 'text-blush-600' : 'text-slate-soft'}`}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Komponen preview thumbnail untuk grid layout
function GridPreview({ gridKey, selected = false }: { gridKey: string; selected?: boolean }) {
  const color = selected ? '#ff9fb5' : '#c8bfb8';
  const bg = selected ? '#fff0f3' : '#f8f4f1';

  const cells: { col: string; row: string }[] = (() => {
    switch (gridKey) {
      case 'masonry-classic': return [
        { col: '1/3', row: '1/3' }, { col: '3/4', row: '1/2' },
        { col: '3/4', row: '2/4' }, { col: '1/2', row: '3/4' },
        { col: '2/3', row: '3/4' }
      ];
      case 'grid-equal': return [
        { col: '1/2', row: '1/2' }, { col: '2/3', row: '1/2' },
        { col: '1/2', row: '2/3' }, { col: '2/3', row: '2/3' },
        { col: '1/2', row: '3/4' }, { col: '2/3', row: '3/4' },
      ];
      case 'grid-featured': return [
        { col: '1/4', row: '1/2' },
        { col: '1/2', row: '2/3' }, { col: '2/3', row: '2/3' }, { col: '3/4', row: '2/3' },
      ];
      case 'mosaic': return [
        { col: '1/3', row: '1/3' }, { col: '3/5', row: '1/2' },
        { col: '3/4', row: '2/3' }, { col: '4/5', row: '2/3' },
        { col: '1/4', row: '3/4' },
      ];
      case 'polaroid': return [
        { col: '1/2', row: '1/2' }, { col: '2/3', row: '1/2' },
        { col: '1/2', row: '2/3' }, { col: '2/3', row: '2/3' },
      ];
      default: return [];
    }
  })();

  const hasPolaroidBorder = gridKey === 'polaroid';

  return (
    <div style={{
      width: 80, height: 64,
      display: 'grid',
      gridTemplateColumns: gridKey === 'masonry-classic' ? 'repeat(3,1fr)'
        : gridKey === 'grid-equal' ? 'repeat(2,1fr)'
        : gridKey === 'grid-featured' ? 'repeat(3,1fr)'
        : gridKey === 'mosaic' ? 'repeat(4,1fr)'
        : 'repeat(2,1fr)',
      gridTemplateRows: 'repeat(3, 1fr)',
      gap: 2,
      padding: 4,
      background: bg,
      borderRadius: 8,
      border: `2px solid ${color}`,
    }}>
      {cells.map((cell, i) => (
        <div key={i} style={{
          gridColumn: cell.col,
          gridRow: cell.row,
          background: color,
          borderRadius: hasPolaroidBorder ? 2 : 3,
          opacity: selected ? 0.85 : 0.6,
          outline: hasPolaroidBorder ? `2px solid white` : 'none',
        }} />
      ))}
    </div>
  );
}

function DisplayConfigTab({ token, idUndangan, template }: { token: string; idUndangan: number; template?: string }) {
  const [config, setConfig] = useState<DisplayConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });

  useEffect(() => {
    setLoading(true); setConfig(null);
    getDisplayConfigApi(token, idUndangan)
      .then((r) => setConfig(r.data))
      .catch(() => {
        // Jika belum ada config, buat default kosong
        setConfig({
          id_undangan: idUndangan,
          frame_opening: 'rounded-arch',
          frame_mempelai_pria: 'circle',
          frame_mempelai_wanita: 'circle',
          frame_akad: 'rounded-arch',
          frame_resepsi: 'rounded-arch',
          gallery_grid: 'masonry-classic',
        });
      })
      .finally(() => setLoading(false));
  }, [token, idUndangan]);

  const update = <K extends keyof DisplayConfig>(field: K, value: DisplayConfig[K]) =>
    setConfig((d) => d ? { ...d, [field]: value } : d);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setSaving(true); setAlert({ type: null, message: '' });
    try {
      await updateDisplayConfigApi(token, config);
      setAlert({ type: 'success', message: 'Konfigurasi tampilan berhasil disimpan! ✨' });
      setTimeout(() => setAlert({ type: null, message: '' }), 4000);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setAlert({ type: 'error', message: e?.message ?? 'Gagal menyimpan.' });
    } finally { setSaving(false); }
  };

  const handleReset = async () => {
    setResetting(true); setAlert({ type: null, message: '' });
    try {
      const res = await getTemplateDefaultConfigApi(token, idUndangan);
      setConfig(res.data);
      setAlert({ type: 'success', message: `Berhasil dimuat default template! Klik Simpan untuk menyimpan perubahan.` });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setAlert({ type: 'error', message: e?.message ?? 'Gagal memuat default.' });
    } finally { setResetting(false); }
  };

  if (loading) return <SectionSkeleton />;
  if (!config) return null;

  const frameFields: { field: keyof DisplayConfig; label: string; icon: React.ReactNode }[] = [
    { field: 'frame_opening',        label: 'Frame Foto Opening (Cover)',  icon: <Camera size={14} /> },
    { field: 'frame_mempelai_pria',  label: 'Frame Foto Mempelai Pria',   icon: <UserRound size={14} /> },
    { field: 'frame_mempelai_wanita',label: 'Frame Foto Mempelai Wanita', icon: <UserRound size={14} /> },
    { field: 'frame_akad',           label: 'Bentuk Info Akad',           icon: <Gem size={14} /> },
    { field: 'frame_resepsi',        label: 'Bentuk Info Resepsi',        icon: <PartyPopper size={14} /> },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header section */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-base font-bold text-ink flex items-center gap-2">
            <Palette size={18} className="text-blush-400" />
            Kustomisasi Tampilan Foto
          </h3>
          <p className="text-xs text-slate-soft mt-0.5">Pilih bentuk frame foto dan layout gallery yang paling sesuai.</p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          disabled={resetting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-cream-300 bg-cream-50 text-slate-soft hover:bg-cream-100 hover:text-ink transition-colors disabled:opacity-50 cursor-pointer"
        >
          {resetting ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
          Reset ke Default Template
        </button>
      </div>

      <AlertBanner {...alert} />

      {/* Frame Pickers */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-cream-100">
          <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(135deg,#ff9fb5,#c2a7ff)' }} />
          <Frame size={15} className="text-blush-400" />
          <h4 className="font-bold text-sm text-ink">Bentuk Frame Foto</h4>
        </div>
        {frameFields.map(({ field, label, icon }) => (
          <FramePicker
            key={field}
            label={label}
            icon={icon}
            value={config[field] as string}
            onChange={(v) => update(field, v)}
          />
        ))}
      </div>

      {/* Gallery Grid Picker */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-cream-100">
          <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(135deg,#b3e3ff,#9af5db)' }} />
          <LayoutGrid size={15} className="text-mint-500" />
          <h4 className="font-bold text-sm text-ink">Layout Grid Gallery</h4>
        </div>
        <p className="text-xs text-slate-soft">Pilih susunan foto-foto di halaman Gallery.</p>
        <div className="flex flex-wrap gap-4">
          {GRID_OPTIONS.map((opt) => {
            const isSelected = config.gallery_grid === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => update('gallery_grid', opt.key)}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-blush-400 bg-blush-50 shadow-md'
                    : 'border-cream-200 bg-white hover:border-lavender-300 hover:bg-cream-50'
                }`}
              >
                <GridPreview gridKey={opt.key} selected={isSelected} />
                <div className="text-center">
                  <p className={`text-xs font-bold ${isSelected ? 'text-blush-600' : 'text-ink'}`}>{opt.label}</p>
                  <p className="text-[10px] text-slate-soft mt-0.5 max-w-[80px] leading-tight">{opt.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-cream-100">
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={saving}
          id="display-config-save-btn"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 cursor-pointer shadow-md"
          style={{ background: 'linear-gradient(135deg, #ff9fb5 0%, #c2a7ff 100%)' }}
        >
          {saving ? <><Loader2 size={14} className="animate-spin" />Menyimpan…</> : <><Save size={14} />Simpan Tampilan</>}
        </motion.button>
      </div>
    </form>
  );
}

// ── Tab Router ─────────────────────────────────────────────────────────────

function TabContent({ id, token, idUndangan, undangan }: { id: TabId; token: string; idUndangan: number; undangan?: import("@/lib/api").Undangan | null }) {
  switch (id) {
    case "opening":  return <OpeningTab  token={token} idUndangan={idUndangan} />;
    case "quotes":   return undangan ? <QuotesTab token={token} undangan={undangan} /> : null;
    case "mempelai": return <MempelaiTab token={token} idUndangan={idUndangan} />;
    case "akad":     return <AkadTab     token={token} idUndangan={idUndangan} />;
    case "resepsi":  return <ResepsiTab  token={token} idUndangan={idUndangan} />;
    case "gallery":  return <GalleryTab  token={token} idUndangan={idUndangan} />;
    case "maps":     return <MapsTab     token={token} idUndangan={idUndangan} />;
    case "gift":     return <GiftTab     token={token} idUndangan={idUndangan} />;
    case "backsound": return <BacksoundTab token={token} idUndangan={idUndangan} />;
    case "tampilan": return <DisplayConfigTab token={token} idUndangan={idUndangan} template={undangan?.template} />;
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
  const [previewLoading, setPreviewLoading] = useState(false);

  const handlePreview = async () => {
    if (!token || !selectedUndangan || previewLoading) return;
    setPreviewLoading(true);
    try {
      const res = await generatePreviewTokenApi(token, selectedUndangan.id);
      if (res.data?.preview_token) {
        window.open(`https://inviteku.com/undangan/preview?access=${res.data.preview_token}`, '_blank');
      }
    } catch (e: unknown) {
      alert((e as { message?: string })?.message ?? "Gagal memuat preview.");
    } finally {
      setPreviewLoading(false);
    }
  };

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
        <div className="flex items-center gap-3 flex-wrap">
          <UndanganSelector
            list={undanganList}
            loading={undanganLoading}
            selected={selectedUndangan}
            onSelect={(u) => { setSelectedUndangan(u); setActiveTab("opening"); }}
          />
          {selectedUndangan && (
            <button
              onClick={handlePreview}
              disabled={previewLoading}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border border-mint-200 text-mint-600 bg-mint-50 hover:bg-mint-100 transition-colors disabled:opacity-50"
            >
              {previewLoading ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />} Preview
            </button>
          )}
        </div>
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
                <TabContent id={activeTab} token={token} idUndangan={selectedUndangan.id} undangan={selectedUndangan} />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </div>
  );
}

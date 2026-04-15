"use client";

/**
 * Undangan Assets page — /dashboard/assets
 * Multi-tab interface for managing all sections of a digital invitation:
 * Opening, Mempelai, Akad, Resepsi, Gallery, Maps, Gift.
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/store";
import {
  getAssetOpeningApi, updateAssetOpeningApi,
  getAssetMempelaiApi, updateAssetMempelaiApi,
  getAssetAkadApi, updateAssetAkadApi,
  getAssetResepsiApi, updateAssetResepsiApi,
  getAssetGalleryApi, updateAssetGalleryApi,
  getAssetMapsApi, updateAssetMapsApi,
  getAssetGiftApi, updateAssetGiftApi,
  uploadAssetsApi,
  type AssetOpening, type AssetMempelai, type AssetAkad,
  type AssetResepsi, type AssetGallery, type AssetMaps, type AssetGift,
} from "@/lib/api";

// ── Constants ──────────────────────────────────────────────────────────────

const ID_UNDANGAN = 1;

const TABS = [
  { id: "opening", label: "Opening", icon: "🌸" },
  { id: "mempelai", label: "Mempelai", icon: "💑" },
  { id: "akad", label: "Akad", icon: "💍" },
  { id: "resepsi", label: "Resepsi", icon: "🎊" },
  { id: "gallery", label: "Gallery", icon: "🖼️" },
  { id: "maps", label: "Maps", icon: "📍" },
  { id: "gift", label: "Gift", icon: "🎁" },
] as const;

type TabId = typeof TABS[number]["id"];

// ── Shared Helper Components ───────────────────────────────────────────────

function FormField({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "input-pastel w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-ink text-sm transition-all duration-200";

function SaveButton({ loading, label = "Save" }: { loading: boolean; label?: string }) {
  return (
    <div className="flex justify-end pt-2">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={loading}
        id="asset-save-btn"
        className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 cursor-pointer"
        style={{ background: "linear-gradient(135deg, #ff9fb5 0%, #c2a7ff 100%)" }}
      >
        {loading ? "Saving…" : label}
      </motion.button>
    </div>
  );
}

function AlertBanner({ type, message }: { type: "success" | "error" | null; message: string }) {
  if (!type) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
        type === "success" ? "bg-mint-100 text-mint-500 border border-mint-200" : "bg-red-50 text-red-500 border border-red-100"
      }`}
    >
      {type === "success" ? "✅" : "⚠️"} {message}
    </motion.div>
  );
}

function SectionSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-12 bg-cream-200 rounded-xl" />
      ))}
    </div>
  );
}

// ── Image Upload Helper ────────────────────────────────────────────────────

function ImageUploadField({
  label,
  currentId,
  onUpload,
  token,
}: {
  label: string;
  currentId?: number;
  onUpload: (id: number) => void;
  token: string;
}) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadAssetsApi(token, fd);
      onUpload(res.data.id);
    } catch { /* noop */ }
    finally { setUploading(false); }
  };

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-ink-muted">{label}</p>
      <div className="flex items-center gap-3">
        <label className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-lavender-200 bg-lavender-50 cursor-pointer hover:bg-lavender-100 transition-colors">
          <span className="text-lavender-400">📎</span>
          <span className="text-sm text-ink-muted">{uploading ? "Uploading…" : "Click to upload image"}</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
        {currentId && (
          <div className="px-3 py-1.5 bg-cream-200 rounded-lg text-xs font-medium text-slate-soft">
            ID: {currentId}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tab Panels ─────────────────────────────────────────────────────────────

/** Opening Tab */
function OpeningTab({ token }: { token: string }) {
  const [data, setData] = useState<AssetOpening | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });

  useEffect(() => {
    getAssetOpeningApi(token, ID_UNDANGAN)
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setSaving(true);
    try {
      await updateAssetOpeningApi(token, data);
      setAlert({ type: "success", message: "Opening saved successfully!" });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setAlert({ type: "error", message: e?.message ?? "Failed to save." });
    } finally { setSaving(false); }
  };

  if (loading) return <SectionSkeleton />;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AlertBanner {...alert} />
      <FormField label="Nama Mempelai (Cover)" id="opening-nama">
        <input
          id="opening-nama"
          type="text"
          className={inputClass}
          value={data?.nama_mempelai ?? ""}
          onChange={(e) => setData((d) => d ? { ...d, nama_mempelai: e.target.value } : d)}
          placeholder="Romeo & Juliet"
        />
      </FormField>
      <ImageUploadField
        label="Foto Cover"
        currentId={data?.foto_cover}
        token={token}
        onUpload={(id) => setData((d) => d ? { ...d, foto_cover: id } : d)}
      />
      <SaveButton loading={saving} />
    </form>
  );
}

/** Mempelai Tab */
function MempelaiTab({ token }: { token: string }) {
  const [data, setData] = useState<AssetMempelai | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });

  useEffect(() => {
    getAssetMempelaiApi(token, ID_UNDANGAN).then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  const update = <K extends keyof AssetMempelai>(field: K, value: AssetMempelai[K]) =>
    setData((d) => d ? { ...d, [field]: value } : d);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setSaving(true);
    try {
      await updateAssetMempelaiApi(token, data);
      setAlert({ type: "success", message: "Mempelai saved!" });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setAlert({ type: "error", message: e?.message ?? "Failed." });
    } finally { setSaving(false); }
  };

  if (loading) return <SectionSkeleton />;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AlertBanner {...alert} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Nama Mempelai Pria" id="pria-nama">
          <input id="pria-nama" type="text" className={inputClass} placeholder="Romeo"
            value={data?.nama_mempelai_pria ?? ""} onChange={(e) => update("nama_mempelai_pria", e.target.value)} />
        </FormField>
        <FormField label="Nama Mempelai Wanita" id="wanita-nama">
          <input id="wanita-nama" type="text" className={inputClass} placeholder="Juliet"
            value={data?.nama_mempelai_wanita ?? ""} onChange={(e) => update("nama_mempelai_wanita", e.target.value)} />
        </FormField>
        <FormField label="Keluarga Mempelai Pria" id="pria-keluarga">
          <input id="pria-keluarga" type="text" className={inputClass} placeholder="Bapak & Ibu Montague"
            value={data?.keluarga_mempelai_pria ?? ""} onChange={(e) => update("keluarga_mempelai_pria", e.target.value)} />
        </FormField>
        <FormField label="Keluarga Mempelai Wanita" id="wanita-keluarga">
          <input id="wanita-keluarga" type="text" className={inputClass} placeholder="Bapak & Ibu Capulet"
            value={data?.keluarga_mempelai_wanita ?? ""} onChange={(e) => update("keluarga_mempelai_wanita", e.target.value)} />
        </FormField>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <ImageUploadField label="Foto Mempelai Pria" currentId={data?.foto_mempelai_pria} token={token}
          onUpload={(id) => update("foto_mempelai_pria", id)} />
        <ImageUploadField label="Foto Mempelai Wanita" currentId={data?.foto_mempelai_wanita} token={token}
          onUpload={(id) => update("foto_mempelai_wanita", id)} />
      </div>
      <SaveButton loading={saving} />
    </form>
  );
}

/** Akad Tab */
function AkadTab({ token }: { token: string }) {
  const [data, setData] = useState<AssetAkad | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });

  useEffect(() => {
    getAssetAkadApi(token, ID_UNDANGAN).then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  const update = <K extends keyof AssetAkad>(field: K, value: AssetAkad[K]) =>
    setData((d) => d ? { ...d, [field]: value } : d);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setSaving(true);
    try {
      await updateAssetAkadApi(token, data);
      setAlert({ type: "success", message: "Akad saved!" });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setAlert({ type: "error", message: e?.message ?? "Failed." });
    } finally { setSaving(false); }
  };

  if (loading) return <SectionSkeleton />;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AlertBanner {...alert} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Title" id="akad-title">
          <input id="akad-title" type="text" className={inputClass} placeholder="Akad Nikah"
            value={data?.title ?? ""} onChange={(e) => update("title", e.target.value)} />
        </FormField>
        <FormField label="Hari" id="akad-hari">
          <input id="akad-hari" type="text" className={inputClass} placeholder="Minggu"
            value={data?.hari ?? ""} onChange={(e) => update("hari", e.target.value)} />
        </FormField>
        <FormField label="Tanggal" id="akad-tanggal">
          <input id="akad-tanggal" type="number" className={inputClass} placeholder="12"
            value={data?.tanggal ?? ""} onChange={(e) => update("tanggal", Number(e.target.value))} />
        </FormField>
        <FormField label="Bulan" id="akad-bulan">
          <input id="akad-bulan" type="text" className={inputClass} placeholder="Desember"
            value={data?.bulan ?? ""} onChange={(e) => update("bulan", e.target.value)} />
        </FormField>
        <FormField label="Tahun" id="akad-tahun">
          <input id="akad-tahun" type="number" className={inputClass} placeholder="2026"
            value={data?.tahun ?? ""} onChange={(e) => update("tahun", Number(e.target.value))} />
        </FormField>
      </div>
      <FormField label="Keterangan (Waktu)" id="akad-ket">
        <input id="akad-ket" type="text" className={inputClass} placeholder="Pukul 08:00 - 10:00 WIB"
          value={data?.keterangan ?? ""} onChange={(e) => update("keterangan", e.target.value)} />
      </FormField>
      <FormField label="Alamat" id="akad-alamat">
        <textarea id="akad-alamat" rows={2} className={`${inputClass} resize-none`} placeholder="Masjid…"
          value={data?.alamat ?? ""} onChange={(e) => update("alamat", e.target.value)} />
      </FormField>
      <ImageUploadField label="Foto Akad" currentId={data?.foto_akad} token={token}
        onUpload={(id) => update("foto_akad", id)} />
      <SaveButton loading={saving} />
    </form>
  );
}

/** Resepsi Tab */
function ResepsiTab({ token }: { token: string }) {
  const [data, setData] = useState<AssetResepsi | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });

  useEffect(() => {
    getAssetResepsiApi(token, ID_UNDANGAN).then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  const update = <K extends keyof AssetResepsi>(field: K, value: AssetResepsi[K]) =>
    setData((d) => d ? { ...d, [field]: value } : d);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setSaving(true);
    try {
      await updateAssetResepsiApi(token, data);
      setAlert({ type: "success", message: "Resepsi saved!" });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setAlert({ type: "error", message: e?.message ?? "Failed." });
    } finally { setSaving(false); }
  };

  if (loading) return <SectionSkeleton />;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AlertBanner {...alert} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Title" id="resepsi-title">
          <input id="resepsi-title" type="text" className={inputClass} placeholder="Resepsi Pernikahan"
            value={data?.title ?? ""} onChange={(e) => update("title", e.target.value)} />
        </FormField>
        <FormField label="Hari" id="resepsi-hari">
          <input id="resepsi-hari" type="text" className={inputClass} placeholder="Minggu"
            value={data?.hari ?? ""} onChange={(e) => update("hari", e.target.value)} />
        </FormField>
        <FormField label="Tanggal" id="resepsi-tanggal">
          <input id="resepsi-tanggal" type="number" className={inputClass} placeholder="12"
            value={data?.tanggal ?? ""} onChange={(e) => update("tanggal", Number(e.target.value))} />
        </FormField>
        <FormField label="Bulan" id="resepsi-bulan">
          <input id="resepsi-bulan" type="text" className={inputClass} placeholder="Desember"
            value={data?.bulan ?? ""} onChange={(e) => update("bulan", e.target.value)} />
        </FormField>
        <FormField label="Tahun" id="resepsi-tahun">
          <input id="resepsi-tahun" type="number" className={inputClass} placeholder="2026"
            value={data?.tahun ?? ""} onChange={(e) => update("tahun", Number(e.target.value))} />
        </FormField>
      </div>
      <FormField label="Keterangan" id="resepsi-ket">
        <input id="resepsi-ket" type="text" className={inputClass} placeholder="Pukul 11:00 - Selesai"
          value={data?.keterangan ?? ""} onChange={(e) => update("keterangan", e.target.value)} />
      </FormField>
      <FormField label="Alamat" id="resepsi-alamat">
        <textarea id="resepsi-alamat" rows={2} className={`${inputClass} resize-none`} placeholder="Gedung…"
          value={data?.alamat ?? ""} onChange={(e) => update("alamat", e.target.value)} />
      </FormField>
      <ImageUploadField label="Foto Resepsi" currentId={data?.foto_resepsi} token={token}
        onUpload={(id) => update("foto_resepsi", id)} />
      <SaveButton loading={saving} />
    </form>
  );
}

/** Gallery Tab */
function GalleryTab({ token }: { token: string }) {
  const [data, setData] = useState<AssetGallery | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });

  useEffect(() => {
    getAssetGalleryApi(token, ID_UNDANGAN).then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  const update = <K extends keyof AssetGallery>(field: K, value: AssetGallery[K]) =>
    setData((d) => d ? { ...d, [field]: value } : d);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setSaving(true);
    try {
      await updateAssetGalleryApi(token, data);
      setAlert({ type: "success", message: "Gallery saved!" });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setAlert({ type: "error", message: e?.message ?? "Failed." });
    } finally { setSaving(false); }
  };

  if (loading) return <SectionSkeleton />;

  const fotoKeys: (keyof AssetGallery)[] = ["foto1","foto2","foto3","foto4","foto5","foto6"];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AlertBanner {...alert} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {fotoKeys.map((key, i) => (
          <ImageUploadField
            key={key}
            label={`Photo ${i + 1}`}
            currentId={data?.[key] as number | undefined}
            token={token}
            onUpload={(id) => update(key, id)}
          />
        ))}
      </div>
      <SaveButton loading={saving} />
    </form>
  );
}

/** Maps Tab */
function MapsTab({ token }: { token: string }) {
  const [data, setData] = useState<AssetMaps | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });

  useEffect(() => {
    getAssetMapsApi(token, ID_UNDANGAN).then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  const update = <K extends keyof AssetMaps>(field: K, value: AssetMaps[K]) =>
    setData((d) => d ? { ...d, [field]: value } : d);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setSaving(true);
    try {
      await updateAssetMapsApi(token, data);
      setAlert({ type: "success", message: "Maps saved!" });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setAlert({ type: "error", message: e?.message ?? "Failed." });
    } finally { setSaving(false); }
  };

  if (loading) return <SectionSkeleton />;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AlertBanner {...alert} />
      <FormField label="Title / Nama Lokasi" id="maps-title">
        <input id="maps-title" type="text" className={inputClass} placeholder="Gedung Serbaguna…"
          value={data?.title ?? ""} onChange={(e) => update("title", e.target.value)} />
      </FormField>
      <div className="grid grid-cols-2 gap-5">
        <FormField label="Latitude" id="maps-lat">
          <input id="maps-lat" type="text" className={inputClass} placeholder="-6.200000"
            value={data?.lat ?? ""} onChange={(e) => update("lat", e.target.value)} />
        </FormField>
        <FormField label="Longitude" id="maps-lang">
          <input id="maps-lang" type="text" className={inputClass} placeholder="106.816666"
            value={data?.lang ?? ""} onChange={(e) => update("lang", e.target.value)} />
        </FormField>
      </div>
      {/* Map preview */}
      {data?.lat && data?.lang && (
        <div className="rounded-2xl overflow-hidden border border-cream-200 h-48">
          <iframe
            src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GMAPS_KEY&q=${data.lat},${data.lang}`}
            className="w-full h-full"
            loading="lazy"
            title="location-map"
          />
        </div>
      )}
      <SaveButton loading={saving} />
    </form>
  );
}

/** Gift Tab */
function GiftTab({ token }: { token: string }) {
  const [data, setData] = useState<AssetGift | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });

  useEffect(() => {
    getAssetGiftApi(token, ID_UNDANGAN).then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  const update = <K extends keyof AssetGift>(field: K, value: AssetGift[K]) =>
    setData((d) => d ? { ...d, [field]: value } : d);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setSaving(true);
    try {
      await updateAssetGiftApi(token, { id_undangan: ID_UNDANGAN, ...data });
      setAlert({ type: "success", message: "Gift saved!" });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setAlert({ type: "error", message: e?.message ?? "Failed." });
    } finally { setSaving(false); }
  };

  if (loading) return <SectionSkeleton />;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AlertBanner {...alert} />
      <FormField label="GoPay / Dana Number" id="gift-gopay">
        <input id="gift-gopay" type="text" className={inputClass} placeholder="0812345678"
          value={data?.gopay ?? ""} onChange={(e) => update("gopay", e.target.value)} />
      </FormField>
      <FormField label="Bank Name" id="gift-bank">
        <input id="gift-bank" type="text" className={inputClass} placeholder="BCA / Mandiri…"
          value={data?.bank ?? ""} onChange={(e) => update("bank", e.target.value)} />
      </FormField>
      <FormField label="Account Number" id="gift-no-rek">
        <input id="gift-no-rek" type="text" className={inputClass} placeholder="1234567890"
          value={data?.no_rek ?? ""} onChange={(e) => update("no_rek", e.target.value)} />
      </FormField>
      <FormField label="Account Name" id="gift-nama-rek">
        <input id="gift-nama-rek" type="text" className={inputClass} placeholder="Romeo Montague"
          value={data?.nama_rek ?? ""} onChange={(e) => update("nama_rek", e.target.value)} />
      </FormField>
      <SaveButton loading={saving} />
    </form>
  );
}

// ── Tab Content Map ────────────────────────────────────────────────────────

function TabContent({ id, token }: { id: TabId; token: string }) {
  switch (id) {
    case "opening": return <OpeningTab token={token} />;
    case "mempelai": return <MempelaiTab token={token} />;
    case "akad": return <AkadTab token={token} />;
    case "resepsi": return <ResepsiTab token={token} />;
    case "gallery": return <GalleryTab token={token} />;
    case "maps": return <MapsTab token={token} />;
    case "gift": return <GiftTab token={token} />;
  }
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function AssetsPage() {
  const { token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabId>("opening");

  if (!token) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{ background: "linear-gradient(135deg, #b3e3ff 0%, #9af5db 100%)" }}
        >
          🎨
        </div>
        <div>
          <h1 className="text-xl font-bold text-ink">Undangan Assets</h1>
          <p className="text-sm text-slate-soft">Configure each section of your digital invitation</p>
        </div>
      </motion.div>

      {/* Tabs navigation */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer flex-shrink-0 ${
              activeTab === tab.id
                ? "tab-active shadow-card"
                : "bg-white text-slate-soft hover:bg-cream-200 hover:text-ink shadow-card"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Tab content card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-card"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25 }}
          >
            <TabContent id={activeTab} token={token} />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

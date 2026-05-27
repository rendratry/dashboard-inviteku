"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Edit2, AlertTriangle, Loader2, X, RefreshCw, CheckCircle2,
  Trash2, RotateCcw
} from "lucide-react";
import { useAdminStore } from "@/lib/store";
import {
  adminGetAllUndanganApi, adminUpdateUndanganApi,
  adminSoftDeleteUndanganApi, adminRestoreUndanganApi,
  getTemplatePricesApi,
  type AdminUndangan, type TemplatePrice,
} from "@/lib/api";

function AdminEditModal({
  undangan, adminToken, templates, onClose, onDone,
}: {
  undangan: AdminUndangan; adminToken: string; templates: TemplatePrice[];
  onClose: () => void; onDone: () => void;
}) {
  const [nama, setNama] = useState(undangan.nama ?? "");
  const [template, setTemplate] = useState(undangan.template ?? "");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErr(null);
    try {
      await adminUpdateUndanganApi(adminToken, {
        id_undangan: undangan.id, nama, template, note,
      });
      onDone();
    } catch (e: unknown) {
      setErr((e as { message?: string })?.message ?? "Gagal menyimpan.");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-float w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-ink flex items-center gap-2">
            <Edit2 size={16} className="text-lavender-400" />Edit Undangan (Admin)
          </h2>
          <button onClick={onClose} className="text-slate-soft hover:text-red-400 transition-colors"><X size={18} /></button>
        </div>
        <p className="text-xs text-slate-soft bg-peach-50 border border-peach-200 rounded-lg px-3 py-2">
          Override admin — perubahan ini akan diterapkan langsung ke undangan user.
        </p>
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
                {templates.map(t => <option key={t.id} value={t.template}>{t.name_template}</option>)}
              </select>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink-muted">Catatan Admin</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} required
              placeholder="Misal: Perbaikan typo nama"
              className="input-pastel w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-ink text-sm resize-none" />
          </div>
          {err && <p className="text-red-500 text-xs flex items-center gap-1"><AlertTriangle size={12} />{err}</p>}
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm text-slate-soft hover:bg-cream-200 transition-colors">Batal</button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #d9c8ff 0%, #80cfff 100%)" }}>
              {saving ? <><Loader2 size={13} className="animate-spin" />Menyimpan…</> : "Simpan Override"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function ConfirmModal({
  isOpen, title, description, onConfirm, onCancel, confirmText, confirmStyle = "danger", loading
}: {
  isOpen: boolean; title: string; description: string; onConfirm: () => void; onCancel: () => void;
  confirmText: string; confirmStyle?: "danger" | "success"; loading?: boolean;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-ink/30 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-float w-full max-w-sm p-6 text-center space-y-4">
        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${confirmStyle === "danger" ? "bg-red-100 text-red-500" : "bg-mint-100 text-mint-500"}`}>
          <AlertTriangle size={24} />
        </div>
        <div>
          <h3 className="font-bold text-ink text-lg">{title}</h3>
          <p className="text-sm text-slate-soft mt-1">{description}</p>
        </div>
        <div className="flex gap-3 justify-center pt-2">
          <button type="button" onClick={onCancel} disabled={loading}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-soft hover:bg-cream-100 transition-colors">Batal</button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onConfirm} disabled={loading}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-opacity ${confirmStyle === "danger" ? "bg-red-500" : "bg-mint-500"} disabled:opacity-60`}>
            {loading ? <><Loader2 size={13} className="animate-spin" />Memproses…</> : confirmText}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

function UndanganTable({
  undanganList, adminToken, templates, onRefresh,
}: {
  undanganList: AdminUndangan[];
  adminToken: string; templates: TemplatePrice[]; onRefresh: () => void;
}) {
  const [editTarget, setEditTarget] = useState<AdminUndangan | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<{ id: number; action: "delete" | "restore" } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  if (undanganList.length === 0) {
    return (
      <div className="text-center py-14 bg-white rounded-2xl shadow-card">
        <Mail size={28} className="text-lavender-400 mx-auto mb-3" />
        <p className="font-semibold text-ink">Tidak ada data</p>
        <p className="text-sm text-slate-soft mt-1">Belum ada undangan yang dibuat.</p>
      </div>
    );
  }

  const handleDone = () => { setEditTarget(null); onRefresh(); };

  const confirmAction = async () => {
    if (!confirmTarget) return;
    setActionLoading(true);
    try {
      if (confirmTarget.action === "delete") {
        await adminSoftDeleteUndanganApi(adminToken, confirmTarget.id);
      } else {
        await adminRestoreUndanganApi(adminToken, confirmTarget.id);
      }
      setConfirmTarget(null);
      onRefresh();
    } catch (e: any) {
      alert(e.message || "Gagal memproses undangan");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-200 bg-cream-50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-soft uppercase tracking-wider">ID</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-soft uppercase tracking-wider">Undangan</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-soft uppercase tracking-wider">Key (URL)</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-soft uppercase tracking-wider">Template</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-soft uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-soft uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {undanganList.map((u, i) => (
                <motion.tr key={u.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-cream-100 table-row-hover">
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs text-lavender-500 font-semibold">#{u.id}</span>
                    {u.is_deleted && (
                      <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-red-100 text-red-500 border border-red-200">
                        TERHAPUS
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-ink">{u.nama ?? "—"}</p>
                    <p className="text-xs text-slate-soft">User ID: {u.id_user ?? "—"}</p>
                  </td>
                  <td className="px-5 py-4">
                    {u.key_undangan ? (
                      <span className="font-mono text-xs text-slate-soft bg-cream-100 px-2 py-1 rounded">
                        {u.key_undangan}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs bg-cream-100 px-2 py-0.5 rounded-lg text-slate-soft font-mono">
                      {u.template ?? "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {u.is_published ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-mint-100 text-mint-500 border border-mint-200">
                        <CheckCircle2 size={10} />Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-cream-200 text-slate-soft border border-cream-300">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setEditTarget(u)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-cream-300 text-ink-muted hover:bg-cream-100 transition-all">
                        <Edit2 size={11} />Edit
                      </motion.button>
                      
                      {u.is_deleted ? (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => setConfirmTarget({ id: u.id, action: "restore" })}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-mint-200 text-mint-600 bg-mint-50 hover:bg-mint-100 transition-all">
                          <RotateCcw size={11} />Pulihkan
                        </motion.button>
                      ) : (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => setConfirmTarget({ id: u.id, action: "delete" })}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-500 bg-red-50 hover:bg-red-100 transition-all">
                          <Trash2 size={11} />Hapus
                        </motion.button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {editTarget && (
          <AdminEditModal undangan={editTarget} adminToken={adminToken} templates={templates}
            onClose={() => setEditTarget(null)} onDone={handleDone} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmTarget && (
          <ConfirmModal
            isOpen={true}
            title={confirmTarget.action === "delete" ? "Hapus Undangan?" : "Pulihkan Undangan?"}
            description={
              confirmTarget.action === "delete"
                ? "Data akan disembunyikan dan undangan ini tidak dapat diakses publik. Anda masih bisa memulihkannya kembali nanti."
                : "Undangan akan dipulihkan dan dapat diakses kembali oleh pengguna dan publik."
            }
            confirmText={confirmTarget.action === "delete" ? "Hapus" : "Pulihkan"}
            confirmStyle={confirmTarget.action === "delete" ? "danger" : "success"}
            onCancel={() => setConfirmTarget(null)}
            onConfirm={confirmAction}
            loading={actionLoading}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default function AdminUndanganPage() {
  const { adminToken } = useAdminStore();
  const [undanganList, setUndanganList] = useState<AdminUndangan[]>([]);
  const [templates, setTemplates] = useState<TemplatePrice[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!adminToken) return;
    setLoading(true); setError(null);
    try {
      const [undRes, tplRes] = await Promise.all([
        adminGetAllUndanganApi(adminToken),
        getTemplatePricesApi(),
      ]);
      setUndanganList(Array.isArray(undRes.data) ? undRes.data : []);
      setTemplates(Array.isArray(tplRes.data) ? tplRes.data : []);
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? "Gagal memuat data undangan.");
    } finally { setLoading(false); }
  }, [adminToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
            style={{ background: "linear-gradient(135deg, #d9c8ff 0%, #80cfff 100%)" }}>
            <Mail size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink">Manajemen Undangan</h1>
            <p className="text-sm text-slate-soft">Kelola semua undangan yang dibuat oleh user</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-xl shadow-sm border border-cream-200">
            <div className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors ${showDeleted ? 'bg-lavender-400' : 'bg-slate-soft/30'}`}>
              <motion.div layout className="w-3.5 h-3.5 bg-white rounded-full shadow-sm" style={{ x: showDeleted ? 20 : 0 }} />
            </div>
            <span className="text-sm font-medium text-ink-muted">Tampilkan Terhapus</span>
            <input type="checkbox" className="hidden" checked={showDeleted} onChange={(e) => setShowDeleted(e.target.checked)} />
          </label>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={fetchData} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-cream-300 bg-white text-ink-muted hover:bg-cream-100 transition-all disabled:opacity-50">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />Refresh
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Undangan", value: undanganList.length, color: "#8b5cf6" },
          { label: "Published", value: undanganList.filter(u => u.is_published).length, color: "#14b894" },
          { label: "Draft", value: undanganList.filter(u => !u.is_published).length, color: "#ffb06a" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl p-4 shadow-card flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: s.color + "22", color: s.color }}>
              <Mail size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-soft uppercase tracking-wider">{s.label}</p>
              <p className="text-xl font-bold text-ink">{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-lavender-400" />
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-card">
          <AlertTriangle size={24} className="text-red-400 mx-auto mb-2" />
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={fetchData} className="text-lavender-500 text-sm underline mt-2">Coba lagi</button>
        </div>
      ) : (
        <UndanganTable
          undanganList={undanganList.filter(u => showDeleted ? u.is_deleted : !u.is_deleted)}
          adminToken={adminToken!}
          templates={templates}
          onRefresh={fetchData}
        />
      )}
    </div>
  );
}

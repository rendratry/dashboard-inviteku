"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Plus, Pencil, Trash2, X, AlertTriangle,
  PartyPopper, ChevronDown, Mail, Loader2, Phone, Send,
  MessageCircle, Copy, Check,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import {
  getTamuApi, addTamuApi, updateTamuApi, deleteTamuApi,
  getUndanganApi,
  type Tamu, type Undangan,
} from "@/lib/api";

// ── WhatsApp Invitation Popup ──────────────────────────────────────────────

function buildInvitationLink(keyUndangan: string, keyTamu: string) {
  return `https://inviteku.com/${keyUndangan}?to=${keyTamu}`;
}

function buildDefaultMessage(namaUndangan: string, namaTamu: string, link: string) {
  return `Assalamualaikum Wr. Wb. / Salam sejahtera,

Kepada Yth.
Bapak/Ibu/Saudara/i
*${namaTamu}*

Dengan penuh rasa syukur dan kebahagiaan, kami mengundang Anda untuk hadir dan merayakan momen sakral pernikahan kami.

🌸 *${namaUndangan}* 🌸

Untuk detail lengkap acara, silakan buka undangan digital kami melalui tautan berikut:
👉 ${link}

Merupakan suatu kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.

Atas kehadiran dan doa restunya, kami ucapkan terima kasih. 🙏

Hormat kami,
Keluarga Besar Mempelai`;
}

function WhatsAppModal({
  open, onClose, tamu, undangan,
}: {
  open: boolean;
  onClose: () => void;
  tamu: Tamu | null;
  undangan: Undangan | null;
}) {
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const link = tamu && undangan?.key_undangan && tamu.key
    ? buildInvitationLink(undangan.key_undangan, tamu.key)
    : null;

  // Reset message when tamu/undangan changes
  useEffect(() => {
    if (!tamu || !undangan) return;
    const invLink = link ?? "https://inviteku.com/(link undangan)";
    setMessage(buildDefaultMessage(undangan.nama, tamu.nama, invLink));
  }, [tamu, undangan, link]);

  const handleSendWA = () => {
    if (!tamu?.no_wa) return;
    const phone = tamu.no_wa.replace(/\D/g, "").replace(/^0/, "62");
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encoded}`, "_blank");
  };

  const handleCopyLink = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {open && tamu && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-40" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.92, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <div className="bg-white rounded-3xl shadow-float w-full max-w-lg pointer-events-auto flex flex-col max-h-[90vh]">

              {/* Header */}
              <div className="flex items-center gap-3 p-6 border-b border-cream-200 flex-shrink-0">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}>
                  <MessageCircle size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-ink">Kirim Undangan via WhatsApp</h3>
                  <p className="text-xs text-slate-soft truncate">
                    Kepada: <span className="font-medium text-ink">{tamu.nama}</span>
                    {tamu.no_wa && <> · {tamu.no_wa}</>}
                  </p>
                </div>
                <button onClick={onClose} id="wa-modal-close"
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-cream-200 text-slate-soft cursor-pointer flex-shrink-0">
                  <X size={16} />
                </button>
              </div>

              {/* Link box */}
              {link && (
                <div className="mx-6 mt-5 flex items-center gap-2 px-4 py-3 bg-lavender-50 rounded-xl border border-lavender-100">
                  <p className="text-xs font-mono text-lavender-600 flex-1 truncate">{link}</p>
                  <button id="copy-link-btn" onClick={handleCopyLink}
                    className="flex items-center gap-1 text-xs font-semibold text-lavender-500 hover:text-lavender-700 transition-colors cursor-pointer flex-shrink-0">
                    {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                  </button>
                </div>
              )}

              {!link && (
                <div className="mx-6 mt-5 flex items-center gap-2 px-4 py-3 bg-amber-50 rounded-xl border border-amber-100">
                  <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
                  <p className="text-xs text-amber-600">
                    {!tamu.key ? "Tamu ini belum memiliki key undangan." : "Undangan belum memiliki key_undangan."}
                  </p>
                </div>
              )}

              {/* Message editor */}
              <div className="flex-1 overflow-y-auto px-6 pt-4 pb-2">
                <label htmlFor="wa-message" className="block text-sm font-medium text-ink-muted mb-2">
                  Pesan Undangan
                  <span className="ml-2 text-xs text-slate-soft font-normal">(dapat diedit)</span>
                </label>
                <textarea
                  id="wa-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={12}
                  className="input-pastel w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-ink text-sm resize-none leading-relaxed"
                />
                <p className="text-xs text-slate-soft mt-1.5">{message.length} karakter</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 p-6 border-t border-cream-200 flex-shrink-0">
                <button onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-cream-300 text-ink-muted hover:bg-cream-100 transition-colors cursor-pointer">
                  Tutup
                </button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  id="send-wa-btn"
                  onClick={handleSendWA}
                  disabled={!tamu.no_wa}
                  title={!tamu.no_wa ? "Nomor WhatsApp belum diisi" : undefined}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}>
                  <Send size={15} />
                  {tamu.no_wa ? "Kirim via WhatsApp" : "No. WA belum ada"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Undangan Dropdown ──────────────────────────────────────────────────────

function UndanganSelector({ list, loading, selected, onSelect }: {
  list: Undangan[]; loading: boolean;
  selected: Undangan | null; onSelect: (u: Undangan) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button id="undangan-selector" type="button" onClick={() => setOpen((v) => !v)} disabled={loading}
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
                    <button key={u.id} id={`select-undangan-${u.id}`} type="button"
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

// ── Modal Shell ────────────────────────────────────────────────────────────

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-40" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <div className="bg-white rounded-3xl shadow-float w-full max-w-md pointer-events-auto">
              <div className="flex items-center justify-between p-6 border-b border-cream-200">
                <h3 className="font-semibold text-ink">{title}</h3>
                <button onClick={onClose} id="modal-close"
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-cream-200 text-slate-soft cursor-pointer">
                  <X size={16} />
                </button>
              </div>
              <div className="p-6">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ConfirmModal({ open, onClose, onConfirm, loading, nama }: { open: boolean; onClose: () => void; onConfirm: () => void; loading: boolean; nama: string }) {
  return (
    <Modal open={open} onClose={onClose} title="Hapus Tamu">
      <div className="space-y-4">
        <p className="text-sm text-ink-muted">
          Hapus tamu <span className="font-semibold text-ink">{nama}</span>? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex gap-3 justify-end">
          <button id="cancel-delete" onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-cream-300 text-ink-muted hover:bg-cream-100 cursor-pointer">
            Batal
          </button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            id="confirm-delete" onClick={onConfirm} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-400 hover:bg-red-500 disabled:opacity-60 cursor-pointer">
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? "Menghapus…" : "Hapus"}
          </motion.button>
        </div>
      </div>
    </Modal>
  );
}

// ── Key Generation ─────────────────────────────────────────────────────────

/** Slugify a name: lowercase, strip non-alphanumeric, replace spaces with dash */
function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")      // strip diacritics
    .replace(/[^a-z0-9\s-]/g, "")          // strip special chars
    .trim()
    .replace(/\s+/g, "-");                 // spaces → dashes
}

/**
 * Generate a unique key from `name` that doesn't clash with `existingKeys`.
 * If "budi-santoso" exists, tries "budi-santoso-2", "budi-santoso-3", …
 */
function generateUniqueKey(name: string, existingKeys: string[]): string {
  const base = slugify(name);
  if (!existingKeys.includes(base)) return base;
  let counter = 2;
  while (existingKeys.includes(`${base}-${counter}`)) counter++;
  return `${base}-${counter}`;
}

// ── Guest Form ─────────────────────────────────────────────────────────────

type GuestFormData = { key: string; nama: string; alamat: string; no_wa: string };

function GuestForm({ initial, onSubmit, loading, existingKeys = [] }: {
  initial?: Partial<Tamu>;
  onSubmit: (data: GuestFormData) => void;
  loading: boolean;
  existingKeys?: string[];
}) {
  const isEdit = !!initial?.id;
  const [nama, setNama] = useState(initial?.nama ?? "");
  const [key, setKey] = useState(initial?.key ?? "");
  const [alamat, setAlamat] = useState(initial?.alamat ?? "");
  const [noWa, setNoWa] = useState(initial?.no_wa ?? "");
  const [keyManuallyEdited, setKeyManuallyEdited] = useState(isEdit);

  // Auto-generate key from name when not manually edited (add mode only)
  const handleNamaChange = (value: string) => {
    setNama(value);
    if (!keyManuallyEdited && !isEdit) {
      // Exclude current key from conflict check while typing (will be resolved on submit)
      setKey(slugify(value));
    }
  };

  const handleKeyChange = (value: string) => {
    setKey(slugify(value) || value.toLowerCase());
    setKeyManuallyEdited(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Resolve conflict on submit for add mode
    const finalKey = isEdit ? key : generateUniqueKey(nama, existingKeys.filter((k) => k !== initial?.key));
    onSubmit({ key: finalKey, nama, alamat, no_wa: noWa });
  };

  // Warn if key already exists
  const keyConflict = !isEdit && key && existingKeys.includes(key);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="guest-nama" className="block text-sm font-medium text-ink-muted mb-1.5">Nama Tamu</label>
        <input id="guest-nama" type="text" required value={nama} onChange={(e) => handleNamaChange(e.target.value)}
          placeholder="e.g. Budi Santoso"
          className="input-pastel w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-ink text-sm" />
      </div>

      {/* Key field */}
      <div>
        <label htmlFor="guest-key" className="block text-sm font-medium text-ink-muted mb-1.5">
          Kode Tamu (Key)
          {!isEdit && <span className="ml-2 text-xs text-slate-soft font-normal">· otomatis dari nama</span>}
        </label>
        <div className="relative">
          <input id="guest-key" type="text" required value={key}
            onChange={(e) => handleKeyChange(e.target.value)}
            placeholder="budi-santoso"
            className={`input-pastel w-full px-4 py-3 rounded-xl border text-ink text-sm font-mono ${
              keyConflict
                ? "border-amber-300 bg-amber-50"
                : "border-cream-300 bg-cream-50"
            }`} />
        </div>
        {keyConflict ? (
          <p className="text-xs text-amber-500 mt-1">
            Kode ini sudah ada — akan otomatis ditambah suffix saat disimpan (misal: <span className="font-mono">{key}-2</span>)
          </p>
        ) : (
          <p className="text-xs text-slate-soft mt-1">Digunakan sebagai parameter link undangan tamu</p>
        )}
      </div>

      <div>
        <label htmlFor="guest-wa" className="block text-sm font-medium text-ink-muted mb-1.5">
          Nomor WhatsApp
          <span className="ml-2 text-xs text-slate-soft font-normal">(opsional)</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-soft/60">
            <Phone size={15} />
          </span>
          <input id="guest-wa" type="tel" value={noWa} onChange={(e) => setNoWa(e.target.value)}
            placeholder="08123456789"
            className="input-pastel w-full pl-10 pr-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-ink text-sm" />
        </div>
        <p className="text-xs text-slate-soft mt-1">Format: 08xxx atau +62xxx</p>
      </div>

      <div>
        <label htmlFor="guest-alamat" className="block text-sm font-medium text-ink-muted mb-1.5">Alamat</label>
        <textarea id="guest-alamat" required rows={3} value={alamat} onChange={(e) => setAlamat(e.target.value)}
          placeholder="Alamat tamu..."
          className="input-pastel w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-ink text-sm resize-none" />
      </div>

      <div className="flex justify-end">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          id="guest-form-submit" type="submit" disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 cursor-pointer"
          style={{ background: "linear-gradient(135deg, #ff9fb5 0%, #c2a7ff 100%)" }}>
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? "Menyimpan…" : isEdit ? "Update Tamu" : "Tambah Tamu"}
        </motion.button>
      </div>
    </form>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function TamuPage() {
  const { token } = useAuthStore();

  const [undanganList, setUndanganList] = useState<Undangan[]>([]);
  const [undanganLoading, setUndanganLoading] = useState(true);
  const [selectedUndangan, setSelectedUndangan] = useState<Undangan | null>(null);

  const [guests, setGuests] = useState<Tamu[]>([]);
  const [guestLoading, setGuestLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editGuest, setEditGuest] = useState<Tamu | null>(null);
  const [deleteGuest, setDeleteGuest] = useState<Tamu | null>(null);
  const [waGuest, setWaGuest] = useState<Tamu | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch undangan list
  useEffect(() => {
    if (!token) return;
    setUndanganLoading(true);
    getUndanganApi(token)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setUndanganList(list);
        if (list.length > 0) setSelectedUndangan(list[0]);
      })
      .catch(() => {})
      .finally(() => setUndanganLoading(false));
  }, [token]);

  // Fetch guests
  const fetchGuests = useCallback(async () => {
    if (!token || !selectedUndangan) return;
    setGuestLoading(true);
    setError(null);
    try {
      const res = await getTamuApi(token, selectedUndangan.id);
      setGuests(Array.isArray(res.data) ? res.data : []);
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err?.message ?? "Failed to load guests.");
    } finally { setGuestLoading(false); }
  }, [token, selectedUndangan]);

  useEffect(() => { if (selectedUndangan) fetchGuests(); }, [fetchGuests, selectedUndangan]);

  const handleAdd = async (data: GuestFormData) => {
    if (!token || !selectedUndangan) return;
    setActionLoading(true);
    try {
      await addTamuApi(token, {
        id_undangan: selectedUndangan.id,
        key: data.key,
        nama: data.nama,
        alamat: data.alamat,
        no_wa: data.no_wa,
      });
      setAddOpen(false);
      fetchGuests();
    } catch { /* noop */ } finally { setActionLoading(false); }
  };

  const handleEdit = async (data: GuestFormData) => {
    if (!token || !editGuest) return;
    setActionLoading(true);
    try {
      await updateTamuApi(token, { id: editGuest.id, nama: data.nama, alamat: data.alamat, no_wa: data.no_wa });
      setEditGuest(null);
      fetchGuests();
    } catch { /* noop */ } finally { setActionLoading(false); }
  };

  const handleDelete = async () => {
    if (!token || !deleteGuest || !selectedUndangan) return;
    setActionLoading(true);
    try {
      await deleteTamuApi(token, selectedUndangan.id, deleteGuest.id);
      setDeleteGuest(null);
      fetchGuests();
    } catch { /* noop */ } finally { setActionLoading(false); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
            style={{ background: "linear-gradient(135deg, #d9c8ff 0%, #b3e3ff 100%)" }}>
            <Users size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink">Tamu Management</h1>
            <p className="text-sm text-slate-soft">
              {selectedUndangan
                ? `${guests.length} tamu di "${selectedUndangan.nama}"`
                : "Pilih undangan untuk melihat tamu"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <UndanganSelector list={undanganList} loading={undanganLoading}
            selected={selectedUndangan}
            onSelect={(u) => { setSelectedUndangan(u); setGuests([]); }} />
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            id="add-guest-btn" onClick={() => setAddOpen(true)} disabled={!selectedUndangan}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 cursor-pointer"
            style={{ background: "linear-gradient(135deg, #ff9fb5 0%, #c2a7ff 100%)" }}>
            <Plus size={16} /> Tambah Tamu
          </motion.button>
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

      {/* Table */}
      {selectedUndangan && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-card overflow-hidden">
          {guestLoading ? (
            <div className="p-12 flex flex-col items-center gap-3">
              <Loader2 size={32} className="animate-spin text-blush-400" />
              <p className="text-sm text-slate-soft">Loading tamu…</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <AlertTriangle size={24} className="text-red-400 mx-auto mb-2" />
              <p className="text-red-400 text-sm">{error}</p>
              <button onClick={fetchGuests} className="text-blush-500 text-sm underline mt-2">Retry</button>
            </div>
          ) : guests.length === 0 ? (
            <EmptyState onAdd={() => setAddOpen(true)} undanganNama={selectedUndangan.nama} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cream-200">
                    <th className="text-left text-xs font-semibold text-slate-soft uppercase tracking-wider px-5 py-4 w-8">#</th>
                    <th className="text-left text-xs font-semibold text-slate-soft uppercase tracking-wider px-3 py-4">Nama</th>
                    <th className="text-left text-xs font-semibold text-slate-soft uppercase tracking-wider px-3 py-4 hidden md:table-cell">Alamat</th>
                    <th className="text-left text-xs font-semibold text-slate-soft uppercase tracking-wider px-3 py-4 hidden sm:table-cell">No. WA</th>
                    <th className="text-right text-xs font-semibold text-slate-soft uppercase tracking-wider px-5 py-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map((guest, i) => (
                    <motion.tr key={guest.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="table-row-hover border-b border-cream-100 last:border-0">
                      <td className="px-5 py-3.5 text-sm text-slate-soft">{i + 1}</td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                            style={{ background: `hsl(${(i * 60) % 360}, 60%, 75%)` }}>
                            {guest.nama.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-ink">{guest.nama}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-sm text-slate-soft max-w-[180px] truncate hidden md:table-cell">
                        {guest.alamat || <span className="text-slate-soft/40">—</span>}
                      </td>
                      <td className="px-3 py-3.5 hidden sm:table-cell">
                        {guest.no_wa ? (
                          <span className="text-sm text-ink-muted font-mono">{guest.no_wa}</span>
                        ) : (
                          <span className="text-xs text-slate-soft/40">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* WhatsApp */}
                          <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                            id={`wa-guest-${guest.id}`}
                            onClick={() => setWaGuest(guest)}
                            title="Kirim undangan via WhatsApp"
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-green-50 hover:text-green-500 text-slate-soft transition-colors cursor-pointer">
                            <MessageCircle size={15} />
                          </motion.button>
                          {/* Edit */}
                          <button id={`edit-guest-${guest.id}`} onClick={() => setEditGuest(guest)} title="Edit"
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-lavender-50 hover:text-lavender-500 text-slate-soft transition-colors cursor-pointer">
                            <Pencil size={15} />
                          </button>
                          {/* Delete */}
                          <button id={`delete-guest-${guest.id}`} onClick={() => setDeleteGuest(guest)} title="Hapus"
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 hover:text-red-400 text-slate-soft transition-colors cursor-pointer">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Tambah Tamu Baru">
        <GuestForm
          onSubmit={handleAdd}
          loading={actionLoading}
          existingKeys={guests.map((g) => g.key ?? "").filter(Boolean)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editGuest} onClose={() => setEditGuest(null)} title="Edit Tamu">
        {editGuest && <GuestForm initial={editGuest} onSubmit={handleEdit} loading={actionLoading} />}
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal open={!!deleteGuest} onClose={() => setDeleteGuest(null)}
        onConfirm={handleDelete} loading={actionLoading} nama={deleteGuest?.nama ?? ""} />

      {/* WhatsApp Modal */}
      <WhatsAppModal open={!!waGuest} onClose={() => setWaGuest(null)}
        tamu={waGuest} undangan={selectedUndangan} />
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────

function EmptyState({ onAdd, undanganNama }: { onAdd: () => void; undanganNama: string }) {
  return (
    <div className="p-16 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-4"
        style={{ background: "linear-gradient(135deg, #ffc2cf 0%, #d9c8ff 100%)" }}>
        <PartyPopper size={26} />
      </div>
      <p className="font-semibold text-ink mb-1">Belum ada tamu</p>
      <p className="text-sm text-slate-soft mb-1">
        Untuk undangan <span className="font-medium text-ink">{undanganNama}</span>
      </p>
      <p className="text-sm text-slate-soft mb-5">Mulai tambahkan daftar tamu undangan Anda.</p>
      <button id="empty-add-guest" onClick={onAdd}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer"
        style={{ background: "linear-gradient(135deg, #ff9fb5 0%, #c2a7ff 100%)" }}>
        <Plus size={15} /> Tambah Tamu Pertama
      </button>
    </div>
  );
}

"use client";

/**
 * Tamu (Guest) Management page — /dashboard/tamu
 * CRUD operations for wedding guests with animated modal dialogs.
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/store";
import {
  getTamuApi,
  addTamuApi,
  updateTamuApi,
  deleteTamuApi,
  type Tamu,
} from "@/lib/api";

// ── Modal Backdrop + Container ─────────────────────────────────────────────

function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
          >
            <div className="bg-white rounded-3xl shadow-float w-full max-w-md pointer-events-auto">
              <div className="flex items-center justify-between p-6 border-b border-cream-200">
                <h3 className="font-semibold text-ink">{title}</h3>
                <button
                  onClick={onClose}
                  id="modal-close"
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-cream-200 text-slate-soft hover:text-ink transition-colors cursor-pointer"
                >
                  ✕
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

// ── Confirm Delete Dialog ──────────────────────────────────────────────────

function ConfirmModal({
  open,
  onClose,
  onConfirm,
  loading,
  nama,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  nama: string;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Confirm Delete">
      <div className="space-y-4">
        <p className="text-sm text-ink-muted">
          Are you sure you want to delete guest{" "}
          <span className="font-semibold text-ink">{nama}</span>? This action cannot
          be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            id="cancel-delete"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-cream-300 text-ink-muted hover:bg-cream-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            id="confirm-delete"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-400 hover:bg-red-500 disabled:opacity-60 transition-colors cursor-pointer"
          >
            {loading ? "Deleting…" : "Delete"}
          </motion.button>
        </div>
      </div>
    </Modal>
  );
}

// ── Guest Form (Add/Edit) ──────────────────────────────────────────────────

function GuestForm({
  initial,
  onSubmit,
  loading,
  idUndangan,
}: {
  initial?: Partial<Tamu>;
  onSubmit: (data: { nama: string; alamat: string }) => void;
  loading: boolean;
  idUndangan: number;
}) {
  const [nama, setNama] = useState(initial?.nama ?? "");
  const [alamat, setAlamat] = useState(initial?.alamat ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ nama, alamat });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="guest-nama" className="block text-sm font-medium text-ink-muted mb-1.5">
          Guest Name
        </label>
        <input
          id="guest-nama"
          type="text"
          required
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="e.g. Budi Santoso"
          className="input-pastel w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-ink text-sm"
        />
      </div>
      <div>
        <label htmlFor="guest-alamat" className="block text-sm font-medium text-ink-muted mb-1.5">
          Address
        </label>
        <textarea
          id="guest-alamat"
          required
          rows={3}
          value={alamat}
          onChange={(e) => setAlamat(e.target.value)}
          placeholder="Guest address..."
          className="input-pastel w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-ink text-sm resize-none"
        />
      </div>
      <div className="text-xs text-slate-soft">
        Undangan ID: <span className="font-semibold">{idUndangan}</span>
      </div>
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          id="guest-form-submit"
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 cursor-pointer"
          style={{ background: "linear-gradient(135deg, #ff9fb5 0%, #c2a7ff 100%)" }}
        >
          {loading ? "Saving…" : initial?.id ? "Update Guest" : "Add Guest"}
        </motion.button>
      </div>
    </form>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function TamuPage() {
  const { token } = useAuthStore();
  const [guests, setGuests] = useState<Tamu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [addOpen, setAddOpen] = useState(false);
  const [editGuest, setEditGuest] = useState<Tamu | null>(null);
  const [deleteGuest, setDeleteGuest] = useState<Tamu | null>(null);

  const [actionLoading, setActionLoading] = useState(false);

  // Hard-code undangan id=1 for now; could be from user profile
  const ID_UNDANGAN = 1;

  const fetchGuests = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getTamuApi(token, ID_UNDANGAN);
      setGuests(Array.isArray(res.data) ? res.data : []);
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err?.message ?? "Failed to load guests.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  const handleAdd = async (data: { nama: string; alamat: string }) => {
    if (!token) return;
    setActionLoading(true);
    try {
      await addTamuApi(token, { id_undangan: ID_UNDANGAN, ...data });
      setAddOpen(false);
      fetchGuests();
    } catch { /* errors surfaced via toast */ }
    finally { setActionLoading(false); }
  };

  const handleEdit = async (data: { nama: string; alamat: string }) => {
    if (!token || !editGuest) return;
    setActionLoading(true);
    try {
      await updateTamuApi(token, { id: editGuest.id, nama: data.nama, alamat: data.alamat });
      setEditGuest(null);
      fetchGuests();
    } catch { /* noop */ }
    finally { setActionLoading(false); }
  };

  const handleDelete = async () => {
    if (!token || !deleteGuest) return;
    setActionLoading(true);
    try {
      await deleteTamuApi(token, deleteGuest.id, ID_UNDANGAN);
      setDeleteGuest(null);
      fetchGuests();
    } catch { /* noop */ }
    finally { setActionLoading(false); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4 flex-wrap"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ background: "linear-gradient(135deg, #d9c8ff 0%, #b3e3ff 100%)" }}
          >
            👥
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink">Tamu Management</h1>
            <p className="text-sm text-slate-soft">{guests.length} guests registered</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          id="add-guest-btn"
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer"
          style={{ background: "linear-gradient(135deg, #ff9fb5 0%, #c2a7ff 100%)" }}
        >
          <span className="text-base leading-none">＋</span>
          Add Guest
        </motion.button>
      </motion.div>

      {/* Table Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-card overflow-hidden"
      >
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={fetchGuests} className="text-blush-500 text-sm underline mt-2">Retry</button>
          </div>
        ) : guests.length === 0 ? (
          <EmptyState onAdd={() => setAddOpen(true)} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cream-200">
                  <th className="text-left text-xs font-semibold text-slate-soft uppercase tracking-wider px-5 py-4 w-8">#</th>
                  <th className="text-left text-xs font-semibold text-slate-soft uppercase tracking-wider px-3 py-4">Name</th>
                  <th className="text-left text-xs font-semibold text-slate-soft uppercase tracking-wider px-3 py-4 hidden sm:table-cell">Address</th>
                  <th className="text-right text-xs font-semibold text-slate-soft uppercase tracking-wider px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {guests.map((guest, i) => (
                  <motion.tr
                    key={guest.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="table-row-hover border-b border-cream-100 last:border-0"
                  >
                    <td className="px-5 py-4 text-sm text-slate-soft">{i + 1}</td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                          style={{ background: `hsl(${(i * 60) % 360}, 60%, 75%)` }}
                        >
                          {guest.nama.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-ink">{guest.nama}</span>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm text-slate-soft max-w-xs truncate hidden sm:table-cell">
                      {guest.alamat}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          id={`edit-guest-${guest.id}`}
                          onClick={() => setEditGuest(guest)}
                          title="Edit"
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-lavender-50 hover:text-lavender-500 text-slate-soft transition-colors cursor-pointer"
                        >
                          <EditIcon />
                        </button>
                        <button
                          id={`delete-guest-${guest.id}`}
                          onClick={() => setDeleteGuest(guest)}
                          title="Delete"
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 hover:text-red-400 text-slate-soft transition-colors cursor-pointer"
                        >
                          <TrashIcon />
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

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Guest">
        <GuestForm
          onSubmit={handleAdd}
          loading={actionLoading}
          idUndangan={ID_UNDANGAN}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editGuest} onClose={() => setEditGuest(null)} title="Edit Guest">
        {editGuest && (
          <GuestForm
            initial={editGuest}
            onSubmit={handleEdit}
            loading={actionLoading}
            idUndangan={ID_UNDANGAN}
          />
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        open={!!deleteGuest}
        onClose={() => setDeleteGuest(null)}
        onConfirm={handleDelete}
        loading={actionLoading}
        nama={deleteGuest?.nama ?? ""}
      />
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="p-16 flex flex-col items-center text-center">
      <div className="text-5xl mb-4">🎉</div>
      <p className="font-semibold text-ink mb-1">No guests yet</p>
      <p className="text-sm text-slate-soft mb-5">Start building your guest list.</p>
      <button
        id="empty-add-guest"
        onClick={onAdd}
        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer"
        style={{ background: "linear-gradient(135deg, #ff9fb5 0%, #c2a7ff 100%)" }}
      >
        Add First Guest
      </button>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center gap-3">
      <svg className="animate-spin h-8 w-8 text-blush-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p className="text-sm text-slate-soft">Loading guests…</p>
    </div>
  );
}

function EditIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

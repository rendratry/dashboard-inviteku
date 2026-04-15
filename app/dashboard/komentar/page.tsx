"use client";

/**
 * Komentar (Comments) moderation page — /dashboard/komentar
 * List, approve/hide, and delete guest wishes.
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/store";
import {
  getKomentarApi,
  updateKomentarApi,
  deleteKomentarApi,
  type Komentar,
} from "@/lib/api";

const ID_UNDANGAN = 1;

// ── Comment Card ───────────────────────────────────────────────────────────

function CommentCard({
  comment,
  index,
  onToggle,
  onDelete,
  toggling,
  deleting,
}: {
  comment: Komentar;
  index: number;
  onToggle: (c: Komentar) => void;
  onDelete: (c: Komentar) => void;
  toggling: boolean;
  deleting: boolean;
}) {
  const initials = comment.from
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Pastel avatar color based on initials
  const hue = (comment.from.charCodeAt(0) * 37) % 360;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      layout
      className={`bg-white rounded-2xl p-5 shadow-card border-l-4 transition-all duration-300 ${
        comment.status
          ? "border-mint-300"
          : "border-cream-200 opacity-70"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ background: `hsl(${hue}, 60%, 72%)` }}
        >
          {initials}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="font-semibold text-ink text-sm">{comment.from}</p>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                comment.status ? "badge-active" : "badge-inactive"
              }`}
            >
              {comment.status ? "✓ Visible" : "Hidden"}
            </span>
            {comment.created_at && (
              <span className="text-xs text-slate-soft/60 ml-auto">
                {new Date(comment.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
          <p className="text-sm text-ink-muted leading-relaxed">{comment.pesan}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 justify-end">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          id={`toggle-comment-${comment.id}`}
          onClick={() => onToggle(comment)}
          disabled={toggling}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 disabled:opacity-60 cursor-pointer ${
            comment.status
              ? "bg-cream-200 text-slate-soft hover:bg-cream-300"
              : "bg-mint-100 text-mint-500 hover:bg-mint-200"
          }`}
        >
          {comment.status ? (
            <>
              <EyeOffIcon /> Hide
            </>
          ) : (
            <>
              <EyeIcon /> Show
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          id={`delete-comment-${comment.id}`}
          onClick={() => onDelete(comment)}
          disabled={deleting}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-red-50 text-red-400 hover:bg-red-100 disabled:opacity-60 transition-colors cursor-pointer"
        >
          <TrashIcon /> Delete
        </motion.button>
      </div>
    </motion.div>
  );
}

// ── Confirm Delete Modal ───────────────────────────────────────────────────

function DeleteModal({
  open,
  comment,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean;
  comment: Komentar | null;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
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
            <div className="bg-white rounded-3xl shadow-float w-full max-w-sm pointer-events-auto p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-400 text-xl">
                  🗑️
                </div>
                <h3 className="font-semibold text-ink">Delete Comment</h3>
              </div>
              <p className="text-sm text-ink-muted">
                Delete comment from{" "}
                <span className="font-semibold text-ink">{comment?.from}</span>? This cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  id="cancel-delete-comment"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-cream-300 text-ink-muted hover:bg-cream-100 cursor-pointer"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  id="confirm-delete-comment"
                  onClick={onConfirm}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-400 hover:bg-red-500 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? "Deleting…" : "Delete"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Filter Tabs ────────────────────────────────────────────────────────────

type FilterType = "all" | "visible" | "hidden";

// ── Main Page ──────────────────────────────────────────────────────────────

export default function KomentarPage() {
  const { token } = useAuthStore();
  const [comments, setComments] = useState<Komentar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");

  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Komentar | null>(null);

  const fetchComments = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getKomentarApi(token, ID_UNDANGAN);
      setComments(Array.isArray(res.data) ? res.data : []);
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err?.message ?? "Failed to load comments.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleToggle = async (comment: Komentar) => {
    if (!token) return;
    setTogglingId(comment.id);
    try {
      await updateKomentarApi(token, { id: comment.id, status: !comment.status });
      setComments((prev) =>
        prev.map((c) => (c.id === comment.id ? { ...c, status: !c.status } : c))
      );
    } catch { /* noop */ }
    finally { setTogglingId(null); }
  };

  const handleDeleteConfirm = async () => {
    if (!token || !deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await deleteKomentarApi(token, deleteTarget.id);
      setComments((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch { /* noop */ }
    finally { setDeletingId(null); }
  };

  const filtered = comments.filter((c) => {
    if (filter === "visible") return c.status;
    if (filter === "hidden") return !c.status;
    return true;
  });

  const counts = {
    all: comments.length,
    visible: comments.filter((c) => c.status).length,
    hidden: comments.filter((c) => !c.status).length,
  };

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
          style={{ background: "linear-gradient(135deg, #9af5db 0%, #b3e3ff 100%)" }}
        >
          💬
        </div>
        <div>
          <h1 className="text-xl font-bold text-ink">Komentar</h1>
          <p className="text-sm text-slate-soft">{comments.length} messages from your guests</p>
        </div>
      </motion.div>

      {/* Filter pills */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.08 }}
        className="flex gap-2"
      >
        {(["all", "visible", "hidden"] as FilterType[]).map((f) => (
          <button
            key={f}
            id={`filter-${f}`}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
              filter === f
                ? "tab-active shadow-card"
                : "bg-white text-slate-soft hover:bg-cream-200 shadow-card"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}{" "}
            <span className="opacity-70">({counts[f]})</span>
          </button>
        ))}
      </motion.div>

      {/* Comment list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={fetchComments} className="text-blush-500 text-sm underline mt-2">Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-card">
          <p className="text-4xl mb-3">🌸</p>
          <p className="font-semibold text-ink">No comments {filter !== "all" ? `in "${filter}"` : "yet"}</p>
          <p className="text-sm text-slate-soft mt-1">Guests&apos; wishes will appear here once they RSVP.</p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-4">
            {filtered.map((comment, i) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                index={i}
                onToggle={handleToggle}
                onDelete={setDeleteTarget}
                toggling={togglingId === comment.id}
                deleting={deletingId === comment.id}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Delete confirmation modal */}
      <DeleteModal
        open={!!deleteTarget}
        comment={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deletingId !== null}
      />
    </div>
  );
}

// ── Icons ──────────────────────────────────────────────────────────────────

function EyeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}
function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center gap-3">
      <svg className="animate-spin h-8 w-8 text-blush-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p className="text-sm text-slate-soft">Loading comments…</p>
    </div>
  );
}

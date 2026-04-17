"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Eye, EyeOff, Trash2, X, AlertTriangle, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { getKomentarApi, updateKomentarApi, deleteKomentarApi, type Komentar } from "@/lib/api";

const ID_UNDANGAN = 1;

// ── Comment Card ───────────────────────────────────────────────────────────

function CommentCard({ comment, index, onToggle, onDelete, toggling, deleting }: {
  comment: Komentar; index: number;
  onToggle: (c: Komentar) => void; onDelete: (c: Komentar) => void;
  toggling: boolean; deleting: boolean;
}) {
  const initials = comment.from.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const hue = (comment.from.charCodeAt(0) * 37) % 360;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.04, duration: 0.35 }} layout
      className={`bg-white rounded-2xl p-5 shadow-card border-l-4 transition-all duration-300 ${
        comment.status ? "border-mint-300" : "border-cream-200 opacity-70"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ background: `hsl(${hue}, 60%, 72%)` }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="font-semibold text-ink text-sm">{comment.from}</p>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${comment.status ? "badge-active" : "badge-inactive"}`}>
              {comment.status ? "Visible" : "Hidden"}
            </span>
            {comment.created_at && (
              <span className="text-xs text-slate-soft/60 ml-auto">
                {new Date(comment.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            )}
          </div>
          <p className="text-sm text-ink-muted leading-relaxed">{comment.pesan}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 justify-end">
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          id={`toggle-comment-${comment.id}`} onClick={() => onToggle(comment)} disabled={toggling}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 disabled:opacity-60 cursor-pointer ${
            comment.status ? "bg-cream-200 text-slate-soft hover:bg-cream-300" : "bg-mint-100 text-mint-500 hover:bg-mint-200"
          }`}>
          {toggling ? <Loader2 size={12} className="animate-spin" /> : comment.status ? <EyeOff size={13} /> : <Eye size={13} />}
          {comment.status ? "Hide" : "Show"}
        </motion.button>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          id={`delete-comment-${comment.id}`} onClick={() => onDelete(comment)} disabled={deleting}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-red-50 text-red-400 hover:bg-red-100 disabled:opacity-60 transition-colors cursor-pointer">
          <Trash2 size={13} /> Delete
        </motion.button>
      </div>
    </motion.div>
  );
}

// ── Delete Modal ───────────────────────────────────────────────────────────

function DeleteModal({ open, comment, onClose, onConfirm, loading }: {
  open: boolean; comment: Komentar | null;
  onClose: () => void; onConfirm: () => void; loading: boolean;
}) {
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
            <div className="bg-white rounded-3xl shadow-float w-full max-w-sm pointer-events-auto p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <Trash2 size={18} className="text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-ink">Delete Comment</h3>
                </div>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-cream-200 text-slate-soft cursor-pointer">
                  <X size={16} />
                </button>
              </div>
              <p className="text-sm text-ink-muted">
                Delete comment from{" "}
                <span className="font-semibold text-ink">{comment?.from}</span>? This cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button id="cancel-delete-comment" onClick={onClose}
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-cream-300 text-ink-muted hover:bg-cream-100 cursor-pointer">
                  Cancel
                </button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  id="confirm-delete-comment" onClick={onConfirm} disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-400 hover:bg-red-500 disabled:opacity-60 cursor-pointer">
                  {loading ? <Loader2 size={14} className="animate-spin" /> : null}
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

// ── Main Page ──────────────────────────────────────────────────────────────

type FilterType = "all" | "visible" | "hidden";

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
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const handleToggle = async (comment: Komentar) => {
    if (!token) return;
    setTogglingId(comment.id);
    try {
      await updateKomentarApi(token, { id: comment.id, status: !comment.status });
      setComments((prev) => prev.map((c) => c.id === comment.id ? { ...c, status: !c.status } : c));
    } catch { /* noop */ } finally { setTogglingId(null); }
  };

  const handleDeleteConfirm = async () => {
    if (!token || !deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await deleteKomentarApi(token, deleteTarget.id);
      setComments((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch { /* noop */ } finally { setDeletingId(null); }
  };

  const filtered = comments.filter((c) =>
    filter === "visible" ? c.status : filter === "hidden" ? !c.status : true
  );
  const counts = { all: comments.length, visible: comments.filter((c) => c.status).length, hidden: comments.filter((c) => !c.status).length };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
          style={{ background: "linear-gradient(135deg, #9af5db 0%, #b3e3ff 100%)" }}>
          <MessageCircle size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-ink">Komentar</h1>
          <p className="text-sm text-slate-soft">{comments.length} messages from your guests</p>
        </div>
      </motion.div>

      {/* Filter pills */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }} className="flex gap-2">
        {(["all", "visible", "hidden"] as FilterType[]).map((f) => (
          <button key={f} id={`filter-${f}`} onClick={() => setFilter(f)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
              filter === f ? "tab-active shadow-card" : "bg-white text-slate-soft hover:bg-cream-200 shadow-card"
            }`}>
            {f === "visible" ? <Eye size={14} /> : f === "hidden" ? <EyeOff size={14} /> : <MessageCircle size={14} />}
            {f.charAt(0).toUpperCase() + f.slice(1)}{" "}
            <span className="opacity-70">({counts[f]})</span>
          </button>
        ))}
      </motion.div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-blush-400" />
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <AlertTriangle size={24} className="text-red-400 mx-auto mb-2" />
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={fetchComments} className="text-blush-500 text-sm underline mt-2">Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-card">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mx-auto mb-4"
            style={{ background: "linear-gradient(135deg, #ffc2cf 0%, #d9c8ff 100%)" }}>
            <Sparkles size={26} />
          </div>
          <p className="font-semibold text-ink">No comments {filter !== "all" ? `in "${filter}"` : "yet"}</p>
          <p className="text-sm text-slate-soft mt-1">Guests&apos; wishes will appear here once they RSVP.</p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-4">
            {filtered.map((comment, i) => (
              <CommentCard key={comment.id} comment={comment} index={i}
                onToggle={handleToggle} onDelete={setDeleteTarget}
                toggling={togglingId === comment.id} deleting={deletingId === comment.id} />
            ))}
          </div>
        </AnimatePresence>
      )}

      <DeleteModal open={!!deleteTarget} comment={deleteTarget}
        onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteConfirm} loading={deletingId !== null} />
    </div>
  );
}

// ── Shared status badge extras ─────────────────────────────────────────────

function CheckCircle2Icon() { return <CheckCircle2 size={12} />; }
void CheckCircle2Icon; // suppress unused warning — used via badge-active class

"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { User, CheckCircle2, AlertTriangle, Lock, Camera } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { updateUserApi, updateAvatarApi } from "@/lib/api";
import { UserAvatar } from "@/components/Sidebar";

type AlertType = "success" | "error" | null;

function Alert({ type, message }: { type: AlertType; message: string }) {
  if (!type) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
        type === "success"
          ? "bg-mint-100 text-mint-500 border border-mint-200"
          : "bg-red-50 text-red-500 border border-red-100"
      }`}
    >
      {type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
      {message}
    </motion.div>
  );
}

export default function ProfilePage() {
  const { user, token, setUser } = useAuthStore();

  const [name, setName] = useState(user?.name ?? "");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameAlert, setNameAlert] = useState<{ type: AlertType; message: string }>({ type: null, message: "" });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarAlert, setAvatarAlert] = useState<{ type: AlertType; message: string }>({ type: null, message: "" });

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !name.trim()) return;
    setNameLoading(true);
    setNameAlert({ type: null, message: "" });
    try {
      await updateUserApi(token, name.trim());
      setUser({ ...(user!), name: name.trim() });
      setNameAlert({ type: "success", message: "Name updated successfully!" });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setNameAlert({ type: "error", message: e?.message ?? "Failed to update name." });
    } finally { setNameLoading(false); }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleAvatarSubmit = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file || !token) return;
    setAvatarLoading(true);
    setAvatarAlert({ type: null, message: "" });
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      await updateAvatarApi(token, fd);
      setUser({ ...(user!), avatar: avatarPreview ?? user?.avatar });
      setAvatarAlert({ type: "success", message: "Avatar updated successfully!" });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setAvatarAlert({ type: "error", message: e?.message ?? "Failed to update avatar." });
    } finally { setAvatarLoading(false); }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.45, ease: "easeOut" } }),
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
          style={{ background: "linear-gradient(135deg, #ffc2cf 0%, #d9c8ff 100%)" }}
        >
          <User size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-ink">Profile & Settings</h1>
          <p className="text-sm text-slate-soft">Manage your account details</p>
        </div>
      </motion.div>

      {/* Avatar card */}
      <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible" className="bg-white rounded-2xl p-6 shadow-card">
        <h2 className="font-semibold text-ink mb-5">Profile Photo</h2>
        <div className="flex items-center gap-6 flex-wrap">
          <div className="relative group">
            {user ? (
              <UserAvatar name={user.name} avatar={avatarPreview ?? user.avatar} size="lg" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-cream-200 animate-pulse" />
            )}
            <button
              id="change-avatar-btn"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center rounded-2xl bg-ink/30 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera size={18} className="text-white" />
            </button>
          </div>

          <div className="flex-1 space-y-2">
            <p className="text-sm font-semibold text-ink">{user?.name ?? "—"}</p>
            <p className="text-xs text-slate-soft">{user?.email ?? "—"}</p>
            <input ref={fileInputRef} id="avatar-file-input" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <div className="flex gap-2 mt-1 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                id="select-avatar-btn"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl text-xs font-semibold border-2 border-blush-200 text-blush-500 hover:bg-blush-50 transition-colors cursor-pointer"
              >
                Select Photo
              </motion.button>
              {avatarPreview && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  id="save-avatar-btn"
                  onClick={handleAvatarSubmit}
                  disabled={avatarLoading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-60 cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #ff9fb5 0%, #c2a7ff 100%)" }}
                >
                  {avatarLoading ? "Uploading…" : "Save Avatar"}
                </motion.button>
              )}
            </div>
          </div>
        </div>
        {avatarAlert.type && <div className="mt-4"><Alert type={avatarAlert.type} message={avatarAlert.message} /></div>}
      </motion.div>

      {/* Name card */}
      <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible" className="bg-white rounded-2xl p-6 shadow-card">
        <h2 className="font-semibold text-ink mb-5">Account Details</h2>
        <form onSubmit={handleNameSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="profile-name" className="block text-sm font-medium text-ink-muted">Display Name</label>
            <input
              id="profile-name" type="text" value={name} onChange={(e) => setName(e.target.value)}
              required placeholder="Your full name"
              className="input-pastel w-full px-4 py-3 rounded-xl border border-cream-300 bg-cream-50 text-ink text-sm transition-all duration-200"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="profile-email" className="block text-sm font-medium text-ink-muted">
              Email Address
              <span className="ml-2 text-xs text-slate-soft/60 font-normal">(read-only)</span>
            </label>
            <input
              id="profile-email" type="email" value={user?.email ?? ""} readOnly
              className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-cream-100 text-ink text-sm cursor-not-allowed"
            />
          </div>
          {nameAlert.type && <Alert type={nameAlert.type} message={nameAlert.message} />}
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              id="save-name-btn" type="submit" disabled={nameLoading}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 cursor-pointer"
              style={{ background: "linear-gradient(135deg, #ff9fb5 0%, #c2a7ff 100%)" }}
            >
              {nameLoading ? "Saving…" : "Save Changes"}
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* Security card */}
      <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible" className="bg-white rounded-2xl p-6 shadow-card">
        <h2 className="font-semibold text-ink mb-2">Security</h2>
        <p className="text-sm text-slate-soft mb-4">Password changes are handled via the verification endpoint.</p>
        <div className="flex items-center gap-3 px-4 py-3 bg-lavender-50 rounded-xl border border-lavender-100">
          <Lock size={18} className="text-lavender-400 flex-shrink-0" />
          <p className="text-sm text-ink-muted">Contact your administrator to reset your password.</p>
        </div>
      </motion.div>
    </div>
  );
}

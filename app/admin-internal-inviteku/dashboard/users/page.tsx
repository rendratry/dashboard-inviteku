"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Search, Loader2, AlertTriangle, RefreshCw, Users, Award, ChevronLeft, ChevronRight, X, ArrowUpDown
} from "lucide-react";
import { useAdminStore } from "@/lib/store";
import { adminGetUsersApi, adminUpdateUserMitraApi, type AdminUser } from "@/lib/api";

function formatDate(val?: string) {
  if (!val) return "—";
  const ms = Number(val);
  const d = isNaN(ms) ? new Date(val) : new Date(ms);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminUsersPage() {
  const { adminToken } = useAdminStore();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mitra Toggle Confirmation Modal
  const [confirmUser, setConfirmUser] = useState<AdminUser | null>(null);
  const [updatingMitra, setUpdatingMitra] = useState(false);

  const [activeFilter, setActiveFilter] = useState<"all" | "mitra" | "regular">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  const fetchUsers = useCallback(async (currentPage: number, searchString: string) => {
    if (!adminToken) return;
    setLoading(true);
    setError(null);
    try {
      const res = await adminGetUsersApi(adminToken, {
        page: currentPage,
        limit,
        search: searchString || undefined,
      });
      if (res.data) {
        setUsers(res.data.users || []);
        setTotal(res.data.total || 0);
        // Sync page from response if provided, otherwise stick to current
        setPage(res.data.page || currentPage);
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message ?? "Gagal memuat data pengguna.");
    } finally {
      setLoading(false);
    }
  }, [adminToken, limit]);

  useEffect(() => {
    fetchUsers(page, activeSearch);
  }, [page, activeSearch, fetchUsers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(search);
  };

  const handleClearSearch = () => {
    setSearch("");
    setActiveSearch("");
    setPage(1);
  };

  const handleToggleMitra = async () => {
    if (!confirmUser || !adminToken) return;
    setUpdatingMitra(true);
    setError(null);
    try {
      const nextStatus = !confirmUser.is_mitra;
      await adminUpdateUserMitraApi(adminToken, confirmUser.id, nextStatus);
      
      // Update local state smoothly
      setUsers((prev) =>
        prev.map((u) => (u.id === confirmUser.id ? { ...u, is_mitra: nextStatus } : u))
      );
      setConfirmUser(null);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message ?? "Gagal merubah status mitra.");
    } finally {
      setUpdatingMitra(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (activeFilter === "mitra") return u.is_mitra;
    if (activeFilter === "regular") return !u.is_mitra;
    return true;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return sortBy === "newest" ? dateB - dateA : dateA - dateB;
  });

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #d9c8ff 0%, #80cfff 100%)" }}
          >
            <Users size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink">Manajemen Users</h1>
            <p className="text-sm text-slate-soft">Kelola data pengguna, status kemitraan, dan riwayat pendaftaran.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => fetchUsers(page, activeSearch)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-cream-300 bg-white/50 text-ink-muted hover:bg-cream-100 transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Total Terdaftar",
            value: total,
            icon: <Users size={18} />,
            color: "#8b5cf6",
            bgColor: "rgba(139, 92, 246, 0.1)",
          },
          {
            label: "Akun Mitra",
            value: users.filter(u => u.is_mitra).length,
            icon: <Award size={18} />,
            color: "#14b894",
            bgColor: "rgba(20, 184, 148, 0.1)",
          },
          {
            label: "Akun Regular",
            value: Math.max(0, total - users.filter(u => u.is_mitra).length),
            icon: <User size={18} />,
            color: "#ff8da1",
            bgColor: "rgba(255, 141, 161, 0.1)",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-4 shadow-card flex items-center gap-4 border border-cream-100"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: stat.bgColor, color: stat.color }}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-xs text-slate-soft uppercase tracking-wider font-semibold">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-ink">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-card border border-cream-100"
      >
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-soft/60" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan ID, Username, Email, atau Nama..."
              className="input-pastel w-full pl-10 pr-10 py-3 rounded-xl border border-cream-300 bg-white/70 text-ink placeholder-slate-soft/60 text-sm transition-all duration-200 focus:border-lavender-300 focus:bg-white focus:shadow-[0_0_0_3px_rgba(200,162,255,0.15)]"
            />
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-soft/60 hover:text-red-400 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="px-6 rounded-xl font-semibold text-white text-sm cursor-pointer transition-all duration-200 shadow-md flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #ff9fb5 0%, #c2a7ff 100%)",
            }}
          >
            Cari
          </motion.button>
        </form>
      </motion.div>

      {/* Filters & Sorting */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        {/* Filter Tabs */}
        <div className="flex gap-2 bg-cream-100 p-1.5 rounded-2xl w-fit">
          {[
            { key: "all", label: "Semua", count: users.length },
            { key: "mitra", label: "Mitra", count: users.filter(u => u.is_mitra).length },
            { key: "regular", label: "Regular", count: users.filter(u => !u.is_mitra).length },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => {
                setActiveFilter(t.key as "all" | "mitra" | "regular");
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeFilter === t.key
                  ? "tab-active animate-fade-in"
                  : "text-slate-soft hover:text-ink"
              }`}
            >
              {t.label}
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-cream-200 text-slate-soft font-semibold">
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Sort Switcher */}
        <div className="flex gap-2 bg-cream-100 p-1.5 rounded-2xl w-fit items-center">
          <span className="text-xs font-bold text-slate-soft/80 px-2 flex items-center gap-1">
            <ArrowUpDown size={12} />
            Urutan:
          </span>
          {[
            { key: "newest", label: "Terbaru" },
            { key: "oldest", label: "Terlama" },
          ].map(s => (
            <button
              key={s.key}
              onClick={() => setSortBy(s.key as "newest" | "oldest")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                sortBy === s.key
                  ? "tab-active animate-fade-in"
                  : "text-slate-soft hover:text-ink"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex items-center justify-center py-24 bg-white/40 backdrop-blur-md rounded-2xl border border-cream-100 shadow-card">
          <Loader2 size={32} className="animate-spin text-lavender-400" />
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-card border border-cream-100">
          <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
          <p className="text-red-500 font-semibold">Gagal Memuat Data</p>
          <p className="text-sm text-slate-soft mt-1">{error}</p>
          <button
            onClick={() => fetchUsers(page, activeSearch)}
            className="mt-4 px-5 py-2 bg-lavender-50 border border-lavender-200 rounded-xl text-lavender-500 hover:bg-lavender-100 transition-all text-xs font-semibold"
          >
            Coba Lagi
          </button>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-card border border-cream-100">
          <Users size={36} className="text-lavender-400 mx-auto mb-3" strokeWidth={1.5} />
          <p className="font-semibold text-ink">Tidak ada user ditemukan</p>
          <p className="text-sm text-slate-soft mt-1">
            {activeSearch
              ? `Pencarian untuk "${activeSearch}" tidak menghasilkan kecocokan.`
              : "Belum ada user yang terdaftar dalam sistem."}
          </p>
          {activeSearch && (
            <button
              onClick={handleClearSearch}
              className="mt-4 px-4 py-2 border border-cream-300 text-ink-muted rounded-xl text-xs font-medium hover:bg-cream-100 transition-all"
            >
              Reset Pencarian
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Table */}
          <div className="bg-white rounded-2xl shadow-card border border-cream-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-cream-200 bg-cream-50">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-soft uppercase tracking-wider">User</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-soft uppercase tracking-wider">Email</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-soft uppercase tracking-wider">Username</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-soft uppercase tracking-wider">Status Mitra</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-soft uppercase tracking-wider">Terdaftar</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-soft uppercase tracking-wider">ID</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-soft uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-soft">
                        <Users size={28} className="text-lavender-300 mx-auto mb-2" strokeWidth={1.5} />
                        <p className="font-semibold text-ink">Tidak ada user matching filter di halaman ini</p>
                        <p className="text-xs text-slate-soft mt-0.5">Coba ganti filter atau pindah ke halaman lain.</p>
                      </td>
                    </tr>
                  ) : (
                    sortedUsers.map((u, i) => (
                      <motion.tr
                        key={u.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-cream-100 hover:bg-cream-50/50 transition-colors"
                      >
                        {/* User (Avatar + Name) */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full border-2 border-lavender-100 flex-shrink-0 bg-lavender-50 overflow-hidden flex items-center justify-center text-lavender-400">
                              {u.avatar ? (
                                <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                              ) : (
                                <User size={18} strokeWidth={2.5} />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-ink leading-tight">{u.name}</p>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-6 py-4">
                          <span className="text-ink font-medium">{u.email}</span>
                        </td>

                        {/* Username */}
                        <td className="px-6 py-4">
                          <span className="text-xs font-semibold px-2.5 py-1 bg-cream-100 border border-cream-200 rounded-lg text-slate-soft font-mono">
                            @{u.username}
                          </span>
                        </td>

                        {/* Status Mitra */}
                        <td className="px-6 py-4">
                          {u.is_mitra ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-lavender-50 border border-lavender-200 text-lavender-500">
                              <Award size={10} />
                              Mitra
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-cream-200 border border-cream-300 text-slate-soft">
                              User Regular
                            </span>
                          )}
                        </td>

                        {/* Joined Date */}
                        <td className="px-6 py-4">
                          <span className="text-xs text-slate-soft">{formatDate(u.created_at)}</span>
                        </td>

                        {/* ID */}
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-slate-soft bg-cream-50 px-2 py-1 rounded select-all hover:bg-cream-100 transition-colors">
                            {u.id}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setConfirmUser(u)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                              u.is_mitra
                                ? "border-red-200 text-red-500 hover:bg-red-50"
                                : "border-lavender-200 text-lavender-500 hover:bg-lavender-50"
                            }`}
                          >
                            {u.is_mitra ? "Set Regular" : "Jadikan Mitra"}
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <span className="text-xs text-slate-soft">
                {activeFilter === "all" ? (
                  <>
                    Menampilkan <span className="font-semibold text-ink">{(page - 1) * limit + 1}</span> -{" "}
                    <span className="font-semibold text-ink">{Math.min(page * limit, total)}</span> dari{" "}
                    <span className="font-semibold text-ink">{total}</span> pengguna
                  </>
                ) : (
                  <>
                    Menampilkan <span className="font-semibold text-ink">{sortedUsers.length}</span> pengguna {activeFilter === "mitra" ? "mitra" : "regular"} di halaman ini (Halaman {page})
                  </>
                )}
              </span>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: page > 1 ? 1.05 : 1 }}
                  whileTap={{ scale: page > 1 ? 0.95 : 1 }}
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  className="flex items-center gap-1.5 px-3 py-2 border border-cream-300 rounded-xl text-xs font-semibold text-ink-muted hover:bg-cream-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent animate-fade-in"
                >
                  <ChevronLeft size={14} />
                  Sebelumnya
                </motion.button>

                <motion.button
                  whileHover={{ scale: page < totalPages ? 1.05 : 1 }}
                  whileTap={{ scale: page < totalPages ? 0.95 : 1 }}
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  className="flex items-center gap-1.5 px-3 py-2 border border-cream-300 rounded-xl text-xs font-semibold text-ink-muted hover:bg-cream-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                  Selanjutnya
                  <ChevronRight size={14} />
                </motion.button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-float w-full max-w-md p-6 space-y-5 border border-cream-100"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-ink flex items-center gap-2">
                  <Award size={18} className="text-lavender-400" />
                  Ubah Status Kemitraan
                </h2>
                <button
                  onClick={() => setConfirmUser(null)}
                  className="text-slate-soft hover:text-red-400 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="bg-cream-50 rounded-xl p-4 space-y-2 border border-cream-200 text-sm">
                <p className="text-slate-soft">
                  Anda akan mengubah status pengguna berikut:
                </p>
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-cream-200">
                  <div className="w-9 h-9 rounded-full border border-lavender-100 bg-lavender-50 overflow-hidden flex items-center justify-center text-lavender-400 font-semibold flex-shrink-0">
                    {confirmUser.avatar ? (
                      <img src={confirmUser.avatar} alt={confirmUser.name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={16} />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-ink leading-tight">{confirmUser.name}</p>
                    <p className="text-xs text-slate-soft">@{confirmUser.username}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-soft/80 mt-2">
                  {confirmUser.is_mitra
                    ? "Pengguna ini akan diturunkan statusnya menjadi User Regular."
                    : "Pengguna ini akan dipromosikan statusnya menjadi Mitra Inviteku."}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmUser(null)}
                  disabled={updatingMitra}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-soft bg-cream-100 hover:bg-cream-200 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Batal
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleToggleMitra}
                  disabled={updatingMitra}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 cursor-pointer"
                  style={{
                    background: confirmUser.is_mitra
                      ? "linear-gradient(135deg, #ff9fb5 0%, #ff7a99 100%)"
                      : "linear-gradient(135deg, #9af5db 0%, #14b894 100%)",
                  }}
                >
                  {updatingMitra ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Memproses...
                    </>
                  ) : confirmUser.is_mitra ? (
                    "Jadikan Regular"
                  ) : (
                    "Jadikan Mitra"
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

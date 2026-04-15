"use client";

/**
 * Topbar — displays page title, search hint, and user avatar dropdown.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/store";
import { UserAvatar } from "@/components/Sidebar";
import { useRouter } from "next/navigation";

// Title map for route → display name
const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/profile": "Profile & Settings",
  "/dashboard/tamu": "Tamu Management",
  "/dashboard/assets": "Undangan Assets",
  "/dashboard/komentar": "Komentar",
};

interface TopbarProps {
  pathname: string;
  onMenuClick: () => void;
}

export default function Topbar({ pathname, onMenuClick }: TopbarProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const title = PAGE_TITLES[pathname] ?? "Dashboard";

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    router.push("/login");
  };

  return (
    <header className="h-16 flex items-center px-6 gap-4 border-b border-cream-200 bg-white/80 backdrop-blur-md flex-shrink-0 sticky top-0 z-20">
      {/* Mobile menu toggle */}
      <button
        id="topbar-menu-toggle"
        onClick={onMenuClick}
        className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-blush-50 text-slate-soft hover:text-blush-500 transition-colors"
        aria-label="Toggle sidebar"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" x2="21" y1="6" y2="6" />
          <line x1="3" x2="21" y1="12" y2="12" />
          <line x1="3" x2="21" y1="18" y2="18" />
        </svg>
      </button>

      {/* Page title */}
      <motion.h2
        key={pathname}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-base font-semibold text-ink flex-1"
      >
        {title}
      </motion.h2>

      {/* Right cluster */}
      <div className="flex items-center gap-2">
        {/* Notification bell (decorative) */}
        <button
          id="notif-bell"
          className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-blush-50 text-slate-soft hover:text-blush-500 transition-colors"
          aria-label="Notifications"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blush-400 border-2 border-white" />
        </button>

        {/* User avatar + dropdown */}
        <div className="relative">
          <button
            id="user-avatar-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-blush-50 transition-colors cursor-pointer"
          >
            {user ? (
              <>
                <UserAvatar name={user.name} avatar={user.avatar} size="sm" />
                <span className="text-sm font-medium text-ink hidden sm:block max-w-28 truncate">
                  {user.name}
                </span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`text-slate-soft transition-transform duration-200 hidden sm:block ${dropdownOpen ? "rotate-180" : ""}`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-cream-200 animate-pulse" />
            )}
          </button>

          {/* Dropdown menu */}
          <AnimatePresence>
            {dropdownOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute right-0 top-12 w-52 z-20 glass-card rounded-2xl shadow-float overflow-hidden"
                >
                  {user && (
                    <div className="px-4 py-3 border-b border-cream-200">
                      <p className="text-sm font-semibold text-ink">{user.name}</p>
                      <p className="text-xs text-slate-soft truncate">{user.email}</p>
                    </div>
                  )}

                  <div className="p-1.5 space-y-0.5">
                    <DropdownItem
                      id="dd-profile"
                      icon="👤"
                      label="My Profile"
                      onClick={() => {
                        setDropdownOpen(false);
                        router.push("/dashboard/profile");
                      }}
                    />
                    <DropdownItem
                      id="dd-settings"
                      icon="⚙️"
                      label="Settings"
                      onClick={() => {
                        setDropdownOpen(false);
                        router.push("/dashboard/profile");
                      }}
                    />
                    <div className="h-px bg-cream-200 my-1" />
                    <DropdownItem
                      id="dd-logout"
                      icon="🚪"
                      label="Sign out"
                      onClick={handleLogout}
                      danger
                    />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

function DropdownItem({
  id,
  icon,
  label,
  onClick,
  danger,
}: {
  id: string;
  icon: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
        danger
          ? "text-red-500 hover:bg-red-50"
          : "text-ink-muted hover:bg-cream-200 hover:text-ink"
      }`}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}

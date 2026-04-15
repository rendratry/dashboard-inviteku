"use client";

/**
 * Dashboard Overview page — /dashboard
 * Shows stat cards and a quick welcome banner.
 */

import { motion } from "framer-motion";
import { useAuthStore } from "@/lib/store";
import Link from "next/link";

// ── Stat Card Component ────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  icon,
  colorFrom,
  colorTo,
  delay = 0,
}: {
  title: string;
  value: string;
  icon: string;
  colorFrom: string;
  colorTo: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className="bg-white rounded-2xl p-5 shadow-card flex items-center gap-4"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${colorFrom} 0%, ${colorTo} 100%)` }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-slate-soft uppercase tracking-wider mb-0.5">
          {title}
        </p>
        <p className="text-2xl font-bold text-ink">{value}</p>
      </div>
    </motion.div>
  );
}

// ── Quick Action Card ──────────────────────────────────────────────────────

function QuickAction({
  href,
  icon,
  label,
  description,
  colorFrom,
  colorTo,
  delay = 0,
}: {
  href: string;
  icon: string;
  label: string;
  description: string;
  colorFrom: string;
  colorTo: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -3 }}
    >
      <Link
        href={href}
        className="flex flex-col items-start gap-3 bg-white rounded-2xl p-5 shadow-card hover:shadow-float transition-all duration-300 block"
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${colorFrom} 0%, ${colorTo} 100%)` }}
        >
          {icon}
        </div>
        <div>
          <p className="font-semibold text-ink text-sm mb-0.5">{label}</p>
          <p className="text-xs text-slate-soft leading-relaxed">{description}</p>
        </div>
        <div className="flex items-center gap-1 text-xs font-medium" style={{ color: colorFrom }}>
          Manage <span>→</span>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuthStore();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl p-8 text-white"
        style={{
          background: "linear-gradient(135deg, #ff9fb5 0%, #c2a7ff 50%, #80cfff 100%)",
        }}
      >
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 right-16 w-32 h-32 rounded-full bg-white/10 translate-y-1/2" />

        <div className="relative">
          <p className="text-white/80 text-sm font-medium mb-1">{greeting} 👋</p>
          <h1 className="text-2xl font-bold mb-1">
            {user?.name ?? "Admin"}!
          </h1>
          <p className="text-white/70 text-sm max-w-sm">
            Manage your digital wedding invitations from one elegant place.
          </p>

          {/* Pill badge */}
          <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5">
            <span className="w-2 h-2 rounded-full bg-mint-300 animate-pulse" />
            <span className="text-sm font-medium">Dashboard active</span>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <div>
        <motion.h2
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-sm font-semibold text-slate-soft uppercase tracking-wider mb-4"
        >
          At a Glance
        </motion.h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Undangan" value="—" icon="💌" colorFrom="#ffc2cf" colorTo="#d9c8ff" delay={0.15} />
          <StatCard title="Tamu" value="—" icon="👥" colorFrom="#d9c8ff" colorTo="#b3e3ff" delay={0.2} />
          <StatCard title="Komentar" value="—" icon="💬" colorFrom="#b3e3ff" colorTo="#9af5db" delay={0.25} />
          <StatCard title="Assets" value="—" icon="🖼️" colorFrom="#9af5db" colorTo="#ffc2cf" delay={0.3} />
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <motion.h2
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="text-sm font-semibold text-slate-soft uppercase tracking-wider mb-4"
        >
          Quick Actions
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            href="/dashboard/profile"
            icon="👤"
            label="Profile"
            description="Update your name, email, and avatar photo."
            colorFrom="#ff9fb5"
            colorTo="#d9c8ff"
            delay={0.4}
          />
          <QuickAction
            href="/dashboard/tamu"
            icon="👥"
            label="Tamu List"
            description="Add, edit, and manage your wedding guests."
            colorFrom="#d9c8ff"
            colorTo="#80cfff"
            delay={0.45}
          />
          <QuickAction
            href="/dashboard/assets"
            icon="🎨"
            label="Assets"
            description="Configure all sections of your digital invitation."
            colorFrom="#80cfff"
            colorTo="#9af5db"
            delay={0.5}
          />
          <QuickAction
            href="/dashboard/komentar"
            icon="💬"
            label="Komentar"
            description="Moderate wishes and comments from your guests."
            colorFrom="#9af5db"
            colorTo="#ff9fb5"
            delay={0.55}
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/admin-internal-inviteku/dashboard/payments"); }, [router]);
  return null;
}

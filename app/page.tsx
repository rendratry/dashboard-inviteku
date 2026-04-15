import { redirect } from "next/navigation";

/**
 * Root page — redirect to dashboard (or login if unauthenticated).
 * AuthGuard in the dashboard layout handles the actual auth check.
 */
export default function RootPage() {
  redirect("/dashboard");
}

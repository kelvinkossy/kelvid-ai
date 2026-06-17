import { auth } from "@/lib/auth"; import { redirect } from "next/navigation"; import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") redirect("/app/dashboard");
  return (
    <div className="min-h-screen flex">
      <aside className="w-56 border-r border-white/10 p-6 space-y-4">
        <Link href="/admin" className="block text-lg font-bold text-amber-400">KelVid AI Admin</Link>
        <nav className="flex flex-col gap-2 text-sm">
          <Link href="/admin" className="text-slate-300 hover:text-white">Overview</Link>
          <Link href="/admin/users" className="text-slate-300 hover:text-white">Users</Link>
          <Link href="/admin/jobs" className="text-slate-300 hover:text-white">Jobs</Link>
          <Link href="/admin/payments" className="text-slate-300 hover:text-white">Payments</Link>
          <Link href="/app/dashboard" className="text-slate-500 hover:text-white mt-8">&larr; Back to app</Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

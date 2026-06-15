import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import AppShell from "@/components/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");

  const user = session.user as any;
  const data = await db.load();
  const credits = data.users.find((u) => u.id === user.id)?.creditBalance ?? 0;

  return (
    <AppShell credits={credits} email={user.email} role={user.role}>
      {children}
    </AppShell>
  );
}

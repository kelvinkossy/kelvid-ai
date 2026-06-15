import { auth } from "@/lib/auth"; import { redirect } from "next/navigation"; import { db } from "@/lib/db"; import StudioClient from "./studio-client";

export default async function StudioPage() {
  const session = await auth(); if (!session?.user) redirect("/auth/sign-in");
  const userId = (session.user as any).id;
  const data = await db.load();
  const user = data.users.find((u) => u.id === userId);
  return <StudioClient credits={user?.creditBalance ?? 0} />;
}

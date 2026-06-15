import { auth } from "@/lib/auth"; import { redirect } from "next/navigation"; import { db } from "@/lib/db"; import Form from "./form";

export default async function GeneratePage() {
  const session = await auth(); if (!session?.user) redirect("/auth/sign-in");
  const data = await db.load(); const user = data.users.find((u) => u.id === (session.user as any).id);
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Generate a video</h1>
      <p className="text-slate-400 mb-8">Credits: <span className="text-brand-400 font-semibold">{user?.creditBalance ?? 0}</span></p>
      <Form credits={user?.creditBalance ?? 0} />
    </div>
  );
}

import { signOut } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  await signOut({ redirect: false });
  return NextResponse.redirect(new URL("/auth/sign-in", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"));
}

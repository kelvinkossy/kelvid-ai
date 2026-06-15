import type { Metadata } from "next";
import "./globals.css";
import { inter } from "@/lib/fonts";
import ToastContainer from "@/components/toast";

export const metadata: Metadata = {
  title: "VidForge — Text-to-Video AI",
  description: "Turn your words into stunning AI-generated videos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} h-full bg-surface text-text-primary antialiased font-sans`}>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}

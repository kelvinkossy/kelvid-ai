"use client";
import dynamic from "next/dynamic";

const Toast = dynamic(() => import("@/components/toast"));

export default function ToastWrapper() {
  return <Toast />;
}

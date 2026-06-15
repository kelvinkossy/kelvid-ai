"use client";

import dynamic from "next/dynamic";

const Bg = dynamic(() => import("./animated-bg"), { ssr: false });

export default function LazyBackground({ count = 30 }: { count?: number }) {
  return <Bg count={count} />;
}

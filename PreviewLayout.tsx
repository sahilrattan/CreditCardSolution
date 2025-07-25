"use client";
import type { ReactNode } from "react";

export default function PreviewLayout({ children }: { children: ReactNode }) {
  return <div className="isolate">{children}</div>;
}

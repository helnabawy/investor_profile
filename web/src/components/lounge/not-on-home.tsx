"use client";
import { usePathname } from "next/navigation";

/** Renders children everywhere except the lounge home (which is a single full-height chat screen). */
export function NotOnHome({ children }: { children: React.ReactNode }) {
  return usePathname() === "/" ? null : <>{children}</>;
}

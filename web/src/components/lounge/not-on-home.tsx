"use client";
import { useSitePathname } from "@/components/site/link";

/** Renders children everywhere except the lounge home (which is a single full-height chat screen). */
export function NotOnHome({ children }: { children: React.ReactNode }) {
  return useSitePathname() === "/" ? null : <>{children}</>;
}

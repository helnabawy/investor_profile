"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, MessageCircle } from "lucide-react";
import type { NavItem } from "@/lib/types";
import { cn } from "@/lib/format";

export function SiteHeader({ name, logoUrl, nav, whatsapp }: { name: string; logoUrl?: string; nav: NavItem[]; whatsapp: string | null }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      // Transparent over a full-bleed hero (see .site-header in globals.css), solid otherwise.
      className={cn("site-header fixed inset-x-0 top-0 z-40 transition-colors duration-300", (scrolled || open) && "is-solid")}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={name} className="h-9 w-auto" />
          ) : (
            <span className="font-heading text-xl tracking-wide">{name}</span>
          )}
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="text-sm uppercase tracking-[0.18em] opacity-85 hover:text-primary hover:opacity-100">
              {n.label}
            </Link>
          ))}
          {whatsapp && (
            <a href={whatsapp} target="_blank" rel="noreferrer" className="btn btn-primary !py-2 !px-4 text-sm">
              <MessageCircle size={16} /> WhatsApp
            </a>
          )}
        </nav>
        <button className="md:hidden" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-t px-5 pb-5 md:hidden">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="py-3 text-sm uppercase tracking-[0.18em]">
              {n.label}
            </Link>
          ))}
          {whatsapp && <a href={whatsapp} className="btn btn-primary mt-2">WhatsApp us</a>}
        </nav>
      )}
    </header>
  );
}

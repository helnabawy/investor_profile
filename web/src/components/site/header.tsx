"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import type { NavItem } from "@/lib/types";
import { cn } from "@/lib/format";

type Props = { name: string; logoUrl?: string; nav: NavItem[]; phone?: string; cta: { label: string; href: string } };

/** Initials for the brand tile when the agent has no logo yet ("Aurelia Estates" → "AE"). */
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

export function SiteHeader({ name, logoUrl, nav, phone, cta }: Props) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const path = usePathname();
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  const tel = phone ? `tel:${phone.replace(/\s/g, "")}` : null;

  return (
    <header
      // Solid by default; transparent only over a full-bleed photo hero (see .site-header in globals.css).
      className={cn("site-header fixed inset-x-0 top-0 z-40 transition-colors duration-300", (scrolled || open) && "is-solid")}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-3">
        <Link href="/" className="flex min-h-11 items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={name} className="h-9 w-auto" />
          ) : (
            <>
              <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-[calc(var(--radius)-2px)] bg-primary font-heading text-[0.95rem] font-bold text-primary-foreground">{initials(name)}</span>
              <span className="font-heading text-lg font-bold">{name}</span>
            </>
          )}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} aria-current={isActive(n.href) ? "page" : undefined}
              className={cn("rounded-md px-3.5 py-3 text-[0.94rem] hover:text-primary", isActive(n.href) ? "font-semibold text-primary" : "font-medium opacity-80")}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          {tel && <a href={tel} className="inline-flex min-h-11 items-center gap-2 text-[0.94rem] font-medium hover:text-primary"><Phone size={17} aria-hidden />{phone}</a>}
          <Link href={cta.href} className="btn btn-primary !min-h-11 !px-5 text-[0.94rem]">{cta.label}</Link>
        </div>

        <button className="flex h-11 w-11 items-center justify-center lg:hidden" aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav aria-label="Main" className="flex flex-col gap-1 border-t px-5 pb-5 pt-2 lg:hidden">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} aria-current={isActive(n.href) ? "page" : undefined}
              className={cn("flex min-h-12 items-center text-base", isActive(n.href) ? "font-semibold text-primary" : "font-medium")}>
              {n.label}
            </Link>
          ))}
          {tel && <a href={tel} className="flex min-h-12 items-center gap-2 font-medium"><Phone size={17} aria-hidden />{phone}</a>}
          <Link href={cta.href} onClick={() => setOpen(false)} className="btn btn-primary mt-2">{cta.label}</Link>
        </nav>
      )}
    </header>
  );
}

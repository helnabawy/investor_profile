"use client";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const LINK = "text-[0.95rem] font-medium text-ink-2 hover:text-ink";

/**
 * The landing page's app bar. From 1024px the links sit inline; below that they fold into a menu
 * button, and the links, Sign in and Create your site open in a panel under the bar.
 */
export function LandingNav({ demoUrl }: { demoUrl: string }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const links: [string, string][] = [["#features", "What you get"], ["#how", "How it works"], ["#templates", "Templates"], ["#pricing", "Pricing"], [demoUrl, "Live demo"]];

  // Close on Escape, and when the window grows past the breakpoint with the menu open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const wide = window.matchMedia("(min-width: 1024px)");
    const onWide = () => wide.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      window.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  return (
    <header className="relative z-[2] bg-surface">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-x-8 px-6 py-3.5">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-x-7 lg:flex">
          {links.map(([href, label]) => <a key={label} href={href} className={`py-3 ${LINK}`}>{label}</a>)}
        </nav>
        <div className="flex items-center gap-x-2 sm:gap-x-4">
          <ThemeToggle />
          <Link href="/login" className={`hidden py-3 lg:inline ${LINK}`}>Sign in</Link>
          {/* Wrapped: .a-btn sets its own display, which would override a hidden class on the link. */}
          <span className="max-sm:hidden"><Link href="/signup" className="a-btn a-btn-primary">Create your site</Link></span>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? "Close menu" : "Open menu"}
            className="landing-menu-btn lg:hidden"
          >
            <Menu size={22} strokeWidth={1.75} aria-hidden className="landing-menu-icon" data-icon="open" />
            <X size={22} strokeWidth={1.75} aria-hidden className="landing-menu-icon" data-icon="close" />
          </button>
        </div>
      </div>

      {/* The panel folds open under the bar (grid rows 0fr → 1fr), so it pushes the page down instead of covering it. */}
      <div id={panelId} data-open={open} className="landing-menu lg:hidden" inert={!open}>
        <div className="min-h-0 overflow-hidden">
          <nav aria-label="Main" className="mx-auto max-w-[1240px] px-6 pb-5">
            <ul className="border-t border-line-soft">
              {links.map(([href, label], i) => (
                <li key={label} style={{ "--i": i } as React.CSSProperties} className="landing-menu-item border-b border-line-soft">
                  <a href={href} onClick={() => setOpen(false)} className={`flex min-h-12 items-center ${LINK} text-[1rem]`}>{label}</a>
                </li>
              ))}
            </ul>
            <div style={{ "--i": links.length } as React.CSSProperties} className="landing-menu-item mt-5 grid grid-cols-2 gap-3">
              <Link href="/login" className="a-btn a-btn-ghost">Sign in</Link>
              <Link href="/signup" className="a-btn a-btn-primary">Create your site</Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

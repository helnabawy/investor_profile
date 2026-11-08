"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Building2, CircleUserRound, House, LogIn, Mail, Menu, MessagesSquare, FileText, X } from "lucide-react";
import type { NavItem } from "@/lib/types";
import { cn } from "@/lib/format";

const ICONS: [RegExp, typeof House][] = [
  [/^\/$/, House],
  [/^\/about/, CircleUserRound],
  [/^\/projects/, Building2],
  [/^\/(concierge|chat)/, MessagesSquare],
  [/^\/contact/, Mail],
];
const iconFor = (href: string) => ICONS.find(([re]) => re.test(href))?.[1] ?? FileText;

type Props = { name: string; logoUrl?: string; nav: NavItem[]; cta: { label: string; href: string } };

function Monogram({ name }: { name: string }) {
  const letters = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <span className="font-heading text-[2.6rem] leading-none tracking-tight text-[var(--sidebar-mark)]">{letters}</span>
      <span className="font-heading text-[0.95rem] uppercase tracking-[0.22em]">{name}</span>
    </div>
  );
}

function Panel({ name, logoUrl, nav, cta, onNavigate }: Props & { onNavigate?: () => void }) {
  const path = usePathname() ?? "/";
  const items = nav.some((n) => n.href === "/") ? nav : [{ label: "Home", href: "/" }, ...nav];
  const active = (href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(href + "/"));
  const CtaIcon = /^https?:/.test(cta.href) ? MessagesSquare : LogIn;
  return (
    <div className="lounge-panel flex h-full flex-col">
      <Link href="/" onClick={onNavigate} className="flex min-h-[200px] flex-1 basis-[38%] items-center justify-center px-6 py-10" aria-label={`${name} — home`}>
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={name} className="max-h-24 w-auto max-w-[80%] object-contain" />
        ) : (
          <Monogram name={name} />
        )}
      </Link>
      <nav aria-label="Main" className="border-t border-[var(--sidebar-line)] px-3 py-3">
        <ul className="grid gap-1">
          {items.map((n) => {
            const Icon = iconFor(n.href);
            const on = active(n.href);
            return (
              <li key={n.href}>
                <Link
                  href={n.href}
                  onClick={onNavigate}
                  aria-current={on ? "page" : undefined}
                  className={cn("lounge-nav-item relative flex items-center gap-3 rounded-[var(--radius)] px-4 py-3 text-[0.95rem] font-ui", on && "is-active")}
                >
                  {on && <motion.span layoutId="lounge-nav-marker" className="lounge-nav-marker" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                  <Icon size={18} strokeWidth={1.6} aria-hidden />
                  {n.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="flex-1" />
      <div className="border-t border-[var(--sidebar-line)] p-4">
        <Link href={cta.href} onClick={onNavigate} className="lounge-cta flex items-center justify-center gap-2.5 rounded-[var(--radius)] px-4 py-3 text-[0.95rem] font-ui font-medium">
          <CtaIcon size={17} strokeWidth={1.8} aria-hidden /> {cta.label}
        </Link>
      </div>
    </div>
  );
}

export function LoungeSidebar(props: Props) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]); // eslint-disable-line react-hooks/set-state-in-effect -- close drawer on navigation
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <aside className="lounge-sidebar fixed bottom-4 left-4 top-4 z-40 hidden w-[15rem] overflow-hidden lg:block">
        <Panel {...props} />
      </aside>

      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="lounge-menu-btn fixed right-4 top-4 z-40 flex h-12 w-12 items-center justify-center rounded-[var(--radius)] lg:hidden"
      >
        <Menu size={20} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" aria-label="Close menu" onClick={() => setOpen(false)} />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              className="lounge-sidebar absolute bottom-3 left-3 top-3 w-[min(19rem,calc(100vw-4.5rem))] overflow-hidden"
              initial={{ x: "-110%" }}
              animate={{ x: 0 }}
              exit={{ x: "-110%" }}
              transition={{ type: "spring", stiffness: 420, damping: 42 }}
            >
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-3 top-3 z-10 rounded-full p-2 hover:bg-[color-mix(in_srgb,currentColor_10%,transparent)]"><X size={18} /></button>
              <Panel {...props} onNavigate={() => setOpen(false)} />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

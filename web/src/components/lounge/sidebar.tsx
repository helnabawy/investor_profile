"use client";
import Link from "@/components/site/link";
import { useSitePathname, useSiteT } from "@/components/site/link";
import { LangSwitch } from "@/components/site/lang-switch";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Building2, CircleUserRound, House, LogIn, Mail, Menu, MessagesSquare, FileText, X } from "lucide-react";
import type { NavItem } from "@/lib/types";
import { cn, initials } from "@/lib/format";

const ICONS: [RegExp, typeof House][] = [
  [/^\/$/, House],
  [/^\/about/, CircleUserRound],
  [/^\/projects/, Building2],
  [/^\/(concierge|chat)/, MessagesSquare],
  [/^\/contact/, Mail],
];
const iconFor = (href: string) => ICONS.find(([re]) => re.test(href))?.[1] ?? FileText;

type Props = { name: string; logoUrl?: string; portraitUrl?: string; nav: NavItem[]; cta: { label: string; href: string } };

/** The advisor's portrait when there is one (the same photo as the home avatar), else their initials. */
function Monogram({ name, portraitUrl }: { name: string; portraitUrl?: string }) {
  const letters = initials(name);
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      {portraitUrl ? (
        <span className="h-28 w-28 overflow-hidden rounded-full shadow-[0_14px_32px_-12px_rgb(0_0_0/0.7)] ring-2 ring-[color-mix(in_srgb,var(--sidebar-mark)_55%,transparent)] ring-offset-4 ring-offset-[var(--sidebar)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={portraitUrl} alt="" className="h-full w-full object-cover object-[50%_30%]" />
        </span>
      ) : (
        <span className="font-heading text-[2.6rem] leading-none tracking-tight text-[var(--sidebar-mark)]">{letters}</span>
      )}
      <span className="font-heading text-[0.95rem] uppercase tracking-[0.22em]">{name}</span>
    </div>
  );
}

function Panel({ name, logoUrl, portraitUrl, nav, cta, onNavigate }: Props & { onNavigate?: () => void }) {
  const path = useSitePathname() ?? "/";
  const { t } = useSiteT();
  const items = nav.some((n) => n.href === "/") ? nav : [{ label: t.common.home, href: "/" }, ...nav];
  const active = (href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(href + "/"));
  const CtaIcon = /^https?:/.test(cta.href) ? MessagesSquare : LogIn;
  return (
    <div className="lounge-panel flex h-full flex-col">
      <Link href="/" onClick={onNavigate} className="flex min-h-[200px] flex-1 basis-[38%] items-center justify-center px-6 py-10" aria-label={t.common.homeOf(name)}>
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={name} className="max-h-24 w-auto max-w-[80%] object-contain" />
        ) : (
          <Monogram name={name} portraitUrl={portraitUrl} />
        )}
      </Link>
      <nav aria-label={t.common.mainNav} className="border-t border-[var(--sidebar-line)] px-3 py-3">
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
          <CtaIcon size={17} strokeWidth={1.8} className="rtl:-scale-x-100" aria-hidden /> {cta.label}
        </Link>
        <LangSwitch className="font-ui mt-2 w-full rounded-[var(--radius)] text-[0.9rem] opacity-80 hover:opacity-100" />
      </div>
    </div>
  );
}

export function LoungeSidebar(props: Props) {
  const [open, setOpen] = useState(false);
  const { t, locale } = useSiteT();
  const off = locale === "ar" ? "110%" : "-110%"; // the drawer slides in from the reading start
  const path = useSitePathname();
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
      <aside className="lounge-sidebar fixed bottom-4 start-4 top-4 z-40 hidden w-[15rem] overflow-hidden lg:block">
        <Panel {...props} />
      </aside>

      <button
        onClick={() => setOpen(true)}
        aria-label={t.common.openMenu}
        aria-expanded={open}
        className="lounge-menu-btn fixed end-4 top-4 z-40 flex h-12 w-12 items-center justify-center rounded-[var(--radius)] lg:hidden"
      >
        <Menu size={20} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" aria-label={t.common.closeMenu} onClick={() => setOpen(false)} />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label={t.common.menu}
              className="lounge-sidebar absolute bottom-3 start-3 top-3 w-[min(19rem,calc(100vw-4.5rem))] overflow-hidden"
              initial={{ x: off }}
              animate={{ x: 0 }}
              exit={{ x: off }}
              transition={{ type: "spring", stiffness: 420, damping: 42 }}
            >
              <button onClick={() => setOpen(false)} aria-label={t.common.closeMenu} className="absolute end-3 top-3 z-10 rounded-full p-2 hover:bg-[color-mix(in_srgb,currentColor_10%,transparent)]"><X size={18} /></button>
              <Panel {...props} onNavigate={() => setOpen(false)} />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

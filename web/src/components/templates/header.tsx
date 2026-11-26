"use client";
import Link from "@/components/site/link";
import { useSitePathname, useSiteT } from "@/components/site/link";
import { LangSwitch } from "@/components/site/lang-switch";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import type { NavItem } from "@/lib/types";

export type TemplateKind = "horizon" | "ledger" | "atelier" | "foyer";

type Props = {
  kind: TemplateKind;
  name: string;
  tagline?: string | null;
  logoUrl?: string;
  nav: NavItem[];
  phone?: string;
  cta: { label: string; href: string };
  /** Foyer's home page is a single screen with its own brand block, so the header stays off it. */
  hideOnHome?: boolean;
};

/**
 * Header for the Horizon, Ledger, Atelier and Foyer templates. One component, four voices:
 * Horizon is a bold name with a pill button, Ledger adds the tagline and phone number, Atelier is
 * a serif name with underlined links, Foyer matches Ledger without the phone.
 */
export function TemplateHeader({ kind, name, tagline, logoUrl, nav, phone, cta, hideOnHome }: Props) {
  const [open, setOpen] = useState(false);
  const path = useSitePathname();
  const { t } = useSiteT();
  if (hideOnHome && path === "/") return null;
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  const twoLine = (kind === "ledger" || kind === "foyer") && tagline;
  const atelier = kind === "atelier";
  const link = (n: NavItem, mobile?: boolean) => (
    <Link key={n.href} href={n.href} onClick={() => setOpen(false)} aria-current={isActive(n.href) ? "page" : undefined}
      className={`t-nav ${mobile ? "flex min-h-12 items-center text-base" : "py-3 text-[0.95rem]"}`}>
      {n.label}
    </Link>
  );
  const button = atelier
    ? <Link href={cta.href} onClick={() => setOpen(false)} className="t-nav border-b border-current py-3 text-[0.95rem]">{cta.label}</Link>
    : <Link href={cta.href} onClick={() => setOpen(false)} className="btn btn-primary !min-h-11 !px-5 text-[0.94rem]">{cta.label}</Link>;

  return (
    <header className="t-header fixed inset-x-0 top-0 z-40">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-6 px-5 py-3 md:px-6">
        <Link href="/" className="flex min-h-11 min-w-0 flex-col justify-center leading-tight">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={name} className="h-9 w-auto" />
          ) : (
            <>
              <span className={`truncate font-heading ${atelier ? "text-[1.3rem]" : "text-[1.2rem] font-bold tracking-[-0.015em]"}`}>{name}</span>
              {twoLine && <span className="truncate text-[0.8rem] text-muted-foreground">{tagline}</span>}
            </>
          )}
        </Link>
        <nav aria-label={t.common.mainNav} className="hidden items-center gap-x-7 lg:flex">{nav.map((n) => link(n))}</nav>
        <div className="hidden items-center gap-x-5 lg:flex">
          <LangSwitch className="t-nav text-[0.95rem]" />
          {kind === "ledger" && phone && <a href={`tel:${phone.replace(/\s/g, "")}`} className="t-nav py-3 text-[0.95rem] tabular-nums"><bdi dir="ltr">{phone}</bdi></a>}
          {button}
        </div>
        <button className="flex h-11 w-11 items-center justify-center lg:hidden" aria-expanded={open} aria-label={open ? t.common.closeMenu : t.common.openMenu} onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav aria-label={t.common.mainNav} className="flex flex-col gap-1 border-t px-5 pb-5 pt-2 lg:hidden">
          {nav.map((n) => link(n, true))}
          {phone && <a href={`tel:${phone.replace(/\s/g, "")}`} className="t-nav flex min-h-12 items-center text-base tabular-nums"><bdi dir="ltr">{phone}</bdi></a>}
          <LangSwitch className="t-nav self-start text-base" />
          <div className="mt-2">{button}</div>
        </nav>
      )}
    </header>
  );
}

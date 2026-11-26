"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminT } from "./i18n";
import type { AdminDict } from "@/lib/i18n/admin";
import { LayoutDashboard, Settings, Palette, FileText, Building2, HelpCircle, Bot, Inbox, MessagesSquare } from "lucide-react";

const groups = (s: AdminDict["shell"]) => [
  { title: s.groups.site, items: [
    { href: "/admin", label: s.items.overview, icon: LayoutDashboard },
    { href: "/admin/projects", label: s.items.projects, icon: Building2 },
    { href: "/admin/pages", label: s.items.pages, icon: FileText },
    { href: "/admin/theme", label: s.items.theme, icon: Palette },
  ] },
  { title: s.groups.concierge, items: [
    { href: "/admin/ai", label: s.items.ai, icon: Bot },
    { href: "/admin/knowledge", label: s.items.knowledge, icon: HelpCircle },
  ] },
  { title: s.groups.buyers, items: [
    { href: "/admin/leads", label: s.items.leads, icon: Inbox },
    { href: "/admin/chats", label: s.items.chats, icon: MessagesSquare },
  ] },
  { title: s.groups.account, items: [
    { href: "/admin/settings", label: s.items.settings, icon: Settings },
  ] },
];

/** `newLeads` puts a count on Leads so waiting buyers are visible from every screen. */
export function AdminNav({ mobile, newLeads = 0 }: { mobile?: boolean; newLeads?: number }) {
  const path = usePathname();
  const { t } = useAdminT();
  const GROUPS = groups(t.shell);
  const active = (href: string) => (href === "/admin" ? path === href : path.startsWith(href));
  const badge = (href: string) => href === "/admin/leads" && newLeads > 0
    ? <span className="ms-auto rounded-full bg-brand px-2 py-px text-[0.8rem] font-semibold text-white">{t.shell.newCount(newLeads)}</span>
    : null;
  if (mobile) {
    return (
      <nav aria-label={t.shell.navAria} className="-mx-4 mt-2 flex gap-1 overflow-x-auto px-4 pb-1">
        {GROUPS.flatMap((g) => g.items).map((i) => (
          <Link key={i.href} href={i.href} aria-current={active(i.href) ? "page" : undefined} className="a-nav whitespace-nowrap">
            {i.label}{badge(i.href)}
          </Link>
        ))}
      </nav>
    );
  }
  return (
    <nav aria-label={t.shell.navAria} className="flex flex-col gap-0.5 px-2.5 pb-3">
      {GROUPS.map((g) => (
        <div key={g.title} className="flex flex-col gap-0.5">
          <p className="px-3 pb-1.5 pt-[18px] text-[0.8rem] font-medium text-faint">{g.title}</p>
          {g.items.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} aria-current={active(href) ? "page" : undefined} className="a-nav">
              <Icon size={18} strokeWidth={1.7} aria-hidden /> {label}{badge(href)}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}

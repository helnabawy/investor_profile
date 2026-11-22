"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, Palette, FileText, Building2, HelpCircle, Bot, Inbox, MessagesSquare } from "lucide-react";

const GROUPS = [
  { title: "Your site", items: [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/projects", label: "Projects", icon: Building2 },
    { href: "/admin/pages", label: "Pages", icon: FileText },
    { href: "/admin/theme", label: "Template & theme", icon: Palette },
  ] },
  { title: "Concierge", items: [
    { href: "/admin/ai", label: "AI concierge", icon: Bot },
    { href: "/admin/knowledge", label: "FAQ & knowledge", icon: HelpCircle },
  ] },
  { title: "Buyers", items: [
    { href: "/admin/leads", label: "Leads", icon: Inbox },
    { href: "/admin/chats", label: "Conversations", icon: MessagesSquare },
  ] },
  { title: "Account", items: [
    { href: "/admin/settings", label: "Site settings", icon: Settings },
  ] },
];

/** `newLeads` puts a count on Leads so waiting buyers are visible from every screen. */
export function AdminNav({ mobile, newLeads = 0 }: { mobile?: boolean; newLeads?: number }) {
  const path = usePathname();
  const active = (href: string) => (href === "/admin" ? path === href : path.startsWith(href));
  const badge = (href: string) => href === "/admin/leads" && newLeads > 0
    ? <span className="ml-auto rounded-full bg-[#1e46b8] px-2 py-px text-[0.8rem] font-semibold text-white">{newLeads} new</span>
    : null;
  if (mobile) {
    return (
      <nav aria-label="Admin" className="-mx-4 mt-2 flex gap-1 overflow-x-auto px-4 pb-1">
        {GROUPS.flatMap((g) => g.items).map((i) => (
          <Link key={i.href} href={i.href} aria-current={active(i.href) ? "page" : undefined} className="a-nav whitespace-nowrap">
            {i.label}{badge(i.href)}
          </Link>
        ))}
      </nav>
    );
  }
  return (
    <nav aria-label="Admin" className="flex flex-col gap-0.5 px-2.5 pb-3">
      {GROUPS.map((g) => (
        <div key={g.title} className="flex flex-col gap-0.5">
          <p className="px-3 pb-1.5 pt-[18px] text-[0.8rem] font-medium text-[#6a7385]">{g.title}</p>
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

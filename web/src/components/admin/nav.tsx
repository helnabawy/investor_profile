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

export function AdminNav({ mobile }: { mobile?: boolean }) {
  const path = usePathname();
  const active = (href: string) => (href === "/admin" ? path === href : path.startsWith(href));
  if (mobile) {
    return (
      <nav aria-label="Admin" className="-mx-4 mt-2 flex gap-1 overflow-x-auto px-4 pb-1">
        {GROUPS.flatMap((g) => g.items).map((i) => (
          <Link key={i.href} href={i.href} aria-current={active(i.href) ? "page" : undefined}
            className={`inline-flex min-h-11 items-center whitespace-nowrap rounded-lg px-3 text-sm ${active(i.href) ? "bg-blue-50 font-semibold text-blue-900" : "text-slate-600"}`}>
            {i.label}
          </Link>
        ))}
      </nav>
    );
  }
  return (
    <nav aria-label="Admin" className="flex flex-col gap-0.5 p-3">
      {GROUPS.map((g) => (
        <div key={g.title} className="flex flex-col gap-0.5">
          <p className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-slate-500 first:pt-1">{g.title}</p>
          {g.items.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} aria-current={active(href) ? "page" : undefined}
              className={`flex min-h-11 items-center gap-2.5 rounded-lg px-3 text-[0.925rem] ${active(href) ? "bg-blue-50 font-semibold text-blue-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>
              <Icon size={17} aria-hidden /> {label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}

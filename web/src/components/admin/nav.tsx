"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, Palette, FileText, Building2, HelpCircle, Bot, Inbox, MessagesSquare } from "lucide-react";

const ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: Building2 },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  { href: "/admin/theme", label: "Theme", icon: Palette },
  { href: "/admin/ai", label: "AI concierge", icon: Bot },
  { href: "/admin/knowledge", label: "FAQ & knowledge", icon: HelpCircle },
  { href: "/admin/leads", label: "Leads", icon: Inbox },
  { href: "/admin/chats", label: "Conversations", icon: MessagesSquare },
  { href: "/admin/settings", label: "Site settings", icon: Settings },
];

export function AdminNav({ mobile }: { mobile?: boolean }) {
  const path = usePathname();
  const active = (href: string) => (href === "/admin" ? path === href : path.startsWith(href));
  if (mobile) {
    return (
      <nav className="-mx-4 mt-2 flex gap-1 overflow-x-auto px-4 pb-1">
        {ITEMS.map((i) => (
          <Link key={i.href} href={i.href} className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm ${active(i.href) ? "bg-teal-50 text-teal-800" : "text-slate-600"}`}>{i.label}</Link>
        ))}
      </nav>
    );
  }
  return (
    <nav className="flex flex-col gap-0.5 p-3">
      {ITEMS.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm ${active(href) ? "bg-teal-50 font-medium text-teal-800" : "text-slate-600 hover:bg-slate-100"}`}>
          <Icon size={16} /> {label}
        </Link>
      ))}
    </nav>
  );
}

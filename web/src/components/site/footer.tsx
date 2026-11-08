import Link from "next/link";
import type { Contact, NavItem } from "@/lib/types";

export function SiteFooter({ name, tagline, contact, nav, poweredBy }: { name: string; tagline: string | null; contact: Contact; nav: NavItem[]; poweredBy: boolean }) {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-3">
        <div>
          <p className="font-heading text-2xl">{name}</p>
          {tagline && <p className="mt-2 text-muted-foreground">{tagline}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <p className="eyebrow mb-2">Explore</p>
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="text-muted-foreground hover:text-primary">{n.label}</Link>
          ))}
        </div>
        <div className="flex flex-col gap-2 text-muted-foreground">
          <p className="eyebrow mb-2">Contact</p>
          {contact.phone && <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="hover:text-primary">{contact.phone}</a>}
          {contact.email && <a href={`mailto:${contact.email}`} className="hover:text-primary">{contact.email}</a>}
          {contact.address && <p>{contact.address}</p>}
          {contact.hours && <p>{contact.hours}</p>}
        </div>
      </div>
      <div className="border-t px-5 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {name}. All rights reserved.
        {poweredBy && <> · Powered by <a href={process.env.NEXT_PUBLIC_PLATFORM_URL ?? "#"} className="underline">EstateSite</a></>}
      </div>
    </footer>
  );
}

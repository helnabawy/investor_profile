import Link from "next/link";
import type { Contact, NavItem } from "@/lib/types";

export function SiteFooter({ name, tagline, contact, nav, poweredBy }: { name: string; tagline: string | null; contact: Contact; nav: NavItem[]; poweredBy: boolean }) {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-3">
        <div>
          <p className="font-heading text-xl font-bold">{name}</p>
          {tagline && <p className="mt-2 text-muted-foreground">{tagline}</p>}
        </div>
        <nav aria-label="Footer" className="flex flex-col">
          <p className="mb-2 text-sm font-semibold">Explore</p>
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="flex min-h-10 items-center text-muted-foreground hover:text-primary">{n.label}</Link>
          ))}
        </nav>
        <div className="flex flex-col text-muted-foreground">
          <p className="mb-2 text-sm font-semibold text-foreground">Contact</p>
          {contact.phone && <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="flex min-h-10 items-center hover:text-primary">{contact.phone}</a>}
          {contact.email && <a href={`mailto:${contact.email}`} className="flex min-h-10 items-center hover:text-primary">{contact.email}</a>}
          {contact.address && <p className="py-2">{contact.address}</p>}
          {contact.hours && <p className="py-2">{contact.hours}</p>}
        </div>
      </div>
      <div className="border-t px-5 py-5 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {name}
        {poweredBy && <> · Powered by <a href={process.env.NEXT_PUBLIC_PLATFORM_URL ?? "#"} className="underline">EstateSite</a></>}
      </div>
    </footer>
  );
}

import Link from "@/components/site/link";
import type { Contact, NavItem } from "@/lib/types";

/** Compact footer shared by the Horizon, Ledger, Atelier and Foyer templates. */
export function TemplateFooter({ name, tagline, contact, nav, poweredBy }: { name: string; tagline: string | null; contact: Contact; nav: NavItem[]; poweredBy: boolean }) {
  const details = [contact.address, contact.hours].filter(Boolean).join(" · ");
  return (
    <footer className="t-footer border-t">
      <div className="mx-auto flex max-w-[1240px] flex-wrap justify-between gap-x-16 gap-y-8 px-5 py-12 md:px-6">
        <div className="flex max-w-sm flex-col gap-1">
          <p className="font-heading text-xl">{name}</p>
          {tagline && <p className="text-muted-foreground">{tagline}</p>}
          {details && <p className="mt-2 text-[0.95rem] text-muted-foreground">{details}</p>}
        </div>
        <nav aria-label="Footer" className="flex flex-col">
          {nav.map((n) => <Link key={n.href} href={n.href} className="t-nav flex min-h-10 items-center">{n.label}</Link>)}
        </nav>
        <div className="flex flex-col">
          {contact.phone && <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="t-nav flex min-h-10 items-center tabular-nums">{contact.phone}</a>}
          {contact.email && <a href={`mailto:${contact.email}`} className="t-nav flex min-h-10 items-center [overflow-wrap:anywhere]">{contact.email}</a>}
        </div>
      </div>
      <div className="border-t px-5 py-5 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {name}
        {poweredBy && <> · Powered by <a href={process.env.NEXT_PUBLIC_PLATFORM_URL ?? "#"} className="underline">EstateInvestor</a></>}
      </div>
    </footer>
  );
}

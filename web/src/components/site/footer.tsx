import Link from "@/components/site/link";
import type { Contact, NavItem } from "@/lib/types";
import { siteT } from "@/lib/i18n/server";

export async function SiteFooter({ name, tagline, contact, nav, poweredBy }: { name: string; tagline: string | null; contact: Contact; nav: NavItem[]; poweredBy: boolean }) {
  const { t } = await siteT();
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-3">
        <div>
          <p className="font-heading text-xl font-bold">{name}</p>
          {tagline && <p className="mt-2 text-muted-foreground">{tagline}</p>}
        </div>
        <nav aria-label={t.common.footerNav} className="flex flex-col">
          <p className="mb-2 text-sm font-semibold">{t.common.explore}</p>
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="flex min-h-10 items-center text-muted-foreground hover:text-primary">{n.label}</Link>
          ))}
        </nav>
        <div className="flex flex-col text-muted-foreground">
          <p className="mb-2 text-sm font-semibold text-foreground">{t.common.contact}</p>
          {contact.phone && <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="flex min-h-10 items-center hover:text-primary"><bdi dir="ltr">{contact.phone}</bdi></a>}
          {contact.email && <a href={`mailto:${contact.email}`} className="flex min-h-10 items-center hover:text-primary"><bdi dir="ltr">{contact.email}</bdi></a>}
          {contact.address && <p className="py-2">{contact.address}</p>}
          {contact.hours && <p className="py-2">{contact.hours}</p>}
        </div>
      </div>
      <div className="border-t px-5 py-5 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {name}
        {poweredBy && <> · {t.common.poweredBy} <a href={process.env.NEXT_PUBLIC_PLATFORM_URL ?? "#"} className="underline">EstateInvestor</a></>}
      </div>
    </footer>
  );
}

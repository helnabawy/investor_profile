import type { Tenant } from "@/lib/types";
import { siteT } from "@/lib/i18n/server";

/** Quiet closing line for lounge inner pages (the sidebar already carries navigation and contact). */
export async function LoungeFooter({ tenant, poweredBy }: { tenant: Tenant; poweredBy: boolean }) {
  const { t } = await siteT();
  return (
    <footer className="font-ui mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t px-5 py-8 text-[0.8rem] text-muted-foreground">
      <span>© {new Date().getFullYear()} {tenant.name}{tenant.contact?.address ? ` · ${tenant.contact.address}` : ""}</span>
      {poweredBy && <span>{t.common.poweredBy} <a className="underline underline-offset-2" href={process.env.NEXT_PUBLIC_PLATFORM_URL ?? "#"}>EstateInvestor</a></span>}
    </footer>
  );
}

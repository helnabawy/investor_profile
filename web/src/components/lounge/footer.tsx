import type { Tenant } from "@/lib/types";

/** Quiet closing line for lounge inner pages (the sidebar already carries navigation and contact). */
export function LoungeFooter({ tenant, poweredBy }: { tenant: Tenant; poweredBy: boolean }) {
  return (
    <footer className="font-ui mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t px-5 py-8 text-[0.8rem] text-muted-foreground">
      <span>© {new Date().getFullYear()} {tenant.name}{tenant.contact?.address ? ` · ${tenant.contact.address}` : ""}</span>
      {poweredBy && <span>Powered by <a className="underline underline-offset-2" href={process.env.NEXT_PUBLIC_PLATFORM_URL ?? "#"}>EstateProfile</a></span>}
    </footer>
  );
}

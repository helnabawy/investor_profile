import Link from "next/link";

// EstateProfile logo: a house whose round window and arched door form a person (estate + profile).
// Platform surfaces only (landing, admin, auth). Tenant sites never use it as their own brand.

// One path, real cut-outs (evenodd), so the mark sits on any background.
export const LOGO_MARK_PATH =
  "M34.574 6.939 L56.574 25.439 A4 4 0 0 1 58 28.5 V54 A4 4 0 0 1 54 58 H44.5 V54 A12.5 12.5 0 0 0 19.5 54 V58 H10 A4 4 0 0 1 6 54 V28.5 A4 4 0 0 1 7.426 25.439 L29.426 6.939 A4 4 0 0 1 34.574 6.939 Z " +
  "M38.5 29.5 A6.5 6.5 0 1 0 25.5 29.5 A6.5 6.5 0 1 0 38.5 29.5 Z";

export function LogoMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden className={`shrink-0 text-[#1e46b8] ${className}`}>
      <path d={LOGO_MARK_PATH} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} aria-label="EstateProfile home" className="flex min-h-11 items-center gap-2 text-xl font-bold tracking-[-0.03em] text-slate-900">
      <LogoMark />
      <span>Estate<span className="font-normal">Profile</span></span>
    </Link>
  );
}

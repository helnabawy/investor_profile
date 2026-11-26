import Link from "next/link";

// EstateInvestor logo: a house with a rising arrow cut into it (property + growth).
// Platform surfaces only (landing, admin, auth). Tenant sites never use it as their own brand.

// One path, real cut-outs (evenodd), so the mark sits on any background.
export const LOGO_MARK_PATH =
  "M34.574 6.939 L56.574 25.439 A4 4 0 0 1 58 28.5 V54 A4 4 0 0 1 54 58 H10 A4 4 0 0 1 6 54 V28.5 A4 4 0 0 1 7.426 25.439 L29.426 6.939 A4 4 0 0 1 34.574 6.939 Z " +
  "M14 47.5 L25 36.5 L32 43.5 L42.6 32.9 L39.5 29.8 H50 V40.3 L46.9 37.2 L32 52.1 L25 45.1 L18.3 51.8 Z";

export function LogoMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden className={`shrink-0 text-brand-ink ${className}`}>
      <path d={LOGO_MARK_PATH} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} aria-label="EstateInvestor home" className="flex min-h-11 items-center gap-2 text-xl font-bold tracking-[-0.03em] text-ink">
      <LogoMark />
      <span>Estate<span className="font-normal">Investor</span></span>
    </Link>
  );
}

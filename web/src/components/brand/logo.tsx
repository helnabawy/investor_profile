import Link from "next/link";

// EstateProfile logo: a house shaped like a chat bubble (property + AI concierge).
// Platform surfaces only (landing, admin, auth). Tenant sites never use it as their own brand.

export function LogoMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden className={`shrink-0 text-[#1e46b8] ${className}`}>
      <path d="M32 8 L54 27 V46 H24 L10 57 V27 Z" fill="currentColor" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
      <circle cx="22" cy="36" r="3.4" fill="#fff" />
      <circle cx="32" cy="36" r="3.4" fill="#fff" />
      <circle cx="42" cy="36" r="3.4" fill="#fff" />
    </svg>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} aria-label="EstateProfile home" className="flex min-h-11 items-center gap-2 text-xl font-bold tracking-[-0.035em] text-slate-900">
      <LogoMark />
      <span>Estate<span className="text-[#1e46b8]">Profile</span></span>
    </Link>
  );
}

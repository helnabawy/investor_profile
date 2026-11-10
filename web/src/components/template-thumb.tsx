import type { Template } from "@/lib/templates";

/** Schematic of each template so the choice is visual, not just words. */
export function TemplateThumb({ kind, className = "border-b" }: { kind: Template["id"]; className?: string }) {
  return (
    <svg viewBox="0 0 320 170" className={`block h-auto w-full bg-slate-100 ${className}`} aria-hidden>
      {kind === "lounge" ? (
        <>
          <rect width="320" height="170" fill="#14110c" />
          <rect x="8" y="8" width="70" height="154" rx="6" fill="#f1eadb" />
          <text x="43" y="60" textAnchor="middle" fontFamily="Georgia, serif" fontSize="18" fill="#8a6a2a">AE</text>
          {[90, 104, 118].map((y) => <rect key={y} x="22" y={y} width="42" height="4" rx="2" fill="#b9ae96" />)}
          <rect x="86" y="8" width="226" height="154" rx="6" fill="#3a3222" />
          <circle cx="199" cy="52" r="13" fill="#4a3c1d" />
          <rect x="150" y="76" width="98" height="9" rx="3" fill="#f5f3ee" />
          <rect x="128" y="126" width="142" height="22" rx="6" fill="none" stroke="#6b6252" />
        </>
      ) : (
        <>
          <rect width="320" height="170" fill="#f5f7f6" />
          <rect width="320" height="26" fill="#ffffff" />
          <rect x="12" y="8" width="11" height="11" rx="3" fill="#0b5d4b" />
          <rect x="28" y="11" width="52" height="5" rx="2" fill="#0e1f1b" />
          <rect x="268" y="7" width="40" height="13" rx="4" fill="#0b5d4b" />
          <rect x="16" y="42" width="130" height="9" rx="3" fill="#0e1f1b" />
          <rect x="16" y="56" width="100" height="9" rx="3" fill="#0e1f1b" />
          <rect x="16" y="74" width="140" height="24" rx="6" fill="#ffffff" stroke="#dde4e1" />
          <rect x="172" y="38" width="132" height="64" rx="8" fill="#9cc5b7" />
          {[16, 117, 218].map((x) => (
            <g key={x}><rect x={x} y="114" width="86" height="46" rx="6" fill="#ffffff" stroke="#dde4e1" /><rect x={x + 8} y="146" width="40" height="5" rx="2" fill="#0b5d4b" /></g>
          ))}
        </>
      )}
    </svg>
  );
}

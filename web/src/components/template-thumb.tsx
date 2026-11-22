import type { Template } from "@/lib/templates";

/** Schematic of each template so the choice is visual, not just words. */
export function TemplateThumb({ kind, className = "border-b" }: { kind: Template["id"]; className?: string }) {
  return (
    <svg viewBox="0 0 320 170" className={`block h-auto w-full bg-slate-100 ${className}`} aria-hidden>
      {kind === "horizon" ? (
        <>
          <rect width="320" height="170" fill="#ffffff" />
          <rect x="14" y="10" width="46" height="6" rx="3" fill="#0e1f1b" />
          <rect x="264" y="6" width="42" height="14" rx="7" fill="#0b5d4b" />
          <rect x="92" y="32" width="136" height="9" rx="3" fill="#0e1f1b" />
          <rect x="112" y="46" width="96" height="9" rx="3" fill="#0e1f1b" />
          <rect x="96" y="64" width="128" height="18" rx="9" fill="#ffffff" stroke="#c9d6d1" />
          <rect x="196" y="67" width="24" height="12" rx="6" fill="#0b5d4b" />
          <rect x="14" y="94" width="292" height="66" rx="12" fill="#9cc5b7" />
        </>
      ) : kind === "ledger" ? (
        <>
          <rect width="320" height="170" fill="#f4f6fa" />
          <rect width="320" height="62" fill="#ffffff" />
          <rect x="14" y="10" width="48" height="6" rx="3" fill="#101828" />
          <rect x="268" y="6" width="38" height="14" rx="3" fill="#1c3a6e" />
          <rect x="14" y="32" width="120" height="8" rx="3" fill="#101828" />
          <rect x="14" y="44" width="88" height="8" rx="3" fill="#101828" />
          <rect x="186" y="36" width="84" height="16" rx="3" fill="#ffffff" stroke="#98a2b3" />
          <rect x="274" y="36" width="32" height="16" rx="3" fill="#1c3a6e" />
          <rect x="14" y="74" width="292" height="86" rx="6" fill="#ffffff" stroke="#dfe3ea" />
          {[96, 118, 140].map((y) => (
            <g key={y}>
              <line x1="14" x2="306" y1={y - 8} y2={y - 8} stroke="#dfe3ea" />
              <rect x="24" y={y - 4} width="20" height="12" rx="2" fill="#b9c4d6" />
              <rect x="52" y={y} width="74" height="5" rx="2" fill="#101828" />
              <rect x="170" y={y} width="34" height="5" rx="2" fill="#1c3a6e" />
              <rect x="226" y={y} width="24" height="5" rx="2" fill="#98a2b3" />
              <rect x="266" y={y} width="24" height="5" rx="2" fill="#98a2b3" />
            </g>
          ))}
        </>
      ) : kind === "atelier" ? (
        <>
          <rect width="320" height="170" fill="#f7f1e8" />
          <text x="16" y="20" fontFamily="Georgia, serif" fontSize="11" fill="#2b2118">Atelier</text>
          {[236, 262, 288].map((x) => <rect key={x} x={x} y="13" width="18" height="4" rx="2" fill="#7a6a58" />)}
          <rect x="16" y="50" width="112" height="8" rx="2" fill="#2b2118" />
          <rect x="16" y="64" width="92" height="8" rx="2" fill="#2b2118" />
          <rect x="16" y="78" width="60" height="8" rx="2" fill="#a0522d" />
          <line x1="16" x2="132" y1="112" y2="112" stroke="#2b2118" />
          <rect x="16" y="102" width="62" height="4" rx="2" fill="#7a6a58" />
          <rect x="170" y="32" width="134" height="126" rx="1" fill="#d4a373" />
        </>
      ) : kind === "foyer" ? (
        <>
          <rect width="320" height="170" fill="#fafaf9" />
          <rect x="150" width="170" height="170" fill="#78716c" />
          <rect x="14" y="12" width="44" height="6" rx="3" fill="#1c1917" />
          <rect x="14" y="58" width="104" height="9" rx="3" fill="#1c1917" />
          <rect x="14" y="72" width="82" height="9" rx="3" fill="#1c1917" />
          <rect x="14" y="96" width="86" height="16" rx="4" fill="#ffffff" stroke="#a8a29e" />
          <rect x="104" y="96" width="28" height="16" rx="4" fill="#1c1917" />
          <rect x="178" y="62" width="130" height="98" rx="8" fill="#ffffff" />
          <rect x="186" y="70" width="34" height="11" rx="5.5" fill="#1c1917" />
          <rect x="226" y="73" width="26" height="5" rx="2" fill="#a8a29e" />
          <rect x="258" y="73" width="26" height="5" rx="2" fill="#a8a29e" />
          {[92, 114, 136].map((y) => (
            <g key={y}>
              <line x1="186" x2="300" y1={y - 4} y2={y - 4} stroke="#e7e5e4" />
              <rect x="186" y={y} width="16" height="12" rx="2" fill="#d6d3d1" />
              <rect x="208" y={y + 3} width="50" height="5" rx="2" fill="#1c1917" />
              <rect x="276" y={y + 3} width="24" height="5" rx="2" fill="#1c1917" />
            </g>
          ))}
        </>
      ) : kind === "lounge" ? (
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

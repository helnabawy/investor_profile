/**
 * Seams between landing-page sections, taken from the logo (a house shaped like a chat bubble).
 * `RoofEdge` sits directly above a section and gives it a shallow roof peak, with an optional thin
 * line echoing the roofline and the logo's three dots under the peak. `TailEdge` sits directly below a section and gives it the bubble's
 * tail, aligned to the page's left content edge. Both rise into place when scrolled into view.
 */

const H = 68; // px, height of the roof seam
const GAP = 14; // px between the roof and its echo line

export function RoofEdge({ color, line, dots, invert, ground, className = "" }: {
  color: string; line?: string; dots?: string;
  /** Point down instead of up: `color` is then the section above, hanging into `ground`, the section below. */
  invert?: boolean; ground?: string; className?: string;
}) {
  // The flat side overshoots by 2px so no hairline of the other colour shows along it.
  const shape = invert ? `0,-2 50,${H - GAP} 100,-2` : `0,${H + 2} 50,${GAP} 100,${H + 2}`;
  const echo = invert ? `0,${GAP} 50,${H - 1} 100,${GAP}` : `0,${H - GAP} 50,1 100,${H - GAP}`;
  return (
    <div aria-hidden data-reveal style={ground ? { background: ground } : undefined}
      className={`sky-edge pointer-events-none relative z-[1] overflow-hidden leading-[0] ${invert ? "-mt-px" : "-mb-px"} ${className}`}>
      <svg width="100%" height={H} viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" className="block">
        <g className={`sky-rise ${invert ? "tail-rise" : ""}`}>
          <polygon points={shape} fill={color} />
        </g>
      </svg>
      {/* The echo line is its own layer so it can be wiped in from the peak outward. */}
      {line && (
        <svg width="100%" height={H} viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" className="roof-line absolute inset-0">
          <polyline points={echo} fill="none" stroke={line} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>
      )}
      {/* The logo's three dots, tucked inside the peak. Real elements, so they stay round at any width. */}
      {dots && (
        <span className={`roof-dots absolute left-1/2 flex -translate-x-1/2 gap-[7px] ${invert ? "top-[9px]" : "bottom-[9px]"}`}>
          {[0, 1, 2].map((i) => <span key={i} style={{ background: dots, "--i": i } as React.CSSProperties} />)}
        </span>
      )}
    </div>
  );
}

export function TailEdge({ color, className = "" }: { color: string; className?: string }) {
  return (
    <div aria-hidden data-reveal className={`sky-edge pointer-events-none relative z-[1] -mt-px leading-[0] ${className}`}>
      <div className="mx-auto max-w-[1240px] px-6">
        <svg width="56" height="38" viewBox="0 0 56 38" className="block">
          <g className="sky-rise tail-rise"><path d="M0 0H56L9 38Z" fill={color} /></g>
        </svg>
      </div>
    </div>
  );
}

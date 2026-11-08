/** Full-bleed photographic ground: desaturated, softened and tinted toward the theme so any photo sits in the brand. */
export function Backdrop({ src, fixed = false, className = "" }: { src?: string; fixed?: boolean; className?: string }) {
  return (
    <div aria-hidden className={`${fixed ? "fixed" : "absolute"} inset-0 -z-10 overflow-hidden bg-[var(--lounge-ink)] ${className}`}>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="lounge-backdrop-img absolute inset-0 h-full w-full object-cover" />
      )}
      <div className="lounge-backdrop-tint absolute inset-0" />
    </div>
  );
}

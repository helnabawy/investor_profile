import Link from "next/link";
import type { Project } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { MapPin, BedDouble, CalendarClock } from "lucide-react";

export function ProjectCard({ p }: { p: Project }) {
  return (
    <Link href={`/projects/${p.id}`} className="group block overflow-hidden rounded-[var(--radius)] border bg-card transition hover:border-primary">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {p.images[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.images[0]} alt={p.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        )}
        <span className="card-ui absolute left-3 top-3 rounded-[var(--radius)] bg-background/90 px-2.5 py-1 text-[0.7rem] uppercase tracking-[0.12em]">
          {p.status === "off-plan" ? "Off-plan" : p.status === "ready" ? "Ready" : "Sold out"}
        </span>
      </div>
      <div className="p-5">
        <h3 className="text-xl">{p.title}</h3>
        {p.developer && <p className="card-ui mt-1 text-sm text-muted-foreground">{p.developer}</p>}
        <div className="card-ui mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {p.area && <span className="inline-flex items-center gap-1"><MapPin size={14} />{p.area}</span>}
          {p.bedrooms && <span className="inline-flex items-center gap-1"><BedDouble size={14} />{p.bedrooms} BR</span>}
          {p.handover && <span className="inline-flex items-center gap-1"><CalendarClock size={14} />{p.handover}</span>}
        </div>
        <p className="card-ui mt-4 text-lg text-primary">From {formatPrice(p.price_from, p.currency)}</p>
      </div>
    </Link>
  );
}

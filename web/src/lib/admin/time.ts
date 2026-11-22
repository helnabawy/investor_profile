/** "12 min ago", "3 hours ago", "Yesterday, 18:40", then "18 Nov". For admin lists; server-rendered per request. */
export function timeAgo(iso: string, now = Date.now()) {
  const d = new Date(iso);
  const mins = Math.round((now - d.getTime()) / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  if (hours < 48) return `Yesterday, ${time}`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

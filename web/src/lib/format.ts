export function formatPrice(value: number | null | undefined, currency = "AED") {
  if (value == null) return "Price on request";
  const n = Number(value);
  const short =
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 2).replace(/\.?0+$/, "")}M` :
    n >= 1_000 ? `${Math.round(n / 1_000)}K` : String(n);
  return `${currency} ${short}`;
}

/** Full figure for detail pages: "AED 1,450,000". */
export function formatFullPrice(value: number | null | undefined, currency = "AED") {
  if (value == null) return "Price on request";
  return `${currency} ${Number(value).toLocaleString("en-US")}`;
}

export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

export function whatsappLink(number: string | undefined, text?: string) {
  if (!number) return null;
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

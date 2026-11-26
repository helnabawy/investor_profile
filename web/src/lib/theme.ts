// Tenant theming. A tenant stores { preset, ...overrides } in tenants.theme;
// we merge the preset with overrides and emit CSS custom properties.

export type ThemeTokens = {
  background: string;
  foreground: string;
  card: string;
  muted: string;
  mutedForeground: string;
  border: string;
  primary: string;
  primaryForeground: string;
  accent: string;
  headingFont: string;
  bodyFont: string;
  radius: string; // e.g. "0.25rem"
};

export const SITE_LAYOUTS = ["classic", "lounge", "horizon", "ledger", "atelier", "foyer"] as const;
export type SiteLayout = (typeof SITE_LAYOUTS)[number];

export type ThemeConfig = Partial<ThemeTokens> & {
  preset?: PresetId;
  logoUrl?: string;
  faviconUrl?: string;
  /** Which template lays the site out; see src/lib/templates.ts. Unknown values fall back to "classic". */
  layout?: SiteLayout;
  /** Lounge: advisor portrait shown as the avatar on the chat home. */
  portraitUrl?: string;
  /** Lounge: full-bleed photo behind the chat home and page headers (blurred + tinted). */
  backdropUrl?: string;
  /** Lounge: sidebar call-to-action. */
  ctaLabel?: string;
  ctaLabel_ar?: string;
  /** Typeface for Arabic text on the Arabic site; Latin text keeps the heading and body fonts. */
  fontArabic?: ArabicFont;
  ctaHref?: string;
};

export function siteLayout(config: ThemeConfig | null | undefined): SiteLayout {
  return (SITE_LAYOUTS as readonly string[]).includes(config?.layout ?? "") ? (config!.layout as SiteLayout) : "classic";
}

export const FONTS = [
  "Playfair Display",
  "Cormorant Garamond",
  "DM Serif Display",
  "Libre Baskerville",
  "Inter",
  "Manrope",
  "Plus Jakarta Sans",
  "Outfit",
  "Montserrat",
  "Poppins",
  "Lato",
  "Cairo", // Arabic-friendly
  "Tajawal", // Arabic-friendly
] as const;

// Google Fonts css2 rejects weights a family doesn't ship, so list them per family.
const FONT_WEIGHTS: Record<string, string> = {
  "DM Serif Display": "",
  "Libre Baskerville": ":wght@400;700",
  Tajawal: ":wght@400;500;700",
};

export const PRESETS = {
  "calm-green": {
    label: "Calm Green",
    tokens: {
      background: "#f5f7f6",
      foreground: "#0e1f1b",
      card: "#ffffff",
      muted: "#e3efea",
      mutedForeground: "#44544f",
      border: "#dde4e1",
      primary: "#0b5d4b",
      primaryForeground: "#ffffff",
      accent: "#0b5d4b",
      headingFont: "Plus Jakarta Sans",
      bodyFont: "Inter",
      radius: "0.75rem",
    },
  },
  "classic-navy": {
    label: "Classic Navy",
    tokens: {
      background: "#f4f6fa",
      foreground: "#101828",
      card: "#ffffff",
      muted: "#e6ebf4",
      mutedForeground: "#475467",
      border: "#dfe3ea",
      primary: "#1c3a6e",
      primaryForeground: "#ffffff",
      accent: "#1c3a6e",
      headingFont: "Plus Jakarta Sans",
      bodyFont: "Inter",
      radius: "0.75rem",
    },
  },
  "luxury-gold": {
    label: "Luxury Gold",
    tokens: {
      background: "#0e0d0b",
      foreground: "#f3eee5",
      card: "#17150f",
      muted: "#1f1c16",
      mutedForeground: "#b3a991",
      border: "#2f2a20",
      primary: "#c9a54c",
      primaryForeground: "#14110a",
      accent: "#e8d9b0",
      headingFont: "Playfair Display",
      bodyFont: "Cormorant Garamond",
      radius: "0.125rem",
    },
  },
  modern: {
    label: "Modern",
    tokens: {
      background: "#ffffff",
      foreground: "#0f172a",
      card: "#f8fafc",
      muted: "#f1f5f9",
      mutedForeground: "#64748b",
      border: "#e2e8f0",
      primary: "#0f766e",
      primaryForeground: "#ffffff",
      accent: "#14b8a6",
      headingFont: "Plus Jakarta Sans",
      bodyFont: "Inter",
      radius: "0.75rem",
    },
  },
  minimal: {
    label: "Minimal",
    tokens: {
      background: "#fafaf9",
      foreground: "#1c1917",
      card: "#ffffff",
      muted: "#f5f5f4",
      mutedForeground: "#78716c",
      border: "#e7e5e4",
      primary: "#1c1917",
      primaryForeground: "#fafaf9",
      accent: "#a8a29e",
      headingFont: "DM Serif Display",
      bodyFont: "Manrope",
      radius: "0rem",
    },
  },
  "desert-sand": {
    label: "Desert Sand",
    tokens: {
      background: "#f7f1e8",
      foreground: "#2b2118",
      card: "#fffaf3",
      muted: "#efe5d6",
      mutedForeground: "#7a6a58",
      border: "#e2d4bf",
      primary: "#a0522d",
      primaryForeground: "#fffaf3",
      accent: "#d4a373",
      headingFont: "Libre Baskerville",
      bodyFont: "Outfit",
      radius: "0.5rem",
    },
  },
} satisfies Record<string, { label: string; tokens: ThemeTokens }>;

export type PresetId = keyof typeof PRESETS;

export function resolveTheme(config: ThemeConfig | null | undefined): ThemeTokens {
  // Object.hasOwn, not a plain lookup: a stored value like "toString" must not resolve to a prototype member.
  const id = config?.preset && Object.hasOwn(PRESETS, config.preset) ? (config.preset as PresetId) : "luxury-gold";
  const preset = PRESETS[id];
  const out: ThemeTokens = { ...preset.tokens };
  for (const key of Object.keys(out) as (keyof ThemeTokens)[]) {
    const v = config?.[key];
    if (typeof v === "string" && v.trim()) out[key] = sanitizeCssValue(v);
  }
  return out;
}

// Theme values are injected into a <style> tag, so reject anything that could break out of it.
function sanitizeCssValue(v: string) {
  return v.replace(/[<>{};"\\]/g, "").slice(0, 80);
}

/** Arabic typefaces on Google Fonts, with the weights each one ships. */
export const ARABIC_FONTS = {
  "IBM Plex Sans Arabic": ":wght@400;500;600;700",
  "Noto Kufi Arabic": ":wght@400;500;600;700",
  "Readex Pro": ":wght@400;500;600;700",
  Cairo: ":wght@400;500;600;700",
  Tajawal: ":wght@400;500;700",
  "Noto Naskh Arabic": ":wght@400;500;600;700",
  Amiri: ":wght@400;700",
} as const;
export type ArabicFont = keyof typeof ARABIC_FONTS;
export const DEFAULT_ARABIC_FONT: ArabicFont = "IBM Plex Sans Arabic";

export function arabicFont(config: ThemeConfig | null | undefined): ArabicFont {
  const f = config?.fontArabic;
  return f && Object.hasOwn(ARABIC_FONTS, f) ? f : DEFAULT_ARABIC_FONT;
}

/**
 * CSS variables for the theme. On the Arabic site the Arabic face follows each Latin one: the Latin
 * fonts are loaded with Latin glyphs only, so English words keep the brand fonts and Arabic falls
 * through to the Arabic face.
 */
export function themeCss(t: ThemeTokens, locale: "en" | "ar" = "en", arabic: ArabicFont = DEFAULT_ARABIC_FONT) {
  const ar = locale === "ar" ? `"${arabic}",` : "";
  const ui = locale === "ar" ? `.lounge{--font-ui:"Hanken Grotesk",${ar}ui-sans-serif,system-ui,sans-serif;}` : "";
  return `:root{--background:${t.background};--foreground:${t.foreground};--card:${t.card};--muted:${t.muted};--muted-foreground:${t.mutedForeground};--border:${t.border};--primary:${t.primary};--primary-foreground:${t.primaryForeground};--accent:${t.accent};--radius:${t.radius};--font-heading:"${t.headingFont}",${ar}Georgia,serif;--font-body:"${t.bodyFont}",${ar}system-ui,sans-serif;}${ui}`;
}

export function googleFontsHref(t: ThemeTokens, locale: "en" | "ar" = "en", arabic: ArabicFont = DEFAULT_ARABIC_FONT) {
  const fams = Array.from(new Set([t.headingFont, t.bodyFont]))
    .filter((f) => (FONTS as readonly string[]).includes(f))
    .map((f) => `family=${f.replace(/ /g, "+")}${FONT_WEIGHTS[f] ?? ":wght@400;500;600;700"}`);
  if (locale === "ar" && ![t.headingFont, t.bodyFont].includes(arabic)) fams.push(`family=${arabic.replace(/ /g, "+")}${ARABIC_FONTS[arabic]}`);
  return fams.length ? `https://fonts.googleapis.com/css2?${fams.join("&")}&display=swap` : null;
}

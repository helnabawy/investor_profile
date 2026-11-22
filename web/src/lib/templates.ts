import type { PresetId, SiteLayout } from "./theme";

// A template is the whole structure of an agent's site (navigation, home page, page shapes).
// Colours and fonts are a separate choice (presets), so any template can wear any preset.
// The id is the value stored in tenants.theme.layout.

export type Template = {
  id: SiteLayout;
  name: string;
  tier: "free" | "premium";
  description: string;
  tags: string[];
  /** Preset applied when an agent switches to this template from the gallery. */
  preset: PresetId;
  /** Premium only: display price, e.g. "$49 one-time". Not charged anywhere yet (no billing). */
  price?: string;
};

export const TEMPLATES: Template[] = [
  {
    id: "classic",
    name: "Classic",
    tier: "free",
    description: "Light and clear. Top navigation, key numbers on every project card, and the concierge box in the hero.",
    tags: ["Light", "Top navigation", "Numbers first"],
    preset: "calm-green",
  },
  {
    id: "lounge",
    name: "Lounge",
    tier: "free",
    description: "Dark and private. Side navigation, a full-screen backdrop photo, and the concierge chat as the home page.",
    tags: ["Dark", "Chat-first", "Side navigation"],
    preset: "luxury-gold",
  },
  {
    id: "horizon",
    name: "Horizon",
    tier: "free",
    description: "Airy and image-led. A centred headline and question box, one wide photo, then your featured projects as cards.",
    tags: ["Light", "Image-led", "Rounded"],
    preset: "calm-green",
  },
  {
    id: "ledger",
    name: "Ledger",
    tier: "free",
    description: "Numbers first, no big photo. Your portfolio is a table with price, handover, payment plan and yield side by side.",
    tags: ["Light", "Table of projects", "Square"],
    preset: "classic-navy",
  },
  {
    id: "atelier",
    name: "Atelier",
    tier: "free",
    description: "Editorial and unhurried. A serif headline beside a tall photo, then one project per row with a large image.",
    tags: ["Warm", "Editorial", "Large photos"],
    preset: "desert-sand",
  },
  {
    id: "foyer",
    name: "Foyer",
    tier: "free",
    description: "Your whole home page on one screen, with nothing to scroll on a laptop. Projects, questions and contact sit in one panel.",
    tags: ["One screen", "Minimal", "Tabbed panel"],
    preset: "minimal",
  },
  // Premium templates go here with tier: "premium" and a price. They need their own layout
  // (a new SiteLayout value rendered in src/app/s/[site]/layout.tsx) before they can be listed.
];

/** Gallery order: premium first, then free. */
export function galleryTemplates() {
  return [...TEMPLATES].sort((a, b) => (a.tier === b.tier ? 0 : a.tier === "premium" ? -1 : 1));
}

export function templateFor(id: string | undefined) {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

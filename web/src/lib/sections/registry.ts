// Block-based page builder. Each section type declares its editable fields;
// the admin builds forms from `fields`, the site renders via components/sections.

export type FieldType = "text" | "textarea" | "image" | "url" | "number" | "select" | "list" | "images";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  options?: string[]; // select
  itemFields?: Field[]; // list
  placeholder?: string;
};

export type SectionDef = {
  type: string;
  label: string;
  description: string;
  fields: Field[];
  defaults: Record<string, unknown>;
};

export type Section = { id: string; type: string; props: Record<string, unknown> };

const cta = (prefix = ""): Field[] => [
  { name: `${prefix}ctaLabel`, label: "Button label", type: "text" },
  { name: `${prefix}ctaHref`, label: "Button link", type: "url", placeholder: "/projects or https://… or #chat" },
];

export const SECTION_DEFS: SectionDef[] = [
  {
    type: "page-header",
    label: "Page header",
    description: "Centered title over your backdrop photo (Lounge layout)",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "accent", label: "Highlighted word(s) at the end", type: "text", placeholder: "e.g. Touch" },
      { name: "subtitle", label: "Subtitle", type: "textarea" },
      { name: "image", label: "Background image (optional — defaults to site backdrop)", type: "image" },
    ],
    defaults: { title: "Page title", subtitle: "" },
  },
  {
    type: "story",
    label: "Story chapters",
    description: "Numbered chapters, each a large photo panel with text",
    fields: [
      { name: "items", label: "Chapters", type: "list", itemFields: [
        { name: "title", label: "Title", type: "text" },
        { name: "body", label: "Text", type: "textarea" },
        { name: "image", label: "Photo", type: "image" },
      ] },
    ],
    defaults: { items: [{ title: "Chapter title", body: "" }] },
  },
  {
    type: "hero",
    label: "Hero",
    description: "Full-width banner with headline and buttons",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Headline", type: "text" },
      { name: "subtitle", label: "Subtitle", type: "textarea" },
      { name: "image", label: "Background image", type: "image" },
      ...cta(),
      { name: "secondaryLabel", label: "Secondary button label", type: "text" },
      { name: "secondaryHref", label: "Secondary button link", type: "url" },
    ],
    defaults: { title: "Your headline", subtitle: "", ctaLabel: "Explore", ctaHref: "/projects" },
  },
  {
    type: "stats",
    label: "Stats bar",
    description: "Row of key numbers",
    fields: [
      { name: "items", label: "Stats", type: "list", itemFields: [
        { name: "value", label: "Value", type: "text" },
        { name: "label", label: "Label", type: "text" },
      ] },
    ],
    defaults: { items: [{ value: "100+", label: "Happy clients" }] },
  },
  {
    type: "about",
    label: "About",
    description: "Text with image and bullet points",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "body", label: "Body", type: "textarea" },
      { name: "image", label: "Image", type: "image" },
      { name: "bullets", label: "Bullet points", type: "list", itemFields: [{ name: "text", label: "Text", type: "text" }] },
    ],
    defaults: { title: "About us", body: "" },
  },
  {
    type: "featured-projects",
    label: "Featured projects",
    description: "Projects marked as featured",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "subtitle", label: "Subtitle", type: "text" },
      { name: "limit", label: "How many", type: "number" },
    ],
    defaults: { title: "Featured projects", limit: 3 },
  },
  {
    type: "project-grid",
    label: "All projects",
    description: "Filterable grid of all published projects",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "subtitle", label: "Subtitle", type: "text" },
    ],
    defaults: { title: "Our portfolio" },
  },
  {
    type: "features",
    label: "Features / why us",
    description: "Grid of value propositions",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "items", label: "Items", type: "list", itemFields: [
        { name: "title", label: "Title", type: "text" },
        { name: "body", label: "Text", type: "textarea" },
      ] },
    ],
    defaults: { title: "Why work with us", items: [] },
  },
  {
    type: "testimonials",
    label: "Testimonials",
    description: "Client quotes",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "items", label: "Quotes", type: "list", itemFields: [
        { name: "quote", label: "Quote", type: "textarea" },
        { name: "author", label: "Author", type: "text" },
        { name: "role", label: "Role / location", type: "text" },
      ] },
    ],
    defaults: { title: "What clients say", items: [] },
  },
  {
    type: "gallery",
    label: "Gallery",
    description: "Image grid",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "images", label: "Images", type: "images" },
    ],
    defaults: { title: "Gallery", images: [] },
  },
  {
    type: "cta",
    label: "Call to action",
    description: "Highlighted banner with a button",
    fields: [{ name: "title", label: "Title", type: "text" }, { name: "body", label: "Text", type: "textarea" }, ...cta()],
    defaults: { title: "Ready to invest?", ctaLabel: "Contact us", ctaHref: "/contact" },
  },
  {
    type: "chat-cta",
    label: "Chat prompt",
    description: "Banner that opens the AI concierge",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "body", label: "Text", type: "textarea" },
      { name: "buttonLabel", label: "Button label", type: "text" },
    ],
    defaults: { title: "Questions?", body: "Ask our AI concierge.", buttonLabel: "Start chatting" },
  },
  {
    type: "faq",
    label: "FAQ",
    description: "Shows your published FAQs",
    fields: [{ name: "title", label: "Title", type: "text" }],
    defaults: { title: "Frequently asked questions" },
  },
  {
    type: "contact",
    label: "Contact form",
    description: "Lead form plus your contact details",
    fields: [{ name: "title", label: "Title", type: "text" }, { name: "subtitle", label: "Subtitle", type: "textarea" }],
    defaults: { title: "Get in touch" },
  },
  {
    type: "map",
    label: "Map",
    description: "Embedded Google map",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "query", label: "Address or place to show", type: "text" },
    ],
    defaults: { title: "Find us", query: "" },
  },
];

export const SECTION_MAP = Object.fromEntries(SECTION_DEFS.map((d) => [d.type, d]));

export function newSection(type: string): Section {
  const def = SECTION_MAP[type];
  return { id: Math.random().toString(36).slice(2, 10), type, props: structuredClone(def?.defaults ?? {}) };
}

// Block-based page builder. Each section type declares its editable fields;
// the admin builds forms from `fields`, the site renders via components/sections.

import type { Locale } from "../i18n/locales";
import { localize } from "../i18n/content";

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
    defaults: { title: "Page title", title_ar: "عنوان الصفحة", subtitle: "" },
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
    defaults: { items: [{ title: "Chapter title", title_ar: "عنوان الفصل", body: "" }] },
  },
  {
    type: "hero-split",
    label: "Hero with concierge",
    description: "Headline and an ask-the-concierge box beside a photo with your top featured project",
    fields: [
      { name: "eyebrow", label: "Small line above the headline", type: "text" },
      { name: "title", label: "Headline", type: "text" },
      { name: "subtitle", label: "Subtitle", type: "textarea" },
      { name: "image", label: "Photo", type: "image" },
      { name: "askPlaceholder", label: "Question box placeholder", type: "text", placeholder: "e.g. What can I buy for AED 1.5M with a payment plan?" },
    ],
    defaults: {
      title: "Invest with clear numbers and one advisor you can reach", title_ar: "استثمر بأرقام واضحة ومستشار واحد يمكنك الوصول إليه",
      subtitle: "", askPlaceholder: "Ask about projects, prices or payment plans", askPlaceholder_ar: "اسأل عن المشاريع أو الأسعار أو خطط الدفع",
    },
  },
  {
    type: "quick-links",
    label: "Quick links",
    description: "Three large shortcuts so visitors find their way in one tap",
    fields: [
      { name: "items", label: "Links", type: "list", itemFields: [
        { name: "title", label: "Title", type: "text" },
        { name: "body", label: "Short description", type: "text" },
        { name: "href", label: "Link", type: "url", placeholder: "/projects, /contact or #chat" },
        { name: "icon", label: "Icon", type: "select", options: ["building", "chart", "person", "chat"] },
      ] },
    ],
    defaults: { items: [
      { title: "Browse projects", title_ar: "تصفّح المشاريع", body: "Filter by area, status and budget", body_ar: "صنّف حسب المنطقة والحالة والميزانية", href: "/projects", icon: "building" },
      { title: "Ask the concierge", title_ar: "اسأل المساعد", body: "Prices, payment plans and fees, answered now", body_ar: "الأسعار وخطط الدفع والرسوم، بإجابة فورية", href: "#chat", icon: "chat" },
      { title: "Speak to an advisor", title_ar: "تحدّث إلى مستشار", body: "Call, WhatsApp or book a consultation", body_ar: "اتصال أو واتساب أو احجز استشارة", href: "/contact", icon: "person" },
    ] },
  },
  {
    type: "steps",
    label: "How we work",
    description: "Numbered steps beside a photo",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "subtitle", label: "Subtitle", type: "textarea" },
      { name: "image", label: "Photo", type: "image" },
      { name: "items", label: "Steps", type: "list", itemFields: [
        { name: "title", label: "Title", type: "text" },
        { name: "body", label: "Text", type: "textarea" },
      ] },
    ],
    defaults: { title: "From first shortlist to handover", title_ar: "من القائمة الأولى حتى التسليم", items: [
      { title: "Tell us your goals", title_ar: "أخبرنا بأهدافك", body: "Capital growth, rental yield or a home for the family. Share your budget and timeline.", body_ar: "نمو رأس المال أو العائد الإيجاري أو منزل للعائلة. شاركنا ميزانيتك وإطارك الزمني." },
      { title: "Get a shortlist with honest numbers", title_ar: "احصل على قائمة مختصرة بأرقام صادقة", body: "Each project comes with a full cost sheet: price, fees, payment plan and expected yield.", body_ar: "يأتي كل مشروع ببيان تكاليف كامل: السعر والرسوم وخطة الدفع والعائد المتوقع." },
      { title: "View, reserve and hand over", title_ar: "المعاينة والحجز والتسليم", body: "We arrange viewings, guide you through reservation, and help with leasing or resale.", body_ar: "ننظّم المعاينات، ونرشدك خلال الحجز، ونساعدك في التأجير أو إعادة البيع." },
    ] },
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
    defaults: { title: "Your headline", title_ar: "عنوانك الرئيسي", subtitle: "", ctaLabel: "Explore", ctaLabel_ar: "استكشف", ctaHref: "/projects" },
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
    defaults: { items: [{ value: "100+", label: "Happy clients", label_ar: "عميل سعيد" }] },
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
    defaults: { title: "About us", title_ar: "من نحن", body: "" },
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
    defaults: { title: "Featured projects", title_ar: "مشاريع مميّزة", limit: 3 },
  },
  {
    type: "project-grid",
    label: "All projects",
    description: "Filterable grid of all published projects",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "subtitle", label: "Subtitle", type: "text" },
    ],
    defaults: { title: "Our portfolio", title_ar: "محفظة مشاريعنا" },
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
    defaults: { title: "Why work with us", title_ar: "لماذا تعمل معنا", items: [] },
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
    defaults: { title: "What clients say", title_ar: "آراء عملائنا", items: [] },
  },
  {
    type: "gallery",
    label: "Gallery",
    description: "Image grid",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "images", label: "Images", type: "images" },
    ],
    defaults: { title: "Gallery", title_ar: "معرض الصور", images: [] },
  },
  {
    type: "cta",
    label: "Call to action",
    description: "Highlighted banner with a button",
    fields: [{ name: "title", label: "Title", type: "text" }, { name: "body", label: "Text", type: "textarea" }, ...cta()],
    defaults: { title: "Ready to invest?", title_ar: "مستعد للاستثمار؟", ctaLabel: "Contact us", ctaLabel_ar: "تواصل معنا", ctaHref: "/contact" },
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
    defaults: { title: "Questions?", title_ar: "لديك أسئلة؟", body: "Ask our AI concierge.", body_ar: "اسأل مساعدنا الذكي.", buttonLabel: "Start chatting", buttonLabel_ar: "ابدأ المحادثة" },
  },
  {
    type: "faq",
    label: "FAQ",
    description: "Shows your published FAQs",
    fields: [{ name: "title", label: "Title", type: "text" }],
    defaults: { title: "Frequently asked questions", title_ar: "الأسئلة الشائعة" },
  },
  {
    type: "contact",
    label: "Contact form",
    description: "Lead form plus your contact details",
    fields: [{ name: "title", label: "Title", type: "text" }, { name: "subtitle", label: "Subtitle", type: "textarea" }],
    defaults: { title: "Get in touch", title_ar: "تواصل معنا" },
  },
  {
    type: "map",
    label: "Map",
    description: "Embedded Google map",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "query", label: "Address or place to show", type: "text" },
    ],
    defaults: { title: "Find us", title_ar: "موقعنا", query: "" },
  },
];

export const SECTION_MAP = Object.fromEntries(SECTION_DEFS.map((d) => [d.type, d]));

/**
 * A section with its default text in both languages (`title` and `title_ar`, see src/lib/i18n/content.ts).
 * With a locale, the defaults are resolved to that language, for sections the site renders on its own.
 */
export function newSection(type: string, locale?: Locale): Section {
  const def = SECTION_MAP[type];
  const props = structuredClone(def?.defaults ?? {});
  return { id: Math.random().toString(36).slice(2, 10), type, props: locale ? localize(props, locale) : props };
}

/** Field types whose text is the agent's words, so each gets an Arabic twin in the page builder. */
export const TRANSLATABLE: FieldType[] = ["text", "textarea"];

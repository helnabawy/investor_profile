import { newSection, type Section } from "../sections/registry";
import { siteLayout, type SiteLayout } from "../theme";

/**
 * Default content for a brand-new site so it looks complete on day one, in English and Arabic
 * (each text has its `_ar` twin, see src/lib/i18n/content.ts). `nameAr` defaults to the English name.
 */
export function starterPages(name: string, nameAr = name): { slug: string; title: string; title_ar: string; sort: number; sections: Section[] }[] {
  const s = (type: string, props: Record<string, unknown> = {}) => {
    const sec = newSection(type);
    sec.props = { ...sec.props, ...props };
    return sec;
  };
  const consult = {
    title: "Want a private consultation?", title_ar: "هل تريد استشارة خاصة؟",
    body: "Tell us your goals and we will prepare a shortlist.", body_ar: "أخبرنا بأهدافك وسنُعدّ لك قائمة مختصرة.",
    ctaHref: "/contact",
  };
  return [
    {
      slug: "", title: "Home", title_ar: "الرئيسية", sort: 0,
      sections: [
        s("hero-split", {
          eyebrow: "Real estate advisory", eyebrow_ar: "استشارات عقارية",
          title: `Find your next property with ${name}`, title_ar: `اعثر على عقارك القادم مع ${nameAr}`,
          subtitle: "Browse hand-picked off-plan and ready projects. See prices, payment plans and expected yields up front, then ask anything.",
          subtitle_ar: "تصفّح مشاريع مختارة بعناية على الخارطة وجاهزة للتسليم. اطّلع على الأسعار وخطط الدفع والعوائد المتوقعة مسبقاً، ثم اسأل عن أي شيء.",
          image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=2000&q=80",
        }),
        s("quick-links"),
        s("featured-projects", {
          title: "Featured projects", title_ar: "مشاريع مميّزة",
          subtitle: "Hand-picked opportunities, with the key numbers on every card.", subtitle_ar: "فرص مختارة بعناية، مع الأرقام الأساسية على كل بطاقة.",
        }),
        s("steps", {
          image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&q=80",
          subtitle: "Sample copy. Replace it with how you guide your own clients.", subtitle_ar: "نص تجريبي. استبدله بالطريقة التي ترشد بها عملاءك.",
        }),
        s("faq", { title: "Questions buyers ask first", title_ar: "أسئلة يطرحها المشترون أولاً" }),
        s("cta", { ...consult, ctaLabel: "Book a consultation", ctaLabel_ar: "احجز استشارة" }),
      ],
    },
    {
      slug: "about", title: "About", title_ar: "من نحن", sort: 1,
      sections: [
        s("page-header", {
          title: name, title_ar: nameAr,
          subtitle: "Tell visitors in one line what you do and for whom.", subtitle_ar: "أخبر زوّارك في سطر واحد بما تقدّمه ولمن.",
        }),
        s("story", { items: [
          {
            title: "Your experience", title_ar: "الخبرة",
            body: "Years in the market, communities you know best, the kind of clients you serve.",
            body_ar: "سنوات الخبرة في السوق، والمناطق التي تعرفها جيداً، ونوع العملاء الذين تخدمهم.",
            image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=2000&q=80",
          },
          {
            title: "How you work", title_ar: "أسلوب العمل",
            body: "What makes your advice different — research, honesty, access to off-market inventory.",
            body_ar: "ما الذي يميّز استشارتك: البحث، والصدق، والوصول إلى عقارات غير معروضة في السوق.",
            image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=2000&q=80",
          },
          {
            title: "What clients get", title_ar: "ما يحصل عليه العملاء",
            body: "From shortlist to handover, leasing and resale: describe the journey.",
            body_ar: "من القائمة المختصرة حتى التسليم والتأجير وإعادة البيع: صِف رحلة العميل.",
            image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=2000&q=80",
          },
        ] }),
        s("cta", { ...consult, ctaLabel: "Contact us", ctaLabel_ar: "تواصل معنا" }),
      ],
    },
    {
      slug: "contact", title: "Contact", title_ar: "تواصل معنا", sort: 2,
      sections: [s("contact", {
        title: "Book a private consultation", title_ar: "احجز استشارة خاصة",
        subtitle: "Tell us your goals and we will prepare a shortlist. Choose whichever way of reaching us is easiest.",
        subtitle_ar: "أخبرنا بأهدافك وسنُعدّ لك قائمة مختصرة. اختر طريقة التواصل الأسهل لك.",
      })],
    },
  ];
}

export const STARTER_NAV = [
  { label: "Home", label_ar: "الرئيسية", href: "/" },
  { label: "About", label_ar: "من نحن", href: "/about" },
  { label: "Projects", label_ar: "المشاريع", href: "/projects" },
  { label: "Contact", label_ar: "تواصل معنا", href: "/contact" },
];

/** The concierge's name in both languages for a new site. */
export const starterAssistant = (name: string, nameAr = name) => ({ assistantName: `${name} Concierge`, assistantName_ar: `مساعد ${nameAr}` });

/** New sites start on the template picked at sign-up, with a neutral architectural backdrop the agent can replace. */
export function starterTheme(template: string, preset: string) {
  return {
    preset,
    layout: siteLayout({ layout: template as SiteLayout }),
    backdropUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=2400&q=80",
    ctaLabel: "Book a consultation",
    ctaLabel_ar: "احجز استشارة",
    ctaHref: "/contact",
  };
}

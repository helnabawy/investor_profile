import { newSection, type Section } from "../sections/registry";

/** Default content for a brand-new site so it looks complete on day one. */
export function starterPages(name: string): { slug: string; title: string; sort: number; sections: Section[] }[] {
  const s = (type: string, props: Record<string, unknown> = {}) => {
    const sec = newSection(type);
    sec.props = { ...sec.props, ...props };
    return sec;
  };
  return [
    {
      slug: "", title: "Home", sort: 0,
      sections: [
        s("hero-split", {
          eyebrow: "Real estate advisory",
          title: `Find your next property with ${name}`,
          subtitle: "Browse hand-picked off-plan and ready projects. See prices, payment plans and expected yields up front, then ask anything.",
          image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=2000&q=80",
        }),
        s("quick-links"),
        s("featured-projects", { title: "Featured projects", subtitle: "Hand-picked opportunities, with the key numbers on every card." }),
        s("steps", { image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&q=80", subtitle: "Sample copy. Replace it with how you guide your own clients." }),
        s("faq", { title: "Questions buyers ask first" }),
        s("cta", { title: "Want a private consultation?", body: "Tell us your goals and we will prepare a shortlist.", ctaLabel: "Book a consultation", ctaHref: "/contact" }),
      ],
    },
    {
      slug: "about", title: "About", sort: 1,
      sections: [
        s("page-header", { title: name, subtitle: "Tell visitors in one line what you do and for whom." }),
        s("story", { items: [
          { title: "Your experience", body: "Years in the market, communities you know best, the kind of clients you serve.", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=2000&q=80" },
          { title: "How you work", body: "What makes your advice different — research, honesty, access to off-market inventory.", image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=2000&q=80" },
          { title: "What clients get", body: "From shortlist to handover, leasing and resale: describe the journey.", image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=2000&q=80" },
        ] }),
        s("cta", { title: "Want a private consultation?", body: "Tell us your goals and we will prepare a shortlist.", ctaLabel: "Contact us", ctaHref: "/contact" }),
      ],
    },
    { slug: "contact", title: "Contact", sort: 2, sections: [s("contact", { title: "Book a private consultation", subtitle: "Tell us your goals and we will prepare a shortlist. Choose whichever way of reaching us is easiest." })] },
  ];
}

export const STARTER_NAV = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Contact", href: "/contact" },
];

/** New sites start on the template picked at sign-up, with a neutral architectural backdrop the agent can replace. */
export function starterTheme(template: string, preset: string) {
  return {
    preset,
    layout: template === "lounge" ? "lounge" : "classic",
    backdropUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=2400&q=80",
    ctaLabel: "Book a consultation",
    ctaHref: "/contact",
  };
}

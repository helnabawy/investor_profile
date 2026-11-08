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
        s("hero", {
          eyebrow: "Real estate advisory",
          title: `Find your next property with ${name}`,
          subtitle: "Hand-picked off-plan and ready homes, explained clearly — with an AI concierge available 24/7.",
          image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=2000&q=80",
          ctaLabel: "Explore projects", ctaHref: "/projects", secondaryLabel: "Ask the concierge", secondaryHref: "#chat",
        }),
        s("featured-projects", { title: "Featured projects" }),
        s("chat-cta", { title: "Have a question right now?", body: "Our AI concierge knows our portfolio and can arrange a call." }),
        s("faq"),
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
    { slug: "contact", title: "Contact", sort: 2, sections: [s("contact", { title: "Get in Touch", subtitle: "Questions about an opportunity? Schedule a private consultation." })] },
  ];
}

export const STARTER_NAV = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Contact", href: "/contact" },
];

/** New sites start on the Lounge layout with a neutral architectural backdrop the agent can replace. */
export function starterTheme(preset: string) {
  return {
    preset,
    layout: "lounge",
    backdropUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=2400&q=80",
    ctaLabel: "Book a consultation",
    ctaHref: "/contact",
  };
}

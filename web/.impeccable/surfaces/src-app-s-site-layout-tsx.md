---
version: 1
slug: "src-app-s-site-layout-tsx"
primary_target: "src/app/s/[site]/layout.tsx"
related_targets: ["src/app/s/[site]/page.tsx"]
---

# Surface: Lounge layout (tenant public site)

Scope: the "Lounge" site layout for tenant sites — shell, chat-first home, story About, contact, and projects inside the shell. Visitor mode: Persuade (the buyer decides to trust the advisor and acts: asks, leaves details, books). Code-led build (no image generation).

Audience/job: property buyers judging one advisor; they want a grounded answer fast and a human handoff. Proof: the agent's own portrait, story, inventory, and a concierge that answers from it. Constraint: everything per-tenant editable; structure pinned by the user to hindlounge.com (no reuse of its brand, photos or copy); classic layout must keep working.

## Direction contract
THESIS: The advisor's private lounge, where the conversation IS the homepage. It refuses the portal default of a hero banner, listing grid and contact footer, with chat as an afterthought bubble.
OWN-WORLD: The tenant theme drives everything. The page ground is the theme background. The page is held by a floating sidebar panel on an inverted ground (the theme foreground, warmed by the accent). The photographic backdrop is blurred, desaturated and tinted with the theme primary. The tenant's heading face pairs with a workhorse UI sans for controls. Pill chips and glass composer are tied to the backdrop only.
STORY: The buyer sees the advisor's face and name, reads one line of promise, then taps a question or types one. The answer streams in place with project links, and leaving details is one message away. About tells the advisor's story as numbered chapters. Contact offers every channel beside one form.
FIRST VIEWPORT: Left: a floating sidebar card with monogram or logo, icon navigation, active marker and a CTA at the bottom. Center: an avatar (96px) above a display name with an accent word and a short subtitle. Bottom center: 3–7 suggestion chips above a wide composer (max 640px) and a keyboard hint. The full-bleed backdrop sits behind everything.
FORM: pinned by user (hindlounge.com structure); no concept roll. seed: user-pinned:hindlounge-structure
SIGNATURE: lobby to conversation. On first message the title block lifts and condenses into a compact header, and messages fill the column above the composer. The backdrop stays.
FINISH: unreviewed and unverified until the finish reviewer returns a disposition.

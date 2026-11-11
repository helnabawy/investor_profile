---
name: EstateProfile tenant sites
description: A private advisory lounge per agent, themed entirely by tenant tokens; the concierge is the front door.
colors:
  background: "#0e0d0b"
  foreground: "#f3eee5"
  card: "#17150f"
  muted: "#1f1c16"
  muted-foreground: "#b3a991"
  border: "#2f2a20"
  primary: "#c9a54c"
  primary-foreground: "#14110a"
  accent: "#e8d9b0"
  night-ink: "#0b0a08"
  lounge-text: "#f5f3ee"
  lounge-ink: "color-mix(in srgb, #0b0a08 93%, var(--primary))"
  lounge-muted: "color-mix(in srgb, #f5f3ee 72%, transparent)"
  lounge-glass: "color-mix(in srgb, #0b0a08 58%, transparent)"
  lounge-glass-line: "color-mix(in srgb, #f5f3ee 16%, transparent)"
  sidebar: "color-mix(in srgb, var(--foreground) 86%, var(--accent))"
  sidebar-fg: "var(--background)"
  sidebar-mark: "color-mix(in srgb, var(--primary) 80%, var(--sidebar-fg))"
  admin-teal: "#0f766e"
  admin-teal-deep: "#115e59"
  admin-focus: "#14b8a6"
  admin-ink: "#0f172a"
  admin-label: "#334155"
  admin-muted: "#64748b"
  admin-line: "#e2e8f0"
  admin-field-line: "#cbd5e1"
typography:
  display:
    fontFamily: "var(--font-heading)"
    fontSize: "clamp(2.6rem, 6vw, 4.75rem)"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "-0.01em"
  display-lobby:
    fontFamily: "var(--font-heading)"
    fontSize: "clamp(2.2rem, 4.6vw, 3.6rem)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  numeral:
    fontFamily: "var(--font-heading)"
    fontSize: "clamp(3.2rem, 6vw, 5rem)"
    fontWeight: 400
    lineHeight: 1
    fontFeature: "lnum"
  headline:
    fontFamily: "var(--font-heading)"
    fontSize: "clamp(1.8rem, 3vw, 2.6rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  title:
    fontFamily: "var(--font-heading)"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.2
  body-ui:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.98rem"
    fontWeight: 400
    lineHeight: 1.7
  body:
    fontFamily: "var(--font-body)"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  label-ui:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.82rem"
    fontWeight: 400
    lineHeight: 1.4
  admin:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  base: "2px"
  bubble: "6px"
  panel: "8px"
  composer: "12px"
  pill: "999px"
  admin: "8px"
  admin-card: "14px"
spacing:
  shell-inset: "16px"
  sidebar-width: "240px"
  content-offset: "256px"
  chat-column: "640px"
  section-y: "80px"
  section-y-md: "112px"
  panel-pad: "36px"
components:
  lounge-chip:
    backgroundColor: "{colors.lounge-glass}"
    textColor: "{colors.lounge-text}"
    typography: "{typography.label-ui}"
    rounded: "{rounded.pill}"
    padding: "7px 15px"
  lounge-composer:
    backgroundColor: "color-mix(in srgb, #0b0a08 62%, transparent)"
    textColor: "{colors.lounge-text}"
    rounded: "{rounded.composer}"
    padding: "10px"
  lounge-send:
    backgroundColor: "color-mix(in srgb, var(--accent) 22%, transparent)"
    textColor: "{colors.lounge-text}"
    rounded: "{rounded.bubble}"
    size: "40px"
  lounge-send-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.night-ink}"
  lounge-submit:
    backgroundColor: "{colors.accent}"
    textColor: "#120f09"
    typography: "{typography.body-ui}"
    rounded: "{rounded.base}"
    padding: "14px 19px"
  lounge-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.body-ui}"
    rounded: "{rounded.base}"
    padding: "14px 22px"
  lounge-input:
    backgroundColor: "color-mix(in srgb, #0b0a08 55%, transparent)"
    textColor: "{colors.lounge-text}"
    typography: "{typography.body-ui}"
    rounded: "{rounded.base}"
    padding: "12px 15px"
  lounge-nav-item:
    backgroundColor: "transparent"
    textColor: "color-mix(in srgb, var(--sidebar-fg) 82%, transparent)"
    typography: "{typography.body-ui}"
    rounded: "{rounded.base}"
    padding: "12px 16px"
  lounge-nav-item-active:
    backgroundColor: "color-mix(in srgb, var(--sidebar-fg) 9%, transparent)"
    textColor: "{colors.sidebar-fg}"
  lounge-cta:
    backgroundColor: "{colors.sidebar-fg}"
    textColor: "{colors.sidebar}"
    rounded: "{rounded.base}"
    padding: "12px 16px"
  lounge-sidebar:
    backgroundColor: "{colors.sidebar}"
    textColor: "{colors.sidebar-fg}"
    rounded: "{rounded.panel}"
    width: "{spacing.sidebar-width}"
  story-panel:
    backgroundColor: "{colors.lounge-ink}"
    textColor: "{colors.lounge-text}"
    rounded: "{rounded.panel}"
  bubble-assistant:
    backgroundColor: "color-mix(in srgb, #0b0a08 66%, transparent)"
    textColor: "{colors.lounge-text}"
    rounded: "{rounded.bubble}"
    padding: "10px 14px"
  bubble-user:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.night-ink}"
    rounded: "{rounded.bubble}"
    padding: "10px 14px"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.base}"
    padding: "13px 26px"
  button-primary-hover:
    backgroundColor: "color-mix(in srgb, var(--primary) 85%, var(--foreground))"
  button-outline:
    backgroundColor: "transparent"
    textColor: "currentColor"
    rounded: "{rounded.base}"
    padding: "13px 26px"
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.base}"
    padding: "11px 14px"
  project-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.base}"
    padding: "20px"
  admin-button-primary:
    backgroundColor: "{colors.admin-teal}"
    textColor: "#ffffff"
    typography: "{typography.admin}"
    rounded: "{rounded.admin}"
    padding: "9px 16px"
  admin-button-primary-hover:
    backgroundColor: "{colors.admin-teal-deep}"
  admin-card:
    backgroundColor: "#ffffff"
    textColor: "{colors.admin-ink}"
    rounded: "{rounded.admin-card}"
    padding: "24px"
---

# Design System: EstateProfile tenant sites

## Overview

**Creative North Star: "The Advisor's Private Lounge"**

Every tenant site is one advisor's private room, not a listings portal. In the Lounge layout the conversation is the homepage: a floating sidebar holds the room together, a blurred and theme-tinted photograph sets the light, and the advisor's face, name and composer sit in the middle of it. The visual system has no fixed palette. It is a set of **token roles** (background, foreground, card, muted, muted-foreground, border, primary, primary-foreground, accent, heading font, body font, radius) that each tenant fills, either from a named preset or by overriding single roles. Everything else is derived from those roles with `color-mix()`, so any preset lands coherently.

Two layouts share the tokens. **Lounge** (default for new sites per PRODUCT.md) is the sidebar shell with a chat-first home, a numbered story About and a contact lounge. **Classic** is the incumbent top nav with long scrolling sections. The **Admin** dashboard is a third, separate surface with its own fixed teal-on-slate design that never reads tenant tokens.

The frontmatter values for the tenant roles are the **Luxury Gold** preset, which is also the fallback preset when a tenant has none. Rounded values are resolved against Luxury Gold's base radius (2px); in code they are offsets from the tenant's `--radius`.

**Key Characteristics:**
- Tenant tokens in, derived roles out: no tenant-facing colour is hard-coded except the night ink of photographic regions.
- Two grounds in Lounge: the theme ground (page) and the photographic night ground (backdrop, page headers, story panels, contact).
- An inverted sidebar: the theme's foreground, warmed by its accent, becomes the sidebar's ground.
- The tenant's heading face for names, titles and numerals; Hanken Grotesk as the workhorse UI face for every control in Lounge.
- One easing curve, cubic-bezier(0.22, 1, 0.36, 1), behind every reveal and layout transition.

## Colors

The palette is a role contract filled per tenant; the presets below are the named value sets shipped in `src/lib/theme.ts`.

### Primary
- **Tenant Primary** (`{colors.primary}`, Luxury Gold value in frontmatter): the brand mark. Active nav marker, sidebar monogram (mixed toward sidebar-fg), classic primary buttons, prices on project cards, focus outlines in the sidebar, and a 10% tint over every backdrop.
- **Primary Foreground** (`{colors.primary-foreground}`): text on primary fills.

### Secondary
- **Tenant Accent** (`{colors.accent}`): the Lounge's live colour. The accent word in display names and page titles, the user's chat bubble, send button on hover, the solid submit button, chip/composer/input focus rings, caret colour, contact channel icons, and the short rule under each story chapter. Also warms the sidebar ground.

### Neutral (tenant roles)
- **Background / Foreground** (`{colors.background}`, `{colors.foreground}`): page ground and text. In Lounge they also swap roles to make the sidebar.
- **Card / Muted / Muted Foreground / Border**: card fills, quiet fills, secondary text, hairlines (applied globally to every border).

### Neutral (Lounge night ground, fixed)
- **Night Ink** (`{colors.night-ink}`): the only hard-coded tenant-side colour. Every photographic region is night-toned so light type reads on any preset. **Lounge Ink** is night ink with 7% primary.
- **Lounge Text / Lounge Muted** (`{colors.lounge-text}`, `{colors.lounge-muted}`): warm off-white type on photo, and its 72% muted step.
- **Glass / Glass Line** (`{colors.lounge-glass}`, `{colors.lounge-glass-line}`): 58% night ink with a 16% off-white hairline, for chips, menu button, contact channel list.

### Presets (named value sets)
| Role | Luxury Gold | Modern | Minimal | Desert Sand |
|---|---|---|---|---|
| background | frontmatter | #ffffff | #fafaf9 | #f7f1e8 |
| foreground | frontmatter | #0f172a | #1c1917 | #2b2118 |
| card | frontmatter | #f8fafc | #ffffff | #fffaf3 |
| muted | frontmatter | #f1f5f9 | #f5f5f4 | #efe5d6 |
| muted-foreground | frontmatter | #64748b | #78716c | #7a6a58 |
| border | frontmatter | #e2e8f0 | #e7e5e4 | #e2d4bf |
| primary | frontmatter | #0f766e | #1c1917 | #a0522d |
| primary-foreground | frontmatter | #ffffff | #fafaf9 | #fffaf3 |
| accent | frontmatter | #14b8a6 | #a8a29e | #d4a373 |
| heading font | Playfair Display | Plus Jakarta Sans | DM Serif Display | Libre Baskerville |
| body font | Cormorant Garamond | Inter | Manrope | Outfit |
| radius | 0.125rem | 0.75rem | 0rem | 0.5rem |

### Admin (fixed, separate surface)
Teal on slate: `{colors.admin-teal}` for primary actions (hover `{colors.admin-teal-deep}`), `{colors.admin-focus}` for focus rings, `{colors.admin-ink}` text, `{colors.admin-label}` field labels, `{colors.admin-muted}` hints, `{colors.admin-line}` / `{colors.admin-field-line}` borders, white cards. Danger is red-700 text on red-200 border.

### Named Rules
**The Tokens-In Rule.** Tenant-facing colour comes from the nine role tokens or a `color-mix()` of them. A new surface that needs a colour derives it; it never introduces a literal hex, except night ink on photographic ground.

**The Inverted Sidebar Rule.** The Lounge sidebar is foreground mixed 14% toward accent, with background as its text. On a dark preset it is a pale panel; on a light preset it is a dark one. Its CTA inverts again (sidebar-fg ground, sidebar text).

**The Night Ground Rule.** Anything sitting on a photograph is on night ink with lounge-text type, whatever the preset. Never set theme foreground on a photo.

## Typography

**Display Font:** the tenant heading font (`--font-heading`, with Georgia, serif)
**Body Font:** the tenant body font (`--font-body`, with system-ui, sans-serif)
**UI Font (Lounge only):** Hanken Grotesk 400/500/600 (with ui-sans-serif, system-ui)

**Character:** the tenant's face carries identity (names, titles, chapter numerals, card titles, channel labels); Hanken Grotesk carries everything a buyer operates or scans (nav, chips, composer, inputs, subtitles, card metadata). Headings get -0.01em tracking globally.

### Hierarchy
- **Display** (400, clamp(2.6rem, 6vw, 4.75rem), 1.04): page-header and contact titles on photo, last word in accent.
- **Display Lobby** (400, clamp(2.2rem, 4.6vw, 3.6rem), 1.05): the advisor's name on the chat home; condenses to 1.125rem in the talking header.
- **Numeral** (400, clamp(3.2rem, 6vw, 5rem), 1, lining figures): story chapter numbers "01", "02", at 62% lounge-text on mobile and 38% on desktop.
- **Headline** (400, clamp(1.8rem, 3vw, 2.6rem), 1.1, max 16ch): story chapter titles; Lounge CTA uses clamp(2rem, 4vw, 3rem).
- **Title** (400, 1.25 to 1.5rem): project card titles, contact form heading, channel labels (1.05rem).
- **Body UI** (400, 0.98rem, 1.7, max 46 to 56ch): subtitles and story text on Lounge.
- **Body** (400, 1.125rem, relaxed): classic section copy in the tenant body face.
- **Label UI** (400, 0.82rem): field labels and chips; keyboard hint at 0.72rem.

Classic headings: h2 at 1.875rem rising to 3rem at md; hero h1 at 2.25rem rising to 4.5rem.

### Named Rules
**The Accent Word Rule.** A Lounge display title colours its final word (or an explicit tenant-chosen tail) in accent. One accent span per title, never mid-sentence.

**The Two Faces Rule.** In Lounge, controls and metadata use Hanken Grotesk with tabular lining numerals on cards; the tenant faces never set a button, input or nav label.

## Layout

**Lounge shell.** A fixed sidebar card 240px wide, inset 16px from top, bottom and left, from 1024px up; content is offset 256px. Below 1024px the sidebar becomes a spring-driven drawer (min(19rem, 100vw - 4.5rem), inset 12px) behind a 48px glass menu button at top right, over a 60% black scrim. The sidebar stacks: a logo or monogram zone taking about 38% of its height, a hairline, the icon nav, flexible space, a hairline, the CTA.

**Chat home.** One full-height (100dvh) screen with no footer. Lobby: avatar 96px, name, subtitle centred in the upper area; 3 to 7 chips and the composer anchored at the bottom in a 640px column. Once talking, the title lifts into a compact header bar (40px avatar), messages fill the same 640px column, and the composer stays.

**Inner pages.** A photographic page header (62vh when it leads a page and no project grid follows), then content on the theme ground. The photo dissolves into the background over its bottom 28%. Story chapters are full-width panels in an 88rem container, 24px apart (32px from 768px), min 34rem tall on desktop, text in the left half over a gradient, photo masked in from the right. Contact sits entirely on the photo: channel list (0.85fr) beside the form panel (1.25fr) in a 72rem container.

**Classic.** Fixed transparent-over-hero header, sections in a 80rem container with 80px vertical padding (112px from 768px), 20px gutters.

**Breakpoints:** 640px (keyboard hint, gutters), 768px (story mask, grids), 1024px (sidebar vs drawer).

## Elevation & Depth

Lounge is layered, not flat: depth comes from the backdrop photograph (desaturated, sepia-warmed, darkened to 62%, blurred 5px, scaled 1.06), theme-tinted gradients, and glass (night ink at 55 to 70% with 8 to 14px backdrop blur). Shadows are soft and dark, used to float the shell and the composer over the photo. Classic is nearly flat: borders and card fills, with shadow only on the chat widget.

### Shadow Vocabulary
- **Shell float** (`box-shadow: 0 24px 60px -18px rgb(0 0 0 / 0.55), 0 2px 6px rgb(0 0 0 / 0.18)`): the sidebar card.
- **Composer float** (`box-shadow: 0 18px 50px -20px rgb(0 0 0 / 0.7)`): the composer; adds a 4px accent halo at 14% on focus.
- **Avatar lift** (`box-shadow: 0 18px 40px -12px rgb(0 0 0 / 0.8)`): the 96px lobby avatar.
- **CTA lift** (`box-shadow: 0 6px 18px -8px rgb(0 0 0 / 0.5)`, hover `0 10px 24px -10px rgb(0 0 0 / 0.6)` with -1px rise): sidebar CTA.
- **Accent glow** (`box-shadow: 0 10px 28px -12px color-mix(in srgb, var(--accent) 70%, transparent)`): the solid submit button.

### Named Rules
**The Glass-On-Photo Rule.** Glass (blurred translucent night ink) exists only over a photograph: chips, composer, menu button, contact channel list and form. On the theme ground, panels are opaque card fills with a border.

## Shapes

Corners follow the tenant radius and step up by fixed offsets: controls at the base radius, chat bubbles and send button at +4px, sidebar, story panels and contact panels at +6px, the composer at +10px. Chips and avatars are full pills/circles regardless of preset, so they stay soft even on Minimal's 0 radius. Hairlines are 1px: theme border on the ground, glass line on photo, sidebar line (14% sidebar-fg) inside the sidebar. The active nav item carries a 3px rounded marker bar just outside its left edge.

## Components

### Buttons
- **Solid submit (Lounge):** accent ground, near-black text (#120f09), Hanken 600 at 0.95rem, base radius, accent glow; hover lifts 1px and mixes 12% white. Used for "Send message" and Lounge CTA links.
- **Ghost (Lounge):** foreground text, 1px border at 28% foreground, base radius; hover turns the border accent with an 8% accent wash. Pairs with the solid submit ("Ask the concierge").
- **Sidebar CTA:** inverted against the sidebar, icon plus label, Hanken 500.
- **Classic primary / outline:** primary fill, 0.95rem with 0.04em tracking, hover mixes 15% foreground; outline is a 40% currentColor border turning primary on hover.
- **Focus:** 2px outline in accent (or primary in the sidebar), offset 2 to 3px.

### Chips
- **Style:** pill, glass ground, 86% lounge-text, Hanken 0.82rem, 8px blur. Suggested questions on the chat home only.
- **State:** hover turns the border 70% accent and deepens the glass; they stagger in at 40ms intervals.

### Cards / Containers
- **Story panel:** night-ink ground, panel radius, numeral, headline, body, 56px accent rule.
- **Project card:** card fill, 1px border turning primary on hover, base radius, 4:3 image zooming to 1.05 over 700ms, status tag on 90% background, metadata and price in the UI face with tabular figures.
- **Lounge panel card:** 88% card fill with border at panel radius, for content panels on the theme ground.

### Inputs / Fields
- **Lounge input (on photo):** 55% night ink, glass line border, base radius, Hanken 0.95rem, label above at 0.82rem lounge-muted. Focus: border 70% accent plus a 3px accent halo at 16%, no outline.
- **Composer:** glass block at composer radius with a 2-row borderless textarea and a 40px send button; caret in accent.
- **Classic input:** background ground, border, base radius; focus is a 2px primary outline at 60%.

### Navigation
- **Lounge sidebar nav:** Hanken 0.95rem, 18px line icons at 1.6 stroke, items at 82% sidebar-fg; hover 6% wash; active 9% wash, weight 500, icon in sidebar-mark, and the sliding 3px primary marker (spring 500/40).
- **Classic header:** uppercase 0.875rem with 0.18em tracking, transparent with white type over a hero, 95% background with 8px blur once scrolled.

### Concierge Thread (signature)
Assistant bubbles are 66% night ink glass with a hairline; user bubbles are solid accent with night-ink text; links in accent. The lobby-to-conversation transition shares `layoutId` between the lobby and bar avatar/title over 0.6s on the house easing. All motion respects reduced-motion.

### Admin
System sans; `.a-card` white with slate hairline at 14px radius and 24px padding; `.a-btn` 8px radius, 0.875rem/500, primary teal, ghost white with slate border, danger red; `.field` grids a 500-weight label, control and 0.78rem hint; focus is a 2px teal outline.

## Do's and Don'ts

### Do:
- **Do** express every tenant-facing colour as a role token or a `color-mix()` of role tokens, so all four presets and any override render coherently.
- **Do** put light lounge-text type and glass controls on any photographic region, over night ink.
- **Do** set Lounge controls, labels and card metadata in Hanken Grotesk and keep the tenant heading face for names, titles and numerals.
- **Do** derive corner radii as offsets from the tenant radius (+4px bubbles, +6px panels, +10px composer); keep chips and avatars fully round.
- **Do** use cubic-bezier(0.22, 1, 0.36, 1) for reveals and layout transitions (0.35 to 0.7s) and honour prefers-reduced-motion.
- **Do** dissolve photo regions into the page ground (bottom 28% gradient to background).

### Don't:
- **Don't** place glass chips or the glass composer on the theme ground; they belong to the backdrop.
- **Don't** set theme foreground text directly on a photograph.
- **Don't** let admin teal or slate leak into tenant sites, or tenant tokens into `/admin`.
- **Don't** hard-code a brand colour, font or copy for a tenant surface; everything is per-tenant.
- **Don't** carry the classic `.eyebrow` uppercase kicker into Lounge or new surfaces; Lounge titles stand without kickers.

-- Demo data: two fictional tenants so multi-tenancy and RLS can be exercised locally.
-- All names, projects and testimonials are fictional placeholders.

insert into public.tenants (id, slug, name, tagline, theme, ai_config, contact, nav) values
('11111111-1111-1111-1111-111111111111', 'demo', 'Aurelia Estates', 'Private real estate advisory · Dubai',
 '{"preset":"calm-green","layout":"classic","backdropUrl":"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=2400&q=80","ctaLabel":"Book a consultation","ctaHref":"/contact"}',
 '{"provider":"auto","assistantName":"Aurelia Concierge","suggestions":["Dubai market overview","Best areas to invest","ROI & rental yields","Mortgage options","Buying costs & fees","Off-plan vs ready"],"greeting":"Welcome to Aurelia Estates. I can help you explore off-plan and ready properties, compare payment plans, or arrange a private viewing. What are you looking for?","instructions":"You represent Aurelia Estates, a boutique advisory for investors buying in Dubai. Be warm, concise and discreet. Always try to understand budget, preferred area, bedrooms and timeline, then recommend matching projects from the inventory. Offer to arrange a call once the visitor shows interest.","temperature":0.4}',
 '{"email":"hello@aurelia.example","phone":"+971 50 000 0000","whatsapp":"971500000000","address":"Business Bay, Dubai, UAE","hours":"Mon–Sat, 9:00–19:00"}',
 '[{"label":"Home","href":"/"},{"label":"About","href":"/about"},{"label":"Projects","href":"/projects"},{"label":"Contact","href":"/contact"}]'
),
('22222222-2222-2222-2222-222222222222', 'skyline', 'Skyline Homes', 'Family homes & rentals',
 '{"preset":"modern","layout":"classic"}',
 '{"provider":"auto","assistantName":"Skyline Assistant","greeting":"Hi! Looking for a home? Tell me your budget and preferred area.","temperature":0.5}',
 '{"email":"team@skyline.example","phone":"+971 55 000 0000","whatsapp":"971550000000","address":"Dubai Hills, Dubai"}',
 '[{"label":"Listings","href":"/projects"},{"label":"Contact","href":"/contact"}]'
);

-- ───────────── pages ─────────────
insert into public.pages (tenant_id, slug, title, description, sort, sections) values
('11111111-1111-1111-1111-111111111111', '', 'Home', 'Private real estate advisory for investors in Dubai.', 0, '[
  {"id":"h1","type":"hero-split","props":{"eyebrow":"Private real estate advisory · Dubai","title":"Invest in Dubai property with clear numbers and one advisor you can reach.","subtitle":"Browse a hand-picked portfolio of off-plan and ready projects. See prices, payment plans and expected yields up front, then ask anything.","image":"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=2000&q=80","askPlaceholder":"e.g. What can I buy for AED 1.5M with a payment plan?"}},
  {"id":"l1","type":"quick-links","props":{"items":[{"title":"Browse projects","body":"Filter by area, status and budget","href":"/projects","icon":"building"},{"title":"Understand the numbers","body":"Payment plans, fees and yields explained","href":"#faq","icon":"chart"},{"title":"Speak to an advisor","body":"Call, WhatsApp or book a consultation","href":"/contact","icon":"person"}]}},
  {"id":"f1","type":"featured-projects","props":{"title":"Featured projects","subtitle":"Hand-picked off-plan and ready opportunities, with the key numbers on every card.","limit":3}},
  {"id":"w1","type":"steps","props":{"title":"From first shortlist to handover, in three steps","subtitle":"Sample copy for this demo site. Replace it with how you guide your own clients.","image":"https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&q=80","items":[{"title":"Tell us your goals","body":"Capital growth, rental yield or a home for the family. Share your budget, timeline and appetite for risk."},{"title":"Get a shortlist with honest numbers","body":"A curated set of projects, each with a full cost sheet: price, fees, payment plan and expected yield."},{"title":"View, reserve and hand over","body":"We arrange viewings, guide you through reservation, and manage leasing or resale when you are ready."}]}},
  {"id":"q1","type":"faq","props":{"title":"Questions buyers ask first"}},
  {"id":"c1","type":"cta","props":{"title":"Want a private investment consultation?","body":"Tell us your goals and we will prepare a curated shortlist. Mon–Sat, 9:00–19:00.","ctaLabel":"Book a consultation","ctaHref":"/contact"}}
]'),
('11111111-1111-1111-1111-111111111111', 'about', 'About', 'About Aurelia Estates', 1, '[
  {"id":"ph","type":"page-header","props":{"title":"Aurelia Estates","subtitle":"Private real estate advisory for prime assets in Dubai"}},
  {"id":"st","type":"story","props":{"items":[
    {"title":"A private advisory for Dubai property","body":"Sample story copy for this demo site. Aurelia Estates is a fictional advisory used to show how an agent tells their story: who they serve, and how they guide clients from first shortlist to handover.","image":"https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=2000&q=80"},
    {"title":"Investors first, advisors second","body":"Every recommendation comes from people who own and trade property in the same communities they advise on. Advice is grounded in practice, not brochures.","image":"https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=2000&q=80"},
    {"title":"Built on referrals","body":"Discretion, honest numbers and long relationships matter more than any single transaction. Replace this sample chapter with how your own clients find you.","image":"https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=2000&q=80"},
    {"title":"Strategies tailored to you","body":"Capital growth, rental yield or a home for the family: we shape a portfolio around your timeline and risk, then manage leasing and resale when you are ready.","image":"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=2000&q=80"}
  ]}},
  {"id":"a2","type":"cta","props":{"title":"Want a private investment consultation?","body":"Tell us your goals and we will prepare a curated shortlist.","ctaLabel":"Contact us","ctaHref":"/contact"}}
]'),
('11111111-1111-1111-1111-111111111111', 'contact', 'Contact', 'Get in touch', 2, '[
  {"id":"k1","type":"contact","props":{"title":"Get in Touch","subtitle":"Questions about an opportunity? Schedule a private consultation and decide with confidence."}}
]'),
('22222222-2222-2222-2222-222222222222', '', 'Home', 'Family homes in Dubai', 0, '[
  {"id":"h1","type":"hero","props":{"title":"Find a home your family will love","subtitle":"Villas and townhouses in Dubai''s best communities.","image":"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=2000&q=80","ctaLabel":"View listings","ctaHref":"/projects"}},
  {"id":"g1","type":"project-grid","props":{"title":"Available now"}},
  {"id":"k1","type":"contact","props":{"title":"Book a viewing"}}
]'),
('22222222-2222-2222-2222-222222222222', 'contact', 'Contact', 'Contact Skyline Homes', 1, '[
  {"id":"k1","type":"contact","props":{"title":"Book a viewing"}}
]');

-- ───────────── projects (fictional) ─────────────
insert into public.projects (tenant_id, title, developer, area, city, property_type, status, bedrooms, price_from, handover, payment_plan, roi, description, amenities, images, featured, sort) values
('11111111-1111-1111-1111-111111111111', 'Marina Vista Residences', 'Demo Developer A', 'Dubai Marina', 'Dubai', 'Apartment', 'off-plan', '1, 2, 3', 1450000, 'Q4 2027', '60/40 — 60% during construction, 40% on handover', '6–7% expected gross yield',
 'Waterfront tower with full marina views, a sky pool on level 52 and direct promenade access. Ideal for short-term rental investors.',
 '{"Sky pool","Gym","Concierge","Marina promenade access"}',
 '{"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=80","https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1400&q=80"}', true, 0),
('11111111-1111-1111-1111-111111111111', 'Palm Crescent Villas', 'Demo Developer B', 'Palm Jumeirah', 'Dubai', 'Villa', 'off-plan', '4, 5, 6', 18500000, 'Q2 2028', '50/50', 'Capital-growth focused',
 'A limited collection of beachfront villas with private pools and landscaped gardens on the Palm''s crescent.',
 '{"Private beach","Private pool","Smart home","Staff quarters"}',
 '{"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=80","https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1400&q=80"}', true, 1),
('11111111-1111-1111-1111-111111111111', 'Downtown Arc Tower', 'Demo Developer A', 'Downtown Dubai', 'Dubai', 'Apartment', 'ready', 'Studio, 1, 2', 1150000, 'Ready', 'Cash or mortgage; post-handover plan available on selected units', '7–8% expected gross yield',
 'Ready-to-move apartments steps from the Boulevard, with views toward the city skyline. Tenanted units available.',
 '{"Infinity pool","Gym","Kids area","Retail podium"}',
 '{"https://images.unsplash.com/photo-1546412414-8035e1776c9a?w=1400&q=80"}', true, 2),
('11111111-1111-1111-1111-111111111111', 'Creek Garden Townhouses', 'Demo Developer C', 'Dubai Creek Harbour', 'Dubai', 'Townhouse', 'off-plan', '3, 4', 3200000, 'Q1 2028', '70/30 with 1% monthly', '5–6% expected gross yield',
 'Family townhouses wrapped around a central park, minutes from the creek and the future tallest tower district.',
 '{"Central park","Community pool","Cycling tracks","Nursery"}',
 '{"https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=1400&q=80"}', false, 3),
('11111111-1111-1111-1111-111111111111', 'Business Bay Lofts', 'Demo Developer B', 'Business Bay', 'Dubai', 'Apartment', 'off-plan', 'Studio, 1', 890000, 'Q3 2027', '80/20', '7% expected gross yield',
 'Compact, design-led lofts aimed at young professionals, close to the canal and DIFC.',
 '{"Co-working lounge","Rooftop gym","Canal views"}',
 '{"https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=1400&q=80"}', false, 4),
('22222222-2222-2222-2222-222222222222', 'Hills Park Villa 4BR', 'Demo Developer D', 'Dubai Hills Estate', 'Dubai', 'Villa', 'ready', '4', 6900000, 'Ready', 'Mortgage-friendly', null,
 'Corner villa backing onto the park, renovated kitchen, private garden.', '{"Garden","Park view","Maid room"}',
 '{"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=80"}', true, 0);

insert into public.faqs (tenant_id, question, answer, sort) values
('11111111-1111-1111-1111-111111111111', 'Can foreigners buy property in Dubai?', 'Yes. Non-residents can buy freehold property in designated areas such as Dubai Marina, Downtown, Palm Jumeirah and Business Bay.', 0),
('11111111-1111-1111-1111-111111111111', 'What are the buying costs?', 'Budget roughly 4% Dubai Land Department fee, plus registration and agency fees. We provide a full cost sheet for each unit.', 1),
('11111111-1111-1111-1111-111111111111', 'Does buying property give me a residency visa?', 'Property investments above certain thresholds can qualify for long-term residency. We can connect you with specialists to confirm current rules.', 2),
('11111111-1111-1111-1111-111111111111', 'How do off-plan payment plans work?', 'You pay in instalments linked to construction milestones or dates, with the balance on handover. Some projects offer post-handover plans.', 3);

insert into public.knowledge (tenant_id, title, content) values
('11111111-1111-1111-1111-111111111111', 'Viewing process', 'Private viewings can be arranged 7 days a week, in person or by live video call. Show-flat visits for off-plan projects take about 45 minutes.'),
('11111111-1111-1111-1111-111111111111', 'Advisory fees', 'For off-plan purchases the developer pays our commission, so buyers pay no advisory fee. For resale, a 2% agency fee applies.');

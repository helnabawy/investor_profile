-- Demo data: two fictional tenants so multi-tenancy and RLS can be exercised locally.
-- All names, projects and testimonials are fictional placeholders.
-- Visitor-facing text carries an Arabic twin (`title` / `title_ar`, see src/lib/i18n/content.ts).
-- The demo tenant is fully bilingual; Skyline translates only its name and menu, so the English
-- fallback on its Arabic pages can be seen.

insert into public.tenants (id, slug, name, name_ar, tagline, tagline_ar, default_locale, locales, theme, ai_config, contact, nav) values
('11111111-1111-1111-1111-111111111111', 'demo', 'Aurelia Estates', 'أوريليا العقارية', 'Private real estate advisory · Dubai', 'استشارات عقارية خاصة · دبي', 'en', '{en,ar}',
 '{"preset":"calm-green","layout":"lounge","portraitUrl":"https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=600&fit=crop&crop=faces&q=80","backdropUrl":"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=2400&q=80","ctaLabel":"Book a consultation","ctaLabel_ar":"احجز استشارة","ctaHref":"/contact","fontArabic":"IBM Plex Sans Arabic"}',
 '{"provider":"auto","assistantName":"Aurelia Concierge","assistantName_ar":"مساعد أوريليا","suggestions":["Dubai market overview","Best areas to invest","ROI & rental yields","Mortgage options","Buying costs & fees","Off-plan vs ready"],"suggestions_ar":["نظرة على سوق دبي","أفضل المناطق للاستثمار","العائد والإيجارات","خيارات التمويل العقاري","تكاليف ورسوم الشراء","على الخارطة أم جاهز؟"],"greeting":"Welcome to Aurelia Estates. I can help you explore off-plan and ready properties, compare payment plans, or arrange a private viewing. What are you looking for?","greeting_ar":"أهلاً بك في أوريليا العقارية. يمكنني مساعدتك في استكشاف العقارات على الخارطة والجاهزة، ومقارنة خطط الدفع، أو ترتيب معاينة خاصة. عمّ تبحث؟","instructions":"You represent Aurelia Estates, a boutique advisory for investors buying in Dubai. Be warm, concise and discreet. Always try to understand budget, preferred area, bedrooms and timeline, then recommend matching projects from the inventory. Offer to arrange a call once the visitor shows interest.","temperature":0.4}',
 '{"email":"hello@aurelia.example","phone":"+971 50 000 0000","whatsapp":"971500000000","address":"Business Bay, Dubai, UAE","address_ar":"الخليج التجاري، دبي، الإمارات","hours":"Mon–Sat, 9:00–19:00","hours_ar":"الإثنين–السبت، 9:00–19:00"}',
 '[{"label":"Home","label_ar":"الرئيسية","href":"/"},{"label":"About","label_ar":"من نحن","href":"/about"},{"label":"Projects","label_ar":"المشاريع","href":"/projects"},{"label":"Contact","label_ar":"تواصل معنا","href":"/contact"}]'
),
('22222222-2222-2222-2222-222222222222', 'skyline', 'Skyline Homes', 'سكاي لاين هومز', 'Family homes & rentals', null, 'en', '{en,ar}',
 '{"preset":"modern","layout":"classic"}',
 '{"provider":"auto","assistantName":"Skyline Assistant","greeting":"Hi! Looking for a home? Tell me your budget and preferred area.","temperature":0.5}',
 '{"email":"team@skyline.example","phone":"+971 55 000 0000","whatsapp":"971550000000","address":"Dubai Hills, Dubai"}',
 '[{"label":"Listings","label_ar":"العقارات","href":"/projects"},{"label":"Contact","label_ar":"تواصل معنا","href":"/contact"}]'
);

-- ───────────── pages ─────────────
insert into public.pages (tenant_id, slug, title, title_ar, description, description_ar, sort, sections) values
('11111111-1111-1111-1111-111111111111', '', 'Home', 'الرئيسية', 'Private real estate advisory for investors in Dubai.', 'استشارات عقارية خاصة للمستثمرين في دبي.', 0, '[
  {"id":"h1","type":"hero-split","props":{"eyebrow":"Private real estate advisory · Dubai","eyebrow_ar":"استشارات عقارية خاصة · دبي","title":"Invest in Dubai property with clear numbers and one advisor you can reach.","title_ar":"استثمر في عقارات دبي بأرقام واضحة ومستشار واحد يمكنك الوصول إليه.","subtitle":"Browse a hand-picked portfolio of off-plan and ready projects. See prices, payment plans and expected yields up front, then ask anything.","subtitle_ar":"تصفّح محفظة مختارة بعناية من المشاريع على الخارطة والجاهزة. اطّلع على الأسعار وخطط الدفع والعوائد المتوقعة مسبقاً، ثم اسأل عن أي شيء.","image":"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=2000&q=80","askPlaceholder":"e.g. What can I buy for AED 1.5M with a payment plan?","askPlaceholder_ar":"مثلاً: ماذا يمكنني شراء بـ1.5 مليون درهم مع خطة دفع؟"}},
  {"id":"l1","type":"quick-links","props":{"items":[{"title":"Browse projects","title_ar":"تصفّح المشاريع","body":"Filter by area, status and budget","body_ar":"صنّف حسب المنطقة والحالة والميزانية","href":"/projects","icon":"building"},{"title":"Understand the numbers","title_ar":"افهم الأرقام","body":"Payment plans, fees and yields explained","body_ar":"شرح خطط الدفع والرسوم والعوائد","href":"#faq","icon":"chart"},{"title":"Speak to an advisor","title_ar":"تحدّث إلى مستشار","body":"Call, WhatsApp or book a consultation","body_ar":"اتصال أو واتساب أو احجز استشارة","href":"/contact","icon":"person"}]}},
  {"id":"f1","type":"featured-projects","props":{"title":"Featured projects","title_ar":"مشاريع مميّزة","subtitle":"Hand-picked off-plan and ready opportunities, with the key numbers on every card.","subtitle_ar":"فرص مختارة بعناية على الخارطة وجاهزة، مع الأرقام الأساسية على كل بطاقة.","limit":3}},
  {"id":"w1","type":"steps","props":{"title":"From first shortlist to handover, in three steps","title_ar":"من القائمة الأولى حتى التسليم، في ثلاث خطوات","subtitle":"Sample copy for this demo site. Replace it with how you guide your own clients.","subtitle_ar":"نص تجريبي لهذا الموقع النموذجي. استبدله بطريقتك في إرشاد عملائك.","image":"https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&q=80","items":[{"title":"Tell us your goals","title_ar":"أخبرنا بأهدافك","body":"Capital growth, rental yield or a home for the family. Share your budget, timeline and appetite for risk.","body_ar":"نمو رأس المال أو العائد الإيجاري أو منزل للعائلة. شاركنا ميزانيتك وإطارك الزمني ومدى تقبّلك للمخاطر."},{"title":"Get a shortlist with honest numbers","title_ar":"احصل على قائمة مختصرة بأرقام صادقة","body":"A curated set of projects, each with a full cost sheet: price, fees, payment plan and expected yield.","body_ar":"مجموعة مختارة من المشاريع، لكل منها بيان تكاليف كامل: السعر والرسوم وخطة الدفع والعائد المتوقع."},{"title":"View, reserve and hand over","title_ar":"المعاينة والحجز والتسليم","body":"We arrange viewings, guide you through reservation, and manage leasing or resale when you are ready.","body_ar":"ننظّم المعاينات، ونرشدك خلال الحجز، وندير التأجير أو إعادة البيع حين تكون مستعداً."}]}},
  {"id":"q1","type":"faq","props":{"title":"Questions buyers ask first","title_ar":"أول ما يسأل عنه المشترون"}},
  {"id":"c1","type":"cta","props":{"title":"Want a private investment consultation?","title_ar":"هل تريد استشارة استثمارية خاصة؟","body":"Tell us your goals and we will prepare a curated shortlist. Mon–Sat, 9:00–19:00.","body_ar":"أخبرنا بأهدافك وسنُعدّ لك قائمة مختارة. الإثنين–السبت، 9:00–19:00.","ctaLabel":"Book a consultation","ctaLabel_ar":"احجز استشارة","ctaHref":"/contact"}}
]'),
('11111111-1111-1111-1111-111111111111', 'about', 'About', 'من نحن', 'About Aurelia Estates', 'عن أوريليا العقارية', 1, '[
  {"id":"ph","type":"page-header","props":{"title":"Aurelia Estates","title_ar":"أوريليا العقارية","subtitle":"Private real estate advisory for prime assets in Dubai","subtitle_ar":"استشارات عقارية خاصة للأصول المميّزة في دبي"}},
  {"id":"st","type":"story","props":{"items":[
    {"title":"A private advisory for Dubai property","title_ar":"استشارات خاصة لعقارات دبي","body":"Sample story copy for this demo site. Aurelia Estates is a fictional advisory used to show how an agent tells their story: who they serve, and how they guide clients from first shortlist to handover.","body_ar":"نص قصة تجريبي لهذا الموقع النموذجي. أوريليا العقارية شركة استشارات خيالية تُظهر كيف يروي الوسيط قصته: من يخدم، وكيف يرشد عملاءه من القائمة الأولى حتى التسليم.","image":"https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=2000&q=80"},
    {"title":"Investors first, advisors second","title_ar":"مستثمرون أولاً، ومستشارون ثانياً","body":"Every recommendation comes from people who own and trade property in the same communities they advise on. Advice is grounded in practice, not brochures.","body_ar":"كل توصية تأتي من أشخاص يملكون العقارات ويتداولونها في المجتمعات نفسها التي ينصحون بها. نصائحنا مبنية على التجربة لا على الكتيّبات.","image":"https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=2000&q=80"},
    {"title":"Built on referrals","title_ar":"قائمة على التوصيات","body":"Discretion, honest numbers and long relationships matter more than any single transaction. Replace this sample chapter with how your own clients find you.","body_ar":"السرّية والأرقام الصادقة والعلاقات الطويلة أهم من أي صفقة منفردة. استبدل هذا الفصل التجريبي بالطريقة التي يصل بها عملاؤك إليك.","image":"https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=2000&q=80"},
    {"title":"Strategies tailored to you","title_ar":"استراتيجيات مصمّمة لك","body":"Capital growth, rental yield or a home for the family: we shape a portfolio around your timeline and risk, then manage leasing and resale when you are ready.","body_ar":"نمو رأس المال أو العائد الإيجاري أو منزل للعائلة: نبني محفظتك حول إطارك الزمني ومستوى المخاطرة، ثم ندير التأجير وإعادة البيع حين تكون مستعداً.","image":"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=2000&q=80"}
  ]}},
  {"id":"a2","type":"cta","props":{"title":"Want a private investment consultation?","title_ar":"هل تريد استشارة استثمارية خاصة؟","body":"Tell us your goals and we will prepare a curated shortlist.","body_ar":"أخبرنا بأهدافك وسنُعدّ لك قائمة مختارة.","ctaLabel":"Contact us","ctaLabel_ar":"تواصل معنا","ctaHref":"/contact"}}
]'),
('11111111-1111-1111-1111-111111111111', 'contact', 'Contact', 'تواصل معنا', 'Get in touch', 'تواصل معنا', 2, '[
  {"id":"k1","type":"contact","props":{"title":"Get in Touch","title_ar":"تواصل معنا","subtitle":"Questions about an opportunity? Schedule a private consultation and decide with confidence.","subtitle_ar":"لديك أسئلة عن فرصة ما؟ احجز استشارة خاصة واتخذ قرارك بثقة."}}
]'),
('22222222-2222-2222-2222-222222222222', '', 'Home', null, 'Family homes in Dubai', null, 0, '[
  {"id":"h1","type":"hero","props":{"title":"Find a home your family will love","subtitle":"Villas and townhouses in Dubai''s best communities.","image":"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=2000&q=80","ctaLabel":"View listings","ctaHref":"/projects"}},
  {"id":"g1","type":"project-grid","props":{"title":"Available now"}},
  {"id":"k1","type":"contact","props":{"title":"Book a viewing"}}
]'),
('22222222-2222-2222-2222-222222222222', 'contact', 'Contact', null, 'Contact Skyline Homes', null, 1, '[
  {"id":"k1","type":"contact","props":{"title":"Book a viewing"}}
]');

-- ───────────── projects (fictional) ─────────────
insert into public.projects (tenant_id, title, title_ar, developer, developer_ar, area, area_ar, city, city_ar, property_type, property_type_ar, status, bedrooms, bedrooms_ar, price_from, handover, handover_ar, payment_plan, payment_plan_ar, roi, roi_ar, description, description_ar, amenities, amenities_ar, images, featured, sort) values
('11111111-1111-1111-1111-111111111111', 'Marina Vista Residences', 'مساكن مارينا فيستا', 'Demo Developer A', 'مطوّر تجريبي A', 'Dubai Marina', 'دبي مارينا', 'Dubai', 'دبي', 'Apartment', 'شقة', 'off-plan', '1, 2, 3', '1، 2، 3', 1450000, 'Q4 2027', 'الربع الرابع 2027',
 '60/40 — 60% during construction, 40% on handover', '60/40 — 60% خلال الإنشاء، و40% عند التسليم', '6–7% expected gross yield', 'عائد إجمالي متوقع 6–7%',
 'Waterfront tower with full marina views, a sky pool on level 52 and direct promenade access. Ideal for short-term rental investors.',
 'برج على الواجهة المائية بإطلالات كاملة على المارينا، ومسبح معلّق في الطابق 52، ووصول مباشر إلى الممشى. مثالي لمستثمري الإيجار قصير الأجل.',
 '{"Sky pool","Gym","Concierge","Marina promenade access"}', '{"مسبح معلّق","نادٍ رياضي","خدمة كونسيرج","وصول إلى ممشى المارينا"}',
 '{"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=80","https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1400&q=80"}', true, 0),
('11111111-1111-1111-1111-111111111111', 'Palm Crescent Villas', 'فلل بالم كريسنت', 'Demo Developer B', 'مطوّر تجريبي B', 'Palm Jumeirah', 'نخلة جميرا', 'Dubai', 'دبي', 'Villa', 'فيلا', 'off-plan', '4, 5, 6', '4، 5، 6', 18500000, 'Q2 2028', 'الربع الثاني 2028',
 '50/50', '50/50', 'Capital-growth focused', 'تركيز على نمو رأس المال',
 'A limited collection of beachfront villas with private pools and landscaped gardens on the Palm''s crescent.',
 'مجموعة محدودة من الفلل على الشاطئ مع مسابح خاصة وحدائق منسّقة على هلال النخلة.',
 '{"Private beach","Private pool","Smart home","Staff quarters"}', '{"شاطئ خاص","مسبح خاص","منزل ذكي","سكن للعاملين"}',
 '{"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=80","https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1400&q=80"}', true, 1),
('11111111-1111-1111-1111-111111111111', 'Downtown Arc Tower', 'برج داون تاون آرك', 'Demo Developer A', 'مطوّر تجريبي A', 'Downtown Dubai', 'وسط مدينة دبي', 'Dubai', 'دبي', 'Apartment', 'شقة', 'ready', 'Studio, 1, 2', 'استوديو، 1، 2', 1150000, 'Ready', 'جاهز',
 'Cash or mortgage; post-handover plan available on selected units', 'نقداً أو بتمويل عقاري؛ خطة دفع بعد التسليم متاحة لوحدات مختارة', '7–8% expected gross yield', 'عائد إجمالي متوقع 7–8%',
 'Ready-to-move apartments steps from the Boulevard, with views toward the city skyline. Tenanted units available.',
 'شقق جاهزة للسكن على بُعد خطوات من البوليفارد، بإطلالات على أفق المدينة. تتوفر وحدات مؤجّرة.',
 '{"Infinity pool","Gym","Kids area","Retail podium"}', '{"مسبح لا متناهٍ","نادٍ رياضي","منطقة للأطفال","منصة تجزئة"}',
 '{"https://images.unsplash.com/photo-1546412414-8035e1776c9a?w=1400&q=80"}', true, 2),
('11111111-1111-1111-1111-111111111111', 'Creek Garden Townhouses', 'تاون هاوس كريك غاردن', 'Demo Developer C', 'مطوّر تجريبي C', 'Dubai Creek Harbour', 'مرسى خور دبي', 'Dubai', 'دبي', 'Townhouse', 'تاون هاوس', 'off-plan', '3, 4', '3، 4', 3200000, 'Q1 2028', 'الربع الأول 2028',
 '70/30 with 1% monthly', '70/30 مع 1% شهرياً', '5–6% expected gross yield', 'عائد إجمالي متوقع 5–6%',
 'Family townhouses wrapped around a central park, minutes from the creek and the future tallest tower district.',
 'منازل تاون هاوس عائلية تحيط بحديقة مركزية، على بُعد دقائق من الخور ومنطقة البرج الأعلى المستقبلية.',
 '{"Central park","Community pool","Cycling tracks","Nursery"}', '{"حديقة مركزية","مسبح مجتمعي","مسارات للدراجات","حضانة"}',
 '{"https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=1400&q=80"}', false, 3),
('11111111-1111-1111-1111-111111111111', 'Business Bay Lofts', 'شقق لوفت الخليج التجاري', 'Demo Developer B', 'مطوّر تجريبي B', 'Business Bay', 'الخليج التجاري', 'Dubai', 'دبي', 'Apartment', 'شقة', 'off-plan', 'Studio, 1', 'استوديو، 1', 890000, 'Q3 2027', 'الربع الثالث 2027',
 '80/20', '80/20', '7% expected gross yield', 'عائد إجمالي متوقع 7%',
 'Compact, design-led lofts aimed at young professionals, close to the canal and DIFC.',
 'شقق لوفت مدمجة بتصميم عصري موجّهة للمهنيين الشباب، قريبة من القناة ومركز دبي المالي العالمي.',
 '{"Co-working lounge","Rooftop gym","Canal views"}', '{"صالة عمل مشتركة","نادٍ رياضي على السطح","إطلالات على القناة"}',
 '{"https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=1400&q=80"}', false, 4),
('22222222-2222-2222-2222-222222222222', 'Hills Park Villa 4BR', null, 'Demo Developer D', null, 'Dubai Hills Estate', null, 'Dubai', null, 'Villa', null, 'ready', '4', null, 6900000, 'Ready', null,
 'Mortgage-friendly', null, null, null,
 'Corner villa backing onto the park, renovated kitchen, private garden.', null,
 '{"Garden","Park view","Maid room"}', '{}',
 '{"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=80"}', true, 0);

-- Price growth since launch on one demo project, charted on its project page.
update public.projects set
  bedrooms = 'Studio, 1, 2, 3',
  bedrooms_ar = 'استوديو، 1، 2، 3',
  price_from = 750000,
  for_sale = true,
  price_growth = '{"label":"Granada (4)","label_ar":"غرناطة (4)","beforeLabel":"Launch","beforeLabel_ar":"الإطلاق","nowLabel":"Today","nowLabel_ar":"اليوم","note":null,"units":[
    {"unit":"Studio","unit_ar":"استوديو","available":4,"size":"37–44","before":591000,"now":750000,"psfBefore":1484,"psfNow":1884,"paid":236400},
    {"unit":"1 BR","unit_ar":"غرفة نوم","available":6,"size":"60–77","before":909000,"now":1150000,"psfBefore":1409,"psfNow":1782,"paid":363600},
    {"unit":"2 BR","unit_ar":"غرفتا نوم","available":3,"size":"105","before":1360000,"now":1720000,"psfBefore":1203,"psfNow":1523,"paid":544000},
    {"unit":"2 BR + maid","unit_ar":"غرفتا نوم + غرفة خادمة","available":2,"size":"135","before":1670000,"now":2000000,"psfBefore":1150,"psfNow":1380,"paid":668000},
    {"unit":"3 BR","unit_ar":"3 غرف نوم","available":0,"size":"175","before":1959000,"now":2300000,"psfBefore":1040,"psfNow":1221,"paid":783000}]}'
where tenant_id = '11111111-1111-1111-1111-111111111111' and title = 'Marina Vista Residences';

insert into public.faqs (tenant_id, question, question_ar, answer, answer_ar, sort) values
('11111111-1111-1111-1111-111111111111', 'Can foreigners buy property in Dubai?', 'هل يمكن للأجانب شراء العقارات في دبي؟',
 'Yes. Non-residents can buy freehold property in designated areas such as Dubai Marina, Downtown, Palm Jumeirah and Business Bay.',
 'نعم. يمكن لغير المقيمين شراء العقارات بنظام التملّك الحر في المناطق المخصّصة مثل دبي مارينا ووسط المدينة ونخلة جميرا والخليج التجاري.', 0),
('11111111-1111-1111-1111-111111111111', 'What are the buying costs?', 'ما هي تكاليف الشراء؟',
 'Budget roughly 4% Dubai Land Department fee, plus registration and agency fees. We provide a full cost sheet for each unit.',
 'خصّص نحو 4% رسوم دائرة الأراضي والأملاك في دبي، إضافة إلى رسوم التسجيل والوساطة. نوفّر بيان تكاليف كاملاً لكل وحدة.', 1),
('11111111-1111-1111-1111-111111111111', 'Does buying property give me a residency visa?', 'هل يمنحني شراء العقار تأشيرة إقامة؟',
 'Property investments above certain thresholds can qualify for long-term residency. We can connect you with specialists to confirm current rules.',
 'الاستثمارات العقارية التي تتجاوز حدوداً معيّنة قد تؤهّل للإقامة طويلة الأمد. يمكننا ربطك بمختصين لتأكيد الأنظمة الحالية.', 2),
('11111111-1111-1111-1111-111111111111', 'How do off-plan payment plans work?', 'كيف تعمل خطط الدفع للمشاريع على الخارطة؟',
 'You pay in instalments linked to construction milestones or dates, with the balance on handover. Some projects offer post-handover plans.',
 'تدفع على أقساط مرتبطة بمراحل الإنشاء أو بتواريخ محددة، ويُسدَّد الباقي عند التسليم. وتقدّم بعض المشاريع خطط دفع بعد التسليم.', 3);

insert into public.knowledge (tenant_id, title, content) values
('11111111-1111-1111-1111-111111111111', 'Viewing process', 'Private viewings can be arranged 7 days a week, in person or by live video call. Show-flat visits for off-plan projects take about 45 minutes.'),
('11111111-1111-1111-1111-111111111111', 'Advisory fees', 'For off-plan purchases the developer pays our commission, so buyers pay no advisory fee. For resale, a 2% agency fee applies.');

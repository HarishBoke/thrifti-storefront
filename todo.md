# Thrifti Storefront TODO

## Core Features
- [x] Project foundation: schema, Shopify API layer, global styles
- [x] Shopify Storefront API integration (products, collections, cart)
- [x] Global navigation header with logo, search, cart icon, mobile menu
- [x] Animated banner ticker: SELL * EVOLVE * BUY
- [x] Footer with About/Community/Help columns and social icons
- [x] Homepage hero section with three product images and colored borders
- [x] Homepage value proposition section with step-by-step selling guide
- [x] Homepage Sell/Buy/Repeat three-pillar feature cards
- [x] Product listing page with filtering and search
- [x] Product detail page with image gallery, variant selection, add-to-cart
- [x] Shopping cart with line items, quantity updates, checkout redirect
- [x] WhatsApp CTA button for seller onboarding
- [x] User authentication and account management
- [x] Owner email notification on new orders
- [x] LLM-powered product description generator
- [x] Collections page and collection detail page
- [x] About page with brand story and values
- [x] Shared Shopify types (safe for client import, no process.env)
- [x] Fully responsive design (mobile/tablet/desktop)
- [x] Vitest unit tests (15 tests passing)

## Design Alignment Tasks (iPhone 16 Plus Mobile Design)
- [x] Update WhatsApp number to +91 80652 53722 across all pages
- [x] Analyze mobile design PDF and extract design tokens
- [x] Rebuild homepage to pixel-perfectly match iPhone 16 Plus mobile design
- [x] Rebuild Navbar to match mobile design (BUY.SELL.REPEAT. tagline, red THRIFTI logo)
- [x] Rebuild Footer to match mobile design (large THRIFTI wordmark, red background)
- [x] Fix AnimatedBanner text to use SELL * EVOLVE * BUY with asterisks
- [x] Upload exact polaroid photos from design to CDN (SELL/BUY/REPEAT)
- [x] Update hero section with dark warehouse photo
- [x] Update "COMPLETE THE LOOK" puzzle section with correct photos
- [x] Update "BUILT FOR BANGALORE" section with correct photos
- [x] Update fashion show dark section with correct photo
- [x] Derive and implement desktop layout from mobile design
- [x] Verify full responsiveness across mobile/tablet/desktop

## Footer Pages & Content (from thrifti.in)
- [x] Scrape all pages from thrifti.in for content (sub-pages return 404 on live site, built with brand voice)
- [x] How Thrifti Works page (/how-it-works) — 5-step sell guide, buyer section, quick FAQs
- [x] FAQ page (/faqs) — 4 categories, accordion, WhatsApp CTA
- [x] Contact Us page (/contact) — contact info cards, contact form, WhatsApp CTA
- [x] Partner Up page (/partner) — 4 partner types, stats banner, application form
- [x] Returns Policy page (/returns) — full policy with prose typography
- [x] Shipping Policy page (/shipping) — full policy with delivery timeframes
- [x] Terms of Use page (/terms) — full legal terms for Meshi Commerce Pvt. Ltd
- [x] Privacy Policy page (/privacy) — full GDPR/Indian privacy law compliant policy
- [x] Wire all footer links to correct routes (all 9 links working)
- [x] Verify all navigation works end-to-end (tested in browser)

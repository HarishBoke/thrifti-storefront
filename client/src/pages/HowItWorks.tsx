import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import StorefrontLayout from "@/components/StorefrontLayout";
import { MessageCircle, Camera, Tag, ShoppingBag, RefreshCw, CheckCircle } from "lucide-react";

const WHATSAPP_NUMBER = "918065253722";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Hey!%20I%20want%20to%20start%20selling%20on%20Thrifti`;

const SELL_STEPS = [
  {
    number: "01",
    icon: MessageCircle,
    title: "Ping Us on WhatsApp",
    desc: "Send us a message on WhatsApp at +91 80652 53722. Our team is ready to onboard you as a seller in under 5 minutes. No forms, no waiting.",
  },
  {
    number: "02",
    icon: Camera,
    title: "Snap Your Items",
    desc: "Take clear photos of your clothes — front, back, and any details. Good lighting makes all the difference. We'll guide you through it.",
  },
  {
    number: "03",
    icon: Tag,
    title: "We Price & List It",
    desc: "Our team helps you price your items fairly using market data. We create the listing, write the description, and publish it on the platform.",
  },
  {
    number: "04",
    icon: ShoppingBag,
    title: "Buyer Places an Order",
    desc: "When someone buys your item, you'll get notified instantly. We handle payments securely and coordinate the handover.",
  },
  {
    number: "05",
    icon: RefreshCw,
    title: "Repeat the Cycle",
    desc: "Your wardrobe keeps evolving. Sell what you've outgrown, buy what inspires you next. That's the Thrifti loop.",
  },
];

const BUY_STEPS = [
  {
    number: "01",
    icon: ShoppingBag,
    title: "Browse the Collection",
    desc: "Explore hundreds of curated pre-loved pieces across women's and men's fashion. Filter by size, category, brand, and price.",
  },
  {
    number: "02",
    icon: CheckCircle,
    title: "Every Item is Verified",
    desc: "Our team personally checks every item for quality, authenticity, and accurate sizing before it goes live. No surprises.",
  },
  {
    number: "03",
    icon: Tag,
    title: "Add to Cart & Checkout",
    desc: "Found something you love? Add it to your cart and checkout securely. We accept all major payment methods.",
  },
  {
    number: "04",
    icon: RefreshCw,
    title: "Wear It, Love It, Resale It",
    desc: "Wear your new find. When you're ready for a change, list it back on Thrifti and keep the circular fashion loop going.",
  },
];

const FAQS_PREVIEW = [
  { q: "How long does it take to list my item?", a: "Once you send us your photos on WhatsApp, we typically list your item within 24 hours." },
  { q: "What percentage do I keep from the sale?", a: "Sellers keep 70% of the sale price. Thrifti takes a 30% commission to cover listing, photography guidance, and platform costs." },
  { q: "What items can I sell?", a: "We accept women's and men's clothing, shoes, and accessories. Items must be clean, in good condition, and free of major damage." },
];

export default function HowItWorks() {
  return (
    <StorefrontLayout>
      {/* Hero */}
      <div className="bg-[oklch(0.12_0.01_260)] text-white py-16 sm:py-24 text-center">
        <div className="container max-w-3xl mx-auto">
          <p
            className="text-white/50 text-xs font-bold tracking-[0.35em] uppercase mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            The Thrifti Way
          </p>
          <h1
            className="text-5xl sm:text-7xl font-black mb-6 leading-none"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            How Thrifti<br />Works
          </h1>
          <p className="text-white/70 text-lg leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
            Circular fashion made simple. Sell your pre-loved clothes in minutes,
            buy curated pieces at honest prices. No complicated listings, no middlemen — just style that keeps moving.
          </p>
        </div>
      </div>

      {/* Sell Section */}
      <div className="container max-w-4xl mx-auto py-14 sm:py-20">
        <div className="text-center mb-12">
          <p
            className="text-[oklch(0.52_0.22_25)] text-xs font-bold tracking-[0.35em] uppercase mb-3"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            For Sellers
          </p>
          <h2
            className="text-3xl sm:text-5xl font-black"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Sell in 5 Easy Steps
          </h2>
        </div>

        <div className="space-y-8">
          {SELL_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="flex gap-6 items-start p-6 rounded-sm border border-border hover:border-[oklch(0.52_0.22_25)] transition-colors"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-[oklch(0.52_0.22_25)] rounded-sm flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="text-[oklch(0.52_0.22_25)] text-xs font-bold tracking-widest"
                      style={{ fontFamily: "'Space Mono', monospace" }}
                    >
                      {step.number}
                    </span>
                    <h3
                      className="text-lg font-black"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            <Button
              className="bg-[oklch(0.52_0.22_25)] hover:bg-[oklch(0.45_0.22_25)] text-white font-bold px-10 py-6 text-base gap-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <MessageCircle className="w-5 h-5" />
              Start Selling on WhatsApp
            </Button>
          </a>
        </div>
      </div>

      {/* Divider banner */}
      <div className="bg-[oklch(0.52_0.22_25)] py-4 overflow-hidden">
        <div className="flex gap-8 animate-ticker whitespace-nowrap">
          {Array(12).fill(null).map((_, i) => (
            <span
              key={i}
              className="text-white font-bold text-sm tracking-widest uppercase flex-shrink-0"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              SELL * EVOLVE * BUY
            </span>
          ))}
        </div>
      </div>

      {/* Buy Section */}
      <div className="bg-[oklch(0.97_0.01_80)] py-14 sm:py-20">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p
              className="text-[oklch(0.52_0.22_25)] text-xs font-bold tracking-[0.35em] uppercase mb-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              For Buyers
            </p>
            <h2
              className="text-3xl sm:text-5xl font-black"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Buy Bold, Buy Smart
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {BUY_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="bg-white p-7 rounded-sm border border-border"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-[oklch(0.12_0.01_260)] rounded-sm flex items-center justify-center">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span
                      className="text-[oklch(0.52_0.22_25)] text-xs font-bold tracking-widest"
                      style={{ fontFamily: "'Space Mono', monospace" }}
                    >
                      {step.number}
                    </span>
                  </div>
                  <h3
                    className="text-lg font-black mb-2"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link href="/products">
              <Button
                className="bg-[oklch(0.12_0.01_260)] hover:bg-[oklch(0.2_0.01_260)] text-white font-bold px-10 py-6 text-base"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Browse the Collection
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick FAQs */}
      <div className="container max-w-3xl mx-auto py-14 sm:py-20">
        <h2
          className="text-2xl sm:text-3xl font-black text-center mb-10"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Quick Answers
        </h2>
        <div className="space-y-4">
          {FAQS_PREVIEW.map((faq) => (
            <div key={faq.q} className="border border-border rounded-sm p-6">
              <h3
                className="font-black text-base mb-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {faq.q}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                {faq.a}
              </p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/faqs">
            <Button variant="outline" className="border-foreground font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              View All FAQs
            </Button>
          </Link>
        </div>
      </div>
    </StorefrontLayout>
  );
}

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import StorefrontLayout from "@/components/StorefrontLayout";

const WHATSAPP_NUMBER = "918065253722";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Hey!%20I%20have%20a%20question%20about%20Thrifti`;

const FAQ_CATEGORIES = [
  {
    category: "Selling on Thrifti",
    faqs: [
      {
        q: "How do I start selling on Thrifti?",
        a: "It's simple — just message us on WhatsApp at +91 80652 53722. Our team will guide you through the onboarding process in under 5 minutes. No complicated forms or sign-ups required.",
      },
      {
        q: "What items can I sell?",
        a: "We accept women's and men's clothing, footwear, bags, and accessories. Items must be clean, in good wearable condition, and free from major damage like tears, stains, or broken zippers. We do not accept undergarments, swimwear, or heavily worn basics.",
      },
      {
        q: "How is the selling price determined?",
        a: "Our team helps you price your item fairly based on the brand, original retail price, condition, and current market demand. We aim to price items attractively for buyers while ensuring sellers get a fair return.",
      },
      {
        q: "What percentage do I earn from a sale?",
        a: "Sellers keep 70% of the final sale price. Thrifti retains 30% as a platform commission, which covers listing creation, quality verification, payment processing, and customer support.",
      },
      {
        q: "How long does it take to list my item?",
        a: "Once you send us your photos on WhatsApp, we typically create and publish your listing within 24 hours on business days.",
      },
      {
        q: "How and when do I get paid?",
        a: "Payment is transferred to your registered bank account or UPI ID within 3–5 business days after the buyer confirms receipt of the item.",
      },
      {
        q: "Can I set my own price?",
        a: "Yes, you can suggest a price and we'll advise whether it's competitive. Ultimately, the listing price is agreed upon between you and our team before going live.",
      },
    ],
  },
  {
    category: "Buying on Thrifti",
    faqs: [
      {
        q: "Are all items authentic and as described?",
        a: "Yes. Every item on Thrifti is personally verified by our team before listing. We check for quality, condition, accurate sizing, and authenticity. What you see in the photos is what you get.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept all major payment methods including credit/debit cards, UPI, net banking, and popular wallets. All transactions are secured through Shopify's payment gateway.",
      },
      {
        q: "How long does delivery take?",
        a: "Standard delivery takes 3–7 business days depending on your location within India. We ship pan-India. You'll receive a tracking number once your order is dispatched.",
      },
      {
        q: "Can I return an item if it doesn't fit?",
        a: "We accept returns within 48 hours of delivery if the item is significantly different from the listing description. Size-related returns are considered on a case-by-case basis. Please refer to our Returns Policy for full details.",
      },
      {
        q: "What if my item arrives damaged?",
        a: "If your item arrives damaged or not as described, please contact us within 48 hours of delivery with photos. We'll arrange a full refund or replacement.",
      },
    ],
  },
  {
    category: "Account & Orders",
    faqs: [
      {
        q: "Do I need an account to buy?",
        a: "You can browse without an account, but you'll need to sign in to place an order, track your purchases, and manage your wishlist.",
      },
      {
        q: "How do I track my order?",
        a: "Once your order is shipped, you'll receive a tracking link via email and WhatsApp. You can also check your order status in your account dashboard.",
      },
      {
        q: "Can I cancel an order?",
        a: "Orders can be cancelled within 2 hours of placement. After that, the item may already be packed for dispatch. Contact us immediately on WhatsApp if you need to cancel.",
      },
      {
        q: "How do I contact customer support?",
        a: "The fastest way to reach us is via WhatsApp at +91 80652 53722. You can also email us at hello@thrifti.in. We typically respond within a few hours during business hours (10am–7pm IST, Mon–Sat).",
      },
    ],
  },
  {
    category: "Sustainability & Mission",
    faqs: [
      {
        q: "Why should I buy pre-loved fashion?",
        a: "The fashion industry is one of the world's largest polluters. Buying pre-loved extends the life of garments, reduces textile waste, saves water, and cuts carbon emissions. Every Thrifti purchase is a small act of climate action.",
      },
      {
        q: "What is circular fashion?",
        a: "Circular fashion is a model where clothes are kept in use for as long as possible through resale, repair, and recycling — rather than being discarded after a few wears. Thrifti is built on this principle.",
      },
      {
        q: "Is Thrifti only for Bangalore?",
        a: "We started in Bangalore and our community is rooted here, but we ship pan-India. Sellers currently need to be based in Bangalore for item collection, but we're expanding rapidly.",
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        className="w-full text-left py-5 flex items-start justify-between gap-4 group"
        onClick={() => setOpen(!open)}
      >
        <span
          className="font-semibold text-sm sm:text-base leading-snug group-hover:text-[oklch(0.52_0.22_25)] transition-colors"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {q}
        </span>
        <ChevronDown
          className={`w-5 h-5 flex-shrink-0 mt-0.5 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p
          className="text-muted-foreground text-sm leading-relaxed pb-5"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {a}
        </p>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <StorefrontLayout>
      {/* Hero */}
      <div className="bg-[oklch(0.12_0.01_260)] text-white py-16 sm:py-24 text-center">
        <div className="container max-w-2xl mx-auto">
          <p
            className="text-white/50 text-xs font-bold tracking-[0.35em] uppercase mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Got Questions?
          </p>
          <h1
            className="text-5xl sm:text-7xl font-black mb-5 leading-none"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            FAQ's
          </h1>
          <p className="text-white/70 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
            Everything you need to know about buying and selling on Thrifti.
            Can't find your answer? Message us on WhatsApp.
          </p>
        </div>
      </div>

      {/* FAQ Sections */}
      <div className="container max-w-3xl mx-auto py-12 sm:py-16 space-y-12">
        {FAQ_CATEGORIES.map((cat) => (
          <div key={cat.category}>
            <h2
              className="text-xl font-black mb-6 pb-3 border-b-2 border-[oklch(0.52_0.22_25)]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {cat.category}
            </h2>
            <div>
              {cat.faqs.map((faq) => (
                <FAQItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Still have questions CTA */}
      <div className="bg-[oklch(0.52_0.22_25)] py-14 text-center text-white">
        <div className="container max-w-2xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl font-black mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Still Have Questions?
          </h2>
          <p className="text-white/80 mb-8 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
            Our team is available on WhatsApp from 10am–7pm IST, Monday to Saturday.
            We typically respond within a few hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <Button
                className="bg-white text-[oklch(0.52_0.22_25)] hover:bg-white/90 font-bold px-8 py-5"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Chat on WhatsApp
              </Button>
            </a>
            <Link href="/contact">
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white/10 font-bold px-8 py-5"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}

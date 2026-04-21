import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import StorefrontLayout from "@/components/StorefrontLayout";
import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "918065253722";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Hey!%20I%20want%20to%20know%20more%20about%20Thrifti`;

export default function About() {
  return (
    <StorefrontLayout>
      {/* Hero */}
      <div className="bg-[oklch(0.52_0.22_25)] text-white py-16 sm:py-24">
        <div className="container text-center max-w-3xl mx-auto">
          <p
            className="text-white/60 text-xs font-semibold tracking-[0.3em] uppercase mb-4 font-['Space_Grotesk']"
          >
            Our Story
          </p>
          <h1
            className="text-4xl sm:text-6xl font-black mb-6 font-['Playfair_Display']"
          >
            Fashion Forward,<br />Planet First.
          </h1>
          <p className="text-white/80 text-lg leading-relaxed font-['Inter']">
            Thrifti is India's first circular fashion marketplace, built for Bangalore and made for India.
            We believe your wardrobe is a transition fund — sell what you've outgrown, wear what you're becoming.
          </p>
        </div>
      </div>

      {/* Mission */}
      <div className="container py-12 sm:py-20 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <p
              className="text-[oklch(0.52_0.22_25)] text-xs font-semibold tracking-[0.3em] uppercase mb-3 font-['Space_Grotesk']"
            >
              Why Thrifti
            </p>
            <h2
              className="text-3xl sm:text-4xl font-black mb-5 font-['Playfair_Display']"
            >
              Circular Fashion<br />For Everyone
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4 font-['Inter']">
              The fashion industry is one of the world's largest polluters. At Thrifti, we're on a mission to change
              that — one wardrobe at a time. By giving pre-loved clothes a second life, we reduce waste, save water,
              and cut carbon emissions.
            </p>
            <p className="text-muted-foreground leading-relaxed font-['Inter']">
              Our WhatsApp-first selling experience makes it effortless to list your items in under 60 seconds,
              while our curated marketplace ensures buyers find quality pieces they'll love.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { stat: "60s", label: "To list an item" },
              { stat: "100%", label: "Authenticated items" },
              { stat: "0", label: "Landfill guilt" },
              { stat: "∞", label: "Style possibilities" },
            ].map((item) => (
              <div key={item.label} className="bg-[oklch(0.97_0.01_80)] rounded-sm p-6 text-center">
                <p
                  className="text-3xl font-black text-[oklch(0.52_0.22_25)] mb-1 font-['Playfair_Display']"
                >
                  {item.stat}
                </p>
                <p className="text-xs text-muted-foreground font-medium font-['Space_Grotesk']">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-[oklch(0.12_0.01_260)] text-white py-12 sm:py-16">
        <div className="container max-w-4xl mx-auto">
          <h2
            className="text-2xl sm:text-3xl font-black text-center mb-10 font-['Playfair_Display']"
          >
            The Thrifti Way
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { title: "SELL", desc: "Turn your unworn clothes into cash. Every item in your wardrobe has value — let us help you unlock it." },
              { title: "BUY", desc: "Discover curated pre-loved fashion at a fraction of retail price. Quality pieces, conscious choices." },
              { title: "REPEAT", desc: "Fashion is cyclical. Keep the loop going — buy, wear, sell, repeat. That's the Thrifti way." },
            ].map((v) => (
              <div key={v.title} className="text-center">
                <h3
                  className="text-4xl font-black text-[oklch(0.52_0.22_25)] mb-3 font-['Playfair_Display']"
                >
                  {v.title}
                </h3>
                <p className="text-white/70 text-sm leading-relaxed font-['Inter']">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="container py-12 sm:py-16 text-center max-w-2xl mx-auto">
        <h2
          className="text-3xl sm:text-4xl font-black mb-4 font-['Playfair_Display']"
        >
          Ready to Join the Movement?
        </h2>
        <p className="text-muted-foreground mb-8 font-['Inter']">
          Start selling your pre-loved items today or browse our curated collection.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            <Button
              className="bg-[oklch(0.52_0.22_25)] hover:bg-[oklch(0.45_0.22_25)] text-white font-semibold px-8 gap-2 font-['Space_Grotesk']"
            >
              <MessageCircle className="w-4 h-4" />
              Start Selling on WhatsApp
            </Button>
          </a>
          <Link href="/products">
            <Button
              variant="outline"
              className="border-foreground font-semibold px-8 font-['Space_Grotesk']"
            >
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    </StorefrontLayout>
  );
}

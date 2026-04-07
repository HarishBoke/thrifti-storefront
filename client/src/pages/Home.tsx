import { Link } from "wouter";
import { ArrowRight, MessageCircle, Camera, DollarSign, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import StorefrontLayout from "@/components/StorefrontLayout";
import { trpc } from "@/lib/trpc";
import ProductCard from "@/components/ProductCard";

const HERO_IMAGES = [
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663413686037/RdJ3855myHy6XYmFtkiXgE/Frame 7_a8535041.png",
    alt: "Street fashion editorial",
    borderColor: "#E63329",
    label: "Street Style",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663413686037/RdJ3855myHy6XYmFtkiXgE/Mask group_eedaf132.png",
    alt: "Sustainable fashion",
    borderColor: "#2A9D8F",
    label: "Sustainable",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663413686037/RdJ3855myHy6XYmFtkiXgE/Gemini_Generated_Image_nmi8denmi8denmi8 2_d66ca3e9.png",
    alt: "Colourful fashion",
    borderColor: "#E9C46A",
    label: "Colourful",
  },
];

const SELL_STEPS = [
  { icon: MessageCircle, title: "PING US", desc: 'Shoot us a "Hey!, Hi!" on WhatsApp.' },
  { icon: Camera, title: "SNAP", desc: "Take a clean photo of your item." },
  { icon: DollarSign, title: "SELL", desc: "Get paid & ship with our concierge." },
];

const PILLARS = [
  {
    word: "SELL",
    tagline: "SELL THE OLD YOU",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663413686037/RdJ3855myHy6XYmFtkiXgE/Group 97-1_f5130415.png",
    rotate: "-2deg",
  },
  {
    word: "BUY",
    tagline: "WEAR THE NEW YOU",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663413686037/RdJ3855myHy6XYmFtkiXgE/Group 91_0b388912.png",
    rotate: "1.5deg",
  },
  {
    word: "REPEAT",
    tagline: "BE NEW YOU WITH THRIFTI",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663413686037/RdJ3855myHy6XYmFtkiXgE/Frame 7_a8535041.png",
    rotate: "-1deg",
  },
];

export default function Home() {
  const { data: productsData, isLoading: productsLoading } = trpc.products.list.useQuery({ first: 8, reverse: true });
  const featuredProducts = productsData?.products ?? [];

  return (
    <StorefrontLayout>
      {/* HERO */}
      <section className="bg-[oklch(0.97_0.01_80)] py-10 sm:py-16 lg:py-20 overflow-hidden">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <p className="text-[oklch(0.52_0.22_25)] text-xs sm:text-sm font-semibold tracking-[0.3em] uppercase mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Circular Fashion Marketplace
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.95] tracking-tight text-foreground mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                Buy.<br />Sell.<br /><span className="text-[oklch(0.52_0.22_25)]">Repeat.</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-md leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                India's first circular fashion marketplace. Sell what you've outgrown. Wear what you're becoming.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/products">
                  <Button className="bg-[oklch(0.52_0.22_25)] hover:bg-[oklch(0.45_0.22_25)] text-white font-semibold px-6 py-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Shop Now <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/sell">
                  <Button variant="outline" className="border-foreground text-foreground hover:bg-foreground hover:text-background font-semibold px-6 py-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Start Selling
                  </Button>
                </Link>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {HERO_IMAGES.map((img, i) => (
                  <div key={i} className="relative aspect-[3/4] rounded-sm overflow-hidden group" style={{ outline: `3px solid ${img.borderColor}`, outlineOffset: "3px" }}>
                    <img src={img.src} alt={img.alt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <span className="absolute bottom-2 left-2 text-white text-[10px] sm:text-xs font-semibold tracking-wider uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{img.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[oklch(0.52_0.22_25)] text-xs font-semibold tracking-[0.3em] uppercase mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Fresh Drops</p>
              <h2 className="text-3xl sm:text-4xl font-black text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>New Arrivals</h2>
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-1 text-sm font-medium text-[oklch(0.52_0.22_25)] hover:underline" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array(8).fill(null).map((_, i) => <div key={i} className="aspect-[3/4] bg-muted rounded-md animate-pulse" />)}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg mb-2">Products coming soon</p>
              <p className="text-sm">Connect your Shopify store to display products here.</p>
            </div>
          )}
          <div className="mt-8 text-center sm:hidden">
            <Link href="/products"><Button variant="outline" className="border-foreground">View All <ChevronRight className="ml-1 w-4 h-4" /></Button></Link>
          </div>
        </div>
      </section>

      {/* VALUE PROPOSITION */}
      <section className="py-16 sm:py-20 bg-[oklch(0.97_0.01_80)]">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative">
              <div className="aspect-[4/3] rounded-sm overflow-hidden">
                <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663413686037/RdJ3855myHy6XYmFtkiXgE/Section_1c763575.png" alt="Fashion warehouse" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-[oklch(0.52_0.22_25)] text-white px-4 py-3 rounded-sm shadow-lg">
                <p className="text-xs font-semibold tracking-widest uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>List in</p>
                <p className="text-2xl font-black" style={{ fontFamily: "'Playfair Display', serif" }}>60 sec</p>
              </div>
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight text-foreground mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                Your Wardrobe<br />Is A Transition<br />Fund
              </h2>
              <p className="text-lg sm:text-xl text-foreground mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                List In Less Than 60 Seconds <span className="text-[oklch(0.52_0.22_25)] italic font-semibold">Literally</span>
              </p>
              <div className="mt-8 space-y-5">
                {SELL_STEPS.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[oklch(0.52_0.22_25)]/10 flex items-center justify-center">
                      <step.icon className="w-5 h-5 text-[oklch(0.52_0.22_25)]" />
                    </div>
                    <div>
                      <p className="font-bold text-[oklch(0.52_0.22_25)] text-sm tracking-wider mb-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{step.title}</p>
                      <p className="text-muted-foreground text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <a href="https://wa.me/919999999999?text=Hey!+I+want+to+sell+on+Thrifti" target="_blank" rel="noopener noreferrer">
                  <Button className="bg-[oklch(0.52_0.22_25)] hover:bg-[oklch(0.45_0.22_25)] text-white font-bold px-8 py-3 text-sm tracking-widest uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Start Selling</Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SELL / BUY / REPEAT PILLARS */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-[oklch(0.52_0.22_25)] text-xs font-semibold tracking-[0.3em] uppercase mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>The Thrifti Way</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 lg:gap-10">
            {PILLARS.map((pillar, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="bg-white shadow-xl p-3 pb-10 w-full max-w-xs mx-auto transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] cursor-pointer" style={{ transform: `rotate(${pillar.rotate})` }}>
                  <div className="aspect-[4/5] overflow-hidden bg-muted">
                    <img src={pillar.image} alt={pillar.tagline} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-center text-xs sm:text-sm font-semibold tracking-widest uppercase mt-4 text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{pillar.tagline}</p>
                </div>
                <h3 className="mt-6 text-4xl sm:text-5xl font-black text-foreground tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>{pillar.word}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BRAND STATEMENT */}
      <section className="relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px] sm:min-h-[500px]">
          <div className="bg-[oklch(0.52_0.22_25)] flex items-center justify-center p-12 lg:p-16">
            <div className="text-center text-white">
              <p className="text-xs font-semibold tracking-[0.4em] uppercase mb-4 text-white/70" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Built for Bangalore</p>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Fashion<br />Forward,<br />Planet<br />First.</h2>
              <Link href="/about"><Button variant="outline" className="border-white text-white hover:bg-white hover:text-[oklch(0.52_0.22_25)] font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Our Story</Button></Link>
            </div>
          </div>
          <div className="relative min-h-[300px]">
            <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663413686037/RdJ3855myHy6XYmFtkiXgE/Group 101_212d1c2e.png" alt="Fashion show" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        </div>
      </section>

      {/* WHATSAPP CTA */}
      <section className="py-14 sm:py-20 bg-[oklch(0.12_0.01_260)] text-white">
        <div className="container text-center">
          <p className="text-[oklch(0.52_0.22_25)] text-xs font-semibold tracking-[0.3em] uppercase mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Sell in 60 Seconds</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Ready to Declutter?</h2>
          <p className="text-white/70 text-base sm:text-lg mb-8 max-w-xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>Ping us on WhatsApp, snap a photo, and we'll handle the rest. Your wardrobe is a goldmine.</p>
          <a href="https://wa.me/919999999999?text=Hey!+I+want+to+sell+on+Thrifti" target="_blank" rel="noopener noreferrer">
            <Button className="bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold px-8 py-4 text-base gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              Start Selling on WhatsApp
            </Button>
          </a>
        </div>
      </section>
    </StorefrontLayout>
  );
}

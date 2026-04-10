import { Link } from "wouter";
import { useState, useEffect } from "react";
import StorefrontLayout from "@/components/StorefrontLayout";
import { trpc } from "@/lib/trpc";
import ProductCard from "@/components/ProductCard";

// Launch date: 26 April 2026 midnight IST (UTC+5:30)
const LAUNCH_DATE = new Date("2026-04-26T00:00:00+05:30");

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = LAUNCH_DATE.getTime() - Date.now();
    return Math.max(0, diff);
  });
  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => {
      const diff = LAUNCH_DATE.getTime() - Date.now();
      setTimeLeft(Math.max(0, diff));
    }, 1000);
    return () => clearInterval(id);
  }, [timeLeft]);
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  const launched = timeLeft <= 0;
  return { days, hours, minutes, seconds, launched };
}

const WHATSAPP_URL = "https://wa.me/918065253722?text=Hey!%20I%20want%20to%20sell%20on%20Thrifti";

// CDN images for polaroids and fashion show
const CDN = {
  fashionShow: "https://d2xsxph8kpxj0f.cloudfront.net/310519663413686037/RdJ3855myHy6XYmFtkiXgE/photo-fashion-final_3379776b.png",
  polaroidSell: "https://d2xsxph8kpxj0f.cloudfront.net/310519663413686037/RdJ3855myHy6XYmFtkiXgE/photo-sell-final_a950a217.png",
  polaroidBuy: "https://d2xsxph8kpxj0f.cloudfront.net/310519663413686037/RdJ3855myHy6XYmFtkiXgE/photo-buy-final_97b38991.png",
  polaroidRepeat: "https://d2xsxph8kpxj0f.cloudfront.net/310519663413686037/RdJ3855myHy6XYmFtkiXgE/photo-repeat-final_f6fb09a9.png",
  puzzlePhoto: "https://d2xsxph8kpxj0f.cloudfront.net/310519663413686037/RdJ3855myHy6XYmFtkiXgE/photo-sell-final_a950a217.png",
};

// Watermark words for the sell section background (right side only)
const WATERMARK = [
  { word: "EVOLVE", rotate: "3deg", size: "4.5rem", x: "42%", y: "2%" },
  { word: "BUY", rotate: "-3deg", size: "6rem", x: "60%", y: "8%" },
  { word: "EVOLVE", rotate: "2deg", size: "4rem", x: "35%", y: "16%" },
  { word: "SELL", rotate: "-4deg", size: "5.5rem", x: "55%", y: "22%" },
  { word: "BUY", rotate: "3deg", size: "5rem", x: "38%", y: "30%" },
  { word: "SELL", rotate: "-2deg", size: "6rem", x: "62%", y: "36%" },
  { word: "EVOLVE", rotate: "4deg", size: "4.5rem", x: "40%", y: "44%" },
  { word: "BUY", rotate: "-3deg", size: "5.5rem", x: "58%", y: "50%" },
  { word: "SELL", rotate: "2deg", size: "5rem", x: "36%", y: "58%" },
  { word: "EVOLVE", rotate: "-4deg", size: "4rem", x: "60%", y: "64%" },
  { word: "BUY", rotate: "3deg", size: "6rem", x: "42%", y: "72%" },
  { word: "SELL", rotate: "-2deg", size: "5rem", x: "55%", y: "80%" },
];

function AnimatedTicker() {
  const items = ["SELL", "★", "REPEAT", "★", "BUY", "★", "SELL", "★", "REPEAT", "★", "BUY", "★", "SELL", "★", "REPEAT", "★", "BUY", "★"];
  return (
    <div className="overflow-hidden py-3 relative" style={{ backgroundColor: "var(--thrifti-red)" }}>
      <style>{`
        @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>
      <div
        className="flex gap-6 whitespace-nowrap"
        style={{ animation: "ticker 20s linear infinite", width: "max-content" }}
      >
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="text-white font-black text-sm tracking-[0.3em] uppercase"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function CountdownBanner() {
  const { days, hours, minutes, seconds, launched } = useCountdown();
  if (launched) {
    return (
      <div className="mb-6">
        <span className="inline-block text-white font-black text-sm uppercase tracking-[0.3em] px-4 py-2 border border-white/40" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          WE'RE LIVE!
        </span>
      </div>
    );
  }
  return (
    <div className="flex gap-4 mb-6">
      {[{ val: days, label: "DAYS" }, { val: hours, label: "HRS" }, { val: minutes, label: "MIN" }, { val: seconds, label: "SEC" }].map(({ val, label }) => (
        <div key={label} className="text-center">
          <div className="text-white font-black text-3xl sm:text-4xl leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
            {String(val).padStart(2, "0")}
          </div>
          <div className="text-white/70 text-[10px] tracking-widest mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { data: productsData, isLoading: productsLoading } = trpc.products.list.useQuery({ first: 8, reverse: true });
  const featuredProducts = productsData?.products ?? [];

  return (
    <StorefrontLayout>

      {/* ===== SECTION 1: HERO — Full-bleed with BANNER11-2 image ===== */}
      <section className="relative overflow-hidden" style={{ backgroundColor: "#1a1008", minHeight: "80vh" }}>
        {/* Hero image — man in gold jacket */}
        <img
          src="/hero-main.png"
          alt="Thrifti — Built for how you show up"
          className="absolute inset-0 w-full h-full object-cover object-top"
          style={{ opacity: 0.92 }}
        />
        {/* Dark gradient overlay on left */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 55%, transparent 100%)" }}
        />
        {/* Hero content */}
        <div className="relative z-10 px-6 sm:px-10 lg:px-16 flex flex-col justify-end" style={{ minHeight: "80vh", paddingBottom: "4rem" }}>
          <div className="max-w-md">
            <h1
              className="font-black leading-none text-white mb-3"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(3rem, 8vw, 5.5rem)",
                letterSpacing: "-0.02em",
              }}
            >
              BUILT FOR<br />HOW YOU<br />SHOW UP
            </h1>
            <p
              className="text-white/75 text-xs sm:text-sm tracking-[0.25em] uppercase mb-8"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              WORK. WEEKENDS. EVERYTHING IN BETWEEN.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="thrifti-btn-red inline-flex text-sm font-black tracking-widest"
            >
              SELL NOW
            </a>
          </div>
        </div>
      </section>

      {/* ===== ANIMATED TICKER ===== */}
      <AnimatedTicker />

      {/* ===== SECTION 2: YOUR WARDROBE IS A TRANSITION FUND ===== */}
      <section className="relative overflow-hidden" style={{ backgroundColor: "var(--thrifti-cream)" }}>
        {/* Watermark background — right side only */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true" style={{ zIndex: 0 }}>
          {WATERMARK.map((w, i) => (
            <span
              key={i}
              className="absolute font-black leading-none"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: w.size,
                color: "rgba(0,0,0,0.07)",
                transform: `rotate(${w.rotate})`,
                left: w.x,
                top: w.y,
                whiteSpace: "nowrap",
              }}
            >
              {w.word}
              {i % 3 !== 2 && (
                <span style={{ color: "rgba(232,41,28,0.25)", fontSize: "0.4em", verticalAlign: "middle", margin: "0 0.3em" }}>✳</span>
              )}
            </span>
          ))}
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-2" style={{ zIndex: 1 }}>
          {/* Left: Text content */}
          <div className="px-6 sm:px-10 lg:px-16 py-14 sm:py-20 flex flex-col justify-center">
            <h2
              className="font-black leading-tight mb-6"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                color: "var(--thrifti-dark)",
                letterSpacing: "-0.01em",
              }}
            >
              YOUR WARDROBE<br />IS A TRANSITION<br />FUND
            </h2>
            <p
              className="font-black mb-6 leading-tight"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(1.3rem, 3vw, 2rem)",
                color: "var(--thrifti-dark)",
              }}
            >
              List In Less<br />
              Than 60 Seconds{" "}
              <span className="italic underline decoration-2" style={{ color: "var(--thrifti-red)", textDecorationColor: "var(--thrifti-red)" }}>
                Literally
              </span>
            </p>

            {/* Steps */}
            <div className="flex flex-col gap-5 mb-10 max-w-xs">
              {[
                { label: "PING US", desc: 'Shoot us a "Hey!, Hi!" on WhatsApp.' },
                { label: "SNAP", desc: "Take a clean photo of your item." },
                { label: "SELL", desc: "Get paid & ship with our concierge." },
              ].map((step) => (
                <div key={step.label}>
                  <p className="font-black text-sm tracking-wider mb-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-red)" }}>
                    {step.label}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ fontFamily: "'Space Mono', monospace", color: "var(--thrifti-dark)" }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="thrifti-btn-red inline-flex text-sm font-black tracking-widest self-start"
            >
              START SELLING
            </a>
          </div>

          {/* Right: Sell section image (Group96 — phone photographing jacket) */}
          <div className="relative flex items-stretch overflow-hidden" style={{ minHeight: "420px" }}>
            <img
              src="/sell-section-bg.png"
              alt="Sell on Thrifti"
              className="w-full object-cover object-center"
            />
            {/* "SELL ON THRIFTI" badge */}
            <div
              className="absolute bottom-6 right-6 px-4 py-2 text-white font-black text-xs tracking-widest uppercase"
              style={{
                backgroundColor: "var(--thrifti-dark)",
                fontFamily: "'Space Grotesk', sans-serif",
                transform: "rotate(-2deg)",
              }}
            >
              SELL ON THRIFTI
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 3: COMPLETE THE LOOK (Red bg) ===== */}
      <section style={{ backgroundColor: "var(--thrifti-red)" }}>
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left: Puzzle image */}
          <div className="px-6 sm:px-10 lg:px-12 py-10 flex flex-col items-start justify-center">
            <div className="relative" style={{ maxWidth: "280px", width: "100%" }}>
              <div className="relative overflow-hidden" style={{ border: "3px solid white" }}>
                <img
                  src={CDN.puzzlePhoto}
                  alt="Complete the look"
                  className="w-full block"
                  style={{ aspectRatio: "4/5", objectFit: "cover" }}
                />
                {/* Puzzle grid overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: "linear-gradient(to right, rgba(232,41,28,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(232,41,28,0.5) 1px, transparent 1px)",
                    backgroundSize: "33.33% 33.33%",
                  }}
                />
              </div>
              {/* Thumbnail strip A, B, C */}
              <div className="flex gap-2 mt-3">
                {["A", "B", "C"].map((label) => (
                  <div key={label} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full overflow-hidden" style={{ border: "2px solid white", aspectRatio: "1/1" }}>
                      <img src={CDN.puzzlePhoto} alt={`Piece ${label}`} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-white font-black text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Text content */}
          <div className="px-6 sm:px-10 lg:px-12 py-10 flex flex-col justify-center">
            <h2
              className="font-black leading-tight mb-4 text-white"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                letterSpacing: "-0.01em",
              }}
            >
              COMPLETE THE<br />LOOK AND UNLOCK
            </h2>
            {/* FREE DELIVERY badge */}
            <div className="inline-block mb-4 px-4 py-2" style={{ backgroundColor: "white", border: "3px solid var(--thrifti-dark)" }}>
              <span className="font-black text-2xl sm:text-3xl tracking-tight" style={{ fontFamily: "'Playfair Display', serif", color: "var(--thrifti-dark)" }}>
                FREE DELIVERY
              </span>
            </div>
            <h2
              className="font-black leading-tight mb-8 text-white"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                letterSpacing: "-0.01em",
              }}
            >
              ON YOUR<br />NEXT FIND
            </h2>
            <Link href="/products">
              <button
                className="inline-flex items-center px-6 py-3 font-black text-sm tracking-widest uppercase"
                style={{ backgroundColor: "var(--thrifti-dark)", color: "white", fontFamily: "'Space Grotesk', sans-serif", border: "none" }}
              >
                CLAIM CODE
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== SECTION 4: BUILT FOR BANGALORE ===== */}
      <section style={{ backgroundColor: "var(--thrifti-cream)" }}>
        <div className="px-6 sm:px-10 lg:px-16 py-12 sm:py-16">
          <h2
            className="text-center font-black mb-8"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              color: "var(--thrifti-dark)",
              letterSpacing: "-0.01em",
            }}
          >
            BUILT FOR BANGALORE
          </h2>

          {/* 3-column photo grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { src: "/hero-couple.png", label: "KORAMANGALA\nSTREET FITS" },
              { src: "/hero-woman.png", label: "INDIRANAGAR\nLOOKS" },
              { src: "/hero-banner.png", label: "HSR\nTHRIFT FINDS" },
            ].map(({ src, label }) => (
              <div key={label} className="relative overflow-hidden group cursor-pointer">
                <img
                  src={src}
                  alt={label}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ aspectRatio: "3/4" }}
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)" }} />
                <div className="absolute bottom-3 left-3">
                  <p className="text-white font-black text-xs tracking-wider uppercase leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {label.split("\n").map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 5: NEW DROPS (Red split) ===== */}
      <section style={{ backgroundColor: "var(--thrifti-red)" }}>
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left: Text + countdown */}
          <div className="px-6 sm:px-10 lg:px-16 py-14 sm:py-20 flex flex-col justify-center">
            <p className="text-white/80 text-xs tracking-[0.3em] uppercase mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              LAUNCHING 26 APRIL 2026
            </p>
            <h2
              className="font-black leading-none text-white mb-4"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                letterSpacing: "-0.02em",
              }}
            >
              NEW DROPS,<br />JUST IN
            </h2>
            <CountdownBanner />
            <p className="text-white/80 text-sm leading-relaxed mb-8 max-w-xs" style={{ fontFamily: "'Space Mono', monospace" }}>
              Curated pieces. Limited time. Once they're gone, they're gone. Experience the shift in modern Indian fashion culture.
            </p>
            <Link href="/products">
              <button
                className="inline-flex items-center px-6 py-3 font-black text-sm tracking-widest uppercase self-start"
                style={{ backgroundColor: "var(--thrifti-dark)", color: "white", fontFamily: "'Space Grotesk', sans-serif", border: "none" }}
              >
                GRAB THE DEAL
              </button>
            </Link>
          </div>

          {/* Right: Fashion show image */}
          <div className="relative overflow-hidden" style={{ minHeight: "400px" }}>
            <img
              src={CDN.fashionShow}
              alt="New Drops"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(232,41,28,0.3) 0%, transparent 50%)" }} />
          </div>
        </div>
      </section>

      {/* ===== SECTION 6: SELL / BUY / REPEAT POLAROIDS ===== */}
      <section className="py-14 sm:py-20" style={{ backgroundColor: "var(--thrifti-cream)" }}>
        <div className="px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-3 gap-4 sm:gap-8 lg:gap-12 max-w-4xl mx-auto">
            {/* SELL polaroid */}
            <div className="polaroid relative" style={{ transform: "rotate(2deg)" }}>
              <span className="absolute top-3 left-3 text-xs font-black tracking-widest uppercase z-10" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>
                SELL
              </span>
              <img src={CDN.polaroidSell} alt="Sell the old you" className="w-full block" style={{ aspectRatio: "4/5", objectFit: "cover" }} />
              <p className="text-center text-xs font-bold tracking-widest uppercase mt-3 pb-1" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>
                SELL THE OLD YOU
              </p>
            </div>

            {/* BUY polaroid */}
            <div className="polaroid relative" style={{ transform: "rotate(-1deg)", marginTop: "1.5rem" }}>
              <span className="absolute top-3 left-3 text-xs font-black tracking-widest uppercase z-10" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>
                BUY
              </span>
              <img src={CDN.polaroidBuy} alt="Wear the new you" className="w-full block" style={{ aspectRatio: "4/5", objectFit: "cover" }} />
              <p className="text-center text-xs font-bold tracking-widest uppercase mt-3 pb-1" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>
                WEAR THE NEW YOU
              </p>
            </div>

            {/* REPEAT polaroid */}
            <div className="polaroid relative" style={{ transform: "rotate(-2deg)", marginTop: "-0.5rem" }}>
              <span className="absolute top-3 left-3 text-xs font-black tracking-widest uppercase z-10" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>
                REPEAT
              </span>
              <img src={CDN.polaroidRepeat} alt="Be new you with Thrifti" className="w-full block" style={{ aspectRatio: "4/5", objectFit: "cover" }} />
              <div className="flex items-end justify-between mt-3 pb-1">
                <p className="text-xs font-bold tracking-widest uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>
                  BE NEW YOU
                </p>
                <div
                  className="px-2 py-1 text-white text-[9px] font-black tracking-wider uppercase"
                  style={{ backgroundColor: "var(--thrifti-dark)", fontFamily: "'Space Grotesk', sans-serif", transform: "rotate(-3deg)", flexShrink: 0 }}
                >
                  WITH THRIFTI
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 7: FEATURED PRODUCTS ===== */}
      <section className="py-12 sm:py-16" style={{ backgroundColor: "white" }}>
        <div className="px-6 sm:px-10 lg:px-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold tracking-[0.3em] uppercase mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-red)" }}>
                Fresh Drops
              </p>
              <h2 className="text-3xl sm:text-4xl font-black" style={{ fontFamily: "'Playfair Display', serif", color: "var(--thrifti-dark)" }}>
                New Arrivals
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-1 text-sm font-bold uppercase tracking-wider transition-opacity hover:opacity-70"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-red)" }}
            >
              View All →
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {Array(8).fill(null).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-muted animate-pulse" />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg mb-2" style={{ fontFamily: "'Space Mono', monospace", color: "var(--thrifti-dark)" }}>
                Products coming soon
              </p>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link href="/products">
              <button className="thrifti-btn-dark text-sm">VIEW ALL</button>
            </Link>
          </div>
        </div>
      </section>

    </StorefrontLayout>
  );
}

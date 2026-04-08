import { Link } from "wouter";
import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
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

// All CDN image URLs
const CDN = {
  // Hero — dark editorial photo of two models in warehouse
  heroPhoto: "https://d2xsxph8kpxj0f.cloudfront.net/310519663413686037/RdJ3855myHy6XYmFtkiXgE/Section_c0a035c7.png",
  // Puzzle section — fashion model with bag (reuse sell photo)
  puzzlePhoto: "https://d2xsxph8kpxj0f.cloudfront.net/310519663413686037/RdJ3855myHy6XYmFtkiXgE/photo-sell-final_a950a217.png",
  // Built for Bangalore — two photos from the design
  bangalorePhoto1: "https://d2xsxph8kpxj0f.cloudfront.net/310519663413686037/RdJ3855myHy6XYmFtkiXgE/photo-bangalore1_4520cc74.png",
  bangalorePhoto2: "https://d2xsxph8kpxj0f.cloudfront.net/310519663413686037/RdJ3855myHy6XYmFtkiXgE/photo-bangalore2_14901bb4.png",
  // Fashion show dark section (dark runway photo)
  fashionShow: "https://d2xsxph8kpxj0f.cloudfront.net/310519663413686037/RdJ3855myHy6XYmFtkiXgE/photo-fashion-final_3379776b.png",
  // Polaroids — exact photos from the mobile design
  polaroidSell: "https://d2xsxph8kpxj0f.cloudfront.net/310519663413686037/RdJ3855myHy6XYmFtkiXgE/photo-sell-final_a950a217.png",
  polaroidBuy: "https://d2xsxph8kpxj0f.cloudfront.net/310519663413686037/RdJ3855myHy6XYmFtkiXgE/photo-buy-final_97b38991.png",
  polaroidRepeat: "https://d2xsxph8kpxj0f.cloudfront.net/310519663413686037/RdJ3855myHy6XYmFtkiXgE/photo-repeat-final_f6fb09a9.png",
};

// Watermark words scattered across the sell steps section background
const WATERMARK = [
  { word: "SELL", rotate: "-5deg", size: "7rem", x: "0%", y: "0%" },
  { word: "EVOLVE", rotate: "3deg", size: "5rem", x: "40%", y: "2%" },
  { word: "BUY", rotate: "-3deg", size: "8rem", x: "0%", y: "12%" },
  { word: "SELL", rotate: "4deg", size: "6rem", x: "55%", y: "10%" },
  { word: "EVOLVE", rotate: "-4deg", size: "5.5rem", x: "0%", y: "24%" },
  { word: "BUY", rotate: "2deg", size: "7rem", x: "45%", y: "22%" },
  { word: "SELL", rotate: "-2deg", size: "6.5rem", x: "0%", y: "36%" },
  { word: "BUY", rotate: "5deg", size: "5rem", x: "50%", y: "34%" },
  { word: "EVOLVE", rotate: "-3deg", size: "6rem", x: "0%", y: "48%" },
  { word: "SELL", rotate: "2deg", size: "7.5rem", x: "40%", y: "46%" },
  { word: "BUY", rotate: "-4deg", size: "5.5rem", x: "0%", y: "60%" },
  { word: "EVOLVE", rotate: "3deg", size: "6rem", x: "45%", y: "58%" },
];

function CountdownBanner() {
  const { days, hours, minutes, seconds, launched } = useCountdown();

  if (launched) {
    return (
      <div className="mb-6">
        <span
          className="inline-block text-white font-black text-sm uppercase tracking-[0.3em] px-4 py-2 border border-white/40"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          WE'RE LIVE!
        </span>
      </div>
    );
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="mb-8">
      <p
        className="text-white/60 text-[10px] font-bold tracking-[0.35em] uppercase mb-3"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        LAUNCHING IN
      </p>
      <div className="flex items-end gap-3 sm:gap-5">
        {[
          { value: pad(days), label: "DAYS" },
          { value: pad(hours), label: "HRS" },
          { value: pad(minutes), label: "MIN" },
          { value: pad(seconds), label: "SEC" },
        ].map(({ value, label }, i) => (
          <div key={label} className="flex items-end gap-3 sm:gap-5">
            {i > 0 && (
              <span
                className="text-white/40 text-3xl sm:text-4xl font-black leading-none pb-4"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >:
              </span>
            )}
            <div className="text-center">
              <div
                className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-none tabular-nums"
                style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}
              >
                {value}
              </div>
              <div
                className="text-white/50 text-[9px] font-bold tracking-[0.25em] mt-1"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { data: productsData, isLoading: productsLoading } = trpc.products.list.useQuery({ first: 8, reverse: true });
  const featuredProducts = productsData?.products ?? [];

  return (
    <StorefrontLayout>

      {/* ===== SECTION 1: HERO ===== */}
      {/* Full-bleed dark editorial photo */}
      <section className="relative overflow-hidden" style={{ backgroundColor: "#111" }}>
        <img
          src={CDN.heroPhoto}
          alt="Thrifti — fashion editorial"
          className="w-full block"
          style={{ maxHeight: "92vh", minHeight: "55vw", objectFit: "cover", objectPosition: "center top" }}
        />
        {/* Gradient fade at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
      </section>

      {/* Hero text block — dark background, below the photo, matching Figma */}
      <section style={{ backgroundColor: "#111" }}>
        <div className="px-5 sm:px-8 lg:px-16 py-10 sm:py-14 lg:py-16">
          <div className="max-w-lg mx-auto sm:mx-0 text-center sm:text-left">
            <p
              className="text-sm sm:text-base leading-relaxed mb-8"
              style={{
                fontFamily: "'Space Mono', monospace",
                color: "rgba(255,255,255,0.85)",
              }}
            >
              Your wardrobe was never meant to be a storage unit. It's an evolving archive of moments, moods, and maincharacter eras.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="thrifti-btn-red inline-flex text-sm"
            >
              SELL NOW
            </a>
          </div>
        </div>
      </section>

      {/* ===== SECTION 2: YOUR WARDROBE IS A TRANSITION FUND ===== */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: "var(--thrifti-cream)" }}
      >
        {/* Scattered watermark background */}
        <div
          className="absolute inset-0 pointer-events-none select-none overflow-hidden"
          aria-hidden="true"
          style={{ zIndex: 0 }}
        >
          {WATERMARK.map((w, i) => (
            <span
              key={i}
              className="absolute font-black leading-none"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: w.size,
                color: "rgba(0,0,0,0.08)",
                transform: `rotate(${w.rotate})`,
                left: w.x,
                top: w.y,
                whiteSpace: "nowrap",
              }}
            >
              {w.word}
              {i % 3 !== 2 && (
                <span
                  style={{
                    color: "rgba(232,41,28,0.3)",
                    fontSize: "0.5em",
                    verticalAlign: "middle",
                    margin: "0 0.3em",
                  }}
                >
                  ✳
                </span>
              )}
            </span>
          ))}
        </div>

        <div className="relative px-5 sm:px-8 lg:px-16 py-16 sm:py-24" style={{ zIndex: 1 }}>
          {/* Section heading */}
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-10"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--thrifti-dark)",
              letterSpacing: "-0.01em",
            }}
          >
            YOUR WARDROBE IS A<br />TRANSITION FUND
          </h2>

          {/* 60 seconds headline */}
          <p
            className="text-2xl sm:text-3xl font-black mb-8 leading-tight"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--thrifti-dark)",
            }}
          >
            List In Less<br />
            Than 60 Seconds{" "}
            <span
              className="underline decoration-2"
              style={{ color: "var(--thrifti-red)", textDecorationColor: "var(--thrifti-red)" }}
            >
              Literally
            </span>
          </p>

          {/* Steps */}
          <div className="flex flex-col gap-6 mb-10 max-w-sm">
            {[
              { label: "PING US", desc: 'Shoot us a "Hey!, Hi!" on WhatsApp.' },
              { label: "SNAP", desc: "Take a clean photo of your item." },
              { label: "SELL", desc: "Get paid & ship with our concierge." },
            ].map((step) => (
              <div key={step.label}>
                <p
                  className="font-black text-sm tracking-wider mb-1"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    color: "var(--thrifti-red)",
                  }}
                >
                  {step.label}
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    color: "var(--thrifti-dark)",
                  }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="thrifti-btn-red inline-flex text-sm"
          >
            START SELLING
          </a>
        </div>
      </section>

      {/* ===== SECTION 3: COMPLETE THE LOOK (Red bg) ===== */}
      <section style={{ backgroundColor: "var(--thrifti-red)" }}>
        <div className="px-5 sm:px-8 lg:px-16 pt-10 pb-14 sm:pb-20">
          {/* Puzzle photo with grid overlay */}
          <div className="mb-6 relative">
            <div
              className="relative overflow-hidden"
              style={{ border: "3px solid white" }}
            >
              <img
                src={CDN.puzzlePhoto}
                alt="Complete the look"
                className="w-full object-cover"
                style={{ maxHeight: "380px", minHeight: "240px" }}
              />
              {/* Puzzle grid overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(255,255,255,0.25) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255,255,255,0.25) 1px, transparent 1px)
                  `,
                  backgroundSize: "33.33% 33.33%",
                }}
              />
              {/* Missing puzzle piece bottom-right */}
              <div
                className="absolute bottom-0 right-0"
                style={{
                  width: "33.33%",
                  height: "33.33%",
                  backgroundColor: "var(--thrifti-red)",
                }}
              />
            </div>

            {/* Thumbnail row A, B, C */}
            <div className="flex gap-2 mt-3">
              {["A", "B", "C"].map((label, i) => (
                <div
                  key={label}
                  className="flex-1 relative overflow-hidden cursor-pointer"
                  style={{
                    border: i === 0 ? "2px solid white" : "2px solid rgba(255,255,255,0.4)",
                    aspectRatio: "1",
                  }}
                >
                  <img
                    src={CDN.puzzlePhoto}
                    alt={`Option ${label}`}
                    className="w-full h-full object-cover"
                    style={{
                      opacity: i === 0 ? 1 : 0.65,
                      objectPosition: i === 0 ? "left top" : i === 1 ? "center" : "right bottom",
                    }}
                  />
                  <span
                    className="absolute top-1 left-1.5 text-white text-xs font-black"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Text */}
          <div className="text-center text-white">
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight mb-5"
              style={{
                fontFamily: "'Playfair Display', serif",
                letterSpacing: "0.02em",
              }}
            >
              COMPLETE THE LOOK<br />AND UNLOCK
            </h2>
            <div
              className="border-2 border-white px-6 py-3 inline-block mb-4"
            >
              <span
                className="text-xl sm:text-2xl font-black tracking-widest"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                FREE DELIVERY
              </span>
            </div>
            <p
              className="text-lg sm:text-xl font-black mb-8 tracking-wider"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              ON YOUR NEXT FIND
            </p>
            <Link href="/products">
              <button className="thrifti-btn-dark text-sm">
                CLAIM CODE
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== SECTION 4: BUILT FOR BANGALORE (Cream bg) ===== */}
      <section style={{ backgroundColor: "var(--thrifti-cream)" }}>
        <div className="px-5 sm:px-8 lg:px-16 pt-14 sm:pt-20 pb-0">
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-black mb-8"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--thrifti-dark)",
              letterSpacing: "-0.01em",
            }}
          >
            BUILT FOR BANGALORE
          </h2>
          {/* 3 photos stacked vertically on mobile, 3-col grid on desktop */}
          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3 lg:gap-6">
            {/* Photo 1 — red border, orange privacy bars */}
            <div
              className="relative overflow-hidden"
              style={{ border: "3px solid var(--thrifti-red)" }}
            >
              <img
                src={CDN.bangalorePhoto1}
                alt="Bangalore fashion community"
                className="w-full object-cover"
                style={{ maxHeight: "480px", minHeight: "260px" }}
              />
              {/* Orange privacy bars over faces */}
              <div
                className="absolute rounded-full"
                style={{
                  backgroundColor: "#FF6B35",
                  top: "18%",
                  left: "12%",
                  width: "22%",
                  height: "4%",
                }}
              />
              <div
                className="absolute rounded-full"
                style={{
                  backgroundColor: "#FF6B35",
                  top: "22%",
                  left: "52%",
                  width: "18%",
                  height: "4%",
                }}
              />
            </div>
            {/* Photo 2 — no border */}
            <div className="relative overflow-hidden">
              <img
                src={CDN.bangalorePhoto2}
                alt="Bangalore fashion editorial"
                className="w-full object-cover"
                style={{ maxHeight: "480px", minHeight: "260px" }}
              />
              {/* Orange privacy bar */}
              <div
                className="absolute rounded-full"
                style={{
                  backgroundColor: "#FF6B35",
                  top: "20%",
                  left: "35%",
                  width: "30%",
                  height: "4%",
                }}
              />
            </div>
            {/* Photo 3 — no border (reuse polaroidSell as third Bangalore photo) */}
            <div className="relative overflow-hidden">
              <img
                src={CDN.polaroidSell}
                alt="Bangalore streetwear community"
                className="w-full object-cover"
                style={{ maxHeight: "480px", minHeight: "260px" }}
              />
              {/* Orange privacy bar */}
              <div
                className="absolute rounded-full"
                style={{
                  backgroundColor: "#FF6B35",
                  top: "22%",
                  left: "20%",
                  width: "28%",
                  height: "4%",
                }}
              />
              <div
                className="absolute rounded-full"
                style={{
                  backgroundColor: "#FF6B35",
                  top: "22%",
                  left: "55%",
                  width: "20%",
                  height: "4%",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 5: NEW DROPS, JUST IN (Red bg) ===== */}
      <section style={{ backgroundColor: "var(--thrifti-red)" }}>
        <div className="px-5 sm:px-8 lg:px-16 py-14 sm:py-20">
          {/* Countdown timer — shows DD:HH:MIN:SEC until launch */}
          <CountdownBanner />
          {/* LAUNCHING label — below countdown, above headline */}
          <p
            className="text-white/60 text-[10px] font-bold tracking-[0.35em] uppercase mb-3"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            LAUNCHING 26 APRIL 2026
          </p>
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-5"
            style={{
              fontFamily: "'Playfair Display', serif",
              letterSpacing: "-0.01em",
            }}
          >
            NEW DROPS,<br />JUST IN
          </h2>
          <p
            className="text-white/80 text-sm leading-relaxed mb-10 max-w-sm"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Curated pieces, limited time. Once they're gone, they're gone. Experience the shift in modern Indian fashion culture.
          </p>
          <Link href="/products">
            <button className="thrifti-btn-dark text-sm">
              GRAB THE DEAL
            </button>
          </Link>
        </div>
      </section>

      {/* ===== SECTION 6: FASHION SHOW (Dark bg) ===== */}
      <section className="relative overflow-hidden" style={{ backgroundColor: "#111" }}>
        <img
          src={CDN.fashionShow}
          alt="Fashion show"
          className="w-full block object-cover"
          style={{ maxHeight: "480px", minHeight: "220px" }}
        />
      </section>

      {/* ===== SECTION 7: SELL / BUY / REPEAT POLAROIDS (Cream bg) ===== */}
      <section
        className="px-5 sm:px-8 lg:px-16 py-14 sm:py-20"
        style={{ backgroundColor: "var(--thrifti-cream)" }}
      >
        <div className="flex flex-col gap-10 lg:grid lg:grid-cols-3 lg:gap-10">

          {/* SELL polaroid */}
          <div
            className="polaroid relative"
            style={{ transform: "rotate(-2.5deg)" }}
          >
            {/* SELL label — top-left badge per Figma */}
            <span
              className="absolute top-3 left-3 text-xs font-black tracking-widest uppercase z-10"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: "var(--thrifti-dark)",
              }}
            >
              SELL
            </span>
            <img
              src={CDN.polaroidSell}
              alt="Sell the old you"
              className="w-full block"
              style={{ aspectRatio: "4/5", objectFit: "cover" }}
            />
            <p
              className="text-center text-xs font-bold tracking-widest uppercase mt-3 pb-1"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: "var(--thrifti-dark)",
              }}
            >
              SELL THE OLD YOU
            </p>
          </div>

          {/* BUY polaroid */}
          <div
            className="polaroid relative"
            style={{ transform: "rotate(1.5deg)" }}
          >
            {/* BUY label — top-left badge per Figma */}
            <span
              className="absolute top-3 left-3 text-xs font-black tracking-widest uppercase z-10"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: "var(--thrifti-dark)",
              }}
            >
              BUY
            </span>
            <img
              src={CDN.polaroidBuy}
              alt="Wear the new you"
              className="w-full block"
              style={{ aspectRatio: "4/5", objectFit: "cover" }}
            />
            <p
              className="text-center text-xs font-bold tracking-widest uppercase mt-3 pb-1"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: "var(--thrifti-dark)",
              }}
            >
              WEAR THE NEW YOU
            </p>
          </div>

          {/* REPEAT polaroid */}
          <div
            className="polaroid relative"
            style={{ transform: "rotate(-1deg)" }}
          >
            {/* REPEAT label — top-left badge per Figma */}
            <span
              className="absolute top-3 left-3 text-xs font-black tracking-widest uppercase z-10"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: "var(--thrifti-dark)",
              }}
            >
              REPEAT
            </span>
            <img
              src={CDN.polaroidRepeat}
              alt="Be new you with Thrifti"
              className="w-full block"
              style={{ aspectRatio: "4/5", objectFit: "cover" }}
            />
            <div className="flex items-end justify-between mt-3 pb-1">
              <p
                className="text-xs font-bold tracking-widest uppercase"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: "var(--thrifti-dark)",
                }}
              >
                BE NEW YOU
              </p>
              <div
                className="px-2 py-1 text-white text-[9px] font-black tracking-wider uppercase"
                style={{
                  backgroundColor: "var(--thrifti-dark)",
                  fontFamily: "'Space Grotesk', sans-serif",
                  transform: "rotate(-3deg)",
                  flexShrink: 0,
                }}
              >
                WITH THRIFTI
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 8: FEATURED PRODUCTS (White bg) ===== */}
      <section className="py-12 sm:py-16" style={{ backgroundColor: "white" }}>
        <div className="px-5 sm:px-8 lg:px-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p
                className="text-xs font-bold tracking-[0.3em] uppercase mb-2"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: "var(--thrifti-red)",
                }}
              >
                Fresh Drops
              </p>
              <h2
                className="text-3xl sm:text-4xl font-black"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--thrifti-dark)",
                }}
              >
                New Arrivals
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-1 text-sm font-bold uppercase tracking-wider transition-opacity hover:opacity-70"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: "var(--thrifti-red)",
              }}
            >
              View All <ChevronRight className="w-4 h-4" />
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
              <p
                className="text-lg mb-2"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  color: "var(--thrifti-dark)",
                }}
              >
                Products coming soon
              </p>
              <p
                className="text-sm text-muted-foreground"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                Connect your Shopify store to display products here.
              </p>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link href="/products">
              <button className="thrifti-btn-dark text-sm">
                VIEW ALL
              </button>
            </Link>
          </div>
        </div>
      </section>

    </StorefrontLayout>
  );
}

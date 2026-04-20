import { Link } from "wouter";
import { useState, useEffect } from "react";
import StorefrontLayout from "@/components/StorefrontLayout";
import { ChevronRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import ProductCard from "@/components/ProductCard";
import { Puzzle } from "react-jigsaw";
import "react-jigsaw/styles";
import LaunchSplitSection from "@/components/LaunchSplitSection";
import SellBuyRepeatSection from "@/components/SellBuyRepeatSection";
import bannerBg1 from "@/assets/img/Banner-bg-1.png";
import bannerBg2 from "@/assets/img/Banner-bg-2.png";
import bannerBg3 from "@/assets/img/Banner-bg-3.png";
import bannerBg4 from "@/assets/img/Banner-bg-4.png";
import bannerModel1 from "@/assets/img/Banner-model-1.png";
import bannerModel2 from "@/assets/img/Banner-model-2.png";
import bannerModel3 from "@/assets/img/Banner-model-3.png";
import bannerModel4 from "@/assets/img/Banner-model-4.png";
import homeBannerModel1 from "@/assets/img/home-banner-model1.png";
import homeBannerModel2 from "@/assets/img/home-banner-model2.png";
import homeBannerModel3 from "@/assets/img/home-banner-model3.png";
import homeBannerModel4 from "@/assets/img/home-banner-model4.png";
import transitionfundImage from "@/assets/img/transition-fund.png";
import transitionfundImage1 from "@/assets/img/transitionfundImage1.png";
import puzzlePhoto from "@/assets/img/puzzlePhoto.png";
import built1 from "@/assets/img/Built1.png";
import built2 from "@/assets/img/Built2.png";
import built3 from "@/assets/img/Built3.png";
import repeatPolaroid from "@/assets/img/Repeat.png";
import repeat1Polaroid from "@/assets/img/Repeat1.png";
import launchingImage from "@/assets/img/launching.png";
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

const HERO_BANNER_SLIDES = [
  {
    bg: bannerBg1,
    mobileBg: homeBannerModel1,
    model: bannerModel1,
    modelClass: "left-1/2 -translate-x-1/2 bottom-0 h-[108%] md:h-[114%] lg:h-[125%] w-auto",
    title: ["Built for", "how you", "show up"],
    subtitle: "Work. Weekends. Everything in between.",
    ctaLabel: "Sell now",
    ctaHref: WHATSAPP_URL,
  },
  {
    bg: bannerBg2,
    mobileBg: homeBannerModel2,
    model: bannerModel2,
    modelClass: "left-1/2 -translate-x-1/2 bottom-0 h-[109%] md:h-[116%] lg:h-[126%] w-auto",
    title: ["DRESS THE", "NEXT YOU"],
    subtitle: "From everyday staples to standout pieces.",
    ctaLabel: "SHOP WOMEN",
    ctaHref: WHATSAPP_URL,
  },
  {
    bg: bannerBg3,
    mobileBg: homeBannerModel3,
    model: bannerModel3,
    modelClass: "left-1/2 -translate-x-1/2 bottom-0 h-[112%] md:h-[120%] lg:h-[130%] w-auto",
    title: ["NO SCAMS.", "NO JUNK.",],
    subtitle: "",
    ctaLabel: "Sell now",
    ctaHref: WHATSAPP_URL,
  },
  {
    bg: bannerBg4,
    mobileBg: homeBannerModel4,
    model: bannerModel4,
    modelClass: "left-1/2 -translate-x-1/2 bottom-0 h-[111%] md:h-[118%] lg:h-[128%] w-auto",
    title: ["SELL WHAT", "YOU'VE", "OUTGROWN."],
    subtitle: "Wear what you're becoming.",
    ctaLabel: "Sell Now",
    ctaHref: WHATSAPP_URL,
  },
];

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

function AnimatedTicker({ className = "" }: { className?: string }) {
  const items = ["SELL", "★", "REPEAT", "★", "BUY", "★", "SELL", "★", "REPEAT", "★", "BUY", "★", "SELL", "★", "REPEAT", "★", "BUY", "★"];
  const tickerItems = [...items, ...items, ...items];
  return (
    <div className={`overflow-hidden py-3 relative md:absolute md:-top-10 md:left-0 md:w-full z-[5] ${className}`} style={{ backgroundColor: "var(--thrifti-red)" }}>
      <style>{`
        @keyframes tickerLoop {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <div
        className="flex w-max whitespace-nowrap"
        style={{ animation: "tickerLoop 60s linear infinite" }}
      >
        {[0, 1].map((groupIndex) => (
          <div key={groupIndex} className="flex shrink-0 items-center gap-6 pr-6">
            {tickerItems.map((item, i) => (
              <span
                key={`${groupIndex}-${i}`}
                className="text-white font-black text-sm tracking-[0.3em] uppercase"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {item}
              </span>
            ))}
          </div>
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
        <span className="anek-devanagari-font inline-block text-white font-black text-sm uppercase tracking-[0.3em] px-4 py-2 border border-white/40">
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
  const builtSlides = [built1, built2, built3];
  const [activeBuiltSlide, setActiveBuiltSlide] = useState(0);
  const [visibleBuiltSlides, setVisibleBuiltSlides] = useState(1);
  const [puzzleSolved, setPuzzleSolved] = useState(false);
  const [puzzleKey, setPuzzleKey] = useState(0);
  const PROMO_CODE = "FREESHIP";
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);

  useEffect(() => {
    if (HERO_BANNER_SLIDES.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveHeroSlide((prev) => (prev + 1) % HERO_BANNER_SLIDES.length);
    }, 10000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const updateVisibleSlides = () => {
      if (window.innerWidth >= 1024) {
        setVisibleBuiltSlides(3);
      } else if (window.innerWidth >= 768) {
        setVisibleBuiltSlides(2);
      } else {
        setVisibleBuiltSlides(1);
      }
    };

    updateVisibleSlides();
    window.addEventListener("resize", updateVisibleSlides);
    return () => window.removeEventListener("resize", updateVisibleSlides);
  }, []);

  useEffect(() => {
    const maxStart = Math.max(0, builtSlides.length - visibleBuiltSlides);
    setActiveBuiltSlide((prev) => Math.min(prev, maxStart));
  }, [visibleBuiltSlides, builtSlides.length]);

  const goToPrevBuiltSlide = () => {
    const maxStart = Math.max(0, builtSlides.length - visibleBuiltSlides);
    if (maxStart === 0) return;
    setActiveBuiltSlide((prev) => (prev <= 0 ? maxStart : prev - 1));
  };

  const goToNextBuiltSlide = () => {
    const maxStart = Math.max(0, builtSlides.length - visibleBuiltSlides);
    if (maxStart === 0) return;
    setActiveBuiltSlide((prev) => (prev >= maxStart ? 0 : prev + 1));
  };
  const currentHeroSlide = HERO_BANNER_SLIDES[activeHeroSlide];
  const isThirdHeroSlide = activeHeroSlide === 2;
  return (
    <StorefrontLayout>

      {/* ===== SECTION 1: HERO — Full-bleed with BANNER11-2 image ===== */}
      <section className="bg-[var(--thrifti-cream)] md:mt-24 lg:mt-28 xl:mt-44 md:relative">
        <div className="relative min-h-[560px] md:min-h-[360px] xl:min-h-[680px] flex items-end ">
          <div className="container mx-auto">
            {HERO_BANNER_SLIDES.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-700 ease-out ${index === activeHeroSlide ? "opacity-100 z-[10]" : "opacity-0 z-0"
                  }`}
                aria-hidden={index !== activeHeroSlide}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat md:hidden"
                  style={{ backgroundImage: `url(${slide.mobileBg})` }}
                />
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden md:block"
                  style={{ backgroundImage: `url(${slide.bg})` }}
                />
                <img
                  src={slide.model}
                  alt=""
                  aria-hidden="true"
                  className={`absolute z-[20] object-contain pointer-events-none hidden md:block lg:pt-7  ${slide.modelClass}`}
                />
              </div>
            ))}
            <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/45 via-black/15 to-transparent pointer-events-none" />

            <div
              className={`relative z-[30] flex h-full min-h-[560px] md:min-h-[360px] xl:min-h-[680px] w-full ${isThirdHeroSlide ? "items-end md:items-start md:justify-end" : "items-end"
                }`}
            >
              <div
                className={`px-6 sm:px-10 md:px-20 max-w-[720px] ${isThirdHeroSlide
                  ? "pb-14 sm:pb-4 md:pt-14 md:pb-0 lg:pt-20 text-left"
                  : "pb-14 sm:pb-4 lg:pb-20"
                  }`}
              >
                <h1 className="vogue-font text-white uppercase leading-tight tracking-[-0.01em] text-[52px] sm:text-[60px] md:text-[52px] 2xl:text-[64px]">
                  {currentHeroSlide.title.map((line, index) => (
                    <span key={`${line}-${index}`}>
                      {line}
                      {index !== currentHeroSlide.title.length - 1 && <br />}
                    </span>
                  ))}
                </h1>
                <p className="geist-mono-font mt-3 sm:mt-4 text-white uppercase tracking-[0.08em] text-sm sm:text-xl md:text-xl max-w-[52ch]">
                  {currentHeroSlide.subtitle}
                </p>
                {!isThirdHeroSlide && (
                  <div className="mt-10">
                    <a
                      href={currentHeroSlide.ctaHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="thrifti-btn-red inline-flex anek-devanagari-font text-sm md:text-base 2xl:text-2xl pb-1"
                    >
                      {currentHeroSlide.ctaLabel}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {HERO_BANNER_SLIDES.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveHeroSlide((prev) => (prev - 1 + HERO_BANNER_SLIDES.length) % HERO_BANNER_SLIDES.length)
                  }
                  aria-label="Previous hero slide"
                  className="absolute left-3 top-1/2 z-[30] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-2xl leading-none text-white transition-colors hover:bg-black/60"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => setActiveHeroSlide((prev) => (prev + 1) % HERO_BANNER_SLIDES.length)}
                  aria-label="Next hero slide"
                  className="absolute right-3 top-1/2 z-[30] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-2xl leading-none text-white transition-colors hover:bg-black/60"
                >
                  ›
                </button>
                <div className="absolute bottom-6 left-1/2 z-[30] flex -translate-x-1/2 gap-2">
                  {HERO_BANNER_SLIDES.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActiveHeroSlide(index)}
                      aria-label={`Go to hero slide ${index + 1}`}
                      className={`h-2 rounded-full transition-all ${activeHeroSlide === index ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
                        }`}
                    />
                  ))}
                </div>
              </>
            )}

          </div>

        </div>
        {/* ===== ANIMATED TICKER ===== */}
        <AnimatedTicker />
      </section>

      {/* ===== SECTION 2: YOUR WARDROBE IS A TRANSITION FUND ===== */}
      <section className=" bg-[#F5F1E9]">
        <div className="flex flex-col lg:flex-row lg:items-center container mx-auto">
          <div className="w-full lg:w-1/2 order-2 lg:order-1">
            <div className="px-5 py-10 sm:px-8 md:px-10 md:py-12 2xl:px-16">
              <h2 className="mb-5 md:mb-6 2xl:mb-8 vogue-font uppercase leading-tight text-3xl sm:text-4xl md:text-[2.6rem] lg:text-5xl 2xl:text-6xl hidden lg:block w-[15ch]">
                YOUR WARDROBE IS A TRANSITION FUND
              </h2>

              <div className="2xl:mb-6 mb-4 md:mb-5 anek-devanagari-font leading-tight text-[var(--thrifti-dark)] text-2xl md:text-[1.95rem] lg:text-3xl 2xl:text-[2.5rem] font-semibold">
                List In Less
                <p>
                  Than 60 Seconds{" "}
                  <span className="text-[var(--thrifti-red)] underline decoration-2 decoration-[var(--thrifti-red)] underline-offset-4">
                    Literally
                  </span>
                </p>
              </div>

              <div className="mb-8 md:mb-10 flex max-w-sm md:max-w-[30rem] flex-col 2xl:gap-6 gap-4 md:gap-5">
                {[
                  { label: "PING US", desc: 'Shoot us a "Hey!, Hi!" on WhatsApp.' },
                  { label: "SNAP", desc: "Take a clean photo of your item." },
                  { label: "SELL", desc: "Get paid & ship with our concierge." },
                ].map((step) => (
                  <div key={step.label}>
                    <h4 className="mb-0 anek-devanagari-font text-xl md:text-lg lg:text-xl 2xl:text-3xl font-semibold uppercase text-[var(--thrifti-red)]">
                      {step.label}
                    </h4>
                    <p className="geist-mono-font text-base font-normal leading-relaxed text-[var(--thrifti-dark)]">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="thrifti-btn-red inline-flex text-2xl anek-devanagari-font pb-1"
              >
                START SELLING
              </a>
            </div>
          </div>

          <div className="mt-11 md:mt-14 lg:mt-0 lg:flex w-full items-center justify-center px-4 sm:px-8 md:px-10 lg:w-1/2 lg:px-10 order-1 lg:order-2 relative">
            <div className="flex items-center justify-center">
              <h2 className="mb-5 md:mb-6 vogue-font uppercase leading-tight text-3xl sm:text-4xl md:text-[2.6rem] lg:hidden text-center w-[20ch]">
                YOUR WARDROBE IS A TRANSITION FUND
              </h2>
            </div>
            <div className="w-full flex justify-center">
              <img
                src={transitionfundImage}
                alt="Sell on Thrifti — photograph your item to list"
                className="h-auto object-contain hidden lg:block max-w-[96%]"
              />

              <img
                src={transitionfundImage1}
                alt="Sell on Thrifti — photograph your item to list"
                className="h-auto object-contain block lg:hidden w-full md:max-w-[92%]"
              />
            </div>
            <div className="absolute bottom-8 right-4 sm:right-10 md:right-20 md:bottom-2 lg:right-16 lg:-bottom-4 -rotate-[6deg] bg-white px-4 md:px-5 py-2 shadow-md">
              <p className="font-['Space_Mono',monospace] text-sm md:text-base font-bold uppercase tracking-widest text-[var(--thrifti-dark)] sm:text-lg">
                SELL ON THRIFTI
              </p>
            </div>
          </div>
        </div>
        {/* <div className="h-16 w-full bg-[var(--thrifti-red)] sm:h-20" aria-hidden /> */}
      </section>

      {/* ===== SECTION 3: COMPLETE THE LOOK — Interactive Jigsaw Puzzle ===== */}
      <section className="bg-[var(--thrifti-red)]">
        <div className={`flex flex-col lg:flex-row px-4 sm:px-8 lg:px-16 pt-4 pb-10 lg:pb-0 lg:pt-20 container mx-auto ${puzzleSolved ? "items-center" : ""}`}>
          {/* Puzzle photo with grid overlay */}
          <div className={`relative w-full lg:w-1/2 mb-5 flex items-center justify-center ${puzzleSolved ? "lg:mb-0" : "lg:-mb-20"}`}>
            {puzzleSolved ? (
              <div
                className="flex flex-col items-center justify-center text-center min-h-[320px]"
              >
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="vogue-font font-black text-white text-2xl mb-2">
                  OUTFIT UNLOCKED!
                </h3>
                <p className="anek-devanagari-font text-white text-sm mb-4 opacity-90">
                  Your free delivery code:
                </p>
                <div
                  className="px-6 py-3 font-black text-xl tracking-[0.15em] mb-4 bg-white text-[var(--thrifti-red)] anek-devanagari-font"
                >
                  {PROMO_CODE}
                </div>
                <p className="anek-devanagari-font text-white text-xs opacity-75 mb-4">
                  Apply at checkout for free delivery on your next order
                </p>
                <button
                  onClick={() => { setPuzzleSolved(false); setPuzzleKey(k => k + 1); }}
                  className="anek-devanagari-font text-white underline text-xs opacity-75 bg-transparent border-none cursor-pointer"
                >
                  Play again
                </button>
              </div>
            ) : (
              <div className="w-full lg:max-w-3/4 mx-auto p-4 bg-white shadow-[0_6px_20px_rgba(0,0,0,0.25)]">
                <p
                  className="anek-devanagari-font text-[var(--thrifti-dark)] text-xs mb-3 text-center font-bold tracking-widest uppercase"
                >
                  Solve the puzzle to unlock free delivery
                </p>
                <div
                  key={puzzleKey}
                  className="overflow-hidden"
                >
                  <Puzzle
                    image={built3}
                    onComplete={() => setPuzzleSolved(true)}
                    onRefresh={() => setPuzzleSolved(false)}
                    options={{
                      board: {
                        columns: 3,
                        rows: 3,
                        width: 300,
                        height: 360,
                        snapThreshold: 25,
                        showBoardSlotOutlines: true,
                        outlineStrokeColor: "rgba(0,0,0,0.75)",
                        scatterArea: 0,
                      },
                      puzzle: {
                        responsive: true,
                        timer: { enabled: true },
                        refreshButton: { enabled: true },
                        rowsAndColumns: { enabled: false },
                      },
                      puzzlePiece: {
                        strokeColor: "rgba(0,0,0,0.9)",
                        strokeEnabled: false,
                      },
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          {/* Text */}
          <div className={`text-white w-full lg:w-1/2 pr-0 2xl:pr-20 pb-0 lg:pb-20 ${puzzleSolved ? "text-center lg:text-center" : ""}`}>
            <h2
              className={`vogue-font tracking-[0.02em] mb-4 uppercase text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl text-center leading-tight ${puzzleSolved ? "lg:text-center" : "lg:text-left"}`}
            >
              COMPLETE THE LOOK AND UNLOCK
            </h2>
            <div
              className="border-2 bg-white text-black border-white px-6 py-3 mb-4 shadow-lg -rotate-2 flex items-center justify-center"
            >
              <span
                className="vogue-font text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl"
              >
                FREE DELIVERY
              </span>
            </div>
            <p
              className={`mb-4 vogue-font uppercase leading-tight text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl w-full text-center ${puzzleSolved ? "lg:text-center lg:w-full" : "lg:text-left lg:w-[10ch]"}`}
            >
              ON YOUR NEXT FIND
            </p>
            <Link href="/products" className={`flex items-center justify-center ${puzzleSolved ? "lg:justify-center" : "lg:justify-start"}`}>
              <button className="thrifti-btn-dark text-2xl">
                CLAIM CODE
              </button>
            </Link>
          </div>
        </div>
      </section>
      {/* ===== SECTION 4: BUILT FOR BANGALORE ===== */}
      <section className="bg-[var(--thrifti-cream)] lg:pt-20">
        <div className="px-5 sm:px-8 lg:px-10 xl:px-16 pt-10 sm:pt-14 pb-10 lg:pb-14 container mx-auto">
          <h2 className="mb-5 2xl:mb-8 vogue-font uppercase leading-tight text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl text-center">
            BUILT FOR BANGALORE
          </h2>
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${(activeBuiltSlide * 100) / visibleBuiltSlides}%)` }}
              >
                {builtSlides.map((slide, index) => (
                  <div key={index} className="w-full shrink-0 basis-full px-1.5 md:basis-1/2 lg:basis-1/3">
                    <div className="group relative overflow-hidden border-2 border-transparent transition-colors duration-300 hover:border-[var(--thrifti-red)]">
                      <img
                        src={slide}
                        alt={`Built for Bangalore ${index + 1}`}
                        className="w-full h-[300px] md:h-[360px] lg:h-[460px] object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/55 transition-colors duration-300 pointer-events-none" />
                      <div className="absolute inset-x-0 bottom-4 z-10 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <p className="anek-devanagari-font text-[var(--thrifti-red)] text-2xl uppercase leading-[1.05] tracking-[0.04em]">
                          Koramangala
                        </p>
                        <p className="anek-devanagari-font text-[var(--thrifti-red)] text-2xl uppercase leading-[1.05] tracking-[0.04em]">
                          Street Fits
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={goToPrevBuiltSlide}
              aria-label="Previous built for bangalore image"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/45 hover:bg-black/65 text-white text-2xl leading-none flex items-center justify-center transition-colors"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={goToNextBuiltSlide}
              aria-label="Next built for bangalore image"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/45 hover:bg-black/65 text-white text-2xl leading-none flex items-center justify-center transition-colors"
            >
              ›
            </button>

            <div className="mt-4 flex items-center justify-center gap-2">
              {Array.from({ length: Math.max(1, builtSlides.length - visibleBuiltSlides + 1) }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveBuiltSlide(index)}
                  aria-label={`Go to built for bangalore image ${index + 1}`}
                  className={`h-2.5 rounded-full transition-all ${activeBuiltSlide === index ? "w-8 bg-[var(--thrifti-red)]" : "w-2.5 bg-black/25 hover:bg-black/45"
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 5: NEW DROPS (Red split) ===== */}
      <LaunchSplitSection
        pretitle="LAUNCHING 26 APRIL 2026"
        title={<>Limited drops.<br /> No repeats.</>}
        description="Curated pieces, limited time. Once they're gone, they're gone. Experience the shift in modern Indian fashion culture."
        ctaLabel="EXPLORE DROPS"
        ctaHref="/products"
        imageSrc={launchingImage}
        imageAlt="Fashion show"
      />

      {/* ===== SECTION 6: SELL / BUY / REPEAT POLAROIDS ===== */}
      <SellBuyRepeatSection
        leftCard={{
          heading: "BUY",
          imageSrc: built3,
          imageAlt: "Sell the old you",
          caption: "SELL THE OLD YOU",
          wrapperClassName: "w-full rotate-[-8deg] lg:rotate-[-12deg] pl-8 lg:pl-0",
          imageClassName: "block aspect-[4/5] w-full object-cover h-[218px] sm:h-[250px] md:h-[282px] lg:h-[400px] object-center",
          captionClassName:
            "geist-mono-font mt-1.5 lg:mt-3 text-center 2xl:text-2xl text-sm lg:text-xl uppercase leading-none tracking-wide text-[var(--thrifti-dark)]",
        }}
        centerCard={{
          heading: "SELL",
          imageSrc: repeat1Polaroid,
          imageAlt: "Wear the new you",
          caption: "WEAR THE NEW YOU",
          wrapperClassName: "w-full -mt-10 sm:mt-2 lg:mt-10 relative lg:static pr-8 lg:pr-0",
          imageClassName: "block aspect-[4/5] w-full object-cover h-[238px] sm:h-[270px] md:h-[302px] lg:h-[400px] object-center",
          captionClassName:
            "geist-mono-font mt-1.5 lg:mt-3 text-center uppercase leading-none tracking-wide text-[var(--thrifti-dark)] 2xl:text-2xl text-sm lg:text-xl",
        }}
        rightCard={{
          heading: "REPEAT",
          imageSrc: repeatPolaroid,
          imageAlt: "Be new you with Thrifti",
          caption: "BE NEW YOU",
          wrapperClassName: "w-full rotate-[-10deg] lg:rotate-[14deg] -mt-7 lg:mt-0 pr-8 lg:pr-0",
          imageClassName: "block aspect-[4/5] w-full object-cover h-[218px] sm:h-[250px] md:h-[282px] lg:h-[400px] object-center",
          captionClassName:
            "geist-mono-font uppercase leading-none tracking-wide text-[var(--thrifti-dark)] 2xl:text-2xl text-sm lg:text-xl",
        }}
        stickerText="WITH THRIFTI"
      />

      {/* ===== SECTION 7: FEATURED PRODUCTS ===== */}
      {/* <section className="py-12 sm:py-16" style={{ backgroundColor: "white" }}>
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
      </section> */}

    </StorefrontLayout>
  );
}

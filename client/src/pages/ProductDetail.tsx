import { useState, useEffect } from "react";
import ShareSheet from "@/components/ShareSheet";
import { useParams, Link } from "wouter";
import { ShoppingBag, Heart, Share2, Shield, Star, ChevronRight } from "lucide-react";
import StorefrontLayout from "@/components/StorefrontLayout";
import AnimatedBanner from "@/components/AnimatedBanner";
import LaunchSplitSection from "@/components/LaunchSplitSection";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { useShopifyAuth } from "@/contexts/ShopifyAuthContext";
import { formatPrice } from "@shared/shopifyTypes";
import { toast } from "sonner";
import launchingImage from "@/assets/img/launching.png";
import SellBuyRepeatSection from "@/components/SellBuyRepeatSection";
import built3 from "@/assets/img/Built3.png";
import repeat1Polaroid from "@/assets/img/Repeat1.png";
import repeatPolaroid from "@/assets/img/Repeat.png";
// Launch date: 26 April 2026 midnight IST
const LAUNCH_DATE = new Date("2026-04-26T00:00:00+05:30");

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, LAUNCH_DATE.getTime() - Date.now()));
  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft(Math.max(0, LAUNCH_DATE.getTime() - Date.now())), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds, launched: timeLeft <= 0 };
}

const CDN = {
  fashionShow: "https://d2xsxph8kpxj0f.cloudfront.net/310519663413686037/RdJ3855myHy6XYmFtkiXgE/photo-fashion-final_3379776b.png",
  polaroidSell: "https://d2xsxph8kpxj0f.cloudfront.net/310519663413686037/RdJ3855myHy6XYmFtkiXgE/photo-sell-final_a950a217.png",
  polaroidBuy: "https://d2xsxph8kpxj0f.cloudfront.net/310519663413686037/RdJ3855myHy6XYmFtkiXgE/photo-buy-final_97b38991.png",
  polaroidRepeat: "https://d2xsxph8kpxj0f.cloudfront.net/310519663413686037/RdJ3855myHy6XYmFtkiXgE/photo-repeat-final_f6fb09a9.png",
};

function trackRecentlyViewed(handle: string) {
  try {
    const stored = JSON.parse(localStorage.getItem("thrifti_recently_viewed") ?? "[]") as string[];
    const updated = [handle, ...stored.filter((h) => h !== handle)].slice(0, 8);
    localStorage.setItem("thrifti_recently_viewed", JSON.stringify(updated));
  } catch { /* ignore */ }
}

// ── Mini Product Card ─────────────────────────────────────────────────────────
function MiniProductCard({ product, customerEmail }: {
  product: {
    id: string; handle: string; title: string; productType?: string; vendor?: string;
    featuredImage?: { url: string; altText?: string | null } | null;
    images: { nodes: { url: string; altText?: string | null }[] };
    variants: { nodes: { price: { amount: string; currencyCode: string } }[] };
  };
  customerEmail?: string;
}) {
  const { isAuthenticated } = useShopifyAuth();
  const [wishlisted, setWishlisted] = useState(false);
  const { data: wishlistItems } = trpc.wishlist.list.useQuery(
    { customerEmail: customerEmail ?? "" },
    { enabled: !!customerEmail && isAuthenticated }
  );
  const addToWishlist = trpc.wishlist.add.useMutation();
  const removeFromWishlist = trpc.wishlist.remove.useMutation();
  const utils = trpc.useUtils();
  useEffect(() => {
    if (wishlistItems) setWishlisted(wishlistItems.some((w) => w.productId === product.id));
  }, [wishlistItems, product.id]);
  const variant = product.variants.nodes[0];
  const image = product.featuredImage ?? product.images.nodes[0];
  const price = variant?.price ? `₹${Math.round(parseFloat(variant.price.amount)).toLocaleString("en-IN")}` : "";
  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuthenticated || !customerEmail) { window.location.href = "/login"; return; }
    if (wishlisted) {
      setWishlisted(false);
      await removeFromWishlist.mutateAsync({ customerEmail, productId: product.id });
    } else {
      setWishlisted(true);
      await addToWishlist.mutateAsync({ customerEmail, productId: product.id, productTitle: product.title, productHandle: product.handle, productImage: image?.url ?? null, productPrice: variant?.price?.amount ?? null });
    }
    utils.wishlist.list.invalidate({ customerEmail });
  };
  return (
    <Link href={`/products/${product.handle}`}>
      <div className="cursor-pointer group">
        <div className="relative overflow-hidden mb-2.5" style={{ aspectRatio: "3/4", backgroundColor: "#EDEAE4" }}>
          {image ? (
            <img src={image.url} alt={image.altText ?? product.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-8 h-8 text-gray-300" /></div>
          )}
          <button onClick={handleWishlist} className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.85)" }} aria-label="Wishlist">
            <Heart className="w-3.5 h-3.5" style={{ color: wishlisted ? "var(--thrifti-red)" : "#9CA3AF", fill: wishlisted ? "var(--thrifti-red)" : "none", strokeWidth: 1.5 }} />
          </button>
        </div>
        <p className="text-xs mb-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#9CA3AF", fontSize: "11px" }}>
          {[product.productType, product.vendor].filter(Boolean).join(", ") || "Thrifti"}
        </p>
        <p className="text-sm font-bold leading-snug mb-1 line-clamp-1" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>{product.title}</p>
        <p className="font-black" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)", fontSize: "14px" }}>{price}</p>
      </div>
    </Link>
  );
}

// ── New Drops Banner ──────────────────────────────────────────────────────────
function NewDropsBanner() {
  const { days, hours, minutes, seconds, launched } = useCountdown();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <section style={{ backgroundColor: "var(--thrifti-red)" }}>
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="px-8 sm:px-12 lg:px-16 py-14 sm:py-20">
          {launched ? (
            <span className="inline-block text-white font-black text-sm uppercase tracking-[0.3em] px-4 py-2 border border-white/40 mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>WE'RE LIVE!</span>
          ) : (
            <div className="mb-6">
              <p className="text-white/60 text-[10px] font-bold tracking-[0.35em] uppercase mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>LAUNCHING IN</p>
              <div className="flex items-end gap-3 sm:gap-5">
                {[{ value: pad(days), label: "DAYS" }, { value: pad(hours), label: "HRS" }, { value: pad(minutes), label: "MIN" }, { value: pad(seconds), label: "SEC" }].map(({ value, label }, i) => (
                  <div key={label} className="flex items-end gap-3 sm:gap-5">
                    {i > 0 && <span className="text-white/40 text-3xl sm:text-4xl font-black leading-none pb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>:</span>}
                    <div className="text-center">
                      <div className="text-4xl sm:text-5xl font-black text-white leading-none tabular-nums" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}>{value}</div>
                      <div className="text-white/50 text-[9px] font-bold tracking-[0.25em] mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="text-white/60 text-[10px] font-bold tracking-[0.35em] uppercase mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>LAUNCHING 26 APRIL 2026</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-5" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "-0.01em" }}>
            NEW DROPS,<br />JUST IN
          </h2>
          <p className="text-white/80 text-sm leading-relaxed mb-10 max-w-sm" style={{ fontFamily: "'Space Mono', monospace" }}>
            Curated pieces, limited time. Once they're gone, they're gone. Experience the shift in modern Indian fashion culture.
          </p>
          <Link href="/products">
            <button className="thrifti-btn-dark text-sm">CLAIM MINE</button>
          </Link>
        </div>
        <div className="hidden lg:block relative overflow-hidden" style={{ minHeight: "400px" }}>
          <img src={launchingImage} alt="New drops fashion show" className="w-full h-full object-cover" />
        </div>
      </div>
    </section>
  );
}

// ── Sell / Buy / Evolve Polaroids ─────────────────────────────────────────────
function PolaroidSection() {
  return (
    <section className="px-5 sm:px-8 lg:px-16 py-14 sm:py-20" style={{ backgroundColor: "var(--thrifti-cream)" }}>
      <div className="flex flex-col gap-10 lg:grid lg:grid-cols-3 lg:gap-10">
        <div className="polaroid relative" style={{ transform: "rotate(-2.5deg)" }}>
          <span className="absolute top-3 left-3 text-xs font-black tracking-widest uppercase z-10" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>SELL</span>
          <img src={CDN.polaroidSell} alt="Sell the old you" className="w-full block" style={{ aspectRatio: "4/5", objectFit: "cover" }} />
          <p className="text-center text-xs font-bold tracking-widest uppercase mt-3 pb-1" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>SELL THE OLD YOU</p>
        </div>
        <div className="polaroid relative" style={{ transform: "rotate(1.5deg)" }}>
          <span className="absolute top-3 left-3 text-xs font-black tracking-widest uppercase z-10" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>BUY</span>
          <img src={CDN.polaroidBuy} alt="Wear the new you" className="w-full block" style={{ aspectRatio: "4/5", objectFit: "cover" }} />
          <p className="text-center text-xs font-bold tracking-widest uppercase mt-3 pb-1" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>WEAR THE NEW YOU</p>
        </div>
        <div className="polaroid relative" style={{ transform: "rotate(-1deg)" }}>
          <span className="absolute top-3 left-3 text-xs font-black tracking-widest uppercase z-10" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>EVOLVE</span>
          <img src={CDN.polaroidRepeat} alt="Be new you with Thrifti" className="w-full block" style={{ aspectRatio: "4/5", objectFit: "cover" }} />
          <div className="flex items-end justify-between mt-3 pb-1">
            <p className="text-xs font-bold tracking-widest uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>BE NEW YOU</p>
            <div className="px-2 py-1 text-white text-[9px] font-black tracking-wider uppercase" style={{ backgroundColor: "var(--thrifti-dark)", fontFamily: "'Space Grotesk', sans-serif", transform: "rotate(-3deg)", flexShrink: 0 }}>WITH THRIFTI</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProductDetail() {
  const { handle } = useParams<{ handle: string }>();
  const { addToCart, isLoading: cartLoading } = useCart();
  const { customer, isAuthenticated } = useShopifyAuth();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [adding, setAdding] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const { data: product, isLoading, error } = trpc.products.byHandle.useQuery(
    { handle: handle! },
    { enabled: !!handle }
  );
  const { data: allProductsData } = trpc.products.list.useQuery({ first: 20 });
  const allProducts = allProductsData?.products ?? [];
  const { data: wishlistItems } = trpc.wishlist.list.useQuery(
    { customerEmail: customer?.email ?? "" },
    { enabled: !!customer?.email && isAuthenticated }
  );
  const addToWishlist = trpc.wishlist.add.useMutation();
  const removeFromWishlist = trpc.wishlist.remove.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    if (wishlistItems && product) setWishlisted(wishlistItems.some((w) => w.productId === product.id));
  }, [wishlistItems, product]);

  useEffect(() => {
    if (handle) trackRecentlyViewed(handle);
  }, [handle]);

  useEffect(() => {
    setIsDescriptionExpanded(false);
  }, [product?.id]);

  if (isLoading) {
    return (
      <StorefrontLayout showBanner={false}>
        <div style={{ backgroundColor: "var(--thrifti-cream)", minHeight: "100vh" }}>
          <div className="px-4 sm:px-6 lg:px-10 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
              <div>
                <div className="w-full bg-gray-200 animate-pulse mb-3" style={{ aspectRatio: "3/4" }} />
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map(i => <div key={i} className="w-16 h-16 bg-gray-200 animate-pulse flex-shrink-0" />)}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 animate-pulse w-3/4" />
                <div className="h-6 bg-gray-200 animate-pulse w-1/3" />
                <div className="h-4 bg-gray-200 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </StorefrontLayout>
    );
  }

  if (error || !product) {
    return (
      <StorefrontLayout showBanner={false}>
        <div style={{ backgroundColor: "var(--thrifti-cream)", minHeight: "100vh" }} className="flex items-center justify-center">
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <h1 className="text-2xl font-black mb-2" style={{ fontFamily: "'Playfair Display', serif", color: "var(--thrifti-dark)" }}>Product Not Found</h1>
            <p className="text-sm mb-6" style={{ fontFamily: "'Space Mono', monospace", color: "#6B7280" }}>This product may have been sold or removed.</p>
            <Link href="/products"><button className="thrifti-btn-dark text-sm">Browse All Products</button></Link>
          </div>
        </div>
      </StorefrontLayout>
    );
  }

  const images = product.images.nodes;
  const currentImage = images[selectedImageIndex] ?? product.featuredImage;
  const variants = product.variants.nodes;
  const matchingVariant = variants.find((v) =>
    v.selectedOptions.every((opt) => selectedOptions[opt.name] === opt.value)
  ) ?? variants[0];
  const activeVariantId = selectedVariantId ?? matchingVariant?.id ?? null;
  const activeVariant = variants.find((v) => v.id === activeVariantId) ?? matchingVariant;
  const price = activeVariant?.price ?? product.priceRange.minVariantPrice;
  const compareAtPrice = activeVariant?.compareAtPrice ?? null;
  const isAvailable = activeVariant?.availableForSale ?? product.availableForSale;

  const handleOptionSelect = (optionName: string, value: string) => {
    const newOptions = { ...selectedOptions, [optionName]: value };
    setSelectedOptions(newOptions);
    const newVariant = variants.find((v) => v.selectedOptions.every((opt) => newOptions[opt.name] === opt.value));
    if (newVariant) setSelectedVariantId(newVariant.id);
  };

  const handleAddToCart = async () => {
    if (!activeVariantId) return;
    setAdding(true);
    try {
      await addToCart(activeVariantId, 1);
      toast.success(`${product.title} added to bag!`);
    } catch {
      toast.error("Failed to add to bag. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !customer?.email) { window.location.href = "/login"; return; }
    const image = product.featuredImage ?? product.images.nodes[0];
    if (wishlisted) {
      setWishlisted(false);
      await removeFromWishlist.mutateAsync({ customerEmail: customer.email, productId: product.id });
      toast.success("Removed from wishlist");
    } else {
      setWishlisted(true);
      await addToWishlist.mutateAsync({ customerEmail: customer.email, productId: product.id, productTitle: product.title, productHandle: product.handle, productImage: image?.url ?? null, productPrice: price?.amount ?? null });
      toast.success("Added to wishlist!");
    }
    utils.wishlist.list.invalidate({ customerEmail: customer.email });
  };

  const [showShare, setShowShare] = useState(false);
  const handleShare = () => setShowShare(true);

  const productTypeParts = (product.productType ?? "")
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
  const baseBreadcrumb = productTypeParts.length > 0 ? productTypeParts : ["Women"];
  const breadcrumbItems = [...baseBreadcrumb, product.title].map((label, index, arr) => {
    const isLast = index === arr.length - 1;
    if (isLast) return { label, href: null as string | null };

    if (index === 0) {
      return { label, href: `/collections/${label.toLowerCase().replace(/\s+/g, "-")}` };
    }

    return { label, href: `/products` };
  });

  const moreBySeller = allProducts.filter((p) => p.vendor === product.vendor && p.id !== product.id).slice(0, 4);
  const similarItems = allProducts.filter((p) => p.productType === product.productType && p.id !== product.id).slice(0, 4);
  const lookingForMore = allProducts.filter((p) => p.productType?.split("/").pop() === product.productType?.split("/").pop() && p.id !== product.id && !similarItems.find(s => s.id === p.id)).slice(0, 4);

  const recentHandles = (() => {
    try { return (JSON.parse(localStorage.getItem("thrifti_recently_viewed") ?? "[]") as string[]).filter((h) => h !== handle).slice(0, 4); } catch { return []; }
  })();
  const recentlyViewed = allProducts.filter((p) => recentHandles.includes(p.handle)).slice(0, 4);

  const sizeTag = product.tags?.find((t) => /^\d+[wW]?$|^(XS|S|M|L|XL|XXL|XXXL|Free Size)$/i.test(t));
  const conditionTag = product.tags?.find((t) => /like new|good|fair|excellent|barely worn|new with tags/i.test(t));
  const locationTag = product.tags?.find((t) => /,\s*(UK|US|IN|EU)$/.test(t));
  const bustTag = product.tags?.find((t) => /^bust:/i.test(t));
  const lengthTag = product.tags?.find((t) => /^length:/i.test(t));
  const shoulderTag = product.tags?.find((t) => /^shoulder:/i.test(t));
  const musicTag = product.tags?.find((t) => /^music:/i.test(t));
  const productDescription = product.description?.trim();
  const COLLAPSED_DESCRIPTION_CHARS = 138;

  const conditionLabel = conditionTag ?? "Barely Worn";
  const isBarelyWorn = /barely worn/i.test(conditionLabel);

  return (
    <StorefrontLayout showBanner={false}>
      <div style={{ backgroundColor: "var(--thrifti-cream)", minHeight: "100vh" }}>

        {/* ── Breadcrumb ── */}
        <div className="px-4 sm:px-6 lg:px-10 pt-5 pb-3">
          <nav className="flex flex-wrap items-center gap-1 font-['Space_Grotesk',sans-serif]">
            {breadcrumbItems.map((item, i, arr) => (
              <span key={i} className="flex items-center gap-1">
                {item.href ? (
                  <Link
                    href={item.href}
                    className="geist-mono-font text-sm font-normal text-[#9CA3AF] transition-colors hover:text-[var(--thrifti-dark)]"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="geist-mono-font text-sm font-medium text-[var(--thrifti-dark)]">
                    {item.label}
                  </span>
                )}
                {i < arr.length - 1 &&
                  <span className="geist-mono-font text-sm text-[#9CA3AF]">/</span>
                }
              </span>
            ))}
          </nav>
        </div>

        {/* ── Main Product Section ── */}
        <div className="px-4 sm:px-6 lg:px-10 pb-10 mt-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-14">

            {/* ── Left: Image Gallery ── */}
            <div>
              {/* Main image */}
              <div className="relative mb-4 border border-[#d7d3cc] bg-[#F2F2F2] shadow-[0_2px_8px_#00000040] p-5">
                <div className="absolute -left-3 -top-6 z-20 rotate-[-8deg] border-[1.5px] border-[#EAEAD1] bg-white px-4 py-3 text-base font-black uppercase tracking-[0.05em] text-[var(--thrifti-red)] geist-mono-font shadow-md">
                  {isBarelyWorn ? "BARELY WORN" : conditionLabel.toUpperCase()}
                </div>
                <div className="relative aspect-[3/4] overflow-hidden bg-[#EDEAE4]">
                  {currentImage ? (
                    <img src={currentImage.url} alt={currentImage.altText ?? product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-16 h-16 text-gray-300" />
                    </div>
                  )}

                  {/* Image counter — top right */}
                  {images.length > 1 && (
                    <div className="absolute right-3 top-3 bg-white/90 px-2 py-1 text-xs font-bold text-[var(--thrifti-dark)] font-['Space_Grotesk',sans-serif]">
                      {selectedImageIndex + 1}/{images.length}
                    </div>
                  )}

                  {/* Sold out overlay */}
                  {!isAvailable && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="text-xl font-black uppercase tracking-widest text-white font-['Space_Grotesk',sans-serif]">Sold Out</span>
                    </div>
                  )}
                </div>

                {productDescription && (
                  <div className="mb-5">
                    {isDescriptionExpanded ? (
                      <>
                        <p className="text-sm leading-relaxed text-[#1f1f22] font-['Space_Mono',monospace]">
                          {productDescription}
                        </p>
                        <button
                          type="button"
                          onClick={() => setIsDescriptionExpanded(false)}
                          className="mt-2 text-xs font-semibold text-[var(--thrifti-dark)] underline underline-offset-2 font-['Space_Grotesk',sans-serif]"
                        >
                          Read less
                        </button>
                      </>
                    ) : (
                      <p className="text-sm leading-relaxed text-[#1f1f22] font-['Space_Mono',monospace]">
                        {(productDescription.length > COLLAPSED_DESCRIPTION_CHARS
                          ? `${productDescription.slice(0, COLLAPSED_DESCRIPTION_CHARS).trimEnd()}... `
                          : `${productDescription} `)}
                        {productDescription.length > COLLAPSED_DESCRIPTION_CHARS && (
                          <button
                            type="button"
                            onClick={() => setIsDescriptionExpanded(true)}
                            className="inline text-xs font-semibold text-[var(--thrifti-dark)] underline underline-offset-2 font-['Space_Grotesk',sans-serif]"
                          >
                            Read more
                          </button>
                        )}
                      </p>
                    )}
                  </div>
                )}

                <div className="absolute -bottom-3 right-3 z-20 rotate-[-8deg] border-[1.5px] border-[var(--thrifti-dark)] bg-white px-2 py-1 text-[10px] font-black uppercase leading-tight tracking-[0.05em] text-[var(--thrifti-dark)] font-['Space_Grotesk',sans-serif] shadow-sm">
                  REAL PHOTO<br />FROM SELLER
                </div>
              </div>

              {/* Horizontal thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.slice(0, 8).map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImageIndex(i)}
                      className={`h-[72px] w-[72px] shrink-0 overflow-hidden border-2 bg-[#EDEAE4] transition-all ${i === selectedImageIndex ? "border-[var(--thrifti-dark)]" : "border-transparent"}`}
                      aria-label={`View image ${i + 1}`}
                    >
                      <img src={img.url} alt={img.altText ?? `Image ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Right: Product Info ── */}
            <div className="flex flex-col">

              {/* Title */}
              <h1 className="mb-1 text-2xl font-black leading-tight text-[var(--thrifti-dark)] font-['Playfair_Display',serif] sm:text-3xl">
                {product.title}
              </h1>

              {/* Wishlist + Share */}
              <div className="flex items-center gap-3 mb-4">
                <button onClick={handleWishlist} className="p-1 -ml-1" aria-label="Wishlist">
                  <Heart className={`h-5 w-5 stroke-[1.5] ${wishlisted ? "text-[var(--thrifti-red)] fill-[var(--thrifti-red)]" : "text-[#9CA3AF] fill-none"}`} />
                </button>
                <button onClick={handleShare} className="p-1" aria-label="Share">
                  <Share2 className="h-5 w-5 stroke-[1.5] text-[#9CA3AF]" />
                </button>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-5">
                <p className="text-3xl font-black text-[var(--thrifti-dark)] font-['Space_Grotesk',sans-serif]">
                  {formatPrice(price.amount, price.currencyCode)}
                </p>
                {compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(price.amount) && (
                  <p className="text-base line-through text-[#9CA3AF] font-['Space_Grotesk',sans-serif]">
                    {formatPrice(compareAtPrice.amount, compareAtPrice.currencyCode)}
                  </p>
                )}
              </div>

              {/* Attributes: Size | Brand | Location */}
              <div className="grid grid-cols-3 gap-4 mb-5 pb-5 border-b border-gray-200">
                {[
                  { label: "Size", value: sizeTag ?? activeVariant?.selectedOptions?.find((o) => o.name === "Size")?.value ?? "M" },
                  { label: "Brand", value: product.vendor ?? "Vintage" },
                  { label: "Location", value: locationTag ?? "India" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="mb-0.5 text-xs text-[#9CA3AF] font-['Space_Grotesk',sans-serif]">{label}</p>
                    <p className="text-sm font-semibold text-[var(--thrifti-dark)] font-['Space_Grotesk',sans-serif]">{value}</p>
                  </div>
                ))}
              </div>



              {/* Variant options */}
              {product.options
                .filter((opt) => opt.values.length > 1 || opt.values[0] !== "Default Title")
                .map((option) => (
                  <div key={option.name} className="mb-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#6B7280] font-['Space_Grotesk',sans-serif]">
                      {option.name}: <span className="font-normal normal-case tracking-normal">{selectedOptions[option.name] ?? option.values[0]}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value) => {
                        const isSelected = (selectedOptions[option.name] ?? option.values[0]) === value;
                        const variantForValue = variants.find((v) => v.selectedOptions.some((o) => o.name === option.name && o.value === value));
                        const isOptionAvailable = variantForValue?.availableForSale ?? true;
                        return (
                          <button
                            key={value}
                            onClick={() => handleOptionSelect(option.name, value)}
                            disabled={!isOptionAvailable}
                            className={`border px-3 py-1.5 text-xs transition-all font-['Space_Grotesk',sans-serif] ${isSelected ? "border-[var(--thrifti-dark)] bg-[var(--thrifti-dark)] text-white" : "border-[#D1D5DB] bg-transparent"} ${!isSelected && isOptionAvailable ? "text-[var(--thrifti-dark)]" : ""} ${!isOptionAvailable ? "cursor-not-allowed text-[#9CA3AF] opacity-50 line-through" : "cursor-pointer"}`}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

              {/* CTA Buttons */}
              <div className="flex flex-col gap-2 mb-5">
                {/* BUY NOW — full width, RED */}
                <button
                  onClick={handleAddToCart}
                  disabled={!isAvailable || adding || cartLoading}
                  className="w-full bg-[var(--thrifti-red)] py-4 text-sm font-black uppercase tracking-widest text-white transition-opacity disabled:opacity-50 font-['Space_Grotesk',sans-serif]"
                >
                  {adding ? "Adding..." : !isAvailable ? "Sold Out" : "BUY NOW"}
                </button>
                {/* ADD TO BAG + MAKE AN OFFER */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={!isAvailable || adding || cartLoading}
                    className="bg-[var(--thrifti-dark)] py-3.5 text-xs font-black uppercase tracking-wider text-white transition-colors disabled:opacity-50 font-['Space_Grotesk',sans-serif]"
                  >
                    ADD TO BAG
                  </button>
                  <button
                    onClick={() => toast.info("Offers coming soon!")}
                    className="border border-[var(--thrifti-dark)] bg-transparent py-3.5 text-xs font-black uppercase tracking-wider text-[var(--thrifti-dark)] transition-colors font-['Space_Grotesk',sans-serif]"
                  >
                    MAKE AN OFFER
                  </button>
                </div>
              </div>

              {/* Buyer Protection */}
              <div className="flex items-center gap-2 py-3 border-t border-b border-gray-200 mb-5">
                <Shield className="h-4 w-4 shrink-0 text-[#6B7280]" />
                <p className="text-xs text-[#6B7280] font-['Space_Mono',monospace]">
                  All purchases are covered by Buyer Protection.
                </p>
              </div>

              {/* Measurements */}
              {(bustTag || lengthTag || shoulderTag) && (
                <div className="mb-5">
                  <p className="mb-2 text-xs font-black uppercase tracking-wider text-[var(--thrifti-dark)] font-['Space_Grotesk',sans-serif]">MEASUREMENTS</p>
                  <p className="text-sm text-[#6B7280] font-['Space_Mono',monospace]">
                    {bustTag && <span className="mr-4">Bust {bustTag.replace(/^bust:/i, "").trim()}</span>}
                    {lengthTag && <span className="mr-4">Length {lengthTag.replace(/^length:/i, "").trim()}</span>}
                    {shoulderTag && <span>Shoulders {shoulderTag.replace(/^shoulder:/i, "").trim()}</span>}
                  </p>
                </div>
              )}

              {/* THIS OUTFIT SOUNDS LIKE — Spotify section */}
              <div className="mb-5">
                <p className="mb-2 text-xs font-black uppercase tracking-wider text-[var(--thrifti-dark)] font-['Space_Grotesk',sans-serif]">THIS OUTFIT SOUNDS LIKE</p>
                <div className="flex items-center gap-3 bg-[#FFD6CC] px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1DB954]">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.623.623 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.623.623 0 01-.277-1.215c3.809-.87 7.076-.496 9.712 1.115a.623.623 0 01.207.857zm1.223-2.722a.78.78 0 01-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 01-.973-.519.781.781 0 01.519-.972c3.632-1.102 8.147-.568 11.234 1.328a.78.78 0 01.257 1.072zm.105-2.835c-3.223-1.914-8.54-2.09-11.618-1.156a.935.935 0 11-.543-1.79c3.533-1.073 9.404-.866 13.115 1.337a.935.935 0 11-.954 1.609z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-[var(--thrifti-dark)] font-['Space_Grotesk',sans-serif]">
                      {musicTag ? `"${musicTag.replace(/^music:/i, "").trim()}"` : '"SMELL LIKE TEEN SPIRIT"'}
                    </p>
                    <p className="text-xs text-[#6B7280] font-['Space_Mono',monospace]">
                      {musicTag ? "" : "NIRVANA"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Seller card */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--thrifti-dark)] text-sm font-black text-white">
                      {(product.vendor ?? "T").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--thrifti-dark)] font-['Space_Grotesk',sans-serif]">
                        {product.vendor ?? "thrifti_seller"}
                      </p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-[#6B7280] font-['Space_Mono',monospace]">4.9 (2,847)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handleWishlist} className="p-1.5" aria-label="Wishlist">
                      <Heart className={`h-4 w-4 stroke-[1.5] ${wishlisted ? "text-[var(--thrifti-red)] fill-[var(--thrifti-red)]" : "text-[#9CA3AF] fill-none"}`} />
                    </button>
                    <button onClick={handleShare} className="p-1.5" aria-label="Share">
                      <Share2 className="h-4 w-4 text-[#9CA3AF]" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => toast.info("Seller shop coming soon!")}
                  className="mt-4 border border-[var(--thrifti-dark)] px-3 py-1.5 text-xs font-bold text-[var(--thrifti-dark)] font-['Space_Grotesk',sans-serif]"
                >
                  View Shop
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* ── More from this seller ── */}
        {moreBySeller.length > 0 && (
          <div className="px-4 sm:px-6 lg:px-10 py-10 border-t border-gray-200">
            <h2 className="text-xl font-black mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>More from this seller</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {moreBySeller.map((p) => <MiniProductCard key={p.id} product={p} customerEmail={customer?.email} />)}
            </div>
          </div>
        )}

        {/* ── Similar Items You May Like ── */}
        {/* {similarItems.length > 0 && (
          <div className="px-4 sm:px-6 lg:px-10 py-10 border-t border-gray-200">
            <h2 className="text-xl font-black mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>Similar Items You May Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {similarItems.map((p) => <MiniProductCard key={p.id} product={p} customerEmail={customer?.email} />)}
            </div>
          </div>
        )} */}

        {/* ── Looking for more [category] ── */}
        {/* {lookingForMore.length > 0 && (
          <div className="px-4 sm:px-6 lg:px-10 py-10 border-t border-gray-200">
            <h2 className="text-xl font-black mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>
              Looking for more {product.productType?.split("/").pop() ?? "items"}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {lookingForMore.map((p) => <MiniProductCard key={p.id} product={p} customerEmail={customer?.email} />)}
            </div>
          </div>
        )} */}

        {/* ── Animated Ticker Banner ── */}
        {/* <AnimatedBanner /> */}

        {/* ── Recently Viewed ── */}
        {/* {recentlyViewed.length > 0 && (
          <div className="px-4 sm:px-6 lg:px-10 py-10">
            <h2 className="text-xl font-black mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>Recently Viewed</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {recentlyViewed.map((p) => <MiniProductCard key={p.id} product={p} customerEmail={customer?.email} />)}
            </div>
          </div>
        )} */}

        {/* ── New Drops Banner ── */}
        <div className="my-10">
          <LaunchSplitSection
            pretitle="LAUNCHING 26 APRIL 2026"
            title={
              <>
                NEW DROPS,
                <br />
                JUST IN
              </>
            }
            description="Curated pieces, limited time. Once they're gone,they're gone. Experience the shift in modern Indian fashion culture."
            ctaLabel="Claim Mine"
            ctaHref="/products"
            imageSrc={launchingImage}
            imageAlt="New drops fashion show"
          />
        </div>

        {/* ── Sell / Buy / Evolve Polaroids ── */}
        {/* <PolaroidSection /> */}
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
      </div>

      {/* Share Sheet */}
      <ShareSheet
        open={showShare}
        onClose={() => setShowShare(false)}
        url={typeof window !== "undefined" ? window.location.href : ""}
        title={product.title}
        image={product.featuredImage?.url ?? product.images.nodes[0]?.url}
      />
    </StorefrontLayout>
  );
}

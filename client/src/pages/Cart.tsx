import { Link } from "wouter";
import { Minus, Plus, Trash2, ShoppingBag, Shield, ArrowLeft, Heart } from "lucide-react";
import StorefrontLayout from "@/components/StorefrontLayout";
import AnimatedBanner from "@/components/AnimatedBanner";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { useShopifyAuth } from "@/contexts/ShopifyAuthContext";
import { formatPrice } from "@shared/shopifyTypes";
import RecentlyViewedGrid from "@/components/RecentlyViewedGrid";
import heartIcon from "@/assets/img/Heart.svg";
import razorpayLogo from "@/assets/img/Razorpay.png";
import shieldIcon from "@/assets/img/shield-icon.svg";
// ── Recently Viewed Card ──────────────────────────────────────────────────────
function RecentlyViewedCard({
  product,
}: {
  product: {
    id: string;
    handle: string;
    title: string;
    productType?: string;
    vendor?: string;
    featuredImage?: { url: string; altText?: string | null } | null;
    images: { nodes: { url: string; altText?: string | null }[] };
    variants: { nodes: { price: { amount: string; currencyCode: string } }[] };
  };
}) {
  const variant = product.variants.nodes[0];
  const image = product.featuredImage ?? product.images.nodes[0];
  const price = variant?.price
    ? `₹${Math.round(parseFloat(variant.price.amount)).toLocaleString("en-IN")}`
    : "";
  const attrLine = [product.productType, product.vendor].filter(Boolean).join(", ") || "Thrifti";
  return (
    <Link href={`/products/${product.handle}`}>
      <div className="group cursor-pointer bg-transparent p-3 hover:bg-[var(--thrifti-red)]">
        <div>
          <div className="relative mb-4 aspect-[3/4] overflow-hidden bg-[#EDEAE4]">
            {image ? (
              <img
                src={image.url}
                alt={image.altText ?? product.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="h-10 w-10 text-gray-300 transition-colors duration-300 group-hover:text-white" />
              </div>
            )}
          </div>
          <div className="flex items-start justify-between gap-1 mb-0.5">
            <p
              className="geist-mono-font flex-1 min-w-0 truncate text-xs lg:text-sm font-light leading-snug text-[#1F1F22] transition-colors duration-300 group-hover:text-white"
            >
              {attrLine}
            </p>
            <img src={heartIcon} alt="" aria-hidden="true" className="h-4 w-4 shrink-0 transition-[filter] duration-300 group-hover:brightness-0 group-hover:invert" />
          </div>
          <p className="geist-mono-font mb-1 line-clamp-1 text-sm font-medium leading-snug text-[#1F1F22] transition-colors duration-300 group-hover:text-white lg:text-lg">
            {product.title}
          </p>
          <p className="anek-devanagari-font mt-2 text-xl font-semibold text-[#1F1F22] transition-colors duration-300 group-hover:text-white lg:text-3xl">
            {price}
          </p>
        </div>
      </div>
    </Link>
  );
}

// ── Seller Avatar ─────────────────────────────────────────────────────────────
function SellerAvatar({ name }: { name: string }) {
  const initials = name
    .split(/[\s_]/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
  return (
    <div
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--thrifti-dark)] text-xs font-black text-white font-geist-mono-font mb-1"
    >
      {initials}
    </div>
  );
}

// ── Cart Page ─────────────────────────────────────────────────────────────────
export default function Cart() {
  const { cart, isLoading, updateQuantity, removeFromCart, goToCheckout } = useCart();
  const { customer } = useShopifyAuth();

  const lines = cart?.lines?.nodes ?? [];
  const subtotal = cart?.cost?.subtotalAmount;
  const total = cart?.cost?.totalAmount;
  const totalQty = cart?.totalQuantity ?? 0;

  // Group lines by vendor (seller)
  const sellerGroups: Record<string, typeof lines> = {};
  for (const line of lines) {
    const seller = line.merchandise.product.vendor || "tresbon_vintage";
    if (!sellerGroups[seller]) sellerGroups[seller] = [];
    sellerGroups[seller].push(line);
  }
  const sellerNames = Object.keys(sellerGroups);
  const hasMultipleSellers = sellerNames.length > 1;

  // Recently viewed
  const { data: allProductsData } = trpc.products.list.useQuery({ first: 20 });
  const allProducts = allProductsData?.products ?? [];
  const recentHandles = (() => {
    try {
      return JSON.parse(localStorage.getItem("thrifti_recently_viewed") ?? "[]") as string[];
    } catch {
      return [];
    }
  })();
  const cartHandles = new Set(lines.map((line) => line.merchandise.product.handle));
  const recentlyViewed = allProducts
    .filter((p) => recentHandles.includes(p.handle) && !cartHandles.has(p.handle))
    .slice(0, 4);

  // Financials
  const subtotalAmount = subtotal ? parseFloat(subtotal.amount) : 0;
  const shippingAmount = subtotalAmount > 0 ? 9.99 : 0;
  const taxEstimate = subtotalAmount * 0.08;
  const grandTotal = subtotalAmount + shippingAmount + taxEstimate;
  const freeShippingThreshold = 100;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotalAmount);

  return (
    <StorefrontLayout showBanner={false}>
      <div className="my-4">
        <div className="mb-10 lg:mb-18 container mx-auto">

          {/* ── Page Title ── */}
          <h1 className="text-3xl md:text-[40px] font-semibold anek-devanagari-font mb-1">
            Shopping Cart
          </h1>

          {lines.length === 0 ? (
            /* ── Empty State ── */
            <div className="text-center py-24">
              <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h2
                className="mb-2 text-2xl font-black text-[var(--thrifti-dark)] font-['Space_Grotesk',sans-serif]"
              >
                Your bag is empty
              </h2>
              <p className="mb-6 text-sm text-[#6B7280] font-['Space_Mono',monospace]">
                Add some items to get started
              </p>
              <Link href="/products">
                <button className="thrifti-btn-dark text-sm">Browse Products</button>
              </Link>
            </div>
          ) : (
            /* ── Two-column layout ── */
            <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">

              {/* ── LEFT: Cart Items ── */}
              <div>
                {/* Multiple sellers notice */}
                {hasMultipleSellers && (
                  <div className="mb-4 pb-2">
                    <p className="text-sm font-semibold geist-mono-font mb-1">
                      MULTIPLE SELLERS
                    </p>
                    <p className="text-xs text-[#6B6B6B] geist-mono-font">
                      Items from {sellerNames.length} different sellers. Shipping calculated separately.
                    </p>
                  </div>
                )}

                {/* Seller groups */}
                {sellerNames.map((seller, si) => {
                  const groupLines = sellerGroups[seller];
                  return (
                    <div key={seller} className={si > 0 ? "md:mt-6 mt-4 pt-1" : ""}>
                      {/* Seller header */}
                      <div className="flex items-center gap-2 border-b border-[#1F1F2233] pb-4">
                        <SellerAvatar name={seller} />
                        <span className="text-lg md:text-xl anek-devanagari-font pr-2 md:pr-6">
                          {seller}
                        </span>
                        <span className="ml-1 border-l border-[#35392D80] px-2 py-0.5 text-sm text-[#1F1F22] geist-mono-font">
                          {groupLines.length} Item{groupLines.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      {/* Line items */}
                      <div className="space-y-4">
                        {groupLines.map((line) => {
                          const image =
                            line.merchandise.product.featuredImage ??
                            line.merchandise.product.images?.nodes?.[0];
                          const itemPrice =
                            parseFloat(line.merchandise.price.amount) * line.quantity;
                          const attrParts = [
                            line.merchandise.product.productType,
                            line.merchandise.product.vendor,
                          ].filter(Boolean);
                          const attrLine =
                            attrParts.length > 0
                              ? attrParts.join(", ")
                              : line.merchandise.title !== "Default Title"
                                ? line.merchandise.title
                                : "";

                          return (
                            <div key={line.id} className="flex gap-4 p-4">
                              {/* Product image */}
                              <Link href={`/products/${line.merchandise.product.handle}`}>
                                <div
                                  className="aspect-[3/4] w-[84px] shrink-0 overflow-hidden bg-[#EDEAE4] sm:w-[96px]"
                                >
                                  {image ? (
                                    <img
                                      src={image.url}
                                      alt={image.altText ?? line.merchandise.product.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <ShoppingBag className="w-6 h-6 text-gray-300" />
                                    </div>
                                  )}
                                </div>
                              </Link>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-1.5">
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className="text-base md:text-lg geist-mono-font font-semibold"
                                    >
                                      {line.merchandise.product.title}
                                    </p>
                                    {attrLine && (
                                      <p
                                        className="mb-2 md:mb-3 text-xs md:text-sm font-light text-[#35392D] geist-mono-font"
                                      >
                                        {attrLine}
                                      </p>
                                    )}
                                    <p
                                      className="text-xl md:text-2xl font-semibold anek-devanagari-font"
                                    >
                                      {formatPrice(
                                        line.merchandise.price.amount,
                                        line.merchandise.price.currencyCode
                                      )}
                                    </p>
                                  </div>
                                  {/* Wishlist icon */}
                                  <button
                                    className="shrink-0 p-1 transition-colors"
                                    aria-label="Save to wishlist"
                                  >
                                    <img
                                      src={heartIcon}
                                      alt="wishlisted"
                                      aria-hidden="true"
                                      className="h-4.5 w-4.5 lg:h-5 lg:w-5"
                                    />
                                  </button>
                                </div>

                                {/* Quantity controls */}
                                <div className="mt-1.5 md:mt-2.5 flex items-center gap-2.5">
                                  <div className="flex items-center">
                                    <button
                                      onClick={() => updateQuantity(line.id, line.quantity - 1)}
                                      disabled={isLoading}
                                      className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center text-xs font-bold disabled:opacity-50 border border-[#D1D5DC]"
                                      aria-label="Decrease"
                                    >
                                      <Minus className="w-2 h-2" />
                                    </button>
                                    <span
                                      className="flex items-center justify-center font-medium anek-devanagari-font text-sm px-5"
                                    >
                                      {line.quantity}
                                    </span>
                                    <button
                                      onClick={() => updateQuantity(line.id, line.quantity + 1)}
                                      disabled={isLoading}
                                      className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center text-xs font-bold disabled:opacity-50 border border-[#D1D5DC]"
                                      aria-label="Increase"
                                    >
                                      <Plus className="w-2 h-2" />
                                    </button>
                                  </div>
                                  {/* Delete */}
                                  <button
                                    onClick={() => removeFromCart(line.id)}
                                    disabled={isLoading}
                                    className="p-1.5 hover:text-red-500 transition-colors disabled:opacity-50"
                                    aria-label="Delete item"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
                                  </button>
                                </div>

                                {/* Subtotal */}
                                <p
                                  className="mt-2 text-sm text-[#35392DCC] geist-mono-font"
                                >
                                  Subtotal: ₹{Math.round(itemPrice).toLocaleString("en-IN")}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Continue Shopping */}
                <div className="md:mt-3 mt-1">
                  <Link href="/products">
                    <button
                      className="flex items-center gap-2 text-sm text-[#1F1F22] transition-colors hover:opacity-70 geist-mono-font"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Continue Shopping
                    </button>
                  </Link>
                </div>
              </div>

              {/* ── RIGHT: Order Summary ── */}
              <div className="lg:sticky lg:top-6">
                <div className="border border-[#E5E7EB] bg-[#F9FAFB] p-4 sm:p-6 shadow-md">
                  {/* Header */}
                  <div className="mb-2 md:mb-4 flex items-center justify-between">
                    <h2 className="text-xl md:text-2xl font-semibold text-[#1F1F22] anek-devanagari-font">
                      Order Summary
                    </h2>
                    <span className="text-base md:text-lg font-semibold text-[#1F1F22] anek-devanagari-font">
                      {totalQty} Item{totalQty !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Line items */}
                  <div className="mb-4 space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-xs md:text-sm text-[#1F1F22] geist-mono-font">
                        Item's total
                      </span>
                      <span className="text-sm font-medium text-[#1F1F22] geist-mono-font">
                        {subtotal ? formatPrice(subtotal.amount, subtotal.currencyCode) : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-xs md:text-sm text-[#1F1F22] geist-mono-font">
                        Shipping
                      </span>
                      <span className="text-sm font-medium text-[#1F1F22] geist-mono-font">
                        ₹{shippingAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-xs md:text-sm text-[#1F1F22] geist-mono-font">
                        Tax (estimated)
                      </span>
                      <span className="text-sm font-medium text-[#1F1F22] geist-mono-font">
                        ₹{taxEstimate.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="md:mb-6 mb-2 border-t border-[#D1D5DC] pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-[#1F1F22] geist-mono-font">
                        Total
                      </span>
                      <span className="text-lg font-bold text-[#1F1F22] geist-mono-font">
                        ₹{grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Free shipping nudge */}
                  {amountToFreeShipping > 0 && (
                    <p className="mb-4 text-sm text-[#1F1F22] geist-mono-font">
                      Add ₹{amountToFreeShipping.toFixed(2)} more for free shipping!
                    </p>
                  )}

                  {/* CHECKOUT button — red */}
                  <button
                    onClick={goToCheckout}
                    disabled={isLoading || lines.length === 0}
                    className="w-full bg-[#F42824] text-white pt-4 pb-2 md:text-2xl text-lg font-semibold uppercase hover:bg-[#aa1a00] transition-colors disabled:opacity-60 rounded-[6px] anek-devanagari-font mt-2 "
                  >
                    {isLoading ? "Updating..." : "CHECKOUT"}
                  </button>
                </div>

                {/* Secure Escrow */}
                <div className="mt-6 bg-[#F7F5F2] p-4">
                  <div className="flex items-start gap-2.5">
                    <img src={shieldIcon} alt="Secure" aria-hidden="true" className="h-4.5 w-4.5 shrink-0 pt-1" />
                    <div>
                      <p className="text-sm font-semibold text-[#1F1F22] geist-mono-font">
                        SECURED PURCHASE & PAYMENTS
                      </p>
                      <p className="text-xs text-[#1F1F22] geist-mono-font leading-relaxed">
                        All purchase is protected under Buyer Protection, and payments are securely processed via{" "}
                        <img src={razorpayLogo} alt="Razorpay" className="inline-block h-3.5 w-auto align-baseline -mb-1" />
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Animated Ticker Banner ── */}
        <AnimatedBanner />

        {/* ── Recently Viewed ── */}
        <div>
          <RecentlyViewedGrid
            items={recentlyViewed}
            title="Recently Viewed"
            renderItem={(p) => <RecentlyViewedCard key={p.id} product={p} />}
          />

        </div>
      </div>
    </StorefrontLayout>
  );
}

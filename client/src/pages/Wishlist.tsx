import { useLocation } from "wouter";
import { ShoppingBag, Heart, Trash2 } from "lucide-react";
import StorefrontLayout from "@/components/StorefrontLayout";
import LaunchSplitSection from "@/components/LaunchSplitSection";
import SellBuyRepeatSection from "@/components/SellBuyRepeatSection";
import RecentlyViewedGrid from "@/components/RecentlyViewedGrid";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { useShopifyAuth } from "@/contexts/ShopifyAuthContext";
import { formatPrice } from "@shared/shopifyTypes";
import type { ShopifyProduct } from "@shared/shopifyTypes";
import { toast } from "sonner";
import { Link } from "wouter";

import built3 from "@/assets/img/Built3.png";
import repeatPolaroid from "@/assets/img/Repeat.png";
import repeat1Polaroid from "@/assets/img/Repeat1.png";
import launchingImage from "@/assets/img/launching.png";

// ── Skeleton card ──────────────────────────────────────────────────────────────
function WishlistCardSkeleton() {
  return (
    <div className="flex flex-col" aria-hidden="true">
      <div className="aspect-[3/4] w-full animate-pulse bg-gray-200" />
      <div className="mt-2 space-y-1.5 px-0.5">
        <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="mt-3 h-9 w-full animate-pulse rounded bg-gray-200" />
    </div>
  );
}

// ── Wishlist product card ──────────────────────────────────────────────────────
interface WishlistCardProps {
  productHandle: string;
  productId: string;
  productTitle: string | null;
  productImage: string | null;
  productPrice: string | null;
  customerGid: string;
  allProducts: ShopifyProduct[];
}

function WishlistCard({
  productHandle,
  productId,
  productTitle,
  productImage,
  productPrice,
  customerGid,
  allProducts,
}: WishlistCardProps) {
  const { addToCart, isLoading: cartLoading } = useCart();
  const utils = trpc.useUtils();
  const [, navigate] = useLocation();

  // Try to get live product data from allProducts (for variant ID and fresh price)
  const liveProduct = allProducts.find(
    (p) => p.handle === productHandle || p.id === productId
  );
  const firstVariant = liveProduct?.variants.nodes[0];
  const livePrice = liveProduct
    ? formatPrice(
        liveProduct.priceRange.minVariantPrice.amount,
        liveProduct.priceRange.minVariantPrice.currencyCode
      )
    : productPrice ?? "—";

  const vendor = liveProduct?.vendor ?? "";
  const productType = liveProduct?.productType ?? "";
  const sizeTag = liveProduct?.tags?.find((t) =>
    /^\d+[wW]?$|^(XS|S|M|L|XL|XXL|XXXL|Free Size)$/i.test(t)
  );
  const metaLine = [vendor, sizeTag, productType].filter(Boolean).join(", ");

  // Remove from wishlist
  const removeMutation = trpc.wishlist.remove.useMutation({
    onSuccess: () => {
      utils.wishlist.list.invalidate({ customerGid });
      toast.success("Removed from wishlist");
    },
    onError: () => toast.error("Failed to remove from wishlist"),
  });

  const handleAddToCart = async () => {
    if (!firstVariant) {
      toast.error("Product unavailable");
      return;
    }
    try {
      await addToCart(firstVariant.id, 1);
      toast.success(`${productTitle ?? "Item"} added to cart`);
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const handleShowSimilar = () => {
    if (productType) {
      navigate(`/products?type=${encodeURIComponent(productType)}`);
    } else {
      navigate("/products");
    }
  };

  const isAvailable = !!firstVariant?.availableForSale;

  return (
    <div className="group flex flex-col">
      {/* Image */}
      <Link href={`/products/${productHandle}`} className="block relative overflow-hidden">
        <div className="aspect-[3/4] w-full overflow-hidden bg-gray-100">
          {productImage ? (
            <img
              src={productImage}
              alt={productTitle ?? "Wishlist item"}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              width={300}
              height={400}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-200">
              <Heart className="h-10 w-10 text-gray-400" />
            </div>
          )}
        </div>
        {/* Remove button overlay */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            removeMutation.mutate({ customerGid, productId });
          }}
          className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow hover:bg-red-50 transition-colors"
          aria-label="Remove from wishlist"
          disabled={removeMutation.isPending}
        >
          <Trash2 className="h-3.5 w-3.5 text-gray-500 hover:text-red-500" />
        </button>
      </Link>

      {/* Meta */}
      <div className="mt-2 px-0.5">
        {metaLine && (
          <p className="font-['Space_Mono',monospace] text-[10px] text-gray-500 uppercase tracking-wide truncate">
            {metaLine}
          </p>
        )}
        <p className="font-['Space_Grotesk',sans-serif] text-xs font-semibold text-[var(--thrifti-dark)] truncate mt-0.5">
          {productTitle ?? productHandle}
        </p>
        <p className="font-['Space_Grotesk',sans-serif] text-sm font-black text-[var(--thrifti-dark)] mt-0.5">
          {livePrice}
        </p>
      </div>

      {/* CTA */}
      <div className="mt-3">
        {isAvailable ? (
          <button
            onClick={handleAddToCart}
            disabled={cartLoading}
            className="flex w-full items-center justify-center gap-2 bg-[var(--thrifti-dark)] px-3 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-black transition-colors disabled:opacity-60"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            ADD TO BAG
          </button>
        ) : (
          <button
            onClick={handleShowSimilar}
            className="flex w-full items-center justify-center gap-2 border border-[var(--thrifti-dark)] px-3 py-2.5 text-xs font-black uppercase tracking-wider text-[var(--thrifti-dark)] hover:bg-[var(--thrifti-dark)] hover:text-white transition-colors"
          >
            SHOW SIMILAR
          </button>
        )}
      </div>
    </div>
  );
}

// ── Recently Viewed mini card ──────────────────────────────────────────────────
function RecentlyViewedCard({ product }: { product: ShopifyProduct }) {
  const { customer, isAuthenticated } = useShopifyAuth();
  const utils = trpc.useUtils();
  const customerGid = customer?.id ?? "";
  const { data: wishlistItems } = trpc.wishlist.list.useQuery(
    { customerGid },
    { enabled: !!customerGid && isAuthenticated }
  );
  const isWishlisted = wishlistItems?.some((w) => w.productId === product.id) ?? false;
  const addWishlist = trpc.wishlist.add.useMutation({
    onSuccess: () => { utils.wishlist.list.invalidate({ customerGid }); toast.success("Added to wishlist"); },
    onError: () => toast.error("Failed to add to wishlist"),
  });
  const removeWishlist = trpc.wishlist.remove.useMutation({
    onSuccess: () => { utils.wishlist.list.invalidate({ customerGid }); toast.success("Removed from wishlist"); },
    onError: () => toast.error("Failed to remove from wishlist"),
  });

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !customerGid) {
      toast.info("Sign in to save items", {
        action: { label: "Sign In", onClick: () => (window.location.href = "/login") },
      });
      return;
    }
    if (isWishlisted) {
      removeWishlist.mutate({ customerGid, productId: product.id });
    } else {
      addWishlist.mutate({
        customerGid,
        productId: product.id,
        productHandle: product.handle,
        productTitle: product.title,
        productImage: product.featuredImage?.url,
        productPrice: product.priceRange.minVariantPrice.amount,
      });
    }
  };

  const vendor = product.vendor ?? "";
  const sizeTag = product.tags?.find((t) =>
    /^\d+[wW]?$|^(XS|S|M|L|XL|XXL|XXXL|Free Size)$/i.test(t)
  );
  const metaLine = [vendor, sizeTag, product.productType].filter(Boolean).join(", ");
  const price = formatPrice(
    product.priceRange.minVariantPrice.amount,
    product.priceRange.minVariantPrice.currencyCode
  );

  return (
    <Link href={`/products/${product.handle}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        {product.featuredImage ? (
          <img
            src={product.featuredImage.url}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            width={300}
            height={400}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-200" />
        )}
        <button
          onClick={handleWishlist}
          className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`h-3.5 w-3.5 stroke-[1.5] ${isWishlisted ? "fill-[var(--thrifti-red)] text-[var(--thrifti-red)]" : "fill-none text-gray-500"}`}
          />
        </button>
      </div>
      <div className="mt-1.5 px-0.5">
        {metaLine && (
          <p className="font-['Space_Mono',monospace] text-[10px] text-gray-500 uppercase tracking-wide truncate">
            {metaLine}
          </p>
        )}
        <p className="font-['Space_Grotesk',sans-serif] text-xs font-semibold text-[var(--thrifti-dark)] truncate mt-0.5">
          {product.title}
        </p>
        <p className="font-['Space_Grotesk',sans-serif] text-sm font-black text-[var(--thrifti-dark)] mt-0.5">
          {price}
        </p>
      </div>
    </Link>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────
function EmptyWishlist() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Heart className="mb-4 h-16 w-16 text-gray-300" strokeWidth={1} />
      <h2 className="font-['Space_Grotesk',sans-serif] text-2xl font-black text-[var(--thrifti-dark)] mb-2">
        Your wishlist is empty
      </h2>
      <p className="font-['Space_Mono',monospace] text-sm text-gray-500 mb-8 max-w-xs">
        Save items you love by tapping the heart icon on any product.
      </p>
      <Link href="/products">
        <button className="bg-[var(--thrifti-dark)] px-8 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-black transition-colors">
          BROWSE PRODUCTS
        </button>
      </Link>
    </div>
  );
}

// ── Not logged in state ────────────────────────────────────────────────────────
function NotLoggedIn() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Heart className="mb-4 h-16 w-16 text-gray-300" strokeWidth={1} />
      <h2 className="font-['Space_Grotesk',sans-serif] text-2xl font-black text-[var(--thrifti-dark)] mb-2">
        Sign in to view your wishlist
      </h2>
      <p className="font-['Space_Mono',monospace] text-sm text-gray-500 mb-8 max-w-xs">
        Your saved items are tied to your account. Sign in to see them here.
      </p>
      <Link href="/login">
        <button className="bg-[var(--thrifti-red)] px-8 py-3 text-sm font-black uppercase tracking-wider text-white hover:opacity-90 transition-opacity">
          SIGN IN
        </button>
      </Link>
    </div>
  );
}

// ── Main Wishlist Page ─────────────────────────────────────────────────────────
export default function Wishlist() {
  const { customer, isAuthenticated } = useShopifyAuth();

  // Fetch wishlist items from DB
  const customerGid = customer?.id ?? "";
  const { data: wishlistItems, isLoading: wishlistLoading } = trpc.wishlist.list.useQuery(
    { customerGid },
    { enabled: !!customerGid && isAuthenticated }
  );

  // Fetch all products to cross-reference live data (availability, price, variant)
  const { data: allProductsData, isLoading: productsLoading } = trpc.products.list.useQuery(
    { first: 250 },
    { staleTime: 5 * 60 * 1000 }
  );
  const allProducts: ShopifyProduct[] = allProductsData?.products ?? [];

  // Recently viewed from localStorage
  const recentHandles = (() => {
    try {
      return (JSON.parse(localStorage.getItem("thrifti_recently_viewed") ?? "[]") as string[]).slice(0, 4);
    } catch {
      return [];
    }
  })();
  const recentlyViewed = allProducts.filter((p) => recentHandles.includes(p.handle)).slice(0, 4);

  const isLoading = wishlistLoading || productsLoading;
  const itemCount = wishlistItems?.length ?? 0;

  return (
    <StorefrontLayout showBanner={false}>
      <div style={{ backgroundColor: "var(--thrifti-cream)", minHeight: "100vh" }}>

        {/* ── Header ── */}
        <div className="container mx-auto px-4 pt-8 pb-4 sm:px-6 lg:px-10">
          <h1 className="font-['Space_Grotesk',sans-serif] text-3xl font-black text-[var(--thrifti-dark)] lg:text-4xl">
            Wishlist
          </h1>
          {isAuthenticated && !isLoading && itemCount > 0 && (
            <p className="font-['Space_Mono',monospace] mt-1 text-xs text-gray-500">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          )}
        </div>

        {/* ── Content ── */}
        <div className="container mx-auto px-4 pb-10 sm:px-6 lg:px-10">
          {/* Not logged in */}
          {!isAuthenticated && <NotLoggedIn />}

          {/* Loading skeleton */}
          {isAuthenticated && isLoading && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <WishlistCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Empty wishlist */}
          {isAuthenticated && !isLoading && itemCount === 0 && <EmptyWishlist />}

          {/* Wishlist grid */}
          {isAuthenticated && !isLoading && itemCount > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
              {wishlistItems!.map((item) => (
                <WishlistCard
                  key={item.productId}
                  productHandle={item.productHandle}
                  productId={item.productId}
                  productTitle={item.productTitle ?? null}
                  productImage={item.productImage ?? null}
                  productPrice={item.productPrice ?? null}
                  customerGid={customerGid}
                  allProducts={allProducts}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Recently Viewed ── */}
        {recentlyViewed.length > 0 && (
          <RecentlyViewedGrid
            items={recentlyViewed}
            title="Recently Viewed"
            renderItem={(product) => (
              <RecentlyViewedCard key={product.id} product={product} />
            )}
          />
        )}

        {/* ── New Drops banner ── */}
        <LaunchSplitSection
          pretitle="LAUNCHING 26 APRIL 2026"
          title={<>NEW DROPS,<br />JUST IN</>}
          description="Curated pieces, limited time. Once they're gone, they're gone. Experience the shift in modern Indian fashion culture."
          ctaLabel="GRAB THE DEAL"
          ctaHref="/products"
          imageSrc={launchingImage}
          imageAlt="Fashion show"
        />

        {/* ── Sell / Buy / Repeat polaroids ── */}
        <SellBuyRepeatSection
          leftCard={{
            heading: "BUY",
            imageSrc: built3,
            imageAlt: "Wear the new you",
            caption: "WEAR THE NEW YOU",
            wrapperClassName: "w-full rotate-[-8deg] lg:rotate-[-12deg] pl-8 lg:pl-0",
            imageClassName: "block aspect-[4/5] w-full object-cover h-[218px] sm:h-[250px] md:h-[282px] lg:h-[400px] object-center",
            captionClassName: "geist-mono-font mt-1.5 lg:mt-3 text-center 2xl:text-2xl text-sm lg:text-xl uppercase leading-none tracking-wide text-[var(--thrifti-dark)]",
          }}
          centerCard={{
            heading: "SELL",
            imageSrc: repeat1Polaroid,
            imageAlt: "Sell the old you",
            caption: "SELL THE OLD YOU",
            wrapperClassName: "w-full -mt-10 sm:mt-2 lg:mt-10 relative lg:static pr-8 lg:pr-0",
            imageClassName: "block aspect-[4/5] w-full object-cover h-[238px] sm:h-[270px] md:h-[302px] lg:h-[400px] object-center",
            captionClassName: "geist-mono-font mt-1.5 lg:mt-3 text-center uppercase leading-none tracking-wide text-[var(--thrifti-dark)] 2xl:text-2xl text-sm lg:text-xl",
          }}
          rightCard={{
            heading: "REPEAT",
            imageSrc: repeatPolaroid,
            imageAlt: "Be new you with Thrifti",
            caption: "BECOME THE NEXT YOU",
            wrapperClassName: "w-full rotate-[-10deg] lg:rotate-[14deg] -mt-7 lg:mt-0 pr-8 lg:pr-0",
            imageClassName: "block aspect-[4/5] w-full object-cover h-[218px] sm:h-[250px] md:h-[282px] lg:h-[400px] object-center",
            captionClassName: "geist-mono-font uppercase leading-none tracking-wide text-[var(--thrifti-dark)] 2xl:text-2xl text-sm lg:text-xl",
          }}
          stickerText="WITH THRIFTI"
        />

      </div>
    </StorefrontLayout>
  );
}
